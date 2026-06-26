#!/usr/bin/env bash
# Shared remote deploy for armaraos-discord-bot.
# Never overwrites ~/armaraos-discord-bot/.env or data/ on the VM.
#
# Env (set by wrapper scripts or caller):
#   DEPLOY_HOST       — required
#   DEPLOY_SSH_KEY    — required
#   DEPLOY_SSH_USER   — default ubuntu
#   DEPLOY_REMOTE_DIR — default armaraos-discord-bot
#   DEPLOY_LABEL      — log label (e.g. legacy-inferx, inferx-keys)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_HOST="${DEPLOY_HOST:?Set DEPLOY_HOST}"
DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:?Set DEPLOY_SSH_KEY}"
DEPLOY_SSH_USER="${DEPLOY_SSH_USER:-ubuntu}"
DEPLOY_REMOTE_DIR="${DEPLOY_REMOTE_DIR:-armaraos-discord-bot}"
DEPLOY_LABEL="${DEPLOY_LABEL:-$DEPLOY_HOST}"

# Hard guard: do not deploy to inferx-v2 data plane unless explicitly overridden.
INFERX_V2_DATA_PLANE="${INFERX_V2_DATA_PLANE:-161.153.113.55}"
if [[ "$DEPLOY_HOST" == "$INFERX_V2_DATA_PLANE" && "${ALLOW_INFERX_V2_DEPLOY:-}" != "1" ]]; then
  echo "Refusing to deploy Discord bot to inferx-v2 data plane ($INFERX_V2_DATA_PLANE)." >&2
  echo "That host should stay dedicated to inference (armara-infer)." >&2
  echo "Use instead:" >&2
  echo "  npm run deploy:legacy   # old inferx VM (141.148.184.75) — recommended" >&2
  echo "  npm run deploy:keys     # inferx-keys VM (129.146.42.8)" >&2
  echo "Override only if intentional: ALLOW_INFERX_V2_DEPLOY=1 npm run deploy:inferx" >&2
  exit 1
fi

if [[ ! -f "$DEPLOY_SSH_KEY" ]]; then
  echo "SSH key not found: $DEPLOY_SSH_KEY" >&2
  exit 1
fi

SSH=(ssh -i "$DEPLOY_SSH_KEY" -o StrictHostKeyChecking=accept-new "${DEPLOY_SSH_USER}@${DEPLOY_HOST}")
RSYNC_SSH="ssh -i \"$DEPLOY_SSH_KEY\" -o StrictHostKeyChecking=accept-new"

echo "== Deploy ArmaraOSDBot → ${DEPLOY_LABEL} (${DEPLOY_SSH_USER}@${DEPLOY_HOST}) =="
echo "== rsync (preserving .env + data/) =="

rsync -az \
  --exclude node_modules \
  --exclude .git \
  --exclude .env \
  --exclude data \
  --exclude dist \
  "$ROOT/" \
  -e "$RSYNC_SSH" \
  "${DEPLOY_SSH_USER}@${DEPLOY_HOST}:~/${DEPLOY_REMOTE_DIR}/"

echo "== build + restart =="
"${SSH[@]}" bash -s <<EOF
set -euo pipefail
REMOTE_DIR="\$HOME/${DEPLOY_REMOTE_DIR}"

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
  echo "See docs/DEPLOY_PRODUCTION.md" >&2
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
  echo "✓ armaraos-discord-bot is active on ${DEPLOY_LABEL}"
else
  sudo journalctl -u armaraos-discord-bot -n 30 --no-pager >&2
  exit 1
fi

sudo journalctl -u armaraos-discord-bot -n 8 --no-pager
EOF

echo ""
echo "Done. Deployed to ${DEPLOY_LABEL} (${DEPLOY_HOST})."
echo "Logs: ssh -i \"${DEPLOY_SSH_KEY}\" ${DEPLOY_SSH_USER}@${DEPLOY_HOST} 'sudo journalctl -u armaraos-discord-bot -f'"
