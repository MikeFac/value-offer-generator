#!/bin/bash
# Atomic deploy with symlink swap + automatic rollback + manual rollback.
#
# Layout:
#   /var/www/offerfu-shared/.env                    persistent env
#   /var/www/offerfu-releases/<timestamp>/          each release, self-contained
#   /var/www/offerfu-releases/current -> <timestamp> symlink to active
#   /var/www/offerfu -> offerfu-releases/current    (systemd WorkingDirectory)
#
# Usage:
#   ./deploy.sh              # deploy current local source
#   ./deploy.sh rollback     # flip to previous release
#   ./deploy.sh list         # show releases + which is current
#
set -euo pipefail

REMOTE="root@109.123.227.158"
SHARED_DIR="/var/www/offerfu-shared"
RELEASES_DIR="/var/www/offerfu-releases"
CURRENT_SYMLINK="$RELEASES_DIR/current"
APP_SYMLINK="/var/www/offerfu"
SERVICE="offerfu"
HEALTH_URL="http://localhost:3100"
KEEP_RELEASES=5
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

cmd="${1:-deploy}"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

ssh_run() {
  ssh "$REMOTE" "$1"
}

get_current_release() {
  ssh_run "readlink -f $CURRENT_SYMLINK 2>/dev/null || true"
}

healthcheck() {
  local status
  status=$(ssh_run "curl -s -o /dev/null -w '%{http_code}' --max-time 5 $HEALTH_URL 2>/dev/null || echo 000")
  echo "$status"
}

restart_and_check() {
  local release_dir="$1"
  local previous_dir="$2"

  echo "==> Restarting $SERVICE..."
  ssh_run "systemctl restart $SERVICE"
  echo "==> Waiting for app to start..."
  sleep 5

  local status
  status=$(healthcheck)

  if [ "$status" = "200" ]; then
    echo "==> Healthcheck passed (HTTP 200). Deploy complete."
    echo "==> Active release: $(ssh_run "readlink $CURRENT_SYMLINK")"
  else
    echo "==> WARNING: Healthcheck returned HTTP $status. Rolling back..."
    ssh_run "ln -sfn '$previous_dir' $CURRENT_SYMLINK"
    ssh_run "systemctl restart $SERVICE"
    sleep 3
    local rollback_status
    rollback_status=$(healthcheck)
    if [ "$rollback_status" = "200" ]; then
      echo "==> Rollback successful. Site restored to previous release."
    else
      echo "==> CRITICAL: Rollback also failed (HTTP $rollback_status). Check: ssh $REMOTE 'systemctl status $SERVICE'"
      exit 1
    fi
    echo "==> Deploy failed and rolled back. Investigate then retry."
    exit 1
  fi
}

prune_old_releases() {
  echo "==> Pruning old releases (keeping last $KEEP_RELEASES)..."
  ssh_run "cd $RELEASES_DIR && ls -1d */ 2>/dev/null | sort -r | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf"
}

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

cmd_list() {
  echo "==> Releases on $REMOTE:"
  ssh_run "cd $RELEASES_DIR 2>/dev/null && { echo 'Current ->'; readlink current; echo; echo 'All releases (newest first):'; ls -1dt */ | head -${KEEP_RELEASES}; } || echo 'No releases dir found'"
}

cmd_rollback() {
  local current_dir previous_dir
  current_dir=$(get_current_release)
  if [ -z "$current_dir" ]; then
    echo "==> No current release to roll back from."
    exit 1
  fi

  # Find the previous release (second-newest dir, excluding current)
  previous_dir=$(ssh_run "cd $RELEASES_DIR && ls -1dt */ 2>/dev/null | sed 's|/\$||' | grep -v -x \"\$(basename $current_dir)\" | head -1")
  if [ -z "$previous_dir" ]; then
    echo "==> No previous release available to roll back to."
    exit 1
  fi

  echo "==> Rolling back: $current_dir -> $RELEASES_DIR/$previous_dir"
  ssh_run "ln -sfn '$RELEASES_DIR/$previous_dir' $CURRENT_SYMLINK"
  ssh_run "systemctl restart $SERVICE"
  sleep 4
  local status
  status=$(healthcheck)
  if [ "$status" = "200" ]; then
    echo "==> Rollback complete. Now serving: $previous_dir"
  else
    echo "==> Rollback healthcheck failed (HTTP $status). Check: ssh $REMOTE 'systemctl status $SERVICE'"
    exit 1
  fi
}

cmd_deploy() {
  local timestamp
  timestamp=$(date +%Y%m%d-%H%M%S)
  local release_dir="$RELEASES_DIR/$timestamp"

  echo "==> Deploying release: $timestamp"
  echo "==> Target: $REMOTE:$release_dir"

  # Ensure shared + releases dirs exist (one-time bootstrap)
  ssh_run "mkdir -p $SHARED_DIR $RELEASES_DIR && chown offerfu:offerfu $SHARED_DIR $RELEASES_DIR"

  # Bootstrap: if .env exists in current app but not in shared, move it
  ssh_run "if [ -f $APP_SYMLINK/.env ] && [ ! -f $SHARED_DIR/.env ]; then cp $APP_SYMLINK/.env $SHARED_DIR/.env && chown offerfu:offerfu $SHARED_DIR/.env && chmod 600 $SHARED_DIR/.env && echo '==> Copied .env to shared dir'; fi"

  # Create release dir
  ssh_run "mkdir -p $release_dir"

  # Rsync source into release dir (exclude build artifacts, env, git, deploy script)
  echo "==> Syncing files..."
  rsync -avz \
    --exclude='.next' \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='.env.bak' \
    --exclude='deploy.sh' \
    --exclude='tsconfig.tsbuildinfo' \
    "$LOCAL_DIR/" "$REMOTE:$release_dir/"

  # Symlink shared .env into release
  ssh_run "ln -sf $SHARED_DIR/.env $release_dir/.env"

  # Install deps (need devDeps for next build + prisma generate)
  echo "==> Installing dependencies..."
  ssh_run "cd $release_dir && npm install 2>&1 | tail -3"

  # Run migrations (from release dir; prisma uses .env via symlink)
  echo "==> Running database migrations..."
  ssh_run "cd $release_dir && npx prisma migrate deploy 2>&1 | tail -5"

  # Build
  echo "==> Building (site remains live from current release)..."
  ssh_run "cd $release_dir && npm run build 2>&1 | tail -10"

  # Verify build output exists
  if ! ssh_run "test -d $release_dir/.next/standalone || test -d $release_dir/.next"; then
    echo "==> ERROR: Build output .next not found. Aborting before swap."
    ssh_run "rm -rf $release_dir"
    exit 1
  fi

  # Fix ownership so the offerfu service user can run it
  ssh_run "chown -R offerfu:offerfu $release_dir"

  # Capture previous release for rollback
  local previous_dir
  previous_dir=$(get_current_release)
  if [ -z "$previous_dir" ]; then
    echo "==> No previous release (first deploy or missing symlink)."
    previous_dir="$release_dir"
  fi

  # Atomic swap: point current symlink at new release
  echo "==> Swapping current symlink to new release..."
  ssh_run "ln -sfn $release_dir $CURRENT_SYMLINK"

  # Ensure /var/www/offerfu points at releases/current (one-time)
  ssh_run "if [ ! -L $APP_SYMLINK ] || [ \"\$(readlink $APP_SYMLINK)\" != '$CURRENT_SYMLINK' ]; then
    if [ -d $APP_SYMLINK ] && [ ! -L $APP_SYMLINK ]; then
      echo '==> WARNING: $APP_SYMLINK is a real dir, not symlink. Backing up to ${APP_SYMLINK}.bak-\$RANDOM and replacing with symlink.'
      mv $APP_SYMLINK ${APP_SYMLINK}.bak-\$RANDOM
    fi
    ln -sfn $CURRENT_SYMLINK $APP_SYMLINK
    systemctl daemon-reload
  fi"

  # Restart + healthcheck with auto-rollback
  restart_and_check "$release_dir" "$previous_dir"

  # Prune old releases
  prune_old_releases

  echo ""
  echo "==> Deploy complete! Active: $timestamp"
  echo "==> Rollback if needed: ./deploy.sh rollback"
  echo "==> List releases: ./deploy.sh list"
}

case "$cmd" in
  deploy)   cmd_deploy ;;
  rollback) cmd_rollback ;;
  list)     cmd_list ;;
  *)
    echo "Usage: $0 {deploy|rollback|list}"
    exit 1
    ;;
esac