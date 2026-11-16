import { P } from '../../iso'
import { cat, glowG } from '../packShapes'
import { GUN, GUN_DK, GUN_LT, LIME, NEON, OLIVE, OLIVE_DK, PINK, SCREEN, SCREEN_LT, STEEL, STEEL_DK } from './robotPalette'
import { S, cup, glassU, glassV, hazardU, ledOn, medal, neon, seamsU, sensor } from './robotParts'

/**
 * MPP-45: the robot workshop's display case / trophy cabinet, four levels (pip-room-robot.html ROBOT_ROOM.stations.cabinet, lines 1211-1250).
 * Trophies and medals sit where the live cabinet shows them. Against the right wall (u = 0), running along v.
 */
const { poly, isoLines, box, rectU, ellH, bill, fxg } = S

/** L1: a shelf crate: a stencilled olive crate with a hazard band, a second crate, a trophy, a medal and a sensor on top. */
const cabinetL1 = () =>
  cat(
    box(0, 28, 22, 74, 0, 20, OLIVE),
    seamsU(22, [40, 52, 64, 76, 88], 1, 19, OLIVE_DK, 1),
    hazardU(22, 28, 102, 2, 6, 5),
    box(0, 27, 23, 76, 20, 23, OLIVE_DK),
    rectU(23, 34, 60, 9, 15, '#d9d9c8', { stroke: null, op: 0.85 }),
    ledOn(23, 95, 12, LIME),
    box(1, 32, 19, 34, 23, 35, '#7a8a6a'),
    hazardU(20, 32, 66, 26, 30, 4),
    cup(11, 86, 23, 0.65),
    sensor(11, 74, 23, 0.5),
    medal(10, 48, 35, 0.5)
  )

/** L2: a display case: a floating shelf with a glass-fronted case, two lit shelves and a top slab. */
const cabinetL2 = () =>
  cat(
    box(0, 30, 22, 72, 30, 36, GUN_DK),
    box(0, 32, 3, 68, 36, 84, SCREEN_LT),
    box(0, 30, 22, 72, 84, 88, GUN_DK),
    box(19, 31, 3, 3, 36, 86, GUN_LT),
    box(19, 96, 3, 3, 36, 86, GUN_LT),
    box(2, 34, 18, 62, 58, 60, STEEL_DK),
    cup(10, 50, 36, 0.6),
    medal(10, 70, 36, 0.55),
    sensor(10, 88, 36, 0.5),
    cup(10, 46, 60, 0.6),
    cup(10, 66, 60, 0.7),
    medal(10, 86, 60, 0.5, LIME),
    neon([P(20, 34, 57), P(20, 96, 57)], NEON, 1.2, 2.5),
    glassU(21, 34, 96, 36, 84, 0.14),
    isoLines([[P(21, 40, 38), P(21, 54, 82)], [P(21, 48, 38), P(21, 62, 82)]], 1.2, '#ffffff', 0.3)
  )

/** L3: a lit display case: a locker base, a glass case on three shelves with strip lights, a lit sign on top. */
const cabinetL3 = () =>
  cat(
    box(0, 32, 24, 62, 0, 30, GUN_DK),
    rectU(24, 36, 62, 4, 26, GUN, { sw: 1 }),
    rectU(24, 64, 90, 4, 26, GUN, { sw: 1 }),
    isoLines([[P(24.3, 60, 16), P(24.3, 60, 24)], [P(24.3, 66, 16), P(24.3, 66, 24)]], 2.2, STEEL),
    ledOn(24, 38, 28, LIME),
    box(0, 30, 26, 66, 30, 106, '#142029'),
    box(2, 32, 22, 62, 58, 60, STEEL_DK),
    box(2, 32, 22, 62, 84, 86, STEEL_DK),
    cup(12, 50, 30, 0.6),
    medal(12, 72, 30, 0.6),
    sensor(12, 86, 30, 0.5),
    cup(12, 46, 60, 0.55),
    cup(12, 66, 60, 0.65),
    medal(12, 84, 60, 0.5, LIME),
    sensor(12, 50, 86, 0.55),
    cup(12, 76, 86, 0.6),
    neon([P(24.5, 34, 56.5), P(24.5, 92, 56.5)], NEON, 1.3, 3),
    neon([P(24.5, 34, 82.5), P(24.5, 92, 82.5)], NEON, 1.3, 3),
    glassU(26, 32, 94, 32, 104, 0.13),
    isoLines([[P(26, 38, 34), P(26, 54, 100)], [P(26, 46, 34), P(26, 62, 100)]], 1.2, '#ffffff', 0.28),
    box(24, 30, 2, 3, 30, 106, GUN_LT),
    box(24, 93, 2, 3, 30, 106, GUN_LT),
    box(0, 30, 26, 66, 106, 112, GUN_DK),
    rectU(26, 40, 86, 107.5, 110.5, SCREEN, { sw: 0.8 }),
    neon([P(26.3, 41, 109), P(26.3, 85, 109)], PINK, 1.3, 2.5)
  )

/** The hovering holo trophy of L4: a glowing outline with scan lines, flickering (animated). */
const holoTrophy = () =>
  fxg(
    'scan',
    glowG(
      NEON,
      <g transform="scale(1.1)">
        <path d="M-9 -24 h18 q0 12 -9 14 q-9 -2 -9 -14z" fill={NEON} fillOpacity=".22" stroke={NEON} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M-9 -22 q-7 0 -5 7 q2 4 6 3 M9 -22 q7 0 5 7 q-2 4 -6 3 M0 -10 v6 M-7 -4 h14" fill="none" stroke={NEON} strokeWidth="1.3" />
        <path d="M-9 -20 h18 M-9 -16 h18 M-8 -12 h16" stroke={NEON} strokeWidth=".6" opacity=".6" />
      </g>,
      4
    )
  )

/** L4: a holo plinth case: an emitter plinth projecting a hovering trophy, glass wings, shelves of medals either side. */
const cabinetL4 = () => {
  const beam = cat(
    poly([P(14, 55, 23), P(14, 71, 23), P(14, 79, 104), P(14, 47, 104)], NEON, { stroke: null, op: 0.12 }),
    isoLines([[P(14, 55, 23), P(14, 47, 104)], [P(14, 71, 23), P(14, 79, 104)]], 1, NEON, 0.7)
  )
  return cat(
    box(0, 28, 28, 70, 0, 22, GUN_DK),
    neon([P(28.3, 30, 5), P(28.3, 96, 5)], NEON, 1.4, 3),
    neon([P(1, 98.3, 5), P(27, 98.3, 5)], NEON, 1.4, 3),
    box(0, 26, 30, 74, 22, 128, '#101a24'),
    box(2, 30, 24, 16, 58, 60, STEEL_DK),
    box(2, 80, 24, 16, 58, 60, STEEL_DK),
    box(2, 30, 24, 16, 92, 94, STEEL_DK),
    box(2, 80, 24, 16, 92, 94, STEEL_DK),
    cup(14, 38, 60, 0.55),
    medal(14, 88, 60, 0.5),
    sensor(14, 38, 94, 0.5),
    cup(14, 88, 94, 0.6),
    ellH(14, 63, 22.2, 10, 15, SCREEN, { sw: 1.2 }),
    glowG(NEON, ellH(14, 63, 22.4, 8, 12, 'none', { stroke: NEON, sw: 1.2 }), 3),
    beam,
    bill(14, 63, 70, holoTrophy()),
    glassU(30, 30, 96, 24, 126, 0.12),
    glassV(100, 2, 28, 24, 126, 0.12),
    box(28, 26, 2, 4, 22, 128, GUN_LT),
    box(28, 96, 2, 4, 22, 128, GUN_LT),
    box(0, 26, 30, 74, 126, 134, GUN_DK),
    neon([P(30.3, 28, 127.5), P(30.3, 98, 127.5)], PINK, 1.4, 3)
  )
}

export const ROBOT_CABINET = [cabinetL1, cabinetL2, cabinetL3, cabinetL4]
