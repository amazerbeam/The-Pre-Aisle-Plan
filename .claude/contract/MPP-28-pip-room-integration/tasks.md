# Tasks: Integrate Pip's room — one pet payload and cross-feature consistency

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-14

**Goal:** `/pet` loads in at most two requests (`/api/pet` now carries habits + cabinet; at most one meal-plan read), Pip's bubble follows cook > award/outfit > stage change > check-in > fridge-low > mood in one checked rule, and a two-account test proves the per-person split.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/client/src/utils/pipBubble.js` — the AC 2 bubble priority as one pure function
- `foodbytes-app/client/src/utils/pipBubble.check.mjs` — node `assert` checks for it (`npm run check:bubble`)

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/WardrobeService.java` — `sync(userId, growth, awards)`; drops the `AwardService` dependency
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/WardrobeServiceTest.java` — pass award statuses instead of stubbing `AwardService`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetDTO.java` — `habits`, `awards`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetPolicy.java` — `toDTO` takes habits + awards
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetService.java` — builds the payload in ledger-safe order
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java` — new mocks, two-account test, order test
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java` — `getPlan(userId, start, days)`, `MAX_PLAN_DAYS`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java` — 8-day and bounds tests
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/MealPlanController.java` — optional `days` on `GET /api/meal-plan`
- `foodbytes-app/client/src/services/mealPlanService.js` — `getWeekPlan(start, { signal, days })`
- `foodbytes-app/client/src/utils/fridgeFill.js` + `fridgeFill.check.mjs` — `petPlanRange`, `needsPetDays`
- `foodbytes-app/client/src/contexts/PetContext.jsx` — one pet-days read; `petDay`
- `foodbytes-app/client/src/hooks/useHabitCheckIn.js` — reads `pet.habits`, seeds once per user/day
- `foodbytes-app/client/src/hooks/usePetAwards.js` — derives from `pet.awards`
- `foodbytes-app/client/src/hooks/usePipGrowth.js` — `hold` input
- `foodbytes-app/client/src/components/pet/PetView.jsx` — wires the hooks, `pipBubble`
- `foodbytes-app/client/src/services/petService.js` — remove `getAwards`; JSDoc for habits/awards
- `foodbytes-app/client/src/services/habitService.js` — remove `getHabits`
- `foodbytes-app/client/package.json` — `check:bubble` script; version
- `foodbytes-app/foodbytes-api/pom.xml` — version
- `CHANGELOG.md` — one line

**Deleted:** (none)

---

## Phase 1 — Backend: one pet payload

Extends `GET /api/pet` with the caller's habits and cabinet, and stops the payload from deriving the award ledger twice. Additive for the client (two new JSON fields, nothing removed), so the frontend keeps working unchanged at the end of this phase.

### Task 1: WardrobeService.sync takes the award statuses ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/WardrobeService.java:34-60,95-103`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/WardrobeServiceTest.java`

- [x] **Step 1: Change `sync` and `progress` to use the passed statuses**

Replace `sync(Long userId, PetGrowthDTO growth)` with:

```java
    /**
     * Called on every pet read with the statuses PetService just took from AwardService#getCabinet
     * (which already synced the award ledger), so one pet read derives the ledger once (MPP-28).
     */
    @Transactional
    public WardrobeDTO sync(Long userId, PetGrowthDTO growth, List<AwardStatusDTO> awards) {
        Set<String> owned = ownedIds(unlockRepository.findByUserId(userId));
        List<String> fresh = WardrobePolicy.newlyMet(progress(userId, growth, awards), owned);
        fresh.forEach(id -> unlockRepository.insertIfAbsent(userId, id));
        return getWardrobe(userId);
    }
```

and `progress` to:

```java
    private WardrobePolicy.Progress progress(Long userId, PetGrowthDTO growth, List<AwardStatusDTO> awards) {
        Map<StreakType, Map<Integer, Integer>> counts = new EnumMap<>(StreakType.class);
        awards.forEach(status -> counts.put(status.getStreakType(), status.getCounts()));
        // …firsts + return unchanged
    }
```

Delete the `private final AwardService awardService;` field and its import (it has no other use — `Grep "awardService" WardrobeService.java` → 0 hits after the edit). Add `import com.foodbytes.dto.AwardStatusDTO;` if not present.

- [x] **Step 2: Update WardrobeServiceTest to pass statuses**

- Remove `@Mock private AwardService awardService;` and the `lenient().when(awardService.getAwards(USER))…` stub (line 58).
- Constructor (line 56): `new WardrobeService(unlockRepository, outfitRepository, petFirstService, Clock.fixed(NOW, ZoneOffset.UTC))`.
- Line 88–90: replace the stub + call with `service.sync(USER, growth(1, 1, 0), awards(Map.of(StreakType.PLAN, Map.of(3, 1))));`
- Every other `service.sync(USER, growth(...))` → `service.sync(USER, growth(...), awards(Map.of()))`.

- [x] **Step 3: Run the wardrobe tests**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: exactly one compile error, in `PetService.java` (`sync` now takes three arguments). Task 3 fixes it, and Task 3 Step 4 runs `WardrobeServiceTest`.

### Task 2: PetDTO + PetPolicy carry habits and awards ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetDTO.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetPolicy.java:37-47`

- [x] **Step 1: Add the two fields to PetDTO (after `room`)**

```java
    private List<HabitStatusDTO> habits; // MPP-28: the caller's own SNACK + ALCOHOL statuses (= GET /pet/habits), never null
    private PetAwardsDTO awards;         // MPP-28: the caller's own cabinet (= GET /pet/awards), never null
```
Add `import java.util.List;` and extend the class Javadoc with "MPP-28: habits and awards, so /pet is the room's one pet read."

- [x] **Step 2: Extend PetPolicy.toDTO**

```java
    public static PetDTO toDTO(User user, PetGrowthDTO growth, WardrobeDTO wardrobe, long sprinkles,
                               PetRoomDTO room, List<HabitStatusDTO> habits, PetAwardsDTO awards) {
        String saved = user.getPetName();
        return new PetDTO(
                saved != null ? saved : DEFAULT_NAME,
                saved != null,
                MealTimesPolicy.effective(user),
                growth,
                wardrobe,
                sprinkles,
                room,
                habits,
                awards);
    }
```
Add the `HabitStatusDTO`, `PetAwardsDTO` and `List` imports.

### Task 3: PetService builds the payload in ledger-safe order ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetService.java:23-50`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java`

- [x] **Step 1: Write the failing tests**

In `PetServiceTest` add mocks and fixtures:

```java
    @Mock private AwardService awardService;
    @Mock private HabitStreakService habitStreakService;

    private static final PetAwardsDTO AWARDS = new PetAwardsDTO(List.of(), List.of());
    private static final List<HabitStatusDTO> HABITS = List.of();
```
In `setUp`, change the wardrobe stub and add two:
```java
        lenient().when(wardrobeService.sync(any(), any(PetGrowthDTO.class), any())).thenReturn(WARDROBE);
        lenient().when(awardService.getCabinet(any())).thenReturn(AWARDS);
        lenient().when(habitStreakService.getHabits(any())).thenReturn(HABITS);
```
Update `getPet_carriesTheCallersOwnWardrobe_syncedAgainstTheirGrowth`:
```java
        verify(wardrobeService).sync(LINKED_ID, GROWTH, AWARDS.getStreaks());
        verify(wardrobeService, never()).sync(eq(OWNER_ID), any(), any());
```
Fix any other `wardrobeService.sync(...)` matcher in the file the same way. Add:

```java
    /** MPP-28 AC 3: two accounts on one plan — every personal part of the payload is the caller's own. */
    @Test
    void getPet_linkedPartner_everyPersonalPartIsTheirOwn_neverThePlanOwners() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));

        PetDTO pet = petService.getPet(LINKED_ID);

        assertThat(pet.getHabits()).isSameAs(HABITS);
        assertThat(pet.getAwards()).isSameAs(AWARDS);
        verify(petGrowthService).growth(linked);
        verify(awardService).getCabinet(LINKED_ID);
        verify(habitStreakService).getHabits(LINKED_ID);
        verify(wardrobeService).sync(LINKED_ID, GROWTH, AWARDS.getStreaks());
        verify(sprinkleService).balance(LINKED_ID);
        verify(petRoomService).room(LINKED_ID);
        verify(userRepository, never()).findById(OWNER_ID);
        verify(awardService, never()).getCabinet(OWNER_ID);
        verify(habitStreakService, never()).getHabits(OWNER_ID);
        verify(wardrobeService, never()).sync(eq(OWNER_ID), any(), any());
        verify(sprinkleService, never()).balance(OWNER_ID);
        verify(petRoomService, never()).room(OWNER_ID);
    }

    /** MPP-28 AC 3, the other account: the plan owner reads only their own parts, never the partner's. */
    @Test
    void getPet_planOwner_neverReadsThePartnersParts() {
        when(userRepository.findById(OWNER_ID)).thenReturn(Optional.of(owner));

        petService.getPet(OWNER_ID);

        verify(awardService).getCabinet(OWNER_ID);
        verify(habitStreakService).getHabits(OWNER_ID);
        verify(awardService, never()).getCabinet(LINKED_ID);
        verify(habitStreakService, never()).getHabits(LINKED_ID);
        verify(wardrobeService, never()).sync(eq(LINKED_ID), any(), any());
        verify(sprinkleService, never()).balance(LINKED_ID);
        verify(petRoomService, never()).room(LINKED_ID);
    }

    /** MPP-28: the cabinet records new awards before the wardrobe unlocks from them and before the balance is read. */
    @Test
    void getPet_recordsAwardsBeforeTheWardrobeAndTheBalance() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));

        petService.getPet(LINKED_ID);

        InOrder order = inOrder(petGrowthService, awardService, wardrobeService, sprinkleService);
        order.verify(petGrowthService).growth(linked);
        order.verify(awardService).getCabinet(LINKED_ID);
        order.verify(wardrobeService).sync(LINKED_ID, GROWTH, AWARDS.getStreaks());
        order.verify(sprinkleService).balance(LINKED_ID);
    }
```
Imports: `com.foodbytes.dto.HabitStatusDTO`, `com.foodbytes.dto.PetAwardsDTO`, `org.mockito.InOrder`, `static org.mockito.Mockito.inOrder`.

- [x] **Step 2: Run them to see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest`
Expected: compilation error (`sync` arity / `getHabits` / `getAwards` on `PetDTO`) — the tests are ahead of the code.

- [x] **Step 3: Implement in PetService**

Add the dependencies and replace `toDTO`:

```java
    private final AwardService awardService;              // MPP-28
    private final HabitStreakService habitStreakService;  // MPP-28

    // The client replaces its whole pet with either response, so both carry every part.
    // Order (MPP-28): the cabinet records any new award before the wardrobe unlocks from those
    // counts and before the balance is read, so one read agrees with itself.
    private PetDTO toDTO(User user) {
        Long userId = user.getId();
        PetGrowthDTO growth = petGrowthService.growth(user);
        PetAwardsDTO awards = awardService.getCabinet(userId);
        WardrobeDTO wardrobe = wardrobeService.sync(userId, growth, awards.getStreaks());
        return PetPolicy.toDTO(user, growth, wardrobe, sprinkleService.balance(userId),
                petRoomService.room(userId), habitStreakService.getHabits(userId), awards);
    }
```
Add the `PetAwardsDTO` and `WardrobeDTO` imports, and append to the class Javadoc: "MPP-28: and the caller's own habit statuses and trophy cabinet, so /pet is the room's one pet read."

- [x] **Step 4: Run the pet and wardrobe tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest+WardrobeServiceTest+PetControllerTest`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

---

## Phase 2 — Backend: optional `days` on the meal-plan read

Lets one request cover yesterday through the end of the fridge week. The default of 7 keeps every existing caller identical, so this phase ends green with no client change.

### Task 4: MealPlanService.getPlan(userId, start, days) ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java:66-150`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/MealPlanServiceTest.java`

- [x] **Step 1: Write the failing tests** (next to `getWeekPlan_exposesTheCallersOwnTicks`)

```java
    /** MPP-28: the Pet page reads yesterday + the fridge week in one request (8 days). */
    @Test
    void getPlan_eightDays_returnsEightDaysAndTheCallersTicks() {
        LocalDate start = LocalDate.of(2026, 10, 11);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        MealPlanEntry lastDay = entryWithId(10L, recipeWithId(82L), start.plusDays(7));
        when(mealPlanEntryRepository.findByUserIdAndDateRange(USER_ID, start, start.plusDays(8)))
                .thenReturn(List.of(lastDay));
        when(mealPlanEntryEatenRepository.findByUserIdAndMealPlanEntryIdIn(USER_ID, List.of(10L)))
                .thenReturn(List.of(tick(10L, USER_ID, LocalDateTime.of(2026, 10, 18, 19, 0))));
        stubWeekMacros();

        MealPlanWeekDTO plan = mealPlanService.getPlan(USER_ID, start, 8);

        assertThat(plan.getDays()).hasSize(8);
        assertThat(plan.getStartDate()).isEqualTo(start);
        assertThat(plan.getEndDate()).isEqualTo(start.plusDays(7));
        assertThat(plan.getDays().get(7).getMealsByType().get("dinner").get(0).getEaten()).isTrue();
    }

    @Test
    void getPlan_outsideOneToFourteenDays_isRejected() {
        LocalDate start = LocalDate.of(2026, 10, 11);
        assertThatThrownBy(() -> mealPlanService.getPlan(USER_ID, start, 0))
                .isInstanceOf(IllegalArgumentException.class).hasMessage("days must be between 1 and 14");
        assertThatThrownBy(() -> mealPlanService.getPlan(USER_ID, start, 15))
                .isInstanceOf(IllegalArgumentException.class).hasMessage("days must be between 1 and 14");
        verifyNoInteractions(mealPlanEntryRepository);
    }
```
(`stubWeekMacros()` must be `lenient` if it stubs per-day calls — check its body at line 304; add `assertThatThrownBy`'s static import if absent.)

- [x] **Step 2: Run them to see them fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: compilation error — `getPlan` does not exist.

- [x] **Step 3: Implement**

Above `getWeekPlan`:

```java
    /** MPP-28: the longest range GET /api/meal-plan returns (the Pet page reads 8 days). */
    public static final int MAX_PLAN_DAYS = 14;
    private static final int WEEK_DAYS = 7;
```
Turn the current `getWeekPlan` body into `getPlan` and make `getWeekPlan` a delegate:

```java
    @Transactional(readOnly = true)
    public MealPlanWeekDTO getWeekPlan(Long userId, LocalDate startDate) {
        return getPlan(userId, startDate, WEEK_DAYS);
    }

    /**
     * MPP-28: `days` days from startDate (1..MAX_PLAN_DAYS) — the shared plan's entries with the
     * caller's own ticks, exactly as getWeekPlan. Totals and averages cover the returned days.
     */
    @Transactional(readOnly = true)
    public MealPlanWeekDTO getPlan(Long userId, LocalDate startDate, int days) {
        if (days < 1 || days > MAX_PLAN_DAYS) {
            throw new IllegalArgumentException("days must be between 1 and " + MAX_PLAN_DAYS);
        }
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
        LocalDate endDate = startDate.plusDays(days); // Exclusive end
        // … body unchanged except:
        //   for (int i = 0; i < days; i++) {
        //   weekDTO.setEndDate(startDate.plusDays(days - 1)); // Inclusive end for display
    }
```
Move the existing Javadoc's "7 days" wording to `getWeekPlan`.

- [x] **Step 4: Run the meal-plan tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanServiceTest`
Expected: `BUILD SUCCESS`, 0 failures — including the existing `getWeekPlan_*` tests (7-day path unchanged).

### Task 5: MealPlanController accepts `days` ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/MealPlanController.java:33-54`

- [x] **Step 1: Add the param and map the bounds error to 400**

```java
    /**
     * … GET /api/meal-plan?startDate=2025-12-01[&days=8]
     * @param days MPP-28: optional, 1–14, default 7 (the Pet page asks for 8)
     */
    @GetMapping
    public ResponseEntity<?> getWeekPlan(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(defaultValue = "7") int days) {

        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required to view meal plan"));
        }
        try {
            return ResponseEntity.ok(mealPlanService.getPlan(userPrincipal.getId(), startDate, days));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
```

- [x] **Step 2: Compile and run the controller tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=MealPlanControllerTest+MealPlanServiceTest`
Expected: `BUILD SUCCESS`, 0 failures.

---

## Phase 3 — Frontend data layer: one pet read, at most one plan read

Moves `PetContext` onto the new payload and a single meal-plan read, and exposes `petDay`, `habits` and `awards`. The hooks still fetch on their own until Phase 4, so the build is green and the page still works at the end of this phase.

### Task 6: mealPlanService.getWeekPlan takes `days` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/services/mealPlanService.js:8-17`

- [x] **Step 1: Add the option**

```js
  /**
   * …existing doc…
   * @param {{ signal?: AbortSignal, days?: number }} [options] - MPP-28: days (1–14) defaults to 7 server-side
   */
  async getWeekPlan(startDate, { signal, days } = {}) {
    const query = days ? `startDate=${startDate}&days=${days}` : `startDate=${startDate}`
    const response = await api.get(`/meal-plan?${query}`, { signal })
    return response.data
  },
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: petPlanRange + needsPetDays ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/utils/fridgeFill.js` (after `planCoversRange`)
- Modify: `foodbytes-app/client/src/utils/fridgeFill.check.mjs`

- [x] **Step 1: Add the helpers**

```js
/**
 * MPP-28: the one meal-plan read PetContext makes — yesterday (mood) through the fridge week's last
 * day. The fridge week when it already holds yesterday (7 days), else from yesterday (8 days).
 */
export function petPlanRange(fridgeRange, yesterdayISO) {
  return yesterdayISO < fridgeRange.start
    ? { start: yesterdayISO, days: WINDOW_DAYS + 1 }
    : { start: fridgeRange.start, days: WINDOW_DAYS }
}

/** MPP-28: false when the calendar's week is the fridge week AND holds yesterday — then it covers both. */
export function needsPetDays(calendarIsFridgeWeek, fridgeRange, yesterdayISO) {
  return !(calendarIsFridgeWeek && fridgeRange.start <= yesterdayISO)
}
```

- [x] **Step 2: Pin them** (add to the import list and before the final `console.log`)

```js
// MPP-28: one plan read covers yesterday + the fridge week; none when the calendar already does.
assert.deepEqual(petPlanRange(RANGE, '2026-10-13'), { start: '2026-10-12', days: 7 })
assert.deepEqual(petPlanRange(RANGE, '2026-10-12'), { start: '2026-10-12', days: 7 })
assert.deepEqual(petPlanRange(RANGE, '2026-10-11'), { start: '2026-10-11', days: 8 })
assert.equal(needsPetDays(true, RANGE, '2026-10-13'), false)
assert.equal(needsPetDays(true, RANGE, '2026-10-11'), true)
assert.equal(needsPetDays(false, RANGE, '2026-10-13'), true)
```

- [x] **Step 3: Run the check**

Run: `cd foodbytes-app\client; npm run check:fridge`
Expected: `fridgeFill: all checks passed`

### Task 8: PetContext — one pet-days read, petDay, habits, awards ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/contexts/PetContext.jsx`

- [x] **Step 1: Replace the recent-days and fridge state/effects with one pet-days read**

Imports: add `needsPetDays, petPlanRange` to the `../utils/fridgeFill` import.

State: delete `recentPlan`, `planLoading`, `planError`, `fridgePlan`, `fridgeError`; add:
```js
  const [petDay, setPetDay] = useState(null) // MPP-28: the todayISO the current pet payload was requested for
  const [petDays, setPetDays] = useState(null) // { start, plan } — keyed so a stale range is never read
  const [daysLoading, setDaysLoading] = useState(false)
  const [daysError, setDaysError] = useState(null)
```
In the `/pet` effect: in the signed-out branch also `setPetDay(null)`; capture `const requestedFor = todayISO` before the call and replace `.then(setPet)` with `.then(data => { setPet(data); setPetDay(requestedFor) })`.

Delete the "Recent-days week" and "MPP-19: fetch the fridge week" effects and add, after the `/pet` effect:

```js
  // MPP-28: one meal-plan read for mood (yesterday) and the fridge week — none when the calendar's
  // week already holds both. 8 days on the fridge week's first day (yesterday + the week).
  const petDaysNeeded = needsPetDays(calendarIsFridgeWeek, fridgeRange, yesterdayISO)
  const petRange = petPlanRange(fridgeRange, yesterdayISO)
  useEffect(() => {
    if (!isAuthenticated || !petDaysNeeded) {
      setPetDays(null)
      setDaysError(null)
      setDaysLoading(false)
      return undefined
    }
    const controller = new AbortController()
    const { start, days } = petRange
    setDaysLoading(true)
    setDaysError(null)
    mealPlanService.getWeekPlan(start, { signal: controller.signal, days })
      .then(plan => setPetDays({ start, plan }))
      .catch(err => {
        if (!isCancelled(err)) setDaysError(err.response?.data?.error || LOAD_ERROR)
      })
      .finally(() => {
        if (!controller.signal.aborted) setDaysLoading(false)
      })
    return () => controller.abort()
  }, [isAuthenticated, petDaysNeeded, petRange.start, petRange.days, reloadKey])
```

- [x] **Step 2: Point mood and the fridge at it**

```js
  const daysPlan = petDays?.start === petRange.start ? petDays.plan : null
  const pickDay = (iso) => findDay(weekPlan, iso) ?? findDay(daysPlan, iso)
```
and the non-calendar fridge source:
```js
    : { plan: planCoversRange(daysPlan, fridgeRange) ? daysPlan : null, error: daysError ? FRIDGE_LOAD_ERROR : null, retry }
```
Value: `loading: petLoading || daysLoading`, `error: petError || daysError`, and add `petDay`, `habits: pet?.habits ?? null`, `awards: pet?.awards ?? null`.

- [x] **Step 3: Update the provider's doc comment**

Replace the "Yesterday must exist…fetches its own 7 days from yesterday" and MPP-19 paragraphs with: "MPP-28: one meal-plan read (petPlanRange: yesterday through the fridge week, 7 or 8 days), skipped when the calendar's week holds both (needsPetDays). Mood prefers MealPlanContext's live week per day (MPP-12's optimistic tick). `petDay` is the date the pet payload was requested for, so the check-in never seeds from yesterday's payload. `habits` and `awards` come from the same payload (MPP-20 / MPP-23)."

- [x] **Step 4: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\contexts\PetContext.jsx | Measure-Object -Line).Lines`
Expected: `built in <n>s`, no errors; line count under 400.

---

## Phase 4 — Frontend: hooks on the payload and one bubble rule

Moves the check-in and cabinet onto `pet.habits` / `pet.awards`, adds the growth hold, puts the bubble order in `pipBubble`, and removes the now-unused fetch methods last. The build is green at the end of the phase.

### Task 9: pipBubble — the AC 2 order ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/pipBubble.js`
- Create: `foodbytes-app/client/src/utils/pipBubble.check.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [x] **Step 1: Write the rule**

```js
/**
 * MPP-28 AC 2: what Pip says — one line, highest first:
 * cook sequence > new award / outfit (then a shop line) > stage change > check-in question > fridge-low > mood.
 *
 * An announcement and an open check-in question share the bubble: the announcement leads and the
 * question keeps its buttons, so an answer that earns an award never hides the next question.
 * The stage change never competes: usePipGrowth holds while a cook line or announcement speaks.
 *
 * @param {{ cookLine?: string|null, announcement?: string|null, growthLine?: string|null,
 *           checkIn?: { text: string, prompt: string|null, actions: Object|null }|null,
 *           fridgeLine?: string|null, moodLine?: string|null }} lines
 * @returns {{ text: string|null, actions: Object|null }}
 */
export function pipBubble({ cookLine = null, announcement = null, growthLine = null, checkIn = null, fridgeLine = null, moodLine = null }) {
  if (cookLine) return say(cookLine)
  if (announcement) {
    return checkIn?.actions
      ? { text: [announcement, checkIn.prompt].filter(Boolean).join(' '), actions: checkIn.actions }
      : say(announcement)
  }
  if (growthLine) return say(growthLine)
  if (checkIn) return { text: checkIn.text, actions: checkIn.actions }
  return say(fridgeLine ?? moodLine)
}

const say = (text) => ({ text, actions: null })
```

- [x] **Step 2: Pin it**

```js
// Run: npm run check:bubble   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-28 AC 2 bubble order is
// pinned here. Mirrors cookServe.check.mjs.
import assert from 'node:assert/strict'
import { pipBubble } from './pipBubble.js'

const ACTIONS = { step: 'ASK' }
const ASKING = { text: 'Nice! Any snacks yesterday?', prompt: 'Any snacks yesterday?', actions: ACTIONS }
const REACTING = { text: 'Nice!', prompt: null, actions: null }
const ALL = { cookLine: 'Cooking!', announcement: 'New trophy!', growthLine: 'I grew!', checkIn: ASKING, fridgeLine: 'Fridge low', moodLine: 'Just vibing.' }

// Each tier beats everything below it.
assert.deepEqual(pipBubble(ALL), { text: 'Cooking!', actions: null })
assert.deepEqual(pipBubble({ ...ALL, cookLine: null, checkIn: null }), { text: 'New trophy!', actions: null })
assert.deepEqual(pipBubble({ ...ALL, cookLine: null, announcement: null }), { text: 'I grew!', actions: null })
assert.deepEqual(pipBubble({ ...ALL, cookLine: null, announcement: null, growthLine: null }), { text: ASKING.text, actions: ACTIONS })
assert.deepEqual(pipBubble({ fridgeLine: 'Fridge low', moodLine: 'Just vibing.' }), { text: 'Fridge low', actions: null })
assert.deepEqual(pipBubble({ moodLine: 'Just vibing.' }), { text: 'Just vibing.', actions: null })

// An announcement leads an open question, which keeps its buttons.
assert.deepEqual(pipBubble({ announcement: 'New trophy!', checkIn: ASKING, moodLine: 'x' }),
  { text: 'New trophy! Any snacks yesterday?', actions: ACTIONS })
// A reaction with no question under it gives way to the announcement.
assert.deepEqual(pipBubble({ announcement: 'New trophy!', checkIn: REACTING }), { text: 'New trophy!', actions: null })
// The check-in outranks the fridge and the mood.
assert.deepEqual(pipBubble({ checkIn: REACTING, fridgeLine: 'Fridge low', moodLine: 'x' }), { text: 'Nice!', actions: null })

console.log('pipBubble: all checks passed')
```

Add to `package.json` → `scripts`, after `check:wardrobe`: `"check:bubble": "node src/utils/pipBubble.check.mjs",`

- [x] **Step 3: Run the check**

Run: `cd foodbytes-app\client; npm run check:bubble`
Expected: `pipBubble: all checks passed`

### Task 10: usePipGrowth — hold while a higher line speaks ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/hooks/usePipGrowth.js`

- [x] **Step 1: Add `hold` to the signature, the start effect and the step effect**

```js
 * MPP-28: `hold` (true while the cook scene or an announcement speaks) neither starts nor advances
 * a run; the current step restarts in full when it lifts, so a stage change waits its turn (AC 2).
 *
 * @param {{ userId: number|null, growth: Object|null, petName: string|null, hold?: boolean }} input
 */
export function usePipGrowth({ userId, growth, petName, hold = false }) {
```
Start effect: first line `if (run || hold || userId == null || !growth) return` and deps `[run, hold, userId, growth]`.
Step effect: first line `if (!run || hold) return undefined` and deps `[run, hold, userId]`.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors (PetView still calls it without `hold` → default false).

### Task 11: useHabitCheckIn reads pet.habits ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/hooks/useHabitCheckIn.js:1-62`

- [x] **Step 1: Replace the load effect with a once-per-day seed**

Signature and doc:
```js
 * MPP-28: the statuses come from the pet payload (`habits`, requested for `petDay`) — no fetch. Seeds
 * once per person and day, and only from a payload requested for today, so a later /pet refetch (tab
 * visible, refreshPet after an answer) never restarts a question being answered.
 *
 * @param {{ userId: number|null, todayISO: string, habits: Object[]|null, petDay: string|null, onAnswered?: () => void }} input
 */
export function useHabitCheckIn({ userId, todayISO, habits, petDay, onAnswered }) {
  const [state, setState] = useState(IDLE)
  const mountedRef = useRef(false)
  const seedRef = useRef({ key: null, seeded: false })
```
Replace the `habitService.getHabits` effect with:
```js
  useEffect(() => {
    const key = userId == null ? null : `${userId}|${todayISO}`
    if (seedRef.current.key !== key) {
      seedRef.current = { key, seeded: false }
      setState(IDLE)
    }
    if (key == null || seedRef.current.seeded || !habits || petDay !== todayISO) return
    seedRef.current.seeded = true
    if (isSnoozedToday(readSnoozedOn(userId), todayISO)) return
    const queue = habitsToAsk(habits)
    if (queue.length === 0) return
    const statuses = Object.fromEntries(habits.map(status => [status.habit, status]))
    setState({ ...IDLE, forDay: todayISO, statuses, queue, step: stepFor(queue[0], statuses[queue[0]]) })
  }, [userId, todayISO, habits, petDay])
```
Drop the now-false doc line "Loads the caller's MPP-20 statuses on mount and on date rollover" and "A failed load shows no check-in … next visit asks again" → "No payload for today yet (or /pet failed) shows no check-in." Keep the `habitService` import (writes still use it). In the `onAnswered` doc: "so the pet (cabinet, growth, wardrobe, sprinkles) can refetch".

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors. Until Task 13 passes `habits` and `petDay` they are `undefined`, so the check-in stays silent.

### Task 12: usePetAwards derives from pet.awards ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/hooks/usePetAwards.js`

- [x] **Step 1: Replace the fetch with a derivation**

```js
import { useEffect, useState } from 'react'
import { AWARD_BUBBLE_MS } from '../constants/petAwards'
import { announcementText, awardCountsOf, newAwards } from '../utils/petAwards'
import { readAwardCounts, writeAwardCounts } from '../utils/awardSeenStore'

/**
 * MPP-23: your own trophy cabinet and Pip's "🎉 New …" lines. MPP-28: the cabinet is the pet
 * payload's `awards` (GET /api/pet records any newly earned award) — no fetch of its own.
 *
 * Each payload's counts are compared with what this browser last saw (awardSeenStore): each streak
 * type that gained an award queues one line for its highest new milestone, shown for
 * AWARD_BUBBLE_MS each. The baseline is written before the line is queued, so a refetch or reload
 * never repeats it. No baseline yet (first visit here) → saved quietly, nothing announced.
 *
 * @param {{ userId: number|null, awards: { streaks: Object[], firsts: Object[] }|null,
 *           loading: boolean, error: string|null, retry: () => void }} input  from PetContext
 * @returns {{ cabinet: { data: Object|null, loading: boolean, error: string|null, retry: () => void }, announcement: string|null }}
 */
export function usePetAwards({ userId, awards, loading, error, retry }) {
  const [queue, setQueue] = useState([])

  // Another person signing in on this browser never sees the last person's lines.
  useEffect(() => {
    setQueue([])
  }, [userId])

  useEffect(() => {
    if (userId == null || !awards) return
    const fresh = newAwards(readAwardCounts(userId), awards.streaks)
    writeAwardCounts(userId, awardCountsOf(awards.streaks))
    if (fresh.length) setQueue(current => [...current, ...fresh.map(announcementText)])
  }, [userId, awards])

  // One line at a time; each new queue (shift or append) restarts the head's timer.
  useEffect(() => {
    if (queue.length === 0) return undefined
    const timerId = setTimeout(() => setQueue(current => current.slice(1)), AWARD_BUBBLE_MS)
    return () => clearTimeout(timerId)
  }, [queue])

  return {
    cabinet: { data: awards, loading: !awards && loading, error: awards ? null : error, retry },
    announcement: queue[0] ?? null
  }
}

export default usePetAwards
```
`CABINET_LOAD_ERROR` has no other user: delete it from `constants/petAwards.js:51`.

### Task 13: PetView wires the payload, the hold and pipBubble ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx`

- [x] **Step 1: Rewire the hooks (growth last, so its hold sees the others)**

```js
import { pipBubble } from '../../utils/pipBubble'
// …
  const { pet, petDay, mood, moodInfo, position, fridge, todayISO, loading, error, retry, renamePet, setWardrobe, sprinkles, applyRoomWrite, refreshPet, setRoom } = usePet()
  const petUserId = pet ? user?.id ?? null : null
  const awards = usePetAwards({ userId: petUserId, awards: pet?.awards ?? null, loading, error, retry })
  const checkIn = useHabitCheckIn({ userId: petUserId, todayISO, habits: pet?.habits ?? null, petDay, onAnswered: refreshPet })
  const serving = useCookAndServe({ userId: petUserId, lastLoggedAt: moodInfo.lastLoggedAt, lastLoggedType: moodInfo.lastLoggedType })
  const dressing = usePipWardrobe({ userId: petUserId, wardrobe: pet?.wardrobe ?? null, setWardrobe })
  const shopState = usePetShop({ applyRoomWrite, refreshPet })
  const roomEdit = useRoomEdit({ room: pet?.room ?? null, setRoom, applyRoomWrite })
  // MPP-28 AC 2: award > outfit > shop line; a stage change waits for these and for the cook scene.
  const announcement = awards.announcement ?? dressing.announcement ?? shopState.announcement
  const growth = usePipGrowth({ userId: petUserId, growth: pet?.growth ?? null, petName: pet?.name ?? null, hold: Boolean(serving) || Boolean(announcement) })
```

- [x] **Step 2: Replace the bubble block**

Delete the block from `// Cook scene > growth …` through `const bubbleActions = …` and put:

```js
  // MPP-28 AC 2: cook > award/outfit > stage change > check-in > fridge-low > mood (pipBubble).
  const said = pipBubble({
    cookLine: serving ? cookServeBubble(serving) : null,
    announcement,
    growthLine: growth.bubble,
    checkIn,
    fridgeLine: fridgeBubble(fridge.fill, position),
    moodLine: petBubble(moodInfo)
  })
  const bubbleActions = said.actions ? <CheckInActions {...said.actions} /> : null
```
Pass `bubble={said.text}` to `PetRoom`. In the component doc comment replace the MPP-19/21/32 bubble-order fragments with one line: "MPP-28: one pet read (habits + cabinet ride in /pet); the bubble order lives in pipBubble."

- [x] **Step 3: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\pet\PetView.jsx | Measure-Object -Line).Lines`
Expected: `built in <n>s`, no errors; under 200 lines.

### Task 14: Remove the fetch methods nothing calls ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/services/petService.js`
- Modify: `foodbytes-app/client/src/services/habitService.js`

- [x] **Step 1: Delete `petService.getAwards` and `habitService.getHabits`**

Delete both methods. In `petService.getPet`'s `@returns`, add `habits: HabitStatus[], awards: { streaks: AwardStatus[], firsts: FirstStatus[] }` and move the AwardStatus / FirstStatus shape notes from the deleted `getAwards` doc onto `getPet`. In `habitService`'s header, keep the HabitStatus shape and add "MPP-28: read from the pet payload (`pet.habits`); this module only writes."

- [x] **Step 2: Confirm no caller remains and build**

Run: `cd foodbytes-app\client; Get-ChildItem -Path src -Recurse -Include *.js,*.jsx | Select-String -Pattern "getAwards\(|getHabits\("; npm run build`
Expected: zero hits; `built in <n>s`.

---

## Phase 5 — Sharing audit and regression pass

No production changes: re-proves the per-person split in code and walks the AC 4 regression by hand. Safe boundary by construction.

### Task 15: Grep audit — only plan-slot reads resolve the owner ✓

- Skill: none — read-only audit of the code the sharing table in `plan.md` rests on

**Files:**
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java` (already added in Task 3)

- [x] **Step 1: Owner resolution appears only on the shared side and in plan-slot reads**

Run: `Get-ChildItem -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\service -Filter *.java | Select-String -Pattern "resolveOwnerId\(|getEffectiveMealPlanOwnerId\(" | ForEach-Object { $_.Filename } | Sort-Object -Unique`
Expected (as of planning, 2026-10-14): exactly `ExtraChoiceService.java, ManageExtrasService.java, MealPlanService.java, MealPlanTemplateService.java, PersistedShoppingListService.java, PetFirstService.java, PetGrowthService.java, PlanStreakService.java, ShoppingListService.java, SprinkleService.java`. For each pet file in that list, confirm the owner id feeds only `mealPlanEntryRepository` slot queries (or `findPlanMemberIds`), never a `pet_*` / eaten read or write. Any other hit is a leak → log a Bug under MPP-15 (do not fix here).

- [x] **Step 2: Run the two-account test**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest#getPet_linkedPartner_everyPersonalPartIsTheirOwn_neverThePlanOwners+getPet_planOwner_neverReadsThePartnersParts`
Expected: `BUILD SUCCESS`, 2 tests, 0 failures.

### Task 16: Manual regression (AC 1, 2, 4) — PENDING developer play-test (Ready for Test)

- Skill: none — manual check in the running app; no frontend test runner exists

**Files:** (none — observation only)

- [ ] **Step 1: Request count (AC 1)**

Start the backend (CLAUDE.md → "Running the backend locally with Google login") and `npm run dev`. Sign in, open DevTools → Network → Fetch/XHR, reload on `/pet`.
Expected: the Pet page's own reads are `GET /api/pet` plus at most one `GET /api/meal-plan?…&days=…` (none when the calendar is on the current week and today is not its first day). No `/api/pet/habits` or `/api/pet/awards` request. Set the calendar to another week and reload: still ≤2.

- [ ] **Step 2: Bubble order (AC 2)** at 375 px width

- Tick a dinner as eaten from the meal plan → `/pet` plays the cook scene (MPP-34 hand-off), its lines lead; no check-in or award line shows over it.
- With an unanswered check-in, answer "No" in a way that completes a streak milestone → the "🎉 New …" line leads with the next question and its buttons still under it; the trophy cabinet and the sprinkle count update without a reload.
- If the answer moves Pip a form, the evolve line plays **after** the award line, not under it.
- Idle with a low fridge and no check-in → the fridge line; otherwise the mood line.

- [ ] **Step 3: Footer tab, mood, eaten hand-off (AC 4)**

On `/`, `/mealplan` and `/shopping`: the footer tab shows Pip in his current form and mood, wearing his hat (no full outfit), with his name. Unticking/ticking a meal flips the mood on the tab without reload. "Mark as eaten" on a breakfast/lunch/dinner navigates to `/pet` after the ~600 ms beat (the `PetReaction` replacement, MPP-34).

- [ ] **Step 4: Two linked accounts**

In two browsers, sign in as the plan owner and a linked partner (local DB has 2 linked users). Expected: same meal plan, shopping list, templates and extra choices; different eaten ticks, Pip name, mood, meal times, check-ins, cabinet, sprinkles, room, decor, wardrobe and form. A tick or check-in in one never changes the other's Pip.

Record each step's result (pass / fail + note) in `pr-description.md` (Task M.5). A large mismatch found here becomes a Bug under MPP-15, not a fix.

---

## Phase 6 — Final verification

No production changes beyond the version bump — only sanity-checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-28 is a **Task** → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-28: Pip's room loads in one pet read (habits + cabinet in /api/pet, ≤1 meal-plan read) and Pip's bubble follows one priority order`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references ✓

- [x] **Step 1: No client read of the old endpoints or removed state**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "get\('/pet/(habits|awards)'|recentPlan|fridgePlan|planError|CABINET_LOAD_ERROR|getAwards\(|getHabits\("`
Expected: zero hits.

- [x] **Step 2: No two-arg wardrobe sync remains**

Run: `Get-ChildItem -Path foodbytes-app\foodbytes-api\src -Recurse -Filter *.java | Select-String -Pattern "awardService\.getAwards" | ForEach-Object { $_.Filename }`
Expected: only `AwardService.java` (if it self-references) — never `WardrobeService.java` or `WardrobeServiceTest.java`.

### Task M.3: Run every client check script ✓

- [x] **Step 1: All pure-rule checks**

Run: `cd foodbytes-app\client; npm run check:macros; npm run check:pet; npm run check:pip; npm run check:room; npm run check:cook; npm run check:fridge; npm run check:checkin; npm run check:awards; npm run check:growth; npm run check:wardrobe; npm run check:bubble`
Expected: every script prints its `all checks passed` line; no assertion error.

### Task M.4: Run the full backend test suite ✓

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task M.5: Production build + go-live file ✓

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [x] **Step 2: MPP-15 go-live file unchanged and valid**

Run: `node foodbytes-app/database/build-golive.mjs --check`
Expected: `Go-live OK` (this ticket adds no migration).

### Task M.6: Update the PR description ✓

- [ ] **Step 1: Write `pr-description.md` in this plan folder for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary: `/api/pet` gains `habits` + `awards`; `GET /api/meal-plan` gains optional `days` (1–14, default 7); `PetContext` makes ≤1 plan read; `pipBubble` owns the AC 2 order; `usePipGrowth` holds; check-in answers refresh the whole pet. New version from Task M.1.
- Migrations: none — no Railway or local apply; go-live file unchanged.
- Verification results from Phases 1–6, including each Task 16 manual step (pass/fail + note) and any Bug logged under MPP-15.
- Convention note: "Pip's bubble order lives in `utils/pipBubble.js` (`npm run check:bubble`); a new line goes there, not inline in PetView."
- Suggested commit subject: `MPP-28: one pet payload for Pip's room and a single bubble priority`.

---

## Self-review

**Spec coverage:**
- Payload consolidation (`/pet` carries habits + cabinet) — Tasks 1, 2, 3, 11, 12, 13, 14.
- At most one meal-plan read (`days`, pet-days effect) — Tasks 4, 5, 6, 7, 8; verified Task 16 Step 1.
- `WardrobeService.sync` takes statuses (ledger derived once) — Task 1, Task M.2 Step 2.
- `petDay` and once-per-day check-in seeding — Tasks 8, 11.
- Check-in answer refreshes `/pet` — Task 13 (`onAnswered: refreshPet`).
- `pipBubble` + `check:bubble` — Task 9, Task 13, Task M.3.
- `usePipGrowth` hold — Tasks 10, 13; verified Task 16 Step 2.
- Sharing audit + two-account test — Task 3 (tests), Task 15, Task 16 Step 4.
- Regression pass — Tasks 16, M.3, M.4, M.5.
- Version bump + CHANGELOG — Task M.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command; manual steps name route, viewport and expected outcome.

**Type / name consistency:** `PetDTO.habits` / `PetDTO.awards` ↔ `pet.habits` / `pet.awards` (Tasks 2, 3, 8, 11–13); `WardrobeService.sync(Long, PetGrowthDTO, List<AwardStatusDTO>)` (Tasks 1, 3); `MealPlanService.getPlan(Long, LocalDate, int)` + `MAX_PLAN_DAYS = 14` + message `"days must be between 1 and 14"` (Tasks 4, 5); `getWeekPlan(start, { signal, days })` (Tasks 6, 8); `petPlanRange` / `needsPetDays` (Tasks 7, 8); `petDay` (Tasks 8, 11, 13); `usePetAwards({ userId, awards, loading, error, retry })` (Tasks 12, 13); `useHabitCheckIn({ userId, todayISO, habits, petDay, onAnswered })` (Tasks 11, 13); `usePipGrowth({ …, hold })` (Tasks 10, 13); `pipBubble({ cookLine, announcement, growthLine, checkIn, fridgeLine, moodLine })` → `{ text, actions }` (Tasks 9, 13). All match `plan.md` → Data shapes.

**Phase boundary cleanliness:**
- Phase 1: two JSON fields added, nothing removed; backend tests green; client unaffected.
- Phase 2: `days` defaults to 7, so every caller is unchanged; meal-plan tests green.
- Phase 3: context exposes new values while the hooks still fetch for themselves; build green, page works.
- Phase 4: hooks move onto the payload before the fetch methods are deleted (Task 14 last); build green.
- Phase 5: read-only audit + manual checks; no code changes.
- Phase 6: version bump + verification only.
