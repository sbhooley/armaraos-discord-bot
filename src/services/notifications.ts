import { getConfig } from '../lib/config.js';

export interface ProductNotification {
  id: string;
  title: string;
  body: string;
  severity: string;
  targets: string[];
  action_url?: string;
  published_at: string;
  priority?: number;
}

interface NotificationsPayload {
  schema_version?: number;
  notifications: ProductNotification[];
}

export async function fetchNotifications(): Promise<ProductNotification[]> {
  const { env } = getConfig();
  const res = await fetch(env.NOTIFICATIONS_URL, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`notifications fetch failed: ${res.status}`);
  const data = (await res.json()) as NotificationsPayload;
  return (data.notifications ?? []).sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );
}

export function filterNotifications(
  items: ProductNotification[],
  product: 'armaraos' | 'ainl' | 'all',
): ProductNotification[] {
  if (product === 'all') return items;
  const needle = product === 'armaraos' ? 'armaraos' : 'ainl';
  return items.filter(
    (n) =>
      n.title.toLowerCase().includes(needle) ||
      n.body.toLowerCase().includes(needle) ||
      n.targets.some((t) => t.toLowerCase().includes(needle)),
  );
}

export function shouldPingRole(notification: ProductNotification, roleKey: 'armaraos' | 'announcements'): boolean {
  const targets = notification.targets.map((t) => t.toLowerCase());
  if (roleKey === 'armaraos') {
    return targets.some((t) => t.includes('armaraos'));
  }
  return targets.includes('*') || targets.some((t) => t.includes('armaraos'));
}
