# Architecture

## Two-bot model (critical)

ArmaraOS already documents running **separate bots** for private agent routing vs public community ([channel-adapters.md — Multiple bots](https://github.com/sbhooley/armaraos/blob/main/docs/channel-adapters.md)):

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│  ArmaraOS daemon            │     │  armaraos-discord-bot        │
│  [channels.discord]         │     │  (this project)              │
│  DISCORD_BOT_TOKEN (private)│     │  ARMARA_DISCORD_BOT_TOKEN    │
│  → routes to YOUR agents    │     │  → community server ops      │
└─────────────────────────────┘     └──────────────────────────────┘
         DM / personal use                    Official ArmaraOS server
```

**Never share tokens.** One process per token (Gateway 409 if duplicated).

## High-level diagram

```
                    ┌─────────────────────────────────────┐
                    │         Discord Gateway              │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │  Bot (Node 20+, discord.js v14)       │
                    │  Sapphire command + event loader      │
                    └─┬───────┬────────┬──────────┬─────────┘
                      │       │        │          │
           ┌──────────▼──┐ ┌──▼───┐ ┌──▼────┐ ┌───▼────────────┐
           │ Mod / Safety│ │ XP   │ │Tickets│ │ Product intel  │
           └─────────────┘ └──────┘ └───┬───┘ └───┬────────────┘
                                        │         │
                              ┌─────────▼─────────▼──────────┐
                              │  Postgres + Redis (Phase 2+) │
                              └─────────┬────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
 ┌──────▼──────┐              ┌─────────▼────────┐            ┌────────▼────────┐
 │ ainativelang│              │ ArmaraOS API       │            │ LLM provider    │
 │ .com feeds  │              │ (staff, optional)  │            │ (FAQ fallback)  │
 │ notifications│             │ /api/agents/...    │            │                 │
 │ docs search │              │ loopback + API key │            │                 │
 └─────────────┘              └────────────────────┘            └─────────────────┘
```

## Module layout

```
src/
  index.ts                 # Bootstrap, intents, shard manager (if needed)
  lib/
    config.ts              # Zod-validated env
    logger.ts
    discord.ts             # Client factory
  commands/                # Slash commands (Sapphire)
    start.ts               # Onboarding helper
    docs.ts                # Search ainativelang docs
    ainl.ts                # Validate snippet / link examples
    release.ts             # Latest ArmaraOS / AINL release
    ticket.ts              # Open / close support ticket
  events/
    ready.ts
    guildMemberAdd.ts      # Welcome + auto-role hooks
    messageCreate.ts       # FAQ assist (opt-in channels)
    interactionCreate.ts
  modules/
    moderation/            # Logging, warn, raid heuristics
    tickets/               # Private threads, transcripts
    engagement/            # XP, leaderboard, contributor roles
    product/               # Notification poller, RSS, changelog
    faq/                   # Retrieval + confidence gate
    armara-bridge/         # Staff-only agent assist
  services/
    notifications.ts       # Poll ainativelang.com/notifications
    docsSearch.ts          # GET /api/docs/search
    ainlValidate.ts        # Phase 2: HTTP to ainl serve or CLI subprocess
```

## Intents & permissions

Minimum privileged intents:

- `Guilds`, `GuildMembers` (welcome, roles)
- `GuildMessages`, `MessageContent` (FAQ assist in designated channels)
- `GuildModeration` (audit log mirror)

Bot permissions (invite URL): Manage Roles (limited), Manage Threads, Send Messages, Embed Links, Attach Files, Read Message History, Moderate Members (optional), Create Public Threads.

## Data model (Phase 2)

| Table | Purpose |
|-------|---------|
| `members` | Discord ID, join date, XP, warning count |
| `tickets` | thread ID, category, status, transcript URL |
| `faq_hits` | query, confidence, source doc, helped? |
| `mod_actions` | action, mod ID, target, reason, audit ref |
| `release_posts` | notification ID, posted message ID (dedupe) |

## Deployment options

1. **VPS + systemd** — simple, matches inferx ops familiarity
2. **Fly.io / Railway** — managed, need Redis/Postgres addons
3. **Home lab** — fine for early dogfood; use health endpoint + uptime monitor

Phase 1 can run **stateless** (no DB) with JSON config + Discord-only state.

## Security

- Secrets only via env; never commit tokens
- Staff commands gated by role ID allowlist
- ArmaraOS API key only on bridge module; read-only agent for support drafts
- FAQ LLM: system prompt forbids inventing flags/env vars — cite docs URLs only
- Rate limit slash commands per user (Redis or in-memory Phase 1)
