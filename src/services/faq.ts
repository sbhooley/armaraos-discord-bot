import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { getConfig, resolveCorpusPath } from '../lib/config.js';

export interface FaqEntry {
  id: string;
  patterns: string[];
  answer: string;
  links: string[];
}

export interface FaqMatch {
  entry: FaqEntry;
  confidence: number;
}

let corpusCache: FaqEntry[] | null = null;

export function loadFaqCorpus(): FaqEntry[] {
  if (corpusCache) return corpusCache;
  const { bot } = getConfig();
  const path = resolveCorpusPath(bot.faq.corpusPath);
  const raw = parseYaml(readFileSync(path, 'utf8')) as { faqs: FaqEntry[] };
  corpusCache = raw.faqs ?? [];
  return corpusCache;
}

export function reloadFaqCorpus(): FaqEntry[] {
  corpusCache = null;
  return loadFaqCorpus();
}

export function matchFaq(query: string): FaqMatch | null {
  const normalized = query.toLowerCase().trim();
  if (normalized.length < 8) return null;

  let best: FaqMatch | null = null;
  for (const entry of loadFaqCorpus()) {
    for (const pattern of entry.patterns) {
      const p = pattern.toLowerCase();
      if (normalized.includes(p) || p.includes(normalized)) {
        const confidence = Math.min(1, 0.6 + p.length / normalized.length * 0.4);
        if (!best || confidence > best.confidence) {
          best = { entry, confidence };
        }
      }
    }
    // token overlap scoring
    const terms = normalized.split(/\s+/).filter((t) => t.length > 3);
    const patternBlob = entry.patterns.join(' ').toLowerCase();
    const hits = terms.filter((t) => patternBlob.includes(t)).length;
    if (hits >= 2) {
      const confidence = Math.min(0.95, 0.5 + hits * 0.15);
      if (!best || confidence > best.confidence) {
        best = { entry, confidence };
      }
    }
  }
  return best;
}
