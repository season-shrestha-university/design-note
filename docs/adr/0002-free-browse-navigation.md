# ADR-0002: Free browse navigation

## Status

Accepted

## Context

ADR-0001 established breadth-first pedagogy for beginners. The question was how learners move through the site to achieve broad understanding.

## Decision

No intentional connections between articles. No reading order, prerequisites, or guided paths.

Learners browse freely via:

- Homepage (all articles, date-sorted)
- Category pages (five discipline buckets)
- Search (keyword, fuzzy, and semantic)
- "Other posts" on article pages (pseudo-random serendipity, not topic sequencing)

## Consequences

- Homepage date-sort is acceptable — it signals freshness, not learning sequence
- Features like "related articles by topic" would contradict this ADR unless explicitly scoped
- Search and categories carry the primary discovery burden
- Category balance is an editorial concern: breadth is achieved by publishing across all five categories over time

## Related

- [ADR-0005: Three-tier search cascade](0005-three-tier-search.md)
- [ADR-0008: Fixed five-category taxonomy](0008-fixed-five-category-taxonomy.md)
