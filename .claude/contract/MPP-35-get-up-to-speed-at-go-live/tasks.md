# Tasks: Get up to speed at go-live: carry over ticked meals, and ask once when you last snacked and drank

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-14

**Goal:** At go-live, copy the old shared ticks into per-person ticks (owner only, sealed by the later MPP-24/25 backfills), and ask each person once, per habit, when they last had a snack / a drink, crediting up to 30 clean days.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-14-mpp35-carry-over-shared-ticks.sql` — idempotent copy of `eaten = 1` into `meal_plan_entry_eaten`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/HabitFirstAnswerRequest.java` — `{ lastDate }` body for the one-time question

**Modified:**
- `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` — new row 2, rows renumbered 3–10
- `foodbytes-app/database/mpp15-railway-golive.sql` — regenerated
- `foodbytes-app/database/migrations/2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql` — header comment only
- `foodbytes-app/database/migrations/2026-10-13-mpp22-pet-awards.sql` — header comment only (order 3 → 4)
- `foodbytes-app/database/migrations/2026-10-13-mpp24-pet-firsts.sql` — header comment only (order 4 → 5)
- `foodbytes-app/database/migrations/2026-10-14-mpp25-pet-sprinkles.sql` — header comment only (order 7 → 8, Railway sentence)
- `foodbytes-app/database/migrations/2026-10-14-mpp32-pet-wardrobe.sql` — header comment only (order 6 → 7)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/HabitStreakPolicy.java` — first-answer window rules
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/HabitStreakService.java` — `firstAnswer`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetHabitController.java` — `POST /{habit}/first-answer`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/HabitStreakPolicyTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/HabitStreakServiceTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetHabitControllerTest.java`
- `foodbytes-app/client/src/constants/pet.js` — `CHECKIN_STEPS.FIRST`, first-answer constants
- `foodbytes-app/client/src/utils/habitCheckIn.js` — `isFirstAnswer`, `firstAnswerEarliestISO`, `firstQuestionText`, `stepFor`
- `foodbytes-app/client/src/utils/habitCheckIn.check.mjs` — asserts for the above
- `foodbytes-app/client/src/services/habitService.js` — `firstAnswerHabit`
- `foodbytes-app/client/src/hooks/useHabitCheckIn.js` — `FIRST` step, `onFirstSave`, `earliest`
- `foodbytes-app/client/src/components/pet/room/CheckInActions.jsx` — first-answer controls
- `foodbytes-app/client/src/components/pet/room/CheckInActions.css` — `.pip-checkin-hint`
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump
- Jira MPP-33 description — AC 1 note

**Deleted:** (none)

---

## Phase 1 — Go-live tick carry-over (SQL only)

Writes the copy migration, slots it in at go-live row 2, refreshes the headers that would otherwise be false, and proves it on the local DB. No Java or JS changes, so the build is untouched; the boundary is `build-golive.mjs --check` green and the local DB showing copied + sealed ticks.

### Task 1: Write the carry-over migration ✓

- Skill: `java-backend` (migration mechanics)

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-14-mpp35-carry-over-shared-ticks.sql`

- [x] **Step 1: Create the file with this exact content**

```sql
-- MPP-35: carry the old shared eaten ticks into MPP-33's per-person tick table at go-live.
--
-- Copies every meal_plan_entries row with eaten = 1 into meal_plan_entry_eaten, credited to the
-- entry's own user_id (the plan owner) and never to linked partners - the old ticks never recorded
-- who ticked (MPP-35 AC 1). eaten_at is the old eaten_at, else created_at, else the plan date.
--
-- Order is load-bearing: this runs straight after MPP-33 creates the table (go-live row 2) and
-- before MPP-24 (firsts) and MPP-25 (sprinkles), whose backfills then seal the copied ticks
-- (COOK_HOMEMADE_EXTRA, MEAL_EATEN 10, HOMEMADE_EXTRA 5). Run after MPP-25 and an untick/re-tick
-- of a copied meal would pay sprinkles.
--
-- Lossless: only INSERTs into meal_plan_entry_eaten; no existing row is changed, and the old
-- eaten / eaten_at columns stay until the follow-up cleanup. Live evidence (Railway, read-only,
-- 2026-10-14): 7 rows with eaten = 1, all user 1 (12 and 13 Oct B/L/D, 14 Oct breakfast), none with
-- a NULL eaten_at -> 70 MEAL_EATEN sprinkles once MPP-25 runs. Reads the column at go-live time, so
-- ticks made before the merge are included. Re-running is a no-op (uk_mpe_eaten_entry_user).
--
-- MPP-15 is local-first: applied to the local foodbytes-db now; listed as order 2 in
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

INSERT INTO meal_plan_entry_eaten (meal_plan_entry_id, user_id, eaten_at)
SELECT e.id, e.user_id, COALESCE(e.eaten_at, e.created_at, TIMESTAMP(e.plan_date))
FROM meal_plan_entries e
WHERE e.eaten = 1
ON DUPLICATE KEY UPDATE meal_plan_entry_eaten.id = meal_plan_entry_eaten.id;
```

- [x] **Step 2: Confirm the file exists**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-10-14-mpp35-carry-over-shared-ticks.sql`
Expected: one file listed.

### Task 2: Slot it into the tracker at row 2, fix stale headers, regenerate go-live ✓

- Skill: `java-backend` (migration mechanics)

**Files:**
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` (the table)
- Modify: `foodbytes-app/database/migrations/2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql:7-9`
- Modify: `foodbytes-app/database/migrations/2026-10-13-mpp22-pet-awards.sql:16`
- Modify: `foodbytes-app/database/migrations/2026-10-13-mpp24-pet-firsts.sql:18`
- Modify: `foodbytes-app/database/migrations/2026-10-14-mpp25-pet-sprinkles.sql:18-19,22`
- Modify: `foodbytes-app/database/migrations/2026-10-14-mpp32-pet-wardrobe.sql:23-24`
- Modify: `foodbytes-app/database/mpp15-railway-golive.sql` (regenerated, never hand-edited)

- [x] **Step 1: Replace the tracker table with the renumbered one**

```markdown
| Order | Ticket | File | Applied locally | Applied to Railway |
|---|---|---|---|---|
| 1 | MPP-33 | foodbytes-app/database/migrations/2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql | 2026-10-13 | — |
| 2 | MPP-35 | foodbytes-app/database/migrations/2026-10-14-mpp35-carry-over-shared-ticks.sql | 2026-10-14 | — |
| 3 | MPP-20 | foodbytes-app/database/migrations/2026-10-13-mpp20-pet-habit-streaks.sql | 2026-10-13 | — |
| 4 | MPP-22 | foodbytes-app/database/migrations/2026-10-13-mpp22-pet-awards.sql | 2026-10-13 | — |
| 5 | MPP-24 | foodbytes-app/database/migrations/2026-10-13-mpp24-pet-firsts.sql | 2026-10-13 | — |
| 6 | MPP-31 | foodbytes-app/database/migrations/2026-10-14-mpp31-user-pet-fully-grown-at.sql | 2026-10-14 | — |
| 7 | MPP-32 | foodbytes-app/database/migrations/2026-10-14-mpp32-pet-wardrobe.sql | 2026-10-14 | — |
| 8 | MPP-25 | foodbytes-app/database/migrations/2026-10-14-mpp25-pet-sprinkles.sql | 2026-10-14 | — |
| 9 | MPP-26 | foodbytes-app/database/migrations/2026-10-14-mpp26-pet-station-levels.sql | 2026-10-14 | — |
| 10 | MPP-27 | foodbytes-app/database/migrations/2026-10-14-mpp27-pet-room-decor.sql | 2026-10-14 | — |
```

- [x] **Step 2: MPP-33 header — point the "not carried over" note at MPP-35**

Replace the sentence starting `-- Purely additive and lossless for existing data: no column or row changes. Existing shared ticks` through `-- ticks for themselves from now on.` with:

```sql
-- Purely additive and lossless for existing data: no column or row changes. This file does not
-- carry the existing shared ticks (meal_plan_entries.eaten / eaten_at) over; MPP-35's go-live step
-- (order 2) copies them to each entry's plan owner straight after this table is created.
```

Leave the following `Live counts at planning (2026-10-13): …` sentence intact.

- [x] **Step 3: Renumber the "listed as order N" comments**

- `mpp22-pet-awards.sql`: `listed as order 3 in` → `listed as order 4 in`
- `mpp24-pet-firsts.sql`: `listed as order 4 in` → `listed as order 5 in`
- `mpp25-pet-sprinkles.sql`: `listed as order 7 in` → `listed as order 8 in`
- `mpp32-pet-wardrobe.sql`: `order 6 in .claude/contract/` → `order 7 in .claude/contract/`

- [x] **Step 4: MPP-25 header — correct the Railway sentence**

Replace the two lines `-- (ON DUPLICATE KEY UPDATE id = id). On Railway the per-person tick table is created empty by` and `-- MPP-33, so the backfill inserts nothing there.` with:

```sql
-- (ON DUPLICATE KEY UPDATE id = id). On Railway, MPP-35 (order 2) has copied the old shared ticks
-- into the per-person table first, so this backfill seals them: 7 ticks -> 70 sprinkles for user 1.
```

- [x] **Step 5: Regenerate the go-live file**

Run: `node foodbytes-app/database/build-golive.mjs`
Expected: `Wrote …mpp15-railway-golive.sql (10 migrations)`, exit 0.

- [x] **Step 6: Check it**

Run: `node foodbytes-app/database/build-golive.mjs --check`
Expected: `Go-live OK: 10 migrations`

- [x] **Step 7: Confirm the order inside the generated file**

Run: `Select-String -Path foodbytes-app\database\mpp15-railway-golive.sql -Pattern "^--   \d+\. MPP-"`
Expected: lines `1. MPP-33`, `2. MPP-35`, `3. MPP-20`, … `10. MPP-27` in that order.

### Task 3: Apply locally against seeded ticks and verify the seal ✓

- Skill: none — DBA operation against the local `foodbytes-db` (MPP-15 local-first; Railway is not touched)

**Files:** (none — local data only)

- [x] **Step 1: Pick a local plan owner with past entries**

Run: `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SELECT user_id, COUNT(*) n FROM meal_plan_entries WHERE plan_date < CURDATE() GROUP BY user_id ORDER BY n DESC LIMIT 1;"`
Expected: one row; use its `user_id` as `U` below.

- [x] **Step 2: Seed three old shared ticks (two with eaten_at, one NULL to exercise the fallback)**

Run (substitute `U`):
```
docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "UPDATE meal_plan_entries e JOIN (SELECT x.id FROM meal_plan_entries x JOIN meals m ON m.id = x.meal_id WHERE x.user_id = U AND x.plan_date < CURDATE() AND m.key IN ('breakfast','lunch','dinner') ORDER BY x.plan_date DESC, x.id LIMIT 3) s ON s.id = e.id SET e.eaten = 1, e.eaten_at = TIMESTAMP(e.plan_date) + INTERVAL 20 HOUR; UPDATE meal_plan_entries SET eaten_at = NULL WHERE eaten = 1 ORDER BY id LIMIT 1; SELECT id, user_id, plan_date, eaten_at FROM meal_plan_entries WHERE eaten = 1;"
```
Expected: 3 rows, one with `eaten_at` NULL.

- [x] **Step 3: Apply the migration**

Run: `cmd /c "docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app\database\migrations\2026-10-14-mpp35-carry-over-shared-ticks.sql"`
Expected: no error.

- [x] **Step 4: Verify the copy (owner, eaten_at fallback)**

Run: `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SELECT e.id, e.user_id AS owner, t.user_id AS ticker, e.eaten_at AS old_at, e.created_at, t.eaten_at AS new_at FROM meal_plan_entries e JOIN meal_plan_entry_eaten t ON t.meal_plan_entry_id = e.id WHERE e.eaten = 1;"`
Expected: 3 rows, `ticker = owner = U`; `new_at = old_at` for the two seeded with a time; `new_at = created_at` for the NULL one.

- [x] **Step 5: Re-run the migration — idempotent**

Run: the Step 3 command again, then `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SELECT COUNT(*) FROM meal_plan_entry_eaten t JOIN meal_plan_entries e ON e.id = t.meal_plan_entry_id WHERE e.eaten = 1;"`
Expected: no error; count still 3.

- [x] **Step 6: Re-run MPP-24 and MPP-25 to reproduce go-live order, then verify the seal**

Run:
```
cmd /c "docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app\database\migrations\2026-10-13-mpp24-pet-firsts.sql"
cmd /c "docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app\database\migrations\2026-10-14-mpp25-pet-sprinkles.sql"
docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SELECT s.user_id, s.source_type, s.source_id, s.amount FROM pet_sprinkles s JOIN meal_plan_entries e ON e.id = s.source_id WHERE e.eaten = 1 ORDER BY s.source_id, s.source_type;"
```
Expected: no error; a `MEAL_EATEN 10` row for user `U` on each of the two entries whose `eaten_at` is the plan date + 20 h (plus `HOMEMADE_EXTRA 5` where the recipe has a homemade extra). The NULL-fallback entry gets one only if its `created_at` local date is on/after its `plan_date` (the existing MPP-25 payable rule) — record what you see in the PR description.

- [x] **Step 7: Mark the tracker row applied locally**

The row added in Task 2 already says `2026-10-14` under "Applied locally". Confirm with `Select-String -Path .claude\contract\MPP-15-epic-breakdown\railway-migrations.md -Pattern "\| 2 \| MPP-35"` → one hit.

---

## Phase 2 — Backend: one-time "when did you last…" answer

Adds the pure window rules, the service method and the endpoint, each with tests. Purely additive: `/answer` and `HabitStatusDTO` are unchanged, so every phase boundary compiles and the existing tests still pass.

### Task 4: First-answer window rules in HabitStreakPolicy ✓

- Skill: `java-backend`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/HabitStreakPolicy.java` (after `requireLapseInWindow`)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/HabitStreakPolicyTest.java`

- [x] **Step 1: Write the failing tests** (append to `HabitStreakPolicyTest`; `TODAY` is the class's existing constant)

```java
    @Test
    void firstAnswerEarliest_isThirtyDaysBack() {
        assertThat(HabitStreakPolicy.firstAnswerEarliest(TODAY)).isEqualTo(TODAY.minusDays(30));
    }

    @Test
    void requireFirstAnswerInWindow_acceptsTodayAndTheThirtyDayFloor() {
        HabitStreakPolicy.requireFirstAnswerInWindow(TODAY, TODAY);
        HabitStreakPolicy.requireFirstAnswerInWindow(TODAY.minusDays(30), TODAY);
    }

    @Test
    void requireFirstAnswerInWindow_rejectsFuture() {
        assertThatThrownBy(() -> HabitStreakPolicy.requireFirstAnswerInWindow(TODAY.plusDays(1), TODAY))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("lastDate cannot be in the future");
    }

    @Test
    void requireFirstAnswerInWindow_rejectsOlderThanThirtyDays() {
        assertThatThrownBy(() -> HabitStreakPolicy.requireFirstAnswerInWindow(TODAY.minusDays(31), TODAY))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("lastDate must be on or after " + TODAY.minusDays(30));
    }

    @Test
    void firstAnswerLogFrom_isTheLapseInsideTheWindow_elseTheWindowStart() {
        assertThat(HabitStreakPolicy.firstAnswerLogFrom(TODAY.minusDays(5), TODAY)).isEqualTo(TODAY.minusDays(5));
        assertThat(HabitStreakPolicy.firstAnswerLogFrom(TODAY.minusDays(29), TODAY)).isEqualTo(TODAY.minusDays(29));
        assertThat(HabitStreakPolicy.firstAnswerLogFrom(TODAY.minusDays(30), TODAY)).isEqualTo(TODAY.minusDays(29));
    }
```

Add `import static org.assertj.core.api.Assertions.assertThatThrownBy;` if the class lacks it.

- [x] **Step 2: Run — expect a compile failure**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HabitStreakPolicyTest`
Expected: `COMPILATION ERROR` — `cannot find symbol firstAnswerEarliest`.

- [x] **Step 3: Implement** (insert after `requireLapseInWindow`)

```java
    /** MPP-35: how far back the one-time "when did you last…?" answer may reach, and the most clean days it logs. */
    public static final int FIRST_ANSWER_DAYS = 30;

    /** MPP-35: the earliest last-lapse date the one-time question accepts (today - 30). */
    public static LocalDate firstAnswerEarliest(LocalDate today) {
        return today.minusDays(FIRST_ANSWER_DAYS);
    }

    /** MPP-35: a one-time last-lapse date must fall in firstAnswerEarliest..today. */
    public static void requireFirstAnswerInWindow(LocalDate lastDate, LocalDate today) {
        if (lastDate.isAfter(today)) {
            throw new IllegalArgumentException("lastDate cannot be in the future");
        }
        LocalDate earliest = firstAnswerEarliest(today);
        if (lastDate.isBefore(earliest)) {
            throw new IllegalArgumentException("lastDate must be on or after " + earliest);
        }
    }

    /**
     * MPP-35: first day the one-time answer logs. Days are logged only in the 30-day window
     * today-29..today, so the floor date (today-30, "30 days or longer") logs 30 clean days and no
     * lapse row, and the run stays inside one award ladder cycle (AwardLadder.CYCLE).
     */
    public static LocalDate firstAnswerLogFrom(LocalDate lastDate, LocalDate today) {
        LocalDate windowStart = today.minusDays(FIRST_ANSWER_DAYS - 1);
        return lastDate.isBefore(windowStart) ? windowStart : lastDate;
    }
```

- [x] **Step 4: Run — expect green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HabitStreakPolicyTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 5: HabitFirstAnswerRequest DTO ✓

- Skill: `java-backend`

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/HabitFirstAnswerRequest.java`

- [x] **Step 1: Create the DTO**

```java
package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * MPP-35: the one-time answer to "When did you last have a snack / a drink?". lastDate is the last
 * lapse day: null = "Can't remember", today = "Today", otherwise today-30..today. The window is
 * checked in HabitStreakPolicy#requireFirstAnswerInWindow, which knows today.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HabitFirstAnswerRequest {

    private LocalDate lastDate;
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exit 0, no output.

### Task 6: HabitStreakService.firstAnswer ✓

- Skill: `java-backend`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/HabitStreakService.java` (new method after `answer`, before `logDays`)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/HabitStreakServiceTest.java`

- [x] **Step 1: Write the failing tests** (append; reuse the class's `stubRow`, `savedDays`, `d()`, `TODAY` = 13 Oct, `USER_ID`)

```java
    private static HabitFirstAnswerRequest lastOn(LocalDate day) {
        return new HabitFirstAnswerRequest(day);
    }

    @Test
    void firstAnswer_cantRemember_startsTheStreakToday() {
        PetHabitStreak row = stubRow(null, 0, null);

        HabitStatusDTO dto = service.firstAnswer(USER_ID, Habit.SNACK, lastOn(null));

        verify(streakRepository).ensureRow(USER_ID, "SNACK");
        assertThat(savedDays()).extracting(PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(TODAY, true));
        assertThat(row.getStreakStart()).isEqualTo(TODAY);
        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.SNACK, 1, 1, TODAY, false, TODAY.plusDays(1)));
        verify(streakRepository).save(row);
    }

    @Test
    void firstAnswer_today_logsTodayAsTheLapse() {
        PetHabitStreak row = stubRow(null, 0, null);

        HabitStatusDTO dto = service.firstAnswer(USER_ID, Habit.SNACK, lastOn(TODAY));

        assertThat(savedDays()).extracting(PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(TODAY, false));
        assertThat(row.getStreakStart()).isEqualTo(TODAY.plusDays(1));
        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.SNACK, 0, 0, TODAY, false, TODAY.plusDays(1)));
    }

    @Test
    void firstAnswer_fiveDaysAgo_logsTheLapseThenFiveCleanDays() {
        PetHabitStreak row = stubRow(null, 0, null);

        HabitStatusDTO dto = service.firstAnswer(USER_ID, Habit.SNACK, lastOn(d(8)));

        assertThat(savedDays()).extracting(PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(d(8), false), tuple(d(9), true), tuple(d(10), true),
                        tuple(d(11), true), tuple(d(12), true), tuple(d(13), true));
        assertThat(row.getStreakStart()).isEqualTo(d(9));
        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.SNACK, 5, 5, TODAY, false, TODAY.plusDays(1)));
    }

    @Test
    void firstAnswer_thirtyDayFloor_capsTheRunAtThirtyCleanDaysWithNoLapseRow() {
        PetHabitStreak row = stubRow(null, 0, null);

        HabitStatusDTO dto = service.firstAnswer(USER_ID, Habit.SNACK, lastOn(TODAY.minusDays(30)));

        List<PetHabitDay> days = savedDays();
        assertThat(days).hasSize(30).allMatch(day -> Boolean.TRUE.equals(day.getClean()));
        assertThat(days.get(0).getDay()).isEqualTo(TODAY.minusDays(29));
        assertThat(row.getStreakStart()).isEqualTo(TODAY.minusDays(29));
        assertThat(dto.getCurrent()).isEqualTo(30);
        assertThat(dto.getBest()).isEqualTo(30);
    }

    @Test
    void firstAnswer_thirtyDayFloor_earnsAtMostOneAwardLadderCycle() {
        stubRow(null, 0, null);

        service.firstAnswer(USER_ID, Habit.SNACK, lastOn(TODAY.minusDays(30)));

        SortedMap<LocalDate, StreakRuns.DayOutcome> log = new TreeMap<>();
        savedDays().forEach(day -> log.put(day.getDay(),
                Boolean.TRUE.equals(day.getClean()) ? StreakRuns.DayOutcome.COUNTS : StreakRuns.DayOutcome.BREAKS));
        List<AwardLadder.AwardKey> awards = StreakRuns.summarise(log).runs().stream()
                .flatMap(run -> AwardLadder.awardsFor(StreakType.SNACK, run).stream())
                .toList();
        assertThat(awards).extracting(AwardLadder.AwardKey::cycleIndex).containsOnly(0);
        assertThat(awards).extracting(AwardLadder.AwardKey::milestone).containsExactlyInAnyOrderElementsOf(AwardLadder.MILESTONES);
    }

    @Test
    void firstAnswer_olderThanThirtyDays_isRejectedAndWritesNothing() {
        stubRow(null, 0, null);

        assertThatThrownBy(() -> service.firstAnswer(USER_ID, Habit.SNACK, lastOn(TODAY.minusDays(31))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("lastDate must be on or after " + TODAY.minusDays(30));
        verify(dayRepository, never()).saveAll(any());
        verify(streakRepository, never()).save(any());
    }

    @Test
    void firstAnswer_future_isRejected() {
        stubRow(null, 0, null);

        assertThatThrownBy(() -> service.firstAnswer(USER_ID, Habit.SNACK, lastOn(TODAY.plusDays(1))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("lastDate cannot be in the future");
        verify(dayRepository, never()).saveAll(any());
    }

    @Test
    void firstAnswer_onceAnswered_isRefused() {
        stubRow(d(10), 3, d(12));

        assertThatThrownBy(() -> service.firstAnswer(USER_ID, Habit.SNACK, lastOn(null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("SNACK has already been answered");
        verify(dayRepository, never()).saveAll(any());
        verify(streakRepository, never()).save(any());
    }
```

Add imports: `com.foodbytes.dto.HabitFirstAnswerRequest`, `com.foodbytes.model.StreakType`, `java.util.SortedMap`, `java.util.TreeMap`. (`AwardLadder` and `StreakRuns` are in the same package.) If `HabitStreakServiceTest` runs Mockito strict stubs, keep every test's `stubRow` — each path calls `findForUpdate`.

- [x] **Step 2: Run — expect a compile failure**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HabitStreakServiceTest`
Expected: `COMPILATION ERROR` — `cannot find symbol … firstAnswer`.

- [x] **Step 3: Implement** (after `answer`; add `import com.foodbytes.dto.HabitFirstAnswerRequest;`)

```java
    /**
     * MPP-35: the one-time "When did you last have a snack / a drink?" answer, asked instead of the
     * daily question while the habit has never been answered. lastDate null ("Can't remember")
     * credits today only; otherwise the lapse day (if inside the 30-day window) is logged not clean
     * and every day after it to today clean, so the run is at most 30 days. Then the daily check-in
     * takes over from tomorrow.
     *
     * @throws IllegalArgumentException when already answered, or lastDate is outside today-30..today
     */
    @Transactional
    public HabitStatusDTO firstAnswer(Long userId, Habit habit, HabitFirstAnswerRequest request) {
        LocalDate today = HabitStreakPolicy.today(clock);
        streakRepository.ensureRow(userId, habit.name());
        PetHabitStreak row = streakRepository.findForUpdate(userId, habit)
                .orElseThrow(() -> new IllegalStateException("Habit row missing after ensureRow: " + habit));
        if (row.getLastAnsweredDate() != null) {
            throw new IllegalArgumentException(habit + " has already been answered");
        }

        LocalDate lastDate = request.getLastDate();
        if (lastDate == null) {
            logDays(userId, habit, today, today, null);
            row.setStreakStart(today);
        } else {
            HabitStreakPolicy.requireFirstAnswerInWindow(lastDate, today);
            logDays(userId, habit, HabitStreakPolicy.firstAnswerLogFrom(lastDate, today), today, lastDate);
            row.setStreakStart(lastDate.plusDays(1));
        }

        row.setLastAnsweredDate(today);
        raiseBest(row, HabitStreakPolicy.current(row.getStreakStart(), today));
        streakRepository.save(row);
        return HabitStreakPolicy.toDTO(habit, row, today);
    }
```

- [x] **Step 4: Run — expect green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=HabitStreakServiceTest`
Expected: `BUILD SUCCESS`, 0 failures (old and new tests).

### Task 7: POST /api/pet/habits/{habit}/first-answer ✓

- Skill: `java-backend`

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetHabitController.java` (after `answer`, line ~48)
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetHabitControllerTest.java`

- [x] **Step 1: Write the failing tests** (append)

```java
    @Test
    void firstAnswer_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(post("/api/pet/habits/SNACK/first-answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"lastDate\":null}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        verifyNoInteractions(habitStreakService);
    }

    @Test
    void firstAnswer_unknownHabit_returns400() throws Exception {
        mockMvc.perform(post("/api/pet/habits/CRISPS/first-answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Unknown habit: CRISPS"));
        verifyNoInteractions(habitStreakService);
    }
```

- [x] **Step 2: Run — expect failure**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetHabitControllerTest`
Expected: the two new tests fail (404 / no handler), existing ones pass.

- [x] **Step 3: Implement** (add `import com.foodbytes.dto.HabitFirstAnswerRequest;`)

```java
    /** MPP-35: the one-time "When did you last…?" answer; 400 once the habit has been answered. */
    @PostMapping("/{habit}/first-answer")
    public ResponseEntity<?> firstAnswer(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Habit habit,
            @RequestBody HabitFirstAnswerRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        try {
            return ResponseEntity.ok(habitStreakService.firstAnswer(userPrincipal.getId(), habit, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
```

Update the class Javadoc's last line to: `Read by Pip's speech bubble (MPP-21); the one-time first answer is MPP-35.`

- [x] **Step 4: Run — expect green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetHabitControllerTest`
Expected: `BUILD SUCCESS`, 0 failures.

---

## Phase 3 — Frontend: Pip asks "When did you last…?" once

Adds constants, pure helpers (pinned by the node check), the service call, the hook step and the controls. Each task leaves `npm run build` green; until Task 11 lands, the new step is simply never entered.

### Task 8: Constants and pure helpers ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/constants/pet.js:99-109`
- Modify: `foodbytes-app/client/src/utils/habitCheckIn.js`
- Modify: `foodbytes-app/client/src/utils/habitCheckIn.check.mjs`

- [x] **Step 1: Constants** — replace `CHECKIN_STEPS` and append after `CHECKIN_THANKS`

```js
export const CHECKIN_STEPS = {
  ASK: 'ask',
  WHEN: 'when',
  FIRST: 'first' // MPP-35: the one-time "When did you last…?" while a habit has never been answered
}
```

```js
// MPP-35: the one-time question per habit. The API enforces the same 30 (HabitStreakPolicy.FIRST_ANSWER_DAYS).
export const FIRST_ANSWER_DAYS_BACK = 30
export const HABIT_FIRST_QUESTION = {
  SNACK: 'When did you last have a snack?',
  ALCOHOL: 'When did you last have a drink?'
}
export const CHECKIN_FIRST_HINT = 'Longer ago? Pick the earliest day.'
```

- [x] **Step 2: Helpers** — extend the import from `../constants/pet.js` with `CHECKIN_STEPS, FIRST_ANSWER_DAYS_BACK, HABIT_FIRST_QUESTION`, and add before `const dayCount`:

```js
/** MPP-35: a habit the person has never answered gets the one-time "When did you last…?" question. */
export function isFirstAnswer(status) {
  return status?.lastAnsweredDate == null
}

/** MPP-35: the earliest date the one-time question accepts — todayISO minus 30 days (UTC arithmetic). */
export function firstAnswerEarliestISO(todayISO) {
  const [y, m, d] = todayISO.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d - FIRST_ANSWER_DAYS_BACK)).toISOString().slice(0, 10)
}

/** MPP-35: "When did you last have a snack?" / "When did you last have a drink?" */
export function firstQuestionText(habit) {
  return HABIT_FIRST_QUESTION[habit]
}

/** The opening step for a habit: the one-time question if never answered, else the daily one. */
export function stepFor(habit, status) {
  return { kind: isFirstAnswer(status) ? CHECKIN_STEPS.FIRST : CHECKIN_STEPS.ASK, habit }
}
```

- [x] **Step 3: Pin them** — extend the import in `habitCheckIn.check.mjs` with `firstAnswerEarliestISO, firstQuestionText, isFirstAnswer, stepFor` and `CHECKIN_STEPS` (from `../constants/pet.js`), then append before the final success log (or at the end if there is none):

```js
// MPP-35: the one-time question
assert.equal(isFirstAnswer({ lastAnsweredDate: null }), true)
assert.equal(isFirstAnswer({ lastAnsweredDate: '2026-10-12' }), false)
assert.equal(firstAnswerEarliestISO('2026-10-14'), '2026-09-14')
assert.equal(firstAnswerEarliestISO('2026-03-15'), '2026-02-13') // across a short month
assert.equal(firstAnswerEarliestISO('2026-10-30'), '2026-09-30') // across the October DST change
assert.equal(firstQuestionText('SNACK'), 'When did you last have a snack?')
assert.equal(firstQuestionText('ALCOHOL'), 'When did you last have a drink?')
assert.deepEqual(stepFor('SNACK', { lastAnsweredDate: null }), { kind: CHECKIN_STEPS.FIRST, habit: 'SNACK' })
assert.deepEqual(stepFor('ALCOHOL', { lastAnsweredDate: '2026-10-13' }), { kind: CHECKIN_STEPS.ASK, habit: 'ALCOHOL' })
```

- [x] **Step 4: Run the check**

Run: `cd foodbytes-app\client; npm run check:checkin`
Expected: exits 0 (no `AssertionError`).

### Task 9: habitService.firstAnswerHabit ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/services/habitService.js:20-28`

- [x] **Step 1: Add a `,` after `answerHabit`'s closing brace, then this member**

```js
  /**
   * MPP-35: the one-time "When did you last…?" answer. 400 once that habit has been answered.
   * @param {'SNACK'|'ALCOHOL'} habit
   * @param {{ lastDate: string|null }} body - 'YYYY-MM-DD' (today-30 … today); null = "Can't remember"
   * @returns {Promise<Object>} the updated HabitStatus
   */
  async firstAnswerHabit(habit, body) {
    const response = await api.post(`/pet/habits/${habit}/first-answer`, body)
    return response.data
  }
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 10: useHabitCheckIn — FIRST step ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/hooks/useHabitCheckIn.js`

- [x] **Step 1: Imports** — change the helpers import to:

```js
import {
  firstAnswerEarliestISO, firstQuestionText, habitsToAsk, isSnoozedToday, praiseText, questionText, startOverText, stepFor
} from '../utils/habitCheckIn'
```

- [x] **Step 2: Opening step on load** — in the load effect replace
`step: { kind: CHECKIN_STEPS.ASK, habit: queue[0] }` with `step: stepFor(queue[0], statuses[queue[0]])`.

- [x] **Step 3: Generalise `submit` to take the request** — change its signature and call:

```js
  const submit = async (habit, send, reactionFor) => {
    setState(current => ({ ...current, busy: true, interacted: true }))
    try {
      const status = await send()
```

and in its success branch replace
`step: queue.length ? { kind: CHECKIN_STEPS.ASK, habit: queue[0] } : null,` with
`step: queue.length ? stepFor(queue[0], current.statuses[queue[0]]) : null,`

- [x] **Step 4: Prompt per step kind** — replace the `prompt` expression with:

```js
  const PROMPTS = {
    [CHECKIN_STEPS.ASK]: () => questionText(step.habit, state.statuses[step.habit].coversFrom, todayISO),
    [CHECKIN_STEPS.FIRST]: () => firstQuestionText(step.habit),
    [CHECKIN_STEPS.WHEN]: () => CHECKIN_WHEN_PROMPT
  }
  const prompt = step ? PROMPTS[step.kind]() : null
```

- [x] **Step 5: Actions** — update the three submit callers and add the first-answer fields:

```js
    earliest: firstAnswerEarliestISO(todayISO),
    onNo: () => submit(step.habit, () => habitService.answerHabit(step.habit, { clean: true }), praiseText),
```
```js
    onSave: (lapseDate) => submit(step.habit, () => habitService.answerHabit(step.habit, { clean: false, lapseDate }), startOverText),
    onFirstSave: (lastDate) => submit(step.habit, () => habitService.firstAnswerHabit(step.habit, { lastDate }), praiseText),
```

Update the hook's doc comment with one line: `MPP-35: a habit never answered opens on the one-time "When did you last…?" step (CHECKIN_STEPS.FIRST); its answer posts to first-answer and is praised like a "No".`

- [x] **Step 6: Build + size**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\hooks\useHabitCheckIn.js | Measure-Object -Line).Lines`
Expected: `built in <n>s`; line count < 200.

### Task 11: CheckInActions — first-answer controls ✓

- Skill: `react-frontend`

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/CheckInActions.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/CheckInActions.css`

- [x] **Step 1: Props, imports, doc** — import `CHECKIN_FIRST_HINT` alongside `CHECKIN_STEPS, HABIT_QUESTION_NOUN`; add `earliest, onFirstSave` to the destructured props; add to the doc comment: `MPP-35 first step: a date input (earliest … today, today by default) with Save, Today, Can't remember and Not now, plus a hint that the earliest day stands for longer ago.`

- [x] **Step 2: Render the FIRST step** — insert before `if (step === CHECKIN_STEPS.WHEN) {`

```jsx
  if (step === CHECKIN_STEPS.FIRST) {
    const handleSubmit = (event) => {
      event.preventDefault()
      onFirstSave(event.currentTarget.elements.lastDate.value)
    }
    return (
      <form className="pip-checkin-actions" onSubmit={handleSubmit}>
        <label className="pip-checkin-sr" htmlFor={inputId}>{`Day you last had ${HABIT_QUESTION_NOUN[habit]}`}</label>
        <input
          key={habit}
          ref={firstRef}
          id={inputId}
          name="lastDate"
          className="pip-checkin-date"
          type="date"
          min={earliest}
          max={todayISO}
          defaultValue={todayISO}
          required
        />
        <button type="submit" className="pip-checkin-btn pip-checkin-btn--primary" disabled={busy}>Save</button>
        <button type="button" className="pip-checkin-btn" disabled={busy} onClick={() => onFirstSave(todayISO)}>Today</button>
        <button type="button" className="pip-checkin-btn" disabled={busy} onClick={() => onFirstSave(null)}>Can't remember</button>
        <button type="button" className="pip-checkin-btn pip-checkin-btn--link" disabled={busy} onClick={onNotNow}>Not now</button>
        <p className="pip-checkin-hint">{CHECKIN_FIRST_HINT}</p>
      </form>
    )
  }
```

- [x] **Step 3: Hint style** — append to `CheckInActions.css`

```css
/* MPP-35: the one-time question's note that the earliest day stands for "longer ago" */
.pip-checkin-hint {
  flex-basis: 100%;
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.8;
}
```

- [x] **Step 4: Build + size**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\pet\room\CheckInActions.jsx | Measure-Object -Line).Lines`
Expected: `built in <n>s`; line count < 200.

- [ ] **Step 5: Manual check (developer, local stack)** — outstanding for the developer (no browser in /fb-apply)

With the backend on :8080 and `npm run dev` on :5173, log in as a local user whose `pet_habit_streaks` rows are absent (or `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "DELETE FROM pet_habit_days WHERE user_id = <id>; DELETE FROM pet_habit_streaks WHERE user_id = <id>;"` on a local test user). Open `/pet` at 375 px width:
- Pip asks "When did you last have a snack?" with the date input, Save, Today, Can't remember, Not now and the hint; no horizontal scroll; every button ≥ 44 px tall.
- The date input refuses days before today − 30 and after today.
- Pick 5 days ago → Save → "5 days snack-free! So proud of you 💜", then the alcohol question asks "When did you last have a drink?".
- "Can't remember" → "1 day alcohol-free! So proud of you 💜".
- Reload: the normal daily question does not reappear today, and the one-time question never returns.

---

## Phase 4 — Jira housekeeping

### Task 12: Point MPP-33 AC 1 at MPP-35 ✓

- Skill: `management-jira`

**Files:** (none — Jira MPP-33 description)

- [x] **Step 1: Re-read MPP-33's description** via `getJiraIssue` (markdown) and find AC 1 (the "old shared ticks are not carried over" criterion).

- [x] **Step 2: Append one sentence to that criterion and send the description back otherwise byte-for-byte** via `editJiraIssue`:

`Update 2026-10-14: superseded at go-live by MPP-35, whose go-live step (order 2) copies the old ticks to each entry's plan owner.`

On a timeout, do not retry — re-read with `getJiraIssue` and act only if the sentence is absent.

---

## Phase 5 — Final verification

No production changes beyond the version bump.

### Task 13: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-35 is a **Story** → bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-35: carry old eaten ticks over at go-live; Pip asks once when you last had a snack / a drink (30-day cap)`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 14: Go-live file still current ✓

- [x] **Step 1: Check**

Run: `node foodbytes-app/database/build-golive.mjs --check`
Expected: `Go-live OK: 10 migrations`

### Task 15: Grep for stale references ✓

- [x] **Step 1: No header still claims the ticks are dropped**

Run: `Select-String -Path foodbytes-app\database\migrations\2026-10-1*-mpp*.sql -Pattern "deliberately NOT carried over","inserts nothing there"`
Expected: zero hits.

- [x] **Step 2: Every quoted order number matches the tracker**

Run: `Select-String -Path foodbytes-app\database\migrations\2026-10-1*-mpp*.sql -Pattern "order \d+ in" | ForEach-Object { "$($_.Filename): $($_.Matches[0].Value)" }`
Expected: exactly `…mpp22…: order 4 in`, `…mpp24…: order 5 in`, `…mpp25…: order 8 in`, `…mpp32…: order 7 in`, `…mpp35…: order 2 in` (MPP-33's new `(order 2)` does not match this pattern).

- [x] **Step 3: Every step kind used by the hook has a prompt**

Run: `Select-String -Path foodbytes-app\client\src\hooks\useHabitCheckIn.js -Pattern "CHECKIN_STEPS\.(ASK|FIRST|WHEN)\]"`
Expected: three hits.

### Task 16: Run the full backend test suite ✓

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 17: Production build + frontend checks ✓

- [x] **Step 1: Build and the check scripts that cover touched code**

Run: `cd foodbytes-app\client; npm run build; npm run check:checkin; npm run check:awards`
Expected: `built in <n>s`, no errors; both checks exit 0.

### Task 18: PR description ✓

- [x] **Step 1: Write `pr-description.md` in this plan folder**

Include:
- Link to `plan.md` in this folder.
- Summary: tick carry-over migration at go-live row 2 (rows renumbered to 10), header fixes, one-time habit question (`POST /api/pet/habits/{habit}/first-answer`), new version from Task 13.
- Railway: nothing applied now; the new migration ships inside `mpp15-railway-golive.sql` at epic merge, before the merged backend deploys. Expected live effect: 7 ticks for user 1 → 70 sprinkles; 12 and 13 Oct count as followed-the-plan days.
- Local verification from Task 3 (copy count, owner, fallback `eaten_at`, idempotent re-run, sprinkle seal) and the Task 11 manual check.
- Convention note: a never-answered habit opens on `CHECKIN_STEPS.FIRST`; the one-time answer is the only path that logs past habit days, capped at 30.
- Suggested commit subject: `MPP-35: carry over old ticks at go-live and ask once when you last snacked/drank`

---

## Self-review

**Spec coverage:**
- Migration copies `eaten = 1` to owner, COALESCE `eaten_at`, idempotent — Task 1, verified Task 3.
- Tracker row 2 + regenerated go-live, `--check` green — Task 2, Task 14.
- Stale migration headers refreshed — Task 2 (Steps 2–4), Task 15.
- Local apply against seeded ticks, then MPP-24/25 re-run for the seal — Task 3.
- 30-day window rules — Task 4.
- `HabitFirstAnswerRequest` — Task 5.
- `HabitStreakService.firstAnswer` (cap, future/older rejects, Can't remember, Today, repeat refused, one ladder cycle) — Task 6.
- Endpoint — Task 7.
- Frontend constants/helpers/service/hook/controls — Tasks 8–11.
- MPP-33 AC 1 note — Task 12.
- Version bump + CHANGELOG — Task 13.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, or "similar to Task N". `U` in Task 3 and `<id>` in Task 11 are values the executor reads from the preceding query, stated explicitly.

**Type / name consistency:** `HabitFirstAnswerRequest.lastDate` (Java) ↔ JSON `lastDate` ↔ `habitService.firstAnswerHabit(habit, { lastDate })`. `HabitStreakPolicy.FIRST_ANSWER_DAYS` / `firstAnswerEarliest` / `requireFirstAnswerInWindow` / `firstAnswerLogFrom` used identically in Tasks 4 and 6. `CHECKIN_STEPS.FIRST`, `FIRST_ANSWER_DAYS_BACK`, `HABIT_FIRST_QUESTION`, `CHECKIN_FIRST_HINT`, `isFirstAnswer`, `firstAnswerEarliestISO`, `firstQuestionText`, `stepFor`, `earliest`, `onFirstSave` match across Tasks 8, 10, 11. Error messages `"lastDate cannot be in the future"`, `"lastDate must be on or after <date>"`, `"<HABIT> has already been answered"` match between policy/service and tests. Endpoint `/api/pet/habits/{habit}/first-answer` matches controller, controller test and service module.

**Phase boundary cleanliness:**
- Phase 1: SQL and docs only; go-live `--check` green; Java/JS untouched.
- Phase 2: additive backend; each task ends with its test class green and `/answer` unchanged.
- Phase 3: additive frontend; every task ends with `npm run build` green; the FIRST step is unreachable until Task 10 and fully rendered by Task 11.
- Phase 4: Jira only.
- Phase 5: verification and version bookkeeping only.
