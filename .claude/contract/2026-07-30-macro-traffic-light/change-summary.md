# Change summary — FR-104: Macro traffic light on the P / C / F badges

Written for Task 10. There is no PR flow configured on this repo, so this replaces the PR description.

## What changed

Seven new files, four modified. All under `foodbytes-app/client/`. **No backend, DTO, SQL, or migration change** — this is a presentation layer over three fields the API already returns.

**Created**
- `src/constants/macroTargets.js` — the band table. Thresholds, status vocabulary (`MACRO_STATUS`, `MACRO_MODE`), reject flags, `why` copy, `MACRO_COPY`, and a `sources` array attributing every claim. Single source of truth.
- `src/utils/macroStatus.js` — pure evaluation: `deriveKcal`, `hasMealMacroTargets`, `hasUsableMacros`, `bandFor`, `evaluateMacro`. No React, no DOM.
- `src/utils/macroStatus.check.mjs` — dependency-free `node:assert` verification.
- `src/components/recipes/MacroBadgeRow.jsx` + `.css` — the three traffic-lit badge buttons; owns `openMacroKey`.
- `src/components/recipes/MacroTargetPopup.jsx` + `.css` — the detail modal, portalled to `document.body`, with mobile pull-to-dismiss.

**Modified**
- `src/styles/global.css` — 16 `--macro-*` tokens in `:root` (base / `-tint` / `-pill-bg` / `-pill-text` per status).
- `src/components/recipes/RecipeViewModal.jsx` — one import, one `selectedVariant` derivation, inline macro markup replaced with a 5-line `<MacroBadgeRow />`.
- `src/components/recipes/RecipeViewModal.css` — `.recipe-macros*` rules removed (relocated).
- `package.json` — added `check:macros`. No dependency change.

## Why this approach

- **Extraction, not an inline edit.** `RecipeViewModal.jsx` sits against a 400-line blocking budget, and rule evaluation does not belong in a component. Both are `react-frontend` hard rules.
- **Band table in `constants/`** so the thresholds are declared once. Bands are ordered *for evaluation* (first match wins, each list ends in a catch-all); the popup re-sorts via `STATUS_DISPLAY_ORDER` for *display*. The two orderings are deliberately decoupled.
- **`createPortal`** because `.recipe-view-modal` animates with `transform`, which establishes a containing block for `position: fixed` descendants — an inline popup would clip to the modal.
- **Percentages derive from `4P + 4C + 9F`**, never stored `recipes.calories`, which `CLAUDE.md` records as historically wrong. When the two disagree the popup shows both, turning the mismatch into a data-bug detector.

## What was verified

Mechanically, from `foodbytes-app/client/`:

- `npm run check:macros` — **8 assertion groups, exit 0**: 20 band boundaries (both sides of every threshold), `deriveKcal`, zero/null-macro guards, usable-macro-data, component-vs-meal (including the `'extras'`/`'Extras'` casing trap), 5 end-to-end recipes, status-map completeness, copy hygiene + attribution.
- The red-check was genuinely observed: with `macroStatus.js` moved aside the script failed with `ERR_MODULE_NOT_FOUND` naming it, and the file was restored.
- `npm run build` — clean, 0 errors, 179 modules.
- Grep audits: 5 `console.log|debug` in shipped `src` (all pre-existing; none in the new files), no `*.module.css`, no `.ts`/`.tsx`, no `localhost:8080`, only the pre-existing `axios.create`.
- Line counts, by the skill's prescribed `(Get-Content <f> | Measure-Object -Line).Lines`: `RecipeViewModal.jsx` 374, `MacroTargetPopup.jsx` 203, `MacroBadgeRow.jsx` 112, `macroTargets.js` 236, `macroStatus.js` 118.
- Two full review rounds (Code-Evaluator + Defender + QA in parallel), 9 triaged fixes, then 2 closing fixes.

## What was NOT verified

**No automated component or interaction tests exist, because this client has no test runner.** Nothing below has been exercised — the predicates are unit-asserted, the *rendering* is not:

- The popup rendering, the portal, Escape precedence, click-outside containment, focus restore, and the ghost-popup reset.
- Colour contrast. The blue `#4aa3f0` tint over the `#4a3f80` brand purple is the known risk; `#56ccf2` is the documented fallback.
- All mobile behaviour: bottom sheet, pull-to-dismiss, the 320 px badge row, the 320×568 scroll case.

No claim is made that "tests pass" beyond the pure band logic that `check:macros` covers. The 14 manual browser checks in Task 9 remain outstanding and are the developer's.

## Mobile

Bottom sheet under 480 px; pull-to-dismiss via the **existing** `usePullToDismiss` hook and `PullToDismissUI` rather than a new gesture (both reused unmodified); ≥44 px hit areas on a visually compact pill; a 400 px wrap rule that drops padding/gap and pushes `/ serving` onto its own line, because a rejecting badge carries five children; `prefers-reduced-motion` honoured; `env(safe-area-inset-bottom)` on the hint footer. **None of this was run on touch emulation** — Task 9 Steps 4–7 are unrun.

## Copy and attribution

No rendered string names an internal file, skill, rule, `FR-` number, or table. `check:macros` enforces the banned-token list mechanically over `label`, `perfect`, every band `range`/`meaning`, every `why` paragraph, every `sources` entry, **and** the four `MACRO_COPY` strings that previously sat outside its reach. Every claim in "Where this comes from" names either an external body (USDA, Moore & Morton) or identifies itself as a FoodBytes decision. The carb band states that it is *deliberately below* standard guidance rather than derived from it. The assertion catches banned tokens, not clumsy phrasing — Task 9 Step 14 still needs a human read.

## Accessibility

The state never depends on colour alone: each badge carries a direction arrow (`↓ / ✓ / ↑`), a `⚠` on any reject band, and an `aria-label` stating status, direction, and rejection in words. 44 px hit areas, `:focus-visible`, `@media (hover: hover)` paired with `:active`, `role="dialog"` + `aria-modal="true"`, `prefers-reduced-motion`. Focus moves to the close button on open and is **restored to the originating badge** on every close path.

**Two deliberate gaps:** there is no Tab-cycle focus trap — consistent with the existing `DailyMacroPopup`, but it means `aria-modal="true"` overstates modality. And `.macro-target-here` ("You are here") is `display: none` below 480 px for legibility, which also removes it from the accessibility tree, so mobile screen-reader users identify the current band only by its highlighted border.

## Scope boundary

Component recipes (`Extras`-only — Pesto 10, Pizza Dough 11, Pizza Sauce 12, Milk Bread 26, Pita Bread 117) deliberately show grams **without** a verdict: the per-meal targets do not govern a sub-component, and measured against them Pesto (1 g protein, 95 % fat) would show three rejections for being correct pesto. That branch is now shared with the missing-data route. **Not yet verified in a browser** — Task 9 Step 13.

Out of scope and untouched: the kcal badge, `DailyMacroPopup`/`WeeklyMacroPopup`, `RecipeCard`, anything under `foodbytes-api/` or `database/`, and any persistence (the only state is `openMacroKey` in `useState`).

## Risk and debt

- **`--macro-under-target` shipped at `#4aa3f0`, unverified for contrast.** Blue-on-purple is a hue neighbour, so the badge may read as "no state set". Fallback `#56ccf2`. The 16-token layout means a retune is a one-place edit — but `--macro-under-target-pill-text` should be re-checked for AA at the same time.
- **Red no longer means "must fix".** Colour encodes *direction*, so a documented reject is blue for protein/carbs and red for fat, while carbs over 50 % is red but breaches nothing. Severity is carried by the `⚠` marker alone.
- **`hasMealMacroTargets` keys off `mealTypes`**, a data-entry field with no admin validation, so a mis-tagged recipe is mis-rendered: a real meal tagged only `Extras` silently loses its light. Absent/empty `mealTypes` keeps the light **on**, so a serialisation change fails visibly.
- **`RecipeViewModal.jsx` measures 374 by the skill's prescribed command but 406 raw physical lines** — the two differ by 32 blank lines, and the skill's own debt table records a third number (393). It is inside budget as the rule defines it, but any conventional line count (`wc -l`, a CI linter, an editor gutter) reads it as over 400. **The next feature touching this file should extract, not add.**
- **`MacroTargetPopup.css` forks ~100 lines of `DailyMacroPopup`'s shell** (overlay, keyframes, panel, header, close button, content scroller, hint, bottom sheet) instead of reusing its `.macro-popup*` classes the way `WeeklyMacroPopup` does. Accepted as real DRY debt and **deferred**: it is a visual restructure of a shell approved via the reviewed mockup, and no browser verification has run. Developer's call.
- **`hasUsableMacros` uses a bare `> 0`.** A recipe whose ingredients mostly carry NULL per-100g macros could derive ~12 kcal and still light up with rejections. Any plausibility floor would be an invented number.
- Percentages are computed from already-rounded integer grams, so they can be ~1 point off the true ratio — at a boundary (39 % vs 40 % carbs) that can flip amber/green. Fixing it properly needs unrounded macros from the API.
- Minor: the copy-hygiene assertion checks `MACRO_COPY` content but not its *shape*, so a deleted key would render `undefined` silently.
