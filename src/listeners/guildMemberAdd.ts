import { Listener } from '@sapphire/framework';
import { Events, type GuildMember } from 'discord.js';
import { brandEmbed } from '../lib/constants.js';
import { getConfig } from '../lib/config.js';
import { upsertMember } from '../db/index.js';
import { logEvent } from '../lib/eventLog.js';

export class GuildMemberAddListener extends Listener<typeof Events.GuildMemberAdd> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.GuildMemberAdd });
  }

  public override async run(member: GuildMember) {
    upsertMember(member.id, member.user.username);
    logEvent('member_join', { userId: member.id, guildId: member.guild.id });

    const { bot } = getConfig();
    const channelId = bot.channels.welcome;
    if (!channelId) return;

    const channel = await member.guild.channels.fetch(channelId).catch(() => null);
    if (!channel?.isTextBased()) return;

    const embed = brandEmbed(`Welcome, ${member.user.username}!`)
      .setDescription(
        '**Start here:** run `/start` · search docs with `/docs` · get help in #help forum.',
      )
      .addFields({
        name: 'Install ArmaraOS',
        value: 'https://www.ainativelang.com/armaraos',
      });

    await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
  }
}
