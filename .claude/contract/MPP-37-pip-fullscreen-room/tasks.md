# Tasks: Pip's tab full screen — room fills the screen, buttons above the tab bar, no top bar

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-14

**Goal:** On `/pet` hide the app's top bar, add a slim Pip header (name + rename, form, sprinkles, mood), make the room fill the height down to the fixed tab bar with no page scroll, put Shop / Edit room / Wardrobe in one row above the tab bar, remove Today's meals, and anchor the room's tap targets to the room picture.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/client/src/components/pet/PipHeader.jsx` — slim Pip header (name + ✎, form, sprinkles, mood chip)

**Modified:**
- `foodbytes-app/client/src/styles/global.css` — `--footer-clearance` token; `.main-content` uses it; new `.main-content--pip`
- `foodbytes-app/client/src/App.jsx` — hide `Header` and add `main-content--pip` on `PET_ROUTE`
- `foodbytes-app/client/src/components/pet/PetView.jsx` — render `PipHeader` + `PetRoom`; drop `.pet-meta` row and `PetMealsCard`; stop passing `sprinkles` to `PetRoom`
- `foodbytes-app/client/src/components/pet/PetView.css` — full-height `.pet-view`; `.pip-header*` rules; remove `.pet-meta` and `.pet-meals*`
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` — `.pip-room-stage` wrapper; remove `SprinklesCounter` + `sprinkles` prop
- `foodbytes-app/client/src/components/pet/room/PetRoom.css` — full-height room, stage + positioned aspect-box scene, one-row action strip; remove `.pip-room-sprinkles`
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — PATCH bump

**Deleted:**
- `foodbytes-app/client/src/components/pet/PetMealsCard.jsx`

---

## Phase 1 — Shell: Pip mode without the top bar

Adds the footer-clearance token and the route-aware shell in `App.jsx`. Afterwards `/pet` has no top bar and a full-height, non-scrolling `main`. The Pip page itself is untouched (it will look cramped until Phase 2), and the build stays green.

### Task 1: Footer-clearance token and the Pip `main` modifier in global.css ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/styles/global.css:80-81` (token), `:127-134` (`.main-content`)

- [x] **Step 1: Add the token to `:root`** directly after `--shadow-lg`:

```css
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Space kept clear for the fixed footer tab bar (Footer.css). Pip mode adds the
     bottom safe-area inset, which the footer pads itself by. */
  --footer-clearance: 80px;
```

- [x] **Step 2: Use it on `.main-content` and add the Pip modifier** — replace `padding-bottom: 80px; /* Space for fixed footer */` with `padding-bottom: var(--footer-clearance);`, then append after the `.main-content` rule:

```css
/* MPP-37: Pip mode — no top bar, the page is exactly one screen tall and never scrolls.
   The Pip page fills it; the fixed footer sits in the bottom clearance. */
.main-content--pip {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  max-width: none;
  padding: env(safe-area-inset-top, 0px) 0 calc(var(--footer-clearance) + env(safe-area-inset-bottom, 0px));
  overflow: hidden;
}
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 2: Hide the Header on the Pip route in App.jsx ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/App.jsx:2` (import), `:14-16` (component start), `:45-46` (render)

- [x] **Step 1: Import `useLocation` and `PET_ROUTE`**

```jsx
import { Routes, Route, useLocation } from 'react-router-dom'
// …existing imports…
import { PET_ROUTE } from './constants/pet'
```

- [x] **Step 2: Derive Pip mode at the top of `App` (before the early returns, rules of hooks)**

```jsx
function App() {
  const { isAuthenticated, isGuest, loading } = useAuth()
  // MPP-37: the Pip tab is full screen — no top bar (date picker + account menu).
  const pipMode = useLocation().pathname === PET_ROUTE
```

- [x] **Step 3: Render the shell conditionally** — replace `<Header />` and `<main className="main-content">` with:

```jsx
      {!pipMode && <Header />}
      <main className={pipMode ? 'main-content main-content--pip' : 'main-content'}>
```

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 2 — Pip page: slim header, no Today's meals

Introduces `PipHeader`, rewires `PetView` to header + room, and deletes `PetMealsCard`. `PetRoom` still receives every prop it did, except `sprinkles`, which it ignores until Phase 3 removes it. So the build is green and nothing is half-renamed.

### Task 3: Create PipHeader ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/PipHeader.jsx`

- [x] **Step 1: Write the component**

```jsx
import { SPRINKLES_ICON } from '../../constants/petRoom'
import PetNameEditor from './PetNameEditor'

/**
 * MPP-37: Pip mode's slim header, above the room — name with the rename pencil and his
 * current herb form on the left, sprinkles and the mood chip on the right. Replaces the
 * name row under the room and the room's top-left sprinkles counter.
 */
function PipHeader({ name, onRename, formName, sprinkles, mood, moodLabel }) {
  return (
    <header className="pip-header">
      <div className="pip-header-name">
        <PetNameEditor name={name} onRename={onRename} />
        <span className="pip-header-form">{formName}</span>
      </div>
      <div className="pip-header-right">
        {typeof sprinkles === 'number' && (
          <span className="pip-header-sprinkles" aria-label={`${sprinkles} sprinkles`}>
            <span aria-hidden="true">{SPRINKLES_ICON} {sprinkles}</span>
          </span>
        )}
        <span className={`pet-chip pet-chip--${mood}`}>{moodLabel}</span>
      </div>
    </header>
  )
}

export default PipHeader
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 4: Render PipHeader + PetRoom in PetView; drop Today's meals ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx:5` (imports), `:115-137` (render)

- [x] **Step 1: Swap the imports** — remove `import PetMealsCard from './PetMealsCard'` and `import PetNameEditor from './PetNameEditor'`; add:

```jsx
import PipHeader from './PipHeader'
import { PIP_FORM_NAMES } from '../../constants/pipGrowth'
```

- [x] **Step 2: Replace the returned markup** — `PipHeader` first; `PetRoom` without `sprinkles`; no `.pet-meta`, no `PetMealsCard`:

```jsx
  return (
    <div className="pet-view">
      <PipHeader
        name={pet.name}
        onRename={renamePet}
        formName={PIP_FORM_NAMES[growth.displayForm]}
        sprinkles={sprinkles}
        mood={mood}
        moodLabel={petChipLabel(moodInfo)}
      />
      <PetRoom
        name={pet.name}
        mood={mood}
        bubble={said.text}
        bubbleActions={bubbleActions}
        position={position}
        serving={serving}
        fridge={fridge}
        cabinet={awards.cabinet}
        herb={herb}
        levelBar={levelBar}
        wardrobe={wardrobe}
        levels={pet.room?.stations}
        shop={shop}
        decor={decor}
      />
    </div>
  )
```

Update the JSDoc's first line from "…a speech bubble, the name, a mood chip and today's meals." to "…a speech bubble, and (MPP-37) a slim header with the name, form, sprinkles and mood chip — full screen, no Today's meals."

- [x] **Step 3: Delete `PetMealsCard.jsx`**

Run: `Remove-Item foodbytes-app\client\src\components\pet\PetMealsCard.jsx`
Expected: no output; `Get-ChildItem foodbytes-app\client\src\components\pet\PetMealsCard.jsx` then errors "Cannot find path".

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors (no unresolved `PetMealsCard` import).

### Task 5: Full-height PetView CSS, header styles, and removal of meta/meals rules ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.css:3-7` (`.pet-view`), `:51-73` (`.pet-meta` / `.pet-name`), `:75-78`, `:136-219` (`.pet-meals*` and shared focus rule)

- [x] **Step 1: Make `.pet-view` a full-height column**

```css
/* MPP-37: Pip mode — header on top, the room fills the rest (main is one screen tall). */
.pet-view {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}
```

- [x] **Step 2: Replace the `.pet-meta` block with the slim header**, and shrink `.pet-name` to header size (keep `.pet-name-block`, `.pet-name-edit-btn`, `.pet-name-input`, `.pet-name-error` and `.pet-chip*` as they are):

```css
/* ---- MPP-37: Pip's slim header ---- */
.pip-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: 2px 8px 2px 14px;
  background: #fff;
  border-bottom: 1px solid var(--border-color);
}

.pip-header-name {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.pip-header-form {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.pip-header-right {
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pip-header-sprinkles {
  padding: 3px 9px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
```

In `.pet-name` change `font-size: 1.35rem;` to `font-size: 1.1rem;`.

- [x] **Step 3: Remove the Today's meals rules** — delete the whole `/* ---- Today's meals ---- */` section (`.pet-meals-card` through `.pet-meals-link:hover`), drop `.pet-meals-link,` from the shared `touch-action` selector list (`.pet-name-edit-btn, .pet-meals-link, .pet-view-state-btn`), and drop `.pet-meals-link:focus-visible,` from the shared focus rule, leaving:

```css
.pet-name-edit-btn,
.pet-view-state-btn {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

```css
.pet-name-edit-btn:focus-visible,
.pet-view-state-btn:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
```

- [x] **Step 4: Confirm no meta/meals selector remains**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\PetView.css -Pattern "pet-meta|pet-meals"`
Expected: zero hits.

- [x] **Step 5: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 3 — Room: fill the space, anchor the tap targets, one-row buttons

Restructures `PetRoom` into a stage + positioned aspect-box scene, removes the in-room sprinkles counter, and puts the action strip on one row. After this phase the layout matches the mockup and the build is green.

### Task 6: Stage wrapper and sprinkles removal in PetRoom.jsx ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx:5` (import), `:43` (signature), `:85-122` (scene markup), `:247-255` (`SprinklesCounter`), JSDoc

- [x] **Step 1: Drop `sprinkles` from the signature** and `SPRINKLES_ICON` from the `constants/petRoom` import:

```jsx
import { DEFAULT_ROOM_LEVELS, ROOM_HINT, ROOM_STATIONS, ROOM_VIEWBOX } from '../../../constants/petRoom'
// …
function PetRoom({ name, mood, bubble, bubbleActions = null, position = PIP_POSITIONS.RUG, levels = DEFAULT_ROOM_LEVELS, serving = null, fridge = null, cabinet = null, herb, levelBar = null, wardrobe = null, shop = null, decor = null }) {
```

- [x] **Step 2: Wrap the scene in the stage** — the existing `<div className={editing ? 'pip-room-scene is-editing' : 'pip-room-scene'} {...behind}> … </div>` is unchanged inside except that the line `{typeof sprinkles === 'number' && <SprinklesCounter count={sprinkles} />}` is removed:

```jsx
    <div className="pip-room">
      {/* MPP-37: the stage fills the height; the scene inside keeps the SVG's 360×330 shape, so
          the % hit boxes, bubble and hint are placed against the picture, not the whole room. */}
      <div className="pip-room-stage">
        <div className={editing ? 'pip-room-scene is-editing' : 'pip-room-scene'} {...behind}>
          {/* …svg, SpeechBubble, StationButtons, DecorSpotButtons, hint — unchanged… */}
        </div>
      </div>
      {/* …EditRoomBar, PipLevelBar, .pip-room-actions, RoomStyleChips, overlays — unchanged… */}
```

- [x] **Step 3: Delete the `SprinklesCounter` function** (and its `// MPP-25` comment). In the JSDoc, replace the MPP-25 line with `* MPP-25 / MPP-37: the sprinkles counter now lives in Pip's header (PipHeader), not in the room.` and add `* MPP-37: full screen — .pip-room-stage fills the height and .pip-room-scene is the positioned 360×330 box.`

- [x] **Step 4: Confirm the counter is gone and measure the file**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\room\PetRoom.jsx -Pattern "SprinklesCounter|SPRINKLES_ICON|sprinkles"`
Expected: zero hits apart from the JSDoc line that mentions PipHeader.

Run: `(Get-Content foodbytes-app\client\src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines`
Expected: under 300.

- [x] **Step 5: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: Full-height room, positioned scene and one-row action strip in PetRoom.css ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css:1-16` (`.pip-room`, `.pip-room-svg`), `:112-128` (`.pip-room-sprinkles`), `:129-143` (`.pip-room-actions`, `.pip-room-action`)

- [x] **Step 1: Replace the card rule with a full-height column, and add the stage and the scene**

```css
/* MPP-16 / MPP-37: Pip's room — angled-corner SVG from pip-room-mockup-v5.html. Full screen:
   the stage takes every pixel the header and the rows under it leave; the scene inside is the
   SVG's own 360×330 box (ROOM_VIEWBOX_SIZE), centred, so % hit boxes match the art. */
.pip-room {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #ece5fb;
}

.pip-room-stage {
  flex: 1;
  min-height: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  container-type: size;
}

.pip-room-scene {
  position: relative;
  width: 100%; /* fallback without container query units */
  width: min(100cqw, calc(100cqh * 360 / 330));
  aspect-ratio: 360 / 330;
}

.pip-room-svg {
  display: block;
  width: 100%;
  height: auto;
}
```

- [x] **Step 2: Delete the `.pip-room-sprinkles` rule** and its `/* MPP-25 … */` comment.

- [x] **Step 3: One-row action strip above the tab bar** — replace `.pip-room-actions` and `.pip-room-action`:

```css
/* MPP-26 / MPP-27 / MPP-32 / MPP-37: 🛍 Shop, ✏️ Edit room and 👕 Wardrobe — one row of equal
   columns directly above the tab bar, however many have loaded; never wraps at 360px. */
.pip-room-actions {
  flex: none;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 6px;
  padding: 8px 10px;
  background: #fff;
  border-top: 1px solid #ddd6ee;
}

.pip-room-action {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 0;
  padding-inline: 6px;
  white-space: nowrap;
}
```

- [x] **Step 4: Keep the rows under the stage at their natural height** — add `flex: none;` to `.pip-room-editbar` and `.pip-room-styles`. Leave `PipLevelBar.css` alone: MPP-38 owns it, and a block-level child of a flex column without `flex-grow` keeps its natural height anyway. Then confirm no sprinkles rule remains:

Run: `Select-String -Path foodbytes-app\client\src\components\pet\room\PetRoom.css -Pattern "pip-room-sprinkles|border-radius: 20px"`
Expected: zero hits.

- [x] **Step 5: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 4 — Manual phone check

Read-only verification of the visual result in a real browser at phone size, including the MPP-36 tap check. No production code changes. If a check fails, fix it in the task that owns the file and re-run that task's build step.

### Task 8: Check Pip mode on a phone viewport (incl. MPP-36 fridge / cabinet taps) ⏸ — DEFERRED to the developer (manual phone check; steps below left unticked)

- Skill: react-frontend

**Files:**
- (none — manual verification)

- [ ] **Step 1: Start the stack** — backend per `CLAUDE.md` → "Running the backend locally with Google login", then:

Run: `cd foodbytes-app\client; npm run dev`
Expected: Vite serves `http://localhost:5173`.

- [ ] **Step 2: Check `/pet` at 360×740 and 390×844 (DevTools device mode, portrait), signed in**

Expected, each item observed:
1. No purple top bar (no date picker, no avatar). Pip's slim header shows name + ✎, form name, ✨ sprinkles, mood chip.
2. The page does not scroll; the room fills the space between the header and the tab bar; nothing sits under the tab bar.
3. Shop, Edit room and Wardrobe are in **one** row directly above the tab bar, none clipped, each 44px tall.
4. "Tap the fridge 🧊 or cabinet 🏆" sits inside the room picture (bottom-left), not among the buttons.
5. No Today's meals card anywhere.

- [ ] **Step 3: MPP-36 tap check**

Expected: tapping the fridge art opens the fridge view; ✕/Back returns to the room. Tapping the cabinet art opens the trophy cabinet. With keyboard focus (Tab), the yellow focus ring outlines the fridge and the cabinet themselves, not empty space below them. Record the result in `pr-description.md` (Task 13): if both open, note "MPP-36 appears fixed by the scene positioning"; if not, note that MPP-36 still reproduces.

- [ ] **Step 4: Edit mode, rename and other tabs**

Expected: ✏️ Edit room shows the decor spots on the furniture and the edit bar under the room. The room shrinks to fit, with no page scroll, and Done exits. ✎ rename still saves. A 12-character name truncates the form name rather than pushing the chips off-screen. Recipes, Meal Plan and Shopping still show the top bar exactly as before.

---

## Phase 5 — Final verification

The closing phase. No production changes beyond the version bump — only sanity-checks that the cumulative work is clean.

### Task 9: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-37 is a **Bug** → bump **PATCH**. If MPP-38 has already been applied, start from its version. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-37: Pip tab is full screen: no top bar, slim Pip header, room fills the screen with Shop / Edit room / Wardrobe in one row above the tab bar, Today's meals removed, room tap targets anchored to the picture`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 10: Grep for stale references ✓

- Skill: none — read-only audit

**Files:**
- (none — grep only)

- [x] **Step 1: No PetMealsCard / Today's meals / in-room sprinkles references remain**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.css | Select-String -Pattern "PetMealsCard|pet-meals|pet-meta|SprinklesCounter|pip-room-sprinkles"`
Expected: zero hits.

- [x] **Step 2: No new console logging**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)"`
Expected: no more hits than the 6-hit baseline (`services/api.js`, `hooks/useWakeLock.js`, `mealplan/MealPlanEntry.jsx`).

### Task 11: Run the full backend test suite ✓

- Skill: none — regression gate (no backend change)

**Files:**
- (none)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 12: Production build ✓

- Skill: react-frontend

**Files:**
- (none)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 13: Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-37-pip-fullscreen-room/pr-description.md`

- [x] **Step 1: Write `pr-description.md` for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary: Pip mode (no top bar on `/pet`), `PipHeader`, full-height room with the positioned 360×330 scene, one-row action strip, Today's meals removed; the new version from Task 9.
- Migrations: none.
- Verification: build results, Task 8's phone checks, and the MPP-36 tap-check result.
- Convention note: room overlays (`StationButton`, hint, bubble, decor spots) are positioned against `.pip-room-scene`, which must stay `position: relative` and exactly the SVG's aspect ratio.
- Ordering note: MPP-38 (level bar) is applied after this and edits `PetRoom.jsx` / `PetRoom.css` again.
- Suggested commit subject: `MPP-37: Pip tab full screen — no top bar, slim header, one-row room buttons`

---

## Self-review

**Spec coverage:**
- Route-aware hiding of `Header` + full-height `main` — Tasks 1, 2.
- Slim `PipHeader` replacing `.pet-meta` — Tasks 3, 4, 5.
- Sprinkles moved into the header — Tasks 3, 4, 6, 7.
- `PetMealsCard` removed (file + CSS) — Tasks 4, 5, 10.
- Full-height stage sizing the 360×330 room — Tasks 6, 7.
- `.pip-room-scene` as the positioning container (hit boxes, hint, bubble) — Task 7; verified in Task 8 Step 3.
- One-row Shop / Edit room / Wardrobe strip at 360px — Task 7; verified in Task 8 Step 2.
- `--footer-clearance` token — Task 1.
- Manual phone checks incl. MPP-36 taps — Task 8.
- PATCH bump + CHANGELOG — Task 9.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or a `Run:` / `Expected:` pair; Task 8 lists the observable outcomes.

**Type / name consistency:** `PipHeader` props (`name`, `onRename`, `formName`, `sprinkles`, `mood`, `moodLabel`) match `plan.md` Data shapes and Task 4's call site. CSS names `.pip-header`, `.pip-header-name`, `.pip-header-form`, `.pip-header-right`, `.pip-header-sprinkles`, `.pip-room-stage`, `.pip-room-scene`, `.main-content--pip` and `--footer-clearance` are used identically across Tasks 1–7 and 10. `PetRoom`'s removed `sprinkles` prop is dropped from the call site in Task 4 before the signature change in Task 6 (an extra prop is harmless in between). `PET_ROUTE`, `PIP_FORM_NAMES`, `SPRINKLES_ICON` and `petChipLabel` are existing exports.

**Phase boundary cleanliness:**
- Phase 1 — shell only; build green; `/pet` renders the old page under no header (cramped but working).
- Phase 2 — `PetMealsCard` import and file are removed together; `PetRoom` ignores the dropped prop; build green.
- Phase 3 — scene, stage and strip land together with the sprinkles removal; build green, layout matches the mockup.
- Phase 4 — read-only checks.
- Phase 5 — bump + audits; no production change.
