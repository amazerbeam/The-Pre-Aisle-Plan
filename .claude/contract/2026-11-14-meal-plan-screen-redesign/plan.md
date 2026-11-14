# Plan: Meal Plan + Recipes + Header & Logo + Recipe View + Shopping redesign (web + mobile)

Plan folder: `.claude/contract/2026-11-14-meal-plan-screen-redesign/`
Execution status: see `tasks.md` in this folder.

---

## Part 1 — Alignment

### Task reference
**Brief A, Meal Plan (2026-11-14, verbatim):**

> Meal Plan screen redesign — implement the approved mockup at C:\Users\jossd\Downloads\meal-plan-redesign-mockup.html (web + mobile), ideas 1–8 as revised in conversation: week arrows; This-week tile (kcal + avg/day + week P/C/F chips) + shopping-list stale tile, no eaten/Pip tiles; aligned breakfast/lunch/dinner timetable rows with 2-line names and + Add / ↻ Replace <Meal> (one meal per slot); day headers with kcal + labelled P/C/F chips and visible ⇄ swap, NO calorie ring/target; tick eaten on the plan (one-way, today/past only); labelled toolbar (Copy week, Templates ▾, Extras, Build shopping list); per-meal ⋯ menu (servings, variant, Replace, Move, Remove) with 5s undo; mobile day-chip strip, week macro bar, swipe Replace/Move/Remove, first-run swipe hint persisted in localStorage fb.mealplan.swipeHintSeen until first real swipe.

**Brief B, Recipes, folded in (2026-11-14, verbatim):**

> Fold the Recipes screen redesign INTO the existing contract … (developer instruction: one plan, all done in one go — extend plan.md + tasks.md there, do not create a new folder). Recipes brief: implement approved mockup C:\Users\jossd\Downloads\recipes-redesign-mockup.html ideas 1–8: search + meal tabs with counts (all 5 fit on mobile); "This week's <meal>" strip with empty-day count replacing per-card daily kcal; picking mode via empty day or ?mealType=&date= deep link from Meal Plan "+ Add"/"Replace" (one big Add to <Day> button per card, return to /mealplan when arrived from there); one segmented Light/Moderate/Balanced variant control with kcal; P/C/F macro chips per serving on card (backend: add per-serving macros to RecipeVariantDTO/summary); 3-state day buttons (empty / other recipe → replace tooltip / this recipe ✓) without daily kcal; calmer card (tap name opens recipe, 👥 servings chip stepper, Edit in ⋯ admin, drop random stripe, purple edge + In plan badge); hide recipes per user (⋯ Hide from my recipes, undo, Hidden (n) chip with Unhide; per person, whole family, account-persisted via new table + endpoints, never touches meal plan, separate from admin not-live).

**Brief C, Header & Logo, folded in (2026-11-14, verbatim):**

> Fold the Header & Logo redesign INTO the existing contract … (developer instruction: one plan, all in one go — extend plan.md + tasks.md there). Brief: implement approved mockup C:\Users\jossd\Downloads\header-logo-redesign-mockup.html ideas 1–6 with logo option C · Plate P (chosen 2026-11-14): BrandMark component (purple #4a3f80 rounded tile, white plate, purple P, Pip-green #7cc36b leaf) at 40px web / 36px mobile header, no translucent circle; "My Pantry Plan" wordmark (mark only <360px); desktop ≥1024px nav tabs (Recipes/Meal Plan/Pip/Shopping) in header and bottom Footer nav hidden there; week pill ‹ Nov 9 – 15 › restyling the DateRangePicker already extended in Task 12 (mobile: own full-width row with This week); account menu regrouped (who header, Portions, Meal times, Sign out red at bottom, version line) without changing control logic; logo everywhere: favicon.svg (brand purple), apple-touch-icon 180, icon-192/512/maskable-512 PNGs in public/icons, Apple meta tags in index.html, 72px on LoginModal, 120px on LandingPageAnimation; tab title "My Pantry Plan" + per-route "Meal Plan · My Pantry Plan". Full PWA service worker out of scope.

**Brief D + E, Recipe View and Shopping, folded in (2026-11-14):** the developer said "love it, fold it into the plan" after the Recipe view mockup. The Shopping mockup was presented just before it and was still pending, so both are folded in (see Assumptions). Briefs, verbatim:

> Recipe view: implement approved mockup recipe-view-redesign-mockup.html ideas 1–9: sticky header with plan-context bar (Sat 14 · Dinner + one-tap Mark as eaten, Undo kept, bottom eaten section kept); same variant segment + − n people + stepper as cards; macro chips P g / C % / F % via shared MacroChips (tap → MacroTargetPopup); labelled "Keep screen on" toggle replacing WakeLockIcon padlock (useWakeLock, on by default); ingredient tick-off (screen-only) + fraction display (½ ¼ ⅓ ¾ for non-g/ml); step cards with tap-to-done + current highlight + n/N counter; ▶ Cook mode overlay (one step at a time, step's ingredients by name match, wake lock forced); Extras box with Homemade/Store-bought toggle per linked extra writing the existing HomemadeSelectionsContext / MPP-10 meal choices, linked step as button, store-bought shows alt_instruction with 🛒 tag, macros stay homemade-basis; desktop wide modal (~1040px) two columns with sticky ingredients, mobile full-screen with Ingredients|Steps tabs; split RecipeViewModal (400-line budget).
>
> Shopping: mockup shopping-redesign-mockup.html ideas 1–8: header "For <range> · made <time>" + progress card; Regenerate / other dates / Uncheck all into ⋯ (confirm kept), Hide ticked + Keep screen on visible; new-list default = header week from MealPlanContext with meal count, "Choose other dates" reveals inputs; out-of-date banner via new server boolean planChangedSinceGenerated on the shopping-list response (needs a per-owner plan-changed timestamp since removals leave no row; remove unused shoppingListInvalidated localStorage flag); finished aisles collapse + move last; 52px rows quantity-first + round tick in aisle colour + ⓘ breakdown button (long-press kept); Hide ticked (localStorage) + Keep screen on (useWakeLock); two-column aisles on desktop.

Visual contracts, copied into this folder: **`mockup.html`** (Meal Plan) and **`recipes-mockup.html`** (Recipes) and **`header-mockup.html`** (Header & Logo; logo option C is the one chosen), **`recipe-view-mockup.html`** and **`shopping-mockup.html`**. The clickable all-in-one **`prototype.html`** combines A + B + C + E with shared demo data. It's a reference for how the screens connect; the individual mockups win where they differ. Each has Web / Mobile / Proposal tabs, and the Proposal tab's spec panel lists the rules.

Decisions confirmed in conversation, 2026-11-14:
- No calorie ring, bar or colour anywhere. kcal is a plain number, because a target depends on the person (men vs women).
- Only one meal per slot. A filled slot offers "↻ Replace <Meal>", never "Add another". Dropping a meal onto a filled slot swaps the two.
- Replace is available on mobile through the swipe actions (Replace · Move · Remove).
- The first-run swipe hint is per device (localStorage) and is dismissed only by a real swipe.
- The Eaten-so-far and Pip tiles are removed. Week macros sit beside the week kcal on web and in a slim bar on mobile.
- "Hide meals" means hiding recipes from your own Recipes list. It is per person, hides the whole family, is saved on the account, and never touches the meal plan.
- Logo: **option C · Plate P** (developer's choice, 2026-11-14). Developer's words: the logo "has always been tiny, fix that everywhere".
- plan.md was approved for Brief A, then for A+B, on 2026-11-14. Brief C extends it, and the merged plan is re-submitted for approval.

No Jira key. This is a date-slug plan.

### Restated goal
Rebuild the two screens you plan with, `/mealplan` and `/` (Recipes), to match the approved mockups, keeping every existing feature.

**Meal Plan:**
- **Desktop:** a timetable (breakfast/lunch/dinner rows × 7 days).
  - Day headers show kcal + labelled P/C/F chips and a ⇄ swap button.
  - A This-week tile shows the week's kcal and macros, next to the stale-list tile.
  - Meal cards have a one-way eaten tick and a ⋯ menu: servings, variant, replace, move, and remove with undo.
- **Mobile:** one day at a time, behind a chip strip and week macro bar, with swipe actions and a first-run hint.

**Recipes:**
- The meal tabs show counts and gain a search box.
- A "This week's <meal>" strip shows what's planned and which days are empty.
- **Picking mode:** tap an empty day, or arrive from Meal Plan's "+ Add"/"Replace" link. Every card then offers one "Add to <Day>" button, and you return to the Meal Plan afterwards if you came from there.
- **Cards** get:
  - one Light/Moderate/Balanced segment showing each variant's kcal
  - per-serving P/C/F chips
  - three-state day buttons with no daily kcal
  - a servings chip
  - an admin Edit in the ⋯ menu
  - a meaningful "in plan" edge
- **Hide recipes:** hide any recipe from your list, with Undo, and bring it back from a Hidden (n) view.

**Header & logo:**
- **Logo:** the new Plate P mark is a solid tile (40 px web, 36 px phone) next to a "My Pantry Plan" wordmark.
- **Desktop nav:** on desktop (≥1024 px) the four sections move into the header and the bottom bar goes.
- **Week pill:** the date box becomes a "‹ Nov 9 – 15 ›" pill, on its own row on phones.
- **Account menu:** regrouped; the controls work the same.
- **Logo everywhere else:** the favicon, home-screen icons, the sign-in modal and the landing page all use the same mark.
- **Tab title:** "My Pantry Plan", with the section name per page.

**Recipe view:**
- **Header:** stays pinned with the plan context ("Sat 14 · Dinner" + Mark as eaten) and the same variant switch, servings stepper and P/C/F chips as the cards. "Keep screen on" is now a labelled toggle.
- **Ingredients:** tick-off, with nicer fractions.
- **Steps:** cards you can mark done, plus a ▶ Cook mode.
- **Extras:** a Homemade/Store-bought box per extra.
- **Layout:** two columns on desktop; Ingredients | Steps tabs on phones.

**Shopping:**
- **Header:** a calmer header with a progress bar; the rare actions go into ⋯.
- **New list:** defaults to the week you planned.
- **Out-of-date warning:** a banner that also catches a partner's edits.
- **Aisles and rows:** finished aisles fold away; rows are bigger with the quantity first and an ⓘ breakdown.
- **In-shop toggles:** Hide ticked and Keep screen on.
- **Desktop:** two columns.

**Backend support:**
- one meal-plan PATCH (move/servings)
- per-serving macros on the recipe summary
- a per-user hidden-recipes table with three endpoints

### In scope
**Meal Plan (A1–A10):**
1. **A1 Week arrows:** ‹ › and "This week" around the date range in the header (`DateRangePicker`). Tapping the range still opens the native date input.
2. **A2 Week summary (web):** a "This week" tile (week kcal, avg/day, planned X of 21, week P/C/F avg-per-day chips; click opens `WeeklyMacroPopup`) plus the shopping-list stale tile. No eaten or Pip tiles.
3. **A3 Desktop timetable:** row labels; 2-line meal names; `+ Add <meal>` in empty slots; `↻ Replace <Meal>` on a filled slot. Both deep-link to Recipes picking mode (B3).
4. **A4 Day header:** kcal + labelled P/C/F chips (`DAILY_MACRO_TARGETS`). Click opens `DailyMacroPopup`; a visible ⇄ opens `SwapDaysModal`. No ring.
5. **A5 Eaten tick on the card:** one-way via `setEntryEaten`, today/past only, with a "Marked as eaten" toast.
6. **A6 Labelled toolbar (web):** Copy week, Templates ▾, Extras, and a primary "Build shopping list →". The mobile ⋯ sheet adds "Swap two days…".
7. **A7 Per-meal ⋯ menu (web):** servings, variant, Replace, Move, Remove (5 s undo); drag-and-drop move/swap.
8. **A8 Mobile layout:** week macro bar, day-chip strip, day summary card, large cards, swipe Replace / Move / Remove, bottom sheets.
9. **A9 First-run swipe hint:** stored as `fb.mealplan.swipeHintSeen`, set on the first real swipe (≥70 px), with reduced-motion support.
10. **A10 Backend `PATCH /api/meal-plan/{id}`:** move (swapping with the occupant) and/or servings, honouring `meal_plan_owner_id`.

**Recipes (B1–B10):**

11. **B1 Search + tabs with counts:** a search box filters the current tab by name (client-side). Each tab shows a count. All five tabs fit at 390 px.
12. **B2 Week slot strip:** "This week's <meal>", 7 day tiles (recipe name or amber "+ Pick one") and an "N days still empty" count. Tapping a planned tile opens that recipe; tapping an empty tile enters picking mode for that day.
13. **B3 Picking mode:** entered from an empty tile, or from `/?mealType=<key>&date=<yyyy-mm-dd>&from=mealplan`.
    - A banner reads "Picking <meal> for <Day> <n>", with a Cancel button.
    - Each card shows one full-width button: "Add to <Day>", "Replace on <Day>", or "✓ On <Day>".
    - After a successful add, picking mode exits. If `from=mealplan`, the app navigates back to `/mealplan`.
14. **B4 Variant segment:** Light / Moderate / Balanced with per-serving kcal, shown when the family has ≥2 members. It replaces the "cal ▾" dropdown and the static variant label. Non-family recipes show "<kcal> kcal per serving".
15. **B5 Macro chips on the card:** P g / C % / F % per serving for the selected variant, using `MACRO_TARGETS` (meal-level). Backend: `RecipeVariantDTO` and `RecipeSummaryDTO` gain `proteinPerServing`, `carbsPerServing`, `fatPerServing`.
16. **B6 Three-state day buttons:** empty (white) / another recipe (grey + dot, title "Replace <name> on <Day>") / this recipe (filled ✓, title "Remove from <Day>"). No daily kcal. The extras popup (FR-087) is unchanged.
17. **B7 Calmer card:**
    - Tapping the name opens `RecipeViewModal`.
    - Servings become a "👥 n ▾" chip with a stepper popover.
    - A ⋯ menu holds View recipe, Hide/Unhide, and Edit (admin only).
    - The random stripe goes; a purple left edge + "In plan" badge shows when any variant is in this week's plan.
    - Cheat stays for everyone; Audited stays admin-only.
18. **B8 Hide recipes:**
    - ⋯ → "Hide from my recipes" hides the card at once, with a 5 s Undo.
    - A "🙈 Hidden (n)" chip toggles a Hidden view with Unhide.
    - Hiding is per person and whole-family, and is stored server-side. It never changes the meal plan, and it is separate from admin `is_live`.
19. **B9 Hidden-recipes backend:**
    - migration `user_hidden_recipes`, plus entity and repository
    - `HiddenRecipeService` (normalises to the family's default recipe id)
    - `HiddenRecipeController` with `GET` / `PUT {id}` / `DELETE {id}` under `/api/hidden-recipes`
20. **B10 Mobile Recipes layout:** a sticky search + tabs + filter chips block; a compact strip (day + dot); single-column compact cards.

**Header & Logo (C1–C7):**

21. **C1 `BrandMark` component:** an inline SVG of logo C (`#4a3f80` rounded tile, white plate, purple "P", `#7cc36b` leaf) with a `size` prop. Used at 40 px (web header) and 36 px (mobile header). The translucent `.logo-btn` circle is removed; the mark is the tile.
22. **C2 Wordmark:** "My Pantry **Plan**" beside the mark, in the same button (still → Recipes, FR-039). Mark only below 360 px wide.
23. **C3 Desktop nav in the header (≥1024 px):** Recipes / Meal Plan / Pip / Shopping tabs with the active one highlighted, keeping today's guest gating (sign-in nudge for Meal Plan, Pip and Shopping). `Footer` hides at ≥1024 px, and `--footer-clearance` becomes 0 there. Below 1024 px nothing changes.
24. **C4 Week pill:** restyle the `DateRangePicker` (already extended with ‹ › / "This week" in Task 12) into a pill showing "📅 Nov 9 – 15". Tapping the range opens the native date input. On mobile the header becomes two rows (brand + avatar / full-width week pill).
25. **C5 Account menu regrouped:**
    - a tinted "who" header (avatar, name, email)
    - a **Portions** section (`DefaultPortionsControl`)
    - a **Meal times** section (`MealTimesControl`)
    - **Sign out** in red, last
    - the `VersionInfo` line at the bottom

    Control logic is unchanged.
26. **C6 Logo everywhere:**
    - `public/favicon.svg` redrawn as logo C in the brand purple
    - `public/icons/apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`
    - a static `public/manifest.webmanifest` listing them
    - Apple meta tags + manifest link in `index.html`
    - `BrandMark` 72 px in `LoginModal`, 120 px in `LandingPageAnimation`
27. **C7 Tab title:** `index.html` `<title>My Pantry Plan</title>`, plus a per-route title: "Recipes · My Pantry Plan", "Meal Plan · My Pantry Plan", "Pip · My Pantry Plan", "Shopping · My Pantry Plan".
28. **D1 Recipe-view header:** pinned (sticky) title row with ← back crumbs (FR-092 unchanged), close, the Cheat badge, a **plan-context bar** when opened from an entry ("{Dow} {n} · {Meal}" + one-tap Mark as eaten / ✓ Eaten), `VariantSegment`, a "− n people +" stepper, `MacroChips` (tap → `MacroTargetPopup`), and a labelled **🔆 Keep screen on** toggle (`useWakeLock`, on by default, hidden when unsupported). The bottom `MealEatenSection` (with Undo) stays.
29. **D2 Ingredients panel:** tap-to-tick rows (component state only, reset on close), quantities through a new `formatQuantity` (¼ ⅓ ½ ⅔ ¾ for non-g/ml units; g/ml whole numbers), and a "for n people" sub-heading.
30. **D3 Steps:** cards with a big number. Tapping toggles done; the first not-done step is highlighted as current; the heading shows "n/N done". Linked steps render as an "Open {recipe} recipe →" button when homemade, or the `altInstruction` + "🛒 Store-bought {name}" tag when store-bought (FR-091 logic unchanged).
31. **D4 Cook mode:** a full-view overlay with one step at a time, a progress bar, the ingredients whose names appear in the step, ← Back / Next step → / Finish, and the wake lock forced on while open.
32. **D5 Extras panel:** one row per linked extra in the recipe, with a Homemade / Store-bought toggle and "Open recipe →".
    - **Opened from a plan entry:** the toggle writes that meal's own choice (MPP-10, `PUT /api/meal-plan/extras/week/choices`, then a week refetch).
    - **Opened anywhere else:** it writes the dish default via `HomemadeSelectionsContext.saveSelections`.
    - Macros stay homemade-basis (project rule).
33. **D6 Layout:** desktop is a wide modal (`min(1040px, 100% − 48px)`) with ingredients in a sticky left column and steps on the right; mobile (≤768 px) is full screen with **Ingredients | Steps** tabs. `RecipeViewModal.jsx` is split so no file exceeds 400 lines.
34. **E1 Shopping header + progress:** "Shopping list", then "For **{range}** · made {Ddd d Mmm, HH:mm}", a progress card ("n / N", a green bar, "x% in the basket" / "All done 🎉").
35. **E2 Actions:** ⋯ menu with "↻ Regenerate for {list range}", "📅 New list for other dates…" and "☐ Uncheck all…" (the existing `ConfirmDialog` is kept). Visible buttons: 🙈 Hide ticked / 👁 Show ticked and 🔆 Keep screen on.
36. **E3 Generate dialog:** defaults to the header week (`MealPlanContext` `startDate`/`endDate`) and shows "{n} meals" planned in it. "Choose other dates…" reveals today's two date inputs. The replace warning is kept.
37. **E4 Out-of-date banner:** "Your meal plan changed after this list was made" + Regenerate (same dates), driven by `planChangedSinceGenerated` on `GET /api/shopping-list`. The unused `shoppingListInvalidated` localStorage writes in `MealPlanContext` and `HomemadeSelectionsContext` are removed.
38. **E5 Finished aisles:** an aisle whose items are all ticked collapses to "✓ {Aisle} n/n" and renders after the unfinished aisles. Tapping it toggles it open. Unticking restores normal order.
39. **E6 Rows:** 52 px rows with a round tick filled in the aisle colour, the quantity first ("750 g"), and the name. An ⓘ button opens the existing `IngredientBreakdownPopup` (the same fetch as the long-press, which is kept). ⓘ is hidden on ticked rows.
40. **E7 In-shop toggles:** Hide ticked (persisted per device in localStorage `fb.shopping.hideTicked`, try/catch) with a "n ticked hidden" note per aisle; Keep screen on (`useWakeLock(false)`, released on unmount).
41. **E8 Desktop columns:** aisles flow into two CSS columns at ≥900 px.
42. **E9 Backend `planChangedSinceGenerated`:**
    - a new `shopping_lists.plan_fingerprint CHAR(64) NULL` column (migration) and a `MealPlanFingerprintService`
    - generation stores the fingerprint
    - `GET` recomputes it and compares

### Explicitly out of scope
- Any calorie target, ring, bar or per-person kcal goal.
- Snacks rows in the Meal Plan timetable, unless some day has a snack (see Assumptions).
- Pip tiles, Pip copy in toasts, and any Pip reward change.
- Redesigning the modals themselves (Copy week, Templates, Extras, Swap days, RecipeViewModal, ExtrasSelectionPopup, RecipeEditModal, macro popups). Only their triggers move.
- The mockup's decorative "✓ Audited only" and "↑ Most protein" mobile filter chips. They weren't in the brief (B1 names search + tabs + Hidden only). Flagged under Risks.
- Server-side search. The existing `/summaries/search` endpoint stays unused by this UI.
- Admin `is_live` behaviour and the admin recipe editor.
- Recipe or macro data changes. No recipe rows are edited, so the recipe-variant / linked-extras rules are read-only context.
- The PWA bootstrap (`vite-plugin-pwa`, service worker, offline caching). Brief C adds icons and a static manifest only.
- The Pip and Shopping screens' own content; the header redesign doesn't restyle them.
- The other two logo options (A, B) and any wordmark font download (system font only).
- Header on `/pet`: it stays hidden there, as today (`pipMode` in `App.jsx`).
- **Recipe view:**
  - Persisting ingredient ticks, step progress or cook-mode position, and cook-mode timers.
  - Recipe images.
  - Changing the recipe editor or step data.
  - Editing a variant's macros.
- **Shopping:**
  - Sharing or exporting the list.
  - Manual items.
  - Changing aggregation, units or the aisle order.
  - Changing which dates `generateShoppingList` aggregates (it still uses `startDate`, as today).
- Undo for eaten ticks (MPP-12: one-way).

### Pattern Reference
None supplied beyond the mockups. Chosen:
- **Visual contracts:** `mockup.html` and `recipes-mockup.html` (this folder).
- **Optimistic per-entry update:** `client/src/hooks/useEntryEaten.js`.
- **Bottom sheet:** `hooks/usePullToDismiss.js` + `common/PullToDismissUI`, as used by `DailyMacroPopup`.
- **Menu/scrim/ghost-click:** `components/mealplan/MealPlanMenu.jsx`.
- **Macro status:** `utils/macroStatus.js#evaluateMacro`, `constants/macroTargets.js` (`DAILY_MACRO_TARGETS` for days/week, `MACRO_TARGETS` for a single meal, as in `MacroBadgeRow`).
- **Backend move:** `MealPlanService#swapDays`; controller style from `MealPlanController#setEaten`.
- **Recipe view:** `RecipeViewModal.jsx` (variant fetch, `useRecipeStackServings`, `useLinkedStepSelections`, `LinkedRecipeNavigation`), `RecipeStepsSection.jsx` (FR-091), `MealEatenSection.jsx` (MPP-12/33), `useWakeLock` / `WakeLockIcon`.
- **Shopping:** `ShoppingList.jsx`, `ShoppingListHeader.jsx`, `ShoppingListAisle.jsx`, `ShoppingListItem.jsx` (FR-042 long-press), `GenerateShoppingListModal.jsx`, `ShoppingListContext` (FR-024 sort); backend `PersistedShoppingListService`, `PersistedShoppingListDTO`, `ShoppingList` entity.
- **Per-user table:** `model/UserExtraDefault.java` + `UserExtraDefaultRepository` + `database/migrations/2026-10-10-mpp10-extra-choices-schema.sql` (MPP-10).
- **Summary DTO assembly:** `RecipeService#convertToSummaryDTO` / `#addVariantInfoToSummary`.
- **Header/logo:**
  - the logo C SVG paths in `header-mockup.html` (`LOGOS.c`)
  - `components/layout/Header.jsx` / `Header.css` (keep the z-index 100 stacking-context comment)
  - `components/layout/Footer.jsx` (guest-gating handlers and the live `PipHerb` tab icon to be shared, not duplicated)

### Constraints flagged on the brief
- One meal per slot; Replace semantics match `POST /api/meal-plan`.
- The eaten tick is one-way, per person, today/past only.
- No calorie target anywhere. kcal is shown, never judged, on both screens.
- The swipe-hint key is exactly `fb.mealplan.swipeHintSeen`, set only on a real swipe.
- **Hide:**
  - per person: keyed by the requesting user, **not** the effective meal-plan owner
  - whole family
  - account-persisted
  - never touches meal plan entries
  - independent of `recipes.is_live`
- Picking mode deep link: `?mealType=&date=` (plus `from=mealplan` to return).
- Touch targets ≥44 px, hover inside `@media (hover: hover)`, `:focus-visible`.
- The logo must be readable at 16 px (favicon) and never sit inside a translucent circle again. Use the brand purple `#4a3f80`, not the favicon's old `#6B46C1`.
- The recipe view must keep every current behaviour: linked-recipe navigation and back, per-recipe servings in the stack, variant switching without closing, wake lock on by default, the eaten tick + Undo, take-to-Pip after eating (MPP-34), and the extras-driven step wording.
- Macros always come from the homemade path, even when an extra is set to store-bought (CLAUDE.md).
- Shopping must keep ticking, sorting (unchecked first, A–Z), persistence, the uncheck-all confirm and the long-press breakdown.
- The header nav and the footer nav must behave identically (same guest nudges, same Pip tab).
- Every existing feature stays reachable:
  - **Meal Plan:** Copy week, Manage extras, templates, Swap days
  - **Recipes:** variant switch, servings, extras popup on assign, toggle-off on assign, admin Edit / + Add Recipe

### Assumptions made
**Meal Plan (approved earlier, unchanged):**
- **New `PATCH /api/meal-plan/{id}` for move/servings.** No endpoint changes an entry's date/meal or servings, and delete + re-POST would lose ids, ticks and choices.
- **Variant switch on the plan reuses `assignRecipe(siblingId…)`.** The backend already treats a same-family replacement as a variant switch and carries the choices.
- **⇄ opens the existing `SwapDaysModal`.**
- **Undo is a client-side deferred DELETE (5 s).** It flushes on unmount or on a second remove.
- **"Build shopping list →" navigates to `/shopping`.**
- **Breakpoint `max-width: 768px`;** a single layout tree is chosen via `useMediaQuery`.
- **Snacks appear as a fourth row only when some day has a snack.**
- **The eaten toast says "Marked as eaten",** with no "Pip +3" (Pip growth is per day).
- **Week chips = `avgDailyProtein/Carbs/Fat` vs `DAILY_MACRO_TARGETS`,** the same as the WeeklyMacroPopup avg row.

**Recipes (new):**
- **The non-admin catalogue loads once from `GET /api/recipes/summaries` (no `mealType`)** and is grouped client-side by `mealTypes`. That gives the tab counts and instant tab switches. Admins load once from `GET /api/recipes/admin` (no `mealType`) as today's admin path does per tab; `RecipeDTO` already carries `mealTypes`, `protein`, `carbs`, `fat` and `macrosAudited`. The road not taken was 5 count requests per visit.
- **Hidden recipes are filtered client-side.** The public summary endpoint stays anonymous and unchanged in shape, apart from the macro fields. The client fetches `GET /api/hidden-recipes` once when authenticated. Guests see no Hide action.
- **The hide key is the family's default recipe id,** or the recipe's own id when it has no family. The server normalises whatever id is sent (`recipe_family_members.recipe_id` is UNIQUE, so the family lookup is unambiguous). The client computes the same key from `variants.find(v => v.isDefault)?.recipeId ?? recipe.id`. This works even when the card shows a non-default variant because it's in the plan (FR-102 swap).
- **Hidden state lives in a feature hook `useHiddenRecipes`, not a new Context.** Only the Recipes screen reads it (react-frontend: feature state never goes in a global Context).
- **Macros on the summary are computed per serving with `MacroCalculationService.calculatePerServingMacros(recipe)`** for the summary itself and for each variant. Those are the same numbers `RecipeDTO.protein/carbs/fat` carry, so card and modal agree.
- **Picking mode state is the URL** (`?mealType=&date=&from=`), read by a `usePickingMode` hook. Entering from the strip sets `date` without `from`. Cancel or a successful add clears `date`/`from`, or navigates to `/mealplan` when `from=mealplan`. Today RecipeList deletes `mealType` from the URL after reading it; that behaviour is replaced (mealType stays in sync with the active tab).
- **A picked `date` outside the current week moves the week to start that Monday-aligned week** via `setStartDate` from MealPlanContext. Otherwise the strip couldn't show it. In practice the Meal Plan links always come from the week on screen, so this is a guard.
- **The servings chip uses the existing `useServingsInput` + `stepServings` + `MIN/MAX/SERVINGS_STEP` constants,** keeping MPP-3's `resolveStartingServings` start value.
- **Hiding uses the same `UndoToast` as Meal Plan,** so the component lives in `components/common/`, not `components/mealplan/`.
- **The Meal Plan "+ Add" / "Replace" links now carry `date` and `from`.** `recipesForMealPath(mealKey, dateISO)` builds them. This reverses Brief A's "day preselect out of scope", because Brief B asks for it explicitly.
- **Header & logo:**
  - **`BrandMark` is inline SVG in a React component,** not an `<img src>`. It scales crisply, needs no request, and the same geometry is exported to the static files. One source: the component's path data is copied verbatim into `public/favicon.svg` and the two icon-source SVGs.
  - **The PNG icons are produced once at build-of-change time with headless Chrome** (installed at `C:\Program Files\Google\Chrome\Application\chrome.exe`) from two committed sources: `public/icons/brand-mark.svg` and `public/icons/brand-mark-maskable.svg`, the latter full-bleed purple with the mark inside the 80 % safe zone. The PNGs are committed. No image dependency goes into `package.json` (react-frontend: no new deps without need); cairosvg isn't usable on this machine (no libcairo) and PIL can't render SVG.
  - **The manifest is a hand-written static `public/manifest.webmanifest`** (`name`, `short_name: "Pantry Plan"`, `icons`, `theme_color #4a3f80`, `background_color #ffffff`, `start_url "/"`, `display "standalone"`). When `vite-plugin-pwa` is bootstrapped later, it replaces this file. Flagged under Risks.
  - **Nav items are shared, not copied.** Footer's handlers and items move into `useAppNav()` + `AppNavItems` (variant `footer` | `header`), and both `Footer` and the new header nav render them. The road not taken was a second hand-copied list: two places to forget a guest check.
  - **`Footer` hides at ≥1024 px except on `/pet`.** The Header is hidden there (`pipMode`), so without the footer the Pip page would have no navigation on desktop.
  - **Per-route titles come from a `useDocumentTitle()` hook called once in `App.jsx`,** reading the same route list as the nav (`APP_ROUTES` in `constants/appRoutes.js`).
  - **Wordmark breakpoint:** hidden below 360 px via CSS only.
  - **Landing placement:** the 120 px mark goes above "The Solution / Join My Pantry Plan" in phase 3. Phases 1–2 are the problem hook, and a logo there would undercut it.
  - **Login placement:** 72 px above "Welcome to My Pantry Plan".
- **Recipe view and Shopping:**
  - **Shopping folded in without an explicit "yes"** (developer's "fold it in" came after the Recipe view mockup; Shopping was the other pending mockup, and every earlier fold has been "all in one go"). Red-line here to drop Shopping (E1–E9) and Phase 14/15 from the contract.
  - **Out-of-date detection uses a fingerprint, not a timestamp.**
    - **How:** at generation, store a SHA-256 of the plan in the list's date range for the effective owner. One line per entry (`entryId|date|mealId|recipeId|servings|sorted extra choices`), excluding eaten state. `GET` recomputes and compares.
    - **Why not the timestamp the mockup suggested:** a removed meal leaves no row to compare, and a per-owner timestamp would need a write in every mutation path (assign, remove, swap, copy, template apply, PATCH, extras). That's easy to miss one. The fingerprint needs no changes outside the shopping service.
    - **Legacy lists** (fingerprint `NULL`) report `false` until regenerated.
  - **Fingerprint range:** `startDate` to `endDate` inclusive (entries finder called with `endDate + 1`, its exclusive end), the same range the list shows.
  - **The extras toggle in the recipe view writes through the existing paths.**
    - **From a plan entry:** `extraChoicesService.updateWeek([{ targetId: entry.id, extraRecipeId, homemade }])`, then `fetchWeekPlan()` + `reloadSelections()`, exactly what WeekExtrasModal does.
    - **Otherwise:** `saveSelections(parentRecipeId, {...})`.

    No new endpoint.
  - **Cook-mode ingredient matching** is a case-insensitive "the ingredient's last name word appears in the step" check (e.g. "Chicken breast" matches "chicken"). It's a hint, not authoritative, and shows nothing rather than guessing when nothing matches.
  - **Fractions** apply to every unit except `g`, `kg`, `ml`, `l` (whole numbers, or 1 dp for kg/l). Nearest of ¼ ⅓ ½ ⅔ ¾ within ±0.05, otherwise 2 dp trimmed. Scaling maths unchanged.
  - **The plan-context bar label** is built from `mealPlanEntry.planDate` + `mealType` (already on the entry), e.g. "Sat 14 · Dinner".
  - **`MacroChips` gains an optional `onChipClick(key)`** so the recipe view can open `MacroTargetPopup`. Elsewhere chips stay non-interactive.
  - **Hide-ticked key:** `fb.shopping.hideTicked`, per device, a view preference only.
- **No Jira key,** so the version bump is MINOR.

### Cross-code alignment audit (FE ↔ BE ↔ DB)
- **`meal_plan_entries` (live):**
  - Columns: `id bigint PK`, `user_id bigint NOT NULL`, `plan_date date NOT NULL`, `meal_id bigint NOT NULL`, `recipe_id bigint NOT NULL`, `servings decimal(4,2) NOT NULL DEFAULT 1.00`, `eaten tinyint(1)`, `eaten_at timestamp NULL`, `created_at`, `updated_at`.
  - Indexes: `PRIMARY(id)`, `fk_meal_plan_meal(meal_id)`, `fk_meal_plan_recipe(recipe_id)`, `idx_user_date_range(user_id, plan_date)`.
  - No unique slot constraint, so the two-row swap is safe. The PATCH writes only existing columns: **no migration for A10.**
- **`servings`:** `decimal(4,2)` ↔ `MealPlanCreateRequest.servings` (0.25–20, 2 dp) ↔ `MealPlanEntryUpdateRequest.servings` (same annotations).
- **Eaten ticks (`meal_plan_entry_eaten`) and MPP-10 extra choices are keyed by entry id,** so a move keeps them.
- **Week/day DTO fields used by the Meal Plan tiles exist and are serialised:** `weekTotalCalories`, `avgDailyCalories`, `avgDailyProtein/Carbs/Fat`, `totalCalories`, `totalProtein/Carbs/Fat`, `isToday`, `date`, `mealsByType`.
- **New `user_hidden_recipes` FK targets (live `information_schema`):** `users.id bigint NOT NULL PRI` and `recipes.id bigint NOT NULL PRI`. Both columns are `bigint` to match. The pattern table `user_extra_defaults` uses `user_id bigint NOT NULL`, `recipe_id bigint NOT NULL`.
- **`recipe_family_members` (live):** `id bigint PRI`, `family_id bigint NOT NULL MUL`, **`recipe_id bigint NOT NULL UNI`**, `is_default tinyint(1) NULL`, `variant_label varchar(100) NULL`, `display_order int NULL`. Because `recipe_id` is unique, a recipe belongs to at most one family, so "family default id" is a deterministic normalisation.
- **`recipes` (live):** `is_live tinyint(1) NULL MUL`, `is_cheat tinyint(1) NULL`, `macros_audited tinyint(1) NOT NULL`. Hide adds no column here, keeping it independent of `is_live`.
- **Summary DTO chain:**
  - `RecipeSummaryDTO`: `id, name, defaultServings, calories (whole-recipe), isCheat, mealTypes, variantLabel, isDefault, variants, hasExtras`. There are no macro fields today; B5 adds `proteinPerServing/carbsPerServing/fatPerServing` (Integer).
  - `RecipeVariantDTO`: `recipeId, recipeName, variantLabel, isDefault, displayOrder, caloriesPerServing`. B5 appends the same three Integer fields. The all-args constructor is called at `RecipeService:233`, `RecipeService:294` and `RecipeFamilyService:307`, and all three are updated.
  - `RecipeDTO` already has `protein/carbs/fat` (per serving), `mealTypes`, `macrosAudited`.
- **Security:** `GET /api/recipes/**` is `permitAll` (SecurityConfig:55). `/api/hidden-recipes/**` falls under `anyRequest().authenticated()` (SecurityConfig:59), so there is no SecurityConfig change.
- **Header & logo (C1–C7):** no persistence touched. `VersionInfo` keeps reading `/api/health` as today.
- **Shopping out-of-date (E9), live `information_schema`:**
  - `shopping_lists`: `id bigint PRI`, `user_id bigint NOT NULL UNI` (one list per effective owner, so shared plans share it), `start_date date NOT NULL`, `end_date date NOT NULL`, `generated_at timestamp NULL`. There is no fingerprint column today. `SELECT COUNT(*) FROM shopping_lists` → **5** rows; the new nullable column leaves them `NULL` (no backfill; they report not-stale until regenerated). Lossless.
  - `meal_plan_entry_extra_choices`: `id`, `meal_plan_entry_id bigint`, `extra_recipe_id bigint`, `is_homemade tinyint(1)`, `updated_at timestamp NULL`. It's read via `ExtraChoiceService.getEntryChoices(entryIds)` for the fingerprint.
  - `PersistedShoppingListService` already resolves the effective owner (`getEffectiveMealPlanOwnerId`) for get and generate, so a partner's edit changes the owner's fingerprint, which both people see.
  - `PersistedShoppingListDTO` gains `planChangedSinceGenerated` (Boolean); the JSON key is the same, and it's read by `ShoppingListContext` as `shoppingList.planChangedSinceGenerated`.
- **Recipe view (D1–D6):** no persistence change. It reuses the eaten endpoint, the extras week-choices endpoint and `recipeService.getRecipeById`.
- **MPP-15 go-live state:** the live DB already has `pet_*` tables, so the MPP-15 go-live has been applied. This migration follows the normal flow: written file → developer applies to Railway → backend deploy. It isn't appended to the MPP-15 go-live list. Per the project memory, the developer runs live writes from a copy placed in Downloads.

---

## Part 2 — Technical design

### Approach
**Meal Plan (unchanged from the approved design).**
- `MealPlanContext` stays the source of truth. It gains `updateEntry` via an out-of-file `useEntryUpdate` hook.
- `MealPlanCalendar` becomes a shell that keeps the modals and picks `MealPlanWeekDesktop` or `MealPlanWeekMobile` with `useMediaQuery`.
- Shared leaves: `MealCard` and `MacroChips`, plus `useMealEntryActions` (tick, remove-with-undo, move, servings, variant).
- **The backend `PATCH /api/meal-plan/{id}`** rewrites `plan_date`/`meal_id` (swapping the occupant) and/or `servings` in one transaction. Ids stay stable, so ticks and choices travel with the meal.

**Recipes: one catalogue load, URL-driven picking.**
- `RecipeList` becomes a shell around a `useRecipeCatalogue` hook. The hook loads the whole catalogue once (summaries for users, admin list for admins), applies today's FR-102 "show the variant that's in my plan" swap, and returns `{ recipesByMeal, counts, loading, error, reload }`.
- The shell combines that with `useHiddenRecipes` (the hidden key set plus hide/unhide with optimistic update and rollback), the search query, and `usePickingMode` (reads and writes `?mealType`, `?date`, `?from`). It renders `RecipeToolbar`, `WeekSlotStrip`, `PickingBanner` and the card grid.
- `RecipeCard` is rebuilt from small pieces:
  - `VariantSegment` replaces the dropdown + label
  - `MacroChips` with `MACRO_TARGETS`
  - `ServingsChip` wraps the existing servings logic
  - `RecipeCardMenu` holds View / Hide / Edit
  - `DayAssignmentButtons` is kept: its assign/toggle/extras-popup logic is untouched and only its rendering changes. It gains a `pickDate` prop that collapses it to the single "Add to <Day>" button and calls `onAssigned` after a successful add, so picking mode can exit or return.
- `MacroChips` and `UndoToast` are shared by both screens, so both live in `components/common/`.

**Hidden recipes: a small per-user table, filtered on the client.**
- The table, entity and repository mirror `user_extra_defaults` / `UserExtraDefault`.
- `HiddenRecipeService` normalises any recipe id to its family's default id (or itself), and makes hide idempotent with an `existsBy…` check plus unique constraint. A 409 race is treated as success.
- The controller is thin: `GET /api/hidden-recipes` → `{ recipeIds: [...] }`, `PUT /{recipeId}` → `{ recipeId: <normalised> }`, `DELETE /{recipeId}` → 204.
- **Road not taken:** filtering inside `/api/recipes/summaries`. That endpoint is public and anonymous, and threading an optional principal through it would make the catalogue per-user and break any future caching. The client already holds the whole catalogue, so a set lookup is free.
- **Second road not taken:** a `HiddenRecipesContext`. Only one screen reads the state.

**Macros on the summary.**
- `convertToSummaryDTO` sets the three per-serving fields from `calculatePerServingMacros(recipe)`.
- `addVariantInfoToSummary` and `addVariantInfo` pass `calculatePerServingMacros(variantRecipe)` into the widened `RecipeVariantDTO` constructor, and so does `RecipeFamilyService:307`.
- The variant finder already fetches the macro graph (`findVariantsForRecipeWithMacroGraph`), so the extra walk adds no queries. `MacroBadgeRow` and the recipe view keep reading `RecipeDTO`.

**Header & logo: one mark, one nav list.**
- **`BrandMark`** (`components/common/BrandMark.jsx`) renders logo C as inline SVG at any `size`. `Header`, `LoginModal` and `LandingPageAnimation` all import it, and the static favicon/icon SVGs carry the identical path data.
- **The header is restructured:** `brand` button (mark + wordmark) · `HeaderNav` (≥1024 px only) · `DateRangePicker` (restyled into the pill) · account button and menu. On phones a CSS grid puts the week pill on its own second row.
- **Nav items:** `useAppNav()` owns the four items, active detection and the guest nudges; `AppNavItems` renders them as footer buttons or header tabs. Footer's `PipHerb` mini icon is reused in both.
- **Account menu:** the dropdown keeps the same child components and only gains section wrappers and order. Logic in `DefaultPortionsControl` / `MealTimesControl` / `VersionInfo` is untouched.
- **Static assets:** `index.html` gets the title, `apple-touch-icon`, the `manifest` link and the Apple meta tags. The PNG exports are produced by one headless-Chrome step and committed.

**Recipe view: split, then reskin.**
- **Split first:** `RecipeViewModal` keeps data and behaviour (fetch, variant switch, linked stack, servings hook, homemade selections, wake lock). Rendering moves into `RecipeViewHeader` (sticky header + `PlanContextBar`), `IngredientsPanel`, a re-skinned `RecipeStepsSection`, `ExtrasPanel` and `CookMode`.
- **Mobile tabs** are a `tab` state in the modal (`'ingredients' | 'steps'`), CSS-hidden on desktop.
- **Extras:** `ExtrasPanel` lists the linked extras derived from steps with `linkedRecipeId` (name from `linkedRecipeName`). Its toggle calls a new `useExtraChoiceToggle({ parentRecipeId, mealPlanEntry })`, which routes to the MPP-10 week endpoint for plan entries or `saveSelections` otherwise. The current wording logic (`useLinkedStepSelections`) then re-reads the new choice, so steps flip immediately.
- **Road not taken:** a new "recipe view choices" endpoint. It's unnecessary, because both stores already exist.

**Shopping: reskin + one server boolean.**
- **Frontend:** the existing components are restyled. `ShoppingList` orders done aisles last, `ShoppingListAisle` handles the collapsed done state, and `ShoppingListItem` gets the new row layout and an ⓘ button calling the same breakdown fetch. `GenerateShoppingListModal` seeds dates from `MealPlanContext` and counts meals from `weekPlan`. A `useHideTicked` hook holds the per-device toggle.
- **Out-of-date:** the banner reads `shoppingList.planChangedSinceGenerated`.
- **Backend:** a `MealPlanFingerprintService.fingerprint(ownerId, start, endInclusive)` (entries via `findByUserIdAndDateRange(owner, start, end+1)`, choices via `ExtraChoiceService.getEntryChoices`, SHA-256 hex) is called by `PersistedShoppingListService` in generate (store) and get (compare).
- **Road not taken:** stamping a per-owner "plan changed at" in every mutation path, which would mean 7+ write sites to keep in sync.

### Skills to invoke during execution
- `react-frontend` — owns all `client/src` work on both screens and the header (BrandMark, nav sharing, account menu, `index.html`, icons and manifest — the skill's PWA section governs the manifest fields and Apple tags): the component/hook split, the 400-line budget, touch-target and hover rules, the four async states (catalogue, hidden list), no console logs, and constants in `src/constants/`.
- `java-backend` — owns `PATCH /api/meal-plan/{id}`, the hidden-recipes migration, entity, repository, service and controller, the macro fields on `RecipeVariantDTO` / `RecipeSummaryDTO`, and their tests.

Rules to Read: `.claude/rules/recipe-variants.md` (read-only context). The segment must keep Light / Moderate / Balanced order and default to Moderate, and the hide key is defined per family. No recipe data is written, so `linked-recipe-extras.md` and `homemade-first-and-ingredient-dedup.md` don't apply.

### Diagram
```mermaid
flowchart TD
  subgraph MealPlan[/mealplan]
    Cal[MealPlanCalendar shell] -->|desktop| D[Timetable]
    Cal -->|≤768px| M[Mobile day view]
    D & M --> A[useMealEntryActions]
    A -->|move / servings| P[PATCH /api/meal-plan/:id]
    D & M -->|+ Add / ↻ Replace| Link["/?mealType=x&date=d&from=mealplan"]
  end
  subgraph Recipes[/ Recipes]
    Link --> RL[RecipeList shell]
    RL --> Cat[useRecipeCatalogue<br/>GET /recipes/summaries once]
    RL --> Hid[useHiddenRecipes<br/>GET/PUT/DELETE /api/hidden-recipes]
    RL --> Pick[usePickingMode<br/>URL date/from]
    RL --> TB[RecipeToolbar<br/>tabs+counts, search, Hidden n]
    RL --> WS[WeekSlotStrip]
    RL --> RC[RecipeCard]
    RC --> VS[VariantSegment] & MC[MacroChips] & SC[ServingsChip] & DB[DayAssignmentButtons<br/>3 states / Add to Day]
    DB -->|assign| POST[POST /api/meal-plan]
    DB -->|onAssigned + from=mealplan| Back[navigate /mealplan]
  end
  subgraph Shell[App shell]
    BM[BrandMark logo C] --> HD[Header: brand + wordmark]
    BM --> LM[LoginModal 72px] & LP[Landing 120px]
    BM -. same paths .-> FAV[favicon.svg, icons/*.png, manifest]
    NAV[useAppNav + AppNavItems] --> HN[HeaderNav ≥1024px]
    NAV --> FT[Footer &lt;1024px, and on /pet]
    HD --> HN & DRP[DateRangePicker pill] & AM[Account menu sections]
    TITLE[useDocumentTitle in App.jsx] --> APP_ROUTES[(constants/appRoutes)]
    NAV --> APP_ROUTES
  end
  subgraph RecipeView[Recipe view]
    RVM[RecipeViewModal: data + behaviour] --> RVH[RecipeViewHeader + PlanContextBar]
    RVM --> IP[IngredientsPanel: ticks + formatQuantity] & RSS[RecipeStepsSection: cards] & EXP[ExtrasPanel] & CM[CookMode]
    EXP --> TOG[useExtraChoiceToggle]
    TOG -->|plan entry| WK[PUT /meal-plan/extras/week/choices]
    TOG -->|otherwise| HSC[HomemadeSelectionsContext.saveSelections]
  end
  subgraph Shop[Shopping]
    SLC[ShoppingListContext] -->|GET /api/shopping-list| PSS[PersistedShoppingListService]
    PSS --> FP[MealPlanFingerprintService<br/>SHA-256 of entries + choices in range]
    PSS -->|planChangedSinceGenerated| SLC
    FP -. stored at generate .-> SLT[(shopping_lists.plan_fingerprint)]
  end
  Hid --> HS[HiddenRecipeService<br/>normalise → family default id]
  HS --> T[(user_hidden_recipes)]
```

### Data shapes

#### Meal Plan HTTP contract — new
`PATCH /api/meal-plan/{id}` (auth required)
```json
{ "planDate": "2026-11-15", "mealId": 2, "servings": 1.5 }
```
- **200** → `MealPlanEntryDTO`.
- **400** → validation error: servings outside 0.25–20 or more than 2 dp; date without meal or vice versa; empty body.
- **403** → no principal.
- **404** → entry not in the caller's plan.
- **409** → `DataIntegrityViolationException`.

#### DTO — new `dto/MealPlanEntryUpdateRequest.java`
```java
@Data @NoArgsConstructor @AllArgsConstructor
public class MealPlanEntryUpdateRequest {
    private LocalDate planDate;            // nullable; paired with mealId
    private Long mealId;                   // nullable; paired with planDate
    @DecimalMin(value = "0.25", message = "Servings must be at least 0.25")
    @DecimalMax(value = "20.00", message = "Servings must be at most 20")
    @Digits(integer = 2, fraction = 2, message = "Servings allows at most 2 decimal places")
    private BigDecimal servings;            // nullable

    @JsonIgnore @AssertTrue(message = "planDate and mealId must be sent together")
    public boolean isMoveComplete() { return (planDate == null) == (mealId == null); }

    @JsonIgnore @AssertTrue(message = "Nothing to update")
    public boolean isNotEmpty() { return planDate != null || servings != null; }
}
```

#### Service — new `MealPlanService#updateEntry`
`@Transactional public Optional<MealPlanEntryDTO> updateEntry(Long userId, Long entryId, MealPlanEntryUpdateRequest req)`
1. Load the entry by `findByIdAndUserId(entryId, effectiveOwnerId)`.
2. On a move to a different slot, find the occupant via `findByUserIdAndPlanDateAndMealId` and move it to the source slot.
3. Set the new date and meal (via `mealRepository.findById`), and publish `PetFirstCandidate.planned(userId, min, max)`.
4. Apply `servings` if present.
5. Save, and return `convertToDTO(saved, choices, eatenAt)`.

#### DDL — new `database/migrations/2026-11-14-user-hidden-recipes.sql`
```sql
CREATE TABLE IF NOT EXISTS user_hidden_recipes (
  id         BIGINT NOT NULL AUTO_INCREMENT,
  user_id    BIGINT NOT NULL,
  recipe_id  BIGINT NOT NULL,           -- family's DEFAULT recipe id, or the recipe itself when not in a family
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_hidden_recipe (user_id, recipe_id),
  KEY idx_user_hidden_recipes_recipe (recipe_id),
  CONSTRAINT fk_user_hidden_recipes_user   FOREIGN KEY (user_id)   REFERENCES users (id)   ON DELETE CASCADE,
  CONSTRAINT fk_user_hidden_recipes_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
New and empty, so it is lossless by construction. Hibernate `validate` fails until the table exists, so it must be applied before the backend deploys.

#### Entity / repository — new
```java
@Entity @Table(name = "user_hidden_recipes", uniqueConstraints =
    @UniqueConstraint(name = "uk_user_hidden_recipe", columnNames = {"user_id", "recipe_id"}))
@Data @NoArgsConstructor @AllArgsConstructor
public class UserHiddenRecipe {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(name = "recipe_id", nullable = false) private Long recipeId;
    @Column(name = "created_at", insertable = false, updatable = false) private LocalDateTime createdAt;
}

public interface UserHiddenRecipeRepository extends JpaRepository<UserHiddenRecipe, Long> {
    List<UserHiddenRecipe> findByUserId(Long userId);
    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);
    @Modifying @Transactional long deleteByUserIdAndRecipeId(Long userId, Long recipeId);
}
```

#### Hidden-recipes HTTP contract — new (auth required, per requesting user)
| Verb + path | Body | Response |
|---|---|---|
| `GET /api/hidden-recipes` | — | 200 `{"recipeIds":[12,57]}` |
| `PUT /api/hidden-recipes/{recipeId}` | — | 200 `{"recipeId":12}` (normalised key; idempotent) · 404 unknown recipe |
| `DELETE /api/hidden-recipes/{recipeId}` | — | 204 (idempotent; normalises first) |

DTO: `dto/HiddenRecipesDTO { List<Long> recipeIds }`, `dto/HiddenRecipeDTO { Long recipeId }`.
Service: `HiddenRecipeService { List<Long> listHidden(Long userId); Optional<Long> hide(Long userId, Long recipeId); void unhide(Long userId, Long recipeId); Optional<Long> normalise(Long recipeId) }`. `normalise` returns empty when the recipe doesn't exist, otherwise the family's `is_default=1` member id, falling back to the recipe itself when it has no family or the family has no default.

#### Macro fields — modified DTOs
```java
// RecipeVariantDTO — appended, in this order (all-args constructor grows to 9 params)
private Integer proteinPerServing;   // grams
private Integer carbsPerServing;     // grams
private Integer fatPerServing;       // grams
// RecipeSummaryDTO — same three fields, set in convertToSummaryDTO
```
JSON: `{"recipeId":7,…,"caloriesPerServing":565,"proteinPerServing":40,"carbsPerServing":72,"fatPerServing":16}`.

#### Frontend modules
| Module | Exports / props |
|---|---|
| `constants/mealPlanUi.js` | `MEAL_SLOTS`, `SNACKS_SLOT`, `MOBILE_MEDIA_QUERY`, `UNDO_REMOVE_MS=5000`, `INFO_TOAST_MS=2500`, `SWIPE_HINT_STORAGE_KEY`, `SWIPE_COMMIT_PX=70`, `SWIPE_ACTION_WIDTH_PX=76`, `PICK_FROM_MEALPLAN='mealplan'`, `recipesForMealPath(mealKey, dateISO?)` → `/?mealType=k&date=d&from=mealplan` (date/from only when dateISO given) |
| `constants/recipesUi.js` | `RECIPE_MEAL_TABS = ['breakfast','lunch','dinner','snacks','extras']`, `RECIPE_TAB_LABELS`, `VARIANT_ORDER = ['Light','Moderate','Balanced']` |
| `utils/mealPlanDayUtils.js` | `isDayTickable`, `dayMacros`, `weekAvgMacros`, `plannedSlotCount`, `slotsForWeek`, `filledCoreSlots`, `todayOrFirstDay` |
| `utils/weekPlanEntryUtils.js` | `findEntry`, `patchEntry` (moved from `useEntryEaten`) |
| `utils/recipeCatalogueUtils.js` | `hideKeyOf(recipe)`, `groupByMeal(recipes)`, `swapWithPlanVariants(recipes, planRecipeIds)`, `recipeIdsInWeek(weekPlan)`, `slotEntryFor(weekPlan, dateISO, mealKey)`, `cardMacros(recipe, selectedVariantId)` → `{protein, carbs, fat}` |
| `services/mealPlanService.js` | + `updateEntry(entryId, patch)` |
| `services/hiddenRecipeService.js` | `listHidden()`, `hide(recipeId)`, `unhide(recipeId)` |
| `hooks/` | `useMediaQuery`, `useEntryUpdate`, `useMealEntryActions`, `useSwipeHint`, `useRecipeCatalogue({isAdmin})`, `useHiddenRecipes({isAuthenticated})` → `{hiddenKeys:Set, hide(recipe), unhide(recipe), toast, undo, dismissToast, loading, error}`, `usePickingMode()` → `{activeMeal, setActiveMeal, pickDate, fromMealPlan, startPicking(dateISO), finishPicking()}` |
| `components/common/` | `MacroChips`, `UndoToast` |
| `components/mealplan/` | `MealCard`, `MealPlanSheet`, `MoveMealSheet`, `ServingsSheet`, `WeekSummary`, `MealPlanToolbar`, `DayHeader`, `MealEntryMenu`, `MealCardDesktop`, `SlotCell`, `MealPlanWeekDesktop`, `MobileWeekBar`, `DayChipStrip`, `MobileDaySummary`, `SwipeableRow`, `MealPlanWeekMobile` |
| `components/recipes/` | new `RecipeToolbar`, `WeekSlotStrip`, `PickingBanner`, `VariantSegment`, `ServingsChip`, `RecipeCardMenu`; rebuilt `RecipeCard`, `RecipeList`; re-rendered `DayAssignmentButtons` (+ props `pickDate`, `onAssigned`) |

#### Shopping out-of-date — DDL (new `database/migrations/2026-11-14-shopping-list-plan-fingerprint.sql`)
```sql
ALTER TABLE shopping_lists ADD COLUMN plan_fingerprint CHAR(64) NULL AFTER generated_at;
```
It's guarded by an `information_schema` check so a re-run is a no-op (see tasks). The 5 existing rows become `NULL`.

#### Shopping out-of-date — Java
```java
// model/ShoppingList.java — new field
@Column(name = "plan_fingerprint", length = 64)
private String planFingerprint;

// dto/PersistedShoppingListDTO.java — new field (builder)
private Boolean planChangedSinceGenerated;   // false when the list predates fingerprints

// service/MealPlanFingerprintService.java
@Service @RequiredArgsConstructor
public class MealPlanFingerprintService {
    /** SHA-256 hex of the owner's plan in [start, endInclusive]: entry id, date, meal, recipe, servings, sorted extra choices. Eaten state excluded. */
    @Transactional(readOnly = true)
    public String fingerprint(Long ownerId, LocalDate start, LocalDate endInclusive) { … }
}
```
JSON: `GET /api/shopping-list` → `{ …existing…, "planChangedSinceGenerated": true }`.

#### Recipe view + shopping frontend modules
| Module | Exports / props |
|---|---|
| `utils/formatQuantity.js` | `formatQuantity(value, unit) → string` (¼ ⅓ ½ ⅔ ¾ for non-metric-mass/volume; whole g/ml; 1 dp kg/l) |
| `utils/cookModeUtils.js` | `ingredientsForStep(stepText, ingredients) → ingredient[]` |
| `hooks/useExtraChoiceToggle.js` | `useExtraChoiceToggle({ parentRecipeId, mealPlanEntry }) → { setChoice(extraRecipeId, homemade), saving, error }` |
| `hooks/useHideTicked.js` | `useHideTicked() → [hideTicked, setHideTicked]` (localStorage `fb.shopping.hideTicked`) |
| `components/recipes/RecipeViewHeader.jsx` | props: `name, isCheat, nav (LinkedRecipeNavigation props), planEntry, variants, selectedVariantId, onSelectVariant, servings, onServings, macros, onMacroClick, wakeLock {isLocked,isSupported,toggle}, onClose` |
| `components/recipes/PlanContextBar.jsx` | props: `entry` (renders "{Dow} {n} · {Meal}" + the eaten button via `useEntryEaten`) |
| `components/recipes/IngredientsPanel.jsx` | props: `ingredients, scale(qty) → number, servings` (owns tick state) |
| `components/recipes/ExtrasPanel.jsx` | props: `extras [{ recipeId, name }], isHomemade(id), onToggle(id, homemade), onOpen(id)` |
| `components/recipes/CookMode.jsx` | props: `recipeName, steps, ingredients, scale, isHomemade, startIndex, onExit(lastIndex)` |
| `components/common/MacroChips.jsx` | + optional `onChipClick(key)` → chips render as buttons |
| `components/shopping/*` | restyled; `ShoppingListAisle` + `isDone`, `collapsed`, `onToggle`; `ShoppingListItem` + an ⓘ button |
| `services/shoppingService.js` | unchanged (the breakdown fetch is reused) |

#### Header & logo modules
| Module | Exports / props |
|---|---|
| `constants/appRoutes.js` | `APP_ROUTES = [{ key:'recipes', path:'/', label:'Recipes', title:'Recipes', requiresAuth:false }, { key:'mealplan', path:'/mealplan', label:'Meal Plan', title:'Meal Plan', requiresAuth:true, guestMessage:'Sign in to access meal planning!' }, { key:'pet', path:'/pet', label:null /* pet name */, title:'Pip', requiresAuth:true, guestMessage: PET_GUEST_MESSAGE }, { key:'shopping', path:'/shopping', label:'Shopping', title:'Shopping', requiresAuth:true, guestMessage:'Sign in to access shopping list!' }]`, `APP_NAME = 'My Pantry Plan'`, `routeTitle(pathname) → 'Meal Plan · My Pantry Plan'` (unknown path → `APP_NAME`) |
| `components/common/BrandMark.jsx` | `<BrandMark size={40} title? />` → `<svg viewBox="0 0 100 100" width={size} height={size} role={title?'img':undefined} aria-hidden={!title}>`, logo C geometry (rect rx 24 `#4a3f80`; circle r33 `#fff`; inner ring r24 `#e3dff2` stroke 3; P path `M42 70V36h12a10 10 0 0 1 0 20H42` stroke `#4a3f80` 9; leaf `M66 30c-8-1-14 4-14 11 8 1 14-4 14-11z` `#7cc36b`) |
| `hooks/useAppNav.js` | `useAppNav() → { items:[{ key, path, label, active, onSelect }], message:string|null }`, guest gating + a 3 s nudge, moved from Footer |
| `components/layout/AppNavItems.jsx` | `<AppNavItems variant="footer"|"header" items message />`, renders the four buttons (existing SVG icons + the `PipHerb` mini tab) |
| `components/layout/HeaderNav.jsx` | the header tab strip (`nav aria-label="Main"`), shown at ≥1024 px |
| `hooks/useDocumentTitle.js` | `useDocumentTitle()`, sets `document.title = routeTitle(location.pathname)` on route change |
| `public/favicon.svg` | logo C, 100×100 viewBox (replaces the calendar drawing) |
| `public/icons/brand-mark.svg`, `brand-mark-maskable.svg` | export sources (maskable = full-bleed `#4a3f80` square, mark scaled to 80 % centred) |
| `public/icons/apple-touch-icon.png` 180², `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | committed PNG exports |
| `public/manifest.webmanifest` | `{ "name":"My Pantry Plan", "short_name":"Pantry Plan", "start_url":"/", "display":"standalone", "background_color":"#ffffff", "theme_color":"#4a3f80", "icons":[192 any, 512 any, 512 maskable] }` |
| `index.html` | `<title>My Pantry Plan</title>`, `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`, `<link rel="manifest" href="/manifest.webmanifest">`, `<meta name="theme-color" content="#4a3f80">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-title" content="Pantry Plan">`, `<meta name="apple-mobile-web-app-status-bar-style" content="default">` |

### Runtime quality notes
Frontend dimensions are mapped onto the browser runtime.
- **Resource cleanup:**
  - The undo timers (meal remove, recipe hide) are cleared on undo and flushed on unmount.
  - `useMediaQuery` removes its listener.
  - `SwipeableRow` releases pointer capture.
  - Menus remove their document listeners.
  - `useRecipeCatalogue` owns an `AbortController` aborted on unmount and on admin-flag change. Cancellations are swallowed.
  - Writes (PATCH, hide/unhide, assign) are never auto-aborted.
  - Backend: two short `@Transactional` methods, no streams.
- **Concurrency / ordering:**
  - **Meal-plan move:** serialised by the transaction; a constraint race returns 409 with the existing copy.
  - **Hide:** idempotent. The unique key plus an `existsBy` pre-check, with a `DataIntegrityViolationException` on a concurrent double-hide treated as success.
  - **Unhide:** `deleteBy…` affects 0 or 1 rows.
  - **Client:** hide is optimistic per key with rollback on failure. A second hide flushes the pending first one, and the undo window doesn't delay the request: hide is sent immediately, and undo issues an unhide. That's the opposite of meal remove, deliberately: hide is fully reversible server-side, so there's no reason to delay it.
- **Allocation / cost behaviour:**
  - **Catalogue:** one request per Recipes visit instead of one per tab switch, and every tab switch is instant.
  - **Summary macros:** `calculatePerServingMacros` walks a graph already in the persistence context (the kcal computation just walked it), so the extra cost is CPU-only. The variant macros use the `…WithMacroGraph` finder that already exists to prevent N+1.
  - **`findByMealKey`** isn't used by the new client path, because the no-mealType summary uses `findAllLiveRecipesWithMacroGraph`.
  - **Search:** a case-insensitive `includes` over at most a few hundred names per keystroke. No debounce needed, no memoisation without evidence.
- **Recipe view / Shopping:**
  - **Wake locks** are released on unmount (`useWakeLock` already does this); cook mode re-requests on open and restores the previous state on exit.
  - **The extras toggle** is a write: it's never aborted. It's disabled while saving; on failure the choice reverts and an inline error shows.
  - **The fingerprint** costs one entries query (indexed `idx_user_date_range`) plus one choices query per `GET /api/shopping-list`, on ≤ ~30 rows: negligible.
  - **Two people** editing a shared plan both change the owner's fingerprint, so both see the banner (server-side, no client flag).
- **Header & logo:** the nudge timer in `useAppNav` is cleared on unmount (Footer's version wasn't). `useDocumentTitle` has no subscriptions beyond the router. `BrandMark` is static SVG (under 1 KB, no request). The PNGs are only fetched by the OS when you add to the home screen.
- **Error paths:**
  - **Catalogue load failure:** error state + Retry, never an empty "No recipes" (that would be swallowing the error into a success shape).
  - **Hidden-list load failure:** recipes still show, all treated as visible. A small inline notice says "Couldn't load your hidden recipes", and the Hide action stays disabled until a retry succeeds, so a failed load is never mistaken for "nothing hidden" and re-written.
  - **Hide/unhide failure:** rollback + error toast with the server's message.
  - **PATCH failure:** rollback + `assignmentError` toast.
  - **Backend:** 404 for an unknown recipe or entry, 400 from bean validation, 403 without a principal.

### Risks and judgement calls
- **Migration ordering (manual).** `user_hidden_recipes` must exist on Railway **before** the backend containing `UserHiddenRecipe` deploys, or Hibernate `validate` stops startup. You apply it (a copy is placed in Downloads), and the tasks verify it read-only before any entity code is written.
- **Scope is now large: two screens + three backend slices in one contract,** as instructed. Phases are ordered so each one ends green. If execution must stop early, Phases 1–6 (Meal Plan) ship independently of Phases 7–10 (Recipes), except that the Meal Plan "+ Add" link then lands on Recipes without picking mode (harmless: it opens the right tab).
- **Hide key = the family default id.** Admin re-defaulting a family (moving `is_default` to another sibling) would orphan existing hides for that family. Rare, and the admin editor doesn't expose re-defaulting today. Flagged rather than guarded.
- **`RecipeVariantDTO` constructor widening touches 3 call sites,** including `RecipeFamilyService`, which serves the variant dropdown in the recipe view. That's mechanical, but every caller must be updated or compilation fails (which is the guard).
- **The admin catalogue loads all recipes at once** (`GET /api/recipes/admin`, full `RecipeDTO` with ingredients and steps). It's heavier than one tab, but admin-only. If it proves slow, it can fall back to per-tab loading without UI change.
- **Mockup extras dropped:** "✓ Audited only" and "↑ Most protein" chips (mobile) aren't built (not in the brief). Easy to add later.
- **Header arrows affect every screen** (global `DateRangePicker`); the Recipes strip follows the same week.
- **Deleting `MealPlanDay.*` / `MealPlanEntry.*`;** replacing `RecipeCard`/`RecipeList` internals; dropping `RecipeCard`'s dead "Show Details" block.
- **The tick is hidden on future days on the plan,** but `MealEatenSection` in the recipe view is unchanged.
- **Second migration (Shopping):** `2026-11-14-shopping-list-plan-fingerprint.sql` must be applied to Railway **before** the backend with `ShoppingList.planFingerprint` deploys, alongside the hidden-recipes one. Both go in the same Downloads hand-off.
- **Fingerprint covers what changes the list,** except recipe edits by an admin (the recipe's ingredients change but the plan doesn't). Regenerating is still manual, and the banner won't fire for those. Acceptable; flagged.
- **The extras toggle outside the plan changes the dish default only for this session** for signed-in users. `saveSelections` doesn't persist server-side today: defaults are saved server-side on the next add-to-day (MPP-10). Same as current behaviour; flagged in case you expected it to persist.
- **Scope:** five redesigns in one contract (Meal Plan, Recipes, Header & Logo, Recipe View, Shopping). Phases stay independently green, so execution can stop after any phase group.
- **The static manifest declares `display: "standalone"` without a service worker.** Android may offer "Install", and the installed app opens without browser chrome; there's no offline behaviour, so offline shows the browser's error page as now. `vite-plugin-pwa` will own this file once it's bootstrapped. If you'd rather not change launch behaviour yet, switch it to `"browser"` (home-screen icon only).
- **The PNG export uses the local Chrome install** (a one-off command in the tasks). If Chrome moves, use the Edge path (`msedge.exe` also supports `--headless --screenshot`).
- **Hiding the footer on desktop changes `--footer-clearance` to 0 at ≥1024 px.** Every bottom-anchored element using it (toasts, sheets, the `/mealplan` and `/shopping` paddings) moves down accordingly. `/pet` keeps the footer, and its clearance, at all widths.
- **Logo geometry is from the mockup, not a designer.** You've only seen it in the mockup. The tasks include a 16 px favicon check in the manual walkthrough, and the paths are easy to tweak in one component + two SVGs.
- **Deploy order:** apply the migration → deploy the backend → deploy the frontend. The frontend without the backend shows rollback toasts for Move/Servings/Hide and has no macros on cards (chips render nothing when macros are absent).
