#!/bin/bash
set -euo pipefail

REMOTE="root@109.123.227.158"
REMOTE_DIR="/home/offerfu/value-offer-generator"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Syncing files to production (excluding .env, .next, node_modules, .git)..."
rsync -avz \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  "$LOCAL_DIR/" "$REMOTE:$REMOTE_DIR/"

echo "==> Installing dependencies..."
ssh "$REMOTE" "cd $REMOTE_DIR && npm install"

echo "==> Running database migrations..."
ssh "$REMOTE" "cd $REMOTE_DIR && npx prisma migrate deploy"

echo "==> Building..."
ssh "$REMOTE" "cd $REMOTE_DIR && rm -rf .next && npm run build"

echo "==> Restarting service..."
ssh "$REMOTE" "systemctl restart offerfu"

echo "==> Waiting for app to start..."
sleep 3

STATUS=$(ssh "$REMOTE" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3100")
if [ "$STATUS" = "200" ]; then
  echo "==> Deploy complete! App is live at https://offerfu.com"
else
  echo "==> WARNING: App returned HTTP $STATUS. Check: ssh $REMOTE 'systemctl status offerfu'"
fi