# Tasks: Pip's daily routine — rug, cooker at meal times, asleep in bed at night

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-13

**Goal:** Pip stands at the cooker around the viewer's own meal times, sleeps in his bed (dimmed room, night window, floating "z z") from dinner + 3 h to breakfast − 1 h, and otherwise stays on the rug in his mood — decided by a pure, node-checked `pipPosition(now, mealTimes)` that re-reads every minute.

**Spec:** `plan.md` in this folder.

All commands run from `foodbytes-app\client` unless a step says otherwise (PowerShell; chain with `;`).

---

## File map

**Created:**
- `foodbytes-app/client/src/utils/pipPosition.js` — pure `pipPosition(now, mealTimes)` → `'rug' | 'cooker' | 'bed'`
- `foodbytes-app/client/src/utils/pipPosition.check.mjs` — node assertions for AC 2/3 plus boundaries, midnight, malformed input
- `foodbytes-app/client/src/components/pet/room/roomEffects.jsx` — `PotSteam`, `NightDim`, `SleepZs`

**Modified:**
- `foodbytes-app/client/src/constants/pet.js` — routine constants, `PET_SLEEP_FACE`, position labels
- `foodbytes-app/client/package.json` — `check:pip` script; version bump (Task M.1)
- `foodbytes-app/client/src/components/pet/mochiParts.jsx:16-64` — `sleep` case in `MochiFace`
- `foodbytes-app/client/src/components/pet/room/roomLayout.js` — Pip spot constants + `pipPose()`
- `foodbytes-app/client/src/components/pet/room/room.check.mjs` — `pipPose` assertions
- `foodbytes-app/client/src/components/pet/room/RoomPip.jsx` — renders a `pose` instead of a fixed rug spot
- `foodbytes-app/client/src/components/pet/room/roomDecor.jsx` — `ROOM_BACKDROP` becomes `{ day, night }`
- `foodbytes-app/client/src/components/pet/room/PetRoom.css` — steam / z animations + reduced motion
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` — `position` prop, night scene, steam, sleeping Pip between bed layers
- `foodbytes-app/client/src/contexts/PetContext.jsx:110-126` — derive and expose `position`
- `foodbytes-app/client/src/components/pet/PetView.jsx:19,54` — pass `position` to `PetRoom`
- `foodbytes-app/foodbytes-api/pom.xml` — version bump (Task M.1)
- `CHANGELOG.md` — one line (Task M.1)

**Deleted:** (none)

---

## Phase 1 — Routine rules (pure)

Constants and the position helper, pinned by a node check. Nothing imports the helper yet, so the app renders exactly as before — a safe boundary.

### Task 1: Add routine constants to `constants/pet.js` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/pet.js` (append after `PET_CLOCK_TICK_MS`)

- [x] **Step 1: Append the constants**

```js

// MPP-17: where Pip is in his room, by the viewer's own meal times (AC 2). Retune here.
export const PIP_POSITIONS = {
  RUG: 'rug',
  COOKER: 'cooker',
  BED: 'bed'
}

export const PIP_COOKER_WINDOW_MIN = 30 // at the cooker from 30 min before to 30 min after each meal time
export const PIP_BED_AFTER_DINNER_MIN = 180 // asleep from dinner time + 3 h…
export const PIP_WAKE_BEFORE_BREAKFAST_MIN = 60 // …until breakfast time − 1 h

// A face, not a mood: never add it to PET_MOODS / PET_MOOD_LABELS (mood logic is unchanged).
export const PET_SLEEP_FACE = 'sleep'

// Room aria-label wording; the rug falls back to the mood label.
export const PIP_POSITION_LABELS = {
  cooker: 'at the cooker',
  bed: 'asleep in bed'
}
```

- [x] **Step 2: Verify the existing pet check still loads the module**

Run: `npm run check:pet`
Expected: `petMood: all checks passed`, exit code 0.

### Task 2: Write `pipPosition` and its check ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/pipPosition.check.mjs`
- Create: `foodbytes-app/client/src/utils/pipPosition.js`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [x] **Step 1: Add the npm script**

In `package.json` → `scripts`, after `"check:pet": …`, add:

```json
    "check:pip": "node src/utils/pipPosition.check.mjs",
```

- [x] **Step 2: Write the failing check**

Create `src/utils/pipPosition.check.mjs`:

```js
// Run: npm run check:pip   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-17 routine rules
// (AC 2, AC 3) are pinned here. Mirrors petMood.check.mjs.
import assert from 'node:assert/strict'
import { pipPosition } from './pipPosition.js'

const TIMES = { breakfastBy: '08:00', lunchBy: '13:00', dinnerBy: '19:00', custom: false }
const at = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(2026, 9, 13, h, m)
}
const expectAt = (times, cases) => {
  for (const [hhmm, expected] of Object.entries(cases)) {
    assert.equal(pipPosition(at(hhmm), times), expected, `${hhmm} with ${JSON.stringify(times)}`)
  }
}

// AC 3, verbatim.
expectAt(TIMES, { '12:45': 'cooker', '15:00': 'rug', '23:00': 'bed', '06:30': 'bed', '07:15': 'rug' })

// AC 2 cooker window: inclusive at both ends, around every meal.
expectAt(TIMES, {
  '07:29': 'rug', '07:30': 'cooker', '08:00': 'cooker', '08:30': 'cooker', '08:31': 'rug',
  '12:30': 'cooker', '13:30': 'cooker', '13:31': 'rug',
  '18:29': 'rug', '18:30': 'cooker', '19:30': 'cooker', '19:31': 'rug'
})

// AC 2 bed window: from dinner + 3 h (inclusive) to breakfast − 1 h (exclusive), across midnight.
expectAt(TIMES, { '21:59': 'rug', '22:00': 'bed', '00:00': 'bed', '03:00': 'bed', '06:59': 'bed', '07:00': 'rug' })

// A late dinner's cooker window crosses midnight; bed still starts dinner + 3 h.
expectAt({ breakfastBy: '08:00', lunchBy: '13:00', dinnerBy: '23:45' }, {
  '23:15': 'cooker', '00:10': 'cooker', '00:15': 'cooker', '00:16': 'rug', '02:44': 'rug', '02:45': 'bed', '06:59': 'bed', '07:00': 'rug'
})

// Degenerate: dinner + 3 h is after breakfast − 1 h, so Pip never sleeps (not "asleep all day").
expectAt({ breakfastBy: '02:30', lunchBy: '12:00', dinnerBy: '23:00' }, { '01:30': 'rug', '03:30': 'rug', '15:00': 'rug' })

// Seconds on the wire are tolerated.
expectAt({ breakfastBy: '08:00:00', lunchBy: '13:00:00', dinnerBy: '19:00:00' }, { '08:10': 'cooker', '23:00': 'bed' })

// Missing or malformed meal times → rug, never a throw (PetProvider has no error boundary).
for (const bad of [
  null,
  undefined,
  {},
  { breakfastBy: '08:00', lunchBy: '13:00' },
  { ...TIMES, dinnerBy: null },
  { ...TIMES, lunchBy: 1300 },
  { ...TIMES, lunchBy: '25:00' },
  { ...TIMES, lunchBy: '13:60' },
  { ...TIMES, lunchBy: 'soon' }
]) {
  assert.equal(pipPosition(at('12:45'), bad), 'rug', JSON.stringify(bad))
}

console.log('pip position checks passed')
```

- [x] **Step 3: Run it and see it fail**

Run: `npm run check:pip`
Expected: fails with `ERR_MODULE_NOT_FOUND` for `pipPosition.js`.

- [x] **Step 4: Implement the helper**

Create `src/utils/pipPosition.js`:

```js
import {
  PET_COUNTED_MEAL_TYPES,
  PET_MEAL_TIME_KEY,
  PIP_POSITIONS,
  PIP_COOKER_WINDOW_MIN,
  PIP_BED_AFTER_DINNER_MIN,
  PIP_WAKE_BEFORE_BREAKFAST_MIN
} from '../constants/pet.js'

const MINUTES_PER_DAY = 24 * 60
const HHMM = /^(\d{1,2}):(\d{2})(?::\d{2})?$/

/**
 * MPP-17 AC 1/2: where Pip is in his room right now, from YOUR meal times (MPP-33).
 *
 * Cooker: within PIP_COOKER_WINDOW_MIN of any breakfast/lunch/dinner time (inclusive),
 * measured on a 24 h circle so a late dinner's window can cross midnight.
 * Bed: from dinner + PIP_BED_AFTER_DINNER_MIN (inclusive) to the next breakfast −
 * PIP_WAKE_BEFORE_BREAKFAST_MIN (exclusive). If that span is empty, Pip doesn't sleep.
 * Rug: otherwise, and whenever the meal times are missing or malformed.
 * Cooker wins over bed.
 *
 * @param {Date} now
 * @param {Object|null} mealTimes PetDTO.mealTimes ({ breakfastBy, lunchBy, dinnerBy })
 * @returns {'rug'|'cooker'|'bed'}
 */
export function pipPosition(now, mealTimes) {
  const times = readMealMinutes(mealTimes)
  if (!times) return PIP_POSITIONS.RUG

  const minute = now.getHours() * 60 + now.getMinutes()
  const nearMeal = Object.values(times).some(time => circularDistance(minute, time) <= PIP_COOKER_WINDOW_MIN)
  if (nearMeal) return PIP_POSITIONS.COOKER
  return isBedtime(minute, times) ? PIP_POSITIONS.BED : PIP_POSITIONS.RUG
}

// { breakfast, lunch, dinner } in minutes of the day, or null if any is unusable.
function readMealMinutes(mealTimes) {
  if (!mealTimes) return null
  const times = {}
  for (const mealType of PET_COUNTED_MEAL_TYPES) {
    const minutes = toMinutes(mealTimes[PET_MEAL_TIME_KEY[mealType]])
    if (minutes === null) return null
    times[mealType] = minutes
  }
  return times
}

// "HH:mm" or "HH:mm:ss" → minutes of the day; anything else → null.
function toMinutes(hhmm) {
  if (typeof hhmm !== 'string') return null
  const match = HHMM.exec(hhmm)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null
}

function circularDistance(a, b) {
  const diff = Math.abs(a - b) % MINUTES_PER_DAY
  return Math.min(diff, MINUTES_PER_DAY - diff)
}

// Measured in minutes since dinner, so the window can run past midnight.
function isBedtime(minute, { breakfast, dinner }) {
  const sinceDinner = (minute - dinner + MINUTES_PER_DAY) % MINUTES_PER_DAY
  const toNextBreakfast = (breakfast - dinner + MINUTES_PER_DAY) % MINUTES_PER_DAY || MINUTES_PER_DAY
  const wakeAt = toNextBreakfast - PIP_WAKE_BEFORE_BREAKFAST_MIN
  return sinceDinner >= PIP_BED_AFTER_DINNER_MIN && sinceDinner < wakeAt
}
```

- [x] **Step 5: Run the check and see it pass**

Run: `npm run check:pip`
Expected: `pip position checks passed`, exit code 0.

---

## Phase 2 — Room scene

The sleep face, the pose mapping, the night backdrop, the steam / dim / z effects and `PetRoom` wiring. `PetRoom`'s new `position` prop defaults to `rug`, and `PetView` doesn't pass it yet, so at the end of this phase `/pet` still looks exactly like MPP-16 while every new piece builds and checks green.

### Task 3: Add the `sleep` face to `MochiFace` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/mochiParts.jsx:1,16-64`

- [x] **Step 1: Import the face key and add the case**

Line 1 becomes:

```jsx
import { PET_MOODS, PET_SLEEP_FACE } from '../../constants/pet'
```

Replace the doc comment on `MochiFace` with:

```jsx
/**
 * Face for each mood, plus MPP-17's sleep face (a face, not a mood). Only the face and
 * props change — never the body (AC 9).
 */
```

Inside the `switch (mood)`, directly before `default:`, add (geometry from mockup v5 `FACES.sleep`):

```jsx
    case PET_SLEEP_FACE:
      return (
        <>
          <path d="M64 120 Q75 130 86 120" {...LINE} strokeWidth="4.5" />
          <path d="M114 120 Q125 130 136 120" {...LINE} strokeWidth="4.5" />
          <ellipse cx="100" cy="146" rx="5" ry="4" fill={MOUTH} />
          <Blush opacity={0.55} />
        </>
      )
```

`MochiProps` needs no change — its `default` already returns `null` for `sleep`.

- [x] **Step 2: Build**

Run: `npm run build`
Expected: `built in <n>s`, no errors.

### Task 4: Add Pip's spots and `pipPose` to `roomLayout.js` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/roomLayout.js`
- Test: `foodbytes-app/client/src/components/pet/room/room.check.mjs`

- [x] **Step 1: Write the failing assertions**

In `room.check.mjs`, change the `roomLayout.js` import to:

```js
import {
  ROOM_DRAW_ORDER, PIP_HOME, PIP_SCALE, PIP_COOKER_SPOT, PIP_BED_SCALE, PIP_BED_DROP, RUG, STATION_ANCHORS,
  pipPose, resolveRoomLevels
} from './roomLayout.js'
```

Insert before the final `console.log('room checks passed')`:

```js
// MPP-17: poses. Rug keeps the mood face and props; cooker is happy without props;
// bed is the sleep face at that bed level's anchor, smaller and nudged down.
assert.deepEqual(pipPose('rug', 'bored', undefined), {
  face: 'bored', showProps: true, anchor: [...PIP_HOME, 0], scale: PIP_SCALE, dropPx: 0
})
assert.deepEqual(pipPose('cooker', 'mischievous', undefined), {
  face: 'happy', showProps: false, anchor: [...PIP_COOKER_SPOT, 0], scale: PIP_SCALE, dropPx: 0
})
for (let level = 1; level <= ROOM_MAX_LEVEL; level++) {
  assert.deepEqual(pipPose('bed', 'content', { bed: level }), {
    face: 'sleep', showProps: false, anchor: STATION_ANCHORS.bedTop[level - 1], scale: PIP_BED_SCALE, dropPx: PIP_BED_DROP
  })
}
assert.deepEqual(pipPose('bed', 'content', { bed: 9 }).anchor, STATION_ANCHORS.bedTop[0]) // bad level → 1
assert.deepEqual(pipPose('garage', 'happy', undefined), pipPose('rug', 'happy', undefined)) // unknown → rug
```

- [x] **Step 2: Run it and see it fail**

Run: `npm run check:room`
Expected: `SyntaxError` — `roomLayout.js` does not provide an export named `PIP_BED_DROP` (or another of the new names).

- [x] **Step 3: Implement**

In `roomLayout.js`, replace line 1 with:

```js
import { PET_MOODS, PET_SLEEP_FACE, PIP_POSITIONS } from '../../../constants/pet.js'
import { DEFAULT_ROOM_LEVELS, ROOM_MAX_LEVEL, ROOM_MIN_LEVEL, ROOM_STATIONS } from '../../../constants/petRoom.js'
```

After `export const PIP_SCALE = 0.46`, add:

```js

// MPP-17 (mockup v5 PIP_STOVE / pipBed / zzz / night overlay).
export const PIP_COOKER_SPOT = [96, 64]
export const PIP_BED_SCALE = 0.36
export const PIP_BED_DROP = 4 // px below the bed-top point, so he sinks into the mattress
export const SLEEP_Z_LIFT = 30 // the z's float this far above the bed top
export const NIGHT_DIM_FILL = 'rgba(30,20,80,.38)'
```

Change the comment above `STATION_ANCHORS` to:

```js
// Per level (index 0 = level 1), [u, v, h]. From the mockup's FRIDGE_TOP, STOVE[].pot,
// PLATE_AT and BED[].top. MPP-17 draws cookerPot (steam) and bedTop (sleeping Pip, z's).
```

Append after `resolveRoomLevels`:

```js

/**
 * MPP-17: what RoomPip draws for a position — face, mood props or not, floor anchor
 * [u, v, h], scale and a downward nudge in px. Unknown positions get the rug pose.
 */
export function pipPose(position, mood, levels) {
  if (position === PIP_POSITIONS.COOKER) {
    return { face: PET_MOODS.HAPPY, showProps: false, anchor: [...PIP_COOKER_SPOT, 0], scale: PIP_SCALE, dropPx: 0 }
  }
  if (position === PIP_POSITIONS.BED) {
    const bedLevel = resolveRoomLevels(levels).bed
    return {
      face: PET_SLEEP_FACE,
      showProps: false,
      anchor: STATION_ANCHORS.bedTop[bedLevel - 1],
      scale: PIP_BED_SCALE,
      dropPx: PIP_BED_DROP
    }
  }
  return { face: mood, showProps: true, anchor: [...PIP_HOME, 0], scale: PIP_SCALE, dropPx: 0 }
}
```

- [x] **Step 4: Run it and see it pass**

Run: `npm run check:room`
Expected: `room checks passed`, exit code 0.

### Task 5: Make `RoomPip` render a pose ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/RoomPip.jsx` (whole file)

- [x] **Step 1: Replace the component**

Replace the file contents with:

```jsx
import { useId } from 'react'
import { MochiBody, MochiFace, MochiGradient, MochiProps } from '../mochiParts'
import { P } from './iso'
import '../MochiPet.css'

// Pip is drawn in MochiPet's 200-unit space with his feet at (100, 188); the mockup's
// pipFace() maps that point onto the pose's anchor.
const FOOT_X = 100
const FOOT_Y = 188

/**
 * MPP-16 AC 5 / MPP-17: Pip at a pose from roomLayout.pipPose — on the rug in his mood,
 * happy at the cooker, or asleep in bed. The mochi-mood-* class drives the idle
 * animation; the sleep face has no rule in MochiPet.css, so he lies still.
 */
function RoomPip({ pose }) {
  // useId keeps the gradient id unique if MochiPet is also on screen.
  const gradientId = `room-pip-fill-${useId().replace(/:/g, '')}`
  const { face, showProps, anchor, scale, dropPx } = pose
  const [x, y] = P(...anchor)
  const transform = `translate(${(x - FOOT_X * scale).toFixed(1)},${(y + dropPx - FOOT_Y * scale).toFixed(1)}) scale(${scale})`

  return (
    <g transform={transform} className={`mochi-mood-${face}`}>
      <defs>
        <MochiGradient id={gradientId} />
      </defs>
      <ellipse cx="100" cy="190" rx="66" ry="8" fill="rgba(40,20,80,.13)" />
      <g className="mochi-anim">
        <MochiBody fill={`url(#${gradientId})`} />
        <MochiFace mood={face} />
      </g>
      {showProps && <MochiProps mood={face} />}
    </g>
  )
}

export default RoomPip
```

(`PetRoom` is updated to pass `pose` in Task 8; the build stays green in between because JSX props are untyped.)

### Task 6: Day and night backdrops in `roomDecor.jsx` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/roomDecor.jsx` (whole file)

- [x] **Step 1: Replace the file**

```jsx
import { P, pts } from './iso'
import { Bill, Box, EllH, RectU } from './isoShapes'
import { RUG } from './roomLayout'

/**
 * MPP-16 AC 1 + AC 5: the angled corner (left wall, right wall, diamond floor), the
 * window on the right wall and the rug. MPP-17 AC 4: at night the glass turns dark with a
 * moon and a star. Both versions are built once as module constants, so React never
 * re-diffs the walls.
 */
const WALL_LENGTH = 193
const WALL_HEIGHT = 180
const RUG_RING = { ru: 40, rv: 30 }
const DAY_GLASS = '#cfe8ff'
const NIGHT_GLASS = '#2b2d5c'
const SKY_GLOW = '#fff6c2'

const DAY_SKY = (
  <Bill u={0} v={145} h={146}>
    <circle r="6" fill={SKY_GLOW} />
  </Bill>
)

const NIGHT_SKY = (
  <>
    <Bill u={0} v={140} h={146}>
      <path d="M0 -8 a8 8 0 1 0 6 13 a6 6 0 1 1 -6 -13z" fill={SKY_GLOW} />
    </Bill>
    <Bill u={0} v={108} h={150}>
      <circle r="1.4" fill="#fff" />
    </Bill>
  </>
)

function buildBackdrop(night) {
  return (
    <>
      <polygon
        points={pts([P(WALL_LENGTH, 0, WALL_HEIGHT), P(0, 0, WALL_HEIGHT), P(0, 0, 0), P(WALL_LENGTH, 0, 0)])}
        fill="#ece5fb"
      />
      <polygon
        points={pts([P(0, 0, WALL_HEIGHT), P(0, WALL_LENGTH, WALL_HEIGHT), P(0, WALL_LENGTH, 0), P(0, 0, 0)])}
        fill="#e3daf8"
      />
      <polygon points={pts([P(0, 0), P(WALL_LENGTH, 0), P(WALL_LENGTH, WALL_LENGTH), P(0, WALL_LENGTH)])} fill="#d6c9f0" />
      <path d="M180 0 V180" stroke="#cbbdea" strokeWidth="2" />
      <polyline points={pts([P(WALL_LENGTH, 0), P(0, 0), P(0, WALL_LENGTH)])} stroke="#c4b4e6" strokeWidth="3" fill="none" />

      <RectU up={0} v0={94} v1={162} h0={104} h1={164} fill="#ffffff" />
      <RectU up={0} v0={98} v1={158} h0={108} h1={160} fill={night ? NIGHT_GLASS : DAY_GLASS} stroke="none" />
      {night ? NIGHT_SKY : DAY_SKY}
      <RectU up={0} v0={126.5} v1={129.5} h0={108} h1={160} fill="#ffffff" stroke="none" />
      <Box u={0} v={90} du={7} dv={76} h0={100} h1={104} color="#d6c8f2" />

      <EllH cu={RUG.cu} cv={RUG.cv} h={0} ru={RUG.ru} rv={RUG.rv} fill="#f6c6d6" stroke="#e79ab5" strokeWidth="3" />
      <EllH
        cu={RUG.cu}
        cv={RUG.cv}
        h={0}
        ru={RUG_RING.ru}
        rv={RUG_RING.rv}
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeDasharray="6 5"
      />
    </>
  )
}

export const ROOM_BACKDROP = {
  day: buildBackdrop(false),
  night: buildBackdrop(true)
}
```

### Task 7: Steam, dim and z effects + their CSS ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/roomEffects.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css` (append)

- [x] **Step 1: Create `roomEffects.jsx`**

```jsx
import { Bill } from './isoShapes'
import { NIGHT_DIM_FILL, SLEEP_Z_LIFT, STATION_ANCHORS } from './roomLayout'

/**
 * MPP-17: the cooker idle scene and the night scene, from mockup v5's roomSvg().
 * Each takes the station's resolved level (1–4) so it follows upgrades.
 */

/** AC 5: steam over the pot while Pip is at the cooker. */
export function PotSteam({ level }) {
  const [u, v, h] = STATION_ANCHORS.cookerPot[level - 1]
  return (
    <Bill u={u} v={v} h={h}>
      <g className="pip-steam">
        <path d="M-4 -4 q5 -8 0 -14 M5 -6 q5 -8 0 -14" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </Bill>
  )
}

/** AC 4: the whole room dims while Pip sleeps. Percentages fill the viewBox. */
export function NightDim() {
  return <rect x="0" y="0" width="100%" height="100%" fill={NIGHT_DIM_FILL} />
}

/** AC 4: "z z" floating above the sleeping Pip. */
export function SleepZs({ level }) {
  const [u, v, h] = STATION_ANCHORS.bedTop[level - 1]
  return (
    <Bill u={u} v={v} h={h + SLEEP_Z_LIFT}>
      <g className="pip-zzz">
        <text x="10" y="0" fontSize="15" fontWeight="700" fill="#fff">z</text>
        <text x="22" y="-12" fontSize="11" fontWeight="700" fill="#fff">z</text>
      </g>
    </Bill>
  )
}
```

- [x] **Step 2: Append the animations to `PetRoom.css`**

```css

/* MPP-17: cooker steam (mockup v5 .steam) and the sleeping z's.
   AC 6: reduced motion stops both. */
.pip-steam,
.pip-zzz {
  transform-box: fill-box;
  transform-origin: center;
}

.pip-steam { animation: pip-steam 1.2s ease-in-out infinite; }
.pip-zzz { animation: pip-zzz 2.4s ease-in-out infinite; }

@keyframes pip-steam {
  0% { opacity: 0.2; transform: translateY(2px); }
  50% { opacity: 1; }
  100% { opacity: 0.2; transform: translateY(-6px); }
}

@keyframes pip-zzz {
  0%, 100% { opacity: 0.55; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-5px); }
}

@media (prefers-reduced-motion: reduce) {
  .pip-steam,
  .pip-zzz {
    animation: none !important;
  }
}
```

### Task 8: Wire position into `PetRoom` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` (whole file)

- [x] **Step 1: Replace the component**

```jsx
import { PET_MOOD_LABELS, PIP_POSITIONS, PIP_POSITION_LABELS } from '../../../constants/pet'
import { DEFAULT_ROOM_LEVELS, ROOM_STATIONS, ROOM_VIEWBOX } from '../../../constants/petRoom'
import { stationArt } from './furniture'
import { ROOM_BACKDROP } from './roomDecor'
import { NightDim, PotSteam, SleepZs } from './roomEffects'
import { ROOM_DRAW_ORDER, pipPose, resolveRoomLevels } from './roomLayout'
import RoomPip from './RoomPip'
import './PetRoom.css'

/**
 * MPP-16: Pip's angled-corner room — every station at `levels` (default all 1s), drawn
 * back-to-front so nearer objects overlap farther ones (AC 4), and the speech bubble
 * top-right (AC 5).
 * MPP-17: `position` (from pipPosition) puts Pip on the rug, at the cooker with the pot
 * steaming, or asleep in bed with the night window, the room dimmed and z's above him.
 */
function PetRoom({ name, mood, bubble, position = PIP_POSITIONS.RUG, levels = DEFAULT_ROOM_LEVELS }) {
  const resolved = resolveRoomLevels(levels)
  const pose = pipPose(position, mood, resolved)
  const asleep = position === PIP_POSITIONS.BED
  const doing = PIP_POSITION_LABELS[position] ?? PET_MOOD_LABELS[mood].toLowerCase()
  const label = `${name}'s room — ${name} is ${doing}`

  return (
    <div className="pip-room">
      <svg className="pip-room-svg" viewBox={ROOM_VIEWBOX} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
        {asleep ? ROOM_BACKDROP.night : ROOM_BACKDROP.day}
        {ROOM_DRAW_ORDER.map(station => (
          <Station key={station} station={station} level={resolved[station]} position={position} pose={pose} />
        ))}
        {asleep ? (
          <>
            <NightDim />
            <SleepZs level={resolved.bed} />
          </>
        ) : (
          <RoomPip pose={pose} />
        )}
      </svg>
      <p className="pet-bubble" aria-live="polite">{bubble}</p>
    </div>
  )
}

// Steam sits on the cooker before the fridge is drawn over it; a sleeping Pip lies
// between the bed's back and front layers (MPP-17).
function Station({ station, level, position, pose }) {
  const art = stationArt(station, level)
  if (station === ROOM_STATIONS.COOKER) {
    return (
      <>
        {art}
        {position === PIP_POSITIONS.COOKER && <PotSteam level={level} />}
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

export default PetRoom
```

- [x] **Step 2: Verify the room check and build**

Run: `npm run check:room; npm run build`
Expected: `room checks passed`, then `built in <n>s` with no errors.

---

## Phase 3 — Follow the clock

Derive the position from the minute clock `PetContext` already runs and pass it to the room. After this phase `/pet` shows the routine live.

### Task 9: Expose `position` from `PetContext` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/contexts/PetContext.jsx:8,14-27,110-126`

- [x] **Step 1: Import the helper**

After line 8 (`import { derivePetMood } from '../utils/petMood'`), add:

```jsx
import { pipPosition } from '../utils/pipPosition'
```

- [x] **Step 2: Note it in the provider doc comment**

Append to the doc comment above `PetProvider`, before ` */`:

```jsx
 *
 * MPP-17: `position` (rug / cooker / bed) is derived from the same minute clock and
 * your own meal times, so Pip moves on the minute without a second timer.
```

- [x] **Step 3: Derive and expose it**

Directly after the `moodInfo` declaration (ends `now\n  })`), add:

```jsx
  const position = pipPosition(now, pet?.mealTimes ?? null)
```

In `value`, after `moodInfo,` add:

```jsx
    position,
```

### Task 10: Pass `position` from `PetView` to `PetRoom` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx:11-19,54`

- [x] **Step 1: Read and pass the position**

Line 19 becomes:

```jsx
  const { pet, mood, moodInfo, position, error, retry, renamePet } = usePet()
```

Line 54 becomes:

```jsx
      <PetRoom name={pet.name} mood={mood} bubble={petBubble(moodInfo)} position={position} />
```

Update the component doc comment's first line to:

```jsx
 * MPP-14 AC 4 / MPP-16 / MPP-17: the Pet page — Pip in his room (rug, cooker or bed by
 * your meal times), a speech bubble, the name, a mood chip and today's meals. Guests get
 * the sign-in prompt (AC 3) if they reach /pet directly; the footer already stops them
 * with a message.
```

- [x] **Step 2: Build**

Run: `npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 4 — Final verification

The closing phase. No production changes beyond the version bump — only sanity-checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-17 is a **Story** → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`:
`<new version> — MPP-17: Pip's daily routine — at the cooker around your meal times, asleep in bed at night, on the rug otherwise`

- [x] **Step 3: Verify agreement**

Run: `npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep and size audits ✓

- Skill: react-frontend

- [x] **Step 1: No console logging in touched files**

Run: `Select-String -Path src\utils\pipPosition.js,src\components\pet\room\*.jsx,src\components\pet\mochiParts.jsx,src\contexts\PetContext.jsx,src\components\pet\PetView.jsx -Pattern "console\.(log|debug)"`
Expected: zero hits.

- [x] **Step 2: RoomPip no longer hard-codes the rug spot**

Run: `Select-String -Path src\components\pet\room\RoomPip.jsx -Pattern "PIP_HOME|PIP_SCALE"`
Expected: zero hits.

- [x] **Step 3: `sleep` stays out of the mood tables**

Run: `Select-String -Path src\constants\pet.js -Pattern "SLEEP: 'sleep'|sleep: 'Sleep"`
Expected: zero hits.

- [x] **Step 4: Line budgets**

Run: `foreach ($f in 'src\components\pet\room\PetRoom.jsx','src\components\pet\room\RoomPip.jsx','src\components\pet\room\roomDecor.jsx','src\components\pet\room\roomEffects.jsx','src\components\pet\room\roomLayout.js','src\components\pet\mochiParts.jsx','src\contexts\PetContext.jsx','src\utils\pipPosition.js') { "{0} {1}" -f (Get-Content $f | Measure-Object -Line).Lines, $f }`
Expected: every file under 200 lines.

### Task M.3: Run every check and the backend suite ✓

- Skill: none — verification only

- [x] **Step 1: Node checks**

Run: `npm run check:pip; npm run check:room; npm run check:pet; npm run check:macros`
Expected: `pip position checks passed`, `room checks passed`, `petMood: all checks passed`, `All macro traffic-light checks passed.` — exit code 0 each.

- [x] **Step 2: Backend suite (only the pom version changed)**

Run: `cd ..\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task M.4: Production build ✓

- Skill: none — verification only

- [x] **Step 1: Build the client**

Run: `npm run build`
Expected: `built in <n>s`, no errors.

### Task M.5: Manual visual check on `/pet` (developer) — pending, developer-owned

- Skill: none — developer checks it visually in the running app

- [ ] **Step 1: Walk the three positions**

With the local stack up (`npm run dev` + backend on the local `foodbytes-db`), open `http://localhost:5173/pet` at a 375 px viewport, signed in. Using the account menu's meal times (MPP-13):
- Set the meal time nearest to now to within 30 min of the current time → Pip stands in front of the cooker with the happy face and bounce, steam rises from the pot, no takeaway box or thought bubble beside him, the window is day blue.
- Set times so now is ≥ 3 h after dinner and > 1 h before breakfast (e.g. at 15:00: breakfast 09:00, lunch 10:00, dinner 11:00) → the window shows a dark sky with a moon and star, the room is dimmed, Pip lies in the bed with closed eyes between the headboard and the footboard, and "z z" floats above him; the bubble and chip still show the mood.
- Set times so neither applies → Pip is back on the rug in his mood, exactly as MPP-16.
- Leave the tab open across a window edge → Pip moves within a minute without a reload.
- DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" → steam and z's stop moving; Pip's bounce stops (MochiPet.css).
- No horizontal scroll at 375 px.

Restore your real meal times afterwards.

### Task M.6: Write the PR description ✓

- Skill: none — documentation

- [x] **Step 1: Write `pr-description.md` in this plan folder for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary of the change and the new version from Task M.1.
- No migration; frontend-only (backend changes only the pom version).
- Verification results: `check:pip`, `check:room`, `check:pet`, `check:macros`, `mvn test`, `npm run build`, and the Task M.5 manual result (or "not yet checked visually").
- New convention: `sleep` is a face key (`PET_SLEEP_FACE`), never a mood; Pip's placement goes through `roomLayout.pipPose`, which MPP-18 should extend rather than bypass.
- Suggested commit subject: `MPP-17: Pip's daily routine — cooker at meal times, asleep in bed at night`.

---

## Self-review

**Spec coverage:**
- `utils/pipPosition.js` + check + `check:pip` (AC 1, 2, 3) — Tasks 1, 2.
- Routine constants in `constants/pet.js` (ticket risk note) — Task 1.
- `sleep` face in `MochiFace` (AC 4) — Task 3.
- Night scene: window, dim, z's (AC 4) — Tasks 6, 7, 8.
- Cooker idle scene: happy face + steam (AC 5) — Tasks 4, 5, 7, 8.
- Sleeping Pip between bed layers — Tasks 4, 5, 8.
- Position on the minute via `useMinuteClock`, viewer's own meal times (AC 5, MPP-33) — Tasks 9, 10.
- Room aria-label names the position — Tasks 1, 8.
- `pipPose` pinned in `room.check.mjs` — Task 4.
- Reduced motion stops steam and z's (AC 6) — Task 7; verified in M.5.
- Version bump + CHANGELOG — Task M.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command.

**Type / name consistency:** `PIP_POSITIONS` (`rug`/`cooker`/`bed`), `PIP_COOKER_WINDOW_MIN`, `PIP_BED_AFTER_DINNER_MIN`, `PIP_WAKE_BEFORE_BREAKFAST_MIN`, `PET_SLEEP_FACE`, `PIP_POSITION_LABELS` — defined in Task 1, used in Tasks 2, 3, 4, 8. `PIP_COOKER_SPOT`, `PIP_BED_SCALE`, `PIP_BED_DROP`, `SLEEP_Z_LIFT`, `NIGHT_DIM_FILL`, `pipPose` — defined in Task 4, used in Tasks 4 (check), 7, 8. Pose shape `{ face, showProps, anchor, scale, dropPx }` — identical in Task 4 (impl + check) and Task 5 (consumer). `ROOM_BACKDROP.day` / `.night` — Task 6, consumed Task 8. `PotSteam({ level })`, `NightDim()`, `SleepZs({ level })` — Task 7, consumed Task 8. Context key `position` — Task 9, consumed Task 10. CSS classes `pip-steam` / `pip-zzz` — Task 7 (JSX + CSS).

**Phase boundary cleanliness:**
- Phase 1: only new constants and an unimported helper; app unchanged, `check:pip` and `check:pet` green.
- Phase 2: `RoomPip`, `ROOM_BACKDROP` and `PetRoom` changes land together; `position` defaults to `rug`, so `/pet` renders as before; `check:room` and build green.
- Phase 3: context and view wiring complete the feature; build green.
- Phase 4: version bump and verification only.
