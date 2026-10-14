# Tasks: Wardrobe — unlock clothes and dress Pip across every evolution

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-14

**Goal:** Each person's Pip unlocks 20 clothes across seven slots. Unlocks come from awards, firsts and evolutions, are recorded in a ledger and kept forever. Every item is drawn once from the herb forms' anchors, and he is dressed in a tap-to-save "Dress Pip" sheet opened from a Wardrobe button under his room.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-10-14-mpp32-pet-wardrobe.sql` — `pet_wardrobe_unlocks` + `pet_outfit_slots`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/WardrobeSlot.java` — the seven slots
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetWardrobeUnlock.java` — unlock ledger row
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetOutfitSlot.java` — one worn slot
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetWardrobeUnlockRepository.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetOutfitSlotRepository.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/UnlockRule.java` — rule as data
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/WardrobeCatalogue.java` — the 20 items
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/WardrobePolicy.java` — pure rule evaluation + DTO
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/WardrobeService.java` — sync / equip / undress / seen
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/WardrobeItemDTO.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/WardrobeDTO.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/WardrobeEquipRequest.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/WardrobeSeenRequest.java`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetWardrobeController.java` — `/api/pet/wardrobe`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/WardrobePolicyTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/WardrobeServiceTest.java`
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetWardrobeControllerTest.java`
- `foodbytes-app/client/src/constants/pipWardrobe.js` — slots, item labels + hints, UI strings
- `foodbytes-app/client/src/utils/pipWardrobe.js` — pure wardrobe helpers
- `foodbytes-app/client/src/utils/wardrobeAnnouncedStore.js` — per-browser "already announced" ids
- `foodbytes-app/client/src/components/pet/herb/wardrobeArt.js` — item geometry from anchors
- `foodbytes-app/client/src/components/pet/herb/wardrobeLayers.js` — layer composition + crops
- `foodbytes-app/client/src/components/pet/herb/wardrobe.check.mjs` — node check (AC 7)
- `foodbytes-app/client/src/components/pet/herb/HerbOutfit.jsx` — renders shape descriptors
- `foodbytes-app/client/src/hooks/usePipWardrobe.js` — optimistic writes + announcement
- `foodbytes-app/client/src/components/pet/room/WardrobeButton.jsx` — pill + badge
- `foodbytes-app/client/src/components/pet/room/WardrobeView.jsx` — Dress Pip sheet
- `foodbytes-app/client/src/components/pet/room/WardrobeSlotTabs.jsx`
- `foodbytes-app/client/src/components/pet/room/WardrobeItemGrid.jsx`
- `foodbytes-app/client/src/components/pet/room/WardrobeLineup.jsx`
- `foodbytes-app/client/src/components/pet/room/WardrobeView.css`

**Modified:**
- `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` — row 6
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetGrowthDTO.java` — `peakForm`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetGrowthPolicy.java:91-105` — `toDTO` sets `peakForm`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetDTO.java` — `wardrobe`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetPolicy.java:35-42` — `toDTO(user, growth, wardrobe)`
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetService.java` — sync the wardrobe
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetGrowthPolicyTest.java` — `peakForm` tests
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java` — new constructor arg + wardrobe mock
- `foodbytes-app/client/package.json` — `check:wardrobe` script (and the version in M.1)
- `foodbytes-app/client/src/components/pet/herb/PipHerbFigure.jsx` — outfit layers, `still`
- `foodbytes-app/client/src/components/pet/herb/PipHerb.jsx` — `outfit`, `viewBox`, `still` props
- `foodbytes-app/client/src/components/pet/herb/PipHerb.css` — `.is-still`
- `foodbytes-app/client/src/components/pet/room/RoomPip.jsx` — pass `herb.outfit`
- `foodbytes-app/client/src/components/layout/Footer.jsx` — hat-only tab
- `foodbytes-app/client/src/services/petService.js` — three wardrobe calls
- `foodbytes-app/client/src/contexts/PetContext.jsx` — `wardrobe`, `setWardrobe`
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` — strip + third overlay
- `foodbytes-app/client/src/components/pet/room/PetRoom.css` — strip + badge
- `foodbytes-app/client/src/components/pet/PetView.jsx` — hook, bubble line, outfit, wardrobe prop
- `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version (M.1)

**Deleted:** (none)

---

## Phase 1 — Schema: wardrobe tables

Writes the migration, has the developer apply it to the local `foodbytes-db`, and maps both tables. Nothing reads the new entities yet, so the backend behaves exactly as before. It still starts, because the tables exist before the entities that `validate` checks.

### Task 1: Write the migration and record it for Railway ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-10-14-mpp32-pet-wardrobe.sql`
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`

- [x] **Step 1: Write the migration file**

```sql
-- MPP-32: Pip's wardrobe. Two per-person tables:
--
-- pet_wardrobe_unlocks - one row per clothing item a person has unlocked. Written by
-- WardrobeService.sync via an idempotent INSERT ... ON DUPLICATE KEY UPDATE id = id (uk on
-- user_id + item_key), and never deleted by the app: unlocks are kept forever (AC 2), even if a
-- later slip lowers Pip's form or an untick shortens a streak. seen_at stays NULL until the user
-- opens the slot holding the item in the Dress Pip screen; NULL drives the Wardrobe badge and the
-- NEW tags, and survives a reload (AC 4).
--
-- pet_outfit_slots - what Pip is wearing: at most one item per slot (uk on user_id + slot). An
-- empty slot is a missing row.
--
-- item_key is not CHECK-constrained: the catalogue is data in WardrobeCatalogue (20 items today)
-- and the service rejects unknown ids before writing.
--
-- Per person (MPP-33): user_id is always the person dressing their own Pip, never the meal-plan owner.
--
-- Lossless: creates two new, empty tables; no existing row is read or changed. Checked 2026-10-14 on
-- the local foodbytes-db: 13 users, no wardrobe/outfit tables yet. No backfill - each user's
-- starter items (beanie, jeans) and anything already earned are granted on their next GET /api/pet.
--
-- MUST be applied before the backend that maps PetWardrobeUnlock / PetOutfitSlot starts
-- (ddl-auto: validate). MPP-15 is local-first: applied to the local foodbytes-db now; listed as
-- order 6 in .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

CREATE TABLE IF NOT EXISTS pet_wardrobe_unlocks (
  id          BIGINT      NOT NULL AUTO_INCREMENT,
  user_id     BIGINT      NOT NULL,
  item_key    VARCHAR(32) NOT NULL,
  unlocked_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  seen_at     TIMESTAMP   NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_wardrobe_unlocks (user_id, item_key),
  CONSTRAINT fk_pet_wardrobe_unlocks_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pet_outfit_slots (
  id        BIGINT      NOT NULL AUTO_INCREMENT,
  user_id   BIGINT      NOT NULL,
  slot      VARCHAR(16) NOT NULL,
  item_key  VARCHAR(32) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_outfit_slots (user_id, slot),
  CONSTRAINT chk_pet_outfit_slots_slot CHECK (slot IN ('HAT','GLASSES','SCARF','JACKET','BELT','PANTS','SHOES')),
  CONSTRAINT fk_pet_outfit_slots_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

- [x] **Step 2: Add row 6 to the epic's Railway batch**

Append to the table in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`:

```markdown
| 6 | MPP-32 | foodbytes-app/database/migrations/2026-10-14-mpp32-pet-wardrobe.sql | — | — |
```

(The executor fills "Applied locally" with the date once Task 2 is confirmed.)

- [x] **Step 3: Confirm the file exists**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-10-14-mpp32-pet-wardrobe.sql`
Expected: one file listed.

### Task 2: Developer applies the migration to the local `foodbytes-db` ✓

- Skill: none — DBA operation against the local Docker MySQL, owned by the developer

**Files:**
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` (row 6 "Applied locally" date)

- [x] **Step 1: Developer runs the migration (Docker Desktop must be running)**

Run (developer, from the repo root, Git Bash or cmd): `docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app/database/migrations/2026-10-14-mpp32-pet-wardrobe.sql`
Expected: no output, exit code 0.

- [x] **Step 2: Verify both tables, read-only**

Run: `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SHOW COLUMNS FROM pet_wardrobe_unlocks; SHOW COLUMNS FROM pet_outfit_slots"`
Expected: `id, user_id, item_key, unlocked_at, seen_at` (seen_at `YES` / `NULL`) then `id, user_id, slot, item_key`.

- [x] **Step 3: Record the local apply date**

In row 6 of `railway-migrations.md`, set "Applied locally" to today's date. Leave "Applied to Railway" as `—`.

### Task 3: `WardrobeSlot` enum and the two entities ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/WardrobeSlot.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetWardrobeUnlock.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/PetOutfitSlot.java`

- [x] **Step 1: Create the enum**

```java
package com.foodbytes.model;

/**
 * MPP-32: Pip's seven clothing slots, in the Dress Pip tab order. Stored by name in
 * pet_outfit_slots.slot (chk_pet_outfit_slots_slot) and serialised the same way; adding a slot
 * needs a migration that widens that CHECK.
 */
public enum WardrobeSlot {
    HAT, GLASSES, SCARF, JACKET, BELT, PANTS, SHOES
}
```

- [x] **Step 2: Create `PetWardrobeUnlock`**

```java
package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * MPP-32: one clothing item one person has unlocked. Identified by (user, item) so granting it twice
 * is a no-op; written only by PetWardrobeUnlockRepository#insertIfAbsent and never deleted by the
 * app (AC 2: kept forever). seenAt is null until the slot holding it is opened (AC 4).
 */
@Entity
@Table(name = "pet_wardrobe_unlocks", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_wardrobe_unlocks", columnNames = {"user_id", "item_key"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetWardrobeUnlock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The person who owns this Pip - never the meal-plan owner (MPP-33)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // A WardrobeCatalogue item id, e.g. "beanie"
    @Column(name = "item_key", nullable = false, length = 32)
    private String itemKey;

    // DB default CURRENT_TIMESTAMP (UTC, as the JDBC URL pins serverTimezone=UTC)
    @Column(name = "unlocked_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime unlockedAt;

    @Column(name = "seen_at")
    private LocalDateTime seenAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetWardrobeUnlock other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetWardrobeUnlock.class.hashCode();
    }
}
```

- [x] **Step 3: Create `PetOutfitSlot`**

```java
package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * MPP-32: what one person's Pip wears in one slot. At most one row per (user, slot); an empty
 * slot has no row. Written by PetOutfitSlotRepository#upsert / the delete methods.
 */
@Entity
@Table(name = "pet_outfit_slots", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_outfit_slots", columnNames = {"user_id", "slot"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetOutfitSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "slot", nullable = false, length = 16)
    private WardrobeSlot slot;

    @Column(name = "item_key", nullable = false, length = 32)
    private String itemKey;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetOutfitSlot other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetOutfitSlot.class.hashCode();
    }
}
```

- [x] **Step 4: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, no output from `-q`.

### Task 4: The two repositories ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetWardrobeUnlockRepository.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetOutfitSlotRepository.java`

- [x] **Step 1: Create `PetWardrobeUnlockRepository`**

`clearAutomatically = true` on every write, because the service re-reads the same rows in the same transaction to build its response.

```java
package com.foodbytes.repository;

import com.foodbytes.model.PetWardrobeUnlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/** MPP-32: one person's unlocked clothes. Rows are never deleted by the app (kept forever). */
@Repository
public interface PetWardrobeUnlockRepository extends JpaRepository<PetWardrobeUnlock, Long> {

    List<PetWardrobeUnlock> findByUserId(Long userId);

    boolean existsByUserIdAndItemKey(Long userId, String itemKey);

    /** Grants an item, or leaves an existing grant (and its seen_at) untouched. Parallel syncs converge. */
    @Modifying(clearAutomatically = true)
    @Query(value = "INSERT INTO pet_wardrobe_unlocks (user_id, item_key) VALUES (:userId, :itemKey) " +
                   "ON DUPLICATE KEY UPDATE id = id",
           nativeQuery = true)
    void insertIfAbsent(@Param("userId") Long userId, @Param("itemKey") String itemKey);

    /** Marks the given items seen; ones already seen keep their first seen_at. */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE PetWardrobeUnlock u SET u.seenAt = :seenAt " +
           "WHERE u.userId = :userId AND u.itemKey IN :itemKeys AND u.seenAt IS NULL")
    int markSeen(@Param("userId") Long userId,
                 @Param("itemKeys") Collection<String> itemKeys,
                 @Param("seenAt") LocalDateTime seenAt);
}
```

- [x] **Step 2: Create `PetOutfitSlotRepository`**

```java
package com.foodbytes.repository;

import com.foodbytes.model.PetOutfitSlot;
import com.foodbytes.model.WardrobeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/** MPP-32: what one person's Pip is wearing, one row per worn slot. */
@Repository
public interface PetOutfitSlotRepository extends JpaRepository<PetOutfitSlot, Long> {

    List<PetOutfitSlot> findByUserId(Long userId);

    /** Puts an item in a slot, replacing whatever was there (uk_pet_outfit_slots). */
    @Modifying(clearAutomatically = true)
    @Query(value = "INSERT INTO pet_outfit_slots (user_id, slot, item_key) VALUES (:userId, :slot, :itemKey) " +
                   "ON DUPLICATE KEY UPDATE item_key = VALUES(item_key)",
           nativeQuery = true)
    void upsert(@Param("userId") Long userId, @Param("slot") String slot, @Param("itemKey") String itemKey);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM PetOutfitSlot s WHERE s.userId = :userId AND s.slot = :slot")
    int deleteByUserIdAndSlot(@Param("userId") Long userId, @Param("slot") WardrobeSlot slot);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM PetOutfitSlot s WHERE s.userId = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

---

## Phase 2 — Backend: peak form, catalogue, service, API

Adds `peakForm`, the data-only catalogue and its pure policy, the service, `wardrobe` on the pet payload and the write endpoints. Each task leaves the build and every existing test green. The pet payload only gains fields, so the current client keeps working.

### Task 5: `PetGrowthDTO.peakForm` (test-first) ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetGrowthDTO.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetGrowthPolicy.java:91-105`
- Modify: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java:33`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetGrowthPolicyTest.java`

- [x] **Step 1: Write the failing tests**

Add to `PetGrowthPolicyTest` (after `slipRightAfterEvolving_deEvolves`):

```java
    // ---- MPP-32: peakForm, the highest form reached (evolution unlocks, lineup silhouettes) ----

    @Test
    void peakForm_staysAtTheHighestFormAfterADeEvolve() {
        int[] thenSlip = java.util.Arrays.copyOf(repeat(3, 5), 6);
        thenSlip[5] = -3;                                                         // 15 → 12 points
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(thenSlip)), false);
        assertThat(dto.getForm()).isEqualTo(1);
        assertThat(dto.getPeakForm()).isEqualTo(2);
    }

    @Test
    void peakForm_equalsTheFormWhenNeverHigher() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(repeat(3, 12))), false); // 36
        assertThat(dto.getForm()).isEqualTo(3);
        assertThat(dto.getPeakForm()).isEqualTo(3);
    }

    @Test
    void peakForm_isBasiliskWhenFullyGrown_whateverThePoints() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(repeat(3, 2))), true);
        assertThat(dto.getPeakForm()).isEqualTo(5);
    }

    @Test
    void peakForm_ofTheEmptyReplay_isTheSeed() {
        assertThat(PetGrowthPolicy.toDTO(Replay.EMPTY, false).getPeakForm()).isEqualTo(1);
    }
```

- [x] **Step 2: Run — expect a compile failure**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetGrowthPolicyTest`
Expected: `COMPILATION ERROR` — `cannot find symbol: method getPeakForm()`.

- [x] **Step 3: Add the field**

In `PetGrowthDTO`, after `lastScoredDate`:

```java
    private LocalDate lastScoredDate; // date of that day, null if none yet
    private int peakForm;             // MPP-32: highest form in the replayed history; 5 when fullyGrown
```

- [x] **Step 4: Set it in `PetGrowthPolicy.toDTO`**

Replace the body of `toDTO` with:

```java
    public static PetGrowthDTO toDTO(Replay replay, boolean fullyGrown) {
        int points = replay.points();
        int form = formFor(points);
        if (fullyGrown || form == FORM_BASILISK) {
            return new PetGrowthDTO(points, FORM_BASILISK, null, null, true,
                    replay.lastDayScore(), replay.lastScoredDate(), FORM_BASILISK);
        }
        int threshold = FORM_THRESHOLDS.get(form - 1);
        int peakForm = Math.max(formFor(replay.peak()), form); // MPP-32
        return new PetGrowthDTO(points, form, points - threshold, FORM_THRESHOLDS.get(form) - threshold, false,
                replay.lastDayScore(), replay.lastScoredDate(), peakForm);
    }
```

- [x] **Step 5: Fix the one test constructor**

In `PetServiceTest`, line 33:

```java
    private static final PetGrowthDTO GROWTH = new PetGrowthDTO(21, 2, 6, 21, false, 3, null, 2);
```

- [x] **Step 6: Run — expect pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetGrowthPolicyTest+PetServiceTest+PetGrowthServiceTest`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 6: Catalogue, rules and `WardrobePolicy` + DTOs (test-first) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/UnlockRule.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/WardrobeCatalogue.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/WardrobePolicy.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/WardrobeItemDTO.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/WardrobeDTO.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/WardrobePolicyTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.dto.WardrobeDTO;
import com.foodbytes.dto.WardrobeItemDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.StreakType;
import com.foodbytes.model.WardrobeSlot;
import com.foodbytes.service.WardrobePolicy.Progress;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/** MPP-32 AC 1 / AC 2: the catalogue is data, and each rule kind is met exactly when its progress exists. */
class WardrobePolicyTest {

    private static final Progress NOTHING = new Progress(Map.of(), Set.of(), 1);

    private static Progress awards(StreakType type, int... milestones) {
        Map<Integer, Integer> counts = new LinkedHashMap<>();
        Arrays.stream(milestones).forEach(m -> counts.put(m, 1));
        return new Progress(Map.of(type, counts), Set.of(), 1);
    }

    @Test
    void catalogue_isTheTwentyItemsOfAc1_inTheirSlots() {
        Map<String, WardrobeSlot> slots = WardrobeCatalogue.ITEMS.stream()
                .collect(Collectors.toMap(WardrobeCatalogue.Item::id, WardrobeCatalogue.Item::slot, (a, b) -> a, LinkedHashMap::new));
        assertThat(slots).containsExactly(
                Map.entry("beanie", WardrobeSlot.HAT), Map.entry("cap", WardrobeSlot.HAT),
                Map.entry("chef-hat", WardrobeSlot.HAT), Map.entry("straw-hat", WardrobeSlot.HAT),
                Map.entry("top-hat", WardrobeSlot.HAT),
                Map.entry("round-specs", WardrobeSlot.GLASSES), Map.entry("heart-glasses", WardrobeSlot.GLASSES),
                Map.entry("sunglasses", WardrobeSlot.GLASSES),
                Map.entry("red-scarf", WardrobeSlot.SCARF), Map.entry("striped-scarf", WardrobeSlot.SCARF),
                Map.entry("chef-whites", WardrobeSlot.JACKET), Map.entry("denim-jacket", WardrobeSlot.JACKET),
                Map.entry("puffer", WardrobeSlot.JACKET),
                Map.entry("leather-belt", WardrobeSlot.BELT), Map.entry("champion-belt", WardrobeSlot.BELT),
                Map.entry("jeans", WardrobeSlot.PANTS), Map.entry("joggers", WardrobeSlot.PANTS),
                Map.entry("dungarees", WardrobeSlot.PANTS),
                Map.entry("sneakers", WardrobeSlot.SHOES), Map.entry("wellies", WardrobeSlot.SHOES));
        assertThat(WardrobeCatalogue.ITEMS).hasSize(20);
        assertThat(WardrobeCatalogue.ITEMS.stream().map(WardrobeCatalogue.Item::slot).collect(Collectors.toSet()))
                .containsExactlyInAnyOrder(WardrobeSlot.values());
    }

    @Test
    void starters_areBeanieAndJeans_ownedWithNoProgress() {
        assertThat(WardrobePolicy.newlyMet(NOTHING, Set.of())).containsExactly("beanie", "jeans");
    }

    @Test
    void ladderRules_matchAc1() {
        assertThat(WardrobePolicy.newlyMet(awards(StreakType.PLAN, 1, 3, 5, 7, 14, 21), Set.of("beanie", "jeans")))
                .containsExactly("chef-whites", "denim-jacket", "puffer", "dungarees");
        assertThat(WardrobePolicy.newlyMet(awards(StreakType.SNACK, 7, 14, 21), Set.of("beanie", "jeans")))
                .containsExactly("striped-scarf", "joggers", "sneakers");
        assertThat(WardrobePolicy.newlyMet(awards(StreakType.ALCOHOL, 5, 7, 14, 21), Set.of("beanie", "jeans")))
                .containsExactly("cap", "heart-glasses", "red-scarf", "leather-belt");
    }

    @Test
    void awardRule_needsThatStreakTypeAndMilestone() {
        UnlockRule rule = UnlockRule.award(StreakType.ALCOHOL, 5);
        assertThat(WardrobePolicy.isMet(rule, awards(StreakType.ALCOHOL, 5))).isTrue();
        assertThat(WardrobePolicy.isMet(rule, awards(StreakType.SNACK, 5))).isFalse();
        assertThat(WardrobePolicy.isMet(rule, awards(StreakType.ALCOHOL, 3, 7))).isFalse();
        assertThat(WardrobePolicy.isMet(rule, new Progress(Map.of(StreakType.ALCOHOL, Map.of(5, 0)), Set.of(), 1))).isFalse();
    }

    @Test
    void anyAward_topHat_onAnyOneThirtyDayStreak() {
        assertThat(WardrobePolicy.isMet(UnlockRule.anyAward(30), awards(StreakType.SNACK, 30))).isTrue();
        assertThat(WardrobePolicy.isMet(UnlockRule.anyAward(30), awards(StreakType.SNACK, 21))).isFalse();
    }

    @Test
    void allAwards_championBelt_needsThirtyOnEveryStreakType() {
        Map<StreakType, Map<Integer, Integer>> two = new EnumMap<>(StreakType.class);
        two.put(StreakType.PLAN, Map.of(30, 1));
        two.put(StreakType.SNACK, Map.of(30, 2));
        assertThat(WardrobePolicy.isMet(UnlockRule.allAwards(30), new Progress(two, Set.of(), 1))).isFalse();
        two.put(StreakType.ALCOHOL, Map.of(30, 1));
        assertThat(WardrobePolicy.isMet(UnlockRule.allAwards(30), new Progress(two, Set.of(), 1))).isTrue();
    }

    @Test
    void firstRules_chefHatAndRoundSpecs() {
        Progress firsts = new Progress(Map.of(), EnumSet.of(FirstKey.COOK_HOMEMADE_EXTRA, FirstKey.PLAN_FULL_WEEK), 1);
        assertThat(WardrobePolicy.newlyMet(firsts, Set.of("beanie", "jeans"))).containsExactly("chef-hat", "round-specs");
        assertThat(WardrobePolicy.isMet(UnlockRule.first(FirstKey.PLAN_FULL_WEEK),
                new Progress(Map.of(), EnumSet.of(FirstKey.MAKE_TEMPLATE), 1))).isFalse();
    }

    @Test
    void formRules_useThePeakForm() {
        assertThat(WardrobePolicy.newlyMet(new Progress(Map.of(), Set.of(), 3), Set.of("beanie", "jeans")))
                .containsExactly("straw-hat");
        assertThat(WardrobePolicy.newlyMet(new Progress(Map.of(), Set.of(), 5), Set.of("beanie", "jeans")))
                .containsExactly("straw-hat", "sunglasses", "wellies");
    }

    @Test
    void newlyMet_neverRepeatsAnOwnedItem() {
        assertThat(WardrobePolicy.newlyMet(NOTHING, Set.of("beanie"))).containsExactly("jeans");
        assertThat(WardrobePolicy.newlyMet(NOTHING, Set.of("beanie", "jeans"))).isEmpty();
    }

    @Test
    void toDTO_listsAllTwentyInCatalogueOrder_withOwnedUnseenAndTheOutfit() {
        Map<WardrobeSlot, String> outfit = new EnumMap<>(WardrobeSlot.class);
        outfit.put(WardrobeSlot.HAT, "beanie");
        WardrobeDTO dto = WardrobePolicy.toDTO(Set.of("beanie", "jeans"), Set.of("jeans"), outfit);

        assertThat(dto.getItems()).hasSize(20);
        assertThat(dto.getItems().get(0)).isEqualTo(new WardrobeItemDTO("beanie", WardrobeSlot.HAT, true, false));
        assertThat(dto.getItems()).filteredOn(i -> i.getId().equals("jeans"))
                .containsExactly(new WardrobeItemDTO("jeans", WardrobeSlot.PANTS, true, true));
        assertThat(dto.getItems()).filteredOn(i -> i.getId().equals("wellies"))
                .containsExactly(new WardrobeItemDTO("wellies", WardrobeSlot.SHOES, false, false));
        assertThat(dto.getOutfit()).containsExactly(Map.entry(WardrobeSlot.HAT, "beanie"));
    }

    @Test
    void find_knowsEveryIdAndNothingElse() {
        assertThat(WardrobeCatalogue.find("wellies")).map(WardrobeCatalogue.Item::slot).contains(WardrobeSlot.SHOES);
        assertThat(WardrobeCatalogue.find("jetpack")).isEmpty();
        assertThat(WardrobeCatalogue.find(null)).isEmpty();
    }

    @Test
    void itemsInSlot_listsTheSlotsIdsInCatalogueOrder() {
        assertThat(WardrobeCatalogue.idsIn(WardrobeSlot.SHOES)).isEqualTo(List.of("sneakers", "wellies"));
    }
}
```

- [x] **Step 2: Run — expect a compile failure**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=WardrobePolicyTest`
Expected: `COMPILATION ERROR` — `WardrobeCatalogue`, `WardrobePolicy`, `UnlockRule` not found.

- [x] **Step 3: Create `UnlockRule`**

```java
package com.foodbytes.service;

import com.foodbytes.model.FirstKey;
import com.foodbytes.model.StreakType;

/**
 * MPP-32 AC 1: when a clothing item unlocks, as data. Each kind uses only its own parameters; the
 * rest are null. Evaluated by WardrobePolicy#isMet.
 */
public record UnlockRule(Kind kind, StreakType streak, Integer milestone, FirstKey first, Integer form) {

    public enum Kind {
        STARTER,     // owned from the start
        AWARD,       // that streak type's ladder milestone earned at least once (MPP-22)
        ANY_AWARD,   // the milestone earned on any streak type
        ALL_AWARDS,  // the milestone earned on every streak type
        FIRST,       // an MPP-24 first earned
        FORM         // Pip has reached this form at least once (MPP-31 peakForm)
    }

    public static UnlockRule starter() {
        return new UnlockRule(Kind.STARTER, null, null, null, null);
    }

    public static UnlockRule award(StreakType streak, int milestone) {
        return new UnlockRule(Kind.AWARD, streak, milestone, null, null);
    }

    public static UnlockRule anyAward(int milestone) {
        return new UnlockRule(Kind.ANY_AWARD, null, milestone, null, null);
    }

    public static UnlockRule allAwards(int milestone) {
        return new UnlockRule(Kind.ALL_AWARDS, null, milestone, null, null);
    }

    public static UnlockRule first(FirstKey key) {
        return new UnlockRule(Kind.FIRST, null, null, key, null);
    }

    public static UnlockRule form(int form) {
        return new UnlockRule(Kind.FORM, null, null, null, form);
    }
}
```

- [x] **Step 4: Create `WardrobeCatalogue`**

```java
package com.foodbytes.service;

import com.foodbytes.model.FirstKey;
import com.foodbytes.model.StreakType;
import com.foodbytes.model.WardrobeSlot;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.foodbytes.model.WardrobeSlot.*;
import static com.foodbytes.service.UnlockRule.*;

/**
 * MPP-32 AC 1: every clothing item, its slot and its unlock rule, in slot then AC order. Adding an
 * item is one line here plus its art and label on the client (constants/pipWardrobe.js,
 * herb/wardrobeArt.js); no code branch changes. Ids are unique across slots and stored in
 * pet_wardrobe_unlocks.item_key / pet_outfit_slots.item_key.
 */
public final class WardrobeCatalogue {

    public record Item(String id, WardrobeSlot slot, UnlockRule rule) {}

    public static final int MONTH = 30;

    public static final List<Item> ITEMS = List.of(
            new Item("beanie", HAT, starter()),
            new Item("cap", HAT, award(StreakType.ALCOHOL, 5)),
            new Item("chef-hat", HAT, first(FirstKey.COOK_HOMEMADE_EXTRA)),
            new Item("straw-hat", HAT, form(PetGrowthPolicy.FORM_SPRIG)),
            new Item("top-hat", HAT, anyAward(MONTH)),
            new Item("round-specs", GLASSES, first(FirstKey.PLAN_FULL_WEEK)),
            new Item("heart-glasses", GLASSES, award(StreakType.ALCOHOL, 14)),
            new Item("sunglasses", GLASSES, form(PetGrowthPolicy.FORM_BASILISK)),
            new Item("red-scarf", SCARF, award(StreakType.ALCOHOL, 7)),
            new Item("striped-scarf", SCARF, award(StreakType.SNACK, 21)),
            new Item("chef-whites", JACKET, award(StreakType.PLAN, 3)),
            new Item("denim-jacket", JACKET, award(StreakType.PLAN, 14)),
            new Item("puffer", JACKET, award(StreakType.PLAN, 21)),
            new Item("leather-belt", BELT, award(StreakType.ALCOHOL, 21)),
            new Item("champion-belt", BELT, allAwards(MONTH)),
            new Item("jeans", PANTS, starter()),
            new Item("joggers", PANTS, award(StreakType.SNACK, 14)),
            new Item("dungarees", PANTS, award(StreakType.PLAN, 7)),
            new Item("sneakers", SHOES, award(StreakType.SNACK, 7)),
            new Item("wellies", SHOES, form(PetGrowthPolicy.FORM_BUSHLING)));

    // toUnmodifiableMap throws on a duplicate id, so a copy-paste slip fails at class load.
    private static final Map<String, Item> BY_ID = ITEMS.stream()
            .collect(Collectors.toUnmodifiableMap(Item::id, Function.identity()));

    private WardrobeCatalogue() {
    }

    public static Optional<Item> find(String id) {
        return id == null ? Optional.empty() : Optional.ofNullable(BY_ID.get(id));
    }

    /** The ids in one slot, in catalogue order. */
    public static List<String> idsIn(WardrobeSlot slot) {
        return ITEMS.stream().filter(item -> item.slot() == slot).map(Item::id).toList();
    }
}
```

- [x] **Step 5: Create the two response DTOs**

```java
package com.foodbytes.dto;

import com.foodbytes.model.WardrobeSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-32: one catalogue item for the caller. Locked items are listed too (owned = false). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WardrobeItemDTO {
    private String id;            // WardrobeCatalogue id, e.g. "wellies"
    private WardrobeSlot slot;
    private boolean owned;        // unlocked, ever (never revoked)
    private boolean unseen;       // owned and its slot not opened yet - drives the badge and NEW tag
}
```

```java
package com.foodbytes.dto;

import com.foodbytes.model.WardrobeSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * MPP-32: the caller's wardrobe. items = all catalogue items in catalogue order; outfit = worn
 * slots only (JSON keys "HAT" … "SHOES"), an absent slot is empty.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WardrobeDTO {
    private List<WardrobeItemDTO> items;
    private Map<WardrobeSlot, String> outfit;
}
```

- [x] **Step 6: Create `WardrobePolicy`**

```java
package com.foodbytes.service;

import com.foodbytes.dto.WardrobeDTO;
import com.foodbytes.dto.WardrobeItemDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.StreakType;
import com.foodbytes.model.WardrobeSlot;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * MPP-32: the single owner of the wardrobe's unlock rules (the PetGrowthPolicy pattern). Pure and
 * static; WardrobeService feeds it the caller's progress. Items carry their rule as data
 * (WardrobeCatalogue), so this evaluates rule kinds, never individual items.
 */
public final class WardrobePolicy {

    /**
     * awardCounts: per streak type, milestone → times earned (AwardStatusDTO.counts). firsts: the
     * firsts earned. peakForm: the highest form reached (PetGrowthDTO.peakForm).
     */
    public record Progress(Map<StreakType, Map<Integer, Integer>> awardCounts, Set<FirstKey> firsts, int peakForm) {}

    private WardrobePolicy() {
    }

    public static boolean isMet(UnlockRule rule, Progress progress) {
        return switch (rule.kind()) {
            case STARTER -> true;
            case AWARD -> earned(progress, rule.streak(), rule.milestone());
            case ANY_AWARD -> Arrays.stream(StreakType.values()).anyMatch(type -> earned(progress, type, rule.milestone()));
            case ALL_AWARDS -> Arrays.stream(StreakType.values()).allMatch(type -> earned(progress, type, rule.milestone()));
            case FIRST -> progress.firsts().contains(rule.first());
            case FORM -> progress.peakForm() >= rule.form();
        };
    }

    /** Ids whose rule is met and which the caller doesn't own yet, in catalogue order. */
    public static List<String> newlyMet(Progress progress, Set<String> owned) {
        return WardrobeCatalogue.ITEMS.stream()
                .filter(item -> !owned.contains(item.id()) && isMet(item.rule(), progress))
                .map(WardrobeCatalogue.Item::id)
                .toList();
    }

    public static WardrobeDTO toDTO(Set<String> owned, Set<String> unseen, Map<WardrobeSlot, String> outfit) {
        List<WardrobeItemDTO> items = WardrobeCatalogue.ITEMS.stream()
                .map(item -> new WardrobeItemDTO(item.id(), item.slot(),
                        owned.contains(item.id()), owned.contains(item.id()) && unseen.contains(item.id())))
                .toList();
        return new WardrobeDTO(items, outfit);
    }

    private static boolean earned(Progress progress, StreakType type, int milestone) {
        return progress.awardCounts().getOrDefault(type, Map.of()).getOrDefault(milestone, 0) > 0;
    }
}
```

- [x] **Step 7: Run — expect pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=WardrobePolicyTest`
Expected: `BUILD SUCCESS`, 12 tests, 0 failures.

### Task 7: `WardrobeService` (test-first) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/WardrobeService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/WardrobeServiceTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.service;

import com.foodbytes.dto.AwardStatusDTO;
import com.foodbytes.dto.FirstStatusDTO;
import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.dto.WardrobeDTO;
import com.foodbytes.dto.WardrobeItemDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.PetOutfitSlot;
import com.foodbytes.model.PetWardrobeUnlock;
import com.foodbytes.model.StreakType;
import com.foodbytes.model.WardrobeSlot;
import com.foodbytes.repository.PetOutfitSlotRepository;
import com.foodbytes.repository.PetWardrobeUnlockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** MPP-32 AC 2 / AC 4 / AC 7: grants are kept forever, equips are validated, and the outfit never follows the form. */
@ExtendWith(MockitoExtension.class)
class WardrobeServiceTest {

    private static final Long USER = 7L;
    private static final Instant NOW = Instant.parse("2026-10-14T09:00:00Z");

    @Mock private PetWardrobeUnlockRepository unlockRepository;
    @Mock private PetOutfitSlotRepository outfitRepository;
    @Mock private AwardService awardService;
    @Mock private PetFirstService petFirstService;
    private WardrobeService service;

    @BeforeEach
    void setUp() {
        service = new WardrobeService(unlockRepository, outfitRepository, awardService, petFirstService,
                Clock.fixed(NOW, ZoneOffset.UTC));
        lenient().when(awardService.getAwards(USER)).thenReturn(awards(Map.of()));
        lenient().when(petFirstService.getFirsts(USER)).thenReturn(List.of(new FirstStatusDTO(FirstKey.PLAN_FULL_WEEK, null)));
        lenient().when(outfitRepository.findByUserId(USER)).thenReturn(List.of());
    }

    private static List<AwardStatusDTO> awards(Map<StreakType, Map<Integer, Integer>> counts) {
        return Arrays.stream(StreakType.values())
                .map(type -> new AwardStatusDTO(type, 0, 0, counts.getOrDefault(type, Map.of()), null))
                .toList();
    }

    private static PetGrowthDTO growth(int form, int peakForm, int lastDayScore) {
        return new PetGrowthDTO(0, form, 0, 15, false, lastDayScore, null, peakForm);
    }

    private static PetWardrobeUnlock unlock(String id, boolean seen) {
        return new PetWardrobeUnlock(null, USER, id, null, seen ? LocalDateTime.of(2026, 10, 1, 9, 0) : null);
    }

    private void owns(PetWardrobeUnlock... unlocks) {
        when(unlockRepository.findByUserId(USER)).thenReturn(List.of(unlocks));
    }

    private static WardrobeItemDTO item(WardrobeDTO dto, String id) {
        return dto.getItems().stream().filter(i -> i.getId().equals(id)).findFirst().orElseThrow();
    }

    @Test
    void sync_grantsOnlyNewlyMetItems() {
        owns(unlock("beanie", true));
        when(awardService.getAwards(USER)).thenReturn(awards(Map.of(StreakType.PLAN, Map.of(3, 1))));

        service.sync(USER, growth(1, 1, 0));

        verify(unlockRepository).insertIfAbsent(USER, "chef-whites");
        verify(unlockRepository).insertIfAbsent(USER, "jeans");
        verify(unlockRepository, never()).insertIfAbsent(USER, "beanie");
        verify(unlockRepository, never()).insertIfAbsent(USER, "round-specs"); // first not earned (earnedAt null)
    }

    @Test
    void sync_grantsAnEarnedFirst_andAnEvolutionFromThePeakForm() {
        owns(unlock("beanie", true), unlock("jeans", true));
        when(petFirstService.getFirsts(USER)).thenReturn(List.of(new FirstStatusDTO(FirstKey.PLAN_FULL_WEEK, NOW)));

        service.sync(USER, growth(2, 3, -3)); // de-evolved to Seedling after reaching Sprig

        verify(unlockRepository).insertIfAbsent(USER, "round-specs");
        verify(unlockRepository).insertIfAbsent(USER, "straw-hat");
    }

    @Test
    void sync_keepsItemsForever_whenProgressNoLongerMeetsTheirRule() {
        owns(unlock("beanie", true), unlock("jeans", true), unlock("sunglasses", true));

        WardrobeDTO dto = service.sync(USER, growth(1, 1, -3)); // wilted seed

        assertThat(item(dto, "sunglasses").isOwned()).isTrue();
        verify(unlockRepository, never()).insertIfAbsent(eq(USER), anyString());
    }

    @Test
    void outfit_survivesAnEvolutionAndAWilt_unchanged() {
        owns(unlock("beanie", true), unlock("jeans", true));
        when(outfitRepository.findByUserId(USER)).thenReturn(List.of(
                new PetOutfitSlot(1L, USER, WardrobeSlot.HAT, "beanie"),
                new PetOutfitSlot(2L, USER, WardrobeSlot.PANTS, "jeans")));

        WardrobeDTO seed = service.sync(USER, growth(1, 1, 3));
        WardrobeDTO wiltedBasilisk = service.sync(USER, growth(5, 5, -3));

        assertThat(wiltedBasilisk.getOutfit()).isEqualTo(seed.getOutfit())
                .containsOnly(Map.entry(WardrobeSlot.HAT, "beanie"), Map.entry(WardrobeSlot.PANTS, "jeans"));
        verify(outfitRepository, never()).upsert(any(), any(), any());
        verify(outfitRepository, never()).deleteByUserIdAndSlot(any(), any());
        verify(outfitRepository, never()).deleteByUserId(any());
    }

    @Test
    void getWardrobe_unseenOnlyForUnseenRows() {
        owns(unlock("beanie", true), unlock("wellies", false));

        WardrobeDTO dto = service.getWardrobe(USER);

        assertThat(item(dto, "beanie").isUnseen()).isFalse();
        assertThat(item(dto, "wellies").isUnseen()).isTrue();
        assertThat(item(dto, "cap").isOwned()).isFalse();
    }

    @Test
    void equip_ownedItem_upsertsTheSlot() {
        when(unlockRepository.existsByUserIdAndItemKey(USER, "beanie")).thenReturn(true);
        owns(unlock("beanie", true));

        service.equip(USER, WardrobeSlot.HAT, "beanie");

        verify(outfitRepository).upsert(USER, "HAT", "beanie");
    }

    @Test
    void equip_null_emptiesTheSlot() {
        owns();
        service.equip(USER, WardrobeSlot.HAT, null);
        verify(outfitRepository).deleteByUserIdAndSlot(USER, WardrobeSlot.HAT);
    }

    @Test
    void equip_rejectsUnknownWrongSlotAndLockedItems() {
        assertThatThrownBy(() -> service.equip(USER, WardrobeSlot.HAT, "jetpack"))
                .isInstanceOf(IllegalArgumentException.class).hasMessage("Unknown item: jetpack");
        assertThatThrownBy(() -> service.equip(USER, WardrobeSlot.HAT, "jeans"))
                .isInstanceOf(IllegalArgumentException.class).hasMessage("jeans is not a HAT");
        when(unlockRepository.existsByUserIdAndItemKey(USER, "top-hat")).thenReturn(false);
        assertThatThrownBy(() -> service.equip(USER, WardrobeSlot.HAT, "top-hat"))
                .isInstanceOf(IllegalArgumentException.class).hasMessage("top-hat is still locked");
        verify(outfitRepository, never()).upsert(any(), any(), any());
    }

    @Test
    void undress_emptiesEverySlot() {
        owns();
        service.undress(USER);
        verify(outfitRepository).deleteByUserId(USER);
    }

    @Test
    @SuppressWarnings("unchecked")
    void markSeen_marksOnlyThatSlotsItems_atNow() {
        owns();
        ArgumentCaptor<Collection<String>> ids = ArgumentCaptor.forClass(Collection.class);

        service.markSeen(USER, WardrobeSlot.SHOES);

        verify(unlockRepository).markSeen(eq(USER), ids.capture(), eq(LocalDateTime.of(2026, 10, 14, 9, 0)));
        assertThat(ids.getValue()).containsExactly("sneakers", "wellies");
    }
}
```

- [x] **Step 2: Run — expect a compile failure**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=WardrobeServiceTest`
Expected: `COMPILATION ERROR` — `WardrobeService` not found.

- [x] **Step 3: Create `WardrobeService`**

```java
package com.foodbytes.service;

import com.foodbytes.dto.FirstStatusDTO;
import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.dto.WardrobeDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.PetWardrobeUnlock;
import com.foodbytes.model.StreakType;
import com.foodbytes.model.WardrobeSlot;
import com.foodbytes.repository.PetOutfitSlotRepository;
import com.foodbytes.repository.PetWardrobeUnlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * MPP-32: the caller's own wardrobe (per-person Pip, MPP-33 — always the caller's id, never the
 * meal-plan owner). sync() grants every item whose rule (WardrobeCatalogue / WardrobePolicy) the
 * caller now meets; no method deletes an unlock, so clothes are kept forever (AC 2), whatever
 * happens to the form, the wilt or the streaks. The outfit is stored apart from growth, so it
 * survives evolving and wilting unchanged (AC 7).
 */
@Service
@RequiredArgsConstructor
public class WardrobeService {

    private final PetWardrobeUnlockRepository unlockRepository;
    private final PetOutfitSlotRepository outfitRepository;
    private final AwardService awardService;
    private final PetFirstService petFirstService;
    private final Clock clock;

    /** Called on every pet read. getAwards also syncs the award ledger, so streak unlocks don't wait for the cabinet. */
    @Transactional
    public WardrobeDTO sync(Long userId, PetGrowthDTO growth) {
        Set<String> owned = ownedIds(unlockRepository.findByUserId(userId));
        List<String> fresh = WardrobePolicy.newlyMet(progress(userId, growth), owned);
        fresh.forEach(id -> unlockRepository.insertIfAbsent(userId, id));
        return getWardrobe(userId);
    }

    @Transactional(readOnly = true)
    public WardrobeDTO getWardrobe(Long userId) {
        List<PetWardrobeUnlock> unlocks = unlockRepository.findByUserId(userId);
        Set<String> unseen = unlocks.stream()
                .filter(unlock -> unlock.getSeenAt() == null)
                .map(PetWardrobeUnlock::getItemKey)
                .collect(Collectors.toSet());
        Map<WardrobeSlot, String> outfit = new EnumMap<>(WardrobeSlot.class);
        outfitRepository.findByUserId(userId).forEach(slot -> outfit.put(slot.getSlot(), slot.getItemKey()));
        return WardrobePolicy.toDTO(ownedIds(unlocks), unseen, outfit);
    }

    /** AC 4: puts an owned item on, or empties the slot when itemId is null/blank. */
    @Transactional
    public WardrobeDTO equip(Long userId, WardrobeSlot slot, String itemId) {
        if (itemId == null || itemId.isBlank()) {
            outfitRepository.deleteByUserIdAndSlot(userId, slot);
            return getWardrobe(userId);
        }
        WardrobeCatalogue.Item item = WardrobeCatalogue.find(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown item: " + itemId));
        if (item.slot() != slot) {
            throw new IllegalArgumentException(itemId + " is not a " + slot);
        }
        if (!unlockRepository.existsByUserIdAndItemKey(userId, itemId)) {
            throw new IllegalArgumentException(itemId + " is still locked");
        }
        outfitRepository.upsert(userId, slot.name(), itemId);
        return getWardrobe(userId);
    }

    @Transactional
    public WardrobeDTO undress(Long userId) {
        outfitRepository.deleteByUserId(userId);
        return getWardrobe(userId);
    }

    /** AC 4: opening a slot's tab marks its new items seen, which clears their NEW tags and, eventually, the badge. */
    @Transactional
    public WardrobeDTO markSeen(Long userId, WardrobeSlot slot) {
        unlockRepository.markSeen(userId, WardrobeCatalogue.idsIn(slot), LocalDateTime.now(clock));
        return getWardrobe(userId);
    }

    private WardrobePolicy.Progress progress(Long userId, PetGrowthDTO growth) {
        Map<StreakType, Map<Integer, Integer>> counts = new EnumMap<>(StreakType.class);
        awardService.getAwards(userId).forEach(status -> counts.put(status.getStreakType(), status.getCounts()));
        Set<FirstKey> firsts = petFirstService.getFirsts(userId).stream()
                .filter(first -> first.getEarnedAt() != null)
                .map(FirstStatusDTO::getKey)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(FirstKey.class)));
        return new WardrobePolicy.Progress(counts, firsts, growth.getPeakForm());
    }

    private static Set<String> ownedIds(List<PetWardrobeUnlock> unlocks) {
        return unlocks.stream().map(PetWardrobeUnlock::getItemKey).collect(Collectors.toSet());
    }
}
```

- [x] **Step 4: Run — expect pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=WardrobeServiceTest`
Expected: `BUILD SUCCESS`, 10 tests, 0 failures. (If Mockito strict stubs flags an unused stub, make that stub `lenient()`; do not delete an assertion.)

### Task 8: Put `wardrobe` on `PetDTO` for get and rename ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PetDTO.java`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetPolicy.java:35-42`
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PetService.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PetServiceTest.java`

- [x] **Step 1: Write the failing test**

In `PetServiceTest`: add the mock and stub, and one test.

```java
    @Mock private WardrobeService wardrobeService;
    // …
    private static final WardrobeDTO WARDROBE = new WardrobeDTO(List.of(), Map.of(WardrobeSlot.HAT, "beanie"));
```

In `setUp()`, after the growth stub:

```java
        lenient().when(wardrobeService.sync(any(), any(PetGrowthDTO.class))).thenReturn(WARDROBE);
```

New test:

```java
    @Test
    void getPet_carriesTheCallersOwnWardrobe_syncedAgainstTheirGrowth() {
        when(userRepository.findById(LINKED_ID)).thenReturn(Optional.of(linked));

        PetDTO pet = petService.getPet(LINKED_ID);

        assertThat(pet.getWardrobe()).isSameAs(WARDROBE);
        verify(wardrobeService).sync(LINKED_ID, GROWTH);
        verify(wardrobeService, never()).sync(eq(OWNER_ID), any());
    }
```

Add the imports `com.foodbytes.dto.WardrobeDTO`, `com.foodbytes.model.WardrobeSlot`, `java.util.List`, `java.util.Map`, `static org.mockito.ArgumentMatchers.eq`.

- [x] **Step 2: Run — expect a compile failure**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest`
Expected: `COMPILATION ERROR` — `getWardrobe()` not found on `PetDTO`.

- [x] **Step 3: Add the field to `PetDTO`**

```java
    private PetGrowthDTO growth;      // MPP-31: the caller's own Pip growth, never null
    private WardrobeDTO wardrobe;     // MPP-32: the caller's own wardrobe, never null
```

Update the class comment's last sentence to `MPP-31: growth. MPP-32: wardrobe.`

- [x] **Step 4: Widen `PetPolicy.toDTO`**

```java
    public static PetDTO toDTO(User user, PetGrowthDTO growth, WardrobeDTO wardrobe) {
        String saved = user.getPetName();
        return new PetDTO(
                saved != null ? saved : DEFAULT_NAME,
                saved != null,
                MealTimesPolicy.effective(user),
                growth,
                wardrobe);
    }
```

Add `import com.foodbytes.dto.WardrobeDTO;`.

- [x] **Step 5: Sync in `PetService`**

Add the field `private final WardrobeService wardrobeService;`. Replace `toDTO`:

```java
    // The client replaces its whole pet with either response, so both carry growth and the wardrobe.
    private PetDTO toDTO(User user) {
        PetGrowthDTO growth = petGrowthService.growth(user);
        return PetPolicy.toDTO(user, growth, wardrobeService.sync(user.getId(), growth));
    }
```

Add `import com.foodbytes.dto.PetGrowthDTO;`, and extend the class comment with `MPP-32: and the caller's own wardrobe, synced against that growth (WardrobeService).`

- [x] **Step 6: Run — expect pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetServiceTest+PetControllerTest`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 9: Request DTOs and `PetWardrobeController` (test-first) ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/WardrobeEquipRequest.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/WardrobeSeenRequest.java`
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/PetWardrobeController.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/PetWardrobeControllerTest.java`

- [x] **Step 1: Write the failing test**

```java
package com.foodbytes.controller;

import com.foodbytes.dto.WardrobeDTO;
import com.foodbytes.dto.WardrobeEquipRequest;
import com.foodbytes.model.WardrobeSlot;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.WardrobeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MPP-32: the wardrobe write endpoints — 401 without a principal, 400 {error} on a bad item or body. */
@WebMvcTest(PetWardrobeController.class)
@AutoConfigureMockMvc(addFilters = false)
class PetWardrobeControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private WardrobeService wardrobeService;

    private static final WardrobeDTO WARDROBE = new WardrobeDTO(List.of(), Map.of(WardrobeSlot.HAT, "beanie"));

    private static UserPrincipal principal() {
        UserPrincipal principal = mock(UserPrincipal.class);
        when(principal.getId()).thenReturn(2L);
        return principal;
    }

    private static WardrobeEquipRequest equip(WardrobeSlot slot, String itemId) {
        WardrobeEquipRequest request = new WardrobeEquipRequest();
        request.setSlot(slot);
        request.setItemId(itemId);
        return request;
    }

    @Test
    void everyEndpoint_withoutPrincipal_returns401() throws Exception {
        mockMvc.perform(put("/api/pet/wardrobe/outfit").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slot\":\"HAT\",\"itemId\":\"beanie\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Not authenticated"));
        mockMvc.perform(delete("/api/pet/wardrobe/outfit")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/pet/wardrobe/seen").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slot\":\"HAT\"}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(wardrobeService);
    }

    @Test
    void equip_missingSlot_returns400() throws Exception {
        mockMvc.perform(put("/api/pet/wardrobe/outfit").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"itemId\":\"beanie\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("slot is required"));
    }

    @Test
    void equip_returnsTheWardrobe() {
        when(wardrobeService.equip(2L, WardrobeSlot.HAT, "beanie")).thenReturn(WARDROBE);

        ResponseEntity<?> response = new PetWardrobeController(wardrobeService).equip(principal(), equip(WardrobeSlot.HAT, "beanie"));

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isSameAs(WARDROBE);
    }

    @Test
    void equip_lockedItem_returns400WithTheMessage() {
        when(wardrobeService.equip(2L, WardrobeSlot.HAT, "top-hat"))
                .thenThrow(new IllegalArgumentException("top-hat is still locked"));

        ResponseEntity<?> response = new PetWardrobeController(wardrobeService).equip(principal(), equip(WardrobeSlot.HAT, "top-hat"));

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isEqualTo(Map.of("error", "top-hat is still locked"));
    }

    @Test
    void undressAndSeen_returnTheWardrobe() {
        when(wardrobeService.undress(2L)).thenReturn(WARDROBE);
        when(wardrobeService.markSeen(2L, WardrobeSlot.SHOES)).thenReturn(WARDROBE);
        PetWardrobeController controller = new PetWardrobeController(wardrobeService);
        com.foodbytes.dto.WardrobeSeenRequest seen = new com.foodbytes.dto.WardrobeSeenRequest();
        seen.setSlot(WardrobeSlot.SHOES);

        assertThat(controller.undress(principal()).getBody()).isSameAs(WARDROBE);
        assertThat(controller.markSeen(principal(), seen).getBody()).isSameAs(WARDROBE);
    }
}
```

- [x] **Step 2: Run — expect a compile failure**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetWardrobeControllerTest`
Expected: `COMPILATION ERROR` — `PetWardrobeController` / `WardrobeEquipRequest` not found.

- [x] **Step 3: Create the request DTOs**

```java
package com.foodbytes.dto;

import com.foodbytes.model.WardrobeSlot;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** MPP-32: PUT /api/pet/wardrobe/outfit — put itemId in slot, or empty the slot when itemId is null. */
@Data
public class WardrobeEquipRequest {
    @NotNull(message = "slot is required")
    private WardrobeSlot slot;

    private String itemId;
}
```

```java
package com.foodbytes.dto;

import com.foodbytes.model.WardrobeSlot;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** MPP-32: POST /api/pet/wardrobe/seen — the slot whose tab was opened. */
@Data
public class WardrobeSeenRequest {
    @NotNull(message = "slot is required")
    private WardrobeSlot slot;
}
```

- [x] **Step 4: Create the controller**

```java
package com.foodbytes.controller;

import com.foodbytes.dto.WardrobeEquipRequest;
import com.foodbytes.dto.WardrobeSeenRequest;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.WardrobeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * MPP-32: the caller's own wardrobe writes (see WardrobeService). Reads ride on GET /api/pet
 * (PetDTO.wardrobe). Every response is the whole WardrobeDTO, which the client swaps in.
 */
@RestController
@RequestMapping("/api/pet/wardrobe")
@RequiredArgsConstructor
public class PetWardrobeController {

    private final WardrobeService wardrobeService;

    @PutMapping("/outfit")
    public ResponseEntity<?> equip(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody WardrobeEquipRequest request) {
        if (userPrincipal == null) {
            return unauthenticated();
        }
        try {
            return ResponseEntity.ok(wardrobeService.equip(userPrincipal.getId(), request.getSlot(), request.getItemId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/outfit")
    public ResponseEntity<?> undress(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return unauthenticated();
        }
        return ResponseEntity.ok(wardrobeService.undress(userPrincipal.getId()));
    }

    @PostMapping("/seen")
    public ResponseEntity<?> markSeen(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody WardrobeSeenRequest request) {
        if (userPrincipal == null) {
            return unauthenticated();
        }
        return ResponseEntity.ok(wardrobeService.markSeen(userPrincipal.getId(), request.getSlot()));
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

    private static ResponseEntity<?> unauthenticated() {
        return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
    }
}
```

- [x] **Step 5: Run — expect pass**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PetWardrobeControllerTest`
Expected: `BUILD SUCCESS`, 5 tests, 0 failures.

---

## Phase 3 — Client: catalogue, geometry and the node check

Pure JS only: no component imports these yet, so the build and the running app are unchanged. The phase ends with `npm run check:wardrobe` green, which is where AC 7 is proved on the client.

### Task 10: `constants/pipWardrobe.js` and `utils/pipWardrobe.js` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/pipWardrobe.js`
- Create: `foodbytes-app/client/src/utils/pipWardrobe.js`

- [x] **Step 1: Create the constants**

```js
/**
 * MPP-32: Pip's wardrobe — slots, item labels and unlock hints. Ids, slots and the unlock rules
 * themselves live on the server (WardrobeCatalogue); this file only names them. Hints follow the
 * phone mockup's UNLOCKS (mpp-32-wardrobe-phone-mockup.html).
 */
export const WARDROBE_SLOT = {
  HAT: 'HAT',
  GLASSES: 'GLASSES',
  SCARF: 'SCARF',
  JACKET: 'JACKET',
  BELT: 'BELT',
  PANTS: 'PANTS',
  SHOES: 'SHOES'
}

// AC 4: tab order.
export const WARDROBE_SLOTS = [
  { key: WARDROBE_SLOT.HAT, label: 'Hat' },
  { key: WARDROBE_SLOT.GLASSES, label: 'Glasses' },
  { key: WARDROBE_SLOT.SCARF, label: 'Scarf' },
  { key: WARDROBE_SLOT.JACKET, label: 'Jacket' },
  { key: WARDROBE_SLOT.BELT, label: 'Belt' },
  { key: WARDROBE_SLOT.PANTS, label: 'Pants' },
  { key: WARDROBE_SLOT.SHOES, label: 'Shoes' }
]

const { HAT, GLASSES, SCARF, JACKET, BELT, PANTS, SHOES } = WARDROBE_SLOT

// AC 1: the 20 items, in the server's catalogue order.
export const WARDROBE_ITEMS = {
  beanie: { slot: HAT, label: 'Beanie', unlockHint: 'Owned from the start' },
  cap: { slot: HAT, label: 'Cap', unlockHint: '5 days alcohol-free' },
  'chef-hat': { slot: HAT, label: 'Chef hat', unlockHint: 'Your first homemade extra' },
  'straw-hat': { slot: HAT, label: 'Straw hat', unlockHint: 'Grow to Sprig' },
  'top-hat': { slot: HAT, label: 'Top hat', unlockHint: 'Any 1-month streak' },
  'round-specs': { slot: GLASSES, label: 'Round specs', unlockHint: 'Your first full week planned' },
  'heart-glasses': { slot: GLASSES, label: 'Heart glasses', unlockHint: '2 weeks alcohol-free' },
  sunglasses: { slot: GLASSES, label: 'Sunglasses', unlockHint: 'Grow to Basilisk' },
  'red-scarf': { slot: SCARF, label: 'Red scarf', unlockHint: '1 week alcohol-free' },
  'striped-scarf': { slot: SCARF, label: 'Striped scarf', unlockHint: '3 weeks snack-free' },
  'chef-whites': { slot: JACKET, label: 'Chef whites', unlockHint: '3 days following the plan' },
  'denim-jacket': { slot: JACKET, label: 'Denim jacket', unlockHint: '2 weeks following the plan' },
  puffer: { slot: JACKET, label: 'Puffer', unlockHint: '3 weeks following the plan' },
  'leather-belt': { slot: BELT, label: 'Leather belt', unlockHint: '3 weeks alcohol-free' },
  'champion-belt': { slot: BELT, label: 'Champion belt', unlockHint: 'A 1-month streak on the plan, snacks and alcohol' },
  jeans: { slot: PANTS, label: 'Jeans', unlockHint: 'Owned from the start' },
  joggers: { slot: PANTS, label: 'Joggers', unlockHint: '2 weeks snack-free' },
  dungarees: { slot: PANTS, label: 'Dungarees', unlockHint: '1 week following the plan' },
  sneakers: { slot: SHOES, label: 'Sneakers', unlockHint: '1 week snack-free' },
  wellies: { slot: SHOES, label: 'Wellies', unlockHint: 'Grow to Bushling' }
}

// Suffixed with the user id, so two people on one browser keep their own list (MPP-33).
export const WARDROBE_ANNOUNCED_STORAGE_KEY = 'foodbytes.pip.wardrobeAnnounced'

export const WARDROBE_BUTTON_LABEL = 'Wardrobe'
export const WARDROBE_BUTTON_NEW_LABEL = 'Wardrobe, new outfit waiting'
export const WARDROBE_TITLE = 'Dress Pip'
export const WARDROBE_CLOSE_LABEL = 'Close and go back to the room'
export const WARDROBE_UNDRESS_LABEL = 'Undress'
export const WARDROBE_TABS_LABEL = 'Clothing slots'
export const WARDROBE_NONE_LABEL = 'None'
export const WARDROBE_NEW_TAG = 'NEW'
export const WARDROBE_LOCK_PREFIX = 'Unlock:'
export const WARDROBE_LINEUP_TITLE = 'Same outfit, every evolution'
export const WARDROBE_UNREACHED_LABEL = '???'
export const WARDROBE_SAVE_ERROR = "Couldn't save the outfit. Try again."
```

- [x] **Step 2: Create the pure helpers**

```js
import { WARDROBE_ITEMS, WARDROBE_SLOTS } from '../constants/pipWardrobe.js'

/**
 * MPP-32: pure helpers over the server's WardrobeDTO ({ items: [{ id, slot, owned, unseen }],
 * outfit: { HAT: 'beanie', … } }). Ids this client has no label/art for are skipped, never drawn.
 */

export const knownItems = (wardrobe) => (wardrobe?.items ?? []).filter(item => WARDROBE_ITEMS[item.id])

export const itemsInSlot = (wardrobe, slot) => knownItems(wardrobe).filter(item => item.slot === slot)

/** AC 4: owned and not yet seen — the badge, the red tab dot and the NEW tags. */
export const newItemIds = (wardrobe) => knownItems(wardrobe).filter(item => item.owned && item.unseen).map(item => item.id)

export const slotHasNew = (wardrobe, slot) => itemsInSlot(wardrobe, slot).some(item => item.owned && item.unseen)

/** AC 4: the sheet opens on the first slot (tab order) holding something new, or null. */
export const firstNewSlot = (wardrobe) => WARDROBE_SLOTS.find(({ key }) => slotHasNew(wardrobe, key))?.key ?? null

export const wornCount = (outfit) => Object.values(outfit ?? {}).filter(Boolean).length

/** AC 4: tapping the worn item again, or "None" (null), empties the slot. */
export const toggleTarget = (outfit, slot, itemId) => (itemId && outfit?.[slot] !== itemId ? itemId : null)

/** The wardrobe with one slot set (itemId) or emptied (null) — the optimistic copy. */
export function withSlot(wardrobe, slot, itemId) {
  const outfit = { ...wardrobe.outfit }
  if (itemId) outfit[slot] = itemId
  else delete outfit[slot]
  return { ...wardrobe, outfit }
}

/** The wardrobe with every item in a slot marked seen — the optimistic copy. */
export const withSlotSeen = (wardrobe, slot) => ({
  ...wardrobe,
  items: wardrobe.items.map(item => (item.slot === slot ? { ...item, unseen: false } : item))
})

/** AC 6: "🎉 New outfit: Wellies!", or "… (+2 more)" when several arrived together. */
export function wardrobeAnnouncement(ids) {
  const first = WARDROBE_ITEMS[ids[0]]?.label
  if (!first) return null
  return ids.length > 1 ? `🎉 New outfit: ${first}! (+${ids.length - 1} more)` : `🎉 New outfit: ${first}!`
}
```

- [x] **Step 3: Smoke-check the helpers in node**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {wardrobeAnnouncement, toggleTarget} from './src/utils/pipWardrobe.js'; console.log(wardrobeAnnouncement(['wellies','beanie']), toggleTarget({HAT:'cap'},'HAT','cap'))"`
Expected: `🎉 New outfit: Wellies! (+1 more) null`

### Task 11: `herb/wardrobeArt.js` — every item from anchors ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/herb/wardrobeArt.js`

- [x] **Step 1: Port the mockup's item drawings as shape descriptors**

```js
import { HERB_FOOT_X, HERB_INK } from './herbForms.js'

/**
 * MPP-32 AC 3: every clothing item, drawn once from a form's anchors and never per form. Ported
 * from .claude/contract/MPP-15-epic-breakdown/mockups/pip-herb-wardrobe.html (HATS … SHOES,
 * drawPants … drawShoe). `f` is a herbForm(form) geometry; each function reads only the anchors
 * its slot uses (hat / eyes / neck + waist + side / feet) and returns shape descriptors —
 * { tag: 'path'|'circle'|'rect'|'ellipse', ...React SVG attributes } — that HerbOutfit.jsx
 * renders, so wardrobe.check.mjs can run the geometry in node.
 */

const CX = HERB_FOOT_X // every form is centred on x = 100

const fillPath = (d, fill, strokeWidth = 3.5) =>
  ({ tag: 'path', d, fill, stroke: HERB_INK, strokeWidth, strokeLinejoin: 'round' })
const strokePath = (d, stroke, strokeWidth, extra = {}) =>
  ({ tag: 'path', d, fill: 'none', stroke, strokeWidth, ...extra })
const bandShape = (d, fill, strokeWidth) => ({ tag: 'path', d, fill, stroke: HERB_INK, strokeWidth })

// ---- hats: (x, y, w) = head centre, brim line, hat width; `top` = highest y of the crown ----

const HATS = {
  beanie: (x, y, w) => {
    const h = w * 0.46
    return {
      top: y - h,
      shapes: [
        fillPath(`M${x - w / 2} ${y} C${x - w / 2} ${y - h * 1.3} ${x + w / 2} ${y - h * 1.3} ${x + w / 2} ${y} Z`, '#e8574a'),
        strokePath(`M${x - w * 0.22} ${y - h * 0.9} v${h * 0.7} M${x} ${y - h * 0.97} v${h * 0.8} M${x + w * 0.22} ${y - h * 0.9} v${h * 0.7}`, '#b83a30', 2.5),
        { tag: 'rect', x: x - w / 2 - 3, y: y - 7, width: w + 6, height: 11, rx: 5, fill: '#f6efe2', stroke: HERB_INK, strokeWidth: 3.5 }
      ]
    }
  },
  cap: (x, y, w) => {
    const h = w * 0.42
    return {
      top: y - h,
      shapes: [
        fillPath(`M${x + w * 0.3} ${y - 2} q${w * 0.45} -2 ${w * 0.62} 6 q${-w * 0.3} 6 ${-w * 0.62} 2 Z`, '#3c6fc6'),
        fillPath(`M${x - w / 2} ${y} C${x - w / 2} ${y - h * 1.3} ${x + w / 2} ${y - h * 1.3} ${x + w / 2} ${y} Z`, '#4a86e0'),
        { tag: 'circle', cx: x, cy: y - h * 0.98, r: 3, fill: '#3c6fc6', stroke: HERB_INK, strokeWidth: 2 }
      ]
    }
  },
  'chef-hat': (x, y, w) => {
    const h = w * 0.55
    return {
      top: y - h - 10,
      straight: true, // AC 3: the chef hat is never tilted
      shapes: [
        fillPath(`M${x - w / 2 + 4} ${y - 4} C${x - w / 2 - 12} ${y - h} ${x - w / 4} ${y - h - 18} ${x} ${y - h - 8} C${x + w / 4} ${y - h - 18} ${x + w / 2 + 12} ${y - h} ${x + w / 2 - 4} ${y - 4} Z`, '#fff'),
        { tag: 'rect', x: x - w / 2, y: y - 9, width: w, height: 12, rx: 3, fill: '#fff', stroke: HERB_INK, strokeWidth: 3.5 }
      ]
    }
  },
  'straw-hat': (x, y, w) => {
    const h = w * 0.34
    return {
      top: y - h,
      shapes: [
        { tag: 'ellipse', cx: x, cy: y - 2, rx: w * 0.86, ry: w * 0.17, fill: '#f2d58a', stroke: HERB_INK, strokeWidth: 3.5 },
        fillPath(`M${x - w * 0.34} ${y - 2} C${x - w * 0.34} ${y - h * 1.3} ${x + w * 0.34} ${y - h * 1.3} ${x + w * 0.34} ${y - 2} Z`, '#f6df9e'),
        strokePath(`M${x - w * 0.33} ${y - h * 0.3} h${w * 0.66}`, '#7cc95a', Math.max(4, w * 0.09))
      ]
    }
  },
  'top-hat': (x, y, w) => {
    const h = w * 0.6
    const cw = w * 0.66
    return {
      top: y - h,
      shapes: [
        { tag: 'rect', x: x - cw / 2, y: y - h, width: cw, height: h, rx: 3, fill: '#2d2a3a', stroke: HERB_INK, strokeWidth: 3.5 },
        { tag: 'rect', x: x - cw / 2, y: y - h * 0.32, width: cw, height: h * 0.16, fill: '#e8574a' },
        { tag: 'ellipse', cx: x, cy: y, rx: w * 0.58, ry: w * 0.1, fill: '#2d2a3a', stroke: HERB_INK, strokeWidth: 3.5 }
      ]
    }
  }
}

// ---- glasses: (L, R, y, s) = the two eye points and the face scale ----

const GLASSES = {
  'round-specs': (L, R, y, s) => [
    { tag: 'circle', cx: L, cy: y, r: 12 * s, fill: '#fff', fillOpacity: 0.25, stroke: HERB_INK, strokeWidth: 3 },
    { tag: 'circle', cx: R, cy: y, r: 12 * s, fill: '#fff', fillOpacity: 0.25, stroke: HERB_INK, strokeWidth: 3 },
    strokePath(`M${L + 12 * s} ${y - 2} Q${(L + R) / 2} ${y - 8 * s} ${R - 12 * s} ${y - 2}`, HERB_INK, 3)
  ],
  'heart-glasses': (L, R, y, s) => [
    ...[L, R].map(x => ({
      tag: 'path',
      d: `M${x} ${y + 9 * s} C${x - 16 * s} ${y - 1 * s} ${x - 12 * s} ${y - 14 * s} ${x} ${y - 6 * s} C${x + 12 * s} ${y - 14 * s} ${x + 16 * s} ${y - 1 * s} ${x} ${y + 9 * s} Z`,
      fill: '#ff6fa3', fillOpacity: 0.85, stroke: HERB_INK, strokeWidth: 3
    })),
    strokePath(`M${L + 10 * s} ${y - 4 * s} H${R - 10 * s}`, HERB_INK, 3)
  ],
  sunglasses: (L, R, y, s) => [
    ...[L, R].map(x => ({ tag: 'rect', x: x - 13 * s, y: y - 9 * s, width: 26 * s, height: 18 * s, rx: 8 * s, fill: '#2d2a3a', stroke: HERB_INK, strokeWidth: 3 })),
    strokePath(`M${L + 13 * s} ${y - 3} H${R - 13 * s}`, HERB_INK, 3),
    strokePath(`M${L - 7 * s} ${y - 4 * s} l${6 * s} -2 M${R - 7 * s} ${y - 4 * s} l${6 * s} -2`, '#fff', 2, { strokeLinecap: 'round', opacity: 0.7 })
  ]
}

// ---- torso bands between the neck and waist lines, curved like a smile, clipped to the body ----

const curveOf = (f) => f.side * 0.32
const arcY = (x, y0, c) => {
  const t = x / 200
  return y0 - c + 4 * c * t * (1 - t)
}
const arc = (y0, c) => `M0 ${y0 - c} Q${CX} ${y0 + c} 200 ${y0 - c}`
const band = (y0, y1, c) => `M0 ${y0 - c} Q${CX} ${y0 + c} 200 ${y0 - c} L200 ${y1 - c} Q${CX} ${y1 + c} 0 ${y1 - c} Z`

function pants({ color, seam, straps = false }, f) {
  const c = curveOf(f)
  const s = f.side
  const clip = [
    bandShape(band(f.waist, 240, c), color, 3),
    strokePath(`M${CX} ${f.waist} V200`, HERB_INK, 2.5, { opacity: 0.35 }),
    strokePath(arc(f.waist + 4, c), seam, 1.8, { strokeDasharray: '4 3' })
  ]
  if (straps) {
    clip.push(
      fillPath(`M${CX - s * 0.42} ${f.waist + 1} V${f.waist - 13} H${CX + s * 0.42} V${f.waist + 1}`, color, 3),
      strokePath(`M${CX - s * 0.36} ${f.waist - 11} L${CX - s * 0.72} ${arcY(CX - s * 0.72, f.neck, c)} M${CX + s * 0.36} ${f.waist - 11} L${CX + s * 0.72} ${arcY(CX + s * 0.72, f.neck, c)}`, color, 6),
      { tag: 'circle', cx: CX - s * 0.36, cy: f.waist - 8, r: 2.6, fill: '#e3c35a' },
      { tag: 'circle', cx: CX + s * 0.36, cy: f.waist - 8, r: 2.6, fill: '#e3c35a' }
    )
  }
  return { clip, extra: [] }
}

// AC 3: no sleeves — every jacket is a vest-cut band.
function jacket({ color, dark, style }, f) {
  const c = curveOf(f)
  const s = f.side
  const top = f.neck + 1
  const bottom = f.waist + 1
  const clip = [bandShape(band(top, bottom, c), color, 3)]
  if (style === 'open') {
    clip.push(
      fillPath(`M${CX - s * 0.22} ${arcY(CX - s * 0.22, top, c)} L${CX} ${bottom - 3} L${CX + s * 0.22} ${arcY(CX + s * 0.22, top, c)} Z`, '#fff', 2.5),
      strokePath(arc(bottom - 4, c), '#e3c35a', 1.6, { strokeDasharray: '3 3' }),
      strokePath(`M${CX - s * 0.62} ${arcY(CX - s * 0.62, top, c) + 7} h${s * 0.22}`, HERB_INK, 2, { opacity: 0.5 })
    )
  } else if (style === 'quilted') {
    for (let y = top + 6; y < bottom - 1; y += 6) clip.push(strokePath(arc(y, c), dark, 2))
    clip.push(strokePath(`M${CX} ${top} V${bottom}`, HERB_INK, 2.5))
  } else {
    const gap = Math.max(5, (bottom - top - 4) / 3)
    for (let y = top + 4; y < bottom - 1; y += gap) {
      clip.push(
        { tag: 'circle', cx: CX - s * 0.16, cy: y, r: 1.9, fill: HERB_INK },
        { tag: 'circle', cx: CX + s * 0.16, cy: y, r: 1.9, fill: HERB_INK }
      )
    }
  }
  return { clip, extra: [] }
}

// AC 3: the buckle sits outside the clip.
function belt({ color, buckle, big }, f) {
  const c = curveOf(f)
  const h = big ? 12 : 8
  const w = f.waist
  const extra = big
    ? [
        { tag: 'ellipse', cx: CX, cy: w, rx: 15, ry: 11, fill: buckle, stroke: HERB_INK, strokeWidth: 3 },
        { tag: 'path', d: `M${CX} ${w - 6} l2 4 h4 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 h4 Z`, fill: '#e8574a' }
      ]
    : [
        { tag: 'rect', x: CX - 6, y: w - 6, width: 12, height: 12, rx: 2, fill: 'none', stroke: buckle, strokeWidth: 3 },
        { tag: 'rect', x: CX - 6, y: w - 6, width: 12, height: 12, rx: 2, fill: 'none', stroke: HERB_INK, strokeWidth: 1 }
      ]
  return { clip: [bandShape(band(w - h / 2, w + h / 2, c), color, 2.5)], extra }
}

// AC 3: the tail and knot sit outside the clip.
function scarf({ color, stripe }, f) {
  const c = curveOf(f)
  const y = f.neck - 3
  const tx = CX + f.side * 0.45
  const ty = arcY(tx, y, c)
  const len = f.waist - f.neck + 8
  return {
    clip: [bandShape(band(y - 6, y + 6, c), color, 3), strokePath(arc(y, c), stripe, 3)],
    extra: [
      fillPath(`M${tx - 6} ${ty} l-3 ${len} h12 l2 ${-len} Z`, color, 3),
      strokePath(`M${tx - 9} ${ty + len} l-1 4 M${tx - 4} ${ty + len} v5 M${tx + 1} ${ty + len} l1 4`, HERB_INK, 2),
      { tag: 'rect', x: tx - 6, y: ty - 5, width: 10, height: 10, rx: 3, fill: color, stroke: HERB_INK, strokeWidth: 3 }
    ]
  }
}

const TORSO = {
  'red-scarf': (f) => scarf({ color: '#e8574a', stripe: '#c63f34' }, f),
  'striped-scarf': (f) => scarf({ color: '#ffd34d', stripe: '#4a86e0' }, f),
  'chef-whites': (f) => jacket({ color: '#fbfbf7', dark: '#d9d9cf', style: 'chef' }, f),
  'denim-jacket': (f) => jacket({ color: '#5b85c4', dark: '#3f669f', style: 'open' }, f),
  puffer: (f) => jacket({ color: '#f0a03c', dark: '#c97f24', style: 'quilted' }, f),
  'leather-belt': (f) => belt({ color: '#7a4a2a', buckle: '#e3c35a', big: false }, f),
  'champion-belt': (f) => belt({ color: '#d6a52b', buckle: '#fff3b0', big: true }, f),
  jeans: (f) => pants({ color: '#4a6fb0', seam: '#e3c35a' }, f),
  joggers: (f) => pants({ color: '#8a8f99', seam: '#fff' }, f),
  dungarees: (f) => pants({ color: '#6f9a4a', seam: '#e3c35a', straps: true }, f)
}

// ---- shoes on the two foot tips ----

const SHOES = {
  sneakers: { color: '#fff', trim: '#e8574a', tall: false },
  wellies: { color: '#e8b830', trim: '#c98f1a', tall: true }
}

function shoe({ color, trim, tall }, root, tip) {
  const dir = tip[0] < root[0] ? -1 : 1
  const [x, y] = tip
  if (tall) {
    return [
      fillPath(`M${x - 8 * dir} ${y - 14} h${12 * dir} v9 q${7 * dir} 1 ${8 * dir} 7 h${-20 * dir} Z`, color, 3),
      strokePath(`M${x - 8 * dir} ${y - 10} h${12 * dir}`, trim, 2.5)
    ]
  }
  return [
    fillPath(`M${x - 9 * dir} ${y + 2} q0 -10 ${9 * dir} -10 q${10 * dir} 0 ${12 * dir} 8 q0 3 -3 3 Z`, color, 3),
    strokePath(`M${x - 2 * dir} ${y - 6} l${5 * dir} 5`, trim, 2.5, { strokeLinecap: 'round' }),
    strokePath(`M${x - 9 * dir} ${y + 2} h${21 * dir}`, trim, 2)
  ]
}

/** { top, straight?, shapes } on the head anchor, or null for an id that isn't a hat. */
export const hatArt = (id, f) => HATS[id]?.(CX, f.hat.y, f.hat.w) ?? null

/** Shapes on the two eye points, scaled with the face. */
export const glassesArt = (id, f) => GLASSES[id]?.(CX - f.eyes.gap, CX + f.eyes.gap, f.eyes.y, f.eyes.s) ?? []

/** { clip, extra }: clip = drawn inside the body outline, extra = outside it. */
export const torsoArt = (id, f) => TORSO[id]?.(f) ?? { clip: [], extra: [] }

/** Shapes for both feet. */
export const shoeArt = (id, f) => (SHOES[id] ? f.feet.flatMap(([root, tip]) => shoe(SHOES[id], root, tip)) : [])

// Every id this file can draw, for wardrobe.check.mjs.
export const DRAWN_ITEM_IDS = [
  ...Object.keys(HATS), ...Object.keys(GLASSES), ...Object.keys(TORSO), ...Object.keys(SHOES)
]
```

- [x] **Step 2: Smoke-check one item in node**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {hatArt, DRAWN_ITEM_IDS} from './src/components/pet/herb/wardrobeArt.js'; import {herbForm} from './src/components/pet/herb/herbForms.js'; console.log(DRAWN_ITEM_IDS.length, hatArt('beanie', herbForm(5)).top)"`
Expected: `20` then ≈`64.12` (the crown rises 78 × 0.46 = 35.88 above the brim at y 100).

### Task 12: `herb/wardrobeLayers.js` — composition and crops ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/herb/wardrobeLayers.js`

- [x] **Step 1: Create the module**

```js
import { WARDROBE_SLOT } from '../../../constants/pipWardrobe.js'
import { HERB_FOOT_X, HERB_FOOT_Y, herbForm } from './herbForms.js'
import { glassesArt, hatArt, shoeArt, torsoArt } from './wardrobeArt.js'

/**
 * MPP-32 AC 3: an outfit composed for one form, in the z-slots PipHerbFigure draws them in:
 * shoes (after the feet) → [body] → clip: pants → jacket → belt → scarf (inside the body clip) →
 * [outline] → extra (belt buckle, scarf tail) → [face] → glasses (none asleep) → hat → [head
 * growth from growTop, lifted so it pokes through the hat]. Nothing here branches on the form:
 * the same outfit gives the same layers on every form, wilted or not (AC 7).
 */

const { HAT, GLASSES, BELT, JACKET, PANTS, SCARF, SHOES } = WARDROBE_SLOT

export const TORSO_ORDER = [PANTS, JACKET, BELT, SCARF]
export const HAT_TILT_DEG = -7

/**
 * @param {Object|null} outfit - { HAT: 'beanie', … } (absent slot = empty)
 * @param {number} form - 1–5
 * @param {{ asleep?: boolean }} [options]
 * @returns {{ shoes: Object[], clip: Object[], extra: Object[], glasses: Object[], hat: { shapes: Object[], transform: string|null }|null, growTop: number, itemIds: string[] }}
 */
export function dressLayers(outfit, form, { asleep = false } = {}) {
  const worn = outfit ?? {}
  const f = herbForm(form)
  const torsoIds = TORSO_ORDER.map(slot => worn[slot]).filter(Boolean)
  const torso = torsoIds.map(id => torsoArt(id, f))
  const hat = worn[HAT] ? hatArt(worn[HAT], f) : null
  const showGlasses = Boolean(worn[GLASSES]) && !asleep
  return {
    shoes: worn[SHOES] ? shoeArt(worn[SHOES], f) : [],
    clip: torso.flatMap(t => t.clip),
    extra: torso.flatMap(t => t.extra),
    glasses: showGlasses ? glassesArt(worn[GLASSES], f) : [],
    hat: hat && { shapes: hat.shapes, transform: hat.straight ? null : `rotate(${HAT_TILT_DEG} ${HERB_FOOT_X} ${f.hat.y})` },
    growTop: hat ? Math.min(f.growTop, hat.top + 4) : f.growTop,
    itemIds: [worn[SHOES], ...torsoIds, showGlasses ? worn[GLASSES] : null, worn[HAT]].filter(Boolean)
  }
}

/** AC 4: the square an item card crops to — head, eyes, torso or feet — after the form's scale (mockup slotCrop + pipCrop). */
export function slotCropViewBox(slot, form) {
  const f = herbForm(form)
  const [cy, size] = slotCrop(slot, f)
  return squareAround(cy, size, f.scale)
}

/** AC 5: the footer tab's crop when Pip wears a hat (mockup tabPip): head and hat, not the whole form. */
export function hatMiniViewBox(form) {
  const f = herbForm(form)
  return squareAround(f.hat.y - f.hat.w * 0.15, f.hat.w * 2 + 44, f.scale)
}

/** AC 5: the footer tab shows the hat only. */
export const hatOnly = (outfit) => (outfit?.[HAT] ? { [HAT]: outfit[HAT] } : {})

function slotCrop(slot, f) {
  if (slot === HAT) return [f.hat.y - f.hat.w * 0.35, f.hat.w * 1.9 + 26]
  if (slot === GLASSES) return [f.eyes.y, f.eyes.gap * 2 + 56 * f.eyes.s]
  if (slot === SHOES) return [180, f.feet[1][1][0] - f.feet[0][1][0] + 46]
  return [(f.neck + f.waist) / 2 + 2, f.side * 2 + 34]
}

// A square of `size` model units centred on (100, cy), mapped through the form's scale about the feet.
function squareAround(cy, size, k) {
  const y = HERB_FOOT_Y + (cy - HERB_FOOT_Y) * k
  const s = size * k
  return [HERB_FOOT_X - s / 2, y - s / 2, s, s].map(n => Number(n.toFixed(1))).join(' ')
}
```

- [x] **Step 2: Smoke-check in node**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {dressLayers, slotCropViewBox} from './src/components/pet/herb/wardrobeLayers.js'; const d = dressLayers({HAT:'chef-hat', GLASSES:'sunglasses'}, 3, {asleep:true}); console.log(d.hat.transform, d.glasses.length, d.itemIds.join(','), slotCropViewBox('HAT', 3))"`
Expected: `null 0 chef-hat <four numbers>`

### Task 13: `wardrobe.check.mjs` — AC 7 on the client ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/herb/wardrobe.check.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [x] **Step 1: Write the check**

```js
// Run: npm run check:wardrobe   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so MPP-32's wardrobe geometry is pinned
// here (AC 7): every item renders on every one of the five forms, each item reads only its slot's
// anchors (no per-form branches), layer order and the hidden-asleep glasses follow AC 3, and an
// outfit gives the same items on every form, wilted or not. Mirrors room.check.mjs.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { HERB_FORMS, herbForm } from './herbForms.js'
import { DRAWN_ITEM_IDS, glassesArt, hatArt, shoeArt, torsoArt } from './wardrobeArt.js'
import { TORSO_ORDER, dressLayers, hatMiniViewBox, hatOnly, slotCropViewBox } from './wardrobeLayers.js'
import { WARDROBE_ITEMS, WARDROBE_SLOT, WARDROBE_SLOTS } from '../../../constants/pipWardrobe.js'
import {
  firstNewSlot, newItemIds, toggleTarget, wardrobeAnnouncement, withSlot, withSlotSeen
} from '../../../utils/pipWardrobe.js'

const FORMS = HERB_FORMS.map((_, i) => i + 1)
const IDS = [
  'beanie', 'cap', 'chef-hat', 'straw-hat', 'top-hat', 'round-specs', 'heart-glasses', 'sunglasses',
  'red-scarf', 'striped-scarf', 'chef-whites', 'denim-jacket', 'puffer', 'leather-belt', 'champion-belt',
  'jeans', 'joggers', 'dungarees', 'sneakers', 'wellies'
]
const idsIn = (slot) => IDS.filter(id => WARDROBE_ITEMS[id].slot === slot)

// Every number in a shape list (attributes and path data) must be finite.
function assertFinite(shapes, where) {
  assert.ok(shapes.length > 0, `${where}: no shapes`)
  for (const { tag, ...attrs } of shapes) {
    assert.ok(['path', 'circle', 'rect', 'ellipse'].includes(tag), `${where}: unknown tag ${tag}`)
    for (const value of Object.values(attrs)) {
      assert.doesNotMatch(String(value), /NaN|undefined|Infinity/, `${where}: ${value}`)
      const numbers = typeof value === 'number' ? [value] : String(value).match(/-?\d*\.?\d+(e-?\d+)?/g) ?? []
      numbers.forEach(n => assert.ok(Number.isFinite(Number(n)), `${where}: ${value} is not finite`))
    }
  }
}

// ---- AC 1: the 20 items, labelled, hinted and drawn, matching the server's WardrobeCatalogue ----
assert.deepEqual(Object.keys(WARDROBE_ITEMS), IDS)
assert.deepEqual([...DRAWN_ITEM_IDS].sort(), [...IDS].sort())
assert.deepEqual(WARDROBE_SLOTS.map(s => s.key), ['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BELT', 'PANTS', 'SHOES'])
for (const id of IDS) {
  const item = WARDROBE_ITEMS[id]
  assert.ok(item.label && item.unlockHint, `${id} needs a label and an unlock hint`)
  assert.ok(Object.values(WARDROBE_SLOT).includes(item.slot), `${id} has an unknown slot`)
}
WARDROBE_SLOTS.forEach(({ key }) => assert.ok(idsIn(key).length > 0, `slot ${key} is empty`))

// ---- AC 3 / AC 7: every item on every form, drawn from its own anchors only ----
const moved = (f, patch) => ({ ...f, ...patch })
for (const form of FORMS) {
  const f = herbForm(form)
  const elsewhere = {
    HAT: { neck: f.neck + 7, waist: f.waist + 7, side: f.side + 7, eyes: { ...f.eyes, gap: f.eyes.gap + 7 }, feet: [] },
    GLASSES: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, neck: f.neck + 7, side: f.side + 7, feet: [] },
    TORSO: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, eyes: { ...f.eyes, gap: f.eyes.gap + 7 }, feet: [] },
    SHOES: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, neck: f.neck + 7, eyes: { ...f.eyes, gap: f.eyes.gap + 7 } }
  }
  const own = {
    HAT: { hat: { y: f.hat.y + 7, w: f.hat.w } },
    GLASSES: { eyes: { ...f.eyes, gap: f.eyes.gap + 7 } },
    TORSO: { neck: f.neck - 7, waist: f.waist + 7 },
    SHOES: { feet: f.feet.map(([root, tip]) => [root, [tip[0] + 7, tip[1]]]) }
  }
  for (const id of IDS) {
    const slot = WARDROBE_ITEMS[id].slot
    const where = `${id} on form ${form}`
    let draw
    let group
    if (slot === 'HAT') {
      group = 'HAT'
      draw = (g) => hatArt(id, g)
      const hat = draw(f)
      assertFinite(hat.shapes, where)
      assert.ok(hat.top < f.hat.y, `${where}: the crown must rise above the brim`)
    } else if (slot === 'GLASSES') {
      group = 'GLASSES'
      draw = (g) => glassesArt(id, g)
      assertFinite(draw(f), where)
    } else if (slot === 'SHOES') {
      group = 'SHOES'
      draw = (g) => shoeArt(id, g)
      assertFinite(draw(f), where)
    } else {
      group = 'TORSO'
      draw = (g) => torsoArt(id, g)
      const torso = draw(f)
      assertFinite(torso.clip, where)
      if (slot === 'BELT' || slot === 'SCARF') assertFinite(torso.extra, `${where} (outside the clip)`)
    }
    assert.deepEqual(draw(moved(f, elsewhere[group])), draw(f), `${where}: depends on an anchor its slot doesn't use`)
    assert.notDeepEqual(draw(moved(f, own[group])), draw(f), `${where}: ignores its own anchor`)
  }
}

// No per-form branches anywhere in the wardrobe drawing.
for (const file of ['./wardrobeArt.js', './wardrobeLayers.js']) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
  assert.doesNotMatch(source, /PIP_FORMS|form\s*===?|===?\s*form\b|switch\s*\(\s*form|\.name\b/, `${file} branches on a form`)
}

// ---- AC 3: layer order, tilt, growth through the hat, glasses hidden asleep ----
const FULL = { HAT: 'top-hat', GLASSES: 'round-specs', SCARF: 'red-scarf', JACKET: 'denim-jacket', BELT: 'leather-belt', PANTS: 'dungarees', SHOES: 'wellies' }
assert.deepEqual(TORSO_ORDER, ['PANTS', 'JACKET', 'BELT', 'SCARF'])
for (const form of FORMS) {
  const f = herbForm(form)
  const dress = dressLayers(FULL, form)
  const expectedClip = TORSO_ORDER.flatMap(slot => torsoArt(FULL[slot], f).clip)
  const expectedExtra = TORSO_ORDER.flatMap(slot => torsoArt(FULL[slot], f).extra)
  assert.deepEqual(dress.clip, expectedClip, `form ${form}: clip is pants → jacket → belt → scarf`)
  assert.deepEqual(dress.extra, expectedExtra, `form ${form}: buckle then scarf tail`)
  assert.deepEqual(dress.shoes, shoeArt('wellies', f))
  assert.match(dress.hat.transform, /^rotate\(-7 100 /, `form ${form}: hats tilt`)
  assert.equal(dressLayers({ HAT: 'chef-hat' }, form).hat.transform, null, `form ${form}: the chef hat stays straight`)
  assert.ok(dress.growTop <= f.growTop && dress.growTop <= hatArt('top-hat', f).top + 4, `form ${form}: growth pokes through the hat`)
  assert.equal(dressLayers({}, form).growTop, f.growTop, `form ${form}: no hat leaves growth where it was`)
  assert.ok(dress.glasses.length > 0)
  assert.deepEqual(dressLayers(FULL, form, { asleep: true }).glasses, [], `form ${form}: glasses hidden asleep`)
  const empty = dressLayers(null, form)
  assert.deepEqual([empty.shoes, empty.clip, empty.extra, empty.glasses, empty.hat, empty.itemIds], [[], [], [], [], null, []])
}

// ---- AC 7: the same outfit on every form, and a wilt never touches it ----
const outfit = Object.freeze({ ...FULL })
const ids = FORMS.map(form => dressLayers(outfit, form).itemIds)
ids.forEach(list => assert.deepEqual(list, ['wellies', 'dungarees', 'denim-jacket', 'leather-belt', 'red-scarf', 'round-specs', 'top-hat']))
for (const form of FORMS) {
  assert.deepEqual(dressLayers(outfit, form, { wilted: true }), dressLayers(outfit, form), `form ${form}: wilt changes the outfit`)
}
assert.deepEqual(outfit, FULL, 'dressLayers must not mutate the outfit')

// ---- AC 4 / AC 5: crops ----
for (const form of FORMS) {
  for (const box of [...WARDROBE_SLOTS.map(({ key }) => slotCropViewBox(key, form)), hatMiniViewBox(form)]) {
    const [, , w, h] = box.split(' ').map(Number)
    assert.ok(box.split(' ').map(Number).every(Number.isFinite) && w > 0 && w === h, `form ${form}: bad crop ${box}`)
  }
}
assert.deepEqual(hatOnly({ HAT: 'cap', SHOES: 'wellies' }), { HAT: 'cap' })
assert.deepEqual(hatOnly({ SHOES: 'wellies' }), {})
assert.deepEqual(hatOnly(null), {})

// ---- AC 4 / AC 6: wardrobe helpers ----
const wardrobe = {
  items: [
    { id: 'beanie', slot: 'HAT', owned: true, unseen: false },
    { id: 'wellies', slot: 'SHOES', owned: true, unseen: true },
    { id: 'cap', slot: 'HAT', owned: false, unseen: false },
    { id: 'jetpack', slot: 'HAT', owned: true, unseen: true }
  ],
  outfit: { HAT: 'beanie' }
}
assert.deepEqual(newItemIds(wardrobe), ['wellies'], 'unknown ids are skipped')
assert.equal(firstNewSlot(wardrobe), 'SHOES')
assert.equal(firstNewSlot(withSlotSeen(wardrobe, 'SHOES')), null)
assert.equal(toggleTarget(wardrobe.outfit, 'HAT', 'beanie'), null, 'tapping the worn item takes it off')
assert.equal(toggleTarget(wardrobe.outfit, 'HAT', 'cap'), 'cap')
assert.equal(toggleTarget(wardrobe.outfit, 'HAT', null), null, '"None" empties the slot')
assert.deepEqual(withSlot(wardrobe, 'HAT', null).outfit, {})
assert.deepEqual(withSlot(wardrobe, 'SHOES', 'wellies').outfit, { HAT: 'beanie', SHOES: 'wellies' })
assert.deepEqual(wardrobe.outfit, { HAT: 'beanie' }, 'withSlot must not mutate')
assert.equal(wardrobeAnnouncement(['wellies']), '🎉 New outfit: Wellies!')
assert.equal(wardrobeAnnouncement(['beanie', 'jeans']), '🎉 New outfit: Beanie! (+1 more)')
assert.equal(wardrobeAnnouncement(['jetpack']), null)

console.log('wardrobe checks passed')
```

- [x] **Step 2: Add the script**

In `foodbytes-app/client/package.json` → `scripts`, after `"check:growth"`:

```json
    "check:wardrobe": "node src/components/pet/herb/wardrobe.check.mjs",
```

- [x] **Step 3: Run the check**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`. If an "anchor" assertion fails, fix the geometry in `wardrobeArt.js` so the item reads its own anchors. Never weaken the assertion.

---

## Phase 4 — Rendering: Pip wears the outfit

Wires the geometry into the one figure renderer and the footer. With no outfit passed, every renderer draws exactly what it drew before, so the build and the app stay as they are until Phase 5 supplies the outfit.

### Task 14: `HerbOutfit.jsx`, outfit layers in `PipHerbFigure`, props on `PipHerb` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/herb/HerbOutfit.jsx`
- Modify: `foodbytes-app/client/src/components/pet/herb/PipHerbFigure.jsx`
- Modify: `foodbytes-app/client/src/components/pet/herb/PipHerb.jsx`
- Modify: `foodbytes-app/client/src/components/pet/herb/PipHerb.css`

- [x] **Step 1: Create the descriptor renderer**

```jsx
import { createElement } from 'react'

/** MPP-32: draws wardrobeArt shape descriptors ({ tag, ...SVG attributes }) as SVG elements. */
export function OutfitShapes({ shapes }) {
  return shapes.map(({ tag, ...attrs }, i) => createElement(tag, { key: i, ...attrs }))
}

export default OutfitShapes
```

- [x] **Step 2: Layer the outfit into `PipHerbFigure`**

Replace the component with the version below. It draws the same figure as before plus the AC 3 outfit layers, and `still` turns the idle animation off for cards and the lineup.

```jsx
import { useId } from 'react'
import { PET_MOODS, PET_SLEEP_FACE } from '../../../constants/pet'
import { PIP_FORMS, PIP_GROWTH_PHASES } from '../../../constants/pipGrowth'
import { HerbFace } from './herbFaces'
import { HERB_FOOT_Y, HERB_INK, herbForm } from './herbForms'
import { HerbBack, HerbGrowth, HerbProps } from './herbParts'
import OutfitShapes from './HerbOutfit'
import { dressLayers } from './wardrobeLayers'

/**
 * MPP-31: one herb form at a mood, as an SVG <g> in the 200-unit space with its feet at
 * (100, HERB_FOOT_Y) — PipHerb wraps it in an <svg>, RoomPip places it in the room.
 * `wilted` droops the leaves and desaturates (AC 7); `phase` drives the evolve pulse and the
 * de-evolve shrink (AC 8). The pip-mood-* class drives the idle animation (PipHerb.css).
 * MPP-32: `outfit` ({ HAT: 'beanie', … }) is layered in AC 3's order from the form's anchors
 * (wardrobeLayers); glasses hide while asleep and head growth pokes through the hat. `still`
 * stops the idle animation (Dress Pip cards and lineup).
 */
function PipHerbFigure({ form, mood, wilted = false, phase = null, showProps = false, outfit = null, still = false }) {
  const id = `pip-herb-${useId().replace(/:/g, '')}`
  const clipId = `${id}-body`
  const f = herbForm(form)
  const droop = wilted || mood === PET_MOODS.BORED || mood === PET_SLEEP_FACE
  const dress = dressLayers(outfit, form, { asleep: mood === PET_SLEEP_FACE })
  const k = f.scale
  const shineX = 100 - f.side * 0.55
  const shineY = f.hat.y + 10
  const className = [
    'pip-herb-figure',
    `pip-mood-${mood}`,
    wilted && 'is-wilted',
    still && 'is-still',
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
        <clipPath id={clipId}><path d={f.body} /></clipPath>
      </defs>
      <ellipse cx="100" cy="189" rx={56 * k} ry="6" fill="rgba(40,60,20,.13)" />
      <g className="pip-anim">
        <g transform={`translate(100 ${HERB_FOOT_Y}) scale(${k}) translate(-100 -${HERB_FOOT_Y})`}>
          <HerbBack form={form} droop={droop} />
          {f.feet.map(([root, tip]) => (
            <path key={tip[0]} d={`M${root[0]} ${root[1]} Q${root[0]} ${tip[1]} ${tip[0]} ${tip[1]}`}
              stroke={HERB_INK} strokeWidth="5.5" fill="none" strokeLinecap="round" />
          ))}
          <OutfitShapes shapes={dress.shoes} />
          <path d={f.body} fill={`url(#${id})`} />
          <ellipse cx={shineX} cy={shineY} rx="11" ry="6" transform={`rotate(-32 ${shineX} ${shineY})`} fill="#fff" opacity=".45" />
          {form === PIP_FORMS.BASIL_SEED && (
            <path d="M90 118 l5 7 l5 -6 l5 7 l5 -6" stroke={HERB_INK} strokeWidth="3" fill="none" strokeLinejoin="round" opacity=".7" />
          )}
          {dress.clip.length > 0 && <g clipPath={`url(#${clipId})`}><OutfitShapes shapes={dress.clip} /></g>}
          <path d={f.body} fill="none" stroke={HERB_INK} strokeWidth="5" strokeLinejoin="round" />
          <OutfitShapes shapes={dress.extra} />
          <HerbFace form={form} mood={mood} />
          <OutfitShapes shapes={dress.glasses} />
          {dress.hat && <g transform={dress.hat.transform ?? undefined}><OutfitShapes shapes={dress.hat.shapes} /></g>}
          <HerbGrowth form={form} droop={droop} base={dress.growTop} />
        </g>
      </g>
      {showProps && <HerbProps mood={mood} />}
    </g>
  )
}

export default PipHerbFigure
```

(The `form === PIP_FORMS.BASIL_SEED` seed mark is MPP-31's body art, not clothing, so it stays.)

- [x] **Step 3: Add `outfit`, `viewBox` and `still` to `PipHerb`**

```jsx
/**
 * MPP-31 AC 6 / AC 10: Pip as a standalone <svg>, replacing MPP-14's first pet. `full` keeps room
 * for mood props; `mini` (footer tab) and `crop` (Dress Pip cards / lineup) are decorative.
 * MPP-32: `outfit` dresses him; `viewBox` overrides the crop (item cards, the hat-only footer tab);
 * `still` stops the idle animation.
 */
function PipHerb({ form = PIP_DEFAULT_FORM, mood, wilted = false, variant = 'full', outfit = null, viewBox = null, still = false, className = '' }) {
  const isFull = variant === 'full'
  const a11y = isFull
    ? { role: 'img', 'aria-label': `${PIP_FORM_NAMES[form] ?? PIP_FORM_NAMES[PIP_DEFAULT_FORM]}, ${PET_MOOD_LABELS[mood]}` }
    : { 'aria-hidden': true, focusable: 'false' }

  return (
    <svg
      className={`pip-herb pip-herb--${variant} ${className}`.trim()}
      viewBox={viewBox ?? (isFull ? HERB_FULL_VIEWBOX : herbForm(form).miniViewBox)}
      xmlns="http://www.w3.org/2000/svg"
      {...a11y}
    >
      <PipHerbFigure form={form} mood={mood} wilted={wilted} showProps={isFull} outfit={outfit} still={still} />
    </svg>
  )
}
```

- [x] **Step 4: Add the `still` rule to `PipHerb.css`**

After the `.pip-herb-figure.is-shrinking` rule:

```css
/* MPP-32: Dress Pip item cards and the evolution lineup hold still. */
.pip-herb-figure.is-still .pip-anim { animation: none !important; }
```

- [x] **Step 5: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 15: Room and footer wear the outfit ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/RoomPip.jsx`
- Modify: `foodbytes-app/client/src/components/layout/Footer.jsx:5-8,16,80-84`

- [x] **Step 1: Pass `herb.outfit` through `RoomPip`**

```jsx
const DEFAULT_HERB = { form: PIP_DEFAULT_FORM, wilted: false, phase: null, outfit: null }
```

```jsx
      <PipHerbFigure form={herb.form} mood={face} wilted={herb.wilted} phase={herb.phase} showProps={showProps} outfit={herb.outfit} />
```

Extend the comment: ``MPP-32: `herb.outfit` dresses him (PetView passes the wardrobe's outfit).``

- [x] **Step 2: Hat-only footer tab**

Add imports:

```jsx
import { hatMiniViewBox, hatOnly } from '../pet/herb/wardrobeLayers'
```

Read the wardrobe:

```jsx
  const { petName, mood, growth, wardrobe } = usePet()
  const tabForm = growth?.form ?? PIP_DEFAULT_FORM
  const tabOutfit = hatOnly(wardrobe?.outfit) // MPP-32 AC 5: hat only — a full outfit is too busy at tab size
```

Replace the tab's `PipHerb`:

```jsx
        {/* MPP-14 AC 2 / MPP-31 / MPP-32: live mini herb in the current mood and form, wearing his hat; label is the pet's name. */}
        ...
          <PipHerb
            form={tabForm}
            mood={mood}
            wilted={isWilted(growth)}
            variant="mini"
            outfit={tabOutfit}
            viewBox={tabOutfit.HAT ? hatMiniViewBox(tabForm) : null}
          />
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors. (`wardrobe` is undefined until Task 16, so `hatOnly(undefined)` → `{}` and the tab is unchanged.)

---

## Phase 5 — State, the Dress Pip sheet and the room strip

Exposes the wardrobe from the context, adds the write calls and the hook, builds the sheet and wires the Wardrobe button and the bubble line. The build stays green after each task. The feature is reachable only after Task 20 wires it into `PetView`, and the manual check comes last.

### Task 16: `petService` wardrobe calls and `PetContext.wardrobe` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/services/petService.js`
- Modify: `foodbytes-app/client/src/contexts/PetContext.jsx`

- [x] **Step 1: Add the three calls**

In `petService`, update the `getPet` JSDoc return to include `growth.peakForm: number` and `wardrobe: WardrobeDTO`, then add after `getAwards`:

```js
  /**
   * MPP-32: your own wardrobe writes. WardrobeDTO = { items: [{ id, slot, owned, unseen }],
   * outfit: { HAT?: string, GLASSES?: string, … } }. Each resolves the whole updated wardrobe.
   *
   * @param {string} slot - 'HAT' … 'SHOES'
   * @param {string|null} itemId - null empties the slot
   */
  async equipItem(slot, itemId) {
    const response = await api.put('/pet/wardrobe/outfit', { slot, itemId })
    return response.data
  },

  /** Empties every slot. */
  async undress() {
    const response = await api.delete('/pet/wardrobe/outfit')
    return response.data
  },

  /** Marks the slot's new items seen (its tab was opened). */
  async markWardrobeSeen(slot) {
    const response = await api.post('/pet/wardrobe/seen', { slot })
    return response.data
  }
```

- [x] **Step 2: Expose `wardrobe` and `setWardrobe` from `PetContext`**

After `renamePet`:

```jsx
  // MPP-32: swap in a wardrobe (optimistic copy or a write's response). A GET still in flight
  // would carry the old outfit; cancel it so it can't land after the write (as renamePet does).
  const setWardrobe = useCallback((wardrobe) => {
    petControllerRef.current?.abort()
    setPetLoading(false)
    setPet(current => (current ? { ...current, wardrobe } : current))
  }, [])
```

In `value`, after `growth`:

```jsx
    wardrobe: pet?.wardrobe ?? null,
```

and after `renamePet`:

```jsx
    renamePet,
    setWardrobe
```

Add to the provider's doc comment: ``MPP-32: `wardrobe` (WardrobeDTO: items, outfit) — your own clothes, straight from the pet payload; `setWardrobe` replaces it after a dressing write.``

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 17: `wardrobeAnnouncedStore` and `usePipWardrobe` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/wardrobeAnnouncedStore.js`
- Create: `foodbytes-app/client/src/hooks/usePipWardrobe.js`

- [x] **Step 1: Create the store (mirrors `awardSeenStore`)**

```js
import { WARDROBE_ANNOUNCED_STORAGE_KEY } from '../constants/pipWardrobe.js'

// userId → Set of item ids Pip has already announced here. Survives route changes but not a
// reload, so with storage unavailable an unlock is announced at most once per page load.
const memory = new Map()

const keyFor = (userId) => `${WARDROBE_ANNOUNCED_STORAGE_KEY}.${userId}`

/** MPP-32 AC 6: the ids this browser has already announced for this user. Memory wins. */
export function readAnnounced(userId) {
  if (memory.has(userId)) return memory.get(userId)
  try {
    const parsed = JSON.parse(localStorage.getItem(keyFor(userId)) ?? '[]')
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    // Storage blocked or corrupt JSON: nothing announced yet.
    return new Set()
  }
}

/** Records the ids in memory always, and in localStorage when it is available. */
export function writeAnnounced(userId, ids) {
  const set = new Set(ids)
  memory.set(userId, set)
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify([...set]))
  } catch {
    // Storage disabled or full: the memory copy still stops a repeat this load.
  }
}
```

- [x] **Step 2: Create the hook**

```js
import { useEffect, useRef, useState } from 'react'
import petService from '../services/petService'
import { AWARD_BUBBLE_MS } from '../constants/petAwards'
import { WARDROBE_SAVE_ERROR } from '../constants/pipWardrobe'
import { readAnnounced, writeAnnounced } from '../utils/wardrobeAnnouncedStore'
import {
  firstNewSlot, newItemIds, slotHasNew, toggleTarget, wardrobeAnnouncement, withSlot, withSlotSeen
} from '../utils/pipWardrobe'

/**
 * MPP-32: dressing Pip on /pet. Every write is optimistic: the wardrobe changes at once
 * (setWardrobe), the server's WardrobeDTO replaces it when the request returns, and a failure
 * rolls back to the last server copy. Only the newest write's outcome is applied, so a slow
 * earlier response can't undo a later tap. Writes are never aborted.
 *
 * AC 6: new unlocks not yet announced in this browser queue one "🎉 New outfit" line, shown for
 * AWARD_BUBBLE_MS. The ids are recorded before the line shows, so a reload never repeats it.
 *
 * @param {{ userId: number|null, wardrobe: Object|null, setWardrobe: (w: Object) => void }} input
 * @returns {{ announcement: string|null, hasNew: boolean, firstNewSlot: string|null,
 *   equip: (slot: string, itemId: string|null) => void, undress: () => void,
 *   markSeen: (slot: string) => void, error: string|null }}
 */
export function usePipWardrobe({ userId, wardrobe, setWardrobe }) {
  const [announcement, setAnnouncement] = useState(null)
  const [error, setError] = useState(null)
  const seqRef = useRef(0)
  const pendingRef = useRef(0)
  const serverRef = useRef(wardrobe)

  // Between writes, the context's copy is the server's.
  useEffect(() => {
    if (pendingRef.current === 0) serverRef.current = wardrobe
  }, [wardrobe])

  useEffect(() => {
    if (userId == null || !wardrobe) return
    const announced = readAnnounced(userId)
    const fresh = newItemIds(wardrobe).filter(id => !announced.has(id))
    if (fresh.length === 0) return
    writeAnnounced(userId, [...announced, ...fresh])
    setAnnouncement(wardrobeAnnouncement(fresh))
  }, [userId, wardrobe])

  useEffect(() => {
    if (!announcement) return undefined
    const timerId = setTimeout(() => setAnnouncement(null), AWARD_BUBBLE_MS)
    return () => clearTimeout(timerId)
  }, [announcement])

  const save = (optimistic, request, { quiet = false } = {}) => {
    const seq = ++seqRef.current
    pendingRef.current += 1
    setError(null)
    setWardrobe(optimistic)
    request()
      .then(saved => {
        serverRef.current = saved
        if (seq === seqRef.current) setWardrobe(saved)
      })
      .catch(err => {
        if (seq !== seqRef.current) return
        setWardrobe(serverRef.current)
        if (!quiet) setError(err.response?.data?.error || WARDROBE_SAVE_ERROR)
      })
      .finally(() => {
        pendingRef.current -= 1
      })
  }

  const equip = (slot, itemId) => {
    const target = toggleTarget(wardrobe.outfit, slot, itemId)
    save(withSlot(wardrobe, slot, target), () => petService.equipItem(slot, target))
  }

  const undress = () => save({ ...wardrobe, outfit: {} }, () => petService.undress())

  // A failed "seen" just keeps the badge; it is not worth an error note.
  const markSeen = (slot) => {
    if (!wardrobe || !slotHasNew(wardrobe, slot)) return
    save(withSlotSeen(wardrobe, slot), () => petService.markWardrobeSeen(slot), { quiet: true })
  }

  return {
    announcement,
    hasNew: newItemIds(wardrobe).length > 0,
    firstNewSlot: firstNewSlot(wardrobe),
    equip,
    undress,
    markSeen,
    error
  }
}

export default usePipWardrobe
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 18: The Dress Pip sheet — `WardrobeView` and its parts ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/WardrobeSlotTabs.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/WardrobeItemGrid.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/WardrobeLineup.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/WardrobeView.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/WardrobeView.css`

- [x] **Step 1: Slot tabs**

```jsx
import { WARDROBE_SLOTS, WARDROBE_TABS_LABEL } from '../../../constants/pipWardrobe'
import { slotHasNew } from '../../../utils/pipWardrobe'

/** MPP-32 AC 4: the seven slots, scrolling sideways; green dot = worn, red dot = something new. */
function WardrobeSlotTabs({ wardrobe, selected, onSelect }) {
  return (
    <div className="pip-wardrobe-tabs" role="tablist" aria-label={WARDROBE_TABS_LABEL}>
      {WARDROBE_SLOTS.map(({ key, label }) => {
        const worn = Boolean(wardrobe.outfit?.[key])
        const fresh = slotHasNew(wardrobe, key)
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={key === selected}
            aria-label={[label, worn && 'worn', fresh && 'new'].filter(Boolean).join(', ')}
            className={key === selected ? 'pip-wardrobe-tab is-selected' : 'pip-wardrobe-tab'}
            onClick={() => onSelect(key)}
          >
            {worn && <span className="pip-wardrobe-tab-worn" aria-hidden="true" />}
            {label}
            {fresh && <span className="pip-wardrobe-tab-new" aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}

export default WardrobeSlotTabs
```

- [x] **Step 2: Item grid**

```jsx
import { PET_MOODS } from '../../../constants/pet'
import { WARDROBE_ITEMS, WARDROBE_NEW_TAG, WARDROBE_NONE_LABEL } from '../../../constants/pipWardrobe'
import { itemsInSlot } from '../../../utils/pipWardrobe'
import PipHerb from '../herb/PipHerb'
import { slotCropViewBox } from '../herb/wardrobeLayers'

/**
 * MPP-32 AC 4: "None" then the slot's items, 3 per row. Each card is Pip's CURRENT form wearing
 * that item, cropped to the part of him it changes. Locked cards stay tappable so they can
 * explain their unlock (onTap decides).
 */
function WardrobeItemGrid({ wardrobe, slot, form, onTap }) {
  const viewBox = slotCropViewBox(slot, form)
  const worn = wardrobe.outfit?.[slot] ?? null
  return (
    <ul className="pip-wardrobe-grid">
      <li>
        <ItemCard label={WARDROBE_NONE_LABEL} pressed={!worn} viewBox={viewBox} form={form} outfit={null} onClick={() => onTap(null)} />
      </li>
      {itemsInSlot(wardrobe, slot).map(item => (
        <li key={item.id}>
          <ItemCard
            label={WARDROBE_ITEMS[item.id].label}
            pressed={worn === item.id}
            locked={!item.owned}
            fresh={item.owned && item.unseen}
            viewBox={viewBox}
            form={form}
            outfit={{ [slot]: item.id }}
            onClick={() => onTap(item)}
          />
        </li>
      ))}
    </ul>
  )
}

function ItemCard({ label, pressed, locked = false, fresh = false, viewBox, form, outfit, onClick }) {
  const className = ['pip-wardrobe-item', pressed && 'is-worn', locked && 'is-locked'].filter(Boolean).join(' ')
  const name = [label, locked && 'locked', fresh && 'new'].filter(Boolean).join(', ')
  return (
    <button type="button" className={className} aria-pressed={locked ? undefined : pressed} aria-label={name} onClick={onClick}>
      <PipHerb form={form} mood={PET_MOODS.CONTENT} variant="crop" viewBox={viewBox} outfit={outfit} still />
      {locked && <span className="pip-wardrobe-lock" aria-hidden="true">🔒</span>}
      {fresh && <span className="pip-wardrobe-new" aria-hidden="true">{WARDROBE_NEW_TAG}</span>}
      <span className="pip-wardrobe-item-label" aria-hidden="true">{label}</span>
    </button>
  )
}

export default WardrobeItemGrid
```

- [x] **Step 3: Evolution lineup (collapsed by default, rendered only when open)**

```jsx
import { useState } from 'react'
import { PET_MOODS } from '../../../constants/pet'
import { PIP_FORMS, PIP_FORM_NAMES } from '../../../constants/pipGrowth'
import { WARDROBE_LINEUP_TITLE, WARDROBE_UNREACHED_LABEL } from '../../../constants/pipWardrobe'
import PipHerb from '../herb/PipHerb'

/**
 * MPP-32 AC 4: "Same outfit, every evolution" — the outfit on all five forms. Forms above the
 * highest one reached (peakForm) are silhouettes; a form reached and then lost shows normally.
 */
function WardrobeLineup({ outfit, currentForm, peakForm }) {
  const [open, setOpen] = useState(false)
  return (
    <details className="pip-wardrobe-lineup" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{WARDROBE_LINEUP_TITLE}</summary>
      {open && (
        <ol className="pip-wardrobe-forms">
          {Object.values(PIP_FORMS).map(form => {
            const reached = form <= peakForm
            const className = ['pip-wardrobe-form', !reached && 'is-unreached', form === currentForm && 'is-current'].filter(Boolean).join(' ')
            return (
              <li key={form} className={className}>
                <PipHerb form={form} mood={PET_MOODS.CONTENT} variant="crop" outfit={outfit} still />
                <span>{reached ? PIP_FORM_NAMES[form] : WARDROBE_UNREACHED_LABEL}</span>
              </li>
            )
          })}
        </ol>
      )}
    </details>
  )
}

export default WardrobeLineup
```

(Note: `variant="crop"` with no `viewBox` falls back to the form's `miniViewBox`, the tight crop, so each lineup form fills its cell.)

- [x] **Step 4: The sheet**

```jsx
import { useEffect, useState } from 'react'
import { PIP_FORM_NAMES } from '../../../constants/pipGrowth'
import {
  WARDROBE_CLOSE_LABEL, WARDROBE_ITEMS, WARDROBE_LOCK_PREFIX, WARDROBE_SLOTS, WARDROBE_TITLE, WARDROBE_UNDRESS_LABEL
} from '../../../constants/pipWardrobe'
import useBodyScrollLock from '../../../hooks/useBodyScrollLock'
import { wornCount } from '../../../utils/pipWardrobe'
import PipHerb from '../herb/PipHerb'
import WardrobeItemGrid from './WardrobeItemGrid'
import WardrobeLineup from './WardrobeLineup'
import WardrobeSlotTabs from './WardrobeSlotTabs'
import './WardrobeView.css'

/**
 * MPP-32 AC 4: "Dress Pip" — a modal sheet that slides up over the whole screen on a phone (the
 * room card is too short to hold it). Header (✕, title, Undress), live preview, slot tabs, item
 * grid with the locked-item note, and the collapsed evolution lineup. Focus, Escape and the Tab
 * trap come from useRoomOverlay (the panel's first button, ✕, takes focus). Opens on the first
 * slot with something new; opening a tab marks its new items seen. Every tap saves (usePipWardrobe).
 *
 * @param {{ mood: string, herb: { form: number, wilted: boolean }, wardrobe: Object, titleId: string, panelRef: object, onClose: () => void }} props
 *   wardrobe = { data: WardrobeDTO, peakForm, firstNewSlot, equip, undress, markSeen, error }
 */
function WardrobeView({ mood, herb, wardrobe, titleId, panelRef, onClose }) {
  const [slot, setSlot] = useState(() => wardrobe.firstNewSlot ?? WARDROBE_SLOTS[0].key)
  const [lockedId, setLockedId] = useState(null)
  const outfit = wardrobe.data.outfit ?? {}
  useBodyScrollLock(true)

  // Opening a tab (including the first) is what clears its NEW tags and, in time, the badge.
  useEffect(() => {
    wardrobe.markSeen(slot)
  }, [slot]) // eslint-disable-line react-hooks/exhaustive-deps -- run per tab opened, not per render

  const chooseSlot = (key) => {
    setSlot(key)
    setLockedId(null)
  }

  const tapItem = (item) => {
    if (item && !item.owned) {
      setLockedId(item.id)
      return
    }
    setLockedId(null)
    wardrobe.equip(slot, item?.id ?? null)
  }

  return (
    <div ref={panelRef} className="pip-wardrobe" role="dialog" aria-modal="true" tabIndex={-1} aria-labelledby={titleId}>
      <div className="pip-wardrobe-head">
        <button type="button" className="pip-wardrobe-icon-btn" aria-label={WARDROBE_CLOSE_LABEL} onClick={onClose}>✕</button>
        <h3 id={titleId}>{WARDROBE_TITLE}</h3>
        <button type="button" className="pip-wardrobe-text-btn" onClick={wardrobe.undress} disabled={wornCount(outfit) === 0}>
          {WARDROBE_UNDRESS_LABEL}
        </button>
      </div>
      <div className="pip-wardrobe-preview">
        <PipHerb form={herb.form} mood={mood} wilted={herb.wilted} outfit={outfit} />
        <p className="pip-wardrobe-caption">
          {PIP_FORM_NAMES[herb.form]} · wearing {wornCount(outfit)} of {WARDROBE_SLOTS.length}
        </p>
      </div>
      {wardrobe.error && <p className="pip-wardrobe-error" role="alert">{wardrobe.error}</p>}
      <WardrobeSlotTabs wardrobe={wardrobe.data} selected={slot} onSelect={chooseSlot} />
      <div className="pip-wardrobe-body">
        <WardrobeItemGrid wardrobe={wardrobe.data} slot={slot} form={herb.form} onTap={tapItem} />
        {lockedId && (
          <p className="pip-wardrobe-lock-note" role="status">
            <b>🔒 {WARDROBE_ITEMS[lockedId].label}</b>
            {WARDROBE_LOCK_PREFIX} {WARDROBE_ITEMS[lockedId].unlockHint}
          </p>
        )}
      </div>
      <WardrobeLineup outfit={outfit} currentForm={herb.form} peakForm={wardrobe.peakForm} />
    </div>
  )
}

export default WardrobeView
```

(There is no ESLint in this project. The `eslint-disable` comment is documentation of intent only; drop it if the reviewer prefers a plain comment.)

- [x] **Step 5: The sheet's CSS**

```css
/* MPP-32: the Dress Pip sheet (mpp-32-wardrobe-phone-mockup.html .sheet …). Full screen on a
   phone, a centred 480 px column on wider screens; scrolls inside, never the page. */

.pip-wardrobe {
  position: fixed;
  inset: 0;
  z-index: 200; /* above the fixed footer (z-index 100) */
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: #fff;
  color: #2c3e50;
  box-shadow: 0 0 40px rgba(30, 40, 20, 0.25);
  animation: pip-wardrobe-up 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.pip-wardrobe:focus { outline: none; }

@keyframes pip-wardrobe-up {
  from { transform: translateY(100%); }
  to { transform: none; }
}

.pip-wardrobe-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid #e3e9dc;
}

.pip-wardrobe-head h3 {
  flex: 1;
  margin: 0;
  font-size: 1.05rem;
  color: #4a3f80;
  text-align: center;
}

.pip-wardrobe-icon-btn,
.pip-wardrobe-text-btn,
.pip-wardrobe-tab,
.pip-wardrobe-item,
.pip-wardrobe-lineup summary {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}

.pip-wardrobe-icon-btn {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: none;
  font-size: 1.3rem;
}

.pip-wardrobe-text-btn {
  min-width: 44px;
  min-height: 44px;
  padding: 0 6px;
  border: 0;
  background: none;
  color: #4a3f80;
  font-size: 0.85rem;
  font-weight: 600;
}

.pip-wardrobe-text-btn:disabled { color: #9aa0a6; cursor: default; }

.pip-wardrobe-preview {
  flex: none;
  height: 228px;
  position: relative;
  background: radial-gradient(circle at 50% 70%, #f6fbef, #e3efd6);
}

.pip-wardrobe-preview .pip-herb {
  display: block;
  width: 100%;
  height: calc(100% - 24px);
}

.pip-wardrobe-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 6px;
  margin: 0;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #2f4a22;
}

.pip-wardrobe-error {
  margin: 8px 12px 0;
  padding: 8px 12px;
  border-radius: 10px;
  background: #fdecea;
  color: #8a1c12;
  font-size: 0.84rem;
}

.pip-wardrobe-tabs {
  flex: none;
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid #e3e9dc;
}

.pip-wardrobe-tabs::-webkit-scrollbar { display: none; }

.pip-wardrobe-tab {
  position: relative;
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid #e3e9dc;
  border-radius: 999px;
  background: #fff;
  color: inherit;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 600;
}

.pip-wardrobe-tab.is-selected { background: #4a3f80; border-color: #4a3f80; color: #fff; }
.pip-wardrobe-tab-worn { width: 7px; height: 7px; border-radius: 50%; background: #5fae3e; }
.pip-wardrobe-tab.is-selected .pip-wardrobe-tab-worn { background: #c8eea2; }

.pip-wardrobe-tab-new {
  position: absolute;
  top: -3px;
  right: -2px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #e8574a;
  border: 2px solid #fff;
}

.pip-wardrobe-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 12px;
}

.pip-wardrobe-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pip-wardrobe-item {
  position: relative;
  width: 100%;
  min-height: 44px;
  padding: 4px 4px 8px;
  border: 2px solid #e3e9dc;
  border-radius: 14px;
  background: #fff;
  color: inherit;
  font: inherit;
  text-align: center;
}

.pip-wardrobe-item .pip-herb {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  background: #f6fbef;
}

.pip-wardrobe-item.is-worn { border-color: #4a3f80; box-shadow: 0 0 0 2px rgba(74, 63, 128, 0.15); }

.pip-wardrobe-item.is-worn::before {
  content: "✓";
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4a3f80;
  color: #fff;
  font-size: 0.72rem;
}

.pip-wardrobe-item.is-locked .pip-herb { filter: grayscale(1) opacity(0.45); }
.pip-wardrobe-item.is-locked .pip-wardrobe-item-label { color: #6c757d; }

.pip-wardrobe-item-label {
  display: block;
  margin-top: 4px;
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1.2;
}

.pip-wardrobe-lock {
  position: absolute;
  top: 34%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.3rem;
}

.pip-wardrobe-new {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #e8574a;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.pip-wardrobe-lock-note {
  margin: 12px 0 0;
  padding: 9px 12px;
  border: 1px solid #f0d78a;
  border-radius: 12px;
  background: #fff7e0;
  font-size: 0.84rem;
}

.pip-wardrobe-lock-note b { display: block; }

.pip-wardrobe-lineup {
  flex: none;
  border-top: 1px solid #e3e9dc;
  background: #fbfdf8;
}

.pip-wardrobe-lineup summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 46px;
  padding: 0 16px;
  list-style: none;
  font-size: 0.86rem;
  font-weight: 600;
  color: #2f4a22;
}

.pip-wardrobe-lineup summary::-webkit-details-marker { display: none; }
.pip-wardrobe-lineup summary::after { content: "▴"; color: #6c757d; }
.pip-wardrobe-lineup[open] summary::after { content: "▾"; }

.pip-wardrobe-forms {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 4px;
  margin: 0;
  padding: 0 8px 10px;
  list-style: none;
}

.pip-wardrobe-form { text-align: center; font-size: 0.62rem; color: #6c757d; }
.pip-wardrobe-form.is-current { color: #2f4a22; font-weight: 700; }
.pip-wardrobe-form .pip-herb { display: block; width: 100%; height: auto; aspect-ratio: 1; }
.pip-wardrobe-form.is-unreached .pip-herb { filter: brightness(0) opacity(0.18); }

.pip-wardrobe-icon-btn:focus-visible,
.pip-wardrobe-text-btn:focus-visible,
.pip-wardrobe-tab:focus-visible,
.pip-wardrobe-item:focus-visible,
.pip-wardrobe-lineup summary:focus-visible {
  outline: 3px solid #ffd34d;
  outline-offset: 2px;
}

.pip-wardrobe-item:active,
.pip-wardrobe-tab:active { filter: brightness(0.94); }

@media (hover: hover) {
  .pip-wardrobe-item:hover,
  .pip-wardrobe-tab:hover { filter: brightness(0.97); }
}

@media (prefers-reduced-motion: reduce) {
  .pip-wardrobe { animation: none; }
}
```

- [x] **Step 6: Build and measure**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

Run: `cd foodbytes-app\client\src\components\pet\room; foreach ($f in 'WardrobeView.jsx','WardrobeItemGrid.jsx','WardrobeSlotTabs.jsx','WardrobeLineup.jsx') { "$f " + (Get-Content $f | Measure-Object -Line).Lines }`
Expected: every file under 200 lines.

### Task 19: The Wardrobe button strip and the overlay in `PetRoom` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/WardrobeButton.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css`

- [x] **Step 1: Create the button**

```jsx
import { WARDROBE_BUTTON_LABEL, WARDROBE_BUTTON_NEW_LABEL } from '../../../constants/pipWardrobe'
import './CheckInActions.css'

/**
 * MPP-32 AC 4: the 👕 Wardrobe pill in the strip under the room (the .pip-checkin-btn look), with
 * a red "!" while something unlocked is unseen. The strip is a centred row, so MPP-26's Shop
 * button can sit beside it with no restyle.
 */
function WardrobeButton({ hasNew, buttonRef, onOpen, behind }) {
  return (
    <div className="pip-room-actions" {...behind}>
      <button
        ref={buttonRef}
        type="button"
        className="pip-checkin-btn pip-room-action"
        aria-haspopup="dialog"
        aria-label={hasNew ? WARDROBE_BUTTON_NEW_LABEL : WARDROBE_BUTTON_LABEL}
        onClick={onOpen}
      >
        <span aria-hidden="true">👕</span> {WARDROBE_BUTTON_LABEL}
        {hasNew && <span className="pip-room-action-badge" aria-hidden="true">!</span>}
      </button>
    </div>
  )
}

export default WardrobeButton
```

- [x] **Step 2: Wire the strip and the overlay into `PetRoom`**

Add imports:

```jsx
import WardrobeButton from './WardrobeButton'
import WardrobeView from './WardrobeView'
```

Add `wardrobe = null` to the props:

```jsx
function PetRoom({ name, mood, bubble, bubbleActions = null, position = PIP_POSITIONS.RUG, levels = DEFAULT_ROOM_LEVELS, serving = null, fridge = null, cabinet = null, herb, levelBar = null, wardrobe = null }) {
```

After `cabinetOverlay`:

```jsx
  const wardrobeOverlay = useRoomOverlay()
```

After `cabinetTitleId`:

```jsx
  const wardrobeTitleId = `pip-wardrobe-title-${overlayId}`
```

Replace the `behind` line:

```jsx
  // MPP-19 / MPP-23 / MPP-32: the room behind an open overlay is out of the tab order and the a11y tree.
  const anyOpen = fridgeOverlay.isOpen || cabinetOverlay.isOpen || wardrobeOverlay.isOpen
  const behind = anyOpen ? { inert: '', 'aria-hidden': true } : {}
```

After the level bar line, add the strip; after the cabinet overlay, add the sheet:

```jsx
      {levelBar && <PipLevelBar label={levelBar.label} pct={levelBar.pct} phase={levelBar.phase} />}
      {wardrobe && (
        <WardrobeButton hasNew={wardrobe.hasNew} buttonRef={wardrobeOverlay.triggerRef} onOpen={wardrobeOverlay.open} behind={behind} />
      )}
      …
      {wardrobe && wardrobeOverlay.isOpen && (
        <WardrobeView mood={mood} herb={herb} wardrobe={wardrobe} titleId={wardrobeTitleId} panelRef={wardrobeOverlay.panelRef} onClose={wardrobeOverlay.close} />
      )}
```

Append to the component comment: ``MPP-32: `wardrobe` ({ data, hasNew, firstNewSlot, peakForm, equip, undress, markSeen, error }) adds the Wardrobe strip under the level bar and the Dress Pip sheet.``

- [x] **Step 3: Strip and badge CSS in `PetRoom.css`**

```css
/* MPP-32 AC 4: the strip under the room — the Wardrobe pill now, MPP-26's Shop beside it later. */
.pip-room-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 16px 10px;
}

.pip-room-action {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.pip-room-action:active { filter: brightness(0.92); }

.pip-room-action-badge {
  position: absolute;
  top: -4px;
  right: -3px;
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #e8574a;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  animation: pip-badge-pulse 1.4s ease-in-out infinite;
}

@keyframes pip-badge-pulse {
  50% { transform: scale(1.25); }
}

@media (prefers-reduced-motion: reduce) {
  .pip-room-action-badge { animation: none; }
}
```

- [x] **Step 4: Build and measure**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

Run: `(Get-Content foodbytes-app\client\src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines`
Expected: under 230 (it was 196). Over 400 is blocking.

### Task 20: Wire the wardrobe through `PetView` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx`

- [x] **Step 1: Call the hook and pass everything down**

Add the import:

```jsx
import usePipWardrobe from '../../hooks/usePipWardrobe'
```

Read `setWardrobe` from the context:

```jsx
  const { pet, mood, moodInfo, position, fridge, todayISO, error, retry, renamePet, setWardrobe } = usePet()
```

After `const growth = usePipGrowth(…)`:

```jsx
  const dressing = usePipWardrobe({ userId: petUserId, wardrobe: pet?.wardrobe ?? null, setWardrobe })
```

Replace the award line and the herb line, and add the wardrobe prop:

```jsx
  // MPP-32 AC 6: a new outfit speaks after a new award (cook > growth > check-in > award > outfit > fridge-low > mood).
  const award = serving || growthLine ? null : (awards.announcement ?? dressing.announcement)
```

```jsx
  const herb = { form: growth.displayForm, wilted: isWilted(pet.growth), phase: growth.phase, outfit: pet.wardrobe?.outfit ?? null }
  const wardrobe = pet.wardrobe
    ? { ...dressing, data: pet.wardrobe, peakForm: pet.growth?.peakForm ?? growth.displayForm }
    : null
```

```jsx
        levelBar={levelBar}
        wardrobe={wardrobe}
```

Add to the component comment: `MPP-32: Pip's wardrobe — the outfit on his figure, the Wardrobe strip + Dress Pip sheet, and the "🎉 New outfit" line (usePipWardrobe).`

- [x] **Step 2: Build and run every client check**

Run: `cd foodbytes-app\client; npm run build; npm run check:wardrobe; npm run check:growth; npm run check:room; npm run check:pet`
Expected: `built in <n>s`, then `wardrobe checks passed`, and every other check script's own pass line, with no assertion errors.

### Task 21: Manual check on `/pet` and the footer — pending: developer play-test at Ready for Test

- Skill: none — manual browser check by the developer (no frontend test runner exists)

**Files:**
- (none — observation only)

- [ ] **Step 1: Start the stack**

Run (developer, PowerShell, repo root): the "Running the backend locally with Google login" block from `CLAUDE.md`, then `cd foodbytes-app\client; npm run dev`.
Expected: backend `Started FoodbytesApiApplication`; Vite on `http://localhost:5173`.

- [ ] **Step 2: Walk the flow at 375 px width (DevTools device toolbar) and at 1280 px**

Expected, in order:
1. `/pet` loads. Pip's bubble says "🎉 New outfit: Beanie! (+1 more)" on the first visit after the migration. Under the level bar there is a **👕 Wardrobe** pill with a red **!**, and its accessible name reads "Wardrobe, new outfit waiting".
2. Tap Wardrobe. "Dress Pip" slides up and covers the screen, including the footer, and focus is on ✕. It opens on the **Hat** tab, which held the new beanie. The tab's red dot and the beanie's NEW tag clear. Once Pants is also opened, the badge on the pill is gone after closing.
3. Tap Beanie. It appears on the preview at once, with a ✓ on the card, and survives a reload. Tap it again and it comes off. Tap "None" and the slot is empty.
4. Tap a locked item (e.g. Top hat). It is greyed with 🔒, and a note shows "🔒 Top hat — Unlock: Any 1-month streak". Nothing is equipped.
5. Equip one item per owned slot. Each card shows Pip's **current** form cropped to the head, eyes, torso or feet.
6. Open "Same outfit, every evolution". Five forms appear wearing the outfit, and forms above the highest reached are dark silhouettes labelled "???".
7. ✕ and Escape each close the sheet, and focus returns to the Wardrobe pill. The room behind can't be tabbed into while the sheet is open.
8. Undress empties every slot with no confirmation.
9. Back in the room, Pip wears the outfit on the rug, at the cooker after logging a meal, and in bed. Glasses disappear while he sleeps. The footer tab shows **only the hat**, not cut off.
10. With DevTools → Rendering → `prefers-reduced-motion: reduce`, the sheet appears without sliding and the badge doesn't pulse.
11. At 320 px there is no horizontal page scroll, and the slot tabs scroll sideways inside the sheet.

- [ ] **Step 3: Fit across forms (art sanity, final polish is MPP-29)**

Run (developer, read-only check of the current form): `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SELECT user_id, item_key, seen_at IS NULL AS unseen FROM pet_wardrobe_unlocks ORDER BY user_id, id LIMIT 40"`
Expected: your user has `beanie` and `jeans` rows (unseen = 0 after step 2), plus any item your awards/firsts already earned.

Expected visually in the lineup: hats sit on every head with the leaves or bloom poking through. Belts and pants stay inside the body outline, the scarf tail and belt buckle sit outside it, and shoes sit on the foot tips. Record anything off in `pr-description.md` for MPP-29 rather than redrawing here.

---

## Phase 6 — Final verification

No production changes beyond the version bump. These are sanity checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-32 is a **Story** → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-32: Pip's wardrobe — 20 clothes unlocked by awards, firsts and evolutions, a tap-to-save Dress Pip screen, and outfits that fit every herb form`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references ✓

- Skill: none — read-only audit

**Files:**
- (none)

- [x] **Step 1: No `dangerouslySetInnerHTML` or console logging was introduced by the wardrobe**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "dangerouslySetInnerHTML|console\.(log|debug)" | Where-Object { $_.Path -match "ardrobe|HerbOutfit|PipHerb" }`
Expected: zero hits.

- [x] **Step 2: No direct axios in the new components**

Run: `Get-ChildItem -Path foodbytes-app\client\src\components\pet -Recurse -Include *.jsx | Select-String -Pattern "axios|api\."`
Expected: zero hits.

- [x] **Step 3: No controller touches a repository**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\controller\PetWardrobeController.java -Pattern "Repository"`
Expected: zero hits.

### Task M.3: Run the full backend test suite ✓

- Skill: none — QA run

**Files:**
- (none)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors. The count rises by the new `WardrobePolicyTest`, `WardrobeServiceTest`, `PetWardrobeControllerTest` and the added `PetGrowthPolicyTest` / `PetServiceTest` cases.

### Task M.4: Production build and client checks ✓

- Skill: none — QA run

**Files:**
- (none)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [x] **Step 2: Every node check**

Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run check:growth; npm run check:room; npm run check:pet; npm run check:awards`
Expected: each prints its pass line; no assertion errors.

### Task M.5: Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-32-pip-wardrobe/pr-description.md`

- [x] **Step 1: Write `pr-description.md` in this plan folder for the developer to paste**

Include:
- A link to `plan.md` in this folder.
- A summary of the change, and the new version from Task M.1.
- The migration: `2026-10-14-mpp32-pet-wardrobe.sql` is applied locally (Task 2) and is row 6 of `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`. It must be applied to Railway, after rows 1–5, before the merged backend deploys.
- Verification results: the backend suite count, `check:wardrobe`, the build, and the manual check outcome from Task 21 (including any art notes for MPP-29).
- A one-line note for future contributors: a new clothing item is one `WardrobeCatalogue` line, plus a `WARDROBE_ITEMS` entry and one `wardrobeArt.js` drawing that reads anchors only. `check:wardrobe` and `WardrobePolicyTest` both pin the id list.
- A suggested commit subject: `MPP-32: Pip's wardrobe — unlockable clothes that fit every evolution`.

---

## Self-review

**Spec coverage:**
- Migration (two tables, applied locally, Railway row 6) — Tasks 1, 2.
- Entities, repositories — Tasks 3, 4.
- `PetGrowthDTO.peakForm` — Task 5.
- Catalogue (20 items, 7 slots), rules as data, pure policy — Task 6.
- Unlock sync (kept forever), equip / undress / seen service — Task 7.
- `PetDTO.wardrobe` on get + rename — Task 8.
- `/api/pet/wardrobe` endpoints — Task 9.
- Client catalogue labels/hints + pure helpers — Task 10.
- Anchor-only item geometry — Task 11; layer composition + crops — Task 12.
- AC 7 tests: client `wardrobe.check.mjs` (every slot × every form, anchor-only, layer order, survives forms + wilt) — Task 13; server `WardrobeServiceTest.outfit_survivesAnEvolutionAndAWilt_unchanged` and `sync_keepsItemsForever…` — Task 7.
- Outfit in the room and the hat-only footer (AC 5) — Tasks 14, 15.
- Context exposure + write calls — Task 16; optimistic hook + "🎉 New outfit" line (AC 6) — Task 17.
- Dress Pip sheet (AC 4: header, preview, tabs, grid, lock note, lineup, open on new slot, seen per slot) — Task 18.
- Wardrobe pill + badge strip, modal overlay, inert room — Task 19; PetView wiring + bubble priority — Task 20.
- Manual phone check — Task 21.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or a runnable command with its expected output.

**Type / name consistency:** `WardrobeSlot` names (`HAT`…`SHOES`) match the DB CHECK, `WARDROBE_SLOT` and the JSON `outfit` keys. Item ids are identical in `WardrobeCatalogue.ITEMS`, `WardrobePolicyTest`, `WARDROBE_ITEMS`, `DRAWN_ITEM_IDS` and `wardrobe.check.mjs` → `IDS`. `peakForm` appears in `PetGrowthDTO`, `PetGrowthPolicy.toDTO`, `WardrobeService.progress`, `PetView` and `WardrobeLineup`. The repository methods `insertIfAbsent`, `markSeen`, `existsByUserIdAndItemKey`, `upsert`, `deleteByUserIdAndSlot` and `deleteByUserId` are used identically in Tasks 4 and 7. On the client, `equipItem` / `undress` / `markWardrobeSeen` match between `petService` and `usePipWardrobe`. `dressLayers` / `slotCropViewBox` / `hatMiniViewBox` / `hatOnly` match across Tasks 12–15 and 18. `setWardrobe` matches between `PetContext` and `PetView`. The `wardrobe` prop shape `{ data, peakForm, hasNew, firstNewSlot, equip, undress, markSeen, error }` matches across Tasks 18–20. CSS classes match between the JSX and the CSS in Tasks 18–19.

**Phase boundary cleanliness:**
- Phase 1 ends with the tables applied and the entities compiling; nothing reads them yet.
- Phase 2 ends with the backend green and the pet payload only gaining fields, so the old client still works.
- Phase 3 adds pure modules nothing imports yet, with the build unchanged and `check:wardrobe` green.
- Phase 4 adds rendering that is a no-op without an outfit, with the build green.
- Phase 5 builds after each task and makes the feature reachable only in Task 20.
- Phase 6 changes nothing but the version.
