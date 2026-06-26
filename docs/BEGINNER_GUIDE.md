# Beginner guide — zero prior Discord bot experience

You only need to do **one interactive command**. It asks you to paste 3 values from Discord; everything else is automatic.

## The one command

Open Terminal and run:

```bash
cd ~/Desktop/Projects/armaraos-discord-bot
npm run setup
```

The wizard will pause and tell you exactly what to copy. Follow the on-screen steps.

---

## Where to get the 3 values (with links)

### A) Bot token + Application ID

1. Open **[Discord Developer Portal](https://discord.com/developers/applications)** (log in with your Discord account).
2. Click **New Application** → name: `Armara Community Bot` → Create.
3. Left sidebar → **Bot** → **Reset Token** → **Copy** → paste when setup asks for **BOT TOKEN**.
4. On the same Bot page, scroll to **Privileged Gateway Intents** → turn **ON**:
   - Server Members Intent
   - Message Content Intent  
   → click **Save Changes**.
5. Left sidebar → **General Information** → copy **Application ID** → paste when setup asks for **CLIENT_ID**.

### B) Invite bot to your server

The setup wizard prints an **invite link**. Click it → choose your server → Authorize.

If you don't have a server yet:
- Discord → **+** (Add a Server) → **Create My Own** → **For me and my friends** → name it e.g. `ArmaraOS Community`.

### C) Server (Guild) ID

1. Discord → **User Settings** (gear) → **Advanced** → enable **Developer Mode**.
2. Right-click your **server icon** (left sidebar) → **Copy Server ID**.
3. Paste when setup asks for **GUILD ID**.

---

## After setup finishes

```bash
npm run dev
```

In Discord, type:

- `/ping`
- `/start`
- `/docs` with query `install armaraos`

---

## Optional: create channels first (recommended)

If your server is empty, create these text channels before `npm run setup` so auto-detect works:

- `#releases`
- `#introductions`
- `#mod-log`
- `#help` (forum channel if possible)
- `#showcase`

Full layout: [SERVER_TEMPLATE.md](./SERVER_TEMPLATE.md)

---

## GitHub repo

Already set up at: **https://github.com/sbhooley/armaraos-discord-bot** (if push succeeded).

---

## I can't paste secrets in Terminal

Create `.env` manually:

```bash
cp .env.example .env
open -e .env   # TextEdit on Mac
```

Fill in `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, then run:

```bash
npm run register-commands
npm run dev
```

---

## Still stuck?

Run setup again — it's safe to re-run. Or ask in chat with a screenshot of the Developer Portal **Bot** page (blur the token).
