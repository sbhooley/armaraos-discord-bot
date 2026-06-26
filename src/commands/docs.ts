import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { brandEmbed, truncate } from '../lib/constants.js';
import { searchDocs } from '../services/docsSearch.js';

@ApplyOptions({
  name: 'docs',
  description: 'Search ainativelang.com documentation',
})
export class DocsCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((opt) =>
          opt.setName('query').setDescription('What to search for').setRequired(true),
        ),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const query = interaction.options.getString('query', true);
    await interaction.deferReply();

    try {
      const results = await searchDocs(query, 3);
      if (results.length === 0) {
        await interaction.editReply({
          embeds: [
            brandEmbed('No docs found', `Try different terms or post in #help.\nQuery: \`${query}\``),
          ],
        });
        return;
      }

      const embed = brandEmbed(`Docs: ${query}`).setFooter({
        text: 'Sources: ainativelang.com — post in #help if this did not help',
      });
      for (const [i, r] of results.entries()) {
        embed.addFields({
          name: `${i + 1}. ${truncate(r.title, 200)}`,
          value: `${truncate(r.description, 200) || '—'}\n[Open doc](${r.href})`,
        });
      }
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({
        content: `Docs search failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      });
    }
  }
}
