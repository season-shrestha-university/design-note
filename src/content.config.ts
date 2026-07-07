import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    // Omit blank/missing dates — never substitute build time (unstable SEO signals).
    publishedAt: z.preprocess(
      (value) => (value == null || value === "" ? undefined : value),
      z.coerce.date().optional(),
    ),
    updatedAt: z.coerce.date().optional(),
    readTime: z.string(),
    featured: z.boolean().default(false),
    author: z.string().optional(),
    ogImage: z.string().optional(),
    takeaways: z.array(z.string()).optional(),
    furtherReading: z
      .array(
        z.object({
          title: z.string(),
          subtitle: z.string(),
          link: z.url(),
        }),
      )
      .optional(),
  }),
});

export const collections = {
  articles,
};
