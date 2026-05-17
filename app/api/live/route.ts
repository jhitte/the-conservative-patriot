import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createHash } from 'crypto';
import * as cheerio from 'cheerio';
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
  const clean = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return undefined;
  return clean.length > 220 ? clean.slice(0, 217) + '...' : clean;
}

function extractImage(item: any): string | undefined {
  // Common places RSS feeds put images
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) {
    return item.enclosure.url;
  }

  // media:content
  const mediaContent = item['media:content'];
  if (mediaContent) {
    if (Array.isArray(mediaContent)) {
      const img = mediaContent.find((m: any) => m['$']?.url && m['$']?.medium === 'image');
      if (img) return img['$'].url;
    } else if (mediaContent['$']?.url) {
      return mediaContent['$'].url;
    }
  }

  // Try to find first image in description/content
  const html = item.description || item.content || '';
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  return undefined;
}

async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500); // 4.5s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TheConservativePatriotBot/1.0)',
      },
    });

    clearTimeout(timeout);

    if (!res.ok) return undefined;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Try og:image first (most reliable)
    let image = $('meta[property="og:image"]').attr('content');

    // Fallback to twitter:image
    if (!image) {
      image = $('meta[name="twitter:image"]').attr('content') ||
              $('meta[property="twitter:image"]').attr('content');
    }

    // Clean up and return
    if (image) {
      // Remove tracking params sometimes added to og:image
      return image.split('?')[0];
    }

    return undefined;
  } catch {
    return undefined;
  }
}

export const revalidate = 300; // 5 minutes ISR

export async function GET() {
  const results: NewsItem[] = [];
  const errors: string[] = [];

  // Fetch all feeds in parallel, tolerate individual failures
  const feedPromises = feeds.map(async (feedConfig) => {
    try {
      const feed = await parser.parseURL(feedConfig.url);

      const rssItems = (feed.items || []).slice(0, 25);

      // First pass: extract what we can from RSS
      const itemsWithPossibleMissingImages = rssItems.map((item: any) => {
        const imageFromRss = extractImage(item);
        return {
          raw: item,
          imageFromRss,
        };
      });

      // Second pass: for items without RSS image, try to fetch og:image
      const items = await Promise.all(
        itemsWithPossibleMissingImages.map(async ({ raw, imageFromRss }) => {
          let finalImage = imageFromRss;

          if (!finalImage && raw.link) {
            finalImage = await fetchOgImage(raw.link);
          }

          return {
            id: createStableId(raw, feedConfig.name),
            title: raw.title?.trim() || 'Untitled',
            url: raw.link || '#',
            source: feedConfig.name,
            publishedAt: normalizeDate(raw.pubDate || raw.isoDate || raw.date),
            lean: feedConfig.lean,
            summary: extractSummary(raw),
            image: finalImage,
            category: feedConfig.category,
          } as NewsItem;
        })
      );

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
