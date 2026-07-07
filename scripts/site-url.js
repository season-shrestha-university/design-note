/** Canonical site origin — shared by astro.config and prerendered routes. */
export const SITE_URL =
  process.env.PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://design-note.vercel.app");
