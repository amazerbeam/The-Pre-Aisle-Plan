MPP-22: plan streak, repeating milestone ladder and award ledger

Plan: `.claude/contract/MPP-22-plan-streak-award-ladder/plan.md`

## Summary
- `pet_awards` ledger table and the `StreakType` enum / `PetAward` entity, with an idempotent insert in `PetAwardRepository`.
- Three rules classes: `StreakRuns` (current and best runs), `PlanStreakPolicy` (plan-day definition, `dayOutcome`; days with nothing planned are neutral) and `AwardLadder` (repeating 30-day milestone ladder; day 31 re-earns the 1-day award).
- `PlanStreakService` reads the shared plan slots (resolved through the meal-plan owner) but only the caller's own eaten ticks. `AwardService` syncs on read and is idempotent.
- `GET /api/pet/awards` (`PetAwardController`) returns `current / best / counts / next` per streak type.
- Version bumped to **1.13.0** (MINOR, Task) in `package.json`, `pom.xml` and `CHANGELOG.md`.

## Migration (manual Railway apply)
`foodbytes-app/database/migrations/2026-10-13-mpp22-pet-awards.sql` is applied to the **local** DB only. It is order 3 in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`. It must be applied to Railway **before** the merged backend deploys (`ddl-auto: validate`).

Fallback taken during the boot check: `milestone` was changed from `TINYINT UNSIGNED` to `INT` (the documented fallback) so that Hibernate validation matches the entity's Java type.

## Verification
- Local migration applied, and the backend boots against the local DB with `ddl-auto: validate` (Task 15), including the JPQL queries.
- New tests: 25 (6 StreakRuns, 5 PlanStreakPolicy, 5 AwardLadder, 3 PlanStreakService, 5 AwardService, 1 controller).
- `mvn test` (M.3): 208 tests, 0 failures, 0 errors, BUILD SUCCESS.
- `npm run check:version`: Version OK: 1.13.0.
- `npm run build` (M.4): built in 735ms, no errors.
- Grep audits (M.2): award code never references the meal-plan owner or `UserRepository` (0 hits). `PlanStreakService` has exactly two hits: `extraChoiceService.resolveOwnerId(userId)` and `findEatenEntryIdsInRange(userId, …)`.
- Not covered: no client changes in this ticket, and there is no frontend test runner.

## Conventions
- The plan-day definition lives only in `PlanStreakPolicy.dayOutcome`.
- Awards are recorded when the cabinet is read (sync-on-read), and ledger rows are never deleted. A run whose start date later shifts (untick/re-tick, partner edits to past slots) can be recorded again and over-count slightly; this is accepted.

## Suggested commit subject
`MPP-22: plan streak, repeating milestone ladder and award ledger`
