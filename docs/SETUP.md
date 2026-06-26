# ArmaraOS Discord Bot — Setup Guide

## 1. Discord Developer Portal

Create a **separate** application from any ArmaraOS personal agent bot.

1. [Discord Developer Portal](https://discord.com/developers/applications) → **New Application** → `Armara Community Bot`
2. **Bot** → Add Bot → copy token → `DISCORD_BOT_TOKEN` in `.env`
3. **Privileged Gateway Intents** — enable:
   - Server Members Intent
   - Message Content Intent
4. **OAuth2 → URL Generator** — scopes: `bot`, `applications.commands`
5. Permissions: Manage Threads, Send Messages, Embed Links, Read Message History, Moderate Members (optional), Manage Roles (for level rewards)
6. Copy **Application ID** → `DISCORD_CLIENT_ID`
7. Invite to your staging server

> **Critical:** Do not use the same token as ArmaraOS `[channels.discord]`. See [channel-adapters.md](https://github.com/sbhooley/armaraos/blob/main/docs/channel-adapters.md).

## 2. Enable Discord Community (server settings)

1. Server Settings → **Enable Community**
2. Set rules channel, mod channel, community updates channel
3. **Onboarding** — roles: `@announcements`, `@armaraos-user`, `@ainl-author`, `@contributor`
4. **AutoMod** — enable baseline spam/slur filters (native Discord)
5. Create **forum** channel `#help` for support

See [docs/SERVER_TEMPLATE.md](./SERVER_TEMPLATE.md) for full channel layout.

## 3. Configure the bot

```bash
cd ~/Desktop/Projects/armaraos-discord-bot
cp .env.example .env
# Edit .env — at minimum DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID
```

Edit `config/default.json` — set channel and role IDs (right-click channel/role in Discord → Copy ID; needs Developer Mode):

```json
{
  "channels": {
    "welcome": "CHANNEL_ID",
    "releases": "CHANNEL_ID",
    "modLog": "CHANNEL_ID",
    "staffSupport": "CHANNEL_ID",
    "communityHighlights": "CHANNEL_ID",
    "showcase": "CHANNEL_ID"
  },
  "roles": {
    "staffIds": ["ROLE_ID"],
    "regularId": "ROLE_ID",
    "contributorId": "ROLE_ID",
    "announcementsId": "ROLE_ID",
    "armaraosUserId": "ROLE_ID"
  },
  "faq": {
    "channelIds": ["HELP_FORUM_ID_OR_SUPPORT_CHANNEL"]
  }
}
```

## 4. Install and run

```bash
npm install
npm run db:migrate
npm run register-commands   # guild-scoped if DISCORD_GUILD_ID set
npm run dev
```

Production:

```bash
npm run build
npm start
```

## 5. Optional integrations

| Feature | Env / setup |
|---------|-------------|
| `/ainl validate` | `ainl serve --host 127.0.0.1 --port 8765` + `AINL_VALIDATE_URL=http://127.0.0.1:8765/validate` |
| `/assist` staff bridge | ArmaraOS daemon running + `ARMARAOS_API_BASE` + `ARMARAOS_API_KEY` |
| Release auto-post | Set `channels.releases` in config |

## 6. Deploy (systemd example)

```bash
# scripts/install-systemd.sh — edit User/WorkingDirectory first
sudo ./scripts/install-systemd.sh
sudo systemctl enable --now armaraos-discord-bot
```

## 7. Slash commands reference

| Command | Who | Purpose |
|---------|-----|---------|
| `/start` | Everyone | Onboarding paths |
| `/docs` | Everyone | Search ainativelang docs |
| `/release` | Everyone | Product notifications |
| `/doctor` | Everyone | Install checklist |
| `/ainl validate` | Everyone | Strict AINL validation |
| `/ticket open/close` | Everyone / staff | Support threads |
| `/rank` | Everyone | XP + leaderboard |
| `/link github` | Everyone | GitHub gist verification |
| `/warn`, `/warnings` | Staff | Moderation |
| `/assist`, `/health` | Staff | Agent draft + ops |

## 8. Verify

```bash
npm run typecheck
# In Discord: /ping, /start, /docs query:armaraos install
```
