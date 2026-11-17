# Tasks: Robot Pip screen faces

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-17

**Goal:** On the robot line, Smiley.exe, Heart eyes and Shades.gif become pixel faces the CRT screen displays (approved option B each), clipped to the glass and replacing the base face, with a channel-change flicker on swap, and the mockups in step.

**Spec:** `plan.md` in this folder. Visual source of truth: `foodbytes-app/mockup/pip-robot-screen-faces.html` (option B of each item).

---

## File map

**Created:**
- `foodbytes-app/client/src/components/pet/robot/robotScreenFaces.js` — pixel-bitmap screen renderer (`screenFace`) and the three approved faces.

**Modified:**
- `foodbytes-app/client/src/components/pet/robot/robotForms.js` — `screen` anchor on each form.
- `foodbytes-app/client/src/components/pet/robot/robotParts.jsx:11-15,99` — drop local `ROBOT_SCREEN`, read `f.screen`.
- `foodbytes-app/client/src/components/pet/robot/robotWardrobe.js` — header comment, GLASSES → screen faces, `REPLACES_FACE` adds `sunglasses`.
- `foodbytes-app/client/src/components/pet/pip/wardrobeArt.js:55-68` — pass `screen` to glasses drawers, report it.
- `foodbytes-app/client/src/components/pet/pip/wardrobeLayers.js` — `screen` in the dress result; dim screen faces when drooped.
- `foodbytes-app/client/src/components/pet/pip/PipFigure.jsx` — screen clip + channel-change group.
- `foodbytes-app/client/src/components/pet/pip/Pip.css` — `pixel-pulse`, `scroll-in`, `glint`, `tune` effects.
- `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs` — screen anchor rule + screen-face assertions.
- `foodbytes-app/mockup/pip-themed-lines.html` — robot glasses drawn as screen faces.
- `foodbytes-app/mockup/pip-robot-screen-faces.html` — approved picks recorded.
- `foodbytes-app/mockup/README.md` — screen-faces row marked approved.
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump.

**Deleted:** (none)

---

## Phase 1 — Screen anchor on the robot forms

Move the screen rect into the form data so plain-JS wardrobe code and the node checks can read it. Nothing draws differently yet, so the build and every check stay green.

### Task 1: Add `screen` to each ROBOT_FORMS entry ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/robot/robotForms.js`

- [x] **Step 1: Add the anchor after each form's `miniViewBox`**

Replace each `miniViewBox` line (keep its value) so it is followed by the screen; values are the current `ROBOT_SCREEN` in `robotParts.jsx`:

```js
    miniViewBox: '45 80 110 110',
    screen: { x: 67, y: 91, w: 66, h: 42, r: 9 } // the monitor's glass; screen-face items are drawn and clipped to it
```
```js
    miniViewBox: '30 52 140 140',
    screen: { x: 74, y: 72, w: 52, h: 38, r: 8 }
```
```js
    miniViewBox: '20 32 160 160',
    screen: { x: 79, y: 55, w: 42, h: 35, r: 7 }
```

- [x] **Step 2: Smoke-check the values**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {ROBOT_FORMS} from './src/components/pet/robot/robotForms.js'; console.log(JSON.stringify(ROBOT_FORMS.map(f => f.screen)))"`
Expected: `[{"x":67,"y":91,"w":66,"h":42,"r":9},{"x":74,"y":72,"w":52,"h":38,"r":8},{"x":79,"y":55,"w":42,"h":35,"r":7}]`

### Task 2: RobotDetails reads the screen from the form ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/robot/robotParts.jsx:5-15,99`

- [x] **Step 1: Delete the local table and read `f.screen`**

Delete the `const ROBOT_SCREEN = [ … ]` block (lines 11-15) and change the comment on line 5 to `// The monitor head per form (index = form - 1), in the unscaled 200-unit space. The screen is the form's \`screen\` anchor (robotForms.js).`
In `RobotDetails`, replace `const sc = ROBOT_SCREEN[form - 1] ?? ROBOT_SCREEN[0]` with `const sc = f.screen`.

- [x] **Step 2: Confirm no other reference remains**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\robot\*.jsx,foodbytes-app\client\src\components\pet\robot\*.js -Pattern "ROBOT_SCREEN"`
Expected: zero hits.

- [x] **Step 3: Build and run the checks that touch the robot**

Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run check:room; npm run build`
Expected: `wardrobe checks passed`, the room checks' pass lines, and `built in <n>s`.

---

## Phase 2 — Screen faces

Add the renderer, swap the robot's three glasses to it, carry the screen through the wardrobe pipeline into PipFigure, add the effects, and tighten the checks. The phase ends with `check:wardrobe` and the build green.

### Task 3: Create the screen-face renderer and the three faces ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/robot/robotScreenFaces.js`

- [x] **Step 1: Write the module (bitmaps copied from the approved mockup, option B)**

```js
import { fxGroup, group, path, rect } from '../pip/wardrobeShapes.js'
import { RB } from './robotForms.js'

/**
 * The robot's screen faces (approved 2026-11-17, mockup/pip-robot-screen-faces.html, option B for every item).
 * A face is same-sized bitmap layers ('.' = pixel off) + a palette, drawn as pixels the CRT screen displays:
 * fitted to the form's `screen` anchor, centred, glowing, with the scanlines and glass sheen redrawn over it.
 * PipFigure clips it to the glass; the item replaces the base face (robotWardrobe REPLACES_FACE).
 * Every later robot face item must be one of these, never a shape on top of the face.
 */

/** @typedef {{ rows: string[], effect?: string }} ScreenLayer  effect = a pip-fx--* name in Pip.css */
/** @typedef {{ layers: ScreenLayer[], palette: Object<string, string>, glow: string, bg?: string }} ScreenFace */

const SMILEY_DISC = [
  '....YYYYY....',
  '..YYYYYYYYY..',
  '.YYYYYYYYYYY.',
  '.YYYYYYYYYYY.',
  'YYYYYYYYYYYYY',
  'YYYYYYYYYYYYY',
  'YYYYYYYYYYYYY',
  '.YYYYYYYYYYY.',
  '.YYYYYYYYYYY.',
  '..YYYYYYYYY..',
  '....YYYYY....'
]
const BLANK13 = '.............'
const SMILEY_EYES = [BLANK13, BLANK13, BLANK13, '....E...E....', '....E...E....', BLANK13, BLANK13, BLANK13, BLANK13, BLANK13, BLANK13]
const SMILEY_MOUTH = [BLANK13, BLANK13, BLANK13, BLANK13, BLANK13, BLANK13, '...M.....M...', '....MMMMM....', BLANK13, BLANK13, BLANK13]

const HEART = ['.HH.HH.', 'HWHHHHH', 'HHHHHHH', '.HHHHH.', '..HHH..', '...H...']
const BLANK7 = '.......'
const BLANK15 = '...............'
const HEARTS_LEFT = [...HEART.map(r => `${r}.${BLANK7}`), BLANK15, BLANK15, BLANK15]
const HEARTS_RIGHT = [...HEART.map(r => `${BLANK7}.${r}`), BLANK15, BLANK15, BLANK15]
const HEARTS_MOUTH = [BLANK15, BLANK15, BLANK15, BLANK15, BLANK15, BLANK15, BLANK15, '....M.....M....', '.....MMMMM.....']

const BLANK17 = '.................'
const SHADES_FRAME = [
  'GGGGGGGGGGGGGGGGG',
  'GggggggG.GggggggG',
  'GggggggG.GggggggG',
  '.GggggG...GggggG.',
  '..GGGG.....GGGG..',
  BLANK17, BLANK17, BLANK17
]
const SHADES_MOUTH = [BLANK17, BLANK17, BLANK17, BLANK17, BLANK17, BLANK17, '............M....', '.......MMMMM.....']
const SHADES_GLINT = [BLANK17, '..W........W.....', '.W........W......', BLANK17, BLANK17, BLANK17, BLANK17, BLANK17]

/** Keep only the bitmap's edge (a lit cell with an off or missing 4-neighbour), painted `ch`. */
function edgeOf(rows, ch) {
  const on = (i, j) => Boolean(rows[j]?.[i]) && rows[j][i] !== '.'
  return rows.map((row, j) => [...row].map((c, i) =>
    (c !== '.' && (!on(i - 1, j) || !on(i + 1, j) || !on(i, j - 1) || !on(i, j + 1)) ? ch : '.')).join(''))
}

/** Smiley.exe — a glowing cyan outline smiley in the screen's own colour; the eyes blink. */
export const SMILEY_OUTLINE = {
  layers: [{ rows: edgeOf(SMILEY_DISC, 'C') }, { rows: SMILEY_MOUTH }, { rows: SMILEY_EYES, effect: 'blink' }],
  palette: { C: RB.glow, E: RB.glow, M: RB.glow },
  glow: RB.glow
}

/** Heart eyes — all-cyan pixel hearts that pulse, with a smile. */
export const HEARTS_CYAN = {
  layers: [{ rows: HEARTS_LEFT, effect: 'pixel-pulse' }, { rows: HEARTS_RIGHT, effect: 'pixel-pulse' }, { rows: HEARTS_MOUTH }],
  palette: { H: RB.glow, W: '#d9fbff', M: RB.glow },
  glow: RB.glow
}

/** Shades.gif — the screen lights cyan; the shades and smirk are dark pixels; the shades scroll in, then a glint. */
export const SHADES_LCD = {
  bg: RB.glow,
  layers: [{ rows: SHADES_MOUTH }, { rows: SHADES_FRAME, effect: 'scroll-in' }, { rows: SHADES_GLINT, effect: 'glint' }],
  palette: { G: RB.dark, g: RB.dark, M: RB.dark, W: '#e9fdff' },
  glow: RB.glow
}

/**
 * Shape descriptors for `face` on `screen` ({ x, y, w, h, r }), or [] when there is no screen.
 * The pixel size fits the bitmap inside the glass with a 4-unit margin, so every cell stays on the screen.
 */
export function screenFace(screen, face) {
  if (!screen) return []
  const { x, y, w, h } = screen
  const cols = face.layers[0].rows[0].length
  const rowCount = face.layers[0].rows.length
  const p = Math.min((w - 8) / cols, (h - 8) / rowCount)
  const x0 = x + w / 2 - (cols * p) / 2
  const y0 = y + h / 2 - (rowCount * p) / 2
  const cells = (rows) => rows.flatMap((row, j) => [...row].flatMap((c, i) =>
    (c === '.' ? [] : [rect(x0 + i * p, y0 + j * p, p + 0.06, p + 0.06, { fill: face.palette[c] })])))
  const lit = face.layers.map(l => (l.effect ? fxGroup(l.effect, cells(l.rows)) : group(cells(l.rows))))
  const shapes = face.bg ? [rect(x, y, w, h, { fill: face.bg, opacity: 0.92 })] : []
  shapes.push(group(lit, { style: { filter: `drop-shadow(0 0 ${(p * 0.7).toFixed(1)}px ${face.glow})` } }))
  for (let sy = y + 3; sy < y + h; sy += 3) {
    shapes.push(path(`M${x} ${sy} H${x + w}`, { stroke: RB.screen, strokeWidth: 0.9, opacity: face.bg ? 0.35 : 0.45 }))
  }
  shapes.push(path(`M${x + 4} ${y + 6} Q${x + w * 0.3} ${y + 2} ${x + w * 0.55} ${y + 3}`, { stroke: '#fff', strokeWidth: 1.6, fill: 'none', opacity: 0.18, strokeLinecap: 'round' }))
  return shapes
}
```

- [x] **Step 2: Smoke-check the renderer**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {screenFace,SMILEY_OUTLINE,HEARTS_CYAN,SHADES_LCD} from './src/components/pet/robot/robotScreenFaces.js'; const sc={x:74,y:72,w:52,h:38,r:8}; console.log([SMILEY_OUTLINE,HEARTS_CYAN,SHADES_LCD].map(f=>screenFace(sc,f).length).join(','), screenFace(null,SMILEY_OUTLINE).length)"`
Expected: `14,14,15 0` (one glow group + 12 scanlines + sheen; the LCD face adds its lit background; no screen → no shapes).

### Task 4: Robot glasses become screen faces ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/robot/robotWardrobe.js:1-53,247`

- [x] **Step 1: Replace the GLASSES block and its helpers**

Delete `HEART_CELLS`, `SMILE_CELLS` and the whole `const GLASSES = { … }` (lines 27-62, the three items) and insert:

```js
// ---- glasses: screen faces (approved 2026-11-17, mockup/pip-robot-screen-faces.html, option B each). Drawers get
// (L, R, y, s, screen) and read only the screen; every item replaces the base face and PipFigure clips it to the glass. ----

const GLASSES = {
  'round-specs': (L, R, y, s, screen) => screenFace(screen, SMILEY_OUTLINE), // Smiley.exe
  'heart-glasses': (L, R, y, s, screen) => screenFace(screen, HEARTS_CYAN), // Heart eyes
  sunglasses: (L, R, y, s, screen) => screenFace(screen, SHADES_LCD) // Shades.gif
}
```

Add `import { HEARTS_CYAN, SHADES_LCD, SMILEY_OUTLINE, screenFace } from './robotScreenFaces.js'`. In the header comment replace `Smiley.exe and\n * Heart eyes replace the screen face while worn (REPLACES_FACE).` with `The three glasses are\n * screen faces (robotScreenFaces.js) that replace the base face while worn (REPLACES_FACE).`

- [x] **Step 2: Update REPLACES_FACE and the GLASSES comment in ROBOT_WARDROBE**

```js
  GLASSES, // id → (L, R, y, s, screen) → shapes (screen faces)
  TORSO, // id → (f) → { clip, extra, back? }
  SHOES, // id → (root, tip) → shapes
  REPLACES_FACE: ['round-specs', 'heart-glasses', 'sunglasses'] // every robot face item is a screen face that replaces the base face
```

- [x] **Step 3: Drop imports that are now unused**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\robot\robotWardrobe.js -Pattern "\b(circle|ellipse|pxCells|glowOf)\("`
Expected: for each of `circle`, `ellipse`, `pxCells`, `glowOf` with zero hits, remove it from the import / delete the `glowOf` const. Then re-run and confirm every remaining imported helper has at least one call.

### Task 5: glassesArt passes the screen and reports it ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobeArt.js:55-68`

- [x] **Step 1: Replace `glassesArt`**

```js
/**
 * { shapes, replacesFace, hidesEye, staysAsleep, screen } on the two eye points (and the form's screen, for lines that
 * have one), or null for an id that isn't glasses. hidesEye ('L' or null) drops that eye from the face; staysAsleep keeps
 * the item on a sleeping Pip (a scar); screen is the glass a face-replacing item is clipped to (null otherwise).
 */
export function glassesArt(line, id, f) {
  const wardrobe = wardrobeOf(line)
  const draw = wardrobe.GLASSES[id]
  if (!draw) return null
  const replacesFace = wardrobe.REPLACES_FACE.includes(id)
  const screen = f.screen ?? null
  return {
    shapes: draw(PIP_FOOT_X - f.eyes.gap, PIP_FOOT_X + f.eyes.gap, f.eyes.y, f.eyes.s, screen),
    replacesFace,
    hidesEye: wardrobe.HIDES_EYE?.[id] ?? null,
    staysAsleep: Boolean(wardrobe.STAYS_ASLEEP?.includes(id)),
    screen: replacesFace ? screen : null
  }
}
```

### Task 6: dressLayers carries the screen and dims a drooped screen face ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobeLayers.js:1-50`

- [x] **Step 1: Import `group`, add the dim constant, return `screen`**

Add `import { group } from './wardrobeShapes.js'` and, after `HAT_TILT_DEG`:

```js
/** A screen face on a bored or wilted Pip dims like the base face (mockup pip-robot-screen-faces.html). */
export const SCREEN_FACE_DROOP_OPACITY = 0.55
```

In `dressLayers`, after `const glasses = …`:

```js
  const screen = glasses?.screen ?? null // the glass a screen face is clipped to; none asleep (the base face returns)
  const glassesShapes = glasses?.shapes ?? []
```

and in the returned object replace `glasses: glasses?.shapes ?? [],` with:

```js
    glasses: screen && droop ? [group(glassesShapes, { opacity: SCREEN_FACE_DROOP_OPACITY })] : glassesShapes,
    screen, // PipFigure clips the glasses to it and plays the channel change on face swaps
```

Add `screen: {x, y, w, h, r}|null` to the `@returns` JSDoc and append to the top comment: `A screen face (the robot) is clipped to the form's screen and dimmed when drooped.`

### Task 7: PipFigure clips screen faces and plays the channel change ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/PipFigure.jsx`

- [x] **Step 1: Add the clip, the face key and the tune wrapper**

Import `WARDROBE_SLOT` from `'../../../constants/pipWardrobe'`. After `const clipId = …` add:

```jsx
  const screenClipId = `${id}-screen`
```

After `const dress = …` add:

```jsx
  const faceKey = dress.replacesFace ? outfit[WARDROBE_SLOT.GLASSES] : 'base' // a new key remounts the face: the channel change plays
  const sc = dress.screen
```

In `<defs>` after the body clipPath add:

```jsx
        {sc && <clipPath id={screenClipId}><rect x={sc.x + 2} y={sc.y + 2} width={sc.w - 4} height={sc.h - 4} rx={sc.r - 2} /></clipPath>}
```

Replace the two lines `{!dress.replacesFace && <art.Face … />}` and `<PipOutfit shapes={dress.glasses} />` with:

```jsx
          {f.screen ? (
            <g key={faceKey} className="pip-fx pip-fx--tune">{faceLayer}</g>
          ) : faceLayer}
```

and define, just before `return`:

```jsx
  const faceLayer = (
    <>
      {!dress.replacesFace && <art.Face form={form} mood={mood} hideEye={dress.hideEye} />}
      {sc ? <g clipPath={`url(#${screenClipId})`}><PipOutfit shapes={dress.glasses} /></g> : <PipOutfit shapes={dress.glasses} />}
    </>
  )
```

Update the doc comment's layer list: `face (skipped while a screen-face item is worn; one eye dropped under a scar) → glasses (a screen face is clipped to the glass; on a line with a screen, face + glasses change channel when the face swaps)`.

- [x] **Step 2: Measure the file**

Run: `(Get-Content foodbytes-app\client\src\components\pet\pip\PipFigure.jsx | Measure-Object -Line).Lines`
Expected: under 100.

### Task 8: Pip.css effects ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/Pip.css:99-121`

- [x] **Step 1: Add the four effects after `.pip-fx--boing`**

```css
.pip-fx--pixel-pulse { animation: pip-fx-pulse 1s steps(2, jump-none) infinite; } /* screen hearts snap between two sizes */
.pip-fx--scroll-in { animation: pip-fx-scroll-in 3.4s steps(6, end) infinite; } /* screen shades scroll down from the glass's top edge */
.pip-fx--glint { animation: pip-fx-glint 3.4s steps(1) infinite; } /* shows (opacity 1) whenever animations are off */
.pip-fx--tune { animation: pip-fx-tune .45s ease-out 1 both; } /* CRT channel change when the robot's face swaps */
```

and after `@keyframes pip-fx-boing`:

```css
@keyframes pip-fx-scroll-in { 0% { transform: translateY(-120%); } 30%, 100% { transform: translateY(0); } }
@keyframes pip-fx-glint { 0%, 34% { opacity: 0; } 36%, 48% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes pip-fx-tune { 0%, 45% { transform: scale(1, .04); filter: brightness(3); } 100% { transform: scale(1, 1); filter: none; } }
```

The existing `body.lowfx .pip-fx`, `.is-still .pip-fx` and `prefers-reduced-motion` rules already stop all four.

### Task 9: wardrobe.check.mjs — screen anchor and screen-face assertions ✓ (Step 5 manual /pet check owed by the developer)

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs:66-112,103,305-322`

- [x] **Step 1: Judge robot face items on the screen anchor**

In the anchor loop's `elsewhere` map, add `screen: { x: 1, y: 1, w: 40, h: 30, r: 4 }` to `GLASSES` (glasses that aren't screen faces must ignore a screen), and add:

```js
    SCREEN: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, neck: f.neck + 7, side: f.side + 7, eyes: { ...f.eyes, gap: f.eyes.gap + 7, y: f.eyes.y + 7 }, feet: [] },
```

In `own` add:

```js
    SCREEN: { screen: f.screen && { ...f.screen, y: f.screen.y + 7 } },
```

and change the glasses branch to:

```js
    } else if (slot === 'GLASSES') {
      group = LINE_WARDROBE[line].REPLACES_FACE.includes(id) && f.screen ? 'SCREEN' : 'GLASSES' // a screen face reads only the screen
      draw = (g) => glassesArt(line, id, g)
      assertFinite(draw(f).shapes, where)
```

Add `'../robot/robotScreenFaces.js'` to the "No per-form branches" file list.

- [x] **Step 2: Add the screen-face block before the title-belt section**

```js
// ---- Robot screen faces (2026-11-17): every robot face item is pixels on the screen that replace the base face ----
assert.deepEqual(LINE_WARDROBE.robot.REPLACES_FACE, ['round-specs', 'heart-glasses', 'sunglasses'], 'every robot glasses item is a screen face')
for (const { line, form, where } of EACH) {
  const f = pipForm(line, form)
  for (const id of idsIn('GLASSES')) {
    const g = glassesArt(line, id, f)
    if (line !== 'robot') {
      assert.equal(g.screen, null, `${where} ${id}: only screen faces get a screen`)
      continue
    }
    const sc = f.screen
    assert.ok(sc, `${where}: robot forms need a screen anchor`)
    assert.equal(g.replacesFace, true, `${where} ${id}: replaces the base face`)
    assert.deepEqual(g.screen, sc, `${where} ${id}: clipped to the form's screen`)
    for (const r of shapesOf(g.shapes).filter(s => s.tag === 'rect')) {
      const inside = r.x >= sc.x - 0.01 && r.y >= sc.y - 0.01 && r.x + r.width <= sc.x + sc.w + 0.01 && r.y + r.height <= sc.y + sc.h + 0.01
      assert.ok(inside, `${where} ${id}: pixel at ${r.x},${r.y} is off the screen`)
    }
    assert.equal(dressLayers({ GLASSES: id }, line, form, { asleep: true }).screen, null, `${where} ${id}: asleep shows the base face`)
    assert.deepEqual(dressLayers({ GLASSES: id }, line, form).screen, sc, `${where} ${id}: dress carries the screen`)
    const dim = dressLayers({ GLASSES: id }, line, form, { droop: true }).glasses
    assert.equal(dim.length, 1, `${where} ${id}: drooped face is one dimmed group`)
    assert.equal(dim[0].opacity, SCREEN_FACE_DROOP_OPACITY, `${where} ${id}: drooped face dims`)
  }
}
```

Add `SCREEN_FACE_DROOP_OPACITY` to the `./wardrobeLayers.js` import.

- [x] **Step 3: Run the wardrobe checks**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`.

- [x] **Step 4: Run the other Pip checks and build**

Run: `cd foodbytes-app\client; npm run check:room; npm run check:growth; npm run build`
Expected: each check's pass line and `built in <n>s`.

- [ ] **Step 5: Manual check in the app**

Run the dev server (`cd foodbytes-app\client; npm run dev`, backend with `PET_FREE_MODE=true` per CLAUDE.md), switch theme to Cyberpunk, open `/pet` → Dress Pip → Glasses at 375px and 1280px wide.
Expected:
- Each card shows the face on the screen only; nothing outside the glass.
- Smiley.exe: cyan outline smiley that blinks.
- Heart eyes: cyan hearts that pulse.
- Shades.gif: lit cyan screen with dark shades that scroll in, then a glint.
- Wearing or removing an item flickers the screen (channel change). Bored dims the face. Asleep shows the base sleep face.
- Low FX stops every animation, and the glint stays visible.
Record what was and wasn't checked (no test runner exists).

---

## Phase 3 — Mockup sync

Bring the mockups in step with what shipped. HTML only, so the build is unaffected.

### Task 10: pip-themed-lines.html draws the robot screen faces ✓ (Step 2: headless screenshot checked; DevTools console check owed by the developer)

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-themed-lines.html:708-727,1021-1023`

- [x] **Step 1: Port the renderer and swap the three robot glasses**

Copy the string-building `screenFace(fi, face, clipId)`, `edgeOf`, `over` and the bitmaps from `pip-robot-screen-faces.html` into the script after `ROBOT_SCREEN` (line 453). Add the three option-B face objects (`label` stays `Smiley.exe` / `Heart eyes` / `Shades.gif`). Replace the three robot `glasses` entries with:

```js
    round: { label: 'Smiley.exe', note: 'a cyan outline smiley on the screen; blinks', replacesFace: true, screenFace: SMILEY_B },
    heart: { label: 'Heart eyes', note: 'cyan pixel hearts on the screen; pulse', replacesFace: true, screenFace: HEARTS_B },
    shades: { label: 'Shades.gif', note: 'the screen lights up; dark shades scroll in, then a glint', replacesFace: true, screenFace: SHADES_B },
```

In `pipFigure`, replace `if (glasses) s += glasses.draw(…)` with:

```js
  if (glasses) s += glasses.screenFace ? `<g${droop ? ' opacity=".55"' : ''}>${screenFace(fi, glasses.screenFace, `${id}s`)}</g>` : glasses.draw(100 - f.eyes.gap, 100 + f.eyes.gap, f.eyes.y, f.eyes.s);
```

Add `.pixel-pulse`, `.scroll-in`, `.glint` CSS classes (same keyframes as Pip.css) next to the existing `.pulse` / `.drop` rules. Update the Section 3 lede: *"The robot's glasses slot holds screen faces: all three are pixels on the screen and replace the face while worn."* Update the header comment with `Updated 2026-11-17 (contract 2026-11-17-robot-pip-screen-faces): robot glasses are screen faces.`

- [ ] **Step 2: Render and look**

Run: `& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --force-prefers-reduced-motion --window-size=1200,6000 --screenshot="$env:TEMP\themed-lines.png" "file:///E:/Webdesign/The-Pre-Aisle-Plan/foodbytes-app/mockup/pip-themed-lines.html"`
Expected: the screenshot is written. In Section 3, the robot column's Smiley.exe, Heart eyes and Shades.gif rows show the faces on the screen and no base face. The browser console has no errors: open the file in Chrome and check DevTools.

### Task 11: Record the approved picks ✓

- Skill: none — mockup bookkeeping

**Files:**
- Modify: `foodbytes-app/mockup/pip-robot-screen-faces.html`
- Modify: `foodbytes-app/mockup/README.md:15`

- [x] **Step 1: Pre-select the approved picks**

In `pip-robot-screen-faces.html`, add `const APPROVED = { 'round-specs': 'B', 'heart-glasses': 'B', sunglasses: 'B' };` and seed `picks` as `{ ...APPROVED, ...stored }`. Tag each approved option `approved · <kind>` (as `pip-robot-antennas.html` does). Change the header comment and the Your picks note to read `Approved 2026-11-17: Glowing outline, All cyan, LCD invert.`

- [x] **Step 2: Mark the README row approved**

Replace `**Proposal in review (2026-11-16)**` in the `pip-robot-screen-faces.html` row with `**Approved 2026-11-17** (option B each: Glowing outline, All cyan, LCD invert; all three replace the face)` and append `Live from v<new version> (contract 2026-11-17-robot-pip-screen-faces).` (use the version from Task 12).

- [x] **Step 3: Confirm**

Run: `Select-String -Path foodbytes-app\mockup\README.md -Pattern "Approved 2026-11-17"`
Expected: one hit.

---

## Phase 4 — Final verification

No production changes beyond the version bump.

### Task 12: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. There is no Jira key and this is not a bug fix, so bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry: `<new version> — 2026-11-17-robot-pip-screen-faces: robot Pip face items are pixels on the screen that replace the base face (Smiley.exe outline, cyan Heart eyes, LCD-invert Shades.gif); the screen changes channel when the face swaps`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 13: Grep for stale references ✓

- Skill: none — verification only

- [x] **Step 1: The old sticker art is gone**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\robot\*.js -Pattern "ffd84d|HEART_CELLS|SMILE_CELLS"`
Expected: zero hits.

- [x] **Step 2: No debug logging added**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\robot\*.js,foodbytes-app\client\src\components\pet\pip\*.js,foodbytes-app\client\src\components\pet\pip\*.jsx -Pattern "console\.(log|debug)"`
Expected: zero hits.

### Task 14: Every client check and the production build ✗ — check:themes FAILs on pre-existing Default folder-chip-text 4.36:1 (no styles touched by this contract; needs its own ticket). Build green.

- Skill: none — verification only

- [ ] **Step 1: Checks**

Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run check:room; npm run check:growth; npm run check:themes`
Expected: `wardrobe checks passed`, room and growth pass lines, and check:themes printing the one known WARN plus `Themes OK: 3 themes, 189 contrast pairs`.

- [x] **Step 2: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 15: Backend suite ✓

- Skill: none — verification only (only the pom version changed)

- [x] **Step 1: Clean test run**

Run: `cd foodbytes-app\foodbytes-api; mvn test` (with the JAVA_HOME / Maven PATH prefix from CLAUDE.md)
Expected: `BUILD SUCCESS`, 0 failures, 0 errors.

### Task 16: PR description ✓

- Skill: none — documentation

- [x] **Step 1: Write `pr-description.md` in this plan folder**

Include:
- A link to `plan.md`.
- A summary and the new version.
- "No migration".
- The verification results (checks, build, manual `/pet` check, and what wasn't checked).
- The convention note: *robot face items are screen bitmaps (`robotScreenFaces.js`) that replace the base face, never shapes on top*.
- Suggested commit subject: `robot-pip-screen-faces: robot face items are pixels on the screen`.

---

## Self-review

**Spec coverage:**
- Screen anchor in `robotForms.js`, robotParts reads it: Tasks 1, 2.
- Renderer + three option-B faces: Task 3.
- Robot glasses redrawn, `sunglasses` in `REPLACES_FACE`: Task 4.
- Glasses pipeline passes and reports the screen, dims when drooped: Tasks 5, 6.
- PipFigure clip + channel change: Task 7.
- Pip.css effects: Task 8.
- `wardrobe.check.mjs` screen anchor + screen-face assertions: Task 9.
- Mockup sync: Tasks 10, 11.
- Version bump: Task 12.

**Placeholder scan:** No TBD/TODO. Every step has code or a `Run:`/`Expected:`. Task 4 Step 1 names the exact four imports.

**Type / name consistency:** These names are used identically in every task:
- `screen` (form anchor, glassesArt and dressLayers field)
- `screenFace(screen, face)`
- `SMILEY_OUTLINE` / `HEARTS_CYAN` / `SHADES_LCD`
- `SCREEN_FACE_DROOP_OPACITY` (wardrobeLayers export, imported by the check)
- `screenClipId` and `faceKey` (PipFigure)
- effect names `pixel-pulse` / `scroll-in` / `glint` / `tune` (descriptors ↔ `.pip-fx--*` in Pip.css)

**Phase boundary cleanliness:**
- **Phase 1:** only moves data, with no visual change; checks and build stay green.
- **Phase 2:** lands renderer, pipeline, CSS and checks together, and ends with `check:wardrobe` and the build green.
- **Phase 3:** HTML only.
- **Phase 4:** verification plus the version bump.
