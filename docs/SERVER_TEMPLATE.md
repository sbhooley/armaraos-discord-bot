# Discord server template — ArmaraOS / AINL community

Copy this structure when configuring the official server. Use **Discord Community onboarding** for roles; the bot enriches with `/start`, FAQ, releases, and tickets.

## Categories & channels

### START
| Channel | Type | Purpose |
|---------|------|---------|
| `#rules` | Text | Server rules (Community requirement) |
| `#announcements` | Announcement | Product news (bot posts to `#releases` too) |
| `#releases` | Text | Bot auto-posts from ainativelang.com/notifications |

### WELCOME
| Channel | Type | Purpose |
|---------|------|---------|
| `#introductions` | Text | New member intros |
| `#start-here` | Text | Pin: "Run `/start`" |

### PRODUCT
| Channel | Type | Purpose |
|---------|------|---------|
| `#armaraos` | Text | Desktop, daemon, dashboard |
| `#ainl` | Text | Language, MCP, compiler |
| `#showcase` | Text | Weekly bot prompt + community builds |

### SUPPORT
| Channel | Type | Purpose |
|---------|------|---------|
| `#help` | **Forum** | FAQ assist + `/ticket open` |
| `#bugs` | Forum | Repro + logs required (template in post guidelines) |

### BUILD
| Channel | Type | Purpose |
|---------|------|---------|
| `#dev-rust` | Text | armaraos / OpenFang |
| `#dev-python` | Text | ainativelang runtime |
| `#mcp` | Text | ainl-mcp authoring |

### COMMUNITY
| Channel | Type | Purpose |
|---------|------|---------|
| `#general` | Text | General chat |
| `#off-topic` | Text | Non-product |

### STAFF (private)
| Channel | Type | Purpose |
|---------|------|---------|
| `#mod-log` | Text | Bot audit relay |
| `#staff-support` | Text | `/assist` drafts |
| `#staff-chat` | Text | Internal |

## Roles

| Role | Assignment | Notes |
|------|------------|-------|
| `@announcements` | Onboarding opt-in | Ping for releases |
| `@armaraos-user` | Onboarding | ArmaraOS desktop users |
| `@ainl-author` | Onboarding | AINL / MCP authors |
| `@contributor` | Manual / Level 15 XP | GitHub contributors |
| `@regular` | Level 5 XP | Active member |
| `@staff` | Manual | Mod commands |

## Onboarding questions (suggested)

1. **What brings you here?** → assigns `@armaraos-user` / `@ainl-author` / both
2. **Get release pings?** → `@announcements`
3. **Experience level?** → unlock `#dev-rust` / `#dev-python` for advanced

## Bot config mapping

After creating channels/roles, paste IDs into `config/default.json`:

- `channels.welcome` → `#introductions` or `#start-here`
- `channels.releases` → `#releases`
- `channels.modLog` → `#mod-log`
- `channels.staffSupport` → `#staff-support`
- `channels.showcase` → `#showcase`
- `channels.communityHighlights` → `#announcements` or `#general`
- `faq.channelIds` → `#help` forum ID
- `roles.staffIds` → `@staff` role ID(s)

## Permission baseline

- `@everyone`: send in community channels, no Manage Server
- Bot role: above level roles, Manage Threads, Send Messages, Embed Links, Read History, Add Reactions
- `#announcements`: only staff + bot can post

## Pin in `#start-here`

```
Welcome to ArmaraOS + AINL!

1. Run /start — pick your path
2. Search docs: /docs query:your topic
3. Stuck? Post in #help (include OS, versions, logs)
4. This community bot ≠ a personal ArmaraOS agent (separate bots/tokens)
```
