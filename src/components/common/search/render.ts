import type { SearchResult } from "./types";

function stripMarkTags(text: string): string {
  return text.replace(/<\/?mark>/gi, "");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeUrl(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

function renderResultItem(article: SearchResult, isAI: boolean): string {
  const rawTitle = isAI
    ? (article as { title: string }).title
    : (article as { meta?: { title: string } }).meta?.title;
  const title = rawTitle ? stripMarkTags(String(rawTitle)) : "";
  const rawUrl = isAI
    ? (article as { slug: string }).slug
    : (article as { url: string }).url;
  const url = String(rawUrl || "");

  if (!isSafeUrl(url)) return "";

  const excerpt = article.excerpt
    ? stripMarkTags(String(article.excerpt))
    : "";

  return `
    <li>
      <a href="${escapeHtml(url)}">
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(excerpt)}</p>
      </a>
    </li>
  `;
}

export function renderResultsHtml(
  articles: SearchResult[],
  isAI: boolean,
): string {
  return articles.map((article) => renderResultItem(article, isAI)).filter(Boolean).join("");
}
