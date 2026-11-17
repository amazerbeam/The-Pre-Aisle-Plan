# Tasks: Pip ball feet + whole-foot shoes, new dragon shoes, frames behind the sill

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-17

**Goal:** Every Pip's feet become little balls owned by the shoe slot (a worn shoe replaces the ball and is drawn in front of the body), the dragon's shoes become Fluffy fur boots and Dragonscale boots, and the wall frames stop floating over the windowsill in every room.

**Spec:** `plan.md` in this folder. Visual source of truth: `foodbytes-app/mockup/pip-dragon-shoes.html` (approved 2026-11-17).

All paths below are relative to `foodbytes-app/client/src/` unless they start with `foodbytes-app/` or `CHANGELOG.md`. Several of these files carry uncommitted work from the completed robot-screen-faces and day-kcal contracts: edit on top of the working tree; never revert.

---

## File map

**Created:** (none — no new files)

**Modified:**
- `components/pet/pip/wardrobeShapes.js` — add `footFrame`.
- `components/pet/pip/wardrobeArt.js` — `shoeArt` → `footArt` (bare fallback).
- `components/pet/pip/wardrobeLayers.js` — `shoes` → `feet`.
- `components/pet/pip/PipFigure.jsx` — feet drawn after `dress.extra`.
- `components/pet/pip/wardrobe.check.mjs` — new foot-slot contract.
- `components/pet/herb/herbArt.jsx` — legs end above the tip.
- `components/pet/herb/herbWardrobe.js` — `SHOES` as foot swaps, `BARE_FOOT`.
- `components/pet/dragon/dragonParts.jsx` — legs without claws.
- `components/pet/dragon/dragonWardrobe.js` — Fluffy fur boots, Dragonscale boots, `BARE_FOOT`.
- `components/pet/robot/robotParts.jsx` — legs without foot plates.
- `components/pet/robot/robotWardrobe.js` — Hover pads / Mag boots as foot swaps, `BARE_FOOT`.
- `constants/pipWardrobe.js` — dragon shoe names.
- `constants/petDecor.js` — `DECOR_LAYERS.wall` split into `wall` + `window`.
- `components/pet/room/roomDecor.jsx` — sill out of the backdrop into `RoomSill`.
- `components/pet/room/herbRoom.js` — `sill: RoomSill`.
- `components/pet/room/packs/robot/robotShell.jsx` — `robotSill` exported, out of the backdrop.
- `components/pet/room/packs/robot/robotRoom.js` — `sill: robotSill`.
- `components/pet/room/packs/dragon/dragonShell.jsx` — `dragonSill` exported, out of the backdrop.
- `components/pet/room/packs/dragon/dragonRoom.js` — `sill: dragonSill`.
- `components/pet/room/roomPacks.jsx` — `packSill`.
- `components/pet/room/PetRoom.jsx` — wall → sill → window layer order.
- `components/pet/room/RoomDecorLayers.jsx` — doc comment lists the `window` layer.
- `components/pet/room/decorArtWalls.jsx`, `packs/robot/robotDecorWalls.jsx`, `packs/dragon/dragonDecorWalls.jsx` — `photo-strip` raised 12.
- `foodbytes-app/mockup/pip-themed-lines.html` — ball-feet model.
- `foodbytes-app/mockup/README.md` — `pip-dragon-shoes.html` live; `pip-themed-lines.html` note.
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump.

**Deleted:** (none)

---

## Phase 1 — Foot slot plumbing

Adds the foot frame, the `footArt` dispatch with a bare-foot fallback and the `BARE_FOOT` entries on all three lines, then switches `dressLayers`/`PipFigure`/the check to `feet`. The old shoe art still renders (inside the new layer) until Phase 2, so the build and `check:wardrobe` stay green at the boundary.

### Task 1: Add `footFrame` to the shape helpers ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/pip/wardrobeShapes.js` (after the `fxGroup` export, ~line 24)

- [x] **Step 1: Add the helper**

```js
/**
 * Foot-frame art (ball feet and shoes): children are drawn with the origin at the foot tip, +x toward the toe and the
 * ground at about +4; a foot pointing left (tip left of its root) is mirrored.
 */
export const footFrame = (root, tip, children) =>
  group(children, { transform: `translate(${tip[0]} ${tip[1]}) scale(${tip[0] < root[0] ? -1 : 1} 1)` })
```

- [x] **Step 2: Smoke-check**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {footFrame} from './src/components/pet/pip/wardrobeShapes.js'; console.log(JSON.stringify(footFrame([88,178],[78,185],[])))"`
Expected: `{"tag":"g","transform":"translate(78 185) scale(-1 1)","children":[]}`

### Task 2: Add `BARE_FOOT` to every line's wardrobe ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/herb/herbWardrobe.js:1-3` (import), `:230-237` (`HERB_WARDROBE`)
- Modify: `components/pet/dragon/dragonWardrobe.js:1-3` (import), `:303-314` (`DRAGON_WARDROBE`)
- Modify: `components/pet/robot/robotWardrobe.js:1-5` (import), `:211-219` (`ROBOT_WARDROBE`)

- [x] **Step 1: Herb ball foot**

Add `footFrame` to the `wardrobeShapes.js` import, then above `HERB_WARDROBE`:

```js
// ---- the bare foot: a little ball in the form's limb colour (mockup pip-dragon-shoes.html BARE.herb) ----
const BARE_FOOT = (root, tip, f) => [footFrame(root, tip, [
  { tag: 'ellipse', cx: 1, cy: -0.5, rx: 7, ry: 4.8, fill: f.fill[1], stroke: HERB_INK, strokeWidth: 2.6, strokeLinejoin: 'round' },
  { tag: 'ellipse', cx: -1, cy: -2.6, rx: 3, ry: 1.4, fill: '#fff', opacity: 0.35 }
])]
```

and add `BARE_FOOT, // (root, tip, f) → shapes: the foot when no shoe is worn` to `HERB_WARDROBE`.

- [x] **Step 2: Dragon ball foot**

Add `footFrame` to the import, then:

```js
// ---- the bare foot: a little ball, no claws (mockup pip-dragon-shoes.html BARE.dragon) ----
const BARE_FOOT = (root, tip, f) => [footFrame(root, tip, [
  ellipse(1, -0.5, 7.5, 5.2, { fill: f.fill[1], stroke: DI, strokeWidth: 2.8, strokeLinejoin: 'round' }),
  ellipse(-1, -2.8, 3.2, 1.5, { fill: '#fff', opacity: 0.35 })
])]
```

and add `BARE_FOOT, // (root, tip, f) → shapes: the foot when no shoe is worn` to `DRAGON_WARDROBE`.

- [x] **Step 3: Robot ball foot**

Add `footFrame` to the import, then:

```js
// ---- the bare foot: a little plated ball with a bolt (mockup pip-dragon-shoes.html BARE.robot) ----
const BARE_FOOT = (root, tip) => [footFrame(root, tip, [
  ellipse(1, -0.5, 7.5, 5, { fill: RB.plate, stroke: RI, strokeWidth: 2.6 }),
  circle(1, -0.5, 1.4, { fill: RB.bolt })
])]
```

and add `BARE_FOOT, // (root, tip) → shapes: the foot when no shoe is worn` to `ROBOT_WARDROBE`.

- [x] **Step 3b: Verify**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed` (nothing reads `BARE_FOOT` yet).

### Task 3: Replace `shoeArt` with `footArt` ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/pip/wardrobeArt.js:81-86`

- [x] **Step 1: Swap the function**

Replace

```js
/** Shapes for both feet. */
export function shoeArt(line, id, f) {
  const draw = wardrobeOf(line).SHOES[id]
  return draw ? f.feet.flatMap(([root, tip]) => draw(root, tip)) : []
}
```

with

```js
/**
 * Shapes for both feet: the worn shoe, or the line's bare ball feet when no shoe is worn (or the id is one this line
 * can't draw). A shoe replaces the whole foot; PipFigure draws these in front of the body.
 */
export function footArt(line, id, f) {
  const wardrobe = wardrobeOf(line)
  const draw = (id && wardrobe.SHOES[id]) || wardrobe.BARE_FOOT
  return f.feet.flatMap(([root, tip]) => draw(root, tip, f))
}
```

(Build is red until Task 4 updates the importer; verify there.)

### Task 4: `dressLayers` returns `feet` ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/pip/wardrobeLayers.js:4`, `:8-16` (doc comment), `:32` (`@returns`), `:47`

- [x] **Step 1: Edit**

- Import: `shoeArt` → `footArt`.
- Doc comment order line: replace `shoes → [back + back-wear] … → [body] → clip: pants → jacket → belt → scarf (inside the body clip) →\n * [outline] → extra (belt buckle, scarf tail) →` with `[back + back-wear] → [legs] → [body] → clip: pants → jacket → belt → scarf (inside the body clip) →\n * [outline] → extra (belt buckle, scarf tail) → feet (the worn shoe, or bare ball feet: a shoe replaces the whole foot) →`.
- `@returns`: `shoes: Object[]` → `feet: Object[]`.
- Line 47: `shoes: worn[SHOES] ? shoeArt(line, worn[SHOES], f) : [],` → `feet: footArt(line, worn[SHOES] ?? null, f), // never empty: bare ball feet when no shoe is worn`.

### Task 5: `PipFigure` draws the feet in front of the body ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/pip/PipFigure.jsx:17` (doc), `:68`, `:74`

- [x] **Step 1: Move the layer**

- Delete line 68 `<PipOutfit shapes={dress.shoes} />`.
- Directly after `<PipOutfit shapes={dress.extra} />` add `<PipOutfit shapes={dress.feet} />`.
- Doc comment: `shadow → back → back-wear (a cape) → limbs → shoes → body + shine → details → torso clip →\n * outline → extras → face` → `shadow → back → back-wear (a cape) → limbs (arms + legs) → body + shine → details → torso clip →\n * outline → extras → feet (bare ball feet, or the shoe that replaces them) → face`.

### Task 6: Update `wardrobe.check.mjs` for the foot slot ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/pip/wardrobe.check.mjs:14` (import), `:101-104`, `:133`, `:154-155`, end of file

- [x] **Step 1: Swap the API**

- Import `footArt` instead of `shoeArt`.
- Line 103: `draw = (g) => shoeArt(line, id, g)` → `draw = (g) => footArt(line, id, g)`.
- Line 133: `assert.deepEqual(dress.shoes, shoeArt(line, 'wellies', f))` → `assert.deepEqual(dress.feet, footArt(line, 'wellies', f))`.
- Line 155: replace with

```js
  assert.deepEqual([empty.back, empty.clip, empty.extra, empty.glasses, empty.hat, empty.itemIds], [[], [], [], [], null, []])
  assert.deepEqual(empty.feet, footArt(line, null, f), `${where}: no shoes = bare ball feet`)
  assert.equal(empty.feet.length, 2, `${where}: one bare foot per leg`)
  assert.deepEqual(footArt(line, 'no-such-shoe', f), empty.feet, `${where}: an unknown shoe falls back to bare feet`)
  assert.notDeepEqual(dress.feet, empty.feet, `${where}: a shoe replaces the bare foot`)
  assert.equal(dress.feet.length, 2, `${where}: a shoe is one group per foot`)
  const movedFeet = { ...f, feet: f.feet.map(([root, tip]) => [root, [tip[0] + 7, tip[1]]]) }
  assert.notDeepEqual(footArt(line, null, movedFeet), empty.feet, `${where}: bare feet follow the foot anchors`)
```

- [x] **Step 2: Pin the layer order in PipFigure**

Before the final `console.log`, add:

```js
// Ball feet / shoes are their own layer, drawn after the torso extras (in front of the body) and before the face.
const figure = readFileSync(new URL('./PipFigure.jsx', import.meta.url), 'utf8')
assert.ok(!figure.includes('dress.shoes'), 'PipFigure: the shoes layer is now dress.feet')
assert.ok(figure.indexOf('shapes={dress.extra}') < figure.indexOf('shapes={dress.feet}'), 'PipFigure: feet after the torso extras')
assert.ok(figure.indexOf('shapes={dress.feet}') < figure.indexOf('{faceLayer}'), 'PipFigure: feet before the face')
for (const line of LINES) assert.equal(typeof LINE_WARDROBE[line].BARE_FOOT, 'function', `${line}: needs BARE_FOOT`)
```

- [x] **Step 3: Verify**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`.

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 2 — Legs without feet, shoes as foot swaps

Removes the feet from each line's `Limbs` and redraws every shoe in the foot frame, porting the art from `pip-dragon-shoes.html` (`LEGS`, `FOOTWEAR`). Each task is one line; after each the build and check are green.

### Task 7: Herb — legs end above the tip; Sneakers / Wellies as foot swaps ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/herb/herbArt.jsx:9`
- Modify: `components/pet/herb/herbWardrobe.js:207-235` (the `SHOES` map, `shoe()` and the `SHOES` line of `HERB_WARDROBE`)

- [x] **Step 1: Leg**

`d={`M${root[0]} ${root[1]} Q${root[0]} ${tip[1]} ${tip[0]} ${tip[1]}`}` → `d={`M${root[0]} ${root[1]} Q${root[0]} ${tip[1]} ${tip[0]} ${tip[1] - 2}`}`

- [x] **Step 2: Shoes**

Replace the `// ---- shoes on the two foot tips ----` block (the `SHOES` style map and `function shoe`) with:

```js
// ---- shoes: each replaces the whole foot, drawn in the foot frame (mockup pip-dragon-shoes.html FOOTWEAR.herb) ----
const SHOES = {
  sneakers: (root, tip) => [footFrame(root, tip, [
    fillPath('M-11 4 Q-12 -7 -1 -7.5 Q9 -7.5 12.5 0 Q13.5 4 10 4 Z', '#fff', 2.8),
    strokePath('M-11 3 H12', '#e8574a', 2.2),
    strokePath('M-3 -6 l5 5', '#e8574a', 2.4, { strokeLinecap: 'round' })
  ])],
  wellies: (root, tip) => [footFrame(root, tip, [
    fillPath('M-10 4 V-11 H3 V-3 Q11 -2 12.5 2 V4 Z', '#e8b830', 2.8),
    strokePath('M-10 -7 H3', '#c98f1a', 2.5)
  ])]
}
```

and in `HERB_WARDROBE` replace the `SHOES: Object.fromEntries(...)` line with `SHOES, // id → (root, tip) → shapes: a shoe replaces the whole foot`.

- [x] **Step 3: Verify**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`.

### Task 8: Dragon — legs without claws; Fluffy fur boots + Dragonscale boots ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/dragon/dragonParts.jsx:98-107` (feet in `DragonLimbs`)
- Modify: `components/pet/dragon/dragonWardrobe.js:16` (header names), `:280-301` (`SHOES`)
- Modify: `constants/pipWardrobe.js:74`

- [x] **Step 1: Legs**

Replace the `f.feet.map` block in `DragonLimbs` with (arms and their claws unchanged):

```jsx
      {f.feet.map(([r, t]) => {
        const d = `M${r[0]} ${r[1]} Q${r[0]} ${t[1] - 2} ${t[0]} ${t[1] - 2}`
        return (
          <g key={t[0]}>
            <path d={d} stroke={DRAGON_INK} strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d={d} stroke={f.fill[1]} strokeWidth="6.5" fill="none" strokeLinecap="round" />
          </g>
        )
      })}
```

and change the comment above `DragonLimbs` to `/** Small clawed arms at the neck (reach grows with the form) and legs from each foot root to just above its tip; the foot itself is the wardrobe's (ball or shoe). */`.

- [x] **Step 2: Shoes**

Replace the `// ---- shoes on the two foot tips: (root, tip) ----` block with:

```js
// ---- shoes: each replaces the whole foot, drawn in the foot frame (approved 2026-11-17, mockup pip-dragon-shoes.html) ----
const GOLD = '#e8b838'
const FUR = '#fbf3e4'
const inked = (fill, strokeWidth = 2.4) => ({ fill, stroke: DI, strokeWidth, strokeLinejoin: 'round' })

const SHOES = {
  // Fluffy fur boots: brown boots under a cream fur cuff, with a pom-pom tie
  // (inspired by the Fluffy Fur Boots in Monster Hunter Rise and the snow boots in Animal Crossing)
  sneakers: (root, tip) => [footFrame(root, tip, [
    path('M-12 2.5 H15 Q16 4 15 6 H-12 Z', inked('#3d2416', 2)),
    path('M-11 3.5 V-5 H3 Q4 -1.5 10 -0.5 Q15 0.5 15 3.5 Z', inked('#7b4a2b')),
    ...[[-11, -5], [-6, -7], [-1, -7], [3.5, -5]].map(([cx, cy]) => circle(cx, cy, 4.2, { fill: FUR, stroke: DI, strokeWidth: 2 })),
    ellipse(-3.8, -5.3, 9, 3.3, { fill: FUR }),
    path('M8 -0.6 v2', { stroke: '#d9b98a', strokeWidth: 1.2 }),
    circle(8, 2.6, 1.8, { fill: FUR, stroke: DI, strokeWidth: 1 })
  ])],
  // Dragonscale boots: deep-red scale boots with a gold cuff and a blue gem
  // (inspired by the Dragonscale Boots in Stardew Valley and the drakeskin boots of Throne and Liberty)
  wellies: (root, tip) => [footFrame(root, tip, [
    path('M-12 3 H15 Q16.5 4.5 15 6 H-12 Z', inked('#3a1218', 2)),
    path('M-11 3.5 V-8 H2 V-4 Q10 -3.5 14 -0.5 Q16 2.5 14 3.5 Z', inked('#9c2f3a')),
    ...[-5, -1.5, 2].flatMap((sy, row) => [-10, -6, -2, 2, 6]
      .filter(sx => !(sy < -2 && sx > 0)) // the top row stops at the ankle
      .map(sx => path(`M${sx + (row % 2) * 2} ${sy} q2 2.6 4 0`, { stroke: '#6b1c26', strokeWidth: 1.2, fill: 'none' }))),
    rect(-12.5, -11.5, 16, 4.4, { rx: 1.6, ...inked(GOLD, 2) }),
    path('M-4.5 -11.6 l2 2.2 l-2 2.2 l-2 -2.2 Z', { fill: '#4aa8e8', stroke: DI, strokeWidth: 1 })
  ])]
}
```

Add `footFrame` and `rect` to the `wardrobeShapes.js` import if missing. In the header comment change `sneakers Talon wraps, wellies Iron sabatons` → `sneakers Fluffy fur boots, wellies Dragonscale boots`.

- [x] **Step 3: Names**

`constants/pipWardrobe.js:74`: `sneakers: 'Talon wraps', wellies: 'Iron sabatons'` → `sneakers: 'Fluffy fur boots', wellies: 'Dragonscale boots'`.

- [x] **Step 4: Verify**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`.

Run: `Select-String -Path foodbytes-app\client\src\**\*.js* -Pattern "Talon wraps|Iron sabatons"`
Expected: zero hits.

### Task 9: Robot — legs without foot plates; Hover pads / Mag boots as foot swaps ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/robot/robotParts.jsx:42` (doc), `:65-75` (feet in `RobotLimbs`)
- Modify: `components/pet/robot/robotWardrobe.js:190-209` (`SHOES`)

- [x] **Step 1: Legs**

In `RobotLimbs` replace the `f.feet.map` block with:

```jsx
      {f.feet.map(([r, t]) => {
        const d = `M${r[0]} ${r[1] - 4} L${t[0]} ${t[1] - 3}`
        return (
          <g key={t[0]}>
            <path d={d} stroke={ROBOT_INK} strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d={d} stroke={RB.limb} strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>
        )
      })}
```

and the doc line → `/** Jointed arms at the shoulders, jointed legs root to tip (the foot itself is the wardrobe's: ball or shoe), and shoulder plating on the Android. */`.

- [x] **Step 2: Shoes**

Replace the `SHOES` map with:

```js
// ---- shoes: each replaces the whole foot, drawn in the foot frame (mockup pip-dragon-shoes.html FOOTWEAR.robot) ----
const SHOES = {
  // Hover pads: the thrusters pulse
  sneakers: (root, tip) => [footFrame(root, tip, [
    fxGroup('hover', [ellipse(1, 5, 9, 3, { fill: RB.glow, opacity: 0.75, style: glowOf(RB.glow, 3) })]),
    rect(-10, -7, 22, 9, { rx: 4.5, fill: RB.plate, stroke: RI, strokeWidth: 2.5 }),
    path('M-5 -2.5 h12', { stroke: RB.glow, strokeWidth: 1.6 })
  ])],
  // Mag boots: hazard-striped
  wellies: (root, tip) => [footFrame(root, tip, [
    path('M-10 4 V-11 H4 V-3 Q12 -2 13 2 V4 Z', { fill: '#3a4652', stroke: RI, strokeWidth: 2.8, strokeLinejoin: 'round' }),
    path('M-10 -7 H4', { stroke: '#ffd13b', strokeWidth: 2.5, strokeDasharray: '3 3' }),
    path('M-10 2 H13', { stroke: '#ffd13b', strokeWidth: 2 })
  ])]
}
```

(The hover `fxGroup` carries no positioning transform itself; its parent foot frame does.)

- [x] **Step 3: Verify**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`.

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 3 — Frames behind the sill (option C, all rooms)

Splits the sill out of each pack's backdrop, splits the wall decor layer, and draws backdrop → rug → wall → sill → window. Then raises the frames. The phase ends with `check:room` and the build green.

### Task 10: Split `DECOR_LAYERS.wall` into `wall` + `window` ✓

- Skill: react-frontend

**Files:**
- Modify: `constants/petDecor.js:35-40`
- Modify: `components/pet/room/RoomDecorLayers.jsx:14` (doc)

- [x] **Step 1: Edit**

```js
export const DECOR_LAYERS = {
  rug: [ROOM_SPOTS.RUG],
  wall: [ROOM_SPOTS.OVER_WARDROBE, ROOM_SPOTS.BEDSIDE_WALL, ROOM_SPOTS.FRONT_RIGHT_WALL],
  window: [ROOM_SPOTS.WINDOW_DRESSING, ROOM_SPOTS.WINDOWSILL], // drawn after the sill: curtains and ornaments sit over it
  backFloor: [ROOM_SPOTS.BACK_CORNER, ROOM_SPOTS.BEDSIDE_NOOK],
  frontFloor: [ROOM_SPOTS.CORNER_BY_DOOR, ROOM_SPOTS.FOOT_OF_BED, ROOM_SPOTS.BY_FRIDGE, ROOM_SPOTS.FRONT_OF_ROOM]
}
```

Doc in `RoomDecorLayers.jsx`: `(DECOR_LAYERS: rug, wall, backFloor,\n * frontFloor)` → `(DECOR_LAYERS: rug, wall, window, backFloor,\n * frontFloor)`.

### Task 11: Herb sill out of the backdrop ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/room/roomDecor.jsx:70-73`
- Modify: `components/pet/room/herbRoom.js:7`, `:15`

- [x] **Step 1: Move the sill**

Cut the comment and three `<Box … />` lines (70-73) out of the backdrop and add below `roomBackdrop`:

```jsx
/**
 * MPP-40 AC 6: the sill (twice as deep, 7 → 14, thicker, h 68–74, on two brackets). Drawn by PetRoom after the wall decor
 * and before the window decor, so the nearer sill covers a low wall item beside it (frames, growth chart).
 */
export function RoomSill() {
  return (
    <>
      <Box u={0} v={167} du={9} dv={3} h0={58} h1={68} color={SILL_BRACKET} />
      <Box u={0} v={227} du={9} dv={3} h0={58} h1={68} color={SILL_BRACKET} />
      <Box u={0} v={158} du={14} dv={80} h0={68} h1={74} color={SILL_TOP} />
    </>
  )
}
```

Update the `roomBackdrop` doc: `The room's walls, floor, window and sill` → `The room's walls, floor and window (the sill is RoomSill)`.

- [x] **Step 2: Register**

`herbRoom.js`: `import { RoomSill, roomBackdrop } from './roomDecor'` and add `sill: RoomSill,` after `backdropById: roomBackdrop,`.

### Task 12: Robot and dragon sills out of their backdrops ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/room/packs/robot/robotShell.jsx:345-352`, `:355`, `:374`
- Modify: `components/pet/room/packs/robot/robotRoom.js:4`, `:19`
- Modify: `components/pet/room/packs/dragon/dragonShell.jsx:285-286`, `:289`, `:308`
- Modify: `components/pet/room/packs/dragon/dragonRoom.js:4`, `:19`

- [x] **Step 1: Robot**

Rename `const sill = () =>` to `export const robotSill = () =>`, append to its doc: ` Drawn by PetRoom after the wall decor (roomPacks.packSill), not by the backdrop.` Remove the trailing `,\n    sill()` from `robotBackdrop`'s `cat(...)` (the `sky(night)` line loses its trailing comma) and change its doc `then the window and the sill` → `then the window (the sill is robotSill)`. In `robotRoom.js` import `{ ROBOT_STYLES, robotBackdrop, robotSill }` and add `sill: robotSill,` after `backdrop: robotBackdrop,`.

- [x] **Step 2: Dragon**

Same in `dragonShell.jsx`: `export const dragonSill = () =>`, drop `sill()` from `dragonBackdrop`, doc `then the cave mouth and the sill` → `then the cave mouth (the sill is dragonSill)`. In `dragonRoom.js` import `dragonSill` and add `sill: dragonSill,`.

### Task 13: `packSill` and the new layer order in PetRoom ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/room/roomPacks.jsx` (after `packBackdrop`, ~line 69)
- Modify: `components/pet/room/PetRoom.jsx:19`, `:144-145`

- [x] **Step 1: Accessor**

```jsx
/** The pack's windowsill, drawn between the wall and window decor layers (null for a pack without one). */
export function packSill(pack) {
  const Sill = pack.sill
  return Sill ? <Sill /> : null
}
```

- [x] **Step 2: Order**

`PetRoom.jsx`: import `packSill`; replace

```jsx
            <DecorLayer layer="wall" {...decorProps} />
```

with

```jsx
            <DecorLayer layer="wall" {...decorProps} />
            {packSill(pack)}
            <DecorLayer layer="window" {...decorProps} />
```

- [x] **Step 3: Verify**

Run: `cd foodbytes-app\client; npm run check:room`
Expected: both room checks pass (`Room packs OK: herb, dragon, robot` among the output), no assertion errors.

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 14: Raise the frames 12 in all three packs ✓

- Skill: react-frontend

**Files:**
- Modify: `components/pet/room/decorArtWalls.jsx:215`
- Modify: `components/pet/room/packs/robot/robotDecorWalls.jsx:130`
- Modify: `components/pet/room/packs/dragon/dragonDecorWalls.jsx:140`

- [x] **Step 1: Edit the three heights**

- Herb: `[[64, '#bde0fe'], [82, '#ffd6a5'], [100, '#caffbf']]` → `[[76, '#bde0fe'], [94, '#ffd6a5'], [112, '#caffbf']]`
- Robot: `[[64, NEON], [82, LIME], [100, PINK]]` → `[[76, NEON], [94, LIME], [112, PINK]]`
- Dragon: `[[64, '#d63a4a'], [82, '#4aa8e8'], [100, '#5cc46a']]` → `[[76, '#d63a4a'], [94, '#4aa8e8'], [112, '#5cc46a']]`

Above each `'photo-strip'` entry add the comment `// raised 12 so the bottom frame clears the windowsill (2026-11-17, mockup pip-dragon-shoes.html option C)`.

- [x] **Step 2: Verify**

Run: `cd foodbytes-app\client; npm run check:room`
Expected: passes.

Run: `Select-String -Path foodbytes-app\client\src\components\pet\room\decorArtWalls.jsx,foodbytes-app\client\src\components\pet\room\packs\robot\robotDecorWalls.jsx,foodbytes-app\client\src\components\pet\room\packs\dragon\dragonDecorWalls.jsx -Pattern "\[\[64,"`
Expected: zero hits.

---

## Phase 4 — Mockup sync

Brings the shared mockup engine in line with live so the next mockup copied from it starts from ball feet. No production code.

### Task 15: Ball feet in `pip-themed-lines.html`; README ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-themed-lines.html` (`dragonLimbs` ~373-386, `robotLimbs` ~528-548, `LINES.herb.limbs` ~1022, `ROBOT_WARDROBE.shoes` ~830-836, `DRAGON_WARDROBE.shoes` ~934-940, `HERB_WARDROBE.shoes` ~1010, `pipFigure` ~1060-1067)
- Modify: `foodbytes-app/mockup/README.md`

- [x] **Step 1: Port the model from `pip-dragon-shoes.html`**

- Limbs: dragon feet `Q${r[0]} ${t[1] - 2} ${t[0]} ${t[1] - 2}` without `claws(...)`; robot feet without the `<rect …>`; herb `… ${t[0]} ${t[1] - 2}`.
- Add `footG`, `BARE` (the three ball feet) from `pip-dragon-shoes.html`.
- Shoes: each line's `shoes.sneakers/wellies.draw(r, t)` returns `footG(t[0], t[1], t[0] < r[0] ? -1 : 1, <FOOTWEAR[line][id].draw()>)` with the art from `pip-dragon-shoes.html` → `FOOTWEAR` (herb sneakers/wellies, robot sneakers/wellies, dragon `furboots` as `sneakers` labelled "Fluffy fur boots", `dragonscale` as `wellies` labelled "Dragonscale boots").
- `pipFigure`: delete the shoes line before the body; after `s += torso.extra;` add `s += f.feet.map(([r, t]) => outfit.shoes ? W.shoes[outfit.shoes].draw(r, t) : footG(t[0], t[1], t[0] < r[0] ? -1 : 1, BARE[line](f))).join('');`.
- Add a line to the header comment: `2026-11-17: ball feet + whole-foot shoes (pip-dragon-shoes.html, approved).`

- [x] **Step 2: README**

In `README.md`, `pip-dragon-shoes.html` row: replace `Not yet live.` with `Live from the version in CHANGELOG for 2026-11-17-pip-ball-feet-shoes.`; in the `pip-themed-lines.html` row append ` Feet updated 2026-11-17 to ball feet + whole-foot shoes.`

- [x] **Step 3: Verify the mockup renders**

Run: `& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --window-size=1200,2400 --screenshot="$env:TEMP\themed-lines.png" "file:///E:/Webdesign/The-Pre-Aisle-Plan/foodbytes-app/mockup/pip-themed-lines.html"`
Expected: `bytes written to file`; open the PNG and see ball feet on bare Pips and full shoes in the outfit rows.

---

## Phase 5 — Final verification

The closing phase. No production changes beyond the version bump — only sanity-checks that the cumulative work is clean.

### Task M.1: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. No Jira key, not a bug fix → bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — 2026-11-17-pip-ball-feet-shoes: Pip ball feet + whole-foot shoes on every line, dragon Fluffy fur boots and Dragonscale boots, wall frames no longer float over the windowsill`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task M.2: Grep for stale references ✓

- Skill: none — verification only

- [x] **Step 1: No old shoe API or names remain**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.mjs | Select-String -Pattern "shoeArt|dress\.shoes|Talon wraps|Iron sabatons"`
Expected: zero hits.

- [x] **Step 2: Claws only on the arms**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\dragon\dragonParts.jsx -Pattern "<Claws"`
Expected: exactly one hit (inside the arms map).

### Task M.3: All client check scripts ✓ (check:wardrobe, check:room, check:pip pass; check:themes fails on a pre-existing Default pair folder-chip-text/folder-chip-bg 4.36:1, untouched by this contract — separate ticket)

- Skill: none — verification only

- [x] **Step 1: Run them**

Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run check:room; npm run check:pip; npm run check:themes`
Expected: `wardrobe checks passed`; room checks pass; pip checks pass; `Themes OK: 3 themes, 189 contrast pairs` with the one known `default|text-secondary|bg-secondary` WARN.

### Task M.4: Production build ✓

- Skill: none — verification only

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task M.5: Manual visual check (developer) — open, developer-owned

- Skill: none — visual check on a device, no automation exists

- [ ] **Step 1: Look at it**

With the dev server (`cd foodbytes-app\client; npm run dev`) and backend running with `PET_FREE_MODE=true` (CLAUDE.md), at 375px and 1280px:
- `/pet` → Dress Pip → Shoes tab on each theme (Default = herb, Parchment = dragon, Cyberpunk = robot): "None" shows ball feet; each shoe replaces the foot, nothing pokes out; dragon shows Fluffy fur boots and Dragonscale boots.
- `/pet` room on each theme with the Photo frames / Monitor stack / Gem frames placed on the bedside wall and any windowsill ornament: the bottom frame sits above the sill, the sill is in front of it, curtains and sill ornaments still draw over the sill.

### Task M.6: PR description ✓

- Skill: none — documentation

- [x] **Step 1: Write `pr-description.md` in this plan folder**

Include: link to `plan.md`; summary (foot slot model, dragon shoes, frames C) and the new version from Task M.1; "No migration"; check/build results from Tasks M.3–M.4; a note for contributors: "Feet are a wardrobe slot: each line's `BARE_FOOT` + `SHOES` draw in the foot frame (`footFrame`), and PipFigure paints `dress.feet` in front of the body"; suggested commit subject `2026-11-17-pip-ball-feet-shoes: ball feet, whole-foot shoes, frames behind the sill`.

---

## Self-review

**Spec coverage:**
- Legs without feet (herb/dragon/robot) — Tasks 7, 8, 9.
- Bare ball foot per line — Task 2.
- Foot slot (`footArt`, `feet`) — Tasks 3, 4.
- PipFigure layer order — Task 5 (pinned by Task 6 Step 2).
- Shoes redrawn as foot swaps — Tasks 7, 8, 9.
- Dragon names — Task 8 Step 3.
- `wardrobe.check.mjs` updated — Task 6.
- Frames C (sill split, layer split, raise 12) — Tasks 10–14.
- Mockup sync — Task 15.
- MINOR bump + CHANGELOG — Task M.1.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N". Every step shows the code or the command.

**Type / name consistency:** `footFrame(root, tip, children)` (Task 1) used in Tasks 2, 7, 8, 9. `BARE_FOOT(root, tip, f)` (Task 2) read by `footArt` (Task 3) and checked in Task 6. `footArt(line, id, f)` replaces `shoeArt` in Tasks 3, 4, 6. `dress.feet` in Tasks 4, 5, 6. `DECOR_LAYERS.window` (Task 10) rendered in Task 13. `RoomSill` / `robotSill` / `dragonSill` (Tasks 11, 12) read via `pack.sill` in `packSill` (Task 13).

**Phase boundary cleanliness:**
- Phase 1: the old shoe art renders through `footArt` and bare feet render where none were before (with the old foot still in `Limbs`), so the build and check are green.
- Phase 2: each line's task removes its old foot and redraws its shoes in one go, so no line is left with two feet or none.
- Phase 3: Tasks 10–13 together move the sill and the layer; the room check and build run after Task 13, before the frames move in Task 14.
- Phase 4: mockup only.
- Phase 5: verification and bookkeeping only.
