import { getConfig } from '../lib/config.js';

export interface DocSearchResult {
  title: string;
  href: string;
  description: string;
  score?: number;
}

interface ManifestDoc {
  id: string;
  href: string;
  title: string;
  description?: string;
  preview?: string;
  searchText?: string;
}

interface ManifestPayload {
  docs: ManifestDoc[];
}

let manifestCache: { at: number; docs: ManifestDoc[] } | null = null;
const MANIFEST_TTL_MS = 60 * 60 * 1000;

async function loadManifest(): Promise<ManifestDoc[]> {
  const now = Date.now();
  if (manifestCache && now - manifestCache.at < MANIFEST_TTL_MS) {
    return manifestCache.docs;
  }
  const { env, bot } = getConfig();
  const res = await fetch(env.DOCS_MANIFEST_URL, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`manifest fetch failed: ${res.status}`);
  const data = (await res.json()) as ManifestPayload;
  manifestCache = { at: now, docs: data.docs ?? [] };
  return manifestCache.docs;
}

function searchManifest(docs: ManifestDoc[], query: string, limit: number): DocSearchResult[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = docs
    .map((doc) => {
      const haystack = (doc.searchText ?? `${doc.title} ${doc.description ?? ''} ${doc.preview ?? ''}`).toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (doc.title.toLowerCase().includes(term)) score += 4;
        if (haystack.includes(term)) score += 1;
      }
      return { doc, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const { bot } = getConfig();
  return scored.map(({ doc, score }) => ({
    title: doc.title,
    href: doc.href.startsWith('http') ? doc.href : `${bot.siteBaseUrl}${doc.href}`,
    description: doc.description ?? doc.preview ?? '',
    score,
  }));
}

export async function searchDocs(query: string, limit = 3): Promise<DocSearchResult[]> {
  const { env } = getConfig();

  try {
    const url = new URL(env.DOCS_SEARCH_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', String(limit));
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (res.ok) {
      const data = (await res.json()) as { results?: DocSearchResult[]; items?: DocSearchResult[] };
      const items = data.results ?? data.items ?? [];
      if (items.length > 0) return items.slice(0, limit);
    }
  } catch {
    // fall through to manifest search
  }

  const docs = await loadManifest();
  return searchManifest(docs, query, limit);
}
