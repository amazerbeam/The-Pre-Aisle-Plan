// Run: npm run check:wardrobe   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so MPP-32's wardrobe geometry is pinned
// here (AC 7): every item renders on every form of every line (11 forms), each item reads only its
// slot's anchors (no per-form branches), layer order and the hidden-asleep glasses follow AC 3, and an
// outfit gives the same items on every form, wilted or not. Themed lines add the per-form fit
// invariants, the two new layers and the head bar on every non-final form. Mirrors room.check.mjs.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { headBarTop, headBarY, spokenLevelLabel } from './headBar.js'
import { LINE_FORMS, lineFormCount, pipForm } from './lineForms.js'
import { EYE_LEFT, PIP_FOOT_Y } from './pipSpace.js'
import {
  CROWN_LIFT, CROWN_OVER, CROWN_REPLACE, CROWN_UNDER, HAT_ANCHOR_CROWN, LINE_WARDROBE, drawnItemIds, glassesArt, hatAnchor, hatArt, footArt, torsoArt
} from './wardrobeArt.js'
import { titleBelt } from './wardrobeShapes.js'
import { HERB_TITLE_BELT } from '../herb/herbWardrobe.js'
import { DRAGON_TITLE_BELT } from '../dragon/dragonWardrobe.js'
import { ROBOT_TITLE_BELT } from '../robot/robotWardrobe.js'
import { SCREEN_FACE_DROOP_OPACITY, TORSO_ORDER, dressLayers, hatMiniViewBox, hatOnly } from './wardrobeLayers.js'
import { FIT_MARGIN, fitViewBox, slotFitViewBox } from './cardFit.js'
import { HEAD_BAR_GAP } from '../../../constants/pipGrowth.js'
import { PIP_LINE_COPY } from '../../../constants/pipLines.js'
import { WARDROBE_ITEMS, WARDROBE_SLOT, WARDROBE_SLOTS } from '../../../constants/pipWardrobe.js'
import {
  firstNewSlot, newItemIds, toggleTarget, wardrobeAnnouncement, wardrobeItemLabel, wardrobeSlotLabel, withSlot, withSlotSeen
} from '../../../utils/pipWardrobe.js'

const LINES = Object.keys(LINE_FORMS)
const EACH = LINES.flatMap(line => LINE_FORMS[line].map((_, i) => ({ line, form: i + 1, where: `${line} form ${i + 1}` })))
const IDS = [
  'beanie', 'cap', 'chef-hat', 'straw-hat', 'top-hat', 'round-specs', 'heart-glasses', 'sunglasses',
  'red-scarf', 'striped-scarf', 'chef-whites', 'denim-jacket', 'puffer', 'leather-belt', 'champion-belt',
  'jeans', 'joggers', 'dungarees', 'sneakers', 'wellies'
]
const idsIn = (slot) => IDS.filter(id => WARDROBE_ITEMS[id].slot === slot)
const crownHats = (line) => hatAnchor(line) === HAT_ANCHOR_CROWN

// Every number in a shape list (attributes and path data) must be finite; a 'g' descriptor is checked through its children.
function assertFinite(shapes, where) {
  assert.ok(shapes.length > 0, `${where}: no shapes`)
  for (const { tag, children, ...attrs } of shapes) {
    assert.ok(['path', 'circle', 'rect', 'ellipse', 'g'].includes(tag), `${where}: unknown tag ${tag}`)
    if (tag === 'g') assertFinite(children ?? [], `${where} (group)`)
    for (const value of Object.values(attrs)) {
      if (typeof value === 'object') continue // a React style object (animationDelay, filter)
      assert.doesNotMatch(String(value), /NaN|undefined|Infinity/, `${where}: ${value}`)
      const numbers = typeof value === 'number' ? [value] : String(value).match(/-?\d*\.?\d+(e-?\d+)?/g) ?? []
      numbers.forEach(n => assert.ok(Number.isFinite(Number(n)), `${where}: ${value} is not finite`))
    }
  }
}

// ---- AC 1: the 20 items, labelled, hinted and drawn, matching the server's WardrobeCatalogue ----
assert.deepEqual(Object.keys(WARDROBE_ITEMS), IDS)
for (const line of LINES) assert.deepEqual([...drawnItemIds(line)].sort(), [...IDS].sort(), `${line}: draws all 20 items`)
assert.deepEqual(WARDROBE_SLOTS.map(s => s.key), ['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BELT', 'PANTS', 'SHOES'])
for (const id of IDS) {
  const item = WARDROBE_ITEMS[id]
  assert.ok(item.unlockHint, `${id} needs an unlock hint`)
  for (const line of LINES) assert.ok(wardrobeItemLabel(line, id), `${line} ${id} needs a name`)
  assert.ok(Object.values(WARDROBE_SLOT).includes(item.slot), `${id} has an unknown slot`)
}
WARDROBE_SLOTS.forEach(({ key }) => assert.ok(idsIn(key).length > 0, `slot ${key} is empty`))

// ---- AC 3 / AC 7: every item on every form, drawn from its own anchors only ----
const moved = (f, patch) => ({ ...f, ...patch })
for (const { line, form, where: at } of EACH) {
  const f = pipForm(line, form)
  const elsewhere = {
    HAT: { neck: f.neck + 7, waist: f.waist + 7, side: f.side + 7, eyes: { ...f.eyes, gap: f.eyes.gap + 7 }, feet: [] },
    GLASSES: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, neck: f.neck + 7, side: f.side + 7, screen: { x: 1, y: 1, w: 40, h: 30, r: 4 }, feet: [] }, // glasses that aren't screen faces ignore a screen
    SCREEN: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, neck: f.neck + 7, side: f.side + 7, eyes: { ...f.eyes, gap: f.eyes.gap + 7, y: f.eyes.y + 7 }, feet: [] },
    TORSO: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, eyes: { ...f.eyes, gap: f.eyes.gap + 7 }, feet: [] },
    SHOES: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, neck: f.neck + 7, eyes: { ...f.eyes, gap: f.eyes.gap + 7 } },
    CROWN: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, neck: f.neck + 7, waist: f.waist + 7, side: f.side + 7, eyes: { ...f.eyes, gap: f.eyes.gap + 7 }, feet: [] }
  }
  const own = {
    HAT: { hat: { y: f.hat.y + 7, w: f.hat.w } },
    GLASSES: { eyes: { ...f.eyes, gap: f.eyes.gap + 7 } },
    SCREEN: { screen: f.screen && { ...f.screen, y: f.screen.y + 7 } },
    TORSO: { neck: f.neck - 7, waist: f.waist + 7 },
    SHOES: { feet: f.feet.map(([root, tip]) => [root, [tip[0] + 7, tip[1]]]) },
    CROWN: { growTop: f.growTop + 7 }
  }
  for (const id of IDS) {
    const slot = WARDROBE_ITEMS[id].slot
    const where = `${id} on ${at}`
    let draw
    let group
    if (slot === 'HAT') {
      group = crownHats(line) ? 'CROWN' : 'HAT'
      draw = (g) => hatArt(line, id, g)
      const hat = draw(f)
      assertFinite(hat.shapes, where)
      assert.ok(hat.top < f.hat.y, `${where}: the crown must rise above the brim`)
    } else if (slot === 'GLASSES') {
      group = LINE_WARDROBE[line].REPLACES_FACE.includes(id) && f.screen ? 'SCREEN' : 'GLASSES' // a screen face reads only the screen
      draw = (g) => glassesArt(line, id, g)
      assertFinite(draw(f).shapes, where)
    } else if (slot === 'SHOES') {
      group = 'SHOES'
      draw = (g) => footArt(line, id, g)
      assertFinite(draw(f), where)
    } else {
      group = 'TORSO'
      draw = (g) => torsoArt(line, id, g)
      const torso = draw(f)
      assertFinite(torso.clip, where)
      if (slot === 'BELT' || slot === 'SCARF') assertFinite(torso.extra, `${where} (outside the clip)`)
    }
    assert.deepEqual(draw(moved(f, elsewhere[group])), draw(f), `${where}: depends on an anchor its slot doesn't use`)
    assert.notDeepEqual(draw(moved(f, own[group])), draw(f), `${where}: ignores its own anchor`)
  }
}

// No per-form branches anywhere in the wardrobe drawing.
for (const file of ['./wardrobeArt.js', './wardrobeLayers.js', './wardrobeShapes.js', '../herb/herbWardrobe.js', '../dragon/dragonWardrobe.js', '../robot/robotWardrobe.js', '../robot/robotAntennas.js', '../robot/robotScreenFaces.js']) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
  assert.doesNotMatch(source, /PIP_FORMS|form\s*===?|===?\s*form\b|switch\s*\(\s*form|\.name\b/, `${file} branches on a form`)
}

// ---- AC 3: layer order, tilt, growth through the hat, glasses hidden asleep ----
const FULL = { HAT: 'top-hat', GLASSES: 'round-specs', SCARF: 'red-scarf', JACKET: 'denim-jacket', BELT: 'leather-belt', PANTS: 'dungarees', SHOES: 'wellies' }
assert.deepEqual(TORSO_ORDER, ['PANTS', 'JACKET', 'BELT', 'SCARF'])
for (const { line, form, where } of EACH) {
  const f = pipForm(line, form)
  const dress = dressLayers(FULL, line, form)
  const expectedClip = TORSO_ORDER.flatMap(slot => torsoArt(line, FULL[slot], f).clip)
  const expectedExtra = TORSO_ORDER.flatMap(slot => torsoArt(line, FULL[slot], f).extra)
  assert.deepEqual(dress.clip, expectedClip, `${where}: clip is pants → jacket → belt → scarf`)
  assert.deepEqual(dress.extra, expectedExtra, `${where}: buckle then scarf tail`)
  assert.deepEqual(dress.feet, footArt(line, 'wellies', f))
  assert.equal(dressLayers({ HAT: 'chef-hat' }, line, form).hat.transform, null, `${where}: the chef hat stays straight`)
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
  assert.equal(dressLayers({}, line, form).growTop, f.growTop, `${where}: no hat leaves growth where it was`)
  assert.ok(dress.glasses.length > 0)
  const scar = glassesArt(line, FULL.GLASSES, f).staysAsleep
  assert.deepEqual(dressLayers(FULL, line, form, { asleep: true }).glasses, scar ? dress.glasses : [], `${where}: glasses hidden asleep unless they stay asleep`)
  const empty = dressLayers(null, line, form)
  assert.deepEqual([empty.back, empty.clip, empty.extra, empty.glasses, empty.hat, empty.itemIds], [[], [], [], [], null, []])
  assert.deepEqual(empty.feet, footArt(line, null, f), `${where}: no shoes = bare ball feet`)
  assert.equal(empty.feet.length, 2, `${where}: one bare foot per leg`)
  assert.deepEqual(footArt(line, 'no-such-shoe', f), empty.feet, `${where}: an unknown shoe falls back to bare feet`)
  assert.notDeepEqual(dress.feet, empty.feet, `${where}: a shoe replaces the bare foot`)
  assert.equal(dress.feet.length, 2, `${where}: a shoe is one group per foot`)
  const movedFeet = { ...f, feet: f.feet.map(([root, tip]) => [root, [tip[0] + 7, tip[1]]]) }
  assert.notDeepEqual(footArt(line, null, movedFeet), empty.feet, `${where}: bare feet follow the foot anchors`)
}

// ---- AC 7: the same outfit on every form, and a wilt never touches it ----
const outfit = Object.freeze({ ...FULL })
for (const line of LINES) {
  const forms = LINE_FORMS[line].map((_, i) => i + 1)
  const ids = forms.map(form => dressLayers(outfit, line, form).itemIds)
  ids.forEach(list => assert.deepEqual(list, ['wellies', 'dungarees', 'denim-jacket', 'leather-belt', 'red-scarf', 'round-specs', 'top-hat']))
  for (const form of forms) {
    assert.deepEqual(dressLayers(outfit, line, form, { wilted: true }), dressLayers(outfit, line, form), `${line} form ${form}: wilt changes the outfit`)
  }
}
assert.deepEqual(outfit, FULL, 'dressLayers must not mutate the outfit')

// ---- Antennas: droop redraws a crown-anchored hat and dims a screen face; nothing else changes ----
for (const { line, form, where } of EACH) {
  for (const id of IDS) {
    const slot = WARDROBE_ITEMS[id].slot
    const up = dressLayers({ [slot]: id }, line, form)
    const down = dressLayers({ [slot]: id }, line, form, { droop: true })
    if (slot === 'HAT' && crownHats(line)) {
      assert.notDeepEqual(down.hat.shapes, up.hat.shapes, `${where} ${id}: an antenna wilts`)
      assertFinite(down.hat.shapes, `${where} ${id} drooped`)
      assert.deepEqual({ ...down, hat: null }, { ...up, hat: null }, `${where} ${id}: droop only touches the antenna`)
    } else if (up.screen) {
      assert.deepEqual({ ...down, glasses: null }, { ...up, glasses: null }, `${where} ${id}: droop only dims a screen face`)
    } else {
      assert.deepEqual(down, up, `${where} ${id}: droop changes nothing`)
    }
  }
}

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

// ---- AC 4 / AC 5: crops ----
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
assert.deepEqual(hatOnly({ HAT: 'cap', SHOES: 'wellies' }), { HAT: 'cap' })
assert.deepEqual(hatOnly({ SHOES: 'wellies' }), {})
assert.deepEqual(hatOnly(null), {})

// ---- AC 4 / AC 6: wardrobe helpers ----
const wardrobe = {
  items: [
    { id: 'beanie', slot: 'HAT', owned: true, unseen: false },
    { id: 'wellies', slot: 'SHOES', owned: true, unseen: true },
    { id: 'cap', slot: 'HAT', owned: false, unseen: false },
    { id: 'jetpack', slot: 'HAT', owned: true, unseen: true }
  ],
  outfit: { HAT: 'beanie' }
}
assert.deepEqual(newItemIds(wardrobe), ['wellies'], 'unknown ids are skipped')
assert.equal(firstNewSlot(wardrobe), 'SHOES')
assert.equal(firstNewSlot(withSlotSeen(wardrobe, 'SHOES')), null)
assert.equal(toggleTarget(wardrobe.outfit, 'HAT', 'beanie'), null, 'tapping the worn item takes it off')
assert.equal(toggleTarget(wardrobe.outfit, 'HAT', 'cap'), 'cap')
assert.equal(toggleTarget(wardrobe.outfit, 'HAT', null), null, '"None" empties the slot')
assert.deepEqual(withSlot(wardrobe, 'HAT', null).outfit, {})
assert.deepEqual(withSlot(wardrobe, 'SHOES', 'wellies').outfit, { HAT: 'beanie', SHOES: 'wellies' })
assert.deepEqual(wardrobe.outfit, { HAT: 'beanie' }, 'withSlot must not mutate')
assert.equal(wardrobeAnnouncement(['wellies'], 'herb'), '🎉 New outfit: Wellies!')
assert.equal(wardrobeAnnouncement(['wellies'], 'robot'), '🎉 New outfit: Mag boots!')
assert.equal(wardrobeAnnouncement(['round-specs'], 'dragon'), '🎉 New outfit: Battle scar!')
assert.equal(wardrobeAnnouncement(['beanie'], 'dragon'), "🎉 New outfit: Wizard's hat!")
assert.equal(wardrobeAnnouncement(['straw-hat'], 'dragon'), "🎉 New outfit: Jester's cap!")
assert.equal(wardrobeAnnouncement(['beanie', 'jeans'], 'herb'), '🎉 New outfit: Beanie! (+1 more)')
assert.equal(wardrobeAnnouncement(['jetpack'], 'herb'), null)
assert.equal(wardrobeSlotLabel('robot', 'HAT'), 'Antenna')
assert.equal(wardrobeSlotLabel('herb', 'HAT'), 'Hat')
assert.equal(wardrobeSlotLabel('dragon', 'HAT'), 'Hat')
assert.equal(wardrobeSlotLabel('robot', 'BELT'), 'Belt')
assert.equal(wardrobeSlotLabel('mystery', 'SHOES'), 'Shoes')
assert.equal(wardrobeAnnouncement(['top-hat'], 'robot'), '🎉 New outfit: Neon bolt!')

// MPP-38 AC 5: the head bar clears every hat and the head growth on every non-final form of every line (the last form has no bar, AC 8).
for (const { line, form, where } of EACH.filter(({ line, form }) => form < lineFormCount(line))) {
  const f = pipForm(line, form)
  const k = f.scale
  const toScaled = (y) => PIP_FOOT_Y + (y - PIP_FOOT_Y) * k
  for (const hatId of [null, ...idsIn(WARDROBE_SLOT.HAT)]) {
    const outfit = hatId ? { [WARDROBE_SLOT.HAT]: hatId } : null
    const y = headBarY(line, form, outfit)
    assert.ok(Number.isFinite(y), `${where} ${hatId}: bar y is not finite`)
    assert.ok(y <= toScaled(f.crownTop) - HEAD_BAR_GAP + 1e-9, `${where} ${hatId}: bar overlaps the crown`)
    if (hatId) assert.ok(y <= toScaled(hatArt(line, hatId, f).top) - HEAD_BAR_GAP + 1e-9, `${where} ${hatId}: bar overlaps the hat`)
    if (f.growthRise > 0) {
      const growthTop = dressLayers(outfit, line, form).growTop - f.growthRise
      assert.ok(y <= toScaled(growthTop) - HEAD_BAR_GAP + 1e-9, `${where} ${hatId}: bar overlaps the head growth`)
    }
    assert.equal(headBarTop(line, form, outfit) <= f.crownTop, true)
  }
}
assert.equal(spokenLevelLabel('Basil seed · 6 / 15 → Seedling'), 'Basil seed, 6 of 15 to Seedling')

// ---- Themed lines: every form of every line carries the anchors in the order clothes need ----
const KEYS = ['name', 'scale', 'fill', 'body', 'hat', 'eyes', 'neck', 'waist', 'side', 'feet', 'growTop', 'crownTop', 'growthRise', 'miniViewBox']
for (const { line, form, where } of EACH) {
  const f = pipForm(line, form)
  KEYS.forEach(key => assert.ok(f[key] !== undefined, `${where}: missing ${key}`))
  const tipYs = f.feet.map(([, tip]) => tip[1])
  assert.equal(f.feet.length, 2, `${where}: two feet`)
  tipYs.forEach(y => assert.ok(y >= PIP_FOOT_Y - 2 && y <= PIP_FOOT_Y, `${where}: feet stand on the floor line`))
  assert.ok(f.crownTop <= f.hat.y, `${where}: crown above the brim`)
  assert.ok(f.growTop <= f.hat.y, `${where}: crown grows from above the brim`)
  assert.ok(f.hat.y < f.eyes.y && f.eyes.y < f.neck && f.neck < f.waist && f.waist < Math.min(...tipYs), `${where}: hat < eyes < neck < waist < feet`)
  assert.ok(f.eyes.gap * 2 < f.hat.w, `${where}: eyes sit under the brim`)
  assert.ok(f.eyes.gap + 8 * f.eyes.s < f.side, `${where}: eyes inside the head`)
  assert.ok(f.scale > 0 && f.side > 0 && f.hat.w > 0, `${where}: positive sizes`)
}
// An outfit put on at form 1 fits after every evolution: the same items, on forms that grow.
for (const line of LINES) {
  const scales = LINE_FORMS[line].map(f => f.scale)
  scales.slice(1).forEach((sc, i) => assert.ok(sc >= scales[i], `${line}: forms never get smaller`))
  assert.equal(Object.keys(PIP_LINE_COPY[line].formNames).length, lineFormCount(line), `${line}: one name per form`)
}

// ---- Themed lines: each creature draws all 20 items its own way; the two new layers stay in their slot ----
assert.deepEqual(Object.keys(LINE_WARDROBE).sort(), [...LINES].sort(), 'one wardrobe per line')
const shapesOf = (list) => list.flatMap(sh => (sh.tag === 'g' ? shapesOf(sh.children) : [sh]))
for (const { line, form, where } of EACH) {
  const f = pipForm(line, form)
  for (const id of IDS) {
    const slot = WARDROBE_ITEMS[id].slot
    if (slot !== 'GLASSES') assert.equal(dressLayers({ [slot]: id }, line, form).replacesFace, false, `${where} ${id}: only glasses may replace the face`)
    if (!['SCARF', 'JACKET', 'BELT', 'PANTS'].includes(slot)) assert.deepEqual(dressLayers({ [slot]: id }, line, form).back, [], `${where} ${id}: only torso items draw behind the body`)
  }
  for (const id of idsIn('GLASSES')) {
    assert.equal(dressLayers({ GLASSES: id }, line, form, { asleep: true }).replacesFace, false, `${where} ${id}: the face comes back asleep`)
    assertFinite(shapesOf(glassesArt(line, id, f).shapes), `${where} ${id}`)
  }
}

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

// Ball feet / shoes are their own layer, drawn after the torso extras (in front of the body) and before the face.
const figure = readFileSync(new URL('./PipFigure.jsx', import.meta.url), 'utf8')
assert.ok(!figure.includes('dress.shoes'), 'PipFigure: the shoes layer is now dress.feet')
assert.ok(figure.indexOf('shapes={dress.extra}') < figure.indexOf('shapes={dress.feet}'), 'PipFigure: feet after the torso extras')
assert.ok(figure.indexOf('shapes={dress.feet}') < figure.indexOf('{faceLayer}'), 'PipFigure: feet before the face')
for (const line of LINES) assert.equal(typeof LINE_WARDROBE[line].BARE_FOOT, 'function', `${line}: needs BARE_FOOT`)

console.log('wardrobe checks passed')
