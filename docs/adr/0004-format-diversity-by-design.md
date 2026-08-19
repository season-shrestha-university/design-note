# ADR-0004: Format diversity by design

## Status

Accepted

## Context

ADR-0003 established a soft content contract. The question was whether article format should be standardised or left to author choice.

Observed format families in the current library:

1. **Takeaways-first explainer** — numbered takeaways before body (e.g. progressive disclosure, algorithm as UX)
2. **Sectioned essay** — `##` headings as scannable structure (e.g. I Know What Users Want)
3. **Narrative case study** — first-person story with screenshots (e.g. Wait on that one, Filipino)
4. **Highlight-box explainer** — inline highlight components (e.g. First Idea: First Layer of an Onion)

## Decision

No format selection rule. Article structure is **author-driven**. Multiple format families coexist deliberately.

## Consequences

- The site teaches through content variety, not template uniformity
- Shared UI components (`Figure`, highlight classes, card layout) provide visual cohesion without forcing structural sameness
- Major project documentation should describe format families as emergent patterns, not as a prescribed system
- "Beginner-friendly" may mean different things per format family — tone consistency matters more than structural consistency

## Related

- [ADR-0003: Soft content contract](0003-soft-content-contract.md)
