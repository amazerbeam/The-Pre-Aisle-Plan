# Tasks: Habit streaks backend — snack-free and alcohol-free check-ins

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-13

**Goal:** Durable, per-person snack-free and alcohol-free streaks on the server, with the catch-up, backdated-lapse and idempotency rules in one tested service behind `GET /api/pet/habits` and `POST /api/pet/habits/{habit}/answer`.

**Spec:** `plan.md` in this folder.

**Toolchain note:** `mvn` and `java` are not on PATH. Every PowerShell `Run:` that calls `mvn` must start with this prefix, in the same call:

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"; $env:PATH = "$env:JAVA_HOME\bin;C:\Users\jossd\tools\apache-maven-3.9.9\bin;$env:PATH";
```

The `Run:` lines below show only the part after the prefix.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-13-mpp20-pet-habit-streaks.sql` — `pet_habit_days` + `pet_habit_streaks`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/Habit.java` — `SNACK`, `ALCOHOL`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetHabitDay.java` — per-day log entity
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetHabitStreak.java` — summary entity
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetHabitDayRepository.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetHabitStreakRepository.java` — `ensureRow`, `findForUpdate`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/HabitStatusDTO.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/HabitAnswerRequest.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/HabitStreakPolicy.java` — zone + pure date rules
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/config/ClockConfig.java` — Europe/Dublin `Clock` bean
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/HabitStreakService.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetHabitController.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/HabitStreakPolicyTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/HabitStreakServiceTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetHabitControllerTest.java`
- `.claude/contract/MPP-20-habit-streaks-backend/pr-description.md`

**Modified:**
- `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` — append order 2
- `foodbytes-app/client/package.json` — `version` (MINOR)
- `foodbytes-app/foodbytes-api/pom.xml` — project `<version>` (MINOR)
- `CHANGELOG.md` — prepend one line

**Deleted:** (none)

---

## Phase 1 — Schema (local DB)

Write the migration, apply it to the local `foodbytes-db`, and record it in the epic's Railway checklist. No Java changes yet. The new tables are purely additive and unmapped, so the existing backend still validates and the build stays green.

### Task 1: Write the migration file ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-13-mpp20-pet-habit-streaks.sql`

- [x] **Step 1: Create the file with this exact content**

```sql
-- MPP-20: per-person habit streaks for Pip's daily check-in (snack-free, alcohol-free).
--
-- Adds two tables:
--   pet_habit_days    - one row per (user_id, habit, day) once that day has been answered for;
--                       clean = 1 for a clean day, 0 for the lapse day. MPP-31's rolling 30-day
--                       fitness score reads this log.
--   pet_habit_streaks - one summary row per (user_id, habit): streak_start (first day of the running
--                       streak; NULL until the first clean day), best (never lowered) and
--                       last_answered_date. The running streak length is derived from
--                       streak_start..last_answered_date, never stored.
--
-- habit is VARCHAR(16) + CHECK rather than a MySQL ENUM; the entity pins @JdbcTypeCode(VARCHAR).
-- Habits always belong to the caller, never to users.meal_plan_owner_id (per-person Pip, MPP-33).
--
-- Purely additive and lossless: no existing table, column or row changes. Local counts at planning
-- (2026-10-13): users 13 rows; no pet_habit_* table exists.
--
-- MPP-15 is local-first: applied to the local foodbytes-db now, listed in
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md, and MUST be applied to the Railway
-- MySQL BEFORE the merged backend deploys (spring.jpa.hibernate.ddl-auto = validate fails startup
-- otherwise). Safe to apply while the current backend runs.

CREATE TABLE IF NOT EXISTS pet_habit_days (
  id       BIGINT      NOT NULL AUTO_INCREMENT,
  user_id  BIGINT      NOT NULL,
  habit    VARCHAR(16) NOT NULL,
  day      DATE        NOT NULL,
  clean    BOOLEAN     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_habit_days_user_habit_day (user_id, habit, day),
  CONSTRAINT chk_pet_habit_days_habit CHECK (habit IN ('SNACK','ALCOHOL')),
  CONSTRAINT fk_pet_habit_days_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pet_habit_streaks (
  id                 BIGINT      NOT NULL AUTO_INCREMENT,
  user_id            BIGINT      NOT NULL,
  habit              VARCHAR(16) NOT NULL,
  streak_start       DATE        NULL,
  best               INT         NOT NULL DEFAULT 0,
  last_answered_date DATE        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_habit_streaks_user_habit (user_id, habit),
  CONSTRAINT chk_pet_habit_streaks_habit CHECK (habit IN ('SNACK','ALCOHOL')),
  CONSTRAINT fk_pet_habit_streaks_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

- [x] **Step 2: Confirm the file exists**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-10-13-mpp20-pet-habit-streaks.sql`
Expected: one file listed.

### Task 2: Apply the migration to the local foodbytes-db ✓

- Skill: none — DBA operation against the local Docker MySQL (local-first epic; Railway is not touched)

**Files:**
- (none — database state only)

- [x] **Step 1: Apply**

Run (Bash): `docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app/database/migrations/2026-10-13-mpp20-pet-habit-streaks.sql`
Expected: no output other than the password warning.

- [x] **Step 2: Verify structure and constraints inside a rolled-back transaction**

Run (Bash): `docker exec foodbytes-db mysql --force -uroot -prootpassword foodbytes -e "SHOW COLUMNS FROM pet_habit_days; SHOW COLUMNS FROM pet_habit_streaks; START TRANSACTION; SET @u := (SELECT MIN(id) FROM users); INSERT INTO pet_habit_days (user_id, habit, day, clean) VALUES (@u, 'SNACK', '2026-10-13', 1); INSERT INTO pet_habit_days (user_id, habit, day, clean) VALUES (@u, 'SNACK', '2026-10-13', 0); INSERT INTO pet_habit_days (user_id, habit, day, clean) VALUES (@u, 'CRISPS', '2026-10-13', 1); INSERT INTO pet_habit_streaks (user_id, habit, best) VALUES (@u, 'SNACK', 0) ON DUPLICATE KEY UPDATE id = id; INSERT INTO pet_habit_streaks (user_id, habit, best) VALUES (@u, 'SNACK', 0) ON DUPLICATE KEY UPDATE id = id; SELECT (SELECT COUNT(*) FROM pet_habit_days) AS days, (SELECT COUNT(*) FROM pet_habit_streaks) AS streaks; ROLLBACK; SELECT COUNT(*) AS after_rollback FROM pet_habit_days;"`
Expected:
- `pet_habit_days` columns `id bigint, user_id bigint, habit varchar(16), day date, clean tinyint(1)`.
- `pet_habit_streaks` columns `id, user_id, habit, streak_start date YES, best int NO default 0, last_answered_date date YES`.
- `ERROR 1062 … Duplicate entry` for the second day insert.
- `ERROR 3819 … Check constraint 'chk_pet_habit_days_habit' is violated` for `CRISPS`.
- `days 1, streaks 1` (the upsert stays one row), then `after_rollback 0`.

### Task 3: Record the migration in the epic's Railway checklist ✓

- Skill: none — release bookkeeping for the MPP-15 merge

**Files:**
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` (append one table row)

- [x] **Step 1: Append the row directly under the MPP-33 row**

```markdown
| 2 | MPP-20 | foodbytes-app/database/migrations/2026-10-13-mpp20-pet-habit-streaks.sql | 2026-10-13 | — |
```

- [x] **Step 2: Verify**

Run: `Select-String -Path .claude\contract\MPP-15-epic-breakdown\railway-migrations.md -Pattern "mpp20-pet-habit-streaks"`
Expected: exactly one hit.

---

## Phase 2 — Domain model

Add the enum, the two entities and their repositories. Nothing calls them yet, so the compile stays green. They map the tables Phase 1 created, so the local DB and the entities agree at the end of this phase.

### Task 4: Habit enum and PetHabitDay entity ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/Habit.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetHabitDay.java`

- [x] **Step 1: Create `Habit.java`**

```java
package com.foodbytes.model;

/**
 * MPP-20: the daily habits Pip checks in on. Stored by name in VARCHAR(16) columns guarded by a
 * CHECK constraint (see the 2026-10-13-mpp20 migration); adding a value needs a migration too.
 */
public enum Habit {
    SNACK,
    ALCOHOL
}
```

- [x] **Step 2: Create `PetHabitDay.java`**

```java
package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;

/**
 * MPP-20: one person's answer for one habit on one day. clean = true for a clean day, false for the
 * lapse day. Written only by HabitStreakService, one contiguous range per answer, so a day is never
 * written twice; the unique key is a backstop. MPP-31's 30-day score reads this log.
 * Plain id columns (no associations), as MealPlanEntryEaten.
 */
@Entity
@Table(name = "pet_habit_days", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_habit_days_user_habit_day", columnNames = {"user_id", "habit", "day"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetHabitDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // VARCHAR + CHECK in the DB; pin the JDBC type so validate never expects a MySQL ENUM
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "habit", nullable = false, length = 16)
    private Habit habit;

    @Column(name = "day", nullable = false)
    private LocalDate day;

    @Column(name = "clean", nullable = false)
    private Boolean clean;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetHabitDay other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetHabitDay.class.hashCode();
    }
}
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit code 0, no errors.

### Task 5: PetHabitStreak entity ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetHabitStreak.java`

- [x] **Step 1: Create the entity**

```java
package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;

/**
 * MPP-20: one person's running state for one habit. The current streak length is derived from
 * streakStart..lastAnsweredDate (HabitStreakPolicy#current), never stored. best is never lowered.
 * Created on the first answer (PetHabitStreakRepository#ensureRow); a missing row means "never
 * answered".
 */
@Entity
@Table(name = "pet_habit_streaks", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_habit_streaks_user_habit", columnNames = {"user_id", "habit"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetHabitStreak {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "habit", nullable = false, length = 16)
    private Habit habit;

    // First day of the running streak; null until the first clean day. After a lapse: lapse + 1.
    @Column(name = "streak_start")
    private LocalDate streakStart;

    @Column(name = "best", nullable = false)
    private Integer best;

    // Last Europe/Dublin day this habit was answered for; null until the first answer.
    @Column(name = "last_answered_date")
    private LocalDate lastAnsweredDate;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetHabitStreak other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetHabitStreak.class.hashCode();
    }
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit code 0, no errors.

### Task 6: PetHabitDayRepository ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetHabitDayRepository.java`

- [x] **Step 1: Create the repository**

```java
package com.foodbytes.repository;

import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/** MPP-20: per-person, per-day habit answers. Written by HabitStreakService; read by MPP-31. */
@Repository
public interface PetHabitDayRepository extends JpaRepository<PetHabitDay, Long> {

    List<PetHabitDay> findByUserIdAndHabitOrderByDayAsc(Long userId, Habit habit);
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit code 0, no errors.

### Task 7: PetHabitStreakRepository ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetHabitStreakRepository.java`

- [x] **Step 1: Create the repository**

```java
package com.foodbytes.repository;

import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitStreak;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/** MPP-20: one summary row per (user, habit). */
@Repository
public interface PetHabitStreakRepository extends JpaRepository<PetHabitStreak, Long> {

    /** Both habit rows for one user (0–2 rows). */
    List<PetHabitStreak> findByUserId(Long userId);

    /**
     * Creates the row on a person's first answer, or leaves an existing one untouched. Parallel
     * first answers converge on the unique key instead of failing.
     */
    @Modifying
    @Query(value = "INSERT INTO pet_habit_streaks (user_id, habit, best) VALUES (:userId, :habit, 0) " +
                   "ON DUPLICATE KEY UPDATE id = id",
           nativeQuery = true)
    void ensureRow(@Param("userId") Long userId, @Param("habit") String habit);

    /** SELECT … FOR UPDATE: serialises answers for the same person and habit. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM PetHabitStreak s WHERE s.userId = :userId AND s.habit = :habit")
    Optional<PetHabitStreak> findForUpdate(@Param("userId") Long userId, @Param("habit") Habit habit);
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit code 0, no errors.

---

## Phase 3 — Rules and service

DTOs, the pure date policy, the Dublin `Clock` bean and the transactional service, each with its tests. The controller doesn't exist yet, so nothing is reachable over HTTP. The phase ends with the new tests green.

### Task 8: HabitStatusDTO and HabitAnswerRequest ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/HabitStatusDTO.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/HabitAnswerRequest.java`

- [x] **Step 1: Create `HabitStatusDTO.java`**

```java
package com.foodbytes.dto;

import com.foodbytes.model.Habit;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/** MPP-20: one habit's check-in state for the caller. Built only by HabitStreakPolicy#toDTO. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HabitStatusDTO {
    private Habit habit;                // SNACK | ALCOHOL
    private int current;                // clean days in the running streak, through lastAnsweredDate
    private int best;                   // best-ever streak, never lowered
    private LocalDate lastAnsweredDate; // null until the first answer
    private boolean askToday;           // true when today hasn't been answered yet
    private LocalDate coversFrom;       // first day the next answer covers: lastAnsweredDate + 1, or today
}
```

- [x] **Step 2: Create `HabitAnswerRequest.java`**

```java
package com.foodbytes.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * MPP-20: an answer to Pip's check-in. clean = true credits every day since the last answer;
 * clean = false needs the lapse day. The coversFrom..today window is checked in the service,
 * which knows today and the last answer.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HabitAnswerRequest {

    @NotNull(message = "clean is required")
    private Boolean clean;

    private LocalDate lapseDate;

    @JsonIgnore
    @AssertTrue(message = "lapseDate is required when clean is false")
    public boolean isLapseDateGivenWhenLapsed() {
        return !Boolean.FALSE.equals(clean) || lapseDate != null;
    }
}
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit code 0, no errors.

### Task 9: HabitStreakPolicy (pure date rules) with tests ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/HabitStreakPolicy.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/HabitStreakPolicyTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitStreak;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** MPP-20: the date rules behind Pip's check-in, independent of storage. */
class HabitStreakPolicyTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 13);

    @Test
    void today_isTheDublinDate_evenWhenTheClockIsUtc() {
        // 23:30 UTC on 13 Oct is 00:30 IST on 14 Oct
        Clock utc = Clock.fixed(Instant.parse("2026-10-13T23:30:00Z"), ZoneOffset.UTC);
        assertThat(HabitStreakPolicy.today(utc)).isEqualTo(LocalDate.of(2026, 10, 14));
    }

    @Test
    void coversFrom_neverAnswered_isToday() {
        assertThat(HabitStreakPolicy.coversFrom(null, TODAY)).isEqualTo(TODAY);
    }

    @Test
    void coversFrom_isTheDayAfterTheLastAnswer() {
        assertThat(HabitStreakPolicy.coversFrom(LocalDate.of(2026, 10, 10), TODAY))
                .isEqualTo(LocalDate.of(2026, 10, 11));
    }

    @Test
    void current_countsBothEndsInclusive() {
        assertThat(HabitStreakPolicy.current(LocalDate.of(2026, 10, 9), TODAY)).isEqualTo(5);
        assertThat(HabitStreakPolicy.current(TODAY, TODAY)).isEqualTo(1);
    }

    @Test
    void current_isZero_whenNoStreakOrStartIsAfterLastAnswer() {
        assertThat(HabitStreakPolicy.current(null, TODAY)).isZero();
        assertThat(HabitStreakPolicy.current(TODAY, null)).isZero();
        assertThat(HabitStreakPolicy.current(TODAY.plusDays(1), TODAY)).isZero(); // lapse today
    }

    @Test
    void requireLapseInWindow_acceptsBothEnds() {
        LocalDate from = LocalDate.of(2026, 10, 11);
        assertThatCode(() -> HabitStreakPolicy.requireLapseInWindow(from, from, TODAY)).doesNotThrowAnyException();
        assertThatCode(() -> HabitStreakPolicy.requireLapseInWindow(TODAY, from, TODAY)).doesNotThrowAnyException();
    }

    @Test
    void requireLapseInWindow_rejectsOutsideTheWindow() {
        LocalDate from = LocalDate.of(2026, 10, 11);
        assertThatThrownBy(() -> HabitStreakPolicy.requireLapseInWindow(LocalDate.of(2026, 10, 10), from, TODAY))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("lapseDate must be between 2026-10-11 and 2026-10-13");
        assertThatThrownBy(() -> HabitStreakPolicy.requireLapseInWindow(TODAY.plusDays(1), from, TODAY))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void requireLapseInWindow_rejectsWhenTodayIsAlreadyAnswered() {
        assertThatThrownBy(() -> HabitStreakPolicy.requireLapseInWindow(TODAY, TODAY.plusDays(1), TODAY))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Already answered through 2026-10-13");
    }

    @Test
    void toDTO_noRow_isAFreshHabit() {
        HabitStatusDTO dto = HabitStreakPolicy.toDTO(Habit.SNACK, null, TODAY);

        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.SNACK, 0, 0, null, true, TODAY));
    }

    @Test
    void toDTO_answeredToday_doesNotAsk() {
        PetHabitStreak row = new PetHabitStreak(1L, 7L, Habit.ALCOHOL, LocalDate.of(2026, 10, 4), 12, TODAY);

        HabitStatusDTO dto = HabitStreakPolicy.toDTO(Habit.ALCOHOL, row, TODAY);

        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.ALCOHOL, 10, 12, TODAY, false, TODAY.plusDays(1)));
    }
}
```

- [x] **Step 2: Run it and see it fail to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HabitStreakPolicyTest`
Expected: `COMPILATION ERROR` — `cannot find symbol … HabitStreakPolicy`.

- [x] **Step 3: Implement `HabitStreakPolicy.java`**

```java
package com.foodbytes.service;

import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitStreak;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

/**
 * MPP-20: the single owner of the check-in date rules (the PetPolicy / MealTimesPolicy pattern).
 * Pure and static, so the rules are tested without storage; HabitStreakService applies them.
 *
 * "Today" is the Europe/Dublin date until a per-user zone exists. An answer covers every day from
 * coversFrom (the day after the last answer, or today for a first answer) up to today, so a
 * skipped day is never a lapse.
 */
public final class HabitStreakPolicy {

    public static final ZoneId ZONE = ZoneId.of("Europe/Dublin");

    private HabitStreakPolicy() {
    }

    public static LocalDate today(Clock clock) {
        return LocalDate.now(clock.withZone(ZONE));
    }

    /** First day the next answer covers: the day after the last answer, or today if never answered. */
    public static LocalDate coversFrom(LocalDate lastAnswered, LocalDate today) {
        return lastAnswered == null ? today : lastAnswered.plusDays(1);
    }

    /** Running streak length, both ends inclusive; 0 with no streak or right after a lapse today. */
    public static int current(LocalDate streakStart, LocalDate lastAnswered) {
        if (streakStart == null || lastAnswered == null || streakStart.isAfter(lastAnswered)) {
            return 0;
        }
        return (int) ChronoUnit.DAYS.between(streakStart, lastAnswered) + 1;
    }

    /** A lapse must fall in the days this answer covers: coversFrom ≤ lapse ≤ today. */
    public static void requireLapseInWindow(LocalDate lapse, LocalDate coversFrom, LocalDate today) {
        if (coversFrom.isAfter(today)) {
            throw new IllegalArgumentException("Already answered through " + today);
        }
        if (lapse.isBefore(coversFrom) || lapse.isAfter(today)) {
            throw new IllegalArgumentException("lapseDate must be between " + coversFrom + " and " + today);
        }
    }

    /** Status for one habit; row is null when the caller has never answered it. */
    public static HabitStatusDTO toDTO(Habit habit, PetHabitStreak row, LocalDate today) {
        if (row == null) {
            return new HabitStatusDTO(habit, 0, 0, null, true, today);
        }
        LocalDate last = row.getLastAnsweredDate();
        return new HabitStatusDTO(
                habit,
                current(row.getStreakStart(), last),
                row.getBest(),
                last,
                last == null || last.isBefore(today),
                coversFrom(last, today));
    }
}
```

- [x] **Step 4: Run the test green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HabitStreakPolicyTest`
Expected: `Tests run: 10, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

### Task 10: ClockConfig — Europe/Dublin Clock bean ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/config/ClockConfig.java`

- [x] **Step 1: Create the config**

```java
package com.foodbytes.config;

import com.foodbytes.service.HabitStreakPolicy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

/**
 * MPP-20: an injectable clock so "today" can be pinned in tests. Zoned to Europe/Dublin
 * (HabitStreakPolicy.ZONE) until a per-user zone exists.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.system(HabitStreakPolicy.ZONE);
    }
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit code 0, no errors.

### Task 11: HabitStreakService with tests (TDD) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/HabitStreakService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/HabitStreakServiceTest.java`

- [x] **Step 1: Write the failing test**

Today is fixed at Tuesday 2026-10-13 (Dublin).

```java
package com.foodbytes.service;

import com.foodbytes.dto.HabitAnswerRequest;
import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitDay;
import com.foodbytes.model.PetHabitStreak;
import com.foodbytes.repository.PetHabitDayRepository;
import com.foodbytes.repository.PetHabitStreakRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * MPP-20 AC 5: clean, skip-then-clean, lapse today, backdated lapse and repeat answers. Habits are
 * keyed by the caller's own id; there is no meal-plan-owner lookup to make.
 */
@ExtendWith(MockitoExtension.class)
class HabitStreakServiceTest {

    private static final Long USER_ID = 2L;
    private static final LocalDate TODAY = LocalDate.of(2026, 10, 13);
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-10-13T12:00:00Z"), HabitStreakPolicy.ZONE);

    @Mock private PetHabitStreakRepository streakRepository;
    @Mock private PetHabitDayRepository dayRepository;
    @Captor private ArgumentCaptor<List<PetHabitDay>> daysCaptor;

    private HabitStreakService service;

    @BeforeEach
    void setUp() {
        service = new HabitStreakService(streakRepository, dayRepository, CLOCK);
    }

    private static LocalDate d(int dayOfOctober) {
        return LocalDate.of(2026, 10, dayOfOctober);
    }

    /** The row findForUpdate hands back after ensureRow. */
    private PetHabitStreak stubRow(LocalDate streakStart, int best, LocalDate lastAnswered) {
        PetHabitStreak row = new PetHabitStreak(10L, USER_ID, Habit.SNACK, streakStart, best, lastAnswered);
        when(streakRepository.findForUpdate(USER_ID, Habit.SNACK)).thenReturn(Optional.of(row));
        return row;
    }

    private List<PetHabitDay> savedDays() {
        verify(dayRepository).saveAll(daysCaptor.capture());
        return daysCaptor.getValue();
    }

    private static HabitAnswerRequest clean() {
        return new HabitAnswerRequest(true, null);
    }

    private static HabitAnswerRequest lapse(LocalDate on) {
        return new HabitAnswerRequest(false, on);
    }

    @Test
    void clean_firstEverAnswer_creditsTodayOnly() {
        PetHabitStreak row = stubRow(null, 0, null);

        HabitStatusDTO dto = service.answer(USER_ID, Habit.SNACK, clean());

        verify(streakRepository).ensureRow(USER_ID, "SNACK");
        assertThat(savedDays()).extracting(PetHabitDay::getUserId, PetHabitDay::getHabit, PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(USER_ID, Habit.SNACK, TODAY, true));
        assertThat(row.getStreakStart()).isEqualTo(TODAY);
        assertThat(row.getLastAnsweredDate()).isEqualTo(TODAY);
        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.SNACK, 1, 1, TODAY, false, TODAY.plusDays(1)));
        verify(streakRepository).save(row);
    }

    @Test
    void clean_afterSkippedDays_creditsEveryDaySinceTheLastAnswer() {
        // 5-day streak 6–10 Oct, then "Not now" on 11 and 12
        PetHabitStreak row = stubRow(d(6), 5, d(10));

        HabitStatusDTO dto = service.answer(USER_ID, Habit.SNACK, clean());

        assertThat(savedDays()).extracting(PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(d(11), true), tuple(d(12), true), tuple(d(13), true));
        assertThat(row.getStreakStart()).isEqualTo(d(6));
        assertThat(dto.getCurrent()).isEqualTo(8);
        assertThat(dto.getBest()).isEqualTo(8);
    }

    @Test
    void lapseToday_restartsAtZero_andKeepsBest() {
        // 10-day streak 3–12 Oct, best 12 from an earlier run
        PetHabitStreak row = stubRow(d(3), 12, d(12));

        HabitStatusDTO dto = service.answer(USER_ID, Habit.SNACK, lapse(TODAY));

        assertThat(savedDays()).extracting(PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(d(13), false));
        assertThat(row.getStreakStart()).isEqualTo(d(14));
        assertThat(dto.getCurrent()).isZero();
        assertThat(dto.getBest()).isEqualTo(12);
        assertThat(dto.isAskToday()).isFalse();
    }

    @Test
    void backdatedLapse_creditsCleanDaysBeforeAndAfter_andRaisesBestWithTheDaysBefore() {
        // 9-day streak 1–9 Oct (best 9); skipped 10–12; today: "yes, on the 11th"
        PetHabitStreak row = stubRow(d(1), 9, d(9));

        HabitStatusDTO dto = service.answer(USER_ID, Habit.SNACK, lapse(d(11)));

        assertThat(savedDays()).extracting(PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(d(10), true), tuple(d(11), false), tuple(d(12), true), tuple(d(13), true));
        assertThat(row.getStreakStart()).isEqualTo(d(12));
        assertThat(dto.getCurrent()).isEqualTo(2);
        assertThat(dto.getBest()).isEqualTo(10); // 1–10 Oct reached 10 before the lapse
    }

    @Test
    void clean_answeredTwiceToday_isANoOp() {
        PetHabitStreak row = stubRow(d(9), 5, TODAY);

        HabitStatusDTO dto = service.answer(USER_ID, Habit.SNACK, clean());

        verify(dayRepository, never()).saveAll(any());
        verify(streakRepository, never()).save(any());
        assertThat(row.getStreakStart()).isEqualTo(d(9));
        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.SNACK, 5, 5, TODAY, false, TODAY.plusDays(1)));
    }

    @Test
    void lapse_afterAnsweringToday_isRejected() {
        stubRow(d(9), 5, TODAY);

        assertThatThrownBy(() -> service.answer(USER_ID, Habit.SNACK, lapse(TODAY)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Already answered through 2026-10-13");
        verify(dayRepository, never()).saveAll(any());
    }

    @Test
    void lapse_beforeCoversFrom_isRejected() {
        stubRow(d(1), 10, d(10));

        assertThatThrownBy(() -> service.answer(USER_ID, Habit.SNACK, lapse(d(10))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("lapseDate must be between 2026-10-11 and 2026-10-13");
        verify(dayRepository, never()).saveAll(any());
    }

    @Test
    void lapse_inTheFuture_isRejected() {
        stubRow(d(1), 10, d(10));

        assertThatThrownBy(() -> service.answer(USER_ID, Habit.SNACK, lapse(d(14))))
                .isInstanceOf(IllegalArgumentException.class);
        verify(dayRepository, never()).saveAll(any());
    }

    @Test
    void getHabits_neverAnswered_returnsBothHabitsFresh_withoutWriting() {
        when(streakRepository.findByUserId(USER_ID)).thenReturn(List.of());

        List<HabitStatusDTO> habits = service.getHabits(USER_ID);

        assertThat(habits).containsExactly(
                new HabitStatusDTO(Habit.SNACK, 0, 0, null, true, TODAY),
                new HabitStatusDTO(Habit.ALCOHOL, 0, 0, null, true, TODAY));
        verify(streakRepository, never()).ensureRow(any(), any());
    }

    @Test
    void getHabits_reportsEachHabitFromItsOwnRow() {
        when(streakRepository.findByUserId(USER_ID)).thenReturn(List.of(
                new PetHabitStreak(11L, USER_ID, Habit.ALCOHOL, d(1), 20, TODAY),
                new PetHabitStreak(10L, USER_ID, Habit.SNACK, d(9), 4, d(12))));

        List<HabitStatusDTO> habits = service.getHabits(USER_ID);

        // Order follows Habit.values(), not row order; best is the stored value, not recomputed
        assertThat(habits).containsExactly(
                new HabitStatusDTO(Habit.SNACK, 4, 4, d(12), true, TODAY),
                new HabitStatusDTO(Habit.ALCOHOL, 13, 20, TODAY, false, TODAY.plusDays(1)));
    }
}
```

- [x] **Step 2: Run it and see it fail to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HabitStreakServiceTest`
Expected: `COMPILATION ERROR` — `cannot find symbol … HabitStreakService`.

- [x] **Step 3: Implement `HabitStreakService.java`**

```java
package com.foodbytes.service;

import com.foodbytes.dto.HabitAnswerRequest;
import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitDay;
import com.foodbytes.model.PetHabitStreak;
import com.foodbytes.repository.PetHabitDayRepository;
import com.foodbytes.repository.PetHabitStreakRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * MPP-20: the caller's own snack-free / alcohol-free streaks. Always keyed by the caller's id —
 * never users.meal_plan_owner_id (per-person Pip, MPP-33). Date rules live in HabitStreakPolicy.
 *
 * Every answer logs exactly coversFrom..today and then moves last_answered_date to today, so the
 * logged ranges never overlap and a repeat clean answer has nothing left to credit.
 */
@Service
@RequiredArgsConstructor
public class HabitStreakService {

    private final PetHabitStreakRepository streakRepository;
    private final PetHabitDayRepository dayRepository;
    private final Clock clock;

    /** Both habits, SNACK then ALCOHOL. Never writes: a missing row reads as "never answered". */
    @Transactional(readOnly = true)
    public List<HabitStatusDTO> getHabits(Long userId) {
        LocalDate today = HabitStreakPolicy.today(clock);
        Map<Habit, PetHabitStreak> rows = streakRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(PetHabitStreak::getHabit, Function.identity()));
        return Arrays.stream(Habit.values())
                .map(habit -> HabitStreakPolicy.toDTO(habit, rows.get(habit), today))
                .toList();
    }

    /**
     * clean = true credits every day from coversFrom to today (idempotent once today is answered).
     * clean = false logs the lapse day as not clean, credits the days either side of it, restarts
     * the streak the day after the lapse and keeps best.
     *
     * @throws IllegalArgumentException when a lapse falls outside coversFrom..today
     */
    @Transactional
    public HabitStatusDTO answer(Long userId, Habit habit, HabitAnswerRequest request) {
        LocalDate today = HabitStreakPolicy.today(clock);
        streakRepository.ensureRow(userId, habit.name());
        PetHabitStreak row = streakRepository.findForUpdate(userId, habit)
                .orElseThrow(() -> new IllegalStateException("Habit row missing after ensureRow: " + habit));
        LocalDate from = HabitStreakPolicy.coversFrom(row.getLastAnsweredDate(), today);

        if (Boolean.TRUE.equals(request.getClean())) {
            if (from.isAfter(today)) {
                return HabitStreakPolicy.toDTO(habit, row, today);
            }
            logDays(userId, habit, from, today, null);
            if (row.getStreakStart() == null) {
                row.setStreakStart(from);
            }
        } else {
            LocalDate lapse = request.getLapseDate();
            HabitStreakPolicy.requireLapseInWindow(lapse, from, today);
            logDays(userId, habit, from, today, lapse);
            // Clean days before the lapse still extend the old run, so they can still raise best
            LocalDate runStart = row.getStreakStart() != null ? row.getStreakStart() : from;
            raiseBest(row, HabitStreakPolicy.current(runStart, lapse.minusDays(1)));
            row.setStreakStart(lapse.plusDays(1));
        }

        row.setLastAnsweredDate(today);
        raiseBest(row, HabitStreakPolicy.current(row.getStreakStart(), today));
        streakRepository.save(row);
        return HabitStreakPolicy.toDTO(habit, row, today);
    }

    /** One row per day in from..today; only the lapse day (if any) is not clean. */
    private void logDays(Long userId, Habit habit, LocalDate from, LocalDate today, LocalDate lapse) {
        List<PetHabitDay> days = new ArrayList<>();
        for (LocalDate day = from; !day.isAfter(today); day = day.plusDays(1)) {
            days.add(new PetHabitDay(null, userId, habit, day, !day.equals(lapse)));
        }
        dayRepository.saveAll(days);
    }

    private static void raiseBest(PetHabitStreak row, int streak) {
        row.setBest(Math.max(row.getBest(), streak));
    }
}
```

- [x] **Step 4: Run the test green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HabitStreakServiceTest+HabitStreakPolicyTest`
Expected: `Tests run: 20, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

---

## Phase 4 — HTTP surface and runtime proof

Expose the service through a thin controller with its own tests, then boot the real backend against the local DB. That boot proves Hibernate `validate` accepts the new tables, which no unit test covers. At the end of this phase the slice is reachable and the app starts.

### Task 12: PetHabitController with tests ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetHabitController.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetHabitControllerTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.controller;

import com.foodbytes.service.HabitStreakService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MPP-20: request validation, unknown habits and the no-principal path never reach the service. */
@WebMvcTest(PetHabitController.class)
@AutoConfigureMockMvc(addFilters = false)
class PetHabitControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private HabitStreakService habitStreakService;

    @Test
    void getHabits_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(get("/api/pet/habits"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        verifyNoInteractions(habitStreakService);
    }

    @Test
    void answer_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(post("/api/pet/habits/SNACK/answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clean\":true}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(habitStreakService);
    }

    @Test
    void answer_unknownHabit_returns400() throws Exception {
        mockMvc.perform(post("/api/pet/habits/CRISPS/answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clean\":true}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Unknown habit: CRISPS"));
        verifyNoInteractions(habitStreakService);
    }

    @Test
    void answer_missingClean_returns400() throws Exception {
        mockMvc.perform(post("/api/pet/habits/SNACK/answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("clean is required"));
        verifyNoInteractions(habitStreakService);
    }

    @Test
    void answer_lapseWithoutDate_returns400() throws Exception {
        mockMvc.perform(post("/api/pet/habits/ALCOHOL/answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clean\":false}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("lapseDate is required when clean is false"));
        verifyNoInteractions(habitStreakService);
    }
}
```

- [x] **Step 2: Run it and see it fail to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetHabitControllerTest`
Expected: `COMPILATION ERROR` — `cannot find symbol … PetHabitController`.

- [x] **Step 3: Implement `PetHabitController.java`**

```java
package com.foodbytes.controller;

import com.foodbytes.dto.HabitAnswerRequest;
import com.foodbytes.model.Habit;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.HabitStreakService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import java.util.Map;

/**
 * MPP-20: the caller's own snack-free / alcohol-free check-in streaks (see HabitStreakService).
 * Read by Pip's speech bubble (MPP-21).
 */
@RestController
@RequestMapping("/api/pet/habits")
@RequiredArgsConstructor
public class PetHabitController {

    private final HabitStreakService habitStreakService;

    @GetMapping
    public ResponseEntity<?> getHabits(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(habitStreakService.getHabits(userPrincipal.getId()));
    }

    @PostMapping("/{habit}/answer")
    public ResponseEntity<?> answer(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Habit habit,
            @Valid @RequestBody HabitAnswerRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        try {
            return ResponseEntity.ok(habitStreakService.answer(userPrincipal.getId(), habit, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** No @ControllerAdvice in this codebase — same {error} shape as PetController. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    /** {habit} must be SNACK or ALCOHOL. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<?> handleUnknownHabit(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", "Unknown habit: " + ex.getValue()));
    }
}
```

- [x] **Step 4: Run the test green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetHabitControllerTest`
Expected: `Tests run: 5, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

### Task 13: Boot the backend against the local DB (validate check) ✓

- Skill: java-backend

**Files:**
- (none — runtime check only)

- [x] **Step 1: Start the backend on a spare port in the background**

Run (PowerShell, `run_in_background`): `cd foodbytes-app\foodbytes-api; mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8099" *> "$env:TEMP\mpp20-boot.log"`
(The application.yml defaults point at the local `foodbytes-db`; Docker Desktop must be running.)

- [x] **Step 2: Wait for startup, then read the outcome**

Run: `Select-String -Path "$env:TEMP\mpp20-boot.log" -Pattern "Started FoodBytesApplication|Schema-validation|APPLICATION FAILED TO START"`
Expected: a `Started FoodBytesApplication in … seconds` line, and no `Schema-validation` or `APPLICATION FAILED TO START` line. (Poll until one of the patterns appears.) If `Schema-validation: wrong column type encountered in column [habit]` appears, apply the fallback in `plan.md` → Risks: map `habit` as a plain `String` field and validate it against `Habit` in `HabitStreakPolicy`, then re-run Tasks 9, 11 and 12.

- [x] **Step 3: Confirm the route is wired and secured**

Run: `curl.exe -s -o NUL -w "%{http_code}" http://localhost:8099/api/pet/habits`
Expected: `401` (SecurityConfig's entry point; a 404 would mean the controller is not mapped).

- [x] **Step 4: Stop the backend**

Run: `Get-NetTCPConnection -LocalPort 8099 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`
Expected: no output; `Get-NetTCPConnection -LocalPort 8099 -State Listen -ErrorAction SilentlyContinue` then returns nothing.

---

## Phase 5 — Final verification

No production changes beyond the version bump — only sanity-checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-20 is a Jira **Task**, so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-20: Habit streaks backend — per-person snack-free and alcohol-free check-ins (GET /api/pet/habits, POST /api/pet/habits/{habit}/answer)`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for owner resolution in the habit code ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Confirm the habit code never resolves the meal-plan owner**

Run: `Get-ChildItem -Path foodbytes-app\foodbytes-api\src\main -Recurse -Include *Habit*.java | Select-String -Pattern "mealPlanOwnerId|MealPlanOwner|UserRepository|resolveOwner"`
Expected: zero hits.

### Task M.3: Run the full backend test suite ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors. The test count rises by 25 (10 policy + 10 service + 5 controller) over the pre-change baseline.

### Task M.4: Production build ✓

- Skill: none — verification only (no client source changed; confirms the version bump didn't break the build)

**Files:**
- (none)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task M.5: Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-20-habit-streaks-backend/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary: two tables, the `Habit` enum, policy + service + controller. Rules: catch-up credit, backdated lapse that keeps `best`, idempotent repeat clean answers, 400 on a lapse once today is answered. Plus the new version from Task M.1.
- Migration: `2026-10-13-mpp20-pet-habit-streaks.sql` is applied locally only. It is listed as order 2 in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` and must be applied to Railway **before** the merged backend deploys.
- Verification results: Tasks 2, 9, 11, 12, 13, M.3 and M.4.
- Convention note: the first `@Enumerated` in the codebase. Enum columns are `VARCHAR + CHECK` with `@JdbcTypeCode(SqlTypes.VARCHAR)`, and "today" comes from the injectable Europe/Dublin `Clock` bean (`ClockConfig`).
- Suggested commit subject: `MPP-20: habit streaks backend (snack-free / alcohol-free check-ins)`.

---

## Self-review

**Spec coverage:**
- Migration with per-day log + summary row, applied locally, recorded for Railway (AC 1) — Tasks 1, 2, 3.
- `Habit` enum, entities, repositories — Tasks 4, 5, 6, 7.
- `GET /api/pet/habits` fields `current, best, lastAnsweredDate, askToday, coversFrom` (AC 2) — Tasks 8, 9, 11, 12.
- `POST …/answer` clean catch-up and validated backdated lapse keeping `best` (AC 3) — Tasks 9, 11, 12.
- Idempotent repeat answer (AC 4) — Task 11 (`clean_answeredTwiceToday_isANoOp`).
- Service tests for clean, skip-then-clean, lapse today, backdated lapse and repeats, with `mvn test` green (AC 5) — Tasks 11, M.3.
- Europe/Dublin "today" — Tasks 9 (`today_isTheDublinDate_evenWhenTheClockIsUtc`), 10.
- Per-person, never the owner — Task 11 (service keyed by caller id, no `UserRepository`), Task M.2.
- `ddl-auto: validate` passes — Task 13.
- Version bump — Task M.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command.

**Type / name consistency:**
- Tables and keys: `pet_habit_days` / `pet_habit_streaks`, `uk_pet_habit_days_user_habit_day` / `uk_pet_habit_streaks_user_habit`.
- Entity fields: `streakStart` / `best` / `lastAnsweredDate` / `day` / `clean`.
- Repository methods: `ensureRow(Long, String)`, `findForUpdate(Long, Habit)`, `findByUserId`, `findByUserIdAndHabitOrderByDayAsc`.
- Policy: `today`, `coversFrom`, `current`, `requireLapseInWindow`, `toDTO`, `ZONE`.
- Service: `getHabits(Long)`, `answer(Long, Habit, HabitAnswerRequest)`.
- DTO field order: `HabitStatusDTO(habit, current, best, lastAnsweredDate, askToday, coversFrom)`, matching every `new HabitStatusDTO(...)` in the tests.
- `PetHabitStreak(id, userId, habit, streakStart, best, lastAnsweredDate)` and `PetHabitDay(id, userId, habit, day, clean)` constructor order match the field declaration order used in the tests and the service.
- Error strings match between policy, controller and tests: "Already answered through …", "lapseDate must be between … and …", "clean is required", "lapseDate is required when clean is false", "Unknown habit: …", "Not authenticated".

**Phase boundary cleanliness:**
- Phase 1 — additive tables nothing maps yet; the backend is unchanged and still validates.
- Phase 2 — new entities map the tables Phase 1 created; compile green, nothing calls them.
- Phase 3 — policy, clock and service compile and their 20 tests pass; nothing is exposed over HTTP yet.
- Phase 4 — controller tests pass, and the app boots against the local DB with the new mappings.
- Phase 5 — version bump plus checks only.
