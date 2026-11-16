import { P } from '../../iso'
import { cat, glowG } from '../packShapes'
import { CABLE_DK, GUN, GUN_DK, GUN_LT, LIME, NEON, OLIVE, OLIVE_DK, PINK, ROBOT_INK, RUST, STEEL } from './robotPalette'
import { S, discV, hazardV, led, ledOn, rivetsV, scanV, screenV, slotsU, slotsV, traceV } from './robotParts'

/**
 * MPP-45: the robot workshop's gear locker (Dress Pip), four levels (pip-room-robot.html ROBOT_ROOM.stations.wardrobe, lines 1253-1288).
 * World coords, no shift, along the left wall (v = 0). Tapping it opens the wardrobe, so each level shows gear to wear.
 */
const { poly, isoLines, box, rectV, bill } = S

const LOUVRE_PANEL = '#d9d9c8'

/** L1: a hook rail: two posts and a rail with a work jacket, a coverall and a cable coil, a toolbox and a pair of boots on the floor. */
const wardrobeL1 = () => {
  const jacket = poly([P(16, 9.5, 76), P(40, 9.5, 76), P(44, 9.5, 42), P(12, 9.5, 42)], OLIVE)
  const coverall = poly([P(44, 9.5, 76), P(58, 9.5, 76), P(61, 9.5, 52), P(42, 9.5, 52)], '#c9792e')
  const seams = cat(
    isoLines([[P(22, 9.5, 74), P(21, 9.5, 44)], [P(28, 9.5, 74), P(28, 9.5, 43)], [P(34, 9.5, 74), P(35, 9.5, 43)]], 1.1, OLIVE_DK, 0.9),
    isoLines([[P(49, 9.5, 74), P(48, 9.5, 54)], [P(54, 9.5, 74), P(55, 9.5, 54)]], 1.1, '#8f5a22', 0.9)
  )
  return cat(
    box(6, 4, 11, 11, 0, 3, GUN_DK),
    box(10, 8, 3, 3, 3, 82, GUN),
    box(58, 4, 11, 11, 0, 3, GUN_DK),
    box(62, 8, 3, 3, 3, 82, GUN),
    isoLines([[P(11.5, 9.5, 80), P(63.5, 9.5, 80)]], 3.2, GUN_LT),
    isoLines([[P(20, 9.5, 80), P(20, 9.5, 77)], [P(32, 9.5, 80), P(32, 9.5, 77)], [P(50, 9.5, 80), P(50, 9.5, 77)]], 1.6, STEEL),
    jacket,
    coverall,
    seams,
    bill(28, 9.5, 74, <circle r="3" fill={PINK} stroke={ROBOT_INK} strokeWidth="1.2" />),
    bill(
      54,
      9.5,
      66,
      <>
        <circle r="6" fill="none" stroke={CABLE_DK} strokeWidth="3" />
        <circle r="6" fill="none" stroke={NEON} strokeWidth="1" opacity=".8" />
      </>
    ),
    box(30, 16, 14, 10, 0, 8, RUST),
    isoLines([[P(33, 21, 8), P(33, 21, 12)], [P(41, 21, 8), P(41, 21, 12)], [P(33, 21, 12), P(41, 21, 12)]], 1.6, STEEL),
    box(18, 18, 5, 7, 0, 7, GUN_DK),
    box(24, 18, 5, 7, 0, 7, GUN_DK),
    box(18, 20, 5, 5, 7, 11, GUN),
    box(24, 20, 5, 5, 7, 11, GUN)
  )
}

/** L2: a gear locker: one wide olive door with louvres, a name plate, a handle and a hazard foot. */
const wardrobeL2 = () =>
  cat(
    box(10, 0, 52, 26, 0, 72, OLIVE),
    rectV(26, 13, 59, 7, 69, OLIVE_DK, { sw: 1.2 }),
    slotsV(26, 17, 55, 50, 64, 6, ROBOT_INK, 1.2),
    screenV(26, 20, 40, 38, 46, NEON),
    traceV(26, [[22, 42], [26, 44], [30, 40], [34, 43], [38, 41]], NEON, 0.9),
    rectV(26, 50, 53, 24, 38, STEEL, { sw: 1 }),
    ledOn(48, 26, 60, LIME),
    hazardV(26, 10, 62, 0, 5, 4),
    rivetsV(26, [15, 57], 10, STEEL),
    rivetsV(26, [15, 57], 66, STEEL),
    box(10, 0, 52, 26, 72, 78, GUN_DK),
    slotsU(62, 4, 22, 10, 60, 9, ROBOT_INK, 1)
  )

/** L3: a double locker: two doors with louvres and handles, status lights above each, a hazard foot. */
const wardrobeL3 = () =>
  cat(
    box(6, 0, 60, 30, 0, 86, OLIVE),
    rectV(30, 9, 34, 6, 82, OLIVE_DK, { sw: 1.2 }),
    rectV(30, 38, 63, 6, 82, OLIVE_DK, { sw: 1.2 }),
    slotsV(30, 12, 31, 62, 76, 5, ROBOT_INK, 1.2),
    slotsV(30, 41, 60, 62, 76, 5, ROBOT_INK, 1.2),
    rectV(30, 19, 27, 38, 46, LOUVRE_PANEL, { stroke: null, op: 0.85 }),
    rectV(30, 45, 53, 38, 46, LOUVRE_PANEL, { stroke: null, op: 0.85 }),
    rectV(30, 31.5, 33.5, 30, 50, STEEL, { sw: 1 }),
    rectV(30, 38.5, 40.5, 30, 50, STEEL, { sw: 1 }),
    ledOn(21, 30, 79, LIME),
    led(50, 30, 79, PINK, 0.8),
    hazardV(30, 6, 66, 0, 4, 4),
    box(6, 0, 60, 30, 86, 92, GUN_DK),
    slotsU(66, 3, 27, 12, 80, 8, ROBOT_INK, 1)
  )

/** L4: a locker bay: lockers either side of a lit screen listing the gear to wear, on a plinth. */
const wardrobeL4 = () =>
  cat(
    box(2, 0, 70, 32, 0, 90, OLIVE),
    rectV(32, 2, 72, 0, 6, GUN_DK),
    rectV(32, 5, 26, 8, 86, OLIVE_DK, { sw: 1.2 }),
    rectV(32, 50, 69, 8, 86, OLIVE_DK, { sw: 1.2 }),
    slotsV(32, 8, 23, 64, 78, 5, ROBOT_INK, 1.2),
    slotsV(32, 53, 66, 64, 78, 5, ROBOT_INK, 1.2),
    rectV(32, 24, 26, 32, 56, STEEL, { sw: 1 }),
    rectV(32, 50, 52, 32, 56, STEEL, { sw: 1 }),
    screenV(32, 29, 47, 24, 82, NEON),
    traceV(32, [[33, 70], [35, 76], [37, 72], [39, 72], [41, 76], [43, 70], [41, 66], [35, 66], [33, 70]], NEON, 1),
    glowG(NEON, discV(32, 38, 50, 5, 6, 'none', { stroke: NEON, sw: 1 }), 2),
    traceV(32, [[33, 36], [43, 36], [43, 30], [33, 30], [33, 36]], NEON, 1),
    scanV(32, 29, 47, 24, 82),
    ledOn(14, 32, 84, LIME),
    led(60, 32, 84, PINK, 0.6),
    hazardV(32, 2, 72, 6, 10, 4),
    box(2, 0, 70, 32, 90, 96, GUN_DK),
    slotsU(72, 3, 29, 12, 84, 9, ROBOT_INK, 1)
  )

export const ROBOT_WARDROBE = [wardrobeL1, wardrobeL2, wardrobeL3, wardrobeL4]
