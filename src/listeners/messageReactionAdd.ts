import { Listener } from '@sapphire/framework';
import { Events, type MessageReaction, type User } from 'discord.js';
import { getConfig } from '../lib/config.js';
import { incrementHelpful } from '../db/index.js';
import { isStaff } from '../lib/staff.js';

export class MessageReactionAddListener extends Listener<typeof Events.MessageReactionAdd> {
  public constructor(context: Listener.LoaderContext) {
    super(context, { event: Events.MessageReactionAdd });
  }

  public override async run(reaction: MessageReaction, user: User) {
    if (user.bot) return;
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch {
        return;
      }
    }

    const message = reaction.message;
    if (!message.guild || !message.author || message.author.bot) return;

    const { bot } = getConfig();
    if (reaction.emoji.name !== bot.xp.helpfulReactionEmoji) return;

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member || !isStaff(member)) return;

    incrementHelpful(message.author.id, bot.xp.helpfulReactionXp);
  }
}
