# Tasks: Pip's fridge — tap to see how much of this week's planned food is left

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-13

**Goal:** Pip's fridge on `/pet` shows a live gauge of how much of this week's planned breakfast/lunch/dinner the viewer hasn't eaten yet. It opens to a 15-slot fridge view, and Pip warns when it is 20 % or below.

**Spec:** `plan.md` in this folder.

All commands run from `foodbytes-app\client` unless stated. PowerShell: chain with `;`.

---

## File map

**Created:**
- `foodbytes-app/client/src/utils/fridgeFill.js` — pure fridge window, fill, band, colour, copy and bubble helpers
- `foodbytes-app/client/src/utils/fridgeFill.check.mjs` — node assertions for the helpers (`npm run check:fridge`)
- `foodbytes-app/client/src/hooks/useRoomOverlay.js` — open/close + focus-in / Escape / focus-return for a room overlay
- `foodbytes-app/client/src/components/pet/room/FridgeView.jsx` — the full-card fridge dialog
- `foodbytes-app/client/src/components/pet/room/FridgeView.css` — fridge view styles

**Modified:**
- `foodbytes-app/client/src/constants/petRoom.js` — fridge constants, `ROOM_VIEWBOX_SIZE`
- `foodbytes-app/client/package.json` — `check:fridge` script; version bump (Task 10)
- `foodbytes-app/client/src/components/pet/room/roomLayout.js` — `FRIDGE_FOOTPRINT`, gauge lift, `fridgeHitBox`
- `foodbytes-app/client/src/components/pet/room/room.check.mjs` — hit-box assertions
- `foodbytes-app/client/src/contexts/PetContext.jsx` — `fridge` in the context value
- `foodbytes-app/client/src/components/pet/room/roomEffects.jsx` — `FridgeGauge`
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` — gauge, fridge button, hint, overlay
- `foodbytes-app/client/src/components/pet/room/PetRoom.css` — fridge button + hint styles
- `foodbytes-app/client/src/components/pet/PetView.jsx` — fridge-low bubble, `fridge` prop
- `foodbytes-app/foodbytes-api/pom.xml` — version bump (Task 10)
- `CHANGELOG.md` — one line (Task 10)

**Deleted:** (none)

---

## Phase 1 — Pure logic and checks

Constants, the pure fridge helpers and the hit-box geometry, each pinned by a node check. Nothing imports them yet, so the app is unchanged and `npm run build` stays green. This is a safe stop.

### Task 1: Add the fridge constants to `constants/petRoom.js` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/petRoom.js:22-23`

- [x] **Step 1: Replace the viewBox constant and append the fridge constants**

Replace:

```js
// Mockup v5 projection space; the SVG scales to the card width.
export const ROOM_VIEWBOX = '0 0 360 330'
```

with:

```js
// Mockup v5 projection space; the SVG scales to the card width.
export const ROOM_VIEWBOX_SIZE = { width: 360, height: 330 }
export const ROOM_VIEWBOX = `0 0 ${ROOM_VIEWBOX_SIZE.width} ${ROOM_VIEWBOX_SIZE.height}`

// MPP-19: Pip's fridge — always 15 slots on 3 shelves (mockup v5 FRIDGE_FOOD), filled by
// the share of this week's planned breakfast/lunch/dinner the viewer hasn't eaten.
export const FRIDGE_SLOT_COUNT = 15
export const FRIDGE_SHELF_COUNT = 3
export const FRIDGE_FOOD = ['🥚', '🥛', '🧀', '🍗', '🐟', '🥩', '🥦', '🥕', '🍅', '🫑', '🥬', '🧅', '🍋', '🫐', '🍠']

// AC 4: gauge green above PLENTY, amber above LOW, red at LOW or below. Retune here.
export const FRIDGE_LOW_PCT = 20
export const FRIDGE_PLENTY_PCT = 50

export const FRIDGE_BANDS = {
  NONE: 'none',
  EMPTY: 'empty',
  LOW: 'low',
  PLENTY: 'plenty',
  FULL: 'full'
}

export const FRIDGE_GAUGE_COLOURS = {
  high: '#5cb85c',
  mid: '#f0ad4e',
  low: '#e5534b'
}

// AC 5: one note per band.
export const FRIDGE_NOTES = {
  none: 'Plan your week to stock the fridge',
  empty: 'Empty! Time for a shop 🛒',
  low: 'Running low, shopping day soon?',
  plenty: 'Plenty left for the week',
  full: 'Fully stocked for the week ✨'
}

export const FRIDGE_LOW_BUBBLE = 'The fridge is getting empty 👀'
export const FRIDGE_EMPTY_METER = 'No meals planned this week'
export const FRIDGE_FOOTNOTE = "Always 15 slots. How full it is = planned meals you haven't eaten yet ÷ meals planned this week. It restocks when you plan your week."
export const FRIDGE_HINT = 'Tap the fridge 🧊'
export const FRIDGE_LOAD_ERROR = "Couldn't load the fridge."
```

- [x] **Step 2: Confirm the module loads and the viewBox string is unchanged**

Run: `node --input-type=module -e "import { ROOM_VIEWBOX, FRIDGE_FOOD, FRIDGE_SLOT_COUNT } from './src/constants/petRoom.js'; console.log(ROOM_VIEWBOX, FRIDGE_FOOD.length === FRIDGE_SLOT_COUNT)"`
Expected: `0 0 360 330 true`

### Task 2: Pure fridge helpers in `utils/fridgeFill.js` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/fridgeFill.js`
- Create: `foodbytes-app/client/src/utils/fridgeFill.check.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [x] **Step 1: Write the check first**

Create `src/utils/fridgeFill.check.mjs`:

```js
// Run: npm run check:fridge   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-19 fridge rules
// (AC 1, 2, 4, 5) are pinned here. Mirrors cookServe.check.mjs.
import assert from 'node:assert/strict'
import {
  fridgeBand, fridgeBubble, fridgeFill, fridgeGaugeColour, fridgeMeterText, fridgeNote, fridgeWindow
} from './fridgeFill.js'
import { FRIDGE_EMPTY_METER, FRIDGE_GAUGE_COLOURS, FRIDGE_LOW_BUBBLE, FRIDGE_NOTES } from '../constants/petRoom.js'

const RANGE = { start: '2026-10-12', end: '2026-10-18' }
const entry = (eaten) => ({ eaten })

// 12–18 Oct, one breakfast/lunch/dinner each (21 entries); the first `eatenCount` are eaten.
function week(eatenCount) {
  let left = eatenCount
  const days = Array.from({ length: 7 }, (_, i) => {
    const mealsByType = {}
    for (const type of ['breakfast', 'lunch', 'dinner']) {
      mealsByType[type] = [entry(left > 0)]
      left -= 1
    }
    return { date: `2026-10-${12 + i}`, mealsByType }
  })
  return { days }
}

// One day of `count` lunches, `eatenCount` of them eaten.
const lunches = (count, eatenCount) => ({
  days: [{ date: '2026-10-13', mealsByType: { lunch: Array.from({ length: count }, (_, i) => entry(i < eatenCount)) } }]
})

// --- fridgeWindow: 7 days aligned to the calendar's start weekday, containing today.
assert.deepEqual(fridgeWindow('2026-10-12', '2026-10-12'), RANGE)
assert.deepEqual(fridgeWindow('2026-10-12', '2026-10-18'), RANGE)
assert.deepEqual(fridgeWindow('2026-10-12', '2026-10-19'), { start: '2026-10-19', end: '2026-10-25' })
assert.deepEqual(fridgeWindow('2026-09-28', '2026-10-13'), RANGE) // calendar left two weeks back
assert.deepEqual(fridgeWindow('2026-10-26', '2026-10-13'), RANGE) // calendar moved ahead
assert.deepEqual(fridgeWindow('2026-10-21', '2026-10-28'), { start: '2026-10-28', end: '2026-11-03' }) // across the DST change

// --- AC 2, verbatim: 21 planned, 6 eaten.
const ac2 = fridgeFill(week(6), RANGE)
assert.deepEqual(ac2, { planned: 21, remaining: 15, pct: 71, filledSlots: 11 })
assert.equal(fridgeMeterText(ac2), '71% full · 15 of 21 planned meals left')
assert.equal(fridgeBand(ac2), 'plenty')
assert.equal(fridgeNote(ac2), FRIDGE_NOTES.plenty)
assert.equal(fridgeGaugeColour(ac2.pct), FRIDGE_GAUGE_COLOURS.high)
assert.equal(fridgeBubble(ac2, 'rug'), null)

// --- Spec AC 4: 4 of 21 left (19 %) → red, low, Pip says so (not while asleep).
const low = fridgeFill(week(17), RANGE)
assert.deepEqual(low, { planned: 21, remaining: 4, pct: 19, filledSlots: 3 })
assert.equal(fridgeBand(low), 'low')
assert.equal(fridgeNote(low), FRIDGE_NOTES.low)
assert.equal(fridgeGaugeColour(low.pct), FRIDGE_GAUGE_COLOURS.low)
assert.equal(fridgeBubble(low, 'rug'), FRIDGE_LOW_BUBBLE)
assert.equal(fridgeBubble(low, 'cooker'), FRIDGE_LOW_BUBBLE)
assert.equal(fridgeBubble(low, 'bed'), null)

// --- Band edges: exactly 20 % is low/red; exactly 50 % is amber; 29 % is amber + plenty.
const twenty = fridgeFill(lunches(5, 4), RANGE)
assert.equal(twenty.pct, 20)
assert.equal(fridgeBand(twenty), 'low')
assert.equal(fridgeGaugeColour(twenty.pct), FRIDGE_GAUGE_COLOURS.low)
assert.equal(fridgeBubble(twenty, 'rug'), FRIDGE_LOW_BUBBLE)
assert.equal(fridgeGaugeColour(fridgeFill(lunches(10, 5), RANGE).pct), FRIDGE_GAUGE_COLOURS.mid)
const amber = fridgeFill(week(15), RANGE)
assert.equal(amber.pct, 29)
assert.equal(fridgeBand(amber), 'plenty')
assert.equal(fridgeGaugeColour(amber.pct), FRIDGE_GAUGE_COLOURS.mid)

// --- AC 1: at least 1 slot while anything remains (15 × 1 / 40 rounds to 0).
assert.equal(fridgeFill(lunches(40, 39), RANGE).filledSlots, 1)

// --- Full and empty.
const full = fridgeFill(week(0), RANGE)
assert.deepEqual(full, { planned: 21, remaining: 21, pct: 100, filledSlots: 15 })
assert.equal(fridgeBand(full), 'full')
assert.equal(fridgeNote(full), FRIDGE_NOTES.full)
const empty = fridgeFill(week(21), RANGE)
assert.deepEqual(empty, { planned: 21, remaining: 0, pct: 0, filledSlots: 0 })
assert.equal(fridgeBand(empty), 'empty')
assert.equal(fridgeNote(empty), FRIDGE_NOTES.empty)
assert.equal(fridgeBubble(empty, 'rug'), FRIDGE_LOW_BUBBLE)

// --- AC 5: nothing planned → empty fridge with the plan prompt, and no low bubble.
for (const plan of [null, {}, { days: [] }, week(0)]) {
  const range = plan === null || !plan.days?.length ? RANGE : { start: '2026-11-01', end: '2026-11-07' }
  const none = fridgeFill(plan, range)
  assert.deepEqual(none, { planned: 0, remaining: 0, pct: 0, filledSlots: 0 })
  assert.equal(fridgeBand(none), 'none')
  assert.equal(fridgeNote(none), FRIDGE_NOTES.none)
  assert.equal(fridgeMeterText(none), FRIDGE_EMPTY_METER)
  assert.equal(fridgeBubble(none, 'rug'), null)
}
assert.equal(fridgeBubble(null, 'rug'), null) // still loading / failed

// --- Only B/L/D entries inside the range count; a missing eaten flag is not eaten.
const noisy = week(6)
noisy.days[0].mealsByType.snacks = [entry(false)]
noisy.days[0].mealsByType.extras = [entry(false)]
noisy.days[1].mealsByType.dinner.push({})
noisy.days.push({ date: '2026-10-19', mealsByType: { breakfast: [entry(false)] } })
noisy.days.push({ date: '2026-10-11', mealsByType: { dinner: [entry(true)] } })
assert.deepEqual(fridgeFill(noisy, RANGE), { planned: 22, remaining: 16, pct: 73, filledSlots: 11 })

console.log('fridgeFill: all checks passed')
```

- [x] **Step 2: Add the npm script**

In `package.json` → `scripts`, directly after `"check:cook": "node src/utils/cookServe.check.mjs",` add:

```json
    "check:fridge": "node src/utils/fridgeFill.check.mjs",
```

- [x] **Step 3: Run it and watch it fail**

Run: `npm run check:fridge`
Expected: fails with `ERR_MODULE_NOT_FOUND` for `fridgeFill.js`.

- [x] **Step 4: Implement the helpers**

Create `src/utils/fridgeFill.js`:

```js
import { PET_COUNTED_MEAL_TYPES, PIP_POSITIONS } from '../constants/pet.js'
import {
  FRIDGE_BANDS,
  FRIDGE_EMPTY_METER,
  FRIDGE_GAUGE_COLOURS,
  FRIDGE_LOW_BUBBLE,
  FRIDGE_LOW_PCT,
  FRIDGE_NOTES,
  FRIDGE_PLENTY_PCT,
  FRIDGE_SLOT_COUNT
} from '../constants/petRoom.js'
import { addDays, formatDateISO, parseISODate } from './dateUtils.js'

const DAY_MS = 86_400_000
const WINDOW_DAYS = 7
const EMPTY_FILL = { planned: 0, remaining: 0, pct: 0, filledSlots: 0 }

/**
 * MPP-19: which 7 days count as "this week" — the meal-plan week containing today, on the
 * same start weekday as the calendar (anchorISO = MealPlanContext.startDate). The open
 * question in the spec lives here and only here.
 * @returns {{ start: string, end: string }}
 */
export function fridgeWindow(anchorISO, todayISO) {
  const anchor = parseISODate(anchorISO)
  // Rounded, so a DST change inside the gap can't shift the day count.
  const daysSince = Math.round((parseISODate(todayISO) - anchor) / DAY_MS)
  const start = addDays(anchor, Math.floor(daysSince / WINDOW_DAYS) * WINDOW_DAYS)
  return { start: formatDateISO(start), end: formatDateISO(addDays(start, WINDOW_DAYS - 1)) }
}

/**
 * MPP-19 AC 1: planned = breakfast/lunch/dinner ENTRIES in the range (shared plan);
 * remaining = those the viewer hasn't ticked eaten (MPP-33: `eaten` is the viewer's own).
 * filledSlots is out of 15, at least 1 while anything remains.
 * @param {{ days?: Array }|null} plan  a MealPlanWeekDTO
 * @param {{ start: string, end: string }} range  from fridgeWindow
 */
export function fridgeFill(plan, range) {
  let planned = 0
  let remaining = 0
  for (const day of plan?.days ?? []) {
    if (!day?.date || day.date < range.start || day.date > range.end) continue
    for (const mealType of PET_COUNTED_MEAL_TYPES) {
      for (const entry of day.mealsByType?.[mealType] ?? []) {
        planned += 1
        if (entry?.eaten !== true) remaining += 1
      }
    }
  }
  if (planned === 0) return EMPTY_FILL
  const filledSlots = remaining === 0 ? 0 : Math.max(1, Math.round((FRIDGE_SLOT_COUNT * remaining) / planned))
  return { planned, remaining, pct: Math.round((100 * remaining) / planned), filledSlots }
}

/** AC 5: which note applies. */
export function fridgeBand({ planned, remaining, pct }) {
  if (planned === 0) return FRIDGE_BANDS.NONE
  if (remaining === 0) return FRIDGE_BANDS.EMPTY
  if (remaining === planned) return FRIDGE_BANDS.FULL
  return pct <= FRIDGE_LOW_PCT ? FRIDGE_BANDS.LOW : FRIDGE_BANDS.PLENTY
}

/** AC 4: green above 50 %, amber above 20 %, red at 20 % or below. */
export function fridgeGaugeColour(pct) {
  if (pct > FRIDGE_PLENTY_PCT) return FRIDGE_GAUGE_COLOURS.high
  if (pct > FRIDGE_LOW_PCT) return FRIDGE_GAUGE_COLOURS.mid
  return FRIDGE_GAUGE_COLOURS.low
}

export function fridgeNote(fill) {
  return FRIDGE_NOTES[fridgeBand(fill)]
}

/** AC 2: "71% full · 15 of 21 planned meals left". */
export function fridgeMeterText({ planned, remaining, pct }) {
  if (planned === 0) return FRIDGE_EMPTY_METER
  return `${pct}% full · ${remaining} of ${planned} planned meals left`
}

/**
 * AC 4: Pip's idle line at 20 % or below. Not while he's asleep (mockup: never at night),
 * not with nothing planned (the fridge view asks you to plan), not while loading (null fill).
 */
export function fridgeBubble(fill, position) {
  if (!fill || fill.planned === 0 || position === PIP_POSITIONS.BED) return null
  return fill.pct <= FRIDGE_LOW_PCT ? FRIDGE_LOW_BUBBLE : null
}
```

- [x] **Step 5: Run the check and watch it pass**

Run: `npm run check:fridge`
Expected: `fridgeFill: all checks passed`

### Task 3: Fridge hit box in `roomLayout.js` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/roomLayout.js` (append after `STATION_ANCHORS`, before `resolveRoomLevels`)
- Test: `foodbytes-app/client/src/components/pet/room/room.check.mjs`

- [x] **Step 1: Add the failing hit-box assertions to `room.check.mjs`**

Add `FRIDGE_FOOTPRINT, FRIDGE_GAUGE_LIFT, FRIDGE_GAUGE_HALF_HEIGHT, fridgeHitBox` to the existing `import { … } from './roomLayout.js'` list. Then insert this block directly above the file's final `console.log(...)` line:

```js
// MPP-19 AC 3: the fridge button covers the fridge and its gauge at every level, inside the viewBox.
for (let level = 1; level <= ROOM_MAX_LEVEL; level++) {
  const box = fridgeHitBox(level)
  assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= 360 && box.y + box.height <= 330, `level ${level} fridge box leaves the viewBox`)
  const inside = ([x, y]) => x >= box.x - 1e-9 && x <= box.x + box.width + 1e-9 && y >= box.y - 1e-9 && y <= box.y + box.height + 1e-9
  const [gu, gv, gh] = STATION_ANCHORS.fridgeTop[level - 1]
  const [gx, gy] = P(gu, gv, gh + FRIDGE_GAUGE_LIFT)
  assert.ok(inside([gx, gy - FRIDGE_GAUGE_HALF_HEIGHT]), `level ${level} gauge top is outside the fridge box`)
  const [u, v, du, dv] = FRIDGE_FOOTPRINT[level - 1]
  assert.ok(inside(P(u + du / 2, v + dv / 2)), `level ${level} fridge floor centre is outside the fridge box`)
}
assert.ok(fridgeHitBox(4).height > fridgeHitBox(1).height, 'a bigger fridge gets a bigger button')
assert.deepEqual(fridgeHitBox(9), fridgeHitBox(1)) // an invalid level falls back to level 1
```

- [x] **Step 2: Run it and watch it fail**

Run: `npm run check:room`
Expected: fails with `SyntaxError: The requested module './roomLayout.js' does not provide an export named 'FRIDGE_FOOTPRINT'`.

- [x] **Step 3: Implement the footprint and `fridgeHitBox`**

In `roomLayout.js`, directly after the closing `}` of `STATION_ANCHORS`, insert:

```js
// MPP-19: the outer box of FURNITURE.fridge[level - 1] as [u, v, du, dv, h]. Hand-copied
// from furniture.jsx; keep the two in step when the fridge art changes (MPP-26).
export const FRIDGE_FOOTPRINT = [[145, -1, 42, 30, 34], [146, 0, 40, 34, 58], [140, 0, 46, 38, 112], [124, 0, 64, 40, 120]]
export const FRIDGE_GAUGE_LIFT = 8 // gauge centre sits this far above fridgeTop (mockup stockGauge h + 8)
export const FRIDGE_GAUGE_HALF_HEIGHT = 7 // the gauge track's top edge is 7 px above its centre
```

Then, after `resolveRoomLevels` (it is used here), add:

```js
/**
 * MPP-19 AC 3: the fridge + gauge's bounding box in viewBox px, so PetRoom can lay a real
 * <button> over it. Projects the level's footprint corners through P().
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function fridgeHitBox(level) {
  const index = resolveRoomLevels({ fridge: level }).fridge - 1
  const [u, v, du, dv, h] = FRIDGE_FOOTPRINT[index]
  const corners = []
  for (const cu of [u, u + du]) {
    for (const cv of [v, v + dv]) {
      for (const ch of [0, h]) corners.push(P(cu, cv, ch))
    }
  }
  const [gu, gv, gh] = STATION_ANCHORS.fridgeTop[index]
  const gaugeTop = P(gu, gv, gh + FRIDGE_GAUGE_LIFT)[1] - FRIDGE_GAUGE_HALF_HEIGHT
  const xs = corners.map(([x]) => x)
  const ys = [...corners.map(([, y]) => y), gaugeTop]
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}
```

- [x] **Step 4: Run the room check and watch it pass**

Run: `npm run check:room`
Expected: `room checks passed`

- [x] **Step 5: Phase gate: the build stays green**

Run: `npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 2 — Fridge data in `PetContext`

`PetContext` gains a derived `fridge` value. Nothing renders it yet, so the page is unchanged. The one extra request fires only when the calendar is off the fridge week. This is a safe stop.

### Task 4: Expose `fridge` from `PetContext` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/contexts/PetContext.jsx:1-9, 29-45, 101-132`

- [x] **Step 1: Imports**

After `import { addDays, formatDateISO } from '../utils/dateUtils'` add:

```js
import { fridgeFill, fridgeWindow } from '../utils/fridgeFill'
import { FRIDGE_LOAD_ERROR } from '../constants/petRoom'
```

- [x] **Step 2: Read the calendar's loading/error/refetch and compute the fridge range**

Replace `const { weekPlan, startDate } = useMealPlan()` with:

```js
  const { weekPlan, startDate, loading: weekLoading, error: weekError, fetchWeekPlan } = useMealPlan()
```

After `const yesterdayISO = formatDateISO(addDays(now, -1))` add:

```js
  // MPP-19: the fridge week. When the calendar shows it, weekPlan IS it (live, optimistic
  // ticks); aligned weeks are equal or disjoint, so the two sources never disagree on a day.
  const fridgeRange = fridgeWindow(startDate, todayISO)
  const calendarIsFridgeWeek = startDate === fridgeRange.start
```

After `const [planError, setPlanError] = useState(null)` add:

```js
  const [fridgePlan, setFridgePlan] = useState(null) // { start, plan } — keyed so a stale week is never counted
  const [fridgeError, setFridgeError] = useState(null)
```

- [x] **Step 3: The conditional fridge-week fetch**

Directly after the recent-days `useEffect` (the one ending `}, [isAuthenticated, yesterdayISO, startDate, reloadKey])`), add:

```js
  // MPP-19: fetch the fridge week only when the calendar isn't showing it.
  useEffect(() => {
    if (!isAuthenticated || calendarIsFridgeWeek) {
      setFridgePlan(null)
      setFridgeError(null)
      return undefined
    }
    const controller = new AbortController()
    const start = fridgeRange.start
    setFridgeError(null)
    mealPlanService.getWeekPlan(start, { signal: controller.signal })
      .then(plan => setFridgePlan({ start, plan }))
      .catch(err => {
        if (!isCancelled(err)) setFridgeError(err.response?.data?.error || FRIDGE_LOAD_ERROR)
      })
    return () => controller.abort()
  }, [isAuthenticated, calendarIsFridgeWeek, fridgeRange.start, reloadKey])
```

- [x] **Step 4: Derive `fridge` and add it to the value**

After `const position = pipPosition(now, pet?.mealTimes ?? null)` add:

```js
  // MPP-19: null fill = loading or failed, never "nothing planned" (that is planned: 0).
  const fridgeSource = calendarIsFridgeWeek
    ? { plan: weekPlan, error: weekError && !weekLoading ? FRIDGE_LOAD_ERROR : null, retry: fetchWeekPlan }
    : { plan: fridgePlan?.start === fridgeRange.start ? fridgePlan.plan : null, error: fridgeError, retry }
  const fridge = {
    fill: fridgeSource.plan ? fridgeFill(fridgeSource.plan, fridgeRange) : null,
    loading: !fridgeSource.plan && !fridgeSource.error,
    error: fridgeSource.plan ? null : fridgeSource.error,
    retry: fridgeSource.retry
  }
```

In `const value = { … }`, add `fridge,` after `position,`. Leave `loading` and `error` unchanged: a fridge failure must not blank the page.

- [x] **Step 5: Extend the docblock**

Append to the provider's JSDoc, before the closing `*/`:

```js
 *
 * MPP-19: `fridge` ({ fill, loading, error, retry }) counts this week's planned
 * breakfast/lunch/dinner and how many YOU haven't eaten (fridgeFill), over the 7 days
 * fridgeWindow picks. It reads weekPlan when the calendar shows that week, otherwise one
 * abortable fetch of it. Its error never blanks Pip.
```

- [x] **Step 6: Build and measure**

Run: `npm run build; (Get-Content src\contexts\PetContext.jsx | Measure-Object -Line).Lines`
Expected: `built in <n>s` with no errors; line count below 200.

---

## Phase 3 — The room, the fridge view and the bubble

Rendering, in dependency order: the gauge effect, the overlay hook, the fridge view, then `PetRoom` and `PetView` wiring. Tasks 5–7 add unused modules, so the build stays green after each. Tasks 8–9 switch the feature on together.

### Task 5: `FridgeGauge` effect ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/roomEffects.jsx:1-3` (imports) and append after `ServedPlate`

- [x] **Step 1: Imports**

Replace `import { NIGHT_DIM_FILL, SLEEP_Z_LIFT, STATION_ANCHORS } from './roomLayout'` with:

```js
import { FRIDGE_GAUGE_LIFT, NIGHT_DIM_FILL, SLEEP_Z_LIFT, STATION_ANCHORS } from './roomLayout'
import { fridgeGaugeColour } from '../../../utils/fridgeFill'

const GAUGE_TRACK = 34 // px of fill at 100 % (mockup v5 stockGauge)
```

- [x] **Step 2: Add the component after `ServedPlate`**

```jsx
/** MPP-19 AC 4: the stock gauge on top of the fridge (mockup v5 stockGauge), coloured by how full it is. */
export function FridgeGauge({ level, pct }) {
  const [u, v, h] = STATION_ANCHORS.fridgeTop[level - 1]
  const width = (GAUGE_TRACK * pct) / 100
  return (
    <Bill u={u} v={v} h={h + FRIDGE_GAUGE_LIFT}>
      <rect x="-19" y="-7" width="38" height="10" rx="5" fill="#fff" stroke={MOCHI_OUTLINE} strokeWidth="1.4" />
      {width > 0 && <rect x="-17" y="-5" width={width.toFixed(1)} height="6" rx="3" fill={fridgeGaugeColour(pct)} />}
    </Bill>
  )
}
```

Update the file's top docblock line to `MPP-17/18/19: the cooker idle scene, the served plate, the fridge gauge and the night scene, …`.

- [x] **Step 3: Build**

Run: `npm run build`
Expected: `built in <n>s`, no errors.

### Task 6: `useRoomOverlay` hook ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useRoomOverlay.js`

- [x] **Step 1: Create the hook**

```js
import { useEffect, useRef, useState } from 'react'

/**
 * MPP-19 AC 3: open/close for a full-card overlay inside Pip's room (the fridge; MPP-23's
 * cabinet can reuse it). Opening moves focus to the panel's first button (its close
 * button); Escape or close() shuts it and hands focus back to the trigger.
 *
 * Focus returns in the effect after the closing render, by which point the room behind
 * is no longer inert and the trigger can take focus.
 *
 * @returns {{ isOpen: boolean, open: () => void, close: () => void, triggerRef: object, panelRef: object }}
 */
export function useRoomOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      if (wasOpenRef.current) triggerRef.current?.focus()
      wasOpenRef.current = false
      return undefined
    }
    wasOpenRef.current = true
    panelRef.current?.querySelector('button')?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    triggerRef,
    panelRef
  }
}

export default useRoomOverlay
```

- [x] **Step 2: Build**

Run: `npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: `FridgeView` dialog and styles ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/FridgeView.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/FridgeView.css`

- [x] **Step 1: Create the component**

```jsx
import { FRIDGE_FOOD, FRIDGE_FOOTNOTE, FRIDGE_SHELF_COUNT, FRIDGE_SLOT_COUNT } from '../../../constants/petRoom'
import { fridgeMeterText, fridgeNote } from '../../../utils/fridgeFill'
import './FridgeView.css'

const SLOTS_PER_SHELF = FRIDGE_SLOT_COUNT / FRIDGE_SHELF_COUNT
const SHELVES = Array.from({ length: FRIDGE_SHELF_COUNT }, (_, shelf) =>
  FRIDGE_FOOD.slice(shelf * SLOTS_PER_SHELF, (shelf + 1) * SLOTS_PER_SHELF))

/**
 * MPP-19 AC 2/3/5: the fridge, full-card inside Pip's room (mockup v5 fridgeHtml):
 * the meter line and note, then 15 food slots on 3 shelves with the first `filledSlots`
 * stocked. Loading and error get their own states; nothing planned is an empty fridge
 * (AC 5), not an error. Focus handling lives in useRoomOverlay.
 */
function FridgeView({ name, fridge, titleId, panelRef, onClose }) {
  return (
    <div ref={panelRef} className="pip-fridge-view" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="pip-fridge-head">
        <h3 id={titleId}>🧊 {name}&apos;s fridge</h3>
        <button type="button" className="pip-fridge-btn-text" onClick={onClose}>
          Back to room
        </button>
      </div>
      <FridgeBody fridge={fridge} />
    </div>
  )
}

function FridgeBody({ fridge }) {
  if (fridge?.fill) return <Stocked fill={fridge.fill} />
  if (fridge?.error) {
    return (
      <div className="pip-fridge-state" role="alert">
        <p>{fridge.error}</p>
        <button type="button" className="pip-fridge-btn-text" onClick={fridge.retry}>
          Try again
        </button>
      </div>
    )
  }
  return (
    <div className="pip-fridge-state" aria-busy="true">
      <div className="loading-spinner" />
    </div>
  )
}

function Stocked({ fill }) {
  return (
    <>
      <p className="pip-fridge-meter">
        <b>{fridgeMeterText(fill)}</b>
        <span>{fridgeNote(fill)}</span>
      </p>
      <div className="pip-fridge-body" role="img" aria-label={`${fill.filledSlots} of ${FRIDGE_SLOT_COUNT} fridge slots stocked`}>
        {SHELVES.map((foods, shelf) => (
          <div key={shelf} className="pip-fridge-shelf">
            {foods.map((food, i) => {
              const stocked = shelf * SLOTS_PER_SHELF + i < fill.filledSlots
              return (
                <span key={food} className={stocked ? 'pip-fridge-food' : 'pip-fridge-food is-gone'}>
                  {stocked ? food : ''}
                </span>
              )
            })}
          </div>
        ))}
      </div>
      <p className="pip-fridge-footnote">{FRIDGE_FOOTNOTE}</p>
    </>
  )
}

export default FridgeView
```

- [x] **Step 2: Create the styles**

```css
/* MPP-19: Pip's fridge view (mockup v5 .overlay.fridge / .fmeter / .fbody / .fshelf / .food).
   Fills the room card and scrolls inside it (spec: mobile-first, no page scroll at 320 px). */

.pip-fridge-view {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: linear-gradient(#eef6fb, #d9ebf5);
}

.pip-fridge-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pip-fridge-head h3 {
  margin: 0;
  font-size: 1rem;
  overflow-wrap: anywhere;
}

.pip-fridge-btn-text {
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  color: inherit;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.pip-fridge-btn-text:active {
  background: rgba(0, 0, 0, 0.16);
}

@media (hover: hover) {
  .pip-fridge-btn-text:hover {
    background: rgba(0, 0, 0, 0.12);
  }
}

.pip-fridge-btn-text:focus-visible {
  outline: 3px solid #7b5cd6;
  outline-offset: 2px;
}

.pip-fridge-meter {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 8px;
  margin: 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: #fff;
  font-size: 0.8rem;
}

.pip-fridge-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border: 3px solid #b7cfdd;
  border-radius: 12px;
  background: #f8fcff;
}

.pip-fridge-shelf {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  padding-bottom: 6px;
  border-bottom: 4px solid #b7cfdd;
}

.pip-fridge-food {
  display: grid;
  place-items: center;
  height: 40px;
  border-radius: 8px;
  background: #fff;
  font-size: 1.5rem;
}

.pip-fridge-food.is-gone {
  border: 2px dashed #c9dbe6;
  background: transparent;
}

.pip-fridge-footnote {
  margin: 0;
  font-size: 0.76rem;
  line-height: 1.4;
  color: #5c5670;
}

.pip-fridge-state {
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

Run: `npm run build`
Expected: `built in <n>s`, no errors.

### Task 8: `PetRoom` draws the gauge, the fridge button, the hint and the overlay ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` (imports, `PetRoom`, `Station`; add `FridgeButton`)
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css` (append)

- [x] **Step 1: Imports**

Replace the import block (lines 1–9) with:

```js
import { useId } from 'react'
import { MEAL_TYPE_LABELS } from '../../../constants/mealTypes'
import { COOK_PHASES, PET_MOOD_LABELS, PIP_POSITIONS, PIP_POSITION_LABELS } from '../../../constants/pet'
import { DEFAULT_ROOM_LEVELS, FRIDGE_HINT, ROOM_STATIONS, ROOM_VIEWBOX, ROOM_VIEWBOX_SIZE } from '../../../constants/petRoom'
import useRoomOverlay from '../../../hooks/useRoomOverlay'
import { stationArt } from './furniture'
import FridgeView from './FridgeView'
import { ROOM_BACKDROP } from './roomDecor'
import { FridgeGauge, NightDim, PotSteam, ServedPlate, SleepZs } from './roomEffects'
import { COOK_WALK_OFFSET, ROOM_DRAW_ORDER, cookPose, fridgeHitBox, pipPose, resolveRoomLevels } from './roomLayout'
import RoomPip from './RoomPip'
import './PetRoom.css'
```

- [x] **Step 2: Replace the `PetRoom` function**

```jsx
function PetRoom({ name, mood, bubble, position = PIP_POSITIONS.RUG, levels = DEFAULT_ROOM_LEVELS, serving = null, fridge = null }) {
  const resolved = resolveRoomLevels(levels)
  const phase = serving?.phase ?? null
  const scenePosition = serving ? PIP_POSITIONS.RUG : position
  const pose = serving ? cookPose() : pipPose(position, mood, resolved)
  const asleep = scenePosition === PIP_POSITIONS.BED
  const label = `${name}'s room — ${name} is ${roomDoing(position, mood, serving)}`
  const fridgeOverlay = useRoomOverlay()
  const fridgeTitleId = `pip-fridge-title-${useId().replace(/:/g, '')}`
  const fridgeFill = fridge?.fill ?? null
  // MPP-19: the room behind an open overlay is out of the tab order and the a11y tree.
  const behind = fridgeOverlay.isOpen ? { inert: '', 'aria-hidden': true } : {}

  return (
    <div className="pip-room">
      <div className="pip-room-scene" {...behind}>
        <svg className="pip-room-svg" viewBox={ROOM_VIEWBOX} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
          {asleep ? ROOM_BACKDROP.night : ROOM_BACKDROP.day}
          {ROOM_DRAW_ORDER.map(station => (
            <Station
              key={station}
              station={station}
              level={resolved[station]}
              position={scenePosition}
              phase={phase}
              pose={pose}
              fridgePct={fridgeFill?.pct ?? null}
            />
          ))}
          {asleep && <NightDim />}
          <PipWalker phase={phase}>{!asleep && <RoomPip pose={pose} />}</PipWalker>
          {asleep && <SleepZs level={resolved.bed} />}
        </svg>
        <p className="pet-bubble" aria-live="polite">{bubble}</p>
        <FridgeButton name={name} level={resolved.fridge} fill={fridgeFill} buttonRef={fridgeOverlay.triggerRef} onOpen={fridgeOverlay.open} />
        <p className="pip-room-hint">{FRIDGE_HINT}</p>
      </div>
      {fridgeOverlay.isOpen && (
        <FridgeView name={name} fridge={fridge} titleId={fridgeTitleId} panelRef={fridgeOverlay.panelRef} onClose={fridgeOverlay.close} />
      )}
    </div>
  )
}
```

Add `MPP-19: the fridge gauge, a real button over the fridge that opens FridgeView, and the "tap the fridge" hint.` as a new last line of the component's docblock.

- [x] **Step 3: `Station` draws the gauge on the fridge**

Change the signature to `function Station({ station, level, position, phase, pose, fridgePct })`. Directly after `const art = stationArt(station, level)` insert:

```jsx
  // MPP-19: the gauge sits on the fridge, before the cabinet and bed are drawn (back → front).
  if (station === ROOM_STATIONS.FRIDGE) {
    return (
      <>
        {art}
        {fridgePct != null && <FridgeGauge level={level} pct={fridgePct} />}
      </>
    )
  }
```

- [x] **Step 4: Add `FridgeButton` and its helper above `roomDoing`**

```jsx
// MPP-19 AC 3: a real button laid over the fridge art. The SVG is role="img", so it can't hold one.
function FridgeButton({ name, level, fill, buttonRef, onOpen }) {
  const { x, y, width, height } = fridgeHitBox(level)
  const { width: viewWidth, height: viewHeight } = ROOM_VIEWBOX_SIZE
  const style = {
    left: percentOf(x, viewWidth),
    top: percentOf(y, viewHeight),
    width: percentOf(width, viewWidth),
    height: percentOf(height, viewHeight)
  }
  const label = fill && fill.planned > 0 ? `Open ${name}'s fridge, ${fill.pct}% full` : `Open ${name}'s fridge`
  return (
    <button
      ref={buttonRef}
      type="button"
      className="pip-fridge-btn"
      style={style}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={onOpen}
    />
  )
}

const percentOf = (value, total) => `${((100 * value) / total).toFixed(2)}%`
```

- [x] **Step 5: Append the button and hint styles to `PetRoom.css`**

```css
/* MPP-19 AC 3: the fridge button sits over the fridge art (fridgeHitBox, % of the viewBox);
   at least 44 px however small the card gets. */
.pip-fridge-btn {
  position: absolute;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.pip-fridge-btn:active {
  background: rgba(255, 211, 77, 0.25);
}

@media (hover: hover) {
  .pip-fridge-btn:hover {
    background: rgba(255, 211, 77, 0.18);
  }
}

.pip-fridge-btn:focus-visible {
  outline: 3px solid #ffd34d;
  outline-offset: 2px;
}

/* Spec: the "tap the fridge" hint, bottom-left (mockup v5 .hint). Decorative for touch, so
   it never takes a tap. */
.pip-room-hint {
  position: absolute;
  left: 10px;
  bottom: 10px;
  margin: 0;
  padding: 5px 9px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: #5c5670;
  font-size: 0.72rem;
  pointer-events: none;
}
```

- [x] **Step 6: Build and measure**

Run: `npm run build; (Get-Content src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines`
Expected: `built in <n>s` with no errors; line count below 200.

### Task 9: `PetView` passes the fridge and shows the low-stock bubble ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx:9-10, 13-19, 23, 64-70`

- [x] **Step 1: Import the bubble helper**

After `import { cookServeBubble } from '../../utils/cookServe'` add:

```js
import { fridgeBubble } from '../../utils/fridgeFill'
```

- [x] **Step 2: Read `fridge` from the context**

Replace `const { pet, mood, moodInfo, position, error, retry, renamePet } = usePet()` with:

```js
  const { pet, mood, moodInfo, position, fridge, error, retry, renamePet } = usePet()
```

- [x] **Step 3: Compose the bubble and pass the fridge**

Replace the `<PetRoom … />` element with:

```jsx
      <PetRoom
        name={pet.name}
        mood={mood}
        bubble={(serving && cookServeBubble(serving)) ?? fridgeBubble(fridge.fill, position) ?? petBubble(moodInfo)}
        position={position}
        serving={serving}
        fridge={fridge}
      />
```

Append to the docblock: ` * MPP-19: the fridge (gauge + view) and, when idle at 20 % or below, "The fridge is getting empty 👀" (cook > fridge-low > mood).`

- [x] **Step 4: Build**

Run: `npm run build`
Expected: `built in <n>s`, no errors.

- [ ] **Step 5: Manual check on the running app (developer, or executor if a dev server is up)** — UNVERIFIED: no browser available to the implementer; delegated to the developer

Run the stack (`docker-compose up --build` from the repo root, or `npm run dev` with the backend on :8080) and sign in. At 375 px and at 320 px wide in Chrome DevTools device mode, on `/pet`:
1. The fridge shows a gauge whose width and colour match the week's fill. With the calendar on the current week, tick a planned meal on `/mealplan`, then return to `/pet`: the gauge drops by one meal's share.
2. Tab to the fridge: a visible yellow focus ring. Press Enter: the fridge view fills the room card, focus is on "Back to room", and it shows "N% full · R of P planned meals left", the note, and 15 cells on 3 shelves with `filledSlots` stocked. Press Escape: the view closes and focus is back on the fridge. Repeat with a tap and "Back to room".
3. Move the calendar to next week, return to `/pet`: the fridge still shows this week's numbers (one `GET /api/meal-plan?startDate=<fridge week start>` in the Network tab).
4. A week with nothing planned: the view shows "No meals planned this week" and "Plan your week to stock the fridge" with all 15 cells dashed, and Pip shows no fridge bubble.
5. With ≤ 20 % left and Pip awake and not cooking, the bubble reads "The fridge is getting empty 👀".
6. No horizontal page scroll at 320 px; the "Tap the fridge 🧊" hint sits bottom-left and does not cover the fridge.

Expected: all six hold. Record any that could not be exercised as **unverified** in `pr-description.md`; never mark them passed.

---

## Phase 4 — Final verification

No production changes beyond the version bump, only sanity checks on the cumulative work. Frontend-only contract: no backend file changed, so there is no `mvn test` task (same as MPP-18).

### Task 10: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-19 is a **Story** → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-19: Pip's fridge — gauge + tappable 15-slot fridge view of this week's uneaten planned meals, low-stock bubble`

- [x] **Step 3: Verify agreement**

Run: `npm run check:version`
Expected: `Version OK: <new version>`

### Task 11: Run every node check ✓

- Skill: none — verification only

- [x] **Step 1: All pure-logic checks**

Run: `npm run check:fridge; npm run check:room; npm run check:pet; npm run check:pip; npm run check:cook; npm run check:macros`
Expected: each prints its success line, and none throws an `AssertionError`.

### Task 12: Grep audits and line budget ✓

- Skill: react-frontend

- [x] **Step 1: No debug logging in the new or touched files**

Run: `Select-String -Path src\utils\fridgeFill.js,src\hooks\useRoomOverlay.js,src\components\pet\room\FridgeView.jsx,src\components\pet\room\PetRoom.jsx,src\components\pet\room\roomEffects.jsx,src\components\pet\room\roomLayout.js,src\contexts\PetContext.jsx,src\components\pet\PetView.jsx -Pattern "console\.(log|debug)"`
Expected: zero hits.

- [x] **Step 2: No hard-coded fridge copy or thresholds outside the constants**

Run: `Select-String -Path src\components\pet\*.jsx,src\components\pet\room\*.jsx,src\contexts\PetContext.jsx -Pattern "getting empty|Plan your week|planned meals left|<= 20|> 50"`
Expected: zero hits.

- [x] **Step 3: No new CSS module, no new dependency**

Run: `Get-ChildItem -Path src -Recurse -Filter *.module.css; git diff --stat -- package.json`
Expected: no `.module.css` files; the `package.json` diff touches only `version` and the `check:fridge` script.

- [x] **Step 4: Line budget on every created or grown file**

Run: `foreach ($f in 'src\utils\fridgeFill.js','src\hooks\useRoomOverlay.js','src\components\pet\room\FridgeView.jsx','src\components\pet\room\PetRoom.jsx','src\components\pet\room\roomEffects.jsx','src\components\pet\room\roomLayout.js','src\contexts\PetContext.jsx','src\components\pet\PetView.jsx') { "$f $((Get-Content $f | Measure-Object -Line).Lines)" }`
Expected: every file under 200 lines (none near the 400 blocking budget).

### Task 13: Production build ✓

- Skill: none — verification only

- [x] **Step 1: Build the client**

Run: `npm run build`
Expected: `built in <n>s`, no errors.

### Task 14: Write the PR description ✓

- Skill: none — release bookkeeping

**Files:**
- Create: `.claude/contract/MPP-19-pip-fridge/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- A link to `plan.md` in this folder.
- A summary: fridge window + fill helpers, gauge, fridge button + `FridgeView` dialog, low-stock bubble, hint. Include the new version from Task 10.
- **No migration and no backend change.** Railway redeploys the web service on push.
- Verification results: the Task 11 check outputs, the Task 13 build, the Task 12 line counts, and the Task 9 Step 5 manual checks, each marked done or **unverified**.
- A note for future contributors: the fridge window rule lives only in `fridgeWindow()`; `FRIDGE_FOOTPRINT` must be updated with any fridge art change (MPP-26); `useRoomOverlay` is the overlay pattern for MPP-23's cabinet.
- Suggested commit subject: `MPP-19: Pip's fridge gauge and 15-slot fridge view`

---

## Self-review

**Spec coverage:**
- `utils/fridgeFill.js` helpers + `.check.mjs` + `check:fridge` (AC 1, AC 2): Task 2.
- Fridge constants: Task 1.
- `PetContext` `fridge` (weekPlan reuse / conditional fetch): Task 4.
- Level-aware `FridgeGauge` (AC 4): Tasks 5, 8.
- Fridge hit box + real button (AC 3): Tasks 3, 8.
- `FridgeView` dialog, four async states, own scroll (AC 2, 3, 5): Task 7.
- `useRoomOverlay` focus-in / Escape / focus-return (AC 3): Task 6.
- Low-stock bubble (AC 4): Tasks 2 (`fridgeBubble`), 9.
- "Tap the fridge 🧊" hint: Task 8.
- Version bump + CHANGELOG: Task 10.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or a `Run:`/`Expected:` pair. `<new version>` and `<n>` are values computed at apply time by design.

**Type / name consistency:** `fridgeWindow`, `fridgeFill(plan, range)`, `fridgeBand`, `fridgeGaugeColour`, `fridgeNote`, `fridgeMeterText`, `fridgeBubble` are identical in plan.md Data shapes, Task 2 and their callers (Tasks 4, 5, 7, 9). `fridge = { fill, loading, error, retry }` matches across Task 4 (context), Task 7 (`fridge.fill` / `fridge.error` / `fridge.retry`), Task 8 (`fridge?.fill`) and Task 9. `FRIDGE_FOOTPRINT`, `FRIDGE_GAUGE_LIFT`, `FRIDGE_GAUGE_HALF_HEIGHT`, `fridgeHitBox` match across Tasks 3, 5 and 8. `ROOM_VIEWBOX_SIZE` is introduced in Task 1 and used in Task 8. `useRoomOverlay → { isOpen, open, close, triggerRef, panelRef }` matches across Tasks 6 and 8. CSS classes: `pip-fridge-view`, `pip-fridge-head`, `pip-fridge-btn-text`, `pip-fridge-meter`, `pip-fridge-body`, `pip-fridge-shelf`, `pip-fridge-food`, `is-gone`, `pip-fridge-footnote`, `pip-fridge-state` (Task 7), and `pip-room-scene`, `pip-fridge-btn`, `pip-room-hint` (Task 8). `pip-room-scene` needs no rule: it is unpositioned, so the bubble, button and hint still position against `.pip-room`. `FridgeView` takes `{ name, fridge, titleId, panelRef, onClose }` in both plan.md and Task 7.

**Phase boundary cleanliness:**
- Phase 1 adds only unused modules and constants (`ROOM_VIEWBOX` keeps its exact string), so the build is green and behaviour is unchanged.
- Phase 2 adds a context field nobody reads yet. The build is green and the extra fetch is harmless.
- Phase 3 builds green after every task. Tasks 5–7 are unused until Task 8, and Task 9 is the only behaviour switch for the bubble.
- Phase 4 changes only versions/CHANGELOG and writes the PR description.
