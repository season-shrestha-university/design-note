// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import mdx from "@astrojs/mdx";
import { satteri } from "@astrojs/markdown-satteri";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  output: "static",
  integrations: [mdx(), icon()],
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
});
