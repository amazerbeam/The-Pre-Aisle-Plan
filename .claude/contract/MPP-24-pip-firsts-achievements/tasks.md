# Tasks: "Firsts": one-off achievements for trying FoodBytes features

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-13

**Goal:** Record once per person, credited to whoever acted, the first time they save a template, generate a shopping list, have 7 consecutive days of breakfast/lunch/dinner planned, or tick as eaten a meal with a homemade extra. Recording is a service side effect that can never fail the request. Backfill what today's data proves, and return `firsts` from `GET /api/pet/awards`.

**Spec:** `plan.md` in this folder.

All paths below are relative to the repo root. `foodbytes-api/…/foodbytes` is shorthand for `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes`, and `…/test/…/foodbytes` for `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes`. Backend commands need the JAVA_HOME / Maven PATH prefix from `CLAUDE.md` (memory `java-maven-toolchain-paths`).

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-13-mpp24-pet-firsts.sql` — `pet_firsts` table + four-statement backfill
- `foodbytes-api/…/foodbytes/model/FirstKey.java` — the four first keys
- `foodbytes-api/…/foodbytes/model/PetFirst.java` — entity for `pet_firsts`
- `foodbytes-api/…/foodbytes/repository/PetFirstRepository.java` — reads, idempotent insert, homemade-extra probe
- `foodbytes-api/…/foodbytes/service/PetFirstPolicy.java` — 7-consecutive-days rule + scan window
- `foodbytes-api/…/foodbytes/service/PetFirstCandidate.java` — event record published by the services
- `foodbytes-api/…/foodbytes/service/PetFirstService.java` — `evaluate` (REQUIRES_NEW) + `getFirsts`
- `foodbytes-api/…/foodbytes/service/PetFirstRecorder.java` — after-commit listener that never throws
- `foodbytes-api/…/foodbytes/dto/FirstStatusDTO.java` — `{key, earnedAt}`
- `foodbytes-api/…/foodbytes/dto/PetAwardsDTO.java` — `{streaks, firsts}`
- `…/test/…/foodbytes/service/PetFirstPolicyTest.java`
- `…/test/…/foodbytes/service/PetFirstServiceTest.java`
- `…/test/…/foodbytes/service/PetFirstRecorderTest.java`
- `…/test/…/foodbytes/service/PersistedShoppingListServiceTest.java`

**Modified:**
- `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` — order 4 row
- `foodbytes-api/…/foodbytes/repository/MealPlanEntryRepository.java` — `findFullyPlannedDates`
- `foodbytes-api/…/foodbytes/service/MealPlanService.java` — publisher field; hooks in `assignRecipe`, `copyWeek`, `swapDays`, `setEntryEaten`
- `foodbytes-api/…/foodbytes/service/MealPlanTemplateService.java` — publisher field; hooks in `saveTemplate`, `applyTemplate`
- `foodbytes-api/…/foodbytes/service/PersistedShoppingListService.java` — publisher field; hook in `generateShoppingList`
- `foodbytes-api/…/foodbytes/service/AwardService.java` — `PetFirstService` dep + `getCabinet`
- `foodbytes-api/…/foodbytes/controller/PetAwardController.java` — returns `getCabinet`
- `…/test/…/foodbytes/service/MealPlanServiceTest.java` — publisher mock + hook tests
- `…/test/…/foodbytes/service/MealPlanTemplateServiceTest.java` — publisher mock + hook assertions
- `…/test/…/foodbytes/service/AwardServiceTest.java` — constructor arg + `getCabinet` test
- `…/test/…/foodbytes/controller/PetAwardControllerTest.java` — 200 path + JSON shape
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump

**Deleted:** (none)

---

## Phase 1 — Schema and backfill (local DB)

Create `pet_firsts` and backfill it on the local `foodbytes-db`, then record the migration for Railway. No Java maps the table yet, so the running app is unaffected. `ddl-auto: validate` ignores unmapped tables, which makes this a safe stopping point.

### Task 1: Write the migration file ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-13-mpp24-pet-firsts.sql`

- [x] **Step 1: Write the file with header, DDL and backfill**

```sql
-- MPP-24: Pip's "firsts" - one row per person per feature they have tried for the first time.
--
-- Keys: MAKE_TEMPLATE (saved a meal-plan template), GENERATE_SHOPPING_LIST (generated a list),
-- PLAN_FULL_WEEK (7 consecutive days with breakfast, lunch and dinner all planned on the shared
-- plan), COOK_HOMEMADE_EXTRA (ticked as eaten a meal whose recipe has a direct extra chosen as
-- homemade - no choice row = homemade, MPP-10). Recorded by the app after the triggering request
-- commits (PetFirstRecorder); uk_pet_firsts makes recording idempotent and earned_at never moves.
--
-- Per person (MPP-33): user_id is whoever acted, never the meal-plan owner. The backfill below
-- credits templates, lists and full weeks to the plan owner because the actor was never recorded
-- (MPP-24 AC 4); homemade-extra ticks already carry the eater's user_id.
--
-- Lossless: creates a new table and only INSERTs into it; no existing row is changed. Local
-- evidence (2026-10-13): 5 templates over 4 owners, 5 lists, 4 owners with a full week, 0
-- qualifying homemade-extra ticks. Re-running the file is a no-op (ON DUPLICATE KEY UPDATE id = id).
--
-- MUST be applied before the backend that maps PetFirst deploys (ddl-auto: validate).
-- MPP-15 is local-first: applied to the local foodbytes-db now; listed as order 4 in
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

CREATE TABLE IF NOT EXISTS pet_firsts (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  user_id    BIGINT      NOT NULL,
  first_key  VARCHAR(32) NOT NULL,
  earned_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_firsts (user_id, first_key),
  CONSTRAINT chk_pet_firsts_key CHECK (first_key IN
    ('MAKE_TEMPLATE','GENERATE_SHOPPING_LIST','PLAN_FULL_WEEK','COOK_HOMEMADE_EXTRA')),
  CONSTRAINT fk_pet_firsts_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Backfill 1/4: a saved template -> the owner, at their first template's creation.
INSERT INTO pet_firsts (user_id, first_key, earned_at)
SELECT user_id, 'MAKE_TEMPLATE', MIN(COALESCE(created_at, NOW()))
FROM meal_plan_templates
GROUP BY user_id
ON DUPLICATE KEY UPDATE id = id;

-- Backfill 2/4: a generated list -> the owner (one list per owner), at generation.
INSERT INTO pet_firsts (user_id, first_key, earned_at)
SELECT user_id, 'GENERATE_SHOPPING_LIST', MIN(COALESCE(generated_at, NOW()))
FROM shopping_lists
GROUP BY user_id
ON DUPLICATE KEY UPDATE id = id;

-- Backfill 3/4: a full week -> the owner, at the earliest moment any 7 consecutive
-- breakfast/lunch/dinner-complete days existed (window done = its latest entry's created_at).
-- Same rule as PetFirstPolicy.containsFullWeek.
INSERT INTO pet_firsts (user_id, first_key, earned_at)
WITH full_days AS (
  SELECT e.user_id, e.plan_date, MAX(COALESCE(e.created_at, TIMESTAMP(e.plan_date))) AS day_done
  FROM meal_plan_entries e
  JOIN meals m ON m.id = e.meal_id
  WHERE m.`key` IN ('breakfast','lunch','dinner')
  GROUP BY e.user_id, e.plan_date
  HAVING COUNT(DISTINCT m.`key`) = 3
), windows AS (
  SELECT s.user_id, MAX(d.day_done) AS window_done
  FROM full_days s
  JOIN full_days d ON d.user_id = s.user_id
                  AND d.plan_date BETWEEN s.plan_date AND s.plan_date + INTERVAL 6 DAY
  GROUP BY s.user_id, s.plan_date
  HAVING COUNT(*) = 7
)
SELECT user_id, 'PLAN_FULL_WEEK', MIN(window_done)
FROM windows
GROUP BY user_id
ON DUPLICATE KEY UPDATE id = id;

-- Backfill 4/4: a homemade extra eaten -> the eater, at their first qualifying tick.
-- Same probe as PetFirstRepository.countHomemadeExtras.
INSERT INTO pet_firsts (user_id, first_key, earned_at)
SELECT t.user_id, 'COOK_HOMEMADE_EXTRA', MIN(t.eaten_at)
FROM meal_plan_entry_eaten t
JOIN meal_plan_entries e ON e.id = t.meal_plan_entry_id
WHERE EXISTS (
  SELECT 1
  FROM recipe_extras x
  LEFT JOIN meal_plan_entry_extra_choices c
         ON c.meal_plan_entry_id = e.id AND c.extra_recipe_id = x.child_recipe_id
  WHERE x.parent_recipe_id = e.recipe_id
    AND (c.id IS NULL OR c.is_homemade = 1))
GROUP BY t.user_id
ON DUPLICATE KEY UPDATE id = id;
```

- [x] **Step 2: Confirm the file exists**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-10-13-mpp24-pet-firsts.sql`
Expected: one file listed.

### Task 2: Apply the migration to the local foodbytes-db ✓

- Skill: none — DBA operation against the local `foodbytes-db` (local-first epic; Railway is applied at merge)

**Files:**
- (none — DB apply only)

- [x] **Step 1: Apply it**

Run (Bash): `docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app/database/migrations/2026-10-13-mpp24-pet-firsts.sql`
Expected: no output except the password warning.

- [x] **Step 2: Verify the table and the backfill**

Run (Bash): `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SHOW COLUMNS FROM pet_firsts; SELECT first_key, COUNT(*) n, MIN(earned_at) first_at FROM pet_firsts GROUP BY first_key ORDER BY first_key;"`
Expected: columns `id bigint`, `user_id bigint`, `first_key varchar(32)`, `earned_at timestamp`. Counts: `GENERATE_SHOPPING_LIST 5`, `MAKE_TEMPLATE 4`, `PLAN_FULL_WEEK 4`, and no `COOK_HOMEMADE_EXTRA` row. These match `plan.md` → audit. If the local DB has been refreshed since, different counts are fine as long as each one is ≤ its evidence query.

- [x] **Step 3: Verify re-running is a no-op**

Run (Bash): `docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app/database/migrations/2026-10-13-mpp24-pet-firsts.sql; docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SELECT COUNT(*) FROM pet_firsts;"`
Expected: the same total as Step 2 (13 with the audited data).

### Task 3: Record the migration in the epic's Railway checklist ✓

- Skill: none — release bookkeeping for the local-first epic (memory `mpp15-epic-local-first`)

**Files:**
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` (append one table row)

- [x] **Step 1: Append the row under order 3**

```markdown
| 4 | MPP-24 | foodbytes-app/database/migrations/2026-10-13-mpp24-pet-firsts.sql | 2026-10-13 | — |
```

- [x] **Step 2: Verify**

Run: `Select-String -Path .claude\contract\MPP-15-epic-breakdown\railway-migrations.md -Pattern "mpp24-pet-firsts"`
Expected: one hit, on the order-4 row.

---

## Phase 2 — Domain model and queries

Map `pet_firsts` and add the read queries. Nothing calls them yet, so the phase ends with a clean compile and no behaviour change. Spring Data parses the JPQL and Hibernate validates the entity at boot, which Task 17 proves.

### Task 4: FirstKey enum and PetFirst entity ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/FirstKey.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetFirst.java`

- [x] **Step 1: Write FirstKey**

```java
package com.foodbytes.model;

/**
 * MPP-24: the four planning/cooking features Pip's cabinet nudges people to try once. Stored as the
 * name in pet_firsts.first_key and serialised the same way. Order is the cabinet's display order.
 * Never a variety reward (MPP-11): none of these depends on which food was chosen.
 */
public enum FirstKey {
    MAKE_TEMPLATE,
    GENERATE_SHOPPING_LIST,
    PLAN_FULL_WEEK,
    COOK_HOMEMADE_EXTRA
}
```

- [x] **Step 2: Write PetFirst**

```java
package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

/**
 * MPP-24: the first time one person tried one feature. Identified by (user, key) so recording it
 * twice is a no-op; written only by PetFirstRepository#insertIfAbsent from PetFirstService, and by
 * the migration's backfill. Never deleted by the app.
 */
@Entity
@Table(name = "pet_firsts", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_firsts", columnNames = {"user_id", "first_key"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetFirst {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The person who acted - never the meal-plan owner (MPP-33)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "first_key", nullable = false, length = 32)
    private FirstKey firstKey;

    // DB default CURRENT_TIMESTAMP (UTC, as the JDBC URL pins serverTimezone=UTC)
    @Column(name = "earned_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime earnedAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetFirst other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetFirst.class.hashCode();
    }
}
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`-equivalent quiet exit (code 0), no errors.

### Task 5: PetFirstRepository ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetFirstRepository.java`

- [x] **Step 1: Write the repository**

```java
package com.foodbytes.repository;

import com.foodbytes.model.FirstKey;
import com.foodbytes.model.PetFirst;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/** MPP-24: each person's firsts. */
@Repository
public interface PetFirstRepository extends JpaRepository<PetFirst, Long> {

    List<PetFirst> findByUserId(Long userId);

    boolean existsByUserIdAndFirstKey(Long userId, FirstKey firstKey);

    /**
     * Records a first, or leaves the existing one (and its earned_at) untouched. Two devices
     * earning it at once converge on uk_pet_firsts instead of failing.
     */
    @Modifying
    @Query(value = "INSERT INTO pet_firsts (user_id, first_key) VALUES (:userId, :firstKey) " +
                   "ON DUPLICATE KEY UPDATE id = id",
           nativeQuery = true)
    void insertIfAbsent(@Param("userId") Long userId, @Param("firstKey") String firstKey);

    /**
     * Direct extras of the entry's recipe that are homemade on that entry (no choice row = homemade,
     * MPP-10). Direct children suffice: a nested extra only matters under a homemade parent, which
     * already counts. Same probe as the migration's backfill 4/4.
     */
    @Query(value = "SELECT COUNT(*) FROM meal_plan_entries e " +
                   "JOIN recipe_extras x ON x.parent_recipe_id = e.recipe_id " +
                   "LEFT JOIN meal_plan_entry_extra_choices c " +
                   "  ON c.meal_plan_entry_id = e.id AND c.extra_recipe_id = x.child_recipe_id " +
                   "WHERE e.id = :entryId AND (c.id IS NULL OR c.is_homemade = 1)",
           nativeQuery = true)
    long countHomemadeExtras(@Param("entryId") Long entryId);
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit code 0, no errors.

### Task 6: MealPlanEntryRepository — findFullyPlannedDates ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/MealPlanEntryRepository.java` (add directly after `findMainMealSlots`, ~line 138)

- [x] **Step 1: Add the query**

```java
    /**
     * MPP-24: the owner's dates in [from, to] that have every one of mealKeys planned (keyCount =
     * mealKeys.size()). Feeds PetFirstPolicy.containsFullWeek; same rule as the migration's backfill 3/4.
     */
    @Query("SELECT mpe.planDate FROM MealPlanEntry mpe " +
           "WHERE mpe.user.id = :ownerId " +
           "AND mpe.meal.key IN :mealKeys " +
           "AND mpe.planDate >= :from " +
           "AND mpe.planDate <= :to " +
           "GROUP BY mpe.planDate " +
           "HAVING COUNT(DISTINCT mpe.meal.key) = :keyCount")
    List<LocalDate> findFullyPlannedDates(
        @Param("ownerId") Long ownerId,
        @Param("mealKeys") Collection<String> mealKeys,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to,
        @Param("keyCount") long keyCount
    );
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit code 0, no errors.

---

## Phase 3 — Rules, recording and read model

Build everything the hooks will call: the pure rule, the event, the service and the after-commit listener, each with its own tests. No service publishes yet, so behaviour is unchanged and the suite stays green.

### Task 7: PetFirstPolicy with tests (TDD) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetFirstPolicy.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetFirstPolicyTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

/** MPP-24 AC 1: "a 7-day window with B/L/D all planned" = any 7 consecutive fully planned days. */
class PetFirstPolicyTest {

    private static final LocalDate MON = LocalDate.of(2026, 10, 12);

    private static List<LocalDate> days(int fromOffset, int count) {
        return IntStream.range(fromOffset, fromOffset + count).mapToObj(MON::plusDays).toList();
    }

    @Test
    void sevenConsecutiveDays_isAFullWeek() {
        assertThat(PetFirstPolicy.containsFullWeek(days(0, 7))).isTrue();
    }

    @Test
    void sixConsecutiveDays_isNot() {
        assertThat(PetFirstPolicy.containsFullWeek(days(0, 6))).isFalse();
    }

    @Test
    void rollingWindow_needNotStartOnMonday() {
        assertThat(PetFirstPolicy.containsFullWeek(days(3, 7))).isTrue();
    }

    @Test
    void aGapResetsTheRun() {
        List<LocalDate> gapped = new java.util.ArrayList<>(days(0, 4));
        gapped.addAll(days(5, 4));   // day 4 missing: runs of 4 and 4
        assertThat(PetFirstPolicy.containsFullWeek(gapped)).isFalse();
    }

    @Test
    void orderAndDuplicatesDoNotMatter() {
        List<LocalDate> shuffled = new java.util.ArrayList<>(days(0, 7));
        java.util.Collections.reverse(shuffled);
        shuffled.add(MON.plusDays(2));
        assertThat(PetFirstPolicy.containsFullWeek(shuffled)).isTrue();
    }

    @Test
    void noDates_isNot() {
        assertThat(PetFirstPolicy.containsFullWeek(List.of())).isFalse();
    }

    @Test
    void scanWindow_coversEveryWeekContainingTheTouchedRange() {
        assertThat(PetFirstPolicy.scanFrom(MON)).isEqualTo(MON.minusDays(6));
        assertThat(PetFirstPolicy.scanTo(MON.plusDays(2))).isEqualTo(MON.plusDays(8));
    }
}
```

- [x] **Step 2: Run it and see it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetFirstPolicyTest`
Expected: compilation failure (`cannot find symbol … PetFirstPolicy`).

- [x] **Step 3: Implement**

```java
package com.foodbytes.service;

import java.time.LocalDate;
import java.util.Collection;
import java.util.TreeSet;

/**
 * MPP-24: what "plan a full week" means. A full week is FULL_WEEK_DAYS consecutive calendar days,
 * each with breakfast, lunch and dinner planned (PlanStreakPolicy.MAIN_MEAL_KEYS) - a rolling
 * window, not a Monday-Sunday week. The migration's backfill 3/4 applies the same rule in SQL.
 */
public final class PetFirstPolicy {

    public static final int FULL_WEEK_DAYS = 7;

    private PetFirstPolicy() {
    }

    /** Earliest start of a 7-day window that includes {@code from}. */
    static LocalDate scanFrom(LocalDate from) {
        return from.minusDays(FULL_WEEK_DAYS - 1);
    }

    /** Latest end of a 7-day window that includes {@code to}. */
    static LocalDate scanTo(LocalDate to) {
        return to.plusDays(FULL_WEEK_DAYS - 1);
    }

    /** True when the fully planned dates contain FULL_WEEK_DAYS consecutive days. */
    static boolean containsFullWeek(Collection<LocalDate> fullyPlannedDates) {
        LocalDate previous = null;
        int run = 0;
        for (LocalDate day : new TreeSet<>(fullyPlannedDates)) {
            run = previous != null && previous.plusDays(1).equals(day) ? run + 1 : 1;
            if (run >= FULL_WEEK_DAYS) return true;
            previous = day;
        }
        return false;
    }
}
```

- [x] **Step 4: Run it and see it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetFirstPolicyTest`
Expected: `Tests run: 7, Failures: 0, Errors: 0`.

### Task 8: FirstStatusDTO and PetAwardsDTO ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/FirstStatusDTO.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetAwardsDTO.java`

- [x] **Step 1: Write both DTOs**

```java
package com.foodbytes.dto;

import com.foodbytes.model.FirstKey;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

/** MPP-24: one first for the caller. earnedAt is UTC, or null while not yet earned. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FirstStatusDTO {
    private FirstKey key;
    private Instant earnedAt;
}
```

```java
package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * MPP-24: GET /api/pet/awards. streaks is the MPP-22 status per streak type (PLAN, SNACK, ALCOHOL);
 * firsts always lists all four FirstKey values in enum order.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetAwardsDTO {
    private List<AwardStatusDTO> streaks;
    private List<FirstStatusDTO> firsts;
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit code 0, no errors.

### Task 9: PetFirstCandidate event ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetFirstCandidate.java`

- [x] **Step 1: Write the record**

```java
package com.foodbytes.service;

import com.foodbytes.model.FirstKey;
import java.time.LocalDate;

/**
 * MPP-24: "this action may have earned a first", published by the service write paths and handled
 * after commit by PetFirstRecorder. userId is always the person who acted, never the plan owner.
 * from/to are the dates a planning action touched (PLAN_FULL_WEEK); entryId is the ticked meal
 * (COOK_HOMEMADE_EXTRA).
 */
public record PetFirstCandidate(Long userId, FirstKey key, LocalDate from, LocalDate to, Long entryId) {

    /** MAKE_TEMPLATE or GENERATE_SHOPPING_LIST: the action itself is the proof. */
    public static PetFirstCandidate of(Long userId, FirstKey key) {
        return new PetFirstCandidate(userId, key, null, null, null);
    }

    public static PetFirstCandidate planned(Long userId, LocalDate from, LocalDate to) {
        return new PetFirstCandidate(userId, FirstKey.PLAN_FULL_WEEK, from, to, null);
    }

    public static PetFirstCandidate cooked(Long userId, Long entryId) {
        return new PetFirstCandidate(userId, FirstKey.COOK_HOMEMADE_EXTRA, null, null, entryId);
    }
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit code 0, no errors.

### Task 10: PetFirstService with tests (TDD) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetFirstService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetFirstServiceTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.dto.FirstStatusDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.PetFirst;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.PetFirstRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** MPP-24 AC 1 / AC 3: what proves each first, idempotency, per-person credit, and the read model. */
@ExtendWith(MockitoExtension.class)
class PetFirstServiceTest {

    private static final Long ACTOR = 2L;   // linked partner
    private static final Long OWNER = 1L;   // meal-plan owner
    private static final LocalDate MON = LocalDate.of(2026, 10, 12);

    @Mock private PetFirstRepository petFirstRepository;
    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private ExtraChoiceService extraChoiceService;

    @InjectMocks private PetFirstService service;

    private static List<LocalDate> days(int fromOffset, int count) {
        return IntStream.range(fromOffset, fromOffset + count).mapToObj(MON::plusDays).toList();
    }

    @Test
    void template_isItsOwnProof_creditedToTheActor() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.MAKE_TEMPLATE)).thenReturn(false);

        service.evaluate(PetFirstCandidate.of(ACTOR, FirstKey.MAKE_TEMPLATE));

        verify(petFirstRepository).insertIfAbsent(ACTOR, "MAKE_TEMPLATE");
    }

    @Test
    void shoppingList_isItsOwnProof() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.GENERATE_SHOPPING_LIST)).thenReturn(false);

        service.evaluate(PetFirstCandidate.of(ACTOR, FirstKey.GENERATE_SHOPPING_LIST));

        verify(petFirstRepository).insertIfAbsent(ACTOR, "GENERATE_SHOPPING_LIST");
    }

    @Test
    void alreadyEarned_doesNoMoreWork() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.PLAN_FULL_WEEK)).thenReturn(true);

        service.evaluate(PetFirstCandidate.planned(ACTOR, MON, MON));

        verify(petFirstRepository, never()).insertIfAbsent(anyLong(), anyString());
        verifyNoInteractions(mealPlanEntryRepository, extraChoiceService);
    }

    @Test
    void fullWeek_onASharedPlan_readsTheOwnersPlanButCreditsTheActor() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.PLAN_FULL_WEEK)).thenReturn(false);
        when(extraChoiceService.resolveOwnerId(ACTOR)).thenReturn(OWNER);
        when(mealPlanEntryRepository.findFullyPlannedDates(
                OWNER, PlanStreakPolicy.MAIN_MEAL_KEYS, MON.minusDays(6), MON.plusDays(6), 3L))
                .thenReturn(days(-3, 7));

        service.evaluate(PetFirstCandidate.planned(ACTOR, MON, MON));

        verify(petFirstRepository).insertIfAbsent(ACTOR, "PLAN_FULL_WEEK");
    }

    @Test
    void fullWeek_sixDaysOnly_recordsNothing() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.PLAN_FULL_WEEK)).thenReturn(false);
        when(extraChoiceService.resolveOwnerId(ACTOR)).thenReturn(OWNER);
        when(mealPlanEntryRepository.findFullyPlannedDates(
                OWNER, PlanStreakPolicy.MAIN_MEAL_KEYS, MON.minusDays(6), MON.plusDays(12), 3L))
                .thenReturn(days(0, 6));

        service.evaluate(PetFirstCandidate.planned(ACTOR, MON, MON.plusDays(6)));

        verify(petFirstRepository, never()).insertIfAbsent(anyLong(), anyString());
    }

    @Test
    void cookedEntry_withAHomemadeExtra_records() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.COOK_HOMEMADE_EXTRA)).thenReturn(false);
        when(petFirstRepository.countHomemadeExtras(812L)).thenReturn(1L);

        service.evaluate(PetFirstCandidate.cooked(ACTOR, 812L));

        verify(petFirstRepository).insertIfAbsent(ACTOR, "COOK_HOMEMADE_EXTRA");
    }

    @Test
    void cookedEntry_withOnlyStoreBoughtOrNoExtras_recordsNothing() {
        when(petFirstRepository.existsByUserIdAndFirstKey(ACTOR, FirstKey.COOK_HOMEMADE_EXTRA)).thenReturn(false);
        when(petFirstRepository.countHomemadeExtras(812L)).thenReturn(0L);

        service.evaluate(PetFirstCandidate.cooked(ACTOR, 812L));

        verify(petFirstRepository, never()).insertIfAbsent(anyLong(), anyString());
    }

    @Test
    void getFirsts_listsAllFourInOrder_withUtcEarnedAtOrNull() {
        when(petFirstRepository.findByUserId(ACTOR)).thenReturn(List.of(
                new PetFirst(9L, ACTOR, FirstKey.PLAN_FULL_WEEK, LocalDateTime.of(2026, 10, 12, 8, 0))));

        List<FirstStatusDTO> firsts = service.getFirsts(ACTOR);

        assertThat(firsts).extracting(FirstStatusDTO::getKey).containsExactly(
                FirstKey.MAKE_TEMPLATE, FirstKey.GENERATE_SHOPPING_LIST,
                FirstKey.PLAN_FULL_WEEK, FirstKey.COOK_HOMEMADE_EXTRA);
        assertThat(firsts).extracting(FirstStatusDTO::getEarnedAt).containsExactly(
                null, null, Instant.parse("2026-10-12T08:00:00Z"), null);
    }
}
```

- [x] **Step 2: Run it and see it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetFirstServiceTest`
Expected: compilation failure (`cannot find symbol … PetFirstService`).

- [x] **Step 3: Implement**

```java
package com.foodbytes.service;

import com.foodbytes.dto.FirstStatusDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.PetFirstRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * MPP-24: decides whether a candidate action has earned its first, and lists the caller's firsts.
 * Credit always goes to the candidate's userId (the actor); the meal-plan owner is used only to
 * find which entries are planned (per-person Pip, MPP-33).
 */
@Service
@RequiredArgsConstructor
public class PetFirstService {

    private final PetFirstRepository petFirstRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final ExtraChoiceService extraChoiceService;

    /**
     * Called from PetFirstRecorder after the triggering request has committed. REQUIRES_NEW
     * because Spring runs after-commit work while the old transaction is still bound. Idempotent:
     * an earned first is never re-checked and its earned_at never moves.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void evaluate(PetFirstCandidate candidate) {
        if (petFirstRepository.existsByUserIdAndFirstKey(candidate.userId(), candidate.key())) return;
        if (isProven(candidate)) {
            petFirstRepository.insertIfAbsent(candidate.userId(), candidate.key().name());
        }
    }

    private boolean isProven(PetFirstCandidate candidate) {
        return switch (candidate.key()) {
            case MAKE_TEMPLATE, GENERATE_SHOPPING_LIST -> true;
            case PLAN_FULL_WEEK -> PetFirstPolicy.containsFullWeek(mealPlanEntryRepository.findFullyPlannedDates(
                    extraChoiceService.resolveOwnerId(candidate.userId()),
                    PlanStreakPolicy.MAIN_MEAL_KEYS,
                    PetFirstPolicy.scanFrom(candidate.from()),
                    PetFirstPolicy.scanTo(candidate.to()),
                    PlanStreakPolicy.MAIN_MEAL_KEYS.size()));
            case COOK_HOMEMADE_EXTRA -> petFirstRepository.countHomemadeExtras(candidate.entryId()) > 0;
        };
    }

    /** All four keys in FirstKey order; earnedAt is null while not yet earned. */
    @Transactional(readOnly = true)
    public List<FirstStatusDTO> getFirsts(Long userId) {
        Map<FirstKey, LocalDateTime> earned = new EnumMap<>(FirstKey.class);
        petFirstRepository.findByUserId(userId).forEach(f -> earned.put(f.getFirstKey(), f.getEarnedAt()));
        return Arrays.stream(FirstKey.values())
                .map(key -> new FirstStatusDTO(key, toUtcInstant(earned.get(key))))
                .toList();
    }

    /** earned_at is UTC wall time; null stays null. */
    private static Instant toUtcInstant(LocalDateTime utcWallTime) {
        return utcWallTime == null ? null : utcWallTime.toInstant(ZoneOffset.UTC);
    }
}
```

- [x] **Step 4: Run it and see it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetFirstServiceTest`
Expected: `Tests run: 8, Failures: 0, Errors: 0`.

### Task 11: PetFirstRecorder with tests (TDD) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetFirstRecorder.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetFirstRecorderTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.model.FirstKey;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

/**
 * MPP-24 AC 2: recording never fails the original request. No test boots JPA, so the after-commit
 * wiring is pinned by annotation here and proven at runtime by the local boot + manual check.
 */
@ExtendWith(MockitoExtension.class)
class PetFirstRecorderTest {

    private static final PetFirstCandidate CANDIDATE = PetFirstCandidate.of(2L, FirstKey.MAKE_TEMPLATE);

    @Mock private PetFirstService petFirstService;
    @InjectMocks private PetFirstRecorder recorder;

    @Test
    void onCandidate_delegatesToEvaluate() {
        recorder.onCandidate(CANDIDATE);

        verify(petFirstService).evaluate(CANDIDATE);
    }

    @Test
    void onCandidate_whenEvaluateFails_swallowsIt() {
        doThrow(new DataAccessResourceFailureException("pet_firsts unavailable"))
                .when(petFirstService).evaluate(CANDIDATE);

        assertThatCode(() -> recorder.onCandidate(CANDIDATE)).doesNotThrowAnyException();
    }

    @Test
    void runsAfterCommit_andEvaluatesInItsOwnTransaction() throws NoSuchMethodException {
        TransactionalEventListener listener = PetFirstRecorder.class
                .getMethod("onCandidate", PetFirstCandidate.class)
                .getAnnotation(TransactionalEventListener.class);
        assertThat(listener).isNotNull();
        assertThat(listener.phase()).isEqualTo(TransactionPhase.AFTER_COMMIT);
        assertThat(listener.fallbackExecution()).isTrue();

        Transactional tx = PetFirstService.class
                .getMethod("evaluate", PetFirstCandidate.class)
                .getAnnotation(Transactional.class);
        assertThat(tx.propagation()).isEqualTo(Propagation.REQUIRES_NEW);
    }
}
```

- [x] **Step 2: Run it and see it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetFirstRecorderTest`
Expected: compilation failure (`cannot find symbol … PetFirstRecorder`).

- [x] **Step 3: Implement**

```java
package com.foodbytes.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * MPP-24: records firsts after the triggering request has committed, so a firsts failure can never
 * roll back or fail it (AC 2), and the full-week check sees the entry that completed the week.
 * Spring does not swallow after-commit listener exceptions, hence the catch here.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PetFirstRecorder {

    private final PetFirstService petFirstService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onCandidate(PetFirstCandidate candidate) {
        try {
            petFirstService.evaluate(candidate);
        } catch (RuntimeException e) {
            log.warn("MPP-24: could not record first {} for user {}; the request itself succeeded",
                     candidate.key(), candidate.userId(), e);
        }
    }
}
```

- [x] **Step 4: Run it and see it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetFirstRecorderTest`
Expected: `Tests run: 3, Failures: 0, Errors: 0`.

---

## Phase 4 — Recording hooks in the services

Add one `publishEvent` line to each write path, and give each service's tests the publisher mock. The hooks only publish, and the recorder from Phase 3 handles the event. Each task leaves its service's test class green, so every task boundary is safe.

### Task 12: MealPlanService hooks with tests ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java` (field list ~line 38; `assignRecipe` ~line 236; `setEntryEaten` ~line 330; `swapDays` ~line 380; `copyWeek` ~line 440)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java`

- [x] **Step 1: Add the publisher mock and the failing tests**

Add the mock after `mealPlanEntryEatenRepository` (~line 72). Without it, `@InjectMocks` passes `null` and the hooked paths NPE:

```java
    @Mock private ApplicationEventPublisher eventPublisher;   // MPP-24: firsts candidates
```

Imports: `org.springframework.context.ApplicationEventPublisher`.

Append to the existing tests:
- `copyWeek_copiesChoicesSourceToTarget` (end of method):
  ```java
          verify(eventPublisher).publishEvent(PetFirstCandidate.planned(USER_ID, target, target.plusDays(6)));
  ```
- `swapDays_movesEntriesInPlace_withoutRewritingChoices` (end of method):
  ```java
          verify(eventPublisher).publishEvent(PetFirstCandidate.planned(USER_ID, a, b));
  ```

Add new tests at the end of the class:

```java
    // ------------------------------------------------------------------
    // MPP-24: firsts candidates, always credited to the actor
    // ------------------------------------------------------------------

    @Test
    void assignRecipe_newEntry_publishesAFullWeekCandidateForThatDay() {
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        LocalDate day = LocalDate.of(2026, 7, 31);
        verify(eventPublisher).publishEvent(PetFirstCandidate.planned(USER_ID, day, day));
    }

    @Test
    void assignRecipe_toggleOff_publishesNothing() {
        LocalDate day = LocalDate.of(2026, 7, 31);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealIdAndRecipeId(USER_ID, day, MEAL_ID, RECIPE_ID))
                .thenReturn(Optional.of(entryWithId(10L, recipe, day)));

        assertThat(mealPlanService.assignRecipe(USER_ID, requestWithServings(null))).isNull();

        verifyNoInteractions(eventPublisher);
    }

    @Test
    void swapDays_reversedDates_publishesTheRangeInOrder() {
        LocalDate a = LocalDate.of(2026, 10, 12);
        LocalDate b = LocalDate.of(2026, 10, 14);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByUserIdAndPlanDate(USER_ID, b)).thenReturn(List.of());
        when(mealPlanEntryRepository.findByUserIdAndPlanDate(USER_ID, a)).thenReturn(List.of());

        mealPlanService.swapDays(USER_ID, b, a);

        verify(eventPublisher).publishEvent(PetFirstCandidate.planned(USER_ID, a, b));
    }

    @Test
    void setEntryEaten_linkedPartner_publishesTheCookedCandidateForThePartner() {
        MealPlanEntry sharedEntry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linkedUser()));
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, OWNER_ID)).thenReturn(Optional.of(sharedEntry));
        when(mealPlanEntryEatenRepository.findByMealPlanEntryIdAndUserId(ENTRY_ID, LINKED_ID))
                .thenReturn(Optional.of(tick(ENTRY_ID, LINKED_ID, LocalDateTime.of(2026, 10, 13, 12, 30))));

        mealPlanService.setEntryEaten(LINKED_ID, ENTRY_ID, true);

        verify(eventPublisher).publishEvent(PetFirstCandidate.cooked(LINKED_ID, ENTRY_ID));
    }

    @Test
    void setEntryEaten_untick_publishesNothing() {
        MealPlanEntry entry = entryWithId(ENTRY_ID, recipeWithId(82L), LocalDate.of(2026, 10, 13));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByIdAndUserId(ENTRY_ID, USER_ID)).thenReturn(Optional.of(entry));

        mealPlanService.setEntryEaten(USER_ID, ENTRY_ID, false);

        verifyNoInteractions(eventPublisher);
    }
```

If `OWNER_ID`, `ENTRY_ID`, `LINKED_ID`, `tick`, `linkedUser`, `entryWithId` or `recipeWithId` sit below the new tests, that is fine (class-level members). If `recipe` (the `@BeforeEach` field) has no id match for `RECIPE_ID`, it does: `recipe.setId(RECIPE_ID)` in `setUp`.

- [x] **Step 2: Run the class and see the new assertions fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: the five new tests and the two extended ones fail with `Wanted but not invoked: eventPublisher.publishEvent(...)`. Every pre-existing test passes.

- [x] **Step 3: Add the field and hooks to MealPlanService**

Field, appended to the `private final` list (after `mealPlanEntryEatenRepository`):

```java
    private final ApplicationEventPublisher eventPublisher;                   // MPP-24: firsts candidates
```

`assignRecipe`, directly before `return convertToDTO(entry, storedChoices, null);`:

```java
        // MPP-24: this slot may have completed a 7-day run of B/L/D; credited to the clicker.
        eventPublisher.publishEvent(PetFirstCandidate.planned(userId, request.getPlanDate(), request.getPlanDate()));
```

`setEntryEaten`, in the eaten branch, directly before `return new MealPlanEntryEatenDTO(entry.getId(), true, toUtcInstant(eatenAt));`:

```java
                eventPublisher.publishEvent(PetFirstCandidate.cooked(userId, entry.getId())); // MPP-24
```

`swapDays`, after the two `saveAll` calls:

```java
        // MPP-24: moving a full day into a gap can complete a week.
        LocalDate first = sourceDate.isBefore(targetDate) ? sourceDate : targetDate;
        LocalDate last = sourceDate.isBefore(targetDate) ? targetDate : sourceDate;
        eventPublisher.publishEvent(PetFirstCandidate.planned(userId, first, last));
```

`copyWeek`, inside `if (!sourceEntries.isEmpty())`, after `extraChoiceService.copyEntryChoices(sourceToCopy);`:

```java
            eventPublisher.publishEvent(PetFirstCandidate.planned(userId, targetStartDate, targetStartDate.plusDays(6))); // MPP-24
```

Import: `org.springframework.context.ApplicationEventPublisher`.

- [x] **Step 4: Run the class and see it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: `Failures: 0, Errors: 0`. The test count is the previous count + 5.

### Task 13: MealPlanTemplateService hooks with tests ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanTemplateService.java` (field list ~line 43; `saveTemplate` ~line 97; `applyTemplate` ~line 196)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanTemplateServiceTest.java`

- [x] **Step 1: Find any other test that builds a hooked service by hand**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\test\java\com\foodbytes\**\*.java -Pattern "new (MealPlanService|MealPlanTemplateService|PersistedShoppingListService)\("`
Expected: zero hits (all use `@InjectMocks`, audited 2026-10-13). Any hit must get the publisher argument in this task.

- [x] **Step 2: Add the mock and the failing assertions**

Mock, after `manageExtrasService`:

```java
    @Mock private ApplicationEventPublisher eventPublisher;   // MPP-24: firsts candidates
```

Append to `saveTemplate_snapshotsEachMealsChoices`:

```java
        verify(eventPublisher).publishEvent(PetFirstCandidate.of(USER_ID, FirstKey.MAKE_TEMPLATE));
```

Append to `applyTemplate_restoresChoicesOntoNewEntries`:

```java
        verify(eventPublisher).publishEvent(PetFirstCandidate.planned(USER_ID, MONDAY, MONDAY.plusDays(6)));
```

Add a test that `updateSnapshot` is not "making" a template (assumption 1). Append to `updateSnapshot_resnapshotsChoices`:

```java
        verifyNoInteractions(eventPublisher);
```

Imports: `org.springframework.context.ApplicationEventPublisher`, `com.foodbytes.model.FirstKey`, `static org.mockito.Mockito.verifyNoInteractions` (if missing).

- [x] **Step 3: Run the class and see it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanTemplateServiceTest`
Expected: the two `publishEvent` assertions fail with `Wanted but not invoked`. The rest pass.

- [x] **Step 4: Add the field and hooks**

Field, after `manageExtrasService`:

```java
    private final ApplicationEventPublisher eventPublisher;  // MPP-24: firsts candidates
```

`saveTemplate`, directly before `return toDetailDTO(template);`:

```java
        eventPublisher.publishEvent(PetFirstCandidate.of(userId, FirstKey.MAKE_TEMPLATE)); // MPP-24: the clicker, not the owner
```

`applyTemplate`, inside `if (!newEntries.isEmpty())`, after `extraChoiceService.copyTemplateChoicesToEntries(templateEntryToEntry);`:

```java
            eventPublisher.publishEvent(PetFirstCandidate.planned(userId, targetStartDate, targetStartDate.plusDays(6))); // MPP-24
```

Imports: `org.springframework.context.ApplicationEventPublisher`, `com.foodbytes.model.FirstKey` (skip if `com.foodbytes.model.*` is already imported).

- [x] **Step 5: Run the class and see it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanTemplateServiceTest`
Expected: `Failures: 0, Errors: 0`.

### Task 14: PersistedShoppingListService hook with test ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PersistedShoppingListService.java` (field list ~line 31; `generateShoppingList` ~line 133)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PersistedShoppingListServiceTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbytes.dto.AggregatedShoppingListDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.ShoppingList;
import com.foodbytes.model.User;
import com.foodbytes.repository.ShoppingListItemRepository;
import com.foodbytes.repository.ShoppingListRepository;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** MPP-24: generating a list on a shared plan earns the first for whoever generated it. */
@ExtendWith(MockitoExtension.class)
class PersistedShoppingListServiceTest {

    @Mock private ShoppingListRepository shoppingListRepository;
    @Mock private ShoppingListItemRepository shoppingListItemRepository;
    @Mock private ShoppingListService shoppingListService;
    @Mock private UserRepository userRepository;
    @Mock private ObjectMapper objectMapper;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks private PersistedShoppingListService service;

    @Test
    void generateShoppingList_linkedPartner_publishesTheFirstForThePartner() {
        User owner = new User();
        owner.setId(1L);
        User partner = new User();
        partner.setId(2L);
        partner.setMealPlanOwnerId(1L);
        LocalDate start = LocalDate.of(2026, 10, 12);
        when(userRepository.findById(2L)).thenReturn(Optional.of(partner));
        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(shoppingListService.getShoppingList(1L, start))
                .thenReturn(new AggregatedShoppingListDTO(start, start.plusDays(6), List.of(), 0));
        when(shoppingListRepository.save(any(ShoppingList.class))).thenAnswer(inv -> {
            ShoppingList list = inv.getArgument(0);
            list.setId(50L);
            return list;
        });
        when(shoppingListItemRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        service.generateShoppingList(2L, start, start.plusDays(6));

        verify(eventPublisher).publishEvent(PetFirstCandidate.of(2L, FirstKey.GENERATE_SHOPPING_LIST));
    }
}
```

- [x] **Step 2: Run it and see it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PersistedShoppingListServiceTest`
Expected: one failure, `Wanted but not invoked: eventPublisher.publishEvent(...)`. If it errors earlier inside `convertToDTO` on the empty item list, stub what it needs (it should not need anything for zero items) and re-run until the only failure is the missing publish.

- [x] **Step 3: Add the field and hook**

Field, after `objectMapper`:

```java
    private final ApplicationEventPublisher eventPublisher;   // MPP-24: firsts candidates
```

In `generateShoppingList`, directly after `items = shoppingListItemRepository.saveAll(items);`:

```java
        // MPP-24: credited to the person who generated it, even on a shared plan.
        eventPublisher.publishEvent(PetFirstCandidate.of(userId, FirstKey.GENERATE_SHOPPING_LIST));
```

Import: `org.springframework.context.ApplicationEventPublisher` (`com.foodbytes.model.*` already covers `FirstKey`).

- [x] **Step 4: Run it and see it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PersistedShoppingListServiceTest`
Expected: `Tests run: 1, Failures: 0, Errors: 0`.

---

## Phase 5 — HTTP surface and runtime proof

Extend `GET /api/pet/awards` to `{streaks, firsts}`, then boot the real backend against the local DB. The boot proves `ddl-auto: validate` accepts `pet_firsts`, the new JPQL parses, and the listener bean wires. A manual check then proves a first records end to end. At the end of this phase the feature is live locally.

### Task 15: AwardService.getCabinet with test ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/AwardService.java` (field list ~line 46; new method after `getAwards`)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/AwardServiceTest.java:47-57`

- [x] **Step 1: Update the test fixture and add the failing test**

Add the mock and pass it to the constructor:

```java
    @Mock private PetFirstService petFirstService;
```

```java
        service = new AwardService(planStreakService, habitStreakService, habitDayRepository, awardRepository, CLOCK, petFirstService);
```

New test at the end of the class:

```java
    @Test
    void getCabinet_carriesTheStreaksAndTheCallersFirsts() {
        stub(new Summary(List.of(), 0, 0), List.of());
        List<FirstStatusDTO> firsts = List.of(
                new FirstStatusDTO(FirstKey.MAKE_TEMPLATE, Instant.parse("2026-10-12T08:00:00Z")),
                new FirstStatusDTO(FirstKey.GENERATE_SHOPPING_LIST, null),
                new FirstStatusDTO(FirstKey.PLAN_FULL_WEEK, null),
                new FirstStatusDTO(FirstKey.COOK_HOMEMADE_EXTRA, null));
        when(petFirstService.getFirsts(USER_ID)).thenReturn(firsts);

        PetAwardsDTO cabinet = service.getCabinet(USER_ID);

        assertThat(cabinet.getStreaks()).extracting(AwardStatusDTO::getStreakType)
                .containsExactly(StreakType.PLAN, StreakType.SNACK, StreakType.ALCOHOL);
        assertThat(cabinet.getFirsts()).isEqualTo(firsts);
    }
```

Imports: `com.foodbytes.dto.FirstStatusDTO`, `com.foodbytes.dto.PetAwardsDTO`, `com.foodbytes.model.FirstKey`.

- [x] **Step 2: Run it and see it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=AwardServiceTest`
Expected: compilation failure (constructor arity / `getCabinet` missing).

- [x] **Step 3: Implement**

Field, appended after `clock` so the constructor order matches the test:

```java
    private final PetFirstService petFirstService;   // MPP-24
```

Method, after `getAwards`:

```java
    /** MPP-24: GET /api/pet/awards - the streak statuses plus the caller's firsts. */
    @Transactional
    public PetAwardsDTO getCabinet(Long userId) {
        return new PetAwardsDTO(getAwards(userId), petFirstService.getFirsts(userId));
    }
```

Import: `com.foodbytes.dto.PetAwardsDTO`.

- [x] **Step 4: Run it and see it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=AwardServiceTest`
Expected: `Failures: 0, Errors: 0`. The test count is the previous count + 1.

### Task 16: PetAwardController returns the cabinet, with tests ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetAwardController.java:22-30`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetAwardControllerTest.java`

- [x] **Step 1: Add the failing tests**

```java
    @Test
    void getAwards_withPrincipal_returnsTheCabinet() {
        UserPrincipal principal = org.mockito.Mockito.mock(UserPrincipal.class);
        when(principal.getId()).thenReturn(2L);
        PetAwardsDTO cabinet = new PetAwardsDTO(List.of(),
                List.of(new FirstStatusDTO(FirstKey.MAKE_TEMPLATE, null)));
        when(awardService.getCabinet(2L)).thenReturn(cabinet);

        ResponseEntity<?> response = new PetAwardController(awardService).getAwards(principal);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(cabinet);
    }

    @Test
    void cabinetJson_hasStreaksAndFirsts_withNullEarnedAt() throws Exception {
        ObjectMapper mapper = new ObjectMapper().findAndRegisterModules()
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        String json = mapper.writeValueAsString(new PetAwardsDTO(List.of(), List.of(
                new FirstStatusDTO(FirstKey.PLAN_FULL_WEEK, Instant.parse("2026-01-07T21:33:10Z")),
                new FirstStatusDTO(FirstKey.COOK_HOMEMADE_EXTRA, null))));

        assertThat(json).isEqualTo("{\"streaks\":[],\"firsts\":["
                + "{\"key\":\"PLAN_FULL_WEEK\",\"earnedAt\":\"2026-01-07T21:33:10Z\"},"
                + "{\"key\":\"COOK_HOMEMADE_EXTRA\",\"earnedAt\":null}]}");
    }
```

Imports: `com.fasterxml.jackson.databind.ObjectMapper`, `com.fasterxml.jackson.databind.SerializationFeature`, `com.foodbytes.dto.FirstStatusDTO`, `com.foodbytes.dto.PetAwardsDTO`, `com.foodbytes.model.FirstKey`, `com.foodbytes.security.UserPrincipal`, `org.springframework.http.ResponseEntity`, `java.time.Instant`, `java.util.List`, `static org.assertj.core.api.Assertions.assertThat`, `static org.mockito.Mockito.when`. Update the class Javadoc to say MPP-24 adds the 200 path and the JSON shape.

- [x] **Step 2: Run it and see it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetAwardControllerTest`
Expected: `getAwards_withPrincipal_returnsTheCabinet` fails (the body is the `getAwards` list, or `null` from the unstubbed mock). The other two pass.

- [x] **Step 3: Switch the controller to the cabinet**

Replace the return line and update the Javadoc:

```java
/**
 * MPP-22 / MPP-24: the caller's trophy cabinet - status per streak type plus their firsts
 * (see AwardService#getCabinet). Read by the cabinet (MPP-23).
 */
```

```java
        return ResponseEntity.ok(awardService.getCabinet(userPrincipal.getId()));
```

- [x] **Step 4: Run it and see it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetAwardControllerTest`
Expected: `Tests run: 3, Failures: 0, Errors: 0`.

### Task 17: Boot the backend against the local DB (validate + JPQL + listener) ✓

- Skill: java-backend

**Files:**
- (none — runtime check only)

- [x] **Step 1: Start the backend on a spare port in the background**

Run (PowerShell, `run_in_background`, with the JAVA_HOME / Maven PATH prefix from `CLAUDE.md`): `cd foodbytes-app\foodbytes-api; mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8099" *> "$env:TEMP\mpp24-boot.log"`
The `application.yml` defaults point at the local `foodbytes-db`, so Docker Desktop must be running.

- [x] **Step 2: Wait for startup, then read the outcome**

Run: `Select-String -Path "$env:TEMP\mpp24-boot.log" -Pattern "Started FoodBytesApplication|Schema-validation|APPLICATION FAILED TO START|QueryCreationException|Validation failed for query|UnsatisfiedDependencyException"`
Expected: a `Started FoodBytesApplication in … seconds` line and none of the failure patterns. Poll until one of them appears.
- `Schema-validation … pet_firsts`: compare `PetFirst` with `SHOW COLUMNS FROM pet_firsts` (Task 2 Step 2), and fix the entity.
- A query validation failure: fix `findFullyPlannedDates` (Task 6) and repeat.

- [x] **Step 3: Confirm the route is still wired and secured**

Run: `curl.exe -s -o NUL -w "%{http_code}" http://localhost:8099/api/pet/awards`
Expected: `401`.

- [x] **Step 4: Stop the backend**

Run: `Get-NetTCPConnection -LocalPort 8099 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`
Expected: no output. `Get-NetTCPConnection -LocalPort 8099 -State Listen -ErrorAction SilentlyContinue` then returns nothing.

### Task 18: Manual end-to-end check (developer) — pending: developer play-test in Ready for Test

- Skill: none — manual check in the running app, owned by the developer (needs a Google login)

**Files:**
- (none)

- [ ] **Step 1: Run the stack locally with login**

Start the backend as in `CLAUDE.md` → "Running the backend locally with Google login" (`FRONTEND_URL=http://localhost:5173`), and the client with `cd foodbytes-app\client; npm run dev`. Log in at `http://localhost:5173`.

- [ ] **Step 2: Note the starting state**

Open `http://localhost:5173/api/pet/awards` in the same browser.
Expected: JSON `{"streaks":[…3 items…],"firsts":[…4 items…]}`. Note which `firsts` have `earnedAt: null`.

- [ ] **Step 3: Trigger one unearned first and re-read**

Pick one that is `null` for you: save a template on `/mealplan`, generate a shopping list on `/shopping`, or tick a meal that has a homemade extra. Then reload `/api/pet/awards`.
Expected: that key now has an ISO `earnedAt` (UTC, `…Z`). The original action behaved exactly as before. The backend log shows no `MPP-24: could not record first` warning.

- [ ] **Step 4: Confirm a repeat does not move it**

Repeat the same action and reload.
Expected: `earnedAt` is unchanged.

---

## Phase 6 — Final verification

The closing phase. No production changes beyond the version bump, only sanity checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-24 is a **Task**, so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-24: Pip "firsts" — template, shopping list, full week and homemade-extra firsts recorded per person, backfilled, and returned from GET /api/pet/awards`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep that recording stays in services and credit stays with the actor ✓

- Skill: java-backend

**Files:**
- (none — audit only)

- [x] **Step 1: No firsts code in controllers**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\controller\*.java -Pattern "PetFirst|publishEvent"`
Expected: zero hits.

- [x] **Step 2: Every candidate is built from the actor's id**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\service\*.java -Pattern "PetFirstCandidate\.(of|planned|cooked)\("`
Expected: exactly 7 hits, in `MealPlanService` (4), `MealPlanTemplateService` (2) and `PersistedShoppingListService` (1). Each one's first argument is `userId`, never `effectiveOwnerId` / `ownerId`.

### Task M.3: Run the full backend test suite ✓

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task M.4: Production build ✓

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors. The client is unchanged apart from the version, so this only proves the bump.

### Task M.5: Update the PR description ✓

- [x] **Step 1: Write `pr-description.md` in this plan folder for the developer to paste**

Include:
- A link to `plan.md` in this folder.
- A summary of the change, and the new version from Task M.1.
- The migration `2026-10-13-mpp24-pet-firsts.sql`: applied locally. It is order 4 in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`, after MPP-22's order 3, and must be applied to Railway before the merged backend deploys. Its backfill then credits live data.
- **Breaking for MPP-23:** `GET /api/pet/awards` is now `{streaks, firsts}`, not an array.
- Verification results: the per-class test runs, the full suite, the boot check (Task 17), and the manual check (Task 18) if the developer has done it.
- A one-line note for future contributors: a new first is a `FirstKey` value plus a `PetFirstCandidate` published from the service write path. Never record from a controller, and never inside the request's transaction.
- A suggested commit subject: `MPP-24: Pip firsts — per-person one-off achievements with backfill`.

---

## Self-review

**Spec coverage:**
- Migration creating `pet_firsts` (local apply + Railway checklist) — Tasks 1, 2, 3.
- `FirstKey`, `PetFirst`, `PetFirstRepository` — Tasks 4, 5.
- `MealPlanEntryRepository.findFullyPlannedDates` — Task 6.
- `PetFirstPolicy` (7 consecutive days, scan window) — Task 7.
- `PetFirstCandidate` + `PetFirstRecorder` (after commit, never fails the request — AC 2) — Tasks 9, 11.
- `PetFirstService.evaluate` / `getFirsts` (per-person credit, idempotent — AC 1) — Task 10.
- Hooks: `saveTemplate`, `generateShoppingList`, `assignRecipe`, `copyWeek`, `swapDays`, `applyTemplate`, `setEntryEaten` — Tasks 12, 13, 14.
- `FirstStatusDTO`, `PetAwardsDTO`, `AwardService.getCabinet`, `GET /api/pet/awards` returns `{streaks, firsts}` (AC 3) — Tasks 8, 15, 16.
- Backfill crediting the owner for template/list/week and the eater for homemade extra (AC 4) — Tasks 1, 2.
- Boot check and manual end-to-end — Tasks 17, 18.
- Version bump + CHANGELOG — Task M.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, "appropriate error handling", or "similar to Task N". Every step has a code block or a `Run:` / `Expected:` pair, except Task 18, which is an explicit developer manual check with route and expected outcome.

**Type / name consistency:**
- Table `pet_firsts`, columns `user_id` / `first_key` / `earned_at`, key `uk_pet_firsts` — Tasks 1, 4, 5.
- `FirstKey.{MAKE_TEMPLATE, GENERATE_SHOPPING_LIST, PLAN_FULL_WEEK, COOK_HOMEMADE_EXTRA}` matches the `CHECK` constraint and the backfill literals.
- Repository methods: `insertIfAbsent(Long, String)`, `existsByUserIdAndFirstKey(Long, FirstKey)`, `countHomemadeExtras(Long)` → `long`, `findByUserId(Long)`, and `findFullyPlannedDates(Long, Collection<String>, LocalDate, LocalDate, long)`. Used identically in Tasks 5, 6 and 10.
- `PetFirstCandidate.of/planned/cooked` and `PetFirstPolicy.scanFrom/scanTo/containsFullWeek/FULL_WEEK_DAYS` are used identically in Tasks 7 and 9–14.
- DTOs: `FirstStatusDTO(key, earnedAt)`, `PetAwardsDTO(streaks, firsts)`, and `AwardService.getCabinet(Long)` → `PetAwardsDTO`. Used identically in Tasks 8, 10, 15 and 16.
- The `AwardService` constructor order ends `…, clock, petFirstService` in both Task 15 steps.

**Phase boundary cleanliness:**
- Phase 1: the new table is unmapped, so the app is unaffected.
- Phase 2: the code compiles, and new types and queries are unused.
- Phase 3: new beans exist with green tests, and no publisher exists yet.
- Phase 4: each service and its test class change together, so every task ends green.
- Phase 5: the endpoint reshape and its tests land together, and the boot proves runtime wiring.
- Phase 6: bookkeeping and audits only.
