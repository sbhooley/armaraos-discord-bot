import { getConfig } from '../lib/config.js';

export interface AssistResult {
  ok: boolean;
  draft?: string;
  error?: string;
}

export async function requestStaffAssist(prompt: string, agentName?: string): Promise<AssistResult> {
  const { env } = getConfig();
  const base = env.ARMARAOS_API_BASE.replace(/\/$/, '');

  try {
    const agentsRes = await fetch(`${base}/api/agents`, {
      headers: env.ARMARAOS_API_KEY ? { Authorization: `Bearer ${env.ARMARAOS_API_KEY}` } : {},
      signal: AbortSignal.timeout(10_000),
    });
    if (!agentsRes.ok) {
      return { ok: false, error: `ArmaraOS API unreachable (${agentsRes.status})` };
    }
    const agents = (await agentsRes.json()) as Array<{ id: string; name: string }>;
    const agent = agentName
      ? agents.find((a) => a.name === agentName || a.id === agentName)
      : agents[0];
    if (!agent) return { ok: false, error: 'No agent found on ArmaraOS daemon' };

    const msgRes = await fetch(`${base}/api/agents/${agent.id}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.ARMARAOS_API_KEY ? { Authorization: `Bearer ${env.ARMARAOS_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        message: `[Discord staff assist — draft only, do not execute tools]\n\n${prompt}`,
      }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!msgRes.ok) {
      return { ok: false, error: `Agent message failed (${msgRes.status})` };
    }
    const body = (await msgRes.json()) as { response?: string; message?: string };
    return { ok: true, draft: body.response ?? body.message ?? '(empty response)' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'bridge failed' };
  }
}

export async function checkArmaraHealth(): Promise<{ ok: boolean; detail: string }> {
  const { env } = getConfig();
  try {
    const res = await fetch(`${env.ARMARAOS_API_BASE.replace(/\/$/, '')}/api/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
    return { ok: true, detail: await res.text() };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : 'unreachable' };
  }
}
