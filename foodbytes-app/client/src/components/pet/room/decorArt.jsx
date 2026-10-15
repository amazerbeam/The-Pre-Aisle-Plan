import { DECOR_ITEMS } from '../../../constants/petDecor'
import { WALL_BUILDERS } from './decorArtWalls'
import { WINDOW_BUILDERS } from './decorArtWindow'
import { FLOOR_BUILDERS } from './decorArtFloor'
import { RUG_BUILDERS } from './decorArtRugs'
import { DECOR_LEGACY_SHIFT, shiftTransform } from './roomLayout'

/**
 * MPP-27 AC 4 / MPP-40: the decor items as iso art in world coords, built by area (decorArtWalls / Window / Floor /
 * Rugs) and merged here. Each id is built once and cached, so the room's minute re-render diffs the same elements.
 * An unknown id draws nothing. The same JSX is cropped as a thumbnail by DecorThumb.
 */
export { Leaf } from './decorArtWalls'

const BUILDERS = { ...WALL_BUILDERS, ...WINDOW_BUILDERS, ...FLOOR_BUILDERS, ...RUG_BUILDERS }
// MPP-27's 12 items are drawn in their original coords and slid to their MPP-40 spot.
const LEGACY_IDS = new Set(['basil-print', 'recipe-board', 'herb-shelf', 'fairy-lights', 'wall-clock', 'bunting', 'pan-rail', 'mirror', 'watering-can', 'cookbook-stack', 'bean-bag', 'lemon-tree'])

const cache = new Map()

/** MPP-27 / MPP-40: an item's art in world coords (cached per id), or null for an id this client doesn't know. */
export function decorArt(id) {
  if (!id || !BUILDERS[id]) return null
  if (!cache.has(id)) {
    const art = BUILDERS[id]()
    const shift = LEGACY_IDS.has(id) ? DECOR_LEGACY_SHIFT[DECOR_ITEMS[id]?.spot] : null
    cache.set(id, shift ? <g transform={shiftTransform(shift)}>{art}</g> : art)
  }
  return cache.get(id)
}
