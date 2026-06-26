# Deploy ArmaraOSDBot to inferx (Oracle VM)

Production Discord bots must run **24/7**. This deploys the Node process to the same **inferx** Ubuntu VM pattern as `ainl-inference-server`.

**Discord hosts the community.** This VM only runs the bot process that connects outbound to Discord.

---

## Layout

| | inferx VM | ainativelang.com |
|--|-----------|------------------|
| **Runs** | `armaraos-discord-bot` (Node + systemd) | Marketing site (unchanged) |
| **Connects to** | Discord Gateway, public HTTPS APIs | — |
| **Secrets** | `~/armaraos-discord-bot/.env` on VM only | — |

Default deploy target (override with env):

| Variable | Default |
|----------|---------|
| `INFERX_HOST` | `141.148.184.75` |
| `INFERX_SSH_KEY` | `~/Downloads/ssh-key-2026-06-23 (1).key` |
| `INFERX_REMOTE_DIR` | `armaraos-discord-bot` |

See also [OPERATIONS_INFERX.md](https://github.com/sbhooley/ainl-inference-server/blob/main/docs/OPERATIONS_INFERX.md) for inferx VM IPs (`161.153.113.55` data plane, etc.).

---

## One-time VM setup

SSH to the VM:

```bash
INFERX_KEY="$HOME/Downloads/ssh-key-2026-06-23 (1).key"
INFERX_HOST="${INFERX_HOST:-141.148.184.75}"
ssh -i "$INFERX_KEY" ubuntu@$INFERX_HOST
```

Create production `.env` (first deploy from laptop will rsync code but **not** overwrite this file):

```bash
mkdir -p ~/armaraos-discord-bot/data
cd ~/armaraos-discord-bot
nano .env
```

Minimum `.env` on VM:

```bash
DISCORD_BOT_TOKEN=your_token_here
DISCORD_CLIENT_ID=1520046217583919194
DISCORD_GUILD_ID=your_server_id_here

NOTIFICATIONS_URL=https://www.ainativelang.com/notifications
DOCS_MANIFEST_URL=https://www.ainativelang.com/search/docs-manifest.json
DATABASE_PATH=/home/ubuntu/armaraos-discord-bot/data/bot.db
CONFIG_PATH=/home/ubuntu/armaraos-discord-bot/config/default.json
```

Edit `config/default.json` channel/role IDs on the VM (or run `npm run finish` locally before first deploy).

Register slash commands once (from laptop or VM):

```bash
npm run register-commands
```

---

## Deploy from your Mac

```bash
cd ~/Desktop/Projects/armaraos-discord-bot
npm run deploy:inferx
```

Or with explicit host:

```bash
INFERX_HOST=161.153.113.55 npm run deploy:inferx
```

What the script does:

1. `rsync` code to `~/armaraos-discord-bot` (excludes `.env`, `data/`, `node_modules`)
2. Installs Node 20 if missing
3. `npm ci`, `npm run build`, `npm run db:migrate`
4. Installs `armaraos-discord-bot.service` systemd unit
5. Restarts and prints journal tail

---

## Operations

```bash
# Status
sudo systemctl status armaraos-discord-bot

# Live logs
sudo journalctl -u armaraos-discord-bot -f

# Restart after .env change
sudo systemctl restart armaraos-discord-bot
```

---

## Optional: ArmaraOS `/assist` on same VM

If ArmaraOS daemon runs on the inferx box:

```bash
ARMARAOS_API_BASE=http://127.0.0.1:4200
ARMARAOS_API_KEY=your_daemon_api_key
```

If not, leave unset — core bot features still work.

---

## Local dev vs production

| | Local (`npm run dev`) | inferx (`deploy:inferx`) |
|--|----------------------|---------------------------|
| Uptime | Mac must stay awake | 24/7 systemd |
| Database | `./data/bot.db` | VM `~/armaraos-discord-bot/data/bot.db` |
| Token | Same bot token OK if only one process runs | **Never** run local + VM with same token simultaneously |

Discord allows **one Gateway connection per bot token**. Stop local `npm run dev` before deploying to inferx.
