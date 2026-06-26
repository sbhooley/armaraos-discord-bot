import { appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { getConfig } from './config.js';

export function logEvent(type: string, payload: Record<string, unknown>): void {
  const { env } = getConfig();
  const dir = dirname(env.EVENT_LOG_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  appendFileSync(
    env.EVENT_LOG_PATH,
    `${JSON.stringify({ ts: new Date().toISOString(), type, ...payload })}\n`,
  );
}
