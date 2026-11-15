# First-login onboarding: user-journey map (2026-11-15)

Input for brainstorming the first-login guided tour + Stir Frys default template.
Paths relative to `foodbytes-app/client/src/`. Read-only survey; nothing changed.

## Headlines
- **No first-login experience exists.** Only `hasSeenIntro` (localStorage, guests, pre-login landing). No server field marks onboarding done; user DTO only has `defaultServings` + `mealTimes`.
- **No tour/coachmark code and no `data-tour` hooks.** Only `.swipe-hint-bubble` (`hooks/useSwipeHint.js`, `fb.mealplan.swipeHintSeen`). Anchoring needs new `data-tour` attributes (duplicate nav bars, mutually exclusive desktop/mobile meal-plan trees, repeated cards).
- **Labels are theme-dependent.** Parchment renames nav (Receipts / Ledger / Provisions) and page titles; Pip tab label = pet name. Tour copy must go through `navLabel()` / `pageCopy()` (`utils/themeCopy.js`).
- **Breakpoints:** 768px (meal plan, recipe view), 767px (account menu sheet), 1024px (header nav vs footer nav). Several actions live in different controls on mobile vs desktop.
- **Pip "Firsts" already track tour goals server-side:** `FirstKey { MAKE_TEMPLATE, GENERATE_SHOPPING_LIST, PLAN_FULL_WEEK, COOK_HOMEMADE_EXTRA }` (`pet_firsts`).
- **Week model:** the selected week starts **today**, not Monday (`MealPlanContext.jsx:51`, `DateRangePicker.jsx:31`), shared across Recipes/Meal plan/Shopping via `foodbytes_startDate`. Templates store `day_offset 0..6` from a Monday; Copy week insists on a Monday target.
- **Mobile meal plan has no "Build shopping list" button** (desktop toolbar only).

## 0. Shell
- Routes `App.jsx:63-68`: `/` recipes, `/mealplan`, `/pet`, `/shopping`. On `/pet` header + ticker hidden.
- Nav `layout/AppNavItems.jsx:67-95` (`.footer-btn` / `.header-btn`, `aria-current`). Guests tapping gated tabs get a 3 s message (`hooks/useAppNav.js`).
- Header: `.brand-btn`, `.header-nav` (≥1024), `.header-week` DateRangePicker (signed-in), `.avatar-btn` "Account menu" / guest `.sign-in-btn-pill`.
- Week pill `common/DateRangePicker.jsx:34-52`: `.week-arrow` prev/next, `.date-range-pill`, `.this-week-btn`.

## 1. Browse recipes + recipe view
- `/` `recipes/RecipeList.jsx`. URL state `?mealType=&date=&from=` (`hooks/usePickingMode.js`).
- Toolbar `RecipeToolbar.jsx`: meal tabs `.recipe-tabs` (Breakfast/Lunch/Dinner/Snacks/Extras), `input.recipe-search`, `.recipe-chip` 🙈 Hidden (signed-in), admin "+ Add Recipe".
- Card `RecipeCard.jsx`: `.recipe-card-name` opens view; `⋯` menu (View / Hide / Edit); `.variant-seg` Light/Moderate/Balanced (fetches `GET /recipes/{id}`); `.servings-chip-trigger`; `.in-plan-badge`.
- View `RecipeViewModal.jsx` + `RecipeViewHeader.jsx`: `.rv-vseg` variant, `.rv-srv` servings, `.rv-macros` → MacroTargetPopup, `.rv-awake` keep-screen-on, `.rv-tabs` Ingredients/Steps, mobile `.ing-expand` fullscreen, steps `li.step[role=checkbox]`, `.cookbtn` Cook mode (`CookMode.jsx`), `.step-link` / `.rv-extra-open` linked recipe → stack with `.back-button`, `.rv-extras` Homemade/Store-bought (locked unless opened from plan entry; guests localStorage).
- Gotcha: variant chosen in the modal is not pushed back to the card.

## 2. Pick meals (add to plan)
- **Day buttons** `DayAssignmentButtons.jsx:213-232` `.days-grid > .day-btn` (Add/Remove/Replace). Recipes with extras open `ExtrasSelectionPopup` first. `MealPlanContext.assignRecipe` → `POST /api/meal-plan` (optimistic, rollback toast).
- **Week strip** `WeekSlotStrip.jsx`: "This week's {meal}", seven `.week-tile` (`.is-empty` "+ Pick one"). Empty tile → picking mode: `PickingBanner` "Picking {meal} for {Day}" + single `.pick-btn` per card; returns to `/mealplan` if `from=mealplan`.
- Filled tile → recipe view with `PlanContextBar` (`.rv-ctx`, `.rv-eat` mark eaten) + `MealEatenSection`. Eating today/yesterday's main meal jumps to `/pet` after 600 ms.
- From meal plan: "+ Add {meal}" / Replace → `/?mealType&date&from=mealplan`.

## 3. Meal plan
- `/mealplan` `MealPlanCalendar.jsx`. Empty week: "Your meal plan is empty…" (full-reload `<a href="/">`).
- **Desktop** `MealPlanWeekDesktop.jsx`: `.week-toolbar` (⧉ Copy week, 🗂 Templates ▾ Save/Apply/Manage, 🛒 Extras, **Build shopping list →**); `.week-summary-tile` → WeeklyMacroPopup; timetable `DayHeader` (`.day-header-swap` ⇄, daily macros); `SlotCell` drop targets; `MealCard` (`.meal-card`, `.meal-card-tick` today/past only, `⋯ .entry-menu-trigger`: servings, variant, Replace, Move, Remove); `ServingsSheet`, `MoveMealSheet`.
- **Mobile** `MealPlanWeekMobile.jsx`: `.meal-plan-menu-trigger` (Copy week, Swap two days, Manage extras, Save/Apply/Manage templates), `.m-weekbar`, `.day-chips`, `MobileDaySummary`, `.m-slot`, `.m-add`; swipe-left Replace/Move/Remove with first-run swipe hint.
- Remove = 5 s UndoToast then `DELETE`. Week extras `WeekExtrasModal` (bulk + per-meal Homemade/Store-bought, saves instantly).

## 4. Templates (signed-in) — `services/mealPlanTemplateService.js`, `/api/meal-plan/templates`
- Save `SaveTemplateModal.jsx` (`#save-template-name`, 409 on duplicate name) → earns MAKE_TEMPLATE.
- Apply `ApplyTemplateModal.jsx` (`#apply-template-select`, warns it replaces the week) → `POST /{id}/apply`.
- Manage `ManageTemplatesModal.jsx`: Rename, Update (re-snapshot, `confirm()`), Extras → `TemplateExtrasModal`, Delete (`confirm()`).
- Backend: templates are per-user (`meal_plan_templates.user_id`, unique `(user_id, name)`), entries by `day_offset`.

## 5. Copy week / swap days
- `CopyWeekModal.jsx` (`#copy-target-date`, must be a Monday, not same week; jumps to target week on success).
- Swap: desktop `.day-header-swap`, mobile menu → `SwapDaysModal.jsx` (`POST /meal-plan/swap`). **Closes on any scroll.**

## 6. Shopping list
- `/shopping` `ShoppingList.jsx`. No list: `.generate-btn` "Generate Shopping List" → `GenerateShoppingListModal.jsx` (week / list / custom dates) → `POST /api/shopping-list/generate` (earns GENERATE_SHOPPING_LIST).
- Header `ShoppingListHeader.jsx`: Hide ticked, keep screen on, `.sl-kebab` (Regenerate, New list for other dates, Uncheck all), `.sl-progress`, stale bar `.sl-stale`.
- Aisles `ShoppingListAisle.jsx` (collapsible, done aisles sink); items `ShoppingListItem.jsx` tap to tick, long-press / `.info-btn` → `IngredientBreakdownPopup`.
- Homemade/store-bought fed from: ExtrasSelectionPopup, recipe-view ExtrasPanel (plan entry), week extras, template extras.

## 7. Pip (brief)
- `PetView.jsx`: `PipHeader` (rename, sprinkles, mood), `PetRoom` (drag camera, stations Fridge / Trophy cabinet incl. "Firsts"), `.pip-room-actions` Shop / Edit room / Wardrobe, `CheckInActions` first-time habit question.

## 8. Account menu
- `.avatar-btn` → `UserMenu.jsx` (dropdown desktop, bottom sheet ≤767): Default portions, Meal times, ThemePicker, Low FX, Sign out, VersionInfo. Hidden recipes live on the Recipes toolbar, not here.

## 9. Guest vs signed-in, existing first-run
- `AuthContext` `GET /api/auth/me`; `isGuest` in-memory only.
- `LandingPageAnimation` when `!isAuthenticated && !isGuest && !hasSeenIntro`; copy hard-coded Default brand, ignores theme.
- Guests: recipes + view only.
- First-run flags: `hasSeenIntro`, `fb.mealplan.swipeHintSeen`, Pip per-user stores; server `pet_firsts`, habit first-answer. **No onboarding-complete flag.**

## 10. Tour constraints
- Anchors: add `data-tour`. Useful existing ids: `#save-template-name`, `#apply-template-select`, `#copy-target-date`, `#start-date`, `#end-date`, `#user-menu-planning`, `#pip-shelf-firsts`.
- Layering: modals z 1000, MacroTargetPopup / UndoToast / pull-to-dismiss 1100, landing 9999. Tour overlay ≈ 1200.
- `useBodyScrollLock` active in recipe view, sheets, mobile account menu, ManageExtras.
- Menus close on outside mousedown/touchstart → a click-catching overlay will close them.
- Async loads (spinners); week strip/day buttons only when signed in; tick only today/past; variant seg needs ≥2 variants; Extras only for recipes with linked steps; SwapDaysModal closes on scroll.

## 11. Themes
- Copy overrides (Parchment), brand per theme, icon sets line/pixel/engraved.
- Cyberpunk: Ticker strip (shifts layout), `.city-rain`, CSS-injected labels.
- Parchment: `.candlelight` overlay (z 1, pointer-events none).
- Respect `body.lowfx` and `prefers-reduced-motion`. Tour styling needs a variant per theme (colours only from `styles/themes/`).

## Backend facts (for the Stir Frys default + wipe)
- New-user hook: `UserService.findOrCreateUser` (called from `security/CustomOAuth2UserService.java:27`).
- ~15 tables reference `users` with mixed delete rules (some CASCADE, templates none, recipe audit SET NULL). Wipe script must be derived from live `information_schema` at go-live, after a Workbench backup.
