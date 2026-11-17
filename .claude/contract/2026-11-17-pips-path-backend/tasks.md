# Tasks: Pip's Path backend (Garden Path generator, solver, clear check, progress, sprinkles)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-17

**Goal:** Serve signed-in players freshly generated, solver-proven Garden Path maps at difficulty 1–10 in chapter order, replay their submitted paths server-side, keep per-person progress, and pay 5 sprinkles per clear up to 50 a Dublin day, behind a family registry that later chapters extend.

**Spec:** `plan.md` in this folder.

Paths below use `api/` = `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/` and `test/` = `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/`. Write them out in full when editing.

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-11-17-mpp49-pips-path-games.sql` — two tables + `GAME_CLEAR` in the sprinkles CHECK
- `api/service/PipGameException.java` — domain failure with a `Reason`
- `api/model/GameMode.java` — `CHAPTER`, `REFRESHER`, `ENDLESS`
- `api/service/game/GridMap.java` — parsed board
- `api/service/game/SolveResult.java` — solver output
- `api/service/game/GardenPathSolver.java` — counting solver + path checker
- `api/service/game/DifficultyBand.java` — one row of the band table
- `api/service/game/GardenPathBands.java` — the difficulty 1–10 table
- `api/service/game/GardenPathGenerator.java` — seeded generator
- `api/service/game/PuzzleFamily.java` — family interface
- `api/service/game/GardenPathFamily.java` — first family bean
- `api/service/game/PuzzleFamilyRegistry.java` — families ordered by chapter
- `api/service/game/FamilyProgress.java`, `api/service/game/Slot.java` — sequencer inputs and outputs
- `api/service/game/PipsPathSequencer.java` — next slot, current chapter, unlock rule
- `api/model/PetGameMap.java`, `api/model/PetGameProgress.java` — entities
- `api/repository/PetGameMapRepository.java`, `api/repository/PetGameProgressRepository.java`
- `api/dto/PipsPathMapRequest.java`, `PipsPathClearRequest.java`, `PipsPathMapDTO.java`, `PipsPathFamilyDTO.java`, `PipsPathSlotDTO.java`, `PipsPathStateDTO.java`, `PipsPathClearDTO.java`
- `api/service/PipsPathService.java`
- `api/controller/PipsPathController.java`
- Tests: `test/service/game/GridMapTest.java`, `GardenPathSolverTest.java`, `GardenPathBandsTest.java`, `GardenPathGeneratorTest.java`, `PuzzleFamilyRegistryTest.java`, `PipsPathSequencerTest.java`, `test/service/PipsPathServiceTest.java`, `test/controller/PipsPathControllerTest.java`
- `.claude/contract/2026-11-17-pips-path-backend/local-test.js` — browser-console script for the local Docker test
- `.claude/contract/2026-11-17-pips-path-backend/pr-description.md`

**Modified:**
- `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` — row 13; row 12 local-apply date
- `foodbytes-app/database/mpp15-railway-golive.sql` — regenerated
- `api/model/SprinkleSource.java` — `GAME_CLEAR`
- `api/service/SprinklePolicy.java` — `GAME_CLEAR`, `GAME_DAILY_CAP`, `gameClearAmount`, `dublinDayUtc`
- `test/service/SprinklePolicyTest.java` — cap + day-bounds tests
- `api/repository/PetSprinkleRepository.java` — `sumAmountByUserIdAndSourceTypeBetween`
- `api/dto/SprinkleRatesDTO.java` — `gameClear`, `gameDailyCap`
- `api/service/SprinkleHistoryService.java` — `rates()` fills them
- `test/service/SprinkleHistoryServiceTest.java` — only if it constructs `SprinkleRatesDTO` positionally
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — MINOR bump

**Deleted:** (none)

---

## Phase 1 — Schema (local-first)

Starts the work branch off `AI_Master`, then writes the idempotent migration, records it in the MPP-15 go-live list, and applies MPP-42 and then this file to the local `foodbytes-db`. No Java changes yet, so the build is untouched; new tables with no entities are invisible to Hibernate `validate`.

### Task 0: Create the work branch off `AI_Master` ✓

- Skill: none — git setup (developer, 2026-11-17: "do the work on a new branch off AI_Master")

**Files:**
- (none — branch only)

> Done by orchestrator 2026-11-17: developer chose to commit the mockup work on AI_Master first (51ba5ab), then branched.

- [x] **Step 1: Check the working tree**

Run: `git status --short`
Expected: you know what is uncommitted. On 2026-11-17 the mockup contract's files were still uncommitted on `AI_Master` (`CHANGELOG.md`, `client/package.json`, `pom.xml`, `mockup/README.md`, `mockup/pips-path.html`, and the two `.claude/contract/` folders). `git switch -c` carries uncommitted changes onto the new branch. **If anything other than this plan folder is uncommitted, stop and ask the developer** whether to commit it on `AI_Master` first or bring it along. Never stash, discard or commit it yourself.

- [x] **Step 2: Branch off an up-to-date `AI_Master`**

Run: `git switch AI_Master; git pull --ff-only origin AI_Master; git switch -c feature/MPP-49-pips-path-backend`
Expected: `Switched to a new branch 'feature/MPP-49-pips-path-backend'`. If `pull --ff-only` refuses because the local branch has diverged, stop and ask the developer. Do not merge or rebase.

Run: `git branch --show-current`
Expected: `feature/MPP-49-pips-path-backend`. Every later task runs on this branch. Nothing is pushed by this contract.

### Task 1: Write the migration and its go-live row ✓

- Skill: java-backend

**Files:**
- Create: `foodbytes-app/database/migrations/2026-11-17-mpp49-pips-path-games.sql`
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`
- Modify: `foodbytes-app/database/mpp15-railway-golive.sql` (generated)

- [x] **Step 1: Write the migration file**

```sql
-- MPP-49 (Pip's Path backend): issued game maps, per-person game progress, and the GAME_CLEAR
-- sprinkles source (5 per cleared map, capped at 50 a Europe/Dublin day in SprinklePolicy).
--
--   pet_game_maps      one row per issued map; the server replays a clear against `layout`,
--                      and its id is pet_sprinkles.source_id for GAME_CLEAR (pays once per map)
--   pet_game_progress  one row per (person, family): highest_cleared 0-10, refresher_through =
--                      highest chapter whose refresher of this family is cleared (0 = none)
--   chk_pet_sprinkles_source  re-declared as MPP-42's list + GAME_CLEAR
--
-- Lossless: two new tables (absent locally, 2026-11-17), and the CHECK only gains a value, so every
-- existing pet_sprinkles row passes (local: 4 rows, all MEAL_EATEN).
--
-- Idempotent (MPP-15 go-live file): CREATE TABLE IF NOT EXISTS; the CHECK is dropped only if
-- present and re-added. MUST run AFTER 2026-10-15-mpp42-sprinkles-shopping-sources.sql (go-live
-- row 12) - MPP-42 re-declares the CHECK without GAME_CLEAR. MUST be applied before the backend
-- that maps PetGameMap / PetGameProgress starts (Hibernate validate).
-- MPP-15 is local-first: applied to the local foodbytes-db now; row 13 of
-- .claude/contract/MPP-15-epic-breakdown/railway-migrations.md for Railway at merge time.

CREATE TABLE IF NOT EXISTS pet_game_maps (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  user_id     BIGINT        NOT NULL,
  family      VARCHAR(32)   NOT NULL,
  difficulty  INT           NOT NULL,
  mode        VARCHAR(16)   NOT NULL,
  chapter     INT           NULL,
  seed        BIGINT        NOT NULL,
  width       INT           NOT NULL,
  height      INT           NOT NULL,
  layout      VARCHAR(1024) NOT NULL,
  issued_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cleared_at  TIMESTAMP     NULL,
  PRIMARY KEY (id),
  KEY idx_pet_game_maps_user (user_id, issued_at),
  CONSTRAINT chk_pet_game_maps_difficulty CHECK (difficulty BETWEEN 1 AND 10),
  CONSTRAINT chk_pet_game_maps_mode CHECK (mode IN ('CHAPTER','REFRESHER','ENDLESS')),
  CONSTRAINT fk_pet_game_maps_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pet_game_progress (
  id                BIGINT      NOT NULL AUTO_INCREMENT,
  user_id           BIGINT      NOT NULL,
  family            VARCHAR(32) NOT NULL,
  highest_cleared   INT         NOT NULL DEFAULT 0,
  refresher_through INT         NOT NULL DEFAULT 0,
  updated_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pet_game_progress (user_id, family),
  CONSTRAINT chk_pet_game_progress_highest CHECK (highest_cleared BETWEEN 0 AND 10),
  CONSTRAINT fk_pet_game_progress_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET @has_chk := (SELECT COUNT(*) FROM information_schema.CHECK_CONSTRAINTS
                 WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'chk_pet_sprinkles_source');
SET @drop_chk := IF(@has_chk > 0, 'ALTER TABLE pet_sprinkles DROP CHECK chk_pet_sprinkles_source', 'DO 0');
PREPARE drop_chk FROM @drop_chk;
EXECUTE drop_chk;
DEALLOCATE PREPARE drop_chk;

ALTER TABLE pet_sprinkles ADD CONSTRAINT chk_pet_sprinkles_source CHECK (source_type IN
  ('MEAL_EATEN','MEAL_ON_TIME','FULL_WEEK','HOMEMADE_EXTRA','STATION_UPGRADE','DECOR_PURCHASE',
   'SHOPPING_LIST_GENERATED','SHOPPING_LIST_COMPLETED','GAME_CLEAR'));
```

- [x] **Step 2: Add go-live row 13**

Append under row 12 in `railway-migrations.md`:

```
| 13 | MPP-49 | foodbytes-app/database/migrations/2026-11-17-mpp49-pips-path-games.sql | — | — |
```

- [x] **Step 3: Regenerate the go-live file**

Run: `node foodbytes-app/database/build-golive.mjs`
Expected: it reports writing `foodbytes-app/database/mpp15-railway-golive.sql`, and the file now ends with this migration's content after MPP-42's.

Run: `node foodbytes-app/database/build-golive.mjs --check`
Expected: `Go-live OK`.

### Task 2: Apply MPP-42, then this migration, to the local DB ✓

- Skill: none — DBA operation against the local `foodbytes-db` (MPP-15 local-first; Railway gets the go-live file at merge)

**Files:**
- Modify: `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md` (Applied locally dates for rows 12 and 13)

- [x] **Step 1: Apply MPP-42 (outstanding locally)**

Run: `Get-Content foodbytes-app\database\migrations\2026-10-15-mpp42-sprinkles-shopping-sources.sql -Raw | docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes`
Expected: no error output beyond the password warning.

- [x] **Step 2: Apply this migration**

Run: `Get-Content foodbytes-app\database\migrations\2026-11-17-mpp49-pips-path-games.sql -Raw | docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes`
Expected: no error output beyond the password warning.

- [x] **Step 3: Verify the schema**

Run: `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SHOW COLUMNS FROM pet_game_maps; SHOW COLUMNS FROM pet_game_progress; SHOW COLUMNS FROM pet_sprinkles LIKE 'source_type'; SELECT CHECK_CLAUSE FROM information_schema.CHECK_CONSTRAINTS WHERE CONSTRAINT_SCHEMA='foodbytes' AND CONSTRAINT_NAME='chk_pet_sprinkles_source';"`
Expected: both tables with the columns above; `source_type varchar(32)`; the CHECK lists `SHOPPING_LIST_GENERATED`, `SHOPPING_LIST_COMPLETED` and `GAME_CLEAR`.

- [x] **Step 4: Prove idempotence**

Run Step 2's command a second time.
Expected: no error.

- [x] **Step 5: Record the local applies**

In `railway-migrations.md`, set "Applied locally" to `2026-11-17` (or today's date) for row 12 (MPP-42) and row 13 (MPP-49). Then run `node foodbytes-app/database/build-golive.mjs --check` → `Go-live OK`.

---

## Phase 2 — Pure game core

Adds the grid, solver, bands, generator, family registry and sequencer as pure Java under `service/game`, each with its tests. Nothing here touches JPA or HTTP, so the app still starts exactly as before; the boundary is a green `mvn -q test-compile` plus the new test classes passing.

### Task 3: `PipGameException` and `GridMap` ✓

- Skill: java-backend

**Files:**
- Create: `api/service/PipGameException.java`
- Create: `api/service/game/GridMap.java`
- Test: `test/service/game/GridMapTest.java`

- [x] **Step 1: Write the exception**

```java
package com.foodbytes.service;

/**
 * MPP-49: a Pip's Path request the caller's state does not allow, or a map that could not be made.
 * PipsPathController maps each Reason to a status and returns {error: message}.
 */
public class PipGameException extends RuntimeException {

    public enum Reason { UNKNOWN_FAMILY, BAD_DIFFICULTY, LOCKED, NOT_FOUND, INVALID_PATH, GENERATION_FAILED }

    private final Reason reason;

    public PipGameException(Reason reason, String message) {
        super(message);
        this.reason = reason;
    }

    public Reason getReason() {
        return reason;
    }
}
```

- [x] **Step 2: Write the failing `GridMapTest`**

Cases (JUnit 5 + AssertJ):
- `parse(List.of("S..", "...", "..."))` → `width 3`, `height 3`, `start 0`, `openCount 9`.
- `parse(List.of(".#..", "....", "..S.", "...."))` → `start 10`, `openCount 15`, `open()[1] == false`.
- `rows()` and `layout()` round-trip: `GridMap.fromLayout(m.layout(), m.width(), m.height()).rows()` equals the input rows; `layout()` of the 3×3 is `"S../.../..."`.
- `neighbours(0)` on the 3×3 → `[1, 3]` in any order; on `".#..",…` cell 0 → `[4]` only (1 is a rock).
- Rejections (`IllegalArgumentException`): no `S`; two `S`; ragged rows; a `x` character; 7 columns; empty list.

- [x] **Step 3: Run it red**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=GridMapTest`
Expected: compilation failure (`GridMap` missing).

- [x] **Step 4: Implement `GridMap`**

```java
package com.foodbytes.service.game;

import java.util.ArrayList;
import java.util.List;

/**
 * MPP-49: a walker board. Cells are indexed y * width + x; legend S = Pip's start, . = open, # = rock
 * (the mockup's pp-levels legend). Width is capped at MAX_COLS so tiles stay >= 44 px at 320 px.
 */
public record GridMap(int width, int height, boolean[] open, int start, int openCount) {

    public static final int MAX_COLS = 6;
    public static final char START = 'S', OPEN = '.', ROCK = '#';
    private static final String ROW_SEPARATOR = "/";

    public static GridMap parse(List<String> rows) {
        if (rows == null || rows.isEmpty()) throw new IllegalArgumentException("A map needs at least one row");
        int width = rows.get(0).length();
        if (width == 0 || width > MAX_COLS) throw new IllegalArgumentException("Map width must be 1-" + MAX_COLS);
        int height = rows.size();
        boolean[] open = new boolean[width * height];
        int start = -1, openCount = 0;
        for (int y = 0; y < height; y++) {
            String row = rows.get(y);
            if (row.length() != width) throw new IllegalArgumentException("Rows must be the same length");
            for (int x = 0; x < width; x++) {
                char c = row.charAt(x);
                int i = y * width + x;
                if (c == START) {
                    if (start >= 0) throw new IllegalArgumentException("A map has exactly one start");
                    start = i;
                } else if (c != OPEN && c != ROCK) {
                    throw new IllegalArgumentException("Unknown tile '" + c + "'");
                }
                open[i] = c != ROCK;
                if (open[i]) openCount++;
            }
        }
        if (start < 0) throw new IllegalArgumentException("A map has exactly one start");
        return new GridMap(width, height, open, start, openCount);
    }

    public static GridMap fromLayout(String layout, int width, int height) {
        GridMap map = parse(List.of(layout.split(ROW_SEPARATOR)));
        if (map.width() != width || map.height() != height) throw new IllegalArgumentException("Layout size mismatch");
        return map;
    }

    public List<String> rows() {
        List<String> rows = new ArrayList<>(height);
        for (int y = 0; y < height; y++) {
            StringBuilder row = new StringBuilder(width);
            for (int x = 0; x < width; x++) {
                int i = y * width + x;
                row.append(i == start ? START : open[i] ? OPEN : ROCK);
            }
            rows.add(row.toString());
        }
        return rows;
    }

    public String layout() {
        return String.join(ROW_SEPARATOR, rows());
    }

    public int cells() {
        return width * height;
    }

    /** Orthogonal open neighbours of cell i. */
    public int[] neighbours(int i) {
        int x = i % width, y = i / width;
        int[] out = new int[4];
        int n = 0;
        if (y > 0 && open[i - width]) out[n++] = i - width;
        if (y < height - 1 && open[i + width]) out[n++] = i + width;
        if (x > 0 && open[i - 1]) out[n++] = i - 1;
        if (x < width - 1 && open[i + 1]) out[n++] = i + 1;
        return java.util.Arrays.copyOf(out, n);
    }

    public boolean adjacent(int a, int b) {
        return Math.abs(a % width - b % width) + Math.abs(a / width - b / width) == 1;
    }
}
```

- [x] **Step 5: Run it green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=GridMapTest`
Expected: `BUILD SUCCESS`, all tests pass.

### Task 4: `GardenPathSolver` pinned to the 10 mockup fixtures ✓

- Skill: java-backend

**Files:**
- Create: `api/service/game/SolveResult.java`
- Create: `api/service/game/GardenPathSolver.java`
- Test: `test/service/game/GardenPathSolverTest.java`

- [x] **Step 1: Write the failing test**

Put the 10 mockup levels in the test as a `static final List<Fixture>` (`record Fixture(String id, int difficulty, long solutions, List<String> rows)`), copied verbatim from `plan.md` of `.claude/contract/2026-11-17-pips-path-mockup/` → Data shapes → Levels (`garden-01` … `garden-10`, counts 8, 12, 4, 9, 7, 1, 6, 1, 1, 4, difficulty = level number). Make the list package-visible so `GardenPathBandsTest` reuses it. Cases:
- `@ParameterizedTest` over fixtures: `countSolutions(GridMap.parse(rows), 1_000_000, 10_000_000)` → `count == solutions`, `budgetExceeded == false`, `first.length == openCount`.
- each fixture's `first` passes `isValidClear` (as a `List<Integer>`).
- `isValidClear` rejects, on `garden-01`: `null`; a path not starting at `start`; a path one short; a path that revisits; a diagonal step; a step onto a rock (use `garden-03`); a `null` element; an index `-1` and `9`.
- `countSolutions` with `limit 2` on `garden-02` returns `count 2` (stops early).
- `countSolutions` with `nodeBudget 5` on `garden-10` returns `budgetExceeded true`.

- [x] **Step 2: Run it red**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=GardenPathSolverTest`
Expected: compilation failure.

- [x] **Step 3: Implement**

```java
package com.foodbytes.service.game;

/** MPP-49: how many solutions a map has (capped at the caller's limit), and the first one found. */
public record SolveResult(long count, boolean budgetExceeded, int[] first) {}
```

```java
package com.foodbytes.service.game;

import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.List;

/**
 * MPP-49: Garden Path rules - start on S, step orthogonally onto open tiles, never revisit, visit
 * every open tile. Mirrors the mockup's pp-engine so client play and server replay agree.
 * The counting DFS prunes only dead branches (unvisited tiles cut off from the head, or more than one
 * forced end), so its counts are exact - GardenPathSolverTest pins them to the mockup fixtures.
 */
public final class GardenPathSolver {

    private GardenPathSolver() {
    }

    public static SolveResult countSolutions(GridMap map, long limit, long nodeBudget) {
        Search search = new Search(map, limit, nodeBudget);
        search.visited[map.start()] = true;
        search.path[0] = map.start();
        search.dfs(map.start(), 1);
        return new SolveResult(search.count, search.budgetExceeded, search.first);
    }

    public static boolean isValidClear(GridMap map, List<Integer> path) {
        if (path == null || path.size() != map.openCount()) return false;
        boolean[] seen = new boolean[map.cells()];
        Integer prev = null;
        for (Integer cell : path) {
            if (cell == null || cell < 0 || cell >= map.cells() || !map.open()[cell] || seen[cell]) return false;
            if (prev == null ? cell != map.start() : !map.adjacent(prev, cell)) return false;
            seen[cell] = true;
            prev = cell;
        }
        return true;
    }

    private static final class Search {
        private final GridMap map;
        private final long limit;
        private final long nodeBudget;
        private final boolean[] visited;
        private final int[] path;
        private long count;
        private long nodes;
        private boolean budgetExceeded;
        private int[] first;

        Search(GridMap map, long limit, long nodeBudget) {
            this.map = map;
            this.limit = limit;
            this.nodeBudget = nodeBudget;
            this.visited = new boolean[map.cells()];
            this.path = new int[map.openCount()];
        }

        void dfs(int head, int depth) {
            if (count >= limit || budgetExceeded) return;
            if (++nodes > nodeBudget) {
                budgetExceeded = true;
                return;
            }
            if (depth == map.openCount()) {
                if (first == null) first = Arrays.copyOf(path, depth);
                count++;
                return;
            }
            if (!viable(head, depth)) return;
            for (int next : map.neighbours(head)) {
                if (visited[next]) continue;
                visited[next] = true;
                path[depth] = next;
                dfs(next, depth + 1);
                visited[next] = false;
            }
        }

        /** Every unvisited tile still reachable from the head, and at most one forced end. */
        private boolean viable(int head, int depth) {
            int forcedEnds = 0;
            for (int i = 0; i < map.cells(); i++) {
                if (!map.open()[i] || visited[i]) continue;
                int free = 0;
                for (int n : map.neighbours(i)) if (!visited[n] || n == head) free++;
                if (free == 0) return false;
                if (free == 1 && ++forcedEnds > 1) return false;
            }
            boolean[] reached = new boolean[map.cells()];
            ArrayDeque<Integer> queue = new ArrayDeque<>();
            queue.add(head);
            reached[head] = true;
            int found = 0;
            while (!queue.isEmpty()) {
                for (int n : map.neighbours(queue.poll())) {
                    if (visited[n] || reached[n]) continue;
                    reached[n] = true;
                    found++;
                    queue.add(n);
                }
            }
            return found == map.openCount() - depth;
        }
    }
}
```

- [x] **Step 4: Run it green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=GardenPathSolverTest`
Expected: `BUILD SUCCESS`; all 10 fixture counts match. If a count differs, the fixture text was mis-copied or the pruning is unsound — fix the code, never the recorded count.

### Task 5: Difficulty bands, calibrated against the fixtures ✓

- Skill: java-backend

**Files:**
- Create: `api/service/game/DifficultyBand.java`
- Create: `api/service/game/GardenPathBands.java`
- Test: `test/service/game/GardenPathBandsTest.java`

- [x] **Step 1: Write the failing test**

Cases:
- `of(d)` exists for `d` 1..10; `of(0)` and `of(11)` throw `IllegalArgumentException`.
- every band: `width <= GridMap.MAX_COLS`, `rocks < width * height`, `minSolutions >= 1`, `minSolutions <= maxSolutions`.
- boards never shrink: `width * height` is non-decreasing from 1 to 10.
- **calibration:** for each fixture from `GardenPathSolverTest`, `of(fixture.difficulty())` has the fixture's width, height and rock count, and `accepts(fixture.solutions())`.
- `countLimit()`: `of(1)` (unbounded) → `minSolutions`; `of(9)` → `maxSolutions + 1`.

- [x] **Step 2: Run it red**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=GardenPathBandsTest`
Expected: compilation failure.

- [x] **Step 3: Implement**

```java
package com.foodbytes.service.game;

/** MPP-49: what one difficulty means - board size, rock count, allowed solution count. */
public record DifficultyBand(int difficulty, int width, int height, int rocks, int minSolutions, int maxSolutions) {

    public static final int UNBOUNDED = Integer.MAX_VALUE;

    /** How far the solver needs to count to decide accepts(). */
    public long countLimit() {
        return maxSolutions == UNBOUNDED ? minSolutions : maxSolutions + 1L;
    }

    public boolean accepts(long count) {
        return count >= minSolutions && (maxSolutions == UNBOUNDED || count <= maxSolutions);
    }
}
```

```java
package com.foodbytes.service.game;

import static com.foodbytes.service.game.DifficultyBand.UNBOUNDED;

/**
 * MPP-49: Garden Path difficulty 1-10, calibrated against the 10 hand-made mockup levels
 * (GardenPathBandsTest pins every fixture inside its band). Width = columns, never more than 6.
 */
public final class GardenPathBands {

    public static final int MIN_DIFFICULTY = 1;
    public static final int MAX_DIFFICULTY = 10;

    private static final DifficultyBand[] BANDS = {
        new DifficultyBand(1, 3, 3, 0, 2, UNBOUNDED),
        new DifficultyBand(2, 4, 3, 0, 4, UNBOUNDED),
        new DifficultyBand(3, 4, 4, 1, 2, UNBOUNDED),
        new DifficultyBand(4, 5, 4, 1, 2, 20),
        new DifficultyBand(5, 5, 5, 2, 2, 12),
        new DifficultyBand(6, 5, 5, 3, 1, 4),
        new DifficultyBand(7, 6, 5, 2, 1, 8),
        new DifficultyBand(8, 6, 6, 3, 1, 3),
        new DifficultyBand(9, 6, 6, 4, 1, 2),
        new DifficultyBand(10, 6, 7, 4, 1, 4),
    };

    private GardenPathBands() {
    }

    public static DifficultyBand of(int difficulty) {
        if (difficulty < MIN_DIFFICULTY || difficulty > MAX_DIFFICULTY) {
            throw new IllegalArgumentException("Difficulty must be " + MIN_DIFFICULTY + "-" + MAX_DIFFICULTY);
        }
        return BANDS[difficulty - 1];
    }
}
```

- [x] **Step 4: Run it green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=GardenPathBandsTest`
Expected: `BUILD SUCCESS`.

### Task 6: `GardenPathGenerator` with the per-difficulty band test (calibration) ✓ (generate-and-test, accepted by developer 2026-11-17 — see research-generator.md)

- Skill: java-backend

**Files:**
- Create: `api/service/game/GardenPathGenerator.java`
- Test: `test/service/game/GardenPathGeneratorTest.java`

- [x] **Step 1: Write the failing test**

Cases:
- `@ParameterizedTest @ValueSource(ints = {1,…,10})` `everyDifficulty_fiftySeededMaps_areInBand`: for seeds `0..49`, `generate(d, seed)`; assert width/height equal `GardenPathBands.of(d)`, `cells() - openCount() == rocks`, `width() <= GridMap.MAX_COLS`, exactly one `S` in `rows()`, and `GardenPathSolver.countSolutions(map, band.countLimit(), GardenPathGenerator.NODE_BUDGET)` is not over budget and `band.accepts(count)`. Measure the 50 generations with `System.nanoTime()` and assert the total `< 3_000` ms.
- `sameSeed_sameMap`: `generate(8, 42L).layout()` equals itself on a second call.
- `differentSeeds_vary`: across seeds `0..19` at difficulty 5, more than one distinct `layout()`.
- `badDifficulty_throws`: `generate(0, 1L)` → `IllegalArgumentException`.

- [x] **Step 2: Run it red**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=GardenPathGeneratorTest`
Expected: compilation failure.

- [x] **Step 3: Implement**

```java
package com.foodbytes.service.game;

import com.foodbytes.service.PipGameException;

import java.util.Arrays;
import java.util.SplittableRandom;

/**
 * MPP-49: makes a Garden Path map for a difficulty, deterministically per seed. Builds the map around a
 * random solution (a self-avoiding walk over W*H - rocks cells; cells off the walk become rocks, the
 * walk's first cell is S), so it is solvable by construction; the solver then re-proves it and the
 * map is kept only if its solution count is inside the band. Retries up to MAX_ATTEMPTS.
 */
public final class GardenPathGenerator {

    public static final int MAX_ATTEMPTS = 400;
    public static final long NODE_BUDGET = 200_000L;
    static final int WALK_BUDGET = 20_000;

    private GardenPathGenerator() {
    }

    public static GridMap generate(int difficulty, long seed) {
        DifficultyBand band = GardenPathBands.of(difficulty);
        SplittableRandom rng = new SplittableRandom(seed);
        int target = band.width() * band.height() - band.rocks();
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            int[] walk = randomWalk(band.width(), band.height(), target, rng);
            if (walk == null) continue;
            GridMap map = fromWalk(band.width(), band.height(), walk);
            SolveResult proof = GardenPathSolver.countSolutions(map, band.countLimit(), NODE_BUDGET);
            if (!proof.budgetExceeded() && band.accepts(proof.count())) return map;
        }
        throw new PipGameException(PipGameException.Reason.GENERATION_FAILED,
                "Pip couldn't lay out a puzzle just now. Try again.");
    }

    static int[] randomWalk(int width, int height, int target, SplittableRandom rng) {
        int[] path = new int[target];
        boolean[] used = new boolean[width * height];
        path[0] = rng.nextInt(width * height);
        used[path[0]] = true;
        int[] budget = {WALK_BUDGET};
        return extend(width, height, path, used, 1, rng, budget) ? path : null;
    }

    private static boolean extend(int width, int height, int[] path, boolean[] used, int depth,
                                  SplittableRandom rng, int[] budget) {
        if (depth == path.length) return true;
        if (--budget[0] < 0) return false;
        int[] next = free(width, height, used, path[depth - 1]);
        shuffle(next, rng);
        // Warnsdorff tie-break: try the neighbour with the fewest onward options first (stable after the shuffle).
        Integer[] order = Arrays.stream(next).boxed().toArray(Integer[]::new);
        Arrays.sort(order, (a, b) -> Integer.compare(free(width, height, used, a).length, free(width, height, used, b).length));
        for (int cell : order) {
            used[cell] = true;
            path[depth] = cell;
            if (extend(width, height, path, used, depth + 1, rng, budget)) return true;
            used[cell] = false;
        }
        return false;
    }

    private static int[] free(int width, int height, boolean[] used, int i) {
        int x = i % width, y = i / width;
        int[] out = new int[4];
        int n = 0;
        if (y > 0 && !used[i - width]) out[n++] = i - width;
        if (y < height - 1 && !used[i + width]) out[n++] = i + width;
        if (x > 0 && !used[i - 1]) out[n++] = i - 1;
        if (x < width - 1 && !used[i + 1]) out[n++] = i + 1;
        return Arrays.copyOf(out, n);
    }

    private static void shuffle(int[] a, SplittableRandom rng) {
        for (int i = a.length - 1; i > 0; i--) {
            int j = rng.nextInt(i + 1);
            int t = a[i];
            a[i] = a[j];
            a[j] = t;
        }
    }

    private static GridMap fromWalk(int width, int height, int[] walk) {
        boolean[] open = new boolean[width * height];
        for (int cell : walk) open[cell] = true;
        return new GridMap(width, height, open, walk[0], walk.length);
    }
}
```

- [x] **Step 4: Run it and calibrate**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=GardenPathGeneratorTest`
Expected: `BUILD SUCCESS`.

If a difficulty fails (`GENERATION_FAILED` or over 3 s), calibrate in this order and stop at the first that passes: (1) raise `MAX_ATTEMPTS` to 1 000; (2) raise that band's `maxSolutions` by the smallest step that passes. After any band change, re-run `mvn test -Dtest=GardenPathBandsTest` — every mockup fixture must still sit in its band. Record every change (old → new, and the measured time) for `pr-description.md`.

> **Calibration note (Task 6, implementer 2026-11-17):** the walk-built generator in Step 3 could not reach difficulties 7-10 (0 of 2 000 random walks inside band; best solution count 9 against a max of 8; a hill-climb over walk mutations needed 2 000-11 000 solver runs per map and still failed). `GardenPathGenerator` therefore lays the band's rocks uniformly at random and scans shuffled open cells as the start until the solver proves a count inside the band (solver = the proof; scan budget 700 nodes, re-proved at NODE_BUDGET 200 000; MAX_ATTEMPTS stays 400). `GardenPathSolver.Search` was also tuned (precomputed adjacency, reused BFS buffers; same counts). **No band was widened**; all 10 fixtures stay in their bands. 50 seeded maps per difficulty: d1-3 <= 3 ms, d4 38, d5 53, d6 38, d7 658, d8 1194, d9 793, d10 2268 ms (limit 3000).

> **Calibration note (Task 6a, implementer 2026-11-17):** both speed-ups kept (checkerboard parity filter on layouts and starts; bounded rock perturbation, 8 moves per layout, each layout counted toward MAX_ATTEMPTS). Bands unchanged, solver counts unchanged, determinism per seed kept. 50 seeded maps per difficulty, old -> new: d1-3 <= 3 -> <= 5 ms (noise), d4 38 -> 21, d5 53 -> 21, d6 38 -> 7, d7 658 -> 315, d8 1194 -> 367, d9 793 -> 257, d10 2268 -> 1173 ms (limit 3000).

### Task 6a: Generator speed-ups — parity filter and rock perturbation (amendment 2026-11-17) ✓

- Skill: java-backend — pure game core; the developer accepted generate-and-test and asked for the two speed-ups from `research-generator.md`.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/game/GardenPathGenerator.java`
- Modify (only if a shared helper belongs there): `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/game/GridMap.java`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/game/GardenPathGeneratorTest.java`

- [x] **Step 1: Write failing tests for the parity rule**

In `GardenPathGeneratorTest`, add tests for a package-private pure helper (e.g. `GardenPathGenerator.parityAllowsStart(GridMap layoutWithoutStartOrWithStart, int start)` or equivalent): colour cell `(x, y)` dark when `(x + y)` is even. A layout whose open dark and light counts differ by more than 1 → no start allowed. Counts equal → any open start allowed. Counts differ by 1 → only starts on the larger colour allowed. Include a positive case from a mockup fixture (each of the 10 fixtures' `S` must pass the parity rule — reuse `GardenPathSolverTest.FIXTURES`) and a hand-made negative case.

- [x] **Step 2: Run, confirm they fail**

Run: `mvn test -Dtest=GardenPathGeneratorTest`
Expected: FAIL (helper missing).

- [x] **Step 3: Implement the parity filter in the generator**

Reject a rock layout outright when its colour counts differ by > 1; only scan starts that pass the parity rule. The solver remains the proof.

- [x] **Step 4: Implement bounded rock perturbation**

When a layout yields no in-band start, move one random rock to a random open neighbour (rock count unchanged) and rescan, up to a small fixed bound (e.g. 8) before rolling a fresh layout. Each layout (fresh or perturbed) counts toward `MAX_ATTEMPTS`. Keep determinism per seed. Add a test that the same seed still yields the same map, and that every generated map at d1–10 passes the parity rule and is re-proved in band.

- [x] **Step 5: Re-run the generator band test and record timings**

Run: `mvn test -Dtest=GardenPathGeneratorTest+GardenPathBandsTest+GardenPathSolverTest`
Expected: PASS; 50 seeded maps per difficulty under 3 000 ms each. Append the new per-difficulty timings (old → new) to the calibration note above. Bands unchanged; if a speed-up makes things slower at any difficulty, keep only the one that helps and say so in the note.

### Task 7: Family interface, Garden Path family, registry ✓

- Skill: java-backend

**Files:**
- Create: `api/service/game/PuzzleFamily.java`
- Create: `api/service/game/GardenPathFamily.java`
- Create: `api/service/game/PuzzleFamilyRegistry.java`
- Test: `test/service/game/PuzzleFamilyRegistryTest.java`

- [x] **Step 1: Write the failing test**

Use a small test-only `record FakeFamily(String id, int chapter) implements PuzzleFamily` (generate/isValidClear throw `UnsupportedOperationException`). Cases:
- `ordered()` sorts `[Fake("b", 2), GardenPathFamily]` → `garden-path`, `b`.
- `byId("garden-path")` present; `byId("nope")` empty; `byId(null)` empty.
- duplicate id → `IllegalStateException`; duplicate chapter → `IllegalStateException`.
- `new GardenPathFamily().generate(3, 7L)` returns a 4×4 map, and `isValidClear` on its first solution (from `GardenPathSolver.countSolutions(map, 1, NODE_BUDGET).first()`) is true.

- [x] **Step 2: Run it red**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PuzzleFamilyRegistryTest`
Expected: compilation failure.

- [x] **Step 3: Implement**

```java
package com.foodbytes.service.game;

import java.util.List;

/** MPP-49: one Pip's Path puzzle family = one chapter. Later chapters add a bean; nothing else changes. */
public interface PuzzleFamily {
    String id();
    int chapter();
    GridMap generate(int difficulty, long seed);
    boolean isValidClear(GridMap map, List<Integer> path);
}
```

```java
package com.foodbytes.service.game;

import org.springframework.stereotype.Component;

import java.util.List;

/** MPP-49: Chapter 1, Garden Path - visit every open tile exactly once. */
@Component
public class GardenPathFamily implements PuzzleFamily {

    public static final String ID = "garden-path";
    public static final int CHAPTER = 1;

    @Override public String id() { return ID; }
    @Override public int chapter() { return CHAPTER; }

    @Override
    public GridMap generate(int difficulty, long seed) {
        return GardenPathGenerator.generate(difficulty, seed);
    }

    @Override
    public boolean isValidClear(GridMap map, List<Integer> path) {
        return GardenPathSolver.isValidClear(map, path);
    }
}
```

```java
package com.foodbytes.service.game;

import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/** MPP-49: every shipped PuzzleFamily bean, in chapter order. Fails at startup on a duplicate id or chapter. */
@Component
public class PuzzleFamilyRegistry {

    private final List<PuzzleFamily> ordered;

    public PuzzleFamilyRegistry(List<PuzzleFamily> families) {
        Set<String> ids = new HashSet<>();
        Set<Integer> chapters = new HashSet<>();
        for (PuzzleFamily family : families) {
            if (!ids.add(family.id())) throw new IllegalStateException("Duplicate puzzle family id: " + family.id());
            if (!chapters.add(family.chapter())) throw new IllegalStateException("Duplicate chapter: " + family.chapter());
        }
        this.ordered = families.stream().sorted(Comparator.comparingInt(PuzzleFamily::chapter)).toList();
    }

    public List<PuzzleFamily> ordered() {
        return ordered;
    }

    public Optional<PuzzleFamily> byId(String id) {
        return ordered.stream().filter(family -> family.id().equals(id)).findFirst();
    }
}
```

- [x] **Step 4: Run it green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PuzzleFamilyRegistryTest`
Expected: `BUILD SUCCESS`.

### Task 8: `GameMode` and `PipsPathSequencer` ✓

- Skill: java-backend

**Files:**
- Create: `api/model/GameMode.java`
- Create: `api/service/game/FamilyProgress.java`
- Create: `api/service/game/Slot.java`
- Create: `api/service/game/PipsPathSequencer.java`
- Test: `test/service/game/PipsPathSequencerTest.java`

- [x] **Step 1: Write the failing test**

Families: `GP = new GardenPathFamily()`; `TI = FakeFamily("thin-ice", 2)` (same fake as Task 7; copy it into this test class). `rng = new SplittableRandom(1)` (implements `RandomGenerator`). Cases:
- one family, no progress → `Slot("garden-path", 1, CHAPTER, 1)`; `currentChapter == 1`.
- one family, highest 3 → difficulty 4.
- one family, highest 10 → mode `ENDLESS`, family `garden-path`, chapter `null`, difficulty in 1..10; `currentChapter == 2`.
- two families, GP 10, TI 0 → `Slot("thin-ice", 1, CHAPTER, 2)`.
- two families, GP 10 (refresherThrough 0), TI 10 → `REFRESHER` on `garden-path`, chapter 2, difficulty in 8..10; `currentChapter == 2`.
- same with GP refresherThrough 2 → `ENDLESS`; `currentChapter == 3`.
- `isUnlocked`: one family highest 3 → d 1..4 true, d 5 false, d 0 and 11 false; two families GP 4 → `isUnlocked(TI, 1, …)` false; GP 10 → `isUnlocked(TI, 1, …)` true.

- [x] **Step 2: Run it red**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PipsPathSequencerTest`
Expected: compilation failure.

- [x] **Step 3: Implement**

```java
package com.foodbytes.model;

/** MPP-49: why a Pip's Path map was issued. Stored by name in pet_game_maps.mode (chk_pet_game_maps_mode). */
public enum GameMode { CHAPTER, REFRESHER, ENDLESS }
```

```java
package com.foodbytes.service.game;

/** MPP-49: one person's progress in one family (pet_game_progress, or NONE when there is no row). */
public record FamilyProgress(int highestCleared, int refresherThrough) {
    public static final FamilyProgress NONE = new FamilyProgress(0, 0);
}
```

```java
package com.foodbytes.service.game;

import com.foodbytes.model.GameMode;

/** MPP-49: the map to issue next. chapter is null for ENDLESS. */
public record Slot(String family, int difficulty, GameMode mode, Integer chapter) {}
```

```java
package com.foodbytes.service.game;

import com.foodbytes.model.GameMode;

import java.util.List;
import java.util.Map;
import java.util.random.RandomGenerator;

/**
 * MPP-49: the chapter cadence. Chapter n = difficulty 1-10 of family n in order, then one refresher
 * (difficulty REFRESHER_MIN-REFRESHER_MAX) of each earlier family; after the last shipped chapter,
 * endless = a random family and difficulty. `ordered` comes from PuzzleFamilyRegistry.
 */
public final class PipsPathSequencer {

    public static final int CHAPTER_LEVELS = 10;
    public static final int REFRESHER_MIN = 8;
    public static final int REFRESHER_MAX = 10;

    private PipsPathSequencer() {
    }

    public static Slot next(List<PuzzleFamily> ordered, Map<String, FamilyProgress> progress, RandomGenerator rng) {
        int open = openChapterIndex(ordered, progress);
        if (open < 0) {
            PuzzleFamily family = ordered.get(rng.nextInt(ordered.size()));
            return new Slot(family.id(), rng.nextInt(1, CHAPTER_LEVELS + 1), GameMode.ENDLESS, null);
        }
        PuzzleFamily family = ordered.get(open);
        FamilyProgress own = of(progress, family);
        if (own.highestCleared() < CHAPTER_LEVELS) {
            return new Slot(family.id(), own.highestCleared() + 1, GameMode.CHAPTER, family.chapter());
        }
        for (int k = 0; k < open; k++) {
            PuzzleFamily earlier = ordered.get(k);
            if (of(progress, earlier).refresherThrough() < family.chapter()) {
                return new Slot(earlier.id(), rng.nextInt(REFRESHER_MIN, REFRESHER_MAX + 1), GameMode.REFRESHER, family.chapter());
            }
        }
        throw new IllegalStateException("Open chapter " + family.chapter() + " has nothing left to play");
    }

    /** The chapter in play, or the last shipped chapter + 1 in endless mode. */
    public static int currentChapter(List<PuzzleFamily> ordered, Map<String, FamilyProgress> progress) {
        int open = openChapterIndex(ordered, progress);
        return open < 0 ? ordered.get(ordered.size() - 1).chapter() + 1 : ordered.get(open).chapter();
    }

    public static boolean isEndless(List<PuzzleFamily> ordered, Map<String, FamilyProgress> progress) {
        return openChapterIndex(ordered, progress) < 0;
    }

    /** A replay is allowed for a reached chapter, up to one past the highest cleared difficulty. */
    public static boolean isUnlocked(PuzzleFamily family, int difficulty, List<PuzzleFamily> ordered,
                                     Map<String, FamilyProgress> progress) {
        if (difficulty < 1 || difficulty > CHAPTER_LEVELS) return false;
        int open = openChapterIndex(ordered, progress);
        int index = ordered.indexOf(family);
        if (index < 0 || (open >= 0 && index > open)) return false;
        return difficulty <= of(progress, family).highestCleared() + 1;
    }

    /** Index of the first chapter not yet complete (levels or refreshers), or -1 when all are. */
    private static int openChapterIndex(List<PuzzleFamily> ordered, Map<String, FamilyProgress> progress) {
        for (int c = 0; c < ordered.size(); c++) {
            PuzzleFamily family = ordered.get(c);
            if (of(progress, family).highestCleared() < CHAPTER_LEVELS) return c;
            for (int k = 0; k < c; k++) {
                if (of(progress, ordered.get(k)).refresherThrough() < family.chapter()) return c;
            }
        }
        return -1;
    }

    private static FamilyProgress of(Map<String, FamilyProgress> progress, PuzzleFamily family) {
        return progress.getOrDefault(family.id(), FamilyProgress.NONE);
    }
}
```

- [x] **Step 4: Run it green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PipsPathSequencerTest`
Expected: `BUILD SUCCESS`.

---

## Phase 3 — Persistence and sprinkle policy

Maps the two new tables, adds `GAME_CLEAR` and the cap rule, and exposes the amounts in the rates DTO. The migration was applied locally in Phase 1, so Hibernate `validate` passes; nothing calls the new repositories yet, so behaviour is unchanged and the build stays green.

### Task 9: `SprinkleSource.GAME_CLEAR` and the two entities ✓

- Skill: java-backend

**Files:**
- Modify: `api/model/SprinkleSource.java`
- Create: `api/model/PetGameMap.java`
- Create: `api/model/PetGameProgress.java`

- [x] **Step 1: Add the source**

In `SprinkleSource`, change the last constant line to end with a comma and add:

```java
    SHOPPING_LIST_COMPLETED, // MPP-42: same key; the list had >= 1 item and every item checked
    GAME_CLEAR               // MPP-49: source_id = pet_game_maps.id - 5 per cleared map, capped per Dublin day
```

- [x] **Step 2: Write `PetGameMap`**

```java
package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * MPP-49: one Pip's Path map issued to one person. A clear is replayed against `layout` (rows joined by
 * '/', legend S . #); cleared_at is set once, and the id keys the GAME_CLEAR payout so it pays once.
 */
@Entity
@Table(name = "pet_game_maps")
@Data
@NoArgsConstructor
public class PetGameMap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The player - never the meal-plan owner (MPP-33)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "family", nullable = false, length = 32)
    private String family;

    @Column(name = "difficulty", nullable = false)
    private int difficulty;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "mode", nullable = false, length = 16)
    private GameMode mode;

    @Column(name = "chapter")
    private Integer chapter;

    @Column(name = "seed", nullable = false)
    private long seed;

    @Column(name = "width", nullable = false)
    private int width;

    @Column(name = "height", nullable = false)
    private int height;

    @Column(name = "layout", nullable = false, length = 1024)
    private String layout;

    // DB default CURRENT_TIMESTAMP (UTC)
    @Column(name = "issued_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime issuedAt;

    @Column(name = "cleared_at")
    private LocalDateTime clearedAt;

    // Identity is the primary key - see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetGameMap other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetGameMap.class.hashCode();
    }
}
```

All integer columns are `INT` (not `TINYINT`), so `int`/`Integer` fields pass Hibernate `validate` with no type override, as `pet_station_levels.level` does.

- [x] **Step 3: Write `PetGameProgress`**

```java
package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** MPP-49: one person's Pip's Path progress in one family. Per person, like Pip (MPP-33). */
@Entity
@Table(name = "pet_game_progress", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_game_progress", columnNames = {"user_id", "family"})
})
@Data
@NoArgsConstructor
public class PetGameProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "family", nullable = false, length = 32)
    private String family;

    @Column(name = "highest_cleared", nullable = false)
    private int highestCleared;

    @Column(name = "refresher_through", nullable = false)
    private int refresherThrough;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public PetGameProgress(Long userId, String family) {
        this.userId = userId;
        this.family = family;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetGameProgress other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetGameProgress.class.hashCode();
    }
}
```

- [x] **Step 4: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, no output.

### Task 10: Repositories ✓

- Skill: java-backend

**Files:**
- Create: `api/repository/PetGameMapRepository.java`
- Create: `api/repository/PetGameProgressRepository.java`
- Modify: `api/repository/PetSprinkleRepository.java`

- [x] **Step 1: Write the two repositories**

```java
package com.foodbytes.repository;

import com.foodbytes.model.PetGameMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** MPP-49: issued Pip's Path maps. Always looked up with the caller's id, so nobody reads another's map. */
@Repository
public interface PetGameMapRepository extends JpaRepository<PetGameMap, Long> {
    Optional<PetGameMap> findByIdAndUserId(Long id, Long userId);
}
```

```java
package com.foodbytes.repository;

import com.foodbytes.model.PetGameProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** MPP-49: per-person Pip's Path progress (uk_pet_game_progress leads with user_id). */
@Repository
public interface PetGameProgressRepository extends JpaRepository<PetGameProgress, Long> {
    List<PetGameProgress> findByUserId(Long userId);
    Optional<PetGameProgress> findByUserIdAndFamily(Long userId, String family);
}
```

- [x] **Step 2: Add the daily-sum query to `PetSprinkleRepository`**

Below `sumAmountByUserId`:

```java
    /** MPP-49: one source's payouts to the person in [from, to) (UTC wall time) - the games daily cap. */
    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM PetSprinkle s WHERE s.userId = :userId " +
           "AND s.sourceType = :sourceType AND s.createdAt >= :from AND s.createdAt < :to")
    long sumAmountByUserIdAndSourceTypeBetween(@Param("userId") Long userId,
                                               @Param("sourceType") SprinkleSource sourceType,
                                               @Param("from") LocalDateTime from,
                                               @Param("to") LocalDateTime to);
```

- [x] **Step 3: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 11: `SprinklePolicy` — game amount, cap and Dublin day ✓

- Skill: java-backend

**Files:**
- Modify: `api/service/SprinklePolicy.java`
- Test: `test/service/SprinklePolicyTest.java`

- [x] **Step 1: Add failing tests to `SprinklePolicyTest`**

```java
    @Test
    void gameClearAmount_paysFiveUntilTheDailyCap() {
        assertThat(SprinklePolicy.gameClearAmount(0)).isEqualTo(5);
        assertThat(SprinklePolicy.gameClearAmount(45)).isEqualTo(5);
        assertThat(SprinklePolicy.gameClearAmount(48)).isEqualTo(2);
        assertThat(SprinklePolicy.gameClearAmount(50)).isZero();
        assertThat(SprinklePolicy.gameClearAmount(60)).isZero();
    }

    @Test
    void dublinDayUtc_summerAndWinter() {
        // IST (UTC+1): 2026-07-01 Dublin = 2026-06-30T23:00 .. 2026-07-01T23:00 UTC
        assertThat(SprinklePolicy.dublinDayUtc(LocalDate.of(2026, 7, 1)))
                .containsExactly(LocalDateTime.of(2026, 6, 30, 23, 0), LocalDateTime.of(2026, 7, 1, 23, 0));
        // GMT: 2026-11-17 Dublin = same wall times in UTC
        assertThat(SprinklePolicy.dublinDayUtc(LocalDate.of(2026, 11, 17)))
                .containsExactly(LocalDateTime.of(2026, 11, 17, 0, 0), LocalDateTime.of(2026, 11, 18, 0, 0));
    }
```

Add `import java.time.LocalDateTime;` if missing.

- [x] **Step 2: Run it red**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinklePolicyTest`
Expected: compilation failure (`gameClearAmount` missing).

- [x] **Step 3: Implement in `SprinklePolicy`**

Constants below `RECENT_DAYS`:

```java
    /** MPP-49: each server-checked Pip's Path clear, capped per Dublin day. Every play is a new map, so no replay rate. */
    public static final int GAME_CLEAR = 5;
    public static final int GAME_DAILY_CAP = 50;
```

Methods below `isOnTime`:

```java
    /** MPP-49: what the next game clear pays, given the person's GAME_CLEAR total so far today. */
    static int gameClearAmount(long earnedToday) {
        return (int) Math.max(0, Math.min(GAME_CLEAR, GAME_DAILY_CAP - earnedToday));
    }

    /** MPP-49: a Dublin day as [start, end) in UTC wall time - pet_sprinkles.created_at is UTC. */
    static LocalDateTime[] dublinDayUtc(LocalDate day) {
        return new LocalDateTime[] {
            day.atStartOfDay(HabitStreakPolicy.ZONE).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime(),
            day.plusDays(1).atStartOfDay(HabitStreakPolicy.ZONE).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime()
        };
    }
```

Update the class Javadoc's first line to mention MPP-49 games. `ZoneOffset`, `LocalDate`, `LocalDateTime` are already imported.

- [x] **Step 4: Run it green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinklePolicyTest`
Expected: `BUILD SUCCESS`.

### Task 12: Game amounts in `SprinkleRatesDTO` ✓

- Skill: java-backend

**Files:**
- Modify: `api/dto/SprinkleRatesDTO.java`
- Modify: `api/service/SprinkleHistoryService.java:62-67` (`rates()`)
- Test: `test/service/SprinkleHistoryServiceTest.java`

- [x] **Step 1: Add the fields**

In `SprinkleRatesDTO`, after `mealsPerWeek`:

```java
    private int gameClear;      // MPP-49
    private int gameDailyCap;   // MPP-49
```

- [x] **Step 2: Fill them in `rates()`**

```java
    static SprinkleRatesDTO rates() {
        return new SprinkleRatesDTO(
                SprinklePolicy.MEAL_EATEN, SprinklePolicy.ON_TIME_BONUS, SprinklePolicy.HOMEMADE_BONUS,
                SprinklePolicy.FULL_WEEK, SprinklePolicy.SHOPPING_LIST_GENERATED, SprinklePolicy.SHOPPING_LIST_COMPLETED,
                SprinklePolicy.mealsPerWeek(), SprinklePolicy.GAME_CLEAR, SprinklePolicy.GAME_DAILY_CAP);
    }
```

- [x] **Step 3: Pin it in the existing test**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\test\java\com\foodbytes\**\*.java -Pattern "new SprinkleRatesDTO\(" `
For every hit, append `, 5, 50` to the positional arguments. Then add to `SprinkleHistoryServiceTest` a test `rates_includeTheGameAmounts` asserting `SprinkleHistoryService.rates().getGameClear() == 5` and `getGameDailyCap() == 50`.

- [x] **Step 4: Run the affected tests**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=SprinkleHistoryServiceTest+PetSprinkleControllerTest`
Expected: `BUILD SUCCESS`.

---

## Phase 4 — Service and API

Adds the DTOs, `PipsPathService` and `PipsPathController`. After this phase the three endpoints work end to end against the local DB; the boundary is the service and controller test classes green.

### Task 13: Request and response DTOs ✓

- Skill: java-backend

**Files:**
- Create: `api/dto/PipsPathMapRequest.java`, `PipsPathClearRequest.java`, `PipsPathMapDTO.java`, `PipsPathFamilyDTO.java`, `PipsPathSlotDTO.java`, `PipsPathStateDTO.java`, `PipsPathClearDTO.java`

- [x] **Step 1: Write the DTOs**

All are Lombok `@Data @NoArgsConstructor @AllArgsConstructor` classes in `com.foodbytes.dto`, with a one-line `/** MPP-49: … */` Javadoc, fields exactly as below:

```java
public class PipsPathMapRequest {          // body of POST /maps; both null = next slot
    @Size(max = 32) private String family;
    @Min(1) @Max(10) private Integer difficulty;
}
public class PipsPathClearRequest {
    @NotNull(message = "path is required")
    @Size(min = 1, max = 64, message = "path must have 1-64 steps")
    private List<@NotNull Integer> path;
}
public class PipsPathMapDTO {
    private Long mapId; private String family; private int difficulty; private String mode;
    private Integer chapter; private int width; private int height; private List<String> rows;
}
public class PipsPathFamilyDTO { private String id; private int chapter; private int highestCleared; private int refresherThrough; }
public class PipsPathSlotDTO { private String family; private Integer difficulty; private String mode; private Integer chapter; }
public class PipsPathStateDTO {
    private List<PipsPathFamilyDTO> families; private int currentChapter; private boolean endless;
    private PipsPathSlotDTO next; private long earnedToday; private int dailyCap; private int perClear;
}
public class PipsPathClearDTO {
    private boolean alreadyCleared; private int paid; private boolean capped; private long earnedToday;
    private int dailyCap; private long balance; private PipsPathFamilyDTO progress;
}
```

Imports: `jakarta.validation.constraints.*`, `java.util.List`, Lombok.

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`.

### Task 14: `PipsPathService` ✓

- Skill: java-backend

**Files:**
- Create: `api/service/PipsPathService.java`
- Test: `test/service/PipsPathServiceTest.java`

- [x] **Step 1: Write the failing test**

Mockito (`@ExtendWith(MockitoExtension.class)`), fixed `Clock.fixed(Instant.parse("2026-11-17T12:00:00Z"), ZoneOffset.UTC)`, mocks for `PetGameMapRepository`, `PetGameProgressRepository`, `PetSprinkleRepository`, `SprinkleService`; a real `PuzzleFamilyRegistry(List.of(new GardenPathFamily()))`. Construct the service with `new PipsPathService(registry, maps, progress, sprinkles, sprinkleService, clock)`. A helper builds a stored `PetGameMap` for `garden-01` (`S../.../...`, 3×3, `CHAPTER`, difficulty 1, chapter 1) with id `77`, and `SOLUTION = List.of(0,1,2,5,4,3,6,7,8)`. Cases:
- **issue next, new player:** `progress.findByUserId(2L)` → empty; `maps.save` returns its argument. Result `difficulty 1`, `mode "CHAPTER"`, `chapter 1`, `width 3`, `height 3`, `rows` size 3; the saved entity has `userId 2`, `family "garden-path"`, a layout that `GridMap.fromLayout` parses.
- **issue replay locked:** progress highest 3 → `issue(2L, "garden-path", 5)` throws `PipGameException` with `LOCKED`; `maps.save` never called.
- **issue replay unknown family / half request:** `issue(2L, "nope", 1)` → `UNKNOWN_FAMILY`; `issue(2L, "garden-path", null)` → `BAD_DIFFICULTY`.
- **clear valid, first of the day:** `maps.findByIdAndUserId(77L, 2L)` → map; sum → `0L`; balance → `105L`. Result `paid 5`, `capped false`, `earnedToday 5`, `alreadyCleared false`, `balance 105`; verify `sprinkleService.lockWallet(2L)` was called **before** `findByIdAndUserId` (`InOrder`); `sprinkles.insertIfAbsent(2L, "GAME_CLEAR", 77L, 5)`; saved progress `highestCleared 1`; map `clearedAt` set to `2026-11-17T12:00`.
- **clear at the cap:** sum → `50L` → `paid 0`, `capped true`; `insertIfAbsent` never called; progress still raised and `clearedAt` still set.
- **clear partial cap:** sum → `48L` → `paid 2`, `capped true`.
- **sum window:** capture the `from`/`to` of `sumAmountByUserIdAndSourceTypeBetween` → `2026-11-17T00:00` and `2026-11-18T00:00` with `SprinkleSource.GAME_CLEAR`.
- **already cleared:** map with `clearedAt` set → `alreadyCleared true`, `paid 0`; no `insertIfAbsent`, no `progress.save`.
- **invalid path:** `List.of(0,1,2)` → `INVALID_PATH`; no `insertIfAbsent`, `clearedAt` still null, no `progress.save`.
- **not yours:** `findByIdAndUserId(77L, 3L)` → empty → `NOT_FOUND`.
- **lower replay keeps progress:** existing progress highest 6, map difficulty 2 → saved `highestCleared` stays 6.
- **refresher clear:** map `mode REFRESHER`, chapter 2 → saved `refresherThrough 2`, `highestCleared` unchanged.
- **state:** progress highest 10 for `garden-path` → `endless true`, `currentChapter 2`, `next.mode "ENDLESS"`, `next.difficulty null`, `perClear 5`, `dailyCap 50`; new player → `next.difficulty 1`, `next.mode "CHAPTER"`, families list has one entry `garden-path` with chapter 1.

- [x] **Step 2: Run it red**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PipsPathServiceTest`
Expected: compilation failure.

- [x] **Step 3: Implement**

```java
package com.foodbytes.service;

import com.foodbytes.dto.*;
import com.foodbytes.model.GameMode;
import com.foodbytes.model.PetGameMap;
import com.foodbytes.model.PetGameProgress;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.PetGameMapRepository;
import com.foodbytes.repository.PetGameProgressRepository;
import com.foodbytes.repository.PetSprinkleRepository;
import com.foodbytes.service.game.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * MPP-49: Pip's Path for one person. Issues freshly generated, solver-proven maps in chapter order
 * (PipsPathSequencer), replays a submitted path against the stored map, and on a valid first clear
 * raises the person's own progress and pays GAME_CLEAR (5, capped at 50 a Dublin day). The clear holds
 * the wallet lock, so two devices can't both slip under the cap; uk_pet_sprinkles pays a map once.
 */
@Service
@RequiredArgsConstructor
public class PipsPathService {

    private final PuzzleFamilyRegistry registry;
    private final PetGameMapRepository mapRepository;
    private final PetGameProgressRepository progressRepository;
    private final PetSprinkleRepository sprinkleRepository;
    private final SprinkleService sprinkleService;
    private final Clock clock;

    @Transactional(readOnly = true)
    public PipsPathStateDTO state(Long userId) {
        List<PuzzleFamily> ordered = registry.ordered();
        Map<String, FamilyProgress> progress = progressOf(userId);
        Slot next = PipsPathSequencer.next(ordered, progress, ThreadLocalRandom.current());
        Integer previewDifficulty = next.mode() == GameMode.CHAPTER ? next.difficulty() : null;
        return new PipsPathStateDTO(
                ordered.stream().map(f -> familyDto(f, progress.getOrDefault(f.id(), FamilyProgress.NONE))).toList(),
                PipsPathSequencer.currentChapter(ordered, progress),
                PipsPathSequencer.isEndless(ordered, progress),
                new PipsPathSlotDTO(next.family(), previewDifficulty, next.mode().name(), next.chapter()),
                earnedToday(userId), SprinklePolicy.GAME_DAILY_CAP, SprinklePolicy.GAME_CLEAR);
    }

    @Transactional
    public PipsPathMapDTO issue(Long userId, String familyId, Integer difficulty) {
        List<PuzzleFamily> ordered = registry.ordered();
        Map<String, FamilyProgress> progress = progressOf(userId);
        Slot slot = familyId == null && difficulty == null
                ? PipsPathSequencer.next(ordered, progress, ThreadLocalRandom.current())
                : replaySlot(familyId, difficulty, ordered, progress);
        PuzzleFamily family = family(slot.family());
        long seed = ThreadLocalRandom.current().nextLong();
        GridMap map = family.generate(slot.difficulty(), seed);

        PetGameMap row = new PetGameMap();
        row.setUserId(userId);
        row.setFamily(family.id());
        row.setDifficulty(slot.difficulty());
        row.setMode(slot.mode());
        row.setChapter(slot.chapter());
        row.setSeed(seed);
        row.setWidth(map.width());
        row.setHeight(map.height());
        row.setLayout(map.layout());
        PetGameMap saved = mapRepository.save(row);
        return new PipsPathMapDTO(saved.getId(), saved.getFamily(), saved.getDifficulty(), saved.getMode().name(),
                saved.getChapter(), map.width(), map.height(), map.rows());
    }

    @Transactional
    public PipsPathClearDTO clear(Long userId, Long mapId, List<Integer> path) {
        sprinkleService.lockWallet(userId);
        PetGameMap row = mapRepository.findByIdAndUserId(mapId, userId)
                .orElseThrow(() -> new PipGameException(PipGameException.Reason.NOT_FOUND, "That puzzle was not found."));
        PuzzleFamily family = family(row.getFamily());
        PetGameProgress progress = progressRepository.findByUserIdAndFamily(userId, row.getFamily())
                .orElseGet(() -> new PetGameProgress(userId, row.getFamily()));

        if (row.getClearedAt() != null) {
            long earned = earnedToday(userId);
            return clearDto(true, 0, earned >= SprinklePolicy.GAME_DAILY_CAP, earned, userId, family, progress);
        }
        GridMap map = GridMap.fromLayout(row.getLayout(), row.getWidth(), row.getHeight());
        if (!family.isValidClear(map, path)) {
            throw new PipGameException(PipGameException.Reason.INVALID_PATH,
                    "That path doesn't visit every tile exactly once.");
        }
        row.setClearedAt(LocalDateTime.now(clock.withZone(ZoneOffset.UTC)));
        mapRepository.save(row);
        advance(progress, row);
        progressRepository.save(progress);

        long earned = earnedToday(userId);
        int amount = SprinklePolicy.gameClearAmount(earned);
        if (amount > 0) sprinkleRepository.insertIfAbsent(userId, SprinkleSource.GAME_CLEAR.name(), mapId, amount);
        return clearDto(false, amount, amount < SprinklePolicy.GAME_CLEAR, earned + amount, userId, family, progress);
    }

    private Slot replaySlot(String familyId, Integer difficulty, List<PuzzleFamily> ordered,
                            Map<String, FamilyProgress> progress) {
        if (familyId == null || difficulty == null) {
            throw new PipGameException(PipGameException.Reason.BAD_DIFFICULTY,
                    "Pick both a game and a difficulty, or neither.");
        }
        PuzzleFamily family = family(familyId);
        if (difficulty < GardenPathBands.MIN_DIFFICULTY || difficulty > PipsPathSequencer.CHAPTER_LEVELS) {
            throw new PipGameException(PipGameException.Reason.BAD_DIFFICULTY, "Difficulty must be 1-10.");
        }
        if (!PipsPathSequencer.isUnlocked(family, difficulty, ordered, progress)) {
            throw new PipGameException(PipGameException.Reason.LOCKED, "That level is still locked.");
        }
        return new Slot(family.id(), difficulty, GameMode.CHAPTER, family.chapter());
    }

    private static void advance(PetGameProgress progress, PetGameMap map) {
        switch (map.getMode()) {
            case CHAPTER -> progress.setHighestCleared(Math.max(progress.getHighestCleared(), map.getDifficulty()));
            case REFRESHER -> progress.setRefresherThrough(Math.max(progress.getRefresherThrough(), map.getChapter()));
            case ENDLESS -> { }
        }
    }

    private PuzzleFamily family(String id) {
        return registry.byId(id).orElseThrow(() ->
                new PipGameException(PipGameException.Reason.UNKNOWN_FAMILY, "Unknown game: " + id));
    }

    private Map<String, FamilyProgress> progressOf(Long userId) {
        return progressRepository.findByUserId(userId).stream().collect(Collectors.toMap(
                PetGameProgress::getFamily, p -> new FamilyProgress(p.getHighestCleared(), p.getRefresherThrough())));
    }

    private long earnedToday(Long userId) {
        LocalDateTime[] day = SprinklePolicy.dublinDayUtc(HabitStreakPolicy.today(clock));
        return sprinkleRepository.sumAmountByUserIdAndSourceTypeBetween(userId, SprinkleSource.GAME_CLEAR, day[0], day[1]);
    }

    private PipsPathClearDTO clearDto(boolean alreadyCleared, int paid, boolean capped, long earnedToday,
                                      Long userId, PuzzleFamily family, PetGameProgress progress) {
        return new PipsPathClearDTO(alreadyCleared, paid, capped, earnedToday, SprinklePolicy.GAME_DAILY_CAP,
                sprinkleService.balance(userId),
                familyDto(family, new FamilyProgress(progress.getHighestCleared(), progress.getRefresherThrough())));
    }

    private static PipsPathFamilyDTO familyDto(PuzzleFamily family, FamilyProgress progress) {
        return new PipsPathFamilyDTO(family.id(), family.chapter(), progress.highestCleared(), progress.refresherThrough());
    }
}
```

- [x] **Step 4: Run it green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PipsPathServiceTest`
Expected: `BUILD SUCCESS`.

### Task 15: `PipsPathController` ✓

- Skill: java-backend

**Files:**
- Create: `api/controller/PipsPathController.java`
- Test: `test/controller/PipsPathControllerTest.java`

- [x] **Step 1: Write the failing test**

`@WebMvcTest(PipsPathController.class) @AutoConfigureMockMvc(addFilters = false)`, `@MockBean PipsPathService`. MockMvc cases (no principal):
- `GET /api/pet/games/pips-path`, `POST …/maps`, `POST …/maps/1/clear` with a valid body → 401 `$.error == "Not authenticated"`; `verifyNoInteractions(service)`.

Direct-call cases with a mocked `UserPrincipal` (`getId() → 2L`), as `PetSprinkleControllerTest` does:
- `state` → 200 with the service's DTO.
- `issue(principal, null)` → calls `service.issue(2L, null, null)`; `issue(principal, new PipsPathMapRequest("garden-path", 3))` → `issue(2L, "garden-path", 3)`.
- `clear(principal, 77L, new PipsPathClearRequest(List.of(0,1)))` → `clear(2L, 77L, [0,1])`.
- `statusOf` for each `Reason`: `UNKNOWN_FAMILY`/`BAD_DIFFICULTY` → 400, `LOCKED` → 403, `NOT_FOUND` → 404, `INVALID_PATH` → 422, `GENERATION_FAILED` → 503; and `clear` with the service throwing `INVALID_PATH` returns 422 with `{error: message}`.

Validation: build a `jakarta.validation.Validator` (`Validation.buildDefaultValidatorFactory().getValidator()`) and assert one violation each for `new PipsPathClearRequest(List.of())` and `new PipsPathMapRequest(null, 11)`.

- [x] **Step 2: Run it red**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PipsPathControllerTest`
Expected: compilation failure.

- [x] **Step 3: Implement**

```java
package com.foodbytes.controller;

import com.foodbytes.dto.PipsPathClearRequest;
import com.foodbytes.dto.PipsPathMapRequest;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.PipGameException;
import com.foodbytes.service.PipsPathService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.function.Supplier;

/**
 * MPP-49: Pip's Path for the caller only (see PipsPathService). No user parameter anywhere - every call
 * reads and writes the principal's own maps, progress and sprinkles.
 */
@RestController
@RequestMapping("/api/pet/games/pips-path")
@RequiredArgsConstructor
public class PipsPathController {

    private final PipsPathService pipsPathService;

    @GetMapping
    public ResponseEntity<?> state(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return run(userPrincipal, () -> pipsPathService.state(userPrincipal.getId()));
    }

    @PostMapping("/maps")
    public ResponseEntity<?> issue(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                   @Valid @RequestBody(required = false) PipsPathMapRequest request) {
        return run(userPrincipal, () -> pipsPathService.issue(userPrincipal.getId(),
                request == null ? null : request.getFamily(),
                request == null ? null : request.getDifficulty()));
    }

    @PostMapping("/maps/{mapId}/clear")
    public ResponseEntity<?> clear(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                   @PathVariable Long mapId,
                                   @Valid @RequestBody PipsPathClearRequest request) {
        return run(userPrincipal, () -> pipsPathService.clear(userPrincipal.getId(), mapId, request.getPath()));
    }

    private static ResponseEntity<?> run(UserPrincipal userPrincipal, Supplier<Object> call) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        try {
            return ResponseEntity.ok(call.get());
        } catch (PipGameException e) {
            return ResponseEntity.status(statusOf(e.getReason())).body(Map.of("error", e.getMessage()));
        }
    }

    static HttpStatus statusOf(PipGameException.Reason reason) {
        return switch (reason) {
            case UNKNOWN_FAMILY, BAD_DIFFICULTY -> HttpStatus.BAD_REQUEST;
            case LOCKED -> HttpStatus.FORBIDDEN;
            case NOT_FOUND -> HttpStatus.NOT_FOUND;
            case INVALID_PATH -> HttpStatus.UNPROCESSABLE_ENTITY;
            case GENERATION_FAILED -> HttpStatus.SERVICE_UNAVAILABLE;
        };
    }

    /** No @ControllerAdvice in this codebase - same {error} shape as PetStationController. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
```

- [x] **Step 4: Run it green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PipsPathControllerTest`
Expected: `BUILD SUCCESS`.

The end-to-end check against a running app is Phase 5.

---

## Phase 5 — Local Docker test (before pushing)

Runs the finished backend as the full stack in Docker on localhost against the local `foodbytes-db`, then the developer signs in and drives the new API from the browser console. No source changes: if a check fails, go back to the phase that owns the bug, fix it there, and re-run this phase. Nothing is pushed until this phase passes.

### Task 16: Build and start the stack on localhost ✓

- Skill: none — local Docker operation (root `docker-compose.yml`, local DB only)

> Note: two pre-existing issues were fixed so the stack would start (developer-approved). (1) `2026-11-16-recipe-folders.sql` was applied to the LOCAL `foodbytes-db` only (Hibernate validate failed on missing `recipe_folder_items`); Railway untouched, still needs the migration before deploy. (2) Root `docker-compose.yml`: `api` service got network alias `backend` on `foodbytes-network`, because the dev nginx config proxies to `http://backend:8080`.

**Files:**
- Create: `.claude/contract/2026-11-17-pips-path-backend/local-test.js`

- [x] **Step 1: Free port 8080**

Stop any backend started with `mvn spring-boot:run` (it uses the same port).
Run: `Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue`
Expected: no output, or only the `com.docker.backend` process from an earlier `foodbytes-api` container.

- [x] **Step 2: Confirm the stack targets the local DB**

Run: `Select-String -Path .env -Pattern "^(DB_NAME|DB_USER|APP_URL)="`
Expected: `DB_NAME=foodbytes`, `DB_USER=foodbytes`, `APP_URL=http://localhost:3000`. The compose file pins `DB_HOST: db`, so the `api` container can only reach the `foodbytes-db` container, never Railway.

- [x] **Step 3: Build and start the API and web containers**

Run (repo root): `docker-compose up -d --build api client`
Expected: `foodbytes-db` is reused (already running and healthy), and `foodbytes-api` and `foodbytes-client` are built and `Started`.

- [x] **Step 4: Confirm everything is on localhost**

Run: `docker ps --format "{{.Names}} {{.Status}} {{.Ports}}"`
Expected: three containers `Up`: `foodbytes-db` on `3306`, `foodbytes-api` on `8080`, `foodbytes-client` on `3000->80`.

Run: `docker logs foodbytes-api --tail 80`
Expected: a `Started …Application` line, and no `SchemaManagementException` or `Schema-validation` error (this proves the entities match the applied migration).

Run: `Invoke-RestMethod http://localhost:8080/api/health`
Expected: a JSON body whose `version` is the version currently in `pom.xml` (the bump happens in Phase 6).

Run: `(Invoke-WebRequest http://localhost:3000 -UseBasicParsing).StatusCode`
Expected: `200`.

Run: `curl.exe -s -o NUL -w "%{http_code}" http://localhost:8080/api/pet/games/pips-path`
Expected: `401`. The endpoint exists and requires sign-in.

- [x] **Step 5: Write the console test script**

Create `local-test.js` in this plan folder:

```js
// Pip's Path local test (2026-11-17-pips-path-backend).
// Paste into the browser devtools console on http://localhost:3000 AFTER signing in, then run:
//   await pipsPathTest()      - one map: issue, bad path, clear, retry, locked replay, state
//   await pipsPathCapTest()   - eleven clears in a row: payouts stop at the 50-a-day cap
const BASE = '/api/pet/games/pips-path';

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

// Same rules as the server: start on S, orthogonal steps, open tiles only, visit every open tile once.
function solve(rows) {
  const W = rows[0].length, H = rows.length, cells = rows.join('');
  const open = [...cells].map(c => c !== '#');
  const start = cells.indexOf('S');
  const total = open.filter(Boolean).length;
  const seen = open.map(() => false);
  const path = [start];
  seen[start] = true;
  const nb = i => {
    const x = i % W, y = Math.floor(i / W), out = [];
    if (y > 0) out.push(i - W);
    if (y < H - 1) out.push(i + W);
    if (x > 0) out.push(i - 1);
    if (x < W - 1) out.push(i + 1);
    return out.filter(j => open[j]);
  };
  const reachable = head => {           // every unvisited tile still reachable from the head?
    const hit = seen.map(() => false), queue = [head];
    hit[head] = true;
    let found = 0;
    while (queue.length) for (const j of nb(queue.pop())) if (!seen[j] && !hit[j]) { hit[j] = true; found++; queue.push(j); }
    return found === total - path.length;
  };
  const dfs = head => {
    if (path.length === total) return true;
    if (!reachable(head)) return false;
    for (const j of nb(head)) {
      if (seen[j]) continue;
      seen[j] = true; path.push(j);
      if (dfs(j)) return true;
      path.pop(); seen[j] = false;
    }
    return false;
  };
  return dfs(start) ? path : null;
}

async function pipsPathTest() {
  const show = (label, r) => console.log(label, '→', r.status, r.body);
  show('state', await call('GET', ''));
  const map = await call('POST', '/maps', {});
  show('new map (expect 200)', map);
  console.log(map.body.rows.join('\n'));
  const path = solve(map.body.rows);
  console.log('solution', path);
  show('bad path (expect 422)', await call('POST', `/maps/${map.body.mapId}/clear`, { path: path.slice(0, 2) }));
  show('clear (expect paid 5 unless at the cap)', await call('POST', `/maps/${map.body.mapId}/clear`, { path }));
  show('retry (expect alreadyCleared true, paid 0)', await call('POST', `/maps/${map.body.mapId}/clear`, { path }));
  show('replay difficulty 10 (expect 403 until difficulty 9 is cleared)', await call('POST', '/maps', { family: 'garden-path', difficulty: 10 }));
  show('somebody else\'s / missing map (expect 404)', await call('POST', '/maps/999999999/clear', { path }));
  show('state after', await call('GET', ''));
}

async function pipsPathCapTest() {
  for (let n = 1; n <= 11; n++) {
    const m = await call('POST', '/maps', {});
    const r = await call('POST', `/maps/${m.body.mapId}/clear`, { path: solve(m.body.rows) });
    console.log(`#${n}`, m.body.mode, `d${m.body.difficulty}`, `${m.body.width}x${m.body.height}`,
                'paid', r.body.paid, 'capped', r.body.capped, 'today', r.body.earnedToday, 'balance', r.body.balance);
  }
}
```

Run: `Get-ChildItem .claude\contract\2026-11-17-pips-path-backend\local-test.js`
Expected: the file exists.

### Task 17: Sign in and test the API (developer) ✓ — developer ran `pipsPathTest()` and `pipsPathCapTest()` on localhost 2026-11-17: all expectations passed. Playing the game by hand still happens on the MPP-49 frontend ticket.

- Skill: none — the developer signs in with their own Google account; the executor waits for the results

**Files:**
- (none — reads only, plus game rows written by the developer's own test plays in the local DB)

- [x] **Step 1: Sign in**

Open http://localhost:3000 and sign in with Google.
Expected: Google returns to http://localhost:3000, signed in, with the account menu showing the current version.
If Google shows **`redirect_uri_mismatch`**: add `http://localhost:8080/login/oauth2/code/google` to the OAuth client's authorised redirect URIs in Google Cloud Console, wait a minute and retry. If it shows **`invalid_client`**: `GOOGLE_CLIENT_ID` in `.env` did not reach the container; run `docker-compose up -d --force-recreate api`.

- [x] **Step 2: Run the single-map test**

Open devtools (F12) → Console, paste the whole of `local-test.js`, then run `await pipsPathTest()`.
Expected, in order:
- `state` → `200`, `currentChapter 1` for a first-time player, `next.mode "CHAPTER"`, `perClear 5`, `dailyCap 50`.
- `new map` → `200` with `mapId`, `rows`, `width ≤ 6`, and exactly one `S` in the printed grid.
- `bad path` → `422` with an `error` message.
- `clear` → `200`, `paid 5`, `capped false`, `earnedToday` up by 5, `balance` up by 5.
- `retry` → `200`, `alreadyCleared true`, `paid 0`, `balance` unchanged.
- `replay difficulty 10` → `403` "That level is still locked." (for a player below difficulty 9).
- missing map → `404`.
- `state after` → the family's `highestCleared` is 1 higher.

- [x] **Step 3: Run the cap test**

Run `await pipsPathCapTest()`.
Expected: difficulties climb 2, 3, 4 … (board sizes grow to 6×7); `paid 5` until `today` reaches 50, then `paid 0, capped true`; after difficulty 10, rows show `ENDLESS`. Each map solves within a second or two.

- [x] **Step 4: Check the database (no personal data)**

Run: `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "SELECT mode, difficulty, COUNT(*) AS maps, SUM(cleared_at IS NOT NULL) AS cleared FROM pet_game_maps GROUP BY mode, difficulty; SELECT family, highest_cleared, refresher_through FROM pet_game_progress; SELECT COUNT(*) AS payouts, SUM(amount) AS total FROM pet_sprinkles WHERE source_type = 'GAME_CLEAR';"`
Expected: map rows for the plays above, with every played map cleared; one progress row `garden-path` with `highest_cleared` matching the last state; `GAME_CLEAR` payouts summing to at most 50 for today. These queries only touch the new game tables, so no user details are read.

- [x] **Step 5: Report back**

Paste the console output (or say which line misbehaved) into the session. On a failure the executor fixes it in the owning Phase 2–4 task and repeats Task 16 Step 3 (`docker-compose up -d --build api`) and this task.

- [x] **Step 6 (optional): Reset the game test data**

Only if you want to replay chapter 1 from scratch. Nothing else uses these tables yet.
Run: `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "DELETE FROM pet_sprinkles WHERE source_type = 'GAME_CLEAR'; DELETE FROM pet_game_progress; DELETE FROM pet_game_maps;"`
Expected: no error. The containers can stay running for the frontend ticket; stop them with `docker-compose stop api client` before using `mvn spring-boot:run` on port 8080 again.

---

## Phase 6 — Final verification

No production changes beyond the version bump — only sanity-checks that the cumulative work is clean.

### Task 18 (M.1): Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. This ticket is a Story → bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — 2026-11-17-pips-path-backend: Pip's Path backend — server-generated, solver-proven Garden Path maps (difficulty 1–10), path-checked clears, per-person progress, 5 sprinkles per clear capped at 50/day` (use the child's `MPP-<n>` instead of the slug if the ticket exists by then).

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 19 (M.2): Layering and stale-reference greps ✓

- Skill: none — read-only audit

- [x] **Step 1: No repository or EntityManager in the new controller**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\controller\PipsPathController.java -Pattern "Repository|EntityManager"`
Expected: zero hits.

- [x] **Step 2: Pure core stays free of Spring data and JPA**

Run: `Select-String -Path foodbytes-app\foodbytes-api\src\main\java\com\foodbytes\service\game\*.java -Pattern "jakarta.persistence|Repository|Transactional"`
Expected: zero hits.

- [x] **Step 3: No client level data was added**

Run: `Select-String -Path foodbytes-app\client\src -Recurse -Pattern "garden-01" -ErrorAction SilentlyContinue`
Expected: zero hits.

### Task 20 (M.3): Go-live file is current ✓

- Skill: none — MPP-15 local-first check

- [x] **Step 1: Check**

Run: `node foodbytes-app/database/build-golive.mjs --check`
Expected: `Go-live OK`.

### Task 21 (M.4): Full backend suite ✓

- Skill: none — QA gate

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors (count grows from the previous total by the new tests).

### Task 22 (M.5): Production build ✓

- Skill: none — QA gate

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors (unchanged client, run to confirm the version bump did not break the build).

### Task 23 (M.6): PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/2026-11-17-pips-path-backend/pr-description.md`

- [x] **Step 1: Write it**

Include:
- Link to `plan.md` in this folder; the new version from Task 18.
- Branch `feature/MPP-49-pips-path-backend`, to be merged into `AI_Master` (not `master`).
- Summary: endpoints table (from `plan.md` → Data shapes → HTTP contract), generator approach, cap rule.
- Migrations: MPP-42 then `2026-11-17-mpp49-pips-path-games.sql`, applied to local `foodbytes-db`; Railway gets both via `mpp15-railway-golive.sql` at the MPP-15 merge, MPP-42 (row 12) strictly before MPP-49 (row 13).
- Verification: each test class's result, the generator band test times per difficulty, and any calibration change from Task 6 (old → new), and the local Docker test results from Tasks 16–17.
- Convention note: "New puzzle families implement `PuzzleFamily` as a Spring bean in `service/game`; the registry, sequencer, clear endpoint and payout need no change."
- Suggested commit subject: `MPP-<n>: Pip's Path backend — generated Garden Path maps, checked clears, progress, sprinkles` (the child's key once it exists).

---

## Self-review

**Spec coverage:**
- Grid model, solver, path checker — Tasks 3, 4.
- Garden Path generator + difficulty table 1–10 — Tasks 5, 6.
- Family registry — Task 7.
- Sequencer (chapter, refreshers, endless) — Task 8.
- Work on a new branch off `AI_Master` — Task 0.
- Migration (tables + CHECK), go-live row, local apply incl. MPP-42 — Tasks 1, 2.
- Entities + repositories + daily sum — Tasks 9, 10.
- `SprinklePolicy` / `SprinkleSource` cap rule; rates DTO — Tasks 9, 11, 12.
- `PipsPathService` — Task 14. `PipsPathController` — Task 15. DTOs — Task 13.
- Backend tests (fixtures, calibration, bands × seeds with time budget, sequencer, policy, service, controller) — Tasks 3–8, 11, 12, 14, 15.
- Local Docker end-to-end test (stack on localhost, sign-in, console test) — Tasks 16, 17.
- MINOR bump, CHANGELOG, PR description — Tasks 18, 23.

**Placeholder scan:** no `TBD`, `TODO` or "implement later". Every step has code or a `Run:`/`Expected:` pair. The conditional instruction (Task 6 calibration) states exactly what to change and how to verify.

**Type / name consistency:** `GridMap.parse/fromLayout/rows/layout/neighbours/adjacent/cells`, `GardenPathSolver.countSolutions/isValidClear`, `DifficultyBand.countLimit/accepts/UNBOUNDED`, `GardenPathBands.of/MIN_DIFFICULTY/MAX_DIFFICULTY`, `GardenPathGenerator.generate/MAX_ATTEMPTS/NODE_BUDGET`, `PuzzleFamily.id/chapter/generate/isValidClear`, `PuzzleFamilyRegistry.ordered/byId`, `PipsPathSequencer.next/currentChapter/isEndless/isUnlocked/CHAPTER_LEVELS`, `SprinklePolicy.GAME_CLEAR/GAME_DAILY_CAP/gameClearAmount/dublinDayUtc`, `PetSprinkleRepository.sumAmountByUserIdAndSourceTypeBetween`, `PipGameException.Reason` values, DTO fields and the endpoint paths `/api/pet/games/pips-path`, `/maps`, `/maps/{mapId}/clear` are used identically across tasks and match `plan.md` → Data shapes (`PipsPathSlotDTO.difficulty` is `Integer`, per the dated amendment there). `GridMap.MAX_COLS` lives on `GridMap` (plan listed it beside the bands; the value 6 is the same).

**Phase boundary cleanliness:**
- Phase 1: a new branch, then SQL and docs only; the Java build is untouched and the local DB has the tables before any entity maps them.
- Phase 2: new pure classes plus their tests; nothing references them from Spring wiring except two `@Component`s with no dependents, so the app still starts.
- Phase 3: entities match the applied schema; new repository methods are unused; existing tests updated for the DTO's new fields.
- Phase 4: service and controller complete the feature; their tests are green.
- Phase 5: no source changes; containers built from the Phase 4 code, plus one test script in the plan folder.
- Phase 6: bump and checks only.
