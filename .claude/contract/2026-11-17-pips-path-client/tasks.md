# Tasks: Pip's Path client (Play a game, picker, chapter map, Garden Path board)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-17

**Goal:** Tap Pip → "Play a game" → picker → chapter map → a server-issued Garden Path board in the theme's skin, with server-checked clears that pay 5 ✨ (cap 50/day), plus a backend rule that hands back an open uncleared map per slot, and the mockup brought in step.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/client/src/constants/pipsPath.js` — family id, modes, screens, keys, skin copy, offer copy, reward line, timings.
- `foodbytes-app/client/src/utils/pipsPath.js` — pure engine (port of the mockup's `pp-engine`, no solver).
- `foodbytes-app/client/src/utils/pipsPath.check.mjs` — node check for the engine and the reward line.
- `foodbytes-app/client/src/services/pipsPathService.js` — `getState`, `issueMap`, `clearMap`.
- `foodbytes-app/client/src/hooks/usePipsPath.js` — state read, issue, clear, four async states.
- `foodbytes-app/client/src/hooks/usePipsPathRun.js` — the run, facing, frozen-after-clear rule.
- `foodbytes-app/client/src/hooks/usePipsPathInput.js` — pointer drag/tap, keyboard activation, keys.
- `foodbytes-app/client/src/hooks/useGameOffer.js` — the bubble offer flag.
- `foodbytes-app/client/src/components/pet/games/pipsPathArt.jsx` — skin art per Pip line (JSX).
- `foodbytes-app/client/src/components/pet/games/PipsPath.css` — sheet, picker, map, board styles.
- `foodbytes-app/client/src/components/pet/games/PipsPathBoard.jsx` — the board screen.
- `foodbytes-app/client/src/components/pet/games/PipsPathClearCard.jsx` — reward / saving / error card.
- `foodbytes-app/client/src/components/pet/games/PipsPathMap.jsx` — chapter map screen.
- `foodbytes-app/client/src/components/pet/games/GamePicker.jsx` — games list screen.
- `foodbytes-app/client/src/components/pet/games/PipGamesView.jsx` — the sheet, screen state, API wiring.
- `foodbytes-app/client/src/components/pet/games/GameOfferActions.jsx` — Play a game / Not now.
- `foodbytes-app/client/src/components/pet/games/PipTapButton.jsx` — the button over Pip.

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetGameMapRepository.java` — three open-map queries.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PipsPathService.java` — `openMap`, `toDto`, reuse in `issue`.
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PipsPathServiceTest.java` — reuse tests.
- `foodbytes-app/client/package.json` — `check:games` script; version.
- `foodbytes-app/client/src/contexts/PetContext.jsx` — `applySprinkles`.
- `foodbytes-app/client/src/styles/themes/default.css`, `cyberpunk.css`, `parchment.css` — `--pp-*` tokens.
- `foodbytes-app/client/scripts/check-themes.mjs` — `PP_PAIRS`.
- `foodbytes-app/client/src/utils/pipBubble.js` + `pipBubble.check.mjs` — `offerLine`.
- `foodbytes-app/client/src/components/pet/room/roomLayout.js` + `room.check.mjs` — `pipHitBox`.
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` + `PetRoom.css` — `games` prop, Pip button, games overlay.
- `foodbytes-app/client/src/components/pet/PetView.jsx` — offer wiring, `games` prop.
- `foodbytes-app/mockup/pips-path.html`, `foodbytes-app/mockup/README.md` — mockup sync.
- `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump.

**Deleted:** (none)

---

## Phase 1 — Backend: reuse an open map per slot

A self-contained backend change on a new branch: three derived queries and a lookup in `issue`, proven by Mockito tests. The phase ends with `PipsPathServiceTest` green and no client change, so it is a safe stop.

### Task 1: Create the client branch ✓

- Skill: none — git bookkeeping

**Files:** (none)

- [x] **Step 1: Confirm the backend branch is clean and branch off it**

Run: `cd E:\Webdesign\The-Pre-Aisle-Plan; git status --short; git branch --show-current`
Expected: branch `feature/MPP-49-pips-path-backend`, and `git status` lists only `.claude/contract/2026-11-17-pips-path-client/`. If anything else is uncommitted, stop and ask the developer (do not commit, stash or discard it).

Run: `git switch -c feature/MPP-49-pips-path-client`
Expected: `Switched to a new branch 'feature/MPP-49-pips-path-client'`.

### Task 2: Add the open-map queries to PetGameMapRepository ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/PetGameMapRepository.java`

- [x] **Step 1: Add three derived queries**

Add `import com.foodbytes.model.GameMode;` and, below `findByIdAndUserId`:

```java
    /** CHAPTER slot (sequencer level or a replay): the newest uncleared map of that family and difficulty. */
    Optional<PetGameMap> findFirstByUserIdAndFamilyAndDifficultyAndModeAndClearedAtIsNullOrderByIdDesc(
            Long userId, String family, int difficulty, GameMode mode);

    /** REFRESHER slot: difficulty is rolled at issue, so the slot is (family, chapter). */
    Optional<PetGameMap> findFirstByUserIdAndFamilyAndModeAndChapterAndClearedAtIsNullOrderByIdDesc(
            Long userId, String family, GameMode mode, Integer chapter);

    /** ENDLESS slot: any open endless map. */
    Optional<PetGameMap> findFirstByUserIdAndModeAndClearedAtIsNullOrderByIdDesc(Long userId, GameMode mode);
```

- [x] **Step 2: Compile**

Run: `cd foodbytes-app\foodbytes-api; mvn -q compile`
Expected: `BUILD SUCCESS`, no output from `-q` beyond warnings. (Use the env prefix from CLAUDE.md → "Running the backend locally" for `JAVA_HOME` / `PATH`.)

### Task 3: Reuse the open map in PipsPathService.issue (TDD) ✓

- Skill: java-backend

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PipsPathService.java:62-94`
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/service/PipsPathServiceTest.java`

- [x] **Step 1: Write the failing tests**

Add after `issue_unknownFamilyAndHalfRequests_areRejected`. It uses the class's existing `maps` and `progress` mocks and `USER`; every import it needs (`GameMode`, `PetGameProgress`, `Optional`, `never`, `any`) is already in the file. With no stubbing, Mockito returns `Optional.empty()` from the new queries, so the existing issue tests keep generating:

```java
    private static PetGameMap openMap(long id, String layout, int w, int h, int difficulty, GameMode mode, Integer chapter) {
        PetGameMap m = new PetGameMap();
        m.setId(id); m.setUserId(USER); m.setFamily("garden-path"); m.setDifficulty(difficulty);
        m.setMode(mode); m.setChapter(chapter); m.setSeed(1L); m.setWidth(w); m.setHeight(h); m.setLayout(layout);
        return m;
    }

    @Test
    void issue_nextSlotWithAnOpenMap_returnsItAndGeneratesNothing() {
        when(maps.findFirstByUserIdAndFamilyAndDifficultyAndModeAndClearedAtIsNullOrderByIdDesc(USER, "garden-path", 1, GameMode.CHAPTER))
                .thenReturn(Optional.of(openMap(41L, "S../.../...", 3, 3, 1, GameMode.CHAPTER, 1)));

        PipsPathMapDTO dto = service.issue(USER, null, null);

        assertThat(dto.getMapId()).isEqualTo(41L);
        assertThat(dto.getRows()).containsExactly("S..", "...", "...");
        assertThat(dto.getMode()).isEqualTo("CHAPTER");
        verify(maps, never()).save(any(PetGameMap.class));
    }

    @Test
    void issue_replayWithAnOpenMap_reusesIt() {
        PetGameProgress p = new PetGameProgress(USER, "garden-path");
        p.setHighestCleared(3);
        when(progress.findByUserId(USER)).thenReturn(List.of(p));
        when(maps.findFirstByUserIdAndFamilyAndDifficultyAndModeAndClearedAtIsNullOrderByIdDesc(USER, "garden-path", 2, GameMode.CHAPTER))
                .thenReturn(Optional.of(openMap(42L, "..../..S./....", 4, 3, 2, GameMode.CHAPTER, 1)));

        PipsPathMapDTO dto = service.issue(USER, "garden-path", 2);

        assertThat(dto.getMapId()).isEqualTo(42L);
        assertThat(dto.getWidth()).isEqualTo(4);
        verify(maps, never()).save(any(PetGameMap.class));
    }

    @Test
    void issue_endlessWithAnOpenEndlessMap_reusesIt() {
        PetGameProgress p = new PetGameProgress(USER, "garden-path");
        p.setHighestCleared(10);
        when(progress.findByUserId(USER)).thenReturn(List.of(p));
        when(maps.findFirstByUserIdAndModeAndClearedAtIsNullOrderByIdDesc(USER, GameMode.ENDLESS))
                .thenReturn(Optional.of(openMap(43L, "S../.../...", 3, 3, 1, GameMode.ENDLESS, null)));

        PipsPathMapDTO dto = service.issue(USER, null, null);

        assertThat(dto.getMapId()).isEqualTo(43L);
        assertThat(dto.getMode()).isEqualTo("ENDLESS");
        verify(maps, never()).save(any(PetGameMap.class));
    }

    @Test
    void issue_noOpenMap_generatesAndSavesAsBefore() {
        PipsPathMapDTO dto = service.issue(USER, null, null);

        assertThat(dto.getDifficulty()).isEqualTo(1);
        verify(maps).save(any(PetGameMap.class));
        verify(maps).findFirstByUserIdAndFamilyAndDifficultyAndModeAndClearedAtIsNullOrderByIdDesc(USER, "garden-path", 1, GameMode.CHAPTER);
    }
```

(The REFRESHER branch cannot be reached through `issue` while only Garden Path ships, because the sequencer only returns a refresher once a second family exists; it is covered by the `switch` being exhaustive and is noted in `pr-description.md`.)

- [x] **Step 2: Run them and see the reuse tests fail**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PipsPathServiceTest`
Expected: `issue_nextSlotWithAnOpenMap_returnsItAndGeneratesNothing`, `issue_replayWithAnOpenMap_reusesIt`, `issue_endlessWithAnOpenEndlessMap_reusesIt` fail (a new map is saved); every other test passes.

- [x] **Step 3: Implement the lookup**

In `PipsPathService`, add `import java.util.Optional;`, then replace the body of `issue` after the slot is resolved:

```java
    public PipsPathMapDTO issue(Long userId, String familyId, Integer difficulty) {
        List<PuzzleFamily> ordered = registry.ordered();
        Map<String, FamilyProgress> progress = progressOf(userId);
        Slot slot = familyId == null && difficulty == null
                ? PipsPathSequencer.next(ordered, progress, ThreadLocalRandom.current())
                : replaySlot(familyId, difficulty, ordered, progress);
        // One open map per slot: coming back to a level hands back the map you left, never a reroll.
        Optional<PetGameMap> open = openMap(userId, slot);
        if (open.isPresent()) return toDto(open.get());

        PuzzleFamily family = family(slot.family());
        long seed = ThreadLocalRandom.current().nextLong();
        GridMap map;
        try {
            map = family.generate(slot.difficulty(), seed);
        } catch (PipGameException e) {
            if (e.getReason() == PipGameException.Reason.GENERATION_FAILED) {
                log.warn("Pip's Path generation failed: family={} difficulty={} seed={}",
                        family.id(), slot.difficulty(), seed);
            }
            throw e;
        }

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
        return toDto(mapRepository.save(row));
    }

    private Optional<PetGameMap> openMap(Long userId, Slot slot) {
        return switch (slot.mode()) {
            case CHAPTER -> mapRepository.findFirstByUserIdAndFamilyAndDifficultyAndModeAndClearedAtIsNullOrderByIdDesc(
                    userId, slot.family(), slot.difficulty(), GameMode.CHAPTER);
            case REFRESHER -> mapRepository.findFirstByUserIdAndFamilyAndModeAndChapterAndClearedAtIsNullOrderByIdDesc(
                    userId, slot.family(), GameMode.REFRESHER, slot.chapter());
            case ENDLESS -> mapRepository.findFirstByUserIdAndModeAndClearedAtIsNullOrderByIdDesc(userId, GameMode.ENDLESS);
        };
    }

    private static PipsPathMapDTO toDto(PetGameMap row) {
        List<String> rows = GridMap.fromLayout(row.getLayout(), row.getWidth(), row.getHeight()).rows();
        return new PipsPathMapDTO(row.getId(), row.getFamily(), row.getDifficulty(), row.getMode().name(),
                row.getChapter(), row.getWidth(), row.getHeight(), rows);
    }
```

Also update the class Javadoc's issue line (or the `issue` Javadoc) with one sentence: "An open (uncleared) map for the same slot is handed back instead of generating a new one."

- [x] **Step 4: Run the class green**

Run: `cd foodbytes-app\foodbytes-api; mvn test -Dtest=PipsPathServiceTest`
Expected: `Tests run: <n>, Failures: 0, Errors: 0`, `BUILD SUCCESS`.

---

## Phase 2 — Client foundations (pure code, API, tokens)

Everything the screens need, with nothing yet imported by the app: constants, the engine and its check, the service, the hook, the context setter and the theme tokens. The build stays green and the app looks unchanged, so this is a safe stop.

### Task 4: Create constants/pipsPath.js ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/pipsPath.js`

- [x] **Step 1: Write the constants (skin copy verbatim from the mockup's `pp-skins`)**

```js
import { PIP_LINE } from './pipLines.js'

/** MPP-49: Pip's Path, the first Pip game. The server issues and checks every map; this is client copy and tuning. */
export const PIPS_PATH_ENDPOINT = '/pet/games/pips-path'
export const PIPS_PATH_FAMILY = 'garden-path'
export const PIPS_PATH_LEVELS = 10
export const PIPS_PATH_MAX_COLS = 6 // 288 px ÷ 6 = 48 px tiles at a 320 px window

export const GAME_MODE = { CHAPTER: 'CHAPTER', REFRESHER: 'REFRESHER', ENDLESS: 'ENDLESS' }
export const GAMES_SCREEN = { PICKER: 'picker', MAP: 'map', BOARD: 'board' }
export const MAP_NODE = { CLEARED: 'cleared', CURRENT: 'current', LOCKED: 'locked' }

export const KEY_TO_DELTA = {
  ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0]
}
export const UNDO_KEYS = ['Backspace', 'z']
export const RESTART_KEY = 'r'

export const GAME_OFFER_LINE = 'Play a game with me? 🎲'
export const GAME_OFFER_PLAY = 'Play a game'
export const GAME_OFFER_NOT_NOW = 'Not now'
export const GAMES_TITLE = 'Games'
export const GAMES_CLOSE_LABEL = 'Close games'
export const PIPS_PATH_NAME = "Pip's Path"
export const PIPS_PATH_ENDLESS_SUB = 'Endless · random puzzles'
export const MORE_GAMES_TITLE = 'More games soon'
export const MORE_GAMES_SUB = "More of Pip's games are on the way"
export const ENDLESS_CARD = { title: 'Random puzzle', sub: 'A fresh puzzle from every game you have cleared.' }
export const REFRESHER_CARD = { title: 'Refresher', sub: 'A fresh puzzle from an earlier chapter.' }
export const GAMES_LOAD_ERROR = "Couldn't load your games."
export const GAMES_ISSUE_ERROR = "Couldn't start that puzzle."
export const GAMES_CLEAR_ERROR = "Couldn't save your clear."
export const GAMES_BAD_MAP = "This puzzle didn't load."
export const GAMES_RETRY = 'Try again'
export const GAMES_SAVING = 'Saving…'
export const NEXT_PUZZLE = 'Next puzzle'
export const BACK_TO_MAP = 'Map'

export const PIPS_PATH_SKINS = {
  [PIP_LINE.HERB]: {
    title: 'Garden Path', goal: 'Plant every patch!', trail: 'path', celebrate: 'bloom', stuckFx: 'droop', fxColor: '#f7a8c8',
    lines: { intro: 'Help me plant every patch! 🌱', half: 'Halfway there, keep going!',
             stuck: "Hmm, I'm stuck! Undo or start again?", cleared: 'The whole garden is growing! 🌸' }
  },
  [PIP_LINE.DRAGON]: {
    title: 'Ember Trail', goal: 'Light every flagstone!', trail: 'ember', celebrate: 'flare', stuckFx: 'dim', fxColor: '#ffb347',
    lines: { intro: 'Light every flagstone with me! 🔥', half: 'Half the lair is glowing!',
             stuck: 'My embers are fading… Undo or start again?', cleared: 'The whole lair is ablaze! 🐉' }
  },
  [PIP_LINE.ROBOT]: {
    title: 'Circuit Run', goal: 'Power every node!', trail: 'trace', celebrate: 'sweep', stuckFx: 'flicker', fxColor: null,
    lines: { intro: 'Power every node! ⚡', half: '50% charged. Keep routing!',
             stuck: 'ERROR: dead end. Undo or reboot?', cleared: 'Circuit complete! All systems go! 🤖' }
  }
}
// fxColor is skin art (falling petals / rising sparks), kept here so PipsPath.css holds no literal colour.

export const pipsPathSkin = (line) => PIPS_PATH_SKINS[line] ?? PIPS_PATH_SKINS[PIP_LINE.HERB]

/** The clear card's reward line, from the server's PipsPathClearDTO. */
export function rewardLine({ alreadyCleared, paid, capped, dailyCap }) {
  if (alreadyCleared) return 'Already counted'
  const full = `today's game sprinkles are full (${dailyCap}/${dailyCap})`
  if (paid > 0 && capped) return `+${paid} ✨ · ${full}`
  if (paid > 0) return `+${paid} ✨`
  return `Today's game sprinkles are full (${dailyCap}/${dailyCap})`
}

// Board geometry and motion (from the mockup's pp-ui block).
export const TOKEN_SCALE = 1.5 // Pip token height as a multiple of the tile size
export const PIP_BOX_RATIO = 200 / 240 // full Pip viewBox, width over height
export const PIP_FOOT_RATIO = 226 / 240 // feet sit this far down the viewBox
export const TOKEN_FOOT_DROP = 0.28 // feet sit this fraction of a tile below the tile centre
export const DRAG_STEP_RATIO = 0.5 // sample a fast drag at half-tile steps
export const FX_BIT_COUNT = 12
export const FX_STAGGER_STEPS = 4
export const FX_STAGGER_MS = 120
export const CELEBRATION_MS = 3200
export const MINI_GRID_CELLS = 9 // 3 × 3 preview on the picker card
export const MINI_MARK_CELLS = [3, 6, 7]
```

- [x] **Step 2: Smoke-import it**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {rewardLine, pipsPathSkin} from './src/constants/pipsPath.js'; console.log(rewardLine({paid:5,capped:false,dailyCap:50}), pipsPathSkin('robot').title, pipsPathSkin('x').title)"`
Expected: `+5 ✨ Circuit Run Garden Path`

### Task 5: Port the engine to utils/pipsPath.js with a node check ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/pipsPath.js`
- Create: `foodbytes-app/client/src/utils/pipsPath.check.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [x] **Step 1: Write the engine**

```js
import { KEY_TO_DELTA, MAP_NODE, PIPS_PATH_MAX_COLS } from '../constants/pipsPath.js'

/**
 * MPP-49: Pip's Path move rules — a port of the approved mockup's pp-engine (pips-path.html).
 * Pure: a run is { path: number[] } of cell indices (y * W + x), start first; every op returns a new run.
 * The server proves and re-checks maps, so the client has no solver.
 */

/** Parses a server map ({ width, height, rows }); throws Error('invalid map: …') on a malformed one. */
export function parseRows({ width, height, rows }) {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length !== height) throw new Error('invalid map: rows do not match the height')
  if (width > PIPS_PATH_MAX_COLS) throw new Error(`invalid map: ${width} columns, the maximum is ${PIPS_PATH_MAX_COLS}`)
  if (!rows.every(r => typeof r === 'string' && r.length === width && /^[S.#]+$/.test(r))) throw new Error('invalid map: bad row')
  const W = width, H = height, open = []
  let start = -1, starts = 0, total = 0
  rows.forEach((row, y) => [...row].forEach((c, x) => {
    const i = y * W + x
    open[i] = c !== '#'
    if (open[i]) total++
    if (c === 'S') { start = i; starts++ }
  }))
  if (starts !== 1) throw new Error(`invalid map: needs exactly one S, found ${starts}`)
  return { W, H, open, start, total }
}

export function neighbours(grid, i) {
  const { W, H, open } = grid, x = i % W, y = Math.floor(i / W), out = []
  if (x > 0) out.push(i - 1)
  if (x < W - 1) out.push(i + 1)
  if (y > 0) out.push(i - W)
  if (y < H - 1) out.push(i + W)
  return out.filter(j => open[j])
}

export const newRun = (grid) => ({ path: [grid.start] })
export const head = (run) => run.path[run.path.length - 1]
export const canStep = (grid, run, j) => grid.open[j] === true && !run.path.includes(j) && neighbours(grid, head(run)).includes(j)
export const step = (grid, run, j) => (canStep(grid, run, j) ? { path: [...run.path, j] } : run)
export function backtrackTo(run, j) {
  const k = run.path.indexOf(j)
  return k < 0 ? run : { path: run.path.slice(0, k + 1) }
}
export const undo = (run) => (run.path.length > 1 ? { path: run.path.slice(0, -1) } : run)
export const restart = (grid) => newRun(grid)
export const isCleared = (grid, run) => run.path.length === grid.total
export const isStuck = (grid, run) => !isCleared(grid, run) && !neighbours(grid, head(run)).some(j => !run.path.includes(j))
export const samePath = (a, b) => a.path.length === b.path.length && a.path.every((v, i) => v === b.path[i])

/** Moves one tile from Pip's head by an arrow / WASD key; returns the run unchanged off the board or into a blocked tile. */
export function stepByKey(grid, run, key) {
  const delta = KEY_TO_DELTA[key]
  if (!delta) return run
  const h = head(run), x = (h % grid.W) + delta[0], y = Math.floor(h / grid.W) + delta[1]
  if (x < 0 || x >= grid.W || y < 0 || y >= grid.H) return run
  return step(grid, run, y * grid.W + x)
}

/** Which of the skin's lines Pip says now. */
export function bubbleKeyFor(grid, run) {
  if (isCleared(grid, run)) return 'cleared'
  if (isStuck(grid, run)) return 'stuck'
  return run.path.length >= Math.ceil(grid.total / 2) ? 'half' : 'intro'
}

/** A chapter-map node from the family's highest cleared difficulty. */
export function mapNodeStatus(difficulty, highestCleared) {
  if (difficulty <= highestCleared) return MAP_NODE.CLEARED
  return difficulty === highestCleared + 1 ? MAP_NODE.CURRENT : MAP_NODE.LOCKED
}
```

- [x] **Step 2: Write the check (fixtures from the mockup's `pp-levels`)**

```js
// Run: npm run check:games   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-49 Pip's Path move rules are
// pinned here against the approved mockup's levels. Mirrors pipBubble.check.mjs.
import assert from 'node:assert/strict'
import {
  backtrackTo, bubbleKeyFor, canStep, head, isCleared, isStuck, mapNodeStatus, newRun, parseRows, restart, step, stepByKey, undo
} from './pipsPath.js'
import { rewardLine } from '../constants/pipsPath.js'

const map = (rows) => ({ width: rows[0].length, height: rows.length, rows })
const walk = (grid, run, cells) => cells.reduce((r, j) => step(grid, r, j), run)

// garden-01: 3×3, S top-left, a snake clears it.
const g1 = parseRows(map(['S..', '...', '...']))
assert.equal(g1.start, 0)
assert.equal(g1.total, 9)
const snake = walk(g1, newRun(g1), [1, 2, 5, 4, 3, 6, 7, 8])
assert.ok(isCleared(g1, snake))
assert.equal(bubbleKeyFor(g1, snake), 'cleared')

// Moves: only orthogonal, open, unvisited neighbours of the head.
assert.equal(canStep(g1, newRun(g1), 4), false) // diagonal
assert.equal(canStep(g1, newRun(g1), 2), false) // not adjacent
assert.deepEqual(step(g1, newRun(g1), 4), newRun(g1))
const two = walk(g1, newRun(g1), [1, 2])
assert.equal(canStep(g1, two, 1), false) // already on the path
assert.deepEqual(backtrackTo(two, 1), { path: [0, 1] })
assert.deepEqual(backtrackTo(two, 7), two)
assert.deepEqual(undo(two), { path: [0, 1] })
assert.deepEqual(undo(newRun(g1)), newRun(g1)) // never below the start
assert.deepEqual(restart(g1), newRun(g1))

// Keys step from the head; off the board is a no-op.
assert.equal(head(stepByKey(g1, newRun(g1), 'ArrowRight')), 1)
assert.equal(head(stepByKey(g1, newRun(g1), 's')), 3)
assert.deepEqual(stepByKey(g1, newRun(g1), 'ArrowUp'), newRun(g1))
assert.deepEqual(stepByKey(g1, newRun(g1), 'q'), newRun(g1))

// garden-03 stuck walk from the mockup (STUCK_WALK = [9, 8, 4, 0]): rock at index 1.
const g3 = parseRows(map(['.#..', '....', '..S.', '....']))
assert.equal(g3.open[1], false)
const stuck = walk(g3, newRun(g3), [9, 8, 4, 0])
assert.ok(isStuck(g3, stuck))
assert.equal(bubbleKeyFor(g3, stuck), 'stuck')
assert.equal(bubbleKeyFor(g3, newRun(g3)), 'intro')

// Malformed maps throw instead of drawing nonsense.
assert.throws(() => parseRows(map(['.......'])), /invalid map/) // 7 columns
assert.throws(() => parseRows(map(['...', '...'])), /exactly one S/)
assert.throws(() => parseRows({ width: 3, height: 2, rows: ['S..'] }), /invalid map/)
assert.throws(() => parseRows(map(['S.x'])), /invalid map/)

// Chapter map nodes.
assert.equal(mapNodeStatus(3, 3), 'cleared')
assert.equal(mapNodeStatus(4, 3), 'current')
assert.equal(mapNodeStatus(5, 3), 'locked')
assert.equal(mapNodeStatus(1, 0), 'current')

// Reward line from the server's numbers.
assert.equal(rewardLine({ alreadyCleared: false, paid: 5, capped: false, dailyCap: 50 }), '+5 ✨')
assert.equal(rewardLine({ alreadyCleared: false, paid: 3, capped: true, dailyCap: 50 }), "+3 ✨ · today's game sprinkles are full (50/50)")
assert.equal(rewardLine({ alreadyCleared: false, paid: 0, capped: true, dailyCap: 50 }), "Today's game sprinkles are full (50/50)")
assert.equal(rewardLine({ alreadyCleared: true, paid: 0, capped: false, dailyCap: 50 }), 'Already counted')

console.log('Pip\'s Path engine OK')
```

- [x] **Step 3: Wire the script**

In `foodbytes-app/client/package.json` → `scripts`, after `"check:sprinkles"`: `"check:games": "node src/utils/pipsPath.check.mjs",`

- [x] **Step 4: Run it**

Run: `cd foodbytes-app\client; npm run check:games`
Expected: `Pip's Path engine OK`, exit 0.

### Task 6: Create services/pipsPathService.js ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/services/pipsPathService.js`

- [x] **Step 1: Write the service**

```js
import api from './api'
import { PIPS_PATH_ENDPOINT } from '../constants/pipsPath'

/**
 * MPP-49: Pip's Path for the signed-in player only (no user parameter anywhere).
 * PipsPathStateDTO = { families: [{ id, chapter, highestCleared, refresherThrough }], currentChapter, endless,
 *                      next: { family, difficulty|null, mode, chapter }, earnedToday, dailyCap, perClear }
 * PipsPathMapDTO   = { mapId, family, difficulty, mode, chapter, width, height, rows: string[] }
 * PipsPathClearDTO = { alreadyCleared, paid, capped, earnedToday, dailyCap, balance, progress }
 */
export const pipsPathService = {
  /** @param {{ signal?: AbortSignal }} [options] */
  async getState({ signal } = {}) {
    const response = await api.get(PIPS_PATH_ENDPOINT, { signal })
    return response.data
  },

  /**
   * {} = the sequencer's next slot; { family, difficulty } = an unlocked chapter level.
   * The server hands back your open map for that slot if you have one. 403 locked, 503 generation failed.
   */
  async issueMap(slot = {}) {
    const response = await api.post(`${PIPS_PATH_ENDPOINT}/maps`, slot)
    return response.data
  },

  /** Posts the full path (cell indices, start first). 422 = not a valid clear; a repeat is 200 with alreadyCleared. */
  async clearMap(mapId, path) {
    const response = await api.post(`${PIPS_PATH_ENDPOINT}/maps/${mapId}/clear`, { path })
    return response.data
  }
}

export default pipsPathService
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: Add applySprinkles to PetContext ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/contexts/PetContext.jsx:157-171` and the provider `value` (around line 200)

- [x] **Step 1: Add the setter after `applyRoomWrite`**

```js
  // MPP-49: a Pip's Path clear returns the new balance; swap it in (and cancel a GET in flight, as applyRoomWrite does).
  const applySprinkles = useCallback((sprinkles) => {
    petControllerRef.current?.abort()
    setPetLoading(false)
    setPet(current => (current ? { ...current, sprinkles } : current))
  }, [])
```

Add `applySprinkles,` to the provider value next to `applyRoomWrite,`, and one line to the header comment: `MPP-49: applySprinkles(balance) — a game clear's new balance.`

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 8: Create hooks/usePipsPath.js ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/usePipsPath.js`

- [x] **Step 1: Write the hook**

```js
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePet } from '../contexts/PetContext'
import { GAMES_CLEAR_ERROR, GAMES_ISSUE_ERROR, GAMES_LOAD_ERROR } from '../constants/pipsPath'
import pipsPathService from '../services/pipsPathService'

const messageOf = (err, fallback) => err?.response?.data?.error || fallback
const isCancel = (err) => err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED'

/**
 * MPP-49: the games sheet's server state. Mounted only while the sheet is open, so the state read
 * starts on open and its AbortController is aborted on close. issue / clear are writes: never
 * aborted; a mounted ref drops their result after unmount. A paid clear updates the header balance
 * through PetContext.applySprinkles and re-reads the state (progress, earned today).
 */
export default function usePipsPath() {
  const { applySprinkles } = usePet()
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [map, setMap] = useState(null)
  const [issuing, setIssuing] = useState(false)
  const [issueError, setIssueError] = useState(null)
  const [clearResult, setClearResult] = useState(null)
  const [clearing, setClearing] = useState(false)
  const [clearError, setClearError] = useState(null)
  const mountedRef = useRef(true)
  const readRef = useRef(null)

  const reload = useCallback(() => {
    readRef.current?.abort()
    const controller = new AbortController()
    readRef.current = controller
    setLoading(true)
    setError(null)
    pipsPathService.getState({ signal: controller.signal })
      .then(data => { if (mountedRef.current) setState(data) })
      .catch(err => { if (!isCancel(err) && mountedRef.current) setError(messageOf(err, GAMES_LOAD_ERROR)) })
      .finally(() => { if (mountedRef.current && readRef.current === controller) setLoading(false) })
  }, [])

  useEffect(() => {
    mountedRef.current = true
    reload()
    return () => {
      mountedRef.current = false
      readRef.current?.abort()
    }
  }, [reload])

  /** Resolves the issued map, or null after showing issueError. */
  const issue = async (slot = {}) => {
    setIssuing(true)
    setIssueError(null)
    try {
      const data = await pipsPathService.issueMap(slot)
      if (!mountedRef.current) return null
      setMap(data)
      setClearResult(null)
      setClearError(null)
      return data
    } catch (err) {
      if (mountedRef.current) setIssueError(messageOf(err, GAMES_ISSUE_ERROR))
      return null
    } finally {
      if (mountedRef.current) setIssuing(false)
    }
  }

  const clear = async (mapId, path) => {
    setClearing(true)
    setClearError(null)
    setClearResult(null)
    try {
      const data = await pipsPathService.clearMap(mapId, path)
      if (!mountedRef.current) return
      setClearResult(data)
      applySprinkles(data.balance)
      reload()
    } catch (err) {
      if (mountedRef.current) setClearError(messageOf(err, GAMES_CLEAR_ERROR))
    } finally {
      if (mountedRef.current) setClearing(false)
    }
  }

  const resetClear = () => {
    setClearResult(null)
    setClearError(null)
  }

  return { state, loading, error, reload, map, issuing, issueError, issue, clearResult, clearing, clearError, clear, resetClear }
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 9: Add the --pp-* tokens to every theme and to check:themes ✗ — check:themes exits 1 on the existing Default folder-chip pair (4.36, from commit 4af2726); no pp-* pair fails

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/styles/themes/default.css` (end of the pet token group)
- Modify: `foodbytes-app/client/src/styles/themes/cyberpunk.css`
- Modify: `foodbytes-app/client/src/styles/themes/parchment.css`
- Modify: `foodbytes-app/client/scripts/check-themes.mjs:56-140`

- [x] **Step 1: Copy the tokens verbatim from the mockup**

Copy the 14 `--pp-*` declarations from `foodbytes-app/mockup/pips-path.html`:
- lines 95–108 → `default.css`, inside `:root`, after the last `--pet-*` token, under a comment `/* MPP-49: Pip's Path board and chapter map chrome (skin art keeps its own palette) */`
- lines 293–306 → `cyberpunk.css`, inside `:root[data-theme="cyberpunk"]`, same comment
- lines 194–207 → `parchment.css`, inside `:root[data-theme="parchment"]`, same comment

No other token changes (Default must not drift).

- [x] **Step 2: Add the contrast pairs**

In `check-themes.mjs`, after `FOLDER_PAIRS`:

```js
// MPP-49: Pip's Path chrome — HUD on the board, map node text, the mode chip.
const PP_PAIRS = [
  ['pp-hud-text', 'pp-board-bg', 4.5],
  ['pp-node-text', 'pp-board-bg', 4.5],
  ['pp-node-text', 'pp-node-locked-bg', 4.5],
  ['pp-node-cleared-text', 'pp-node-cleared-bg', 4.5],
  ['pp-board-bg', 'pp-node-current-ring', 4.5],
]
```

and add `...PP_PAIRS,` after `...FOLDER_PAIRS,` in each of `PAIRS.default`, `PAIRS.cyberpunk`, `PAIRS.parchment`.

- [ ] **Step 3: Run the theme check**

Run: `cd foodbytes-app\client; npm run check:themes`
Expected: the one known `default|text-secondary|bg-secondary` WARN, then `Themes OK: 3 themes, 204 contrast pairs` (189 + 5 × 3). If any new pair fails, fix the token value in that theme file (never add an exception) and record the changed value in `pr-description.md`.

---

## Phase 3 — Game screens (not yet reachable)

The picker, map, board and sheet are built against the hooks from Phase 2. Nothing in the app renders them until Phase 4, so the build stays green and the room is unchanged at every step.

### Task 10: Port the skin art to pipsPathArt.jsx ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/games/pipsPathArt.jsx`

- [x] **Step 1: Write the art (SVG from the mockup's `pp-skins`, attributes in JSX case)**

```jsx
import { PIP_LINE } from '../../../constants/pipLines'

/**
 * MPP-49: Pip's Path skin art per Pip line (approved mockup pips-path.html → pp-skins). Like Pip's room
 * art it keeps its own palette in every theme; board chrome comes from --pp-* tokens. Every piece is a
 * 0 0 48 48 drawing; the board frame is stretched to fill.
 */
function Art({ children, stretch = false, className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false" preserveAspectRatio={stretch ? 'none' : undefined}>
      {children}
    </svg>
  )
}

const HERB = {
  Board: (p) => (
    <Art stretch {...p}>
      <rect x="1" y="1" width="46" height="46" rx="6" fill="#8a5a35" />
      <rect x="1" y="1" width="46" height="46" rx="6" fill="none" stroke="#6e4526" strokeWidth="2" />
      <path d="M4 12h40M4 24h40M4 36h40" stroke="#6e4526" strokeWidth="1" opacity="0.6" />
      <rect x="7" y="7" width="34" height="34" rx="3" fill="#5b3a24" />
    </Art>
  ),
  Tile: () => (
    <Art>
      <rect x="2" y="2" width="44" height="44" rx="6" fill="#7a4f30" />
      <circle cx="24" cy="24" r="4" fill="#d9c08a" />
      <path d="M22.5 22.5l3 3" stroke="#7a4f30" strokeWidth="1.2" strokeLinecap="round" />
    </Art>
  ),
  Mark: () => (
    <Art>
      <g className="pp-mark">
        <path d="M24 42V24" stroke="#4f9a3a" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 32c-8 1-12-4-12-9 7-1 12 2 12 9z" fill="#7cc95a" />
        <path d="M24 28c7 0 11-4 11-9-6-1-11 2-11 9z" fill="#7cc95a" />
        <g className="pp-mark-bloom" opacity="0">
          <circle cx="24" cy="14" r="4" fill="#f7a8c8" /><circle cx="17" cy="18" r="4" fill="#f7a8c8" />
          <circle cx="31" cy="18" r="4" fill="#f7a8c8" /><circle cx="19" cy="9" r="4" fill="#f7a8c8" />
          <circle cx="29" cy="9" r="4" fill="#f7a8c8" /><circle cx="24" cy="14" r="3.2" fill="#ffd34d" />
        </g>
      </g>
    </Art>
  ),
  Start: () => (
    <Art>
      <path d="M12 18h20l-2 20H14z" fill="#5b85c4" />
      <ellipse cx="22" cy="18" rx="10" ry="2.5" fill="#46689d" />
      <path d="M32 22l10-8" stroke="#5b85c4" strokeWidth="4" strokeLinecap="round" />
      <path d="M12 22c-5 0-5 10 0 10" fill="none" stroke="#5b85c4" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 11l4 3-3 4z" fill="#46689d" />
    </Art>
  )
}

const DRAGON = {
  Board: (p) => (
    <Art stretch {...p}>
      <rect x="1" y="1" width="46" height="46" rx="5" fill="#6d6457" />
      <rect x="1.5" y="1.5" width="45" height="45" rx="5" fill="none" stroke="#4a4239" strokeWidth="3" />
      <g stroke="#c9b48a" strokeWidth="1" opacity="0.25" fill="none">
        <path d="M8 14c8-4 14 4 22 0s8-2 10 2" /><path d="M8 28c6 4 12-2 20 2s10 0 12-3" /><path d="M12 38c6-3 10 2 18-1" />
      </g>
    </Art>
  ),
  Tile: () => (
    <Art>
      <rect x="2" y="2" width="44" height="44" rx="4" fill="#b9ad96" />
      <path d="M10 6l6 10-4 8M34 42l-5-9 6-7M30 6l-3 8 7 4" fill="none" stroke="#8c8170" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </Art>
  ),
  Mark: () => (
    <Art>
      <g className="pp-mark">
        <ellipse cx="24" cy="38" rx="14" ry="6" fill="#7a2e12" />
        <circle cx="16" cy="36" r="3.5" fill="#5a2009" /><circle cx="30" cy="37" r="4" fill="#5a2009" /><circle cx="23" cy="39" r="3" fill="#8f3a18" />
        <g className="pp-mark-flame" opacity="0.35">
          <path d="M24 8c2 6 9 9 9 17a9 9 0 0 1-18 0c0-4 2-6 4-9 0 3 1 4 2 5 1-4 1-8 3-13z" fill="#ff8a2a" />
          <path d="M24 22c1 3 4 4 4 8a4 4 0 0 1-8 0c0-3 3-4 4-8z" fill="#ffd34d" />
        </g>
      </g>
    </Art>
  ),
  Start: () => (
    <Art>
      <ellipse cx="24" cy="34" rx="18" ry="9" fill="#8a6a3e" />
      <ellipse cx="24" cy="32" rx="12" ry="5.5" fill="#5e4527" />
      <path d="M6 32c6-8 14-9 20-8M42 34c-5-8-10-10-16-8M10 40c8 4 20 4 28 0" fill="none" stroke="#a88650" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="24" cy="30" rx="5" ry="3.5" fill="#fffaf3" />
      <path d="M21 29h6" stroke="#e3d6bf" strokeWidth="1" strokeLinecap="round" />
    </Art>
  )
}

const ROBOT = {
  Board: (p) => (
    <Art stretch {...p}>
      <rect x="1" y="1" width="46" height="46" rx="4" fill="#0e1a14" />
      <g fill="none" stroke="#c8a24a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10h14l4 4h12M4 24h10l4-4h8M44 36H30l-4 4H8M44 14h-4l-4 4" />
      </g>
      <g fill="#c8a24a"><circle cx="4" cy="10" r="2" /><circle cx="4" cy="24" r="2" /><circle cx="44" cy="36" r="2" /><circle cx="44" cy="14" r="2" /></g>
    </Art>
  ),
  Tile: () => (
    <Art>
      <rect x="2" y="2" width="44" height="44" rx="5" fill="#1b2a33" />
      <circle cx="24" cy="24" r="12" fill="none" stroke="#2f4552" strokeWidth="3" />
      <circle cx="24" cy="24" r="3" fill="#2f4552" />
    </Art>
  ),
  Mark: () => (
    <Art>
      <g className="pp-mark">
        <rect x="4" y="4" width="40" height="40" rx="6" fill="#1b2a33" />
        <circle cx="24" cy="24" r="15" fill="none" stroke="#37e6ff" strokeWidth="3" />
        <circle cx="24" cy="24" r="9" fill="#0f1b22" />
        <circle className="pp-mark-led" cx="24" cy="24" r="4.5" fill="#9cff6a" opacity="0.4" />
      </g>
    </Art>
  ),
  Start: () => (
    <Art>
      <rect x="6" y="30" width="36" height="12" rx="3" fill="#22303f" />
      <rect x="10" y="26" width="28" height="6" rx="2" fill="#2d3f52" />
      <path d="M26 6L16 24h7l-2 10 11-18h-7z" fill="#ffd34d" />
    </Art>
  )
}

const SKIN_ART = { [PIP_LINE.HERB]: HERB, [PIP_LINE.DRAGON]: DRAGON, [PIP_LINE.ROBOT]: ROBOT }

/** The art set for a Pip line; an unknown line draws the herb set. */
export const skinArt = (line) => SKIN_ART[line] ?? HERB
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 11: Create hooks/usePipsPathRun.js ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/usePipsPathRun.js`

- [x] **Step 1: Write the hook**

```js
import { useRef, useState } from 'react'
import { KEY_TO_DELTA, RESTART_KEY, UNDO_KEYS } from '../constants/pipsPath'
import { backtrackTo, head, isCleared, isStuck, newRun, restart, samePath, step, stepByKey, undo } from '../utils/pipsPath'

/**
 * MPP-49: one attempt at a Pip's Path map. `grid` is fixed for the hook's life (the board is keyed by
 * mapId). runRef always holds the latest run, so a fast drag that fires several moves in one frame
 * applies them in order. After a clear the board freezes: taps and moves are ignored, Undo and
 * Restart still act (the R key too; arrow keys and Z do not).
 */
export default function usePipsPathRun(grid) {
  const [run, setRun] = useState(() => newRun(grid))
  const [facing, setFacing] = useState(1)
  const runRef = useRef(run)

  const apply = (next) => {
    const prev = runRef.current
    if (samePath(prev, next)) return false
    if (next.path.length > prev.path.length) {
      const dx = (head(next) % grid.W) - (head(prev) % grid.W)
      if (dx !== 0) setFacing(dx < 0 ? -1 : 1)
    }
    runRef.current = next
    setRun(next)
    return true
  }

  const tryTile = (i, allowBack) => {
    const current = runRef.current
    if (isCleared(grid, current)) return
    if (current.path.includes(i)) {
      if (allowBack) apply(backtrackTo(current, i))
      return
    }
    apply(step(grid, current, i))
  }

  /** Returns true when the key belongs to the board (the caller then prevents the default). */
  const onKey = (key) => {
    const frozen = isCleared(grid, runRef.current)
    if (Object.hasOwn(KEY_TO_DELTA, key)) {
      if (!frozen) apply(stepByKey(grid, runRef.current, key))
      return true
    }
    if (UNDO_KEYS.includes(key)) {
      if (!frozen) apply(undo(runRef.current))
      return true
    }
    if (key === RESTART_KEY) {
      apply(restart(grid))
      return true
    }
    return false
  }

  return {
    run,
    facing,
    cleared: isCleared(grid, run),
    stuck: isStuck(grid, run),
    tryTile,
    onKey,
    undoStep: () => apply(undo(runRef.current)),
    restartRun: () => apply(restart(grid))
  }
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 12: Create hooks/usePipsPathInput.js ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/usePipsPathInput.js`

- [x] **Step 1: Write the hook (port of the mockup's `wireBoard`)**

```js
import { useEffect, useRef } from 'react'
import { DRAG_STEP_RATIO } from '../constants/pipsPath'

const TILE_SELECTOR = '.pp-tile[data-i]'

/**
 * MPP-49: board input. pointerdown on a tile steps or backtracks to it and captures the pointer;
 * pointermove steps into every tile the pointer crosses (coalesced points, sampled at half-tile steps
 * so a fast swipe never skips); the listeners are removed on pointerup / pointercancel / unmount.
 * Keyboard activation of a tile (click with detail 0) and board keys go through tryTile / onKey.
 */
export default function usePipsPathInput({ boardRef, tryTile, onKey }) {
  const dragRef = useRef(null)

  useEffect(() => () => dragRef.current?.cleanup(), [])

  const tileAt = (x, y) => {
    const tile = document.elementFromPoint(x, y)?.closest(TILE_SELECTOR)
    return tile && boardRef.current?.contains(tile) ? Number(tile.dataset.i) : -1
  }

  const onPointerDown = (event) => {
    if (event.button !== 0 || dragRef.current) return
    const i = tileAt(event.clientX, event.clientY)
    const board = boardRef.current
    if (i < 0 || !board) return
    const drag = { id: event.pointerId, x: event.clientX, y: event.clientY }
    const visit = (x, y) => {
      const j = tileAt(x, y)
      if (j >= 0) tryTile(j, false)
    }
    const onMove = (e) => {
      if (e.pointerId !== drag.id) return
      const points = e.getCoalescedEvents?.() ?? []
      const size = board.querySelector(TILE_SELECTOR)?.offsetWidth || 1
      for (const p of points.length ? points : [e]) {
        const steps = Math.max(1, Math.ceil(Math.hypot(p.clientX - drag.x, p.clientY - drag.y) / (size * DRAG_STEP_RATIO)))
        for (let k = 1; k <= steps; k++) visit(drag.x + (p.clientX - drag.x) * k / steps, drag.y + (p.clientY - drag.y) * k / steps)
        drag.x = p.clientX
        drag.y = p.clientY
      }
    }
    const onEnd = (e) => { if (e.pointerId === drag.id) drag.cleanup() }
    drag.cleanup = () => {
      board.removeEventListener('pointermove', onMove)
      board.removeEventListener('pointerup', onEnd)
      board.removeEventListener('pointercancel', onEnd)
      if (board.hasPointerCapture?.(drag.id)) board.releasePointerCapture(drag.id)
      dragRef.current = null
    }
    board.setPointerCapture(event.pointerId)
    board.addEventListener('pointermove', onMove)
    board.addEventListener('pointerup', onEnd)
    board.addEventListener('pointercancel', onEnd)
    dragRef.current = drag
    tryTile(i, true)
  }

  // Keyboard activation only (Enter / Space on a focused tile); pointer input is handled above.
  const onClick = (event) => {
    const tile = event.target.closest(TILE_SELECTOR)
    if (tile && event.detail === 0) tryTile(Number(tile.dataset.i), true)
  }

  const onKeyDown = (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return false
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
    const handled = onKey(key)
    if (handled) event.preventDefault()
    return handled
  }

  return { onPointerDown, onClick, onKeyDown }
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 13: Create PipsPath.css ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/games/PipsPath.css`

- [x] **Step 1: Port the mockup CSS**

Copy `foodbytes-app/mockup/pips-path.html` lines 582–721 (Picker through the keyframes) into `PipsPath.css` under a header comment `/* MPP-49: Pip's Path — ported from mockup/pips-path.html. Chrome reads --pp-* / --pet-* tokens; skin art is JSX with its own palette. */`, then apply exactly these changes:
1. Replace both `@container frame (max-width: 400px)` and `@container frame (min-width: 720px)` with `@media (max-width: 400px)` and `@media (min-width: 720px)`.
2. Delete the `.frame[data-theme="cyberpunk"] .pp-trail--trace .pp-trail-line` rule and add `filter: drop-shadow(0 0 5px var(--pp-trail-glow));` to `.pp-trail--trace .pp-trail-line` (only the robot skin uses the trace trail).
3. In `.pp-board`, delete `background-image: var(--board-art); background-size: 100% 100%;` and add the board-art layer after it:
   ```css
   .pp-board-art { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 10px; pointer-events: none; }
   ```
   (it is the board's first child, so the positioned tiles paint above it in DOM order).
4. In `.pp-fx--bloom .pp-fx-bit` and `.pp-fx--flare .pp-fx-bit`, replace the literal `background: #f7a8c8;` / `background: #ffb347;` with `background: var(--fx-color);` (set inline from the skin's `fxColor`).
5. Add the motion rules at the end (replacing the mockup's `.frame.lowfx` / `.frame.is-still` / `.frame` media block, lines 735–743):
   ```css
   body.lowfx .pp-games *, body.lowfx .pp-games *::before, body.lowfx .pp-games *::after { animation: none !important; transition: none !important; }
   body.lowfx .pp-fx-bit { display: none; }
   body.lowfx .pp-trail-line, body.lowfx .pp-mark-led { filter: none !important; }
   @media (prefers-reduced-motion: reduce) {
     .pp-games *, .pp-games *::before, .pp-games *::after { animation: none !important; transition: none !important; }
     .pp-fx-bit { display: none; }
   }
   ```
6. Add the error and loading lines used by the screens:
   ```css
   .pp-status { margin: 12px 0; font-weight: 600; }
   .pp-error { margin: 8px 0; padding: 8px 12px; border-radius: 10px; background: var(--danger-hover-bg); color: var(--pet-error-text); font-weight: 700; }
   .pp-error .pip-checkin-btn { margin-left: 8px; }
   ```

- [x] **Step 2: Confirm no literal colour remains**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\games\PipsPath.css -Pattern "#[0-9a-fA-F]{3,8}\b|rgba?\("`
Expected: zero hits.

### Task 14: Create PipsPathClearCard and PipsPathBoard ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/games/PipsPathClearCard.jsx`
- Create: `foodbytes-app/client/src/components/pet/games/PipsPathBoard.jsx`

- [x] **Step 1: Write the clear card**

```jsx
import { BACK_TO_MAP, GAMES_RETRY, GAMES_SAVING, NEXT_PUZZLE, rewardLine } from '../../../constants/pipsPath'

/** MPP-49: under a cleared board — saving, then the server's reward line (or its error with Try again), Next puzzle and Map. */
function PipsPathClearCard({ clearing, result, error, issuing, onRetry, onNext, onMap }) {
  return (
    <div className="pp-clear-card" aria-live="polite">
      {clearing && <p className="pp-reward">{GAMES_SAVING}</p>}
      {!clearing && result && <p className="pp-reward">{rewardLine(result)}</p>}
      {!clearing && error && (
        <p className="pp-error" role="alert">
          {error}
          <button type="button" className="pip-checkin-btn" onClick={onRetry}>{GAMES_RETRY}</button>
        </p>
      )}
      <div className="pp-clear-actions">
        <button type="button" className="pip-checkin-btn pip-checkin-btn--primary" disabled={clearing || issuing} onClick={onNext}>{NEXT_PUZZLE}</button>
        <button type="button" className="pip-checkin-btn" onClick={onMap}>{BACK_TO_MAP}</button>
      </div>
    </div>
  )
}

export default PipsPathClearCard
```

- [x] **Step 2: Write the board**

```jsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PET_MOODS } from '../../../constants/pet'
import {
  CELEBRATION_MS, FX_BIT_COUNT, FX_STAGGER_MS, FX_STAGGER_STEPS, GAME_MODE, GAMES_BAD_MAP, PIPS_PATH_LEVELS,
  PIP_BOX_RATIO, PIP_FOOT_RATIO, TOKEN_FOOT_DROP, TOKEN_SCALE
} from '../../../constants/pipsPath'
import { useTheme } from '../../../contexts/ThemeContext'
import usePipsPathInput from '../../../hooks/usePipsPathInput'
import usePipsPathRun from '../../../hooks/usePipsPathRun'
import { bubbleKeyFor, canStep, head, parseRows } from '../../../utils/pipsPath'
import { prefersReducedMotion } from '../../../utils/reducedMotion'
import Pip from '../pip/Pip'
import PipsPathClearCard from './PipsPathClearCard'
import { skinArt } from './pipsPathArt'

/**
 * MPP-49: one Pip's Path board (keyed by mapId, so a new map is a fresh attempt). Three layers as in the
 * mockup: tile buttons with the skin's art, an SVG trail through the tile centres, and Pip as a token
 * moved by a transform transition. A clear freezes the board and posts the path once (onCleared);
 * Undo un-freezes it, and a second clear posts again (the server answers "already counted").
 */
function PipsPathBoard(props) {
  const [grid] = useState(() => {
    try { return parseRows(props.map) } catch { return null }
  })
  if (!grid) {
    return (
      <div className="pip-shop-body pp-board-area">
        <p className="pp-error" role="alert">{GAMES_BAD_MAP}</p>
        <button type="button" className="pip-checkin-btn" onClick={props.onBack}>← Map</button>
      </div>
    )
  }
  return <BoardPlay grid={grid} {...props} />
}

function BoardPlay({ grid, map, skin, herb, clear, onCleared, onRetryClear, onNext, onBack, issuing }) {
  const { lowFx } = useTheme()
  const { run, facing, cleared, stuck, tryTile, onKey, undoStep, restartRun } = usePipsPathRun(grid)
  const boardRef = useRef(null)
  const tileRefs = useRef([])
  const focusHeadRef = useRef(false)
  const postedRef = useRef(false)
  const [geo, setGeo] = useState(null)
  const [resizes, setResizes] = useState(0)
  const [bits, setBits] = useState(false)
  const input = usePipsPathInput({ boardRef, tryTile, onKey })
  const art = skinArt(herb.line)
  const still = lowFx || prefersReducedMotion()

  useEffect(() => {
    const observer = new ResizeObserver(() => setResizes(n => n + 1))
    observer.observe(boardRef.current)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    setGeo(measure(boardRef.current, tileRefs.current, run.path, geo === null || resizes !== geo.resizes, resizes))
    if (focusHeadRef.current) {
      focusHeadRef.current = false
      tileRefs.current[head(run)]?.focus({ preventScroll: true })
    }
  }, [run, resizes]) // eslint-disable-line react-hooks/exhaustive-deps -- geo is the previous measure

  useEffect(() => {
    if (cleared && !postedRef.current) {
      postedRef.current = true
      onCleared(run.path)
    } else if (!cleared) {
      postedRef.current = false
    }
  }, [cleared]) // eslint-disable-line react-hooks/exhaustive-deps -- post once per clear

  useEffect(() => {
    if (!cleared || still || !skin.fxColor) return undefined
    setBits(true)
    const timer = setTimeout(() => setBits(false), CELEBRATION_MS)
    return () => { clearTimeout(timer); setBits(false) }
  }, [cleared, still, skin.fxColor])

  const onKeyDown = (event) => { if (input.onKeyDown(event)) focusHeadRef.current = true }
  const order = new Map(run.path.map((cell, k) => [cell, k]))
  const hd = head(run)
  const fx = cleared ? skin.celebrate : stuck ? skin.stuckFx : ''
  const mood = cleared ? PET_MOODS.HAPPY : stuck ? PET_MOODS.BORED : PET_MOODS.CONTENT
  const title = map.mode === GAME_MODE.ENDLESS ? 'Endless' : map.mode === GAME_MODE.REFRESHER ? 'Refresher' : `${skin.title} · ${map.difficulty} / ${PIPS_PATH_LEVELS}`

  return (
    <>
      <div className="pp-hud">
        <div className="pp-hud-row">
          <button type="button" className="pip-shop-icon-btn" aria-label="Back to the map" onClick={onBack}>←</button>
          <h3 className="pp-hud-title">{title}</h3>
          {map.mode !== GAME_MODE.CHAPTER && <span className="pp-chip">{map.mode === GAME_MODE.ENDLESS ? 'Endless' : 'Refresher'}</span>}
        </div>
        <div className="pp-hud-row">
          <p className="pp-hud-count" aria-live="polite">{`${grid.total - run.path.length} tiles left`}</p>
          <button type="button" className={stuck ? 'pip-checkin-btn pp-pulse' : 'pip-checkin-btn'} onClick={undoStep}>↶ Undo</button>
          <button type="button" className="pip-checkin-btn" onClick={restartRun}>⟲ Restart</button>
        </div>
      </div>
      <div className="pip-shop-body pp-board-area">
        <div className="pet-bubble pp-board-bubble"><p className="pet-bubble-text" aria-live="polite">{skin.lines[bubbleKeyFor(grid, run)]}</p></div>
        <div className="pp-board-wrap" style={{ '--cols': grid.W }}>
          <div
            ref={boardRef}
            className={`pp-board${cleared ? ' is-cleared' : ''}${stuck ? ' is-stuck' : ''}${fx ? ` pp-fx--${fx}` : ''}`}
            role="group"
            aria-label={`Puzzle board, ${grid.W} by ${grid.H}`}
            onPointerDown={input.onPointerDown}
            onClick={input.onClick}
            onKeyDown={onKeyDown}
          >
            <art.Board className="pp-board-art" />
            {grid.open.map((isOpen, i) => (isOpen
              ? <Tile key={i} i={i} grid={grid} run={run} k={order.get(i)} isHead={i === hd} art={art} tileRefs={tileRefs} />
              : <div key={i} className="pp-tile pp-tile--rock" aria-hidden="true" />))}
            <svg className={`pp-trail pp-trail--${skin.trail}`} aria-hidden="true" viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}>
              <polyline className="pp-trail-line" points={geo && run.path.length > 1 ? geo.points : ''} />
            </svg>
            <div className={geo?.snap ? 'pp-pip-token is-snap' : 'pp-pip-token'} style={geo ? tokenStyle(geo, facing) : { visibility: 'hidden' }} aria-hidden="true">
              <div className="pp-pip-hop"><Pip line={herb.line} form={herb.form} outfit={herb.outfit} mood={mood} variant="full" /></div>
            </div>
            <div className="pp-fx-layer" aria-hidden="true">
              {bits && Array.from({ length: FX_BIT_COUNT }, (_, n) => (
                <i key={n} className="pp-fx-bit" style={{ '--x': Math.round((n + 0.5) * 100 / FX_BIT_COUNT), '--d': `${(n % FX_STAGGER_STEPS) * FX_STAGGER_MS}ms`, '--fx-color': skin.fxColor }} />
              ))}
            </div>
          </div>
        </div>
        {cleared && (
          <PipsPathClearCard
            clearing={clear.clearing} result={clear.clearResult} error={clear.clearError} issuing={issuing}
            onRetry={() => onRetryClear(run.path)} onNext={onNext} onMap={onBack}
          />
        )}
      </div>
    </>
  )
}

function Tile({ i, grid, run, k, isHead, art, tileRefs }) {
  const onPath = k !== undefined
  const isStart = i === grid.start
  const label = `Row ${Math.floor(i / grid.W) + 1}, column ${(i % grid.W) + 1}, ${isHead ? 'Pip is here' : onPath ? 'visited' : 'open'}`
  const cls = ['pp-tile', isStart && 'is-start', onPath && 'is-on', onPath && !isHead && !isStart && 'is-marked', canStep(grid, run, i) && 'is-next']
    .filter(Boolean).join(' ')
  return (
    <button ref={el => { tileRefs.current[i] = el }} type="button" className={cls} data-i={i} aria-label={label} style={{ '--n': onPath ? k : 0 }}>
      <span className="pp-tile-art"><art.Tile /></span>
      {isStart ? <span className="pp-tile-start"><art.Start /></span> : <span className="pp-tile-mark"><art.Mark /></span>}
    </button>
  )
}

/** Trail points and the head tile's box, measured from the laid-out tiles (px inside the board). */
function measure(board, tiles, path, snap, resizes) {
  const centre = (i) => [tiles[i].offsetLeft + tiles[i].offsetWidth / 2, tiles[i].offsetTop + tiles[i].offsetHeight / 2]
  const headTile = tiles[path[path.length - 1]]
  return {
    w: board.clientWidth,
    h: board.clientHeight,
    points: path.map(i => centre(i).map(n => n.toFixed(1)).join(',')).join(' '),
    head: centre(path[path.length - 1]),
    size: headTile.offsetWidth,
    snap,
    resizes
  }
}

function tokenStyle(geo, facing) {
  const h = geo.size * TOKEN_SCALE
  const w = h * PIP_BOX_RATIO
  const [cx, cy] = geo.head
  return {
    width: `${w}px`,
    height: `${h}px`,
    transform: `translate(${(cx - w / 2).toFixed(1)}px, ${(cy + geo.size * TOKEN_FOOT_DROP - h * PIP_FOOT_RATIO).toFixed(1)}px) scaleX(${facing})`
  }
}

export default PipsPathBoard
```

(The token snaps without a transition on its first placement and after a resize, because `measure` sets `snap` then; the next move clears it.)

- [x] **Step 3: Measure and build**

Run: `(Get-Content foodbytes-app\client\src\components\pet\games\PipsPathBoard.jsx | Measure-Object -Line).Lines`
Expected: under 200. If it is over 200, move `Tile`, `measure` and `tokenStyle` into `PipsPathTile.jsx` / `boardGeometry.js` beside it.

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 15: Create PipsPathMap ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/games/PipsPathMap.jsx`

- [x] **Step 1: Write the map screen**

```jsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PET_MOODS } from '../../../constants/pet'
import { ENDLESS_CARD, GAME_MODE, MAP_NODE, PIPS_PATH_FAMILY, PIPS_PATH_LEVELS, REFRESHER_CARD } from '../../../constants/pipsPath'
import { mapNodeStatus } from '../../../utils/pipsPath'
import Pip from '../pip/Pip'
import { skinArt } from './pipsPathArt'

const LEVELS = Array.from({ length: PIPS_PATH_LEVELS }, (_, n) => n + 1)

/** MPP-49: the chapter map — levels 1–10 (cleared / current / locked) joined by a dotted path, then the endless or refresher card. */
function PipsPathMap({ state, skin, herb, issuing, issueError, onPlayLevel, onPlayNext }) {
  const pathRef = useRef(null)
  const [points, setPoints] = useState('')
  const [resizes, setResizes] = useState(0)
  const family = state.families.find(f => f.id === PIPS_PATH_FAMILY)
  const highest = family?.highestCleared ?? 0
  const art = skinArt(herb.line)
  const card = state.endless ? ENDLESS_CARD : state.next?.mode === GAME_MODE.REFRESHER ? REFRESHER_CARD : null

  useEffect(() => {
    const observer = new ResizeObserver(() => setResizes(n => n + 1))
    observer.observe(pathRef.current)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const box = pathRef.current.getBoundingClientRect()
    setPoints([...pathRef.current.querySelectorAll('.pp-map-node')].map(node => {
      const r = node.getBoundingClientRect()
      return `${(r.left + r.width / 2 - box.left).toFixed(1)},${(r.top + r.height / 2 - box.top).toFixed(1)}`
    }).join(' '))
  }, [resizes, highest])

  return (
    <div className="pip-shop-body">
      <p className="pp-screen-sub">{skin.goal}</p>
      {issueError && <p className="pp-error" role="alert">{issueError}</p>}
      <div ref={pathRef} className="pp-map-path" style={{ '--n': PIPS_PATH_LEVELS }}>
        {LEVELS.map(d => (
          <div key={d} className="pp-map-cell">
            <MapNode d={d} status={mapNodeStatus(d, highest)} art={art} herb={herb} disabled={issuing} onPlay={onPlayLevel} />
          </div>
        ))}
        <svg className="pp-link" aria-hidden="true"><polyline points={points} /></svg>
      </div>
      {card && (
        <button type="button" className="pp-endless-card" disabled={issuing} onClick={onPlayNext}>
          <span className="pp-endless-icon" aria-hidden="true">🎲</span>
          <span><strong>{card.title}</strong><small>{card.sub}</small></span>
        </button>
      )}
    </div>
  )
}

function MapNode({ d, status, art, herb, disabled, onPlay }) {
  const label = `Puzzle ${d}, ${status}`
  if (status === MAP_NODE.LOCKED) {
    return <button type="button" className="pp-map-node is-locked" disabled aria-label={label}><span aria-hidden="true">🔒</span></button>
  }
  const current = status === MAP_NODE.CURRENT
  return (
    <button type="button" className={`pp-map-node is-${status}`} aria-label={label} disabled={disabled} onClick={() => onPlay(d)}>
      <span className="pp-node-n">{d}</span>
      {current
        ? <span className="pp-node-pip" aria-hidden="true"><Pip line={herb.line} form={herb.form} outfit={herb.outfit} mood={PET_MOODS.CONTENT} variant="mini" /></span>
        : <><span className="pp-node-check" aria-hidden="true">✓</span><span className="pp-node-mark" aria-hidden="true"><art.Mark /></span></>}
    </button>
  )
}

export default PipsPathMap
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 16: Create GamePicker ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/games/GamePicker.jsx`

- [x] **Step 1: Write the picker body**

```jsx
import { PET_MOODS } from '../../../constants/pet'
import {
  GAMES_RETRY, MINI_GRID_CELLS, MINI_MARK_CELLS, MORE_GAMES_SUB, MORE_GAMES_TITLE, PIPS_PATH_ENDLESS_SUB,
  PIPS_PATH_FAMILY, PIPS_PATH_LEVELS, PIPS_PATH_NAME
} from '../../../constants/pipsPath'
import Pip from '../pip/Pip'
import { skinArt } from './pipsPathArt'

/** MPP-49: the games list — Pip's Path (skin title, x / 10 or endless, progress bar) and a disabled "More games soon". */
function GamePicker({ state, loading, error, skin, herb, onRetry, onOpenGame }) {
  if (loading && !state) return <div className="pip-shop-body"><p className="pp-status" aria-busy="true">Loading…</p></div>
  if (error && !state) {
    return (
      <div className="pip-shop-body">
        <p className="pp-error" role="alert">{error}<button type="button" className="pip-checkin-btn" onClick={onRetry}>{GAMES_RETRY}</button></p>
      </div>
    )
  }
  const cleared = state.families.find(f => f.id === PIPS_PATH_FAMILY)?.highestCleared ?? 0
  const sub = state.endless ? PIPS_PATH_ENDLESS_SUB : `${skin.title} · ${cleared} / ${PIPS_PATH_LEVELS}`
  return (
    <div className="pip-shop-body">
      <button type="button" className="pp-game-card" onClick={onOpenGame}>
        <span className="pp-game-art"><MiniBoard herb={herb} /></span>
        <span>
          <span className="pp-game-title">{PIPS_PATH_NAME}</span>
          <span className="pp-game-sub">{sub}</span>
          <span className="pp-bar" role="progressbar" aria-label="Puzzles cleared" aria-valuemin="0" aria-valuemax={PIPS_PATH_LEVELS} aria-valuenow={cleared}>
            <i style={{ width: `${cleared * 100 / PIPS_PATH_LEVELS}%` }} />
          </span>
        </span>
      </button>
      <button type="button" className="pp-game-card" disabled>
        <span className="pp-game-art pp-game-art--soon" aria-hidden="true">🎲</span>
        <span><span className="pp-game-title">{MORE_GAMES_TITLE}</span><span className="pp-game-sub">{MORE_GAMES_SUB}</span></span>
      </button>
    </div>
  )
}

function MiniBoard({ herb }) {
  const art = skinArt(herb.line)
  return (
    <span className="pp-mini-board">
      {Array.from({ length: MINI_GRID_CELLS }, (_, i) => (
        <span key={i} className="pp-mini-cell">
          <art.Tile />
          {i === 0 && <span className="pp-mini-over"><art.Start /></span>}
          {MINI_MARK_CELLS.includes(i) && <span className="pp-mini-over"><art.Mark /></span>}
        </span>
      ))}
      <span className="pp-mini-pip"><Pip line={herb.line} form={herb.form} outfit={herb.outfit} mood={PET_MOODS.HAPPY} variant="mini" /></span>
    </span>
  )
}

export default GamePicker
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 17: Create PipGamesView (the sheet) ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/games/PipGamesView.jsx`

- [x] **Step 1: Write the sheet**

```jsx
import { useState } from 'react'
import { GAMES_CLOSE_LABEL, GAMES_SCREEN, GAMES_TITLE, PIPS_PATH_FAMILY, pipsPathSkin } from '../../../constants/pipsPath'
import useBodyScrollLock from '../../../hooks/useBodyScrollLock'
import usePipsPath from '../../../hooks/usePipsPath'
import GamePicker from './GamePicker'
import PipsPathBoard from './PipsPathBoard'
import PipsPathMap from './PipsPathMap'
import '../room/ShopView.css'
import './PipsPath.css'

/**
 * MPP-49: Pip's games sheet over the room (useRoomOverlay gives focus, Tab trap and Escape-to-close).
 * Screens: picker → map → board. Escape and ← step back one screen; on the picker, Escape and ✕ close
 * the sheet and focus returns to Pip. The skin follows the theme's Pip line (herb.line), never a theme id.
 */
function PipGamesView({ herb, titleId, panelRef, onClose }) {
  useBodyScrollLock(true)
  const games = usePipsPath()
  const [screen, setScreen] = useState(GAMES_SCREEN.PICKER)
  const skin = pipsPathSkin(herb.line)

  const back = () => setScreen(screen === GAMES_SCREEN.BOARD ? GAMES_SCREEN.MAP : GAMES_SCREEN.PICKER)
  const onKeyDown = (event) => {
    if (event.key !== 'Escape' || screen === GAMES_SCREEN.PICKER) return
    event.preventDefault() // useRoomOverlay leaves a prevented Escape alone, so the sheet stays open
    back()
  }
  const play = async (slot) => {
    if (await games.issue(slot)) setScreen(GAMES_SCREEN.BOARD)
  }
  const onPlayLevel = (difficulty) => play({ family: PIPS_PATH_FAMILY, difficulty })
  const onPlayNext = () => play({})
  const onCleared = (path) => games.clear(games.map.mapId, path)

  const wide = screen !== GAMES_SCREEN.PICKER
  const heading = screen === GAMES_SCREEN.PICKER ? GAMES_TITLE : skin.title
  return (
    <section
      ref={panelRef}
      className={wide ? 'pip-shop pp-screen pp-games' : 'pip-shop pp-games'}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      {screen !== GAMES_SCREEN.BOARD && (
        <div className="pip-shop-head">
          {screen === GAMES_SCREEN.PICKER
            ? <button type="button" className="pip-shop-icon-btn" aria-label={GAMES_CLOSE_LABEL} onClick={onClose}>✕</button>
            : <button type="button" className="pip-shop-icon-btn" aria-label="Back to games" onClick={back}>←</button>}
          <h3 id={titleId}>{heading}</h3>
          <span className="pp-head-spacer" />
        </div>
      )}
      {screen === GAMES_SCREEN.BOARD && <h3 id={titleId} className="pip-checkin-sr">{skin.title}</h3>}
      {screen === GAMES_SCREEN.PICKER && (
        <GamePicker state={games.state} loading={games.loading} error={games.error} skin={skin} herb={herb}
          onRetry={games.reload} onOpenGame={() => setScreen(GAMES_SCREEN.MAP)} />
      )}
      {screen === GAMES_SCREEN.MAP && games.state && (
        <PipsPathMap state={games.state} skin={skin} herb={herb} issuing={games.issuing} issueError={games.issueError}
          onPlayLevel={onPlayLevel} onPlayNext={onPlayNext} />
      )}
      {screen === GAMES_SCREEN.BOARD && games.map && (
        <PipsPathBoard key={games.map.mapId} map={games.map} skin={skin} herb={herb} issuing={games.issuing}
          clear={games} onCleared={onCleared} onRetryClear={onCleared} onNext={onPlayNext} onBack={back} />
      )}
    </section>
  )
}

export default PipGamesView
```

(`pip-checkin-sr` is the existing visually-hidden class from `CheckInActions.css`; it is loaded with the room. If the executor finds it missing at that point, use the project's existing sr-only class instead and note it.)

- [x] **Step 2: Measure and build**

Run: `Get-ChildItem foodbytes-app\client\src\components\pet\games\*.jsx | ForEach-Object { "{0} {1}" -f $_.Name, (Get-Content $_ | Measure-Object -Line).Lines }`
Expected: every file under 200 lines (`pipsPathArt.jsx` may reach ~150 as art).

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 4 — Entry point: tap Pip, the offer, the sheet

Wires the screens into the room: the bubble learns the offer line, the room learns where Pip is, and PetView/PetRoom connect the Pip button, the offer actions and the games overlay. The phase ends with the feature reachable and `check:bubble`, `check:room` and the build green.

### Task 18: Add the offer to pipBubble ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/utils/pipBubble.js`
- Modify: `foodbytes-app/client/src/utils/pipBubble.check.mjs`

- [x] **Step 1: Add the failing assertions**

Append to `pipBubble.check.mjs` (before any final log line):

```js
// MPP-49: the "play a game" offer sits below the check-in and above fridge and mood.
const OFFER = 'Play a game with me? 🎲'
assert.deepEqual(pipBubble({ offerLine: OFFER, fridgeLine: 'Fridge low', moodLine: 'Just vibing.' }), { text: OFFER, actions: null, offer: true })
assert.deepEqual(pipBubble({ offerLine: OFFER, checkIn: ASKING }), { text: ASKING.text, actions: ACTIONS })
assert.deepEqual(pipBubble({ offerLine: OFFER, cookLine: 'Cooking!' }), { text: 'Cooking!', actions: null })
assert.deepEqual(pipBubble({ offerLine: OFFER, announcement: 'New trophy!' }), { text: 'New trophy!', actions: null })
assert.deepEqual(pipBubble({ offerLine: OFFER, growthLine: 'I grew!' }), { text: 'I grew!', actions: null })
assert.deepEqual(pipBubble({ offerLine: null, moodLine: 'Just vibing.' }), { text: 'Just vibing.', actions: null })
```

Run: `cd foodbytes-app\client; npm run check:bubble`
Expected: fails on the first new assertion (the offer is ignored today).

- [x] **Step 2: Implement**

In `pipBubble.js`: add `offerLine = null` to the destructured parameters and to the JSDoc type (`offerLine?: string|null`), update the order comment to `cook > award / outfit > stage change > check-in question > game offer (MPP-49, user tapped Pip) > fridge-low > mood`, and after `if (checkIn) return …` add:

```js
  if (offerLine) return { text: offerLine, actions: null, offer: true }
```

Run: `cd foodbytes-app\client; npm run check:bubble`
Expected: exit 0, every assertion passes.

### Task 19: Add pipHitBox to roomLayout with a room check ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/roomLayout.js` (after `cookPose`)
- Modify: `foodbytes-app/client/src/components/pet/room/room.check.mjs`

- [x] **Step 1: Add the failing check**

In `room.check.mjs`, add `pipHitBox` to the `roomLayout.js` import, add `PIP_POSITIONS` to an import from `'../../../constants/pet.js'`, and append:

```js
// MPP-49: the tap-Pip button covers his whole drawn figure (full viewBox 0 -40 200 240) at each pose.
for (const position of [PIP_POSITIONS.RUG, PIP_POSITIONS.COOKER, PIP_POSITIONS.BED]) {
  const pose = pipPose(position, 'content', DEFAULT_ROOM_LEVELS)
  const box = pipHitBox(pose, position)
  near([box.width, box.height], [200 * pose.scale, 240 * pose.scale])
  const [fx, fy] = P(...pose.anchor)
  const [sx, sy] = position === PIP_POSITIONS.BED ? shiftPx(STATION_SHIFT.bed) : [0, 0]
  assert.ok(box.x < fx + sx && fx + sx < box.x + box.width, `${position}: feet inside the box horizontally`)
  assert.ok(box.y < fy + sy + pose.dropPx && fy + sy + pose.dropPx < box.y + box.height, `${position}: feet inside the box vertically`)
}
```

Run: `cd foodbytes-app\client; npm run check:room`
Expected: fails (`pipHitBox` is not exported).

- [x] **Step 2: Implement**

In `roomLayout.js`, import `PIP_FOOT_X, PIP_FOOT_Y` from `'../pip/pipSpace.js'` and add after `cookPose`:

```js
// MPP-49: Pip's full drawing box in his own units (pipSpace PIP_FULL_VIEWBOX = '0 -40 200 240').
const PIP_BOX = { x: 0, y: -40, width: 200, height: 240 }

/**
 * MPP-49: the world box of Pip's figure at a pose, for the tap-Pip button (same transform as RoomPip).
 * In bed he is drawn inside the bed's shifted group, so the box takes the bed's shift too.
 */
export function pipHitBox(pose, position) {
  const [x, y] = P(...pose.anchor)
  const left = x - PIP_FOOT_X * pose.scale
  const top = y + pose.dropPx - PIP_FOOT_Y * pose.scale
  const box = {
    x: left + PIP_BOX.x * pose.scale,
    y: top + PIP_BOX.y * pose.scale,
    width: PIP_BOX.width * pose.scale,
    height: PIP_BOX.height * pose.scale
  }
  return position === PIP_POSITIONS.BED ? offsetBox(box, STATION_SHIFT[ROOM_STATIONS.BED]) : box
}
```

(`offsetBox` is declared above at line ~80 as a `const`; if `pipHitBox` sits before it in the file, move the function below `offsetBox`.)

Run: `cd foodbytes-app\client; npm run check:room`
Expected: exit 0, all room and pack checks pass.

### Task 20: Create useGameOffer, GameOfferActions and PipTapButton ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useGameOffer.js`
- Create: `foodbytes-app/client/src/components/pet/games/GameOfferActions.jsx`
- Create: `foodbytes-app/client/src/components/pet/games/PipTapButton.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css:143-170`

- [x] **Step 1: Write the offer hook**

```js
import { useEffect, useState } from 'react'

/**
 * MPP-49: Pip's "play a game" offer. Tapping Pip offers only when nothing above fridge / mood is
 * speaking (canOffer); if a cook line, announcement, growth line or check-in arrives, the offer drops.
 */
export default function useGameOffer({ canOffer }) {
  const [offering, setOffering] = useState(false)

  useEffect(() => {
    if (!canOffer) setOffering(false)
  }, [canOffer])

  return {
    offering: offering && canOffer,
    offer: () => { if (canOffer) setOffering(true) },
    dismissOffer: () => setOffering(false)
  }
}
```

- [x] **Step 2: Write the bubble actions**

```jsx
import { useEffect, useRef } from 'react'
import { GAME_OFFER_NOT_NOW, GAME_OFFER_PLAY } from '../../../constants/pipsPath'

/** MPP-49: the offer's controls inside Pip's bubble. The player just tapped Pip, so Play a game takes focus. */
function GameOfferActions({ onPlay, onNotNow }) {
  const playRef = useRef(null)
  useEffect(() => { playRef.current?.focus() }, [])
  return (
    <div className="pip-checkin-actions" role="group" aria-label="Play a game with Pip?">
      <button ref={playRef} type="button" className="pip-checkin-btn pip-checkin-btn--primary" aria-haspopup="dialog" onClick={onPlay}>{GAME_OFFER_PLAY}</button>
      <button type="button" className="pip-checkin-btn pip-checkin-btn--link" onClick={onNotNow}>{GAME_OFFER_NOT_NOW}</button>
    </div>
  )
}

export default GameOfferActions
```

- [x] **Step 3: Write the Pip button**

```jsx
import { hitBoxStyle } from '../room/roomLayout'

/** MPP-49: a real button laid over Pip's figure (like the room's StationButton); tapping it makes Pip offer a game. */
function PipTapButton({ box, label, buttonRef, onTap }) {
  return <button ref={buttonRef} type="button" className="pip-tap-btn" style={hitBoxStyle(box)} aria-label={label} onClick={onTap} />
}

export default PipTapButton
```

- [x] **Step 4: Style it like the station buttons**

In `PetRoom.css`, append `, .pip-tap-btn` to every selector list that starts with `.pip-station-btn` (lines 143, 154, 159, 164: base, `:active`, hover, `:focus-visible`), so the Pip button gets the same transparent, ≥ 44 px, `touch-action: manipulation`, focus-ring behaviour.

- [x] **Step 5: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 21: Wire the games into PetRoom ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx`

- [x] **Step 1: Add the prop, overlay, Pip button, offer actions and sheet**

1. Imports: `import GameOfferActions from '../games/GameOfferActions'`, `import PipGamesView from '../games/PipGamesView'`, `import PipTapButton from '../games/PipTapButton'`, and add `pipHitBox` to the `./roomLayout` import.
2. Signature: add `games = null` after `decor = null`. Add to the header comment: `MPP-49: \`games\` ({ offering, offer, dismissOffer, herb }) makes Pip tappable (he offers a game in the bubble) and opens Pip's games sheet.`
3. After `const shopOverlay = useRoomOverlay()`: `const gamesOverlay = useRoomOverlay()` and `const gamesTitleId = \`pip-games-title-${overlayId}\``.
4. `anyOpen`: append `|| gamesOverlay.isOpen`.
5. After the `wardrobe && <StationButton … />` block and before `{editing && <DecorSpotButtons … />}`:
   ```jsx
          {games && !serving && !editing && (
            <PipTapButton box={pipHitBox(pose, scenePosition)} label={`Play with ${name}`} buttonRef={gamesOverlay.triggerRef} onTap={games.offer} />
          )}
   ```
6. Before `return (`:
   ```jsx
  // MPP-49: the offer's buttons when Pip is offering a game and no check-in owns the bubble.
  const playGame = () => {
    games.dismissOffer()
    gamesOverlay.open()
  }
  const actions = bubbleActions ?? (games?.offering ? <GameOfferActions onPlay={playGame} onNotNow={games.dismissOffer} /> : null)
   ```
   and change `<SpeechBubble text={bubble} actions={bubbleActions} />` to `<SpeechBubble text={bubble} actions={actions} />`.
7. After the `ShopView` overlay block:
   ```jsx
      {games && gamesOverlay.isOpen && (
        <PipGamesView herb={games.herb} titleId={gamesTitleId} panelRef={gamesOverlay.panelRef} onClose={gamesOverlay.close} />
      )}
   ```

- [x] **Step 2: Measure and build**

Run: `(Get-Content foodbytes-app\client\src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines`
Expected: ≤ 360 (and in all cases < 400).

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 22: Wire the offer into PetView ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx:41-140`

- [x] **Step 1: Compute canOffer, use the hook, pass the offer and games**

1. Imports: `import useGameOffer from '../../hooks/useGameOffer'` and `import { GAME_OFFER_LINE } from '../../constants/pipsPath'`.
2. After the `growth` hook line (still before the early returns):
   ```js
  // MPP-49: tapping Pip offers a game only when nothing above fridge / mood is speaking.
  const gameOffer = useGameOffer({ canOffer: !serving && !announcement && !growth.bubble && !checkIn })
   ```
3. In the `pipBubble({ … })` call add `offerLine: gameOffer.offering ? GAME_OFFER_LINE : null,` and update its comment to `cook > award/outfit > stage change > check-in > game offer > fridge-low > mood`.
4. After `const herb = { … }`:
   ```js
  const games = { offering: said.offer === true, offer: gameOffer.offer, dismissOffer: gameOffer.dismissOffer, herb }
   ```
5. Pass `games={games}` to `<PetRoom … />`.
6. Add to the header comment: `MPP-49: tap Pip → "Play a game with me?" in the bubble → Pip's games sheet (Pip's Path).`

- [x] **Step 2: Build and run the room checks**

Run: `cd foodbytes-app\client; npm run build; npm run check:bubble; npm run check:room; npm run check:games`
Expected: build `built in <n>s`; the three checks exit 0.

---

## Phase 5 — Mockup sync

Brings `pips-path.html` and its README in line with what ships. No app code changes, so the build is unaffected.

### Task 23: Update pips-path.html and the README ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pips-path.html`
- Modify: `foodbytes-app/mockup/README.md` (the `pips-path.html` row)

- [x] **Step 1: Drop option B**

In `pips-path.html`: delete `'entry'` from `CONTROL_GROUPS`, set `ENTRY_IDS = ['a']`, remove the Games pill branch from `roomActions()` and the option-B note in `screenRoom()`, and rewrite notes section 3 to: `<h2>3. Entry (decided 2026-11-17, live)</h2><p>Tap Pip, then the bubble offers Play a game. There is no Games pill.</p>`.

- [x] **Step 2: Show the client-only clear states**

Add `'savefail'` to `SCREENS` (label `'Save failed'`) and to `BOARD_SCREENS`; in `loadSession`, treat `savefail` like `cleared` but set `session.result = { error: true }` after `commitClear()`. In `clearCardHtml()`, when `session.result.error` render `<p class="pp-error" role="alert">Couldn't save your clear.<button type="button" class="pip-checkin-btn" data-act="noop">Try again</button></p>` in place of the reward line. Add `.pp-error` CSS beside `.pp-invalid` using the same tokens (`var(--danger-hover-bg)`, `var(--pet-error-text)`). Add `Already counted` to the notes' rewards section: "Undo after a clear and clear the same map again: the server answers already counted and pays nothing."

- [x] **Step 3: Record what shipped**

Add a notes section `<h2>11. Live in the app</h2>` listing: maps come from the server per difficulty; an open uncleared map is handed back when you return to its level (no reroll), and the path restarts; the chapter title follows the skin; the clear card shows Saving… then the server's line; Pip's real form and outfit are the token.

In `README.md`, change the row's lead from `**In review (MPP-49):**` to `**Approved 2026-11-17, live from v<the version from Task M.1> (contract 2026-11-17-pips-path-client):**`, remove the "option B … kept for comparison only" clause, and add `savefail` to the `#s=` deep-link list.

- [x] **Step 4: Re-run the mockup smoke**

Run: `node .claude\contract\2026-11-17-pips-path-mockup\mockup-smoke.mjs`
Expected: exits 0. If it asserts entry option B or the screen list, update those assertions to the new values in the same step and say so in `pr-description.md`.

---

## Phase 6 — Local play test (developer)

The feature is checked by hand against the real API and local database before anything is pushed (backend contract's waived Task 17 moved here). No code changes.

### Task 24: Rebuild the Docker stack and play — PENDING (developer-owned manual play test)

- Skill: none — manual verification on the developer's machine

**Files:** (none)

- [ ] **Step 1: Rebuild api and client against the local DB**

Run (repo root): `docker-compose up -d --build api client`
Expected: `foodbytes-db` reused, `foodbytes-api` and `foodbytes-client` rebuilt and `Started`. Stop any `mvn spring-boot:run` on :8080 first.

- [ ] **Step 2: Developer plays through the checklist at http://localhost:3000 (signed in with Google)**

Record each result in `pr-description.md`:
1. Room: tap Pip → bubble "Play a game with me? 🎲", Play a game focused; Not now restores the previous line. With a check-in open, tapping Pip changes nothing.
2. Play a game → Games sheet; ✕ / Escape closes and focus returns to Pip.
3. Pip's Path card → map: level 1 current, others locked and not tappable.
4. Level 1 board: tap, drag (phone or DevTools touch), arrow keys / WASD; no Undo button; walking onto a tile already on the path (next to Pip) restarts the level and Pip says the reset line (a drag stops there); Restart button shows the intro line; get stuck (Restart pulses, Pip bored).
5. Clear: Pip jumps, skin celebrates, "Saving…" then `+5 ✨`; header sprinkles go up by 5; map shows level 1 cleared, level 2 current.
6. Reuse: open level 2, go ← back to the map, open level 2 again → same board layout (same map).
7. Restart after a clear, clear again → "Already counted".
8. Offline: DevTools offline, clear a board → "Couldn't save your clear." + Try again; back online, Try again → reward line.
9. Themes: repeat 3–5 in Default (Garden Path), Parchment (Ember Trail), Cyberpunk (Circuit Run) at 320 px and 1280 px; tiles ≥ 44 px; no horizontal scroll.
10. Low FX (user menu) and OS reduced motion: no hop transition, no petals / sparks, marks show their final frame.
11. Cap: clear ten maps in a day → the tenth shows the cap line; the eleventh shows "Today's game sprinkles are full (50/50)" and the balance does not move.

Expected: every item passes, or the failure is written down and fixed before Final verification.

---

## Phase 7 — Final verification

No production changes beyond the version bump; sanity checks over the whole change.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. This ticket is a Story → bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — 2026-11-17-pips-path-client: Pip's Path in the app — tap Pip to play, games picker, chapter map and Garden Path board in three skins, server-checked clears (5 ✨, 50/day); an open map is handed back per slot`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale or forbidden patterns ✓

- Skill: none — verification

**Files:** (none)

- [x] **Step 1: No console logging, no raw HTML, no direct axios in the new code**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\games\*.jsx,foodbytes-app\client\src\hooks\usePipsPath*.js,foodbytes-app\client\src\hooks\useGameOffer.js,foodbytes-app\client\src\utils\pipsPath.js -Pattern "console\.(log|debug)|dangerouslySetInnerHTML|from 'axios'"`
Expected: zero hits.

- [x] **Step 2: No theme-id branching in the games code**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\games\*.jsx -Pattern "themeId|'cyberpunk'|'parchment'|'default'"`
Expected: zero hits (skins key on `herb.line`).

- [x] **Step 3: Option B is gone from the mockup**

Run: `Select-String -Path foodbytes-app\mockup\pips-path.html -Pattern "B Games pill|data-act=\"games\""`
Expected: zero hits.

### Task M.3: Run the full backend test suite ✓

- Skill: none — verification

**Files:** (none)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task M.4: Production build and every client check ✗ — build + check:games/bubble/room/version green; check:themes red only on the existing folder-chip pair

- Skill: none — verification

**Files:** (none)

- [ ] **Step 1: Build and checks**

Run: `cd foodbytes-app\client; npm run build; npm run check:games; npm run check:bubble; npm run check:room; npm run check:themes; npm run check:version`
Expected: `built in <n>s`; every check exits 0; `check:themes` prints the one known Default WARN and `Themes OK: 3 themes, 204 contrast pairs`.

  Result 2026-11-17: build OK (1.32s); check:games, check:bubble, check:room, check:version exit 0. check:themes exits 1 on the pre-existing Default failure `folder-chip-text on folder-chip-bg (default): 4.36 < 4.5` (commit 4af2726, out of scope, not fixed); no pp-* pair fails; the "Themes OK" line was not reached, so this step stays unticked.

### Task M.5: Update the PR description ✓

- Skill: none — release bookkeeping

**Files:**
- Create: `.claude/contract/2026-11-17-pips-path-client/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- Link to `plan.md` in this folder and to the backend contract `2026-11-17-pips-path-backend/`.
- Summary: tap-Pip offer, games sheet (picker → map → board), three skins by Pip line, server-checked clears with the balance update, the backend reuse rule (and that the REFRESHER reuse branch is untestable until a second family ships), the mockup sync; the new version from Task M.1.
- Migrations: none in this ticket. Railway still needs the backend's `mpp15-railway-golive.sql` at the MPP-15 merge (unchanged by this ticket).
- Verification: Phase 1 test results, every check from M.4, and the Task 24 checklist results item by item.
- A note for future chapters: a new family adds a `PuzzleFamily` bean on the server and a skin entry + art set per Pip line in `constants/pipsPath.js` / `pipsPathArt.jsx`; board chrome uses the `--pp-*` tokens.
- Branch: `feature/MPP-49-pips-path-client` (stacked on `feature/MPP-49-pips-path-backend`); push both after Task 24 passes.
- Suggested commit subject: `MPP-49: Pip's Path client (tap Pip to play, picker, chapter map, Garden Path board) + reuse open maps`

---

## Self-review

**Spec coverage:**
- Backend reuse of an open uncleared map per slot — Tasks 2, 3.
- Client API layer (service + hook, four async states) — Tasks 6, 8.
- Pure engine port + `check:games` — Task 5.
- Skins (copy + art) — Tasks 4, 10.
- Entry point (tap Pip, offer line, offer actions, checks) — Tasks 18, 19, 20, 21, 22.
- Games sheet, picker, map, board, clear card — Tasks 13, 14, 15, 16, 17.
- Balance update — Tasks 7, 8.
- Theme tokens + `check:themes` pairs — Task 9.
- Low FX / reduced motion — Tasks 13 (CSS), 14 (JS bits skip).
- Mockup sync — Task 23.
- Local play before push — Task 24.
- MINOR bump, CHANGELOG, PR description — Tasks M.1, M.5.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N". Each step has code or a `Run:` / `Expected:` pair; the CSS port names exact source lines and every change applied to them.

**Type / name consistency:** `PIPS_PATH_ENDPOINT`, `PIPS_PATH_FAMILY`, `GAME_MODE`, `GAMES_SCREEN`, `MAP_NODE`, `pipsPathSkin`, `rewardLine` (Task 4) are used with the same names in Tasks 5–23. Engine names (`parseRows`, `stepByKey`, `bubbleKeyFor`, `mapNodeStatus`, `samePath`) match plan.md Data shapes plus `samePath` (helper introduced in Task 5, used in Task 11). `usePipsPath` returns `{ state, loading, error, reload, map, issuing, issueError, issue, clearResult, clearing, clearError, clear, resetClear }`; `PipsPathBoard` reads `clear.clearing / clearResult / clearError` from that object. `skinArt(line)` (Task 10) replaces plan.md's `SKIN_ART[line]` lookup as the exported accessor (same art sets). `pipHitBox(pose, position)` takes the position as well as the pose (bed shift), refining plan.md's one-argument sketch. `applySprinkles(balance)`, `useGameOffer({ canOffer })`, `PetRoom` `games = { offering, offer, dismissOffer, herb }` are consistent across Tasks 7, 20, 21, 22 (`canOffer` is computed in PetView rather than passed into PetRoom). Backend query names are identical in Tasks 2 and 3. CSS classes (`pp-games`, `pp-board-art`, `pp-error`, `pp-status`, `pip-tap-btn`) are defined in Tasks 13 / 20 before use.

**Phase boundary cleanliness:**
- Phase 1 ends with `PipsPathServiceTest` green; the client is untouched.
- Phase 2 adds unimported modules, tokens and a context setter; build and `check:themes` green, app unchanged.
- Phase 3 adds screens nothing renders yet; build green after every task.
- Phase 4 connects them; build, `check:bubble`, `check:room`, `check:games` green.
- Phase 5 touches only mockup files.
- Phase 6 is manual; Phase 7 only bumps the version and verifies.
