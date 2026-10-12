MPP-13: Meal times in the account menu

Plan: `.claude/contract/MPP-13-user-meal-times/plan.md` (approved mockup referenced there).
Version: 1.4.0 (Story, MINOR bump from 1.3.0).

## Summary

- Three nullable `users` TIME columns: `breakfast_by`, `lunch_by`, `dinner_by`. NULL means "use the default".
- `PATCH /api/users/me/preferences` gains `mealTimes` with true-PATCH semantics (absent = untouched, null = clear). Times are validated as HH:mm and must be strictly ordered breakfast < lunch < dinner (400 otherwise).
- Effective times (stored value or default) are returned on every `UserDTO`, including `/auth/me`, via `MealTimesPolicy`.
- `MealTimesControl` in the account menu (signed-in users only; absent for guests), wired through `AuthContext` and `userService`.

## Migration (manual, required)

`foodbytes-app/database/migrations/2026-10-12-mpp13-user-meal-times.sql` must be applied to the Railway MySQL **before** the backend deploys (`ddl-auto: validate`). Applied to the local Docker DB only so far; the Railway apply is pending (developer applies before push).

If MPP-12 ships in the same push, `2026-10-12-mpp12-meal-plan-entry-eaten.sql` must also be applied.

## Verification

- Task 15 manual browser check: **PENDING manual verification** (not yet performed).
- Stale-reference greps: no `updateDefaultServings` hits in `foodbytes-api/src`; no positional `updatePreferences(` calls in `client/src`; console.log/debug count is 5 (baseline 6), none added by this change.
- `mvn test`: BUILD SUCCESS, 147 tests, 0 failures, 0 errors (130 before + 17 new).
- `npm run build`: passes (built in under 1s).
- `npm run check:version`: `Version OK: 1.4.0`.
- Unverified: client has no test runner; frontend behaviour is covered only by the build and `mealTimesUtils.check.mjs` smoke script.

## Convention note

Preference PATCH fields are presence-tracked: absent = untouched, null = clear. New preferences add a setter that records presence.

## Suggested commit subject

`MPP-13: Meal times in the account menu`
