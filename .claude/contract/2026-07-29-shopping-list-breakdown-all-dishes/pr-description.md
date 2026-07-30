# Shopping-list ingredient breakdown lists every dish that uses the ingredient

**Contract:** `.claude/contract/2026-07-29-shopping-list-breakdown-all-dishes/`
(`plan.md` = alignment + technical design, `tasks.md` = the executed checklist with per-step results)

## Summary

Long-pressing an ingredient row in the shopping list opened a breakdown popup that listed only **one** dish,
even when the row was aggregated from seven. The popup's own header total was recomputed inside the same
filtered loop, so it silently disagreed with the shopping-list row the user had just tapped.

Root cause was a single `continue` in `ShoppingListService.getIngredientBreakdown`:

```java
if (mainRecipeId != null && !recipe.getId().equals(mainRecipeId)) continue;
```

That turned the row's FR-102 `sourceChain` provenance hint into a hard filter over the week's meal-plan entries.
The hint is unreliable **by construction**: `processRecipeIngredients` aggregates on `(ingredientId, unitId)` and,
in its `compute` block, stores `sourceChain` only for the **first** contributing recipe — later contributors add
quantity via `existing.totalQuantity.add(...)` and their chain is discarded. So the breakdown was filtering a
multi-recipe row down to whichever recipe aggregation happened to visit first.

**After this change** the endpoint scans **every** meal-plan entry in the 7-day window, and for each entry
searches the main recipe **plus its extras tree, recursively** — the same ground the aggregation walks. Every hit
is counted, so `totalQuantity` now matches the shopping-list row for the default all-homemade case. The popup
renders a second line per row (`Mon 27 Jul · Dinner · via Pizza Dough`) so three plannings of one dish no longer
read as three duplicated rows.

## Changes

**Backend**
- `dto/MealIngredientUsageDTO.java` — new nullable `String viaRecipeName` (the extra a hit came from; `null` for
  main-recipe hits). Widens the Lombok `@AllArgsConstructor` 5 → 6 params; `ShoppingListService` is the only caller.
- `service/ShoppingListService.java`
  - `getIngredientBreakdown` (201–299) rewritten: filter removed, full-week scan, recursive extras walk.
  - New private `collectIngredientUsages`, `collectUsagesFromExtras`, and an `IngredientUsage` carrier —
    a `private record` (three immutable fields; Java 17, matching `dto/PasswordLoginRequest`).
  - Two request-scoped `HashMap`s memoise the extras tree per `recipeId` and the loaded extra `Recipe` per id,
    so each distinct recipe/extra is fetched at most once per call instead of once per entry
    (~21 entries × (1+n) queries on every long-press otherwise).
  - **Extras load via plain `findById`, deliberately — see "The `findWithDetailsById` trap" below.**

**Frontend**
- `components/shopping/IngredientBreakdownPopup.jsx` — `formatPlanDate` + `formatMealContext` helpers;
  `.meal-details` wrapper around name + new context line. `formatPlanDate` delegates to the existing
  `parseISODate` from `utils/dateUtils` rather than re-inlining the same three-line local-date parse
  (it would have been the third copy). **141 lines**, well inside the 400-line budget.
- `components/shopping/IngredientBreakdownPopup.css` — `.meal-details` / `.meal-name` / `.meal-context`;
  `flex: 1` moved off `.meal-name` onto the wrapper, with `min-width: 0` so `text-overflow: ellipsis`
  still works on the flex child. `.meal-context` is **`#666`** (5.74:1 on white), not `#777` — at
  `0.75rem`/12px it is normal-size text, so it needs the full WCAG AA 4.5:1 and `#777` only reaches 4.48:1.

**Tests**
- `src/test/java/com/foodbytes/service/ShoppingListServiceTest.java` — **7 new tests** for
  `getIngredientBreakdown` (class goes 7 → 14):
  - multi-recipe — the regression guard: `sourceChain` says "recipe 70 only" and the second dish must still appear;
  - servings scaling + repeated-dish rows, **plus** `verify(recipeExtrasService, times(1)).hasExtras(57L)` so the
    per-request memoisation (AC 7) can't be silently removed by a later edit;
  - extras attribution via `viaRecipeName`;
  - **nested** extras — Pizza → Pizza Sauce → Pesto with the ingredient in the *grandchild*, the only fixture that
    enters the recursive branch of `collectUsagesFromExtras`; also pins that scaling uses the **main** recipe's
    `defaultServings` (30 × 4 / 2 = 60), not an intermediate extra's;
  - **`breakdownTotalMatchesShoppingListRowForTheSameIngredient`** — the AC 3 invariant. One fixture drives
    **both** `getShoppingList` and `getIngredientBreakdown` (two dishes on different days, one contributing
    directly and one only via an extra) and asserts the breakdown header equals the aisle-grouped row's
    `totalQuantity`, and that the individual `mealBreakdown` rows sum to it. The two traversals are now separate
    code paths, so without this a scaling change in one and not the other would keep every other test green while
    the popup stopped summing to the row. **They do match** (1.50 tbsp);
  - the `"Unknown Ingredient"` sentinel, and shared-meal-plan-owner routing.

### The `findWithDetailsById` trap (supersedes `plan.md`)

`plan.md` Task 2 specified `recipeRepository.findWithDetailsById` for loading extras, as a query optimisation.
**That is unsafe for this caller and the code now uses plain `findById`.** The finder's `@EntityGraph` LEFT JOIN
FETCHes *two* collections — `ingredients` (a `List` with no `@OrderColumn`, i.e. a Hibernate **bag**) and `meals`
(a `Set`). The SQL result is the cartesian product `|ingredients| × |meals|`, and bag initialisation does not
de-duplicate: the `Set` collapses, the `List` does not. Every `RecipeIngredient` therefore appears once per
`recipe_meals` row.

`collectIngredientUsages` **sums** over `recipe.getIngredients()`. Concretely: tag `Pita Bread` (recipe 117,
4 ingredient rows) with a second meal, and long-pressing *Bread flour* would show two 300 g rows and a 600 g
header against a shopping-list row correctly reading 300 g — the popup and the row diverging by exactly the
meal-tag count, because `processExtras` uses plain `findById` and so the list itself stays right.

Masked today only because every recipe currently used as an extra has exactly one `recipe_meals` row, and the
pre-existing `findWithDetailsById` caller (`RecipeExtrasService:61`) only builds a `Map`, where duplicates are
harmless. This was the **first summing caller**. `findById` + the existing `@BatchSize(20)` on
`Recipe.ingredients` costs ~1–2 queries per call (repeated tree entries share one `Recipe` via session
identity), so correctness costs essentially nothing here. A javadoc block and an inline comment record the
reasoning at the call site so it isn't "optimised" back.

### Correctness note worth reviewing

Extras scale off the **main** recipe's `defaultServings`, passed down unchanged through every nesting level —
this mirrors `processExtras` exactly. Using the extra's own `defaultServings` would make the popup total diverge
from the shopping-list row for any recipe whose extras have a different default. Cycle safety is inherited:
`RecipeExtrasService.buildExtrasTree` already tracks a `visited` set.

## Deliberately not changed

- **Aggregation provenance.** `IngredientAggregate` still keeps only the first contributor's `sourceChain`.
  That is the upstream cause, but once the breakdown stops trusting the chain it no longer matters for this bug.
  Changing it to `List<List<Long>>` touches the hot path that builds the entire shopping list — deferred.
- **The `sourceChain` query parameter.** Still accepted on
  `GET /api/meal-plan/shopping-list/ingredient-breakdown`, still sent by `shoppingService.js`. Now
  **accepted-and-ignored**, documented as such in the method javadoc. Deleting it end-to-end would change the
  public API shape and couple the FE and BE deploys for zero behavioural gain.
- **Homemade / store-bought selections.** This is a GET with no `HomemadeSelectionsDTO` body, so extras are
  treated as homemade — the same default aggregation uses when no selections are supplied.
  **⚠️ The consequence is bigger than "a few extra rows", and the javadoc now says so explicitly.** The
  persisted row comes from `getShoppingList(…, homemadeSelections)`, and `processExtras` **skips a store-bought
  extra's entire ingredient subtree**, substituting a single raw store-bought ingredient. Because the breakdown
  assumes homemade, it does not merely list phantom rows — it **over-states `totalQuantity` by that whole
  subtree's contribution**, so the header the popup presents as authoritative for the row can *exceed* the row.
  **38 FR-103 dual-path rows exist in the live DB**, so this is broadly reachable, and it is not cosmetic.
  Documented, not fixed: the honest fix is a POST carrying the selections, which needs a new request shape.
- **`mealType` sort order.** The retained comparator sorts date-then-`mealType`, i.e. alphabetically —
  breakfast → dinner → lunch → snacks, not chronologically. Pre-existing, but now *visible* because each row
  shows its meal name. `meals.display_order` exists and would fix it; left out to keep this diff reviewable.
- The popup's silent failure path (`ShoppingListItem.startLongPress` swallows a failed fetch into
  `console.error` and shows the user nothing), the long-press interaction itself, and the meal-type
  string-literal debt. This change adds **zero** new meal-type literals — hence the derived
  `charAt(0).toUpperCase()` label instead of a new `{breakfast: 'Breakfast', …}` map.

## ⚠️ Verification status — read before merging

**`mvn clean test` did NOT run. Neither did `mvn compile`. No backend code in this PR has ever been compiled.**

The executing host (Windows 11) has **no JDK, no Maven, no Docker, and no git** — `mvn`, `mvn.cmd`, `java`,
`javac`, `docker`, `git` all resolve to NOT FOUND and `JAVA_HOME` is empty. Only `node`/`npm` are present. The
plan was authored on this same host and anticipated this. In place of a compile, each backend phase ran a
by-inspection audit against real source: every referenced type, member, constructor arity, and generic inference
site was checked (`getEffectiveMealPlanOwnerId`, `findByUserIdAndDateRange`, `hasExtras`, `buildExtrasTree`'s
`Set<Long> visited`, the `computeIfAbsent` ternary inferring to `List<RecipeExtraNodeDTO>`,
`IngredientBreakdownDTO`'s 5-arg constructor, all entity getters, and that exactly one
`new MealIngredientUsageDTO(...)` call site exists module-wide). All checks passed — but **inspection is not a
compiler.** The Railway build, or a reviewer with a JDK 17, is the first real compile.

The same applies to the post-review fix pass: the `findById` swap, the record conversion, and the three new /
extended tests were all audited by reading source, not compiled.

**What did run:**
- ✅ `npm run build` (twice — after the original change and after the review fixes) — `vite v5.4.21`,
  `✓ 169 modules transformed`, `✓ built in 796ms`, exit 0, no transform errors. The module count is unchanged by
  the `parseISODate` import because `dateUtils` was already in the graph.
- ✅ Static greps — `mainRecipeId` has **0 hits** module-wide (the deleted filter's local is gone); `sourceChain`
  is intact at all four expected sites (controller parse, service signature + javadoc + `IngredientAggregate`,
  `ShoppingItemDTO`, `shoppingService.js`); `usage.` has exactly three read sites, all converted to record
  accessors; `findWithDetailsById` no longer appears in `ShoppingListService` or its test.

**Smoke test (Task 9): NOT RUN.** It needs a running backend, which needs a JDK or Docker. The plan's expected
result — 7 distinct dishes for `Chicken breast` and a **1810 g** header total for `user_id = 1` over
27 Jul – 2 Aug 2026, derived from live Railway MySQL during planning — is therefore an **expectation, not an
observation**. `tasks.md` → Task 9 carries a verbatim hand-off (what to launch, what to hold, what number to
expect, and what each failure mode would indicate).

**AC 3 is no longer wholly unproven, though.** `breakdownTotalMatchesShoppingListRowForTheSameIngredient` pins
the "popup header == shopping-list row" invariant at the unit level, driving both methods off one fixture. That
is a unit-level proof, not the end-to-end 1810 g observation — the live number is still unverified.

## Findings a reviewer should know about

1. **The test file was merged, not created.** The plan asserted `foodbytes-api` "has no `src/test` directory at
   all". False — it has four test classes (`ShoppingListServiceTest`, `MealPlanServiceTest`,
   `MealPlanCreateRequestTest`, `AuthControllerLoginTest`), and `ShoppingListServiceTest` already held **7
   `getShoppingList` tests (FR-019/FR-020)**. Following the plan's `Create:` literally would have silently
   deleted that coverage. The new tests were appended instead; the class now has **16** `@Test` methods —
   **9** `getShoppingList` tests (7 that predated this contract plus 2 fractional-servings tests that arrived
   with the concurrent `decimal-serving-size` work) and **7** `getIngredientBreakdown` tests from this change.
2. **A pre-existing test bug was repaired in passing.** `ShoppingListServiceTest` declared only
   `mealPlanEntryRepository` as a `@Mock` while `ShoppingListService` takes **five** constructor deps, so
   `@InjectMocks` was injecting `null` for the other four — `getShoppingList` → `getEffectiveMealPlanOwnerId` →
   `userRepository.findById` would NPE. **All 7 legacy tests were already failing before this contract.** The
   four missing `@Mock` fields were added; no new stubbings were needed (unstubbed Mockito defaults give
   `Optional.empty()` → `orElse(userId)`, which matches their existing `eq(userId)` expectations, and `false`
   for `hasExtras`).
3. **`AuthControllerLoginTest` is probably red for unrelated reasons.** It is `@WebMvcTest(AuthController.class)`
   with a single `@MockBean PasswordAuthService`, but `AuthController` declares two final deps —
   `PasswordAuthService` **and** `JwtCookieService` (`AuthController.java:23-24`). `@WebMvcTest` does not register
   `@Service` beans, so context startup should fail on the missing `JwtCookieService`. Unverified (cannot run
   here). **Pre-existing — don't blame a red suite on this PR without checking.** `MealPlanServiceTest`, by
   contrast, mocks all 6 of its deps correctly.
4. **Whole-suite count is ~25, not the plan's stated 5** (ShoppingListServiceTest 16, MealPlanServiceTest 3,
   MealPlanCreateRequestTest 2, AuthControllerLoginTest 4).
5. ~~**`formatPlanDate` duplicates `parseISODate`**~~ — **fixed in review.** It now imports `parseISODate` from
   `client/src/utils/dateUtils.js` instead of becoming a third byte-identical copy (`CopyWeekModal.jsx:59-60` is
   the second). Behaviour unchanged; the `if (!planDate) return ''` guard is retained.
6. ~~**`.meal-context` is `#777` on white ≈ 4.48:1**~~ — **fixed in review.** Changed to `#666` (5.74:1), which
   is also what 10 other component stylesheets already use for secondary text. At `0.75rem`/12px this is
   normal-size text, so the 3:1 large-text allowance does not apply and `#777` genuinely failed AA.
7. **Locale is deliberately `en-GB`, and the codebase is therefore mixed.** The new formatter uses `en-GB`
   (required for the specified "Mon 27 Jul"; `en-US` renders "Mon, Jul 27"), while
   `dateUtils.js` (`getShortDayName`, `formatDateShort`) and `ShoppingListHeader.jsx:27-32` use `en-US`.
8. **The plan's grep expectations were over-broad in two places** and are annotated inline in `tasks.md`:
   Task 7 Step 1's "zero hits" can't be met because `extraRecipeId` is also a local in `processExtras` (an
   out-of-scope method), and the 168-module Vite baseline is stale (the real count is 169, and this change adds
   no import or file, so it cannot move that number).

## Note for future contributors

**`ShoppingItemDTO.sourceChain` must never be used as a filter.** A shopping-list row is aggregated across
recipes, but `IngredientAggregate` records only the **first** contributing recipe's chain — every later
contributor's provenance is discarded. That is exactly the trap this PR fixes. The breakdown endpoint now
**accepts and ignores** the parameter.

## Deployment

**No schema change → no migration.** Nothing to add under `foodbytes-app/database/migrations/` and no DDL to
apply to the Railway MySQL. Hibernate stays happy in `validate` mode. A normal backend redeploy (git push) plus a
client rebuild is sufficient.
