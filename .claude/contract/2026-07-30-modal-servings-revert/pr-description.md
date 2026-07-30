# Fix: recipe view modal reverted planned servings to the recipe default

Contract: `.claude/contract/2026-07-30-modal-servings-revert/`

> **Draft** — Task 8 asks for this on the hosting provider. Paste it into the PR description there; this file is the source copy, not the deliverable itself. Fill in the Task 7 smoke results before publishing.

## The bug

Opening a meal-plan entry planned at 3 servings showed `3` for a moment, then settled on `2` — the recipe's own `default_servings` — and every ingredient quantity below was then scaled for 2 servings instead of 3.

`RecipeViewModal`'s stack-sync effect could not distinguish *"the navigation stack was seeded with the root recipe for the first time"* from *"the user navigated to a different recipe"*. Both present as `stackRecipe.id` differing from the last id seen, because `prevStackRecipeId` was seeded from `stackRecipe?.id` during the first render — when `fullRecipe` is still `null`, the stack is empty, and that read is `undefined`. When the on-mount fetch resolved and seeded the stack, the effect read it as navigation and reset servings to `defaultServings`.

The whole defect was client-side. The `servings` chain was audited end to end (`meal_plan_entries.servings` `DECIMAL(4,2) NOT NULL` → `MealPlanEntry.servings` `BigDecimal` → `MealPlanEntryDTO` → `MealPlanService.buildEntryDTO` → JSON → `MealPlanEntry.jsx` → the modal prop) and found correct at every hop. **No backend, DTO, entity, or database change; no migration.**

## The fix

- `prevStackRecipeId` is seeded from the **`recipeId` prop**, which is known on the first render and is by definition the id the stack will be seeded with. The initial seed now compares equal, the effect no-ops, and the caller's `servings` survives.
- A `rootServingsRef` remembers the root recipe's servings so back-navigation from a linked sub-recipe restores it instead of resetting to `defaultServings`. It is refreshed on the way out of the root, guarded so a push from depth 2 → 3 cannot overwrite it.
- Navigating *into* a linked sub-recipe still resets to that sub-recipe's own `defaultServings` — **FR-095 is unchanged**.
- `resetServings` (`useServingsInput`) is now a stable `useCallback` and normalises its argument through `parseServings`, so it can be an honest effect dependency and cannot push a non-numeric value into the scaling arithmetic.
- `DEFAULT_SERVINGS = 1` in `constants/servings.js` replaces the `|| 1` literal the fallback was spread across.

The check is **id-driven, not depth-driven**, on purpose: `recipeId` is not constant on the `RecipeCard` path, so a variant switch re-seeds the stack at unchanged depth with a different recipe. A depth-driven check would have missed it.

### Also changes `RecipeCard`

Opening the modal from a search-result card with a non-default servings — and switching variants inside it — reset the input the same way. Both stop resetting. Intended, and worth a look during review: it is a second surface changing from a meal-plan bug report.

## Files

| File | Change |
|---|---|
| `client/src/constants/servings.js` | add `DEFAULT_SERVINGS` |
| `client/src/hooks/useServingsInput.js` | `resetServings` → stable `useCallback`, normalises via `parseServings` |
| `client/src/hooks/useRecipeStackServings.js` | **new** — owns the navigation stack, the sync effect, `handleLinkedStepClick`, and the live-value refs |
| `client/src/components/recipes/RecipeViewModal.jsx` | consumes the new hook; 430 → 399 lines |

## Review findings folded in

Three reviewers ran in parallel; both rounds are in the contract folder.

1. **`RecipeViewModal.jsx` was over the 400-line budget.** All three caught it. The logic was extracted into `useRecipeStackServings.js`, bringing the modal to **399** lines.
2. **A stale-closure race.** `handleLinkedStepClick` read `currentServings` from the render closure *after* its `await`, so editing servings while the linked-recipe fetch was in flight snapshotted the pre-edit value and Back restored the wrong number — the same bug class this PR fixes, as a timing gap. Now read from `liveServingsRef` / `liveCanGoBackRef`.
3. **An undocumented invariant.** The fix depends on `recipeId` staying stable for the modal's mount — true today only because `onSelectVariant` is never invoked. Documented in the hook's JSDoc, with a pointer at the prop declaration.

## Two notes for the repo, beyond this PR

**The line-count command in our tooling is wrong.** `(Get-Content $f | Measure-Object -Line).Lines` **silently skips blank lines**. On this file it reported 396 against a true 430 — a 34-line gap, exactly the count of blank lines. Use `(Get-Content $f).Count`.

That matters beyond this PR: the `react-frontend` skill's known-debt table records `RecipeViewModal.jsx` at **380**, which is the same artifact. The file's true pre-change size was **412** — it was already over the 400 ceiling before this contract, and every other figure in that table is suspect until re-measured.

**A ref used to tell "first seed" from "changed" must be seeded from a value available on the *first* render.** Seeding it from state that arrives asynchronously makes the first arrival indistinguishable from a change. That is the entire root cause here.

## Verification

`npm run build` — exit 0, `✓ 173 modules transformed.`, `✓ built in 674ms`.

Grep audit: no `useRef(stackRecipe`, no `defaultServings || 1` in the touched files, `console.log`/`console.debug` at 5 across `client/src` (below the recorded baseline of 6) with zero from the changed files.

**No automated test covers this.** `client/package.json` wires only `dev`, `build`, `preview` — the client has no test runner, and wiring one was deliberately not folded into a defect fix. Verification is the build plus the manual smoke run below. The guard against regression is that smoke script and the comments explaining *why* `prevStackRecipeId` is seeded from the prop.

### Manual smoke — results to fill in before publishing

Needs a backend on `:8080`; the modal's `GET /api/recipes/{id}` is what triggers the defect.

| # | Scenario | Expected | Observed |
|---|---|---|---|
| 1 | `/mealplan` → Sat Jul 4 lunch `Classic Irish Beef Stew` (× 3) | input reads `3`, stays `3` after ingredients load; Beef Chuck `600 g` not `400 g` | _TBC_ |
| 2 | Click a linked instruction step | sub-recipe shows its own `defaultServings`, not `3` (FR-095) | _TBC_ |
| 3 | Press Back | root returns, input reads `3` | _TBC_ |
| 4 | Reopen, set `5`, into a linked step, Back | reads `5` — the value on screen when the root was left | _TBC_ |
| 5 | `/search` → card pill `4` → fullscreen → switch variant | opens `4`, stays `4` | _TBC_ |
| 6 | Linked-step nav, Back control, breadcrumbs still work | unchanged behaviour after the extraction | _TBC_ |

Scenario 6 exists because `handleLinkedStepClick`, `popRecipe`, `canGoBack`, `previousRecipeName`, and `breadcrumbs` all moved into the new hook — that path was restructured after the original plan was written.

Scenario 4 restores the value that was on screen, not the value the modal opened with. Both readings satisfied the confirmed requirement; capturing at push time was the same line count and behaves more intuitively after an edit. If you wanted the literal opened value, it is a one-line change.

## Known residuals

- `RecipeViewModal.jsx` sits at **399 of 400** — one line of headroom. The next addition re-trips the budget; the component wants a fuller decomposition in its own contract.
- `useServingsInput`'s initial `useState(initialServings)` does not go through `parseServings` (only `resetServings` does). Unreachable today — both call sites pass a numeric value — but it is an asymmetry.
- `useRecipeStackServings` also owns navigation plumbing, so the name undersells it. Filename was fixed by the contract; rename is advisory.
- A rapid double-click on two different linked steps can nest the second push onto the first, affecting breadcrumb ordering. Pre-existing in `useRecipeNavigationStack.push`; does not corrupt the remembered servings.
- Variant selection is still lost on back-navigation — pre-existing and orthogonal, but marginally more visible now that servings correctly survives the same round trip.
- A failed linked-recipe fetch still only `console.error`s, leaving a dead click. Pre-existing; deliberately not widened into error-UX work here.
