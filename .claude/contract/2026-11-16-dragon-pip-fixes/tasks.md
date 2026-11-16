# Tasks: Dragon Pip fixes — horns under hats, two new hats, Battle scar, whole-Pip cards

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-11-16

**Goal:** The dragon's horns stop floating above hats (each hat draws them over or under it; the Hatchling's shell always tucks under), the Horn cosy and Bird's nest become a Wizard's hat and a Jester's cap, the Battle scar takes the dragon's left eye in every mood, and every Pip's Dress Pip cards and lineup show the whole Pip without spilling.

**Spec:** `plan.md` in this folder. Approved mockup: `foodbytes-app/mockup/pip-dragon-fixes.html` (`APPROVED` const; geometry in `HATS.wizard`, `HATS.jester`, `SCAR_OPTIONS[0]`, `hatLayers`, `fitCrop`).

All `Run:` commands are PowerShell from the repo root `E:\Webdesign\The-Pre-Aisle-Plan`.

**Precondition:** the robot antenna contract (`.claude/contract/2026-11-16-robot-pip-antennas/`, v1.38.0) is in the working tree. Task 1 Step 1 verifies it.

---

## File map

**Created:**
- `foodbytes-app/client/src/components/pet/pip/cardFit.js` — `FIT_MARGIN`, `fitViewBox`, `slotFitViewBox` (whole-Pip crops for the Dress Pip cards and lineup).

**Modified:**
- `foodbytes-app/client/src/components/pet/pip/pipSpace.js` — `EYE_LEFT`.
- `foodbytes-app/client/src/components/pet/pip/wardrobeArt.js` — `CROWN_*` placements, `crownPlacement`, `hatArt` returns `crown`, `glassesArt` returns `hidesEye` / `staysAsleep`.
- `foodbytes-app/client/src/components/pet/pip/wardrobeLayers.js` — `crown`, `hideEye`, glasses that stay asleep, `growTop` rule; `slotCropViewBox` / `slotCrop` removed.
- `foodbytes-app/client/src/components/pet/pip/PipFigure.jsx` — `hideEye` into the face, crown before the hat when `under`.
- `foodbytes-app/client/src/components/pet/pip/sharedFace.jsx` — `hideEye`.
- `foodbytes-app/client/src/components/pet/dragon/dragonFaces.jsx` — `hideEye`.
- `foodbytes-app/client/src/components/pet/dragon/dragonForms.js` — Hatchling `crownUnderHats: true`.
- `foodbytes-app/client/src/components/pet/dragon/dragonWardrobe.js` — Wizard's hat, Jester's cap, scarred-shut Battle scar, `HAT_CROWN`, `HIDES_EYE`, `STAYS_ASLEEP`, header names.
- `foodbytes-app/client/src/constants/pipWardrobe.js` — dragon `beanie` / `straw-hat` names.
- `foodbytes-app/client/src/components/pet/room/WardrobeItemGrid.jsx` — `slotFitViewBox`.
- `foodbytes-app/client/src/components/pet/room/WardrobeLineup.jsx` — `fitViewBox`.
- `foodbytes-app/client/src/components/pet/room/WardrobeView.css` — `overflow: hidden` on card and lineup SVGs.
- `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs` — crown placement, scar, card fit, names.
- `foodbytes-app/mockup/pip-themed-lines.html` — dragon hats, scar, horn placement, whole-Pip card crop.
- `foodbytes-app/mockup/pip-room-chrome.html` — dragon hat names, card `overflow: hidden`.
- `foodbytes-app/mockup/README.md` — dragon fixes live.
- `foodbytes-app/client/package.json`, `foodbytes-app/foodbytes-api/pom.xml`, `CHANGELOG.md` — version bump.

**Deleted:** (none)

---

## Phase 1 — Crown placement and one-eye faces in the engine

Teach the shared wardrobe code about per-hat crown placement and about glasses that hide an eye and survive sleep, without any wardrobe opting in yet. At the end of this phase every Pip draws exactly as before (no wardrobe declares `HAT_CROWN`, `HIDES_EYE` or `STAYS_ASLEEP`; no form has `crownUnderHats`), `check:wardrobe` passes and the build is green.

### Task 1: `wardrobeArt` — crown placements and eye-hiding glasses ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/pipSpace.js`
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobeArt.js` (the `HAT_ANCHOR_CROWN` … `glassesArt` block)

- [x] **Step 1: Confirm the robot contract is in the tree**

Run: `Select-String -Path foodbytes-app\client\src\components\pet\pip\wardrobeArt.js -Pattern "HAT_ANCHOR_CROWN","replacesCrown: true"`
Expected: 2 hits. If 0, stop — this contract builds on v1.38.0.

- [x] **Step 2: Add the eye constant to `pipSpace.js`**

Append:

```js
// The viewer's-left eye (x = PIP_FOOT_X − eyes.gap): the one a Battle scar takes.
export const EYE_LEFT = 'L'
```

- [x] **Step 3: Replace the hat block in `wardrobeArt.js`**

Replace everything from `/** A wardrobe whose hats replace the line's crown (the robot's antennas) sets HAT_ANCHOR to this. */` down to the end of `glassesArt` with:

```js
/** A wardrobe whose hats replace the line's crown (the robot's antennas) sets HAT_ANCHOR to this. */
export const HAT_ANCHOR_CROWN = 'crown'

/** Where the line's crown (growth, horns, antenna) goes while a hat is worn. */
export const CROWN_LIFT = 'lift' // lifted to the hat top so it pokes through (the herb's basil)
export const CROWN_OVER = 'over' // stays on the head, drawn over the hat as if through holes (dragon horns)
export const CROWN_UNDER = 'under' // stays on the head, drawn behind the hat (dragon horns, the Hatchling's shell)
export const CROWN_REPLACE = 'replace' // the hat is the crown (the robot's antennas)

/** 'crown' when this line's hats replace its crown, otherwise null (hats sit on the hat anchor). */
export const hatAnchor = (line) => wardrobeOf(line).HAT_ANCHOR ?? null

/**
 * The crown placement for hat `id` on form `f`: antennas replace it; a form flagged crownUnderHats always
 * tucks it under; otherwise the wardrobe's HAT_CROWN map decides, defaulting to the lift every line had before.
 */
export function crownPlacement(line, id, f) {
  if (hatAnchor(line) === HAT_ANCHOR_CROWN) return CROWN_REPLACE
  if (f.crownUnderHats) return CROWN_UNDER
  return wardrobeOf(line).HAT_CROWN?.[id] ?? CROWN_LIFT
}

/**
 * { top, shapes, straight?, crown } on the head anchor, or null for an id that isn't a hat.
 * Crown-anchored hats draw from the head top (growTop) and the form's growthRise, and redraw when drooped.
 */
export function hatArt(line, id, f, { droop = false } = {}) {
  const draw = wardrobeOf(line).HATS[id]
  if (!draw) return null
  const crown = crownPlacement(line, id, f)
  if (crown === CROWN_REPLACE) {
    return { ...draw(PIP_FOOT_X, f.growTop, f.growthRise, droop), straight: true, crown }
  }
  return { ...draw(PIP_FOOT_X, f.hat.y, f.hat.w), crown }
}

/**
 * { shapes, replacesFace, hidesEye, staysAsleep } on the two eye points, or null for an id that isn't glasses.
 * hidesEye ('L' or null) drops that eye from the face; staysAsleep keeps the item on a sleeping Pip (a scar).
 */
export function glassesArt(line, id, f) {
  const wardrobe = wardrobeOf(line)
  const draw = wardrobe.GLASSES[id]
  if (!draw) return null
  return {
    shapes: draw(PIP_FOOT_X - f.eyes.gap, PIP_FOOT_X + f.eyes.gap, f.eyes.y, f.eyes.s),
    replacesFace: wardrobe.REPLACES_FACE.includes(id),
    hidesEye: wardrobe.HIDES_EYE?.[id] ?? null,
    staysAsleep: Boolean(wardrobe.STAYS_ASLEEP?.includes(id))
  }
}
```

- [x] **Step 4: Smoke-check the module**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {hatArt, glassesArt} from './src/components/pet/pip/wardrobeArt.js'; import {pipForm} from './src/components/pet/pip/lineForms.js'; console.log(hatArt('robot','cap',pipForm('robot',2)).crown, hatArt('dragon','cap',pipForm('dragon',2)).crown, hatArt('herb','cap',pipForm('herb',2)).crown, JSON.stringify(Object.keys(glassesArt('dragon','round-specs',pipForm('dragon',2)))))"`
Expected: `replace lift lift ["shapes","replacesFace","hidesEye","staysAsleep"]`

### Task 2: `dressLayers` — crown placement, hideEye, glasses that stay asleep ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobeLayers.js` (imports, header comment, `dressLayers` JSDoc + body)

- [x] **Step 1: Import the placements**

Change `import { glassesArt, hatArt, shoeArt, torsoArt } from './wardrobeArt.js'` to:

```js
import { CROWN_LIFT, CROWN_REPLACE, glassesArt, hatArt, shoeArt, torsoArt } from './wardrobeArt.js'
```

- [x] **Step 2: Update the header comment**

Replace the header's hat sentence, from `hat → [crown from growTop, lifted so it pokes through the hat — or skipped when the hat replaces the crown` through `(replacesCrown: the robot's antennas, drawn from growTop and redrawn when \`droop\`)].`, with:

```
 * hat → [crown, placed per hat (wardrobeArt crownPlacement): lifted to poke through the hat (lift), on the head over
 * the hat (over), on the head behind the hat (under, drawn before the hat), or skipped because the hat is the crown
 * (replace: the robot's antennas, drawn from growTop and redrawn when `droop`)]. Glasses that hide an eye (hideEye)
 * drop it from the face; glasses that stay asleep (a scar) are kept while Pip sleeps.
```

- [x] **Step 3: Update the JSDoc return shape**

In the `@returns` type, after `replacesCrown: boolean,` add `crown: string|null, hideEye: string|null,`.

- [x] **Step 4: Replace the body of `dressLayers`**

```js
export function dressLayers(outfit, line, form, { asleep = false, droop = false } = {}) {
  const worn = outfit ?? {}
  const f = pipForm(line, form)
  const torsoIds = TORSO_ORDER.map(slot => worn[slot]).filter(Boolean)
  const torso = torsoIds.map(id => torsoArt(line, id, f))
  const hat = worn[HAT] ? hatArt(line, worn[HAT], f, { droop }) : null
  const crown = hat?.crown ?? null
  const picked = worn[GLASSES] ? glassesArt(line, worn[GLASSES], f) : null
  const glasses = picked && (!asleep || picked.staysAsleep) ? picked : null // a scar stays on a sleeping Pip
  return {
    back: torso.flatMap(t => t.back), // drawn right after the line's Back (a cape)
    shoes: worn[SHOES] ? shoeArt(line, worn[SHOES], f) : [],
    clip: torso.flatMap(t => t.clip),
    extra: torso.flatMap(t => t.extra),
    glasses: glasses?.shapes ?? [],
    replacesFace: Boolean(glasses?.replacesFace), // a screen face: PipFigure skips the line's Face
    hideEye: glasses?.hidesEye ?? null, // a scar: the line's Face drops that eye
    crown, // where PipFigure draws the line's Crown (null = no hat)
    replacesCrown: crown === CROWN_REPLACE, // an antenna: PipFigure skips the line's Crown
    hat: hat && { shapes: hat.shapes, transform: hat.straight ? null : `rotate(${HAT_TILT_DEG} ${PIP_FOOT_X} ${f.hat.y})` },
    growTop: crown === CROWN_LIFT ? Math.min(f.growTop, hat.top + 4) : f.growTop,
    itemIds: [worn[SHOES], ...torsoIds, glasses ? worn[GLASSES] : null, worn[HAT]].filter(Boolean)
  }
}
```

- [x] **Step 5: Run the wardrobe check (nothing has opted in, so it still passes)**

Run: `cd foodbytes-app\client; npm run check:wardrobe`
Expected: `wardrobe checks passed`

### Task 3: Faces can drop the left eye ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/sharedFace.jsx` (imports, JSDoc, `SharedFace`)
- Modify: `foodbytes-app/client/src/components/pet/dragon/dragonFaces.jsx` (`DragonFace`, `SlitFace`)

- [x] **Step 1: `SharedFace` takes `hideEye`**

Add the import `import { EYE_LEFT } from './pipSpace'` and replace the JSDoc + `SharedFace` function (keep `Eye` and `Blush` as they are) with:

```jsx
/**
 * The round-eye mood faces every line shares (happy, bored, mischievous, asleep, content), drawn in the line's `ink`.
 * Reads only the eyes anchor (ey, gap, s). `hideEye` = EYE_LEFT drops the left eye (a scar covers it); brows, mouth and blush stay.
 */
export function SharedFace({ ey, gap, s, mood, ink, hideEye = null }) {
  const cx = CX
  const L = cx - gap
  const R = cx + gap
  const my = ey + 17 * s
  const showL = hideEye !== EYE_LEFT
  const eyes = (draw) => (showL ? [L, R] : [R]).map(x => <g key={x}>{draw(x)}</g>)
  const line = { stroke: ink, strokeWidth: 4 * s, strokeLinecap: 'round', fill: 'none' }
  switch (mood) {
    case PET_MOODS.HAPPY:
      return (
        <>
          {eyes(x => <path d={`M${x - 9 * s} ${ey + 2 * s} Q${x} ${ey - 11 * s} ${x + 9 * s} ${ey + 2 * s}`} {...line} />)}
          <path d={`M${cx - 10 * s} ${my - 3 * s} Q${cx} ${my + 15 * s} ${cx + 10 * s} ${my - 3 * s} Z`}
            fill={MOUTH} stroke={ink} strokeWidth={3 * s} strokeLinejoin="round" />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.8} />
        </>
      )
    case PET_MOODS.BORED:
      return (
        <>
          {eyes(x => (
            <>
              <path d={`M${x - 8 * s} ${ey} A${8 * s} ${8 * s} 0 0 0 ${x + 8 * s} ${ey} Z`} fill={ink} />
              <path d={`M${x - 10 * s} ${ey} L${x + 10 * s} ${ey}`} {...line} />
            </>
          ))}
          <path d={`M${cx - 7 * s} ${my + 2 * s} L${cx + 7 * s} ${my + 2 * s}`} {...line} />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.3} />
        </>
      )
    case PET_MOODS.MISCHIEVOUS:
      return (
        <>
          {eyes(x => <Eye x={x} ey={ey} s={s} dx={4 * s} ink={ink} />)}
          <path d={`M${L - 10 * s} ${ey - 13 * s} Q${L} ${ey - 15 * s} ${L + 10 * s} ${ey - 20 * s}`} {...line} />
          <path d={`M${R - 10 * s} ${ey - 20 * s} Q${R} ${ey - 15 * s} ${R + 10 * s} ${ey - 13 * s}`} {...line} />
          <path d={`M${cx - 11 * s} ${my} Q${cx - 3 * s} ${my + 8 * s} ${cx + 3 * s} ${my + 1 * s} Q${cx + 8 * s} ${my - 3 * s} ${cx + 13 * s} ${my + 2 * s}`} {...line} />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.5} />
        </>
      )
    case PET_SLEEP_FACE:
      return (
        <>
          {eyes(x => <path d={`M${x - 9 * s} ${ey} Q${x} ${ey + 9 * s} ${x + 9 * s} ${ey}`} {...line} />)}
          <ellipse cx={cx} cy={my + 1 * s} rx={4 * s} ry={3.4 * s} fill={MOUTH} />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.5} />
        </>
      )
    default:
      return (
        <>
          {eyes(x => <Eye x={x} ey={ey} s={s} ink={ink} />)}
          <path d={`M${cx - 8 * s} ${my - 2 * s} Q${cx} ${my + 6 * s} ${cx + 8 * s} ${my - 2 * s}`} {...line} />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.55} />
        </>
      )
  }
}
```

(The bored case previously drew both lids in one path; splitting it per eye draws the same pixels.)

- [x] **Step 2: `DragonFace` and `SlitFace` take `hideEye`**

In `dragonFaces.jsx`, add `import { EYE_LEFT } from '../pip/pipSpace'`, then:
- Change the JSDoc to end with `` `hideEye` = EYE_LEFT drops the left eye (the Battle scar). `` and the signature to `export function DragonFace({ form, mood, hideEye = null })`.
- Change `return <SlitFace ey={ey} gap={gap} s={s} mischievous={mood === PET_MOODS.MISCHIEVOUS} />` to `return <SlitFace ey={ey} gap={gap} s={s} mischievous={mood === PET_MOODS.MISCHIEVOUS} hideEye={hideEye} />`.
- Change `<SharedFace ey={ey} gap={gap} s={s} mood={mood} ink={DRAGON_INK} />` to `<SharedFace ey={ey} gap={gap} s={s} mood={mood} ink={DRAGON_INK} hideEye={hideEye} />`.
- Change `function SlitFace({ ey, gap, s, mischievous })` to `function SlitFace({ ey, gap, s, mischievous, hideEye })`, and `{[L, R].map((x) => (` to `{(hideEye === EYE_LEFT ? [R] : [L, R]).map((x) => (`.

- [x] **Step 3: Build**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 4: `PipFigure` — hideEye and the crown under the hat ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/PipFigure.jsx` (imports, header comment, face/hat/crown lines)

- [x] **Step 1: Import the placement**

Add `import { CROWN_UNDER } from './wardrobeArt'` beside the other `./` imports.

- [x] **Step 2: Update the layer-order comment**

Replace `outline → extras → face (skipped while a screen-face item is worn) → glasses → hat → crown (skipped while an antenna is worn).` with:

```
 * outline → extras → face (skipped while a screen-face item is worn; one eye dropped under a scar) → glasses →
 * crown when it tucks under the hat → hat → crown otherwise (skipped while an antenna is worn).
```

- [x] **Step 3: Replace the face … crown lines**

Replace:

```jsx
          {!dress.replacesFace && <art.Face form={form} mood={mood} />}
          <PipOutfit shapes={dress.glasses} />
          {dress.hat && <g transform={dress.hat.transform ?? undefined}><PipOutfit shapes={dress.hat.shapes} /></g>}
          {!dress.replacesCrown && <art.Crown form={form} droop={droop} base={dress.growTop} />}
```

with:

```jsx
          {!dress.replacesFace && <art.Face form={form} mood={mood} hideEye={dress.hideEye} />}
          <PipOutfit shapes={dress.glasses} />
          {dress.crown === CROWN_UNDER && <art.Crown form={form} droop={droop} base={dress.growTop} />}
          {dress.hat && <g transform={dress.hat.transform ?? undefined}><PipOutfit shapes={dress.hat.shapes} /></g>}
          {!dress.replacesCrown && dress.crown !== CROWN_UNDER && <art.Crown form={form} droop={droop} base={dress.growTop} />}
```

- [x] **Step 4: Build and check**

Run: `cd foodbytes-app\client; npm run build; npm run check:wardrobe`
Expected: `built in <n>s`, then `wardrobe checks passed`.

---

## Phase 2 — The dragon opts in: new hats, horn placement, the scar

The dragon wardrobe declares its per-hat placements, eye-hiding scar and new hats; the Hatchling's form tucks its shell under. The check is updated in the same phase so the phase ends green.

### Task 5: Hatchling tucks its shell under hats ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/dragon/dragonForms.js` (Hatchling entry, header comment)

- [x] **Step 1: Add the flag**

In the Hatchling entry, change `growTop: 92, crownTop: 89, growthRise: 12,` to `growTop: 92, crownTop: 89, growthRise: 12, crownUnderHats: true,`. Append to the header comment: `` `crownUnderHats` (Hatchling): its shell cap always tucks under a hat (wardrobeArt crownPlacement). ``

### Task 6: Dragon wardrobe — Wizard's hat, Jester's cap, the scar, placements ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/dragon/dragonWardrobe.js` (header comment, `HATS.beanie`, `HATS['straw-hat']`, `GLASSES['round-specs']`, `DRAGON_WARDROBE`)

- [x] **Step 1: Update the header names**

In the header comment change `beanie Horn cosy` to `beanie Wizard's hat` and `straw-hat Bird's nest` to `straw-hat Jester's cap`, and add a line: ` * Hats keep the horns on the head (HAT_CROWN: over = through holes, under = behind); the Battle scar takes the left eye (HIDES_EYE) and stays asleep.`

- [x] **Step 2: Add a star helper after `const DI = DRAGON_INK`**

```js
// A four-point star (Wizard's hat), centred on (cx, cy) with radius r.
const star = (cx, cy, r, fill) => path(`M${cx} ${cy - r} L${cx + r * 0.3} ${cy - r * 0.3} L${cx + r} ${cy} L${cx + r * 0.3} ${cy + r * 0.3} L${cx} ${cy + r} L${cx - r * 0.3} ${cy + r * 0.3} L${cx - r} ${cy} L${cx - r * 0.3} ${cy - r * 0.3} Z`, { fill })
```

- [x] **Step 3: Replace `beanie` (the whole `// Horn cosy: horns poke through` entry) with the Wizard's hat**

```js
  // Wizard's hat: a bent star-spangled cone; the tip star sparkles (inspired by game and storybook wizard hats)
  beanie: (x, y, w) => {
    const top = y - w * 1.05
    return {
      top,
      shapes: [
        path(`M${x - w * 0.36} ${y - 3} Q${x - w * 0.12} ${y - w * 0.55} ${x + w * 0.02} ${y - w * 0.9} Q${x + w * 0.14} ${top} ${x + w * 0.36} ${y - w * 0.86} Q${x + w * 0.16} ${y - w * 0.66} ${x + w * 0.36} ${y - 3} Z`, { fill: '#4b3a8c', stroke: DI, strokeWidth: 3.4, strokeLinejoin: 'round' }),
        path(`M${x - w * 0.3} ${y - w * 0.16} Q${x} ${y - w * 0.1} ${x + w * 0.32} ${y - w * 0.16}`, { stroke: '#d9a62e', strokeWidth: 5, fill: 'none' }),
        star(x - w * 0.08, y - w * 0.42, w * 0.07, '#ffd34d'),
        star(x + w * 0.14, y - w * 0.3, w * 0.05, '#ffd34d'),
        fxGroup('sparkle', [star(x + w * 0.36, y - w * 0.86, w * 0.07, '#fff3b0')]),
        ellipse(x, y - 2, w * 0.62, w * 0.12, { fill: '#5a479e', stroke: DI, strokeWidth: 3.2 })
      ]
    }
  },
```

- [x] **Step 4: Replace `'straw-hat'` (the whole `// Bird's nest: the egg wobbles` entry) with the Jester's cap**

```js
  // Jester's cap: two floppy points, the bells sway (inspired by game and fairy-tale jesters)
  'straw-hat': (x, y, w) => {
    const point = (dir, fill) => path(`M${x + dir * w * 0.45} ${y - 2} Q${x + dir * w * 0.5} ${y - w * 0.5} ${x + dir * w * 0.82} ${y - w * 0.32} Q${x + dir * w * 0.42} ${y - w * 0.72} ${x} ${y - w * 0.42} Z`, { fill, stroke: DI, strokeWidth: 3, strokeLinejoin: 'round' })
    const bell = (bx, by) => fxGroup('sway', [
      circle(bx, by, w * 0.07, { fill: '#f0c14b', stroke: DI, strokeWidth: 1.8 }),
      path(`M${bx - w * 0.03} ${by + w * 0.02} h${w * 0.06}`, { stroke: DI, strokeWidth: 1.2 })
    ])
    const rim = `M${x - w / 2} ${y - 4} Q${x} ${y + 3} ${x + w / 2} ${y - 4}`
    return {
      top: y - w * 0.62,
      shapes: [
        point(-1, '#b8323a'),
        point(1, '#e3b23c'),
        path(`M${x - w * 0.45} ${y - 2} Q${x} ${y - w * 0.62} ${x + w * 0.45} ${y - 2} Z`, { fill: '#2f6b4a', stroke: DI, strokeWidth: 3, strokeLinejoin: 'round' }),
        bell(x - w * 0.82, y - w * 0.28),
        bell(x + w * 0.82, y - w * 0.28),
        path(rim, { stroke: '#e3b23c', strokeWidth: 6, strokeLinecap: 'round', fill: 'none' }),
        path(rim, { stroke: DI, strokeWidth: 1.4, strokeDasharray: '3 4', fill: 'none' })
      ]
    }
  },
```

- [x] **Step 5: Replace the Battle scar**

Replace the `// Battle scar: claw marks over one eye` entry with:

```js
  // Battle scar: the left eye is scarred shut (HIDES_EYE drops it from the face) under three claw marks
  'round-specs': (L, R, y, s) => [
    path(`M${L - 8 * s} ${y + 1 * s} Q${L} ${y + 4 * s} ${L + 8 * s} ${y + 1 * s}`, { stroke: DI, strokeWidth: 3.4 * s, strokeLinecap: 'round', fill: 'none' }),
    ...[-4, 0, 4].flatMap(o => {
      const d = `M${L - 11 * s + o * s} ${y - 15 * s} L${L + 7 * s + o * s} ${y + 13 * s}`
      return [
        path(d, { stroke: '#b9485c', strokeWidth: 3.2 * s, strokeLinecap: 'round' }),
        path(d, { stroke: '#f2a3b0', strokeWidth: 1.1 * s, strokeLinecap: 'round' })
      ]
    })
  ],
```

Also change the glasses section comment `None replaces the dragon's face.` to `None replaces the dragon's face; the Battle scar takes one eye.`

- [x] **Step 6: Declare the placements, the hidden eye and the sleeping scar**

Add `import { EYE_LEFT } from '../pip/pipSpace.js'` (merge with the existing `PIP_FOOT_X` import: `import { EYE_LEFT, PIP_FOOT_X } from '../pip/pipSpace.js'`). Replace the `DRAGON_WARDROBE` export with:

```js
/** The dragon's wardrobe in the shape every line shares (pip/wardrobeArt.js dispatches on it). */
export const DRAGON_WARDROBE = {
  HATS, // id → (x, y, w) → { top, shapes, straight? }
  GLASSES, // id → (L, R, y, s) → shapes
  TORSO, // id → (f) → { clip, extra, back? }
  SHOES, // id → (root, tip) → shapes
  REPLACES_FACE: [], // the dragon keeps its own face under every item
  // Approved 2026-11-16 (mockup pip-dragon-fixes.html): horns over the hat (as if through holes) or tucked behind it.
  HAT_CROWN: { beanie: 'over', cap: 'over', 'chef-hat': 'under', 'straw-hat': 'over', 'top-hat': 'under' },
  HIDES_EYE: { 'round-specs': EYE_LEFT }, // the Battle scar takes the left eye
  STAYS_ASLEEP: ['round-specs'] // a scar doesn't come off at night
}
```

(The `'over'` / `'under'` literals equal `CROWN_OVER` / `CROWN_UNDER`; they stay literals because `wardrobeArt.js` imports this file, and importing back would make a cycle. Task 8 pins that every value is one of the two constants.)

- [x] **Step 7: Smoke-check**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {hatArt, glassesArt} from './src/components/pet/pip/wardrobeArt.js'; import {pipForm} from './src/components/pet/pip/lineForms.js'; const f=pipForm('dragon',2); console.log(['beanie','cap','chef-hat','straw-hat','top-hat'].map(id=>hatArt('dragon',id,f).crown).join(','), hatArt('dragon','cap',pipForm('dragon',1)).crown, glassesArt('dragon','round-specs',f).hidesEye, glassesArt('dragon','round-specs',f).staysAsleep)"`
Expected: `over,over,under,over,under under L true`

### Task 7: Dragon item names ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/constants/pipWardrobe.js:70`

- [x] **Step 1: Rename the two hats**

In `WARDROBE_ITEM_LABELS[PIP_LINE.DRAGON]`, change `beanie: 'Horn cosy'` to `beanie: "Wizard's hat"` and `'straw-hat': "Bird's nest"` to `'straw-hat': "Jester's cap"`.

### Task 8: The check pins crown placement, the scar and the names ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs` (imports, AC 3 layer block, a new block after the droop block, the helpers block)

- [x] **Step 1: Import the new names**

Change the `./wardrobeArt.js` import to:

```js
import {
  CROWN_LIFT, CROWN_OVER, CROWN_REPLACE, CROWN_UNDER, HAT_ANCHOR_CROWN, LINE_WARDROBE, drawnItemIds, glassesArt, hatAnchor, hatArt, shoeArt, torsoArt
} from './wardrobeArt.js'
```

and add `import { EYE_LEFT } from './pipSpace.js'` (merge with the existing `PIP_FOOT_Y` import: `import { EYE_LEFT, PIP_FOOT_Y } from './pipSpace.js'`).

- [x] **Step 2: Branch the AC 3 hat assertions on the placement**

Replace the `if (crownHats(line)) { … } else { … }` block inside `// ---- AC 3: layer order …` with:

```js
  if (crownHats(line)) {
    assert.equal(dress.hat.transform, null, `${where}: antennas stand straight`)
    assert.equal(dress.crown, CROWN_REPLACE, `${where}: an antenna replaces the crown`)
    assert.equal(dress.replacesCrown, true, `${where}: an antenna replaces the crown`)
    assert.equal(dress.growTop, f.growTop, `${where}: an antenna leaves growTop on the head`)
  } else {
    assert.match(dress.hat.transform, /^rotate\(-7 100 /, `${where}: hats tilt`)
    assert.equal(dress.replacesCrown, false, `${where}: a hat keeps the crown`)
    if (dress.crown === CROWN_LIFT) {
      assert.ok(dress.growTop <= f.growTop && dress.growTop <= hatArt(line, 'top-hat', f).top + 4, `${where}: growth pokes through the hat`)
    } else {
      assert.ok([CROWN_OVER, CROWN_UNDER].includes(dress.crown), `${where}: unknown crown placement ${dress.crown}`)
      assert.equal(dress.growTop, f.growTop, `${where}: horns stay on the head`)
    }
  }
```

- [x] **Step 3: Glasses that stay asleep**

Replace `assert.deepEqual(dressLayers(FULL, line, form, { asleep: true }).glasses, [], \`${where}: glasses hidden asleep\`)` with:

```js
  const scar = glassesArt(line, FULL.GLASSES, f).staysAsleep
  assert.deepEqual(dressLayers(FULL, line, form, { asleep: true }).glasses, scar ? dress.glasses : [], `${where}: glasses hidden asleep unless they stay asleep`)
```

- [x] **Step 4: Add a crown-placement and scar block after the `// ---- Antennas: droop …` block**

```js
// ---- Dragon fixes (2026-11-16): horns never float above a hat; the Battle scar takes the left eye ----
const DRAGON_PLACEMENT = { beanie: CROWN_OVER, cap: CROWN_OVER, 'chef-hat': CROWN_UNDER, 'straw-hat': CROWN_OVER, 'top-hat': CROWN_UNDER }
for (const { line, form, where } of EACH) {
  const f = pipForm(line, form)
  for (const id of idsIn('HAT')) {
    const { crown } = hatArt(line, id, f)
    const expected = crownHats(line) ? CROWN_REPLACE
      : f.crownUnderHats ? CROWN_UNDER
        : line === 'dragon' ? DRAGON_PLACEMENT[id] : CROWN_LIFT
    assert.equal(crown, expected, `${where} ${id}: crown placement`)
  }
  for (const id of idsIn('GLASSES')) {
    const g = glassesArt(line, id, f)
    const hides = line === 'dragon' && id === 'round-specs'
    assert.equal(g.hidesEye, hides ? EYE_LEFT : null, `${where} ${id}: hides an eye`)
    assert.equal(g.staysAsleep, hides, `${where} ${id}: stays asleep`)
    assert.equal(dressLayers({ GLASSES: id }, line, form, { asleep: true }).hideEye, hides ? EYE_LEFT : null, `${where} ${id}: eye hidden asleep`)
    assert.equal(dressLayers({ GLASSES: id }, line, form).hideEye, hides ? EYE_LEFT : null, `${where} ${id}: eye hidden awake`)
  }
}
Object.values(LINE_WARDROBE).forEach(w => Object.values(w.HAT_CROWN ?? {}).forEach(p => assert.ok([CROWN_OVER, CROWN_UNDER].includes(p), `HAT_CROWN value ${p}`)))
assert.equal(pipForm('dragon', 1).crownUnderHats, true, 'the Hatchling tucks its shell under hats')
```

- [x] **Step 5: Pin the new names**

After `assert.equal(wardrobeAnnouncement(['round-specs'], 'dragon'), '🎉 New outfit: Battle scar!')` add:

```js
assert.equal(wardrobeAnnouncement(['beanie'], 'dragon'), "🎉 New outfit: Wizard's hat!")
assert.equal(wardrobeAnnouncement(['straw-hat'], 'dragon'), "🎉 New outfit: Jester's cap!")
```

- [x] **Step 6: Run the check and build**

Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run build`
Expected: `wardrobe checks passed`, then `built in <n>s`.

---

## Phase 3 — Whole-Pip cards on every line

Replace the zoomed card crops with whole-Pip fits for the item cards and the lineup, and make the card SVGs clip. The check's crop block moves to the new functions in the same phase, so the phase ends green.

### Task 9: `cardFit.js` — whole-Pip viewBoxes ✓

- Skill: react-frontend

**Files:**
- Create: `foodbytes-app/client/src/components/pet/pip/cardFit.js`

- [x] **Step 1: Write the module**

```js
import { headBarTop } from './headBar.js'
import { pipForm } from './lineForms.js'
import { PIP_FOOT_Y } from './pipSpace.js'

/**
 * Dress Pip cards and the evolution lineup show the whole Pip (approved 2026-11-16, mockup pip-dragon-fixes.html, option B).
 * Start from the form's miniViewBox (already fitted to its wings, tail and feet) and grow it upward, square and
 * x-centred with its bottom fixed, until it clears the Pip's highest point (headBarTop: crown, growth or hat) plus a margin.
 * Lives apart from wardrobeLayers.js because headBar.js imports that file.
 */

export const FIT_MARGIN = 4

/** 'x y s s' in the figure's scaled space for `line` / `form` wearing `outfit` (null = bare). */
export function fitViewBox(line, form, outfit = null) {
  const f = pipForm(line, form)
  const [x0, y0, size0] = f.miniViewBox.split(' ').map(Number)
  const top = PIP_FOOT_Y + (headBarTop(line, form, outfit) - FIT_MARGIN - PIP_FOOT_Y) * f.scale
  const bottom = y0 + size0
  const size = Math.max(size0, bottom - top)
  const cx = x0 + size0 / 2
  return [cx - size / 2, bottom - size, size, size].map(n => Number(n.toFixed(1))).join(' ')
}

/** One viewBox for every card in a slot: the fit for its tallest item (or the bare form), so a row shares one scale. */
export function slotFitViewBox(slot, line, form, itemIds) {
  const outfits = [null, ...itemIds.map(id => ({ [slot]: id }))]
  const tallest = outfits.reduce((best, outfit) => (headBarTop(line, form, outfit) < headBarTop(line, form, best) ? outfit : best))
  return fitViewBox(line, form, tallest)
}
```

- [x] **Step 2: Smoke-check**

Run: `cd foodbytes-app\client; node --input-type=module -e "import {fitViewBox, slotFitViewBox} from './src/components/pet/pip/cardFit.js'; console.log(fitViewBox('dragon',2), '|', slotFitViewBox('HAT','dragon',2,['beanie','cap','chef-hat','straw-hat','top-hat']), '|', fitViewBox('robot',1))"`
Expected: three square viewBoxes (`x y s s` with the last two numbers equal); the dragon `HAT` box is taller (larger `s`, smaller `y`) than the bare dragon box; no `NaN`.

### Task 10: Cards and lineup use the fit; SVGs clip ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeItemGrid.jsx` (imports, first lines of `WardrobeItemGrid`, the items map)
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeLineup.jsx` (import, the `<Pip>` in the map)
- Modify: `foodbytes-app/client/src/components/pet/room/WardrobeView.css` (after `.pip-wardrobe-form .pip-herb`)
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobeLayers.js` (remove `slotCropViewBox`, `slotCrop`)

- [x] **Step 1: Item grid**

In `WardrobeItemGrid.jsx` replace `import { slotCropViewBox } from '../pip/wardrobeLayers'` with `import { slotFitViewBox } from '../pip/cardFit'`, change the doc comment's `cropped to the part of him it changes` to `shown whole, at one scale per slot (cardFit.js)`, and replace the first two lines of the component body plus the map source:

```jsx
function WardrobeItemGrid({ wardrobe, slot, line, form, onTap }) {
  const items = itemsInSlot(wardrobe, slot)
  const viewBox = slotFitViewBox(slot, line, form, items.map(item => item.id))
  const worn = wardrobe.outfit?.[slot] ?? null
```

and change `{itemsInSlot(wardrobe, slot).map(item => (` to `{items.map(item => (`.

- [x] **Step 2: Lineup**

In `WardrobeLineup.jsx` add `import { fitViewBox } from '../pip/cardFit'` and change `<Pip line={line} form={form} mood={PET_MOODS.CONTENT} variant="crop" outfit={outfit} still />` to `<Pip line={line} form={form} mood={PET_MOODS.CONTENT} variant="crop" viewBox={fitViewBox(line, form, outfit)} outfit={outfit} still />`.

- [x] **Step 3: Clip the card and lineup SVGs**

In `WardrobeView.css`, after the `.pip-wardrobe-form .pip-herb { … }` line, add:

```css
/* 2026-11-16: cards and lineup show the whole Pip (cardFit.js) and never spill into the next card. */
.pip-wardrobe-item .pip-herb,
.pip-wardrobe-form .pip-herb { overflow: hidden; }
```

- [x] **Step 4: Remove the old crop**

In `wardrobeLayers.js` delete `slotCropViewBox` (with its `/** AC 4: … */` comment) and the `slotCrop` helper. Keep `hatMiniViewBox`, `hatOnly` and `squareAround`.

- [x] **Step 5: Confirm no caller remains**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.mjs | Select-String -Pattern "slotCropViewBox|slotCrop\("`
Expected: hits only in `wardrobe.check.mjs` (fixed in Task 11).

### Task 11: The check pins the card fit ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/client/src/components/pet/pip/wardrobe.check.mjs` (imports, `// ---- AC 4 / AC 5: crops ----` block)

- [x] **Step 1: Imports**

Change `import { TORSO_ORDER, dressLayers, hatMiniViewBox, hatOnly, slotCropViewBox } from './wardrobeLayers.js'` to `import { TORSO_ORDER, dressLayers, hatMiniViewBox, hatOnly } from './wardrobeLayers.js'` and add `import { FIT_MARGIN, fitViewBox, slotFitViewBox } from './cardFit.js'`.

- [x] **Step 2: Replace the crop loop**

Replace the `for (const { line, form, where } of EACH) { for (const box of [...WARDROBE_SLOTS.map(…), hatMiniViewBox(line, form)]) { … } }` loop with:

```js
const square = (box, where) => {
  const n = box.split(' ').map(Number)
  assert.ok(n.length === 4 && n.every(Number.isFinite) && n[2] > 0 && n[2] === n[3], `${where}: bad crop ${box}`)
  return n
}
for (const { line, form, where } of EACH) {
  const f = pipForm(line, form)
  const [mx, my, ms] = f.miniViewBox.split(' ').map(Number)
  const scaled = (y) => PIP_FOOT_Y + (y - PIP_FOOT_Y) * f.scale
  square(hatMiniViewBox(line, form), `${where} footer`)
  for (const { key } of WARDROBE_SLOTS) {
    const ids = idsIn(key)
    const [x, y, s] = square(slotFitViewBox(key, line, form, ids), `${where} ${key} cards`)
    assert.ok(Math.abs(y + s - (my + ms)) < 0.2 && Math.abs(x + s / 2 - (mx + ms / 2)) < 0.2, `${where} ${key}: cards keep the form's feet and centre`)
    for (const outfit of [null, ...ids.map(id => ({ [key]: id }))]) {
      assert.ok(y <= scaled(headBarTop(line, form, outfit) - FIT_MARGIN) + 0.1, `${where} ${key} ${JSON.stringify(outfit)}: the card cuts off the top of Pip`)
    }
  }
  const [, ly] = square(fitViewBox(line, form, FULL), `${where} lineup`)
  assert.ok(ly <= scaled(headBarTop(line, form, FULL) - FIT_MARGIN) + 0.1, `${where}: the lineup cuts off the top of Pip`)
}
```

- [x] **Step 3: Run the check and build**

Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run build`
Expected: `wardrobe checks passed`, then `built in <n>s`.

- [x] **Step 4: Confirm the old crop is gone everywhere**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.mjs | Select-String -Pattern "slotCropViewBox|slotCrop\("`
Expected: zero hits.

---

## Phase 4 — Mockups in step

The mockups are the starting point for UI work and must match what ships (CLAUDE.md → Mockups). No production code changes.

### Task 12: `pip-themed-lines.html` — dragon hats, scar, horn placement, whole-Pip cards ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-themed-lines.html` (`DRAGON_WARDROBE.hat.beanie` ≈ :784, `.sunhat` ≈ :801, `.glasses.round` ≈ :816, `dragonFace` ≈ :404, `LINES.dragon.face` ≈ :965, `pipFigure` hat step ≈ :1006–1013, `headBarTop` ≈ :1037–1042, `slotZoom` ≈ :1222)

- [x] **Step 1: New hats**

Replace the `beanie: { label: 'Horn cosy', … } },` entry with `beanie: { label: "Wizard's hat", note: 'the tip star sparkles', crownMode: 'over', draw: … },` and the `sunhat: { label: "Bird's nest", … } },` entry with `sunhat: { label: "Jester's cap", note: 'the bells sway', crownMode: 'over', draw: … },`, where each `draw` is copied verbatim from `pip-dragon-fixes.html` → `HATS.wizard.draw` / `HATS.jester.draw` (also copy its `star` helper above `DRAGON_WARDROBE`). Add `crownMode: 'over'` to `cap`, and `crownMode: 'under'` to `chef` and `tophat`.

- [x] **Step 2: The scar**

Replace the `round: { label: 'Battle scar', … }` entry with:

```js
    round: { label: 'Battle scar', note: 'the left eye is scarred shut', hidesEye: 'L', staysAsleep: true, draw: (L, R, y, s) => `<path d="M${L - 8 * s} ${y + 1 * s} Q${L} ${y + 4 * s} ${L + 8 * s} ${y + 1 * s}" stroke="${DI}" stroke-width="${3.4 * s}" stroke-linecap="round" fill="none"/>` + [-4, 0, 4].map(o => { const d = `M${L - 11 * s + o * s} ${y - 15 * s} L${L + 7 * s + o * s} ${y + 13 * s}`;
      return `<path d="${d}" stroke="#b9485c" stroke-width="${3.2 * s}" stroke-linecap="round"/><path d="${d}" stroke="#f2a3b0" stroke-width="${1.1 * s}" stroke-linecap="round"/>`; }).join('') },
```

- [x] **Step 3: The dragon face drops an eye**

Replace `function dragonFace(f, mood) { … }` with `dragonFace(f, mood, { noL = false } = {})` copied verbatim from `pip-dragon-fixes.html` (it splits the eyes per side; `noL` drops the left one). Change `LINES.dragon.face` to `face: (f, fi, mood, opts) => dragonFace(f, mood, opts),`.

- [x] **Step 4: `pipFigure` — glasses asleep, face, crown placement**

Replace:

```js
  const glasses = outfit.glasses && mood !== 'sleep' ? W.glasses[outfit.glasses] : null;
  if (!glasses?.replacesFace) s += L.face(f, fi, mood);   // new flag: a screen face replaces the face while worn
```

with:

```js
  const picked = outfit.glasses ? W.glasses[outfit.glasses] : null;
  const glasses = picked && (mood !== 'sleep' || picked.staysAsleep) ? picked : null;   // a scar stays asleep
  if (!glasses?.replacesFace) s += L.face(f, fi, mood, { noL: glasses?.hidesEye === 'L' });
```

and replace the hat/crown block (`let base = f.growTop, crownReplaced = false;` … `if (!crownReplaced) s += L.crown(fi, droop, base);`) with:

```js
  let base = f.growTop, crownReplaced = false, crownAfter = true;
  if (outfit.hat) {
    const item = W.hat[outfit.hat], h = hatDraw(line, outfit.hat, f, droop);
    const mode = f.crownUnderHats ? 'under' : item.crownMode;           // wardrobeArt crownPlacement
    if (mode === 'under') { s += L.crown(fi, droop, base); crownAfter = false; }
    s += item.crown || item.straight ? h.svg : `<g transform="rotate(-7 100 ${f.hat.y})">${h.svg}</g>`;
    if (item.crown) crownReplaced = true; else if (!mode) base = Math.min(base, h.top + 4);
  }
  if (!crownReplaced && crownAfter) s += L.crown(fi, droop, base);
```

Add `crownUnderHats: true` to the Hatchling entry in `DRAGON_FORMS`.

- [x] **Step 5: `headBarTop` — no lift for placed crowns**

In `headBarTop`, change `if (!WARDROBE[line].hat[outfit.hat].crown) base = Math.min(base, top + 4);` to `const it = WARDROBE[line].hat[outfit.hat]; if (!it.crown && !it.crownMode && !f.crownUnderHats) base = Math.min(base, top + 4);`.

- [x] **Step 6: Whole-Pip card crop**

Replace `slotZoom` with a whole-Pip fit (mirrors `cardFit.js` `fitViewBox`), keeping its name and call site:

```js
/* The item card crop (mirrors cardFit.js fitViewBox): the whole Pip, the form's miniViewBox grown upward to clear the top. */
function slotZoom(line, fi, slot, outfit = {}) {
  const f = LINES[line].forms[fi], [x0, y0, s0] = f.miniViewBox.split(' ').map(Number);
  const top = 186 + (headBarTop(line, fi, outfit) - 4 - 186) * f.scale, bottom = y0 + s0, s = Math.max(s0, bottom - top);
  return `${(x0 + s0 / 2 - s / 2).toFixed(1)} ${(bottom - s).toFixed(1)} ${s.toFixed(1)} ${s.toFixed(1)}`;
}
```

and at its call site pass the outfit: `slotZoom(l, fi, slot, { [slot]: id })`.

- [x] **Step 7: Open it**

Manual: open `foodbytes-app/mockup/pip-themed-lines.html` in a browser. Expected: no console errors; the dragon column shows the Wizard's hat and Jester's cap with horns over them, the toque and Crown with horns tucked behind; the Battle scar shows a closed left eye; the zoomed cards show the whole Pip.

### Task 13: `pip-room-chrome.html` and the mockup README ✓

- Skill: react-frontend

**Files:**
- Modify: `foodbytes-app/mockup/pip-room-chrome.html:2647` and the `.pip-wardrobe-item .pip-herb` rule (≈ :2243)
- Modify: `foodbytes-app/mockup/README.md` (the `pip-dragon-fixes.html` row)

- [x] **Step 1: Dragon hat names**

Change `dragon: ['Horn cosy', "Bard's cap", 'Singed toque', "Bird's nest", 'Crown'],` to `dragon: ["Wizard's hat", "Bard's cap", 'Singed toque', "Jester's cap", 'Crown'],`.

- [x] **Step 2: Card clipping**

In the `.pip-wardrobe-item .pip-herb { … }` rule add `overflow: hidden;` (mirrors `WardrobeView.css`).

- [x] **Step 3: README**

In the `pip-dragon-fixes.html` row, replace `Not built yet.` with `Live from v<new version> (this contract).`, using the version from Task 14.

---

## Phase 5 — Final verification

No production changes beyond the version bump — only sanity checks that the cumulative work is clean.

### Task 14: Bump version + CHANGELOG ✓

- Skill: none — release bookkeeping per `CLAUDE.md` → Versioning & deploy verification

**Files:**
- Modify: `foodbytes-app/client/package.json` (`version`)
- Modify: `foodbytes-app/foodbytes-api/pom.xml` (project `<version>`)
- Modify: `CHANGELOG.md` (prepend one line)

- [x] **Step 1: Bump both manifests**

Read the current version from `foodbytes-app/client/package.json`. No Jira key and not a bug-only change (new item art and names) → bump MINOR and reset PATCH. Write the same new version into `package.json` → `version` and `pom.xml` → the `<version>` directly under `<artifactId>foodbytes-api</artifactId>`.

- [x] **Step 2: Prepend the CHANGELOG line**

Directly above the current top entry in `CHANGELOG.md`: `<new version> — 2026-11-16-dragon-pip-fixes: dragon horns stay on the head under hats (over/under per hat), Wizard's hat and Jester's cap replace the Horn cosy and Bird's nest, the Battle scar takes the left eye; Dress Pip cards show the whole Pip on every line`

- [x] **Step 3: Verify agreement**

Run: `cd foodbytes-app\client; npm run check:version`
Expected: `Version OK: <new version>`

### Task 15: Grep for stale names ✓

- Skill: none — verification only

- [x] **Step 1: No old dragon hat names in the client or the live mockups**

Run: `Get-ChildItem -Path foodbytes-app\client\src -Recurse -Include *.js,*.jsx,*.mjs | Select-String -Pattern "Horn cosy|Bird's nest"; Select-String -Path foodbytes-app\mockup\pip-themed-lines.html,foodbytes-app\mockup\pip-room-chrome.html -Pattern "Horn cosy|Bird's nest"`
Expected: zero hits (`pip-dragon-fixes.html` and `pip-title-belts.html` keep them as review history).

### Task 16: All Pip checks ✗ — check:themes FAIL folder-chip-text on folder-chip-bg (default) 4.36:1, introduced by the custom-recipe-folders contract (commit 4af2726), not this one; wardrobe/room/growth/pip checks pass

- Skill: none — verification only

- [x] **Step 1: Run every check that touches Pip art**

Run: `cd foodbytes-app\client; npm run check:wardrobe; npm run check:room; npm run check:growth; npm run check:pip; npm run check:themes`
Expected: `wardrobe checks passed`; the room, growth and pip checks pass; themes prints the one known WARN and `Themes OK: 3 themes, 189 contrast pairs`.

### Task 17: Production build ✓

- Skill: none — verification only

- [x] **Step 1: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors.

### Task 18: Manual visual check — pending developer (no browser in the pipeline)

- Skill: none — needs a browser and the developer's eye

- [ ] **Step 1: Dress Pip on a phone width, Parchment theme (dragon)**

Run the Vite dev server with the backend (CLAUDE.md → Running the backend locally; `PET_FREE_MODE` not needed for the wardrobe) and open `/pet` → Dress Pip at 375px width. Expected:
- Hat tab: every card shows the whole dragon; Wizard's hat / Bard's cap / Jester's cap have horns over the hat, Singed toque / Crown have horns tucked behind; a Hatchling's shell sits under every hat; nothing floats.
- Glasses tab: Battle scar shows a closed left eye with three claw marks; the stage keeps it in every mood and asleep.
- Jacket tab and the "Same outfit, every evolution" lineup: whole Pip, nothing spills into the row above.
- Repeat the Hat and Jacket tabs on Cyberpunk (robot) and Default (herb): whole Pip, no spill, robot antennas and herb growth unchanged.

### Task 19: PR description ✓

- Skill: none — documentation

- [x] **Step 1: Write `pr-description.md` in this plan folder**

Include: a link to `plan.md`; the summary (horn placement per hat, two new dragon hats, scar, whole-Pip cards on every line) and the new version from Task 14; "No migration, no server change"; the results of Tasks 15–18; a note for contributors: "A wardrobe can place its crown per hat with `HAT_CROWN` (`over` / `under`), hide an eye with `HIDES_EYE`, and keep an item on a sleeping Pip with `STAYS_ASLEEP`; Dress Pip crops come from `pip/cardFit.js`"; suggested commit subject `2026-11-16-dragon-pip-fixes: dragon horns, new hats, Battle scar, whole-Pip cards`.

---

## Self-review

**Spec coverage:**
- Per-hat crown placement (`HAT_CROWN`), default lift — Tasks 1, 2, 4, 6, 8.
- Hatchling `crownUnderHats` — Tasks 1, 5, 8.
- `dressLayers` placement + `PipFigure` order; head bar unaffected — Tasks 2, 4, 8 (head-bar assertions already in the check).
- Wizard's hat / Jester's cap art and names — Tasks 6, 7, 8.
- Battle scar (`hidesEye`, `staysAsleep`, faces, art) — Tasks 1, 2, 3, 4, 6, 8.
- Whole-Pip cards and lineup on every line, `overflow: hidden` — Tasks 9, 10, 11.
- Check updates — Tasks 8, 11.
- Mockup sync — Tasks 12, 13.
- Version bump + CHANGELOG — Task 14.

**Placeholder scan:** No `TBD`, `TODO`, `implement later` or "appropriate error handling". Every code step shows the code; every verification has `Run:` / `Expected:` or an explicit manual check.

**Type / name consistency:** `CROWN_LIFT` / `CROWN_OVER` / `CROWN_UNDER` / `CROWN_REPLACE`, `crownPlacement`, `crown`, `hideEye`, `hidesEye`, `staysAsleep`, `EYE_LEFT`, `crownUnderHats`, `HAT_CROWN`, `HIDES_EYE`, `STAYS_ASLEEP`, `FIT_MARGIN`, `fitViewBox`, `slotFitViewBox` are spelled identically in plan.md Data shapes and every task. `replacesCrown` survives as a `dressLayers` boolean only (removed from `hatArt`), matching plan.md.

**Phase boundary cleanliness:**
- Phase 1: engine supports placements and eye-hiding with no opt-ins — every Pip draws as before; check and build green.
- Phase 2: the dragon opts in and the check is updated in the same phase — green.
- Phase 3: card fit replaces the crop and the check's crop block moves with it; `slotCropViewBox` has no callers — green.
- Phase 4: mockups only.
- Phase 5: bump and verification only.
