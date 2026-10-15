// Run: npm run check:camera   (from foodbytes-app/client)
// MPP-39: the room camera's pure maths and the zoom store. There is no test runner; mirrors room.check.mjs.
import assert from 'node:assert/strict'
import { P } from '../components/pet/room/iso.js'
import { ROOM_CAMERA, ROOM_SIZE, ROOM_WORLD, ROOM_ZOOM, ROOM_ZOOM_STORAGE_KEY } from '../constants/petRoom.js'
import { cameraBounds, clampZoom, easeInOut, fitAxis, rubber, rubberAxis, viewSize, worldTransform } from './roomCamera.js'
import { readRoomZoom, writeRoomZoom } from './roomZoomStore.js'

// AC 15: zoom runs 0.35×–2.2×; junk is 1×.
assert.equal(clampZoom(0.1), 0.35)
assert.equal(clampZoom(9), 2.2)
assert.equal(clampZoom(1.3), 1.3)
for (const junk of [Number.NaN, 0, -2, Infinity]) assert.equal(clampZoom(junk), 1)

// AC 11: the rubber band starts nearly free, stiffens, and never passes OVERSCROLL.
assert.equal(rubber(0), 0)
assert.ok(rubber(10) > 5 && rubber(10) < 10)
assert.ok(rubber(400) > rubber(200) && rubber(200) > rubber(100))
assert.ok(rubber(1e9) < ROOM_CAMERA.OVERSCROLL && rubber(1e9) > ROOM_CAMERA.OVERSCROLL - 1)

// Inside the range a drag is 1:1; past it, damped; a view wider than the range centres.
assert.equal(rubberAxis(50, 20, 0, 100), 50)
assert.equal(rubberAxis(120, 20, 0, 100), 90 + rubber(30))
assert.equal(rubberAxis(-30, 20, 0, 100), 10 - rubber(40))
assert.equal(fitAxis(120, 20, 0, 100), 90)
assert.equal(fitAxis(-5, 20, 0, 100), 10)
assert.equal(fitAxis(7, 300, 0, 100), 50)

// AC 12: ease in-out ends where it should and never goes backwards.
assert.equal(easeInOut(0), 0)
assert.equal(easeInOut(0.5), 0.5)
assert.equal(easeInOut(1), 1)
for (let t = 0.05; t <= 1; t += 0.05) assert.ok(easeInOut(t) >= easeInOut(t - 0.05))

// AC 11: the free area is the room plus FREE_PAD on every side.
const b = cameraBounds()
const [, topY] = P(0, 0, ROOM_SIZE.h + ROOM_CAMERA.WALL_TOP_PAD)
assert.equal(b.minY, topY - ROOM_CAMERA.FREE_PAD)
assert.equal(b.maxY, P(ROOM_SIZE.u, ROOM_SIZE.v)[1] + ROOM_CAMERA.FREE_PAD)
assert.equal(b.minX, P(ROOM_SIZE.u, 0)[0] - ROOM_CAMERA.FREE_PAD)
assert.equal(b.maxX, P(0, ROOM_SIZE.v)[0] + ROOM_CAMERA.FREE_PAD)

// AC 7: 2 screen px per unit at 1×, so a 400 × 300 stage shows 200 × 150 world px.
assert.deepEqual(viewSize(400, 300, 1), [200, 150])
assert.deepEqual(viewSize(400, 300, 2), [100, 75])

// The world origin lands in the middle of the stage; zoom scales the layer.
assert.equal(worldTransform(ROOM_WORLD.x, ROOM_WORLD.y, 1, 400, 300), 'translate3d(200.0px, 150.0px, 0) scale(1.0000)')
assert.equal(worldTransform(ROOM_WORLD.x + 10, ROOM_WORLD.y, 0.5, 400, 300), 'translate3d(190.0px, 150.0px, 0) scale(0.5000)')

// AC 16: no storage (node) → 1×, no throw; a saved zoom is read back and clamped.
assert.equal(readRoomZoom(), ROOM_ZOOM.DEFAULT)
writeRoomZoom(1.5) // no localStorage here: must not throw
const memory = new Map()
globalThis.localStorage = { getItem: k => (memory.has(k) ? memory.get(k) : null), setItem: (k, v) => memory.set(k, v) }
assert.equal(readRoomZoom(), ROOM_ZOOM.DEFAULT)
writeRoomZoom(1.5)
assert.equal(memory.get(ROOM_ZOOM_STORAGE_KEY), '1.5')
assert.equal(readRoomZoom(), 1.5)
memory.set(ROOM_ZOOM_STORAGE_KEY, '40')
assert.equal(readRoomZoom(), ROOM_ZOOM.MAX)
memory.set(ROOM_ZOOM_STORAGE_KEY, 'huge')
assert.equal(readRoomZoom(), ROOM_ZOOM.DEFAULT)
globalThis.localStorage = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
assert.equal(readRoomZoom(), ROOM_ZOOM.DEFAULT)
writeRoomZoom(2)
delete globalThis.localStorage

console.log('camera checks passed')
