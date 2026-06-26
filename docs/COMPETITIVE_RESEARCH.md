# Competitive research — Discord community bots (2026)

Research snapshot for the ArmaraOS community bot. Goal: learn from the best, avoid the "stack five bots" trap, and build something **unique to an agent OS developer community**.

## TL;DR

| Tier | Bots | Strength | Weakness for us |
|------|------|----------|-----------------|
| All-in-one | PeakBot, Modly, NomoBot | Dashboard, moderation + XP + tickets in one | Generic; no AINL/ArmaraOS/product depth |
| Moderation | Dyno, YAGPDB | Raid/nuke, programmable automod | No dev-product integration |
| Engagement | MEE6, Arcane, Carl-bot | XP, reaction roles | Paywalled basics; gaming-centric |
| AI support | Mava, Wallu, NomoBot | FAQ + ticket AI, KB grounding | Closed SaaS; no local ArmaraOS bridge |
| Native Discord | Community Onboarding, AutoMod, Forums | Free, first-party, low bot count | No custom product logic |

**Our wedge:** one bot that is **product-native** (releases, docs, AINL validate, install doctor) plus **community-grade** mod/ticket/XP — with an optional **staff-only ArmaraOS agent** assist path.

---

## What the best bots do well (2026)

### 1. All-in-one dashboards (PeakBot, Modly, NomoBot)

- Single web UI for mod rules, welcome cards, XP curves, tickets, analytics
- **Anti-nuke / raid mode**: join velocity → lockdown + quarantine
- **Welcome image cards** (1024×400) with variables — table stakes for polish
- **AI moderation** (context-aware, not just regex) on premium tiers
- **Ticket transcripts** (HTML export) for accountability

**Take:** Build mod + welcome + XP in Phase 1–2, but **don't** chase 70 modules. Prioritize dev-community flows first.

### 2. AI FAQ + support (Mava, Wallu, NomoBot)

- Ground answers in **your** KB (Notion, docs, FAQ JSON)
- Answer in **public channels** before tickets (50%+ ticket reduction claims)
- **Confidence threshold** → escalate to human with context summary
- Integrate with existing ticket bots (Wallu) rather than replacing them

**Take:** Our KB is already structured — `ainativelangweb` docs, `AGENTS.md`, troubleshooting guides, `/notifications`. Sync + embed beats generic ChatGPT-in-Discord.

### 3. Moderation power tools (Dyno, YAGPDB)

- Granular audit logging (every ban, role change, channel delete)
- Custom commands / automations (YAGPDB premium: 250 commands)
- Feed integrations (GitHub releases, blog RSS) — we should own this natively

**Take:** Use Discord **AutoMod** for baseline spam/slurs; bot adds **product-specific** rules (token scam patterns, fake "support" DMs, phishing "free AINL" links).

### 4. Developer / OSS community patterns (Glasskube, Discord official)

- Enable **Discord Community** + native onboarding (roles, channel unlock)
- **Forum channels** for support — persist answers, reduce repeat questions
- **Principle of least privilege** on `@everyone`
- Metric that matters: **time-to-first-success** (install ArmaraOS, run `ainl validate`, get a reply in #support) — not raw member count

**Take:** Bot complements native onboarding; doesn't replace it. Bot adds **guided paths** (`/install`, `/doctor`, role from "I'm a…" buttons).

### 5. Tech stacks (frameworks)

| Stack | Pros | Cons |
|-------|------|------|
| **TypeScript + discord.js v14 + Sapphire** | Largest ecosystem, Components v2, sharding, hiring | Separate from ArmaraOS Rust core |
| **Shiver / Spraxium** (newer TS) | DI, middleware, health endpoints | Smaller community |
| **Rust + serenity + poise** | Aligns with armaraos; performance | Slower Discord UX iteration |
| **Hybrid** | TS bot + tiny Rust sidecar for AINL validate | Ops complexity |

**Recommendation:** **TypeScript + discord.js + Sapphire** for the community bot. Optional HTTP calls to ArmaraOS API / AINL MCP for staff features. Keeps velocity high and matches how every top bot ships.

---

## Features matrix — build vs buy vs native Discord

| Feature | Native Discord | Generic bot | **ArmaraOS bot (us)** |
|---------|----------------|-------------|------------------------|
| Rules + onboarding | ✅ Community | ✅ | Complement with `/start` + role panels |
| AutoMod baseline | ✅ | ✅ extra | Configure native first |
| Forum support | ✅ | — | Bot: cross-link to docs, suggest tags |
| Welcome cards | partial | ✅ | Branded ArmaraOS + AINL paths |
| XP / leaderboard | — | ✅ | **Contributor XP** (helpful answers, PR links) |
| Tickets + transcripts | — | ✅ | **Category-aware** (install / AINL / ArmaraOS bug) |
| Release announcements | — | RSS feeds | **`/notifications` sync** + changelog links |
| Docs-aware answers | — | SaaS AI | **Docs search API + AGENTS.md corpus** |
| AINL validate in chat | — | — | **`/ainl validate`** (strict mode hints) |
| Agent assist | — | — | **Staff channel → ArmaraOS API** (optional) |
| Anti-scam (crypto/token) | partial | partial | **$AINL-specific** patterns + official links only |

---

## What we intentionally skip (v1)

- Music / voice DJ (not our community)
- Casino / wager games (Modly-style) — off-brand for dev OSS
- 49 mini-games — noise
- Replacing Discord native onboarding entirely
- Running the **same bot token** as ArmaraOS daemon (documented anti-pattern in `armaraos/docs/channel-adapters.md`)

---

## Naming / brand

Working name: **Armara Bot** or **OpenFang** (match product). Separate application in Discord Developer Portal from any personal agent bot.
