# Tasks: Themed Pip rooms — room engine per creature, lair and workshop shell, stations and styles, themed room UI

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-16

**Goal:** Pip's room is drawn by a per-creature pack chosen by `theme.pipLine`: herb (today's art, byte-identical), dragon lair and robot workshop (ported from the approved mockups; decor falls back to herb). The room UI chrome follows the app theme through normalised `--pet-*` tokens.

**Spec:** `plan.md` in this folder. Upstream: `.claude/contract/2026-11-16-themed-pip-rooms-mockups/spec.md` and `pr-description.md` (or their `archive/` paths).

**Paths below are relative to the repo root.** `client/` means `foodbytes-app/client/`, `mockup/` means `foodbytes-app/mockup/`, and `room/` means `foodbytes-app/client/src/components/pet/room/`.

---

## File map

**Created:**
- `foodbytes-app/client/scripts/ssrLoad.mjs`: `withSsr(fn)` boots Vite in SSR middleware mode and closes it in `finally`
- `foodbytes-app/client/scripts/room-ssr.mjs`: herb-room SSR snapshot (`--write <dir>` / `--compare <dir>`)
- `.claude/contract/MPP-45-themed-pip-rooms-engine/ssr-baseline/*.html`: the pre-change Default markup
- `.claude/contract/MPP-45-themed-pip-rooms-engine/findings.md`: smoke output, SleepZs numbers, literal audit
- `foodbytes-app/client/src/constants/petRoomLabels.js`: `ROOM_LABELS[line]`, `stationLabel`, `stationLevelName`, `styleLabel`
- `room/herbRoom.js`: `HERB_ROOM` pack wrapping today's art
- `room/roomPacks.js`: `ROOM_PACKS`, `roomPack`, `packStationArt`, `packDecorArt`, `packBackdrop`, `packStyle`, `packEffects`
- `room/roomPackContext.js`: `RoomPackContext`, `useRoomPack`
- `room/roomFx.css`: ambience keyframes and stop rules
- `room/packs/packShapes.jsx`: shared JSX port of the mockups' iso string helpers, `packShapes(ink)`, `rnd`, `fmt`, `tint`
- `room/packs/packs.check.mjs`: pack coverage and finite-output check
- `room/packs/dragon/`: `dragonPalette.js`, `dragonParts.jsx`, `dragonShell.jsx`, `dragonBed.jsx`, `dragonFridge.jsx`, `dragonCooker.jsx`, `dragonCabinet.jsx`, `dragonWardrobeStation.jsx`, `dragonEffects.jsx`, `dragonRoom.js`
- `room/packs/robot/`: `robotPalette.js`, `robotParts.jsx`, `robotShell.jsx`, `robotBed.jsx`, `robotFridge.jsx`, `robotCooker.jsx`, `robotCabinet.jsx`, `robotWardrobeStation.jsx`, `robotEffects.jsx`, `robotRoom.js`

**Modified:**
- `foodbytes-app/client/package.json`: `check:room` chains `packs.check.mjs`; add `snapshot:room`; version bump
- `foodbytes-app/client/src/components/pet/PetView.jsx`: pass `line` to `PetRoom` and `usePetShop`
- `room/PetRoom.jsx`: provider, pack art, pack effects, surround, SleepZs placement
- `room/RoomDecorLayers.jsx`, `room/StationThumb.jsx`, `room/DecorThumb.jsx`, `room/RoomStyleChips.jsx`, `room/ShopStylesTab.jsx`, `room/ShopStationCard.jsx`, `room/EarnRecentList.jsx`: read the pack and its names
- `foodbytes-app/client/src/hooks/usePetShop.js`: per-line level names in the status lines
- `foodbytes-app/client/src/utils/sprinkleHistory.js`: `groupRecent(entries, line)`
- `foodbytes-app/client/src/styles/themes/default.css`, `parchment.css`, `cyberpunk.css`: `--pet-*` tokens, `--pip-focus-ring`
- `foodbytes-app/client/src/components/pet/PetView.css`, `foodbytes-app/client/src/components/pet/SprinklesChip.css`, and the room CSS files (`CheckInActions.css`, `DecorPicker.css`, `FridgeView.css`, `PetRoom.css`, `PipHeadBar.css`, `ShopEarnTab.css`, `ShopView.css`, `TrophyCabinetView.css`, `WardrobeView.css`): literals become tokens, and the pin moves
- `foodbytes-app/client/scripts/check-themes.mjs`: `PET_PAIRS`, `parseColour`, `flatten`
- `CLAUDE.md`: Themes section (pin rule, room packs, `check:themes` expected output)
- `mockup/pip-room-chrome.html`, `mockup/README.md`: normalised token names, the new rows, status-line copy
- `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md`: version bump

**Deleted:** (none)

---

## Phase 1 — Baseline and drift guard

Read-only against production code: re-check the mockup geometry and record the Default markup before anything changes. The tree is untouched apart from new scripts and contract-folder files, so the build stays green.

### Task 1: Re-run the mockup geometry smokes ✓

- Skill: none — runs an existing contract script, no code change

**Files:**
- Create: `.claude/contract/MPP-45-themed-pip-rooms-engine/findings.md`

- [x] **Step 1: Run both smokes strictly**

Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-dragon.html --expect-complete; node .claude\contract\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs foodbytes-app\mockup\pip-room-robot.html --expect-complete`
Expected, for each file: missing 0, stations 20/20 fit, decor 55/55 fit, labels 5 / levels 5x4 / 55 / 10, and 267 geometry numbers checked with 0 mismatches. (If the folder was archived, use `.claude\contract\archive\2026-11-16-themed-pip-rooms-mockups\mockup-smoke.mjs`.)

- [x] **Step 2: Record or stop**

Paste both outputs under `## Mockup smoke` in `findings.md`. **If any geometry number mismatches, stop the contract and report.** The live geometry drifted from the approved art, and the ports would no longer fit.

### Task 2: SSR loader and herb-room baseline ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/scripts/ssrLoad.mjs`
- Create: `foodbytes-app/client/scripts/room-ssr.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`)
- Create: `.claude/contract/MPP-45-themed-pip-rooms-engine/ssr-baseline/` (generated)

- [x] **Step 1: Write `ssrLoad.mjs`**

```js
// Boots Vite in SSR middleware mode so node scripts can import the client's JSX (and its CSS imports) as the app does.
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'

const CLIENT_ROOT = fileURLToPath(new URL('../', import.meta.url))

export async function withSsr(fn) {
  const server = await createServer({ root: CLIENT_ROOT, logLevel: 'error', appType: 'custom', server: { middlewareMode: true, hmr: false } })
  try {
    return await fn((path) => server.ssrLoadModule(path))
  } finally {
    await server.close()
  }
}
```

- [x] **Step 2: Write `room-ssr.mjs`**

It renders each fixture with `react-dom/server` `renderToStaticMarkup` and writes `<fixture>.html` (`--write <dir>`), or compares byte-for-byte (`--compare <dir>`). On a mismatch it prints the fixture, the first differing offset and 120 characters around it, then `process.exit(1)`. On success it prints `Room SSR OK: <n> fixtures identical`. Pass `line` only if `PetRoom` accepts it, so the same script works before and after Phase 2: `{ ...props, line: 'herb' }` is harmless before (an unknown prop is ignored).

Fixtures (all herb; `decor` is a stub with no-op functions: `{ room: { placements, decor: [], freeMode: false }, editing, selectedSpot: null, openSpot() {}, closeSpot() {}, place() {}, toggle() {}, done() {}, error: null }`):

| Fixture | PetRoom props |
|---|---|
| `day-rug-l1-defaults` | `name:'Pip', mood:'content', bubble:'Hi', position:'rug', levels: DEFAULT_ROOM_LEVELS`, decor placements `DEFAULT_PLACEMENTS` |
| `all-l4-every-spot` | all stations level 4; placements = `DEFAULT_PLACEMENTS` plus, for every spot in `DECOR_SPOTS`, the first `DECOR_ITEMS` id whose `spot` matches |
| `asleep-l2` | `position:'bed'`, all stations level 2 |
| `cooking-served-fridge-50` | `serving:{ phase:'served', mealType:'DINNER' }`, `fridge:{ fill:{ pct:50, planned:4 } }` |
| `editing` | `day-rug-l1-defaults` with `decor.editing: true` |
| `station-thumbs` | `<StationThumb station level>` for 5 stations × levels 1–4, concatenated |
| `decor-thumbs` | `<DecorThumb id>` for every key of `DECOR_ITEMS`, concatenated |
| `style-tab-and-chips` | `<ShopStylesTab>` and `<RoomStyleChips>` with all 10 `ROOM_STYLES` ids owned (read each component's props in its file; pass no-op handlers) |

Load modules with `load('/src/components/pet/room/PetRoom.jsx')` etc. inside `withSsr`.

- [x] **Step 3: Add the npm script**

In `package.json` → `scripts`: `"snapshot:room": "node scripts/room-ssr.mjs"`.

- [x] **Step 4: Write the baseline, then prove it is stable**

Run: `cd foodbytes-app\client; node scripts\room-ssr.mjs --write ..\..\.claude\contract\MPP-45-themed-pip-rooms-engine\ssr-baseline; node scripts\room-ssr.mjs --compare ..\..\.claude\contract\MPP-45-themed-pip-rooms-engine\ssr-baseline`
Expected: 8 `.html` files written, then `Room SSR OK: 8 fixtures identical`. If a fixture throws during render (for example a hook touching `window` during render), fix the fixture props; never change production code in this phase.

### Task 3: Confirm or refute the SleepZs offset ✓

- Skill: none — a read-only numeric check

**Files:**
- Modify: `.claude/contract/MPP-45-themed-pip-rooms-engine/findings.md`

- [x] **Step 1: Compute where the Zs are drawn versus the bed**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {STATION_ANCHORS,STATION_SHIFT,shiftPx} from './src/components/pet/room/roomLayout.js'; import {P} from './src/components/pet/room/iso.js'; for (const l of [1,2,3,4]) { const [u,v,h]=STATION_ANCHORS.bedTop[l-1]; const [dx,dy]=shiftPx(STATION_SHIFT.bed); const [x,y]=P(u,v,h); console.log(l, 'zzz at', x.toFixed(1), y.toFixed(1), 'bed top at', (x+dx).toFixed(1), (y+dy).toFixed(1)) }"`
Expected: each level prints two different points about `shiftPx([0, 70])` apart. That confirms `SleepZs` (drawn outside `ShiftedStation` in `PetRoom.jsx`) is off the shifted bed.

- [x] **Step 2: Record the decision**

Under `## SleepZs` in `findings.md`, paste the output and write either "Confirmed: Task 10 runs", or "Not reproduced: skip Task 10, and Task 6 draws pack Zs where herb's are today".

---

## Phase 2 — Engine with the herb pack only

Introduce the registry, context, labels and ambience CSS with only `HERB_ROOM` registered, and rewire every consumer. The phase ends with the Default SSR compare passing (with only the confirmed SleepZs diff) and the build green.

### Task 4: Per-line room labels ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/petRoomLabels.js`

- [x] **Step 1: Write the herb labels from existing constants (no duplicated strings)**

```js
import { PIP_DEFAULT_LINE, PIP_LINE } from './pipLines.js'
import { SHOP_STATIONS, STATION_LEVEL_NAMES } from './petShop.js'
import { ROOM_STYLES } from './petDecor.js'

/**
 * MPP-45: station, level and style names per Pip line (decor names stay herb until MPP-46/47).
 * Herb reads today's constants; dragon / robot are copied from the approved room mockups' `labels`.
 */
const HERB_LABELS = {
  stations: Object.fromEntries(SHOP_STATIONS.map(s => [s.key, s.label])),
  levels: STATION_LEVEL_NAMES,
  styles: Object.fromEntries(Object.entries(ROOM_STYLES).map(([id, s]) => [id, s.label]))
}

export const ROOM_LABELS = {
  [PIP_LINE.HERB]: HERB_LABELS
}

const labelsOf = (line) => ROOM_LABELS[line] ?? ROOM_LABELS[PIP_DEFAULT_LINE]

export const stationLabel = (line, station) => labelsOf(line).stations[station] ?? HERB_LABELS.stations[station] ?? station
export const stationLevelName = (line, station, level) => (labelsOf(line).levels[station] ?? HERB_LABELS.levels[station])?.[level - 1]
export const styleLabel = (line, styleId) => labelsOf(line).styles[styleId] ?? HERB_LABELS.styles[styleId]
```

- [x] **Step 2: Smoke it**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {stationLabel,stationLevelName,styleLabel} from './src/constants/petRoomLabels.js'; console.log(stationLabel('herb','cabinet'), '|', stationLevelName('dragon','bed',2), '|', styleLabel('robot','wall-sprig'), '|', stationLevelName('herb','bed',9))"`
Expected: `Trophy cabinet | Camp cot | Sprig wallpaper | undefined` (dragon and robot fall back to herb until Phases 3–4).

### Task 5: Herb pack, registry and context ✓

- Skill: react-frontend

**Files:**
- Create: `room/herbRoom.js`
- Create: `room/roomPacks.js`
- Create: `room/roomPackContext.js`

- [x] **Step 1: `herbRoom.js` wraps today's functions without touching them**

```js
import { PIP_LINE } from '../../../constants/pipLines'
import { ROOM_INK } from '../../../constants/petRoom'
import { ROOM_STYLES } from '../../../constants/petDecor'
import { ROOM_LABELS } from '../../../constants/petRoomLabels'
import { decorArt } from './decorArt'
import { stationArt } from './furniture'
import { roomBackdrop } from './roomDecor'
import { FridgeGauge, PotSteam, ServedPlate, SleepZs } from './roomEffects'

/** MPP-45: the herb room = today's art, unchanged. Its own caches (stationArt, roomBackdrop, decorArt) stay in charge. */
export const HERB_ROOM = {
  line: PIP_LINE.HERB,
  ink: ROOM_INK,
  styles: ROOM_STYLES,
  backdropById: roomBackdrop,
  stationById: stationArt,
  decorById: decorArt,
  stations: {},
  decor: {},
  effects: { FridgeGauge, PotSteam, ServedPlate, SleepZs },
  ambience: [],
  labels: ROOM_LABELS[PIP_LINE.HERB]
}
```

- [x] **Step 2: `roomPacks.js`, the registry with per-item herb fallback and caches keyed by line**

```js
import { PIP_DEFAULT_LINE, PIP_LINE } from '../../../constants/pipLines'
import { DEFAULT_FLOOR_STYLE, DEFAULT_WALL_STYLE, ROOM_SPOTS, ROOM_STYLES } from '../../../constants/petDecor'
import { HERB_ROOM } from './herbRoom'

/**
 * MPP-45: one room pack per Pip line (mirrors pip/wardrobeArt.js LINE_WARDROBE). Every accessor falls back to the
 * herb item per entry, so a pack can ship its shell before its decor (MPP-46/47). Built art is cached per line so
 * the minute re-render diffs the same elements.
 */
export const ROOM_PACKS = {
  [PIP_LINE.HERB]: HERB_ROOM
}

export const roomPack = (line) => ROOM_PACKS[line] ?? ROOM_PACKS[PIP_DEFAULT_LINE]

const stationCache = new Map()
const decorCache = new Map()
const backdropCache = new Map()

export function packStationArt(pack, station, level) {
  const build = pack.stations?.[station]?.[level - 1]
  if (!build) return HERB_ROOM.stationById(station, level)
  const key = `${pack.line}:${station}:${level}`
  if (!stationCache.has(key)) stationCache.set(key, build())
  return stationCache.get(key)
}

export function packDecorArt(pack, id) {
  if (!id) return null
  const key = `${pack.line}:${id}`
  if (!decorCache.has(key)) decorCache.set(key, pack.decor?.[id] ? pack.decor[id]() : HERB_ROOM.decorById(id))
  return decorCache.get(key)
}

export const packStyle = (pack, id) => pack.styles?.[id] ?? ROOM_STYLES[id] ?? null

export function packBackdrop(pack, night, wallStyleId, floorStyleId) {
  if (pack.backdropById) return pack.backdropById(night, wallStyleId, floorStyleId)
  const wallId = ROOM_STYLES[wallStyleId]?.spot === ROOM_SPOTS.WALL_STYLE ? wallStyleId : DEFAULT_WALL_STYLE
  const floorId = ROOM_STYLES[floorStyleId]?.spot === ROOM_SPOTS.FLOOR_STYLE ? floorStyleId : DEFAULT_FLOOR_STYLE
  const key = `${pack.line}|${night ? 'night' : 'day'}|${wallId}|${floorId}`
  if (!backdropCache.has(key)) backdropCache.set(key, pack.backdrop(night, packStyle(pack, wallId), packStyle(pack, floorId)))
  return backdropCache.get(key)
}

export const packEffects = (pack) => ({ ...HERB_ROOM.effects, ...pack.effects })
```

`packDecorArt` returns `null` for an unknown id because `decorArt` does. Do not cache `undefined` ids; the `!id` guard covers them.

- [x] **Step 3: `roomPackContext.js`**

```js
import { createContext, useContext } from 'react'
import { HERB_ROOM } from './herbRoom'

/** MPP-45: the active room pack, provided by PetRoom from theme.pipLine. Defaults to herb so a lone thumbnail still draws. */
export const RoomPackContext = createContext(HERB_ROOM)
export const useRoomPack = () => useContext(RoomPackContext)
```

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 6: Wire PetRoom, PetView and the decor layers to the pack ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx:131-146`
- Modify: `room/PetRoom.jsx`
- Modify: `room/RoomDecorLayers.jsx`

- [x] **Step 1: PetView passes the line**

Add `line={line}` to `<PetRoom …>`.

- [x] **Step 2: PetRoom provides the pack and draws through it**

- Add the `line = PIP_DEFAULT_LINE` prop (import from `constants/pipLines`) and `const pack = roomPack(line)`.
- Wrap the returned `<div className="pip-room">` in `<RoomPackContext.Provider value={pack}>`.
- Replace `roomBackdrop(asleep, …)` with `packBackdrop(pack, asleep, placements?.wallStyle, placements?.floorStyle)`.
- On `.pip-room-stage` add `style={pack.surround ? { background: pack.surround } : undefined}`. Herb has no `surround`, so no attribute is rendered.
- `Station` reads `const pack = useRoomPack()` and `const { FridgeGauge, PotSteam, ServedPlate } = packEffects(pack)`, and uses `packStationArt(pack, station, level)` in place of `stationArt`.
- Keep the herb markup order exactly as today. Leave `SleepZs` where it is in this task (Task 10 moves it). Render it as `packEffects(pack).SleepZs`.
- Remove the now-unused `stationArt` and `roomBackdrop` imports and update the MPP doc comment with one `MPP-45:` line.

- [x] **Step 3: DecorLayer and SpotOutline use `packDecorArt`**

In `RoomDecorLayers.jsx`, add `const pack = useRoomPack()` in both `DecorLayer` and `SpotOutline`, and replace each `decorArt(x)` with `packDecorArt(pack, x)`.

- [x] **Step 4: Measure and build**

Run: `cd foodbytes-app\client; (Get-Content src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines; npm run build`
Expected: a line count under 400, then `built in <n>s`.

### Task 7: Thumbnails, chips and the styles tab read the pack ✓

- Skill: react-frontend

**Files:**
- Modify: `room/StationThumb.jsx`
- Modify: `room/DecorThumb.jsx`
- Modify: `room/RoomStyleChips.jsx`
- Modify: `room/ShopStylesTab.jsx`

- [x] **Step 1: Swap the herb calls for pack calls**

- `StationThumb`: `const pack = useRoomPack()`, then `packStationArt(pack, station, level)`.
- `DecorThumb`: `packDecorArt(pack, id)`.
- `RoomStyleChips`: `const style = packStyle(pack, id)` and label `styleLabel(pack.line, id)`. The swatch keeps `style.left ?? style.base`.
- `ShopStylesTab`: label `styleLabel(pack.line, item.id)`, swatch `packStyle(pack, item.id)`, and stroke `pack.ink` in place of `ROOM_INK`.

Spot labels (`DECOR_SPOT_LABELS`) are unchanged.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`.

### Task 8: Station and level names in the Shop, the status line and the Earn history ✓

- Skill: react-frontend

**Files:**
- Modify: `room/ShopStationCard.jsx:16-31`
- Modify: `foodbytes-app/client/src/hooks/usePetShop.js:95-112`
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx` (the `usePetShop` call)
- Modify: `foodbytes-app/client/src/utils/sprinkleHistory.js` (`groupRecent` and its row-text helper)
- Modify: `room/EarnRecentList.jsx`

- [x] **Step 1: ShopStationCard**

Use `const pack = useRoomPack()`. Names become `stationLevelName(pack.line, station.key, n)`; the label becomes `stationLabel(pack.line, station.key)` (both in the heading and the `aria-label`). The icon stays from `SHOP_STATIONS`.

- [x] **Step 2: usePetShop takes the line**

The signature becomes `usePetShop({ applyRoomWrite, refreshPet, line })`. `upgradedLine(line, station, level)` and `levelSetLine(line, station, level)` use `stationLabel` and `stationLevelName`. PetView passes `line`. Remove the imports of `STATION_LEVEL_NAMES` and `SHOP_STATIONS` if they are now unused.

- [x] **Step 3: sprinkleHistory takes the line**

`groupRecent(entries, line = PIP_DEFAULT_LINE)` threads `line` to the row-text helper. In the helper:
- `STATION_UPGRADE` uses `stationLevelName(line, entry.station, entry.level)`.
- The `DECOR_PURCHASE` style branch uses `styleLabel(line, entry.decorItem)` (spot from `ROOM_STYLES` as today).
- Decor item labels stay `DECOR_ITEMS[...].label`.

`EarnRecentList` calls `groupRecent(entries, useRoomPack().line)`. Read the hook into a const at the component top, following the rules of hooks.

- [x] **Step 4: Existing checks still pass**

Run: `cd foodbytes-app\client; npm run check:sprinkles; npm run build`
Expected: the sprinkles check prints its OK line (herb default unchanged), then `built in <n>s`.

### Task 9: Ambience CSS ✓

- Skill: react-frontend

**Files:**
- Create: `room/roomFx.css`
- Modify: `room/PetRoom.jsx` (import `./roomFx.css`)

- [x] **Step 1: Copy the keyframes verbatim and add the stop rules**

Copy, with no colours:
- From `mockup/pip-room-dragon.html:79-99`: `.room-fx`, the `--steam`, `--zzz`, `--flicker`, `--embers`, `--glint` and `--sway` rules and their `@keyframes`.
- From `mockup/pip-room-robot.html:85-94`: `--scan`, `--blink`, `--fan`, `--buzz` and `--rain` with their `@keyframes`.

Replace the mockup's `body.reduced` and `.is-still` lines with:

```css
/* MPP-45: ambience stops under Low FX, reduced motion and in every thumbnail (selector-only: no thumbnail markup change). */
body.lowfx .room-fx,
.pip-shop-thumb-svg .room-fx,
.pip-decor-thumb .room-fx,
.pip-style-swatch .room-fx { animation: none !important; }
body.lowfx .pip-room-svg [data-glow] { filter: none !important; }
@media (prefers-reduced-motion: reduce) { .room-fx { animation: none !important; } }
```

- [x] **Step 2: Build and confirm no colour literal**

Run: `cd foodbytes-app\client; Select-String -Path src\components\pet\room\roomFx.css -Pattern "#[0-9a-fA-F]{3,8}|rgba?\("; npm run build`
Expected: zero hits, then `built in <n>s`.

### Task 10: Draw the Zs inside the bed's shifted group (only if Task 3 confirmed) ✓

- Skill: react-frontend

**Files:**
- Modify: `room/PetRoom.jsx`

- [x] **Step 1: Move the Zs**

Delete `{asleep && <SleepZs level={resolved.bed} />}` after the front-floor decor layer. In `Station`'s bed branch, render `{position === PIP_POSITIONS.BED && <SleepZs level={level} />}` after `{art.front}`, with `SleepZs` from `packEffects(pack)`. It now sits inside the bed's `ShiftedStation` transform.

Note: the Zs are now drawn before the front-floor decor layer, so a front-floor item could overlap them. Check this in the Phase 6 walk with a footOfBed item placed.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`.

### Task 11: Pack coverage check, and the Default SSR compare ✓

- Skill: react-frontend

**Files:**
- Create: `room/packs/packs.check.mjs`
- Modify: `foodbytes-app/client/package.json` (`check:room`)

- [x] **Step 1: Write `packs.check.mjs`**

```js
// Run: npm run check:room (chained after room.check.mjs)
// MPP-45: every registered room pack covers the shared ids, names them, and draws finite markup.
import assert from 'node:assert/strict'
import { withSsr } from '../../../../../scripts/ssrLoad.mjs'

await withSsr(async (load) => {
  const { createElement: h, Fragment } = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { ROOM_PACKS, packStationArt, packBackdrop, packEffects, packStyle } = await load('/src/components/pet/room/roomPacks.js')
  const { ROOM_STATIONS, ROOM_MAX_LEVEL } = await load('/src/constants/petRoom.js')
  const { ROOM_STYLES, ROOM_SPOTS, DEFAULT_WALL_STYLE, DEFAULT_FLOOR_STYLE } = await load('/src/constants/petDecor.js')
  const { stationLabel, stationLevelName, styleLabel } = await load('/src/constants/petRoomLabels.js')
  const svg = (node) => renderToStaticMarkup(h('svg', null, node))
  const finite = (markup, what) => {
    assert.ok(markup.length > 20, `${what}: empty`)
    assert.ok(!/NaN|Infinity|undefined/.test(markup), `${what}: non-finite or undefined in markup`)
  }
  const stations = Object.values(ROOM_STATIONS)
  const styleIds = Object.keys(ROOM_STYLES)
  for (const [line, pack] of Object.entries(ROOM_PACKS)) {
    for (const station of stations) {
      assert.ok(stationLabel(line, station), `${line}: no name for ${station}`)
      for (let level = 1; level <= ROOM_MAX_LEVEL; level++) {
        if (line !== 'herb') assert.ok(pack.stations[station]?.[level - 1], `${line}: missing ${station} L${level}`)
        assert.ok(stationLevelName(line, station, level), `${line}: no level name ${station} L${level}`)
        const art = packStationArt(pack, station, level)
        finite(svg(station === 'bed' ? h(Fragment, null, art.back, art.front) : art), `${line} ${station} L${level}`)
      }
    }
    for (const id of styleIds) {
      assert.ok(styleLabel(line, id), `${line}: no name for ${id}`)
      if (line !== 'herb') assert.ok(pack.styles[id], `${line}: missing style ${id}`)
      const wall = ROOM_STYLES[id].spot === ROOM_SPOTS.WALL_STYLE
      for (const night of [false, true]) {
        finite(svg(packBackdrop(pack, night, wall ? id : DEFAULT_WALL_STYLE, wall ? DEFAULT_FLOOR_STYLE : id)), `${line} ${id} ${night ? 'night' : 'day'}`)
      }
      assert.ok(packStyle(pack, id), `${line}: packStyle(${id}) is null`)
    }
    const { FridgeGauge, PotSteam, ServedPlate, SleepZs } = packEffects(pack)
    if (line !== 'herb') for (const k of ['FridgeGauge', 'PotSteam', 'ServedPlate', 'SleepZs']) assert.ok(pack.effects[k], `${line}: missing effect ${k}`)
    for (let level = 1; level <= ROOM_MAX_LEVEL; level++) {
      for (const pct of [0, 50, 100]) finite(svg(h(FridgeGauge, { level, pct })), `${line} gauge L${level} ${pct}%`)
      finite(svg(h(PotSteam, { level })), `${line} steam L${level}`)
      finite(svg(h(ServedPlate, { level })), `${line} plate L${level}`)
      finite(svg(h(SleepZs, { level })), `${line} zzz L${level}`)
    }
    assert.ok(typeof pack.ink === 'string' && pack.ink.startsWith('#'), `${line}: ink`)
    assert.ok(Array.isArray(pack.ambience), `${line}: ambience`)
  }
  console.log(`Room packs OK: ${Object.keys(ROOM_PACKS).join(', ')}`)
})
```

Fix the relative import depth to `scripts/ssrLoad.mjs` if the path above is off by one. `room/packs/` sits five levels below `client/`.

- [x] **Step 2: Chain it into `check:room`**

In `package.json`: `"check:room": "node src/components/pet/room/room.check.mjs && node src/components/pet/room/packs/packs.check.mjs"`.

- [x] **Step 3: Run the checks and the Default compare**

Run: `cd foodbytes-app\client; npm run check:room; node scripts\room-ssr.mjs --compare ..\..\.claude\contract\MPP-45-themed-pip-rooms-engine\ssr-baseline`
Expected:
- `check:room` passes and ends with `Room packs OK: herb`.
- The compare passes with **every fixture identical**, except `asleep-l2` if Task 10 ran. Its only difference must be the `<g class="pip-zzz">` block moving inside the bed's shifted `<g transform=…>`.
- Write that diff excerpt under `## SleepZs` in `findings.md`. Then re-baseline that one fixture: `node scripts\room-ssr.mjs --write <dir>` (rewrites all; first confirm the other 7 were identical).
- Any other difference is a regression in this phase. Fix it before continuing.

---

## Phase 3 — Dragon lair pack

Port `DRAGON_ROOM` from `mockup/pip-room-dragon.html` (shell, styles, stations, effects, ambience, labels; not decor) to JSX and register it. Herb is untouched, so the Default compare still holds. The phase ends with `check:room` covering `herb, dragon`.

**Port rules (every task in Phases 3–4):**
- One-to-one: same numbers, same order of shapes (draw order = string concatenation order), same colours.
- Attribute mapping: `stroke-width` → `strokeWidth`, `stroke-linejoin` → `strokeLinejoin`, `stroke-linecap` → `strokeLinecap`, `font-size` → `fontSize`, `font-weight` → `fontWeight`, `text-anchor` → `textAnchor`, `font-family` → `fontFamily`, `clip-path` → `clipPath`, `pointer-events` → `pointerEvents`, `class` → `className`, `style="animation-delay:-1.2s"` → `style={{ animationDelay: '-1.2s' }}`, `data-glow` stays `data-glow`.
- Concatenation becomes a fragment. Lists from `.map(...).join('')` become arrays with stable `key`s (index is fine; the art is static).
- Drop `track(...)` and `measure(...)`.
- Each file stays under 400 lines; measure every file before finishing a task.

### Task 12: Shared JSX port of the mockups' iso helpers ✓

- Skill: react-frontend

**Files:**
- Create: `room/packs/packShapes.jsx`

- [x] **Step 1: Port the helper block**

From `mockup/pip-room-dragon.html:335-518` (`<script id="room-iso">`), port:
- `fmt`, `tint` and `rnd(seed)`. Import `P`, `pts`, `shade`, `boxFaces`, `ellipsePoints` and `cylinderSidePoints` from `room/iso.js` instead of copying them; the mockup copied them verbatim from there.
- `rectVPoints`, `rectUPoints`, `rectHPoints`, `arcPts` and `nearRange`.
- `packShapes(ink)`, which returns element builders mirroring the mockup signatures, with `ink` where the mockup reads `ART_INK`: `poly(points, fill, o)`, `isoLine(points, width, color = ink, o)`, `isoLines(segs, width, color = ink, op)`, `box(u, v, du, dv, h0, h1, color, o)`, `rectV`, `rectU`, `rectH`, `ellH`, `cylE`, `cyl`, `bill(u, v, h, inner, ext)` (`inner` is a JSX node), `fxg(effect, inner, delay)` and `glowAttr(color, radius)`.

Read the robot file's `room-iso` block (`mockup/pip-room-robot.html:337-520`) and confirm it is identical to the dragon one (follow-up c). Record "identical" or the differing lines in `findings.md` → `## Shared engine`. If they differ, port the union and note the difference.

- [x] **Step 2: Smoke one shape**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {withSsr} from './scripts/ssrLoad.mjs'; await withSsr(async load => { const {packShapes} = await load('/src/components/pet/room/packs/packShapes.jsx'); const {renderToStaticMarkup} = await import('react-dom/server'); const {box} = packShapes('#2b2630'); console.log(renderToStaticMarkup(box(0,0,10,10,0,10,'#888888'))) })"`
Expected: three `<polygon …>` elements with `stroke="#2b2630"`, and no `NaN`.

### Task 13: Dragon palette and parts ✓

- Skill: react-frontend

**Files:**
- Create: `room/packs/dragon/dragonPalette.js`
- Create: `room/packs/dragon/dragonParts.jsx`

- [x] **Step 1: Palette**

Port the colour constants (`STONE*`, `IRON*`, `WOOD*`, `GOLD*`, `ICE*`, `FIRE*`, `EMBER`, `CLOAK`, `BONE` and any others the stations and shell use) from `mockup/pip-room-dragon.html:879-890` and wherever else they are defined in the `room-pack` block. Add `export const DRAGON_INK = '#2b2630'`.

- [x] **Step 2: Parts**

Port the shared drawing helpers that the shell and stations use, from the `room-pack` block lines 680–1139: `gem`, trophy/medal/crown art, `flameArt`, `embers`, `brickV`, `brickU`, `archV`, `planksV`, `mound`, `coinScatter`, `straw`, `nest`, `pelt`, `seamsV`, `seamsU`, `rivetsV`, `crystal`, `egg`, `stoneBox`, `drape`, and any others called from lines 1157–1851.

Skip helpers called only from `decor` (lines 1456–1817). To find them, grep each helper's name in 1157–1455 and 1818–1851; a helper used only in the decor range is MPP-46's.

All take `S = packShapes(DRAGON_INK)` at module scope.

- [x] **Step 3: Measure and build**

Run: `cd foodbytes-app\client; Get-ChildItem src\components\pet\room\packs\dragon\*.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }; npm run build`
Expected: every file under 400 lines (split `dragonParts.jsx` into `dragonParts.jsx` + `dragonTreasure.jsx` if needed), then `built in <n>s`.

### Task 14: Dragon shell (styles and backdrop) ✓

- Skill: react-frontend

**Files:**
- Create: `room/packs/dragon/dragonShell.jsx`

- [x] **Step 1: Port `styles` and `backdrop`**

- `DRAGON_STYLES` is lines 1144–1155, verbatim.
- Port the wall and floor pattern builders (`stoneCourses`, `mossPatches`, `ivyVines`, `emberCracks`, `wallTorch`, `wallBanner`, `shellFixtures`, `earthFloor`, `flagFloor`, `slateFloor`, `runeFloor`, `CAVE`, `caveArch`, `cavePt`, `caveRimQuad`) from lines 696–878.
- Port the `backdrop` members (`wallPattern`, `floorPattern`, `skirting`, `windowFrame`, `glass`, `sky`, `sill`) from lines 1157–1219.

Export `dragonBackdrop(night, wall, floor)`. It composes in the mockup engine's backdrop order: read `room-engine` (lines 1981–2227) for the order the engine draws walls, wall pattern, floor, floor pattern, skirting, corner lines, window frame, glass, sky and sill, and reproduce it exactly. The cave mouth sits in the live `WINDOW_SHIFT` group as the mockup engine places it.

- [x] **Step 2: Measure and build**

Run: `cd foodbytes-app\client; (Get-Content src\components\pet\room\packs\dragon\dragonShell.jsx | Measure-Object -Line).Lines; npm run build`
Expected: under 400 (move the floor builders to `dragonFloors.jsx` if over), then `built in <n>s`.

### Task 15: Dragon bed and fridge stations ✓

- Skill: react-frontend

**Files:**
- Create: `room/packs/dragon/dragonBed.jsx`
- Create: `room/packs/dragon/dragonFridge.jsx`

- [x] **Step 1: Port the four levels each**

- `DRAGON_BED` is the `stations.bed` array, starting at line 1223. Each level returns `{ back, front }`, exactly as the mockup.
- `DRAGON_FRIDGE` is the `stations.fridge` array, which follows `bed`.

Each entry is `() => JSX`.

- [x] **Step 2: Measure and build**

Run: `cd foodbytes-app\client; Get-ChildItem src\components\pet\room\packs\dragon\dragon{Bed,Fridge}.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }; npm run build`
Expected: each under 400, then `built in <n>s`.

### Task 16: Dragon cooker, cabinet and wardrobe stations ✓

- Skill: react-frontend

**Files:**
- Create: `room/packs/dragon/dragonCooker.jsx`
- Create: `room/packs/dragon/dragonCabinet.jsx`
- Create: `room/packs/dragon/dragonWardrobeStation.jsx`

- [x] **Step 1: Port the four levels each**

`DRAGON_COOKER`, `DRAGON_CABINET` and `DRAGON_WARDROBE` come from the rest of `stations` (up to line 1455). The hearth fire and embers keep their `room-fx` classes and delays.

- [x] **Step 2: Measure and build**

Run: `cd foodbytes-app\client; Get-ChildItem src\components\pet\room\packs\dragon\dragon{Cooker,Cabinet,WardrobeStation}.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }; npm run build`
Expected: each under 400, then `built in <n>s`.

### Task 17: Dragon effects, labels and pack registration ✓

- Skill: react-frontend

**Files:**
- Create: `room/packs/dragon/dragonEffects.jsx`
- Create: `room/packs/dragon/dragonRoom.js`
- Modify: `foodbytes-app/client/src/constants/petRoomLabels.js`
- Modify: `room/roomPacks.js`

- [x] **Step 1: Effects as components**

Port `gauge`, `steam`, `zzz` and `servedPlate` from lines 1818–1851 as `FridgeGauge({ level, pct })`, `PotSteam({ level })`, `SleepZs({ level })` and `ServedPlate({ level })`. Use the live `Bill` from `room/isoShapes.jsx` or the pack's `bill`, matching the mockup output. The gauge uses `fridgeGaugeColour(pct)` from `utils/fridgeFill` (the mockup's `gaugeColour`) and the live `FRIDGE_GAUGE_LIFT` and `SLEEP_Z_LIFT` from `roomLayout.js`. `nightDim` is not ported: the live `NightDim` HTML layer already exists.

- [x] **Step 2: Labels**

In `petRoomLabels.js` add `[PIP_LINE.DRAGON]: { stations, levels, styles }` copied verbatim from `mockup/pip-room-dragon.html:1871-1912`, without `decor`.

- [x] **Step 3: The pack**

```js
// dragonRoom.js
import { PIP_LINE } from '../../../../../constants/pipLines'
import { ROOM_LABELS } from '../../../../../constants/petRoomLabels'
import { DRAGON_INK } from './dragonPalette'
import { DRAGON_STYLES, dragonBackdrop } from './dragonShell'
import { DRAGON_BED } from './dragonBed'
import { DRAGON_FRIDGE } from './dragonFridge'
import { DRAGON_COOKER } from './dragonCooker'
import { DRAGON_CABINET } from './dragonCabinet'
import { DRAGON_WARDROBE } from './dragonWardrobeStation'
import { FridgeGauge, PotSteam, ServedPlate, SleepZs } from './dragonEffects'

/** MPP-45: the dragon lair (pip-room-dragon.html DRAGON_ROOM, approved 2026-11-16). Decor falls back to herb until MPP-46. */
export const DRAGON_ROOM = {
  line: PIP_LINE.DRAGON,
  ink: DRAGON_INK,
  surround: DRAGON_INK,
  styles: DRAGON_STYLES,
  backdrop: dragonBackdrop,
  stations: { bed: DRAGON_BED, fridge: DRAGON_FRIDGE, cooker: DRAGON_COOKER, cabinet: DRAGON_CABINET, wardrobe: DRAGON_WARDROBE },
  decor: {},
  effects: { FridgeGauge, PotSteam, ServedPlate, SleepZs },
  ambience: [ /* lines 1853-1869 verbatim, station and shell entries only; decor entries move with MPP-46 */ ],
  labels: ROOM_LABELS[PIP_LINE.DRAGON]
}
```

Copy the ambience entries whose `target` is `shell`, `window` or a station id. Leave decor-id entries for MPP-46.

Register it in `roomPacks.js`: `[PIP_LINE.DRAGON]: DRAGON_ROOM`.

- [x] **Step 4: Check and compare**

Run: `cd foodbytes-app\client; npm run check:room; node scripts\room-ssr.mjs --compare ..\..\.claude\contract\MPP-45-themed-pip-rooms-engine\ssr-baseline; npm run build`
Expected: `Room packs OK: herb, dragon`, then `Room SSR OK: 8 fixtures identical`, then `built in <n>s`.

---

## Phase 4 — Robot workshop pack

The same port for `ROBOT_ROOM` from `mockup/pip-room-robot.html`, with the night-window rain. Herb is untouched. The phase ends with `check:room` covering all three packs.

### Task 18: Robot palette and parts ✓

- Skill: react-frontend

**Files:**
- Create: `room/packs/robot/robotPalette.js`
- Create: `room/packs/robot/robotParts.jsx`

- [x] **Step 1: Port**

- Palette: `export const ROBOT_INK = '#141b24'` plus the colour constants from the `room-pack` block (lines 686–1027).
- Parts: the helpers that stations, shell and effects use (CRT panels, LEDs, vents, bolts, cables and so on), selected the same way as Task 13 Step 2. Range: stations 1081–1290, effects 1618–1653; skip decor-only helpers (decor 1291–1617).
- All parts use `S = packShapes(ROBOT_INK)`.

- [x] **Step 2: Measure and build**

Run: `cd foodbytes-app\client; Get-ChildItem src\components\pet\room\packs\robot\*.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }; npm run build`
Expected: each under 400, then `built in <n>s`.

### Task 19: Robot shell (styles, backdrop, rain) ✓

- Skill: react-frontend

**Files:**
- Create: `room/packs/robot/robotShell.jsx`

- [x] **Step 1: Port `styles` and `backdrop`**

- `ROBOT_STYLES` is lines 1032–1043.
- The backdrop members are lines 1045–1080, with their pattern builders from the 686–1027 block.
- Export `robotBackdrop(night, wall, floor)` in the mockup engine's draw order (`room-engine`, lines 1789–2035).
- The night rain keeps the `<clipPath id="robot-glass-clip">` and the `room-fx room-fx--rain` group (mockup line ~972). Add the comment `// fixed id: the backdrop is drawn once per page (never in a thumbnail); switch to useId if that changes`.

- [x] **Step 2: Measure and build**

Run: `cd foodbytes-app\client; (Get-Content src\components\pet\room\packs\robot\robotShell.jsx | Measure-Object -Line).Lines; npm run build`
Expected: under 400 (split the floors into `robotFloors.jsx` if over), then `built in <n>s`.

### Task 20: Robot bed and fridge stations ✓

- Skill: react-frontend

**Files:**
- Create: `room/packs/robot/robotBed.jsx`
- Create: `room/packs/robot/robotFridge.jsx`

- [x] **Step 1: Port**

`ROBOT_BED` (charging pod; `{ back, front }` per level) and `ROBOT_FRIDGE` (cryo unit) come from `stations`, starting at line 1081.

- [x] **Step 2: Measure and build**

Run: `cd foodbytes-app\client; Get-ChildItem src\components\pet\room\packs\robot\robot{Bed,Fridge}.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }; npm run build`
Expected: each under 400, then `built in <n>s`.

### Task 21: Robot cooker, cabinet and wardrobe stations ✓

- Skill: react-frontend

**Files:**
- Create: `room/packs/robot/robotCooker.jsx`
- Create: `room/packs/robot/robotCabinet.jsx`
- Create: `room/packs/robot/robotWardrobeStation.jsx`

- [x] **Step 1: Port**

`ROBOT_COOKER` (fab oven), `ROBOT_CABINET` (display case / holo plinth) and `ROBOT_WARDROBE` (gear locker) come from the rest of `stations` (to line 1290).

- [x] **Step 2: Measure and build**

Run: `cd foodbytes-app\client; Get-ChildItem src\components\pet\room\packs\robot\robot{Cooker,Cabinet,WardrobeStation}.jsx | ForEach-Object { "$($_.Name) $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }; npm run build`
Expected: each under 400, then `built in <n>s`.

### Task 22: Robot effects, labels and pack registration ✓

- Skill: react-frontend

**Files:**
- Create: `room/packs/robot/robotEffects.jsx`
- Create: `room/packs/robot/robotRoom.js`
- Modify: `foodbytes-app/client/src/constants/petRoomLabels.js`
- Modify: `room/roomPacks.js`

- [x] **Step 1: Port the effects, labels and pack**

As in Task 17:
- Effects: lines 1618–1653.
- Labels: `[PIP_LINE.ROBOT]` from lines 1679–1720 (`stations`, `levels`, `styles`; no `decor`).
- `ROBOT_ROOM`: `line: PIP_LINE.ROBOT`, `ink` and `surround` = `ROBOT_INK`, and the ambience entries from lines 1655–1677 whose target is `shell`, `window` or a station (rain included).
- Register `[PIP_LINE.ROBOT]: ROBOT_ROOM` in `roomPacks.js`.

- [x] **Step 2: Check and compare**

Run: `cd foodbytes-app\client; npm run check:room; node scripts\room-ssr.mjs --compare ..\..\.claude\contract\MPP-45-themed-pip-rooms-engine\ssr-baseline; npm run build`
Expected: `Room packs OK: herb, dragon, robot`, then `Room SSR OK: 8 fixtures identical`, then `built in <n>s`.

---

## Phase 5 — Themed room UI

Move the chrome onto `--pet-*` tokens using the chrome mockup's table (normalised per `plan.md` → Token rename map), move the Default pin to the room art, theme the focus ring, and gate the result with `check:themes`. Default values equal today's literals, so Default renders the same. The phase ends with `check:themes` green and no new exceptions.

### Task 23: Add the tokens to the three theme files ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/styles/themes/default.css`
- Modify: `foodbytes-app/client/src/styles/themes/parchment.css`
- Modify: `foodbytes-app/client/src/styles/themes/cyberpunk.css`

- [x] **Step 1: Default**

Add a `/* ---- Pip's room UI (MPP-45) ---- */` group to `:root` in `default.css`. Include every `kind: "new"` token from `mockup/pip-room-chrome.html` `tokens[]` (lines 2436–2490), renamed per the plan's map, each with its `defaultValue` verbatim. Also add `--pet-gold-ring-shadow: rgba(255, 211, 77, 0.35);`. `--pip-focus-ring: #7c5cd6` stays as it is.

- [x] **Step 2: Parchment and Cyberpunk**

In each file's `:root[data-theme="<id>"]` block, add the same names with the table's `parchment` / `cyberpunk` values:
- `--pet-gold-ring-shadow`: `rgba(216, 178, 90, 0.35)` (Parchment) and `rgba(249, 240, 2, 0.35)` (Cyberpunk).
- `--pip-focus-ring: var(--focus-ink);` (Parchment) and `--pip-focus-ring: var(--yellow);` (Cyberpunk). Confirm both tokens exist in those files first: `Select-String -Path src\styles\themes\parchment.css -Pattern "--focus-ink:"` and `Select-String -Path src\styles\themes\cyberpunk.css -Pattern "--yellow:"`.

Do not redefine the existing global tokens that the table lists with `kind: "existing:…"`; the themes already set them.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`.

### Task 24: PetView.css and SprinklesChip.css use tokens; move the pin ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.css:1-13` and every source line listed for `PetView.css` in the table
- Modify: `foodbytes-app/client/src/components/pet/SprinklesChip.css:8-24`

- [x] **Step 1: Swap the PetView.css literals**

For every `tokens[].sources` entry that names `PetView.css:<n>` (excluding lines 3–8, the pin), replace that literal with `var(<token>)`, using the normalised name.

- [x] **Step 2: Move the pin**

Delete the token declarations at PetView.css:3–8 from `.pet-view`. Keep `color-scheme: light`, `color: var(--text-primary)` and `font-family` on `.pet-view`, and keep the `:root[data-theme] .pet-view :where(input…)` rule.

Re-declare the same eight lines of Default tokens on the room-art selectors: `.pip-room-svg` plus the selectors that own the `roomArt[]` sources (`room/FridgeView.css` interior rules, `room/TrophyCabinetView.css` cabinet scene, `room/PipHeadBar.css`, the Dress Pip stage in `room/WardrobeView.css`). Read each source line to get its selector. Write one rule listing those selectors, with the comment `/* MPP-45: room art keeps the Default palette in every theme (CLAUDE.md → Themes); chrome follows the theme via --pet-* tokens. */`

- [x] **Step 3: SprinklesChip**

Replace: `#fff7d6` → `var(--pet-balance-bg)`, `#e0b52c` → `var(--pet-gold-border)`, `rgba(255, 211, 77, 0.35)` → `var(--pet-gold-ring-shadow)`, `#ffd34d` → `var(--pet-gold-bg)`, `#3f2716` → `var(--pet-gold-text)`.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`.

### Task 25: Room CSS literals become tokens ✓

- Skill: react-frontend

**Files:**
- Modify: `room/CheckInActions.css`, `room/DecorPicker.css`, `room/FridgeView.css`, `room/PetRoom.css`, `room/PipHeadBar.css`, `room/ShopEarnTab.css`, `room/ShopView.css`, `room/TrophyCabinetView.css`, `room/WardrobeView.css` (only the lines listed in `tokens[].sources`)

- [x] **Step 1: Walk the table's sources**

For each token in `tokens[]` and each `sources` entry `room/<File>.css:<line>`, replace that line's matching literal with `var(<normalised token>)`. Leave every `roomArt[]` literal as it is. Work file by file, re-reading line numbers after each edit: earlier edits on the same line never shift lines, but verify that the literal at `<line>` is the table's `defaultValue` before replacing it.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`.

### Task 26: Literal audit against the room-art whitelist ✓

- Skill: none — a grep audit with no production change

**Files:**
- Modify: `.claude/contract/MPP-45-themed-pip-rooms-engine/findings.md`

- [x] **Step 1: List every colour literal left**

Run: `cd foodbytes-app\client\src\components\pet; Select-String -Path PetView.css,SprinklesChip.css,room\*.css -Pattern "#[0-9a-fA-F]{3,8}\b|rgba?\(" | ForEach-Object { "$($_.Filename):$($_.LineNumber) $($_.Line.Trim())" }`
Expected: every hit is one of:
- a `roomArt[]` source (Fridge interior, cabinet scene, head bar, Dress Pip stage, `PetRoom.css:11` surround, black shadows)
- the pin rule from Task 24

Paste the list under `## Literal audit` in `findings.md`, marking each hit `roomArt` or `pin`. Any other hit is a missed chrome literal: tokenise it with the matching table token, or stop and report if no token fits.

### Task 27: check-themes pairs with alpha flattening ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/scripts/check-themes.mjs`

- [x] **Step 1: Colour parsing and flattening**

Replace `toRgb`/`luminance`'s hex-only path with:

```js
// '#rgb' | '#rrggbb' | 'rgb(r, g, b)' | 'rgba(r, g, b, a)' → { rgb: [0-1 × 3], a }
const parseColour = (value) => {
  if (value?.startsWith('#')) {
    let h = value.slice(1)
    if (h.length === 3) h = [...h].map((c) => c + c).join('')
    return { rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255), a: 1 }
  }
  const m = value?.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/)
  return m ? { rgb: [m[1], m[2], m[3]].map((n) => Number(n) / 255), a: m[4] === undefined ? 1 : Number(m[4]) } : null
}
// Alpha-composite `top` onto an opaque `under` (sRGB, as browsers paint).
const flatten = (top, under) => ({ rgb: top.rgb.map((c, i) => c * top.a + under.rgb[i] * (1 - top.a)), a: 1 })
```

`luminance` takes a parsed colour, and `contrast(a, b)` takes two parsed opaque colours.

- [x] **Step 2: Pairs**

Add `const PET_PAIRS = [...]`, the 36 entries from `pip-room-chrome.html` `pairs[]` (lines 2529–2566), as `[fg, bg, min, over?]` with names normalised and without the leading `--` (the script adds it).

Append `...PET_PAIRS` to `PAIRS.default`, `PAIRS.cyberpunk` and `PAIRS.parchment`.

In the loop:
- Resolve `fg`, `bg` and `over`, and parse them.
- A value that is missing or unparseable (for example a gradient) is a `MISSING` failure, as today.
- If `bg.a < 1`: when `over` is given, flatten onto the parsed `over`; otherwise report `MISSING over for translucent --<bg> in <theme>`.
- If `fg.a < 1`, flatten it onto the (flattened) bg.

Leave `KNOWN_EXCEPTIONS` unchanged.

- [x] **Step 3: Run**

Run: `cd foodbytes-app\client; npm run check:themes`
Expected: the existing `WARN default|text-secondary|bg-secondary` line, then `Themes OK: 3 themes, <n> contrast pairs` with n ≈ 81 + 108. **No FAIL lines and no new exceptions.** If a Parchment or Cyberpunk pair fails, fix that theme's token value (never Default) and record the change in `findings.md` → `## Token value changes`.

### Task 28: CLAUDE.md, Themes section ✓

- Skill: none — project docs

**Files:**
- Modify: `CLAUDE.md` (Architecture → Themes)

- [x] **Step 1: Update three statements**

- Replace the bullet "**Pip's room keeps its own palette in every theme**: `components/pet/PetView.css` re-declares the Default tokens on `.pet-view`." with: "**Pip's room art keeps its own palette in every theme** (room SVG, Fridge interior, Trophy cabinet scene, head bar, Dress Pip stage: the Default tokens are re-declared on those selectors in `PetView.css`). The room UI chrome (sheets, pills, bars, chips) follows the theme through `--pet-<area>[-<tone>]-<role>` tokens in `styles/themes/*.css`. Room art is drawn by a per-line pack: `components/pet/room/roomPacks.js` → `roomPack(theme.pipLine)` (herb / dragon / robot, per-item herb fallback); names per line in `constants/petRoomLabels.js`."
- Update the `check:themes` expected output to the exact `Themes OK: 3 themes, <n> contrast pairs` printed in Task 27.
- Add `check:room` (pack coverage) to "Adding a theme": "→ if the theme brings a new `pipLine`, register its room pack in `roomPacks.js` and its names in `petRoomLabels.js` → `npm run check:room` green".

- [x] **Step 2: Confirm**

Run: `Select-String -Path CLAUDE.md -Pattern "roomPack\(theme.pipLine\)|contrast pairs"`
Expected: two or more hits, including the new count.

---

## Phase 6 — Mockup sync and the manual walk

Bring the chrome mockup in line with what shipped, then the developer verifies the live room in all three themes. There is no production code change in this phase.

### Task 29: Chrome mockup and README in step with the code ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-chrome.html`
- Modify: `foodbytes-app/mockup/README.md`

- [x] **Step 1: Rename and add rows**

Rename every token in the mockup's CSS and its `tokens[]` / `pairs[]` JSON per the plan's map.
- Add the `--pet-gold-ring-shadow` row (source `SprinklesChip.css:10`) and the SprinklesChip sources on the four reused tokens.
- Set `--pip-focus-ring`'s `parchment`/`cyberpunk` to the resolved `--focus-ink` / `--yellow` hex values.
- Copy any Task 27 value changes.

Replace the invented shop status-line copy with the live strings from `usePetShop.js` `upgradedLine` / `levelSetLine` (follow-up j), e.g. `Bed upgraded to level 2: Camp cot!`.

- [x] **Step 2: README**

In `mockup/README.md`, note on the three room rows that the lair and workshop shells, stations and styles are live from v<new version> (MPP-45), that decor is pending MPP-46/47, and that the chrome tokens use the normalised names.

- [x] **Step 3: Re-run the chrome smoke**

Run: `node .claude\contract\2026-11-16-themed-pip-rooms-mockups\chrome-smoke.mjs`
Expected: all pairs AA, and token coverage counts updated (76 tokens). If the smoke hard-codes the old names, update its expected names in the same pass and note it in `findings.md`.

### Task 30: Developer walk of /pet in three themes — PENDING (developer; ticket is Ready for Test)

- Skill: none — manual verification by the developer

**Files:**
- Modify: `.claude/contract/MPP-45-themed-pip-rooms-engine/findings.md` (`## Manual walk`)

- [ ] **Step 1: Start the stack with free mode**

Start the backend per `CLAUDE.md` → "Running the backend locally with Google login", adding `$env:PET_FREE_MODE = "true"`. Then run: `cd foodbytes-app\client; npm run dev`
Expected: Vite on `http://localhost:5173` and the backend log WARN about free mode.

- [ ] **Step 2: Walk the checklist (375 px and 1280 px), and record ✓ or a note per line**

- **Default:** the room looks as before. The Shop, picker, Fridge, cabinet, Dress Pip, edit bar, pills and check-in look as before. The sprinkles chip looks as before.
- **Parchment:** the lair shell. Level chips 1–4 for each of the 5 stations match `pip-room-dragon.html` side by side, and no art is clipped in the shop thumbnails. All 10 style chips show the dragon names and art, and day and night both work. The fridge gauge works at a planned week. Steam shows at the cooker, and the plate shows on "served". The Zs sit over the nest; place a foot-of-bed item and check the overlap. Torch flicker, embers and glint animate.
- **Cyberpunk:** the same against `pip-room-robot.html`. Rain shows on the night window.
- **Chrome in Parchment and Cyberpunk:** every sheet, pill and bar is themed and readable. Keyboard focus rings are visible. The Fridge interior, cabinet scene and head bar keep the herb palette (expected, per plan).
- **Names:** the Shop Upgrades tab, Pip's "upgraded" line, the Earn history and the style chips show the creature's names. Decor names stay herb.
- **Theme switch on `/pet`** with DevTools → Network filtered to `/api/pet`: switching theme sends **no** request, and the art and names swap instantly.
- **Low FX on, and OS reduced motion on:** all ambience stops. Shop thumbnails never animate.

Any ✗ goes back to the owning task before Final verification.

---

## Phase 7 — Final verification

No production changes beyond the version bump, only sanity checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-45 is a **Story**, so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and into `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-45: themed Pip rooms — room packs per creature (dragon lair, robot workshop shell, stations, styles, ambience) and themed room UI tokens`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references ✓

- Skill: none — grep audit

**Files:**
- Test: (read-only greps)

- [x] **Step 1: No consumer calls the herb functions directly any more**

Run: `cd foodbytes-app\client\src; Select-String -Path components\pet\room\*.jsx -Pattern "\bstationArt\(|\broomBackdrop\(|\bdecorArt\(" | Where-Object { $_.Filename -notin 'furniture.jsx','roomDecor.jsx','decorArt.jsx','herbRoom.js' }`
Expected: zero hits.

- [x] **Step 2: No theme-id branching and no debug logging**

Run: `cd foodbytes-app\client\src; Select-String -Path components\pet\**\*.js*,constants\petRoomLabels.js -Pattern "themeId ===|'parchment'|'cyberpunk'|console\.(log|debug)"`
Expected: zero hits.

- [x] **Step 3: No old token names remain**

Run: `cd foodbytes-app; Select-String -Path client\src\**\*.css,mockup\pip-room-chrome.html -Pattern "--pet-(accent|line|text-|btn-disabled|float-bg-active|hit-active|hit-hover|border-hover|wardrobe-ink|wardrobe-line|wardrobe-worn-dot|wardrobe-worn-ring)\b"`
Expected: zero hits (normalised names only).

- [x] **Step 4: No dangerouslySetInnerHTML in the packs**

Run: `cd foodbytes-app\client\src; Select-String -Path components\pet\room\packs\**\* -Pattern "dangerouslySetInnerHTML"`
Expected: zero hits.

### Task M.3: Run the full backend test suite ✓

- Skill: none — confirms no server impact

**Files:**
- Test: (backend suite, unchanged)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors (no server file changed).

### Task M.4: Production build and every client check ✓

- Skill: react-frontend

**Files:**
- Test: (read-only runs)

- [x] **Step 1: Build and the checks this contract touches**

Run: `cd foodbytes-app\client; npm run build; npm run check:room; npm run check:themes; npm run check:sprinkles; npm run check:wardrobe; npm run check:version; node scripts\room-ssr.mjs --compare ..\..\.claude\contract\MPP-45-themed-pip-rooms-engine\ssr-baseline`
Expected:
- `built in <n>s`
- `Room packs OK: herb, dragon, robot`
- `Themes OK: 3 themes, <n> contrast pairs` (plus the one known WARN)
- the sprinkles and wardrobe OK lines
- `Version OK: <new version>`
- `Room SSR OK: 8 fixtures identical`

- [x] **Step 2: File budget**

Run: `cd foodbytes-app\client\src\components\pet\room; Get-ChildItem -Recurse -Include *.jsx,*.js | Where-Object { (Get-Content $_.FullName | Measure-Object -Line).Lines -gt 400 } | Select-Object Name`
Expected: no rows.

### Task M.5: Update the PR description ✓

- Skill: none — handoff document

**Files:**
- Create: `.claude/contract/MPP-45-themed-pip-rooms-engine/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- A link to `plan.md`.
- A summary: room packs, lair/workshop, themed chrome, and the new version.
- "No migration. No server change."
- The SleepZs outcome from `findings.md`.
- Verification results (the SSR compare, `check:room`, `check:themes` count, build, `mvn test`, the manual walk).
- Follow-ups:
  - the head bar, Fridge interior and Trophy cabinet per creature (MPP-46/47 or a new ticket)
  - mockup tooling a/b/c/k
  - Default contrast misses h
- A one-line convention note: "Room art goes through `roomPack(line)`; never call `stationArt` / `decorArt` / `roomBackdrop` from a consumer".
- The suggested commit subject: `MPP-45: themed Pip rooms — room packs per creature and themed room UI`.

---

## Self-review

**Spec coverage:**
- Baseline and drift guard: Tasks 1, 2, 3.
- Engine (registry, herb fallback, line-keyed caches, context, herb pack): Tasks 5, 6, 7, 11.
- Per-line labels (Shop, picker, chips, status line, Earn history): Tasks 4, 7, 8, 17, 22.
- Per-line ink: Tasks 5, 7 (styles-tab stroke), 12–22 (`packShapes(ink)`).
- Ambience CSS and the motion stops (AC 7): Task 9, used by 14–22, walked in 30.
- Dragon lair (shell, styles, 5 × 4 stations, effects, ambience): Tasks 12–17.
- Robot workshop (with rain): Tasks 18–22.
- Decor fallback (AC 5): Task 5 (`packDecorArt`), Tasks 17/22 (`decor: {}`).
- SleepZs confirmation and fix: Tasks 3, 10, 11.
- Themed room UI (tokens, literals, pin, SprinklesChip, focus ring, pairs): Tasks 23–27.
- Follow-up (e) decision: plan.md Assumptions, documented in Task 28, walked in 30.
- Mockup sync (incl. follow-up j): Task 29.
- Docs: Task 28. Version: M.1. AC 2 byte-identical: Tasks 2, 11, 17, 22, M.4. AC 1 no refetch: Task 30. AC 8 checks: Tasks 11, M.3, M.4.

**Placeholder scan:** no `TBD`, `TODO`, "implement later" or "appropriate error handling". Port tasks cite exact mockup line ranges, and every step has a `Run:`/`Expected:` or a concrete code change. `<n>` appears only where a build time or count is computed at run time.

**Type / name consistency:** `ROOM_PACKS`, `roomPack`, `packStationArt`, `packDecorArt`, `packBackdrop`, `packStyle` and `packEffects` (Task 5) are used identically in Tasks 6, 7, 8, 10, 11 and 17/22. `RoomPackContext`/`useRoomPack` are from Task 5. `ROOM_LABELS`, `stationLabel`, `stationLevelName` and `styleLabel` are from Task 4. `HERB_ROOM.backdropById`/`stationById`/`decorById` are from Task 5 and used only in `roomPacks.js`. Pack fields (`line`, `ink`, `surround`, `styles`, `backdrop`, `stations`, `decor`, `effects`, `ambience`, `labels`) match `plan.md` → Data shapes. Effect components `FridgeGauge`/`PotSteam`/`ServedPlate`/`SleepZs` match `roomEffects.jsx`. Token names follow the plan's rename map in Tasks 23–29 and M.2.

**Phase boundary cleanliness:**
- Phase 1 adds only scripts and contract files; the build is untouched.
- Phase 2 ends with the herb-only registry, every consumer rewired, `check:room` and the SSR compare green.
- Phase 3 ends with the dragon pack registered, `check:room` covering herb and dragon, and SSR identical.
- Phase 4 does the same for robot.
- Phase 5 ends with every chrome literal tokenised and `check:themes` green, with no new exceptions.
- Phase 6 changes only the mockup, README and findings.
- Phase 7 is checks plus the version bump.
