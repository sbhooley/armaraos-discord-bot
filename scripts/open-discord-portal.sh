#!/usr/bin/env bash
APP_ID="1520046217583919194"
echo "Opening ArmaraOSDBot developer pages..."
open "https://discord.com/developers/applications/${APP_ID}/bot" 2>/dev/null || xdg-open "https://discord.com/developers/applications/${APP_ID}/bot" 2>/dev/null
sleep 1
open "https://discord.com/api/oauth2/authorize?client_id=${APP_ID}&permissions=363193298112&scope=bot%20applications.commands" 2>/dev/null || true
echo ""
echo "1. Bot tab → Reset Token → copy token"
echo "2. Enable Server Members + Message Content intents → Save"
echo "3. Invite tab should have opened — pick your server → Authorize"
echo "4. Discord → right-click server → Copy Server ID"
echo ""
echo "Then run (paste token + guild id — do NOT share token in chat):"
echo "  npm run finish -- YOUR_BOT_TOKEN YOUR_GUILD_ID"
echo ""
