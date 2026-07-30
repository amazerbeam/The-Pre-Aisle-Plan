# PR: Route calories through the macro traversal — linked-extras kcal audit and fix

Plan: [`plan.md`](./plan.md)
Audit evidence: [`findings.md`](./findings.md)

---

## Summary

FoodBytes' macro engine (`MacroCalculationService`) was already correct: it walks raw ingredients plus prorated linked-recipe extras and, because it tests `isLinkedRecipe()` before `isRawIngredient()`, an FR-103 dual-path row always takes the homemade branch. Protein, carbs, and fat were right in every case.

**Calories were never computed at all.** Every kcal figure the app displayed — `RecipeCard`, meal-plan totals, the admin form — read the hand-entered `recipes.calories` column, which no code cross-checked. This PR:

- Adds `deriveKcal`, `calculateRecipeTotalCalories`, and `calculateCaloriesPerServing` to `MacroCalculationService` (Atwater 4P + 4C + 9F on unrounded `BigDecimal` totals, mirroring `client/src/constants/macroTargets.js` → `KCAL_PER_GRAM`), and wires every display call site — `RecipeService.convertToDTO`/`convertToSummaryDTO`/both variant-dropdown sites, `RecipeFamilyService.toVariantDTO`, `MealPlanService.calculateCaloriesPerServing` — onto that derivation instead of the stored column.
- Makes "nutrition always comes from the homemade linked recipe, never the store-bought ingredient" a **tested** invariant rather than a convention that depends on branch order nobody was watching.
- Fixes three latent traversal defects found while pinning the above: a cycle guard that also zeroed a *legitimately* repeated sub-recipe (never active in production, but the new tests would otherwise have encoded the bug as expected behaviour), premature rounding in `calculateTotalMacros` (summed per-recipe values already rounded to whole grams), and integer truncation on per-serving kcal (`Integer / Integer` silently floored, e.g. 1025/2 → 512 instead of 513).
- Fixes a malformed SLF4J debug format string (`{:.2f}` is not SLF4J syntax; it printed literally and left the argument list one short, dropping the fat value).
- Ships `MacroCalculationServiceTest` — **the service's first unit test class**, 15 tests covering proration, the 50g-of-300g portion ratio, zero-yield linked recipes, dual-path homemade-wins, a repeated sub-recipe counted twice, a genuine cycle cut once, and derived kcal matching 4P+4C+9F.
- Ships a DML-only data-correction migration for the audited defects (see below).
- Updates `CLAUDE.md` to document the new convention (see "New convention" below).

**Zero files under `client/src/` were touched, by design.** The DTO field names, types, and units are unchanged — only their *provenance* moved from the stored column to the derivation — so the frontend needed no edit. Phase 5 verified that claim rather than assuming it (see "Frontend verification" below).

---

## Headline evidence

Stored `recipes.calories` was computed on the **store-bought** basis — the one basis the developer explicitly ruled out for nutrition ("*We should never use the store bought calores, if store bough is chosen the cals sill come from homemade.*") — for **20 of the 48** recipes with linked extras.

This is proven, not inferred: for 9 of those 20 recipes, `stored − homemade_computed` equals the summed `store_bought − homemade` delta across that recipe's dual-path rows **to the exact kcal** (recipes 63, 81, 82, 83, 98, 99, 100, 120 — residual 0 in every case). Pizza (14) is the cleanest single case: dough batch 761 g / 2053 kcal, sauce batch 428 g / 207 kcal, recipe uses 260 g dough + 90 g sauce + 524 kcal raw toppings.

- **Homemade basis (correct):** 260/761 × 2053 + 90/428 × 207 + 524 ≈ **1269** kcal whole-recipe → **634**/serving.
- **Store-bought basis (what was stored):** 650 + 38 + 524 = **1212** — the stored `recipes.calories` value, exactly.

Full classification of all 48 recipes with extras, the residual table, the positive control (Pink Sauce Pasta, which matches within 1 kcal and proves the proration maths itself was always sound), and the four independent data defects found along the way are all in [`findings.md`](./findings.md).

---

## Migration — must be applied to Railway MySQL manually

**`foodbytes-app/database/migrations/2026-07-30-linked-extras-macro-kcal-corrections.sql` has NOT been applied to the live Railway MySQL and must be applied by hand before this is considered fully landed.** It is DML-only (no DDL), so `ddl-auto: validate` will **not** block backend startup if it's forgotten — which means a forgotten apply **fails silently**: the derived display stays correct (this PR's whole point) while the admin-editable `recipes.calories` column keeps disagreeing with it underneath.

Four sections, only two of which are ready to run as-is:

| Section | Status | Content |
|---|---|---|
| 1 | **Uncommented — ships ready to run**, but the 282 g value is a rule-compliant *ceiling* (Fresh Pasta's total yield), not a verified true portion. **Confirm against recipe 65's `recipe_steps` before running** — if the dish uses less than the full batch (e.g. "half the batch" = 141 g), lower the value first. | Recipe 65 (Pastichio) `quantity_grams` correction: claimed 454 g against Fresh Pasta's 282 g yield (ratio 1.61, over-attributing by 61%). |
| 2 | **Uncommented — ships ready to run, and is self-computing.** Written as a correlated `UPDATE ... JOIN` that derives each of the 20 targets live from `recipe_ingredients`/`ingredients` data, rather than 20 hand-typed numbers — deliberately, because only recipe 14's target (1269) is recorded anywhere in this contract's artifacts, and even that figure goes stale once the sibling `2026-07-30_stromboli_rebuild.sql` migration (same date, different task, unknown apply status) changes Pizza Dough's yield. Must run **after** Section 1 — it reads recipe 65's corrected `quantity_grams` live. Naturally idempotent (guarded `WHERE ... AND calories = <old value>`). | Realigns the 20 store-bought-basis `recipes.calories` rows onto the homemade basis. |
| 3 | **Fully commented — pending developer approval.** Both proposals are culinary/product-mapping judgement calls, not calculation fixes; nutrition is unaffected either way (homemade-only nutrition means these macros are never read for any displayed number) — this is a **shopping-list** correction only. Run the ingredient dedupe lookup per `.claude/rules/homemade-first-and-ingredient-dedup.md` before creating any new `ingredients` row. | `Milk Bread → Brioche Burger Buns` (wrong product — a loaf is needed, not buns) and `Fresh Pasta → Spaghetti (dried)` (dried vs fresh dough, no hydration factor; 100 g dried ≈ 250 g cooked). |
| 4 | **Fully commented — pending developer approval.** Family 4 (Pizza) has **four** members including recipe 107 "Balanced 2" at `display_order` 4; removing that member hides recipe 107 from the variant dropdown entirely, so it needs an explicit go-ahead rather than an automated delete. Family 26 (Paella Valenciana) has one member (recipe 90, `variant_label` NULL); the proposed `UPDATE` only fixes the label — it does **not** create the two missing Light/Balanced siblings `.claude/rules/recipe-variants.md` requires (that's a separate `chef` task). | Variant-family structure repairs. |

**The 13 "neither basis" recipes** (20, 21, 22, 28, 45, 46, 87, 119, 128, 136, 137, 138, 189) deliberately have **no** proposed `UPDATE` in this migration — no computed target exists for them in this contract's artefacts, and fabricating one would be worse than deferring. Once calories derive from the engine, the user-facing display is already correct regardless of what the admin column says; this is admin-column hygiene only, documented in the migration as a note (119's ~−40 residual, 28's −66 with no dual-path row at all, 118's 3).

---

## Verification results

### Backend

| Command | Result |
|---|---|
| `mvn test -Dtest=MacroCalculationServiceTest` | `Tests run: 15, Failures: 0, Errors: 0` — **PASS** |
| `mvn test -Dtest=MealPlanServiceTest` | `Tests run: 5, Failures: 0, Errors: 0` — **PASS** |
| `mvn test` (full suite) | `Tests run: 49, Failures: 0, Errors: 4` — overall **`BUILD FAILURE`** |

**Read the full-suite result correctly — this contract does not break the build.** All 4 errors are in `AuthControllerLoginTest`, and they are **pre-existing and unrelated**: it's a `@WebMvcTest(AuthController.class)` slice declaring only `@MockBean PasswordAuthService`, while `AuthController`'s constructor also requires `JwtCookieService` — so it fails with `No qualifying bean of type 'com.foodbytes.security.JwtCookieService'` and can never have passed. Nothing in this contract touches `AuthController`, `JwtCookieService`, or auth at all. **Baseline is 45 of 49 tests passing, and all 45 still pass after this change.** Per-class breakdown: `MealPlanCreateRequestTest` 4/4, `MacroCalculationServiceTest` 15/15, `MealPlanServiceTest` 5/5, `RecipeServiceMacroAuditTest` 5/5, `ShoppingListServiceTest` 16/16 — all passing; `AuthControllerLoginTest` 0/4, all pre-existing errors.

This is worth a separate one-line fix (`@MockBean JwtCookieService` added to that test class) — deliberately not done here, since that test class was never named in this contract's file list and fixing it is a decision the developer should make on purpose, not as an incidental side effect of an unrelated PR.

### Client

`npm run build` → `vite v5.4.21`, 179 modules transformed, `✓ built in 664ms`, **no errors**.

### The new JPQL is NOT machine-verified

`RecipeRepository.findAllLiveRecipesWithMacroGraph()` (the new `LEFT JOIN FETCH` finder backing the recipe-list N+1 fix) was never validated by a running JPA context. `AuthControllerLoginTest` — the step originally expected to exercise it — is a `@WebMvcTest` slice that does not load JPA repositories at all, and a full sweep of the test tree found **no** `@DataJpaTest` and **no** `@SpringBootTest` anywhere, so nothing in the suite boots a JPA context offline.

Hand-verified instead against the entity mappings: `r.meals` → `Recipe.meals` is `Set<RecipeMeal>`; `rm.meal` → `RecipeMeal.meal`; `r.ingredients` → `Recipe.ingredients` is `List<RecipeIngredient>`; `ri.ingredient` → `RecipeIngredient.ingredient`; `r.isLive` → `Recipe.isLive`. A `MultipleBagFetchException` risk was checked and cleared (only `ingredients` is a bag; `meals` is a `Set`, so the query fetches one bag only).

**First real boot against MySQL is the true validation.** If the query were malformed, the backend would fail to start under `ddl-auto: validate` — **check the Railway deploy logs after this lands.**

---

## Frontend — manual developer checks (no automated verification exists)

There is no frontend test runner and no lint script in `client/package.json`, so the following are explicit **manual** steps for the developer, not automated verification:

- `/search` at 390 px wide — a Pizza card should show **634 kcal** per serving (was 606).
- Open Greek Chicken Gyros → Moderate: card should show **765 kcal** (was 650), and the P/C/F badge percentages should sum to ~100% against that same figure.
- `/mealplan` — a day containing Pizza and Gyros should show a day total consistent with the sum of those two card figures.
- `MacroTargetPopup.jsx` has a pre-existing "kcal mismatch" banner that fires when `displayedCaloriesPerServing !== result.derivedKcal`. It should now **stop firing** for recipes with extras — passive confirmation the fix landed correctly.

What *was* verified (read-only review, not a test run): every kcal consumer in `client/src` was grepped and reviewed — `RecipeCard.jsx:59` still divides whole-recipe `recipe.calories` by `defaultServings`; `MealPlanContext.jsx:170,180,186` divide whole-recipe values for optimistic-update deltas (correct, same operation); no component was found double-dividing an already-per-serving field. `client/src/utils/macroStatus.js`'s `deriveKcal` (4P + 4C + 9F) is untouched and confirmed unchanged.

---

## New convention for future contributors

> **Nutrition always derives from the homemade linked recipe. Never read the store-bought ingredient's macros for a displayed number, and never hand-enter a store-bought calorie figure.**

`CLAUDE.md:75-77` was updated in this PR to carry this as a documented convention (previously it just said "stored calorie totals have historically been wrong — re-derive" without naming the store-bought/homemade distinction or the new service methods). **Open follow-up: nothing yet guards `recipes.calories` at write time.** `RecipeService.createRecipe`/`updateRecipe` still persist whatever `dto.getCalories()` arrives with, and the admin form still asks for a raw number — so the *display* is now safe, but the *admin column* can drift again exactly the way it did before. Worth deciding whether that field should become read-only in the admin UI, or validated against the derived value on save; either is a small, separate follow-up.

**Incidental fix in the same edit:** `CLAUDE.md` previously said the default recipe variant was **Balanced**, directly contradicting `.claude/rules/recipe-variants.md` ("this overrides the prior behavior where `Balanced` was the default... must use **Moderate** as the default"). Found while editing the adjacent bullet in the same section; corrected to Moderate in this PR.

---

## Files changed

**Created:**
- `.claude/contract/2026-07-30-linked-extras-macro-kcal-audit/findings.md` — audit evidence and verdicts
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MacroCalculationServiceTest.java` — 15 tests, the service's first unit test class
- `foodbytes-app/database/migrations/2026-07-30-linked-extras-macro-kcal-corrections.sql` — DML-only data corrections
- `.claude/contract/2026-07-30-linked-extras-macro-kcal-audit/pr-description.md` — this file

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MacroCalculationService.java` — `deriveKcal`, `calculateRecipeTotalCalories`, `calculateCaloriesPerServing`; path-scoped cycle guard; unrounded accumulation in `calculateTotalMacros`; fixed SLF4J format string
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeService.java` — `convertToDTO`/`convertToSummaryDTO`/both variant-dropdown sites now derive kcal; `convertToRecipeAdminDTO` deliberately left reading the stored column
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeFamilyService.java` — injected `MacroCalculationService`; `toVariantDTO` derives kcal instead of truncating `Integer / Integer`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java` — `calculateCaloriesPerServing` delegates to the service
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/RecipeRepository.java` — new `findAllLiveRecipesWithMacroGraph()` fetch finder
- `foodbytes-app/foodbytes-api/src/main/resources/application.yml` — `hibernate.default_batch_fetch_size: 32`
- `CLAUDE.md` — documents derived calories, homemade-only nutrition, and corrects the stale "default is Balanced" claim to Moderate

**Zero files under `client/src/`** — by design; the DTO contract is unchanged.

---

## Open items / risks (carried forward for reviewer sign-off)

1. **Displayed calories change for real recipes, by design, on at least 33 of the 48 with extras.** Homemade Big Mac (63) drops 3599 → 3087 whole-recipe; all three Greek Chicken Gyros variants rise (119: 650 → 765 kcal/serving); Pizza (14) rises 606 → 634 per serving. Directionally this is noise, not a systematic under-count, so daily meal-plan totals partly self-cancel — but it's a real, user-visible change worth a conscious sign-off before merge.
2. **Recipes outside the 48-with-extras audit set are affected too.** Switching `convertToDTO`/`convertToSummaryDTO` to derived kcal changes *every* recipe's displayed calories wherever the stored column disagreed with its ingredients — not only the audited 48. The audit quantified divergence for the extras set only; a full-database sweep was out of scope for this contract.
3. **Gyros variant 120 now lands at 967 kcal/serving — past the 900 reject ceiling.** Correcting the calculation is what exposes this (homemade pita is more calorific than the store-bought stand-in it was previously priced against). Fixing the *dish* is a `chef`-skill redesign, outside this contract. Same situation for recipes 63 (1543), 22 (1059), 46 (1056), 29 (904) — all breach the Balanced ceiling once computed correctly; full list and margins in `findings.md` §8.
4. **The new JPQL `findAllLiveRecipesWithMacroGraph()` is not machine-verified** (see "Verification results" above). Check Railway deploy logs on first push — a malformed query is a startup failure under `ddl-auto: validate`.
5. **`AuthControllerLoginTest` fails with 4 pre-existing, unrelated errors** (missing `@MockBean JwtCookieService`). Baseline 45/49 passing, all 45 still pass. The suite therefore reports `BUILD FAILURE` overall — **do not read that as this contract breaking the build.**
6. **`default_batch_fetch_size: 32` is a global Hibernate setting.** It changes collection-loading behaviour for every entity in the app, not just recipes. Well-understood and generally beneficial, but it's the one change here whose effect reaches beyond the audited code path.
7. **Cross-migration overlap with `2026-07-30_stromboli_rebuild.sql`** (same date, different task, unknown apply status). That migration also resyncs `recipes.calories` for 13/14/15/107 (to 1020/1206/1500/1553) and changes Pizza Dough (11) from 761 g/2053 kcal to 733 g/1800 kcal. This contract's Section 2 is self-computing SQL specifically *because* of this overlap — it derives targets from live data rather than hand-typed values, so it stays correct regardless of apply order between the two files. Review both together before applying either.
8. **Dead duplicate of the fixed bug, left alone.** `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanEntry.java:64-69` has a transient `getCaloriesPerServing()` performing the same truncating `recipe.getCalories() / recipe.getDefaultServings()` division this PR removed at the service layer. It is **dead code** — never called anywhere in `src/main` or `src/test` — and `MealPlanEntry.java` was outside this contract's file list, so it was deliberately left alone rather than opportunistically touched. Flagged here as a follow-up: delete it or route it through `MacroCalculationService`.
9. **Nothing prevents the next hand-typed calorie value from being store-bought again** — see "New convention" above.

## Developer decisions required before applying the migration

1. Confirm recipe 65's intended Fresh Pasta portion against its `recipe_steps` — Section 1 currently clamps to the 282 g yield ceiling, which may overstate the true portion if the dish uses less.
2. Approve or reject the Section 3 store-bought product substitutions (`Milk Bread → Brioche Burger Buns`, `Fresh Pasta → Spaghetti (dried)`) and confirm which real ingredient each should point at. Run the dedupe lookup per `.claude/rules/homemade-first-and-ingredient-dedup.md` first.
3. Choose the Section 4 resolution for family 4 (remove recipe 107, relabel it, or split it into its own family) and for family 26 (the proposed `UPDATE` fixes only the NULL label — the two missing siblings still need to be created as a separate `chef` task).
4. Apply Section 1 before Section 2 (Section 2 reads recipe 65's corrected `quantity_grams` live).
5. Deploy the backend and check the Railway logs for the new JPQL (item 4 above).
