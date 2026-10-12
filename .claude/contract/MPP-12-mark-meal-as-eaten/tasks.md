# Tasks: Mark a planned meal as eaten (shared across linked meal plans)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-12

**Goal:** One server-persisted eaten flag (+ UTC `eaten_at`) per meal-plan entry, ticked from the end of the recipe modal when opened from the meal plan, shown as a green ✓ on the calendar optimistically, shared across linked users via the owner's row.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-12-mpp12-meal-plan-entry-eaten.sql`: adds `eaten` + `eaten_at` to `meal_plan_entries`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanEntryEatenRequest.java`: PUT body `{ eaten }`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanEntryEatenDTO.java`: PUT response `{ id, eaten, eatenAt }`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/MealPlanControllerTest.java`: 200 / 403 / 404 mapping + `Instant` serialisation
- `foodbytes-app/client/src/constants/mealTypes.js`: `MEAL_TYPE_LABELS`
- `foodbytes-app/client/src/hooks/useEntryEaten.js`: optimistic set/rollback + `getEntryById`
- `foodbytes-app/client/src/components/recipes/RecipeStepsSection.jsx`: Instructions list moved out of `RecipeViewModal`
- `foodbytes-app/client/src/components/recipes/MealEatenSection.jsx`: the "Tuesday · Lunch" eaten section
- `foodbytes-app/client/src/components/recipes/MealEatenSection.css`: the eaten section styles

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanEntry.java`: `eaten`, `eatenAt` fields
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanEntryDTO.java`: `eaten`, `eatenAt` fields
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java`: `setEntryEaten`; `convertToDTO` copies eaten state
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/MealPlanController.java`: `PUT /{id}/eaten` + local validation handler
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java`: eaten tests
- `foodbytes-app/client/src/services/mealPlanService.js`: `setEntryEaten`
- `foodbytes-app/client/src/utils/dateUtils.js`: `formatLongWeekday`
- `foodbytes-app/client/src/contexts/MealPlanContext.jsx`: wire `useEntryEaten`, expose `setEntryEaten` / `getEntryById`
- `foodbytes-app/client/src/components/recipes/RecipeViewModal.jsx:354-396`: steps → `RecipeStepsSection`; `mealPlanEntry` prop + `MealEatenSection`
- `foodbytes-app/client/src/components/mealplan/MealPlanEntry.jsx`: `eaten` class + ✓ badge, pass `mealPlanEntry`
- `foodbytes-app/client/src/components/mealplan/MealPlanEntry.css`: eaten tint + badge
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md`: version bump

**Deleted:** (none)

---

## Phase 1 — Schema widening

Write the additive migration and have the developer apply it to Railway. Adding two defaulted/nullable columns is harmless to the currently deployed backend (`validate` ignores extra columns), so this boundary is safe: production keeps running and nothing in Java has changed yet.

### Task 1: Write the MPP-12 migration ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-12-mpp12-meal-plan-entry-eaten.sql`

- [x] **Step 1: Write the migration file**

```sql
-- MPP-12: mark a planned meal as eaten (one shared state per meal plan entry).
--
-- Adds two columns to meal_plan_entries:
--   eaten     TINYINT(1) NOT NULL DEFAULT 0 - one shared state per entry; linked users
--             (users.meal_plan_owner_id) read and write the owner's row, so both see it
--   eaten_at  TIMESTAMP NULL - UTC wall time the entry was first ticked; NULL when not eaten
--
-- Purely additive and lossless: no existing column or row changes, every existing row becomes
-- eaten = 0 / eaten_at = NULL (AC 8). Live counts at planning (2026-10-12): meal_plan_entries
-- 800 rows across 7 owners. No eaten_by column by design (ticket: no "ticked by").
--
-- MUST be applied to the Railway MySQL BEFORE the backend that maps these columns is deployed
-- (spring.jpa.hibernate.ddl-auto = validate fails startup otherwise). Safe to apply while the
-- current backend runs: validate ignores columns the entity does not map.

ALTER TABLE meal_plan_entries
  ADD COLUMN eaten    TINYINT(1) NOT NULL DEFAULT 0 AFTER servings,
  ADD COLUMN eaten_at TIMESTAMP  NULL     DEFAULT NULL AFTER eaten;
```

- [x] **Step 2: Copy it to Downloads for the developer**

Run: `Copy-Item foodbytes-app\database\migrations\2026-10-12-mpp12-meal-plan-entry-eaten.sql $env:USERPROFILE\Downloads\`
Expected: `Get-ChildItem $env:USERPROFILE\Downloads\2026-10-12-mpp12-meal-plan-entry-eaten.sql` lists the file.

### Task 2: Developer applies the migration to Railway — PENDING (developer; local dry run passed; must precede backend deploy)

- Skill: none (DBA operation against the live Railway MySQL; live writes are the developer's)

**Files:** (none; database only)

> **2026-10-12 — local dry run done; live apply still OUTSTANDING (deploy prerequisite).** The developer exported live (Workbench) and it was loaded into the local `foodbytes-db` container (20 tables, 800 entries / 7 owners). The migration applied cleanly there: `eaten tinyint(1) NO 0`, `eaten_at timestamp YES NULL`, 800 / 0 / 0. Phases 2+ proceed against the local DB. The Railway apply below MUST happen before the backend is pushed.

- [ ] **Step 1: Developer runs the migration**

The developer runs `Downloads\2026-10-12-mpp12-meal-plan-entry-eaten.sql` against the Railway MySQL. The executor **stops and waits** for confirmation and never runs the DDL itself.

- [ ] **Step 2: Verify read-only**

Run (mysql MCP): `SHOW COLUMNS FROM meal_plan_entries WHERE Field IN ('eaten','eaten_at')`
Expected: `eaten tinyint(1) NO default 0` and `eaten_at timestamp YES default NULL`.

Run (mysql MCP): `SELECT COUNT(*) AS total, SUM(eaten) AS eaten_rows, SUM(eaten_at IS NOT NULL) AS stamped FROM meal_plan_entries`
Expected: `total` ≥ 800, `eaten_rows = 0`, `stamped = 0`.

---

## Phase 2 — Backend eaten state + endpoint

Map the new columns, add the owner-aware set/clear service method with tests, and expose the PUT. The phase ends with `mvn -q compile` and both targeted test classes green. The entity now matches the live schema applied in Phase 1, so a deploy at this boundary starts cleanly.

### Task 3: Map `eaten` / `eatenAt` on `MealPlanEntry` ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanEntry.java` (after the `servings` field)

- [x] **Step 1: Add the fields**

Directly after `private BigDecimal servings = BigDecimal.ONE;`:

```java
    // MPP-12: one shared eaten state per entry (linked users write the owner's row)
    @Column(name = "eaten", nullable = false)
    private Boolean eaten = false;

    // MPP-12: UTC wall time of the first tick; null when not eaten
    @Column(name = "eaten_at")
    private LocalDateTime eatenAt;
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit 0, no errors.

### Task 4: Add the eaten DTOs and extend `MealPlanEntryDTO` ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanEntryEatenRequest.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanEntryEatenDTO.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanEntryDTO.java`

- [x] **Step 1: Request DTO**

```java
package com.foodbytes.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MPP-12: body of PUT /api/meal-plan/{id}/eaten. An explicit target state, not a toggle, so two
 * linked devices ticking at once converge instead of cancelling out.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanEntryEatenRequest {
    @NotNull(message = "eaten is required")
    private Boolean eaten;
}
```

- [x] **Step 2: Response DTO**

```java
package com.foodbytes.dto;

import java.time.Instant;

/**
 * MPP-12: response of PUT /api/meal-plan/{id}/eaten. Slim on purpose: the tick needs no recipe
 * summary or macro recomputation. eatenAt is UTC and serialises as ISO-8601 with a trailing Z.
 */
public record MealPlanEntryEatenDTO(Long id, boolean eaten, Instant eatenAt) {}
```

- [x] **Step 3: Extend `MealPlanEntryDTO`**

Add `import java.time.Instant;` and, after the `extraChoices` field:

```java
    private Boolean eaten;            // MPP-12: one shared state per entry
    private Instant eatenAt;          // MPP-12: null when not eaten; ISO-8601 UTC ("...Z")
```

`MealPlanEntryDTO` uses `@AllArgsConstructor`, so check for all-args call sites first:

Run: `Get-ChildItem -Path foodbytes-app\foodbytes-api\src -Recurse -Include *.java | Select-String -Pattern "new MealPlanEntryDTO\([^)]"`
Expected: zero hits (only the no-args `new MealPlanEntryDTO()` is used). Any hit must get the two new trailing arguments (`null, null`) in this task.

- [x] **Step 4: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit 0, no errors.

### Task 5: `MealPlanService.setEntryEaten` + eaten state on week entries ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java` (new method after `removeEntry`; `convertToDTO(entry, extraChoices)` tail)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java`

- [x] **Step 1: Write the failing tests**

Append a section to `MealPlanServiceTest`. Add imports `com.foodbytes.dto.MealPlanEntryEatenDTO`, `java.time.Instant`, `java.time.LocalDateTime`, `java.time.ZoneOffset`, `java.time.temporal.ChronoUnit`. Reuse the existing `user`, `meal`, `OWNER_ID`, `NEW_ENTRY_ID`, `recipeWithId`, `entryWithId`, `stubAssign`, `assignRequest`, `stubWeekMacros` helpers:

```java
    // ------------------------------------------------------------------
    // MPP-12: mark a planned meal as eaten
    // ------------------------------------------------------------------

    private static final Long ENTRY_ID = 812L;

    @Test
    void setEntryEaten_ownEntry_marksEatenWithUtcTimestamp() {
        MealPlanEntry entry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, USER_ID)).thenReturn(Optional.of(entry));

        Optional<MealPlanEntryEatenDTO> result = mealPlanService.setEntryEaten(USER_ID, ENTRY_ID, true);

        assertThat(result).isPresent();
        assertThat(result.get().eaten()).isTrue();
        assertThat(result.get().eatenAt()).isCloseTo(Instant.now(), within(5, ChronoUnit.SECONDS));
        assertThat(entry.getEaten()).isTrue();
        assertThat(entry.getEatenAt().toInstant(ZoneOffset.UTC)).isEqualTo(result.get().eatenAt());
    }

    @Test
    void setEntryEaten_alreadyEaten_keepsFirstTimestamp() {
        MealPlanEntry entry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        LocalDateTime first = LocalDateTime.of(2026, 10, 13, 12, 12, 4);
        entry.setEaten(true);
        entry.setEatenAt(first);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, USER_ID)).thenReturn(Optional.of(entry));

        MealPlanEntryEatenDTO result = mealPlanService.setEntryEaten(USER_ID, ENTRY_ID, true).orElseThrow();

        assertThat(entry.getEatenAt()).isEqualTo(first);
        assertThat(result.eatenAt()).isEqualTo(first.toInstant(ZoneOffset.UTC));
    }

    @Test
    void setEntryEaten_undo_clearsEatenAndTimestamp() {
        MealPlanEntry entry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        entry.setEaten(true);
        entry.setEatenAt(LocalDateTime.of(2026, 10, 13, 12, 12, 4));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, USER_ID)).thenReturn(Optional.of(entry));

        MealPlanEntryEatenDTO result = mealPlanService.setEntryEaten(USER_ID, ENTRY_ID, false).orElseThrow();

        assertThat(result.eaten()).isFalse();
        assertThat(result.eatenAt()).isNull();
        assertThat(entry.getEaten()).isFalse();
        assertThat(entry.getEatenAt()).isNull();
    }

    @Test
    void setEntryEaten_linkedUser_writesTheOwnersRow() {
        User linked = new User();
        linked.setId(2L);
        linked.setMealPlanOwnerId(OWNER_ID);
        MealPlanEntry ownersEntry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        when(userRepository.findById(2L)).thenReturn(Optional.of(linked));
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, OWNER_ID)).thenReturn(Optional.of(ownersEntry));

        Optional<MealPlanEntryEatenDTO> result = mealPlanService.setEntryEaten(2L, ENTRY_ID, true);

        assertThat(result).isPresent();
        assertThat(ownersEntry.getEaten()).isTrue();
        verify(mealPlanEntryRepository, never()).save(any(MealPlanEntry.class));
    }

    @Test
    void setEntryEaten_entryOutsideEffectivePlan_returnsEmpty() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByIdAndUserId(999L, USER_ID)).thenReturn(Optional.empty());

        assertThat(mealPlanService.setEntryEaten(USER_ID, 999L, true)).isEmpty();
    }

    @Test
    void assignRecipe_replacingAnEatenSlot_createsANotEatenEntry() {
        MealPlanEntry eatenEntry = entryWithId(10L, recipeWithId(38L), LocalDate.of(2026, 10, 12));
        eatenEntry.setEaten(true);
        eatenEntry.setEatenAt(LocalDateTime.of(2026, 10, 12, 12, 0));
        stubAssign(82L, eatenEntry);

        mealPlanService.assignRecipe(USER_ID, assignRequest(82L, Map.of()));

        verify(mealPlanEntryRepository).delete(eatenEntry);
        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getEaten()).isFalse();
        assertThat(entryCaptor.getValue().getEatenAt()).isNull();
    }

    @Test
    void getWeekPlan_exposesEatenStateOnEntries() {
        LocalDate start = LocalDate.of(2026, 10, 12);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        MealPlanEntry eatenEntry = entryWithId(10L, recipeWithId(82L), start);
        eatenEntry.setEaten(true);
        eatenEntry.setEatenAt(LocalDateTime.of(2026, 10, 12, 12, 12, 4));
        when(mealPlanEntryRepository.findByUserIdAndDateRange(USER_ID, start, start.plusDays(7)))
                .thenReturn(List.of(eatenEntry));
        when(extraChoiceService.getEntryChoices(List.of(10L))).thenReturn(Map.of());
        stubWeekMacros();

        MealPlanWeekDTO week = mealPlanService.getWeekPlan(USER_ID, start);

        MealPlanEntryDTO dto = week.getDays().get(0).getMealsByType().get("dinner").get(0);
        assertThat(dto.getEaten()).isTrue();
        assertThat(dto.getEatenAt()).isEqualTo(Instant.parse("2026-10-12T12:12:04Z"));
    }
```

Add `import static org.assertj.core.api.Assertions.within;`. `stubAssign` may need a lenient stub if Mockito strict stubs flag `isSameFamily` lookups on `recipeFamilyMemberRepository`. Mirror the existing `assignRecipe_differentFamilySwap_doesNotCarry` test's stubbing for the replaced-slot path (read it first) rather than inventing new stubs.

- [x] **Step 2: Run, and confirm they fail to compile or fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: compilation failure on `setEntryEaten` (method does not exist yet).

- [x] **Step 3: Implement `setEntryEaten`**

Add imports `java.time.LocalDateTime`, `java.time.ZoneOffset`, `java.time.Instant`. Insert after `removeEntry`:

```java
    /**
     * MPP-12: set or clear the eaten state of a meal plan entry.
     * The entry is looked up in the caller's effective plan (meal_plan_owner_id), so a linked user
     * writes the owner's row and both see one shared state (AC 6-7); an entry outside that plan is
     * "not found" (AC 9), exactly as removeEntry treats it.
     *
     * <p>Re-ticking an already-eaten entry keeps the first eatenAt, so a partner's second tick does
     * not move the time. eatenAt is stored as UTC wall time (the JDBC URL pins serverTimezone=UTC)
     * and exposed as an Instant.
     *
     * @return the new state, or empty when the entry is not in the caller's effective plan
     */
    @Transactional
    public Optional<MealPlanEntryEatenDTO> setEntryEaten(Long userId, Long entryId, boolean eaten) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
        return mealPlanEntryRepository.findByIdAndUserId(entryId, effectiveOwnerId)
            .map(entry -> {
                if (!eaten) {
                    entry.setEaten(false);
                    entry.setEatenAt(null);
                } else if (!Boolean.TRUE.equals(entry.getEaten())) {
                    entry.setEaten(true);
                    entry.setEatenAt(LocalDateTime.now(ZoneOffset.UTC));
                }
                return new MealPlanEntryEatenDTO(entry.getId(), Boolean.TRUE.equals(entry.getEaten()),
                    toUtcInstant(entry.getEatenAt()));
            });
    }

    /** MPP-12: eaten_at is UTC wall time; null stays null. */
    private static Instant toUtcInstant(LocalDateTime utcWallTime) {
        return utcWallTime == null ? null : utcWallTime.toInstant(ZoneOffset.UTC);
    }
```

(Dirty checking inside the transaction persists the change. No `save` call, which the linked-user test pins.)

- [x] **Step 4: Copy eaten state in `convertToDTO`**

In `convertToDTO(MealPlanEntry entry, Map<Long, Boolean> extraChoices)`, before `return dto;`:

```java
        dto.setEaten(Boolean.TRUE.equals(entry.getEaten()));
        dto.setEatenAt(toUtcInstant(entry.getEatenAt()));
```

- [x] **Step 5: Run the tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: `BUILD SUCCESS`, all tests pass (existing + 7 new), 0 failures.

### Task 6: `PUT /api/meal-plan/{id}/eaten` on `MealPlanController` ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/MealPlanController.java` (new endpoint after `removeEntry`; validation handler at end of class)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/MealPlanControllerTest.java`

- [x] **Step 1: Write the failing controller test**

Same style as `ShoppingListControllerTest` (no Spring context, direct method call):

```java
package com.foodbytes.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.foodbytes.dto.MealPlanEntryEatenDTO;
import com.foodbytes.dto.MealPlanEntryEatenRequest;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.MealPlanService;
import com.foodbytes.service.ShoppingListService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * MPP-12: PUT /api/meal-plan/{id}/eaten maps the service result onto HTTP. Not-in-your-plan is 404
 * (AC 9), unauthenticated is 403, and eatenAt serialises as ISO-8601 UTC so the browser can render
 * HH:MM in the viewer's local time.
 */
@ExtendWith(MockitoExtension.class)
class MealPlanControllerTest {

    // Configured like Spring Boot's default mapper (WRITE_DATES_AS_TIMESTAMPS off).
    private final ObjectMapper objectMapper = new ObjectMapper()
        .findAndRegisterModules()
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Mock private MealPlanService mealPlanService;
    @Mock private ShoppingListService shoppingListService;
    @Mock private UserPrincipal userPrincipal;

    @InjectMocks private MealPlanController controller;

    @Test
    void setEaten_returns200WithState() throws Exception {
        Instant at = Instant.parse("2026-10-12T12:12:04Z");
        when(userPrincipal.getId()).thenReturn(7L);
        when(mealPlanService.setEntryEaten(7L, 812L, true))
            .thenReturn(Optional.of(new MealPlanEntryEatenDTO(812L, true, at)));

        ResponseEntity<?> response = controller.setEaten(userPrincipal, 812L, new MealPlanEntryEatenRequest(true));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(objectMapper.writeValueAsString(response.getBody()))
            .isEqualTo("{\"id\":812,\"eaten\":true,\"eatenAt\":\"2026-10-12T12:12:04Z\"}");
    }

    @Test
    void setEaten_entryNotInPlan_returns404() {
        when(userPrincipal.getId()).thenReturn(7L);
        when(mealPlanService.setEntryEaten(7L, 999L, true)).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.setEaten(userPrincipal, 999L, new MealPlanEntryEatenRequest(true));

        assertThat(response.getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void setEaten_unauthenticated_returns403() {
        ResponseEntity<?> response = controller.setEaten(null, 812L, new MealPlanEntryEatenRequest(true));

        assertThat(response.getStatusCode().value()).isEqualTo(403);
        verifyNoInteractions(mealPlanService);
    }
}
```

- [x] **Step 2: Run, and confirm it fails**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanControllerTest`
Expected: compilation failure on `controller.setEaten`.

- [x] **Step 3: Implement the endpoint + validation handler**

Add imports `com.foodbytes.dto.MealPlanEntryEatenRequest` (already covered by `com.foodbytes.dto.*`) and `org.springframework.web.bind.MethodArgumentNotValidException`. After `removeEntry`:

```java
    /**
     * MPP-12: Mark a meal plan entry as eaten, or undo it.
     * PUT /api/meal-plan/{id}/eaten  body {"eaten": true|false}
     * One shared state per entry: a linked user (meal_plan_owner_id) writes the owner's row.
     *
     * @return 200 with {id, eaten, eatenAt}; 404 if the entry is not in the caller's plan
     */
    @PutMapping("/{id}/eaten")
    public ResponseEntity<?> setEaten(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody MealPlanEntryEatenRequest request) {

        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required to modify meal plan"));
        }

        return mealPlanService.setEntryEaten(userPrincipal.getId(), id, request.getEaten())
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
```

At the end of the class (copied from `UserController.handleValidation`):

```java
    /**
     * There is no @ControllerAdvice in this codebase. Shapes @Valid failures as {error} so the
     * frontend can surface the message instead of Spring's default {timestamp,status,error,path}.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
```

- [x] **Step 4: Run the controller and service tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanControllerTest+MealPlanServiceTest`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

- [x] **Step 5: Confirm the controller holds no JPA**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\controller\MealPlanController.java -Pattern "Repository|EntityManager"`
Expected: zero hits.

---

## Phase 3 — Frontend data layer

Add the API call, the label/date helpers, and the optimistic hook, and wire them into `MealPlanContext`. Nothing renders the new state yet, so the UI is unchanged and the build stays green: a safe stopping point.

### Task 7: `mealPlanService.setEntryEaten` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/services/mealPlanService.js` (after `removeEntry`)

- [x] **Step 1: Add the method**

```js
  /**
   * MPP-12: Mark a meal plan entry as eaten, or undo it. One shared state per entry,
   * so a linked user's tick is the owner's tick.
   * @param {number} entryId - Entry ID
   * @param {boolean} eaten - Target state (explicit, not a toggle)
   * @returns {Promise<{id: number, eaten: boolean, eatenAt: string|null}>} eatenAt is ISO-8601 UTC
   */
  async setEntryEaten(entryId, eaten) {
    const response = await api.put(`/meal-plan/${entryId}/eaten`, { eaten })
    return response.data
  },
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 8: `MEAL_TYPE_LABELS` + `formatLongWeekday` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/mealTypes.js`
- Modify: `foodbytes-app/client/src/utils/dateUtils.js` (after `getShortDayName`)

- [x] **Step 1: Create the constant**

```js
// MPP-12: display labels for meal-plan meal types (keys match MealPlanEntryDTO.mealType).
export const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
  extras: 'Extras'
}
```

- [x] **Step 2: Add `formatLongWeekday`**

```js
/**
 * Get full day name (Monday, Tuesday, etc.)
 * @param {Date|string} date
 * @returns {string}
 */
export const formatLongWeekday = (date) => {
  const d = typeof date === 'string' ? parseISODate(date) : date
  return d.toLocaleDateString('en-US', { weekday: 'long' })
}
```

- [x] **Step 3: Smoke-check the helper**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {formatLongWeekday} from './src/utils/dateUtils.js'; console.log(formatLongWeekday('2026-10-13'))"`
Expected: `Tuesday`

### Task 9: `useEntryEaten` hook + `MealPlanContext` wiring ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useEntryEaten.js`
- Modify: `foodbytes-app/client/src/contexts/MealPlanContext.jsx` (import; hook call after the `assignmentError` state; two keys in `value`)

- [x] **Step 1: Create the hook**

```js
import { useCallback } from 'react'
import mealPlanService from '../services/mealPlanService'

const EATEN_ERROR_MESSAGE = "Couldn't update eaten status. Please try again."
const ERROR_TOAST_MS = 3000

/**
 * MPP-12: optimistic eaten tick for MealPlanContext. Lives outside the context file because the
 * context is already over the 400-line budget. Rollback is per entry, so a failure cannot undo
 * an unrelated concurrent change (swap/assign) elsewhere in the week.
 * useCallback matches every other function MealPlanContext exposes in `value`.
 */
export function useEntryEaten({ weekPlan, setWeekPlan, setAssignmentError }) {
  const getEntryById = useCallback((entryId) => findEntry(weekPlan, entryId), [weekPlan])

  const setEntryEaten = useCallback(async (entryId, eaten) => {
    const previous = findEntry(weekPlan, entryId)
    if (!previous) throw new Error('Meal plan entry not found')

    const rollback = { eaten: previous.eaten === true, eatenAt: previous.eatenAt ?? null }
    // Re-tick keeps the first time (mirrors the server); undo clears it.
    const provisionalEatenAt = eaten ? (previous.eatenAt ?? new Date().toISOString()) : null
    setWeekPlan(plan => patchEntry(plan, entryId, { eaten, eatenAt: provisionalEatenAt }))

    try {
      const saved = await mealPlanService.setEntryEaten(entryId, eaten)
      setWeekPlan(plan => patchEntry(plan, entryId, { eaten: saved.eaten, eatenAt: saved.eatenAt }))
    } catch (err) {
      setWeekPlan(plan => patchEntry(plan, entryId, rollback))
      setAssignmentError(err.response?.data?.error || EATEN_ERROR_MESSAGE)
      setTimeout(() => setAssignmentError(null), ERROR_TOAST_MS)
      throw err
    }
  }, [weekPlan, setWeekPlan, setAssignmentError])

  return { setEntryEaten, getEntryById }
}

const findEntry = (weekPlan, entryId) => {
  for (const day of weekPlan?.days || []) {
    for (const entries of Object.values(day.mealsByType || {})) {
      const match = entries.find(e => e.id === entryId)
      if (match) return match
    }
  }
  return null
}

const patchEntry = (weekPlan, entryId, fields) => {
  if (!weekPlan?.days) return weekPlan
  return {
    ...weekPlan,
    days: weekPlan.days.map(day => ({
      ...day,
      mealsByType: Object.fromEntries(
        Object.entries(day.mealsByType || {}).map(([type, entries]) => [
          type,
          entries.map(e => (e.id === entryId ? { ...e, ...fields } : e))
        ])
      )
    }))
  }
}

export default useEntryEaten
```

- [x] **Step 2: Wire it into `MealPlanProvider`**

In `MealPlanContext.jsx`: add `import { useEntryEaten } from '../hooks/useEntryEaten'` with the other imports. Directly after `const [assignmentError, setAssignmentError] = useState(null)`:

```js
  // MPP-12: eaten tick (optimistic, per-entry rollback) - logic lives in the hook
  const { setEntryEaten, getEntryById } = useEntryEaten({ weekPlan, setWeekPlan, setAssignmentError })
```

In `const value = { … }`, after `copyWeek,`:

```js
    setEntryEaten,
    getEntryById,
```

- [x] **Step 3: Measure the context and build**

Run: `cd foodbytes-app\client; (Get-Content src\contexts\MealPlanContext.jsx | Measure-Object -Line).Lines; (Get-Content src\hooks\useEntryEaten.js | Measure-Object -Line).Lines; npm run build`
Expected: the context grows by ≤ 8 lines from its 559 baseline (known debt, not grown materially), the hook is < 100 lines, and the build prints `built in <n>s` with no errors.

---

## Phase 4 — Frontend UI

Split the Instructions list out of the modal, add the eaten section, and show the ✓ on the calendar. The modal split goes first and is behaviour-neutral, so the build is green and the app unchanged after Task 10. Tasks 11–13 then add the feature, and Task 14 is the manual end-to-end check.

### Task 10: Extract `RecipeStepsSection` from `RecipeViewModal` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/recipes/RecipeStepsSection.jsx`
- Modify: `foodbytes-app/client/src/components/recipes/RecipeViewModal.jsx:354-396`

- [x] **Step 1: Create the component (verbatim move of the steps `<section>`)**

```jsx
/**
 * FR-091: Instructions list for RecipeViewModal. Linked steps render as a clickable link when the
 * linked recipe is homemade; store-bought shows the step's altInstruction as plain text.
 * Moved out of RecipeViewModal (MPP-12) to keep the modal under the 400-line budget.
 * Styles stay in RecipeViewModal.css (.steps-section, .steps-list, .step-item, .linked-step-button).
 */
function RecipeStepsSection({ steps, isHomemade, onLinkedStepClick }) {
  return (
    <section className="steps-section">
      <h3>Instructions</h3>
      {steps && steps.length > 0 ? (
        <ol className="steps-list">
          {steps.map((step, idx) => {
            // Handle both old format (string) and new format (object)
            const stepObj = typeof step === 'string'
              ? { instruction: step }
              : step

            // FR-091: Determine what to display based on linked recipe state
            const hasLink = stepObj.linkedRecipeId != null
            const homemade = hasLink ? isHomemade(stepObj.linkedRecipeId) : true

            // Show alt instruction if linked and store-bought
            const displayText = hasLink && !homemade && stepObj.altInstruction
              ? stepObj.altInstruction
              : stepObj.instruction

            return (
              <li key={idx} className="step-item">
                {hasLink && homemade ? (
                  // Linked and homemade - show as clickable link
                  <button
                    className="linked-step-button"
                    onClick={() => onLinkedStepClick(stepObj.linkedRecipeId)}
                    title={`View ${stepObj.linkedRecipeName} recipe`}
                  >
                    {displayText}
                  </button>
                ) : (
                  // No link or store-bought - show as plain text
                  <span>{displayText}</span>
                )}
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="no-content">No instructions listed</p>
      )}
    </section>
  )
}

export default RecipeStepsSection
```

- [x] **Step 2: Replace lines 354–396 in `RecipeViewModal.jsx`**

Add `import RecipeStepsSection from './RecipeStepsSection'` after the `MacroBadgeRow` import. Replace the whole `{/* Steps - FR-091: Handle linked steps */}` … closing `</section>` block with:

```jsx
              {/* Steps - FR-091: Handle linked steps */}
              <RecipeStepsSection
                steps={fullRecipe?.steps}
                isHomemade={isHomemade}
                onLinkedStepClick={handleLinkedStepClick}
              />
```

- [x] **Step 3: Measure and build**

Run: `cd foodbytes-app\client; (Get-Content src\components\recipes\RecipeViewModal.jsx | Measure-Object -Line).Lines; npm run build`
Expected: the modal is ≈ 369 lines (< 400), and the build prints `built in <n>s` with no errors.

### Task 11: `MealEatenSection` component + CSS ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/recipes/MealEatenSection.jsx`
- Create: `foodbytes-app/client/src/components/recipes/MealEatenSection.css`

- [x] **Step 1: Create the component**

```jsx
import { useState } from 'react'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { MEAL_TYPE_LABELS } from '../../constants/mealTypes'
import { formatLongWeekday } from '../../utils/dateUtils'
import './MealEatenSection.css'

const SAVE_ERROR = "Couldn't save — try again."

/**
 * MPP-12: end-of-recipe "Mark as eaten" section, rendered by RecipeViewModal only when it was
 * opened from a meal-plan entry. Reads the entry live from MealPlanContext so the optimistic
 * flip, the server reconcile and any rollback all show while the modal stays open (AC 3).
 * One shared state per entry - no "ticked by" (AC 6). Once eaten, a second tap does nothing;
 * Undo is the link in the meta line (approved mockup).
 */
function MealEatenSection({ entryId }) {
  const { getEntryById, setEntryEaten } = useMealPlan()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const entry = getEntryById(entryId)
  if (!entry) return null

  const eaten = entry.eaten === true
  const headingId = `eaten-slot-${entryId}`
  const slotLabel = `${formatLongWeekday(entry.planDate)} · ${MEAL_TYPE_LABELS[entry.mealType] ?? entry.mealType}`

  const save = async (next) => {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      await setEntryEaten(entryId, next)
    } catch {
      // The context already rolled back and raised the toast; the toast can sit behind
      // this full-screen modal, so repeat the failure inline.
      setError(SAVE_ERROR)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="eaten-section" aria-labelledby={headingId}>
      <h3 id={headingId} className="eaten-slot">{slotLabel}</h3>
      <button
        type="button"
        className={`eaten-btn ${eaten ? 'on' : ''}`}
        onClick={() => { if (!eaten) save(true) }}
        disabled={saving}
        aria-pressed={eaten}
      >
        <span className="eaten-tick" aria-hidden="true">{eaten ? '✓' : ''}</span>
        <span>{eaten ? 'Eaten' : 'Mark as eaten'}</span>
      </button>
      <p className="eaten-meta" aria-live="polite">
        {error ? (
          <span className="eaten-error">{error}</span>
        ) : eaten ? (
          <>
            Eaten at {formatEatenTime(entry.eatenAt)} ·{' '}
            <button type="button" className="eaten-undo" onClick={() => save(false)} disabled={saving}>
              Undo
            </button>
          </>
        ) : null}
      </p>
    </section>
  )
}

// HH:MM in the viewer's local time; eatenAt is ISO-8601 UTC from the API.
const formatEatenTime = (iso) => (
  iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
)

export default MealEatenSection
```

- [x] **Step 2: Create the CSS (mobile-first, from the approved mockup)**

```css
/* MPP-12: end-of-recipe eaten section (approved pet-mockup.html, phone 2) */

.eaten-section {
  border-top: 2px solid var(--brand-primary);
  padding-top: 16px;
  margin-top: 8px;
}

.eaten-slot {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 8px 0;
}

.eaten-btn {
  width: 100%;
  min-height: 52px;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--bg-primary);
  color: var(--success);
  border: 2px solid var(--success);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.eaten-btn.on {
  background: var(--success);
  color: #fff;
  cursor: default;
}

.eaten-btn:disabled {
  opacity: 0.7;
}

.eaten-btn:active:not(.on):not(:disabled) {
  background: rgba(40, 167, 69, 0.1);
}

@media (hover: hover) {
  .eaten-btn:hover:not(.on):not(:disabled) {
    background: rgba(40, 167, 69, 0.1);
  }
}

.eaten-btn:focus-visible,
.eaten-undo:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

.eaten-tick {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.eaten-meta {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 8px 0 0 0;
  min-height: 44px; /* reserves the Undo row so ticking does not shift the layout */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* Visual is a text link; hit area expanded to 44x44 */
.eaten-undo {
  background: none;
  border: none;
  color: var(--brand-primary);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  min-width: 44px;
  min-height: 44px;
  padding: 0 8px;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.eaten-undo:disabled {
  opacity: 0.6;
  cursor: default;
}

.eaten-error {
  color: var(--error, #dc3545);
  font-weight: 600;
}
```

- [x] **Step 3: Measure and build**

Run: `cd foodbytes-app\client; (Get-Content src\components\recipes\MealEatenSection.jsx | Measure-Object -Line).Lines; npm run build`
Expected: < 100 lines, and `built in <n>s` with no errors.

### Task 12: Render `MealEatenSection` from `RecipeViewModal` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeViewModal.jsx` (props list, imports, after `<RecipeStepsSection … />`)

- [x] **Step 1: Add the prop and the section**

Import: `import MealEatenSection from './MealEatenSection'`. In the destructured props, after `extraChoices = null    // MPP-10: a planned meal's own choices`:

```jsx
  extraChoices = null,   // MPP-10: a planned meal's own choices
  mealPlanEntry = null   // MPP-12: set only when opened from the meal plan → shows the eaten section
```

(Add the trailing comma to the `extraChoices` line.) Directly after the `<RecipeStepsSection … />` element, still inside the fragment:

```jsx
              {/* MPP-12: eaten tick - meal-plan entry only, on the planned dish (not a linked sub-recipe) */}
              {mealPlanEntry && !canGoBack && <MealEatenSection entryId={mealPlanEntry.id} />}
```

- [x] **Step 2: Confirm no other caller passes the prop**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.jsx | Select-String -Pattern "mealPlanEntry="`
Expected: exactly one hit after Task 13 (`MealPlanEntry.jsx`); none in `RecipeCard.jsx` / `RecipeList.jsx` / `SearchView.jsx`.

- [x] **Step 3: Measure and build**

Run: `cd foodbytes-app\client; (Get-Content src\components\recipes\RecipeViewModal.jsx | Measure-Object -Line).Lines; npm run build`
Expected: < 400 lines (≈ 374), and `built in <n>s` with no errors.

### Task 13: Eaten tint + ✓ badge on `MealPlanEntry`, pass the entry to the modal ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanEntry.jsx:63-96,116-132`
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanEntry.css`

- [x] **Step 1: Class, badge, prop**

Root div className becomes:

```jsx
        className={`meal-plan-entry ${removing ? 'removing' : ''} ${entry.eaten ? 'eaten' : ''}`}
```

Directly after the `hasStoreBought` cart `<span>` block, before the remove button:

```jsx
        {entry.eaten && (
          <span className="entry-eaten" role="img" aria-label="Eaten" title="Eaten">✓</span>
        )}
```

In the `<RecipeViewModal …>` props, after `extraChoices={entry.extraChoices}`:

```jsx
          mealPlanEntry={entry}
```

- [x] **Step 2: CSS (after the `.entry-store-bought` rule)**

```css
/* MPP-12: eaten meal - green tint + ✓ badge (approved pet-mockup.html) */
.meal-plan-entry.eaten {
  background-color: rgba(40, 167, 69, 0.1);
}

.meal-plan-entry.eaten .recipe-name {
  color: #1b6b2e;
}

@media (hover: hover) {
  .meal-plan-entry.eaten:hover {
    background-color: rgba(40, 167, 69, 0.16);
  }
}

.entry-eaten {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--success);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
```

The `.meal-plan-entry.eaten` rule must come after `.meal-plan-entry:hover` so the tint wins on desktop. The `@media (hover: hover)` override then gives eaten entries their own hover.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 14: Manual end-to-end check — PENDING (developer; Ready for Test)

- Skill: react-frontend

**Files:** (none; verification only)

- [ ] **Step 1: Run the stack locally against the migrated DB**

Run: `cd foodbytes-app\foodbytes-api; mvn spring-boot:run` (with Railway DB env vars), and in a second shell `cd foodbytes-app\client; npm run dev`
Expected: the backend starts with no `Schema-validation` error, and Vite serves on `http://localhost:5173`.

- [ ] **Step 2: Walk the ACs at 375px width (DevTools device mode) and at desktop width**

Logged in, on `/mealplan`:
1. Tap a lunch entry. The modal opens. Scroll to the end, past Instructions: the heading reads e.g. "TUESDAY · LUNCH" (uppercase via CSS) with an outlined green "Mark as eaten" button (AC 1).
2. Tap it. The button turns solid green and reads "Eaten" with a ✓. The meta line reads "Eaten at HH:MM · Undo" in local time. The modal stays open (AC 3).
3. Tap the green button again. Nothing changes. Tap Undo, and it returns to "Mark as eaten" (AC 3).
4. Tick again, close the modal. The entry is green-tinted with a ✓ badge, with no reload (AC 4).
5. Reload the page. It's still eaten. Open the same week in a second browser profile. It's eaten there too (AC 5).
6. Tap a linked step (e.g. pita) inside the modal. The eaten section is hidden on the sub-recipe and returns on Back.
7. Linked steps still navigate, and a store-bought extra still shows its alt instruction (Task 10 regression check).
8. Open the same recipe from `/search` (Recipes tab). No eaten section (AC 2).
9. Replace the eaten slot with another recipe via the Recipes tab day buttons. The new entry is not eaten.
10. DevTools → Network → offline, then tap Mark as eaten. It flips, then rolls back with "Couldn't save — try again." inline.
11. The Undo link and the button are at least 44px tall (DevTools element box).

- [ ] **Step 3: Shared plan (AC 6–7), if a linked test account is available**

As the linked user (the `meal_plan_owner_id` set), tick an entry. As the owner, reload: it's eaten. Undo as the owner, reload as the linked user: it's not eaten. Optionally verify via the mysql MCP: `SELECT id, eaten, eaten_at FROM meal_plan_entries WHERE id = <entryId>` shows a single row changing. If no linked account is available, say so in the final report. The service test `setEntryEaten_linkedUser_writesTheOwnersRow` is the automated cover.

---

## Phase 5 — Final verification

The closing phase. No production changes beyond the version bump, only sanity-checks that the cumulative work is clean.

### Task 15: Bump version + CHANGELOG ✓

- Skill: none (release bookkeeping per `CLAUDE.md` → Versioning & deploy verification)

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-12 is a **Story** → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-12: Mark a planned meal as eaten from the recipe (shared across linked meal plans)`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 16: Grep for stale references and debt ✓

- Skill: none (verification only)

**Files:** (none)

- [x] **Step 1: No new `console.log` / `console.debug`**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)"`
Expected: no hits in any file this contract created or modified (pre-existing baseline hits in `services/api.js`, `hooks/useWakeLock.js` and `mealplan/MealPlanEntry.jsx` may remain, but their count must not rise).

- [x] **Step 2: Steps markup lives in one place**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.jsx | Select-String -Pattern "className=\"steps-list\""`
Expected: exactly one hit, in `RecipeStepsSection.jsx`.

- [x] **Step 3: No `.module.css`, no `.ts`/`.tsx`, no hardcoded backend URL**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.module.css,*.ts,*.tsx; Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "localhost:8080"`
Expected: zero results for both.

### Task 17: Run the full backend test suite ✓

- Skill: none (verification only)

**Files:** (none)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 18: Production build ✓

- Skill: none (verification only)

**Files:** (none)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 19: Write the PR description ✓

- Skill: none (documentation)

**Files:**
- Create: `.claude/contract/MPP-12-mark-meal-as-eaten/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary: `eaten` / `eaten_at` on `meal_plan_entries`, `PUT /api/meal-plan/{id}/eaten` (owner-aware, 404 when not in your plan), eaten section at the end of `RecipeViewModal` when opened from the meal plan, ✓ badge + green tint on `MealPlanEntry`, `RecipeStepsSection` split. Include the new version from Task 15.
- Migration: `2026-10-12-mpp12-meal-plan-entry-eaten.sql` must be applied to Railway **before** the backend deploys (it was applied in Task 2, so state that and the verification output).
- Verification: `mvn test` result, `npm run build` result, `check:version`, and the Task 14 manual checklist outcomes, including whether the shared-plan check was done live or covered by the unit test only.
- Note for future contributors: meal-plan entry state that must be shared across linked users belongs on the `meal_plan_entries` row (resolved via the effective owner), and meal-type display labels now live in `src/constants/mealTypes.js`.
- Suggested commit subject: `MPP-12: Mark a planned meal as eaten (shared across linked meal plans)`

---

## Self-review

**Spec coverage:**
- Migration adding `eaten` / `eaten_at`, hand-applied: Tasks 1, 2.
- Entity + `MealPlanEntryDTO` exposes eaten state on week entries: Tasks 3, 4, 5 (Step 4).
- `PUT /api/meal-plan/{id}/eaten`, owner-aware, 403/404/400: Tasks 4, 5, 6.
- Service tests (own, linked owner row, foreign → empty, re-tick keeps time, undo clears, replacement clears, week exposes): Task 5. Controller mapping + `Instant` JSON: Task 6.
- `mealPlanService.setEntryEaten`: Task 7. Optimistic `setEntryEaten` via `MealPlanContext`: Task 9.
- `MealEatenSection` at the end of `RecipeViewModal`, only from the meal plan: Tasks 8, 11, 12.
- ✓ badge + green tint on `MealPlanEntry`: Task 13.
- `RecipeStepsSection` split for the 400-line budget: Task 10.
- Version bump + CHANGELOG: Task 15. ACs 1–9 manually walked: Task 14.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows exact code or a runnable command with Expected. Task 15's version number is computed at apply time by design.

**Type / name consistency:** `eaten` / `eaten_at` (DB) ↔ `eaten` / `eatenAt` (entity, `LocalDateTime`) ↔ `MealPlanEntryDTO.eaten` / `eatenAt` (`Instant`) ↔ `MealPlanEntryEatenDTO(id, eaten, eatenAt)` ↔ JSON `eaten` / `eatenAt` ↔ `entry.eaten` / `entry.eatenAt` in JS. `MealPlanService.setEntryEaten(Long, Long, boolean)` → `Optional<MealPlanEntryEatenDTO>`. `MealPlanController.setEaten(UserPrincipal, Long, MealPlanEntryEatenRequest)`. JS: `mealPlanService.setEntryEaten(entryId, eaten)`, `useEntryEaten({ weekPlan, setWeekPlan, setAssignmentError })` → `{ setEntryEaten, getEntryById }`, `MEAL_TYPE_LABELS`, `formatLongWeekday`, `MealEatenSection({ entryId })`, `RecipeStepsSection({ steps, isHomemade, onLinkedStepClick })`, `RecipeViewModal` prop `mealPlanEntry`. CSS: `.eaten-section`, `.eaten-slot`, `.eaten-btn(.on)`, `.eaten-tick`, `.eaten-meta`, `.eaten-undo`, `.eaten-error`, `.meal-plan-entry.eaten`, `.entry-eaten`. All are used identically across tasks.

**Phase boundary cleanliness:**
- Phase 1: additive columns only, and the deployed backend is unaffected (`validate` ignores unmapped columns).
- Phase 2: the entity matches the live schema; `mvn -q compile` and both targeted test classes are green; the endpoint is reachable but unused by the UI.
- Phase 3: the context exposes new functions nobody calls yet; `npm run build` is green and the UI is unchanged.
- Phase 4: Task 10 is behaviour-neutral on its own; Tasks 11–13 complete the feature; the build is green after each task.
- Phase 5: bookkeeping and verification only.
