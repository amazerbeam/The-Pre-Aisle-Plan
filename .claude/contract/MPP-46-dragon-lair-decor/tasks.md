# Tasks: Themed Pip rooms — dragon lair decor (55 items and names)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-16

**Goal:** On Parchment every one of the 55 decor items draws as its lair counterpart (ported from `pip-room-dragon.html`) and is named with its lair name on every surface, while ids, spots, ownership and the herb/robot rooms stay unchanged.

**Spec:** `plan.md` in this folder.

All commands run from `foodbytes-app\client` in PowerShell unless a step says otherwise.

---

## File map

**Created:**
- `.claude/contract/MPP-46-dragon-lair-decor/ssr-baseline/` — herb room SSR snapshot taken before any edit (drift guard)
- `client/src/components/pet/room/packs/dragon/dragonDecorParts.jsx` — decor-only helpers + decor palette ported from the mockup
- `client/src/components/pet/room/packs/dragon/dragonDecor.js` — merges the five area maps into `DRAGON_DECOR`
- `client/src/components/pet/room/packs/dragon/dragonDecorWalls.jsx` — 14 wall items
- `client/src/components/pet/room/packs/dragon/dragonDecorWindow.jsx` — 10 window-dressing and windowsill items
- `client/src/components/pet/room/packs/dragon/dragonDecorRugs.jsx` — 6 rugs
- `client/src/components/pet/room/packs/dragon/dragonDecorFloorBack.jsx` — 12 back-corner, bedside-nook, foot-of-bed items
- `client/src/components/pet/room/packs/dragon/dragonDecorFloorFront.jsx` — 13 by-fridge, corner-by-door, front-of-room items

**Modified:**
- `client/src/components/pet/room/roomLayout.js:54-59` — export `DECOR_LEGACY_IDS`
- `client/src/components/pet/room/decorArt.jsx:16-17` — import `DECOR_LEGACY_IDS` instead of the local `LEGACY_IDS`
- `client/src/components/pet/room/roomPacks.js` → renamed `roomPacks.jsx` — `packDecorArt` applies the legacy shift to pack-drawn ids
- `client/src/components/pet/room/packs/packs.check.mjs` — load path, decor render loop, legacy-shift assert, full-coverage + names asserts
- `client/src/components/pet/room/packs/dragon/dragonRoom.js` — `decor: DRAGON_DECOR`, 19 decor ambience entries, doc comment
- `client/src/constants/petRoomLabels.js` — `decor` names per line, `decorLabel(line, id)`
- `client/src/utils/roomPlacements.js:35-43` — `decorBoughtLine(itemId, room, line)`
- `client/src/hooks/usePetShop.js:82` — pass `line`
- `client/src/utils/sprinkleHistory.js:69-70` — `decorLabel(line, …)`
- `client/src/components/pet/room/DecorPicker.jsx:37` — lair names
- `client/src/components/pet/room/ShopDecorTab.jsx:16` — lair names
- `client/src/components/pet/room/DecorSpotButtons.jsx:11` — lair names in `aria-label`
- `client/src/components/pet/room/room.check.mjs:301-305` — per-line bought-line asserts
- `client/src/utils/sprinkleHistory.check.mjs` — per-line recent-row assert
- `foodbytes-app/mockup/README.md:11-12` — dragon decor live
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump

**Deleted:** (none — `roomPacks.js` is renamed, not removed in substance)

---

## Port conventions (apply in every Phase 2 drawing task)

Source is `foodbytes-app/mockup/pip-room-dragon.html`, `DRAGON_ROOM.decor` (lines 1456–1815). Port each builder **verbatim** — same coordinates, colours, seeds, delays — translating only the form, exactly as MPP-45 did in `dragonBed.jsx` / `dragonParts.jsx`:

| Mockup | Live |
|---|---|
| `a + b + c` / `[…].map(…).join('')` returning a string | `cat(a, b, c)` / `cat(...[…].map(…))` (keyless Fragment children) |
| `poly`, `isoLine`, `isoLines`, `box`, `rectV/U/H`, `ellH`, `cylE`, `cyl`, `bill`, `fxg` | the same names from `S` (`dragonParts.jsx` → `S = packShapes(DRAGON_INK)`) |
| `bill(u, v, h, inner, [bounds])` | `bill(u, v, h, inner)` — drop the 5th (measurer-only) argument |
| `` `<g ${glowAttr(c, r)}>…</g>` `` | `glowG(c, …, r)` from `../packShapes` |
| inline SVG string (`<path d=".." stroke-width="1.4" stroke-linejoin="round"/>`) | JSX (`<path d=".." strokeWidth="1.4" strokeLinejoin="round" />`); also `stroke-linecap`→`strokeLinecap`, `fill-opacity`→`fillOpacity`, `stroke-opacity`→`strokeOpacity`, `stroke-dasharray`→`strokeDasharray`, `text-anchor`→`textAnchor` |
| `${ART_INK}` | `DRAGON_INK` from `./dragonPalette` |
| `${expr}` inside a string attribute | `{expr}` (keep `.toFixed(1)` where the mockup formats) |
| palette consts (`STONE`, `IRON`, `GOLD`…) | `./dragonPalette`; decor-only ones (`HI`, `COPPER`, `BONE`, `TEAL`, `TEAL_HI`, `GLOW`, `HIDE`) from `./dragonDecorParts` |
| `gem`, `sparkle`, `flame`, `embers`, `crystal`, `coinScatter`, `stoneBox`, `seamsU`, `coin` | `./dragonParts` |
| `pelt`, `helm`, `drape`, `nest`, `trophy`, `crown` | `./dragonTreasure` |
| `tint`, `rnd`, `arcPts`, `nearRange` | `../packShapes`; `P`, `ellipsePoints`, `rectUPoints`, `shade` from `../../iso` |

Keep the mockup's one-line `//` comment above each item. The 12 legacy ids (`basil-print`, `recipe-board`, `herb-shelf`, `fairy-lights`, `wall-clock`, `bunting`, `pan-rail`, `mirror`, `watering-can`, `cookbook-stack`, `bean-bag`, `lemon-tree`) stay in MPP-27 coords — the engine shifts them (Task 3). Never use `dangerouslySetInnerHTML`. Each file stays under 400 lines; if one would pass 400, split it by spot into a second file and spread both in `dragonDecor.js`.

---

## Phase 1 — Drift baseline, engine shift and decor render check

Snapshot the herb room before touching anything, then add the legacy shift to `packDecorArt` and teach `packs.check.mjs` to render every decor id for every pack. Dragon still has no decor, so everything renders through the herb fallback and all checks stay green.

### Task 1: Write the herb SSR baseline ✓

- Skill: react-frontend

**Files:**
- Create: `.claude/contract/MPP-46-dragon-lair-decor/ssr-baseline/` (generated)

- [x] **Step 1: Snapshot before any source edit**

Run: `npm run snapshot:room -- --write ..\..\.claude\contract\MPP-46-dragon-lair-decor\ssr-baseline`
Expected: the folder holds the fixture files (`day-rug-l1-defaults.html`, `all-l4-every-spot.html`, `decor-thumbs.html`, `editing.html`, …), no error.

- [x] **Step 2: Confirm it compares clean**

Run: `npm run snapshot:room -- --compare ..\..\.claude\contract\MPP-46-dragon-lair-decor\ssr-baseline`
Expected: every fixture reported identical, exit code 0.

### Task 2: Export the legacy id set from roomLayout ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/pet/room/roomLayout.js:54-59`
- Modify: `client/src/components/pet/room/decorArt.jsx:6,16-17,26`

- [x] **Step 1: Move the set**

In `roomLayout.js`, directly under `DECOR_LEGACY_SHIFT`:

```js
// MPP-27's 12 ids, drawn in their original coords by every room pack and slid to their MPP-40 spot by DECOR_LEGACY_SHIFT.
export const DECOR_LEGACY_IDS = new Set(['basil-print', 'recipe-board', 'herb-shelf', 'fairy-lights', 'wall-clock', 'bunting', 'pan-rail', 'mirror', 'watering-can', 'cookbook-stack', 'bean-bag', 'lemon-tree'])
```

In `decorArt.jsx`: delete the `LEGACY_IDS` const and its comment, change the import to `import { DECOR_LEGACY_IDS, DECOR_LEGACY_SHIFT, shiftTransform } from './roomLayout'`, and use `DECOR_LEGACY_IDS.has(id)` in `decorArt`.

- [x] **Step 2: Verify herb is untouched**

Run: `npm run check:room; npm run snapshot:room -- --compare ..\..\.claude\contract\MPP-46-dragon-lair-decor\ssr-baseline`
Expected: `room checks passed`, `Room packs OK: herb, dragon, robot`, all fixtures identical.

### Task 3: Shift pack-drawn legacy decor in packDecorArt ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/pet/room/roomPacks.js` → rename to `roomPacks.jsx`
- Modify: `client/src/components/pet/room/packs/packs.check.mjs:12`

- [x] **Step 1: Rename and update the one path import**

Run: `git mv src\components\pet\room\roomPacks.js src\components\pet\room\roomPacks.jsx`

In `packs.check.mjs` change `load('/src/components/pet/room/roomPacks.js')` to `load('/src/components/pet/room/roomPacks.jsx')`. (The six component importers use `'./roomPacks'` and need no edit.)

- [x] **Step 2: Apply the shift**

In `roomPacks.jsx` add imports `DECOR_ITEMS` (to the existing `petDecor` import) and `import { DECOR_LEGACY_IDS, DECOR_LEGACY_SHIFT, shiftTransform } from './roomLayout'`. Replace `packDecorArt` with:

```jsx
export function packDecorArt(pack, id) {
  if (!id) return null
  const key = `${pack.line}:${id}`
  if (!decorCache.has(key)) decorCache.set(key, pack.decor?.[id] ? packDrawnDecor(pack, id) : HERB_ROOM.decorById(id))
  return decorCache.get(key)
}

// MPP-46: a pack draws the 12 legacy ids in MPP-27 coords, as herb does; slide them to their spot the same way.
function packDrawnDecor(pack, id) {
  const art = pack.decor[id]()
  const shift = DECOR_LEGACY_IDS.has(id) ? DECOR_LEGACY_SHIFT[DECOR_ITEMS[id]?.spot] : null
  return shift ? <g transform={shiftTransform(shift)}>{art}</g> : art
}
```

Update the file's doc comment: "Every accessor falls back to the herb item per entry; a pack-drawn legacy decor id is slid by DECOR_LEGACY_SHIFT here (MPP-46)."

- [x] **Step 3: Verify**

Run: `npm run check:room; npm run build`
Expected: both checks pass; `built in <n>s`, no errors.

### Task 4: Render every decor id for every pack in packs.check.mjs ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/pet/room/packs/packs.check.mjs`

- [x] **Step 1: Add the render loop and the legacy-shift assert**

Import `packDecorArt` alongside the other `roomPacks.jsx` exports. Inside the per-pack loop, after the styles loop:

```js
    for (const id of decorIds) finite(svg(packDecorArt(pack, id)), `${line} decor ${id}`)
```

After the pack loop (before the final `console.log`), a synthetic pack proves the shift without depending on dragon art yet:

```js
  // MPP-46: a pack-drawn legacy id is slid by DECOR_LEGACY_SHIFT; a non-legacy id is not wrapped.
  const probe = { line: 'probe', decor: { 'basil-print': () => h('circle', { r: 1 }), 'pip-portrait': () => h('circle', { r: 1 }) } }
  assert.match(svg(packDecorArt(probe, 'basil-print')), /^<svg><g transform="translate\(/, 'legacy id not shifted')
  assert.equal(svg(packDecorArt(probe, 'pip-portrait')), '<svg><circle r="1"></circle></svg>', 'non-legacy id wrapped')
```

- [x] **Step 2: Verify**

Run: `npm run check:room`
Expected: `room checks passed`, `Room packs OK: herb, dragon, robot`.

---

## Phase 2 — Port the 55 lair drawings

Port the helpers, wire an empty `DRAGON_DECOR` into the pack, then add one area file at a time. After every task `check:room` renders each newly drawn id through `packDecorArt` (Task 4), so a bad translation fails at once and the phase can stop between any two tasks with the build green (unported ids still fall back to herb).

### Task 5: Port the decor-only helpers and palette ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/dragon/dragonDecorParts.jsx`
- Modify: `client/src/components/pet/room/packs/dragon/dragonParts.jsx:6-7` (doc comment only)

- [x] **Step 1: Write `dragonDecorParts.jsx`**

Port `pip-room-dragon.html` lines 1100–1139 per the Port conventions. Exports, with these signatures:

```jsx
export const HI = 'rgba(255,255,255,.7)'
export const COPPER = '#c9753a'
export const BONE = '#efe4c8'
export const TEAL = '#2f6b5a'
export const TEAL_HI = '#3fa57c'
export const GLOW = '#7de3ff'
export const HIDE = '#a98660'
export const ellU = (up, vc, hc, rv, rh, fill, o, n = 16) => …      // poly of ringPts on plane u = up
export const slabU = (up, th, vh, fill, o) => …                       // cat(back copy shade(fill, -22), front copy)
export const candle = (u, v, h, hh = 5, s = 0.5, delay = 0) => …      // cat(cyl(...'#f4ead2', { sw: 1 }), flame(u, v, h + hh, s, delay))
export const bandAt = (cu, cv, r, h, color = IRON, w = 1.4) => …
export const flask = (u, v, h, c) => …
export function runeRowV(vp, u0, h, n) { … return glowG(GLOW, isoLines(segs, 1.3, GLOW), 2) }
export const orb = (u, v, h, c, delay) => …
export const limb = (d, w, color) => (<><path d={d} fill="none" stroke={DRAGON_INK} strokeWidth={w + 2.4} strokeLinecap="round" strokeLinejoin="round" /><path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /></>)
export function ellBand(cu, cv, ru, rv, a, b, h, fill) { … }
export const ringLine = (cu, cv, h, ru, rv, w, color, dash) => …    // isoLine([...p, p[0]], w, color, dash ? { dash } : {})
```

`ringPts` stays file-private. Check that `S.isoLine` accepts `{ dash }` (read `packShapes.jsx:82-95`); if it does not, add an optional `o.dash` → `strokeDasharray` to `packShapes.isoLine` (herb does not use `packShapes`, so herb output is unaffected). Header doc comment: "MPP-46: the lair decor's helpers and decor palette (pip-room-dragon.html lines 1099-1139)."

In `dragonParts.jsx` update the doc comment's last sentence to: "decor-only helpers live in dragonDecorParts.jsx (MPP-46)."

- [x] **Step 2: Verify it compiles**

Run: `node --input-type=module -e "import { withSsr } from './scripts/ssrLoad.mjs'; await withSsr(async (load) => { const m = await load('/src/components/pet/room/packs/dragon/dragonDecorParts.jsx'); console.log(Object.keys(m).sort().join(',')) })"`
Expected: `BONE,COPPER,GLOW,HI,HIDE,TEAL,TEAL_HI,bandAt,candle,ellBand,ellU,flask,limb,orb,ringLine,runeRowV,slabU`

### Task 6: Wire DRAGON_DECOR into the pack (empty) with the decor ambience ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/dragon/dragonDecor.js`
- Modify: `client/src/components/pet/room/packs/dragon/dragonRoom.js:12,20-31`

- [x] **Step 1: Create the merge module**

```js
/**
 * MPP-46: the lair's 55 decor drawings (pip-room-dragon.html DRAGON_ROOM.decor, approved 2026-11-16), merged from the area files.
 * World coords; the 12 legacy ids are in MPP-27 coords and slid by packDecorArt.
 */
export const DRAGON_DECOR = {}
```

- [x] **Step 2: Register it and the ambience**

In `dragonRoom.js`: `import { DRAGON_DECOR } from './dragonDecor'`; set `decor: DRAGON_DECOR`; change the doc comment to "MPP-45/46: the dragon lair (pip-room-dragon.html DRAGON_ROOM, approved 2026-11-16)."; replace the ambience comment with `// What animates, by target (pip-room-dragon.html lines 1853-1869).` and append, after the 8 existing entries:

```js
    // decor
    { target: 'fairy-lights', effect: 'glint' }, { target: 'wall-sconce', effect: 'flicker' }, { target: 'photo-strip', effect: 'glint' },
    { target: 'bunting', effect: 'sway' }, { target: 'window-lights', effect: 'glint' },
    { target: 'plant-hanger', effect: 'flicker' }, { target: 'plant-hanger', effect: 'embers' },
    { target: 'sill-basil', effect: 'glint' }, { target: 'sill-radio', effect: 'flicker' }, { target: 'sill-cat', effect: 'flicker' },
    { target: 'side-table-lamp', effect: 'flicker' }, { target: 'plant-stand', effect: 'glint' }, { target: 'stool-books', effect: 'flicker' }, { target: 'laundry-basket', effect: 'glint' },
    { target: 'lemon-tree', effect: 'glint' }, { target: 'arc-lamp', effect: 'flicker' }, { target: 'arc-lamp', effect: 'embers' }, { target: 'tea-table', effect: 'flicker' }, { target: 'pip-ball', effect: 'glint' }
```

- [x] **Step 3: Verify**

Run: `npm run check:room`
Expected: both checks pass (ambience targets are decor ids, accepted by `packs.check.mjs`).

### Task 7: Port the wall decor (14 items) ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/dragon/dragonDecorWalls.jsx`
- Modify: `client/src/components/pet/room/packs/dragon/dragonDecor.js`

- [x] **Step 1: Port**

Port the mockup's `/* over the wardrobe */`, `/* bedside wall */` and `/* front right wall */` groups (from line 1457 to the line before `/* window dressing */`) per the Port conventions into `export const DRAGON_WALL_DECOR = { … }` with these ids in this order: `basil-print`, `recipe-board`, `herb-shelf`, `fairy-lights`, `pip-portrait`, `growth-chart`, `meal-calendar`, `wall-sconce`, `photo-strip`, `wall-clock`, `bunting`, `pan-rail`, `mirror`, `coat-hooks`. Keep the mockup's spot-group comments (`/* over the wardrobe … */`).

- [x] **Step 2: Register**

`dragonDecor.js`: `import { DRAGON_WALL_DECOR } from './dragonDecorWalls'` and `export const DRAGON_DECOR = { ...DRAGON_WALL_DECOR }`.

- [x] **Step 3: Verify**

Run: `npm run check:room; (Get-Content src\components\pet\room\packs\dragon\dragonDecorWalls.jsx | Measure-Object -Line).Lines`
Expected: both checks pass; line count < 400.

### Task 8: Port the window decor (10 items) ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/dragon/dragonDecorWindow.jsx`
- Modify: `client/src/components/pet/room/packs/dragon/dragonDecor.js`

- [x] **Step 1: Port**

Port the mockup's `/* window dressing */` and `/* windowsill */` groups (from line 1544 to the line before the `/* rug */` group) into `export const DRAGON_WINDOW_DECOR = { … }`: `curtains-gingham`, `curtains-linen`, `roller-blind`, `window-lights`, `plant-hanger`, `sill-basil`, `sill-succulents`, `sill-cactus`, `sill-radio`, `sill-cat`.

- [x] **Step 2: Register**

Add `...DRAGON_WINDOW_DECOR` to `DRAGON_DECOR` with its import.

- [x] **Step 3: Verify**

Run: `npm run check:room; (Get-Content src\components\pet\room\packs\dragon\dragonDecorWindow.jsx | Measure-Object -Line).Lines`
Expected: both checks pass; line count < 400.

### Task 9: Port the rugs (6 items) ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/dragon/dragonDecorRugs.jsx`
- Modify: `client/src/components/pet/room/packs/dragon/dragonDecor.js`

- [x] **Step 1: Port**

Port the mockup's `/* rug */` group into `export const DRAGON_RUG_DECOR = { … }`: `rug-pink`, `rug-braided`, `rug-leaf`, `rug-stripe`, `rug-picnic`, `rug-sheepskin`. Where the mockup reads `RUG` (`GEOMETRY.RUG`), use `RUG` from `../../roomLayout` (same `cu`, `cv`). `rug-sheepskin` is ported verbatim (plan.md Assumptions).

- [x] **Step 2: Register**

Add `...DRAGON_RUG_DECOR` to `DRAGON_DECOR` with its import.

- [x] **Step 3: Verify**

Run: `npm run check:room; (Get-Content src\components\pet\room\packs\dragon\dragonDecorRugs.jsx | Measure-Object -Line).Lines`
Expected: both checks pass; line count < 400.

### Task 10: Port the back-floor decor (12 items) ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/dragon/dragonDecorFloorBack.jsx`
- Modify: `client/src/components/pet/room/packs/dragon/dragonDecor.js`

- [x] **Step 1: Port**

Port the mockup's `/* back corner */`, `/* bedside nook */` and `/* foot of the bed */` groups into `export const DRAGON_FLOOR_BACK_DECOR = { … }`: `snake-plant`, `cactus`, `umbrella-stand`, `broom`, `side-table-lamp`, `record-player`, `plant-stand`, `stool-books`, `toy-chest`, `bench`, `laundry-basket`, `slippers`.

- [x] **Step 2: Register**

Add `...DRAGON_FLOOR_BACK_DECOR` to `DRAGON_DECOR` with its import.

- [x] **Step 3: Verify**

Run: `npm run check:room; (Get-Content src\components\pet\room\packs\dragon\dragonDecorFloorBack.jsx | Measure-Object -Line).Lines`
Expected: both checks pass; line count < 400.

### Task 11: Port the front-floor decor (13 items) ✓

- Skill: react-frontend

**Files:**
- Create: `client/src/components/pet/room/packs/dragon/dragonDecorFloorFront.jsx`
- Modify: `client/src/components/pet/room/packs/dragon/dragonDecor.js`

- [x] **Step 1: Port**

Port the mockup's `/* by the fridge */`, `/* corner by the door */` and `/* front of the room */` groups (through line 1814, `picnic-basket`) into `export const DRAGON_FLOOR_FRONT_DECOR = { … }`: `watering-can`, `cookbook-stack`, `bean-bag`, `lemon-tree`, `veg-basket`, `monstera`, `coat-stand`, `arc-lamp`, `guitar`, `pouffe`, `tea-table`, `pip-ball`, `picnic-basket`. `watering-can` is ported verbatim.

- [x] **Step 2: Register**

`dragonDecor.js` final form:

```js
import { DRAGON_WALL_DECOR } from './dragonDecorWalls'
import { DRAGON_WINDOW_DECOR } from './dragonDecorWindow'
import { DRAGON_RUG_DECOR } from './dragonDecorRugs'
import { DRAGON_FLOOR_BACK_DECOR } from './dragonDecorFloorBack'
import { DRAGON_FLOOR_FRONT_DECOR } from './dragonDecorFloorFront'

/** (doc comment from Task 6) */
export const DRAGON_DECOR = { ...DRAGON_WALL_DECOR, ...DRAGON_WINDOW_DECOR, ...DRAGON_RUG_DECOR, ...DRAGON_FLOOR_BACK_DECOR, ...DRAGON_FLOOR_FRONT_DECOR }
```

- [x] **Step 3: Verify count, render and size**

Run: `npm run check:room; node --input-type=module -e "import { withSsr } from './scripts/ssrLoad.mjs'; await withSsr(async (load) => { const { DRAGON_DECOR } = await load('/src/components/pet/room/packs/dragon/dragonDecor.js'); const { DECOR_ITEMS } = await load('/src/constants/petDecor.js'); const missing = Object.keys(DECOR_ITEMS).filter(id => !DRAGON_DECOR[id]); console.log(Object.keys(DRAGON_DECOR).length, missing.join(',') || 'none missing') })"; (Get-Content src\components\pet\room\packs\dragon\dragonDecorFloorFront.jsx | Measure-Object -Line).Lines`
Expected: both checks pass; `55 none missing`; line count < 400.

### Task 12: Require full dragon decor coverage in packs.check.mjs ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/pet/room/packs/packs.check.mjs`

- [x] **Step 1: Add the coverage assert**

Above the pack loop:

```js
  // MPP-46: lines whose pack draws every decor id itself (no herb fallback). MPP-47 adds PIP_LINE.ROBOT.
  const FULL_DECOR_LINES = new Set([PIP_LINE.DRAGON])
```

Inside the pack loop, after the decor render loop from Task 4:

```js
    if (FULL_DECOR_LINES.has(line)) for (const id of decorIds) assert.equal(typeof pack.decor[id], 'function', `${line}: missing decor ${id}`)
```

- [x] **Step 2: Verify**

Run: `npm run check:room; npm run build`
Expected: both checks pass; `built in <n>s`.

---

## Phase 3 — Lair names on every surface

Add per-line decor names and route every decor-name surface through `decorLabel`. Herb's names come from `DECOR_ITEMS`, so the herb room and its SSR fixtures stay byte-identical.

### Task 13: Per-line decor names and decorLabel ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/constants/petRoomLabels.js`

- [x] **Step 1: Add names and the accessor**

Import `DECOR_ITEMS` from `./petDecor.js` (extend the existing import). Add to `HERB_LABELS`:

```js
  decor: Object.fromEntries(Object.entries(DECOR_ITEMS).map(([id, d]) => [id, d.label])),
```

Change the `DRAGON_LABELS` comment to `// pip-room-dragon.html DRAGON_ROOM.labels (approved 2026-11-16).` and add `decor`, copied verbatim (all 55, grouped by spot with the mockup's comments) from `pip-room-dragon.html` lines 1881–1905:

```js
  decor: {
    // over the wardrobe
    'basil-print': 'Mounted dragon scale', 'recipe-board': 'Rune slate', 'herb-shelf': 'Potion shelf', 'fairy-lights': 'Crystal string', 'pip-portrait': 'Hatchling portrait',
    // bedside wall
    'growth-chart': 'Claw-mark height post', 'meal-calendar': 'Carved tally stone', 'wall-sconce': 'Wall torch', 'photo-strip': 'Gem frames',
    // front right wall
    'wall-clock': 'Wall hourglass', bunting: 'Tattered pennants', 'pan-rail': 'Iron cauldron rail', mirror: 'Polished buckler', 'coat-hooks': 'Cloak hooks',
    // window dressing
    'curtains-gingham': 'Patchwork hide curtains', 'curtains-linen': 'Crimson drapes', 'roller-blind': 'Iron portcullis', 'window-lights': 'Glowworm strings', 'plant-hanger': 'Hanging brazier',
    // windowsill
    'sill-basil': 'Glowcap pots', 'sill-succulents': 'Gem clusters', 'sill-cactus': 'Stalagmite pair', 'sill-radio': 'Echo horn', 'sill-cat': 'Golden dragon idol',
    // rug
    'rug-pink': 'Crimson rug', 'rug-braided': 'Braided hide rug', 'rug-leaf': 'Scale rug', 'rug-stripe': 'Banner-stripe rug', 'rug-picnic': 'Feast blanket', 'rug-sheepskin': 'Cave-bear pelt',
    // back corner
    'snake-plant': 'Cave fern urn', cactus: 'Thorn tree', 'umbrella-stand': 'Weapon barrel', broom: 'Hearth rake and shovel',
    // bedside nook
    'side-table-lamp': 'Table and lantern', 'record-player': 'Table and war drum', 'plant-stand': 'Egg stand', 'stool-books': 'Stool and tomes',
    // foot of the bed
    'toy-chest': 'Treasure chest', bench: 'Stone bench', 'laundry-basket': 'Loot basket', slippers: 'Hide mat and claw boots',
    // by the fridge
    'watering-can': 'Copper ewer', 'cookbook-stack': 'Spellbook stack', 'bean-bag': 'Hide cushion', 'lemon-tree': 'Ember-fruit tree', 'veg-basket': 'Forage basket',
    // corner by the door
    monstera: 'Glowvein plant', 'coat-stand': 'Cloak and helm stand', 'arc-lamp': 'Standing brazier', guitar: 'Dragon-hide lute',
    // front of the room
    pouffe: 'Stump seat', 'tea-table': 'Feast table', 'pip-ball': "Pip's glow-orb", 'picnic-basket': 'Provision crate'
  },
```

Change the `ROBOT_LABELS` comment's "decor omitted" to "decor omitted until MPP-47". Update the file doc comment to "MPP-45/46: station, level, style and decor names per Pip line (robot decor names stay herb until MPP-47)." After `styleLabel`, add:

```js
export const decorLabel = (line, id) => labelsOf(line).decor?.[id] ?? HERB_LABELS.decor[id]
```

- [x] **Step 2: Assert names in packs.check.mjs**

In `packs.check.mjs`, import `decorLabel` with the other label accessors; inside the pack loop add:

```js
    for (const id of decorIds) assert.ok(decorLabel(line, id), `${line}: no name for decor ${id}`)
    if (FULL_DECOR_LINES.has(line)) for (const id of decorIds) assert.ok(ROOM_LABELS[line].decor?.[id], `${line}: decor ${id} falls back to the herb name`)
```

- [x] **Step 3: Verify**

Run: `npm run check:room`
Expected: both checks pass.

### Task 14: Lair names in the picker, Shop Decor tab and spot buttons ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/components/pet/room/DecorPicker.jsx:1-5,15-17,37`
- Modify: `client/src/components/pet/room/ShopDecorTab.jsx:1-3,7,16`
- Modify: `client/src/components/pet/room/DecorSpotButtons.jsx:1-2,9-11`

- [x] **Step 1: Read the line from the pack and name through decorLabel**

In each component: `import { decorLabel } from '../../../constants/petRoomLabels'` and `import { useRoomPack } from './roomPackContext'`; at the top of the component body `const { line } = useRoomPack()`.
- `DecorPicker.jsx`: `{DECOR_ITEMS[id].label}` → `{decorLabel(line, id)}`; drop `DECOR_ITEMS` from the import if now unused.
- `ShopDecorTab.jsx`: `label={DECOR_ITEMS[item.id].label}` → `label={decorLabel(line, item.id)}`; drop `DECOR_ITEMS` from the import.
- `DecorSpotButtons.jsx`: `const current = DECOR_ITEMS[placements?.[spot]]?.label ?? …` → `const id = placements?.[spot]` and `const current = (DECOR_ITEMS[id] && decorLabel(line, id)) ?? DECOR_EMPTY_LABEL.toLowerCase()` (keep the `DECOR_ITEMS` guard so an unknown or empty id still reads "empty").

- [x] **Step 2: Verify herb unchanged and build green**

Run: `npm run snapshot:room -- --compare ..\..\.claude\contract\MPP-46-dragon-lair-decor\ssr-baseline; npm run build`
Expected: all fixtures identical; `built in <n>s`.

### Task 15: Lair names in the bought line ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/utils/roomPlacements.js:1,34-43`
- Modify: `client/src/hooks/usePetShop.js:82`
- Test: `client/src/components/pet/room/room.check.mjs:301-305`

- [x] **Step 1: Write the failing asserts**

After line 305 of `room.check.mjs`:

```js
// MPP-46: the bought line names the item (and a style) in the room's line; herb is the default.
assert.equal(decorBoughtLine('herb-shelf', room, 'dragon'), 'Potion shelf bought and put in the "Over the wardrobe" spot.')
assert.equal(decorBoughtLine('rug-sheepskin', room, 'dragon'), 'Cave-bear pelt bought and applied.')
assert.equal(decorBoughtLine('wall-mint', room, 'dragon'), 'Mossy stone bought and applied.')
assert.equal(decorBoughtLine('bunting', room, 'robot'), 'Bunting bought. Swap it in with ✏️ Edit room.') // robot decor names stay herb until MPP-47
```

Run: `node src/components/pet/room/room.check.mjs`
Expected: FAIL on the first new assert (`Herb shelf bought…` ≠ `Potion shelf bought…`).

- [x] **Step 2: Implement**

`roomPlacements.js`: add `import { PIP_DEFAULT_LINE } from '../constants/pipLines.js'` and `import { decorLabel, styleLabel } from '../constants/petRoomLabels.js'`. Replace `decorBoughtLine`:

```js
/** The shop's status line after buying itemId in the given Pip line's room; room is the write's room (did it land on its spot?). */
export function decorBoughtLine(itemId, room, line = PIP_DEFAULT_LINE) {
  const entry = decorEntry(itemId)
  if (!entry) return null
  const label = DECOR_ITEMS[itemId] ? decorLabel(line, itemId) : styleLabel(line, itemId)
  if (hasDefault(entry.spot)) return `${label} bought and applied.`
  if (room?.placements?.[entry.spot] === itemId) {
    return `${label} bought and put in the "${DECOR_SPOT_LABELS[entry.spot]}" spot.`
  }
  return `${label} bought. Swap it in with ✏️ Edit room.`
}
```

`usePetShop.js:82`: `setStatus(decorBoughtLine(itemId, result.room, line))`.

(Check `petRoomLabels.js` does not import `roomPlacements.js`, so there is no cycle — it imports only `pipLines`, `petShop` and `petDecor`.)

- [x] **Step 3: Verify**

Run: `npm run check:room`
Expected: `room checks passed`, `Room packs OK: herb, dragon, robot`.

### Task 16: Lair names in the recent-sprinkles list ✓

- Skill: react-frontend

**Files:**
- Modify: `client/src/utils/sprinkleHistory.js:4,69-70`
- Test: `client/src/utils/sprinkleHistory.check.mjs`

- [x] **Step 1: Write the failing assert**

Before the final `console.log` in `sprinkleHistory.check.mjs`:

```js
// MPP-46: a decor purchase reads in the room's line.
assert.equal(groupRecent([{ sourceType: 'DECOR_PURCHASE', amount: -120, decorItem: 'herb-shelf', createdAt: at('2026-10-13') }], 'dragon')[0].text, 'Bought the Potion shelf')
```

Run: `npm run check:sprinkles`
Expected: FAIL (`Bought the Herb shelf` ≠ `Bought the Potion shelf`).

- [x] **Step 2: Implement**

`sprinkleHistory.js`: extend the label import to `import { decorLabel, stationLevelName, styleLabel } from '../constants/petRoomLabels.js'`; in the `DECOR_PURCHASE` case replace `if (item) return RECENT_TEXT.bought(item.label)` with `if (item) return RECENT_TEXT.bought(decorLabel(line, entry.decorItem))`.

- [x] **Step 3: Verify**

Run: `npm run check:sprinkles`
Expected: `sprinkleHistory: all checks passed`.

---

## Phase 4 — Visual check and mockup sync

Confirm on a real screen that every item sits in its spot and animates correctly, then mark the mockup README. No production code changes unless a slip is found (fix it in the area file and re-run `check:room`).

### Task 17: Fit and animation check on localhost ○ — manual verification for the developer (Ready for Test)

- Skill: react-frontend

**Files:**
- (none — verification; any coordinate slip found is fixed in its `dragonDecor*.jsx` file)

- [ ] **Step 1: Confirm the mockup's fit table**

Open `foodbytes-app/mockup/pip-room-dragon.html` in a browser, section "Fit". Expected: the summary row reads all decor rows OK (no `+N px` overruns).

- [ ] **Step 2: Walk the lair on localhost**

Start the backend with `$env:PET_FREE_MODE = "true"` (CLAUDE.md → Running the backend locally with Google login) and the client with `npm run dev`. At http://localhost:5173/pet, user menu → theme **Parchment**:
- In ✏️ Edit room, open each of the 12 spots and place every item in turn. Expected: each lair drawing sits inside the dashed spot outline; the 12 legacy ids land in their spots, not at MPP-27 positions; the picker shows lair names and lair thumbnails.
- Open the Shop → Decor tab. Expected: 55 lair thumbnails with lair names, no animation inside thumbnails.
- With the fairy lights, wall torch, pennants, hanging brazier, glowcap pots and standing brazier placed: animations run; user menu → Low FX on → they stop; Chrome DevTools → Rendering → emulate `prefers-reduced-motion: reduce` → they stop.
- Buy nothing (free mode owns all); switch to **Default** and **Cyberpunk**. Expected: the herb room and the robot workshop show the same placed items with herb drawings and herb names, unchanged.
- At 375 px width (DevTools device toolbar): picker and Shop Decor tab usable, names wrap without overflow.

### Task 18: Mockup README sync ✓

- Skill: none — documentation edit, no code

**Files:**
- Modify: `foodbytes-app/mockup/README.md:11-12`

- [x] **Step 1: Mark dragon decor live**

Row `pip-room-dragon.html`: replace "decor is pending MPP-46/47 (decor falls back to the herb art)." with "the 55 lair decor drawings and names are live from v<new version> (MPP-46)." Row `pip-room-robot.html`: replace "decor is pending MPP-46/47" with "decor is pending MPP-47". (`<new version>` = the version written in Task 19 — do Task 19 Step 1 first if needed.)

- [x] **Step 2: Verify**

Run: `Select-String -Path ..\mockup\README.md -Pattern "MPP-46/47"`
Expected: zero hits.

---

## Phase 5 — Final verification

No production changes beyond the version bump — only sanity checks that the cumulative work is clean.

### Task 19: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-46 is a **Story** → bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-46: Dragon lair decor: all 55 items drawn and named as lair counterparts on Parchment`

- [x] **Step 3: Verify agreement**

Run: `npm run check:version`
Expected: `Version OK: <new version>`

### Task 20: Grep for stale references ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: No leftover herb label reads or old paths**

Run: `Select-String -Path src\components\pet\room\*.jsx,src\utils\*.js,src\hooks\*.js -Pattern "DECOR_ITEMS\[[^\]]+\]\??\.label"`
Expected: zero hits.

Run: `Select-String -Path src\components\pet\room\*.jsx,src\components\pet\room\packs\*.mjs,src\components\pet\room\*.mjs -Pattern "roomPacks\.js'|LEGACY_IDS = |dangerouslySetInnerHTML"`
Expected: zero hits (`DECOR_LEGACY_IDS =` lives only in `roomLayout.js`, which is not in that glob).

Run: `Select-String -Path src\components\pet\room\packs\dragon\*.js* -Pattern "stroke-width|stroke-linejoin|stroke-linecap|fill-opacity|console\.(log|debug)"`
Expected: zero hits.

### Task 21: All room checks, herb drift guard and theme check ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Run the checks**

Run: `npm run check:room; npm run check:sprinkles; npm run check:themes; npm run snapshot:room -- --compare ..\..\.claude\contract\MPP-46-dragon-lair-decor\ssr-baseline`
Expected: `room checks passed`; `Room packs OK: herb, dragon, robot`; `sprinkleHistory: all checks passed`; `Themes OK: 3 themes, 189 contrast pairs` (plus the one known `default|text-secondary|bg-secondary` WARN); every SSR fixture identical.

- [x] **Step 2: File sizes**

Run: `Get-ChildItem src\components\pet\room\packs\dragon\dragonDecor*.jsx | ForEach-Object { "{0} {1}" -f $_.Name, (Get-Content $_ | Measure-Object -Line).Lines }`
Expected: every file under 400.

### Task 22: Full backend test suite ✓

- Skill: none — verification only (no backend change; confirms nothing regressed)

**Files:**
- (none)

- [x] **Step 1: Clean test run**

Run: `cd ..\foodbytes-api; mvn test` (with the JAVA_HOME / Maven PATH prefix from CLAUDE.md)
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 23: Production build ✓

- Skill: none — verification only

**Files:**
- (none)

- [x] **Step 1: Build the client**

Run: `npm run build`
Expected: `built in <n>s`, no errors.

### Task 24: Write the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-46-dragon-lair-decor/pr-description.md`

- [x] **Step 1: Write `pr-description.md`**

Include: a link to `plan.md`; the summary (55 lair drawings ported from `pip-room-dragon.html`, legacy shift in `packDecorArt`, `decorLabel` on picker / Shop Decor / spot buttons / bought line / recent list, the bought-style name fix, 19 decor ambience entries, `FULL_DECOR_LINES` coverage) and the new version from Task 19; "No migration, no backend change, no Railway step"; the verification results (check:room, check:sprinkles, check:themes, SSR compare, build, mvn test, the Task 17 localhost walk); a convention note for contributors ("A room pack that draws every decor id joins `FULL_DECOR_LINES` in `packs.check.mjs`; names go in `ROOM_LABELS[line].decor` and are read through `decorLabel`"); suggested commit subject `MPP-46: Dragon lair decor — 55 lair drawings and names`.

---

## Self-review

**Spec coverage:**
- Port helpers + decor palette — Task 5.
- Port all 55 drawings, registered in `DRAGON_ROOM.decor` — Tasks 6–11, coverage enforced by Task 12.
- Legacy shift for pack-drawn ids — Tasks 2, 3, asserted in Task 4, seen in Task 17.
- 19 decor ambience entries — Task 6.
- Per-line names + `decorLabel`, on picker / Shop Decor / spot buttons / bought line / recent list — Tasks 13–16.
- Coverage check (draws and names all 55, finite) — Tasks 4, 12, 13.
- Animation stops under Low FX / reduced motion / thumbnails — existing `roomFx.css`, verified in Task 17.
- Herb and robot untouched — Tasks 1, 2, 14, 21 (SSR compare) and Task 17 (visual robot check).
- Mockup sync — Task 18. Version bump — Task 19.

**Placeholder scan:** No `TBD`, `TODO`, "implement later" or "appropriate error handling". Port tasks name their exact ids and mockup line ranges and defer the drawing bodies to the verbatim source under one stated translation table; every step has a code block or a `Run:` / `Expected:` pair.

**Type / name consistency:** `DECOR_LEGACY_IDS` (roomLayout.js; used in decorArt.jsx, roomPacks.jsx), `packDrawnDecor` (roomPacks.jsx only), `DRAGON_DECOR`, `DRAGON_WALL_DECOR`, `DRAGON_WINDOW_DECOR`, `DRAGON_RUG_DECOR`, `DRAGON_FLOOR_BACK_DECOR`, `DRAGON_FLOOR_FRONT_DECOR`, `FULL_DECOR_LINES`, `decorLabel(line, id)`, `decorBoughtLine(itemId, room, line = PIP_DEFAULT_LINE)` — used identically across Tasks 2–16 and matching plan.md → Data shapes. The plan's `ICE_DK` note is conditional and needs no task unless a drawing references it.

**Phase boundary cleanliness:**
- Phase 1 ends green: the shift and render loop are live, dragon still falls back to herb, SSR identical.
- Phase 2 ends green after every task: each area file is registered as it lands; unported ids fall back to herb until Task 11, and Task 12's coverage assert lands only after all 55 exist.
- Phase 3 ends green: names are additive with herb fallback; herb fixtures stay identical.
- Phase 4 changes docs only (plus any slip fix re-checked by `check:room`).
- Phase 5 is checks plus the version bump.
