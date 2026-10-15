# Tasks: Sprinkles — Earn tab, weekly shopping-list rewards, and a count-up on returning to Pip

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-15

**Goal:** Pay sprinkles for making and finishing the week's shopping list (to everyone on the plan), expose the caller's last 14 days of sprinkles plus the server's payout amounts, and make earning visible: a ✨ Earn tab in the Shop and a count-up on Pip's header chip with a summary bubble line.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-15-mpp42-sprinkles-shopping-sources.sql`: widens `source_type`, extends `chk_pet_sprinkles_source`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingItemChecked.java`: event record
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/SprinkleHistoryService.java`: the recent read
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetSprinkleController.java`: `GET /api/pet/sprinkles/recent`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/RecentSprinklesDTO.java`, `SprinkleEntryDTO.java`, `SprinkleRatesDTO.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/SprinkleHistoryServiceTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetSprinkleControllerTest.java`
- `foodbytes-app/client/src/constants/petSprinkles.js`: Earn / count-up copy and timings
- `foodbytes-app/client/src/utils/sprinkleHistory.js` + `sprinkleHistory.check.mjs`: pure grouping / wording / maths
- `foodbytes-app/client/src/utils/sprinklesSeenStore.js`: last seen balance per user
- `foodbytes-app/client/src/hooks/useRecentSprinkles.js`, `useSprinkleCountUp.js`, `useCountUpNumber.js`
- `foodbytes-app/client/src/components/pet/SprinklesChip.jsx` + `SprinklesChip.css`
- `foodbytes-app/client/src/components/pet/room/ShopEarnTab.jsx`, `EarnRecentList.jsx`, `ShopEarnTab.css`

**Modified:**
- `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`: row 12
- `foodbytes-app/database/mpp15-railway-golive.sql`: regenerated
- `foodbytes-api/.../model/SprinkleSource.java`: two sources
- `foodbytes-api/.../model/PetSprinkle.java:34`: `length = 32`
- `foodbytes-api/.../model/RoomStation.java`: `fromCode`
- `foodbytes-api/.../service/SprinklePolicy.java`: amounts, `RECENT_DAYS`, `mealsPerWeek`, `weekOf`
- `foodbytes-api/.../service/StationPolicy.java`: `stationOf`, `levelOf`
- `foodbytes-api/.../service/SprinkleService.java`: shopping payouts, `payPlan`
- `foodbytes-api/.../service/SprinkleRecorder.java`: routes GENERATE_SHOPPING_LIST, new listener
- `foodbytes-api/.../service/PersistedShoppingListService.java:146-157`: publishes `ShoppingItemChecked`
- `foodbytes-api/.../repository/PetSprinkleRepository.java`: 14-day read
- `foodbytes-api/.../repository/ShoppingListItemRepository.java`: two counts
- Tests: `SprinklePolicyTest`, `StationPolicyTest`, `SprinkleServiceTest`, `SprinkleRecorderTest`, `PersistedShoppingListServiceTest`
- `client/package.json`: `check:sprinkles` script + version
- `client/src/constants/petDecor.js:212-217`: `SHOP_TAB_KEYS.EARN`, fourth tab
- `client/src/constants/petShop.js:10`: remove `SHOP_FOOTNOTE`
- `client/src/services/petService.js`: `getRecentSprinkles`
- `client/src/components/pet/room/ShopView.jsx`: Earn tab, intro condition, footnote link
- `client/src/components/pet/PipHeader.jsx`: renders `SprinklesChip`
- `client/src/components/pet/PetView.jsx:52-56,114-121`: count-up hook, announcement chain
- `client/src/components/pet/PetView.css:58-67`: header stacks above the room
- `foodbytes-api/pom.xml`, `CHANGELOG.md`: version

**Deleted:** (none)

---

## Phase 1 — Schema

The migration that widens `source_type` and extends the CHECK, its go-live row, the local apply, and the enum/entity that depend on it. The order (DDL file → local apply → Java) means the backend never maps a source the local DB would reject. The build stays green and no behaviour changes yet.

### Task 1: Write the MPP-42 migration and its go-live row ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-15-mpp42-sprinkles-shopping-sources.sql`
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` (append row 12)
- Modify: `foodbytes-app/database/mpp15-railway-golive.sql` (regenerated, never hand-edited)

- [x] **Step 1: Write the migration**

```sql
-- MPP-42: two new sprinkles sources - the week's shopping list made (+10) and finished (+15).
--
--   SHOPPING_LIST_GENERATED  10  epoch day of a Monday - a list was generated that Mon-Sun week
--   SHOPPING_LIST_COMPLETED  15  epoch day of a Monday - the list had >= 1 item, all checked
-- Both pay every member of the shared plan (MPP-33), once per (person, week) via uk_pet_sprinkles,
-- so regenerating or re-checking in the same week pays nothing. No backfill (out of scope).
--
-- source_type is widened VARCHAR(16) -> VARCHAR(32): the new names are 23 characters.
-- chk_pet_sprinkles_source is re-declared as a superset of MPP-27's list.
--
-- Lossless: widening a VARCHAR keeps every value (longest today: STATION_UPGRADE, 15 chars), and
-- the CHECK only gains values, so every existing row passes. Evidence 2026-10-15: local
-- foodbytes-db 4 rows (all MEAL_EATEN); Railway 27 rows, already varchar(16) + MPP-27's CHECK.
--
-- Idempotent (MPP-15 go-live file): the CHECK is dropped only if present, MODIFY re-applies the
-- same type, and the CHECK is re-added - re-running the file is safe. The CHECK is dropped before
-- the MODIFY so the column change never fights the constraint.
--
-- MUST run after MPP-27's 2026-10-14-mpp27-pet-room-decor.sql (go-live row 10) and before the
-- backend that pays SHOPPING_LIST_* starts - Hibernate validate does not check CHECK constraints
-- or VARCHAR length, so a missing apply fails at the first shopping payout, not at startup.
-- MPP-15 is local-first: applied to the local foodbytes-db now; row 12 of
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

SET @has_chk := (SELECT COUNT(*) FROM information_schema.CHECK_CONSTRAINTS
                 WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'chk_pet_sprinkles_source');
SET @drop_chk := IF(@has_chk > 0, 'ALTER TABLE pet_sprinkles DROP CHECK chk_pet_sprinkles_source', 'DO 0');
PREPARE drop_chk FROM @drop_chk;
EXECUTE drop_chk;
DEALLOCATE PREPARE drop_chk;

ALTER TABLE pet_sprinkles MODIFY source_type VARCHAR(32) NOT NULL;

ALTER TABLE pet_sprinkles ADD CONSTRAINT chk_pet_sprinkles_source CHECK (source_type IN
  ('MEAL_EATEN','MEAL_ON_TIME','FULL_WEEK','HOMEMADE_EXTRA','STATION_UPGRADE','DECOR_PURCHASE',
   'SHOPPING_LIST_GENERATED','SHOPPING_LIST_COMPLETED'));
```

- [x] **Step 2: Append the tracker row**

Add directly under row 11 in `railway-migrations.md`:

```
| 12 | MPP-42 | foodbytes-app/database/migrations/2026-10-15-mpp42-sprinkles-shopping-sources.sql | — | — |
```

- [x] **Step 3: Regenerate the go-live file**

Run: `node foodbytes-app\database\build-golive.mjs`
Expected: it reports writing `mpp15-railway-golive.sql`. Then run `node foodbytes-app\database\build-golive.mjs --check` and expect `Go-live OK`.

### Task 2: Apply the migration to the local foodbytes-db ⏳ developer — not yet applied locally (developer chose to run it later)

- Skill: none — DBA operation against the local `foodbytes-db` Docker container (MPP-15 local-first; Railway is NOT touched)

**Files:**
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` (row 12 "Applied locally" date)

- [ ] **Step 1: Apply it twice (proves idempotence)**

Run: `docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app/database/migrations/2026-10-15-mpp42-sprinkles-shopping-sources.sql` (Git Bash), then run the same command again.
Expected: both runs exit 0 with no error (only the password warning).

- [ ] **Step 2: Verify the schema**

Run: `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SHOW COLUMNS FROM pet_sprinkles LIKE 'source_type'; SELECT CHECK_CLAUSE FROM information_schema.CHECK_CONSTRAINTS WHERE CONSTRAINT_SCHEMA='foodbytes' AND CONSTRAINT_NAME='chk_pet_sprinkles_source'; SELECT COUNT(*) FROM pet_sprinkles;"`
Expected: `varchar(32)`, a clause that lists all 8 sources, and the same row count as before (4 at planning time).

- [ ] **Step 3: Record the apply**

In row 12, replace the first `—` (Applied locally) with today's date. Re-run `node foodbytes-app\database\build-golive.mjs --check` and expect `Go-live OK` (regenerate first if it reports stale).

### Task 3: Add the two sources and widen the entity column ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/SprinkleSource.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetSprinkle.java:34`

- [x] **Step 1: Extend the enum**

Replace the last constant line and close:

```java
    STATION_UPGRADE, // MPP-26: a spend (negative amount), source_id = StationPolicy.sourceId
    DECOR_PURCHASE,  // MPP-27: a spend (negative amount), source_id = pet_decor_owned.id
    SHOPPING_LIST_GENERATED, // MPP-42: source_id = the week's Monday as LocalDate#toEpochDay, paid to every plan member
    SHOPPING_LIST_COMPLETED  // MPP-42: same key; the list had >= 1 item and every item checked
}
```

- [x] **Step 2: Widen the column mapping**

```java
    @Column(name = "source_type", nullable = false, length = 32)
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, 0 errors.

---

## Phase 2 — Shopping-list payouts

Policy, repository counts, the two payout methods, the new event and its publisher, and the recorder routing, each with its tests. At the end of the phase the backend pays the new sources, and the read side is untouched.

### Task 4: SprinklePolicy amounts, window and week helper ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/SprinklePolicy.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/SprinklePolicyTest.java`

- [x] **Step 1: Write the failing tests**

Append to `SprinklePolicyTest`:

```java
    @Test
    void weekOf_isThatWeeksMonday() {
        assertThat(SprinklePolicy.weekOf(LocalDate.of(2026, 10, 18))).isEqualTo(LocalDate.of(2026, 10, 12)); // Sunday
        assertThat(SprinklePolicy.weekOf(LocalDate.of(2026, 10, 12))).isEqualTo(LocalDate.of(2026, 10, 12)); // Monday
    }

    @Test
    void mealsPerWeek_isSevenDaysOfBreakfastLunchAndDinner() {
        assertThat(SprinklePolicy.mealsPerWeek()).isEqualTo(21);
    }
```

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinklePolicyTest`
Expected: compilation failure (`weekOf` / `mealsPerWeek` missing).

- [x] **Step 2: Implement**

Add below `HOMEMADE_BONUS` (keeping `WEEK_DAYS` where it is):

```java
    /** MPP-42: the week's shopping list made, and the week's shopping finished. Paid to every plan member. */
    public static final int SHOPPING_LIST_GENERATED = 10;
    public static final int SHOPPING_LIST_COMPLETED = 15;
    /** MPP-42: GET /api/pet/sprinkles/recent looks back this many days. */
    public static final int RECENT_DAYS = 14;
```

Add after `isOnTime`:

```java
    /** MPP-42: breakfast, lunch and dinner on all seven days - the meals a full week holds (the Earn tab's good week). */
    public static int mealsPerWeek() {
        return WEEK_DAYS * PlanStreakPolicy.MAIN_MEAL_KEYS.size();
    }

    /** MPP-42: the Monday of the Monday-Sunday week that holds this day. */
    static LocalDate weekOf(LocalDate day) {
        return day.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }
```

- [x] **Step 3: Run the tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinklePolicyTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 5: Shopping-list item counts ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/ShoppingListItemRepository.java:59`

- [x] **Step 1: Add the two counts after `uncheckAll`**

```java
    /** MPP-42: how many items the list holds. */
    long countByShoppingListId(Long shoppingListId);

    /** MPP-42: items not yet checked. is_checked is nullable (DEFAULT 0), so NULL counts as unchecked. */
    @Query("SELECT COUNT(i) FROM ShoppingListItem i " +
           "WHERE i.shoppingList.id = :shoppingListId " +
           "AND (i.isChecked = false OR i.isChecked IS NULL)")
    long countUnchecked(@Param("shoppingListId") Long shoppingListId);
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 6: SprinkleService pays the shopping sources to every plan member ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/SprinkleService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/SprinkleServiceTest.java`

- [x] **Step 1: Write the failing tests**

In `SprinkleServiceTest`, add the mocks and widen the constructor in `setUp`:

```java
    @Mock private ShoppingListRepository lists;
    @Mock private ShoppingListItemRepository items;
    …
        service = new SprinkleService(sprinkles, entries, ticks, firsts, users, extraChoiceService, clock, lists, items);
```

(imports: `com.foodbytes.model.ShoppingList`, `com.foodbytes.repository.ShoppingListRepository`, `com.foodbytes.repository.ShoppingListItemRepository`). Then add a helper and the tests. `TODAY` is Wednesday 2026-10-14, so the key is `MON.toEpochDay()`:

```java
    private void sharedPlan() {
        when(extraChoiceService.resolveOwnerId(2L)).thenReturn(1L);
        when(users.findPlanMemberIds(1L)).thenReturn(List.of(1L, 2L));
    }

    private void ownersList(long total, long unchecked) {
        ShoppingList list = new ShoppingList();
        list.setId(50L);
        when(lists.findByUserId(1L)).thenReturn(Optional.of(list));
        when(items.countByShoppingListId(50L)).thenReturn(total);
        lenient().when(items.countUnchecked(50L)).thenReturn(unchecked);
    }

    @Test
    void shoppingListGenerated_paysBothPlanMembers_keyedByThisWeeksMonday() {
        sharedPlan();
        service.shoppingListGenerated(2L);
        verify(sprinkles).insertIfAbsent(1L, "SHOPPING_LIST_GENERATED", MON.toEpochDay(), 10);
        verify(sprinkles).insertIfAbsent(2L, "SHOPPING_LIST_GENERATED", MON.toEpochDay(), 10);
    }

    @Test
    void shoppingListGenerated_twiceInOneWeek_reusesTheSameKey_soTheLedgerPaysOnce() {
        sharedPlan();
        service.shoppingListGenerated(2L);
        service.shoppingListGenerated(2L);
        // insertIfAbsent is ON DUPLICATE KEY no-op on uk_pet_sprinkles: same key twice = paid once.
        verify(sprinkles, times(2)).insertIfAbsent(2L, "SHOPPING_LIST_GENERATED", MON.toEpochDay(), 10);
        verify(sprinkles, never()).insertIfAbsent(eq(2L), eq("SHOPPING_LIST_GENERATED"), eq(MON.plusDays(7).toEpochDay()), anyInt());
    }

    @Test
    void shoppingListCompleted_everyItemChecked_paysBothPlanMembers() {
        sharedPlan();
        ownersList(12, 0);
        service.shoppingListCompleted(2L);
        verify(sprinkles).insertIfAbsent(1L, "SHOPPING_LIST_COMPLETED", MON.toEpochDay(), 15);
        verify(sprinkles).insertIfAbsent(2L, "SHOPPING_LIST_COMPLETED", MON.toEpochDay(), 15);
    }

    @Test
    void shoppingListCompleted_anItemStillUnchecked_paysNothing() {
        when(extraChoiceService.resolveOwnerId(2L)).thenReturn(1L);
        ownersList(12, 1);
        service.shoppingListCompleted(2L);
        verify(sprinkles, never()).insertIfAbsent(anyLong(), anyString(), anyLong(), anyInt());
    }

    @Test
    void shoppingListCompleted_emptyList_paysNothing() {
        when(extraChoiceService.resolveOwnerId(2L)).thenReturn(1L);
        ownersList(0, 0);
        service.shoppingListCompleted(2L);
        verify(sprinkles, never()).insertIfAbsent(anyLong(), anyString(), anyLong(), anyInt());
    }

    @Test
    void shoppingListCompleted_noList_paysNothing() {
        when(extraChoiceService.resolveOwnerId(2L)).thenReturn(1L);
        when(lists.findByUserId(1L)).thenReturn(Optional.empty());
        service.shoppingListCompleted(2L);
        verifyNoInteractions(sprinkles);
    }

    @Test
    void shoppingListCompleted_reCheckedInTheSameWeek_reusesTheSameKey() {
        sharedPlan();
        ownersList(12, 0);
        service.shoppingListCompleted(2L);
        service.shoppingListCompleted(2L);
        verify(sprinkles, times(2)).insertIfAbsent(1L, "SHOPPING_LIST_COMPLETED", MON.toEpochDay(), 15);
    }
```

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinkleServiceTest`
Expected: compilation failure (constructor arity, missing methods).

- [x] **Step 2: Implement**

In `SprinkleService`: add imports `com.foodbytes.model.ShoppingList`, `com.foodbytes.repository.ShoppingListItemRepository`, `com.foodbytes.repository.ShoppingListRepository`. Add the fields **after** `clock`, so the constructor order matches the test:

```java
    private final Clock clock;
    private final ShoppingListRepository shoppingListRepository;           // MPP-42
    private final ShoppingListItemRepository shoppingListItemRepository;   // MPP-42
```

Replace the member loop in `planned` with the helper:

```java
            if (fullDays < SprinklePolicy.WEEK_DAYS) continue;
            payPlan(ownerId, SprinkleSource.FULL_WEEK, monday.toEpochDay(), SprinklePolicy.FULL_WEEK);
```

Add after `planned`:

```java
    /**
     * MPP-42 AC 10: a shopping list was generated. Pays SHOPPING_LIST_GENERATED to every member of the
     * plan, keyed by this Dublin week's Monday - a regenerate in the same week hits uk_pet_sprinkles.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void shoppingListGenerated(Long actorId) {
        Long ownerId = extraChoiceService.resolveOwnerId(actorId);
        payPlan(ownerId, SprinkleSource.SHOPPING_LIST_GENERATED, thisWeek(), SprinklePolicy.SHOPPING_LIST_GENERATED);
    }

    /**
     * MPP-42 AC 11: an item was checked. Re-reads the plan's list after that commit (never trusting the
     * client's optimistic state): >= 1 item and none unchecked pays SHOPPING_LIST_COMPLETED to every
     * member, once per week.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void shoppingListCompleted(Long actorId) {
        Long ownerId = extraChoiceService.resolveOwnerId(actorId);
        Optional<ShoppingList> list = shoppingListRepository.findByUserId(ownerId);
        if (list.isEmpty()) return;
        Long listId = list.get().getId();
        if (shoppingListItemRepository.countByShoppingListId(listId) == 0) return;
        if (shoppingListItemRepository.countUnchecked(listId) > 0) return;
        payPlan(ownerId, SprinkleSource.SHOPPING_LIST_COMPLETED, thisWeek(), SprinklePolicy.SHOPPING_LIST_COMPLETED);
    }
```

Add beside `pay`:

```java
    /** Shared work (MPP-33): pays everyone on the owner's plan, whoever did it. */
    private void payPlan(Long ownerId, SprinkleSource source, long sourceId, int amount) {
        for (Long memberId : userRepository.findPlanMemberIds(ownerId)) {
            pay(memberId, source, sourceId, amount);
        }
    }

    /** This Dublin week's Monday as an epoch day - the once-per-week key. */
    private long thisWeek() {
        return SprinklePolicy.weekOf(HabitStreakPolicy.today(clock)).toEpochDay();
    }
```

Update the class Javadoc's last line to: `MPP-26: lockWallet + spend - the one locked debit path every purchase uses. MPP-42: the weekly shopping-list payouts.`

- [x] **Step 3: Run the tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinkleServiceTest`
Expected: `BUILD SUCCESS`, 0 failures (the existing FULL_WEEK tests still pass through `payPlan`).

### Task 7: The ShoppingItemChecked event and its publisher ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/ShoppingItemChecked.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PersistedShoppingListService.java:146-157`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PersistedShoppingListServiceTest.java`

- [x] **Step 1: Create the record**

```java
package com.foodbytes.service;

/**
 * MPP-42: a shopping-list item was just checked (never published for an un-check). SprinkleRecorder
 * re-reads the whole list after the toggle commits and pays SHOPPING_LIST_COMPLETED when it is done.
 */
public record ShoppingItemChecked(Long userId) {
}
```

- [x] **Step 2: Write the failing tests**

Append to `PersistedShoppingListServiceTest` (add imports `com.foodbytes.model.ShoppingListItem`, `static org.mockito.Mockito.verifyNoInteractions`):

```java
    private ShoppingListItem itemOnPartnersPlan(boolean checked) {
        User partner = new User();
        partner.setId(2L);
        partner.setMealPlanOwnerId(1L);
        when(userRepository.findById(2L)).thenReturn(Optional.of(partner));
        ShoppingListItem item = new ShoppingListItem();
        item.setId(7L);
        item.setIsChecked(checked);
        when(shoppingListItemRepository.findByIdAndUserId(7L, 1L)).thenReturn(Optional.of(item));
        return item;
    }

    @Test
    void toggleItemChecked_toChecked_publishesShoppingItemCheckedForTheClicker() {
        itemOnPartnersPlan(false);
        service.toggleItemChecked(2L, 7L);
        verify(eventPublisher).publishEvent(new ShoppingItemChecked(2L));
    }

    @Test
    void toggleItemChecked_toUnchecked_publishesNothing() {
        itemOnPartnersPlan(true);
        service.toggleItemChecked(2L, 7L);
        verifyNoInteractions(eventPublisher);
    }
```

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PersistedShoppingListServiceTest`
Expected: `toggleItemChecked_toChecked_…` fails (no event published).

- [x] **Step 3: Publish from the toggle**

In `toggleItemChecked`, after `shoppingListItemRepository.save(item);`:

```java
        // MPP-42: a check might finish the list; SprinkleRecorder re-reads it after commit.
        if (Boolean.TRUE.equals(item.getIsChecked())) {
            eventPublisher.publishEvent(new ShoppingItemChecked(userId));
        }
```

- [x] **Step 4: Run the tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PersistedShoppingListServiceTest`
Expected: `BUILD SUCCESS`, 0 failures.

### Task 8: SprinkleRecorder routes both shopping events ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/SprinkleRecorder.java:22-34`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/SprinkleRecorderTest.java`

- [x] **Step 1: Write the failing tests**

Replace `templateAndShoppingList_payNothing` with:

```java
    @Test
    void template_paysNothing() {
        recorder.onCandidate(PetFirstCandidate.of(1L, FirstKey.MAKE_TEMPLATE));
        verifyNoInteractions(sprinkleService);
    }

    @Test
    void shoppingListGenerated_routesToShoppingListGenerated() {
        recorder.onCandidate(PetFirstCandidate.of(2L, FirstKey.GENERATE_SHOPPING_LIST));
        verify(sprinkleService).shoppingListGenerated(2L);
    }

    @Test
    void itemChecked_routesToShoppingListCompleted() {
        recorder.onShoppingItemChecked(new ShoppingItemChecked(2L));
        verify(sprinkleService).shoppingListCompleted(2L);
    }

    @Test
    void aShoppingFailure_isSwallowed_soTheToggleStillSucceeds() {
        doThrow(new IllegalStateException("db down")).when(sprinkleService).shoppingListCompleted(2L);
        assertThatCode(() -> recorder.onShoppingItemChecked(new ShoppingItemChecked(2L))).doesNotThrowAnyException();
    }
```

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinkleRecorderTest`
Expected: compilation failure (`onShoppingItemChecked` missing).

- [x] **Step 2: Implement**

Change the switch arm and add the listener:

```java
                case PLAN_FULL_WEEK -> sprinkleService.planned(candidate.userId(), candidate.from(), candidate.to());
                case GENERATE_SHOPPING_LIST -> sprinkleService.shoppingListGenerated(candidate.userId()); // MPP-42
                case MAKE_TEMPLATE -> { }
```

```java
    /** MPP-42: an item was checked; the service re-reads the list and pays if it is now finished. */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onShoppingItemChecked(ShoppingItemChecked event) {
        try {
            sprinkleService.shoppingListCompleted(event.userId());
        } catch (RuntimeException e) {
            log.warn("MPP-42: could not pay the finished-shopping sprinkles for user {}; the toggle itself succeeded",
                     event.userId(), e);
        }
    }
```

Update the class Javadoc to mention: `MPP-42: generating a list pays SHOPPING_LIST_GENERATED; ShoppingItemChecked may pay SHOPPING_LIST_COMPLETED.`

- [x] **Step 3: Run the tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinkleRecorderTest`
Expected: `BUILD SUCCESS`, 0 failures.

---

## Phase 3 — Recent sprinkles read

The decoding helpers, the 14-day repository read, DTOs, `SprinkleHistoryService` and the thin controller. This phase is purely additive: a new read endpoint, with nothing existing changed in behaviour.

### Task 9: Decode a station upgrade's source id ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/RoomStation.java:31-38`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/StationPolicy.java:33-36`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/StationPolicyTest.java`

- [x] **Step 1: Write the failing test**

```java
    @Test
    void stationOfAndLevelOf_invertSourceId() {
        for (RoomStation station : RoomStation.values()) {
            for (int level = 2; level <= 4; level++) {
                long id = StationPolicy.sourceId(station, level);
                assertThat(StationPolicy.stationOf(id)).isEqualTo(station);
                assertThat(StationPolicy.levelOf(id)).isEqualTo(level);
            }
        }
        assertThat(StationPolicy.stationOf(92)).isNull();
    }
```

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=StationPolicyTest`
Expected: compilation failure.

- [x] **Step 2: Implement**

`RoomStation`, after `fromPath`:

```java
    /** MPP-42: the station a ledger code names, or null for an unknown code. */
    public static RoomStation fromCode(int code) {
        return Arrays.stream(values()).filter(station -> station.code == code).findFirst().orElse(null);
    }
```

`StationPolicy`, after `sourceId`:

```java
    /** MPP-42: the station a STATION_UPGRADE source id names (inverse of sourceId), or null. */
    public static RoomStation stationOf(long sourceId) {
        return RoomStation.fromCode((int) (sourceId / 10));
    }

    /** MPP-42: the level a STATION_UPGRADE source id bought. */
    public static int levelOf(long sourceId) {
        return (int) (sourceId % 10);
    }
```

- [x] **Step 3: Run the test**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=StationPolicyTest`
Expected: `BUILD SUCCESS`.

### Task 10: The 14-day ledger read ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetSprinkleRepository.java:19`

- [x] **Step 1: Add the derived query after `sumAmountByUserId`**

```java
    /** MPP-42: the person's own rows since a UTC time, newest first (uk_pet_sprinkles leads with user_id). */
    List<PetSprinkle> findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDescIdDesc(Long userId, LocalDateTime since);
```

Imports: `java.time.LocalDateTime`, `java.util.List`.

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 11: The recent-sprinkles DTOs ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/RecentSprinklesDTO.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/SprinkleEntryDTO.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/SprinkleRatesDTO.java`

- [x] **Step 1: Create the three DTOs**

```java
package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** MPP-42: GET /api/pet/sprinkles/recent - the caller's own last 14 days, newest first, plus what each way of earning pays. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentSprinklesDTO {
    private List<SprinkleEntryDTO> entries;
    private SprinkleRatesDTO rates;
}
```

```java
package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

/**
 * MPP-42: one ledger row with the context to describe it. The client groups and words it; every
 * context field is null when it doesn't apply or what it pointed at no longer exists.
 */
@Data
@NoArgsConstructor
public class SprinkleEntryDTO {
    private String sourceType;   // SprinkleSource name
    private int amount;          // + earning, - spend
    private Instant createdAt;   // UTC
    private Long entryId;        // MEAL_EATEN / MEAL_ON_TIME / HOMEMADE_EXTRA: meal_plan_entries.id (kept when the entry is gone)
    private String mealKey;      // those three: "breakfast" | "lunch" | "dinner"
    private LocalDate planDate;  // those three
    private String station;      // STATION_UPGRADE: RoomStation.key()
    private Integer level;       // STATION_UPGRADE: the level bought
    private String decorItem;    // DECOR_PURCHASE: pet_decor_owned.item_key
    private LocalDate weekStart; // FULL_WEEK / SHOPPING_LIST_*: the Monday
}
```

```java
package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-42: SprinklePolicy's payouts, so the Earn tab never hard-codes an amount. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SprinkleRatesDTO {
    private int mealEaten;
    private int onTimeBonus;
    private int homemadeBonus;
    private int fullWeek;
    private int shoppingListGenerated;
    private int shoppingListCompleted;
    private int mealsPerWeek;
}
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 12: SprinkleHistoryService ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/SprinkleHistoryService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/SprinkleHistoryServiceTest.java`

- [x] **Step 1: Write the failing tests**

```java
package com.foodbytes.service;

import com.foodbytes.dto.RecentSprinklesDTO;
import com.foodbytes.dto.SprinkleEntryDTO;
import com.foodbytes.model.Meal;
import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.PetDecorOwned;
import com.foodbytes.model.PetSprinkle;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.PetDecorOwnedRepository;
import com.foodbytes.repository.PetSprinkleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** MPP-42: own rows only, a 14-day window, each source's context, and the rates. */
@ExtendWith(MockitoExtension.class)
class SprinkleHistoryServiceTest {

    private static final LocalDateTime NOW_UTC = LocalDateTime.of(2026, 10, 14, 12, 0);
    private static final LocalDate MON = LocalDate.of(2026, 10, 12);

    @Mock private PetSprinkleRepository sprinkles;
    @Mock private MealPlanEntryRepository entries;
    @Mock private PetDecorOwnedRepository decor;

    private SprinkleHistoryService service;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-10-14T12:00:00Z"), HabitStreakPolicy.ZONE);
        service = new SprinkleHistoryService(sprinkles, entries, decor, clock);
    }

    private static PetSprinkle row(long id, SprinkleSource source, long sourceId, int amount) {
        return new PetSprinkle(id, 7L, source, sourceId, amount, NOW_UTC.minusHours(id));
    }

    @Test
    void recent_readsOnlyTheCallersRows_fromFourteenDaysAgo() {
        when(sprinkles.findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDescIdDesc(7L, NOW_UTC.minusDays(14)))
                .thenReturn(List.of());
        when(entries.findAllById(anyIterable())).thenReturn(List.of());
        when(decor.findAllById(anyIterable())).thenReturn(List.of());

        RecentSprinklesDTO result = service.recent(7L);

        verify(sprinkles).findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDescIdDesc(7L, NOW_UTC.minusDays(14));
        assertThat(result.getEntries()).isEmpty();
    }

    @Test
    void recent_describesEverySource() {
        Meal lunch = new Meal();
        lunch.setKey("lunch");
        MealPlanEntry entry = new MealPlanEntry();
        entry.setId(812L);
        entry.setMeal(lunch);
        entry.setPlanDate(LocalDate.of(2026, 10, 14));
        PetDecorOwned shelf = new PetDecorOwned(31L, 7L, "herb-shelf", null);
        when(sprinkles.findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDescIdDesc(7L, NOW_UTC.minusDays(14)))
                .thenReturn(List.of(
                        row(1, SprinkleSource.MEAL_ON_TIME, 812, 5),
                        row(2, SprinkleSource.MEAL_EATEN, 812, 10),
                        row(3, SprinkleSource.SHOPPING_LIST_COMPLETED, MON.toEpochDay(), 15),
                        row(4, SprinkleSource.STATION_UPGRADE, 22, -300),
                        row(5, SprinkleSource.DECOR_PURCHASE, 31, -120),
                        row(6, SprinkleSource.MEAL_EATEN, 999, 10)));   // entry since deleted
        when(entries.findAllById(anyIterable())).thenReturn(List.of(entry));
        when(decor.findAllById(anyIterable())).thenReturn(List.of(shelf));

        List<SprinkleEntryDTO> out = service.recent(7L).getEntries();

        assertThat(out).hasSize(6);
        assertThat(out.get(0).getSourceType()).isEqualTo("MEAL_ON_TIME");
        assertThat(out.get(0).getMealKey()).isEqualTo("lunch");
        assertThat(out.get(0).getEntryId()).isEqualTo(812L);
        assertThat(out.get(0).getCreatedAt()).isEqualTo(Instant.parse("2026-10-14T11:00:00Z"));
        assertThat(out.get(2).getWeekStart()).isEqualTo(MON);
        assertThat(out.get(3).getStation()).isEqualTo("fridge");
        assertThat(out.get(3).getLevel()).isEqualTo(2);
        assertThat(out.get(3).getAmount()).isEqualTo(-300);
        assertThat(out.get(4).getDecorItem()).isEqualTo("herb-shelf");
        assertThat(out.get(5).getEntryId()).isEqualTo(999L);
        assertThat(out.get(5).getMealKey()).isNull();
    }

    @Test
    void rates_mirrorSprinklePolicy() {
        var rates = SprinkleHistoryService.rates();
        assertThat(rates.getMealEaten()).isEqualTo(SprinklePolicy.MEAL_EATEN);
        assertThat(rates.getShoppingListGenerated()).isEqualTo(10);
        assertThat(rates.getShoppingListCompleted()).isEqualTo(15);
        assertThat(rates.getMealsPerWeek()).isEqualTo(21);
    }
}
```

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinkleHistoryServiceTest`
Expected: compilation failure (`SprinkleHistoryService` missing).

- [x] **Step 2: Implement**

```java
package com.foodbytes.service;

import com.foodbytes.dto.RecentSprinklesDTO;
import com.foodbytes.dto.SprinkleEntryDTO;
import com.foodbytes.dto.SprinkleRatesDTO;
import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.PetDecorOwned;
import com.foodbytes.model.PetSprinkle;
import com.foodbytes.model.RoomStation;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.PetDecorOwnedRepository;
import com.foodbytes.repository.PetSprinkleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * MPP-42 AC 13: the caller's own sprinkles from the last 14 days, newest first, each with enough
 * context for the client to describe it, plus SprinklePolicy's payouts. Two batched lookups (meal
 * entries, decor rows) - never one per row. Only ever reads the caller's user_id.
 */
@Service
@RequiredArgsConstructor
public class SprinkleHistoryService {

    private static final Set<SprinkleSource> MEAL_SOURCES =
            EnumSet.of(SprinkleSource.MEAL_EATEN, SprinkleSource.MEAL_ON_TIME, SprinkleSource.HOMEMADE_EXTRA);
    private static final Set<SprinkleSource> WEEK_SOURCES =
            EnumSet.of(SprinkleSource.FULL_WEEK, SprinkleSource.SHOPPING_LIST_GENERATED, SprinkleSource.SHOPPING_LIST_COMPLETED);

    private final PetSprinkleRepository petSprinkleRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final PetDecorOwnedRepository petDecorOwnedRepository;
    private final Clock clock;

    @Transactional(readOnly = true)
    public RecentSprinklesDTO recent(Long userId) {
        // created_at is UTC wall time (serverTimezone=UTC), so the window is too.
        LocalDateTime since = LocalDateTime.now(clock.withZone(ZoneOffset.UTC)).minusDays(SprinklePolicy.RECENT_DAYS);
        List<PetSprinkle> rows = petSprinkleRepository
                .findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDescIdDesc(userId, since);
        Map<Long, MealPlanEntry> meals = byId(mealPlanEntryRepository.findAllById(sourceIds(rows, MEAL_SOURCES)), MealPlanEntry::getId);
        Map<Long, PetDecorOwned> decor = byId(
                petDecorOwnedRepository.findAllById(sourceIds(rows, EnumSet.of(SprinkleSource.DECOR_PURCHASE))), PetDecorOwned::getId);
        List<SprinkleEntryDTO> entries = rows.stream().map(row -> toDto(row, meals, decor)).toList();
        return new RecentSprinklesDTO(entries, rates());
    }

    static SprinkleRatesDTO rates() {
        return new SprinkleRatesDTO(
                SprinklePolicy.MEAL_EATEN, SprinklePolicy.ON_TIME_BONUS, SprinklePolicy.HOMEMADE_BONUS,
                SprinklePolicy.FULL_WEEK, SprinklePolicy.SHOPPING_LIST_GENERATED, SprinklePolicy.SHOPPING_LIST_COMPLETED,
                SprinklePolicy.mealsPerWeek());
    }

    private static SprinkleEntryDTO toDto(PetSprinkle row, Map<Long, MealPlanEntry> meals, Map<Long, PetDecorOwned> decor) {
        SprinkleEntryDTO dto = new SprinkleEntryDTO();
        SprinkleSource source = row.getSourceType();
        dto.setSourceType(source.name());
        dto.setAmount(row.getAmount());
        dto.setCreatedAt(row.getCreatedAt().toInstant(ZoneOffset.UTC));
        if (MEAL_SOURCES.contains(source)) {
            dto.setEntryId(row.getSourceId());
            MealPlanEntry entry = meals.get(row.getSourceId());
            if (entry != null) {
                dto.setMealKey(entry.getMeal().getKey());
                dto.setPlanDate(entry.getPlanDate());
            }
        } else if (WEEK_SOURCES.contains(source)) {
            dto.setWeekStart(LocalDate.ofEpochDay(row.getSourceId()));
        } else if (source == SprinkleSource.STATION_UPGRADE) {
            RoomStation station = StationPolicy.stationOf(row.getSourceId());
            if (station != null) {
                dto.setStation(station.key());
                dto.setLevel(StationPolicy.levelOf(row.getSourceId()));
            }
        } else if (source == SprinkleSource.DECOR_PURCHASE) {
            PetDecorOwned owned = decor.get(row.getSourceId());
            if (owned != null) dto.setDecorItem(owned.getItemKey());
        }
        return dto;
    }

    private static Set<Long> sourceIds(List<PetSprinkle> rows, Set<SprinkleSource> sources) {
        return rows.stream().filter(row -> sources.contains(row.getSourceType()))
                .map(PetSprinkle::getSourceId).collect(Collectors.toSet());
    }

    private static <T> Map<Long, T> byId(Iterable<T> found, Function<T, Long> id) {
        return StreamSupport.stream(found.spliterator(), false).collect(Collectors.toMap(id, Function.identity()));
    }
}
```

- [x] **Step 3: Run the tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinkleHistoryServiceTest`
Expected: `BUILD SUCCESS`, 0 failures. If Mockito's strict stubs flag `findAllById` as unnecessary in the first test, keep the stubs and mark them `lenient()`. Do not change the service to skip the lookup.

### Task 13: PetSprinkleController ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetSprinkleController.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetSprinkleControllerTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.controller;

import com.foodbytes.dto.RecentSprinklesDTO;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.SprinkleHistoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MPP-42: GET /api/pet/sprinkles/recent - 401 without a principal; otherwise the principal's own rows. */
@WebMvcTest(PetSprinkleController.class)
@AutoConfigureMockMvc(addFilters = false)
class PetSprinkleControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private SprinkleHistoryService sprinkleHistoryService;

    @Test
    void recent_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(get("/api/pet/sprinkles/recent"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        verifyNoInteractions(sprinkleHistoryService);
    }

    @Test
    void recent_readsThePrincipalsOwnRows() {
        UserPrincipal principal = mock(UserPrincipal.class);
        when(principal.getId()).thenReturn(2L);
        RecentSprinklesDTO dto = new RecentSprinklesDTO(List.of(), null);
        when(sprinkleHistoryService.recent(2L)).thenReturn(dto);

        ResponseEntity<?> response = new PetSprinkleController(sprinkleHistoryService).recent(principal);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(dto);
        verify(sprinkleHistoryService).recent(2L);
    }
}
```

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetSprinkleControllerTest`
Expected: compilation failure.

- [x] **Step 2: Implement**

```java
package com.foodbytes.controller;

import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.SprinkleHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * MPP-42: the caller's own recent sprinkles and the payout amounts (see SprinkleHistoryService).
 * Takes no user parameter - it can only ever read the principal's own ledger.
 */
@RestController
@RequestMapping("/api/pet/sprinkles")
@RequiredArgsConstructor
public class PetSprinkleController {

    private final SprinkleHistoryService sprinkleHistoryService;

    @GetMapping("/recent")
    public ResponseEntity<?> recent(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(sprinkleHistoryService.recent(userPrincipal.getId()));
    }
}
```

- [x] **Step 3: Run the test**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetSprinkleControllerTest`
Expected: `BUILD SUCCESS`.

---

## Phase 4 — Frontend data and pure helpers

Constants, the service call, the last-seen store, the fetch hook and the pure helpers with their node check. Nothing renders them yet, so the app looks unchanged and `npm run build` stays green.

### Task 14: Sprinkles constants and the fourth tab key ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/petSprinkles.js`
- Modify: `foodbytes-app/client/src/constants/petDecor.js:212-217`

- [x] **Step 1: Create `petSprinkles.js`**

```js
/**
 * MPP-42: sprinkles copy — the Shop's ✨ Earn tab, the footnote link, the recent list and the header
 * count-up. Amounts live on the server (RecentSprinklesDTO.rates); this file only names things.
 * Copy follows pip-sprinkles-earn-mockup.html (Version B).
 */
export const EARN_TAB_LABEL = '✨ Earn'
export const EARN_INTRO = 'Pip pays sprinkles for keeping your plan going. Spend them in the other tabs.'
export const EARN_FOOT_TEXT = 'How do I earn sprinkles?'
export const EARN_FOOT_LINK = 'See Earn →'
export const EARN_NEW_TAG = 'New'
export const EARN_LOADING = 'Loading your sprinkles…'
export const EARN_LOAD_ERROR = "Couldn't load your sprinkles. Check your connection and try again."
export const EARN_RETRY_LABEL = 'Try again'

// AC 2, in order. rateKey names a RecentSprinklesDTO.rates field.
export const EARN_WAYS = [
  { key: 'meal', icon: '🍽', title: 'Eat a planned meal', detail: 'Tick breakfast, lunch or dinner as eaten, on its day or any day after. Late still counts.', rateKey: 'mealEaten' },
  { key: 'onTime', icon: '⏰', title: 'Eat it on time', detail: 'Bonus when it’s ticked on its day, by its meal time.', rateKey: 'onTimeBonus' },
  { key: 'homemade', icon: '🥖', title: 'Make the extra homemade', detail: 'The meal’s extra (bread, sauce…) is set to homemade.', rateKey: 'homemadeBonus' },
  { key: 'fullWeek', icon: '📅', title: 'Plan a full week', detail: 'Every day Mon–Sun has breakfast, lunch and dinner. Pays both of you on a shared plan.', rateKey: 'fullWeek' },
  { key: 'listMade', icon: '🧾', title: 'Make a shopping list', detail: 'Generate the week’s list. Once a week, pays both of you.', rateKey: 'shoppingListGenerated', isNew: true },
  { key: 'listDone', icon: '🛒', title: 'Finish the shopping', detail: 'Tick off every item on the list. Once a week, pays both of you.', rateKey: 'shoppingListCompleted', isNew: true }
]

export const GOOD_WEEK_TITLE = 'A good week'
export const GOOD_WEEK_LABELS = {
  meals: count => `${count} meals eaten`,
  onTime: '…all on time',
  fullWeek: 'Full week planned',
  shopping: 'Shopping list made + finished',
  total: 'About'
}

export const RECENT_TITLE = 'Your recent sprinkles'
export const RECENT_EMPTY = 'Nothing in the last two weeks yet. Tick a meal you’ve eaten to start.'

// AC 6
export const GOOD_TO_KNOW_TITLE = 'Good to know'
export const GOOD_TO_KNOW = [
  'Snacks and extras on their own don’t pay.',
  'Forgot to tick? A meal ticked later still pays, just not the on-time bonus.',
  'Ticking a meal before its day doesn’t pay.',
  'Each meal pays once. Un-ticking doesn’t take sprinkles back.',
  'Your meals pay you. A full week and the shopping pay you both.',
  'The shopping rewards pay once per Mon–Sun week, however many lists you make.'
]

// Recent-list wording (utils/sprinkleHistory.js).
export const RECENT_TEXT = {
  eaten: meal => `${meal} eaten`,
  mealFallback: 'Meal eaten',
  onTime: 'on time',
  homemade: 'homemade',
  fullWeek: range => `Full week planned (${range})`,
  listMade: 'Shopping list made',
  listDone: 'Shopping finished',
  bought: name => `Bought the ${name}`,
  boughtStyle: (name, isWall) => `Bought the ${name} ${isWall ? 'walls' : 'floor'}`,
  spendFallback: 'Shop purchase',
  earnFallback: 'Sprinkles earned'
}
export const RELATIVE_DAY = { today: 'Today', yesterday: 'Yesterday' }
export const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Header count-up (AC 15, 18) — mockup timings.
export const SPRINKLES_SEEN_STORAGE_KEY = 'foodbytes.pip.sprinklesSeen'
export const COUNT_UP_DELAY_MS = 400
export const COUNT_UP_MIN_MS = 700
export const COUNT_UP_MAX_MS = 1600
export const COUNT_UP_MS_PER_SPRINKLE = 6
export const GAIN_PILL_MS = 1900
export const GAIN_PILL_REDUCED_MS = 2000
export const GOLD_HOLD_MS = 500
export const SPARK_COUNT = 7
export const SPRINKLES_LIVE_TEXT = (gain, total) => `You earned ${gain} sprinkles. Total ${total} sprinkles.`
export const EARNED_FALLBACK_LINE = gain => `+${gain} sprinkles! ✨`
```

- [x] **Step 2: Add the Earn tab key and label**

In `petDecor.js`, add `import { EARN_TAB_LABEL } from './petSprinkles.js'` at the top of the file (the file has no imports today; use the `.js` extension so node checks can import it), then:

```js
export const SHOP_TAB_KEYS = { UPGRADES: 'upgrades', DECOR: 'decor', STYLES: 'styles', EARN: 'earn' }
export const SHOP_TABS = [
  { key: SHOP_TAB_KEYS.UPGRADES, label: 'Upgrades' },
  { key: SHOP_TAB_KEYS.DECOR, label: 'Decor' },
  { key: SHOP_TAB_KEYS.STYLES, label: 'Walls & floors' },
  { key: SHOP_TAB_KEYS.EARN, label: EARN_TAB_LABEL } // MPP-42: last; the shop still opens on Upgrades
]
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 15: `getRecentSprinkles` in petService ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/services/petService.js:100`

- [x] **Step 1: Add the read after `placeDecor`**

```js
  /**
   * MPP-42: your own sprinkles from the last 14 days (newest first) and what each way of earning pays.
   * Resolves RecentSprinklesDTO { entries: [{ sourceType, amount, createdAt, entryId, mealKey, planDate,
   * station, level, decorItem, weekStart }], rates: { mealEaten, onTimeBonus, homemadeBonus, fullWeek,
   * shoppingListGenerated, shoppingListCompleted, mealsPerWeek } }.
   *
   * @param {{ signal?: AbortSignal }} [options]
   */
  async getRecentSprinkles({ signal } = {}) {
    const response = await api.get('/pet/sprinkles/recent', { signal })
    return response.data
  }
```

(Add a comma after `placeDecor`'s closing `}` so the object literal stays valid.)

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 16: Pure helpers + node check ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/sprinkleHistory.js`
- Create: `foodbytes-app/client/src/utils/sprinkleHistory.check.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [x] **Step 1: Write the check first**

```js
// Run: npm run check:sprinkles   (from foodbytes-app/client)
//
// No test runner is wired into client/package.json, so MPP-42's grouping, wording, good-week maths,
// count-up duration and Pip's earned line are pinned here. Mirrors pipBubble.check.mjs.
import assert from 'node:assert/strict'
import { countUpDuration, earnedLine, goodWeek, groupRecent, relativeDay, weekRange } from './sprinkleHistory.js'

const RATES = { mealEaten: 10, onTimeBonus: 5, homemadeBonus: 5, fullWeek: 20, shoppingListGenerated: 10, shoppingListCompleted: 15, mealsPerWeek: 21 }
const at = (iso) => `${iso}T12:00:00Z`
const meal = (sourceType, entryId, amount, mealKey = 'breakfast', day = '2026-10-15') =>
  ({ sourceType, entryId, amount, mealKey, planDate: day, createdAt: at(day) })

// AC 4: 210 + 105 + 20 + 25 = 360
assert.deepEqual(goodWeek(RATES), { mealCount: 21, meals: 210, onTime: 105, fullWeek: 20, shopping: 25, total: 360 })

// AC 5: one meal's three rows → one line; newest first is kept.
const grouped = groupRecent([
  meal('HOMEMADE_EXTRA', 1, 5), meal('MEAL_ON_TIME', 1, 5), meal('MEAL_EATEN', 1, 10),
  meal('MEAL_EATEN', 2, 10, 'dinner', '2026-10-14'),
  { sourceType: 'SHOPPING_LIST_COMPLETED', amount: 15, weekStart: '2026-10-12', createdAt: at('2026-10-14') },
  { sourceType: 'STATION_UPGRADE', amount: -300, station: 'fridge', level: 2, createdAt: at('2026-10-14') },
  { sourceType: 'DECOR_PURCHASE', amount: -120, decorItem: 'herb-shelf', createdAt: at('2026-10-13') },
  { sourceType: 'DECOR_PURCHASE', amount: -80, decorItem: 'floor-oak', createdAt: at('2026-10-13') },
  { sourceType: 'FULL_WEEK', amount: 20, weekStart: '2026-10-13', createdAt: at('2026-10-12') },
  { sourceType: 'DECOR_PURCHASE', amount: -50, decorItem: null, createdAt: at('2026-10-12') }
])
assert.deepEqual(grouped.map(l => [l.text, l.amount]), [
  ['Breakfast eaten · on time · homemade', 20],
  ['Dinner eaten', 10],
  ['Shopping finished', 15],
  ['Bought the Mini fridge', -300],
  ['Bought the Herb shelf', -120],
  ['Bought the Oak boards floor', -80],
  ['Full week planned (13–19 Oct)', 20],
  ['Shop purchase', -50]
])
assert.equal(new Set(grouped.map(l => l.key)).size, grouped.length) // unique React keys

// A week that spans two months.
assert.equal(weekRange('2026-09-28'), '28 Sep – 4 Oct')

// Relative days against a local "today".
assert.equal(relativeDay(at('2026-10-15'), '2026-10-15'), 'Today')
assert.equal(relativeDay(at('2026-10-14'), '2026-10-15'), 'Yesterday')
assert.equal(relativeDay(at('2026-10-11'), '2026-10-15'), 'Sun')
assert.equal(relativeDay(at('2026-10-03'), '2026-10-15'), '3 Oct')

// AC 15: 0.7 s floor, 6 ms per sprinkle, 1.6 s ceiling.
assert.equal(countUpDuration(1), 706)
assert.equal(countUpDuration(35), 910)
assert.equal(countUpDuration(500), 1600)

// AC 16: Pip's line, from the newest earnings that add up to the gain (spends are skipped).
const recent = [
  meal('MEAL_ON_TIME', 9, 5, 'lunch'), meal('MEAL_EATEN', 9, 10, 'lunch'),
  { sourceType: 'STATION_UPGRADE', amount: -300, station: 'bed', level: 2, createdAt: at('2026-10-15') },
  meal('MEAL_ON_TIME', 8, 5), meal('MEAL_EATEN', 8, 10),
  meal('MEAL_EATEN', 7, 10, 'dinner', '2026-10-14')
]
assert.equal(earnedLine(recent, 30), '+30: 2 meals, both on time ✨')
assert.equal(earnedLine(recent, 15), '+15: a meal, on time ✨')
assert.equal(earnedLine(recent, 40), '+40: 3 meals, 2 on time ✨')
assert.equal(earnedLine([meal('MEAL_EATEN', 3, 10), meal('MEAL_EATEN', 4, 10)], 20), '+20: 2 meals ✨')
assert.equal(earnedLine([
  { sourceType: 'SHOPPING_LIST_COMPLETED', amount: 15, weekStart: '2026-10-12', createdAt: at('2026-10-15') },
  { sourceType: 'FULL_WEEK', amount: 20, weekStart: '2026-10-12', createdAt: at('2026-10-15') },
  { sourceType: 'SHOPPING_LIST_GENERATED', amount: 10, weekStart: '2026-10-12', createdAt: at('2026-10-15') }
], 45), '+45! Full week + shopping 🛒✨')
assert.equal(earnedLine([
  { sourceType: 'FULL_WEEK', amount: 20, weekStart: '2026-10-12', createdAt: at('2026-10-15') }, meal('MEAL_EATEN', 5, 10)
], 30), '+30! Full week + a meal ✨')
assert.equal(earnedLine([], 12), '+12 sprinkles! ✨')

console.log('sprinkleHistory: all checks passed')
```

Add the npm script after `check:awards` (keep the existing ones):

```json
    "check:sprinkles": "node src/utils/sprinkleHistory.check.mjs",
```

Run: `cd foodbytes-app\client; npm run check:sprinkles`
Expected: fails with `Cannot find module …/sprinkleHistory.js`.

- [x] **Step 2: Implement `sprinkleHistory.js`**

```js
import { DECOR_ITEMS, ROOM_STYLES, ROOM_SPOTS } from '../constants/petDecor.js'
import { MEAL_TYPE_LABELS } from '../constants/mealTypes.js'
import { STATION_LEVEL_NAMES } from '../constants/petShop.js'
import {
  COUNT_UP_MAX_MS, COUNT_UP_MIN_MS, COUNT_UP_MS_PER_SPRINKLE, EARNED_FALLBACK_LINE,
  RECENT_TEXT, RELATIVE_DAY, SHORT_MONTHS, SHORT_WEEKDAYS
} from '../constants/petSprinkles.js'

/**
 * MPP-42: the Earn tab's and the count-up's pure logic — grouping and wording the recent ledger,
 * the good-week sum, the count-up duration and Pip's "+N …" line. Pinned by sprinkleHistory.check.mjs.
 * Entries are RecentSprinklesDTO.entries, newest first.
 */

const MEAL_SOURCES = ['MEAL_EATEN', 'MEAL_ON_TIME', 'HOMEMADE_EXTRA']
const SHOPPING_SOURCES = ['SHOPPING_LIST_GENERATED', 'SHOPPING_LIST_COMPLETED']
const DAY_MS = 86400000
const isMeal = (entry) => MEAL_SOURCES.includes(entry.sourceType) && entry.entryId != null

/** AC 4: a full week of every meal, all on time, the full week and both shopping rewards. */
export function goodWeek(rates) {
  const meals = rates.mealsPerWeek * rates.mealEaten
  const onTime = rates.mealsPerWeek * rates.onTimeBonus
  const shopping = rates.shoppingListGenerated + rates.shoppingListCompleted
  return { mealCount: rates.mealsPerWeek, meals, onTime, fullWeek: rates.fullWeek, shopping, total: meals + onTime + rates.fullWeek + shopping }
}

/** AC 5: one line per row, except one meal's MEAL_EATEN + MEAL_ON_TIME + HOMEMADE_EXTRA, which share a line. */
export function groupRecent(entries) {
  const lines = []
  const byMeal = new Map()
  entries.forEach((entry, index) => {
    if (isMeal(entry)) {
      const line = byMeal.get(entry.entryId)
      if (line) {
        line.amount += entry.amount
        line.sources.add(entry.sourceType)
        if (!line.entry.mealKey && entry.mealKey) line.entry = entry
        return
      }
      const fresh = { key: `meal-${entry.entryId}`, amount: entry.amount, createdAt: entry.createdAt, sources: new Set([entry.sourceType]), entry }
      byMeal.set(entry.entryId, fresh)
      lines.push(fresh)
      return
    }
    lines.push({ key: `${entry.sourceType}-${index}`, amount: entry.amount, createdAt: entry.createdAt, sources: new Set([entry.sourceType]), entry })
  })
  return lines.map(({ key, amount, createdAt, sources, entry }) => ({ key, amount, createdAt, text: describe(entry, sources) }))
}

function describe(entry, sources) {
  if (MEAL_SOURCES.includes(entry.sourceType)) {
    const label = MEAL_TYPE_LABELS[entry.mealKey]
    const parts = [label ? RECENT_TEXT.eaten(label) : RECENT_TEXT.mealFallback]
    if (sources.has('MEAL_ON_TIME')) parts.push(RECENT_TEXT.onTime)
    if (sources.has('HOMEMADE_EXTRA')) parts.push(RECENT_TEXT.homemade)
    return parts.join(' · ')
  }
  switch (entry.sourceType) {
    case 'FULL_WEEK': return entry.weekStart ? RECENT_TEXT.fullWeek(weekRange(entry.weekStart)) : RECENT_TEXT.earnFallback
    case 'SHOPPING_LIST_GENERATED': return RECENT_TEXT.listMade
    case 'SHOPPING_LIST_COMPLETED': return RECENT_TEXT.listDone
    case 'STATION_UPGRADE': {
      const name = STATION_LEVEL_NAMES[entry.station]?.[entry.level - 1]
      return name ? RECENT_TEXT.bought(name) : RECENT_TEXT.spendFallback
    }
    case 'DECOR_PURCHASE': {
      const item = DECOR_ITEMS[entry.decorItem]
      if (item) return RECENT_TEXT.bought(item.label)
      const style = ROOM_STYLES[entry.decorItem]
      if (style) return RECENT_TEXT.boughtStyle(style.label, style.spot === ROOM_SPOTS.WALL_STYLE)
      return RECENT_TEXT.spendFallback
    }
    default: return entry.amount < 0 ? RECENT_TEXT.spendFallback : RECENT_TEXT.earnFallback
  }
}

const parseISODate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/** "13–19 Oct", or "28 Sep – 4 Oct" across a month. weekStart is a Monday "YYYY-MM-DD". */
export function weekRange(weekStart) {
  const start = parseISODate(weekStart)
  const end = new Date(start.getTime() + 6 * DAY_MS)
  const month = (date) => SHORT_MONTHS[date.getUTCMonth()]
  return start.getUTCMonth() === end.getUTCMonth()
    ? `${start.getUTCDate()}–${end.getUTCDate()} ${month(end)}`
    : `${start.getUTCDate()} ${month(start)} – ${end.getUTCDate()} ${month(end)}`
}

/** The device's local calendar date of a Date, as "YYYY-MM-DD". */
export function localISO(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** AC 5: Today / Yesterday / weekday (within the week) / "3 Oct", on the device's own calendar. */
export function relativeDay(createdAt, todayISO) {
  const day = parseISODate(localISO(new Date(createdAt)))
  const days = Math.round((parseISODate(todayISO) - day) / DAY_MS)
  if (days <= 0) return RELATIVE_DAY.today
  if (days === 1) return RELATIVE_DAY.yesterday
  if (days < 7) return SHORT_WEEKDAYS[day.getUTCDay()]
  return `${day.getUTCDate()} ${SHORT_MONTHS[day.getUTCMonth()]}`
}

/** AC 15: longer for bigger gains, 0.7–1.6 s. */
export function countUpDuration(gain) {
  return Math.min(COUNT_UP_MAX_MS, Math.max(COUNT_UP_MIN_MS, COUNT_UP_MIN_MS + gain * COUNT_UP_MS_PER_SPRINKLE))
}

/**
 * AC 16: what Pip says after the count-up. Takes the newest earnings (spends skipped) until they add
 * up to the gain — no clock comparison — and says what they were. Nothing matched → a plain total.
 */
export function earnedLine(entries, gain) {
  const picked = []
  let sum = 0
  for (const entry of entries) {
    if (sum >= gain) break
    if (entry.amount <= 0) continue
    picked.push(entry)
    sum += entry.amount
  }
  if (picked.length === 0) return EARNED_FALLBACK_LINE(gain)

  const meals = new Set(picked.filter(isMeal).map(e => e.entryId))
  const onTime = new Set(picked.filter(e => e.sourceType === 'MEAL_ON_TIME').map(e => e.entryId))
  const fullWeek = picked.some(e => e.sourceType === 'FULL_WEEK')
  const shopping = picked.some(e => SHOPPING_SOURCES.includes(e.sourceType))
  const mealPart = meals.size === 1 ? 'a meal' : `${meals.size} meals`

  if (fullWeek || shopping) {
    const parts = [fullWeek && 'full week', shopping && 'shopping', meals.size > 0 && mealPart].filter(Boolean)
    const text = parts.join(' + ')
    return `+${gain}! ${text[0].toUpperCase()}${text.slice(1)} ${shopping ? '🛒✨' : '✨'}`
  }
  if (meals.size === 0) return EARNED_FALLBACK_LINE(gain)
  if (onTime.size === 0) return `+${gain}: ${mealPart} ✨`
  if (meals.size === 1) return `+${gain}: a meal, on time ✨`
  if (onTime.size === meals.size) return `+${gain}: ${mealPart}, ${meals.size === 2 ? 'both' : 'all'} on time ✨`
  return `+${gain}: ${mealPart}, ${onTime.size} on time ✨`
}
```

Note: in the check, `earnedLine(recent, 40)` picks lunch 9 (15), skips the spend, breakfast 8 (15) and dinner 7 (10), which gives 3 meals with 2 on time. `earnedLine(recent, 15)` stops after entry 9's two rows. `ROOM_SPOTS` (petDecor.js:7) holds `WALL_STYLE: 'wallStyle'`. React StrictMode (main.jsx) double-runs effects in dev. That is safe for `useSprinkleCountUp` in Task 23: the second run reads the balance the first run just wrote, so it starts no second animation.

- [x] **Step 3: Run the check**

Run: `cd foodbytes-app\client; npm run check:sprinkles`
Expected: `sprinkleHistory: all checks passed`. The relative-day cases use 12:00Z, so they hold in any timezone between UTC−11 and UTC+11. Then run `npm run check:bubble` and `npm run check:awards` and expect both to still pass.

### Task 17: The last-seen balance store ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/sprinklesSeenStore.js`

- [x] **Step 1: Create it (mirrors `awardSeenStore.js`)**

```js
import { SPRINKLES_SEEN_STORAGE_KEY } from '../constants/petSprinkles.js'

// userId → the last balance the Pip tab showed. Survives route changes but not a reload, so with
// storage blocked the count-up still never replays within a page load (MPP-42 AC 14).
const memory = new Map()

const keyFor = (userId) => `${SPRINKLES_SEEN_STORAGE_KEY}.${userId}`

/** The balance this browser last showed this user on the Pip tab, or null (first visit / unreadable). Memory wins. */
export function readSeenSprinkles(userId) {
  if (memory.has(userId)) return memory.get(userId)
  try {
    const raw = localStorage.getItem(keyFor(userId))
    if (raw === null) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    // Storage blocked: treat as a first visit — no animation (AC 14).
    return null
  }
}

/** Records the balance in memory always, and in localStorage when it is available. */
export function writeSeenSprinkles(userId, balance) {
  memory.set(userId, balance)
  try {
    localStorage.setItem(keyFor(userId), String(balance))
  } catch {
    // Storage disabled or full: the memory copy still stops a replay this load.
  }
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 18: `useRecentSprinkles` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useRecentSprinkles.js`

- [x] **Step 1: Create the hook**

```js
import { useEffect, useState } from 'react'
import petService from '../services/petService'
import { EARN_LOAD_ERROR } from '../constants/petSprinkles'

// Axios rejects an aborted request with code ERR_CANCELED; that is not an error to show.
const isCancelled = (err) => err?.code === 'ERR_CANCELED'

/**
 * MPP-42: GET /api/pet/sprinkles/recent for the Earn tab — fetched each time the tab mounts, aborted
 * when it unmounts. Loading, error (server message first) and data are separate; retry() refetches.
 *
 * @param {{ enabled?: boolean }} [input]
 * @returns {{ data: { entries: Object[], rates: Object }|null, loading: boolean, error: string|null, retry: () => void }}
 */
export function useRecentSprinkles({ enabled = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    petService.getRecentSprinkles({ signal: controller.signal })
      .then(result => setData(result))
      .catch(err => {
        if (!isCancelled(err)) setError(err.response?.data?.error || EARN_LOAD_ERROR)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [enabled, reloadKey])

  const retry = () => setReloadKey(key => key + 1)

  return { data, loading, error, retry }
}

export default useRecentSprinkles
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

---

## Phase 5 — The Earn tab

The fourth tab, its content and the footnote link on the other three tabs. At the end of this phase the Shop is complete and the Pip header is still unchanged.

### Task 19: `EarnRecentList` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/EarnRecentList.jsx`

- [x] **Step 1: Create it**

```jsx
import { RECENT_EMPTY, RECENT_TITLE } from '../../../constants/petSprinkles'
import { groupRecent, localISO, relativeDay } from '../../../utils/sprinkleHistory'

/**
 * MPP-42 AC 5: "Your recent sprinkles" — the caller's own last 14 days, newest first, earnings green +
 * and spends red −, one meal's rows on one line. Empty is its own state, never a blank list.
 */
function EarnRecentList({ entries }) {
  const todayISO = localISO(new Date())
  const lines = groupRecent(entries)

  return (
    <section aria-labelledby="pip-earn-recent">
      <h4 id="pip-earn-recent" className="pip-shop-group">{RECENT_TITLE}</h4>
      {lines.length === 0 ? (
        <p className="pip-earn-empty">{RECENT_EMPTY}</p>
      ) : (
        <ul className="pip-earn-recent">
          {lines.map(line => (
            <li key={line.key}>
              <span>
                {line.text}
                <small>{relativeDay(line.createdAt, todayISO)}</small>
              </span>
              <span className={line.amount < 0 ? 'pip-earn-minus' : 'pip-earn-plus'}>
                {line.amount < 0 ? `−${-line.amount}` : `+${line.amount}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default EarnRecentList
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 20: `ShopEarnTab` + its CSS ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/ShopEarnTab.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/ShopEarnTab.css`

- [x] **Step 1: Create the component**

```jsx
import { SPRINKLES_ICON } from '../../../constants/petRoom'
import {
  EARN_INTRO, EARN_LOADING, EARN_NEW_TAG, EARN_RETRY_LABEL, EARN_WAYS,
  GOOD_TO_KNOW, GOOD_TO_KNOW_TITLE, GOOD_WEEK_LABELS, GOOD_WEEK_TITLE
} from '../../../constants/petSprinkles'
import useRecentSprinkles from '../../../hooks/useRecentSprinkles'
import { goodWeek } from '../../../utils/sprinkleHistory'
import EarnRecentList from './EarnRecentList'
import './ShopEarnTab.css'

/**
 * MPP-42: the Shop's ✨ Earn tab — every way to earn with the server's amounts (AC 2–3), a worked
 * good week (AC 4), your recent sprinkles (AC 5) and the small rules (AC 6). Amounts and history
 * come from one read, so while it loads or fails only the static rules show.
 */
function ShopEarnTab() {
  const recent = useRecentSprinkles()
  const rates = recent.data?.rates ?? null
  const week = rates ? goodWeek(rates) : null

  return (
    <div className="pip-earn">
      <p className="pip-shop-intro">{EARN_INTRO}</p>
      {recent.loading && !recent.data && <p className="pip-earn-loading" aria-busy="true">{EARN_LOADING}</p>}
      {recent.error && (
        <div className="pip-earn-error" role="alert">
          <p>{recent.error}</p>
          <button type="button" className="pip-earn-retry" onClick={recent.retry}>{EARN_RETRY_LABEL}</button>
        </div>
      )}
      {rates && (
        <ul className="pip-earn-ways">
          {EARN_WAYS.map(way => (
            <li key={way.key} className="pip-earn-way">
              <span className="pip-earn-icon" aria-hidden="true">{way.icon}</span>
              <div>
                <h4>
                  {way.title}
                  {way.isNew && <span className="pip-earn-new">{EARN_NEW_TAG}</span>}
                </h4>
                <p>{way.detail}</p>
              </div>
              <span className="pip-earn-amount">+{rates[way.rateKey]} {SPRINKLES_ICON}</span>
            </li>
          ))}
        </ul>
      )}
      {week && (
        <div className="pip-earn-week">
          <b>{GOOD_WEEK_TITLE}</b>
          <table>
            <tbody>
              <tr><td>{GOOD_WEEK_LABELS.meals(week.mealCount)}</td><td>{week.meals}</td></tr>
              <tr><td>{GOOD_WEEK_LABELS.onTime}</td><td>{week.onTime}</td></tr>
              <tr><td>{GOOD_WEEK_LABELS.fullWeek}</td><td>{week.fullWeek}</td></tr>
              <tr><td>{GOOD_WEEK_LABELS.shopping}</td><td>{week.shopping}</td></tr>
              <tr className="pip-earn-week-total"><td>{GOOD_WEEK_LABELS.total}</td><td>{week.total} {SPRINKLES_ICON}</td></tr>
            </tbody>
          </table>
        </div>
      )}
      {recent.data && <EarnRecentList entries={recent.data.entries} />}
      <h4 className="pip-shop-group">{GOOD_TO_KNOW_TITLE}</h4>
      <ul className="pip-earn-rules">
        {GOOD_TO_KNOW.map(rule => <li key={rule}>{rule}</li>)}
      </ul>
    </div>
  )
}

export default ShopEarnTab
```

`SPRINKLES_ICON` is `'✨'` (`constants/petRoom.js:94`).

- [x] **Step 2: Create the CSS (mockup tokens; mobile-first)**

```css
/* MPP-42: the Shop's ✨ Earn tab (pip-sprinkles-earn-mockup.html, Version B). Tokens as ShopView.css. */
.pip-earn-ways { margin: 0; padding: 0; list-style: none; }

.pip-earn-way {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
  padding: 10px;
  border: 1px solid #e3dcf3;
  border-radius: 14px;
  background: #fcfbff;
}

.pip-earn-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(#ece5fb, #d6c9f0);
  font-size: 1.25rem;
}

.pip-earn-way h4 { margin: 0; font-size: 0.9rem; }
.pip-earn-way p { margin: 1px 0 0; font-size: 0.74rem; color: #6f6789; line-height: 1.35; }

.pip-earn-new {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #7c5cd6;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  vertical-align: middle;
}

.pip-earn-amount {
  padding: 4px 9px;
  border-radius: 999px;
  background: #fff7d6;
  font-weight: 800;
  font-size: 0.82rem;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.pip-earn-week { margin: 4px 0 10px; padding: 10px 12px; border-radius: 14px; background: #f3effc; font-size: 0.82rem; }
.pip-earn-week b { color: #4a3f80; }
.pip-earn-week table { width: 100%; border-collapse: collapse; margin-top: 6px; font-variant-numeric: tabular-nums; }
.pip-earn-week td { padding: 2px 0; }
.pip-earn-week td:last-child { text-align: right; font-weight: 700; }
.pip-earn-week-total td { border-top: 1px solid #d6c9f0; padding-top: 5px; font-weight: 800; }

.pip-earn-recent { margin: 0; padding: 0; list-style: none; font-size: 0.82rem; }
.pip-earn-recent li { display: flex; justify-content: space-between; gap: 8px; padding: 7px 2px; border-bottom: 1px solid #f0ecf8; }
.pip-earn-recent small { display: block; color: #6f6789; font-size: 0.7rem; }
.pip-earn-plus { color: #2f7a3a; font-weight: 800; white-space: nowrap; }
.pip-earn-minus { color: #a4281d; font-weight: 800; white-space: nowrap; }

.pip-earn-rules { margin: 0; padding-left: 18px; font-size: 0.78rem; color: #6f6789; }
.pip-earn-rules li { margin-bottom: 4px; }

.pip-earn-loading, .pip-earn-empty { margin: 8px 0; font-size: 0.82rem; color: #6f6789; }

.pip-earn-error { margin: 8px 0; font-size: 0.82rem; color: #a4281d; }
.pip-earn-error p { margin: 0 0 6px; }

.pip-earn-retry {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid #e3dcf3;
  border-radius: 999px;
  background: #fff;
  font-weight: 700;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.pip-earn-retry:active { background: #f3effc; }
.pip-earn-retry:focus-visible { outline: 2px solid #7c5cd6; outline-offset: 2px; }

@media (hover: hover) {
  .pip-earn-retry:hover { background: #f3effc; }
}
```

- [x] **Step 3: Build and measure**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors. Then run `(Get-Content src\components\pet\room\ShopEarnTab.jsx | Measure-Object -Line).Lines`, which should be under 200.

### Task 21: Wire the Earn tab and the footnote link into ShopView ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/ShopView.jsx:1-11,15,63-66`
- Modify: `foodbytes-app/client/src/constants/petShop.js:10`
- Modify: `foodbytes-app/client/src/components/pet/room/ShopView.css` (append the link rule)

- [x] **Step 1: Remove the old footnote constant**

Delete `export const SHOP_FOOTNOTE = …` from `petShop.js`. Then run `Select-String -Path src\**\*.js*,src\*.js* -Pattern "SHOP_FOOTNOTE"` and expect only `ShopView.jsx`, which is fixed next.

- [x] **Step 2: Edit ShopView**

Imports:

```jsx
import { FREE_MODE_SHOP_NOTE, SHOP_CLOSE_LABEL, SHOP_INTRO, SHOP_STATIONS, SHOP_TITLE } from '../../../constants/petShop'
import { EARN_FOOT_LINK, EARN_FOOT_TEXT } from '../../../constants/petSprinkles'
import ShopEarnTab from './ShopEarnTab'
```

Add to the Javadoc: `MPP-42: a fourth ✨ Earn tab (how sprinkles are earned + your recent ones); the other tabs end with a link to it.`

Inside the component, before `return`:

```jsx
  // MPP-42 AC 7: the footnote link opens Earn and moves focus to its tab, as an arrow key would.
  const openEarn = () => {
    shop.setTab(SHOP_TAB_KEYS.EARN)
    document.getElementById(`${titleId}-tab-${SHOP_TAB_KEYS.EARN}`)?.focus()
  }
  const isDecorTab = shop.tab === SHOP_TAB_KEYS.DECOR || shop.tab === SHOP_TAB_KEYS.STYLES
```

Replace lines 63–66 (intro, decor, styles, footnote) with:

```jsx
        {isDecorTab && <p className="pip-shop-intro">{DECOR_SHOP_INTRO}</p>}
        {shop.tab === SHOP_TAB_KEYS.DECOR && <ShopDecorTab shop={shop} />}
        {shop.tab === SHOP_TAB_KEYS.STYLES && <ShopStylesTab shop={shop} />}
        {shop.tab === SHOP_TAB_KEYS.EARN && <ShopEarnTab />}
        {shop.tab !== SHOP_TAB_KEYS.EARN && (
          <p className="pip-shop-foot">
            {EARN_FOOT_TEXT}{' '}
            <button type="button" className="pip-shop-foot-link" onClick={openEarn}>{EARN_FOOT_LINK}</button>
          </p>
        )}
```

- [x] **Step 3: Style the link (44 px hit area, no hover-only state)**

Append to `ShopView.css`:

```css
/* MPP-42 AC 7: "See Earn →" — link-styled, with a 44px hit area. */
.pip-shop-foot-link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 4px;
  border: 0;
  background: none;
  color: #7c5cd6;
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.pip-shop-foot-link:active { color: #4a3f80; }
.pip-shop-foot-link:focus-visible { outline: 2px solid #7c5cd6; outline-offset: 2px; border-radius: 4px; }

@media (hover: hover) {
  .pip-shop-foot-link:hover { color: #4a3f80; }
}
```

- [x] **Step 4: Build, then check manually**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

Manual check (backend running, logged in, `/pet`, 390 px wide viewport):
- Open 🛍 Shop. It opens on Upgrades and shows four tabs with "✨ Earn" last. All four fit on one row with no horizontal scroll.
- Focus a tab. ←/→ cycle all four tabs.
- On Upgrades, Decor and Walls & floors, the bottom reads "How do I earn sprinkles? See Earn →". Tapping the link switches to Earn and focuses its tab.
- Earn shows six rows in AC 2 order. The amounts match `SprinklePolicy` (10/5/5/20/10/15), and the two shopping rows carry "New".
- "A good week" shows 210 / 105 / 20 / 25 / About 360 ✨.
- The recent list matches your ledger, and one meal's rows appear as one line.
- Stop the backend and reopen Earn: an error shows with "Try again", and Good to know still shows.

---

## Phase 6 — Count-up on returning to Pip

The decision hook, the frame hook, the chip, and the wiring into `PipHeader` and `PetView`, including the bubble line and its queue. This is the last behaviour change, and the phase ends with the whole feature visible.

### Task 22: `useCountUpNumber` (frames, inside the chip) ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useCountUpNumber.js`

- [x] **Step 1: Create the hook**

```js
import { useEffect, useState } from 'react'
import { COUNT_UP_DELAY_MS, GAIN_PILL_MS, GAIN_PILL_REDUCED_MS, GOLD_HOLD_MS } from '../constants/petSprinkles'
import { countUpDuration } from '../utils/sprinkleHistory'

const IDLE = { value: null, phase: 'idle' }

/**
 * MPP-42 AC 15 / 18: animates one count-up run inside SprinklesChip, so frames re-render the chip
 * alone. waiting (old number, COUNT_UP_DELAY_MS) → counting (ease-out cubic) → done (gold holds while
 * the pill finishes) → idle (value null: show the live balance). Reduced motion: done at once, idle
 * after GAIN_PILL_REDUCED_MS. Every timer and frame is cancelled in cleanup.
 *
 * @param {{ run: { id: number, from: number, to: number, gain: number }|null, reduced: boolean }} input
 * @returns {{ value: number|null, phase: 'idle'|'waiting'|'counting'|'done' }}
 */
export function useCountUpNumber({ run, reduced }) {
  const [state, setState] = useState(IDLE)

  useEffect(() => {
    if (!run) {
      setState(IDLE)
      return undefined
    }
    if (reduced) {
      setState({ value: run.to, phase: 'done' })
      const timerId = setTimeout(() => setState(IDLE), GAIN_PILL_REDUCED_MS)
      return () => clearTimeout(timerId)
    }
    setState({ value: run.from, phase: 'waiting' })
    const duration = countUpDuration(run.gain)
    let frame = null
    let doneTimer = null
    const startTimer = setTimeout(() => {
      const startedAt = performance.now()
      const step = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration)
        const eased = 1 - Math.pow(1 - progress, 3)
        setState({ value: Math.round(run.from + run.gain * eased), phase: progress < 1 ? 'counting' : 'done' })
        if (progress < 1) {
          frame = requestAnimationFrame(step)
        } else {
          doneTimer = setTimeout(() => setState(IDLE), Math.max(GAIN_PILL_MS - duration, GOLD_HOLD_MS))
        }
      }
      frame = requestAnimationFrame(step)
    }, COUNT_UP_DELAY_MS)
    return () => {
      clearTimeout(startTimer)
      clearTimeout(doneTimer)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [run, reduced])

  return state
}

export default useCountUpNumber
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 23: `useSprinkleCountUp` (decides, in PetView) ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useSprinkleCountUp.js`

- [x] **Step 1: Create the hook**

```js
import { useEffect, useState } from 'react'
import petService from '../services/petService'
import { AWARD_BUBBLE_MS } from '../constants/petAwards'
import { COUNT_UP_DELAY_MS, SPRINKLES_LIVE_TEXT } from '../constants/petSprinkles'
import { countUpDuration, earnedLine } from '../utils/sprinkleHistory'
import { prefersReducedMotion } from '../utils/reducedMotion'
import { readSeenSprinkles, writeSeenSprinkles } from '../utils/sprinklesSeenStore'

/**
 * MPP-42 AC 14–19: decides when Pip's header chip counts up. Each new balance is compared with the
 * last one this device showed this user (sprinklesSeenStore), then written straight away so a
 * refetch or a remount never replays it. Higher → a new `run` and one polite live line. Equal,
 * lower (spending) or first visit → nothing; the chip just shows the balance.
 *
 * After a run the recent read says what was earned; once the count-up has had time to finish, the
 * bubble `line` waits while `hold` is set (cook scene, award / outfit / shop line), then shows for
 * AWARD_BUBBLE_MS. A failed read still gets a line (the plain "+N sprinkles!").
 *
 * @param {{ userId: number|null, sprinkles: number|null, hold: boolean }} input
 * @returns {{ run: { id: number, from: number, to: number, gain: number }|null, reduced: boolean,
 *             liveText: string|null, line: string|null }}
 */
export function useSprinkleCountUp({ userId, sprinkles, hold }) {
  const [run, setRun] = useState(null)
  const [liveText, setLiveText] = useState(null)
  const [pendingLine, setPendingLine] = useState(null)
  const [line, setLine] = useState(null)
  const reduced = prefersReducedMotion()

  // Another person signing in on this browser never sees the last person's run.
  useEffect(() => {
    setRun(null)
    setLiveText(null)
    setPendingLine(null)
    setLine(null)
  }, [userId])

  useEffect(() => {
    if (userId == null || typeof sprinkles !== 'number') return
    const seen = readSeenSprinkles(userId)
    writeSeenSprinkles(userId, sprinkles)
    if (seen == null || sprinkles <= seen) return
    const gain = sprinkles - seen
    setRun(current => ({ id: (current?.id ?? 0) + 1, from: seen, to: sprinkles, gain }))
    setLiveText(SPRINKLES_LIVE_TEXT(gain, sprinkles))
  }, [userId, sprinkles])

  useEffect(() => {
    if (!run) return undefined
    const controller = new AbortController()
    let timerId
    const finished = new Promise(resolve => {
      timerId = setTimeout(resolve, reduced ? 0 : COUNT_UP_DELAY_MS + countUpDuration(run.gain))
    })
    // Not a success-shaped fallback for a panel: a failed read only changes the line's wording.
    const earned = petService.getRecentSprinkles({ signal: controller.signal })
      .then(result => result.entries)
      .catch(() => [])
    Promise.all([earned, finished]).then(([entries]) => {
      if (!controller.signal.aborted) setPendingLine(earnedLine(entries, run.gain))
    })
    return () => {
      controller.abort()
      clearTimeout(timerId)
    }
  }, [run]) // eslint-disable-line react-hooks/exhaustive-deps -- reduced is read once per run

  // AC 16: speak when it's this line's turn; a hold pauses it, and it shows in full afterwards.
  useEffect(() => {
    if (!pendingLine || hold) return undefined
    setLine(pendingLine)
    const timerId = setTimeout(() => {
      setLine(null)
      setPendingLine(null)
    }, AWARD_BUBBLE_MS)
    return () => clearTimeout(timerId)
  }, [pendingLine, hold])

  return { run, reduced, liveText, line }
}

export default useSprinkleCountUp
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 24: `SprinklesChip` + CSS ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/SprinklesChip.jsx`
- Create: `foodbytes-app/client/src/components/pet/SprinklesChip.css`
- Modify: `foodbytes-app/client/src/components/pet/PetView.css:58-67`

- [x] **Step 1: Create the component**

```jsx
import { SPARK_COUNT } from '../../constants/petSprinkles'
import { SPRINKLES_ICON } from '../../constants/petRoom'
import useCountUpNumber from '../../hooks/useCountUpNumber'
import './SprinklesChip.css'

// The sparkle burst's directions, around the chip (mockup: 26px across, 18px up/down).
const SPARKS = Array.from({ length: SPARK_COUNT }, (_, i) => {
  const angle = (i / SPARK_COUNT) * Math.PI * 2
  return { '--dx': `${Math.round(Math.cos(angle) * 26)}px`, '--dy': `${Math.round(Math.sin(angle) * 18)}px` }
})

/**
 * MPP-42 AC 15, 18, 19: Pip's header sprinkles. During a run it shows the old number, turns gold and
 * bumps, counts up, pops a "+N ✨" pill and a sparkle burst; reduced motion jumps to the new number
 * and holds the pill still. The aria-label is always the real balance; the polite live line is a
 * sibling, so it is read once.
 *
 * @param {{ sprinkles: number, earning: { run: Object|null, reduced: boolean, liveText: string|null } }} props
 */
function SprinklesChip({ sprinkles, earning }) {
  const { value, phase } = useCountUpNumber({ run: earning.run, reduced: earning.reduced })
  const showing = phase === 'counting' || phase === 'done'
  const gold = showing && !earning.reduced

  return (
    <>
      <span className={`pip-header-sprinkles${gold ? ' is-earning' : ''}`} aria-label={`${sprinkles} sprinkles`}>
        <span aria-hidden="true">{SPRINKLES_ICON} {value ?? sprinkles}</span>
        {showing && (
          <span key={earning.run.id} className={`sprinkles-gain${earning.reduced ? ' is-still' : ' go'}`} aria-hidden="true">
            +{earning.run.gain} {SPRINKLES_ICON}
          </span>
        )}
        {gold && SPARKS.map((style, i) => (
          <span key={`${earning.run.id}-${i}`} className="sprinkles-spark go" style={style} aria-hidden="true">✨</span>
        ))}
      </span>
      <span className="sprinkles-live" role="status" aria-live="polite">{earning.liveText ?? ''}</span>
    </>
  )
}

export default SprinklesChip
```

- [x] **Step 2: Create the CSS (mockup keyframes)**

```css
/* MPP-42: the header chip's count-up (pip-sprinkles-earn-mockup.html). Base look: PetView.css .pip-header-sprinkles. */
.pip-header-sprinkles {
  position: relative;
  transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
}

.pip-header-sprinkles.is-earning {
  background: #fff7d6;
  border-color: #e0b52c;
  box-shadow: 0 0 0 3px rgba(255, 211, 77, 0.35);
  animation: sprinkles-bump 0.32s ease-out 1;
}

@keyframes sprinkles-bump { 50% { transform: scale(1.14); } }

.sprinkles-gain {
  position: absolute;
  right: 2px;
  top: 100%;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #ffd34d;
  color: #3f2716;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
}

.sprinkles-gain.go { animation: sprinkles-gain-float 1.9s ease-out forwards; }
.sprinkles-gain.is-still { opacity: 1; }

@keyframes sprinkles-gain-float {
  0% { opacity: 0; transform: translateY(14px) scale(0.7); }
  15% { opacity: 1; transform: translateY(0) scale(1.08); }
  25% { transform: translateY(0) scale(1); }
  75% { opacity: 1; transform: translateY(-2px); }
  100% { opacity: 0; transform: translateY(-26px); }
}

.sprinkles-spark {
  position: absolute;
  left: 50%;
  top: 50%;
  font-size: 0.7rem;
  pointer-events: none;
  opacity: 0;
}

.sprinkles-spark.go { animation: sprinkles-spark 0.8s ease-out forwards; }

@keyframes sprinkles-spark {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(0.4); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1); }
}

/* Visually hidden, still read by screen readers. */
.sprinkles-live {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .pip-header-sprinkles.is-earning, .sprinkles-gain.go, .sprinkles-spark.go { animation: none; }
  .pip-header-sprinkles { transition: none; }
}
```

- [x] **Step 3: Let the pill overlap the room**

In `PetView.css`, add two declarations to `.pip-header` (lines 58–67):

```css
  position: relative; /* MPP-42: the "+N ✨" pill hangs below the header, over the room */
  z-index: 3;
```

Before saving, check that no `.pet-room` / `PetRoom.css` rule stacks above `z-index: 3` at the header's top edge. Run `Select-String -Path src\components\pet\room\*.css -Pattern "z-index"` and, if a room layer sits higher, raise the header's z-index just above it rather than lowering the room's.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors.

### Task 25: PipHeader renders SprinklesChip ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PipHeader.jsx`

- [x] **Step 1: Swap the inline chip**

```jsx
import PetNameEditor from './PetNameEditor'
import SprinklesChip from './SprinklesChip'

/**
 * MPP-37: Pip mode's slim header, above the room — name with the rename pencil and his
 * current herb form on the left, sprinkles and the mood chip on the right. Replaces the
 * name row under the room and the room's top-left sprinkles counter.
 * MPP-42: the sprinkles chip counts up when you come back with more (useSprinkleCountUp → earning).
 */
function PipHeader({ name, onRename, formName, sprinkles, earning, mood, moodLabel }) {
  return (
    <header className="pip-header">
      <div className="pip-header-name">
        <PetNameEditor name={name} onRename={onRename} />
        <span className="pip-header-form">{formName}</span>
      </div>
      <div className="pip-header-right">
        {typeof sprinkles === 'number' && <SprinklesChip sprinkles={sprinkles} earning={earning} />}
        <span className={`pet-chip pet-chip--${mood}`}>{moodLabel}</span>
      </div>
    </header>
  )
}

export default PipHeader
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors. (`earning` is supplied in Task 26, and the build does not type-check props.)

### Task 26: PetView — the count-up hook and the bubble queue ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx:14,36,52-56,114-121`

- [x] **Step 1: Wire the hook before the early returns**

Import: `import useSprinkleCountUp from '../../hooks/useSprinkleCountUp'`. Add to the Javadoc: `MPP-42: the header's sprinkles count up when you come back with more, and Pip says what you earned after any award / outfit / shop line.`

Replace lines 54–55 (the announcement):

```jsx
  // MPP-28 AC 2: award > outfit > shop line. MPP-42 AC 16: what you earned queues after them, and after the cook scene.
  const higherAnnouncement = awards.announcement ?? dressing.announcement ?? shopState.announcement
  const earning = useSprinkleCountUp({ userId: petUserId, sprinkles, hold: Boolean(serving) || Boolean(higherAnnouncement) })
  const announcement = higherAnnouncement ?? earning.line
```

(`usePipGrowth` below keeps `hold: … || Boolean(announcement)`, so a stage change also waits for the earned line.)

- [x] **Step 2: Pass it to the header**

```jsx
      <PipHeader
        name={pet.name}
        onRename={renamePet}
        formName={PIP_FORM_NAMES[growth.displayForm]}
        sprinkles={sprinkles}
        earning={earning}
        mood={mood}
        moodLabel={petChipLabel(moodInfo)}
      />
```

- [x] **Step 3: Build, measure, check manually**

Run: `cd foodbytes-app\client; npm run build`
Expected: no errors. Then run `(Get-Content src\components\pet\PetView.jsx | Measure-Object -Line).Lines`, which should be under 200.

Manual checks (`/pet`, phone-width viewport, backend from Phase 3):
1. **First visit.** In DevTools → Application, delete the `foodbytes.pip.sprinklesSeen.<id>` key and reload. There should be no animation, and the key is now set (AC 17).
2. **Earn.** Tick a planned meal eaten on today's date in the meal plan, then return to the Pip tab. The chip shows the old number, turns gold and bumps after ~0.4 s, then counts up. A "+N ✨" pill floats away with sparkles. After the count-up, Pip's bubble says e.g. "+15: a meal, on time ✨" (AC 15–16).
3. **Spend.** Buy something in the Shop and close it. The number drops with no animation (AC 17).
4. **Shopping.** On the shopping list page, generate a list, check every item, and return. You see a count-up, and the line mentions shopping 🛒. Generate again in the same week: no second count-up from shopping (AC 10–11).
5. **Reduced motion.** In DevTools → Rendering, set "prefers-reduced-motion: reduce" and repeat step 2. The number jumps, the pill stays still for 2 s, and there is no bump or sparkles (AC 18).
6. **Screen reader.** With a screen reader on (NVDA or VoiceOver), step 2 is announced once as "You earned N sprinkles. Total T sprinkles." The chip's label is always the final total (AC 19).
7. **Queueing.** With an award or outfit line showing, the earned line waits and shows afterwards in full (AC 16).

---

## Phase 7 — Final verification

No production changes beyond the version bump. These steps only sanity-check that the cumulative work is clean.

### Task 27: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. This ticket is a **Story**, so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and into `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-42: Sprinkles Earn tab in the Shop, weekly shopping-list rewards, and a count-up when you return to Pip`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 28: Grep for stale references ✓

- Skill: none — verification only

**Files:** (none — read-only checks)

- [x] **Step 1: The old footnote is gone**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "SHOP_FOOTNOTE"`
Expected: zero hits.

- [x] **Step 2: No new console logging**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)"`
Expected: no hit in any file this contract created or modified.

- [x] **Step 3: The go-live file is current**

Run: `node foodbytes-app\database\build-golive.mjs --check`
Expected: `Go-live OK`

- [x] **Step 4: All node checks pass**

Run: `cd foodbytes-app\client; npm run check:sprinkles; npm run check:bubble; npm run check:awards; npm run check:room`
Expected: each prints its "all checks passed" line.

### Task 29: Run the full backend test suite ✓

- Skill: none — verification only

**Files:** (none)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors (the count rises by the new tests).

### Task 30: Production build ✓

- Skill: none — verification only

**Files:** (none)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 31: PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-42-sprinkles-earn-tab-shopping-rewards/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- A link to `plan.md` in this folder.
- A summary of the change, and the new version from Task 27.
- The migration `2026-10-15-mpp42-sprinkles-shopping-sources.sql`: applied to the local `foodbytes-db`. It reaches Railway as go-live row 12 in `mpp15-railway-golive.sql` and must be applied before the merged backend deploys. Note that Railway already holds `pet_sprinkles` while the tracker says rows 8–10 are unapplied, which needs reconciling.
- Verification results: `mvn test` totals, `npm run build`, `check:sprinkles`, `check:version`, the manual checks run.
- A note for future contributors: any shared-plan weekly reward uses `SprinkleService.payPlan` with a Monday epoch-day key, and its wording lives client-side in `utils/sprinkleHistory.js`.
- A suggested commit subject: `MPP-42: Earn tab, weekly shopping-list sprinkles and a count-up on Pip`.

---

## Self-review

**Spec coverage:**
- Migration widening + CHECK (AC 9): Tasks 1, 2, 3.
- Two sources, policy amounts (AC 9): Tasks 3, 4.
- Generate pays every plan member once per week (AC 10): Tasks 4, 6, 8.
- Finish pays every member once per week, re-checked after commit (AC 11): Tasks 5, 6, 7, 8.
- Failure never fails the request (AC 12): Task 8 (catch and its test). The listener is AFTER_COMMIT.
- `GET /api/pet/sprinkles/recent`, own rows, 14 days, context and rates (AC 13): Tasks 9–13.
- Earn tab, server amounts, good week, recent list, good to know (AC 1–6): Tasks 14, 15, 16, 18, 19, 20, 21.
- Footnote link (AC 7): Task 21.
- Meal payouts unchanged (AC 8): no task touches `mealEaten`. Task 6 only routes `planned` through `payPlan` with identical behaviour, and the existing tests pin it.
- Count-up, remembered balance, no-animation cases, reduced motion, screen reader (AC 14–15, 17–19): Tasks 17, 22, 23, 24, 25, 26.
- Bubble line queued after the award line (AC 16): Tasks 16 (`earnedLine`), 23, 26.
- Version bump, tests (AC 20): Tasks 27, 29, plus the per-task tests.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N". Every step shows code or a `Run:` / `Expected:` pair. Manual checks name the route, viewport and observable outcome.

**Type / name consistency:**
- Backend:
  - `SprinkleSource.SHOPPING_LIST_GENERATED` / `SHOPPING_LIST_COMPLETED`.
  - `SprinklePolicy.SHOPPING_LIST_GENERATED` / `SHOPPING_LIST_COMPLETED` / `RECENT_DAYS` / `mealsPerWeek()` / `weekOf()`.
  - `ShoppingListItemRepository.countByShoppingListId` / `countUnchecked`.
  - `SprinkleService.shoppingListGenerated` / `shoppingListCompleted` / `payPlan`.
  - `ShoppingItemChecked(Long userId)` and `SprinkleRecorder.onShoppingItemChecked`.
  - `StationPolicy.stationOf` / `levelOf` and `RoomStation.fromCode`.
  - `PetSprinkleRepository.findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDescIdDesc`.
  - `SprinkleHistoryService.recent` / `rates`.
  - `PetSprinkleController.recent`.
  - `RecentSprinklesDTO` / `SprinkleEntryDTO` / `SprinkleRatesDTO` fields match `plan.md` Data shapes.
- Frontend:
  - `getRecentSprinkles`.
  - `groupRecent`, `weekRange`, `localISO`, `relativeDay`, `goodWeek`, `countUpDuration`, `earnedLine`.
  - `readSeenSprinkles` / `writeSeenSprinkles`.
  - `useRecentSprinkles`, `useCountUpNumber({ run, reduced })`, `useSprinkleCountUp({ userId, sprinkles, hold })` → `{ run, reduced, liveText, line }`.
  - `SprinklesChip({ sprinkles, earning })`.
  - `SHOP_TAB_KEYS.EARN = 'earn'`.
- The rates JSON keys are identical on both sides.

**Phase boundary cleanliness:**
- Phase 1 ends compiled, with the local DB accepting the new names and no behaviour change.
- Phase 2 ends with payouts live and their tests green, with no read side yet.
- Phase 3 adds a standalone endpoint with tests green.
- Phase 4 adds unused modules: the build is green and the node check passes.
- Phase 5 completes the Shop with the build green, and the header is unchanged.
- Phase 6 completes the header and bubble with the build green.
- Phase 7 is verification only.
