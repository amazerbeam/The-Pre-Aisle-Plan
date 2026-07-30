# Tasks: Meal Plan screen — make the macro popups and the Options menu mobile-friendly

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-07-29
Completed: 2026-07-29

> **Manual device verification: OUTSTANDING.** `COMPLETE` here means code-complete — all 15 tasks implemented, production build green, and all reviewer findings resolved. The five deferred steps (Task 5 Steps 1-2, Task 8 Step 1, Task 11 Step 1, Task 12 Step 7) were never executed and remain unticked: they require an interactive Chrome DevTools device toolbar, and the keyboard-open viewport cannot be simulated non-interactively. 11 of the 13 acceptance criteria are verified **structurally only** — a green build validates none of these layout-and-touch outcomes. Do not treat this contract as signed off until a human has exercised 390×844, 390×360, 560×800 and 1280×800. Do not archive without recording that.

**Goal:** Fix the three mobile-broken surfaces on `/mealplan` — the day/week macro popups that dismiss themselves the moment you scroll them, the Options kebab menu whose dropdown renders off the left edge of the viewport at ≤600px, and the four Options modals whose confirm buttons become unreachable when the on-screen keyboard opens — plus the ≥44px touch-target, `@media (hover: hover)`, and `dvh` ergonomics sweep across the five stylesheets involved.

**Spec:** `plan.md` in this folder.
  
---

## File map

**Created:**
- `foodbytes-app/client/src/hooks/useBodyScrollLock.js` — locks `document.body.style.overflow` while a popup is open, restoring the captured prior value on cleanup.

**Modified:**
- `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.jsx:33-61,87-93,108,150` — drop the capture-phase scroll listener, add the scroll lock, split the callback refs, fix the hint copy.
- `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.css:3-36,80-103,204-240` — capped flex-column panel, 44px close button, hover/active split, `dvh`, bottom sheet at ≤480px.
- `foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.jsx:33-61,98-104,121,194` — same treatment as `DailyMacroPopup.jsx`.
- `foodbytes-app/client/src/components/mealplan/MealPlanMenu.jsx:39-80` — add the tap-to-close scrim sibling.
- `foodbytes-app/client/src/components/mealplan/MealPlanMenu.css:54-95` — bottom sheet at ≤600px, `z-index: 1000`, scrim selector, drop the 480px `min-width` block.
- `foodbytes-app/client/src/components/mealplan/CopyWeekModal.css:3-30,64-88,90-92,147-205,207-220` — capped flex-column panel, 44px targets, hover/active split, `dvh`, bottom sheet at ≤480px.
- `foodbytes-app/client/src/components/mealplan/TemplateModals.css:3-33,67-98,148-152,201-220,262-310` — same as `CopyWeekModal.css`, plus collapse `.tpl-list`'s nested scroller.
- `foodbytes-app/client/src/hooks/usePullToDismiss.js:80-113,126-147` — attach `touchmove` as a non-passive native listener via a new `setGestureRef`.

**Deleted:** *(none)*

**Read but not modified:** `WeeklyMacroPopup.css` — it declares only the `.macro-section*` / `.macro-summary*` selectors and inherits its whole panel shell from `DailyMacroPopup.css`, so Task 3's restructure covers it. Task 5 Step 2 and Task 13 Step 2 verify it needs no edit of its own. (This implicit cross-file dependency is pre-existing and is noted as debt in Task 15.)

---

## Phase 1 — Macro popups: stop the self-dismiss and pin the close button

The reported defect and its root cause. Each task is a self-contained vertical slice: the new hook first (nothing depends on it yet), then each popup's JSX, then each popup's CSS. Every task leaves the build green — the hook is inert until consumed, and the JSX changes reference only selectors that already exist or are added in the same phase. The phase boundary is safe because after it both macro popups scroll correctly and no other component has been touched.

### Task 1: Add the `useBodyScrollLock` hook ✓

- Skill: `react-frontend` — the "extract significant logic into a `use*` hook" rule, and the save/restore correction over `RecipeViewModal.jsx:164-169`.

**Files:**
- Create: `foodbytes-app/client/src/hooks/useBodyScrollLock.js`

- [x] **Step 1: Write the hook**

Create `foodbytes-app/client/src/hooks/useBodyScrollLock.js`:

```js
import { useEffect } from 'react'

/**
 * Locks background page scroll while `locked` is true.
 *
 * Restores the value captured at lock time rather than assigning '', so an
 * early unmount or a nested lock cannot leave the page permanently
 * unscrollable. Replaces the ad-hoc lock in RecipeViewModal.jsx:164-169.
 *
 * @param {boolean} locked - true while the popup is open
 */
export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}

export default useBodyScrollLock
```

- [x] **Step 2: Confirm the build still compiles**

Run: `cd foodbytes-app/client; npm run build`
Expected: Vite reports `✓ built in …` with no errors. The hook is not yet imported, so the bundle is unchanged apart from tree-shaking it out.

### Task 2: `DailyMacroPopup` — remove the scroll listener, lock body scroll, split the refs ✓

- Skill: `react-frontend` — mobile-first behaviour, no new async surface, existing empty guard preserved.

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.jsx:1-5,12-30,33-61,87-93,108,150`

- [x] **Step 1: Import the new hook**

Replace lines 1-5:

```jsx
import { useEffect, useRef, useCallback } from 'react'
import { formatDateShort } from '../../utils/dateUtils'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import PullToDismissUI from '../common/PullToDismissUI'
import './DailyMacroPopup.css'
```

- [x] **Step 2: Split the callback refs and lock body scroll**

Replace lines 13-30 (`const popupRef = useRef(null)` through the closing `}, [setScrollableRef])`) with:

```jsx
  const popupRef = useRef(null)

  useBodyScrollLock(true)

  // Pull-to-dismiss hook
  const {
    isDragging,
    circlePosition,
    isOverTarget,
    dragDirection,
    handlers: dismissHandlers,
    setScrollableRef,
    targetPosition
  } = usePullToDismiss(onClose)

  // Panel owns the gesture surface and the click-outside boundary
  const setPopupRef = useCallback((el) => {
    popupRef.current = el
  }, [])

  // The inner content div is the scroller, so it defines the
  // at-top / at-bottom boundaries for pull-to-dismiss
  const setContentRef = useCallback((el) => {
    setScrollableRef(el)
  }, [setScrollableRef])
```

- [x] **Step 3: Delete the capture-phase scroll listener**

In the `useEffect` at lines 33-61, remove the `handleScroll` declaration and both its `addEventListener` / `removeEventListener` calls. The effect body becomes:

```jsx
  // Close on click outside or ESC key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [onClose])
```

- [x] **Step 4: Attach the content ref and fix the hint copy**

At line 108, change `<div className="macro-popup-content">` to:

```jsx
        <div className="macro-popup-content" ref={setContentRef}>
```

At line 150, change the hint text — "tap anywhere" is false, tapping inside does nothing:

```jsx
        <p className="macro-popup-hint">Press ESC or tap outside to close</p>
```

- [x] **Step 5: Confirm no scroll listener and no stale hint remain**

Run:
```powershell
Select-String -Path foodbytes-app/client/src/components/mealplan/DailyMacroPopup.jsx -Pattern "addEventListener\('scroll'|tap anywhere"
```
Expected: no output (zero matches).

### Task 3: `DailyMacroPopup.css` — capped flex column, 44px close, hover/active split, `dvh` ✓

- Skill: `react-frontend` — ≥44px targets, `@media (hover: hover)`, `touch-action`, mobile-first, bottom-sheet idiom from `RecipeEditModal.css:194-212`.

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/DailyMacroPopup.css:3-36,80-103,144-146,204-240`

- [x] **Step 1: Add overlay padding and restructure the panel**

Replace lines 3-15 (`.macro-popup-overlay`) and lines 26-36 (`.macro-popup`) with:

```css
.macro-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}
```

```css
.macro-popup {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  min-width: 0;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease-out;
}
```

The `min-width: 320px` floor is gone (it overflowed sub-340px devices), `overflow: auto` is gone (the content div scrolls now), and `max-height` is declared twice so browsers without `dvh` keep today's `vh` behaviour.

- [x] **Step 2: Pin the header and hint, make the content the scroller**

Add `flex-shrink: 0;` as the last declaration of `.macro-popup-header` (line 53-61) and of `.macro-popup-hint` (line 204-211). Replace `.macro-popup-content` (lines 101-103) with:

```css
.macro-popup-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px;
}
```

- [x] **Step 3: Raise the close button to a 44px hit area and split hover/active**

Replace lines 80-99 (`.macro-popup-close` and its `:hover`) with:

```css
.macro-popup-close {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  min-width: 44px;
  min-height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

@media (hover: hover) {
  .macro-popup-close:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

.macro-popup-close:active {
  background-color: rgba(255, 255, 255, 0.3);
}

.macro-popup-close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
```

- [x] **Step 4: Wrap the remaining bare hover**

Replace lines 144-146 (`.macro-item:hover`) with:

```css
@media (hover: hover) {
  .macro-item:hover {
    border-color: #4a3f80;
  }
}
```

- [x] **Step 5: Rewrite the ≤480px block as a bottom sheet**

Replace lines 214-240 (the contents of `@media (max-width: 480px)`) with:

```css
@media (max-width: 480px) {
  .macro-popup-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .macro-popup {
    max-width: 100%;
    max-height: 95vh;
    max-height: 95dvh;
    border-radius: 12px 12px 0 0;
  }

  .macro-popup-header {
    padding: 14px;
    border-radius: 12px 12px 0 0;
  }

  .macro-popup-title h4 {
    font-size: 1.1rem;
  }

  .macro-popup-content {
    padding: 16px;
  }

  .macro-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .macro-item {
    padding: 14px;
  }

  .macro-popup-hint {
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }
}
```

The old `max-width: 95%; margin: 10px` is replaced — `margin` on a flex item fought the `min-width` floor, and a full-bleed sheet needs neither.

- [x] **Step 6: Build and confirm the stylesheet parses**

Run: `cd foodbytes-app/client; npm run build`
Expected: `✓ built in …`, no CSS warnings, no `Unexpected` parse errors.

### Task 4: `WeeklyMacroPopup` — same JSX treatment ✓

- Skill: `react-frontend` — identical rationale to Task 2; this popup is the one that actually needs scrolling on mobile (two sections, six stacked cards at ≤480px).

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.jsx:1-5,13-30,33-61,121,194`

- [x] **Step 1: Import the hook**

Replace lines 1-5:

```jsx
import { useEffect, useRef, useCallback } from 'react'
import { formatDateRange } from '../../utils/dateUtils'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import PullToDismissUI from '../common/PullToDismissUI'
import './WeeklyMacroPopup.css'
```

- [x] **Step 2: Split the callback refs and lock body scroll**

Replace lines 13-30 with the same shape as Task 2 Step 2:

```jsx
  const popupRef = useRef(null)

  useBodyScrollLock(true)

  // Pull-to-dismiss hook
  const {
    isDragging,
    circlePosition,
    isOverTarget,
    dragDirection,
    handlers: dismissHandlers,
    setScrollableRef,
    targetPosition
  } = usePullToDismiss(onClose)

  // Panel owns the gesture surface and the click-outside boundary
  const setPopupRef = useCallback((el) => {
    popupRef.current = el
  }, [])

  // The inner content div is the scroller, so it defines the
  // at-top / at-bottom boundaries for pull-to-dismiss
  const setContentRef = useCallback((el) => {
    setScrollableRef(el)
  }, [setScrollableRef])
```

- [x] **Step 3: Delete the capture-phase scroll listener**

Apply the identical edit as Task 2 Step 3 to the `useEffect` at lines 33-61 — remove `handleScroll` and both its listener calls, leaving `mousedown`, `touchstart`, and `keydown`.

- [x] **Step 4: Attach the content ref and fix the hint copy**

At line 121, change `<div className="macro-popup-content">` to:

```jsx
        <div className="macro-popup-content" ref={setContentRef}>
```

At line 194:

```jsx
        <p className="macro-popup-hint">Press ESC or tap outside to close</p>
```

- [x] **Step 5: Confirm both popups are clean**

Run:
```powershell
Select-String -Path foodbytes-app/client/src/components/mealplan/DailyMacroPopup.jsx, foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.jsx -Pattern "addEventListener\('scroll'|tap anywhere"
```
Expected: no output (zero matches).

- [x] **Step 6: Build**

Run: `cd foodbytes-app/client; npm run build`
Expected: `✓ built in …` with no errors.

### Task 5: Verify the macro popups scroll on a phone viewport ✓ *(checks DEFERRED to manual device verification — see note below; steps deliberately left unticked)*

- Skill: `react-frontend` — the skill forbids claiming a test passed; there is no test runner in `client/package.json`, so this is a stated manual check.

**Files:** *(no file changes — verification only)*

> **Implementer note (2026-07-29):** Steps 1 and 2 were **NOT EXECUTED** — they require a blocking `npm run dev` server and interactive Chrome DevTools device-toolbar driving, neither of which is available non-interactively. **No behavioural claim is made about the phone viewport.** The following *static* substitutes were run and passed:
> - `WeeklyMacroPopup.css` declares only `.macro-section`, `.macro-section:last-child`, `.macro-section-title`, `.macro-summary-grid`, `.macro-summary-item`, `.macro-summary-label`, `.macro-summary-value`, `.macro-summary-calories` and one `@media (max-width: 480px)` block — **no panel-shell selector**, so Task 3's restructure covers it and it needs no edit of its own (plan's "Read but not modified" claim confirmed).
> - `MealPlanCalendar.jsx` imports both `MealPlanDay` (→ `DailyMacroPopup` → `DailyMacroPopup.css`) and `WeeklyMacroPopup`, so the shared `.macro-popup*` shell is present in the same module tree in dev as well as in the production bundle.
> - `.macro-popup-content` exists in `DailyMacroPopup.css:119` with `flex: 1; overflow-y: auto` and carries `ref={setContentRef}` in `DailyMacroPopup.jsx:110` and `WeeklyMacroPopup.jsx:123`.
> - `.macro-popup-header` (`:64`) and `.macro-popup-hint` (`:234`) both carry `flex-shrink: 0`.
> - Neither popup contains `addEventListener('scroll'` or the stale "tap anywhere" copy.

- [ ] **Step 1: Start the dev server** — NOT EXECUTED (blocking long-running server; production build is the real gate)

Run: `cd foodbytes-app/client; npm run dev`
Expected: Vite prints `Local: http://localhost:5173/`.

- [ ] **Step 2: Exercise both popups at 390×844** — NOT EXECUTED (requires interactive Chrome DevTools device toolbar)

In Chrome DevTools → Device toolbar → iPhone 14 Pro (390×844), signed in, on `/mealplan`:

1. Tap the **Week Total** pill → Weekly Summary opens as a bottom sheet.
2. Scroll the content down to "Daily Average". Expected: **the popup stays open** and the purple header with the `×` stays pinned at the top.
3. Tap `×`. Expected: closes.
4. Reopen, then scroll the page behind the sheet. Expected: the page behind does not move (body scroll locked).
5. Tap a day's calorie pill → Daily popup. Repeat steps 2-4.
6. Reopen the Weekly sheet, drag **down** from the top of the content. Expected: the dismiss circle appears with the X target at the bottom; releasing over it closes the popup.
7. Scroll to the bottom, drag **up**. Expected: the X target appears at the top; releasing over it closes.

Expected overall: no popup closes as a side effect of scrolling, and drag-to-dismiss still fires at both scroll extremes (this is the `setScrollableRef` repoint working).

---

## Phase 2 — Options menu: bottom sheet at ≤600px, above the footer

Independent of Phase 1 — different component, different stylesheet, no shared selector. The phase ends with the menu reachable on a phone and the build green. Safe boundary because the desktop dropdown path is untouched: every change is inside a `@media (max-width: 600px)` block or a new selector that is `display: none` above it.

### Task 6: `MealPlanMenu.css` — bottom sheet and scrim ✓

- Skill: `react-frontend` — bottom-sheet idiom, `z-index` above the fixed footer, safe-area padding.

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanMenu.css:54-66,84-95`

- [x] **Step 1: Add the scrim selector**

Insert immediately after `.meal-plan-menu` (after line 4):

```css
/* Mobile-only tap-to-close backdrop for the bottom sheet.
   Sits inside .meal-plan-menu, so MealPlanMenu.jsx gives it an explicit
   onClick — the document click-outside handler treats it as an inside tap. */
.meal-plan-menu-scrim {
  display: none;
}
```

- [x] **Step 2: Wrap the remaining bare hover on the menu items**

Replace lines 84-89 (`.meal-plan-menu-list button:hover, :focus-visible`) with:

```css
@media (hover: hover) {
  .meal-plan-menu-list button:hover {
    background: #f3f0fa;
    color: #4a3f80;
  }
}

.meal-plan-menu-list button:focus-visible {
  background: #f3f0fa;
  color: #4a3f80;
  outline: none;
}

.meal-plan-menu-list button:active {
  background: #e9e3f7;
  color: #4a3f80;
}
```

Also add `touch-action: manipulation;` and `-webkit-tap-highlight-color: transparent;` to `.meal-plan-menu-list button` (lines 72-82).

- [x] **Step 3: Replace the 480px block with a 600px bottom sheet**

Replace lines 91-95 (the whole `@media (max-width: 480px)` block) with:

```css
/* 600px, not the house 480px: this is where MealPlanCalendar.css:197 flips
   .calendar-header to a left-aligned column, which is what pushes the
   right-anchored dropdown off the left edge of the viewport. */
@media (max-width: 600px) {
  .meal-plan-menu-scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(0, 0, 0, 0.4);
    animation: mealPlanMenuFadeIn 0.2s ease-out;
  }

  .meal-plan-menu-list {
    position: fixed;
    top: auto;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1000;
    min-width: 0;
    padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0px));
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.22);
    animation: mealPlanMenuSlideUp 0.2s ease-out;
  }

  .meal-plan-menu-list button {
    padding: 16px 20px;
    font-size: 1rem;
  }
}

@keyframes mealPlanMenuFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes mealPlanMenuSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

`z-index: 1000` replaces the inherited `50`, which was losing to `Footer.css:1-9` (`position: fixed; z-index: 100`).

- [x] **Step 4: Build**

Run: `cd foodbytes-app/client; npm run build`
Expected: `✓ built in …` with no CSS parse errors.

### Task 7: `MealPlanMenu.jsx` — render the scrim ✓

- Skill: `react-frontend` — keeps the existing `contains()` click-outside contract intact by leaving the sheet inside `wrapperRef`.

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/MealPlanMenu.jsx:55-78`

- [x] **Step 1: Add the scrim as a sibling of the menu list**

Replace line 55 (`{open && (`) through line 78 (`)}`) with:

```jsx
      {open && (
        <>
          {/* Mobile bottom-sheet backdrop. Needs its own onClick: it renders
              inside wrapperRef, so the document handler's contains() check
              reads a tap here as an inside tap and would not close. */}
          <div
            className="meal-plan-menu-scrim"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul className="meal-plan-menu-list" role="menu">
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onCopyWeek)}>
                Copy week…
              </button>
            </li>
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onSaveAs)}>
                Save as template…
              </button>
            </li>
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onApply)}>
                Apply template…
              </button>
            </li>
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onManage)}>
                Manage templates…
              </button>
            </li>
          </ul>
        </>
      )}
```

- [x] **Step 2: Confirm the file is still within the size budget**

Run: `(Get-Content foodbytes-app/client/src/components/mealplan/MealPlanMenu.jsx | Measure-Object -Line).Lines`
Expected: a number under 200 (was 84; the fragment and scrim add roughly 12 lines).

> Result: `87`. Note `Measure-Object -Line` skips blank lines; the true total is **93** lines (`@(Get-Content …).Count`), up from 84. Well under both 200 and the 400-line budget. `MealPlanMenu.css` is 152 lines.

- [x] **Step 3: Build**

Run: `cd foodbytes-app/client; npm run build`
Expected: `✓ built in …` with no errors.

### Task 8: Verify the Options menu on a phone viewport ✓ *(checks DEFERRED to manual device verification — see note below; step deliberately left unticked)*

- Skill: `react-frontend` — manual verification; no test runner exists.

**Files:** *(no file changes — verification only)*

> **Implementer note (2026-07-29):** Step 1 was **NOT EXECUTED** — it requires a blocking `npm run dev` server and interactive Chrome DevTools device-toolbar driving, neither available non-interactively. **No behavioural claim is made about any phone viewport.** The following *static* substitutes were run and all passed:
> - **Ancestor containing-block check (the load-bearing assumption).** For `position: fixed` to escape to the viewport, no ancestor may set `transform`, `filter`, `contain`, `perspective`, `backdrop-filter`, or `will-change`. The full chain is `html` → `body` → `#root` → `.app` → `.main-content` → `.meal-plan-calendar` → `.calendar-header` → `.meal-plan-menu`. Checked: `global.css` `html:64`, `body:68`, `.app:76`, `.main-content:84` — none set any of those properties (the only `transform` in `global.css` is `@keyframes spin` at `:164`, unrelated). No `#root` rule exists in `global.css` and `index.html` carries no inline styles. `MealPlanCalendar.css` `.meal-plan-calendar:3` and `.calendar-header:9` / `:202` set no such property. `MealPlanMenu.css` `.meal-plan-menu:1` sets only `position: relative; display: inline-block`. **No containing-block trap — the sheet escapes to the viewport, no portal needed.**
> - `MealPlanMenu.jsx:21-23` already has the `Escape` handler (`handleKey` → `if (e.key === 'Escape') setOpen(false)`, registered on `document` `keydown`), so Task 8 item 4's premise holds. Untouched by this phase.
> - `choose(handler)` (`MealPlanMenu.jsx:34-37`) calls `setOpen(false)` **before** `handler?.()`, so item 5 (menu closes, then `CopyWeekModal` opens) is structurally satisfied.
> - `Footer.css:1-9` is confirmed `position: fixed; … z-index: 100`, so the sheet's `z-index: 1000` and the scrim's `999` both clear it (item 2).
> - `MealPlanCalendar.css:197-206` confirmed: `@media (max-width: 600px) { .calendar-header { flex-direction: column; align-items: flex-start; … } }` — the premise of the 600px breakpoint, and the reason a 480px sheet would leave 481–600px broken.
> - The scrim is `display: none` by default and only becomes `display: block` inside `@media (max-width: 600px)`, so the ≥601px desktop dropdown path (item 7) is untouched: no scrim, `position: absolute; right: 0`, `z-index: 50` as before.

- [ ] **Step 1: Exercise the menu at 390×844 and at 560×800** — NOT EXECUTED (requires a blocking dev server plus interactive Chrome DevTools device toolbar)

With `npm run dev` running, on `/mealplan` in the device toolbar:

1. At **390×844**, tap the kebab. Expected: a full-width sheet slides up from the bottom with all four items — Copy week…, Save as template…, Apply template…, Manage templates… — fully on-screen, and a dimmed scrim behind it.
2. Confirm the sheet's last item sits **above** the fixed footer, not behind it.
3. Tap the scrim. Expected: the menu closes.
4. Reopen, press `Escape`. Expected: closes.
5. Reopen, tap **Copy week…**. Expected: the menu closes and `CopyWeekModal` opens.
6. At **560×800** (between the old 480px block and the 600px header reflow), repeat step 1. Expected: still a bottom sheet, still fully on-screen — this width was broken before.
7. At **1280×800**, tap the kebab. Expected: the original dropdown anchored under the kebab at the right of the header, **no scrim**, unchanged from today.

---

## Phase 3 — Options modals: cap the height so the actions row stays reachable

Independent of Phases 1 and 2. Two stylesheets, no JSX. The boundary is safe because both files receive the same self-contained structural change and neither shares a selector with anything already modified. After this phase all four modals the Options menu opens survive a keyboard-open viewport.

### Task 9: `CopyWeekModal.css` — capped flex column, 44px targets, hover/active split ✓

- Skill: `react-frontend` — ≥44px targets, `@media (hover: hover)`, `dvh`, bottom-sheet idiom.

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/CopyWeekModal.css:3-30,64-88,90-92,147-205,207-220`

- [x] **Step 1: Add overlay padding and restructure the panel**

Add `padding: 16px;` before the `animation` line of `.copy-modal-overlay` (lines 3-15). Replace `.copy-modal` (lines 22-30) with:

```css
.copy-modal {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  min-width: 0;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  animation: copySlideIn 0.2s ease-out;
}
```

- [x] **Step 2: Pin the header and hint, make the content the scroller**

Add `flex-shrink: 0;` as the last declaration of `.copy-modal-header` (lines 37-45) and `.copy-modal-hint` (lines 198-205). Replace `.copy-modal-content` (lines 90-92) with:

```css
.copy-modal-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px 16px 16px;
}
```

- [x] **Step 3: Raise the close button to a 44px hit area**

Replace lines 64-83 (`.copy-modal-close` and its `:hover`) with:

```css
.copy-modal-close {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  min-width: 44px;
  min-height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

@media (hover: hover) {
  .copy-modal-close:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

.copy-modal-close:active {
  background-color: rgba(255, 255, 255, 0.3);
}

.copy-modal-close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
```

- [x] **Step 4: Give the action buttons a 44px floor and split hover/active**

Add to both `.copy-cancel-button` (lines 153-164) and `.copy-confirm-button` (lines 176-187):

```css
  min-height: 44px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
```

Then replace `.copy-cancel-button:hover` (lines 166-169) and `.copy-confirm-button:hover:not(:disabled)` (lines 189-191) with:

```css
@media (hover: hover) {
  .copy-cancel-button:hover:not(:disabled) {
    border-color: #999;
    color: #333;
  }

  .copy-confirm-button:hover:not(:disabled) {
    background: #3d3469;
  }
}

.copy-cancel-button:active:not(:disabled) {
  border-color: #999;
  color: #333;
}

.copy-confirm-button:active:not(:disabled) {
  background: #3d3469;
}
```

Note the `:not(:disabled)` added to the cancel button's hover — it was missing, so a disabled cancel button still lit up on hover.

- [x] **Step 5: Rewrite the ≤480px block as a bottom sheet**

Replace lines 207-220 with:

```css
@media (max-width: 480px) {
  .copy-modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .copy-modal {
    max-width: 100%;
    max-height: 95vh;
    max-height: 95dvh;
    border-radius: 12px 12px 0 0;
  }

  .copy-modal-header {
    padding: 14px;
    border-radius: 12px 12px 0 0;
  }

  .copy-modal-title h4 {
    font-size: 1rem;
  }

  .copy-modal-hint {
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }
}
```

- [x] **Step 6: Build**

Run: `cd foodbytes-app/client; npm run build`
Expected: `✓ built in …` with no CSS parse errors.

### Task 10: `TemplateModals.css` — same treatment plus collapse the nested scroller ✓

- Skill: `react-frontend` — one scroller per panel on touch; ≥44px targets; `dvh`.

**Files:**
- Modify: `foodbytes-app/client/src/components/mealplan/TemplateModals.css:3-33,40-48,67-98,201-220,262-310`

- [x] **Step 1: Add overlay padding and cap the panel**

Add `padding: 16px;` before the `animation` line of `.tpl-modal-overlay` (lines 3-12). Replace `.tpl-modal` (lines 19-29) with:

```css
.tpl-modal {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  min-width: 0;
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  max-height: 90dvh;
  animation: tplSlideIn 0.2s ease-out;
  display: flex;
  flex-direction: column;
}
```

- [x] **Step 2: Pin the header and hint, make the content the scroller**

Add `flex-shrink: 0;` as the last declaration of `.tpl-modal-header` (lines 40-48) and `.tpl-modal-hint` (lines 201-208). Replace `.tpl-modal-content` (lines 93-98) with:

```css
.tpl-modal-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

- [x] **Step 3: Remove `.tpl-list`'s nested scroller**

Replace `.tpl-list` (lines 211-220) with:

```css
/* No max-height / overflow-y here: .tpl-modal-content is the single
   scroller. Two nested touch scrollers cause scroll-chaining on mobile. */
.tpl-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

- [x] **Step 4: Raise the close button to a 44px hit area**

Replace lines 67-86 (`.tpl-modal-close` and its `:hover`) with:

```css
.tpl-modal-close {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  min-width: 44px;
  min-height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

@media (hover: hover) {
  .tpl-modal-close:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

.tpl-modal-close:active {
  background-color: rgba(255, 255, 255, 0.3);
}

.tpl-modal-close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
```

- [x] **Step 5: Raise `.tpl-action-button` and `.tpl-small` to 44px and split their hovers**

Change `min-height: 36px` to `min-height: 44px` in `.tpl-action-button` (line 271) and in `.tpl-small` (line 297), adding to both:

```css
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
```

Then replace `.tpl-action-button:hover:not(:disabled)` (lines 275-278) and `.tpl-action-danger:hover:not(:disabled)` (lines 290-293) with:

```css
@media (hover: hover) {
  .tpl-action-button:hover:not(:disabled) {
    background: #f3f0fa;
    border-color: #4a3f80;
  }

  .tpl-action-danger:hover:not(:disabled) {
    background: #fdecea;
    border-color: #c0392b;
  }
}

.tpl-action-button:active:not(:disabled) {
  background: #f3f0fa;
  border-color: #4a3f80;
}

.tpl-action-danger:active:not(:disabled) {
  background: #fdecea;
  border-color: #c0392b;
}
```

Apply the same `@media (hover: hover)` + `:active` split to `.tpl-cancel-button:hover:not(:disabled)` (lines 168-171) and `.tpl-confirm-button:hover:not(:disabled)` (lines 192-194), and add the two touch declarations to both button rules.

- [x] **Step 6: Rewrite the ≤480px block as a bottom sheet**

Replace lines 302-310 with:

```css
@media (max-width: 480px) {
  .tpl-modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .tpl-modal {
    max-width: 100%;
    max-height: 95vh;
    max-height: 95dvh;
    border-radius: 12px 12px 0 0;
  }

  .tpl-modal-header {
    padding: 14px;
    border-radius: 12px 12px 0 0;
  }

  .tpl-list-item {
    align-items: flex-start;
  }

  .tpl-modal-hint {
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }
}
```

- [x] **Step 7: Build**

Run: `cd foodbytes-app/client; npm run build`
Expected: `✓ built in …` with no CSS parse errors.

### Task 11: Verify the four Options modals with the keyboard open ✓ *(checks DEFERRED to manual device verification — see note below; step deliberately left unticked)*

- Skill: `react-frontend` — manual verification; no test runner exists.

**Files:** *(no file changes — verification only)*

> **Implementer note (2026-07-29):** Step 1 was **NOT EXECUTED** — it requires a blocking `npm run dev` server and interactive Chrome DevTools device-toolbar driving, neither available non-interactively. **No behavioural claim is made about any phone viewport, and nothing about the keyboard-open case has been observed.** The following *static* substitutes were run and all passed:
> - **DOM order matches the CSS shape (the load-bearing assumption).** All four consuming components render the panel with exactly three direct children in the order header → content → hint: `CopyWeekModal.jsx:89/106/157` (`.copy-modal-header` / `.copy-modal-content` / `.copy-modal-hint`), `SaveTemplateModal.jsx:59/75/111`, `ApplyTemplateModal.jsx:65/83/137`, `ManageTemplatesModal.jsx:98/114/211`. So `flex-shrink: 0` lands on the header and hint and `flex: 1` on the content, as intended.
> - **The actions row is a direct child of `.{copy,tpl}-modal-content`, NOT of the panel** — `CopyWeekModal.jsx:139`, `SaveTemplateModal.jsx:92`, `ApplyTemplateModal.jsx:117`, `ManageTemplatesModal.jsx:199`. It therefore lives *inside* the scroller and scrolls into reach rather than being squashed by the flex layout. No `flex-shrink: 0` on the actions row is needed, and none was added. This also means the actions are never pinned — consistent with the plan's accepted `.tpl-list` consequence.
> - No `36px` or `32px` tap-target literal remains in either stylesheet (`Select-String '3(6|2)px'` → 0 hits in both).
> - No bare `:hover` outside `@media (hover: hover)`. Every `:hover` rule sits inside such a block: `CopyWeekModal.css` hovers at `:91,:214,:219` under blocks opening at `:90,:213`; `TemplateModals.css` hovers at `:92,:213,:218,:325,:330` under blocks opening at `:91,:212,:324`. Each is paired with an `:active` counterpart.
> - `.tpl-list` (`TemplateModals.css:250-257`) no longer declares `max-height` or `overflow-y`. The only remaining `max-height` declarations in the file are the panel caps (`:27-28` 90vh/90dvh, `:363-364` 95vh/95dvh) and the single `overflow-y: auto` is on `.tpl-modal-content` (`:113`).
> - Both files inside the 400-line budget, measured with `(Get-Content …).Count`: `CopyWeekModal.css` **273**, `TemplateModals.css` **380**. `TemplateModals.css` is now within 20 lines of the ceiling — flagged for the reviewers.
> - Production build clean after each task (see Task 9 Step 6 / Task 10 Step 7).

- [ ] **Step 1: Exercise all four modals at 390×844** — NOT EXECUTED (requires a blocking dev server plus interactive Chrome DevTools device toolbar; the keyboard-open viewport in particular cannot be simulated non-interactively)

With `npm run dev` running, on `/mealplan` in the device toolbar at iPhone 14 Pro:

1. Options → **Copy week…**. Expected: a bottom sheet with the date input, and the Cancel / Copy buttons visible.
2. Focus the date input so the on-screen keyboard region is simulated — in DevTools, shrink the viewport height to **390×360** to stand in for it. Expected: the panel caps at 95dvh and the content **scrolls**, so Cancel / Copy stay reachable. Before this change they were pushed off-screen.
3. Options → **Save as template…**, type a name at 390×360. Expected: same — actions reachable.
4. Options → **Apply template…** at 390×360. Expected: the select and actions reachable.
5. Options → **Manage templates…** at 390×844. Expected: template rows render, each Rename / Update / Delete button is comfortably tappable (44px, up from 36px), and the whole content area scrolls as one — the "Done" button scrolls with the list rather than pinning below it.
6. In Manage, tap **Rename** on a row. Expected: the inline input appears with Cancel / Save at 44px.
7. At **1280×800**, reopen each of the four. Expected: centred dialogs, visually unchanged from today apart from the taller close buttons.

---

## Phase 4 — `usePullToDismiss`: make `preventDefault` actually fire

Optional and deliberately last. This is the one change that reaches components outside the named scope — `SwapDaysModal` and `IngredientBreakdownPopup` also consume the hook — so it is isolated here and can be dropped wholesale without touching Phases 1-3. The boundary is safe either way: skip it and everything already shipped keeps working; apply it and all five consumers get the gesture the hook always intended.

### Task 12: Attach `touchmove` as a non-passive native listener ✓ *(Step 7's checks DEFERRED to manual device verification — see note below; step deliberately left unticked)*

- Skill: `react-frontend` — hooks hold logic; no imperative setter exposed for render-time use.

**Files:**
- Modify: `foodbytes-app/client/src/hooks/usePullToDismiss.js:1,80-113,126-147`

- [x] **Step 1: Add the gesture ref and a non-passive `touchmove` effect**

React 18 registers `onTouchMove` passively at the root, so the existing `e.preventDefault()` at line 108 is a silent no-op. Change the import on line 1 to include `useEffect`:

```js
import { useState, useRef, useCallback, useEffect } from 'react'
```

Add a gesture-element ref alongside the existing refs (after line 25, `const initialScrollTop = useRef(0)`):

```js
  const [gestureEl, setGestureEl] = useState(null)

  const setGestureRef = useCallback((element) => {
    setGestureEl(element)
  }, [])
```

Then, after `handleTouchMove` is declared (after line 113), add:

```js
  // Attached natively rather than via React's onTouchMove: React 18 registers
  // touchmove passively at the root, which makes the preventDefault() inside
  // handleTouchMove a silent no-op — the popup would scroll and show the
  // dismiss circle at the same time.
  useEffect(() => {
    if (!gestureEl) return

    const handler = handleTouchMove
    gestureEl.addEventListener('touchmove', handler, { passive: false })

    return () => {
      gestureEl.removeEventListener('touchmove', handler, { passive: false })
    }
  }, [gestureEl, handleTouchMove])
```

`handleTouchMove` is in the dependency array because it closes over `isDragging`; omitting it would pin the listener to a stale value.

- [x] **Step 2: Drop `onTouchMove` from the returned handlers and export `setGestureRef`**

Replace lines 131-146 (the `handlers` object through the `return`) with:

```js
  // Touch handlers to spread onto the popup container. onTouchMove is attached
  // natively via setGestureRef — see the effect above.
  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  }

  return {
    isDragging,
    circlePosition,
    isOverTarget,
    dragDirection,
    handlers,
    setScrollableRef,
    setGestureRef,
    targetPosition
  }
```

- [x] **Step 3: Wire `setGestureRef` in both macro popups**

In `DailyMacroPopup.jsx` and `WeeklyMacroPopup.jsx`, add `setGestureRef` to the destructured hook result, and call it from the panel's callback ref alongside `popupRef`:

```jsx
  const setPopupRef = useCallback((el) => {
    popupRef.current = el
    setGestureRef(el)
  }, [setGestureRef])
```

- [x] **Step 4: Enumerate every consumer that must be rewired** — the command as written is a parser error in Windows PowerShell 5.1 (`Select-String` has no `-Recurse` / `-Include`); ran `Get-ChildItem foodbytes-app/client/src -Recurse -Include *.jsx | Select-String -Pattern "usePullToDismiss\(" | Select-Object -ExpandProperty Path -Unique` instead. Confirmed exactly five consumers, no sixth.

Run:
```powershell
Select-String -Path foodbytes-app/client/src -Include *.jsx -Recurse -Pattern "usePullToDismiss\(" | Select-Object -ExpandProperty Path -Unique
```
Expected: five files — `DailyMacroPopup.jsx`, `WeeklyMacroPopup.jsx`, `SwapDaysModal.jsx`, `CopyWeekModal.jsx`, `IngredientBreakdownPopup.jsx`. Steps 1-3 covered the first two; the remaining three would silently lose the gesture (they never attach the move listener), so **Step 5 wires them**.

- [x] **Step 5: Wire `setGestureRef` in the remaining three consumers**

In `SwapDaysModal.jsx`, `CopyWeekModal.jsx`, and `IngredientBreakdownPopup.jsx`, destructure `setGestureRef` from `usePullToDismiss` and call it from the same callback ref that already receives the panel element, mirroring Step 3. Without this the pull-to-dismiss gesture stops working in those three.

- [x] **Step 6: Build**

Run: `cd foodbytes-app/client; npm run build`
Expected: `✓ built in …` with no errors.

- [ ] **Step 7: Verify the gesture in all five popups at 390×844** — NOT EXECUTED (requires a blocking dev server plus an interactive touch drag in the Chrome DevTools device toolbar; a touchmove gesture cannot be driven non-interactively). Static substitute performed instead: all five consumers destructure `setGestureRef` and call it with the panel element; all five still spread `{...dismissHandlers}` on the panel; no consumer declares its own `onTouchMove` alongside the spread, so removing `onTouchMove` from `handlers` breaks nothing.

For each of Weekly Summary, Daily macros, Swap days, Copy week, and a shopping-list ingredient breakdown (long-press an item on `/shopping`): open it, drag down from the top of the scroller. Expected: the dismiss circle follows the finger, the X target appears, the underlying content **does not scroll while dragging** (this is `preventDefault` now taking effect), and releasing over the target closes the popup.

---

## Phase 5 — Final verification

No production changes. Cumulative sanity checks that the work is clean and nothing regressed against the `react-frontend` success criteria.

### Task 13: Grep for stale patterns and hard-floor violations ✓

- Skill: `react-frontend` — the skill's success criteria are the grep targets.

**Files:** *(no file changes — verification only)*

- [x] **Step 1: Confirm no capture-phase scroll listener remains in the touched files** — DONE. Exactly one match, as expected, at **`SwapDaysModal.jsx:60`** (add) with its cleanup at 66, matching the location recorded below. No match in `DailyMacroPopup.jsx` or `WeeklyMacroPopup.jsx`. Corroborated with a repo-wide Grep over all of `client/src`.

Run:
```powershell
Select-String -Path foodbytes-app/client/src/components/mealplan/*.jsx -Pattern "addEventListener\('scroll'"
```
Expected: exactly one match — `SwapDaysModal.jsx:60`, which `plan.md` records as deliberately out of scope. No match in `DailyMacroPopup.jsx` or `WeeklyMacroPopup.jsx`.

- [x] **Step 2: Confirm no sub-44px tap target remains in the five touched stylesheets** — DONE. Zero matches across all five stylesheets. Ran the multi-path form by building the path array in a variable first (the inline comma-separated multi-path form is fragile in PS 5.1).

Run:
```powershell
Select-String -Path foodbytes-app/client/src/components/mealplan/DailyMacroPopup.css, foodbytes-app/client/src/components/mealplan/WeeklyMacroPopup.css, foodbytes-app/client/src/components/mealplan/CopyWeekModal.css, foodbytes-app/client/src/components/mealplan/TemplateModals.css, foodbytes-app/client/src/components/mealplan/MealPlanMenu.css -Pattern "min-height: 36px|height: 32px|width: 32px"
```
Expected: no output (zero matches).

- [x] **Step 3: Confirm the `console.log` baseline has not grown** — DONE. Count is exactly **6**, at the documented baseline locations (`api.js:17`, `useWakeLock.js:44/49/62/65`, `MealPlanEntry.jsx:115`). The command as written is a **hard parser error** — `Select-String` in PS 5.1 has neither `-Recurse` nor `-Include`. Ran `Get-ChildItem <src> -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)"` instead.

Run:
```powershell
(Select-String -Path foodbytes-app/client/src -Include *.js,*.jsx -Recurse -Pattern "console\.(log|debug)" | Measure-Object).Count
```
Expected: `6` — the documented baseline, unchanged.

- [x] **Step 4: Confirm no new dependency, no TypeScript, no CSS Modules** — DONE by substitute mechanism. **`git` is not on this shell's PATH** (`git --version` → "not recognized"), so neither `git` command could run. Verified the same substance directly: `package.json` declares exactly the four runtime deps (`axios`, `react`, `react-dom`, `react-router-dom`) and four unchanged devDeps; `package-lock.json`'s root block declares the identical set; `Get-ChildItem -Recurse -Include *.ts,*.tsx` over `client/src` → none; `Get-ChildItem -Recurse -Filter *.module.css` → none. Note `package-lock.json` carries a today mtime (16:59:52, *before* Phase 1's first edit at 17:26) — content is unchanged in its declared deps, but without `git` this cannot be diffed. See Findings.

Run:
```powershell
git diff --stat -- foodbytes-app/client/package.json foodbytes-app/client/package-lock.json
```
Expected: no output (both untouched).

Run:
```powershell
git status --porcelain -- foodbytes-app/client/src | Select-String -Pattern "\.tsx?$|\.module\.css$"
```
Expected: no output (zero matches).

- [x] **Step 5: Confirm no file created or grown by this change exceeds the 400-line budget** — DONE. That is the binding constraint, and it holds. It is **not** true that no touched file exceeds 400: `RecipeViewModal.jsx` is **425**, but it is **pre-existing over-budget code that this change shrank** — a 6-line ad-hoc `useEffect` scroll lock was replaced by one `useBodyScrollLock` call plus one import. It entered this change already over the ceiling and leaves smaller; splitting it is separate, pre-existing debt.

  Used `(Get-Content …).Count` for true totals, because the `Measure-Object -Line` form in the command below **does not count blank lines and under-reports** (e.g. `TemplateModals.css` 381 true vs 355 measured). Also extended the check to the **CSS** files, which the command omits even though they are among the largest touched files, and to the two files the later fix pass newly touched (`RecipeViewModal.jsx`, `ExtrasSelectionPopup.jsx` — both migrated off their ad-hoc locks onto the shared hook).

  True totals, post-fix-pass: `TemplateModals.css` **381** (19 from the ceiling — the largest file this change grew), `DailyMacroPopup.css` 284, `CopyWeekModal.css` 274, `ExtrasSelectionPopup.jsx` 239, `WeeklyMacroPopup.jsx` 208, `usePullToDismiss.js` 181, `CopyWeekModal.jsx` 174, `MealPlanMenu.css` 170, `DailyMacroPopup.jsx` 164, `SwapDaysModal.jsx` 141, `MealPlanMenu.jsx` 103, `useBodyScrollLock.js` 47. Over-budget but shrunk by this change, not grown: `RecipeViewModal.jsx` **425**. `MealPlanCalendar.jsx` (untouched) is 243. `IngredientBreakdownPopup.jsx` is now 140, up from the 111 recorded earlier — that growth belongs to the sibling contract `2026-07-29-shopping-list-breakdown-all-dishes` (`formatPlanDate` / `formatMealContext` / `viaRecipeName`), **not** to this change.

Run:
```powershell
Get-ChildItem foodbytes-app/client/src/components/mealplan/*.jsx, foodbytes-app/client/src/hooks/*.js | ForEach-Object { "$($_.Name): $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }
```
Expected: no file created or grown by this change exceeds 400 lines. `WeeklyMacroPopup.jsx` (was 210) and `MealPlanCalendar.jsx` (244, untouched) are the largest in the folder; `useBodyScrollLock.js` is under 30.

### Task 14: Clean production build ✓

- Skill: `react-frontend` — the only automated gate available; there is no test runner.

**Files:** *(no file changes — verification only)*

- [x] **Step 1: Build from clean** — DONE. Removed `dist`, ran `npm run build`: `vite v5.4.21`, `169 modules transformed`, `✓ built in 544ms`, **exit code 0, 0 errors, 0 warnings**. Output: `index.html` 0.84 kB, `index-D-DlA4Xm.css` 96.75 kB (gzip 15.69), `index-DCwsNBRf.js` 315.90 kB (gzip 96.81). Because the build emitted **zero** warnings in total, the "0 new warnings vs a pre-change build" criterion is satisfied without needing a baseline build (which `git` being absent would have prevented anyway).

Run:
```powershell
cd foodbytes-app/client; if (Test-Path dist) { Remove-Item -Recurse -Force dist }; npm run build
```
Expected: `✓ built in …` with 0 errors and 0 new warnings versus a pre-change build. (`-ErrorAction SilentlyContinue` is avoided deliberately — in Windows PowerShell 5.1 it suppresses the message but still reports exit 1.)

- [x] **Step 2: Confirm no test claim is made** — DONE. Zero hits for `"test"` in `client/package.json`; `scripts` contains only `dev`, `build`, `preview`, and no test runner (`vitest`/`jest`/`@testing-library`/`playwright`/`cypress`) appears in `devDependencies`. **Correction to this step's premise:** it says the summary must state "verification was manual (device-emulation steps in Tasks 5, 8, 11, and 12)". That is not accurate — Tasks 5, 8, 11 and Task 12 Step 7 are all annotated **NOT EXECUTED** (lines 449, 454, 650, 1014, 1130). So **neither** an automated test **nor** manual device verification was performed. The summary states the named viewports as outstanding work, not completed work.

There is no test script in `client/package.json`. The summary must state that **no automated test was run** and that the manual device-emulation steps in Tasks 5, 8, 11, and 12 were **not executed either** — the clean production build is the only gate that actually ran.

Run: `Select-String -Path foodbytes-app/client/package.json -Pattern '"test"'`
Expected: zero hits — confirming the absence, so the summary's claim is accurate.

### Task 15: Write the change summary ✓

- Skill: `react-frontend` — the skill's Output section defines the required contents.

**Files:** *(no file changes — summary only)*

- [x] **Step 1: Produce the summary** — DONE. Delivered in the Implementer Report. Three deviations from the bullet list below: (a) the "verified manually" bullet is written as **outstanding** verification, since none of the device-emulation steps ran; (b) the scroll-close bug is cited at its real location **`SwapDaysModal.jsx:60`**, not `:56`; (c) four extra debt items were added — the scrim covering the kebab trigger, the two new keyframes not honouring `prefers-reduced-motion`, `TemplateModals.css` sitting just under the blocking budget while shared by three modals, and (at the time) `useBodyScrollLock` not being reference-counted. **That last item is now closed, not debt:** the hook *is* reference-counted at module level, and the two previously-independent ad-hoc locks (`RecipeViewModal.jsx`, `ExtrasSelectionPopup.jsx`) were migrated onto it, so every lock holder in the app now shares one count and the last unlock restores the captured `overflow` value. Both call sites pass a guarded argument (`!!recipeId`, `!!recipe?.extras?.length`) matching their `return null` early returns, so a component that renders nothing cannot pin the count.

Cover, per the skill's Output requirements:

- **What changed** — the three defect chains, plus the new `useBodyScrollLock` hook and the `usePullToDismiss` non-passive change.
- **Why this approach** — bottom sheet over the four-line anchor flip; scroll-lock over a narrowed scroll listener; fix-in-place over extracting a shared modal base.
- **What was verified manually, and that no automated test was run** — name the viewports exercised (390×844, 390×360, 560×800, 1280×800) and the popups covered.
- **Responsive / a11y considerations** — the 600px vs 480px breakpoint split and why; `:focus-visible` added to the three close buttons; the scrim's `aria-hidden="true"`; the corrected `.macro-popup-hint` copy.
- **Known risk / debt introduced** — five stylesheets now duplicate the same overlay, close-button, and hover rules (a shared modal base is the right long-term fix); `SwapDaysModal.jsx:60` still carries the scroll-close bug; `dvh` is inert below Safari 15.4 / Chrome 108; `.tpl-list` losing its own scroller changes how a long template list reads.

---

## Self-review

**Spec coverage** (each `plan.md` Part 1 "In scope" bullet → tasks):

- Remove scroll-closes-the-popup from both macro popups — Tasks 2, 4; verified Task 5, Task 13 Step 1.
- Restructure both macro popups to a pinned header + single scroller — Task 3 Steps 1-2, Task 4 Step 4; verified Task 5.
- Introduce `useBodyScrollLock` and consume it — Task 1; consumed Tasks 2, 4; verified Task 5 Step 2 item 4.
- Reposition `MealPlanMenu` as a ≤600px bottom sheet above the footer — Task 6 Step 3; verified Task 8 items 1, 2, 6.
- Tap-to-close scrim in `MealPlanMenu.jsx` — Task 7; verified Task 8 item 3.
- `max-height` + scrolling content on `CopyWeekModal` and the three template modals — Tasks 9, 10; verified Task 11 items 1-4.
- Collapse `.tpl-list`'s nested scroller — Task 10 Step 3; verified Task 11 item 5.
- Raise all seven listed tap targets to ≥44px — Task 3 Step 3, Task 9 Steps 3-4, Task 10 Steps 4-5; verified Task 13 Step 2.
- Wrap bare `:hover` in `@media (hover: hover)`, add `:active`, `touch-action`, `-webkit-tap-highlight-color` — Task 3 Steps 3-4, Task 6 Step 2, Task 9 Steps 3-4, Task 10 Steps 4-5.
- `vh` → `dvh` pairs and `env(safe-area-inset-bottom)` — Task 3 Steps 1, 5; Task 6 Step 3; Task 9 Steps 1, 5; Task 10 Steps 1, 6.
- Drop the `min-width: 320px` floors and add overlay padding — Task 3 Step 1, Task 9 Step 1, Task 10 Step 1.
- Correct the `.macro-popup-hint` copy — Task 2 Step 4, Task 4 Step 4; verified Task 2 Step 5.
- Non-passive `touchmove` in `usePullToDismiss` and repointed `setScrollableRef` — Task 12 (non-passive), Tasks 2/4 Step 2 (`setScrollableRef` repoint); verified Task 5 items 6-7, Task 12 Step 7.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code block or a `Run:` / `Expected:` pair. Task 4 Step 3 and Task 12 Step 5 reference an earlier task's edit shape by name — in both cases the full code is shown in the referenced step and the target file/selector is stated explicitly, so no step requires guessing.

**Type / name consistency:** `useBodyScrollLock` is spelled identically in Task 1 (definition), Tasks 2 and 4 (import and call). `setGestureRef` matches between `plan.md` Part 2 "Data shapes", Task 12 Steps 1-2 (definition and export), and Steps 3, 5 (all five consumers). `setPopupRef` is used consistently in Tasks 2, 4, and 12 Step 3, and remains load-bearing — it is the `useCallback` that fans one element out to both `setScrollableRef` and `setGestureRef`. The planned `setContentRef` wrapper does **not** exist in the shipped code (zero occurrences): it was deliberately dropped because the content `ref` points directly at `setScrollableRef`, which `usePullToDismiss` already exports as a stable `useCallback(…, [])`, so the wrapper added nothing. `.meal-plan-menu-scrim` matches between Task 6 Steps 1, 3 (CSS) and Task 7 Step 1 (JSX). `.macro-popup-content`, `.copy-modal-content`, `.tpl-modal-content` are each named identically wherever they appear.

**Phase boundary cleanliness:**
- **Phase 1** ends green: `useBodyScrollLock` is a new file that compiles standalone, both macro popups have their listener removed and refs repointed together, and their CSS is restructured in the same phase — no half-applied panel shape.
- **Phase 2** ends green: `MealPlanMenu.css` gains the scrim selector before `MealPlanMenu.jsx` renders it, so there is no moment where the JSX references an undefined class; the desktop path is untouched.
- **Phase 3** ends green: two stylesheets, no JSX, no shared selector with Phases 1-2; each file is fully rewritten in one task rather than split across tasks.
- **Phase 4** ends green and is droppable: Steps 3 and 5 together wire all five `usePullToDismiss` consumers, so the hook's contract change is never left partially adopted. Skipping the phase entirely leaves Phases 1-3 fully working.
- **Phase 5** makes no production change.
