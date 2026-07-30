# Tasks: Recipe macro audit sign-off (chef marks a recipe's macros/calories as verified)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: PLANNED
Started: 2026-07-29

**Goal:** Add `macros_audited` / `macros_audited_at` / `macros_audited_by` to `recipes`, expose them through an admin-only `PATCH /api/recipes/admin/{id}/audit` endpoint, and surface an instant-apply audit toggle plus an admin-only "✓ Audited" badge in the client.

**Spec:** `plan.md` in this folder.

**Notes for the executor:**
- `client/package.json` has **no `date-fns`** dependency (the `react-frontend` skill's stack list is out of date on this point). Format the audit timestamp with `toLocaleDateString()` — do **not** add a dependency.
- `client/package.json` also has no `vite-plugin-pwa` and no test runner. Do not bootstrap either; frontend verification here is `npm run build` plus a manual dev-server check.
- Hibernate runs `ddl-auto: validate`. Phase 1 must be applied to Railway MySQL **before** the backend is restarted or redeployed, or startup fails.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-07-29_recipe_macros_audit.sql` — adds the three audit columns, the index, and the FK to `users`.
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/RecipeServiceMacroAuditTest.java` — unit tests for set / clear / sticky-through-update.

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/Recipe.java:35-37` — three audit fields after `isLive`.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/RecipeAdminDTO.java:40` — response-only audit trio.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/RecipeDTO.java:19` — `macrosAudited` for the admin list badge.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeService.java:146,359,405,509,740` — DTO mapping, explicit unaudited on create, intentional-omission comment, new `updateRecipeMacrosAudit`.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/RecipeController.java:147` — new `PATCH /admin/{id}/audit` endpoint.
- `foodbytes-app/client/src/services/recipeService.js:111-114` — `updateRecipeMacrosAudit`.
- `foodbytes-app/client/src/components/admin/RecipeEditModal.jsx:146,259-265` — audit handler + prop wiring.
- `foodbytes-app/client/src/components/admin/RecipeInfoForm.jsx:8-17,41-52,200-232` — audit toggle group.
- `foodbytes-app/client/src/components/admin/RecipeInfoForm.css:97-119` — 44px touch target, `@media (hover: hover)`, disabled + focus-visible states.
- `foodbytes-app/client/src/components/recipes/RecipeCard.jsx:86` — admin-only audited badge.
- `foodbytes-app/client/src/components/recipes/RecipeCard.css:56` — `.audited-badge` style.

**Deleted:** (none)

---

## Phase 1 — Schema

Adds the three columns to the live database. This is a safe stopping point because the change is purely additive: Hibernate `validate` only checks that *mapped* entity columns exist, so unmapped extra columns cannot break the currently-deployed backend. Nothing reads the columns yet.

### Task 1: Migration file

- Skill: `java-backend` — owns the "schema change = date-prefixed migration file + entity change + manual Railway apply" rule.

**Files:**
- Create: `foodbytes-app/database/migrations/2026-07-29_recipe_macros_audit.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 2026-07-29 — Chef sign-off that a recipe's macros/calories have been validated.
-- Sibling of ingredients.macros_verified (FR-083), one level up: this asserts the
-- recipe's totals were checked, not that a single ingredient's per-100g data is good.
-- Sticky by design: no application code clears these columns automatically.
-- The only writer is PATCH /api/recipes/admin/{id}/audit.
ALTER TABLE recipes
    ADD COLUMN macros_audited    TINYINT(1) NOT NULL DEFAULT 0 AFTER is_live,
    ADD COLUMN macros_audited_at TIMESTAMP  NULL DEFAULT NULL   AFTER macros_audited,
    ADD COLUMN macros_audited_by BIGINT     NULL DEFAULT NULL   AFTER macros_audited_at;

ALTER TABLE recipes
    ADD INDEX idx_recipes_macros_audited (macros_audited),
    ADD CONSTRAINT fk_recipes_macros_audited_by
        FOREIGN KEY (macros_audited_by) REFERENCES users(id) ON DELETE SET NULL;
```

- [ ] **Step 2: Confirm the file is the newest migration and no earlier file already added these columns**

Run:
```bash
grep -rn "macros_audited" foodbytes-app/database/migrations/
```
Expected: hits only in `2026-07-29_recipe_macros_audit.sql`.

### Task 2: Apply the migration to Railway MySQL

- Skill: `java-backend` — the migration must be applied manually before any backend restart (`ddl-auto: validate`).

**Files:**
- (no source changes — applies Task 1's SQL to the live DB)

- [ ] **Step 1: Execute both ALTER statements against the Railway database**

Run the two `ALTER TABLE` statements from `foodbytes-app/database/migrations/2026-07-29_recipe_macros_audit.sql` via the `mysql` MCP server (`mcp__mysql__mysql_query`), one statement per call.
Expected: both succeed with no error.

- [ ] **Step 2: Verify the columns, index, and FK landed**

Run:
```sql
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'recipes'
  AND COLUMN_NAME LIKE 'macros_audited%'
ORDER BY ORDINAL_POSITION;
```
Expected: exactly 3 rows — `macros_audited` / `tinyint(1)` / `NO` / `0`; `macros_audited_at` / `timestamp` / `YES` / `NULL`; `macros_audited_by` / `bigint` / `YES` / `NULL`.

- [ ] **Step 3: Verify every existing recipe is explicitly unaudited**

Run:
```sql
SELECT COUNT(*) AS total,
       SUM(macros_audited = 0) AS unaudited,
       SUM(macros_audited IS NULL) AS nulls
FROM recipes;
```
Expected: `total = unaudited`, `nulls = 0`.

---

## Phase 2 — Backend

Maps the new columns onto the entity, exposes them read-only on the DTOs, and adds the single write path. Safe stopping point: `mvn test` is green and the API is fully functional with the new endpoint callable — the frontend simply doesn't use it yet. The `Recipe` entity change is only valid once Phase 1 is applied, which is why Phase 1 comes first.

### Task 3: `Recipe` entity audit fields

- Skill: `java-backend` — every new entity field needs a matching migration column and correct `@Column(name = …)`.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/Recipe.java:35-37`

- [ ] **Step 1: Add the three fields directly after `isLive`**

Insert after the `isLive` declaration (currently lines 35-36), before `@Column(name = "created_at")`:

```java
    @Column(name = "macros_audited", nullable = false)
    private Boolean macrosAudited = false;

    @Column(name = "macros_audited_at")
    private LocalDateTime macrosAuditedAt;

    /**
     * users.id of the admin who signed off the macros. Deliberately a plain FK column
     * rather than a @ManyToOne User: Recipe is mapped in list views and an extra lazy
     * association would risk an N+1 for a field the UI never renders.
     */
    @Column(name = "macros_audited_by")
    private Long macrosAuditedBy;
```

`java.time.LocalDateTime` is already imported (line 8) — no import change needed.

- [ ] **Step 2: Compile**

Run: `cd foodbytes-app/foodbytes-api && mvn -q compile`
Expected: BUILD SUCCESS, 0 errors.

### Task 4: DTO audit fields

- Skill: `java-backend` — controllers return DTOs, never entities; the audit trio must be response-only.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/RecipeAdminDTO.java:40`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/RecipeDTO.java:19`

- [ ] **Step 1: Add the response-only trio to `RecipeAdminDTO`**

Add `import java.time.LocalDateTime;` next to the existing `import java.util.List;`, then insert after the `isLive` field (line 40):

```java
    // Macro/calorie audit sign-off — RESPONSE ONLY.
    // RecipeService never reads these off an inbound DTO; the only writer is
    // PATCH /api/recipes/admin/{id}/audit. RecipeInfoForm saves a spread of the
    // whole loaded DTO, so reading them here would let a stale client payload
    // flip the flag as a side effect of an unrelated edit.
    private Boolean macrosAudited = false;

    private LocalDateTime macrosAuditedAt;   // null when not audited

    private Long macrosAuditedBy;            // users.id, null when not audited
```

- [ ] **Step 2: Add `macrosAudited` to `RecipeDTO`**

Insert after `private Boolean isCheat;` (line 19):

```java
    private Boolean macrosAudited;   // admin list badge (GET /api/recipes/admin)
```

- [ ] **Step 3: Compile**

Run: `cd foodbytes-app/foodbytes-api && mvn -q compile`
Expected: BUILD SUCCESS, 0 errors.

### Task 5: `RecipeService` — mapping, create default, and the single write path

- Skill: `java-backend` — business logic and `@Transactional` live in the service, not the controller.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeService.java:146,359,405,509,740`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/RecipeServiceMacroAuditTest.java`

- [ ] **Step 1: Add the `LocalDateTime` import**

Add after `import java.util.*;` (line 11):

```java
import java.time.LocalDateTime;
```

- [ ] **Step 2: Map the flag in `convertToDTO`**

In `convertToDTO`, insert immediately after `dto.setIsCheat(recipe.getIsCheat());` (line 146):

```java
        dto.setMacrosAudited(recipe.getMacrosAudited());
```

- [ ] **Step 3: Map the trio in `convertToRecipeAdminDTO`**

In `convertToRecipeAdminDTO`, insert immediately after `.isLive(recipe.getIsLive())` (line 740):

```java
                .macrosAudited(recipe.getMacrosAudited())
                .macrosAuditedAt(recipe.getMacrosAuditedAt())
                .macrosAuditedBy(recipe.getMacrosAuditedBy())
```

- [ ] **Step 4: New recipes start unaudited explicitly**

In `createRecipe`, insert immediately after `recipe.setIsLive(false);  // FR-047: New recipes always start hidden` (line 359):

```java
        recipe.setMacrosAudited(false);  // sign-off is always earned, never inherited
```

- [ ] **Step 5: Record the intentional omission in `updateRecipe`**

In `updateRecipe`, insert immediately after `recipe.setIsLive(dto.getIsLive() != null ? dto.getIsLive() : recipe.getIsLive());` (line 405):

```java
        // Audit fields are deliberately NOT mapped from the DTO here. The flag is
        // sticky and PATCH /api/recipes/admin/{id}/audit is its only writer — mapping
        // dto.getMacrosAudited() would let a stale client payload flip the sign-off.
```

- [ ] **Step 6: Add `updateRecipeMacrosAudit` after `updateRecipeVisibility`**

Insert after the closing brace of `updateRecipeVisibility` (line 509), before the `HELPER METHODS FOR ADMIN OPERATIONS` banner:

```java
    /**
     * Set or clear the chef's macro/calorie audit sign-off on a recipe.
     * Sticky: nothing else in the application clears this — only an explicit call here.
     * Clearing resets the timestamp and auditor too, so the columns never describe a
     * sign-off that is no longer in force.
     */
    @Transactional
    public RecipeAdminDTO updateRecipeMacrosAudit(Long id, boolean audited, Long auditedByUserId) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));

        recipe.setMacrosAudited(audited);
        recipe.setMacrosAuditedAt(audited ? LocalDateTime.now() : null);
        recipe.setMacrosAuditedBy(audited ? auditedByUserId : null);

        recipe = recipeRepository.save(recipe);

        return convertToRecipeAdminDTO(recipe);
    }
```

- [ ] **Step 7: Write the unit tests**

Create `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/RecipeServiceMacroAuditTest.java`:

```java
package com.foodbytes.service;

import com.foodbytes.dto.RecipeAdminDTO;
import com.foodbytes.model.Recipe;
import com.foodbytes.repository.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the recipe macro/calorie audit sign-off.
 * Covers set, clear, and the sticky invariant (a full recipe update must not
 * disturb the flag, because PATCH /admin/{id}/audit is its only writer).
 */
@ExtendWith(MockitoExtension.class)
class RecipeServiceMacroAuditTest {

    @Mock private RecipeRepository recipeRepository;
    @Mock private IngredientService ingredientService;
    @Mock private RecipeFamilyMemberRepository recipeFamilyMemberRepository;
    @Mock private RecipeExtrasService recipeExtrasService;
    @Mock private MacroCalculationService macroCalculationService;
    @Mock private IngredientRepository ingredientRepository;
    @Mock private UnitRepository unitRepository;
    @Mock private MealRepository mealRepository;
    @Mock private AisleRepository aisleRepository;
    @Mock private EntityManager entityManager;

    @InjectMocks private RecipeService recipeService;

    private Recipe recipe;

    @BeforeEach
    void setUp() {
        recipe = new Recipe();
        recipe.setId(42L);
        recipe.setName("Greek Chicken Pita Bowl");
        recipe.setDefaultServings(2);
        recipe.setCalories(1300);
        recipe.setIsCheat(false);
        recipe.setIsLive(true);
        recipe.setMacrosAudited(false);
    }

    @Test
    void markAudited_setsFlagTimestampAndAuditor() {
        when(recipeRepository.findById(42L)).thenReturn(Optional.of(recipe));
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(inv -> inv.getArgument(0));
        LocalDateTime before = LocalDateTime.now().minusSeconds(1);

        RecipeAdminDTO result = recipeService.updateRecipeMacrosAudit(42L, true, 7L);

        assertThat(recipe.getMacrosAudited()).isTrue();
        assertThat(recipe.getMacrosAuditedBy()).isEqualTo(7L);
        assertThat(recipe.getMacrosAuditedAt()).isAfter(before);
        assertThat(result.getMacrosAudited()).isTrue();
        assertThat(result.getMacrosAuditedBy()).isEqualTo(7L);
        assertThat(result.getMacrosAuditedAt()).isEqualTo(recipe.getMacrosAuditedAt());
    }

    @Test
    void unmarkAudited_clearsTimestampAndAuditor() {
        recipe.setMacrosAudited(true);
        recipe.setMacrosAuditedAt(LocalDateTime.of(2026, 7, 1, 9, 30));
        recipe.setMacrosAuditedBy(7L);
        when(recipeRepository.findById(42L)).thenReturn(Optional.of(recipe));
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(inv -> inv.getArgument(0));

        RecipeAdminDTO result = recipeService.updateRecipeMacrosAudit(42L, false, 7L);

        assertThat(recipe.getMacrosAudited()).isFalse();
        assertThat(recipe.getMacrosAuditedAt()).isNull();
        assertThat(recipe.getMacrosAuditedBy()).isNull();
        assertThat(result.getMacrosAudited()).isFalse();
        assertThat(result.getMacrosAuditedAt()).isNull();
        assertThat(result.getMacrosAuditedBy()).isNull();
    }

    @Test
    void updateRecipe_doesNotFlipAuditFlagFromInboundDto() {
        when(recipeRepository.findById(42L)).thenReturn(Optional.of(recipe));
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(inv -> inv.getArgument(0));

        RecipeAdminDTO dto = RecipeAdminDTO.builder()
                .name("Greek Chicken Pita Bowl")
                .defaultServings(2)
                .calories(1300)
                .isCheat(false)
                .isLive(false)
                .macrosAudited(true)          // hostile/stale client payload
                .macrosAuditedBy(99L)
                .macrosAuditedAt(LocalDateTime.of(2020, 1, 1, 0, 0))
                .mealTypes(new ArrayList<>())
                .ingredients(new ArrayList<>())
                .steps(new ArrayList<>())
                .build();

        recipeService.updateRecipe(42L, dto);

        assertThat(recipe.getMacrosAudited()).isFalse();
        assertThat(recipe.getMacrosAuditedAt()).isNull();
        assertThat(recipe.getMacrosAuditedBy()).isNull();
    }

    @Test
    void unknownRecipeId_throws() {
        when(recipeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> recipeService.updateRecipeMacrosAudit(999L, true, 7L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Recipe not found with id: 999");
    }
}
```

- [ ] **Step 8: Run the new tests**

Run: `cd foodbytes-app/foodbytes-api && mvn test -Dtest=RecipeServiceMacroAuditTest`
Expected: `Tests run: 4, Failures: 0, Errors: 0, Skipped: 0` and BUILD SUCCESS.

If `updateRecipe_doesNotFlipAuditFlagFromInboundDto` fails on an unnecessary-stubbing error, remove the stub Mockito reports as unused rather than loosening strictness — the empty `mealTypes` / `ingredients` / `steps` lists mean `addMealTypes`, `addIngredients`, and `addSteps` are all no-ops, so only `findById`, `save`, and `entityManager.flush()` should be exercised.

### Task 6: `RecipeController` audit endpoint

- Skill: `java-backend` — thin controller, `@PreAuthorize` on the mutating admin endpoint, identity from `@AuthenticationPrincipal`.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/RecipeController.java:147`

- [ ] **Step 1: Add the imports**

Add alongside the existing imports:

```java
import com.foodbytes.security.UserPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
```

- [ ] **Step 2: Add the endpoint after `updateVisibility`**

Insert after the closing brace of `updateVisibility` (line 147), before the `FR-086: RECIPE EXTRAS ENDPOINTS` banner:

```java
    @PatchMapping("/admin/{id}/audit")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Set macro audit sign-off (admin)",
            description = "Marks or unmarks a recipe as having had its macros and calories validated by the chef")
    public ResponseEntity<RecipeAdminDTO> updateMacrosAudit(
            @PathVariable Long id,
            @RequestParam boolean audited,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(
                recipeService.updateRecipeMacrosAudit(id, audited, userPrincipal.getId()));
    }
```

- [ ] **Step 3: Confirm the controller stays thin (no persistence calls in new code)**

Run:
```bash
grep -n "Repository\.\|EntityManager" foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/RecipeController.java
```
Expected: zero hits.

- [ ] **Step 4: Full backend test run**

Run: `cd foodbytes-app/foodbytes-api && mvn test`
Expected: BUILD SUCCESS, 0 failures, 0 errors (3 test classes: `AuthControllerLoginTest`, `ShoppingListServiceTest`, `RecipeServiceMacroAuditTest`).

---

## Phase 3 — Frontend

Wires the endpoint into the admin UI: the service call, the modal handler, the toggle, and the card badge. Safe stopping point: `npm run build` succeeds and the app renders for every user — non-admins see literally no change, because both new pieces of UI are gated behind `isAdmin` / `!isNew`.

### Task 7: `recipeService` audit call

- Skill: `react-frontend` — all API calls go through the shared Axios instance in `services/api.js`; no hardcoded backend URL.

**Files:**
- Modify: `foodbytes-app/client/src/services/recipeService.js:111-114`

- [ ] **Step 1: Add the method after `updateRecipeVisibility`**

Replace the `updateRecipeVisibility` method and the closing brace of the object (lines 111-115) with:

```js
  async updateRecipeVisibility(id, isLive) {
    const response = await api.patch(`/recipes/admin/${id}/visibility?isLive=${isLive}`)
    return response.data
  },

  /**
   * Set/clear the chef's macro + calorie audit sign-off (admin only).
   * Applies immediately — this is not part of the Recipe Info save payload.
   */
  async updateRecipeMacrosAudit(id, audited) {
    const response = await api.patch(`/recipes/admin/${id}/audit?audited=${audited}`)
    return response.data
  }
}
```

- [ ] **Step 2: Confirm no hardcoded backend URL was introduced**

Run:
```bash
grep -n "localhost:8080" foodbytes-app/client/src/services/recipeService.js
```
Expected: zero hits.

### Task 8: `RecipeEditModal` audit handler

- Skill: `react-frontend` — the modal owns `recipe` state and the save banner, so the service call belongs here, matching every other save in this component.

**Files:**
- Modify: `foodbytes-app/client/src/components/admin/RecipeEditModal.jsx:146,259-265`

- [ ] **Step 1: Add the handler after `handleFormSave`**

Insert immediately after the closing brace of `handleFormSave` (line 146), before `// Handle delete`:

```jsx
  // Instant-apply macro audit sign-off (not part of the Recipe Info save payload).
  const handleToggleMacrosAudit = async (audited) => {
    try {
      const savedRecipe = await recipeService.updateRecipeMacrosAudit(recipeId, audited)
      setRecipe(savedRecipe)
      setSaveMessage({
        type: 'success',
        text: audited ? 'Marked as audited.' : 'Audit mark removed.'
      })
      // Clear the banner but keep the form open — unlike handleFormSave, this does
      // not navigate back to the menu.
      setTimeout(() => setSaveMessage(null), 2000)

      if (onSave) {
        onSave(savedRecipe)
      }
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update audit status.'
      })
      console.error('Error updating audit status:', err)
    }
  }
```

- [ ] **Step 2: Pass the handler to `RecipeInfoForm`**

Replace the `<RecipeInfoForm …>` block (lines 259-265) with:

```jsx
              <RecipeInfoForm
                recipe={recipe}
                isNew={isNew}
                onSave={(data) => handleFormSave(data, 'Recipe info')}
                onCancel={handleBackToMenu}
                setHasUnsavedChanges={setHasUnsavedChanges}
                onToggleMacrosAudit={handleToggleMacrosAudit}
              />
```

- [ ] **Step 3: Build**

Run: `cd foodbytes-app/client && npm run build`
Expected: `built in …` with no errors (the new prop is unused until Task 9 — the build must still pass).

### Task 9: `RecipeInfoForm` audit toggle

- Skill: `react-frontend` — plain per-component CSS, ≥44px touch targets, `@media (hover: hover)`, ARIA on interactive controls.

**Files:**
- Modify: `foodbytes-app/client/src/components/admin/RecipeInfoForm.jsx:8-17,41-52,200-232`
- Modify: `foodbytes-app/client/src/components/admin/RecipeInfoForm.css:97-119`

- [ ] **Step 1: Accept the new prop and add local state**

Replace the signature and the state block (lines 8-17) with:

```jsx
function RecipeInfoForm({ recipe, isNew, onSave, onCancel, setHasUnsavedChanges, onToggleMacrosAudit }) {
  const [name, setName] = useState('')
  const [defaultServings, setDefaultServings] = useState(2)
  const [calories, setCalories] = useState(0)
  const [mealTypes, setMealTypes] = useState([])
  const [isCheat, setIsCheat] = useState(false)
  const [isExtra, setIsExtra] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  // Audit state is read straight off the server-owned `recipe` prop, never mirrored
  // into form state: the toggle applies immediately rather than on Save.
  const [isDirty, setIsDirty] = useState(false)
  const [auditSaving, setAuditSaving] = useState(false)

  const macrosAudited = recipe?.macrosAudited || false
  const macrosAuditedAt = recipe?.macrosAuditedAt || null
```

- [ ] **Step 2: Track dirtiness locally as well as upward**

In the change-tracking `useEffect` (lines 41-52), replace the final statement `setHasUnsavedChanges(hasChanges)` with:

```jsx
    setHasUnsavedChanges(hasChanges)
    setIsDirty(hasChanges)
```

- [ ] **Step 3: Add the audit handler after `handleSave`**

Insert immediately after the closing brace of `handleSave` (line 105):

```jsx
  // Instant-apply: signing off macros you haven't saved would be meaningless, so the
  // control is disabled while the form is dirty.
  const handleAuditToggle = async (audited) => {
    if (audited === macrosAudited || isDirty || auditSaving) return

    setAuditSaving(true)
    try {
      await onToggleMacrosAudit(audited)
    } finally {
      setAuditSaving(false)
    }
  }
```

- [ ] **Step 4: Render the toggle group after the Visibility block**

Insert between the closing `)}` of the Visibility block (line 226) and the `{isNew && (` info banner (line 228):

```jsx
      {/* Macro audit sign-off - only for existing recipes, applies immediately */}
      {!isNew && onToggleMacrosAudit && (
        <div className="form-group">
          <label>Macros Audited</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-button ${!macrosAudited ? 'active' : ''}`}
              onClick={() => handleAuditToggle(false)}
              disabled={isDirty || auditSaving}
              aria-pressed={!macrosAudited}
            >
              Not audited
            </button>
            <button
              type="button"
              className={`toggle-button ${macrosAudited ? 'active' : ''}`}
              onClick={() => handleAuditToggle(true)}
              disabled={isDirty || auditSaving}
              aria-pressed={macrosAudited}
            >
              ✓ Audited
            </button>
          </div>
          <p className="help-text">
            {isDirty
              ? 'Save your changes before marking the macros as audited.'
              : macrosAudited
                ? `Macros and calories signed off${macrosAuditedAt ? ` on ${new Date(macrosAuditedAt).toLocaleDateString()}` : ''}. Changes here apply immediately.`
                : 'Mark this once the macros and calories have been checked. Applies immediately — no need to Save.'}
          </p>
        </div>
      )}
```

- [ ] **Step 5: Fix the shared `.toggle-button` rule for touch and disabled states**

In `RecipeInfoForm.css`, replace the `.toggle-button` and `.toggle-button:hover:not(.active)` rules (lines 97-106 and 117-119) so the block reads:

```css
.toggle-button {
  padding: var(--spacing-sm) var(--spacing-lg);
  min-height: 44px;
  background: var(--bg-secondary);
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.toggle-button:first-child {
  border-right: 1px solid var(--border-color);
}

.toggle-button.active {
  background: var(--brand-primary);
  color: white;
}

.toggle-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-button:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: -2px;
}

/* Hover only on devices that actually hover - no sticky hover on touch */
@media (hover: hover) {
  .toggle-button:hover:not(.active):not(:disabled) {
    background: var(--border-color);
  }
}

.toggle-button:active:not(.active):not(:disabled) {
  background: var(--border-color);
}
```

- [ ] **Step 6: Confirm no bare `:hover` and no CSS module was introduced**

Run:
```bash
grep -n "toggle-button:hover" foodbytes-app/client/src/components/admin/RecipeInfoForm.css
```
Expected: exactly one hit, and it sits inside the `@media (hover: hover)` block.

- [ ] **Step 7: Build**

Run: `cd foodbytes-app/client && npm run build`
Expected: `built in …` with no errors.

### Task 10: `RecipeCard` audited badge

- Skill: `react-frontend` — admin features render conditionally on `isAdmin`; badge styling follows the existing `.cheat-badge` pattern.

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeCard.jsx:86`
- Modify: `foodbytes-app/client/src/components/recipes/RecipeCard.css:56`

- [ ] **Step 1: Render the badge beside the Cheat badge**

Insert immediately after `{recipe.isCheat && <span className="cheat-badge">Cheat</span>}` (line 86):

```jsx
        {isAdmin && recipe.macrosAudited && (
          <span className="audited-badge" title="Macros and calories signed off">✓ Audited</span>
        )}
```

- [ ] **Step 2: Add the badge style after `.cheat-badge`**

Insert after the closing brace of `.card-title-section .cheat-badge` (line 56):

```css
/* Admin-only macro audit badge in title section */
.card-title-section .audited-badge {
  background: rgba(34, 197, 94, 0.9);
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;
}
```

- [ ] **Step 3: Build**

Run: `cd foodbytes-app/client && npm run build`
Expected: `built in …` with no errors.

---

## Phase 4 — Final verification

No production changes. Confirms the cumulative work is consistent end-to-end and that the name chain DB → entity → DTO → JSON → React holds.

### Task 11: Grep audit for name-chain consistency

- Skill: none — verification only, no code edited.

- [ ] **Step 1: Confirm the DB column name appears only where a column name belongs**

Run:
```bash
grep -rn "macros_audited" foodbytes-app/database foodbytes-app/foodbytes-api/src/main/java
```
Expected: hits only in `database/migrations/2026-07-29_recipe_macros_audit.sql` and in the three `@Column(name = …)` annotations in `model/Recipe.java`. No `macros_audited` in any DTO, service, controller, or JS file.

- [ ] **Step 2: Confirm the camelCase identifier is spelled identically everywhere**

Run:
```bash
grep -rn "macrosAudited\|MacrosAudit" foodbytes-app/foodbytes-api/src foodbytes-app/client/src
```
Expected: only `macrosAudited`, `macrosAuditedAt`, `macrosAuditedBy`, `updateRecipeMacrosAudit`, `updateMacrosAudit`, and `handleToggleMacrosAudit` / `onToggleMacrosAudit` / `handleAuditToggle`. No `macroAudited`, no `macrosAudit` bare, no `auditedMacros`.

- [ ] **Step 3: Confirm the audit trio is never read off an inbound DTO**

Run:
```bash
grep -rn "getMacrosAudited\|getMacrosAuditedAt\|getMacrosAuditedBy" foodbytes-app/foodbytes-api/src/main/java
```
Expected: hits only inside `convertToRecipeAdminDTO` and `convertToDTO` in `RecipeService.java`, all of the form `recipe.getMacrosAudited…` (entity getters). Zero hits of the form `dto.getMacrosAudited…` in `createRecipe` or `updateRecipe`.

### Task 12: Full test suite and production build

- Skill: none — verification only.

- [ ] **Step 1: Clean backend test run**

Run: `cd foodbytes-app/foodbytes-api && mvn clean test`
Expected: BUILD SUCCESS, 0 failures, 0 errors.

- [ ] **Step 2: Frontend production build**

Run: `cd foodbytes-app/client && npm run build`
Expected: `built in …`, exit code 0, no errors.

### Task 13: Live smoke test of the endpoint

- Skill: none — verification only, but it does write one row's audit columns.

- [ ] **Step 1: Restart the backend so the entity change loads against the migrated schema**

Run: `docker-compose up -d --build api`
Expected: container starts; logs show `Started FoodbytesApiApplication` with no Hibernate `SchemaManagementException` (a schema validation error here means Phase 1 was not applied — apply it before retrying).

- [ ] **Step 2: Toggle audit on one recipe through the UI**

Log in as the admin/chef account, open any recipe → **Edit** → **Recipe Info**, click **✓ Audited**.
Expected: green "Marked as audited." banner; the toggle shows Audited with a sign-off date; closing the modal shows a green "✓ Audited" badge on that recipe's card.

- [ ] **Step 3: Confirm the row was written**

Run:
```sql
SELECT id, name, macros_audited, macros_audited_at, macros_audited_by
FROM recipes WHERE macros_audited = 1;
```
Expected: exactly the recipe toggled in Step 2, with a non-null timestamp and `macros_audited_by` equal to the chef's `users.id`.

- [ ] **Step 4: Confirm a full Recipe Info save does not disturb the flag (sticky invariant, live)**

In the same modal, make a real edit — bump **Default Servings** by 1 — click **Save**, then re-run the query from Step 3.
Expected: the row is still `macros_audited = 1` with the same `macros_audited_at` and `macros_audited_by`. Set servings back to its original value and Save again afterwards.

### Task 14: PR description

- Skill: none — documentation only.

- [ ] **Step 1: Write the PR description**

Include:
- Link to `.claude/contract/2026-07-29-recipe-macros-audit/plan.md`.
- Summary: three audit columns on `recipes`, one admin-only `PATCH /api/recipes/admin/{id}/audit` endpoint, instant-apply toggle in Recipe Info, admin-only badge on the recipe card.
- **Manual deploy step owed:** `database/migrations/2026-07-29_recipe_macros_audit.sql` must be applied to Railway MySQL before the backend redeploys (`ddl-auto: validate`).
- Smoke-test result from Task 13 (recipe id toggled, HTTP 200, badge rendered, sticky invariant held).
- Convention note for future contributors: the audit trio is **response-only** on `RecipeAdminDTO` and `PATCH /admin/{id}/audit` is its only writer — do not "complete" the field mapping in `updateRecipe`.
- Note that the new endpoint is `@PreAuthorize("hasRole('ADMIN')")` while its `/admin` siblings are only `authenticated()`, and that closing that pre-existing gap was left out of scope.

---

## Self-review

**Spec coverage:**
- DDL (three columns + index + FK, `NOT NULL DEFAULT 0`) — Tasks 1, 2.
- `Recipe` entity fields, plain `Long` FK not `@ManyToOne` — Task 3.
- Response-only audit trio on `RecipeAdminDTO`; `macrosAudited` on `RecipeDTO`; `RecipeSummaryDTO` untouched — Task 4.
- `updateRecipeMacrosAudit(id, audited, auditedByUserId)` service signature, set/clear semantics, explicit unaudited on create, intentional-omission comment in `updateRecipe` — Task 5.
- Sticky invariant tested (unit + live) — Task 5 Step 7, Task 13 Step 4.
- `PATCH /api/recipes/admin/{id}/audit?audited=` with `@PreAuthorize("hasRole('ADMIN')")` and `@AuthenticationPrincipal UserPrincipal` — Task 6.
- Frontend service call through shared Axios instance — Task 7.
- Instant-apply wiring in the modal (banner reused, form stays open) — Task 8.
- Toggle group disabled while dirty, timestamp rendered, `.toggle-button` 44px + `@media (hover: hover)` fix — Task 9.
- Admin-only `✓ Audited` badge — Task 10.
- Name-chain alignment audit from `plan.md` Part 1 — Task 11.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step carries either the exact code to write or a `Run:` / `Expected:` pair.

**Type / name consistency:** DB `macros_audited` / `macros_audited_at` / `macros_audited_by` ↔ entity `macrosAudited` (`Boolean`) / `macrosAuditedAt` (`LocalDateTime`) / `macrosAuditedBy` (`Long`) ↔ `RecipeAdminDTO` same three names and types ↔ `RecipeDTO.macrosAudited` (`Boolean`) ↔ JSON `macrosAudited` / `macrosAuditedAt` / `macrosAuditedBy` ↔ FE `recipe.macrosAudited` / `recipe.macrosAuditedAt`. Service method is `updateRecipeMacrosAudit` in every task that references it (Tasks 5, 6); controller method `updateMacrosAudit`; FE service method `updateRecipeMacrosAudit`; modal handler `handleToggleMacrosAudit` passed as prop `onToggleMacrosAudit` and invoked by `handleAuditToggle` in the form. Endpoint path is `/api/recipes/admin/{id}/audit?audited=` in Tasks 6, 7 and the design doc. Task 11 greps for exactly these spellings.

**Phase boundary cleanliness:**
- **Phase 1** — DB is widened only; Hibernate `validate` ignores unmapped columns, so the currently-deployed backend keeps starting. No code references the columns yet.
- **Phase 2** — entity, DTOs, service, controller land together and `mvn test` is green; the endpoint is callable and correct with no frontend consumer, which is a working state, not a half-applied one.
- **Phase 3** — each task ends with a green `npm run build`; both new UI pieces are gated on `isAdmin` / `!isNew`, so at any point in the phase non-admin users see an unchanged app.
- **Phase 4** — verification only; no production files change, so the boundary is trivially clean.
