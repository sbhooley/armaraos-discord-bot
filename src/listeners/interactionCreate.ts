import { Listener } from '@sapphire/framework';
import { Events, type Interaction } from 'discord.js';
import { brandEmbed } from '../lib/constants.js';

export class InteractionCreateListener extends Listener<typeof Events.InteractionCreate> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.InteractionCreate });
  }

  public override async run(interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'start:docs_hint') {
      await interaction.reply({
        embeds: [
          brandEmbed('Docs search', 'Use `/docs query:your search terms` to search ainativelang.com documentation.'),
        ],
        ephemeral: true,
      });
    }
  }
}
