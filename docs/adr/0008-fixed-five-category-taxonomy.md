# ADR-0008: Fixed five-category taxonomy

## Status

Accepted

## Context

ADR-0007 established single-category, best-fit assignment. The question was whether the taxonomy itself evolves as the library grows.

## Decision

Five categories are **fixed and complete**. They define the full breadth map for Design Note. All current and future articles fit into one of these buckets:

| Slug | Label |
| --- | --- |
| `user-research` | User Research |
| `user-experience` | User Experience |
| `user-interface` | User Interface |
| `interaction-design` | Interaction Design |
| `usability-testing` | Usability Testing |

Adding a sixth category would require explicit revision of this ADR.

## Consequences

- `ARTICLE_CATEGORIES` in `src/utils/categories.ts` is canonical
- Breadth-first goal (ADR-0001) means coverage across all five categories is an editorial target over time
- Empty categories are acceptable short-term but weaken the breadth promise long-term
- Minor naming drift exists: `interaction-design` slug uses `user-interaction-icon.svg` — cosmetic only

## Related

- [ADR-0007: Single category, best-fit assignment](0007-single-category-best-fit.md)
