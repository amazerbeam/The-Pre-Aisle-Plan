# MPP-1 — Shopping list overstates linked-recipe extra quantities

Plan: [`plan.md`](./plan.md) in this folder. Full task-by-task record: [`tasks.md`](./tasks.md).

## Summary

Fixes MPP-1: the shopping list and the ingredient-breakdown popup now prorate a linked-recipe
extra's raw ingredients by

```
(parent's quantity_grams for the link × parent's own batch fraction) / extra's own total yield
```

matching the formula `MacroCalculationService` already uses for macros — instead of scaling
the extra's raw ingredients by the parent's servings ratio alone, which silently assumed the
whole extra batch was always used.

Two shared private helpers in `ShoppingListService` — `resolveExtraPortionRatio(Recipe
parentRecipe, Long childRecipeId, BigDecimal parentRatio, Recipe childRecipe)` and
`findLinkedQuantityGrams(Recipe parentRecipe, Long childRecipeId)` — carry the proration math for
both aggregation paths in the class:

- **`getShoppingList`** (`processRecipeIngredients` / `processExtras`) — the ticket's literal
  reproduction target (Pastichio/Honey Ham: was showing 5000g instead of ~685g of Ham Fillet).
- **`getIngredientBreakdown`** (`collectIngredientUsages` / `collectUsagesFromExtras`) — the
  parallel "why is this ingredient here" popup, which the file's own javadoc states "must mirror
  `getShoppingList`." Previously it did not apply any proration at all. `IngredientUsage` (the
  private record the breakdown walk accumulates matches into) gained a fourth field, `ratio`, so
  each occurrence carries its own fully-resolved scale factor at collection time instead of a
  single post-hoc `entryServings/defaultServings` multiply applied uniformly regardless of
  whether the ingredient came from the main recipe or a nested extra.

Both paths now go through the same two helpers, so the popup's header total and the shopping-list
row it summarises are guaranteed to agree by construction — not by coincidence, as the pre-existing
regression test `breakdownTotalMatchesShoppingListRowForTheSameIngredient` locks in.

## No migration required

Pure service-layer logic fix. No schema, DTO shape, or entity change — `ShoppingItemDTO` and
`IngredientBreakdownDTO` are unchanged; only the numeric values they carry become correct.

## Verification results

**Phase 1** (`getShoppingList` path):
- Step 4 — `mvn test -Dtest=ShoppingListServiceTest#extraWithPartialPortionUsed_ProratesRawIngredientsByGramsNotServings+extraWithNoMatchingLinkedIngredientRow_SkipsProrationDefensively` → `BUILD SUCCESS`, 2/2 passing.
- Step 5 — full `ShoppingListServiceTest` → 18 tests, 1 known/attributed failure (`breakdownTotalMatchesShoppingListRowForTheSameIngredient`), root-caused to the fixture gap that Phase 2 Task 4 Step 3 closes. Documented in `tasks.md` Task 3.

**Phase 2** (`getIngredientBreakdown` path):
- Task 4 Step 4 — three updated breakdown tests run against pre-fix code → `BUILD FAILURE`, 3/3 failing exactly as predicted (`150.00` vs `300.00`, `18.00` vs `60.00`, `1.25` vs `1.50`). Confirms the fixture changes alone don't fix anything.
- Task 5 Step 4 — same three tests after the production fix → `BUILD SUCCESS`, 3/3 passing.
- Task 5 Step 5 — full `ShoppingListServiceTest` → `BUILD SUCCESS`, **18 tests run, 0 failures, 0 errors**. Every test in the class, old and new, is green.

**Phase 3**:
- Task 6 — grep audits for stale old-signature call sites: both zero-hit / single-hit expectations confirmed exactly.

## Note for future contributors

Any new linked-recipe-extra proration logic should call `ShoppingListService`'s
`resolveExtraPortionRatio` / `findLinkedQuantityGrams` (or `MacroCalculationService`'s equivalent
for macros) rather than re-deriving the ratio inline. This ticket exists because that formula
previously lived in only one of the two places it was needed — `MacroCalculationService` had it
right for macros; `ShoppingListService` didn't have it at all for either of its own two aggregation
paths.

## Delegated to QA

- Task 7, Step 1 — `cd foodbytes-app/foodbytes-api; mvn test` (full backend suite) — Expected:
  per the project's known baseline (`AuthControllerLoginTest` pre-existing failure — unrelated,
  no test boots a JPA context), overall `BUILD FAILURE` is expected from that class, but
  `ShoppingListServiceTest` and `MacroCalculationServiceTest` must show 0 failures/0 errors in
  their own output, and no test outside `ShoppingListServiceTest` should newly fail because of
  this change. Not run here — the Implementer's targeted-test-only policy reserves the full-suite
  run for QA's single end-of-contract validation gate.
