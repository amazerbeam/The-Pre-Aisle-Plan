# Tasks: Meal Plan + Recipes + Header & Logo + Recipe View + Shopping redesign (web + mobile)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase by phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-14

**Goal:** Rebuild `/mealplan` (`mockup.html`) and `/` Recipes (`recipes-mockup.html`) as one change. Meal Plan gets a desktop timetable and a mobile day view, an on-card eaten tick, and meal actions with undo. Recipes gets search, tab counts, a week strip, picking mode linked from Meal Plan, a variant segment, macro chips, three-state day buttons and per-person hiding. The header gets the Plate P logo and a wordmark, desktop nav tabs, a week pill and a regrouped account menu, and the logo also goes on the favicon, home-screen icons, sign-in and landing. The recipe view gets a pinned header with plan context, tick-off ingredients, step cards, cook mode and an extras box. Shopping gets progress, an out-of-date banner, folding aisles and in-shop toggles. The backend adds a meal-plan PATCH, summary macros, hidden recipes and a shopping-list plan fingerprint.

**Spec:** `plan.md` in this folder. The visual contracts are `mockup.html` (Meal Plan) and `recipes-mockup.html` (Recipes) and `header-mockup.html` (Header & Logo, option C), `recipe-view-mockup.html`, `shopping-mockup.html` and the clickable `prototype.html` in this folder (open it in a browser: Web / Mobile tabs; the Proposal tab's spec panel lists the rules).

---

## File map

**Created:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanEntryUpdateRequest.java` — PATCH body (planDate+mealId pair, servings)
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/dto/MealPlanEntryUpdateRequestTest.java` — validation tests
- `client/src/constants/mealPlanUi.js` — slots, breakpoint, undo ms, swipe constants, storage key
- `client/src/utils/mealPlanDayUtils.js` — tickable/day/week macro helpers
- `client/src/hooks/useMediaQuery.js` — matchMedia boolean
- `client/src/utils/weekPlanEntryUtils.js` — `findEntry` / `patchEntry`, moved out of `useEntryEaten.js` (Task 8)
- `client/src/hooks/useEntryUpdate.js` — optimistic PATCH with per-entry rollback
- `client/src/hooks/useMealEntryActions.js` — tick / remove + undo / move / servings / variant
- `client/src/hooks/useSwipeHint.js` — first-run hint flag
- `client/src/components/common/MacroChips.jsx` + `MacroChips.css` — labelled P/C/F chips
- `client/src/components/mealplan/MealCard.jsx` + `MealCard.css` — shared card (name, kcal, servings, cart, tick, opens recipe)
- `client/src/components/common/UndoToast.jsx` + `UndoToast.css` — toast with optional Undo (shared by both screens)
- `foodbytes-app/database/migrations/2026-11-14-user-hidden-recipes.sql` — per-user hidden recipes table
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/UserHiddenRecipe.java`, `repository/UserHiddenRecipeRepository.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/HiddenRecipeService.java`, `controller/HiddenRecipeController.java`, `dto/HiddenRecipesDTO.java`, `dto/HiddenRecipeDTO.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/HiddenRecipeServiceTest.java`, `service/RecipeServiceSummaryMacrosTest.java`, `controller/HiddenRecipeControllerTest.java`
- `client/src/constants/recipesUi.js`, `client/src/utils/recipeCatalogueUtils.js`, `client/src/services/hiddenRecipeService.js`
- `client/src/hooks/useRecipeCatalogue.js`, `useHiddenRecipes.js`, `usePickingMode.js`
- `client/src/components/recipes/VariantSegment.jsx`, `ServingsChip.jsx`, `RecipeCardMenu.jsx`, `RecipeToolbar.jsx` + `RecipeToolbar.css`, `WeekSlotStrip.jsx`, `PickingBanner.jsx`
- `client/src/components/common/BrandMark.jsx` — logo C as inline SVG
- `client/public/icons/brand-mark.svg`, `brand-mark-maskable.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`; `client/public/manifest.webmanifest`
- `client/src/constants/appRoutes.js`, `client/src/hooks/useDocumentTitle.js`, `client/src/hooks/useAppNav.js`
- `client/src/components/layout/AppNavItems.jsx`, `client/src/components/layout/HeaderNav.jsx`
- `foodbytes-app/database/migrations/2026-11-14-shopping-list-plan-fingerprint.sql`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanFingerprintService.java` + `src/test/java/com/foodbytes/service/MealPlanFingerprintServiceTest.java`
- `client/src/utils/formatQuantity.js`, `client/src/utils/cookModeUtils.js`
- `client/src/hooks/useExtraChoiceToggle.js`, `client/src/hooks/useMealEatenSave.js`, `client/src/hooks/useHideTicked.js`
- `client/src/components/recipes/RecipeViewHeader.jsx`, `PlanContextBar.jsx`, `IngredientsPanel.jsx`, `ExtrasPanel.jsx`, `CookMode.jsx` + `CookMode.css`
- `client/src/components/mealplan/MealPlanSheet.jsx` + `MealPlanSheet.css` — bottom sheet shell
- `client/src/components/mealplan/MoveMealSheet.jsx` — pick day + meal
- `client/src/components/mealplan/ServingsSheet.jsx` — servings stepper
- `client/src/components/mealplan/WeekSummary.jsx` + `WeekSummary.css` — This-week tile + stale list tile
- `client/src/components/mealplan/MealPlanToolbar.jsx` — labelled desktop toolbar
- `client/src/components/mealplan/DayHeader.jsx` — kcal + chips + ⇄
- `client/src/components/mealplan/MealEntryMenu.jsx` — per-meal ⋯ menu
- `client/src/components/mealplan/MealCardDesktop.jsx` — MealCard + menu + drag
- `client/src/components/mealplan/SlotCell.jsx` — slot: cards / + Add / ↻ Replace / drop target
- `client/src/components/mealplan/MealPlanWeekDesktop.jsx` + `MealPlanWeekDesktop.css` — timetable
- `client/src/components/mealplan/MobileWeekBar.jsx`, `DayChipStrip.jsx`, `MobileDaySummary.jsx`, `SwipeableRow.jsx`
- `client/src/components/mealplan/MealPlanWeekMobile.jsx` + `MealPlanWeekMobile.css` — mobile day view

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java` — add `updateEntry`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/MealPlanController.java` — add `PATCH /{id}`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java` — updateEntry tests
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/MealPlanControllerTest.java` — PATCH mapping tests
- `client/src/services/mealPlanService.js` — add `updateEntry`
- `client/src/hooks/useEntryEaten.js` — import `findEntry` / `patchEntry` from `utils/weekPlanEntryUtils.js`
- `client/src/contexts/MealPlanContext.jsx:7,87,~525` — wire `useEntryUpdate`, expose `updateEntry`
- `client/src/components/common/DateRangePicker.jsx` + `.css` — ‹ › and "This week"
- `client/src/components/mealplan/MealPlanMenu.jsx` — optional `onSwapDays` item
- `client/src/components/mealplan/MealPlanCalendar.jsx` + `.css` — becomes the layout shell
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/RecipeVariantDTO.java`, `dto/RecipeSummaryDTO.java` — per-serving P/C/F
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeService.java:184-300`, `service/RecipeFamilyService.java:307` — set the macro fields
- `client/src/services/recipeService.js` — `getAllRecipeSummaries` / `{ signal }` support
- `client/src/components/recipes/RecipeList.jsx` + `.css` — becomes the shell
- `client/src/components/recipes/RecipeCard.jsx` + `.css` — rebuilt card
- `client/src/components/recipes/DayAssignmentButtons.jsx` + `.css` — 3 states, no kcal, picking mode
- `client/public/favicon.svg` — redrawn as logo C in `#4a3f80`
- `client/index.html` — title, apple-touch-icon, manifest, theme-color and Apple meta tags
- `client/src/components/layout/Header.jsx` + `Header.css` — brand + wordmark, HeaderNav, week pill, regrouped account menu
- `client/src/components/layout/Footer.jsx` + `Footer.css` — renders the shared nav; hidden at ≥1024 px except on `/pet`
- `client/src/components/common/DateRangePicker.jsx` + `.css`, `client/src/utils/dateUtils.js` — pill skin, `formatWeekRange`
- `client/src/App.jsx`, `client/src/styles/global.css` — `useDocumentTitle`, `Footer alwaysVisible`, `--footer-clearance` at desktop
- `client/src/components/auth/LoginModal.jsx`, `client/src/components/onboarding/LandingPageAnimation.jsx` (+ CSS) — BrandMark 72 / 120 px
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/ShoppingList.java`, `dto/PersistedShoppingListDTO.java`, `service/PersistedShoppingListService.java` (+ `PersistedShoppingListServiceTest.java`) — fingerprint store/compare
- `client/src/components/recipes/RecipeViewModal.jsx` + `.css`, `RecipeStepsSection.jsx`, `MealEatenSection.jsx` — split + reskin
- `client/src/components/common/MacroChips.jsx` + `.css` — `onChipClick`, `header` variant
- `client/src/components/shopping/ShoppingList.jsx`, `ShoppingListHeader.jsx`, `ShoppingListAisle.jsx`, `ShoppingListItem.jsx`, `GenerateShoppingListModal.jsx`, `ShoppingList.css`
- `client/src/contexts/MealPlanContext.jsx`, `client/src/contexts/HomemadeSelectionsContext.jsx` — remove the unused `shoppingListInvalidated` flag
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump

**Deleted:**
- `client/src/components/mealplan/MealPlanDay.jsx`, `MealPlanDay.css`
- `client/src/components/mealplan/MealPlanEntry.jsx`, `MealPlanEntry.css`
- `client/src/components/recipes/MacroBadgeRow.jsx` (+ `.css`), only if nothing else imports it after Task 69
- `client/src/components/common/WakeLockIcon.jsx` (+ `.css`) and `LockEmojiAnimation.*`, only if nothing else imports them after Task 69

(`client/src/...` = `foodbytes-app/client/src/...`)

---

## Phase 1 — Backend: PATCH /api/meal-plan/{id}

Adds one endpoint plus tests, and nothing calls it yet. The boundary is safe: the backend compiles, existing behaviour is untouched, and no schema change is involved (plan.md audit: no migration).

### Task 1: MealPlanEntryUpdateRequest DTO ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanEntryUpdateRequest.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/dto/MealPlanEntryUpdateRequestTest.java`

- [x] **Step 1: Write the failing validation test** (mirror `MealPlanCreateRequestTest`'s `validator()` helper)

```java
class MealPlanEntryUpdateRequestTest {
    private static Validator validator() { return Validation.buildDefaultValidatorFactory().getValidator(); }

    @Test void moveOnly_isValid() {
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(LocalDate.of(2026,11,15), 2L, null))).isEmpty();
    }
    @Test void servingsOnly_isValid() {
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(null, null, new BigDecimal("1.5")))).isEmpty();
    }
    @Test void dateWithoutMeal_isInvalid() {
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(LocalDate.of(2026,11,15), null, null)))
            .extracting(v -> v.getMessage()).contains("planDate and mealId must be sent together");
    }
    @Test void emptyBody_isInvalid() {
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(null, null, null)))
            .extracting(v -> v.getMessage()).contains("Nothing to update");
    }
    @Test void servingsOutOfRange_isInvalid() {
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(null, null, new BigDecimal("0.10")))).isNotEmpty();
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(null, null, new BigDecimal("20.01")))).isNotEmpty();
        assertThat(validator().validate(new MealPlanEntryUpdateRequest(null, null, new BigDecimal("1.255")))).isNotEmpty();
    }
}
```

- [x] **Step 2: Run it and see it fail to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanEntryUpdateRequestTest`
Expected: compilation error, `MealPlanEntryUpdateRequest` not found.

- [x] **Step 3: Create the DTO** exactly as in plan.md → Data shapes → "DTO — new" (Lombok `@Data @NoArgsConstructor @AllArgsConstructor`, field order `planDate, mealId, servings`, the three servings annotations, the two `@AssertTrue` methods `isMoveComplete()` / `isNotEmpty()`). Add `@JsonIgnore` on both `@AssertTrue` getters so Jackson doesn't serialise or expect `moveComplete` / `notEmpty`.

- [x] **Step 4: Run it and see it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanEntryUpdateRequestTest`
Expected: `Tests run: 5, Failures: 0, Errors: 0`.

### Task 2: MealPlanService.updateEntry ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java` (new method after `setEntryEaten`, ~line 358)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java`

- [x] **Step 1: Write the failing tests.** Reuse the class's existing fixtures (`USER_ID`, `user`, `entryWithId`, `recipeWithId`, and whatever stubbing the existing `assignRecipe_*` tests use so `convertToDTO` succeeds). Read those tests first and mirror their setup. Add:

```java
@Test
void updateEntry_moveToEmptySlot_movesInPlaceAndKeepsId() {
    LocalDate from = LocalDate.of(2026, 11, 14), to = LocalDate.of(2026, 11, 15);
    when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
    MealPlanEntry e = entryWithId(10L, recipeWithId(82L), from);   // meal = dinner(3) per fixture
    when(mealPlanEntryRepository.findByIdAndUserId(10L, USER_ID)).thenReturn(Optional.of(e));
    when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealId(USER_ID, to, 2L)).thenReturn(Optional.empty());
    when(mealRepository.findById(2L)).thenReturn(Optional.of(mealWithId(2L, "lunch")));
    // + the convertToDTO stubs used by assignRecipe tests

    Optional<MealPlanEntryDTO> dto = mealPlanService.updateEntry(USER_ID, 10L, new MealPlanEntryUpdateRequest(to, 2L, null));

    assertThat(dto).isPresent();
    assertThat(e.getId()).isEqualTo(10L);
    assertThat(e.getPlanDate()).isEqualTo(to);
    assertThat(e.getMeal().getId()).isEqualTo(2L);
    verify(eventPublisher).publishEvent(PetFirstCandidate.planned(USER_ID, from, to));
}

@Test
void updateEntry_moveOntoFilledSlot_swapsTheOccupantIntoTheSourceSlot() {
    LocalDate from = LocalDate.of(2026, 11, 14), to = LocalDate.of(2026, 11, 12);
    when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
    MealPlanEntry moving = entryWithId(10L, recipeWithId(82L), from);
    MealPlanEntry occupant = entryWithId(11L, recipeWithId(38L), to);
    Meal sourceMeal = moving.getMeal();
    when(mealPlanEntryRepository.findByIdAndUserId(10L, USER_ID)).thenReturn(Optional.of(moving));
    when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealId(USER_ID, to, 3L)).thenReturn(Optional.of(occupant));
    when(mealRepository.findById(3L)).thenReturn(Optional.of(sourceMeal));

    mealPlanService.updateEntry(USER_ID, 10L, new MealPlanEntryUpdateRequest(to, 3L, null));

    assertThat(moving.getPlanDate()).isEqualTo(to);
    assertThat(occupant.getPlanDate()).isEqualTo(from);
    assertThat(occupant.getMeal()).isSameAs(sourceMeal);
    verify(eventPublisher).publishEvent(PetFirstCandidate.planned(USER_ID, to, from));
}

@Test
void updateEntry_servingsOnly_setsServingsWithoutMoving() {
    LocalDate d = LocalDate.of(2026, 11, 14);
    when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
    MealPlanEntry e = entryWithId(10L, recipeWithId(82L), d);
    when(mealPlanEntryRepository.findByIdAndUserId(10L, USER_ID)).thenReturn(Optional.of(e));

    mealPlanService.updateEntry(USER_ID, 10L, new MealPlanEntryUpdateRequest(null, null, new BigDecimal("1.50")));

    assertThat(e.getServings()).isEqualByComparingTo("1.50");
    assertThat(e.getPlanDate()).isEqualTo(d);
    verify(mealPlanEntryRepository, never()).findByUserIdAndPlanDateAndMealId(any(), any(), any());
    verify(eventPublisher, never()).publishEvent(any());
}

@Test
void updateEntry_entryNotInPlan_returnsEmpty() {
    when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
    when(mealPlanEntryRepository.findByIdAndUserId(99L, USER_ID)).thenReturn(Optional.empty());

    assertThat(mealPlanService.updateEntry(USER_ID, 99L,
        new MealPlanEntryUpdateRequest(null, null, BigDecimal.ONE))).isEmpty();
}
```
If the fixture class has no `mealWithId` helper, add a private one next to `recipeWithId` that builds a `Meal` with id and name.

- [x] **Step 2: Run them and see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: compilation error, `updateEntry` not defined.

- [x] **Step 3: Implement `updateEntry`**

```java
/**
 * Move an entry to another day/meal and/or change its servings. Moving onto an occupied slot
 * swaps the occupant into the source slot (one meal per slot). Ids are kept, so eaten ticks
 * (MPP-33) and extra choices (MPP-10) travel with the meal.
 */
@Transactional
public Optional<MealPlanEntryDTO> updateEntry(Long userId, Long entryId, MealPlanEntryUpdateRequest request) {
    Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
    return mealPlanEntryRepository.findByIdAndUserId(entryId, effectiveOwnerId).map(entry -> {
        if (request.getPlanDate() != null) {
            LocalDate sourceDate = entry.getPlanDate();
            Meal sourceMeal = entry.getMeal();
            boolean sameSlot = sourceDate.equals(request.getPlanDate())
                && sourceMeal.getId().equals(request.getMealId());
            if (!sameSlot) {
                mealPlanEntryRepository
                    .findByUserIdAndPlanDateAndMealId(effectiveOwnerId, request.getPlanDate(), request.getMealId())
                    .filter(occupant -> !occupant.getId().equals(entry.getId()))
                    .ifPresent(occupant -> {
                        occupant.setPlanDate(sourceDate);
                        occupant.setMeal(sourceMeal);
                        mealPlanEntryRepository.save(occupant);
                    });
                Meal targetMeal = mealRepository.findById(request.getMealId())
                    .orElseThrow(() -> new RuntimeException("Meal type not found"));
                entry.setPlanDate(request.getPlanDate());
                entry.setMeal(targetMeal);
                LocalDate first = sourceDate.isBefore(request.getPlanDate()) ? sourceDate : request.getPlanDate();
                LocalDate last = sourceDate.isBefore(request.getPlanDate()) ? request.getPlanDate() : sourceDate;
                eventPublisher.publishEvent(PetFirstCandidate.planned(userId, first, last)); // MPP-24
            }
        }
        if (request.getServings() != null) {
            entry.setServings(request.getServings());
        }
        MealPlanEntry saved = mealPlanEntryRepository.save(entry);
        Map<Long, Boolean> choices = extraChoiceService.getEntryChoices(List.of(saved.getId()))
            .getOrDefault(saved.getId(), Map.of());
        LocalDateTime eatenAt = getEatenAtByEntry(userId, List.of(saved.getId())).get(saved.getId());
        return convertToDTO(saved, choices, eatenAt);
    });
}
```
(If `save` returns null under the Mockito mocks, stub `save` to return its argument in the tests with `when(mealPlanEntryRepository.save(any())).thenAnswer(i -> i.getArgument(0))`. Don't change the production code for it.)

- [x] **Step 4: Run them and see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: `BUILD SUCCESS`, 0 failures. All pre-existing tests in the class still pass.

### Task 3: MealPlanController PATCH /{id} ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/MealPlanController.java` (after `setEaten`, ~line 145)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/MealPlanControllerTest.java`

- [x] **Step 1: Write the failing tests** (same style as the `setEaten_*` tests)

```java
@Test
void updateEntry_returns200WithEntry() {
    when(userPrincipal.getId()).thenReturn(7L);
    MealPlanEntryDTO dto = new MealPlanEntryDTO();
    dto.setId(812L);
    MealPlanEntryUpdateRequest req = new MealPlanEntryUpdateRequest(null, null, new BigDecimal("2"));
    when(mealPlanService.updateEntry(7L, 812L, req)).thenReturn(Optional.of(dto));

    ResponseEntity<?> response = controller.updateEntry(userPrincipal, 812L, req);

    assertThat(response.getStatusCode().value()).isEqualTo(200);
    assertThat(response.getBody()).isSameAs(dto);
}

@Test
void updateEntry_entryNotInPlan_returns404() {
    when(userPrincipal.getId()).thenReturn(7L);
    MealPlanEntryUpdateRequest req = new MealPlanEntryUpdateRequest(null, null, BigDecimal.ONE);
    when(mealPlanService.updateEntry(7L, 999L, req)).thenReturn(Optional.empty());

    assertThat(controller.updateEntry(userPrincipal, 999L, req).getStatusCode().value()).isEqualTo(404);
}

@Test
void updateEntry_unauthenticated_returns403() {
    ResponseEntity<?> response = controller.updateEntry(null, 812L, new MealPlanEntryUpdateRequest(null, null, BigDecimal.ONE));
    assertThat(response.getStatusCode().value()).isEqualTo(403);
    verifyNoInteractions(mealPlanService);
}

@Test
void updateEntry_concurrentConflict_returns409() {
    when(userPrincipal.getId()).thenReturn(7L);
    MealPlanEntryUpdateRequest req = new MealPlanEntryUpdateRequest(null, null, BigDecimal.ONE);
    when(mealPlanService.updateEntry(7L, 812L, req)).thenThrow(new DataIntegrityViolationException("dup"));

    assertThat(controller.updateEntry(userPrincipal, 812L, req).getStatusCode().value()).isEqualTo(409);
}
```
(If `MealPlanEntryDTO` has no no-args constructor, build it the way the class's other tests do.)

- [x] **Step 2: Run them and see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanControllerTest`
Expected: compilation error, `updateEntry` not defined on the controller.

- [x] **Step 3: Add the endpoint**

```java
/**
 * Move a meal to another day/meal (swapping with the slot's occupant) and/or change its servings.
 * PATCH /api/meal-plan/{id}  body {"planDate":"2026-11-15","mealId":2,"servings":1.5} - any subset; date+meal together.
 *
 * @return 200 with the updated MealPlanEntryDTO; 404 if the entry is not in the caller's plan
 */
@PatchMapping("/{id}")
public ResponseEntity<?> updateEntry(
        @AuthenticationPrincipal UserPrincipal userPrincipal,
        @PathVariable Long id,
        @Valid @RequestBody MealPlanEntryUpdateRequest request) {

    if (userPrincipal == null) {
        return ResponseEntity.status(403)
            .body(Map.of("error", "Authentication required to modify meal plan"));
    }
    try {
        return mealPlanService.updateEntry(userPrincipal.getId(), id, request)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    } catch (DataIntegrityViolationException e) {
        return ResponseEntity.status(409).body(Map.of("error",
            "That meal was changed at the same time on another device. Try again."));
    }
}
```
Add the imports for `PatchMapping` and `MealPlanEntryUpdateRequest`. The controller's existing `MethodArgumentNotValidException` handler already turns bean-validation failures into 400.

- [x] **Step 4: Run them and see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanControllerTest`
Expected: `BUILD SUCCESS`, 0 failures.

---

## Phase 2 — Frontend foundations (no visible change)

New constants, utils, hooks, the service method and the context wiring. Nothing renders them yet, so the app looks and behaves as before. The build stays green.

### Task 4: Meal-plan UI constants ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/constants/mealPlanUi.js`

- [x] **Step 1: Create the constants module**

```js
/** Meal Plan screen redesign: values shared by the desktop timetable and the mobile day view. */

/** Core slots, in display order. mealId matches the `meals` table (1-4), as in DayAssignmentButtons. */
export const MEAL_SLOTS = [
  { key: 'breakfast', label: 'Breakfast', mealId: 1 },
  { key: 'lunch', label: 'Lunch', mealId: 2 },
  { key: 'dinner', label: 'Dinner', mealId: 3 }
]
/** Rendered only when some day in the week has a snack. */
export const SNACKS_SLOT = { key: 'snacks', label: 'Snacks', mealId: 4 }

/** Same breakpoint as the old scroll-to-today check in MealPlanCalendar. */
export const MOBILE_MEDIA_QUERY = '(max-width: 768px)'

/** Remove is deferred this long so Undo can cancel it. */
export const UNDO_REMOVE_MS = 5000
/** Plain info toasts (eaten, moved). */
export const INFO_TOAST_MS = 2500

/** First-run swipe hint: set to '1' the first time the user completes a real swipe. Per device. */
export const SWIPE_HINT_STORAGE_KEY = 'fb.mealplan.swipeHintSeen'
/** A drag further left than this (px) snaps the row open and counts as a real swipe. */
export const SWIPE_COMMIT_PX = 70
/** Width of each revealed action button (Replace / Move / Remove). */
export const SWIPE_ACTION_WIDTH_PX = 76

/** `from` value marking a Recipes visit that should return to the Meal Plan after adding. */
export const PICK_FROM_MEALPLAN = 'mealplan'

/** Route for "+ Add" / "Replace": Recipes on that meal tab, in picking mode for that day when dateISO is given. */
export const recipesForMealPath = (mealKey, dateISO) =>
  dateISO ? `/?mealType=${mealKey}&date=${dateISO}&from=${PICK_FROM_MEALPLAN}` : `/?mealType=${mealKey}`
```

- [x] **Step 2: Verify it imports**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {MEAL_SLOTS, recipesForMealPath} from './src/constants/mealPlanUi.js'; console.log(MEAL_SLOTS.length, recipesForMealPath('lunch'), recipesForMealPath('lunch','2026-11-15'))"`
Expected: `3 /?mealType=lunch /?mealType=lunch&date=2026-11-15&from=mealplan`

### Task 5: Day and week helpers ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/utils/mealPlanDayUtils.js`

- [x] **Step 1: Create the helpers**

```js
import { MEAL_SLOTS, SNACKS_SLOT } from '../constants/mealPlanUi.js'

/** The eaten tick is offered only for today and past days (ISO yyyy-mm-dd compares lexically). */
export function isDayTickable(dateISO, todayISO) {
  return typeof dateISO === 'string' && dateISO <= todayISO
}

/** Day totals in the {protein, carbs, fat} grams shape evaluateMacro expects. */
export function dayMacros(day) {
  return { protein: day?.totalProtein ?? 0, carbs: day?.totalCarbs ?? 0, fat: day?.totalFat ?? 0 }
}

/** Average-per-day macros: the same source WeeklyMacroPopup's avg row uses, so tile and popup agree. */
export function weekAvgMacros(weekPlan) {
  return {
    protein: weekPlan?.avgDailyProtein ?? 0,
    carbs: weekPlan?.avgDailyCarbs ?? 0,
    fat: weekPlan?.avgDailyFat ?? 0
  }
}

/** How many of the 21 core slots (B/L/D x 7) hold a meal. */
export function plannedSlotCount(weekPlan) {
  return (weekPlan?.days || []).reduce(
    (n, day) => n + MEAL_SLOTS.filter(s => (day.mealsByType?.[s.key] || []).length > 0).length, 0)
}

/** Rows to render: B/L/D always, plus Snacks only when some day this week has one. */
export function slotsForWeek(weekPlan) {
  const hasSnacks = (weekPlan?.days || []).some(d => (d.mealsByType?.snacks || []).length > 0)
  return hasSnacks ? [...MEAL_SLOTS, SNACKS_SLOT] : MEAL_SLOTS
}

/** How many core slots a single day fills (0-3), for the mobile day-chip dots. */
export function filledCoreSlots(day) {
  return MEAL_SLOTS.filter(s => (day?.mealsByType?.[s.key] || []).length > 0).length
}
```

- [x] **Step 2: Smoke-check the pure helpers**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {isDayTickable, plannedSlotCount, slotsForWeek} from './src/utils/mealPlanDayUtils.js'; const w={days:[{mealsByType:{breakfast:[1],dinner:[1]}},{mealsByType:{snacks:[1]}}]}; console.log(isDayTickable('2026-11-14','2026-11-14'), isDayTickable('2026-11-15','2026-11-14'), plannedSlotCount(w), slotsForWeek(w).length)"`
Expected: `true false 2 4`

### Task 6: mealPlanService.updateEntry ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/services/mealPlanService.js` (add after `setEntryEaten`, ~line 70)

- [x] **Step 1: Add the method**

```js
  /**
   * Move an entry and/or change its servings. planDate + mealId travel together;
   * moving onto a filled slot swaps the two meals server-side.
   * @param {number} entryId
   * @param {{planDate?: string, mealId?: number, servings?: number}} patch
   * @returns {Promise<Object>} the updated MealPlanEntryDTO
   */
  async updateEntry(entryId, patch) {
    const response = await api.patch(`/meal-plan/${entryId}`, patch)
    return response.data
  },
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: useMediaQuery hook ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/hooks/useMediaQuery.js`

- [x] **Step 1: Create the hook**

```js
import { useEffect, useState } from 'react'

/** True while the media query matches; follows resizes and rotation. */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 8: useEntryUpdate hook + context wiring ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/hooks/useEntryUpdate.js`
- Modify: `client/src/contexts/MealPlanContext.jsx:7` (import), `:87` (hook call), `value` object ~line 525 (expose `updateEntry`)

- [x] **Step 1: Create the hook** (same rollback shape as `useEntryEaten`; lives outside the over-budget context)

```js
import { useCallback } from 'react'
import mealPlanService from '../services/mealPlanService'

const UPDATE_ERROR_MESSAGE = "Couldn't update that meal. Please try again."
const ERROR_TOAST_MS = 3000

/**
 * Optimistic move / servings change. Servings patch the entry in place; a move is not patched locally
 * (the server may swap a second meal), so the week is refetched to show the real result and new totals.
 */
export function useEntryUpdate({ weekPlan, setWeekPlan, setAssignmentError, fetchWeekPlan }) {
  const updateEntry = useCallback(async (entryId, patch) => {
    const previous = findEntry(weekPlan, entryId)
    if (!previous) throw new Error('Meal plan entry not found')
    const rollback = { servings: previous.servings }
    if (patch.servings != null) {
      setWeekPlan(plan => patchEntry(plan, entryId, { servings: patch.servings }))
    }
    try {
      const saved = await mealPlanService.updateEntry(entryId, patch)
      await fetchWeekPlan()
      return saved
    } catch (err) {
      setWeekPlan(plan => patchEntry(plan, entryId, rollback))
      setAssignmentError(err.response?.data?.error || UPDATE_ERROR_MESSAGE)
      setTimeout(() => setAssignmentError(null), ERROR_TOAST_MS)
      throw err
    }
  }, [weekPlan, setWeekPlan, setAssignmentError, fetchWeekPlan])

  return { updateEntry }
}
```
Add `findEntry` and `patchEntry` at the bottom. To keep them DRY, first move the two helpers out of `useEntryEaten.js` into a new `client/src/utils/weekPlanEntryUtils.js` (`export function findEntry`, `export function patchEntry`, bodies unchanged), then import them in both hooks.

- [x] **Step 2: Wire into the context.** In `MealPlanContext.jsx` add `import { useEntryUpdate } from '../hooks/useEntryUpdate'`. After `fetchWeekPlan` is declared (it is a `useCallback` at ~line 116, so the hook call must come after it), add:

```js
  const { updateEntry } = useEntryUpdate({ weekPlan, setWeekPlan, setAssignmentError, fetchWeekPlan })
```
and add `updateEntry,` to the `// Operations` block of `value`. Keep the context line count no higher than +3.

- [x] **Step 3: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\contexts\MealPlanContext.jsx | Measure-Object -Line).Lines`
Expected: build OK; line count ≤ 567.

### Task 9: useMealEntryActions hook ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/hooks/useMealEntryActions.js`

- [x] **Step 1: Create the hook**

```js
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMealPlan } from '../contexts/MealPlanContext'
import { getTodayISO } from '../utils/dateUtils'
import { isDayTickable } from '../utils/mealPlanDayUtils'
import { UNDO_REMOVE_MS, INFO_TOAST_MS } from '../constants/mealPlanUi'

/**
 * Everything a meal card can do, shared by desktop (menu/drag) and mobile (swipe/sheets).
 * Remove is deferred UNDO_REMOVE_MS so Undo can cancel it; a pending delete is flushed
 * (sent at once) on unmount or when a second remove starts, so it is never lost.
 */
export default function useMealEntryActions() {
  const { setEntryEaten, removeEntry, updateEntry, assignRecipe } = useMealPlan()
  const [pendingRemovalIds, setPendingRemovalIds] = useState(() => new Set())
  const [toast, setToast] = useState(null)            // { message, canUndo }
  const pending = useRef(null)                        // { entryId, timer }
  const toastTimer = useRef(null)

  const showToast = useCallback((message, canUndo, ms) => {
    clearTimeout(toastTimer.current)
    setToast({ message, canUndo })
    toastTimer.current = setTimeout(() => setToast(null), ms)
  }, [])

  const unhide = (entryId) => setPendingRemovalIds(ids => { const n = new Set(ids); n.delete(entryId); return n })

  const commitRemoval = useCallback(async (entryId) => {
    try { await removeEntry(entryId) } finally { unhide(entryId) }
  }, [removeEntry])

  const flushPending = useCallback(() => {
    if (!pending.current) return
    clearTimeout(pending.current.timer)
    const { entryId } = pending.current
    pending.current = null
    commitRemoval(entryId).catch(() => {})   // removeEntry already surfaces the error state
  }, [commitRemoval])

  const requestRemove = useCallback((entry) => {
    flushPending()
    setPendingRemovalIds(ids => new Set(ids).add(entry.id))
    const timer = setTimeout(() => {
      pending.current = null
      commitRemoval(entry.id).catch(() => {})
    }, UNDO_REMOVE_MS)
    pending.current = { entryId: entry.id, timer }
    showToast(`Removed ${entry.recipe?.name ?? 'meal'}`, true, UNDO_REMOVE_MS)
  }, [flushPending, commitRemoval, showToast])

  const undoRemove = useCallback(() => {
    if (!pending.current) return
    clearTimeout(pending.current.timer)
    unhide(pending.current.entryId)
    pending.current = null
    setToast(null)
  }, [])

  useEffect(() => () => { flushPending(); clearTimeout(toastTimer.current) }, [flushPending])

  const tick = useCallback(async (entry, day) => {
    if (entry.eaten || !isDayTickable(day.date, getTodayISO())) return
    await setEntryEaten(entry.id, true)
    showToast('Marked as eaten', false, INFO_TOAST_MS)
  }, [setEntryEaten, showToast])

  const moveEntry = useCallback(async (entry, planDate, mealId) => {
    await updateEntry(entry.id, { planDate, mealId })
    showToast('Meal moved', false, INFO_TOAST_MS)
  }, [updateEntry, showToast])

  const setServings = useCallback((entry, servings) => updateEntry(entry.id, { servings }), [updateEntry])

  /** Variant switch = assign a sibling recipe to the same slot; the backend keeps the extra choices. */
  const switchVariant = useCallback((entry, day, variantRecipe) =>
    assignRecipe(variantRecipe.recipeId, day.date, entry.mealId, entry.servings, variantRecipe),
  [assignRecipe])

  return { tick, requestRemove, undoRemove, pendingRemovalIds, toast, dismissToast: () => setToast(null),
    moveEntry, setServings, switchVariant }
}
```
Before writing `switchVariant`, Read `assignRecipe` in `MealPlanContext.jsx` (~line 140) and the `variants` shape on `entry.recipe.variants` (used by `RecipeViewModal`) and match the argument order exactly. The context signature is `(recipeId, dateStr, mealId, servings, recipe, extraChoices)`. If the variant object has no `recipeId` field, use the field the modal uses.

- [x] **Step 2: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\hooks\useMealEntryActions.js | Measure-Object -Line).Lines`
Expected: build OK, < 200 lines.

### Task 10: useSwipeHint hook ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/hooks/useSwipeHint.js`

- [x] **Step 1: Create the hook**

```js
import { useCallback, useState } from 'react'
import { SWIPE_HINT_STORAGE_KEY } from '../constants/mealPlanUi'

const readSeen = () => {
  try { return window.localStorage.getItem(SWIPE_HINT_STORAGE_KEY) === '1' } catch { return false }
}

/**
 * First-run swipe hint for mobile meal cards. Shown until the user completes a real swipe;
 * viewing, tapping or changing day never dismisses it. Per device. If storage is blocked
 * the hint simply shows each session.
 */
export default function useSwipeHint() {
  const [showHint, setShowHint] = useState(readSeen() === false)
  const markSeen = useCallback(() => {
    try { window.localStorage.setItem(SWIPE_HINT_STORAGE_KEY, '1') } catch { /* storage blocked: hint returns next session */ }
    setShowHint(false)
  }, [])
  return { showHint, markSeen }
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 11: MacroChips component ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/common/MacroChips.jsx`, `client/src/components/common/MacroChips.css`

- [x] **Step 1: Create the component**

```jsx
import { evaluateMacro, hasUsableMacros, deriveKcal } from '../../utils/macroStatus'
import { DAILY_MACRO_TARGETS } from '../../constants/macroTargets'
import './MacroChips.css'

/**
 * Labelled P / C / F chips in the directional traffic-light colours (under/near/on/over).
 * kcal is deliberately not judged. `variant`: 'light' (default), 'onDark' (purple headers), 'large'.
 */
function MacroChips({ macros, targets = DAILY_MACRO_TARGETS, variant = 'light' }) {
  if (!hasUsableMacros(macros)) return null
  const kcal = deriveKcal(macros)
  const pct = (g, perG) => Math.round((g * perG / kcal) * 100)
  const chips = [
    { key: 'protein', text: `P ${Math.round(macros.protein)}g`, name: 'Protein' },
    { key: 'carbs', text: `C ${pct(macros.carbs, 4)}%`, name: 'Carbs' },
    { key: 'fat', text: `F ${pct(macros.fat, 9)}%`, name: 'Fat' }
  ]
  return (
    <span className={`macro-chips macro-chips--${variant}`}>
      {chips.map(c => {
        const status = evaluateMacro(macros, c.key, targets).status
        return (
          <span key={c.key} className={`macro-chip macro-chip--${status}`} aria-label={`${c.name} ${c.text.slice(2)}, ${status} target`}>
            {c.text}
          </span>
        )
      })}
    </span>
  )
}

export default MacroChips
```
Before writing this, Read `utils/macroStatus.js` lines 28–130: confirm `deriveKcal(macros)` returns a number and that `evaluateMacro(...).status` returns one of `under|near|on|over`. Use `KCAL_PER_GRAM` from `macroTargets.js` instead of the literal 4/9.

- [x] **Step 2: Create the CSS** using the existing `--macro-*-pill-bg` / `--macro-*-pill-text` tokens from `global.css`:

```css
.macro-chips { display: inline-flex; gap: 4px; flex-wrap: wrap; }
.macro-chip { font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 999px; white-space: nowrap; }
.macro-chip--under { background: var(--macro-under-target-pill-bg); color: var(--macro-under-target-pill-text); }
.macro-chip--near  { background: var(--macro-near-target-pill-bg);  color: var(--macro-near-target-pill-text); }
.macro-chip--on    { background: var(--macro-on-target-pill-bg);    color: var(--macro-on-target-pill-text); }
.macro-chip--over  { background: var(--macro-over-target-pill-bg);  color: var(--macro-over-target-pill-text); }
.macro-chips--onDark .macro-chip { background: #fff; }
.macro-chips--large .macro-chip { font-size: 14px; padding: 4px 10px; }
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

---

## Phase 3 — Shared building blocks + header arrows

Leaf components used by both layouts, plus the week arrows in the global header. The arrows are the only visible change in this phase; the old calendar is still mounted, so the build is green and the app fully works.

### Task 12: Week arrows in DateRangePicker ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/common/DateRangePicker.jsx`, `client/src/components/common/DateRangePicker.css`

- [x] **Step 1: Add the arrows and "This week".** Keep the `<input type="date">` (now styled as the range pill). Add:

```jsx
import { addDays, formatDateISO, parseISODate } from '../../utils/dateUtils'
// inside the component:
const shiftWeek = (weeks) => setStartDate(formatDateISO(addDays(parseISODate(startDate), weeks * 7)))
const thisWeekStart = getInitialWeekStart()   // see note below
// JSX:
<div className="date-range-picker">
  <button type="button" className="week-arrow" onClick={() => shiftWeek(-1)} aria-label="Previous week">‹</button>
  {/* existing label + date input + → end date, unchanged */}
  <button type="button" className="week-arrow" onClick={() => shiftWeek(1)} aria-label="Next week">›</button>
  {startDate !== thisWeekStart && (
    <button type="button" className="this-week-btn" onClick={() => setStartDate(thisWeekStart)}>This week</button>
  )}
</div>
```
For "this week", reuse the logic of `getInitialStartDate` in `MealPlanContext.jsx` (line 49): export it from the context module as `getDefaultStartDate` (rename the local, keep its body), and import it here. Don't duplicate the week-start rule. Confirm `addDays` and `parseISODate` signatures in `utils/dateUtils.js` (lines 23, 43) before using them.

- [x] **Step 2: CSS.** `.week-arrow` 44×44 hit area (`min-width:44px;min-height:44px`), a 32px visual circle, `background: rgba(255,255,255,.14)`, white text, `touch-action: manipulation; -webkit-tap-highlight-color: transparent`. Hover inside `@media (hover: hover)` (`rgba(255,255,255,.26)`), with an `:active` twin. `.this-week-btn` is an outlined white pill. At ≤480px hide `.date-label` so the pill fits.

- [x] **Step 3: Build + manual check**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors. Manual (dev server, `/mealplan`, 1280px and 390px): ‹ moves the range back exactly 7 days; › forward; "This week" appears only when off the current week and returns to it; the date input still works.

### Task 13: MealCard ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/mealplan/MealCard.jsx`, `client/src/components/mealplan/MealCard.css`

- [x] **Step 1: Create the component.** It takes over the display and recipe-modal logic of `MealPlanEntry.jsx`: the `RecipeViewModal` props block (lines ~110–132), the cart detection (`Object.values(entry.extraChoices || {}).includes(false)`), and `formatServings`. Drop the hover tooltip and the × button.

Props: `{ entry, day, size = 'compact' | 'large', canTick, onTick, thumbEmoji }`.

Structure:
```jsx
<div className={`meal-card meal-card--${size} ${entry.eaten ? 'is-eaten' : ''}`}
     role="button" tabIndex={0} onClick={openRecipe} onKeyDown={enterOrSpaceOpens}>
  {size === 'large' && <span className="meal-card-thumb" aria-hidden="true">{thumbEmoji}</span>}
  <div className="meal-card-body">
    <span className="meal-card-name">{entry.recipe?.name}</span>
    <span className="meal-card-meta">
      {entry.caloriesPerServing} kcal
      <span className="meal-card-servings" title={peopleLabel}>{size === 'large' ? peopleLabel : `👥 ${formatServings(entry.servings)}`}</span>
      {hasStoreBought && <span className="meal-card-cart" role="img" aria-label="Has store-bought extras" title="Has store-bought extras"><CartIcon /></span>}
    </span>
  </div>
  {canTick && (
    <button type="button" className="meal-card-tick" aria-pressed={!!entry.eaten}
            aria-label={entry.eaten ? 'Eaten' : `Mark ${entry.recipe?.name} as eaten`}
            disabled={entry.eaten} onClick={(e) => { e.stopPropagation(); onTick(entry, day) }}>✓</button>
  )}
</div>
```
`peopleLabel` = `` `${formatServings(entry.servings)} ${Number(entry.servings) === 1 ? 'person' : 'people'}` ``. Keep the `RecipeViewModal` render below the card exactly as `MealPlanEntry` had it.

- [x] **Step 2: CSS** (values from the mockup). `.meal-card` white, `border:1px solid var(--border-color)`, `border-left:4px solid var(--brand-primary-light)`, radius 8px. `.is-eaten` gets background `#eef8f0` and left border `var(--success)`. `.meal-card-name` uses a 2-line clamp (`display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden`). `.meal-card-meta` gets `white-space:nowrap`. `.meal-card-tick` has a 44×44 hit area with a 24px visual circle (34px on `--large`), grey border; `.is-eaten .meal-card-tick` fills green with a white ✓ and `cursor:default`. `--large` uses padding 12px, radius 14px, name 15px, and a 48px thumb. Hover lift only inside `@media (hover: hover)`.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 14: UndoToast ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/common/UndoToast.jsx`, `client/src/components/common/UndoToast.css` (shared with the Recipes screen, so not under `mealplan/`)

- [x] **Step 1: Create the component**

```jsx
/** Bottom toast for meal actions; shows Undo while a removal can still be cancelled. */
function UndoToast({ toast, onUndo }) {
  if (!toast) return null
  return (
    <div className="meal-toast" role="status" aria-live="polite">
      <span>{toast.message}</span>
      {toast.canUndo && <button type="button" className="meal-toast-undo" onClick={onUndo}>Undo</button>}
    </div>
  )
}
export default UndoToast
```
CSS in `UndoToast.css` (imported by the component): `.meal-toast` fixed, centred, `bottom: calc(var(--footer-clearance) + 8px)`, background `#1f1a3a`, white, radius 10px, z-index above the footer. `.meal-toast-undo` is 44px tall, `#ffd34d`, bold.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 15: MealPlanSheet, MoveMealSheet, ServingsSheet ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/mealplan/MealPlanSheet.jsx`, `MealPlanSheet.css`, `MoveMealSheet.jsx`, `ServingsSheet.jsx`

- [x] **Step 1: `MealPlanSheet`.** A bottom sheet with backdrop, built on `usePullToDismiss` + `PullToDismissUI` + `useBodyScrollLock` exactly as `DailyMacroPopup.jsx` uses them (lines 1–60). Props: `{ title, onClose, children }`. Escape closes it. The backdrop is a native `<button aria-hidden tabIndex={-1}>` closing on click (the iOS ghost-click lesson from `MealPlanMenu.jsx`). The sheet has `role="dialog" aria-modal="true" aria-label={title}`. On desktop (≥769px) it renders as a centred card (CSS only).

- [x] **Step 2: `MoveMealSheet`.** Props: `{ entry, weekPlan, slots, onMove, onClose }`. Lists the 7 days (`dayOfWeek` + `formatDateShort(date)`), each with that day's slot buttons (`slots` from `slotsForWeek`). The current slot is disabled; a filled slot is labelled "swap with <recipe name>". Clicking calls `onMove(entry, day.date, slot.mealId)` then `onClose()`. Buttons are ≥44px.

- [x] **Step 3: `ServingsSheet`.** Props: `{ entry, onSave, onClose }`. Uses `useServingsInput(entry.servings)` and `stepServings` from `utils/servingsUtils.js`. Read both first and reuse their API; no new parsing. − / value / + plus Save. Save calls `onSave(entry, parsedServings)` then closes. If parsing fails, Save is disabled and the hook's message shows.

- [x] **Step 4: Build and measure**

Run: `cd foodbytes-app\client; npm run build; Get-ChildItem src\components\mealplan\*Sheet.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }`
Expected: build OK; each file < 200 lines.

---

## Phase 4 — Desktop timetable

Builds the desktop tree as standalone components. `MealPlanCalendar` still renders the old grid until Phase 6, so this phase can't break the live screen; the build stays green.

### Task 16: WeekSummary ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/mealplan/WeekSummary.jsx`, `WeekSummary.css`

- [x] **Step 1: Create the component.** Props: `{ weekPlan, onOpenWeekMacros }`. Two tiles in a grid (`2.4fr 1fr`; one column ≤1100px):
  - **This week** (a `button`, `aria-label="View weekly macro summary"`, click → `onOpenWeekMacros`): left block has label "This week", value `{weekTotalCalories.toLocaleString()} kcal`, and sub-line `avg {avgDailyCalories.toLocaleString()} / day · {plannedSlotCount(weekPlan)} of 21 meals planned`. Right block, behind a divider: label "Week macros (avg / day)" and `<MacroChips macros={weekAvgMacros(weekPlan)} variant="large" />`. A "Details ›" hint sits bottom-right.
  - **Shopping list**: `<ShoppingListStaleBar weekStart={weekPlan.startDate} weekEnd={weekPlan.endDate} />` inside a `.week-summary-stale` wrapper. The component renders nothing when the list isn't stale, so the wrapper must collapse (`:empty { display:none }`) and the This-week tile then spans the full width (`grid-template-columns` via `:has(.week-summary-stale:empty)` fallback, or render the wrapper only when a `useShoppingList` check says it overlaps; pick the latter if `:has` is unwanted). Restyle `.mx-stale` only under `.week-summary-stale` (amber card: `#fff7e6` / `#f3d39a`).
  - No eaten tile, no Pip tile.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 17: MealPlanToolbar ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/mealplan/MealPlanToolbar.jsx` (styles in `MealPlanWeekDesktop.css`)

- [x] **Step 1: Create the component.** Props: `{ onCopyWeek, onManageExtras, onSaveAs, onApply, onManage }` (the same handlers `MealPlanMenu` receives). Renders: `⧉ Copy week`, a `🗂 Templates ▾` disclosure (`aria-haspopup="menu"`, `aria-expanded`; items Save this week as template… / Apply template… / Manage templates…, closing on outside-click and Escape using the same document-listener effect as `MealPlanMenu`), `🛒 Extras`, and a primary `Build shopping list →` that calls `useNavigate()('/shopping')`. Every button is ≥44px tall.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 18: DayHeader ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/mealplan/DayHeader.jsx` (styles in `MealPlanWeekDesktop.css`)

- [x] **Step 1: Create the component.** Props: `{ day, onSwap, onOpenDayMacros }`. Markup:

```jsx
<div className={`day-header ${day.isToday ? 'is-today' : ''}`}>
  <div className="day-header-top">
    <span className="day-header-name">{day.dayOfWeek}</span>
    <span className="day-header-date">{formatDateShort(day.date)}</span>
    <button type="button" className="day-header-swap" onClick={() => onSwap(day)}
            aria-label={`Swap ${day.dayOfWeek} with another day`} title="Swap with another day">⇄</button>
  </div>
  <button type="button" className="day-header-macros" onClick={() => onOpenDayMacros(day)}
          aria-label={`View macro breakdown for ${day.dayOfWeek}`}>
    <span className="day-header-kcal">{day.totalCalories.toLocaleString()} kcal</span>
    <MacroChips macros={dayMacros(day)} variant={day.isToday ? 'onDark' : 'light'} />
  </button>
</div>
```
No ring and no kcal colouring. `.is-today` uses background `var(--brand-primary)` with white text. The swap button gets a 44px hit area.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 19: MealEntryMenu + MealCardDesktop ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/mealplan/MealEntryMenu.jsx`, `client/src/components/mealplan/MealCardDesktop.jsx`

- [x] **Step 1: `MealEntryMenu`.** Props: `{ entry, slotLabel, onServings, onVariant, onReplace, onMove, onRemove }`. It has a ⋯ trigger (`aria-haspopup="menu"`, `aria-label="Actions for <name>"`, 44px hit area; always visible on touch, hover-revealed only inside `@media (hover: hover)`). Items: `👥 Change servings…`, then (only when `entry.recipe?.variants?.length > 1`) one item per variant labelled `Light` / `Moderate` / `Balanced` with the current one `aria-checked`, `↻ Replace {slotLabel}`, `↔ Move to…`, and `🗑 Remove` (danger colour). Outside-click and Escape close it (the `MealPlanMenu` effect). Clicks inside don't bubble to the card.

- [x] **Step 2: `MealCardDesktop`.** Props: `{ entry, day, slot, actions, onOpenServings, onOpenMove }`. Renders `<MealCard size="compact" canTick={isDayTickable(day.date, getTodayISO())} onTick={actions.tick} …/>` inside a `div.meal-card-desktop` that is `draggable` and sets `e.dataTransfer.setData('text/plain', String(entry.id))` on dragstart. The ⋯ menu is positioned top-right. Wiring: Replace → `navigate(recipesForMealPath(slot.key, day.date))`; Move → `onOpenMove(entry)`; Servings → `onOpenServings(entry)`; Variant → `actions.switchVariant(entry, day, variant)`; Remove → `actions.requestRemove(entry)`.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 20: SlotCell ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/mealplan/SlotCell.jsx`

- [x] **Step 1: Create the component.** Props: `{ day, slot, entries, pendingRemovalIds, actions, onOpenServings, onOpenMove }`. Hide entries whose id is in `pendingRemovalIds`. If any remain, render `MealCardDesktop` for each, then a ghost `↻ Replace {slot.label}` link button (visible on cell hover/focus-within inside `@media (hover: hover)`, always visible otherwise). If none remain, render `+ Add {slot.label.toLowerCase()}`. Both navigate to `recipesForMealPath(slot.key, day.date)`. Drop target: `onDragOver` → `preventDefault` + `.is-drop-target`; `onDragLeave` removes it; `onDrop` reads the id, finds the entry (via `getEntryById` from `useMealPlan`) and, if it isn't already in this slot, calls `actions.moveEntry(entry, day.date, slot.mealId)`. `day.isToday` adds `.is-today-col`.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 21: MealPlanWeekDesktop ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/mealplan/MealPlanWeekDesktop.jsx`, `MealPlanWeekDesktop.css`

- [x] **Step 1: Create the component.** Props: `{ weekPlan, onSwap, onOpenDayMacros, onOpenWeekMacros, toolbarHandlers }`. It owns `useMealEntryActions()`, plus `servingsEntry` / `moveEntry` local state for the two sheets. Layout:
  - title row: `<h2>Meal Plan</h2>` + `<MealPlanToolbar {...toolbarHandlers} />`
  - `<WeekSummary weekPlan={weekPlan} onOpenWeekMacros={onOpenWeekMacros} />`
  - `.timetable` grid with `grid-template-columns: 92px repeat(7, minmax(0, 1fr))`: an empty corner, then 7 `DayHeader`s; then for each slot in `slotsForWeek(weekPlan)`, a row label (`{emoji} {label}` + the user's meal time if `MealTimesControl` exposes it, otherwise label only) followed by 7 `SlotCell`s.
  - `<UndoToast toast={actions.toast} onUndo={actions.undoRemove} />`
  - `ServingsSheet` / `MoveMealSheet` when their state is set (`onSave` → `actions.setServings`, `onMove` → `actions.moveEntry`).
  - Row emoji: reuse `getEmojiForMeal(day.date, key)` from `utils/emojiUtils` with the first day's date so it stays stable across the row.

- [x] **Step 2: CSS** for title row, toolbar, timetable, row labels, `.is-today-col` (tint `#efedf7`, radius 8px), `.is-drop-target` (2px dashed brand outline), and the ghost Replace / Add buttons (dashed `#cfcbe0`, brand-light text, min-height 44px). Values come from the mockup.

- [x] **Step 3: Build and measure**

Run: `cd foodbytes-app\client; npm run build; Get-ChildItem src\components\mealplan\MealPlanWeekDesktop.jsx,src\components\mealplan\SlotCell.jsx,src\components\mealplan\MealCardDesktop.jsx,src\components\mealplan\MealEntryMenu.jsx,src\components\mealplan\WeekSummary.jsx,src\components\mealplan\MealPlanToolbar.jsx,src\components\mealplan\DayHeader.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }`
Expected: build OK; every file < 200 lines (hard limit 400).

---

## Phase 5 — Mobile day view

Builds the mobile tree as standalone components. It isn't mounted until Phase 6; the build stays green.

### Task 22: MobileWeekBar + DayChipStrip + MobileDaySummary ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/mealplan/MobileWeekBar.jsx`, `DayChipStrip.jsx`, `MobileDaySummary.jsx` (styles in `MealPlanWeekMobile.css`)

- [x] **Step 1: `MobileWeekBar`.** Props: `{ weekPlan, onOpen }`. A full-width button: `Week {weekTotalCalories.toLocaleString()} kcal` + `<MacroChips macros={weekAvgMacros(weekPlan)} variant="onDark" />` + `›`. `aria-label="View weekly macro summary"`.

- [x] **Step 2: `DayChipStrip`.** Props: `{ days, selectedDate, onSelect }`. A `role="tablist"` with 7 `role="tab"` buttons (`aria-selected`), each showing short day, day number, and 3 dots with `filledCoreSlots(day)` filled. Today gets a `#ffd34d` inset ring when not selected. Each chip is ≥44px tall. Arrow-left and arrow-right move the selection (roving tabindex).

- [x] **Step 3: `MobileDaySummary`.** Props: `{ day, onOpen }`. A button card: `{Today · }{dayOfWeek} {formatDateShort(date)}`, `{totalCalories.toLocaleString()} kcal`, `<MacroChips macros={dayMacros(day)} />`, `›`. No ring.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 23: SwipeableRow (with first-run hint) ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/mealplan/SwipeableRow.jsx` (styles in `MealPlanWeekMobile.css`)

- [x] **Step 1: Create the component.** Props: `{ actions: [{key,label,icon,className,onClick}], onSwiped, hint, children }`.

```jsx
import { useRef, useState } from 'react'
import { SWIPE_COMMIT_PX, SWIPE_ACTION_WIDTH_PX } from '../../constants/mealPlanUi'

/** Swipe left to reveal actions. Pointer events cover touch and mouse. Taps fall through to children. */
function SwipeableRow({ actions, onSwiped, hint = false, children }) {
  const openX = -SWIPE_ACTION_WIDTH_PX * actions.length
  const [x, setX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef(null)          // { px, baseX, moved }

  const onPointerDown = (e) => {
    if (e.target.closest('button')) return
    start.current = { px: e.clientX, baseX: x, moved: false }
    setDragging(true)
  }
  const onPointerMove = (e) => {
    if (!start.current) return
    const dx = e.clientX - start.current.px
    if (Math.abs(dx) > 6 && !start.current.moved) {
      start.current.moved = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    if (start.current.moved) setX(Math.min(0, Math.max(openX - 12, start.current.baseX + dx)))
  }
  const end = () => {
    if (!start.current) return
    const { moved } = start.current
    start.current = null
    setDragging(false)
    if (!moved) return
    const open = x < -SWIPE_COMMIT_PX
    setX(open ? openX : 0)
    if (open) onSwiped?.()
  }
  // A real drag must not also open the recipe: swallow the click that follows it.
  const onClickCapture = (e) => { if (x !== 0) { e.stopPropagation(); setX(0) } }

  return (
    <div className={`swipe-row ${hint ? 'is-hinting' : ''}`}>
      <div className="swipe-row-actions" aria-hidden={x === 0}>
        {actions.map(a => (
          <button key={a.key} type="button" className={`swipe-row-action ${a.className}`}
                  tabIndex={x === 0 ? -1 : 0} onClick={() => { setX(0); a.onClick() }}>
            <span aria-hidden="true">{a.icon}</span>{a.label}
          </button>
        ))}
      </div>
      <div className="swipe-row-face" style={{ transform: `translateX(${x}px)`, transition: dragging ? 'none' : undefined }}
           onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={end} onPointerCancel={end}
           onClickCapture={onClickCapture}>
        {children}
        {hint && <span className="swipe-row-hand" aria-hidden="true">👆</span>}
      </div>
    </div>
  )
}
export default SwipeableRow
```
Keyboard and screen-reader access to the actions comes from the desktop-style ⋯ fallback in Task 24, so swipe isn't the only path.

- [x] **Step 2: CSS** (from the mockup's "first-run swipe hint" block). `.swipe-row` is relative with overflow hidden and radius 14px. `.swipe-row-actions` is absolute, right-aligned; each action is 76px wide, Replace `var(--brand-primary)`, Move `var(--brand-primary-light)`, Remove `var(--error)`, white bold text. `.swipe-row-face` has `touch-action: pan-y; transition: transform .2s`. The hint uses `@keyframes swipe-peek` (0–12% none, 32–52% `translateX(-150px)`, 72–100% none) on `.is-hinting .swipe-row-face`, 2.6s ease-in-out, 0.7s delay, 3 iterations, and `@keyframes swipe-hand` for `.swipe-row-hand` (fade in, slide −150px, fade out). Include `@media (prefers-reduced-motion: reduce) { .is-hinting .swipe-row-face, .swipe-row-hand { animation: none } .swipe-row-hand { display: none } }`.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 24: MealPlanWeekMobile ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/mealplan/MealPlanWeekMobile.jsx`, `MealPlanWeekMobile.css`

- [x] **Step 1: Create the component.** Props: `{ weekPlan, onOpenDayMacros, onOpenWeekMacros, menuHandlers }`. It owns `useMealEntryActions()`, `useSwipeHint()`, `selectedDate` (initial = today's date if in the week, else `weekPlan.days[0].date`; reset when `weekPlan.startDate` changes), and sheet state (`replaceSlot`, `moveEntry`, `servingsEntry`). Layout:
  - head (brand background): `<h2>Meal Plan</h2>` + `<MealPlanMenu {...menuHandlers} />` (the existing ⋯ bottom sheet), `<MobileWeekBar>`, `<DayChipStrip>`. Week arrows come from the global header (Task 12).
  - body: `<MobileDaySummary day={day} onOpen={() => onOpenDayMacros(day)} />`. Then for each slot in `slotsForWeek(weekPlan)` (skip `snacks` when that day has none): a slot header (`{emoji} {LABEL}`), then for each non-pending entry a `<SwipeableRow actions={[Replace, Move, Remove]} onSwiped={markSeen} hint={showHint && isFirstCard}>` wrapping `<MealCard size="large" canTick={isDayTickable(day.date, getTodayISO())} onTick={actions.tick} thumbEmoji={emoji} />`. An empty slot shows `<button className="m-add">+ Add {label.toLowerCase()}</button>` → `navigate(recipesForMealPath(slot.key, day.date))`.
  - When `showHint` and the day has at least one meal: render `<p className="swipe-hint-bubble">👈 Swipe a meal left to <b>Replace</b>, <b>Move</b> or <b>Remove</b></p>` above the first card.
  - Swipe actions: Replace → open a `MealPlanSheet` titled `Replace {label}` with a "Browse recipes for {label}" row → `navigate(recipesForMealPath(slot.key, day.date))`, and a "Swap with another day's {label}" row → `MoveMealSheet` limited to the same slot. Move → `MoveMealSheet`. Remove → `actions.requestRemove(entry)`.
  - Non-swipe fallback (a11y): each card's tick stays a button. Also render a visually hidden `MealEntryMenu` trigger, revealed on `:focus-visible`, so keyboard and switch users can reach the same actions.
  - `<UndoToast>` sits above the footer nav.

- [x] **Step 2: CSS** (mockup values): head padding and colours; `.m-body` background `var(--bg-secondary)` with bottom padding `var(--footer-clearance)`; slot header; `.m-add` dashed; `.swipe-hint-bubble` dark with a pointer triangle.

- [x] **Step 3: Build and measure**

Run: `cd foodbytes-app\client; npm run build; Get-ChildItem src\components\mealplan\MealPlanWeekMobile.jsx,src\components\mealplan\SwipeableRow.jsx,src\components\mealplan\DayChipStrip.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }`
Expected: build OK; each < 250 lines (hard limit 400). If `MealPlanWeekMobile.jsx` exceeds 250, extract the Replace sheet into `ReplaceMealSheet.jsx`.

---

## Phase 6 — Switch the screen over

Mounts the new layouts, adds "Swap two days…" to the mobile menu, and deletes the replaced components. This is the only phase with a user-visible screen change, and it ends with a green build and no dead files.

### Task 25: MealPlanMenu — "Swap two days…" ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/mealplan/MealPlanMenu.jsx:10,82-108`

- [x] **Step 1: Add an optional `onSwapDays` prop** and, when it's provided, a `Swap two days…` item between "Copy week…" and "Manage extras…" using the existing `choose(...)` helper. Update the doc comment.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 26: MealPlanCalendar becomes the shell ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/mealplan/MealPlanCalendar.jsx` (render section lines ~140–176, the auto-scroll effect lines ~82–98, imports), `client/src/components/mealplan/MealPlanCalendar.css`

- [x] **Step 1: Restructure.** Keep the auth / loading / error branches and every modal block (Weekly popup, SwapDaysModal, CopyWeek, Save / Apply / Manage templates, WeekExtras, TemplateExtras) and their handlers exactly as they are. Add state `dailyPopupDay` and render `<DailyMacroPopup day={dailyPopupDay} onClose={() => setDailyPopupDay(null)} />` here, since day headers no longer own it. Remove the old header markup, the `.calendar-grid` map, `todayRef`, and the scroll-to-today effect (mobile now opens on today via `selectedDate`). Then:

```jsx
const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY)
const menuHandlers = {
  onCopyWeek: () => setShowCopyModal(true),
  onManageExtras: () => setShowWeekExtras(true),
  onSaveAs: () => setShowSaveModal(true),
  onApply: openApply,
  onManage: openManage
}
// …
<div className="meal-plan-calendar">
  {isMobile ? (
    <MealPlanWeekMobile weekPlan={weekPlan}
      onOpenDayMacros={setDailyPopupDay} onOpenWeekMacros={() => setShowWeeklyPopup(true)}
      menuHandlers={{ ...menuHandlers, onSwapDays: () => handleSwapClick(todayOrFirstDay(weekPlan)) }} />
  ) : (
    <MealPlanWeekDesktop weekPlan={weekPlan}
      onSwap={handleSwapClick} onOpenDayMacros={setDailyPopupDay}
      onOpenWeekMacros={() => setShowWeeklyPopup(true)} toolbarHandlers={menuHandlers} />
  )}
  {/* existing empty-week message, unchanged */}
  {/* existing modal blocks, unchanged */}
</div>
```
`todayOrFirstDay(weekPlan)` returns `weekPlan.days.find(d => d.isToday) ?? weekPlan.days[0]`. Define it in `utils/mealPlanDayUtils.js` and export it. Guard: when `weekPlan` is null, render neither layout (the existing empty-plan message covers it).

- [x] **Step 2: Trim `MealPlanCalendar.css`** to the classes still used (`.meal-plan-calendar`, auth/loading/error/empty states). Delete the `.calendar-header`, `.calendar-grid`, `.week-calories*` and `.date-range` rules.

- [x] **Step 3: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\mealplan\MealPlanCalendar.jsx | Measure-Object -Line).Lines`
Expected: build OK; ≤ 285 lines (it must not grow).

### Task 27: Delete MealPlanDay and MealPlanEntry ✓

- Skill: react-frontend

**Files:**
- Delete: `client/src/components/mealplan/MealPlanDay.jsx`, `MealPlanDay.css`, `MealPlanEntry.jsx`, `MealPlanEntry.css`

- [x] **Step 1: Confirm nothing imports them**

Run: `cd foodbytes-app\client; Get-ChildItem -Path src -Recurse -Include *.js,*.jsx | Select-String -Pattern "MealPlanDay'|MealPlanDay`"|MealPlanEntry'|MealPlanEntry`"|meal-entry-tooltip|calendar-grid"`
Expected: zero hits (`MealPlanEntryDTO` mentions in comments are fine, but the pattern above won't match them).

- [x] **Step 2: Delete the four files**

Run: `cd foodbytes-app\client; Remove-Item src\components\mealplan\MealPlanDay.jsx, src\components\mealplan\MealPlanDay.css, src\components\mealplan\MealPlanEntry.jsx, src\components\mealplan\MealPlanEntry.css -Confirm:$false`
Expected: no output.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 28: Manual walkthrough against the mockup ⏳ — manual, pending developer walkthrough

- Skill: react-frontend

**Files:**
- Test: manual only (no frontend runner). Results are recorded in `pr-description.md` (Task M.5).

- [ ] **Step 1: Run the stack locally.** Start the backend (CLAUDE.md → "Running the backend locally with Google login", with `FRONTEND_URL=http://localhost:5173`) and `cd foodbytes-app\client; npm run dev`. Sign in and open `http://localhost:5173/mealplan`. Open `mockup.html` from this folder in a second tab for comparison.

- [ ] **Step 2: Desktop (1366×768) checks.** Each item must be observed:
  1. ‹ / › / "This week" change the week by exactly 7 days.
  2. The This-week tile shows the week's kcal, avg/day and "X of 21 meals planned". Its P/C/F chips match the avg row of the weekly popup it opens.
  3. The stale tile shows only when the saved list overlaps the week and was made before a change.
  4. Day headers show kcal + labelled chips (no ring). Clicking opens the daily popup; ⇄ opens Swap days.
  5. Names wrap to 2 lines; nothing is truncated to 1–5 characters.
  6. Today/past cards show the tick, and ticking turns the card green and shows "Marked as eaten". Future days show no tick. An eaten tick can't be un-ticked.
  7. ⋯ → Remove hides the card, and Undo within 5 s restores it with no network DELETE. Leaving it 5 s sends the DELETE and the day total drops.
  8. ⋯ → Change servings saves and updates kcal. ⋯ → Light/Balanced switches the recipe and keeps its cart icon state.
  9. Dragging a card to an empty slot moves it. Dragging onto a filled slot swaps the two. An eaten tick stays with the moved meal.
  10. Empty slots show "+ Add <meal>"; hovering a filled slot shows "↻ Replace <Meal>"; both open Recipes with `?mealType=`.
  11. Copy week / Templates ▾ / Extras open their existing modals; "Build shopping list →" goes to `/shopping`.

- [ ] **Step 3: Mobile (Chrome DevTools, 390×844, touch emulation) checks.**
  1. Opens on today. Day chips switch days; dots show 0–3 filled slots.
  2. The week bar and the day summary open the weekly and daily popups.
  3. First visit: the first card peeks left three times with 👆 and the tip bubble. Tapping or switching days doesn't dismiss it. A real swipe dismisses it, and after a reload it doesn't return. DevTools → Application → Local Storage shows `fb.mealplan.swipeHintSeen = 1`. Deleting the key brings it back.
  4. Swipe reveals Replace / Move / Remove. Each works; Remove shows Undo.
  5. ⋯ opens the bottom sheet with "Swap two days…" and every existing item.
  6. With DevTools → Rendering → `prefers-reduced-motion: reduce`: bubble only, no animation.

- [ ] **Step 4: Shared-plan check.** If a second test account is linked via `meal_plan_owner_id` locally, move a meal as user A and confirm user B sees it moved after a reload, while B's eaten ticks are unaffected. If no linked account exists locally, record "not verified" in the PR description.

---

## Phase 7 — Backend: hidden recipes + macros on the recipe summary

Writes the `user_hidden_recipes` migration, waits for you to apply it to Railway, then adds the entity, service, controller and the per-serving macro fields. The migration comes before any Java that maps the table, so the backend never starts against a missing table. The phase ends with the backend compiling and every new test green.

### Task 29: Write the user_hidden_recipes migration ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-11-14-user-hidden-recipes.sql`

- [x] **Step 1: Write the migration**

```sql
-- 2026-11-14 Recipes redesign (plan: .claude/contract/2026-11-14-meal-plan-screen-redesign/)
-- Per-person "Hide from my recipes". One row = this user has hidden this recipe FAMILY,
-- keyed by the family's DEFAULT recipe id (or the recipe itself when it has no family).
-- Independent of recipes.is_live (admin, hides for everyone). Never touches meal_plan_entries.
-- Lossless: a brand-new empty table; no existing rows change.
-- MUST be applied to Railway BEFORE the backend containing UserHiddenRecipe deploys
-- (Hibernate ddl-auto=validate refuses to start without the table).
CREATE TABLE IF NOT EXISTS user_hidden_recipes (
  id         BIGINT NOT NULL AUTO_INCREMENT,
  user_id    BIGINT NOT NULL,
  recipe_id  BIGINT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_hidden_recipe (user_id, recipe_id),
  KEY idx_user_hidden_recipes_recipe (recipe_id),
  CONSTRAINT fk_user_hidden_recipes_user   FOREIGN KEY (user_id)   REFERENCES users (id)   ON DELETE CASCADE,
  CONSTRAINT fk_user_hidden_recipes_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

- [x] **Step 2: Copy it to Downloads for the developer to run** (live writes are run by the developer, not Claude)

Run: `Copy-Item foodbytes-app\database\migrations\2026-11-14-user-hidden-recipes.sql $env:USERPROFILE\Downloads\`
Expected: no output; `Get-ChildItem $env:USERPROFILE\Downloads\2026-11-14-user-hidden-recipes.sql` lists the file.

### Task 30: Developer applies the migration to Railway ✓

- Skill: none — DBA operation against the live Railway MySQL (the developer runs it)

**Files:**
- (none — database operation)

- [x] **Step 1: Stop and ask the developer** to run `Downloads\2026-11-14-user-hidden-recipes.sql` against the Railway `railway` schema (MySQL Workbench), and wait for confirmation. If Docker's `foodbytes-db` is running, also apply it locally: `docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app/database/migrations/2026-11-14-user-hidden-recipes.sql`.

- [x] **Step 2: Verify read-only**

Run (mysql MCP): `SHOW COLUMNS FROM user_hidden_recipes`
Expected: `id bigint PRI auto_increment`, `user_id bigint NOT NULL`, `recipe_id bigint NOT NULL`, `created_at timestamp NULL`.
Run (mysql MCP): `SHOW INDEX FROM user_hidden_recipes`
Expected: `PRIMARY`, `uk_user_hidden_recipe (user_id, recipe_id)` non-unique=0, `idx_user_hidden_recipes_recipe`.

Do not continue to Task 31 until both checks pass.

### Task 31: UserHiddenRecipe entity + repository ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/UserHiddenRecipe.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/UserHiddenRecipeRepository.java`

- [x] **Step 1: Create both,** exactly as in plan.md → Data shapes → "Entity / repository — new". Mirror the imports and annotations of `model/UserExtraDefault.java` and `repository/UserExtraDefaultRepository.java`.

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 32: Per-serving macros on RecipeVariantDTO + RecipeSummaryDTO ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/RecipeVariantDTO.java` (append 3 fields)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/RecipeSummaryDTO.java` (append 3 fields)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeService.java:184-200` (`convertToSummaryDTO`), `:233` and `:294` (both `new RecipeVariantDTO(` calls)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/RecipeFamilyService.java:307` (`new RecipeVariantDTO(` call)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/RecipeServiceSummaryMacrosTest.java`

- [x] **Step 1: Write the failing test.** Mirror the setup of `RecipeServiceMacroAuditTest` (its mocks for `RecipeRepository`, `RecipeFamilyMemberRepository`, `MacroCalculationService`, `RecipeExtrasService`). Use `getRecipeSummaryById` because it goes through `convertToSummaryDTO`:

```java
@Test
void summary_carriesPerServingMacros_forTheRecipeAndEachVariant() {
    Recipe moderate = recipe(7L, "Porridge", 2);      // helper: id, name, defaultServings
    Recipe light = recipe(6L, "Porridge (Light)", 2);
    when(recipeRepository.findById(7L)).thenReturn(Optional.of(moderate));
    when(macroCalculationService.calculateRecipeTotalCalories(moderate)).thenReturn(1130);
    when(macroCalculationService.calculatePerServingMacros(moderate)).thenReturn(new int[]{40, 72, 16});
    when(macroCalculationService.calculatePerServingMacros(light)).thenReturn(new int[]{36, 62, 13});
    when(macroCalculationService.calculateCaloriesPerServing(any())).thenReturn(565);
    RecipeFamilyMember mModerate = member(moderate, "Moderate", true, 2);
    RecipeFamilyMember mLight = member(light, "Light", false, 1);
    when(recipeFamilyMemberRepository.findByRecipeId(7L)).thenReturn(Optional.of(mModerate));
    when(recipeFamilyMemberRepository.findVariantsForRecipeWithMacroGraph(7L)).thenReturn(List.of(mLight, mModerate));

    RecipeSummaryDTO dto = recipeService.getRecipeSummaryById(7L);

    assertThat(dto.getProteinPerServing()).isEqualTo(40);
    assertThat(dto.getCarbsPerServing()).isEqualTo(72);
    assertThat(dto.getFatPerServing()).isEqualTo(16);
    RecipeVariantDTO lightDto = dto.getVariants().stream().filter(v -> v.getRecipeId().equals(6L)).findFirst().orElseThrow();
    assertThat(lightDto.getProteinPerServing()).isEqualTo(36);
    assertThat(lightDto.getCarbsPerServing()).isEqualTo(62);
    assertThat(lightDto.getFatPerServing()).isEqualTo(13);
}
```
Add the `recipe(...)` / `member(...)` helpers if the audit test doesn't already have equivalents. Stub `recipe.getMeals()` to an empty set so `mealTypes` maps cleanly.

- [x] **Step 2: Run it and see it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=RecipeServiceSummaryMacrosTest`
Expected: compilation error, `getProteinPerServing()` undefined.

- [x] **Step 3: Add the fields and set them.** Append to `RecipeVariantDTO` (after `caloriesPerServing`, so the all-args order is `recipeId, recipeName, variantLabel, isDefault, displayOrder, caloriesPerServing, proteinPerServing, carbsPerServing, fatPerServing`):

```java
    private Integer proteinPerServing;  // grams, homemade basis (MacroCalculationService)
    private Integer carbsPerServing;
    private Integer fatPerServing;
```
Append the same three to `RecipeSummaryDTO` (it uses `@Builder`). In `convertToSummaryDTO`, before `build()`:

```java
        int[] perServing = macroCalculationService.calculatePerServingMacros(recipe);
        // … .proteinPerServing(perServing[0]).carbsPerServing(perServing[1]).fatPerServing(perServing[2])
```
At each of the three `new RecipeVariantDTO(` sites, compute `int[] vm = macroCalculationService.calculatePerServingMacros(variantRecipe);` (in `RecipeFamilyService`, use that class's variable name for the variant's `Recipe`, injecting `MacroCalculationService` only if it isn't already a field) and append `vm[0], vm[1], vm[2]` to the constructor arguments.

- [x] **Step 4: Run it and see it pass, and confirm the existing recipe tests still pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest="RecipeServiceSummaryMacrosTest,RecipeServiceMacroAuditTest,MacroCalculationServiceTest"`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 33: HiddenRecipeService ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/HiddenRecipeService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/HiddenRecipeServiceTest.java`

- [x] **Step 1: Write the failing tests** (`@ExtendWith(MockitoExtension.class)`, mocks: `UserHiddenRecipeRepository`, `RecipeRepository`, `RecipeFamilyMemberRepository`)

```java
@Test void hide_variant_storesTheFamilyDefaultId() {
    when(recipeRepository.existsById(6L)).thenReturn(true);
    RecipeFamilyMember light = memberOfFamily(6L, 100L, false);
    RecipeFamilyMember moderate = memberOfFamily(7L, 100L, true);
    when(recipeFamilyMemberRepository.findByRecipeId(6L)).thenReturn(Optional.of(light));
    when(recipeFamilyMemberRepository.findVariantsForRecipeWithMacroGraph(6L)).thenReturn(List.of(light, moderate));
    when(userHiddenRecipeRepository.existsByUserIdAndRecipeId(5L, 7L)).thenReturn(false);

    assertThat(service.hide(5L, 6L)).contains(7L);
    verify(userHiddenRecipeRepository).save(argThat(r -> r.getUserId().equals(5L) && r.getRecipeId().equals(7L)));
}
@Test void hide_soloRecipe_storesItself() {
    when(recipeRepository.existsById(23L)).thenReturn(true);
    when(recipeFamilyMemberRepository.findByRecipeId(23L)).thenReturn(Optional.empty());
    assertThat(service.hide(5L, 23L)).contains(23L);
}
@Test void hide_alreadyHidden_isIdempotent() {
    when(recipeRepository.existsById(23L)).thenReturn(true);
    when(recipeFamilyMemberRepository.findByRecipeId(23L)).thenReturn(Optional.empty());
    when(userHiddenRecipeRepository.existsByUserIdAndRecipeId(5L, 23L)).thenReturn(true);
    assertThat(service.hide(5L, 23L)).contains(23L);
    verify(userHiddenRecipeRepository, never()).save(any());
}
@Test void hide_concurrentDuplicate_isTreatedAsSuccess() {
    when(recipeRepository.existsById(23L)).thenReturn(true);
    when(recipeFamilyMemberRepository.findByRecipeId(23L)).thenReturn(Optional.empty());
    when(userHiddenRecipeRepository.save(any())).thenThrow(new DataIntegrityViolationException("dup"));
    assertThat(service.hide(5L, 23L)).contains(23L);
}
@Test void hide_unknownRecipe_returnsEmpty() {
    when(recipeRepository.existsById(999L)).thenReturn(false);
    assertThat(service.hide(5L, 999L)).isEmpty();
}
@Test void unhide_normalisesThenDeletes() {
    when(recipeRepository.existsById(6L)).thenReturn(true);
    RecipeFamilyMember light = memberOfFamily(6L, 100L, false);
    RecipeFamilyMember moderate = memberOfFamily(7L, 100L, true);
    when(recipeFamilyMemberRepository.findByRecipeId(6L)).thenReturn(Optional.of(light));
    when(recipeFamilyMemberRepository.findVariantsForRecipeWithMacroGraph(6L)).thenReturn(List.of(light, moderate));
    service.unhide(5L, 6L);
    verify(userHiddenRecipeRepository).deleteByUserIdAndRecipeId(5L, 7L);
}
@Test void listHidden_returnsIdsForThatUserOnly() {
    when(userHiddenRecipeRepository.findByUserId(5L)).thenReturn(List.of(new UserHiddenRecipe(1L, 5L, 7L, null)));
    assertThat(service.listHidden(5L)).containsExactly(7L);
}
```
`memberOfFamily(recipeId, familyId, isDefault)` is a private test helper that builds a `RecipeFamilyMember` whose `getRecipe().getId()` returns `recipeId`. Read `model/RecipeFamilyMember.java` first and use its real setters.

- [x] **Step 2: Run them and see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HiddenRecipeServiceTest`
Expected: compilation error, `HiddenRecipeService` not found.

- [x] **Step 3: Implement**

```java
/**
 * Per-person "Hide from my recipes" (Recipes redesign). Keys are the family's DEFAULT recipe id,
 * so hiding any variant hides the whole family. Keyed by the requesting user, never the shared
 * meal-plan owner. Never touches meal_plan_entries; independent of recipes.is_live.
 */
@Service
@RequiredArgsConstructor
public class HiddenRecipeService {
    private final UserHiddenRecipeRepository userHiddenRecipeRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeFamilyMemberRepository recipeFamilyMemberRepository;

    @Transactional(readOnly = true)
    public List<Long> listHidden(Long userId) {
        return userHiddenRecipeRepository.findByUserId(userId).stream().map(UserHiddenRecipe::getRecipeId).toList();
    }

    @Transactional
    public Optional<Long> hide(Long userId, Long recipeId) {
        return normalise(recipeId).map(key -> {
            if (!userHiddenRecipeRepository.existsByUserIdAndRecipeId(userId, key)) {
                try {
                    userHiddenRecipeRepository.save(new UserHiddenRecipe(null, userId, key, null));
                } catch (DataIntegrityViolationException alreadyHiddenByAConcurrentRequest) {
                    // unique (user_id, recipe_id): the other request won, the end state is the same
                }
            }
            return key;
        });
    }

    @Transactional
    public void unhide(Long userId, Long recipeId) {
        normalise(recipeId).ifPresent(key -> userHiddenRecipeRepository.deleteByUserIdAndRecipeId(userId, key));
    }

    /** Family default id, or the recipe itself when it has no family / no default. Empty if unknown. */
    @Transactional(readOnly = true)
    public Optional<Long> normalise(Long recipeId) {
        if (!recipeRepository.existsById(recipeId)) return Optional.empty();
        return Optional.of(recipeFamilyMemberRepository.findByRecipeId(recipeId)
            .flatMap(m -> recipeFamilyMemberRepository.findVariantsForRecipeWithMacroGraph(recipeId).stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsDefault()))
                .map(v -> v.getRecipe().getId())
                .findFirst())
            .orElse(recipeId));
    }
}
```
If `RecipeFamilyMemberRepository` has a lighter finder for siblings than `findVariantsForRecipeWithMacroGraph` (one without the macro graph fetch), use it in both the service and the tests. Read the repository first.

- [x] **Step 4: Run them and see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HiddenRecipeServiceTest`
Expected: `Tests run: 7, Failures: 0, Errors: 0`.

### Task 34: HiddenRecipeController + DTOs ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/HiddenRecipesDTO.java`, `dto/HiddenRecipeDTO.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/HiddenRecipeController.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/HiddenRecipeControllerTest.java`

- [x] **Step 1: Write the failing tests** (the style of `MealPlanControllerTest`: `@InjectMocks` controller, `@Mock HiddenRecipeService`, `@Mock UserPrincipal`)

```java
@Test void list_returnsIds() {
    when(userPrincipal.getId()).thenReturn(5L);
    when(hiddenRecipeService.listHidden(5L)).thenReturn(List.of(7L, 23L));
    ResponseEntity<?> r = controller.list(userPrincipal);
    assertThat(r.getStatusCode().value()).isEqualTo(200);
    assertThat(((HiddenRecipesDTO) r.getBody()).getRecipeIds()).containsExactly(7L, 23L);
}
@Test void hide_returnsNormalisedKey() {
    when(userPrincipal.getId()).thenReturn(5L);
    when(hiddenRecipeService.hide(5L, 6L)).thenReturn(Optional.of(7L));
    ResponseEntity<?> r = controller.hide(userPrincipal, 6L);
    assertThat(r.getStatusCode().value()).isEqualTo(200);
    assertThat(((HiddenRecipeDTO) r.getBody()).getRecipeId()).isEqualTo(7L);
}
@Test void hide_unknownRecipe_returns404() {
    when(userPrincipal.getId()).thenReturn(5L);
    when(hiddenRecipeService.hide(5L, 999L)).thenReturn(Optional.empty());
    assertThat(controller.hide(userPrincipal, 999L).getStatusCode().value()).isEqualTo(404);
}
@Test void unhide_returns204() {
    when(userPrincipal.getId()).thenReturn(5L);
    assertThat(controller.unhide(userPrincipal, 6L).getStatusCode().value()).isEqualTo(204);
    verify(hiddenRecipeService).unhide(5L, 6L);
}
@Test void unauthenticated_returns403_everywhere() {
    assertThat(controller.list(null).getStatusCode().value()).isEqualTo(403);
    assertThat(controller.hide(null, 6L).getStatusCode().value()).isEqualTo(403);
    assertThat(controller.unhide(null, 6L).getStatusCode().value()).isEqualTo(403);
    verifyNoInteractions(hiddenRecipeService);
}
```

- [x] **Step 2: Run them and see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HiddenRecipeControllerTest`
Expected: compilation error.

- [x] **Step 3: Implement.** DTOs: `@Data @NoArgsConstructor @AllArgsConstructor` with `List<Long> recipeIds` / `Long recipeId`. Controller:

```java
/** Per-person hidden recipes for the Recipes screen. The caller's own list, never the shared plan owner's. */
@RestController
@RequestMapping("/api/hidden-recipes")
@RequiredArgsConstructor
public class HiddenRecipeController {
    private final HiddenRecipeService hiddenRecipeService;

    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) return forbidden();
        return ResponseEntity.ok(new HiddenRecipesDTO(hiddenRecipeService.listHidden(userPrincipal.getId())));
    }

    @PutMapping("/{recipeId}")
    public ResponseEntity<?> hide(@AuthenticationPrincipal UserPrincipal userPrincipal, @PathVariable Long recipeId) {
        if (userPrincipal == null) return forbidden();
        return hiddenRecipeService.hide(userPrincipal.getId(), recipeId)
            .<ResponseEntity<?>>map(key -> ResponseEntity.ok(new HiddenRecipeDTO(key)))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{recipeId}")
    public ResponseEntity<?> unhide(@AuthenticationPrincipal UserPrincipal userPrincipal, @PathVariable Long recipeId) {
        if (userPrincipal == null) return forbidden();
        hiddenRecipeService.unhide(userPrincipal.getId(), recipeId);
        return ResponseEntity.noContent().build();
    }

    private static ResponseEntity<?> forbidden() {
        return ResponseEntity.status(403).body(Map.of("error", "Authentication required to manage hidden recipes"));
    }
}
```
No SecurityConfig change: `/api/hidden-recipes/**` already falls under `anyRequest().authenticated()`.

- [x] **Step 4: Run them and see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HiddenRecipeControllerTest`
Expected: `Tests run: 5, Failures: 0, Errors: 0`.

---

## Phase 8 — Recipes frontend foundations (no visible change)

Constants, pure helpers, the hidden-recipes service and the three Recipes hooks. Nothing renders them yet; the build stays green.

### Task 35: Recipes UI constants ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/constants/recipesUi.js`

- [x] **Step 1: Create**

```js
/** Recipes screen redesign: tabs and variant order. Meal keys match the backend `meals.key`. */
export const RECIPE_MEAL_TABS = ['breakfast', 'lunch', 'dinner', 'snacks', 'extras']
export const RECIPE_TAB_LABELS = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks', extras: 'Extras'
}
/** Segment order (recipe-variants rule: Light < Moderate (default) < Balanced). */
export const VARIANT_ORDER = ['Light', 'Moderate', 'Balanced']
```

- [x] **Step 2: Verify**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {RECIPE_MEAL_TABS, VARIANT_ORDER} from './src/constants/recipesUi.js'; console.log(RECIPE_MEAL_TABS.length, VARIANT_ORDER.join('/'))"`
Expected: `5 Light/Moderate/Balanced`

### Task 36: Recipe catalogue helpers ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/utils/recipeCatalogueUtils.js`

- [x] **Step 1: Create the pure helpers**

```js
import { RECIPE_MEAL_TABS } from '../constants/recipesUi.js'

/** The family's default recipe id (what the server stores for a hide), or the recipe's own id. */
export function hideKeyOf(recipe) {
  return recipe?.variants?.find(v => v.isDefault)?.recipeId ?? recipe?.id
}

/** { breakfast: [...], lunch: [...], ... } using each recipe's mealTypes (a recipe can sit in several tabs). */
export function groupByMeal(recipes) {
  const out = Object.fromEntries(RECIPE_MEAL_TABS.map(k => [k, []]))
  for (const r of recipes || []) for (const k of r.mealTypes || []) if (out[k]) out[k].push(r)
  return out
}

/** Every recipe id assigned anywhere in the week (any slot). */
export function recipeIdsInWeek(weekPlan) {
  const ids = new Set()
  for (const day of weekPlan?.days || [])
    for (const entries of Object.values(day.mealsByType || {}))
      for (const e of entries) if (e.recipe?.id) ids.add(e.recipe.id)
  return ids
}

/**
 * FR-102 (moved from RecipeList): when a non-default sibling is in the plan, show that variant on the card.
 * Summary-shaped objects only; the variant's own per-serving numbers replace the default's.
 */
export function swapWithPlanVariants(recipes, planRecipeIds) {
  if (!planRecipeIds.size) return recipes
  return recipes.map(r => {
    if (!r.variants || r.variants.length < 2) return r
    const v = r.variants.find(x => x.recipeId !== r.id && planRecipeIds.has(x.recipeId))
    return v ? { ...r, id: v.recipeId, name: v.recipeName, variantLabel: v.variantLabel, isDefault: v.isDefault,
      calories: v.caloriesPerServing * r.defaultServings } : r
  })
}

/** The entry in a given slot, or null. */
export function slotEntryFor(weekPlan, dateISO, mealKey) {
  const day = weekPlan?.days?.find(d => d.date === dateISO)
  return day?.mealsByType?.[mealKey]?.[0] ?? null
}

/**
 * Per-serving {protein, carbs, fat} for the selected variant. Summaries carry *PerServing fields;
 * admin RecipeDTOs carry protein/carbs/fat (also per serving). Null when nothing is known.
 */
export function cardMacros(recipe, selectedVariantId) {
  const v = recipe?.variants?.find(x => x.recipeId === selectedVariantId)
  const src = v ?? recipe
  const protein = src?.proteinPerServing ?? (v ? null : recipe?.protein)
  const carbs = src?.carbsPerServing ?? (v ? null : recipe?.carbs)
  const fat = src?.fatPerServing ?? (v ? null : recipe?.fat)
  return protein == null || carbs == null || fat == null ? null : { protein, carbs, fat }
}
```

- [x] **Step 2: Smoke-check**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {hideKeyOf, groupByMeal, cardMacros} from './src/utils/recipeCatalogueUtils.js'; const r={id:6,mealTypes:['breakfast','snacks'],variants:[{recipeId:6,isDefault:false,proteinPerServing:36,carbsPerServing:62,fatPerServing:13},{recipeId:7,isDefault:true}]}; const g=groupByMeal([r]); console.log(hideKeyOf(r), g.breakfast.length, g.snacks.length, g.lunch.length, JSON.stringify(cardMacros(r,6)), hideKeyOf({id:23,variants:[]}))"`
Expected: `7 1 1 0 {"protein":36,"carbs":62,"fat":13} 23`

### Task 37: hiddenRecipeService ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/services/hiddenRecipeService.js`

- [x] **Step 1: Create** (same shape as the other service modules: named object + default export, `api` from `./api`)

```js
import api from './api'

/** Per-person hidden recipes (Recipes redesign). All calls require a signed-in user. */
export const hiddenRecipeService = {
  /** @returns {Promise<number[]>} hidden family keys */
  async listHidden() {
    const response = await api.get('/hidden-recipes')
    return response.data.recipeIds
  },
  /** @returns {Promise<number>} the normalised key the server stored */
  async hide(recipeId) {
    const response = await api.put(`/hidden-recipes/${recipeId}`)
    return response.data.recipeId
  },
  async unhide(recipeId) {
    await api.delete(`/hidden-recipes/${recipeId}`)
  }
}

export default hiddenRecipeService
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 38: useRecipeCatalogue hook ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/hooks/useRecipeCatalogue.js`

- [x] **Step 1: Create.** Read `services/recipeService.js` first. Use `getAllRecipeSummaries` if it exists; otherwise add `async getAllRecipeSummaries({ signal } = {}) { return (await api.get('/recipes/summaries', { signal })).data }` to that service (and list `services/recipeService.js` under this task's Modify). Extend `getAllRecipesAdmin` to accept `{ signal }` the same way.

```js
import { useCallback, useEffect, useRef, useState } from 'react'
import recipeService from '../services/recipeService'
import { useMealPlan } from '../contexts/MealPlanContext'
import { groupByMeal, recipeIdsInWeek, swapWithPlanVariants } from '../utils/recipeCatalogueUtils'

const LOAD_ERROR = 'Failed to load recipes. Please try again.'

/**
 * Loads the whole catalogue once (users: live summaries; admins: everything incl. not-live) and groups it
 * by meal tab. FR-102 variant swap is applied from the week plan at load time, as RecipeList did.
 */
export default function useRecipeCatalogue({ isAdmin }) {
  const { weekPlan } = useMealPlan()
  const weekPlanRef = useRef(weekPlan)
  weekPlanRef.current = weekPlan
  const [state, setState] = useState({ recipesByMeal: groupByMeal([]), loading: true, error: null })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState(s => ({ ...s, loading: true, error: null }))
    const load = isAdmin
      ? recipeService.getAllRecipesAdmin(null, { signal: controller.signal })
      : recipeService.getAllRecipeSummaries({ signal: controller.signal })
    load
      .then(list => {
        const swapped = swapWithPlanVariants(list, recipeIdsInWeek(weekPlanRef.current))
        setState({ recipesByMeal: groupByMeal(swapped), loading: false, error: null })
      })
      .catch(err => {
        if (controller.signal.aborted || err?.name === 'CanceledError') return
        setState(s => ({ ...s, loading: false, error: err.response?.data?.error || LOAD_ERROR }))
      })
    return () => controller.abort()
  }, [isAdmin, reloadToken])

  const reload = useCallback(() => setReloadToken(t => t + 1), [])
  const counts = Object.fromEntries(Object.entries(state.recipesByMeal).map(([k, v]) => [k, v.length]))
  return { ...state, counts, reload }
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 39: useHiddenRecipes hook ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/hooks/useHiddenRecipes.js`

- [x] **Step 1: Create**

```js
import { useCallback, useEffect, useRef, useState } from 'react'
import hiddenRecipeService from '../services/hiddenRecipeService'
import { hideKeyOf } from '../utils/recipeCatalogueUtils'
import { UNDO_REMOVE_MS, INFO_TOAST_MS } from '../constants/mealPlanUi'

const HIDE_ERROR = "Couldn't update your hidden recipes. Please try again."

/**
 * Per-person hidden recipe keys for the Recipes screen (feature state, deliberately not a Context).
 * Hide is sent immediately and Undo un-hides, because it is fully reversible server-side. A failed
 * initial load leaves `loadFailed` true and Hide disabled, so a failure is never mistaken for "nothing hidden".
 */
export default function useHiddenRecipes({ isAuthenticated }) {
  const [hiddenKeys, setHiddenKeys] = useState(() => new Set())
  const [loading, setLoading] = useState(isAuthenticated)
  const [loadFailed, setLoadFailed] = useState(false)
  const [toast, setToast] = useState(null)        // { message, canUndo }
  const lastHidden = useRef(null)
  const toastTimer = useRef(null)

  const load = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return }
    setLoading(true)
    try {
      setHiddenKeys(new Set(await hiddenRecipeService.listHidden()))
      setLoadFailed(false)
    } catch {
      setLoadFailed(true)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => { load() }, [load])
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const show = (message, canUndo) => {
    clearTimeout(toastTimer.current)
    setToast({ message, canUndo })
    toastTimer.current = setTimeout(() => setToast(null), canUndo ? UNDO_REMOVE_MS : INFO_TOAST_MS)
  }
  const setKey = (key, on) => setHiddenKeys(prev => { const n = new Set(prev); on ? n.add(key) : n.delete(key); return n })

  const hide = useCallback(async (recipe) => {
    const key = hideKeyOf(recipe)
    setKey(key, true)
    lastHidden.current = recipe
    show(`Hid ${recipe.name}`, true)
    try { await hiddenRecipeService.hide(key) } catch (err) {
      setKey(key, false); lastHidden.current = null
      show(err.response?.data?.error || HIDE_ERROR, false)
    }
  }, [])

  const unhide = useCallback(async (recipe, { silent = false } = {}) => {
    const key = hideKeyOf(recipe)
    setKey(key, false)
    if (!silent) show(`${recipe.name} is back`, false)
    try { await hiddenRecipeService.unhide(key) } catch (err) {
      setKey(key, true)
      show(err.response?.data?.error || HIDE_ERROR, false)
    }
  }, [])

  const undo = useCallback(() => {
    if (!lastHidden.current) return
    const recipe = lastHidden.current
    lastHidden.current = null
    setToast(null)
    unhide(recipe, { silent: true })
  }, [unhide])

  const isHidden = useCallback((recipe) => hiddenKeys.has(hideKeyOf(recipe)), [hiddenKeys])

  return { hiddenKeys, isHidden, hide, unhide, undo, toast, dismissToast: () => setToast(null),
    loading, loadFailed, retry: load, canHide: isAuthenticated && !loading && !loadFailed }
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 40: usePickingMode hook ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/hooks/usePickingMode.js`

- [x] **Step 1: Create**

```js
import { useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMealPlan } from '../contexts/MealPlanContext'
import { RECIPE_MEAL_TABS } from '../constants/recipesUi'
import { PICK_FROM_MEALPLAN } from '../constants/mealPlanUi'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Recipes tab + picking mode, held in the URL: ?mealType=lunch&date=2026-11-15&from=mealplan.
 * A picked date outside the visible week moves the week so the strip and day buttons can show it.
 */
export default function usePickingMode() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { startDate, endDate, setStartDate } = useMealPlan()

  const rawMeal = params.get('mealType')
  const activeMeal = RECIPE_MEAL_TABS.includes(rawMeal) ? rawMeal : 'breakfast'
  const rawDate = params.get('date')
  const pickDate = rawDate && ISO_DATE.test(rawDate) ? rawDate : null
  const fromMealPlan = params.get('from') === PICK_FROM_MEALPLAN

  useEffect(() => {
    if (pickDate && (pickDate < startDate || pickDate > endDate)) setStartDate(pickDate)
  }, [pickDate, startDate, endDate, setStartDate])

  const update = useCallback((next) => {
    const p = new URLSearchParams()
    Object.entries(next).forEach(([k, v]) => { if (v) p.set(k, v) })
    setParams(p, { replace: true })
  }, [setParams])

  const setActiveMeal = useCallback((meal) => update({ mealType: meal }), [update])
  const startPicking = useCallback((dateISO) => update({ mealType: activeMeal, date: dateISO }), [update, activeMeal])
  /** Leave picking mode; when we came from the Meal Plan, go back there. */
  const finishPicking = useCallback(() => {
    if (fromMealPlan) navigate('/mealplan')
    else update({ mealType: activeMeal })
  }, [fromMealPlan, navigate, update, activeMeal])

  return { activeMeal, setActiveMeal, pickDate, fromMealPlan, startPicking, finishPicking }
}
```
Read `getInitialStartDate` / `setStartDate` in `MealPlanContext.jsx` first. If the week must start on a particular weekday, pass that week's start (via the `getDefaultStartDate`-style helper exported in Task 12) rather than the raw `pickDate`.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

---

## Phase 9 — Recipe card pieces

New leaf components plus the re-rendered `DayAssignmentButtons`. `RecipeList` still renders the old `RecipeCard` until Phase 10. `DayAssignmentButtons`' new props are optional, so the old card keeps working, and the build stays green.

### Task 41: VariantSegment ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/recipes/VariantSegment.jsx` (styles in `RecipeCard.css`)

- [x] **Step 1: Create.** Props: `{ variants, selectedId, onSelect, fallbackKcal }`. If `variants.length < 2`, render `<p className="variant-single"><b>{fallbackKcal} kcal</b> per serving</p>`. Otherwise sort by `VARIANT_ORDER.indexOf(variantLabel)` (unknown labels go last, in `displayOrder` order) and render a `role="radiogroup"` `aria-label="Variant"` with one `role="radio"` button per variant (`aria-checked`), each showing `{variantLabel}` and `<b>{caloriesPerServing}</b>`. Arrow keys move the selection, and each button is ≥44 px tall. CSS is the mockup `.seg` block (3-column grid, `--bg-secondary` track, white raised selected pill, brand text).

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 42: ServingsChip ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/recipes/ServingsChip.jsx` (styles in `RecipeCard.css`)

- [x] **Step 1: Create.** Props: `{ servings, onChange }`. A button `👥 {formatServings(servings)} ▾` (`aria-haspopup="dialog"`, `aria-expanded`) toggles a popover with − / editable input / +. Behaviour moves from `RecipeCard.jsx` lines ~47–64: `parseServings`, `formatServings`, `stepServings`, `MIN_SERVINGS`, `MAX_SERVINGS`, `SERVINGS_STEP`, with the same display-buffer and blur behaviour. It closes on outside-click or Escape and calls `onChange(next)` on each valid change. The buttons are 44 px.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 43: RecipeCardMenu ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/recipes/RecipeCardMenu.jsx` (styles in `RecipeCard.css`)

- [x] **Step 1: Create.** Props: `{ recipeName, isHidden, canHide, isAdmin, onView, onHide, onUnhide, onEdit }`. A ⋯ trigger (`aria-label={`More actions for ${recipeName}`}`, 44 px) opens a `role="menu"` with `📖 View recipe`, then `👁 Unhide` if `isHidden`, else `🙈 Hide from my recipes` (rendered only when `canHide`), then `✏️ Edit` only when `isAdmin`. It uses the same outside-click and Escape effect as `MealPlanMenu`.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 44: DayAssignmentButtons — three states, no kcal, picking mode ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/recipes/DayAssignmentButtons.jsx` (signature line 25, `getButtonTitle` ~160, render ~185–210), `client/src/components/recipes/DayAssignmentButtons.css`

- [x] **Step 1: Keep all assign logic** (`getButtonClass`, `handleDayClick`, extras popup, `performAssignment`, toggle-off) exactly as it is. Change only:
  - The signature: add optional `pickDate` and `onAssigned`: `function DayAssignmentButtons({ recipe, servings, currentMealType, selectedRecipeId, pickDate = null, onAssigned })`.
  - `getMealId`: replace the local map with `MEAL_SLOTS`/`SNACKS_SLOT` from `constants/mealPlanUi.js` (`[...MEAL_SLOTS, SNACKS_SLOT].find(s => s.key === mealType?.toLowerCase())?.mealId ?? 1`).
  - `getButtonTitle`: for `already-selected`, read the occupant via `slotEntryFor(weekPlan, dateStr, currentMealType)` and return `` `Replace ${entry.recipe?.name} on ${dayName}` ``.
  - `performAssignment`: after calling `assignRecipe(...)`, call `onAssigned?.(dateStr)`, but **not** when the click was a toggle-off (`buttonClass === 'selected'`). Pass that flag from `handleDayClick` / `handleExtrasConfirm`.
  - Render, when `pickDate` is set: a single `<button className={`pick-btn ${cls}`} onClick={() => handleDayClick(pickDate)}>` labelled `✓ On {Day}` (selected) / `Replace on {Day} {n}` (already-selected) / `Add to {Day} {n}` (unselected), plus the unchanged extras popup.
  - Render, otherwise: the 7 day buttons showing **only** `day.dayName` (remove `<span className="day-cal">` and the `getDailyCalories` destructure). Keep the class names `selected` / `already-selected` / `unselected`, plus `aria-label`, `title` and `aria-pressed={buttonClass === 'selected'}`.
  - Update the doc comment (FR-050 "daily calories above each day button" is removed by this redesign).

- [x] **Step 2: CSS.** `.day-btn` 40 px tall visual with a 44 px hit area via padding, white with a grey border. `.already-selected`: background `var(--bg-secondary)`, muted text, and a `::after` 6 px dot `#b8b2d6` top-right. `.selected`: brand background, white text, `::before` content `"✓ "`. `.pick-btn`: full width, 44 px, brand background (green `var(--success)` when `.selected`). Hover only inside `@media (hover: hover)`, each with an `:active` twin. Delete the `.day-cal` rules.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 45: RecipeCard rebuilt ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/recipes/RecipeCard.jsx` (full rewrite of the render; keep `RecipeViewModal` wiring), `client/src/components/recipes/RecipeCard.css`

- [x] **Step 1: Rewrite.** Props: `{ recipe, currentMealType, inPlan, isHidden, canHide, onHide, onUnhide, onEdit, onSelectVariant, pickDate, onAssigned }`. State: `selectedVariantId` (initial `recipe.id`), `servings` (initial `resolveStartingServings(recipe, userDefaultServings)`, as today), `showFullscreen`. Layout:

```jsx
<article className={`recipe-card ${inPlan ? 'is-in-plan' : ''} ${isHidden ? 'is-hidden' : ''}`}>
  <div className="recipe-card-top">
    <button type="button" className="recipe-card-name" onClick={() => setShowFullscreen(true)}>{recipe.name}</button>
    {recipe.isCheat && <span className="cheat-badge">Cheat</span>}
    {isAdmin && recipe.macrosAudited && <span className="audited-badge" title="Macros and calories signed off">✓ Audited</span>}
    <RecipeCardMenu recipeName={recipe.name} isHidden={isHidden} canHide={canHide} isAdmin={isAdmin && !!onEdit}
      onView={() => setShowFullscreen(true)} onHide={() => onHide(recipe)} onUnhide={() => onUnhide(recipe)}
      onEdit={() => onEdit(selectedVariantId)} />
  </div>
  <VariantSegment variants={recipe.variants || []} selectedId={selectedVariantId}
    onSelect={(id) => { setSelectedVariantId(id); if (id !== recipe.id) onSelectVariant?.(id, servings) }}
    fallbackKcal={Math.round(recipe.calories / recipe.defaultServings)} />
  <div className="recipe-card-row">
    <MacroChips macros={cardMacros(recipe, selectedVariantId)} targets={MACRO_TARGETS} />
    <ServingsChip servings={servings} onChange={setServings} />
    {inPlan && <span className="in-plan-badge">In plan</span>}
  </div>
  {isHidden
    ? <button type="button" className="unhide-btn" onClick={() => onUnhide(recipe)}>👁 Unhide</button>
    : <DayAssignmentButtons recipe={recipe} servings={servings} currentMealType={currentMealType}
        selectedRecipeId={selectedVariantId} pickDate={pickDate} onAssigned={onAssigned} />}
  {showFullscreen && <RecipeViewModal /* the exact props block RecipeCard passes today */ />}
</article>
```
`cardMacros` returns `null` when the macro fields are absent, and `MacroChips` then renders nothing. That covers a frontend deployed before the backend. Before using `MacroChips`, confirm that `hasUsableMacros(null)` returns false; if it doesn't, guard with `macros && …`. Delete the random `stripeColors` logic, the calorie dropdown, the `variant-badge`, the inline servings pill and the commented-out "Show Details" block. Keep `handleModalVariantSelect` and the `RecipeViewModal` props.

- [x] **Step 2: CSS.** Card: white, radius 14 px, padding 14 px, flex column gap 10 px. `.is-in-plan`: `box-shadow: inset 4px 0 0 var(--brand-primary)`. `.is-hidden`: opacity .6 on `--bg-secondary`. The name is a 2-line clamp, 16 px bold, a button reset with a `:focus-visible` ring. Delete `.card-stripe*`, `.meta-pill`, `.cal-dropdown*`, `.calorie-dropdown*`, `.variant-badge`, `.servings-pill*`, `.view-recipe-btn` and `.card-footer` unless `RecipeViewModal.css` still references them (it styles `.recipe-view-modal .calorie-dropdown-item`; leave anything scoped under `.recipe-view-modal`).

- [x] **Step 3: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\recipes\RecipeCard.jsx | Measure-Object -Line).Lines`
Expected: build OK; < 200 lines (was 275).

---

## Phase 10 — Recipes screen assembled

New toolbar, strip and banner, and the `RecipeList` shell that ties the hooks together. This is the phase where the Recipes screen visibly switches over; it ends with a green build and the manual walkthrough.

### Task 46: RecipeToolbar ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/recipes/RecipeToolbar.jsx`, `client/src/components/recipes/RecipeToolbar.css`

- [x] **Step 1: Create.** Props: `{ activeMeal, counts, onMealChange, query, onQueryChange, hiddenCount, showHidden, onToggleHidden, hiddenAvailable, isAdmin, onAddRecipe }`.
  - **Meal tabs:** a `role="tablist"` with `RECIPE_MEAL_TABS` buttons, each showing `RECIPE_TAB_LABELS[k]` and a `<span className="tab-count">{counts[k]}</span>`.
  - **Search:** a `type="search"` input (`aria-label="Search recipes"`, placeholder `Search {label} recipes`).
  - **Hidden chip:** `🙈 Hidden ({hiddenCount})` with `aria-pressed={showHidden}`, rendered only when `hiddenAvailable` is true.
  - **Admin:** `+ Add Recipe` when `isAdmin`.
  - **Mobile (≤768 px):** search full width on top; the 5 tabs in one row with `flex:1`, 13 px text and counts hidden, so they fit at 390 px; then the Hidden chip. The whole block is `position: sticky; top: 0` with a white background.
  - **Desktop:** one wrapping row.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 47: WeekSlotStrip + PickingBanner ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/recipes/WeekSlotStrip.jsx`, `client/src/components/recipes/PickingBanner.jsx` (styles in `RecipeToolbar.css`)

- [x] **Step 1: `WeekSlotStrip`.** Props: `{ weekPlan, mealKey, mealLabel, pickDate, onPickDay, onOpenRecipe }`.
  - **Header:** `This week's {mealLabel.toLowerCase()}`, plus `N day(s) still empty` or `All 7 days planned ✓`.
  - **Tiles:** 7 buttons in a `repeat(7, minmax(0,1fr))` grid. For each `day` in `weekPlan.days`, the entry is `slotEntryFor(weekPlan, day.date, mealKey)`. A tile shows `{dayOfWeek} {day number}`, then the entry's recipe name (2-line clamp) or an amber `+ Pick one`.
  - **States:** `.is-today` gets an inset brand ring; `.is-picking` (date === pickDate) a brand background.
  - **Clicks:** a filled tile calls `onOpenRecipe(entry)`; an empty tile calls `onPickDay(day.date)`.
  - **Labels:** `aria-label` "Pick {meal} for {Day}" / "{recipe} on {Day}".
  - **Mobile:** names hidden; a small dot (amber when empty) instead.
  - Render nothing when `weekPlan` is null.

- [x] **Step 2: `PickingBanner`.** Props: `{ mealLabel, pickDate, onCancel }`. A `role="status"` bar reading `Picking <b>{meal}</b> for <b>{Day} {n}</b>. Tap "Add to {Day}" on any recipe.`, with a Cancel button (44 px). Format the day with `formatDateShort` / `getShortDayName` from `utils/dateUtils`.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 48: RecipeList becomes the shell ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/recipes/RecipeList.jsx` (full rewrite), `client/src/components/recipes/RecipeList.css`

- [x] **Step 1: Rewrite.** It keeps `RecipeEditModal` (edit and new) and `handleSelectVariant` (fetch the full variant and replace it in the list; it now replaces inside `recipesByMeal[activeMeal]`, so keep a local `overrides` map `{ [familyKey]: variantRecipe }` instead of mutating hook state). Wiring:

```jsx
const { isAdmin, isAuthenticated } = useAuth()
const { weekPlan } = useMealPlan()
const { activeMeal, setActiveMeal, pickDate, startPicking, finishPicking } = usePickingMode()
const { recipesByMeal, counts, loading, error, reload } = useRecipeCatalogue({ isAdmin })
const hidden = useHiddenRecipes({ isAuthenticated })
const [query, setQuery] = useState('')
const [showHidden, setShowHidden] = useState(false)
const [openRecipeEntry, setOpenRecipeEntry] = useState(null)   // strip → RecipeViewModal
const planIds = recipeIdsInWeek(weekPlan)

const visible = (recipesByMeal[activeMeal] || [])
  .map(r => overrides[hideKeyOf(r)] ?? r)
  .filter(r => showHidden ? hidden.isHidden(r) : !hidden.isHidden(r))
  .filter(r => r.name.toLowerCase().includes(query.trim().toLowerCase()))
const visibleCounts = Object.fromEntries(Object.entries(recipesByMeal).map(([k, list]) => [k, list.filter(r => !hidden.isHidden(r)).length]))
const hiddenCount = new Set(Object.values(recipesByMeal).flat().filter(hidden.isHidden).map(hideKeyOf)).size
const inPlan = (r) => [r.id, ...(r.variants || []).map(v => v.recipeId)].some(id => planIds.has(id))
```
Render, in order:
1. `RecipeToolbar` (counts = `visibleCounts`, `hiddenAvailable={isAuthenticated && !hidden.loadFailed}`).
2. If `hidden.loadFailed`: an inline notice "Couldn't load your hidden recipes." with a Retry button (`hidden.retry`).
3. Unless `showHidden`: `WeekSlotStrip` (only when `isAuthenticated`), then `PickingBanner` when `pickDate`.
4. **Loading:** the existing spinner. **Error:** `error` + a Retry button (`reload`); never the empty message.
5. **Grid:** `RecipeCard` for each visible recipe, with `inPlan`, `isHidden={hidden.isHidden(r)}`, `canHide={hidden.canHide}`, `onHide={hidden.hide}`, `onUnhide={hidden.unhide}`, `onEdit` (admins), `pickDate`, and `onAssigned={() => { if (pickDate) finishPicking() }}`.
6. **Empty:** in Hidden view, "Nothing hidden in {meal}."; with a query, "No {meal} recipes match "{query}"."; otherwise the existing "No recipes found for {meal}.".
7. `<UndoToast toast={hidden.toast} onUndo={hidden.undo} />` (from `components/common`).
8. `RecipeViewModal` for `openRecipeEntry` (strip click), using the same props `MealCard` passes for an entry.

`onPickDay` → `startPicking(date)`. Leaving Hidden view clears nothing else. Switching tab keeps the query (the mockup does) and clears picking only through `setActiveMeal`, which drops `date`. Delete the old `MEAL_TYPES` literal and the `searchParams.delete('mealType')` effect.

- [x] **Step 2: CSS.** Grid `repeat(auto-fill, minmax(300px, 1fr))`, gap 14 px; one column ≤768 px with gap 10 px and compact card padding (12 px). The hidden-view note uses a dashed brand border.

- [x] **Step 3: Build and measure**

Run: `cd foodbytes-app\client; npm run build; Get-ChildItem src\components\recipes\RecipeList.jsx,src\components\recipes\RecipeCard.jsx,src\components\recipes\DayAssignmentButtons.jsx,src\components\recipes\RecipeToolbar.jsx,src\components\recipes\WeekSlotStrip.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }`
Expected: build OK; every file < 250 lines (hard limit 400). If `RecipeList.jsx` exceeds 250, move the filtering/counting block into `useRecipeListView({ recipesByMeal, activeMeal, query, showHidden, hidden, overrides })` in `hooks/`.

### Task 49: Manual walkthrough — Recipes + the Meal Plan link ⏳ — manual, pending developer walkthrough

- Skill: react-frontend

**Files:**
- Test: manual only (no frontend runner). Results go into `pr-description.md` (Task M.5).

- [ ] **Step 1: Run the stack as in Task 28 Step 1,** with the migration from Task 30 applied to whichever DB the backend uses. Open `http://localhost:5173/` and `recipes-mockup.html` side by side.

- [ ] **Step 2: Desktop (1366×768) checks:**
  1. Tabs show counts. Switching tabs makes no new network request (DevTools → Network: one `/api/recipes/summaries` per page load).
  2. Search filters the current tab as you type; an empty result shows the "No … match" message.
  3. The strip shows this week's slot per day, and "N days still empty" is correct. Clicking a planned tile opens that recipe.
  4. Clicking an empty tile shows the banner, and every card shows one "Add to <Day>" button. Adding exits picking mode, and the strip fills in.
  5. The variant segment switches Light/Moderate/Balanced; kcal and P/C/F chips change, and Edit (admin) opens the selected variant.
  6. Day buttons: empty white; another recipe grey + dot, with hover "Replace <name> on <Day>"; this recipe ✓. No daily kcal anywhere on the card.
  7. A recipe with extras still opens the extras popup before assigning; clicking a ✓ day still removes it.
  8. 👥 chip: the stepper changes servings, and the assigned entry carries them (check on Meal Plan).
  9. ⋯ → Hide removes the card and shows Undo; Undo brings it back. Hide again, reload, and it stays hidden. "Hidden (1)" lists it; Unhide restores it.
  10. Hiding a Light variant hides Moderate/Balanced too (the family). A hidden recipe already in the plan stays on the Meal Plan.
  11. As admin: Audited badge, ⋯ → Edit, and + Add Recipe all work.
  12. As a guest (signed out): no strip, no Hide, no day buttons (as today), and the cards still show.

- [ ] **Step 3: Meal Plan → Recipes round trip:** on `/mealplan`, click "+ Add lunch" on an empty day. Recipes opens on Lunch in picking mode for that day. "Add to <Day>" returns to `/mealplan` with the slot filled. Repeat with "↻ Replace Dinner", where the button reads "Replace on <Day>".

- [ ] **Step 4: Mobile (390×844, touch emulation):** all 5 tabs visible without scrolling; the search/tabs block stays put while scrolling; the strip shows dots; at least two cards are visible per screen; the ⋯ menu and the servings popover are usable by touch.

- [ ] **Step 5: Shared plan:** if a linked second account exists locally, hide a recipe as user A and confirm user B still sees it. Otherwise record "not verified".

---

## Phase 11 — Brand assets: logo C everywhere it's static

Adds `BrandMark`, the redrawn favicon, the icon sources and PNG exports, the manifest, the `index.html` head, and the logo on the sign-in modal and landing page. The header isn't touched yet; the build is green and every change is additive or a straight asset swap.

### Task 50: BrandMark component ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/common/BrandMark.jsx`

- [x] **Step 1: Create.** The geometry is logo C from `header-mockup.html` (`LOGOS.c`), verbatim:

```jsx
/**
 * My Pantry Plan logo (option C, "Plate P", chosen 2026-11-14): a purple tile, a white plate,
 * the P as the meal, and a Pip-green leaf. The same path data lives in public/favicon.svg and
 * public/icons/brand-mark*.svg; change all three together.
 * Decorative by default (aria-hidden); pass `title` when the mark stands alone as the only label.
 */
const BRAND_PURPLE = '#4a3f80'
const PLATE_RING = '#e3dff2'
const LEAF_GREEN = '#7cc36b'

function BrandMark({ size = 40, title, className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" width={size} height={size}
         role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} focusable="false">
      {title && <title>{title}</title>}
      <rect width="100" height="100" rx="24" fill={BRAND_PURPLE} />
      <circle cx="50" cy="52" r="33" fill="#fff" />
      <circle cx="50" cy="52" r="24" fill="none" stroke={PLATE_RING} strokeWidth="3" />
      <path d="M42 70V36h12a10 10 0 0 1 0 20H42" fill="none" stroke={BRAND_PURPLE} strokeWidth="9"
            strokeLinejoin="round" strokeLinecap="round" />
      <path d="M66 30c-8-1-14 4-14 11 8 1 14-4 14-11z" fill={LEAF_GREEN} />
    </svg>
  )
}

export default BrandMark
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 51: favicon + icon sources + PNG exports ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/public/favicon.svg` (full replace)
- Create: `foodbytes-app/client/public/icons/brand-mark.svg`, `foodbytes-app/client/public/icons/brand-mark-maskable.svg`
- Create: `foodbytes-app/client/public/icons/apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`

- [x] **Step 1: Write `public/favicon.svg` and `public/icons/brand-mark.svg`** with identical content (no width/height, so the file scales to its viewport):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="24" fill="#4a3f80"/>
  <circle cx="50" cy="52" r="33" fill="#fff"/>
  <circle cx="50" cy="52" r="24" fill="none" stroke="#e3dff2" stroke-width="3"/>
  <path d="M42 70V36h12a10 10 0 0 1 0 20H42" fill="none" stroke="#4a3f80" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M66 30c-8-1-14 4-14 11 8 1 14-4 14-11z" fill="#7cc36b"/>
</svg>
```

- [x] **Step 2: Write `public/icons/brand-mark-maskable.svg`**: a full-bleed square (Android/iOS round it themselves), with the mark scaled to 80% so the plate stays inside the maskable safe zone:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#4a3f80"/>
  <g transform="translate(10 10) scale(0.8)">
    <circle cx="50" cy="52" r="33" fill="#fff"/>
    <circle cx="50" cy="52" r="24" fill="none" stroke="#e3dff2" stroke-width="3"/>
    <path d="M42 70V36h12a10 10 0 0 1 0 20H42" fill="none" stroke="#4a3f80" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M66 30c-8-1-14 4-14 11 8 1 14-4 14-11z" fill="#7cc36b"/>
  </g>
</svg>
```

- [x] **Step 3: Export the PNGs with headless Chrome.** Rounded `any` icons get a transparent background; Apple and maskable come from the full-bleed source.

Run:
```powershell
cd foodbytes-app\client\public\icons
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$here = (Get-Location).Path -replace '\\','/'
function Export-Icon($src, $size, $out) { & $chrome --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size="$size,$size" --screenshot="$((Get-Location).Path)\$out" "file:///$here/$src" | Out-Null }
Export-Icon brand-mark.svg 192 icon-192.png
Export-Icon brand-mark.svg 512 icon-512.png
Export-Icon brand-mark-maskable.svg 512 icon-maskable-512.png
Export-Icon brand-mark-maskable.svg 180 apple-touch-icon.png
Get-ChildItem *.png | Select-Object Name, Length
```
Expected: four PNGs listed, each with `Length` > 1000. If Chrome is missing, use `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` with the same flags.

- [x] **Step 4: Verify the pixel sizes**

Run: `cd foodbytes-app\client\public\icons; python -c "from PIL import Image; import glob; [print(f, Image.open(f).size) for f in sorted(glob.glob('*.png'))]"`
Expected: `apple-touch-icon.png (180, 180)`, `icon-192.png (192, 192)`, `icon-512.png (512, 512)`, `icon-maskable-512.png (512, 512)`. Open `icon-512.png` and check it shows the plate, the P and the leaf on purple, with transparent corners.

### Task 52: manifest + index.html head ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/public/manifest.webmanifest`
- Modify: `foodbytes-app/client/index.html:5,11` (icon/title lines and the new head tags)

- [x] **Step 1: Create the manifest**

```json
{
  "name": "My Pantry Plan",
  "short_name": "Pantry Plan",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4a3f80",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```
Header comment for the PR (JSON has no comments): this file is replaced by `vite-plugin-pwa`'s generated manifest when the PWA is bootstrapped.

- [x] **Step 2: Edit `index.html`.** Keep `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`. Replace the title line with `<title>My Pantry Plan</title>`, and add under the icon link:

```html
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#4a3f80" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Pantry Plan" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

- [x] **Step 3: Build and confirm the assets are copied**

Run: `cd foodbytes-app\client; npm run build; Get-ChildItem dist\manifest.webmanifest, dist\favicon.svg, dist\icons\*.png | Select-Object Name`
Expected: the manifest, the favicon and all four PNGs listed under `dist`.

### Task 53: Logo on the sign-in modal and the landing page ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/auth/LoginModal.jsx:46-49` (+ its CSS file, imported at the top of the component)
- Modify: `client/src/components/onboarding/LandingPageAnimation.jsx:206-214`, `client/src/components/onboarding/LandingPageAnimation.css`

- [x] **Step 1: LoginModal.** Import `BrandMark` and put `<BrandMark size={72} className="login-brand-mark" />` as the first child of `.modal-header`, above `<h2>Welcome to My Pantry Plan</h2>`. CSS: `.login-brand-mark { display:block; margin: 0 auto 10px; filter: drop-shadow(0 2px 6px rgba(0,0,0,.15)); }`.

- [x] **Step 2: Landing phase 3.** Import `BrandMark` and render `<BrandMark size={120} className="landing-brand-mark animate-fade-in" />` as the first child of `.phase-3`, above `The Solution`. CSS: centred block, `margin: 0 auto 20px`. Below 480 px use 96 px (`width/height` via CSS on `.landing-brand-mark` overrides the attributes).

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

---

## Phase 12 — Header, shared nav, account menu, page titles

Moves the nav list into a shared hook and component, rebuilds the header around `BrandMark`, restyles the week pill, regroups the account menu, hides the footer on desktop (except on `/pet`), and adds per-route titles. The app shell switches over in this phase, which ends with a green build and the manual walkthrough.

### Task 54: Route list + page titles ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/constants/appRoutes.js`, `client/src/hooks/useDocumentTitle.js`
- Modify: `client/src/App.jsx` (call the hook once inside the routed shell)

- [x] **Step 1: Create `constants/appRoutes.js`**

```js
import { PET_GUEST_MESSAGE } from './pet'

export const APP_NAME = 'My Pantry Plan'

/** The four app sections, in nav order. Shared by the header nav, the footer nav and page titles. */
export const APP_ROUTES = [
  { key: 'recipes', path: '/', label: 'Recipes', title: 'Recipes', requiresAuth: false },
  { key: 'mealplan', path: '/mealplan', label: 'Meal Plan', title: 'Meal Plan', requiresAuth: true,
    guestMessage: 'Sign in to access meal planning!' },
  { key: 'pet', path: '/pet', label: null, title: 'Pip', requiresAuth: true, guestMessage: PET_GUEST_MESSAGE },
  { key: 'shopping', path: '/shopping', label: 'Shopping', title: 'Shopping', requiresAuth: true,
    guestMessage: 'Sign in to access shopping list!' }
]

/** "Meal Plan · My Pantry Plan"; trailing slashes ignored; unknown paths get the bare app name. */
export function routeTitle(pathname) {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/'
  const route = APP_ROUTES.find(r => r.path === clean)
  return route ? `${route.title} · ${APP_NAME}` : APP_NAME
}
```
(`label: null` on Pip means "use the pet's name", as the footer does today.)

- [x] **Step 2: Smoke-check `routeTitle`.** `constants/pet.js` may import non-pure modules; if so the command fails, so first check that `constants/pet.js` only exports constants.

Run: `cd foodbytes-app\client; node --input-type=module -e "import {routeTitle} from './src/constants/appRoutes.js'; console.log(routeTitle('/mealplan/'), '|', routeTitle('/'), '|', routeTitle('/nope'))"`
Expected: `Meal Plan · My Pantry Plan | Recipes · My Pantry Plan | My Pantry Plan`

- [x] **Step 3: Create `hooks/useDocumentTitle.js`**

```js
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { routeTitle } from '../constants/appRoutes'

/** Keeps the browser tab title in step with the current section. Call once, in App. */
export default function useDocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => { document.title = routeTitle(pathname) }, [pathname])
}
```
In `App.jsx`, call `useDocumentTitle()` in the component that already calls `useLocation()` (the one computing `pipMode`, line ~19). Hooks must run before the early `return <LandingPageAnimation …/>`, so place the call next to the existing `useLocation()` call.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 55: useAppNav + AppNavItems; Footer uses them ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/hooks/useAppNav.js`, `client/src/components/layout/AppNavItems.jsx`
- Modify: `client/src/components/layout/Footer.jsx` (full: render via the shared pieces), `client/src/components/layout/Footer.css`

- [x] **Step 1: Create `useAppNav`.** It moves Footer's three handlers into one data-driven function. The nudge timer is cleared on unmount, which the old code didn't do.

```js
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { APP_ROUTES } from '../constants/appRoutes'

const NUDGE_MS = 3000

/** The four sections with active state and guest gating (sign-in nudge instead of navigating). */
export default function useAppNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuth()
  const [message, setMessage] = useState(null)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const select = useCallback((route) => {
    if (route.requiresAuth && !isAuthenticated) {
      clearTimeout(timer.current)
      setMessage(route.guestMessage)
      timer.current = setTimeout(() => setMessage(null), NUDGE_MS)
      return
    }
    navigate(route.path)
  }, [isAuthenticated, navigate])

  const items = APP_ROUTES.map(route => ({
    ...route, active: pathname === route.path, onSelect: () => select(route)
  }))
  return { items, message }
}
```

- [x] **Step 2: Create `AppNavItems`.** Props: `{ variant = 'footer', items, message }`. It renders the optional `footer-message` / `header-nav-message` bubble, then a `<nav>` (`aria-label="Main"`) with one `<button>` per item: className `${variant}-btn ${active ? 'active' : ''}`, `aria-current={active ? 'page' : undefined}`, `onClick={item.onSelect}`. For the icon, move Footer's three inline SVGs into a `const NAV_ICONS = { recipes: …, mealplan: …, shopping: … }` map in this file. For `pet`, render the existing `PipHerb` block exactly as Footer does (`usePet()`, `hatOnly`, `hatMiniViewBox`, `isWilted`, `PIP_DEFAULT_FORM`), with label `petName ?? PET_GUEST_TAB_LABEL` and class `footer-pet-label`. Every other item's label is `item.label`.

- [x] **Step 3: Rewrite `Footer`** as:

```jsx
function Footer({ alwaysVisible = false }) {
  const { items, message } = useAppNav()
  return (
    <footer className={`footer ${alwaysVisible ? 'footer--always' : ''}`}>
      <AppNavItems variant="footer" items={items} message={message} />
    </footer>
  )
}
```
Keep the existing `.footer-nav` / `.footer-btn` classes (`AppNavItems` outputs `nav.footer-nav` for the footer variant), so `Footer.css` keeps working. Add to `Footer.css`: `@media (min-width: 1024px) { .footer:not(.footer--always) { display: none; } }`.

- [x] **Step 4: Build and measure**

Run: `cd foodbytes-app\client; npm run build; Get-ChildItem src\components\layout\Footer.jsx,src\components\layout\AppNavItems.jsx,src\hooks\useAppNav.js | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }`
Expected: build OK; each < 150 lines.

### Task 56: Footer clearance at desktop + footer kept on /pet ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/App.jsx:58` (pass `alwaysVisible` to Footer on the pet route), `client/src/styles/global.css:85,235` (clearance at ≥1024 px)

- [x] **Step 1:** In `App.jsx` render `<Footer alwaysVisible={pipMode} />`. In `global.css`, inside the existing `@media (min-width: 1024px)` block, set `:root { --footer-clearance: 0px; }`. Then add `body:has(.footer--always) { --footer-clearance: 80px; }` at the top level (`:has` is supported in all evergreen browsers), so `/pet` keeps its space. If you'd rather avoid `:has`, set an `app-shell--pip` class on the shell `div` in `App.jsx` when `pipMode` is true and scope the override to it. Pick one and note it in the PR description.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 57: HeaderNav ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/layout/HeaderNav.jsx` (styles in `Header.css`)

- [x] **Step 1: Create**

```jsx
import useAppNav from '../../hooks/useAppNav'
import AppNavItems from './AppNavItems'

/** Desktop (≥1024px) section tabs in the header; the footer carries the same items below that width. */
function HeaderNav() {
  const { items, message } = useAppNav()
  return <div className="header-nav"><AppNavItems variant="header" items={items} message={message} /></div>
}
export default HeaderNav
```
CSS in `Header.css`: `.header-nav { display:none }`; `@media (min-width:1024px) { .header-nav { display:flex } }`. `.header-btn` is a 44 px tall pill: `#d9d4f5` text, 15 px / 600, padding `10px 14px`, radius 10 px, icon + label in a row (icons 20 px, `PipHerb` mini 22 px). Hover background `rgba(255,255,255,.1)` inside `@media (hover:hover)`; `.active` gets `rgba(255,255,255,.16)` and white text. `.header-nav-message` is a small dark bubble anchored under the nav (absolute).

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 58: Header rebuilt (brand, nav, week pill, account button) ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/layout/Header.jsx:17-84`, `client/src/components/layout/Header.css` (header layout, brand, pill), `client/src/components/common/DateRangePicker.css` (pill skin)

- [x] **Step 1: Restructure the markup.** Keep the `header.header` root, `LoginModal`, the user-menu state and the sign-in button behaviour.

```jsx
<header className="header">
  <div className="header-content">
    <button className="brand-btn" onClick={() => navigate('/')} title="Go to Recipes" aria-label="My Pantry Plan, go to Recipes">
      <BrandMark size={40} className="brand-mark" />
      <span className="brand-word" aria-hidden="true">My Pantry <span>Plan</span></span>
    </button>
    <HeaderNav />
    <div className="header-week"><DateRangePicker /></div>
    <div className="header-account">{/* existing avatar button + dropdown / sign-in button */}</div>
  </div>
</header>
```
Delete the old inline calendar `<svg className="logo-icon">`, `.header-pill`, `.header-pill-center` and `.header-pill-right` wrappers.

- [x] **Step 2: Header CSS.** Keep the `.header` block and its stacking-context comment unchanged.
  - `.header-content`: `max-width:1200px; margin:0 auto; display:grid; grid-template-columns:auto 1fr auto; grid-template-areas:"brand week account"; align-items:center; gap:12px; min-height:64px; padding:0 8px`.
  - `.brand-btn`: `grid-area:brand`, flex, gap 10 px, no background, white text, min-height 44 px, `:focus-visible` white outline. `.brand-mark`: 36 px below 768 px via CSS width/height, drop-shadow. `.brand-word`: 17 px (≥768 px: 19 px), weight 800, the inner span weight 500 / opacity .85; `@media (max-width:359px) { .brand-word { display:none } }`.
  - `.header-week`: `grid-area:week; justify-self:center`. `.header-account`: `grid-area:account`.
  - `@media (max-width:767px)`: `grid-template-columns:1fr auto; grid-template-areas:"brand account" "week week"; row-gap:6px; padding-bottom:4px`, and `.header-week { justify-self:stretch }`.
  - `@media (min-width:1024px)`: `grid-template-columns:auto auto 1fr auto; grid-template-areas:"brand nav week account"`, with `.header-nav { grid-area:nav }` and `.header-week { justify-self:end }`.

- [x] **Step 3: Week pill skin (`DateRangePicker.css`).** It reuses the arrows and "This week" from Task 12. `.date-range-picker` becomes a pill container (`background: rgba(0,0,0,.18); border-radius:999px; padding:4px; display:flex; align-items:center; gap:4px`). Show the range as a white pill button: the text `📅 {formatDateShort(startDate)} – {endDate day}` (e.g. "Nov 9 – 15"; when the months differ, "Nov 30 – Dec 6"). Keep the native `<input type="date">` visually hidden but present, absolutely positioned over the white pill with `opacity:0` and the full pill size, so tapping the pill opens the native picker on every platform. Add a `formatWeekRange(startISO, endISO)` helper to `utils/dateUtils.js` for the label. On mobile (≤767 px) the pill is `width:100%` with the range button `flex:1`, and "This week" sits inside the pill in `#ffd34d`. Remove the old `📅 From:` label and the `→ end` span.

- [x] **Step 4: Smoke-check the new date helper**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {formatWeekRange} from './src/utils/dateUtils.js'; console.log(formatWeekRange('2026-11-09','2026-11-15'), '|', formatWeekRange('2026-11-30','2026-12-06'))"`
Expected: `Nov 9 – 15 | Nov 30 – Dec 6`

- [x] **Step 5: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 59: Account menu regrouped ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/layout/Header.jsx` (dropdown block, lines ~59–74 before Task 58), `client/src/components/layout/Header.css` (`.user-dropdown` and children)

- [x] **Step 1: Reorder and wrap, with no logic changes.** Read `DefaultPortionsControl.jsx` and `MealTimesControl.jsx` first. If either already renders its own heading, don't add a second one; use the section wrapper for spacing only.

```jsx
<div className="user-dropdown" role="menu" aria-label="Account">
  <div className="user-who">
    {/* existing avatar img/placeholder at 40px */}
    <div className="user-info"><span className="user-name-full">{user.name}</span><span className="user-email">{user.email}</span></div>
  </div>
  <section className="user-section" aria-labelledby="acct-portions"><h5 id="acct-portions">Portions</h5><DefaultPortionsControl /></section>
  <section className="user-section" aria-labelledby="acct-times"><h5 id="acct-times">Meal times</h5><MealTimesControl /></section>
  <button className="logout-btn" onClick={logout}>↩ Sign out</button>
  <VersionInfo />
</div>
```
CSS: width 300 px (mobile `calc(100vw - 24px)`, right-aligned); `.user-who` uses the brand tint `#efedf7`, flex, gap 12 px, padding 14 px 16 px; `.user-section` has a top border and 10 px 16 px padding, with `h5` 11 px uppercase, letter-spacing .06em, secondary colour; `.logout-btn` is full width, left-aligned, 44 px, `#c0392b`, top border; `VersionInfo` sits last on a `--bg-secondary` strip (wrap it in CSS only, `.user-dropdown > :last-child`, without editing `VersionInfo`).

- [x] **Step 2: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\layout\Header.jsx | Measure-Object -Line).Lines`
Expected: build OK; < 150 lines.

### Task 60: Manual walkthrough — header, nav, logo, titles ⏳ — manual, pending developer walkthrough

- Skill: react-frontend

**Files:**
- Test: manual only (no frontend runner). Results go into `pr-description.md` (Task M.5).

- [ ] **Step 1: Run the stack as in Task 28 Step 1.** Open `header-mockup.html` alongside for comparison.

- [ ] **Step 2: Desktop (1366×768) checks:**
  1. The header is 64 px: Plate P at 40 px plus "My Pantry Plan"; clicking it goes to Recipes.
  2. The four tabs sit in the header with the active one highlighted, and there's no bottom bar. Page content isn't cut off at the bottom (clearance is 0).
  3. As a guest, clicking Meal Plan / Pip / Shopping shows the sign-in nudge instead of navigating.
  4. The week pill reads "📅 Nov 9 – 15"; ‹ › step a week; tapping the pill opens the date picker; "This week" appears when you're away from the current week.
  5. The account menu has the tinted who-header, Portions, Meal times, red Sign out last and the version line; portions and meal times still save.
  6. The browser tab shows the Plate P favicon, readable at 16 px, and the title changes per page ("Meal Plan · My Pantry Plan", …).
  7. `/pet` has no header (as today), but the footer nav is visible at desktop width.

- [ ] **Step 3: Mobile (390×844):**
  1. The header is two rows: 36 px mark + wordmark + avatar, then a full-width week pill.
  2. The bottom bar is present and unchanged, including the live Pip tab.
  3. At 340 px wide the wordmark hides and the mark stays.
  4. The sign-in modal shows the 72 px mark; the landing's last phase shows the 120 px mark.

- [ ] **Step 4: Home-screen icon (optional, with a phone on the same network as a deployed build):** Chrome Android → Add to Home screen shows the Plate P icon; iOS Safari → Share → Add to Home Screen shows the 180 px icon titled "Pantry Plan". Chrome DevTools → Application → Manifest lists the 3 icons with no errors (a "no service worker" warning is expected). Record "not verified" for whichever you can't check.

---

## Phase 13 — Backend: shopping list "plan changed" fingerprint

Writes the fingerprint migration, waits for you to apply it, then adds the entity field, `MealPlanFingerprintService`, and the store/compare in `PersistedShoppingListService`. The response only gains a field, so the current frontend is unaffected. The phase ends with the backend compiling and the new tests green.

### Task 61: Write the fingerprint migration ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-11-14-shopping-list-plan-fingerprint.sql`

- [x] **Step 1: Write the migration** (idempotent, `information_schema`-guarded)

```sql
-- 2026-11-14 Shopping redesign (plan: .claude/contract/2026-11-14-meal-plan-screen-redesign/)
-- Stores a SHA-256 fingerprint of the meal plan (entries + extra choices in the list's date range,
-- effective owner) when a shopping list is generated, so GET /api/shopping-list can report
-- planChangedSinceGenerated. Lossless: a new NULLable column; the 5 existing lists stay NULL
-- (reported as not-stale until regenerated). MUST be applied before the backend that maps
-- ShoppingList.planFingerprint deploys (Hibernate ddl-auto=validate).
SET @has := (SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema = DATABASE() AND table_name = 'shopping_lists' AND column_name = 'plan_fingerprint');
SET @sql := IF(@has = 0,
  'ALTER TABLE shopping_lists ADD COLUMN plan_fingerprint CHAR(64) NULL AFTER generated_at',
  'SELECT ''plan_fingerprint already present''');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
```

- [x] **Step 2: Copy it to Downloads for the developer**

Run: `Copy-Item foodbytes-app\database\migrations\2026-11-14-shopping-list-plan-fingerprint.sql $env:USERPROFILE\Downloads\`
Expected: `Get-ChildItem $env:USERPROFILE\Downloads\2026-11-14-shopping-list-plan-fingerprint.sql` lists it.

### Task 62: Developer applies the fingerprint migration ✓

- Skill: none — DBA operation against the live Railway MySQL (the developer runs it)

**Files:**
- (none — database operation)

- [x] **Step 1: Stop and ask the developer** to run `Downloads\2026-11-14-shopping-list-plan-fingerprint.sql` on Railway (and locally if `foodbytes-db` is running, as in Task 30), and wait for confirmation.

- [x] **Step 2: Verify read-only**

Run (mysql MCP): `SELECT column_type, is_nullable FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'shopping_lists' AND column_name = 'plan_fingerprint'`
Expected: one row, `char(64)`, `YES`. Don't continue until it's present.

### Task 63: ShoppingList.planFingerprint + DTO field ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/ShoppingList.java:38-40` (new field after `generatedAt`)
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PersistedShoppingListDTO.java:24-27` (new field)

- [x] **Step 1: Add the fields**

```java
// ShoppingList.java
@Column(name = "plan_fingerprint", length = 64)
private String planFingerprint;

// PersistedShoppingListDTO.java
private Boolean planChangedSinceGenerated;   // false when the list predates fingerprints
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 64: MealPlanFingerprintService ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanFingerprintService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanFingerprintServiceTest.java`

- [x] **Step 1: Write the failing tests** (mocks: `MealPlanEntryRepository`, `ExtraChoiceService`; reuse `MealPlanServiceTest`-style builders for `MealPlanEntry` / `Recipe` / `Meal`, copied as private helpers)

```java
@Test void sameplan_sameFingerprint_andIgnoresEaten() { /* two calls over identical entries (one with eaten=true) → equal 64-char hex */ }
@Test void removedEntry_changesFingerprint() { /* entries [a,b] vs [a] → different */ }
@Test void servingsChange_changesFingerprint() { /* same entry, servings 2 → 1.5 → different */ }
@Test void extraChoiceChange_changesFingerprint() { /* getEntryChoices {10:{5:true}} vs {10:{5:false}} → different */ }
@Test void orderOfEntries_doesNotMatter() { /* repository returns [a,b] vs [b,a] → equal */ }
@Test void usesExclusiveEndPlusOne() { /* verify findByUserIdAndDateRange(owner, start, end.plusDays(1)) */ }
```
Write each body fully. Stub `mealPlanEntryRepository.findByUserIdAndDateRange(7L, start, end.plusDays(1))` and `extraChoiceService.getEntryChoices(anyCollection())`, and assert with `assertThat(a).isEqualTo(b)` / `isNotEqualTo` / `hasSize(64)`.

- [x] **Step 2: Run them and see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanFingerprintServiceTest`
Expected: compilation error, the class doesn't exist.

- [x] **Step 3: Implement**

```java
/** Shopping redesign: detects "plan changed since this list was made" without per-mutation timestamps. */
@Service
@RequiredArgsConstructor
public class MealPlanFingerprintService {
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final ExtraChoiceService extraChoiceService;

    /** SHA-256 hex of the owner's plan in [start, endInclusive]. Eaten state is deliberately excluded. */
    @Transactional(readOnly = true)
    public String fingerprint(Long ownerId, LocalDate start, LocalDate endInclusive) {
        List<MealPlanEntry> entries = mealPlanEntryRepository.findByUserIdAndDateRange(ownerId, start, endInclusive.plusDays(1));
        Map<Long, Map<Long, Boolean>> choices = entries.isEmpty() ? Map.of()
            : extraChoiceService.getEntryChoices(entries.stream().map(MealPlanEntry::getId).toList());
        String canonical = entries.stream()
            .sorted(Comparator.comparing(MealPlanEntry::getId))
            .map(e -> e.getId() + "|" + e.getPlanDate() + "|" + e.getMeal().getId() + "|" + e.getRecipe().getId() + "|"
                + e.getServings().stripTrailingZeros().toPlainString() + "|"
                + new TreeMap<>(choices.getOrDefault(e.getId(), Map.of())))
            .collect(Collectors.joining("\n"));
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(canonical.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 unavailable", impossible);   // guaranteed on every JVM
        }
    }
}
```
Confirm the exclusive-end convention by reading `MealPlanService.getWeekPlan` (it passes `start.plusDays(7)` for a 7-day week).

- [x] **Step 4: Run them and see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanFingerprintServiceTest`
Expected: `Tests run: 6, Failures: 0, Errors: 0`.

### Task 65: PersistedShoppingListService stores and compares ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PersistedShoppingListService.java:52-72` (get), `:89-135` (generate), `:~200-230` (`convertToDTO`)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PersistedShoppingListServiceTest.java`

- [x] **Step 1: Write the failing tests** (add `@Mock MealPlanFingerprintService` to the existing test class)

```java
@Test void generate_storesTheFingerprint() { /* stub fingerprint(owner,start,end) → "abc…"; capture save(ShoppingList) and assert planFingerprint */ }
@Test void get_reportsChanged_whenFingerprintDiffers() { /* stored "aaa", current "bbb" → dto.getPlanChangedSinceGenerated() true */ }
@Test void get_reportsUnchanged_whenEqual() { /* stored == current → false */ }
@Test void get_legacyListWithoutFingerprint_reportsFalse_andDoesNotCompute() { /* stored null → false; verifyNoInteractions(fingerprintService) */ }
```

- [x] **Step 2: Run them and see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PersistedShoppingListServiceTest`
Expected: compilation or assertion failures on the new tests only.

- [x] **Step 3: Implement.** Inject `MealPlanFingerprintService`.
  - **In `generateShoppingList`,** before the first `save`, set `shoppingList.setPlanFingerprint(fingerprintService.fingerprint(effectiveOwnerId, startDate, endDate));`.
  - **In `getShoppingList`,** after loading the list, compute `boolean changed = list.getPlanFingerprint() != null && !list.getPlanFingerprint().equals(fingerprintService.fingerprint(effectiveOwnerId, list.getStartDate(), list.getEndDate()));`. Pass it into `convertToDTO(list, items, changed)` (add the parameter; the generate path passes `false`) and `.planChangedSinceGenerated(changed)` on the builder.

- [x] **Step 4: Run them and see them pass, plus the rest of the class**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest="PersistedShoppingListServiceTest,MealPlanFingerprintServiceTest"`
Expected: `BUILD SUCCESS`, 0 failures.

---

## Phase 14 — Recipe view redesign

Splits `RecipeViewModal` into a data/behaviour shell and presentational pieces, then reskins it to the mockup. The build stays green after every task, because each new piece is wired in the same task that creates it.

### Task 66: formatQuantity + cook-mode helper ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/utils/formatQuantity.js`, `client/src/utils/cookModeUtils.js`

- [x] **Step 1: Create `formatQuantity.js`**

```js
const FRACTIONS = [[0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾']]
const WHOLE_UNITS = new Set(['g', 'ml'])
const ONE_DP_UNITS = new Set(['kg', 'l'])
const TOLERANCE = 0.05

/** Display-only quantity: fractions for spoons/counts, whole numbers for g/ml, 1 dp for kg/l. */
export function formatQuantity(value, unit = '') {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  const u = String(unit).trim().toLowerCase()
  if (WHOLE_UNITS.has(u)) return String(Math.round(n))
  if (ONE_DP_UNITS.has(u)) return String(Math.round(n * 10) / 10)
  const whole = Math.floor(n + TOLERANCE)
  const rest = n - whole
  if (Math.abs(rest) < TOLERANCE) return String(whole)
  const hit = FRACTIONS.find(([f]) => Math.abs(rest - f) < TOLERANCE)
  if (hit) return `${whole || ''}${hit[1]}`
  return String(Math.round(n * 100) / 100)
}
```

- [x] **Step 2: Create `cookModeUtils.js`**

```js
/**
 * Ingredients a step probably uses: the ingredient name's last word ("Chicken breast" → "breast"
 * and the first word "chicken") appears in the step text. A hint only; returns [] rather than guess.
 */
export function ingredientsForStep(stepText, ingredients) {
  const text = String(stepText || '').toLowerCase()
  return (ingredients || []).filter(ing => {
    const words = String(ing.name || '').toLowerCase().replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(w => w.length > 2)
    return words.some(w => new RegExp(`\\b${w.replace(/[^a-z]/g, '')}`).test(text))
  })
}
```

- [x] **Step 3: Smoke-check**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {formatQuantity as f} from './src/utils/formatQuantity.js'; import {ingredientsForStep as s} from './src/utils/cookModeUtils.js'; console.log(f(0.5,'piece'), f(1.25,'tbsp'), f(0.33,'tsp'), f(270.4,'g'), f(1.27,'kg'), f(2,'clove'), f(0.1,'tsp'), s('Heat the olive oil and fry the chicken',[{name:'Olive oil'},{name:'Chicken breast'},{name:'Carrot'}]).map(i=>i.name).join('+'))"`
Expected: `½ 1¼ ⅓ 270 1.3 2 0.1 Olive oil+Chicken breast`

### Task 67: MacroChips becomes clickable when asked ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/common/MacroChips.jsx` (from Task 11), `client/src/components/common/MacroChips.css`

- [x] **Step 1:** Add an optional `onChipClick` prop. When it's set, render each chip as `<button type="button" className="macro-chip macro-chip--{status} macro-chip--button" onClick={() => onChipClick(c.key)}>`, with the same `aria-label` plus ", show target". When it's absent, keep the `<span>`. Add `variant="header"` (white pill, coloured text and a status dot, 13 px / 700, min-height 32 px) for the purple recipe-view header. CSS: `.macro-chips--header .macro-chip { background:#fff; display:inline-flex; gap:5px; align-items:center } .macro-chips--header .macro-chip::before { content:''; width:9px; height:9px; border-radius:50%; background: currentColor }`.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 68: useExtraChoiceToggle ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/hooks/useExtraChoiceToggle.js`

- [x] **Step 1: Create.** Read `WeekExtrasModal.jsx` / `useManageExtras.js` first to mirror how they call `extraChoicesService.updateWeek` and refresh afterwards.

```js
import { useCallback, useState } from 'react'
import extraChoicesService from '../services/extraChoicesService'
import { useMealPlan } from '../contexts/MealPlanContext'
import { useHomemadeSelections } from '../contexts/HomemadeSelectionsContext'

const SAVE_ERROR = "Couldn't save that choice. Please try again."

/**
 * Recipe view extras toggle. A planned meal saves its own choice (MPP-10 week endpoint);
 * anywhere else updates the dish default in HomemadeSelectionsContext. Writes are never aborted.
 */
export default function useExtraChoiceToggle({ parentRecipeId, mealPlanEntry }) {
  const { fetchWeekPlan } = useMealPlan()
  const { getSelections, saveSelections, reloadSelections } = useHomemadeSelections()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const setChoice = useCallback(async (extraRecipeId, homemade) => {
    setError(null)
    if (!mealPlanEntry) {
      saveSelections(parentRecipeId, { ...getSelections(parentRecipeId), [extraRecipeId]: homemade })
      return
    }
    setSaving(true)
    try {
      await extraChoicesService.updateWeek([{ targetId: mealPlanEntry.id, extraRecipeId, homemade }])
      await fetchWeekPlan()
      reloadSelections()
    } catch (err) {
      setError(err.response?.data?.error || SAVE_ERROR)
    } finally {
      setSaving(false)
    }
  }, [mealPlanEntry, parentRecipeId, getSelections, saveSelections, fetchWeekPlan, reloadSelections])

  return { setChoice, saving, error }
}
```
`RecipeViewModal` passes the meal's choices as `extraChoices`. After `fetchWeekPlan()` the parent re-renders with the updated `entry.extraChoices`, so the wording flips. If the modal holds `extraChoices` from a stale prop, use `getEntryById(mealPlanEntry.id)?.extraChoices` from `useMealPlan()` inside the modal instead (`getEntryById` already exists).

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 69: RecipeViewHeader + PlanContextBar ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/recipes/RecipeViewHeader.jsx`, `client/src/components/recipes/PlanContextBar.jsx`
- Modify: `client/src/components/recipes/RecipeViewModal.jsx:229-316` (header render → `<RecipeViewHeader …/>`), `client/src/components/recipes/RecipeViewModal.css`

- [x] **Step 1: `PlanContextBar`.** Props: `{ entry }`. It reads `const { getEntryById, setEntryEaten } = useMealPlan()` for the live `eaten` state. The label is `` `${shortDay(entry.planDate)} ${dayNumber} · ${MEAL_LABEL[entry.mealType]}` `` (use `getShortDayName` / `parseISODate` from `utils/dateUtils`, labels from `MEAL_SLOTS` / `SNACKS_SLOT` in `constants/mealPlanUi`). The button reads `○ Mark as eaten` / `✓ Eaten`. Clicking when not eaten must run the **same** save path as `MealEatenSection` (sprinkles refresh + take-to-Pip). Extract `MealEatenSection`'s `save(next)` into `hooks/useMealEatenSave.js` (`useMealEatenSave(entryId) → { eaten, eatenAt, save, saving, error }`) and use it in both components, so the two can't drift. Add that hook to the File map's Created list.

- [x] **Step 2: `RecipeViewHeader`.** The props are exactly those in plan.md → Data shapes. It renders, in order:
  1. `LinkedRecipeNavigation` (unchanged props)
  2. a title row: `h2.recipe-title`, the Cheat badge, and a close button (44 px, `aria-label="Close recipe"`)
  3. `PlanContextBar` when `planEntry && !nav.canGoBack`
  4. a control row: `VariantSegment` (from Task 41, `variant` styling for the dark header) and a servings stepper. It's `− {n} people +`, using `MIN/MAX/SERVINGS_STEP` and calling `onServings(next)`. The editable number input from today stays inside, for decimal entry (MPP decimal servings).
  5. a macros row: `<MacroChips macros={macros} targets={MACRO_TARGETS} variant="header" onChipClick={onMacroClick} />`, "per serving", and, when `wakeLock.isSupported`, a toggle button `🔆 {wakeLock.isLocked ? 'Screen stays on' : 'Keep screen on'}` with `aria-pressed={wakeLock.isLocked}`

  The header is `position: sticky; top: 0` inside the modal's scroll container.

- [x] **Step 3: Wire it into `RecipeViewModal`.** Replace the header JSX block with `<RecipeViewHeader …/>`. Remove the calorie dropdown state (`showCalorieDropdown`, `dropdownRef`, its outside-click effect) and the `MacroBadgeRow` usage (the macro popup is now opened via `onMacroClick` → the same `MacroTargetPopup` `MacroBadgeRow` used; keep `MacroBadgeRow.jsx` if anything else still imports it, otherwise delete it). Remove the `WakeLockIcon` next to "Ingredients". Variant selection keeps calling the existing `handleVariantSelect`.

- [x] **Step 4: Build and measure**

Run: `cd foodbytes-app\client; npm run build; Get-ChildItem src\components\recipes\RecipeViewModal.jsx,src\components\recipes\RecipeViewHeader.jsx,src\components\recipes\PlanContextBar.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }`
Expected: build OK; `RecipeViewModal.jsx` < 330 lines (was 374), each new file < 200.

### Task 70: IngredientsPanel + ExtrasPanel ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/recipes/IngredientsPanel.jsx`, `client/src/components/recipes/ExtrasPanel.jsx`
- Modify: `client/src/components/recipes/RecipeViewModal.jsx` (ingredients section → panels), `RecipeViewModal.css`

- [x] **Step 1: `IngredientsPanel`.** Props: `{ ingredients, scale, servings, children }` (`children` = the extras panel slot). It owns `const [ticked, setTicked] = useState(() => new Set())`, reset when `ingredients` changes (key the component on the displayed recipe id in the modal). It renders `h3` "Ingredients" with `<small>for {servings} {person|people}</small>`, then a `ul.ilist` of `li`s. Each `li` is a `role="checkbox"` with `aria-checked`, `tabIndex={0}`, Space/Enter toggle, min-height 44 px, a 22 px tick box, `formatQuantity(scale(ing.quantity), ing.unit)` + unit, and the name. Ticked rows are struck through.

- [x] **Step 2: `ExtrasPanel`.** Props: `{ extras, isHomemade, onToggle, onOpen, saving, error }`. For each extra: the name, a two-button segmented toggle (`aria-pressed`), Homemade / Store-bought, and, when homemade, an `Open {name} recipe →` button (`onOpen(recipeId)` → the existing linked-step click handler). It finishes with "Macros always use the homemade version." and an inline error. In the modal, derive `extras` from `fullRecipe.steps.filter(s => s.linkedRecipeId != null).map(s => ({ recipeId: s.linkedRecipeId, name: s.linkedRecipeName }))`, de-duplicated by id. `isHomemade` is the existing function the modal passes to `RecipeStepsSection`. `onToggle` is `useExtraChoiceToggle({ parentRecipeId: parentRecipeId ?? recipeId, mealPlanEntry }).setChoice`. Render only when `extras.length > 0` and you're on the top-level recipe (`!canGoBack`).

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 71: RecipeStepsSection as step cards ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/recipes/RecipeStepsSection.jsx`, `client/src/components/recipes/RecipeViewModal.css` (`.steps-*` rules)

- [x] **Step 1:** Keep the FR-091 display logic as it is (`hasLink`, `homemade`, `displayText`). Add props `{ onStartCook }` and internal `const [done, setDone] = useState(() => new Set())`, where `current` is the first index not in `done`.
  - **Heading:** `Steps` + `<small>{done.size}/{steps.length} done</small>` + `<button className="cookbtn" onClick={() => onStartCook(current)}>▶ Cook mode</button>`.
  - **Each step:** an `li.step` (`.done`, `.cur`) that is clickable (toggle done) with `role="checkbox"` + `aria-checked` + keyboard. It holds a 32 px number circle (✓ when done) and the text.
  - **Homemade linked step:** a separate `button.step-link` "Open {linkedRecipeName} recipe →" (stopPropagation) under the text. The text itself is no longer the button.
  - **Store-bought linked step:** the alt text plus `<span className="sb">🛒 Store-bought {linkedRecipeName}</span>`.

  Reset `done` when `steps` changes.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 72: CookMode overlay ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/recipes/CookMode.jsx`, `client/src/components/recipes/CookMode.css`
- Modify: `client/src/components/recipes/RecipeViewModal.jsx` (state `cookIndex: number|null`, render the overlay)

- [x] **Step 1: Create.** Props are exactly as in plan.md → Data shapes.
  - **Layout:** absolute inset over the modal, dark `#1f1a3a`, with a top bar (name + `✕ Exit`), a progress bar of N segments, "Step i of N · screen stays on", the step text at 26 px (22 px ≤768 px), the chips from `ingredientsForStep(displayText, ingredients)` showing `formatQuantity(scale(q), unit) unit name`, and a bottom grid with `← Back` and `Next step →` / `Finish ✓` (56 px tall).
  - **Behaviour:** Escape or Exit calls `onExit(index)`; ArrowLeft/ArrowRight navigate; focus goes to Next on open; `role="dialog" aria-modal="true" aria-label={`Cook mode: ${recipeName}`}`.
  - **Wake lock:** the modal calls the existing wake-lock `toggle` to force it on when entering if `!isLocked`, and restores the previous state on exit (remember `wasLocked`).

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 73: Layout (desktop two columns, mobile tabs) + size check ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/recipes/RecipeViewModal.jsx` (body wrapper + `tab` state), `client/src/components/recipes/RecipeViewModal.css`

- [x] **Step 1:** The body becomes `<div className="rv-body">` holding `IngredientsPanel` (with `ExtrasPanel` inside) and `<div className="rv-steps">` holding `RecipeStepsSection` + `MealEatenSection` (unchanged condition). Add `const [tab, setTab] = useState('ingredients')` and, below the header, `<div className="rv-tabs" role="tablist">` with two `role="tab"` buttons: `Ingredients ({n})` / `Steps ({done}/{N})`. For the steps count, lift `done` from `RecipeStepsSection` into the modal: make `RecipeStepsSection` controlled with `done` / `onToggleDone` props, and update Task 71's component accordingly.
  - **CSS ≥769 px:** `.recipe-view-modal { width:min(1040px, calc(100vw - 48px)); max-height:calc(100vh - 48px) }`, `.rv-body { display:grid; grid-template-columns:minmax(260px,360px) 1fr }`, the ingredients column `position:sticky; top:<header height>; align-self:start; background:var(--bg-secondary)`, `.rv-tabs { display:none }`.
  - **CSS ≤768 px:** the modal is full screen (`inset:0; border-radius:0; width:100%; height:100%`), `.rv-tabs` is sticky under the header, and only the active panel shows (`[data-tab="steps"] .ingredients-panel { display:none }`, and the reverse).

- [x] **Step 2: Build and measure the whole view**

Run: `cd foodbytes-app\client; npm run build; Get-ChildItem src\components\recipes\RecipeViewModal.jsx,src\components\recipes\RecipeViewHeader.jsx,src\components\recipes\IngredientsPanel.jsx,src\components\recipes\ExtrasPanel.jsx,src\components\recipes\RecipeStepsSection.jsx,src\components\recipes\CookMode.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }`
Expected: build OK; every file < 400 lines (target: modal < 330, others < 200).

---

## Phase 15 — Shopping redesign

Restyles the shopping components, adds the out-of-date banner (reading the Phase 13 field), Hide ticked, Keep screen on and the week default for new lists, and removes the unused localStorage flag. It ends with a green build and the manual walkthrough for Phases 14 and 15.

### Task 74: Remove the unused shoppingListInvalidated flag ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/contexts/MealPlanContext.jsx:30-43` (constant + function + its call sites), `client/src/contexts/HomemadeSelectionsContext.jsx:7-18,103`

- [x] **Step 1:** Delete `SHOPPING_LIST_INVALIDATED_KEY` and `invalidateShoppingListCache` from both contexts, and every call to `invalidateShoppingListCache()`. It's written but never read (confirmed by grep at planning), and the server-side `planChangedSinceGenerated` replaces it.

- [x] **Step 2: Confirm it's gone and build**

Run: `cd foodbytes-app\client; Get-ChildItem -Path src -Recurse -Include *.js,*.jsx | Select-String -Pattern "shoppingListInvalidated|invalidateShoppingListCache"; npm run build`
Expected: no grep hits; build OK.

### Task 75: useHideTicked ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/hooks/useHideTicked.js`

- [x] **Step 1: Create**

```js
import { useCallback, useState } from 'react'

const HIDE_TICKED_KEY = 'fb.shopping.hideTicked'
const read = () => { try { return localStorage.getItem(HIDE_TICKED_KEY) === '1' } catch { return false } }

/** Per-device "Hide ticked" view preference for the shopping list. Never changes any item. */
export default function useHideTicked() {
  const [hideTicked, setState] = useState(read)
  const setHideTicked = useCallback((next) => {
    setState(next)
    try { localStorage.setItem(HIDE_TICKED_KEY, next ? '1' : '0') } catch { /* view preference only */ }
  }, [])
  return [hideTicked, setHideTicked]
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 76: ShoppingListHeader: title line, progress card, ⋯ menu, toggles, out-of-date banner ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/shopping/ShoppingListHeader.jsx` (full), `client/src/components/shopping/ShoppingList.css`

- [x] **Step 1:** Props become `{ onGenerateClick(mode: 'list' | 'week' | 'custom'), hideTicked, onToggleHideTicked, wakeLock }`.
  - **Title block:** `h1` "Shopping list", then `For <b>{formatWeekRange(startDate, endDate)}</b> · made {Ddd d Mmm, HH:mm}`. Use `formatWeekRange` from Task 58; format the time with `toLocaleString('en-GB', { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })`.
  - **Actions:** the `Hide ticked` toggle (`aria-pressed`), the `🔆 Keep screen on` toggle (only when `wakeLock.isSupported`; label hidden ≤768 px), and a ⋯ menu (`MealPlanMenu`-style listeners) with "↻ Regenerate for {list range}" → `onGenerateClick('list')`, "📅 New list for other dates…" → `onGenerateClick('custom')`, and "☐ Uncheck all…" → the existing `ConfirmDialog`.
  - **Progress card:** `{checkedItems} / {totalItems}`, a bar, `{pct}% in the basket` or `All done 🎉`.
  - **Banner:** when `shoppingList.planChangedSinceGenerated`, a `role="status"` amber banner "⚠️ Your meal plan changed after this list was made." with Regenerate → `onGenerateClick('list')`.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 77: GenerateShoppingListModal defaults to the planned week ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/shopping/GenerateShoppingListModal.jsx:9-20,50-80`

- [x] **Step 1:** Add the prop `mode: 'list' | 'week' | 'custom'` (default `'week'`).
  - **Initial dates:** `'list'` → the current list's `startDate`/`endDate` (from `useShoppingList`); `'week'` → `useMealPlan()` `startDate`/`endDate`; `'custom'` → the same as week, but with the date inputs visible.
  - **Summary rows:** "Meal plan week · {range}" and "Meals in it · {n}". Compute `n` from `weekPlan.days` (core slots filled, using `plannedSlotCount` from Task 5) when the dates equal the visible week; otherwise omit the row.
  - **Date inputs:** hidden until "Choose other dates…" is pressed, or when the mode is custom.
  - **Primary button:** `Make list for {range}`.
  - **Unchanged:** validation, the replace warning (`showWarning`) and `generateShoppingList`.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 78: Aisles: done collapse + order; rows: quantity first + ⓘ ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/shopping/ShoppingListAisle.jsx`, `client/src/components/shopping/ShoppingListItem.jsx:127-150`, `client/src/components/shopping/ShoppingList.css`

- [x] **Step 1: `ShoppingListAisle`.** Props add `{ hideTicked }`.
  - **State:** `const isDone = items.every(i => i.isChecked)`, and `const [open, setOpen] = useState(null)`. The effective open state is `open ?? !isDone`; reset `open` to `null` when `isDone` changes, so finishing collapses it and unticking re-opens it.
  - **Header:** a `<button>` (`aria-expanded`) with an aisle-colour dot (reuse the `data-aisle` colour mapping in CSS: `.aisle-dot[data-aisle="produce"]` etc.), `✓ ` when done, the name, and a `n/N` count chip. `.is-done` gets a green tint.
  - **Items:** `hideTicked ? items.filter(i => !i.isChecked) : items`, plus `<div className="hidden-note">{n} ticked hidden</div>` when some are hidden and the aisle isn't done.

- [x] **Step 2: `ShoppingListItem`.** Keep all click, long-press and keyboard handlers. Change the markup order to: `span.tick-circle` (filled with the aisle colour when checked via CSS `[data-aisle]`), `span.item-quantity` ("{qty} {unit}"), `span.item-name`, then `<button type="button" className="info-btn" aria-label={`Which meals use ${item.ingredientName}?`} onClick={(e) => { e.stopPropagation(); openBreakdown() }}>ⓘ</button>`, hidden when checked. Extract the timer callback body into `openBreakdown()` (fetch → `setBreakdown` → `setShowBreakdown`) and call it from both the long-press timer and the button. Remove the visible `<input type="checkbox">` (`role="checkbox"` + `aria-checked` goes on the row instead of `role="button"`). Keep the "Hold…" indicator for the long-press. Rows have `min-height: 52px`.

- [x] **Step 3: `ShoppingList`.** Pass `hideTicked` and order the aisles: `[...aisles].sort((a, b) => isDone(a) - isDone(b))` (stable, so the server's aisle order holds within each group). Wire `useHideTicked()`, and `useWakeLock(false)` for the header toggle. Change `onGenerateClick` to `(mode) => { setGenerateMode(mode); setShowGenerateModal(true) }` and pass `mode` to the modal. Add CSS: `.shopping-list-content { columns: 1 } @media (min-width:900px) { .shopping-list-content { columns: 2 420px; column-gap: 16px } } .shopping-aisle { break-inside: avoid }`.

- [x] **Step 4: Build and measure**

Run: `cd foodbytes-app\client; npm run build; Get-ChildItem src\components\shopping\*.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }`
Expected: build OK; each < 250 lines.

### Task 79: Manual walkthrough: Recipe view + Shopping ⏳ — manual, pending developer walkthrough

- Skill: react-frontend

**Files:**
- Test: manual only (no frontend runner). Results go into `pr-description.md` (Task M.5).

- [ ] **Step 1: Run the stack as in Task 28 Step 1,** with both migrations applied. Keep `recipe-view-mockup.html` and `shopping-mockup.html` open for comparison.

- [ ] **Step 2: Recipe view, desktop (1366×768).** Open a recipe from Recipes, then a planned meal from Meal Plan:
  1. Wide two-column modal; the header stays pinned while the steps scroll.
  2. From the plan, the context bar shows "Sat 14 · Dinner". Mark as eaten turns ✓, the bottom section shows Undo, and Pip behaves as before (take-to-Pip).
  3. The variant switch changes kcal, chips and quantities without closing; the − / + stepper and decimal typing still work.
  4. Clicking a chip opens the target popup. The Keep screen on toggle reflects and changes the wake lock.
  5. Ingredients tick and untick. "0.5" shows as "½", and grams stay whole.
  6. Steps toggle done; the counter updates; the current step is highlighted.
  7. ▶ Cook mode shows one step at a time with ingredient chips; arrows and Esc work; exit restores.
  8. For a recipe with extras (Pizza, Stromboli or a pita dish), switching an extra to Store-bought changes its step to the store-bought wording with the 🛒 tag, and macros don't change. From a plan meal, reopen it: the choice persisted, and the Meal Plan cart icon updates. "Open … recipe →" navigates in, and ← back returns.

- [ ] **Step 3: Recipe view, mobile (390×844).** Full screen; Ingredients | Steps tabs; cook mode fills the screen with 56 px buttons.

- [ ] **Step 4: Shopping, desktop + mobile:**
  1. The header shows "For Nov 9 – 15 · made …" and the progress card.
  2. On the Meal Plan, change a dinner, then return to Shopping: the amber banner shows. Regenerate clears it. Sign in as the linked partner (if available locally) and edit the plan: the owner's Shopping page shows the banner after a reload.
  3. Ticking every item in an aisle collapses it to "✓ Produce n/n" and moves it last. Unticking one restores it.
  4. ⓘ opens the breakdown; the 1-second long-press still does too.
  5. Hide ticked hides rows and persists across reloads on this device.
  6. Keep screen on toggles (where supported).
  7. ⋯ → New list for other dates opens with the date inputs showing; ⋯ → Regenerate uses the list's dates; Uncheck all still asks to confirm.
  8. Two aisle columns at ≥900 px wide; one on phones.

---

## Phase 16 — Final verification

No production changes beyond the version bump; only sanity-checks of the cumulative work.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests.** Read the current version from `foodbytes-app/client/package.json`. This work has no Jira key and is not a bug fix → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and into `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line** directly above the current top entry in `CHANGELOG.md`: `<new version> — 2026-11-14-meal-plan-screen-redesign: Meal Plan + Recipes + Header redesign: timetable + mobile day view, eaten tick, meal actions with undo, recipe search/strip/picking mode, variant segment, macro chips, hide recipes, Plate P logo everywhere, desktop header nav, week pill, recipe view (cook mode, step cards, extras box), shopping (progress, out-of-date banner, folding aisles)`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references and debug output ✓

- Skill: none — verification only

- [x] **Step 1: No references to deleted components or removed classes**

Run: `cd foodbytes-app\client; Get-ChildItem -Path src -Recurse -Include *.js,*.jsx,*.css | Select-String -Pattern "MealPlanDay'|MealPlanEntry'|calendar-grid|meal-entry-tooltip|week-calories-clickable|day-calories-clickable"`
Expected: zero hits.

- [x] **Step 2: No new console output**

Run: `cd foodbytes-app\client; (Get-ChildItem -Path src -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)").Count`
Expected: ≤ 6 (the baseline in the react-frontend skill; this work must not raise it).

- [x] **Step 3: No calorie ring or target slipped in**

Run: `cd foodbytes-app\client; Get-ChildItem -Path src\components\mealplan,src\components\common -Recurse -Include *.jsx,*.css | Select-String -Pattern "kring|kcal-ring|stroke-dasharray|calorieTarget"`
Expected: zero hits.

- [x] **Step 4: Old Recipes card pieces are gone**

Run: `cd foodbytes-app\client; Get-ChildItem -Path src\components\recipes -Recurse -Include *.jsx,*.css | Select-String -Pattern "stripeColors|card-stripe|day-cal|getDailyCalories|variant-badge|const MEAL_TYPES"`
Expected: zero hits.

- [x] **Step 5: The migration is on Railway (read-only)**

Run (mysql MCP): `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'user_hidden_recipes'`
Expected: `1`.

- [x] **Step 6: Old header and logo are gone**

Run: `cd foodbytes-app; Get-ChildItem -Path client\src, client\index.html, client\public -Recurse -Include *.jsx,*.css,*.html,*.svg | Select-String -Pattern "logo-icon|logo-btn|header-pill|Recipe Viewer|6B46C1|Georgia, serif"`
Expected: zero hits.

- [x] **Step 7: The nav list lives in one place**

Run: `cd foodbytes-app\client; Get-ChildItem -Path src -Recurse -Include *.jsx,*.js | Select-String -Pattern "Sign in to access meal planning"`
Expected: exactly one hit, in `src\constants\appRoutes.js`.

- [x] **Step 8: Both migrations are on Railway (read-only)**

Run (mysql MCP): `SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'shopping_lists' AND column_name = 'plan_fingerprint'`
Expected: `1` (and Step 5's `user_hidden_recipes` check also returned `1`).

- [x] **Step 9: The old recipe-view pieces are gone**

Run: `cd foodbytes-app\client; Get-ChildItem -Path src -Recurse -Include *.jsx,*.js | Select-String -Pattern "calorie-dropdown-trigger|showCalorieDropdown|shoppingListInvalidated"`
Expected: zero hits.

### Task M.3: Run the full backend test suite ✓

- Skill: java-backend

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors (count ≥ the previous 130 + the 13 Meal Plan tests + the 13 Recipes tests + the 10 Shopping fingerprint tests).

### Task M.4: Production build ✓

- Skill: react-frontend

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task M.5: Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/2026-11-14-meal-plan-screen-redesign/pr-description.md`

- [x] **Step 1: Write `pr-description.md`** containing: a link to `plan.md` and `mockup.html`; a summary of the redesign and the new version from M.1; **two migrations: `2026-11-14-user-hidden-recipes.sql` and `2026-11-14-shopping-list-plan-fingerprint.sql`, both applied to Railway before the backend deploys** (Tasks 30 and 62 record when); deploy order migration → backend → frontend; the results of each Task 28, 49, 60 and 79 check (observed / not verified), and that `manifest.webmanifest` will be replaced by `vite-plugin-pwa` when the PWA is bootstrapped; and a one-line convention note: "Meal-plan card actions go through `useMealEntryActions`; layout picks via `useMediaQuery(MOBILE_MEDIA_QUERY)`". Add a second convention note: "Recipes hide keys are the family default id (`hideKeyOf`); picking mode lives in the URL (`usePickingMode`)". Suggested commit subject: `Meal Plan + Recipes redesign`.

---

## Self-review

**Spec coverage:**
- In scope 1 (week arrows) — Task 12.
- In scope 2 (week summary, no eaten/Pip tiles) — Tasks 5, 11, 16.
- In scope 3 (timetable, 2-line names, + Add / ↻ Replace) — Tasks 13, 20, 21.
- In scope 4 (day header chips + ⇄, no ring) — Tasks 11, 18; ring guard M.2 step 3.
- In scope 5 (one-way tick, today/past) — Tasks 5, 9, 13.
- In scope 6 (labelled toolbar + mobile sheet with Swap) — Tasks 17, 25, 26.
- In scope 7 (⋯ menu, undo, drag) — Tasks 9, 14, 15, 19, 20.
- In scope 8 (mobile layout) — Tasks 22, 23, 24.
- In scope 9 (first-run swipe hint) — Tasks 4, 10, 23, 24; verified Task 28 step 3.
- In scope 10 (PATCH endpoint) — Tasks 1, 2, 3, 6, 8.
- B1 (search + tabs with counts) — Tasks 35, 38, 46, 48.
- B2 (week slot strip) — Tasks 36, 47, 48.
- B3 (picking mode + Meal Plan deep link) — Tasks 4, 19, 20, 24 (links carry the date), 40, 44, 47, 48; round trip in Task 49 step 3.
- B4 (variant segment) — Tasks 35, 41, 45.
- B5 (macro chips + backend fields) — Tasks 32, 36, 45.
- B6 (three-state day buttons, no kcal) — Task 44.
- B7 (calmer card) — Tasks 42, 43, 45.
- B8 (hide recipes UI) — Tasks 37, 39, 43, 45, 46, 48.
- B9 (hidden-recipes backend) — Tasks 29, 30, 31, 33, 34.
- B10 (mobile Recipes layout) — Tasks 46, 47, 48; checked in Task 49 step 4.
- C1 (BrandMark, 40/36 px, no circle) — Tasks 50, 58.
- C2 (wordmark, hidden <360 px) — Task 58.
- C3 (desktop header nav, footer hidden ≥1024 px except /pet, guest nudges) — Tasks 54, 55, 56, 57.
- C4 (week pill, mobile second row) — Task 58 (on top of Task 12).
- C5 (account menu regrouped) — Task 59.
- C6 (favicon, icons, manifest, Apple tags, login 72 px, landing 120 px) — Tasks 51, 52, 53.
- C7 (tab titles) — Tasks 52, 54.
- D1 (sticky header, plan-context bar, variant/servings, chips, wake-lock toggle) — Tasks 67, 69.
- D2 (ingredient tick-off, fractions) — Tasks 66, 70.
- D3 (step cards) — Task 71 (made controlled in 73).
- D4 (cook mode) — Tasks 66, 72.
- D5 (extras toggle) — Tasks 68, 70.
- D6 (desktop two-column / mobile tabs, file split) — Tasks 69, 73.
- E1 (header + progress) — Task 76.
- E2 (⋯ actions, visible toggles) — Tasks 76, 78.
- E3 (generate defaults to week) — Task 77.
- E4 (out-of-date banner, flag removed) — Tasks 74, 76.
- E5 (finished aisles) — Task 78.
- E6 (rows + ⓘ) — Task 78.
- E7 (Hide ticked, Keep screen on) — Tasks 75, 76, 78.
- E8 (desktop columns) — Task 78.
- E9 (fingerprint backend) — Tasks 61–65.

**Placeholder scan:** No `TBD` / `TODO` / "implement later". Every step names files, props, class names, or a `Run:` / `Expected:` pair.

**Type / name consistency:** `MealPlanEntryUpdateRequest(planDate, mealId, servings)` is used identically in Tasks 1–3. `updateEntry` is the name in the service (Task 2), controller (3), frontend service (6), hook and context (8) and actions (9). Constants `MEAL_SLOTS`, `SNACKS_SLOT`, `MOBILE_MEDIA_QUERY`, `UNDO_REMOVE_MS`, `INFO_TOAST_MS`, `SWIPE_HINT_STORAGE_KEY`, `SWIPE_COMMIT_PX`, `SWIPE_ACTION_WIDTH_PX` and `recipesForMealPath` come from Task 4. The helpers `isDayTickable`, `dayMacros`, `weekAvgMacros`, `plannedSlotCount`, `slotsForWeek` and `filledCoreSlots` come from Task 5, and `todayOrFirstDay` is added in Task 26. `findEntry` / `patchEntry` move to `utils/weekPlanEntryUtils.js` in Task 8. `PICK_FROM_MEALPLAN` and the two-argument `recipesForMealPath(mealKey, dateISO)` (Task 4) are read by `usePickingMode` (Task 40). `UndoToast` lives in `components/common/` (Task 14) and is used in Tasks 21, 24 and 48. Backend names: `UserHiddenRecipe`, `UserHiddenRecipeRepository.{findByUserId, existsByUserIdAndRecipeId, deleteByUserIdAndRecipeId}`, `HiddenRecipeService.{listHidden, hide, unhide, normalise}`, `HiddenRecipesDTO.recipeIds`, `HiddenRecipeDTO.recipeId`; frontend `hiddenRecipeService.{listHidden, hide, unhide}` and `useHiddenRecipes` → `{isHidden, hide, unhide, undo, toast, canHide, loadFailed, retry}`. The macro fields are `proteinPerServing / carbsPerServing / fatPerServing` on both DTOs and read by `cardMacros`. Header: `BrandMark({size, title, className})` (Task 50) is used in Tasks 53 and 58; `APP_ROUTES` / `APP_NAME` / `routeTitle` (Task 54) are read by `useDocumentTitle` (54) and `useAppNav` (55); `AppNavItems({variant, items, message})` (55) is used by `Footer` (55) and `HeaderNav` (57); `Footer({alwaysVisible})` (55) is set in `App.jsx` (56); `formatWeekRange` is added in Task 58. The logo C path data is identical in `BrandMark.jsx`, `favicon.svg` and `brand-mark*.svg` (Tasks 50, 51). Recipe view / Shopping: `plan_fingerprint` ↔ `ShoppingList.planFingerprint` ↔ `MealPlanFingerprintService.fingerprint(ownerId, start, endInclusive)`, and `PersistedShoppingListDTO.planChangedSinceGenerated` ↔ `shoppingList.planChangedSinceGenerated` (Tasks 63–65, 76). `formatQuantity(value, unit)` / `ingredientsForStep(stepText, ingredients)` (Task 66) are used in Tasks 70 and 72. `useExtraChoiceToggle` (68) is used in Task 70; `useMealEatenSave` (69) in `PlanContextBar` and `MealEatenSection`; `useHideTicked` (75) in Task 78; and `MacroChips` `onChipClick` / `variant="header"` (67) in Task 69.

**Phase boundary cleanliness:**
- Phase 1: backend compiles and its tests pass; nothing calls the new endpoint.
- Phase 2: only unmounted modules plus one context export; the UI is unchanged.
- Phase 3: header arrows are live, and the leaf components are unmounted; the build is green.
- Phase 4: the desktop tree is built but unmounted; the build is green.
- Phase 5: the mobile tree is built but unmounted; the build is green.
- Phase 6: the new layouts are mounted, old files deleted, and grep confirms no dangling references.
- Phase 7: the migration is applied before the entity exists; the backend compiles and the new tests pass; the summary only gains fields.
- Phase 8: only unmounted Recipes modules; the UI is unchanged.
- Phase 9: new leaves, plus `DayAssignmentButtons` with optional props; the old `RecipeList` still works; the build is green.
- Phase 10: the Recipes screen switches over in one task (48); the build is green; manual walkthrough.
- Phase 11: static assets and a new, additive component; sign-in and landing gain a logo; the header is untouched; the build is green.
- Phase 12: the nav moves into a shared hook first (Footer keeps working), then the header switches over; the build is green; manual walkthrough.
- Phase 13: migration applied before the entity field; the response only gains a field; backend tests green.
- Phase 14: each new recipe-view piece is wired in the task that creates it; the build is green after every task; files measured in Task 73.
- Phase 15: the unused flag goes first, then the restyle; the build is green; manual walkthrough (Task 79).
- Phase 16: verification and the version bump only.
