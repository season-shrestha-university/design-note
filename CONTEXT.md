# Design Note — Project Context

## What it is

A breadth-first UX primer: short, beginner-friendly explainers for people with no prior design knowledge. Learners browse freely across five UX disciplines; depth is offloaded to external Further Reading links.

## Primary reader

UX-curious beginner — no assumed design education.

## Core principles

- **Breadth first:** wide exposure across many topics before specialisation
- **Progressive disclosure:** the site is layer 1; external links are layer 2+
- **Topic buffet:** no curriculum, no reading order, no article prerequisites
- **Soft content contract:** short and beginner-friendly, maintained by editorial judgment
- **Format diversity:** takeaways-first, sectioned essays, narratives, and highlight boxes are all valid

## Discovery

- Homepage (date-sorted), category pages (five fixed buckets), search (three-tier cascade)
- "Other posts" on article pages is serendipity, not sequencing

## Search architecture

1. **Pagefind** — full-text index at build time
2. **Fuse.js** — fuzzy match on title and excerpt
3. **Gemini + Supabase** — semantic search as last resort

Rationale: future-proofing as the library grows, and bridging the beginner vocabulary gap (plain-language queries vs UX jargon).

Open decision: search failure UX — see [ADR-0006](docs/adr/0006-search-failure-ux.md).

## Categories (fixed)

| Slug | Label |
| --- | --- |
| `user-research` | User Research |
| `user-experience` | User Experience |
| `user-interface` | User Interface |
| `interaction-design` | Interaction Design |
| `usability-testing` | Usability Testing |

One folder = one category. Authors pick the best fit when topics span disciplines.

## Project contribution

An integrated major project spanning content, product design, and engineering — not one pillar in isolation. See [ADR-0009](docs/adr/0009-project-scope-and-contribution.md).

## Tech stack

- Astro 7 (static output) with MDX content
- Vercel deployment with web analytics and speed insights
- Pagefind for static search indexing
- Optional AI search: Gemini embeddings, Supabase vector storage, Upstash Redis rate limiting
- Self-hosted IBM Plex fonts, axe-core accessibility checks in pre-commit

## Glossary

| Term | Definition |
| --- | --- |
| **Learner** | Someone with no assumed UX background, exploring design for the first time |
| **Explainer** | A single-topic, short-form article obeying editorial principles (short, beginner-friendly) |
| **Breadth** | Exposure to many UX disciplines before specialisation |
| **Depth (offloaded)** | Long-form detail delegated to external Further Reading links |
| **Disclosure layer** | Title/excerpt → optional takeaways → body → optional further reading |
| **Topic buffet** | IA model where articles stand alone; learners choose by interest, not sequence |
| **Format family** | A recurring article structure (takeaways-first, sectioned essay, narrative case study, highlight box) |
| **Soft contract** | Editorial guidelines with no schema enforcement |
| **Search cascade** | Pagefind → Fuse → semantic API; first non-empty tier wins |
| **Vocabulary gap** | Beginners search in everyday language, not UX terminology |

## Architecture decisions

See [docs/adr/](docs/adr/) for the full decision log.
