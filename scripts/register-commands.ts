import { REST, Routes } from 'discord.js';
import { config as loadEnv } from 'dotenv';

loadEnv();

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  console.error('DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID required');
  process.exit(1);
}

const commands = [
  { name: 'start', description: 'Get started with ArmaraOS and AINL' },
  { name: 'ping', description: 'Bot latency and uptime check' },
  { name: 'health', description: 'Ops health summary (staff)' },
  {
    name: 'docs',
    description: 'Search ainativelang.com documentation',
    options: [{ name: 'query', description: 'What to search for', type: 3, required: true }],
  },
  {
    name: 'release',
    description: 'Latest ArmaraOS / AINL product notifications',
    options: [
      {
        name: 'product',
        description: 'Filter by product',
        type: 3,
        choices: [
          { name: 'All', value: 'all' },
          { name: 'ArmaraOS', value: 'armaraos' },
          { name: 'AINL', value: 'ainl' },
        ],
      },
    ],
  },
  {
    name: 'ainl',
    description: 'AINL tooling',
    options: [
      {
        name: 'validate',
        description: 'Validate AINL source',
        type: 1,
        options: [{ name: 'source', description: 'AINL source', type: 3, required: true }],
      },
    ],
  },
  {
    name: 'ticket',
    description: 'Support tickets',
    options: [
      {
        name: 'open',
        type: 1,
        description: 'Open ticket',
        options: [
          {
            name: 'category',
            type: 3,
            required: true,
            choices: [
              { name: 'Install', value: 'Install' },
              { name: 'AINL', value: 'AINL' },
              { name: 'Bug', value: 'Bug' },
              { name: 'Other', value: 'Other' },
            ],
          },
          { name: 'summary', type: 3, required: true, description: 'Issue summary' },
        ],
      },
      { name: 'close', type: 1, description: 'Close ticket thread' },
    ],
  },
  {
    name: 'warn',
    description: 'Warn a member (staff)',
    options: [
      { name: 'user', type: 6, required: true },
      { name: 'reason', type: 3, required: true },
    ],
  },
  {
    name: 'warnings',
    description: 'View warnings (staff)',
    options: [{ name: 'user', type: 6, required: true }],
  },
  {
    name: 'rank',
    description: 'XP rank or leaderboard',
    options: [
      { name: 'user', type: 6, required: false },
      { name: 'leaderboard', type: 5, required: false },
    ],
  },
  {
    name: 'link',
    description: 'Link external accounts',
    options: [
      {
        name: 'github',
        type: 1,
        options: [
          { name: 'username', type: 3, required: true },
          { name: 'code', type: 3, required: false },
        ],
      },
    ],
  },
  { name: 'doctor', description: 'Install / environment checklist' },
  {
    name: 'assist',
    description: 'Staff assist draft via ArmaraOS',
    options: [
      { name: 'context', type: 3, required: true },
      { name: 'agent', type: 3, required: false },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(token);

if (guildId) {
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
  console.log(`Registered ${commands.length} guild commands on ${guildId}`);
} else {
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log(`Registered ${commands.length} global commands`);
}
