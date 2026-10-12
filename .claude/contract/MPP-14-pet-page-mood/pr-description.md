MPP-14: Pet page with Mochi moods replaces the Search tab

Plan: [plan.md](plan.md) (this folder)

## Summary

- The footer is now Recipes, Meal Plan, Pet, Shopping. The Pet tab shows a mini Mochi face and the pet's name. Guests see "Sign in to meet your pet!".
- `SearchView`, its CSS and the `/search` route are deleted, and the docs are refreshed.
- `/pet` shows the room, a speech bubble, a mood chip, a name editor and today's three meal tiles.
- Four moods are derived from today's meal logging: Content, Happy, Bored and Mischievous. They are computed client-side from the plan and the meal times.
- New `GET /api/pet` and `PUT /api/pet/name`. The name is stored on the plan owner (`users.pet_name`), so linked users share it. A dangling `meal_plan_owner_id` falls back to the caller's own row with a WARN log. The default name "Pip" lives only in `PetPolicy`.
- `MealEatenSection` shows a pet reaction ("Pip is happy! Lunch logged.") after "Mark as eaten".
- Version `1.5.0` (MPP-14, Story, MINOR bump). `package.json`, `pom.xml` and the top `CHANGELOG.md` line agree.

## Migrations: apply in order, before the backend deploys

`ddl-auto: validate` means an unapplied migration breaks startup.

1. `foodbytes-app/database/migrations/2026-10-12-mpp12-meal-plan-entry-eaten.sql`
2. `foodbytes-app/database/migrations/2026-10-12-mpp13-user-meal-times.sql`
3. `foodbytes-app/database/migrations/2026-10-12-mpp14-user-pet-name.sql`

Status (Task 2): all three have been applied to Railway by the developer and verified read-only.

## Verification

| Check | Result |
|---|---|
| `npm run check:version` | `Version OK: 1.5.0` |
| Stale-reference grep (`SearchView\|/search\|search-view`) | Zero hits. The now-dead `searchRecipeSummaries` and `searchRecipes` were removed from `services/recipeService.js` (the backend endpoints are untouched). |
| `console.log` / `console.debug` in the pet files | zero hits |
| `dangerouslySetInnerHTML` in `components/pet` | zero hits |
| Line budgets | Largest file is `mochiParts.jsx` at 130 lines, and every file is under 200 |
| `mvn test` (full suite) | BUILD SUCCESS, 156 tests, 0 failures, 0 errors, 0 skipped |
| `npm run check:pet` | `petMood: all checks passed` |
| `npm run build` | built in 672ms, no errors |

### Manual check (Task 23 Step 3): not exercised, developer manual verification

None of these ran. They need the local stack (backend on :8080 with the local DB, `npm run dev` on :5173, 375px viewport).

1. Guest: footer shows Recipes, Meal Plan, Pet, Shopping. Tapping Pet shows "Sign in to meet your pet!". There is no Search tab, and `/search` renders no page.
2. Signed in with nothing planned today: the tab label is "Pip". `/pet` shows the room, the bubble "Nothing due yet. Just vibing.", the chip "Content", three "Not planned" tiles, and "Log meals in Meal Plan" goes to `/mealplan`.
3. Plan today's lunch and set lunch's "by" time to a minute in the past: the face and chip turn Bored ("Bored · 1 unlogged"), and the footer mini face matches.
4. Open that lunch and tap "Mark as eaten": "Pip is happy! Lunch logged." appears under the button, and the footer face is Happy before the modal closes.
5. Rename via the pencil to "Bao", then reload: the name persists. A 13-character name cannot be typed (`maxlength`). Clearing the name and pressing Enter restores "Pip".
6. With OS reduced motion on: the pet does not animate.
7. If a linked test user is available: the linked user sees the same name and mood, and uses the owner's meal times.

## Convention note for contributors

The pet's mood is derived only in `client/src/utils/petMood.js`, and `npm run check:pet` pins it. Do not re-derive mood in a component. The default pet name lives only in `PetPolicy` on the backend.

## Suggested commit subject

`MPP-14: Pet page with Mochi moods replaces the Search tab`
