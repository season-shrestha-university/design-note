export interface SearchMetadata {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
}

export interface PagefindResult {
  url: string;
  meta: { title: string };
  excerpt: string;
}

export interface AiSearchResult {
  title: string;
  excerpt: string;
  slug: string;
}

export type SearchResult = PagefindResult | AiSearchResult;
