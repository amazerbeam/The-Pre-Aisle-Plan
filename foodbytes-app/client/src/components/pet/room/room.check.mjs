// Run: npm run check:room   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-16 room projection,
// level normalisation and draw order are pinned here. Mirrors utils/petMood.check.mjs.
import assert from 'node:assert/strict'
import { P, pts, shade, boxFaces, ellipsePoints, cylinderSidePoints, ISO_C, ISO_S } from './iso.js'
import {
  ROOM_DRAW_ORDER, PIP_HOME, PIP_SCALE, PIP_COOKER_SPOT, PIP_BED_SCALE, PIP_BED_DROP, RUG, STATION_ANCHORS,
  COOK_WALK_OFFSET, cookPose, pipPose, resolveRoomLevels,
  STATION_SHIFT, DECOR_LEGACY_SHIFT, WINDOW_SHIFT, shiftPx, pipFocusPoint, WARDROBE_FOOTPRINT, wardrobeHitBox,
  FRIDGE_FOOTPRINT, FRIDGE_GAUGE_LIFT, FRIDGE_GAUGE_HALF_HEIGHT, fridgeHitBox, CABINET_FOOTPRINT, cabinetHitBox,
  stationThumbBox, COOKER_FOOTPRINT, BED_FOOTPRINT, decorSpotHitBox, decorThumbBox, hitBoxStyle
} from './roomLayout.js'
import { DEFAULT_ROOM_LEVELS, PIP_FOCUS_LIFT, ROOM_MAX_LEVEL, ROOM_SIZE, ROOM_WORLD } from '../../../constants/petRoom.js'
import {
  DECOR_ITEMS, DECOR_LAYERS, DECOR_SPOTS, DECOR_SPOT_LABELS, DECOR_SPOT_SHAPES, DEFAULT_FLOOR_STYLE, DEFAULT_PLACEMENTS, DEFAULT_RUG,
  DEFAULT_WALL_STYLE, ROOM_STYLES, SPOT_BUTTON_ORDER, STYLE_SPOTS
} from '../../../constants/petDecor.js'
import { catalogueFor, decorBoughtLine, hasDefault, ownedFor, withPlacement } from '../../../utils/roomPlacements.js'

const near = (actual, expected) =>
  actual.forEach((n, i) => assert.ok(Math.abs(n - expected[i]) < 1e-9, `[${actual}] is not [${expected}]`))

// AC 1 projection: back corner at (180, 180), slope 70/180, h lifts straight up.
near(P(0, 0), [180, 180])
near(P(0, 0, 50), [180, 130])
assert.ok(Math.abs(ISO_S / ISO_C - 70 / 180) < 1e-12)
near(P(193, 0), [180 - 193 * ISO_C, 180 + 193 * ISO_S]) // left wall runs down-left
near(P(0, 193), [180 + 193 * ISO_C, 180 + 193 * ISO_S]) // right wall runs down-right

// MPP-39: the bigger room (ROOM_SIZE) sits inside the world box the SVG and hit boxes are measured against.
const inWorld = ({ x, y, width = 0, height = 0 }) =>
  x >= ROOM_WORLD.x && y >= ROOM_WORLD.y && x + width <= ROOM_WORLD.x + ROOM_WORLD.width && y + height <= ROOM_WORLD.y + ROOM_WORLD.height
for (const u of [0, ROOM_SIZE.u]) for (const v of [0, ROOM_SIZE.v]) for (const h of [0, ROOM_SIZE.h]) {
  const [x, y] = P(u, v, h)
  assert.ok(inWorld({ x, y }), `room corner (${u}, ${v}, ${h}) is outside the world`)
}
assert.deepEqual([ROOM_SIZE.u, ROOM_SIZE.v, ROOM_SIZE.h], [260, 300, 150])

// MPP-39: a shift is one constant screen offset (P is linear).
near(shiftPx([30, 0]), [P(30, 0)[0] - 180, P(30, 0)[1] - 180])
near(shiftPx([0, 0, -30]), [0, 30])
assert.deepEqual(Object.keys(STATION_SHIFT).sort(), Object.keys(DEFAULT_ROOM_LEVELS).sort())

// MPP-39: every station, at every level and after its shift, stands on the floor and under the 150 wall.
const FOOTPRINTS = {
  bed: BED_FOOTPRINT, cooker: COOKER_FOOTPRINT, cabinet: CABINET_FOOTPRINT, wardrobe: WARDROBE_FOOTPRINT,
  fridge: FRIDGE_FOOTPRINT.map(([u, v, du, dv, h]) => [u, v, du, dv, 0, h])
}
for (const [station, table] of Object.entries(FOOTPRINTS)) {
  const [su, sv] = STATION_SHIFT[station]
  table.forEach(([u, v, du, dv, , h1], i) => {
    assert.ok(u + su >= 0 && u + du + su <= ROOM_SIZE.u, `${station} L${i + 1} leaves the floor along u`)
    assert.ok(v + sv >= -1 && v + dv + sv <= ROOM_SIZE.v, `${station} L${i + 1} leaves the floor along v`)
    assert.ok(h1 <= ROOM_SIZE.h, `${station} L${i + 1} pokes above the wall`)
  })
}

// MPP-39 / MPP-40: the decor spots (world coords, no shift) sit on the floor / under the wall top.
for (const spot of DECOR_SPOTS) {
  const [u, v, du, dv, , h1] = DECOR_SPOT_SHAPES[spot].volume
  assert.ok(u >= 0 && u + du <= ROOM_SIZE.u && v >= 0 && v + dv <= ROOM_SIZE.v, `${spot} leaves the room`)
  assert.ok(h1 <= ROOM_SIZE.h, `${spot} pokes above the wall`)
}
assert.ok(164 + WINDOW_SHIFT[2] <= ROOM_SIZE.h && 162 + WINDOW_SHIFT[1] <= ROOM_SIZE.v, 'the window leaves the right wall')

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
assert.deepEqual(resolveRoomLevels({ fridge: 3 }), { bed: 1, fridge: 3, cooker: 1, cabinet: 1, wardrobe: 1 })
assert.deepEqual(resolveRoomLevels({ bed: 0, fridge: 7, cooker: '2', cabinet: Number.NaN, wardrobe: 5 }), DEFAULT_ROOM_LEVELS)
assert.deepEqual(resolveRoomLevels({ bed: 4, fridge: 4, cooker: 4, cabinet: 4, wardrobe: 3, sofa: 2 }), { bed: 4, fridge: 4, cooker: 4, cabinet: 4, wardrobe: 3 })
assert.deepEqual(resolveRoomLevels({ cabinet: 2.5 }), DEFAULT_ROOM_LEVELS)

// MPP-17: poses. Rug keeps the mood face and props; cooker is happy without props;
// bed is the sleep face at that bed level's anchor, smaller and nudged down.
assert.deepEqual(pipPose('rug', 'bored', undefined), {
  face: 'bored', showProps: true, anchor: [...PIP_HOME, 0], scale: PIP_SCALE, dropPx: 0
})
assert.deepEqual(pipPose('cooker', 'mischievous', undefined), {
  face: 'happy', showProps: false, anchor: [...PIP_COOKER_SPOT, 0], scale: PIP_SCALE, dropPx: 0
})
for (let level = 1; level <= ROOM_MAX_LEVEL; level++) {
  assert.deepEqual(pipPose('bed', 'content', { bed: level }), {
    face: 'sleep', showProps: false, anchor: STATION_ANCHORS.bedTop[level - 1], scale: PIP_BED_SCALE, dropPx: PIP_BED_DROP
  })
}
assert.deepEqual(pipPose('bed', 'content', { bed: 9 }).anchor, STATION_ANCHORS.bedTop[0]) // bad level → 1
assert.deepEqual(pipPose('garage', 'happy', undefined), pipPose('rug', 'happy', undefined)) // unknown → rug

// MPP-18: the walker's translate is the screen distance rug -> cooker spot, and points
// up-left (the cooker is on the back-left wall); the scene pose is the happy rug pose.
const [homeX, homeY] = P(...PIP_HOME)
const [cookX, cookY] = P(...PIP_COOKER_SPOT)
near(COOK_WALK_OFFSET, [cookX - homeX, cookY - homeY])
assert.ok(COOK_WALK_OFFSET[1] < 0, 'the cooker spot is further back than the rug')
assert.deepEqual(cookPose(), { face: 'happy', showProps: false, anchor: [...PIP_HOME, 0], scale: PIP_SCALE, dropPx: 0 })

// MPP-19 AC 3: the fridge button covers the fridge and its gauge at every level, inside the viewBox.
for (let level = 1; level <= ROOM_MAX_LEVEL; level++) {
  const box = fridgeHitBox(level)
  const [fu, fv] = STATION_SHIFT.fridge
  assert.ok(inWorld(box), `level ${level} fridge box leaves the world`)
  const inside = ([x, y]) => x >= box.x - 1e-9 && x <= box.x + box.width + 1e-9 && y >= box.y - 1e-9 && y <= box.y + box.height + 1e-9
  const [gu, gv, gh] = STATION_ANCHORS.fridgeTop[level - 1]
  const [gx, gy] = P(gu + fu, gv + fv, gh + FRIDGE_GAUGE_LIFT)
  assert.ok(inside([gx, gy - FRIDGE_GAUGE_HALF_HEIGHT]), `level ${level} gauge top is outside the fridge box`)
  const [u, v, du, dv] = FRIDGE_FOOTPRINT[level - 1]
  assert.ok(inside(P(u + du / 2 + fu, v + dv / 2 + fv)), `level ${level} fridge floor centre is outside the fridge box`)
}
assert.ok(fridgeHitBox(4).height > fridgeHitBox(1).height, 'a bigger fridge gets a bigger button')
assert.deepEqual(fridgeHitBox(9), fridgeHitBox(1)) // an invalid level falls back to level 1

// MPP-23 AC 1: the cabinet button covers the cabinet at every level, inside the viewBox,
// and never overlaps the fridge button (they are on opposite walls).
for (let level = 1; level <= ROOM_MAX_LEVEL; level++) {
  const box = cabinetHitBox(level)
  const [cu, cv] = STATION_SHIFT.cabinet
  assert.ok(inWorld(box), `level ${level} cabinet box leaves the world`)
  const inside = ([x, y]) => x >= box.x - 1e-9 && x <= box.x + box.width + 1e-9 && y >= box.y - 1e-9 && y <= box.y + box.height + 1e-9
  const [u, v, du, dv, h0, h1] = CABINET_FOOTPRINT[level - 1]
  assert.ok(inside(P(u + du / 2 + cu, v + dv / 2 + cv, h0)), `level ${level} cabinet base centre is outside the box`)
  assert.ok(inside(P(u + du / 2 + cu, v + dv / 2 + cv, h1)), `level ${level} cabinet top centre is outside the box`)
  const fridge = fridgeHitBox(level)
  assert.ok(fridge.x + fridge.width <= box.x || box.x + box.width <= fridge.x, `level ${level} cabinet and fridge buttons overlap`)
}
assert.ok(cabinetHitBox(4).height > cabinetHitBox(1).height, 'a bigger cabinet gets a bigger button')
assert.deepEqual(cabinetHitBox(9), cabinetHitBox(1)) // an invalid level falls back to level 1

// MPP-26 AC 3: every station-level thumbnail is a non-empty square that contains the station's
// base and top centre; a bad level falls back to level 1.
const THUMB_SOURCES = { bed: BED_FOOTPRINT, cooker: COOKER_FOOTPRINT, cabinet: CABINET_FOOTPRINT, wardrobe: WARDROBE_FOOTPRINT }
for (const station of Object.keys(DEFAULT_ROOM_LEVELS)) {
  for (let level = 1; level <= ROOM_MAX_LEVEL; level++) {
    const box = stationThumbBox(station, level)
    assert.ok(box.width > 0 && Math.abs(box.width - box.height) < 1e-9, `${station} L${level} thumb is not a square`)
    const inside = ([x, y]) => x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height
    const fp = station === 'fridge'
      ? [...FRIDGE_FOOTPRINT[level - 1].slice(0, 4), 0, FRIDGE_FOOTPRINT[level - 1][4]]
      : THUMB_SOURCES[station][level - 1]
    const [u, v, du, dv, h0, h1] = fp
    assert.ok(inside(P(u + du / 2, v + dv / 2, h0)) && inside(P(u + du / 2, v + dv / 2, h1)), `${station} L${level} thumb misses the station`)
  }
  assert.deepEqual(stationThumbBox(station, 9), stationThumbBox(station, 1))
}

// MPP-40 AC 5: the wardrobe button covers the wardrobe's base and top centre at every level, inside the viewBox.
for (let level = 1; level <= ROOM_MAX_LEVEL; level++) {
  const box = wardrobeHitBox(level)
  assert.ok(inWorld(box), `level ${level} wardrobe box leaves the world`)
  const inside = ([x, y]) => x >= box.x - 1e-9 && x <= box.x + box.width + 1e-9 && y >= box.y - 1e-9 && y <= box.y + box.height + 1e-9
  const [u, v, du, dv, h0, h1] = WARDROBE_FOOTPRINT[level - 1]
  assert.ok(inside(P(u + du / 2, v + dv / 2, h0)) && inside(P(u + du / 2, v + dv / 2, h1)), `level ${level} wardrobe box misses the wardrobe`)
}
assert.ok(wardrobeHitBox(4).height > wardrobeHitBox(1).height, 'a bigger wardrobe gets a bigger button')
assert.deepEqual(wardrobeHitBox(9), wardrobeHitBox(1)) // an invalid level falls back to level 1

// MPP-27 AC 3 / MPP-40: each decor spot's button sits inside the viewBox and covers its dashed outline, "+" and
// name tag (world coords, no shift); each thumbnail is a square around its spot. The 12 buttons overlap by design
// (the sill sits inside the window dressing), so SPOT_BUTTON_ORDER, not geometry, decides which one a tap reaches.
DECOR_SPOTS.forEach(spot => {
  const box = decorSpotHitBox(spot)
  assert.ok(inWorld(box), `${spot} box leaves the world`)
  const inside = ([x, y]) => x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height
  const { corners, plus, tag } = DECOR_SPOT_SHAPES[spot]
  corners.forEach(([u, v, h]) => assert.ok(inside(P(u, v, h)), `${spot} box misses its outline`))
  assert.ok(inside(P(...plus)), `${spot} box misses its "+"`)
  assert.ok(inside(P(...tag)), `${spot} box misses its name tag`)
  const thumb = decorThumbBox(spot)
  assert.ok(thumb.width > 0 && Math.abs(thumb.width - thumb.height) < 1e-9, `${spot} thumb is not a square`)
})
assert.deepEqual(
  hitBoxStyle({ x: ROOM_WORLD.x + 56.4, y: ROOM_WORLD.y + 39.4, width: 112.8, height: 78.8 }),
  { left: '10.00%', top: '10.00%', width: '20.00%', height: '20.00%' }
)

// MPP-27 AC 1: every style is a finish with its colours; the defaults exist.
for (const [id, style] of Object.entries(ROOM_STYLES)) {
  assert.ok(STYLE_SPOTS.includes(style.spot), `${id} is not a finish`)
  assert.ok(style.spot === 'wallStyle' ? style.left && style.right : style.base, `${id} has no colours`)
}
assert.equal(ROOM_STYLES[DEFAULT_WALL_STYLE].spot, 'wallStyle')
assert.equal(ROOM_STYLES[DEFAULT_FLOOR_STYLE].spot, 'floorStyle')

// MPP-39: White is the default wall (back wall pure white, side wall grey-white); every wall style has a skirting.
assert.equal(DEFAULT_WALL_STYLE, 'wall-white')
assert.deepEqual([ROOM_STYLES['wall-white'].right, ROOM_STYLES['wall-white'].left], ['#ffffff', '#eceef2'])
assert.ok(ROOM_STYLES['wall-lavender'], 'Lavender stays available')
for (const [id, style] of Object.entries(ROOM_STYLES)) {
  if (style.spot === 'wallStyle') assert.match(style.skirting ?? '', /^#[0-9a-f]{6}$/, `${id} has no skirting`)
}
assert.equal(DEFAULT_FLOOR_STYLE, 'floor-lilac')

// MPP-39 AC 8 / AC 14: the camera aims a little above Pip's feet at his current spot.
const lifted = ([x, y]) => [x, y - PIP_FOCUS_LIFT]
near(pipFocusPoint('rug', null, undefined), lifted(P(...PIP_HOME)))
near(pipFocusPoint('rug', 'walking', undefined), lifted(P(...PIP_COOKER_SPOT)))
near(pipFocusPoint('rug', 'returning', undefined), lifted(P(...PIP_HOME)))
near(pipFocusPoint('cooker', null, undefined), lifted(P(...PIP_COOKER_SPOT)))
const [bu, bv, bh] = STATION_ANCHORS.bedTop[1]
near(pipFocusPoint('bed', null, { bed: 2 }), lifted(P(bu + STATION_SHIFT.bed[0], bv + STATION_SHIFT.bed[1], bh)))

// MPP-40 AC 1: exactly the ticket's 12 spots, each named, in one layer, with a button.
assert.equal(DECOR_SPOTS.length, 12)
assert.deepEqual([...Object.values(DECOR_LAYERS).flat()].sort(), [...DECOR_SPOTS].sort())
assert.deepEqual([...SPOT_BUTTON_ORDER].sort(), [...DECOR_SPOTS].sort())
DECOR_SPOTS.forEach(spot => assert.ok(DECOR_SPOT_LABELS[spot], `${spot} has no name`))
assert.deepEqual(DECOR_SPOT_SHAPES.byFridge.corners.map(c => c.slice(0, 2)), [[220, 130], [256, 130], [256, 170], [220, 170]])
assert.deepEqual(DECOR_SPOT_SHAPES.overWardrobe.corners.map(c => c[2]), [102, 102, 140, 140])
// A smaller spot must come after the larger one it sits inside, so its tap wins.
assert.ok(SPOT_BUTTON_ORDER.indexOf('windowsill') > SPOT_BUTTON_ORDER.indexOf('windowDressing'))
assert.ok(SPOT_BUTTON_ORDER.indexOf('footOfBed') > SPOT_BUTTON_ORDER.indexOf('rug'))

// MPP-40 AC 2: every item names a known spot; per-spot counts match the mockup.
const COUNTS = { overWardrobe: 5, bedsideWall: 4, frontRightWall: 5, windowDressing: 5, windowsill: 5, rug: 6, backCorner: 4, bedsideNook: 4, footOfBed: 4, byFridge: 5, cornerByDoor: 4, frontOfRoom: 4 }
DECOR_SPOTS.forEach(spot => assert.equal(Object.values(DECOR_ITEMS).filter(i => i.spot === spot).length, COUNTS[spot], `${spot} item count`))
assert.equal(Object.keys(DECOR_ITEMS).length, 55)

// MPP-40 AC 3: the legacy shift puts MPP-27's spots where MPP-39 drew them (left wall 10 higher).
assert.deepEqual(DECOR_LEGACY_SHIFT, { overWardrobe: [-130, 0, -30], frontRightWall: [0, 216, -40], byFridge: [70, 20, 0] })

// MPP-40 AC 4: the rug defaults to pink; Pip's home is the rug spot's centre.
assert.equal(DEFAULT_PLACEMENTS.rug, DEFAULT_RUG)
assert.ok(hasDefault('rug') && hasDefault('wallStyle') && !hasDefault('byFridge'))
const [ru, rv, rdu, rdv] = DECOR_SPOT_SHAPES.rug.volume
near([ru + rdu / 2, rv + rdv / 2], PIP_HOME)

// MPP-40 AC 7: no spot's volume overlaps any station at any level (strict — touching faces are fine).
// The rug is tested as its ellipse; the window spots may sit behind the bed, like the window (plan.md Assumption 9).
const STATION_BOXES = {
  wardrobe: WARDROBE_FOOTPRINT, cooker: COOKER_FOOTPRINT, cabinet: CABINET_FOOTPRINT, bed: BED_FOOTPRINT,
  fridge: FRIDGE_FOOTPRINT.map(([u, v, du, dv, h]) => [u, v, du, dv, 0, h])
}
const BEHIND_BED = new Set(['windowDressing', 'windowsill'])
const overlaps = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3] && a[4] < b[5] && b[4] < a[5]
const rugTouches = ([u, v, du, dv]) => {
  const nu = Math.max(u, Math.min(RUG.cu, u + du)), nv = Math.max(v, Math.min(RUG.cv, v + dv))
  return ((nu - RUG.cu) / RUG.ru) ** 2 + ((nv - RUG.cv) / RUG.rv) ** 2 < 1
}
for (const [station, boxes] of Object.entries(STATION_BOXES)) {
  const [su, sv] = STATION_SHIFT[station]
  boxes.forEach(([u, v, du, dv, h0, h1], i) => {
    const box = [u + su, v + sv, du, dv, h0, h1]
    for (const spot of DECOR_SPOTS) {
      if (station === 'bed' && BEHIND_BED.has(spot)) continue
      const hit = spot === 'rug' ? rugTouches(box) : overlaps(DECOR_SPOT_SHAPES[spot].volume, box)
      assert.ok(!hit, `${spot} overlaps the ${station} at level ${i + 1}`)
    }
  })
}

// MPP-27: optimistic placement, the picker / shop filters and the shop's status line.
const room = { stations: {}, placements: { overWardrobe: 'herb-shelf', frontRightWall: null, byFridge: null, rug: 'rug-braided', wallStyle: 'wall-mint', floorStyle: 'floor-lilac' } }
assert.equal(withPlacement(room, 'overWardrobe', null).placements.overWardrobe, null)
assert.equal(withPlacement(room, 'rug', null).placements.rug, DEFAULT_RUG) // a cleared rug is its default
assert.equal(withPlacement(room, 'rug', 'rug-leaf').placements.rug, 'rug-leaf')
assert.equal(withPlacement(room, 'wallStyle', null).placements.wallStyle, DEFAULT_WALL_STYLE)
assert.equal(withPlacement(room, 'floorStyle', '').placements.floorStyle, DEFAULT_FLOOR_STYLE)
assert.equal(withPlacement(room, 'byFridge', 'bean-bag').placements.byFridge, 'bean-bag')
assert.equal(room.placements.byFridge, null) // never mutated
const decor = [
  { id: 'mirror', kind: 'frontRightWall', price: 250, owned: true },
  { id: 'bunting', kind: 'frontRightWall', price: 180, owned: false },
  { id: 'future-thing', kind: 'frontRightWall', price: 10, owned: true }, // unknown to this client → skipped
  { id: 'wall-lavender', kind: 'wallStyle', price: 0, owned: true }
]
assert.deepEqual(catalogueFor(decor, 'frontRightWall').map(item => item.id), ['mirror', 'bunting'])
assert.deepEqual(ownedFor(decor, 'frontRightWall').map(item => item.id), ['mirror'])
assert.deepEqual(ownedFor(decor, 'wallStyle').map(item => item.id), ['wall-lavender'])
assert.equal(decorBoughtLine('herb-shelf', room), 'Herb shelf bought and put in the "Over the wardrobe" spot.')
assert.equal(decorBoughtLine('rug-braided', room), 'Braided rug bought and applied.') // a rug applies at once, like a finish
assert.equal(decorBoughtLine('bunting', room), 'Bunting bought. Swap it in with ✏️ Edit room.')
assert.equal(decorBoughtLine('wall-mint', room), 'Mint bought and applied.')
assert.equal(decorBoughtLine('sofa', room), null)

console.log('room checks passed')
