// Run: npm run check:room   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-16 room projection,
// level normalisation and draw order are pinned here. Mirrors utils/petMood.check.mjs.
import assert from 'node:assert/strict'
import { P, pts, shade, boxFaces, ellipsePoints, cylinderSidePoints, ISO_C, ISO_S } from './iso.js'
import {
  ROOM_DRAW_ORDER, PIP_HOME, PIP_SCALE, PIP_COOKER_SPOT, PIP_BED_SCALE, PIP_BED_DROP, RUG, STATION_ANCHORS,
  pipPose, resolveRoomLevels
} from './roomLayout.js'
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

console.log('room checks passed')
