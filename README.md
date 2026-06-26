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

## Quick start

```bash
cd ~/Desktop/Projects/armaraos-discord-bot
cp .env.example .env          # DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID
# Edit config/default.json — channel + role IDs

npm install
npm run db:migrate
npm run register-commands
npm run dev
```

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
