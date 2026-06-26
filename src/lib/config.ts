import { config as loadEnv } from 'dotenv';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

loadEnv();

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const envSchema = z.object({
  DISCORD_BOT_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_GUILD_ID: z.string().optional(),
  STAFF_ROLE_IDS: z.string().optional(),
  NOTIFICATIONS_URL: z.string().url().default('https://www.ainativelang.com/notifications'),
  DOCS_SEARCH_URL: z.string().url().default('https://www.ainativelang.com/api/docs/search'),
  DOCS_MANIFEST_URL: z
    .string()
    .url()
    .default('https://www.ainativelang.com/search/docs-manifest.json'),
  BLOG_FEED_URL: z.string().url().default('https://www.ainativelang.com/blog/feed.json'),
  ARMARAOS_API_BASE: z.string().url().default('http://127.0.0.1:4200'),
  ARMARAOS_API_KEY: z.string().optional(),
  AINL_VALIDATE_URL: z.string().url().optional(),
  DATABASE_PATH: z.string().default(join(rootDir, 'data', 'bot.db')),
  CONFIG_PATH: z.string().default(join(rootDir, 'config', 'default.json')),
  EVENT_LOG_PATH: z.string().default(join(rootDir, 'data', 'events.jsonl')),
});

export type Env = z.infer<typeof envSchema>;

export interface BotConfig {
  siteBaseUrl: string;
  channels: {
    welcome: string | null;
    releases: string | null;
    modLog: string | null;
    staffSupport: string | null;
    communityHighlights: string | null;
    showcase: string | null;
  };
  roles: {
    staffIds: string[];
    regularId: string | null;
    contributorId: string | null;
    announcementsId: string | null;
    armaraosUserId: string | null;
  };
  faq: {
    channelIds: string[];
    confidenceThreshold: number;
    assistInHelpForum: boolean;
    corpusPath: string;
  };
  xp: {
    enabled: boolean;
    messageXpMin: number;
    messageXpMax: number;
    helpfulReactionEmoji: string;
    helpfulReactionXp: number;
    cooldownMs: number;
    levelRoleThresholds: Record<string, string>;
  };
  scamShield: {
    enabled: boolean;
    deleteMessage: boolean;
    warnUser: boolean;
  };
  releaseWatcher: {
    enabled: boolean;
    intervalMinutes: number;
  };
  weeklyDigest: {
    enabled: boolean;
    cron: string;
  };
  showcasePrompt: {
    enabled: boolean;
    cron: string;
  };
  tickets: {
    categories: string[];
  };
}

function loadBotConfig(path: string): BotConfig {
  if (!existsSync(path)) {
    throw new Error(`Config not found: ${path}`);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as BotConfig;
}

let cached: { env: Env; bot: BotConfig } | null = null;

export function getConfig(): { env: Env; bot: BotConfig } {
  if (!cached) {
    const env = envSchema.parse(process.env);
    const bot = loadBotConfig(env.CONFIG_PATH);
    const staffFromEnv = env.STAFF_ROLE_IDS?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
    if (staffFromEnv.length > 0) {
      bot.roles.staffIds = [...new Set([...bot.roles.staffIds, ...staffFromEnv])];
    }
    cached = { env, bot };
  }
  return cached;
}

export function resolveCorpusPath(relativeOrAbsolute: string): string {
  if (relativeOrAbsolute.startsWith('/')) return relativeOrAbsolute;
  return join(rootDir, relativeOrAbsolute);
}

export { rootDir };
