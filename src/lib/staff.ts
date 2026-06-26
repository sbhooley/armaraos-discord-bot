import { PermissionFlagsBits, type APIInteractionGuildMember, type GuildMember } from 'discord.js';
import { getConfig } from './config.js';

type StaffMember = GuildMember | APIInteractionGuildMember;

function memberRoleIds(member: StaffMember): string[] {
  if ('roles' in member && typeof member.roles === 'object' && 'cache' in member.roles) {
    return [...(member as GuildMember).roles.cache.keys()];
  }
  return [...(member as APIInteractionGuildMember).roles];
}

export function isStaff(member: StaffMember | null | undefined): boolean {
  if (!member) return false;
  const { bot } = getConfig();

  if ('permissions' in member && typeof member.permissions === 'string') {
    const perms = BigInt(member.permissions);
    if ((perms & PermissionFlagsBits.Administrator) !== 0n) return true;
    if (bot.roles.staffIds.length === 0) return false;
    const roles = memberRoleIds(member);
    return bot.roles.staffIds.some((id) => roles.includes(id));
  }

  const guildMember = member as GuildMember;
  if (guildMember.permissions.has(PermissionFlagsBits.Administrator)) return true;
  if (bot.roles.staffIds.length === 0) return false;
  return bot.roles.staffIds.some((id) => guildMember.roles.cache.has(id));
}

export function staffOnlyMessage(): string {
  return 'This command is restricted to staff.';
}
