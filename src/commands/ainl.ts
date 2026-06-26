import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { brandEmbed, ERROR_COLOR, SUCCESS_COLOR, truncate } from '../lib/constants.js';
import { validateAinl } from '../services/ainl.js';

@ApplyOptions({
  name: 'ainl',
  description: 'AINL tooling — validate snippets (strict mode)',
})
export class AinlCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommand((sub) =>
          sub
            .setName('validate')
            .setDescription('Validate AINL source (requires ainl serve or AINL_VALIDATE_URL)')
            .addStringOption((opt) =>
              opt.setName('source').setDescription('AINL source code').setRequired(true),
            ),
        ),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    if (sub !== 'validate') return;

    const source = interaction.options.getString('source', true);
    await interaction.deferReply({ ephemeral: source.length > 400 });

    const result = await validateAinl(source, true);
    if (result.error) {
      const embed = brandEmbed('AINL validate unavailable', result.error);
      embed.setColor(ERROR_COLOR);
      embed.addFields({
        name: 'Setup',
        value: 'Run `ainl serve --port 8765` or set `AINL_VALIDATE_URL` in `.env`',
      });
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const embed = brandEmbed(
      result.ok ? 'Validation passed' : 'Validation failed',
    );
    embed.setColor(result.ok ? SUCCESS_COLOR : ERROR_COLOR);
    const diags = result.diagnostics ?? [];
    if (diags.length === 0) {
      embed.setDescription(result.ok ? 'No diagnostics.' : 'Failed with no diagnostic details.');
    } else {
      const text = diags
        .slice(0, 8)
        .map((d) => `• ${d.message}${d.suggested_fix ? `\n  ↳ ${d.suggested_fix}` : ''}`)
        .join('\n');
      embed.setDescription(truncate(text, 3900));
    }
    embed.setFooter({ text: 'Ground truth: ainl validate --strict · examples/ in ainativelang repo' });
    await interaction.editReply({ embeds: [embed] });
  }
}
