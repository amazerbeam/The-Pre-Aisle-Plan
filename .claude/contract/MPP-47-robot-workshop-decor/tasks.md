# Tasks: Themed Pip rooms — robot workshop decor (55 items and names)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-16

**Goal:** On Cyberpunk every one of the 55 decor items draws as its workshop counterpart (ported from `pip-room-robot.html`) and is named with its workshop name on every surface, while ids, spots, ownership and the herb/dragon rooms stay unchanged.

**Spec:** `plan.md` in this folder.

All commands run from `foodbytes-app\client` in PowerShell unless a step says otherwise.

---

## File map

**Created:**
- `.claude/contract/MPP-47-robot-workshop-decor/ssr-baseline/` — herb room SSR snapshot taken before any edit (drift guard)
- `.claude/contract/MPP-47-robot-workshop-decor/dragon-baseline.txt` — the 55 dragon decor drawings + names taken before any edit (Parchment drift guard)
- `client/src/components/pet/room/packs/robot/robotDecorParts.jsx` — decor-only helpers + decor constants ported from the mockup
- `client/src/components/pet/room/packs/robot/robotDecor.js` — merges the five area maps into `ROBOT_DECOR`
- `client/src/components/pet/room/packs/robot/robotDecorWalls.jsx` — 14 wall items
- `client/src/components/pet/room/packs/robot/robotDecorWindow.jsx` — 10 window-dressing and windowsill items
- `client/src/components/pet/room/packs/robot/robotDecorRugs.jsx` — 6 mats
- `client/src/components/pet/room/packs/robot/robotDecorFloorBack.jsx` — 12 back-corner, bedside-nook, foot-of-bed items
- `client/src/components/pet/room/packs/robot/robotDecorFloorFront.jsx` — 13 by-fridge, corner-by-door, front-of-room items

**Modified:**
- `client/src/components/pet/room/packs/robot/robotRoom.js:12,20,22-36` — `decor: ROBOT_DECOR`, 25 decor ambience entries, doc comments
- `client/src/constants/petRoomLabels.js:6,58-73` — `ROBOT_LABELS.decor` (55 names), doc comments
- `client/src/components/pet/room/room.check.mjs:310` — robot bought line now uses the workshop name
- `client/src/utils/sprinkleHistory.check.mjs` — robot recent-row assert
- `client/src/components/pet/room/packs/packs.check.mjs:28-29` — `FULL_DECOR_LINES` gains `PIP_LINE.ROBOT`
- `foodbytes-app/mockup/README.md:12,30` — robot decor live
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump

**Deleted:** (none)

---

## Port conventions (apply in every Phase 2 drawing task)

Source is `foodbytes-app/mockup/pip-room-robot.html`, `ROBOT_ROOM.decor` (lines 1291–1614). Port each builder **verbatim** — same coordinates, colours, delays — translating only the form, exactly as MPP-45 did in `robotBed.jsx` / `robotParts.jsx` and MPP-46 did in `dragonDecor*.jsx`:

| Mockup | Live |
|---|---|
| `a + b + c` / `[…].map(…).join('')` returning a string | `cat(a, b, c)` / `cat(...[…].map(…))` (keyless Fragment children) from `../packShapes` |
| `poly`, `isoLine`, `isoLines`, `box`, `rectV/U/H`, `ellH`, `cylE`, `cyl`, `bill`, `fxg` | the same names from `S` (`./robotParts` → `S = packShapes(ROBOT_INK)`), destructured as `robotBed.jsx` does |
| `bill(u, v, h, inner, [bounds])` | `bill(u, v, h, inner)` — drop the 5th (measurer-only) argument |
| `glow(c, inner, r)` and `` `<g ${glowAttr(c, r)}>…</g>` `` | `glowG(c, inner, r)` from `../packShapes` |
| inline SVG string (`<path d=".." stroke-width="1.4" stroke-linejoin="round"/>`) | JSX (`<path d=".." strokeWidth="1.4" strokeLinejoin="round" />`); also `stroke-linecap`→`strokeLinecap`, `fill-opacity`→`fillOpacity`, `stroke-opacity`→`strokeOpacity`, `stroke-dasharray`→`strokeDasharray`, `font-size`→`fontSize`, `font-weight`→`fontWeight`, `text-anchor`→`textAnchor` |
| `transform="rotate(${a})"` / `transform="scale(${s})"` | `transform={`rotate(${a})`}` / `transform={`scale(${s})`}` |
| `${ART_INK}` | `ROBOT_INK` from `./robotPalette` |
| `${expr}` inside a string attribute | `{expr}` (keep `fmt(...)` where the mockup formats; `fmt` from `../packShapes`) |
| palette consts (`GUN`, `GUN_DK`, `GUN_LT`, `STEEL`, `STEEL_DK`, `OLIVE`, `OLIVE_DK`, `SCREEN`, `SCREEN_LT`, `NEON`, `PINK`, `LIME`, `AMBER`, `RUST`, `HAZ`, `HAZ_DK`, `GLASS`, `FROST`, `CABLE_DK`) | `./robotPalette`; decor-only ones (`HI`, `PLATE`, `INKBLUE`) from `./robotDecorParts` |
| `led`, `ledOn`, `neon`, `discV/U`, `seamsV/U`, `slotsV/U`, `rivetsV/U`, `screenV/U`, `traceV/U`, `scanV/U`, `hazardV/U`, `glassV/U`, `coil`, `vialRows`, `armSeg`, `joint`, `dial`, `fanBill`, `sensor` | `./robotParts` |
| `ellU`, `slabU`, `bandAt`, `ringLine`, `ellBand`, `limb`, `gear`, `hat`, `digit7` | `./robotDecorParts` (Task 3) |
| `GEOMETRY.RUG` | `RUG` from `../../roomLayout` (same `cu`, `cv`, `ru`, `rv`) |
| `P`, `ellipsePoints`, `rectUPoints`, `shade` | `../../iso`; `tint`, `rnd`, `arcPts`, `nearRange` from `../packShapes` |

If a mockup helper is used that is in neither `robotParts.jsx` nor this table, stop and ask — do not invent one. Keep the mockup's one-line `//` comment above each item and its `/* ---------- spot ---------- */` group comments. The 12 legacy ids (`basil-print`, `recipe-board`, `herb-shelf`, `fairy-lights`, `wall-clock`, `bunting`, `pan-rail`, `mirror`, `watering-can`, `cookbook-stack`, `bean-bag`, `lemon-tree`) stay in MPP-27 coords — `packDecorArt` already shifts them (MPP-46). Never use `dangerouslySetInnerHTML`. Each file stays under 400 lines; if one would pass 400, split it by spot into a second file and spread both in `robotDecor.js`.

---

## Phase 1 — Drift baselines

Snapshot the herb room and the dragon decor before touching anything. Read-only on production code; the build is unaffected.

### Task 1: Write the herb SSR baseline ✓

- Skill: react-frontend

**Files:**
- Create: `.claude/contract/MPP-47-robot-workshop-decor/ssr-baseline/` (generated)

- [x] **Step 1: Snapshot before any source edit**

Run: `npm run snapshot:room -- --write ..\..\.claude\contract\MPP-47-robot-workshop-decor\ssr-baseline`
Expected: the folder holds the fixture files (`day-rug-l1-defaults.html`, `all-l4-every-spot.html`, `decor-thumbs.html`, `editing.html`, …), no error.

- [x] **Step 2: Confirm it compares clean**

Run: `npm run snapshot:room -- --compare ..\..\.claude\contract\MPP-47-robot-workshop-decor\ssr-baseline`
Expected: `Room SSR OK: <n> fixtures identical`, exit code 0.

### Task 2: Write the dragon decor baseline ✓

- Skill: react-frontend

**Files:**
- Create: `.claude/contract/MPP-47-robot-workshop-decor/dragon-baseline.txt` (generated)

- [x] **Step 1: Snapshot the 55 dragon drawings and names**

Run:
```powershell
node --input-type=module -e "import { writeFileSync } from 'node:fs'; import { withSsr } from './scripts/ssrLoad.mjs'; await withSsr(async (load) => { const { createElement: h } = await import('react'); const { renderToStaticMarkup } = await import('react-dom/server'); const { ROOM_PACKS, packDecorArt } = await load('/src/components/pet/room/roomPacks.jsx'); const { decorLabel } = await load('/src/constants/petRoomLabels.js'); const { DECOR_ITEMS } = await load('/src/constants/petDecor.js'); const ids = Object.keys(DECOR_ITEMS); writeFileSync('../../.claude/contract/MPP-47-robot-workshop-decor/dragon-baseline.txt', ids.map((id) => id + '|' + decorLabel('dragon', id) + '|' + renderToStaticMarkup(h('svg', null, packDecorArt(ROOM_PACKS.dragon, id)))).join('\n') + '\n'); console.log(ids.length + ' dragon decor lines written') })"
```
Expected: `55 dragon decor lines written`.

- [x] **Step 2: Note the compare command** (used again in Tasks 11 and 16)

Run:
```powershell
node --input-type=module -e "import { readFileSync } from 'node:fs'; import { withSsr } from './scripts/ssrLoad.mjs'; await withSsr(async (load) => { const { createElement: h } = await import('react'); const { renderToStaticMarkup } = await import('react-dom/server'); const { ROOM_PACKS, packDecorArt } = await load('/src/components/pet/room/roomPacks.jsx'); const { decorLabel } = await load('/src/constants/petRoomLabels.js'); const { DECOR_ITEMS } = await load('/src/constants/petDecor.js'); const now = Object.keys(DECOR_ITEMS).map((id) => id + '|' + decorLabel('dragon', id) + '|' + renderToStaticMarkup(h('svg', null, packDecorArt(ROOM_PACKS.dragon, id)))).join('\n') + '\n'; const base = readFileSync('../../.claude/contract/MPP-47-robot-workshop-decor/dragon-baseline.txt', 'utf8'); if (now !== base) { console.error('DRAGON DECOR DRIFT'); process.exit(1) } console.log('Dragon decor identical') })"
```
Expected: `Dragon decor identical`, exit code 0.

---

## Phase 2 — Port the 55 workshop drawings

Port the helpers, wire an empty `ROBOT_DECOR` into the pack, then add one area file at a time. `packs.check.mjs` already renders every decor id for every pack through `packDecorArt` (MPP-46), so each newly drawn robot id is checked for finite markup as it lands; unported ids still fall back to herb, and the phase can stop between any two tasks with the build green.

### Task 3: Port the decor-only helpers and constants ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/robot/robotDecorParts.jsx`
- Modify: `client/src/components/pet/room/packs/robot/robotParts.jsx` (doc comment only)

- [x] **Step 1: Write `robotDecorParts.jsx`**

Port `pip-room-robot.html` lines 995–1026 per the Port conventions. File order: imports → constants → private helpers → exports. Exports, with these signatures:

```jsx
export const HI = 'rgba(255,255,255,.7)'
export const PLATE = '#2d3a48'
export const INKBLUE = '#10171d'
export const ellU = (up, vc, hc, rv, rh, fill, o, n = 16) => …            // poly of ringPts on plane u = up
export const slabU = (up, th, vh, fill, o) => …                             // cat(back copy shade(fill, -22), front copy at up + th)
export const bandAt = (cu, cv, r, h, color = GUN_DK, w = 1.4) => …         // isoLine(arcPts(cu, cv, h, r, r, ...nearRange(r, r)), w, color)
export const ringLine = (cu, cv, h, ru, rv, w, color, dash) => …           // isoLine([...p, p[0]], w, color, dash ? { dash } : {}) with p = ellipsePoints(cu, cv, h, ru, rv, 32)
export function ellBand(cu, cv, ru, rv, a, b, h, fill) { … }                // poly(..., fill, { stroke: null })
export const limb = (d, w, color) => (<><path d={d} fill="none" stroke={ROBOT_INK} strokeWidth={w + 2.4} strokeLinecap="round" strokeLinejoin="round" /><path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /></>)
export const gear = (u, v, h, r, color) => …                                // bill(u, v, h, <><path d={teeth} … /><circle cy={fmt(-r * 0.5)} r={fmt(r * 0.28)} fill={INKBLUE} /></>)
export const hat = (u, v, h, s = 1) => …                                    // bill(u, v, h, <g transform={`scale(${s})`}>…</g>)
export const digit7 = (n, x, y) => <path transform={`translate(${x} ${y})`} d={[...SEG7[n]].map((k) => SEG7_D[k]).join('')} fill="none" stroke={NEON} strokeWidth="1.3" strokeLinecap="round" />
```

`ringPts`, `SEG7` and `SEG7_D` stay file-private. `S.isoLine` already accepts `{ dash }` (`packShapes.jsx`, MPP-46). Header doc comment: "MPP-47: the workshop decor's helpers and decor constants (pip-room-robot.html lines 995-1026)."

In `robotParts.jsx` append to the doc comment: "Decor-only helpers live in robotDecorParts.jsx (MPP-47)."

- [x] **Step 2: Verify it compiles**

Run: `node --input-type=module -e "import { withSsr } from './scripts/ssrLoad.mjs'; await withSsr(async (load) => { const m = await load('/src/components/pet/room/packs/robot/robotDecorParts.jsx'); console.log(Object.keys(m).sort().join(',')) })"`
Expected: `HI,INKBLUE,PLATE,bandAt,digit7,ellBand,ellU,gear,hat,limb,ringLine,slabU`

### Task 4: Wire ROBOT_DECOR into the pack (empty) with the decor ambience ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/robot/robotDecor.js`
- Modify: `client/src/components/pet/room/packs/robot/robotRoom.js:1-12,20,22-36`

- [x] **Step 1: Create the merge module**

```js
/**
 * MPP-47: the workshop's 55 decor drawings (pip-room-robot.html ROBOT_ROOM.decor, approved 2026-11-16), merged from the area files.
 * World coords; the 12 legacy ids are in MPP-27 coords and slid by packDecorArt.
 */
export const ROBOT_DECOR = {}
```

- [x] **Step 2: Register it and the ambience**

In `robotRoom.js`: add `import { ROBOT_DECOR } from './robotDecor'`; set `decor: ROBOT_DECOR`; change the doc comment to `/** MPP-45/47: the robot workshop (pip-room-robot.html ROBOT_ROOM, approved 2026-11-16). */`; replace the ambience comment with `// What animates, by target (pip-room-robot.html lines 1654-1676).`; add a comma after the last existing entry (`{ target: 'wardrobe', effect: 'blink' }`) and append, verbatim from mockup lines 1668–1675:

```js
    // decor
    { target: 'fairy-lights', effect: 'blink' }, { target: 'recipe-board', effect: 'scan' }, { target: 'pip-portrait', effect: 'scan' }, { target: 'photo-strip', effect: 'scan' },
    { target: 'wall-sconce', effect: 'buzz' }, { target: 'wall-clock', effect: 'blink' }, { target: 'bunting', effect: 'blink' }, { target: 'mirror', effect: 'scan' },
    { target: 'window-lights', effect: 'blink' }, { target: 'plant-hanger', effect: 'buzz' }, { target: 'sill-basil', effect: 'buzz' }, { target: 'sill-cactus', effect: 'blink' },
    { target: 'sill-radio', effect: 'blink' }, { target: 'sill-cat', effect: 'blink' },
    { target: 'cactus', effect: 'buzz' }, { target: 'side-table-lamp', effect: 'buzz' }, { target: 'record-player', effect: 'blink' }, { target: 'plant-stand', effect: 'buzz' },
    { target: 'stool-books', effect: 'blink' }, { target: 'laundry-basket', effect: 'blink' },
    { target: 'lemon-tree', effect: 'blink' }, { target: 'monstera', effect: 'blink' }, { target: 'arc-lamp', effect: 'buzz' }, { target: 'tea-table', effect: 'buzz' }, { target: 'pip-ball', effect: 'buzz' }
```

- [x] **Step 3: Verify**

Run: `npm run check:room`
Expected: `room checks passed`, `Room packs OK: herb, dragon, robot` (ambience targets are decor ids and the effects exist in `roomFx.css`).

### Task 5: Port the wall decor (14 items) ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/robot/robotDecorWalls.jsx`
- Modify: `client/src/components/pet/room/packs/robot/robotDecor.js`

- [x] **Step 1: Port**

Port mockup lines 1292–1372 (`/* over the wardrobe */`, `/* bedside wall */`, `/* front right wall */`) per the Port conventions into `export const ROBOT_WALL_DECOR = { … }` with these ids in this order: `basil-print`, `recipe-board`, `herb-shelf`, `fairy-lights`, `pip-portrait`, `growth-chart`, `meal-calendar`, `wall-sconce`, `photo-strip`, `wall-clock`, `bunting`, `pan-rail`, `mirror`, `coat-hooks`. `wall-clock` uses `digit7` inside one `glowG(NEON, …, 2)`; `wall-sconce` is ported verbatim (small at thumbnail size — checked in Task 12, not resized).

- [x] **Step 2: Register**

`robotDecor.js`: `import { ROBOT_WALL_DECOR } from './robotDecorWalls'` and `export const ROBOT_DECOR = { ...ROBOT_WALL_DECOR }`.

- [x] **Step 3: Verify**

Run: `npm run check:room; (Get-Content src\components\pet\room\packs\robot\robotDecorWalls.jsx | Measure-Object -Line).Lines`
Expected: both checks pass; line count < 400.

### Task 6: Port the window decor (10 items) ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/robot/robotDecorWindow.jsx`
- Modify: `client/src/components/pet/room/packs/robot/robotDecor.js`

- [x] **Step 1: Port**

Port mockup lines 1373–1434 (`/* window dressing */`, `/* windowsill */`) into `export const ROBOT_WINDOW_DECOR = { … }`: `curtains-gingham`, `curtains-linen`, `roller-blind`, `window-lights`, `plant-hanger`, `sill-basil`, `sill-succulents`, `sill-cactus`, `sill-radio`, `sill-cat`. `sill-succulents` and `sill-cactus` are ported verbatim (checked at the shop crop in Task 12).

- [x] **Step 2: Register**

Add `...ROBOT_WINDOW_DECOR` to `ROBOT_DECOR` with its import.

- [x] **Step 3: Verify**

Run: `npm run check:room; (Get-Content src\components\pet\room\packs\robot\robotDecorWindow.jsx | Measure-Object -Line).Lines`
Expected: both checks pass; line count < 400.

### Task 7: Port the mats (6 items) ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/robot/robotDecorRugs.jsx`
- Modify: `client/src/components/pet/room/packs/robot/robotDecor.js`

- [x] **Step 1: Port**

Port mockup lines 1435–1489 (`/* rug */`) into `export const ROBOT_RUG_DECOR = { … }`: `rug-pink`, `rug-braided`, `rug-leaf`, `rug-stripe`, `rug-picnic`, `rug-sheepskin`. Where the mockup reads `GEOMETRY.RUG`, use `RUG` from `../../roomLayout`.

- [x] **Step 2: Register**

Add `...ROBOT_RUG_DECOR` to `ROBOT_DECOR` with its import.

- [x] **Step 3: Verify**

Run: `npm run check:room; (Get-Content src\components\pet\room\packs\robot\robotDecorRugs.jsx | Measure-Object -Line).Lines`
Expected: both checks pass; line count < 400.

### Task 8: Port the back-floor decor (12 items) ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/robot/robotDecorFloorBack.jsx`
- Modify: `client/src/components/pet/room/packs/robot/robotDecor.js`

- [x] **Step 1: Port**

Port mockup lines 1490–1546 (`/* back corner */`, `/* bedside nook */`, `/* foot of the bed */`) into `export const ROBOT_FLOOR_BACK_DECOR = { … }`: `snake-plant`, `cactus`, `umbrella-stand`, `broom`, `side-table-lamp`, `record-player`, `plant-stand`, `stool-books`, `toy-chest`, `bench`, `laundry-basket`, `slippers`.

- [x] **Step 2: Register**

Add `...ROBOT_FLOOR_BACK_DECOR` to `ROBOT_DECOR` with its import.

- [x] **Step 3: Verify**

Run: `npm run check:room; (Get-Content src\components\pet\room\packs\robot\robotDecorFloorBack.jsx | Measure-Object -Line).Lines`
Expected: both checks pass; line count < 400.

### Task 9: Port the front-floor decor (13 items) ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/robot/robotDecorFloorFront.jsx`
- Modify: `client/src/components/pet/room/packs/robot/robotDecor.js`

- [x] **Step 1: Port**

Port mockup lines 1547–1613 (`/* by the fridge */`, `/* corner by the door */`, `/* front of the room */`, through `picnic-basket`) into `export const ROBOT_FLOOR_FRONT_DECOR = { … }`: `watering-can`, `cookbook-stack`, `bean-bag`, `lemon-tree`, `veg-basket`, `monstera`, `coat-stand`, `arc-lamp`, `guitar`, `pouffe`, `tea-table`, `pip-ball`, `picnic-basket`.

- [x] **Step 2: Register**

`robotDecor.js` final form:

```js
import { ROBOT_WALL_DECOR } from './robotDecorWalls'
import { ROBOT_WINDOW_DECOR } from './robotDecorWindow'
import { ROBOT_RUG_DECOR } from './robotDecorRugs'
import { ROBOT_FLOOR_BACK_DECOR } from './robotDecorFloorBack'
import { ROBOT_FLOOR_FRONT_DECOR } from './robotDecorFloorFront'

/** (doc comment from Task 4) */
export const ROBOT_DECOR = { ...ROBOT_WALL_DECOR, ...ROBOT_WINDOW_DECOR, ...ROBOT_RUG_DECOR, ...ROBOT_FLOOR_BACK_DECOR, ...ROBOT_FLOOR_FRONT_DECOR }
```

- [x] **Step 3: Verify count, render and size**

Run: `npm run check:room; node --input-type=module -e "import { withSsr } from './scripts/ssrLoad.mjs'; await withSsr(async (load) => { const { ROBOT_DECOR } = await load('/src/components/pet/room/packs/robot/robotDecor.js'); const { DECOR_ITEMS } = await load('/src/constants/petDecor.js'); const missing = Object.keys(DECOR_ITEMS).filter(id => !ROBOT_DECOR[id]); console.log(Object.keys(ROBOT_DECOR).length, missing.join(',') || 'none missing') })"; (Get-Content src\components\pet\room\packs\robot\robotDecorFloorFront.jsx | Measure-Object -Line).Lines`
Expected: both checks pass; `55 none missing`; line count < 400.

---

## Phase 3 — Workshop names and full coverage

Add the 55 workshop names (every surface already reads them through `decorLabel`), then put robot in `FULL_DECOR_LINES`. Herb and dragon names are untouched, so both drift guards stay identical.

### Task 10: Workshop decor names ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/constants/petRoomLabels.js:6,58-73`
- Test: `client/src/components/pet/room/room.check.mjs:310`
- Test: `client/src/utils/sprinkleHistory.check.mjs`

- [x] **Step 1: Write the failing asserts**

In `room.check.mjs` replace line 310 with:

```js
assert.equal(decorBoughtLine('bunting', room, 'robot'), 'Pennant lights bought. Swap it in with ✏️ Edit room.') // MPP-47: robot decor names
assert.equal(decorBoughtLine('rug-stripe', room, 'robot'), 'Hazard mat bought and applied.')
```

In `sprinkleHistory.check.mjs`, directly after the MPP-46 dragon assert:

```js
// MPP-47: and in the workshop.
assert.equal(groupRecent([{ sourceType: 'DECOR_PURCHASE', amount: -120, decorItem: 'herb-shelf', createdAt: at('2026-10-13') }], 'robot')[0].text, 'Bought the Sample rack')
```

Run: `node src/components/pet/room/room.check.mjs; npm run check:sprinkles`
Expected: both FAIL (`Bunting bought…` ≠ `Pennant lights bought…`; `Bought the Herb shelf` ≠ `Bought the Sample rack`).

- [x] **Step 2: Add the names**

In `petRoomLabels.js`: change the `ROBOT_LABELS` comment to `// pip-room-robot.html ROBOT_ROOM.labels (approved 2026-11-16).`; change the file doc comment (line 6) to "MPP-45/46/47: station, level, style and decor names per Pip line."; add `decor` to `ROBOT_LABELS` between `levels` and `styles`, copied verbatim from `pip-room-robot.html` lines 1689–1713:

```js
  decor: {
    // over the wardrobe
    'basil-print': 'Circuit poster', 'recipe-board': 'Schematic slate', 'herb-shelf': 'Sample rack', 'fairy-lights': 'LED strip', 'pip-portrait': 'Pip scan portrait',
    // bedside wall
    'growth-chart': 'Height gauge', 'meal-calendar': 'Schedule panel', 'wall-sconce': 'Work lamp', 'photo-strip': 'Monitor stack',
    // front right wall
    'wall-clock': 'Digital clock', bunting: 'Pennant lights', 'pan-rail': 'Tool rail', mirror: 'Round monitor', 'coat-hooks': 'Gear hooks',
    // window dressing
    'curtains-gingham': 'Strip curtain', 'curtains-linen': 'Blackout shutters', 'roller-blind': 'Security shutter', 'window-lights': 'Window LED border', 'plant-hanger': 'Hanging grow pod',
    // windowsill
    'sill-basil': 'Grow-light seedlings', 'sill-succulents': 'Memory chips', 'sill-cactus': 'Antenna pair', 'sill-radio': 'Comms radio', 'sill-cat': 'Robo-cat',
    // rug
    'rug-pink': 'Rubber mat', 'rug-braided': 'Anti-static mat', 'rug-leaf': 'Circuit mat', 'rug-stripe': 'Hazard mat', 'rug-picnic': 'Tool-outline mat', 'rug-sheepskin': 'Foam pad',
    // back corner
    'snake-plant': 'Fibre-optic plant', cactus: 'Spark coil', 'umbrella-stand': 'Probe drum', broom: 'Sweeper pole',
    // bedside nook
    'side-table-lamp': 'Tool cart and work lamp', 'record-player': 'Turntable deck', 'plant-stand': 'Power-cell stand', 'stool-books': 'Stool and manuals',
    // foot of the bed
    'toy-chest': 'Parts bin', bench: 'Steel workbench', 'laundry-basket': 'Scrap bin', slippers: 'Boot mat',
    // by the fridge
    'watering-can': 'Coolant can', 'cookbook-stack': 'Tablet stack', 'bean-bag': 'Crash cushion', 'lemon-tree': 'Hydroponic tube', 'veg-basket': 'Battery crate',
    // corner by the door
    monstera: 'Dish stand', 'coat-stand': 'Hard-hat stand', 'arc-lamp': 'Work-light tripod', guitar: 'Synth keyboard',
    // front of the room
    pouffe: 'Swivel stool', 'tea-table': 'Holo table', 'pip-ball': 'Drone ball', 'picnic-basket': 'Cargo case'
  },
```

- [x] **Step 3: Verify**

Run: `npm run check:room; npm run check:sprinkles`
Expected: `room checks passed`, `Room packs OK: herb, dragon, robot`, `sprinkleHistory: all checks passed`.

### Task 11: Require full robot decor coverage in packs.check.mjs ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/pet/room/packs/packs.check.mjs:28-29`

- [x] **Step 1: Add robot to the full-coverage set**

```js
  // MPP-46/47: lines whose pack draws and names every decor id itself (no herb fallback).
  const FULL_DECOR_LINES = new Set([PIP_LINE.DRAGON, PIP_LINE.ROBOT])
```

- [x] **Step 2: Verify, including both drift guards**

Run: `npm run check:room; npm run snapshot:room -- --compare ..\..\.claude\contract\MPP-47-robot-workshop-decor\ssr-baseline; npm run build`
Expected: `room checks passed`, `Room packs OK: herb, dragon, robot`; `Room SSR OK: <n> fixtures identical`; `built in <n>s`, no errors.

Then run the dragon compare command from Task 2 Step 2.
Expected: `Dragon decor identical`.

---

## Phase 4 — Visual check and mockup sync

Confirm on a real screen that every item sits in its spot and animates correctly, then mark the mockup README. No production code changes unless a slip is found (fix it in its `robotDecor*.jsx` file and re-run `check:room`).

### Task 12: Fit, thumbnail and animation check on localhost — manual verification for the developer (Ready for Test) — pending developer walk at Ready for Test

- Skill: react-frontend

**Files:**
- (none — verification; any coordinate slip found is fixed in its `robotDecor*.jsx` file)

- [ ] **Step 1: Confirm the mockup's fit table**

Open `foodbytes-app/mockup/pip-room-robot.html` in a browser, section "Fit". Expected: every decor row reads OK (no `+N px` overruns).

- [ ] **Step 2: Walk the workshop on localhost**

Start the backend with `$env:PET_FREE_MODE = "true"` (CLAUDE.md → Running the backend locally with Google login) and the client with `npm run dev`. At http://localhost:5173/pet, user menu → theme **Cyberpunk**:
- In ✏️ Edit room, open each of the 12 spots and place every item in turn. Expected: each workshop drawing sits inside the dashed spot outline; the 12 legacy ids land in their spots, not at MPP-27 positions; the picker shows workshop names and workshop thumbnails; spot buttons read the workshop name.
- Open the Shop → Decor tab. Expected: 55 workshop thumbnails with workshop names, nothing animating inside thumbnails. Look closely at **Work lamp**, **Antenna pair** and **Memory chips**: note whether each reads at the shop crop (report "too small" in the Ready-for-Test notes; do not resize in this story).
- With the LED strip, schematic slate, digital clock, pennant lights, round monitor and holo table placed: animations run; user menu → Low FX on → they stop and neon glow disappears in the room; Low FX off, Chrome DevTools → Rendering → emulate `prefers-reduced-motion: reduce` → they stop.
- Switch to **Default** and **Parchment**. Expected: the herb room and the dragon lair show the same placed items with their own drawings and names, unchanged.
- At 375 px width (DevTools device toolbar): picker and Shop Decor tab usable, long names ("Tool cart and work lamp") wrap without overflow.

### Task 13: Mockup README sync ✓

- Skill: none — documentation edit, no code

**Files:**
- Modify: `foodbytes-app/mockup/README.md:12,30`

- [x] **Step 1: Mark robot decor live**

Row `pip-room-robot.html` (line 12): replace "decor is pending MPP-47 (decor falls back to the herb art)." with "the 55 workshop decor drawings and names are live from v<new version> (MPP-47)." Line 30: replace "robot decor is pending MPP-47 and falls back to the herb art." with "the workshop decor is live from v<new version> (MPP-47)." (`<new version>` = the version written in Task 14 — do Task 14 Step 1 first if needed.)

- [x] **Step 2: Verify**

Run: `Select-String -Path ..\mockup\README.md -Pattern "pending MPP-47|falls back to the herb art"`
Expected: zero hits.

---

## Phase 5 — Final verification

No production changes beyond the version bump — only sanity checks that the cumulative work is clean.

### Task 14: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-47 is a **Story** → bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-47: Robot workshop decor: all 55 items drawn and named as workshop counterparts on Cyberpunk`

- [x] **Step 3: Verify agreement**

Run: `npm run check:version`
Expected: `Version OK: <new version>`

### Task 15: Grep for stale references ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: No leftover string-SVG attributes, debug output or injected HTML in the robot pack**

Run: `Select-String -Path src\components\pet\room\packs\robot\*.js* -Pattern "stroke-width|stroke-linejoin|stroke-linecap|fill-opacity|stroke-opacity|font-size|glowAttr|ART_INK|console\.(log|debug)|dangerouslySetInnerHTML"`
Expected: zero hits.

- [x] **Step 2: No "until MPP-47" markers left**

Run: `Select-String -Path src\constants\petRoomLabels.js,src\components\pet\room\packs\robot\robotRoom.js,src\components\pet\room\packs\packs.check.mjs,src\components\pet\room\room.check.mjs -Pattern "until MPP-47|MPP-47 adds"`
Expected: zero hits.

### Task 16: All room checks, both drift guards and theme check ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Run the checks**

Run: `npm run check:room; npm run check:sprinkles; npm run check:themes; npm run snapshot:room -- --compare ..\..\.claude\contract\MPP-47-robot-workshop-decor\ssr-baseline`
Expected: `room checks passed`; `Room packs OK: herb, dragon, robot`; `sprinkleHistory: all checks passed`; `Themes OK: 3 themes, 189 contrast pairs` (plus the one known `default|text-secondary|bg-secondary` WARN); `Room SSR OK: <n> fixtures identical`.

Then run the dragon compare command from Task 2 Step 2.
Expected: `Dragon decor identical`.

- [x] **Step 2: File sizes**

Run: `Get-ChildItem src\components\pet\room\packs\robot\robotDecor*.js* | ForEach-Object { "{0} {1}" -f $_.Name, (Get-Content $_ | Measure-Object -Line).Lines }`
Expected: every file under 400.

### Task 17: Full backend test suite ✓

- Skill: none — verification only (no backend change; confirms nothing regressed)

**Files:**
- (none)

- [x] **Step 1: Clean test run**

Run: `cd ..\foodbytes-api; mvn test` (with the JAVA_HOME / Maven PATH prefix from CLAUDE.md)
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 18: Production build ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Build the client**

Run: `npm run build`
Expected: `built in <n>s`, no errors.

### Task 19: Write the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-47-robot-workshop-decor/pr-description.md`

- [x] **Step 1: Write `pr-description.md`**

Include: a link to `plan.md`; the summary (55 workshop drawings ported from `pip-room-robot.html` into five area files + `robotDecorParts.jsx`, 55 workshop names in `ROBOT_LABELS.decor`, 25 decor ambience entries, robot added to `FULL_DECOR_LINES`, no engine or component change) and the new version from Task 14; "No migration, no backend change, no Railway step"; the verification results (check:room, check:sprinkles, check:themes, herb SSR compare, dragon decor compare, build, mvn test, and the Task 12 localhost walk including the small-item thumbnail findings); a convention note for contributors ("Both themed lines now draw and name every decor id; a new Pip line must join `FULL_DECOR_LINES` before it ships"); suggested commit subject `MPP-47: Robot workshop decor — 55 workshop drawings and names`.

---

## Self-review

**Spec coverage:**
- Port helpers + decor constants — Task 3.
- Port all 55 drawings, registered in `ROBOT_ROOM.decor` — Tasks 4–9, coverage enforced by Task 11.
- Legacy shift for the 12 legacy ids — existing MPP-46 `packDecorArt`, seen in Task 12.
- 25 decor ambience entries — Task 4.
- `ROBOT_LABELS.decor` on picker / Shop Decor / spot buttons / bought line / recent list — Task 10 (surfaces already route through `decorLabel`), asserted in `room.check.mjs` and `sprinkleHistory.check.mjs`, seen in Task 12.
- Coverage check (draws and names all 55, finite, no herb fallback) — Task 11.
- Animation stops under Low FX / reduced motion / thumbnails; glow removed in the room under Low FX — existing `roomFx.css`, verified in Task 12.
- Herb and dragon untouched — Tasks 1, 2 (baselines), 11 and 16 (compares), Task 12 (visual).
- Mockup sync — Task 13. Version bump — Task 14.

**Placeholder scan:** No `TBD`, `TODO`, "implement later" or "appropriate error handling". Port tasks name their exact ids and mockup line ranges and defer the drawing bodies to the verbatim source under one stated translation table; every step has a code block or a `Run:` / `Expected:` pair.

**Type / name consistency:** `ROBOT_DECOR`, `ROBOT_WALL_DECOR`, `ROBOT_WINDOW_DECOR`, `ROBOT_RUG_DECOR`, `ROBOT_FLOOR_BACK_DECOR`, `ROBOT_FLOOR_FRONT_DECOR`, the `robotDecorParts.jsx` exports (`HI`, `PLATE`, `INKBLUE`, `ellU`, `slabU`, `bandAt`, `ringLine`, `ellBand`, `limb`, `gear`, `hat`, `digit7`), `ROBOT_LABELS.decor`, `FULL_DECOR_LINES` — used identically across Tasks 3–11 and matching plan.md → Data shapes. `decorLabel`, `packDecorArt`, `decorBoughtLine`, `groupRecent` are existing MPP-46 APIs, unchanged. plan.md's small-item check reference points at Task 12 (the localhost walk).

**Phase boundary cleanliness:**
- Phase 1 ends green: two generated baselines, no source change.
- Phase 2 ends green after every task: each area file is registered as it lands; unported ids fall back to herb until Task 9; robot is not yet in `FULL_DECOR_LINES`, so partial coverage passes.
- Phase 3 ends green: names land with their asserts in one task, then the coverage set tightens only once all 55 drawings and names exist; both drift guards compare identical.
- Phase 4 changes docs only (plus any slip fix re-checked by `check:room`).
- Phase 5 is checks plus the version bump.
