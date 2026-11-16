# Tasks: Robot Pip antennas + title belts on every Pip

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-16

**Goal:** The robot Pip's five Hat-slot items become antennas that replace its default antenna (Prop-top, Radar bar, Toque charm, Boing spring, Neon bolt), and its Hat tab reads "Antenna". The Champion belt on all three Pips becomes a gold title belt. Ids, slots, unlocks and the server don't change.

**Spec:** `plan.md` in this folder. Geometry sources: `foodbytes-app/mockup/pip-robot-antennas.html` (`ANTENNAS`, picked keys) and `foodbytes-app/mockup/pip-title-belts.html` (last `<script>` → `TITLE_STYLE[line].champ`, `titleBelt`).

All `Run:` commands are PowerShell from the repo root `E:\Webdesign\The-Pre-Aisle-Plan`.

---

## File map

**Created:**
- `foodbytes-app/client/src/components/pet/robot/robotAntennas.js` — the five robot antennas, drawn from `(x, base, rise, droop)`.

**Modified:**
- `foodbytes-app/client/src/components/pet/pip/wardrobeArt.js` — `HAT_ANCHOR_CROWN`, `hatAnchor(line)`, `hatArt(…, { droop })` crown dispatch.
- `foodbytes-app/client/src/components/pet/pip/wardrobeLayers.js` — `dressLayers(…, { droop })`, `replacesCrown`, `growTop` rule.
- `foodbytes-app/client/src/components/pet/pip/PipFigure.jsx` — passes `droop`, skips `art.Crown` when `dress.replacesCrown`.
- `foodbytes-app/client/src/components/pet/pip/wardrobeShapes.js` — `titleBelt(f, style)`.
- `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs` — crown-anchored hat invariants, droop invariants, slot-label and title-belt assertions.
- `foodbytes-app/client/src/components/pet/pip/Pip.css` — `prop`, `radar`, `dangle`, `boing` effects.
- `foodbytes-app/client/src/components/pet/robot/robotWardrobe.js` — `HATS: ROBOT_ANTENNAS`, `HAT_ANCHOR`, `ROBOT_TITLE_BELT`, Marquee belt → title belt, old hats removed.
- `foodbytes-app/client/src/components/pet/herb/herbWardrobe.js` — `HERB_TITLE_BELT`, Champion belt → title belt, `belt()` reduced to the leather belt.
- `foodbytes-app/client/src/components/pet/dragon/dragonWardrobe.js` — `DRAGON_TITLE_BELT`, Hoard belt → title belt.
- `foodbytes-app/client/src/constants/pipWardrobe.js` — robot hat names, `WARDROBE_SLOT_LABELS`.
- `foodbytes-app/client/src/utils/pipWardrobe.js` — `wardrobeSlotLabel(line, key)`.
- `foodbytes-app/client/src/components/pet/room/WardrobeSlotTabs.jsx` — `line` prop, per-line label.
- `foodbytes-app/client/src/components/pet/room/WardrobeView.jsx` — passes `line` to `WardrobeSlotTabs`.
- `foodbytes-app/mockup/pip-themed-lines.html` — robot hats → antennas, champion belts → title belts, robot hat names.
- `foodbytes-app/mockup/pip-room-chrome.html` — robot hat names, robot Hat tab → "Antenna".
- `foodbytes-app/mockup/README.md` — both new mockups marked live.
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump.

**Deleted:** (none)

---

## Phase 1 — Crown-anchored hats in the wardrobe engine

Teach the shared wardrobe composition about a wardrobe whose hats replace the crown, without any wardrobe opting in yet. At the end of this phase every Pip draws exactly as before (no wardrobe sets `HAT_ANCHOR`), the check passes with its new branches exercised only on the default path, and the build is green.

### Task 1: `hatArt` dispatches on `HAT_ANCHOR` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobeArt.js`

- [x] **Step 1: Add the anchor constant, the lookup and the crown dispatch**

Replace the existing `hatArt` export with:

```js
/** A wardrobe whose hats replace the line's crown (the robot's antennas) sets HAT_ANCHOR to this. */
export const HAT_ANCHOR_CROWN = 'crown'

/** 'crown' when this line's hats replace its crown, otherwise null (hats sit on the hat anchor). */
export const hatAnchor = (line) => wardrobeOf(line).HAT_ANCHOR ?? null

/**
 * { top, shapes, straight?, replacesCrown } on the head anchor, or null for an id that isn't a hat.
 * Crown-anchored hats draw from the head top (growTop) and the form's growthRise, and redraw when drooped.
 */
export function hatArt(line, id, f, { droop = false } = {}) {
  const draw = wardrobeOf(line).HATS[id]
  if (!draw) return null
  if (hatAnchor(line) === HAT_ANCHOR_CROWN) {
    return { ...draw(PIP_FOOT_X, f.growTop, f.growthRise, droop), straight: true, replacesCrown: true }
  }
  return { ...draw(PIP_FOOT_X, f.hat.y, f.hat.w), replacesCrown: false }
}
```

- [x] **Step 2: Verify the module still loads**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {hatArt, hatAnchor} from './src/components/pet/pip/wardrobeArt.js'; import {pipForm} from './src/components/pet/pip/lineForms.js'; const h = hatArt('robot', 'cap', pipForm('robot', 2)); console.log(hatAnchor('robot'), h.replacesCrown, h.shapes.length > 0)"`
Expected: `null false true`

### Task 2: `dressLayers` threads `droop` and exposes `replacesCrown` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobeLayers.js` (the header comment, the JSDoc and `dressLayers`)

- [x] **Step 1: Update the header comment's layer list**

Replace `hat → [crown from growTop, lifted so it pokes through the hat]. Nothing here branches on the form:` with:

```
 * hat → [crown from growTop, lifted so it pokes through the hat — or skipped when the hat replaces the crown
 * (replacesCrown: the robot's antennas, drawn from growTop and redrawn when `droop`)]. Nothing here branches on the form:
```

- [x] **Step 2: Add the option, the flag and the growTop rule**

Change the JSDoc `@param {{ asleep?: boolean }} [options]` to `@param {{ asleep?: boolean, droop?: boolean }} [options]` and add `replacesCrown: boolean` to the `@returns` shape after `replacesFace: boolean`. Then change the signature and body:

```js
export function dressLayers(outfit, line, form, { asleep = false, droop = false } = {}) {
  const worn = outfit ?? {}
  const f = pipForm(line, form)
  const torsoIds = TORSO_ORDER.map(slot => worn[slot]).filter(Boolean)
  const torso = torsoIds.map(id => torsoArt(line, id, f))
  const hat = worn[HAT] ? hatArt(line, worn[HAT], f, { droop }) : null
  const replacesCrown = Boolean(hat?.replacesCrown)
  const glasses = worn[GLASSES] && !asleep ? glassesArt(line, worn[GLASSES], f) : null
  return {
    back: torso.flatMap(t => t.back), // drawn right after the line's Back (a cape)
    shoes: worn[SHOES] ? shoeArt(line, worn[SHOES], f) : [],
    clip: torso.flatMap(t => t.clip),
    extra: torso.flatMap(t => t.extra),
    glasses: glasses?.shapes ?? [],
    replacesFace: Boolean(glasses?.replacesFace), // a screen face: PipFigure skips the line's Face
    replacesCrown, // an antenna: PipFigure skips the line's Crown
    hat: hat && { shapes: hat.shapes, transform: hat.straight ? null : `rotate(${HAT_TILT_DEG} ${PIP_FOOT_X} ${f.hat.y})` },
    growTop: hat && !replacesCrown ? Math.min(f.growTop, hat.top + 4) : f.growTop,
    itemIds: [worn[SHOES], ...torsoIds, glasses ? worn[GLASSES] : null, worn[HAT]].filter(Boolean)
  }
}
```

- [x] **Step 3: Verify**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {dressLayers} from './src/components/pet/pip/wardrobeLayers.js'; const d = dressLayers({HAT: 'top-hat'}, 'herb', 3, {droop: true}); console.log(d.replacesCrown, d.hat.transform.startsWith('rotate(-7'))"`
Expected: `false true`

### Task 3: `PipFigure` passes `droop` and skips the crown for an antenna ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/PipFigure.jsx`

- [x] **Step 1: Pass droop to dressLayers**

Replace `const dress = dressLayers(outfit, line, form, { asleep: mood === PET_SLEEP_FACE })` with:

```jsx
  const dress = dressLayers(outfit, line, form, { asleep: mood === PET_SLEEP_FACE, droop })
```

- [x] **Step 2: Skip the crown when the hat replaces it**

Replace `<art.Crown form={form} droop={droop} base={dress.growTop} />` with:

```jsx
          {!dress.replacesCrown && <art.Crown form={form} droop={droop} base={dress.growTop} />}
```

In the component's doc comment, change `outline → extras → face (skipped while a screen-face item is worn) → glasses → hat → crown.` to `outline → extras → face (skipped while a screen-face item is worn) → glasses → hat → crown (skipped while an antenna is worn).`

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 4: The wardrobe check covers crown-anchored hats and droop ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs`

- [x] **Step 1: Import the anchor helpers**

Change the `wardrobeArt.js` import line to:

```js
import { HAT_ANCHOR_CROWN, LINE_WARDROBE, drawnItemIds, glassesArt, hatAnchor, hatArt, shoeArt, torsoArt } from './wardrobeArt.js'
```

and add below `const idsIn = …`:

```js
const crownHats = (line) => hatAnchor(line) === HAT_ANCHOR_CROWN
```

- [x] **Step 2: Give crown-anchored hats their own anchor-isolation group**

In the AC 3 / AC 7 loop, add a `CROWN` entry to `elsewhere` (everything but the head top) and to `own`:

```js
    CROWN: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, neck: f.neck + 7, waist: f.waist + 7, side: f.side + 7, eyes: { ...f.eyes, gap: f.eyes.gap + 7 }, feet: [] },
```

```js
    CROWN: { growTop: f.growTop + 7 },
```

and in the `if (slot === 'HAT')` branch replace `group = 'HAT'` with:

```js
      group = crownHats(line) ? 'CROWN' : 'HAT'
```

- [x] **Step 3: Branch the tilt / growth assertions on the anchor**

In the AC 3 layer-order loop, replace these two lines:

```js
  assert.match(dress.hat.transform, /^rotate\(-7 100 /, `${where}: hats tilt`)
```
```js
  assert.ok(dress.growTop <= f.growTop && dress.growTop <= hatArt(line, 'top-hat', f).top + 4, `${where}: growth pokes through the hat`)
```

with:

```js
  if (crownHats(line)) {
    assert.equal(dress.hat.transform, null, `${where}: antennas stand straight`)
    assert.equal(dress.replacesCrown, true, `${where}: an antenna replaces the crown`)
    assert.equal(dress.growTop, f.growTop, `${where}: an antenna leaves growTop on the head`)
  } else {
    assert.match(dress.hat.transform, /^rotate\(-7 100 /, `${where}: hats tilt`)
    assert.equal(dress.replacesCrown, false, `${where}: a hat keeps the crown`)
    assert.ok(dress.growTop <= f.growTop && dress.growTop <= hatArt(line, 'top-hat', f).top + 4, `${where}: growth pokes through the hat`)
  }
```

- [x] **Step 4: Add the droop invariants**

Insert before the `// ---- AC 4 / AC 5: crops ----` block:

```js
// ---- Antennas: droop redraws a crown-anchored hat and nothing else ----
for (const { line, form, where } of EACH) {
  for (const id of IDS) {
    const slot = WARDROBE_ITEMS[id].slot
    const up = dressLayers({ [slot]: id }, line, form)
    const down = dressLayers({ [slot]: id }, line, form, { droop: true })
    if (slot === 'HAT' && crownHats(line)) {
      assert.notDeepEqual(down.hat.shapes, up.hat.shapes, `${where} ${id}: an antenna wilts`)
      assertFinite(down.hat.shapes, `${where} ${id} drooped`)
      assert.deepEqual({ ...down, hat: null }, { ...up, hat: null }, `${where} ${id}: droop only touches the antenna`)
    } else {
      assert.deepEqual(down, up, `${where} ${id}: droop changes nothing`)
    }
  }
}
```

- [x] **Step 5: Run the check**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`. No wardrobe sets `HAT_ANCHOR` yet, so the `CROWN` branches and the antenna droop branch are not exercised until Task 7.

---

## Phase 2 — Robot antennas and the Antenna tab

The robot opts in: the five antennas are drawn, the robot wardrobe sets `HAT_ANCHOR: 'crown'`, names and the slot label change. At the end of this phase the robot wears antennas in the app, every check is green and the build passes. Herb and dragon are unchanged.

### Task 5: Four new wardrobe effects in `Pip.css` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/Pip.css` (after `.pip-fx--cape`, and after `@keyframes pip-fx-cape`)

- [x] **Step 1: Add the effect classes**

After the `.pip-fx--cape { … }` line:

```css
.pip-fx--prop { animation: pip-fx-prop .32s linear infinite; }
.pip-fx--radar { animation: pip-fx-prop 2.6s ease-in-out infinite; }
.pip-fx--dangle { transform-origin: 50% 100%; animation: pip-fx-dangle 2.4s ease-in-out infinite; }
.pip-fx--boing { transform-origin: 50% 100%; animation: pip-fx-boing 1.3s cubic-bezier(.3, 1.6, .5, 1) infinite; }
```

- [x] **Step 2: Add the keyframes**

After `@keyframes pip-fx-cape { … }`:

```css
@keyframes pip-fx-prop { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(-1); } }
@keyframes pip-fx-dangle { 0%, 100% { transform: rotate(-7deg); } 50% { transform: rotate(7deg); } }
@keyframes pip-fx-boing { 0%, 100% { transform: scaleY(1); } 30% { transform: scaleY(.78); } 60% { transform: scaleY(1.1); } }
```

The existing `body.lowfx .pip-fx`, `.pip-herb-figure.is-still .pip-fx` and reduced-motion rules already stop these.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 6: `robotAntennas.js` — the five antennas ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/robot/robotAntennas.js`

- [x] **Step 1: Write the module**

Ported from `mockup/pip-robot-antennas.html` → `ANTENNAS` (beanie A, cap B, chef-hat A, straw-hat A, top-hat A), with the mockup's fixed `100` replaced by `x`:

```js
import { circle, ellipse, fxGroup, group, path, rect } from '../pip/wardrobeShapes.js'
import { RB, ROBOT_INK } from './robotForms.js'

/**
 * The robot's Hat slot: antennas that replace the line's crown (ROBOT_WARDROBE.HAT_ANCHOR = 'crown'), ported from
 * the approved foodbytes-app/mockup/pip-robot-antennas.html (2026-11-16): beanie Prop-top, cap Radar bar,
 * chef-hat Toque charm, straw-hat Boing spring, top-hat Neon bolt.
 * Each is (x, base, rise, droop) → { top, shapes }: base = the head top (growTop), rise = the form's growthRise,
 * widths scale by rise / 22. Drooped, an antenna bends over (or hangs / squashes), dims, and has no animated group,
 * so no animated group ever carries a positioning transform.
 */

const RI = ROBOT_INK

const glowOf = (color, px) => ({ filter: `drop-shadow(0 0 ${px}px ${color})` })
const lit = (droop, color) => (droop ? RB.dim : color)
const socket = (x, base) => rect(x - 7, base - 2, 14, 6, { rx: 2, fill: RB.plate, stroke: RI, strokeWidth: 2.2 })
const rod = (d) => path(d, { stroke: RI, strokeWidth: 3.2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' })
/** The generic wilt: bent over to the right from the socket. */
const wilt = (x, base, shapes) => [group(shapes, { transform: `rotate(34 ${x} ${base + 2})` })]

function toque(x, y, droop) {
  const w = 22
  const hh = 11
  const y0 = y - 3
  return [
    path(`M${x - w / 2 + 2} ${y0} C${x - w / 2 - 5} ${y0 - hh} ${x - w / 4} ${y0 - hh - 7} ${x} ${y0 - hh - 3} C${x + w / 4} ${y0 - hh - 7} ${x + w / 2 + 5} ${y0 - hh} ${x + w / 2 - 2} ${y0} Z`,
      { fill: droop ? '#c9d0d6' : '#f1f5f8', stroke: RI, strokeWidth: 2.2, strokeLinejoin: 'round' }),
    path(`M${x - 3.5} ${y0 - hh} v${hh - 1.5} M${x + 3.5} ${y0 - hh} v${hh - 1.5}`, { stroke: '#b9c4ce', strokeWidth: 1.6 }),
    rect(x - w / 2 + 1, y - 3.5, w - 2, 6, { rx: 2, fill: '#dfe6ec', stroke: RI, strokeWidth: 2 }),
    circle(x, y - 0.5, 1.9, { fill: lit(droop, RB.accent) }) // the pink LED bead keeps the bulb's colour
  ]
}

export const ROBOT_ANTENNAS = {
  // Prop-top: a two-blade propeller seen side-on (it flips through as it spins)
  beanie: (x, base, rise, droop) => {
    const k = rise / 22
    const t = base - rise * 0.8
    const blades = [
      ellipse(x - 13 * k, t - 5, 13 * k, 4.2, { fill: RB.accent, stroke: RI, strokeWidth: 2 }),
      ellipse(x + 13 * k, t - 5, 13 * k, 4.2, { fill: RB.lime, stroke: RI, strokeWidth: 2 })
    ]
    const shapes = [
      socket(x, base),
      rod(`M${x} ${base + 2} V${t}`),
      rect(x - 3.5, t - 3, 7, 6, { rx: 2, fill: RB.bolt, stroke: RI, strokeWidth: 2 }),
      droop ? group(blades) : fxGroup('prop', blades),
      circle(x, t - 5, 2.6, { fill: RB.bolt, stroke: RI, strokeWidth: 1.8 })
    ]
    return { top: t - 9, shapes: droop ? wilt(x, base, shapes) : shapes }
  },
  // Radar bar: a slatted bar with a cyan strip that slowly sweeps round
  cap: (x, base, rise, droop) => {
    const k = rise / 22
    const t = base - rise * 0.65
    const bw = 30 * k
    const bar = [
      rect(x - bw / 2, t - 7, bw, 7, { rx: 3, fill: RB.plate, stroke: RI, strokeWidth: 2.2 }),
      rect(x - bw / 2 + 3, t - 5, bw - 6, 2.2, { fill: lit(droop, RB.glow) }),
      path(`M${x - bw / 4} ${t - 7} v7 M${x} ${t - 7} v7 M${x + bw / 4} ${t - 7} v7`, { stroke: RI, strokeWidth: 1.2, opacity: 0.6 })
    ]
    const shapes = [socket(x, base), rod(`M${x} ${base + 2} V${t}`), droop ? group(bar) : fxGroup('radar', bar)]
    return { top: t - 8, shapes: droop ? wilt(x, base, shapes) : shapes }
  },
  // Toque charm: today's antenna with the red bulb swapped for a tiny chef's toque that swings and steams
  'chef-hat': (x, base, rise, droop) => {
    if (droop) {
      const bx = x + 14
      const by = base - rise * 0.5
      return {
        top: by - 26,
        shapes: [
          socket(x, base),
          rod(`M${x} ${base + 2} Q${x} ${base - rise * 0.45} ${bx - 2} ${by}`),
          group(toque(bx, by + 2, true), { transform: `rotate(38 ${bx} ${by + 2})` })
        ]
      }
    }
    const tipY = base - rise + 6
    return {
      top: tipY - 32,
      shapes: [
        socket(x, base),
        rod(`M${x} ${base + 2} V${tipY + 1}`),
        circle(x, tipY - 4, 12, { fill: RB.accent, opacity: 0.16 }),
        fxGroup('dangle', toque(x, tipY, false)),
        ...[-4, 4].map((dx, i) => fxGroup('smoke', [circle(x + dx, tipY - 27, 2.6 + i, { fill: '#e8eef3', opacity: 0.8 })], { animationDelay: `${i * 0.9}s` }))
      ]
    }
  },
  // Boing spring: a coiled spring with a pink ball that boings; squashed short when drooped
  'straw-hat': (x, base, rise, droop) => {
    const k = rise / 22
    const H = droop ? rise * 0.55 : rise * 1.05
    const n = 6
    const dx = 6 * k
    let d = `M${x} ${base + 1}`
    for (let i = 1; i <= n; i++) d += ` L${i === n ? x : x + (i % 2 ? dx : -dx)} ${base + 1 - (H * i) / n}`
    const by = base + 1 - H - 5
    const line = { fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' }
    const coil = [
      path(d, { ...line, stroke: RI, strokeWidth: 4.6 }),
      path(d, { ...line, stroke: RB.bolt, strokeWidth: 2 }),
      ...(droop ? [] : [circle(x, by, 10, { fill: RB.accent, opacity: 0.22 })]),
      circle(x, by, 6, { fill: lit(droop, RB.accent), stroke: RI, strokeWidth: 2.4 }),
      circle(x - 2, by - 2, 1.6, { fill: '#fff', opacity: 0.7 })
    ]
    return { top: by - 11, shapes: [socket(x, base), droop ? group(coil) : fxGroup('boing', coil)] }
  },
  // Neon bolt: a lightning-bolt neon tube that flickers, with a lime spark; the neon goes out when drooped
  'top-hat': (x, base, rise, droop) => {
    const k = rise / 22
    const H = rise * 1.35
    const d = `M${x} ${base + 1} L${x} ${base - H * 0.22} L${x + 6 * k} ${base - H * 0.42} L${x - 6 * k} ${base - H * 0.62} L${x + 5 * k} ${base - H * 0.84} L${x} ${base - H}`
    const line = { fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' }
    const sy = base - H - 3
    const r = 5
    const shapes = [socket(x, base), path(d, { ...line, stroke: RI, strokeWidth: 6 })]
    if (droop) {
      shapes.push(path(d, { ...line, stroke: RB.dim, strokeWidth: 2.6 }))
    } else {
      shapes.push(
        fxGroup('flicker', [path(d, { ...line, stroke: RB.accent, strokeWidth: 2.6 })], glowOf(RB.accent, 3)),
        fxGroup('sparkle', [path(`M${x} ${sy - r} Q${x} ${sy} ${x + r} ${sy} Q${x} ${sy} ${x} ${sy + r} Q${x} ${sy} ${x - r} ${sy} Q${x} ${sy} ${x} ${sy - r}Z`, { fill: RB.lime })])
      )
    }
    return { top: base - H - 8, shapes: droop ? wilt(x, base, shapes) : shapes }
  }
}
```

- [x] **Step 2: Smoke-check the geometry**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {ROBOT_ANTENNAS} from './src/components/pet/robot/robotAntennas.js'; for (const [id, draw] of Object.entries(ROBOT_ANTENNAS)) { const a = draw(100, 66, 26, false), b = draw(100, 66, 26, true); console.log(id, a.top < 66, a.shapes.length > 0, JSON.stringify(b).includes('NaN')) }"`
Expected: five lines, each `<id> true true false`.

### Task 7: The robot wardrobe wears the antennas ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/robot/robotWardrobe.js:1-123` (imports, header comment, the `HATS` block) and `:333-340` (`ROBOT_WARDROBE`)
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs` (file list)

- [x] **Step 1: Delete the old hats and import the antennas**

Delete the whole `// ---- hats: … ----` comment and `const HATS = { … }` block (beanie Cooling fan through top-hat Neon top hat). Add the import:

```js
import { ROBOT_ANTENNAS } from './robotAntennas.js'
```

Remove any `wardrobeShapes.js` import names that become unused after the deletion. Check each of `arc, arcY, band, circle, curveOf, ellipse, fxGroup, group, overalls, path, pxCells, rect` with `Select-String -Path foodbytes-app\client\src\components\pet\robot\robotWardrobe.js -Pattern "\bellipse\("` (and so on). Keep `glowOf` only if it is still used.

- [x] **Step 2: Update the header comment**

In the doc comment, replace `Names on the robot (WARDROBE_ITEM_LABELS): beanie Cooling fan, cap Holo visor, chef-hat Steam toque,\n * straw-hat Satellite dish, top-hat Neon top hat,` with `Names on the robot (WARDROBE_ITEM_LABELS): beanie Prop-top, cap Radar bar, chef-hat Toque charm,\n * straw-hat Boing spring, top-hat Neon bolt (antennas: robotAntennas.js, they replace the crown),`.

- [x] **Step 3: Opt the robot into crown-anchored hats**

```js
/** The robot's wardrobe in the shape every line shares (pip/wardrobeArt.js dispatches on it). */
export const ROBOT_WARDROBE = {
  HATS: ROBOT_ANTENNAS, // id → (x, base, rise, droop) → { top, shapes }
  HAT_ANCHOR: 'crown', // the hats are antennas: they replace the line's crown (wardrobeArt HAT_ANCHOR_CROWN)
  GLASSES, // id → (L, R, y, s) → shapes
  TORSO, // id → (f) → { clip, extra, back? }
  SHOES, // id → (root, tip) → shapes
  REPLACES_FACE: ['round-specs', 'heart-glasses'] // the screen shows the emoji / hearts instead of the face
}
```

- [x] **Step 4: Add `robotAntennas.js` to the check's no-per-form-branches list**

In `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs`, in the `for (const file of [...])` list, add `'../robot/robotAntennas.js'` after `'../robot/robotWardrobe.js'`.

- [x] **Step 5: Run the wardrobe check and build**

Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run build`
Expected: `wardrobe checks passed`, then `built in <n>s`, no errors.

### Task 8: Robot hat names and the per-line slot label (constants + util) ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/pipWardrobe.js` (`WARDROBE_ITEM_LABELS[PIP_LINE.ROBOT]`, new `WARDROBE_SLOT_LABELS` after `WARDROBE_SLOTS`)
- Modify: `foodbytes-app/client/src/utils/pipWardrobe.js` (import + new `wardrobeSlotLabel`)
- Test: `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs` (node check script, not a test runner)

- [x] **Step 1: Rename the robot's hats**

In `WARDROBE_ITEM_LABELS[PIP_LINE.ROBOT]` replace `beanie: 'Cooling fan', cap: 'Holo visor', 'chef-hat': 'Steam toque', 'straw-hat': 'Satellite dish', 'top-hat': 'Neon top hat',` with:

```js
    beanie: 'Prop-top', cap: 'Radar bar', 'chef-hat': 'Toque charm', 'straw-hat': 'Boing spring', 'top-hat': 'Neon bolt',
```

- [x] **Step 2: Add the slot-label override**

Directly after the `WARDROBE_SLOTS` array:

```js
// Themed lines: a slot can read differently on one creature (the robot's hats are antennas). Sparse: absent = WARDROBE_SLOTS' label.
export const WARDROBE_SLOT_LABELS = {
  [PIP_LINE.ROBOT]: { [WARDROBE_SLOT.HAT]: 'Antenna' }
}
```

- [x] **Step 3: Add the helper**

In `utils/pipWardrobe.js`, change the constants import to `import { WARDROBE_ITEMS, WARDROBE_ITEM_LABELS, WARDROBE_SLOTS, WARDROBE_SLOT_LABELS } from '../constants/pipWardrobe.js'` and add after `wardrobeItemLabel`:

```js
/** The slot's tab label on this creature ("Antenna" for the robot's HAT); falls back to WARDROBE_SLOTS' label. */
export const wardrobeSlotLabel = (line, key) =>
  WARDROBE_SLOT_LABELS[line]?.[key] ?? WARDROBE_SLOTS.find(slot => slot.key === key)?.label ?? null
```

- [x] **Step 4: Pin it in the check**

Add `wardrobeSlotLabel` to the `../../../utils/pipWardrobe.js` import in `wardrobe.check.mjs`, and after the `wardrobeAnnouncement(['jetpack'], 'herb')` assertion add:

```js
assert.equal(wardrobeSlotLabel('robot', 'HAT'), 'Antenna')
assert.equal(wardrobeSlotLabel('herb', 'HAT'), 'Hat')
assert.equal(wardrobeSlotLabel('dragon', 'HAT'), 'Hat')
assert.equal(wardrobeSlotLabel('robot', 'BELT'), 'Belt')
assert.equal(wardrobeSlotLabel('mystery', 'SHOES'), 'Shoes')
assert.equal(wardrobeAnnouncement(['top-hat'], 'robot'), '🎉 New outfit: Neon bolt!')
```

- [x] **Step 5: Run the check**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`

### Task 9: Dress Pip tabs read the per-line label ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeSlotTabs.jsx`
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeView.jsx:65`

- [x] **Step 1: Take `line` and label each tab through the helper**

```jsx
import { WARDROBE_SLOTS, WARDROBE_TABS_LABEL } from '../../../constants/pipWardrobe'
import { slotHasNew, wardrobeSlotLabel } from '../../../utils/pipWardrobe'

/** MPP-32 AC 4: the seven slots, scrolling sideways; green dot = worn, red dot = something new. Labels follow the creature (the robot's Hat tab reads "Antenna"). */
function WardrobeSlotTabs({ wardrobe, line, selected, onSelect }) {
  return (
    <div className="pip-wardrobe-tabs" role="tablist" aria-label={WARDROBE_TABS_LABEL}>
      {WARDROBE_SLOTS.map(({ key }) => {
        const label = wardrobeSlotLabel(line, key)
        const worn = Boolean(wardrobe.outfit?.[key])
        const fresh = slotHasNew(wardrobe, key)
```

The rest of the component body is unchanged (it already renders `label` and builds the aria-label from it).

- [x] **Step 2: Pass the line from WardrobeView**

Replace `<WardrobeSlotTabs wardrobe={wardrobe.data} selected={slot} onSelect={chooseSlot} />` with:

```jsx
      <WardrobeSlotTabs wardrobe={wardrobe.data} line={herb.line} selected={slot} onSelect={chooseSlot} />
```

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

---

## Phase 3 — Title belts on every Pip

One shared drawer, three skins: each line's Champion belt becomes the gold title belt. The Leather belt is untouched. Each task leaves the build and the wardrobe check green, because the drawer is added before any line uses it.

### Task 10: `titleBelt` in `wardrobeShapes.js` ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobeShapes.js` (append after `overalls`)

- [x] **Step 1: Add the drawer**

Ported from `mockup/pip-title-belts.html` → `titleBelt(line, 'champ', f)`:

```js
/**
 * The gold title belt every creature's Champion belt wears (approved 2026-11-16, mockup/pip-title-belts.html).
 * Reads only the torso anchors (waist, side). clip = the leather strap inside the body outline; extra = side plates,
 * the scalloped centre plate, jewels, the creature's crest, a blank nameplate, a shine and a sparkling glint.
 * style: { ink, strap, metal, dark, light, jewel, jewel2, leds?, crest: (x, y, r, ink) => shapes }; `leds` makes the
 * plate jewels chase. No lettering, no real-world belt marks.
 */
export function titleBelt(f, style) {
  const { ink, strap, metal, dark, light, jewel, jewel2, leds = false, crest } = style
  const CX = PIP_FOOT_X
  const c = curveOf(f)
  const y = f.waist
  const s = f.side
  const clip = [
    path(band(y - 6, y + 6, c), { fill: strap, stroke: ink, strokeWidth: 2.5 }),
    path(arc(y - 4.2, c), { stroke: metal, strokeWidth: 1.2, fill: 'none' }),
    path(arc(y + 4.2, c), { stroke: metal, strokeWidth: 1.2, fill: 'none' }),
    path(arc(y, c), { stroke: metal, strokeWidth: 0.8, strokeDasharray: '2 2.5', fill: 'none', opacity: 0.5 })
  ]
  const sidePlates = [-1, 1].flatMap(dir => {
    const px = CX + dir * s * 0.74
    const py = arcY(px, y, c)
    const pw = Math.max(8, s * 0.32)
    const ph = 11
    return [
      rect(px - pw / 2, py - ph / 2, pw, ph, { rx: 2, fill: metal, stroke: ink, strokeWidth: 1.8 }),
      rect(px - pw / 2 + 1.6, py - ph / 2 + 1.6, pw - 3.2, ph - 3.2, { rx: 1.2, fill: 'none', stroke: dark, strokeWidth: 0.9 }),
      path(`M${px - pw * 0.25} ${py + 1} q${pw * 0.12} -3 ${pw * 0.25} 0 t${pw * 0.25} 0`, { stroke: dark, strokeWidth: 0.9, fill: 'none' }),
      circle(px - pw / 2 + 2.6, py - ph / 2 + 2.6, 1.3, { fill: jewel }),
      circle(px + pw / 2 - 2.6, py + ph / 2 - 2.6, 1.3, { fill: jewel })
    ]
  })
  const W = Math.min(48, Math.max(26, s * 1.2))
  const H = W * 0.66
  const plate = (k) => {
    const w = W * k
    const h = H * k
    return `M${CX - w / 2} ${y - h * 0.28} Q${CX - w / 2} ${y - h * 0.5} ${CX - w * 0.3} ${y - h * 0.44} Q${CX} ${y - h * 0.64} ${CX + w * 0.3} ${y - h * 0.44} Q${CX + w / 2} ${y - h * 0.5} ${CX + w / 2} ${y - h * 0.28} V${y + h * 0.28} Q${CX + w / 2} ${y + h * 0.5} ${CX + w * 0.3} ${y + h * 0.44} Q${CX} ${y + h * 0.64} ${CX - w * 0.3} ${y + h * 0.44} Q${CX - w / 2} ${y + h * 0.5} ${CX - w / 2} ${y + h * 0.28} Z`
  }
  const scroll = [-1, 1].map(dir => path(
    `M${CX + dir * W * 0.3} ${y - H * 0.1} q${dir * W * 0.07} ${-H * 0.12} 0 ${-H * 0.22} M${CX + dir * W * 0.3} ${y + H * 0.06} q${dir * W * 0.07} ${H * 0.1} 0 ${H * 0.18}`,
    { stroke: dark, strokeWidth: 0.9, fill: 'none' }
  ))
  const jewels = [[-0.38, -0.2], [0.38, -0.2], [-0.38, 0.2], [0.38, 0.2], [0, -0.43]].map(([jx, jy], i) => {
    const color = i % 2 ? jewel2 : jewel
    const dot = circle(CX + jx * W, y + jy * H, 1.8, { fill: color, stroke: ink, strokeWidth: 0.7 })
    return leds ? fxGroup('chase', [dot], { animationDelay: `${i * 0.2}s`, filter: `drop-shadow(0 0 1.5px ${color})` }) : dot
  })
  const extra = [
    ...sidePlates,
    path(plate(1), { fill: metal, stroke: ink, strokeWidth: 2.4, strokeLinejoin: 'round' }),
    path(plate(0.82), { fill: 'none', stroke: dark, strokeWidth: 1.1 }),
    ...scroll,
    ...jewels,
    ...crest(CX, y - H * 0.06, H * 0.2, ink),
    rect(CX - W * 0.2, y + H * 0.22, W * 0.4, Math.max(2.4, H * 0.1), { rx: 1, fill: light, stroke: dark, strokeWidth: 0.7 }),
    path(`M${CX - W * 0.34} ${y - H * 0.32} q${W * 0.1} ${-H * 0.06} ${W * 0.2} ${-H * 0.04}`, { stroke: '#fff', strokeWidth: 1.4, strokeLinecap: 'round', opacity: 0.6 }),
    fxGroup('sparkle', [path(`M${CX + W * 0.28} ${y - H * 0.42} l1.2 2.6 l2.6 1.2 l-2.6 1.2 l-1.2 2.6 l-1.2 -2.6 l-2.6 -1.2 l2.6 -1.2 Z`, { fill: '#fff' })])
  ]
  return { clip, extra }
}
```

(`path`, `rect`, `circle`, `fxGroup`, `band`, `arc`, `arcY`, `curveOf` and `PIP_FOOT_X` are already defined or imported in this file.)

- [x] **Step 2: Run the check (no line uses it yet)**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`

### Task 11: Herb Champion belt → title belt ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/herb/herbWardrobe.js:2` (import), `:155-171` (`belt`), `:195-196` (`TORSO` belts), plus a new exported `HERB_TITLE_BELT`

- [x] **Step 1: Import the drawer**

```js
import { arc, arcY, band, curveOf, path, titleBelt } from '../pip/wardrobeShapes.js'
```

- [x] **Step 2: Reduce `belt()` to the leather belt**

```js
// AC 3: the buckle sits outside the clip. (The Champion belt is the shared title belt: HERB_TITLE_BELT.)
function belt({ color, buckle }, f) {
  const c = curveOf(f)
  const w = f.waist
  return {
    clip: [bandShape(band(w - 4, w + 4, c), color, 2.5)],
    extra: [
      { tag: 'rect', x: CX - 6, y: w - 6, width: 12, height: 12, rx: 2, fill: 'none', stroke: buckle, strokeWidth: 3 },
      { tag: 'rect', x: CX - 6, y: w - 6, width: 12, height: 12, rx: 2, fill: 'none', stroke: HERB_INK, strokeWidth: 1 }
    ]
  }
}
```

Keep the existing clip expression if it differs from `bandShape(band(w - 4, w + 4, c), color, 2.5)`. The leather belt's output must be byte-identical to today. Before editing, capture it with `node --input-type=module -e "import {HERB_WARDROBE} from './src/components/pet/herb/herbWardrobe.js'; import {pipForm} from './src/components/pet/pip/lineForms.js'; console.log(JSON.stringify(HERB_WARDROBE.TORSO['leather-belt'](pipForm('herb', 3))))"` from `foodbytes-app\client` and compare the same output after.

- [x] **Step 3: Add the herb style and switch the Champion belt**

Above `const TORSO = {`:

```js
/** The herb's Champion belt: the shared gold title belt with a basil-leaf crest (wardrobeShapes titleBelt). */
export const HERB_TITLE_BELT = {
  ink: HERB_INK, strap: '#1d1712', metal: '#e3b23c', dark: '#a8781a', light: '#fff0b0', jewel: '#d4384a', jewel2: '#d4384a',
  crest: (x, y, r, ink) => [
    path(`M${x} ${y + r} C${x - r * 0.9} ${y + r * 0.2} ${x - r * 0.7} ${y - r * 0.8} ${x} ${y - r} C${x + r * 0.7} ${y - r * 0.8} ${x + r * 0.9} ${y + r * 0.2} ${x} ${y + r} Z`, { fill: '#6cbf4a', stroke: ink, strokeWidth: 1.2 }),
    path(`M${x} ${y + r * 0.9} V${y - r * 0.6}`, { stroke: ink, strokeWidth: 1, opacity: 0.7 })
  ]
}
```

In `TORSO`:

```js
  'leather-belt': (f) => belt({ color: '#7a4a2a', buckle: '#e3c35a' }, f),
  'champion-belt': (f) => titleBelt(f, HERB_TITLE_BELT),
```

- [x] **Step 4: Verify**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`, and the Step 2 leather-belt JSON is unchanged.

### Task 12: Dragon Hoard belt → title belt ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/dragon/dragonWardrobe.js:2` (import), `:236-250` (`'champion-belt'`), plus a new exported `DRAGON_TITLE_BELT`

- [x] **Step 1: Import the drawer**

Add `titleBelt` to the existing `../pip/wardrobeShapes.js` import list.

- [x] **Step 2: Add the dragon style**

Above the `TORSO` object:

```js
/** The dragon's Hoard belt: the shared gold title belt with a ruby shield crest (wardrobeShapes titleBelt). */
export const DRAGON_TITLE_BELT = {
  ink: DI, strap: '#241a14', metal: '#d9a53a', dark: '#93661a', light: '#ffe6a0', jewel: '#d43a4a', jewel2: '#2f9a6a',
  crest: (x, y, r, ink) => [
    path(`M${x - r * 0.8} ${y - r * 0.8} H${x + r * 0.8} V${y + r * 0.1} Q${x + r * 0.8} ${y + r * 0.8} ${x} ${y + r} Q${x - r * 0.8} ${y + r * 0.8} ${x - r * 0.8} ${y + r * 0.1} Z`, { fill: '#7a2730', stroke: ink, strokeWidth: 1.2 }),
    path(`M${x} ${y - r * 0.55} l${r * 0.35} ${r * 0.45} l${-r * 0.35} ${r * 0.45} l${-r * 0.35} ${-r * 0.45} Z`, { fill: '#ff8a96' })
  ]
}
```

(`DI` is the file's existing alias for `DRAGON_INK`. If the file names it differently, use that name.)

- [x] **Step 3: Switch the Hoard belt**

Replace the whole `// Hoard belt: the gem buckle sparkles` entry with:

```js
  // Hoard belt: the gold title belt (a glint sparkles on the plate)
  'champion-belt': (f) => titleBelt(f, DRAGON_TITLE_BELT),
```

Then remove any import that the deletion left unused (check `arcY` with `Select-String -Path foodbytes-app\client\src\components\pet\dragon\dragonWardrobe.js -Pattern "arcY\("`).

- [x] **Step 4: Verify**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`

### Task 13: Robot Marquee belt → title belt ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/robot/robotWardrobe.js` (import, `'champion-belt'` entry, new exported `ROBOT_TITLE_BELT`)

- [x] **Step 1: Import the drawer and add the robot style**

Add `titleBelt` to the `../pip/wardrobeShapes.js` import. Above `TORSO`:

```js
const STAR_BADGE = [[0, -2], [-1, -1], [0, -1], [1, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [1, 1], [-1, 2], [1, 2]]

/** The robot's Marquee belt: the shared gold title belt; its jewels are chasing LEDs and the crest is a pixel star. */
export const ROBOT_TITLE_BELT = {
  ink: RI, strap: '#11161d', metal: '#e8c34a', dark: '#a8841c', light: '#fff4c0', jewel: RB.accent, jewel2: RB.glow, leds: true,
  crest: (x, y, r, ink) => [circle(x, y, r, { fill: RB.dark, stroke: ink, strokeWidth: 1.2 }), ...pxCells(STAR_BADGE, x, y, r * 0.38, RB.accent)]
}
```

- [x] **Step 2: Switch the Marquee belt**

Replace the whole `// Marquee belt: LEDs chase round` entry with:

```js
  // Marquee belt: the gold title belt; its jewels chase like marquee LEDs
  'champion-belt': (f) => titleBelt(f, ROBOT_TITLE_BELT),
```

If `STAR_CELLS` has no remaining users, delete it (`Select-String -Path foodbytes-app\client\src\components\pet\robot\robotWardrobe.js -Pattern "STAR_CELLS"` → only the declaration). Then remove any unused imports in the same way.

- [x] **Step 3: Verify**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`

### Task 14: The check pins the shared title belt ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs`

- [x] **Step 1: Import the styles and the drawer**

```js
import { titleBelt } from './wardrobeShapes.js'
import { HERB_TITLE_BELT } from '../herb/herbWardrobe.js'
import { DRAGON_TITLE_BELT } from '../dragon/dragonWardrobe.js'
import { ROBOT_TITLE_BELT } from '../robot/robotWardrobe.js'
```

- [x] **Step 2: Assert every Champion belt is the title belt**

Before the final `console.log`:

```js
// ---- Title belts (2026-11-16): every creature's Champion belt is the shared gold title belt, on every form ----
const TITLE_BELT_STYLE = { herb: HERB_TITLE_BELT, dragon: DRAGON_TITLE_BELT, robot: ROBOT_TITLE_BELT }
assert.deepEqual(Object.keys(TITLE_BELT_STYLE).sort(), [...LINES].sort(), 'one title-belt style per line')
for (const { line, form, where } of EACH) {
  const f = pipForm(line, form)
  const belt = torsoArt(line, 'champion-belt', f)
  assert.deepEqual({ clip: belt.clip, extra: belt.extra }, titleBelt(f, TITLE_BELT_STYLE[line]), `${where}: champion belt is the title belt`)
  assert.equal(belt.clip.length, 4, `${where}: strap, two gilt edges and stitching`)
  assertFinite(shapesOf(belt.extra), `${where}: title belt plates`)
}
```

- [x] **Step 3: Run**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`

---

## Phase 4 — Mockup sync

The mockups must match what ships (CLAUDE.md → Mockups). These are standalone HTML files with no build. Each task ends with a script syntax check, and the phase ends with the mockups agreeing with the client.

### Task 15: `pip-themed-lines.html` — robot antennas, champion title belts, names ✓

- Skill: none — static HTML mockup with no build; follows CLAUDE.md → Mockups

**Files:**
- Modify: `foodbytes-app/mockup/pip-themed-lines.html` (`ROBOT_WARDROBE.hat` ≈ :630-657, `pipFigure` hat step ≈ :913-919, `headBarTop` ≈ :944-950, `fitIssues` ≈ :1111 and :1118, the three `belt.champ` entries ≈ :722 / :826 / `HERB_WARDROBE.belt`, the `.fx` CSS block ≈ :66-90)

- [x] **Step 1: Replace the robot hats with the antennas**

Copy the five picked entries from `pip-robot-antennas.html` → `ANTENNAS` (`beanie[0]`, `cap[1]`, `chef-hat[0]`, `straw-hat[0]`, `top-hat[0]`) together with the helpers they use (`sock`, `rod`, `tube`, `glowSt`, `lit`, `wilt`). Make them `ROBOT_WARDROBE.hat` entries keyed by this file's ids: `beanie`, `cap`, `chef`, `sunhat`, `tophat`. Each entry is `{ label, note, crown: true, draw: (b, h, droop) => ({ top, svg }) }`.

- [x] **Step 2: Add one hat-drawing helper and route every call site through it**

Add next to `pipFigure`:

```js
/** A worn hat's { top, svg }: crown hats (the robot's antennas) draw from the head top and replace the crown. */
function hatDraw(line, id, f, droop = false) {
  const item = WARDROBE[line].hat[id];
  return item.crown ? item.draw(f.growTop, f.growthRise, droop) : item.draw(100, f.hat.y, f.hat.w);
}
```

In `pipFigure`, replace the hat step with:

```js
  let base = f.growTop, crownReplaced = false;
  if (outfit.hat) {
    const item = W.hat[outfit.hat], h = hatDraw(line, outfit.hat, f, droop);
    s += item.crown || item.straight ? h.svg : `<g transform="rotate(-7 100 ${f.hat.y})">${h.svg}</g>`;
    if (item.crown) crownReplaced = true; else base = Math.min(base, h.top + 4);
  }
  if (!crownReplaced) s += L.crown(fi, droop, base);
```

(delete the old `s += L.crown(fi, droop, base);`). In `headBarTop`, `fitIssues` (:1111) and the brim check (:1118), replace each `WARDROBE[line].hat[x].draw(100, f.hat.y, f.hat.w)` / `item.draw(100, f.hat.y, f.hat.w)` with `hatDraw(line, x, f)`. In `headBarTop`, only lift `base` when the hat is not a crown hat.

- [x] **Step 3: Add the four effect classes**

In the `.fx` CSS block add `.prop`, `.radar`, `.dangle`, `.boing` and the keyframes `prop`, `dangle`, `boing`, copied from `pip-robot-antennas.html` (its `<style>`).

- [x] **Step 4: Champion belts → title belts**

Copy `TITLE_STYLE` (`champ` + `crest` only) and `titleBelt` from the last `<script>` of `pip-title-belts.html` into this file before `HERB_WARDROBE`. Then set `HERB_WARDROBE.belt.champ`, `DRAGON_WARDROBE.belt.champ` and `ROBOT_WARDROBE.belt.champ` to `{ label: <unchanged label>, note: 'gold title belt', draw: (f) => titleBelt(<line>, 'champ', f) }`. Leave every `leather` entry as it is.

- [x] **Step 5: Labels and the contract note**

Robot hat labels become Prop-top, Radar bar, Toque charm, Boing spring, Neon bolt. In the header comment add `Updated 2026-11-16 (contract 2026-11-16-robot-pip-antennas): robot hats are antennas that replace the crown; every Champion belt is the gold title belt.`

- [x] **Step 6: Syntax-check the scripts**

Run: `cd foodbytes-app\mockup; node -e "const h=require('fs').readFileSync('pip-themed-lines.html','utf8'); for (const m of h.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Function(m[1]); console.log('syntax ok')"`
Expected: `syntax ok`

### Task 16: `pip-room-chrome.html` — robot names and the Antenna tab ✓

- Skill: none — static HTML mockup with no build; follows CLAUDE.md → Mockups

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-chrome.html:2643-2648` and `:2767`

- [x] **Step 1: Rename the robot hats**

Replace `robot: ['Cooling fan', 'Holo visor', 'Steam toque', 'Satellite dish', 'Neon top hat']` with `robot: ['Prop-top', 'Radar bar', 'Toque charm', 'Boing spring', 'Neon bolt']`.

- [x] **Step 2: The robot's Hat tab reads Antenna**

After the `WARDROBE_SLOTS` line add `const SLOT_LABELS = { robot: { Hat: 'Antenna' } }; // WARDROBE_SLOT_LABELS`. In the `slotTabs` template (≈:2767), render `${SLOT_LABELS[t.line]?.[s] ?? s}` instead of `${s}`.

- [x] **Step 3: Syntax-check**

Run: `cd foodbytes-app\mockup; node -e "const h=require('fs').readFileSync('pip-room-chrome.html','utf8'); for (const m of h.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Function(m[1]); console.log('syntax ok')"`
Expected: `syntax ok`

### Task 17: Mockup README ✓

- Skill: none — documentation

**Files:**
- Modify: `foodbytes-app/mockup/README.md`

- [x] **Step 1: Mark both mockups live and list the new one**

In the `pip-robot-antennas.html` row, replace `Not built.` with `Live from v<new version> (Task 18).` Add a row directly below it:

```
| `pip-title-belts.html` | **Approved 2026-11-16 (Champion only):** the Champion belt on every Pip is a gold title belt (strap, scalloped plate, jewels, per-creature crest, side plates); the Leather belt is unchanged. A copy of `pip-themed-lines.html` with the belt drawers overridden by its last script. Live from v<new version>. |
```

Also append `Robot hats are antennas and every Champion belt is a title belt from v<new version>.` to the `pip-themed-lines.html` row.

- [x] **Step 2: Confirm**

Run: `Select-String -Path foodbytes-app\mockup\README.md -Pattern "pip-title-belts.html"`
Expected: one hit.

---

## Phase 5 — Final verification

Version bump plus no-production-change sanity checks. The backend is untouched, so its suite is not run. Every client `check:*` script that reads Pip art runs instead.

### Task 18: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. There is no Jira key and this is not a bug fix, so bump **MINOR and reset PATCH**. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`. Put the same number into the README placeholders from Task 17.

- [x] **Step 2: Prepend the CHANGELOG line**

`<new version> — 2026-11-16-robot-pip-antennas: robot Pip hats become antennas (Prop-top, Radar bar, Toque charm, Boing spring, Neon bolt; Hat tab reads Antenna); every Champion belt is a gold title belt`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 19: Grep for stale names ✓

- Skill: none — verification

- [x] **Step 1: Old robot hat names are gone from the client and the synced mockups**

Run: `Select-String -Path foodbytes-app\client\src\*\*.js,foodbytes-app\client\src\*\*\*.js,foodbytes-app\client\src\*\*\*\*.js,foodbytes-app\mockup\pip-themed-lines.html,foodbytes-app\mockup\pip-room-chrome.html -Pattern "Cooling fan|Holo visor|Steam toque|Satellite dish|Neon top hat"`
Expected: zero hits. (`pip-robot-antennas.html` keeps them on purpose, in its "Now" column.)

- [x] **Step 2: Nothing still calls the old three-argument robot hats**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\robot\robotWardrobe.js -Pattern "const HATS|Marquee belt: LEDs|STAR_CELLS"`
Expected: zero hits (STAR_CELLS only if Task 13 found other users. If so, note it here).

### Task 20: All Pip checks ✓

- Skill: none — verification

- [x] **Step 1: Run every check that reads Pip art or themes**

Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run check:pip; npm run check:growth; npm run check:room; npm run check:themes`
Expected: `wardrobe checks passed`; the other scripts print their usual pass lines. `check:themes` prints the one known `default|text-secondary|bg-secondary` WARN plus `Themes OK: 3 themes, 189 contrast pairs`.

### Task 21: Production build ✓

- Skill: none — verification

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 22: Manual visual check — pending developer (see QA MANUAL VERIFICATION list)

- Skill: none — the developer's eyes; there is no frontend test runner

- [ ] **Step 1: Look at it in the running app**

Run `cd foodbytes-app\client; npm run dev` and a local backend with `PET_FREE_MODE=true` (CLAUDE.md → Running the backend locally). In the app:
1. Pick **Cyberpunk** in the account menu, open `/pet`, then Dress Pip. The first tab reads **Antenna**. Wear each of the five: the default antenna disappears and the item replaces it, animated. Cycle moods if a test hook exists, or set Low FX in the account menu: the animations stop.
2. Robot **Champion belt (Marquee belt)**: gold title belt, LEDs chase; stops under Low FX.
3. Switch to **Default** and **Parchment**: the Hat tab reads Hat, hats are unchanged, and the Champion belt / Hoard belt is the title belt with the leaf / shield crest. The Leather belt is unchanged on all three.
4. Check at 375px and 1280px widths that the Dress Pip cards crop the antennas and belts cleanly.

Expected: as described. Report anything off rather than ticking the box.

### Task 23: PR description ✓

- Skill: none — documentation

- [x] **Step 1: Write `pr-description.md` in this plan folder**

Include:
- A link to `plan.md` in this folder, and the two mockups (`pip-robot-antennas.html`, `pip-title-belts.html`).
- A summary: robot hats → antennas that replace the crown (`HAT_ANCHOR: 'crown'`, `replacesCrown`), Hat tab → Antenna on the robot, Champion belt → shared `titleBelt` on every Pip. Name the new version from Task 18.
- Migrations: none. The server is unchanged.
- Verification: output lines from Tasks 20–21 and the Task 22 outcome.
- Convention note: "A wardrobe can set `HAT_ANCHOR: 'crown'` to make its hats replace the line's crown. They then draw from `(x, growTop, growthRise, droop)`."
- A suggested commit subject: `2026-11-16-robot-pip-antennas: robot antennas + champion title belts`

---

## Self-review

**Spec coverage:**
- Five approved antennas incl. droop → Tasks 5, 6, 7.
- Crown replacement in the engine (`hatArt`, `dressLayers`, `PipFigure`) → Tasks 1, 2, 3.
- New effects stopped by Low FX / reduced motion / is-still → Task 5 (existing stop rules), Task 22.
- Robot item names → Task 8. Antenna slot label → Tasks 8, 9.
- Check: crown invariants, droop invariants → Task 4. Slot label → Task 8. Title belt → Task 14.
- Shared `titleBelt` + herb/dragon/robot Champion belts → Tasks 10–13.
- Mockup sync → Tasks 15, 16, 17.
- Version + CHANGELOG → Task 18.

**Placeholder scan:** No `TBD`, `TODO` or "implement later". `<new version>` is computed at apply time per the Task 18 rule, by design. Every step shows code or a `Run:` / `Expected:` pair.

**Type / name consistency:** `HAT_ANCHOR_CROWN` / `hatAnchor` / `HAT_ANCHOR: 'crown'` (Tasks 1, 4, 7); `replacesCrown` (Tasks 1, 2, 3, 4); `dressLayers(…, { droop })` (Tasks 2, 3, 4); `ROBOT_ANTENNAS` (Tasks 6, 7); `WARDROBE_SLOT_LABELS` / `wardrobeSlotLabel` (Tasks 8, 9); `titleBelt(f, style)` and `HERB_TITLE_BELT` / `DRAGON_TITLE_BELT` / `ROBOT_TITLE_BELT` (Tasks 10–14). Effect names `prop` / `radar` / `dangle` / `boing` match between Tasks 5 and 6 (`fxGroup('prop' | 'radar' | 'dangle' | 'boing')`). Every name matches `plan.md` → Data shapes.

**Phase boundary cleanliness:**
- Phase 1: no wardrobe opts in, so every Pip draws as before. The check and the build pass, and there are no forward references.
- Phase 2: the robot fully switched, with names, label, check and build green.
- Phase 3: each Champion belt switches independently, and the check stays green after each task.
- Phase 4: mockups only.
- Phase 5: bookkeeping and verification.
