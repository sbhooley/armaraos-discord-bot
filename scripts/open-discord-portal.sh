#!/usr/bin/env bash
# Opens Discord Developer Portal and the beginner guide.
open "https://discord.com/developers/applications" 2>/dev/null || xdg-open "https://discord.com/developers/applications" 2>/dev/null || echo "Open https://discord.com/developers/applications in your browser"
echo ""
echo "Next: run  npm run setup  in this folder and paste the 3 values when prompted."
echo "Guide: docs/BEGINNER_GUIDE.md"
