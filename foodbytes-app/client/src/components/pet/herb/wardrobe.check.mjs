// Run: npm run check:wardrobe   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so MPP-32's wardrobe geometry is pinned
// here (AC 7): every item renders on every one of the five forms, each item reads only its slot's
// anchors (no per-form branches), layer order and the hidden-asleep glasses follow AC 3, and an
// outfit gives the same items on every form, wilted or not. Mirrors room.check.mjs.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { HERB_FORMS, herbForm } from './herbForms.js'
import { DRAWN_ITEM_IDS, glassesArt, hatArt, shoeArt, torsoArt } from './wardrobeArt.js'
import { TORSO_ORDER, dressLayers, hatMiniViewBox, hatOnly, slotCropViewBox } from './wardrobeLayers.js'
import { WARDROBE_ITEMS, WARDROBE_SLOT, WARDROBE_SLOTS } from '../../../constants/pipWardrobe.js'
import {
  firstNewSlot, newItemIds, toggleTarget, wardrobeAnnouncement, withSlot, withSlotSeen
} from '../../../utils/pipWardrobe.js'

const FORMS = HERB_FORMS.map((_, i) => i + 1)
const IDS = [
  'beanie', 'cap', 'chef-hat', 'straw-hat', 'top-hat', 'round-specs', 'heart-glasses', 'sunglasses',
  'red-scarf', 'striped-scarf', 'chef-whites', 'denim-jacket', 'puffer', 'leather-belt', 'champion-belt',
  'jeans', 'joggers', 'dungarees', 'sneakers', 'wellies'
]
const idsIn = (slot) => IDS.filter(id => WARDROBE_ITEMS[id].slot === slot)

// Every number in a shape list (attributes and path data) must be finite.
function assertFinite(shapes, where) {
  assert.ok(shapes.length > 0, `${where}: no shapes`)
  for (const { tag, ...attrs } of shapes) {
    assert.ok(['path', 'circle', 'rect', 'ellipse'].includes(tag), `${where}: unknown tag ${tag}`)
    for (const value of Object.values(attrs)) {
      assert.doesNotMatch(String(value), /NaN|undefined|Infinity/, `${where}: ${value}`)
      const numbers = typeof value === 'number' ? [value] : String(value).match(/-?\d*\.?\d+(e-?\d+)?/g) ?? []
      numbers.forEach(n => assert.ok(Number.isFinite(Number(n)), `${where}: ${value} is not finite`))
    }
  }
}

// ---- AC 1: the 20 items, labelled, hinted and drawn, matching the server's WardrobeCatalogue ----
assert.deepEqual(Object.keys(WARDROBE_ITEMS), IDS)
assert.deepEqual([...DRAWN_ITEM_IDS].sort(), [...IDS].sort())
assert.deepEqual(WARDROBE_SLOTS.map(s => s.key), ['HAT', 'GLASSES', 'SCARF', 'JACKET', 'BELT', 'PANTS', 'SHOES'])
for (const id of IDS) {
  const item = WARDROBE_ITEMS[id]
  assert.ok(item.label && item.unlockHint, `${id} needs a label and an unlock hint`)
  assert.ok(Object.values(WARDROBE_SLOT).includes(item.slot), `${id} has an unknown slot`)
}
WARDROBE_SLOTS.forEach(({ key }) => assert.ok(idsIn(key).length > 0, `slot ${key} is empty`))

// ---- AC 3 / AC 7: every item on every form, drawn from its own anchors only ----
const moved = (f, patch) => ({ ...f, ...patch })
for (const form of FORMS) {
  const f = herbForm(form)
  const elsewhere = {
    HAT: { neck: f.neck + 7, waist: f.waist + 7, side: f.side + 7, eyes: { ...f.eyes, gap: f.eyes.gap + 7 }, feet: [] },
    GLASSES: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, neck: f.neck + 7, side: f.side + 7, feet: [] },
    TORSO: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, eyes: { ...f.eyes, gap: f.eyes.gap + 7 }, feet: [] },
    SHOES: { hat: { y: f.hat.y + 7, w: f.hat.w + 7 }, neck: f.neck + 7, eyes: { ...f.eyes, gap: f.eyes.gap + 7 } }
  }
  const own = {
    HAT: { hat: { y: f.hat.y + 7, w: f.hat.w } },
    GLASSES: { eyes: { ...f.eyes, gap: f.eyes.gap + 7 } },
    TORSO: { neck: f.neck - 7, waist: f.waist + 7 },
    SHOES: { feet: f.feet.map(([root, tip]) => [root, [tip[0] + 7, tip[1]]]) }
  }
  for (const id of IDS) {
    const slot = WARDROBE_ITEMS[id].slot
    const where = `${id} on form ${form}`
    let draw
    let group
    if (slot === 'HAT') {
      group = 'HAT'
      draw = (g) => hatArt(id, g)
      const hat = draw(f)
      assertFinite(hat.shapes, where)
      assert.ok(hat.top < f.hat.y, `${where}: the crown must rise above the brim`)
    } else if (slot === 'GLASSES') {
      group = 'GLASSES'
      draw = (g) => glassesArt(id, g)
      assertFinite(draw(f), where)
    } else if (slot === 'SHOES') {
      group = 'SHOES'
      draw = (g) => shoeArt(id, g)
      assertFinite(draw(f), where)
    } else {
      group = 'TORSO'
      draw = (g) => torsoArt(id, g)
      const torso = draw(f)
      assertFinite(torso.clip, where)
      if (slot === 'BELT' || slot === 'SCARF') assertFinite(torso.extra, `${where} (outside the clip)`)
    }
    assert.deepEqual(draw(moved(f, elsewhere[group])), draw(f), `${where}: depends on an anchor its slot doesn't use`)
    assert.notDeepEqual(draw(moved(f, own[group])), draw(f), `${where}: ignores its own anchor`)
  }
}

// No per-form branches anywhere in the wardrobe drawing.
for (const file of ['./wardrobeArt.js', './wardrobeLayers.js']) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
  assert.doesNotMatch(source, /PIP_FORMS|form\s*===?|===?\s*form\b|switch\s*\(\s*form|\.name\b/, `${file} branches on a form`)
}

// ---- AC 3: layer order, tilt, growth through the hat, glasses hidden asleep ----
const FULL = { HAT: 'top-hat', GLASSES: 'round-specs', SCARF: 'red-scarf', JACKET: 'denim-jacket', BELT: 'leather-belt', PANTS: 'dungarees', SHOES: 'wellies' }
assert.deepEqual(TORSO_ORDER, ['PANTS', 'JACKET', 'BELT', 'SCARF'])
for (const form of FORMS) {
  const f = herbForm(form)
  const dress = dressLayers(FULL, form)
  const expectedClip = TORSO_ORDER.flatMap(slot => torsoArt(FULL[slot], f).clip)
  const expectedExtra = TORSO_ORDER.flatMap(slot => torsoArt(FULL[slot], f).extra)
  assert.deepEqual(dress.clip, expectedClip, `form ${form}: clip is pants → jacket → belt → scarf`)
  assert.deepEqual(dress.extra, expectedExtra, `form ${form}: buckle then scarf tail`)
  assert.deepEqual(dress.shoes, shoeArt('wellies', f))
  assert.match(dress.hat.transform, /^rotate\(-7 100 /, `form ${form}: hats tilt`)
  assert.equal(dressLayers({ HAT: 'chef-hat' }, form).hat.transform, null, `form ${form}: the chef hat stays straight`)
  assert.ok(dress.growTop <= f.growTop && dress.growTop <= hatArt('top-hat', f).top + 4, `form ${form}: growth pokes through the hat`)
  assert.equal(dressLayers({}, form).growTop, f.growTop, `form ${form}: no hat leaves growth where it was`)
  assert.ok(dress.glasses.length > 0)
  assert.deepEqual(dressLayers(FULL, form, { asleep: true }).glasses, [], `form ${form}: glasses hidden asleep`)
  const empty = dressLayers(null, form)
  assert.deepEqual([empty.shoes, empty.clip, empty.extra, empty.glasses, empty.hat, empty.itemIds], [[], [], [], [], null, []])
}

// ---- AC 7: the same outfit on every form, and a wilt never touches it ----
const outfit = Object.freeze({ ...FULL })
const ids = FORMS.map(form => dressLayers(outfit, form).itemIds)
ids.forEach(list => assert.deepEqual(list, ['wellies', 'dungarees', 'denim-jacket', 'leather-belt', 'red-scarf', 'round-specs', 'top-hat']))
for (const form of FORMS) {
  assert.deepEqual(dressLayers(outfit, form, { wilted: true }), dressLayers(outfit, form), `form ${form}: wilt changes the outfit`)
}
assert.deepEqual(outfit, FULL, 'dressLayers must not mutate the outfit')

// ---- AC 4 / AC 5: crops ----
for (const form of FORMS) {
  for (const box of [...WARDROBE_SLOTS.map(({ key }) => slotCropViewBox(key, form)), hatMiniViewBox(form)]) {
    const [, , w, h] = box.split(' ').map(Number)
    assert.ok(box.split(' ').map(Number).every(Number.isFinite) && w > 0 && w === h, `form ${form}: bad crop ${box}`)
  }
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
assert.equal(wardrobeAnnouncement(['wellies']), '🎉 New outfit: Wellies!')
assert.equal(wardrobeAnnouncement(['beanie', 'jeans']), '🎉 New outfit: Beanie! (+1 more)')
assert.equal(wardrobeAnnouncement(['jetpack']), null)

console.log('wardrobe checks passed')
