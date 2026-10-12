# Tasks: User-configurable meal times (breakfast/lunch/dinner "by" times) in the account menu

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-12

**Goal:** Signed-in users set "Breakfast by / Lunch by / Dinner by" times in the account menu. They are stored in three nullable `users` TIME columns (null = default 11:00 / 15:00 / 21:00) and saved through the existing `PATCH /api/users/me/preferences`, with the same format and order rules enforced in the browser and as a server 400.

**Spec:** `plan.md` in this folder. Visual contract: `C:\Users\jossd\Downloads\mpp13-meal-times-mockup.html` (phone copy: https://claude.ai/artifact/B3B7NbJS5kW6UEQfKt51HG), approved 2026-10-12.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-12-mpp13-user-meal-times.sql` — adds `users.breakfast_by`, `lunch_by`, `dinner_by` (TIME NULL)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealTimesPolicy.java` — defaults, HH:mm regex, error strings, order rule, `effective(User)`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealTimesDTO.java` — effective times + `custom` (response)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealTimesRequest.java` — three HH:mm strings + `@AssertTrue` order (request)
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealTimesPolicyTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/dto/UserPreferencesUpdateRequestTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/UserControllerPreferencesTest.java`
- `foodbytes-app/client/src/constants/mealTimes.js` — keys, labels, order error string
- `foodbytes-app/client/src/utils/mealTimesUtils.js` — `isStrictlyOrdered`, `pickMealTimes`
- `foodbytes-app/client/src/utils/mealTimesUtils.check.mjs` — node assert smoke script
- `foodbytes-app/client/src/components/layout/MealTimesControl.jsx` — the account-menu section
- `foodbytes-app/client/src/components/layout/MealTimesControl.css`
- `.claude/contract/MPP-13-user-meal-times/pr-description.md`

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/User.java:46-50` — three `LocalTime` fields
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/UserDTO.java:17` — `mealTimes` field
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/UserPreferencesUpdateRequest.java` — `mealTimes` + presence-tracking setters
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/UserService.java:39-61` — `convertToDTO` adds meal times; `updatePreferences` replaces `updateDefaultServings`; adds `getUserDTO`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/UserController.java:22-37` — calls `updatePreferences`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/AuthController.java:28-43` — `/me` uses `userService.getUserDTO`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/UserServiceTest.java` — ported to `updatePreferences` + new meal-time tests
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/AuthControllerLoginTest.java:54` — 7-arg `UserDTO`
- `foodbytes-app/client/src/services/userService.js` — `updatePreferences(patch)`
- `foodbytes-app/client/src/contexts/AuthContext.jsx:53-76` — `mealTimes`, `saveMealTimes`; `saveDefaultServings` passes `{ defaultServings }`
- `foodbytes-app/client/src/components/layout/Header.jsx:6,66` — import + mount `MealTimesControl`
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump

**Deleted:** (none)

---

## Phase 1 — Schema migration

Write the additive migration and get it applied before any Java maps the columns. The new columns are nullable and unmapped by the current entity, so the running backend keeps starting cleanly at this boundary.

### Task 1: Write the users meal-times migration ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-12-mpp13-user-meal-times.sql`

- [x] **Step 1: Write the migration file**

```sql
-- 2026-10-12 — User-configurable meal times (MPP-13)
--
-- Adds three nullable TIME columns to users: the time by which the user usually
-- eats breakfast, lunch and dinner. NULL means "use the default"
-- (11:00 / 15:00 / 21:00, owned by MealTimesPolicy in the backend) — the defaults
-- are deliberately NOT written into the rows, so changing a default later reaches
-- every user who never chose their own, and "Reset to defaults" is a plain
-- clear-to-NULL.
--
-- Purely additive and lossless: no existing column or row changes. Live counts at
-- planning (2026-10-12): users = 13 rows; none of breakfast_by / lunch_by /
-- dinner_by existed. Every existing user reads as "defaults" (MPP-13 AC 2).
--
-- The three columns are always written together (all set, or all NULL) by
-- UserService.updatePreferences; the strict breakfast < lunch < dinner order is
-- enforced by the application (MealTimesRequest), not by a CHECK constraint, so
-- the 400 message stays the one the frontend shows.
--
-- MUST be applied to the Railway MySQL BEFORE the backend that maps these columns
-- is deployed (spring.jpa.hibernate.ddl-auto = validate fails startup otherwise).
-- Safe to apply while the current backend runs: validate ignores unmapped columns.

ALTER TABLE users
  ADD COLUMN breakfast_by TIME NULL DEFAULT NULL AFTER default_servings,
  ADD COLUMN lunch_by     TIME NULL DEFAULT NULL AFTER breakfast_by,
  ADD COLUMN dinner_by    TIME NULL DEFAULT NULL AFTER lunch_by;
```

- [x] **Step 2: Confirm the file exists**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-10-12-mpp13-user-meal-times.sql`
Expected: one file listed.

### Task 2: Developer applies the migration (local test DB, then Railway) — local ✓; Railway pending (developer applies before push)

- Skill: none — DBA operation against the live Railway MySQL

**Files:**
- (none — applies Task 1's file)

- [x] **Step 1: Apply to the local test DB (Docker must be running)**

Run: `cmd /c "docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app\database\migrations\2026-10-12-mpp13-user-meal-times.sql"`
Expected: no output, exit code 0.

- [ ] **Step 2: Developer applies the same file to the Railway MySQL**

Manual step owned by the developer. Live DB writes are classifier-blocked for the agent, so copy the file to `C:\Users\jossd\Downloads\` and pause until the developer confirms they ran it in MySQL Workbench against the `railway` schema. If the uncommitted MPP-12 migration (`2026-10-12-mpp12-meal-plan-entry-eaten.sql`) ships in the same push, it must be applied too. At planning it was not yet on Railway.

- [ ] **Step 3: Verify read-only on Railway**

Run (mysql MCP): `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('breakfast_by','lunch_by','dinner_by') ORDER BY ORDINAL_POSITION`
Expected: three rows, `time`, `YES`, `NULL`.

---

## Phase 2 — Backend: policy, DTOs, service, controllers

Map the columns, add the policy and request/response shapes, swap the service write path, and point both controllers at it. The phase ends with `mvn -q test-compile` green and the new test classes passing. Every `UserDTO` construction site is updated within this phase, so nothing is left half-renamed.

### Task 3: Map the three columns on `User` ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/User.java:46-50`

- [x] **Step 1: Add the fields after `defaultServings`**

Add `import java.time.LocalTime;` and, directly after the `defaultServings` field:

```java
    /**
     * MPP-13: the time by which the user usually eats each meal. NULL means
     * "use the default" (MealTimesPolicy) — no field initialiser, for the same
     * reason as defaultServings: a default here would silently write the default
     * into every new user's row, and Reset could no longer mean "clear".
     * The three are always written together by UserService.updatePreferences.
     */
    @Column(name = "breakfast_by")
    private LocalTime breakfastBy;

    @Column(name = "lunch_by")
    private LocalTime lunchBy;

    @Column(name = "dinner_by")
    private LocalTime dinnerBy;
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, no errors (no output with `-q`).

### Task 4: Add `MealTimesDTO` and `MealTimesPolicy` ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealTimesDTO.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealTimesPolicy.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealTimesPolicyTest.java`

- [x] **Step 1: Write the response DTO**

```java
package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MPP-13: the user's EFFECTIVE meal times — defaults already applied — as
 * "HH:mm". custom is true once the user has saved their own times; it drives the
 * "Reset to defaults" button and the subdued default styling. Built only by
 * MealTimesPolicy.effective, so the frontend never needs its own copy of the
 * defaults.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealTimesDTO {
    private String breakfastBy;
    private String lunchBy;
    private String dinnerBy;
    private boolean custom;
}
```

- [x] **Step 2: Write the failing policy test**

```java
package com.foodbytes.service;

import com.foodbytes.dto.MealTimesDTO;
import com.foodbytes.model.User;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * MPP-13: defaults and the strict-order rule. The frontend mirrors the order rule
 * in client/src/utils/mealTimesUtils.js (AC 7: "same rules as the frontend").
 */
class MealTimesPolicyTest {

    @Test
    void effective_neverSet_returnsDefaults_notCustom() {
        MealTimesDTO dto = MealTimesPolicy.effective(new User());

        assertThat(dto.getBreakfastBy()).isEqualTo("11:00");
        assertThat(dto.getLunchBy()).isEqualTo("15:00");
        assertThat(dto.getDinnerBy()).isEqualTo("21:00");
        assertThat(dto.isCustom()).isFalse();
    }

    @Test
    void effective_saved_returnsSavedTimes_asHHmm_custom() {
        User user = new User();
        user.setBreakfastBy(LocalTime.of(8, 30));
        user.setLunchBy(LocalTime.of(13, 0));
        user.setDinnerBy(LocalTime.of(19, 5));

        MealTimesDTO dto = MealTimesPolicy.effective(user);

        assertThat(dto.getBreakfastBy()).isEqualTo("08:30");
        assertThat(dto.getLunchBy()).isEqualTo("13:00");
        assertThat(dto.getDinnerBy()).isEqualTo("19:05");
        assertThat(dto.isCustom()).isTrue();
    }

    @Test
    void isStrictlyOrdered_rejectsEqualAndReversed() {
        LocalTime nine = LocalTime.of(9, 0), noon = LocalTime.of(12, 0), six = LocalTime.of(18, 0);

        assertThat(MealTimesPolicy.isStrictlyOrdered(nine, noon, six)).isTrue();
        assertThat(MealTimesPolicy.isStrictlyOrdered(nine, nine, six)).isFalse();
        assertThat(MealTimesPolicy.isStrictlyOrdered(noon, nine, six)).isFalse();
        assertThat(MealTimesPolicy.isStrictlyOrdered(nine, six, noon)).isFalse();
    }
}
```

- [x] **Step 3: Run it and watch it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealTimesPolicyTest`
Expected: compilation failure — `cannot find symbol: class MealTimesPolicy`.

- [x] **Step 4: Write the policy**

```java
package com.foodbytes.service;

import com.foodbytes.dto.MealTimesDTO;
import com.foodbytes.model.User;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/**
 * MPP-13: the single backend owner of the meal-time defaults, format and order
 * rule. The defaults live ONLY here — every user payload carries effective times
 * built by effective(), so the frontend has no copy to drift from. The format and
 * order rule are mirrored in client/src/utils/mealTimesUtils.js; keep them in sync.
 *
 * The String constants are compile-time constants so MealTimesRequest can use them
 * inside @Pattern / @AssertTrue annotations.
 */
public final class MealTimesPolicy {

    public static final LocalTime DEFAULT_BREAKFAST_BY = LocalTime.of(11, 0);
    public static final LocalTime DEFAULT_LUNCH_BY = LocalTime.of(15, 0);
    public static final LocalTime DEFAULT_DINNER_BY = LocalTime.of(21, 0);

    /** 24-hour, zero-padded HH:mm — exactly what an HTML time input produces. */
    public static final String HH_MM_REGEX = "^([01]\\d|2[0-3]):[0-5]\\d$";
    public static final String FORMAT_ERROR = "Meal times must be HH:mm";
    /** Same words as the frontend's MEAL_TIMES_ORDER_ERROR (MPP-13 AC 4). */
    public static final String ORDER_ERROR = "Times must run breakfast \u2192 lunch \u2192 dinner.";

    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private MealTimesPolicy() {
    }

    /** Strict: equal times are rejected, and there is no wrap past midnight. */
    public static boolean isStrictlyOrdered(LocalTime breakfastBy, LocalTime lunchBy, LocalTime dinnerBy) {
        return breakfastBy.isBefore(lunchBy) && lunchBy.isBefore(dinnerBy);
    }

    public static LocalTime parse(String hhmm) {
        return LocalTime.parse(hhmm, HH_MM);
    }

    public static MealTimesDTO effective(User user) {
        boolean custom = user.getBreakfastBy() != null
                || user.getLunchBy() != null
                || user.getDinnerBy() != null;
        return new MealTimesDTO(
                format(user.getBreakfastBy(), DEFAULT_BREAKFAST_BY),
                format(user.getLunchBy(), DEFAULT_LUNCH_BY),
                format(user.getDinnerBy(), DEFAULT_DINNER_BY),
                custom);
    }

    private static String format(LocalTime saved, LocalTime fallback) {
        return (saved != null ? saved : fallback).format(HH_MM);
    }
}
```

- [x] **Step 5: Run it and watch it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealTimesPolicyTest`
Expected: `Tests run: 3, Failures: 0, Errors: 0` and `BUILD SUCCESS`.

### Task 5: Add `mealTimes` to `UserDTO` and fix every construction site ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/UserDTO.java:17`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/UserService.java:39-48`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/AuthController.java:34-41`
- Modify: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/AuthControllerLoginTest.java:54`

- [x] **Step 1: Add the field to `UserDTO`**

After `private BigDecimal defaultServings;   // MPP-3: null means never set` add:

```java
    private MealTimesDTO mealTimes;       // MPP-13: effective times (defaults applied) + custom flag
```

- [x] **Step 2: Populate it in `UserService.convertToDTO`**

Replace the `convertToDTO` body's constructor call so it ends:

```java
                user.getIsAdmin(),
                user.getDefaultServings(),
                MealTimesPolicy.effective(user)
        );
```

- [x] **Step 3: Keep `AuthController.getCurrentUser` compiling (replaced properly in Task 9)**

Append `null` as the 7th argument to the hand-built `new UserDTO(...)` at lines 34-41. Task 9 deletes this whole construction, so the null never ships.

- [x] **Step 4: Fix the test fixture**

In `AuthControllerLoginTest`, change line 54 to:

```java
                .thenReturn(new UserDTO(42L, "friend@example.com", "Friend", null, false, null, null));
```

- [x] **Step 5: Compile main and tests**

Run: `cd foodbytes-app\foodbytes-api; mvn -q test-compile`
Expected: `BUILD SUCCESS`, no errors.

### Task 6: Add `MealTimesRequest` and presence-tracking to `UserPreferencesUpdateRequest` ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealTimesRequest.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/UserPreferencesUpdateRequest.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/dto/UserPreferencesUpdateRequestTest.java`

- [x] **Step 1: Write the failing request test**

```java
package com.foodbytes.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * MPP-13: PATCH semantics and validation for /api/users/me/preferences.
 * A field absent from the body must stay untouched — otherwise saving meal
 * times would silently clear a saved Default portions value, and vice versa.
 */
class UserPreferencesUpdateRequestTest {

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private UserPreferencesUpdateRequest read(String json) throws Exception {
        return objectMapper.readValue(json, UserPreferencesUpdateRequest.class);
    }

    private Set<String> messages(UserPreferencesUpdateRequest request) {
        return validator.validate(request).stream()
                .map(ConstraintViolation::getMessage)
                .collect(java.util.stream.Collectors.toSet());
    }

    @Test
    void mealTimesOnly_leavesDefaultServingsAbsent() throws Exception {
        UserPreferencesUpdateRequest r = read(
                "{\"mealTimes\":{\"breakfastBy\":\"09:30\",\"lunchBy\":\"13:00\",\"dinnerBy\":\"19:30\"}}");

        assertThat(r.isMealTimesPresent()).isTrue();
        assertThat(r.isDefaultServingsPresent()).isFalse();
        assertThat(messages(r)).isEmpty();
    }

    @Test
    void defaultServingsOnly_leavesMealTimesAbsent() throws Exception {
        UserPreferencesUpdateRequest r = read("{\"defaultServings\":1.5}");

        assertThat(r.isDefaultServingsPresent()).isTrue();
        assertThat(r.isMealTimesPresent()).isFalse();
    }

    @Test
    void explicitNullMealTimes_isPresentAndValid_meaningReset() throws Exception {
        UserPreferencesUpdateRequest r = read("{\"mealTimes\":null}");

        assertThat(r.isMealTimesPresent()).isTrue();
        assertThat(r.getMealTimes()).isNull();
        assertThat(messages(r)).isEmpty();
    }

    @Test
    void badFormat_isRejected_withFormatMessage() throws Exception {
        UserPreferencesUpdateRequest r = read(
                "{\"mealTimes\":{\"breakfastBy\":\"9:30\",\"lunchBy\":\"13:00\",\"dinnerBy\":\"19:30\"}}");

        assertThat(messages(r)).containsExactly("Meal times must be HH:mm");
    }

    @Test
    void missingTime_isRejected_withFormatMessage() throws Exception {
        UserPreferencesUpdateRequest r = read(
                "{\"mealTimes\":{\"breakfastBy\":\"09:30\",\"dinnerBy\":\"19:30\"}}");

        assertThat(messages(r)).containsExactly("Meal times must be HH:mm");
    }

    @Test
    void outOfOrder_isRejected_withOrderMessage() throws Exception {
        UserPreferencesUpdateRequest r = read(
                "{\"mealTimes\":{\"breakfastBy\":\"13:00\",\"lunchBy\":\"12:00\",\"dinnerBy\":\"19:30\"}}");

        assertThat(messages(r)).containsExactly("Times must run breakfast \u2192 lunch \u2192 dinner.");
    }

    @Test
    void equalTimes_areRejected_strictOrder() throws Exception {
        UserPreferencesUpdateRequest r = read(
                "{\"mealTimes\":{\"breakfastBy\":\"12:00\",\"lunchBy\":\"12:00\",\"dinnerBy\":\"19:30\"}}");

        assertThat(messages(r)).containsExactly("Times must run breakfast \u2192 lunch \u2192 dinner.");
    }
}
```

- [x] **Step 2: Run it and watch it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=UserPreferencesUpdateRequestTest`
Expected: compilation failure — `cannot find symbol` for `isMealTimesPresent` / `getMealTimes`.

- [x] **Step 3: Write `MealTimesRequest`**

```java
package com.foodbytes.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.foodbytes.service.MealTimesPolicy;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MPP-13: a full set of meal times. All three are required — the order rule is
 * judged across the whole set, and the three columns are always written together.
 * Rules mirror client/src/utils/mealTimesUtils.js (AC 7).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealTimesRequest {

    @NotNull(message = MealTimesPolicy.FORMAT_ERROR)
    @Pattern(regexp = MealTimesPolicy.HH_MM_REGEX, message = MealTimesPolicy.FORMAT_ERROR)
    private String breakfastBy;

    @NotNull(message = MealTimesPolicy.FORMAT_ERROR)
    @Pattern(regexp = MealTimesPolicy.HH_MM_REGEX, message = MealTimesPolicy.FORMAT_ERROR)
    private String lunchBy;

    @NotNull(message = MealTimesPolicy.FORMAT_ERROR)
    @Pattern(regexp = MealTimesPolicy.HH_MM_REGEX, message = MealTimesPolicy.FORMAT_ERROR)
    private String dinnerBy;

    /**
     * Passes when any time is missing or malformed — the field constraints above
     * report those, so a bad format never also shows the order message.
     */
    @JsonIgnore
    @AssertTrue(message = MealTimesPolicy.ORDER_ERROR)
    public boolean isStrictlyOrdered() {
        if (!isHhMm(breakfastBy) || !isHhMm(lunchBy) || !isHhMm(dinnerBy)) {
            return true;
        }
        return MealTimesPolicy.isStrictlyOrdered(
                MealTimesPolicy.parse(breakfastBy),
                MealTimesPolicy.parse(lunchBy),
                MealTimesPolicy.parse(dinnerBy));
    }

    private static boolean isHhMm(String value) {
        return value != null && value.matches(MealTimesPolicy.HH_MM_REGEX);
    }
}
```

- [x] **Step 4: Rewrite `UserPreferencesUpdateRequest` with presence tracking**

Replace the class body (keep the existing `defaultServings` Javadoc and constraints verbatim) so the file becomes:

```java
package com.foodbytes.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * MPP-3 / MPP-13: partial update of the authenticated user's preferences.
 *
 * True PATCH semantics: a field ABSENT from the JSON body is left untouched; an
 * explicit null clears it. Jackson only calls a setter for a key that is present,
 * so the hand-written setters below record presence. Without this, the meal-times
 * control saving {mealTimes} would clear a saved defaultServings, and the portions
 * control would reset meal times.
 */
@Data
@NoArgsConstructor
public class UserPreferencesUpdateRequest {

    /**
     * Nullable. An explicit null CLEARS the preference, restoring the
     * recipe-default behaviour (AC 9). All three constraints pass on null, so
     * that contract survives validation — the same trick MealPlanCreateRequest
     * uses to keep "omitted means recipe default" working.
     */
    @DecimalMin(value = "0.25", message = "Default portions must be at least 0.25")
    @DecimalMax(value = "20.00", message = "Default portions must be at most 20")
    @Digits(integer = 2, fraction = 2, message = "Default portions allows at most 2 decimal places")
    private BigDecimal defaultServings;

    /** MPP-13: all three times, or an explicit null to reset to the defaults. */
    @Valid
    private MealTimesRequest mealTimes;

    @JsonIgnore
    private boolean defaultServingsPresent;

    @JsonIgnore
    private boolean mealTimesPresent;

    public void setDefaultServings(BigDecimal defaultServings) {
        this.defaultServings = defaultServings;
        this.defaultServingsPresent = true;
    }

    public void setMealTimes(MealTimesRequest mealTimes) {
        this.mealTimes = mealTimes;
        this.mealTimesPresent = true;
    }
}
```

(`@AllArgsConstructor` is removed: grep at planning found no callers, and it would expose the presence flags positionally.)

- [x] **Step 5: Run it and watch it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=UserPreferencesUpdateRequestTest`
Expected: `Tests run: 7, Failures: 0, Errors: 0` and `BUILD SUCCESS`.

### Task 7: `UserService.updatePreferences` and `getUserDTO` ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/UserService.java:50-61`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/UserServiceTest.java`

- [x] **Step 1: Port the MPP-3 tests and add the meal-time tests (failing)**

In `UserServiceTest`, add imports `com.foodbytes.dto.MealTimesRequest`, `com.foodbytes.dto.UserPreferencesUpdateRequest`, `java.time.LocalTime`. Add two request helpers:

```java
    private static UserPreferencesUpdateRequest servings(BigDecimal value) {
        UserPreferencesUpdateRequest r = new UserPreferencesUpdateRequest();
        r.setDefaultServings(value);
        return r;
    }

    private static UserPreferencesUpdateRequest times(MealTimesRequest value) {
        UserPreferencesUpdateRequest r = new UserPreferencesUpdateRequest();
        r.setMealTimes(value);
        return r;
    }
```

Change the three existing tests' calls (keep their names' intent; rename `updateDefaultServings_` → `updatePreferences_` in the method names):
- `userService.updateDefaultServings(USER_ID, new BigDecimal("1.00"))` → `userService.updatePreferences(USER_ID, servings(new BigDecimal("1.00")))`
- `userService.updateDefaultServings(USER_ID, null)` → `userService.updatePreferences(USER_ID, servings(null))`
- `userService.updateDefaultServings(USER_ID, BigDecimal.ONE)` → `userService.updatePreferences(USER_ID, servings(BigDecimal.ONE))`

Update the class Javadoc to `MPP-3 / MPP-13: UserService.updatePreferences and getUserDTO.` Then add:

```java
    @Test
    void updatePreferences_mealTimes_storesAllThree_andLeavesServingsUntouched() {
        user.setDefaultServings(new BigDecimal("3.00"));
        stubSave();

        UserDTO dto = userService.updatePreferences(USER_ID,
                times(new MealTimesRequest("08:30", "13:00", "19:30")));

        assertThat(user.getBreakfastBy()).isEqualTo(LocalTime.of(8, 30));
        assertThat(user.getLunchBy()).isEqualTo(LocalTime.of(13, 0));
        assertThat(user.getDinnerBy()).isEqualTo(LocalTime.of(19, 30));
        assertThat(user.getDefaultServings()).isEqualByComparingTo("3.00");
        assertThat(dto.getMealTimes().getLunchBy()).isEqualTo("13:00");
        assertThat(dto.getMealTimes().isCustom()).isTrue();
    }

    /** AC 5: reset clears to NULL — it must not write the default values into the row. */
    @Test
    void updatePreferences_nullMealTimes_clearsAllThree_andReturnsDefaults() {
        user.setBreakfastBy(LocalTime.of(8, 30));
        user.setLunchBy(LocalTime.of(13, 0));
        user.setDinnerBy(LocalTime.of(19, 30));
        stubSave();

        UserDTO dto = userService.updatePreferences(USER_ID, times(null));

        assertThat(user.getBreakfastBy()).isNull();
        assertThat(user.getLunchBy()).isNull();
        assertThat(user.getDinnerBy()).isNull();
        assertThat(dto.getMealTimes().getBreakfastBy()).isEqualTo("11:00");
        assertThat(dto.getMealTimes().isCustom()).isFalse();
    }

    @Test
    void updatePreferences_servingsOnly_leavesMealTimesUntouched() {
        user.setLunchBy(LocalTime.of(13, 0));
        stubSave();

        userService.updatePreferences(USER_ID, servings(new BigDecimal("2.00")));

        assertThat(user.getLunchBy()).isEqualTo(LocalTime.of(13, 0));
    }

    @Test
    void getUserDTO_returnsEffectiveMealTimes() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

        UserDTO dto = userService.getUserDTO(USER_ID);

        assertThat(dto.getId()).isEqualTo(USER_ID);
        assertThat(dto.getMealTimes().getDinnerBy()).isEqualTo("21:00");
    }
```

- [x] **Step 2: Run it and watch it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=UserServiceTest`
Expected: compilation failure — `cannot find symbol: method updatePreferences` / `getUserDTO`.

- [x] **Step 3: Replace `updateDefaultServings` with `updatePreferences`, add `getUserDTO`**

Add imports `com.foodbytes.dto.MealTimesRequest`, `com.foodbytes.dto.UserPreferencesUpdateRequest`. Delete the `updateDefaultServings` method (and the now-unused `java.math.BigDecimal` import if nothing else uses it) and add:

```java
    @Transactional(readOnly = true)
    public UserDTO getUserDTO(Long userId) {
        return convertToDTO(findUser(userId));
    }

    /**
     * MPP-3 / MPP-13: apply a partial preferences update. Only fields present in
     * the request body are touched (see UserPreferencesUpdateRequest); an explicit
     * null clears. Meal times are written as a set — all three, or all NULL — so a
     * row never mixes saved and default times. Validation (range, HH:mm, strict
     * order) happens on the request DTOs before this runs.
     */
    @Transactional
    public UserDTO updatePreferences(Long userId, UserPreferencesUpdateRequest request) {
        User user = findUser(userId);
        if (request.isDefaultServingsPresent()) {
            user.setDefaultServings(request.getDefaultServings());
        }
        if (request.isMealTimesPresent()) {
            MealTimesRequest times = request.getMealTimes();
            user.setBreakfastBy(times == null ? null : MealTimesPolicy.parse(times.getBreakfastBy()));
            user.setLunchBy(times == null ? null : MealTimesPolicy.parse(times.getLunchBy()));
            user.setDinnerBy(times == null ? null : MealTimesPolicy.parse(times.getDinnerBy()));
        }
        return convertToDTO(userRepository.save(user));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }
```

- [x] **Step 4: Repoint the one existing caller so main sources compile**

`UserController.updatePreferences` still calls the deleted method. Change that single line to `UserDTO updated = userService.updatePreferences(userPrincipal.getId(), request);`. Task 8 updates the Javadoc and adds the controller test.

- [x] **Step 5: Run it and watch it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=UserServiceTest`
Expected: `Tests run: 7, Failures: 0, Errors: 0` and `BUILD SUCCESS`.

### Task 8: Point `UserController` at `updatePreferences` and pin the 400 shape ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/UserController.java:22-37`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/UserControllerPreferencesTest.java`

- [x] **Step 1: Update the Javadoc (the call was repointed in Task 7 Step 4)**

The method should read:

```java
    /**
     * MPP-3 / MPP-13: partially update the authenticated user's preferences —
     * default portion count and/or meal times. Fields absent from the body are
     * untouched; an explicit null clears (meal times: back to the defaults).
     */
    @PatchMapping("/me/preferences")
    public ResponseEntity<?> updatePreferences(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UserPreferencesUpdateRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        UserDTO updated = userService.updatePreferences(userPrincipal.getId(), request);
        return ResponseEntity.ok(updated);
    }
```

The existing `@ExceptionHandler(MethodArgumentNotValidException.class)` is unchanged. Nested `mealTimes.*` and `mealTimes.strictlyOrdered` violations arrive as `FieldError`s, so it already returns `{error: <message>}`.

- [x] **Step 2: Write the controller test**

Validation runs before the method body, so the 400s are observable without an authenticated principal (`addFilters = false`, as in `AuthControllerLoginTest`).

```java
package com.foodbytes.controller;

import com.foodbytes.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MPP-13 AC 7: invalid meal times are rejected with a 400 whose body carries the
 * same message the frontend shows, and nothing reaches the service.
 */
@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerPreferencesTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private UserService userService;

    @Test
    void outOfOrderTimes_return400_withOrderMessage() throws Exception {
        mockMvc.perform(patch("/api/users/me/preferences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mealTimes\":{\"breakfastBy\":\"13:00\",\"lunchBy\":\"12:00\",\"dinnerBy\":\"19:30\"}}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Times must run breakfast \u2192 lunch \u2192 dinner."));
        verifyNoInteractions(userService);
    }

    @Test
    void badlyFormattedTime_returns400_withFormatMessage() throws Exception {
        mockMvc.perform(patch("/api/users/me/preferences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mealTimes\":{\"breakfastBy\":\"25:00\",\"lunchBy\":\"13:00\",\"dinnerBy\":\"19:30\"}}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Meal times must be HH:mm"));
        verifyNoInteractions(userService);
    }

    @Test
    void validTimes_withoutPrincipal_return401() throws Exception {
        mockMvc.perform(patch("/api/users/me/preferences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mealTimes\":{\"breakfastBy\":\"09:00\",\"lunchBy\":\"13:00\",\"dinnerBy\":\"19:30\"}}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(userService);
    }
}
```

- [x] **Step 3: Run it**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=UserControllerPreferencesTest`
Expected: `Tests run: 3, Failures: 0, Errors: 0`. If the context fails to load naming a missing bean (e.g. a security component `SecurityConfig` wires), add an `@MockBean` for exactly that type, the same way `AuthControllerLoginTest` mocks `JwtCookieService`, and re-run.

### Task 9: `/api/auth/me` reads through `UserService.getUserDTO` ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/AuthController.java:28-43`

- [x] **Step 1: Replace the hand-built DTO**

```java
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        // MPP-13: one DTO builder for every user payload, so /me carries the
        // effective meal times exactly as /login and the preferences PATCH do.
        return ResponseEntity.ok(userService.getUserDTO(userPrincipal.getId()));
    }
```

Remove the `UserDTO` import if it is now unused in `AuthController`.

- [x] **Step 2: Confirm no hand-built `UserDTO` remains in main code**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\controller\*.java -Pattern "new UserDTO\("`
Expected: zero hits.

- [x] **Step 3: Run the affected test classes**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest="UserServiceTest,UserPreferencesUpdateRequestTest,MealTimesPolicyTest,UserControllerPreferencesTest,AuthControllerLoginTest"`
Expected: `Failures: 0, Errors: 0` across all five classes, `BUILD SUCCESS`.

---

## Phase 3 — Frontend: constants, helper, context, control

Add the shared keys and order rule, generalise the preferences call, expose meal times through `AuthContext`, and mount the control. Every task except 12 ends with `npm run build` green. Tasks 12 and 13 change the service signature and its only caller as a pair, and Task 13's build covers both. The section only renders when the server sends `mealTimes`, so a frontend deployed ahead of the backend degrades to "no section" instead of crashing.

### Task 10: Meal-time constants ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/mealTimes.js`

- [x] **Step 1: Write the constants**

```js
/**
 * MPP-13: account-menu meal times. Keys match UserDTO.mealTimes on the backend.
 *
 * The DEFAULT times deliberately do not live here: the server always sends the
 * effective times (defaults applied) plus a `custom` flag, so there is no frontend
 * copy to drift. The order rule and its message mirror the backend's
 * MealTimesPolicy — keep MEAL_TIMES_ORDER_ERROR word-for-word identical.
 */
export const MEAL_TIME_KEYS = ['breakfastBy', 'lunchBy', 'dinnerBy']

export const MEAL_TIME_LABELS = {
  breakfastBy: 'Breakfast by',
  lunchBy: 'Lunch by',
  dinnerBy: 'Dinner by'
}

export const MEAL_TIMES_ORDER_ERROR = 'Times must run breakfast → lunch → dinner.'
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 11: Order helper + node smoke check ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/mealTimesUtils.js`
- Create: `foodbytes-app/client/src/utils/mealTimesUtils.check.mjs`

- [x] **Step 1: Write the helper**

```js
import { MEAL_TIME_KEYS } from '../constants/mealTimes.js'

// Mirrors MealTimesPolicy.HH_MM_REGEX on the backend: 24-hour, zero-padded HH:mm,
// exactly what <input type="time"> produces.
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/

/**
 * MPP-13 AC 4/7: strict breakfast < lunch < dinner, no wrap past midnight — the
 * same rule MealTimesRequest enforces as a 400. Zero-padded HH:mm compares
 * correctly as plain strings.
 */
export function isStrictlyOrdered(times) {
  if (!times || !MEAL_TIME_KEYS.every((key) => HH_MM.test(times[key] ?? ''))) return false
  return times.breakfastBy < times.lunchBy && times.lunchBy < times.dinnerBy
}

/** The three times only (drops `custom`); empty strings when there are none. */
export function pickMealTimes(mealTimes) {
  return Object.fromEntries(MEAL_TIME_KEYS.map((key) => [key, mealTimes?.[key] ?? '']))
}
```

- [x] **Step 2: Write the smoke check**

```js
// Run: node src/utils/mealTimesUtils.check.mjs   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-13 order
// rule is pinned here. Mirrors servingsUtils.check.mjs.
import assert from 'node:assert/strict'
import { isStrictlyOrdered, pickMealTimes } from './mealTimesUtils.js'

const t = (breakfastBy, lunchBy, dinnerBy) => ({ breakfastBy, lunchBy, dinnerBy })

// The defaults are in order.
assert.equal(isStrictlyOrdered(t('11:00', '15:00', '21:00')), true)
// Strict: equal times fail.
assert.equal(isStrictlyOrdered(t('12:00', '12:00', '19:00')), false)
// Out of order fails, including no wrap past midnight.
assert.equal(isStrictlyOrdered(t('13:00', '12:00', '19:00')), false)
assert.equal(isStrictlyOrdered(t('09:00', '13:00', '00:30')), false)
// Zero-padding matters: '9:30' is not HH:mm (the backend 400s it too).
assert.equal(isStrictlyOrdered(t('9:30', '13:00', '19:00')), false)
// Missing values fail.
assert.equal(isStrictlyOrdered(t('09:00', '', '19:00')), false)
assert.equal(isStrictlyOrdered(null), false)

// pickMealTimes drops `custom` and tolerates a missing object.
assert.deepEqual(pickMealTimes({ ...t('08:00', '12:00', '18:00'), custom: true }), t('08:00', '12:00', '18:00'))
assert.deepEqual(pickMealTimes(undefined), t('', '', ''))

console.log('mealTimesUtils: all checks passed')
```

- [x] **Step 3: Run the smoke check**

Run: `cd foodbytes-app\client; node src/utils/mealTimesUtils.check.mjs`
Expected: `mealTimesUtils: all checks passed`.

### Task 12: Generalise `userService.updatePreferences` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/services/userService.js:3-16`

- [x] **Step 1: Take a partial patch object**

```js
/**
 * MPP-3 / MPP-13: the authenticated user's preferences.
 */
export const userService = {
  /**
   * Partially update preferences. Only the keys present are changed; an explicit
   * null clears that preference.
   *   { defaultServings: 1.5 | null }
   *   { mealTimes: { breakfastBy, lunchBy, dinnerBy } | null }   // null = defaults
   * @param {Object} patch
   * @returns {Promise<Object>} the updated UserDTO
   */
  async updatePreferences(patch) {
    const response = await api.patch('/users/me/preferences', patch)
    return response.data
  }
}
```

(Build is verified at the end of Task 13, since `AuthContext` still passes the old positional argument until then.)

### Task 13: Expose `mealTimes` and `saveMealTimes` from `AuthContext` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/contexts/AuthContext.jsx:53-76`

- [x] **Step 1: Pass an object from `saveDefaultServings` and add `saveMealTimes`**

Replace the `saveDefaultServings` body's service call with `userService.updatePreferences({ defaultServings })`, then add directly below it:

```js
  /**
   * MPP-13: save all three meal times, or pass null to reset to the defaults.
   * Throws on failure so MealTimesControl can show the server's message and
   * revert — deliberately NOT caught into a success shape here.
   */
  const saveMealTimes = async (mealTimes) => {
    const updated = await userService.updatePreferences({ mealTimes })
    setUser(updated)
    return updated
  }
```

- [x] **Step 2: Add both to the context value**

In `value`, after `defaultServings: user?.defaultServings ?? null,` add `mealTimes: user?.mealTimes ?? null,`; after `saveDefaultServings,` add `saveMealTimes,`.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 14: `MealTimesControl` component + CSS ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/layout/MealTimesControl.jsx`
- Create: `foodbytes-app/client/src/components/layout/MealTimesControl.css`

- [x] **Step 1: Write the component**

```jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { MEAL_TIME_KEYS, MEAL_TIME_LABELS, MEAL_TIMES_ORDER_ERROR } from '../../constants/mealTimes'
import { isStrictlyOrdered, pickMealTimes } from '../../utils/mealTimesUtils'
import './MealTimesControl.css'

const SAVE_FALLBACK_ERROR = 'Could not save. Try again.'

/**
 * MPP-13: "Meal times" in the account menu, under Default portions.
 *
 * The server sends the EFFECTIVE times (defaults applied) and `custom`, so this
 * component holds no defaults of its own. A changed time is saved on blur, all
 * three together; an out-of-order set is flagged inline and never sent (AC 4).
 * Visual contract: the approved mpp13-meal-times-mockup.html.
 *
 * Rendered only for authenticated users (Header mounts it inside the signed-in
 * branch). Renders nothing if the server sent no mealTimes — a frontend deployed
 * ahead of its backend degrades to "no section", not a crash.
 */
function MealTimesControl() {
  const { mealTimes, saveMealTimes } = useAuth()
  const [draft, setDraft] = useState(() => pickMealTimes(mealTimes))
  const [invalidKey, setInvalidKey] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Re-seed from the saved values only when they actually change. Keyed on the
  // values, not the object: saving Default portions replaces `user`, and an
  // identity-keyed effect would wipe a half-fixed out-of-order edit here.
  const savedKey = MEAL_TIME_KEYS.map((key) => mealTimes?.[key]).join('|')
  useEffect(() => {
    setDraft(pickMealTimes(mealTimes))
  }, [savedKey])

  if (!mealTimes) return null

  const saved = pickMealTimes(mealTimes)
  const clearFeedback = () => {
    setInvalidKey(null)
    setError(null)
  }

  const persist = async (next) => {
    setSaving(true)
    clearFeedback()
    try {
      await saveMealTimes(next)
    } catch (err) {
      // Surface the server's message; never let a failed save look saved.
      setError(err?.response?.data?.error || SAVE_FALLBACK_ERROR)
      setDraft(saved)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key) => (e) => {
    setDraft((current) => ({ ...current, [key]: e.target.value }))
  }

  const handleBlur = (key) => () => {
    if (!draft[key]) {
      setDraft(saved)
      clearFeedback()
      return
    }
    if (MEAL_TIME_KEYS.every((k) => draft[k] === saved[k])) {
      clearFeedback()
      return
    }
    if (!isStrictlyOrdered(draft)) {
      setInvalidKey(key)
      setError(MEAL_TIMES_ORDER_ERROR)
      return
    }
    persist(draft)
  }

  const inputClass = (key) => {
    let className = 'meal-times-input'
    if (!mealTimes.custom && draft[key] === saved[key]) className += ' meal-times-input--default'
    if (invalidKey === key) className += ' meal-times-input--invalid'
    return className
  }

  return (
    <div className="meal-times" role="group" aria-labelledby="meal-times-heading">
      <span className="meal-times-label" id="meal-times-heading">Meal times</span>

      {MEAL_TIME_KEYS.map((key) => (
        <div className="meal-times-row" key={key}>
          <label className="meal-times-row-label" htmlFor={`meal-times-${key}`}>
            {MEAL_TIME_LABELS[key]}
          </label>
          <input
            id={`meal-times-${key}`}
            className={inputClass(key)}
            type="time"
            value={draft[key]}
            onChange={handleChange(key)}
            onBlur={handleBlur(key)}
            disabled={saving}
            aria-invalid={invalidKey === key || undefined}
            aria-describedby={error ? 'meal-times-error' : undefined}
          />
        </div>
      ))}

      {error && (
        <span className="meal-times-error" id="meal-times-error" role="alert">
          {error}
        </span>
      )}

      <button
        type="button"
        className="meal-times-reset"
        onClick={() => persist(null)}
        disabled={saving || !mealTimes.custom}
      >
        Reset to defaults
      </button>
    </div>
  )
}

export default MealTimesControl
```

- [x] **Step 2: Write the CSS (verbatim from the approved mockup)**

```css
/* MPP-13: Meal times section of the account menu. Mirrors DefaultPortionsControl.css. */
.meal-times {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.meal-times-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #555;
}

.meal-times-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.meal-times-row-label {
  font-size: 0.875rem;
  white-space: nowrap;
}

.meal-times-input {
  /* Same trick as .default-portions-input: width 0 keeps the input out of
     .user-dropdown's shrink-to-fit max-content width, so the time inputs never
     widen the panel past its 220px min-width (the mockup's fixed 120px would
     have pushed it to ~245px). flex-grow fills the panel, capped at 8rem. */
  flex: 1 1 0;
  width: 0;
  min-width: 0;
  max-width: 8rem;
  min-height: 44px;
  padding: 0 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: var(--text-primary);
  touch-action: manipulation;
}

.meal-times-input:disabled {
  opacity: 0.6;
}

/* Not yet chosen: the times shown are the server's defaults. Subdued like
   MPP-3's .default-portions-input--unset. */
.meal-times-input--default {
  color: #999;
  font-style: italic;
}

.meal-times-input--invalid {
  border-color: var(--error);
  background: #fff5f5;
}

.meal-times-error {
  font-size: 0.75rem;
  color: #c0392b;
}

.meal-times-reset {
  align-self: flex-start;
  min-height: 44px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--brand-primary);
  font-size: 0.8rem;
  font-weight: 600;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.meal-times-reset:disabled {
  color: var(--text-secondary);
  opacity: 0.5;
  cursor: not-allowed;
}

@media (hover: hover) {
  .meal-times-reset:not(:disabled):hover {
    text-decoration: underline;
  }
}

.meal-times-reset:not(:disabled):active {
  opacity: 0.7;
}

.meal-times-input:focus-visible,
.meal-times-reset:focus-visible {
  outline: 2px solid #4a7c59;
  outline-offset: 2px;
}
```

- [x] **Step 3: Measure the component**

Run: `(Get-Content foodbytes-app\client\src\components\layout\MealTimesControl.jsx | Measure-Object -Line).Lines`
Expected: under 200.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 15: Mount the control in the account menu ✓ (Step 3 manual browser check pending — developer, Ready for Test)

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/layout/Header.jsx:6,66`

- [x] **Step 1: Import and mount after Default portions**

After `import DefaultPortionsControl from './DefaultPortionsControl'` add `import MealTimesControl from './MealTimesControl'`. Directly after `<DefaultPortionsControl />` (inside the signed-in `user-dropdown`) add `<MealTimesControl />`.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [ ] **Step 3: Manual check against the mockup (needs backend on the migrated local DB + `npm run dev`)**

Open `http://localhost:5173` at 375px width (DevTools device toolbar), sign in, and open the account menu. Expected:
1. "Meal times" sits between Default portions and Sign Out. A never-set account shows 11:00 / 15:00 / 21:00 in grey italic, and Reset is disabled.
2. Changing Lunch to 13:00 and blurring sends one PATCH (Network tab: body `{"mealTimes":{…}}` only, no `defaultServings`). The times turn black and Reset enables. Reload: the times persist.
3. Setting Lunch to 07:45 and blurring highlights Lunch, shows "Times must run breakfast → lunch → dinner.", and sends no request.
4. Reset sends `{"mealTimes":null}`, and the inputs return to grey 11:00 / 15:00 / 21:00.
5. Changing Default portions afterwards leaves the meal times unchanged (and vice versa).
6. The menu's width is the same as before this change (compare with `git stash` or the mockup's width readout: no wider than the pre-change panel).
7. As a guest (Continue as guest), the section is absent.

---

## Phase 4 — Final verification

The closing phase. No production changes beyond the version bump — only sanity-checks that the cumulative work is clean.

### Task 16 (M.1): Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-13 is a **Story** → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-13: Meal times (breakfast/lunch/dinner "by" times) in the account menu`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 17 (M.2): Grep for stale references ✓

- Skill: none — verification only

**Files:**
- (none — read-only checks)

- [x] **Step 1: No caller of the removed service method remains**

Run: `Get-ChildItem -Path foodbytes-app\foodbytes-api\src -Recurse -Include *.java | Select-String -Pattern "updateDefaultServings"`
Expected: zero hits.

- [x] **Step 2: No positional `updatePreferences(` call remains on the frontend**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "updatePreferences\((?!\{|patch\))"`
Expected: zero hits. (The only calls pass an object literal; the definition takes `patch`.)

- [x] **Step 3: No new console logging**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)" | Measure-Object | Select-Object -ExpandProperty Count`
Expected: not above the pre-change count (6 at planning, per the react-frontend skill baseline). `mealTimesUtils.check.mjs` is `.mjs` and excluded from this glob.

### Task 18 (M.3): Run the full backend test suite ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors. Test count rises by 17 versus the pre-change run (3 policy + 7 request + 4 new service + 3 controller).

### Task 19 (M.4): Production build ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 20 (M.5): Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-13-user-meal-times/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- Link to `plan.md` in this folder, and the approved mockup.
- A summary: three nullable `users` TIME columns, `PATCH /api/users/me/preferences` gains `mealTimes` with true-PATCH semantics, effective times on every `UserDTO`, `MealTimesControl` in the account menu. Add the new version from Task 16.
- **Migration:** `2026-10-12-mpp13-user-meal-times.sql` must be applied to Railway **before** the backend deploys. If MPP-12 ships in the same push, `2026-10-12-mpp12-meal-plan-entry-eaten.sql` must be applied too.
- Verification results from Tasks 15 (manual), 17, 18 and 19.
- Convention note: *"Preference PATCH fields are presence-tracked: absent = untouched, null = clear. New preferences add a setter that records presence."*
- Suggested commit subject: `MPP-13: Meal times in the account menu`.

---

## Self-review

**Spec coverage:**
- Migration with three nullable TIME columns, applied by hand — Tasks 1, 2.
- `User` entity fields — Task 3.
- `MealTimesPolicy` (defaults, format, order, effective) — Task 4.
- `MealTimesDTO` on `UserDTO` — Tasks 4, 5.
- `MealTimesRequest` + presence-tracking request — Task 6.
- `UserService.updatePreferences` / `getUserDTO` — Task 7.
- `/auth/me` through `UserService` — Task 9; PATCH controller — Task 8.
- Backend tests (validation, deserialisation, service, controller 400) — Tasks 4, 6, 7, 8.
- Frontend constants, helper + smoke script — Tasks 10, 11.
- `userService` + `AuthContext` — Tasks 12, 13.
- `MealTimesControl` + CSS, mounted for signed-in users only — Tasks 14, 15.
- Version bump + CHANGELOG — Task 16.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command. The only conditional instruction (Task 8 Step 3, add an `@MockBean` if the slice names a missing bean) names the exact remedy and the precedent.

**Type / name consistency:** DB `breakfast_by` / `lunch_by` / `dinner_by` ↔ `User.breakfastBy/lunchBy/dinnerBy` (`LocalTime`) ↔ `MealTimesDTO` / `MealTimesRequest` `breakfastBy/lunchBy/dinnerBy` (String HH:mm) ↔ `MEAL_TIME_KEYS` ↔ input ids `meal-times-<key>`. `MealTimesPolicy.{DEFAULT_*, HH_MM_REGEX, FORMAT_ERROR, ORDER_ERROR, isStrictlyOrdered, parse, effective}` are used identically in Tasks 4, 5, 6, 7. `UserPreferencesUpdateRequest.{isDefaultServingsPresent, isMealTimesPresent, getMealTimes}` are used in Tasks 6 and 7. `UserService.{updatePreferences, getUserDTO, convertToDTO}` are used in Tasks 7, 8 and 9. Frontend `isStrictlyOrdered` / `pickMealTimes` / `saveMealTimes` / `mealTimes` are used in Tasks 11, 13 and 14. CSS classes `meal-times`, `-label`, `-row`, `-row-label`, `-input`, `-input--default`, `-input--invalid`, `-error`, `-reset` match the mockup. The error string "Times must run breakfast → lunch → dinner." is identical in `MealTimesPolicy.ORDER_ERROR` (as `\u2192`), `MEAL_TIMES_ORDER_ERROR`, and the tests.

**Phase boundary cleanliness:**
- Phase 1: only a SQL file plus a manual apply. Unmapped nullable columns leave the current backend starting cleanly.
- Phase 2: every `UserDTO` construction site and every `updateDefaultServings` caller is updated inside the phase. It ends with the five affected test classes green.
- Phase 3: `userService` and `AuthContext` change together before the build check in Task 13. The control renders nothing without `mealTimes`, so the build and the app are consistent at each task's end.
- Phase 4: only the version bump and read-only checks.
