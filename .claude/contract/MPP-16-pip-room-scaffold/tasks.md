# Tasks: Room scaffold — 3D corner room engine and furniture catalogue on the Pet page

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-10-13

**Goal:** Replace Pip's flat CSS backdrop on `/pet` with a static SVG corner room. The room is drawn by a reusable isometric module and a level-aware furniture catalogue (bed, fridge, cooker, cabinet × 4 levels). It renders at level 1, draws back-to-front, and Pip stands on the rug with his mood face.

**Spec:** `plan.md` in this folder. Geometry and art source: `.claude/contract/MPP-15-epic-breakdown/mockups/pip-room-mockup-v5.html` (lines 288–455). Every coordinate below is copied from it; if a number here disagrees with the mockup, the mockup wins.

---

## File map

**Created:**
- `foodbytes-app/client/src/constants/petRoom.js` — station keys, level bounds, default levels, viewBox
- `foodbytes-app/client/src/components/pet/room/iso.js` — pure projection `P`, `pts`, `shade`, point builders
- `foodbytes-app/client/src/components/pet/room/roomLayout.js` — draw order, Pip home/scale, rug, per-level anchors, `resolveRoomLevels`
- `foodbytes-app/client/src/components/pet/room/room.check.mjs` — `node:assert` self-check for the two pure modules
- `foodbytes-app/client/src/components/pet/room/isoShapes.jsx` — JSX primitives `Poly`, `IsoLine`, `Box`, `RectU/V/H`, `EllH`, `Cyl`, `Bill`
- `foodbytes-app/client/src/components/pet/room/furniture.jsx` — `FURNITURE` catalogue (4 stations × 4 levels) + cached `stationArt`
- `foodbytes-app/client/src/components/pet/room/roomDecor.jsx` — `ROOM_BACKDROP` (walls, floor, window, rug)
- `foodbytes-app/client/src/components/pet/room/RoomPip.jsx` — Pip on the rug with mood face/props
- `foodbytes-app/client/src/components/pet/room/PetRoom.jsx` — the room component
- `foodbytes-app/client/src/components/pet/room/PetRoom.css` — room container sizing

**Modified:**
- `foodbytes-app/client/package.json` — `check:room` script; version bump
- `foodbytes-app/client/src/components/pet/mochiParts.jsx` — add `MochiBody`, `MochiGradient`
- `foodbytes-app/client/src/components/pet/MochiPet.jsx` — use `MochiBody`, `MochiGradient` (no visual change)
- `foodbytes-app/client/src/components/pet/PetView.jsx:1-9,53-64` — render `PetRoom` instead of the CSS room
- `foodbytes-app/client/src/components/pet/PetView.css:9-106` — delete `.pet-room*` / `.pet-stage*`, move `.pet-bubble` top-right
- `foodbytes-app/foodbytes-api/pom.xml` — version bump
- `CHANGELOG.md` — one line

**Deleted:** (none)

---

## Phase 1 — Pure geometry and layout

Adds the node-checkable core: constants, projection maths, layout data, and its self-check. Nothing imports these yet, so the app is unchanged and the build stays green. If the check fails here, the projection is wrong and every later phase would draw it wrong.

### Task 1: Room constants ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/constants/petRoom.js`

- [x] **Step 1: Write the constants**

```js
/**
 * MPP-16: Pip's room (epic MPP-15). Every station exists at levels 1–4 from the start so
 * later tickets (shop, upgrades) only ever change a level number.
 */
export const ROOM_STATIONS = {
  BED: 'bed',
  FRIDGE: 'fridge',
  COOKER: 'cooker',
  CABINET: 'cabinet'
}

export const ROOM_MIN_LEVEL = 1
export const ROOM_MAX_LEVEL = 4

export const DEFAULT_ROOM_LEVELS = {
  bed: 1,
  fridge: 1,
  cooker: 1,
  cabinet: 1
}

// Mockup v5 projection space; the SVG scales to the card width.
export const ROOM_VIEWBOX = '0 0 360 330'
```

### Task 2: Isometric projection module ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/iso.js`

- [x] **Step 1: Port the mockup's iso engine as pure functions**

```js
/**
 * MPP-16: isometric projection for Pip's room, ported from pip-room-mockup-v5.html.
 * Floor coords: u runs from the back corner along the LEFT wall, v along the RIGHT wall,
 * h is height. The left wall is the plane v = 0, the right wall is u = 0, and the viewer
 * is at +u, +v. Pure — no JSX — so room.check.mjs can pin it under node.
 */
const ISO_N = Math.hypot(180, 70)
export const ISO_C = 180 / ISO_N
export const ISO_S = 70 / ISO_N

/** Floor point (u, v) at height h → SVG [x, y]. */
export function P(u, v, h = 0) {
  return [180 - u * ISO_C + v * ISO_C, 180 + (u + v) * ISO_S - h]
}

/** [[x, y], …] → an SVG `points` string, one decimal place like the mockup. */
export function pts(points) {
  return points.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ')
}

/** Lighten (pct > 0) or darken (pct < 0) a '#rrggbb' colour. */
export function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16)
  const f = pct / 100
  const channel = shift => {
    const c = (n >> shift) & 255
    return Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f))
  }
  return `rgb(${channel(16)},${channel(8)},${channel(0)})`
}

/** The three visible faces of a solid box, in draw order: front (u = u+du), side (v = v+dv), top. */
export function boxFaces(u, v, du, dv, h0, h1) {
  const U = u + du
  const V = v + dv
  return {
    front: [P(U, v, h0), P(U, V, h0), P(U, V, h1), P(U, v, h1)],
    side: [P(u, V, h0), P(U, V, h0), P(U, V, h1), P(u, V, h1)],
    top: [P(u, v, h1), P(U, v, h1), P(U, V, h1), P(u, V, h1)]
  }
}

/** Flat decal on the plane v = vp. */
export function rectVPoints(vp, u0, u1, h0, h1) {
  return [P(u0, vp, h0), P(u1, vp, h0), P(u1, vp, h1), P(u0, vp, h1)]
}

/** Flat decal on the plane u = up. */
export function rectUPoints(up, v0, v1, h0, h1) {
  return [P(up, v0, h0), P(up, v1, h0), P(up, v1, h1), P(up, v0, h1)]
}

/** Flat horizontal rectangle at height h. */
export function rectHPoints(h, u0, u1, v0, v1) {
  return [P(u0, v0, h), P(u1, v0, h), P(u1, v1, h), P(u0, v1, h)]
}

/** Horizontal ellipse (rug, hob ring, pot lid) as a polygon. */
export function ellipsePoints(cu, cv, h, ru, rv, steps = 24) {
  const points = []
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    points.push(P(cu + ru * Math.cos(t), cv + rv * Math.sin(t), h))
  }
  return points
}

/** Visible side band of a short cylinder (pots): the near half at h0, back along h1. */
export function cylinderSidePoints(cu, cv, r, h0, h1) {
  const angle = i => -Math.PI / 4 + (i / 12) * Math.PI
  const points = []
  for (let i = 0; i <= 12; i++) points.push(P(cu + r * Math.cos(angle(i)), cv + r * Math.sin(angle(i)), h0))
  for (let i = 12; i >= 0; i--) points.push(P(cu + r * Math.cos(angle(i)), cv + r * Math.sin(angle(i)), h1))
  return points
}
```

### Task 3: Room layout data ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/roomLayout.js`

- [x] **Step 1: Write the layout module**

```js
import { DEFAULT_ROOM_LEVELS, ROOM_MAX_LEVEL, ROOM_MIN_LEVEL, ROOM_STATIONS } from '../../../constants/petRoom.js'

/**
 * MPP-16: where things sit in Pip's room (floor coords, see iso.js). Pure data so
 * room.check.mjs can pin it and later tickets (MPP-17 routine, MPP-18 cooking, MPP-19
 * fridge) can read anchors without touching the art.
 */

// AC 4: back → front. Fixed, not depth-sorted — at level 4 the cooker's footprint
// (u 48–142) overlaps the fridge's (u 124–188), so a sort could put the cooker on top.
export const ROOM_DRAW_ORDER = [
  ROOM_STATIONS.COOKER,
  ROOM_STATIONS.FRIDGE,
  ROOM_STATIONS.CABINET,
  ROOM_STATIONS.BED
]

export const RUG = { cu: 100, cv: 85, ru: 58, rv: 44 }

// Pip stands in the middle of the rug.
export const PIP_HOME = [RUG.cu, RUG.cv]
export const PIP_SCALE = 0.46

// Per level (index 0 = level 1), [u, v, h]. From the mockup's FRIDGE_TOP, STOVE[].pot,
// PLATE_AT and BED[].top. Not drawn yet.
export const STATION_ANCHORS = {
  fridgeTop: [[166, 14, 34], [166, 17, 58], [163, 19, 112], [156, 20, 120]],
  cookerPot: [[118, 15, 46], [80, 19, 70], [92, 20, 80], [90, 20, 82]],
  cookerPlate: [[100, 22, 26], [106, 19, 55], [118, 20, 62], [112, 20, 63]],
  bedTop: [[48, 148, 5], [50, 148, 30], [40, 148, 30], [40, 148, 30]]
}

/** Any levels input → a full { bed, fridge, cooker, cabinet } of whole numbers in 1..4. */
export function resolveRoomLevels(levels) {
  const resolved = {}
  for (const station of Object.keys(DEFAULT_ROOM_LEVELS)) {
    const level = levels?.[station]
    const valid = Number.isInteger(level) && level >= ROOM_MIN_LEVEL && level <= ROOM_MAX_LEVEL
    resolved[station] = valid ? level : DEFAULT_ROOM_LEVELS[station]
  }
  return resolved
}
```

### Task 4: Self-check + npm script ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/room.check.mjs`
- Modify: `foodbytes-app/client/package.json` (`scripts`)

- [x] **Step 1: Write the check**

```js
// Run: npm run check:room   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-16 room projection,
// level normalisation and draw order are pinned here. Mirrors utils/petMood.check.mjs.
import assert from 'node:assert/strict'
import { P, pts, shade, boxFaces, ellipsePoints, cylinderSidePoints, ISO_C, ISO_S } from './iso.js'
import { ROOM_DRAW_ORDER, PIP_HOME, RUG, STATION_ANCHORS, resolveRoomLevels } from './roomLayout.js'
import { DEFAULT_ROOM_LEVELS, ROOM_MAX_LEVEL } from '../../../constants/petRoom.js'

const near = (actual, expected) =>
  actual.forEach((n, i) => assert.ok(Math.abs(n - expected[i]) < 1e-9, `[${actual}] is not [${expected}]`))

// AC 1 projection: back corner at (180, 180), slope 70/180, h lifts straight up.
near(P(0, 0), [180, 180])
near(P(0, 0, 50), [180, 130])
assert.ok(Math.abs(ISO_S / ISO_C - 70 / 180) < 1e-12)
near(P(193, 0), [180 - 193 * ISO_C, 180 + 193 * ISO_S]) // left wall runs down-left
near(P(0, 193), [180 + 193 * ISO_C, 180 + 193 * ISO_S]) // right wall runs down-right

// The whole room (walls 180 high, floor 193 deep) fits the 0 0 360 330 viewBox.
for (const [x, y] of [P(193, 0, 180), P(0, 193, 180), P(193, 193), P(0, 0, 180), P(193, 0), P(0, 193)]) {
  assert.ok(x >= 0 && x <= 360 && y >= 0 && y <= 330, `(${x}, ${y}) is outside the viewBox`)
}

// pts: one decimal place, comma inside a point, space between points.
assert.equal(pts([[1, 2.34], [3.06, 4]]), '1.0,2.3 3.1,4.0')

// shade: 0 is identity, + mixes toward white, − toward black.
assert.equal(shade('#808080', 0), 'rgb(128,128,128)')
assert.equal(shade('#000000', 50), 'rgb(128,128,128)')
assert.equal(shade('#ffffff', -20), 'rgb(204,204,204)')

// boxFaces: front is the u = u+du plane, side the v = v+dv plane, top sits at h1.
const faces = boxFaces(0, 0, 10, 20, 0, 5)
near(faces.front[0], P(10, 0, 0))
near(faces.side[0], P(0, 20, 0))
faces.top.forEach((p, i) => near(p, P([0, 10, 10, 0][i], [0, 0, 20, 20][i], 5)))

// Ellipse and cylinder point counts.
assert.equal(ellipsePoints(100, 85, 0, 58, 44).length, 24)
near(ellipsePoints(100, 85, 0, 58, 44)[0], P(158, 85, 0))
assert.equal(cylinderSidePoints(118, 15, 9, 33, 46).length, 26)

// AC 4: every station drawn exactly once, fridge after (on top of) the cooker.
assert.deepEqual([...ROOM_DRAW_ORDER].sort(), Object.keys(DEFAULT_ROOM_LEVELS).sort())
assert.ok(ROOM_DRAW_ORDER.indexOf('fridge') > ROOM_DRAW_ORDER.indexOf('cooker'))

// AC 5: Pip stands on the rug.
assert.deepEqual(PIP_HOME, [RUG.cu, RUG.cv])

// Every anchor table has one entry per level.
for (const [name, table] of Object.entries(STATION_ANCHORS)) {
  assert.equal(table.length, ROOM_MAX_LEVEL, `${name} needs ${ROOM_MAX_LEVEL} levels`)
}

// AC 3: levels default to all 1s; bad values fall back to 1; valid values pass through.
assert.deepEqual(resolveRoomLevels(undefined), DEFAULT_ROOM_LEVELS)
assert.deepEqual(resolveRoomLevels({}), DEFAULT_ROOM_LEVELS)
assert.deepEqual(resolveRoomLevels({ fridge: 3 }), { bed: 1, fridge: 3, cooker: 1, cabinet: 1 })
assert.deepEqual(resolveRoomLevels({ bed: 0, fridge: 7, cooker: '2', cabinet: Number.NaN }), DEFAULT_ROOM_LEVELS)
assert.deepEqual(resolveRoomLevels({ bed: 4, fridge: 4, cooker: 4, cabinet: 4, sofa: 2 }), { bed: 4, fridge: 4, cooker: 4, cabinet: 4 })
assert.deepEqual(resolveRoomLevels({ cabinet: 2.5 }), DEFAULT_ROOM_LEVELS)

console.log('room checks passed')
```

- [x] **Step 2: Add the npm script**

In `foodbytes-app/client/package.json` → `scripts`, after `"check:pet"`:

```json
"check:room": "node src/components/pet/room/room.check.mjs",
```

- [x] **Step 3: Run it**

Run: `cd foodbytes-app\client; npm run check:room`
Expected: `room checks passed`, exit code 0.

- [x] **Step 4: Build stays green**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 2 — Room components (not yet wired)

Builds the JSX primitives, the furniture catalogue, the backdrop, Pip-in-the-room and `PetRoom`. `MochiPet` is refactored to share `MochiBody`, with no visual change. `PetView` doesn't render `PetRoom` yet, so `/pet` looks exactly as before and the build stays green.

### Task 5: Share Pip's body and gradient ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/mochiParts.jsx` (append after `MochiProps`, before the private helpers)
- Modify: `foodbytes-app/client/src/components/pet/MochiPet.jsx:7,23-41`

- [x] **Step 1: Add `MochiGradient` and `MochiBody` to `mochiParts.jsx`**

Insert after the `MochiProps` function (before `function Eye`):

```jsx
/** Pip's lavender fill. Callers pass a useId-based id so several pets can share a page. */
export function MochiGradient({ id }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={MOCHI_FILL} />
      <stop offset="1" stopColor={MOCHI_SHADE} />
    </linearGradient>
  )
}

/** Feet, body and highlight — identical in every mood (MPP-14 AC 9) and in the room (MPP-16). */
export function MochiBody({ fill }) {
  return (
    <>
      <ellipse cx="74" cy="180" rx="15" ry="8" fill={fill} {...BODY_STROKE} />
      <ellipse cx="126" cy="180" rx="15" ry="8" fill={fill} {...BODY_STROKE} />
      <path
        d="M100 48 C152 48 182 86 182 128 C182 166 148 182 100 182 C52 182 18 166 18 128 C18 86 48 48 100 48Z"
        fill={fill}
        {...BODY_STROKE}
      />
      <ellipse cx="66" cy="82" rx="16" ry="8" transform="rotate(-30 66 82)" fill="#fff" opacity=".45" />
    </>
  )
}
```

And add, next to the other module constants at the top (after `const LINE = …`):

```jsx
const BODY_STROKE = { stroke: MOCHI_OUTLINE, strokeWidth: 5, strokeLinejoin: 'round' }
```

- [x] **Step 2: Use them in `MochiPet.jsx`**

Change the import line to:

```jsx
import { MochiBody, MochiFace, MochiGradient, MochiProps } from './mochiParts'
```

Delete `const BODY_STROKE = …` (line 8). Replace the `<defs>…</defs>` block with:

```jsx
      <defs>
        <MochiGradient id={gradientId} />
      </defs>
```

Replace the body inside `<g className="mochi-anim">` (the two feet ellipses, the `<path>` and the highlight ellipse) so the group reads:

```jsx
      <g className="mochi-anim">
        <MochiBody fill={fill} />
        <MochiFace mood={mood} />
      </g>
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors, no "is not exported" warnings.

### Task 6: Isometric JSX primitives ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/isoShapes.jsx`

- [x] **Step 1: Write the primitives**

```jsx
import { MOCHI_OUTLINE } from '../mochiParts'
import {
  P,
  boxFaces,
  cylinderSidePoints,
  ellipsePoints,
  pts,
  rectHPoints,
  rectUPoints,
  rectVPoints,
  shade
} from './iso'

/**
 * MPP-16 AC 2: the mockup's box / cyl / ellH / rectU / rectV / rectH / bill as JSX.
 * Extra props (stroke, strokeWidth, strokeDasharray) override the default outline,
 * exactly as the mockup's `extra` string did.
 */
const EDGE = { stroke: MOCHI_OUTLINE, strokeWidth: 1.6, strokeLinejoin: 'round' }

export function Poly({ points, fill, ...rest }) {
  return <polygon points={pts(points)} fill={fill} {...EDGE} {...rest} />
}

export function IsoLine({ points, width = 1.6, color = MOCHI_OUTLINE }) {
  return <polyline points={pts(points)} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
}

/** Solid box: the two visible sides, then the top. */
export function Box({ u, v, du, dv, h0, h1, color }) {
  const faces = boxFaces(u, v, du, dv, h0, h1)
  return (
    <>
      <Poly points={faces.front} fill={shade(color, -6)} />
      <Poly points={faces.side} fill={shade(color, -20)} />
      <Poly points={faces.top} fill={shade(color, 14)} />
    </>
  )
}

export function RectV({ vp, u0, u1, h0, h1, ...rest }) {
  return <Poly points={rectVPoints(vp, u0, u1, h0, h1)} {...rest} />
}

export function RectU({ up, v0, v1, h0, h1, ...rest }) {
  return <Poly points={rectUPoints(up, v0, v1, h0, h1)} {...rest} />
}

export function RectH({ h, u0, u1, v0, v1, ...rest }) {
  return <Poly points={rectHPoints(h, u0, u1, v0, v1)} {...rest} />
}

export function EllH({ cu, cv, h, ru, rv, ...rest }) {
  return <Poly points={ellipsePoints(cu, cv, h, ru, rv)} {...rest} />
}

/** Short cylinder (pots): side band, then the lid. */
export function Cyl({ cu, cv, r, h0, h1, color }) {
  return (
    <>
      <Poly points={cylinderSidePoints(cu, cv, r, h0, h1)} fill={shade(color, -12)} />
      <EllH cu={cu} cv={cv} h={h1} ru={r} rv={r} fill={shade(color, 12)} />
    </>
  )
}

/** Billboard: flat art (trophies, knobs, the sun) pinned to a floor point. */
export function Bill({ u, v, h = 0, children }) {
  const [x, y] = P(u, v, h)
  return <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}>{children}</g>
}
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 7: Furniture catalogue ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/furniture.jsx`

- [x] **Step 1: Port `FRIDGE`, `STOVE`, `CABINET`, `BED`, `trophy` and `ribbon` from mockup v5 (lines 260–269, 325–388)**

```jsx
import { MOCHI_OUTLINE } from '../mochiParts'
import { P } from './iso'
import { Bill, Box, Cyl, EllH, IsoLine, RectU, RectV } from './isoShapes'

/**
 * MPP-16 AC 3: every station at levels 1–4, art from pip-room-mockup-v5.html.
 * FURNITURE[station][level - 1]() returns JSX; the bed returns { back, front } so a
 * sleeping Pip (MPP-17) can be drawn between the layers.
 */
const ART_STROKE = { stroke: MOCHI_OUTLINE, strokeWidth: 2 }
const KNOB_STROKE = { stroke: MOCHI_OUTLINE, strokeWidth: 1.4 }

export const FURNITURE = {
  fridge: [
    // 1 cool box
    () => (
      <>
        <Box u={146} v={0} du={40} dv={28} h0={0} h1={24} color="#5fb3e8" />
        <Box u={145} v={-1} du={42} dv={30} h0={24} h1={31} color="#ffffff" />
        <Box u={159} v={10} du={14} dv={8} h0={31} h1={34} color="#ffffff" />
      </>
    ),
    // 2 mini fridge
    () => (
      <>
        <Box u={146} v={0} du={40} dv={34} h0={0} h1={58} color="#eef0f6" />
        <RectV vp={34} u0={150} u1={153} h0={24} h1={48} fill="#b9bdc8" />
        <RectV vp={34} u0={168} u1={178} h0={38} h1={46} fill="#ff8fab" />
      </>
    ),
    // 3 full fridge
    () => (
      <>
        <Box u={140} v={0} du={46} dv={38} h0={0} h1={112} color="#f4f6fb" />
        <IsoLine points={[P(140, 38, 76), P(186, 38, 76)]} />
        <RectV vp={38} u0={144} u1={147} h0={82} h1={104} fill="#b9bdc8" />
        <RectV vp={38} u0={144} u1={147} h0={40} h1={68} fill="#b9bdc8" />
        <RectV vp={38} u0={162} u1={174} h0={50} h1={62} fill="#ffd34d" />
      </>
    ),
    // 4 double-door
    () => (
      <>
        <Box u={124} v={0} du={64} dv={40} h0={0} h1={120} color="#d5dde8" />
        <IsoLine points={[P(156, 40, 0), P(156, 40, 120)]} />
        <RectV vp={40} u0={151} u1={154} h0={52} h1={92} fill="#8f9aa6" />
        <RectV vp={40} u0={158} u1={161} h0={52} h1={92} fill="#8f9aa6" />
        <RectV vp={40} u0={166} u1={182} h0={70} h1={94} fill="#5d6d7e" />
        <RectV vp={40} u0={130} u1={142} h0={84} h1={100} fill="#ffffff" />
        <RectV vp={40} u0={132} u1={138} h0={104} h1={110} fill="#ff8fab" />
      </>
    )
  ],
  cooker: [
    // 1 camping stove on a crate
    () => (
      <>
        <Box u={96} v={0} du={44} dv={30} h0={0} h1={26} color="#c9965f" />
        <IsoLine points={[P(96, 30, 13), P(140, 30, 13)]} width={1.4} color="#8a5a2b" />
        <Box u={106} v={6} du={24} dv={18} h0={26} h1={31} color="#777777" />
        <Bill u={118} v={15} h={33}><path d="M-5 0 q5 -12 10 0z" fill="#ff9d3c" /></Bill>
        <Cyl cu={118} cv={15} r={9} h0={33} h1={46} color="#6c7a89" />
      </>
    ),
    // 2 counter + hob
    () => (
      <>
        <Box u={60} v={0} du={80} dv={36} h0={0} h1={50} color="#f3e3c3" />
        <RectV vp={36} u0={64} u1={98} h0={6} h1={44} fill="none" />
        <RectV vp={36} u0={102} u1={136} h0={6} h1={44} fill="none" />
        <Box u={58} v={0} du={84} dv={38} h0={50} h1={55} color="#d8c09a" />
        <EllH cu={118} cv={19} h={55} ru={10} rv={9} fill="#444444" />
        <Cyl cu={80} cv={19} r={11} h0={55} h1={70} color="#e76f51" />
      </>
    ),
    // 3 range cooker with a pot
    () => (
      <>
        <Box u={70} v={0} du={70} dv={38} h0={0} h1={62} color="#f6f7fb" />
        <RectV vp={38} u0={78} u1={132} h0={10} h1={44} fill="#4b5563" />
        {[76, 90, 112, 126].map(u => (
          <Bill key={u} u={u} v={38} h={53}><circle r="2.6" fill="#999" stroke={MOCHI_OUTLINE} strokeWidth="1" /></Bill>
        ))}
        <EllH cu={122} cv={12} h={62} ru={7} rv={6} fill="#444444" />
        <EllH cu={122} cv={28} h={62} ru={7} rv={6} fill="#444444" />
        <Cyl cu={92} cv={20} r={13} h0={62} h1={80} color="#e76f51" />
      </>
    ),
    // 4 chef's kitchen: hood, range, utensils
    () => (
      <>
        <Box u={84} v={0} du={26} dv={14} h0={136} h1={180} color="#b0bec5" />
        <Box u={70} v={0} du={54} dv={32} h0={124} h1={136} color="#b0bec5" />
        {[76, 84, 112, 118].map((u, i) => (
          <IsoLine key={u} points={[P(u, 1, 118), P(u, 1, 104 - i * 3)]} width={2} />
        ))}
        <IsoLine points={[P(64, 1, 118), P(130, 1, 118)]} width={2} />
        <Box u={50} v={0} du={90} dv={38} h0={0} h1={58} color="#2f3e46" />
        <RectV vp={38} u0={70} u1={120} h0={10} h1={44} fill="rgba(255,183,3,.45)" />
        <Box u={48} v={0} du={94} dv={40} h0={58} h1={63} color="#cfd8dc" />
        <Cyl cu={90} cv={20} r={13} h0={63} h1={82} color="#e76f51" />
        <Box u={124} v={8} du={10} dv={10} h0={63} h1={72} color="#a1887f" />
        <Bill u={129} v={13} h={72}><circle cy="-7" r="8" fill="#7cb342" {...KNOB_STROKE} /></Bill>
      </>
    )
  ],
  cabinet: [
    // 1 planks on bricks
    () => (
      <>
        <Box u={0} v={30} du={22} dv={14} h0={0} h1={18} color="#c0563b" />
        <Box u={0} v={86} du={22} dv={14} h0={0} h1={18} color="#c0563b" />
        <Box u={0} v={26} du={24} dv={78} h0={18} h1={24} color="#c9965f" />
        <Box u={0} v={30} du={22} dv={14} h0={24} h1={42} color="#c0563b" />
        <Box u={0} v={86} du={22} dv={14} h0={24} h1={42} color="#c0563b" />
        <TrophyAt u={12} v={64} h={24} s={0.55} />
        <Box u={0} v={26} du={24} dv={78} h0={42} h1={48} color="#c9965f" />
      </>
    ),
    // 2 wall shelves with brackets
    () => (
      <>
        <Box u={0} v={38} du={14} dv={3} h0={30} h1={40} color="#7a5a3a" />
        <Box u={0} v={92} du={14} dv={3} h0={30} h1={40} color="#7a5a3a" />
        <Box u={0} v={30} du={22} dv={72} h0={40} h1={46} color="#b98a5a" />
        <TrophyAt u={10} v={46} h={46} s={0.55} />
        <RibbonAt u={10} v={80} h={46} s={0.55} />
        <Box u={0} v={38} du={14} dv={3} h0={72} h1={82} color="#7a5a3a" />
        <Box u={0} v={92} du={14} dv={3} h0={72} h1={82} color="#7a5a3a" />
        <Box u={0} v={30} du={22} dv={72} h0={82} h1={88} color="#b98a5a" />
        <TrophyAt u={10} v={64} h={88} s={0.65} />
      </>
    ),
    // 3 wooden cabinet
    () => (
      <>
        <Box u={0} v={30} du={26} dv={66} h0={0} h1={112} color="#9c6b3f" />
        <RectU up={26} v0={36} v1={90} h0={8} h1={104} fill="#f3e2c4" />
        <IsoLine points={[P(26, 36, 40), P(26, 90, 40)]} />
        <IsoLine points={[P(26, 36, 72), P(26, 90, 72)]} />
        <TrophyAt u={27} v={50} h={72} s={0.55} />
        <TrophyAt u={27} v={76} h={72} s={0.55} />
        <RibbonAt u={27} v={50} h={40} s={0.55} />
        <RibbonAt u={27} v={76} h={40} s={0.55} />
        <TrophyAt u={27} v={63} h={8} s={0.6} />
      </>
    ),
    // 4 glass display cabinet with lights
    () => (
      <>
        <Box u={0} v={28} du={28} dv={70} h0={0} h1={128} color="#5b3a22" />
        <Box u={0} v={26} du={30} dv={74} h0={128} h1={134} color="#d4a017" />
        <RectU up={28} v0={34} v1={92} h0={8} h1={120} fill="#fff5d6" />
        <IsoLine points={[P(28, 34, 46), P(28, 92, 46)]} width={2.4} color="#d4a017" />
        <IsoLine points={[P(28, 34, 84), P(28, 92, 84)]} width={2.4} color="#d4a017" />
        <TrophyAt u={29} v={46} h={84} s={0.55} />
        <TrophyAt u={29} v={78} h={84} s={0.62} />
        <RibbonAt u={29} v={46} h={46} s={0.55} />
        <RibbonAt u={29} v={78} h={46} s={0.55} />
        <TrophyAt u={29} v={46} h={8} s={0.55} />
        <TrophyAt u={29} v={78} h={8} s={0.55} />
        <RectU up={28} v0={34} v1={92} h0={8} h1={120} fill="rgba(189,224,254,.28)" />
        <IsoLine points={[P(28, 63, 8), P(28, 63, 120)]} color="#d4a017" />
        <Bill u={28} v={40} h={116}><circle r="2.5" fill="#ffd34d" /></Bill>
        <Bill u={28} v={86} h={116}><circle r="2.5" fill="#ffd34d" /></Bill>
      </>
    )
  ],
  // Headboard against the right wall (u = 0), running along u, at v 120–176.
  bed: [
    // 1 blanket on the floor
    () => ({
      back: (
        <>
          <Box u={10} v={122} du={74} dv={52} h0={0} h1={5} color="#9ec5e8" />
          <Box u={12} v={132} du={16} dv={32} h0={5} h1={11} color="#ffffff" />
        </>
      ),
      front: null
    }),
    // 2 camp cot
    () => ({
      back: (
        <>
          {[[6, 124], [6, 170], [80, 124]].map(([u, v]) => (
            <Box key={`${u}-${v}`} u={u} v={v} du={3} dv={3} h0={0} h1={22} color="#7a6a4f" />
          ))}
          <Box u={4} v={122} du={80} dv={52} h0={22} h1={30} color="#8fb38a" />
          <Box u={8} v={132} du={16} dv={32} h0={30} h1={36} color="#ffffff" />
        </>
      ),
      front: <Box u={80} v={170} du={3} dv={3} h0={0} h1={22} color="#7a6a4f" />
    }),
    // 3 wooden bed
    () => ({
      back: (
        <>
          <Box u={0} v={120} du={6} dv={56} h0={0} h1={64} color="#b98a5a" />
          <Box u={6} v={120} du={80} dv={56} h0={0} h1={18} color="#9c7048" />
          <Box u={8} v={122} du={76} dv={52} h0={18} h1={28} color="#ffffff" />
          <Box u={10} v={132} du={16} dv={32} h0={28} h1={35} color="#ffffff" />
          <Box u={32} v={121} du={54} dv={54} h0={28} h1={32} color="#f2a7bd" />
        </>
      ),
      front: <Box u={86} v={120} du={5} dv={56} h0={0} h1={34} color="#b98a5a" />
    }),
    // 4 canopy bed
    () => ({
      back: (
        <>
          <Box u={0} v={120} du={5} dv={5} h0={0} h1={122} color="#8a5a8c" />
          <Box u={0} v={171} du={5} dv={5} h0={0} h1={122} color="#8a5a8c" />
          <Box u={0} v={124} du={6} dv={48} h0={0} h1={82} color="#a974b0" />
          <Box u={6} v={120} du={80} dv={56} h0={0} h1={18} color="#8a5a8c" />
          <Box u={8} v={122} du={76} dv={52} h0={18} h1={28} color="#ffffff" />
          <Box u={10} v={132} du={16} dv={32} h0={28} h1={36} color="#ffffff" />
          <Box u={32} v={121} du={54} dv={54} h0={28} h1={32} color="#c9a6f7" />
          <Bill u={16} v={160} h={40}>
            <path d="M0 -4 c-4 -6 -12 -1 -6 6 l6 6 l6 -6 c6 -7 -2 -12 -6 -6z" fill="#ff8fab" {...KNOB_STROKE} />
          </Bill>
        </>
      ),
      front: (
        <>
          <Box u={86} v={124} du={5} dv={48} h0={0} h1={36} color="#a974b0" />
          <Box u={86} v={120} du={5} dv={5} h0={0} h1={122} color="#8a5a8c" />
          <Box u={86} v={171} du={5} dv={5} h0={0} h1={122} color="#8a5a8c" />
          <Box u={0} v={118} du={91} dv={60} h0={122} h1={127} color="#e9dcff" />
        </>
      )
    })
  ]
}

// Built once per (station, level) per page load. Returning the same element reference
// lets React skip the subtree on the minute-clock re-render (MPP-16 "render once" risk).
const artCache = new Map()

export function stationArt(station, level) {
  const key = `${station}:${level}`
  if (!artCache.has(key)) artCache.set(key, FURNITURE[station][level - 1]())
  return artCache.get(key)
}

function TrophyAt({ u, v, h, s = 0.6 }) {
  return (
    <Bill u={u} v={v} h={h}>
      <g transform={`translate(${-16 * s},0) scale(${s})`}>
        <rect x="6" y="-6" width="20" height="6" fill="#8a5a2b" {...ART_STROKE} />
        <rect x="13" y="-14" width="6" height="8" fill="#ffc83d" {...ART_STROKE} />
        <path d="M4 -34 h24 q0 20 -12 20 q-12 0 -12 -20z" fill="#ffd34d" {...ART_STROKE} />
        <path d="M4 -30 q-7 2 -3 9 q3 3 6 1 M28 -30 q7 2 3 9 q-3 3 -6 1" fill="none" {...ART_STROKE} />
      </g>
    </Bill>
  )
}

function RibbonAt({ u, v, h, s = 0.6 }) {
  return (
    <Bill u={u} v={v} h={h}>
      <g transform={`translate(${-14 * s},0) scale(${s})`}>
        <path d="M8 -10 l-4 14 l6 -3 l4 5 l2 -16 M20 -10 l4 14 l-6 -3 l-4 5 l-2 -16" fill="#e63946" {...ART_STROKE} />
        <circle cx="14" cy="-18" r="10" fill="#4dabf7" {...ART_STROKE} />
        <circle cx="14" cy="-18" r="5" fill="#ffd34d" />
      </g>
    </Bill>
  )
}
```

`TrophyAt` and `RibbonAt` are function declarations, so they are hoisted and safe to reference from the catalogue arrows above. The arrows only run on first `stationArt` call, after module evaluation finishes.

- [x] **Step 2: Measure**

Run: `cd foodbytes-app\client; (Get-Content src\components\pet\room\furniture.jsx | Measure-Object -Line).Lines`
Expected: under 400. If 400 or more, move `cabinet` + `TrophyAt` + `RibbonAt` into a sibling `cabinetArt.jsx` that exports `CABINET_LEVELS`, and set `cabinet: CABINET_LEVELS` in `FURNITURE`.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 8: Room backdrop (walls, floor, window, rug) ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/roomDecor.jsx`

- [x] **Step 1: Port the shell from `roomSvg()` (mockup lines 439–447) and `isoWindow(false)` (lines 390–397)**

```jsx
import { P, pts } from './iso'
import { Bill, Box, EllH, RectU } from './isoShapes'
import { RUG } from './roomLayout'

/**
 * MPP-16 AC 1 + AC 5: the angled corner (left wall, right wall, diamond floor), the
 * day window on the right wall and the rug. Static, so it is built once as a module
 * constant and React never re-diffs it.
 */
const WALL_LENGTH = 193
const WALL_HEIGHT = 180
const RUG_RING = { ru: 40, rv: 30 }

export const ROOM_BACKDROP = (
  <>
    <polygon
      points={pts([P(WALL_LENGTH, 0, WALL_HEIGHT), P(0, 0, WALL_HEIGHT), P(0, 0, 0), P(WALL_LENGTH, 0, 0)])}
      fill="#ece5fb"
    />
    <polygon
      points={pts([P(0, 0, WALL_HEIGHT), P(0, WALL_LENGTH, WALL_HEIGHT), P(0, WALL_LENGTH, 0), P(0, 0, 0)])}
      fill="#e3daf8"
    />
    <polygon points={pts([P(0, 0), P(WALL_LENGTH, 0), P(WALL_LENGTH, WALL_LENGTH), P(0, WALL_LENGTH)])} fill="#d6c9f0" />
    <path d="M180 0 V180" stroke="#cbbdea" strokeWidth="2" />
    <polyline points={pts([P(WALL_LENGTH, 0), P(0, 0), P(0, WALL_LENGTH)])} stroke="#c4b4e6" strokeWidth="3" fill="none" />

    {/* Window on the right wall (day). Night sky is MPP-17. */}
    <RectU up={0} v0={94} v1={162} h0={104} h1={164} fill="#ffffff" />
    <RectU up={0} v0={98} v1={158} h0={108} h1={160} fill="#cfe8ff" stroke="none" />
    <Bill u={0} v={145} h={146}><circle r="6" fill="#fff6c2" /></Bill>
    <RectU up={0} v0={126.5} v1={129.5} h0={108} h1={160} fill="#ffffff" stroke="none" />
    <Box u={0} v={90} du={7} dv={76} h0={100} h1={104} color="#d6c8f2" />

    <EllH cu={RUG.cu} cv={RUG.cv} h={0} ru={RUG.ru} rv={RUG.rv} fill="#f6c6d6" stroke="#e79ab5" strokeWidth="3" />
    <EllH
      cu={RUG.cu}
      cv={RUG.cv}
      h={0}
      ru={RUG_RING.ru}
      rv={RUG_RING.rv}
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeDasharray="6 5"
    />
  </>
)
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 9: Pip in the room ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/RoomPip.jsx`

- [x] **Step 1: Write `RoomPip`**

```jsx
import { useId } from 'react'
import { MochiBody, MochiFace, MochiGradient, MochiProps } from '../mochiParts'
import { P } from './iso'
import { PIP_HOME, PIP_SCALE } from './roomLayout'
import '../MochiPet.css'

// Pip is drawn in MochiPet's 200-unit space with his feet at (100, 188); the mockup's
// pipFace() maps that point onto the floor spot.
const FOOT_X = 100
const FOOT_Y = 188

/**
 * MPP-16 AC 5: Pip standing on the rug, wearing his current mood face. The mood props
 * and idle animation come along so /pet keeps MPP-14's per-mood look.
 */
function RoomPip({ mood }) {
  // useId keeps the gradient id unique if MochiPet is also on screen.
  const gradientId = `room-pip-fill-${useId().replace(/:/g, '')}`
  const [x, y] = P(...PIP_HOME)
  const transform = `translate(${(x - FOOT_X * PIP_SCALE).toFixed(1)},${(y - FOOT_Y * PIP_SCALE).toFixed(1)}) scale(${PIP_SCALE})`

  return (
    <g transform={transform} className={`mochi-mood-${mood}`}>
      <defs>
        <MochiGradient id={gradientId} />
      </defs>
      <ellipse cx="100" cy="190" rx="66" ry="8" fill="rgba(40,20,80,.13)" />
      <g className="mochi-anim">
        <MochiBody fill={`url(#${gradientId})`} />
        <MochiFace mood={mood} />
      </g>
      <MochiProps mood={mood} />
    </g>
  )
}

export default RoomPip
```

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 10: `PetRoom` component ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/room/PetRoom.jsx`
- Create: `foodbytes-app/client/src/components/pet/room/PetRoom.css`

- [x] **Step 1: Write `PetRoom.jsx`**

```jsx
import { PET_MOOD_LABELS } from '../../../constants/pet'
import { DEFAULT_ROOM_LEVELS, ROOM_STATIONS, ROOM_VIEWBOX } from '../../../constants/petRoom'
import { stationArt } from './furniture'
import { ROOM_BACKDROP } from './roomDecor'
import { ROOM_DRAW_ORDER, resolveRoomLevels } from './roomLayout'
import RoomPip from './RoomPip'
import './PetRoom.css'

/**
 * MPP-16: Pip's angled-corner room. Static — every station at `levels` (default all 1s),
 * drawn back-to-front so nearer objects overlap farther ones (AC 4), Pip last on the rug,
 * and the speech bubble top-right (AC 5).
 */
function PetRoom({ name, mood, bubble, levels = DEFAULT_ROOM_LEVELS }) {
  const resolved = resolveRoomLevels(levels)
  const label = `${name}'s room — ${name} is ${PET_MOOD_LABELS[mood].toLowerCase()}`

  return (
    <div className="pip-room">
      <svg className="pip-room-svg" viewBox={ROOM_VIEWBOX} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
        {ROOM_BACKDROP}
        {ROOM_DRAW_ORDER.map(station => (
          <Station key={station} station={station} level={resolved[station]} />
        ))}
        <RoomPip mood={mood} />
      </svg>
      <p className="pet-bubble" aria-live="polite">{bubble}</p>
    </div>
  )
}

// The bed is split so a sleeping Pip (MPP-17) can later be drawn between its layers.
function Station({ station, level }) {
  const art = stationArt(station, level)
  if (station !== ROOM_STATIONS.BED) return art
  return (
    <>
      {art.back}
      {art.front}
    </>
  )
}

export default PetRoom
```

- [x] **Step 2: Write `PetRoom.css`**

```css
/* MPP-16: Pip's room — angled-corner SVG from pip-room-mockup-v5.html.
   The SVG keeps its 360×330 aspect and scales with the card (AC 6). */

.pip-room {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: #ece5fb;
  box-shadow: var(--shadow-md);
}

.pip-room-svg {
  display: block;
  width: 100%;
  height: auto;
}
```

- [x] **Step 3: Measure every new component file**

Run: `cd foodbytes-app\client; Get-ChildItem src\components\pet\room\*.jsx | ForEach-Object { "{0} {1}" -f $_.Name, (Get-Content $_.FullName | Measure-Object -Line).Lines }`
Expected: every file under 400 lines.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 3 — Wire the room into `/pet`

Swaps the CSS room for `PetRoom` and deletes the dead CSS in the same phase, so no half-applied styles are left behind. At the end the user-visible change is complete and the build is green.

### Task 11: Render `PetRoom` in `PetView` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.jsx:4,53-64`

- [x] **Step 1: Swap the import**

Replace `import MochiPet from './MochiPet'` with:

```jsx
import PetRoom from './room/PetRoom'
```

- [x] **Step 2: Replace the CSS room block**

Replace the whole `<div className="pet-room">…</div>` block (the window, shelf and two jar divs, the bubble `<p>` and the `pet-stage` div) with:

```jsx
      <PetRoom name={pet.name} mood={mood} bubble={petBubble(moodInfo)} />
```

Update the component's doc comment's first line to `MPP-14 AC 4 / MPP-16: the Pet page — Pip in his room, a speech bubble, the name, a mood`.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 12: Remove the CSS room, move the bubble top-right ✓ (Step 5 manual browser check pending developer — Ready for Test)

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/PetView.css:9-106`

- [x] **Step 1: Delete the dead rules**

Delete the `/* ---- Room ---- */` comment and the rules `.pet-room`, `.pet-room-window`, `.pet-room-window::after`, `.pet-room-shelf`, `.pet-room-jar`, `.pet-room-jar--small`, `.pet-stage` and `.pet-stage .mochi-pet` (lines 9–66 and 94–106).

- [x] **Step 2: Restyle the bubble for the room's top-right**

Replace the `.pet-bubble` and `.pet-bubble::after` rules with:

```css
/* ---- Speech bubble (MPP-16: top-right inside Pip's room) ---- */
.pet-bubble {
  position: absolute;
  top: 10px;
  right: 10px;
  max-width: min(190px, 55%);
  margin: 0;
  padding: 7px 10px;
  background: #fff;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

/* Tail on the left, pointing down towards Pip on the rug. */
.pet-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 20px;
  border: 8px solid transparent;
  border-top-color: #fff;
  border-bottom: 0;
}
```

- [x] **Step 3: Confirm nothing references the removed classes**

Run: `cd foodbytes-app\client; Get-ChildItem -Path src -Recurse -Include *.js,*.jsx,*.css | Select-String -Pattern "pet-room|pet-stage"`
Expected: zero hits.

- [x] **Step 4: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

- [ ] **Step 5: Manual visual check (developer, or the executor if a dev server is available)**

Run: `cd foodbytes-app\client; npm run dev`, sign in, open `http://localhost:5173/pet`. Expected:
- Desktop: the angled corner with lilac left and right walls and a diamond floor. Cool box and crate stove on the left wall, the cool box drawn **over** the stove where they meet (AC 4). Planks-on-bricks cabinet with one trophy, and the window, on the right wall. Blanket bed on the floor at the right. Pink rug in the centre with Pip standing on it, wearing today's mood face. Bubble top-right.
- DevTools device toolbar at **320 px** width: the room scales down with the card, the bubble stays inside the room, and there is no horizontal scrollbar (AC 6).
- Footer Pet tab icon and the `PetReaction` under a meal's eaten toggle look exactly as before (AC 6).
- With OS "reduce motion" on, Pip's idle bob stops (existing `MochiPet.css` rule).

---

## Phase 4 — Final verification

The closing phase. No production changes beyond the version bump — only sanity-checks that the cumulative work is clean.

### Task 13: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. MPP-16 is a **Task** → bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`. The working tree may already carry MPP-33's uncommitted bump, so bump from whatever is there now. Never revert to an older number.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — MPP-16: Pip's room — 3D corner room engine and level 1–4 furniture catalogue on the Pet page`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 14: Grep for stale references and debt ✓

- Skill: none — read-only audit

- [x] **Step 1: No old room classes remain**

Run: `cd foodbytes-app\client; Get-ChildItem -Path src -Recurse -Include *.js,*.jsx,*.css | Select-String -Pattern "pet-room|pet-stage"`
Expected: zero hits.

- [x] **Step 2: No new console logging, no innerHTML, no memo hooks in the room**

Run: `cd foodbytes-app\client; Get-ChildItem -Path src\components\pet -Recurse -Include *.js,*.jsx | Select-String -Pattern "console\.(log|debug)|dangerouslySetInnerHTML|useMemo|React\.memo|useCallback"`
Expected: zero hits.

- [x] **Step 3: Existing pet checks still pass**

Run: `cd foodbytes-app\client; npm run check:pet; npm run check:room`
Expected: both exit 0; `room checks passed` printed.

### Task 15: Run the full backend test suite ✓

- Skill: none — regression gate (backend untouched apart from the `pom.xml` version)

- [x] **Step 1: Clean test run**

Run: `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"; $env:PATH = "$env:JAVA_HOME\bin;C:\Users\jossd\tools\apache-maven-3.9.9\bin;$env:PATH"; cd foodbytes-app\foodbytes-api; mvn test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 16: Production build ✓

- Skill: none — build gate

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 17: Update the PR description ✓

- Skill: none — documentation

**Files:**
- Create: `.claude/contract/MPP-16-pip-room-scaffold/pr-description.md`

- [x] **Step 1: Write `pr-description.md` in this plan folder for the developer to paste**

Include:
- Link to `plan.md` in this folder.
- Summary: SVG corner room replaces the CSS backdrop on `/pet`; new `components/pet/room/` module (iso engine, furniture catalogue for bed/fridge/cooker/cabinet × 4 levels, `PetRoom`); `MochiBody`/`MochiGradient` shared with `MochiPet`. Include the new version from Task 13.
- Migrations: none. Frontend only, so there is nothing to apply on Railway.
- Verification results: `check:room`, `check:pet`, `check:version`, `npm run build`, `mvn test`, and the manual 320 px / desktop check from Task 12 Step 5 (state plainly if it was not done).
- Convention note for future contributors: room art is data in `FURNITURE[station][level-1]`, and draw order is `ROOM_DRAW_ORDER`. Add new stations or decor by extending those, never by reordering JSX or depth-sorting.
- Suggested commit subject: `MPP-16: Pip's room — 3D corner room engine and furniture catalogue`

---

## Self-review

**Spec coverage:**
- iso engine module (AC 2) — Tasks 2, 6.
- Furniture catalogue, 4 stations × 4 levels, `levels` prop default all 1s (AC 3) — Tasks 1, 3, 7, 10.
- Room shell, window, rug in `0 0 360 330` with the mockup projection (AC 1, AC 5) — Tasks 2, 8, 10.
- Back-to-front draw order, fridge over cooker (AC 4) — Tasks 3 (order + check), 10 (render by `ROOM_DRAW_ORDER`), 12 Step 5 (visual).
- Pip on the rug with `MochiFace` (AC 5) — Tasks 5, 9.
- Bubble top-right inside the room (AC 5) — Tasks 10, 12.
- 320 px, no horizontal scroll, scales with card; footer + `PetReaction` unchanged (AC 6) — Tasks 5, 10, 12 Step 5.
- Removing `.pet-room*` CSS — Task 12, audited in Task 14.
- Render once per level set — Task 7 (`stationArt` cache), Task 8 (`ROOM_BACKDROP` module constant).
- Self-check — Task 4.
- Version bump — Task 13.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step shows the exact code or command; the one conditional (Task 7 Step 2's split) names the exact file and export to create.

**Type / name consistency:** `ROOM_STATIONS`, `ROOM_MIN_LEVEL`, `ROOM_MAX_LEVEL`, `DEFAULT_ROOM_LEVELS`, `ROOM_VIEWBOX` (Task 1) are used as defined in Tasks 3, 4, 10. `P`, `pts`, `shade`, `boxFaces`, `rectVPoints`, `rectUPoints`, `rectHPoints`, `ellipsePoints`, `cylinderSidePoints`, `ISO_C`, `ISO_S` (Task 2) are used as named in Tasks 4, 6, 7, 8, 9. `ROOM_DRAW_ORDER`, `RUG`, `PIP_HOME`, `PIP_SCALE`, `STATION_ANCHORS`, `resolveRoomLevels` (Task 3) are used in Tasks 4, 8, 9, 10. `Poly`, `IsoLine`, `Box`, `RectU`, `RectV`, `RectH`, `EllH`, `Cyl`, `Bill` (Task 6) are used in Tasks 7, 8. `FURNITURE` and `stationArt` (Task 7) are used in Task 10. `ROOM_BACKDROP` (Task 8) is used in Task 10. `MochiBody` and `MochiGradient` (Task 5) are used in Task 9. CSS classes `pip-room` / `pip-room-svg` / `pet-bubble` match between Tasks 10 and 12. These match `plan.md` Data shapes, including the 2026-10-13 `MochiGradient` addition.

**Phase boundary cleanliness:**
- Phase 1 adds unimported pure modules plus a script; the app is unchanged and the build is green.
- Phase 2 adds unwired components and a behaviour-preserving `MochiPet` refactor; `/pet` is unchanged and the build is green.
- Phase 3 swaps the room in and deletes the dead CSS together; no orphaned classes, build green.
- Phase 4 is bookkeeping and gates only.
