# MPP-12: Mark a planned meal as eaten (shared across linked meal plans)

Plan: [plan.md](plan.md) · Version: 1.2.2 -> **1.3.0** (Story = MINOR)

## Summary

- `meal_plan_entries` gains `eaten` (tinyint, default 0) and `eaten_at` (timestamp, nullable).
- `PUT /api/meal-plan/{id}/eaten` sets or clears the state. It is owner-aware (a linked user writes the owner's row) and returns 404 when the entry is not in your plan.
- `RecipeViewModal`, when opened from the meal plan, shows an eaten section at the end.
- `MealPlanEntry` shows a check badge and green tint when eaten.
- `RecipeStepsSection` was split out of `RecipeViewModal` to stay under the file size budget.
- Meal-type display labels now live in `src/constants/mealTypes.js`.

## Migration (OUTSTANDING on Railway)

`foodbytes-app/database/migrations/2026-10-12-mpp12-meal-plan-entry-eaten.sql`

**It has NOT been applied to Railway. It must be applied to the Railway MySQL BEFORE the backend deploys** (`ddl-auto: validate` fails startup otherwise).

It was applied and verified on a local copy of live data (docker `foodbytes-db`, 800 entries / 7 owners):
- `eaten` tinyint(1) NOT NULL DEFAULT 0
- `eaten_at` timestamp NULL
- eaten counts 800 / 0 / 0 (total / eaten=1 / eaten_at set)

## Verification

- `mvn test`: BUILD SUCCESS, 130 tests, 0 failures, 0 errors, 0 skipped (includes `MealPlanServiceTest` 23 and new `MealPlanControllerTest` 3).
- `npm run build`: passes (`built in 670ms`).
- `npm run check:version`: `Version OK: 1.3.0`.
- Greps: no new `console.log/debug` in touched files; no `.module.css` / `.ts` / `.tsx`; no `localhost:8080`; steps markup lives in `RecipeStepsSection.jsx` (the other `steps-list` uses are pre-existing in `RecipeCard.jsx` and admin `RecipeStepsForm.jsx`).

### Not yet done

- **Task 14 manual browser walk (ACs 1-9): PENDING.** Not run; no UI outcome is claimed here.
- **Shared-plan live check (linked user ticks, owner reloads): PENDING.** Covered only by the unit test `setEntryEaten_linkedUser_writesTheOwnersRow` so far.
- The frontend has no test runner; the UI is verified by build only until Task 14 is walked.

## Note for future contributors

Meal-plan entry state that must be shared across linked users belongs on the `meal_plan_entries` row (resolved via the effective owner), not in localStorage or per-user tables. Meal-type labels come from `src/constants/mealTypes.js`.

## Suggested commit subject

`MPP-12: Mark a planned meal as eaten (shared across linked meal plans)`
