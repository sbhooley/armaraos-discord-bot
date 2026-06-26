import type { Message, TextChannel, ThreadChannel } from 'discord.js';

export async function buildTranscriptHtml(
  channel: TextChannel | ThreadChannel,
  limit = 100,
): Promise<string> {
  const messages = await channel.messages.fetch({ limit });
  const sorted = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  const rows = sorted
    .map((m) => {
      const author = m.author.tag;
      const time = m.createdAt.toISOString();
      const body = escapeHtml(m.cleanContent || '(attachment/embed)');
      return `<tr><td>${time}</td><td>${escapeHtml(author)}</td><td>${body}</td></tr>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Ticket transcript — ${escapeHtml(channel.name)}</title>
<style>body{font-family:system-ui,sans-serif}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px;font-size:14px}</style>
</head><body>
<h1>Transcript: #${escapeHtml(channel.name)}</h1>
<table><thead><tr><th>Time</th><th>Author</th><th>Message</th></tr></thead>
<tbody>${rows}</tbody></table></body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function fetchThreadMessages(
  channel: TextChannel | ThreadChannel,
  limit = 100,
): Promise<Message[]> {
  const messages = await channel.messages.fetch({ limit });
  return [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
}
