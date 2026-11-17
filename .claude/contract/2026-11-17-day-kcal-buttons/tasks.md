# Tasks: Day kcal on recipe-card day buttons (FR-050 back)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-17

**Goal:** Show the day's planned kcal on each recipe-card day button in Default, Cyberpunk and Parchment, with a hover/focus preview of the day total after the click.

**Spec:** `plan.md` in this folder. Visual reference: `foodbytes-app/mockup/day-kcal-buttons.html`.

---

## File map

**Created:**
- `foodbytes-app/client/src/utils/dayKcal.js` — pure day-kcal projection and formatting.
- `foodbytes-app/client/src/utils/dayKcal.check.mjs` — node assertions for the helper.

**Modified:**
- `foodbytes-app/client/package.json` — `check:daykcal` script; version bump.
- `foodbytes-app/client/src/components/recipes/DayAssignmentButtons.jsx` — kcal line, preview state, `assignKcal` prop, titles.
- `foodbytes-app/client/src/components/recipes/DayAssignmentButtons.css` — two-line face, 48/52px, kcal/preview styles.
- `foodbytes-app/client/src/components/recipes/RecipeCard.jsx:98-105` — pass `assignKcal`.
- `foodbytes-app/client/src/styles/themes/cyberpunk/recipes.css:406-448` — kcal fonts/colours.
- `foodbytes-app/client/src/styles/themes/parchment/recipes.css:456-464` — kcal fonts/colours.
- `foodbytes-app/mockup/app-mockup.html:359-365, 942-944` — kcal line on `.dbtn`.
- `foodbytes-app/mockup/day-kcal-buttons.html` — drop press-and-hold, mark live.
- `foodbytes-app/mockup/README.md` — row status.
- `foodbytes-app/foodbytes-api/pom.xml` — version bump.
- `CHANGELOG.md` — one line.

**Deleted:** (none)

---

## Phase 1 — Projection helper

A pure module with its own node check, not yet imported anywhere. The build is unaffected, so this is a clean stopping point.

### Task 1: Create `utils/dayKcal.js` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/dayKcal.js`

- [x] **Step 1: Write the module**

```js
/**
 * FR-050 (restored 2026-11-17): the day's kcal on recipe-card day buttons.
 * Mirrors the optimistic delta in MealPlanContext.assignRecipe and the backend's
 * MealPlanService day total (sum of per-serving kcal of every entry that day).
 */

export const DAY_KCAL_EMPTY = '—'

/** Per-serving kcal of a meal-plan entry, as the backend counts it. */
export function entryKcalPerServing(entry) {
  const calories = entry?.recipe?.calories || 0
  const servings = entry?.recipe?.defaultServings || 1
  return calories / servings
}

/**
 * The day total after clicking this recipe's day button.
 * - assignId already in the slot → the click removes it.
 * - otherwise → the first entry in the slot (if any) is swapped out and assignKcal added.
 */
export function projectDayKcal({ dayTotal, slotEntries, assignId, assignKcal }) {
  const entries = slotEntries || []
  const total = dayTotal || 0
  const own = entries.find((e) => e?.recipe?.id === assignId)
  const projected = own
    ? total - entryKcalPerServing(own)
    : total - (entries[0] ? entryKcalPerServing(entries[0]) : 0) + (assignKcal || 0)
  return Math.max(0, Math.round(projected))
}

/** "1835", or DAY_KCAL_EMPTY for 0 / missing. No thousands separator, to fit 320px. */
export function formatDayKcal(kcal) {
  const n = Math.round(kcal || 0)
  return n > 0 ? String(n) : DAY_KCAL_EMPTY
}
```

- [x] **Step 2: Smoke-import it**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {formatDayKcal} from './src/utils/dayKcal.js'; console.log(formatDayKcal(1834.6), formatDayKcal(0))"`
Expected: `1835 —`

### Task 2: Add `dayKcal.check.mjs` and the `check:daykcal` script ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/dayKcal.check.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [x] **Step 1: Write the check**

```js
/**
 * FR-050: verification for the day-kcal projection on recipe-card day buttons.
 * No frontend test runner exists; run with: cd foodbytes-app/client && npm run check:daykcal
 * Pins the three click outcomes (add, swap, remove) so the preview always matches
 * what the optimistic update in MealPlanContext.assignRecipe will show after the click.
 */
import assert from 'node:assert/strict'
import { DAY_KCAL_EMPTY, entryKcalPerServing, formatDayKcal, projectDayKcal } from './dayKcal.js'

const entry = (id, calories, defaultServings) => ({ recipe: { id, calories, defaultServings } })

// per-serving kcal
assert.equal(entryKcalPerServing(entry(1, 1222, 2)), 611)
assert.equal(entryKcalPerServing(entry(1, 600, 0)), 600, 'defaultServings 0 divides by 1')
assert.equal(entryKcalPerServing(undefined), 0)

// add to an empty slot
assert.equal(projectDayKcal({ dayTotal: 1215, slotEntries: [], assignId: 7, assignKcal: 611 }), 1826)
// swap: another recipe holds the slot
assert.equal(projectDayKcal({ dayTotal: 1822, slotEntries: [entry(5, 1284, 2)], assignId: 7, assignKcal: 611 }), 1791)
// remove: this recipe is already there
assert.equal(projectDayKcal({ dayTotal: 1716, slotEntries: [entry(7, 1222, 2)], assignId: 7, assignKcal: 611 }), 1105)
// empty day, nothing missing
assert.equal(projectDayKcal({ dayTotal: undefined, slotEntries: undefined, assignId: 7, assignKcal: 504 }), 504)
// never negative, always an integer
assert.equal(projectDayKcal({ dayTotal: 100, slotEntries: [entry(7, 1222, 2)], assignId: 7, assignKcal: 611 }), 0)
assert.equal(projectDayKcal({ dayTotal: 0, slotEntries: [], assignId: 7, assignKcal: 503.6 }), 504)
console.log('✓ projectDayKcal: add, swap, remove, empty, floor')

// formatting
assert.equal(formatDayKcal(1834.6), '1835')
assert.equal(formatDayKcal(0), DAY_KCAL_EMPTY)
assert.equal(formatDayKcal(undefined), DAY_KCAL_EMPTY)
assert.equal(formatDayKcal(12345), '12345', 'no thousands separator')
console.log('✓ formatDayKcal')

console.log('\nAll day-kcal checks passed.')
```

- [x] **Step 2: Wire the script**

In `foodbytes-app/client/package.json` → `scripts`, after `"check:macros": …`, add:
```json
"check:daykcal": "node src/utils/dayKcal.check.mjs",
```

- [x] **Step 3: Run it**

Run: `cd foodbytes-app\client; npm run check:daykcal`
Expected: ends with `All day-kcal checks passed.`

---

## Phase 2 — Day buttons show the kcal

Component, prop and CSS change together so every theme renders the new two-line face in one build. Ends with `npm run build` and `check:themes` green.

### Task 3: Render the kcal line and preview in `DayAssignmentButtons` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/DayAssignmentButtons.jsx`

- [x] **Step 1: Imports, prop, context, preview state**

Add after the `slotEntryFor` import:
```js
import { formatDayKcal, projectDayKcal } from '../../utils/dayKcal'
```
Change the signature to:
```js
function DayAssignmentButtons({ recipe, servings, currentMealType, selectedRecipeId, assignKcal = 0, pickDate = null, onAssigned }) {
```
Change the context line to:
```js
  const { weekDays, weekPlan, assignRecipe, isRecipeAssigned, getDailyCalories } = useMealPlan()
```
After the `pendingInitialSelections` `useState` (still above the guest `return null`), add:
```js
  const [previewDate, setPreviewDate] = useState(null) // FR-050: day whose total shows the post-click projection
```

- [x] **Step 2: Update the header comment**

Replace the line `* FR-050 (daily calories on each day button) was removed by the Meal Plan / Recipes redesign:` and the following line `* the buttons show the day name only. With ...` so the block reads:
```js
 * FR-050 (restored 2026-11-17): each day button shows that day's kcal above the day name; on mouse hover or
 * keyboard focus it shows the projected total after the click (utils/dayKcal.js). With `pickDate` set (picking mode) the 7 buttons collapse to one
```
(keep the rest of that sentence, `"Add to {Day}" button for that date; …`, unchanged).

- [x] **Step 3: Add the projection helper inside the component**

After `getButtonTitle`, add:
```js
  /** FR-050: day total after clicking this day's button (add, swap or remove). */
  const projectedFor = (dateStr) => projectDayKcal({
    dayTotal: getDailyCalories(dateStr),
    slotEntries: weekPlan?.days?.find((d) => d.date === dateStr)?.mealsByType?.[currentMealType?.toLowerCase()],
    assignId: recipeIdToAssign,
    assignKcal,
  })
```

- [x] **Step 4: Replace the grid button render**

Replace the `weekDays.map(...)` body inside `<div className="days-grid">` with:
```jsx
          {weekDays.map((day) => {
            const buttonClass = getButtonClass(day.date)
            const projected = projectedFor(day.date)
            const title = `${getButtonTitle(day.date, day.dayName, buttonClass)} (day → ${projected} kcal)`
            const isPreview = previewDate === day.date
            const kcal = isPreview ? projected : getDailyCalories(day.date)

            return (
              <button
                key={day.date}
                type="button"
                className={`day-btn ${buttonClass}${isPreview ? ' preview' : ''}`}
                onClick={() => { setPreviewDate(null); handleDayClick(day.date) }}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setPreviewDate(day.date) }}
                onPointerLeave={() => setPreviewDate(null)}
                onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setPreviewDate(day.date) }}
                onBlur={() => setPreviewDate(null)}
                title={title}
                aria-label={title}
                aria-pressed={buttonClass === 'selected'}
              >
                <span className="day-btn-face">
                  <span className={`day-kcal${kcal > 0 ? '' : ' empty'}`} aria-hidden="true">
                    {isPreview && <span className="arrow">→ </span>}
                    {formatDayKcal(kcal)}
                  </span>
                  <span className="day-name">{day.dayName}</span>
                </span>
              </button>
            )
          })}
```

- [x] **Step 5: Measure the file**

Run: `(Get-Content foodbytes-app\client\src\components\recipes\DayAssignmentButtons.jsx | Measure-Object -Line).Lines`
Expected: under 300 (budget: >400 blocking).

### Task 4: Pass the selected variant's kcal from `RecipeCard` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeCard.jsx:98-105`

- [x] **Step 1: Add the prop**

In the `<DayAssignmentButtons … />` element, after `selectedRecipeId={selectedVariantId}`, add:
```jsx
            assignKcal={currentVariantCalories}
```

### Task 5: Two-line face in `DayAssignmentButtons.css` (Default + base) ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/DayAssignmentButtons.css`

- [x] **Step 1: Header comment, button and face**

Replace the first comment line `/* DayAssignmentButtons - day-name buttons (no kcal) or one picking-mode button.` with `/* DayAssignmentButtons - day buttons (day kcal over day name, FR-050) or one picking-mode button.`

In `.day-btn` change `min-height: 44px;` → `min-height: 52px;` and the comment above it to `/* The button is the 52px hit area; .day-btn-face is the 48px painted button inside it. */`.

In `.day-btn-face` replace `display: flex; align-items: center; justify-content: center;` block lines and `height: 40px;` so it has:
```css
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  box-sizing: border-box;
  height: 48px;
```
(other properties unchanged).

- [x] **Step 2: Move the ✓ onto the day name**

Replace the selector `.day-btn.selected .day-btn-face::before` with `.day-btn.selected .day-name::before` (body unchanged).

- [x] **Step 3: Add the kcal/preview rules** (after the `.day-btn.selected:active .day-btn-face` rule)

```css
/* FR-050: the day's kcal above the day name */
.day-kcal {
  font-size: 0.66rem;
  font-weight: 600;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--text-secondary);
}

.day-kcal.empty {
  opacity: 0.55;
}

.day-name {
  line-height: 1.1;
}

.day-btn.selected .day-kcal {
  color: inherit;
  opacity: 0.9;
}

/* Preview: the projected total after the click (mouse hover or keyboard focus) */
.day-btn.preview .day-btn-face {
  border-color: var(--brand-primary-light);
  color: var(--brand-primary);
}

.day-btn.preview:not(.selected) .day-kcal {
  color: var(--brand-primary);
  opacity: 1;
}

.day-btn.selected.preview .day-btn-face {
  color: var(--on-brand);
}
```

- [x] **Step 4: Mobile sizes**

Inside the existing `@media (max-width: 480px)` block, add:
```css
  .day-kcal {
    font-size: 0.6rem;
  }

  .day-kcal .arrow {
    display: none;
  }
```

### Task 6: Cyberpunk kcal styles ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/styles/themes/cyberpunk/recipes.css:406-448`

- [x] **Step 1: Add after the `.day-btn.selected:hover` block (before `.day-btn:focus-visible`)**

```css
/* FR-050: day kcal in cyan VT323; preview glows yellow */
:root[data-theme="cyberpunk"] .day-kcal {
  font-family: var(--f-num);
  font-size: 15px;
  font-weight: 400;
  color: var(--cyan);
}

:root[data-theme="cyberpunk"] .day-btn.selected .day-kcal {
  color: var(--void);
  opacity: 1;
}

:root[data-theme="cyberpunk"] .day-btn.preview .day-btn-face {
  border-color: var(--cyan);
  color: var(--cyan);
}

:root[data-theme="cyberpunk"] .day-btn.selected.preview .day-btn-face {
  color: var(--void);
}

:root[data-theme="cyberpunk"] .day-btn.preview:not(.selected) .day-kcal {
  color: var(--yellow);
  text-shadow: 0 0 6px var(--yellow);
}

/* Low FX: no glow (this selector outranks the preview rule above) */
:root[data-theme="cyberpunk"] body.lowfx .day-btn.preview:not(.selected) .day-kcal {
  text-shadow: none;
}

@media (max-width: 480px) {
  :root[data-theme="cyberpunk"] .day-btn-face {
    font-size: 16px;
  }

  :root[data-theme="cyberpunk"] .day-kcal {
    font-size: 13px;
  }
}
```

### Task 7: Parchment kcal styles ✓ (Step 2: check:themes blocked by pre-existing Default folder-chip FAIL outside this contract; Step 4: developer manual check)

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/styles/themes/parchment/recipes.css:456-464`

- [x] **Step 1: Add after the `.day-btn.already-selected .day-btn-face` block**

```css
/* FR-050: day kcal in italic Garamond; preview in wax red */
:root[data-theme="parchment"] .day-kcal {
  font-family: var(--f-body);
  font-style: italic;
  font-size: 13px;
  font-weight: 400;
  color: var(--ink-light);
}

:root[data-theme="parchment"] .day-btn.selected .day-kcal {
  color: var(--on-brand);
  opacity: 1;
}

:root[data-theme="parchment"] .day-btn.preview .day-btn-face {
  border-color: var(--wax-bright);
  color: var(--wax);
}

:root[data-theme="parchment"] .day-btn.selected.preview .day-btn-face {
  color: var(--on-brand);
}

:root[data-theme="parchment"] .day-btn.preview:not(.selected) .day-kcal {
  color: var(--wax);
  font-weight: 600;
}

@media (max-width: 480px) {
  :root[data-theme="parchment"] .day-kcal {
    font-size: 11.5px;
  }
}
```

- [ ] **Step 2: Build and theme check** (build OK; check:themes FAILs on pre-existing folder-chip-text, see report)

Run: `cd foodbytes-app\client; npm run build; npm run check:themes`
Expected: `built in <n>s` with no errors; then the one known WARN (`default|text-secondary|bg-secondary`) and `Themes OK: 3 themes, 189 contrast pairs`.

- [x] **Step 3: Confirm no literal colours crept into component CSS**

Run: `Select-String -Path foodbytes-app\client\src\components\recipes\DayAssignmentButtons.css -Pattern "#[0-9a-fA-F]{3,6}|rgba?\("`
Expected: zero hits.

- [ ] **Step 4: Manual visual check (developer)**

`npm run dev` with the backend running, signed in, Recipes page → Breakfast tab, at 1280px and 320px in each of Default, Cyberpunk and Parchment (avatar menu → theme). Expected: every day button shows the day's kcal over the day name (“—” on an empty day) matching the Meal Plan day header; hovering a day shows `→ N` in purple / glowing yellow / wax red; Tab onto a day shows the same; clicking adds/swaps/removes and the number updates at once; at 320px seven buttons fit without overflow and no arrow shows; with Low FX on (Cyberpunk) the yellow has no glow.

---

## Phase 3 — Mockup sync

Docs-only edits so the mockups match what ships. No build impact.

### Task 8: Show the kcal line in `app-mockup.html` ✓ (Step 3: developer browser check)

- Skill: none — mockup HTML, governed by `CLAUDE.md` → Mockups

**Files:**
- Modify: `foodbytes-app/mockup/app-mockup.html:359-365, 942-944`

- [x] **Step 1: CSS**

Change `.dbtn{position:relative;height:44px;` to `.dbtn{position:relative;height:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;line-height:1;` and add after line 365:
```css
.dbtn .dk{font-size:15px;color:var(--cyan)}.dbtn .dk.e{opacity:.55}.dbtn.mine .dk{color:var(--void)}
```

- [x] **Step 2: Renderer**

In the `dbtns` template (line ~944), replace `>${d.dow}</button>` with:
```js
><span class="dk ${dayTotals(d.iso).k?'':'e'}">${dayTotals(d.iso).k?Math.round(dayTotals(d.iso).k):'—'}</span>${d.dow}</button>
```
and change `.dbtn.mine::before{content:"✓"}` so the check sits before the day name by changing the renderer's `${d.dow}` to `${cls==='mine'?'✓ ':''}${d.dow}` and deleting the `.dbtn.mine::before` rule.

- [ ] **Step 3: Check it**

Open `foodbytes-app/mockup/app-mockup.html` in a browser, Recipes tab. Expected: day buttons show kcal over the day name, matching `day-kcal-buttons.html` Cyberpunk column.

### Task 9: Mark the proposal live and drop press-and-hold ✓

- Skill: none — mockup docs

**Files:**
- Modify: `foodbytes-app/mockup/day-kcal-buttons.html`
- Modify: `foodbytes-app/mockup/README.md`

- [x] **Step 1: day-kcal-buttons.html**

In the header paragraph replace `Hover a day (or press and hold on mobile) to preview` with `Hover a day (or Tab onto it) to preview`. Add a note list item: `<li><b>Touch:</b> no preview; the number updates straight after the tap.</li>`.

- [x] **Step 2: README row**

Replace the start of the `day-kcal-buttons.html` row text `**Proposal in review (2026-11-17):**` with `**Approved 2026-11-17, live from v<new version>:**`, replace `Hover / long-press previews` with `Hover / keyboard focus previews`, and replace `Not built yet.` with `Contract \`2026-11-17-day-kcal-buttons\`. \`app-mockup.html\` day buttons show the kcal too; \`parchment-theme.html\` has no day buttons (it uses “Add to week”).`

---

## Phase 4 — Final verification

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. No Jira ticket, not a bug fix → bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`. Put the same number into the README row from Task 9.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — 2026-11-17-day-kcal-buttons: day kcal back on recipe-card day buttons (all themes), with a hover/focus preview of the day total`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references ✓

- [x] **Step 1: No leftover "no kcal" wording or old ✓ selector**

Run: `Select-String -Path foodbytes-app\client\src\components\recipes\DayAssignmentButtons.* -Pattern "no kcal|was removed by the Meal Plan|selected \.day-btn-face::before"`
Expected: zero hits.

- [x] **Step 2: No new console logging**

Run: `Select-String -Path foodbytes-app\client\src\utils\dayKcal.js,foodbytes-app\client\src\components\recipes\DayAssignmentButtons.jsx -Pattern "console\.(log|debug)"`
Expected: zero hits.

### Task M.3: Run the full backend test suite ✓

- [x] **Step 1: Clean test run** (no backend change; confirms the bump didn't break the build)

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task M.4: Production build and checks ✓ (build + check:daykcal pass; check:themes blocked by pre-existing Default folder-chip FAIL outside this contract)

- [ ] **Step 1: Build and run the client checks**

Run: `cd foodbytes-app\client; npm run build; npm run check:daykcal; npm run check:themes`
Expected: `built in <n>s`; `All day-kcal checks passed.`; `Themes OK: 3 themes, 189 contrast pairs` (plus the one known WARN).

### Task M.5: Update the PR description ✓

- [x] **Step 1: Write `pr-description.md` in this plan folder**

Include: link to `plan.md`; summary (day kcal over each day button in all three themes, hover/focus preview via `utils/dayKcal.js`, `assignKcal` prop from `RecipeCard`) and the new version; "No migration"; results of `check:daykcal`, `check:themes`, `check:version`, `npm run build`, `mvn test` and the manual check; a note that preview is mouse/keyboard only by decision and that the optimistic total briefly shows the base recipe's kcal for a non-default variant (known, out of scope); suggested commit subject `day-kcal-buttons: show day kcal on recipe-card day buttons`.

---

## Self-review

**Spec coverage:**
- Two-line face with day kcal / "—" — Tasks 3, 5.
- Hover + keyboard focus preview via pure helper — Tasks 1, 2, 3.
- Accessible name carries the projection — Task 3 Step 4.
- `RecipeCard` passes variant kcal — Task 4.
- Base / Default CSS — Task 5.
- Cyberpunk and Parchment overrides — Tasks 6, 7.
- `check:daykcal` script — Task 2.
- Mockup sync (app-mockup, day-kcal-buttons, README) — Tasks 8, 9.
- Version + CHANGELOG — Task M.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later` or "similar to Task N". `<new version>` is computed at apply time by design (Task M.1).

**Type / name consistency:** `projectDayKcal({ dayTotal, slotEntries, assignId, assignKcal })`, `formatDayKcal`, `entryKcalPerServing`, `DAY_KCAL_EMPTY` identical in Tasks 1–3 and `plan.md` Data shapes. Prop `assignKcal` in Tasks 3–4. Classes `.day-kcal`, `.empty`, `.arrow`, `.day-name`, `.preview` identical across Tasks 3, 5, 6, 7.

**Phase boundary cleanliness:**
- Phase 1: new unimported module plus a node check; build unchanged.
- Phase 2: component, prop and all three themes' CSS land together; ends with `npm run build` and `check:themes` green.
- Phase 3: mockup files only.
- Phase 4: bump and checks only.
