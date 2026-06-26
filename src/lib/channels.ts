import type { SendableChannels } from 'discord.js';

export function asSendable(
  channel: { isTextBased(): boolean } | null,
): SendableChannels | null {
  if (!channel?.isTextBased()) return null;
  if (!('send' in channel) || typeof (channel as SendableChannels).send !== 'function') {
    return null;
  }
  return channel as SendableChannels;
}
