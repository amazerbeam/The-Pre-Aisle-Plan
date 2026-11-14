# Meal Plan + Recipes redesign

Suggested commit subject: `Meal Plan + Recipes redesign`

- Plan: [plan.md](plan.md)
- Mockup: [mockup.html](mockup.html)
- Version: **1.30.0** (MINOR bump, no Jira key; `package.json`, `pom.xml` and `CHANGELOG.md` agree, `npm run check:version` prints `Version OK: 1.30.0`)

## Summary

Meal Plan, Recipes and Header redesign, plus the recipe view and Shopping screens: timetable and mobile day view, one-way eaten tick, meal actions with undo, recipe search / week slot strip / picking mode, variant segment, macro chips, hide recipes, Plate P logo everywhere, desktop header nav, week pill, recipe view (cook mode, step cards, extras box), and shopping (progress, out-of-date banner, folding aisles).

## Migrations (apply to Railway BEFORE the backend deploys)

1. `foodbytes-app/database/migrations/2026-11-14-user-hidden-recipes.sql` (Task 30)
2. `foodbytes-app/database/migrations/2026-11-14-shopping-list-plan-fingerprint.sql` (Task 62)

Both are already present on Railway and the local DB (read-only check: `user_hidden_recipes` table count 1; `shopping_lists.plan_fingerprint` column count 1, `char(64)`, NULL).

**Deploy order: migration, then backend, then frontend.**

## Verification

- Backend `mvn test`: BUILD SUCCESS, 483 tests, 0 failures, 0 errors, 0 skipped.
- Local boot (`mvn spring-boot:run` against the Docker `foodbytes-db`, `ddl-auto: validate`): `Started FoodBytesApplication in 4.1 seconds`, no schema-validation error. This covers `shopping_lists.plan_fingerprint` (entity pinned to `CHAR(64)`) and the `UserHiddenRecipe` mapping.
- `npm run check:version`: Version OK: 1.30.0.
- `npm run build`: built in about 1s, no errors (only the existing chunk size warning).
- Grep audits (Task M.2): all clean except one item noted below.

### Manual walkthroughs

- Task 28 (Meal Plan): not verified — pending developer walkthrough
- Task 49 (Recipes): not verified — pending developer walkthrough
- Task 60 (Header / logo): not verified — pending developer walkthrough
- Task 79 (Shopping): not verified — pending developer walkthrough

`manifest.webmanifest` will be replaced by `vite-plugin-pwa` when the PWA is bootstrapped.

## Implementation deviations for reviewers

- "This week" uses a today-start rolling 7-day window.
- `DateRangePicker.jsx` and `utils/dateUtils.js` were edited in Phase 12 for the week pill. Header padding changed to `0 12px` to get a 64px height.
- The 180 and 192 PNG icons were downscaled from the 512 Chrome export.
- Footer clearance uses `body:has(.footer--always)`.
- `useMealEatenSave` is shared between `PlanContextBar` and `MealEatenSection`.
- Extras toggle outside a plan entry: no endpoint writes a signed-in user's per-dish default (only `PUT /meal-plan/extras/week/choices`, which needs an entry). The toggle is therefore disabled for signed-in users with no plan entry, with the hint "Add this to your plan to choose per meal". Guests still use localStorage. A `PUT /meal-plan/extras/defaults` endpoint is a follow-up if per-dish defaults are wanted.
- The mobile sticky progress card on Shopping is not implemented.
- `WakeLockIcon.jsx` / `.css` were unused and have been deleted.
- `client/index.html` meta description now reads "My Pantry Plan - Recipes and Meal Planning" (Task M.2 Step 6 grep is clean).
- Review-fix pass: the plan-changed fingerprint now covers the same window as the shopping aggregator (`ShoppingListService.WINDOW_DAYS`, startDate..startDate+6; `fingerprint(ownerId, start)`); `PATCH /meal-plan/{id}` returns 400 for an unknown meal and 409 for a duplicate slot row; hide is an idempotent `INSERT ... ON DUPLICATE KEY` (`UserHiddenRecipeRepository.insertIfAbsent`); Undo on a hide is queued behind the hide request; the Recipes variant swap re-derives when the week plan arrives; a stale week refetch is dropped; `RecipeVariantMapper` is the single variant-DTO mapper.

## Follow-ups (deferred)

- `contexts/MealPlanContext.jsx` is still over the 400-line budget (pre-existing offender, 549 lines). Splitting it is a large context refactor, deferred out of this fix pass.
- Optional: per-dish extra-default write endpoint (see the extras toggle note above).

## Conventions

- Meal-plan card actions go through `useMealEntryActions`; layout picks via `useMediaQuery(MOBILE_MEDIA_QUERY)`.
- Recipes hide keys are the family default id (`hideKeyOf`); picking mode lives in the URL (`usePickingMode`).
