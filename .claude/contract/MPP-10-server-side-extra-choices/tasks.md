# Tasks: Server-side homemade/store-bought choices per planned meal + Manage extras + gram quantities + 32 missing recipe_extras links

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-10

**Goal:** Store homemade/store-bought extra choices in MySQL per planned meal, per template entry and as a per-dish (per-family) default under the effective meal-plan owner; have shopping-list generation and the ingredient breakdown read them and list store-bought products in grams; carry choices through assign / variant swap / copy week / swap days / templates; add the Manage extras popup (week + template), cart icon and Regenerate bar; migrate localStorage choices once; add the 32 missing `recipe_extras` rows.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-10-mpp10-extra-choices-schema.sql` — three choice tables with cascading FKs
- `foodbytes-app/database/migrations/2026-10-10-mpp10-recipe-extras-missing-links.sql` — 32 guarded `recipe_extras` inserts
- `foodbytes-api/src/main/java/com/foodbytes/model/MealPlanEntryExtraChoice.java` — per-entry choice entity
- `foodbytes-api/src/main/java/com/foodbytes/model/MealPlanTemplateEntryExtraChoice.java` — per-template-entry choice entity
- `foodbytes-api/src/main/java/com/foodbytes/model/UserExtraDefault.java` — per-owner per-dish default entity
- `foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanEntryExtraChoiceRepository.java`
- `foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanTemplateEntryExtraChoiceRepository.java`
- `foodbytes-api/src/main/java/com/foodbytes/repository/UserExtraDefaultRepository.java`
- `foodbytes-api/src/main/java/com/foodbytes/service/ExtraPortionResolver.java` — link-grams / portion-ratio maths moved out of ShoppingListService
- `foodbytes-api/src/main/java/com/foodbytes/service/ExtraChoiceService.java` — all choice rules
- `foodbytes-api/src/main/java/com/foodbytes/service/ManageExtrasService.java` — popup view model + template counts
- `foodbytes-api/src/main/java/com/foodbytes/controller/MealPlanExtrasController.java` — `/api/meal-plan/extras`
- `foodbytes-api/src/main/java/com/foodbytes/dto/ExtraChoiceItemDTO.java`, `ExtraChoicesUpdateRequest.java`, `LegacySelectionsImportRequest.java`, `ManageExtrasViewDTO.java`, `ManageExtrasMealDTO.java`, `ManageExtraDTO.java`
- `foodbytes-api/src/test/java/com/foodbytes/service/ExtraChoiceServiceTest.java`
- `foodbytes-api/src/test/java/com/foodbytes/service/ManageExtrasServiceTest.java`
- `foodbytes-api/src/test/java/com/foodbytes/service/MealPlanTemplateServiceTest.java`
- `client/src/constants/extraChoices.js`, `client/src/services/extraChoicesService.js`, `client/src/utils/manageExtrasUtils.js`
- `client/src/hooks/useManageExtras.js`, `client/src/hooks/useLinkedStepSelections.js`
- `client/src/components/common/ExtrasIcons.jsx`
- `client/src/components/mealplan/ManageExtrasModal.jsx`, `ManageExtrasModal.css`, `ManageExtrasMeal.jsx`, `ExtraChoiceRow.jsx`, `ShoppingListStaleBar.jsx`, `WeekExtrasModal.jsx`, `TemplateExtrasModal.jsx`

**Modified:**
- `foodbytes-api/.../repository/MealPlanEntryRepository.java` — add `findByUserIdFromDate`
- `foodbytes-api/.../service/ShoppingListService.java` — stored choices, grams, breakdown; resolver + choice service injected; `macroCalculationService` removed
- `foodbytes-api/.../service/PersistedShoppingListService.java` — drop selections param
- `foodbytes-api/.../controller/ShoppingListController.java`, `MealPlanController.java` — drop selections plumbing
- `foodbytes-api/.../dto/GenerateShoppingListRequest.java` — remove `selections`
- `foodbytes-api/.../dto/MealPlanCreateRequest.java`, `MealPlanEntryDTO.java`, `MealPlanTemplateDTO.java` — new fields
- `foodbytes-api/.../service/MealPlanService.java` — assign / copy week / week plan choices
- `foodbytes-api/.../service/MealPlanTemplateService.java` — snapshot / apply choices, counts
- `foodbytes-api/src/test/.../service/ShoppingListServiceTest.java`, `MealPlanServiceTest.java`, `controller/ShoppingListControllerTest.java`
- `client/src/contexts/HomemadeSelectionsContext.jsx` — API-backed defaults + legacy import
- `client/src/components/recipes/ExtrasSelectionPopup.jsx`, `DayAssignmentButtons.jsx` — pre-fill + send choices
- `client/src/services/mealPlanService.js`, `client/src/contexts/MealPlanContext.jsx:250,273` — forward `extraChoices` (no line growth)
- `client/src/components/shopping/GenerateShoppingListModal.jsx`, `client/src/contexts/ShoppingListContext.jsx:115-122`, `client/src/services/shoppingService.js` — remove `selections`
- `client/src/components/mealplan/MealPlanEntry.jsx`, `MealPlanEntry.css` — cart icon, pass entry choices
- `client/src/components/recipes/RecipeViewModal.jsx:7,46-47` — use `useLinkedStepSelections` (no line growth)
- `client/src/components/mealplan/MealPlanMenu.jsx`, `MealPlanMenu.css` — Manage extras item + divider
- `client/src/components/mealplan/ManageTemplatesModal.jsx`, `TemplateModals.css` — Extras button, meta count
- `client/src/components/mealplan/MealPlanCalendar.jsx` — modal wiring

**Deleted:**
- `foodbytes-api/src/main/java/com/foodbytes/dto/HomemadeSelectionsDTO.java`
- `foodbytes-api/src/test/java/com/foodbytes/dto/GenerateShoppingListRequestTest.java`

---

## Phase 1 — Migrations written and applied

Writes the schema and data migrations, then the developer applies them to Railway. Nothing in Java references the new tables yet, so the build is untouched and the live backend keeps running (Hibernate `validate` ignores tables no entity maps).

### Task 1: Write the choice-tables schema migration ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-10-mpp10-extra-choices-schema.sql`

- [x] **Step 1: Write the migration file**

```sql
-- MPP-10: server-side homemade/store-bought choices for recipe extras.
--
-- Adds three tables:
--   meal_plan_entry_extra_choices          — choice per planned meal per extra
--   meal_plan_template_entry_extra_choices — choice per template entry per extra
--   user_extra_defaults                    — per-owner per-dish default (pre-fills the add-to-day popup)
--
-- Purely additive: no existing column or row changes (lossless). Live counts at planning
-- (2026-10-10): meal_plan_entries 800, meal_plan_template_entries 95, none of these tables exist.
--
-- ON DELETE CASCADE is load-bearing: MealPlanEntryRepository.deleteByUserIdAndDateRange and
-- MealPlanTemplateEntryRepository.deleteByTemplateId are JPQL bulk deletes that bypass JPA
-- cascades, so choices must be removed by MySQL when their entry goes.
--
-- MUST be applied to the Railway MySQL BEFORE the backend that maps these tables is deployed
-- (spring.jpa.hibernate.ddl-auto = validate fails startup otherwise).

CREATE TABLE IF NOT EXISTS meal_plan_entry_extra_choices (
  id                 BIGINT     NOT NULL AUTO_INCREMENT,
  meal_plan_entry_id BIGINT     NOT NULL,
  extra_recipe_id    BIGINT     NOT NULL,
  is_homemade        TINYINT(1) NOT NULL,
  updated_at         TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_mpe_extra_choice (meal_plan_entry_id, extra_recipe_id),
  KEY idx_mpe_extra_choice_extra (extra_recipe_id),
  CONSTRAINT fk_mpe_extra_choice_entry FOREIGN KEY (meal_plan_entry_id)
    REFERENCES meal_plan_entries (id) ON DELETE CASCADE,
  CONSTRAINT fk_mpe_extra_choice_recipe FOREIGN KEY (extra_recipe_id)
    REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS meal_plan_template_entry_extra_choices (
  id                BIGINT     NOT NULL AUTO_INCREMENT,
  template_entry_id BIGINT     NOT NULL,
  extra_recipe_id   BIGINT     NOT NULL,
  is_homemade       TINYINT(1) NOT NULL,
  updated_at        TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_mpte_extra_choice (template_entry_id, extra_recipe_id),
  KEY idx_mpte_extra_choice_extra (extra_recipe_id),
  CONSTRAINT fk_mpte_extra_choice_entry FOREIGN KEY (template_entry_id)
    REFERENCES meal_plan_template_entries (id) ON DELETE CASCADE,
  CONSTRAINT fk_mpte_extra_choice_recipe FOREIGN KEY (extra_recipe_id)
    REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_extra_defaults (
  id              BIGINT     NOT NULL AUTO_INCREMENT,
  user_id         BIGINT     NOT NULL,
  recipe_id       BIGINT     NOT NULL,
  extra_recipe_id BIGINT     NOT NULL,
  is_homemade     TINYINT(1) NOT NULL,
  updated_at      TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_extra_default (user_id, recipe_id, extra_recipe_id),
  CONSTRAINT fk_user_extra_default_user   FOREIGN KEY (user_id)         REFERENCES users (id)   ON DELETE CASCADE,
  CONSTRAINT fk_user_extra_default_recipe FOREIGN KEY (recipe_id)       REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_extra_default_extra  FOREIGN KEY (extra_recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

- [x] **Step 2: Confirm the file exists**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-10-10-mpp10-extra-choices-schema.sql`
Expected: one file listed.

### Task 2: Write the missing recipe_extras links data migration ✓

- Skill: chef

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-10-mpp10-recipe-extras-missing-links.sql`

- [x] **Step 1: Re-run the gap query to confirm the list is still 32 rows and unchanged** (run by orchestrator — 32 pairs, matches plan)

Run (mcp__mysql__mysql_query, read-only):
```sql
SELECT ri.recipe_id, ri.linked_recipe_id FROM recipe_ingredients ri
WHERE ri.linked_recipe_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM recipe_extras re
                  WHERE re.parent_recipe_id = ri.recipe_id AND re.child_recipe_id = ri.linked_recipe_id)
ORDER BY ri.recipe_id, ri.linked_recipe_id;
```
Expected: exactly the 32 pairs in the table in `plan.md` → Data shapes. If it differs, stop and report — do not edit the list unilaterally.

- [x] **Step 2: Write the migration file**

```sql
-- MPP-10: add the 32 linked sub-recipes that are missing from recipe_extras.
--
-- recipe_extras drives the homemade/store-bought popup and the shopping list's extras walk;
-- ShoppingListService.processRecipeIngredients skips linked rows, so a link with no
-- recipe_extras row is silently dropped from the shopping list in BOTH modes.
-- Reviewed list (2026-10-10, live gap query): 71 extras rows vs 103 distinct links → 32 missing.
-- No recipe ingredients, steps or yields change. All 32 links already have a linked prep step
-- (linked-recipe-extras.md check 5 returned 0).
--
-- Idempotent: NOT EXISTS guard + unique_parent_child (parent_recipe_id, child_recipe_id).
-- Data-only: may be applied before or after the backend deploy.

INSERT INTO recipe_extras (parent_recipe_id, child_recipe_id, display_order)
SELECT v.p, v.c, v.o
FROM (
            SELECT  37 AS p,  12 AS c, 1 AS o   -- Pink Sauce Pasta (L)  → Pizza Sauce
  UNION ALL SELECT  38,  12, 1                  -- Pink Sauce Pasta (M)  → Pizza Sauce
  UNION ALL SELECT  39,  12, 1                  -- Pink Sauce Pasta (B)  → Pizza Sauce
  UNION ALL SELECT 189,  36, 0                  -- Med. White Bean & Chicken Soup → Fresh Pasta
  UNION ALL SELECT 196,  36, 0
  UNION ALL SELECT 197,  36, 0
  UNION ALL SELECT 205,  26, 0                  -- Crispy Chicken Dippers → Milk Bread
  UNION ALL SELECT 206,  26, 0
  UNION ALL SELECT 207,  26, 0
  UNION ALL SELECT 208,  12, 0                  -- Paella Valenciana → Pizza Sauce
  UNION ALL SELECT 209,  12, 0
  UNION ALL SELECT 210,  36, 0                  -- Chicken Carbonara → Fresh Pasta
  UNION ALL SELECT 211,  36, 0
  UNION ALL SELECT 212,  36, 0
  UNION ALL SELECT 220, 213, 0                  -- Greek Yogurt & Granola Bowl → Goodness Granola
  UNION ALL SELECT 221, 213, 0
  UNION ALL SELECT 222, 213, 0
  UNION ALL SELECT 223,  26, 0                  -- Poached Eggs, Smoked Salmon & Avocado on Toast → Milk Bread
  UNION ALL SELECT 224,  26, 0
  UNION ALL SELECT 225,  26, 0
  UNION ALL SELECT 226,  26, 0                  -- Soft-Boiled Eggs, Cottage Cheese & Toast → Milk Bread
  UNION ALL SELECT 227,  26, 0
  UNION ALL SELECT 228,  26, 0
  UNION ALL SELECT 229,  26, 0                  -- Fried Eggs with Halloumi & Toast → Milk Bread
  UNION ALL SELECT 230,  26, 0
  UNION ALL SELECT 231,  26, 0
  UNION ALL SELECT 232,  26, 0                  -- Cheese & Ham Omelette with Toast → Milk Bread
  UNION ALL SELECT 232,  64, 1                  --                                → Honey Ham
  UNION ALL SELECT 233,  26, 0
  UNION ALL SELECT 233,  64, 1
  UNION ALL SELECT 234,  26, 0
  UNION ALL SELECT 234,  64, 1
) v
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_extras re
  WHERE re.parent_recipe_id = v.p AND re.child_recipe_id = v.c
);
```

- [x] **Step 3: Confirm the file has 32 value rows**

Run: `(Select-String -Path foodbytes-app\database\migrations\2026-10-10-mpp10-recipe-extras-missing-links.sql -Pattern "SELECT +\d+ *(AS p)?, +\d+").Count`
Expected: `32`.

### Task 3: Developer applies both migrations to the Railway MySQL ✓ (applied by the developer; verified 2026-10-10: 3 tables, 103 recipe_extras rows, 0 missing links)

- Skill: none — DBA operation against the live Railway MySQL (developer-owned; never applied by an agent)

**Files:**
- (none — runs the two files from Tasks 1–2 against Railway)

- [x] **Step 1: Ask the developer to apply the schema migration, then the data migration, and wait for confirmation**

The developer runs `2026-10-10-mpp10-extra-choices-schema.sql` then `2026-10-10-mpp10-recipe-extras-missing-links.sql` against Railway. Do not proceed to Phase 2 until they confirm.

- [x] **Step 2: Verify the tables exist**

Run (mcp__mysql__mysql_query, read-only):
```sql
SELECT TABLE_NAME FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('meal_plan_entry_extra_choices','meal_plan_template_entry_extra_choices','user_extra_defaults');
```
Expected: 3 rows.

- [x] **Step 3: Verify AC 16**

Run (mcp__mysql__mysql_query, read-only):
```sql
SELECT COUNT(*) FROM recipe_ingredients ri
WHERE ri.linked_recipe_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM recipe_extras re
                  WHERE re.parent_recipe_id = ri.recipe_id AND re.child_recipe_id = ri.linked_recipe_id);
```
Expected: `0`. Also `SELECT COUNT(*) FROM recipe_extras` → `103`.

---

## Phase 2 — Backend persistence layer

Entities and repositories for the three tables. Nothing calls them yet, so behaviour is unchanged; the phase ends with a clean compile.

### Task 4: Add the three choice entities ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanEntryExtraChoice.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanTemplateEntryExtraChoice.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/UserExtraDefault.java`

- [x] **Step 1: Write `MealPlanEntryExtraChoice`**

```java
package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * MPP-10: homemade/store-bought choice for one extra of one planned meal.
 * Absence of a row means homemade. Plain id columns (no associations): rows are always read in
 * bulk by entry id, and MySQL cascades them away with their meal_plan_entries row.
 */
@Entity
@Table(name = "meal_plan_entry_extra_choices", uniqueConstraints = {
    @UniqueConstraint(name = "uk_mpe_extra_choice", columnNames = {"meal_plan_entry_id", "extra_recipe_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanEntryExtraChoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meal_plan_entry_id", nullable = false)
    private Long mealPlanEntryId;

    @Column(name = "extra_recipe_id", nullable = false)
    private Long extraRecipeId;

    @Column(name = "is_homemade", nullable = false)
    private Boolean homemade;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MealPlanEntryExtraChoice other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return MealPlanEntryExtraChoice.class.hashCode();
    }
}
```

- [x] **Step 2: Write `MealPlanTemplateEntryExtraChoice`** — identical shape, table `meal_plan_template_entry_extra_choices`, unique constraint `uk_mpte_extra_choice` on `template_entry_id, extra_recipe_id`, field `@Column(name = "template_entry_id", nullable = false) private Long templateEntryId;` in place of `mealPlanEntryId`, Javadoc "choice for one extra of one template entry".

- [x] **Step 3: Write `UserExtraDefault`** — same shape, table `user_extra_defaults`, unique constraint `uk_user_extra_default` on `user_id, recipe_id, extra_recipe_id`, fields `@Column(name = "user_id", nullable = false) Long userId`, `@Column(name = "recipe_id", nullable = false) Long recipeId`, `extraRecipeId`, `homemade`, `updatedAt`; Javadoc "per-owner default that pre-fills the add-to-day popup; written for every member of the recipe's family".

- [x] **Step 4: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, no errors.

### Task 5: Add the repositories and the from-date entry finder ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanEntryExtraChoiceRepository.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanTemplateEntryExtraChoiceRepository.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/UserExtraDefaultRepository.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanEntryRepository.java`

- [x] **Step 1: Write the three repositories**

```java
package com.foodbytes.repository;

import com.foodbytes.model.MealPlanEntryExtraChoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;

@Repository
public interface MealPlanEntryExtraChoiceRepository extends JpaRepository<MealPlanEntryExtraChoice, Long> {

    List<MealPlanEntryExtraChoice> findByMealPlanEntryIdIn(Collection<Long> mealPlanEntryIds);

    /** MPP-10: true when any planned meal of this owner has a stored choice (legacy-import guard). */
    @Query("SELECT COUNT(c) > 0 FROM MealPlanEntryExtraChoice c, MealPlanEntry e " +
           "WHERE e.id = c.mealPlanEntryId AND e.user.id = :ownerId")
    boolean existsForOwner(@Param("ownerId") Long ownerId);
}
```

```java
@Repository
public interface MealPlanTemplateEntryExtraChoiceRepository
        extends JpaRepository<MealPlanTemplateEntryExtraChoice, Long> {
    List<MealPlanTemplateEntryExtraChoice> findByTemplateEntryIdIn(Collection<Long> templateEntryIds);
}
```

```java
@Repository
public interface UserExtraDefaultRepository extends JpaRepository<UserExtraDefault, Long> {
    List<UserExtraDefault> findByUserId(Long userId);
    List<UserExtraDefault> findByUserIdAndRecipeIdIn(Long userId, Collection<Long> recipeIds);
    boolean existsByUserId(Long userId);
}
```

- [x] **Step 2: Add the from-date finder to `MealPlanEntryRepository`**

```java
    /**
     * MPP-10: every entry of an owner dated on or after fromDate — used by the one-time
     * localStorage import to fill the current and future weeks.
     */
    @Query("SELECT mpe FROM MealPlanEntry mpe WHERE mpe.user.id = :userId AND mpe.planDate >= :fromDate")
    List<MealPlanEntry> findByUserIdFromDate(@Param("userId") Long userId, @Param("fromDate") LocalDate fromDate);
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

---

## Phase 3 — Backend services, endpoints and tests

Extracts the portion maths, adds the choice and view services, rewires the shopping list, meal-plan and template services, and exposes the endpoints. Each task compiles and runs its own tests; the phase ends with every backend test class touched here green.

### Task 6: Extract `ExtraPortionResolver` from `ShoppingListService` ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ExtraPortionResolver.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java:36-41,394,609,636-689`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java`

- [x] **Step 1: Create the resolver by moving the two helpers verbatim and adding `usedGrams`**

```java
package com.foodbytes.service;

import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeIngredient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * MPP-1 / MPP-10: how much of a linked-recipe extra a parent uses, shared by the shopping list
 * (ShoppingListService) and the Manage extras popup (ManageExtrasService) so the two can never
 * disagree. Moved verbatim from ShoppingListService; mirrors
 * MacroCalculationService#calculateLinkedRecipeMacros.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ExtraPortionResolver {

    private final MacroCalculationService macroCalculationService;

    // <- paste resolveExtraPortionRatio(...) and findLinkedQuantityGrams(...) from
    //    ShoppingListService lines 636-689 here, unchanged except `private` → `public`,
    //    with their full javadoc.

    /**
     * MPP-10: grams of childRecipeId consumed at the current scale — the parent's own
     * recipe_ingredients.quantity_grams for that link × parentRatio. This is the figure a
     * store-bought product is listed in, and the "· N g" shown in the Manage extras popup.
     *
     * @return null when parentRecipe has no linked_recipe_id row for childRecipeId
     */
    public BigDecimal usedGrams(Recipe parentRecipe, Long childRecipeId, BigDecimal parentRatio) {
        BigDecimal linkQuantityGrams = findLinkedQuantityGrams(parentRecipe, childRecipeId);
        return linkQuantityGrams == null ? null : linkQuantityGrams.multiply(parentRatio);
    }
}
```

- [x] **Step 2: Rewire `ShoppingListService`**

Delete `resolveExtraPortionRatio` and `findLinkedQuantityGrams` from `ShoppingListService`. Replace the field `private final MacroCalculationService macroCalculationService; // MPP-1 ...` with `private final ExtraPortionResolver extraPortionResolver; // MPP-1/MPP-10: shared link-grams maths`. Replace both call sites (`resolveExtraPortionRatio(parentRecipe, ...)` in `collectUsagesFromExtras` and `processExtras`) with `extraPortionResolver.resolveExtraPortionRatio(...)`.

- [x] **Step 3: Build the service manually in the test so the resolver is real**

In `ShoppingListServiceTest`, remove `@InjectMocks` from `shoppingListService` and add (keeping the existing `@Mock MacroCalculationService macroCalculationService`):

```java
    private ShoppingListService shoppingListService;

    @BeforeEach
    void buildService() {
        // ExtraPortionResolver is a real object over the mocked MacroCalculationService, so the
        // existing calculateRecipeTotalYield stubs keep driving the proration maths.
        shoppingListService = new ShoppingListService(
            mealPlanEntryRepository, recipeRepository, recipeExtrasService,
            ingredientRepository, userRepository, new ExtraPortionResolver(macroCalculationService));
    }
```
(Merge into an existing `@BeforeEach` if the class has one. Constructor argument order must equal the `ShoppingListService` field declaration order.)

- [x] **Step 4: Run the existing shopping-list tests — pure refactor, all must stay green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListServiceTest`
Expected: `BUILD SUCCESS`, same test count as before, 0 failures.

### Task 7: Add `ExtraChoiceService` with tests ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ExtraChoiceService.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/ExtraChoiceItemDTO.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ExtraChoiceServiceTest.java`

- [x] **Step 1: Add `ExtraChoiceItemDTO`**

```java
package com.foodbytes.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-10: one homemade/store-bought choice. targetId = meal_plan_entries.id (week) or meal_plan_template_entries.id (template). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtraChoiceItemDTO {
    @NotNull private Long targetId;
    @NotNull private Long extraRecipeId;
    @NotNull private Boolean homemade;
}
```

- [x] **Step 2: Write the failing tests**

`ExtraChoiceServiceTest` (`@ExtendWith(MockitoExtension.class)`, `@InjectMocks ExtraChoiceService`, `@Mock` for every repository/service the class takes in Step 3). Fixtures: owner user id `1`; linked user id `2` with `mealPlanOwnerId = 1`; stranger owner id `3`; recipe 82 (family 9, siblings 81/83) whose extras tree is `[36]` (stub `recipeExtrasService.buildExtrasTree(82L, any())` → one `RecipeExtraNodeDTO` with `recipeId 36`, and `flattenExtrasToIds` → `List.of(36L)`). Tests:

```java
@Test void updateWeekChoices_linkedUser_writesAgainstOwnersEntry()         // AC 2: user 2 edits entry 500 owned by 1 → saveAll on entry choices with mealPlanEntryId 500, homemade false
@Test void updateWeekChoices_entryOfAnotherOwner_throwsNotFound()          // entry 501 owned by 3 → ChoiceTargetNotFoundException, nothing saved
@Test void updateWeekChoices_extraNotInTree_throwsIllegalArgument()        // extra 999 on recipe 82 → IllegalArgumentException
@Test void updateWeekChoices_updatesDefaultsForWholeFamily()               // AC 4: defaults saved for recipe ids {81, 82, 83}, extra 36, homemade false, userId 1
@Test void updateWeekChoices_existingRow_isUpdatedNotDuplicated()          // findByMealPlanEntryIdIn returns row id 7 homemade true → saved row has id 7, homemade false
@Test void updateTemplateChoices_neverTouchesDefaults()                    // AC 4 + week vs template scope: verifyNoInteractions(userExtraDefaultRepository)
@Test void updateTemplateChoices_entryNotInTemplate_throwsNotFound()
@Test void getEntryChoices_groupsByEntry()                                 // two rows for entry 500, one for 501 → {500:{36:false,12:true}, 501:{36:true}}
@Test void importLegacySelections_skipsWhenOwnerAlreadyHasChoices()        // existsByUserId true → returns false, nothing saved
@Test void importLegacySelections_writesDefaultsAndFillsCurrentAndFutureEntries() // entries from findByUserIdFromDate(1, Monday of LocalDate.now()) with recipe 82 get {36:false}; entry with recipe 50 untouched
@Test void retainTreeExtras_dropsIdsOutsideTree()                          // {36:false, 999:true} → {36:false}
```

- [x] **Step 3: Run the tests to see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ExtraChoiceServiceTest`
Expected: compilation failure / FAIL (class does not exist yet).

- [x] **Step 4: Implement `ExtraChoiceService`**

```java
package com.foodbytes.service;

import com.foodbytes.dto.ExtraChoiceItemDTO;
import com.foodbytes.model.*;
import com.foodbytes.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

/**
 * MPP-10: owns every rule about homemade/store-bought choices for recipe extras.
 *
 * <ul>
 *   <li>Choices live per planned meal, per template entry, and as a per-dish default.</li>
 *   <li>Everything resolves through the effective meal-plan owner, so linked accounts share rows.</li>
 *   <li>No stored choice = homemade.</li>
 *   <li>Week edits and the add-to-day popup update the default; template edits never do.</li>
 *   <li>Defaults are written for the whole recipe family (a "dish" = its Light/Moderate/Balanced set).</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExtraChoiceService {

    public static class ChoiceTargetNotFoundException extends RuntimeException {
        public ChoiceTargetNotFoundException(String message) { super(message); }
    }

    private final MealPlanEntryExtraChoiceRepository entryChoiceRepository;
    private final MealPlanTemplateEntryExtraChoiceRepository templateChoiceRepository;
    private final UserExtraDefaultRepository defaultRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealPlanTemplateRepository templateRepository;
    private final MealPlanTemplateEntryRepository templateEntryRepository;
    private final RecipeFamilyMemberRepository familyMemberRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeExtrasService recipeExtrasService;
    private final UserRepository userRepository;

    /** Same rule as MealPlanService#effectiveOwnerId. */
    public Long resolveOwnerId(Long userId) {
        return userRepository.findById(userId)
            .map(user -> user.getMealPlanOwnerId() != null ? user.getMealPlanOwnerId() : userId)
            .orElse(userId);
    }

    @Transactional(readOnly = true)
    public Map<Long, Map<Long, Boolean>> getEntryChoices(Collection<Long> entryIds) {
        Map<Long, Map<Long, Boolean>> out = new HashMap<>();
        if (entryIds == null || entryIds.isEmpty()) return out;
        for (MealPlanEntryExtraChoice c : entryChoiceRepository.findByMealPlanEntryIdIn(entryIds)) {
            out.computeIfAbsent(c.getMealPlanEntryId(), k -> new HashMap<>()).put(c.getExtraRecipeId(), c.getHomemade());
        }
        return out;
    }

    @Transactional(readOnly = true)
    public Map<Long, Map<Long, Boolean>> getTemplateEntryChoices(Collection<Long> templateEntryIds) {
        // same shape as getEntryChoices over templateChoiceRepository.findByTemplateEntryIdIn
    }

    /** Upsert on (entry, extra). Null keys/values are ignored. */
    @Transactional
    public void setEntryChoices(Long entryId, Map<Long, Boolean> choices) {
        if (choices == null || choices.isEmpty()) return;
        Map<Long, MealPlanEntryExtraChoice> existing = entryChoiceRepository
            .findByMealPlanEntryIdIn(List.of(entryId)).stream()
            .collect(Collectors.toMap(MealPlanEntryExtraChoice::getExtraRecipeId, c -> c));
        List<MealPlanEntryExtraChoice> toSave = new ArrayList<>();
        choices.forEach((extraId, homemade) -> {
            if (extraId == null || homemade == null) return;
            MealPlanEntryExtraChoice row = existing.get(extraId);
            if (row == null) {
                row = new MealPlanEntryExtraChoice();
                row.setMealPlanEntryId(entryId);
                row.setExtraRecipeId(extraId);
            }
            row.setHomemade(homemade);
            toSave.add(row);
        });
        entryChoiceRepository.saveAll(toSave);
    }

    // private void setTemplateEntryChoices(Long templateEntryId, Map<Long, Boolean> choices) — same upsert over templateChoiceRepository

    /** Writes the default for recipeId AND every member of its recipe family. */
    @Transactional
    public void updateDefaults(Long ownerId, Long recipeId, Map<Long, Boolean> choices) {
        if (choices == null || choices.isEmpty()) return;
        Set<Long> recipeIds = new LinkedHashSet<>();
        recipeIds.add(recipeId);
        familyMemberRepository.findVariantsForRecipe(recipeId)
            .forEach(m -> recipeIds.add(m.getRecipe().getId()));
        Map<String, UserExtraDefault> existing = defaultRepository
            .findByUserIdAndRecipeIdIn(ownerId, recipeIds).stream()
            .collect(Collectors.toMap(d -> d.getRecipeId() + ":" + d.getExtraRecipeId(), d -> d));
        List<UserExtraDefault> toSave = new ArrayList<>();
        for (Long rid : recipeIds) {
            choices.forEach((extraId, homemade) -> {
                if (extraId == null || homemade == null) return;
                UserExtraDefault row = existing.get(rid + ":" + extraId);
                if (row == null) {
                    row = new UserExtraDefault();
                    row.setUserId(ownerId);
                    row.setRecipeId(rid);
                    row.setExtraRecipeId(extraId);
                }
                row.setHomemade(homemade);
                toSave.add(row);
            });
        }
        defaultRepository.saveAll(toSave);
    }

    @Transactional(readOnly = true)
    public Map<Long, Map<Long, Boolean>> getDefaults(Long userId) {
        Long ownerId = resolveOwnerId(userId);
        Map<Long, Map<Long, Boolean>> out = new HashMap<>();
        for (UserExtraDefault d : defaultRepository.findByUserId(ownerId)) {
            out.computeIfAbsent(d.getRecipeId(), k -> new HashMap<>()).put(d.getExtraRecipeId(), d.getHomemade());
        }
        return out;
    }

    /** Targets are freshly created entries, so rows are inserted without an upsert lookup. */
    @Transactional
    public void copyEntryChoices(Map<Long, Long> sourceEntryIdToTargetEntryId) {
        if (sourceEntryIdToTargetEntryId.isEmpty()) return;
        List<MealPlanEntryExtraChoice> copies = new ArrayList<>();
        for (MealPlanEntryExtraChoice src : entryChoiceRepository.findByMealPlanEntryIdIn(sourceEntryIdToTargetEntryId.keySet())) {
            MealPlanEntryExtraChoice c = new MealPlanEntryExtraChoice();
            c.setMealPlanEntryId(sourceEntryIdToTargetEntryId.get(src.getMealPlanEntryId()));
            c.setExtraRecipeId(src.getExtraRecipeId());
            c.setHomemade(src.getHomemade());
            copies.add(c);
        }
        entryChoiceRepository.saveAll(copies);
    }

    // public void copyEntryChoicesToTemplate(Map<Long, Long> entryIdToTemplateEntryId)     — read entry rows, insert template rows
    // public void copyTemplateChoicesToEntries(Map<Long, Long> templateEntryIdToEntryId)   — read template rows, insert entry rows

    /** Week scope: validates ownership + tree, upserts, then updates each dish's default. */
    @Transactional
    public void updateWeekChoices(Long userId, List<ExtraChoiceItemDTO> choices) {
        if (choices == null || choices.isEmpty()) throw new IllegalArgumentException("No choices supplied");
        Long ownerId = resolveOwnerId(userId);
        Set<Long> entryIds = choices.stream().map(ExtraChoiceItemDTO::getTargetId).collect(Collectors.toSet());
        Map<Long, MealPlanEntry> entries = mealPlanEntryRepository.findAllById(entryIds).stream()
            .collect(Collectors.toMap(MealPlanEntry::getId, e -> e));
        Map<Long, Set<Long>> treeCache = new HashMap<>();
        Map<Long, Map<Long, Boolean>> byEntry = new LinkedHashMap<>();
        for (ExtraChoiceItemDTO item : choices) {
            MealPlanEntry entry = entries.get(item.getTargetId());
            if (entry == null || !entry.getUser().getId().equals(ownerId)) {
                throw new ChoiceTargetNotFoundException("Meal plan entry not found: " + item.getTargetId());
            }
            requireInTree(entry.getRecipe().getId(), item.getExtraRecipeId(), treeCache);
            byEntry.computeIfAbsent(entry.getId(), k -> new LinkedHashMap<>()).put(item.getExtraRecipeId(), item.getHomemade());
        }
        byEntry.forEach((entryId, map) -> {
            setEntryChoices(entryId, map);
            updateDefaults(ownerId, entries.get(entryId).getRecipe().getId(), map);
        });
    }

    /** Template scope: validates template ownership + membership + tree. Never touches defaults. */
    @Transactional
    public void updateTemplateChoices(Long userId, Long templateId, List<ExtraChoiceItemDTO> choices) {
        if (choices == null || choices.isEmpty()) throw new IllegalArgumentException("No choices supplied");
        Long ownerId = resolveOwnerId(userId);
        templateRepository.findByIdAndUserId(templateId, ownerId)
            .orElseThrow(() -> new ChoiceTargetNotFoundException("Template not found: " + templateId));
        Map<Long, MealPlanTemplateEntry> entries = templateEntryRepository.findByTemplateId(templateId).stream()
            .collect(Collectors.toMap(MealPlanTemplateEntry::getId, e -> e));
        // same loop as updateWeekChoices against `entries` (missing → ChoiceTargetNotFoundException),
        // then setTemplateEntryChoices per template entry. NO updateDefaults call.
    }

    /** One-time upload of a browser's localStorage selections. Returns false when skipped. */
    @Transactional
    public boolean importLegacySelections(Long userId, Map<Long, Map<Long, Boolean>> selections) {
        Long ownerId = resolveOwnerId(userId);
        if (selections == null || selections.isEmpty()
                || defaultRepository.existsByUserId(ownerId)
                || entryChoiceRepository.existsForOwner(ownerId)) {
            return false;
        }
        Set<Long> liveRecipeIds = recipeRepository.findAllById(selections.keySet()).stream()
            .map(Recipe::getId).collect(Collectors.toSet());
        Map<Long, Map<Long, Boolean>> clean = new HashMap<>();
        selections.forEach((recipeId, map) -> {
            if (recipeId == null || !liveRecipeIds.contains(recipeId)) return;
            Map<Long, Boolean> kept = retainTreeExtras(recipeId, map);
            if (!kept.isEmpty()) clean.put(recipeId, kept);
        });
        if (clean.isEmpty()) return false;
        clean.forEach((recipeId, map) -> updateDefaults(ownerId, recipeId, map));
        LocalDate monday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        for (MealPlanEntry entry : mealPlanEntryRepository.findByUserIdFromDate(ownerId, monday)) {
            Map<Long, Boolean> map = clean.get(entry.getRecipe().getId());
            if (map != null) setEntryChoices(entry.getId(), map);
        }
        return true;
    }

    /** Drops extra ids that are not in recipeId's extras tree (unknown ids would also break the FK). */
    @Transactional(readOnly = true)
    public Map<Long, Boolean> retainTreeExtras(Long recipeId, Map<Long, Boolean> choices) {
        if (choices == null || choices.isEmpty()) return Map.of();
        Set<Long> tree = treeIds(recipeId, new HashMap<>());
        Map<Long, Boolean> kept = new LinkedHashMap<>();
        choices.forEach((extraId, homemade) -> {
            if (extraId != null && homemade != null && tree.contains(extraId)) kept.put(extraId, homemade);
        });
        return kept;
    }

    private void requireInTree(Long recipeId, Long extraRecipeId, Map<Long, Set<Long>> cache) {
        if (!treeIds(recipeId, cache).contains(extraRecipeId)) {
            throw new IllegalArgumentException("Recipe " + extraRecipeId + " is not an extra of recipe " + recipeId);
        }
    }

    private Set<Long> treeIds(Long recipeId, Map<Long, Set<Long>> cache) {
        return cache.computeIfAbsent(recipeId, id -> new HashSet<>(
            recipeExtrasService.flattenExtrasToIds(recipeExtrasService.buildExtrasTree(id, new HashSet<>()))));
    }
}
```
Fill the three commented methods exactly as their one-line descriptions say, mirroring the shown sibling method. If `RecipeFamilyMember#getRecipe()` is not the accessor name, use the one on the entity — read `model/RecipeFamilyMember.java`.

- [x] **Step 5: Run the tests to see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ExtraChoiceServiceTest`
Expected: `BUILD SUCCESS`, 11 tests, 0 failures.

### Task 8: `ShoppingListService` reads stored choices and lists store-bought products in grams ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingListService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java`

- [x] **Step 1: Write the failing tests (replace the three MPP-8 selection tests at lines ~417-547)**

Add `@Mock ExtraChoiceService extraChoiceService;` and `@Mock UnitRepository unitRepository;`, extend the `@BeforeEach` constructor call with `extraChoiceService, unitRepository` (field order from Step 3), and stub `unitRepository.findByKey("g")` → `Optional.of(gramUnit)` where `gramUnit` is `Unit` id `1L`, key/value `"g"`. Give every `MealPlanEntry` fixture an id. Fixture: Bolognese 82 (default servings 2) with link row → Fresh Pasta 36, `quantityGrams 200`, store-bought ingredient Spaghetti (dried) 126; Pink Sauce Pasta 38 → Pizza Sauce 12, `quantityGrams 180`, product Tomato passata 136. Tests (one per AC/example):

```java
@Test void storeBought_withProduct_listsLinkGramsAtDefaultServings()     // ex.1 / AC 13: Spaghetti (dried) 200.00 "g", no flour/egg
@Test void storeBought_twoMeals_sumsGrams()                              // ex.2: Mon + Thu → 400.00 g, one row
@Test void storeBought_scalesWithServings()                              // ex.3: servings 4 → 400.00 g
@Test void perEntryDivergence_sameDish()                                 // ex.4 / AC 3: Mon {36:false}, Thu none → 200 g spaghetti + Thursday's flour/egg only
@Test void storeBought_mergesWithSameIngredientUsedRawInGrams()          // AC 13: another recipe uses 126 at 100 g unit 1 → one row 300.00 g
@Test void storeBought_pizzaSauce_listsPassata()                         // ex.6: 38 + {12:false} → Tomato passata 180.00 g
@Test void storeBought_withoutProduct_keepsGenericRow()                  // AC 14: "Store Bought Fresh Pasta" in Store Bought Items aisle
@Test void noStoredChoice_equalsHomemadeOutput()                         // AC 15: getEntryChoices → {} gives today's homemade rows
@Test void choicesAreLoadedOncePerGeneration()                           // AC 1/19: verify(extraChoiceService, times(1)).getEntryChoices(anyCollection())
@Test void breakdown_storeBoughtExtra_reportsGramsAndSkipsSubtree()      // AC 18: breakdown(126,"g") total 200.00 with via "Fresh Pasta (store-bought)"; breakdown(flour) excludes the Mon meal
```
Adapt the existing MPP-8 tests' fixtures rather than duplicating builders.

- [x] **Step 2: Run to see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListServiceTest`
Expected: FAIL / compile error (`getShoppingList` still takes 3 args, constructor mismatch).

- [x] **Step 3: Implement**

Fields (in this order, so the test constructor matches):
```java
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeExtrasService recipeExtrasService;
    private final IngredientRepository ingredientRepository;
    private final UserRepository userRepository;
    private final ExtraPortionResolver extraPortionResolver; // MPP-1/MPP-10: shared link-grams maths
    private final ExtraChoiceService extraChoiceService;     // MPP-10: stored homemade/store-bought choices
    private final UnitRepository unitRepository;             // MPP-10: gram unit for store-bought rows

    private static final String GRAM_UNIT_KEY = "g";
```

`getShoppingList(Long userId, LocalDate startDate)` — remove the `HomemadeSelectionsDTO` parameter, its import, and the `selectionsMap` block. After the empty-entries return, add:
```java
        // MPP-10: one query for every entry's stored choices; no stored choice = homemade.
        Map<Long, Map<Long, Boolean>> choicesByEntry = extraChoiceService.getEntryChoices(
            entries.stream().map(MealPlanEntry::getId).toList());
        List<StoreBoughtGrams> storeBoughtGrams = new ArrayList<>();
```
In the loop replace the `recipeSelections` lookup with `Map<Long, Boolean> recipeSelections = choicesByEntry.get(entry.getId());` and pass `storeBoughtGrams` into `processExtras` (new parameter after `storeBoughtItems`, threaded through the recursive call). Before the existing `if (!storeBoughtItems.isEmpty())` block add:
```java
        // MPP-10: store-bought products in grams, merged with the same ingredient used raw in g.
        if (!storeBoughtGrams.isEmpty()) {
            Unit gramUnit = unitRepository.findByKey(GRAM_UNIT_KEY)
                .orElseThrow(() -> new IllegalStateException("Unit '" + GRAM_UNIT_KEY + "' is missing"));
            for (StoreBoughtGrams sb : storeBoughtGrams) {
                addStoreBoughtIngredient(sb, gramUnit, aggregatedIngredients, storeBoughtItems);
            }
        }
```
In `processExtras`' store-bought branch replace the body with:
```java
                // FR-103 / MPP-10: store-bought — list the product in grams actually used
                Long storeBoughtIngredientId = extra.getStoreBoughtIngredientId();
                BigDecimal usedGrams = storeBoughtIngredientId != null
                    ? extraPortionResolver.usedGrams(parentRecipe, extraRecipeId, parentRatio)
                    : null;
                if (usedGrams != null) {
                    storeBoughtGrams.add(new StoreBoughtGrams(storeBoughtIngredientId, usedGrams,
                        currentSourceChain, extraRecipeId, extra.getRecipeName()));
                } else {
                    storeBoughtItems.add(new StoreBoughtItem(extraRecipeId, extra.getRecipeName()));
                }
                // Don't process children - they're covered by the store-bought parent
```
Add the record and replace `addStoreBoughtIngredient`:
```java
    /** MPP-10: a store-bought product and the grams of it one meal needs. */
    private record StoreBoughtGrams(Long ingredientId, BigDecimal grams, List<Long> sourceChain,
                                    Long extraRecipeId, String extraRecipeName) {}

    /**
     * FR-103 / MPP-10: add a store-bought product in grams under its own aisle, keyed by
     * (ingredientId, gram unit id) so it merges with the same ingredient used raw in g elsewhere.
     * A missing ingredient row falls back to the generic "Store Bought X" item rather than
     * silently dropping the extra.
     */
    private void addStoreBoughtIngredient(StoreBoughtGrams sb, Unit gramUnit,
                                          Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients,
                                          List<StoreBoughtItem> storeBoughtItems) {
        Ingredient ingredient = ingredientRepository.findById(sb.ingredientId()).orElse(null);
        if (ingredient == null) {
            log.warn("Store-bought ingredient {} for extra {} not found; listing it generically.",
                     sb.ingredientId(), sb.extraRecipeId());
            storeBoughtItems.add(new StoreBoughtItem(sb.extraRecipeId(), sb.extraRecipeName()));
            return;
        }
        BigDecimal grams = sb.grams().setScale(2, RoundingMode.HALF_UP);
        IngredientUnitKey key = new IngredientUnitKey(ingredient.getId(), gramUnit.getId());
        aggregatedIngredients.compute(key, (k, existing) -> {
            if (existing != null) {
                existing.addQuantity(grams);
                return existing;
            }
            Aisle aisle = ingredient.getAisle();
            return new IngredientAggregate(ingredient.getId(), ingredient.getName(), grams, gramUnit.getValue(),
                aisle != null ? aisle.getId() : null,
                aisle != null ? aisle.getName() : "Other",
                aisle != null ? aisle.getDisplayOrder() : (short) 15,
                sb.sourceChain());
        });
    }
```

`getIngredientBreakdown`: after loading entries add the same `choicesByEntry` lookup and a request-scoped `Map<Long, String> ingredientNames = new HashMap<>()` (lazy product-name cache). Pass `choicesByEntry.get(entry.getId())` into `collectUsagesFromExtras` as a new `Map<Long, Boolean> selections` parameter (threaded through recursion) and, at the top of the per-extra loop, add:
```java
            Boolean choice = selections != null ? selections.get(extra.getRecipeId()) : null;
            if (Boolean.FALSE.equals(choice)) {
                // MPP-10 / AC 18: store-bought — the subtree is not cooked, so it contributes nothing;
                // the product itself counts when it is the ingredient being broken down, in grams.
                if (extra.getStoreBoughtIngredientId() != null
                        && extra.getStoreBoughtIngredientId().equals(ingredientId)
                        && GRAM_UNIT_KEY.equalsIgnoreCase(unit)) {
                    BigDecimal usedGrams = extraPortionResolver.usedGrams(parentRecipe, extra.getRecipeId(), parentRatio);
                    if (usedGrams != null) {
                        String name = ingredientNames.computeIfAbsent(ingredientId,
                            id -> ingredientRepository.findById(id).map(Ingredient::getName).orElse("Unknown Ingredient"));
                        usages.add(new IngredientUsage(name, usedGrams, extra.getRecipeName() + " (store-bought)", BigDecimal.ONE));
                    }
                }
                continue;
            }
```
(`ingredientNames` is a `Map<Long, String>` created once in `getIngredientBreakdown` and passed down.) Update both methods' javadoc: replace the "Known divergence when a component is toggled to store-bought" paragraph with one sentence saying the breakdown now reads the same stored choices as the list (MPP-10).

- [x] **Step 4: Run the tests to see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListServiceTest`
Expected: `BUILD SUCCESS`, 0 failures (pre-existing proration tests included).

### Task 9: Remove the MPP-8 selections plumbing from the generate path ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PersistedShoppingListService.java:88-103`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/ShoppingListController.java` (generate method)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/MealPlanController.java` (both shopping-list methods)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/GenerateShoppingListRequest.java`
- Delete: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/HomemadeSelectionsDTO.java`
- Delete: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/dto/GenerateShoppingListRequestTest.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/ShoppingListControllerTest.java`

- [x] **Step 1: Drop the parameter end to end**

- `PersistedShoppingListService.generateShoppingList(Long userId, LocalDate startDate, LocalDate endDate)` — remove the `homemadeSelections` param + javadoc line; call `shoppingListService.getShoppingList(effectiveOwnerId, startDate)`.
- `ShoppingListController.generateShoppingList` — delete the "Convert selections" block; call `persistedShoppingListService.generateShoppingList(userPrincipal.getId(), request.getStartDate(), request.getEndDate())`.
- `GenerateShoppingListRequest` — delete the `selections` field, its comment and the `java.util.Map` import. Add class javadoc line: "MPP-10: homemade/store-bought choices are read from the database; a `selections` property sent by an older client is ignored."
- `MealPlanController.getShoppingList` → `shoppingListService.getShoppingList(userPrincipal.getId(), startDate)`. `getShoppingListWithSelections` → remove the `@RequestBody HomemadeSelectionsDTO selections` parameter, call the same 2-arg method, and rewrite its javadoc to "FR-089 / MPP-10: POST kept for compatibility; choices come from the database." Remove the `HomemadeSelectionsDTO` import.
- Delete `HomemadeSelectionsDTO.java` and `GenerateShoppingListRequestTest.java`.

- [x] **Step 2: Replace the controller test**

Rewrite `ShoppingListControllerTest` to a single test: `generate_delegatesDatesToService_andIgnoresLegacySelections` — deserialises `{"startDate":"2026-10-12","endDate":"2026-10-14","selections":{"82":{"36":false}}}` with an `ObjectMapper` configured like Spring Boot (`.findAndRegisterModules().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)`), calls `controller.generateShoppingList(userPrincipal, request)` and `verify(persistedShoppingListService).generateShoppingList(7L, LocalDate.of(2026,10,12), LocalDate.of(2026,10,14))` with `userPrincipal.getId()` stubbed to `7L`.

- [x] **Step 3: Confirm no references remain and tests compile**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\**\*.java -Pattern "HomemadeSelectionsDTO|getSelections\(\)"`
Expected: zero hits.
Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListControllerTest`
Expected: `BUILD SUCCESS`, 1 test, 0 failures.

### Task 10: `MealPlanService` — choices on assign, variant swap, copy week, week plan DTO ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanCreateRequest.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanEntryDTO.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java`

- [x] **Step 1: Add the DTO fields**

`MealPlanCreateRequest`:
```java
    /**
     * MPP-10: optional homemade/store-bought choices from the add-to-day popup,
     * extraRecipeId → isHomemade. Null when the recipe has no extras or no popup was shown.
     */
    private Map<Long, Boolean> extraChoices;
```
`MealPlanEntryDTO`:
```java
    private Map<Long, Boolean> extraChoices = new HashMap<>(); // MPP-10: stored choices for this meal; empty = all homemade
```

- [x] **Step 2: Write the failing tests**

Add `@Mock ExtraChoiceService extraChoiceService;` and `@Mock RecipeFamilyMemberRepository recipeFamilyMemberRepository;` to `MealPlanServiceTest`. Tests:

```java
@Test void assignRecipe_withExtraChoices_storesEntryChoicesAndUpdatesDefaults()   // AC 4: retainTreeExtras(82,{36:false}) → {36:false}; verify setEntryChoices(newId,{36:false}) and updateDefaults(ownerId, 82, {36:false})
@Test void assignRecipe_sameFamilySwap_withoutChoices_carriesReplacedEntryChoices() // AC 5: slot holds entry 10 (recipe 81, family 9); assign 82 (family 9), no extraChoices → getEntryChoices([10]) read BEFORE delete; setEntryChoices(newId, {36:false}); updateDefaults never called
@Test void assignRecipe_differentFamilySwap_doesNotCarry()                         // family 9 vs 4 → setEntryChoices never called
@Test void assignRecipe_linkedUser_writesChoicesAgainstOwner()                     // AC 2: requesting user 2 (owner 1) → updateDefaults(1L, ...)
@Test void copyWeek_copiesChoicesSourceToTarget()                                  // AC 6: saveAll answer assigns ids 900/901 → copyEntryChoices({10L:900L, 11L:901L})
@Test void swapDays_movesEntriesInPlace_withoutRewritingChoices()                  // AC 6: verifyNoInteractions(extraChoiceService); entry ids unchanged
@Test void getWeekPlan_exposesStoredChoicesOnEntries()                             // AC 12 data: getEntryChoices → {10:{36:false}} → DTO.extraChoices == {36:false}; other entries {}
```
In tests that save entries, stub `mealPlanEntryRepository.save(any())` / `saveAll(anyList())` with an answer that sets ids.

- [x] **Step 3: Run to see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: FAIL.

- [x] **Step 4: Implement**

Add fields `private final ExtraChoiceService extraChoiceService;` and `private final RecipeFamilyMemberRepository recipeFamilyMemberRepository;`.

`assignRecipe` — replace the swap block and the tail:
```java
        // MPP-10: a same-family replacement is a variant switch — keep the meal's choices.
        // Read them BEFORE the delete: MySQL cascades choice rows away with their entry.
        Map<Long, Boolean> carriedChoices = Map.of();
        if (existingSlotEntry.isPresent()) {
            MealPlanEntry replaced = existingSlotEntry.get();
            if (isSameFamily(replaced.getRecipe().getId(), request.getRecipeId())) {
                carriedChoices = extraChoiceService.getEntryChoices(List.of(replaced.getId()))
                    .getOrDefault(replaced.getId(), Map.of());
            }
            mealPlanEntryRepository.delete(replaced);
        }
        ...
        entry = mealPlanEntryRepository.save(entry);

        Map<Long, Boolean> storedChoices = Map.of();
        Map<Long, Boolean> requested = extraChoiceService.retainTreeExtras(recipe.getId(), request.getExtraChoices());
        if (!requested.isEmpty()) {
            // Add-to-day popup: the choices win and become the dish's default (AC 4).
            extraChoiceService.setEntryChoices(entry.getId(), requested);
            extraChoiceService.updateDefaults(effectiveOwnerId, recipe.getId(), requested);
            storedChoices = requested;
        } else if (!carriedChoices.isEmpty()) {
            extraChoiceService.setEntryChoices(entry.getId(), carriedChoices);
            storedChoices = carriedChoices;
        }
        return convertToDTO(entry, storedChoices);
```
Add:
```java
    /** MPP-10: true when both recipes belong to the same recipe family (Light/Moderate/Balanced). */
    private boolean isSameFamily(Long recipeIdA, Long recipeIdB) {
        if (recipeIdA.equals(recipeIdB)) return true;
        Optional<RecipeFamilyMember> a = recipeFamilyMemberRepository.findByRecipeId(recipeIdA);
        Optional<RecipeFamilyMember> b = recipeFamilyMemberRepository.findByRecipeId(recipeIdB);
        return a.isPresent() && b.isPresent()
            && a.get().getFamily().getId().equals(b.get().getFamily().getId());
    }
```
`copyWeek` — build `newEntries` alongside a parallel `List<Long> sourceIds`; after `saveAll`, build `Map<Long, Long> sourceToCopy` by index and call `extraChoiceService.copyEntryChoices(sourceToCopy)`.

`swapDays` — no code change; add one javadoc line: "MPP-10: entries keep their ids, so their extra choices move with them."

`getWeekPlan` — after loading entries: `Map<Long, Map<Long, Boolean>> choicesByEntry = extraChoiceService.getEntryChoices(entries.stream().map(MealPlanEntry::getId).toList());` and pass it to `buildDayDTO(date, dayEntries, today, choicesByEntry)`, which maps with `e -> convertToDTO(e, choicesByEntry.getOrDefault(e.getId(), Map.of()))`.

`convertToDTO(MealPlanEntry entry, Map<Long, Boolean> extraChoices)` sets `dto.setExtraChoices(new HashMap<>(extraChoices))`; keep a one-arg overload `convertToDTO(entry)` → `convertToDTO(entry, Map.of())` for `getRecipeAssignments`.

- [x] **Step 5: Run the tests to see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: `BUILD SUCCESS`, 0 failures (pre-existing tests included).

### Task 11: `ManageExtrasService` — popup view model and template counts ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/ManageExtrasViewDTO.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/ManageExtrasMealDTO.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/ManageExtraDTO.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ManageExtrasService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ManageExtrasServiceTest.java`

- [x] **Step 1: Add the three DTOs** exactly as in `plan.md` → Data shapes → DTOs (`@Data @Builder @NoArgsConstructor @AllArgsConstructor`, `meals`/`extras` as `@Builder.Default` empty lists).

- [x] **Step 2: Write the failing tests**

`ManageExtrasServiceTest` with mocks for every collaborator; `ExtraPortionResolver` built real over a mocked `MacroCalculationService` (same pattern as Task 6). Tests:

```java
@Test void weekView_listsOnlyMealsWithExtras_inDateThenMealOrder()          // AC 10 grouping: dinner Mon (82), breakfast Tue (50, no extras), lunch Mon (38) → [Mon lunch 38, Mon dinner 82]
@Test void weekView_usedGramsScaleWithServings()                            // ex.8 shape: 82 at servings 4 (default 2) → Fresh Pasta usedGrams 400
@Test void weekView_reportsStoredChoiceAndProductName()                     // {36:false} → homemade false, storeBoughtIngredientName "Spaghetti (dried)"
@Test void weekView_noStoredChoice_isHomemade()                             // AC 15
@Test void weekView_hidesChildrenOfStoreBoughtExtra()                       // Pizza (13) → Pizza Sauce (12) → Pesto: {12:false} → Pesto row absent; {12:true} → Pesto at depth 1
@Test void templateView_otherOwnersTemplate_throwsNotFound()                // MealPlanTemplateService.TemplateNotFoundException
@Test void templateExtrasCounts_countsMealsWithExtrasAndStoreBought()       // AC 9: 3 entries (2 with extras), choices {e1:{36:false}, e2:{12:false,36:true}} → {extrasMealCount 2, storeBoughtCount 2}
```

- [x] **Step 3: Run to see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ManageExtrasServiceTest`
Expected: FAIL / compile error.

- [x] **Step 4: Implement**

```java
/**
 * MPP-10: builds the Manage extras popup for a week or a template, and the per-template counts
 * shown in Manage templates. Read-only; every write goes through ExtraChoiceService.
 */
@Service
@RequiredArgsConstructor
public class ManageExtrasService {

    private final ExtraChoiceService extraChoiceService;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealPlanTemplateRepository templateRepository;
    private final MealPlanTemplateEntryRepository templateEntryRepository;
    private final RecipeExtrasService recipeExtrasService;
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeFamilyMemberRepository familyMemberRepository;
    private final ExtraPortionResolver extraPortionResolver;

    @Transactional(readOnly = true)
    public ManageExtrasViewDTO getWeekView(Long userId, LocalDate startDate) {
        Long ownerId = extraChoiceService.resolveOwnerId(userId);
        List<MealPlanEntry> entries = new ArrayList<>(
            mealPlanEntryRepository.findByUserIdAndDateRange(ownerId, startDate, startDate.plusDays(7)));
        entries.sort(Comparator.comparing(MealPlanEntry::getPlanDate).thenComparing(e -> e.getMeal().getId()));
        Map<Long, Map<Long, Boolean>> choices = extraChoiceService.getEntryChoices(
            entries.stream().map(MealPlanEntry::getId).toList());
        ViewCache cache = new ViewCache();
        List<ManageExtrasMealDTO> meals = new ArrayList<>();
        for (MealPlanEntry e : entries) {
            ManageExtrasMealDTO meal = buildMeal(e.getId(), e.getPlanDate(),
                (int) ChronoUnit.DAYS.between(startDate, e.getPlanDate()), e.getMeal(), e.getRecipe(),
                e.getServings(), choices.getOrDefault(e.getId(), Map.of()), cache);
            if (!meal.getExtras().isEmpty()) meals.add(meal);
        }
        return ManageExtrasViewDTO.builder().scope("WEEK").startDate(startDate)
            .endDate(startDate.plusDays(6)).meals(meals).build();
    }

    @Transactional(readOnly = true)
    public ManageExtrasViewDTO getTemplateView(Long userId, Long templateId) {
        // owner → templateRepository.findByIdAndUserId(templateId, ownerId)
        //          .orElseThrow(MealPlanTemplateService.TemplateNotFoundException::new);
        // entries = templateEntryRepository.findByTemplateId(templateId) sorted by dayOffset then meal id;
        // choices = extraChoiceService.getTemplateEntryChoices(ids);
        // buildMeal(e.getId(), null, e.getDayOffset(), e.getMeal(), e.getRecipe(), e.getServings(), ...);
        // scope "TEMPLATE", templateId, templateName.
    }

    /** extrasMealCount / storeBoughtCount per template id (index 0 / 1). */
    @Transactional(readOnly = true)
    public Map<Long, int[]> templateExtrasCounts(List<MealPlanTemplate> templates) {
        Map<Long, Boolean> hasExtrasCache = new HashMap<>();
        Map<Long, int[]> out = new HashMap<>();
        for (MealPlanTemplate t : templates) {
            List<MealPlanTemplateEntry> entries = templateEntryRepository.findByTemplateId(t.getId());
            Map<Long, Map<Long, Boolean>> choices = extraChoiceService.getTemplateEntryChoices(
                entries.stream().map(MealPlanTemplateEntry::getId).toList());
            int meals = 0, storeBought = 0;
            for (MealPlanTemplateEntry e : entries) {
                if (!hasExtrasCache.computeIfAbsent(e.getRecipe().getId(), recipeExtrasService::hasExtras)) continue;
                meals++;
                storeBought += (int) choices.getOrDefault(e.getId(), Map.of()).values().stream()
                    .filter(Boolean.FALSE::equals).count();
            }
            out.put(t.getId(), new int[] {meals, storeBought});
        }
        return out;
    }

    private ManageExtrasMealDTO buildMeal(Long targetId, LocalDate planDate, int dayOffset, Meal meal,
                                          Recipe recipe, BigDecimal servings, Map<Long, Boolean> choices,
                                          ViewCache cache) {
        Integer defaultServings = recipe.getDefaultServings();
        BigDecimal ratio = (defaultServings == null || defaultServings <= 0 || servings == null)
            ? BigDecimal.ONE
            : servings.divide(BigDecimal.valueOf(defaultServings), 10, RoundingMode.HALF_UP);
        List<RecipeExtraNodeDTO> tree = cache.trees.computeIfAbsent(recipe.getId(),
            id -> recipeExtrasService.hasExtras(id)
                ? recipeExtrasService.buildExtrasTree(id, new HashSet<>())
                : List.of());
        List<ManageExtraDTO> extras = new ArrayList<>();
        flatten(tree, recipe, ratio, 0, null, choices, extras, cache);
        String variantLabel = cache.variantLabels.computeIfAbsent(recipe.getId(),
            id -> familyMemberRepository.findByRecipeId(id).map(RecipeFamilyMember::getVariantLabel).orElse(""));
        return ManageExtrasMealDTO.builder()
            .targetId(targetId).planDate(planDate).dayOffset(dayOffset).mealType(meal.getKey())
            .recipeId(recipe.getId()).recipeName(recipe.getName())
            .variantLabel(variantLabel.isEmpty() ? null : variantLabel)
            .servings(servings).defaultServings(defaultServings).extras(extras).build();
    }

    /** Depth-first, display order; children of a store-bought extra are skipped (not cooked). */
    private void flatten(List<RecipeExtraNodeDTO> nodes, Recipe parent, BigDecimal parentRatio, int depth,
                         Long parentExtraId, Map<Long, Boolean> choices, List<ManageExtraDTO> out, ViewCache cache) {
        for (RecipeExtraNodeDTO node : nodes) {
            boolean homemade = !Boolean.FALSE.equals(choices.get(node.getRecipeId()));
            BigDecimal used = extraPortionResolver.usedGrams(parent, node.getRecipeId(), parentRatio);
            Long productId = node.getStoreBoughtIngredientId();
            String productName = productId == null ? null : cache.productNames.computeIfAbsent(productId,
                id -> ingredientRepository.findById(id).map(Ingredient::getName).orElse(null));
            out.add(ManageExtraDTO.builder()
                .extraRecipeId(node.getRecipeId()).extraName(node.getRecipeName())
                .depth(depth).parentExtraRecipeId(parentExtraId).homemade(homemade)
                .usedGrams(used == null ? null : used.setScale(0, RoundingMode.HALF_UP))
                .storeBoughtIngredientId(productId).storeBoughtIngredientName(productName)
                .build());
            if (!homemade || node.getChildren() == null || node.getChildren().isEmpty()) continue;
            Recipe child = cache.recipes.computeIfAbsent(node.getRecipeId(),
                id -> recipeRepository.findById(id).orElse(null)); // findById, not findWithDetailsById — see ShoppingListService#collectUsagesFromExtras
            if (child == null) continue;
            BigDecimal childRatio = extraPortionResolver.resolveExtraPortionRatio(parent, node.getRecipeId(), parentRatio, child);
            if (childRatio.compareTo(BigDecimal.ZERO) > 0) {
                flatten(node.getChildren(), child, childRatio, depth + 1, node.getRecipeId(), choices, out, cache);
            }
        }
    }

    /** Request-scoped caches: a recipe appears on several days. */
    private static final class ViewCache {
        final Map<Long, List<RecipeExtraNodeDTO>> trees = new HashMap<>();
        final Map<Long, String> variantLabels = new HashMap<>();
        final Map<Long, String> productNames = new HashMap<>();
        final Map<Long, Recipe> recipes = new HashMap<>();
    }
}
```
`HashMap.computeIfAbsent` does not store a null result — `productNames` therefore retries a missing ingredient per call, which is acceptable (data bug, rare). Check `RecipeFamilyMember#getVariantLabel` exists; use the entity's actual accessor if named differently.

- [x] **Step 5: Run the tests to see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ManageExtrasServiceTest`
Expected: `BUILD SUCCESS`, 7 tests, 0 failures.

### Task 12: `MealPlanTemplateService` — snapshot / apply carry choices, summary counts ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanTemplateDTO.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanTemplateService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanTemplateServiceTest.java`

- [x] **Step 1: Add the DTO fields**

```java
    private Integer extrasMealCount;   // MPP-10: meals in the template that have extras
    private Integer storeBoughtCount;  // MPP-10: extras set to store-bought across those meals
```

- [x] **Step 2: Write the failing tests (new class)**

`MealPlanTemplateServiceTest` (`@ExtendWith(MockitoExtension.class)`, `@InjectMocks MealPlanTemplateService`, mocks for its repositories, `MealPlanService`, `ExtraChoiceService`, `ManageExtrasService`). `saveAll` stubs assign ids via answer. Tests:

```java
@Test void saveTemplate_snapshotsEachMealsChoices()          // AC 7: source entries 10, 11 → template entries 700, 701 → verify copyEntryChoicesToTemplate({10L:700L, 11L:701L})
@Test void applyTemplate_restoresChoicesOntoNewEntries()     // AC 7: template entries 700, 701 → new entries 900, 901 → verify copyTemplateChoicesToEntries({700L:900L, 701L:901L})
@Test void applyTemplate_skipsDeletedRecipe_andItsChoices()  // recipe of 701 gone → map {700L:900L} only
@Test void updateSnapshot_resnapshotsChoices()               // AC 7: deleteByTemplateId then copyEntryChoicesToTemplate with the new ids
@Test void listTemplates_carriesExtrasCounts()               // manageExtrasService.templateExtrasCounts → {5L: {2,1}} → DTO extrasMealCount 2, storeBoughtCount 1
@Test void templateEdits_neverTouchDefaults()                // AC 4: across save/apply/update, verify(extraChoiceService, never()).updateDefaults(any(), any(), any())
```

- [x] **Step 3: Run to see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanTemplateServiceTest`
Expected: FAIL.

- [x] **Step 4: Implement**

Add fields `private final ExtraChoiceService extraChoiceService;` and `private final ManageExtrasService manageExtrasService;`.

`snapshotIntoTemplate` — keep a parallel `List<Long> sourceIds` while building `snapshots`; after `templateEntryRepository.saveAll(snapshots)`:
```java
        // MPP-10: snapshot each meal's homemade/store-bought choices with it (AC 7).
        Map<Long, Long> entryToTemplateEntry = new HashMap<>();
        for (int i = 0; i < snapshots.size(); i++) {
            entryToTemplateEntry.put(sourceIds.get(i), snapshots.get(i).getId());
        }
        extraChoiceService.copyEntryChoicesToTemplate(entryToTemplateEntry);
```
`applyTemplate` — keep a parallel `List<Long> templateEntryIds` for each added `newEntries` item; after `saveAll`, build `templateEntryId → newEntry.getId()` and call `extraChoiceService.copyTemplateChoicesToEntries(map)`.
`updateSnapshot` — no extra code: `deleteByTemplateId` cascades old template choices in MySQL; `snapshotIntoTemplate` writes the new ones. Add that sentence to its javadoc.
`listTemplates` — `List<MealPlanTemplate> templates = templateRepository.findByUserId(ownerId); Map<Long, int[]> counts = manageExtrasService.templateExtrasCounts(templates);` then `toSummaryDTO(t, counts.get(t.getId()))`.
`toSummaryDTO(MealPlanTemplate template, int[] extrasCounts)` sets `extrasMealCount = extrasCounts == null ? 0 : extrasCounts[0]`, `storeBoughtCount = extrasCounts == null ? 0 : extrasCounts[1]`. `toDetailDTO` and `renameTemplate` call it with `manageExtrasService.templateExtrasCounts(List.of(template)).get(template.getId())`.

- [x] **Step 5: Run the tests to see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanTemplateServiceTest`
Expected: `BUILD SUCCESS`, 6 tests, 0 failures.

### Task 13: `MealPlanExtrasController` and its request DTOs ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/ExtraChoicesUpdateRequest.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/LegacySelectionsImportRequest.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/MealPlanExtrasController.java`

- [x] **Step 1: Add the request DTOs**

```java
/** MPP-10: one or more choices saved in a single transaction (a tap, or All homemade / All store-bought). */
@Data @NoArgsConstructor @AllArgsConstructor
public class ExtraChoicesUpdateRequest {
    @NotEmpty(message = "choices is required")
    @Size(max = 300, message = "At most 300 choices per request")
    private List<@Valid ExtraChoiceItemDTO> choices;
}

/** MPP-10: a browser's legacy localStorage selections, { parentRecipeId: { extraRecipeId: isHomemade } }. */
@Data @NoArgsConstructor @AllArgsConstructor
public class LegacySelectionsImportRequest {
    @NotNull(message = "selections is required")
    private Map<Long, Map<Long, Boolean>> selections;
}
```

- [x] **Step 2: Write the controller (thin — parse, delegate, map exceptions)**

```java
/**
 * MPP-10: homemade/store-bought choices for recipe extras — the Manage extras popup (week and
 * template), the per-dish defaults that pre-fill the add-to-day popup, and the one-time upload
 * of legacy localStorage selections. All endpoints require authentication.
 */
@RestController
@RequestMapping("/api/meal-plan/extras")
@RequiredArgsConstructor
public class MealPlanExtrasController {

    private final ManageExtrasService manageExtrasService;
    private final ExtraChoiceService extraChoiceService;

    @GetMapping("/week")
    public ResponseEntity<?> getWeek(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        return ResponseEntity.ok(manageExtrasService.getWeekView(userPrincipal.getId(), startDate));
    }

    @PutMapping("/week/choices")
    public ResponseEntity<?> updateWeek(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ExtraChoicesUpdateRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        try {
            extraChoiceService.updateWeekChoices(userPrincipal.getId(), request.getChoices());
            return ResponseEntity.noContent().build();
        } catch (ExtraChoiceService.ChoiceTargetNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET  /templates/{templateId}         → manageExtrasService.getTemplateView; TemplateNotFoundException → 404
    // PUT  /templates/{templateId}/choices → extraChoiceService.updateTemplateChoices; same 404/400 mapping as updateWeek
    // GET  /defaults                       → ResponseEntity.ok(extraChoiceService.getDefaults(id))
    // POST /import (@Valid LegacySelectionsImportRequest) → ResponseEntity.ok(Map.of("imported", extraChoiceService.importLegacySelections(id, request.getSelections())))
}
```
Write the four commented methods in the same shape as the two shown (403 guard first).

- [x] **Step 3: Compile and confirm no controller touches a repository**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.
Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\controller\MealPlanExtrasController.java -Pattern "Repository"`
Expected: zero hits.

---

## Phase 4 — Frontend data layer

Moves the client onto the server choices: service module, context, the add-to-day path, the generate path, and the calendar card's own choices. No new screens yet; the phase ends with a green `npm run build` and the app behaving as before except that choices persist server-side.

### Task 14: Constants, utils and `extraChoicesService` ✓
 ✓
- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/extraChoices.js`
- Create: `foodbytes-app/client/src/utils/manageExtrasUtils.js`
- Create: `foodbytes-app/client/src/services/extraChoicesService.js`

- [x] **Step 1: Write the constants**

```js
// MPP-10: homemade/store-bought extras — shared values.
export const SAVE_STATUS = { IDLE: 'idle', SAVING: 'saving', SAVED: 'saved', ERROR: 'error' }
export const LEGACY_SELECTIONS_KEY_PREFIX = 'homemadeSelections_'
export const EXTRAS_SCOPE = { WEEK: 'week', TEMPLATE: 'template' }
export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
```

- [x] **Step 2: Write the pure helpers**

```js
// MPP-10: pure helpers for the Manage extras popup (no React, node-smoke-testable).

export const choiceKey = (targetId, extraRecipeId) => `${targetId}:${extraRecipeId}`

/** Extras the user can act on: children of a store-bought extra are hidden (not cooked). */
export const visibleExtras = (meal) => {
  const storeBought = new Set()
  return meal.extras.filter((x) => {
    if (x.parentExtraRecipeId != null && storeBought.has(x.parentExtraRecipeId)) {
      storeBought.add(x.extraRecipeId)
      return false
    }
    if (!x.homemade) storeBought.add(x.extraRecipeId)
    return true
  })
}

/** Returns a new view with each { targetId, extraRecipeId, homemade } applied. */
export const patchView = (view, items) => {
  if (!view || !items.length) return view
  const next = new Map(items.map((i) => [choiceKey(i.targetId, i.extraRecipeId), i.homemade]))
  return {
    ...view,
    meals: view.meals.map((meal) => ({
      ...meal,
      extras: meal.extras.map((x) => {
        const key = choiceKey(meal.targetId, x.extraRecipeId)
        return next.has(key) ? { ...x, homemade: next.get(key) } : x
      })
    }))
  }
}

export const countExtras = (view) => {
  const meals = view?.meals ?? []
  let extras = 0
  let storeBought = 0
  meals.forEach((meal) => {
    visibleExtras(meal).forEach((x) => {
      extras += 1
      if (!x.homemade) storeBought += 1
    })
  })
  return { meals: meals.length, extras, storeBought }
}

/** "Oct 12 – Oct 18" from two ISO dates. */
export const formatShortRange = (startISO, endISO) => {
  const fmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(startISO)} – ${fmt(endISO)}`
}
```

- [x] **Step 3: Write the service**

```js
import api from './api'

/**
 * MPP-10: homemade/store-bought choices for recipe extras.
 * Reads accept { signal } so callers can abort them; writes are never aborted.
 */
export const extraChoicesService = {
  async getWeek(startDate, { signal } = {}) {
    const response = await api.get('/meal-plan/extras/week', { params: { startDate }, signal })
    return response.data
  },

  async updateWeek(choices) {
    await api.put('/meal-plan/extras/week/choices', { choices })
  },

  async getTemplate(templateId, { signal } = {}) {
    const response = await api.get(`/meal-plan/extras/templates/${templateId}`, { signal })
    return response.data
  },

  async updateTemplate(templateId, choices) {
    await api.put(`/meal-plan/extras/templates/${templateId}/choices`, { choices })
  },

  async getDefaults({ signal } = {}) {
    const response = await api.get('/meal-plan/extras/defaults', { signal })
    return response.data
  },

  async importLegacy(selections) {
    const response = await api.post('/meal-plan/extras/import', { selections })
    return response.data
  }
}

export default extraChoicesService
```

- [x] **Step 4: Smoke-test the pure helpers**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {countExtras,visibleExtras} from './src/utils/manageExtrasUtils.js'; const m={targetId:1,extras:[{extraRecipeId:12,homemade:false,parentExtraRecipeId:null},{extraRecipeId:99,homemade:true,parentExtraRecipeId:12},{extraRecipeId:36,homemade:true,parentExtraRecipeId:null}]}; console.log(visibleExtras(m).length, JSON.stringify(countExtras({meals:[m]})))"`
Expected: `2 {"meals":1,"extras":2,"storeBought":1}`

### Task 15: `HomemadeSelectionsContext` — server defaults + one-time legacy import ✓
 ✓
- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/contexts/HomemadeSelectionsContext.jsx`

- [x] **Step 1: Replace the load / save logic, keeping the public surface**

```jsx
import { createContext, useState, useContext, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import extraChoicesService from '../services/extraChoicesService'
import { LEGACY_SELECTIONS_KEY_PREFIX } from '../constants/extraChoices'

// FR-103: Shopping list cache key (shared with ShoppingListContext and MealPlanContext)
const SHOPPING_LIST_INVALIDATED_KEY = 'shoppingListInvalidated'

// … keep invalidateShoppingListCache unchanged …

const readLocal = (key) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : {}
  } catch (err) {
    console.error('Error reading homemade selections:', err)
    return {}
  }
}

const isCancelled = (err) => err?.code === 'ERR_CANCELED'

/**
 * MPP-10: load the owner's per-dish defaults. The first time the server has none, upload this
 * browser's legacy localStorage selections once, then drop the local copy.
 */
const loadServerDefaults = async (legacyKey, signal) => {
  const defaults = await extraChoicesService.getDefaults({ signal })
  if (Object.keys(defaults).length > 0) return defaults
  const legacy = readLocal(legacyKey)
  if (Object.keys(legacy).length === 0) return defaults
  await extraChoicesService.importLegacy(legacy)
  try { localStorage.removeItem(legacyKey) } catch { /* storage unavailable — import is idempotent server-side */ }
  return extraChoicesService.getDefaults({ signal })
}

/**
 * FR-090 / MPP-10: homemade/store-bought defaults that pre-fill the add-to-day popup.
 * Signed-in users: the server's per-dish defaults (shared with linked accounts). The popup's
 * choices are saved server-side with the assign call, so saveSelections only refreshes the cache.
 * Guests: localStorage, unchanged.
 */
const HomemadeSelectionsContext = createContext()

export const HomemadeSelectionsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [selections, setSelections] = useState({})
  const [selectionsLoaded, setSelectionsLoaded] = useState(false)
  const [selectionsError, setSelectionsError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const storageKey = `${LEGACY_SELECTIONS_KEY_PREFIX}${user?.id || 'guest'}`

  useEffect(() => {
    setSelectionsLoaded(false)
    setSelectionsError(null)
    if (!isAuthenticated) {
      setSelections(readLocal(storageKey))
      setSelectionsLoaded(true)
      return undefined
    }
    const controller = new AbortController()
    loadServerDefaults(storageKey, controller.signal)
      .then((defaults) => setSelections(defaults))
      .catch((err) => {
        if (isCancelled(err)) return
        console.error('Error loading homemade selections:', err)
        setSelectionsError('Could not load your homemade/store-bought choices.')
        setSelections({})
      })
      .finally(() => {
        if (!controller.signal.aborted) setSelectionsLoaded(true)
      })
    return () => controller.abort()
  }, [isAuthenticated, storageKey, reloadKey])

  const saveSelections = useCallback((recipeId, newSelections) => {
    setSelections((prev) => {
      const updated = { ...prev, [recipeId]: newSelections }
      if (!isAuthenticated) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated))
        } catch (err) {
          console.error('Error saving homemade selections:', err)
        }
      }
      invalidateShoppingListCache()
      return updated
    })
  }, [isAuthenticated, storageKey])

  const getSelections = useCallback((recipeId) => selections[recipeId] || {}, [selections])

  /** MPP-10: re-read server defaults after a Manage extras week edit changed them. */
  const reloadSelections = useCallback(() => setReloadKey((k) => k + 1), [])

  const clearSelections = useCallback(() => {
    setSelections({})
    try {
      localStorage.removeItem(storageKey)
    } catch (err) {
      console.error('Error clearing homemade selections:', err)
    }
  }, [storageKey])

  const value = {
    selections,
    selectionsLoaded,
    selectionsError,
    saveSelections,
    getSelections,
    reloadSelections,
    clearSelections
  }
  // … Provider / useHomemadeSelections / default export unchanged …
}
```
Confirm `useAuth()` exposes `isAuthenticated` (it does in `DayAssignmentButtons`). The existing `useCallback`s are kept (they are context values consumed in effect deps, not perf memoisation).

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 16: Send popup choices with the assign call; pre-fill on a variant swap ✓
 ✓
- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/services/mealPlanService.js` (`assignRecipe`)
- Modify: `foodbytes-app/client/src/contexts/MealPlanContext.jsx:250,273`
- Modify: `foodbytes-app/client/src/components/recipes/ExtrasSelectionPopup.jsx`
- Modify: `foodbytes-app/client/src/components/recipes/DayAssignmentButtons.jsx`

- [x] **Step 1: Record `MealPlanContext.jsx`'s line count (must not grow)**

Run: `cd foodbytes-app\client; (Get-Content src\contexts\MealPlanContext.jsx | Measure-Object -Line).Lines`
Expected: a number (559 at planning) — note it.

- [x] **Step 2: Forward `extraChoices`**

`mealPlanService.assignRecipe(planDate, mealId, recipeId, servings, extraChoices)` — add `@param {Object} [extraChoices] - MPP-10: extraRecipeId -> isHomemade from the add-to-day popup` to the JSDoc and `extraChoices` to the POST body object.
`MealPlanContext.jsx` line 250 becomes `const assignRecipe = useCallback((recipeId, planDate, mealId, servings, recipeData = null, extraChoices = null) => {` and line 273 becomes `mealPlanService.assignRecipe(planDate, mealId, recipeId, servings, extraChoices)` — edits on existing lines only.

- [x] **Step 3: Popup accepts an initial selection**

In `ExtrasSelectionPopup`, add prop `initialSelections` (documented `// MPP-10: a same-family slot's own choices; overrides the dish default`) and change the init effect to:
```jsx
  useEffect(() => {
    if (recipe?.extras) {
      const saved = initialSelections ?? getSelections(recipe.id)
      setSelections(initializeSelections(recipe.extras, saved))
    }
  }, [recipe, initialSelections, getSelections, initializeSelections])
```
Update the FR-090 comment in `handleConfirm` to "MPP-10: refresh the local default cache; the server stores these with the assign call."

- [x] **Step 4: `DayAssignmentButtons` passes choices and pre-fills swaps**

```jsx
  const [pendingInitialSelections, setPendingInitialSelections] = useState(undefined) // MPP-10

  /** MPP-10: when the slot holds a sibling variant, pre-fill the popup with that meal's own choices. */
  const getSiblingSlotChoices = (dateStr) => {
    const day = weekPlan?.days?.find((d) => d.date === dateStr)
    const existing = day?.mealsByType?.[currentMealType?.toLowerCase()]?.[0]
    const isSibling = existing && recipe.variants?.some((v) => v.recipeId === existing.recipe?.id)
    return isSibling ? existing.extraChoices : undefined
  }

  const performAssignment = (dateStr, extraChoices = null) => {
    const mealId = getMealId(currentMealType)
    assignRecipe(recipeIdToAssign, dateStr, mealId, servings, recipe, extraChoices)
  }
```
In `handleDayClick`, before `setPendingDate(dateStr)` add `setPendingInitialSelections(getSiblingSlotChoices(dateStr))`. `handleExtrasConfirm(selections)` calls `performAssignment(pendingDate, selections)`; both confirm and cancel reset `setPendingInitialSelections(undefined)`. Pass `initialSelections={pendingInitialSelections}` to `ExtrasSelectionPopup`. Remove the now-unused `saveSelections` destructure and `useHomemadeSelections` import.

- [x] **Step 5: Build and re-measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\contexts\MealPlanContext.jsx | Measure-Object -Line).Lines`
Expected: build succeeds; line count equals Step 1's number.

### Task 17: Remove `selections` from the generate path ✓
 ✓
- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/shopping/GenerateShoppingListModal.jsx:3,12-13,35`
- Modify: `foodbytes-app/client/src/contexts/ShoppingListContext.jsx:108-122`
- Modify: `foodbytes-app/client/src/services/shoppingService.js:30-42,86-98`

- [x] **Step 1: Delete the plumbing**

- `GenerateShoppingListModal`: remove the `useHomemadeSelections` import, the MPP-8 comment and `const { selections } = useHomemadeSelections()`; call `await generateShoppingList(startDate, endDate)`.
- `ShoppingListContext.generateShoppingList = useCallback(async (startDate, endDate) => {` — drop the `selections` param and JSDoc line; call `shoppingService.generateShoppingList(startDate, endDate)`.
- `shoppingService.generateShoppingList(startDate, endDate)` — body `{ startDate, endDate }`; delete `getShoppingListWithSelections` (confirm unused first).

- [x] **Step 2: Confirm no caller remains and build**

Run: `Select-String -Path foodbytes-app\client\src\**\*.js*,foodbytes-app\client\src\*.jsx -Pattern "getShoppingListWithSelections|generateShoppingList\([^)]*selections"`
Expected: zero hits.
Run: `cd foodbytes-app\client; npm run build`
Expected: builds with no errors.

### Task 18: Calendar card cart icon; recipe view uses the meal's own choices ✓
 ✓
- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/common/ExtrasIcons.jsx`
- Create: `foodbytes-app/client/src/hooks/useLinkedStepSelections.js`
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanEntry.jsx`, `MealPlanEntry.css`
- Modify: `foodbytes-app/client/src/components/recipes/RecipeViewModal.jsx:7,~38,46-47`

- [x] **Step 1: Icons from the mockup**

`ExtrasIcons.jsx` exports `CartIcon`, `HomeIcon`, `InfoIcon` — each `({ className }) => <svg className={className} viewBox=… width="14" height="14" aria-hidden="true" focusable="false">…</svg>`, with `viewBox` and path data copied from the mockup's `ICON_CART`, `ICON_HOME`, `ICON_INFO` constants (`C:\Users\jossd\Downloads\mpp-10-manage-extras-mockup.html`), `stroke="currentColor"`/`fill` as in the mockup.

- [x] **Step 2: Hook**

```js
import { useHomemadeSelections } from '../contexts/HomemadeSelectionsContext'

/**
 * MPP-10: choices that decide homemade vs store-bought wording on linked steps. A planned meal
 * passes its own stored choices; anywhere else falls back to the dish default.
 */
export function useLinkedStepSelections(parentRecipeId, extraChoices) {
  const { getSelections } = useHomemadeSelections()
  if (extraChoices) return extraChoices
  return parentRecipeId ? getSelections(parentRecipeId) : {}
}
```

- [x] **Step 3: `RecipeViewModal` without growing**

Record the line count (`(Get-Content src\components\recipes\RecipeViewModal.jsx | Measure-Object -Line).Lines`, 406 at planning). Replace line 7's `useHomemadeSelections` import with `import { useLinkedStepSelections } from '../../hooks/useLinkedStepSelections'`; add `extraChoices = null,  // MPP-10: a planned meal's own choices` to the props list; replace lines 46-47 with `const homemadeSelections = useLinkedStepSelections(parentRecipeId, extraChoices) // FR-090 / MPP-10`. Re-measure: count must be ≤ the recorded one.

- [x] **Step 4: `MealPlanEntry` cart icon + pass choices**

```jsx
  // MPP-10 / AC 12: orange cart when any extra of this meal is store-bought
  const hasStoreBought = Object.values(entry.extraChoices || {}).includes(false)
```
Inside `.entry-info`, before `.recipe-name`:
```jsx
          {hasStoreBought && (
            <span className="entry-store-bought" role="img" aria-label="Has store-bought extras" title="Has store-bought extras">
              <CartIcon />
            </span>
          )}
```
Pass `extraChoices={entry.extraChoices}` to `RecipeViewModal`. CSS: `.entry-store-bought { display: inline-flex; color: <the mockup's sb orange>; margin-right: 4px; vertical-align: middle; }` — take the orange from the mockup's `.sb-flag` rule.

- [x] **Step 5: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: builds with no errors.

---

## Phase 5 — Manage extras UI

The popup, its two entry points and the Regenerate bar. Each task builds green; the phase ends with the full flow reachable from the ⋯ menu and Manage templates.

### Task 19: `useManageExtras` hook ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useManageExtras.js`

- [x] **Step 1: Write the hook**

```js
import { useEffect, useRef, useState } from 'react'
import extraChoicesService from '../services/extraChoicesService'
import { EXTRAS_SCOPE, SAVE_STATUS } from '../constants/extraChoices'
import { choiceKey, countExtras, patchView, visibleExtras } from '../utils/manageExtrasUtils'

const errorMessage = (err, fallback) => err?.response?.data?.error || fallback

/**
 * MPP-10: state for the Manage extras popup. Every change saves immediately and optimistically;
 * on failure only the items whose latest request failed are reverted, so an earlier failed tap
 * can't undo a later successful one.
 */
export function useManageExtras({ scope, startDate, templateId }) {
  const [view, setView] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [saveStatus, setSaveStatus] = useState(SAVE_STATUS.IDLE)
  const [hasSaved, setHasSaved] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const latestRequest = useRef(new Map())
  const requestSeq = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)
    const request = scope === EXTRAS_SCOPE.WEEK
      ? extraChoicesService.getWeek(startDate, { signal: controller.signal })
      : extraChoicesService.getTemplate(templateId, { signal: controller.signal })
    request
      .then((data) => setView(data))
      .catch((err) => {
        if (err?.code !== 'ERR_CANCELED') setLoadError(errorMessage(err, 'Could not load extras.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [scope, startDate, templateId, reloadKey])

  const persist = (items) => (scope === EXTRAS_SCOPE.WEEK
    ? extraChoicesService.updateWeek(items)
    : extraChoicesService.updateTemplate(templateId, items))

  const applyChoices = (items) => {
    if (!items.length) return
    const previous = new Map()
    view.meals.forEach((meal) => meal.extras.forEach((x) => previous.set(choiceKey(meal.targetId, x.extraRecipeId), x.homemade)))
    const requestId = ++requestSeq.current
    items.forEach((i) => latestRequest.current.set(choiceKey(i.targetId, i.extraRecipeId), requestId))
    setView((v) => patchView(v, items))
    setSaveStatus(SAVE_STATUS.SAVING)
    persist(items)
      .then(() => {
        setHasSaved(true)
        if (requestId === requestSeq.current) setSaveStatus(SAVE_STATUS.SAVED)
      })
      .catch(() => {
        const revert = items
          .filter((i) => latestRequest.current.get(choiceKey(i.targetId, i.extraRecipeId)) === requestId)
          .map((i) => ({ ...i, homemade: previous.get(choiceKey(i.targetId, i.extraRecipeId)) }))
        setView((v) => patchView(v, revert))
        setSaveStatus(SAVE_STATUS.ERROR)
      })
  }

  const toggle = (targetId, extraRecipeId, homemade) => applyChoices([{ targetId, extraRecipeId, homemade }])

  const setAll = (homemade) => applyChoices(
    (view?.meals ?? []).flatMap((meal) => visibleExtras(meal)
      .filter((x) => x.homemade !== homemade)
      .map((x) => ({ targetId: meal.targetId, extraRecipeId: x.extraRecipeId, homemade })))
  )

  return {
    view, loading, loadError, saveStatus, hasSaved,
    toggle, setAll,
    counts: countExtras(view),
    reload: () => setReloadKey((k) => k + 1)
  }
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: builds with no errors (the hook is tree-shaken until used; build still type-checks syntax).

### Task 20: Manage extras popup components and CSS ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/mealplan/ExtraChoiceRow.jsx`
- Create: `foodbytes-app/client/src/components/mealplan/ManageExtrasMeal.jsx`
- Create: `foodbytes-app/client/src/components/mealplan/ShoppingListStaleBar.jsx`
- Create: `foodbytes-app/client/src/components/mealplan/ManageExtrasModal.jsx`
- Create: `foodbytes-app/client/src/components/mealplan/ManageExtrasModal.css`

- [x] **Step 1: `ExtraChoiceRow`**

```jsx
import { CartIcon, HomeIcon } from '../common/ExtrasIcons'

/** MPP-10: one extra — what lands on the list, and a Homemade | Store-bought segmented switch. */
function ExtraChoiceRow({ extra, disabled, onChange }) {
  const { extraName, homemade, usedGrams, storeBoughtIngredientName, depth } = extra
  const grams = usedGrams != null ? ` · ${usedGrams} g` : ''
  const detail = homemade
    ? `Make ${extraName}${usedGrams != null ? ` · ${usedGrams} g used` : ''}`
    : storeBoughtIngredientName
      ? `Buy ${storeBoughtIngredientName}${grams}`
      : `Buy ready-made · listed as "Store Bought ${extraName}" (no product linked)`

  return (
    <div className="mx-extra" style={{ paddingLeft: `${depth * 16}px` }}>
      <div className="mx-extra-info">
        <span className="mx-extra-name">{extraName}</span>
        <span className={`mx-extra-detail ${homemade ? '' : 'sb'}`}>{detail}</span>
        {homemade && !storeBoughtIngredientName && (
          <span className="mx-note">No store-bought product linked yet</span>
        )}
      </div>
      <div className="mx-seg" role="radiogroup" aria-label={`${extraName}: homemade or store-bought`}>
        <button type="button" role="radio" aria-checked={homemade} className={`mx-seg-hm ${homemade ? 'on' : ''}`}
          disabled={disabled} onClick={() => !homemade && onChange(true)}>
          <HomeIcon />Homemade
        </button>
        <button type="button" role="radio" aria-checked={!homemade} className={`mx-seg-sb ${homemade ? '' : 'on'}`}
          disabled={disabled} onClick={() => homemade && onChange(false)}>
          <CartIcon />Store-bought
        </button>
      </div>
    </div>
  )
}

export default ExtraChoiceRow
```

- [x] **Step 2: `ManageExtrasMeal`**

Renders `.mx-meal` with `.mx-meal-head` = `<span className="mx-slot">{capitalised mealType}</span> <span className="mx-recipe">{recipeName}</span>` + `{servings != defaultServings && <span className="mx-serv">× {formatServings(servings)}</span>}` (import `formatServings` from `../../utils/servingsUtils`) + `{variantLabel && <span className="mx-variant">{variantLabel}</span>}`, then `visibleExtras(meal).map(x => <ExtraChoiceRow key={x.extraRecipeId} extra={x} onChange={(hm) => onToggle(meal.targetId, x.extraRecipeId, hm)} />)`. Props: `{ meal, onToggle }`.

- [x] **Step 3: `ShoppingListStaleBar`**

```jsx
import { useShoppingList } from '../../contexts/ShoppingListContext'
import { formatShortRange } from '../../utils/manageExtrasUtils'

/** MPP-10 / AC 11: a saved list overlapping the edited week is now out of date. */
function ShoppingListStaleBar({ weekStart, weekEnd }) {
  const { shoppingList, generateShoppingList, isGenerating, error } = useShoppingList()
  const overlaps = shoppingList?.startDate && shoppingList.startDate <= weekEnd && shoppingList.endDate >= weekStart
  if (!overlaps) return null
  return (
    <div className="mx-stale" role="status">
      <span>Your shopping list for {formatShortRange(shoppingList.startDate, shoppingList.endDate)} was made before this change.</span>
      <button type="button" className="mx-stale-button" disabled={isGenerating}
        onClick={() => generateShoppingList(shoppingList.startDate, shoppingList.endDate)}>
        {isGenerating ? 'Regenerating…' : 'Regenerate list'}
      </button>
      {error && <span className="mx-stale-error">{error}</span>}
    </div>
  )
}

export default ShoppingListStaleBar
```

- [x] **Step 4: `ManageExtrasModal`**

Props: `{ title, subtitle, scopeNote, savedTo, emptyTitle, emptyBody, showDates, extras, onBack, onClose, children }` where `extras` is the `useManageExtras` result. Structure (classes from `TemplateModals.css` + mockup):
- `.tpl-modal-overlay.mx-overlay` > `div.tpl-modal.tpl-modal-wide.mx-modal` (ref for outside-click), `role="dialog" aria-modal="true" aria-labelledby="mx-title"`.
- Header `.tpl-modal-header`: `{onBack && <button className="mx-back" aria-label="Back to templates" onClick={onBack}>‹</button>}`, `.tpl-modal-title` with `<h4 id="mx-title">{title}</h4>` + `.tpl-modal-subtitle`, close `×` (`aria-label="Close"`).
- Content `.tpl-modal-content`:
  - `loading` → `<p className="mx-loading">Loading extras…</p>`
  - `loadError` → `<p className="tpl-error">{loadError}</p>` + `<button className="tpl-action-button" onClick={extras.reload}>Try again</button>`
  - `view.meals.length === 0` → `.mx-empty` with `<strong>{emptyTitle}</strong><p>{emptyBody}</p>`
  - otherwise: `.mx-toolbar` (`.mx-summary` "`{meals} meal(s) · {extras} extras · {storeBought} store-bought`", buttons **All homemade** / **All store-bought** calling `extras.setAll(true|false)`), `.mx-scope` with `<InfoIcon/>` + `scopeNote`, then meals grouped by day — heading `.mx-day` = `DAY_NAMES[meal.dayOffset]` plus, when `showDates`, `<span className="mx-day-date">{new Date(`${meal.planDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>` — each meal as `<ManageExtrasMeal meal onToggle={extras.toggle} />`; then `.mx-status` line: SAVING → `Saving…`, SAVED → `✓ Saved to {savedTo}`, ERROR → `.mx-status.error` "Couldn't save. Your last change was undone. Try again." (`aria-live="polite"`).
  - `{children}` (stale bar slot), then `.tpl-modal-actions` with **Done** (`onClose`).
- `.tpl-modal-hint` "Press ESC or tap outside to close".
- ESC + outside mousedown/touchstart close via the same effect as `ManageTemplatesModal` (listeners removed in cleanup); `useBodyScrollLock(true)` from `../../hooks/useBodyScrollLock`.

- [x] **Step 5: CSS**

`ManageExtrasModal.css`: port every `mx-*` rule and the segmented-switch / `sb` / stale-bar rules from the mockup's `<style>` block, renaming the mockup's generic class names to the `mx-` prefixed names used above (`seg` → `mx-seg`, `sbn`/`sb-flag` → `mx-seg-sb` / `.entry-store-bought` colour). Mobile-first: base = phone bottom sheet (`.mx-overlay` aligns flex-end, `.mx-modal` full width, top radius, `max-height: 90vh; overflow-y: auto`; `.mx-seg` full width with two equal columns); `@media (min-width: 768px)` restores the centred modal. All buttons `min-height: 44px; touch-action: manipulation; -webkit-tap-highlight-color: transparent;`, hover inside `@media (hover: hover)`, `:focus-visible` outlines. Green = homemade, orange = store-bought, values from the mockup.

- [x] **Step 6: Build and measure**

Run: `cd foodbytes-app\client; npm run build; Get-ChildItem src\components\mealplan\ManageExtrasModal.jsx,src\components\mealplan\ManageExtrasMeal.jsx,src\components\mealplan\ExtraChoiceRow.jsx,src\components\mealplan\ShoppingListStaleBar.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }`
Expected: build succeeds; every file < 200 lines.

### Task 21: Week and template adapters ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/mealplan/WeekExtrasModal.jsx`
- Create: `foodbytes-app/client/src/components/mealplan/TemplateExtrasModal.jsx`

- [x] **Step 1: `WeekExtrasModal`**

```jsx
import { useManageExtras } from '../../hooks/useManageExtras'
import { EXTRAS_SCOPE } from '../../constants/extraChoices'
import { formatShortRange } from '../../utils/manageExtrasUtils'
import ManageExtrasModal from './ManageExtrasModal'
import ShoppingListStaleBar from './ShoppingListStaleBar'

/** MPP-10 / AC 8: Manage extras for the week on screen. Edits change only that week (+ dish defaults). */
function WeekExtrasModal({ startDate, endDate, onClose }) {
  const extras = useManageExtras({ scope: EXTRAS_SCOPE.WEEK, startDate })
  const range = formatShortRange(startDate, endDate)
  return (
    <ManageExtrasModal
      title="Manage extras"
      subtitle={`This week · ${range}`}
      scopeNote={`Changes apply to ${range} only. Your templates and other weeks stay as they are.`}
      savedTo="this week"
      emptyTitle="No extras this week"
      emptyBody={`None of the meals planned for ${range} have a homemade or store-bought choice. Add a dish like Pizza or Pink Sauce Pasta and it'll show up here.`}
      showDates
      extras={extras}
      onClose={() => onClose(extras.hasSaved)}
    >
      {extras.hasSaved && <ShoppingListStaleBar weekStart={startDate} weekEnd={endDate} />}
    </ManageExtrasModal>
  )
}

export default WeekExtrasModal
```

- [x] **Step 2: `TemplateExtrasModal`** — same shape with `useManageExtras({ scope: EXTRAS_SCOPE.TEMPLATE, templateId: template.id })`, `subtitle={`Template · ${template.name}`}`, `scopeNote="Changes apply to this template only. Your weeks change when you apply it."`, `savedTo={`"${template.name}"`}`, `emptyTitle="No extras in this template"`, `emptyBody="None of this template's meals have a homemade or store-bought choice."`, `showDates={false}`, `onBack={onBack}`, `onClose={onClose}`, no children. Props `{ template, onBack, onClose }`.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: builds with no errors.

### Task 22: ⋯ menu item and Manage templates Extras button ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanMenu.jsx`, `MealPlanMenu.css`
- Modify: `foodbytes-app/client/src/components/mealplan/ManageTemplatesModal.jsx`, `TemplateModals.css`

- [x] **Step 1: Menu — second item + divider (AC 8)**

Add prop `onManageExtras`; update the component comment to list Manage extras. After the Copy week `<li>`:
```jsx
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onManageExtras)}>
                Manage extras…
              </button>
            </li>
            <li role="separator" className="meal-plan-menu-divider" />
```
CSS: `.meal-plan-menu-divider { height: 1px; margin: 4px 0; background: <the menu's existing border colour>; list-style: none; }`.

- [x] **Step 2: Templates — Extras button, count, meta line (AC 9)**

Add prop `onOpenExtras(template)` (documented in the props comment). Subtitle → "Rename, refresh, set extras, or delete saved plans". Meta line: ``{t.entryCount ?? 0} meals{t.storeBoughtCount > 0 && <span className="tpl-meta-sb"> · {t.storeBoughtCount} store-bought</span>}``. Between Update and Delete:
```jsx
                          {t.extrasMealCount > 0 && (
                            <button
                              type="button"
                              className="tpl-action-button tpl-action-extras"
                              onClick={() => onOpenExtras(t)}
                              disabled={isBusy}
                              title="Choose homemade or store-bought for this template's extras"
                            >
                              Extras
                              {t.storeBoughtCount > 0 && (
                                <span className="tpl-extras-count" aria-label={`${t.storeBoughtCount} store-bought`}>
                                  {t.storeBoughtCount}
                                </span>
                              )}
                            </button>
                          )}
```
CSS (`TemplateModals.css`): `.tpl-extras-count` orange pill (mockup colour); `.tpl-meta-sb` orange text; base (phone) `.tpl-list-item` stacks info above actions and `.tpl-list-actions { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; width: 100%; gap: 6px; }`; `@media (min-width: 768px)` restores the current inline layout. Buttons keep ≥44 px height.

- [x] **Step 3: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\mealplan\ManageTemplatesModal.jsx | Measure-Object -Line).Lines`
Expected: build succeeds; < 260 lines.

### Task 23: Wire the modals into `MealPlanCalendar` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanCalendar.jsx`

- [x] **Step 1: State, handlers and render**

```jsx
  const [showWeekExtras, setShowWeekExtras] = useState(false)     // MPP-10
  const [extrasTemplate, setExtrasTemplate] = useState(null)      // MPP-10: template whose extras are open
  const { reloadSelections } = useHomemadeSelections()

  const closeWeekExtras = (changed) => {
    setShowWeekExtras(false)
    if (changed) {
      fetchWeekPlan()        // cart icons (AC 12)
      reloadSelections()     // week edits updated dish defaults (AC 4)
    }
  }
  const openTemplateExtras = (template) => {
    setShowManageModal(false)  // replace, don't stack
    setExtrasTemplate(template)
  }
  const closeTemplateExtras = (backToManage) => {
    setExtrasTemplate(null)
    loadTemplates({ force: true }).catch(() => {})
    if (backToManage) setShowManageModal(true)
  }
```
Pass `onManageExtras={() => setShowWeekExtras(true)}` to `MealPlanMenu` and `onOpenExtras={openTemplateExtras}` to `ManageTemplatesModal`. Render:
```jsx
      {showWeekExtras && (
        <WeekExtrasModal startDate={startDate} endDate={endDate} onClose={closeWeekExtras} />
      )}
      {extrasTemplate && (
        <TemplateExtrasModal
          template={extrasTemplate}
          onBack={() => closeTemplateExtras(true)}
          onClose={() => closeTemplateExtras(false)}
        />
      )}
```
Take `startDate`, `endDate`, `fetchWeekPlan` from `useMealPlan()` (add to the existing destructure). Confirm `endDate` from `MealPlanContext` is the inclusive last day (ISO string); if it is exclusive, pass `formatDateISO(addDays(new Date(startDate), 6))` instead. Follow the existing `loadTemplates` error-swallow pattern at lines 45/50 (`try { … } catch {}`) for consistency.

- [x] **Step 2: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\mealplan\MealPlanCalendar.jsx | Measure-Object -Line).Lines`
Expected: build succeeds; < 300 lines.

---

## Phase 6 — Final verification

Sanity checks on the cumulative work, plus the per-ticket version bump that `CLAUDE.md` → Versioning & deploy verification requires as Task M.1 (added at `/fb-apply` start, 2026-10-10 — the planner missed it).

### Task 23.1 (M.1): Bump the version to 1.2.0 and add the CHANGELOG line ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification (Story → MINOR: 1.1.0 → 1.2.0)

**Files:**
- Modify: `foodbytes-app/client/package.json` (`"version": "1.1.0"` → `"1.2.0"`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml:17` (`<version>1.1.0</version>` under `<artifactId>foodbytes-api</artifactId>` → `1.2.0`)
- Modify: `CHANGELOG.md` (new top entry above `1.1.0 — MPP-9: …`)

- [x] **Step 1: Bump both manifests and add the CHANGELOG line**

CHANGELOG line (insert directly above the `1.1.0` line):
```
1.2.0 — MPP-10: homemade/store-bought choices saved server-side per planned meal and template, Manage extras popup, store-bought quantities in grams, 32 missing recipe_extras links
```

- [x] **Step 2: Verify**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: 1.2.0`

### Task 24: Grep for stale references and budget regressions ✓

- Skill: none — read-only verification

**Files:**
- (none)

- [x] **Step 1: No selections plumbing left**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\**\*.java,foodbytes-app\client\src\**\*.js,foodbytes-app\client\src\**\*.jsx -Pattern "HomemadeSelectionsDTO|getShoppingListWithSelections"`
Expected: zero hits.

- [x] **Step 2: Over-budget files did not grow, no new console.log**

Run: `cd foodbytes-app\client; (Get-Content src\contexts\MealPlanContext.jsx | Measure-Object -Line).Lines; (Get-Content src\components\recipes\RecipeViewModal.jsx | Measure-Object -Line).Lines; (Select-String -Path src\**\*.js,src\**\*.jsx -Pattern "console\.(log|debug)").Count`
Expected: ≤ 559, ≤ 406, ≤ 16 (HEAD baseline measured at `/fb-apply` 2026-10-10 is 16 — the skill's "6" is stale; this branch must add none: `git diff HEAD -- src | Select-String "^\+.*console\.(log|debug)"` → zero hits).

- [x] **Step 3: No CSS modules, no hardcoded backend URL**

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Filter *.module.css; Select-String -Path foodbytes-app\client\src\**\*.js* -Pattern "localhost:8080"`
Expected: no output from either.

### Task 25: Full backend suite ✓ (QA round 2: 118 tests, 0 failures)

- Skill: none — verification

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 26: Production build ✓ (QA round 2: built in 897ms; re-built after the ASI fix: 742ms)

- Skill: none — verification

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 27: Manual checks for the developer (after migrations applied + backend deployed) — developer-owned, pending

- Skill: none — manual play-test owned by the developer

- [ ] **Step 1: Run the ticket examples at the app**

- `/mealplan`, desktop: ⋯ → second item **Manage extras…**, divider below it (AC 8). Popup lists only meals with extras, Mon→Sun, Breakfast→Lunch→Dinner; ×N shown when servings differ; grams scale (AC 10).
- Flip Fresh Pasta on Monday's Bolognese to Store-bought: Saving… → ✓ Saved to this week; line reads "Buy Spaghetti (dried) · 200 g"; Regenerate bar appears if a list overlaps; close → Monday card shows the cart icon (AC 11, 12).
- Phone width (≤ 480 px): popup is a bottom sheet, switches full width, Manage templates buttons share one row (AC 10).
- Generate Mon–Sun on a second browser / the linked account: Spaghetti (dried) 200 g, no flour/egg from chain [36, 82] (AC 1, 2, ex. 1, 5).
- Offline the API (stop backend) and tap a switch: it reverts, error line shows (AC 10).
- Manage templates → a template with extras → **Extras** (count badge) → popup with ‹ back arrow; All store-bought updates count + meta line; the current week is unchanged (AC 9, ex. 9).
- Breakdown popup on the Spaghetti (dried) row lists the store-bought meal(s) in grams and matches the row total (AC 18).
- After first load post-deploy in a browser that had localStorage choices: `SELECT COUNT(*) FROM user_extra_defaults` > 0 (AC 17).

### Task 28: Write the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-10-server-side-extra-choices/pr-description.md`

- [x] **Step 1: Write `pr-description.md`**

Include: link to `plan.md`; summary (server-side per-meal / per-template choices + family defaults, Manage extras popup, gram quantities, 32 `recipe_extras` rows, MPP-8 selection plumbing removed); **required ordering**: apply `2026-10-10-mpp10-extra-choices-schema.sql` to Railway → redeploy backend → apply `2026-10-10-mpp10-recipe-extras-missing-links.sql` (data, any time); behaviour change note (toast/granola/dippers/soup now list homemade sub-recipe ingredients until switched to store-bought); verification results from Tasks 24–26; convention note: "Homemade/store-bought choices live in `meal_plan_entry_extra_choices` / `meal_plan_template_entry_extra_choices` / `user_extra_defaults` — never send them from the client at generate time; use `ExtraChoiceService`." End with the attribution line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

---

## Self-review

**Spec coverage:**
- New tables + migration applied before deploy — Tasks 1, 3, 4, 5.
- 32 missing `recipe_extras` rows (AC 16) — Tasks 2, 3.
- Choice endpoints for week + template; defaults; import — Tasks 7, 11, 13.
- Shopping list + breakdown read stored choices; grams; generic fallback (AC 1, 3, 13, 14, 15, 18) — Task 8; MPP-8 plumbing removed — Tasks 9, 17.
- Assign / variant switch / copy week / swap days carry choices (AC 4, 5, 6) — Task 10.
- Template save / apply / update carry choices; counts (AC 7, 9) — Tasks 12, 11.
- `HomemadeSelectionsContext` → API, localStorage upload (AC 17), popup pre-fill (AC 4) — Tasks 15, 16.
- Manage extras popup, menu item, Extras button, Regenerate bar (AC 8–11) — Tasks 19–23.
- Calendar cart icon (AC 12) — Tasks 10 (data), 18 (UI).
- Owner resolution for linked users (AC 2) — Tasks 7, 10 tests.
- Backend tests (AC 19) — Tasks 7, 8, 10, 11, 12.

**Placeholder scan:** No `TBD`, `TODO`, `implement later` or "appropriate error handling". Where a method body is described rather than pasted (template-side mirrors in Tasks 7, 11, 13), the step names the exact sibling method to mirror and every input/output.

**Type / name consistency:** `ExtraChoiceService` methods (`resolveOwnerId`, `getEntryChoices`, `getTemplateEntryChoices`, `setEntryChoices`, `updateDefaults`, `getDefaults`, `copyEntryChoices`, `copyEntryChoicesToTemplate`, `copyTemplateChoicesToEntries`, `updateWeekChoices`, `updateTemplateChoices`, `importLegacySelections`, `retainTreeExtras`, `ChoiceTargetNotFoundException`) match `plan.md` Data shapes and are used identically in Tasks 8, 10, 11, 12, 13. `ExtraPortionResolver.usedGrams / resolveExtraPortionRatio / findLinkedQuantityGrams` consistent across Tasks 6, 8, 11. JSON fields `targetId`, `extraRecipeId`, `homemade`, `extraChoices`, `extrasMealCount`, `storeBoughtCount`, `usedGrams`, `storeBoughtIngredientName`, `variantLabel`, `dayOffset`, `planDate` match between DTOs (Tasks 7, 10, 11, 12) and client (Tasks 14–23). Client names `useManageExtras({ scope, startDate, templateId })`, `EXTRAS_SCOPE`, `SAVE_STATUS`, `reloadSelections`, `useLinkedStepSelections` match `plan.md`.

**Phase boundary cleanliness:**
- Phase 1: SQL files only + live apply; Java untouched, build unaffected.
- Phase 2: entities/repositories compile; nothing calls them.
- Phase 3: each task compiles and runs its own tests; Task 9 removes `HomemadeSelectionsDTO` in the same task that removes its last callers, so no dead reference survives the phase.
- Phase 4: each task ends with `npm run build`; the client stops sending `selections` only after the backend ignores it (Phase 3), and `extraChoices` is optional server-side.
- Phase 5: new components are only mounted in the last task; each task builds green.
- Phase 6: read-only checks.
