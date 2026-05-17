import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createHash } from 'crypto';
import { feeds } from '@/lib/feeds';
import type { NewsItem, Lean } from '@/lib/types';

const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'TheConservativePatriot/1.0 (+https://theconservativepatriot.com)',
  },
});

function normalizeDate(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/**
 * Generate a stable, unique ID for a news item.
 * 
 * Priority:
 * 1. Use the feed's own `guid` if present (best practice)
 * 2. Otherwise, create a short MD5 hash of url + title + date
 * 
 * This prevents the previous collision bug where Base64 truncation
 * caused many NPR (and other) items to share the same key.
 */
function createStableId(item: any, source: string): string {
  // Best case: the RSS feed provides a proper GUID
  if (item.guid && typeof item.guid === 'string' && item.guid.length > 8) {
    // Some feeds put the full URL in guid; others use a unique ID
    return item.guid.length > 40 
      ? createHash('md5').update(item.guid).digest('hex').slice(0, 16)
      : item.guid;
  }

  // Fallback: hash the most unique combination we have
  const uniqueString = [
    item.link || '',
    item.title || '',
    item.pubDate || item.isoDate || item.date || '',
    source
  ].join('|');

  return createHash('md5').update(uniqueString).digest('hex').slice(0, 16);
}

function extractSummary(item: any): string | undefined {
  const content = item.contentSnippet || item.summary || item.description || '';
  // Clean up and truncate
  const clean = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return undefined;
  return clean.length > 220 ? clean.slice(0, 217) + '...' : clean;
}

export const revalidate = 300; // 5 minutes ISR

export async function GET() {
  const results: NewsItem[] = [];
  const errors: string[] = [];

  // Fetch all feeds in parallel, tolerate individual failures
  const feedPromises = feeds.map(async (feedConfig) => {
    try {
      const feed = await parser.parseURL(feedConfig.url);

      const items = (feed.items || []).slice(0, 25).map((item: any) => {
        const newsItem: NewsItem = {
          id: createStableId(item, feedConfig.name),
          title: item.title?.trim() || 'Untitled',
          url: item.link || '#',
          source: feedConfig.name,
          publishedAt: normalizeDate(item.pubDate || item.isoDate || item.date),
          lean: feedConfig.lean,
          summary: extractSummary(item),
          category: feedConfig.category,
        };
        return newsItem;
      });

      return { ok: true as const, items };
    } catch (err: any) {
      errors.push(`${feedConfig.name}: ${err?.message || 'fetch failed'}`);
      return { ok: false as const, items: [] as NewsItem[] };
    }
  });

  const settled = await Promise.allSettled(feedPromises);

  settled.forEach((s) => {
    if (s.status === 'fulfilled' && s.value.ok) {
      results.push(...s.value.items);
    }
  });

  // Deduplicate by URL (keep newest)
  const byUrl = new Map<string, NewsItem>();
  for (const item of results) {
    const existing = byUrl.get(item.url);
    if (!existing || new Date(item.publishedAt) > new Date(existing.publishedAt)) {
      byUrl.set(item.url, item);
    }
  }

  // Sort newest first
  const sorted = Array.from(byUrl.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Limit
  const limited = sorted.slice(0, 90);

  // Final safety net: guarantee all IDs are unique (prevents any React key collisions)
  const seenIds = new Set<string>();
  limited.forEach((item, index) => {
    let id = item.id;
    let suffix = 0;
    while (seenIds.has(id)) {
      suffix += 1;
      id = `${item.id}-${suffix}`;
    }
    item.id = id;
    seenIds.add(id);
  });

  return NextResponse.json(
    {
      items: limited,
      meta: {
        count: limited.length,
        sources: feeds.length,
        errors: errors.length > 0 ? errors : undefined,
        lastUpdated: new Date().toISOString(),
      },
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}
