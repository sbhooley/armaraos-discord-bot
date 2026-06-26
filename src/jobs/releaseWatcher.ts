import type { Client } from 'discord.js';
import { getConfig } from '../lib/config.js';
import {
  fetchNotifications,
  shouldPingRole,
} from '../services/notifications.js';
import { hasPostedRelease, markReleasePosted } from '../db/index.js';
import { brandEmbed } from '../lib/constants.js';
import { asSendable } from '../lib/channels.js';

export function startReleaseWatcher(client: Client): void {
  const { bot } = getConfig();
  if (!bot.releaseWatcher.enabled || !bot.channels.releases) return;

  const intervalMs = bot.releaseWatcher.intervalMinutes * 60 * 1000;

  const tick = async () => {
    const channelId = bot.channels.releases!;
    try {
      const notifications = await fetchNotifications();
      const channel = await client.channels.fetch(channelId).catch(() => null);
      const textChannel = asSendable(channel);
      if (!textChannel) return;

      for (const n of notifications.slice(0, 5)) {
        if (hasPostedRelease(n.id)) continue;

        let content = '';
        if (shouldPingRole(n, 'armaraos') && bot.roles.armaraosUserId) {
          content = `<@&${bot.roles.armaraosUserId}>`;
        } else if (shouldPingRole(n, 'announcements') && bot.roles.announcementsId) {
          content = `<@&${bot.roles.announcementsId}>`;
        }

        const embed = brandEmbed(n.title, n.body);
        if (n.action_url) embed.addFields({ name: 'Link', value: n.action_url });
        embed.setFooter({ text: `Published ${n.published_at.slice(0, 10)} · ${n.id}` });

        const msg = await textChannel.send({ content: content || undefined, embeds: [embed] });
        markReleasePosted(n.id, msg.id);
      }
    } catch (err) {
      client.emit('error', err instanceof Error ? err : new Error(String(err)));
    }
  };

  void tick();
  setInterval(() => void tick(), intervalMs);
}
