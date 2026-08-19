# ADR-0009: Project scope and contribution

## Status

Accepted

## Context

Design Note is a university major project evaluated on what the student contributed. The project spans content creation, product/UX design, and technical engineering.

## Decision

The primary claim is **all of the above** — an integrated project where content, product design, and engineering reinforce each other, not three separate workstreams.

### 1. Content contribution

A curated beginner UX library with a progressive-disclosure writing model. Short explainers across five fixed disciplines, with optional takeaways, further reading, and multiple emergent format families.

### 2. Product / UX contribution

The site itself as a designed experience:

- Breadth-first information architecture (topic buffet, no curriculum)
- Progressive disclosure applied to article layout
- Design tokens, page transitions, sidebar navigation
- Accessibility enforced via axe-core pre-commit checks
- Dogfooding UX concepts the articles teach (e.g. prefetch lesson from the Filipino case study)

### 3. Technical contribution

Hybrid static site with intelligent search:

- Astro 7 static output with MDX content collections
- Three-tier search cascade (Pagefind → Fuse.js → Gemini/Supabase semantic)
- Build-time embedding pipeline with graceful degradation when AI infra is absent
- Vercel deployment with analytics, rate limiting, and caching

## Consequences

- Major project report should frame all three pillars as one system, not isolated chapters
- Viva/demo should show: a learner finding content (product), the content itself (editorial), and how search/indexing works (engineering)
- Trade-offs (e.g. search complexity at small library size) should be argued in terms of the integrated vision, not defended per-layer in isolation

## Related

- [CONTEXT.md](../../CONTEXT.md)
- All ADRs 0001–0008
