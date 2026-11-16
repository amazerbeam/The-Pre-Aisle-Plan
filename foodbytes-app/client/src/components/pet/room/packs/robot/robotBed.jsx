import { P } from '../../iso'
import { cat, glowG } from '../packShapes'
import { AMBER, CABLE_DK, GUN, GUN_DK, GUN_LT, LIME, NEON, PINK, ROBOT_INK, STEEL, STEEL_DK } from './robotPalette'
import { S, coil, glassU, glassV, led, ledOn, neon, rivetsU, scanU, screenU, seamsU, slotsU, traceU } from './robotParts'

/**
 * MPP-45: the robot workshop's charging pod, four levels (pip-room-robot.html ROBOT_ROOM.stations.bed, lines 1083-1132). The sleeping
 * surface sits at STATION_ANCHORS.bedTop (L1 h 5, L2-L4 h 30). Each level returns { back, front }; front = the near rails, over the creature.
 */
const { box, cyl, rectU, isoLine, isoLines } = S

const MAT = '#2d3a48'

/** L1: a floor charging mat with a charge brick, a cable and a pillow. */
const bedL1 = () => {
  const mat = cat(
    box(14, 124, 68, 40, 0, 5, MAT),
    neon([P(15.5, 125.5, 5.3), P(80.5, 125.5, 5.3), P(80.5, 162.5, 5.3), P(15.5, 162.5, 5.3), P(15.5, 125.5, 5.3)], NEON, 1, 2.5),
    coil(48, 144, 5.2, 24, 14)
  )
  const pillow = cat(box(17, 136, 10, 20, 5, 10, '#3a4a5c'), isoLines([[P(27, 140, 10), P(27, 152, 10)]], 1.3, NEON, 0.9))
  const brick = cat(box(64, 166, 10, 8, 0, 9, GUN_DK), ledOn(74, 170, 5, LIME), slotsU(74, 167, 173, 2, 7, 3, ROBOT_INK, 0.9))
  const cablePath = [P(64, 170, 2), P(54, 173, 1), P(44, 170, 1.5), P(38, 165, 3), P(38, 164, 4.5)]
  const cable = cat(isoLine(cablePath, 3.6, CABLE_DK), isoLine(cablePath, 1.2, NEON, { op: 0.8 }))
  return { back: cat(mat, pillow, brick, cable), front: null }
}

/** L2: a charging cradle: a lift on four hydraulic pillars, a padded cradle on top, rails at the near edges. */
const bedL2 = () => {
  const base = cat(
    box(4, 122, 80, 52, 0, 4, GUN_DK),
    neon([P(6, 124, 4.3), P(82, 124, 4.3), P(82, 172, 4.3), P(6, 172, 4.3), P(6, 124, 4.3)], NEON, 1, 2.5)
  )
  const pillars = cat(...[[14, 132], [14, 164], [74, 132], [74, 164]].map(([u, v]) => cat(cyl(u, v, 3.4, 4, 22, STEEL_DK), cyl(u, v, 4.4, 4, 8, GUN_LT))))
  const slab = cat(box(6, 124, 76, 48, 22, 28, GUN), rivetsU(82, [132, 148, 164], 25, STEEL), led(82, 138, 25, LIME), led(82, 158, 25, AMBER, 0.8))
  const pad = cat(box(8, 126, 72, 44, 28, 30, MAT), coil(50, 148, 30.2, 22, 14))
  return {
    back: cat(base, pillars, slab, pad),
    front: cat(box(8, 170, 70, 3, 30, 35, GUN_LT), box(78, 126, 3, 46, 30, 35, GUN_LT), neon([P(9, 171.6, 33.6), P(77, 171.6, 33.6)], NEON, 1, 2.5))
  }
}

/** L3: a charging pod: a capsule base, a headboard with a status screen, padded rails at the near edges. */
const bedL3 = () => {
  const base = cat(
    box(0, 120, 91, 56, 0, 26, GUN),
    neon([P(91, 121, 13), P(91, 175, 13)], NEON, 1.5, 3),
    neon([P(2, 176, 13), P(90, 176, 13)], NEON, 1.5, 3),
    seamsU(91, [134, 148, 162], 2, 24, GUN_DK, 1),
    slotsU(91, 124, 172, 4, 8, 2, ROBOT_INK, 1)
  )
  const pad = cat(box(4, 124, 83, 48, 26, 30, MAT), coil(40, 148, 30.2, 26, 17))
  const head = cat(
    box(0, 120, 8, 56, 30, 64, GUN_DK),
    screenU(8, 126, 170, 40, 60, NEON),
    traceU(8, [[130, 50], [138, 54], [144, 46], [152, 56], [160, 48], [166, 52]], NEON, 1.1),
    scanU(8, 126, 170, 40, 60),
    led(8, 130, 36, LIME),
    led(8, 138, 36, AMBER, 0.6)
  )
  return {
    back: cat(base, pad, head),
    front: cat(box(85, 124, 4, 52, 30, 38, GUN_LT), box(4, 172, 81, 4, 30, 38, GUN_LT), neon([P(87, 125, 36.6), P(87, 175, 36.6)], PINK, 1, 2.5))
  }
}

/** L4: a canopy pod: the same pod with a tall status screen on the spine and a glass canopy over the sleeper. */
const bedL4 = () => {
  const base = cat(
    box(0, 118, 91, 60, 0, 26, GUN),
    neon([P(91, 119, 13), P(91, 177, 13)], NEON, 1.5, 3),
    neon([P(2, 178, 13), P(90, 178, 13)], NEON, 1.5, 3),
    seamsU(91, [133, 148, 163], 2, 24, GUN_DK, 1),
    slotsU(91, 122, 174, 4, 8, 2, ROBOT_INK, 1)
  )
  const pad = cat(box(4, 122, 83, 52, 26, 30, MAT), coil(40, 148, 30.2, 26, 17))
  const bars = cat(...[0, 1, 2, 3, 4, 5].map((i) => rectU(10, 129 + i * 7.5, 134 + i * 7.5, 96, 100 + i * 3, i < 5 ? LIME : '#3a4a3a', { stroke: null })))
  const spine = cat(
    box(0, 118, 10, 60, 30, 118, GUN_DK),
    box(0, 118, 12, 60, 118, 127, GUN),
    screenU(10, 124, 172, 70, 112, NEON),
    traceU(10, [[130, 100], [138, 106], [146, 94], [156, 108], [164, 98], [168, 104]], NEON, 1.2),
    glowG(LIME, bars, 2),
    scanU(10, 124, 172, 70, 112),
    slotsU(10, 128, 168, 78, 90, 3, NEON, 0.7),
    led(10, 126, 34, LIME),
    led(10, 134, 34, AMBER, 0.5),
    led(10, 142, 34, PINK, 1)
  )
  const posts = cat(box(86, 122, 3, 3, 30, 102, GUN_LT), box(86, 171, 3, 3, 30, 102, GUN_LT), box(4, 171, 3, 3, 30, 102, GUN_LT))
  const beams = cat(box(86, 122, 3, 52, 100, 104, GUN_LT), box(4, 171, 85, 3, 100, 104, GUN_LT))
  const panes = cat(
    glassU(88, 125, 171, 32, 100, 0.15),
    glassV(173, 7, 86, 32, 100, 0.15),
    isoLines([[P(88, 130, 38), P(88, 146, 92)], [P(88, 138, 38), P(88, 154, 92)]], 1.2, '#ffffff', 0.35)
  )
  return { back: cat(base, pad, spine), front: cat(posts, beams, panes) }
}

export const ROBOT_BED = [bedL1, bedL2, bedL3, bedL4]
