#!/bin/bash
# seed-niches.sh — apply niche seed SQL to production (or local) DB.
#
# Philosophy:
#   - Git holds bootstrap content for new niches (the source for ADDING).
#   - Prod DB holds runtime edits to existing niches (the source for EVOLVED copy).
#   - This script defaults to adding new niches WITHOUT overwriting prod edits.
#
# Modes:
#   ./seed-niches.sh                      # add-only (default, safe)
#   ./seed-niches.sh add                  # same as above
#   ./seed-niches.sh update               # add new + overwrite ALL existing
#   ./seed-niches.sh update hvac dental   # overwrite only specific slugs
#   ./seed-niches.sh reset                # wipe all + reseed (destructive, asks)
#   ./seed-niches.sh list                 # show target DB niches
#   ./seed-niches.sh diff                 # show slugs in seed vs target DB
#   ./seed-niches.sh pull                 # dump target niches to timestamped file
#
set -euo pipefail

REMOTE="root@109.123.227.158"
SEED_FILE="$(cd "$(dirname "$0")" && pwd)/niches_seed.sql"
PROD_DB_ENV="/var/www/offerfu-shared/.env"

SEED_TARGET="${SEED_TARGET:-prod}"

# ---------------------------------------------------------------------------
# Resolve DB connection params
# ---------------------------------------------------------------------------

# Parses postgresql://user:pass@host:port/db into vars
parse_db_url() {
  local url="$1"
  DB_USER=$(echo "$url" | sed -E 's|postgresql://([^:]+):.*|\1|')
  DB_PASS=$(echo "$url" | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')
  DB_HOST=$(echo "$url" | sed -E 's|postgresql://[^@]+@([^:]+):.*|\1|')
  DB_PORT=$(echo "$url" | sed -E 's|postgresql://[^@]+@[^:]+:([0-9]+)/.*|\1|')
  DB_NAME=$(echo "$url" | sed -E 's|postgresql://[^@]+@[^/]+/(.*)|\1|')
}

if [ "$SEED_TARGET" = "local" ]; then
  if [ -z "${DATABASE_URL:-}" ]; then
    # Try loading from local .env
    if [ -f "$(dirname "$0")/.env" ]; then
      export $(grep -v '^#' "$(dirname "$0")/.env" | xargs)
    fi
  fi
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "==> SEED_TARGET=local but DATABASE_URL not set and no .env found."
    exit 1
  fi
  parse_db_url "$DATABASE_URL"
  PSQL_LOCAL=(PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME")
else
  # Read DATABASE_URL from prod .env via SSH
  PROD_URL=$(ssh "$REMOTE" "grep '^DATABASE_URL' $PROD_DB_ENV" | sed -E 's/^DATABASE_URL="([^"]*)"/\1/')
  if [ -z "$PROD_URL" ]; then
    echo "==> Could not read DATABASE_URL from $REMOTE:$PROD_DB_ENV"
    exit 1
  fi
  parse_db_url "$PROD_URL"
fi

# ---------------------------------------------------------------------------
# Helpers — all psql invocations go through these
# ---------------------------------------------------------------------------

psql_exec() {
  # Runs a -c command on the target DB
  local sql="$1"
  shift
  if [ "$SEED_TARGET" = "local" ]; then
    env PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "$sql" "$@"
  else
    ssh "$REMOTE" "PGPASSWORD='$DB_PASS' psql -U '$DB_USER' -h '$DB_HOST' -p '$DB_PORT' -d '$DB_NAME' -c \"$sql\" $*"
  fi
}

# Transform seed SQL: replace ON CONFLICT DO UPDATE SET ... with DO NOTHING
transform_seed_addonly() {
  python3 -c "
import re, sys
with open('$SEED_FILE') as f:
    c = f.read()
c = re.sub(r'ON CONFLICT \(\"slug\"\) DO UPDATE SET.*?CURRENT_TIMESTAMP;', 'ON CONFLICT (\"slug\") DO NOTHING;', c, flags=re.DOTALL)
sys.stdout.write(c)
"
}

psql_pipe() {
  # Pipes stdin to psql on the target DB
  if [ "$SEED_TARGET" = "local" ]; then
    env PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME"
  else
    ssh "$REMOTE" "PGPASSWORD='$DB_PASS' psql -U '$DB_USER' -h '$DB_HOST' -p '$DB_PORT' -d '$DB_NAME'"
  fi
}

# ---------------------------------------------------------------------------
# Modes
# ---------------------------------------------------------------------------

cmd_list() {
  echo "==> Niches in $SEED_TARGET DB:"
  psql_exec "SELECT slug, country, active, LEFT(headline, 60) AS headline, updated_at FROM niches ORDER BY country, slug;"
}

cmd_diff() {
  echo "==> Comparing seed file vs $SEED_TARGET DB..."
  local seed_slugs prod_slugs
  seed_slugs=$(grep -oE "^\s*'[^']+',\s*'US'|^\s*'[^']+',\s*'AU'" "$SEED_FILE" | sed -E "s/^\s+'([^']+)'.*/\1/" | sort -u)
  prod_slugs=$(psql_exec "SELECT slug FROM niches ORDER BY slug;" -t | tr -d ' ')

  local in_seed_not_prod in_prod_not_seed
  in_seed_not_prod=$(comm -23 <(echo "$seed_slugs") <(echo "$prod_slugs"))
  in_prod_not_seed=$(comm -13 <(echo "$seed_slugs") <(echo "$prod_slugs"))

  if [ -n "$in_seed_not_prod" ]; then
    echo "==> Would be ADDED (in seed, not in DB):"
    echo "$in_seed_not_prod" | sed 's/^/  /'
  else
    echo "==> No new slugs to add (all seed slugs already in DB)."
  fi

  if [ -n "$in_prod_not_seed" ]; then
    echo "==> Prod-only slugs (in DB, not in seed — preserved on all modes):"
    echo "$in_prod_not_seed" | sed 's/^/  /'
  fi
}

cmd_pull() {
  local outfile
  outfile="niches_${SEED_TARGET}_dump_$(date +%Y%m%d-%H%M%S).sql"
  echo "==> Dumping $SEED_TARGET niches to $outfile..."
  if [ "$SEED_TARGET" = "local" ]; then
    env PGPASSWORD="$DB_PASS" pg_dump -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" --data-only --table=niches > "$outfile"
  else
    ssh "$REMOTE" "PGPASSWORD='$DB_PASS' pg_dump -U '$DB_USER' -h '$DB_HOST' -p '$DB_PORT' -d '$DB_NAME' --data-only --table=niches" > "$outfile"
  fi
  echo "==> Saved to $outfile"
}

cmd_add() {
  echo "==> ADD mode: inserting new niches only. Existing rows untouched."
  echo "==> Target: $SEED_TARGET"

  cmd_diff

  echo ""
  echo "==> Applying seed (ON CONFLICT DO NOTHING)..."
  transform_seed_addonly \
    | psql_pipe 2>&1 | grep -E "INSERT|ERROR" || echo "(no new rows inserted)"

  echo ""
  cmd_list
}

cmd_update() {
  local explicit_slugs=("$@")

  if [ ${#explicit_slugs[@]} -gt 0 ]; then
    echo "==> UPDATE mode: adding new niches + overwriting: ${explicit_slugs[*]}"
  else
    echo "==> UPDATE mode (no slugs specified): add new + OVERWRITE ALL existing from seed."
    echo "==> Prod-side edits to seeded niches will be replaced with seed content."
    read -p "==> Continue? [y/N] " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
      echo "==> Aborted."
      exit 0
    fi
  fi

  if [ ${#explicit_slugs[@]} -gt 0 ]; then
    # Delete specific slugs, then re-insert via add mode
    local slug_list
    slug_list=$(printf "'%s'," "${explicit_slugs[@]}")
    slug_list="${slug_list%,}"
    echo "==> Deleting existing rows for: $slug_list"
    psql_exec "DELETE FROM niches WHERE slug IN ($slug_list);"
    echo "==> Applying seed (deleted slugs will be re-inserted, others untouched)..."
    transform_seed_addonly \
      | psql_pipe 2>&1 | grep -E "INSERT|ERROR" || echo "(no rows inserted)"
  else
    # Full upsert — use original seed with DO UPDATE
    echo "==> Applying seed with full upsert..."
    psql_pipe < "$SEED_FILE" 2>&1 | grep -E "INSERT|ERROR" || echo "(no change)"
  fi

  echo ""
  cmd_list
}

cmd_reset() {
  echo "==> RESET mode: DESTRUCTIVE. Wipes ALL niches and reinserts from seed."
  echo "==> Any prod-side edits will be LOST."
  read -p "==> Type 'RESET' to confirm: " confirm
  if [ "$confirm" != "RESET" ]; then
    echo "==> Aborted."
    exit 0
  fi
  echo "==> Wiping niches table..."
  psql_exec "DELETE FROM niches;"
  echo "==> Applying seed..."
  psql_pipe < "$SEED_FILE" 2>&1 | grep -E "INSERT|ERROR" || echo "(no rows)"
  echo ""
  cmd_list
}

# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------

cmd="${1:-add}"
case "$cmd" in
  add)    shift || true; cmd_add "$@" ;;
  update) shift; cmd_update "$@" ;;
  reset)  cmd_reset ;;
  list)   cmd_list ;;
  diff)   cmd_diff ;;
  pull)   cmd_pull ;;
  *)
    echo "Usage: $0 {add|update [slug1 slug2 ...]|reset|list|diff|pull}"
    echo ""
    echo "Modes:"
    echo "  add     Insert new niches only; existing rows untouched (default, safe)"
    echo "  update  Add new + overwrite listed slugs (or all if no slugs given)"
    echo "  reset   Wipe all + reseed (destructive, prompts for confirmation)"
    echo "  list    Show niches currently in the target DB"
    echo "  diff    Show slugs in seed but not in DB, and vice versa"
    echo "  pull    Dump target niches to a timestamped SQL file"
    echo ""
    echo "Env:"
    echo "  SEED_TARGET=local   hit local dev DB instead of prod"
    exit 1
    ;;
esac