# Tasks: Pet page (Phase 1, mood only): Mochi replaces the Search tab

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: IN PROGRESS
Started: 2026-10-12

**Goal:** Replace the Search tab with a Pet tab (live mini Mochi face + pet name), delete recipe search, and add a `/pet` page whose Content/Happy/Bored/Mischievous mood is derived in the browser from yesterday's and today's Breakfast/Lunch/Dinner entries, MPP-12 eaten ticks and the plan owner's MPP-13 meal times, with the name stored once on the plan owner's `users` row.

**Spec:** `plan.md` in this folder.

**Baseline:** this contract builds on the **uncommitted** MPP-12 and MPP-13 working-tree changes (`MealEatenSection`, `useEntryEaten`, `MealTimesPolicy`, `MealTimesDTO`, the two 2026-10-12 migrations). Do not revert or stash them.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-12-mpp14-user-pet-name.sql` — adds `users.pet_name VARCHAR(12) NULL`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetPolicy.java` — default name, length rule, `normalise`, `toDTO`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetDTO.java` — `{name, customName, mealTimes}`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetNameRequest.java` — `{name}` + trimmed-length `@AssertTrue`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetService.java` — owner-resolved read + rename
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetController.java` — `GET /api/pet`, `PUT /api/pet/name`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetControllerTest.java`
- `foodbytes-app/client/src/constants/pet.js` — mood keys/labels, counted meal types, slot statuses, limits, guest copy
- `foodbytes-app/client/src/utils/petMood.js` — `derivePetMood`, `petBubble`, `petChipLabel`
- `foodbytes-app/client/src/utils/petMood.check.mjs` — node assert script for the mood rules
- `foodbytes-app/client/src/services/petService.js` — `getPet`, `renamePet`
- `foodbytes-app/client/src/hooks/useMinuteClock.js` — ticking `Date`
- `foodbytes-app/client/src/contexts/PetContext.jsx` — `PetProvider`, `usePet`
- `foodbytes-app/client/src/components/pet/MochiPet.jsx` + `MochiPet.css` — the Mochi SVG (full + mini) and animations
- `foodbytes-app/client/src/components/pet/mochiParts.jsx` — per-mood faces and props
- `foodbytes-app/client/src/components/pet/PetMealsCard.jsx` — "Today's meals" card
- `foodbytes-app/client/src/components/pet/PetNameEditor.jsx` — inline rename
- `foodbytes-app/client/src/components/pet/PetView.jsx` + `PetView.css` — the Pet page
- `foodbytes-app/client/src/components/pet/PetReaction.jsx` + `PetReaction.css` — reaction under the eaten button

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/User.java` — `petName` field
- `foodbytes-app/client/package.json` — `check:pet` script; version bump (Task 20)
- `foodbytes-app/client/src/services/mealPlanService.js` — `getWeekPlan(startDate, { signal })`
- `foodbytes-app/client/src/main.jsx` — mount `PetProvider` inside `MealPlanProvider`
- `foodbytes-app/client/src/App.jsx` — drop `/search` + `SearchView`, add `/pet`
- `foodbytes-app/client/src/components/layout/Footer.jsx` — Search button → Pet button
- `foodbytes-app/client/src/components/layout/Footer.css` — mini-face sizing, label ellipsis, hover behind `(hover: hover)`
- `foodbytes-app/client/src/components/recipes/MealEatenSection.jsx` — render `PetReaction`
- `CLAUDE.md` — routes list no longer names `/search`
- `.claude/skills/react-frontend/SKILL.md` — routes line no longer names `/search`
- `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump (Task 20)

**Deleted:**
- `foodbytes-app/client/src/components/recipes/SearchView.jsx`
- `foodbytes-app/client/src/components/recipes/SearchView.css`

---

## Phase 1 — Schema

Adds the one nullable column and gets it, plus the outstanding MPP-12/MPP-13 columns, onto Railway before any Java type references it. Adding a nullable column is invisible to the running backend (`validate` ignores unmapped columns), so this boundary is safe even if the phase stops here.

### Task 1: Write the pet-name migration and apply it locally ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-12-mpp14-user-pet-name.sql`

- [x] **Step 1: Write the migration**

```sql
-- MPP-14: the pet's name, stored once per meal plan on the OWNER's users row.
--
-- What: adds users.pet_name VARCHAR(12) NULL. NULL means "use the default name"
-- (PetPolicy.DEFAULT_NAME = "Pip"); a linked user's own column stays NULL and is
-- never read — PetService resolves meal_plan_owner_id first.
--
-- Why it is lossless: a new nullable column with no default and no backfill. Live
-- Railway had 13 users on 2026-10-12 (2 linked, 2 distinct owners); every one reads
-- as "Pip" until renamed.
--
-- No AFTER clause on purpose, so this does not depend on the MPP-13 meal-time
-- columns being present.
--
-- MUST be applied to the Railway MySQL BEFORE the backend that maps User.petName
-- deploys (Hibernate ddl-auto: validate). Apply order on Railway when shipping
-- MPP-12/13/14 together:
--   1. 2026-10-12-mpp12-meal-plan-entry-eaten.sql
--   2. 2026-10-12-mpp13-user-meal-times.sql
--   3. 2026-10-12-mpp14-user-pet-name.sql   (this file)
-- Safe to apply while the current backend is running.

ALTER TABLE users
  ADD COLUMN pet_name VARCHAR(12) NULL DEFAULT NULL;
```

- [x] **Step 2: Apply it to the local Docker DB**

Run: `Get-Content foodbytes-app\database\migrations\2026-10-12-mpp14-user-pet-name.sql | docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes`
Expected: no output other than the password warning.

- [x] **Step 3: Verify locally**

Run: `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SHOW COLUMNS FROM users LIKE 'pet_name'"`
Expected: one row, `pet_name | varchar(12) | YES | | NULL |`.

### Task 2: Developer applies the three migrations to Railway

- Skill: none — DBA operation against the live Railway MySQL

**Files:**
- (none in the repo — copies only)

- [x] **Step 1: Copy the three migration files to Downloads for the developer**

Run: `Copy-Item foodbytes-app\database\migrations\2026-10-12-mpp12-meal-plan-entry-eaten.sql, foodbytes-app\database\migrations\2026-10-12-mpp13-user-meal-times.sql, foodbytes-app\database\migrations\2026-10-12-mpp14-user-pet-name.sql -Destination $env:USERPROFILE\Downloads`
Expected: the three files exist in `Downloads`.

- [x] **Step 2: Developer runs them against Railway, in this order**

Tell the developer, verbatim: "Apply these to the Railway MySQL in order — `2026-10-12-mpp12-meal-plan-entry-eaten.sql`, then `2026-10-12-mpp13-user-meal-times.sql`, then `2026-10-12-mpp14-user-pet-name.sql`. All three are safe while the current backend runs. Reply when done." Wait for the reply. Do **not** run any write against the live DB from the agent.

- [x] **Step 3: Verify read-only**

Run (mysql MCP): `SHOW COLUMNS FROM users WHERE Field IN ('breakfast_by','lunch_by','dinner_by','pet_name')`
Expected: 4 rows; `pet_name varchar(12) YES NULL`.

Run (mysql MCP): `SHOW COLUMNS FROM meal_plan_entries WHERE Field IN ('eaten','eaten_at')`
Expected: 2 rows.

If any row is missing, stop and flag the card (blocked) — later backend phases must not ship without it.

---

## Phase 2 — Backend pet endpoint

Maps the column, adds the policy/DTOs, then the owner-resolved service and thin controller, each with tests. The build and the existing suite stay green at the end; nothing on the frontend calls the endpoint yet.

### Task 3: Map `User.petName`

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/User.java` (after the `dinnerBy` field)

- [ ] **Step 1: Add the field**

Insert directly after `private LocalTime dinnerBy;`:

```java

    /**
     * MPP-14: the pet's name, stored on the meal-plan OWNER's row only (a linked
     * user's own column stays NULL and is never read). NULL means "use the
     * default" (PetPolicy.DEFAULT_NAME) — no initialiser, same reason as
     * defaultServings.
     */
    @Column(name = "pet_name", length = 12)
    private String petName;
```

- [ ] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, 0 errors.

### Task 4: Add `PetDTO` and `PetPolicy`

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetDTO.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetPolicy.java`

- [ ] **Step 1: Write `PetDTO`**

```java
package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MPP-14: the plan's pet. Always describes the meal-plan OWNER's pet, so two
 * linked users see the same name and the owner's meal times (AC 8).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetDTO {
    private String name;              // effective name, never null ("Pip" by default)
    private boolean customName;       // true when the owner has saved a name
    private MealTimesDTO mealTimes;   // the OWNER's effective meal times (MPP-13 shape)
}
```

- [ ] **Step 2: Write `PetPolicy`**

```java
package com.foodbytes.service;

import com.foodbytes.dto.PetDTO;
import com.foodbytes.model.User;

/**
 * MPP-14: the single backend owner of the pet's default name and name rule. The
 * default lives ONLY here — the server always sends the effective name plus a
 * customName flag, so the frontend has no copy to drift from (the MPP-13
 * MealTimesPolicy pattern). MAX_NAME_LENGTH is mirrored as PET_NAME_MAX_LENGTH in
 * client/src/constants/pet.js; keep them in sync.
 *
 * NAME_LENGTH_ERROR is a compile-time constant so PetNameRequest can use it in an
 * annotation.
 */
public final class PetPolicy {

    public static final String DEFAULT_NAME = "Pip";
    public static final int MAX_NAME_LENGTH = 12;
    public static final String NAME_LENGTH_ERROR = "Pet name must be 12 characters or fewer";

    private PetPolicy() {
    }

    /** Trimmed name, or null for null/blank — null means "back to the default". */
    public static String normalise(String name) {
        if (name == null) {
            return null;
        }
        String trimmed = name.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public static PetDTO toDTO(User owner) {
        String saved = owner.getPetName();
        return new PetDTO(
                saved != null ? saved : DEFAULT_NAME,
                saved != null,
                MealTimesPolicy.effective(owner));
    }
}
```

- [ ] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 5: Add `PetNameRequest`

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetNameRequest.java`

- [ ] **Step 1: Write the request DTO**

```java
package com.foodbytes.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.foodbytes.service.PetPolicy;
import jakarta.validation.constraints.AssertTrue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MPP-14: rename the plan's pet. A null or blank name resets it to the default.
 * The length rule is checked on the TRIMMED name, so "  Pip  " is fine; @Size on
 * the raw string would reject padding the service is about to strip anyway.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetNameRequest {

    private String name;

    @JsonIgnore
    @AssertTrue(message = PetPolicy.NAME_LENGTH_ERROR)
    public boolean isWithinLengthLimit() {
        String normalised = PetPolicy.normalise(name);
        return normalised == null || normalised.length() <= PetPolicy.MAX_NAME_LENGTH;
    }
}
```

- [ ] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 6: Add `PetService` (owner-resolved read + rename)

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java`

- [ ] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.dto.PetDTO;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * MPP-14: one pet per meal plan, belonging to the owner (AC 8). A linked user
 * reads and renames the OWNER's pet, and the pet carries the owner's meal times.
 */
@ExtendWith(MockitoExtension.class)
class PetServiceTest {

    @Mock private UserRepository userRepository;
    @InjectMocks private PetService petService;

    private static final Long OWNER_ID = 1L;
    private static final Long LINKED_ID = 2L;
    private User owner;
    private User linked;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(OWNER_ID);
        linked = new User();
        linked.setId(LINKED_ID);
        linked.setMealPlanOwnerId(OWNER_ID);
    }

    private void stubSave() {
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void getPet_unlinkedUserWithNoName_returnsPipAndDefaultTimes() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));

        PetDTO pet = petService.getPet(OWNER_ID);

        assertThat(pet.getName()).isEqualTo("Pip");
        assertThat(pet.isCustomName()).isFalse();
        assertThat(pet.getMealTimes().getLunchBy()).isEqualTo("15:00");
    }

    @Test
    void getPet_linkedUser_returnsOwnersNameAndOwnersMealTimes() {
        owner.setPetName("Mochi");
        owner.setBreakfastBy(LocalTime.of(8, 0));
        owner.setLunchBy(LocalTime.of(12, 30));
        owner.setDinnerBy(LocalTime.of(19, 0));
        linked.setLunchBy(LocalTime.of(14, 0));   // linked user's own times must be ignored
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));

        PetDTO pet = petService.getPet(LINKED_ID);

        assertThat(pet.getName()).isEqualTo("Mochi");
        assertThat(pet.isCustomName()).isTrue();
        assertThat(pet.getMealTimes().getLunchBy()).isEqualTo("12:30");
    }

    @Test
    void renamePet_byLinkedUser_writesTheOwnersRow() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        stubSave();

        PetDTO pet = petService.renamePet(LINKED_ID, "Bao");

        assertThat(owner.getPetName()).isEqualTo("Bao");
        assertThat(linked.getPetName()).isNull();
        assertThat(pet.getName()).isEqualTo("Bao");
    }

    @Test
    void renamePet_trimsTheName() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        stubSave();

        petService.renamePet(OWNER_ID, "  Bao  ");

        assertThat(owner.getPetName()).isEqualTo("Bao");
    }

    @Test
    void renamePet_blank_resetsToTheDefault() {
        owner.setPetName("Bao");
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        stubSave();

        PetDTO pet = petService.renamePet(OWNER_ID, "   ");

        assertThat(owner.getPetName()).isNull();
        assertThat(pet.getName()).isEqualTo("Pip");
        assertThat(pet.isCustomName()).isFalse();
    }

    @Test
    void getPet_whenOwnerRowMissing_throws() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> petService.getPet(LINKED_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found: " + OWNER_ID);
    }
}
```

- [ ] **Step 2: Run it — expect a compile failure**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest`
Expected: `COMPILATION ERROR` — `cannot find symbol: class PetService`.

- [ ] **Step 3: Implement `PetService`**

```java
package com.foodbytes.service;

import com.foodbytes.dto.PetDTO;
import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * MPP-14: the plan's pet. Every read and write goes to the meal-plan OWNER's row
 * (users.meal_plan_owner_id, else the caller), so linked users share one pet,
 * one name and the owner's meal times (AC 8).
 */
@Service
@RequiredArgsConstructor
public class PetService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PetDTO getPet(Long userId) {
        return PetPolicy.toDTO(resolveOwner(userId));
    }

    /** Either linked user may rename; null/blank resets to the default name. */
    @Transactional
    public PetDTO renamePet(Long userId, String name) {
        User owner = resolveOwner(userId);
        owner.setPetName(PetPolicy.normalise(name));
        return PetPolicy.toDTO(userRepository.save(owner));
    }

    // Same rule as MealPlanService.getEffectiveMealPlanOwnerId (one of several private
    // copies — consolidating them is out of scope for MPP-14).
    private User resolveOwner(Long userId) {
        User user = findUser(userId);
        return user.getMealPlanOwnerId() != null ? findUser(user.getMealPlanOwnerId()) : user;
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }
}
```

- [ ] **Step 4: Run it — expect green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest`
Expected: `Tests run: 6, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

### Task 7: Add `PetController`

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetController.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetControllerTest.java`

- [ ] **Step 1: Write the failing test**

```java
package com.foodbytes.controller;

import com.foodbytes.service.PetService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * MPP-14: a too-long pet name is rejected with a 400 carrying the message the
 * frontend shows; the length is checked after trimming; no principal → 401.
 */
@WebMvcTest(PetController.class)
@AutoConfigureMockMvc(addFilters = false)
class PetControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private PetService petService;

    @Test
    void tooLongName_returns400_withLengthMessage() throws Exception {
        mockMvc.perform(put("/api/pet/name")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Thirteen chars\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Pet name must be 12 characters or fewer"));
        verifyNoInteractions(petService);
    }

    @Test
    void paddedTwelveCharName_passesValidation_thenNeedsAPrincipal() throws Exception {
        mockMvc.perform(put("/api/pet/name")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"   Twelve chars   \"}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(petService);
    }

    @Test
    void getPet_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(get("/api/pet"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        verifyNoInteractions(petService);
    }
}
```

(`"Twelve chars"` is exactly 12 characters; `"Thirteen chars"` is 14.)

- [ ] **Step 2: Run it — expect a compile failure**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetControllerTest`
Expected: `COMPILATION ERROR` — `cannot find symbol: class PetController`.

- [ ] **Step 3: Implement `PetController`**

```java
package com.foodbytes.controller;

import com.foodbytes.dto.PetNameRequest;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * MPP-14: the plan's pet — always the meal-plan owner's (see PetService).
 */
@RestController
@RequestMapping("/api/pet")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;

    @GetMapping
    public ResponseEntity<?> getPet(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(petService.getPet(userPrincipal.getId()));
    }

    @PutMapping("/name")
    public ResponseEntity<?> renamePet(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PetNameRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(petService.renamePet(userPrincipal.getId(), request.getName()));
    }

    /** No @ControllerAdvice in this codebase — same {error} shape as UserController. */
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

- [ ] **Step 4: Run it — expect green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetControllerTest`
Expected: `Tests run: 3, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

---

## Phase 3 — Frontend foundations

Pure helpers, services, the clock hook and `PetContext`, mounted in `main.jsx` but not yet rendered by any component. The build is green and the app behaves exactly as before at the end of this phase (one extra pair of reads after sign-in).

### Task 8: Add `constants/pet.js`

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/pet.js`

- [ ] **Step 1: Write the constants**

```js
/**
 * MPP-14: the plan's pet (Mochi). The default NAME deliberately does not live here:
 * the server always sends the effective name (PetPolicy.DEFAULT_NAME), so there is
 * no frontend copy to drift. Guests have no pet and see PET_GUEST_TAB_LABEL.
 */
export const PET_MOODS = {
  CONTENT: 'content',
  HAPPY: 'happy',
  BORED: 'bored',
  MISCHIEVOUS: 'mischievous'
}

export const PET_MOOD_LABELS = {
  content: 'Content',
  happy: 'Happy',
  bored: 'Bored',
  mischievous: 'Mischievous'
}

// AC 6: only these meal types count; snacks and extras never move the mood.
export const PET_COUNTED_MEAL_TYPES = ['breakfast', 'lunch', 'dinner']

// Meal type → key in PetDTO.mealTimes (MPP-13 shape).
export const PET_MEAL_TIME_KEY = {
  breakfast: 'breakfastBy',
  lunch: 'lunchBy',
  dinner: 'dinnerBy'
}

export const PET_SLOT_STATUS = {
  LOGGED: 'logged',
  DUE: 'due',
  UPCOMING: 'upcoming',
  UNPLANNED: 'unplanned'
}

// Mirrors PetPolicy.MAX_NAME_LENGTH on the backend — keep in sync.
export const PET_NAME_MAX_LENGTH = 12

export const PET_GUEST_TAB_LABEL = 'Pet'
export const PET_GUEST_MESSAGE = 'Sign in to meet your pet!'

export const PET_CLOCK_TICK_MS = 60_000
```

- [ ] **Step 2: Smoke-check it loads in node**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {PET_COUNTED_MEAL_TYPES} from './src/constants/pet.js'; console.log(PET_COUNTED_MEAL_TYPES.join(','))"`
Expected: `breakfast,lunch,dinner`

### Task 9: Add `utils/petMood.js` with its check script

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/petMood.check.mjs`
- Create: `foodbytes-app/client/src/utils/petMood.js`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [ ] **Step 1: Write the check script first**

```js
// Run: npm run check:pet   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-14 mood rules
// (AC 6, AC 7) are pinned here. Mirrors mealTimesUtils.check.mjs.
import assert from 'node:assert/strict'
import { derivePetMood, petBubble, petChipLabel } from './petMood.js'

const TIMES = { breakfastBy: '11:00', lunchBy: '15:00', dinnerBy: '21:00', custom: false }
const YESTERDAY = '2026-10-12'
const TODAY = '2026-10-13'
const at = (date, hhmm) => {
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = hhmm.split(':').map(Number)
  return new Date(y, m - 1, d, h, min)
}
const entry = (eatenAt = null) => ({ eaten: eatenAt !== null, eatenAt: eatenAt?.toISOString() ?? null })
const day = (date, meals) => ({ date, mealsByType: meals })
const mood = (yesterday, today, now) => derivePetMood({ yesterday, today, mealTimes: TIMES, now })

// Not ready: no meal times or no today → Content, nothing else.
assert.equal(derivePetMood({ yesterday: null, today: null, mealTimes: null, now: at(TODAY, '09:00') }).mood, 'content')

// Content: nothing due, nothing logged today (yesterday all logged doesn't make him Happy).
const yAllLogged = day(YESTERDAY, {
  breakfast: [entry(at(YESTERDAY, '09:00'))], lunch: [entry(at(YESTERDAY, '13:00'))], dinner: [entry(at(YESTERDAY, '20:00'))]
})
const tPlanned = day(TODAY, { breakfast: [entry()], lunch: [entry()], dinner: [entry()] })
let r = mood(yAllLogged, tPlanned, at(TODAY, '09:00'))
assert.equal(r.mood, 'content')
assert.equal(r.dueCount, 0)
assert.deepEqual(r.todaySlots.map(s => s.status), ['upcoming', 'upcoming', 'upcoming'])
assert.equal(r.todaySlots[1].byTime, '15:00')

// Happy: breakfast logged today, nothing due.
const tBreakfastLogged = day(TODAY, { breakfast: [entry(at(TODAY, '08:30'))], lunch: [entry()], dinner: [entry()] })
r = mood(yAllLogged, tBreakfastLogged, at(TODAY, '12:00'))
assert.equal(r.mood, 'happy')
assert.equal(r.lastLoggedType, 'breakfast')

// Bored: lunch's time has passed and it isn't ticked.
r = mood(yAllLogged, tBreakfastLogged, at(TODAY, '15:01'))
assert.equal(r.mood, 'bored')
assert.equal(r.dueCount, 1)
assert.equal(r.dueMealType, 'lunch')
assert.equal(r.todaySlots[1].status, 'due')

// Exactly at the "by" time is not yet passed.
assert.equal(mood(yAllLogged, tBreakfastLogged, at(TODAY, '15:00')).mood, 'happy')

// Mischievous: 2+ due, counted across yesterday and today.
const yDinnerMissed = day(YESTERDAY, {
  breakfast: [entry(at(YESTERDAY, '09:00'))], lunch: [entry(at(YESTERDAY, '13:00'))], dinner: [entry()]
})
r = mood(yDinnerMissed, tPlanned, at(TODAY, '11:30'))
assert.equal(r.mood, 'mischievous')
assert.equal(r.dueCount, 2)
assert.equal(r.dueMealType, 'dinner')   // earliest due slot is yesterday's dinner

// AC 7: logging ANY one meal → Happy immediately, even with another still due...
const tBreakfastJustLogged = day(TODAY, { breakfast: [entry(at(TODAY, '11:40'))], lunch: [entry()], dinner: [entry()] })
r = mood(yDinnerMissed, tBreakfastJustLogged, at(TODAY, '11:41'))
assert.equal(r.mood, 'happy')
assert.equal(r.dueCount, 1)
// ...until the next meal time passes: yesterday's dinner + today's lunch → Mischievous.
assert.equal(mood(yDinnerMissed, tBreakfastJustLogged, at(TODAY, '15:01')).mood, 'mischievous')

// Per slot: two unticked lunch recipes are ONE due meal; one ticked recipe logs the slot.
const tTwoLunches = day(TODAY, { breakfast: [entry(at(TODAY, '08:00'))], lunch: [entry(), entry()] })
assert.equal(mood(null, tTwoLunches, at(TODAY, '16:00')).dueCount, 1)
const tOneOfTwoTicked = day(TODAY, { lunch: [entry(), entry(at(TODAY, '13:00'))] })
assert.equal(mood(null, tOneOfTwoTicked, at(TODAY, '16:00')).todaySlots[1].status, 'logged')

// Snacks and extras never count; unplanned slots are never due.
const tSnacksOnly = day(TODAY, { snacks: [entry()], extras: [entry()] })
r = mood(null, tSnacksOnly, at(TODAY, '22:00'))
assert.equal(r.mood, 'content')
assert.deepEqual(r.todaySlots.map(s => s.status), ['unplanned', 'unplanned', 'unplanned'])

// Custom (owner's) meal times are honoured.
const early = { breakfastBy: '08:00', lunchBy: '12:00', dinnerBy: '18:00', custom: true }
assert.equal(derivePetMood({ yesterday: null, today: tPlanned, mealTimes: early, now: at(TODAY, '08:01') }).mood, 'bored')

// Copy.
assert.equal(petBubble({ mood: 'content' }), 'Nothing due yet. Just vibing.')
assert.equal(petBubble({ mood: 'happy', lastLoggedType: 'lunch' }), 'Lunch logged! Nap time.')
assert.equal(petBubble({ mood: 'happy', lastLoggedType: null }), 'All caught up! Nap time.')
assert.equal(petBubble({ mood: 'bored', dueMealType: 'lunch' }), "Did lunch happen? I'm getting bored...")
assert.equal(petBubble({ mood: 'mischievous' }), "I didn't touch the takeaway. Log a meal and it never happened.")
assert.equal(petChipLabel({ mood: 'happy', dueCount: 0 }), 'Happy')
assert.equal(petChipLabel({ mood: 'bored', dueCount: 1 }), 'Bored · 1 unlogged')
assert.equal(petChipLabel({ mood: 'mischievous', dueCount: 3 }), 'Mischievous · 3 unlogged')

console.log('petMood: all checks passed')
```

- [ ] **Step 2: Add the npm script**

In `foodbytes-app/client/package.json` → `scripts`, after `"check:macros": …,` add:

```json
    "check:pet": "node src/utils/petMood.check.mjs",
```

- [ ] **Step 3: Run it — expect failure**

Run: `cd foodbytes-app\client; npm run check:pet`
Expected: fails with `ERR_MODULE_NOT_FOUND` for `petMood.js`.

- [ ] **Step 4: Implement `petMood.js`**

```js
import { MEAL_TYPE_LABELS } from '../constants/mealTypes.js'
import {
  PET_MOODS,
  PET_MOOD_LABELS,
  PET_COUNTED_MEAL_TYPES,
  PET_MEAL_TIME_KEY,
  PET_SLOT_STATUS
} from '../constants/pet.js'

const NOT_READY = { mood: PET_MOODS.CONTENT, dueCount: 0, todaySlots: [], lastLoggedType: null, dueMealType: null }

/**
 * MPP-14 AC 6/7: the pet's mood, derived from data both linked users share — so both
 * devices agree and a reload changes nothing.
 *
 * Counted per meal SLOT (date × breakfast/lunch/dinner): a slot is logged when any of
 * its entries is eaten, and due when it is planned, nothing in it is eaten and its "by"
 * time (the plan owner's) has passed. Due slots are counted over yesterday + today;
 * "logged" (Content vs Happy) over today only.
 *
 * AC 7 "logging any one meal returns the pet to Happy immediately": if the latest log
 * came after the latest due moment, the pet is Happy; he only turns Bored/Mischievous
 * again when another meal time passes.
 *
 * @param {{ yesterday: Object|null, today: Object|null, mealTimes: Object|null, now: Date }} input
 *   yesterday/today are MealPlanDayDTOs; mealTimes is PetDTO.mealTimes.
 */
export function derivePetMood({ yesterday, today, mealTimes, now }) {
  if (!mealTimes || !today) return NOT_READY

  const slots = [
    ...buildSlots(yesterday, mealTimes, now, false),
    ...buildSlots(today, mealTimes, now, true)
  ]
  const due = slots.filter(slot => slot.status === PET_SLOT_STATUS.DUE)
  const logged = slots.filter(slot => slot.status === PET_SLOT_STATUS.LOGGED)
  const latestLog = logged.reduce((latest, slot) => (latest && latest.eatenAt >= slot.eatenAt ? latest : slot), null)
  const latestDueAt = due.reduce((max, slot) => Math.max(max, slot.dueAt), -Infinity)

  return {
    mood: pickMood({ dueCount: due.length, latestLog, latestDueAt, loggedToday: logged.some(slot => slot.isToday) }),
    dueCount: due.length,
    todaySlots: slots
      .filter(slot => slot.isToday)
      .map(({ mealType, status, byTime }) => ({ mealType, status, byTime })),
    lastLoggedType: latestLog?.mealType ?? null,
    dueMealType: due[0]?.mealType ?? null
  }
}

/** Speech-bubble copy. Mischief is boredom, never health or food guilt (AC 9). */
export function petBubble({ mood, lastLoggedType, dueMealType }) {
  switch (mood) {
    case PET_MOODS.HAPPY:
      return lastLoggedType ? `${MEAL_TYPE_LABELS[lastLoggedType]} logged! Nap time.` : 'All caught up! Nap time.'
    case PET_MOODS.BORED:
      return `Did ${MEAL_TYPE_LABELS[dueMealType].toLowerCase()} happen? I'm getting bored...`
    case PET_MOODS.MISCHIEVOUS:
      return "I didn't touch the takeaway. Log a meal and it never happened."
    default:
      return 'Nothing due yet. Just vibing.'
  }
}

export function petChipLabel({ mood, dueCount }) {
  const label = PET_MOOD_LABELS[mood]
  return mood === PET_MOODS.BORED || mood === PET_MOODS.MISCHIEVOUS ? `${label} · ${dueCount} unlogged` : label
}

// Slots come out in time order: yesterday B/L/D, then today B/L/D — so due[0] is the earliest.
function buildSlots(day, mealTimes, now, isToday) {
  if (!day) return []
  return PET_COUNTED_MEAL_TYPES.map(mealType => {
    const entries = day.mealsByType?.[mealType] ?? []
    const byTime = mealTimes[PET_MEAL_TIME_KEY[mealType]]
    const dueAt = atLocalTime(day.date, byTime)
    const eatenTimes = entries.filter(e => e.eaten === true).map(e => (e.eatenAt ? Date.parse(e.eatenAt) : 0))
    return {
      mealType,
      byTime,
      dueAt,
      isToday,
      eatenAt: eatenTimes.length > 0 ? Math.max(...eatenTimes) : null,
      status: slotStatus(entries.length, eatenTimes.length, dueAt, now)
    }
  })
}

function slotStatus(plannedCount, eatenCount, dueAt, now) {
  if (plannedCount === 0) return PET_SLOT_STATUS.UNPLANNED
  if (eatenCount > 0) return PET_SLOT_STATUS.LOGGED
  return now.getTime() > dueAt ? PET_SLOT_STATUS.DUE : PET_SLOT_STATUS.UPCOMING
}

function pickMood({ dueCount, latestLog, latestDueAt, loggedToday }) {
  if (dueCount > 0 && latestLog && latestLog.eatenAt > latestDueAt) return PET_MOODS.HAPPY
  if (dueCount >= 2) return PET_MOODS.MISCHIEVOUS
  if (dueCount === 1) return PET_MOODS.BORED
  return loggedToday ? PET_MOODS.HAPPY : PET_MOODS.CONTENT
}

// "YYYY-MM-DD" + "HH:mm" in the device's local time, as epoch ms.
function atLocalTime(isoDate, hhmm) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const [hour, minute] = hhmm.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute).getTime()
}
```

- [ ] **Step 5: Run it — expect green**

Run: `cd foodbytes-app\client; npm run check:pet`
Expected: `petMood: all checks passed`

### Task 10: Add `petService` and a cancellable `getWeekPlan`

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/services/petService.js`
- Modify: `foodbytes-app/client/src/services/mealPlanService.js` (`getWeekPlan`, ~lines 8-16)

- [ ] **Step 1: Write `petService.js`**

```js
import api from './api'

/**
 * MPP-14: the plan's pet. Always the meal-plan OWNER's pet — a linked user reads and
 * renames the owner's — carrying the owner's effective meal times.
 */
export const petService = {
  /**
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<{ name: string, customName: boolean, mealTimes: Object }>} PetDTO
   */
  async getPet({ signal } = {}) {
    const response = await api.get('/pet', { signal })
    return response.data
  },

  /**
   * @param {string|null} name - null or blank resets to the default name
   * @returns {Promise<Object>} the updated PetDTO
   */
  async renamePet(name) {
    const response = await api.put('/pet/name', { name })
    return response.data
  }
}

export default petService
```

- [ ] **Step 2: Make `getWeekPlan` accept an abort signal**

Replace:

```js
   * @param {string} startDate - ISO format date string (YYYY-MM-DD)
   * @returns {Promise<Object>} MealPlanWeekDTO with 7 days
   */
  async getWeekPlan(startDate) {
    const response = await api.get(`/meal-plan?startDate=${startDate}`)
    return response.data
  },
```

with:

```js
   * @param {string} startDate - ISO format date string (YYYY-MM-DD)
   * @param {{ signal?: AbortSignal }} [options] - MPP-14: PetContext cancels stale reads
   * @returns {Promise<Object>} MealPlanWeekDTO with 7 days
   */
  async getWeekPlan(startDate, { signal } = {}) {
    const response = await api.get(`/meal-plan?startDate=${startDate}`, { signal })
    return response.data
  },
```

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 11: Add `useMinuteClock`

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useMinuteClock.js`

- [ ] **Step 1: Write the hook**

```js
import { useEffect, useState } from 'react'
import { PET_CLOCK_TICK_MS } from '../constants/pet'

/**
 * MPP-14: the current time, re-read every `tickMs` and whenever the tab becomes
 * visible again, so the pet's mood changes as meal times pass without a reload.
 * Background tabs throttle intervals; the visibility re-read covers that.
 */
export function useMinuteClock(tickMs = PET_CLOCK_TICK_MS) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') tick()
    }
    const intervalId = setInterval(tick, tickMs)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [tickMs])

  return now
}

export default useMinuteClock
```

- [ ] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 12: Add `PetContext` and mount it

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/contexts/PetContext.jsx`
- Modify: `foodbytes-app/client/src/main.jsx` (provider tree)

- [ ] **Step 1: Write `PetContext.jsx`**

```jsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { useMealPlan } from './MealPlanContext'
import petService from '../services/petService'
import mealPlanService from '../services/mealPlanService'
import useMinuteClock from '../hooks/useMinuteClock'
import { addDays, formatDateISO } from '../utils/dateUtils'
import { derivePetMood } from '../utils/petMood'

const LOAD_ERROR = "Couldn't load your pet."

const PetContext = createContext()

/**
 * MPP-14: the plan's pet — its name, the owner's meal times, and a mood derived on
 * every render from yesterday's and today's meals.
 *
 * Yesterday must exist even when the calendar's selected week starts today (or is a
 * different week), so this fetches its own 7 days from yesterday. For each of yesterday
 * and today it prefers MealPlanContext's live week when that week contains the day:
 * that copy carries MPP-12's optimistic eaten tick, so the mood flips the instant a meal
 * is logged (AC 7).
 *
 * Refetches on sign-in, local date rollover, a change of the calendar's week, retry(),
 * and the tab becoming visible again (picks up a partner's ticks). No polling.
 */
export const PetProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const { weekPlan, startDate } = useMealPlan()
  const now = useMinuteClock()
  const todayISO = formatDateISO(now)
  const yesterdayISO = formatDateISO(addDays(now, -1))

  const [pet, setPet] = useState(null)
  const [recentPlan, setRecentPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => setReloadKey(key => key + 1), [])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') retry()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [retry])

  useEffect(() => {
    if (!isAuthenticated) {
      setPet(null)
      setRecentPlan(null)
      setError(null)
      setLoading(false)
      return undefined
    }
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    Promise.all([
      petService.getPet({ signal: controller.signal }),
      mealPlanService.getWeekPlan(yesterdayISO, { signal: controller.signal })
    ])
      .then(([petData, plan]) => {
        setPet(petData)
        setRecentPlan(plan)
      })
      .catch(err => {
        if (!isCancelled(err)) setError(err.response?.data?.error || LOAD_ERROR)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [isAuthenticated, yesterdayISO, startDate, reloadKey])

  const renamePet = useCallback(async (name) => {
    const updated = await petService.renamePet(name)
    setPet(updated)
    return updated
  }, [])

  const pickDay = (iso) => findDay(weekPlan, iso) ?? findDay(recentPlan, iso)
  const moodInfo = derivePetMood({
    yesterday: pickDay(yesterdayISO),
    today: pickDay(todayISO),
    mealTimes: pet?.mealTimes ?? null,
    now
  })

  const value = {
    pet,
    petName: pet?.name ?? null,
    mood: moodInfo.mood,
    moodInfo,
    loading,
    error,
    retry,
    renamePet
  }

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>
}

export const usePet = () => {
  const context = useContext(PetContext)
  if (!context) {
    throw new Error('usePet must be used within a PetProvider')
  }
  return context
}

const findDay = (plan, iso) => plan?.days?.find(day => day.date === iso) ?? null

// Axios rejects an aborted request with code ERR_CANCELED; that is not an error to show.
const isCancelled = (err) => err?.code === 'ERR_CANCELED'

export default PetContext
```

- [ ] **Step 2: Mount `PetProvider` inside `MealPlanProvider`**

In `main.jsx`, add the import after the `MealPlanProvider` import:

```jsx
import { PetProvider } from './contexts/PetContext.jsx'
```

and replace:

```jsx
        <MealPlanProvider>
          <HomemadeSelectionsProvider>
            <ShoppingListProvider>
              <App />
            </ShoppingListProvider>
          </HomemadeSelectionsProvider>
        </MealPlanProvider>
```

with:

```jsx
        <MealPlanProvider>
          <PetProvider>
            <HomemadeSelectionsProvider>
              <ShoppingListProvider>
                <App />
              </ShoppingListProvider>
            </HomemadeSelectionsProvider>
          </PetProvider>
        </MealPlanProvider>
```

- [ ] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 4 — Mochi and the Pet UI

The visible feature: the SVG, the page, the footer swap with Search deleted, the reaction in the eaten section, and the docs that named `/search`. Each task leaves the build green; the footer swap and Search deletion happen in one task so there is never a dead route or a dangling import.

### Task 13: Add the `MochiPet` SVG component

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/mochiParts.jsx`
- Create: `foodbytes-app/client/src/components/pet/MochiPet.jsx`
- Create: `foodbytes-app/client/src/components/pet/MochiPet.css`

- [ ] **Step 1: Write `mochiParts.jsx` (faces and props ported from the approved mockup)**

```jsx
import { PET_MOODS } from '../../constants/pet'

// Approved pet-mockup.html (2026-10-12): Mochi, Lavender. Geometry is copied verbatim
// from the mockup's face()/props() so the shipped pet matches the mood sheet.
export const MOCHI_OUTLINE = '#3b2f5c'
export const MOCHI_FILL = '#cdbdf3'
export const MOCHI_SHADE = '#a993df'
const MOUTH = '#7a2e45'
const BLUSH = '#ff8fab'
const CRUMB = '#c98a3c'
const SWEAT = '#a8dcff'
const STAR = '#ffd34d'
const LINE = { stroke: MOCHI_OUTLINE, strokeWidth: 5, strokeLinecap: 'round', fill: 'none' }

/** Face for each mood. Only the face and props change — never the body (AC 9). */
export function MochiFace({ mood }) {
  switch (mood) {
    case PET_MOODS.HAPPY:
      return (
        <>
          <path d="M64 122 Q75 106 86 122" {...LINE} />
          <path d="M114 122 Q125 106 136 122" {...LINE} />
          <path d="M86 136 Q100 164 114 136 Z" fill={MOUTH} stroke={MOCHI_OUTLINE} strokeWidth="4" strokeLinejoin="round" />
          <ellipse cx="100" cy="150" rx="6" ry="4" fill={BLUSH} />
          <Blush opacity={0.75} />
        </>
      )
    case PET_MOODS.BORED:
      return (
        <>
          <path d="M66 120 A9 9 0 0 0 84 120 Z" fill={MOCHI_OUTLINE} />
          <path d="M116 120 A9 9 0 0 0 134 120 Z" fill={MOCHI_OUTLINE} />
          <path d="M63 119 L87 119" {...LINE} strokeWidth="4" />
          <path d="M113 119 L137 119" {...LINE} strokeWidth="4" />
          <path d="M92 146 L108 146" {...LINE} strokeWidth="4" />
          <Blush opacity={0.35} />
        </>
      )
    case PET_MOODS.MISCHIEVOUS:
      return (
        <>
          <Eye x={75} y={122} dx={5} />
          <Eye x={125} y={122} dx={5} />
          <path d="M63 110 Q75 108 87 102" {...LINE} strokeWidth="4.5" />
          <path d="M113 102 Q125 108 137 110" {...LINE} strokeWidth="4.5" />
          <path d="M86 142 Q95 152 104 143 Q110 138 116 145" {...LINE} strokeWidth="4" />
          <circle cx="120" cy="150" r="2.6" fill={CRUMB} />
          <circle cx="114" cy="155" r="1.8" fill={CRUMB} />
          <Blush opacity={0.5} />
          <path d="M160 82 C166 92 168 98 163 102 C158 105 153 100 156 93 Z" fill={SWEAT} stroke={MOCHI_OUTLINE} strokeWidth="2.5" />
        </>
      )
    default:
      return (
        <>
          <Eye x={75} y={120} />
          <Eye x={125} y={120} />
          <path d="M91 140 Q100 149 109 140" {...LINE} strokeWidth="4" />
          <Blush opacity={0.55} />
        </>
      )
  }
}

/** Scene props for the full-size pet: sparkles, thought bubble, takeaway box + crumbs. */
export function MochiProps({ mood }) {
  switch (mood) {
    case PET_MOODS.HAPPY:
      return (
        <>
          <Star x={30} y={70} r={10} delay={0} />
          <Star x={176} y={58} r={8} delay={0.5} />
          <Star x={186} y={112} r={6} delay={0.9} />
        </>
      )
    case PET_MOODS.BORED:
      return (
        <>
          <ellipse cx="178" cy="54" rx="26" ry="16" fill="#fff" stroke={MOCHI_OUTLINE} strokeWidth="3" />
          <circle cx="156" cy="78" r="5" fill="#fff" stroke={MOCHI_OUTLINE} strokeWidth="2.5" />
          <circle cx="167" cy="55" r="3" fill={MOCHI_OUTLINE} />
          <circle cx="178" cy="55" r="3" fill={MOCHI_OUTLINE} />
          <circle cx="189" cy="55" r="3" fill={MOCHI_OUTLINE} />
        </>
      )
    case PET_MOODS.MISCHIEVOUS:
      return (
        <>
          <g transform="translate(192 140)">
            <path d="M6 10 Q20 -14 34 10" fill="none" stroke={MOCHI_OUTLINE} strokeWidth="3" />
            <path d="M0 12 L40 12 L35 50 L5 50 Z" fill="#fff" stroke={MOCHI_OUTLINE} strokeWidth="4" strokeLinejoin="round" />
            <path d="M0 12 L-6 4 L12 6 Z M40 12 L46 4 L28 6 Z" fill="#fff" stroke={MOCHI_OUTLINE} strokeWidth="3" strokeLinejoin="round" />
            <rect x="9" y="24" width="22" height="10" rx="2" fill="#e8483f" />
            <path d="M16 12 Q18 0 24 -4 M22 12 Q26 2 30 0" stroke="#e8b04a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
          <circle cx="150" cy="194" r="3" fill={CRUMB} />
          <circle cx="166" cy="198" r="2.2" fill={CRUMB} />
          <circle cx="182" cy="193" r="2.6" fill={CRUMB} />
          <circle cx="40" cy="196" r="2.4" fill={CRUMB} />
          <circle cx="28" cy="191" r="1.8" fill={CRUMB} />
        </>
      )
    default:
      return null
  }
}

function Eye({ x, y, dx = 0 }) {
  return (
    <>
      <ellipse cx={x + dx} cy={y} rx="9" ry="11" fill={MOCHI_OUTLINE} />
      <circle cx={x + dx + 3} cy={y - 4} r="3.6" fill="#fff" />
      <circle cx={x + dx - 3} cy={y + 4} r="1.8" fill="#fff" />
    </>
  )
}

function Blush({ opacity }) {
  return (
    <>
      <ellipse cx="56" cy="140" rx="11" ry="6" fill={BLUSH} opacity={opacity} />
      <ellipse cx="144" cy="140" rx="11" ry="6" fill={BLUSH} opacity={opacity} />
    </>
  )
}

function Star({ x, y, r, delay }) {
  const d = `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`
  return <path className="mochi-sparkle" style={{ animationDelay: `${delay}s` }} d={d} fill={STAR} stroke={MOCHI_OUTLINE} strokeWidth="2" />
}
```

- [ ] **Step 2: Write `MochiPet.jsx`**

```jsx
import { useId } from 'react'
import { MochiFace, MochiProps, MOCHI_FILL, MOCHI_OUTLINE, MOCHI_SHADE } from './mochiParts'
import { PET_MOOD_LABELS } from '../../constants/pet'
import './MochiPet.css'

// The full pet leaves room for props around the body; the mini crops to the body only.
const VIEWBOX = { full: '-30 -6 270 214', mini: '12 4 176 186' }
const BODY_STROKE = { stroke: MOCHI_OUTLINE, strokeWidth: 5, strokeLinejoin: 'round' }

/**
 * MPP-14: Mochi, the approved kawaii lavender blob (AC 5). `full` is the Pet page
 * pet with scene props; `mini` is the decorative face used in the footer tab and the
 * eaten-section reaction. The body path is identical in every mood (AC 9).
 */
function MochiPet({ mood, variant = 'full', className = '' }) {
  // useId keeps the gradient id unique when several pets are on screen at once.
  const gradientId = `mochi-fill-${useId().replace(/:/g, '')}`
  const isFull = variant === 'full'
  const fill = `url(#${gradientId})`
  const a11y = isFull
    ? { role: 'img', 'aria-label': `Mochi, ${PET_MOOD_LABELS[mood]}` }
    : { 'aria-hidden': true, focusable: 'false' }

  return (
    <svg
      className={`mochi-pet mochi-pet--${variant} mochi-mood-${mood} ${className}`.trim()}
      viewBox={VIEWBOX[variant]}
      xmlns="http://www.w3.org/2000/svg"
      {...a11y}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MOCHI_FILL} />
          <stop offset="1" stopColor={MOCHI_SHADE} />
        </linearGradient>
      </defs>
      {isFull && <ellipse cx="100" cy="192" rx="66" ry="8" fill="rgba(40,20,80,.13)" />}
      <g className="mochi-anim">
        <ellipse cx="74" cy="180" rx="15" ry="8" fill={fill} {...BODY_STROKE} />
        <ellipse cx="126" cy="180" rx="15" ry="8" fill={fill} {...BODY_STROKE} />
        <path
          d="M100 48 C152 48 182 86 182 128 C182 166 148 182 100 182 C52 182 18 166 18 128 C18 86 48 48 100 48Z"
          fill={fill}
          {...BODY_STROKE}
        />
        <ellipse cx="66" cy="82" rx="16" ry="8" transform="rotate(-30 66 82)" fill="#fff" opacity=".45" />
        <MochiFace mood={mood} />
      </g>
      {isFull && <MochiProps mood={mood} />}
    </svg>
  )
}

export default MochiPet
```

- [ ] **Step 3: Write `MochiPet.css`**

```css
/* MPP-14: Mochi pet — animations ported from the approved pet-mockup.html.
   Each mood moves the whole body; the body shape itself never changes (AC 9). */

.mochi-pet {
  display: block;
  overflow: visible;
}

.mochi-anim {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}

.mochi-mood-content .mochi-anim { animation: mochi-bob 2.6s ease-in-out infinite; }
.mochi-mood-happy .mochi-anim { animation: mochi-bounce 1.1s ease-in-out infinite; }
.mochi-mood-bored .mochi-anim { animation: mochi-droop 4s ease-in-out infinite; }
.mochi-mood-mischievous .mochi-anim { animation: mochi-shuffle 1.6s ease-in-out infinite; }

.mochi-sparkle {
  animation: mochi-twinkle 1.4s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes mochi-bob {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  50% { transform: translateY(-5px) scale(0.98, 1.02); }
}

@keyframes mochi-bounce {
  0%, 100% { transform: translateY(0) scale(1.04, 0.96); }
  40% { transform: translateY(-16px) scale(0.96, 1.05); }
  70% { transform: translateY(0) scale(1.06, 0.94); }
}

@keyframes mochi-droop {
  0%, 100% { transform: rotate(-2deg) scale(1.02, 0.97); }
  50% { transform: rotate(2deg) scale(1.02, 0.97); }
}

@keyframes mochi-shuffle {
  0%, 100% { transform: translateX(0) rotate(0); }
  25% { transform: translateX(-4px) rotate(-3deg); }
  75% { transform: translateX(4px) rotate(3deg); }
}

@keyframes mochi-twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.6); }
  50% { opacity: 1; transform: scale(1); }
}

/* AC 5: animation stops when reduced motion is on. */
@media (prefers-reduced-motion: reduce) {
  .mochi-anim,
  .mochi-sparkle {
    animation: none !important;
  }
}
```

- [ ] **Step 4: Build and confirm no class collision**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.css | Select-String -Pattern "\.mochi-" | Where-Object { $_.Path -notmatch "MochiPet.css" }`
Expected: zero hits (Footer/PetReaction styles are added in later tasks).

### Task 14: Add `PetMealsCard`

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/PetMealsCard.jsx`

- [ ] **Step 1: Write the component** (styles live in `PetView.css`, Task 16)

```jsx
import { useNavigate } from 'react-router-dom'
import { MEAL_TYPE_LABELS } from '../../constants/mealTypes'
import { PET_SLOT_STATUS } from '../../constants/pet'

const STATUS_ICON = {
  [PET_SLOT_STATUS.LOGGED]: '✓',
  [PET_SLOT_STATUS.DUE]: '?',
  [PET_SLOT_STATUS.UPCOMING]: '·',
  [PET_SLOT_STATUS.UNPLANNED]: '–'
}

/**
 * MPP-14 AC 4: today's Breakfast / Lunch / Dinner. The tiles are deliberately not
 * interactive (logging happens in Meal Plan); the only action is the link button.
 */
function PetMealsCard({ slots }) {
  const navigate = useNavigate()

  return (
    <section className="pet-meals-card" aria-labelledby="pet-meals-heading">
      <h3 id="pet-meals-heading">Today's meals</h3>
      {slots.length === 0 ? (
        <p className="pet-meals-empty">Nothing to show for today yet.</p>
      ) : (
        <ul className="pet-meals">
          {slots.map(slot => (
            <li key={slot.mealType} className={`pet-meal pet-meal--${slot.status}`}>
              <b aria-hidden="true">{STATUS_ICON[slot.status]}</b>
              {MEAL_TYPE_LABELS[slot.mealType]}
              <small>{statusText(slot)}</small>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="pet-meals-link" onClick={() => navigate('/mealplan')}>
        Log meals in Meal Plan
      </button>
    </section>
  )
}

function statusText(slot) {
  switch (slot.status) {
    case PET_SLOT_STATUS.LOGGED: return 'Logged'
    case PET_SLOT_STATUS.DUE: return 'Not logged'
    case PET_SLOT_STATUS.UNPLANNED: return 'Not planned'
    default: return `By ${slot.byTime}`
  }
}

export default PetMealsCard
```

- [ ] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 15: Add `PetNameEditor`

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/PetNameEditor.jsx`

- [ ] **Step 1: Write the component** (styles live in `PetView.css`, Task 16)

```jsx
import { useRef, useState } from 'react'
import { PET_NAME_MAX_LENGTH } from '../../constants/pet'

const RENAME_ERROR = "Couldn't rename — try again."

/**
 * MPP-14 AC 8: either linked user can rename the plan's pet. Enter or blur saves,
 * Escape cancels. A blank name resets to the default (the server decides what that is).
 * A failed save reverts to the saved name and shows the server's message.
 */
function PetNameEditor({ name, onRename }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  // Escape unmounts the input; this stops the blur that may follow from saving.
  const skipBlurSave = useRef(false)

  const startEditing = () => {
    skipBlurSave.current = false
    setDraft(name)
    setError(null)
    setEditing(true)
  }

  const cancel = () => {
    skipBlurSave.current = true
    setDraft(name)
    setEditing(false)
  }

  const save = async () => {
    if (saving) return
    skipBlurSave.current = true
    const next = draft.trim()
    if (next === name) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onRename(next === '' ? null : next)
    } catch (err) {
      setDraft(name)
      setError(err.response?.data?.error || RENAME_ERROR)
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      save()
    } else if (event.key === 'Escape') {
      cancel()
    }
  }

  const onBlur = () => {
    if (!skipBlurSave.current) save()
  }

  return (
    <div className="pet-name-block">
      {editing ? (
        <input
          className="pet-name-input"
          value={draft}
          maxLength={PET_NAME_MAX_LENGTH}
          aria-label="Pet name"
          autoFocus
          disabled={saving}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        />
      ) : (
        <h2 className="pet-name">
          {name}
          <button
            type="button"
            className="pet-name-edit-btn"
            onClick={startEditing}
            aria-label={`Rename ${name}`}
          >
            <span aria-hidden="true">✎</span>
          </button>
        </h2>
      )}
      {error && <p className="pet-name-error" role="alert">{error}</p>}
    </div>
  )
}

export default PetNameEditor
```

- [ ] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 16: Add `PetView` and the `/pet` route

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/PetView.jsx`
- Create: `foodbytes-app/client/src/components/pet/PetView.css`
- Modify: `foodbytes-app/client/src/App.jsx` (imports + `<Routes>`)

- [ ] **Step 1: Write `PetView.jsx`**

```jsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePet } from '../../contexts/PetContext'
import MochiPet from './MochiPet'
import PetMealsCard from './PetMealsCard'
import PetNameEditor from './PetNameEditor'
import { PET_GUEST_MESSAGE } from '../../constants/pet'
import { petBubble, petChipLabel } from '../../utils/petMood'
import './PetView.css'

/**
 * MPP-14 AC 4: the Pet page — Mochi in its room, a speech bubble, the name, a mood
 * chip and today's meals. Guests get the sign-in prompt (AC 3) if they reach /pet
 * directly; the footer already stops them with a message.
 */
function PetView() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { pet, mood, moodInfo, error, retry, renamePet } = usePet()

  if (!isAuthenticated) {
    return (
      <div className="pet-view-state">
        <h2>{PET_GUEST_MESSAGE}</h2>
        <button type="button" className="pet-view-state-btn" onClick={() => navigate('/')}>
          Go to Recipes
        </button>
      </div>
    )
  }

  // A refetch error with a pet already loaded keeps showing the last good pet.
  if (!pet && error) {
    return (
      <div className="pet-view-state" role="alert">
        <p>{error}</p>
        <button type="button" className="pet-view-state-btn" onClick={retry}>
          Try again
        </button>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="pet-view-state" aria-busy="true">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="pet-view">
      <div className="pet-room">
        <div className="pet-room-window" aria-hidden="true" />
        <div className="pet-room-shelf" aria-hidden="true" />
        <div className="pet-room-jar" aria-hidden="true" />
        <div className="pet-room-jar pet-room-jar--small" aria-hidden="true" />
        <p className="pet-bubble" aria-live="polite">{petBubble(moodInfo)}</p>
        <div className="pet-stage">
          <MochiPet mood={mood} />
        </div>
      </div>

      <div className="pet-meta">
        <PetNameEditor name={pet.name} onRename={renamePet} />
        <span className={`pet-chip pet-chip--${mood}`}>{petChipLabel(moodInfo)}</span>
      </div>

      <PetMealsCard slots={moodInfo.todaySlots} />
    </div>
  )
}

export default PetView
```

- [ ] **Step 2: Write `PetView.css`** (mobile-first; tokens and colours from the approved mockup)

```css
/* MPP-14: Pet page (approved pet-mockup.html, first phone). */

.pet-view {
  padding: var(--spacing-md);
  max-width: 500px;
  margin: 0 auto;
}

/* ---- Room ---- */
.pet-room {
  position: relative;
  height: 330px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(#f3eefc 0%, #efe9fb 62%, #e2d8f5 62%, #d9cdf1 100%);
  box-shadow: var(--shadow-md);
}

.pet-room-window {
  position: absolute;
  top: 26px;
  right: 26px;
  width: 70px;
  height: 56px;
  border-radius: 10px;
  background: linear-gradient(#cfe8ff, #e9f4ff);
  border: 4px solid #fff;
}

.pet-room-window::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #fff;
  transform: translateX(-50%);
}

.pet-room-shelf {
  position: absolute;
  top: 150px;
  left: 24px;
  width: 90px;
  height: 6px;
  background: #c7b8e8;
  border-radius: 3px;
}

.pet-room-jar {
  position: absolute;
  top: 124px;
  left: 34px;
  width: 18px;
  height: 26px;
  border-radius: 5px 5px 4px 4px;
  background: #fff;
  border: 3px solid #c7b8e8;
}

.pet-room-jar--small {
  left: 62px;
  top: 130px;
  height: 20px;
}

.pet-bubble {
  position: absolute;
  top: 18px;
  left: 18px;
  max-width: 200px;
  margin: 0;
  padding: 10px 12px;
  background: #fff;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.35;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1;
}

.pet-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 40px;
  border: 8px solid transparent;
  border-top-color: #fff;
  border-bottom: 0;
}

.pet-stage {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 6px;
  display: flex;
  justify-content: center;
}

.pet-stage .mochi-pet {
  width: min(300px, 100%);
  height: 225px;
}

/* ---- Name + chip ---- */
.pet-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 2px 12px;
}

.pet-name-block {
  min-width: 0;
}

.pet-name {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.pet-name-edit-btn,
.pet-meals-link,
.pet-view-state-btn {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.pet-name-edit-btn {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 1rem;
}

.pet-name-edit-btn:active {
  background: var(--bg-secondary);
}

@media (hover: hover) {
  .pet-name-edit-btn:hover {
    color: var(--brand-primary);
    background: var(--bg-secondary);
  }
}

.pet-name-input {
  min-height: 44px;
  width: 100%;
  max-width: 12rem;
  padding: 0 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font: inherit;
  font-size: 1.1rem;
  font-weight: 700;
}

.pet-name-error {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: #a71d2a;
}

.pet-chip {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.pet-chip--content { background: rgba(74, 63, 128, 0.12); color: var(--brand-primary); }
.pet-chip--happy { background: rgba(40, 167, 69, 0.15); color: #1b6b2e; }
.pet-chip--bored { background: rgba(255, 193, 7, 0.22); color: #856404; }
.pet-chip--mischievous { background: rgba(255, 107, 53, 0.18); color: #a8431a; }

/* ---- Today's meals ---- */
.pet-meals-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.pet-meals-card h3 {
  margin: 0 0 10px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.pet-meals {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pet-meal {
  padding: 10px 6px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  text-align: center;
  font-size: 0.8rem;
  font-weight: 500;
}

.pet-meal b {
  display: block;
  margin-bottom: 2px;
  font-size: 1.1rem;
}

.pet-meal small {
  display: block;
}

.pet-meal--logged { background: rgba(40, 167, 69, 0.12); color: #1b6b2e; }
.pet-meal--due { background: rgba(255, 107, 53, 0.14); color: #a8431a; }
.pet-meal--upcoming,
.pet-meal--unplanned { color: var(--text-secondary); }

.pet-meals-empty {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.pet-meals-link {
  width: 100%;
  min-height: 44px;
  margin-top: 12px;
  padding: 10px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--brand-primary);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
}

.pet-meals-link:active {
  background: var(--brand-primary-dark);
}

@media (hover: hover) {
  .pet-meals-link:hover {
    background: var(--brand-primary-dark);
  }
}

.pet-meals-link:focus-visible,
.pet-name-edit-btn:focus-visible,
.pet-view-state-btn:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

/* ---- Guest / loading / error ---- */
.pet-view-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl) var(--spacing-md);
  text-align: center;
}

.pet-view-state-btn {
  min-height: 44px;
  padding: 0 var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  background: var(--brand-primary);
  color: #fff;
  font-weight: 600;
}
```

- [ ] **Step 3: Add the route**

In `App.jsx`, add after the `ShoppingList` import:

```jsx
import PetView from './components/pet/PetView.jsx'
```

and add after `<Route path="/mealplan" element={<MealPlanCalendar />} />`:

```jsx
          <Route path="/pet" element={<PetView />} />
```

- [ ] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 17: Swap the footer's Search tab for the Pet tab and delete Search

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/layout/Footer.jsx` (imports, handlers, the Search `<button>` ~lines 62-71)
- Modify: `foodbytes-app/client/src/components/layout/Footer.css`
- Modify: `foodbytes-app/client/src/App.jsx` (remove `SearchView` import + `/search` route)
- Delete: `foodbytes-app/client/src/components/recipes/SearchView.jsx`
- Delete: `foodbytes-app/client/src/components/recipes/SearchView.css`

- [ ] **Step 1: Wire the pet into `Footer.jsx`**

Add after the `useAuth` import:

```jsx
import { usePet } from '../../contexts/PetContext'
import MochiPet from '../pet/MochiPet'
import { PET_GUEST_MESSAGE, PET_GUEST_TAB_LABEL } from '../../constants/pet'
```

After `const [showMessage, setShowMessage] = useState(null)` add:

```jsx
  const { petName, mood } = usePet()
```

After `handleShoppingClick` add:

```jsx
  // MPP-14 AC 3: guests get the same sign-in nudge as Meal Plan and Shopping.
  const handlePetClick = () => {
    if (!isAuthenticated) {
      setShowMessage(PET_GUEST_MESSAGE)
      setTimeout(() => setShowMessage(null), 3000)
    } else {
      navigate('/pet')
    }
  }
```

Replace the whole Search button:

```jsx
        <button
          className={`footer-btn ${location.pathname === '/search' ? 'active' : ''}`}
          onClick={() => navigate('/search')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>Search</span>
        </button>
```

with:

```jsx
        {/* MPP-14 AC 2: live mini face in the current mood; label is the pet's name. */}
        <button
          className={`footer-btn ${location.pathname === '/pet' ? 'active' : ''}`}
          onClick={handlePetClick}
        >
          <MochiPet mood={mood} variant="mini" />
          <span className="footer-pet-label">{petName ?? PET_GUEST_TAB_LABEL}</span>
        </button>
```

- [ ] **Step 2: Style the mini face and fix the hover-only state in `Footer.css`**

Replace:

```css
.footer-btn:hover {
  color: var(--brand-primary);
  background: var(--bg-secondary);
}
```

with:

```css
.footer-btn {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.footer-btn:active {
  color: var(--brand-primary);
  background: var(--bg-secondary);
}

@media (hover: hover) {
  .footer-btn:hover {
    color: var(--brand-primary);
    background: var(--bg-secondary);
  }
}

.footer-btn:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
```

After the `.footer-btn svg { … }` rule add:

```css
/* MPP-14: the Pet tab's mini Mochi face is a little larger than the line icons. */
.footer-btn svg.mochi-pet--mini {
  width: 30px;
  height: 30px;
  margin: -3px 0;
}

/* A 12-character pet name must not push the tab wider than its neighbours. */
.footer-pet-label {
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

- [ ] **Step 3: Remove Search from `App.jsx`**

Delete the line:

```jsx
import SearchView from './components/recipes/SearchView.jsx'
```

and the line:

```jsx
          <Route path="/search" element={<SearchView />} />
```

- [ ] **Step 4: Delete the Search files**

Run: `Remove-Item foodbytes-app\client\src\components\recipes\SearchView.jsx, foodbytes-app\client\src\components\recipes\SearchView.css -Confirm:$false`
Expected: no output.

- [ ] **Step 5: Confirm nothing references Search**

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.css | Select-String -Pattern "SearchView|'/search'|search-view"`
Expected: zero hits.

- [ ] **Step 6: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 18: Add the pet reaction to the eaten section

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/PetReaction.jsx`
- Create: `foodbytes-app/client/src/components/pet/PetReaction.css`
- Modify: `foodbytes-app/client/src/components/recipes/MealEatenSection.jsx` (imports + after the `eaten-meta` `<p>`)

- [ ] **Step 1: Write `PetReaction.jsx`**

```jsx
import { usePet } from '../../contexts/PetContext'
import { MEAL_TYPE_LABELS } from '../../constants/mealTypes'
import { PET_MOODS } from '../../constants/pet'
import MochiPet from './MochiPet'
import './PetReaction.css'

/**
 * MPP-14 AC 7: "Pip is happy! Lunch logged." under the eaten button. Renders nothing
 * until the pet has loaded, so a failed pet load never shows a made-up name.
 */
function PetReaction({ mealType }) {
  const { petName } = usePet()
  if (!petName) return null

  return (
    <p className="pet-react">
      <MochiPet mood={PET_MOODS.HAPPY} variant="mini" />
      <span>{petName} is happy! {MEAL_TYPE_LABELS[mealType]} logged.</span>
    </p>
  )
}

export default PetReaction
```

- [ ] **Step 2: Write `PetReaction.css`**

```css
/* MPP-14: pet reaction under the MPP-12 eaten button (approved pet-mockup.html, phone 2). */

.pet-react {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0 0;
  padding: 10px 12px;
  background: #f1eefa;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  animation: pet-react-in 0.3s ease-out;
}

.pet-react .mochi-pet {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

@keyframes pet-react-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .pet-react {
    animation: none;
  }
}
```

- [ ] **Step 3: Render it from `MealEatenSection.jsx`**

Add after the `formatLongWeekday` import:

```jsx
import { PET_COUNTED_MEAL_TYPES } from '../../constants/pet'
import PetReaction from '../pet/PetReaction'
```

Directly after the closing `</p>` of `<p className="eaten-meta" aria-live="polite">…</p>` (before `</section>`), add:

```jsx
      {eaten && PET_COUNTED_MEAL_TYPES.includes(entry.mealType) && (
        <PetReaction mealType={entry.mealType} />
      )}
```

- [ ] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 19: Remove `/search` from the docs

- Skill: none — documentation edit, no code

**Files:**
- Modify: `CLAUDE.md` (Frontend structure → `App.jsx` bullet)
- Modify: `.claude/skills/react-frontend/SKILL.md` (Project layout → `Routes:` line)

- [ ] **Step 1: Update `CLAUDE.md`**

Replace `the routed app (\`/\`, \`/search\`, \`/mealplan\`, \`/shopping\`)` with `the routed app (\`/\`, \`/mealplan\`, \`/pet\`, \`/shopping\`)`.

- [ ] **Step 2: Update the react-frontend skill**

Replace `Routes: \`/\`, \`/search\`, \`/mealplan\`, \`/shopping\`.` with `Routes: \`/\`, \`/mealplan\`, \`/pet\`, \`/shopping\` (recipe search was removed in MPP-14).`

- [ ] **Step 3: Confirm**

Run: `Select-String -Path CLAUDE.md, .claude\skills\react-frontend\SKILL.md -Pattern "/search"`
Expected: zero hits.

---

## Phase 5 — Final verification

The closing phase. No production changes beyond the version bump — only sanity-checks that the cumulative work is clean.

### Task 20 (M.1): Bump version + CHANGELOG

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [ ] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-14 is a **Story** → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [ ] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-14: Pet page (Phase 1) — Mochi with four meal-logging moods replaces the Search tab; pet name stored on the plan owner`

- [ ] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 21 (M.2): Grep for stale references and debt

- Skill: none — verification only

**Files:**
- (none — read-only checks)

- [ ] **Step 1: No Search remnants anywhere in the client**

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.css | Select-String -Pattern "SearchView|/search|search-view"`
Expected: zero hits.

- [ ] **Step 2: No new `console.log` / `console.debug`**

Run: `Get-ChildItem foodbytes-app\client\src\components\pet, foodbytes-app\client\src\contexts\PetContext.jsx, foodbytes-app\client\src\hooks\useMinuteClock.js, foodbytes-app\client\src\utils\petMood.js, foodbytes-app\client\src\services\petService.js -Recurse | Select-String -Pattern "console\.(log|debug)"`
Expected: zero hits.

- [ ] **Step 3: No `dangerouslySetInnerHTML` in the pet**

Run: `Get-ChildItem foodbytes-app\client\src\components\pet -Recurse | Select-String -Pattern "dangerouslySetInnerHTML"`
Expected: zero hits.

- [ ] **Step 4: Line budgets**

Run: `Get-ChildItem foodbytes-app\client\src\components\pet\*.jsx, foodbytes-app\client\src\contexts\PetContext.jsx, foodbytes-app\client\src\utils\petMood.js, foodbytes-app\client\src\components\layout\Footer.jsx, foodbytes-app\client\src\components\recipes\MealEatenSection.jsx | ForEach-Object { "{0} {1}" -f (Get-Content $_ | Measure-Object -Line).Lines, $_.Name }`
Expected: every file under 200 lines (none may exceed 400).

### Task 22 (M.3): Run the full backend test suite

- Skill: none — verification only

**Files:**
- (none)

- [ ] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors (the previous total plus 9 new tests).

### Task 23 (M.4): Production build, mood checks and manual check

- Skill: none — verification only

**Files:**
- (none)

- [ ] **Step 1: Mood rule checks**

Run: `cd foodbytes-app\client; npm run check:pet`
Expected: `petMood: all checks passed`

- [ ] **Step 2: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [ ] **Step 3: Manual check (developer, against the local stack — backend on :8080 with the local DB, `npm run dev` on :5173, 375px viewport)**

1. As a guest: the footer reads Recipes · Meal Plan · Pet · Shopping; tapping Pet shows "Sign in to meet your pet!"; there is no Search tab; `/search` renders no page.
2. Signed in with nothing planned today: the tab label is "Pip"; `/pet` shows the room, the bubble "Nothing due yet. Just vibing.", the chip "Content", three "Not planned" tiles, and "Log meals in Meal Plan" goes to `/mealplan`.
3. Plan today's lunch and set lunch's "by" time to a minute in the past (account menu): the face and chip turn Bored ("Bored · 1 unlogged"), and the footer mini face matches.
4. Open that lunch from Meal Plan and tap "Mark as eaten": "Pip is happy! Lunch logged." appears under the button, and the footer face is Happy before the modal is closed.
5. Rename via the pencil to "Bao", then reload: the name persists; a 13-character name is impossible to type (`maxlength`); clearing the name and pressing Enter restores "Pip".
6. With OS reduced motion on: the pet does not animate.
7. (If a linked test user is available) the linked user sees the same name and mood, and uses the owner's meal times.

Report which of these were exercised and which were not.

### Task 24 (M.5): Write the PR description

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-14-pet-page-mood/pr-description.md`

- [ ] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary: Pet tab + page replace Search; four derived moods; `/api/pet`; reaction in the eaten section; the new version from Task 20.
- **Migrations, in order, before the backend deploys:** `2026-10-12-mpp12-meal-plan-entry-eaten.sql`, `2026-10-12-mpp13-user-meal-times.sql`, `2026-10-12-mpp14-user-pet-name.sql` (Task 2 records whether they have been applied).
- Verification results from Tasks 21–23 (including which manual checks were and were not exercised).
- Convention note for future contributors: the pet's mood is derived only in `utils/petMood.js` (pinned by `npm run check:pet`); the default pet name lives only in `PetPolicy`.
- Suggested commit subject: `MPP-14: Pet page with Mochi moods replaces the Search tab`.

---

## Self-review

**Spec coverage:**
- Footer Recipes · Meal Plan · Pet · Shopping, mini face, name label, guest message — Task 17 (AC 1, 2, 3).
- Delete `SearchView`, its CSS and `/search`; docs refreshed — Tasks 17, 19, 21 (AC 1).
- Migration + `User.petName` + `PetPolicy` + DTOs + `PetService` + `PetController` with tests — Tasks 1–7 (AC 8, persisted name).
- `petService`, `constants/pet.js`, `utils/petMood.js` + check, `useMinuteClock`, `PetContext` — Tasks 8–12 (AC 6, 7, 8).
- `MochiPet` with four animated moods and reduced motion — Task 13 (AC 5, 9).
- `PetView` (room, bubble, name editor, chip, meals card) + `/pet` route — Tasks 14–16 (AC 4, 8 rename).
- `PetReaction` in `MealEatenSection` — Task 18 (AC 7).
- `PetProvider` mounted in `main.jsx` — Task 12.
- Version bump + CHANGELOG — Task 20.
- Railway migrations (MPP-12, MPP-13, MPP-14) applied by the developer before the Java type change — Task 2.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command.

**Type / name consistency:** `pet_name` / `petName` / `PetDTO.name` + `customName` + `mealTimes`; `PetPolicy.DEFAULT_NAME`, `MAX_NAME_LENGTH`, `NAME_LENGTH_ERROR`, `normalise`, `toDTO`; `PetService.getPet` / `renamePet`; `GET /api/pet`, `PUT /api/pet/name`; `petService.getPet` / `renamePet`; `mealPlanService.getWeekPlan(startDate, { signal })`; `derivePetMood` → `{ mood, dueCount, todaySlots, lastLoggedType, dueMealType }`; `petBubble`, `petChipLabel`; `PET_MOODS`, `PET_MOOD_LABELS`, `PET_COUNTED_MEAL_TYPES`, `PET_MEAL_TIME_KEY`, `PET_SLOT_STATUS`, `PET_NAME_MAX_LENGTH`, `PET_GUEST_TAB_LABEL`, `PET_GUEST_MESSAGE`, `PET_CLOCK_TICK_MS`; `usePet()` → `{ pet, petName, mood, moodInfo, loading, error, retry, renamePet }`; CSS `mochi-mood-<mood>`, `mochi-pet--mini`, `pet-chip--<mood>`, `pet-meal--<status>`, `footer-pet-label`, `pet-react` — used identically across Tasks 4–18 and in `plan.md` Data shapes.

**Phase boundary cleanliness:**
- Phase 1: only a nullable column added (local + Railway); the running backend is unaffected.
- Phase 2: entity, policy, DTOs, service and controller land together with green targeted tests; no frontend caller yet.
- Phase 3: helpers, services, hook and context compile and are mounted; no component reads them, so the UI is unchanged.
- Phase 4: each task builds green; the footer swap and Search deletion share Task 17, so there is never a dangling import or dead route.
- Phase 5: read-only checks plus the version bump.
