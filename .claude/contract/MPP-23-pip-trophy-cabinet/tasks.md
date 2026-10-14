# Tasks: Trophy cabinet — tap to see trophies, ribbons and streaks

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-14

**Goal:** Make the trophy cabinet in Pip's room a button that opens a full-card view of the caller's own streaks, ×N awards and firsts from `GET /api/pet/awards`. Pip's bubble announces each newly earned award once.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/client/src/constants/petAwards.js` — streak types, shelf metadata, ladder labels, firsts labels, copy, timing, storage key
- `foodbytes-app/client/src/utils/petAwards.js` — pure cabinet rules (order, lines, diff, announcement, firsts)
- `foodbytes-app/client/src/utils/petAwards.check.mjs` — node `assert` checks for the rules
- `foodbytes-app/client/src/utils/awardSeenStore.js` — per-user "last seen award counts" (memory + localStorage)
- `foodbytes-app/client/src/hooks/usePetAwards.js` — fetch, four async states, refresh, announcement queue
- `foodbytes-app/client/src/components/pet/room/awardArt.jsx` — trophy / ribbon SVG shared by room and cabinet
- `foodbytes-app/client/src/components/pet/room/StreakShelf.jsx` — one streak shelf of 7 awards
- `foodbytes-app/client/src/components/pet/room/TrophyCabinetView.jsx` — the cabinet dialog
- `foodbytes-app/client/src/components/pet/room/TrophyCabinetView.css` — cabinet styles (mockup v5 `.overlay` brown)

**Modified:**
- `foodbytes-app/client/src/services/petService.js` — `getAwards({ signal })`
- `foodbytes-app/client/package.json` — `check:awards` script; version bump
- `foodbytes-app/client/src/constants/petRoom.js:62` — `FRIDGE_HINT` → `ROOM_HINT`
- `foodbytes-app/client/src/components/pet/room/furniture.jsx:245-268` — `TrophyAt` / `RibbonAt` wrap `awardArt`
- `foodbytes-app/client/src/components/pet/room/roomLayout.js` — `CABINET_FOOTPRINT`, `cabinetHitBox`, shared `boxCorners`
- `foodbytes-app/client/src/components/pet/room/room.check.mjs` — cabinet hit-box checks
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` — `StationButton`, cabinet overlay, `cabinet` prop, `ROOM_HINT`
- `foodbytes-app/client/src/components/pet/room/PetRoom.css:62-91` — `.pip-fridge-btn` → `.pip-station-btn`
- `foodbytes-app/client/src/hooks/useHabitCheckIn.js` — `onAnswered` input, `prompt` output
- `foodbytes-app/client/src/components/pet/PetView.jsx` — `usePetAwards`, bubble merge, `cabinet` prop
- `foodbytes-app/foodbytes-api/pom.xml` — version bump
- `CHANGELOG.md` — one line

**Deleted:** (none)

---

## Phase 1 — Cabinet data and pure rules

Adds the constants, the service method, the pure rules and the seen-counts store. Nothing renders them yet, so the app behaves as before and the build stays green. The `check:awards` script pins every rule before any UI depends on it.

### Task 1: Add the cabinet constants ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/petAwards.js`

- [x] **Step 1: Write the constants module**

```js
/**
 * MPP-23: Pip's trophy cabinet (epic MPP-15). Mirrors the MPP-22 ladder
 * (AwardLadder.MILESTONES) and MPP-24 firsts (FirstKey); wording from mockup v5.
 */
export const STREAK_TYPES = {
  PLAN: 'PLAN',
  SNACK: 'SNACK',
  ALCOHOL: 'ALCOHOL'
}

// Shelf order in the cabinet and announcement order in the bubble.
export const AWARD_STREAK_ORDER = [STREAK_TYPES.PLAN, STREAK_TYPES.SNACK, STREAK_TYPES.ALCOHOL]

export const AWARD_KINDS = {
  TROPHY: 'trophy',
  RIBBON: 'ribbon'
}

// AC 2: plan wins trophies, the two habits win ribbons. `name` finishes "1 week …" in the bubble.
export const AWARD_SHELVES = {
  PLAN: { icon: '📅', title: 'Followed the plan', kind: AWARD_KINDS.TROPHY, name: 'following the plan' },
  SNACK: { icon: '🍪', title: 'No snacks', kind: AWARD_KINDS.RIBBON, name: 'snack-free' },
  ALCOHOL: { icon: '🍷', title: 'No alcohol', kind: AWARD_KINDS.RIBBON, name: 'alcohol-free' }
}

// Mirrors AwardLadder.MILESTONES on the backend — keep in sync.
export const AWARD_MILESTONES = [1, 3, 5, 7, 14, 21, 30]
export const AWARD_MILESTONE_LABELS = {
  1: '1 day',
  3: '3 days',
  5: '5 days',
  7: '1 week',
  14: '2 weeks',
  21: '3 weeks',
  30: '1 month'
}

// Mirrors FirstKey on the backend, in its order — keep in sync.
export const FIRST_KEYS = ['MAKE_TEMPLATE', 'GENERATE_SHOPPING_LIST', 'PLAN_FULL_WEEK', 'COOK_HOMEMADE_EXTRA']
export const FIRST_LABELS = {
  MAKE_TEMPLATE: 'Make a template',
  GENERATE_SHOPPING_LIST: 'Generate a shopping list',
  PLAN_FULL_WEEK: 'Plan a full week',
  COOK_HOMEMADE_EXTRA: 'Cook a homemade extra'
}
export const FIRST_EARNED_TEXT = '✓ earned'
export const FIRST_TODO_TEXT = 'to do'

export const CABINET_NOTE = "The ladder starts again after a month, so every award can be won again. ×N is how many times you've earned it."
export const CABINET_FIRSTS_TITLE = 'Firsts — things to try'
export const CABINET_LOAD_ERROR = "Couldn't load the trophy cabinet."

// AC 5: how long each "🎉 New …" line stays in Pip's bubble. Retune here.
export const AWARD_BUBBLE_MS = 6000

// Suffixed with the user id, so two people on one browser keep their own baseline.
export const AWARD_SEEN_STORAGE_KEY = 'foodbytes.pip.awardCountsSeen'
```

- [x] **Step 2: Smoke-import it**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {AWARD_MILESTONES, FIRST_KEYS} from './src/constants/petAwards.js'; console.log(AWARD_MILESTONES.length, FIRST_KEYS.length)"`
Expected: `7 4`

### Task 2: Add `petService.getAwards` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/services/petService.js`

- [x] **Step 1: Add the method after `renamePet`**

```js
  ,

  /**
   * MPP-23: your own trophy cabinet — MPP-22 streaks and MPP-24 firsts. Reading it also
   * records any award just earned (the server's ledger insert is idempotent).
   *
   * AwardStatus = { streakType: 'PLAN'|'SNACK'|'ALCOHOL', current: number, best: number,
   *                 counts: { [milestone: string]: number }, next: { milestone: number, inDays: number } }
   * FirstStatus = { key: string, earnedAt: string|null }
   *
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<{ streaks: Object[], firsts: Object[] }>} PetAwardsDTO
   */
  async getAwards({ signal } = {}) {
    const response = await api.get('/pet/awards', { signal })
    return response.data
  }
```

(Put the comma directly after `renamePet`'s closing `}`, as the object-literal separator. The block above shows it on its own line only for clarity.)

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 3: Write the pure cabinet rules and their checks ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/petAwards.js`
- Create: `foodbytes-app/client/src/utils/petAwards.check.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [x] **Step 1: Write `utils/petAwards.js`**

```js
import {
  AWARD_MILESTONES,
  AWARD_MILESTONE_LABELS,
  AWARD_SHELVES,
  AWARD_STREAK_ORDER,
  FIRST_KEYS,
  FIRST_LABELS
} from '../constants/petAwards.js'

/**
 * MPP-23: the rules and wording for Pip's trophy cabinet. Pure, so petAwards.check.mjs
 * can pin them without a browser. Shapes: see services/petService.js → getAwards.
 */

/** The server's streaks in AWARD_STREAK_ORDER; unknown types are dropped, missing ones stay absent. */
export function orderStreaks(streaks) {
  const byType = new Map((streaks ?? []).map(status => [status.streakType, status]))
  return AWARD_STREAK_ORDER.filter(type => byType.has(type)).map(type => byType.get(type))
}

/** AC 3: how many times this milestone was earned. JSON keys are strings; anything odd is 0. */
export function awardCount(status, milestone) {
  const n = Number(status?.counts?.[String(milestone)])
  return Number.isInteger(n) && n > 0 ? n : 0
}

/** AC 2: "Now 4 days · best 9". */
export function streakLine({ current, best }) {
  return `Now ${dayCount(current)} · best ${best}`
}

/** AC 2: "next: 5 days in 2 days"; null when the server sent no next. */
export function nextLine(next) {
  if (!next) return null
  const label = AWARD_MILESTONE_LABELS[next.milestone] ?? dayCount(next.milestone)
  return `next: ${label} in ${dayCount(next.inDays)}`
}

/** { PLAN: { 1: n, 3: n, … }, SNACK: {…}, ALCOHOL: {…} } — the baseline awardSeenStore keeps. */
export function awardCountsOf(streaks) {
  return Object.fromEntries(orderStreaks(streaks).map(status => [
    status.streakType,
    Object.fromEntries(AWARD_MILESTONES.map(m => [m, awardCount(status, m)]))
  ]))
}

/**
 * AC 5: per streak type, the highest milestone whose count rose since `baseline`.
 * No baseline (first visit in this browser) → nothing is new. A type missing from the
 * baseline counts as all zeros.
 * @returns {Array<{ streakType: string, milestone: number, count: number }>}
 */
export function newAwards(baseline, streaks) {
  if (!baseline) return []
  const found = []
  for (const status of orderStreaks(streaks)) {
    const seen = baseline[status.streakType] ?? {}
    const risen = AWARD_MILESTONES.filter(m => awardCount(status, m) > (Number(seen[m]) || 0))
    if (risen.length === 0) continue
    const milestone = risen[risen.length - 1]
    found.push({ streakType: status.streakType, milestone, count: awardCount(status, milestone) })
  }
  return found
}

/** AC 5: "🎉 New ribbon: 1 week snack-free (×2)!" — the ×N only from the second time. */
export function announcementText({ streakType, milestone, count }) {
  const shelf = AWARD_SHELVES[streakType]
  const times = count > 1 ? ` (×${count})` : ''
  return `🎉 New ${shelf.kind}: ${AWARD_MILESTONE_LABELS[milestone]} ${shelf.name}${times}!`
}

/** AC 4: every first in FIRST_KEYS order; one the server didn't send is not earned. */
export function firstsList(firsts) {
  const byKey = new Map((firsts ?? []).map(first => [first.key, first]))
  return FIRST_KEYS.map(key => ({ key, label: FIRST_LABELS[key], earned: byKey.get(key)?.earnedAt != null }))
}

const dayCount = (n) => `${n} day${n === 1 ? '' : 's'}`
```

- [x] **Step 2: Write `utils/petAwards.check.mjs`**

```js
// Run: npm run check:awards   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-23 cabinet rules
// (AC 2–5) are pinned here. Mirrors habitCheckIn.check.mjs.
import assert from 'node:assert/strict'
import {
  announcementText, awardCount, awardCountsOf, firstsList, newAwards, nextLine, orderStreaks, streakLine
} from './petAwards.js'

const zeros = { 1: 0, 3: 0, 5: 0, 7: 0, 14: 0, 21: 0, 30: 0 }
const status = (streakType, counts, extra = {}) => ({
  streakType, current: 0, best: 0, counts: { '1': 0, '3': 0, '5': 0, '7': 0, '14': 0, '21': 0, '30': 0, ...counts },
  next: { milestone: 1, inDays: 1 }, ...extra
})

// orderStreaks — PLAN, SNACK, ALCOHOL regardless of input order; unknown dropped
assert.deepEqual(
  orderStreaks([status('ALCOHOL', {}), status('BOGUS', {}), status('PLAN', {}), status('SNACK', {})]).map(s => s.streakType),
  ['PLAN', 'SNACK', 'ALCOHOL'])
assert.deepEqual(orderStreaks(null), [])

// awardCount — string keys from JSON; missing / negative / junk → 0
assert.equal(awardCount(status('PLAN', { '7': 2 }), 7), 2)
assert.equal(awardCount(status('PLAN', {}), 30), 0)
assert.equal(awardCount({ counts: { '3': -1 } }, 3), 0)
assert.equal(awardCount({ counts: { '3': 'x' } }, 3), 0)
assert.equal(awardCount(undefined, 1), 0)

// AC 2: streak and next lines
assert.equal(streakLine({ current: 4, best: 9 }), 'Now 4 days · best 9')
assert.equal(streakLine({ current: 1, best: 1 }), 'Now 1 day · best 1')
assert.equal(streakLine({ current: 0, best: 0 }), 'Now 0 days · best 0')
assert.equal(nextLine({ milestone: 5, inDays: 2 }), 'next: 5 days in 2 days')
assert.equal(nextLine({ milestone: 7, inDays: 1 }), 'next: 1 week in 1 day')
assert.equal(nextLine({ milestone: 30, inDays: 9 }), 'next: 1 month in 9 days')
assert.equal(nextLine(null), null)

// awardCountsOf — all 7 milestones per type, numbers
assert.deepEqual(awardCountsOf([status('SNACK', { '1': 3, '7': 1 })]), { SNACK: { ...zeros, 1: 3, 7: 1 } })

// AC 5: newAwards
const before = awardCountsOf([status('PLAN', { '1': 1 }), status('SNACK', { '1': 2, '3': 2, '5': 2, '7': 1 }), status('ALCOHOL', {})])
assert.deepEqual(newAwards(null, [status('PLAN', { '1': 5 })]), []) // first visit: silent
assert.deepEqual(newAwards(before, [status('PLAN', { '1': 1 }), status('SNACK', { '1': 2, '3': 2, '5': 2, '7': 1 })]), []) // nothing rose
assert.deepEqual( // snack 7 rose to 2 → one announcement
  newAwards(before, [status('SNACK', { '1': 2, '3': 2, '5': 2, '7': 2 })]),
  [{ streakType: 'SNACK', milestone: 7, count: 2 }])
assert.deepEqual( // several plan milestones at once → only the highest; types in shelf order
  newAwards(before, [status('ALCOHOL', { '1': 1 }), status('PLAN', { '1': 2, '3': 1, '5': 1 })]),
  [{ streakType: 'PLAN', milestone: 5, count: 1 }, { streakType: 'ALCOHOL', milestone: 1, count: 1 }])
assert.deepEqual(newAwards({ PLAN: { 1: 3 } }, [status('PLAN', { '1': 2 })]), []) // a drop is never "new"
assert.deepEqual(newAwards({}, [status('SNACK', { '1': 1 })]), [{ streakType: 'SNACK', milestone: 1, count: 1 }]) // type absent from baseline
assert.deepEqual( // a baseline read back from JSON has string keys
  newAwards(JSON.parse(JSON.stringify(before)), [status('SNACK', { '1': 2, '3': 2, '5': 2, '7': 2 })]),
  [{ streakType: 'SNACK', milestone: 7, count: 2 }])

// AC 5: announcement wording (ticket example verbatim)
assert.equal(announcementText({ streakType: 'SNACK', milestone: 7, count: 2 }), '🎉 New ribbon: 1 week snack-free (×2)!')
assert.equal(announcementText({ streakType: 'PLAN', milestone: 3, count: 1 }), '🎉 New trophy: 3 days following the plan!')
assert.equal(announcementText({ streakType: 'ALCOHOL', milestone: 30, count: 4 }), '🎉 New ribbon: 1 month alcohol-free (×4)!')

// AC 4: firsts — FirstKey order, earned from earnedAt, missing → to do
assert.deepEqual(firstsList([
  { key: 'PLAN_FULL_WEEK', earnedAt: '2026-01-07T21:33:10Z' },
  { key: 'MAKE_TEMPLATE', earnedAt: null }
]), [
  { key: 'MAKE_TEMPLATE', label: 'Make a template', earned: false },
  { key: 'GENERATE_SHOPPING_LIST', label: 'Generate a shopping list', earned: false },
  { key: 'PLAN_FULL_WEEK', label: 'Plan a full week', earned: true },
  { key: 'COOK_HOMEMADE_EXTRA', label: 'Cook a homemade extra', earned: false }
])
assert.equal(firstsList(undefined).length, 4)

console.log('award checks passed')
```

- [x] **Step 3: Register the script**

In `foodbytes-app/client/package.json` → `scripts`, after `"check:checkin"`:

```json
    "check:awards": "node src/utils/petAwards.check.mjs",
```

- [x] **Step 4: Run the checks**

Run: `cd foodbytes-app\client; npm run check:awards`
Expected: `award checks passed`

### Task 4: Add the seen-counts store ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/awardSeenStore.js`

- [x] **Step 1: Write the store (same shape as `checkInSnoozeStore.js`)**

```js
import { AWARD_SEEN_STORAGE_KEY } from '../constants/petAwards.js'

// userId → { PLAN: { 1: n, … }, SNACK: {…}, ALCOHOL: {…} }. Survives route changes but not a
// reload, so when storage is unavailable an award is still announced at most once per page load.
const memory = new Map()

const keyFor = (userId) => `${AWARD_SEEN_STORAGE_KEY}.${userId}`

/** MPP-23: the award counts this browser last saw for this user, or null (never looked / unreadable). Memory wins. */
export function readAwardCounts(userId) {
  if (memory.has(userId)) return memory.get(userId)
  try {
    const raw = localStorage.getItem(keyFor(userId))
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    // Storage blocked or corrupt JSON: treat as a first visit (silent re-baseline).
    return null
  }
}

/** Records the counts in memory always, and in localStorage when it is available. */
export function writeAwardCounts(userId, counts) {
  memory.set(userId, counts)
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(counts))
  } catch {
    // Storage disabled or full: the memory copy above still stops a repeat this load.
  }
}
```

- [x] **Step 2: Smoke-check it under node (no localStorage → memory only)**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {readAwardCounts, writeAwardCounts} from './src/utils/awardSeenStore.js'; console.log(readAwardCounts(7)); writeAwardCounts(7, {PLAN:{1:2}}); console.log(JSON.stringify(readAwardCounts(7)), readAwardCounts(8))"`
Expected: `null` then `{"PLAN":{"1":2}} null`

---

## Phase 2 — Shared award art and the cabinet hit box

Moves the trophy and ribbon art into one module, which leaves the room's pixels unchanged, and adds the cabinet's projected hit box with checks. Still nothing new renders, so the build and `check:room` stay green.

### Task 5: Extract the trophy / ribbon art ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/awardArt.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/furniture.jsx:245-268`

- [x] **Step 1: Write `awardArt.jsx`**

```jsx
import { MOCHI_OUTLINE } from '../mochiParts'
import { AWARD_KINDS } from '../../../constants/petAwards'

/**
 * MPP-23: the mockup v5 trophy() and ribbon() art, drawn at the origin (base at y 0, rising
 * to y ≈ -34 / -28). The room's cabinet (furniture.jsx) and the trophy cabinet view both
 * draw from here, so the two can't drift.
 */
const STROKE = { stroke: MOCHI_OUTLINE, strokeWidth: 2 }

export function TrophyArt() {
  return (
    <>
      <rect x="6" y="-6" width="20" height="6" fill="#8a5a2b" {...STROKE} />
      <rect x="13" y="-14" width="6" height="8" fill="#ffc83d" {...STROKE} />
      <path d="M4 -34 h24 q0 20 -12 20 q-12 0 -12 -20z" fill="#ffd34d" {...STROKE} />
      <path d="M4 -30 q-7 2 -3 9 q3 3 6 1 M28 -30 q7 2 3 9 q-3 3 -6 1" fill="none" {...STROKE} />
    </>
  )
}

export function RibbonArt() {
  return (
    <>
      <path d="M8 -10 l-4 14 l6 -3 l4 5 l2 -16 M20 -10 l4 14 l-6 -3 l-4 5 l-2 -16" fill="#e63946" {...STROKE} />
      <circle cx="14" cy="-18" r="10" fill="#4dabf7" {...STROKE} />
      <circle cx="14" cy="-18" r="5" fill="#ffd34d" />
    </>
  )
}

/** A 40×40 icon for the cabinet shelves (mockup v5 award(): trophy at 4,38; ribbon at 6,34). Decorative. */
export function AwardIcon({ kind }) {
  const trophy = kind === AWARD_KINDS.TROPHY
  return (
    <svg className="pip-award-icon" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <g transform={trophy ? 'translate(4,38)' : 'translate(6,34)'}>
        {trophy ? <TrophyArt /> : <RibbonArt />}
      </g>
    </svg>
  )
}
```

- [x] **Step 2: Make `TrophyAt` / `RibbonAt` in `furniture.jsx` use it**

Add `import { RibbonArt, TrophyArt } from './awardArt'` to the imports. Replace the bodies of the two functions at the bottom of the file:

```jsx
function TrophyAt({ u, v, h, s = 0.6 }) {
  return (
    <Bill u={u} v={v} h={h}>
      <g transform={`translate(${-16 * s},0) scale(${s})`}>
        <TrophyArt />
      </g>
    </Bill>
  )
}

function RibbonAt({ u, v, h, s = 0.6 }) {
  return (
    <Bill u={u} v={v} h={h}>
      <g transform={`translate(${-14 * s},0) scale(${s})`}>
        <RibbonArt />
      </g>
    </Bill>
  )
}
```

`ART_STROKE` is still used by other furniture; leave it.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 6: Add `cabinetHitBox` to the room layout ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/roomLayout.js`
- Test: `foodbytes-app/client/src/components/pet/room/room.check.mjs`

- [x] **Step 1: Add the footprint and a shared corner projector; refactor `fridgeHitBox` onto it**

Under `FRIDGE_GAUGE_HALF_HEIGHT`:

```js
// MPP-23: the outer box of FURNITURE.cabinet[level - 1] as [u, v, du, dv, h0, h1] (level 2's
// shelves float on the wall from h 30). Hand-copied from furniture.jsx; keep the two in step (MPP-26).
export const CABINET_FOOTPRINT = [[0, 26, 24, 78, 0, 48], [0, 30, 22, 72, 30, 88], [0, 30, 26, 66, 0, 112], [0, 26, 30, 74, 0, 134]]
```

Replace `fridgeHitBox` and add `cabinetHitBox` plus two private helpers:

```js
/**
 * MPP-19 AC 3: the fridge + gauge's bounding box in viewBox px, so PetRoom can lay a real
 * <button> over it. Projects the level's footprint corners through P().
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function fridgeHitBox(level) {
  const index = resolveRoomLevels({ fridge: level }).fridge - 1
  const [u, v, du, dv, h] = FRIDGE_FOOTPRINT[index]
  const [gu, gv, gh] = STATION_ANCHORS.fridgeTop[index]
  const gaugeTop = P(gu, gv, gh + FRIDGE_GAUGE_LIFT)[1] - FRIDGE_GAUGE_HALF_HEIGHT
  return boundsOf(boxCorners(u, v, du, dv, 0, h), [gaugeTop])
}

/** MPP-23 AC 1: the cabinet's bounding box in viewBox px, for the cabinet button. */
export function cabinetHitBox(level) {
  const index = resolveRoomLevels({ cabinet: level }).cabinet - 1
  return boundsOf(boxCorners(...CABINET_FOOTPRINT[index]))
}

// The 8 projected corners of a floor box from h0 to h1.
function boxCorners(u, v, du, dv, h0, h1) {
  const corners = []
  for (const cu of [u, u + du]) {
    for (const cv of [v, v + dv]) {
      for (const ch of [h0, h1]) corners.push(P(cu, cv, ch))
    }
  }
  return corners
}

// Smallest rectangle around the points (and any extra y values).
function boundsOf(points, extraYs = []) {
  const xs = points.map(([x]) => x)
  const ys = [...points.map(([, y]) => y), ...extraYs]
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}
```

- [x] **Step 2: Pin it in `room.check.mjs`**

Add `CABINET_FOOTPRINT, cabinetHitBox` to the `./roomLayout.js` import. Before the final `console.log`:

```js
// MPP-23 AC 1: the cabinet button covers the cabinet at every level, inside the viewBox,
// and never overlaps the fridge button (they are on opposite walls).
for (let level = 1; level <= ROOM_MAX_LEVEL; level++) {
  const box = cabinetHitBox(level)
  assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= 360 && box.y + box.height <= 330, `level ${level} cabinet box leaves the viewBox`)
  const inside = ([x, y]) => x >= box.x - 1e-9 && x <= box.x + box.width + 1e-9 && y >= box.y - 1e-9 && y <= box.y + box.height + 1e-9
  const [u, v, du, dv, h0, h1] = CABINET_FOOTPRINT[level - 1]
  assert.ok(inside(P(u + du / 2, v + dv / 2, h0)), `level ${level} cabinet base centre is outside the box`)
  assert.ok(inside(P(u + du / 2, v + dv / 2, h1)), `level ${level} cabinet top centre is outside the box`)
  const fridge = fridgeHitBox(level)
  assert.ok(fridge.x + fridge.width <= box.x || box.x + box.width <= fridge.x, `level ${level} cabinet and fridge buttons overlap`)
}
assert.ok(cabinetHitBox(4).height > cabinetHitBox(1).height, 'a bigger cabinet gets a bigger button')
assert.deepEqual(cabinetHitBox(9), cabinetHitBox(1)) // an invalid level falls back to level 1
```

- [x] **Step 3: Run the room checks (fridge assertions must still pass after the refactor)**

Run: `cd foodbytes-app\client; npm run check:room`
Expected: `room checks passed`

---

## Phase 3 — Awards hook and check-in hand-off

Adds `usePetAwards` and the two additive changes to `useHabitCheckIn`. Nothing calls the new hook until Phase 4. `PetView` keeps reading `checkIn.text`, which is unchanged, so behaviour is identical and the build stays green.

### Task 7: Write `usePetAwards` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/usePetAwards.js`

- [x] **Step 1: Write the hook**

```js
import { useEffect, useState } from 'react'
import petService from '../services/petService'
import { AWARD_BUBBLE_MS, CABINET_LOAD_ERROR } from '../constants/petAwards'
import { announcementText, awardCountsOf, newAwards } from '../utils/petAwards'
import { readAwardCounts, writeAwardCounts } from '../utils/awardSeenStore'

/**
 * MPP-23: your own trophy cabinet (GET /api/pet/awards) and Pip's "🎉 New …" lines.
 *
 * Fetches on mount / user change, local date rollover, the tab becoming visible, and
 * refresh() (called after a check-in answer). Reading the endpoint is what records a
 * newly earned award server-side, so after every load the counts are compared with what
 * this browser last saw (awardSeenStore): each streak type that gained an award queues one
 * line for its highest new milestone, shown for AWARD_BUBBLE_MS each. The baseline is
 * written before the line is queued, so a reload never repeats it. No baseline yet (first
 * visit here) → saved quietly, nothing announced.
 *
 * A failed refetch keeps the last good cabinet and announces nothing.
 *
 * @param {{ userId: number|null, todayISO: string }} input
 * @returns {{
 *   cabinet: { data: { streaks: Object[], firsts: Object[] }|null, loading: boolean, error: string|null, retry: () => void },
 *   announcement: string|null,
 *   refresh: () => void
 * }}
 */
export function usePetAwards({ userId, todayISO }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [queue, setQueue] = useState([])
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = () => setReloadKey(key => key + 1)

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') setReloadKey(key => key + 1)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  // Another person signing in on this browser never sees the last person's cabinet or lines.
  useEffect(() => {
    setData(null)
    setQueue([])
  }, [userId])

  useEffect(() => {
    if (userId == null) {
      setLoading(false)
      setError(null)
      return undefined
    }
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    petService.getAwards({ signal: controller.signal })
      .then(cabinet => {
        const fresh = newAwards(readAwardCounts(userId), cabinet.streaks)
        writeAwardCounts(userId, awardCountsOf(cabinet.streaks))
        setData(cabinet)
        if (fresh.length) setQueue(current => [...current, ...fresh.map(announcementText)])
      })
      .catch(err => {
        if (!isCancelled(err)) setError(err.response?.data?.error || CABINET_LOAD_ERROR)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [userId, todayISO, reloadKey])

  // One line at a time; each new queue (shift or append) restarts the head's timer.
  useEffect(() => {
    if (queue.length === 0) return undefined
    const timerId = setTimeout(() => setQueue(current => current.slice(1)), AWARD_BUBBLE_MS)
    return () => clearTimeout(timerId)
  }, [queue])

  return {
    cabinet: { data, loading, error, retry: refresh },
    announcement: queue[0] ?? null,
    refresh
  }
}

// Axios rejects an aborted request with code ERR_CANCELED; that is not an error to show.
const isCancelled = (err) => err?.code === 'ERR_CANCELED'

export default usePetAwards
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 8: `useHabitCheckIn` — `onAnswered` in, `prompt` out ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/hooks/useHabitCheckIn.js`

- [x] **Step 1: Accept `onAnswered` and document it**

Change the signature to `export function useHabitCheckIn({ userId, todayISO, onAnswered })`. In the JSDoc, replace the `@param` / `@returns` lines with:

```js
 * MPP-23: `onAnswered` (optional) runs once after each answer the server saved, so the
 * trophy cabinet can refetch and announce an award that answer earned. Not on a failed
 * answer, not on "Not now". `prompt` is the open question alone (no reaction), so the
 * bubble can swap the reaction for an award line.
 *
 * @param {{ userId: number|null, todayISO: string, onAnswered?: () => void }} input
 * @returns {{ text: string, prompt: string|null, actions: Object|null } | null} null when Pip has nothing to ask or say
```

- [x] **Step 2: Call it after a saved answer**

In `submit`, inside `try`, after the `setState(current => { … })` call that applies the returned status (and after the `if (!mountedRef.current) return` guard), add:

```js
      onAnswered?.()
```

- [x] **Step 3: Return `prompt`**

Change the last line from `return { text, actions: actions || null }` to:

```js
  return { text, prompt, actions: actions || null }
```

- [x] **Step 4: Build and re-run the check-in checks (untouched rules must still pass)**

Run: `cd foodbytes-app\client; npm run build; npm run check:checkin`
Expected: `built in <n>s` with no errors, then the check script's pass line.

---

## Phase 4 — Cabinet UI and wiring

Builds the shelves and the dialog, then wires the button, overlay, hint, CSS rename, hook and bubble merge into `PetRoom` and `PetView`. The phase ends with the feature live on /pet, the build green and the manual check done.

### Task 9: `StreakShelf` — one shelf of seven awards ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/StreakShelf.jsx`

- [x] **Step 1: Write the component**

```jsx
import { AWARD_MILESTONES, AWARD_MILESTONE_LABELS, AWARD_SHELVES } from '../../../constants/petAwards'
import { awardCount, nextLine, streakLine } from '../../../utils/petAwards'
import { AwardIcon } from './awardArt'

/**
 * MPP-23 AC 2/3: one cabinet shelf (mockup v5 cabinetHtml → shelf()) — the streak line,
 * the next milestone, and the 7 ladder awards: a gold ×N badge when earned, greyed at 0.
 */
function StreakShelf({ status }) {
  const shelf = AWARD_SHELVES[status.streakType]
  const headingId = `pip-shelf-${status.streakType.toLowerCase()}`
  const next = nextLine(status.next)
  return (
    <section className="pip-cabinet-shelf" aria-labelledby={headingId}>
      <h4 id={headingId}>
        <span aria-hidden="true">{shelf.icon}</span> {shelf.title}
      </h4>
      <p className="pip-cabinet-streak">
        <span>{streakLine(status)}</span>
        {next && <span>{next}</span>}
      </p>
      <ul className="pip-cabinet-awards">
        {AWARD_MILESTONES.map(milestone => {
          const count = awardCount(status, milestone)
          const label = AWARD_MILESTONE_LABELS[milestone]
          return (
            <li
              key={milestone}
              className={count ? 'pip-award' : 'pip-award is-locked'}
              aria-label={count ? `${label}, earned ${count} time${count === 1 ? '' : 's'}` : `${label}, not earned yet`}
            >
              <AwardIcon kind={shelf.kind} />
              <span aria-hidden="true">{label}</span>
              {count > 0 && <span className="pip-award-times" aria-hidden="true">×{count}</span>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default StreakShelf
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 10: `TrophyCabinetView` and its CSS ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/TrophyCabinetView.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/TrophyCabinetView.css`

- [x] **Step 1: Write the dialog (mirrors `FridgeView`)**

```jsx
import { CABINET_FIRSTS_TITLE, CABINET_NOTE, FIRST_EARNED_TEXT, FIRST_TODO_TEXT } from '../../../constants/petAwards'
import { firstsList, orderStreaks } from '../../../utils/petAwards'
import StreakShelf from './StreakShelf'
import './TrophyCabinetView.css'

/**
 * MPP-23 AC 1–4: the trophy cabinet, full-card inside Pip's room (mockup v5 cabinetHtml):
 * three streak shelves, the "ladder starts again" note and the firsts list. Loading and
 * error get their own states; a cabinet with nothing earned is a loaded cabinet (all greyed),
 * not an empty state. Focus handling lives in useRoomOverlay.
 */
function TrophyCabinetView({ name, cabinet, titleId, panelRef, onClose }) {
  return (
    <div ref={panelRef} className="pip-cabinet-view" role="dialog" aria-modal="true" tabIndex={-1} aria-labelledby={titleId}>
      <div className="pip-cabinet-head">
        <h3 id={titleId}>🏆 {name}&apos;s trophy cabinet</h3>
        <button type="button" className="pip-cabinet-btn-text" onClick={onClose}>
          Back to room
        </button>
      </div>
      <CabinetBody cabinet={cabinet} panelRef={panelRef} />
    </div>
  )
}

function CabinetBody({ cabinet, panelRef }) {
  if (cabinet?.data) return <Shelves data={cabinet.data} />
  if (cabinet?.error) {
    return (
      <div className="pip-cabinet-state" role="alert">
        <p>{cabinet.error}</p>
        <button
          type="button"
          className="pip-cabinet-btn-text"
          onClick={() => {
            // The button unmounts into the spinner; keep focus inside the dialog.
            panelRef.current?.focus()
            cabinet.retry()
          }}
        >
          Try again
        </button>
      </div>
    )
  }
  return (
    <div className="pip-cabinet-state" aria-busy="true">
      <div className="loading-spinner" />
    </div>
  )
}

function Shelves({ data }) {
  return (
    <>
      {orderStreaks(data.streaks).map(status => <StreakShelf key={status.streakType} status={status} />)}
      <p className="pip-cabinet-note">{CABINET_NOTE}</p>
      <section className="pip-cabinet-shelf" aria-labelledby="pip-shelf-firsts">
        <h4 id="pip-shelf-firsts">{CABINET_FIRSTS_TITLE}</h4>
        <ul className="pip-cabinet-firsts">
          {firstsList(data.firsts).map(first => (
            <li key={first.key} className={first.earned ? 'pip-cabinet-first is-earned' : 'pip-cabinet-first'}>
              <span>{first.label}</span>
              <span>{first.earned ? FIRST_EARNED_TEXT : FIRST_TODO_TEXT}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default TrophyCabinetView
```

- [x] **Step 2: Write the CSS (mockup v5 cabinet overlay; mobile-first, 44 px targets)**

```css
/* MPP-23: Pip's trophy cabinet (mockup v5 .overlay / .shelf / .award / .times / .streak / .todo / .cnote).
   Fills the room card and scrolls inside it, like the fridge (no page scroll at 320 px). */

.pip-cabinet-view {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: linear-gradient(#5b3a22, #3f2716);
  color: #fff7e8;
}

.pip-cabinet-view:focus { outline: none; }

.pip-cabinet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pip-cabinet-head h3 {
  margin: 0;
  font-size: 1rem;
  overflow-wrap: anywhere;
}

.pip-cabinet-btn-text {
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.pip-cabinet-btn-text:active { background: rgba(255, 255, 255, 0.3); }

@media (hover: hover) {
  .pip-cabinet-btn-text:hover { background: rgba(255, 255, 255, 0.22); }
}

.pip-cabinet-btn-text:focus-visible {
  outline: 3px solid #ffd34d;
  outline-offset: 2px;
}

.pip-cabinet-shelf {
  padding: 8px;
  border-bottom: 5px solid #a0703f;
  border-radius: 8px 8px 2px 2px;
  background: rgba(255, 255, 255, 0.07);
}

.pip-cabinet-shelf h4 {
  margin: 0 0 6px;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #f3d9a8;
}

.pip-cabinet-streak {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2px 8px;
  margin: 0 0 6px;
  padding: 7px 9px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.78rem;
}

.pip-cabinet-awards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pip-award {
  position: relative;
  text-align: center;
  font-size: 0.6rem;
  line-height: 1.2;
}

.pip-award.is-locked { opacity: 0.33; }

.pip-award-icon {
  display: block;
  width: 38px;
  height: 38px;
  margin: 0 auto 2px;
}

.pip-award-times {
  position: absolute;
  top: -2px;
  right: 0;
  padding: 1px 5px;
  border-radius: 999px;
  background: #ffd34d;
  color: #3f2716;
  font-size: 0.6rem;
  font-weight: 800;
}

.pip-cabinet-note {
  margin: 0;
  font-size: 0.7rem;
  line-height: 1.35;
  color: #f3d9a8;
}

.pip-cabinet-firsts {
  margin: 0;
  padding: 0;
  list-style: none;
}

.pip-cabinet-first {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 2px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.15);
  font-size: 0.76rem;
}

.pip-cabinet-first span:last-child {
  flex-shrink: 0;
  color: #f3d9a8;
}

.pip-cabinet-first.is-earned span:last-child { color: #ffd34d; }

.pip-cabinet-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 11: Wire the cabinet into `PetRoom` (button, overlay, hint, CSS rename) ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/petRoom.js:62`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css:62-91`
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx`

- [x] **Step 1: Rename the hint constant**

In `constants/petRoom.js`, replace `export const FRIDGE_HINT = 'Tap the fridge 🧊'` with:

```js
export const ROOM_HINT = 'Tap the fridge 🧊 or cabinet 🏆' // MPP-23: mockup v5 .hint
```

- [x] **Step 2: Make the hit-box button class generic**

In `PetRoom.css`, rename every `.pip-fridge-btn` selector (base, `:active`, `:hover`, `:focus-visible`) to `.pip-station-btn`. Change the comment above it to:

```css
/* MPP-19 / MPP-23: a station button over its art (fridgeHitBox / cabinetHitBox, % of the
   viewBox); at least 44 px however small the card gets. */
```

Leave `.pip-fridge-btn-text` in `FridgeView.css` as it is. It is a different class.

- [x] **Step 3: Update `PetRoom.jsx`**

Imports: replace `FRIDGE_HINT` with `ROOM_HINT`; add `cabinetHitBox` to the `./roomLayout` import; add `import TrophyCabinetView from './TrophyCabinetView'`.

Doc comment: append ` * MPP-23: the cabinet — a real button over the cabinet art that opens TrophyCabinetView with \`cabinet\` ({ data, loading, error, retry } from usePetAwards).`

Signature: add `cabinet = null` after `fridge = null`.

Replace the overlay setup lines (`const fridgeOverlay = …` through `const behind = …`) with:

```jsx
  const fridgeOverlay = useRoomOverlay()
  const cabinetOverlay = useRoomOverlay()
  const overlayId = useId().replace(/:/g, '')
  const fridgeTitleId = `pip-fridge-title-${overlayId}`
  const cabinetTitleId = `pip-cabinet-title-${overlayId}`
  const fridgeFill = fridge?.fill ?? null
  // MPP-19 / MPP-23: the room behind an open overlay is out of the tab order and the a11y tree.
  const behind = fridgeOverlay.isOpen || cabinetOverlay.isOpen ? { inert: '', 'aria-hidden': true } : {}
```

Replace the `<FridgeButton … />` line and the hint line with:

```jsx
        <StationButton
          box={fridgeHitBox(resolved.fridge)}
          label={fridgeLabel(name, fridgeFill)}
          buttonRef={fridgeOverlay.triggerRef}
          onOpen={fridgeOverlay.open}
        />
        <StationButton
          box={cabinetHitBox(resolved.cabinet)}
          label={`Open ${name}'s trophy cabinet`}
          buttonRef={cabinetOverlay.triggerRef}
          onOpen={cabinetOverlay.open}
        />
        <p className="pip-room-hint" aria-hidden="true">{ROOM_HINT}</p>
```

After the `{fridgeOverlay.isOpen && (…)}` block, add:

```jsx
      {cabinetOverlay.isOpen && (
        <TrophyCabinetView name={name} cabinet={cabinet} titleId={cabinetTitleId} panelRef={cabinetOverlay.panelRef} onClose={cabinetOverlay.close} />
      )}
```

Replace the whole `FridgeButton` function (with its comment) with:

```jsx
// MPP-19 AC 3 / MPP-23 AC 1: a real button laid over a station's art. The SVG is role="img", so it can't hold one.
function StationButton({ box, label, buttonRef, onOpen }) {
  const { width: viewWidth, height: viewHeight } = ROOM_VIEWBOX_SIZE
  const style = {
    left: percentOf(box.x, viewWidth),
    top: percentOf(box.y, viewHeight),
    width: percentOf(box.width, viewWidth),
    height: percentOf(box.height, viewHeight)
  }
  return (
    <button
      ref={buttonRef}
      type="button"
      className="pip-station-btn"
      style={style}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={onOpen}
    />
  )
}

const fridgeLabel = (name, fill) =>
  fill && fill.planned > 0 ? `Open ${name}'s fridge, ${fill.pct}% full` : `Open ${name}'s fridge`
```

- [x] **Step 4: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines`
Expected: `built in <n>s` with no errors, and a line count under 400 (expected about 195).

### Task 12: Wire `usePetAwards` and the award bubble into `PetView` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx`

- [x] **Step 1: Call the hook and hand `refresh` to the check-in**

Add `import usePetAwards from '../../hooks/usePetAwards'`. Replace the `const checkIn = useHabitCheckIn(…)` line with:

```jsx
  const petUserId = pet ? user?.id ?? null : null
  const awards = usePetAwards({ userId: petUserId, todayISO })
  const checkIn = useHabitCheckIn({ userId: petUserId, todayISO, onAnswered: awards.refresh })
```

…and change `useCookAndServe`'s `userId:` argument to `petUserId` so the gate is written once (the new lines go above the `useCookAndServe` call).

- [x] **Step 2: Merge the award line into the bubble**

Replace the comment and the `asking` / `bubble` lines with:

```jsx
  // Cook scene > check-in > new award > fridge-low > mood. A new award replaces the check-in's
  // reaction but keeps its open question (MPP-23 AC 5).
  const asking = serving ? null : checkIn
  const award = serving ? null : awards.announcement
  const checkInLine = asking && award ? [award, asking.prompt].filter(Boolean).join(' ') : asking?.text
  const bubble = (serving && cookServeBubble(serving)) ?? checkInLine ?? award ?? fridgeBubble(fridge.fill, position) ?? petBubble(moodInfo)
```

- [x] **Step 3: Pass the cabinet to the room**

Add `cabinet={awards.cabinet}` to `<PetRoom … />`, after `fridge={fridge}`. Add a doc-comment line: ` * MPP-23: the trophy cabinet (usePetAwards) and Pip's "🎉 New …" line for a newly earned award.`

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [ ] **Step 5: Manual check on /pet (developer)** — pending: developer play-test (Ready for Test)

Run the backend locally against `foodbytes-db` (CLAUDE.md → "Running the backend locally with Google login") and `npm run dev`, then sign in and open `http://localhost:5173/pet`:

1. At 320 px wide (DevTools device toolbar) and on desktop: the hint reads "Tap the fridge 🧊 or cabinet 🏆". Tap the cabinet and the brown overlay fills the room card with "🏆 {name}'s trophy cabinet" and "Back to room". There's no horizontal page scroll.
2. Three shelves show, in the order 📅 Followed the plan, 🍪 No snacks, 🍷 No alcohol. Each has "Now N days · best M" and "next: … in X days". Each has 7 awards: earned ones are full colour with a gold ×N, unearned ones are greyed. The note and the four firsts rows ("✓ earned" / "to do") follow.
3. Keyboard: Tab reaches the cabinet button. Enter opens the cabinet and focus lands on "Back to room". Tab stays inside the dialog. Escape closes it and focus returns to the cabinet button. The fridge still opens and closes the same way.
4. Announcement: in DevTools → Application → Local Storage, edit `foodbytes.pip.awardCountsSeen.<yourId>` to lower one count (e.g. `"SNACK":{"1":0,…}`) and reload. Pip's bubble shows "🎉 New ribbon: 1 day snack-free …!" for about 6 s, and a second reload shows nothing.
5. Error state: stop the backend, open the cabinet after a fresh load. You should see "Couldn't load the trophy cabinet." and a "Try again" button. Restart the backend, tap Try again, and the shelves appear.

Expected: all five observations hold. Record any that don't in `pr-description.md`.

---

## Phase 5 — Final verification

The closing phase. No production changes beyond the version bump — only sanity-checks that the cumulative work is clean.

### Task 13 (M.1): Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-23 is a **Story**, so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and into `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-23: Trophy cabinet — tap the cabinet for plan / snack / alcohol shelves (now · best · next, ×N awards) and the firsts list; Pip's bubble announces newly earned awards`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 14 (M.2): Grep for stale references ✓

- Skill: none — verification only

- [x] **Step 1: No old hint constant or fridge-only button class remains**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.css | Select-String -Pattern "FRIDGE_HINT|FridgeButton|pip-fridge-btn\b(?!-text)"`
Expected: zero hits.

- [x] **Step 2: No debug logging added**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)" | Where-Object { $_.Path -notmatch '\.check\.mjs$' }`
Expected: no hits in any file this contract created or modified (the existing baseline in `services/api.js`, `hooks/useWakeLock.js` and `mealplan/MealPlanEntry.jsx` is unchanged).

- [x] **Step 3: All pure checks pass**

Run: `cd foodbytes-app\client; npm run check:awards; npm run check:room; npm run check:checkin; npm run check:fridge; npm run check:cook`
Expected: each prints its pass line, no assertion errors.

- [x] **Step 4: New and grown files are within the size budget**

Run: `cd foodbytes-app\client\src; foreach ($f in 'components\pet\room\PetRoom.jsx','components\pet\room\TrophyCabinetView.jsx','components\pet\room\StreakShelf.jsx','hooks\usePetAwards.js','hooks\useHabitCheckIn.js','components\pet\PetView.jsx','utils\petAwards.js') { "$f $((Get-Content $f | Measure-Object -Line).Lines)" }`
Expected: every file under 400 lines.

### Task 15 (M.3): Run the full backend test suite ✓

- Skill: none — verification only (no backend change; confirms nothing regressed in the shared tree)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test` (with the JAVA_HOME / Maven PATH prefix from `CLAUDE.md`)
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 16 (M.4): Production build ✓

- Skill: none — verification only

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 17 (M.5): Update the PR description ✓

- Skill: none — release bookkeeping

**Files:**
- Create: `.claude/contract/MPP-23-pip-trophy-cabinet/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- A link to `plan.md` in this folder.
- A summary: the cabinet button and overlay, the three shelves with ×N awards, the note and firsts, and the award announcement in Pip's bubble. Include the new version from Task 13.
- Migrations: **none**. This ticket adds nothing to `MPP-15-epic-breakdown/railway-migrations.md`, but it depends on MPP-22 and MPP-24's `pet_awards` / `pet_firsts` being applied before the epic merges to master.
- Verification results: `check:awards`, `check:room`, `check:checkin`, `mvn test`, `npm run build`, and the five manual observations from Task 12 Step 5. Say plainly which were exercised and which were not.
- A one-line convention note for future contributors: room overlays use `useRoomOverlay` + `StationButton` + a `*HitBox(level)` in `roomLayout.js`; new award lines come from `usePetAwards`'s per-browser baseline (`awardSeenStore`).
- A suggested commit subject: `MPP-23: Trophy cabinet view and new-award bubble`.

---

## Self-review

**Spec coverage:**
- `petService.getAwards` — Task 2.
- Cabinet constants — Task 1. `ROOM_HINT` rename — Task 11.
- Pure rules + `check:awards` — Task 3.
- `awardSeenStore` — Task 4.
- `usePetAwards` (fetch, four states, refresh, announcement queue) — Task 7.
- Shared award art reused by `furniture.jsx` — Task 5.
- `cabinetHitBox` + `room.check.mjs` — Task 6.
- Cabinet button, second overlay, inert room, hint, `.pip-station-btn` — Task 11 (AC 1).
- `TrophyCabinetView` + `StreakShelf` + CSS — Tasks 9, 10 (AC 2, 3, 4).
- `useHabitCheckIn` `onAnswered` / `prompt`; `PetView` bubble merge — Tasks 8, 12 (AC 5).
- Version bump + CHANGELOG — Task 13.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or a `Run:` / `Expected:` command. The manual check in Task 12 Step 5 names its route, viewports and observable outcomes.

**Type / name consistency:** `getAwards`, `usePetAwards` → `{ cabinet: { data, loading, error, retry }, announcement, refresh }`, `readAwardCounts` / `writeAwardCounts`, `orderStreaks`, `awardCount`, `streakLine`, `nextLine`, `awardCountsOf`, `newAwards`, `announcementText`, `firstsList`, `AwardIcon` / `TrophyArt` / `RibbonArt`, `CABINET_FOOTPRINT` / `cabinetHitBox`, `StationButton`, `ROOM_HINT`, `.pip-station-btn`, `onAnswered`, `prompt`. Each is spelled the same in plan.md Data shapes and in every task that uses it. Server JSON keys (`streakType`, `current`, `best`, `counts`, `next.milestone`, `next.inDays`, `firsts[].key`, `firsts[].earnedAt`) match the DTOs quoted in the plan's audit.

**Phase boundary cleanliness:**
- Phase 1 adds unused modules and a script. The build and `check:awards` are green, and the app is unchanged.
- Phase 2 swaps identical art into `furniture.jsx` and adds an unused hit box. The build and `check:room` (with the fridge assertions) are green.
- Phase 3 adds an unused hook plus additive `useHabitCheckIn` changes. `PetView` still reads `text`, so the build and `check:checkin` are green.
- Phase 4 wires everything in one coherent pass. The rename (constant, CSS class) and its only consumers change in the same task, so there are no dangling references, and the build is green.
- Phase 5 changes only the version and changelog.
