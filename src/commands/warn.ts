import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { brandEmbed, WARN_COLOR } from '../lib/constants.js';
import { addWarning, getWarnings } from '../db/index.js';

@ApplyOptions({
  name: 'warn',
  description: 'Warn a member (staff)',
  preconditions: ['StaffOnly'],
})
export class WarnCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((opt) => opt.setName('user').setDescription('Member to warn').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason').setRequired(true)),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    addWarning(user.id, interaction.user.id, reason);

    const embed = brandEmbed('Warning issued', undefined);
    embed.setColor(WARN_COLOR);
    embed.addFields(
      { name: 'User', value: `<@${user.id}>`, inline: true },
      { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Reason', value: reason },
    );

    await interaction.reply({ embeds: [embed] });

    try {
      await user.send({
        embeds: [
          brandEmbed('Warning received', `You received a warning in **${interaction.guild?.name}**.`).addFields({
            name: 'Reason',
            value: reason,
          }),
        ],
      });
    } catch {
      // DMs closed
    }
  }
}

@ApplyOptions({
  name: 'warnings',
  description: 'View warnings for a member (staff)',
  preconditions: ['StaffOnly'],
})
export class WarningsCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((opt) => opt.setName('user').setDescription('Member').setRequired(true)),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', true);
    const rows = getWarnings(user.id);
    if (rows.length === 0) {
      await interaction.reply({ content: `No warnings for ${user.tag}.`, ephemeral: true });
      return;
    }
    const embed = brandEmbed(`Warnings — ${user.tag}`);
    for (const w of rows.slice(0, 10)) {
      embed.addFields({
        name: `#${w.id} · ${w.created_at.slice(0, 10)}`,
        value: `${w.reason}\n— <@${w.mod_id}>`,
      });
    }
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
