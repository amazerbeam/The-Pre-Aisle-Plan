# Tasks: Marking a meal as eaten takes you straight to Pip

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-14

**Goal:** After the server confirms "Mark as eaten" on a breakfast, lunch or dinner dated today or yesterday, show "✓ Eaten" for about 600 ms and then push `/pet`, where MPP-18's cook-and-serve scene plays. Never navigate on failure, Undo, for a guest, or for uncounted meal types, and remove the now-pointless inline `PetReaction`.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/client/src/hooks/useTakeToPip.js`: owns the 600 ms beat timer and the navigation to `/pet`

**Modified:**
- `foodbytes-app/client/src/constants/pet.js`: add `PET_ROUTE`, `PIP_HANDOFF_DELAY_MS`
- `foodbytes-app/client/src/utils/cookServe.js`: add `shouldTakeToPip`
- `foodbytes-app/client/src/utils/cookServe.check.mjs`: assert `shouldTakeToPip`
- `foodbytes-app/client/src/contexts/PetContext.jsx:170-182`: expose `yesterdayISO`
- `foodbytes-app/client/src/components/recipes/MealEatenSection.jsx`: schedule/cancel the hand-off, drop `PetReaction`
- `foodbytes-app/client/src/components/recipes/MealEatenSection.css`: reduced-motion guard on `.eaten-btn`
- `foodbytes-app/client/src/utils/petMood.js:70-79`: delete `shouldShowPetReaction`, `petReactionText`
- `foodbytes-app/client/src/utils/petMood.check.mjs`: drop their import and asserts
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md`: version bump

**Deleted:**
- `foodbytes-app/client/src/components/pet/PetReaction.jsx`
- `foodbytes-app/client/src/components/pet/PetReaction.css`

---

## Phase 1 — Hand-off rule and constants

This phase only adds things: two constants and a pure helper with node asserts. Nothing calls them yet, so the app behaves exactly as before and the build stays green.

### Task 1: Add `PET_ROUTE` and `PIP_HANDOFF_DELAY_MS` to `constants/pet.js` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/pet.js:83-85`

- [x] **Step 1: Append the constants directly below `PIP_SEEN_EATEN_STORAGE_KEY`**

```js
// MPP-34: a confirmed eaten tick hands off to Pip's room after a short "✓ Eaten" beat (AC 2).
export const PET_ROUTE = '/pet'
export const PIP_HANDOFF_DELAY_MS = 600
```

- [x] **Step 2: Verify the module still loads**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {PET_ROUTE, PIP_HANDOFF_DELAY_MS} from './src/constants/pet.js'; console.log(PET_ROUTE, PIP_HANDOFF_DELAY_MS)"`
Expected: `/pet 600`

### Task 2: Add `shouldTakeToPip` to `utils/cookServe.js`, pinned by `check:cook` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/utils/cookServe.js`
- Modify: `foodbytes-app/client/src/utils/cookServe.check.mjs`

- [x] **Step 1: Write the failing asserts**

In `cookServe.check.mjs`, change the import line to:
```js
import { shouldServe, cookServeSchedule, cookServeBubble, shouldTakeToPip } from './cookServe.js'
```
and insert directly above `console.log('cook-and-serve checks passed')`:
```js
// MPP-34: hand off to Pip only when MPP-18 will play for the tick.
const TODAY_ISO = '2026-10-14'
const YESTERDAY_ISO = '2026-10-13'
const handoff = (over) => shouldTakeToPip({
  isAuthenticated: true, petReady: true, mealType: 'lunch',
  planDate: TODAY_ISO, todayISO: TODAY_ISO, yesterdayISO: YESTERDAY_ISO, ...over
})
assert.equal(handoff({}), true)
assert.equal(handoff({ mealType: 'breakfast' }), true)
assert.equal(handoff({ mealType: 'dinner' }), true)
assert.equal(handoff({ planDate: YESTERDAY_ISO }), true)            // catching up on yesterday still plays
assert.equal(handoff({ mealType: 'snacks' }), false)                // AC 3: uncounted types stay put
assert.equal(handoff({ mealType: 'extras' }), false)
assert.equal(handoff({ isAuthenticated: false }), false)            // AC 4: guest
assert.equal(handoff({ petReady: false }), false)                   // no Pip loaded → no scene to see
assert.equal(handoff({ planDate: '2026-10-12' }), false)            // outside MPP-18's yesterday+today window
assert.equal(handoff({ planDate: '2026-10-15' }), false)            // a future day
```

- [x] **Step 2: Run it and watch it fail**

Run: `cd foodbytes-app\client; npm run check:cook`
Expected: fails with a `SyntaxError` naming `shouldTakeToPip` as a missing export of `./cookServe.js`.

- [x] **Step 3: Implement the helper**

In `cookServe.js`, change the constants import to:
```js
import { COOK_PHASES, COOK_PHASE_MS, COOK_REDUCED_MOTION_SERVED_MS, PET_COUNTED_MEAL_TYPES } from '../constants/pet.js'
```
and append below `cookServeBubble`:
```js
/**
 * MPP-34: after a confirmed eaten tick, hand off to Pip only when MPP-18 will play for it —
 * a signed-in viewer with a loaded Pip, a counted meal type, planned for today or yesterday
 * (the window derivePetMood reads lastLoggedAt from).
 */
export function shouldTakeToPip({ isAuthenticated, petReady, mealType, planDate, todayISO, yesterdayISO }) {
  return isAuthenticated === true
    && petReady === true
    && PET_COUNTED_MEAL_TYPES.includes(mealType)
    && (planDate === todayISO || planDate === yesterdayISO)
}
```

- [x] **Step 4: Run it and watch it pass**

Run: `cd foodbytes-app\client; npm run check:cook`
Expected: `cook-and-serve checks passed`

---

## Phase 2 — Wire the hand-off and remove the inline reaction

This phase exposes `yesterdayISO`, adds the timer hook, switches `MealEatenSection` over, and then deletes the dead `PetReaction` code. The phase ends with the app navigating as specified, no references to removed symbols, and a green build.

### Task 3: Expose `yesterdayISO` from `PetContext` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/contexts/PetContext.jsx:170-182`

- [x] **Step 1: Add it to the provider value, next to `todayISO`**

```js
    todayISO,
    yesterdayISO,
```
(`yesterdayISO` is already computed at line 50 as `formatDateISO(addDays(now, -1))`. Do not recompute it.)

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 4: Create the `useTakeToPip` hook ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/hooks/useTakeToPip.js`

- [x] **Step 1: Write the hook**

```js
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PET_ROUTE, PIP_HANDOFF_DELAY_MS } from '../constants/pet'

/**
 * MPP-34: after a confirmed eaten tick, wait a short beat so "✓ Eaten" registers, then push
 * /pet (a normal history entry, so Back returns to the meal plan — AC 5). Leaving the meal
 * plan unmounts the recipe modal, which closes it. cancel() (Undo) or unmounting (modal
 * closed during the beat) clears the timer, so nothing navigates (AC 4).
 * The beat is the same under reduced motion; there is no route transition to suppress (AC 2).
 *
 * @returns {{ schedule: () => void, cancel: () => void }}
 */
export function useTakeToPip() {
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!pending) return undefined
    const timerId = setTimeout(() => navigate(PET_ROUTE), PIP_HANDOFF_DELAY_MS)
    return () => clearTimeout(timerId)
  }, [pending, navigate])

  return { schedule: () => setPending(true), cancel: () => setPending(false) }
}

export default useTakeToPip
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 5: Hand off from `MealEatenSection` and drop the inline `PetReaction` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/MealEatenSection.jsx`
- Modify: `foodbytes-app/client/src/components/recipes/MealEatenSection.css:100-117`

- [x] **Step 1: Replace the imports (lines 1–7)**

```js
import { useState } from 'react'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
import { usePet } from '../../contexts/PetContext'
import { MEAL_TYPE_LABELS } from '../../constants/mealTypes'
import { formatLongWeekday } from '../../utils/dateUtils'
import { shouldTakeToPip } from '../../utils/cookServe'
import useTakeToPip from '../../hooks/useTakeToPip'
import './MealEatenSection.css'
```

- [x] **Step 2: Update the JSDoc and hooks at the top of the component**

Append to the existing JSDoc block (before ` */`):
```
 * MPP-34: once the server confirms a counted tick (today/yesterday), the button holds "✓ Eaten"
 * for a beat and the app moves to Pip's room, where MPP-18 cooks it. Undo cancels the move.
```
Replace the hook lines at the top of `MealEatenSection` with:
```js
  const { getEntryById, setEntryEaten } = useMealPlan()
  const { isAuthenticated } = useAuth()
  const { pet, todayISO, yesterdayISO } = usePet()
  const takeToPip = useTakeToPip()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
```
(The hooks stay above the `if (!entry) return null` early return, as they are today.)

- [x] **Step 3: Replace `save` so it schedules only on confirmation and Undo cancels first**

```js
  const save = async (next) => {
    if (saving) return
    if (!next) takeToPip.cancel() // AC 4: Undo during the beat stays on the recipe
    setSaving(true)
    setError(null)
    try {
      await setEntryEaten(entryId, next)
      // Resolved = the server confirmed (AC 1); a failure throws below and never navigates (AC 4).
      if (next && shouldTakeToPip({
        isAuthenticated,
        petReady: pet != null,
        mealType: entry.mealType,
        planDate: entry.planDate,
        todayISO,
        yesterdayISO
      })) {
        takeToPip.schedule()
      }
    } catch {
      // The context already rolled back and raised the toast; the toast can sit behind
      // this full-screen modal, so repeat the failure inline.
      setError(SAVE_ERROR)
    } finally {
      setSaving(false)
    }
  }
```

- [x] **Step 4: Remove the inline reaction from the JSX**

Delete these lines (currently 70–72):
```jsx
      {shouldShowPetReaction({ eaten, mealType: entry.mealType }) && (
        <PetReaction mealType={entry.mealType} />
      )}
```

- [x] **Step 5: Stop the button's colour fade under reduced motion (AC 2)**

Append to `MealEatenSection.css`:
```css
/* MPP-34 AC 2: the hand-off beat stays, but nothing animates under reduced motion */
@media (prefers-reduced-motion: reduce) {
  .eaten-btn {
    transition: none;
  }
}
```

- [x] **Step 6: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\recipes\MealEatenSection.jsx | Measure-Object -Line).Lines`
Expected: `built in <n>s` with no errors; line count under 200.

### Task 6: Delete `PetReaction` and its now-dead helpers ✓

- Skill: react-frontend

**Files:**
- Delete: `foodbytes-app/client/src/components/pet/PetReaction.jsx`
- Delete: `foodbytes-app/client/src/components/pet/PetReaction.css`
- Modify: `foodbytes-app/client/src/utils/petMood.js:70-79`
- Modify: `foodbytes-app/client/src/utils/petMood.check.mjs`

- [x] **Step 1: Confirm there are no remaining callers**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.mjs | Select-String -Pattern "PetReaction|petReactionText|shouldShowPetReaction"`
Expected: hits only in `components/pet/PetReaction.jsx`, `utils/petMood.js` and `utils/petMood.check.mjs`, and none in `MealEatenSection.jsx`.

- [x] **Step 2: Delete the component files**

Run: `Remove-Item foodbytes-app\client\src\components\pet\PetReaction.jsx, foodbytes-app\client\src\components\pet\PetReaction.css`

- [x] **Step 3: Remove the two helpers from `petMood.js`**

Delete these blocks (the imports of `MEAL_TYPE_LABELS` and `PET_COUNTED_MEAL_TYPES` stay, because both are still used elsewhere in the file):
```js
/** AC 7: the reaction shows for an eaten breakfast/lunch/dinner entry, never a snack or extra. */
export function shouldShowPetReaction({ eaten, mealType }) {
  return eaten === true && PET_COUNTED_MEAL_TYPES.includes(mealType)
}

/** AC 7 reaction copy, e.g. "Pip is happy! Lunch logged." */
export function petReactionText({ petName, mealType }) {
  return `${petName} is happy! ${MEAL_TYPE_LABELS[mealType]} logged.`
}
```

- [x] **Step 4: Remove their asserts from `petMood.check.mjs`**

Change the import line to:
```js
import { derivePetMood, petBubble, petChipLabel } from './petMood.js'
```
and delete the block headed `// AC 7 reaction: eaten breakfast/lunch/dinner only (mealType is lowercase on the wire).`, which holds the six `shouldShowPetReaction` asserts and the `petReactionText` assert.

- [x] **Step 5: Run the pet checks and build**

Run: `cd foodbytes-app\client; npm run check:pet; npm run check:cook; npm run build`
Expected: both checks print their `passed` lines, and the build reports `built in <n>s` with no errors.

---

## Phase 3 — Final verification

No production changes beyond the version bump. These steps only sanity-check that the cumulative work is clean.

### Task 7 (M.1): Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-34 is a **Story**, so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and into `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-34: Marking a meal as eaten takes you straight to Pip`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 8 (M.2): Grep for stale references ✓

- Skill: none — verification only

**Files:** (none — read-only)

- [x] **Step 1: Confirm the removed symbols are gone**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.mjs,*.css | Select-String -Pattern "PetReaction|petReactionText|shouldShowPetReaction|pet-react"`
Expected: zero hits.

- [x] **Step 2: Confirm no new debug logging**

Run: `Select-String -Path foodbytes-app\client\src\hooks\useTakeToPip.js, foodbytes-app\client\src\components\recipes\MealEatenSection.jsx, foodbytes-app\client\src\utils\cookServe.js -Pattern "console\.(log|debug)"`
Expected: zero hits.

### Task 9 (M.3): Run the full backend test suite ✓

- Skill: none — verification only (the backend is touched only by the `pom.xml` version bump)

**Files:** (none — read-only)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 10 (M.4): Production build and node checks ✓

- Skill: none — verification only

**Files:** (none — read-only)

- [x] **Step 1: Build the client and rerun the pure-rule checks**

Run: `cd foodbytes-app\client; npm run check:cook; npm run check:pet; npm run build`
Expected: `cook-and-serve checks passed`, the pet checks' passed line, then `built in <n>s` with no errors.

### Task 11 (M.5): Manual check in the app (developer-owned)

- Skill: none — manual play-test; there is no frontend test runner

**Files:** (none — read-only)

- [ ] **Step 1: Walk the acceptance criteria at phone width (≈390 px) on `/mealplan`**

With the dev server and backend running and signed in, on a week containing today:
1. Open today's **lunch**, tap **Mark as eaten**. Expected: the button turns "✓ Eaten" for about 0.6 s, then the app is on `/pet`, the modal is gone, and Pip walks, cooks and serves lunch (AC 1, 2).
2. Reload `/pet`. Expected: the scene does not replay (AC 7).
3. Press browser **Back**. Expected: `/mealplan` with no modal open. Reopen lunch and **Undo** is available (AC 5).
4. Untick it, then tick it again and tap **Undo** within 0.6 s. Expected: you stay on the recipe and it shows unticked (AC 4).
5. Tick a **snack**/extras entry, if the week has one. Expected: you stay on the recipe (AC 3).
6. Tick a breakfast, lunch or dinner dated **two or more days ago**. Expected: you stay on the recipe (assumption 1).
7. Stop the backend, then tick a meal. Expected: it rolls back, the inline "Couldn't save — try again." shows, and there is no navigation (AC 4).
8. With OS reduced motion on, tick a meal. Expected: same beat, no colour fade, lands on `/pet` showing the served plate (AC 2).

### Task 12 (M.6): Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-34-eaten-meal-straight-to-pip/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- A link to `plan.md` in this folder.
- A summary of the change and the new version from Task 7.
- Migrations: none.
- Verification results from Phases 1–3 (`check:cook`, `check:pet`, build, `mvn test`) and the manual check status from Task 11.
- Note for future contributors: an eaten tick hands off to `/pet` via `useTakeToPip`. Any future surface that marks meals eaten should reuse `shouldTakeToPip` rather than re-deriving the rule. `PetReaction` no longer exists, so MPP-28 AC 4 needs its wording updated.
- Suggested commit subject: `MPP-34: Marking a meal as eaten takes you straight to Pip`

---

## Self-review

**Spec coverage:**
- Pure decision helper `shouldTakeToPip` + checks: Task 2 (and Task 1 constants).
- `useTakeToPip` hook (beat timer, cancel, navigate): Task 4.
- Wiring into `MealEatenSection` (schedule on confirmation, cancel on Undo/unmount): Task 5.
- Exposing `yesterdayISO` from `PetContext`: Task 3.
- Removing `PetReaction` + helpers + asserts: Tasks 5 (usage) and 6 (files/helpers).
- Reduced-motion guard: Task 5 Step 5.
- Version bump + CHANGELOG: Task 7.
- AC 1–7 behavioural check: Task 11.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N". Every step shows exact code or a runnable command. No `Test:` path under `client/` and no frontend test runner or linter. Bare `mvn test` appears only in Phase 3.

**Type / name consistency:** `PET_ROUTE`, `PIP_HANDOFF_DELAY_MS` (Task 1) are used in Task 4. `shouldTakeToPip({ isAuthenticated, petReady, mealType, planDate, todayISO, yesterdayISO })` is identical in plan.md Data shapes, Task 2 and Task 5. `useTakeToPip()` → `{ schedule, cancel }` is identical in Tasks 4 and 5. `yesterdayISO` is exposed in Task 3 and consumed in Task 5.

**Phase boundary cleanliness:**
- Phase 1 only adds unused exports plus asserts, so the build is green and behaviour is unchanged.
- Phase 2 switches `MealEatenSection` over before deleting `PetReaction` (Task 5 before Task 6), so there is never a dangling import; it ends with the checks and the build green.
- Phase 3 changes only version metadata and runs read-only verification.
