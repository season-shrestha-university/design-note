# Design Note

A UI design reference site built with [Astro](https://astro.build). It explains everyday interface patterns — typography, grids, visual hierarchy, interactions, and core design principles — through short, browsable articles organised by discipline.

## Features

- **Article library** — MDX content with titles, excerpts, read times, and optional key takeaways
- **Categories** — Articles grouped by topic (user research, UX, UI, interaction design, usability testing)
- **Search** — Client-side fuzzy search with optional semantic search via Gemini embeddings and Supabase
- **Quick access sidebar** — Floating navigation for home, categories, and copy-link on article pages
- **View transitions** — Page transitions powered by Astro's client router

## Tech stack

- [Astro 7](https://astro.build) with MDX and static output
- [Vercel](https://vercel.com) adapter with web analytics and speed insights
- [Pagefind](https://pagefind.app/) for static search indexing at build time
- [Supabase](https://supabase.com) for article embedding storage
- [Google Gemini](https://ai.google.dev/) for embedding generation
- [Upstash Redis](https://upstash.com) for search API rate limiting
- [Fuse.js](https://fusejs.io/) for client-side fuzzy matching

## Requirements

- Node.js `>=22.12.0` (see `.nvmrc`)
- pnpm

## Getting started

```sh
pnpm install
pnpm dev
```

The dev server runs at [http://localhost:4321](http://localhost:4321).

## Commands

| Command            | Action                                            |
| :----------------- | :------------------------------------------------ |
| `pnpm install`     | Install dependencies                              |
| `pnpm dev`         | Start the local dev server                        |
| `pnpm build:index` | Generate search embeddings and sync to Supabase   |
| `pnpm build`       | Build search index, production site, and Pagefind |
| `pnpm preview`     | Preview the production build locally              |
| `pnpm lint`        | Run ESLint                                        |
| `pnpm lint:fix`    | Run ESLint with auto-fix                          |
| `pnpm format`      | Format files with Prettier                        |

## Environment variables

Create a `.env` file in the project root for local development. Search indexing and the search API are optional — the site builds and runs without them.

| Variable                   | Used by           | Description                           |
| :------------------------- | :---------------- | :------------------------------------ |
| `GEMINI_API_KEY`           | Build script, API | Google Gemini API key for embeddings  |
| `SUPABASE_URL`             | Build script, API | Supabase project URL                  |
| `SUPABASE_KEY`             | Build script, API | Supabase anon/service key             |
| `SUPABASE_SECRET_KEY`      | Build script      | Alternative Supabase key for indexing |
| `UPSTASH_REDIS_REST_URL`   | Search API        | Upstash Redis REST URL                |
| `UPSTASH_REDIS_REST_TOKEN` | Search API        | Upstash Redis REST token              |

## Project structure

```text
/
├── public/                  # Static assets (icons, favicon)
├── scripts/
│   └── build-search-index.js
├── src/
│   ├── components/
│   │   ├── common/          # Header, Footer, QuickAccess, Search
│   │   └── ui/                # Card, Figure
│   ├── content/
│   │   └── articles/          # MDX articles by category folder
│   ├── db/                    # Supabase and Redis clients
│   ├── layouts/
│   ├── pages/
│   │   ├── api/search.ts      # Semantic search endpoint
│   │   ├── articles/          # Article detail pages
│   │   └── categories/        # Category listing pages
│   ├── styles/
│   └── utils/
├── astro.config.mjs
└── src/content.config.ts
```

## Adding content

Articles live in `src/content/articles/<category>/<slug>.mdx`. The category is derived from the folder name.

Example frontmatter:

```yaml
---
title: Card Sorting
excerpt: A short summary shown on cards and article headers.
publishedAt: 2025-01-15
readTime: 5 min
featured: false
takeaways:
  - First key takeaway
  - Second key takeaway
---
```

Supported categories are defined in `src/utils/categories.ts`:

- `user-research`
- `user-experience`
- `user-interface`
- `interaction-design`
- `usability-testing`

After adding or editing articles, run `pnpm build:index` before a production build if you use semantic search.

## Deployment

The project is configured for [Vercel](https://vercel.com) via `@astrojs/vercel`. Set the environment variables above in your Vercel project settings. The build command runs the search index script, Astro build, and Pagefind indexing automatically.
