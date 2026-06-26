import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getConfig } from '../lib/config.js';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const { env } = getConfig();
    const dir = dirname(env.DATABASE_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    db = new Database(env.DATABASE_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    migrate(db);
  }
  return db;
}

function migrate(database: Database.Database): void {
  const schemaPath = join(dirname(fileURLToPath(import.meta.url)), 'schema.sql');
  database.exec(readFileSync(schemaPath, 'utf8'));
}

export function kvGet(key: string): string | null {
  const row = getDb().prepare('SELECT value FROM kv_store WHERE key = ?').get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

export function kvSet(key: string, value: string): void {
  getDb()
    .prepare('INSERT INTO kv_store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, value);
}

// --- Members ---

export interface MemberRow {
  discord_id: string;
  username: string;
  xp: number;
  helpful_count: number;
  warning_count: number;
  github_username: string | null;
  joined_at: string;
  last_xp_at: string | null;
}

export function upsertMember(discordId: string, username: string): MemberRow {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO members (discord_id, username, joined_at)
       VALUES (?, ?, ?)
       ON CONFLICT(discord_id) DO UPDATE SET username = excluded.username`,
    )
    .run(discordId, username, now);
  return getMember(discordId)!;
}

export function getMember(discordId: string): MemberRow | null {
  return (
    (getDb().prepare('SELECT * FROM members WHERE discord_id = ?').get(discordId) as MemberRow | undefined) ??
    null
  );
}

export function addXp(discordId: string, amount: number): MemberRow {
  getDb().prepare('UPDATE members SET xp = xp + ?, last_xp_at = ? WHERE discord_id = ?').run(
    amount,
    new Date().toISOString(),
    discordId,
  );
  return getMember(discordId)!;
}

export function incrementHelpful(discordId: string, xpBonus: number): void {
  getDb()
    .prepare('UPDATE members SET helpful_count = helpful_count + 1, xp = xp + ? WHERE discord_id = ?')
    .run(xpBonus, discordId);
}

export function getLeaderboard(limit = 10): MemberRow[] {
  return getDb()
    .prepare('SELECT * FROM members ORDER BY xp DESC LIMIT ?')
    .all(limit) as MemberRow[];
}

// --- Warnings ---

export function addWarning(userId: string, modId: string, reason: string): number {
  const result = getDb()
    .prepare('INSERT INTO warnings (user_id, mod_id, reason, created_at) VALUES (?, ?, ?, ?)')
    .run(userId, modId, reason, new Date().toISOString());
  getDb().prepare('UPDATE members SET warning_count = warning_count + 1 WHERE discord_id = ?').run(userId);
  return Number(result.lastInsertRowid);
}

export function getWarnings(userId: string): Array<{ id: number; mod_id: string; reason: string; created_at: string }> {
  return getDb()
    .prepare('SELECT id, mod_id, reason, created_at FROM warnings WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as Array<{ id: number; mod_id: string; reason: string; created_at: string }>;
}

// --- Tickets ---

export function createTicket(threadId: string, openerId: string, category: string): number {
  const result = getDb()
    .prepare(
      'INSERT INTO tickets (thread_id, opener_id, category, created_at) VALUES (?, ?, ?, ?)',
    )
    .run(threadId, openerId, category, new Date().toISOString());
  return Number(result.lastInsertRowid);
}

export function closeTicket(threadId: string, transcriptHtml: string): void {
  getDb()
    .prepare(
      'UPDATE tickets SET status = ?, closed_at = ?, transcript_html = ? WHERE thread_id = ?',
    )
    .run('closed', new Date().toISOString(), transcriptHtml, threadId);
}

export function getOpenTicket(threadId: string): { id: number; category: string; opener_id: string } | null {
  return (
    (getDb()
      .prepare('SELECT id, category, opener_id FROM tickets WHERE thread_id = ? AND status = ?')
      .get(threadId, 'open') as { id: number; category: string; opener_id: string } | undefined) ?? null
  );
}

// --- FAQ hits ---

export function recordFaqHit(
  query: string,
  faqId: string | null,
  confidence: number,
  channelId: string,
  messageId?: string,
): void {
  getDb()
    .prepare(
      'INSERT INTO faq_hits (query, faq_id, confidence, channel_id, message_id, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(query, faqId, confidence, channelId, messageId ?? null, new Date().toISOString());
}

// --- Release posts ---

export function hasPostedRelease(notificationId: string): boolean {
  return !!getDb().prepare('SELECT 1 FROM release_posts WHERE notification_id = ?').get(notificationId);
}

export function markReleasePosted(notificationId: string, messageId: string): void {
  getDb()
    .prepare('INSERT INTO release_posts (notification_id, message_id, posted_at) VALUES (?, ?, ?)')
    .run(notificationId, messageId, new Date().toISOString());
}

// --- GitHub links ---

export function setGithubLink(discordId: string, username: string, verifyCode: string): void {
  getDb()
    .prepare(
      `INSERT INTO github_links (discord_id, github_username, verify_code, verified, linked_at)
       VALUES (?, ?, ?, 0, ?)
       ON CONFLICT(discord_id) DO UPDATE SET github_username = excluded.github_username, verify_code = excluded.verify_code, verified = 0`,
    )
    .run(discordId, username, verifyCode, new Date().toISOString());
}

export function verifyGithubLink(discordId: string): boolean {
  const row = getDb()
    .prepare('SELECT github_username FROM github_links WHERE discord_id = ? AND verified = 1')
    .get(discordId) as { github_username: string } | undefined;
  return !!row;
}

export function markGithubVerified(discordId: string): void {
  getDb().prepare('UPDATE github_links SET verified = 1 WHERE discord_id = ?').run(discordId);
  const link = getDb()
    .prepare('SELECT github_username FROM github_links WHERE discord_id = ?')
    .get(discordId) as { github_username: string };
  getDb().prepare('UPDATE members SET github_username = ? WHERE discord_id = ?').run(
    link.github_username,
    discordId,
  );
}

export function getGithubLink(discordId: string): { github_username: string; verify_code: string; verified: number } | null {
  return (
    (getDb()
      .prepare('SELECT github_username, verify_code, verified FROM github_links WHERE discord_id = ?')
      .get(discordId) as { github_username: string; verify_code: string; verified: number } | undefined) ?? null
  );
}
