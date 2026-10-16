# Tasks: Pip room night dim covers the whole stage; curtains line up with the window sill

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-16

**Goal:** The night dim tints the whole Pip-room stage wherever the camera is without blocking any drag or tap, and the gingham and linen curtains are centred on the window (v 198) and stop at the sill top (h 74).

**Spec:** `plan.md` in this folder.

---

## File map

**Created:** (none — no new files)

**Modified:**
- `foodbytes-app/client/src/components/pet/room/PetRoom.css` — new `.pip-room-night-dim` rule
- `foodbytes-app/client/src/components/pet/room/roomEffects.jsx:50-53` — `NightDim` returns a stage-level `<div>` instead of an SVG `<rect>`
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx:145` (+ after line 168) — move `NightDim` out of the `<svg>` to directly after `.pip-room-world`
- `foodbytes-app/client/src/components/pet/room/decorArtWindow.jsx:6-14, 54-78` — curtain constants mirrored about v 198, panels end at h 74
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — PATCH bump

**Deleted:** (none)

---

## Phase 1 — Stage-level night dim

Moves the dim from inside the room SVG to a screen-fixed layer in the stage. The phase ends with the build green and the dim fully moved. There is no state where both dims exist or neither does.

### Task 1: Add the `.pip-room-night-dim` layout rule ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.css` (insert after the `.pip-room-svg` block, ~line 49)

- [x] **Step 1: Insert the rule directly after the `.pip-room-svg { … }` block**

```css
/* MPP-44: the night dim covers the whole stage wherever the camera is; after the world in the DOM so it
   paints over it at the same z-index, under the bubble, hint and 🎯 (z 1). Never takes a drag or tap. */
.pip-room-night-dim {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
```

### Task 2: Make `NightDim` a stage overlay ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/roomEffects.jsx:50-53`

- [x] **Step 1: Replace the SVG rect with a div**

Replace:
```jsx
/** AC 4: the whole room dims while Pip sleeps. Percentages fill the viewBox. */
export function NightDim() {
  return <rect x="0" y="0" width="100%" height="100%" fill={NIGHT_DIM_FILL} />
}
```
with:
```jsx
/** AC 4 / MPP-44: the whole stage dims while Pip sleeps — a screen-fixed layer over the camera-moved world. */
export function NightDim() {
  return <div className="pip-room-night-dim" style={{ background: NIGHT_DIM_FILL }} aria-hidden="true" />
}
```
Also update the file's header comment on line 9 so it no longer says every effect comes from `roomSvg()`. Append: `NightDim is HTML, rendered in the stage rather than the SVG (MPP-44).`

### Task 3: Render `NightDim` after the world layer ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx:145, 168`

- [x] **Step 1: Remove the SVG child**

Delete line 145: `            {asleep && <NightDim />}` (inside the `<svg>`, between `<DecorLayer layer="frontFloor" … />` and `{asleep && <SleepZs … />}`).

- [x] **Step 2: Render it as the world's next sibling**

Directly after the closing `</div>` of `.pip-room-world` (currently line 168, just before `{levelBar && <PipHeadBarStatus … />}`), insert:
```jsx
        {asleep && <NightDim />}
```
Update the MPP-39 comment above the stage (lines 121-122) to read: `Bubble, hint and 🎯 stay on the screen, above the night dim (MPP-44).`

- [x] **Step 3: Confirm the file stays under budget**

Run: `(Get-Content foodbytes-app\client\src\components\pet\room\PetRoom.jsx | Measure-Object -Line).Lines`
Expected: about 316, and well under 400.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 2 — Re-centre the curtains on the sill

A data-only change to the two curtain builders in `decorArtWindow.jsx`. No other decor item is touched. The phase ends with the build green and both curtains in their new geometry, checked by eye.

### Task 4: Re-centre the curtain constants on v 198 ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/decorArtWindow.jsx:6-13`

- [x] **Step 1: Fix the header comment**

Replace lines 6–9 with:
```js
/**
 * MPP-40: the window-dressing and windowsill decor items in world coords (right wall u = 0). The window frame
 * runs v 164–232 and the sill v 158–238, both centred on v 198; the sill top is h 74, u 0–14 (roomDecor.jsx).
 * Sill items stand on it; MPP-44: curtains mirror about v 198 and stop at the sill top.
 */
```

- [x] **Step 2: Replace the curtain constants (lines 10–13)**

Replace:
```js
const GINGHAM_PANELS = [[157, 172], [228, 243]]
const LINEN_LEFT = [[157, 141], [175, 141], [170, 104], [168, 100], [170, 96], [177, 62], [157, 62]]
const LINEN_RIGHT = LINEN_LEFT.map(([v, h]) => [400 - v, h])
const CURTAIN_END_CAPS = [156, 242.5]
```
with:
```js
const WINDOW_MIRROR = 396 // twice the window/sill centre line, v 198
const SILL_TOP_H = 74
const CURTAIN_ROD = { v: 155, dv: 86 }
const CURTAIN_END_CAPS = [154, 240.5]
const GINGHAM_PANELS = [[158, 173], [223, 238]]
const LINEN_LEFT = [[158, 141], [176, 141], [171, 104], [169, 100], [171, 96], [178, SILL_TOP_H], [158, SILL_TOP_H]]
const LINEN_RIGHT = LINEN_LEFT.map(([v, h]) => [WINDOW_MIRROR - v, h])
const LINEN_FOLDS = [161.5, 165.5].flatMap(v => [v, WINDOW_MIRROR - v])
const LINEN_TIEBACKS = [[158, 169], [WINDOW_MIRROR - 158, WINDOW_MIRROR - 169]]
```
`LIGHT_STRAND_STARTS` and `SUCCULENTS` stay unchanged.

### Task 5: Apply the constants in the gingham builder ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/decorArtWindow.jsx` (`'curtains-gingham'`, ~lines 54–67)

- [x] **Step 1: Rod and panel bottoms**

- Rod: `<Box u={0.4} v={157} du={2} dv={86} … color="#8a5a2b" />` becomes `<Box u={0.4} v={CURTAIN_ROD.v} du={2} dv={CURTAIN_ROD.dv} h0={141} h1={143.5} color="#8a5a2b" />`
- Panel: `h0={66}` becomes `h0={SILL_TOP_H}`
- Vertical stripes: `P(2.35, x, 66)` becomes `P(2.35, x, SILL_TOP_H)`

The horizontal stripes `[76, 90, 104, 118, 132]`, the tie-back at h 100 and the end-cap line need no edits: the stripes and tie-back are computed from `a`/`b`, and the caps read `CURTAIN_END_CAPS`.

### Task 6: Apply the constants in the linen builder ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/decorArtWindow.jsx` (`'curtains-linen'`, ~lines 68–78)

- [x] **Step 1: Rod, fold lines and tie-backs**

Replace the builder body with:
```jsx
  'curtains-linen': () => (
    <>
      <Box u={0.4} v={CURTAIN_ROD.v} du={2} dv={CURTAIN_ROD.dv} h0={141} h1={143.5} color="#d4a017" />
      {CURTAIN_END_CAPS.map(v => <Box key={v} u={0.4} v={v} du={2} dv={1.5} h0={139.5} h1={146} color="#d4a017" />)}
      <SlabU up={0.6} th={1.6} vh={LINEN_LEFT} fill="#f3ead8" />
      <SlabU up={0.6} th={1.6} vh={LINEN_RIGHT} fill="#f3ead8" />
      {LINEN_FOLDS.map(v => <IsoLine key={v} points={[P(2.2, v, 140), P(2.2, v, SILL_TOP_H + 1)]} width={1} color={shade('#f3ead8', -20)} />)}
      {LINEN_TIEBACKS.map(([from, to]) => <IsoLine key={from} points={[P(2.3, from, 100), P(2.3, to, 100)]} width={2.6} color="#d4a017" />)}
    </>
  ),
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: Manual visual check at phone width — ⧗ pending developer (Ready for Test)

- Skill: react-frontend

**Files:**
- (none — check only)

- [ ] **Step 1: Start the stack with free mode**

Start the backend per `CLAUDE.md` → "Running the backend locally with Google login", adding `$env:PET_FREE_MODE = "true"`. Then start the frontend: `cd foodbytes-app\client; npm run dev`. Open `http://localhost:5173/pet` in Chrome DevTools at 360×740.

- [ ] **Step 2: Curtains by day**

Enter edit mode. For each of `curtains-gingham` and `curtains-linen`, check them against each sill item (`sill-basil`, `sill-succulents`, `sill-cactus`, `sill-radio`, `sill-cat`) and against no sill item. Expected:
- Panels are flush with both sill ends.
- The rod and caps overhang evenly on each side.
- No panel covers the sill's front face.
- The left and right gaps to the window frame look equal.

- [ ] **Step 3: Night dim**

Get Pip asleep (log today's dinner as eaten, per the ticket's repro). Expected:
- The whole stage is tinted, including the strip left of the left wall and any stage area outside the room. Check this after dragging the camera fully left, fully right, and zoomed out.
- Drag, pinch, the fridge tap, the cabinet tap and the 🎯 all still work.
- The bubble, the hint and the 🎯 are not dimmed.
- In edit mode at night, the spot buttons still respond to taps.

Note in the report how the dimmed "z z" reads (see `plan.md` → Risks).

- [ ] **Step 4: Thumbnails unaffected**

Open the Shop → Decor tab and the decor picker for the window-dressing spot while Pip is asleep. Expected: the curtain thumbnails show the new geometry and have no dim tint.

---

## Phase 3 — Final verification

No production changes beyond the version bump. These steps only check that the cumulative work is clean.

### Task 8: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-44 is a **Bug**, so bump **PATCH**. Write the same new version into `package.json` → `version` and into `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-44: Pip room night dim covers the whole stage; curtains centred on the window and stop at the sill`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 9: Grep for stale references ✓

- Skill: none — verification only

**Files:**
- (none — check only)

- [x] **Step 1: The old geometry is gone**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\room\decorArtWindow.jsx,foodbytes-app\client\src\components\pet\room\roomEffects.jsx -Pattern "400 - v","h0=\{66\}","width=`"100%`"","v=\{157\}","243, 100"`
Expected: zero hits.

- [x] **Step 2: NightDim is no longer inside the SVG**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\room\PetRoom.jsx -Pattern "NightDim"`
Expected: two hits. One is the import line, and the other is the `{asleep && <NightDim />}` line that follows `.pip-room-world`'s closing `</div>`, not the line inside `<svg>`.

- [x] **Step 3: No debug logging added**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\room\*.jsx -Pattern "console\.(log|debug)"`
Expected: zero hits.

### Task 10: Run the full backend test suite ✓

- Skill: none — regression gate (backend untouched; confirms the version bump didn't break the build)

**Files:**
- (none — check only)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 11: Production build ✓

- Skill: none — verification only

**Files:**
- (none — check only)

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 12: Write the PR description ✓

- Skill: none — release bookkeeping

**Files:**
- Create: `.claude/contract/MPP-44-night-dim-and-curtain-alignment/pr-description.md`

- [x] **Step 1: Write `pr-description.md`**

Include:
- A link to `plan.md` in this folder.
- A summary of both fixes, and the new version from Task 8.
- Migrations: none.
- The verification results from Tasks 3, 6, 7, 9, 10 and 11, including what the manual check showed for the dimmed "z z".
- A convention note: screen-fixed room layers (hint, 🎯, night dim) live in `.pip-room-stage` as siblings of `.pip-room-world`, never inside the SVG.
- A suggested commit subject: `MPP-44: night dim covers the whole stage; curtains centred on the sill`

---

## Self-review

**Spec coverage:**
- Stage-level night dim, no pointer capture, under the bubble, hint and 🎯: Tasks 1, 2 and 3, verified in Task 7 Step 3.
- Curtains re-centred on v 198 (rod, caps, panels, folds, tie-backs): Tasks 4, 5 and 6.
- Panels end at the sill top (h 74): Tasks 4, 5 and 6.
- Manual check of each curtain with every window-related placement, by day and night, at phone width: Task 7.
- Thumbnails unaffected: Task 7 Step 4.
- PATCH bump and CHANGELOG: Task 8.

**Placeholder scan:** No `TBD`, `TODO`, "implement later" or vague handling steps. Every step shows the exact code or a runnable command. The manual steps name the route, the viewport and the expected outcome.

**Type / name consistency:** `pip-room-night-dim` is the same in Tasks 1 and 2. The names `WINDOW_MIRROR`, `SILL_TOP_H`, `CURTAIN_ROD`, `CURTAIN_END_CAPS`, `GINGHAM_PANELS`, `LINEN_LEFT`, `LINEN_RIGHT`, `LINEN_FOLDS` and `LINEN_TIEBACKS` are defined in Task 4 and used unchanged in Tasks 5 and 6. They match `plan.md` → Data shapes. `LINEN_TIEBACKS` is the one addition: a named form of the tie-back literals that `plan.md`'s Assumptions describe. `NightDim` keeps its name and its import.

**Phase boundary cleanliness:**
- Phase 1 ends with exactly one dim, in the stage, and the build green.
- Phase 2 changes only data in one file, so both curtains render either fully old or fully new at the boundary, and the build is green.
- Phase 3 changes only version bookkeeping, and check:version confirms all three version locations agree.
