# Tasks: Decimal serving size (half portions)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: IN PROGRESS
Started: 2026-07-29

**Goal:** Make servings a decimal quantity end to end so a half portion (`0.5`), quarter (`0.25`), or `1.5` can be typed, persisted on the meal-plan entry, preserved through copy-week and templates, and used to scale aggregated shopping-list quantities.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-07-29_decimal_servings.sql` — widens `servings` to `DECIMAL(4,2)` on `meal_plan_entries` and `meal_plan_template_entries`
- `foodbytes-app/client/src/constants/servings.js` — `MIN_SERVINGS` / `MAX_SERVINGS` / `SERVINGS_STEP` (first file in a new `constants/` folder)
- `foodbytes-app/client/src/utils/servingsUtils.js` — `parseServings` / `formatServings` / `stepServings`
- `foodbytes-app/client/src/hooks/useServingsInput.js` — servings state + typing buffer, extracted per Task 14 Step 5's over-budget contingency (`RecipeViewModal.jsx` arrived at 425 real lines, not the planner's 393)

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanEntry.java:39-40` — `Integer servings` → `BigDecimal`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanTemplateEntry.java:39-40` — `Integer servings` → `BigDecimal`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanCreateRequest.java:1-29` — `BigDecimal` + `@DecimalMin`/`@DecimalMax`/`@Digits`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanEntryDTO.java:22` — `servings` → `BigDecimal`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanTemplateEntryDTO.java:17` — `servings` → `BigDecimal`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealIngredientUsageDTO.java:20` — `servings` → `BigDecimal`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java:179` — default `1` → `BigDecimal.ONE`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanTemplateService.java:174,204` — defaults → `BigDecimal.ONE`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:106,238,260-262,445-458,503-509,532,538` — `entryServings` typed `BigDecimal`, multiplied directly
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java:291-301` — helper takes `BigDecimal`, all call sites updated, new `0.5` test
- `foodbytes-app/client/src/components/recipes/RecipeCard.jsx:10,32-36,133-152` — editable decimal input, 0.5 stepping
- `foodbytes-app/client/src/components/recipes/RecipeCard.css:178-211` — input styling + 44px touch targets on `.servings-btn`
- `foodbytes-app/client/src/components/recipes/RecipeViewModal.jsx:66-68,102-105,228-246,302-316` — `parseInt` → `parseServings`
- `foodbytes-app/client/src/components/recipes/RecipeViewModal.css:225-236` — widen `.servings-input`
- `foodbytes-app/client/src/components/mealplan/MealPlanEntry.jsx:68-71,112-116` — `× 0.5` chip; remove the `console.log`
- `foodbytes-app/client/src/components/mealplan/MealPlanEntry.css:39-42` — `.entry-servings` chip styles
- `foodbytes-app/client/src/services/mealPlanService.js:24` — JSDoc: servings may be decimal
- `foodbytes-app/client/src/contexts/MealPlanContext.jsx:234` — JSDoc: servings may be decimal

**Deleted:** (none)

---

## Phase 1 — Schema widening

Creates the migration file and applies it to the database. The file alone is inert; applying it is what unblocks Phase 2. This is a safe stopping point because no Java or JavaScript changes yet — `INT` → `DECIMAL(4,2)` is a lossless widening for all 623 existing rows (values 1–4), and the currently deployed backend keeps reading whole numbers.

**Caveat the executor must respect:** once the DDL is applied, the *currently deployed* backend still maps `servings` to `Integer`. Hibernate `ddl-auto: validate` compares column types at startup, so if that instance restarts before Phase 2 ships it may fail validation. Apply the DDL and land Phases 2–3 in the same working session; do not leave the repo sitting between Phase 1 and Phase 2 overnight.

### Task 1: Migration file for the `servings` column widening ✓

- Skill: `java-backend` — owns the "entity change ⇒ date-prefixed migration file under `database/migrations/` ⇒ tell the user to apply it manually" contract.

**Files:**
- Create: `foodbytes-app/database/migrations/2026-07-29_decimal_servings.sql`

- [x] **Step 1: Write the migration file**

Follow the header style of `foodbytes-app/database/migrations/2026-05-09_meal_plan_templates.sql`.

```sql
-- 2026-07-29 — Decimal serving size (half portions)
--
-- Widens `servings` from INT to DECIMAL(4,2) so a meal plan entry can record a
-- fractional portion (0.5 for a half portion, 0.25 for a quarter).
--
-- Lossless: at time of writing meal_plan_entries holds 565 rows with servings
-- 1..4 and meal_plan_template_entries holds 58 rows with servings 1..2 — all
-- whole numbers, so MODIFY converts without truncation. No backfill required.
--
-- DECIMAL(4,2) permits 0.01..99.99 at the column level; the application floor
-- (0.25) and ceiling (20) are enforced by MealPlanCreateRequest validation,
-- matching how @Min(1) guarded this column before.
--
-- Both statements are idempotent: re-running MODIFY to the same type is a no-op.
--
-- MUST be applied to the Railway MySQL BEFORE the backend redeploys.
-- Hibernate runs ddl-auto: validate and will refuse to start if the entity is
-- BigDecimal while the column is still INT.

ALTER TABLE meal_plan_entries
  MODIFY COLUMN servings DECIMAL(4,2) NOT NULL DEFAULT 1.00;

ALTER TABLE meal_plan_template_entries
  MODIFY COLUMN servings DECIMAL(4,2) NOT NULL DEFAULT 1.00;
```

- [x] **Step 2: Confirm the file is where the migration runner expects it**

Run: `Get-ChildItem foodbytes-app\database\migrations -Filter "2026-07-29_decimal_servings.sql"`
Expected: one row listing `2026-07-29_decimal_servings.sql`.

### Task 2: Apply the migration to the database

- Skill: none — a DBA operation against the live Railway MySQL, not a code edit. No skill governs it; the ordering constraint comes from `CLAUDE.md` (`ddl-auto: validate`).

**Files:**
- Modify: none (this task changes database state, not files)

- [ ] **Step 1: Get explicit developer confirmation before touching the live database**

This is the production Railway MySQL holding real user accounts and meal plans. State plainly to the developer: two `ALTER TABLE … MODIFY` statements, on `meal_plan_entries` (565 rows) and `meal_plan_template_entries` (58 rows), widening `servings` `INT` → `DECIMAL(4,2)`; lossless, no backfill, no index change; a full-table rebuild on tables of this size takes well under a second. Wait for a yes before running Step 2.

Expected: explicit developer approval recorded in the session. If the developer declines or wants to run it via the Railway console themselves, skip Step 2 and go straight to Step 3 once they confirm they have run it.

- [ ] **Step 2: Run the two statements**

Run via the `mcp__mysql__mysql_query` tool, one statement per call:

```sql
ALTER TABLE meal_plan_entries MODIFY COLUMN servings DECIMAL(4,2) NOT NULL DEFAULT 1.00;
```

```sql
ALTER TABLE meal_plan_template_entries MODIFY COLUMN servings DECIMAL(4,2) NOT NULL DEFAULT 1.00;
```

Expected: each call returns success with no error. MySQL auto-commits DDL per statement, so if the second fails the first is already applied — re-running either is a no-op.

- [ ] **Step 3: Verify both columns and confirm no data was lost**

Run via `mcp__mysql__mysql_query`:

```sql
SELECT TABLE_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = 'servings'
ORDER BY TABLE_NAME;
```

Expected: exactly two rows — `meal_plan_entries` and `meal_plan_template_entries`, both `COLUMN_TYPE = decimal(4,2)`, `IS_NULLABLE = NO`, `COLUMN_DEFAULT = 1.00`.

Then:

```sql
SELECT COUNT(*) AS n, MIN(servings) AS min_srv, MAX(servings) AS max_srv FROM meal_plan_entries;
```

Expected: `n = 565`, `min_srv = 1.00`, `max_srv = 4.00` — same row count and same values, now with two decimal places.

---

## Phase 2 — Backend type sweep

Threads `BigDecimal` through the entities, DTOs, and services that carry `servings`, and updates the shopping-list tests. Entities are changed before the services that read them so the compiler points at every remaining call site. The phase boundary is safe because it ends with `mvn test` green and the schema already widened in Phase 1 — the backend is internally consistent and startable, with no half-applied type change.

### Task 3: Widen `MealPlanEntry.servings` to `BigDecimal` ✓

- Skill: `java-backend`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanEntry.java:1-40`

- [x] **Step 1: Add the import and change the field**

Add `import java.math.BigDecimal;` alongside the existing `java.time` imports, then replace:

```java
    @Column(nullable = false)
    private Integer servings = 1;
```

with:

```java
    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal servings = BigDecimal.ONE;
```

`precision`/`scale` mirror the `DECIMAL(4,2)` column from Task 1 so `ddl-auto: validate` agrees. `BigDecimal.ONE` is an immutable shared constant — safe as a field initialiser. `getCaloriesPerServing()` further down the file reads only `recipe` fields and needs no change.

- [x] **Step 2: Confirm the file compiles in isolation**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: compilation errors only in files that consume `getServings()` / `setServings()` (`MealPlanService`, `MealPlanTemplateService`, `ShoppingListService`) — those are Tasks 7, 8, 9. No error inside `MealPlanEntry.java` itself.

### Task 4: Widen `MealPlanTemplateEntry.servings` to `BigDecimal` ✓

- Skill: `java-backend`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanTemplateEntry.java:1-41`

- [x] **Step 1: Add the import and change the field**

Add `import java.math.BigDecimal;`, then replace:

```java
    @Column(nullable = false)
    private Integer servings = 1;
```

with:

```java
    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal servings = BigDecimal.ONE;
```

- [x] **Step 2: Confirm no new error class appears**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: still only the `MealPlanService` / `MealPlanTemplateService` / `ShoppingListService` errors from Task 3 — nothing new inside `MealPlanTemplateEntry.java`.

### Task 5: Widen `MealPlanCreateRequest.servings` and replace `@Min(1)` with decimal validation ✓

- Skill: `java-backend` — DTO layer; validation belongs on the request DTO, not the controller.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanCreateRequest.java:1-29`

- [x] **Step 1: Swap the validation annotations and the field type**

Replace the import block's `jakarta.validation.constraints.Min` with the four annotations used below, add `java.math.BigDecimal`, then replace:

```java
    @Min(value = 1, message = "Servings must be at least 1")
    private Integer servings = 1;
```

with:

```java
    @NotNull(message = "Servings is required")
    @DecimalMin(value = "0.25", message = "Servings must be at least 0.25")
    @DecimalMax(value = "20.00", message = "Servings must be at most 20")
    @Digits(integer = 2, fraction = 2, message = "Servings allows at most 2 decimal places")
    private BigDecimal servings = BigDecimal.ONE;
```

Resulting import set: `jakarta.validation.constraints.{DecimalMax, DecimalMin, Digits, NotNull}` plus the existing `java.time.LocalDate` and Lombok imports. `@Valid` on `MealPlanController.assignRecipe:67` already enforces these — no controller change.

- [x] **Step 2: Confirm the DTO compiles**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: no error in `MealPlanCreateRequest.java`; the pre-existing service errors remain.

### Task 6: Widen the three response / usage DTO `servings` fields ✓

- Skill: `java-backend` — one mechanical field change per DTO in the same layer, grouped as one slice because none carries logic.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanEntryDTO.java:22`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanTemplateEntryDTO.java:17`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealIngredientUsageDTO.java:20`

- [x] **Step 1: Change all three fields to `BigDecimal`**

In each file, add `import java.math.BigDecimal;` if absent (`MealIngredientUsageDTO` already imports it for `quantity`) and change `private Integer servings;` to `private BigDecimal servings;`.

Leave every other field untouched — in particular `MealPlanEntryDTO.caloriesPerServing` / `proteinPerServing` / `carbsPerServing` / `fatPerServing` stay `Integer` (they are per-serving recipe figures, not the entry multiplier), and `MealPlanTemplateEntryDTO.dayOffset` stays `Integer`.

- [x] **Step 2: Confirm the DTO layer compiles**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: no errors in any `dto/` file.

### Task 7: Update the `MealPlanService` servings default ✓

- Skill: `java-backend` — service layer; business default lives here, not in the controller.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java:179`

- [x] **Step 1: Replace the integer literal default**

In `assignRecipe`, replace:

```java
        entry.setServings(request.getServings() != null ? request.getServings() : 1);
```

with:

```java
        entry.setServings(request.getServings() != null ? request.getServings() : BigDecimal.ONE);
```

Add `import java.math.BigDecimal;`. `copyWeek:274` (`copy.setServings(source.getServings())`) and `convertToDTO:357` (`dto.setServings(entry.getServings())`) need no edit — the types now line up on both sides. `calculateCaloriesPerServing` is untouched: it divides `recipe.getCalories()` by `recipe.getDefaultServings()`, both still `Integer`.

- [x] **Step 2: Confirm this service compiles**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: no errors in `MealPlanService.java`.

### Task 8: Update the `MealPlanTemplateService` servings defaults ✓

- Skill: `java-backend`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanTemplateService.java:174,204`

- [x] **Step 1: Replace both integer literal defaults**

In `applyTemplate` (line 174, template → meal plan):

```java
            entry.setServings(src.getServings() != null ? src.getServings() : BigDecimal.ONE);
```

In `snapshotIntoTemplate` (line 204, meal plan → template):

```java
            e.setServings(src.getServings() != null ? src.getServings() : BigDecimal.ONE);
```

Add `import java.math.BigDecimal;`. `toEntryDTO:242` needs no change now that `MealPlanTemplateEntryDTO.servings` is `BigDecimal` (Task 6).

- [x] **Step 2: Confirm this service compiles**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: no errors in `MealPlanTemplateService.java`.

### Task 9: Thread `BigDecimal` servings through `ShoppingListService` scaling ✓

- Skill: `java-backend` — the arithmetic that makes a half portion actually halve the shopping list.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:106,238,260-262,445-458,503-509,532,538`

- [x] **Step 1: Change the two local declarations that read the entry**

`getShoppingList:106`:

```java
            BigDecimal entryServings = entry.getServings();
```

`getIngredientBreakdown:238`:

```java
            BigDecimal entryServings = entry.getServings();
```

`Integer recipeDefaultServings = recipe.getDefaultServings();` on the following line in each method stays `Integer` — `recipes.default_servings` is still an `INT`.

- [x] **Step 2: Change the `processRecipeIngredients` signature and drop the redundant boxing**

Signature (line 445):

```java
    private void processRecipeIngredients(Recipe recipe, BigDecimal entryServings, Integer defaultServings,
                                          Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients,
                                          List<Long> sourceChain) {
```

Scaling (lines 456-458) — multiply directly, removing one `BigDecimal` allocation per ingredient row:

```java
            BigDecimal scaledQuantity = originalQuantity
                .multiply(entryServings)
                .divide(BigDecimal.valueOf(defaultServings), 2, RoundingMode.HALF_UP);
```

- [x] **Step 3: Change the `processExtras` signature**

Line 503-509 — `entryServings` becomes `BigDecimal`, `defaultServings` stays `Integer`:

```java
    private void processExtras(List<RecipeExtraNodeDTO> extras,
                               Map<Long, Boolean> selections,
                               BigDecimal entryServings,
                               Integer defaultServings,
                               Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients,
                               List<StoreBoughtItem> storeBoughtItems,
                               List<Long> parentSourceChain) {
```

The two recursive/forwarding calls inside it (`processRecipeIngredients` at line 532 and `processExtras` at line 538) pass `entryServings` unchanged and need no edit. Also update the Javadoc line `@param entryServings Servings for the meal plan entry` to read `@param entryServings Servings for the meal plan entry (may be fractional, e.g. 0.5)`.

- [x] **Step 4: Fix the breakdown scaling in `getIngredientBreakdown`**

Lines 260-262:

```java
                BigDecimal scaledQuantity = usage.quantity
                    .multiply(entryServings)
                    .divide(BigDecimal.valueOf(recipeDefaultServings), 2, RoundingMode.HALF_UP);
```

`mealBreakdown.add(new MealIngredientUsageDTO(..., entryServings, ...))` on line 266-273 now type-matches the widened DTO field from Task 6 — no edit needed.

- [x] **Step 5: Confirm the whole backend compiles clean**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: BUILD SUCCESS with zero compilation errors across `src/main/java`.

### Task 10: Update `ShoppingListServiceTest` and add the half-portion invariant ✓

- Skill: `java-backend` — `mvn test` is the project's runner; this is the one automated proof that a decimal serving scales quantities correctly.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java:130-301`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java`

- [x] **Step 1: Write the failing half-portion test**

Add after `testDifferentServings_ScalesQuantitiesCorrectly` (line 169), mirroring its arrange/act/assert shape:

```java
    @Test
    void testFractionalServings_ScalesQuantitiesToFraction() {
        // Arrange
        Recipe recipe = createRecipe(1L, "Pasta", 4); // Default 4 servings
        Ingredient pasta = createIngredient(1L, "pasta", "Pasta", produceAisle);
        RecipeIngredient recipeIngredient = createRecipeIngredient(recipe, pasta, new BigDecimal("8.00"), ouncesUnit);
        recipe.setIngredients(List.of(recipeIngredient));

        // Half a portion of a 4-serving recipe = one eighth of the ingredients
        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe,
                                                 new BigDecimal("0.5"));

        when(mealPlanEntryRepository.findByUserIdAndDateRange(eq(userId), eq(startDate), eq(endDate)))
            .thenReturn(List.of(entry));

        // Act
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        // Assert
        ShoppingItemDTO item = result.getAisles().get(0).getItems().get(0);
        // 8.00 * 0.5 / 4 = 1.00
        assertThat(item.getTotalQuantity()).isEqualByComparingTo(new BigDecimal("1.00"));
    }

    @Test
    void testQuarterServings_ScalesQuantitiesToFraction() {
        // Arrange
        Recipe recipe = createRecipe(1L, "Soup", 2); // Default 2 servings
        Ingredient stock = createIngredient(1L, "stock", "Stock", produceAisle);
        RecipeIngredient recipeIngredient = createRecipeIngredient(recipe, stock, new BigDecimal("10.00"), ouncesUnit);
        recipe.setIngredients(List.of(recipeIngredient));

        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe,
                                                 new BigDecimal("0.25"));

        when(mealPlanEntryRepository.findByUserIdAndDateRange(eq(userId), eq(startDate), eq(endDate)))
            .thenReturn(List.of(entry));

        // Act
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        // Assert
        ShoppingItemDTO item = result.getAisles().get(0).getItems().get(0);
        // 10.00 * 0.25 / 2 = 1.25
        assertThat(item.getTotalQuantity()).isEqualByComparingTo(new BigDecimal("1.25"));
    }
```

- [x] **Step 2: Widen the `createMealPlanEntry` helper**

Line 291-292:

```java
    private MealPlanEntry createMealPlanEntry(Long id, User user, LocalDate planDate,
                                              Meal meal, Recipe recipe, BigDecimal servings) {
```

- [x] **Step 3: Update every existing call site to pass a `BigDecimal`**

Six call sites pass integer literals today — lines 130, 131, 157, 182, 215, 245. Change each trailing argument:

- `…, recipe1, 2)` → `…, recipe1, new BigDecimal("2"))`
- `…, recipe2, 1)` → `…, recipe2, new BigDecimal("1"))`
- `…, recipe, 2)` → `…, recipe, new BigDecimal("2"))` (lines 157, 182, 215, 245)

Grep the file afterwards for `breakfastMeal, recipe` to confirm no call site still passes a bare integer. `createRecipe(…, Integer defaultServings)` at line 263 is **unchanged** — recipe default servings stays `Integer`.

- [x] **Step 4: Run the shopping-list test class**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListServiceTest`
Expected: BUILD SUCCESS, 0 failures, 0 errors — including the two new fractional tests asserting `1.00` and `1.25`.

---

## Phase 3 — Frontend decimal input

Extracts the servings bounds and parse rules into shared modules, then rewires the two servings controls and adds the calendar chip that makes a persisted decimal visible. Constants and utils come first so the components can import them. The boundary is safe because it ends with `npm run build` green and both controls consistently using the same helpers — no component left half-converted between `parseInt` and `parseServings`.

### Task 11: Create the servings constants module ✓

- Skill: `react-frontend` — its hard floor requires any repeated meaningful value be declared once in `src/constants/`; this is the first file in that folder.

**Files:**
- Create: `foodbytes-app/client/src/constants/servings.js`

- [x] **Step 1: Write the constants**

```js
/**
 * Servings bounds shared by every servings control.
 *
 * Decimal servings let a user plan a half portion (0.5) or a quarter (0.25).
 * MIN/MAX mirror the MealPlanCreateRequest validation on the backend
 * (@DecimalMin("0.25") / @DecimalMax("20.00")) — keep them in sync.
 */
export const MIN_SERVINGS = 0.25
export const MAX_SERVINGS = 20
export const SERVINGS_STEP = 0.5
```

Exactly these three exports — `plan.md` Part 2 → Data shapes defines the module's surface. The 2-decimal rounding factor is a private implementation detail of `servingsUtils.js` (Task 12) and is deliberately not exported.

### Task 12: Create the servings parse / format / step helpers ✓

- Skill: `react-frontend` — logic lives outside components; pure helpers in `utils/` following the `dateUtils.js` precedent.

**Files:**
- Create: `foodbytes-app/client/src/utils/servingsUtils.js`

- [x] **Step 1: Write the three helpers**

```js
import { MIN_SERVINGS, MAX_SERVINGS } from '../constants/servings'

// Servings allows at most 2 decimal places — mirrors @Digits(fraction = 2) on
// MealPlanCreateRequest. Private to this module; not part of the constants surface.
const SERVINGS_DECIMALS = 2
const FACTOR = 10 ** SERVINGS_DECIMALS

/**
 * Round to the allowed precision, avoiding the classic 1.005 float artefact.
 */
function roundServings(value) {
  return Math.round((value + Number.EPSILON) * FACTOR) / FACTOR
}

/**
 * Parse user input into a valid servings number.
 * Returns null when the input cannot be read as a number — callers keep their
 * last valid value rather than rendering an error.
 * Valid input is clamped to [MIN_SERVINGS, MAX_SERVINGS] and rounded to 2dp,
 * so the value sent to POST /api/meal-plan always satisfies the backend's
 * @DecimalMin / @DecimalMax / @Digits constraints.
 */
export function parseServings(input) {
  if (input === null || input === undefined) return null
  const trimmed = String(input).trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) return null
  return roundServings(Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, parsed)))
}

/**
 * Format a servings value for display: 0.5 -> "0.5", 1 -> "1", 1.25 -> "1.25".
 * Trailing zeros are stripped so a BigDecimal that arrives as 0.50 reads "0.5".
 */
export function formatServings(value) {
  const parsed = parseServings(value)
  if (parsed === null) return ''
  return String(parsed)
}

/**
 * Step a servings value by delta (used by the +/- buttons), clamped and rounded.
 */
export function stepServings(value, delta) {
  const current = parseServings(value)
  const base = current === null ? MIN_SERVINGS : current
  return roundServings(Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, base + delta)))
}
```

- [x] **Step 2: Verify the helpers against the cases the feature depends on**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {parseServings,formatServings,stepServings} from './src/utils/servingsUtils.js'; console.log([parseServings('.5'),parseServings('0.25'),parseServings('abc'),parseServings(''),parseServings('0.1'),parseServings('99'),formatServings(0.5),formatServings('0.50'),formatServings(2),stepServings(1,-0.5),stepServings(0.5,-0.5),stepServings(20,0.5)].join('|'))"`
Expected: `0.5|0.25|null|null|0.25|20|0.5|0.5|2|0.5|0.25|20` — note `0.1` clamps up to the `0.25` floor and `stepServings(0.5, -0.5)` floors at `0.25` rather than reaching `0`.

### Task 13: Make the `RecipeCard` servings pill accept a typed decimal ✓

- Skill: `react-frontend` — this is the control whose value is persisted; also carries the touch-target corrections the skill requires on buttons being edited.

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeCard.jsx:1-10,32-36,133-152`
- Modify: `foodbytes-app/client/src/components/recipes/RecipeCard.css:178-211`

- [x] **Step 1: Import the helpers and add the typing buffer state**

Add to the import block:

```js
import { MIN_SERVINGS, MAX_SERVINGS, SERVINGS_STEP } from '../../constants/servings'
import { parseServings, formatServings, stepServings } from '../../utils/servingsUtils'
```

Replace line 10:

```js
  const [servings, setServings] = useState(recipe.defaultServings || 1)
  // Display buffer so a partially-typed value ("0." ) doesn't clobber the numeric state
  const [servingsDisplay, setServingsDisplay] = useState(formatServings(recipe.defaultServings || 1))
```

- [x] **Step 2: Add the change / blur / step handlers**

Insert after `scaleQuantity` (line 36), keeping the file's existing helper placement:

```js
  const handleServingsChange = (e) => {
    setServingsDisplay(e.target.value)
    const parsed = parseServings(e.target.value)
    if (parsed !== null) setServings(parsed)
  }

  const handleServingsBlur = () => {
    setServingsDisplay(formatServings(servings))
  }

  const adjustServings = (delta) => {
    const next = stepServings(servings, delta)
    setServings(next)
    setServingsDisplay(formatServings(next))
  }
```

`scaleQuantity` at line 32-36 already divides by `recipe.defaultServings` and multiplies by `servings`, so it handles a fractional `servings` unchanged.

- [x] **Step 3: Replace the read-only value span with an input**

Replace the whole `servings-pill` block (lines 134-152):

```jsx
        <div className="servings-pill">
          <button
            className="servings-btn"
            onClick={() => adjustServings(-SERVINGS_STEP)}
            disabled={servings <= MIN_SERVINGS}
            aria-label="Decrease servings"
          >
            −
          </button>
          <input
            type="number"
            inputMode="decimal"
            min={MIN_SERVINGS}
            max={MAX_SERVINGS}
            step={SERVINGS_STEP}
            value={servingsDisplay}
            onChange={handleServingsChange}
            onBlur={handleServingsBlur}
            className="servings-input"
            aria-label="Number of servings"
          />
          <button
            className="servings-btn"
            onClick={() => adjustServings(SERVINGS_STEP)}
            disabled={servings >= MAX_SERVINGS}
            aria-label="Increase servings"
          >
            +
          </button>
        </div>
```

- [x] **Step 4: Style the input and fix the touch targets on the buttons**

In `RecipeCard.css`, replace the `.servings-value` rule (lines 205-211) with a `.servings-input` rule, and extend `.servings-btn`:

```css
.servings-btn {
  width: 28px;
  height: 28px;
  /* Keep the 28px visual but expand the hit area to the 44px touch minimum */
  min-width: 44px;
  min-height: 44px;
  padding: 8px;
  box-sizing: content-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  transition: all 0.2s;
  font-family: inherit;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Hover only where hover exists — avoids sticky hover on touch */
@media (hover: hover) {
  .servings-btn:hover:not(:disabled) {
    background: var(--brand-primary);
    color: white;
  }
}

.servings-btn:active:not(:disabled) {
  background: var(--brand-primary);
  color: white;
}

.servings-btn:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

.servings-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.servings-input {
  width: 40px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  background: transparent;
  border: none;
  font-family: inherit;
  -moz-appearance: textfield;
  touch-action: manipulation;
}

.servings-input::-webkit-outer-spin-button,
.servings-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.servings-input:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 1px;
  border-radius: 4px;
}
```

Delete the now-superseded original `.servings-btn:hover:not(:disabled)` rule (old lines 195-198) so the hover style exists only inside the `@media (hover: hover)` block. Width goes 24px → 40px so `1.25` fits.

- [x] **Step 5: Confirm the build is clean and the file is under budget**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in …` with no errors.

Run: `(Get-Content foodbytes-app\client\src\components\recipes\RecipeCard.jsx | Measure-Object -Line).Lines`
Expected: a number under 400 (it was 235; expect roughly 265).

### Task 14: Switch the `RecipeViewModal` servings input to decimal parsing

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeViewModal.jsx:1-8,66-68,102-105,228-246,302-316`
- Modify: `foodbytes-app/client/src/components/recipes/RecipeViewModal.css:225-236`

- [x] **Step 1: Import the helpers and format the initial display state**

Add to the imports:

```js
import { MIN_SERVINGS, MAX_SERVINGS, SERVINGS_STEP } from '../../constants/servings'
import { parseServings, formatServings } from '../../utils/servingsUtils'
```

Line 68 — format instead of raw `String()`:

```js
  const [servingsDisplay, setServingsDisplay] = useState(formatServings(servings))
```

Line 105, inside the stack-navigation effect:

```js
      setServingsDisplay(formatServings(newServings))
```

- [x] **Step 2: Replace the `parseInt` handlers**

Lines 230-246:

```js
  const handleServingsChange = (e) => {
    const inputValue = e.target.value
    setServingsDisplay(inputValue)

    // Only update the actual servings when the input reads as a valid number
    const parsed = parseServings(inputValue)
    if (parsed !== null) {
      setCurrentServings(parsed)
    }
  }

  // Handle blur - restore display to the actual value if empty or unparseable
  const handleServingsBlur = () => {
    if (parseServings(servingsDisplay) === null) {
      setServingsDisplay(formatServings(currentServings))
    }
  }
```

- [x] **Step 3: Widen the input's accepted range**

Lines 304-315 — replace the hardcoded `min="1"` / `max="20"` with the shared constants and add a decimal step:

```jsx
                <input
                  type="number"
                  inputMode="decimal"
                  min={MIN_SERVINGS}
                  max={MAX_SERVINGS}
                  step={SERVINGS_STEP}
                  value={servingsDisplay}
                  onChange={handleServingsChange}
                  onBlur={handleServingsBlur}
                  onClick={(e) => e.stopPropagation()}
                  className="servings-input"
                  aria-label="Number of servings"
                />
```

The `serving{currentServings !== 1 ? 's' : ''}` label on line 315 needs no change — `0.5 servings` and `1 serving` both read correctly.

- [x] **Step 4: Widen the input in CSS**

`RecipeViewModal.css` line 226 — `1.25` needs more room than 40px:

```css
.recipe-view-modal .servings-input {
  width: 52px;
```

Leave the rest of the rule (background, spin-button reset, focus style) as is.

- [ ] **Step 5: Confirm the build is clean and the file has not crossed the 400-line budget**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in …` with no errors.

Run: `(Get-Content foodbytes-app\client\src\components\recipes\RecipeViewModal.jsx | Measure-Object -Line).Lines`
Expected: **under 400.** It was 393 and these edits are near line-neutral. If the count is 400 or more, extract `currentServings` / `servingsDisplay` and the three handlers into `client/src/hooks/useServingsInput.js` in this same task and re-run the count — the `react-frontend` skill treats >400 as blocking.

### Task 15: Show the persisted decimal on the meal-plan calendar entry ✓

- Skill: `react-frontend` — the only surface that displays a saved non-1 servings value; also removes a known-debt `console.log` while in the file.

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanEntry.jsx:1-5,68-71,112-116`
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanEntry.css:39-42`

- [x] **Step 1: Import the formatter and render the chip**

Add to the imports:

```js
import { formatServings } from '../../utils/servingsUtils'
```

Replace the calories line (lines 69-70):

```jsx
          <span className="recipe-name">{entry.recipe?.name}</span>
          <span className="recipe-calories">
            {entry.caloriesPerServing} cal
            {entry.servings != null && Number(entry.servings) !== 1 && (
              <span className="entry-servings">× {formatServings(entry.servings)}</span>
            )}
          </span>
```

The chip is hidden for the common `servings === 1` case. `Number()` handles the `0.50` that Jackson serialises from `BigDecimal`.

- [x] **Step 2: Remove the known-debt `console.log`**

Line 112-116 — drop the log while keeping the no-op comment that documents why variant selection does nothing here:

```jsx
          onSelectVariant={() => {
            // FR-013: In meal plan view, variant selection updates display only
            // (a recipe swap would require updating the meal plan entry)
          }}
```

- [x] **Step 3: Style the chip**

Add after the `.recipe-calories` rule in `MealPlanEntry.css` (line 42):

```css
.entry-servings {
  margin-left: 5px;
  padding: 0 4px;
  border-radius: 3px;
  background-color: rgba(74, 63, 128, 0.15);
  color: #4a3f80;
  font-weight: 600;
  font-size: 10px;
  white-space: nowrap;
}
```

- [x] **Step 4: Confirm the build is clean**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in …` with no errors.

### Task 16: Document the decimal contract on the service and context ✓

- Skill: `react-frontend` — the service/context boundary the skill requires HTTP to pass through; JSDoc is the contract other callers read.

**Files:**
- Modify: `foodbytes-app/client/src/services/mealPlanService.js:24`
- Modify: `foodbytes-app/client/src/contexts/MealPlanContext.jsx:234`

- [x] **Step 1: Update both JSDoc `@param` lines**

`mealPlanService.js` line 24:

```js
   * @param {number} servings - Servings to cook; may be fractional (0.5 = half portion), 0.25–20, max 2dp
```

`MealPlanContext.jsx` line 234:

```js
   * @param {number} servings - Servings to cook; may be fractional (0.5 = half portion)
```

No behavioural change: `mealPlanService.assignRecipe` already forwards `servings` as a JSON number, and `applyOptimisticUpdate` only stores it on the optimistic entry (its calorie delta is computed from `recipe.calories / recipe.defaultServings`, which is deliberately servings-blind per `plan.md` → Explicitly out of scope).

- [x] **Step 2: Confirm no functional drift crept in**

Run: `Select-String -Path foodbytes-app\client\src\contexts\MealPlanContext.jsx -Pattern 'servings' -SimpleMatch | Select-Object LineNumber, Line`
Expected: the same six occurrences as before the edit (JSDoc line, the `applyOptimisticUpdate` signature, the `servings: servings` optimistic field, the `assignRecipe` signature, and the `applyOptimisticUpdate` / `mealPlanService.assignRecipe` call sites) — no arithmetic on `servings` anywhere.

---

## Phase 4 — Final verification

No production changes. Confirms the type sweep left nothing behind, the backend suite is green, the frontend builds and stays inside its file budget, and the `0.5` round-trip actually works in the browser against the migrated database.

### Task 17: Grep for leftovers from the type sweep

- Skill: none — verification greps, no code edited.

**Files:**
- Modify: none

- [ ] **Step 1: Confirm no `Integer servings` remains in the backend**

Run:
```powershell
Get-ChildItem -Recurse -Path foodbytes-app\foodbytes-api\src -Filter *.java | Select-String -Pattern 'Integer servings'
```
Expected: zero hits.

- [ ] **Step 2: Confirm the redundant boxing and the integer defaults are gone**

Run:
```powershell
Get-ChildItem -Recurse -Path foodbytes-app\foodbytes-api\src -Filter *.java | Select-String -Pattern 'BigDecimal\.valueOf\(entryServings\)'
```
Expected: zero hits.

Run:
```powershell
Get-ChildItem -Recurse -Path foodbytes-app\foodbytes-api\src -Filter *.java | Select-String -Pattern 'setServings' | Select-Object Filename, LineNumber, Line
```
Expected: five hits total, **none ending in `: 1)`** — four under `src/main` (`MealPlanService:179` and `MealPlanTemplateService:174,204` now end in `: BigDecimal.ONE)`; `MealPlanService.copyWeek:274` is a plain `copy.setServings(source.getServings())` forward), plus one in `ShoppingListServiceTest`'s `createMealPlanEntry` helper, which assigns the `BigDecimal` parameter.

- [ ] **Step 3: Confirm no `parseInt` or hardcoded bound remains on a servings control**

Run:
```powershell
Select-String -Path foodbytes-app\client\src\components\recipes\RecipeCard.jsx, foodbytes-app\client\src\components\recipes\RecipeViewModal.jsx -Pattern 'parseInt|Math\.max\(1,|Math\.min\(20,|min="1"|max="20"'
```
Expected: zero hits — every bound now comes from `constants/servings.js`.

- [ ] **Step 4: Confirm the `console.log` count dropped and nothing new was added**

Run:
```powershell
(Get-ChildItem -Recurse -Path foodbytes-app\client\src -Include *.js,*.jsx | Select-String -Pattern 'console\.(log|debug)' | Measure-Object).Count
```
Expected: `5` — one below the documented baseline of 6, because Task 15 removed the `MealPlanEntry.jsx` log and no task adds one.

### Task 18: Run the full backend test suite

- Skill: none — running the project's existing runner.

**Files:**
- Modify: none

- [ ] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn clean test`
Expected: BUILD SUCCESS with 0 failures and 0 errors, and `ShoppingListServiceTest` reporting the two new fractional tests (`testFractionalServings_ScalesQuantitiesToFraction`, `testQuarterServings_ScalesQuantitiesToFraction`) among its passes.

### Task 19: Confirm the frontend build and the file-size budget

- Skill: none — verification only.

**Files:**
- Modify: none

- [ ] **Step 1: Production build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `✓ built in …` with no errors and no new warnings about unresolved imports of `constants/servings` or `utils/servingsUtils`.

- [ ] **Step 2: Measure every file created or grown in Phase 3**

Run:
```powershell
Get-ChildItem foodbytes-app\client\src\components\recipes\RecipeCard.jsx, foodbytes-app\client\src\components\recipes\RecipeViewModal.jsx, foodbytes-app\client\src\components\mealplan\MealPlanEntry.jsx, foodbytes-app\client\src\utils\servingsUtils.js, foodbytes-app\client\src\constants\servings.js | ForEach-Object { "$($_.Name): $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }
```
Expected: every count under 400. `RecipeViewModal.jsx` is the one at risk (was 393) — if it is 400 or more, the `useServingsInput` extraction from Task 14 Step 5 was not applied and must be.

### Task 20: Manual smoke test of the half-portion round trip

- Skill: none — there is no frontend test runner in `client/package.json`, so this is a browser check and must be reported as manual, never as "tests passed".

**Files:**
- Modify: none

- [ ] **Step 1: Start the stack and exercise the round trip**

Run: `cd foodbytes-app\client; npm run dev` (with the backend on `:8080` via `cd foodbytes-app\foodbytes-api; mvn spring-boot:run`, against the database migrated in Phase 1).

Then, in the browser at `http://localhost:5173`:

1. On `/search`, pick a recipe with `defaultServings = 2` and type `0.5` into its servings input.
2. Click a day button to assign it.
3. Go to `/mealplan` — the entry shows a `× 0.5` chip next to its calories.
4. Hard-reload the page — the chip is still `× 0.5` (proves it persisted, not just optimistic state).
5. Go to `/shopping` — that recipe's ingredient quantities are one quarter of the recipe's listed amounts (`0.5 / 2`).
6. Back on `/search`, click `−` from `0.5` — the value floors at `0.25`, and `+` steps `0.25 → 0.75 → 1.25`.
7. Type `abc` into the input, then click away — the display restores to the last valid number rather than showing an error.

Expected: all seven observations hold. Report each explicitly as manually verified, and name anything not exercised.

- [ ] **Step 2: Confirm the persisted value in the database**

Run via `mcp__mysql__mysql_query`:

```sql
SELECT plan_date, meal_id, recipe_id, servings
FROM meal_plan_entries
WHERE servings <> ROUND(servings)
ORDER BY id DESC LIMIT 5;
```

Expected: at least one row with `servings = 0.50` — the entry assigned in Step 1.

### Task 21: Write up the change

- Skill: none — documentation.

**Files:**
- Modify: none

- [ ] **Step 1: Produce the change summary / PR description**

Include:

- Link to this contract folder (`.claude/contract/2026-07-29-decimal-serving-size/`).
- Summary: servings widened `INT` → `DECIMAL(4,2)` and `Integer` → `BigDecimal` end to end; free-text decimal input (0.25–20, max 2dp) on both servings controls; `× 0.5` chip on planned entries; shopping-list quantities scale by the fraction.
- **Deploy order, stated first and unmissable:** the Phase 1 migration must already be applied to the Railway MySQL before the backend redeploys — `ddl-auto: validate` refuses to start if the entity is `BigDecimal` while the column is `INT`.
- `mvn clean test` result from Task 18 (pass/fail and counts).
- Manual smoke-test results from Task 20, explicitly labelled manual — state that the frontend has no automated test suite.
- Known limitation, called out for future contributors: day and week calorie/macro totals still ignore the servings multiplier (`MealPlanService.buildDayDTO` sums per-serving kcal, `MacroCalculationService.calculateTotalMacros` takes recipes not entries), so a `0.5` entry does not halve the day's calories. Pre-existing FR-017/FR-036 behaviour, deliberately out of scope here.
- New convention introduced: `client/src/constants/` now exists — put shared literal maps there, not inline in components.

---

## Self-review

(Filled by the planner before handing off so the executor can confirm coverage.)

**Spec coverage** — every "In scope" bullet in `plan.md` Part 1 maps to at least one task:

- Widen `meal_plan_entries.servings` — Tasks 1, 2.
- Widen `meal_plan_template_entries.servings` — Tasks 1, 2.
- `MealPlanEntry` / `MealPlanTemplateEntry` entities → `BigDecimal` — Tasks 3, 4.
- `MealPlanEntryDTO` / `MealPlanTemplateEntryDTO` / `MealIngredientUsageDTO` → `BigDecimal` — Task 6.
- `MealPlanCreateRequest` `@Min(1)` → `@DecimalMin`/`@DecimalMax`/`@Digits` — Task 5.
- `BigDecimal.ONE` defaults in `MealPlanService` / `MealPlanTemplateService` — Tasks 7, 8.
- `ShoppingListService` signatures + direct multiplication — Task 9.
- `ShoppingListServiceTest` helper + `0.5` invariant — Task 10.
- `constants/servings.js` + `utils/servingsUtils.js` — Tasks 11, 12.
- `RecipeCard` editable decimal input + 0.5 stepping — Task 13.
- `RecipeViewModal` `parseServings` swap — Task 14.
- `MealPlanEntry` `× 0.5` chip — Task 15.
- CSS for the widened inputs + 44px touch targets / `@media (hover: hover)` — Tasks 13 Step 4, 14 Step 4, 15 Step 3.
- JSDoc on `mealPlanService` + `MealPlanContext` — Task 16.
- Deploy-order warning the developer owes Railway — Task 2 Step 1, Task 21 Step 1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code to write or a runnable command with an `Expected:` line.

**Type / name consistency:** `servings` is `BigDecimal` in `MealPlanEntry`, `MealPlanTemplateEntry`, `MealPlanCreateRequest`, `MealPlanEntryDTO`, `MealPlanTemplateEntryDTO`, and `MealIngredientUsageDTO` — used identically in Tasks 3–10 and matching `plan.md` Part 2 → Data shapes. `defaultServings` stays `Integer` everywhere it appears (Tasks 9, 10 Step 3). `parseServings` / `formatServings` / `stepServings` and `MIN_SERVINGS` / `MAX_SERVINGS` / `SERVINGS_STEP` / `SERVINGS_DECIMALS` are spelled identically in Tasks 11–16 and in `plan.md` → New frontend modules. `processRecipeIngredients` and `processExtras` keep their existing names; only parameter types change. `.servings-input` is the class name in both `RecipeCard.css` and `RecipeViewModal.css` (each already scoped — the modal's rules are prefixed `.recipe-view-modal`), and `.entry-servings` is unique to `MealPlanEntry.css`.

**Phase boundary cleanliness:**

- **Phase 1** — schema widened, no code touched; the deployed backend still reads whole numbers, and both `ALTER` statements are individually re-runnable. Flagged in the phase framing: do not idle between Phase 1 and Phase 2, because a restart of the old backend in that window could fail Hibernate validation.
- **Phase 2** — ends with `mvn clean test` green against the already-widened schema; entities, DTOs, services, and tests all agree on `BigDecimal`, so there is no half-applied type change.
- **Phase 3** — ends with `npm run build` green, both servings controls importing the same helpers, and every touched file measured under the 400-line budget; no component left mixing `parseInt` and `parseServings`.
- **Phase 4** — verification only; no production file is modified, so the boundary is trivially clean.
