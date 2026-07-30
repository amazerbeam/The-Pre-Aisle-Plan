# Tasks: Shopping list shows half the required quantity for entries stored with servings = 1

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: BLOCKED
Started: 2026-07-29

**BLOCKED on two developer actions, not on unfinished work.** All code, tests, and the data-repair SQL are written and reviewed (Code-Evaluator + Defender + QA, one combined fix pass applied). Outstanding:
1. **Backend never compiled or tested** — this machine has no JDK/Maven/Docker. 9 tests across 2 files are written-but-unexecuted. Run `cd foodbytes-app/foodbytes-api; mvn clean test`.
2. **The 23 production rows are still wrong** — apply `foodbytes-app/database/migrations/2026-07-29_fix_meal_plan_entries_servings.sql` by hand (rollback block is at the bottom, commented out).

**Concurrent-change note:** mid-run, the sibling contract `2026-07-29-decimal-serving-size` converted `servings` from `Integer` to `BigDecimal` across entities, DTOs, and services. This contract's fix was adapted to match (`resolveServings` now returns `BigDecimal`; `@Min(1)` became `@DecimalMin("0.25")` on the DTO). A type-consistency sweep confirms every `servings` site is `BigDecimal` — no mismatch. The core fix is intact: the DTO carries **no field initialiser**, so an omitted `servings` still reaches the recipe-derived fallback.

**Goal:** Stop `meal_plan_entries.servings` defaulting to the literal `1` instead of the recipe's `default_servings`, and repair the 23 existing rows that halve their recipe's quantities in the shopping list.

**Spec:** `plan.md` in this folder.

**Notes for the executor:**
- **No schema change.** Hibernate runs `ddl-auto: validate`, but nothing here adds or alters a column — removing a Java field initialiser and two JS parameter defaults touches no DDL. Do **not** create a migration file.
- **Phase 3 REVISED 2026-07-29 during `/fb-apply`.** The developer withdrew authorisation for an agent-run `UPDATE` against live production data and asked for **a SQL file instead**. Phase 3 now emits `foodbytes-app/database/migrations/2026-07-29_fix_meal_plan_entries_servings.sql` (snake_case, matching the existing convention in that folder) containing the pinned `UPDATE`, the verification queries, and the rollback block. **No agent executes any write against the live Railway MySQL, and no read-only query is run against it either** — the 23 row ids and their pre-image (`servings = 1`) are already established in `plan.md`. The developer applies the file manually.
- **The `mysql` MCP client renders `DATE` columns in UTC**, so `plan_date` displays one day early (`2026-07-31` comes back as `2026-07-30T23:00:00.000Z`). Every query below uses `DATE_FORMAT(plan_date,'%Y-%m-%d')`. Do not read raw date output.
- `client/package.json` has **no test runner**. Frontend verification is `npm run build` plus the manual check in Phase 4. Never report a frontend test as passing.
- Maven wrapper is not checked in — use `mvn` directly from `foodbytes-app/foodbytes-api/`.

---

## File map

**Created:**
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java` — unit tests for the servings fallback in `assignRecipe`.
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/dto/MealPlanCreateRequestTest.java` — Jackson test proving an omitted `servings` key deserialises to `null`, not `1`.

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanCreateRequest.java:28` — drop the `= 1` field initialiser.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java:179` — replace the literal `1` fallback with a recipe-derived `resolveServings` helper.
- `foodbytes-app/client/src/services/mealPlanService.js:24-27` — remove the `servings = 1` parameter default and correct the JSDoc.
- `foodbytes-app/client/src/contexts/MealPlanContext.jsx:234-238` — remove the `servings = 1` parameter default and correct the JSDoc.

**Deleted:** (none)

**Database (live Railway MySQL — now delivered as a file, see the Phase 3 note):**
- `foodbytes-app/database/migrations/2026-07-29_fix_meal_plan_entries_servings.sql` — **created 2026-07-29.** Data repair, no DDL. Contains the pre-flight and audit `SELECT`s, the pinned 23-id `UPDATE`, the two post-flight verification `SELECT`s, and a commented 23-statement rollback block. **Not applied — the developer runs it manually.**
- `meal_plan_entries` — 23 rows to be updated from `servings = 1` to `servings = 2` (`user_id = 1` only; `id = 306`/`user_id = 6` deliberately excluded). **Not yet applied.**

---

## Phase 1 — Close the backend defaulting trap

The root-cause fix. Written test-first: Task 1 pins the wrong behaviour with a failing assertion, Tasks 2 and 3 correct it, Task 4 proves it. The phase boundary is safe because Tasks 2 and 3 change one expression and one field initialiser — after both, the module compiles and the full backend suite is green with no half-applied state. Do not stop between Tasks 2 and 3: removing the DTO initialiser alone leaves the service substituting the same literal `1` one layer later, which is behaviourally identical to today.

### Task 1: Failing test for the servings fallback in `MealPlanService.assignRecipe`

- Skill: `java-backend` — governs test placement under `src/test/java/com/foodbytes/service/` and the `mvn test -Dtest=` runner.

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java`

> **BLOCKER recorded 2026-07-29 during `/fb-apply` (Phase 1).** This machine has **no Java toolchain**: `mvn`, `java`, and `docker` are all absent (`Get-Command mvn/java/docker` → not found; no `JAVA_HOME`/`M2_HOME`; no JDK under `C:\Program Files*`, `%LOCALAPPDATA%`, `HKLM:\SOFTWARE\JavaSoft`, or `HKLM:\SOFTWARE\Eclipse Adoptium`; no scoop/choco). **Every `mvn` step below is UNRUN** — Task 1 Step 2, Task 2 Step 3, Task 3 Step 3, Task 4 Step 1 are left unticked. All code and test files are written and both halves of the fix (Tasks 2 + 3) are applied together, so the tree is in the contract's clean state — only verification is outstanding. The developer must run `mvn test` from `foodbytes-app/foodbytes-api/` (or install a JDK 17 + Maven, e.g. `winget install EclipseAdoptium.Temurin.17.JDK Apache.Maven`) before this phase can be signed off.

- [x] **Step 1: Write the test class**

Mirror `ShoppingListServiceTest`'s shape — `@ExtendWith(MockitoExtension.class)`, `@Mock` per constructor dependency, `@InjectMocks`, AssertJ assertions. `MealPlanService` has six dependencies (`MealPlanEntryRepository`, `MealRepository`, `RecipeRepository`, `UserRepository`, `RecipeService`, `MacroCalculationService`); all six need a `@Mock` or `@InjectMocks` fails to construct.

```java
package com.foodbytes.service;

import com.foodbytes.dto.MealPlanCreateRequest;
import com.foodbytes.model.Meal;
import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.User;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.MealRepository;
import com.foodbytes.repository.RecipeRepository;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for MealPlanService.assignRecipe servings resolution.
 * A meal plan entry must inherit the recipe's default_servings when the request
 * omits servings — defaulting to the literal 1 halves every quantity the
 * shopping list derives from that entry.
 */
@ExtendWith(MockitoExtension.class)
class MealPlanServiceTest {

    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private MealRepository mealRepository;
    @Mock private RecipeRepository recipeRepository;
    @Mock private UserRepository userRepository;
    @Mock private RecipeService recipeService;
    @Mock private MacroCalculationService macroCalculationService;

    @InjectMocks private MealPlanService mealPlanService;

    @Captor private ArgumentCaptor<MealPlanEntry> entryCaptor;

    private static final Long USER_ID = 1L;
    private static final Long MEAL_ID = 3L;
    private static final Long RECIPE_ID = 104L;

    private User user;
    private Meal meal;
    private Recipe recipe;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(USER_ID);

        meal = new Meal();
        meal.setId(MEAL_ID);
        meal.setKey("dinner");

        recipe = new Recipe();
        recipe.setId(RECIPE_ID);
        recipe.setName("Beef & Mushroom Black Bean Stir Fry");
        recipe.setDefaultServings(2);
        recipe.setCalories(900);
    }

    private void stubHappyPath() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealIdAndRecipeId(
                anyLong(), any(), anyLong(), anyLong())).thenReturn(Optional.empty());
        when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealId(
                anyLong(), any(), anyLong())).thenReturn(Optional.empty());
        when(mealRepository.findById(MEAL_ID)).thenReturn(Optional.of(meal));
        when(recipeRepository.findById(RECIPE_ID)).thenReturn(Optional.of(recipe));
        when(mealPlanEntryRepository.save(any(MealPlanEntry.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(macroCalculationService.calculatePerServingMacros(any()))
                .thenReturn(new int[]{0, 0, 0});
    }

    private MealPlanCreateRequest requestWithServings(Integer servings) {
        MealPlanCreateRequest request = new MealPlanCreateRequest();
        request.setPlanDate(LocalDate.of(2026, 7, 31));
        request.setMealId(MEAL_ID);
        request.setRecipeId(RECIPE_ID);
        request.setServings(servings);
        return request;
    }

    @Test
    void assignRecipe_whenServingsOmitted_usesRecipeDefaultServings() {
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualTo(2);
    }

    @Test
    void assignRecipe_whenServingsProvided_honoursRequestedValue() {
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(1));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualTo(1);
    }

    @Test
    void assignRecipe_whenRecipeHasNoDefaultServings_fallsBackToOne() {
        recipe.setDefaultServings(null);
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualTo(1);
    }
}
```

- [ ] **Step 2: Run the new test and confirm it fails on the current code** — **UNRUN, no `mvn`/`java` on this machine (see Phase 1 blocker above).** The premise was instead confirmed statically: pre-fix `MealPlanService.java:179` read `entry.setServings(request.getServings() != null ? request.getServings() : 1)`, so a null `servings` against `default_servings = 2` stored `1`. This is *not* a substitute for the run.

Run: `cd foodbytes-app/foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: BUILD FAILURE. `assignRecipe_whenServingsOmitted_usesRecipeDefaultServings` fails with `expected: 2 but was: 1`. The other two tests pass. If the first test passes here, stop — the premise is wrong and the plan needs revisiting.

### Task 2: Remove the `servings = 1` field initialiser from `MealPlanCreateRequest`

- Skill: `java-backend` — DTO conventions; entities never cross the wire, request shapes live in `dto/`.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanCreateRequest.java:27-28`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/dto/MealPlanCreateRequestTest.java`

- [x] **Step 1: Drop the initialiser**

Replace:

```java
    @Min(value = 1, message = "Servings must be at least 1")
    private Integer servings = 1;
```

with:

```java
    /**
     * Optional. When omitted, MealPlanService derives the value from the
     * recipe's default_servings — a field initialiser here would mask the
     * omission and silently store 1.
     */
    @Min(value = 1, message = "Servings must be at least 1")
    private Integer servings;
```

`@Min` is not evaluated against `null`, so an omitted field still passes validation and reaches the service fallback. An explicit `0` or negative is still rejected with a 400.

- [x] **Step 2: Write the Jackson deserialisation test**

Create `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/dto/MealPlanCreateRequestTest.java`. This is the only thing that verifies Step 1 — the service tests in Task 1 construct the DTO directly and set `servings` explicitly, so they cannot catch a reinstated initialiser.

```java
package com.foodbytes.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * A request body that omits "servings" must deserialise to null so
 * MealPlanService can substitute the recipe's default_servings.
 */
class MealPlanCreateRequestTest {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    void omittedServings_deserialisesToNull() throws Exception {
        String json = "{\"planDate\":\"2026-07-31\",\"mealId\":3,\"recipeId\":104}";

        MealPlanCreateRequest request = objectMapper.readValue(json, MealPlanCreateRequest.class);

        assertThat(request.getServings()).isNull();
    }

    @Test
    void explicitServings_isPreserved() throws Exception {
        String json = "{\"planDate\":\"2026-07-31\",\"mealId\":3,\"recipeId\":104,\"servings\":4}";

        MealPlanCreateRequest request = objectMapper.readValue(json, MealPlanCreateRequest.class);

        assertThat(request.getServings()).isEqualTo(4);
    }
}
```

- [ ] **Step 3: Run the DTO test** — **UNRUN, no `mvn`/`java` on this machine (see Phase 1 blocker above).**

Run: `cd foodbytes-app/foodbytes-api; mvn test -Dtest=MealPlanCreateRequestTest`
Expected: BUILD SUCCESS, Tests run: 2, Failures: 0, Errors: 0.

### Task 3: Derive the fallback from the recipe in `MealPlanService`

- Skill: `java-backend` — business logic belongs in `service/`; this is the only layer holding the `Recipe` entity.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java:179`

- [x] **Step 1: Replace the literal fallback at line 179**

Replace:

```java
        entry.setServings(request.getServings() != null ? request.getServings() : 1);
```

with:

```java
        entry.setServings(resolveServings(request.getServings(), recipe));
```

`recipe` is already in scope — it is loaded at line 171, eight lines above.

- [x] **Step 2: Add the private helper below `assignRecipe`**

Insert immediately after the closing brace of `assignRecipe` (after line 183):

```java
    /**
     * Resolve how many servings a new entry represents.
     * An omitted value means "the whole recipe as authored", i.e. the recipe's
     * default_servings — not 1. Storing 1 against a 2-serving recipe halves every
     * quantity ShoppingListService derives from the entry.
     *
     * @param requested Servings from the request, or null when omitted
     * @param recipe    The recipe being assigned
     * @return the requested value, else the recipe's default_servings, else 1
     */
    private int resolveServings(Integer requested, Recipe recipe) {
        if (requested != null) {
            return requested;
        }
        Integer recipeDefault = recipe.getDefaultServings();
        return recipeDefault != null && recipeDefault > 0 ? recipeDefault : 1;
    }
```

- [ ] **Step 3: Confirm the Task 1 tests now pass** — **UNRUN, no `mvn`/`java` on this machine (see Phase 1 blocker above).**

Run: `cd foodbytes-app/foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: BUILD SUCCESS, Tests run: 3, Failures: 0, Errors: 0.

### Task 4: Confirm the whole backend suite is green

- Skill: `java-backend` — `mvn test` is the project runner; no wrapper is checked in.

**Files:**
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/` (whole tree)

- [ ] **Step 1: Full backend test run** — **UNRUN, no `mvn`/`java` on this machine (see Phase 1 blocker above). Phase 1 cannot be signed off until the developer runs this.**

Run: `cd foodbytes-app/foodbytes-api; mvn test`
Expected: BUILD SUCCESS. All test classes pass — `MealPlanServiceTest` (3), `MealPlanCreateRequestTest` (2), `ShoppingListServiceTest`, `AuthControllerLoginTest`. 0 failures, 0 errors.

---

## Phase 2 — Remove the mirrored frontend defaults

The client carries the same literal `1` in two parameter defaults. Both are latent today — `DayAssignmentButtons.jsx:91` always passes an explicit `servings` from `RecipeCard`'s `useState(recipe.defaultServings || 1)` — but leaving them means a future caller that omits the argument recreates the bug with the backend fix in place. This phase is a safe boundary because both edits are signature-level with no behavioural change at any current call site; the build stays green whether or not Phase 3 follows.

### Task 5: Remove the `servings = 1` default from `mealPlanService.assignRecipe` ✓

- Skill: `react-frontend` — HTTP stays in `services/`; no new dependency; JSDoc conventions.

**Files:**
- Modify: `foodbytes-app/client/src/services/mealPlanService.js:24-27`

- [x] **Step 1: Drop the parameter default and correct the JSDoc**

Replace:

```js
   * @param {number} servings - Number of servings (default 1)
   * @returns {Promise<Object|null>} MealPlanEntryDTO if created, null if removed
   */
  async assignRecipe(planDate, mealId, recipeId, servings = 1) {
```

with:

```js
   * @param {number} [servings] - Number of servings. Omit to let the backend
   *   derive it from the recipe's defaultServings; do not default it to 1 here.
   * @returns {Promise<Object|null>} MealPlanEntryDTO if created, null if removed
   */
  async assignRecipe(planDate, mealId, recipeId, servings) {
```

The body is unchanged. An omitted `servings` is `undefined`, which Axios drops from the serialised JSON body, so the key is absent and the backend fallback from Task 3 applies.

> **Serialisation premise verified 2026-07-29 during `/fb-apply` (Phase 2).** The body is an object literal `{ planDate, mealId, recipeId, servings }` passed to `api.post`, and `services/api.js` sets only `baseURL` / `headers` / `withCredentials` — **no `transformRequest` override**, so Axios's default `JSON.stringify` transform applies and drops an `undefined` `servings` key entirely. It is not serialised as `null` or `0`. Premise holds.

### Task 6: Remove the `servings = 1` default from `MealPlanContext.assignRecipe` ✓

- Skill: `react-frontend` — cross-cutting state lives in a Context; don't add a second store; no `console.log`.

**Files:**
- Modify: `foodbytes-app/client/src/contexts/MealPlanContext.jsx:234-238`

- [x] **Step 1: Drop the parameter default and correct the JSDoc**

Replace:

```js
   * @param {number} servings
   * @param {Object} recipeData - Recipe object with calories for optimistic update
   * @returns {boolean} true if this will be an assignment, false if removal
   */
  const assignRecipe = useCallback((recipeId, planDate, mealId, servings = 1, recipeData = null) => {
```

with:

```js
   * @param {number} [servings] - Omit to let the backend derive it from the
   *   recipe's defaultServings; do not default it to 1 here.
   * @param {Object} recipeData - Recipe object with calories for optimistic update
   * @returns {boolean} true if this will be an assignment, false if removal
   */
  const assignRecipe = useCallback((recipeId, planDate, mealId, servings, recipeData = null) => {
```

Leave line 185 (`const defaultServings = recipeData?.defaultServings || 1`) alone — that is the optimistic-calorie divisor, a different concern, and `1` is the correct guard against a divide-by-zero there. **Left untouched as instructed** (now line 185 still, unchanged).

> **`servings` usage inside the callback verified 2026-07-29 during `/fb-apply` (Phase 2).** `servings` is used in exactly two places in the `assignRecipe` body and **neither is arithmetic**, so an omitted argument cannot produce `NaN`: (1) line 258 passes it through to `applyOptimisticUpdate`, which only stores it verbatim on the temporary entry (`servings: servings`, line 191) — `caloriesDelta` is computed from `recipeData.calories / defaultServings`, never from `servings`; (2) line 261 forwards it to `mealPlanService.assignRecipe`, where `undefined` is dropped from the JSON body. See the observation logged in the Phase 2 report about `entry.servings` on the optimistic entry.

- [x] **Step 2: Confirm the client still builds**

Run: `cd foodbytes-app/client; npm run build`
Expected: `vite build` completes and prints `✓ built in <n>s` with no errors. There is no test runner in `client/package.json`, so this is a compile check only — do not report it as a passing test.

**Result 2026-07-29:** `vite v5.4.21`, `✓ 169 modules transformed`, `✓ built in 601ms`, no errors or warnings. `node_modules` was already present — no `npm install` needed. **Compile check only, not a test run.**

---

## Phase 3 — Repair the 23 production rows

> **PHASE 3 DELIVERED AS A FILE, NOT EXECUTED — 2026-07-29.** Per the developer's instruction, authorisation for an agent-run write against the live Railway MySQL was withdrawn and this phase was delivered as **`foodbytes-app/database/migrations/2026-07-29_fix_meal_plan_entries_servings.sql`** for manual application. **Zero database calls were made — not even a read-only `SELECT`.** The file contains, in order: the pre-flight `SELECT` (Task 7), the repo-wide audit `SELECT`, the pinned `UPDATE` (Task 9 Step 1), the two post-flight verification `SELECT`s (Task 9 Steps 2–3), and a commented-out 23-statement rollback block (Task 8). The 23 row ids and their pre-image (`servings = 1`) come from `plan.md`, not from a fresh query. **Consequence: nothing in Phase 3 has been verified against live data, and the 23 rows are still wrong in production until the developer runs the file.** The queries below are retained as the specification of what the file must contain; their `- [ ]` state reflects *execution*, which did not happen.
>
> **Note for the developer before applying:** this file touches live personal meal-plan data (`user_id = 1`). Applying it is a data-privacy-relevant action — confirm you intend to modify production personal data before running it, and keep the rollback block to hand.

Data repair against the live Railway MySQL via the `mysql` MCP server. **This writes real personal meal-plan data.** Task 8 must complete and its output be visible in the session before Task 9 runs — that output is the only rollback path. The phase is a safe boundary because it touches no code: if it is abandoned midway the codebase is exactly as Phase 2 left it, and a partial `UPDATE` cannot occur since the statement is a single autocommit transaction over an enumerated id list.

### Task 7: Confirm the target rows are still exactly the 23 identified during planning

- Skill: none — read-only SQL through the `mysql` MCP server, no application code involved.

- [ ] **Step 1: Re-run the audit query** — **NOT RUN. SUPERSEDED, not complete.** This query was to be executed against live data to re-confirm the id set; the revised scope forbids any database contact, so no re-confirmation happened. It is instead **written into the SQL file as STEP 1 (pre-flight, id-scoped) and STEP 2 (repo-wide audit, expected 24 rows before / 1 after)** for the developer to run before the `UPDATE`. The file's STEP 2 comment instructs the developer to STOP and report if rows appear that are neither in the 23-id list nor id 306, preserving this task's intent.

Run (via `mcp__mysql__mysql_query`):

```sql
SELECT mpe.id, DATE_FORMAT(mpe.plan_date,'%Y-%m-%d') AS plan_date, mpe.user_id,
       mpe.recipe_id, r.name, mpe.servings, r.default_servings
FROM meal_plan_entries mpe
JOIN recipes r ON r.id = mpe.recipe_id
WHERE mpe.servings = 1 AND r.default_servings > 1
ORDER BY mpe.user_id, mpe.id;
```

Expected: 24 rows. 23 with `user_id = 1` and ids exactly `956, 961, 964, 1078, 1081, 1084, 1192, 1200, 1203, 1223, 1231, 1234, 1254, 1256, 1259, 1275, 1277, 1299, 1301, 1323, 1353, 1416, 1493`; every one has `default_servings = 2` and `recipe_id` in `(23, 37, 104, 139, 142)`. Plus 1 row with `user_id = 6`, `id = 306` — **out of scope, do not touch**.

If the id set differs, stop and report. New rows appearing here after the Phase 1 fix would mean a third defaulting path exists that this plan did not close.

### Task 8: Capture the pre-image for rollback

- Skill: none — read-only SQL through the `mysql` MCP server.

- [ ] **Step 1: Emit a ready-to-run rollback statement — DELIVERED AS A FILE, query NOT executed** The `CONCAT` query below was not run. Its *product* — the 23 ready-to-run rollback statements — is written out literally in the `ROLLBACK` block at the bottom of `2026-07-29_fix_meal_plan_entries_servings.sql`, one `UPDATE meal_plan_entries SET servings = 1 WHERE id = <id>;` per id in ascending order, commented out so it cannot fire by accident. The pre-image (`servings = 1` on all 23) is taken from `plan.md`, where it is already established, rather than re-read from the database. This step is ticked because its deliverable exists and is co-located with the `UPDATE` it reverses — a stronger outcome than session output, which is lost when the session ends.

Run (via `mcp__mysql__mysql_query`):

```sql
SELECT CONCAT('UPDATE meal_plan_entries SET servings = ', servings,
              ' WHERE id = ', id, ';') AS rollback_stmt
FROM meal_plan_entries
WHERE id IN (956,961,964,1078,1081,1084,1192,1200,1203,1223,1231,1234,
             1254,1256,1259,1275,1277,1299,1301,1323,1353,1416,1493)
ORDER BY id;
```

Expected: 23 rows, each reading `UPDATE meal_plan_entries SET servings = 1 WHERE id = <id>;`. Reproduce this output verbatim in the session summary — it is the rollback script. Do not proceed to Task 9 until it is recorded.

### Task 9: Set the 23 rows to the recipe's default servings

- Skill: none — data repair through the `mysql` MCP server; no application code, no migration file (nothing here is DDL).

- [ ] **Step 1: Run the pinned UPDATE** — **NOT RUN. SUPERSEDED, not complete.** The statement below is delivered verbatim as **STEP 3** of `2026-07-29_fix_meal_plan_entries_servings.sql`, byte-identical id list included, with its three design choices (`SET = r.default_servings` not `2`; `AND servings = 1` for idempotency; enumerated ids) explained in comments and "23 rows affected" stated as the expected outcome. **The 23 production rows remain wrong until the developer runs it.** Tick this only once the developer has applied the file and seen 23 rows affected.

Run (via `mcp__mysql__mysql_query`):

```sql
UPDATE meal_plan_entries mpe
JOIN recipes r ON r.id = mpe.recipe_id
SET mpe.servings = r.default_servings
WHERE mpe.id IN (956,961,964,1078,1081,1084,1192,1200,1203,1223,1231,1234,
                 1254,1256,1259,1275,1277,1299,1301,1323,1353,1416,1493)
  AND mpe.servings = 1;
```

Expected: 23 rows affected. The `AND mpe.servings = 1` guard makes the statement idempotent — a re-run affects 0 rows rather than re-applying. The id list is enumerated rather than predicate-driven so a legitimate single-serving entry created since planning cannot be caught.

- [ ] **Step 2: Verify only the intended rows moved** — **NOT RUN. SUPERSEDED, not complete.** Delivered as **STEP 4** of the SQL file, with the expected result (exactly 1 row, `id = 306`, `user_id = 6`) stated in a comment. Cannot be a verification until the developer runs it after STEP 3.

Run (via `mcp__mysql__mysql_query`):

```sql
SELECT mpe.id, DATE_FORMAT(mpe.plan_date,'%Y-%m-%d') AS plan_date, mpe.user_id,
       mpe.recipe_id, mpe.servings, r.default_servings
FROM meal_plan_entries mpe
JOIN recipes r ON r.id = mpe.recipe_id
WHERE mpe.servings = 1 AND r.default_servings > 1
ORDER BY mpe.id;
```

Expected: exactly 1 row — `id = 306`, `user_id = 6`. Every `user_id = 1` row is gone from the result set.

- [ ] **Step 3: Confirm the reported symptom is arithmetically resolved** — **NOT RUN. SUPERSEDED, not complete.** Delivered as **STEP 5** of the SQL file, with the expected row (`Sirloin steak`, `recipe_qty = 240.00`, `servings = 2`, `default_servings = 2`, `shopping_list_qty = 240.00`) stated in a comment. The bug-report figure is **unconfirmed** until the developer runs it.

Run (via `mcp__mysql__mysql_query`):

```sql
SELECT i.name AS ingredient, ri.quantity AS recipe_qty, mpe.servings, r.default_servings,
       ROUND(ri.quantity * mpe.servings / r.default_servings, 2) AS shopping_list_qty
FROM meal_plan_entries mpe
JOIN recipes r ON r.id = mpe.recipe_id
JOIN recipe_ingredients ri ON ri.recipe_id = r.id
JOIN ingredients i ON i.id = ri.ingredient_id
WHERE mpe.id = 1493 AND i.name = 'Sirloin steak';
```

Expected: one row — `Sirloin steak`, `recipe_qty = 240.00`, `servings = 2`, `default_servings = 2`, `shopping_list_qty = 240.00`. This is the exact figure from the bug report, now correct.

---

## Phase 4 — Final verification

No production changes. Sanity-checks that the cumulative work is clean and that no other literal-`1` servings default survived in the paths this plan claimed to close.

### Task 10: Grep for surviving `servings = 1` defaults in the assign path ✓

- Skill: none — static audit, no code change.

- [x] **Step 1: Confirm the four edited sites no longer default to 1**

Run:
```bash
grep -rn "servings = 1\|servings != null ? request.getServings() : 1" \
  foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanCreateRequest.java \
  foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java \
  foodbytes-app/client/src/services/mealPlanService.js \
  foodbytes-app/client/src/contexts/MealPlanContext.jsx
```
Expected: zero hits.

**RESULT (2026-07-29):** zero hits on all four files. Run with the Grep tool (no `grep` binary on this Windows shell); pattern `servings = 1|servings != null \? request\.getServings\(\) : 1`, each file queried individually — "No matches found" four times.

- [x] **Step 2: Record the known remaining occurrences as deliberately out of scope**

Run:
```bash
grep -rn "servings = 1\|getServings() : 1" foodbytes-app/foodbytes-api/src/main/java/com/foodbytes foodbytes-app/client/src
```
Expected: exactly four hits — down from eight before this plan. All four are deliberate leave-alones; do **not** "helpfully" clean them up:

| Hit | Why it stays |
|---|---|
| `model/MealPlanEntry.java:40` | The JPA entity's own field initialiser, mirroring the `servings int NOT NULL DEFAULT '1'` column. Harmless because `assignRecipe` and `copyWeek` both call `setServings(...)` explicitly on every insert path, so it is never the value that reaches the DB. Changing it would decouple the entity from the column default for no gain. |
| `model/MealPlanTemplateEntry.java:40` | Meal-plan **template** subsystem — explicitly out of scope per `plan.md`. |
| `service/MealPlanTemplateService.java:174` | Same subsystem, same exclusion. |
| `service/MealPlanTemplateService.java:204` | Same subsystem, same exclusion. |

If a fifth hit appears, or any hit falls outside this table, report it rather than fixing it silently.

**RESULT (2026-07-29):** exactly four hits, matching the table above with no fifth hit and nothing outside it. Verbatim:

```
service/MealPlanTemplateService.java:174:  entry.setServings(src.getServings() != null ? src.getServings() : 1);
service/MealPlanTemplateService.java:204:  e.setServings(src.getServings() != null ? src.getServings() : 1);
model/MealPlanTemplateEntry.java:40:       private Integer servings = 1;
model/MealPlanEntry.java:40:               private Integer servings = 1;
```

`client/src` returned zero hits (both JS defaults are gone). All four survivors left untouched as intended.

### Task 11: Full test suite and client build, end to end

- Skill: none — running the project's existing runners, no code change.

- [ ] **Step 1: Clean backend test run** — **BLOCKED: no Java toolchain on this machine.**

Run: `cd foodbytes-app/foodbytes-api; mvn clean test`
Expected: BUILD SUCCESS, 0 failures, 0 errors, across `MealPlanServiceTest`, `MealPlanCreateRequestTest`, `ShoppingListServiceTest`, `AuthControllerLoginTest`.

**BLOCKED (2026-07-29):** `mvn`, `java`, `javac` and `docker` are all absent — no `JAVA_HOME`, no JDK under `C:\Program Files*` or in the registry. The command was **not attempted** and there is **no result to report**. The two new test files (5 tests total) are written but have **never been executed**. Deferred to the developer — see the deploy note at the end of this file.

- [x] **Step 2: Client production build**

Run: `cd foodbytes-app/client; npm run build`
Expected: `✓ built in <n>s`, no errors. Not a test — state it as a compile check in the summary.

**RESULT (2026-07-29): PASSED.** This is a **compile check, not a test** — `client/package.json` has no test runner. Verbatim tail:

```
> foodbytes-client@1.0.0-mvp build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 169 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.84 kB │ gzip:  0.45 kB
dist/assets/index-BgFJJPSX.css   97.05 kB │ gzip: 15.73 kB
dist/assets/index-B8ZfHEP5.js   315.79 kB │ gzip: 96.85 kB
✓ built in 635ms
```

### Task 12: Manual smoke test against the running app

- Skill: `react-frontend` — the rule is to state what was verified manually and what was not, since no frontend test runner exists.

- [ ] **Step 1: Check the shopping list renders the repaired quantity** — **BLOCKED / DEFERRED TO DEVELOPER.**

Run: `cd foodbytes-app/client; npm run dev` (with the backend on `:8080`), then open `http://localhost:5173/shopping` for the week containing **2026-07-31** (Friday).
Expected: `Sirloin steak` shows **240 g**, not 120 g. Before Phase 3 it read 120 g.

**BLOCKED (2026-07-29)** for three independent reasons:
1. The backend cannot be built or started (no JDK / Maven / Docker), so there is no `:8080` for the Vite proxy to reach.
2. Database access was withdrawn for this run, so nothing about the underlying rows could be confirmed either.
3. **The expected result depends on Phase 3 having been applied, and it has not been.** The 23 rows are still `servings = 1`, so `Sirloin steak` would still read **120 g** even against a fully running app. That is correct-and-expected at this point in the sequence, **not a regression** — this check only becomes meaningful after the developer runs the repair SQL.

No dev server was started and no browser automation was attempted.

- [ ] **Step 2: Check a new assignment inherits the recipe default** — **BLOCKED / DEFERRED TO DEVELOPER.**

In the app, assign any two-serving recipe to an empty day/meal slot, then query:

```sql
SELECT mpe.id, DATE_FORMAT(mpe.plan_date,'%Y-%m-%d') AS plan_date,
       mpe.recipe_id, mpe.servings, r.default_servings
FROM meal_plan_entries mpe JOIN recipes r ON r.id = mpe.recipe_id
WHERE mpe.user_id = 1 ORDER BY mpe.id DESC LIMIT 1;
```
Expected: the new row has `servings = 2`, matching `default_servings`. Remove the test assignment afterwards via the same UI toggle.

**BLOCKED (2026-07-29):** same three reasons as Step 1 — no runnable backend to create the assignment through, no DB access to run the confirmation `SELECT`, and no running app. The backend behaviour this step exercises is covered *in intent* by the two unexecuted test files, so it remains unverified at every level until the developer runs `mvn clean test` and/or this manual check.

### Task 13: Write the deploy and rollback note ✓

- Skill: none — documentation of what the executor did.

- [x] **Step 1: Record the handover facts in the session summary**

This repo has no PR workflow — the backend redeploys from a push to `master` on Railway — so the deploy note replaces a PR description. Include:
- The four files changed and the one-line reason for each.
- Confirmation that **no migration file was created and none is needed** (no DDL; `ddl-auto: validate` is unaffected).
- The 23-row `UPDATE` result and the verbatim rollback script captured in Task 8.
- The `mvn clean test` result and the `npm run build` result, stated separately, with an explicit note that the frontend has no test runner and was verified by build plus the Task 12 manual check.
- A one-line note for future contributors: an omitted `servings` on `POST /api/meal-plan` now means "the recipe as authored", not "one serving".
- The two things deliberately left undone: `copyWeek` still propagates a bad `servings` verbatim (`MealPlanService.java:274`), and the `quantity_grams` gram-conversion defects recorded in `plan.md` are unfixed.

---

## Self-review

(Filled by the planner before handing off — kept in the file so the executor can confirm coverage.)

**Spec coverage:**
- *In scope 1 — `MealPlanService.assignRecipe` falls back to `recipe.getDefaultServings()`* — Task 3.
- *In scope 2 — `MealPlanCreateRequest.servings` loses its `1` initialiser* — Task 2.
- *In scope 3 — the two mirrored JS parameter defaults are removed* — Tasks 5, 6.
- *In scope 4 — JUnit 5 test covering the new fallback* — Task 1 (failing), Task 3 Step 3 (passing), plus Task 2 Step 2 for the DTO half that Task 1 structurally cannot reach.
- *In scope 5 — repair the 23 rows with a pre-image captured first* — Tasks 7, 8, 9.
- *Out-of-scope boundaries are actively enforced, not just documented* — Task 7 Step 1 and Task 10 Step 2 name row 306 and the three template-subsystem sites as must-not-touch.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code, the exact SQL, or a `Run:` / `Expected:` pair with a concrete outcome.

**Type / name consistency:** `resolveServings(Integer requested, Recipe recipe)` returns `int` and is referenced identically in Task 3 Steps 1 and 2 and in `plan.md` → Data shapes. `MealPlanCreateRequest.servings` is `Integer` (nullable) in Task 2, in the Task 1 test helper `requestWithServings(Integer)`, and in `plan.md`. The JS parameter is `servings` (no default) in Tasks 5 and 6 and in `plan.md`. The 23 row ids are byte-identical in Tasks 7, 8, and 9. Every `- Skill:` value is either `java-backend`, `react-frontend`, or the literal `none — <reason>`; `chef` appears in `plan.md`'s skill list with a note that no task invokes it, which remains true here.

**Phase boundary cleanliness:**
- *Phase 1* ends with the full backend suite green (Task 4) and both halves of the defaulting fix applied — the phase warns explicitly against stopping between Tasks 2 and 3, which would leave the behaviour unchanged rather than broken.
- *Phase 2* ends with `npm run build` clean; both edits are signature-level and no current call site relies on the removed defaults, so the client is internally consistent whether or not Phase 3 runs.
- *Phase 3* touches no code at all; it is a single idempotent autocommit `UPDATE` guarded by `AND servings = 1`, preceded by a recorded rollback script, so an abort leaves either the pre-state or the post-state and never a partial one.
- *Phase 4* makes no production changes — greps, runners, and a manual check only.

---

## Deploy and rollback note

Written 2026-07-29 by the Implementer at the end of Phase 4. This repo has no PR workflow — the backend redeploys from a push to `master` on Railway — so this note replaces a PR description. It is self-contained: a developer should be able to act on it without re-reading `plan.md`.

### The behaviour change in one line

An omitted `servings` on `POST /api/meal-plan` now means **"the recipe as authored"** (the recipe's `default_servings`), **not "one serving"**. Any client that relied on the old silent `1` will now get the recipe default instead.

### Files changed — 6 code/test files, plus 1 SQL file

| File | Reason |
|---|---|
| `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanCreateRequest.java` | Dropped the `= 1` field initialiser on `servings` so an omitted key deserialises to `null` and the service can tell "not supplied" from "explicitly 1". Javadoc added. |
| `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java` | `assignRecipe` is now `entry.setServings(resolveServings(request.getServings(), recipe));`; new `private BigDecimal resolveServings(BigDecimal requested, Recipe recipe)` helper falls back to `recipe.getDefaultServings()`, then to `1` only if that is null or ≤ 0. **Review pass:** the helper is now self-defending — a non-positive `requested` is rejected rather than returned, so a future non-HTTP caller cannot persist `servings = 0` (which would make `ShoppingListService` compute `quantity × 0 / n = 0.00` for every ingredient, i.e. a silently empty shopping list). The class also **gained a logger** (`@Slf4j`, matching `MacroCalculationService`) and both degraded branches now `log.warn` instead of falling back silently. |
| `foodbytes-app/client/src/services/mealPlanService.js` | Removed the mirrored `servings = 1` parameter default so the client stops re-introducing the `1` the backend just stopped assuming. JSDoc corrected. |
| `foodbytes-app/client/src/contexts/MealPlanContext.jsx` | Same removal at the context layer. JSDoc corrected. **Review pass:** the optimistic entry now sets `servings: servings ?? recipeData?.defaultServings ?? 1` so a caller that omits the prop cannot render the literal string `"undefined"` in the servings input until `fetchWeekPlan()` returns. Display-only — the `mealPlanService.assignRecipe(...)` call still passes the **raw** `servings`, so an omitted value stays omitted from the JSON body and the backend fallback still applies. |
| `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java` | **NEW** — **5 tests**: servings omitted → 2 (recipe default); explicit `4` → `4` (a value that is neither 1 nor the recipe default — the real-user case); explicit `1` → `1` (still a legal explicit value, not overridden); null recipe default → 1 (safety floor); recipe default `0` → 1 (covers the `recipeDefault > 0` half of the guard). |
| `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/dto/MealPlanCreateRequestTest.java` | **NEW** — **4 tests**: 2 Jackson round-trip (omitted key → `null`, explicit `4` → `4`) plus 2 Jakarta Bean Validation tests added in the review pass — `servings: 0` yields exactly one violation on the `servings` path, and an omitted `servings` yields **zero** violations (the premise of the whole fix: the constraints must not fire on `null`). |
| `foodbytes-app/database/migrations/2026-07-29_fix_meal_plan_entries_servings.sql` | **NEW** — the data repair. See below. Review pass corrected the root-cause line citation, relaxed the STEP 1 `plan_date` bounds (they had been read from raw UTC-shifted output and would have triggered a false abort), pinned STEP 5 to `ri.id = 1584`, and added `AND mpe.user_id = 1` to the `UPDATE`. |

### No schema migration was created and none is needed

The change is **not DDL**. No table, column, index, or constraint was altered, so Hibernate's `ddl-auto: validate` is unaffected and the entity/column mapping is unchanged. The `MealPlanEntry.servings` field initialiser and the `servings int NOT NULL DEFAULT '1'` column both stay exactly as they were.

The one `.sql` file present is a **data repair**, not a migration. It is filed under `database/migrations/` only because that is where this repo keeps ad-hoc SQL — do not read its location as implying a schema change.

### The 23-row repair: **NOT APPLIED**

The 23 production rows are **still wrong** (`servings = 1` where the recipe authors 2). Nothing about the data repair has been executed or verified — agent DB access was withdrawn for this run.

**The developer must run:** `foodbytes-app/database/migrations/2026-07-29_fix_meal_plan_entries_servings.sql`

The file contains, in order: a pre-flight `SELECT` (confirm the 23 rows before touching them), a repo-wide audit `SELECT`, the pinned 23-row `UPDATE` (guarded by `AND servings = 1`, so it is idempotent and cannot over-apply, **and by `AND mpe.user_id = 1`** as defence-in-depth so the statement enforces the "user 1 only" promise the header makes rather than merely asserting it), and two post-flight verification `SELECT`s. **The rollback block is inside that same file, at the bottom, commented out** — 23 individual statements restoring the captured pre-image. Uncomment to revert.

Until this file is run, the shopping list still under-reports those entries.

### Verification status — stated honestly, per layer

- **Backend: NOT VERIFIED.** No JDK, Maven, or Docker on this machine (`mvn` / `java` / `javac` absent, no `JAVA_HOME`, no JDK in `C:\Program Files*` or the registry). The two new test files — **9 tests total (5 + 4) — were written but never executed.** The backend code has not even been compiled.
  - Developer must run: `cd foodbytes-app/foodbytes-api; mvn clean test`
  - To get the toolchain: `winget install EclipseAdoptium.Temurin.17.JDK Apache.Maven`
- **Frontend: `npm run build` PASSED** — re-run after the review-pass `MealPlanContext.jsx` edit: `✓ 169 modules transformed`, `✓ built in 810ms`, no errors. This is a **compile check, not a test**: `client/package.json` has no test runner, so nothing asserts the new behaviour on the client side.
- **Static audit: PASSED.** Zero surviving `servings = 1` / `getServings() : 1` defaults in the four edited files. Repo-wide the count is down from 8 to 4, and all 4 survivors are the deliberate leave-alones listed in Task 10 Step 2 (the `MealPlanEntry` entity initialiser plus three meal-plan-**template** subsystem sites, which are out of scope).
- **Manual smoke test: NOT PERFORMED.** Three independent reasons:
  1. The backend cannot be built or started, so there is no `:8080` for the client to proxy to.
  2. Database access was withdrawn, so the confirmation query could not be run.
  3. The shopping-list check depends on the 23-row repair having been applied, and it has not been — `Sirloin steak` would still read 120 g even with a running app. Expected at this stage, **not a regression.**

**Net: the only thing actually verified in this run is that the frontend compiles and that the audit is clean.** Both halves of the behaviour change are unverified.

### BLOCKER discovered during the review pass — an unrelated, half-finished `servings` type migration

`meal_plan_entries.servings` is being migrated from `Integer` to `BigDecimal` (to allow fractional portions) by work **outside this contract**, and that migration is **incomplete in the working tree**. `MealPlanEntry.servings` is `BigDecimal servings = BigDecimal.ONE` (`precision = 4, scale = 2`), `MealPlanCreateRequest.servings` is `BigDecimal` with `@DecimalMin("0.25")` / `@DecimalMax("20.00")` / `@Digits(2,2)` — but several consumers still expect `Integer`:

- `ShoppingListService.java:106` and `:244` — `Integer entryServings = entry.getServings();`
- `MealPlanTemplateService.java:174` and `:204` — `setServings(src.getServings() != null ? src.getServings() : 1)`

**As it stands `mvn clean test` will fail to compile**, for reasons that have nothing to do with this contract. All four sites are on this contract's explicit do-not-touch list (`ShoppingListService`, the meal-plan template subsystem), so they were left alone. **The developer must finish the `BigDecimal` migration before the 9 tests above can run.** This contract's own files were adapted to `BigDecimal` and are internally consistent.

Consequence for FIX 3 as specified: the review feedback asked for tests pinning `@Min(1)` with the message `"Servings must be at least 1"`. **No such constraint exists on the DTO** — the lower bound is `@DecimalMin("0.25")`, message `"Servings must be at least 0.25"`. The tests pin the constraint that actually exists, which still proves the two things that mattered: an explicit `0` is rejected, and `null` is not.

### Deliberately left undone

- **`copyWeek` still propagates a bad `servings` verbatim.** `copy.setServings(source.getServings())` — now at `MealPlanService.java:292` (the pre-edit line 274 cited in `plan.md`; it shifted by the `resolveServings` helper). Copying a week that contains a wrong value carries the wrong value forward. Fixing it was offered and **declined**.
- **The `quantity_grams` gram-conversion defects in `plan.md` are unfixed:** olive oil in recipes 101/102/103; red cabbage in 104/105/106; and the repo-wide sweep was never run — for the `g` unit alone there are **140 distinct ingredient:ratio combinations** where there should be roughly one per ingredient. This is a separate and larger data-integrity problem than the one this contract closed.
- **Row id 306 (`user_id = 6`) is deliberately left bad** — excluded from the pinned 23 and must not be swept up by any later repair.
- **Servings remains invisible in the UI.** There is no field, badge, or editor showing how many servings an entry represents, so a wrong value is only ever detectable indirectly, via a shopping-list quantity that looks suspicious. The class of bug this contract fixed can recur silently.
