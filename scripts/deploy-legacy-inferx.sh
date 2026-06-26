#!/usr/bin/env bash
# Deploy to legacy / phased-out inferx VM (misc services — NOT inference data plane).
# Recommended default for ArmaraOSDBot.
set -euo pipefail
export DEPLOY_HOST="${DEPLOY_HOST:-141.148.184.75}"
export DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-$HOME/Downloads/ssh-key-2026-06-23 (1).key}"
export DEPLOY_LABEL="${DEPLOY_LABEL:-legacy-inferx}"
exec "$(dirname "$0")/deploy-remote.sh"
