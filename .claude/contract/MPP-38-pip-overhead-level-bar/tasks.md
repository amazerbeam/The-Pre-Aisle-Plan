# Tasks: MPP-38 — small level bar over Pip's head that follows him

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Apply order: this contract applies AFTER MPP-37** (full-screen Pip tab). Both edit `PetRoom.jsx`, `PetRoom.css` and `PetView.jsx`. Before every edit to `client/src/components/pet/room/PetRoom.jsx` or `client/src/components/pet/PetView.jsx`, **re-read the file and locate the code by its content** (the JSX/identifiers quoted below), never by line number. Line numbers in this contract are from before MPP-37 and will have moved.

Status: COMPLETE
Started: 2026-10-14

**Goal:** Replace the labelled level strip under Pip's room with a small text-free green bar drawn just above Pip's head inside the room SVG. It follows him everywhere, clears every hat and head growth, flashes before an evolve, is hidden at Basilisk and stays spoken to screen readers.

**Spec:** `plan.md` in this folder.

---

## File map

**Created:**
- `foodbytes-app/client/src/components/pet/herb/headBar.js`: pure geometry (`headBarTop`, `headBarY`) and `spokenLevelLabel`.
- `foodbytes-app/client/src/components/pet/room/PipHeadBar.jsx`: the aria-hidden SVG bar drawn inside `RoomPip`.
- `foodbytes-app/client/src/components/pet/room/PipHeadBarStatus.jsx`: the visually hidden HTML progressbar (AC 6).
- `foodbytes-app/client/src/components/pet/room/PipHeadBar.css`: bar colours, fill transition, the full flash, the visually hidden status, reduced motion.

**Modified:**
- `foodbytes-app/client/src/constants/pipGrowth.js`: adds `HEAD_BAR_WIDTH`, `HEAD_BAR_HEIGHT`, `HEAD_BAR_GAP`, `HEAD_BAR_FLASH_MS`.
- `foodbytes-app/client/src/components/pet/herb/herbForms.js`: pins `crownTop` and `growthRise` on each of the 5 `HERB_FORMS` entries.
- `foodbytes-app/client/src/components/pet/herb/wardrobe.check.mjs`: appends the head-bar geometry assertions.
- `foodbytes-app/client/src/components/pet/room/RoomPip.jsx`: takes `levelBar` and draws `<PipHeadBar>`.
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx`: drops `<PipLevelBar>`, renders `<PipHeadBarStatus>`, and passes `levelBar` to both `RoomPip` sites (`PipWalker` child and the bed `Station`).
- `foodbytes-app/client/src/components/pet/PetView.jsx`: `levelBar` is `null` at Basilisk.
- `CHANGELOG.md`, `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`: version bump (Task M.1).

**Deleted:**
- `foodbytes-app/client/src/components/pet/room/PipLevelBar.jsx`
- `foodbytes-app/client/src/components/pet/room/PipLevelBar.css`

---

## Phase 1 — Head-bar geometry

Pure data and functions only: new constants, two pinned numbers per herb form, the `headBar.js` helpers and their node assertions. Nothing renders them yet, so the app is unchanged and the build stays green at the end of this phase.

### Task 1: Add the head-bar constants to `constants/pipGrowth.js` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/pipGrowth.js` (append after `PIP_FULLY_GROWN_LABEL`)

- [x] **Step 1: Append the constants**

```js
// MPP-38: the small level bar over Pip's head in the room.
export const HEAD_BAR_WIDTH = 30 // room-viewBox units — same on-screen size at every form and pose
export const HEAD_BAR_HEIGHT = 5 // room-viewBox units
export const HEAD_BAR_GAP = 22 // herb units between the top of Pip's head and the bar's bottom edge; clears pip-bounce (−16px, 1.05 stretch)
export const HEAD_BAR_FLASH_MS = 450 // the full bar fills, then flashes yellow, inside the 900 ms FILLING phase
```

- [x] **Step 2: Verify the module still loads in node**

Run: `cd foodbytes-app\client; node --input-type=module -e "import * as g from './src/constants/pipGrowth.js'; console.log(g.HEAD_BAR_WIDTH, g.HEAD_BAR_HEIGHT, g.HEAD_BAR_GAP, g.HEAD_BAR_FLASH_MS)"`
Expected: `30 5 22 450`

### Task 2: Measure and pin `crownTop` / `growthRise` on each herb form — implemented with PROVISIONAL values; Step 1 measurement DEFERRED to developer

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/herb/herbForms.js` (the five `HERB_FORMS` entries and the doc comment above them)

- [ ] **Step 1: Measure the five forms in the approved mockup** — DEFERRED to developer (provisional values from control-point bounds)

The mockup's `back()` / `growth()` are the same shapes `herbParts.jsx` ported (MPP-31 "ported verbatim"). First read `C:\Users\jossd\Downloads\mpp-37-38-pip-fullscreen-mockup.html` around `function back(f, droop)` and `function growth(f, droop, base)` to confirm that both take a **0-based form index** as `f`. Then open the file in Chrome, and in DevTools → Console run:

```js
const NS = 'http://www.w3.org/2000/svg'
console.table(FORMS.map((f, i) => {
  const svg = document.createElementNS(NS, 'svg'); document.body.appendChild(svg)
  svg.innerHTML = `<g id="a">${back(i, false)}<path d="${f.body}"/></g><g id="b">${growth(i, false, f.growTop)}</g>`
  const a = svg.querySelector('#a').getBBox(), b = svg.querySelector('#b').getBBox(); svg.remove()
  return { name: f.name, crownTop: Math.floor(a.y) - 3, growthRise: b.height ? Math.ceil(f.growTop - b.y) + 3 : 0 }
}))
```

The `−3` / `+3` add half the 5–6 unit ink stroke that `getBBox` leaves out. Copy the five rows.

- [x] **Step 2: Pin the numbers on each `HERB_FORMS` entry**

Add `crownTop: <n>, growthRise: <n>` to each of the five objects (after `growTop`) with the measured values. Extend the doc comment above `HERB_FORMS`:

```js
 * crownTop: highest y of the body + back leaves (no hat moves it); growthRise: how far HerbGrowth
 * rises above its base (0 = no growth). Both measured once from the upright art (MPP-38, mockup
 * getBBox + half the ink stroke) — re-measure if HerbBack / HerbGrowth / the body paths change.
```

- [x] **Step 3: Verify every form has finite numbers**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {HERB_FORMS} from './src/components/pet/herb/herbForms.js'; console.log(HERB_FORMS.map(f => [f.name, f.crownTop, f.growthRise]))"`
Expected: five rows with finite numbers. `growthRise` is `0` for Basil seed and Bushling and positive for Seedling, Sprig and Basilisk. Each `crownTop` is ≤ that form's body top (Basil seed ≤ 112, Seedling ≤ 108, Sprig ≤ 74, Bushling ≤ 88, Basilisk ≤ 88).

### Task 3: Create `herb/headBar.js` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/herb/headBar.js`

- [x] **Step 1: Write the module**

Use explicit `.js` import extensions so node can load it (as `wardrobeLayers.js` does).

```js
import { HEAD_BAR_GAP } from '../../../constants/pipGrowth.js'
import { WARDROBE_SLOT } from '../../../constants/pipWardrobe.js'
import { HERB_FOOT_Y, herbForm } from './herbForms.js'
import { hatArt } from './wardrobeArt.js'
import { dressLayers } from './wardrobeLayers.js'

/**
 * MPP-38: geometry for the level bar over Pip's head. Pure — pinned by wardrobe.check.mjs.
 * Unscaled 200-unit herb space unless stated; unknown forms fall back to the seed (herbForm).
 */

/** The highest point of Pip's head for `form` wearing `outfit`: body/back leaves, head growth (lifted through a hat) or the hat crown. */
export function headBarTop(form, outfit) {
  const f = herbForm(form)
  const tops = [f.crownTop]
  if (f.growthRise > 0) tops.push(dressLayers(outfit, form).growTop - f.growthRise)
  const hatId = outfit?.[WARDROBE_SLOT.HAT]
  const hat = hatId ? hatArt(hatId, f) : null
  if (hat) tops.push(hat.top)
  return Math.min(...tops)
}

/** The bar's bottom edge in the figure's scaled space (the space RoomPip places Pip in). */
export function headBarY(form, outfit) {
  const k = herbForm(form).scale
  return HERB_FOOT_Y + (headBarTop(form, outfit) - HERB_FOOT_Y) * k - HEAD_BAR_GAP
}

/** AC 6: "Sprig · 14 / 24 → Bushling" → "Sprig, 14 of 24 to Bushling" — read aloud without symbols. */
export function spokenLevelLabel(label) {
  return label.replace(' · ', ', ').replace(' / ', ' of ').replace(' → ', ' to ')
}
```

- [x] **Step 2: Smoke-check it in node**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {headBarY, spokenLevelLabel} from './src/components/pet/herb/headBar.js'; console.log([1,2,3,4].map(f => [headBarY(f, null), headBarY(f, {HAT: 'top-hat'})]), spokenLevelLabel('Sprig · 14 / 24 → Bushling'))"`
Expected: four pairs of finite numbers where each hatted value is ≤ the bare value, then `Sprig, 14 of 24 to Bushling`. If `WARDROBE_SLOT.HAT` is not the string `'HAT'`, use its real value in the command.

### Task 4: Pin the head-bar geometry in `wardrobe.check.mjs` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/herb/wardrobe.check.mjs` (add the import beside the other herb imports; append the block before the final success log)

- [x] **Step 1: Import and append the assertions**

Add `import { headBarTop, headBarY, spokenLevelLabel } from './headBar.js'` and `import { HEAD_BAR_GAP } from '../../../constants/pipGrowth.js'`, and add `HERB_FOOT_Y` to the existing `import { HERB_FORMS, herbForm } from './herbForms.js'`. Then append (reusing the file's existing `idsIn`, `WARDROBE_SLOT`, `herbForm`, `hatArt`, `dressLayers`, `HERB_FOOT_Y`):

```js
// MPP-38 AC 5: the head bar clears every hat and the head growth on forms 1–4 (Basilisk has no bar, AC 8).
for (const form of [1, 2, 3, 4]) {
  const f = herbForm(form)
  const k = f.scale
  const toScaled = (y) => HERB_FOOT_Y + (y - HERB_FOOT_Y) * k
  for (const hatId of [null, ...idsIn(WARDROBE_SLOT.HAT)]) {
    const outfit = hatId ? { [WARDROBE_SLOT.HAT]: hatId } : null
    const y = headBarY(form, outfit)
    assert.ok(Number.isFinite(y), `form ${form} ${hatId}: bar y is not finite`)
    assert.ok(y <= toScaled(f.crownTop) - HEAD_BAR_GAP + 1e-9, `form ${form} ${hatId}: bar overlaps the crown`)
    if (hatId) assert.ok(y <= toScaled(hatArt(hatId, f).top) - HEAD_BAR_GAP + 1e-9, `form ${form} ${hatId}: bar overlaps the hat`)
    if (f.growthRise > 0) {
      const growthTop = dressLayers(outfit, form).growTop - f.growthRise
      assert.ok(y <= toScaled(growthTop) - HEAD_BAR_GAP + 1e-9, `form ${form} ${hatId}: bar overlaps the head growth`)
    }
    assert.equal(headBarTop(form, outfit) <= f.crownTop, true)
  }
}
assert.equal(spokenLevelLabel('Basil seed · 6 / 15 → Seedling'), 'Basil seed, 6 of 15 to Seedling')
```

- [x] **Step 2: Run the check**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: exit code 0 and the script's existing success line, with no `AssertionError`.

---

## Phase 2 — Over-head bar in the room

This phase swaps the strip for the SVG bar plus the hidden progressbar, and hides it at Basilisk. Each task leaves the build green: the new components exist before they are rendered, `PipLevelBar` stops being imported before its files are deleted, and the phase ends with `npm run build` passing.

### Task 5: Create `PipHeadBar.jsx` + `PipHeadBar.css` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/PipHeadBar.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/PipHeadBar.css`

- [x] **Step 1: Write the component**

```jsx
import { HEAD_BAR_FLASH_MS, HEAD_BAR_HEIGHT, HEAD_BAR_WIDTH, PIP_GROWTH_PHASES } from '../../../constants/pipGrowth'
import { HERB_FOOT_X } from '../herb/herbForms'
import { headBarY } from '../herb/headBar'
import './PipHeadBar.css'

// The new form's bar jumps to its starting edge without animating backwards (MPP-31 AC 5).
const INSTANT_PHASES = [PIP_GROWTH_PHASES.EVOLVING, PIP_GROWTH_PHASES.SHRINKING]

/**
 * MPP-38: the small level bar over Pip's head, drawn inside RoomPip so it follows every pose
 * and walk (AC 3). Sized in room units ÷ poseScale so it reads the same at the rug and in bed.
 * Decorative only — PipHeadBarStatus carries the progress for screen readers (AC 6).
 */
function PipHeadBar({ form, outfit, pct, phase, poseScale }) {
  const w = HEAD_BAR_WIDTH / poseScale
  const h = HEAD_BAR_HEIGHT / poseScale
  const className = [
    'pip-head-bar',
    INSTANT_PHASES.includes(phase) && 'is-instant',
    phase === PIP_GROWTH_PHASES.FILLING && 'is-full'
  ].filter(Boolean).join(' ')

  return (
    <g
      className={className}
      aria-hidden="true"
      transform={`translate(${(HERB_FOOT_X - w / 2).toFixed(1)} ${(headBarY(form, outfit) - h).toFixed(1)})`}
      style={{ '--pip-head-bar-flash': `${HEAD_BAR_FLASH_MS}ms` }}
    >
      <rect className="pip-head-bar-track" width={w} height={h} rx={h / 2} />
      <rect className="pip-head-bar-fill" width={w} height={h} rx={h / 2} style={{ transform: `scaleX(${pct / 100})` }} />
      <rect className="pip-head-bar-outline" width={w} height={h} rx={h / 2} strokeWidth={1.4 / poseScale} />
    </g>
  )
}

export default PipHeadBar
```

- [x] **Step 2: Write the CSS**

```css
/* MPP-38: Pip's level bar over his head (colours from MPP-31's strip). */

.pip-head-bar-track { fill: #e3f1d8; }
.pip-head-bar-outline { fill: none; stroke: #2f4a22; }

.pip-head-bar-fill {
  fill: #5fae3e;
  transform-box: fill-box;
  transform-origin: 0 50%;
  transition: transform 0.9s ease-in-out;
}

.pip-head-bar.is-instant .pip-head-bar-fill { transition: none; }

/* AC 4: fill in the first half of FILLING, then flash yellow before Pip evolves. */
.pip-head-bar.is-full .pip-head-bar-fill {
  transition-duration: var(--pip-head-bar-flash);
  animation: pip-head-bar-flash var(--pip-head-bar-flash) ease-in-out var(--pip-head-bar-flash) 1;
}

@keyframes pip-head-bar-flash {
  50% { fill: #ffd34d; }
}

/* AC 6: the screen-reader progressbar is present but not painted. */
.pip-head-bar-status {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .pip-head-bar-fill {
    transition: none !important;
    animation: none !important;
  }
}
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors. The component isn't rendered yet.

### Task 6: Create `PipHeadBarStatus.jsx` ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/PipHeadBarStatus.jsx`

- [x] **Step 1: Write the component**

```jsx
import { spokenLevelLabel } from '../herb/headBar'
import './PipHeadBar.css'

/**
 * MPP-38 AC 6: the growth progressbar for screen readers. The room <svg> is role="img", which
 * makes anything inside it presentational, so this lives beside the SVG, visually hidden.
 */
function PipHeadBarStatus({ levelBar }) {
  return (
    <div
      className="pip-head-bar-status"
      role="progressbar"
      aria-label="Growth"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={levelBar.pct}
      aria-valuetext={spokenLevelLabel(levelBar.label)}
    />
  )
}

export default PipHeadBarStatus
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: Draw the bar from `RoomPip` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/RoomPip.jsx` (the `RoomPip` signature, its doc comment and the returned `<g>`)

- [x] **Step 1: Accept `levelBar` and render the bar after the figure**

Add `import PipHeadBar from './PipHeadBar'`. Change the signature to `function RoomPip({ pose, herb = DEFAULT_HERB, levelBar = null })`, and inside the returned `<g transform={transform}>`, after `<PipHerbFigure … />`, add:

```jsx
      {levelBar && (
        <PipHeadBar form={herb.form} outfit={herb.outfit} pct={levelBar.pct} phase={levelBar.phase} poseScale={scale} />
      )}
```

Append to the doc comment: `MPP-38: \`levelBar\` ({ pct, phase }) draws the small bar over his head — inside this transform, outside the figure's .pip-anim, so it follows every pose and walk but not the bob.`

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 8: Wire `PetRoom` — drop the strip, pass `levelBar` to both `RoomPip` sites, add the status ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` (re-read first: MPP-37 has changed this file)

- [x] **Step 1: Swap the import**

Replace `import PipLevelBar from './PipLevelBar'` with `import PipHeadBarStatus from './PipHeadBarStatus'`.

- [x] **Step 2: Remove the strip render**

Delete the line `{levelBar && <PipLevelBar label={levelBar.label} pct={levelBar.pct} phase={levelBar.phase} />}` (wherever MPP-37 left it).

- [x] **Step 3: Pass `levelBar` to the walker's `RoomPip`**

Find `<PipWalker phase={phase}>{!asleep && <RoomPip pose={pose} herb={herb} />}</PipWalker>` and change the inner element to `<RoomPip pose={pose} herb={herb} levelBar={levelBar} />`.

- [x] **Step 4: Pass `levelBar` to the bed `Station`'s `RoomPip` (AC 7)**

In the `ROOM_DRAW_ORDER.map(station => <Station … />)` call add `levelBar={levelBar}`. In `function Station({ station, level, position, phase, pose, herb, fridgePct })` add `levelBar` to the destructured props. In its bed branch, change `<RoomPip pose={pose} herb={herb} />` to `<RoomPip pose={pose} herb={herb} levelBar={levelBar} />`.

- [x] **Step 5: Render the hidden progressbar beside the SVG**

Inside the `pip-room-scene` div, directly after the closing `</svg>`, add `{levelBar && <PipHeadBarStatus levelBar={levelBar} />}`.

- [x] **Step 6: Update the doc comment**

Replace the MPP-31 line's `` `levelBar` ({ label, pct, phase }) renders the green bar under the scene `` with `` `levelBar` ({ label, pct, phase }) — MPP-38: drawn over Pip's head by RoomPip, spoken by PipHeadBarStatus ``. If MPP-37 rewrote the comment's MPP-32 line ("Wardrobe strip under the level bar"), drop "under the level bar".

- [x] **Step 7: Build and measure**

Run: `cd foodbytes-app\client; npm run build; (Get-Content src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines`
Expected: `built in <n>s`, no errors, and a line count under 400.

### Task 9: Hide the bar at Basilisk in `PetView` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx` (re-read first: MPP-37 has changed this file)

- [x] **Step 1: Null the level bar once Pip is fully grown (AC 8)**

Add `PIP_FORMS` to the imports (`import { PIP_FORMS } from '../../constants/pipGrowth'`, or merge it into an existing import from that module if MPP-37 added one). Replace

```jsx
const levelBar = growth.barLabel ? { label: growth.barLabel, pct: growth.barPct, phase: growth.phase } : null
```

with

```jsx
  // MPP-38 AC 8: no bar once Pip is a Basilisk; during an evolve into it, Bushling's bar still fills and flashes first.
  const levelBar = growth.barLabel && growth.displayForm !== PIP_FORMS.BASILISK
    ? { label: growth.barLabel, pct: growth.barPct, phase: growth.phase }
    : null
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 10: Delete `PipLevelBar` ✓

- Skill: react-frontend

**Files:**
- Delete: `foodbytes-app/client/src/components/pet/room/PipLevelBar.jsx`
- Delete: `foodbytes-app/client/src/components/pet/room/PipLevelBar.css`

- [x] **Step 1: Confirm nothing imports it, then delete**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Where-Object { $_.Name -notlike 'PipLevelBar.*' } | Select-String -Pattern "PipLevelBar"`
Expected: zero hits. Then run `Remove-Item foodbytes-app\client\src\components\pet\room\PipLevelBar.jsx, foodbytes-app\client\src\components\pet\room\PipLevelBar.css`.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 3 — Manual visual check on a phone

There's no frontend test runner, so the ACs that are about appearance are checked by eye. This phase changes no committed code: any temporary override is reverted and grep-checked before it ends.

### Task 11: Phone check of the bar at every form, hat, pose and bed level (developer-owned) — DEFERRED to developer

- Skill: none — manual visual verification on a device, by the developer

**Files:**
- Modify (temporary, reverted in Step 4): `foodbytes-app/client/src/components/pet/PetView.jsx`. Each override line carries the comment `// MPP38-TEMP`.

- [ ] **Step 1: Run the app locally**

Start the backend and Vite as described in `CLAUDE.md` → "Running the backend locally with Google login", then run `cd foodbytes-app\client; npm run dev -- --host`. Open `http://<PC-LAN-IP>:5173/pet` on the phone (or in Chrome DevTools at a 390×844 device size) and sign in.

- [ ] **Step 2: Walk the checklist**

Force each state with a temporary `// MPP38-TEMP` line in `PetView.jsx`, for example `herb.form = 3 // MPP38-TEMP` and `levels={{ ...pet.room?.stations, bed: 4 }} // MPP38-TEMP`, or by clicking through the demo where the app state allows. Confirm each item:
1. **Forms 1–4, no hat:** a small green bar, about head-width, sits just above Pip's head (above the Seedling sprout, Sprig's leaves and Bushling's back leaves), with no text.
2. **Forms 1–4 with each hat** (beanie, cap, chef hat, straw hat, top hat): the bar sits above the hat crown with a clear gap. It doesn't touch the hat even at the top of the happy bounce.
3. **Rug → cooker:** log a meal as eaten so the cook-and-serve scene plays. The bar walks out with Pip, hops with him and walks back, and never lags behind.
4. **Asleep in bed (AC 7), at bed levels 1, 2, 3 and 4:** the bar is visible above sleeping Pip (dimmed with the night like the rest of the room), the same on-screen size as on the rug, and not hidden behind the bed's front art.
5. **Speech bubble (AC 5):** where the bubble and the bar overlap, the bubble paints above the bar.
6. **Evolve:** clear `localStorage` key `foodbytes.pip.lastSeenGrowth.<userId>` after a +3 day that crosses a form boundary, or set `herb.form` and a forced `phase` with `// MPP38-TEMP`. The bar fills, flashes yellow once, and the new form's bar starts empty.
7. **Basilisk (AC 8):** form 5 shows no bar at all, and TalkBack/VoiceOver finds no growth progressbar.
8. **Screen reader (AC 6):** on forms 1–4, TalkBack/VoiceOver reads "Growth, Sprig, 14 of 24 to Bushling" (or the current values) and no visible text appears.
9. **Reduced motion:** with the OS "remove animations" setting on, the fill jumps with no transition and no flash.

- [ ] **Step 3: Record the result**

Note pass/fail per item (1–9) for `pr-description.md` (Task M.5). Fix any failure in the task that owns that behaviour (geometry → Tasks 2–4, rendering → Tasks 5–8, Basilisk → Task 9) before continuing.

- [ ] **Step 4: Revert every temporary override**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "MPP38-TEMP"`
Expected: zero hits. Remove any line it finds, then re-run until there are none.

---

## Phase M — Final verification

The closing phase. No production changes beyond the version bump, only sanity checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-38 is a **Story**, so bump **MINOR and reset PATCH**. Because this contract applies after MPP-37, the current version already includes MPP-37's bump, so bump from whatever is there now. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-38: Pip's level bar is a small green bar over his head that follows him (no label), hidden once he's fully grown`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references ✓

- Skill: none — verification only

- [x] **Step 1: Confirm no `PipLevelBar` / `pip-level` remains**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.css | Select-String -Pattern "PipLevelBar|pip-level"`
Expected: zero hits.

- [x] **Step 2: Confirm no temporary override remains**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "MPP38-TEMP"`
Expected: zero hits.

- [x] **Step 3: Confirm no new console logging**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)" | Measure-Object | Select-Object -ExpandProperty Count`
Expected: no more than the baseline of 6.

### Task M.3: Run the full backend test suite ✓

- Skill: none — verification only

- [x] **Step 1: Clean test run** (QA: 398 tests, 0 failures, BUILD SUCCESS)

Run: `cd foodbytes-app\foodbytes-api; mvn test` (with `JAVA_HOME` and Maven on `PATH` per `CLAUDE.md`)
Expected: `BUILD SUCCESS`, 0 failures, 0 errors. No backend change was made, so this guards against a broken tree.

### Task M.4: Production build and node checks ✓

- Skill: none — verification only

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [x] **Step 2: Re-run the herb and room checks**

Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run check:room; npm run check:growth`
Expected: each exits 0 with no `AssertionError`.

### Task M.5: Update the PR description ✓

- Skill: none — documentation

- [x] **Step 1: Write `pr-description.md` in this plan folder for the developer to paste**

Include:
- A link to `plan.md` in this folder.
- A summary: labelled strip removed, small bar over Pip's head inside `RoomPip` that follows every pose, hidden progressbar for screen readers, flash before an evolve, hidden at Basilisk. Include the new version from Task M.1.
- No migration. Apply order: merged after MPP-37.
- Verification results: `check:wardrobe` / `check:room` / `check:growth`, `npm run build`, `mvn test`, and the Phase 3 checklist (items 1–9) with pass/fail.
- A note for future contributors: `crownTop` / `growthRise` in `herbForms.js` are measured values. Re-measure them (Task 2's snippet) whenever `HerbBack`, `HerbGrowth` or a body path changes.
- Suggested commit subject: `MPP-38: Small level bar over Pip's head`

---

## Self-review

**Spec coverage:**
- AC 1 (strip and label removed) — Tasks 8, 10, M.2.
- AC 2 (small green bar over the head, head-width, same colours) — Tasks 1, 5, 7, 11 (item 1).
- AC 3 (moves with Pip everywhere, including the cook walk) — Tasks 7, 8 (both `RoomPip` sites), 11 (item 3).
- AC 4 (progress, evolve/de-evolve, flash when full) — Task 5 (`is-instant`, `is-full`), Task 11 (item 6).
- AC 5 (clears every hat, below the bubble, forms 1–4) — Tasks 2, 3, 4 (node assertions), 11 (items 2, 5).
- AC 6 (screen-reader progressbar with spoken value text) — Tasks 3 (`spokenLevelLabel`), 6, 8 (step 5), 11 (item 8).
- AC 7 (visible asleep) — Task 8 step 4, Task 11 (item 4 at bed levels 1–4).
- AC 8 (hidden at Basilisk) — Task 9, Task 11 (item 7).
- Reduced motion — Task 5 CSS, Task 11 (item 9).
- Apply-after-MPP-37 and re-read rule — header note, Tasks 8, 9, M.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N". The only values filled at apply time are the measured `crownTop` / `growthRise` (Task 2 gives the exact snippet and the acceptance bounds) and the computed version number (by design).

**Type / name consistency:** `HEAD_BAR_WIDTH`, `HEAD_BAR_HEIGHT`, `HEAD_BAR_GAP`, `HEAD_BAR_FLASH_MS` (Task 1) are used in Tasks 3, 4 and 5. `crownTop` / `growthRise` (Task 2) are used in Tasks 3 and 4. `headBarTop`, `headBarY` and `spokenLevelLabel` (Task 3) are used in Tasks 4, 5 and 6. `PipHeadBar({ form, outfit, pct, phase, poseScale })` (Task 5) is called in Task 7 with the same props. `PipHeadBarStatus({ levelBar })` (Task 6) is rendered in Task 8. `RoomPip`'s `levelBar` prop (Task 7) is passed in Task 8. CSS classes `pip-head-bar`, `pip-head-bar-track`, `pip-head-bar-fill`, `pip-head-bar-outline`, `pip-head-bar-status`, `is-instant` and `is-full` match between Tasks 5 and 6. The bar width is `HEAD_BAR_WIDTH / poseScale`, matching `plan.md` → Data shapes.

**Phase boundary cleanliness:**
- Phase 1 adds only unused data and pure functions, and `check:wardrobe` passes, so the app is unchanged and the build is green.
- Phase 2 builds after every task: new components exist before they're rendered, and `PipLevelBar` is unimported (Task 8) before it's deleted (Task 10).
- Phase 3 leaves no committed change (the `MPP38-TEMP` grep is zero).
- Phase M changes only the version and CHANGELOG.
