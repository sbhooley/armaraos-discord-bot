import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type MessageActionRowComponentBuilder,
} from 'discord.js';
import { brandEmbed } from '../lib/constants.js';
import { logEvent } from '../lib/eventLog.js';
import { getConfig } from '../lib/config.js';

@ApplyOptions({
  name: 'start',
  description: 'Get started with ArmaraOS and AINL',
})
export class StartCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { bot } = getConfig();
    logEvent('start_command', { userId: interaction.user.id, guildId: interaction.guildId });

    const embed = brandEmbed(
      'Welcome to ArmaraOS + AINL',
      'Pick a path below. Goal: first success in under 10 minutes.',
    )
      .addFields(
        {
          name: 'Install ArmaraOS',
          value: '[Download desktop + daemon](https://www.ainativelang.com/armaraos)',
        },
        {
          name: 'Learn AINL',
          value: '[Quickstart](https://www.ainativelang.com/quickstart) · [Docs](https://www.ainativelang.com/docs)',
        },
        {
          name: 'Get help',
          value: 'Post in the **#help** forum with logs + what you tried. Use `/docs` to search docs first.',
        },
        {
          name: 'Contribute',
          value: '[ainativelang on GitHub](https://github.com/sbhooley/ainativelang) · [armaraos on GitHub](https://github.com/sbhooley/armaraos)',
        },
      )
      .setFooter({ text: 'ArmaraOSDBot · Community bot ≠ personal ArmaraOS agent (separate tokens)' });

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Download ArmaraOS')
        .setStyle(ButtonStyle.Link)
        .setURL('https://www.ainativelang.com/armaraos'),
      new ButtonBuilder()
        .setLabel('AINL Quickstart')
        .setStyle(ButtonStyle.Link)
        .setURL('https://www.ainativelang.com/quickstart'),
      new ButtonBuilder()
        .setLabel('Docs search')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('start:docs_hint'),
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
}
