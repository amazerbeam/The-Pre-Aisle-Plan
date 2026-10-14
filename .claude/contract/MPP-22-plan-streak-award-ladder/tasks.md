# Tasks: Plan streak and the repeating milestone ladder (awards ledger)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-13

**Goal:** A per-person plan streak, one 30-day repeating milestone ladder shared with the two MPP-20 habit streaks, an idempotent award ledger, and `GET /api/pet/awards` exposing `current / best / counts / next` per streak type for the caller.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-13-mpp22-pet-awards.sql`: the `pet_awards` ledger.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/StreakType.java`: the PLAN / SNACK / ALCOHOL enum.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetAward.java`: the ledger entity.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetAwardRepository.java`: `findByUserId` and `insertIfAbsent`.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/AwardStatusDTO.java`: one streak type's cabinet status.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/NextMilestoneDTO.java`: `{milestone, inDays}`.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/StreakRuns.java`: turns dated day outcomes into runs, `current` and `best`.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PlanStreakPolicy.java`: the one plan-day definition.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/AwardLadder.java`: the ladder constant, ladder day, awards per run, and the next milestone.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PlanStreakService.java`: the caller's plan runs from their own ticks on the shared plan.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/AwardService.java`: computes all three streak types, syncs the ledger and builds the response.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetAwardController.java`: `GET /api/pet/awards`.
- Tests: `StreakRunsTest`, `PlanStreakPolicyTest`, `AwardLadderTest`, `PlanStreakServiceTest`, `AwardServiceTest` (all `src/test/java/com/foodbytes/service/`), `PetAwardControllerTest` (`src/test/java/com/foodbytes/controller/`).
- `.claude/contract/MPP-22-plan-streak-award-ladder/pr-description.md`.

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanEntryRepository.java`: adds the `PlannedMealSlot` projection and `findMainMealSlots`.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanEntryEatenRepository.java`: adds `findEarliestEatenPlanDate`.
- `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`: adds the order 3 row.
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md`: the version bump.

**Deleted:** (none)

---

## Phase 1 — Schema (local DB)

Write the ledger migration, apply it to the local `foodbytes-db`, and record it for the Railway merge. Nothing in Java references `pet_awards` yet, so the app still starts and the build is untouched. This is a safe stop.

### Task 1: Write the migration file ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-13-mpp22-pet-awards.sql`

- [x] **Step 1: Create the file with this exact content**

```sql
-- MPP-22: Pip's award ledger - one row per milestone crossed on a streak.
--
-- A streak (PLAN, SNACK or ALCOHOL) earns a milestone each time its running length passes a ladder
-- day: 1, 3, 5, 7, 14, 21, 30, repeating every 30 days (streak day s -> ladder day ((s-1) mod 30)+1,
-- cycle_index = (s-1) div 30). A row is identified by who earned it, on which streak type, which
-- milestone, the run's first day and the cycle, so recording the same award twice is a no-op
-- (uk_pet_awards). Counts per milestone are COUNT(*) per (user_id, streak_type, milestone).
-- Rows are never deleted by the app: an award stays earned even if a later untick shortens the run.
--
-- Per person (MPP-33): user_id is the person who earned it, never the meal-plan owner.
--
-- Lossless: creates a new, empty table; no existing row is read or changed (13 users locally,
-- no award data exists anywhere yet).
--
-- MUST be applied before the backend that maps PetAward deploys (ddl-auto: validate).
-- MPP-15 is local-first: applied to the local foodbytes-db now; listed as order 3 in
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

CREATE TABLE IF NOT EXISTS pet_awards (
  id           BIGINT           NOT NULL AUTO_INCREMENT,
  user_id      BIGINT           NOT NULL,
  streak_type  VARCHAR(16)      NOT NULL,
  milestone    TINYINT UNSIGNED NOT NULL,
  streak_start DATE             NOT NULL,
  cycle_index  INT              NOT NULL,
  awarded_at   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_awards (user_id, streak_type, milestone, streak_start, cycle_index),
  CONSTRAINT chk_pet_awards_streak_type CHECK (streak_type IN ('PLAN','SNACK','ALCOHOL')),
  CONSTRAINT chk_pet_awards_milestone   CHECK (milestone IN (1,3,5,7,14,21,30)),
  CONSTRAINT chk_pet_awards_cycle_index CHECK (cycle_index >= 0),
  CONSTRAINT fk_pet_awards_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

- [x] **Step 2: Verify the file exists**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-10-13-mpp22-pet-awards.sql`
Expected: one file listed.

### Task 2: Apply the migration to the local foodbytes-db ✓

- Skill: none — DBA operation against the local Docker MySQL (local-first epic; Railway is not touched)

**Files:**
- (none — database state only)

- [x] **Step 1: Apply**

Run (Bash): `docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app/database/migrations/2026-10-13-mpp22-pet-awards.sql`
Expected: no output other than the password warning.

- [x] **Step 2: Verify structure and constraints inside a rolled-back transaction**

Run (Bash): `docker exec foodbytes-db mysql --force -uroot -prootpassword foodbytes -e "SHOW COLUMNS FROM pet_awards; START TRANSACTION; SET @u := (SELECT MIN(id) FROM users); INSERT INTO pet_awards (user_id, streak_type, milestone, streak_start, cycle_index) VALUES (@u, 'PLAN', 1, '2026-10-01', 0); INSERT INTO pet_awards (user_id, streak_type, milestone, streak_start, cycle_index) VALUES (@u, 'PLAN', 1, '2026-10-01', 0); INSERT INTO pet_awards (user_id, streak_type, milestone, streak_start, cycle_index) VALUES (@u, 'PLAN', 2, '2026-10-01', 0); INSERT INTO pet_awards (user_id, streak_type, milestone, streak_start, cycle_index) VALUES (@u, 'CRISPS', 1, '2026-10-01', 0); INSERT INTO pet_awards (user_id, streak_type, milestone, streak_start, cycle_index) VALUES (@u, 'PLAN', 1, '2026-10-01', 0) ON DUPLICATE KEY UPDATE id = id; INSERT INTO pet_awards (user_id, streak_type, milestone, streak_start, cycle_index) VALUES (@u, 'PLAN', 1, '2026-10-01', 1); SELECT COUNT(*) AS awards FROM pet_awards; ROLLBACK; SELECT COUNT(*) AS after_rollback FROM pet_awards;"`
Expected:
- Columns `id bigint`, `user_id bigint`, `streak_type varchar(16)`, `milestone tinyint unsigned`, `streak_start date`, `cycle_index int`, `awarded_at timestamp` with default `CURRENT_TIMESTAMP`.
- `ERROR 1062 … Duplicate entry` for the second insert.
- `ERROR 3819 … Check constraint 'chk_pet_awards_milestone' is violated` for milestone 2.
- `ERROR 3819 … Check constraint 'chk_pet_awards_streak_type' is violated` for `CRISPS`.
- `awards 2`: the upsert stays one row, and cycle 1 is a separate award. Then `after_rollback 0`.

### Task 3: Record the migration in the epic's Railway checklist ✓

- Skill: none — release bookkeeping for the MPP-15 merge

**Files:**
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` (append one table row)

- [x] **Step 1: Append the row directly under the MPP-20 row**

```markdown
| 3 | MPP-22 | foodbytes-app/database/migrations/2026-10-13-mpp22-pet-awards.sql | 2026-10-13 | — |
```

- [x] **Step 2: Verify**

Run: `Select-String -Path .claude\contract\MPP-15-epic-breakdown\railway-migrations.md -Pattern "mpp22-pet-awards"`
Expected: exactly one hit.

---

## Phase 2 — Domain model and queries

Map the ledger and add the two read queries the plan streak needs. Nothing calls them yet, so the phase ends with a clean compile and no behaviour change. Spring Data parses the JPQL at boot, and that is proven in Task 15.

### Task 4: StreakType enum and PetAward entity ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/StreakType.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetAward.java`

- [x] **Step 1: Create `StreakType.java`**

```java
package com.foodbytes.model;

/**
 * MPP-22: the three streaks that share Pip's milestone ladder. SNACK and ALCOHOL mirror
 * {@link Habit} (MPP-20); PLAN is derived from the caller's own eaten ticks.
 */
public enum StreakType {
    PLAN, SNACK, ALCOHOL;

    public static StreakType of(Habit habit) {
        return valueOf(habit.name());
    }
}
```

- [x] **Step 2: Create `PetAward.java`**

```java
package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * MPP-22: one milestone earned on one run of one streak. Identified by
 * (user, streak type, milestone, run start, cycle) so recording it twice is a no-op; written only by
 * PetAwardRepository#insertIfAbsent from AwardService. Never deleted by the app.
 */
@Entity
@Table(name = "pet_awards", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_awards",
            columnNames = {"user_id", "streak_type", "milestone", "streak_start", "cycle_index"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetAward {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "streak_type", nullable = false, length = 16)
    private StreakType streakType;

    // Ladder day earned: 1, 3, 5, 7, 14, 21 or 30 (AwardLadder.MILESTONES)
    @Column(name = "milestone", nullable = false)
    private Integer milestone;

    // First counted day of the run that earned it
    @Column(name = "streak_start", nullable = false)
    private LocalDate streakStart;

    // 0 for streak days 1-30, 1 for 31-60, ...
    @Column(name = "cycle_index", nullable = false)
    private Integer cycleIndex;

    // DB default CURRENT_TIMESTAMP (UTC, as the JDBC URL pins serverTimezone=UTC); audit only
    @Column(name = "awarded_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime awardedAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetAward other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetAward.class.hashCode();
    }
}
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS` with 0 errors (quiet mode prints nothing on success).

### Task 5: PetAwardRepository ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetAwardRepository.java`

- [x] **Step 1: Create the repository**

```java
package com.foodbytes.repository;

import com.foodbytes.model.PetAward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

/** MPP-22: the caller's award ledger. */
@Repository
public interface PetAwardRepository extends JpaRepository<PetAward, Long> {

    /** Every award one user has earned, across all streak types. */
    List<PetAward> findByUserId(Long userId);

    /**
     * Records an award, or leaves an existing identical one untouched. Parallel syncs for the same
     * user converge on uk_pet_awards instead of failing.
     */
    @Modifying
    @Query(value = "INSERT INTO pet_awards (user_id, streak_type, milestone, streak_start, cycle_index) " +
                   "VALUES (:userId, :streakType, :milestone, :streakStart, :cycleIndex) " +
                   "ON DUPLICATE KEY UPDATE id = id",
           nativeQuery = true)
    void insertIfAbsent(@Param("userId") Long userId,
                        @Param("streakType") String streakType,
                        @Param("milestone") int milestone,
                        @Param("streakStart") LocalDate streakStart,
                        @Param("cycleIndex") int cycleIndex);
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS` with 0 errors.

### Task 6: MealPlanEntryRepository — PlannedMealSlot projection and findMainMealSlots ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanEntryRepository.java` (imports + new members before `deleteByUserIdAndDateRange`)

- [x] **Step 1: Add the import**

Add `import java.util.Collection;` to the import block.

- [x] **Step 2: Add the projection and query directly above the `deleteByUserIdAndDateRange` Javadoc**

```java
    /** MPP-22: id + date of one planned slot, without loading the recipe. */
    interface PlannedMealSlot {
        Long getId();
        LocalDate getPlanDate();
    }

    /**
     * MPP-22: the owner's planned slots of the given meal types (breakfast/lunch/dinner for the plan
     * streak) between from and to, both inclusive.
     */
    @Query("SELECT mpe.id AS id, mpe.planDate AS planDate FROM MealPlanEntry mpe " +
           "WHERE mpe.user.id = :ownerId " +
           "AND mpe.meal.key IN :mealKeys " +
           "AND mpe.planDate >= :from " +
           "AND mpe.planDate <= :to")
    List<PlannedMealSlot> findMainMealSlots(
        @Param("ownerId") Long ownerId,
        @Param("mealKeys") Collection<String> mealKeys,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS` with 0 errors.

### Task 7: MealPlanEntryEatenRepository — findEarliestEatenPlanDate ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanEntryEatenRepository.java` (imports + one method after `findByMealPlanEntryIdAndUserId`)

- [x] **Step 1: Add the import**

Add `import java.time.LocalDate;` to the import block.

- [x] **Step 2: Add the query directly after `findByMealPlanEntryIdAndUserId`**

```java
    /**
     * MPP-22: plan date of this user's earliest tick, or empty with no ticks. No counted plan day can
     * exist before it, so the plan streak scans from here.
     */
    @Query("SELECT MIN(mpe.planDate) FROM MealPlanEntry mpe, MealPlanEntryEaten t " +
           "WHERE t.mealPlanEntryId = mpe.id AND t.userId = :userId")
    Optional<LocalDate> findEarliestEatenPlanDate(@Param("userId") Long userId);
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS` with 0 errors.

---

## Phase 3 — Rules (pure, tested in isolation)

The DTOs and the three static rules classes, each test-first. Nothing here touches storage, and nothing outside these classes calls them yet. The phase ends with the new tests green and the app unchanged at runtime.

### Task 8: AwardStatusDTO and NextMilestoneDTO ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/NextMilestoneDTO.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/AwardStatusDTO.java`

- [x] **Step 1: Create `NextMilestoneDTO.java`**

```java
package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-22: the next ladder milestone on a streak and how many more counted days reach it. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NextMilestoneDTO {
    private int milestone;
    private int inDays;
}
```

- [x] **Step 2: Create `AwardStatusDTO.java`**

```java
package com.foodbytes.dto;

import com.foodbytes.model.StreakType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

/**
 * MPP-22: one streak type's trophy-cabinet status for the caller. counts lists every ladder
 * milestone in ladder order, zeros included (JSON keys "1", "3", … "30").
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AwardStatusDTO {
    private StreakType streakType;
    private int current;
    private int best;
    private Map<Integer, Integer> counts;
    private NextMilestoneDTO next;
}
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS` with 0 errors.

### Task 9: StreakRuns with tests (TDD) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/StreakRuns.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/StreakRunsTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.service.StreakRuns.DayOutcome;
import com.foodbytes.service.StreakRuns.Run;
import com.foodbytes.service.StreakRuns.Summary;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.TreeMap;

import static com.foodbytes.service.StreakRuns.DayOutcome.BREAKS;
import static com.foodbytes.service.StreakRuns.DayOutcome.COUNTS;
import static com.foodbytes.service.StreakRuns.DayOutcome.NEUTRAL;
import static org.assertj.core.api.Assertions.assertThat;

/** MPP-22: runs are counted days between breaks; neutral and missing days are skipped. */
class StreakRunsTest {

    private static LocalDate d(int dayOfOctober) {
        return LocalDate.of(2026, 10, dayOfOctober);
    }

    private static TreeMap<LocalDate, DayOutcome> days(Object... dayThenOutcome) {
        TreeMap<LocalDate, DayOutcome> map = new TreeMap<>();
        for (int i = 0; i < dayThenOutcome.length; i += 2) {
            map.put(d((Integer) dayThenOutcome[i]), (DayOutcome) dayThenOutcome[i + 1]);
        }
        return map;
    }

    @Test
    void noDays_isEmpty() {
        Summary s = StreakRuns.summarise(new TreeMap<>());
        assertThat(s.runs()).isEmpty();
        assertThat(s.current()).isZero();
        assertThat(s.best()).isZero();
    }

    @Test
    void neutralDay_neitherCountsNorBreaks() {
        Summary s = StreakRuns.summarise(days(1, COUNTS, 2, NEUTRAL, 3, COUNTS));
        assertThat(s.runs()).containsExactly(new Run(d(1), 2));
        assertThat(s.current()).isEqualTo(2);
    }

    @Test
    void missingDates_areNeutral() {
        Summary s = StreakRuns.summarise(days(1, COUNTS, 5, COUNTS));
        assertThat(s.runs()).containsExactly(new Run(d(1), 2));
    }

    @Test
    void break_endsTheRun_andANewOneStartsAfterIt() {
        Summary s = StreakRuns.summarise(days(1, COUNTS, 2, COUNTS, 3, BREAKS, 4, COUNTS));
        assertThat(s.runs()).containsExactly(new Run(d(1), 2), new Run(d(4), 1));
        assertThat(s.current()).isEqualTo(1);
        assertThat(s.best()).isEqualTo(2);
    }

    @Test
    void trailingBreak_leavesNoCurrentStreak_butKeepsBest() {
        Summary s = StreakRuns.summarise(days(1, COUNTS, 2, BREAKS));
        assertThat(s.current()).isZero();
        assertThat(s.best()).isEqualTo(1);
    }

    /**
     * Pins agreement with MPP-20: answers clean 1-3, then a lapse on the 4th reported on the 5th,
     * log as clean 1-3, not clean 4, clean 5 - HabitStreakService reports current 1, best 3.
     */
    @Test
    void mpp20HabitLogShape_matchesHabitStreakCurrentAndBest() {
        Summary s = StreakRuns.summarise(days(1, COUNTS, 2, COUNTS, 3, COUNTS, 4, BREAKS, 5, COUNTS));
        assertThat(s.current()).isEqualTo(1);
        assertThat(s.best()).isEqualTo(3);
    }
}
```

- [x] **Step 2: Run it and confirm it fails to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=StreakRunsTest`
Expected: `COMPILATION ERROR`, `cannot find symbol … StreakRuns`.

- [x] **Step 3: Implement `StreakRuns.java`**

```java
package com.foodbytes.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;

/**
 * MPP-22: turns a dated series of day outcomes into streak runs. Shared by the plan streak
 * (PlanStreakPolicy decides each day) and the habit streaks (the MPP-20 day log's clean flag).
 * A run is the counted days between breaks; neutral days and dates absent from the map are skipped.
 */
public final class StreakRuns {

    public enum DayOutcome { COUNTS, BREAKS, NEUTRAL }

    /** start = first counted day; length = counted days (≥ 1). */
    public record Run(LocalDate start, int length) {}

    /** current = last run's length if no break follows it, else 0; best = longest run, 0 if none. */
    public record Summary(List<Run> runs, int current, int best) {
        public static final Summary EMPTY = new Summary(List.of(), 0, 0);
    }

    private StreakRuns() {
    }

    public static Summary summarise(SortedMap<LocalDate, DayOutcome> days) {
        List<Run> runs = new ArrayList<>();
        LocalDate start = null;
        int length = 0;
        for (Map.Entry<LocalDate, DayOutcome> day : days.entrySet()) {
            switch (day.getValue()) {
                case COUNTS -> {
                    if (length == 0) {
                        start = day.getKey();
                    }
                    length++;
                }
                case BREAKS -> {
                    if (length > 0) {
                        runs.add(new Run(start, length));
                    }
                    start = null;
                    length = 0;
                }
                case NEUTRAL -> {
                }
            }
        }
        if (length > 0) {
            runs.add(new Run(start, length));
        }
        int best = runs.stream().mapToInt(Run::length).max().orElse(0);
        return new Summary(List.copyOf(runs), length, best);
    }
}
```

(`length` after the loop is the live run's length, or 0 when the last non-neutral day was a break, so it is `current`.)

- [x] **Step 4: Run it and confirm it passes**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=StreakRunsTest`
Expected: `Tests run: 6, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

### Task 10: PlanStreakPolicy with tests (TDD) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PlanStreakPolicy.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PlanStreakPolicyTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import org.junit.jupiter.api.Test;

import static com.foodbytes.service.StreakRuns.DayOutcome.BREAKS;
import static com.foodbytes.service.StreakRuns.DayOutcome.COUNTS;
import static com.foodbytes.service.StreakRuns.DayOutcome.NEUTRAL;
import static org.assertj.core.api.Assertions.assertThat;

/** MPP-22 AC 2: the plan-day definition. */
class PlanStreakPolicyTest {

    @Test
    void nothingPlanned_isNeutral() {
        assertThat(PlanStreakPolicy.dayOutcome(0, 0, false)).isEqualTo(NEUTRAL);
    }

    @Test
    void everyPlannedMealEaten_counts() {
        assertThat(PlanStreakPolicy.dayOutcome(3, 3, false)).isEqualTo(COUNTS);
        assertThat(PlanStreakPolicy.dayOutcome(3, 3, true)).isEqualTo(COUNTS);
    }

    @Test
    void pastDayWithAMissedMeal_breaks() {
        assertThat(PlanStreakPolicy.dayOutcome(3, 2, false)).isEqualTo(BREAKS);
    }

    @Test
    void pastDayWithNothingTicked_breaks() {
        assertThat(PlanStreakPolicy.dayOutcome(2, 0, false)).isEqualTo(BREAKS);
    }

    @Test
    void todayStillInProgress_isNeutral() {
        assertThat(PlanStreakPolicy.dayOutcome(3, 1, true)).isEqualTo(NEUTRAL);
    }
}
```

- [x] **Step 2: Run it and confirm it fails to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PlanStreakPolicyTest`
Expected: `COMPILATION ERROR`, `cannot find symbol … PlanStreakPolicy`.

- [x] **Step 3: Implement `PlanStreakPolicy.java`**

```java
package com.foodbytes.service;

import com.foodbytes.service.StreakRuns.DayOutcome;

import java.util.List;

/**
 * MPP-22: what "followed the plan" means for one day. The single place to change the definition
 * (the ticket leaves it open in the spec).
 */
public final class PlanStreakPolicy {

    /** meals.key values that make up a plan day; snacks and extras don't count. */
    public static final List<String> MAIN_MEAL_KEYS = List.of("breakfast", "lunch", "dinner");

    private PlanStreakPolicy() {
    }

    /**
     * A day counts when the caller ticked every breakfast/lunch/dinner planned that day on the shared
     * plan, and breaks when they didn't. A day with nothing planned is neutral, and so is today until
     * it's complete, so an un-ticked dinner at noon doesn't break the streak.
     */
    public static DayOutcome dayOutcome(int planned, int eatenByCaller, boolean isToday) {
        if (planned == 0) {
            return DayOutcome.NEUTRAL;
        }
        if (eatenByCaller >= planned) {
            return DayOutcome.COUNTS;
        }
        return isToday ? DayOutcome.NEUTRAL : DayOutcome.BREAKS;
    }
}
```

- [x] **Step 4: Run it and confirm it passes**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PlanStreakPolicyTest`
Expected: `Tests run: 5, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

### Task 11: AwardLadder with tests (TDD) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/AwardLadder.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/AwardLadderTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.dto.NextMilestoneDTO;
import com.foodbytes.model.StreakType;
import com.foodbytes.service.AwardLadder.AwardKey;
import com.foodbytes.service.StreakRuns.Run;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** MPP-22 AC 1: 1/3/5/7/14/21/30, repeating every 30 days. */
class AwardLadderTest {

    private static final LocalDate START = LocalDate.of(2026, 9, 1);

    @Test
    void ladderDay_wrapsEvery30() {
        assertThat(AwardLadder.ladderDay(0)).isZero();
        assertThat(AwardLadder.ladderDay(1)).isEqualTo(1);
        assertThat(AwardLadder.ladderDay(30)).isEqualTo(30);
        assertThat(AwardLadder.ladderDay(31)).isEqualTo(1);
        assertThat(AwardLadder.ladderDay(60)).isEqualTo(30);
        assertThat(AwardLadder.ladderDay(61)).isEqualTo(1);
    }

    @Test
    void shortRun_earnsOnlyTheMilestonesItPassed() {
        assertThat(AwardLadder.awardsFor(StreakType.PLAN, new Run(START, 4)))
                .containsExactly(
                        new AwardKey(StreakType.PLAN, 1, START, 0),
                        new AwardKey(StreakType.PLAN, 3, START, 0));
    }

    /** AC 5: day 31 re-earns the 1-day award in cycle 1. */
    @Test
    void crossingDay30IntoDay31_reEarnsTheOneDayAwardInTheNextCycle() {
        List<AwardKey> keys = AwardLadder.awardsFor(StreakType.SNACK, new Run(START, 31));

        assertThat(keys).hasSize(8);
        assertThat(keys.subList(0, 7)).extracting(AwardKey::milestone).containsExactly(1, 3, 5, 7, 14, 21, 30);
        assertThat(keys.subList(0, 7)).allMatch(k -> k.cycleIndex() == 0);
        assertThat(keys.get(7)).isEqualTo(new AwardKey(StreakType.SNACK, 1, START, 1));
    }

    @Test
    void next_isTheFirstMilestoneAboveTheLadderDay() {
        assertThat(AwardLadder.next(0)).isEqualTo(new NextMilestoneDTO(1, 1));
        assertThat(AwardLadder.next(1)).isEqualTo(new NextMilestoneDTO(3, 2));
        assertThat(AwardLadder.next(7)).isEqualTo(new NextMilestoneDTO(14, 7));
        assertThat(AwardLadder.next(29)).isEqualTo(new NextMilestoneDTO(30, 1));
    }

    @Test
    void next_afterAFullCycle_restartsAtOneDay() {
        assertThat(AwardLadder.next(30)).isEqualTo(new NextMilestoneDTO(1, 1));
        assertThat(AwardLadder.next(31)).isEqualTo(new NextMilestoneDTO(3, 2));
    }
}
```

- [x] **Step 2: Run it and confirm it fails to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=AwardLadderTest`
Expected: `COMPILATION ERROR`, `cannot find symbol … AwardLadder`.

- [x] **Step 3: Implement `AwardLadder.java`**

```java
package com.foodbytes.service;

import com.foodbytes.dto.NextMilestoneDTO;
import com.foodbytes.model.StreakType;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * MPP-22: the one milestone ladder shared by the plan, snack and alcohol streaks. Streak day s maps
 * to ladder day ((s-1) mod 30)+1, so the ladder repeats every 30 days and day 31 re-earns the 1-day
 * award (cycle 1).
 */
public final class AwardLadder {

    public static final List<Integer> MILESTONES = List.of(1, 3, 5, 7, 14, 21, 30);
    public static final int CYCLE = 30;

    /** Identity of one earned award — the columns of uk_pet_awards minus the user. */
    public record AwardKey(StreakType type, int milestone, LocalDate streakStart, int cycleIndex) {}

    private AwardLadder() {
    }

    /** 1..30 for streak day s ≥ 1; 0 for no streak. */
    public static int ladderDay(int streakDay) {
        return streakDay <= 0 ? 0 : ((streakDay - 1) % CYCLE) + 1;
    }

    /** Every award a run has earned, in the order its days were reached. */
    public static List<AwardKey> awardsFor(StreakType type, StreakRuns.Run run) {
        List<AwardKey> keys = new ArrayList<>();
        for (int s = 1; s <= run.length(); s++) {
            int day = ladderDay(s);
            if (MILESTONES.contains(day)) {
                keys.add(new AwardKey(type, day, run.start(), (s - 1) / CYCLE));
            }
        }
        return keys;
    }

    /** The next milestone above the current ladder day; after day 30 it is the next cycle's 1. */
    public static NextMilestoneDTO next(int current) {
        int day = ladderDay(current);
        return MILESTONES.stream()
                .filter(milestone -> milestone > day)
                .findFirst()
                .map(milestone -> new NextMilestoneDTO(milestone, milestone - day))
                .orElse(new NextMilestoneDTO(MILESTONES.get(0), 1));
    }
}
```

- [x] **Step 4: Run it and confirm it passes**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=AwardLadderTest`
Expected: `Tests run: 5, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

---

## Phase 4 — Services

The plan streak loader and the award orchestrator, each test-first with Mockito. They are reachable from no endpoint until Phase 5, so the phase ends with green tests and no runtime change.

### Task 12: PlanStreakService with tests (TDD) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PlanStreakService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PlanStreakServiceTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.model.MealPlanEntryEaten;
import com.foodbytes.repository.MealPlanEntryEatenRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.MealPlanEntryRepository.PlannedMealSlot;
import com.foodbytes.service.StreakRuns.Run;
import com.foodbytes.service.StreakRuns.Summary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * MPP-22 AC 2 / AC 5: the plan streak is per person. Linked users share the owner's planned slots
 * but each is scored on their own ticks only.
 */
@ExtendWith(MockitoExtension.class)
class PlanStreakServiceTest {

    private static final Long OWNER = 1L;
    private static final Long PARTNER = 2L;
    private static final Long OTHER_PARTNER = 3L;
    private static final LocalDate TODAY = LocalDate.of(2026, 10, 13);

    @Mock private ExtraChoiceService extraChoiceService;
    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private MealPlanEntryEatenRepository eatenRepository;

    private PlanStreakService service;

    @BeforeEach
    void setUp() {
        service = new PlanStreakService(extraChoiceService, mealPlanEntryRepository, eatenRepository);
    }

    private static LocalDate d(int dayOfOctober) {
        return LocalDate.of(2026, 10, dayOfOctober);
    }

    private static PlannedMealSlot slot(long id, LocalDate day) {
        return new PlannedMealSlot() {
            @Override public Long getId() { return id; }
            @Override public LocalDate getPlanDate() { return day; }
        };
    }

    private static List<MealPlanEntryEaten> ticks(Long userId, Long... entryIds) {
        return Arrays.stream(entryIds)
                .map(id -> new MealPlanEntryEaten(null, id, userId, LocalDateTime.of(2026, 10, 1, 12, 0)))
                .toList();
    }

    private void stubUser(Long userId, LocalDate firstTick, List<PlannedMealSlot> slots,
                          List<MealPlanEntryEaten> ticks) {
        when(eatenRepository.findEarliestEatenPlanDate(userId)).thenReturn(Optional.of(firstTick));
        when(extraChoiceService.resolveOwnerId(userId)).thenReturn(OWNER);
        when(mealPlanEntryRepository.findMainMealSlots(OWNER, PlanStreakPolicy.MAIN_MEAL_KEYS, firstTick, TODAY))
                .thenReturn(slots);
        when(eatenRepository.findByUserIdAndMealPlanEntryIdIn(eq(userId), anyCollection())).thenReturn(ticks);
    }

    @Test
    void noTicksEver_isEmpty_andSkipsThePlanRead() {
        when(eatenRepository.findEarliestEatenPlanDate(PARTNER)).thenReturn(Optional.empty());

        assertThat(service.planStreak(PARTNER, TODAY)).isEqualTo(Summary.EMPTY);
        verifyNoInteractions(mealPlanEntryRepository, extraChoiceService);
    }

    /** AC 5: two linked users with different eaten ticks get different plan streaks. */
    @Test
    void linkedUsersWithDifferentTicks_getDifferentPlanStreaks() {
        List<PlannedMealSlot> shared = List.of(
                slot(101, d(10)), slot(102, d(10)), slot(103, d(10)),
                slot(111, d(11)), slot(112, d(11)), slot(113, d(11)),
                slot(121, d(12)));
        stubUser(PARTNER, d(10), shared, ticks(PARTNER, 101L, 102L, 103L, 111L, 112L, 113L, 121L));
        stubUser(OTHER_PARTNER, d(10), shared, ticks(OTHER_PARTNER, 101L, 102L, 103L, 111L, 113L, 121L));

        Summary partner = service.planStreak(PARTNER, TODAY);
        Summary other = service.planStreak(OTHER_PARTNER, TODAY);

        assertThat(partner.runs()).containsExactly(new Run(d(10), 3));
        assertThat(partner.current()).isEqualTo(3);
        assertThat(other.runs()).containsExactly(new Run(d(10), 1), new Run(d(12), 1));
        assertThat(other.current()).isEqualTo(1);
        assertThat(other.best()).isEqualTo(1);
    }

    @Test
    void todayIncomplete_neitherCountsNorBreaks() {
        stubUser(PARTNER, d(12),
                List.of(slot(201, d(12)), slot(202, TODAY), slot(203, TODAY)),
                ticks(PARTNER, 201L, 202L));

        Summary s = service.planStreak(PARTNER, TODAY);

        assertThat(s.runs()).containsExactly(new Run(d(12), 1));
        assertThat(s.current()).isEqualTo(1);
    }
}
```

- [x] **Step 2: Run it and confirm it fails to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PlanStreakServiceTest`
Expected: `COMPILATION ERROR`, `cannot find symbol … PlanStreakService`.

- [x] **Step 3: Implement `PlanStreakService.java`**

```java
package com.foodbytes.service;

import com.foodbytes.model.MealPlanEntryEaten;
import com.foodbytes.repository.MealPlanEntryEatenRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.MealPlanEntryRepository.PlannedMealSlot;
import com.foodbytes.service.StreakRuns.DayOutcome;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * MPP-22: the caller's "followed the plan" streak. The slots come from the shared plan (the meal-plan
 * owner's entries); the ticks are always the caller's own (per-person Pip, MPP-33). Each day is
 * judged by PlanStreakPolicy#dayOutcome and the runs by StreakRuns.
 */
@Service
@RequiredArgsConstructor
public class PlanStreakService {

    private final ExtraChoiceService extraChoiceService;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealPlanEntryEatenRepository eatenRepository;

    /** Scans from the caller's first ticked plan date to today; nothing earlier can count. */
    @Transactional(readOnly = true)
    public StreakRuns.Summary planStreak(Long userId, LocalDate today) {
        Optional<LocalDate> firstTick = eatenRepository.findEarliestEatenPlanDate(userId);
        if (firstTick.isEmpty() || firstTick.get().isAfter(today)) {
            return StreakRuns.Summary.EMPTY;
        }
        Long ownerId = extraChoiceService.resolveOwnerId(userId);
        List<PlannedMealSlot> slots = mealPlanEntryRepository.findMainMealSlots(
                ownerId, PlanStreakPolicy.MAIN_MEAL_KEYS, firstTick.get(), today);
        if (slots.isEmpty()) {
            return StreakRuns.Summary.EMPTY;
        }

        Set<Long> eaten = eatenRepository
                .findByUserIdAndMealPlanEntryIdIn(userId, slots.stream().map(PlannedMealSlot::getId).toList())
                .stream()
                .map(MealPlanEntryEaten::getMealPlanEntryId)
                .collect(Collectors.toSet());

        SortedMap<LocalDate, DayOutcome> days = new TreeMap<>();
        slots.stream()
                .collect(Collectors.groupingBy(PlannedMealSlot::getPlanDate))
                .forEach((day, daySlots) -> {
                    int eatenCount = (int) daySlots.stream().filter(s -> eaten.contains(s.getId())).count();
                    days.put(day, PlanStreakPolicy.dayOutcome(daySlots.size(), eatenCount, day.equals(today)));
                });
        return StreakRuns.summarise(days);
    }
}
```

- [x] **Step 4: Run it and confirm it passes**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PlanStreakServiceTest`
Expected: `Tests run: 3, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

### Task 13: AwardService with tests (TDD) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/AwardService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/AwardServiceTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.dto.AwardStatusDTO;
import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.dto.NextMilestoneDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetAward;
import com.foodbytes.model.PetHabitDay;
import com.foodbytes.model.StreakType;
import com.foodbytes.repository.PetAwardRepository;
import com.foodbytes.repository.PetHabitDayRepository;
import com.foodbytes.service.StreakRuns.Run;
import com.foodbytes.service.StreakRuns.Summary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * MPP-22 AC 4 / AC 5: crossing day 30 into 31, re-earning after a lapse, idempotent sync, habit
 * awards from the MPP-20 day log, and the response shape.
 */
@ExtendWith(MockitoExtension.class)
class AwardServiceTest {

    private static final Long USER_ID = 2L;
    private static final LocalDate TODAY = LocalDate.of(2026, 10, 13);
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-10-13T12:00:00Z"), HabitStreakPolicy.ZONE);

    @Mock private PlanStreakService planStreakService;
    @Mock private HabitStreakService habitStreakService;
    @Mock private PetHabitDayRepository habitDayRepository;
    @Mock private PetAwardRepository awardRepository;

    private AwardService service;

    @BeforeEach
    void setUp() {
        service = new AwardService(planStreakService, habitStreakService, habitDayRepository, awardRepository, CLOCK);
    }

    private static LocalDate d(int dayOfOctober) {
        return LocalDate.of(2026, 10, dayOfOctober);
    }

    private static HabitStatusDTO habit(Habit habit, int current, int best) {
        return new HabitStatusDTO(habit, current, best, null, true, TODAY);
    }

    private static Map<Integer, Integer> counts(int c1, int c3, int c5, int c7, int c14, int c21, int c30) {
        return Map.of(1, c1, 3, c3, 5, c5, 7, c7, 14, c14, 21, c21, 30, c30);
    }

    /** Plan as given; both habits never answered; ledger as given. */
    private void stub(Summary plan, List<PetAward> ledger) {
        when(planStreakService.planStreak(USER_ID, TODAY)).thenReturn(plan);
        when(habitStreakService.getHabits(USER_ID))
                .thenReturn(List.of(habit(Habit.SNACK, 0, 0), habit(Habit.ALCOHOL, 0, 0)));
        when(habitDayRepository.findByUserIdAndHabitOrderByDayAsc(USER_ID, Habit.SNACK)).thenReturn(List.of());
        when(habitDayRepository.findByUserIdAndHabitOrderByDayAsc(USER_ID, Habit.ALCOHOL)).thenReturn(List.of());
        when(awardRepository.findByUserId(USER_ID)).thenReturn(ledger);
    }

    private static AwardStatusDTO status(List<AwardStatusDTO> all, StreakType type) {
        return all.stream().filter(s -> s.getStreakType() == type).findFirst().orElseThrow();
    }

    @Test
    void nothingEarned_returnsThreeZeroStatusesInOrder_andWritesNothing() {
        stub(Summary.EMPTY, List.of());

        List<AwardStatusDTO> result = service.getAwards(USER_ID);

        assertThat(result).extracting(AwardStatusDTO::getStreakType)
                .containsExactly(StreakType.PLAN, StreakType.SNACK, StreakType.ALCOHOL);
        assertThat(result).allSatisfy(s -> {
            assertThat(s.getCurrent()).isZero();
            assertThat(s.getBest()).isZero();
            assertThat(s.getCounts()).containsExactlyInAnyOrderEntriesOf(counts(0, 0, 0, 0, 0, 0, 0));
            assertThat(s.getCounts().keySet()).containsExactly(1, 3, 5, 7, 14, 21, 30);
            assertThat(s.getNext()).isEqualTo(new NextMilestoneDTO(1, 1));
        });
        verify(awardRepository, never()).insertIfAbsent(anyLong(), anyString(), anyInt(), any(), anyInt());
    }

    /** AC 5: crossing day 30 into day 31 re-earns the 1-day award (cycle 1). */
    @Test
    void crossingDay30IntoDay31_countsTheOneDayAwardTwice() {
        LocalDate start = LocalDate.of(2026, 9, 13);
        stub(new Summary(List.of(new Run(start, 31)), 31, 31), List.of());

        AwardStatusDTO plan = status(service.getAwards(USER_ID), StreakType.PLAN);

        verify(awardRepository, times(8)).insertIfAbsent(anyLong(), anyString(), anyInt(), any(), anyInt());
        verify(awardRepository).insertIfAbsent(USER_ID, "PLAN", 1, start, 1);
        assertThat(plan.getCounts()).containsExactlyInAnyOrderEntriesOf(counts(2, 1, 1, 1, 1, 1, 1));
        assertThat(plan.getCurrent()).isEqualTo(31);
        assertThat(plan.getNext()).isEqualTo(new NextMilestoneDTO(3, 2));
    }

    /** AC 5: a lapse ends the run; the next run re-earns from day 1 under its own start date. */
    @Test
    void reEarningAfterALapse_addsANewRunsAwards() {
        stub(new Summary(List.of(new Run(d(1), 3), new Run(d(5), 1)), 1, 3), List.of());

        AwardStatusDTO plan = status(service.getAwards(USER_ID), StreakType.PLAN);

        verify(awardRepository).insertIfAbsent(USER_ID, "PLAN", 1, d(1), 0);
        verify(awardRepository).insertIfAbsent(USER_ID, "PLAN", 3, d(1), 0);
        verify(awardRepository).insertIfAbsent(USER_ID, "PLAN", 1, d(5), 0);
        assertThat(plan.getCounts()).containsExactlyInAnyOrderEntriesOf(counts(2, 1, 0, 0, 0, 0, 0));
        assertThat(plan.getBest()).isEqualTo(3);
    }

    /** AC 5: awards already in the ledger are not written again, and still count. */
    @Test
    void secondSync_isIdempotent() {
        stub(new Summary(List.of(new Run(d(1), 3)), 3, 3), List.of(
                new PetAward(1L, USER_ID, StreakType.PLAN, 1, d(1), 0, null),
                new PetAward(2L, USER_ID, StreakType.PLAN, 3, d(1), 0, null)));

        AwardStatusDTO plan = status(service.getAwards(USER_ID), StreakType.PLAN);

        verify(awardRepository, never()).insertIfAbsent(anyLong(), anyString(), anyInt(), any(), anyInt());
        assertThat(plan.getCounts()).containsExactlyInAnyOrderEntriesOf(counts(1, 1, 0, 0, 0, 0, 0));
    }

    /** Habit awards come from the MPP-20 day log; current/best from HabitStreakService. */
    @Test
    void habitAwards_comeFromTheDayLog() {
        when(planStreakService.planStreak(USER_ID, TODAY)).thenReturn(Summary.EMPTY);
        when(habitStreakService.getHabits(USER_ID))
                .thenReturn(List.of(habit(Habit.SNACK, 1, 3), habit(Habit.ALCOHOL, 0, 0)));
        when(habitDayRepository.findByUserIdAndHabitOrderByDayAsc(USER_ID, Habit.SNACK)).thenReturn(List.of(
                new PetHabitDay(1L, USER_ID, Habit.SNACK, d(1), true),
                new PetHabitDay(2L, USER_ID, Habit.SNACK, d(2), true),
                new PetHabitDay(3L, USER_ID, Habit.SNACK, d(3), true),
                new PetHabitDay(4L, USER_ID, Habit.SNACK, d(4), false),
                new PetHabitDay(5L, USER_ID, Habit.SNACK, d(5), true)));
        when(habitDayRepository.findByUserIdAndHabitOrderByDayAsc(USER_ID, Habit.ALCOHOL)).thenReturn(List.of());
        when(awardRepository.findByUserId(USER_ID)).thenReturn(List.of());

        AwardStatusDTO snack = status(service.getAwards(USER_ID), StreakType.SNACK);

        verify(awardRepository).insertIfAbsent(USER_ID, "SNACK", 1, d(1), 0);
        verify(awardRepository).insertIfAbsent(USER_ID, "SNACK", 3, d(1), 0);
        verify(awardRepository).insertIfAbsent(USER_ID, "SNACK", 1, d(5), 0);
        assertThat(snack.getCurrent()).isEqualTo(1);
        assertThat(snack.getBest()).isEqualTo(3);
        assertThat(snack.getCounts()).containsExactlyInAnyOrderEntriesOf(counts(2, 1, 0, 0, 0, 0, 0));
        assertThat(snack.getNext()).isEqualTo(new NextMilestoneDTO(3, 2));
    }
}
```

- [x] **Step 2: Run it and confirm it fails to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=AwardServiceTest`
Expected: `COMPILATION ERROR`, `cannot find symbol … AwardService`.

- [x] **Step 3: Implement `AwardService.java`**

```java
package com.foodbytes.service;

import com.foodbytes.dto.AwardStatusDTO;
import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitDay;
import com.foodbytes.model.StreakType;
import com.foodbytes.repository.PetAwardRepository;
import com.foodbytes.repository.PetHabitDayRepository;
import com.foodbytes.service.AwardLadder.AwardKey;
import com.foodbytes.service.StreakRuns.DayOutcome;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * MPP-22: the caller's trophy cabinet. Each read re-derives every run of the plan, snack and alcohol
 * streaks, records any milestone not yet in the ledger (idempotent on uk_pet_awards) and reports
 * current / best / counts / next per streak type. Always the caller's own id — never the meal-plan
 * owner (per-person Pip, MPP-33).
 */
@Service
@RequiredArgsConstructor
public class AwardService {

    private final PlanStreakService planStreakService;
    private final HabitStreakService habitStreakService;
    private final PetHabitDayRepository habitDayRepository;
    private final PetAwardRepository awardRepository;
    private final Clock clock;

    /** PLAN, SNACK, ALCOHOL. Writes only ledger rows that are missing. */
    @Transactional
    public List<AwardStatusDTO> getAwards(Long userId) {
        LocalDate today = HabitStreakPolicy.today(clock);

        Map<StreakType, StreakRuns.Summary> runs = new EnumMap<>(StreakType.class);
        StreakRuns.Summary plan = planStreakService.planStreak(userId, today);
        runs.put(StreakType.PLAN, plan);
        for (Habit habit : Habit.values()) {
            runs.put(StreakType.of(habit), habitRuns(userId, habit));
        }
        Map<Habit, HabitStatusDTO> habits = habitStreakService.getHabits(userId).stream()
                .collect(Collectors.toMap(HabitStatusDTO::getHabit, Function.identity()));

        Set<AwardKey> earned = syncLedger(userId, runs);

        return Arrays.stream(StreakType.values())
                .map(type -> {
                    int current;
                    int best;
                    if (type == StreakType.PLAN) {
                        current = plan.current();
                        best = plan.best();
                    } else {
                        HabitStatusDTO status = habits.get(Habit.valueOf(type.name()));
                        current = status.getCurrent();
                        best = status.getBest();
                    }
                    return new AwardStatusDTO(type, current, best, counts(type, earned), AwardLadder.next(current));
                })
                .toList();
    }

    /** The MPP-20 day log as runs: clean days count, the lapse day breaks. */
    private StreakRuns.Summary habitRuns(Long userId, Habit habit) {
        SortedMap<LocalDate, DayOutcome> days = new TreeMap<>();
        for (PetHabitDay day : habitDayRepository.findByUserIdAndHabitOrderByDayAsc(userId, habit)) {
            days.put(day.getDay(), Boolean.TRUE.equals(day.getClean()) ? DayOutcome.COUNTS : DayOutcome.BREAKS);
        }
        return StreakRuns.summarise(days);
    }

    /** Existing ledger plus every award the runs have earned; inserts only the ones not yet recorded. */
    private Set<AwardKey> syncLedger(Long userId, Map<StreakType, StreakRuns.Summary> runs) {
        Set<AwardKey> earned = awardRepository.findByUserId(userId).stream()
                .map(a -> new AwardKey(a.getStreakType(), a.getMilestone(), a.getStreakStart(), a.getCycleIndex()))
                .collect(Collectors.toCollection(HashSet::new));
        runs.forEach((type, summary) -> summary.runs().forEach(run ->
                AwardLadder.awardsFor(type, run).forEach(key -> {
                    if (earned.add(key)) {
                        awardRepository.insertIfAbsent(
                                userId, key.type().name(), key.milestone(), key.streakStart(), key.cycleIndex());
                    }
                })));
        return earned;
    }

    /** Every milestone in ladder order, zeros included. */
    private static Map<Integer, Integer> counts(StreakType type, Set<AwardKey> earned) {
        Map<Integer, Integer> counts = new LinkedHashMap<>();
        AwardLadder.MILESTONES.forEach(milestone -> counts.put(milestone, 0));
        earned.stream()
                .filter(key -> key.type() == type)
                .forEach(key -> counts.merge(key.milestone(), 1, Integer::sum));
        return counts;
    }
}
```

- [x] **Step 4: Run it and confirm it passes**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=AwardServiceTest`
Expected: `Tests run: 5, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

---

## Phase 5 — HTTP surface and runtime proof

Expose the service through a thin controller with its own test, then boot the real backend against the local DB. The boot proves that Hibernate `validate` accepts `pet_awards` and that Spring Data parses both new JPQL queries. No unit test covers either. At the end of this phase the slice is reachable and the app starts.

### Task 14: PetAwardController with tests ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetAwardController.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetAwardControllerTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.controller;

import com.foodbytes.service.AwardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MPP-22: the no-principal path never reaches the service (the 200 shape is pinned in AwardServiceTest). */
@WebMvcTest(PetAwardController.class)
@AutoConfigureMockMvc(addFilters = false)
class PetAwardControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private AwardService awardService;

    @Test
    void getAwards_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(get("/api/pet/awards"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        verifyNoInteractions(awardService);
    }
}
```

- [x] **Step 2: Run it and confirm it fails to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetAwardControllerTest`
Expected: `COMPILATION ERROR`, `cannot find symbol … PetAwardController`.

- [x] **Step 3: Implement `PetAwardController.java`**

```java
package com.foodbytes.controller;

import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.AwardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

/**
 * MPP-22: the caller's trophy-cabinet status per streak type (see AwardService). Read by the
 * cabinet (MPP-23).
 */
@RestController
@RequestMapping("/api/pet/awards")
@RequiredArgsConstructor
public class PetAwardController {

    private final AwardService awardService;

    @GetMapping
    public ResponseEntity<?> getAwards(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(awardService.getAwards(userPrincipal.getId()));
    }
}
```

- [x] **Step 4: Run it and confirm it passes**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetAwardControllerTest`
Expected: `Tests run: 1, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

### Task 15: Boot the backend against the local DB (validate + JPQL check) ✓

- Skill: java-backend

**Files:**
- (none — runtime check only)

- [x] **Step 1: Start the backend on a spare port in the background**

Run (PowerShell, `run_in_background`, with the JAVA_HOME / Maven PATH prefix from `CLAUDE.md`): `cd foodbytes-app\foodbytes-api; mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8099" *> "$env:TEMP\mpp22-boot.log"`
(The `application.yml` defaults point at the local `foodbytes-db`, so Docker Desktop must be running.)

- [x] **Step 2: Wait for startup, then read the outcome**

Run: `Select-String -Path "$env:TEMP\mpp22-boot.log" -Pattern "Started FoodBytesApplication|Schema-validation|APPLICATION FAILED TO START|QueryCreationException|Validation failed for query"`
Expected: a `Started FoodBytesApplication in … seconds` line, and none of the failure patterns. Poll until one of the patterns appears.
- If `Schema-validation: wrong column type encountered in column [milestone]` appears, apply the fallback in `plan.md` → Risks. Change `milestone TINYINT UNSIGNED` to `milestone INT` in the migration file. Re-apply it locally with `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "DROP TABLE pet_awards"` followed by Task 2 Step 1, then repeat this task.
- If a query fails validation, fix the JPQL in Task 6 or Task 7 and repeat.

- [x] **Step 3: Confirm the route is wired and secured**

Run: `curl.exe -s -o NUL -w "%{http_code}" http://localhost:8099/api/pet/awards`
Expected: `401` (SecurityConfig's entry point). A `404` would mean the controller is not mapped.

- [x] **Step 4: Stop the backend**

Run: `Get-NetTCPConnection -LocalPort 8099 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`
Expected: no output. `Get-NetTCPConnection -LocalPort 8099 -State Listen -ErrorAction SilentlyContinue` then returns nothing.

---

## Phase 6 — Final verification

No production changes beyond the version bump. This phase only sanity-checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-22 is a Jira **Task**, so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-22: Plan streak + repeating milestone ladder — per-person plan streak, award ledger and GET /api/pet/awards`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep that ticks and awards are never keyed by the owner ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Confirm the award code never reads the owner directly**

Run: `Get-ChildItem -Path foodbytes-app\foodbytes-api\src\main -Recurse -Include *Award*.java,StreakRuns.java,AwardLadder.java | Select-String -Pattern "mealPlanOwnerId|MealPlanOwner|UserRepository|resolveOwner"`
Expected: zero hits.

- [x] **Step 2: Confirm the only owner lookup in the plan streak scopes the slots, not the ticks**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\service\PlanStreakService.java -Pattern "resolveOwnerId|findEatenEntryIdsInRange\(userId"`
Expected: exactly two hits, `extraChoiceService.resolveOwnerId(userId)` and `findEatenEntryIdsInRange(userId, …)`.

### Task M.3: Run the full backend test suite ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS` with 0 failures and 0 errors. The test count rises by 25 over the pre-change baseline (6 StreakRuns, 5 PlanStreakPolicy, 5 AwardLadder, 3 PlanStreakService, 5 AwardService, 1 controller).

### Task M.4: Production build ✓

- Skill: none — verification only (no client source changed; this confirms the version bump didn't break the build)

**Files:**
- (none)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task M.5: Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-22-plan-streak-award-ladder/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- A link to `plan.md` in this folder.
- Summary:
  - the `pet_awards` ledger and `StreakType`;
  - the three rules classes (`StreakRuns`, `PlanStreakPolicy`, `AwardLadder`);
  - `PlanStreakService` (shared slots, caller's own ticks) and `AwardService` (sync-on-read, idempotent);
  - `GET /api/pet/awards`;
  - the new version from Task M.1.
- Migration: `2026-10-13-mpp22-pet-awards.sql` is applied locally only. It is listed as order 3 in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`, and must be applied to Railway **before** the merged backend deploys.
- Verification results from Tasks 2, 9–14, 15, M.3 and M.4.
- Convention note: the plan-day definition lives only in `PlanStreakPolicy.dayOutcome`. Awards are recorded when the cabinet is read, and ledger rows are never deleted.
- Suggested commit subject: `MPP-22: plan streak, repeating milestone ladder and award ledger`.

---

## Self-review

**Spec coverage:**
- `pet_awards` migration, applied locally and recorded for Railway (AC 3): Tasks 1, 2, 3.
- `StreakType`, `PetAward` entity, ledger repository with idempotent insert (AC 3): Tasks 4, 5.
- Ladder constant, 30-day cycle and day 31 re-earning the 1-day award (AC 1): Task 11.
- Per-person plan streak, with nothing-planned days neutral and the definition in one method (AC 2): Tasks 6, 7, 10, 12.
- Runs, current and best: Task 9.
- `GET /api/pet/awards` with `current / best / counts / next` per streak type (AC 4): Tasks 8, 13, 14.
- AC 5 tests:
  - day 30 → 31: Tasks 11 and 13;
  - re-earning after a lapse: Task 13;
  - idempotency: Task 13, plus DB-level in Task 2;
  - linked users with different ticks: Task 12.
  - `mvn test` green: Task M.3.
- Boot check for `ddl-auto: validate` and the JPQL: Task 15.
- Version bump: Task M.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command.

**Type / name consistency:**
- `StreakType { PLAN, SNACK, ALCOHOL }` and `StreakType.of(Habit)`.
- `PetAward(id, userId, streakType, milestone, streakStart, cycleIndex, awardedAt)` matches the 7-arg constructor used in `AwardServiceTest`.
- `PetAwardRepository.findByUserId` and `insertIfAbsent(Long, String, int, LocalDate, int)`.
- `MealPlanEntryRepository.PlannedMealSlot` and `findMainMealSlots(ownerId, mealKeys, from, to)`.
- `MealPlanEntryEatenRepository.findEarliestEatenPlanDate`.
- `StreakRuns.DayOutcome / Run / Summary / Summary.EMPTY / summarise`.
- `PlanStreakPolicy.MAIN_MEAL_KEYS / dayOutcome(int, int, boolean)`.
- `AwardLadder.MILESTONES / CYCLE / AwardKey / ladderDay / awardsFor / next`.
- `PlanStreakService.planStreak(Long, LocalDate)` and `AwardService.getAwards(Long)`.
- `AwardStatusDTO(streakType, current, best, counts, next)` and `NextMilestoneDTO(milestone, inDays)`.
- These are identical across `plan.md` → Data shapes and every task. `HabitStatusDTO` (6-arg) and `PetHabitDay` (5-arg) constructors match the MPP-20 classes.

**Phase boundary cleanliness:**
- Phase 1: only a new table exists, so the app starts unchanged.
- Phase 2: the entity, repository and queries compile, and nothing calls them yet.
- Phase 3: pure classes and DTOs with their tests green, and no runtime wiring.
- Phase 4: services compile and pass their tests, and no endpoint exposes them.
- Phase 5: the endpoint is live and the backend boots against the local DB.
- Phase 6: version bump and checks only.
