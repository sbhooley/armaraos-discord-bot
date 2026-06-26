#!/usr/bin/env bash
# Install systemd unit for armaraos-discord-bot (Linux).
set -euo pipefail

USER_NAME="${SVC_USER:-$USER}"
WORKDIR="${WORKDIR:-$HOME/Desktop/Projects/armaraos-discord-bot}"
UNIT_PATH="/etc/systemd/system/armaraos-discord-bot.service"

cat <<EOF | sudo tee "$UNIT_PATH"
[Unit]
Description=ArmaraOS Community Discord Bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${USER_NAME}
WorkingDirectory=${WORKDIR}
EnvironmentFile=${WORKDIR}/.env
ExecStart=/usr/bin/node ${WORKDIR}/dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
echo "Installed ${UNIT_PATH}"
echo "Run: sudo systemctl enable --now armaraos-discord-bot"
