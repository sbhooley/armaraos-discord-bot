# ArmaraOS Discord Bot — Active TODO tracker

Last updated: implementation complete in repo; **manual Discord/server steps remain**.

## Legend
- [x] Done in codebase
- [ ] Requires your Discord portal / server (manual)

---

## Phase 0 — Discord & server setup

- [x] Project folder + game plan + architecture docs
- [x] `docs/SETUP.md` step-by-step
- [x] `docs/SERVER_TEMPLATE.md` channel/role layout
- [ ] Create Discord application **Armara Community Bot** (separate from agent bot)
- [ ] Enable Community + AutoMod + forum `#help` on staging server
- [ ] Copy channel/role IDs into `config/default.json`
- [ ] Invite bot; set `.env` (`DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`)

## Phase 1 — Foundation MVP

- [x] TypeScript + Sapphire + discord.js scaffold
- [x] `/start` with link buttons
- [x] `/docs` (API + manifest fallback)
- [x] `/release` (notifications JSON)
- [x] `/ping` + `/health` (staff)
- [x] Welcome on `guildMemberAdd`
- [x] Mod log relay (ban/kick)
- [x] Release watcher poller
- [x] Event JSONL log (`data/events.jsonl`)

## Phase 2 — Support & trust

- [x] SQLite schema (members, tickets, warnings, faq_hits, releases, github)
- [x] `/ticket open` + `/ticket close` + HTML transcripts
- [x] FAQ corpus (`config/faq.seed.yaml`) + message assist
- [x] `/ainl validate` (HTTP to ainl serve)
- [x] Scam shield patterns + mod log
- [x] `/warn` + `/warnings` (staff)

## Phase 3 — Engagement

- [x] XP on messages + cooldown
- [x] Staff ✅ reaction → helpful XP
- [x] Level role grants (configurable thresholds)
- [x] `/rank` + leaderboard
- [x] `/link github` gist verification
- [x] Weekly digest cron (`weeklyDigest.cron`)
- [x] Showcase prompt cron (`showcasePrompt.cron`)

## Phase 4 — AI-native differentiators

- [x] `/doctor` checklist + ArmaraOS health probe
- [x] `/assist` staff bridge → ArmaraOS API
- [x] Release role targeting (`armaraosUserId`, `announcementsId`)

## Phase 5 — Ops (optional later)

- [x] `scripts/install-systemd.sh`
- [x] `scripts/register-commands.ts`
- [ ] Web operator dashboard (defer until YAML config is painful)
- [ ] GitHub repo publish (`sbhooley/armaraos-discord-bot`)
- [ ] Production VPS/systemd deploy

---

## Your launch checklist (≈30 min)

1. `cp .env.example .env` and fill tokens
2. Edit `config/default.json` with real channel/role IDs
3. `npm install && npm run db:migrate && npm run register-commands`
4. `npm run dev` — test `/ping`, `/start`, `/docs query:armaraos`
5. Pin `/start` message in `#start-here` (see SERVER_TEMPLATE)
6. Optional: `ainl serve --port 8765` for `/ainl validate`
7. Optional: ArmaraOS daemon for `/assist` and `/health`
