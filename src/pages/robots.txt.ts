import type { APIRoute } from "astro";
import { SITE_URL } from "../../scripts/site-url.js";

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL(SITE_URL);
  const sitemapUrl = new URL("/sitemap-index.xml", base).toString();

  const body = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
