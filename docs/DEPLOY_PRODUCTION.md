# Deploy ArmaraOSDBot to production (Oracle VMs)

Production Discord bots must run **24/7**. They should **not** run on the **inferx-v2 data plane** — that host is reserved for inference (`armara-infer` on `161.153.113.55`).

**Discord hosts the community.** Your VM only runs a small Node process that connects outbound to Discord.

---

## Where to deploy (recommended order)

| Priority | VM | IP | SSH key | Command | Why |
|----------|-----|-----|---------|---------|-----|
| **1 (best)** | Legacy / phased-out inferx | `141.148.184.75` | `ssh-key-2026-06-23 (1).key` | `npm run deploy:legacy` | Idle capacity, zero impact on inference |
| **2 (good)** | inferx-keys (control plane) | `129.146.42.8` | `ssh-key-2026-06-23 (2).key` | `npm run deploy:keys` | Light workload; community ops adjacent to keys/billing |
| **Avoid** | inferx-v2 data plane | `161.153.113.55` | key (1) | — | Reserved for `armara-infer` / LLM routing |

The deploy scripts **refuse** `161.153.113.55` unless you explicitly set `ALLOW_INFERX_V2_DEPLOY=1` (not recommended).

Cross-reference: [OPERATIONS_INFERX.md](https://github.com/sbhooley/ainl-inference-server/blob/main/docs/OPERATIONS_INFERX.md)

---

## Deploy commands

```bash
cd ~/Desktop/Projects/armaraos-discord-bot

# Recommended — legacy inferx VM
npm run deploy:legacy

# Alternative — inferx-keys VM
npm run deploy:keys
```

What happens:

1. `rsync` to `~/armaraos-discord-bot` (preserves VM `.env` and `data/`)
2. Installs Node 20 if needed
3. `npm ci`, `npm run build`, `npm run db:migrate`
4. Installs systemd unit `armaraos-discord-bot.service`
5. Restarts and prints logs

---

## One-time VM setup

SSH to your chosen host:

```bash
# Legacy inferx (recommended)
ssh -i "$HOME/Downloads/ssh-key-2026-06-23 (1).key" ubuntu@141.148.184.75

# OR inferx-keys
ssh -i "$HOME/Downloads/ssh-key-2026-06-23 (2).key" ubuntu@129.146.42.8
```

Create `.env`:

```bash
mkdir -p ~/armaraos-discord-bot/data
nano ~/armaraos-discord-bot/.env
```

Minimum:

```bash
DISCORD_BOT_TOKEN=your_token_here
DISCORD_CLIENT_ID=1520046217583919194
DISCORD_GUILD_ID=your_server_id_here
DATABASE_PATH=/home/ubuntu/armaraos-discord-bot/data/bot.db
CONFIG_PATH=/home/ubuntu/armaraos-discord-bot/config/default.json
```

Register slash commands once (from laptop with `.env` filled):

```bash
npm run register-commands
```

---

## Operations

```bash
sudo systemctl status armaraos-discord-bot
sudo journalctl -u armaraos-discord-bot -f
sudo systemctl restart armaraos-discord-bot
```

---

## Resource profile

ArmaraOSDBot uses ~50–150 MB RAM and negligible CPU. It does **not** need GPU or high concurrency — keeping it off inferx-v2 protects inference latency and admission capacity.

---

## Optional: `/assist` bridge

Only enable if ArmaraOS daemon runs on the **same** VM as the bot:

```bash
ARMARAOS_API_BASE=http://127.0.0.1:4200
ARMARAOS_API_KEY=...
```

Otherwise leave unset — `/docs`, `/release`, tickets, FAQ, etc. work without it.

---

## Local dev vs production

Stop local `npm run dev` before deploying — **one bot token = one Discord Gateway connection**.

| | Local | Production VM |
|--|-------|----------------|
| Command | `npm run dev` | `npm run deploy:legacy` |
| Uptime | Mac awake | 24/7 systemd |
