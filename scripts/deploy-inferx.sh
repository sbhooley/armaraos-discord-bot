#!/usr/bin/env bash
# Rsync armaraos-discord-bot to the inferx VM, build, and restart systemd service.
# Never overwrites ~/armaraos-discord-bot/.env on the VM (production secrets stay put).
# Never overwrites ~/armaraos-discord-bot/data/ on the VM (SQLite stays put).
#
# Usage:
#   ./scripts/deploy-inferx.sh
#   INFERX_HOST=161.153.113.55 ./scripts/deploy-inferx.sh
#
# First-time on VM: create .env (see docs/DEPLOY_INFERX.md), then re-run deploy.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INFERX_KEY="${INFERX_SSH_KEY:-$HOME/Downloads/ssh-key-2026-06-23 (1).key}"
INFERX_HOST="${INFERX_HOST:-141.148.184.75}"
REMOTE_DIR="${INFERX_REMOTE_DIR:-armaraos-discord-bot}"
REMOTE_USER="${INFERX_SSH_USER:-ubuntu}"

if [[ ! -f "$INFERX_KEY" ]]; then
  echo "SSH key not found: $INFERX_KEY" >&2
  echo "Set INFERX_SSH_KEY to your Oracle inferx private key." >&2
  exit 1
fi

SSH=(ssh -i "$INFERX_KEY" -o StrictHostKeyChecking=accept-new "${REMOTE_USER}@${INFERX_HOST}")
RSYNC_SSH="ssh -i \"$INFERX_KEY\" -o StrictHostKeyChecking=accept-new"

echo "== rsync to ${REMOTE_USER}@${INFERX_HOST}:~/${REMOTE_DIR} (preserving .env + data/) =="
rsync -az \
  --exclude node_modules \
  --exclude .git \
  --exclude .env \
  --exclude data \
  --exclude dist \
  "$ROOT/" \
  -e "$RSYNC_SSH" \
  "${REMOTE_USER}@${INFERX_HOST}:~/${REMOTE_DIR}/"

echo "== build + restart on inferx =="
"${SSH[@]}" bash -s <<EOF
set -euo pipefail
REMOTE_DIR="\$HOME/${REMOTE_DIR}"

ensure_node() {
  if command -v node >/dev/null 2>&1 && node -p 'process.version.slice(1).split(".")[0]' | grep -qE '^2[0-9]'; then
    return 0
  fi
  echo "Installing Node.js 20.x..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
}

ensure_node
cd "\$REMOTE_DIR"

if [[ ! -f .env ]]; then
  echo "ERROR: \$REMOTE_DIR/.env missing on VM." >&2
  echo "SSH in and create it (see docs/DEPLOY_INFERX.md):" >&2
  echo "  cp .env.example .env && nano .env" >&2
  echo "Required: DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID" >&2
  exit 1
fi

npm ci --omit=dev
npm run build
npm run db:migrate

sudo cp deploy/systemd/armaraos-discord-bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable armaraos-discord-bot
sudo systemctl restart armaraos-discord-bot
sleep 3

if systemctl is-active --quiet armaraos-discord-bot; then
  echo "✓ armaraos-discord-bot is active"
else
  echo "✗ service failed — last logs:" >&2
  sudo journalctl -u armaraos-discord-bot -n 30 --no-pager >&2
  exit 1
fi

sudo journalctl -u armaraos-discord-bot -n 8 --no-pager
EOF

echo ""
echo "Done. ArmaraOSDBot deployed to inferx (VM .env and data/ preserved)."
echo "Logs: ssh ... 'sudo journalctl -u armaraos-discord-bot -f'"
