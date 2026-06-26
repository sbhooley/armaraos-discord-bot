#!/usr/bin/env node
/**
 * Finish setup when CLIENT_ID is already known.
 * Usage:
 *   DISCORD_BOT_TOKEN=xxx DISCORD_GUILD_ID=yyy node scripts/finish-setup.mjs
 * Or: npm run finish -- <token> <guildId>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');
const configPath = join(root, 'config', 'default.json');
const CLIENT_ID = '1520046217583919194';

const token = process.argv[2] || process.env.DISCORD_BOT_TOKEN;
const guildId = process.argv[3] || process.env.DISCORD_GUILD_ID;

if (!token || token.length < 20) {
  console.error('Missing DISCORD_BOT_TOKEN.');
  console.error('Get it: https://discord.com/developers/applications/1520046217583919194/bot → Reset Token');
  console.error('Then: npm run finish -- YOUR_TOKEN YOUR_GUILD_ID');
  process.exit(1);
}
if (!guildId) {
  console.error('Missing DISCORD_GUILD_ID (right-click server → Copy Server ID).');
  process.exit(1);
}

async function discordGet(path) {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}: ${(await res.text()).slice(0, 150)}`);
  return res.json();
}

function findChannel(channels, ...names) {
  for (const name of names) {
    const n = name.toLowerCase();
    const hit = channels.find(
      (c) => c.name?.toLowerCase() === n || c.name?.toLowerCase().includes(n),
    );
    if (hit) return hit.id;
  }
  return null;
}

function findRole(roles, ...names) {
  for (const name of names) {
    const n = name.toLowerCase();
    const hit = roles.find((r) => r.name?.toLowerCase() === n || r.name?.toLowerCase().includes(n));
    if (hit) return hit.id;
  }
  return null;
}

const envLines = readFileSync(envPath, 'utf8')
  .split('\n')
  .filter((l) => !l.startsWith('DISCORD_BOT_TOKEN=') && !l.startsWith('DISCORD_GUILD_ID='));
writeFileSync(
  envPath,
  [
    '# ArmaraOSDBot',
    `DISCORD_BOT_TOKEN=${token}`,
    `DISCORD_CLIENT_ID=${CLIENT_ID}`,
    `DISCORD_GUILD_ID=${guildId}`,
    ...envLines.filter((l) => !l.startsWith('DISCORD_CLIENT_ID=')),
  ]
    .filter(Boolean)
    .join('\n') + '\n',
);

console.log('✓ Updated .env');

const me = await discordGet('/users/@me');
console.log(`✓ Bot: ${me.username}`);

const channels = await discordGet(`/guilds/${guildId}/channels`);
const roles = await discordGet(`/guilds/${guildId}/roles`);

const helpForum =
  channels.find((c) => c.type === 15 && /help|support/.test(c.name?.toLowerCase() ?? '')) ??
  channels.find((c) => c.type === 15);

const config = JSON.parse(readFileSync(configPath, 'utf8'));
config.siteBaseUrl = 'https://www.ainativelang.com';
Object.assign(config.channels, {
  welcome: findChannel(channels, 'introductions', 'start-here', 'welcome', 'general'),
  releases: findChannel(channels, 'releases', 'announcements'),
  modLog: findChannel(channels, 'mod-log', 'modlog'),
  staffSupport: findChannel(channels, 'staff-support', 'staff'),
  communityHighlights: findChannel(channels, 'announcements', 'general'),
  showcase: findChannel(channels, 'showcase'),
});
config.roles.staffIds = [findRole(roles, 'staff', 'mod', 'admin')].filter(Boolean);
config.roles.regularId = findRole(roles, 'regular', 'active');
config.roles.contributorId = findRole(roles, 'contributor');
config.roles.announcementsId = findRole(roles, 'announcements');
config.roles.armaraosUserId = findRole(roles, 'armaraos', 'armara');
config.faq.channelIds = helpForum ? [helpForum.id] : config.faq.channelIds;

writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
console.log('✓ Updated config/default.json');

mkdirSync(join(root, 'data'), { recursive: true });
execSync('npm run db:migrate', { cwd: root, stdio: 'inherit', env: { ...process.env, DISCORD_BOT_TOKEN: token } });
execSync('npm run register-commands', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, DISCORD_BOT_TOKEN: token, DISCORD_CLIENT_ID: CLIENT_ID, DISCORD_GUILD_ID: guildId },
});

console.log('\n✅ Ready! Start with: npm run dev');
console.log('   Test in Discord: /ping  /start');
