# Tasks: Themed Pip rooms: mockups (contract 1 of 4)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-16

**Goal:** Three self-contained mockups in `foodbytes-app/mockup/` (dragon lair, robot workshop, room UI chrome), drawn from the live room geometry in the room-pack shape contract 2 will port, each approved by the developer. No app code changes.

**Spec:** `plan.md` in this folder (upstream brief: `spec.md`).

---

## File map

**Created:**
- `foodbytes-app/mockup/pip-room-dragon.html`: the dragon lair (shell, 10 styles, 5 stations × 4 levels, 55 decor, names, effects, ambience, overlay, thumbnails, names + fit tables)
- `foodbytes-app/mockup/pip-room-robot.html`: the robot workshop (same contents)
- `foodbytes-app/mockup/pip-room-chrome.html`: every room UI surface × 3 themes × 2 widths, the token table, the contrast pairs
- `.claude/contract/2026-11-16-themed-pip-rooms-mockups/mockup-smoke.mjs`: node smoke for the two room files (every id renders, nothing missing, no `NaN`/`undefined`, geometry matches the live code)
- `.claude/contract/2026-11-16-themed-pip-rooms-mockups/chrome-smoke.mjs`: node smoke for the chrome file (every token's Default equals the literal at its `file:line`, every pair passes AA)
- `.claude/contract/2026-11-16-themed-pip-rooms-mockups/pr-description.md`

**Modified:**
- `foodbytes-app/mockup/README.md`: three rows + a "Proposal in review" section
- `foodbytes-app/client/package.json`: `version` only
- `foodbytes-app/foodbytes-api/pom.xml`: project `<version>` only
- `CHANGELOG.md`: one line

**Deleted:** (none)

### Conventions for every room-file task

These apply to Phases 1 and 2. They are stated once here and referenced by each task.

**Script block layout.** Each room file has these blocks:
- `<script id="room-geometry">`: holds `GEOMETRY` and `IDS` (plan.md → Data shapes).
- `<script id="room-iso">`: the iso helpers.
- `<script id="room-creature">`: the creature drawing functions copied from `pip-themed-lines.html`.
- `<script id="room-pack">`: holds `DRAGON_ROOM` or `ROBOT_ROOM`.
- `<script id="room-engine">`: holds `renderRoomSVG(pack, state) → string` and `thumbSVG(pack, kind, id, level) → string`.
- `<script id="room-ui">`: the DOM wiring only.

**What the node smoke may load.** It runs the first five blocks in a `vm` context. They must therefore not touch `document`, `window` or `localStorage`.

**`state` shape.**
```js
{ night: false, wallStyle: 'wall-white', floorStyle: 'floor-lilac',
  levels: { bed: 1, fridge: 1, cooker: 1, cabinet: 1, wardrobe: 1 },
  placements: { overWardrobe: null, …, rug: 'rug-pink' },  // one key per DECOR_SPOTS entry
  form: 3, fridgePct: 50, cooking: false, sleeping: false, overlay: false, herb: false }
```

**Missing art.** A pack entry that is absent renders `<rect class="missing" …/><text>missing: <id></text>` (red dashed). The smoke counts these.

**Animated groups.**
- Classes are `room-fx room-fx--<effect>`, and positioning stays on an outer `<g transform>`. The class never sits on a group that carries a transform.
- `.lowfx .room-fx`, `.is-still .room-fx` and `@media (prefers-reduced-motion: reduce)` set `animation: none`.
- `.lowfx [data-glow]` drops `filter`.

**Toggles.** Every toggle is a `<button aria-pressed>` at least 44 × 44 px. The page is mobile-first and works from 320 px to 1280 px.

**Franchise rule.** No franchise names, marks, characters or lookalikes in any art or name.

---

## Phase 1 — Dragon lair mockup

Builds `pip-room-dragon.html` from the engine up, then the shell, the stations and the decor in three spot groups. Each task leaves the file opening cleanly. Missing items show as red boxes, never errors, so the developer can start reviewing after any task.

### Task 1: Scaffold the room file and the smoke ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/mockup/pip-room-dragon.html`
- Create: `.claude/contract/2026-11-16-themed-pip-rooms-mockups/mockup-smoke.mjs`

- [x] **Step 1: Write the geometry block, copied verbatim from the live code**

In `<script id="room-geometry">`, declare `GEOMETRY` and `IDS` exactly as in plan.md → Data shapes.
- **Values.** Copy every value from:
  - `client/src/constants/petRoom.js`: `ROOM_SIZE`, `ROOM_WORLD`
  - `client/src/components/pet/room/roomDecor.jsx`: `WINDOW_GAP`
  - `client/src/components/pet/room/roomLayout.js`: `RUG`, `*_FOOTPRINT`, `STATION_ANCHORS`, `STATION_SHIFT`, `ROOM_DRAW_ORDER`, `PIP_HOME`, `PIP_SCALE`, `PIP_COOKER_SPOT`, `PIP_BED_SCALE`, `PIP_BED_DROP`, `DECOR_LEGACY_SHIFT`, `WINDOW_SHIFT`, and the bodies of `stationThumbBox` / `decorThumbBox` / `pipPose` / `cookPose`
  - `client/src/constants/petDecor.js`: `DECOR_SPOTS`, `DECOR_SPOT_SHAPES`, `DECOR_ITEMS` → id → spot, `ROOM_STYLES` keys
- **Source comments.** Each value carries `// source: <file>:<line>`.
- **Herb labels.** Also copy the herb labels (`DECOR_ITEMS[id].label`, `ROOM_STYLES[id].label`, and the station labels from `constants/petShop.js`) into `HERB_LABELS` for the names table.

- [x] **Step 2: Write the iso block and the creature block**

- `<script id="room-iso">`: copy `P`, `pts`, `shade`, `boxFaces`, `ellipsePoints` and `cylinderSidePoints` from `client/src/components/pet/room/iso.js`, converted from ES exports to plain functions, with the logic unchanged.
- `<script id="room-creature">`: copy from `foodbytes-app/mockup/pip-themed-lines.html` the dragon forms table and the functions that draw a dragon at a given form and mood as an SVG string. The robot file (Task 7) copies the robot ones. Expose `creatureSVG(form, mood)` returning the figure in the 200-unit Pip space, feet at (100, 186).

- [x] **Step 3: Write the engine**

In `<script id="room-engine">`, implement `renderRoomSVG(pack, state)`.
- **Draw order:**
  1. backdrop: walls with `pack.styles[state.wallStyle]`, floor with `pack.styles[state.floorStyle]`, skirting, the wall and floor patterns, and the window using `pack.backdrop` for day or night
  2. wall-layer decor
  3. stations in `GEOMETRY.ROOM_DRAW_ORDER`, each `pack.stations[s][level-1]()` wrapped in `shiftTransform(STATION_SHIFT[s])`
  4. floor-layer decor (the rug first)
  5. the creature at `pipPose` / `cookPose` / bed pose, scaled by `PIP_SCALE` / `PIP_BED_SCALE` (bed when `state.sleeping`, cooker when `state.cooking`)
  6. effects: `pack.effects.gauge(level, state.fridgePct)`, `steam`, `zzz`, `servedPlate`, and `nightDim` at night
  7. overlay, when `state.overlay`: every `*_FOOTPRINT[level-1]` as a dashed iso box, every `DECOR_SPOT_SHAPES` outline, and the `WINDOW_GAP`
- **Wrapper.** The output is wrapped in `<svg viewBox="${ROOM_WORLD.x} ${ROOM_WORLD.y} ${ROOM_WORLD.width} ${ROOM_WORLD.height}">`.
- **Placement.** Decor is placed by `state.placements[spot]` → `pack.decor[id]`, with `DECOR_LEGACY_SHIFT` applied to the 12 legacy ids, as `client/src/components/pet/room/decorArt.jsx` does.
- **Herb reference.** When `state.herb` is set, the engine draws `HERB_REFERENCE` (Task 2 Step 4) in place of the pack.
- **Missing art.** A missing entry renders the red missing box.

Then implement `thumbSVG(pack, kind, id, level)`, where `kind` is `'station' | 'decor' | 'style'`. It crops with the copied thumb boxes, and its root is `<svg class="is-still">`.

- [x] **Step 4: Write a stub `DRAGON_ROOM` and the UI wiring**

- In `<script id="room-pack">`, declare `DRAGON_ROOM` with the plan.md shape. Every map is empty for now, except `labels`, which holds empty objects.
- In `<script id="room-ui">`, build the review sections listed in plan.md → "Room file: review sections" (header with toggles and form picker, room, style chips, stations, decor, effects, names table, fit table). Every control rewrites `state` and re-renders the room container's `innerHTML`.
- Add the `<!-- approved: pending -->` comment as the first line inside `<body>`.

- [x] **Step 5: Write the smoke**

Create `mockup-smoke.mjs`. Usage: `node mockup-smoke.mjs <path-to-room-html> [--expect-complete]`.
1. Read the HTML. Extract the text of the five script blocks by id (`room-geometry`, `room-iso`, `room-creature`, `room-pack`, `room-engine`) and run them in one `vm.createContext({})`. Read the pack from whichever of `DRAGON_ROOM` / `ROBOT_ROOM` is defined.
2. **Geometry check.** For every numeric value in `GEOMETRY` that has a `// source: file:line` comment, read that line of the cited live file (path relative to `foodbytes-app/client/src/`). Assert that the number appears on that line. Print each mismatch.
3. **Render every case:**
   - each style pair, day and night
   - each station at levels 1–4
   - each decor id placed in its spot
   - each effect at fridge 0 / 50 / 100 %, cooking and sleeping
   - creature forms 1–3
   - `thumbSVG` for every station level, decor id and style

   Assert that no output contains `NaN` or `undefined`.
4. **Report.** Count `class="missing"` across all renders, then print `missing: <n>` and the missing ids. With `--expect-complete`, exit 1 when n > 0.
5. **Names.** With `--expect-complete`, assert that `pack.labels.stations` has 5 keys, `pack.labels.decor` has 55, `pack.labels.styles` has 10, and every value is a non-empty string.
6. Print `mockup smoke OK` on success.

- [x] **Step 6: Run the smoke on the stub**

Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-dragon.html`
Expected:
- no geometry mismatches
- no `NaN` or `undefined`
- `missing: <n>`, where n covers every station level, style, decor and effect
- `mockup smoke OK`, exit 0, because `--expect-complete` is not set

### Task 2: Lair shell, styles, effects and ambience ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-dragon.html`

- [x] **Step 1: Draw the backdrop**

Fill `DRAGON_ROOM.backdrop`:
- **Walls and floor:** rough stone walls with mortar lines and a flagstone floor, drawn in iso faces with `P()`.
- **Window gap:** an arched cave mouth inside `GEOMETRY.WINDOW_GAP`. By day it shows a pale sky with a distant mountain silhouette; by night, dark blue with stars.
- **Sill:** a stone ledge.
- **Skirting:** a rubble line along both walls.

Pick one `ink` outline colour for the room.

- [x] **Step 2: Draw the 10 styles**

Fill `DRAGON_ROOM.styles` for all 10 ids, keeping the slot meaning of each:
- **`wall-*` entries** give `left`, `right`, `skirting` and an optional `pattern`. Propose stone tints (grey, warm sandstone, mossy green, ember red, cold blue-grey), with `wall-sprig` as a moss-and-ivy pattern.
- **`floor-*` entries** give `base` and an optional `pattern`. Propose earth, flagstones, slate and a rune-tile checker.

Add `DRAGON_ROOM.labels.styles` names for all 10.

- [x] **Step 3: Draw the effects and ambience**

Fill `DRAGON_ROOM.effects`:
- `gauge(level, pct)`: frost creeping up the ice chest at the live gauge position (`STATION_ANCHORS.fridgeTop`)
- `steam(level)`: the cauldron's steam
- `zzz(level)`: smoke-ring Zs above the nest
- `servedPlate(level)`: a wooden trencher
- `nightDim()`

Then fill `DRAGON_ROOM.ambience` and add the CSS keyframes:
- torch and candle flicker (`flicker`)
- hearth embers rising (`embers`)
- a hoard glint (`glint`)
- a banner sway (`sway`)

All use transform or opacity only, and follow the animated-group rules in the conventions block.

- [x] **Step 4: Draw the herb reference**

Declare `HERB_REFERENCE`, a simplified herb room: the white walls, the lilac floor, the window, and the 5 stations at level 2. The engine draws it when `state.herb` is set. Its header reads "Herb room (simplified). Live reference: /pet on Default".

- [x] **Step 5: Run the smoke**

Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-dragon.html`
Expected: `mockup smoke OK`. No missing entries are reported for styles, backdrop or effects, only stations and decor.

### Task 3: Lair stations, 5 × 4 levels ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-dragon.html`

- [x] **Step 1: Draw every station level inside its footprint**

Fill `DRAGON_ROOM.stations` with 4 functions each. Each level must sit inside `GEOMETRY.FOOTPRINT[station][level-1]` (u, v, width, depth, height). Each level visibly grows on the last.
- **bed:**
  1. a straw nest
  2. a bigger nest with a fur
  3. a nest on a scatter of coins
  4. a nest on a gold pile

  The creature must sit on the nest at `STATION_ANCHORS.bedTop[level-1]`.
- **fridge:**
  1. a small ice chest
  2. an iron-bound ice chest
  3. a cold-cellar door in the rock
  4. a frost vault

  The frost gauge reads at `STATION_ANCHORS.fridgeTop[level-1]`.
- **cooker:**
  1. a campfire ring with a pot
  2. a stone hearth with a cauldron
  3. a forge hearth with bellows
  4. a great forge with a cauldron and chimney

  Steam rises from the cauldron, and the creature stands at `PIP_COOKER_SPOT`.
- **cabinet:**
  1. a small chest
  2. a hoard chest
  3. a chest plus a shelf niche
  4. a treasure alcove with trophies on stone shelves

  It must still read as the trophy cabinet.
- **wardrobe:**
  1. a peg with a cloak
  2. an armour stand
  3. an armour rack
  4. an armoury wall

  It must still read as the place you dress Pip.

- [x] **Step 2: Name the stations**

Add `DRAGON_ROOM.labels.stations` for all 5 (e.g. `bed: 'Nest'`, `fridge: 'Ice chest'`, `cooker: 'Forge hearth'`, `cabinet: 'Hoard'`, `wardrobe: 'Armour rack'`). The developer red-lines them at Task 17.

- [x] **Step 3: Check fit with the overlay**

Open the file with the hit-box overlay on. For each station, step through levels 1–4. Fill the fit-table rows for the 20 station levels with ✓, or a one-line note where art exceeds the box. Then fix every row that is not ✓, so the art fits.
Run: `Start-Process foodbytes-app\mockup\pip-room-dragon.html`
Expected: every station-level row in the fit table reads ✓.

- [x] **Step 4: Run the smoke**

Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-dragon.html`
Expected: `mockup smoke OK`. Only decor ids are reported missing.

### Task 4: Lair decor, wall and window spots (24 items) ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-dragon.html`

- [x] **Step 1: Draw the 24 wall and window items**

Fill `DRAGON_ROOM.decor` with one 1:1 counterpart for each live id. Each sits inside its spot's `DECOR_SPOT_SHAPES` outline (or, for the legacy ids, the shifted original position).

| Spot | Ids |
|---|---|
| `overWardrobe` | `basil-print`, `recipe-board`, `herb-shelf`, `fairy-lights`, `pip-portrait` |
| `bedsideWall` | `growth-chart`, `meal-calendar`, `wall-sconce`, `photo-strip` |
| `frontRightWall` | `wall-clock`, `bunting`, `pan-rail`, `mirror`, `coat-hooks` |
| `windowDressing` | `curtains-gingham`, `curtains-linen`, `roller-blind`, `window-lights`, `plant-hanger` |
| `windowsill` | `sill-basil`, `sill-succulents`, `sill-cactus`, `sill-radio`, `sill-cat` |

Each counterpart keeps the item's role and swaps the object for a lair one (e.g. `fairy-lights` → a string of glowing crystals, `wall-sconce` → a wall torch, `meal-calendar` → a carved tally stone).

Animated items use `room-fx` classes. At least the torch, candles and crystals animate.

- [x] **Step 2: Name them**

Add the 24 names to `DRAGON_ROOM.labels.decor`. Mark animated ones in the names table's `fx` column.

- [x] **Step 3: Check fit and run the smoke**

Place each item in turn with the overlay on, and fill its fit-table row. Fix any row that is not ✓.
Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-dragon.html`
Expected: `mockup smoke OK`. The 24 ids are no longer reported missing.

### Task 5: Lair decor, rug and back-of-room floor spots (18 items) ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-dragon.html`

- [x] **Step 1: Draw the 18 items**

| Spot | Ids |
|---|---|
| `rug` | `rug-pink`, `rug-braided`, `rug-leaf`, `rug-stripe`, `rug-picnic`, `rug-sheepskin` |
| `backCorner` | `snake-plant`, `cactus`, `umbrella-stand`, `broom` |
| `bedsideNook` | `side-table-lamp`, `record-player`, `plant-stand`, `stool-books` |
| `footOfBed` | `toy-chest`, `bench`, `laundry-basket`, `slippers` |

These are 1:1 lair counterparts within the spot shapes. Rugs stay flat on the floor inside `GEOMETRY.RUG` (pelts, woven hides, a rune circle, and so on).

- [x] **Step 2: Name them**

Add the 18 names and their `fx` marks.

- [x] **Step 3: Check fit and run the smoke**

Fill the 18 fit rows and fix any that are not ✓.
Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-dragon.html`
Expected: `mockup smoke OK`. The 18 ids are no longer missing.

### Task 6: Lair decor, front-of-room floor spots (13 items), then completeness ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-dragon.html`

- [x] **Step 1: Draw the 13 items**

| Spot | Ids |
|---|---|
| `byFridge` | `watering-can`, `cookbook-stack`, `bean-bag`, `lemon-tree`, `veg-basket` |
| `cornerByDoor` | `monstera`, `coat-stand`, `arc-lamp`, `guitar` |
| `frontOfRoom` | `pouffe`, `tea-table`, `pip-ball`, `picnic-basket` |

- [x] **Step 2: Name them and finish the tables**

Add the 13 names and their `fx` marks. The names table now has 70 rows (5 stations + 55 decor + 10 styles), and the fit table has 75 rows (20 station levels + 55 decor), all ✓.

- [x] **Step 3: Run the smoke in complete mode**

Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-dragon.html --expect-complete`
Expected: `missing: 0`, label counts 5 / 55 / 10, `mockup smoke OK`, exit 0.

- [x] **Step 4: Open it and check the toggles**

Run: `Start-Process foodbytes-app\mockup\pip-room-dragon.html`
Expected (manual):
- DevTools → Console is empty.
- **Low FX** on: every flicker, ember, glint and sway stops, and glows go flat.
- **Reduced motion** (DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`): everything stops.
- **Thumbnails** never animate.
- **Widths:** the page works at 320 px and 1280 px (DevTools device toolbar) with no horizontal page scroll.

---

## Phase 2 — Robot workshop mockup

The same build for `pip-room-robot.html`. The engine, geometry, iso and smoke are reused unchanged, so only the pack and the creature differ. Each task leaves the file opening cleanly.

### Task 7: Scaffold the workshop file from the lair engine ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/mockup/pip-room-robot.html`

- [x] **Step 1: Copy the shared blocks**

Copy these from `pip-room-dragon.html` unchanged:
- `<style>` (minus the lair keyframes)
- `room-geometry`
- `room-iso`
- `room-engine`
- `room-ui`
- `HERB_REFERENCE`

Replace `room-creature` with the robot forms and drawing functions from `foodbytes-app/mockup/pip-themed-lines.html`, keeping the same `creatureSVG(form, mood)` signature. Declare an empty `ROBOT_ROOM` in `room-pack`. Change the page title and header to "Pip's room: robot workshop (Cyberpunk)". Add `<!-- approved: pending -->`.

- [x] **Step 2: Run the smoke**

Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-robot.html`
Expected: no geometry mismatches, no `NaN` or `undefined`, everything reported missing, `mockup smoke OK`.

### Task 8: Workshop shell, styles, effects and ambience ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-robot.html`

- [x] **Step 1: Draw the backdrop**

- **Walls and floor:** panelled gunmetal walls with rivets and scuffs, and a grated floor.
- **Window gap:** a neon-trimmed window inside `GEOMETRY.WINDOW_GAP`. By day it shows a hazy city skyline; by night, a dark city with lit windows and rain.
- **Sill:** a metal ledge.
- **Skirting:** a cable tray along both walls.

Pick one `ink`.

- [x] **Step 2: Draw the 10 styles and name them**

- **`wall-*`:** gunmetal, olive drab, teal panel, rust orange, steel blue, with `wall-sprig` as circuit-board wallpaper.
- **`floor-*`:** rubber mat, diamond plate, grate, and a hazard-stripe checker.

Fill `ROBOT_ROOM.labels.styles`.

- [x] **Step 3: Draw the effects and ambience**

Fill `ROBOT_ROOM.effects`:
- `gauge`: an LED bar on the cryo unit at `STATION_ANCHORS.fridgeTop`
- `steam`: vapour from the fab oven vent
- `zzz`: `z` glyphs in pixel font above the pod
- `servedPlate`: a tray
- `nightDim`

Fill `ROBOT_ROOM.ambience` with keyframes: screen flicker (`scan`), blinking LEDs (`blink`), a slow fan (`fan`), neon buzz (`buzz`), and rain on the night window (`rain`).

Rain carries a `data-open-question="robot-rain"` attribute. A one-line note under the room says it is pending review.

- [x] **Step 4: Run the smoke**

Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-robot.html`
Expected: `mockup smoke OK`. Only stations and decor are reported missing.

### Task 9: Workshop stations, 5 × 4 levels ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-robot.html`

- [x] **Step 1: Draw every station level inside its footprint**

Footprints and anchors are as in Task 3.
- **bed:**
  1. a floor mat with a charging cable
  2. a charging cradle
  3. a charging pod
  4. a pod with a canopy and a status screen
- **fridge:**
  1. a cooler box
  2. a mini cryo unit
  3. a cryo fridge with a door window
  4. a twin-door cryo bank
- **cooker:**
  1. a hot plate
  2. a countertop fab oven
  3. a fab oven with a robotic arm
  4. a full fab line with a hood
- **cabinet:**
  1. a shelf crate
  2. a display case
  3. a lit display case
  4. a holo plinth case
- **wardrobe:**
  1. a hook rail
  2. a gear locker
  3. a double locker
  4. a locker bay with a screen

- [x] **Step 2: Name the stations**

Fill `ROBOT_ROOM.labels.stations` (e.g. `Charging pod`, `Cryo unit`, `Fab oven`, `Display case`, `Gear locker`).

- [x] **Step 3: Check fit and run the smoke**

Fill the 20 station-level fit rows with the overlay on, and fix any that are not ✓.
Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-robot.html`
Expected: `mockup smoke OK`. Only decor is reported missing.

### Task 10: Workshop decor, wall and window spots (24 items) ✓
- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-robot.html`

- [x] **Step 1: Draw and name the same 24 ids as Task 4**

Use workshop counterparts within the spot shapes. Examples:
- `basil-print` → a circuit poster
- `fairy-lights` → an LED strip
- `wall-clock` → a digital clock panel
- `mirror` → a round monitor
- `sill-cat` → a waving robo-cat

Animated items use `room-fx`, including at least the LED strip, the monitors and the neon sign. Add the 24 names and `fx` marks.

- [x] **Step 2: Check fit and run the smoke**

Fill the 24 fit rows and fix any that are not ✓.
Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-robot.html`
Expected: `mockup smoke OK`. The 24 ids are no longer missing.

### Task 11: Workshop decor, rug and back-of-room floor spots (18 items) ✓
- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-robot.html`

- [x] **Step 1: Draw and name the same 18 ids as Task 5**

Use workshop counterparts. Rugs become rubber mats, anti-static mats or hazard mats inside `GEOMETRY.RUG`. Examples:
- `side-table-lamp` → a tool cart with a work lamp
- `record-player` → a turntable deck with LEDs
- `toy-chest` → a parts bin

Add the 18 names and `fx` marks.

- [x] **Step 2: Check fit and run the smoke**

Fill the 18 fit rows and fix any that are not ✓.
Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-robot.html`
Expected: `mockup smoke OK`. The 18 ids are no longer missing.

### Task 12: Workshop decor, front-of-room floor spots (13 items), then completeness ✓
- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-robot.html`

- [x] **Step 1: Draw and name the same 13 ids as Task 6**

Use workshop counterparts. Examples:
- `lemon-tree` → a hydroponic tube
- `guitar` → a synth keyboard
- `pip-ball` → a bouncing drone ball

Add the 13 names and `fx` marks. The names table now has 70 rows and the fit table 75, all ✓.

- [x] **Step 2: Run the smoke in complete mode**

Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-robot.html --expect-complete`
Expected: `missing: 0`, label counts 5 / 55 / 10, `mockup smoke OK`, exit 0.

- [x] **Step 3: Open it and check the toggles**

Run: `Start-Process foodbytes-app\mockup\pip-room-robot.html`
Expected (manual):
- The console is empty.
- **Low FX** stops scan, blink, fan, buzz and rain, and the neon glow goes flat.
- **Reduced motion** stops everything.
- **Thumbnails** are still.
- **Widths:** the page works at 320 px and 1280 px with no horizontal page scroll.

---

## Phase 3 — Room UI chrome mockup

Builds `pip-room-chrome.html`: the token audit first (the data), then the surfaces that read it, then the contrast check. The file opens cleanly after each task.

### Task 13: Audit the chrome colour literals into a token table ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/mockup/pip-room-chrome.html`
- Create: `.claude/contract/2026-11-16-themed-pip-rooms-mockups/chrome-smoke.mjs`

- [x] **Step 1: List every literal**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\PetView.css,foodbytes-app\client\src\components\pet\room\*.css -Pattern "#[0-9a-fA-F]{3,8}\b|rgba?\(" | Select-Object Path,LineNumber,Line`
Expected: about 250 hits across `PetView.css` and the nine room CSS files.

- [x] **Step 2: Classify each literal into `<script id="token-table" type="application/json">`**

Write one JSON object `{ "tokens": [...], "roomArt": [...], "pairs": [...] }`:
- **`tokens` rows:** `{ token, area, defaultValue, sources: ["room/ShopView.css:12", …], parchment, cyberpunk, kind }`, where `kind` is `"new"` or `"existing:--<global token>"`.
  - Reuse an existing global token (from `foodbytes-app/client/src/styles/themes/default.css`) whenever the literal equals its Default value.
  - Otherwise name a new token `--pet-<area>-<role>`.
  - **Defaults:** `defaultValue` is exactly the literal as written in the source.
  - **Parchment and Cyberpunk values** are proposed from those themes' palettes in `foodbytes-app/client/src/styles/themes/parchment.css` / `cyberpunk.css`.
- **`roomArt` rows:** `{ value, sources, reason }` for literals that stay room art, including the fridge gauge band colours used by the room SVG.
- **`pairs` rows:** `{ fg, bg, min }`, one for every text-on-background combination the surfaces use. `min` is 4.5 for text and 3 for large text and non-text UI.

- [x] **Step 3: Write the chrome smoke**

Create `chrome-smoke.mjs`. Usage: `node chrome-smoke.mjs <path-to-chrome-html>`.
1. Parse the `token-table` JSON.
2. For every `tokens[].sources` and `roomArt[].sources` entry, read that line of `foodbytes-app/client/src/components/pet/<path>` and assert it contains the `defaultValue` (tokens) or `value` (roomArt), case-insensitive.
3. Re-run the Step 1 search in node (same files, same regex). Assert that every hit is covered by exactly one source entry, so no literal is unclassified or double-classified.
4. For each theme (default, parchment, cyberpunk) and each pair, resolve both token values (a token's `kind: existing:--x` resolves through that theme's file in `foodbytes-app/client/src/styles/themes/`). Compute the WCAG contrast with the same formula as `foodbytes-app/client/scripts/check-themes.mjs`, and fail when the result is below `min`.
5. Print `chrome smoke OK: <n> tokens, <m> room-art literals, <p> pairs × 3 themes`.

- [x] **Step 4: Run it**

Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\chrome-smoke.mjs foodbytes-app\mockup\pip-room-chrome.html`
Expected: `chrome smoke OK: …`, exit 0. Every literal is covered and every pair passes AA in all three themes. Fix any failing value in the table and re-run.

### Task 14: Draw every room UI surface in three themes and two widths ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-chrome.html`

- [x] **Step 1: Write the token blocks and the chrome CSS**

- **Token blocks.** From the token table, generate (by hand, into `<style>`) `:root[data-theme="default"]`, `:root[data-theme="parchment"]` and `:root[data-theme="cyberpunk"]` blocks setting every `--pet-*` token, plus the global tokens the surfaces read.
- **Chrome CSS.** Copy the rules for the surfaces from the ten pet CSS files, with each classified literal replaced by its `var(--…)`. Room-art literals stay literal.
- **Fonts.** Load the themes' fonts from the `fontsHref` values in `foodbytes-app/client/src/constants/themes.js`.

- [x] **Step 2: Write the surfaces as static HTML with the live class names**

Draw every surface listed in plan.md → "Chrome file: surfaces drawn", with realistic copy taken from the live constants (`constants/petDecor.js`, `petShop.js`, `petRoom.js`, `pipWardrobe.js`).
- Behind each sheet, a flat band in the room's colour stands in for the room. A note in the header says the room art lives in the two room mockups.
- Station and decor names in the Shop and picker use the herb names in Default, the lair names in Parchment and the workshop names in Cyberpunk, copied from the two room files' `labels` blocks.

- [x] **Step 3: Add the switcher and the side-by-side view**

The header carries:
- theme buttons: Default, Parchment, Cyberpunk
- width buttons: 375 and 1280, which set the frame width
- a "Side by side" toggle that renders the three themes next to each other at 375 px

All are `aria-pressed` buttons ≥44 px. Also add the token table rendered as an HTML table (token, area, Default swatch + value + sources, Parchment, Cyberpunk, kind), and add `<!-- approved: pending -->`.

- [x] **Step 4: Run the smoke**

Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\chrome-smoke.mjs foodbytes-app\mockup\pip-room-chrome.html`
Expected: `chrome smoke OK: …`, exit 0.

### Task 15: In-page contrast readout ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-chrome.html`

- [x] **Step 1: Add the readout**

A "Contrast" section lists every `pairs` row with its ratio per theme. The ratios are computed in the page from the computed styles on a probe element, using the WCAG formula from `foodbytes-app/client/scripts/check-themes.mjs`. Each cell is green when it is at least `min` and red when it is below. A line under it reads: "Contract 2 adds these pairs to `PAIRS.<id>` in `check-themes.mjs`."

- [x] **Step 2: Open it**

Run: `Start-Process foodbytes-app\mockup\pip-room-chrome.html`
Expected (manual):
- The console is empty.
- The Contrast section is all green and agrees with the smoke.
- Switching theme and width redraws every surface.
- The page works at 320 px with no horizontal page scroll.

---

## Phase 4 — README and developer approval

Registers the three files and runs the three review gates. A rejected file loops back to its phase. This phase ends when all three files carry an approval date.

### Task 16: Register the mockups in the README ✓

- Skill: none — documentation

**Files:**
- Modify: `foodbytes-app/mockup/README.md`

- [x] **Step 1: Add the table rows**

Under the `| File | What it shows |` table, add:
- `| `pip-room-dragon.html` | Pip's room as the dragon lair (Parchment): shell, 10 styles, 5 stations × 4 levels, all 55 decor items with lair names, effects, light ambience, Low FX / reduced-motion / hit-box toggles, thumbnails, names and fit tables. Built on the live room geometry. Source for contract 2 (engine, shell, stations) and contract 3 (dragon decor). Contract `2026-11-16-themed-pip-rooms-mockups`. |`
- `| `pip-room-robot.html` | Pip's room as the robot workshop (Cyberpunk), with the same contents. Source for contracts 2 and 4. |`
- `| `pip-room-chrome.html` | The room's UI (Shop, decor picker, Fridge, Trophy cabinet, Dress Pip, edit bar, head bar, check-in) in Default, Parchment and Cyberpunk at 375 / 1280 px, with the proposed `--pet-*` role-token table and contrast pairs. Source for contract 2's chrome token split. |`

- [x] **Step 2: Add the review note**

Add a section `## Proposal in review: themed Pip rooms (2026-11-16)` after the existing proposal section. It is three lines:
- The rooms follow the creature (`theme.pipLine`).
- Ids, spots, prices and ownership are shared, and each creature draws and names everything its own way.
- Nothing is built yet, and contracts 2–4 port these files.

- [x] **Step 3: Verify**

Run: `Select-String -Path foodbytes-app\mockup\README.md -Pattern "pip-room-(dragon|robot|chrome)\.html"`
Expected: at least three hits, one per file in the table.

### Task 17: Developer approves `pip-room-dragon.html` ✓

- Skill: none — developer review gate

- [x] **Step 1: Developer reviews the lair**

The developer opens the file and checks:
- the art, at every station level, style and decor item
- the fit, with the overlay on
- the names, red-lining any in the names table
- the ambience, including Low FX and reduced motion

Changes loop back to Phase 1. On approval, replace `<!-- approved: pending -->` with `<!-- approved YYYY-MM-DD -->` and note any renamed items in the names table.
Expected: the developer says "approved".

### Task 18: Developer approves `pip-room-robot.html` ✓

- Skill: none — developer review gate

- [x] **Step 1: Developer reviews the workshop**

These are the same checks as Task 17, plus a decision on the night-window rain, the spec's open question. On approval, either keep the rain and delete its pending note, or remove it from `ROBOT_ROOM.ambience`. Stamp the approval comment.
Expected: the developer says "approved".

### Task 19: Developer approves `pip-room-chrome.html` ✓

- Skill: none — developer review gate

- [x] **Step 1: Developer reviews the chrome**

The developer checks every surface in each theme and width, the token names, and the proposed Parchment and Cyberpunk values. Changes go into the token table, then the smoke is re-run. Stamp the approval comment on approval.
Run after any change: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\chrome-smoke.mjs foodbytes-app\mockup\pip-room-chrome.html`
Expected: `chrome smoke OK: …`, and the developer says "approved".

---

## Phase 5 — Final verification

The version bump plus checks confirming that no app code changed. No backend suite run is needed, because nothing under `foodbytes-api/` changes beyond `pom.xml`'s version (Task M.2 proves it).

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. This work has no Jira key and is not a bug fix, so bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — 2026-11-16-themed-pip-rooms-mockups: mockups for Pip's dragon lair, robot workshop and themed room UI (no app change)`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: No app code changed ✓

- Skill: none — verification only

- [x] **Step 1: Only the version lines changed outside the mockup folder**

Run: `git diff --stat HEAD -- foodbytes-app/client foodbytes-app/foodbytes-api`
Expected: only `foodbytes-app/client/package.json` and `foodbytes-app/foodbytes-api/pom.xml`, each 1 line changed.

- [x] **Step 2: Both room smokes and the chrome smoke are green**

Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-dragon.html --expect-complete; node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-robot.html --expect-complete; node .claude\contract\2026-11-16-themed-pip-rooms-mockups\chrome-smoke.mjs foodbytes-app\mockup\pip-room-chrome.html`
Expected: `mockup smoke OK` twice and `chrome smoke OK: …`, all with exit 0.

- [x] **Step 3: Every file carries an approval date**

Run: `Select-String -Path foodbytes-app\mockup\pip-room-*.html -Pattern "approved \d{4}-\d{2}-\d{2}"`
Expected: three hits, one per file, and none still reading `approved: pending`.

### Task M.3: Client still builds ✓

- Skill: none — verification only

- [x] **Step 1: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors (unchanged by this contract, run as the standard gate).

### Task M.4: Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/2026-11-16-themed-pip-rooms-mockups/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- a link to `plan.md` in this folder
- a summary: three mockups, with the approval dates and the new version from Task M.1
- migration: none, and no app code changed (cite Task M.2)
- the smoke outputs
- the names and decisions changed at review (renames, the rain decision)
- a one-line note for contracts 2–4: "Port from `foodbytes-app/mockup/pip-room-*.html`; the room packs and token table are laid out in the shape contract 2 implements; re-run `mockup-smoke.mjs` first to confirm the copied geometry still matches the live code."
- a suggested commit subject: `2026-11-16-themed-pip-rooms-mockups: themed Pip room mockups (lair, workshop, room UI)`

---

## Self-review

**Spec coverage:**
- Dragon lair mockup (shell, styles, stations ×4, 55 decor with names, day/night, effects, ambience, toggles, overlay, thumbnails, herb reference): Tasks 1–6.
- Robot workshop mockup: Tasks 7–12.
- Chrome mockup (surfaces × 3 themes × 2 widths, token table with Default literals and sources, contrast pairs): Tasks 13–15.
- README rows and the proposal note: Task 16.
- Approval gate per file: Tasks 17–19.
- Fixed geometry proven: Task 1 (geometry copied, and the smoke diffs it against the live lines), Tasks 3–6 and 9–12 (overlay fit tables).
- Names per creature (70 each): Tasks 2–6 and 8–12, with the counts asserted by the `--expect-complete` smoke.
- Light ambience stopped by Low FX, reduced motion and thumbnails: Tasks 2 and 8 (CSS), Tasks 6 and 12 (manual check), the conventions block.
- Robot rain open question: Task 8 (flagged) and Task 18 (decided).
- Version bump: Task M.1. No app code: Task M.2.

**Placeholder scan:** No `TBD`, `TODO` or "implement later". Every step names its ids, files and commands. The proposed names given in steps are marked as examples for review, and the actual list is the names table that the smoke asserts complete.

**Type / name consistency:** `GEOMETRY`, `IDS`, `HERB_LABELS`, `HERB_REFERENCE`, `DRAGON_ROOM`, `ROBOT_ROOM`, `renderRoomSVG(pack, state)`, `thumbSVG(pack, kind, id, level)`, `creatureSVG(form, mood)`, the script block ids (`room-geometry`, `room-iso`, `room-creature`, `room-pack`, `room-engine`, `room-ui`, `token-table`), the `room-fx room-fx--<effect>` classes and `--pet-<area>-<role>` match plan.md → Data shapes and are used identically in both smokes.

**Phase boundary cleanliness:**
- **Phase 1:** the lair file opens with no errors after every task, with missing art shown as red boxes.
- **Phase 2:** the same holds for the workshop file.
- **Phase 3:** the chrome file and its smoke are green after each task.
- **Phase 4:** documentation and review only.
- **Phase 5:** the version bump only. No app code changes in any phase, so the client build stays green throughout.
