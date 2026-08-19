# ADR-0003: Soft content contract

## Status

Accepted

## Context

ADR-0001 (beginner audience) and ADR-0002 (free browse) need a definition of what an article is and what constraints it obeys.

## Decision

No hard content constraints in the schema. Articles must be **short** and **beginner-friendly**, maintained by editorial judgment at write time.

- Takeaways are optional
- Further reading is optional
- Length and read time have no enforced ceiling — `readTime` is manually declared
- Topic scope is open — articles can cover any UX-related subject

## Consequences

- The progressive disclosure article documents one format, not the only format
- New contributors have no automated guardrails — editorial drift is possible without a checklist
- Case studies and narrative pieces are allowed if they stay beginner-accessible
- `readTime` is trust-based metadata; nothing validates it against actual word count

## Related

- [ADR-0004: Format diversity by design](0004-format-diversity.md)
