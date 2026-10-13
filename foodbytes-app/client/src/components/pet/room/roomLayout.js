import { PET_MOODS, PET_SLEEP_FACE, PIP_POSITIONS } from '../../../constants/pet.js'
import { DEFAULT_ROOM_LEVELS, ROOM_MAX_LEVEL, ROOM_MIN_LEVEL, ROOM_STATIONS } from '../../../constants/petRoom.js'

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
