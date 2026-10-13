# Tasks: Pip cooks and serves after a meal is logged as eaten

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-13

**Goal:** On `/pet`, the viewer's newest unseen eaten breakfast/lunch/dinner plays Pip's walk → cook → serve → walk-back scene once (served-only under reduced motion), remembered per user in try/catch `localStorage` with an in-memory fallback.

**Spec:** `plan.md` in this folder.

All paths below are relative to `foodbytes-app/client/` unless they start with `foodbytes-app/` or are repo-root files (`CHANGELOG.md`).

---

## File map

**Created:**
- `src/utils/cookServe.js` — pure sequence rules: `shouldServe`, `cookServeSchedule`, `cookServeBubble`
- `src/utils/pipSeenStore.js` — per-user "last seen eaten at" marker: try/catch `localStorage` + in-memory fallback
- `src/utils/cookServe.check.mjs` — node assertions for both modules above
- `src/hooks/useCookAndServe.js` — runs the timed phases, writes the marker, clears timers on unmount

**Modified:**
- `src/constants/pet.js` — `COOK_PHASES`, `COOK_PHASE_MS`, `COOK_REDUCED_MOTION_SERVED_MS`, `PIP_SEEN_EATEN_STORAGE_KEY`
- `src/utils/petMood.js` — `derivePetMood` also returns `lastLoggedAt`
- `src/utils/petMood.check.mjs` — pins `lastLoggedAt`
- `src/components/pet/room/roomLayout.js` — `COOK_WALK_OFFSET`, `cookPose()`
- `src/components/pet/room/room.check.mjs` — pins both
- `src/components/pet/room/roomEffects.jsx` — `ServedPlate`
- `src/components/pet/room/PetRoom.jsx` — `serving` prop, persistent `PipWalker`, steam/plate per phase, aria-label
- `src/components/pet/room/PetRoom.css` — walker transition, hop, reduced motion
- `src/components/pet/PetView.jsx` — calls `useCookAndServe`, passes `serving` + sequence bubble
- `package.json` — `check:cook` script; version bump
- `foodbytes-api/pom.xml` — version bump
- `CHANGELOG.md` — one line

**Deleted:** (none)

---

## Phase 1 — Pure logic and checks

Everything here is data and pure functions with node checks; nothing renders differently yet (`lastLoggedAt` is an extra field nobody reads, the new constants and helpers are unused). Safe stopping point: all `check:*` scripts and the build are green.

### Task 1: Add the cook-and-serve constants ✓

- Skill: react-frontend

**Files:**
- Modify: `src/constants/pet.js` (append after `PIP_POSITION_LABELS`)

- [x] **Step 1: Append the constants**

```js

// MPP-18: Pip cooks and serves a newly eaten meal on /pet.
export const COOK_PHASES = {
  WALKING: 'walking',
  COOKING: 'cooking',
  SERVED: 'served',
  RETURNING: 'returning'
}

// Mockup v5 logMeal(): walk 1.3 s, cook 2.2 s, plate 1.6 s, walk back. Retune here.
export const COOK_PHASE_MS = {
  walking: 1300,
  cooking: 2200,
  served: 1600,
  returning: 1300
}

// AC 5: no movement — just the served plate, held a little longer.
export const COOK_REDUCED_MOTION_SERVED_MS = 2500

// Suffixed with the user id, so two people on one browser keep their own marker (AC 6).
export const PIP_SEEN_EATEN_STORAGE_KEY = 'foodbytes.pip.lastSeenEatenAt'
```

- [x] **Step 2: Verify the module still loads**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {COOK_PHASES, COOK_PHASE_MS} from './src/constants/pet.js'; console.log(Object.values(COOK_PHASES).map(p => COOK_PHASE_MS[p]).join(','))"`
Expected: `1300,2200,1600,1300`

### Task 2: Return `lastLoggedAt` from `derivePetMood` ✓

- Skill: react-frontend

**Files:**
- Modify: `src/utils/petMood.js:10` (`NOT_READY`) and `src/utils/petMood.js:36-45` (return object)
- Test: `src/utils/petMood.check.mjs`

- [x] **Step 1: Write the failing check**

In `src/utils/petMood.check.mjs`, directly above the final `console.log(...)` line, add:

```js
// MPP-18: lastLoggedAt is the latest logged slot's eatenAt (epoch ms) over yesterday + today.
r = mood(
  day(YESTERDAY, { dinner: [entry(at(YESTERDAY, '20:30'))] }),
  day(TODAY, { breakfast: [entry(at(TODAY, '08:10'))], lunch: [entry(at(TODAY, '13:05'))] }),
  at(TODAY, '14:00')
)
assert.equal(r.lastLoggedType, 'lunch')
assert.equal(r.lastLoggedAt, at(TODAY, '13:05').getTime())
// Only yesterday logged → yesterday's time still counts.
r = mood(day(YESTERDAY, { dinner: [entry(at(YESTERDAY, '20:30'))] }), day(TODAY, {}), at(TODAY, '07:00'))
assert.equal(r.lastLoggedAt, at(YESTERDAY, '20:30').getTime())
// Eaten without an eatenAt → no usable time.
r = mood(null, day(TODAY, { lunch: [{ eaten: true, eatenAt: null }] }), at(TODAY, '14:00'))
assert.equal(r.lastLoggedAt, null)
// Nothing logged, and not ready → null.
assert.equal(mood(null, day(TODAY, { lunch: [entry()] }), at(TODAY, '14:00')).lastLoggedAt, null)
assert.equal(derivePetMood({ yesterday: null, today: null, mealTimes: null, now: at(TODAY, '09:00') }).lastLoggedAt, null)
```

- [x] **Step 2: Run it — expect failure**

Run: `cd foodbytes-app\client; npm run check:pet`
Expected: `AssertionError` on `r.lastLoggedAt` (`undefined` vs a number).

- [x] **Step 3: Implement**

In `src/utils/petMood.js`:

Replace line 10:
```js
const NOT_READY = { mood: PET_MOODS.CONTENT, dueCount: 0, todaySlots: [], lastLoggedType: null, dueMealType: null }
```
with:
```js
const NOT_READY = { mood: PET_MOODS.CONTENT, dueCount: 0, todaySlots: [], lastLoggedType: null, lastLoggedAt: null, dueMealType: null }
```

In the `derivePetMood` return object, after `lastLoggedType: latestLog?.mealType ?? null,` add:
```js
    // MPP-18: when the latest log happened (epoch ms); null when its eatenAt was missing (mapped to 0).
    lastLoggedAt: latestLog?.eatenAt || null,
```

In the JSDoc above `derivePetMood`, after the AC 7 paragraph, add:
```js
 *
 * MPP-18: also returns lastLoggedAt, the eatenAt of that latest log, so /pet can tell
 * whether Pip has already cooked it.
```

- [x] **Step 4: Run it — expect pass**

Run: `cd foodbytes-app\client; npm run check:pet`
Expected: the script's existing pass line, exit code 0.

### Task 3: Pure sequence rules in `cookServe.js` ✓

- Skill: react-frontend

**Files:**
- Create: `src/utils/cookServe.js`
- Test: `src/utils/cookServe.check.mjs` (created here; extended in Task 4)
- Modify: `package.json` (`scripts`)

- [x] **Step 1: Write the failing check**

Create `src/utils/cookServe.check.mjs`:

```js
// Run: npm run check:cook   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-18 cook-and-serve
// rules are pinned here. Mirrors pipPosition.check.mjs.
import assert from 'node:assert/strict'
import { shouldServe, cookServeSchedule, cookServeBubble } from './cookServe.js'

const T = Date.UTC(2026, 9, 13, 12, 5)

// AC 1/4: play only when the latest log is newer than the marker; never seen → play.
assert.equal(shouldServe(T, null), true)
assert.equal(shouldServe(T, T - 1), true)
assert.equal(shouldServe(T, T), false)
assert.equal(shouldServe(T, T + 60_000), false)
assert.equal(shouldServe(null, null), false)
assert.equal(shouldServe(Number.NaN, null), false)
assert.equal(shouldServe(T, Number.NaN), true) // a corrupt marker reads as never seen

// AC 1: full scene in order with the mockup's timings; AC 5: served only, no walking.
assert.deepEqual(cookServeSchedule(false), [
  { phase: 'walking', ms: 1300 },
  { phase: 'cooking', ms: 2200 },
  { phase: 'served', ms: 1600 },
  { phase: 'returning', ms: 1300 }
])
assert.deepEqual(cookServeSchedule(true), [{ phase: 'served', ms: 2500 }])

// AC 1: bubble copy; "<Meal> is served! 🍽️".
assert.equal(cookServeBubble({ phase: 'walking', mealType: 'lunch' }), 'Yay, lunch time! Let me cook 🍳')
assert.equal(cookServeBubble({ phase: 'cooking', mealType: 'dinner' }), 'Cooking your dinner…')
assert.equal(cookServeBubble({ phase: 'served', mealType: 'breakfast' }), 'Breakfast is served! 🍽️')
assert.equal(cookServeBubble({ phase: 'returning', mealType: 'lunch' }), 'Yum! 💜')
assert.equal(cookServeBubble({ phase: 'served', mealType: 'brunch' }), null)
assert.equal(cookServeBubble({ phase: 'dancing', mealType: 'lunch' }), null)

console.log('cook-and-serve checks passed')
```

In `package.json` → `scripts`, after `"check:room": ...,` add:
```json
    "check:cook": "node src/utils/cookServe.check.mjs",
```

- [x] **Step 2: Run it — expect failure**

Run: `cd foodbytes-app\client; npm run check:cook`
Expected: `ERR_MODULE_NOT_FOUND` for `./cookServe.js`.

- [x] **Step 3: Implement `src/utils/cookServe.js`**

```js
import { MEAL_TYPE_LABELS } from '../constants/mealTypes.js'
import { COOK_PHASES, COOK_PHASE_MS, COOK_REDUCED_MOTION_SERVED_MS } from '../constants/pet.js'

const FULL_SCENE = [COOK_PHASES.WALKING, COOK_PHASES.COOKING, COOK_PHASES.SERVED, COOK_PHASES.RETURNING]

/**
 * MPP-18 AC 1/2/4: play when the viewer's latest eaten meal (epoch ms) is newer than the
 * one this browser last played. Only the latest is compared, so several new meals give
 * one scene. A missing or corrupt marker counts as never seen.
 */
export function shouldServe(lastLoggedAt, lastSeenAt) {
  if (!Number.isFinite(lastLoggedAt)) return false
  return !Number.isFinite(lastSeenAt) || lastLoggedAt > lastSeenAt
}

/** AC 1/5: the phases in play order; reduced motion skips the walking and cooking. */
export function cookServeSchedule(reducedMotion) {
  if (reducedMotion) return [{ phase: COOK_PHASES.SERVED, ms: COOK_REDUCED_MOTION_SERVED_MS }]
  return FULL_SCENE.map(phase => ({ phase, ms: COOK_PHASE_MS[phase] }))
}

/** Speech-bubble copy for a phase (mockup v5 logMeal()); null for an unknown phase or meal. */
export function cookServeBubble({ phase, mealType }) {
  const label = MEAL_TYPE_LABELS[mealType]
  if (!label) return null
  switch (phase) {
    case COOK_PHASES.WALKING:
      return `Yay, ${label.toLowerCase()} time! Let me cook 🍳`
    case COOK_PHASES.COOKING:
      return `Cooking your ${label.toLowerCase()}…`
    case COOK_PHASES.SERVED:
      return `${label} is served! 🍽️`
    case COOK_PHASES.RETURNING:
      return 'Yum! 💜'
    default:
      return null
  }
}
```

- [x] **Step 4: Run it — expect pass**

Run: `cd foodbytes-app\client; npm run check:cook`
Expected: `cook-and-serve checks passed`

### Task 4: Per-user "last seen" marker in `pipSeenStore.js` ✓

- Skill: react-frontend

**Files:**
- Create: `src/utils/pipSeenStore.js`
- Test: `src/utils/cookServe.check.mjs`

- [x] **Step 1: Write the failing check**

In `src/utils/cookServe.check.mjs`, add to the imports:
```js
import { readLastSeenEatenAt, writeLastSeenEatenAt } from './pipSeenStore.js'
```
and directly above the final `console.log(...)` add:

```js
// AC 3: storage that throws → nothing breaks, and the marker lives in memory for this load.
const setStorage = (value) =>
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get: () => value })
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  get: () => { throw new Error('storage disabled') }
})
assert.equal(readLastSeenEatenAt(1), null)
writeLastSeenEatenAt(1, T)
assert.equal(readLastSeenEatenAt(1), T)
assert.equal(shouldServe(T, readLastSeenEatenAt(1)), false) // no second replay this load

// Working storage: persisted per user under the prefixed key (AC 6: users never share it).
const store = new Map()
setStorage({ getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) })
writeLastSeenEatenAt(2, T)
assert.equal(store.get('foodbytes.pip.lastSeenEatenAt.2'), String(T))
assert.equal(readLastSeenEatenAt(2), T)
assert.equal(readLastSeenEatenAt(3), null)

// A corrupt stored value reads as never seen.
store.set('foodbytes.pip.lastSeenEatenAt.4', 'yesterday')
assert.equal(readLastSeenEatenAt(4), null)
```

- [x] **Step 2: Run it — expect failure**

Run: `cd foodbytes-app\client; npm run check:cook`
Expected: `ERR_MODULE_NOT_FOUND` for `./pipSeenStore.js`.

- [x] **Step 3: Implement `src/utils/pipSeenStore.js`**

```js
import { PIP_SEEN_EATEN_STORAGE_KEY } from '../constants/pet.js'

// userId → epoch ms. Survives route changes but not a reload, so when storage is
// unavailable the scene replays at most once per page load (MPP-18 AC 3).
const memory = new Map()

const keyFor = (userId) => `${PIP_SEEN_EATEN_STORAGE_KEY}.${userId}`

/**
 * MPP-18: the eatenAt (epoch ms) of the last meal Pip cooked for this user in this
 * browser, or null. localStorage first; this page load's memory when storage is unavailable.
 */
export function readLastSeenEatenAt(userId) {
  try {
    const stored = localStorage.getItem(keyFor(userId))
    if (stored !== null) return toMs(stored)
  } catch {
    // Storage disabled or blocked: fall back to memory below.
  }
  return memory.get(userId) ?? null
}

/** Records the marker in memory always, and in localStorage when it is available. */
export function writeLastSeenEatenAt(userId, eatenAtMs) {
  memory.set(userId, eatenAtMs)
  try {
    localStorage.setItem(keyFor(userId), String(eatenAtMs))
  } catch {
    // Storage disabled or full: the memory copy above still stops a replay this load.
  }
}

function toMs(stored) {
  const ms = Number(stored)
  return Number.isFinite(ms) ? ms : null
}
```

- [x] **Step 4: Run it — expect pass**

Run: `cd foodbytes-app\client; npm run check:cook`
Expected: `cook-and-serve checks passed`

### Task 5: Walk offset and cooking pose in `roomLayout.js` ✓

- Skill: react-frontend

**Files:**
- Modify: `src/components/pet/room/roomLayout.js` (imports; after `PIP_COOKER_SPOT` at line 28; new function after `pipPose`)
- Test: `src/components/pet/room/room.check.mjs`

- [x] **Step 1: Write the failing check**

In `room.check.mjs`, add `COOK_WALK_OFFSET, cookPose` to the `./roomLayout.js` import list, and directly above the final `console.log(...)` add:

```js
// MPP-18: the walker's translate is the screen distance rug → cooker spot, and points
// up-left (the cooker is on the back-left wall); the scene pose is the happy rug pose.
const [homeX, homeY] = P(...PIP_HOME)
const [cookX, cookY] = P(...PIP_COOKER_SPOT)
near(COOK_WALK_OFFSET, [cookX - homeX, cookY - homeY])
assert.ok(COOK_WALK_OFFSET[1] < 0, 'the cooker spot is further back than the rug')
assert.deepEqual(cookPose(), { face: 'happy', showProps: false, anchor: [...PIP_HOME, 0], scale: PIP_SCALE, dropPx: 0 })
```

- [x] **Step 2: Run it — expect failure**

Run: `cd foodbytes-app\client; npm run check:room`
Expected: `SyntaxError` — `roomLayout.js` does not provide an export named `COOK_WALK_OFFSET`.

- [x] **Step 3: Implement**

In `roomLayout.js`, add to the imports:
```js
import { P } from './iso.js'
```

Directly after `export const PIP_COOKER_SPOT = [96, 64]` add:
```js

// MPP-18: screen px from Pip's rug spot to his cooker spot. The cook-and-serve walker
// translates by this, so Pip stays anchored on the rug and the CSS transition moves him.
const [HOME_X, HOME_Y] = P(...PIP_HOME)
const [COOKER_X, COOKER_Y] = P(...PIP_COOKER_SPOT)
export const COOK_WALK_OFFSET = [COOKER_X - HOME_X, COOKER_Y - HOME_Y]
```

After the `pipPose` function add:
```js

/** MPP-18: Pip during the cook-and-serve scene — anchored on the rug (the walker moves him), happy, no props. */
export function cookPose() {
  return { face: PET_MOODS.HAPPY, showProps: false, anchor: [...PIP_HOME, 0], scale: PIP_SCALE, dropPx: 0 }
}
```

- [x] **Step 4: Run it — expect pass**

Run: `cd foodbytes-app\client; npm run check:room`
Expected: `room checks passed`

- [x] **Step 5: Phase gate — all checks and the build**

Run: `cd foodbytes-app\client; npm run check:pet; npm run check:pip; npm run check:room; npm run check:cook; npm run build`
Expected: four `... passed` lines, then `built in <n>s` with no errors.

---

## Phase 2 — Room rendering

`PetRoom` learns to draw the scene from a `serving` prop that defaults to `null`, so `/pet` still looks exactly as it does today until Phase 3 wires the hook. Safe stopping point: build green, no visible change.

### Task 6: `ServedPlate` effect ✓

- Skill: react-frontend

**Files:**
- Modify: `src/components/pet/room/roomEffects.jsx` (imports; new export after `PotSteam`)

- [x] **Step 1: Add the plate**

Add to the imports:
```js
import { MOCHI_OUTLINE } from '../mochiParts'
```

Update the file JSDoc first line to: `MPP-17/18: the cooker idle scene, the served plate and the night scene, from mockup v5's roomSvg().`

After `PotSteam` add:
```jsx

/** MPP-18 AC 1: the plate on the cooker counter while "<Meal> is served!" shows (mockup v5 PLATE_AT). */
export function ServedPlate({ level }) {
  const [u, v, h] = STATION_ANCHORS.cookerPlate[level - 1]
  return (
    <Bill u={u} v={v} h={h}>
      <ellipse cx="0" cy="-2" rx="11" ry="4.5" fill="#fff" stroke={MOCHI_OUTLINE} strokeWidth="1.4" />
      <path d="M-7 -4 q7 -10 14 0z" fill="#f4a259" stroke={MOCHI_OUTLINE} strokeWidth="1.2" />
      <circle cx="-2" cy="-7" r="1.6" fill="#7cb342" />
      <circle cx="3" cy="-6" r="1.4" fill="#e63946" />
    </Bill>
  )
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: Walker transition, hop and reduced motion CSS ✓

- Skill: react-frontend

**Files:**
- Modify: `src/components/pet/room/PetRoom.css:37-45` (insert before the reduced-motion block, then extend it)

- [x] **Step 1: Add the walker rules**

Insert directly above `@media (prefers-reduced-motion: reduce) {`:

```css
/* MPP-18: the cook-and-serve walk (mockup v5 #pipg + .hop). The walker's inline
   transform changes between rug (none) and cooker; the transition is the walk. */
.pip-walker { transition: transform 1.25s ease-in-out; }
.pip-walker.is-walking .pip-hop { animation: pip-hop 0.32s ease-in-out infinite alternate; }

@keyframes pip-hop {
  to { transform: translateY(-6px); }
}

```

Replace the reduced-motion block with:

```css
/* AC 6 (MPP-17) / AC 5 (MPP-18): reduced motion stops steam, z's, the hop and the walk. */
@media (prefers-reduced-motion: reduce) {
  .pip-steam,
  .pip-zzz,
  .pip-hop {
    animation: none !important;
  }

  .pip-walker {
    transition: none !important;
  }
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 8: `PetRoom` draws the scene from a `serving` prop ✓

- Skill: react-frontend

**Files:**
- Modify: `src/components/pet/room/PetRoom.jsx` (whole file — imports, component, `Station`, new `PipWalker`, new `roomDoing`)

- [x] **Step 1: Replace the file contents**

```jsx
import { MEAL_TYPE_LABELS } from '../../../constants/mealTypes'
import { COOK_PHASES, PET_MOOD_LABELS, PIP_POSITIONS, PIP_POSITION_LABELS } from '../../../constants/pet'
import { DEFAULT_ROOM_LEVELS, ROOM_STATIONS, ROOM_VIEWBOX } from '../../../constants/petRoom'
import { stationArt } from './furniture'
import { ROOM_BACKDROP } from './roomDecor'
import { NightDim, PotSteam, ServedPlate, SleepZs } from './roomEffects'
import { COOK_WALK_OFFSET, ROOM_DRAW_ORDER, cookPose, pipPose, resolveRoomLevels } from './roomLayout'
import RoomPip from './RoomPip'
import './PetRoom.css'

/**
 * MPP-16: Pip's angled-corner room — every station at `levels` (default all 1s), drawn
 * back-to-front so nearer objects overlap farther ones (AC 4), and the speech bubble
 * top-right (AC 5).
 * MPP-17: `position` (from pipPosition) puts Pip on the rug, at the cooker with the pot
 * steaming, or asleep in bed with the night window, the room dimmed and z's above him.
 * MPP-18: `serving` ({ phase, mealType } from useCookAndServe) overrides the routine with
 * the day scene: Pip walks rug → cooker, cooks (steam), serves (plate) and walks back.
 */
function PetRoom({ name, mood, bubble, position = PIP_POSITIONS.RUG, levels = DEFAULT_ROOM_LEVELS, serving = null }) {
  const resolved = resolveRoomLevels(levels)
  const phase = serving?.phase ?? null
  const scenePosition = serving ? PIP_POSITIONS.RUG : position
  const pose = serving ? cookPose() : pipPose(position, mood, resolved)
  const asleep = scenePosition === PIP_POSITIONS.BED
  const label = `${name}'s room — ${name} is ${roomDoing(position, mood, serving)}`

  return (
    <div className="pip-room">
      <svg className="pip-room-svg" viewBox={ROOM_VIEWBOX} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
        {asleep ? ROOM_BACKDROP.night : ROOM_BACKDROP.day}
        {ROOM_DRAW_ORDER.map(station => (
          <Station key={station} station={station} level={resolved[station]} position={scenePosition} phase={phase} pose={pose} />
        ))}
        {asleep && <NightDim />}
        <PipWalker phase={phase}>{!asleep && <RoomPip pose={pose} />}</PipWalker>
        {asleep && <SleepZs level={resolved.bed} />}
      </svg>
      <p className="pet-bubble" aria-live="polite">{bubble}</p>
    </div>
  )
}

// Steam and the served plate sit on the cooker before the fridge is drawn over it; a
// sleeping Pip lies between the bed's back and front layers (MPP-17).
function Station({ station, level, position, phase, pose }) {
  const art = stationArt(station, level)
  if (station === ROOM_STATIONS.COOKER) {
    const steaming = position === PIP_POSITIONS.COOKER || phase === COOK_PHASES.COOKING
    return (
      <>
        {art}
        {steaming && <PotSteam level={level} />}
        {phase === COOK_PHASES.SERVED && <ServedPlate level={level} />}
      </>
    )
  }
  if (station !== ROOM_STATIONS.BED) return art
  return (
    <>
      {art.back}
      {position === PIP_POSITIONS.BED && <RoomPip pose={pose} />}
      {art.front}
    </>
  )
}

// MPP-18: always rendered in the same place, even while Pip sleeps, so a change of its
// transform is a CSS transition (a node mounted with the transform already set would jump).
function PipWalker({ phase, children }) {
  const atCooker = phase === COOK_PHASES.WALKING || phase === COOK_PHASES.COOKING || phase === COOK_PHASES.SERVED
  const walking = phase === COOK_PHASES.WALKING || phase === COOK_PHASES.RETURNING
  const [dx, dy] = COOK_WALK_OFFSET
  const transform = atCooker ? `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)` : 'none'
  return (
    <g className={walking ? 'pip-walker is-walking' : 'pip-walker'} style={{ transform }}>
      <g className="pip-hop">{children}</g>
    </g>
  )
}

function roomDoing(position, mood, serving) {
  if (serving) return `cooking your ${(MEAL_TYPE_LABELS[serving.mealType] ?? 'meal').toLowerCase()}`
  return PIP_POSITION_LABELS[position] ?? PET_MOOD_LABELS[mood].toLowerCase()
}

export default PetRoom
```

- [x] **Step 2: Measure and build**

Run: `cd foodbytes-app\client; (Get-Content src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines; npm run build`
Expected: a line count under 200, then `built in <n>s` with no errors.

---

## Phase 3 — The hook and the Pet page

Wires the scene in. After this phase the feature is live on `/pet`. Safe stopping point: build green and the manual check passes.

### Task 9: `useCookAndServe` hook ✓

- Skill: react-frontend

**Files:**
- Create: `src/hooks/useCookAndServe.js`

- [x] **Step 1: Create the hook**

```js
import { useEffect, useState } from 'react'
import { cookServeSchedule, shouldServe } from '../utils/cookServe'
import { readLastSeenEatenAt, writeLastSeenEatenAt } from '../utils/pipSeenStore'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * MPP-18: Pip's cook-and-serve scene on /pet. When the viewer's latest eaten
 * breakfast/lunch/dinner (moodInfo.lastLoggedAt, their own ticks only — MPP-33) is newer
 * than the one this browser last played, it marks it seen at once (AC 4: a reload never
 * replays it) and steps through the phases on timers.
 *
 * Only the latest meal is compared, so several new ones give one scene (AC 2). A meal
 * ticked mid-scene is picked up when the scene ends.
 *
 * @param {{ userId: number|null, lastLoggedAt: number|null, lastLoggedType: string|null }} input
 * @returns {{ phase: string, mealType: string } | null}
 */
export function useCookAndServe({ userId, lastLoggedAt, lastLoggedType }) {
  const [run, setRun] = useState(null)

  // Start only between scenes, so a rerender mid-scene (clock tick, refetch) can't restart it.
  useEffect(() => {
    if (run || userId == null || !lastLoggedType) return
    if (!shouldServe(lastLoggedAt, readLastSeenEatenAt(userId))) return
    writeLastSeenEatenAt(userId, lastLoggedAt)
    setRun({ mealType: lastLoggedType, steps: cookServeSchedule(prefersReducedMotion()), index: 0 })
  }, [run, userId, lastLoggedAt, lastLoggedType])

  // One timer per phase; cleared if /pet unmounts mid-scene.
  useEffect(() => {
    if (!run) return undefined
    const timerId = setTimeout(() => {
      setRun(current => (current && current.index + 1 < current.steps.length
        ? { ...current, index: current.index + 1 }
        : null))
    }, run.steps[run.index].ms)
    return () => clearTimeout(timerId)
  }, [run])

  return run ? { phase: run.steps[run.index].phase, mealType: run.mealType } : null
}

// AC 5: read once per scene; the CSS also stops movement on its own.
const prefersReducedMotion = () => window.matchMedia?.(REDUCED_MOTION_QUERY).matches === true

export default useCookAndServe
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 10: Wire the scene into `PetView` ✓

- Skill: react-frontend

**Files:**
- Modify: `src/components/pet/PetView.jsx` (imports; hook call before the early returns; bubble + `serving` prop on `PetRoom`; JSDoc)

- [x] **Step 1: Edit `PetView.jsx`**

Imports — add:
```js
import useCookAndServe from '../../hooks/useCookAndServe'
import { cookServeBubble } from '../../utils/cookServe'
```

JSDoc — change the first line to:
```js
 * MPP-14 AC 4 / MPP-16 / MPP-17 / MPP-18: the Pet page — Pip in his room (rug, cooker or bed by
```
and add before the closing `*/`:
```js
 * MPP-18: a newly eaten meal plays the cook-and-serve scene once (useCookAndServe).
```

Replace:
```js
  const { isAuthenticated } = useAuth()
  const { pet, mood, moodInfo, position, error, retry, renamePet } = usePet()
```
with:
```js
  const { user, isAuthenticated } = useAuth()
  const { pet, mood, moodInfo, position, error, retry, renamePet } = usePet()
  // Before the early returns (rules of hooks); gated on a loaded pet via userId.
  const serving = useCookAndServe({
    userId: pet ? user?.id ?? null : null,
    lastLoggedAt: moodInfo.lastLoggedAt,
    lastLoggedType: moodInfo.lastLoggedType
  })
```

Replace:
```jsx
      <PetRoom name={pet.name} mood={mood} bubble={petBubble(moodInfo)} position={position} />
```
with:
```jsx
      <PetRoom
        name={pet.name}
        mood={mood}
        bubble={(serving && cookServeBubble(serving)) ?? petBubble(moodInfo)}
        position={position}
        serving={serving}
      />
```

- [x] **Step 2: Build and confirm no debug logging**

Run: `cd foodbytes-app\client; npm run build; Select-String -Path src\hooks\useCookAndServe.js,src\utils\cookServe.js,src\utils\pipSeenStore.js,src\components\pet\PetView.jsx,src\components\pet\room\PetRoom.jsx -Pattern "console\.(log|debug)"`
Expected: `built in <n>s`, then zero hits.

- [ ] **Step 3: Manual check in the running app** — pending developer (Ready for Test)

Run: `cd foodbytes-app\client; npm run dev` (backend on :8080 against the local `foodbytes-db`, signed in with your own account).

In Chrome DevTools at 390 px wide (device toolbar):
1. Application → Local Storage → delete any `foodbytes.pip.lastSeenEatenAt.*` key. On `/mealplan`, tick today's lunch as eaten. Open `/pet`.
   Expected: Pip starts on the rug and hops to the cooker. The bubble says "Yay, lunch time! Let me cook 🍳", then "Cooking your lunch…" with the pot steaming, then "Lunch is served! 🍽️" with a plate on the cooker counter (not drawn over the fridge). He hops back, and the normal mood bubble returns. There is no horizontal scroll.
2. Reload `/pet`.
   Expected: no scene. `foodbytes.pip.lastSeenEatenAt.<your id>` holds a number.
3. Tick breakfast **and** dinner on `/mealplan`, then open `/pet`.
   Expected: one scene, naming whichever of the two you ticked last.
4. Rendering panel → "Emulate CSS media feature prefers-reduced-motion: reduce". Delete the key and open `/pet` again.
   Expected: Pip appears at the cooker with the plate and "… is served! 🍽️" and no movement, then is back in his routine pose after about 2.5 s.
5. If a linked partner account is available, have them tick a meal and open your `/pet`.
   Expected: no scene (AC 6).

Record each numbered result in `pr-description.md` (Task M.4).

---

## Phase 4 — Final verification

No production changes beyond the version bump. These are only sanity checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-18 is a **Story**, so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-18: Pip cooks and serves a newly eaten meal on /pet (once per meal, per-user seen marker, reduced-motion served state)`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: All node checks ✓

- Skill: none — verification only

- [x] **Step 1: Run every check script**

Run: `cd foodbytes-app\client; npm run check:macros; npm run check:pet; npm run check:pip; npm run check:room; npm run check:cook`
Expected: each script exits 0 and prints its pass line; no `AssertionError`.

### Task M.3: Production build and line budget ✓

- Skill: none — verification only

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [x] **Step 2: Measure the touched component and hook files**

Run: `cd foodbytes-app\client; foreach ($f in 'src\components\pet\room\PetRoom.jsx','src\components\pet\room\roomEffects.jsx','src\components\pet\PetView.jsx','src\hooks\useCookAndServe.js') { "$f " + (Get-Content $f | Measure-Object -Line).Lines }`
Expected: every file under 200 lines.

The full backend suite (`mvn test`) is not run: this contract touches no file under `foodbytes-api/` except the `pom.xml` version, and `check:version` covers that.

### Task M.4: Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-18-pip-cook-and-serve/pr-description.md`

- [x] **Step 1: Write `pr-description.md` in this plan folder for the developer to paste**

Include:
- A link to `plan.md` in this folder.
- A summary of the change, and the new version from Task M.1.
- Migrations: none. No Railway step, frontend only.
- Verification results: the five check scripts, the build, the line counts, and the five manual-check results from Task 10 Step 3 (state plainly any that were not run).
- A one-line note for future contributors: the room's `PipWalker` `<g>` must stay mounted in a fixed position, or the cook-and-serve walk loses its transition. A new Pip scene should add a phase to `COOK_PHASES`/`cookServeSchedule` rather than a second timer.
- Suggested commit subject: `MPP-18: Pip cooks and serves a newly eaten meal on /pet`

---

## Self-review

**Spec coverage:**
- `lastLoggedAt` on `moodInfo` — Task 2.
- Pure helper module + check + npm script — Tasks 1, 3.
- Per-user try/catch storage marker with in-memory fallback (AC 3) — Task 4.
- `useCookAndServe` hook with timer cleanup (AC 1, 2, 4) — Task 9.
- Room rendering: walker transition + hop, steam, plate, day scene, aria-label (AC 1, 5) — Tasks 5, 6, 7, 8.
- `PetView` wiring and bubble — Task 10.
- AC 6 partner ticks — met by the MPP-33 payload (`MealPlanEntryDTO.eaten` is the caller's) plus the per-user key. Manually checked in Task 10 Step 3.5.
- Version bump + CHANGELOG — Task M.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command. `<new version>` / `<n>` / `<your id>` are runtime values, computed or observed at apply time.

**Type / name consistency:** These names are used identically in every task that touches them: `COOK_PHASES` (`walking`/`cooking`/`served`/`returning`), `COOK_PHASE_MS`, `COOK_REDUCED_MOTION_SERVED_MS`, `PIP_SEEN_EATEN_STORAGE_KEY` (`foodbytes.pip.lastSeenEatenAt` + `.<userId>`), `lastLoggedAt`, `shouldServe`, `cookServeSchedule`, `cookServeBubble`, `readLastSeenEatenAt`, `writeLastSeenEatenAt`, `COOK_WALK_OFFSET`, `cookPose`, `ServedPlate`, `PipWalker`, `serving`, `useCookAndServe`, the CSS classes `pip-walker` / `is-walking` / `pip-hop`, and the script `check:cook`. All match `plan.md` → Data shapes.

**Phase boundary cleanliness:**
- Phase 1 adds only unused constants, pure helpers and one extra return field. All checks and the build are green.
- Phase 2 adds rendering behind `serving = null`, so `/pet` is visually unchanged and the build is green.
- Phase 3 turns the feature on. The build is green and the manual check covers ACs 1–6.
- Phase 4 changes only the version, CHANGELOG and PR notes.
