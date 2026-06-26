import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { brandEmbed, truncate } from '../lib/constants.js';

@ApplyOptions({
  name: 'ping',
  description: 'Bot latency and uptime check',
})
export class PingCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const sent = Date.now();
    const ws = this.container.client.ws.ping;
    const uptime = process.uptime();
    const embed = brandEmbed('Pong', `Round-trip: **${Date.now() - sent}ms** · WS: **${ws}ms**`)
      .addFields({ name: 'Uptime', value: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m` });
    await interaction.reply({ embeds: [embed] });
  }
}

@ApplyOptions({
  name: 'health',
  description: 'Ops health summary (staff)',
  preconditions: ['StaffOnly'],
})
export class HealthCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const { checkArmaraHealth } = await import('../services/armaraBridge.js');
    const armara = await checkArmaraHealth();
    const embed = brandEmbed('Health')
      .addFields(
        { name: 'Discord WS', value: `${this.container.client.ws.ping}ms`, inline: true },
        { name: 'ArmaraOS API', value: armara.ok ? '✅ up' : `❌ ${truncate(armara.detail, 80)}`, inline: true },
        { name: 'Node', value: process.version, inline: true },
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
