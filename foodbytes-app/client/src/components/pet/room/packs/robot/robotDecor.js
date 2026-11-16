import { ROBOT_WALL_DECOR } from './robotDecorWalls'
import { ROBOT_WINDOW_DECOR } from './robotDecorWindow'
import { ROBOT_RUG_DECOR } from './robotDecorRugs'
import { ROBOT_FLOOR_BACK_DECOR } from './robotDecorFloorBack'
import { ROBOT_FLOOR_FRONT_DECOR } from './robotDecorFloorFront'

/**
 * MPP-47: the workshop's 55 decor drawings (pip-room-robot.html ROBOT_ROOM.decor, approved 2026-11-16), merged from the area files.
 * World coords; the 12 legacy ids are in MPP-27 coords and slid by packDecorArt.
 */
export const ROBOT_DECOR = { ...ROBOT_WALL_DECOR, ...ROBOT_WINDOW_DECOR, ...ROBOT_RUG_DECOR, ...ROBOT_FLOOR_BACK_DECOR, ...ROBOT_FLOOR_FRONT_DECOR }
