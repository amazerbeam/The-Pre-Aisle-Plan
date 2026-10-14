import { PET_MOODS, PET_SLEEP_FACE, PIP_POSITIONS } from '../../../constants/pet.js'
import { DEFAULT_ROOM_LEVELS, ROOM_MAX_LEVEL, ROOM_MIN_LEVEL, ROOM_STATIONS } from '../../../constants/petRoom.js'
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

export const RUG = { cu: 100, cv: 85, ru: 58, rv: 44 }

// Pip stands in the middle of the rug.
export const PIP_HOME = [RUG.cu, RUG.cv]
export const PIP_SCALE = 0.46

// MPP-17 (mockup v5 PIP_STOVE / pipBed / zzz / night overlay).
export const PIP_COOKER_SPOT = [96, 64]

// MPP-18: screen px from Pip's rug spot to his cooker spot. The cook-and-serve walker
// translates by this, so Pip stays anchored on the rug and the CSS transition moves him.
const [HOME_X, HOME_Y] = P(...PIP_HOME)
const [COOKER_X, COOKER_Y] = P(...PIP_COOKER_SPOT)
export const COOK_WALK_OFFSET = [COOKER_X - HOME_X, COOKER_Y - HOME_Y]
export const PIP_BED_SCALE = 0.36
export const PIP_BED_DROP = 4 // px below the bed-top point, so he sinks into the mattress
export const SLEEP_Z_LIFT = 30 // the z's float this far above the bed top
export const NIGHT_DIM_FILL = 'rgba(30,20,80,.38)'

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
 * MPP-19 AC 3: the fridge + gauge's bounding box in viewBox px, so PetRoom can lay a real
 * <button> over it. Projects the level's footprint corners through P().
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function fridgeHitBox(level) {
  const index = resolveRoomLevels({ fridge: level }).fridge - 1
  const [u, v, du, dv, h] = FRIDGE_FOOTPRINT[index]
  const [gu, gv, gh] = STATION_ANCHORS.fridgeTop[index]
  const gaugeTop = P(gu, gv, gh + FRIDGE_GAUGE_LIFT)[1] - FRIDGE_GAUGE_HALF_HEIGHT
  return boundsOf(boxCorners(u, v, du, dv, 0, h), [gaugeTop])
}

/** MPP-23 AC 1: the cabinet's bounding box in viewBox px, for the cabinet button. */
export function cabinetHitBox(level) {
  const index = resolveRoomLevels({ cabinet: level }).cabinet - 1
  return boundsOf(boxCorners(...CABINET_FOOTPRINT[index]))
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
