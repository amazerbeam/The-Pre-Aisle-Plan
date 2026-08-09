# Add traffic-light macro targets to daily/weekly meal plan summary popups

**Plan:** [`plan.md`](./plan.md) (this folder)
**Jira issue:** [MPP-2](https://amazerbeam.atlassian.net/browse/MPP-2)

## Summary

The Protein/Carbs/Fat tiles in `DailyMacroPopup` and both sections of `WeeklyMacroPopup` ("Weekly Totals" and "Daily Average") are now clickable and open the existing recipe-level `MacroTargetPopup` — the same value/status/band/"why this target"/sourcing explainer the recipe card already shows — evaluated against new daily and weekly target tables instead of the per-serving one:

- **Protein** gets a new fixed floor: **≥100 g/day** (daily popup and Daily Average section) and **≥700 g/week** (Weekly Totals section, exactly 7× the daily floor). Derived from the same USDA 1.2–1.6 g/kg/day range (≈96–129 g/day for an 80 kg reference adult) already cited for the existing per-serving 35 g floor.
- **Carbs and fat** are **reused directly** from the existing per-serving `MACRO_TARGETS` bands (40–50% and 25–35% of kcal respectively) — literally the same object reference, not a copy, since % of kcal is scale-invariant between a meal, a day, and a week.

`MacroTargetPopup.jsx` gained three optional props (`targets`, `periodLabel`, `footerNote`), each defaulting to today's exact per-serving behavior, so `MacroBadgeRow.jsx` (the recipe-card caller) needed zero edits and its output is unchanged. `macroStatus.js`'s `bandFor`/`evaluateMacro` gained an optional third `targets` parameter, defaulting to `MACRO_TARGETS`, for the same reason.

A pre-existing-but-latent portal/outside-click bug was fixed in both `DailyMacroPopup.jsx` and `WeeklyMacroPopup.jsx` as part of this change: nesting a `createPortal`-rendered `MacroTargetPopup` inside either popup would previously let a click inside the nested popup incorrectly bubble to the parent's native `document.mousedown` listener and close it out from under the child. Both now short-circuit via `e.target.closest('.macro-target-overlay')`.

## Migration

**None required.** This task touches no backend, entity, DTO, or `/api/...` endpoint — confirmed in `plan.md` Part 1 → Cross-code alignment audit. All changes are in `foodbytes-app/client/src/`; the daily/weekly totals were already computed and passed into these two components before this change.

## Files changed

- `foodbytes-app/client/src/constants/macroTargets.js` — added `DAILY_PROTEIN_FLOOR_G`, `WEEKLY_PROTEIN_FLOOR_G`, `MACRO_COPY.DAILY_NOTE`, `DAILY_MACRO_TARGETS`, `WEEKLY_MACRO_TARGETS`.
- `foodbytes-app/client/src/utils/macroStatus.js` — `bandFor`/`evaluateMacro` take an optional third `targets` parameter, default `MACRO_TARGETS`.
- `foodbytes-app/client/src/utils/macroStatus.check.mjs` — new band-boundary assertions for daily/weekly protein, carbs/fat-reuse-by-reference assertions, and the copy-hygiene loop extended to the two new target tables.
- `foodbytes-app/client/src/components/recipes/MacroTargetPopup.jsx` — new optional props `targets`, `periodLabel`, `footerNote`.
- `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.jsx` — clickable macro tiles, `openMacroKey` state, nested `MacroTargetPopup`, outside-click portal guard.
- `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.css` — `.macro-item` becomes an accessible `<button>` (44px min height, `:active`, `:focus-visible`, touch affordances).
- `foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.jsx` — clickable macro tiles in both sections, shared `openMacro` state (`{ key, scope }`), nested `MacroTargetPopup`, outside-click portal guard.
- `foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.css` — `.macro-summary-item` becomes an accessible `<button>`.

## Verification results

**Automated (ran and passed):**
- Phase 1: `node src/utils/macroStatus.check.mjs` — all assertions pass, including the new daily (100g floor) / weekly (700g floor) band-boundary checks and the carbs/fat same-object-reference checks. Re-run at the end of Phase 5 with the full cumulative diff — still passes, exit code 0.
- Phase 2, 3, 4, 5: `npm run build` — passes cleanly each time, no errors, no new warnings. Final Phase 5 build: `✓ 179 modules transformed`, `✓ built in 855ms`.

**No frontend test runner exists** (`client/package.json` has none, per the `react-frontend` skill) — everything below is either a static/compiled-artifact check or a manual browser check, called out explicitly rather than described as "tested":

| Check | Status | How verified |
|---|---|---|
| Per-serving popup (`MacroBadgeRow` → `MacroTargetPopup`) unchanged | **Statically traced, not live** | Read `MacroBadgeRow.jsx`: it passes no `targets`/`periodLabel`/`footerNote`, so all three new props default to the exact prior hardcoded values. File was not edited. |
| Daily popup: click tile → popup opens, correct band/value | **MANUAL VERIFICATION NEEDED** | Not live-driven (no browser automation invoked this session). Code path traced: `onClick={() => setOpenMacroKey('protein')}` → conditional render with `targets={DAILY_MACRO_TARGETS}`. |
| Outside-click portal fix (Daily) | **MANUAL VERIFICATION NEEDED** | Statically traced: `MacroTargetPopup`'s outermost node is `.macro-target-overlay` rendered via `createPortal(document.body)`; `DailyMacroPopup`'s `handleClickOutside` now returns early on `e.target.closest('.macro-target-overlay')` before it can reach `popupRef.current.contains(e.target)`. Live interaction unverified. |
| Weekly popup: both sections, correct scope/subtitle per tile | **MANUAL VERIFICATION NEEDED — not yet attempted** | Task 10 Step 2 in `tasks.md` was left unticked by the implementing phase; no static or live check was recorded for it. Needs a developer or QA pass before this ships. |
| Outside-click portal fix (Weekly) | **Statically traced, not live** | Identical guard as Daily, same `.macro-target-overlay` closest() check applied in `WeeklyMacroPopup.jsx`. Live interaction unverified. |
| Touch target size (≥44px), Daily popup tiles | **MANUAL VERIFICATION NEEDED** | Confirmed only via the compiled CSS bundle containing `.macro-item { ... min-height: 44px; ... }` and the `:focus-visible` rule — not a rendered-viewport visual check. |
| Touch target size (≥44px), Weekly popup tiles (both sections) | **MANUAL VERIFICATION NEEDED — not yet attempted** | Task 11 Step 3 in `tasks.md` was left unticked; no static or live check was recorded. |
| Keyboard focus (`:focus-visible` outline) | **MANUAL VERIFICATION NEEDED** | CSS rule confirmed present in source/compiled output; actual tab-and-observe behavior not driven this session. |
| ARIA state (`aria-haspopup`, `aria-expanded`) | **Statically traced, not live** | Confirmed present in JSX for all 9 tiles (3 Daily, 3+3 Weekly) by reading the diff; not confirmed against a live accessibility tree/screen reader. |
| Grep audits (Task 12) | **Live-run, passed** | `MACRO_TARGETS[macroKey]` stale reference: 0 hits. `targets = MACRO_TARGETS` default param: exactly 2 hits. Portal guard (`macro-target-overlay`) in both popups: exactly 1 hit each. `console.log`/`console.debug`: see note below — no new hits in any shipped file this plan edited; one net-new line inside `macroStatus.check.mjs`'s own pass/fail reporting convention (plan-mandated in Task 4, not a leftover debug statement). |

**Honest summary: nothing involving a rendered browser (click-through, live focus ring, live touch-target measurement, live outside-click dismissal) was actually driven this session.** Everything in the "MANUAL VERIFICATION NEEDED" rows above needs a developer or QA pass with the dev server running before this is considered UI-verified. Two specific gaps carry over unresolved from Phase 4: the Weekly popup's both-sections click-through (Task 10 Step 2) and its touch-target/focus check (Task 11 Step 3) were never attempted at all — not even statically traced — and should be prioritized first.

## Convention for future contributors

`evaluateMacro(macros, key, targets = MACRO_TARGETS)` and `bandFor(key, subject, targets = MACRO_TARGETS)` now take an optional third `targets` argument, and `MacroTargetPopup` takes optional `targets` / `periodLabel` / `footerNote` props (all defaulting to reproduce today's per-serving behavior exactly). **Any future aggregate-scale traffic light (e.g. a monthly view) should follow this same pattern** — a new target table in `macroTargets.js` shaped like `{ protein, carbs, fat }`, reusing `MACRO_TARGETS.carbs`/`.fat` by reference wherever the underlying band is scale-invariant (% of kcal), plus a `periodLabel`/`footerNote` passed into the existing `MacroTargetPopup` — rather than forking a new popup component or duplicating the evaluation logic.
