# MPP-24: Pip firsts — per-person one-off achievements with backfill

Plan: [plan.md](plan.md) (tasks in [tasks.md](tasks.md))

## Summary
Adds per-person Pip "firsts" (make a template, generate a shopping list, plan a full week of 7 consecutive fully-planned days, cook a meal with a homemade extra). Service write paths publish a `PetFirstCandidate`; an after-commit `PetFirstRecorder` calls `PetFirstService.evaluate` (REQUIRES_NEW), so recording never fails or joins the request's transaction. Credit goes to the acting user, not the meal-plan owner. Idempotent: a repeat never moves `earnedAt`.

Version: **1.14.0** (MINOR, Task; was 1.13.0). `client/package.json` and `pom.xml` match; CHANGELOG updated.

## Migration (manual Railway apply required)
`foodbytes-app/database/migrations/2026-10-13-mpp24-pet-firsts.sql` — applied locally. It is order 4 in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`, after MPP-22's order 3, and must be applied to Railway **before** the merged backend deploys (`ddl-auto: validate`). Its backfill then credits live data.

## Breaking for MPP-23
`GET /api/pet/awards` now returns `{streaks, firsts}`, not an array.

## Verification
- Phase 3-5 per-class test runs: passed.
- Full suite `mvn test`: 235 tests, 0 failures, 0 errors, BUILD SUCCESS.
- Boot check (Task 17): app started on port 8099, no schema/JPQL failures, unauthenticated `/api/pet/awards` returns 401.
- `npm run check:version`: Version OK: 1.14.0. `npm run build`: passes.
- Grep audits: no firsts code in controllers; exactly 7 `PetFirstCandidate.(of|planned|cooked)(` hits in services, all with `userId` first.
- Manual Google-login check (Task 18): NOT yet done by the developer.

## For future contributors
A new first is a `FirstKey` value plus a `PetFirstCandidate` published from the service write path. Never record from a controller, and never inside the request's transaction.

## Suggested commit subject
`MPP-24: Pip firsts — per-person one-off achievements with backfill`
