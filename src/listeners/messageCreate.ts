import { Listener } from '@sapphire/framework';
import { ChannelType, Events, type Message } from 'discord.js';
import { getConfig } from '../lib/config.js';
import { matchFaq } from '../services/faq.js';
import { recordFaqHit, addXp, getMember, upsertMember } from '../db/index.js';
import { scanForScam } from '../services/scamShield.js';
import { searchDocs } from '../services/docsSearch.js';
import { brandEmbed, WARN_COLOR, levelFromXp } from '../lib/constants.js';
import { logEvent } from '../lib/eventLog.js';

export class MessageCreateListener extends Listener<typeof Events.MessageCreate> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.MessageCreate });
  }

  public override async run(message: Message) {
    if (message.author.bot || !message.guild || !message.member) return;

    upsertMember(message.author.id, message.author.username);
    await this.handleScamShield(message);
    await this.handleXp(message);
    await this.handleFaqAssist(message);
  }

  private async handleScamShield(message: Message) {
    const { bot } = getConfig();
    if (!bot.scamShield.enabled) return;

    const scan = scanForScam(message.content);
    if (!scan.flagged) return;

    logEvent('scam_flagged', { userId: message.author.id, reasons: scan.reasons, messageId: message.id });

    if (bot.scamShield.deleteMessage && message.deletable) {
      await message.delete().catch(() => null);
    }

    if (bot.scamShield.warnUser) {
      const embed = brandEmbed('Message removed — safety filter');
      embed.setColor(WARN_COLOR);
      embed.setDescription(
        `Your message matched community safety rules (${scan.reasons.join(', ')}). Official links only: ainativelang.com`,
      );
      await message.author.send({ embeds: [embed] }).catch(() => null);
    }

    if (bot.channels.modLog) {
      const ch = await message.guild!.channels.fetch(bot.channels.modLog).catch(() => null);
      if (ch?.isTextBased()) {
        await ch.send(
          `🛡️ Scam filter: <@${message.author.id}> in ${message.channel} — ${scan.reasons.join(', ')}`,
        );
      }
    }
  }

  private async handleXp(message: Message) {
    const { bot } = getConfig();
    if (!bot.xp.enabled) return;

    const member = getMember(message.author.id);
    const now = Date.now();
    if (member?.last_xp_at) {
      const last = new Date(member.last_xp_at).getTime();
      if (now - last < bot.xp.cooldownMs) return;
    }

    const amount =
      bot.xp.messageXpMin +
      Math.floor(Math.random() * (bot.xp.messageXpMax - bot.xp.messageXpMin + 1));
    const updated = addXp(message.author.id, amount);
    const newLevel = levelFromXp(updated.xp);
    const oldLevel = levelFromXp(updated.xp - amount);
    if (newLevel > oldLevel) {
      await this.applyLevelRoles(message, newLevel);
    }
  }

  private async applyLevelRoles(message: Message, level: number) {
    const { bot } = getConfig();
    for (const [lvl, roleKey] of Object.entries(bot.xp.levelRoleThresholds)) {
      if (level >= Number(lvl)) {
        const roleId =
          roleKey === 'regularId'
            ? bot.roles.regularId
            : roleKey === 'contributorId'
              ? bot.roles.contributorId
              : null;
        if (roleId && !message.member!.roles.cache.has(roleId)) {
          await message.member!.roles.add(roleId).catch(() => null);
        }
      }
    }
  }

  private async handleFaqAssist(message: Message) {
    const { bot } = getConfig();
    const inFaqChannel =
      bot.faq.channelIds.includes(message.channel.id) ||
      (bot.faq.assistInHelpForum &&
        message.channel.type === ChannelType.PublicThread &&
        message.channel.parent?.type === ChannelType.GuildForum);

    if (!inFaqChannel) return;
    if (message.content.length < 12) return;

    const match = matchFaq(message.content);
    if (match && match.confidence >= bot.faq.confidenceThreshold) {
      recordFaqHit(message.content, match.entry.id, match.confidence, message.channel.id, message.id);
      const links = match.entry.links.map((l) => `[doc](${l})`).join(' · ');
      const embed = brandEmbed('Suggested answer', match.entry.answer.trim()).setFooter({
        text: `FAQ match · confidence ${(match.confidence * 100).toFixed(0)}%`,
      });
      if (links) embed.addFields({ name: 'Sources', value: links });
      await message.reply({ embeds: [embed] });
      return;
    }

    if (message.content.trim().endsWith('?')) {
      const docs = await searchDocs(message.content, 2);
      if (docs.length > 0) {
        recordFaqHit(message.content, null, 0.7, message.channel.id, message.id);
        const embed = brandEmbed('Docs that might help');
        for (const d of docs) {
          embed.addFields({ name: d.title, value: `[Open](${d.href})` });
        }
        await message.reply({ embeds: [embed] });
      }
    }
  }
}
