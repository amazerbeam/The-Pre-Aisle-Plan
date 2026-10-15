import { COOK_PHASES, PET_MOODS, PET_SLEEP_FACE, PIP_POSITIONS } from '../../../constants/pet.js'
import { DEFAULT_ROOM_LEVELS, ROOM_MAX_LEVEL, ROOM_MIN_LEVEL, PIP_FOCUS_LIFT, ROOM_STATIONS, ROOM_WORLD } from '../../../constants/petRoom.js'
import { DECOR_SPOT_SHAPES } from '../../../constants/petDecor.js'
import { P } from './iso.js'

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

// MPP-39: the middle of the bigger floor (ROOM_SIZE 260 × 300).
export const RUG = { cu: 140, cv: 150, ru: 58, rv: 44 }

// Pip stands in the middle of the rug.
export const PIP_HOME = [RUG.cu, RUG.cv]
export const PIP_SCALE = 0.46

// MPP-17 (mockup v5 PIP_STOVE / pipBed / zzz / night overlay).
// MPP-39: in world floor coords — the art's [96, 64] plus STATION_SHIFT.cooker.
export const PIP_COOKER_SPOT = [126, 64]

// MPP-18: screen px from Pip's rug spot to his cooker spot. The cook-and-serve walker
// translates by this, so Pip stays anchored on the rug and the CSS transition moves him.
const [HOME_X, HOME_Y] = P(...PIP_HOME)
const [COOKER_X, COOKER_Y] = P(...PIP_COOKER_SPOT)
export const COOK_WALK_OFFSET = [COOKER_X - HOME_X, COOKER_Y - HOME_Y]
export const PIP_BED_SCALE = 0.36
export const PIP_BED_DROP = 4 // px below the bed-top point, so he sinks into the mattress
export const SLEEP_Z_LIFT = 30 // the z's float this far above the bed top
export const NIGHT_DIM_FILL = 'rgba(30,20,80,.38)'

// MPP-39: the furniture is spread along the longer walls by sliding each station's art (which stays
// in its MPP-16 coords, so the shop thumbnails don't move). [du, dv] along the floor.
export const STATION_SHIFT = {
  [ROOM_STATIONS.COOKER]: [30, 0],
  [ROOM_STATIONS.FRIDGE]: [60, 0],
  [ROOM_STATIONS.CABINET]: [0, 30],
  [ROOM_STATIONS.BED]: [0, 70]
}

// MPP-39: [du, dv, dh] per decor spot — the wall spots drop under the 150-high walls, onto free wall.
export const DECOR_SPOT_SHIFT = {
  leftWall: [-130, 0, -40],
  rightWall: [0, 216, -40],
  floor: [70, 20, 0]
}

// MPP-39: the window (and its sky) follows the bed and sits lower on the lower wall.
export const WINDOW_SHIFT = [0, 70, -30]

/** MPP-39: a floor shift [du, dv, dh] as screen px. P() is linear, so it is one constant offset. */
export function shiftPx([du, dv, dh = 0]) {
  const [x0, y0] = P(0, 0, 0)
  const [x, y] = P(du, dv, dh)
  return [x - x0, y - y0]
}

/** MPP-39: an SVG transform for a shift, one decimal place like the rest of the art. */
export function shiftTransform(shift) {
  const [dx, dy] = shiftPx(shift)
  return `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`
}

const offsetBox = (box, shift) => {
  const [dx, dy] = shiftPx(shift)
  return { ...box, x: box.x + dx, y: box.y + dy }
}

// Per level (index 0 = level 1), [u, v, h]. From the mockup's FRIDGE_TOP, STOVE[].pot,
// PLATE_AT and BED[].top. MPP-17 draws cookerPot (steam) and bedTop (sleeping Pip, z's).
export const STATION_ANCHORS = {
  fridgeTop: [[166, 14, 34], [166, 17, 58], [163, 19, 112], [156, 20, 120]],
  cookerPot: [[118, 15, 46], [80, 19, 70], [92, 20, 80], [90, 20, 82]],
  cookerPlate: [[100, 22, 26], [106, 19, 55], [118, 20, 62], [112, 20, 63]],
  bedTop: [[48, 148, 5], [50, 148, 30], [40, 148, 30], [40, 148, 30]]
}

// MPP-19: the outer box of FURNITURE.fridge[level - 1] as [u, v, du, dv, h]. Hand-copied
// from furniture.jsx; keep the two in step when the fridge art changes (MPP-26).
export const FRIDGE_FOOTPRINT = [[145, -1, 42, 30, 34], [146, 0, 40, 34, 58], [140, 0, 46, 38, 112], [124, 0, 64, 40, 120]]
export const FRIDGE_GAUGE_LIFT = 8 // gauge centre sits this far above fridgeTop (mockup stockGauge h + 8)
export const FRIDGE_GAUGE_HALF_HEIGHT = 7 // the gauge track's top edge is 7 px above its centre

// MPP-23: the outer box of FURNITURE.cabinet[level - 1] as [u, v, du, dv, h0, h1] (level 2's
// shelves float on the wall from h 30). Hand-copied from furniture.jsx; keep the two in step (MPP-26).
export const CABINET_FOOTPRINT = [[0, 26, 24, 78, 0, 48], [0, 30, 22, 72, 30, 88], [0, 30, 26, 66, 0, 112], [0, 26, 30, 74, 0, 134]]

// MPP-26: the outer box of FURNITURE.cooker / .bed [level - 1] as [u, v, du, dv, h0, h1], for the
// shop's next-level thumbnails. Hand-copied from furniture.jsx; keep them in step with the art.
// (MPP-39: L4's cooker hood dropped 30 to fit the 150 wall.)
export const COOKER_FOOTPRINT = [[96, 0, 44, 30, 0, 46], [58, 0, 84, 38, 0, 70], [70, 0, 70, 38, 0, 80], [48, 0, 94, 40, 0, 150]]
export const BED_FOOTPRINT = [[10, 122, 74, 52, 0, 11], [4, 122, 80, 52, 0, 36], [0, 120, 91, 56, 0, 64], [0, 118, 91, 60, 0, 127]]
const THUMB_PAD = 6

const THUMB_FOOTPRINTS = {
  [ROOM_STATIONS.BED]: BED_FOOTPRINT,
  [ROOM_STATIONS.COOKER]: COOKER_FOOTPRINT,
  [ROOM_STATIONS.CABINET]: CABINET_FOOTPRINT,
  [ROOM_STATIONS.FRIDGE]: FRIDGE_FOOTPRINT.map(([u, v, du, dv, h]) => [u, v, du, dv, 0, h])
}

/**
 * MPP-26 AC 3: a square viewBox (viewBox px) around one station at one level, so the shop can draw
 * stationArt() as a thumbnail. An invalid level falls back to level 1.
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function stationThumbBox(station, level) {
  const index = resolveRoomLevels({ [station]: level })[station] - 1
  return squareAround(boundsOf(boxCorners(...THUMB_FOOTPRINTS[station][index])), THUMB_PAD)
}

// MPP-27: the spot buttons reach this far past the art's volume (mockup spotButtons pad).
const DECOR_SPOT_PAD = 4

/**
 * MPP-27 AC 3: one decor spot's button box (world px, shifted, MPP-39) — the spot's whole art volume plus a pad.
 * CSS keeps it at least 44 px however small the card gets.
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function decorSpotHitBox(spot) {
  const { x, y, width, height } = boundsOf(boxCorners(...DECOR_SPOT_SHAPES[spot].volume))
  const box = { x: x - DECOR_SPOT_PAD, y: y - DECOR_SPOT_PAD, width: width + 2 * DECOR_SPOT_PAD, height: height + 2 * DECOR_SPOT_PAD }
  return offsetBox(box, DECOR_SPOT_SHIFT[spot])
}

/** MPP-27: a square viewBox around a spot's art volume, so the picker and the shop can draw decorArt() as a thumbnail. */
export function decorThumbBox(spot) {
  return squareAround(boundsOf(boxCorners(...DECOR_SPOT_SHAPES[spot].volume)), THUMB_PAD)
}

/** MPP-19 / MPP-27 / MPP-39: a world box → the % position of a button on the room's world layer. */
export function hitBoxStyle(box) {
  const { x, y, width, height } = ROOM_WORLD
  return {
    left: percentOf(box.x - x, width),
    top: percentOf(box.y - y, height),
    width: percentOf(box.width, width),
    height: percentOf(box.height, height)
  }
}

const percentOf = (value, total) => `${((100 * value) / total).toFixed(2)}%`

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

/**
 * MPP-19 AC 3: the fridge + gauge's bounding box in world px (shifted, MPP-39), so PetRoom can lay a real
 * <button> over it. Projects the level's footprint corners through P().
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function fridgeHitBox(level) {
  const index = resolveRoomLevels({ fridge: level }).fridge - 1
  const [u, v, du, dv, h] = FRIDGE_FOOTPRINT[index]
  const [gu, gv, gh] = STATION_ANCHORS.fridgeTop[index]
  const gaugeTop = P(gu, gv, gh + FRIDGE_GAUGE_LIFT)[1] - FRIDGE_GAUGE_HALF_HEIGHT
  return offsetBox(boundsOf(boxCorners(u, v, du, dv, 0, h), [gaugeTop]), STATION_SHIFT[ROOM_STATIONS.FRIDGE])
}

/** MPP-23 AC 1: the cabinet's bounding box in world px (shifted, MPP-39), for the cabinet button. */
export function cabinetHitBox(level) {
  const index = resolveRoomLevels({ cabinet: level }).cabinet - 1
  return offsetBox(boundsOf(boxCorners(...CABINET_FOOTPRINT[index])), STATION_SHIFT[ROOM_STATIONS.CABINET])
}

// The 8 projected corners of a floor box from h0 to h1.
function boxCorners(u, v, du, dv, h0, h1) {
  const corners = []
  for (const cu of [u, u + du]) {
    for (const cv of [v, v + dv]) {
      for (const ch of [h0, h1]) corners.push(P(cu, cv, ch))
    }
  }
  return corners
}

// Smallest rectangle around the points (and any extra y values).
function boundsOf(points, extraYs = []) {
  const xs = points.map(([x]) => x)
  const ys = [...points.map(([, y]) => y), ...extraYs]
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

// The smallest square, centred on the box, that holds it plus pad on every side.
function squareAround({ x, y, width, height }, pad) {
  const side = Math.max(width, height) + 2 * pad
  return { x: x + width / 2 - side / 2, y: y + height / 2 - side / 2, width: side, height: side }
}

/**
 * MPP-17: what RoomPip draws for a position — face, mood props or not, floor anchor
 * [u, v, h], scale and a downward nudge in px. Unknown positions get the rug pose.
 */
export function pipPose(position, mood, levels) {
  if (position === PIP_POSITIONS.COOKER) {
    return { face: PET_MOODS.HAPPY, showProps: false, anchor: [...PIP_COOKER_SPOT, 0], scale: PIP_SCALE, dropPx: 0 }
  }
  if (position === PIP_POSITIONS.BED) {
    const bedLevel = resolveRoomLevels(levels).bed
    return {
      face: PET_SLEEP_FACE,
      showProps: false,
      anchor: STATION_ANCHORS.bedTop[bedLevel - 1],
      scale: PIP_BED_SCALE,
      dropPx: PIP_BED_DROP
    }
  }
  return { face: mood, showProps: true, anchor: [...PIP_HOME, 0], scale: PIP_SCALE, dropPx: 0 }
}

/** MPP-18: Pip during the cook-and-serve scene — anchored on the rug (the walker moves him), happy, no props. */
export function cookPose() {
  return { face: PET_MOODS.HAPPY, showProps: false, anchor: [...PIP_HOME, 0], scale: PIP_SCALE, dropPx: 0 }
}

const COOKER_PHASES = [COOK_PHASES.WALKING, COOK_PHASES.COOKING, COOK_PHASES.SERVED]

/**
 * MPP-39 AC 8 / AC 14: where the camera aims, in world px — a little above Pip's feet at his
 * current spot (the cooker spot for the whole cook scene, his bed at night, else the rug).
 */
export function pipFocusPoint(position, phase, levels) {
  let anchor = [...PIP_HOME, 0]
  if (COOKER_PHASES.includes(phase) || position === PIP_POSITIONS.COOKER) anchor = [...PIP_COOKER_SPOT, 0]
  else if (position === PIP_POSITIONS.BED) {
    const [u, v, h] = STATION_ANCHORS.bedTop[resolveRoomLevels(levels).bed - 1]
    const [su, sv] = STATION_SHIFT[ROOM_STATIONS.BED]
    anchor = [u + su, v + sv, h]
  }
  const [x, y] = P(...anchor)
  return [x, y - PIP_FOCUS_LIFT]
}
