import { P } from '../components/pet/room/iso.js'
import { ROOM_CAMERA, ROOM_PX_PER_UNIT, ROOM_SIZE, ROOM_WORLD, ROOM_ZOOM } from '../constants/petRoom.js'

/**
 * MPP-39: the room camera's maths, pure so roomCamera.check.mjs can pin it (ported from
 * pip-room-zoom-mockup.html). The camera is a centre (cx, cy) in world px plus a zoom multiplier
 * on ROOM_PX_PER_UNIT; usePipCamera owns the motion.
 */

/** A zoom inside [MIN, MAX]; anything non-numeric is the default 1×. */
export function clampZoom(zoom) {
  if (!Number.isFinite(zoom) || zoom <= 0) return ROOM_ZOOM.DEFAULT
  return Math.min(ROOM_ZOOM.MAX, Math.max(ROOM_ZOOM.MIN, zoom))
}

/** AC 11: how far a pull of `over` px past an edge moves — nearly 1:1 at first, never past OVERSCROLL. */
export function rubber(over) {
  const { OVERSCROLL, STRETCH } = ROOM_CAMERA
  return (1 - 1 / ((over * STRETCH) / OVERSCROLL + 1)) * OVERSCROLL
}

// The range a view `size` wide may centre in, inside [lo, hi]; the midpoint when the view is wider.
function centreRange(size, lo, hi) {
  if (hi - lo <= size) return [(lo + hi) / 2, (lo + hi) / 2]
  return [lo + size / 2, hi - size / 2]
}

/** A hard clamp of the centre — used to aim at Pip. */
export function fitAxis(c, size, lo, hi) {
  const [min, max] = centreRange(size, lo, hi)
  return Math.min(Math.max(c, min), max)
}

/** The same range, but damped past it instead of stopped — used while dragging or holding a key. */
export function rubberAxis(c, size, lo, hi) {
  const [min, max] = centreRange(size, lo, hi)
  if (c < min) return min - rubber(min - c)
  if (c > max) return max + rubber(c - max)
  return c
}

/** AC 12: cubic ease in and out. */
export function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** AC 11: the free area — the room (floor up to a little above the walls) plus FREE_PAD all round. */
export function cameraBounds() {
  const xs = []
  const ys = []
  for (const u of [0, ROOM_SIZE.u]) {
    for (const v of [0, ROOM_SIZE.v]) {
      for (const h of [0, ROOM_SIZE.h + ROOM_CAMERA.WALL_TOP_PAD]) {
        const [x, y] = P(u, v, h)
        xs.push(x)
        ys.push(y)
      }
    }
  }
  const pad = ROOM_CAMERA.FREE_PAD
  return { minX: Math.min(...xs) - pad, maxX: Math.max(...xs) + pad, minY: Math.min(...ys) - pad, maxY: Math.max(...ys) + pad }
}

/** How much world a stage of stageW × stageH screen px shows at a zoom, in world px. */
export function viewSize(stageW, stageH, zoom) {
  const k = ROOM_PX_PER_UNIT * zoom
  return [stageW / k, stageH / k]
}

/** The world layer's CSS transform that puts world point (cx, cy) in the middle of the stage. */
export function worldTransform(cx, cy, zoom, stageW, stageH) {
  const k = ROOM_PX_PER_UNIT * zoom
  const tx = stageW / 2 - (cx - ROOM_WORLD.x) * k
  const ty = stageH / 2 - (cy - ROOM_WORLD.y) * k
  return `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${zoom.toFixed(4)})`
}
