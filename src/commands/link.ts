import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { randomBytes } from 'node:crypto';
import { brandEmbed } from '../lib/constants.js';
import { getGithubLink, markGithubVerified, setGithubLink } from '../db/index.js';

@ApplyOptions({
  name: 'link',
  description: 'Link external accounts to your Discord profile',
})
export class LinkCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addSubcommand((sub) =>
          sub
            .setName('github')
            .setDescription('Link GitHub username (gist verification)')
            .addStringOption((opt) =>
              opt.setName('username').setDescription('GitHub username').setRequired(true),
            )
            .addStringOption((opt) =>
              opt.setName('code').setDescription('Verification code from your gist'),
            ),
        ),
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    if (sub !== 'github') return;

    const username = interaction.options.getString('username', true).replace(/^@/, '');
    const code = interaction.options.getString('code');
    const existing = getGithubLink(interaction.user.id);

    if (!code) {
      const verifyCode = randomBytes(4).toString('hex');
      setGithubLink(interaction.user.id, username, verifyCode);
      await interaction.reply({
        embeds: [
          brandEmbed('Verify GitHub link').addFields(
            {
              name: 'Step 1',
              value: `Create a **public gist** on GitHub containing exactly:\n\`\`\`\narmara-discord-verify:${verifyCode}\n\`\`\``,
            },
            {
              name: 'Step 2',
              value: `Run \`/link github username:${username} code:${verifyCode}\``,
            },
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (!existing || existing.verify_code !== code) {
      await interaction.reply({ content: 'Invalid or expired verification. Run without `code` to restart.', ephemeral: true });
      return;
    }

    try {
      const gistUrl = `https://api.github.com/users/${username}/gists`;
      const res = await fetch(gistUrl, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'armaraos-discord-bot' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        await interaction.reply({ content: `Could not fetch gists for ${username}.`, ephemeral: true });
        return;
      }
      const gists = (await res.json()) as Array<{ files: Record<string, { content?: string }> }>;
      const needle = `armara-discord-verify:${code}`;
      const found = gists.some((g) =>
        Object.values(g.files).some((f) => f.content?.includes(needle)),
      );
      if (!found) {
        await interaction.reply({
          content: `Verification gist not found. Ensure a public gist contains \`${needle}\``,
          ephemeral: true,
        });
        return;
      }
      markGithubVerified(interaction.user.id);
      await interaction.reply({
        embeds: [brandEmbed('GitHub linked', `[${username}](https://github.com/${username}) verified.`)],
        ephemeral: true,
      });
    } catch (err) {
      await interaction.reply({
        content: `Verification failed: ${err instanceof Error ? err.message : 'unknown'}`,
        ephemeral: true,
      });
    }
  }
}
