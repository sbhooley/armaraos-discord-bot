#!/usr/bin/env bash
# Deploy to inferx-keys control-plane VM (lighter than inferx-v2 data plane).
set -euo pipefail
export DEPLOY_HOST="${DEPLOY_HOST:-129.146.42.8}"
export DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-$HOME/Downloads/ssh-key-2026-06-23 (2).key}"
export DEPLOY_LABEL="${DEPLOY_LABEL:-inferx-keys}"
exec "$(dirname "$0")/deploy-remote.sh"
