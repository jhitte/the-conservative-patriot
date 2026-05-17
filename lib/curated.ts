import type { CuratedItem } from './types';

/**
 * Curated "Must Read" highlights for The Conservative Patriot.
 * 
 * These are hand-selected analysis, investigative, or context pieces that add
 * value beyond the raw wire headlines.
 * 
 * To add a new one:
 *   1. Add the object here
 *   2. git commit + push
 *   3. It appears on the site within a minute (Vercel auto-deploy)
 */
export const curated: CuratedItem[] = [
  {
    id: "cur-001",
    title: "Understanding the New Tariff Strategy and Its Real Impact on American Families",
    url: "https://www.example.com/curated/tariffs-impact",
    source: "The Wall Street Journal",
    publishedAt: "2026-05-16T14:30:00.000Z",
    summary: "A clear breakdown of how the latest round of tariffs is playing out for consumers, manufacturers, and the broader economy.",
    whyImportant: "Tariffs are one of the most consequential policy levers right now. This piece cuts through the noise.",
    category: "Economy",
  },
  {
    id: "cur-002",
    title: "Inside the 2026 Midterm Map: Where the Battle for the House Is Really Being Fought",
    url: "https://www.example.com/curated/midterms-2026",
    source: "RealClearPolitics",
    publishedAt: "2026-05-15T09:15:00.000Z",
    summary: "District-by-district analysis of the most competitive races and what the early fundraising and polling actually tell us.",
    whyImportant: "The House majority will shape the final two years of the Trump administration.",
    category: "Elections",
  },
];

export default curated;
