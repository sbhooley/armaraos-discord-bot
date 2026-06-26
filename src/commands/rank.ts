import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { brandEmbed, levelFromXp, xpForLevel, xpProgressBar } from '../lib/constants.js';
import { getLeaderboard, getMember, upsertMember } from '../db/index.js';

@ApplyOptions({
  name: 'rank',
  description: 'View your XP rank or the server leaderboard',
})
export class RankCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((opt) => opt.setName('user').setDescription('Member to inspect'))
        .addBooleanOption((opt) => opt.setName('leaderboard').setDescription('Show top 10')),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    if (interaction.options.getBoolean('leaderboard')) {
      const top = getLeaderboard(10);
      const embed = brandEmbed('Contributor leaderboard');
      if (top.length === 0) {
        embed.setDescription('No XP recorded yet.');
      } else {
        embed.setDescription(
          top
            .map((m, i) => {
              const lvl = levelFromXp(m.xp);
              return `**${i + 1}.** <@${m.discord_id}> — Lvl ${lvl} · ${m.xp} XP · ${m.helpful_count} helpful`;
            })
            .join('\n'),
        );
      }
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const target = interaction.options.getUser('user') ?? interaction.user;
    upsertMember(target.id, target.username);
    const member = getMember(target.id)!;
    const level = levelFromXp(member.xp);
    const next = xpForLevel(level + 1);
    const embed = brandEmbed(`${target.username} — Level ${level}`)
      .addFields(
        { name: 'XP', value: `${member.xp} / ${next}`, inline: true },
        { name: 'Helpful marks', value: `${member.helpful_count}`, inline: true },
        { name: 'Progress', value: `\`${xpProgressBar(member.xp)}\`` },
      );
    if (member.github_username) {
      embed.addFields({ name: 'GitHub', value: `[${member.github_username}](https://github.com/${member.github_username})` });
    }
    await interaction.reply({ embeds: [embed] });
  }
}
