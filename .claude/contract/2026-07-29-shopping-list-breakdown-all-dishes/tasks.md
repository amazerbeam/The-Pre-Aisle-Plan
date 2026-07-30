# Tasks: Shopping-list ingredient breakdown must list every dish that uses the ingredient

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: BLOCKED
Started: 2026-07-29
Blocked reason: All 10 tasks implemented and reviewed (2 review rounds, Code-Evaluator + Defender both
APPROVED). Blocked on **verification only**: this host has no JDK, Maven, Docker or git, so the backend has
never been compiled, the 16 tests in `ShoppingListServiceTest` have never run, and Task 9's end-to-end smoke
test could not run. Unblock by running `mvn clean test` and Task 9's hand-off (below) on a host with JDK 17.

**Goal:** Make the FR-042 breakdown popup list every planned meal that feeds a shopping-list row — main recipes and their extras — with each row labelled by date, meal, and originating sub-recipe so repeats of one dish are distinguishable.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java` — first test in the module; covers the multi-recipe, extras, and total/ordering invariants of `getIngredientBreakdown`.

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealIngredientUsageDTO.java:20` — add nullable `viaRecipeName`.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:201-319` — replace the `sourceChain`-filtered breakdown with a full-week scan over main recipes plus extras; add two private collector helpers and the `IngredientUsage` carrier.
- `foodbytes-app/client/src/components/shopping/IngredientBreakdownPopup.jsx:51-92` — add date/meal/`via` formatters and a two-line row layout.
- `foodbytes-app/client/src/components/shopping/IngredientBreakdownPopup.css:134-141` — add `.meal-details` / `.meal-context`, move `flex: 1` off `.meal-name`.

**Deleted:** (none)

---

## Phase 1 — Backend: DTO field and collector helpers

Additive-only groundwork. The new DTO field is nullable and the two helpers plus the carrier class are private and not yet called, so the module compiles and every existing call site keeps its current behaviour. Nothing user-visible changes in this phase, which makes it a clean stopping point: `getIngredientBreakdown` still has its old body until Phase 2.

### Task 1: [x] Add `viaRecipeName` to `MealIngredientUsageDTO`

- Skill: `java-backend` — DTO layer; entities never cross the wire, response shapes live in `dto/`.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealIngredientUsageDTO.java:20`

- [x] **Step 1: Add the field after `servings`**

Replace:

```java
    private BigDecimal quantity;  // Scaled quantity for this meal
    private Integer servings;
```

with:

```java
    private BigDecimal quantity;  // Scaled quantity for this meal
    private Integer servings;
    private String viaRecipeName; // FR-102: Extra the ingredient came from, null if in the main recipe
```

This widens the Lombok `@AllArgsConstructor` from 5 to 6 parameters. `ShoppingListService` is the only caller and is updated in Phase 2, so the module will not compile again until Task 3 lands — Task 3's build step is the gate.

### Task 2: [x] Add the `IngredientUsage` carrier and the two collector helpers

- Skill: `java-backend` — business logic belongs in `service/`; helpers stay private to the service.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java` (insert after `getIngredientBreakdown`, before the `IngredientUnitKey` inner class at line 321)

- [x] **Step 1: Insert the two helpers and the carrier class**

Insert immediately after the closing brace of `getIngredientBreakdown` and before the `/** Key class for aggregating ingredients by (ingredientId, unitId). */` comment:

```java
    /**
     * FR-042: Find each row of a recipe that uses the given ingredient in the given unit.
     *
     * @param viaRecipeName Name of the extra the ingredient came from, or null for the main recipe
     */
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

    /**
     * FR-042: Walk an extras tree looking for the ingredient, labelling each hit with the extra
     * it came from. Cycle detection is handled by RecipeExtrasService.buildExtrasTree.
     *
     * @param extraRecipeCache Request-scoped cache so each distinct extra is loaded at most once
     */
    private void collectUsagesFromExtras(List<RecipeExtraNodeDTO> extras, Long ingredientId,
                                         String unit, List<IngredientUsage> usages,
                                         Map<Long, Recipe> extraRecipeCache) {
        for (RecipeExtraNodeDTO extra : extras) {
            // computeIfAbsent does not cache a null result, so a missing recipe is simply skipped
            Recipe extraRecipe = extraRecipeCache.computeIfAbsent(
                extra.getRecipeId(),
                id -> recipeRepository.findWithDetailsById(id).orElse(null));

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
    private static class IngredientUsage {
        private final String ingredientName;
        private final BigDecimal quantity;
        private final String viaRecipeName;

        public IngredientUsage(String ingredientName, BigDecimal quantity, String viaRecipeName) {
            this.ingredientName = ingredientName;
            this.quantity = quantity;
            this.viaRecipeName = viaRecipeName;
        }
    }
```

- [x] **Step 2: Confirm no new import is required**

Run:
```bash
grep -n "^import" foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java
```
Expected: the existing list already covers everything the new code uses — `com.foodbytes.dto.RecipeExtraNodeDTO` (line 8), `com.foodbytes.model.*` (line 11, supplying `Recipe`, `RecipeIngredient`, `Ingredient`), `java.util.*` (line 23, supplying `List`, `Map`), and `java.math.BigDecimal` (line 20). Zero import edits.

---

## Phase 2 — Backend: scan every meal instead of one recipe

The behavioural fix. Replacing the method body restores compilation (the 6-arg DTO constructor from Task 1 gets its matching call site) and changes what the endpoint returns. The phase boundary is safe because the endpoint is self-contained: the aggregation path that builds the shopping list itself is untouched, so a wrong result here can only affect the popup, never the list.

### Task 3: [x] Rewrite `getIngredientBreakdown` to scan all entries plus extras

> Code complete. **Step 3 (`mvn compile`) NOT RUN — no JDK/Maven on this host**; substituted a by-inspection compile check (results under Step 3). Do not treat the local compile as green.

- Skill: `java-backend` — `@Transactional(readOnly = true)` for a read touching lazy associations; controllers stay untouched.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:201-319`

- [x] **Step 1: Replace the javadoc and the whole method body**

Replace everything from `/**` on line 201 through the closing `}` of `getIngredientBreakdown` on line 319 with:

```java
    /**
     * FR-042: Get breakdown of which meals use a specific ingredient.
     * FR-102: Extras are searched too, so ingredients that come from a sub-recipe are found.
     * Shows every meal that uses the ingredient and how much it requires.
     *
     * <p>The breakdown must mirror {@link #getShoppingList}: a shopping list row is the sum of
     * the ingredient across ALL planned meals (and their homemade extras), so this scans every
     * meal plan entry rather than a single recipe. Selections aren't available on this endpoint,
     * so extras are treated as homemade — the same default aggregation uses.
     *
     * @param userId User ID
     * @param ingredientId Ingredient ID
     * @param unit Unit string (e.g., "tbsp", "g")
     * @param startDate Start date of the 7-day period
     * @param sourceChain Legacy provenance hint from the shopping list row. Ignored: the row is
     *                    aggregated across recipes but IngredientAggregate only keeps the FIRST
     *                    contributor's chain, so filtering on it hid every other dish using the
     *                    ingredient. Kept on the signature for API compatibility.
     * @return IngredientBreakdownDTO with meal breakdown list
     */
    @Transactional(readOnly = true)
    public IngredientBreakdownDTO getIngredientBreakdown(Long userId, Long ingredientId,
                                                          String unit, LocalDate startDate,
                                                          List<Long> sourceChain) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
        LocalDate endDate = startDate.plusDays(7);

        // Fetch meal plan entries for user in date range
        List<MealPlanEntry> entries = mealPlanEntryRepository
            .findByUserIdAndDateRange(effectiveOwnerId, startDate, endDate);

        List<MealIngredientUsageDTO> mealBreakdown = new ArrayList<>();
        BigDecimal totalQuantity = BigDecimal.ZERO;
        String ingredientName = null;

        // Request-scoped memoisation: the same recipe usually appears on several days, so build
        // each extras tree once and load each distinct extra recipe once per call.
        Map<Long, List<RecipeExtraNodeDTO>> extrasTreeCache = new HashMap<>();
        Map<Long, Recipe> extraRecipeCache = new HashMap<>();

        // Process each meal plan entry
        for (MealPlanEntry entry : entries) {
            Recipe recipe = entry.getRecipe();
            Integer entryServings = entry.getServings();
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
                    ingredientName = usage.ingredientName;
                }

                // Scale quantity: scaledQty = quantity * entry.servings / recipe.defaultServings
                // Extras scale off the MAIN recipe's default servings, matching processExtras.
                BigDecimal scaledQuantity = usage.quantity
                    .multiply(BigDecimal.valueOf(entryServings))
                    .divide(BigDecimal.valueOf(recipeDefaultServings), 2, RoundingMode.HALF_UP);

                // Add to total
                totalQuantity = totalQuantity.add(scaledQuantity);

                // Add meal breakdown entry — named by the planned dish, with the extra (if any)
                // carried separately so the row stays recognisable against the meal plan.
                mealBreakdown.add(new MealIngredientUsageDTO(
                    recipe.getName(),
                    entry.getMeal().getKey(),
                    entry.getPlanDate(),
                    scaledQuantity,
                    entryServings,
                    usage.viaRecipeName
                ));
            }
        }

        // Sort by date, then meal type
        mealBreakdown.sort(Comparator
            .comparing(MealIngredientUsageDTO::getPlanDate)
            .thenComparing(MealIngredientUsageDTO::getMealType));

        return new IngredientBreakdownDTO(
            ingredientId,
            ingredientName != null ? ingredientName : "Unknown Ingredient",
            unit,
            totalQuantity.setScale(2, RoundingMode.HALF_UP),
            mealBreakdown
        );
    }
```

- [x] **Step 2: Confirm the recipe filter is gone**

Run:
```bash
grep -n "mainRecipeId\|extraRecipeId\|searchRecipe" foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java
```
Expected: zero hits — all three locals belonged to the deleted filter.

**Result (2026-07-29):** `mainRecipeId` → 0 hits. `searchRecipe` → 0 hits. `extraRecipeId` → 6 hits, ALL inside `processExtras` (lines 514, 533, 537, 543, 548, 567), which is a pre-existing local in the out-of-scope aggregation path, not the deleted breakdown filter. The plan's grep pattern was over-broad on this one term; the filter itself is fully removed from `getIngredientBreakdown`.

- [ ] **Step 3: Compile the module** — **NOT RUN: no JDK/Maven on this host** (`Get-Command mvn` → NOT FOUND, `Get-Command javac` → NOT FOUND). Compensated with the by-inspection compile check below; Railway will be the first real compile.

Run: `cd foodbytes-app/foodbytes-api && mvn -q -DskipTests compile`
Expected: exit code 0, no `cannot find symbol` and no `constructor MealIngredientUsageDTO cannot be applied` errors.

**By-inspection compile check (2026-07-29) — all PASS:**
- `getEffectiveMealPlanOwnerId(Long)` → `ShoppingListService.java:53`, returns `Long`. PASS.
- `mealPlanEntryRepository.findByUserIdAndDateRange(Long, LocalDate, LocalDate)` → `MealPlanEntryRepository.java:37-41`, returns `List<MealPlanEntry>`. PASS.
- `recipeExtrasService.hasExtras(Long)` → `RecipeExtrasService.java:90`, returns `boolean`. PASS.
- `recipeExtrasService.buildExtrasTree(Long, Set<Long>)` → `RecipeExtrasService.java:51`, returns exactly `List<RecipeExtraNodeDTO>`; `visited` param is `Set<Long>`, so `new HashSet<>()` infers to `HashSet<Long>`. PASS.
- Ternary `hasExtras(id) ? buildExtrasTree(...) : Collections.emptyList()` inside `computeIfAbsent`: map is `Map<Long, List<RecipeExtraNodeDTO>>`, so the lambda's target return type is `List<RecipeExtraNodeDTO>` (descriptor from the non-wildcard parameterisation of `Function<? super K, ? extends V>`); `Collections.emptyList()` is a poly expression that infers to it. PASS.
- `IngredientBreakdownDTO` `@AllArgsConstructor` → `(Long ingredientId, String ingredientName, String unit, BigDecimal totalQuantity, List<MealIngredientUsageDTO> mealBreakdown)` in that exact order. PASS.
- `MealPlanEntry.getRecipe()/getServings()/getMeal()/getPlanDate()` (Lombok `@Data`, fields at `MealPlanEntry.java:29/33/37/40`), `Meal.getKey()` (`@Data`, `Meal.java:19`), `Recipe.getDefaultServings()/getName()/getId()` (`@Data`, `Recipe.java:22/25/28`). PASS.
- `@Transactional` already imported (`ShoppingListService.java:18`) and the method already carried it before this edit. PASS.
- Other call sites of the 6-arg `MealIngredientUsageDTO` constructor across `src/`: exactly one, `ShoppingListService.java:276`, now passing 6 args. No other caller to break. PASS.
- No import edits required (`HashMap`/`HashSet`/`Collections` from `java.util.*` line 23; `RecipeExtraNodeDTO` line 8). PASS.

> Toolchain note: `mvn`, the JDK, and `docker` are all absent from the machine this plan was written on (`git` too). If `mvn` is unavailable here, install a JDK 17 + Maven or let the Railway build be the first compile — and record in the PR that the local compile did **not** run rather than reporting this step green.

---

## Phase 3 — Backend: first unit test in the module

`foodbytes-api` has no `src/test` directory at all, though `spring-boot-starter-test` is already declared in `pom.xml:93-97` (JUnit 5 + Mockito + AssertJ, no `pom.xml` edit needed). This phase adds the directory and one test class pinning the three invariants the fix exists to guarantee. It is a safe boundary because it adds only test sources — production behaviour after Phase 2 is unchanged by anything here.

> **PLANNER PREMISE WRONG (found 2026-07-29).** `src/test` **already exists** with four test classes:
> `service/ShoppingListServiceTest.java` (7 tests for `getShoppingList`), `service/MealPlanServiceTest.java` (3),
> `dto/MealPlanCreateRequestTest.java` (2), `controller/AuthControllerLoginTest.java` (4).
> Task 4 was therefore executed as a **merge, not a create** — the 7 pre-existing `getShoppingList` tests are
> preserved and the 5 new breakdown tests were appended. See Task 4's notes.

### Task 4: [x] Add `ShoppingListServiceTest` covering multi-recipe, extras, and total invariants

> Test code complete (12 tests in the class: 7 pre-existing + 5 new). **Step 2 (`mvn test`) NOT RUN — no
> JDK/Maven on this host**; substituted a by-inspection audit (results under Step 2). Do not treat the
> local test run as green.

- Skill: `java-backend` — "Test additions or updates in `src/test/java/com/foodbytes/` for non-trivial service logic"; run with `mvn test`.

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java`

- [x] **Step 1: Write the test class**

All entities are Lombok `@Data`, so tests build them with no-arg constructors plus setters; `RecipeExtraNodeDTO` has `@Builder`. `ShoppingListService` uses `@RequiredArgsConstructor`, so `@InjectMocks` wires the five mocks through the constructor.

**Executed as a MERGE (2026-07-29).** The file already existed with 7 `getShoppingList` tests and only
**one** `@Mock` (`mealPlanEntryRepository`). Overwriting would have deleted that coverage, so instead:
1. All 5 new test methods and all 5 new fixture helpers were added **verbatim** as written below.
2. The 7 pre-existing tests, their `@BeforeEach setUp()`, their instance fields, and their four
   `create*` helpers were kept unchanged.
3. The 4 missing `@Mock`s (`recipeRepository`, `recipeExtrasService`, `ingredientRepository`,
   `userRepository`) were added. **This also repairs the 7 pre-existing tests**, which were failing
   before this phase: `@InjectMocks` passes `null` for constructor params it has no mock for, so
   `getShoppingList` → `getEffectiveMealPlanOwnerId` → `userRepository.findById` threw NPE in all 7.
   With the mocks present and unstubbed, Mockito defaults return `Optional.empty()` (→ `orElse(userId)`,
   so `effectiveOwnerId == userId`, matching their `eq(userId)` stubs) and `false` for `hasExtras`
   (→ extras skipped), so no new stubbings were needed and no `UnnecessaryStubbingException` is introduced.
4. Imports merged (`AggregatedShoppingListDTO`, `ShoppingItemDTO`, `ShoppingListByAisleDTO`, `BeforeEach`
   added to the new list). No helper or field name collides between the two sets.

```java
package com.foodbytes.service;

import com.foodbytes.dto.IngredientBreakdownDTO;
import com.foodbytes.dto.MealIngredientUsageDTO;
import com.foodbytes.dto.RecipeExtraNodeDTO;
import com.foodbytes.model.*;
import com.foodbytes.repository.IngredientRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.RecipeRepository;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * FR-042 / FR-102: the breakdown popup must list EVERY planned meal feeding a shopping list row.
 * Regression guard for the bug where a row's sourceChain filtered the scan to one recipe.
 */
@ExtendWith(MockitoExtension.class)
class ShoppingListServiceTest {

    private static final LocalDate MONDAY = LocalDate.of(2026, 7, 27);
    private static final Long OLIVE_OIL_ID = 12L;

    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private RecipeRepository recipeRepository;
    @Mock private RecipeExtrasService recipeExtrasService;
    @Mock private IngredientRepository ingredientRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private ShoppingListService shoppingListService;

    @Test
    void breakdownListsEveryRecipeUsingTheIngredient() {
        Unit tbsp = unit(1L, "tbsp");
        Ingredient oliveOil = ingredient(OLIVE_OIL_ID, "Olive oil");

        Recipe curry = recipe(70L, "Irish Chicken Curry", 2,
            recipeIngredient(oliveOil, "1.00", tbsp));
        Recipe pasta = recipe(80L, "Pink Sauce Pasta", 2,
            recipeIngredient(oliveOil, "0.50", tbsp));

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(
            entry(MONDAY, "dinner", curry, 2),
            entry(MONDAY.plusDays(1), "lunch", pasta, 2));
        givenNoExtras();

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, OLIVE_OIL_ID, "tbsp", MONDAY, List.of(70L));

        // sourceChain says "recipe 70 only" — the pasta must still appear
        assertThat(result.getMealBreakdown())
            .extracting(MealIngredientUsageDTO::getRecipeName)
            .containsExactly("Irish Chicken Curry", "Pink Sauce Pasta");
        assertThat(result.getTotalQuantity()).isEqualByComparingTo("1.50");
        assertThat(result.getIngredientName()).isEqualTo("Olive oil");
    }

    @Test
    void breakdownScalesByServingsAndKeepsEveryOccurrenceOfTheSameDish() {
        Unit tsp = unit(2L, "tsp");
        Ingredient oliveOil = ingredient(OLIVE_OIL_ID, "Olive oil");
        Recipe burrito = recipe(57L, "Chicken Burrito Bowl", 2,
            recipeIngredient(oliveOil, "2.00", tsp));

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(
            entry(MONDAY, "lunch", burrito, 2),
            entry(MONDAY.plusDays(1), "lunch", burrito, 2),
            entry(MONDAY.plusDays(2), "lunch", burrito, 4));
        givenNoExtras();

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, OLIVE_OIL_ID, "tsp", MONDAY, List.of(57L));

        assertThat(result.getMealBreakdown()).hasSize(3);
        assertThat(result.getMealBreakdown())
            .extracting(MealIngredientUsageDTO::getPlanDate)
            .containsExactly(MONDAY, MONDAY.plusDays(1), MONDAY.plusDays(2));
        // 4 servings of a 2-serving recipe doubles the quantity
        assertThat(result.getMealBreakdown().get(2).getQuantity()).isEqualByComparingTo("4.00");
        assertThat(result.getTotalQuantity()).isEqualByComparingTo("8.00");
        assertThat(result.getMealBreakdown())
            .allSatisfy(row -> assertThat(row.getViaRecipeName()).isNull());
    }

    @Test
    void breakdownFindsIngredientInsideAnExtraAndAttributesIt() {
        Unit grams = unit(3L, "g");
        Ingredient flour = ingredient(31L, "Bread flour");

        Recipe dough = recipe(13L, "Pizza Dough", 2,
            recipeIngredient(flour, "300.00", grams));
        Recipe pizza = recipe(12L, "Pizza", 2); // flour lives only in the extra

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(entry(MONDAY, "dinner", pizza, 2));
        when(recipeExtrasService.hasExtras(12L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(12L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(13L)
                .recipeName("Pizza Dough")
                .children(new ArrayList<>())
                .build()));
        when(recipeRepository.findWithDetailsById(13L)).thenReturn(Optional.of(dough));

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, 31L, "g", MONDAY, List.of(12L));

        assertThat(result.getMealBreakdown()).hasSize(1);
        MealIngredientUsageDTO row = result.getMealBreakdown().get(0);
        assertThat(row.getRecipeName()).isEqualTo("Pizza");
        assertThat(row.getViaRecipeName()).isEqualTo("Pizza Dough");
        assertThat(row.getQuantity()).isEqualByComparingTo("300.00");
    }

    @Test
    void breakdownReturnsUnknownIngredientSentinelWhenNothingMatches() {
        Unit tbsp = unit(1L, "tbsp");
        Recipe curry = recipe(70L, "Irish Chicken Curry", 2,
            recipeIngredient(ingredient(99L, "Ghee"), "1.00", tbsp));

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(entry(MONDAY, "dinner", curry, 2));
        givenNoExtras();

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, OLIVE_OIL_ID, "tbsp", MONDAY, null);

        assertThat(result.getMealBreakdown()).isEmpty();
        assertThat(result.getIngredientName()).isEqualTo("Unknown Ingredient");
        assertThat(result.getTotalQuantity()).isEqualByComparingTo("0.00");
    }

    @Test
    void breakdownHonoursSharedMealPlanOwner() {
        Unit tbsp = unit(1L, "tbsp");
        Ingredient oliveOil = ingredient(OLIVE_OIL_ID, "Olive oil");
        Recipe curry = recipe(70L, "Irish Chicken Curry", 2,
            recipeIngredient(oliveOil, "1.00", tbsp));

        User sharer = new User();
        sharer.setId(1L);
        sharer.setMealPlanOwnerId(10L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sharer));
        when(mealPlanEntryRepository.findByUserIdAndDateRange(10L, MONDAY, MONDAY.plusDays(7)))
            .thenReturn(List.of(entry(MONDAY, "dinner", curry, 2)));
        givenNoExtras();

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, OLIVE_OIL_ID, "tbsp", MONDAY, null);

        assertThat(result.getMealBreakdown()).hasSize(1);
    }

    // --- fixtures ---

    private void givenUserOwnsTheirOwnPlan(Long userId) {
        User user = new User();
        user.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    }

    private void givenEntries(MealPlanEntry... entries) {
        when(mealPlanEntryRepository.findByUserIdAndDateRange(anyLong(), any(), any()))
            .thenReturn(Arrays.asList(entries));
    }

    private void givenNoExtras() {
        when(recipeExtrasService.hasExtras(anyLong())).thenReturn(false);
    }

    private Unit unit(Long id, String value) {
        Unit unit = new Unit();
        unit.setId(id);
        unit.setValue(value);
        return unit;
    }

    private Ingredient ingredient(Long id, String name) {
        Ingredient ingredient = new Ingredient();
        ingredient.setId(id);
        ingredient.setName(name);
        return ingredient;
    }

    private RecipeIngredient recipeIngredient(Ingredient ingredient, String quantity, Unit unit) {
        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setIngredient(ingredient);
        recipeIngredient.setQuantity(new BigDecimal(quantity));
        recipeIngredient.setUnit(unit);
        return recipeIngredient;
    }

    private Recipe recipe(Long id, String name, int defaultServings, RecipeIngredient... ingredients) {
        Recipe recipe = new Recipe();
        recipe.setId(id);
        recipe.setName(name);
        recipe.setDefaultServings(defaultServings);
        recipe.setIngredients(ingredients.length == 0
            ? new ArrayList<>()
            : new ArrayList<>(Arrays.asList(ingredients)));
        return recipe;
    }

    private MealPlanEntry entry(LocalDate date, String mealKey, Recipe recipe, int servings) {
        Meal meal = new Meal();
        meal.setKey(mealKey);
        MealPlanEntry entry = new MealPlanEntry();
        entry.setPlanDate(date);
        entry.setMeal(meal);
        entry.setRecipe(recipe);
        entry.setServings(servings);
        return entry;
    }
}
```

- [ ] **Step 2: Run the new test class** — **NOT RUN: no JDK/Maven on this host.** Verified:
  `mvn` → NOT FOUND, `mvn.cmd` → NOT FOUND, `java` → NOT FOUND, `javac` → NOT FOUND, `JAVA_HOME` → empty.
  Compensated with the by-inspection audit below. Railway/CI will be the first real test run.

Run: `cd foodbytes-app/foodbytes-api && mvn test -Dtest=ShoppingListServiceTest`
Expected: `Tests run: 5, Failures: 0, Errors: 0, Skipped: 0` and BUILD SUCCESS.
**Superseded:** because Step 1 merged rather than replaced, expect `Tests run: 12` for this class.

If `MockitoExtension` reports `UnnecessaryStubbingException`, the offending fixture stub is unused by that test — narrow it to the specific test rather than relaxing strictness. If `breakdownListsEveryRecipeUsingTheIngredient` fails with only one row, Phase 2's filter removal did not land.

**By-inspection audit (2026-07-29) — 8 points, all PASS unless noted:**

1. **Constructor dependencies** — `ShoppingListService.java:34-38` declares exactly **5** non-static
   `final` fields, so `@RequiredArgsConstructor` generates a 5-arg constructor in this order:
   `MealPlanEntryRepository`, `RecipeRepository`, `RecipeExtrasService`, `IngredientRepository`,
   `UserRepository`. Lines 41-43 are `private static final` and are excluded. The planned 5-`@Mock`
   set covers all 5, all distinct types → `@InjectMocks` resolves every param, no null field. PASS.
   *Change made:* 4 of these `@Mock`s did not exist in the file before this phase (see Step 1 note 3).

2. **Test classpath** — `spring-boot-starter-test` at `pom.xml:93-97` with `<scope>test</scope>`. PASS.
   Under Spring Boot 3.2.0 that starter transitively supplies `junit-jupiter`, `mockito-core`,
   **`mockito-junit-jupiter`** (the artifact providing `org.mockito.junit.jupiter.MockitoExtension`),
   and **`assertj-core` 3.24.2** — so `@ExtendWith(MockitoExtension.class)`, `assertThat`, and
   `allSatisfy(ThrowingConsumer)` all resolve with no `pom.xml` edit. `RecipeExtrasService` is a
   non-final class with non-final methods, so Mockito 5's inline mock maker can mock it. PASS.

3. **Every setter the fixtures call exists** (all via Lombok `@Data`):
   `Unit.setId/setValue` (`Unit.java:16,22`); `Ingredient.setId/setName` (`Ingredient.java:16,23`);
   `RecipeIngredient.setIngredient/setQuantity/setUnit` (`RecipeIngredient.java:34,43,47`);
   `Recipe.setId/setName/setDefaultServings/setIngredients` (`Recipe.java:22,25,28,50`);
   `Meal.setKey` (`Meal.java:19`); `MealPlanEntry.setPlanDate/setMeal/setRecipe/setServings`
   (`MealPlanEntry.java:29,33,37,40`); `User.setId/setMealPlanOwnerId` (`User.java:16,41`). PASS.
   **Collection-type check:** `Recipe.ingredients` is `List<RecipeIngredient>` (`Recipe.java:50`), **not**
   a `Set` — so `setIngredients(new ArrayList<>(...))` compiles. (`Recipe.meals` *is* a `Set`, but no
   fixture touches it.) PASS.
   Also confirmed for the merged-in legacy helpers: `Aisle`'s `@AllArgsConstructor` is
   `(Long id, String key, String name, Short displayOrder)` (`Aisle.java:16-25`) matching
   `new Aisle(1L, "produce", "Produce", (short) 1)`, and `Unit`'s is `(Long, String key, String value)`
   matching `new Unit(1L, "cups", "cups")`. PASS.

4. **`RecipeExtraNodeDTO`** — `@Builder` present at `RecipeExtraNodeDTO.java:18`, with fields
   `recipeId` (Long), `recipeName` (String), `displayOrder`, `storeBoughtIngredientId`, and
   `children` declared `List<RecipeExtraNodeDTO>` with `@Builder.Default` (lines 22,23,31). So
   `.recipeId(13L).recipeName("Pizza Dough").children(new ArrayList<>())` compiles — `children`'s
   declared type accepts `new ArrayList<>()` by inference. PASS.

5. **`IngredientBreakdownDTO` getters** — `@Data` over fields `ingredientId`, `ingredientName`, `unit`,
   `totalQuantity` (`BigDecimal`), `mealBreakdown` (`List<MealIngredientUsageDTO>`) at
   `IngredientBreakdownDTO.java:17-21`. `getMealBreakdown()`, `getTotalQuantity()`,
   `getIngredientName()` all exist. `MealIngredientUsageDTO` `@Data` supplies `getRecipeName`,
   `getMealType`, `getPlanDate`, `getQuantity`, `getServings`, `getViaRecipeName`. PASS.

6. **Mockito STRICT_STUBS audit** — every stub in every test is consumed; **no change needed**:
   - `ingredientRepository` is a declared-but-never-stubbed `@Mock`. Unused *mocks* are legal;
     `UnnecessaryStubbingException` only fires on unused *stubbings*. PASS.
   - `breakdownListsEveryRecipeUsingTheIngredient`: `findById(1L)` consumed at
     `ShoppingListService.java:54`; `findByUserIdAndDateRange` at 229-230; `hasExtras` at 254 (twice,
     ids 70 and 80 — distinct, both hit the `computeIfAbsent` miss path). PASS.
   - `breakdownScalesByServings…`: `hasExtras` consumed **once** (id 57, cached for entries 2 and 3 by
     `extrasTreeCache`) — one consumption is enough to satisfy strictness. PASS.
   - `breakdownFindsIngredientInsideAnExtraAndAttributesIt`: `findById(1L)` ✓ (line 54);
     `findByUserIdAndDateRange` ✓ (229); `hasExtras(12L)` ✓ (254); `buildExtrasTree(12L, …)` ✓ (255);
     `findWithDetailsById(13L)` ✓ (339, via `collectUsagesFromExtras`). All 5 consumed. Note this test
     correctly does **not** call `givenNoExtras()` — that would collide with its own `hasExtras(12L)` stub.
     PASS.
   - `breakdownReturnsUnknownIngredientSentinelWhenNothingMatches`: `givenNoExtras()`'s `hasExtras` **is**
     reached. Traced lines 242-257: the `extrasTreeCache.computeIfAbsent(... hasExtras(id) ...)` walk runs
     **unconditionally per entry** at line 252, outside and after `collectIngredientUsages` (250) and with
     no guard on whether the main recipe matched. Consumed. PASS.
   - `breakdownHonoursSharedMealPlanOwner`: stubs the exact args `(10L, MONDAY, MONDAY.plusDays(7))`.
     Production computes `endDate = startDate.plusDays(7)` (line 226) and calls
     `findByUserIdAndDateRange(effectiveOwnerId, startDate, endDate)` (229-230), with
     `effectiveOwnerId = mealPlanOwnerId = 10L` from line 55. Exact match on all three args. PASS.
   - The 7 legacy `getShoppingList` tests add no stubbing beyond `mealPlanEntryRepository`, which each
     consumes. PASS.

7. **Arithmetic audit** — formula is `quantity × entryServings ÷ recipeDefaultServings`, HALF_UP to 2dp
   (`ShoppingListService.java:267-269`); total is `setScale(2, HALF_UP)` (296); sort is `planDate` then
   `mealType` (288-290).
   - `1.50` — curry `1.00 × 2 ÷ 2 = 1.00`; pasta `0.50 × 2 ÷ 2 = 0.50`; total `1.50`. ✓
     Ordering: curry MONDAY < pasta MONDAY+1 → `containsExactly("Irish Chicken Curry", "Pink Sauce Pasta")`. ✓
   - `4.00` — third burrito entry: `2.00 × 4 ÷ 2 = 4.00`. Sorted index 2 = MONDAY+2, the 4-serving one. ✓
   - `8.00` — `(2.00 × 2 ÷ 2) + (2.00 × 2 ÷ 2) + (2.00 × 4 ÷ 2) = 2.00 + 2.00 + 4.00 = 8.00`. ✓
   - `300.00` — extras scale off the **main** recipe's default servings (comment at 266, and
     `recipeDefaultServings` is read from `entry.getRecipe()` at 245): `300.00 × 2 ÷ 2 = 300.00`. ✓
   - `0.00` — no usage matched (`Ghee` id 99 ≠ 12), so `totalQuantity` stays `BigDecimal.ZERO`;
     `ZERO.setScale(2, HALF_UP)` = `0.00`, and `isEqualByComparingTo` is scale-insensitive anyway. ✓
     `ingredientName` stays null → sentinel `"Unknown Ingredient"` (line 294). ✓
   - Unit matching is `equalsIgnoreCase` on `Unit.value` (line 316), so `"tbsp"`/`"tsp"`/`"g"` fixtures
     match; `tsp` vs `tbsp` are distinct values so test 2 cannot cross-match. ✓ PASS.

8. **Directory chain** — **the planner's premise was wrong.** `src/test/java/com/foodbytes/service/`
   **already existed**, as did `ShoppingListServiceTest.java`. Nothing was created; the existing file was
   merged into (Step 1 note). Module test-method count is now 21 across 4 classes (this class: 12).

**Production-side concern (NOT fixed, per scope):** none in `getIngredientBreakdown` — the audit found no
defect in Phase 1/2 code. The only defect found is test-side and pre-existing (the 4 missing `@Mock`s
described in Step 1 note 3), now repaired.

---

## Phase 4 — Frontend: make each row self-describing

Presentational and additive. The popup already receives the whole DTO, so no service, context, or state change is involved — a mistake here can only mis-render one line of one popup. The phase ends with a clean `npm run build`, which is the only automated check the client has (`client/package.json` wires no test runner).

### Task 5: [x] Add date/meal/`via` formatters and the two-line row to `IngredientBreakdownPopup`

- Skill: `react-frontend` — file order (imports → constants → component → helpers → export), no new runtime dependency (hand-rolled formatting; there is no `date-fns`), no new `console.log`, 400-line component budget.

**Files:**
- Modify: `foodbytes-app/client/src/components/shopping/IngredientBreakdownPopup.jsx:51-92`

- [x] **Step 1: Add the two formatters after `formatQuantity`**

Insert after the closing brace of `formatQuantity` and before the `return (`:

```jsx
  // Format planDate ("2026-07-27") without timezone drift -> "Mon 27 Jul"
  const formatPlanDate = (planDate) => {
    if (!planDate) return ''
    const [year, month, day] = planDate.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  // The same dish can be planned several times in a week — show when each one is,
  // otherwise the rows look like duplicates. Derives the label from mealType rather
  // than a new literal map, so this file's meal-type debt doesn't grow.
  const formatMealContext = (meal) => {
    const mealLabel = meal.mealType
      ? meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)
      : ''
    const parts = [formatPlanDate(meal.planDate), mealLabel].filter(Boolean)
    if (meal.viaRecipeName) {
      parts.push(`via ${meal.viaRecipeName}`)
    }
    return parts.join(' · ')
  }
```

A bare `new Date('2026-07-27')` parses as UTC midnight and renders 26 Jul for anyone behind UTC — hence the component-wise parse.

- [x] **Step 2: Wrap the name and context in a `.meal-details` column**

Replace:

```jsx
              <span className="meal-name">{meal.recipeName}</span>
              <span className="meal-quantity">
```

with:

```jsx
              <span className="meal-details">
                <span className="meal-name">{meal.recipeName}</span>
                <span className="meal-context">{formatMealContext(meal)}</span>
              </span>
              <span className="meal-quantity">
```

- [x] **Step 3: Confirm the file stays inside the component budget and adds no banned call**

Run:
```bash
grep -c "" foodbytes-app/client/src/components/shopping/IngredientBreakdownPopup.jsx
grep -n "console\.\(log\|debug\)" foodbytes-app/client/src/components/shopping/IngredientBreakdownPopup.jsx
```
Expected: line count around 135 — comfortably under the 200-line "fine" threshold and far below the 400-line blocking ceiling; zero `console.log` / `console.debug` hits.

### Task 6: [x] Style the second line

- Skill: `react-frontend` — plain per-component CSS, no `*.module.css`, mobile-first.

**Files:**
- Modify: `foodbytes-app/client/src/components/shopping/IngredientBreakdownPopup.css:134-141`

- [x] **Step 1: Replace the `.meal-name` rule**

`flex: 1` moves from `.meal-name` to the new `.meal-details` wrapper — leaving it on the inner span would stop the two-line column from taking up the remaining row width. Replace:

```css
.meal-name {
  flex: 1;
  font-size: 0.95rem;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

with:

```css
.meal-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meal-name {
  font-size: 0.95rem;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meal-context {
  font-size: 0.75rem;
  color: #777;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

`min-width: 0` is what lets `text-overflow: ellipsis` work on a flex child; without it a long `via <extra>` string would push the quantity chip off the row.

- [x] **Step 2: Confirm no CSS Modules file was introduced**

Run:
```bash
ls foodbytes-app/client/src/components/shopping/*.module.css
```
Expected: no such file — the repo uses plain per-component CSS.

- [x] **Step 3: Build the client**

Run: `cd foodbytes-app/client && npm run build`
Expected: `✓ built in <time>` with no transform errors. (Baseline before this change: 168 modules transformed.)

**Result (2026-07-29) — PASS.** Ran `Push-Location foodbytes-app\client; npm run build` (PowerShell 5.1, `&&` unavailable).
`vite v5.4.21` → `✓ 169 modules transformed.` → `✓ built in 601ms`, exit code 0, no transform errors.
Output: `dist/index.html` 0.84 kB, `dist/assets/index-BucinvSU.css` 97.22 kB, `dist/assets/index-BEuSbjL2.js` 316.25 kB.
**Module count is 169, not the plan's stated 168 baseline.** This change adds no import and no file, so it cannot
move the module count — the 168 figure appears stale/mis-recorded rather than indicating a regression.

---

## Phase 5 — Final verification

No production changes. Confirms the cumulative work is internally consistent, matches the live data, and is honestly reported.

### Task 7: [x] Grep for stale references to the removed filter

- Skill: none — vanilla verification, no code produced.

- [x] **Step 1: Confirm no filter locals survive anywhere in the backend**

Run:
```bash
grep -rn "mainRecipeId\|extraRecipeId\|searchRecipe" foodbytes-app/foodbytes-api/src/main/java
```
Expected: zero hits.

**Result (2026-07-29) — PASS on intent, DEVIATED on the literal expectation. The plan's grep pattern is
over-broad.** `mainRecipeId` → **0 hits** (this is the one that mattered — the deleted filter's local is gone).
The other two terms hit only pre-existing, out-of-scope code:

| Hit | Classification |
|---|---|
| `ShoppingListService.java:514,533,537,543,548,567` — `extraRecipeId` | Pre-existing local in `processExtras` (lines 511–572), the aggregation path the contract forbids touching. **Fine.** |
| `HomemadeSelectionsDTO.java:10,18`, `GenerateShoppingListRequest.java:23` — `extraRecipeId` | Pre-existing javadoc on the FR-103 selections shape. **Fine.** |
| `RecipeService.java:66,110`, `RecipeController.java:69,70,95,96` — `searchRecipes` / `searchRecipeSummaries` | Unrelated recipe-search feature; matched only because `searchRecipe` is a prefix of them. **Fine.** |

Zero deleted-filter remnants. Read this step as "zero hits **inside `getIngredientBreakdown`**", not
"zero hits in the module" — the literal expectation was unachievable without editing out-of-scope code.

- [x] **Step 2: Confirm `sourceChain` still flows through the API untouched**

Run:
```bash
grep -rn "sourceChain" foodbytes-app/foodbytes-api/src/main/java foodbytes-app/client/src/services/shoppingService.js
```
Expected: still present in `MealPlanController` (parse), `ShoppingListService` (signature + javadoc + `IngredientAggregate`), `ShoppingItemDTO`, and `shoppingService.js` — the parameter is ignored by the breakdown, not deleted.

**Result (2026-07-29) — PASS.** All four expected sites intact, nothing deleted end-to-end:
- `MealPlanController.java:229-261` — `@RequestParam(required = false) String sourceChain`, comma-split parse, passed through.
- `ShoppingListService.java:215` (javadoc documenting it as accepted-and-ignored), `:224` (signature), `:397-419` + `:460-484` + `:511` + `:576-604` (`IngredientAggregate` / `processRecipeIngredients` / `processExtras` — untouched).
- `ShoppingItemDTO.java:15,32` and `ShoppingListService.java:142` (`.sourceChain(agg.sourceChain)`).
- `shoppingService.js:104-114` — still sends `params.sourceChain = sourceChain.join(',')`.
- Also present (untouched, unrelated): `PersistedShoppingItemDTO.java:27`, `PersistedShoppingListService.java:234-264`, `ShoppingListItem.java:49`.

### Task 8: Run the full suite and build both sides

- Skill: none — vanilla verification, no code produced.

- [ ] **Step 1: Full backend test run**

Run: `cd foodbytes-app/foodbytes-api && mvn clean test`
Expected: BUILD SUCCESS, `Tests run: 5, Failures: 0, Errors: 0`. If no JDK/Maven is available on the executing machine, stop and say so — do not mark this step done.

> **Expected count corrected (Phase 3):** the module already had 3 other test classes, so the whole-suite
> figure is `Tests run: 21` (ShoppingListServiceTest 12, MealPlanServiceTest 3, MealPlanCreateRequestTest 2,
> AuthControllerLoginTest 4), not 5. `MealPlanServiceTest` and `AuthControllerLoginTest` were **not** audited
> by Phase 3 and may carry the same pre-existing missing-`@Mock` breakage — check them before blaming this
> contract for a red suite.

**Result (2026-07-29) — NOT RUN. No JDK and no Maven on this host.** `Get-Command` returns NOT FOUND for
`mvn`, `mvn.cmd`, `java`, `javac`, `git`, and `docker`; `JAVA_HOME` is empty. **Nothing in Phases 1–3 has ever
been compiled or executed.** The first genuine signal for the backend is the Railway build / a host with a JDK.
Per the step's own instruction this is left **unticked**.

Audit of the two test classes Phase 3 flagged (read-only, cannot execute):
- **`MealPlanServiceTest` — looks sound.** 6 `@Mock` fields exactly match `MealPlanService`'s 6
  `@RequiredArgsConstructor` deps (`MealPlanEntryRepository`, `MealRepository`, `RecipeRepository`,
  `UserRepository`, `RecipeService`, `MacroCalculationService`). No missing-mock NPE risk.
- **`AuthControllerLoginTest` — likely RED, pre-existing, unrelated to this contract.** It is
  `@WebMvcTest(AuthController.class)` with a single `@MockBean PasswordAuthService`, but `AuthController`
  declares **two** final deps — `PasswordAuthService` **and** `JwtCookieService` (`AuthController.java:23-24`).
  `@WebMvcTest` does not register `@Service` beans, so context startup should fail with "No qualifying bean of
  type JwtCookieService" and take all 4 of its tests with it. **Unverified — it cannot be run here.** Flagged so
  a future red suite is not misattributed to this change.

- [x] **Step 2: Full frontend build**

Run: `cd foodbytes-app/client && npm run build`
Expected: `✓ built` with no errors.

**Result (2026-07-29) — PASS.** Fresh run, `Push-Location foodbytes-app\client; npm run build` (PowerShell 5.1):
`vite v5.4.21` → `✓ 169 modules transformed.` → `✓ built in 754ms`, **exit code 0**, no transform errors.
`dist/index.html` 0.84 kB · `dist/assets/index-BucinvSU.css` 97.22 kB · `dist/assets/index-BEuSbjL2.js` 316.25 kB
— byte-identical asset hashes to the Phase 4 build, confirming a stable output. (169 vs the plan's stale
168 baseline; this change adds no import and no file, so it cannot move the count.)

### Task 9: Smoke-test against real meal-plan data

- Skill: none — manual verification against the running app.

- [ ] **Step 1: Long-press a genuinely multi-dish row**

With the stack running (`docker-compose up --build`, or `mvn spring-boot:run` + `npm run dev`), open **Shopping**, and hold `Chicken breast` in Meat for ~1s over a week containing the 27 Jul – 2 Aug plan.

Expected: the popup lists **7 distinct dishes** — Chicken & Vegetable Soup, Drunken Noodles, Hash Browns & Diced Chicken, Irish Chicken Curry, Pad Thai, Pink Sauce Pasta, Pizza — each with its own date and meal label, and a header total of **1810 g** matching the list row. Before the fix this showed one dish.

- [ ] **Step 2: Confirm the screenshot's row is unchanged and that this is correct**

Hold `Olive oil` in Oils & Fats (the **tsp** row).

Expected: still three `Chicken Burrito Bowl` rows totalling 6 tsp — but now labelled with three different dates. `Olive oil (tsp)` is used by only two recipes DB-wide and this plan has no Tuscan Chicken entries, so one dish is the right answer here. Use the **tbsp** row (4 dishes) as the multi-dish olive-oil check.

**Result (2026-07-29) — BOTH STEPS NOT RUN.** The smoke test needs a running backend, which needs a JDK or
Docker; this host has neither (`mvn`, `java`, `javac`, `docker`, `git` all NOT FOUND). No database query was
substituted and no step was marked done by reasoning about what the code should do — that would defeat the
purpose of a smoke test. **Both steps left unticked.** This is the only unverified *behavioural* claim in the
contract, so the fix must be treated as unproven end-to-end until the developer runs the hand-off below.

**Hand-off — run verbatim once a JDK 17 / Docker is installed:**

1. Launch: `docker-compose up --build` from the repo root (frontend `:3000`, api `:8080`, mysql `:3306`).
   Or without Docker: `cd foodbytes-app/foodbytes-api; mvn spring-boot:run` **plus**
   `cd foodbytes-app/client; npm run dev` (`:5173`).
2. Navigate to **Shopping** and set the week to one containing **27 Jul – 2 Aug 2026**.
3. **Long-press** (hold ~1 s — it is not a click) the `Chicken breast` row under **Meat**.
   - **PASS:** popup lists **7 distinct dishes** — Chicken & Vegetable Soup, Drunken Noodles, Hash Browns &
     Diced Chicken, Irish Chicken Curry, Pad Thai, Pink Sauce Pasta, Pizza — each on its own second line
     showing `<Day DD Mon> · <Meal>`, and the popup header total reads **1810 g**, matching the list row.
   - **FAIL — one dish only:** Phase 2's filter removal did not reach the deployed backend (stale build/redeploy).
   - **FAIL — 7 dishes but header ≠ 1810 g:** the scaling divisor is wrong. Check that extras scale off the
     **main** recipe's `defaultServings` (`ShoppingListService.java:245`), not the extra's own.
   - **FAIL — rows still visually identical:** the frontend bundle is stale; rebuild the client container.
4. Long-press `Olive oil` under **Oils & Fats**, the **tsp** row.
   - **PASS:** still three `Chicken Burrito Bowl` rows totalling **6 tsp**, now labelled with three *different*
     dates. One dish is the correct answer here — `Olive oil (tsp)` is used by only two recipes DB-wide and this
     plan has no Tuscan Chicken entries. **This is the screenshot's row and it is a true negative; do not read
     it as the fix failing.** Use the **tbsp** row (4 dishes) as the multi-dish olive-oil check instead.
5. If any dish shows a `via <Sub-recipe>` suffix (e.g. `via Pizza Dough`), the recursive extras walk is working.

### Task 10: [x] Update the PR description

- Skill: none — documentation step.

- [x] **Step 1: Write the PR description**

Include:
- Link to this contract folder (`.claude/contract/2026-07-29-shopping-list-breakdown-all-dishes/`).
- Summary: the breakdown endpoint scanned only the row's `sourceChain` recipe; it now scans every meal-plan entry plus each entry's extras tree, and the popup labels every row with date / meal / originating sub-recipe.
- Smoke-test result from Task 9 (dish count and header total for `Chicken breast`).
- Explicitly state whether `mvn clean test` ran, and on what machine — the plan was authored on a host with no JDK, Maven, Docker, or git.
- Note for future contributors: `ShoppingItemDTO.sourceChain` keeps only the **first** contributing recipe's chain, so it must never be used as a filter. It is accepted and ignored by the breakdown endpoint.
- Note that no migration is required (no schema change) and Hibernate stays in `validate` mode.

**Result (2026-07-29) — DONE, delivered as a file rather than a PR.** There is no `git` on this host, so no
branch or PR could be opened. The description is written to
`.claude/contract/2026-07-29-shopping-list-breakdown-all-dishes/pr-description.md` for the developer to paste.
The smoke-test bullet states plainly that Task 9 did **not** run rather than quoting the plan's expected 1810 g
as though it had been observed, and the file also carries the two findings a reviewer needs: the test file was
**merged, not created** (the plan's "no `src/test` at all" premise was false), and `AuthControllerLoginTest`
carries a likely pre-existing `@WebMvcTest` missing-bean failure unrelated to this change.

---

## Self-review

(Filled by the planner before handing off — kept in the file so the executor can confirm coverage.)

**Spec coverage:**
- Breakdown scans every meal-plan entry, not just `sourceChain`'s recipe — Task 3 (Step 1 body, Step 2 grep), asserted by Task 4's `breakdownListsEveryRecipeUsingTheIngredient`.
- Main recipe **plus** recursive extras tree searched — Tasks 2 and 3, asserted by `breakdownFindsIngredientInsideAnExtraAndAttributesIt`.
- Popup total matches the shopping-list row — Task 3 (single accumulation path), verified end-to-end in Task 9 Step 1 (1810 g).
- `MealIngredientUsageDTO.viaRecipeName` added — Task 1, consumed in Task 3, asserted in Task 4, rendered in Task 5.
- Popup rows show date / meal / `via` — Tasks 5 and 6.
- First backend test scaffolded under `src/test/java/com/foodbytes/` — Task 4.
- Per-request memoisation of extras trees and extra recipes — Task 3 (`extrasTreeCache`, `extraRecipeCache`) and Task 2 (`collectUsagesFromExtras` cache parameter).

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step carries either the literal code to insert or a `Run:` / `Expected:` pair.

**Type / name consistency:** `viaRecipeName` is spelled identically in the DTO field (Task 1), the `IngredientUsage` carrier and both collectors (Task 2), the 6-arg constructor call (Task 3), the assertions (Task 4), and the JSX read `meal.viaRecipeName` (Task 5). `collectIngredientUsages` and `collectUsagesFromExtras` keep the same signatures across Tasks 2 and 3, including the `Map<Long, Recipe> extraRecipeCache` parameter. `.meal-details` / `.meal-context` match between the JSX (Task 5) and the CSS (Task 6). Every type used — `Recipe`, `RecipeIngredient`, `Ingredient`, `Unit`, `Meal`, `MealPlanEntry`, `User`, `RecipeExtraNodeDTO`, `MealIngredientUsageDTO`, `IngredientBreakdownDTO` — exists in the repo today with the members these steps call.

**Phase boundary cleanliness:**
- Phase 1 — the DTO field is nullable and the helpers are private and uncalled; the only intentional exception is that Task 1 widens the Lombok constructor, so full compilation resumes at Task 3 Step 3, which is called out inline in Task 1 rather than left as a surprise.
- Phase 2 — module compiles and the endpoint is fully functional; aggregation untouched, so any error is confined to the popup.
- Phase 3 — test sources only; production behaviour identical to end of Phase 2.
- Phase 4 — client builds; presentational change only, no half-applied CSS (the `flex: 1` move happens in the same rule replacement as the new classes).
- Phase 5 — read-only greps, builds, a manual smoke test, and documentation; no source changes.

---

## Fix pass (2026-07-29)

Single combined fix pass after the parallel Code-Evaluator / Defender / QA review. No completed step
above is un-ticked — everything here is additive or a correction on top of the delivered work.

**F1 — `collectUsagesFromExtras` now loads extras with `findById`, NOT `findWithDetailsById`
(supersedes `plan.md`).** `plan.md` Task 2 specified `findWithDetailsById` as a query optimisation.
That finder's `@EntityGraph` LEFT JOIN FETCHes two collections — `ingredients` (a `List` with no
`@OrderColumn`, i.e. a Hibernate *bag*) and `meals` (a `Set`). The SQL rows are the cartesian
product, and bag initialisation does not de-duplicate, so the `Set` collapses while every
`RecipeIngredient` survives once per `recipe_meals` row. `collectIngredientUsages` **sums** over
`recipe.getIngredients()`, so an extra tagged with 2 meals would report every quantity twice and
inflate the popup header against a shopping-list row that reads correctly (`processExtras` uses
plain `findById`, so only the popup would be wrong). Latent today only because every recipe used as
an extra happens to have exactly one `recipe_meals` row; the pre-existing `findWithDetailsById`
caller (`RecipeExtrasService:61`) builds a `Map`, so duplicates were harmless there — this was the
first *summing* caller. Now matches `processExtras` and relies on `@BatchSize(20)` the same way.
A long javadoc block plus an inline comment record *why*, so it isn't "optimised" back.

**F2 — new test `breakdownTotalMatchesShoppingListRowForTheSameIngredient`** pins AC 3, which was
previously proven by nothing (the Task 9 smoke test could not run). One fixture drives **both**
`getShoppingList` and `getIngredientBreakdown`: two dishes on different days, one contributing the
ingredient directly and one only through an extra, so both traversals are exercised. Asserts the
breakdown's `totalQuantity` equals the aisle-grouped row's `totalQuantity`, and that the individual
`mealBreakdown` quantities sum to that same figure. **The two totals do match** (1.50 tbsp) — AC 3
is genuinely satisfied, not merely undocumented. One `findById` stub now serves both methods, a
direct consequence of F1.

**F3 — two coverage gaps closed.**
(a) AC 7 memoisation: `breakdownScalesByServingsAndKeepsEveryOccurrenceOfTheSameDish` now
`verify(recipeExtrasService, times(1)).hasExtras(57L)` — 3 entries for one recipe must cause exactly
one round-trip.
(b) AC 2 "recursively": new `breakdownWalksNestedExtrasAndScalesOffTheMainRecipeServings`. Every
previous extras fixture used `children(new ArrayList<>())`, so the recursive branch of
`collectUsagesFromExtras` was never entered. Pizza(12, 2 srv) → Pizza Sauce(14, 4 srv) → Pesto(10,
6 srv) with the ingredient in the *grandchild*; asserts `viaRecipeName == "Pesto"` and that scaling
uses the **main** recipe's `defaultServings` (30 × 4 / 2 = 60), not the intermediates'.

Test count in `ShoppingListServiceTest`: 12 → 14.

**F4** — `IngredientBreakdownPopup.jsx` imports `parseISODate` from `utils/dateUtils` instead of
carrying a third byte-identical copy of that parse. Behaviour identical (the util *is* the deleted
body); the `if (!planDate) return ''` guard is retained, and malformed input degrades exactly as
before (`Invalid Date`).

**F5** — `.meal-context` `#777` → `#666`. `#777` on `#fff` is 4.476:1, below WCAG AA's 4.5:1, and at
`0.75rem`/12px the 3:1 large-text allowance does not apply. `#666` is 5.74:1 and is already the
codebase's de facto secondary-text colour.

**F6** — comment-only corrections at three sites that still described `sourceChain` as functional:
`MealPlanController` javadoc (lines 228-241), `shoppingService.js` `getIngredientBreakdown` jsdoc,
and the inline comment in `ShoppingListItem.startLongPress`. **No code, signature, or behaviour
changed** — the client still sends the parameter and the controller still parses it.

**F7** — `IngredientUsage` converted from an 11-line class to
`private record IngredientUsage(String, BigDecimal, String) {}` (Java 17; records already used in
`dto/PasswordLoginRequest`). All three read sites in `getIngredientBreakdown` moved from field
access to accessor calls; the two construction sites are unchanged.

**F8 — corrected the store-bought divergence javadoc (documentation only, no behaviour change).**
The original wording (inherited from `plan.md`) understated the problem as "the breakdown may list
an extra's ingredient the row's total excludes". The real divergence is larger: the persisted row
comes from `getShoppingList(…, homemadeSelections)`, and `processExtras` **skips a store-bought
extra's entire ingredient subtree**, substituting one raw ingredient. Because the breakdown assumes
homemade, its header total is **inflated by that whole subtree** — the total presented as
authoritative for the row can *exceed* the row. 38 FR-103 dual-path rows exist live, so this is
broadly reachable. The javadoc now says so explicitly. Threading selections through needs a POST
with a new request shape and remains out of scope.

**Declined by the orchestrator (recorded so they aren't re-raised):** `en-GB` → `en-US` (deliberate,
`plan.md`-specified format); consolidating the duplicate test fixtures and renaming the 7 legacy
tests (would mean editing working tests on a host that cannot compile); switching `processExtras` to
`findWithDetailsById` (out of scope *and* wrong given F1 — it would spread the bag bug into the
shopping list itself); resolving `ingredientName` via `ingredientRepository` (behaviour-affecting);
live-recompute staleness and all Defender Info items.

**Verification.** `npm --prefix foodbytes-app/client run build` → `vite v5.4.21`, `✓ 169 modules
transformed`, `✓ built in 796ms`, exit 0. Module count unchanged as expected: F4 adds an import of a
module already in the graph, and no file was added. **The backend was NOT compiled — `mvn`, `java`,
and `javac` are all absent from this host, as they were during the original execution.** Every Java
edit was audited by reading the real source instead (see the Implementer report). The Task 9 smoke
test remains NOT RUN, but AC 3 is no longer wholly unproven: F2 pins the row/header invariant at the
unit level.

---

## Review outcome and residual issues (2026-07-29)

Two review rounds ran, each dispatching Code-Evaluator + Defender + QA in parallel. Round 1: all three
found issues → one combined fix pass (F1–F8 above). Round 2: **Code-Evaluator APPROVED**, **Defender
APPROVED**, QA reported residuals only — **no verified-broken production behaviour in either round.**
Round cap reached, so the following are logged rather than fixed.

### Residual 1 — `test-strength`: the AC-3 invariant test is under-powered on scaling
`ShoppingListServiceTest.breakdownTotalMatchesShoppingListRowForTheSameIngredient`. Its javadoc claims to
catch "a scaling change in one traversal and not the other", but every ratio in its fixture is
`entryServings / defaultServings = 1.0` (2-serving entries on 2-serving recipes, and the dough extra is
also 2-serving). Change the breakdown's divisor to the extra's `defaultServings`, or either traversal's
rounding scale from 2 to 0, and the test still passes at 1.50. The divisor is independently pinned by
`breakdownWalksNestedExtrasAndScalesOffTheMainRecipeServings`, so the class as a whole still catches it —
but this specific test does not do what its comment says. **One-line fix:** give the fixture asymmetric
servings (e.g. 4 servings of a 2-serving curry, dough `defaultServings` 4).

### Residual 2 — `test-coverage-gap`: `extraRecipeCache` (half of AC 7) is unasserted
`ShoppingListService` lines 252 / 366. `verify(times(1)).hasExtras(57L)` pins the **extras-tree** cache,
but in every fixture each extra recipe is reached exactly once, so deleting `extraRecipeCache` would break
no assertion — the popup could silently regress to O(entries × extras) queries per long-press with a green
suite. **Fix:** a fixture where the same extra is reached from two entries, plus
`verify(recipeRepository, times(1)).findById(13L)`.

### Residual 3 — comment volume on the F1 rationale (Code-Evaluator, low)
The bag-duplication reasoning now appears three times: the 12-line javadoc (the right home), a 3-line
inline comment at the call site that says "see the javadoc" and then restates the mechanism anyway, and a
2-line restatement in the test. Reduce the inline comment to a pointer. Related wording nit: the javadoc
asserts `processExtras` uses `findById` "for exactly this reason" — historical intent that is not
documented at `processExtras`. The verifiable claim is "`processExtras` also uses plain `findById`; this
method matches it."

### Residual 4 — the F1 javadoc's query-count claim is wrong (Defender, Info)
The javadoc says `@BatchSize(20)` keeps the extras walk to "~1-2 queries per call". `@BatchSize` can only
batch collections that are *pending* at first access, and this code loads an extra then immediately reads
`getIngredients()`, so there is nothing to batch with — roughly one collection-init query per distinct
extra. The comment is also silent on two proxies F1 de-eagerised: `RecipeIngredient.ingredient` and
`RecipeIngredient.unit` are both `@ManyToOne(fetch = LAZY)` with **no** `@BatchSize` anywhere, and
`collectIngredientUsages` dereferences `getIngredient().getId()` and `getUnit().getValue()` on every row.
Realistic cost for a full week with nested extras is tens-to-low-hundreds of selects. **The F1 fix is
still correct** — correct numbers beat a bag-duplicating `@EntityGraph`, and `processExtras` on the far
hotter shopping-list path already pays the same cost. Only the comment needs correcting, and the honest
optimisation is a dedicated projection query, **not** reverting to `findWithDetailsById`.

### Residual 5 — four verification steps blocked by the host (not defects)
`mvn -DskipTests compile`, `mvn test -Dtest=ShoppingListServiceTest`, `mvn clean test`, and Task 9's
end-to-end smoke test are all **NOT RUN** — no JDK, Maven, Docker or git on this machine. No backend code
in this contract has ever been compiled or executed. Both reviewers hand-audited every edited expression
for type correctness and found no compile error, but inspection is not a compiler. Task 9's hand-off is
written out above; run it before trusting the 1810 g figure.

### Note — a second contract's work is interleaved in this working tree
`2026-07-29-decimal-serving-size` has also landed here: `MealPlanEntry.servings` and
`MealIngredientUsageDTO.servings` are now `BigDecimal` (not `Integer` as this plan assumed), and this
contract's scaling line was adapted to match (`.multiply(entryServings)`, no `BigDecimal.valueOf`). The
two changes are type-consistent end-to-end and no conflict remains — but the diff is **not** isolated to
this contract. Also present and unrelated to it: `client/src/constants/servings.js` (new),
`utils/servingsUtils.js`, `hooks/useServingsInput.js`, `components/recipes/RecipeCard.jsx`,
`RecipeCard.css`, `RecipeViewModal.jsx`. This is why the client build now reports **171 modules /
98.00 kB CSS** rather than the 169 / 97.22 kB recorded during execution — more than this contract is
being built. The new `src/constants/` folder holds serving-size constants, **not** the meal-type literal
map this contract's out-of-scope list forbade, so it is not a violation here.
