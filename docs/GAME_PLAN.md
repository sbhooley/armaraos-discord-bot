# Game plan — ArmaraOS Discord bot

**Vision:** The community server bot that only an **Agent OS** team would build — product-native, developer-first, and polished enough that members never need MEE6 + Dyno + TicketsBot + a separate FAQ bot.

**Codename:** Armara Bot (rename anytime)  
**Project path:** `~/Desktop/Projects/armaraos-discord-bot`  
**Target server:** Official ArmaraOS / AINL Discord (structure below)

---

## North-star principles

1. **Time-to-first-success < 10 minutes** — new member can install ArmaraOS or run `ainl validate` with bot help
2. **One bot, not five** — lean on Discord Community + AutoMod; we add product logic they can't
3. **Ground truth over hallucination** — answers link to ainativelang.com docs, GitHub, or `AGENTS.md` excerpts
4. **Separate from the daemon bot** — community token ≠ `[channels.discord]` agent token
5. **Maintainers visible** — bot surfaces "ask a human" paths; escalates with context, doesn't replace mods

---

## Recommended server structure (configure in Discord first)

Use **Discord Community** native onboarding, then let the bot enrich it.

| Category | Channels | Bot role |
|----------|----------|----------|
| **Start** | `#rules`, `#announcements`, `#releases` | Post releases; pin `/start` |
| **Welcome** | `#introductions` | Welcome embed + role buttons |
| **Product** | `#armaraos`, `#ainl`, `#showcase` | Docs search; AINL validate |
| **Support** | Forum `#help` | FAQ assist, ticket escalation |
| **Build** | `#dev-rust`, `#dev-python`, `#mcp` | Tag hints, link strict examples |
| **Community** | `#general`, `#off-topic` | XP; light moderation |
| **Staff** | `#mod-log`, `#staff-support` | Audit mirror; agent bridge |

**Roles (native onboarding):** `@announcements`, `@armaraos-user`, `@ainl-author`, `@contributor`, `@staff`

---

## Phased roadmap

### Phase 0 — Planning & Discord setup (now, ~1 week)

**Deliverables**

- [x] Project folder + this game plan
- [ ] Create Discord application ("Armara Community Bot") — separate from agent app
- [ ] Enable Community, AutoMod, forum `#help`, onboarding questions
- [ ] Define staff roles + permission matrix
- [ ] Invite bot with minimal permissions to staging server

**Success:** Server skeleton live; bot app exists; tokens in password manager only.

---

### Phase 1 — Foundation MVP (~2–3 weeks)

**Goal:** Bot online, useful on day one, zero database.

**Stack:** Node 20+, TypeScript, discord.js 14, @sapphire/framework, Zod config

**Features**

| Feature | Description |
|---------|-------------|
| `/start` | Interactive embed: Install ArmaraOS · Learn AINL · Get help · Contributor path |
| `/docs <query>` | Calls `ainativelang.com/api/docs/search`, returns top 3 links + snippets |
| `/release` | Latest from `/notifications` filtered for ArmaraOS / AINL |
| `/ping` + health | Uptime check for ops |
| Welcome message | Configurable channel; embed with links (no image gen yet) |
| Mod log relay | Mirror ban/kick/timeout to `#mod-log` |
| Release watcher | Poll notifications JSON every 15m; post new IDs to `#releases` |

**Commands to implement first:** `start`, `docs`, `release`, `ping`

**Success metrics**

- New member uses `/start` within 24h of join (track via simple event log file)
- Docs command returns relevant results for top 10 FAQ queries (manual QA list)

---

### Phase 2 — Support & trust (~3–4 weeks)

**Goal:** Reduce repetitive mod load; handle growth safely.

**Add:** Postgres (or SQLite for simplicity), ticket module

| Feature | Description |
|---------|-------------|
| **Smart tickets** | Button in forum posts → private thread; categories: Install / AINL / Bug / Other |
| **Transcripts** | On close, export HTML to staff channel or S3 |
| **FAQ assist** | In `#help` forum + designated channels; confidence ≥ 0.8 → answer + sources; else silent |
| **FAQ corpus** | Sync from ainativelangweb docs manifest + curated FAQ YAML in repo |
| `/ainl validate` | Paste snippet → call `ainl serve` HTTP `/validate` (strict) → formatted diagnostics |
| **Scam shield** | Delete/warn on: fake support DMs mention, wallet drain links, "free AINL airdrop" patterns |
| **Warn / note** | `/warn`, `/warnings` for staff |

**Success metrics**

- ≥ 40% of forum questions get a bot doc link before mod reply (measure FAQ hits)
- Median time-to-first-response drops (manual mod survey)
- Zero token-scam posts surviving > 60s in public channels

---

### Phase 3 — Engagement & contributor loops (~3 weeks)

**Goal:** Reward helpful members; tie Discord to real project contribution.

| Feature | Description |
|---------|-------------|
| **Contributor XP** | +XP for messages in `#help` marked helpful (mod reaction) |
| **Leaderboard** | `/rank`, weekly `#community-highlights` post |
| **Role rewards** | Level 5 → `@regular`; Level 15 + helpful badge → `@contributor` candidate |
| **GitHub linking** | `/link github` → verify via OAuth or gist pin; show merged PRs in profile |
| **Showcase prompts** | Weekly thread: "What did you build with AINL this week?" |
| **Changelog digest** | Weekly embed: ainativelang + armaraos release notes summary |

**Success metrics**

- 10+ active weekly contributors in `#help`
- GitHub links on ≥ 20% of regulars

---

### Phase 4 — AI-native differentiators (~4+ weeks)

**Goal:** Features no generic bot can copy without your product stack.

| Feature | Description |
|---------|-------------|
| **Staff agent bridge** | `/assist` in `#staff-support` → POST to ArmaraOS API with read-only support agent; posts draft for mod approval |
| **Install doctor** | `/doctor` walks env checklist (mirrors `ainl doctor` + ArmaraOS docs) |
| **MCP wizard hints** | Detect `empty_source` / adapter errors in pasted MCP JSON → recovery links from AGENTS.md |
| **Live status** | Optional: inferx status page / GitHub releases for armaraos + ainativelang |
| **Notification targeting** | Parse `targets` field; role ping `@armaraos-user` only for desktop releases |
| **Server template export** | `/export-template` generates JSON for other OSS projects (give back to community) |

**Success metrics**

- Staff uses bridge ≥ 5×/week with < 10% bad drafts
- `/doctor` resolves 30% of install tickets without human

---

### Phase 5 — Operator dashboard (optional, later)

Web UI (Next.js or embedded admin) for:

- Edit FAQ corpus, welcome copy, release filters
- Analytics: joins, tickets, FAQ hit rate, top doc queries
- Mod queue: open tickets, warn history

Only build when Phase 2–3 config in YAML/JSON becomes painful.

---

## Unique feature checklist (the "amazing" bar)

These are the **must-ship differentiators** — not optional nice-to-haves:

- [ ] **Product notification sync** — same JSON as ArmaraOS desktop bell
- [ ] **Docs-grounded answers** — every FAQ reply includes ≥ 1 ainativelang.com URL
- [ ] **`/ainl validate`** — strict diagnostics in Discord (world-first for a language community bot)
- [ ] **Forum-first support** — bot enhances forums, doesn't fight them
- [ ] **Contributor XP tied to help quality** — not spammy message-count XP
- [ ] **Two-bot documentation** — README warns against daemon token reuse
- [ ] **$AINL scam patterns** — community-specific safety

---

## Tech decisions (locked for Phase 1)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | TypeScript | Discord ecosystem, speed, Components v2 |
| Framework | Sapphire + discord.js | Battle-tested; plugin ecosystem |
| Config | `.env` + `config/default.json` | Simple until dashboard |
| Hosting | VPS systemd or Railway | Low cost; easy cron for pollers |
| DB | None → SQLite → Postgres | Progressive complexity |
| LLM | Optional OpenRouter | FAQ fallback only; docs-first |

---

## MVP command spec (Phase 1)

### `/start`

Ephemeral or public embed with buttons:

- **Download ArmaraOS** → ainativelang.com/armaraos
- **Quickstart AINL** → ainativelang.com/quickstart
- **Open a help request** → link to forum `#help` + tag picker
- **I'm a contributor** → CONTRIBUTING.md + dev channels

### `/docs query:*`

1. `GET https://www.ainativelang.com/api/docs/search?q=...`
2. Reply embed, max 3 results, footer "Not what you need? Post in #help"

### `/release product:[armaraos|ainl|all]`

1. Fetch `/notifications`
2. Filter by target / keywords
3. Show latest 3 with `action_url` buttons

---

## Team & ops

| Role | Responsibility |
|------|----------------|
| **Bot maintainer** | Code, deploy, token rotation |
| **Community mod** | FAQ corpus curation, warn policy |
| **Product** | Release notification `targets`, announcement copy |

**Runbook essentials:** token rotation, Gateway 409 debug, invite URL regen, backup DB weekly (Phase 2+).

---

## Immediate next steps (this week)

1. **Create Discord apps** — Community bot (this project) vs personal agent bot (ArmaraOS daemon)
2. **Scaffold Phase 1** — `npm init`, Sapphire template, `start` + `docs` + `release`
3. **Draft FAQ YAML** — top 25 questions from GitHub issues / expected support load
4. **Staging server** — invite core team; dogfood `/start` and `/docs`
5. **Optional:** Open GitHub repo `sbhooley/armaraos-discord-bot` when Phase 1 compiles

---

## Open questions (decide before Phase 2)

1. **Public repo?** — Likely yes (OSS community alignment)
2. **Hosted bot vs self-hosted** — who runs production process?
3. **LLM budget** — cap FAQ assist to N calls/day on free tier?
4. **A INL validate** — subprocess `ainl` on bot host vs remote `ainl serve`?
5. **Brand name** — Armara Bot vs OpenFang Community vs other

---

## References

- [Competitive research](./COMPETITIVE_RESEARCH.md)
- [Architecture](./ARCHITECTURE.md)
- [ArmaraOS Discord channel adapter](https://github.com/sbhooley/armaraos/blob/main/docs/channel-adapters.md#discord)
- [Glasskube OSS Discord guide](https://glasskube.dev/blog/discord-setup/)
- [Discord Community best practices](https://discord.com/blog/best-practices-for-starting-a-great-community-on-discord)
