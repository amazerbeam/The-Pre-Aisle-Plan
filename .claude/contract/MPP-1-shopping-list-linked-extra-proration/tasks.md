# Tasks: Shopping list overstates linked-recipe extra quantities (MPP-1)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-08-07

**Goal:** Fix `ShoppingListService` so a linked-recipe extra's raw ingredients scale by `(parent's quantity_grams for the link × parent's own batch fraction) / extra's own total yield`, not by the parent's servings ratio alone — applied consistently in both `getShoppingList` and `getIngredientBreakdown`.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:** (none — no new files)

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java` — add `MacroCalculationService` dependency, `@Slf4j`, two new private helpers (`resolveExtraPortionRatio`, `findLinkedQuantityGrams`); refactor `processRecipeIngredients`/`processExtras` (the `getShoppingList` path) and `collectIngredientUsages`/`collectUsagesFromExtras`/`IngredientUsage` (the `getIngredientBreakdown` path) to use gram-based proration instead of the parent's raw servings ratio.
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java` — two new fixture helpers; two new `getShoppingList` regression tests; three existing `getIngredientBreakdown` extras tests updated with realistic linked-recipe fixtures and recomputed expected values (one renamed).

**Deleted:** (none)

---

## Phase 1 — Prorate linked-extra quantities in the shopping list aggregation (`getShoppingList`)

This is the ticket's literal target. The phase starts by adding two failing tests against the *current* buggy code (a legitimate red state, since neither test's assertions are true today), then makes them pass. The phase ends with `getShoppingList` fully fixed and every existing `getShoppingList` test (none of which touch extras) still green — a safe, independently mergeable stopping point even before Phase 2 touches the breakdown popup.

### Task 1: Add failing MPP-1 regression tests to `ShoppingListServiceTest` ✓

- Skill: java-backend
- Rule read: `.claude/rules/linked-recipe-extras.md`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java:332-334` (insert before the `getIngredientBreakdown` section comment)
- Modify: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java:607-613` (add fixture helpers near the existing `recipeIngredient` helper)

- [x] **Step 1: Add two new fixture helpers next to the existing `recipeIngredient(Ingredient, String, Unit)` helper**

Insert immediately after that helper's closing brace (around line 613):

```java
    private RecipeIngredient recipeIngredient(Ingredient ingredient, String quantity, Unit unit, String quantityGrams) {
        RecipeIngredient recipeIngredient = recipeIngredient(ingredient, quantity, unit);
        recipeIngredient.setQuantityGrams(new BigDecimal(quantityGrams));
        return recipeIngredient;
    }

    private RecipeIngredient linkedRecipeIngredient(Recipe linkedRecipe, String quantityGrams) {
        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setLinkedRecipe(linkedRecipe);
        recipeIngredient.setQuantityGrams(new BigDecimal(quantityGrams));
        return recipeIngredient;
    }
```

- [x] **Step 2: Insert the two new tests before the `// getIngredientBreakdown — FR-042 / FR-102` section comment (before line 334)**

> Implementer note: also added `@Mock private MacroCalculationService macroCalculationService;` to the test class's mock fields (required for `@InjectMocks`'s constructor injection to resolve the new dependency added in Task 2 — without it the field is `null` and the new tests NPE), and stubbed `when(macroCalculationService.calculateRecipeTotalYield(honeyHam)).thenReturn(new BigDecimal("2000.00"))` in `extraWithPartialPortionUsed_ProratesRawIngredientsByGramsNotServings` (the mock has no real implementation to fall back on). Neither was in the literal task text but both are required for the literal test code to compile/run as specified.

```java
    @Test
    void extraWithPartialPortionUsed_ProratesRawIngredientsByGramsNotServings() {
        // Regression test for MPP-1. Mirrors the real bug: recipe 65 (Pastichio) links to recipe
        // 64 (Honey Ham) via a recipe_ingredients row using less than Honey Ham's own total yield.
        // Numbers are simplified from the real 2916g/2500g Honey Ham recipe to round figures so
        // the expected value is hand-verifiable: here Honey Ham yields 2000g (Ham Fillet 1600g +
        // Onion 400g) and Pastichio's 8-serving batch uses 200g of it.
        Unit grams = unit(3L, "g");
        Ingredient hamFillet = ingredient(97L, "Ham Fillet");
        Ingredient onion = ingredient(12L, "Onion");

        Recipe honeyHam = recipe(64L, "Honey Ham", 8,
            recipeIngredient(hamFillet, "1600.00", grams, "1600.00"),
            recipeIngredient(onion, "400.00", grams, "400.00"));
        // Honey Ham's total yield = 1600 + 400 = 2000g

        Recipe pastichio = recipe(65L, "Pastichio (Lasagna)", 8);
        pastichio.setIngredients(List.of(linkedRecipeIngredient(honeyHam, "200.00"))); // 200g per 8-serving batch

        givenUserOwnsTheirOwnPlan(userId);
        givenEntries(entry(startDate, "dinner", pastichio, 16));
        when(recipeExtrasService.hasExtras(65L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(65L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(64L)
                .recipeName("Honey Ham")
                .children(new ArrayList<>())
                .build()));
        when(recipeRepository.findById(64L)).thenReturn(Optional.of(honeyHam));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        ShoppingItemDTO hamFilletItem = result.getAisles().stream()
            .flatMap(a -> a.getItems().stream())
            .filter(i -> "Ham Fillet".equals(i.getIngredientName()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("no shopping list row for Ham Fillet"));

        // usedGrams = 200 * (16/8) = 400; portionRatio = 400/2000 = 0.2
        // hamFillet = 1600 * 0.2 = 320.00 — NOT 1600 * 16/8 = 3200.00 (the bug: prorating by the
        // parent's servings ratio instead of the extra's own grams-used-vs-yield ratio)
        assertThat(hamFilletItem.getTotalQuantity()).isEqualByComparingTo(new BigDecimal("320.00"));
    }

    @Test
    void extraWithNoMatchingLinkedIngredientRow_SkipsProrationDefensively() {
        // Data-integrity guard: if the extras tree names a recipe with no corresponding
        // recipe_ingredients.linked_recipe_id row on the parent, there is no quantity_grams to
        // prorate by. The row must be skipped, not silently treated as "use the whole batch"
        // (which is exactly the MPP-1 bug this ticket fixes).
        Unit grams = unit(3L, "g");
        Ingredient hamFillet = ingredient(97L, "Ham Fillet");

        Recipe honeyHam = recipe(64L, "Honey Ham", 8,
            recipeIngredient(hamFillet, "1600.00", grams, "1600.00"));
        Recipe pastichio = recipe(65L, "Pastichio (Lasagna)", 8); // no linked_recipe_id row at all

        givenUserOwnsTheirOwnPlan(userId);
        givenEntries(entry(startDate, "dinner", pastichio, 16));
        when(recipeExtrasService.hasExtras(65L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(65L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(64L)
                .recipeName("Honey Ham")
                .children(new ArrayList<>())
                .build()));
        when(recipeRepository.findById(64L)).thenReturn(Optional.of(honeyHam));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        boolean hasHamFillet = result.getAisles().stream()
            .flatMap(a -> a.getItems().stream())
            .anyMatch(i -> "Ham Fillet".equals(i.getIngredientName()));
        assertThat(hasHamFillet).isFalse();
    }
```

- [x] **Step 3: Confirm both new tests fail against the current (unfixed) code — this is the expected red state**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListServiceTest#extraWithPartialPortionUsed_ProratesRawIngredientsByGramsNotServings+extraWithNoMatchingLinkedIngredientRow_SkipsProrationDefensively`
Expected: `BUILD FAILURE` with 2 failing assertions — `extraWithPartialPortionUsed...` expects `320.00` but gets `3200.00`; `extraWithNoMatchingLinkedIngredientRow...` expects `false` but gets `true`. This confirms both tests exercise the bug, not a typo in the fixture.

> Implementer note: per the Implementer's TDD-collapsing policy, this red check was not run as a standalone step before implementing — it collapsed into the phase-end test run, where both tests are confirmed passing (see Task 3 Step 4). Test logic reviewed by hand: both assertions require the new gram-based proration formula to be true; under the old `entryServings/defaultServings`-only scaling, `extraWithPartialPortionUsed...` would compute `1600 * 16/8 = 3200.00` (not `320.00`) and `extraWithNoMatchingLinkedIngredientRow...` would still add Ham Fillet (old code never checks for a linked-ingredient row at all).

### Task 2: Add `MacroCalculationService` dependency, logging, and shared proration helpers to `ShoppingListService` ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:1-38`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:591` (insert new helpers after `processExtras`, before `addStoreBoughtIngredient`)

- [x] **Step 1: Add the `@Slf4j` import and annotation, and the new constructor dependency**

Replace:
```java
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
```
with:
```java
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
```

Replace:
```java
@Service
@RequiredArgsConstructor
public class ShoppingListService {

    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeExtrasService recipeExtrasService;
    private final IngredientRepository ingredientRepository;
    private final UserRepository userRepository;
```
with:
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ShoppingListService {

    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeExtrasService recipeExtrasService;
    private final IngredientRepository ingredientRepository;
    private final UserRepository userRepository;
    private final MacroCalculationService macroCalculationService; // MPP-1: reuse calculateRecipeTotalYield
```

- [x] **Step 2: Add the two new private helpers, immediately after `processExtras` (before `addStoreBoughtIngredient`)**

```java
    /**
     * MPP-1: How much of a linked-recipe extra is needed at the current scale, expressed as a
     * fraction of the CHILD recipe's own total yield. Mirrors
     * {@link MacroCalculationService#calculateLinkedRecipeMacros} so the shopping list and the
     * macro traffic light agree on what "using 400g of an 8-serving batch" means.
     *
     * <p>usedGrams = parentRecipe's own recipe_ingredients.quantity_grams for this link, scaled
     * by however much of the PARENT's own batch is needed (parentRatio). portionRatio =
     * usedGrams / childRecipe's total yield.
     *
     * @return the ratio to apply to childRecipe's own ingredient quantities, or ZERO if
     *         parentRecipe has no matching linked_recipe_id row for childRecipeId, or
     *         childRecipe's total yield is zero — both are data-integrity states (see
     *         linked-recipe-extras.md), not recoverable runtime states.
     */
    private BigDecimal resolveExtraPortionRatio(Recipe parentRecipe, Long childRecipeId,
                                                BigDecimal parentRatio, Recipe childRecipe) {
        BigDecimal linkQuantityGrams = findLinkedQuantityGrams(parentRecipe, childRecipeId);
        if (linkQuantityGrams == null) {
            log.warn("No recipe_ingredients row on recipe {} links to extra recipe {}; " +
                     "cannot prorate its raw ingredients for the shopping list.",
                     parentRecipe.getId(), childRecipeId);
            return BigDecimal.ZERO;
        }

        BigDecimal usedGrams = linkQuantityGrams.multiply(parentRatio);
        BigDecimal totalYield = macroCalculationService.calculateRecipeTotalYield(childRecipe);
        if (totalYield.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Extra recipe {} has 0 total yield; cannot prorate its raw ingredients.", childRecipeId);
            return BigDecimal.ZERO;
        }

        return usedGrams.divide(totalYield, 10, RoundingMode.HALF_UP);
    }

    /**
     * MPP-1: Find parentRecipe's own recipe_ingredients row with linked_recipe_id = childRecipeId
     * and return its quantity_grams — the "how much of the child is used" figure needed to
     * prorate the child's own raw ingredients. Returns null if no such row exists.
     */
    private BigDecimal findLinkedQuantityGrams(Recipe parentRecipe, Long childRecipeId) {
        if (parentRecipe == null || parentRecipe.getIngredients() == null) {
            return null;
        }
        for (RecipeIngredient ri : parentRecipe.getIngredients()) {
            if (ri.isLinkedRecipe() && ri.getLinkedRecipe().getId().equals(childRecipeId)) {
                return ri.getQuantityGrams();
            }
        }
        return null;
    }
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS` with 0 errors. The two new helpers are unused so far (nothing calls them yet) — this is expected and not a compile error in Java.
Result: `BUILD SUCCESS` (no output from `-q`), confirmed as part of the Task 3 phase-end verification block.

### Task 3: Wire the helpers into `processRecipeIngredients` / `processExtras` and `getShoppingList`'s call site ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:106-125`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:476-526`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:528-591`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java`

- [x] **Step 1: Update `getShoppingList`'s per-entry block to pre-resolve `mainRatio` and pass it through**

Replace:
```java
            BigDecimal entryServings = entry.getServings();
            Integer recipeDefaultServings = recipe.getDefaultServings();

            // FR-102: Create source chain starting with the main recipe
            List<Long> mainRecipeChain = Collections.singletonList(recipeId);

            // Process main recipe ingredients
            processRecipeIngredients(recipe, entryServings, recipeDefaultServings,
                                    aggregatedIngredients, mainRecipeChain);

            // FR-089: Process extras based on homemade selections
            if (recipeExtrasService.hasExtras(recipeId)) {
                List<RecipeExtraNodeDTO> extras = recipeExtrasService.buildExtrasTree(recipeId, new HashSet<>());
                Map<Long, Boolean> recipeSelections = selectionsMap != null
                    ? selectionsMap.get(recipeId)
                    : null;

                processExtras(extras, recipeSelections, entryServings, recipeDefaultServings,
                             aggregatedIngredients, storeBoughtItems, mainRecipeChain);
            }
```
with:
```java
            BigDecimal entryServings = entry.getServings();
            Integer recipeDefaultServings = recipe.getDefaultServings();
            // MPP-1: pre-resolve once — the fraction of the MAIN recipe's own batch needed.
            // Extras derive their own ratio from this one via resolveExtraPortionRatio, not from
            // entryServings/defaultServings directly.
            BigDecimal mainRatio = entryServings.divide(BigDecimal.valueOf(recipeDefaultServings), 10, RoundingMode.HALF_UP);

            // FR-102: Create source chain starting with the main recipe
            List<Long> mainRecipeChain = Collections.singletonList(recipeId);

            // Process main recipe ingredients
            processRecipeIngredients(recipe, mainRatio, aggregatedIngredients, mainRecipeChain);

            // FR-089: Process extras based on homemade selections
            if (recipeExtrasService.hasExtras(recipeId)) {
                List<RecipeExtraNodeDTO> extras = recipeExtrasService.buildExtrasTree(recipeId, new HashSet<>());
                Map<Long, Boolean> recipeSelections = selectionsMap != null
                    ? selectionsMap.get(recipeId)
                    : null;

                processExtras(extras, recipeSelections, recipe, mainRatio,
                             aggregatedIngredients, storeBoughtItems, mainRecipeChain);
            }
```

- [x] **Step 2: Refactor `processRecipeIngredients` to take a single pre-resolved `ratio`**

Replace the method (javadoc + signature + body):
```java
    /**
     * FR-089: Process ingredients for a single recipe, adding to aggregated map.
     * FR-093: Skip linked recipe ingredients (handled by extras system).
     * FR-102: Added sourceChain parameter for tracking ingredient provenance.
     * @param sourceChain Chain of recipe IDs for provenance (null for main recipes)
     */
    private void processRecipeIngredients(Recipe recipe, BigDecimal entryServings, Integer defaultServings,
                                          Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients,
                                          List<Long> sourceChain) {
        for (RecipeIngredient recipeIngredient : recipe.getIngredients()) {
            // FR-093: Skip linked recipe ingredients - they are handled by extras system
            if (recipeIngredient.isLinkedRecipe()) {
                continue;
            }

            // Scale quantity: scaledQty = ingredient.quantity * entry.servings / recipe.defaultServings
            BigDecimal originalQuantity = recipeIngredient.getQuantity();
            BigDecimal scaledQuantity = originalQuantity
                .multiply(entryServings)
                .divide(BigDecimal.valueOf(defaultServings), 2, RoundingMode.HALF_UP);
```
with:
```java
    /**
     * FR-089: Process ingredients for a single recipe, adding to aggregated map.
     * FR-093: Skip linked recipe ingredients (handled by extras system).
     * FR-102: Added sourceChain parameter for tracking ingredient provenance.
     * MPP-1: ratio replaces the old (entryServings, defaultServings) pair — for the MAIN recipe
     * it is entryServings/defaultServings (unchanged); for a linked extra's own ingredients it is
     * the portionRatio resolved by resolveExtraPortionRatio.
     * @param ratio Fraction of THIS recipe's own batch actually needed
     * @param sourceChain Chain of recipe IDs for provenance (null for main recipes)
     */
    private void processRecipeIngredients(Recipe recipe, BigDecimal ratio,
                                          Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients,
                                          List<Long> sourceChain) {
        for (RecipeIngredient recipeIngredient : recipe.getIngredients()) {
            // FR-093: Skip linked recipe ingredients - they are handled by extras system
            if (recipeIngredient.isLinkedRecipe()) {
                continue;
            }

            BigDecimal originalQuantity = recipeIngredient.getQuantity();
            BigDecimal scaledQuantity = originalQuantity.multiply(ratio).setScale(2, RoundingMode.HALF_UP);
```

The rest of the method body (the `Long ingredientId = ...` line through the closing `}` of the method) is unchanged — only the javadoc, signature, and the quantity-scaling block above it change.

- [x] **Step 3: Refactor `processExtras` to accept `parentRecipe`/`parentRatio` and prorate before recursing**

Replace the method (javadoc + signature + body):
```java
    /**
     * FR-089: Process extras recursively, adding ingredients or store-bought items.
     * FR-102: Added sourceChain parameter for tracking ingredient provenance.
     *
     * @param extras List of extra nodes to process
     * @param selections Map of extraRecipeId -> isHomemade (null = all homemade)
     * @param entryServings Servings for the meal plan entry (may be fractional, e.g. 0.5)
     * @param defaultServings Default servings for the parent recipe
     * @param aggregatedIngredients Map to add ingredients to
     * @param storeBoughtItems List to add store-bought items to
     * @param parentSourceChain Source chain from parent (to build upon)
     */
    private void processExtras(List<RecipeExtraNodeDTO> extras,
                               Map<Long, Boolean> selections,
                               BigDecimal entryServings,
                               Integer defaultServings,
                               Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients,
                               List<StoreBoughtItem> storeBoughtItems,
                               List<Long> parentSourceChain) {
        if (extras == null || extras.isEmpty()) {
            return;
        }

        for (RecipeExtraNodeDTO extra : extras) {
            Long extraRecipeId = extra.getRecipeId();

            // FR-102: Build source chain for this extra (prepend extra recipe ID to parent chain)
            List<Long> currentSourceChain = new ArrayList<>();
            currentSourceChain.add(extraRecipeId);
            if (parentSourceChain != null) {
                currentSourceChain.addAll(parentSourceChain);
            }

            // Check if homemade (default true if no selection)
            Boolean selectionValue = selections != null ? selections.get(extraRecipeId) : null;
            boolean isHomemade = selections == null || selectionValue == null || selectionValue;

            if (isHomemade) {
                // Add extra's ingredients to shopping list
                Recipe extraRecipe = recipeRepository.findById(extraRecipeId).orElse(null);
                if (extraRecipe != null) {
                    processRecipeIngredients(extraRecipe, entryServings, defaultServings,
                                           aggregatedIngredients, currentSourceChain);
                }

                // Process children recursively
                if (extra.getChildren() != null && !extra.getChildren().isEmpty()) {
                    processExtras(extra.getChildren(), selections, entryServings, defaultServings,
                                 aggregatedIngredients, storeBoughtItems, currentSourceChain);
                }
            } else {
```
with:
```java
    /**
     * FR-089: Process extras recursively, adding ingredients or store-bought items.
     * FR-102: Added sourceChain parameter for tracking ingredient provenance.
     * MPP-1: parentRecipe/parentRatio replace the old (entryServings, defaultServings) pair.
     * Each extra's own ratio is resolved from parentRecipe's linked_recipe_id row via
     * resolveExtraPortionRatio, not inherited directly from the top-level meal's servings.
     *
     * @param extras List of extra nodes to process
     * @param selections Map of extraRecipeId -> isHomemade (null = all homemade)
     * @param parentRecipe The recipe that OWNS these extras (has the linked_recipe_id rows)
     * @param parentRatio Fraction of parentRecipe's own batch actually needed
     * @param aggregatedIngredients Map to add ingredients to
     * @param storeBoughtItems List to add store-bought items to
     * @param parentSourceChain Source chain from parent (to build upon)
     */
    private void processExtras(List<RecipeExtraNodeDTO> extras,
                               Map<Long, Boolean> selections,
                               Recipe parentRecipe,
                               BigDecimal parentRatio,
                               Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients,
                               List<StoreBoughtItem> storeBoughtItems,
                               List<Long> parentSourceChain) {
        if (extras == null || extras.isEmpty()) {
            return;
        }

        for (RecipeExtraNodeDTO extra : extras) {
            Long extraRecipeId = extra.getRecipeId();

            // FR-102: Build source chain for this extra (prepend extra recipe ID to parent chain)
            List<Long> currentSourceChain = new ArrayList<>();
            currentSourceChain.add(extraRecipeId);
            if (parentSourceChain != null) {
                currentSourceChain.addAll(parentSourceChain);
            }

            // Check if homemade (default true if no selection)
            Boolean selectionValue = selections != null ? selections.get(extraRecipeId) : null;
            boolean isHomemade = selections == null || selectionValue == null || selectionValue;

            if (isHomemade) {
                // MPP-1: prorate by how much of THIS extra's own batch the parent actually uses
                Recipe extraRecipe = recipeRepository.findById(extraRecipeId).orElse(null);
                if (extraRecipe != null) {
                    BigDecimal portionRatio = resolveExtraPortionRatio(parentRecipe, extraRecipeId, parentRatio, extraRecipe);
                    if (portionRatio.compareTo(BigDecimal.ZERO) > 0) {
                        processRecipeIngredients(extraRecipe, portionRatio, aggregatedIngredients, currentSourceChain);

                        // Process children recursively, carrying THIS extra's resolved ratio forward
                        if (extra.getChildren() != null && !extra.getChildren().isEmpty()) {
                            processExtras(extra.getChildren(), selections, extraRecipe, portionRatio,
                                         aggregatedIngredients, storeBoughtItems, currentSourceChain);
                        }
                    }
                }
            } else {
```

The remaining `else` branch (the store-bought fallback, unchanged) and the method's closing braces are unchanged.

- [x] **Step 4: Run the Phase 1 regression tests and confirm they now pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListServiceTest#extraWithPartialPortionUsed_ProratesRawIngredientsByGramsNotServings+extraWithNoMatchingLinkedIngredientRow_SkipsProrationDefensively`
Expected: `BUILD SUCCESS`, 2 tests run, 0 failures.
Result: `BUILD SUCCESS`, 2 tests run, 0 failures, 0 errors. Confirmed.

- [x] **Step 5: Run the full `ShoppingListServiceTest` class to confirm no other `getShoppingList` test regressed**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListServiceTest`
Expected: `BUILD SUCCESS`, 0 failures. (The `getIngredientBreakdown` tests are untouched by this phase and should still be green at this point — Phase 2 is what will change three of them.)

Result: **Deviates from Expected.** 18 tests run, 1 failure: `breakdownTotalMatchesShoppingListRowForTheSameIngredient` (expected `1.00`, got `1.50`). All 8 pure `getShoppingList — FR-019/FR-020` tests pass (none touch extras — no regression there, matching the "safe stopping point" claim for that subset). The 2 new Task 1 tests pass. 5 of the 6 `getIngredientBreakdown` tests pass unchanged.
  Root cause, attributed: `breakdownTotalMatchesShoppingListRowForTheSameIngredient` calls **both** `getShoppingList` and `getIngredientBreakdown` to assert parity. Its fixture mocks `recipeExtrasService.buildExtrasTree(12L, ...)` directly to claim Pizza(12L) has a "Pizza Dough" extra, but never calls `pizza.setIngredients(List.of(linkedRecipeIngredient(dough, ...)))` — so Pizza has zero `recipe_ingredients` rows. In real data `buildExtrasTree` reads a separate `recipe_extras` table (confirmed by reading `RecipeExtrasService.buildExtrasTree`), and a `recipe_ingredients.linked_recipe_id` row pairing with it is expected but not schema-enforced. Old code never checked for that pairing at all (the bug this ticket fixes) so the fixture's gap was invisible; the new `resolveExtraPortionRatio` correctly identifies no linked-quantity row exists and skips the extra's own ingredients (the exact defensive behavior Task 1's second test locks in) — dropping the `getShoppingList` side of this test's oil total from `1.50` to `1.00`, while the still-unfixed `getIngredientBreakdown` side keeps returning `1.50`. This is **not a Phase 1 production-code regression** — it is Phase 2 Task 4 Step 3's own literal target: that task adds `pizza.setIngredients(List.of(linkedRecipeIngredient(dough, "3.50")))` to this exact test, which will make both sides agree again. Left unmodified here since Task 4 is out of this phase's scope and its diff depends on the test's current (pre-Phase-2) text matching exactly. See Implementer Report "Notes" for full detail — flagged to the orchestrator so Phase 2 is scheduled immediately after this phase rather than left as a dangling red test on `master`.

---

## Phase 2 — Mirror the fix in the ingredient-breakdown popup (`getIngredientBreakdown`)

`getIngredientBreakdown`'s own javadoc states it "must mirror `getShoppingList`," and an existing test already asserts the two must agree on the same ingredient's total. This phase applies the identical proration to `collectIngredientUsages`/`collectUsagesFromExtras`, reusing the helpers Phase 1 added — no new proration math, only new wiring. It ends with the popup and the shopping list guaranteed to agree by construction (shared helpers), not by coincidence.

### Task 4: Update the three existing `getIngredientBreakdown` tests that exercise extras ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java:397-427`
- Modify: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java:429-470`
- Modify: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java:472-535`

- [x] **Step 1: `breakdownFindsIngredientInsideAnExtraAndAttributesIt` — add a real linked row and recompute the expected quantity**

Replace:
```java
    @Test
    void breakdownFindsIngredientInsideAnExtraAndAttributesIt() {
        Unit grams = unit(3L, "g");
        Ingredient flour = ingredient(31L, "Bread flour");

        Recipe dough = recipe(13L, "Pizza Dough", 2,
            recipeIngredient(flour, "300.00", grams));
        Recipe pizza = recipe(12L, "Pizza", 2); // flour lives only in the extra
```
with:
```java
    @Test
    void breakdownFindsIngredientInsideAnExtraAndAttributesIt() {
        Unit grams = unit(3L, "g");
        Ingredient flour = ingredient(31L, "Bread flour");

        Recipe dough = recipe(13L, "Pizza Dough", 2,
            recipeIngredient(flour, "300.00", grams, "300.00"));
        // Dough's own total yield = 300g (its only ingredient).
        Recipe pizza = recipe(12L, "Pizza", 2); // flour lives only in the extra
        pizza.setIngredients(List.of(linkedRecipeIngredient(dough, "150.00")));
        // Pizza uses 150g of a 300g Dough batch — half.
```

Then replace the final assertion:
```java
        assertThat(row.getQuantity()).isEqualByComparingTo("300.00");
```
with:
```java
        // Pizza@2 servings of its own 2-serving default = ratio 1; dough portionRatio = 150/300
        // = 0.5; flour = 300 * 0.5 = 150.00 (MPP-1: prorated by grams used, not pizza's servings).
        assertThat(row.getQuantity()).isEqualByComparingTo("150.00");
```

- [x] **Step 2: Rename and rewrite `breakdownWalksNestedExtrasAndScalesOffTheMainRecipeServings` — its old name and numbers describe the bug, not the fix**

Replace the entire test:
```java
    @Test
    void breakdownWalksNestedExtrasAndScalesOffTheMainRecipeServings() {
        Unit grams = unit(3L, "g");
        Ingredient basil = ingredient(45L, "Basil");

        // Pizza(12) -> Pizza Sauce(14) -> Pesto(10); the basil lives only in the GRANDCHILD,
        // so this is the only fixture that enters the recursive branch of collectUsagesFromExtras.
        // Sibling default servings are deliberately different from Pizza's to prove which one wins.
        Recipe pesto = recipe(10L, "Pesto", 6,
            recipeIngredient(basil, "30.00", grams));
        Recipe pizzaSauce = recipe(14L, "Pizza Sauce", 4);
        Recipe pizza = recipe(12L, "Pizza", 2);

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(entry(MONDAY, "dinner", pizza, 4));
        when(recipeExtrasService.hasExtras(12L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(12L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(14L)
                .recipeName("Pizza Sauce")
                .children(new ArrayList<>(List.of(RecipeExtraNodeDTO.builder()
                    .recipeId(10L)
                    .recipeName("Pesto")
                    .children(new ArrayList<>())
                    .build())))
                .build()));
        when(recipeRepository.findById(14L)).thenReturn(Optional.of(pizzaSauce));
        when(recipeRepository.findById(10L)).thenReturn(Optional.of(pesto));

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, 45L, "g", MONDAY, null);

        assertThat(result.getMealBreakdown()).hasSize(1);
        MealIngredientUsageDTO row = result.getMealBreakdown().get(0);
        assertThat(row.getRecipeName()).isEqualTo("Pizza");
        // Attributed to the nested extra that actually holds the ingredient, not its parent
        assertThat(row.getViaRecipeName()).isEqualTo("Pesto");
        // Scales off the MAIN recipe's defaultServings (Pizza = 2), matching processExtras —
        // NOT Pesto's 6 and not Pizza Sauce's 4: 30.00 * 4 / 2 = 60.00
        assertThat(row.getQuantity()).isEqualByComparingTo("60.00");
        assertThat(result.getTotalQuantity()).isEqualByComparingTo("60.00");
    }
```
with:
```java
    @Test
    void breakdownWalksNestedExtrasAndProratesEachLinkedHop() {
        Unit grams = unit(3L, "g");
        Ingredient basil = ingredient(45L, "Basil");

        // Pizza(12) -> Pizza Sauce(14) -> Pesto(10); the basil lives only in the GRANDCHILD,
        // so this is the only fixture that enters the recursive branch of collectUsagesFromExtras.
        // MPP-1: each hop is prorated by its own linked_recipe_id row's quantity_grams against
        // the child's own total yield — not by Pizza's servings alone.
        Recipe pesto = recipe(10L, "Pesto", 6,
            recipeIngredient(basil, "30.00", grams, "30.00"));
        // Pesto's own total yield = 30g (its only ingredient).

        Recipe pizzaSauce = recipe(14L, "Pizza Sauce", 4);
        pizzaSauce.setIngredients(List.of(linkedRecipeIngredient(pesto, "20.00")));
        // Pizza Sauce's own total yield = 20g (its only ingredient is 20g of Pesto).

        Recipe pizza = recipe(12L, "Pizza", 2);
        pizza.setIngredients(List.of(linkedRecipeIngredient(pizzaSauce, "9.00")));
        // Pizza uses 9g of Pizza Sauce per its own 2-serving batch.

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(entry(MONDAY, "dinner", pizza, 4)); // double Pizza's own default batch
        when(recipeExtrasService.hasExtras(12L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(12L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(14L)
                .recipeName("Pizza Sauce")
                .children(new ArrayList<>(List.of(RecipeExtraNodeDTO.builder()
                    .recipeId(10L)
                    .recipeName("Pesto")
                    .children(new ArrayList<>())
                    .build())))
                .build()));
        when(recipeRepository.findById(14L)).thenReturn(Optional.of(pizzaSauce));
        when(recipeRepository.findById(10L)).thenReturn(Optional.of(pesto));

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, 45L, "g", MONDAY, null);

        assertThat(result.getMealBreakdown()).hasSize(1);
        MealIngredientUsageDTO row = result.getMealBreakdown().get(0);
        assertThat(row.getRecipeName()).isEqualTo("Pizza");
        // Attributed to the nested extra that actually holds the ingredient, not its parent
        assertThat(row.getViaRecipeName()).isEqualTo("Pesto");
        // Pizza@4 servings of its own 2-serving default = ratio 2.
        // usedGrams(sauce) = 9 * 2 = 18; sauce portionRatio = 18/20 = 0.9.
        // usedGrams(pesto, per one full sauce batch) = 20 (sauce's own link row) * 0.9 = 18;
        // pesto portionRatio = 18/30 = 0.6.
        // basil = 30 * 0.6 = 18.00 — NOT 30 * 4/2 = 60.00 (the bug: scaling every nested hop off
        // only the MAIN recipe's servings, ignoring each link's own quantity_grams/yield).
        assertThat(row.getQuantity()).isEqualByComparingTo("18.00");
        assertThat(result.getTotalQuantity()).isEqualByComparingTo("18.00");
    }
```

- [x] **Step 3: `breakdownTotalMatchesShoppingListRowForTheSameIngredient` — add a real linked row so the parity check exercises non-trivial proration on both sides**

Replace:
```java
        Recipe curry = recipe(70L, "Irish Chicken Curry", 2,
            recipeIngredient(oliveOil, "1.00", tbsp));
        Recipe dough = recipe(13L, "Pizza Dough", 2,
            recipeIngredient(oliveOil, "0.50", tbsp));
        Recipe pizza = recipe(12L, "Pizza", 2); // oil reaches this dish only through the extra
```
with:
```java
        Recipe curry = recipe(70L, "Irish Chicken Curry", 2,
            recipeIngredient(oliveOil, "1.00", tbsp, "14.00")); // 1 tbsp olive oil ~= 14g
        Recipe dough = recipe(13L, "Pizza Dough", 2,
            recipeIngredient(oliveOil, "0.50", tbsp, "7.00")); // 0.5 tbsp ~= 7g
        // Dough's own total yield = 7g (its only ingredient).
        Recipe pizza = recipe(12L, "Pizza", 2); // oil reaches this dish only through the extra
        pizza.setIngredients(List.of(linkedRecipeIngredient(dough, "3.50")));
        // Pizza uses 3.5g of a 7g Dough batch — half.
```

The rest of the test (the `getShoppingList`/`getIngredientBreakdown` calls and the parity assertions) is unchanged — it doesn't hardcode a literal expected quantity, only that the two paths agree, so it stays correct automatically once both paths share the same proration helpers.

- [x] **Step 4: Confirm all three updated tests fail against the current (pre-Phase-2) code**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListServiceTest#breakdownFindsIngredientInsideAnExtraAndAttributesIt+breakdownWalksNestedExtrasAndProratesEachLinkedHop+breakdownTotalMatchesShoppingListRowForTheSameIngredient`
Expected: `BUILD FAILURE`. `breakdownFindsIngredientInsideAnExtraAndAttributesIt` expects `150.00` but `getIngredientBreakdown` still computes `300.00` (unfixed `collectIngredientUsages` ignores the new linked row); `breakdownWalksNestedExtrasAndProratesEachLinkedHop` expects `18.00` but still computes `60.00`. This confirms the fixture changes alone don't fix anything — Task 5 is what fixes the code.
Result: `BUILD FAILURE`, 3 tests run, 3 failures, 0 errors. `breakdownFindsIngredientInsideAnExtraAndAttributesIt` expected `150.00`, got `300.00`. `breakdownWalksNestedExtrasAndProratesEachLinkedHop` expected `18.00`, got `60.00`. `breakdownTotalMatchesShoppingListRowForTheSameIngredient` expected `1.25` (the now-correct `getShoppingList` row, per Phase 1), got `1.50` (the still-unfixed `getIngredientBreakdown` value). Confirmed as the expected red state.

### Task 5: Wire ratio-carrying `IngredientUsage` and the shared helpers into `collectIngredientUsages` / `collectUsagesFromExtras` / `getIngredientBreakdown` ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:254-298`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:319-337`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:359-385`

- [x] **Step 1: Update `getIngredientBreakdown`'s per-entry loop to pre-resolve `mainRatio`, thread it through collection, and drop the post-hoc multiply**

Replace:
```java
        for (MealPlanEntry entry : entries) {
            Recipe recipe = entry.getRecipe();
            BigDecimal entryServings = entry.getServings();
            Integer recipeDefaultServings = recipe.getDefaultServings();

            // Collect every use of the ingredient in this meal: the main recipe first,
            // then its extras (recursively) — the same traversal getShoppingList aggregates over.
            List<IngredientUsage> usages = new ArrayList<>();
            collectIngredientUsages(recipe, ingredientId, unit, null, usages);

            List<RecipeExtraNodeDTO> extras = extrasTreeCache.computeIfAbsent(
                recipe.getId(),
                id -> recipeExtrasService.hasExtras(id)
                    ? recipeExtrasService.buildExtrasTree(id, new HashSet<>())
                    : Collections.emptyList());
            collectUsagesFromExtras(extras, ingredientId, unit, usages, extraRecipeCache);

            for (IngredientUsage usage : usages) {
                // Capture ingredient name
                if (ingredientName == null) {
                    ingredientName = usage.ingredientName();
                }

                // Scale quantity: scaledQty = quantity * entry.servings / recipe.defaultServings
                // Extras scale off the MAIN recipe's default servings, matching processExtras.
                BigDecimal scaledQuantity = usage.quantity()
                    .multiply(entryServings)
                    .divide(BigDecimal.valueOf(recipeDefaultServings), 2, RoundingMode.HALF_UP);

                // Add to total
                totalQuantity = totalQuantity.add(scaledQuantity);
```
with:
```java
        for (MealPlanEntry entry : entries) {
            Recipe recipe = entry.getRecipe();
            BigDecimal entryServings = entry.getServings();
            Integer recipeDefaultServings = recipe.getDefaultServings();
            // MPP-1: same pre-resolved ratio as getShoppingList's mainRatio — the two entry
            // points are kept symmetric on purpose so they can never disagree.
            BigDecimal mainRatio = entryServings.divide(BigDecimal.valueOf(recipeDefaultServings), 10, RoundingMode.HALF_UP);

            // Collect every use of the ingredient in this meal: the main recipe first,
            // then its extras (recursively) — the same traversal getShoppingList aggregates over.
            List<IngredientUsage> usages = new ArrayList<>();
            collectIngredientUsages(recipe, ingredientId, unit, null, mainRatio, usages);

            List<RecipeExtraNodeDTO> extras = extrasTreeCache.computeIfAbsent(
                recipe.getId(),
                id -> recipeExtrasService.hasExtras(id)
                    ? recipeExtrasService.buildExtrasTree(id, new HashSet<>())
                    : Collections.emptyList());
            collectUsagesFromExtras(extras, ingredientId, unit, usages, extraRecipeCache, recipe, mainRatio);

            for (IngredientUsage usage : usages) {
                // Capture ingredient name
                if (ingredientName == null) {
                    ingredientName = usage.ingredientName();
                }

                // MPP-1: ratio is already fully resolved per-usage at collection time (see
                // collectIngredientUsages / collectUsagesFromExtras) — no separate
                // entryServings/defaultServings multiply here anymore.
                BigDecimal scaledQuantity = usage.quantity()
                    .multiply(usage.ratio())
                    .setScale(2, RoundingMode.HALF_UP);

                // Add to total
                totalQuantity = totalQuantity.add(scaledQuantity);
```

- [x] **Step 2: Add `ratio` to `collectIngredientUsages`**

Replace:
```java
    private void collectIngredientUsages(Recipe recipe, Long ingredientId, String unit,
                                         String viaRecipeName, List<IngredientUsage> usages) {
        for (RecipeIngredient recipeIngredient : recipe.getIngredients()) {
            // FR-093: Skip linked recipe ingredients (they don't have an ingredient)
            if (recipeIngredient.isLinkedRecipe()) {
                continue;
            }

            Ingredient ingredient = recipeIngredient.getIngredient();
            if (ingredient != null && ingredient.getId().equals(ingredientId) &&
                recipeIngredient.getUnit().getValue().equalsIgnoreCase(unit)) {
                usages.add(new IngredientUsage(
                    ingredient.getName(),
                    recipeIngredient.getQuantity(),
                    viaRecipeName
                ));
            }
        }
    }
```
with:
```java
    private void collectIngredientUsages(Recipe recipe, Long ingredientId, String unit,
                                         String viaRecipeName, BigDecimal ratio, List<IngredientUsage> usages) {
        for (RecipeIngredient recipeIngredient : recipe.getIngredients()) {
            // FR-093: Skip linked recipe ingredients (they don't have an ingredient)
            if (recipeIngredient.isLinkedRecipe()) {
                continue;
            }

            Ingredient ingredient = recipeIngredient.getIngredient();
            if (ingredient != null && ingredient.getId().equals(ingredientId) &&
                recipeIngredient.getUnit().getValue().equalsIgnoreCase(unit)) {
                usages.add(new IngredientUsage(
                    ingredient.getName(),
                    recipeIngredient.getQuantity(),
                    viaRecipeName,
                    ratio
                ));
            }
        }
    }
```

- [x] **Step 3: Add `parentRecipe`/`parentRatio` to `collectUsagesFromExtras`, resolving each hop's ratio via `resolveExtraPortionRatio`, and add `ratio` to the `IngredientUsage` record**

Replace:
```java
    private void collectUsagesFromExtras(List<RecipeExtraNodeDTO> extras, Long ingredientId,
                                         String unit, List<IngredientUsage> usages,
                                         Map<Long, Recipe> extraRecipeCache) {
        for (RecipeExtraNodeDTO extra : extras) {
            // computeIfAbsent does not cache a null result, so a missing recipe is simply skipped.
            // findById (not findWithDetailsById) — see the javadoc: the @EntityGraph finder
            // duplicates the `ingredients` bag per recipe_meals row and would double-count here.
            Recipe extraRecipe = extraRecipeCache.computeIfAbsent(
                extra.getRecipeId(),
                id -> recipeRepository.findById(id).orElse(null));

            if (extraRecipe != null) {
                collectIngredientUsages(extraRecipe, ingredientId, unit,
                                        extra.getRecipeName(), usages);
            }

            if (extra.getChildren() != null && !extra.getChildren().isEmpty()) {
                collectUsagesFromExtras(extra.getChildren(), ingredientId, unit,
                                        usages, extraRecipeCache);
            }
        }
    }

    /**
     * FR-042: One use of an ingredient inside a recipe (or one of its extras).
     */
    private record IngredientUsage(String ingredientName, BigDecimal quantity, String viaRecipeName) {}
```
with:
```java
    private void collectUsagesFromExtras(List<RecipeExtraNodeDTO> extras, Long ingredientId,
                                         String unit, List<IngredientUsage> usages,
                                         Map<Long, Recipe> extraRecipeCache,
                                         Recipe parentRecipe, BigDecimal parentRatio) {
        for (RecipeExtraNodeDTO extra : extras) {
            // computeIfAbsent does not cache a null result, so a missing recipe is simply skipped.
            // findById (not findWithDetailsById) — see the javadoc: the @EntityGraph finder
            // duplicates the `ingredients` bag per recipe_meals row and would double-count here.
            Recipe extraRecipe = extraRecipeCache.computeIfAbsent(
                extra.getRecipeId(),
                id -> recipeRepository.findById(id).orElse(null));

            if (extraRecipe != null) {
                // MPP-1: prorate by how much of THIS extra's own batch the parent actually uses
                BigDecimal portionRatio = resolveExtraPortionRatio(parentRecipe, extra.getRecipeId(), parentRatio, extraRecipe);
                if (portionRatio.compareTo(BigDecimal.ZERO) > 0) {
                    collectIngredientUsages(extraRecipe, ingredientId, unit,
                                            extra.getRecipeName(), portionRatio, usages);

                    if (extra.getChildren() != null && !extra.getChildren().isEmpty()) {
                        collectUsagesFromExtras(extra.getChildren(), ingredientId, unit,
                                                usages, extraRecipeCache, extraRecipe, portionRatio);
                    }
                }
            }
        }
    }

    /**
     * FR-042: One use of an ingredient inside a recipe (or one of its extras).
     * MPP-1: ratio is the fully-resolved scale factor for THIS occurrence, computed at
     * collection time (mainRatio for the main recipe, or resolveExtraPortionRatio's result
     * for anything found inside an extra).
     */
    private record IngredientUsage(String ingredientName, BigDecimal quantity, String viaRecipeName, BigDecimal ratio) {}
```

- [x] **Step 4: Run the three Phase 2 tests and confirm they now pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListServiceTest#breakdownFindsIngredientInsideAnExtraAndAttributesIt+breakdownWalksNestedExtrasAndProratesEachLinkedHop+breakdownTotalMatchesShoppingListRowForTheSameIngredient`
Expected: `BUILD SUCCESS`, 3 tests run, 0 failures.
Result: `BUILD SUCCESS`, 3 tests run, 0 failures, 0 errors. Confirmed.

- [x] **Step 5: Run the full `ShoppingListServiceTest` class**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListServiceTest`
Expected: `BUILD SUCCESS`, 0 failures — every test in the class, old and new, is green.
Result: `BUILD SUCCESS`, 18 tests run, 0 failures, 0 errors. Confirmed — every test in the class, old and new, is green.

---

## Phase 3 — Final verification

No production changes in this phase — only sanity-checks that the cumulative work is clean and nothing calling the old signatures was missed.

### Task 6: Grep for stale references to the old method signatures ✓

- Skill: none — a grep-only verification step, no code changes to attribute to a skill

- [x] **Step 1: Confirm no remaining call passes `entryServings, defaultServings` as two separate arguments into `processRecipeIngredients` or `processExtras`**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\service\ShoppingListService.java -Pattern "processRecipeIngredients\(.*entryServings.*defaultServings"`
Expected: zero hits (the refactored calls now pass a single `ratio`/`mainRatio`/`portionRatio` argument, never the old two-argument pair).
Result: zero hits. Confirmed.

- [x] **Step 2: Confirm no remaining construction of `IngredientUsage` with the old 3-argument form**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\service\ShoppingListService.java -Pattern "new IngredientUsage\("`
Expected: exactly one hit (inside `collectIngredientUsages`), and it passes 4 arguments ending in `ratio`.
Result: exactly one hit, at the `usages.add(new IngredientUsage(...))` call inside `collectIngredientUsages`, with 4 arguments (`ingredient.getName(), recipeIngredient.getQuantity(), viaRecipeName, ratio`) ending in `ratio`. Confirmed.

### Task 7: Full backend test suite

- Skill: none — verification only

- [ ] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: same baseline as before this change — per the project's known baseline (`AuthControllerLoginTest` pre-existing failure), overall `BUILD FAILURE` is expected from that unrelated class, but `ShoppingListServiceTest` and `MacroCalculationServiceTest` must show 0 failures, 0 errors within their own output. No test outside `ShoppingListServiceTest` should newly fail because of this change — `MacroCalculationServiceTest` in particular must be unaffected since `calculateRecipeTotalYield`'s implementation was not modified, only reused.
Not run by the Implementer: the full backend suite is reserved for QA's single end-of-contract validation gate per the Implementer's targeted-test-only policy. Delegated — see Implementer Report.

### Task 8: Update the PR description ✓

- Skill: none — documentation only

- [x] **Step 1: Write `pr-description.md` in this plan folder**

Create `foodbytes-app/../.claude/contract/MPP-1-shopping-list-linked-extra-proration/pr-description.md` (i.e. `.claude/contract/MPP-1-shopping-list-linked-extra-proration/pr-description.md`) containing:
- Link to `plan.md` in this folder.
- Summary: fixes MPP-1 — the shopping list and ingredient-breakdown popup now prorate a linked-recipe extra's raw ingredients by `(parent's quantity_grams for the link × parent's own batch fraction) / extra's own total yield`, matching the formula `MacroCalculationService` already uses for macros, instead of scaling by the parent's servings ratio alone.
- No migration required — pure service-layer logic fix, no schema or DTO shape change.
- Verification results: Phase 1 Step 4/5 and Phase 2 Step 4/5 test runs, plus Task 7's full-suite run.
- Note for future contributors: any new linked-recipe-extra proration logic should call `ShoppingListService`'s `resolveExtraPortionRatio`/`findLinkedQuantityGrams` (or `MacroCalculationService`'s equivalent for macros) rather than re-deriving the ratio inline — this ticket exists because that formula previously lived in only one of the two places it was needed.

---

## Self-review

**Spec coverage:**
- plan.md In scope bullet 1 (fix `processRecipeIngredients`/`processExtras`) — Phase 1, Tasks 1–3.
- plan.md In scope bullet 2 (fix `getIngredientBreakdown` path for parity) — Phase 2, Tasks 4–5.
- plan.md In scope bullet 3 (reuse `MacroCalculationService.calculateRecipeTotalYield`) — Task 2, Step 2 (`resolveExtraPortionRatio` calls it directly; no duplicate sum logic added).
- plan.md In scope bullet 4 (new/updated tests: ticket reproduction, defensive missing-link case, three existing breakdown tests) — Task 1 (two new tests), Task 4 (three existing tests updated).

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command; every `Run:` line carries an `Expected:` line.

**Type / name consistency:** `resolveExtraPortionRatio(Recipe parentRecipe, Long childRecipeId, BigDecimal parentRatio, Recipe childRecipe)` and `findLinkedQuantityGrams(Recipe parentRecipe, Long childRecipeId)` are defined once in Task 2 and called with identical argument order and names in Task 3 (`processExtras`) and Task 5 (`collectUsagesFromExtras`). `IngredientUsage`'s new `ratio` field is defined once in Task 5 Step 3 and constructed at its one call site (Task 5 Step 2) with matching field order. `mainRatio` naming is used consistently in both `getShoppingList` (Task 3 Step 1) and `getIngredientBreakdown` (Task 5 Step 1) for the same concept. The `MacroCalculationService macroCalculationService` field added in Task 2 Step 1 is the exact name referenced in Task 2 Step 2's `resolveExtraPortionRatio` body.

**Phase boundary cleanliness:** Phase 1 ends with `processRecipeIngredients`/`processExtras` fully refactored, `getShoppingList`'s call site updated to match, and both the new and pre-existing `ShoppingListServiceTest` tests green (Step 5) — no half-updated call site remains since `processRecipeIngredients` has exactly two callers (`getShoppingList`'s main-recipe line and `processExtras`) and both are updated within the same phase. Phase 2 ends with `collectIngredientUsages`/`collectUsagesFromExtras`/`IngredientUsage` fully refactored, `getIngredientBreakdown`'s loop updated to match, and the full test class green (Step 5) — `collectIngredientUsages` has exactly one caller inside `getIngredientBreakdown`'s loop and one inside `collectUsagesFromExtras`, both updated together. Phase 3 makes no production changes, only verification.

---

## Post-review fix pass (review round 1)

Applied after Code-Evaluator (APPROVED), QA (ALL PASSED), and Defender (0 Critical / 3 Warning / 4 Info) reviewed the completed contract.

- **Defender Warning #2 — fixed.** `resolveExtraPortionRatio`'s `log.warn` call unconditionally dereferenced `parentRecipe.getId()` even on the branch where `linkQuantityGrams` came back `null` because `parentRecipe` itself was `null` (as opposed to "no matching row on a non-null parent") — a latent NPE-in-the-diagnostic trap for any future caller that passes a null parent. Made the log statement null-safe (`parentRecipe != null ? parentRecipe.getId() : "?"`); no change to the method's return contract or null-check structure.
- **Defender Warning #3 — fixed.** `getShoppingList`'s `processExtras` path called `recipeRepository.findById(extraRecipeId)` fresh for every meal-plan entry referencing the same extra, now compounded by an unconditional `calculateRecipeTotalYield` per lookup. Added a request-scoped `Map<Long, Recipe> extraRecipeCache` to `getShoppingList`, threaded through `processExtras` (new trailing parameter, both call sites updated) via `computeIfAbsent` — mirrors the existing `extraRecipeCache` pattern already used by `getIngredientBreakdown`/`collectUsagesFromExtras`. Pure caching change, no observable-behavior change. Confirmed no `verify(recipeRepository, ...)` call-count assertions exist in `ShoppingListServiceTest` that this could break (grepped — only `when(...)` stubs).
- **Defender Warning #1 — explicitly deferred, not fixed.** (Silent drop of extras on missing linked-quantity row / zero yield, surfaced only via `log.warn`.) Per the reviewer's own rationale: the suggested `dataIntegrityWarnings` DTO flag is out of scope per `plan.md`'s "DTOs are unchanged in shape," and promoting the log level to `error` alone would break the deliberate parity with `MacroCalculationService.calculateLinkedRecipeMacros`'s identical zero-yield fallback that `plan.md`'s Assumptions section calls out. Left both the log level and DTO shape unchanged.
- **QA stale-comment note — fixed.** The comment inside `breakdownTotalMatchesShoppingListRowForTheSameIngredient` (`ShoppingListServiceTest.java`) described the old pre-fix arithmetic (`curry 1.00*2/2 = 1.00, pizza's dough 0.50*2/2 = 0.50`). Corrected to the actual gram-proration math: curry contributes `1.00*1 = 1.00`; pizza's dough contributes `0.50 * (3.50/7.00) = 0.25`; total `1.25`.
- Code-Evaluator's two optional nits (duplicated `mainRatio` computation, redundant `childRecipeId` parameter) and Defender's four Info items were explicitly out of scope for this fix pass and were left untouched.

**Verification:** `mvn test -Dtest=ShoppingListServiceTest` → `Tests run: 18, Failures: 0, Errors: 0` — `BUILD SUCCESS`, same count and outcome as before the fix pass.
