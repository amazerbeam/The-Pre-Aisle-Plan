# Tasks: Visual and motion polish pass for Pip's room

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-14

**Goal:** Make Pip's room feel finished. Every room control gets hover, pressed and a visible focus ring; no one-shot sequence exceeds 3 s, which the node checks enforce; overlays share one entrance; reduced motion holds everywhere; the AC 5 decision is recorded; the developer signs off on the phone check and clothing art.

**Spec:** `plan.md` in this folder. AC 3 (dark mode) is skipped by developer decision, 2026-10-14.

---

## File map

**Created:**
- `foodbytes-app/client/src/utils/reducedMotion.js`: the one `prefersReducedMotion()` helper.
- `.claude/contract/MPP-29-pip-room-polish-pass/visual-review.md`: AC 5 decision plus the developer's phone/clothing review record.
- `.claude/contract/MPP-29-pip-room-polish-pass/pr-description.md`: PR text (Task M.5).

**Modified:**
- `foodbytes-app/client/src/styles/global.css`: Pip focus and motion tokens in `:root`.
- `foodbytes-app/client/src/constants/pet.js:73-80`: `PIP_ANIMATION_MAX_MS`, retuned `COOK_PHASE_MS`.
- `foodbytes-app/client/src/hooks/useCookAndServe.js`: import the shared helper.
- `foodbytes-app/client/src/hooks/usePipGrowth.js`: import the shared helper.
- `foodbytes-app/client/src/utils/cookServe.check.mjs`: new timings plus the 3 s limit.
- `foodbytes-app/client/src/utils/pipGrowth.check.mjs`: the 3 s limit on the stage-change sequences.
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx:210-220`: `PipWalker` transition duration from `COOK_PHASE_MS.walking`.
- `foodbytes-app/client/src/components/pet/room/PetRoom.css`: walker duration, shared overlay keyframe, ring tokens, edit-bar and chip states.
- `foodbytes-app/client/src/components/pet/room/CheckInActions.css`: ring token.
- `foodbytes-app/client/src/components/pet/room/FridgeView.css`: ring token, fade-in.
- `foodbytes-app/client/src/components/pet/room/TrophyCabinetView.css`: on-dark ring token, fade-in.
- `foodbytes-app/client/src/components/pet/room/ShopView.css`: entrance token, close/tab states, ring token.
- `foodbytes-app/client/src/components/pet/room/WardrobeView.css`: entrance token, close/text/lineup states, ring token.
- `foodbytes-app/client/src/components/pet/room/DecorPicker.css`: entrance token, close/option/more states, ring token.
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md`: version bump.

**Deleted:** (none)

---

## Phase 1 — Motion timing

Pins AC 2 in code: one reduced-motion helper, a 3 s limit asserted by the node checks, the cook scene retuned under it, and the walk transition reading the same constant. JS and one CSS rule only; the build and every `check:*` script are green at the end.

### Task 1: Extract `prefersReducedMotion()` into `utils/reducedMotion.js` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/utils/reducedMotion.js`
- Modify: `foodbytes-app/client/src/hooks/useCookAndServe.js` (line 5 const, lines 44-45 helper)
- Modify: `foodbytes-app/client/src/hooks/usePipGrowth.js` (line 6 const, lines 74-75 helper)

- [x] **Step 1: Create the helper**

```js
// MPP-29: the one reduced-motion read for JS-timed scenes (cook-and-serve, growth). CSS
// handles its own animations with @media (prefers-reduced-motion: reduce).
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** True when the viewer asked for reduced motion; false where matchMedia is missing (node checks). */
export const prefersReducedMotion = () => window.matchMedia?.(REDUCED_MOTION_QUERY).matches === true
```

- [x] **Step 2: Use it in both hooks**

In `useCookAndServe.js`: delete `const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'`, delete the trailing `// AC 5: read once per scene…` comment and `const prefersReducedMotion = …` line, and add `import { prefersReducedMotion } from '../utils/reducedMotion'` after the `pipSeenStore` import.

In `usePipGrowth.js`: delete `const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'`, delete the trailing `// Read once per run; …` comment and `const prefersReducedMotion = …` line, and add `import { prefersReducedMotion } from '../utils/reducedMotion'` after the `pipGrowthSeenStore` import.

- [x] **Step 3: Confirm no copy remains**

Run: `Select-String -Path foodbytes-app\client\src\hooks\*.js -Pattern "REDUCED_MOTION_QUERY ="`
Expected: zero hits.

### Task 2: Add the 3 s limit and retune `COOK_PHASE_MS` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/pet.js:73-80`
- Test: `foodbytes-app/client/src/utils/cookServe.check.mjs`

- [x] **Step 1: Update the failing check first**

In `cookServe.check.mjs`, change the import line to also bring in the constants:

```js
import { shouldServe, cookServeSchedule, cookServeBubble, shouldTakeToPip } from './cookServe.js'
import { PIP_ANIMATION_MAX_MS } from '../constants/pet.js'
```

Replace the `// AC 1: full scene in order with the mockup's timings…` block's first `assert.deepEqual` with:

```js
// AC 1: full scene in order; MPP-29 AC 2 retuned it to 3.0 s end to end.
assert.deepEqual(cookServeSchedule(false), [
  { phase: 'walking', ms: 700 },
  { phase: 'cooking', ms: 1000 },
  { phase: 'served', ms: 800 },
  { phase: 'returning', ms: 500 }
])
```

and directly after the `cookServeSchedule(true)` assert add:

```js
// MPP-29 AC 2: no one-shot sequence runs longer than PIP_ANIMATION_MAX_MS, either way.
const total = (steps) => steps.reduce((sum, { ms }) => sum + ms, 0)
assert.ok(total(cookServeSchedule(false)) <= PIP_ANIMATION_MAX_MS, 'cook scene over the 3 s limit')
assert.ok(total(cookServeSchedule(true)) <= PIP_ANIMATION_MAX_MS, 'reduced-motion serve over the 3 s limit')
```

- [x] **Step 2: Run it and watch it fail**

Run: `cd foodbytes-app\client; npm run check:cook`
Expected: fails. Either `PIP_ANIMATION_MAX_MS` is undefined (the `<=` comparison fails) or the deepEqual reports `1300 !== 700`.

- [x] **Step 3: Add the constant and retune**

In `constants/pet.js` replace:

```js
// Mockup v5 logMeal(): walk 1.3 s, cook 2.2 s, plate 1.6 s, walk back. Retune here.
export const COOK_PHASE_MS = {
  walking: 1300,
  cooking: 2200,
  served: 1600,
  returning: 1300
}
```

with:

```js
// MPP-29 AC 2: no one-shot room sequence (cook scene, stage change) runs longer than this.
export const PIP_ANIMATION_MAX_MS = 3000

// Walk 0.7 s, cook 1.0 s, plate 0.8 s, walk back 0.5 s = 3.0 s (MPP-29 AC 2; mockup v5 was 6.4 s).
// PipWalker's CSS walk reads `walking` too, so retune here only.
export const COOK_PHASE_MS = {
  walking: 700,
  cooking: 1000,
  served: 800,
  returning: 500
}
```

- [x] **Step 4: Run it green**

Run: `cd foodbytes-app\client; npm run check:cook`
Expected: `cook-and-serve checks passed`

### Task 3: Pin the 3 s limit on stage-change sequences ✓

- Skill: react-frontend

**Files:**
- Test: `foodbytes-app/client/src/utils/pipGrowth.check.mjs`

- [x] **Step 1: Add the assertion**

Add after the existing `./pipGrowth.js` import:

```js
import { PIP_GROWTH_PHASES } from '../constants/pipGrowth.js'
import { PIP_ANIMATION_MAX_MS } from '../constants/pet.js'
```

and directly above `console.log('pipGrowth checks passed')`:

```js
// MPP-29 AC 2: the animated part of a stage change (everything before the revealed hold, which is
// bubble reading time) stays within PIP_ANIMATION_MAX_MS, with and without reduced motion.
const animatedMs = (steps) => steps
  .filter(({ phase }) => phase !== PIP_GROWTH_PHASES.REVEALED)
  .reduce((sum, { ms }) => sum + ms, 0)
for (const change of [GROWTH_CHANGES.EVOLVE, GROWTH_CHANGES.DEVOLVE]) {
  for (const reduced of [false, true]) {
    assert.ok(animatedMs(growthSchedule(change, reduced)) <= PIP_ANIMATION_MAX_MS, `${change} over the 3 s limit`)
  }
}
```

- [x] **Step 2: Run it**

Run: `cd foodbytes-app\client; npm run check:growth`
Expected: `pipGrowth checks passed` (evolve 2.5 s, de-evolve 2.1 s today).

### Task 4: Drive the walk duration from `COOK_PHASE_MS.walking` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx:3` (import), `:210-220` (`PipWalker`)
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css:40-42`

- [x] **Step 1: Set the duration inline**

Line 3 import becomes:

```js
import { COOK_PHASES, COOK_PHASE_MS, PET_MOOD_LABELS, PIP_POSITIONS, PIP_POSITION_LABELS } from '../../../constants/pet'
```

In `PipWalker`, replace `style={{ transform }}` with `style={{ transform, transitionDuration: WALK_DURATION }}`, and add above the `function PipWalker` comment:

```js
// MPP-29: the walk lasts exactly the walking phase, so Pip arrives as the cooking line appears.
const WALK_DURATION = `${COOK_PHASE_MS.walking}ms`
```

- [x] **Step 2: Drop the CSS copy of the duration**

In `PetRoom.css` replace:

```css
/* MPP-18: the cook-and-serve walk (mockup v5 #pipg + .hop). The walker's inline
   transform changes between rug (none) and cooker; the transition is the walk. */
.pip-walker { transition: transform 1.25s ease-in-out; }
```

with:

```css
/* MPP-18: the cook-and-serve walk (mockup v5 #pipg + .hop). The walker's inline
   transform changes between rug (none) and cooker; the transition is the walk.
   MPP-29: its duration is set inline from COOK_PHASE_MS.walking (PipWalker). */
.pip-walker {
  transition-property: transform;
  transition-timing-function: ease-in-out;
}
```

The reduced-motion block's `transition: none !important` still overrides the inline duration.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 2 — Focus rings, interaction states and overlay entrance

Adds the tokens, then brings each pet-room stylesheet onto them and fills its missing hover/pressed states (AC 1) and entrance timing (AC 2). One stylesheet per task; each task leaves the build green on its own.

### Task 5: Add the Pip tokens to `global.css` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/styles/global.css` (`:root`, after the `--macro-over-target-*` block)

- [x] **Step 1: Add the tokens**

```css
  /* MPP-29: Pip's room — one focus ring and one overlay entrance for every room control.
     The ring is purple on light surfaces (≥3:1 on #fff and the room's #ece5fb; the old
     yellow was ~1.4:1 on the white sheets) and yellow on the cabinet's wood and the edit
     bar. Buttons drawn over furniture art add the white halo so the ring reads on any colour. */
  --pip-focus-ring: #7c5cd6;
  --pip-focus-ring-on-dark: #ffd34d;
  --pip-focus-halo: #fff;
  --pip-sheet-in: 0.28s;
  --pip-sheet-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 6: PetRoom.css: room buttons, edit bar, style chips, shared overlay keyframe ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css`

- [x] **Step 1: Ring over art: station and decor-spot buttons**

Replace both `.pip-station-btn:focus-visible` and `.pip-decor-spot-btn:focus-visible` bodies with:

```css
  outline: 3px solid var(--pip-focus-ring);
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--pip-focus-halo);
```

- [x] **Step 2: Edit-bar buttons: pressed, hover, on-dark ring**

Replace the `.pip-room-editbar button:focus-visible` rule with:

```css
.pip-room-editbar button:active { filter: brightness(0.92); }

@media (hover: hover) {
  .pip-room-editbar button:hover { filter: brightness(0.96); }
}

.pip-room-editbar button:focus-visible {
  outline: 3px solid var(--pip-focus-ring-on-dark);
  outline-offset: 2px;
}
```

- [x] **Step 3: Style chips: hover and ring**

Replace the `.pip-style-chip:focus-visible` rule with:

```css
@media (hover: hover) {
  .pip-style-chip:not([aria-pressed='true']):hover { border-color: #c9bdf0; }
}

.pip-style-chip:focus-visible {
  outline: 3px solid var(--pip-focus-ring);
  outline-offset: 2px;
}
```

- [x] **Step 4: Shared fade-in for the in-card overlays**

Append to the end of `PetRoom.css`:

```css
/* MPP-29 AC 2: the fridge and cabinet overlays fade in on the sheets' beat (--pip-sheet-in);
   each overlay's stylesheet applies it and turns it off under reduced motion. */
@keyframes pip-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

- [x] **Step 5: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: CheckInActions.css: ring token ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/CheckInActions.css:49-53`

- [x] **Step 1: Swap the ring colour**

In the `.pip-checkin-btn:focus-visible, .pip-checkin-date:focus-visible` rule, replace `outline: 3px solid #ffd34d;` with `outline: 3px solid var(--pip-focus-ring);`. This also covers 🛍 Shop / ✏️ Edit room / 👕 Wardrobe, which use `.pip-checkin-btn`.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 8: FridgeView.css: ring token and fade-in ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/FridgeView.css`

- [x] **Step 1: Ring token**

In `.pip-fridge-btn-text:focus-visible`, replace `outline: 3px solid #7b5cd6;` with `outline: 3px solid var(--pip-focus-ring);`.

- [x] **Step 2: Fade-in, with reduced motion**

Add `animation: pip-overlay-in var(--pip-sheet-in) var(--pip-sheet-ease);` as the last declaration of `.pip-fridge-view`, and append:

```css
@media (prefers-reduced-motion: reduce) {
  .pip-fridge-view { animation: none; }
}
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 9: TrophyCabinetView.css: on-dark ring and fade-in ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/TrophyCabinetView.css`

- [x] **Step 1: Ring token**

In `.pip-cabinet-btn-text:focus-visible`, replace `outline: 3px solid #ffd34d;` with `outline: 3px solid var(--pip-focus-ring-on-dark);`.

- [x] **Step 2: Fade-in, with reduced motion**

Add `animation: pip-overlay-in var(--pip-sheet-in) var(--pip-sheet-ease);` as the last declaration of `.pip-cabinet-view`, and append:

```css
@media (prefers-reduced-motion: reduce) {
  .pip-cabinet-view { animation: none; }
}
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 10: ShopView.css: entrance token, close and tab states, ring token ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/ShopView.css`

- [x] **Step 1: Entrance**

In `.pip-shop`, replace `animation: pip-shop-up 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);` with `animation: pip-shop-up var(--pip-sheet-in) var(--pip-sheet-ease);`.

- [x] **Step 2: Close-button and tab states**

Directly after the `.pip-shop-icon-btn { … }` rule add:

```css
.pip-shop-icon-btn:active { background: #ece5fb; }

@media (hover: hover) {
  .pip-shop-icon-btn:hover { background: #f6f3ff; }
}
```

Directly after the `.pip-shop-tab[aria-selected='true'] { … }` rule add:

```css
.pip-shop-tab:active { background: #f6f3ff; }

@media (hover: hover) {
  .pip-shop-tab:not([aria-selected='true']):hover { color: #4a3f80; }
}
```

- [x] **Step 3: Ring tokens**

In `.pip-shop-icon-btn:focus-visible, .pip-shop-btn:focus-visible` and in `.pip-shop-tab:focus-visible`, replace `#ffd34d` with `var(--pip-focus-ring)`. Keep the tab's `outline-offset: -3px`.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 11: WardrobeView.css: entrance token, close/text/lineup states, ring token ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeView.css`

- [x] **Step 1: Entrance**

In `.pip-wardrobe`, replace `animation: pip-wardrobe-up 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);` with `animation: pip-wardrobe-up var(--pip-sheet-in) var(--pip-sheet-ease);`.

- [x] **Step 2: Ring token and the missing states**

In the five-selector `…:focus-visible` rule, replace `outline: 3px solid #ffd34d;` with `outline: 3px solid var(--pip-focus-ring);`. Then replace the existing `:active` rule and `@media (hover: hover)` block after it with:

```css
.pip-wardrobe-item:active,
.pip-wardrobe-tab:active,
.pip-wardrobe-lineup summary:active { filter: brightness(0.94); }

.pip-wardrobe-icon-btn:active,
.pip-wardrobe-text-btn:not(:disabled):active { background: #ece5fb; }

@media (hover: hover) {
  .pip-wardrobe-item:hover,
  .pip-wardrobe-tab:hover,
  .pip-wardrobe-lineup summary:hover { filter: brightness(0.97); }

  .pip-wardrobe-icon-btn:hover,
  .pip-wardrobe-text-btn:not(:disabled):hover { background: #f6f3ff; }
}
```

`.pip-wardrobe-text-btn` has no border-radius today. Add `border-radius: 999px;` to its rule so the new background is a pill, not a rectangle.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 12: DecorPicker.css: entrance token, close/option/more states, ring token ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/DecorPicker.css`

- [x] **Step 1: Entrance**

In `.pip-decor-picker`, replace `animation: pip-decor-picker-up 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);` with `animation: pip-decor-picker-up var(--pip-sheet-in) var(--pip-sheet-ease);`.

- [x] **Step 2: States**

Replace `.pip-decor-option:active { filter: brightness(0.94); }` with:

```css
.pip-decor-option:active,
.pip-decor-picker-more button:active { filter: brightness(0.94); }

.pip-decor-picker-close:active { background: #ece5fb; }

@media (hover: hover) {
  .pip-decor-option:not([aria-pressed='true']):hover { border-color: #c9bdf0; }
  .pip-decor-picker-close:hover { background: #f6f3ff; }
  .pip-decor-picker-more button:hover { color: #4a3f80; }
}
```

- [x] **Step 3: Ring token**

In the three-selector `…:focus-visible` rule, replace `outline: 3px solid #ffd34d;` with `outline: 3px solid var(--pip-focus-ring);`.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 3 — Decision record and developer visual review

Records AC 5, then hands the visual judgement (AC 4, clothing art, the 3 s cook feel) to the developer. No production code changes. The executor writes the record and stops at the developer-owned task; it does not invent visual fixes.

### Task 13: Write `visual-review.md` with the AC 5 decision ✓

- Skill: none (contract documentation, no code)

**Files:**
- Create: `.claude/contract/MPP-29-pip-room-polish-pass/visual-review.md`

- [x] **Step 1: Write the record**

```markdown
# MPP-29 visual review

## AC 5 decision: mini cook animation next to `PetReaction`
**Not added.** MPP-34 deleted `PetReaction` on purpose: a confirmed breakfast/lunch/dinner tick now
shows a 600 ms "✓ Eaten" beat and hands off to `/pet`, where the full cook-and-serve scene plays.
A second, smaller cook animation would duplicate the scene the user is about to watch. Decided 2026-10-14.

## AC 3: dark mode
Skipped by developer decision (2026-10-14). FoodBytes has no dark theme.

## Phone check (320 / 375 / 414 px), AC 4
| Width | Room + bubble | Fridge | Cabinet | Shop | Wardrobe | Edit mode + picker | No h-scroll | Notes |
|---|---|---|---|---|---|---|---|---|
| 320 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 375 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| 414 | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |

## Motion (AC 2)
- Cook scene at 3.0 s (0.7 / 1.0 / 0.8 / 0.5): bubble lines readable? ☐
- Reduced motion on (OS setting): no walk, hop, steam, z's, sheet slide or overlay fade; served plate holds. ☐

## Focus rings and states (AC 1)
Keyboard Tab through the room, fridge, cabinet, shop, wardrobe, edit bar, decor picker: every focused control shows a ring. ☐
Purple ring on purple buttons (check-in primary, shop buy) still reads as separate. ☐

## Clothing art review
Wardrobe → "All forms" lineup, each slot: item sits on its anchor on all five forms, nothing clips or floats. ☐
Findings:

## Before/after screenshots
(attach or link)

## Sign-off
Developer: ☐ approved / ☐ follow-ups raised via /fb-issue
```

- [x] **Step 2: Confirm the file exists**

Run: `Get-ChildItem .claude\contract\MPP-29-pip-room-polish-pass\visual-review.md`
Expected: the file is listed.

### Task 14: Developer: phone check, motion feel, focus walk, clothing art

- Skill: none (developer-owned visual judgement, the ticket's pause condition)

**Files:**
- Modify: `.claude/contract/MPP-29-pip-room-polish-pass/visual-review.md` (the developer ticks it)

- [ ] **Step 1: Developer runs the app and fills `visual-review.md`**

Run (developer): `cd foodbytes-app\client; npm run dev`, with the backend per `CLAUDE.md` → "Running the backend locally with Google login".
Expected, on `http://localhost:5173/pet` in Chrome DevTools device mode at 320, 375 and 414 px:
- No horizontal page scroll, and nothing clipped in the room, bubble, fridge, cabinet, shop, wardrobe, edit bar or decor picker.
- Tabbing shows a purple ring on light surfaces, a yellow ring on the cabinet and edit bar, and a ring plus white halo on the fridge/cabinet/decor-spot hit areas.
- Tick a meal eaten on `/`: the handoff to `/pet` plays the cook scene in about 3 s.
- With DevTools → Rendering → "prefers-reduced-motion: reduce": nothing moves, and the served plate holds about 2.5 s.
- Wardrobe → "All forms": every equipped item fits all five forms.

The executor stops here and reports this task as pending developer review. It is not a blocker for `Status: COMPLETE`.

---

## Phase 4 — Final verification

No production changes beyond the version bump. Sanity checks only.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none (release bookkeeping per `CLAUDE.md` → Versioning & deploy verification)

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-29 is a Jira **Task**, so bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and into `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-29: Pip's room polish: visible focus rings and full hover/pressed states on every room control, cook scene retuned to 3 s with a pinned 3 s animation limit, one overlay entrance timing`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references ✓

- Skill: none (verification only)

**Files:** (none, read-only)

- [x] **Step 1: No hard-coded ring colour remains in the room stylesheets**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\room\*.css -Pattern "outline: 3px solid #"`
Expected: zero hits.

- [x] **Step 2: No stale entrance or walk durations**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\room\*.css -Pattern "0\.32s|1\.25s"`
Expected: zero hits.

- [x] **Step 3: No duplicated reduced-motion helper, no debug logging**

Run: `Select-String -Path foodbytes-app\client\src\hooks\*.js,foodbytes-app\client\src\utils\reducedMotion.js -Pattern "REDUCED_MOTION_QUERY =|console\.(log|debug)"`
Expected: one hit only, the export in `utils\reducedMotion.js`.

### Task M.3: Run every client check script ✓

- Skill: none (verification only)

**Files:** (none, read-only)

- [x] **Step 1: All `check:*` scripts**

Run: `cd foodbytes-app\client; npm run check:macros; npm run check:pet; npm run check:pip; npm run check:room; npm run check:cook; npm run check:fridge; npm run check:checkin; npm run check:awards; npm run check:growth; npm run check:wardrobe; npm run check:bubble`
Expected: each prints its `… checks passed` line, and none throws.

The backend is untouched, so `mvn test` is not part of this contract.

### Task M.4: Production build and go-live file ✓

- Skill: none (verification only)

**Files:** (none, read-only)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [x] **Step 2: Go-live SQL unchanged**

Run: `node foodbytes-app/database/build-golive.mjs --check`
Expected: `Go-live OK` (no migration in this ticket).

### Task M.5: Update the PR description ✓

- Skill: none (documentation)

**Files:**
- Create: `.claude/contract/MPP-29-pip-room-polish-pass/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary: focus-ring tokens and the missing hover/pressed states (AC 1); the 3 s limit pinned in `check:cook` / `check:growth`, the cook scene retuned to 3.0 s, the walk read from `COOK_PHASE_MS.walking`, one overlay entrance, one `prefersReducedMotion()` (AC 2); AC 3 skipped (no dark theme); AC 5 decision (no mini cook animation, with the reason).
- The new version from Task M.1.
- No migration; nothing to apply to Railway.
- Verification results from Tasks M.2–M.4, and the status of the developer review in `visual-review.md`.
- Convention note: Pip-room focus rings and sheet timing come from the `--pip-*` tokens in `global.css`; one-shot room animations must stay under `PIP_ANIMATION_MAX_MS`, which `check:cook` / `check:growth` enforce.
- Suggested commit subject: `MPP-29: Pip's room polish pass (focus rings, states, 3 s motion limit)`.

---

## Self-review

**Spec coverage:**
- Focus-ring tokens on every pet-room control (AC 1): Tasks 5–12.
- Missing hover/pressed states (AC 1): Tasks 6, 10, 11, 12 (fridge, cabinet, station, check-in and room-action buttons already had them; their rings change in Tasks 6–9).
- Cook scene ≤ 3 s, walk from the same constant (AC 2): Tasks 2, 4.
- `PIP_ANIMATION_MAX_MS` pinned in the checks (AC 2): Tasks 2, 3.
- One overlay entrance, fridge/cabinet fade with reduced motion (AC 2): Tasks 6, 8–12.
- One `prefersReducedMotion()` (AC 2): Task 1.
- AC 5 decision recorded: Task 13 (and M.5).
- Developer phone check, before/after, clothing-art review (AC 4 + scope): Tasks 13, 14.
- Version bump + CHANGELOG: Task M.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later` or "similar to Task N". Every step shows the exact code or a `Run:`/`Expected:` pair. `<new version>` is computed at apply time by design (M.1).

**Type / name consistency:** `PIP_ANIMATION_MAX_MS` and `COOK_PHASE_MS` (in `constants/pet.js`), `prefersReducedMotion` / `REDUCED_MOTION_QUERY` (in `utils/reducedMotion.js`), `WALK_DURATION` (in `PetRoom.jsx`), the tokens `--pip-focus-ring`, `--pip-focus-ring-on-dark`, `--pip-focus-halo`, `--pip-sheet-in`, `--pip-sheet-ease`, and the keyframe `pip-overlay-in` are spelled the same in every task and in `plan.md` → Data shapes.

**Phase boundary cleanliness:**
- Phase 1 ends with `check:cook`, `check:growth` and the build green, and walk and phase timers on one constant.
- Phase 2: each task ends with the build green. Tokens exist before any stylesheet reads them (Task 5 first), and `pip-overlay-in` exists (Task 6) before the fridge and cabinet use it (Tasks 8, 9).
- Phase 3 changes documentation only.
- Phase 4 changes only versions and the changelog, and every check is green.
