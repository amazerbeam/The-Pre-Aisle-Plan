# Tasks: Shopping list honours homemade / store-bought selections

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-05

**Goal:** The Generate Shopping List modal sends the user's saved homemade / store-bought selections, so a store-bought extra lists its store-bought product instead of the homemade sub-recipe's raw ingredients. Backend tests pin that contract.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/dto/GenerateShoppingListRequestTest.java` — pins that string JSON keys deserialise to `Map<Long, Map<Long, Boolean>>`.
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/ShoppingListControllerTest.java` — pins that `POST /generate` forwards selections to `PersistedShoppingListService`.

**Modified:**
- `foodbytes-app/client/src/components/shopping/GenerateShoppingListModal.jsx:1-33` — read `selections` from `useHomemadeSelections()` and pass it to `generateShoppingList`.
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java:412` (after `extraWithNoMatchingLinkedIngredientRow_SkipsProrationDefensively`) — three store-bought / homemade selection cases.

**Deleted:** (none)

---

## Phase 1 — Backend contract tests

These tests only; no production Java changes. They pass against today's backend, because the backend already honours selections. Together they lock in the contract that Phase 2's frontend fix depends on. The suite stays green, so this is a safe stopping point.

### Task 1: Pin string-key deserialisation of GenerateShoppingListRequest ✓

- Skill: java-backend

**Files:**
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/dto/GenerateShoppingListRequestTest.java`

- [x] **Step 1: Write the DTO test (mirrors `MealPlanCreateRequestTest`)**

```java
package com.foodbytes.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * MPP-8: the client sends homemade/store-bought selections as a JSON object, so its keys
 * arrive as strings ({"82":{"36":false}}). They must deserialise to Long keys, or
 * ShoppingListService's selectionsMap.get(recipeId) misses every entry and silently
 * falls back to homemade.
 */
class GenerateShoppingListRequestTest {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    void stringKeyedSelections_deserialiseToLongKeys() throws Exception {
        String json = "{\"startDate\":\"2026-10-12\",\"endDate\":\"2026-10-14\","
            + "\"selections\":{\"82\":{\"36\":false,\"37\":true}}}";

        GenerateShoppingListRequest request = objectMapper.readValue(json, GenerateShoppingListRequest.class);

        assertThat(request.getStartDate()).isEqualTo(LocalDate.of(2026, 10, 12));
        assertThat(request.getEndDate()).isEqualTo(LocalDate.of(2026, 10, 14));
        Map<Long, Boolean> forBolognese = request.getSelections().get(82L);
        assertThat(forBolognese).isNotNull();
        assertThat(forBolognese.get(36L)).isFalse();
        assertThat(forBolognese.get(37L)).isTrue();
    }

    @Test
    void omittedSelections_deserialiseToNull() throws Exception {
        String json = "{\"startDate\":\"2026-10-12\",\"endDate\":\"2026-10-14\"}";

        GenerateShoppingListRequest request = objectMapper.readValue(json, GenerateShoppingListRequest.class);

        assertThat(request.getSelections()).isNull();
    }
}
```

- [x] **Step 2: Run it**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=GenerateShoppingListRequestTest`
Expected: `Tests run: 2, Failures: 0, Errors: 0`. Per memory `java-maven-toolchain-paths`, `mvn`/`java` are not on PATH, so apply the env prefix recorded there.

### Task 2: Pin that ShoppingListController forwards selections ✓

- Skill: java-backend

**Files:**
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/ShoppingListControllerTest.java`

- [x] **Step 1: Write the controller unit test (Mockito, no Spring context)**

```java
package com.foodbytes.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.foodbytes.dto.GenerateShoppingListRequest;
import com.foodbytes.dto.HomemadeSelectionsDTO;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.PersistedShoppingListService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * MPP-8: POST /api/shopping-list/generate must hand the client's string-keyed selections
 * to PersistedShoppingListService as a Long-keyed HomemadeSelectionsDTO. The body is
 * deserialised with Jackson exactly as Spring would, then fed to the controller method —
 * no Spring context, matching every other test in this suite.
 */
@ExtendWith(MockitoExtension.class)
class ShoppingListControllerTest {

    private static final LocalDate START = LocalDate.of(2026, 10, 12);
    private static final LocalDate END = LocalDate.of(2026, 10, 14);

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Mock private PersistedShoppingListService persistedShoppingListService;
    @Mock private UserPrincipal userPrincipal;

    @InjectMocks private ShoppingListController controller;

    @Test
    void generate_forwardsStringKeyedSelectionsAsLongKeyedDto() throws Exception {
        GenerateShoppingListRequest request = objectMapper.readValue(
            "{\"startDate\":\"2026-10-12\",\"endDate\":\"2026-10-14\",\"selections\":{\"82\":{\"36\":false}}}",
            GenerateShoppingListRequest.class);
        when(userPrincipal.getId()).thenReturn(1L);

        ResponseEntity<?> response = controller.generateShoppingList(userPrincipal, request);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        ArgumentCaptor<HomemadeSelectionsDTO> captor = ArgumentCaptor.forClass(HomemadeSelectionsDTO.class);
        verify(persistedShoppingListService)
            .generateShoppingList(eq(1L), eq(START), eq(END), captor.capture());
        assertThat(captor.getValue().getSelections().get(82L).get(36L)).isFalse();
    }

    @Test
    void generate_withoutSelections_forwardsNullSoEveryExtraStaysHomemade() throws Exception {
        GenerateShoppingListRequest request = objectMapper.readValue(
            "{\"startDate\":\"2026-10-12\",\"endDate\":\"2026-10-14\"}",
            GenerateShoppingListRequest.class);
        when(userPrincipal.getId()).thenReturn(1L);

        controller.generateShoppingList(userPrincipal, request);

        verify(persistedShoppingListService)
            .generateShoppingList(eq(1L), eq(START), eq(END), isNull());
    }
}
```

- [x] **Step 2: Run it**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListControllerTest`
Expected: `Tests run: 2, Failures: 0, Errors: 0`.

### Task 3: Cover the store-bought, fallback and explicit-homemade branches in ShoppingListService ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/ShoppingListServiceTest.java:3-34` (imports), `:412` (insert three tests after `extraWithNoMatchingLinkedIngredientRow_SkipsProrationDefensively`)

- [x] **Step 1: Add imports**

Add alongside the existing imports:

```java
import com.foodbytes.dto.HomemadeSelectionsDTO;
import java.util.Map;
import static org.mockito.Mockito.never;
```

- [x] **Step 2: Insert the three tests after line 412**

```java
    // ------------------------------------------------------------------
    // MPP-8 — homemade / store-bought selections
    // ------------------------------------------------------------------

    @Test
    void storeBoughtExtraWithIngredient_ListsStoreBoughtItemAndSkipsWholeHomemadeSubtree() {
        // Mirrors the live repro: Spaghetti Bolognese (82) → dual-path row → Fresh Pasta (36),
        // store-bought counterpart Spaghetti (dried) (126). A nested child extra (90) under
        // Fresh Pasta must also be skipped — AC1 "including nested child extras".
        Unit grams = unit(3L, "g");
        Ingredient mince = ingredient(41L, "Beef mince");
        Ingredient spaghetti = ingredient(126L, "Spaghetti (dried)");

        Recipe freshPasta = recipe(36L, "Fresh Pasta", 4,
            recipeIngredient(ingredient(40L, "Plain flour"), "300.00", grams, "300.00"));
        RecipeIngredient dualPath = linkedRecipeIngredient(freshPasta, "200.00");
        dualPath.setIngredient(spaghetti); // FR-103: both ids set
        Recipe bolognese = recipe(82L, "Spaghetti Bolognese", 2,
            recipeIngredient(mince, "500.00", grams, "500.00"), dualPath);

        givenUserOwnsTheirOwnPlan(userId);
        givenEntries(entry(startDate, "dinner", bolognese, 2));
        when(recipeExtrasService.hasExtras(82L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(82L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(36L)
                .recipeName("Fresh Pasta")
                .storeBoughtIngredientId(126L)
                .children(new ArrayList<>(List.of(RecipeExtraNodeDTO.builder()
                    .recipeId(90L)
                    .recipeName("Pasta Dusting Mix")
                    .children(new ArrayList<>())
                    .build())))
                .build()));
        when(ingredientRepository.findById(126L)).thenReturn(Optional.of(spaghetti));

        HomemadeSelectionsDTO selections = new HomemadeSelectionsDTO(Map.of(82L, Map.of(36L, false)));
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, selections);

        List<String> names = result.getAisles().stream()
            .flatMap(a -> a.getItems().stream())
            .map(ShoppingItemDTO::getIngredientName)
            .toList();
        assertThat(names).contains("Spaghetti (dried)", "Beef mince");
        assertThat(names).doesNotContain("Plain flour");
        verify(recipeRepository, never()).findById(36L);
        verify(recipeRepository, never()).findById(90L);
    }

    @Test
    void storeBoughtExtraWithoutIngredient_FallsBackToStoreBoughtItemsAisle() {
        // AC2: a link-only extra (no store-bought counterpart) set to store-bought keeps the
        // pre-existing "Store Bought <name>" row in the special aisle.
        Unit grams = unit(3L, "g");
        Recipe freshPasta = recipe(36L, "Fresh Pasta", 4,
            recipeIngredient(ingredient(40L, "Plain flour"), "300.00", grams, "300.00"));
        Recipe bolognese = recipe(82L, "Spaghetti Bolognese", 2,
            recipeIngredient(ingredient(41L, "Beef mince"), "500.00", grams, "500.00"),
            linkedRecipeIngredient(freshPasta, "200.00"));

        givenUserOwnsTheirOwnPlan(userId);
        givenEntries(entry(startDate, "dinner", bolognese, 2));
        when(recipeExtrasService.hasExtras(82L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(82L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(36L)
                .recipeName("Fresh Pasta")
                .children(new ArrayList<>())
                .build()));

        HomemadeSelectionsDTO selections = new HomemadeSelectionsDTO(Map.of(82L, Map.of(36L, false)));
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, selections);

        ShoppingListByAisleDTO storeBoughtAisle = result.getAisles().stream()
            .filter(a -> "Store Bought Items".equals(a.getAisle().getName()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("no Store Bought Items aisle"));
        assertThat(storeBoughtAisle.getItems())
            .extracting(ShoppingItemDTO::getIngredientName)
            .containsExactly("Store Bought Fresh Pasta");
        boolean hasFlour = result.getAisles().stream()
            .flatMap(a -> a.getItems().stream())
            .anyMatch(i -> "Plain flour".equals(i.getIngredientName()));
        assertThat(hasFlour).isFalse();
        verify(ingredientRepository, never()).findById(anyLong());
    }

    @Test
    void explicitHomemadeSelection_MatchesNoSelectionBehaviour() {
        // AC3: {82:{36:true}} must produce exactly what null selections produce today.
        Unit grams = unit(3L, "g");
        Recipe freshPasta = recipe(36L, "Fresh Pasta", 4,
            recipeIngredient(ingredient(40L, "Plain flour"), "300.00", grams, "300.00"));
        Recipe bolognese = recipe(82L, "Spaghetti Bolognese", 2,
            recipeIngredient(ingredient(41L, "Beef mince"), "500.00", grams, "500.00"),
            linkedRecipeIngredient(freshPasta, "200.00"));

        givenUserOwnsTheirOwnPlan(userId);
        givenEntries(entry(startDate, "dinner", bolognese, 2));
        when(recipeExtrasService.hasExtras(82L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(82L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(36L)
                .recipeName("Fresh Pasta")
                .storeBoughtIngredientId(126L)
                .children(new ArrayList<>())
                .build()));
        when(recipeRepository.findById(36L)).thenReturn(Optional.of(freshPasta));
        when(macroCalculationService.calculateRecipeTotalYield(freshPasta)).thenReturn(new BigDecimal("300.00"));

        AggregatedShoppingListDTO homemade = shoppingListService.getShoppingList(
            userId, startDate, new HomemadeSelectionsDTO(Map.of(82L, Map.of(36L, true))));
        AggregatedShoppingListDTO noSelection = shoppingListService.getShoppingList(userId, startDate, null);

        for (AggregatedShoppingListDTO result : List.of(homemade, noSelection)) {
            ShoppingItemDTO flour = result.getAisles().stream()
                .flatMap(a -> a.getItems().stream())
                .filter(i -> "Plain flour".equals(i.getIngredientName()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("no shopping list row for Plain flour"));
            // usedGrams = 200 * (2/2) = 200; portionRatio = 200/300; flour = 300 * 200/300 = 200.00
            assertThat(flour.getTotalQuantity()).isEqualByComparingTo(new BigDecimal("200.00"));
            assertThat(result.getAisles().stream().flatMap(a -> a.getItems().stream()))
                .noneMatch(i -> "Spaghetti (dried)".equals(i.getIngredientName()));
        }
        verify(ingredientRepository, never()).findById(anyLong());
    }
```

- [x] **Step 3: Run the class**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=ShoppingListServiceTest`
Expected: `Failures: 0, Errors: 0`, with the three new tests passing alongside the existing ones. Because the backend already honours selections, these pass without production changes. If one fails, that is a real backend defect: stop and report it rather than editing production code.

---

## Phase 2 — Frontend fix

The one-line production change. After it, the client sends what Phase 1 proved the backend handles. The build is green at the end of this phase.

### Task 4: Pass saved selections from GenerateShoppingListModal ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/shopping/GenerateShoppingListModal.jsx:1-33`

- [x] **Step 1: Import the hook and pass selections**

Replace the import block's line 2 with both context imports:

```jsx
import { useShoppingList } from '../../contexts/ShoppingListContext'
import { useHomemadeSelections } from '../../contexts/HomemadeSelectionsContext'
```

After line 10 (`const { generateShoppingList, isGenerating } = useShoppingList()`) add:

```jsx
  // MPP-8: send saved homemade/store-bought choices so store-bought extras list the bought product
  const { selections } = useHomemadeSelections()
```

Replace line 33:

```jsx
    await generateShoppingList(startDate, endDate)
```

with:

```jsx
    await generateShoppingList(startDate, endDate, selections)
```

- [x] **Step 2: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [x] **Step 3: Confirm line budget and no stray logging**

Run: `(Get-Content foodbytes-app\client\src\components\shopping\GenerateShoppingListModal.jsx | Measure-Object -Line).Lines`
Expected: about 104 (well under 200).

Run: `Select-String -Path foodbytes-app\client\src\components\shopping\GenerateShoppingListModal.jsx -Pattern "console\.(log|debug)"`
Expected: zero hits.

---

## Phase 3 — Final verification

No production changes, only checks that the cumulative work is clean.

### Task 5: Confirm the only caller now passes selections ✓

- Skill: none — read-only grep audit

- [x] **Step 1: No two-argument call remains**

Run: `Select-String -Path foodbytes-app\client\src\**\*.jsx -Pattern "generateShoppingList\(startDate, endDate\)"`
Expected: zero hits.

### Task 6: Run the full backend test suite ✓

- Skill: java-backend

- [x] **Step 1: Full run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: the only failures are the pre-existing `AuthControllerLoginTest` ones (memory `authcontrollerlogintest-pre-existing-failure`: baseline 46/50). The run adds 7 new passing tests (2 DTO + 2 controller + 3 service). Any failure outside `AuthControllerLoginTest` is a regression.

### Task 7: Production build ✓

- Skill: react-frontend

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 8: Manual production check (developer-owned, after Railway deploy) ⏳ — developer-owned, run after Railway deploy

- Skill: none — manual check against the live app

- [ ] **Step 1: Live repro (AC4)**

On production, logged in as user 1: confirm Spaghetti Bolognese on 2026-10-12 has Fresh Pasta set to **Store-bought**. Then Shopping → **Generate Shopping List** → 2026-10-12 to 2026-10-14.
Expected: the list contains **Spaghetti (dried)** and no Plain flour / Egg / Salt rows. The rest of the Bolognese ingredients are unchanged. Note: the Spaghetti row's `source_chain` will be `[36, 82]` (the extra's id prepended by `processExtras`), not `[82]` as the ticket's Expected Behaviour states. That is the existing provenance format.

- [ ] **Step 2: Confirm via DB (read-only)**

Run (mysql MCP): `SELECT sli.* FROM shopping_list_items sli JOIN shopping_lists sl ON sl.id = sli.shopping_list_id WHERE sl.user_id = 1 ORDER BY sli.id`
Expected: one row for ingredient 126, and no rows for the flour/egg/salt ingredient ids with source chain `[36, 82]`. Check the actual column names with `SHOW COLUMNS FROM shopping_list_items` first.

### Task 9: Update the PR description ✓

- Skill: none — documentation

- [x] **Step 1: Write `pr-description.md` in this plan folder**

Include:
- A link to `plan.md` in this folder and to Jira MPP-8.
- Summary: `GenerateShoppingListModal` now sends `useHomemadeSelections().selections`; backend unchanged; 7 new backend tests pin the selections contract.
- Migrations: none.
- Verification results from Phases 1–3 (test counts, build output, AC4 manual result if done).
- Follow-ups for the developer to ticket: `endDate` ignored by `PersistedShoppingListService`; breakdown popup divergence for store-bought rows; selections lost on variant switch; selections are per-browser.
- A one-line note for future contributors: any new caller of `generateShoppingList` must pass `selections`, or store-bought choices are silently dropped.

---

## Self-review

**Spec coverage:**
- Modal passes selections — Task 4; caller audit Task 5.
- DTO string-key deserialisation test (AC5) — Task 1.
- Controller forwarding test (AC5) — Task 2.
- Store-bought with ingredient, nested child skipped (AC1) — Task 3 test 1.
- Store-bought without ingredient fallback (AC2) — Task 3 test 2.
- Explicit homemade matches null (AC3) — Task 3 test 3; also existing null-selection tests stay green (Task 6).
- Live repro (AC4) — Task 8.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command.

**Type / name consistency:** `HomemadeSelectionsDTO(Map<Long, Map<Long, Boolean>>)` uses the Lombok `@AllArgsConstructor`, which exists. `RecipeExtraNodeDTO.builder().storeBoughtIngredientId(Long)` exists. `PersistedShoppingListService.generateShoppingList(Long, LocalDate, LocalDate, HomemadeSelectionsDTO)` matches its signature. The aisle name `"Store Bought Items"` matches `ShoppingListService.STORE_BOUGHT_AISLE_NAME`. The fallback item name `"Store Bought " + recipeName` matches `addStoreBoughtItems`. The test helpers `recipe`, `ingredient`, `unit`, `recipeIngredient(…, quantityGrams)`, `linkedRecipeIngredient`, `entry`, `givenUserOwnsTheirOwnPlan` and `givenEntries` all exist in `ShoppingListServiceTest`. `useHomemadeSelections().selections` is exported by `HomemadeSelectionsContext.jsx:94-100`.

**Phase boundary cleanliness:**
- Phase 1 adds tests only, and they pass against unchanged production code, so the build stays green.
- Phase 2 is a single-file frontend edit verified by `npm run build`.
- Phase 3 is read-only checks plus the PR doc.
