# Architecture review checklist

> Planning layer (stage 3) - an adversarial self-review of your proposed design.
> Run BEFORE writing implementation tasks. Goal: catch the AI's own blind spots
> the way an independent reviewer would.
>
> Recommended: have a fresh sub-agent (isolated from the coding-context) answer
> these against your design doc / proposal, then reconcile.

## 0. Scope & intent

- [ ] What problem does this change solve? (one-line, user-visible)
- [ ] What is explicitly OUT of scope? (so we don't creep)
- [ ] Who are the consumers / callers, and what contract must stay compatible?

## 1. Correctness & behavior

- [ ] Is the simplest design that satisfies the requirement? (YAGNI check)
- [ ] Any hidden edge cases / boundary conditions (>N items, empty, null, timezone)?
- [ ] Failure modes: what happens on error - is it explicit, not silent?
- [ ] Concurrency / ordering: race conditions, stale reads, double-writes?

## 2. Data & validation (security-first)

- [ ] All user input whitelisted / validated at the boundary? (no blind pass-through)
- [ ] Sort/filter/limit parameters validated against a whitelist? no `__proto__` keys?
- [ ] No secrets in code / config; keys kept out of source and git history?
- [ ] AuthZ: every route/operation enforces ownership / least privilege?

## 3. Performance & scale

- [ ] Will it behave acceptably at the expected data volume? (N+1, O(n^2) hazards?)
- [ ] Any unbounded loops / unbounded collections from user input?
- [ ] Is pagination / limiting in place where responses could grow?

## 4. Maintainability & consistency

- [ ] Follows the existing patterns of this codebase (middleware, models, routes)?
- [ ] Naming / style consistent with peers; no new ad-hoc conventions?
- [ ] Would a future reader understand the intent from names + minimal comments?

## 5. Test coverage

- [ ] What tests must exist before merge (success + failure + validation)?
- [ ] Are the tricky branches the ones under test?
- [ ] Does the change need a regression test for any prior bug it touches?

## 6. Alternatives & tradeoffs (ADR-worthy reflection)

- [ ] What was the main alternative design, and concrete reason it was rejected?
- [ ] Long-term cost of today's shortcut, if any - is it acceptable / documented?
- [ ] Is any decision here worth recording as an ADR (`adr-template.md`)?

## 7. Deployment & operations

- [ ] Migration / data implications (if any) handled and reversible?
- [ ] Logging/monitoring impact: is the new path observable?
- [ ] Rollback path if this ships badly?

## Gate

- Any unchecked **Yes-required** item in sections 1-6 means the design is NOT
  ready; fix before writing implementation tasks. Section 7 items should be
  resolved before merge.