import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishedAt: z.coerce.date().default(() => new Date()),
    readTime: z.string(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  articles,
};
