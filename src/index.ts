import '@sapphire/plugin-logger/register';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';
import { getConfig } from './lib/config.js';
import { getDb } from './db/index.js';
import { startReleaseWatcher } from './jobs/releaseWatcher.js';
import { startShowcasePrompt, startWeeklyDigest } from './jobs/schedulers.js';

const { env } = getConfig();

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  loadMessageCommandListeners: false,
  logger: {
    level: LogLevel.Info,
  },
});

client.once('ready', (c) => {
  c.logger.info(`Logged in as ${c.user.tag}`);
  getDb();
  startReleaseWatcher(c);
  startWeeklyDigest(c);
  startShowcasePrompt(c);
});

await client.login(env.DISCORD_BOT_TOKEN);
