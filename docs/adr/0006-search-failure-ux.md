# ADR-0006: Search failure UX

## Status

Open — not decided yet

## Context

ADR-0005 established three-tier search. Beginners may query with wrong vocabulary and get no results, or receive weak matches from tiers 1–2 that block tier 3.

Current behaviour when all tiers miss or the API errors: the results panel clears silently with no message or fallback guidance.

## Options under consideration

| Option | Trade-off |
| --- | --- |
| **Blank is fine** | Minimal UI; relies on sidebar categories for recovery |
| **Empty state message** | Low effort; guides toward categories (e.g. "No results — try browsing categories") |
| **Fallback suggestions** | Shows recent or popular articles on miss — best for beginners, more build work |
| **Hybrid** | Message plus category links |

## Consequences of leaving open

- Acceptable at current scale (~10 articles)
- Should be revisited before the library exceeds ~30 articles or before viva/demo
- Weak-match problem (ADR-0005) and empty-result problem are separate — both unresolved

## Related

- [ADR-0005: Three-tier search cascade](0005-three-tier-search-cascade.md)
