import Fuse from "fuse.js";
import { FUZZY_THRESHOLD, MAX_RESULTS } from "./constants";
import type { SearchMetadata, PagefindResult } from "./types";

export function createFuzzySearch(metadata: SearchMetadata[]) {
  return new Fuse(metadata, {
    keys: [
      { name: "title", weight: 0.7 },
      { name: "excerpt", weight: 0.3 },
    ],
    threshold: FUZZY_THRESHOLD,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true,
    ignoreFieldNorm: true,
  });
}

export function searchLocalMetadata(
  metadata: SearchMetadata[],
  query: string,
): PagefindResult[] {
  if (metadata.length === 0) return [];

  const fuse = createFuzzySearch(metadata);

  return fuse.search(query).slice(0, MAX_RESULTS).map((result) => ({
    url: result.item.slug,
    meta: {
      title: result.item.title,
    },
    excerpt: result.item.excerpt,
  }));
}
