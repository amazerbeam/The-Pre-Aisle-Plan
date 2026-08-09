# Tasks: User-configurable default portions from the account menu

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: IN PROGRESS
Started: 2026-08-09

**Goal:** Let a user set their portion count once from the account menu so every servings control *starts* at their number instead of the recipe author's, without touching the scaling maths, extras, or existing meal-plan entries.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-08-09_user_default_servings_preference.sql` — widen `users.default_servings` to `DECIMAL(4,2)` and reset all rows to `NULL`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/UserPreferencesUpdateRequest.java` — validated request body for the save endpoint
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/UserController.java` — `PATCH /api/users/me/preferences`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/UserServiceTest.java` — clamping / null-clearing invariants on the save
- `foodbytes-app/client/src/services/userService.js` — Axios wrapper for the preference PATCH
- `foodbytes-app/client/src/components/layout/DefaultPortionsControl.jsx` — the account-menu control
- `foodbytes-app/client/src/components/layout/DefaultPortionsControl.css` — its styles
- `foodbytes-app/client/src/utils/servingsUtils.check.mjs` — `node`-runnable assertions for `resolveStartingServings`

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/User.java:37-38` — `Integer` → `BigDecimal`, drop the `= 1` initialiser
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/security/UserPrincipal.java:19-41` — carry `defaultServings`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/UserDTO.java:10-16` — add `defaultServings`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/UserService.java:38-46` — populate the new field; add `updateDefaultServings`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/AuthController.java:26-72` — route both `UserDTO` builds through `UserService.convertToDTO`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/AuthControllerLoginTest.java:27-29` — add the `@MockBean`s the controller's dependencies now require
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java:144-215` — preference tier in `resolveServings`; inline owner derivation in `assignRecipe`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java` — cover the new tier
- `foodbytes-app/client/src/utils/servingsUtils.js` — add `resolveStartingServings`
- `foodbytes-app/client/src/contexts/AuthContext.jsx:52-63` — expose `defaultServings` + `saveDefaultServings`
- `foodbytes-app/client/src/components/layout/Header.jsx:58-68` — mount the control above Sign Out
- `foodbytes-app/client/src/components/recipes/RecipeCard.jsx:1-14` — seed servings from the helper
- `foodbytes-app/client/src/contexts/MealPlanContext.jsx:185-198` — mirror the backend's resolution order in the optimistic row

**Deleted:** (none)

---

## Phase 1 — Schema

The migration is written and then applied by hand to the Railway MySQL. Hibernate runs `ddl-auto: validate`, so the column must be `DECIMAL(4,2)` **before** the entity becomes `BigDecimal` in Phase 2 — otherwise the backend refuses to start. This phase changes no Java, so the build stays green throughout and the repo is consistent whether or not the apply has happened yet.

### Task 1: Write the `users.default_servings` migration ✓

- Skill: `java-backend`

**Files:**
- Create: `foodbytes-app/database/migrations/2026-08-09_user_default_servings_preference.sql`

- [x] **Step 1: Write the migration file**

Model the header on `2026-07-29_decimal_servings.sql` — state what it does, why it is lossless with the real row counts, and that it must be applied before redeploy.

```sql
-- 2026-08-09 — User default portions preference (MPP-3)
--
-- Two changes to users.default_servings:
--
-- 1. Reset every row to NULL. The column already existed as INT NULL DEFAULT 1
--    but was dead — no backend or frontend code path ever read or wrote it
--    (grep found only the 2026-05-18_password_auth.sql seed INSERT). All 11
--    rows therefore hold the untouched column default of 1, not anyone's
--    choice. MPP-3 AC 9 requires "never set" to fall back to the recipe's own
--    default_servings, so NULL becomes the canonical never-set value. Leaving
--    the 1s in place would silently give every existing user a one-serving
--    preference the moment the feature ships.
--
-- 2. Widen INT -> DECIMAL(4,2), matching meal_plan_entries.servings, so the
--    preference supports the same 0.25 quarter-portion precision as every
--    other servings control. Lossless: all 11 rows hold the integer 1, well
--    inside DECIMAL(4,2)'s 0.01..99.99 range. No backfill needed.
--
-- DECIMAL(4,2) permits 0.01..99.99 at the column level; the application floor
-- (0.25) and ceiling (20) are enforced by UserPreferencesUpdateRequest
-- validation, mirroring how MealPlanCreateRequest guards the entry column.
--
-- IDEMPOTENT. The destructive UPDATE is guarded on information_schema still
-- reporting the column as `int`, which is only true on the first run. Re-running
-- this file after go-live is a no-op and will NOT wipe real preferences. The
-- ALTER is naturally idempotent (MODIFY to the same type does nothing).
--
-- MUST be applied to the Railway MySQL BEFORE the backend redeploys.
-- Hibernate runs ddl-auto: validate and will refuse to start if the entity is
-- BigDecimal while the column is still INT.

SET @is_int := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'users'
    AND COLUMN_NAME  = 'default_servings'
    AND DATA_TYPE    = 'int'
);

SET @reset_sql := IF(@is_int = 1,
                     'UPDATE users SET default_servings = NULL',
                     'DO 0');
PREPARE reset_stmt FROM @reset_sql;
EXECUTE reset_stmt;
DEALLOCATE PREPARE reset_stmt;

ALTER TABLE users
  MODIFY COLUMN default_servings DECIMAL(4,2) NULL DEFAULT NULL;
```

- [x] **Step 2: Confirm the file exists and the guard is present**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-08-09_user_default_servings_preference.sql; Select-String -Path foodbytes-app\database\migrations\2026-08-09_user_default_servings_preference.sql -Pattern "information_schema"`
Expected: the file is listed, and the `information_schema` guard matches on one line. A missing guard means the `UPDATE` is not one-shot — do not hand this to the developer without it.

### Task 2: Developer applies the migration to the Railway MySQL

- Skill: `none — DBA operation against the live Railway MySQL, which no skill governs`

**Files:** (none — this task runs SQL, it does not edit the repo)

> **This task is the developer's, not the agent's.** It writes to the production `users` table holding real accounts. Do not run the DDL or the `UPDATE` automatically, and do not proceed to Phase 2 until the developer confirms it has landed — a `BigDecimal` entity against an `INT` column stops the backend from starting.

- [ ] **Step 1: Developer reviews the guard, then applies the file**

Hand the developer the file path and ask them to apply it to the Railway MySQL. Ask them to read the `information_schema` guard before running it, since the `UPDATE` clears a column on 11 production user rows.

- [ ] **Step 2: Verify the column landed, without reading user data**

Run (via `mcp__mysql__mysql_query`): `SHOW COLUMNS FROM users LIKE 'default_servings'`
Expected: `Type: decimal(4,2)`, `Null: YES`, `Default: NULL`.

- [ ] **Step 3: Verify the reset applied, using an aggregate only**

Run (via `mcp__mysql__mysql_query`): `SELECT COUNT(*) AS total, COUNT(default_servings) AS non_null FROM users`
Expected: `total: 11, non_null: 0`. Do not `SELECT` rows from `users` — this is production personal data and an aggregate answers the question.

---

## Phase 2 — Backend: persist and deliver the preference

The entity now matches the widened column, the value rides along on the authenticated-user payload, and a validated endpoint saves it. This phase leaves the backend in a working, deployable state: the preference can be read and written end-to-end even though nothing consumes it yet. `AuthController`'s two hand-built `UserDTO`s are routed through `UserService.convertToDTO` here, because adding a sixth constructor argument breaks both call sites at compile time regardless.

### Task 3: Widen the `User.defaultServings` field to `BigDecimal`

- Skill: `java-backend`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/User.java:37-38`

- [ ] **Step 1: Change the field type and drop the default initialiser**

Replace:

```java
    @Column(name = "default_servings")
    private Integer defaultServings = 1;
```

with:

```java
    /**
     * MPP-3: the user's preferred starting portion count for servings controls.
     * NULL means never set — callers fall back to the recipe's own
     * default_servings (AC 9). Deliberately has NO field initialiser: a default
     * of 1 here would silently give every newly created user a one-serving
     * preference, which is the exact bug the 2026-08-09 migration reset exists
     * to undo.
     */
    @Column(name = "default_servings")
    private BigDecimal defaultServings;
```

Add `import java.math.BigDecimal;` alongside the existing `java.time.LocalDateTime` import.

- [ ] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, 0 errors.

### Task 4: Carry `defaultServings` on `UserPrincipal`

- Skill: `java-backend`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/security/UserPrincipal.java:19-41`

`UserPrincipal` is rebuilt from a fresh `userRepository.findById` on every request (`JwtAuthenticationFilter.java:35-38`), so a value carried here is never stale and no JWT re-issue is needed after a save.

- [ ] **Step 1: Add the field**

Insert after `private boolean isAdmin;` and before `private Collection<? extends GrantedAuthority> authorities;`:

```java
    private BigDecimal defaultServings;
```

Add `import java.math.BigDecimal;`.

- [ ] **Step 2: Populate it in `create(User)`**

In the `create(User user)` factory, change the constructor call to pass the new value between `user.getIsAdmin()` and `authorities`:

```java
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getAvatarUrl(),
                user.getIsAdmin(),
                user.getDefaultServings(),
                authorities,
                Collections.emptyMap()
        );
```

- [ ] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, 0 errors.

### Task 5: Add `defaultServings` to `UserDTO` and populate it in `UserService.convertToDTO`

- Skill: `java-backend`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/UserDTO.java:10-16`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/UserService.java:38-46`

- [ ] **Step 1: Add the DTO field**

In `UserDTO`, add as the sixth and final field:

```java
    private BigDecimal defaultServings;   // MPP-3: null means never set
```

Add `import java.math.BigDecimal;`.

- [ ] **Step 2: Populate it in `convertToDTO`**

In `UserService.convertToDTO`, add the sixth constructor argument:

```java
    public UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getAvatarUrl(),
                user.getIsAdmin(),
                user.getDefaultServings()
        );
    }
```

- [ ] **Step 3: Compile — expect `AuthController` to break here**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: compilation **fails** with two errors in `AuthController.java` (lines ~32 and ~64), both `constructor UserDTO ... cannot be applied to given types`. This is the intended signal that both hand-built call sites need updating — Task 6 fixes them. Do not add a five-arg constructor to work around it.

### Task 6: Route `AuthController`'s `UserDTO` builds through `UserService.convertToDTO`

- Skill: `java-backend`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/AuthController.java:26-72`

Two hand-rolled constructions become one shared call, so a future field cannot be populated at one site and forgotten at the other. `getCurrentUser` reads from `UserPrincipal` rather than the entity, so it keeps building the DTO directly — but from the principal's new field.

- [ ] **Step 1: Inject `UserService`**

Add to the field block alongside the two existing dependencies:

```java
    private final UserService userService;
```

and `import com.foodbytes.service.UserService;`. `@RequiredArgsConstructor` picks it up.

- [ ] **Step 2: Update `getCurrentUser` to pass the principal's preference**

```java
        UserDTO userDTO = new UserDTO(
                userPrincipal.getId(),
                userPrincipal.getEmail(),
                userPrincipal.getName(),
                userPrincipal.getAvatarUrl(),
                userPrincipal.isAdmin(),
                userPrincipal.getDefaultServings()
        );
        return ResponseEntity.ok(userDTO);
```

- [ ] **Step 3: Replace the `login` construction with the service call**

```java
        User user = passwordAuthService.authenticateAndIssueCookie(
                request.email(), request.password(), response);
        return ResponseEntity.ok(userService.convertToDTO(user));
```

- [ ] **Step 4: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, 0 errors.

### Task 7: Repair `AuthControllerLoginTest`'s mocked context

- Skill: `java-backend`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/AuthControllerLoginTest.java:27-29`

`@WebMvcTest(AuthController.class)` builds a real Spring context for the controller, so every constructor dependency must be a `@MockBean`. The test currently mocks only `PasswordAuthService`, leaving `JwtCookieService` unmocked — the known pre-existing failure recorded for this suite. Task 6 adds `UserService` as a third dependency, so the mock list has to be completed here regardless.

- [ ] **Step 1: Add the missing `@MockBean`s**

Replace the field block:

```java
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private PasswordAuthService passwordAuthService;
    @MockBean private JwtCookieService jwtCookieService;
    @MockBean private UserService userService;
```

Add `import com.foodbytes.security.JwtCookieService;` and `import com.foodbytes.service.UserService;`.

- [ ] **Step 2: Stub `convertToDTO` for the success case**

`login` now delegates DTO construction, so the mocked `UserService` must return something for the `$.email` assertion on line 53 to hold. Inside `loginSuccess_returns200_andSetsJwtCookieViaService`, after the `passwordAuthService` stub and before the `mockMvc.perform` call:

```java
        when(userService.convertToDTO(user))
                .thenReturn(new UserDTO(42L, "friend@example.com", "Friend", null, false, null));
```

Add `import com.foodbytes.dto.UserDTO;`.

- [ ] **Step 3: Run the repaired suite**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=AuthControllerLoginTest`
Expected: `Tests run: 4, Failures: 0, Errors: 0`. This suite was failing on context load before this task — if it still fails, report the actual output rather than assuming it is a regression from MPP-3.

### Task 8: Add the preference save endpoint

- Skill: `java-backend`

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/UserPreferencesUpdateRequest.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/UserController.java`
- Create: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/UserServiceTest.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/UserService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/UserServiceTest.java`

No `SecurityConfig` change is needed: `.anyRequest().authenticated()` at `SecurityConfig.java:59` already covers `/api/users/**`.

- [ ] **Step 1: Write the request DTO**

```java
package com.foodbytes.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * MPP-3: partial update of the authenticated user's preferences.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
```

- [ ] **Step 2: Add the service method**

Append to `UserService`:

```java
    /**
     * MPP-3: save the user's preferred starting portion count.
     * A null value clears the preference, restoring the recipe-default
     * behaviour. Validation of the range happens on the request DTO.
     */
    @Transactional
    public UserDTO updateDefaultServings(Long userId, BigDecimal defaultServings) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        user.setDefaultServings(defaultServings);
        return convertToDTO(userRepository.save(user));
    }
```

Add `import java.math.BigDecimal;`.

- [ ] **Step 3: Write the controller**

```java
package com.foodbytes.controller;

import com.foodbytes.dto.UserDTO;
import com.foodbytes.dto.UserPreferencesUpdateRequest;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * MPP-3: update the authenticated user's preferences.
     * Currently one field — the default portion count. A null defaultServings
     * clears the preference.
     */
    @PatchMapping("/me/preferences")
    public ResponseEntity<?> updatePreferences(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UserPreferencesUpdateRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        UserDTO updated = userService.updateDefaultServings(
                userPrincipal.getId(), request.getDefaultServings());
        return ResponseEntity.ok(updated);
    }

    /**
     * There is no @ControllerAdvice in this codebase — AuthController shapes its
     * own errors the same way. Without this the client would receive Spring
     * Boot's default {timestamp, status, error, path} body and the frontend's
     * "read the error body" path would surface nothing useful.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
```

- [ ] **Step 4: Write the service test**

The invariant worth pinning is that `null` clears rather than being coerced to a number — the AC 9 path.

```java
package com.foodbytes.service;

import com.foodbytes.dto.UserDTO;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * MPP-3: UserService.updateDefaultServings.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @InjectMocks private UserService userService;

    private static final Long USER_ID = 7L;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(USER_ID);
        user.setEmail("cook@example.com");
        user.setName("Cook");
        user.setIsAdmin(false);
    }

    private void stubSave() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void updateDefaultServings_storesTheValue_andReturnsItOnTheDTO() {
        stubSave();

        UserDTO dto = userService.updateDefaultServings(USER_ID, new BigDecimal("1.00"));

        assertThat(user.getDefaultServings()).isEqualByComparingTo("1.00");
        assertThat(dto.getDefaultServings()).isEqualByComparingTo("1.00");
    }

    /**
     * AC 9: an explicit null clears the preference back to "never set" so the
     * starting value falls back to the recipe's own default_servings. A null
     * coerced to 1 here would look identical in the UI but would permanently
     * pin every recipe to one serving.
     */
    @Test
    void updateDefaultServings_withNull_clearsThePreference() {
        user.setDefaultServings(new BigDecimal("3.00"));
        stubSave();

        UserDTO dto = userService.updateDefaultServings(USER_ID, null);

        assertThat(user.getDefaultServings()).isNull();
        assertThat(dto.getDefaultServings()).isNull();
    }

    @Test
    void updateDefaultServings_whenUserMissing_throws() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateDefaultServings(USER_ID, BigDecimal.ONE))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }
}
```

- [ ] **Step 5: Run the new test class**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=UserServiceTest`
Expected: `Tests run: 3, Failures: 0, Errors: 0`.

- [ ] **Step 6: Confirm the controller holds no repository call**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\controller\UserController.java -Pattern "Repository|EntityManager"`
Expected: zero hits — controllers stay thin per the `java-backend` layering rule.

---

## Phase 3 — Backend: meal-plan default resolution (AC 5)

`MealPlanService.resolveServings` gains one tier so an omitted servings value resolves to the requesting user's preference before falling back to the recipe's default. This is the single point every meal-plan caller flows through, so AC 5 lands here rather than in the frontend. The phase is self-contained: the backend is fully working and deployable at its end, with the whole story's server side done.

### Task 9: Add the preference tier to `resolveServings`

- Skill: `java-backend`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java:144-215`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java`

- [ ] **Step 1: Load the requesting user once in `assignRecipe` and derive the owner from it**

`getEffectiveMealPlanOwnerId` has six call sites; changing its signature for the benefit of one is not worth it. Only `assignRecipe` changes. Replace line 146:

```java
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
```

with:

```java
        // MPP-3: the requesting user is loaded here (not just their owner id) so
        // resolveServings can read their portion preference without a third
        // findById on this path. Query count is unchanged: two before, two after.
        User requestingUser = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Long effectiveOwnerId = requestingUser.getMealPlanOwnerId() != null
            ? requestingUser.getMealPlanOwnerId()
            : userId;
```

- [ ] **Step 2: Pass the requesting user into `resolveServings`**

At line 182, change:

```java
        entry.setServings(resolveServings(request.getServings(), recipe));
```

to:

```java
        entry.setServings(resolveServings(request.getServings(), recipe, requestingUser));
```

The `User user = userRepository.findById(effectiveOwnerId)` lookup at line 170 stays — `entry.setUser(user)` needs the *owner* entity, which differs from the requester under `meal_plan_owner_id` sharing.

- [ ] **Step 3: Add the preference tier to `resolveServings`**

Replace the whole method and its Javadoc:

```java
    /**
     * Resolve how many servings a new entry represents.
     * An omitted value means "the whole recipe as authored", i.e. the recipe's
     * default_servings — not 1. Storing 1 against a 2-serving recipe halves every
     * quantity ShoppingListService derives from the entry.
     *
     * <p>MPP-3 adds a tier between the two: when the requesting user has set a
     * default portion count, an omitted value resolves to that instead of the
     * recipe's default (AC 5). The preference belongs to the person clicking,
     * not to the meal plan owner — under meal_plan_owner_id sharing they can
     * differ, and the clicker is the one who set it and the one who will cook.
     *
     * @param requested Servings from the request, or null when omitted. May be
     *                  fractional (0.5 = half portion, 0.25 = quarter).
     * @param recipe    The recipe being assigned
     * @param requestingUser The authenticated user making the request; may carry
     *                  a default_servings preference, or null when never set
     * @return the requested value when it is positive, else the user's preference
     *         when positive, else the recipe's default_servings when that is
     *         positive, else 1
     */
    private BigDecimal resolveServings(BigDecimal requested, Recipe recipe, User requestingUser) {
        if (requested != null && requested.signum() > 0) {
            return requested;
        }
        if (requested != null) {
            log.warn("Ignoring non-positive servings ({}) on a meal plan entry for recipe {}; deriving from the recipe instead",
                     requested, recipe.getId());
        }
        BigDecimal userDefault = requestingUser != null ? requestingUser.getDefaultServings() : null;
        if (userDefault != null && userDefault.signum() > 0) {
            return userDefault;
        }
        Integer recipeDefault = recipe.getDefaultServings();
        if (recipeDefault != null && recipeDefault > 0) {
            return BigDecimal.valueOf(recipeDefault);
        }
        log.warn("Recipe {} has invalid default_servings ({}); storing servings = 1 for the new meal plan entry",
                 recipe.getId(), recipeDefault);
        return BigDecimal.ONE;
    }
```

- [ ] **Step 4: Add tests for the new tier**

Append to `MealPlanServiceTest`. The existing `stubHappyPath()` already stubs `userRepository.findById(USER_ID)` returning `user`, so the new tests only set the preference on that fixture.

```java
    /**
     * MPP-3 AC 5: an omitted servings value resolves to the user's preference
     * rather than the recipe's default_servings.
     */
    @Test
    void assignRecipe_whenServingsOmittedAndUserHasPreference_usesThePreference() {
        user.setDefaultServings(new BigDecimal("1.00"));
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("1.00");
    }

    /**
     * MPP-3 AC 10: the preference is a starting point, not a lock. An explicit
     * request value still wins over it.
     */
    @Test
    void assignRecipe_whenServingsProvided_beatsTheUserPreference() {
        user.setDefaultServings(new BigDecimal("1.00"));
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(new BigDecimal("4")));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("4");
    }

    /**
     * MPP-3 AC 9: a user who never set the preference behaves exactly as before —
     * the recipe's default_servings (2) still wins.
     */
    @Test
    void assignRecipe_whenUserHasNoPreference_stillUsesRecipeDefault() {
        user.setDefaultServings(null);
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("2");
    }
```

- [ ] **Step 5: Run the suite**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: `Tests run: 8, Failures: 0, Errors: 0` — the five existing tests plus the three added here.

---

## Phase 4 — Frontend: the starting-servings decision, in one pure function

AC 4, 6 and 9 are one decision — "where does this control start?" — so they live in one pure, React-free function that plain `node` can verify. There is no frontend test runner, so this `.check.mjs` is the only executable assertion the frontend gets; `macroStatus.check.mjs` is the precedent. Nothing consumes the helper yet, so the build stays green and no behaviour changes.

### Task 10: Add `resolveStartingServings` and its check file

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/utils/servingsUtils.js`
- Create: `foodbytes-app/client/src/utils/servingsUtils.check.mjs`

- [ ] **Step 1: Switch the existing import to an explicit extension**

`servingsUtils.check.mjs` runs under plain `node`, which does not resolve extensionless specifiers the way Vite does — the same constraint `macroStatus.js:1-8` documents. Change line 1 of `servingsUtils.js`:

```js
// Explicit .js extension: this module is imported by servingsUtils.check.mjs under
// plain `node`, which does not resolve extensionless specifiers the way Vite does.
import { MIN_SERVINGS, MAX_SERVINGS, DEFAULT_SERVINGS } from '../constants/servings.js'
```

- [ ] **Step 2: Append the helper**

```js
/**
 * MPP-3: where a servings control starts.
 *
 * The user preference moves the STARTING value only. Every scaling site —
 * RecipeCard.jsx:37 (ingredient quantities), RecipeCard.jsx:59 and
 * RecipeViewModal.jsx:222 (per-serving kcal) — keeps dividing by
 * recipe.defaultServings. Overriding that divisor would silently misreport
 * macros on every recipe, which the ticket calls out as the main correctness
 * risk in the story.
 *
 * Resolution order:
 *   1. Extras (component recipes: pesto, pita, dough) always start at their own
 *      defaultServings — a linked sauce is not a meal (AC 6).
 *   2. No preference, or an unusable one, falls back to the recipe (AC 9).
 *   3. Otherwise the preference (AC 4).
 *
 * @param {{defaultServings?: number, mealTypes?: string[]} | null} recipe
 * @param {number|string|null|undefined} userDefaultServings
 * @returns {number}
 */
export function resolveStartingServings(recipe, userDefaultServings) {
  const recipeDefault = parseServings(recipe?.defaultServings) ?? DEFAULT_SERVINGS

  if (isExtrasOnly(recipe)) return recipeDefault

  const preference = parseServings(userDefaultServings)
  return preference === null ? recipeDefault : preference
}

/**
 * Whether every meal type on this recipe is the component/extras type.
 *
 * Mirrors hasMealMacroTargets() in macroStatus.js — component recipes are tagged
 * Extras-only and are not meals. Case-insensitive because the detail endpoint
 * returns meals.key ("extras") while other shapes expose the display name
 * ("Extras"); comparing raw strings would match one and silently miss the other.
 *
 * An absent or empty mealTypes returns false (not an extra), so a recipe with
 * missing meal data gets the preference rather than silently opting out of it.
 */
function isExtrasOnly(recipe) {
  const mealTypes = recipe?.mealTypes
  if (!Array.isArray(mealTypes) || mealTypes.length === 0) return false
  return mealTypes.every(
    (mealType) => String(mealType).toLowerCase() === COMPONENT_MEAL_TYPE
  )
}
```

Add `COMPONENT_MEAL_TYPE` to the imports at the top of the file:

```js
import { COMPONENT_MEAL_TYPE } from '../constants/macroTargets.js'
```

`isExtrasOnly` is a module-private helper and goes below the exported function, per the imports → constants → component → helpers → export file order.

- [ ] **Step 3: Write the check file**

```js
// Run: node src/utils/servingsUtils.check.mjs   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the starting-servings
// decision — the one place MPP-3 AC 4, 6 and 9 meet — is pinned here instead.
// Mirrors macroStatus.check.mjs.
import assert from 'node:assert/strict'
import { resolveStartingServings } from './servingsUtils.js'

const meal = { defaultServings: 2, mealTypes: ['dinner'] }
const extra = { defaultServings: 4, mealTypes: ['extras'] }
const extraTitleCase = { defaultServings: 4, mealTypes: ['Extras'] }
const dualPurpose = { defaultServings: 2, mealTypes: ['extras', 'dinner'] }

// AC 9 — no preference set: unchanged behaviour, the recipe's own default.
assert.equal(resolveStartingServings(meal, null), 2)
assert.equal(resolveStartingServings(meal, undefined), 2)
assert.equal(resolveStartingServings(meal, ''), 2)

// AC 4 — preference set: the meal recipe starts at the preference.
assert.equal(resolveStartingServings(meal, 1), 1)
assert.equal(resolveStartingServings(meal, '1'), 1)
assert.equal(resolveStartingServings(meal, 0.5), 0.5)
assert.equal(resolveStartingServings(meal, 3.25), 3.25)

// AC 6 — extras are exempt in both casings the API can return.
assert.equal(resolveStartingServings(extra, 1), 4)
assert.equal(resolveStartingServings(extraTitleCase, 1), 4)

// A recipe that is BOTH an extra and a dinner is a meal — the preference applies.
assert.equal(resolveStartingServings(dualPurpose, 1), 1)

// Unusable preferences fall back rather than producing NaN.
assert.equal(resolveStartingServings(meal, 'abc'), 2)
assert.equal(resolveStartingServings(meal, NaN), 2)

// Out-of-range preferences are clamped by parseServings, not rejected.
assert.equal(resolveStartingServings(meal, 0.1), 0.25)
assert.equal(resolveStartingServings(meal, 999), 20)

// Missing recipe data degrades to DEFAULT_SERVINGS rather than NaN.
assert.equal(resolveStartingServings(null, null), 1)
assert.equal(resolveStartingServings({}, null), 1)
assert.equal(resolveStartingServings({ mealTypes: ['dinner'] }, null), 1)

console.log('servingsUtils.check.mjs: all assertions passed')
```

- [ ] **Step 4: Run the check file**

Run: `cd foodbytes-app\client; node src/utils/servingsUtils.check.mjs`
Expected: `servingsUtils.check.mjs: all assertions passed`, exit code 0.

- [ ] **Step 5: Confirm the pre-existing check file still passes**

Step 1 changed an import specifier in a shared utils module; confirm nothing regressed.

Run: `cd foodbytes-app\client; node src/utils/macroStatus.check.mjs`
Expected: its existing success line, exit code 0.

---

## Phase 5 — Frontend: plumbing and the account-menu control

The preference becomes readable and writable from the UI: a service module, a context extension, and the control itself. AC 1, 2 and 3 land here. Nothing yet *consumes* the value for starting servings — that is Phase 6 — so at the end of this phase the control saves and reloads correctly while recipe cards still behave exactly as today. That makes it a clean stopping point: a half-finished story shows a working preference that simply has no effect yet, rather than a broken one.

### Task 11: Add the preference service module

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/services/userService.js`

- [ ] **Step 1: Write the module**

Match the shape of the existing per-domain modules; HTTP goes through the shared `api` instance so the base URL, credentials, and 401 interceptor all apply.

```js
import api from './api'

/**
 * MPP-3: the authenticated user's preferences.
 */
export const userService = {
  /**
   * Save the default portion count. Pass null to clear the preference and
   * restore the recipe-default behaviour.
   * @param {number|null} defaultServings
   * @returns {Promise<Object>} the updated UserDTO
   */
  updatePreferences: async (defaultServings) => {
    const response = await api.patch('/users/me/preferences', { defaultServings })
    return response.data
  }
}
```

- [ ] **Step 2: Confirm no hardcoded backend URL crept in**

Run: `Select-String -Path foodbytes-app\client\src\services\userService.js -Pattern "localhost:8080|axios.create"`
Expected: zero hits.

### Task 12: Expose the preference through `AuthContext`

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/contexts/AuthContext.jsx:52-63`

- [ ] **Step 1: Add the save action above the `value` object**

Insert after the existing `logout` function:

```js
  /**
   * MPP-3: save the default portion count. Pass null to clear it.
   * Throws on failure so the calling control can surface the server's message
   * and revert — deliberately NOT caught into a success shape here.
   */
  const saveDefaultServings = async (defaultServings) => {
    const updated = await userService.updatePreferences(defaultServings)
    setUser(updated)
    return updated
  }
```

Add the import at the top: `import { userService } from '../services/userService'`.

- [ ] **Step 2: Publish it on the context value**

```js
  const value = {
    user,
    loading,
    isGuest,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    defaultServings: user?.defaultServings ?? null,
    loginWithGoogle,
    passwordLogin,
    continueAsGuest,
    logout,
    saveDefaultServings,
    checkAuthStatus
  }
```

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 13: Build the `DefaultPortionsControl` component

- Skill: `react-frontend`

**Files:**
- Create: `foodbytes-app/client/src/components/layout/DefaultPortionsControl.jsx`
- Create: `foodbytes-app/client/src/components/layout/DefaultPortionsControl.css`

Extracted rather than inlined into `Header.jsx` so neither file carries an async save path plus a stepper plus the dropdown's own state.

- [ ] **Step 1: Write the component**

```jsx
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { MIN_SERVINGS, MAX_SERVINGS, SERVINGS_STEP } from '../../constants/servings'
import { parseServings, formatServings, stepServings } from '../../utils/servingsUtils'
import './DefaultPortionsControl.css'

/**
 * MPP-3: "Default portions" control in the account menu.
 *
 * Sets the starting value of every servings control in the app. Bounds and
 * precision come from constants/servings.js — the same MIN/MAX the backend
 * enforces on UserPreferencesUpdateRequest — so there is no second set of
 * bounds to drift (AC 2).
 *
 * Rendered only for authenticated users: guests have no user row, so there is
 * nowhere to persist the preference. Header only mounts this inside the
 * authenticated branch.
 */
function DefaultPortionsControl() {
  const { defaultServings, saveDefaultServings } = useAuth()

  const [display, setDisplay] = useState(formatServings(defaultServings ?? MIN_SERVINGS))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const persist = async (value) => {
    setSaving(true)
    setError(null)
    try {
      await saveDefaultServings(value)
      setDisplay(formatServings(value))
    } catch (err) {
      // Surface the server's message; fall back to status only when there is no
      // body. Never swallow into a success shape — a failed save must not look
      // like a saved preference.
      const serverMessage = err?.response?.data?.error
      setError(serverMessage || 'Could not save. Try again.')
      setDisplay(formatServings(defaultServings ?? MIN_SERVINGS))
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => setDisplay(e.target.value)

  const handleBlur = () => {
    const parsed = parseServings(display)
    if (parsed === null) {
      setDisplay(formatServings(defaultServings ?? MIN_SERVINGS))
      return
    }
    if (parsed === defaultServings) {
      setDisplay(formatServings(parsed))
      return
    }
    persist(parsed)
  }

  const adjust = (delta) => {
    const next = stepServings(defaultServings ?? MIN_SERVINGS, delta)
    if (next === defaultServings) return
    persist(next)
  }

  return (
    <div className="default-portions">
      <label className="default-portions-label" htmlFor="default-portions-input">
        Default portions
      </label>

      <div className="default-portions-stepper">
        <button
          type="button"
          className="default-portions-btn"
          onClick={() => adjust(-SERVINGS_STEP)}
          disabled={saving || (defaultServings ?? MIN_SERVINGS) <= MIN_SERVINGS}
          aria-label="Decrease default portions"
        >
          −
        </button>

        <input
          id="default-portions-input"
          className="default-portions-input"
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={saving}
          aria-describedby={error ? 'default-portions-error' : undefined}
        />

        <button
          type="button"
          className="default-portions-btn"
          onClick={() => adjust(SERVINGS_STEP)}
          disabled={saving || (defaultServings ?? MIN_SERVINGS) >= MAX_SERVINGS}
          aria-label="Increase default portions"
        >
          +
        </button>
      </div>

      {error && (
        <span className="default-portions-error" id="default-portions-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default DefaultPortionsControl
```

- [ ] **Step 2: Write the CSS**

Mobile-first, ≥44px touch targets, hover wrapped in `@media (hover: hover)`, `:focus-visible` for keyboard outlines — per the `react-frontend` touch rules.

```css
.default-portions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.default-portions-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #555;
}

.default-portions-stepper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.default-portions-btn {
  min-width: 44px;
  min-height: 44px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-size: 1.125rem;
  line-height: 1;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.default-portions-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (hover: hover) {
  .default-portions-btn:not(:disabled):hover {
    background: #f3f3f3;
  }
}

.default-portions-btn:not(:disabled):active {
  background: #e8e8e8;
}

.default-portions-btn:focus-visible,
.default-portions-input:focus-visible {
  outline: 2px solid #4a7c59;
  outline-offset: 2px;
}

.default-portions-input {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  padding: 0 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  touch-action: manipulation;
}

.default-portions-input:disabled {
  opacity: 0.6;
}

.default-portions-error {
  font-size: 0.75rem;
  color: #c0392b;
}
```

- [ ] **Step 3: Check the file size budget**

Run: `cd foodbytes-app\client; (Get-Content src\components\layout\DefaultPortionsControl.jsx | Measure-Object -Line).Lines`
Expected: under 200 — comfortably inside the budget, no split needed.

### Task 14: Mount the control in the account menu

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/layout/Header.jsx:58-68`

AC 1: positioned above Sign Out, alongside the existing name/email block. It sits inside the `isAuthenticated` branch, which is what implements the confirmed guest decision — guests see a Sign In button and no menu at all.

- [ ] **Step 1: Insert the control between the user info block and Sign Out**

```jsx
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <span className="user-name-full">{user.name}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                    <DefaultPortionsControl />
                    <button className="logout-btn" onClick={logout}>
                      Sign Out
                    </button>
                  </div>
                )}
```

Add the import at the top: `import DefaultPortionsControl from './DefaultPortionsControl'`.

- [ ] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [ ] **Step 3: Confirm `Header.jsx` stayed small**

Run: `cd foodbytes-app\client; (Get-Content src\components\layout\Header.jsx | Measure-Object -Line).Lines`
Expected: under 100 — the extraction kept it near its original 89.

---

## Phase 6 — Frontend: wire the starting value

The helper from Phase 4 finally reaches the two places that decide a starting value. This is the phase that makes the feature visible, and the phase where the double-duty trap lives: only the `useState` seed moves, never a divisor.

### Task 15: Seed `RecipeCard`'s servings from the preference

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeCard.jsx:1-14`

`RecipeViewModal` needs no change — it receives `servings` as a prop from this component, so AC 4's "the recipe view modal opens at 1" follows from this single edit.

- [ ] **Step 1: Read the preference and seed both state values from the helper**

Change the import on line 6 to pull in the new helper:

```jsx
import { parseServings, formatServings, stepServings, resolveStartingServings } from '../../utils/servingsUtils'
```

Then replace lines 10-14:

```jsx
  const { isAdmin, defaultServings: userDefaultServings } = useAuth()
  const [showDetails, setShowDetails] = useState(false)
  // MPP-3: the user's preference moves the STARTING value only. scaleQuantity
  // and perServingCalories below still divide by recipe.defaultServings — the
  // scaling basis is the recipe's, not the user's (AC 7).
  const [servings, setServings] = useState(() => resolveStartingServings(recipe, userDefaultServings))
  // Display buffer so a partially-typed value ("0." ) doesn't clobber the numeric state
  const [servingsDisplay, setServingsDisplay] = useState(() => formatServings(resolveStartingServings(recipe, userDefaultServings)))
```

Both are lazy initialisers, so the helper runs once per mount rather than on every render.

- [ ] **Step 2: Confirm the scaling sites were NOT touched**

This is the ticket's stated main correctness risk — both expressions must still read `recipe.defaultServings`.

Run: `Select-String -Path foodbytes-app\client\src\components\recipes\RecipeCard.jsx -Pattern "recipe\.defaultServings"`
Expected: exactly two hits — the `scaleQuantity` divisor (~line 37) and the `perServingCalories` divisor (~line 59). Neither may reference `userDefaultServings`.

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 16: Mirror the backend's resolution order in the optimistic meal-plan row

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/contexts/MealPlanContext.jsx:185-198`

The backend owns the real AC 5 fallback (Task 9). This value is display-only, filling the gap before `fetchWeekPlan()` returns — but if it disagrees with the backend the row visibly jumps after the refetch.

- [ ] **Step 1: Read the preference in the provider**

`MealPlanContext` already consumes `useAuth` for `isAuthenticated` (see `assignRecipe`). Extend that destructuring to include the preference — locate the existing `useAuth()` call in the provider and add `defaultServings: userDefaultServings` to it.

- [ ] **Step 2: Mirror the backend order in the optimistic entry**

Replace line 197:

```jsx
              servings: servings ?? recipeData?.defaultServings ?? 1
```

with:

```jsx
              // Display-only fallback mirroring the backend's resolution, so the
              // optimistic entry never renders `servings: undefined` (which would
              // surface as the literal string "undefined" in the servings input
              // until fetchWeekPlan() returns). The API call below deliberately
              // receives the raw `servings` value so an omitted one stays omitted
              // from the JSON body and the backend fallback still applies.
              // MPP-3: the tier order here must match MealPlanService.resolveServings
              // — requested, then the user's preference, then the recipe default.
              // A mismatch makes the row visibly jump when fetchWeekPlan() lands.
              servings: servings ?? resolveStartingServings(recipeData, userDefaultServings)
```

Add the import: `import { resolveStartingServings } from '../utils/servingsUtils'`.

Note the existing comment block above line 197 is replaced wholesale by the version above — do not leave both.

- [ ] **Step 3: Confirm the outgoing request body is unchanged**

An omitted `servings` must stay omitted so the backend fallback applies; only the local display value uses the helper.

Run: `Select-String -Path foodbytes-app\client\src\contexts\MealPlanContext.jsx -Pattern "resolveStartingServings"`
Expected: exactly two hits — the import line and the optimistic `servings:` line. Any hit inside the `mealPlanService` call arguments is a bug.

- [ ] **Step 4: Confirm the file did not cross the size budget**

Run: `cd foodbytes-app\client; (Get-Content src\contexts\MealPlanContext.jsx | Measure-Object -Line).Lines`
Expected: under 490. The file is known debt at 476 lines; this change adds roughly six. If it crosses 500, stop and report rather than splitting the context as unplanned scope.

- [ ] **Step 5: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 7 — Final verification

No production changes. Only cumulative sanity checks that the work is clean, the double-duty trap was not sprung anywhere, and both builds are green.

### Task 17: Confirm the preference never reached a scaling divisor

- Skill: `none — repo-wide grep audit, no code change`

- [ ] **Step 1: Confirm no divisor reads the user preference**

Run: `Select-String -Path foodbytes-app\client\src\components\recipes\*.jsx -Pattern "/ *userDefaultServings|/ *defaultServings\b"`
Expected: zero hits for `userDefaultServings`. Any hit means the preference is being used as a scaling basis — the exact failure the ticket names as its main correctness risk.

- [ ] **Step 2: Confirm the untouched scaling sites are intact**

Run: `Select-String -Path foodbytes-app\client\src\components\recipes\RecipeViewModal.jsx -Pattern "fullRecipe\.defaultServings"`
Expected: at least one hit around line 222 — the modal's ingredient scaling was never in scope and must still divide by the recipe's own value.

- [ ] **Step 3: Confirm `useRecipeStackServings` was not touched**

Run: `Select-String -Path foodbytes-app\client\src\hooks\useRecipeStackServings.js -Pattern "userDefaultServings|resolveStartingServings"`
Expected: zero hits — the confirmed decision was that linked sub-recipes keep their own `defaultServings`.

### Task 18: Run the full backend test suite

- Skill: `none — verification only, no code change`

- [ ] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors, across 7 test classes.

Context for the executor: before this work the suite reported `BUILD FAILURE` at 46/50, because `AuthControllerLoginTest` failed to load its Spring context with unmocked dependencies. Task 7 fixes that, so a clean run is the expectation now. If it still fails, **report the actual output verbatim** and identify whether the failing class is one this contract touched — do not assume it is a regression from MPP-3, and do not chase a pre-existing failure as though it were new.

### Task 19: Production build and frontend check files

- Skill: `none — verification only, no code change`

- [ ] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors, no unresolved-import warnings.

- [ ] **Step 2: Re-run both check files**

Run: `cd foodbytes-app\client; node src/utils/servingsUtils.check.mjs; node src/utils/macroStatus.check.mjs`
Expected: both print their success line and exit 0.

- [ ] **Step 3: Confirm no new console statements or module CSS**

Run: `Select-String -Path foodbytes-app\client\src\ -Pattern "console\.(log|debug)" -Recurse | Measure-Object | Select-Object -ExpandProperty Count; Get-ChildItem foodbytes-app\client\src -Recurse -Filter *.module.css`
Expected: the count is 6 (the documented baseline, unchanged), and the `*.module.css` search returns nothing.

### Task 20: Write the PR description

- Skill: `none — documentation, no code change`

**Files:**
- Create: `.claude/contract/MPP-3-user-default-portions/pr-description.md`

- [ ] **Step 1: Write `pr-description.md` for the developer to paste**

Include:

- Link to `plan.md` in this folder and to <https://amazerbeam.atlassian.net/browse/MPP-3>.
- Summary: `users.default_servings` widened to `DECIMAL(4,2)` and finally wired up — it existed as dead `INT` before. New `PATCH /api/users/me/preferences`, the value delivered on `/api/auth/me`, and a "Default portions" control in the account menu. Starting servings only; scaling basis unchanged.
- **The migration and its ordering**, called out prominently: `2026-08-09_user_default_servings_preference.sql` must be applied to the Railway MySQL **before** the backend redeploys, or Hibernate `validate` refuses to start. Note that it also resets 11 production rows to `NULL`, and that the `information_schema` guard makes that one-shot.
- Verification results from Phases 1–6: the backend suite count, the client build, and both `.check.mjs` runs.
- The two interpretation calls a future contributor needs to know: AC 6's `is_extra` column does not exist, so extras are detected by the `extras` meal type via `COMPONENT_MEAL_TYPE`; and under `meal_plan_owner_id` sharing the **requesting** user's preference applies, not the plan owner's.
- One-line note on the new convention: `resolveStartingServings` in `servingsUtils.js` is the single place the starting-value decision lives — new servings controls should call it rather than reading `recipe.defaultServings` directly.

---

## Self-review

(Filled by the planner before handing off — kept in the file so the executor can confirm coverage.)

**Spec coverage:**
- Widen `users.default_servings` + make "never set" representable — Tasks 1, 2.
- `User` entity to `BigDecimal` with no initialiser — Task 3.
- Carry the value through `UserPrincipal` → `UserDTO` onto `/api/auth/me` and `/api/auth/login` — Tasks 4, 5, 6.
- Route `AuthController` through `UserService.convertToDTO` — Task 6 (test repair in Task 7).
- `PATCH /api/users/me/preferences` with 0.25–20.00 validation and null-clears — Task 8.
- Preference tier in `MealPlanService.resolveServings` (AC 5) — Task 9.
- `resolveStartingServings` + `.check.mjs` (AC 4, 6, 9) — Task 10.
- `userService.js` — Task 11.
- `AuthContext` exposes `defaultServings` + `saveDefaultServings` (AC 3) — Task 12.
- `DefaultPortionsControl` reusing `MIN_SERVINGS`/`MAX_SERVINGS` (AC 2) — Task 13.
- Control above Sign Out in the account menu; guests excluded (AC 1) — Task 14.
- `RecipeCard` seeds from the helper; modal inherits (AC 4) — Task 15.
- Optimistic meal-plan row mirrors the backend order — Task 16.
- AC 7 (scaling basis unchanged) — enforced by Task 15 Step 2 and Task 17.
- AC 8 (existing entries untouched) — enforced by omission: no task writes to `meal_plan_entries`.
- AC 10 (controls stay editable) — Task 9's `assignRecipe_whenServingsProvided_beatsTheUserPreference`, plus Task 15 leaving `handleServingsChange` / `adjustServings` untouched.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or a runnable command with an expected result.

**Type / name consistency:** `defaultServings` is the identifier across `users.default_servings` (DB) → `User.defaultServings` (`BigDecimal`) → `UserPrincipal.defaultServings` → `UserDTO.defaultServings` → JSON `defaultServings` → `AuthContext.defaultServings` → `userDefaultServings` (local alias in `RecipeCard` and `MealPlanContext`, where `recipe.defaultServings` is also in scope and would otherwise shadow). `resolveStartingServings` is spelled identically in Tasks 10, 15, 16 and 17. `updateDefaultServings` matches between Tasks 8's service method and its test. The endpoint is `/api/users/me/preferences` in Tasks 8 and 11 and in `plan.md` → Data shapes. `UserPreferencesUpdateRequest` matches Task 8 and `plan.md`. The migration filename `2026-08-09_user_default_servings_preference.sql` matches Tasks 1, 2 and 20.

**Phase boundary cleanliness:**
- Phase 1 — SQL only, no Java touched; build green either side of the developer's manual apply.
- Phase 2 — ends with entity, principal, DTO, endpoint and the repaired `AuthControllerLoginTest` all consistent; the preference is readable and writable end-to-end. Task 5 Step 3 deliberately expects a compile failure *mid-phase*, resolved by Task 6 before the phase closes — the boundary itself is green.
- Phase 3 — `MealPlanService` and its test move together; backend fully done and deployable.
- Phase 4 — adds a pure function and its check file; nothing imports it yet, so no behaviour changes and the build is green.
- Phase 5 — control saves and reloads correctly; recipe cards still behave exactly as today, so a stop here shows a working preference with no effect rather than a broken one.
- Phase 6 — both consumers wired in one phase, so the starting value and the optimistic row can never disagree across a boundary.
- Phase 7 — verification only, no production changes.
