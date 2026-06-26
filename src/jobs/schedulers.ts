import type { Client } from 'discord.js';
import cron from 'node-cron';
import { getConfig } from '../lib/config.js';
import { fetchNotifications, filterNotifications } from '../services/notifications.js';
import { brandEmbed } from '../lib/constants.js';
import { asSendable } from '../lib/channels.js';

export function startWeeklyDigest(client: Client): void {
  const { bot } = getConfig();
  if (!bot.weeklyDigest.enabled) return;

  const channelId = bot.channels.communityHighlights ?? bot.channels.releases;
  if (!channelId) return;

  cron.schedule(bot.weeklyDigest.cron, async () => {
    try {
      const channel = await client.channels.fetch(channelId).catch(() => null);
      const textChannel = asSendable(channel);
      if (!textChannel) return;

      const all = await fetchNotifications();
      const armara = filterNotifications(all, 'armaraos').slice(0, 3);
      const ainl = filterNotifications(all, 'ainl').slice(0, 3);

      const embed = brandEmbed('Weekly digest — ArmaraOS + AINL');
      if (armara.length) {
        embed.addFields({
          name: 'ArmaraOS',
          value: armara.map((n) => `• [${n.title}](${n.action_url ?? 'https://www.ainativelang.com/armaraos'})`).join('\n'),
        });
      }
      if (ainl.length) {
        embed.addFields({
          name: 'AINL',
          value: ainl.map((n) => `• ${n.title}`).join('\n'),
        });
      }
      embed.setFooter({ text: 'Full changelog: ainativelang.com/changelog' });
      await textChannel.send({ embeds: [embed] });
    } catch (err) {
      client.emit('error', err instanceof Error ? err : new Error(String(err)));
    }
  });
}

export function startShowcasePrompt(client: Client): void {
  const { bot } = getConfig();
  if (!bot.showcasePrompt.enabled) return;

  const channelId = bot.channels.showcase;
  if (!channelId) return;

  cron.schedule(bot.showcasePrompt.cron, async () => {
    try {
      const channel = await client.channels.fetch(channelId).catch(() => null);
      const textChannel = asSendable(channel);
      if (!textChannel) return;

      await textChannel.send({
        embeds: [
          brandEmbed(
            'Weekly showcase',
            'What did you build with **AINL** or **ArmaraOS** this week?\n\nShare a screenshot, repo link, or `.ainl` snippet. Use `/ainl validate` to check syntax!',
          ),
        ],
      });
    } catch (err) {
      client.emit('error', err instanceof Error ? err : new Error(String(err)));
    }
  });
}
