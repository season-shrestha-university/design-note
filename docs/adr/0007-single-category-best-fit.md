# ADR-0007: Single category, best-fit assignment

## Status

Accepted

## Context

ADR-0001 (breadth-first) uses categories as the breadth map. ADR-0002 (free browse) makes category pages a primary discovery path.

Some articles naturally span disciplines (e.g. F and Z patterns is both user research and UI layout).

## Decision

One folder = one category. Authors choose the best-fit folder when a topic spans disciplines. No multi-category frontmatter or tagging system.

Category is derived from the folder path via `deriveCategory()` — not from optional frontmatter.

## Consequences

- Simple mental model: file location is the category
- Cross-discipline articles may feel "misplaced" to some readers — acceptable trade-off
- Semantic search (ADR-0005) compensates: topic-spanning articles remain findable by intent
- Renaming or moving a folder changes the URL and category — moves are breaking changes

## Related

- [ADR-0008: Fixed five-category taxonomy](0008-fixed-five-category-taxonomy.md)
