import { Listener } from '@sapphire/framework';
import { AuditLogEvent, Colors, EmbedBuilder, Events } from 'discord.js';
import { getConfig } from '../lib/config.js';

export class GuildBanAddListener extends Listener<typeof Events.GuildBanAdd> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.GuildBanAdd });
  }

  public override async run(ban: import('discord.js').GuildBan) {
    await relayModAction(ban.guild, 'Ban', ban.user.id, ban.reason ?? 'No reason');
  }
}

export class GuildMemberRemoveListener extends Listener<typeof Events.GuildMemberRemove> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.GuildMemberRemove });
  }

  public override async run(member: import('discord.js').GuildMember | import('discord.js').PartialGuildMember) {
    if (!member.guild) return;
    const logs = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 }).catch(() => null);
    const kick = logs?.entries.first();
    if (kick && kick.target?.id === member.id && Date.now() - kick.createdTimestamp < 5000) {
      await relayModAction(member.guild, 'Kick', member.id, kick.reason ?? 'No reason', kick.executor?.id);
    }
  }
}

async function relayModAction(
  guild: import('discord.js').Guild,
  action: string,
  targetId: string,
  reason: string,
  modId?: string,
) {
  const { bot } = getConfig();
  if (!bot.channels.modLog) return;
  const channel = await guild.channels.fetch(bot.channels.modLog).catch(() => null);
  if (!channel?.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor(Colors.Red)
    .setTitle(`Mod action: ${action}`)
    .addFields(
      { name: 'User', value: `<@${targetId}>`, inline: true },
      { name: 'Moderator', value: modId ? `<@${modId}>` : 'Unknown', inline: true },
      { name: 'Reason', value: reason.slice(0, 1000) },
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}
