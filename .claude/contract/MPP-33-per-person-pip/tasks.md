# Tasks: Per-person Pip — each person ticks their own meals and has their own pet

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-13

**Goal:** Ticking a meal as eaten becomes personal (a `meal_plan_entry_eaten` row per entry per person). The meal plan stays shared, and Pip's name and meal times come from the caller's own `users` row instead of the plan owner's.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql` — new per-person tick table
- `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` — the epic's Railway apply checklist for the merge to master (created by Task 3 if absent)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanEntryEaten.java` — entity
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanEntryEatenRepository.java` — bulk read, read-back, idempotent insert, scoped delete

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java` — caller's ticks on write and read
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanEntry.java:191-197` — unmap `eaten`/`eatenAt`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java:460-568` — MPP-12 eaten block replaced by MPP-33 block
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetService.java` — drop `resolveOwner`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java` — per-user pet tests
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetPolicy.java:138-144` — param rename `owner` → `user`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetDTO.java`, `controller/PetController.java:67-69`, `model/User.java:66-71`, `dto/MealPlanEntryDTO.java:32-33`, `controller/MealPlanController.java:116-121` — comments only
- `foodbytes-app/client/src/services/petService.js:3-6`, `services/mealPlanService.js:56-58`, `contexts/PetContext.jsx:14-27`, `utils/petMood.js:12-19`, `components/pet/PetNameEditor.jsx:6-10`, `components/recipes/MealEatenSection.jsx:11-17` — comments only
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump

**Deleted:** (none)

---

## Phase 1 — Schema

Writes the additive migration and applies it to the **local** `foodbytes-db` container only. MPP-15 epic work is built and tested against the local DB on branch `feature/MPP-15-pip-room`. Railway is not touched until the epic merges to master (Task 3 records that step for later). Nothing in Java changes yet, so the build stays green.

### Task 1: Write the per-person eaten migration ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql`

- [x] **Step 1: Write the migration file**

```sql
-- MPP-33: per-person eaten ticks. Each person ticks the meals they ate; the meal plan stays shared.
--
-- Adds one table:
--   meal_plan_entry_eaten - one row per (meal_plan_entry_id, user_id) while that person has the
--                           meal ticked; eaten_at is the UTC wall time of their first tick.
--
-- Purely additive and lossless for existing data: no column or row changes. Existing shared ticks
-- (meal_plan_entries.eaten / eaten_at) are deliberately NOT carried over (MPP-33 AC 1) - each person
-- ticks for themselves from now on. Live counts at planning (2026-10-13): meal_plan_entries 800 rows,
-- 5 with eaten = 1; 2 linked users; meal_plan_entry_eaten does not exist.
--
-- The old meal_plan_entries.eaten / eaten_at columns stay until a follow-up cleanup migration: the
-- MPP-33 backend no longer maps them, validate ignores unmapped columns, and eaten has DEFAULT 0 so
-- inserts that omit it still succeed.
--
-- ON DELETE CASCADE on meal_plan_entry_id is load-bearing: MealPlanEntryRepository.deleteByUserIdAndDateRange
-- is a JPQL bulk delete that bypasses JPA cascades (same reason as MPP-10's extra-choice tables).
--
-- MUST be applied to the Railway MySQL BEFORE the MPP-33 backend is deployed
-- (spring.jpa.hibernate.ddl-auto = validate fails startup otherwise). Safe to apply while the
-- current backend runs.

CREATE TABLE IF NOT EXISTS meal_plan_entry_eaten (
  id                 BIGINT    NOT NULL AUTO_INCREMENT,
  meal_plan_entry_id BIGINT    NOT NULL,
  user_id            BIGINT    NOT NULL,
  eaten_at           TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_mpe_eaten_entry_user (meal_plan_entry_id, user_id),
  KEY idx_mpe_eaten_user (user_id),
  CONSTRAINT fk_mpe_eaten_entry FOREIGN KEY (meal_plan_entry_id)
    REFERENCES meal_plan_entries (id) ON DELETE CASCADE,
  CONSTRAINT fk_mpe_eaten_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

- [x] **Step 2: Confirm the file exists**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql`
Expected: one file listed.

### Task 2: Apply the migration to the local test DB ✓

- Skill: none — DBA operation against the local `foodbytes-db` container (CLAUDE.md → Local test database)

**Files:**
- (none — database only)

- [x] **Step 1: Apply locally**

Run (Bash): `docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app/database/migrations/2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql`
Expected: no error output. This apply is **required**: the epic is tested against the local DB. If Docker Desktop is not running, stop and ask the developer to start it.

- [x] **Step 2: Verify the table and exercise the upsert once**

Run (Bash): `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SHOW CREATE TABLE meal_plan_entry_eaten\G; START TRANSACTION; SET @e := (SELECT id FROM meal_plan_entries LIMIT 1); SET @u := (SELECT user_id FROM meal_plan_entries WHERE id = @e); INSERT INTO meal_plan_entry_eaten (meal_plan_entry_id, user_id, eaten_at) VALUES (@e, @u, '2026-10-13 08:00:00') ON DUPLICATE KEY UPDATE eaten_at = eaten_at; INSERT INTO meal_plan_entry_eaten (meal_plan_entry_id, user_id, eaten_at) VALUES (@e, @u, '2026-10-13 09:00:00') ON DUPLICATE KEY UPDATE eaten_at = eaten_at; SELECT COUNT(*), MIN(eaten_at) FROM meal_plan_entry_eaten WHERE meal_plan_entry_id = @e; ROLLBACK;"`
Expected: the table definition shows both FKs with `ON DELETE CASCADE` and `uk_mpe_eaten_entry_user`, and the select returns `1  2026-10-13 08:00:00` (the second insert kept the first time). The transaction is rolled back, so no test data remains.

### Task 3: Register the migration for the epic's merge to master (Railway deferred) ✓

- Skill: none — release bookkeeping. MPP-15 is tested locally, and Railway is applied only when `feature/MPP-15-pip-room` merges to master

**Files:**
- Create or modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`

- [x] **Step 1: Append this migration to the epic's Railway checklist**

If the file does not exist, create it with this header:
```markdown
# MPP-15 — migrations to apply to Railway at merge to master

Apply in this order to the Railway MySQL (`railway` schema) BEFORE the merged backend deploys. Every one has already been applied and tested on the local `foodbytes-db`.

| Order | Ticket | File | Applied locally | Applied to Railway |
|---|---|---|---|---|
```
Then append the row `| 1 | MPP-33 | foodbytes-app/database/migrations/2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql | 2026-10-13 | — |`. Use the next free order number if rows already exist.

- [x] **Step 2: Confirm the row is present**

Run: `Select-String -Path .claude\contract\MPP-15-epic-breakdown\railway-migrations.md -Pattern "mpp33-meal-plan-entry-eaten-per-user"`
Expected: one hit.

Do **not** copy the file to Downloads and do **not** query Railway for it during this contract.

---

## Phase 2 — Per-person eaten ticks (backend)

Adds the entity and repository, moves `MealPlanService` onto them test-first, then unmaps the old columns. The phase ends with `MealPlanServiceTest` and `MealPlanControllerTest` green and nothing reading `MealPlanEntry.getEaten()`.

### Task 4: Add the MealPlanEntryEaten entity ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanEntryEaten.java`

- [x] **Step 1: Write the entity**

```java
package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * MPP-33: one person's "I ate this" tick on a shared meal plan entry. The entry is shared by linked
 * users (users.meal_plan_owner_id); the tick is not. Absence of a row means not eaten.
 * Plain id columns (no associations), as MealPlanEntryExtraChoice: rows are always read in bulk by
 * entry id for one user, and MySQL cascades them away with their entry or user.
 */
@Entity
@Table(name = "meal_plan_entry_eaten", uniqueConstraints = {
    @UniqueConstraint(name = "uk_mpe_eaten_entry_user", columnNames = {"meal_plan_entry_id", "user_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanEntryEaten {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meal_plan_entry_id", nullable = false)
    private Long mealPlanEntryId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // UTC wall time of this person's first tick (the JDBC URL pins serverTimezone=UTC)
    @Column(name = "eaten_at", nullable = false)
    private LocalDateTime eatenAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MealPlanEntryEaten other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return MealPlanEntryEaten.class.hashCode();
    }
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, no errors. (Use the env prefix from the Java/Maven toolchain memory if `mvn` is not on PATH.)

### Task 5: Add MealPlanEntryEatenRepository ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanEntryEatenRepository.java`

- [x] **Step 1: Write the repository**

```java
package com.foodbytes.repository;

import com.foodbytes.model.MealPlanEntryEaten;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/** MPP-33: per-person eaten ticks on shared meal plan entries. */
@Repository
public interface MealPlanEntryEatenRepository extends JpaRepository<MealPlanEntryEaten, Long> {

    /** One user's ticks for a batch of entries (week and assignment reads). */
    List<MealPlanEntryEaten> findByUserIdAndMealPlanEntryIdIn(Long userId, Collection<Long> mealPlanEntryIds);

    Optional<MealPlanEntryEaten> findByMealPlanEntryIdAndUserId(Long mealPlanEntryId, Long userId);

    /**
     * Idempotent tick: inserts the row, or leaves an existing one untouched so the first eaten_at
     * survives. Parallel ticks by the same user converge instead of failing on the unique key.
     */
    @Modifying
    @Query(value = "INSERT INTO meal_plan_entry_eaten (meal_plan_entry_id, user_id, eaten_at) " +
                   "VALUES (:entryId, :userId, :eatenAt) ON DUPLICATE KEY UPDATE eaten_at = eaten_at",
           nativeQuery = true)
    void insertIfAbsent(@Param("entryId") Long entryId,
                        @Param("userId") Long userId,
                        @Param("eatenAt") LocalDateTime eatenAt);

    /** Untick: removes only this user's row; a no-op when absent. */
    @Modifying
    @Query("DELETE FROM MealPlanEntryEaten e WHERE e.mealPlanEntryId = :entryId AND e.userId = :userId")
    int deleteByEntryAndUser(@Param("entryId") Long entryId, @Param("userId") Long userId);
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 6: Move MealPlanService eaten reads and writes to the caller's ticks ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java:30-37, 73-98, 230, 303-330, 437-446, 459-516`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java`

- [x] **Step 1: Write the failing tests**

In `MealPlanServiceTest`:
- Add imports `com.foodbytes.model.MealPlanEntryEaten`, `com.foodbytes.repository.MealPlanEntryEatenRepository`, `static org.mockito.ArgumentMatchers.eq`.
- Add `@Mock private MealPlanEntryEatenRepository mealPlanEntryEatenRepository;` after the `recipeFamilyMemberRepository` mock.
- Add `@Captor private ArgumentCaptor<LocalDateTime> eatenAtCaptor;` after `entryCaptor`.
- Replace everything from the `// MPP-12: mark a planned meal as eaten` banner (line 460) to the end of `getWeekPlan_exposesEatenStateOnEntries` (line 568) with:

```java
    // ------------------------------------------------------------------
    // MPP-33: per-person eaten ticks on a shared meal plan
    // ------------------------------------------------------------------

    private static final Long ENTRY_ID = 812L;
    private static final Long LINKED_ID = 2L;

    private static MealPlanEntryEaten tick(Long entryId, Long userId, LocalDateTime at) {
        return new MealPlanEntryEaten(null, entryId, userId, at);
    }

    private User linkedUser() {
        User linked = new User();
        linked.setId(LINKED_ID);
        linked.setMealPlanOwnerId(OWNER_ID);
        return linked;
    }

    @Test
    void setEntryEaten_ownEntry_insertsTheCallersTickAtUtcNow() {
        MealPlanEntry entry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        LocalDateTime stored = LocalDateTime.of(2026, 10, 13, 12, 12, 4);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, USER_ID)).thenReturn(Optional.of(entry));
        when(mealPlanEntryEatenRepository.findByMealPlanEntryIdAndUserId(ENTRY_ID, USER_ID))
                .thenReturn(Optional.of(tick(ENTRY_ID, USER_ID, stored)));

        MealPlanEntryEatenDTO result = mealPlanService.setEntryEaten(USER_ID, ENTRY_ID, true).orElseThrow();

        verify(mealPlanEntryEatenRepository).insertIfAbsent(eq(ENTRY_ID), eq(USER_ID), eatenAtCaptor.capture());
        assertThat(eatenAtCaptor.getValue()).isCloseTo(LocalDateTime.now(ZoneOffset.UTC), within(5, ChronoUnit.SECONDS));
        // The response carries the STORED time, so a re-tick reports the first tick's time.
        assertThat(result.eaten()).isTrue();
        assertThat(result.eatenAt()).isEqualTo(Instant.parse("2026-10-13T12:12:04Z"));
        verify(mealPlanEntryRepository, never()).save(any(MealPlanEntry.class));
    }

    @Test
    void setEntryEaten_undo_deletesOnlyTheCallersTick() {
        MealPlanEntry entry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, USER_ID)).thenReturn(Optional.of(entry));

        MealPlanEntryEatenDTO result = mealPlanService.setEntryEaten(USER_ID, ENTRY_ID, false).orElseThrow();

        verify(mealPlanEntryEatenRepository).deleteByEntryAndUser(ENTRY_ID, USER_ID);
        verify(mealPlanEntryEatenRepository, never()).insertIfAbsent(any(), any(), any());
        assertThat(result.eaten()).isFalse();
        assertThat(result.eatenAt()).isNull();
    }

    @Test
    void setEntryEaten_twoLinkedUsers_tickAndUntickIndependently() {
        MealPlanEntry sharedEntry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(user));
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linkedUser()));
        // Both find the entry in the OWNER's plan - the plan stays shared.
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, OWNER_ID)).thenReturn(Optional.of(sharedEntry));
        when(mealPlanEntryEatenRepository.findByMealPlanEntryIdAndUserId(ENTRY_ID, OWNER_ID))
                .thenReturn(Optional.of(tick(ENTRY_ID, OWNER_ID, LocalDateTime.of(2026, 10, 13, 12, 0))));
        when(mealPlanEntryEatenRepository.findByMealPlanEntryIdAndUserId(ENTRY_ID, LINKED_ID))
                .thenReturn(Optional.of(tick(ENTRY_ID, LINKED_ID, LocalDateTime.of(2026, 10, 13, 12, 30))));

        MealPlanEntryEatenDTO ownerTick = mealPlanService.setEntryEaten(OWNER_ID, ENTRY_ID, true).orElseThrow();
        MealPlanEntryEatenDTO linkedTick = mealPlanService.setEntryEaten(LINKED_ID, ENTRY_ID, true).orElseThrow();
        mealPlanService.setEntryEaten(LINKED_ID, ENTRY_ID, false);

        verify(mealPlanEntryEatenRepository).insertIfAbsent(eq(ENTRY_ID), eq(OWNER_ID), any());
        verify(mealPlanEntryEatenRepository).insertIfAbsent(eq(ENTRY_ID), eq(LINKED_ID), any());
        assertThat(ownerTick.eatenAt()).isEqualTo(Instant.parse("2026-10-13T12:00:00Z"));
        assertThat(linkedTick.eatenAt()).isEqualTo(Instant.parse("2026-10-13T12:30:00Z"));
        // The linked user's untick removes only their own row; the owner's tick stays.
        verify(mealPlanEntryEatenRepository).deleteByEntryAndUser(ENTRY_ID, LINKED_ID);
        verify(mealPlanEntryEatenRepository, never()).deleteByEntryAndUser(ENTRY_ID, OWNER_ID);
        verify(mealPlanEntryRepository, never()).save(any(MealPlanEntry.class));
    }

    @Test
    void setEntryEaten_entryOutsideEffectivePlan_returnsEmptyAndWritesNothing() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByIdAndUserId(999L, USER_ID)).thenReturn(Optional.empty());

        assertThat(mealPlanService.setEntryEaten(USER_ID, 999L, true)).isEmpty();
        verifyNoInteractions(mealPlanEntryEatenRepository);
    }

    @Test
    void assignRecipe_newEntry_isNotEaten() {
        stubAssign(82L, null);

        MealPlanEntryDTO dto = mealPlanService.assignRecipe(USER_ID, assignRequest(82L, Map.of()));

        assertThat(dto.getEaten()).isFalse();
        assertThat(dto.getEatenAt()).isNull();
        verifyNoInteractions(mealPlanEntryEatenRepository);
    }

    @Test
    void getWeekPlan_exposesTheCallersOwnTicks() {
        LocalDate start = LocalDate.of(2026, 10, 12);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        MealPlanEntry ticked = entryWithId(10L, recipeWithId(82L), start);
        MealPlanEntry unticked = entryWithId(11L, recipeWithId(38L), start.plusDays(1));
        when(mealPlanEntryRepository.findByUserIdAndDateRange(USER_ID, start, start.plusDays(7)))
                .thenReturn(List.of(ticked, unticked));
        when(mealPlanEntryEatenRepository.findByUserIdAndMealPlanEntryIdIn(USER_ID, List.of(10L, 11L)))
                .thenReturn(List.of(tick(10L, USER_ID, LocalDateTime.of(2026, 10, 12, 12, 12, 4))));
        stubWeekMacros();

        MealPlanWeekDTO week = mealPlanService.getWeekPlan(USER_ID, start);

        MealPlanEntryDTO first = week.getDays().get(0).getMealsByType().get("dinner").get(0);
        MealPlanEntryDTO second = week.getDays().get(1).getMealsByType().get("dinner").get(0);
        assertThat(first.getEaten()).isTrue();
        assertThat(first.getEatenAt()).isEqualTo(Instant.parse("2026-10-12T12:12:04Z"));
        assertThat(second.getEaten()).isFalse();
        assertThat(second.getEatenAt()).isNull();
    }

    @Test
    void getWeekPlan_linkedPartner_readsTheSharedEntriesButOnlyTheirOwnTicks() {
        LocalDate start = LocalDate.of(2026, 10, 12);
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linkedUser()));
        MealPlanEntry ownersTicked = entryWithId(10L, recipeWithId(82L), start);
        when(mealPlanEntryRepository.findByUserIdAndDateRange(OWNER_ID, start, start.plusDays(7)))
                .thenReturn(List.of(ownersTicked));
        // The partner has no tick of their own; the owner's tick must not leak through.
        when(mealPlanEntryEatenRepository.findByUserIdAndMealPlanEntryIdIn(LINKED_ID, List.of(10L)))
                .thenReturn(List.of());
        stubWeekMacros();

        MealPlanWeekDTO week = mealPlanService.getWeekPlan(LINKED_ID, start);

        MealPlanEntryDTO dto = week.getDays().get(0).getMealsByType().get("dinner").get(0);
        assertThat(dto.getEaten()).isFalse();
        assertThat(dto.getEatenAt()).isNull();
        verify(mealPlanEntryEatenRepository, never()).findByUserIdAndMealPlanEntryIdIn(eq(OWNER_ID), any());
    }

    @Test
    void getRecipeAssignments_carriesTheCallersTicks() {
        LocalDate start = LocalDate.of(2026, 10, 12);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        MealPlanEntry assigned = entryWithId(10L, recipeWithId(82L), start);
        when(mealPlanEntryRepository.findByUserIdAndRecipeIdAndDateRange(USER_ID, 82L, start, start.plusDays(7)))
                .thenReturn(List.of(assigned));
        when(mealPlanEntryEatenRepository.findByUserIdAndMealPlanEntryIdIn(USER_ID, List.of(10L)))
                .thenReturn(List.of(tick(10L, USER_ID, LocalDateTime.of(2026, 10, 12, 8, 0))));
        when(macroCalculationService.calculatePerServingMacros(any())).thenReturn(new int[]{0, 0, 0});

        List<MealPlanEntryDTO> dtos = mealPlanService.getRecipeAssignments(USER_ID, 82L, start);

        assertThat(dtos).hasSize(1);
        assertThat(dtos.get(0).getEaten()).isTrue();
        assertThat(dtos.get(0).getEatenAt()).isEqualTo(Instant.parse("2026-10-12T08:00:00Z"));
    }
}
```

- [x] **Step 2: Run the tests and confirm they fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: FAIL. The new tests fail because `MealPlanService` never calls `mealPlanEntryEatenRepository`, and the week and assignment DTOs report `eaten=false`. The pre-existing assign/copy/swap tests still pass.

- [x] **Step 3: Implement in MealPlanService**

1. Add the dependency after `recipeFamilyMemberRepository` (line 37):
```java
    private final MealPlanEntryEatenRepository mealPlanEntryEatenRepository; // MPP-33: per-person eaten ticks
```
2. In `getWeekPlan`, replace lines 82-84 (the choices fetch) and line 98 (the `buildDayDTO` call) so both batch reads share one id list:
```java
        List<Long> entryIds = entries.stream().map(MealPlanEntry::getId).toList();

        // MPP-10: one query for the week's stored extra choices (cart icon on the calendar)
        Map<Long, Map<Long, Boolean>> choicesByEntry = extraChoiceService.getEntryChoices(entryIds);

        // MPP-33: one query for the CALLER's ticks - the plan is shared, eaten is not
        Map<Long, LocalDateTime> eatenByEntry = getEatenAtByEntry(userId, entryIds);
```
```java
            MealPlanDayDTO dayDTO = buildDayDTO(date, dayEntries, today, choicesByEntry, eatenByEntry);
```
3. In `assignRecipe`, line 230: `return convertToDTO(entry, storedChoices, null); // MPP-33: a new entry is never eaten`
4. Replace `setEntryEaten` and its Javadoc (lines 303-330) with:
```java
    /**
     * MPP-12 / MPP-33: set or clear the CALLER's eaten tick on a meal plan entry.
     * The entry is looked up in the caller's effective plan (meal_plan_owner_id), so a linked user can
     * tick a shared meal; an entry outside that plan is "not found", exactly as removeEntry treats it.
     * The tick itself belongs to the caller: a linked partner's tick is a separate row and is never
     * read or written here.
     *
     * <p>Ticking is an idempotent insert that keeps the first eaten_at; the response reads the stored
     * row back, so a re-tick reports the original time. eaten_at is UTC wall time (the JDBC URL pins
     * serverTimezone=UTC) and is exposed as an Instant. Unticking deletes only the caller's row.
     *
     * @return the caller's new state, or empty when the entry is not in the caller's effective plan
     */
    @Transactional
    public Optional<MealPlanEntryEatenDTO> setEntryEaten(Long userId, Long entryId, boolean eaten) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
        return mealPlanEntryRepository.findByIdAndUserId(entryId, effectiveOwnerId)
            .map(entry -> {
                if (!eaten) {
                    mealPlanEntryEatenRepository.deleteByEntryAndUser(entry.getId(), userId);
                    return new MealPlanEntryEatenDTO(entry.getId(), false, null);
                }
                mealPlanEntryEatenRepository.insertIfAbsent(entry.getId(), userId, LocalDateTime.now(ZoneOffset.UTC));
                LocalDateTime eatenAt = mealPlanEntryEatenRepository.findByMealPlanEntryIdAndUserId(entry.getId(), userId)
                    .map(MealPlanEntryEaten::getEatenAt)
                    .orElseThrow(() -> new IllegalStateException(
                        "Eaten tick for entry " + entry.getId() + " and user " + userId + " was not stored"));
                return new MealPlanEntryEatenDTO(entry.getId(), true, toUtcInstant(eatenAt));
            });
    }

    /** MPP-33: the caller's own ticks for these entries, entry id -> UTC eaten_at. Unique per (entry, user). */
    private Map<Long, LocalDateTime> getEatenAtByEntry(Long userId, List<Long> entryIds) {
        if (entryIds.isEmpty()) return Map.of();
        return mealPlanEntryEatenRepository.findByUserIdAndMealPlanEntryIdIn(userId, entryIds).stream()
            .collect(Collectors.toMap(MealPlanEntryEaten::getMealPlanEntryId, MealPlanEntryEaten::getEatenAt));
    }
```
(Keep the existing `toUtcInstant` helper directly below.)

5. In `getRecipeAssignments` (lines 437-446), replace the stream with:
```java
        List<Long> entryIds = entries.stream().map(MealPlanEntry::getId).toList();
        Map<Long, LocalDateTime> eatenByEntry = getEatenAtByEntry(userId, entryIds);
        return entries.stream()
            .map(e -> convertToDTO(e, Map.of(), eatenByEntry.get(e.getId())))
            .collect(Collectors.toList());
```
6. `buildDayDTO`: add a trailing parameter `Map<Long, LocalDateTime> eatenByEntry`, and change its mapping line to
```java
            .map(e -> convertToDTO(e, choicesByEntry.getOrDefault(e.getId(), Map.of()), eatenByEntry.get(e.getId())))
```
7. Delete the one-argument `convertToDTO(MealPlanEntry entry)` overload (lines 495-497). Change the remaining overload's signature to `convertToDTO(MealPlanEntry entry, Map<Long, Boolean> extraChoices, LocalDateTime eatenAt)` and replace its last two setters with:
```java
        dto.setEaten(eatenAt != null);              // MPP-33: the caller's own tick
        dto.setEatenAt(toUtcInstant(eatenAt));
```

- [x] **Step 4: Run the tests and confirm they pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest+MealPlanControllerTest`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 7: Unmap eaten/eatenAt from MealPlanEntry ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/MealPlanEntry.java:191-197`

- [x] **Step 1: Delete the two MPP-12 fields**

Remove these lines entirely:
```java
    // MPP-12: one shared eaten state per entry (linked users write the owner's row)
    @Column(name = "eaten", nullable = false)
    private Boolean eaten = false;

    // MPP-12: UTC wall time of the first tick; null when not eaten
    @Column(name = "eaten_at")
    private LocalDateTime eatenAt;
```
In their place, add one comment line above `createdAt`:
```java
    // MPP-33: eaten is per person - see MealPlanEntryEaten. The legacy eaten/eaten_at columns are unmapped until cleanup.
```

- [x] **Step 2: Confirm nothing references the removed accessors (main and test)**

Run: `cd foodbytes-app\foodbytes-api; mvn -q test-compile`
Expected: `BUILD SUCCESS`. A leftover `MealPlanEntry.getEaten()`/`setEatenAt(...)` anywhere would fail compilation here. The remaining `getEaten`/`setEaten` calls are on `MealPlanEntryDTO` and `MealPlanEntryEatenRequest`, which keep their fields.

- [x] **Step 3: Compile and run the meal-plan tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest+MealPlanControllerTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 8: Correct the eaten comments on MealPlanEntryDTO and MealPlanController ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanEntryDTO.java:32-33`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/MealPlanController.java:116-121`

- [x] **Step 1: Edit the comments**

`MealPlanEntryDTO`:
```java
    private Boolean eaten;            // MPP-33: the CALLER's own tick (a linked partner's never shows)
    private Instant eatenAt;          // MPP-33: caller's first tick, null when not eaten; ISO-8601 UTC ("...Z")
```
`MealPlanController.setEaten` Javadoc: replace the line `One shared state per entry: a linked user (meal_plan_owner_id) writes the owner's row.` with `MPP-33: writes the caller's own tick; the entry must be in the caller's (possibly shared) plan.`

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

---

## Phase 3 — Per-person Pip (backend)

Makes `PetService` read and write the caller's own row. The phase ends with `PetServiceTest` green and no "owner's pet" wording left on the backend.

### Task 9: PetService uses the caller's own row ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java`

- [x] **Step 1: Rewrite the linked-user tests (failing)**

In `PetServiceTest`:
- Replace the class Javadoc with `/** MPP-14 / MPP-33: each person has their own pet. A linked user (meal_plan_owner_id) reads and renames THEIR OWN pet, with their own meal times; the plan owner's are never used. */`
- Add the import `static org.mockito.Mockito.never` and `static org.mockito.Mockito.verify`.
- Replace `getPet_linkedUser_returnsOwnersNameAndOwnersMealTimes`, `renamePet_byLinkedUser_writesTheOwnersRow` and `getPet_whenOwnerRowMissing_fallsBackToTheCallersOwnPet` with:

```java
    @Test
    void getPet_linkedUser_returnsTheirOwnDefaultsNotTheOwners() {
        owner.setPetName("Mochi");
        owner.setLunchBy(LocalTime.of(12, 30));
        linked.setLunchBy(LocalTime.of(14, 0));
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));

        PetDTO pet = petService.getPet(LINKED_ID);

        assertThat(pet.getName()).isEqualTo("Pip");
        assertThat(pet.isCustomName()).isFalse();
        assertThat(pet.getMealTimes().getLunchBy()).isEqualTo("14:00");
        verify(userRepository, never()).findById(OWNER_ID);
    }

    @Test
    void getPet_ownerAndLinkedUser_eachGetTheirOwnNameAndTimes() {
        owner.setPetName("Mochi");
        owner.setDinnerBy(LocalTime.of(19, 0));
        linked.setPetName("Bao");
        linked.setDinnerBy(LocalTime.of(20, 30));
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));

        PetDTO ownersPet = petService.getPet(OWNER_ID);
        PetDTO linkedPet = petService.getPet(LINKED_ID);

        assertThat(ownersPet.getName()).isEqualTo("Mochi");
        assertThat(ownersPet.getMealTimes().getDinnerBy()).isEqualTo("19:00");
        assertThat(linkedPet.getName()).isEqualTo("Bao");
        assertThat(linkedPet.getMealTimes().getDinnerBy()).isEqualTo("20:30");
    }

    @Test
    void renamePet_byLinkedUser_writesOnlyTheirOwnRow() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));
        stubSave();

        PetDTO pet = petService.renamePet(LINKED_ID, "Bao");

        assertThat(linked.getPetName()).isEqualTo("Bao");
        assertThat(owner.getPetName()).isNull();
        assertThat(pet.getName()).isEqualTo("Bao");
        verify(userRepository, never()).findById(OWNER_ID);
    }
```

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest`
Expected: FAIL. `getPet_linkedUser_returnsTheirOwnDefaultsNotTheOwners` fails its `verify(userRepository, never()).findById(OWNER_ID)`, and `getPet_ownerAndLinkedUser_eachGetTheirOwnNameAndTimes` returns "Mochi" for the linked user. Both happen because the current `resolveOwner` still loads the owner's row.

- [x] **Step 2: Rewrite PetService**

Replace the class (keep the package and imports, but drop `lombok.extern.slf4j.Slf4j`) with:
```java
/**
 * MPP-14 / MPP-33: the caller's own pet. Each person has their own Pip: the name and the MPP-13 meal
 * times are read from and written to the caller's users row, even when users.meal_plan_owner_id
 * links them to someone else's meal plan. The meal plan is shared; the pet is not.
 */
@Service
@RequiredArgsConstructor
public class PetService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PetDTO getPet(Long userId) {
        return PetPolicy.toDTO(findUser(userId));
    }

    /** Renames the caller's own pet; null/blank resets to the default name. */
    @Transactional
    public PetDTO renamePet(Long userId, String name) {
        User user = findUser(userId);
        user.setPetName(PetPolicy.normalise(name));
        return PetPolicy.toDTO(userRepository.save(user));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }
}
```

- [x] **Step 3: Run the tests and confirm they pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest`
Expected: `BUILD SUCCESS`, 0 failures. The untouched tests (`getPet_unlinkedUserWithNoName_returnsPipAndDefaultTimes`, `renamePet_trimsTheName`, `renamePet_blank_resetsToTheDefault`, `getPet_whenCallerRowMissing_throws`) still pass.

### Task 10: Correct the per-owner pet comments on PetPolicy, PetDTO, PetController and User ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetPolicy.java:138-144`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetDTO.java:7-17`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetController.java:67-69`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/User.java:66-71`

- [x] **Step 1: Edit**

`PetPolicy.toDTO`: rename the parameter `owner` → `user` (and its two uses: `user.getPetName()`, `MealTimesPolicy.effective(user)`).

`PetDTO`:
```java
/**
 * MPP-14 / MPP-33: the caller's own pet. Each person has their own name and meal times, even when
 * they share a meal plan with someone else.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetDTO {
    private String name;              // effective name, never null ("Pip" by default)
    private boolean customName;       // true when the caller has saved a name
    private MealTimesDTO mealTimes;   // the caller's effective meal times (MPP-13 shape)
}
```

`PetController` class Javadoc: `MPP-14 / MPP-33: the caller's own pet (see PetService).`

`User.petName` Javadoc:
```java
    /**
     * MPP-14 / MPP-33: this user's pet name. Every user has their own pet, linked or not. NULL means
     * "use the default" (PetPolicy.DEFAULT_NAME) — no initialiser, same reason as defaultServings.
     */
```

- [x] **Step 2: Confirm no "owner's pet" wording remains on the backend**

Run: `Get-ChildItem -Path foodbytes-app\foodbytes-api\src -Recurse -Include *.java | Select-String -Pattern "resolveOwner|OWNER's pet|owner's meal times|plan's pet|OWNER's effective|OWNER's row only"`
Expected: zero hits.

- [x] **Step 3: Compile and run the pet tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest+MealPlanServiceTest`
Expected: `BUILD SUCCESS`, 0 failures.

---

## Phase 4 — Frontend comments

No logic or shape change: the client already renders `entry.eaten` and `pet.*` as given, and these now carry the caller's own values. This phase only corrects the comments that still describe shared ticks and the owner's pet. It ends with a green `npm run build`.

### Task 11: Correct shared-tick and owner-pet comments in the client ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/services/petService.js:3-6`
- Modify: `foodbytes-app/client/src/services/mealPlanService.js:56-58`
- Modify: `foodbytes-app/client/src/contexts/PetContext.jsx:14-27`
- Modify: `foodbytes-app/client/src/utils/petMood.js:12-19`
- Modify: `foodbytes-app/client/src/components/pet/PetNameEditor.jsx:6-10`
- Modify: `foodbytes-app/client/src/components/recipes/MealEatenSection.jsx:11-17`

- [x] **Step 1: Edit the comments**

- `petService.js`: replace the block with `/** MPP-14 / MPP-33: your own pet — its name and your own effective meal times. A linked user has their own pet; only the meal plan is shared. */`
- `mealPlanService.js`: replace `One shared state per entry,\n   * so a linked user's tick is the owner's tick.` with `The tick is yours alone (MPP-33):\n   * a linked partner ticks the same shared meal separately.`
- `PetContext.jsx`: in the header comment, `the plan's pet — its name, the owner's meal times` → `your own pet (MPP-33) — its name, your meal times`, and `again (picks up a partner's ticks)` → `again (picks up ticks made on another device)`.
- `petMood.js`: replace `derived from data both linked users share — so both\n * devices agree and a reload changes nothing.` with `derived from YOUR ticks on the (possibly shared)\n * plan (MPP-33) — so every device you use agrees and a reload changes nothing.`, and `time (the plan owner's) has passed` → `time (yours) has passed`.
- `PetNameEditor.jsx`: `MPP-14 AC 8: either linked user can rename the plan's pet.` → `MPP-14 / MPP-33: rename your own pet.`
- `MealEatenSection.jsx`: `One shared state per entry - no "ticked by" (AC 6).` → `The tick is the viewer's own (MPP-33); a linked partner's tick never shows here.`

- [x] **Step 2: Confirm no stale wording remains**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "owner's tick|One shared state|OWNER's pet|plan's pet|partner's ticks|plan owner's|both linked users share"`
Expected: zero hits.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 5 — Final verification

No production changes beyond the version bump. These are sanity checks that the cumulative work is clean.

### Task 12: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-33 is a **Story**, so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-33: per-person eaten ticks and per-person Pip (meal plan stays shared)`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 13: Grep for stale references ✓

- Skill: none — verification only

**Files:**
- (none — read-only grep)

- [x] **Step 1: Confirm no code reads the old shared columns**

Run: `Get-ChildItem -Path foodbytes-app\foodbytes-api\src\main -Recurse -Include *.java | Select-String -Pattern "name = \"eaten\"|name = \"eaten_at\"|resolveOwner"`
Expected: zero hits.

### Task 14: Run the full backend test suite ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 15: Production build ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 16: Update the PR description ✓

- Skill: none — documentation for the developer

**Files:**
- Create: `.claude/contract/MPP-33-per-person-pip/pr-description.md`

- [x] **Step 1: Write `pr-description.md` in this plan folder for the developer to paste**

Include:
- A link to `plan.md` in this folder.
- A summary: per-person `meal_plan_entry_eaten` ticks, caller-only `eaten`/`eatenAt` on week and assignment reads, per-user Pip. Also the new version from Task 12.
- **Migration ordering:** `2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql` is applied locally only. It is listed in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`, and goes to Railway before the backend deploys when the epic branch merges to master.
- **Follow-up ticket needed:** a cleanup migration that drops `meal_plan_entries.eaten` / `eaten_at` once this deploy is verified.
- Behaviour notes: the 5 existing shared ticks are dropped, everyone's mood resets on deploy, and linked users start at "Pip" with default meal times.
- Verification results from Tasks 2, 6, 7, 9, 14 and 15.
- A one-line convention note: "eaten" is per person (`MealPlanEntryEaten`); the meal plan, shopping list, templates and extra choices stay shared via `meal_plan_owner_id`.
- Suggested commit subject: `MPP-33: per-person eaten ticks and per-person Pip`.

---

## Self-review

**Spec coverage:**
- Migration creating `meal_plan_entry_eaten`, no carry-over (AC 1) — Tasks 1, 2 (local apply), 3 (Railway deferred to the epic merge).
- Entity and repository — Tasks 4, 5.
- `setEntryEaten` writes and deletes the caller's row and keeps the first `eaten_at` (AC 2) — Task 6.
- Week reads (and assignment reads) return the caller's ticks only (AC 3) — Task 6.
- `MealPlanEntry` drops its eaten mapping — Task 7.
- Per-user Pip name and meal times (AC 4) — Task 9.
- Shared parts unchanged (AC 5) — no task touches assign/copy/swap/shopping/templates/choices logic; the existing tests in `MealPlanServiceTest` stay green (Tasks 6, 7, 14).
- Tests: two linked users tick independently, an untick leaves the other's tick, PetService per-user (AC 6) — Tasks 6 (`setEntryEaten_twoLinkedUsers_tickAndUntickIndependently`, `getWeekPlan_linkedPartner_…`) and 9; `mvn test` — Task 14.
- Stale comments, backend and frontend — Tasks 8, 10, 11.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command.

**Type / name consistency:** `MealPlanEntryEaten` (fields `id`, `mealPlanEntryId`, `userId`, `eatenAt`), `MealPlanEntryEatenRepository` (`findByUserIdAndMealPlanEntryIdIn`, `findByMealPlanEntryIdAndUserId`, `insertIfAbsent`, `deleteByEntryAndUser`), `MealPlanService.getEatenAtByEntry`, `convertToDTO(entry, extraChoices, eatenAt)`, table `meal_plan_entry_eaten`, and constraint `uk_mpe_eaten_entry_user` are spelled identically in plan.md Data shapes, Tasks 1, 4, 5 and 6, and the tests. The migration filename `2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql` is identical in Tasks 1, 2, 3 and 16.

**Phase boundary cleanliness:**
- Phase 1 — SQL only (local DB); the Java build is untouched and green.
- Phase 2 — the service no longer reads the entity's eaten fields before Task 7 removes them, so each task compiles; it ends with the meal-plan tests green.
- Phase 3 — PetService and its tests change together; it ends green.
- Phase 4 — comment-only edits; it ends with a green `npm run build`.
- Phase 5 — bump plus read-only checks.
