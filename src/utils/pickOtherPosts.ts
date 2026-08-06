import type { CollectionEntry } from "astro:content";

function hashId(id: string, seed: number): number {
  return (
    id.split("").reduce((sum, char) => sum + char.charCodeAt(0), seed) % 997
  );
}

export function pickOtherPosts(
  articles: CollectionEntry<"articles">[],
  currentId: string,
  count = 2,
) {
  const seed = hashId(currentId, 0);

  return articles
    .filter((article) => article.id !== currentId)
    .sort((a, b) => hashId(a.id, seed) - hashId(b.id, seed))
    .slice(0, count);
}
