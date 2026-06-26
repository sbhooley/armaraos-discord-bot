# ArmaraOS Discord Bot

Community server bot for **ArmaraOS / AINL** — product-native support, moderation, XP, and tickets.

**Not** the personal agent bridge (`[channels.discord]` in ArmaraOS uses a **separate token**).

## Features

| Area | Commands / behavior |
|------|---------------------|
| Onboarding | `/start`, welcome embeds |
| Docs | `/docs`, FAQ auto-reply in configured channels |
| Releases | `/release`, background poller → `#releases` |
| AINL | `/ainl validate`, `/doctor` |
| Support | `/ticket open/close`, transcripts |
| Mod | `/warn`, `/warnings`, scam shield, mod log relay |
| Engagement | `/rank`, XP, `/link github`, weekly digest & showcase crons |
| Staff | `/health`, `/assist` (ArmaraOS agent draft) |

## Quick start (easiest — start here)

**Never set up a Discord bot before?** Read **[docs/BEGINNER_GUIDE.md](docs/BEGINNER_GUIDE.md)** — it is written for zero prior experience.

```bash
cd ~/Desktop/Projects/armaraos-discord-bot
npm run setup:portal   # opens Discord Developer Portal in your browser
npm run setup          # paste 3 values → auto-configures everything
npm run dev            # start the bot
```

The setup wizard only asks for:
1. **Bot token** (Developer Portal → Bot → Reset Token)
2. **Application ID** (Developer Portal → General Information)
3. **Server ID** (Discord → right-click server → Copy Server ID)

It writes `.env`, maps channels/roles automatically, registers slash commands, and migrates the database.

**GitHub:** https://github.com/sbhooley/armaraos-discord-bot

## Production (inferx VM)

```bash
npm run deploy:inferx
# INFERX_HOST=161.153.113.55 npm run deploy:inferx  # alternate inferx IP
```

First-time: create `.env` on the VM — see **[docs/DEPLOY_INFERX.md](docs/DEPLOY_INFERX.md)**.

## Manual quick start

Full guide: **[docs/SETUP.md](docs/SETUP.md)**  
Server layout: **[docs/SERVER_TEMPLATE.md](docs/SERVER_TEMPLATE.md)**  
Active checklist: **[docs/TODOS.md](docs/TODOS.md)**

## Project layout

```
src/
  commands/     # Slash commands
  listeners/    # Events (welcome, FAQ, scam, XP, mod log)
  jobs/         # Release poller, weekly digest, showcase
  services/     # Docs, notifications, FAQ, AINL, ArmaraOS bridge
  db/           # SQLite schema + helpers
config/
  default.json  # Channel/role IDs, XP, cron schedules
  faq.seed.yaml # FAQ corpus (expand over time)
```

## Related

- [armaraos](https://github.com/sbhooley/armaraos) — daemon + channel adapters
- [ainativelang](https://github.com/sbhooley/ainativelang) — AINL compiler/runtime
- [ainativelang.com/notifications](https://www.ainativelang.com/notifications) — release feed
