# MPP-20: habit streaks backend (snack-free / alcohol-free check-ins)

Plan: [plan.md](plan.md) (same folder). Version 1.10.0 -> **1.11.0** (Task, MINOR bump).

## Summary
- Two new tables: `pet_habit_days` (per-day log) and `pet_habit_streaks` (summary row per user + habit).
- `Habit` enum, `PetHabitDay` / `PetHabitStreak` entities and repositories.
- `HabitStreakPolicy` (pure rules), `HabitStreakService` (transactional, keyed by caller id), `PetHabitController`:
  - `GET /api/pet/habits`
  - `POST /api/pet/habits/{habit}/answer`
- Rules: catch-up credit for clean answers, backdated lapse that keeps `best`, idempotent repeat clean answers, 400 on a lapse once today is already answered.
- Habit data is per person: the code never resolves the meal-plan owner.

## Migration (manual)
`foodbytes-app/database/migrations/2026-10-13-mpp20-pet-habit-streaks.sql` is applied to the **local** Docker DB only. It is listed as order 2 in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` and must be applied to Railway **before** the merged backend deploys (`ddl-auto: validate`).

## Verification
- Task 2 / 13: migration applied locally; backend boots against local DB with `validate` passing; `/api/pet/habits` returns 401 unauthenticated.
- Tasks 9, 11, 12: HabitStreakPolicyTest (10), HabitStreakServiceTest (10), PetHabitControllerTest (5) green. Note: Surefire 3.1.2 rejects `-Dtest=A+B`; a comma was used. The separate red compile check in Task 12 Step 2 was not run.
- M.2: grep for `mealPlanOwnerId|MealPlanOwner|UserRepository|resolveOwner` in `*Habit*.java` under `src/main`: zero hits.
- M.3: `mvn test` BUILD SUCCESS, 183 tests, 0 failures, 0 errors (includes the 25 new).
- M.4: `npm run build` OK (built in 1.43s); `npm run check:version` -> Version OK: 1.11.0.

## Conventions
First `@Enumerated` in the codebase. Enum columns are `VARCHAR + CHECK` with `@JdbcTypeCode(SqlTypes.VARCHAR)`, and "today" comes from the injectable Europe/Dublin `Clock` bean (`ClockConfig`).

Suggested commit subject: `MPP-20: habit streaks backend (snack-free / alcohol-free check-ins)`
