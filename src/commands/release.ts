import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { brandEmbed } from '../lib/constants.js';
import { fetchNotifications, filterNotifications } from '../services/notifications.js';

@ApplyOptions({
  name: 'release',
  description: 'Latest ArmaraOS / AINL product notifications',
})
export class ReleaseCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((opt) =>
          opt
            .setName('product')
            .setDescription('Filter by product')
            .addChoices(
              { name: 'All', value: 'all' },
              { name: 'ArmaraOS', value: 'armaraos' },
              { name: 'AINL', value: 'ainl' },
            ),
        ),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const product = (interaction.options.getString('product') ?? 'all') as 'all' | 'armaraos' | 'ainl';
    await interaction.deferReply();

    try {
      const all = await fetchNotifications();
      const items = filterNotifications(all, product === 'all' ? 'all' : product).slice(0, 3);
      if (items.length === 0) {
        await interaction.editReply({ embeds: [brandEmbed('No releases found', `Filter: ${product}`)] });
        return;
      }

      const embed = brandEmbed(`Latest releases (${product})`);
      for (const n of items) {
        embed.addFields({
          name: n.title,
          value: `${n.body.slice(0, 300)}${n.body.length > 300 ? '…' : ''}${n.action_url ? `\n[Details](${n.action_url})` : ''}`,
        });
      }
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({
        content: `Release fetch failed: ${err instanceof Error ? err.message : 'unknown'}`,
      });
    }
  }
}
