import { FLOOR_BACK_BUILDERS } from './decorArtFloorBack'
import { FLOOR_FRONT_BUILDERS } from './decorArtFloorFront'

/**
 * MPP-40: every floor-spot decor item in world coords. Split along the draw layers (DECOR_LAYERS.backFloor
 * and .frontFloor) to keep each art file under the 400-line budget.
 */
export const FLOOR_BUILDERS = { ...FLOOR_BACK_BUILDERS, ...FLOOR_FRONT_BUILDERS }
