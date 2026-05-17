import type { FeedConfig } from './types';

/**
 * RSS feed sources for The Conservative Patriot
 * 
 * Conservative-first selection with strong right-of-center and center sources,
 * plus a few high-quality liberal and wire services for genuine balance.
 * 
 * BBC removed — too international/left-leaning for this site's focus.
 *
 * Add / remove feeds here. The /api/live route picks them up automatically.
 */
export const feeds: FeedConfig[] = [
  // RIGHT / CONSERVATIVE (priority for this site)
  {
    name: "Fox News",
    url: "https://feeds.foxnews.com/foxnews/latest",
    lean: "Right",
  },
  {
    name: "Breitbart",
    url: "https://feeds.feedburner.com/breitbart",
    lean: "Right",
  },
  {
    name: "National Review",
    url: "https://www.nationalreview.com/feed/",
    lean: "Right",
  },
  {
    name: "Washington Examiner",
    url: "https://www.washingtonexaminer.com/feed/",
    lean: "Right",
  },
  {
    name: "Townhall",
    url: "https://townhall.com/rss",
    lean: "Right",
  },

  // X / TWITTER (high-signal conservative accounts)
  {
    name: "X • EndWokeness",
    url: "https://rsshub.app/twitter/user/EndWokeness",
    lean: "Right",
  },
  {
    name: "X • DC_Draino",
    url: "https://rsshub.app/twitter/user/DC_Draino",
    lean: "Right",
  },

  // CENTER
  {
    name: "The Hill",
    url: "https://thehill.com/homenews/feed/",
    lean: "Center",
  },
  {
    name: "Reuters",
    url: "https://feeds.reuters.com/reuters/topNews",
    lean: "Wire",
  },

  // LEFT / LIBERAL (included for balance as requested)
  {
    name: "NPR",
    url: "https://feeds.npr.org/1001/rss.xml",
    lean: "Left",
  },
  {
    name: "The Guardian US",
    url: "https://www.theguardian.com/us-news/rss",
    lean: "Left",
  },
];

/**
 * Category keywords used for simple client-side bucketing.
 * Extend as needed.
 */
export const categoryKeywords: Record<string, string[]> = {
  Politics: ['trump', 'biden', 'congress', 'senate', 'house', 'election', 'gop', 'democrat', 'white house', 'administration'],
  Elections: ['election', 'ballot', 'primary', 'midterm', '2026', 'vote'],
  Economy: ['tariff', 'inflation', 'fed', 'stock', 'market', 'jobs', 'recession', 'budget'],
  World: ['iran', 'ukraine', 'china', 'russia', 'israel', 'gaza', 'europe', 'uk'],
  Courts: ['supreme court', 'scotus', 'judge', 'ruling', 'lawsuit', 'justice'],
};
