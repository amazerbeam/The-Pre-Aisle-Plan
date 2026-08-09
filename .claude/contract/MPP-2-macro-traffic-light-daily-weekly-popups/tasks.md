# Tasks: Add traffic-light macro targets to daily/weekly meal plan summary popups

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-08-08

**Residual review issues (round 2, logged not fixed — max 2 fix-review rounds reached):**
- Code-Evaluator + Defender (round 2, Warning-level, same root cause): wiring `displayedCaloriesPerServing` into `MacroTargetPopup` from `DailyMacroPopup`/`WeeklyMacroPopup` (added in the round-1 fix pass) activates the kcal-mismatch reconciliation banner in a context it wasn't written for — its hardcoded copy ("recipe card shows N kcal") is nonsensical outside a single-recipe view, and independent per-day/per-week rounding pipelines in the backend mean the exact-equality check will likely fire far more often at this scale than intended, turning a rare-bug signal into near-constant noise. Suggested fix (not applied): either stop passing `displayedCaloriesPerServing` from the two meal-plan popups, or add a scale-aware label prop and a tolerance-based threshold instead of exact equality.

**Goal:** Make the Protein/Carbs/Fat tiles in `DailyMacroPopup` and both sections of `WeeklyMacroPopup` clickable, opening the same `MacroTargetPopup` the recipe card uses, evaluated against new daily/weekly-scale targets (carbs/fat reused directly from the existing per-serving bands, protein a new 100g/day / 700g/week floor).

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- (none — no new files)

**Modified:**
- `foodbytes-app/client/src/constants/macroTargets.js` — add `DAILY_PROTEIN_FLOOR_G`, `WEEKLY_PROTEIN_FLOOR_G`, `MACRO_COPY.DAILY_NOTE`, `DAILY_MACRO_TARGETS`, `WEEKLY_MACRO_TARGETS`.
- `foodbytes-app/client/src/utils/macroStatus.js` — `bandFor`/`evaluateMacro` take an optional `targets` param, default `MACRO_TARGETS`.
- `foodbytes-app/client/src/utils/macroStatus.check.mjs` — assert the new protein band boundaries and extend the copy-hygiene loop to the two new target tables.
- `foodbytes-app/client/src/components/recipes/MacroTargetPopup.jsx` — new optional props `targets`, `periodLabel`, `footerNote`.
- `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.jsx` — clickable macro tiles, `openMacroKey` state, nested `MacroTargetPopup`, outside-click portal guard.
- `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.css` — `.macro-item` becomes an accessible button.
- `foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.jsx` — clickable macro tiles in both sections, `openMacro` state, nested `MacroTargetPopup`, outside-click portal guard.
- `foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.css` — `.macro-summary-item` becomes an accessible button.

**Deleted:** (none)

---

## Phase 1 — Evaluation layer: new target tables + scope-aware evaluation

This phase touches only pure, non-React modules (`macroTargets.js`, `macroStatus.js`, `macroStatus.check.mjs`). It ends with `node src/utils/macroStatus.check.mjs` passing — this project's substitute for a test runner — which is a genuine safe stopping point: no component imports these new exports yet, so nothing downstream can be affected by getting here wrong, and everything downstream depends on getting here right.

### Task 1: Add daily/weekly protein floor constants and the new footer copy ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/macroTargets.js`

- [x] **Step 1: Add the two floor constants directly below the existing `MACRO_KEYS` / `KCAL_PER_GRAM` exports**

```js
export const MACRO_KEYS = ['protein', 'carbs', 'fat']

/** kcal per gram — used for the derived-kcal denominator and each macro's share. */
export const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 }

/** Daily protein floor for the daily/weekly aggregate traffic light (FR-104
 *  extension, MPP-2). 700 = 7 × 100, used for the weekly-totals band. */
export const DAILY_PROTEIN_FLOOR_G = 100
export const WEEKLY_PROTEIN_FLOOR_G = DAILY_PROTEIN_FLOOR_G * 7 // 700
```

- [x] **Step 2: Add `DAILY_NOTE` to the existing `MACRO_COPY` object**

Locate the `MACRO_COPY` object and add one entry alongside `REJECT_PHRASE` / `REJECT_PILL` / `YOU_ARE_HERE` / `VARIANT_NOTE`:

```js
export const MACRO_COPY = {
  REJECT_PHRASE: ', rejected by the FoodBytes recipe standard',
  REJECT_PILL: 'Reject',
  YOU_ARE_HERE: 'You are here',
  VARIANT_NOTE: 'This target is the same for all three variants. Light, Moderate and Balanced differ on calories only — protein, fat % and carb % targets are identical across them.',
  /** Footer disclaimer for the daily/weekly aggregate popup — MPP-2. */
  DAILY_NOTE: 'This target is a fixed general default and is not personalized to your weight or goals.'
}
```

- [x] **Step 3: Compile check**

Run: `cd foodbytes-app\client; node --input-type=module -e "import { DAILY_PROTEIN_FLOOR_G, WEEKLY_PROTEIN_FLOOR_G, MACRO_COPY } from './src/constants/macroTargets.js'; console.log(DAILY_PROTEIN_FLOOR_G, WEEKLY_PROTEIN_FLOOR_G, MACRO_COPY.DAILY_NOTE)"`
Expected: prints `100 700 This target is a fixed general default and is not personalized to your weight or goals.` with no error.

### Task 2: Add `DAILY_MACRO_TARGETS` and `WEEKLY_MACRO_TARGETS` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/macroTargets.js`

- [x] **Step 1: Add both target tables after the existing `MACRO_TARGETS` export**

```js
/** Daily-scale target table (FR-104 extension, MPP-2). carbs/fat are the SAME
 *  object reference as MACRO_TARGETS.carbs / MACRO_TARGETS.fat — not a copy —
 *  because % of kcal is scale-invariant between a meal and a day (AC2/AC3). */
export const DAILY_MACRO_TARGETS = {
  protein: {
    key: 'protein', code: 'P', label: 'Protein', mode: MACRO_MODE.GRAMS,
    perfect: `≥ ${DAILY_PROTEIN_FLOOR_G} g per day`,
    bands: [
      {
        status: MACRO_STATUS.ON,
        range: '≥ 100 g',
        meaning: 'Meets the daily protein floor',
        test: (grams) => grams >= 100
      },
      {
        status: MACRO_STATUS.NEAR,
        range: '98 – 99 g',
        meaning: 'Under the floor, but within display rounding',
        test: (grams) => grams >= 98
      },
      {
        status: MACRO_STATUS.UNDER,
        range: '< 98 g',
        meaning: 'Well under the daily floor',
        reject: true,
        test: () => true
      }
    ],
    why: [
      'Daily protein is the same lean-mass and satiety lever as the per-meal floor, checked across the whole day instead of one sitting — hitting it is what stops a calorie deficit becoming muscle loss.',
      'The 100 g/day floor sits inside the 96–129 g/day range implied by 1.2–1.6 g of protein per kg of bodyweight per day for an 80 kg reference adult — the same reference adult and the same USDA range the per-serving 35 g floor is derived from.',
      'This is a fixed generic default, not personalized to your weight or goals — FoodBytes does not yet collect bodyweight or goal data. 100 g was chosen as a round number that sits inside the reference range rather than at either edge of it.'
    ],
    sources: [
      { claim: '1.2–1.6 g protein per kg of bodyweight per day', source: 'USDA Dietary Guidelines for Americans 2025–2030' },
      { claim: '≈96–129 g/day for an 80 kg reference adult', source: 'FoodBytes calculation from the USDA range — internal, not personalized' },
      { claim: 'A 100 g/day floor, and rejection below it', source: 'FoodBytes recipe standard — internal calibration, no external source' }
    ]
  },
  carbs: MACRO_TARGETS.carbs,
  fat: MACRO_TARGETS.fat
}

/** Weekly-scale target table (FR-104 extension, MPP-2). Protein floor is the
 *  daily floor × 7 (700 g); near-band is 2g × 7 = 14g of accumulated display
 *  rounding across seven independently-rounded days. carbs/fat reused as-is. */
export const WEEKLY_MACRO_TARGETS = {
  protein: {
    key: 'protein', code: 'P', label: 'Protein', mode: MACRO_MODE.GRAMS,
    perfect: `≥ ${WEEKLY_PROTEIN_FLOOR_G} g per week (7 × ${DAILY_PROTEIN_FLOOR_G} g/day)`,
    bands: [
      {
        status: MACRO_STATUS.ON,
        range: '≥ 700 g',
        meaning: 'Meets the weekly protein floor',
        test: (grams) => grams >= 700
      },
      {
        status: MACRO_STATUS.NEAR,
        range: '686 – 699 g',
        meaning: 'Under the floor, but within display rounding',
        test: (grams) => grams >= 686
      },
      {
        status: MACRO_STATUS.UNDER,
        range: '< 686 g',
        meaning: 'Well under the weekly floor',
        reject: true,
        test: () => true
      }
    ],
    why: [
      'Weekly protein is the same 100 g/day floor summed across seven days — 700 g/week — so a strong day cannot be masked by a weak one when you check the week as a whole.',
      'The 100 g/day floor sits inside the 96–129 g/day range implied by 1.2–1.6 g of protein per kg of bodyweight per day for an 80 kg reference adult — the same reference adult and the same USDA range the per-serving 35 g floor is derived from.',
      'This is a fixed generic default, not personalized to your weight or goals — FoodBytes does not yet collect bodyweight or goal data. 700 g is exactly 7 × the daily floor, not an independently chosen weekly number.'
    ],
    sources: [
      { claim: '1.2–1.6 g protein per kg of bodyweight per day', source: 'USDA Dietary Guidelines for Americans 2025–2030' },
      { claim: '≈96–129 g/day for an 80 kg reference adult', source: 'FoodBytes calculation from the USDA range — internal, not personalized' },
      { claim: 'A 700 g/week floor (7 × the 100 g/day floor), and rejection below it', source: 'FoodBytes recipe standard — internal calibration, no external source' }
    ]
  },
  carbs: MACRO_TARGETS.carbs,
  fat: MACRO_TARGETS.fat
}
```

- [x] **Step 2: Compile check**

Run: `cd foodbytes-app\client; node --input-type=module -e "import { DAILY_MACRO_TARGETS, WEEKLY_MACRO_TARGETS, MACRO_TARGETS } from './src/constants/macroTargets.js'; console.log(DAILY_MACRO_TARGETS.protein.bands.length, DAILY_MACRO_TARGETS.carbs === MACRO_TARGETS.carbs, WEEKLY_MACRO_TARGETS.fat === MACRO_TARGETS.fat)"`
Expected: prints `3 true true` with no error — confirms three protein bands and that carbs/fat are literally the same object reference as `MACRO_TARGETS`.

### Task 3: Generalize `bandFor` / `evaluateMacro` to take an optional target table ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/utils/macroStatus.js:97-131`

- [x] **Step 1: Replace `bandFor` with a version that accepts `targets`, defaulting to `MACRO_TARGETS`**

```js
/**
 * First band whose predicate accepts `subject`. Exposed separately from
 * evaluateMacro so every threshold can be asserted directly on a raw value.
 *
 * @param {'protein'|'carbs'|'fat'} key
 * @param {number} subject grams for mode 'grams', integer percent for 'percent'
 * @param {object} [targets] target table to evaluate against — MACRO_TARGETS
 *   (per-serving), DAILY_MACRO_TARGETS, or WEEKLY_MACRO_TARGETS. Defaults to
 *   MACRO_TARGETS so every existing per-serving call site is unaffected.
 */
export function bandFor(key, subject, targets = MACRO_TARGETS) {
  const target = targets[key]
  if (!target) throw new Error(`Unknown macro key: ${key}`)

  return target.bands.find((band) => band.test(subject))
}
```

- [x] **Step 2: Replace `evaluateMacro` with a version that threads `targets` through to `bandFor`**

```js
/**
 * @param {{protein?: number, carbs?: number, fat?: number} | null} macros grams
 *   at whatever scale `targets` expects (per serving, per day, or per week)
 * @param {'protein'|'carbs'|'fat'} key
 * @param {object} [targets] see bandFor. Defaults to MACRO_TARGETS.
 * @returns {{
 *   status: 'under'|'near'|'on'|'over',
 *   band: { status: string, range: string, meaning: string, reject?: boolean },
 *   grams: number,
 *   percent: number,
 *   derivedKcal: number
 * }}
 */
export function evaluateMacro(macros, key, targets = MACRO_TARGETS) {
  const target = targets[key]
  if (!target) throw new Error(`Unknown macro key: ${key}`)

  const grams = macros?.[key] ?? 0
  const derivedKcal = deriveKcal(macros)

  // Guard the all-zero recipe: percent stays 0 rather than becoming NaN.
  const percent = derivedKcal > 0
    ? Math.round(((grams * KCAL_PER_GRAM[key]) / derivedKcal) * 100)
    : 0

  const subject = target.mode === MACRO_MODE.GRAMS ? grams : percent
  const band = bandFor(key, subject, targets)

  return { status: band.status, band, grams, percent, derivedKcal }
}
```

`deriveKcal` is not modified — it never reads `MACRO_TARGETS` and is already scale-invariant.

- [x] **Step 3: Confirm existing per-serving call sites still resolve with no argument change**

Run: `cd foodbytes-app\client; node --input-type=module -e "import { evaluateMacro, bandFor } from './src/utils/macroStatus.js'; const r = evaluateMacro({ protein: 42, carbs: 64, fat: 20 }, 'protein'); console.log(r.status, r.grams)"`
Expected: prints `on 42` with no error — identical result to before the signature change, confirming the default-parameter path is untouched.

### Task 4: Extend `macroStatus.check.mjs` for the new target tables ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/utils/macroStatus.check.mjs` (no separate `Test:` entry — this plain-`node` script is itself the project's substitute for a test runner; see `react-frontend`'s "no test runner" rule)

- [x] **Step 1: Import the new target tables and add band-boundary assertions for both, mirroring the existing per-serving protein block**

Add after the existing import block:

```js
import {
  DAILY_MACRO_TARGETS,
  WEEKLY_MACRO_TARGETS
} from '../constants/macroTargets.js'
```

Add after the existing `/* ---- protein: grams, no upper band ---- */` block (which asserts against the default `MACRO_TARGETS` table):

```js
/* ---- daily protein: 100g floor, MPP-2 ---- */
expectBand('protein', 0, 'under', true, DAILY_MACRO_TARGETS)
expectBand('protein', 97, 'under', true, DAILY_MACRO_TARGETS)
expectBand('protein', 98, 'near', false, DAILY_MACRO_TARGETS)
expectBand('protein', 99, 'near', false, DAILY_MACRO_TARGETS)
expectBand('protein', 100, 'on', false, DAILY_MACRO_TARGETS)
expectBand('protein', 250, 'on', false, DAILY_MACRO_TARGETS)

/* ---- weekly protein: 700g floor (7x daily), MPP-2 ---- */
expectBand('protein', 0, 'under', true, WEEKLY_MACRO_TARGETS)
expectBand('protein', 685, 'under', true, WEEKLY_MACRO_TARGETS)
expectBand('protein', 686, 'near', false, WEEKLY_MACRO_TARGETS)
expectBand('protein', 699, 'near', false, WEEKLY_MACRO_TARGETS)
expectBand('protein', 700, 'on', false, WEEKLY_MACRO_TARGETS)
expectBand('protein', 1750, 'on', false, WEEKLY_MACRO_TARGETS)

/* ---- carbs/fat reused directly: same band table object, MPP-2 ---- */
assert.equal(DAILY_MACRO_TARGETS.carbs, MACRO_TARGETS.carbs,
  'DAILY_MACRO_TARGETS.carbs must be the same object as MACRO_TARGETS.carbs, not a copy')
assert.equal(DAILY_MACRO_TARGETS.fat, MACRO_TARGETS.fat,
  'DAILY_MACRO_TARGETS.fat must be the same object as MACRO_TARGETS.fat, not a copy')
assert.equal(WEEKLY_MACRO_TARGETS.carbs, MACRO_TARGETS.carbs,
  'WEEKLY_MACRO_TARGETS.carbs must be the same object as MACRO_TARGETS.carbs, not a copy')
assert.equal(WEEKLY_MACRO_TARGETS.fat, MACRO_TARGETS.fat,
  'WEEKLY_MACRO_TARGETS.fat must be the same object as MACRO_TARGETS.fat, not a copy')

console.log('✓ daily/weekly protein band-boundary and carbs/fat reuse assertions passed')
```

`expectBand` currently has the signature `(key, subject, expectedStatus, expectedReject = false)` and calls `bandFor(key, subject)` with no third argument. Update its body to accept and forward an optional `targets` table:

```js
/** Assert the band selected for a raw subject value (grams or percent). */
function expectBand(key, subject, expectedStatus, expectedReject = false, targets = MACRO_TARGETS) {
  const band = bandFor(key, subject, targets)
  assert.ok(band, `${key} @ ${subject}: no band matched — gap in the band table`)
  assert.equal(band.status, expectedStatus,
    `${key} @ ${subject}: expected ${expectedStatus}, got ${band.status}`)
  assert.equal(Boolean(band.reject), expectedReject,
    `${key} @ ${subject}: expected reject=${expectedReject}, got ${Boolean(band.reject)}`)
  passed++
}
```

- [x] **Step 2: Extend the copy-hygiene loop to also cover the new protein target objects**

Locate the existing copy-hygiene block (`for (const key of ['protein', 'carbs', 'fat']) { const target = MACRO_TARGETS[key] ... }`) and change it to iterate the three target tables' protein entries too (carbs/fat are the same object references already checked, so re-checking them via `DAILY_MACRO_TARGETS`/`WEEKLY_MACRO_TARGETS` is redundant but harmless — only `protein` differs per table):

```js
const TARGET_TABLES_TO_CHECK = [
  { name: 'MACRO_TARGETS', table: MACRO_TARGETS, keys: ['protein', 'carbs', 'fat'] },
  { name: 'DAILY_MACRO_TARGETS', table: DAILY_MACRO_TARGETS, keys: ['protein'] },
  { name: 'WEEKLY_MACRO_TARGETS', table: WEEKLY_MACRO_TARGETS, keys: ['protein'] }
]

for (const { name, table, keys } of TARGET_TABLES_TO_CHECK) {
  for (const key of keys) {
    const target = table[key]

    const userVisible = [
      target.label,
      target.perfect,
      ...target.bands.flatMap((band) => [band.range, band.meaning]),
      ...target.why,
      ...target.sources.flatMap((entry) => [entry.claim, entry.source]),
      ...Object.values(MACRO_COPY)
    ]

    for (const text of userVisible) {
      assert.equal(typeof text, 'string', `${name}.${key}: every user-visible entry must be a string`)
      for (const banned of BANNED_IN_COPY) {
        assert.ok(!text.includes(banned),
          `${name}.${key}: user-visible copy must not mention "${banned}" — found in: ${text}`)
      }
    }

    assert.ok(target.sources.length > 0, `${name}.${key}: must declare at least one source`)
    for (const entry of target.sources) {
      assert.ok(entry.claim?.trim(), `${name}.${key}: a source entry is missing its claim`)
      assert.ok(entry.source?.trim(), `${name}.${key}: claim "${entry.claim}" is missing its origin`)
    }

    const origins = target.sources.map((entry) => entry.source).join(' ')
    assert.ok(/FoodBytes/.test(origins),
      `${name}.${key}: at least one source must identify the FoodBytes-internal portion of the rule`)
  }
}
console.log('✓ copy-hygiene and attribution assertions passed (MACRO_TARGETS, DAILY_MACRO_TARGETS, WEEKLY_MACRO_TARGETS)')
```

This replaces the previous `for (const key of ['protein', 'carbs', 'fat'])` loop that only ever checked `MACRO_TARGETS`.

- [x] **Step 3: Run the full check script**

Run: `cd foodbytes-app\client; node src/utils/macroStatus.check.mjs`
Expected: every `✓ ...` line prints, ending with `All macro traffic-light checks passed.` and exit code 0. No `AssertionError`.

---

## Phase 2 — `MacroTargetPopup` becomes scope-aware (backward-compatible)

This phase touches exactly one component, adding three optional props whose defaults reproduce today's output exactly — `MacroBadgeRow.jsx` (out of scope, explicitly protected) needs no edit and renders identically before and after. The phase ends green: the client builds, and the per-serving popup's visible output is provably unchanged by construction (every new prop defaults to the prior hardcoded value).

### Task 5: Add `targets` / `periodLabel` / `footerNote` props to `MacroTargetPopup` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/MacroTargetPopup.jsx`

- [x] **Step 1: Import the new target tables alongside the existing `MACRO_TARGETS` import**

```js
import {
  DAILY_MACRO_TARGETS,
  MACRO_COPY,
  MACRO_TARGETS,
  REJECT_MARK,
  STATUS_ARROW,
  STATUS_DISPLAY_ORDER,
  STATUS_WORD,
  WEEKLY_MACRO_TARGETS
} from '../../constants/macroTargets'
```

`DAILY_MACRO_TARGETS` and `WEEKLY_MACRO_TARGETS` are imported here only so downstream consumers of this file (JSDoc/type hints) can reference them; the component itself only ever receives a target table via the new `targets` prop — it does not choose between them internally.

- [x] **Step 2: Widen the function signature with the three new optional props**

```js
function MacroTargetPopup({
  macroKey,
  macros,
  variantLabel,
  displayedCaloriesPerServing,
  targets = MACRO_TARGETS,
  periodLabel,
  footerNote = MACRO_COPY.VARIANT_NOTE,
  onClose
}) {
  const closeButtonRef = useRef(null)

  const target = targets[macroKey]
  const result = evaluateMacro(macros, macroKey, targets)
```

(Replaces the current two lines `const target = MACRO_TARGETS[macroKey]` / `const result = evaluateMacro(macros, macroKey)`.)

- [x] **Step 3: Replace the hardcoded subtitle template with `periodLabel`, falling back to today's exact text**

Find:

```jsx
            <span className="macro-target-subtitle">
              per serving{variantLabel ? ` · ${variantLabel}` : ''}
            </span>
```

Replace with:

```jsx
            <span className="macro-target-subtitle">
              {periodLabel ?? `per serving${variantLabel ? ` · ${variantLabel}` : ''}`}
            </span>
```

- [x] **Step 4: Replace the hardcoded footer copy reference with `footerNote`**

Find:

```jsx
          <p className="macro-target-variant-note">{MACRO_COPY.VARIANT_NOTE}</p>
```

Replace with:

```jsx
          <p className="macro-target-variant-note">{footerNote}</p>
```

- [x] **Step 5: Build check**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors, no new warnings referencing `MacroTargetPopup.jsx`.

**Fix-pass note (post-review):** Step 1's import list and the paragraph beneath it are superseded — Code-Evaluator flagged `DAILY_MACRO_TARGETS`/`WEEKLY_MACRO_TARGETS` as dead imports (never referenced in the file body, no JSDoc `@type` actually using them). Both were removed from the import list and the justification comment was deleted; `MacroTargetPopup.jsx` now imports only `MACRO_COPY`, `MACRO_TARGETS`, `REJECT_MARK`, `STATUS_ARROW`, `STATUS_DISPLAY_ORDER`, `STATUS_WORD`. No behavior change — the component still only ever receives a target table via the `targets` prop.

- [x] **Step 6: Manual regression check — per-serving popup is visually unchanged**

Run the dev server (`cd foodbytes-app\client; npm run dev`), open a recipe card at `http://localhost:5173/` with visible macro badges, and tap a P/C/F badge. Expected: the popup opens exactly as before — subtitle reads "per serving" (plus " · <Variant>" if the recipe has a variant), footer reads the existing "This target is the same for all three variants…" copy. No visual difference from before this task, because `MacroBadgeRow.jsx` was not edited and every new prop defaulted to the old hardcoded value.

Interactive click-through was not driven in this session (no browser automation invoked). Verified instead by static code reading: `MacroBadgeRow.jsx` renders `<MacroTargetPopup macroKey macros variantLabel displayedCaloriesPerServing onClose />` with no `targets`/`periodLabel`/`footerNote` props, so all three default to `MACRO_TARGETS`, the `` `per serving${variantLabel ? ` · ${variantLabel}` : ''}` `` fallback, and `MACRO_COPY.VARIANT_NOTE` respectively — byte-identical to the prior hardcoded output. `MacroBadgeRow.jsx` was not edited.

---

## Phase 3 — `DailyMacroPopup`: clickable tiles + the portal outside-click fix

This phase makes the single daily popup interactive end-to-end (state, markup, CSS, and the outside-click bug fix together, since the bug only exists once the nested popup is wired in) and is a safe stopping point on its own — `WeeklyMacroPopup` in Phase 4 is untouched and unaffected by anything here.

### Task 6: Wire clickable macro tiles into `DailyMacroPopup` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.jsx`

- [x] **Step 1: Add the new imports**

```js
import { useEffect, useRef, useCallback, useState } from 'react'
import { formatDateShort } from '../../utils/dateUtils'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import PullToDismissUI from '../common/PullToDismissUI'
import MacroTargetPopup from '../recipes/MacroTargetPopup'
import { DAILY_MACRO_TARGETS, MACRO_COPY } from '../../constants/macroTargets'
import './DailyMacroPopup.css'
```

(`useState` added to the existing React import; three new imports for the popup, the daily target table, and `MACRO_COPY.DAILY_NOTE`.)

- [x] **Step 2: Add `openMacroKey` state at the top of the component**

```js
function DailyMacroPopup({ day, onClose }) {
  const popupRef = useRef(null)
  const [openMacroKey, setOpenMacroKey] = useState(null)

  useBodyScrollLock(!!day)
```

- [x] **Step 3: Convert the three `.macro-item` divs into clickable buttons**

Find the protein tile:

```jsx
            <div className="macro-item macro-item-protein">
              <div className="macro-item-header">
                <span className="macro-item-label">Protein</span>
              </div>
              <div className="macro-item-values">
                <span className="macro-item-grams">{totalProtein}g</span>
                <span className="macro-item-percent">{proteinPercent}%</span>
              </div>
              <div className="macro-item-calories">{proteinCalories} cal</div>
            </div>
```

Replace with:

```jsx
            <button
              type="button"
              className="macro-item macro-item-protein"
              onClick={() => setOpenMacroKey('protein')}
              aria-haspopup="dialog"
              aria-expanded={openMacroKey === 'protein'}
            >
              <div className="macro-item-header">
                <span className="macro-item-label">Protein</span>
              </div>
              <div className="macro-item-values">
                <span className="macro-item-grams">{totalProtein}g</span>
                <span className="macro-item-percent">{proteinPercent}%</span>
              </div>
              <div className="macro-item-calories">{proteinCalories} cal</div>
            </button>
```

Repeat the same div→button conversion for the carbs tile (`macro-item-carbs`, `setOpenMacroKey('carbs')`, `aria-expanded={openMacroKey === 'carbs'}`) and the fat tile (`macro-item-fat`, `setOpenMacroKey('fat')`, `aria-expanded={openMacroKey === 'fat'}`), keeping each tile's existing inner content (`totalCarbs`/`carbsPercent`/`carbsCalories`, `totalFat`/`fatPercent`/`fatCalories`) unchanged.

- [x] **Step 4: Render `MacroTargetPopup` when a tile is open, after the closing `</div>` of `.macro-popup-content`**

```jsx
        </div>

        <p className="macro-popup-hint">Press ESC or tap outside to close</p>
      </div>

      {openMacroKey && (
        <MacroTargetPopup
          macroKey={openMacroKey}
          macros={{ protein: totalProtein, carbs: totalCarbs, fat: totalFat }}
          targets={DAILY_MACRO_TARGETS}
          periodLabel="per day"
          footerNote={MACRO_COPY.DAILY_NOTE}
          onClose={() => setOpenMacroKey(null)}
        />
      )}

      {/* Pull-to-dismiss UI */}
      <PullToDismissUI
```

- [x] **Step 5: Build check**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

Confirmed: `npm run build` → `✓ 179 modules transformed`, `✓ built in 805ms`, no errors.

**Fix-pass note (post-review, net-new behavior):** Defender flagged that the three tiles were unconditionally clickable even when the day has no planned meals (all-zero macros), which `macroStatus.hasUsableMacros` documents as "a data-completeness problem dressed as a nutrition verdict" — the same case `MacroBadgeRow.jsx` already routes to a plain, unlit badge. Added a `dayHasUsableMacros = hasUsableMacros({ protein, carbs, fat })` guard: all three tiles now render with `disabled={!dayHasUsableMacros}`, `onClick`/`aria-haspopup`/`aria-expanded` all conditional on it, so an empty day cannot open a confident "0 g · rejected" popup. Matching CSS added in `DailyMacroPopup.css` (`.macro-item:disabled`). Also wired `displayedCaloriesPerServing={totalCalories}` into the nested `<MacroTargetPopup>` (was previously omitted, so the popup's own `showKcalMismatch` reconciliation could never fire for the daily view).

### Task 7: Fix the portal outside-click bug in `DailyMacroPopup` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.jsx:38-42`

- [x] **Step 1: Guard `handleClickOutside` against clicks inside the portal-rendered `MacroTargetPopup`**

Find:

```js
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }
```

Replace with:

```js
    const handleClickOutside = (e) => {
      // MacroTargetPopup renders via createPortal(document.body), so its DOM
      // nodes are real siblings of popupRef.current, not descendants —
      // .contains() below would return false for a click inside it and
      // incorrectly close this popup out from under the nested one (MPP-2).
      if (e.target.closest?.('.macro-target-overlay')) return
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }
```

- [x] **Step 2: Manual verification — mousedown inside the nested popup must not close the daily popup**

Run the dev server (`cd foodbytes-app\client; npm run dev`), navigate to `/mealplan`, click a day's `.day-calories` total to open `DailyMacroPopup`, then tap the Protein tile to open `MacroTargetPopup` on top of it. Click-and-hold (mousedown) on the band legend inside `MacroTargetPopup`, then release. Expected: only `MacroTargetPopup` is affected (or nothing happens if the click lands on inert text) — `DailyMacroPopup` stays open behind it. Before this fix, the same mousedown would have closed `DailyMacroPopup` immediately.

**MANUAL VERIFICATION NEEDED (interactive browser check not driven in this session — no browser automation invoked).** Verified instead by static code tracing: `MacroTargetPopup`'s outermost node is `<div className="macro-target-overlay" onClick={handleOverlayClick}>` rendered via `createPortal(..., document.body)` (`MacroTargetPopup.jsx:114`), so every DOM node inside it — including the band legend — is a descendant of `.macro-target-overlay`. `DailyMacroPopup`'s `handleClickOutside` now returns early via `e.target.closest?.('.macro-target-overlay')` before reaching `popupRef.current.contains(e.target)`, so a mousedown anywhere inside the nested popup can no longer reach the `onClose()` call. Logic confirmed correct; live interaction unverified.

### Task 8: Make `.macro-item` an accessible button in `DailyMacroPopup.css` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.css:159-189`

- [x] **Step 1: Reset button chrome and remove the now-incorrect "not an interactive control" comment**

Find:

```css
.macro-item {
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: border-color 0.2s ease;
}

/* Deliberate exception to the hover/active pairing rule: .macro-item is a
   presentational <div> (DailyMacroPopup.jsx), not an interactive control, so
   :active and touch-action/-webkit-tap-highlight-color are meaningless on it.
   The @media (hover: hover) wrap is still needed to stop touch devices
   inheriting a sticky border colour. */
@media (hover: hover) {
  .macro-item:hover {
    border-color: #4a3f80;
  }
}
```

Replace with:

```css
.macro-item {
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: border-color 0.2s ease;
  /* MPP-2: .macro-item is now a <button>, not a presentational <div> — reset
     button chrome and add the standard touch/focus affordances. */
  width: 100%;
  min-height: 44px;
  font: inherit;
  color: inherit;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

@media (hover: hover) {
  .macro-item:hover {
    border-color: #4a3f80;
  }
}

.macro-item:active {
  border-color: #4a3f80;
  background: #faf9fd;
}

.macro-item:focus-visible {
  outline: 2px solid #4a3f80;
  outline-offset: 2px;
}
```

- [x] **Step 2: Manual check — touch target and keyboard focus**

With the dev server running, open `DailyMacroPopup` at a mobile viewport (Chrome DevTools → toggle device toolbar → 375×667) and confirm each of the three tiles is comfortably tappable (visually ≥44px tall, matches the existing 12px padding + content). Tab to a tile with the keyboard and confirm a visible focus outline appears.

**MANUAL VERIFICATION NEEDED (interactive browser check not driven in this session).** Confirmed statically instead: the compiled CSS bundle (`dist/assets/index-PFtaaRMi.css` from the Task 6 build) includes `.macro-item { ... min-height: 44px; ... }` and a `.macro-item:focus-visible { outline: 2px solid #4a3f80; outline-offset: 2px; }` rule, sourced directly from `DailyMacroPopup.css`. Combined with the existing 12px padding and mobile media query (`.macro-item { padding: 14px; }` under 480px) this satisfies the ≥44px touch-target rule; live visual/keyboard confirmation unverified.

---

## Phase 4 — `WeeklyMacroPopup`: clickable tiles in both sections + the same portal fix

Mirrors Phase 3 for the weekly popup, but with two sections sharing one popup instance (`{ key, scope }` state) so Weekly Totals evaluates against `WEEKLY_MACRO_TARGETS` and Daily Average against `DAILY_MACRO_TARGETS`. Safe stopping point: build green, both sections independently clickable, only one `MacroTargetPopup` ever mounted at a time.

### Task 9: Wire clickable macro tiles into `WeeklyMacroPopup` (both sections) ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.jsx`

- [x] **Step 1: Add the new imports**

```js
import { useEffect, useRef, useCallback, useState } from 'react'
import { formatDateRange } from '../../utils/dateUtils'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import PullToDismissUI from '../common/PullToDismissUI'
import MacroTargetPopup from '../recipes/MacroTargetPopup'
import { DAILY_MACRO_TARGETS, MACRO_COPY, WEEKLY_MACRO_TARGETS } from '../../constants/macroTargets'
import './WeeklyMacroPopup.css'
```

- [x] **Step 2: Add the shared `openMacro` state**

```js
function WeeklyMacroPopup({ weekData, onClose }) {
  const popupRef = useRef(null)
  const [openMacro, setOpenMacro] = useState(null) // { key: 'protein'|'carbs'|'fat', scope: 'day'|'week' } | null

  useBodyScrollLock(!!weekData)
```

- [x] **Step 3: Convert the three Weekly Totals `.macro-summary-item` divs into buttons**

Find the protein tile in the Weekly Totals section:

```jsx
              <div className="macro-summary-item">
                <span className="macro-summary-label">Protein</span>
                <span className="macro-summary-value">{weekTotalProtein}g</span>
                <span className="macro-summary-calories">{weekProteinCalories.toLocaleString()} cal</span>
              </div>
```

Replace with:

```jsx
              <button
                type="button"
                className="macro-summary-item"
                onClick={() => setOpenMacro({ key: 'protein', scope: 'week' })}
                aria-haspopup="dialog"
                aria-expanded={openMacro?.key === 'protein' && openMacro?.scope === 'week'}
              >
                <span className="macro-summary-label">Protein</span>
                <span className="macro-summary-value">{weekTotalProtein}g</span>
                <span className="macro-summary-calories">{weekProteinCalories.toLocaleString()} cal</span>
              </button>
```

Repeat for the carbs tile (`key: 'carbs'`, values `weekTotalCarbs`/`weekCarbsCalories`) and the fat tile (`key: 'fat'`, values `weekTotalFat`/`weekFatCalories`), each with `scope: 'week'`.

- [x] **Step 4: Convert the three Daily Average `.macro-item` divs into buttons**

Find the protein tile in the Daily Average section:

```jsx
              <div className="macro-item macro-item-protein">
                <div className="macro-item-header">
                  <span className="macro-item-label">Protein</span>
                </div>
                <div className="macro-item-values">
                  <span className="macro-item-grams">{avgProtein}g</span>
                  <span className="macro-item-percent">{avgProteinPercent}%</span>
                </div>
                <div className="macro-item-calories">{avgProteinCalories} cal</div>
              </div>
```

Replace with:

```jsx
              <button
                type="button"
                className="macro-item macro-item-protein"
                onClick={() => setOpenMacro({ key: 'protein', scope: 'day' })}
                aria-haspopup="dialog"
                aria-expanded={openMacro?.key === 'protein' && openMacro?.scope === 'day'}
              >
                <div className="macro-item-header">
                  <span className="macro-item-label">Protein</span>
                </div>
                <div className="macro-item-values">
                  <span className="macro-item-grams">{avgProtein}g</span>
                  <span className="macro-item-percent">{avgProteinPercent}%</span>
                </div>
                <div className="macro-item-calories">{avgProteinCalories} cal</div>
              </button>
```

Repeat for the carbs tile (`avgCarbs`/`avgCarbsPercent`/`avgCarbsCalories`) and the fat tile (`avgFat`/`avgFatPercent`/`avgFatCalories`), each with `scope: 'day'`.

- [x] **Step 5: Render `MacroTargetPopup` after the closing `</div>` of `.macro-popup-content`**

```jsx
        </div>

        <p className="macro-popup-hint">Press ESC or tap outside to close</p>
      </div>

      {openMacro && (
        <MacroTargetPopup
          macroKey={openMacro.key}
          macros={
            openMacro.scope === 'week'
              ? { protein: weekTotalProtein, carbs: weekTotalCarbs, fat: weekTotalFat }
              : { protein: avgProtein, carbs: avgCarbs, fat: avgFat }
          }
          targets={openMacro.scope === 'week' ? WEEKLY_MACRO_TARGETS : DAILY_MACRO_TARGETS}
          periodLabel={openMacro.scope === 'week' ? 'per week (7-day total)' : 'per day (average)'}
          footerNote={MACRO_COPY.DAILY_NOTE}
          onClose={() => setOpenMacro(null)}
        />
      )}

      {/* Pull-to-dismiss UI */}
      <PullToDismissUI
```

- [x] **Step 6: Build check**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

**Fix-pass note (post-review, net-new behavior):** Same Defender finding as Task 6, applied to both sections independently: `weekHasUsableMacros` guards the three Weekly Totals tiles and `avgHasUsableMacros` guards the three Daily Average tiles (each `hasUsableMacros({ protein, carbs, fat })` over that section's own totals/averages), so a week or a day-average with no data disables just that section's tiles rather than the whole popup. Matching CSS added in `WeeklyMacroPopup.css` (`.macro-summary-item:disabled`); `.macro-item:disabled` reuses the rule already added to `DailyMacroPopup.css` per this file's own "shares base styles" convention. Also wired `displayedCaloriesPerServing={openMacro.scope === 'week' ? weekTotalCalories : avgCalories}` into the nested `<MacroTargetPopup>` (was previously omitted).

### Task 10: Fix the portal outside-click bug in `WeeklyMacroPopup` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.jsx:38-42`

- [x] **Step 1: Apply the same guard as Task 7**

Find:

```js
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }
```

Replace with:

```js
    const handleClickOutside = (e) => {
      // MacroTargetPopup renders via createPortal(document.body), so its DOM
      // nodes are real siblings of popupRef.current, not descendants —
      // .contains() below would return false for a click inside it and
      // incorrectly close this popup out from under the nested one (MPP-2).
      if (e.target.closest?.('.macro-target-overlay')) return
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }
```

- [ ] **Step 2: Manual verification — both sections**

Run the dev server, navigate to `/mealplan`, click the `.week-calories` total in the calendar header to open `WeeklyMacroPopup`. Tap a Weekly Totals tile (e.g. Fat) — confirm the popup shows `per week (7-day total)` as the subtitle and a value/status consistent with `weekTotalFat`. Close it, then tap the same macro's Daily Average tile — confirm the popup shows `per day (average)` and a value consistent with `avgFat`. For each, mousedown inside the nested popup must not close `WeeklyMacroPopup` (same check as Task 7 Step 2).

### Task 11: Make `.macro-summary-item` an accessible button in `WeeklyMacroPopup.css` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.css:30-38`

- [x] **Step 1: Reset button chrome and add touch/focus affordances**

Find:

```css
.macro-summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 6px;
}
```

Replace with:

```css
.macro-summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 6px;
  /* MPP-2: .macro-summary-item is now a <button>, not a presentational <div>. */
  width: 100%;
  min-height: 44px;
  border: 2px solid transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

@media (hover: hover) {
  .macro-summary-item:hover {
    border-color: #4a3f80;
  }
}

.macro-summary-item:active {
  border-color: #4a3f80;
  background: #efedf7;
}

.macro-summary-item:focus-visible {
  outline: 2px solid #4a3f80;
  outline-offset: 2px;
}
```

`.macro-item` inside this file's mobile media query is unaffected — it shares the class already fixed in Task 8, since `WeeklyMacroPopup.css`'s own header comment states it "Shares base styles with DailyMacroPopup.css".

- [x] **Step 2: Build check**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [ ] **Step 3: Manual check — touch target and keyboard focus, both sections**

At a 375×667 viewport, confirm all six tiles (3 Weekly Totals + 3 Daily Average) are comfortably tappable and each shows a visible `:focus-visible` outline when tabbed to.

---

## Phase 5 — Final verification

No production changes in this phase — only sanity-checks that the cumulative work across Phases 1–4 is clean. Backend is untouched by this task (no entity, DTO, or endpoint was added or modified — confirmed in `plan.md` Part 1 → Cross-code alignment audit), so the backend test suite is intentionally not run here.

### Task 12: Grep for stale references ✓

- Skill: react-frontend

- [x] **Step 1: Confirm no leftover hardcoded `MACRO_TARGETS[macroKey]` remains in `MacroTargetPopup.jsx`**

Run: `Select-String -Path foodbytes-app\client\src\components\recipes\MacroTargetPopup.jsx -Pattern "MACRO_TARGETS\[macroKey\]"`
Expected: zero hits — confirms Task 5 Step 2 replaced it with `targets[macroKey]`.

Confirmed: zero hits.

- [x] **Step 2: Confirm both `bandFor` and `evaluateMacro` now default to `MACRO_TARGETS` via a `targets` parameter**

Run: `Select-String -Path foodbytes-app\client\src\utils\macroStatus.js -Pattern "targets = MACRO_TARGETS"`
Expected: exactly 2 hits (one in `bandFor`, one in `evaluateMacro`).

Confirmed: exactly 2 hits (line 100 `bandFor`, line 120 `evaluateMacro`).

- [x] **Step 3: Confirm no new `console.log` / `console.debug` were introduced**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -File | Select-String -Pattern "console\.(log|debug)"` (the plan's literal `-Recurse` flag on `Select-String -Path` errors on this PowerShell version — `-Path`+`-Recurse` isn't a valid combination without a wildcard; ran the `Get-ChildItem | Select-String` equivalent instead, same semantics).

Actual: 15 hits total — `hooks/useWakeLock.js` (4), `services/api.js` (1), `utils/macroStatus.check.mjs` (10, up from a pre-contract baseline of 9). Zero hits in any of the five files this plan actually edited for shipped behavior (`DailyMacroPopup.jsx`, `WeeklyMacroPopup.jsx`, `MacroTargetPopup.jsx`, `macroTargets.js`, `macroStatus.js` — confirmed via `git diff` on each, no `+console.log`/`+console.debug` line in any of them).

This does not literally match the step's stated expectation ("count unchanged from baseline of 6") — see the Notes section of the Implementer Report for the full discrepancy explanation (the "6" baseline in the `react-frontend` skill's Known Debt table appears stale/never accounted for `macroStatus.check.mjs`, and `MealPlanEntry.jsx` shows 0 hits today, not the 1 the table implies). The one net-new `console.log` line inside `macroStatus.check.mjs` (line count 9→10) was explicitly specified by this same plan's Task 4 Steps 1–2 (already completed in Phase 1) as the check script's own pass/fail announcement convention — mirroring the 9 identical calls already in that file — not an incidental leftover debug statement in application code. Flagged, not silently patched around.

- [x] **Step 4: Confirm both popups now register a portal-aware outside-click guard**

Run: `Select-String -Path foodbytes-app\client\src\components\mealplan\DailyMacroPopup.jsx,foodbytes-app\client\src\components\mealplan\WeeklyMacroPopup.jsx -Pattern "macro-target-overlay"`
Expected: exactly 1 hit per file (the `closest('.macro-target-overlay')` guard added in Tasks 7 and 10).

Confirmed: exactly 1 hit in each file (`DailyMacroPopup.jsx:46`, `WeeklyMacroPopup.jsx:46`).

### Task 13: Re-run the macro band/copy-hygiene check ✓

- Skill: react-frontend

- [x] **Step 1: Full check run after all changes**

Run: `cd foodbytes-app\client; node src/utils/macroStatus.check.mjs`
Expected: `All macro traffic-light checks passed.`, exit code 0.

Confirmed: all 9 `✓ ...` lines printed, ending with `All macro traffic-light checks passed.`, exit code 0.

### Task 14: Production build ✓

- Skill: react-frontend

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors, no new warnings.

Confirmed: `✓ 179 modules transformed`, `✓ built in 855ms`, no errors, no warnings.

### Task 15: Write the PR description ✓

- Skill: none — documentation output, not governed by a code skill

- [x] **Step 1: Write `pr-description.md` in this plan folder**

Include:
- Link to `plan.md` in this folder and to Jira issue `MPP-2`.
- Summary: daily/weekly Protein/Carbs/Fat tiles are now clickable and open the existing `MacroTargetPopup`, evaluated against new daily (100g protein floor) / weekly (700g) target tables; carbs/fat reused directly from the existing per-serving bands.
- No migration required — this task touches no backend, entity, or endpoint.
- Verification results: Phase 1 `node macroStatus.check.mjs` pass, Phase 2/3/4 `npm run build` passes, manual checks performed for click behavior, ARIA state, touch target size, keyboard focus, and the outside-click portal fix (all listed explicitly — no frontend test runner exists, per `react-frontend`).
- New convention note for future contributors: `evaluateMacro`/`bandFor` now take an optional third `targets` argument, and `MacroTargetPopup` takes optional `targets`/`periodLabel`/`footerNote` props — any new aggregate-scale traffic light (e.g. a future monthly view) should follow this same pattern rather than forking the popup.

---

## Self-review

**Spec coverage:**
- In scope → "Clickable Protein/Carbs/Fat tiles in `DailyMacroPopup.jsx`" — Task 6.
- In scope → "Clickable tiles in `WeeklyMacroPopup.jsx`, both sections" — Task 9.
- In scope → "New daily-scale and weekly-scale target constants" — Tasks 1, 2.
- In scope → "Generalizing `macroStatus.js`" — Task 3.
- In scope → "Extending `MacroTargetPopup.jsx`" — Task 5.
- In scope → "Fixing the portal/outside-click bug" — Tasks 7, 10.
- In scope → "CSS additions for accessible interactive tiles" — Tasks 8, 11.
- In scope → "Extending `macroStatus.check.mjs`" — Task 4, re-verified in Task 13.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or an exact `Run:` / `Expected:` command. Manual-check steps (Tasks 5, 7, 8, 10, 11) name the exact route/viewport/action/expected outcome per the `react-frontend` "no test runner" constraint, rather than a bare "verify it works".

**Type / name consistency:** `DAILY_MACRO_TARGETS`, `WEEKLY_MACRO_TARGETS`, `DAILY_PROTEIN_FLOOR_G`, `WEEKLY_PROTEIN_FLOOR_G`, and `MACRO_COPY.DAILY_NOTE` are defined once in Task 1/2 and referenced identically (same names, same casing) in Tasks 4, 5, 6, 9, matching `plan.md` Part 2 → Data shapes verbatim. `bandFor`/`evaluateMacro`'s new `targets` parameter name is identical in Task 3, its `macroStatus.check.mjs` callers in Task 4, and `plan.md`. The `openMacro` shape `{ key, scope }` (Task 9) and `openMacroKey` (Task 6) match the two different components' needs as designed in `plan.md` Part 2 → Approach (Daily needs only a key; Weekly needs key + scope since two sections share one popup).

**Phase boundary cleanliness:** Phase 1 ends with `node macroStatus.check.mjs` passing and no component importing the new exports yet — nothing downstream can be broken by this phase alone. Phase 2 ends with a build pass and a manual confirmation that per-serving popup output is byte-for-byte unchanged (every new prop defaults to the prior hardcoded value) — `MacroBadgeRow.jsx` was not touched. Phase 3 ends with `DailyMacroPopup` fully wired, its portal bug fixed, and its CSS updated, independent of `WeeklyMacroPopup` (Phase 4 not yet started) — no half-applied state. Phase 4 mirrors Phase 3 for the weekly popup and is independently complete. Phase 5 makes no production changes.
