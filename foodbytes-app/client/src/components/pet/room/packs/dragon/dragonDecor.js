import { DRAGON_WALL_DECOR } from './dragonDecorWalls'
import { DRAGON_WINDOW_DECOR } from './dragonDecorWindow'
import { DRAGON_RUG_DECOR } from './dragonDecorRugs'
import { DRAGON_FLOOR_BACK_DECOR } from './dragonDecorFloorBack'
import { DRAGON_FLOOR_FRONT_DECOR } from './dragonDecorFloorFront'

/**
 * MPP-46: the lair's 55 decor drawings (pip-room-dragon.html DRAGON_ROOM.decor, approved 2026-11-16), merged from the area files.
 * World coords; the 12 legacy ids are in MPP-27 coords and slid by packDecorArt.
 */
export const DRAGON_DECOR = { ...DRAGON_WALL_DECOR, ...DRAGON_WINDOW_DECOR, ...DRAGON_RUG_DECOR, ...DRAGON_FLOOR_BACK_DECOR, ...DRAGON_FLOOR_FRONT_DECOR }
