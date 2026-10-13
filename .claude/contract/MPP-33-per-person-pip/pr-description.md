# MPP-33: per-person eaten ticks and per-person Pip

Plan: [plan.md](plan.md) (tasks: [tasks.md](tasks.md))

Suggested commit subject: `MPP-33: per-person eaten ticks and per-person Pip`

## Summary
- New table `meal_plan_entry_eaten`: one row per (meal plan entry, user), so each linked person has their own eaten ticks.
- `eaten` / `eatenAt` on week reads and assignment reads now return the caller's ticks only. `setEntryEaten` writes/deletes only the caller's row and keeps the first `eaten_at`.
- Pip (name, meal times, mood) is per user.
- `MealPlanEntry` no longer maps the old `eaten` / `eaten_at` columns.
- Version bump: 1.5.0 -> 1.6.0 (Story, MINOR). CHANGELOG updated.

Convention: "eaten" is per person (`MealPlanEntryEaten`); the meal plan, shopping list, templates and extra choices stay shared via `meal_plan_owner_id`.

## Migration ordering
`foodbytes-app/database/migrations/2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql` is applied **locally only**. It is listed in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` and must go to Railway **before the backend deploys** when the epic branch merges to master (`ddl-auto: validate`).

## Follow-up ticket needed
A cleanup migration that drops `meal_plan_entries.eaten` / `eaten_at` once this deploy is verified.

## Behaviour notes
- The 5 existing shared ticks are dropped (no carry-over).
- Everyone's mood resets on deploy.
- Linked users start at "Pip" with default meal times.

## Verification results
- Task 2 (local migration): upsert check returned count 1 and `2026-10-13 08:00:00`; both FKs are ON DELETE CASCADE.
- Tasks 6/7: `MealPlanServiceTest` 24 tests and `MealPlanControllerTest` 3 tests green.
- Task 9: `PetServiceTest` 7 tests green.
- Task 12: `npm run check:version` -> `Version OK: 1.6.0`.
- Task 13: grep for `name = "eaten"|name = "eaten_at"|resolveOwner\b` in `src/main` -> one hit, `MealPlanEntryEaten.java:34` (`@Column(name = "eaten_at")` on the new entity, expected). `resolveOwnerId` in other services is unrelated.
- Task 14: full `mvn test` -> BUILD SUCCESS, 158 tests, 0 failures, 0 errors, 0 skipped.
- Task 15: `npm run build` -> built in 695ms, no errors.

## Not covered by automated tests
The native `INSERT ... ON DUPLICATE KEY UPDATE` query (`insertIfAbsent`) is only exercised via mocks in the unit tests (no test boots JPA). It needs a **local play-test**: tick/untick as two linked users against the local `foodbytes-db` and confirm independent ticks and a preserved first `eaten_at`. Frontend has no test runner; only the build was verified.
