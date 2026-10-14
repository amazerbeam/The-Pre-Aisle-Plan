# Tasks: Sprinkles — a consistency-only currency (MPP-25)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-14

**Goal:** Give each person their own sprinkles balance — an append-only, once-per-source ledger earned from ticking main meals (10, +5 on time, +5 homemade extra) and from fully planned Monday weeks (20 to every plan member) — returned as `sprinkles` on the pet payload and shown as a counter in Pip's room.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-14-mpp25-pet-sprinkles.sql` — `pet_sprinkles` ledger + backfill of existing ticks
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/SprinkleSource.java` — the four earning sources
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetSprinkle.java` — ledger entity
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetSprinkleRepository.java` — exists / sum / insertIfAbsent
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/SprinklePolicy.java` — amounts + pure rules
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/SprinkleService.java` — earning + balance
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/SprinkleRecorder.java` — after-commit listener
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/SprinklePolicyTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/SprinkleServiceTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/SprinkleRecorderTest.java`

**Modified:**
- `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` — row 7
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/UserRepository.java` — `findPlanMemberIds`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealTimesPolicy.java` — `byTime(User, String)`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealTimesPolicyTest.java` — `byTime` cases
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetDTO.java` — `sprinkles`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetPolicy.java` — `toDTO(..., long sprinkles)`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetService.java` — balance via `SprinkleService`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java` — mock + assert balance
- `foodbytes-app/client/src/contexts/PetContext.jsx` — `sprinkles`, `refreshPet`
- `foodbytes-app/client/src/components/recipes/MealEatenSection.jsx` — `refreshPet()` after a tick
- `foodbytes-app/client/src/constants/petRoom.js` — `SPRINKLES_ICON`
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` — `sprinkles` prop + `SprinklesCounter`
- `foodbytes-app/client/src/components/pet/room/PetRoom.css` — `.pip-room-sprinkles`
- `foodbytes-app/client/src/components/pet/PetView.jsx` — pass `sprinkles`
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump

**Deleted:** (none)

---

## Phase 1 — Ledger schema

Write the migration and get it applied to the local `foodbytes-db` before any Java maps the table. Nothing in the app reads the table yet, so the build is unaffected and the phase is a safe stop.

### Task 1: Write the `pet_sprinkles` migration and register it for Railway ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-14-mpp25-pet-sprinkles.sql`
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`

- [x] **Step 1: Write the migration file**

```sql
-- MPP-25: sprinkles - Pip's consistency-only currency. An append-only ledger: one row per payout,
-- one payout per (person, source) ever (uk_pet_sprinkles). The balance is SUM(amount) per user.
--
-- Sources and source_id:
--   MEAL_EATEN     10  meal_plan_entries.id  - a person's first paid tick of a breakfast/lunch/dinner
--   MEAL_ON_TIME    5  meal_plan_entries.id  - that tick landed on the plan day by the meal's time
--   HOMEMADE_EXTRA  5  meal_plan_entries.id  - that meal had a direct extra chosen as homemade
--   FULL_WEEK      20  epoch day of a Monday - Mon-Sun with breakfast/lunch/dinner all planned,
--                                            paid to every member of the shared plan
-- source_id has no FK: a deleted entry keeps its payout. Rows are never updated or deleted by the
-- app, so un-ticking a meal never refunds and re-ticking never pays again (MPP-25 AC 3).
-- Per person (MPP-33): user_id is the earner, never the meal-plan owner.
--
-- Lossless: creates a new table and only INSERTs into it; no existing row is changed. Local
-- evidence (2026-10-14): 2 ticks by 1 person in meal_plan_entry_eaten; 13 users, 2 linked.
-- The backfill seals existing ticks (MEAL_EATEN + HOMEMADE_EXTRA) so un-tick/re-tick of a
-- pre-ledger tick cannot pay. No MEAL_ON_TIME / FULL_WEEK backfill. Re-running is a no-op
-- (ON DUPLICATE KEY UPDATE id = id). On Railway the per-person tick table is created empty by
-- MPP-33, so the backfill inserts nothing there.
--
-- MUST be applied before the backend that maps PetSprinkle deploys (ddl-auto: validate).
-- MPP-15 is local-first: applied to the local foodbytes-db now; listed as order 7 in
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

CREATE TABLE IF NOT EXISTS pet_sprinkles (
  id           BIGINT      NOT NULL AUTO_INCREMENT,
  user_id      BIGINT      NOT NULL,
  source_type  VARCHAR(16) NOT NULL,
  source_id    BIGINT      NOT NULL,
  amount       INT         NOT NULL,
  created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_sprinkles (user_id, source_type, source_id),
  CONSTRAINT chk_pet_sprinkles_source CHECK (source_type IN
    ('MEAL_EATEN','MEAL_ON_TIME','FULL_WEEK','HOMEMADE_EXTRA')),
  CONSTRAINT fk_pet_sprinkles_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Backfill 1/2: every existing main-meal tick whose plan date is not after the tick's local date
-- (Europe/Dublin; falls back to UTC when MySQL has no tz tables) -> MEAL_EATEN 10, at the tick.
-- Same rules as SprinklePolicy.isMainMeal / isPayable.
INSERT INTO pet_sprinkles (user_id, source_type, source_id, amount, created_at)
SELECT t.user_id, 'MEAL_EATEN', t.meal_plan_entry_id, 10, t.eaten_at
FROM meal_plan_entry_eaten t
JOIN meal_plan_entries e ON e.id = t.meal_plan_entry_id
JOIN meals m ON m.id = e.meal_id
WHERE m.`key` IN ('breakfast','lunch','dinner')
  AND e.plan_date <= DATE(COALESCE(CONVERT_TZ(t.eaten_at, '+00:00', 'Europe/Dublin'), t.eaten_at))
ON DUPLICATE KEY UPDATE pet_sprinkles.id = pet_sprinkles.id;

-- Backfill 2/2: of those, ticks of a meal with a direct homemade extra -> HOMEMADE_EXTRA 5.
-- Same probe as PetFirstRepository.countHomemadeExtras (no choice row = homemade, MPP-10).
INSERT INTO pet_sprinkles (user_id, source_type, source_id, amount, created_at)
SELECT s.user_id, 'HOMEMADE_EXTRA', s.source_id, 5, s.created_at
FROM pet_sprinkles s
JOIN meal_plan_entries e ON e.id = s.source_id
WHERE s.source_type = 'MEAL_EATEN'
  AND EXISTS (
    SELECT 1
    FROM recipe_extras x
    LEFT JOIN meal_plan_entry_extra_choices c
           ON c.meal_plan_entry_id = e.id AND c.extra_recipe_id = x.child_recipe_id
    WHERE x.parent_recipe_id = e.recipe_id
      AND (c.id IS NULL OR c.is_homemade = 1))
ON DUPLICATE KEY UPDATE pet_sprinkles.id = pet_sprinkles.id;
```

- [x] **Step 2: Register it for Railway**

Append to the table in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`:

```
| 7 | MPP-25 | foodbytes-app/database/migrations/2026-10-14-mpp25-pet-sprinkles.sql | — | — |
```

### Task 2: Apply the migration to the local database ✓

- Skill: none — DBA operation against the local Docker MySQL, owned by the developer

**Files:**
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` (row 7 "Applied locally" date)

- [x] **Step 1: Developer applies the file locally**

Run (developer, from the repo root, Git Bash or cmd): `docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app/database/migrations/2026-10-14-mpp25-pet-sprinkles.sql`
Expected: no output, exit code 0.

- [x] **Step 2: Verify the table and the backfill**

Run: `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SHOW COLUMNS FROM pet_sprinkles; SELECT source_type, COUNT(*), SUM(amount) FROM pet_sprinkles GROUP BY source_type"`
Expected: six columns (`id, user_id, source_type, source_id, amount, created_at`); at most 2 `MEAL_EATEN` rows (one per existing main-meal tick) and 0+ `HOMEMADE_EXTRA` rows.

- [x] **Step 3: Record the local apply**

In row 7 of `railway-migrations.md`, set "Applied locally" to today's date. Leave "Applied to Railway" as `—`.

---

## Phase 2 — Ledger, rules and earning (backend)

Map the table, add the pure rules and the earning service, and hook it to the existing MPP-24 events. The pet payload is untouched until Phase 3, so the API contract is unchanged at the end of this phase; backend compiles and the new tests pass.

### Task 3: Add the `SprinkleSource` enum and `PetSprinkle` entity ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/SprinkleSource.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetSprinkle.java`

- [x] **Step 1: Write the enum**

```java
package com.foodbytes.model;

/**
 * MPP-25: what paid a sprinkles ledger row. Stored as the name in pet_sprinkles.source_type
 * (chk_pet_sprinkles_source). Never a variety reward (MPP-11): none depends on which food was chosen.
 */
public enum SprinkleSource {
    MEAL_EATEN,      // source_id = meal_plan_entries.id
    MEAL_ON_TIME,    // source_id = meal_plan_entries.id
    FULL_WEEK,       // source_id = the week's Monday as LocalDate#toEpochDay
    HOMEMADE_EXTRA   // source_id = meal_plan_entries.id
}
```

- [x] **Step 2: Write the entity** (mirror `PetFirst`)

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
 * MPP-25: one sprinkles payout to one person. Identified by (user, source type, source id), so a
 * source pays each person once ever; written only by PetSprinkleRepository#insertIfAbsent and the
 * migration's backfill. Never updated or deleted by the app.
 */
@Entity
@Table(name = "pet_sprinkles", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_sprinkles", columnNames = {"user_id", "source_type", "source_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetSprinkle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The earner - never the meal-plan owner (MPP-33)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "source_type", nullable = false, length = 16)
    private SprinkleSource sourceType;

    @Column(name = "source_id", nullable = false)
    private Long sourceId;

    @Column(name = "amount", nullable = false)
    private int amount;

    // DB default CURRENT_TIMESTAMP (UTC, as the JDBC URL pins serverTimezone=UTC)
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetSprinkle other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetSprinkle.class.hashCode();
    }
}
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, 0 errors.

### Task 4: Add `PetSprinkleRepository` and `UserRepository.findPlanMemberIds` ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetSprinkleRepository.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/UserRepository.java`

- [x] **Step 1: Write the ledger repository**

```java
package com.foodbytes.repository;

import com.foodbytes.model.PetSprinkle;
import com.foodbytes.model.SprinkleSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** MPP-25: each person's sprinkles ledger. */
@Repository
public interface PetSprinkleRepository extends JpaRepository<PetSprinkle, Long> {

    boolean existsByUserIdAndSourceTypeAndSourceId(Long userId, SprinkleSource sourceType, Long sourceId);

    /** The person's balance; 0 with no rows. uk_pet_sprinkles leads with user_id, so this is a range scan. */
    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM PetSprinkle s WHERE s.userId = :userId")
    long sumAmountByUserId(@Param("userId") Long userId);

    /**
     * Pays a source, or leaves the existing payout untouched. Two devices paying the same source at
     * once converge on uk_pet_sprinkles instead of failing or paying twice.
     */
    @Modifying
    @Query(value = "INSERT INTO pet_sprinkles (user_id, source_type, source_id, amount) " +
                   "VALUES (:userId, :sourceType, :sourceId, :amount) ON DUPLICATE KEY UPDATE id = id",
           nativeQuery = true)
    void insertIfAbsent(@Param("userId") Long userId,
                        @Param("sourceType") String sourceType,
                        @Param("sourceId") Long sourceId,
                        @Param("amount") int amount);
}
```

- [x] **Step 2: Add the plan-member query to `UserRepository`**

Add imports `org.springframework.data.jpa.repository.Query`, `org.springframework.data.repository.query.Param`, `java.util.List` if absent, and the method:

```java
    /** MPP-25: everyone on this meal plan — the owner and every user linked to them. */
    @Query("SELECT u.id FROM User u WHERE u.id = :ownerId OR u.mealPlanOwnerId = :ownerId")
    List<Long> findPlanMemberIds(@Param("ownerId") Long ownerId);
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, 0 errors.

### Task 5: Add `MealTimesPolicy.byTime` ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealTimesPolicy.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealTimesPolicyTest.java`

- [x] **Step 1: Write the failing tests** (append to `MealTimesPolicyTest`)

```java
    @Test
    void byTime_usesSavedTimeOrDefault_andIsEmptyForNonMainMeals() {
        User user = new User();
        user.setLunchBy(LocalTime.of(13, 30));

        assertThat(MealTimesPolicy.byTime(user, "breakfast")).contains(MealTimesPolicy.DEFAULT_BREAKFAST_BY);
        assertThat(MealTimesPolicy.byTime(user, "lunch")).contains(LocalTime.of(13, 30));
        assertThat(MealTimesPolicy.byTime(user, "dinner")).contains(MealTimesPolicy.DEFAULT_DINNER_BY);
        assertThat(MealTimesPolicy.byTime(user, "snacks")).isEmpty();
        assertThat(MealTimesPolicy.byTime(user, "extras")).isEmpty();
    }
```

(Add any missing imports: `com.foodbytes.model.User`, `java.time.LocalTime`, AssertJ `assertThat`.)

- [x] **Step 2: Run it to see it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealTimesPolicyTest`
Expected: compilation failure — `cannot find symbol: method byTime`.

- [x] **Step 3: Implement**

Add `import java.util.Optional;` and, after `effective(User)`:

```java
    /** MPP-25: the person's effective "by" time for a main meal key; empty for snacks and extras. */
    public static Optional<LocalTime> byTime(User user, String mealKey) {
        return switch (mealKey) {
            case "breakfast" -> Optional.of(orDefault(user.getBreakfastBy(), DEFAULT_BREAKFAST_BY));
            case "lunch" -> Optional.of(orDefault(user.getLunchBy(), DEFAULT_LUNCH_BY));
            case "dinner" -> Optional.of(orDefault(user.getDinnerBy(), DEFAULT_DINNER_BY));
            default -> Optional.empty();
        };
    }

    private static LocalTime orDefault(LocalTime saved, LocalTime fallback) {
        return saved != null ? saved : fallback;
    }
```

Then make `format` reuse it: `return orDefault(saved, fallback).format(HH_MM);`.

- [x] **Step 4: Run it to see it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealTimesPolicyTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 6: Add `SprinklePolicy` (amounts + pure rules) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/SprinklePolicy.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/SprinklePolicyTest.java`

- [x] **Step 1: Write the failing tests**

```java
package com.foodbytes.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

/** MPP-25 AC 2: the pure earning rules. */
class SprinklePolicyTest {

    private static final LocalDate MON = LocalDate.of(2026, 10, 12);   // a Monday (IST, UTC+1)
    private static final LocalTime LUNCH_BY = LocalTime.of(15, 0);

    @Test
    void amounts_matchTheTicket() {
        assertThat(SprinklePolicy.MEAL_EATEN).isEqualTo(10);
        assertThat(SprinklePolicy.ON_TIME_BONUS).isEqualTo(5);
        assertThat(SprinklePolicy.FULL_WEEK).isEqualTo(20);
        assertThat(SprinklePolicy.HOMEMADE_BONUS).isEqualTo(5);
    }

    @Test
    void onlyMainMealsPay() {
        assertThat(SprinklePolicy.isMainMeal("breakfast")).isTrue();
        assertThat(SprinklePolicy.isMainMeal("lunch")).isTrue();
        assertThat(SprinklePolicy.isMainMeal("dinner")).isTrue();
        assertThat(SprinklePolicy.isMainMeal("snacks")).isFalse();
        assertThat(SprinklePolicy.isMainMeal("extras")).isFalse();
    }

    @Test
    void futurePlanDatesDoNotPay() {
        assertThat(SprinklePolicy.isPayable(MON, MON)).isTrue();
        assertThat(SprinklePolicy.isPayable(MON.minusDays(3), MON)).isTrue();
        assertThat(SprinklePolicy.isPayable(MON.plusDays(1), MON)).isFalse();
    }

    @Test
    void onTime_isLocalDublinTime_onThePlanDay_atOrBeforeTheByTime() {
        // 13:59 UTC = 14:59 IST -> on time
        assertThat(SprinklePolicy.isOnTime(LocalDateTime.of(2026, 10, 12, 13, 59), MON, LUNCH_BY)).isTrue();
        // 14:00 UTC = 15:00 IST -> exactly the by-time still counts
        assertThat(SprinklePolicy.isOnTime(LocalDateTime.of(2026, 10, 12, 14, 0), MON, LUNCH_BY)).isTrue();
        // 14:01 UTC = 15:01 IST -> late
        assertThat(SprinklePolicy.isOnTime(LocalDateTime.of(2026, 10, 12, 14, 1), MON, LUNCH_BY)).isFalse();
        // next day, early -> late (not the plan day)
        assertThat(SprinklePolicy.isOnTime(LocalDateTime.of(2026, 10, 13, 8, 0), MON, LUNCH_BY)).isFalse();
        // 23:30 UTC on Sunday = 00:30 IST Monday -> counts for Monday's breakfast
        assertThat(SprinklePolicy.isOnTime(LocalDateTime.of(2026, 10, 11, 23, 30), MON, LocalTime.of(11, 0))).isTrue();
    }

    @Test
    void mondaysCovering_listsEachCalendarWeekTouched() {
        assertThat(SprinklePolicy.mondaysCovering(MON.plusDays(2), MON.plusDays(2))).containsExactly(MON);
        assertThat(SprinklePolicy.mondaysCovering(MON.plusDays(6), MON.plusDays(7))).containsExactly(MON, MON.plusDays(7));
        assertThat(SprinklePolicy.mondaysCovering(MON, MON.plusDays(6))).containsExactly(MON);
    }
}
```

- [x] **Step 2: Run it to see it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinklePolicyTest`
Expected: compilation failure — `cannot find symbol: class SprinklePolicy`.

- [x] **Step 3: Implement**

```java
package com.foodbytes.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

/**
 * MPP-25: what earns sprinkles, and how many. The amounts are illustrative and retunable (target
 * about 300 a week from about 21 logged meals). Only consistency pays - never variety (MPP-11).
 * Days are Europe/Dublin (HabitStreakPolicy.ZONE) until a per-user zone exists.
 */
public final class SprinklePolicy {

    public static final int MEAL_EATEN = 10;
    public static final int ON_TIME_BONUS = 5;
    public static final int FULL_WEEK = 20;
    public static final int HOMEMADE_BONUS = 5;
    /** A full week is Monday to Sunday, every day with breakfast, lunch and dinner planned. */
    public static final int WEEK_DAYS = 7;

    private SprinklePolicy() {
    }

    /** Breakfast, lunch and dinner pay; snacks and extras do not. */
    static boolean isMainMeal(String mealKey) {
        return PlanStreakPolicy.MAIN_MEAL_KEYS.contains(mealKey);
    }

    /** A meal ticked before its plan date pays nothing, so pre-ticking can't farm sprinkles. */
    static boolean isPayable(LocalDate planDate, LocalDate today) {
        return !planDate.isAfter(today);
    }

    /** The tick (UTC wall time) fell on the plan day, at or before the meal's by-time, in Dublin. */
    static boolean isOnTime(LocalDateTime eatenAtUtc, LocalDate planDate, LocalTime byTime) {
        ZonedDateTime local = eatenAtUtc.atZone(ZoneOffset.UTC).withZoneSameInstant(HabitStreakPolicy.ZONE);
        return local.toLocalDate().equals(planDate) && !local.toLocalTime().isAfter(byTime);
    }

    /** The Monday of every calendar week that overlaps [from, to], oldest first. */
    static List<LocalDate> mondaysCovering(LocalDate from, LocalDate to) {
        List<LocalDate> mondays = new ArrayList<>();
        for (LocalDate monday = from.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
             !monday.isAfter(to);
             monday = monday.plusDays(WEEK_DAYS)) {
            mondays.add(monday);
        }
        return mondays;
    }
}
```

- [x] **Step 4: Run it to see it pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinklePolicyTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 7: Add `SprinkleService` (earning + balance) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/SprinkleService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/SprinkleServiceTest.java`

- [x] **Step 1: Write the failing tests**

Mockito, `@ExtendWith(MockitoExtension.class)`, mocks: `PetSprinkleRepository sprinkles`, `MealPlanEntryRepository entries`, `MealPlanEntryEatenRepository ticks`, `PetFirstRepository firsts`, `UserRepository users`, `ExtraChoiceService extraChoiceService`. Build the service by hand in `@BeforeEach` with a fixed clock: `Clock.fixed(Instant.parse("2026-10-14T12:00:00Z"), HabitStreakPolicy.ZONE)` (today = Wed 2026-10-14; Monday = 2026-10-12). Helpers build a `MealPlanEntry` with `id`, `planDate`, and `meal` (a `Meal` with `key`), and a `MealPlanEntryEaten` with `eatenAt`. Use `lenient()` only where a stub is unused on purpose.

Tests (one `@Test` each, names as below):

1. `firstTick_ofMainMeal_pays10` — entry 50 lunch on today; no `MEAL_EATEN` row; tick at `2026-10-14T16:00` UTC (17:00 IST, late); user with default times; `firsts.countHomemadeExtras(50)` → 0. Verify `sprinkles.insertIfAbsent(1L, "MEAL_EATEN", 50L, 10)` and **never** `"MEAL_ON_TIME"` / `"HOMEMADE_EXTRA"`.
2. `tickByMealTime_paysOnTimeBonus` — same, tick at `2026-10-14T13:00` UTC (14:00 IST). Verify `MEAL_EATEN` 10 and `insertIfAbsent(1L, "MEAL_ON_TIME", 50L, 5)`.
3. `homemadeExtra_paysHomemadeBonus` — `countHomemadeExtras(50)` → 1. Verify `insertIfAbsent(1L, "HOMEMADE_EXTRA", 50L, 5)`.
4. `reTick_afterUntick_paysNothing` (AC 3) — `existsByUserIdAndSourceTypeAndSourceId(1L, MEAL_EATEN, 50L)` → true. Verify `sprinkles.insertIfAbsent(...)` never called (any args) and `firsts` never consulted.
5. `snackTick_paysNothing` — entry meal key `snacks`. Verify no insert.
6. `futureDatedTick_paysNothing_andWritesNoRow` — plan date 2026-10-15. Verify no insert and no `existsBy…` call (so ticking it on the day still pays).
7. `untickedBeforeListenerRan_paysNothing` — `ticks.findByMealPlanEntryIdAndUserId(50L, 1L)` → empty. Verify no insert.
8. `deletedEntry_paysNothing` — `entries.findById(50L)` → empty. Verify no insert.
9. `twoLinkedUsers_tickingSameEntry_eachEarnTheirOwn` (AC 5) — call `mealEaten(1L, 50L)` then `mealEaten(2L, 50L)` with both having ticks and no prior rows. Verify `insertIfAbsent(1L, "MEAL_EATEN", 50L, 10)` and `insertIfAbsent(2L, "MEAL_EATEN", 50L, 10)`.
10. `fullWeek_paysEveryPlanMember` — actor 2 linked to owner 1 (`extraChoiceService.resolveOwnerId(2L)` → 1L); `entries.findFullyPlannedDates(1L, MAIN_MEAL_KEYS, MON, MON+6, 3L)` → 7 dates; `users.findPlanMemberIds(1L)` → `[1L, 2L]`. Call `planned(2L, MON.plusDays(2), MON.plusDays(2))`. Verify `insertIfAbsent(1L, "FULL_WEEK", MON.toEpochDay(), 20)` and the same for `2L`.
11. `partWeek_paysNothing` — `findFullyPlannedDates` → 6 dates. Verify no insert and `findPlanMemberIds` never called.
12. `copyWeekAcrossTwoWeeks_checksEachMonday` — `planned(1L, MON.plusDays(6), MON.plusDays(7))`, owner 1, first week full (7 dates), second week empty. Verify exactly one `FULL_WEEK` insert with `source_id = MON.toEpochDay()`.
13. `balance_isTheLedgerSum` — `sumAmountByUserId(1L)` → 135L; assert `balance(1L) == 135L`.
14. `noRuleRewardsVariety` — assert `SprinkleSource.values()` is exactly `MEAL_EATEN, MEAL_ON_TIME, FULL_WEEK, HOMEMADE_EXTRA` (a guard: adding a source forces a reviewer to re-read the no-variety rule).

- [x] **Step 2: Run them to see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinkleServiceTest`
Expected: compilation failure — `cannot find symbol: class SprinkleService`.

- [x] **Step 3: Implement**

```java
package com.foodbytes.service;

import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.MealPlanEntryEaten;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.MealPlanEntryEatenRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.PetFirstRepository;
import com.foodbytes.repository.PetSprinkleRepository;
import com.foodbytes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Optional;

/**
 * MPP-25: pays sprinkles and reads the balance. Each source pays each person once ever
 * (uk_pet_sprinkles); nothing here deletes, so un-ticking never refunds (AC 3). Ticks pay the
 * person who ticked; a full week pays everyone on the shared plan (per-person Pip, MPP-33).
 */
@Service
@RequiredArgsConstructor
public class SprinkleService {

    private final PetSprinkleRepository petSprinkleRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealPlanEntryEatenRepository mealPlanEntryEatenRepository;
    private final PetFirstRepository petFirstRepository;
    private final UserRepository userRepository;
    private final ExtraChoiceService extraChoiceService;
    private final Clock clock;

    /**
     * A person ticked an entry eaten. Pays MEAL_EATEN plus the on-time and homemade bonuses, decided
     * once on the first paid tick: a re-tick pays nothing, even if the extra choice changed since.
     * REQUIRES_NEW: runs from SprinkleRecorder after the tick has committed.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void mealEaten(Long userId, Long entryId) {
        Optional<MealPlanEntry> found = mealPlanEntryRepository.findById(entryId);
        if (found.isEmpty()) return;
        MealPlanEntry entry = found.get();
        String mealKey = entry.getMeal().getKey();
        if (!SprinklePolicy.isMainMeal(mealKey)) return;
        if (!SprinklePolicy.isPayable(entry.getPlanDate(), HabitStreakPolicy.today(clock))) return;
        if (petSprinkleRepository.existsByUserIdAndSourceTypeAndSourceId(userId, SprinkleSource.MEAL_EATEN, entryId)) return;
        Optional<MealPlanEntryEaten> tick = mealPlanEntryEatenRepository.findByMealPlanEntryIdAndUserId(entryId, userId);
        if (tick.isEmpty()) return; // un-ticked before this ran

        pay(userId, SprinkleSource.MEAL_EATEN, entryId, SprinklePolicy.MEAL_EATEN);
        boolean onTime = userRepository.findById(userId)
                .flatMap(user -> MealTimesPolicy.byTime(user, mealKey))
                .map(byTime -> SprinklePolicy.isOnTime(tick.get().getEatenAt(), entry.getPlanDate(), byTime))
                .orElse(false);
        if (onTime) pay(userId, SprinkleSource.MEAL_ON_TIME, entryId, SprinklePolicy.ON_TIME_BONUS);
        if (petFirstRepository.countHomemadeExtras(entryId) > 0) {
            pay(userId, SprinkleSource.HOMEMADE_EXTRA, entryId, SprinklePolicy.HOMEMADE_BONUS);
        }
    }

    /**
     * A plan write touched [from, to]. Every Monday-Sunday week in that range that is now fully
     * planned pays FULL_WEEK to every member of the plan, whoever planned it.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void planned(Long actorId, LocalDate from, LocalDate to) {
        Long ownerId = extraChoiceService.resolveOwnerId(actorId);
        for (LocalDate monday : SprinklePolicy.mondaysCovering(from, to)) {
            int fullDays = mealPlanEntryRepository.findFullyPlannedDates(
                    ownerId,
                    PlanStreakPolicy.MAIN_MEAL_KEYS,
                    monday,
                    monday.plusDays(SprinklePolicy.WEEK_DAYS - 1),
                    PlanStreakPolicy.MAIN_MEAL_KEYS.size()).size();
            if (fullDays < SprinklePolicy.WEEK_DAYS) continue;
            for (Long memberId : userRepository.findPlanMemberIds(ownerId)) {
                pay(memberId, SprinkleSource.FULL_WEEK, monday.toEpochDay(), SprinklePolicy.FULL_WEEK);
            }
        }
    }

    /** The person's own balance (MPP-25 AC 4). */
    @Transactional(readOnly = true)
    public long balance(Long userId) {
        return petSprinkleRepository.sumAmountByUserId(userId);
    }

    private void pay(Long userId, SprinkleSource source, Long sourceId, int amount) {
        petSprinkleRepository.insertIfAbsent(userId, source.name(), sourceId, amount);
    }
}
```

Note: `findFullyPlannedDates` takes `long keyCount`; `MAIN_MEAL_KEYS.size()` widens implicitly.

- [x] **Step 4: Run them to see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinkleServiceTest`
Expected: `BUILD SUCCESS`, 14 tests, 0 failures.

### Task 8: Add `SprinkleRecorder` (after-commit listener) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/SprinkleRecorder.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/SprinkleRecorderTest.java`

- [x] **Step 1: Write the failing tests**

```java
package com.foodbytes.service;

import com.foodbytes.model.FirstKey;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

/** MPP-25: routes MPP-24 candidates to the earning rules, and never lets a failure escape. */
@ExtendWith(MockitoExtension.class)
class SprinkleRecorderTest {

    private static final LocalDate MON = LocalDate.of(2026, 10, 12);

    @Mock private SprinkleService sprinkleService;
    @InjectMocks private SprinkleRecorder recorder;

    @Test
    void cooked_routesToMealEaten() {
        recorder.onCandidate(PetFirstCandidate.cooked(1L, 50L));
        verify(sprinkleService).mealEaten(1L, 50L);
    }

    @Test
    void planned_routesToPlanned() {
        recorder.onCandidate(PetFirstCandidate.planned(2L, MON, MON.plusDays(6)));
        verify(sprinkleService).planned(2L, MON, MON.plusDays(6));
    }

    @Test
    void templateAndShoppingList_payNothing() {
        recorder.onCandidate(PetFirstCandidate.of(1L, FirstKey.MAKE_TEMPLATE));
        recorder.onCandidate(PetFirstCandidate.of(1L, FirstKey.GENERATE_SHOPPING_LIST));
        verifyNoInteractions(sprinkleService);
    }

    @Test
    void aFailure_isSwallowed_soTheTickStillSucceeds() {
        doThrow(new IllegalStateException("db down")).when(sprinkleService).mealEaten(1L, 50L);
        assertThatCode(() -> recorder.onCandidate(PetFirstCandidate.cooked(1L, 50L))).doesNotThrowAnyException();
    }
}
```

- [x] **Step 2: Run them to see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinkleRecorderTest`
Expected: compilation failure — `cannot find symbol: class SprinkleRecorder`.

- [x] **Step 3: Implement**

```java
package com.foodbytes.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * MPP-25: pays sprinkles after the triggering request has committed, from the same events that
 * drive MPP-24's firsts (a tick publishes COOK_HOMEMADE_EXTRA for every meal; plan writes publish
 * PLAN_FULL_WEEK with the dates touched) - the event name is MPP-24's, the payload is all we need.
 * A sprinkles failure must never fail or roll back a tick or a plan write, hence the catch.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SprinkleRecorder {

    private final SprinkleService sprinkleService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onCandidate(PetFirstCandidate candidate) {
        try {
            switch (candidate.key()) {
                case COOK_HOMEMADE_EXTRA -> sprinkleService.mealEaten(candidate.userId(), candidate.entryId());
                case PLAN_FULL_WEEK -> sprinkleService.planned(candidate.userId(), candidate.from(), candidate.to());
                case MAKE_TEMPLATE, GENERATE_SHOPPING_LIST -> { }
            }
        } catch (RuntimeException e) {
            log.warn("MPP-25: could not pay sprinkles for {} by user {}; the request itself succeeded",
                     candidate.key(), candidate.userId(), e);
        }
    }
}
```

- [x] **Step 4: Run them to see them pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinkleRecorderTest`
Expected: `BUILD SUCCESS`, 4 tests, 0 failures.

---

## Phase 3 — Balance on the pet payload (backend)

Expose the balance as `sprinkles` on both pet responses. Adding a JSON field is backwards-compatible with the current client, so the backend is releasable at the end of this phase.

### Task 9: Add `sprinkles` to `PetDTO` via `PetPolicy` and `PetService` ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetDTO.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetPolicy.java:36-44`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java`

- [x] **Step 1: Write the failing test** (in `PetServiceTest`)

Add `@Mock private SprinkleService sprinkleService;` beside the existing mocks. Add a test `getPet_carriesTheCallersOwnSprinkles`: stub the user/growth/wardrobe as the neighbouring `getPet` tests do, stub `sprinkleService.balance(<caller id>)` → `135L`, call `petService.getPet(<caller id>)` and assert `getSprinkles() == 135L`; verify `sprinkleService.balance` was called with the **caller's** id (not an owner id). Add the same `balance` stub to the existing rename test and assert `renamePet(...)`'s DTO also carries it. Leave other existing tests unchanged — with Mockito defaults an unstubbed `balance` returns `0L`.

- [x] **Step 2: Run it to see it fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest`
Expected: compilation failure — `cannot find symbol: method getSprinkles()`.

- [x] **Step 3: Implement**

`PetDTO` — append after `wardrobe`, and extend the class Javadoc with "MPP-25: sprinkles.":

```java
    private long sprinkles;           // MPP-25: the caller's own balance, 0 before any earning
```

`PetPolicy.toDTO`:

```java
    public static PetDTO toDTO(User user, PetGrowthDTO growth, WardrobeDTO wardrobe, long sprinkles) {
        String saved = user.getPetName();
        return new PetDTO(
                saved != null ? saved : DEFAULT_NAME,
                saved != null,
                MealTimesPolicy.effective(user),
                growth,
                wardrobe,
                sprinkles);
    }
```

`PetService` — add `private final SprinkleService sprinkleService;`, extend the class Javadoc with "MPP-25: and the caller's own sprinkles balance (SprinkleService).", and change `toDTO`:

```java
        return PetPolicy.toDTO(user, growth, wardrobeService.sync(user.getId(), growth),
                sprinkleService.balance(user.getId()));
```

- [x] **Step 4: Fix any other callers**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src -Recurse -Include *.java -Pattern "PetPolicy.toDTO\(|new PetDTO\("` (PowerShell: `Get-ChildItem foodbytes-app\foodbytes-api\src -Recurse -Include *.java | Select-String -Pattern "PetPolicy.toDTO\(|new PetDTO\("`)
Expected: only `PetService.java` and `PetPolicy.java` (plus any test). Update any test that builds a `PetDTO` with the 5-arg constructor to pass a trailing `0L`.

- [x] **Step 5: Run the pet tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest+PetControllerTest`
Expected: `BUILD SUCCESS`, 0 failures.

---

## Phase 4 — Sprinkles counter (frontend)

Read the balance from the pet payload, refresh it after a tick, and show it in the room. Each task leaves `npm run build` green; the last is the developer's visual check.

### Task 10: Expose `sprinkles` and `refreshPet` from `PetContext` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/contexts/PetContext.jsx`

- [x] **Step 1: Add a pet-only reload key**

Beside `const [reloadKey, setReloadKey] = useState(0)` add:

```jsx
  const [petReloadKey, setPetReloadKey] = useState(0)
```

and beside `retry`:

```jsx
  // MPP-25: refetch only /pet (e.g. the sprinkles a tick just paid) — retry() also refetches two weeks.
  const refreshPet = useCallback(() => setPetReloadKey(key => key + 1), [])
```

Add `petReloadKey` to the `/pet` effect's dependency array: `[isAuthenticated, todayISO, reloadKey, petReloadKey]`. Update that effect's comment to "/pet: sign-in, date rollover, retry, refreshPet, tab visible."

- [x] **Step 2: Expose them on the context value**

In `value`, beside `wardrobe: pet?.wardrobe ?? null,` add:

```jsx
    sprinkles: pet?.sprinkles ?? null,
    refreshPet,
```

Extend the provider's doc comment with: `MPP-25: \`sprinkles\` — your own balance from the pet payload (null until it loads); \`refreshPet()\` refetches just /pet.`

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 11: Refresh the pet after a confirmed tick in `MealEatenSection` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/MealEatenSection.jsx:25-55`

- [x] **Step 1: Call `refreshPet` after the server confirms a tick**

Change `const { pet, todayISO, yesterdayISO } = usePet()` to `const { pet, todayISO, yesterdayISO, refreshPet } = usePet()`. Directly after `await setEntryEaten(entryId, next)` add:

```jsx
      if (next) refreshPet() // MPP-25: the tick may have paid sprinkles; un-ticking never changes them
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 12: Render the sprinkles counter in `PetRoom` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/petRoom.js`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css`
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx`

- [x] **Step 1: Add the constant** (after `ROOM_HINT` in `constants/petRoom.js`)

```js
export const SPRINKLES_ICON = '✨' // MPP-25: the room's sprinkles counter
```

- [x] **Step 2: Add the prop and counter to `PetRoom`**

Add `sprinkles = null` to the destructured props (after `wardrobe = null`), import `SPRINKLES_ICON` beside `ROOM_HINT`, extend the header comment with `MPP-25: a read-only sprinkles counter, top-right, once the balance has loaded.`, and render directly after the `pip-room-hint` paragraph:

```jsx
        {typeof sprinkles === 'number' && <SprinklesCounter count={sprinkles} />}
```

Add the helper component after `SpeechBubble` (file order: component → helpers → export):

```jsx
// MPP-25: display-only, so no touch target; the label reads the number with its unit.
function SprinklesCounter({ count }) {
  return (
    <p className="pip-room-sprinkles" aria-label={`${count} sprinkles`}>
      <span aria-hidden="true">{SPRINKLES_ICON} {count}</span>
    </p>
  )
}
```

- [x] **Step 3: Style it like the hint** (append after the `.pip-room-hint` block in `PetRoom.css`)

```css
/* MPP-25: sprinkles counter — the hint's bubble style, pinned top-right */
.pip-room-sprinkles {
  position: absolute;
  top: 10px;
  right: 10px;
  margin: 0;
  padding: 5px 9px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: #5c5670;
  font-size: 0.72rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  pointer-events: none;
}
```

- [x] **Step 4: Pass the balance from `PetView`**

Add `sprinkles` to the `usePet()` destructure in `PetView.jsx:36`, and pass `sprinkles={sprinkles}` on the `<PetRoom … />` element.

- [x] **Step 5: Build and measure**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

Run: `(Get-Content foodbytes-app\client\src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines; (Get-Content foodbytes-app\client\src\contexts\PetContext.jsx | Measure-Object -Line).Lines`
Expected: both under 400 (≈ 220 and ≈ 220).

### Task 13: Manual check in the browser — pending: developer play-test (Ready for Test)

- Skill: none — manual browser check by the developer (no frontend test runner exists)

**Files:** (none — verification only)

- [ ] **Step 1: Run the stack locally**

Backend per `CLAUDE.md` → "Running the backend locally with Google login" (local `foodbytes-db` with Task 2 applied); frontend `cd foodbytes-app\client; npm run dev`.

- [ ] **Step 2: Walk the observable outcomes** (Chrome DevTools, 375 px wide and desktop)

1. `/pet` → the room shows `✨ N` top-right, no horizontal scroll at 375 px, and it does not cover the bubble or the fridge/cabinet buttons.
2. Open today's lunch from the calendar → **Mark as eaten** → back on `/pet` the counter has risen by 10 (15 if before your lunch time, +5 more if the meal has a homemade extra).
3. Undo the tick, tick again → the counter does not change.
4. Plan the last missing breakfast/lunch/dinner of the current Monday–Sunday week → reload `/pet` → +20. If a linked partner account exists, sign in as them → their counter also rose by 20, but not by your meal ticks.
5. Network tab: `GET /api/pet` response contains `"sprinkles": <number>`.

---

## Phase 5 — Final verification

No production changes beyond the version bump — only sanity checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. This ticket is a **Story** → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-25: Sprinkles — a per-person, consistency-only currency (ledger, earning rules, balance on /api/pet, room counter)`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references and debt ✓

- Skill: none — verification only

**Files:** (none)

- [x] **Step 1: No 5-arg `PetPolicy.toDTO` remains**

Run: `Get-ChildItem foodbytes-app\foodbytes-api\src -Recurse -Include *.java | Select-String -Pattern "toDTO\(user, growth, wardrobe\)|toDTO\(user, growth, wardrobeService.sync\(user.getId\(\), growth\)\)"`
Expected: zero hits.

- [x] **Step 2: No new console logging in the client**

Run: `Get-ChildItem foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)"`
Expected: no hit in `PetContext.jsx`, `MealEatenSection.jsx`, `PetRoom.jsx`, `PetView.jsx` or `petRoom.js`.

- [x] **Step 3: No hard-coded amounts outside the policy**

Run: `Get-ChildItem foodbytes-app\foodbytes-api\src\main -Recurse -Include *.java | Select-String -Pattern "insertIfAbsent\(.*, (5|10|20)\)"`
Expected: zero hits (amounts only via `SprinklePolicy` constants).

### Task M.3: Run the full backend test suite ✓

- Skill: none — verification only

**Files:** (none)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors (suite grows by the new Sprinkle*/MealTimesPolicy/PetService tests).

### Task M.4: Production build ✓

- Skill: none — verification only

**Files:** (none)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task M.5: Write the PR description ✓

- Skill: none — release bookkeeping

**Files:**
- Create: `.claude/contract/MPP-25-sprinkles-currency/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary: `pet_sprinkles` ledger; earning rules (10 / +5 on time / +5 homemade / 20 full week to every plan member); un-tick never refunds, re-tick never re-pays; `sprinkles` on `GET /api/pet` and `PUT /api/pet/name`; room counter. New version from Task M.1.
- Migration: `2026-10-14-mpp25-pet-sprinkles.sql` — row 7 of `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`; apply to Railway after rows 1–6 and **before** the merged backend deploys.
- Verification results from Phases 2–5 (test counts, build, manual check outcomes).
- Convention note: new reward sources add a `SprinkleSource` value, a `SprinklePolicy` constant, and a widened `chk_pet_sprinkles_source` CHECK; never a variety-based source.
- Suggested commit subject: `MPP-25: Sprinkles — a consistency-only currency`

---

## Self-review

**Spec coverage:**
- Migration `pet_sprinkles` + backfill + railway row 7 (AC 1) — Tasks 1, 2.
- Entity/enum/repository, `findPlanMemberIds` — Tasks 3, 4.
- `MealTimesPolicy.byTime` — Task 5.
- `SprinklePolicy` named constants + pure rules (AC 2) — Task 6.
- `SprinkleService` earning + balance; re-tick (AC 3); two linked users (AC 5); full week to both — Task 7.
- `SprinkleRecorder` after-commit hook, failure isolation — Task 8.
- `PetDTO.sprinkles` via `PetPolicy`/`PetService` (AC 4 backend) — Task 9.
- `PetContext` `sprinkles` + `refreshPet`; refetch after tick — Tasks 10, 11.
- Room counter (AC 4 UI) — Task 12; manual check — Task 13.
- Version bump + CHANGELOG — Task M.1.
- "No rule rewards variety" (AC 5) — Task 7 test 14 + M.5 convention note.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N". Every step shows exact code or a `Run:` / `Expected:` pair; Task 7's tests are specified per case with inputs and verifications.

**Type / name consistency:** `pet_sprinkles` / `uk_pet_sprinkles` / `chk_pet_sprinkles_source`; `PetSprinkle`, `SprinkleSource {MEAL_EATEN, MEAL_ON_TIME, FULL_WEEK, HOMEMADE_EXTRA}`; `PetSprinkleRepository.existsByUserIdAndSourceTypeAndSourceId / sumAmountByUserId / insertIfAbsent(Long, String, Long, int)`; `UserRepository.findPlanMemberIds(Long)`; `MealTimesPolicy.byTime(User, String)`; `SprinklePolicy.MEAL_EATEN / ON_TIME_BONUS / FULL_WEEK / HOMEMADE_BONUS / WEEK_DAYS / isMainMeal / isPayable / isOnTime / mondaysCovering`; `SprinkleService.mealEaten / planned / balance`; `SprinkleRecorder.onCandidate`; `PetDTO.sprinkles` (long) → JSON `sprinkles` → `PetContext.sprinkles` / `refreshPet` → `PetRoom` prop `sprinkles` → `.pip-room-sprinkles`, `SPRINKLES_ICON`. Used identically in every task and in `plan.md` → Data shapes.

**Phase boundary cleanliness:**
- Phase 1: only a SQL file and a doc row; no Java maps the table, build untouched.
- Phase 2: new classes compile and their tests pass; no existing class changes behaviour except `MealTimesPolicy` (additive), and the pet payload is unchanged.
- Phase 3: `PetDTO` gains one field; all callers updated in the same task; pet tests green; extra JSON field is ignored by the old client.
- Phase 4: each task ends with `npm run build` green; the counter hides until a number arrives.
- Phase 5: bookkeeping and verification only.
