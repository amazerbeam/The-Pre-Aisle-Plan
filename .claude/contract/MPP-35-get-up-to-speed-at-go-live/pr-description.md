# MPP-35: carry over old ticks at go-live and ask once when you last snacked/drank

Plan: [plan.md](plan.md)

## Summary
- New migration `2026-10-14-mpp35-carry-over-shared-ticks.sql` copies the old shared eaten ticks into per-person ticks. It sits at go-live row 2, so the go-live file now has 10 migrations (rows renumbered).
- Header fixes: migration headers no longer claim the ticks are dropped; quoted order numbers match the tracker.
- One-time habit question: Pip asks each person once per habit when they last had a snack or a drink, via `POST /api/pet/habits/{habit}/first-answer`. Credit is capped at 30 clean days.
- Version 1.21.0 -> 1.22.0 (MINOR, Story). CHANGELOG line added.

## Railway
Nothing applied now. The new migration ships inside `mpp15-railway-golive.sql` at epic merge, before the merged backend deploys. Expected live effect: 7 ticks for user 1 -> 70 sprinkles; 12 and 13 Oct count as followed-the-plan days.

## Local verification (local `foodbytes-db` only)
- Seeded `eaten = 1` on entries 1983, 1984, 2005 (user 1, plan_date 2026-10-13); 1983 with NULL `eaten_at`, the others 2026-10-13 20:00.
- After the copy all 3 rows have ticker = owner = user 1; 1984 and 2005 have `new_at` = `old_at`.
- 1983 already had a local tick row (14:46:58), so ON DUPLICATE KEY kept it: the NULL `eaten_at` -> `created_at` fallback was NOT exercised locally. Live Railway has no NULL `eaten_at` rows.
- Re-run is idempotent (count stayed 3).
- Re-running MPP-24/25 gave `MEAL_EATEN 10` for all 3 entries and no `HOMEMADE_EXTRA` (sprinkle seal).
- Backend: full `mvn test` 393 tests, 0 failures, 0 errors; `npm run build`, `check:checkin`, `check:awards`, `check:version`, `build-golive.mjs --check` (10 migrations) all pass.
- Manual check still owed (developer): Task 11 Step 5, the /pet first-answer UI at 375 px. Not verified by any automated test (client has no runner).

## Convention note
A never-answered habit opens on `CHECKIN_STEPS.FIRST`; the one-time answer is the only path that logs past habit days, capped at 30.

## Suggested commit subject
`MPP-35: carry over old ticks at go-live and ask once when you last snacked/drank`
