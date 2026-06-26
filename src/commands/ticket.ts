import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChannelType, ThreadAutoArchiveDuration, type TextChannel } from 'discord.js';
import { brandEmbed } from '../lib/constants.js';
import { createTicket, getOpenTicket } from '../db/index.js';
import { getConfig } from '../lib/config.js';

@ApplyOptions({
  name: 'ticket',
  description: 'Open or close a support ticket (private thread)',
})
export class TicketCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommand((sub) =>
          sub
            .setName('open')
            .setDescription('Open a support ticket')
            .addStringOption((opt) =>
              opt
                .setName('category')
                .setDescription('Ticket category')
                .setRequired(true)
                .addChoices(
                  { name: 'Install', value: 'Install' },
                  { name: 'AINL', value: 'AINL' },
                  { name: 'Bug', value: 'Bug' },
                  { name: 'Other', value: 'Other' },
                ),
            )
            .addStringOption((opt) =>
              opt.setName('summary').setDescription('Brief description of your issue').setRequired(true),
            ),
        )
        .addSubcommand((sub) =>
          sub.setName('close').setDescription('Close this ticket thread (staff or opener)'),
        ),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'open') {
      await this.openTicket(interaction);
    } else {
      await this.closeTicket(interaction);
    }
  }

  private async openTicket(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.channel) {
      await interaction.reply({ content: 'Guild channel required.', ephemeral: true });
      return;
    }

    const category = interaction.options.getString('category', true);
    const summary = interaction.options.getString('summary', true);

    const parent =
      interaction.channel.isThread() ? interaction.channel.parent : interaction.channel;
    if (!parent || !('threads' in parent)) {
      await interaction.reply({ content: 'Run this in a text or forum channel.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    if (parent.type !== ChannelType.GuildText) {
      await interaction.editReply({
        content: 'Open tickets from a **text** channel (not voice/stage). For forum support, create a post in #help.',
      });
      return;
    }

    const textParent = parent as TextChannel;
    const thread = await textParent.threads.create({
      name: `ticket-${category.toLowerCase()}-${interaction.user.username}`.slice(0, 100),
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      type: ChannelType.PrivateThread,
      reason: `Support ticket: ${category}`,
    });

    await thread.members.add(interaction.user.id);
    createTicket(thread.id, interaction.user.id, category);

    const embed = brandEmbed(`Ticket — ${category}`, summary).addFields({
      name: 'Next steps',
      value: 'Include logs, OS, ArmaraOS version, and what you already tried. Staff will join shortly.',
    });

    await thread.send({ content: `<@${interaction.user.id}>`, embeds: [embed] });
    await interaction.editReply({ content: `Ticket opened: ${thread}` });
  }

  private async closeTicket(interaction: Command.ChatInputCommandInteraction) {
    if (!interaction.channel?.isThread()) {
      await interaction.reply({ content: 'Run `/ticket close` inside the ticket thread.', ephemeral: true });
      return;
    }

    const ticket = getOpenTicket(interaction.channel.id);
    if (!ticket) {
      await interaction.reply({ content: 'No open ticket record for this thread.', ephemeral: true });
      return;
    }

    const isOpener = ticket.opener_id === interaction.user.id;
    const { isStaff } = await import('../lib/staff.js');
    const member = interaction.member;
    const guildMember =
      member && 'roles' in member
        ? member
        : await interaction.guild!.members.fetch(interaction.user.id).catch(() => null);
    if (!isOpener && !isStaff(guildMember)) {
      await interaction.reply({ content: 'Only the opener or staff can close this ticket.', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    const { buildTranscriptHtml } = await import('../services/transcripts.js');
    const html = await buildTranscriptHtml(interaction.channel);
    const { closeTicket } = await import('../db/index.js');
    closeTicket(interaction.channel.id, html);

    const { bot } = getConfig();
    if (bot.channels.modLog) {
      const modChannel = await interaction.guild?.channels.fetch(bot.channels.modLog).catch(() => null);
      if (modChannel?.isTextBased()) {
        const buffer = Buffer.from(html, 'utf8');
        await modChannel.send({
          content: `Ticket closed: ${interaction.channel.name} by <@${interaction.user.id}>`,
          files: [{ attachment: buffer, name: `transcript-${interaction.channel.id}.html` }],
        });
      }
    }

    await interaction.channel.setArchived(true);
    await interaction.editReply({ content: 'Ticket closed. Transcript saved.' });
  }
}
