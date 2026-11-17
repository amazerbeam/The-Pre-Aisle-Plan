import { PIP_DEFAULT_LINE, PIP_LINE } from '../../../constants/pipLines'
import { DECOR_ITEMS, DEFAULT_FLOOR_STYLE, DEFAULT_WALL_STYLE, ROOM_SPOTS, ROOM_STYLES } from '../../../constants/petDecor'
import { HERB_ROOM } from './herbRoom'
import { DECOR_LEGACY_IDS, DECOR_LEGACY_SHIFT, shiftTransform } from './roomLayout'
import { DRAGON_ROOM } from './packs/dragon/dragonRoom'
import { ROBOT_ROOM } from './packs/robot/robotRoom'

/**
 * MPP-45: one room pack per Pip line (mirrors pip/wardrobeArt.js LINE_WARDROBE). Every accessor falls back to the
 * herb item per entry (a pack-drawn legacy decor id is slid by DECOR_LEGACY_SHIFT here, MPP-46), so a pack can ship its shell before its decor (MPP-46/47). Built art is cached per line so
 * the minute re-render diffs the same elements.
 *
 * A pack's fields: `ambience` is declarative (which effect loops run on which target); the animations themselves come from the
 * `room-fx--*` classes in the drawings (roomFx.css), so nothing reads it at runtime. `labels` is the pack's names, read through
 * petRoomLabels.js (`ROOM_LABELS[line]`) and held here only so the pack shape is self-describing.
 */
export const ROOM_PACKS = {
  [PIP_LINE.HERB]: HERB_ROOM,
  [PIP_LINE.DRAGON]: DRAGON_ROOM,
  [PIP_LINE.ROBOT]: ROBOT_ROOM
}

export const roomPack = (line) => ROOM_PACKS[line] ?? ROOM_PACKS[PIP_DEFAULT_LINE]

const stationCache = new Map()
const decorCache = new Map()
const backdropCache = new Map()

export function packStationArt(pack, station, level) {
  const builds = pack.stations?.[station]
  if (!builds?.length) return HERB_ROOM.stationById(station, level)
  const lv = Math.min(Math.max(Math.round(level) || 1, 1), builds.length)
  const key = `${pack.line}:${station}:${lv}`
  if (!stationCache.has(key)) stationCache.set(key, builds[lv - 1]())
  return stationCache.get(key)
}

export function packDecorArt(pack, id) {
  if (!id) return null
  const key = `${pack.line}:${id}`
  if (!decorCache.has(key)) decorCache.set(key, pack.decor?.[id] ? packDrawnDecor(pack, id) : HERB_ROOM.decorById(id))
  return decorCache.get(key)
}

// MPP-46: a pack draws the 12 legacy ids in MPP-27 coords, as herb does; slide them to their spot the same way.
function packDrawnDecor(pack, id) {
  const art = pack.decor[id]()
  const shift = DECOR_LEGACY_IDS.has(id) ? DECOR_LEGACY_SHIFT[DECOR_ITEMS[id]?.spot] : null
  return shift ? <g transform={shiftTransform(shift)}>{art}</g> : art
}

/** A pack's style for an id. Herb falls back to the base style; any other pack ships every style, so an id it lacks gets that pack's own default for the spot. Unknown ids are null. */
export function packStyle(pack, id) {
  const own = pack.styles?.[id]
  if (own) return own
  if (pack.line === PIP_LINE.HERB) return ROOM_STYLES[id] ?? null
  const spot = ROOM_STYLES[id]?.spot
  if (!spot) return null
  return pack.styles?.[spot === ROOM_SPOTS.WALL_STYLE ? DEFAULT_WALL_STYLE : DEFAULT_FLOOR_STYLE] ?? null
}

export function packBackdrop(pack, night, wallStyleId, floorStyleId) {
  if (pack.backdropById) return pack.backdropById(night, wallStyleId, floorStyleId)
  const wallId = ROOM_STYLES[wallStyleId]?.spot === ROOM_SPOTS.WALL_STYLE ? wallStyleId : DEFAULT_WALL_STYLE
  const floorId = ROOM_STYLES[floorStyleId]?.spot === ROOM_SPOTS.FLOOR_STYLE ? floorStyleId : DEFAULT_FLOOR_STYLE
  const key = `${pack.line}|${night ? 'night' : 'day'}|${wallId}|${floorId}`
  if (!backdropCache.has(key)) backdropCache.set(key, pack.backdrop(night, packStyle(pack, wallId), packStyle(pack, floorId)))
  return backdropCache.get(key)
}

/** The pack's windowsill, drawn between the wall and window decor layers (null for a pack without one). */
export function packSill(pack) {
  const Sill = pack.sill
  return Sill ? <Sill /> : null
}

export const packEffects = (pack) => ({ ...HERB_ROOM.effects, ...pack.effects })
