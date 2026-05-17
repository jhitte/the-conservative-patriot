export type Lean = 'Left' | 'Center' | 'Right' | 'Wire';

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO string
  lean: Lean;
  summary?: string;
  image?: string;
  category?: string;
  isBreaking?: boolean;
}

export interface FeedConfig {
  name: string;
  url: string;
  lean: Lean;
  category?: string;
}

export interface CuratedItem extends Omit<NewsItem, 'lean'> {
  lean?: Lean; // curated can be neutral or tagged
  whyImportant?: string;
}
