# MPP-10: Homemade / store-bought extra choices saved server-side

Plan: [`plan.md`](plan.md) (tasks: [`tasks.md`](tasks.md))

## Summary

- Homemade vs store-bought choices for recipe extras are now stored on the server, per planned meal and per template entry, plus per-family defaults (`user_extra_defaults`).
- New **Manage extras** popup (menu item on `/mealplan`, and an **Extras** button per template) to flip choices for a whole week or a template. Regenerate bar appears when a flip overlaps an existing shopping list. Calendar cards show a cart icon when a meal has a store-bought extra.
- Store-bought extras with a product are listed in grams on the shopping list (and in the breakdown popup).
- 32 missing `recipe_extras` rows added (data migration).
- MPP-8 selection plumbing removed (`HomemadeSelectionsDTO`, client-sent `selections` at generate time). Legacy localStorage choices are uploaded once on first load.
- Version bumped to 1.2.0.

## Required ordering

1. Apply `foodbytes-app/database/migrations/2026-10-10-mpp10-extra-choices-schema.sql` to Railway MySQL **BEFORE** the backend redeploys (`ddl-auto: validate` fails startup otherwise). **Not yet applied as of 2026-10-10.**
2. Redeploy the backend.
3. Apply `foodbytes-app/database/migrations/2026-10-10-mpp10-recipe-extras-missing-links.sql` (data only; after the schema file).

## Behaviour change

- Toast, granola, dippers and soup extras now pull the **homemade sub-recipe ingredients** onto the shopping list until switched to store-bought.
- Milk Bread, Granola, Honey Ham and the soup Fresh Pasta have no store-bought product, so choosing store-bought gives the generic "Store Bought [Recipe]" row.
- A store-bought extra that has a product but no link row now falls back to the generic row (previously it could vanish).

## Convention

Homemade/store-bought choices live in `meal_plan_entry_extra_choices` / `meal_plan_template_entry_extra_choices` / `user_extra_defaults` — never send them from the client at generate time; use `ExtraChoiceService`.

## Verification

- Targeted backend tests (implementation): 73 tests, all passing — MealPlanServiceTest 16, ManageExtrasServiceTest 8, MealPlanTemplateServiceTest 6, ExtraChoiceServiceTest 14, ShoppingListServiceTest 28, ShoppingListControllerTest 1.
- Full `mvn test` after review fixes: 118 tests, 0 failures, 0 errors, BUILD SUCCESS. `npm run build` in `client`: passes.
- Concurrent writes to the same choice (two devices, linked accounts, double tap) that hit a unique key return HTTP 409 `{"error": "That choice was changed at the same time on another device. Try again."}` from the extras PUT/POST endpoints and from `POST /meal-plan` (assign); the client reverts the optimistic change and shows the error. Legacy import and `extraChoices` are size-bounded (400 on oversize). A missing `g` unit degrades store-bought items to the generic "Store Bought X" rows.
- `npm run check:version`: `Version OK: 1.2.0`
- Greps (Task 24): no `HomemadeSelectionsDTO` references; one remaining `getShoppingListWithSelections` hit is only the Java method name of the kept-for-compatibility `POST /shopping-list` endpoint in `MealPlanController` (it ignores selections and reads stored choices). `MealPlanContext.jsx` 559 lines and `RecipeViewModal.jsx` 405 lines (not grown); no new `console.log/debug`; no CSS modules; no `localhost:8080`.
- Manual play-test (Task 27) is owned by the developer after migrations are applied and the backend is deployed.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
