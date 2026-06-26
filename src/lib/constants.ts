import { EmbedBuilder, type ColorResolvable } from 'discord.js';

export const BRAND_COLOR = 0x6366f1 as ColorResolvable;
export const SUCCESS_COLOR = 0x22c55e as ColorResolvable;
export const WARN_COLOR = 0xf59e0b as ColorResolvable;
export const ERROR_COLOR = 0xef4444 as ColorResolvable;

export function brandEmbed(title: string, description?: string): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(title).setTimestamp();
  if (description) embed.setDescription(description);
  return embed;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function xpForLevel(level: number): number {
  return Math.max(0, (level - 1) ** 2 * 50);
}

export function xpProgressBar(xp: number, width = 12): string {
  const level = levelFromXp(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const span = nextLevelXp - currentLevelXp;
  const progress = span > 0 ? (xp - currentLevelXp) / span : 1;
  const filled = Math.round(progress * width);
  return `${'█'.repeat(filled)}${'░'.repeat(width - filled)}`;
}
