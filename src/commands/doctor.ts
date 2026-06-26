import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { brandEmbed, SUCCESS_COLOR, WARN_COLOR } from '../lib/constants.js';
import { DOCTOR_CHECKLIST } from '../services/ainl.js';
import { checkArmaraHealth } from '../services/armaraBridge.js';

@ApplyOptions({
  name: 'doctor',
  description: 'Install / environment checklist for ArmaraOS + AINL',
})
export class DoctorCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const armara = await checkArmaraHealth();

    const embed = brandEmbed('ArmaraOS + AINL doctor checklist');
    embed.addFields({
      name: armara.ok ? '✅ ArmaraOS API' : '⚠️ ArmaraOS API',
      value: armara.ok ? 'Daemon reachable' : `Not reachable: ${armara.detail}`,
    });

    for (const item of DOCTOR_CHECKLIST) {
      embed.addFields({
        name: item.label,
        value: `[Documentation](${item.doc})`,
      });
    }

    embed.setFooter({ text: 'Also run: ainl doctor · armaraos doctor (on your machine)' });
    await interaction.editReply({ embeds: [embed] });
  }
}

@ApplyOptions({
  name: 'assist',
  description: 'Draft a support reply via ArmaraOS agent (staff, staff channel recommended)',
  preconditions: ['StaffOnly'],
})
export class AssistCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((opt) =>
          opt.setName('context').setDescription('Question + logs/context to draft a reply for').setRequired(true),
        )
        .addStringOption((opt) => opt.setName('agent').setDescription('ArmaraOS agent name or id')),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const context = interaction.options.getString('context', true);
    const agent = interaction.options.getString('agent') ?? undefined;
    await interaction.deferReply({ ephemeral: true });

    const { requestStaffAssist } = await import('../services/armaraBridge.js');
    const result = await requestStaffAssist(context, agent);
    if (!result.ok || !result.draft) {
      await interaction.editReply({
        embeds: [
          brandEmbed('Assist unavailable', result.error ?? 'No draft returned').setColor(WARN_COLOR),
        ],
      });
      return;
    }

    const embed = brandEmbed('Draft reply (review before sending)', result.draft.slice(0, 3900));
    embed.setColor(SUCCESS_COLOR);
    embed.setFooter({ text: 'Staff-only · Do not paste blindly — verify against docs' });
    await interaction.editReply({ embeds: [embed] });
  }
}
