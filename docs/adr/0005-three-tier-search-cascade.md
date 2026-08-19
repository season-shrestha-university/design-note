# ADR-0005: Three-tier search cascade

## Status

Accepted

## Context

ADR-0002 (free browse) makes search a primary discovery path. ADR-0001 (beginner audience) means learners often lack UX vocabulary.

## Decision

Implement a three-tier search waterfall:

1. **Pagefind** — static full-text index built at deploy time
2. **Fuse.js** — client-side fuzzy match on title and excerpt metadata
3. **Gemini + Supabase** — semantic vector search via live API

AI search activates only when tiers 1 and 2 return zero results.

## Rationale

- **Future-proofing:** semantic search scales as the library grows beyond what keyword search handles well
- **Vocabulary gap:** beginners query by intent ("site freezing on mobile"); embeddings match meaning when titles and excerpts do not contain their words

## Consequences

- Site builds and runs without AI infra — tiers 1–2 still work; tier 3 returns an empty array
- Build pipeline requires `GEMINI_API_KEY` and Supabase for embedding sync (`pnpm build:index`)
- Upstash Redis rate-limits the live search API
- **Known limitation:** weak tier-1/2 matches prevent tier-3 from running — may need revisiting as the library grows
- Search complexity (three services) is justified by projected scale and audience, not the current ~10-article count

## Related

- [ADR-0006: Search failure UX](0006-search-failure-ux.md) (open)
