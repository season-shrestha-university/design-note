// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { satteri } from "@astrojs/markdown-satteri";
import icon from "astro-icon";
import { SITE_URL } from "./scripts/site-url.js";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: "static",
  integrations: [mdx(), icon(), sitemap()],
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  markdown: {
    processor: satteri({
      features: { directive: true },
    }),
  },

  devToolbar: { enabled: false },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
