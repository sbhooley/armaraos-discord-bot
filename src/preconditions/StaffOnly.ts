import { Precondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction } from 'discord.js';
import { isStaff } from '../lib/staff.js';

export class StaffOnlyPrecondition extends Precondition {
  public override async chatInputRun(interaction: CommandInteraction) {
    return this.check(interaction);
  }

  public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.check(interaction);
  }

  private check(interaction: CommandInteraction | ContextMenuCommandInteraction) {
    if (!interaction.inGuild() || !interaction.member) {
      return this.error({ message: 'Guild only.' });
    }
    const member = interaction.member;
    if (!('roles' in member) || !isStaff(member)) {
      return this.error({ message: 'Staff only.' });
    }
    return this.ok();
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    StaffOnly: never;
  }
}
