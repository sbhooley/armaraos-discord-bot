import { getConfig } from '../lib/config.js';

export interface ValidateResult {
  ok: boolean;
  diagnostics?: Array<{ message: string; kind?: string; suggested_fix?: string }>;
  error?: string;
}

export async function validateAinl(source: string, strict = true): Promise<ValidateResult> {
  const { env } = getConfig();
  const url = env.AINL_VALIDATE_URL ?? 'http://127.0.0.1:8765/validate';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, strict }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      return { ok: false, error: `validate HTTP ${res.status}` };
    }
    const data = (await res.json()) as {
      ok?: boolean;
      diagnostics?: Array<{ message: string; kind?: string; suggested_fix?: string }>;
      errors?: Array<{ message: string; kind?: string; suggested_fix?: string }>;
    };
    const diagnostics = data.diagnostics ?? data.errors ?? [];
    return { ok: !!data.ok, diagnostics };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'validate request failed',
    };
  }
}

export const DOCTOR_CHECKLIST = [
  {
    id: 'discord-token',
    label: 'Separate community bot token from ArmaraOS daemon `[channels.discord]` token',
    doc: 'https://github.com/sbhooley/armaraos/blob/main/docs/channel-adapters.md',
  },
  {
    id: 'armaraos-install',
    label: 'ArmaraOS installed from ainativelang.com/armaraos (official builds only)',
    doc: 'https://www.ainativelang.com/armaraos',
  },
  {
    id: 'ainl-mcp',
    label: 'MCP ainl_run: pass adapters.enable for http/fs/cache/sqlite when IR uses them',
    doc: 'https://github.com/sbhooley/ainativelang/blob/main/AGENTS.md',
  },
  {
    id: 'daemon-health',
    label: 'ArmaraOS daemon responds on GET /api/health (default http://127.0.0.1:4200)',
    doc: 'https://github.com/sbhooley/armaraos/blob/main/docs/troubleshooting.md',
  },
  {
    id: 'message-content',
    label: 'Discord bot has Message Content Intent enabled in Developer Portal',
    doc: 'https://discord.com/developers/docs/events/gateway#message-content-intent',
  },
] as const;
