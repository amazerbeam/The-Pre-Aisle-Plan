# Tasks: Recipe view modal resets planned servings to the recipe default

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-07-30
Completed: 2026-07-30 (code complete, all reviewers approved on round 2; Tasks 7–8 outstanding and developer-owned)

**Goal:** Opening `RecipeViewModal` from a meal-plan entry must show — and keep showing — the servings that entry was planned with, so ingredient quantities scale for the portions actually planned; back-navigation from a linked sub-recipe restores the root's servings instead of resetting to `defaultServings`.

**Spec:** `plan.md` in this folder.

---

## File map

**Created (added during the 2026-07-30 review pass — Task 5 revision):**
- `foodbytes-app/client/src/hooks/useRecipeStackServings.js` — owns the linked-recipe navigation stack, the stack-sync effect, `handleLinkedStepClick`, and the live-ref servings/canGoBack mirrors; extracted out of `RecipeViewModal.jsx` to bring it back under the 400-line budget.

**Modified:**
- `foodbytes-app/client/src/constants/servings.js` — add the `DEFAULT_SERVINGS` export.
- `foodbytes-app/client/src/hooks/useServingsInput.js:1-2,47-54` — `resetServings` becomes a stable `useCallback` that normalises its argument through `parseServings`.
- `foodbytes-app/client/src/components/recipes/RecipeViewModal.jsx` — seed `prevStackRecipeId` from the `recipeId` prop, add `rootServingsRef`, branch the sync effect on root-vs-linked, capture root servings on push (Tasks 3–4); then, in the review-pass revision of Task 5, extract that logic plus `handleLinkedStepClick` and the navigation-stack hook call into `useRecipeStackServings.js`.

**Deleted:** (none)

**Test:** (none — `client/package.json` wires only `dev`, `build`, `preview`; there is no frontend test runner. Verification is `npm run build` plus the scripted manual smoke run in Phase 3. Per the `react-frontend` skill, no step in this file may claim a test passed.)

---

## Phase 1 — Servings primitives

Widens `constants/servings.js` and `useServingsInput.js` so the modal fix in Phase 2 has a stable `resetServings` to depend on and a named constant instead of a repeated `|| 1`. Both edits are backwards-compatible with the two existing `resetServings` call sites, so the build stays green and the app behaves identically at the end of this phase — nothing here changes runtime behaviour on its own.

### Task 1: Add `DEFAULT_SERVINGS` to the servings constants ✓

- Skill: `react-frontend` — the constants rule ("declare any repeated meaningful value once and import it", `UPPER_SNAKE_CASE` in `src/constants/`).

**Files:**
- Modify: `foodbytes-app/client/src/constants/servings.js:8-11`

- [x] **Step 1: Add the export**

Replace:

```js
export const MIN_SERVINGS = 0.25
export const MAX_SERVINGS = 20
export const SERVINGS_STEP = 0.5
```

with:

```js
export const MIN_SERVINGS = 0.25
export const MAX_SERVINGS = 20
export const SERVINGS_STEP = 0.5

// Fallback when a servings value is absent or unparseable. Replaces the `|| 1`
// literal that was duplicated across useServingsInput and RecipeViewModal.
export const DEFAULT_SERVINGS = 1
```

### Task 2: Make `resetServings` stable and normalising ✓

- Skill: `react-frontend` — the "never add `useCallback` without justification" rule (answered in the code comment: dependency-array correctness, not performance) and "extract significant logic into a `use*` hook".

**Files:**
- Modify: `foodbytes-app/client/src/hooks/useServingsInput.js:1-2` (imports), `:20-22` (JSDoc), `:47-54` (`resetServings`)

- [x] **Step 1: Import `useCallback` and `DEFAULT_SERVINGS`**

Replace:

```js
import { useState } from 'react'
import { parseServings, formatServings } from '../utils/servingsUtils'
```

with:

```js
import { useState, useCallback } from 'react'
import { parseServings, formatServings } from '../utils/servingsUtils'
import { DEFAULT_SERVINGS } from '../constants/servings'
```

- [x] **Step 2: Update the JSDoc return signature for `resetServings`**

Replace:

```js
 *   resetServings: (value: number) => void
```

with:

```js
 *   resetServings: (value: number|string|null) => void
```

- [x] **Step 3: Rewrite `resetServings`**

Replace:

```js
  /**
   * Replace both values at once — for navigation, where the servings shown must
   * jump to another recipe's default. Call from an effect, never during render.
   */
  const resetServings = (value) => {
    setServings(value)
    setServingsDisplay(formatServings(value))
  }
```

with:

```js
  /**
   * Replace both values at once — for navigation, where the servings shown must
   * jump to another recipe's default. Call from an effect, never during render.
   *
   * Stable identity (`useCallback` with no deps — `useState` setters never change)
   * so callers can list it in an effect dependency array without the effect
   * re-firing every render. This mirrors `useRecipeNavigationStack`'s `reset`.
   * It is not a performance memo — it exists for dependency correctness.
   *
   * The value is normalised through `parseServings`, so an absent or unparseable
   * input lands on DEFAULT_SERVINGS instead of reaching the scaling arithmetic
   * and rendering NaN against every ingredient row.
   */
  const resetServings = useCallback((value) => {
    const parsed = parseServings(value)
    const next = parsed === null ? DEFAULT_SERVINGS : parsed
    setServings(next)
    setServingsDisplay(formatServings(next))
  }, [])
```

- [x] **Step 4: Confirm the client still builds**

Run: `cd foodbytes-app/client; npm run build`
Expected: exits 0, prints a `✓ built in <n>s` line, no `Could not resolve import` or `is not exported` errors.
Observed: exit 0 — `✓ 172 modules transformed.` / `✓ built in 636ms`, no import-resolution or export errors.

---

## Phase 2 — Fix the modal's stack-sync effect

The behavioural change. Task 3 stops the initial stack seeding from clobbering the caller's servings; Task 4 makes back-navigation restore it. Both edit `RecipeViewModal.jsx`. After Task 3 the reported bug is fixed and the build is green — Task 4 only affects the back-navigation path, so stopping between the two leaves a consistent, shippable codebase.

### Task 3: Seed `prevStackRecipeId` from the prop and branch the sync effect ✓

> Review-pass note: this logic now lives in `client/src/hooks/useRecipeStackServings.js`, extracted from `RecipeViewModal.jsx` under Task 5's blocking budget fallback. The code below is what was written into the modal first; the extraction moved it verbatim apart from reading `initialServings` instead of the `servings` prop directly.

- Skill: `react-frontend` — component/hook conventions and the measured 400-line file budget (`RecipeViewModal.jsx` is at 380).

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeViewModal.jsx:10` (import), `:102-114` (the defective effect)

- [x] **Step 1: Add `DEFAULT_SERVINGS` to the constants import**

Replace:

```js
import { MIN_SERVINGS, MAX_SERVINGS, SERVINGS_STEP } from '../../constants/servings'
```

with:

```js
import { MIN_SERVINGS, MAX_SERVINGS, SERVINGS_STEP, DEFAULT_SERVINGS } from '../../constants/servings'
```

- [x] **Step 2: Replace the ref seeding and the sync effect**

Replace:

```js
  // FR-092, FR-095: Sync current recipe with stack when navigating
  // Reset servings to the linked recipe's defaultServings when navigating
  // Only trigger when stackRecipe changes (not when fullRecipe changes from variant selection)
  const prevStackRecipeId = useRef(stackRecipe?.id)
  useEffect(() => {
    if (stackRecipe && stackRecipe.id !== prevStackRecipeId.current) {
      setFullRecipe(stackRecipe)
      setCurrentRecipeName(stackRecipe.name)
      // FR-095: Reset servings to linked recipe's default (not parent's servings)
      resetServings(stackRecipe.defaultServings || 1)
      prevStackRecipeId.current = stackRecipe.id
    }
  }, [stackRecipe])
```

with:

```js
  // FR-092, FR-095: Sync the displayed recipe when the navigation stack changes.
  //
  // Seeded from the `recipeId` prop, NOT from `stackRecipe?.id`: on first render
  // `fullRecipe` is still null, so the stack is empty and `stackRecipe?.id` reads
  // undefined. The stack seeding that follows the initial fetch would then look
  // like a navigation event and reset the caller's servings to the recipe's
  // default — the bug where a meal plan entry planned at 3 servings opened at 2.
  const prevStackRecipeId = useRef(recipeId)

  // The root recipe's servings belongs to the caller (a meal plan entry's planned
  // servings, or the recipe card's picker) — never to `defaultServings`. Held in
  // a ref so back-navigation can restore it; refreshed on the way out in
  // handleLinkedStepClick so Back restores what was last on screen.
  const rootServingsRef = useRef(servings)

  useEffect(() => {
    if (!stackRecipe || stackRecipe.id === prevStackRecipeId.current) return
    prevStackRecipeId.current = stackRecipe.id
    setFullRecipe(stackRecipe)
    setCurrentRecipeName(stackRecipe.name)
    // FR-095: a linked recipe gets its own default; the root gets the caller's value
    resetServings(
      stackRecipe.id === recipeId
        ? rootServingsRef.current
        : stackRecipe.defaultServings || DEFAULT_SERVINGS
    )
  }, [stackRecipe, recipeId, resetServings])
```

- [x] **Step 3: Confirm the client still builds**

Run: `cd foodbytes-app/client; npm run build`
Expected: exits 0, prints a `✓ built in <n>s` line, no `DEFAULT_SERVINGS is not exported` and no `rootServingsRef is not defined` errors.
Observed: exit 0 — `✓ 172 modules transformed.` / `✓ built in 619ms`; bundle hash changed to `index-CcIW1Dvi.js`. No export or reference errors. (Run after Task 4 Step 1 was also applied, so this build covers both tasks.)

### Task 4: Capture the root's servings when navigating into a linked recipe ✓

> Review-pass note: superseded in shape by the extraction. `handleLinkedStepClick` now lives in `useRecipeStackServings.js` and calls `captureRootServings()`, which reads `liveServingsRef`/`liveCanGoBackRef` rather than the closured `currentServings`/`canGoBack` shown below — the Defender found the closured read could snapshot a stale value if the user edited servings while the linked-recipe fetch was in flight.

- Skill: `react-frontend` — hook conventions; the existing `console.error` in the catch is retained so no new `console.log` is introduced.

**Files:**
- Modify: `foodbytes-app/client/src/components/recipes/RecipeViewModal.jsx:116-126` (`handleLinkedStepClick`)

- [x] **Step 1: Refresh `rootServingsRef` before pushing onto the stack**

Replace:

```js
  const handleLinkedStepClick = useCallback(async (linkedRecipeId) => {
    try {
      const linkedRecipe = await recipeService.getRecipeById(linkedRecipeId)
      pushRecipe(linkedRecipe)
    } catch (err) {
      console.error('Failed to fetch linked recipe:', err)
    }
  }, [pushRecipe])
```

with:

```js
  const handleLinkedStepClick = useCallback(async (linkedRecipeId) => {
    try {
      const linkedRecipe = await recipeService.getRecipeById(linkedRecipeId)
      // Leaving the root: remember its servings so Back restores what was on
      // screen. Guarded on !canGoBack so a push from one linked recipe to a
      // deeper one (depth 2 → 3) cannot overwrite the root's value.
      if (!canGoBack) rootServingsRef.current = currentServings
      pushRecipe(linkedRecipe)
    } catch (err) {
      console.error('Failed to fetch linked recipe:', err)
    }
  }, [pushRecipe, canGoBack, currentServings])
```

- [x] **Step 2: Confirm the client still builds**

Run: `cd foodbytes-app/client; npm run build`
Expected: exits 0, prints a `✓ built in <n>s` line, no `canGoBack is not defined` or `currentServings is not defined` errors (both are destructured above this function — `canGoBack` at line 48, `currentServings` at line 71).
Observed: exit 0 — `✓ 172 modules transformed.` / `✓ built in 619ms`. No `canGoBack`/`currentServings` reference errors.

---

## Phase 3 — Final verification

No production changes. Confirms the file budget the `react-frontend` skill treats as blocking, audits that the defective pattern is gone and no debt was added, then runs the scripted manual smoke that stands in for the absent test suite.

### Task 5: Confirm `RecipeViewModal.jsx` is inside the 400-line budget ✓ (revised)

- Skill: `react-frontend` — "measure every component file you create or grow; >400 is blocking".

**CORRECTION (2026-07-30 review pass):** the `Measure-Object -Line` command below silently drops blank lines and under-counted the file (reported 396 against a true `(Get-Content ...).Count` of 430). `Measure-Object -Line` must never be used for this budget check again — use `(Get-Content $f).Count`. The true pre-Task-3 count was 412 (already over budget before this contract), and post-Task-3/4 it was 430. The extraction fallback below WAS required and has now been performed.

**Files:**
- Create: `foodbytes-app/client/src/hooks/useRecipeStackServings.js`
- Modify: `foodbytes-app/client/src/components/recipes/RecipeViewModal.jsx`

- [x] **Step 1: Measure the file (corrected)**

Run:

```powershell
(Get-Content "foodbytes-app\client\src\components\recipes\RecipeViewModal.jsx").Count
```

Observed (before extraction): `430` — over the 400 budget.

Expected: a count under 400. **430 is blocking** — extract the stack-sync effect, the two refs from Task 3, `handleLinkedStepClick`, and the `useRecipeNavigationStack` call into `client/src/hooks/useRecipeStackServings.js`.

- [x] **Step 2: Perform the extraction**

Extracted in three stages (Stage A alone was insufficient; Stage B alone was insufficient; Stage C reached budget):
- Stage A: moved `prevStackRecipeId`, `rootServingsRef`, and the stack-sync `useEffect` into the new hook.
- Stage B: additionally moved `handleLinkedStepClick` (with its JSDoc) into the hook.
- Stage C: additionally moved the `useRecipeNavigationStack(fullRecipe)` call into the hook, re-exporting `handleLinkedStepClick`, `popRecipe`, `resetStack`, `canGoBack`, `previousRecipeName`, `breadcrumbs`.

Also fixed, inside the same hook (Defender findings from the review pass):
- `currentServings` and `canGoBack` are now mirrored into refs (`liveServingsRef`, `liveCanGoBackRef`) updated via effects, so `captureRootServings` (called from `handleLinkedStepClick` after an `await`) reads live values instead of a closure that can be stale if the user edits servings or the stack depth changes mid-fetch.
- The hook's JSDoc documents the invariant that `recipeId` must stay stable for the life of the modal's mount; `RecipeViewModal.jsx`'s `onSelectVariant` prop line carries a one-line pointer to that invariant.

- [x] **Step 3: Re-measure**

Run:

```powershell
(Get-Content "foodbytes-app\client\src\components\recipes\RecipeViewModal.jsx").Count
```

Observed (after extraction): `399` — under the 400 budget.

- [x] **Step 4: Confirm the client still builds**

Run: `cd foodbytes-app/client; npm run build`
Observed: exit 0 — `✓ 173 modules transformed.` / `✓ built in 674ms` (module count up from 172, reflecting the new hook file). No import-resolution or reference errors.

### Task 6: Grep audit — defective pattern gone, no new debt ✓

- Skill: `react-frontend` — success criteria (no new `console.log`, no leftover repeated literal).

**Files:**
- Modify: (none — audit only)

- [x] **Step 1: Confirm the old ref seeding is gone**

Run:

```powershell
Select-String -Path "foodbytes-app\client\src\components\recipes\RecipeViewModal.jsx" -Pattern "useRef\(stackRecipe"
```

Expected: zero hits.
Observed: zero hits.

- [x] **Step 2: Confirm no `|| 1` servings fallback literal remains in the edited files**

Run:

```powershell
Select-String -Path "foodbytes-app\client\src\components\recipes\RecipeViewModal.jsx","foodbytes-app\client\src\hooks\useServingsInput.js" -Pattern "defaultServings \|\| 1"
```

Expected: zero hits.
Observed: zero hits.

- [x] **Step 3: Confirm no new `console.log` / `console.debug` was introduced**

Run:

```powershell
(Get-ChildItem "foodbytes-app\client\src" -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)" | Measure-Object).Count
```

Expected: at or below the baseline of 6 recorded in the `react-frontend` skill's known-debt table. The three edited files must contribute zero.
Observed: 5 across `client/src` (below the baseline of 6); the three edited files contribute 0. Re-confirmed after the extraction — the new `useRecipeStackServings.js` contributes zero `console.log`/`console.debug` (it carries one `console.error`, the retained pre-existing catch).

### Task 7: Manual smoke run — OUTSTANDING (developer-owned)

> Not executed by the `/fb-apply` pipeline: no agent in it has browser tooling, and the run needs a live backend on `:8080`. Every step below is handed to the developer as MANUAL VERIFICATION NEEDED. **Add Step 7 (new):** confirm linked-step navigation still works end-to-end and that the Back control and breadcrumbs still render and function — `handleLinkedStepClick`, `popRecipe`, `canGoBack`, `previousRecipeName`, and `breadcrumbs` all moved into `useRecipeStackServings.js` during the review pass, so this path was restructured after the original plan was written.

- Skill: `react-frontend` — "never claim a test passed"; this scripted run is the substitute for the absent runner. Report each scenario's observed result verbatim, including any that fail.

**Files:**
- Modify: (none — manual verification)

- [ ] **Step 1: Start the stack**

Run: `cd foodbytes-app/client; npm run dev`
Expected: Vite prints `Local: http://localhost:5173/`. The backend must already be reachable on `:8080` (start it with `cd foodbytes-app/foodbytes-api; mvn spring-boot:run`, or point at the deployed API) — the modal's `GET /api/recipes/{id}` is what triggers the defect, so a smoke run without a working API proves nothing.

- [ ] **Step 2: Reproduce the reported case**

Open `http://localhost:5173/mealplan`, find the Sat Jul 4 lunch entry `Classic Irish Beef Stew` showing `× 3`, and click it.
Expected: the modal's servings input reads **`3`** and stays on `3` after the ingredient list finishes loading (no flash-then-revert to `2`). Beef Chuck reads `600 g`, not `400 g` — the ingredient rows are scaled by 3/2.

- [ ] **Step 3: Confirm FR-095 still holds going in**

In the same modal, click a linked instruction step (a step rendered as a clickable link, e.g. one that prepares a sub-recipe).
Expected: the sub-recipe loads and its servings input shows **that sub-recipe's own `defaultServings`**, not `3`.

- [ ] **Step 4: Confirm back-navigation restores the root**

Press the Back control in the modal header.
Expected: the root recipe returns and the servings input reads **`3`** again.

- [ ] **Step 5: Confirm the edit-then-navigate case**

Reopen the entry, change the servings input to `5`, click a linked step, then press Back.
Expected: the input reads **`5`** — the value that was on screen when the root was left. (If you expected `3` here, that is the "literal opened value" semantics flagged in `plan.md` → Assumptions; report it rather than changing the code unilaterally.)

- [ ] **Step 6: Confirm the `RecipeCard` surface**

Go to `/search`, set a recipe card's servings pill to `4`, open the card's fullscreen view, then switch variant via the calorie dropdown.
Expected: the modal opens at `4` and stays at `4` across the variant switch — this is the second surface the fix cures, per `plan.md` → Risks.

### Task 8: Update the PR description — OUTSTANDING (developer-owned)

- Skill: none — vanilla documentation, no code convention applies.

> A full draft covering every bullet below has been written to `pr-description.md` in this folder, with the Task 7 smoke results left as `_TBC_`. The pipeline did not publish it: pushing text to the hosting provider is an outward-facing action, and the smoke results are not yet known. Fill in the smoke table, then paste it into the PR.

**Files:**
- Modify: the PR description on the hosting provider (no repo file)
- Draft source: `.claude/contract/2026-07-30-modal-servings-revert/pr-description.md`

- [ ] **Step 1: Write the PR description**

Include:
- Link to this contract folder: `.claude/contract/2026-07-30-modal-servings-revert/`.
- Summary: the modal's stack-sync effect could not distinguish initial stack seeding from navigation, because `prevStackRecipeId` was seeded from `stackRecipe?.id` while `fullRecipe` was still `null`. It now seeds from the `recipeId` prop, and a `rootServingsRef` restores the root's servings on back-navigation.
- The verified smoke results from Task 7, scenario by scenario, and the measured line count from Task 5.
- An explicit statement that **no automated test covers this** — there is no frontend test runner — and that verification was `npm run build` plus the manual run above.
- A one-line note for future contributors: a ref used to distinguish "first seed" from "changed" must be seeded from a value available on the *first* render; seeding it from state that arrives asynchronously makes the first arrival indistinguishable from a change.
- A note that this also changes `RecipeCard` behaviour (servings now survives opening the modal and switching variants).

---

## Self-review

**Spec coverage:**
- In-scope: *no reset on initial stack seeding* — Task 3.
- In-scope: *back-navigation restores the root's servings* — Tasks 3 (read side) and 4 (capture side); verified by Task 7 Steps 4–5.
- In-scope: *navigating into a linked recipe still resets to its own default (FR-095)* — Task 3's `stackRecipe.defaultServings || DEFAULT_SERVINGS` branch; verified by Task 7 Step 3.
- In-scope: *`resetServings` stable + normalising* — Task 2.
- In-scope: *`DEFAULT_SERVINGS` constant replaces the `|| 1` literals* — Task 1, consumed in Tasks 2 and 3, audited by Task 6 Step 2.
- In-scope: *verification by build + scripted manual smoke* — Tasks 2/3/4 Step "confirm the client still builds", plus Task 7.
- Out-of-scope guard: no task touches `foodbytes-api/`, `database/`, `MealPlanEntry.jsx`, or `RecipeCard.jsx` — consistent with `plan.md` Part 1, where the backend audit found no defect.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every code step shows the exact before/after text; every verification step carries a `Run:` and a concrete `Expected:`.

**Type / name consistency:** `DEFAULT_SERVINGS` is declared in Task 1 and imported identically in Tasks 2 and 3. `prevStackRecipeId` and `rootServingsRef` are introduced in Task 3 and consumed in Task 4 with the same names and the same `useRef` types recorded in `plan.md` → Data shapes. `resetServings`'s widened signature (`number|string|null`) matches Data shapes and is called with a `number` in both Task 3 branches. `canGoBack` and `currentServings` used in Task 4 are pre-existing destructured values, not new identifiers.

**Phase boundary cleanliness:**
- Phase 1 — ends green: both edits are additive and backwards-compatible with the two existing `resetServings` call sites; runtime behaviour is unchanged, verified by a build.
- Phase 2 — ends green: Task 3 alone fully fixes the reported defect and builds; Task 4 adds only the back-navigation capture. No half-applied rename or dangling reference exists between them, since Task 4's identifiers are all introduced by Task 3.
- Phase 3 — no production changes; measurement, greps, and manual verification only.
