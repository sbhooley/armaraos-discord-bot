#!/usr/bin/env bash
# Deprecated name — use deploy-legacy-inferx.sh (default) or deploy-inferx-keys.sh.
# Refuses inferx-v2 data plane (161.153.113.55) unless ALLOW_INFERX_V2_DEPLOY=1.
set -euo pipefail
echo "Note: deploy-inferx.sh → using legacy inferx target (not inferx-v2 data plane)." >&2
export DEPLOY_HOST="${INFERX_HOST:-141.148.184.75}"
export DEPLOY_SSH_KEY="${INFERX_SSH_KEY:-$HOME/Downloads/ssh-key-2026-06-23 (1).key}"
export DEPLOY_LABEL="${DEPLOY_LABEL:-legacy-inferx}"
exec "$(dirname "$0")/deploy-remote.sh"
