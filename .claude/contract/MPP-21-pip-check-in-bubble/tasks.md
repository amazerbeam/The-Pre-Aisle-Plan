# Tasks: Pip's daily check-in in his speech bubble (snacks and alcohol)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-13

**Goal:** Pip's speech bubble asks once a day about snacks then alcohol (only habits with `askToday`), posts each answer to MPP-20's API, reacts kindly, snoozes on "Not now" until tomorrow, and falls back to the normal greeting on any API failure — with nothing added outside the room.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/client/src/services/habitService.js` — `getHabits` / `answerHabit` over `/api/pet/habits`.
- `foodbytes-app/client/src/utils/habitCheckIn.js` — pure wording and queue rules.
- `foodbytes-app/client/src/utils/habitCheckIn.check.mjs` — node check pinning those rules.
- `foodbytes-app/client/src/utils/checkInSnoozeStore.js` — per-user "Not now" day marker.
- `foodbytes-app/client/src/hooks/useHabitCheckIn.js` — check-in state machine.
- `foodbytes-app/client/src/components/pet/room/CheckInActions.jsx` — bubble buttons and labelled date form.
- `foodbytes-app/client/src/components/pet/room/CheckInActions.css` — their styles.

**Modified:**
- `foodbytes-app/client/src/constants/pet.js` — append MPP-21 constants.
- `foodbytes-app/client/package.json` — `check:checkin` script; version bump.
- `foodbytes-app/client/src/contexts/PetContext.jsx:164-175` — expose `todayISO`.
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx:1,24,58` — `SpeechBubble` with a persistent live region and a `bubbleActions` slot.
- `foodbytes-app/client/src/components/pet/PetView.jsx` — wire `useHabitCheckIn`, bubble priority, `CheckInActions`.
- `foodbytes-app/client/src/components/pet/PetView.css:10-35` — bubble text margin, asking width, focus outline.
- `foodbytes-app/foodbytes-api/pom.xml` — version bump.
- `CHANGELOG.md` — new top line.

**Deleted:** (none)

---

## Phase 1 — Data layer and pure rules

Adds the service module, constants, pure helpers with their node check, and the snooze store. Nothing imports them yet, so the app behaves exactly as before and the build stays green — a safe place to stop.

### Task 1: Append the check-in constants to `constants/pet.js` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/pet.js` (append after line 85)

- [x] **Step 1: Append the constants block**

```js

// MPP-21: the daily snack / alcohol check-in in Pip's bubble (MPP-20 habits).
export const HABITS = {
  SNACK: 'SNACK',
  ALCOHOL: 'ALCOHOL'
}
export const HABIT_ORDER = [HABITS.SNACK, HABITS.ALCOHOL] // snacks first, then alcohol (AC 1)
export const HABIT_QUESTION_NOUN = { SNACK: 'snacks', ALCOHOL: 'alcohol' }
export const HABIT_FREE_LABEL = { SNACK: 'snack-free', ALCOHOL: 'alcohol-free' }
export const CHECKIN_STEPS = {
  ASK: 'ask',
  WHEN: 'when'
}
export const CHECKIN_REACTION_MS = 8000 // how long the last reaction stays before the usual bubble returns
export const CHECKIN_WEEKDAY_SPAN_DAYS = 6 // "since Wednesday" up to 6 days back; a date after that
export const CHECKIN_SNOOZE_STORAGE_KEY = 'foodbytes.pip.checkInSnoozedOn'
export const CHECKIN_WHEN_PROMPT = "That's ok! When did you have it?"
export const CHECKIN_SNOOZE_REPLY = "No worries, I'll ask tomorrow 💜"
export const CHECKIN_SAVE_FAILED = "Hmm, I couldn't save that. I'll ask again next time 💜"
export const CHECKIN_THANKS = 'Thanks for telling me 💜'
```

- [x] **Step 2: Confirm it still imports under node**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {HABIT_ORDER, CHECKIN_REACTION_MS} from './src/constants/pet.js'; console.log(HABIT_ORDER, CHECKIN_REACTION_MS)"`
Expected: `[ 'SNACK', 'ALCOHOL' ] 8000`

### Task 2: `habitService` over MPP-20's endpoints ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/services/habitService.js`

- [x] **Step 1: Write the service**

```js
import api from './api'

/**
 * MPP-21: your own snack-free / alcohol-free check-in streaks (MPP-20). Always the
 * caller's, never the meal-plan owner's (per-person Pip, MPP-33).
 *
 * HabitStatus = { habit: 'SNACK'|'ALCOHOL', current: number, best: number,
 *                 lastAnsweredDate: string|null, askToday: boolean, coversFrom: string }  (dates 'YYYY-MM-DD')
 */
export const habitService = {
  /**
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<Object[]>} HabitStatus for SNACK and ALCOHOL
   */
  async getHabits({ signal } = {}) {
    const response = await api.get('/pet/habits', { signal })
    return response.data
  },

  /**
   * @param {'SNACK'|'ALCOHOL'} habit
   * @param {{ clean: boolean, lapseDate?: string }} body - lapseDate ('YYYY-MM-DD') only when clean is false
   * @returns {Promise<Object>} the updated HabitStatus
   */
  async answerHabit(habit, body) {
    const response = await api.post(`/pet/habits/${habit}/answer`, body)
    return response.data
  }
}

export default habitService
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 3: Pure check-in rules in `utils/habitCheckIn.js` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/habitCheckIn.js`

- [x] **Step 1: Write the helpers**

```js
import {
  CHECKIN_THANKS,
  CHECKIN_WEEKDAY_SPAN_DAYS,
  HABIT_FREE_LABEL,
  HABIT_ORDER,
  HABIT_QUESTION_NOUN
} from '../constants/pet.js'
import { formatLongWeekday, parseISODate } from './dateUtils.js'

const MS_PER_DAY = 86_400_000

/**
 * MPP-21: the rules and wording for Pip's daily check-in. Pure, so
 * habitCheckIn.check.mjs can pin them without a browser.
 */

/** Whole days from one 'YYYY-MM-DD' to another (UTC arithmetic, so DST can't shift it). */
export function daysBetweenISO(fromISO, toISO) {
  const toUtc = (iso) => {
    const [y, m, d] = iso.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUtc(toISO) - toUtc(fromISO)) / MS_PER_DAY)
}

/** AC 1: how far back one answer reaches — "today", "since yesterday", "since Wednesday", "since 3 Oct". */
export function sinceText(coversFromISO, todayISO) {
  const back = daysBetweenISO(coversFromISO, todayISO)
  if (back <= 0) return 'today'
  if (back === 1) return 'since yesterday'
  if (back <= CHECKIN_WEEKDAY_SPAN_DAYS) return `since ${formatLongWeekday(coversFromISO)}`
  const date = parseISODate(coversFromISO).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `since ${date}`
}

/** AC 1: "Did you have any snacks today?" / "Did you have any alcohol since yesterday?" */
export function questionText(habit, coversFromISO, todayISO) {
  return `Did you have any ${HABIT_QUESTION_NOUN[habit]} ${sinceText(coversFromISO, todayISO)}?`
}

/** AC 2: praise after "No", from the status the server returned. */
export function praiseText({ habit, current }) {
  if (!current) return CHECKIN_THANKS
  return `${dayCount(current)} ${HABIT_FREE_LABEL[habit]}! So proud of you 💜`
}

/** AC 3: the gentle reply after a lapse is saved. Never shaming: best is always quoted. */
export function startOverText({ current, best }) {
  const soFar = current ? `${dayCount(current)} so far, ` : ''
  return `We can start over 💜 ${soFar}your best is still ${best}.`
}

/** The habits to ask, in HABIT_ORDER, that the server says are unanswered today. */
export function habitsToAsk(statuses) {
  const asked = new Set((statuses ?? []).filter(s => s.askToday).map(s => s.habit))
  return HABIT_ORDER.filter(habit => asked.has(habit))
}

/** AC 4: "Not now" lasts until the next day only. */
export function isSnoozedToday(snoozedOnISO, todayISO) {
  return snoozedOnISO != null && snoozedOnISO === todayISO
}

const dayCount = (n) => `${n} day${n === 1 ? '' : 's'}`
```

- [x] **Step 2: Smoke-import under node**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {questionText} from './src/utils/habitCheckIn.js'; console.log(questionText('SNACK','2026-10-13','2026-10-15'))"`
Expected: `Did you have any snacks since Tuesday?`

### Task 4: Pin the rules in `habitCheckIn.check.mjs` and register `check:checkin` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/habitCheckIn.check.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`, after `check:fridge`)

- [x] **Step 1: Write the check script**

```js
// Run: npm run check:checkin   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-21 check-in rules
// (AC 1–4) are pinned here. Mirrors fridgeFill.check.mjs. 2026-10-13 is a Tuesday.
import assert from 'node:assert/strict'
import {
  daysBetweenISO, habitsToAsk, isSnoozedToday, praiseText, questionText, sinceText, startOverText
} from './habitCheckIn.js'
import { CHECKIN_THANKS } from '../constants/pet.js'

// daysBetweenISO — across a month end and the October DST change.
assert.equal(daysBetweenISO('2026-10-13', '2026-10-13'), 0)
assert.equal(daysBetweenISO('2026-09-30', '2026-10-01'), 1)
assert.equal(daysBetweenISO('2026-10-24', '2026-10-26'), 2)

// AC 1: sinceText
assert.equal(sinceText('2026-10-15', '2026-10-15'), 'today')
assert.equal(sinceText('2026-10-16', '2026-10-15'), 'today') // defensive: coversFrom never after today
assert.equal(sinceText('2026-10-14', '2026-10-15'), 'since yesterday')
assert.equal(sinceText('2026-10-13', '2026-10-15'), 'since Tuesday')
assert.equal(sinceText('2026-10-09', '2026-10-15'), 'since Friday') // 6 days back: still a weekday
assert.equal(sinceText('2026-10-08', '2026-10-15'), 'since 8 Oct') // 7 days back: a date

// AC 1: questions, same wording for both habits
assert.equal(questionText('SNACK', '2026-10-15', '2026-10-15'), 'Did you have any snacks today?')
assert.equal(questionText('ALCOHOL', '2026-10-14', '2026-10-15'), 'Did you have any alcohol since yesterday?')

// AC 2: praise
assert.equal(praiseText({ habit: 'SNACK', current: 5 }), '5 days snack-free! So proud of you 💜')
assert.equal(praiseText({ habit: 'ALCOHOL', current: 1 }), '1 day alcohol-free! So proud of you 💜')
assert.equal(praiseText({ habit: 'SNACK', current: 0 }), CHECKIN_THANKS)

// AC 3: start over — best always quoted, "so far" only after a backdated lapse
assert.equal(startOverText({ current: 0, best: 9 }), 'We can start over 💜 your best is still 9.')
assert.equal(startOverText({ current: 1, best: 9 }), 'We can start over 💜 1 day so far, your best is still 9.')
assert.equal(startOverText({ current: 2, best: 0 }), 'We can start over 💜 2 days so far, your best is still 0.')

// habitsToAsk — HABIT_ORDER, not array order; only askToday
assert.deepEqual(habitsToAsk([{ habit: 'ALCOHOL', askToday: true }, { habit: 'SNACK', askToday: true }]), ['SNACK', 'ALCOHOL'])
assert.deepEqual(habitsToAsk([{ habit: 'SNACK', askToday: false }, { habit: 'ALCOHOL', askToday: true }]), ['ALCOHOL'])
assert.deepEqual(habitsToAsk([{ habit: 'SNACK', askToday: false }, { habit: 'ALCOHOL', askToday: false }]), [])
assert.deepEqual(habitsToAsk(null), [])

// AC 4: snooze lasts for the day it was set only
assert.equal(isSnoozedToday('2026-10-15', '2026-10-15'), true)
assert.equal(isSnoozedToday('2026-10-14', '2026-10-15'), false)
assert.equal(isSnoozedToday(null, '2026-10-15'), false)

console.log('habitCheckIn: all checks passed')
```

- [x] **Step 2: Register the script**

In `foodbytes-app/client/package.json` → `scripts`, add after the `check:fridge` line:

```json
    "check:checkin": "node src/utils/habitCheckIn.check.mjs",
```

- [x] **Step 3: Run it**

Run: `cd foodbytes-app\client; npm run check:checkin`
Expected: `habitCheckIn: all checks passed`

### Task 5: Per-user "Not now" marker in `checkInSnoozeStore.js` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/checkInSnoozeStore.js`

- [x] **Step 1: Write the store (mirrors `pipSeenStore.js`)**

```js
import { CHECKIN_SNOOZE_STORAGE_KEY } from '../constants/pet.js'

// userId → 'YYYY-MM-DD'. Survives route changes but not a reload, so when storage is
// unavailable "Not now" still holds for this page load (MPP-21 AC 4).
const memory = new Map()

const keyFor = (userId) => `${CHECKIN_SNOOZE_STORAGE_KEY}.${userId}`

/** MPP-21: the day this user last tapped "Not now" in this browser, or null. Memory wins over storage. */
export function readSnoozedOn(userId) {
  if (memory.has(userId)) return memory.get(userId)
  try {
    return localStorage.getItem(keyFor(userId))
  } catch {
    // Storage disabled or blocked: nothing snoozed beyond this page load.
    return null
  }
}

/** Records the day in memory always, and in localStorage when it is available. */
export function writeSnoozedOn(userId, todayISO) {
  memory.set(userId, todayISO)
  try {
    localStorage.setItem(keyFor(userId), todayISO)
  } catch {
    // Storage disabled or full: the memory copy above still snoozes this page load.
  }
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 2 — The check-in hook and the bubble

Adds the hook, the bubble controls, the bubble's new markup in `PetRoom`, `todayISO` on `PetContext`, and the wiring in `PetView`. Each task leaves the build green: `PetRoom`'s new `bubbleActions` prop defaults to `null`, so it renders as before until `PetView` passes it in the last task.

### Task 6: Expose `todayISO` from `PetContext` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/contexts/PetContext.jsx:164-175`

- [x] **Step 1: Add `todayISO` to the context value and the doc comment**

In the `value` object, add `todayISO,` directly after `fridge,`:

```js
  const value = {
    pet,
    petName: pet?.name ?? null,
    mood: moodInfo.mood,
    moodInfo,
    position,
    fridge,
    todayISO,
    loading: petLoading || planLoading,
    error: petError || planError,
    retry,
    renamePet
  }
```

Append to the provider's JSDoc block (before the closing `*/`, after the MPP-19 paragraph):

```js
 *
 * MPP-21: `todayISO` (the same minute clock's local date) so the check-in bubble re-asks
 * after midnight without a second clock.
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: `useHabitCheckIn` hook ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useHabitCheckIn.js`

- [x] **Step 1: Write the hook**

```js
import { useEffect, useRef, useState } from 'react'
import habitService from '../services/habitService'
import {
  CHECKIN_REACTION_MS,
  CHECKIN_SAVE_FAILED,
  CHECKIN_SNOOZE_REPLY,
  CHECKIN_STEPS,
  CHECKIN_WHEN_PROMPT
} from '../constants/pet'
import { habitsToAsk, isSnoozedToday, praiseText, questionText, startOverText } from '../utils/habitCheckIn'
import { readSnoozedOn, writeSnoozedOn } from '../utils/checkInSnoozeStore'

// forDay: the todayISO this check-in was loaded for; an answer that lands after midnight is dropped.
const IDLE = { forDay: null, statuses: {}, queue: [], step: null, reaction: null, busy: false, interacted: false }

/**
 * MPP-21: Pip's once-a-day snack / alcohol check-in, asked in his speech bubble.
 * Loads the caller's MPP-20 statuses on mount and on date rollover, asks each habit whose
 * askToday is true (snacks, then alcohol), posts each answer and keeps a kind reaction.
 * "Not now" snoozes both questions until tomorrow in this browser (AC 4).
 *
 * A failed load shows no check-in, so the usual bubble speaks and the next visit asks again
 * (ticket). A failed answer says so gently and ends the check-in; nothing is marked answered.
 *
 * @param {{ userId: number|null, todayISO: string }} input
 * @returns {{ text: string, actions: Object|null } | null} null when Pip has nothing to ask or say
 */
export function useHabitCheckIn({ userId, todayISO }) {
  const [state, setState] = useState(IDLE)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    setState(IDLE)
    if (userId == null || isSnoozedToday(readSnoozedOn(userId), todayISO)) return undefined
    const controller = new AbortController()
    habitService.getHabits({ signal: controller.signal })
      .then(list => {
        const queue = habitsToAsk(list)
        if (queue.length === 0) return
        const statuses = Object.fromEntries(list.map(status => [status.habit, status]))
        setState({ ...IDLE, forDay: todayISO, statuses, queue, step: { kind: CHECKIN_STEPS.ASK, habit: queue[0] } })
      })
      .catch(() => {
        // Cancelled or failed: no check-in this visit. Nothing is cached, so the next mount asks again.
      })
    return () => controller.abort()
  }, [userId, todayISO])

  // The last reaction (no question under it) clears itself so the usual bubble returns.
  const ended = state.step === null && state.reaction !== null
  useEffect(() => {
    if (!ended) return undefined
    const timerId = setTimeout(() => setState(current => ({ ...current, reaction: null })), CHECKIN_REACTION_MS)
    return () => clearTimeout(timerId)
  }, [ended, state.reaction])

  const { step } = state
  if (!step && !state.reaction) return null

  const forDay = state.forDay
  // A write is never aborted; a result for an unmounted view or an earlier day is dropped.
  const submit = async (habit, body, reactionFor) => {
    setState(current => ({ ...current, busy: true, interacted: true }))
    try {
      const status = await habitService.answerHabit(habit, body)
      if (!mountedRef.current) return
      setState(current => {
        if (current.forDay !== forDay) return current
        const queue = current.queue.filter(h => h !== habit)
        return {
          ...current,
          statuses: { ...current.statuses, [habit]: status },
          queue,
          step: queue.length ? { kind: CHECKIN_STEPS.ASK, habit: queue[0] } : null,
          reaction: reactionFor(status),
          busy: false
        }
      })
    } catch {
      if (!mountedRef.current) return
      setState(current => (current.forDay !== forDay
        ? current
        : { ...current, queue: [], step: null, reaction: CHECKIN_SAVE_FAILED, busy: false }))
    }
  }

  const prompt = !step
    ? null
    : step.kind === CHECKIN_STEPS.ASK
      ? questionText(step.habit, state.statuses[step.habit].coversFrom, todayISO)
      : CHECKIN_WHEN_PROMPT
  const text = [state.reaction, prompt].filter(Boolean).join(' ')

  const actions = step && {
    step: step.kind,
    habit: step.habit,
    coversFrom: state.statuses[step.habit].coversFrom,
    todayISO,
    busy: state.busy,
    focusFirst: state.interacted,
    onNo: () => submit(step.habit, { clean: true }, praiseText),
    onYes: () => setState(current => ({ ...current, step: { kind: CHECKIN_STEPS.WHEN, habit: step.habit }, reaction: null, interacted: true })),
    onBack: () => setState(current => ({ ...current, step: { kind: CHECKIN_STEPS.ASK, habit: step.habit }, interacted: true })),
    onSave: (lapseDate) => submit(step.habit, { clean: false, lapseDate }, startOverText),
    onNotNow: () => {
      writeSnoozedOn(userId, todayISO)
      setState(current => ({ ...current, queue: [], step: null, reaction: CHECKIN_SNOOZE_REPLY, interacted: true }))
    }
  }

  return { text, actions: actions || null }
}

export default useHabitCheckIn
```

- [x] **Step 2: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\hooks\useHabitCheckIn.js | Measure-Object -Line).Lines`
Expected: `built in <n>s`, no errors; line count under 200.

### Task 8: `CheckInActions` — the bubble's buttons and labelled date form ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/CheckInActions.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/CheckInActions.css`

- [x] **Step 1: Write the component**

```jsx
import { useEffect, useId, useRef } from 'react'
import { CHECKIN_STEPS, HABIT_QUESTION_NOUN } from '../../../constants/pet'
import './CheckInActions.css'

/**
 * MPP-21: the controls under Pip's check-in question, inside his speech bubble (AC 5:
 * nothing outside the room). Ask step: No 🙌 / Yes / Not now. When step: a labelled date
 * input (today by default, coversFrom … today) with Save and Back.
 * After the user's own action, focus moves to the new step's first control; it is never
 * stolen when the first question appears on load.
 */
function CheckInActions({ step, habit, coversFrom, todayISO, busy, focusFirst, onNo, onYes, onNotNow, onBack, onSave }) {
  const firstRef = useRef(null)
  const inputId = `pip-checkin-date-${useId().replace(/:/g, '')}`

  useEffect(() => {
    if (focusFirst) firstRef.current?.focus()
  }, [step, habit, focusFirst])

  if (step === CHECKIN_STEPS.WHEN) {
    const handleSubmit = (event) => {
      event.preventDefault()
      onSave(event.currentTarget.elements.lapseDate.value)
    }
    return (
      <form className="pip-checkin-actions" onSubmit={handleSubmit}>
        <label className="pip-checkin-sr" htmlFor={inputId}>{`Day you had ${HABIT_QUESTION_NOUN[habit]}`}</label>
        <input
          key={habit}
          ref={firstRef}
          id={inputId}
          name="lapseDate"
          className="pip-checkin-date"
          type="date"
          min={coversFrom}
          max={todayISO}
          defaultValue={todayISO}
          required
        />
        <button type="submit" className="pip-checkin-btn pip-checkin-btn--primary" disabled={busy}>Save</button>
        <button type="button" className="pip-checkin-btn pip-checkin-btn--link" disabled={busy} onClick={onBack}>Back</button>
      </form>
    )
  }

  return (
    <div className="pip-checkin-actions" role="group" aria-label={`Did you have any ${HABIT_QUESTION_NOUN[habit]}?`}>
      <button ref={firstRef} type="button" className="pip-checkin-btn pip-checkin-btn--primary" disabled={busy} onClick={onNo}>
        No 🙌
      </button>
      <button type="button" className="pip-checkin-btn" disabled={busy} onClick={onYes}>Yes</button>
      <button type="button" className="pip-checkin-btn pip-checkin-btn--link" disabled={busy} onClick={onNotNow}>Not now</button>
    </div>
  )
}

export default CheckInActions
```

- [x] **Step 2: Write the styles (mockup v5 `.bubble .bb`, 44 px targets)**

```css
/* MPP-21: check-in controls inside Pip's speech bubble (mockup v5 .bubble .bb).
   Every control is at least 44 px tall; hover only where hover exists. */

.pip-checkin-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 7px;
}

.pip-checkin-btn {
  min-width: 44px;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid #ddd6ee;
  border-radius: 999px;
  background: #fff;
  color: inherit;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.pip-checkin-btn--primary {
  border-color: #7c5cd6;
  background: #7c5cd6;
  color: #fff;
}

.pip-checkin-btn--link {
  padding: 0 6px;
  border-color: transparent;
  background: none;
  color: #5c5670;
  font-weight: 500;
  text-decoration: underline;
}

.pip-checkin-btn:active { filter: brightness(0.92); }

@media (hover: hover) {
  .pip-checkin-btn:hover { filter: brightness(0.96); }
}

.pip-checkin-btn:focus-visible,
.pip-checkin-date:focus-visible {
  outline: 3px solid #ffd34d;
  outline-offset: 2px;
}

.pip-checkin-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.pip-checkin-date {
  min-height: 44px;
  padding: 0 6px;
  border: 1px solid #ddd6ee;
  border-radius: 8px;
  font: inherit;
  font-size: 0.78rem;
}

/* The bubble already shows "When did you have it?"; this label is for screen readers (AC 5). */
.pip-checkin-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 9: `PetRoom` — `SpeechBubble` with a persistent live region and a `bubbleActions` slot ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx:1` (import), `:14-24` (doc + signature), `:58` (bubble)
- Modify: `foodbytes-app/client/src/components/pet/PetView.css:10-35`

- [x] **Step 1: Update the import, doc comment and signature**

Line 1 becomes:

```js
import { useEffect, useId, useRef } from 'react'
```

Append to the component JSDoc (before ` */` on line 23):

```js
 * MPP-21: the bubble is a SpeechBubble — a live-region line of text plus optional
 * `bubbleActions` (the check-in controls) under it.
```

Line 24 becomes:

```js
function PetRoom({ name, mood, bubble, bubbleActions = null, position = PIP_POSITIONS.RUG, levels = DEFAULT_ROOM_LEVELS, serving = null, fridge = null }) {
```

- [x] **Step 2: Replace the bubble `<p>` (line 58)**

Replace:

```jsx
        <p className="pet-bubble" aria-live="polite">{bubble}</p>
```

with:

```jsx
        <SpeechBubble text={bubble} actions={bubbleActions} />
```

- [x] **Step 3: Add the `SpeechBubble` component after `PipWalker`**

```jsx
// MPP-21: the text line stays mounted so screen readers hear each new line without the
// buttons being re-read. When the controls go away under a keyboard user (answered,
// snoozed, or hidden by the cook scene), focus lands on the bubble instead of <body>.
function SpeechBubble({ text, actions }) {
  const bubbleRef = useRef(null)
  const hadActionsRef = useRef(false)

  useEffect(() => {
    const hasActions = actions != null
    if (hadActionsRef.current && !hasActions && document.activeElement === document.body) {
      bubbleRef.current?.focus()
    }
    hadActionsRef.current = hasActions
  })

  return (
    <div ref={bubbleRef} className={actions ? 'pet-bubble is-asking' : 'pet-bubble'} tabIndex={-1}>
      <p className="pet-bubble-text" aria-live="polite">{text}</p>
      {actions}
    </div>
  )
}
```

- [x] **Step 4: Bubble styles in `PetView.css`**

Directly after the `.pet-bubble::after { … }` block (ends line 35), add:

```css
/* MPP-21: the bubble holds a text line and, while Pip asks, the check-in controls. */
.pet-bubble-text {
  margin: 0;
}

.pet-bubble.is-asking {
  max-width: min(230px, 62%);
}

/* Focus lands here only programmatically (SpeechBubble), never by Tab. */
.pet-bubble:focus {
  outline: none;
}
```

- [x] **Step 5: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines`
Expected: `built in <n>s`, no errors; line count under 200.

### Task 10: `PetView` — wire the check-in and the bubble priority ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx`

- [x] **Step 1: Imports**

After `import PetNameEditor from './PetNameEditor'` add:

```js
import CheckInActions from './room/CheckInActions'
```

After `import useCookAndServe from '../../hooks/useCookAndServe'` add:

```js
import useHabitCheckIn from '../../hooks/useHabitCheckIn'
```

- [x] **Step 2: Doc comment, context read and hook call**

Append to the component JSDoc (before ` */`):

```js
 * MPP-21: Pip's daily snack / alcohol check-in speaks in the bubble (cook > check-in > fridge-low > mood);
 * the cook scene hides it without resetting it.
```

Replace:

```js
  const { pet, mood, moodInfo, position, fridge, error, retry, renamePet } = usePet()
```

with:

```js
  const { pet, mood, moodInfo, position, fridge, todayISO, error, retry, renamePet } = usePet()
```

Directly after the `useCookAndServe({ … })` call (before `if (!isAuthenticated)`), add:

```js
  const checkIn = useHabitCheckIn({ userId: pet ? user?.id ?? null : null, todayISO })
```

- [x] **Step 3: Bubble priority and actions**

Directly before `return (` of the main view (after the `if (!pet)` block), add:

```js
  // The cook scene outranks the check-in, which outranks the fridge-low and mood lines.
  const asking = serving ? null : checkIn
  const bubble = (serving && cookServeBubble(serving)) ?? asking?.text ?? fridgeBubble(fridge.fill, position) ?? petBubble(moodInfo)
  const bubbleActions = asking?.actions ? <CheckInActions {...asking.actions} /> : null
```

Replace the `<PetRoom … />` props:

```jsx
      <PetRoom
        name={pet.name}
        mood={mood}
        bubble={bubble}
        bubbleActions={bubbleActions}
        position={position}
        serving={serving}
        fridge={fridge}
      />
```

- [x] **Step 4: Build and re-run every node check**

Run: `cd foodbytes-app\client; npm run build; npm run check:checkin; npm run check:pet; npm run check:room; npm run check:cook; npm run check:fridge`
Expected: `built in <n>s`, no errors; each check prints its pass line, none throws.

---

## Phase 3 — Final verification

No production changes beyond the version bump — only checks that the cumulative work is clean, plus the developer's hands-on check. MPP-21 touches no Java, so the full backend suite is not re-run (no backend file changes; MPP-20 left it green).

### Task 11: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-21 is a **Story** → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`:
`<new version> — MPP-21: Pip's daily snack / alcohol check-in in his speech bubble (No / Yes + date / Not now), kind reactions`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 12: Grep audits and line budget ✓

- Skill: react-frontend

- [x] **Step 1: No debug logging in the new files**

Run: `Select-String -Path foodbytes-app\client\src\services\habitService.js,foodbytes-app\client\src\utils\habitCheckIn.js,foodbytes-app\client\src\utils\checkInSnoozeStore.js,foodbytes-app\client\src\hooks\useHabitCheckIn.js,foodbytes-app\client\src\components\pet\room\CheckInActions.jsx -Pattern "console\.(log|debug)"`
Expected: zero hits.

- [x] **Step 2: No direct axios or hardcoded backend URL in components/hooks**

Run: `Get-ChildItem -Path foodbytes-app\client\src\components,foodbytes-app\client\src\hooks -Recurse -Include *.js,*.jsx | Select-String -Pattern "from 'axios'|localhost:8080"`
Expected: zero hits.

- [x] **Step 3: No check-in UI outside the room (AC 5)**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.jsx | Select-String -Pattern "CheckInActions" | Select-Object Path -Unique`
Expected: only `CheckInActions.jsx` and `PetView.jsx` (rendered into `PetRoom`'s bubble).

- [x] **Step 4: Line budget**

Run: `foreach ($f in 'src\hooks\useHabitCheckIn.js','src\components\pet\room\CheckInActions.jsx','src\components\pet\room\PetRoom.jsx','src\components\pet\PetView.jsx','src\contexts\PetContext.jsx','src\utils\habitCheckIn.js') { "$f $((Get-Content (Join-Path foodbytes-app\client $f) | Measure-Object -Line).Lines)" }`
Expected: every file under 400 lines; the new ones under 200.

### Task 13: Production build ✓

- Skill: react-frontend

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 14: Manual check at the app (developer) — pending developer (Ready for Test)

- Skill: none — hands-on check by the developer; there is no frontend test runner

- [ ] **Step 1: Run the stack locally**

Backend per `CLAUDE.md` → "Running the backend locally with Google login" (local `foodbytes-db` has MPP-20's tables, 0 rows, so every user is asked). Frontend: `cd foodbytes-app\client; npm run dev`, open `http://localhost:5173/pet`, signed in.

- [ ] **Step 2: Walk the flow**

Expected, in order:
1. Bubble asks "Did you have any snacks today?" with **No 🙌 / Yes / Not now**; nothing new appears under the room.
2. **No 🙌** → "1 day snack-free! So proud of you 💜 Did you have any alcohol today?"
3. **Yes** → "That's ok! When did you have it?" with a date (today, min/max today), **Save**, **Back**; **Back** returns to the question.
4. **Yes → Save** → "We can start over 💜 your best is still 0." which clears after ~8 s to the usual bubble.
5. Reload `/pet` → no question (both answered today).
6. With a fresh user (or after `DELETE FROM pet_habit_streaks; DELETE FROM pet_habit_days;` on the **local** `foodbytes-db` only), tap **Not now** → "No worries, I'll ask tomorrow 💜"; reload → not asked.
7. Keyboard only: Tab reaches each button and the date input; after each answer focus is on the next control, never lost; a screen reader announces the date input as "Day you had snacks".
8. DevTools → 320 px wide: no horizontal scroll; the bubble does not hide the fridge button (if it does, flag it — see plan Risks).
9. Stop the backend and reload `/pet`: Pip shows his normal greeting, no check-in, no error banner.

### Task 15: Write the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-21-pip-check-in-bubble/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary of the change and the new version from Task 11.
- Migrations: none for MPP-21; it depends on MPP-20's `2026-10-13-mpp20-pet-habit-streaks.sql` (order 2 in `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`) being on Railway before the epic deploys.
- Verification results: build, every `check:*` script, grep audits, line counts, and which manual-check items the developer confirmed.
- Convention note: Pip's bubble is now `SpeechBubble` — a persistent live-region line plus an optional `bubbleActions` slot; later bubble interactions (MPP-22 awards) should use the slot rather than adding UI under the room.
- Suggested commit subject: `MPP-21: Pip's daily snack and alcohol check-in in his speech bubble`.

---

## Self-review

**Spec coverage:**
- Service over MPP-20's endpoints — Task 2.
- Pure wording/queue rules + node check + `check:checkin` — Tasks 3, 4.
- Per-user "Not now" marker — Task 5.
- `useHabitCheckIn` state machine (AC 1–4, error fallback, rollover) — Task 7.
- `CheckInActions` controls, labelled date input, keyboard focus (AC 1, 3, 5) — Task 8.
- `PetRoom` bubble container with live region + actions slot — Task 9.
- `PetView` wiring and bubble priority (cook > check-in > fridge-low > mood) — Task 10.
- `PetContext` exposes `todayISO` — Task 6.
- Constants in `constants/pet.js` — Task 1.
- Version bump (Story → MINOR) + CHANGELOG — Task 11.
- AC 5 "nothing outside the room" — Task 12 Step 3, Task 14 Step 2.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, or "similar to Task N". Every step shows the exact code or a `Run:` / `Expected:` pair; the version number is computed at apply time by design.

**Type / name consistency:** `HABITS`, `HABIT_ORDER`, `HABIT_QUESTION_NOUN`, `HABIT_FREE_LABEL`, `CHECKIN_STEPS`, `CHECKIN_REACTION_MS`, `CHECKIN_WEEKDAY_SPAN_DAYS`, `CHECKIN_SNOOZE_STORAGE_KEY`, `CHECKIN_WHEN_PROMPT`, `CHECKIN_SNOOZE_REPLY`, `CHECKIN_SAVE_FAILED`, `CHECKIN_THANKS` (Task 1) are the names used in Tasks 3–8. `habitService.getHabits` / `answerHabit` (Task 2) are used in Task 7. `readSnoozedOn` / `writeSnoozedOn` (Task 5) in Task 7. The hook's `actions` keys (`step, habit, coversFrom, todayISO, busy, focusFirst, onNo, onYes, onNotNow, onBack, onSave`) match `CheckInActions`' props (Task 8). `bubbleActions` (Task 9) is the prop passed in Task 10. `todayISO` (Task 6) is read in Task 10. JSON keys match `HabitStatusDTO`. `HABITS` is declared for completeness and parity with the server enum; it is also the source of `HABIT_ORDER`.

**Phase boundary cleanliness:**
- Phase 1 — new modules only, nothing imports them yet; build green, behaviour unchanged.
- Phase 2 — each task builds green: `todayISO` is an additive context key, the hook and `CheckInActions` are unused until Task 10, and `PetRoom`'s `bubbleActions` defaults to `null` so the bubble renders text as before until `PetView` passes it.
- Phase 3 — version bookkeeping and read-only checks; no production behaviour changes.
