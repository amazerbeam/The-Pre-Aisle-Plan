# Tasks: Pip evolves — five herb forms, a +3/−3 daily score and a level bar

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-14

**Goal:** Score each person's finished days +3 / −3 / 0 from their own ticks and check-ins, replay them into a floored running total that picks one of five herb forms (Basilisk permanent via `users.pet_fully_grown_at`), return it as `growth` on `GET /api/pet`, and replace Mochi with the herb everywhere — with a level bar, a wilted look and once-per-visit evolve / de-evolve animations.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-14-mpp31-user-pet-fully-grown-at.sql` — adds `users.pet_fully_grown_at`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetGrowthDTO.java` — the `growth` block
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetGrowthPolicy.java` — pure scoring / replay / form rules
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetGrowthService.java` — reads logs, replays, records `fullyGrownAt`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetGrowthPolicyTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetGrowthServiceTest.java`
- `foodbytes-app/client/src/components/pet/herb/herbForms.js` — five forms' geometry, anchors, mini crops
- `foodbytes-app/client/src/components/pet/herb/herbFaces.jsx` — shared face + Basilisk face
- `foodbytes-app/client/src/components/pet/herb/herbParts.jsx` — leaf, vein, vine, bloom, back, growth, mood props
- `foodbytes-app/client/src/components/pet/herb/PipHerbFigure.jsx` — one form as an SVG `<g>`
- `foodbytes-app/client/src/components/pet/herb/PipHerb.jsx` — `<svg>` wrapper, `full` / `mini`
- `foodbytes-app/client/src/components/pet/herb/PipHerb.css` — mood, wilt, evolve, shrink animations
- `foodbytes-app/client/src/constants/pipGrowth.js` — form names, phases, timings, copy, storage key
- `foodbytes-app/client/src/utils/pipGrowth.js` — pure growth helpers (label, pct, change, schedule, view, bubble)
- `foodbytes-app/client/src/utils/pipGrowth.check.mjs` — node assertions for the helpers
- `foodbytes-app/client/src/utils/pipGrowthSeenStore.js` — per-user last-seen growth marker
- `foodbytes-app/client/src/hooks/usePipGrowth.js` — since-last-visit sequence
- `foodbytes-app/client/src/components/pet/room/PipLevelBar.jsx` + `PipLevelBar.css` — the green bar

**Modified:**
- `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` — row 5
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/User.java` — `petFullyGrownAt`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/UserRepository.java` — `markPetFullyGrown`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetHabitDayRepository.java` — `findByUserIdAndDayBeforeOrderByDayAsc`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetDTO.java` — `growth`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetPolicy.java` — `toDTO(User, PetGrowthDTO)`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetService.java` — growth on get + rename
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java` — mock growth service, assert growth present
- `foodbytes-app/client/src/constants/petRoom.js` — `ROOM_INK`
- `foodbytes-app/client/src/components/pet/room/{awardArt,furniture,isoShapes,roomEffects}.jsx` — `ROOM_INK` import
- `foodbytes-app/client/src/components/pet/room/RoomPip.jsx` — draws `PipHerbFigure`
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` — `herb` + `levelBar` props
- `foodbytes-app/client/src/components/pet/PetView.jsx` — `usePipGrowth`, bubble priority
- `foodbytes-app/client/src/components/pet/PetReaction.jsx` + `PetReaction.css` — `PipHerb`
- `foodbytes-app/client/src/components/layout/Footer.jsx` + `Footer.css` — `PipHerb`
- `foodbytes-app/client/src/contexts/PetContext.jsx` — exposes `growth`
- `foodbytes-app/client/src/services/petService.js` — JSDoc for `growth`
- `foodbytes-app/client/package.json` — `check:growth` script, version
- `foodbytes-app/foodbytes-api/pom.xml` — version
- `CHANGELOG.md`

**Deleted:**
- `foodbytes-app/client/src/components/pet/MochiPet.jsx`
- `foodbytes-app/client/src/components/pet/MochiPet.css`
- `foodbytes-app/client/src/components/pet/mochiParts.jsx`

---

## Phase 1 — Schema: `users.pet_fully_grown_at`

Adds the nullable column and maps it. Ends with the migration applied to the local `foodbytes-db` and the backend compiling against it; nothing reads the field yet, so the app behaves exactly as before.

### Task 1: Write the migration and record it for Railway ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-14-mpp31-user-pet-fully-grown-at.sql`
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`

- [x] **Step 1: Write the migration file**

```sql
-- MPP-31: Pip evolves. Records when a user's Pip first reached Basilisk (90 points) so the form
-- stays Basilisk forever, even if later slips or backdated check-in answers lower the replayed
-- total (AC 3).
--
-- Lossless: adds one NULLable column with no default value to fill. No backfill is needed —
-- checked 2026-10-14 on the local foodbytes-db: pet_habit_days holds 2 rows (1 user, both
-- 2026-10-14), so no user can be near 90 points.
--
-- Hibernate runs ddl-auto: validate. Apply this to the database BEFORE the backend that maps
-- User.petFullyGrownAt starts: local foodbytes-db now, Railway at MPP-15 epic merge
-- (.claude/contract/MPP-15-epic-breakdown/railway-migrations.md, row 5).

ALTER TABLE users
  ADD COLUMN pet_fully_grown_at TIMESTAMP NULL DEFAULT NULL AFTER pet_name;
```

- [x] **Step 2: Add row 5 to the epic's Railway batch**

Append to the table in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`:

```markdown
| 5 | MPP-31 | foodbytes-app/database/migrations/2026-10-14-mpp31-user-pet-fully-grown-at.sql | — | — |
```

(The executor fills "Applied locally" with the date once Task 2 is confirmed.)

- [x] **Step 3: Confirm the file exists**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-10-14-mpp31-user-pet-fully-grown-at.sql`
Expected: one file listed.

### Task 2: Developer applies the migration to the local `foodbytes-db` ✓

- Skill: none — DBA operation against the local Docker MySQL, owned by the developer

**Files:**
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` (row 5 "Applied locally" date)

- [x] **Step 1: Developer runs the migration (Docker Desktop must be running)**

Run (developer, from the repo root, Git Bash or cmd): `docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app/database/migrations/2026-10-14-mpp31-user-pet-fully-grown-at.sql`
Expected: no output, exit code 0.

- [x] **Step 2: Verify the column, read-only**

Run: `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SHOW COLUMNS FROM users LIKE 'pet_fully_grown_at'"`
Expected: `pet_fully_grown_at	timestamp	YES		NULL`

- [x] **Step 3: Record the local apply date**

In row 5 of `railway-migrations.md`, set "Applied locally" to today's date. Leave "Applied to Railway" as `—`.

### Task 3: Map the column on `User` and add the conditional update ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/User.java:70-71`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/UserRepository.java`

- [x] **Step 1: Add the field directly after `petName`**

```java
    /**
     * MPP-31: when this user's Pip first reached Basilisk (90 points). NULL = not yet. Set once by
     * UserRepository#markPetFullyGrown and never cleared, so Basilisk is permanent (AC 3).
     */
    @Column(name = "pet_fully_grown_at")
    private LocalDateTime petFullyGrownAt;
```

(`LocalDateTime` is already imported for `createdAt`.)

- [x] **Step 2: Add the repository method**

Add the imports `org.springframework.data.jpa.repository.Modifying`, `org.springframework.data.jpa.repository.Query`, `org.springframework.data.repository.query.Param` and `java.time.LocalDateTime` if missing, then:

```java
    /**
     * MPP-31: records the moment Pip first reached Basilisk. Conditional on the column still being
     * NULL, so concurrent reads that both see 90 points converge on the first timestamp.
     * Returns the number of rows changed (0 when already set).
     */
    @Modifying
    @Query("UPDATE User u SET u.petFullyGrownAt = :at WHERE u.id = :userId AND u.petFullyGrownAt IS NULL")
    int markPetFullyGrown(@Param("userId") Long userId, @Param("at") LocalDateTime at);
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, 0 errors (quiet mode prints nothing on success).

---

## Phase 2 — Backend growth rules and API

Introduces the pure policy (test-first), the service that feeds it, and the `growth` block on `PetDTO`. Ends with `GET /api/pet` and `PUT /api/pet/name` returning growth, and all new and existing pet tests green; the frontend ignores the extra field until Phase 4.

### Task 4: Create `PetGrowthDTO` ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetGrowthDTO.java`

- [x] **Step 1: Write the DTO**

```java
package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * MPP-31: the caller's own Pip growth (AC 4). Rules live in PetGrowthPolicy. barCurrent and
 * barSize are null at Basilisk, which has no bar.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetGrowthDTO {
    private int points;               // floored running total, never below 0
    private int form;                 // 1 Basil seed … 5 Basilisk; 5 whenever fullyGrown
    private Integer barCurrent;       // points - threshold(form); null at Basilisk
    private Integer barSize;          // threshold(form + 1) - threshold(form); null at Basilisk
    private boolean fullyGrown;       // Basilisk reached, permanently
    private int lastDayScore;         // most recent non-zero day score (3 or -3), 0 if none yet
    private LocalDate lastScoredDate; // date of that day, null if none yet
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 5: `PetGrowthPolicy` — scoring, floored replay, forms (test-first) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetGrowthPolicy.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetGrowthPolicyTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.service.PetGrowthPolicy.Replay;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.LocalDate;
import java.util.SortedMap;
import java.util.TreeMap;

import static org.assertj.core.api.Assertions.assertThat;

/** MPP-31 AC 1–4: day scores, the floored running total, thresholds both ways and the bar. */
class PetGrowthPolicyTest {

    private static final LocalDate START = LocalDate.of(2026, 10, 1);

    /** Scores applied to consecutive days from START. */
    private static SortedMap<LocalDate, Integer> days(int... scores) {
        SortedMap<LocalDate, Integer> map = new TreeMap<>();
        for (int i = 0; i < scores.length; i++) {
            map.put(START.plusDays(i), scores[i]);
        }
        return map;
    }

    private static int[] repeat(int score, int times) {
        int[] out = new int[times];
        java.util.Arrays.fill(out, score);
        return out;
    }

    // ---- AC 1: day score ----

    @Test
    void perfectDay_allTickedAndBothClean_isPlusThree() {
        assertThat(PetGrowthPolicy.dayScore(3, 3, true, true, false)).isEqualTo(3);
    }

    @Test
    void anyLapse_isMinusThree_evenWithEveryMealTickedOrTheOtherHabitUnanswered() {
        assertThat(PetGrowthPolicy.dayScore(3, 3, false, true, false)).isEqualTo(-3);
        assertThat(PetGrowthPolicy.dayScore(3, 3, true, false, false)).isEqualTo(-3);
        assertThat(PetGrowthPolicy.dayScore(3, 3, false, null, false)).isEqualTo(-3);
    }

    @Test
    void slipsDoNotStack_snackAlcoholAndUntickedMeal_isStillMinusThree() {
        assertThat(PetGrowthPolicy.dayScore(3, 0, false, false, false)).isEqualTo(-3);
    }

    @Test
    void untickedPlannedMeal_withCleanCheckIn_isMinusThree() {
        assertThat(PetGrowthPolicy.dayScore(3, 2, true, true, false)).isEqualTo(-3);
    }

    @Test
    void unscoredDays_today_unansweredCheckIn_nothingPlannedAndClean_areZero() {
        assertThat(PetGrowthPolicy.dayScore(3, 3, true, true, true)).isZero();     // today
        assertThat(PetGrowthPolicy.dayScore(3, 0, null, true, false)).isZero();    // snack unanswered
        assertThat(PetGrowthPolicy.dayScore(3, 0, true, null, false)).isZero();    // alcohol unanswered
        assertThat(PetGrowthPolicy.dayScore(0, 0, true, true, false)).isZero();    // nothing planned, clean
    }

    @Test
    void nothingPlanned_withASnackOrAlcohol_isMinusThree() {
        assertThat(PetGrowthPolicy.dayScore(0, 0, false, true, false)).isEqualTo(-3);
    }

    // ---- AC 2: thresholds ----

    @ParameterizedTest
    @CsvSource({"0,1", "14,1", "15,2", "35,2", "36,3", "59,3", "60,4", "89,4", "90,5", "120,5"})
    void formFor_eachThresholdBoundary(int points, int form) {
        assertThat(PetGrowthPolicy.formFor(points)).isEqualTo(form);
    }

    // ---- AC 2 / AC 3: floored replay, both directions ----

    @Test
    void floorAtZero_slipsOnAnEmptyBarAreNotBanked() {
        Replay replay = PetGrowthPolicy.replay(days(-3, -3, 3));
        assertThat(replay.points()).isEqualTo(3);
    }

    @Test
    void zeroDaysAreSkipped_andLastDayScoreIsTheLatestNonZeroDay() {
        Replay replay = PetGrowthPolicy.replay(days(3, -3, 0, 0));
        assertThat(replay.lastDayScore()).isEqualTo(-3);
        assertThat(replay.lastScoredDate()).isEqualTo(START.plusDays(1));
    }

    @Test
    void emptyHistory_isTheEmptyReplay() {
        assertThat(PetGrowthPolicy.replay(new TreeMap<>())).isEqualTo(Replay.EMPTY);
    }

    @Test
    void slipRightAfterEvolving_deEvolves() {
        Replay evolved = PetGrowthPolicy.replay(days(repeat(3, 5)));               // 15 points
        assertThat(PetGrowthPolicy.toDTO(evolved, false).getForm()).isEqualTo(2);

        int[] thenSlip = java.util.Arrays.copyOf(repeat(3, 5), 6);
        thenSlip[5] = -3;                                                         // 12 points
        assertThat(PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(thenSlip)), false).getForm()).isEqualTo(1);
    }

    @Test
    void eachThreshold_crossedUpThenDown() {
        // 12 → 15 (Seedling) → 12 (seed); 33 → 36 (Sprig) → 33; 57 → 60 (Bushling) → 57
        for (int[] pair : new int[][] {{4, 1}, {11, 2}, {19, 3}}) {
            int ups = pair[0] + 1;
            Replay up = PetGrowthPolicy.replay(days(repeat(3, ups)));
            assertThat(PetGrowthPolicy.formFor(up.points())).isEqualTo(pair[1] + 1);
            int[] down = java.util.Arrays.copyOf(repeat(3, ups), ups + 1);
            down[ups] = -3;
            assertThat(PetGrowthPolicy.formFor(PetGrowthPolicy.replay(days(down)).points())).isEqualTo(pair[1]);
        }
    }

    @Test
    void peak_tracksTheHighestRunningTotal() {
        int[] scores = java.util.Arrays.copyOf(repeat(3, 30), 32);                // 90 …
        scores[30] = -3;
        scores[31] = -3;                                                          // … then 84
        Replay replay = PetGrowthPolicy.replay(days(scores));
        assertThat(replay.points()).isEqualTo(84);
        assertThat(replay.peak()).isEqualTo(90);
        assertThat(PetGrowthPolicy.reachedBasilisk(replay)).isTrue();
    }

    // ---- AC 4: bar fields ----

    @Test
    void toDTO_barIsPointsMinusThreshold_overTheFormsBarSize() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(repeat(3, 7))), false); // 21
        assertThat(dto.getForm()).isEqualTo(2);
        assertThat(dto.getBarCurrent()).isEqualTo(6);
        assertThat(dto.getBarSize()).isEqualTo(21);
        assertThat(dto.isFullyGrown()).isFalse();
    }

    @Test
    void toDTO_fullyGrown_isBasiliskWithNoBar_whateverThePoints() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(repeat(3, 20))), true); // 60
        assertThat(dto.getForm()).isEqualTo(5);
        assertThat(dto.getBarCurrent()).isNull();
        assertThat(dto.getBarSize()).isNull();
        assertThat(dto.isFullyGrown()).isTrue();
        assertThat(dto.getPoints()).isEqualTo(60);
    }
}
```

- [x] **Step 2: Run it and watch it fail to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetGrowthPolicyTest`
Expected: `COMPILATION ERROR` — `cannot find symbol: class PetGrowthPolicy`.

- [x] **Step 3: Implement the policy**

```java
package com.foodbytes.service;

import com.foodbytes.dto.PetGrowthDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;

/**
 * MPP-31: the single owner of Pip's growth rules (the PlanStreakPolicy / HabitStreakPolicy
 * pattern). Pure and static; PetGrowthService feeds it the caller's logs.
 *
 * A finished day scores +3 (every planned breakfast/lunch/dinner ticked by the caller, and both
 * habits answered clean), -3 (any lapse, or a planned main meal left unticked) or 0 (today, a day
 * the check-in hasn't covered yet, or nothing planned and clean). Scores are applied in date order
 * with the total floored at 0, and the total picks the form both ways (strict de-evolve). Basilisk
 * is the exception: once reached it is permanent (users.pet_fully_grown_at).
 */
public final class PetGrowthPolicy {

    public static final int POINTS_PERFECT_DAY = 3;
    public static final int POINTS_SLIP_DAY = -3;

    public static final int FORM_BASIL_SEED = 1;
    public static final int FORM_SEEDLING = 2;
    public static final int FORM_SPRIG = 3;
    public static final int FORM_BUSHLING = 4;
    public static final int FORM_BASILISK = 5;

    /** Index = form - 1: the points at which each form starts. A form's bar size is the gap to the next. */
    public static final List<Integer> FORM_THRESHOLDS = List.of(0, 15, 36, 60, 90);

    /** points = floored total; peak = highest total reached; last* = the most recent non-zero day. */
    public record Replay(int points, int peak, int lastDayScore, LocalDate lastScoredDate) {
        public static final Replay EMPTY = new Replay(0, 0, 0, null);
    }

    private PetGrowthPolicy() {
    }

    /**
     * One day's score. snackClean / alcoholClean: null = not answered for that day, TRUE = clean,
     * FALSE = lapse. A known lapse is final; otherwise nothing is judged until both habits are
     * answered, so an unticked dinner isn't a slip while the check-in is still pending.
     */
    public static int dayScore(int planned, int eatenByCaller, Boolean snackClean, Boolean alcoholClean,
                               boolean isTodayOrLater) {
        if (isTodayOrLater) {
            return 0;
        }
        if (Boolean.FALSE.equals(snackClean) || Boolean.FALSE.equals(alcoholClean)) {
            return POINTS_SLIP_DAY;
        }
        if (snackClean == null || alcoholClean == null || planned == 0) {
            return 0;
        }
        return eatenByCaller >= planned ? POINTS_PERFECT_DAY : POINTS_SLIP_DAY;
    }

    /** Applies the scores in date order, floored at 0. Zero days change nothing. */
    public static Replay replay(SortedMap<LocalDate, Integer> scores) {
        int points = 0;
        int peak = 0;
        int lastDayScore = 0;
        LocalDate lastScoredDate = null;
        for (Map.Entry<LocalDate, Integer> day : scores.entrySet()) {
            int score = day.getValue();
            if (score == 0) {
                continue;
            }
            points = Math.max(0, points + score);
            peak = Math.max(peak, points);
            lastDayScore = score;
            lastScoredDate = day.getKey();
        }
        return lastScoredDate == null ? Replay.EMPTY : new Replay(points, peak, lastDayScore, lastScoredDate);
    }

    public static int formFor(int points) {
        int form = FORM_BASIL_SEED;
        for (int i = 1; i < FORM_THRESHOLDS.size(); i++) {
            if (points >= FORM_THRESHOLDS.get(i)) {
                form = i + 1;
            }
        }
        return form;
    }

    /** True once the running total has ever reached Basilisk's threshold in this history. */
    public static boolean reachedBasilisk(Replay replay) {
        return replay.peak() >= FORM_THRESHOLDS.get(FORM_BASILISK - 1);
    }

    public static PetGrowthDTO toDTO(Replay replay, boolean fullyGrown) {
        int points = replay.points();
        int form = formFor(points);
        if (fullyGrown || form == FORM_BASILISK) {
            return new PetGrowthDTO(points, FORM_BASILISK, null, null, true,
                    replay.lastDayScore(), replay.lastScoredDate());
        }
        int threshold = FORM_THRESHOLDS.get(form - 1);
        return new PetGrowthDTO(points, form, points - threshold, FORM_THRESHOLDS.get(form) - threshold, false,
                replay.lastDayScore(), replay.lastScoredDate());
    }
}
```

- [x] **Step 4: Run the test to green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetGrowthPolicyTest`
Expected: `Tests run: 24, Failures: 0, Errors: 0` (14 plain tests + 10 parameterised cases), `BUILD SUCCESS`.

### Task 6: Habit-day read for the replay ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetHabitDayRepository.java`

- [x] **Step 1: Add the derived query and `LocalDate` import**

```java
    /**
     * MPP-31: every habit answer this user logged before `day` (today), oldest first. The first
     * row's day is where Pip's growth history starts; earlier days are unscored by rule.
     */
    List<PetHabitDay> findByUserIdAndDayBeforeOrderByDayAsc(Long userId, LocalDate day);
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 7: `PetGrowthService` (test-first) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetGrowthService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetGrowthServiceTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitDay;
import com.foodbytes.model.User;
import com.foodbytes.repository.MealPlanEntryEatenRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.MealPlanEntryRepository.PlannedMealSlot;
import com.foodbytes.repository.PetHabitDayRepository;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * MPP-31 AC 1–4: growth is per person (the caller's ticks and check-ins, the owner's planned slots),
 * recomputed from the logs every read, and Basilisk is recorded once and never lost.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PetGrowthServiceTest {

    private static final Long OWNER = 1L;
    private static final Long PARTNER = 2L;
    private static final LocalDate TODAY = LocalDate.of(2026, 11, 20);
    private static final Clock CLOCK = Clock.fixed(
            ZonedDateTime.of(2026, 11, 20, 12, 0, 0, 0, HabitStreakPolicy.ZONE).toInstant(), HabitStreakPolicy.ZONE);

    @Mock private PetHabitDayRepository habitDayRepository;
    @Mock private ExtraChoiceService extraChoiceService;
    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private MealPlanEntryEatenRepository eatenRepository;
    @Mock private UserRepository userRepository;

    private PetGrowthService service;

    @BeforeEach
    void setUp() {
        service = new PetGrowthService(habitDayRepository, extraChoiceService, mealPlanEntryRepository,
                eatenRepository, userRepository, CLOCK);
        when(extraChoiceService.resolveOwnerId(anyLong())).thenReturn(OWNER);
    }

    private static User user(Long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    /** `count` days ending yesterday. */
    private static LocalDate firstOf(int count) {
        return TODAY.minusDays(count);
    }

    private static PlannedMealSlot slot(long id, LocalDate day) {
        return new PlannedMealSlot() {
            @Override public Long getId() { return id; }
            @Override public LocalDate getPlanDate() { return day; }
        };
    }

    /** One planned breakfast per day, id = 100 + offset from the first day. */
    private static List<PlannedMealSlot> oneMealPerDay(LocalDate from, int count) {
        List<PlannedMealSlot> slots = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            slots.add(slot(100 + i, from.plusDays(i)));
        }
        return slots;
    }

    private static List<Long> ids(LocalDate from, int count) {
        List<Long> ids = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            ids.add(100L + i);
        }
        return ids;
    }

    /** Both habits answered for every day in [from, from + count); lapseOffset (or -1) is a snack lapse. */
    private static List<PetHabitDay> answers(Long userId, LocalDate from, int count, int lapseOffset) {
        List<PetHabitDay> rows = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            LocalDate day = from.plusDays(i);
            rows.add(new PetHabitDay(null, userId, Habit.SNACK, day, i != lapseOffset));
            rows.add(new PetHabitDay(null, userId, Habit.ALCOHOL, day, true));
        }
        return rows;
    }

    private void stub(Long userId, List<PetHabitDay> answers, List<PlannedMealSlot> slots, List<Long> ticked) {
        LocalDate from = answers.isEmpty() ? null : answers.get(0).getDay();
        when(habitDayRepository.findByUserIdAndDayBeforeOrderByDayAsc(userId, TODAY)).thenReturn(answers);
        when(mealPlanEntryRepository.findMainMealSlots(OWNER, PlanStreakPolicy.MAIN_MEAL_KEYS, from, TODAY.minusDays(1)))
                .thenReturn(slots);
        when(eatenRepository.findEatenEntryIdsInRange(userId, from, TODAY.minusDays(1))).thenReturn(ticked);
    }

    @Test
    void noCheckInsYet_isAnEmptySeed_andSkipsThePlanReads() {
        when(habitDayRepository.findByUserIdAndDayBeforeOrderByDayAsc(OWNER, TODAY)).thenReturn(List.of());

        PetGrowthDTO growth = service.growth(user(OWNER));

        assertThat(growth.getPoints()).isZero();
        assertThat(growth.getForm()).isEqualTo(1);
        assertThat(growth.getBarSize()).isEqualTo(15);
        verifyNoInteractions(mealPlanEntryRepository, eatenRepository);
    }

    /** AC 4: two linked users on one shared plan get different forms from their own ticks. */
    @Test
    void twoLinkedUsers_getDifferentForms() {
        LocalDate from = firstOf(6);
        stub(OWNER, answers(OWNER, from, 6, -1), oneMealPerDay(from, 6), ids(from, 6));   // 6 perfect = 18
        stub(PARTNER, answers(PARTNER, from, 6, -1), oneMealPerDay(from, 6), List.of());  // 6 slips → 0

        assertThat(service.growth(user(OWNER)).getForm()).isEqualTo(2);
        assertThat(service.growth(user(PARTNER)).getForm()).isEqualTo(1);
        assertThat(service.growth(user(PARTNER)).getLastDayScore()).isEqualTo(-3);
    }

    /** AC 1: a backdated lapse (MPP-20 catch-up) re-scores that day on the next read. */
    @Test
    void backdatedAnswer_reScoresTheDay() {
        LocalDate from = firstOf(5);
        stub(OWNER, answers(OWNER, from, 5, -1), oneMealPerDay(from, 5), ids(from, 5));
        assertThat(service.growth(user(OWNER)).getPoints()).isEqualTo(15);

        stub(OWNER, answers(OWNER, from, 5, 4), oneMealPerDay(from, 5), ids(from, 5));    // day 5 now a lapse
        PetGrowthDTO growth = service.growth(user(OWNER));
        assertThat(growth.getPoints()).isEqualTo(9);
        assertThat(growth.getForm()).isEqualTo(1);
    }

    /** AC 1: days the check-in hasn't covered, and clean days with nothing planned, score 0. */
    @Test
    void unscoredDays_addNothing() {
        LocalDate from = firstOf(4);
        List<PetHabitDay> onlyFirstTwoAnswered = answers(OWNER, from, 2, -1);
        // days 3–4: no plan and no answers; day 2: answered clean with nothing planned
        stub(OWNER, onlyFirstTwoAnswered, List.of(slot(100, from)), List.of(100L));

        PetGrowthDTO growth = service.growth(user(OWNER));
        assertThat(growth.getPoints()).isEqualTo(3);
        assertThat(growth.getLastScoredDate()).isEqualTo(from);
    }

    @Test
    void firstReachingNinety_recordsFullyGrownOnce() {
        LocalDate from = firstOf(30);
        stub(OWNER, answers(OWNER, from, 30, -1), oneMealPerDay(from, 30), ids(from, 30)); // 90

        PetGrowthDTO growth = service.growth(user(OWNER));

        assertThat(growth.getForm()).isEqualTo(5);
        assertThat(growth.isFullyGrown()).isTrue();
        assertThat(growth.getBarSize()).isNull();
        verify(userRepository).markPetFullyGrown(eq(OWNER), eq(LocalDateTime.now(CLOCK)));
    }

    /** AC 3: Basilisk never de-evolves, however far the total falls afterwards. */
    @Test
    void basilisk_neverDeEvolves() {
        LocalDate from = firstOf(20);
        User grown = user(OWNER);
        grown.setPetFullyGrownAt(LocalDateTime.of(2026, 10, 30, 9, 0));
        stub(OWNER, answers(OWNER, from, 20, -1), oneMealPerDay(from, 20), ids(from, 10)); // 10 up, 10 down → 0

        PetGrowthDTO growth = service.growth(grown);

        assertThat(growth.getPoints()).isZero();
        assertThat(growth.getForm()).isEqualTo(5);
        assertThat(growth.isFullyGrown()).isTrue();
        verify(userRepository, never()).markPetFullyGrown(anyLong(), any());
    }

    /** Touching 90 between visits and slipping back still locks Basilisk in. */
    @Test
    void peakOfNinety_thenSlips_stillRecordsFullyGrown() {
        LocalDate from = firstOf(32);
        stub(OWNER, answers(OWNER, from, 32, -1), oneMealPerDay(from, 32), ids(from, 30)); // 90 then 84

        PetGrowthDTO growth = service.growth(user(OWNER));

        assertThat(growth.getPoints()).isEqualTo(84);
        assertThat(growth.getForm()).isEqualTo(5);
        verify(userRepository).markPetFullyGrown(eq(OWNER), any());
    }
}
```

- [x] **Step 2: Run it and watch it fail to compile**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetGrowthServiceTest`
Expected: `COMPILATION ERROR` — `cannot find symbol: class PetGrowthService`.

- [x] **Step 3: Implement the service**

```java
package com.foodbytes.service;

import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitDay;
import com.foodbytes.model.User;
import com.foodbytes.repository.MealPlanEntryEatenRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.MealPlanEntryRepository.PlannedMealSlot;
import com.foodbytes.repository.PetHabitDayRepository;
import com.foodbytes.repository.UserRepository;
import com.foodbytes.service.PetGrowthPolicy.Replay;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * MPP-31: the caller's own Pip growth, recomputed from the logs on every read so a late tick or a
 * backdated check-in answer corrects history (AC 2). Check-ins and ticks are always the caller's
 * (per-person Pip, MPP-33); the planned slots come from the shared plan's owner, as in
 * PlanStreakService. Rules live in PetGrowthPolicy.
 *
 * History starts at the caller's first check-in answer: every earlier day is unscored by rule, so
 * a leading run of zeros can't change the floored total.
 */
@Service
@RequiredArgsConstructor
public class PetGrowthService {

    private final PetHabitDayRepository habitDayRepository;
    private final ExtraChoiceService extraChoiceService;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealPlanEntryEatenRepository eatenRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    /**
     * Writes at most once per user, ever: the first time the replayed total has reached 90 it
     * records users.pet_fully_grown_at, which keeps the form at Basilisk for good (AC 3).
     */
    @Transactional
    public PetGrowthDTO growth(User user) {
        LocalDate today = HabitStreakPolicy.today(clock);
        Replay replay = replay(user.getId(), today);
        boolean fullyGrown = user.getPetFullyGrownAt() != null;
        if (!fullyGrown && PetGrowthPolicy.reachedBasilisk(replay)) {
            userRepository.markPetFullyGrown(user.getId(), LocalDateTime.now(clock));
            fullyGrown = true;
        }
        return PetGrowthPolicy.toDTO(replay, fullyGrown);
    }

    private Replay replay(Long userId, LocalDate today) {
        List<PetHabitDay> answers = habitDayRepository.findByUserIdAndDayBeforeOrderByDayAsc(userId, today);
        if (answers.isEmpty()) {
            return Replay.EMPTY;
        }
        LocalDate from = answers.get(0).getDay();
        LocalDate to = today.minusDays(1);

        Map<LocalDate, Map<Habit, Boolean>> cleanByDay = new HashMap<>();
        answers.forEach(a -> cleanByDay.computeIfAbsent(a.getDay(), d -> new EnumMap<>(Habit.class))
                .put(a.getHabit(), a.getClean()));

        Long ownerId = extraChoiceService.resolveOwnerId(userId);
        Map<LocalDate, List<Long>> slotsByDay = mealPlanEntryRepository
                .findMainMealSlots(ownerId, PlanStreakPolicy.MAIN_MEAL_KEYS, from, to).stream()
                .collect(Collectors.groupingBy(PlannedMealSlot::getPlanDate,
                        Collectors.mapping(PlannedMealSlot::getId, Collectors.toList())));
        Set<Long> eaten = new HashSet<>(eatenRepository.findEatenEntryIdsInRange(userId, from, to));

        SortedMap<LocalDate, Integer> scores = new TreeMap<>();
        for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
            List<Long> slots = slotsByDay.getOrDefault(day, List.of());
            int eatenCount = (int) slots.stream().filter(eaten::contains).count();
            Map<Habit, Boolean> clean = cleanByDay.getOrDefault(day, Map.of());
            scores.put(day, PetGrowthPolicy.dayScore(slots.size(), eatenCount,
                    clean.get(Habit.SNACK), clean.get(Habit.ALCOHOL), !day.isBefore(today)));
        }
        return PetGrowthPolicy.replay(scores);
    }
}
```

- [x] **Step 4: Run the test to green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetGrowthServiceTest`
Expected: `Tests run: 7, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

### Task 8: Put `growth` on `PetDTO` for get and rename ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetDTO.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetPolicy.java:35-41`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java`

- [x] **Step 1: Add the field to `PetDTO`** (and extend the class comment with "MPP-31: growth")

```java
    private PetGrowthDTO growth;      // MPP-31: the caller's own Pip growth, never null
```

- [x] **Step 2: Change `PetPolicy.toDTO` to take the growth**

```java
    public static PetDTO toDTO(User user, PetGrowthDTO growth) {
        String saved = user.getPetName();
        return new PetDTO(
                saved != null ? saved : DEFAULT_NAME,
                saved != null,
                MealTimesPolicy.effective(user),
                growth);
    }
```

Add `import com.foodbytes.dto.PetGrowthDTO;`.

- [x] **Step 3: Wire `PetService`**

```java
    private final UserRepository userRepository;
    private final PetGrowthService petGrowthService;

    /** Not read-only: the growth read records Basilisk the first time it is reached (MPP-31). */
    @Transactional
    public PetDTO getPet(Long userId) {
        return toDTO(findUser(userId));
    }

    /** Renames the caller's own pet; null/blank resets to the default name. */
    @Transactional
    public PetDTO renamePet(Long userId, String name) {
        User user = findUser(userId);
        user.setPetName(PetPolicy.normalise(name));
        return toDTO(userRepository.save(user));
    }

    // The client replaces its whole pet with either response, so both carry growth.
    private PetDTO toDTO(User user) {
        return PetPolicy.toDTO(user, petGrowthService.growth(user));
    }
```

Extend the class Javadoc with: "MPP-31: both responses carry the caller's own growth (PetGrowthService)."

- [x] **Step 4: Update `PetServiceTest`**

Add the mock next to `userRepository` so `@InjectMocks` uses the two-argument constructor, plus a stub and one new assertion:

```java
    @Mock private PetGrowthService petGrowthService;

    private static final PetGrowthDTO GROWTH = new PetGrowthDTO(21, 2, 6, 21, false, 3, null);
```

In `setUp()`, append:

```java
        org.mockito.Mockito.lenient().when(petGrowthService.growth(any(User.class))).thenReturn(GROWTH);
```

Add the test:

```java
    /** MPP-31: GET and rename both return the caller's own growth. */
    @Test
    void getAndRename_bothCarryTheCallersGrowth() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));
        stubSave();

        assertThat(petService.getPet(LINKED_ID).getGrowth()).isEqualTo(GROWTH);
        assertThat(petService.renamePet(LINKED_ID, "Basil").getGrowth()).isEqualTo(GROWTH);
        verify(petGrowthService, org.mockito.Mockito.times(2)).growth(linked);
    }
```

Add `import com.foodbytes.dto.PetGrowthDTO;`.

- [x] **Step 5: Confirm no other caller used the old `toDTO(User)`**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\**\*.java -Pattern "PetPolicy\.toDTO\(" | Select-Object Line`
Expected: only the one call inside `PetService.toDTO`.

- [x] **Step 6: Run the pet tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest="PetServiceTest,PetControllerTest,PetGrowthServiceTest,PetGrowthPolicyTest"`
Expected: 0 failures, 0 errors, `BUILD SUCCESS`.

---

## Phase 3 — The herb replaces Mochi

Ports the approved herb mockup to JSX and swaps it in everywhere Mochi was drawn, at form 1 until Phase 4 feeds the real form. Ends with no `mochi` reference left in `client/src`, the Mochi files deleted, and `npm run build` green; the room, footer and meal reaction all show the Basil seed.

### Task 9: Move the room's outline colour off `mochiParts` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/petRoom.js`
- Modify: `foodbytes-app/client/src/components/pet/room/awardArt.jsx:1,9`
- Modify: `foodbytes-app/client/src/components/pet/room/furniture.jsx:1,11-12,83`
- Modify: `foodbytes-app/client/src/components/pet/room/isoShapes.jsx:1,19,25`
- Modify: `foodbytes-app/client/src/components/pet/room/roomEffects.jsx:1` (+ every `MOCHI_OUTLINE` use)

- [x] **Step 1: Add the constant after `DEFAULT_ROOM_LEVELS` in `constants/petRoom.js`**

```js
// The room art's outline colour (was Mochi's outline; the herb has its own ink in herb/herbForms.js).
export const ROOM_INK = '#3b2f5c'
```

- [x] **Step 2: Repoint the four files**

In each of `awardArt.jsx`, `furniture.jsx`, `isoShapes.jsx`, `roomEffects.jsx`: replace line 1 `import { MOCHI_OUTLINE } from '../mochiParts'` with `import { ROOM_INK } from '../../../constants/petRoom'` (merge into an existing `constants/petRoom` import if the file already has one — `awardArt.jsx` imports `petAwards`, not `petRoom`), then replace every `MOCHI_OUTLINE` identifier in the file with `ROOM_INK`.

- [x] **Step 3: Confirm the room no longer touches Mochi**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\room\*.jsx -Pattern "MOCHI_OUTLINE|mochiParts"`
Expected: only `RoomPip.jsx` lines (replaced in Task 14).

### Task 10: Form constants, `isWilted`, and `herbForms.js` — geometry, anchors, mini crops ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/pipGrowth.js` (form part; Task 15 appends the rest)
- Create: `foodbytes-app/client/src/utils/pipGrowth.js` (`isWilted` only; Task 15 completes it)
- Create: `foodbytes-app/client/src/components/pet/herb/herbForms.js`

- [x] **Step 0a: Create `constants/pipGrowth.js` with the form constants**

```js
/**
 * MPP-31: Pip's herb line. Points, thresholds and the form are computed on the server
 * (PetGrowthPolicy); the client only names forms and plays the since-last-visit sequence.
 */
export const PIP_FORMS = {
  BASIL_SEED: 1,
  SEEDLING: 2,
  SPRIG: 3,
  BUSHLING: 4,
  BASILISK: 5
}

export const PIP_FORM_NAMES = {
  1: 'Basil seed',
  2: 'Seedling',
  3: 'Sprig',
  4: 'Bushling',
  5: 'Basilisk'
}

// Drawn before the pet loads, for guests, and if a payload carries no growth.
export const PIP_DEFAULT_FORM = PIP_FORMS.BASIL_SEED

export const PIP_GROWTH_PHASES = {
  IDLE: 'idle',
  FILLING: 'filling',
  EVOLVING: 'evolving',
  DRAINING: 'draining',
  SHRINKING: 'shrinking',
  REVEALED: 'revealed'
}

// AC 7: the score of a slip day; the latest scored day being a slip means wilted.
export const PIP_SLIP_SCORE = -3
```

- [x] **Step 0b: Create `utils/pipGrowth.js` with `isWilted` (Task 15 adds the rest of the helpers)**

```js
import { PIP_SLIP_SCORE } from '../constants/pipGrowth.js'

/** AC 7: wilted from the day after a −3 day until the next +3 day (the latest scored day is a slip). */
export const isWilted = (growth) => growth?.lastDayScore === PIP_SLIP_SCORE
```

- [x] **Step 1: Write `herbForms.js`** (geometry copied verbatim from `pip-herb-wardrobe.html` lines 201–226)

```js
// MPP-31: Pip's herb line, ported verbatim from the approved
// .claude/contract/MPP-15-epic-breakdown/mockups/pip-herb-wardrobe.html (FORMS, 2026-10-13).
// Every form is drawn in the same 200-unit space with its feet on y = HERB_FOOT_Y, scaled by
// `scale` about (100, HERB_FOOT_Y).

export const HERB_INK = '#2f4a22'
export const HERB_FOOT_X = 100
export const HERB_FOOT_Y = 186
export const HERB_FULL_VIEWBOX = '0 -40 200 240'

const ellipsePath = (cx, cy, rx, ry) =>
  `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`

/**
 * Index = form - 1. hat: where a brim sits {y, w}; eyes: {y, gap, s}; neck / waist: y lines for
 * torso clothes; side: half-width at the neck; feet: [[root, tip], [root, tip]]; growTop: where head
 * growth starts; miniViewBox: the tight crop for the `mini` variant (tune at the visual check).
 */
export const HERB_FORMS = [
  {
    name: 'Basil seed', scale: 0.84, fill: ['#d8b98a', '#a77d4b'],
    body: 'M100 112 C128 122 134 150 122 170 C112 184 88 184 78 170 C66 150 72 122 100 112Z',
    hat: { y: 126, w: 38 }, eyes: { y: 140, gap: 13, s: 0.72 }, neck: 156, waist: 172, side: 24,
    feet: [[[86, 177], [74, 185]], [[114, 177], [126, 185]]], growTop: 112,
    miniViewBox: '65 118 74 74'
  },
  {
    name: 'Seedling', scale: 0.88, fill: ['#c8eea2', '#86c862'],
    body: ellipsePath(100, 146, 40, 38),
    hat: { y: 118, w: 56 }, eyes: { y: 134, gap: 17, s: 0.8 }, neck: 155, waist: 174, side: 37,
    feet: [[[82, 178], [70, 186]], [[118, 178], [130, 186]]], growTop: 108,
    miniViewBox: '46 84 108 108'
  },
  {
    name: 'Sprig', scale: 0.92, fill: ['#c8eea2', '#86c862'],
    body: 'M100 74 C136 74 150 110 150 140 C150 170 128 182 100 182 C72 182 50 170 50 140 C50 110 64 74 100 74Z',
    hat: { y: 92, w: 60 }, eyes: { y: 120, gap: 20, s: 0.9 }, neck: 145, waist: 168, side: 47,
    feet: [[[78, 178], [66, 186]], [[122, 178], [134, 186]]], growTop: 74,
    miniViewBox: '19 30 162 162'
  },
  {
    name: 'Bushling', scale: 0.96, fill: ['#c8eea2', '#86c862'],
    body: ellipsePath(100, 136, 54, 48),
    hat: { y: 100, w: 72 }, eyes: { y: 124, gap: 22, s: 0.95 }, neck: 149, waist: 172, side: 51,
    feet: [[[76, 178], [62, 186]], [[124, 178], [138, 186]]], growTop: 88,
    miniViewBox: '14 36 172 172'
  },
  {
    name: 'Basilisk', scale: 0.98, fill: ['#b4e488', '#4f9c34'],
    body: 'M100 88 C146 88 162 116 162 140 C162 170 136 184 100 184 C64 184 38 170 38 140 C38 116 54 88 100 88Z',
    hat: { y: 100, w: 78 }, eyes: { y: 124, gap: 24, s: 1 }, neck: 153, waist: 173, side: 58,
    feet: [[[70, 177], [54, 186]], [[130, 177], [146, 186]]], growTop: 88,
    miniViewBox: '-6 4 212 212'
  }
]

/** The form's geometry; unknown forms fall back to the seed so a bad payload never blanks Pip. */
export const herbForm = (form) => HERB_FORMS[form - 1] ?? HERB_FORMS[0]

/**
 * AC 6: the anchors every form exposes for MPP-32's wardrobe, in the unscaled 200-unit space
 * (apply the form's `scale` about (HERB_FOOT_X, HERB_FOOT_Y) to place them). Keyed by form 1–5.
 */
export const PIP_FORM_ANCHORS = Object.fromEntries(HERB_FORMS.map((f, i) => [i + 1, {
  hat: f.hat,
  eyes: { y: f.eyes.y, gap: f.eyes.gap },
  neck: f.neck,
  waist: f.waist,
  feetTips: f.feet.map(([, tip]) => tip)
}]))
```

- [x] **Step 2: Smoke-check the anchors in node**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {PIP_FORM_ANCHORS} from './src/components/pet/herb/herbForms.js'; console.log(Object.keys(PIP_FORM_ANCHORS).join(','), JSON.stringify(PIP_FORM_ANCHORS[5]))"`
Expected: `1,2,3,4,5 {"hat":{"y":100,"w":78},"eyes":{"y":124,"gap":24},"neck":153,"waist":173,"feetTips":[[54,186],[146,186]]}`

### Task 11: `herbFaces.jsx` — shared and Basilisk faces ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/herb/herbFaces.jsx`

- [x] **Step 1: Port `face()` and `basiliskFace()` from `pip-herb-wardrobe.html` lines 144–179 to JSX**

Conversion rules: each template `<path …/>` becomes a JSX element with camelCased attributes (`stroke-width` → `strokeWidth`, `stroke-linecap` → `strokeLinecap`, `stroke-linejoin` → `strokeLinejoin`); each `${expr}` becomes the same arithmetic in `{}`; `INK` → `HERB_INK`; the mockup's `'sleep'` case keys on `PET_SLEEP_FACE` and the mood strings on `PET_MOODS.*`. Structure, with the content case written out as the pattern for the rest:

```jsx
import { PET_MOODS, PET_SLEEP_FACE } from '../../../constants/pet'
import { PIP_FORMS } from '../../../constants/pipGrowth'
import { HERB_INK, herbForm } from './herbForms'

const MOUTH = '#7a2e45'
const BLUSH = '#ff8fab'

/** AC 10: the MPP-14 mood faces on every form; Basilisk has its own face for content and happy (AC 6). */
export function HerbFace({ form, mood }) {
  const { eyes } = herbForm(form)
  if (form === PIP_FORMS.BASILISK && (mood === PET_MOODS.CONTENT || mood === PET_MOODS.HAPPY)) {
    return <BasiliskFace ey={eyes.y} gap={eyes.gap} mood={mood} />
  }
  return <SharedFace ey={eyes.y} gap={eyes.gap} s={eyes.s} mood={mood} />
}

function SharedFace({ ey, gap, s, mood }) {
  const cx = 100
  const L = cx - gap
  const R = cx + gap
  const my = ey + 17 * s
  const line = { stroke: HERB_INK, strokeWidth: 4 * s, strokeLinecap: 'round', fill: 'none' }
  switch (mood) {
    case PET_MOODS.HAPPY:
      return (/* port the mockup's 'happy' case */)
    case PET_MOODS.BORED:
      return (/* port the mockup's 'bored' case */)
    case PET_MOODS.MISCHIEVOUS:
      return (/* port the mockup's 'mischievous' case */)
    case PET_SLEEP_FACE:
      return (/* port the mockup's 'sleep' case */)
    default:
      return (
        <>
          <Eye x={L} ey={ey} s={s} />
          <Eye x={R} ey={ey} s={s} />
          <path d={`M${cx - 8 * s} ${my - 2 * s} Q${cx} ${my + 6 * s} ${cx + 8 * s} ${my - 2 * s}`} {...line} />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.55} />
        </>
      )
  }
}

function Eye({ x, ey, s, dx = 0 }) {
  return (
    <>
      <ellipse cx={x + dx} cy={ey} rx={7 * s} ry={9 * s} fill={HERB_INK} />
      <circle cx={x + dx + 2.4 * s} cy={ey - 3.4 * s} r={2.8 * s} fill="#fff" />
    </>
  )
}

function Blush({ L, R, ey, s, opacity }) {
  return (
    <>
      <ellipse cx={L - 11 * s} cy={ey + 11 * s} rx={9 * s} ry={5 * s} fill={BLUSH} opacity={opacity} />
      <ellipse cx={R + 11 * s} cy={ey + 11 * s} rx={9 * s} ry={5 * s} fill={BLUSH} opacity={opacity} />
    </>
  )
}

function BasiliskFace({ ey, gap, mood }) {
  /* port basiliskFace(): three-part eyes, brows, the happy open mouth or content smile, blush .6 */
}
```

Every `/* port … */` placeholder above is replaced by the mockup case's elements; none may remain in the file.

- [x] **Step 2: Confirm no placeholder survived**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\herb\herbFaces.jsx -Pattern "/\* port"`
Expected: zero hits.

### Task 12: `herbParts.jsx` — leaves, vines, bloom, back, growth, props ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/herb/herbParts.jsx`

- [x] **Step 1: Port `leaf`, `vein`, `vine`, `bloom`, `back`, `growth` (lines 181–256) and `props` (lines 425–435) to JSX components**

Same conversion rules as Task 11. The mockup's 0-based form index `f` becomes the 1-based `form` compared against `PIP_FORMS` (`f === 1` → `PIP_FORMS.SEEDLING`, `f === 2` → `SPRIG`, `f === 3` → `BUSHLING`, `f === 4` → `BASILISK`). Arrays built with `forEach` become `.map` with a stable `key` (the angle). Exports and signatures:

```jsx
import { PET_MOODS, PET_SLEEP_FACE } from '../../../constants/pet'
import { PIP_FORMS } from '../../../constants/pipGrowth'
import { HERB_INK } from './herbForms'

const LEAF = '#7cc95a'
const LEAF_DARK = '#6bbd4a'
const LEAF_DEEP = '#5fae3e'
const PETAL = '#ff9cc4'
const PETAL_LIGHT = '#ffd0e3'
const STAR = '#ffd34d'

/** A droop rotates the leaf 55° towards the ground (wilted, bored or asleep). */
const droopAngle = (deg, droop) => (droop ? deg + (Math.cos((deg * Math.PI) / 180) < 0 ? -55 : 55) : deg)

export function Leaf({ x, y, deg, size, droop, color = LEAF }) { /* port leaf() */ }
export function Vein({ x, y, deg, size, droop }) { /* port vein() */ }
export function Vine({ d, tipX, tipY, tipDeg }) { /* port vine(): ink stroke 11, LEAF_DEEP stroke 5.5, tip <Leaf size 0.75> */ }
export function Bloom({ cx, cy, stemTo }) { /* port bloom(): stem, 6 outer PETAL, 6 inner PETAL_LIGHT, STAR centre + highlight */ }

/** Behind the body: Sprig's leaf arms; Bushling's arms + crown; Basilisk's vines (hanging when drooped) + crown. */
export function HerbBack({ form, droop }) { /* port back() */ }

/** Out of the top of the head, drawn last: Seedling sprout, Sprig's three leaves, Basilisk's bloom (a closed bud when drooped). */
export function HerbGrowth({ form, droop, base }) { /* port growth() */ }

/** Full-variant mood props: happy sparkles, bored thought bubble, sleep z's; none otherwise. */
export function HerbProps({ mood }) { /* port props(); 'sleep' → PET_SLEEP_FACE */ }
```

Every `/* port … */` body is replaced by the mockup's drawing; none may remain. `PET_MOODS` / `PET_SLEEP_FACE` are used only by `HerbProps`. The happy-sparkle paths in `HerbProps` get `className="pip-sparkle"` with staggered `style={{ animationDelay: '0s' | '0.5s' | '0.9s' }}`, as Mochi's `Star` did (the class is styled in Task 13's `PipHerb.css`).

- [x] **Step 2: Confirm no placeholder survived and the file is under budget**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\herb\herbParts.jsx -Pattern "/\* port"; (Get-Content foodbytes-app\client\src\components\pet\herb\herbParts.jsx | Measure-Object -Line).Lines`
Expected: zero `/* port` hits; line count < 200.

### Task 13: `PipHerbFigure`, `PipHerb` and `PipHerb.css` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/herb/PipHerbFigure.jsx`
- Create: `foodbytes-app/client/src/components/pet/herb/PipHerb.jsx`
- Create: `foodbytes-app/client/src/components/pet/herb/PipHerb.css`

- [x] **Step 1: Write `PipHerbFigure.jsx`** (the mockup's `pip()` without the wardrobe, lines 392–423)

```jsx
import { useId } from 'react'
import { PET_MOODS, PET_SLEEP_FACE } from '../../../constants/pet'
import { PIP_FORMS, PIP_GROWTH_PHASES } from '../../../constants/pipGrowth'
import { HerbFace } from './herbFaces'
import { HERB_FOOT_Y, HERB_INK, herbForm } from './herbForms'
import { HerbBack, HerbGrowth, HerbProps } from './herbParts'

/**
 * MPP-31: one herb form at a mood, as an SVG <g> in the 200-unit space with its feet at
 * (100, HERB_FOOT_Y) — PipHerb wraps it in an <svg>, RoomPip places it in the room.
 * `wilted` droops the leaves and desaturates (AC 7); `phase` drives the evolve pulse and the
 * de-evolve shrink (AC 8). The pip-mood-* class drives the idle animation (PipHerb.css).
 */
function PipHerbFigure({ form, mood, wilted = false, phase = null, showProps = false }) {
  const id = `pip-herb-${useId().replace(/:/g, '')}`
  const f = herbForm(form)
  const droop = wilted || mood === PET_MOODS.BORED || mood === PET_SLEEP_FACE
  const k = f.scale
  const shineX = 100 - f.side * 0.55
  const shineY = f.hat.y + 10
  const className = [
    'pip-herb-figure',
    `pip-mood-${mood}`,
    wilted && 'is-wilted',
    phase === PIP_GROWTH_PHASES.EVOLVING && 'is-evolving',
    phase === PIP_GROWTH_PHASES.SHRINKING && 'is-shrinking'
  ].filter(Boolean).join(' ')

  return (
    <g className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f.fill[0]} />
          <stop offset="1" stopColor={f.fill[1]} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="189" rx={56 * k} ry="6" fill="rgba(40,60,20,.13)" />
      <g className="pip-anim">
        <g transform={`translate(100 ${HERB_FOOT_Y}) scale(${k}) translate(-100 -${HERB_FOOT_Y})`}>
          <HerbBack form={form} droop={droop} />
          {f.feet.map(([root, tip]) => (
            <path key={tip[0]} d={`M${root[0]} ${root[1]} Q${root[0]} ${tip[1]} ${tip[0]} ${tip[1]}`}
              stroke={HERB_INK} strokeWidth="5.5" fill="none" strokeLinecap="round" />
          ))}
          <path d={f.body} fill={`url(#${id})`} />
          <ellipse cx={shineX} cy={shineY} rx="11" ry="6" transform={`rotate(-32 ${shineX} ${shineY})`} fill="#fff" opacity=".45" />
          {form === PIP_FORMS.BASIL_SEED && (
            <path d="M90 118 l5 7 l5 -6 l5 7 l5 -6" stroke={HERB_INK} strokeWidth="3" fill="none" strokeLinejoin="round" opacity=".7" />
          )}
          <path d={f.body} fill="none" stroke={HERB_INK} strokeWidth="5" strokeLinejoin="round" />
          <HerbFace form={form} mood={mood} />
          <HerbGrowth form={form} droop={droop} base={f.growTop} />
        </g>
      </g>
      {showProps && <HerbProps mood={mood} />}
    </g>
  )
}

export default PipHerbFigure
```

- [x] **Step 2: Write `PipHerb.jsx`**

```jsx
import { PET_MOOD_LABELS } from '../../../constants/pet'
import { PIP_DEFAULT_FORM, PIP_FORM_NAMES } from '../../../constants/pipGrowth'
import { HERB_FULL_VIEWBOX, herbForm } from './herbForms'
import PipHerbFigure from './PipHerbFigure'
import './PipHerb.css'

/**
 * MPP-31 AC 6 / AC 10: Pip as a standalone <svg>, replacing MPP-14's MochiPet. `full` keeps room
 * for mood props; `mini` (footer tab, meal reaction) crops tight to the form and is decorative.
 */
function PipHerb({ form = PIP_DEFAULT_FORM, mood, wilted = false, variant = 'full', className = '' }) {
  const isFull = variant === 'full'
  const a11y = isFull
    ? { role: 'img', 'aria-label': `${PIP_FORM_NAMES[form] ?? PIP_FORM_NAMES[PIP_DEFAULT_FORM]}, ${PET_MOOD_LABELS[mood]}` }
    : { 'aria-hidden': true, focusable: 'false' }

  return (
    <svg
      className={`pip-herb pip-herb--${variant} ${className}`.trim()}
      viewBox={isFull ? HERB_FULL_VIEWBOX : herbForm(form).miniViewBox}
      xmlns="http://www.w3.org/2000/svg"
      {...a11y}
    >
      <PipHerbFigure form={form} mood={mood} wilted={wilted} showProps={isFull} />
    </svg>
  )
}

export default PipHerb
```

- [x] **Step 3: Write `PipHerb.css`** (MochiPet.css animations renamed, plus the mockups' wilt, evolve and a shrink)

```css
/* MPP-31: Pip's herb line — idle moods ported from MPP-14's MochiPet.css, the wilt filter from
   pip-sprout-evolutions.html, the evolve pulse from pip-herb-wardrobe.html. */

.pip-herb {
  display: block;
  overflow: visible;
}

.pip-anim {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}

.pip-mood-content .pip-anim { animation: pip-bob 2.6s ease-in-out infinite; }
.pip-mood-happy .pip-anim { animation: pip-bounce 1.1s ease-in-out infinite; }
.pip-mood-bored .pip-anim { animation: pip-droop 4s ease-in-out infinite; }
.pip-mood-mischievous .pip-anim { animation: pip-shuffle 1.6s ease-in-out infinite; }

/* AC 7: wilted — colours fade; the leaves droop in the SVG itself. Moods keep animating on top. */
.pip-herb-figure.is-wilted .pip-anim { filter: saturate(0.45) brightness(0.97); }

/* AC 8: evolving — a white silhouette pulse; de-evolving — a gentle settle down from a little larger. */
.pip-herb-figure.is-evolving .pip-anim { animation: pip-evolve 1.6s ease-in-out; }
.pip-herb-figure.is-shrinking .pip-anim { animation: pip-shrink 1.2s ease-out; }

.pip-sparkle {
  animation: pip-twinkle 1.4s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes pip-bob {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  50% { transform: translateY(-5px) scale(0.98, 1.02); }
}

@keyframes pip-bounce {
  0%, 100% { transform: translateY(0) scale(1.04, 0.96); }
  40% { transform: translateY(-16px) scale(0.96, 1.05); }
  70% { transform: translateY(0) scale(1.06, 0.94); }
}

@keyframes pip-droop {
  0%, 100% { transform: rotate(-2deg) scale(1.02, 0.97); }
  50% { transform: rotate(2deg) scale(1.02, 0.97); }
}

@keyframes pip-shuffle {
  0%, 100% { transform: translateX(0) rotate(0); }
  25% { transform: translateX(-4px) rotate(-3deg); }
  75% { transform: translateX(4px) rotate(3deg); }
}

@keyframes pip-twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.6); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes pip-evolve {
  0% { filter: brightness(1); }
  15%, 70% { filter: brightness(0) invert(1) drop-shadow(0 0 10px #fff); }
  25%, 45% { transform: scale(0.85); }
  35%, 55% { transform: scale(1.08); }
  100% { filter: brightness(1); transform: scale(1); }
}

@keyframes pip-shrink {
  0% { transform: scale(1.18); opacity: 0.85; }
  100% { transform: scale(1); opacity: 1; }
}

/* AC 8: reduced motion — no movement at all; the bubbles still tell the story. */
@media (prefers-reduced-motion: reduce) {
  .pip-anim,
  .pip-sparkle {
    animation: none !important;
  }
}
```

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 14: Swap Mochi for the herb in the room, footer and reaction; delete Mochi ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/RoomPip.jsx`
- Modify: `foodbytes-app/client/src/components/layout/Footer.jsx:5,14,81`
- Modify: `foodbytes-app/client/src/components/layout/Footer.css:88-93`
- Modify: `foodbytes-app/client/src/components/pet/PetReaction.jsx`
- Modify: `foodbytes-app/client/src/components/pet/PetReaction.css:16`
- Delete: `foodbytes-app/client/src/components/pet/MochiPet.jsx`, `MochiPet.css`, `mochiParts.jsx`

- [x] **Step 1: Rewrite `RoomPip.jsx`**

```jsx
import { PIP_DEFAULT_FORM } from '../../../constants/pipGrowth'
import { HERB_FOOT_X, HERB_FOOT_Y } from '../herb/herbForms'
import PipHerbFigure from '../herb/PipHerbFigure'
import { P } from './iso'
import '../herb/PipHerb.css'

const DEFAULT_HERB = { form: PIP_DEFAULT_FORM, wilted: false, phase: null }

/**
 * MPP-16 AC 5 / MPP-17 / MPP-31: Pip at a pose from roomLayout.pipPose — on the rug in his
 * mood, happy at the cooker, or asleep in bed — drawn as his current herb form. `herb`
 * ({ form, wilted, phase }) comes from usePipGrowth. Every form has feet on HERB_FOOT_Y, so
 * the pose anchors (cooker walk, bed) are unchanged.
 */
function RoomPip({ pose, herb = DEFAULT_HERB }) {
  const { face, showProps, anchor, scale, dropPx } = pose
  const [x, y] = P(...anchor)
  const transform = `translate(${(x - HERB_FOOT_X * scale).toFixed(1)},${(y + dropPx - HERB_FOOT_Y * scale).toFixed(1)}) scale(${scale})`

  return (
    <g transform={transform}>
      <PipHerbFigure form={herb.form} mood={face} wilted={herb.wilted} phase={herb.phase} showProps={showProps} />
    </g>
  )
}

export default RoomPip
```

- [x] **Step 2: Footer — herb in the tab** (`growth` arrives from `PetContext` in Task 18; until then `usePet().growth` is `undefined` and the seed shows)

Replace `import MochiPet from '../pet/MochiPet'` with:

```jsx
import PipHerb from '../pet/herb/PipHerb'
import { PIP_DEFAULT_FORM } from '../../constants/pipGrowth'
import { isWilted } from '../../utils/pipGrowth'
```

Line 14: `const { petName, mood, growth } = usePet()`. Lines 80–81: update the comment to `{/* MPP-14 AC 2 / MPP-31: live mini herb in the current mood and form; label is the pet's name. */}` and the element to:

```jsx
          <PipHerb form={growth?.form ?? PIP_DEFAULT_FORM} mood={mood} wilted={isWilted(growth)} variant="mini" />
```

`Footer.css`: rename the selector `.footer-btn svg.mochi-pet--mini` → `.footer-btn svg.pip-herb--mini` and its comment to "the Pet tab's mini herb".

- [x] **Step 3: PetReaction — herb, happy, current form**

```jsx
import { usePet } from '../../contexts/PetContext'
import { petReactionText } from '../../utils/petMood'
import { isWilted } from '../../utils/pipGrowth'
import { PET_MOODS } from '../../constants/pet'
import { PIP_DEFAULT_FORM } from '../../constants/pipGrowth'
import PipHerb from './herb/PipHerb'
import './PetReaction.css'

/**
 * MPP-14 AC 7: "Pip is happy! Lunch logged." under the eaten button, with Pip in his current
 * herb form (MPP-31). Renders nothing until the pet has loaded, so a failed pet load never shows
 * a made-up name.
 */
function PetReaction({ mealType }) {
  const { petName, growth } = usePet()
  if (!petName) return null

  return (
    <p className="pet-react">
      <PipHerb form={growth?.form ?? PIP_DEFAULT_FORM} mood={PET_MOODS.HAPPY} wilted={isWilted(growth)} variant="mini" />
      <span>{petReactionText({ petName, mealType })}</span>
    </p>
  )
}

export default PetReaction
```

`PetReaction.css` line 16: `.pet-react .mochi-pet` → `.pet-react .pip-herb`.

- [x] **Step 4: Delete the Mochi files**

Run: `Remove-Item foodbytes-app\client\src\components\pet\MochiPet.jsx, foodbytes-app\client\src\components\pet\MochiPet.css, foodbytes-app\client\src\components\pet\mochiParts.jsx`
Expected: no output.

- [x] **Step 5: Confirm Mochi is gone and the build is green**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.css | Select-String -Pattern "mochi|Mochi|MOCHI"`
Expected: zero hits.
Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 4 — Growth on screen: bar, wilt, evolve, bubbles

Feeds the server's `growth` through `PetContext`, adds the since-last-visit sequence, the level bar and the growth bubbles. Ends with `npm run build` and `npm run check:growth` green and every AC 5–10 behaviour reachable on `/pet`.

### Task 15: Growth constants and pure helpers, with node checks ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/pipGrowth.js`
- Create: `foodbytes-app/client/src/utils/pipGrowth.js`
- Create: `foodbytes-app/client/src/utils/pipGrowth.check.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [x] **Step 1: Append to `constants/pipGrowth.js`** (created in Task 10)

```js
import { CHECKIN_REACTION_MS } from './pet.js'

// AC 5 / AC 8: the since-last-visit sequence. Retune here.
export const PIP_GROWTH_PHASE_MS = {
  filling: 900,
  evolving: 1600,
  draining: 900,
  shrinking: 1200
}
export const PIP_GROWTH_BUBBLE_MS = CHECKIN_REACTION_MS // the closing line holds as long as a check-in reaction
export const PIP_BAR_MOVE_MS = 900 // a bar-only change (no bubble) settles in this long

// Suffixed with the user id, so two people on one browser keep their own marker (MPP-33).
export const PIP_GROWTH_SEEN_STORAGE_KEY = 'foodbytes.pip.lastSeenGrowth'

export const PIP_FULLY_GROWN_LABEL = 'Fully grown 🌸'

// AC 9: never shaming.
export const PIP_SLIP_LINE = "Ouch, I lost a few leaves 🍂 A good day and I'll grow them back!"
export const PIP_FULLY_GROWN_LINE = "I'm fully grown! 🌸 Thank you for looking after me."
```

Move the `import` to the top of the file.

- [x] **Step 2: Replace `utils/pipGrowth.js` (Task 10's `isWilted`-only stub) with the full module**

```js
import {
  PIP_BAR_MOVE_MS, PIP_FORM_NAMES, PIP_FULLY_GROWN_LABEL, PIP_FULLY_GROWN_LINE, PIP_GROWTH_BUBBLE_MS,
  PIP_GROWTH_PHASES, PIP_GROWTH_PHASE_MS, PIP_SLIP_LINE, PIP_SLIP_SCORE
} from '../constants/pipGrowth.js'

const { FILLING, EVOLVING, DRAINING, SHRINKING, REVEALED } = PIP_GROWTH_PHASES

export const GROWTH_CHANGES = { EVOLVE: 'evolve', DEVOLVE: 'devolve', SLIP: 'slip', MOVE: 'move' }

/** AC 7: wilted from the day after a −3 day until the next +3 day (the latest scored day is a slip). */
export const isWilted = (growth) => growth?.lastDayScore === PIP_SLIP_SCORE

/** AC 5: 0–100 for the bar; Basilisk (no bar) is full. */
export function barPct(growth) {
  if (!growth) return 0
  if (growth.barSize == null) return 100
  return Math.round((100 * growth.barCurrent) / growth.barSize)
}

/** AC 5: "Seedling · 6 / 21 → Sprig", or "Fully grown 🌸" at Basilisk. */
export function levelBarLabel(growth) {
  if (!growth) return null
  if (growth.fullyGrown || growth.barSize == null) return PIP_FULLY_GROWN_LABEL
  return `${PIP_FORM_NAMES[growth.form]} · ${growth.barCurrent} / ${growth.barSize} → ${PIP_FORM_NAMES[growth.form + 1]}`
}

/** What changed since this browser last showed Pip; null when nothing to play (or first visit). */
export function growthChange(seen, growth) {
  if (!seen || !growth) return null
  if (growth.form > seen.form) return GROWTH_CHANGES.EVOLVE
  if (growth.form < seen.form) return GROWTH_CHANGES.DEVOLVE
  if (growth.lastScoredDate !== seen.lastScoredDate && growth.lastDayScore === PIP_SLIP_SCORE) return GROWTH_CHANGES.SLIP
  if (growth.points !== seen.points) return GROWTH_CHANGES.MOVE
  return null
}

/** AC 5 / AC 8: the steps to play. Reduced motion keeps only the bubble steps. */
export function growthSchedule(change, reducedMotion) {
  const step = (phase, ms = PIP_GROWTH_PHASE_MS[phase]) => ({ phase, ms })
  const revealed = step(REVEALED, change === GROWTH_CHANGES.MOVE ? PIP_BAR_MOVE_MS : PIP_GROWTH_BUBBLE_MS)
  if (change === GROWTH_CHANGES.EVOLVE) {
    return reducedMotion ? [step(EVOLVING), revealed] : [step(FILLING), step(EVOLVING), revealed]
  }
  if (change === GROWTH_CHANGES.DEVOLVE && !reducedMotion) {
    return [step(DRAINING), step(SHRINKING), revealed]
  }
  return [revealed]
}

/**
 * What Pip and the bar show at a phase. Before the evolve / de-evolve the old form and its bar
 * edge show; the new form's bar starts empty (evolve) or full (de-evolve) and then settles.
 * `phase` null = a change is pending but not started yet: the last-seen state, so the bar
 * animates from where the viewer left it.
 */
export function growthView(phase, seen, growth) {
  const old = seen ?? growth
  switch (phase) {
    case null: return { form: old.form, pct: barPct(old), label: levelBarLabel(old) }
    case FILLING: return { form: old.form, pct: 100, label: levelBarLabel(old) }
    case DRAINING: return { form: old.form, pct: 0, label: levelBarLabel(old) }
    case EVOLVING: return { form: growth.form, pct: 0, label: levelBarLabel(growth) }
    case SHRINKING: return { form: growth.form, pct: 100, label: levelBarLabel(growth) }
    default: return { form: growth.form, pct: barPct(growth), label: levelBarLabel(growth) }
  }
}

export const evolvingLine = (name) => `What? ${name} is evolving!`
export const evolvedLine = (name, form) => `${name} evolved into ${PIP_FORM_NAMES[form]}! 🌱`
export const devolvedLine = (form) => `I shrank back to ${PIP_FORM_NAMES[form]} 🌱 A few good days and I'll grow again!`

/** AC 8 / AC 9: the bubble for a phase of a change, or null. */
export function growthBubble({ change, phase, petName, seen, growth }) {
  if (phase === EVOLVING) return evolvingLine(petName)
  if (phase !== REVEALED) return null
  switch (change) {
    case GROWTH_CHANGES.EVOLVE:
      return growth.fullyGrown && !seen?.fullyGrown ? PIP_FULLY_GROWN_LINE : evolvedLine(petName, growth.form)
    case GROWTH_CHANGES.DEVOLVE: return devolvedLine(growth.form)
    case GROWTH_CHANGES.SLIP: return PIP_SLIP_LINE
    default: return null
  }
}
```

- [x] **Step 3: Write `utils/pipGrowth.check.mjs`**

```js
// Run: npm run check:growth   (from foodbytes-app/client)
//
// No test runner is wired into client/package.json, so MPP-31's client-side growth rules
// (AC 5, 7, 8, 9) are pinned here. Mirrors petMood.check.mjs.
import assert from 'node:assert/strict'
import {
  GROWTH_CHANGES, barPct, growthBubble, growthChange, growthSchedule, growthView, isWilted, levelBarLabel
} from './pipGrowth.js'

const g = (over) => ({ points: 21, form: 2, barCurrent: 6, barSize: 21, fullyGrown: false, lastDayScore: 3, lastScoredDate: '2026-10-13', ...over })
const BASILISK = g({ points: 90, form: 5, barCurrent: null, barSize: null, fullyGrown: true })

// AC 5: label and pct
assert.equal(levelBarLabel(g()), 'Seedling · 6 / 21 → Sprig')
assert.equal(levelBarLabel(BASILISK), 'Fully grown 🌸')
assert.equal(levelBarLabel(null), null)
assert.equal(barPct(g()), 29)
assert.equal(barPct(BASILISK), 100)
assert.equal(barPct(null), 0)

// AC 7: wilted only when the latest scored day is a slip
assert.equal(isWilted(g({ lastDayScore: -3 })), true)
assert.equal(isWilted(g()), false)
assert.equal(isWilted(null), false)

// Changes since the last visit
assert.equal(growthChange(null, g()), null, 'first visit plays nothing')
assert.equal(growthChange(g(), g()), null)
assert.equal(growthChange(g({ form: 1, points: 12 }), g()), GROWTH_CHANGES.EVOLVE)
assert.equal(growthChange(g(), g({ form: 1, points: 12 })), GROWTH_CHANGES.DEVOLVE)
assert.equal(growthChange(g({ points: 24 }), g({ lastDayScore: -3, lastScoredDate: '2026-10-14' })), GROWTH_CHANGES.SLIP)
assert.equal(growthChange(g({ points: 18 }), g()), GROWTH_CHANGES.MOVE)

// AC 8: schedules; reduced motion keeps the bubbles only
assert.deepEqual(growthSchedule(GROWTH_CHANGES.EVOLVE, false).map(s => s.phase), ['filling', 'evolving', 'revealed'])
assert.deepEqual(growthSchedule(GROWTH_CHANGES.EVOLVE, true).map(s => s.phase), ['evolving', 'revealed'])
assert.deepEqual(growthSchedule(GROWTH_CHANGES.DEVOLVE, false).map(s => s.phase), ['draining', 'shrinking', 'revealed'])
assert.deepEqual(growthSchedule(GROWTH_CHANGES.DEVOLVE, true).map(s => s.phase), ['revealed'])
assert.deepEqual(growthSchedule(GROWTH_CHANGES.SLIP, false).map(s => s.phase), ['revealed'])

// AC 5: the bar fills to full before evolving, starts empty after, then settles
const seed = g({ points: 12, form: 1, barCurrent: 12, barSize: 15 })
assert.deepEqual(growthView(null, seed, g()), { form: 1, pct: 80, label: 'Basil seed · 12 / 15 → Seedling' })
assert.equal(growthView('filling', seed, g()).pct, 100)
assert.deepEqual(growthView('evolving', seed, g()), { form: 2, pct: 0, label: 'Seedling · 6 / 21 → Sprig' })
assert.equal(growthView('revealed', seed, g()).pct, 29)
// …and runs below empty before de-evolving, then the previous form's bar shows nearly full
const back = g({ points: 12, form: 1, barCurrent: 12, barSize: 15 })
assert.equal(growthView('draining', g(), back).pct, 0)
assert.deepEqual(growthView('shrinking', g(), back), { form: 1, pct: 100, label: 'Basil seed · 12 / 15 → Seedling' })
assert.equal(growthView('revealed', g(), back).pct, 80)

// AC 8 / AC 9: bubbles, with the pet's own name
const bubble = (change, phase, seen, growth) => growthBubble({ change, phase, petName: 'Basil', seen, growth })
assert.equal(bubble('evolve', 'evolving', seed, g()), 'What? Basil is evolving!')
assert.equal(bubble('evolve', 'revealed', g({ form: 2 }), g({ form: 3 })), 'Basil evolved into Sprig! 🌱')
assert.equal(bubble('evolve', 'revealed', g({ form: 4 }), BASILISK), "I'm fully grown! 🌸 Thank you for looking after me.")
assert.equal(bubble('devolve', 'revealed', g(), back), "I shrank back to Basil seed 🌱 A few good days and I'll grow again!")
assert.equal(bubble('slip', 'revealed', g(), g()), "Ouch, I lost a few leaves 🍂 A good day and I'll grow them back!")
assert.equal(bubble('move', 'revealed', g(), g()), null)
assert.equal(bubble('evolve', 'filling', seed, g()), null)

console.log('pipGrowth checks passed')
```

- [x] **Step 4: Add the script to `package.json`** (after `check:awards`)

```json
    "check:growth": "node src/utils/pipGrowth.check.mjs",
```

- [x] **Step 5: Run the checks**

Run: `cd foodbytes-app\client; npm run check:growth`
Expected: `pipGrowth checks passed`.

### Task 16: `pipGrowthSeenStore.js` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/pipGrowthSeenStore.js`

- [x] **Step 1: Write the store** (the `pipSeenStore.js` pattern; storage failures fall back to memory)

```js
import { PIP_GROWTH_SEEN_STORAGE_KEY } from '../constants/pipGrowth.js'

// userId → the growth this browser last finished showing. Survives route changes but not a
// reload, so with storage unavailable an evolve replays at most once per page load.
const memory = new Map()

const keyFor = (userId) => `${PIP_GROWTH_SEEN_STORAGE_KEY}.${userId}`

/**
 * MPP-31: the growth (PetGrowthDTO shape) Pip last finished showing this user here, or null for a
 * first visit. This page load's memory wins over storage, since it is always written last.
 */
export function readSeenGrowth(userId) {
  if (memory.has(userId)) return memory.get(userId)
  try {
    const raw = localStorage.getItem(keyFor(userId))
    return raw === null ? null : toGrowth(JSON.parse(raw))
  } catch {
    // Storage blocked, or a corrupt value: treat as a first visit.
    return null
  }
}

/** Records the marker in memory always, and in localStorage when it is available. */
export function writeSeenGrowth(userId, growth) {
  memory.set(userId, growth)
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(growth))
  } catch {
    // Storage disabled or full: the memory copy still stops a replay this load.
  }
}

// Only a value with a numeric form and points is a marker; anything else reads as a first visit.
function toGrowth(value) {
  return value && Number.isFinite(value.form) && Number.isFinite(value.points) ? value : null
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 17: `usePipGrowth` hook ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/usePipGrowth.js`

- [x] **Step 1: Write the hook** (the `useCookAndServe` run/timer pattern)

```js
import { useEffect, useState } from 'react'
import { PIP_DEFAULT_FORM, PIP_GROWTH_PHASES } from '../constants/pipGrowth'
import { growthBubble, growthChange, growthSchedule, growthView } from '../utils/pipGrowth'
import { readSeenGrowth, writeSeenGrowth } from '../utils/pipGrowthSeenStore'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const NO_GROWTH = { displayForm: PIP_DEFAULT_FORM, barPct: 0, barLabel: null, phase: PIP_GROWTH_PHASES.IDLE, bubble: null }

/**
 * MPP-31 AC 5 / AC 8 / AC 9: what Pip and his level bar show on /pet. When the server's growth
 * differs from what this browser last showed this user, it plays the change once: the bar runs to
 * its edge, Pip evolves (pulse) or de-evolves (shrink), then the new bar settles with a bubble.
 * A first visit plays nothing. The marker is written when the closing step starts, so leaving
 * mid-sequence replays it next time.
 *
 * @param {{ userId: number|null, growth: Object|null, petName: string|null }} input
 * @returns {{ displayForm: number, barPct: number, barLabel: string|null, phase: string, bubble: string|null }}
 */
export function usePipGrowth({ userId, growth, petName }) {
  const [run, setRun] = useState(null) // { change, seen, growth, steps, index }

  // Read during render too, so the frame before the run starts already shows the old state.
  const seen = !run && userId != null && growth ? readSeenGrowth(userId) : null
  const pending = seen ? growthChange(seen, growth) : null

  // Start only between runs, so a rerender (clock tick, refetch) can't restart one.
  useEffect(() => {
    if (run || userId == null || !growth) return
    const last = readSeenGrowth(userId)
    const change = growthChange(last, growth)
    if (!change) {
      if (!last || last.points !== growth.points || last.lastScoredDate !== growth.lastScoredDate) {
        writeSeenGrowth(userId, growth)
      }
      return
    }
    setRun({ change, seen: last, growth, steps: growthSchedule(change, prefersReducedMotion()), index: 0 })
  }, [run, userId, growth])

  // Mark seen as the closing step begins; one timer per step, cleared if /pet unmounts.
  useEffect(() => {
    if (!run) return undefined
    const step = run.steps[run.index]
    if (step.phase === PIP_GROWTH_PHASES.REVEALED) writeSeenGrowth(userId, run.growth)
    const timerId = setTimeout(() => {
      setRun(current => (current && current.index + 1 < current.steps.length
        ? { ...current, index: current.index + 1 }
        : null))
    }, step.ms)
    return () => clearTimeout(timerId)
  }, [run, userId])

  if (!growth) return NO_GROWTH

  if (run) {
    const { phase } = run.steps[run.index]
    const view = growthView(phase, run.seen, run.growth)
    return {
      displayForm: view.form,
      barPct: view.pct,
      barLabel: view.label,
      phase,
      bubble: growthBubble({ change: run.change, phase, petName, seen: run.seen, growth: run.growth })
    }
  }

  const view = growthView(pending ? null : PIP_GROWTH_PHASES.IDLE, seen, growth)
  return { displayForm: view.form, barPct: view.pct, barLabel: view.label, phase: PIP_GROWTH_PHASES.IDLE, bubble: null }
}

// Read once per run; the CSS also stops movement on its own.
const prefersReducedMotion = () => window.matchMedia?.(REDUCED_MOTION_QUERY).matches === true

export default usePipGrowth
```

- [x] **Step 2: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\hooks\usePipGrowth.js | Measure-Object -Line).Lines`
Expected: `built in <n>s`; line count < 200.

### Task 18: Expose `growth` from `PetContext` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/contexts/PetContext.jsx:165-178` (the `value` object) and its Javadoc
- Modify: `foodbytes-app/client/src/services/petService.js:5-9` (JSDoc)

- [x] **Step 1: Add `growth` to the context value**

In the `value` object, after `petName`:

```js
    growth: pet?.growth ?? null,
```

Add to the provider's comment block:

```js
 * MPP-31: `growth` (PetGrowthDTO: points, form, barCurrent, barSize, fullyGrown, lastDayScore,
 * lastScoredDate) — your own Pip's herb form, straight from the pet payload; null until it loads.
```

- [x] **Step 2: Update the `getPet` JSDoc in `petService.js`**

```js
   * @returns {Promise<{ name: string, customName: boolean, mealTimes: Object, growth: { points: number, form: number, barCurrent: number|null, barSize: number|null, fullyGrown: boolean, lastDayScore: number, lastScoredDate: string|null } }>} PetDTO
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 19: `PipLevelBar` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/PipLevelBar.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/PipLevelBar.css`

- [x] **Step 1: Write the component**

```jsx
import { PIP_GROWTH_PHASES } from '../../../constants/pipGrowth'
import './PipLevelBar.css'

// The new form's bar jumps to its starting edge without animating backwards (AC 5).
const INSTANT_PHASES = [PIP_GROWTH_PHASES.EVOLVING, PIP_GROWTH_PHASES.SHRINKING]

/**
 * MPP-31 AC 5: the green level bar under Pip, e.g. "Seedling · 6 / 21 → Sprig" or "Fully grown 🌸".
 * Width changes animate (CSS transition) except when a new form's bar starts.
 */
function PipLevelBar({ label, pct, phase }) {
  const instant = INSTANT_PHASES.includes(phase)
  return (
    <div className="pip-level">
      <p className="pip-level-label" aria-hidden="true">{label}</p>
      <div
        className="pip-level-track"
        role="progressbar"
        aria-label="Growth"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={label}
      >
        <div className={instant ? 'pip-level-fill is-instant' : 'pip-level-fill'} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default PipLevelBar
```

- [x] **Step 2: Write the CSS**

```css
/* MPP-31 AC 5: Pip's level bar, under the room scene. */

.pip-level {
  padding: 8px 16px 12px;
  background: #fff;
}

.pip-level-label {
  margin: 0 0 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2f4a22;
}

.pip-level-track {
  height: 10px;
  border-radius: 999px;
  background: #e3f1d8;
  overflow: hidden;
}

.pip-level-fill {
  height: 100%;
  border-radius: inherit;
  background: #5fae3e;
  transition: width 0.9s ease-in-out;
}

.pip-level-fill.is-instant {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .pip-level-fill {
    transition: none;
  }
}
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 20: Wire growth through `PetRoom` and `PetView` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx:28,63,79,98-122`
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx`

- [x] **Step 1: `PetRoom` — accept `herb` and `levelBar`**

Add the import `import PipLevelBar from './PipLevelBar'`. Extend the signature with `herb = undefined, levelBar = null` (RoomPip supplies the default herb) and the header comment with "MPP-31: `herb` ({ form, wilted, phase }) draws Pip's current herb form; `levelBar` ({ label, pct, phase }) renders the green bar under the scene." Pass `herb` to every `RoomPip`:
- the walker: `<PipWalker phase={phase}>{!asleep && <RoomPip pose={pose} herb={herb} />}</PipWalker>`
- `<Station … herb={herb} />` and inside `Station`, add `herb` to its props and render `<RoomPip pose={pose} herb={herb} />` for the bed.

Directly after the closing `</div>` of `.pip-room-scene` (before the overlays):

```jsx
      {levelBar && <PipLevelBar label={levelBar.label} pct={levelBar.pct} phase={levelBar.phase} />}
```

The bar sits inside `.pip-room` but outside the `inert` scene wrapper; it needs no `inert` of its own because the progressbar contains no focusable element.

- [x] **Step 2: `PetView` — the growth sequence and bubble priority**

Add imports:

```jsx
import usePipGrowth from '../../hooks/usePipGrowth'
import { isWilted } from '../../utils/pipGrowth'
```

Before the early returns, after `useCookAndServe`:

```jsx
  const growth = usePipGrowth({ userId: petUserId, growth: pet?.growth ?? null, petName: pet?.name ?? null })
```

Replace the priority block with:

```jsx
  // Cook scene > growth (evolve / de-evolve / fully grown / slip) > check-in > new award >
  // fridge-low > mood. A growth line hides the check-in until it has said its piece (MPP-31).
  const growthLine = serving ? null : growth.bubble
  const asking = serving || growthLine ? null : checkIn
  const award = serving || growthLine ? null : awards.announcement
  const checkInLine = asking && award ? [award, asking.prompt].filter(Boolean).join(' ') : asking?.text
  const bubble = (serving && cookServeBubble(serving)) ?? growthLine ?? checkInLine ?? award ?? fridgeBubble(fridge.fill, position) ?? petBubble(moodInfo)
  const bubbleActions = asking?.actions ? <CheckInActions {...asking.actions} /> : null
  const herb = { form: growth.displayForm, wilted: isWilted(pet.growth), phase: growth.phase }
  const levelBar = growth.barLabel ? { label: growth.barLabel, pct: growth.barPct, phase: growth.phase } : null
```

Pass `herb={herb}` and `levelBar={levelBar}` to `<PetRoom>`. Add "MPP-31: Pip's herb form, level bar, wilt and the evolve / de-evolve sequence (usePipGrowth)." to the component comment.

- [x] **Step 3: Build and measure the touched components**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines; (Get-Content src\components\pet\PetView.jsx | Measure-Object -Line).Lines`
Expected: `built in <n>s`; PetRoom < 220 lines, PetView < 130 lines (both well under 400).

### Task 21: Manual check on `/pet`, the footer and the meal reaction — manual browser check, pending developer (Ready for Test)

- Skill: react-frontend

**Files:**
- (none — visual verification only; tune `miniViewBox` values in `herbForms.js` if a crop is off)

- [ ] **Step 1: Start the stack against the local DB**

Run (two terminals, from the repo root): `cd foodbytes-app\foodbytes-api; mvn spring-boot:run` (with the env setup from `CLAUDE.md` → "Running the backend locally with Google login") and `cd foodbytes-app\client; npm run dev`.
Expected: backend `Started FoodbytesApiApplication`; Vite on `http://localhost:5173`. Hibernate validation passes (proves Task 2 applied).

- [ ] **Step 2: Default state**

Open `http://localhost:5173/pet` signed in, phone width (375px, DevTools device mode).
Expected: the Basil seed (cracked seed with feet) on the rug; under the room a green bar labelled `Basil seed · <n> / 15 → Seedling`; no horizontal scroll. Footer Pet tab shows the mini seed; it does not show a bar. Tick a meal on `/mealplan`: the reaction line shows the mini herb.

- [ ] **Step 3: Each form, mood and wilt**

With React DevTools (Components tab) on `/pet`, select `PetRoom` and edit its `herb` prop: `form` 1 → 5 in turn, then `wilted` true / false at each form. Select `PipHerb` under the footer's Pet tab and edit its `form` prop 1 → 5 the same way. No source edits.
Expected: Seedling (round sprout, two leaves), Sprig (pear, leaf arms, three head leaves), Bushling (round, leaf arms, crown), Basilisk (big body, vine arms, swept crown, pink bloom, confident face on content/happy). Wilted: leaves droop, colours fade, Basilisk's vines hang and the bloom closes to a bud. Every form stands on its feet on the rug, at the cooker and lies correctly in bed (cooker / bed times via your meal times). Mini crops show each whole form in the footer at 30px without clipping.

- [ ] **Step 4: Evolve and de-evolve sequences**

In the console, set a stale marker so the next visit sees a change: `localStorage.setItem('foodbytes.pip.lastSeenGrowth.<id>', JSON.stringify({points:0,form:1,barCurrent:0,barSize:15,fullyGrown:false,lastDayScore:0,lastScoredDate:null}))` with the server at form ≥ 2 (or React DevTools on the hook), then reload `/pet`. For de-evolve, store a marker with a higher form than the server's.
Expected (evolve): bar fills to full → white pulse with "What? <name> is evolving!" → new form, bar from empty to current, "<name> evolved into <Form>! 🌱" for ~8 s. De-evolve: bar drains → gentle shrink → previous form, bar from full to current, "I shrank back to <Form> 🌱 …". With OS reduced motion on: no pulse, shrink or bar animation; the bubbles still show. Reloading after the closing line plays nothing.

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

Read the current version from `foodbytes-app/client/package.json`. MPP-31 is a **Story** → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-31: Pip evolves through five herb forms on a +3/−3 daily score, with a level bar, wilt and evolve / de-evolve animations`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references ✓

- Skill: none — verification only

- [x] **Step 1: No Mochi left in the client**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.css | Select-String -Pattern "mochi|Mochi|MOCHI"`
Expected: zero hits.

- [x] **Step 2: No unported placeholders or debug logging in the new files**

Run: `Get-ChildItem -Path foodbytes-app\client\src\components\pet\herb, foodbytes-app\client\src\hooks\usePipGrowth.js, foodbytes-app\client\src\utils\pipGrowth.js, foodbytes-app\client\src\utils\pipGrowthSeenStore.js, foodbytes-app\client\src\components\pet\room\PipLevelBar.jsx -Recurse -Include *.js,*.jsx | Select-String -Pattern "/\* port|console\.(log|debug)|TODO"`
Expected: zero hits.

- [x] **Step 3: Client checks still pass**

Run: `cd foodbytes-app\client; npm run check:growth; npm run check:pet; npm run check:room`
Expected: each prints its "passed" line, exit code 0.

### Task M.3: Run the full backend test suite ✓

- Skill: none — verification only

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors (count = previous total + the two new classes).

### Task M.4: Production build ✓

- Skill: none — verification only

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task M.5: Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-31-pip-herb-evolution/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary: server-side growth (`PetGrowthPolicy` / `PetGrowthService`, `growth` on `GET /api/pet` and `PUT /api/pet/name`), the herb component replacing Mochi, the level bar, wilt, evolve / de-evolve and bubbles; the new version from Task M.1.
- Migration: `2026-10-14-mpp31-user-pet-fully-grown-at.sql` — applied locally; Railway at MPP-15 epic merge, row 5 of `railway-migrations.md`, before the merged backend deploys.
- Verification results: `mvn test`, `npm run build`, `npm run check:growth`, and the Task 21 manual checks (which forms / states were seen).
- Convention note: Pip's form is server-computed; clients name forms and play transitions only. `PIP_FORM_ANCHORS` in `herb/herbForms.js` is the contract MPP-32 draws clothes against.
- Suggested commit subject: `MPP-31: Pip evolves through five herb forms with a level bar`

---

## Self-review

**Spec coverage:**
- Daily score, running total, form, bar and `fullyGrownAt` API + migration — Tasks 1–8.
- Backend tests for every AC 4 case (boundaries both ways, floor, slip after evolve, Basilisk never de-evolves, backdated re-score, unscored days, two linked users) — Tasks 5, 7.
- Five-form herb component replacing Mochi everywhere — Tasks 9–14.
- Anchor points for MPP-32 — Task 10 (`PIP_FORM_ANCHORS`).
- Level bar — Tasks 15, 19, 20.
- Wilted look — Tasks 13 (CSS + droop), 15 (`isWilted`), 14/20 (wired in footer, reaction, room).
- Evolve / de-evolve animations + reduced motion — Tasks 13, 15, 17, 20.
- Never-shaming bubbles + bubble priority — Tasks 15, 20.
- Mood faces on every form, mini crops — Tasks 11, 10, 21.
- Version bump, CHANGELOG, Railway batch row — Tasks M.1, 1.

**Placeholder scan:** No `TBD`, `TODO` or "similar to Task N". Tasks 11 and 12 deliberately mark mockup bodies to port with `/* port … */` comments, pinned to exact source line ranges and conversion rules; each task ends with a grep that fails if any survives, and Task M.2 repeats it.

**Type / name consistency:** `PetGrowthDTO` fields (`points, form, barCurrent, barSize, fullyGrown, lastDayScore, lastScoredDate`) match `plan.md` Data shapes, the check script and the JSDoc. `PetGrowthPolicy.{dayScore, replay, formFor, reachedBasilisk, toDTO, Replay, FORM_THRESHOLDS}`, `PetGrowthService.growth(User)`, `UserRepository.markPetFullyGrown(Long, LocalDateTime)` and `PetHabitDayRepository.findByUserIdAndDayBeforeOrderByDayAsc(Long, LocalDate)` are used identically across Tasks 3–8. Frontend: `PIP_FORMS`, `PIP_FORM_NAMES`, `PIP_DEFAULT_FORM`, `PIP_GROWTH_PHASES`, `PIP_SLIP_SCORE`, `PIP_GROWTH_SEEN_STORAGE_KEY`, `HERB_FORMS` / `herbForm` / `HERB_FOOT_X` / `HERB_FOOT_Y` / `HERB_FULL_VIEWBOX` / `HERB_INK` / `PIP_FORM_ANCHORS`, `ROOM_INK`, and the props `herb { form, wilted, phase }` and `levelBar { label, pct, phase }` are consistent from Tasks 9–21. Additions beyond `plan.md` Data shapes, introduced by the tasks that use them: `PIP_BAR_MOVE_MS`, `herbForm()`, `HERB_FOOT_X`, `GROWTH_CHANGES`, `growthSchedule`, `growthView`, `growthBubble`, and the `check:growth` script.

**Phase boundary cleanliness:**
- Phase 1: column added, applied locally and mapped, with nothing reading it; build green.
- Phase 2: API returns growth, pet tests green; the frontend ignores the extra field.
- Phase 3: herb renders at form 1 everywhere, Mochi deleted with no dangling imports, build green. Task 10 creates `constants/pipGrowth.js` and the `isWilted`-only `utils/pipGrowth.js` first, so Tasks 11–14 never import anything that doesn't exist yet.
- Phase 4: growth flows end-to-end; build and `check:growth` green.
- Phase 5: verification only.
