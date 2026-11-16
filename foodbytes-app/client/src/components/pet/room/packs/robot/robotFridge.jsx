import { P, ellipsePoints } from '../../iso'
import { cat, glow } from '../packShapes'
import { FROST, GUN, GUN_DK, LIME, AMBER, NEON, PINK, ROBOT_INK, SCREEN, STEEL } from './robotPalette'
import { S, VIAL_COLOURS, hazardU, led, ledOn, neon, rivetsV, scanV, screenV, seamsV, slotsU, slotsV, traceV, vialRows } from './robotParts'

/**
 * MPP-45: the robot workshop's cryo unit, four levels (pip-room-robot.html ROBOT_ROOM.stations.fridge, lines 1135-1166). The LED gauge
 * reads at STATION_ANCHORS.fridgeTop (the top centre of each level).
 */
const { poly, isoLines, box, rectV, bill } = S

const SHELL = '#566371'
const PANE = '#a9eaf5'

/** L1: a cooler box: steel-blue body, latched lid, a frost patch and a snowflake mark. */
const fridgeL1 = () =>
  cat(
    box(146, 0, 40, 28, 0, 24, '#7f97aa'),
    seamsV(28, [157, 168, 179], 3, 21, GUN_DK),
    slotsU(186, 5, 23, 6, 18, 4, GUN_DK),
    box(145, -1, 42, 30, 24, 31, '#4d5c69'),
    poly(ellipsePoints(158, 14, 31.2, 6, 4), FROST, { stroke: null, op: 0.75 }),
    rectV(29, 154, 160, 14, 28, STEEL),
    rectV(29, 172, 178, 14, 28, STEEL),
    rivetsV(29, [157, 175], 17, GUN_DK),
    bill(
      166,
      29,
      11,
      <g stroke={NEON} strokeWidth="1.4" strokeLinecap="round" fill="none" {...glow(NEON, 2)}>
        <path d="M0 -5 V5 M-4.3 -2.5 L4.3 2.5 M-4.3 2.5 L4.3 -2.5" />
      </g>
    ),
    isoLines([[P(187, 8, 17), P(187, 20, 17)], [P(186, 9, 15), P(187, 9, 17)], [P(186, 19, 15), P(187, 19, 17)]], 2.6, STEEL),
    ledOn(181, 6, 31, LIME)
  )

/** L2: a mini cryo unit: a frosted window with sample vials, a small display and indicator lights. */
const fridgeL2 = () =>
  cat(
    box(146, 0, 40, 34, 0, 52, GUN),
    rectV(34, 148, 184, 0, 4, GUN_DK),
    rectV(34, 150, 182, 18, 48, GUN_DK, { sw: 1.6 }),
    rectV(34, 152, 180, 20, 46, '#bfeaf2', { sw: 1 }),
    vialRows(34, 152, 180, [21, 33], 8, 5.5),
    rectV(34, 152, 180, 38, 46, FROST, { stroke: null, op: 0.55 }),
    screenV(34, 152, 170, 5, 15, NEON),
    traceV(34, [[154, 9], [158, 12], [162, 8], [166, 12], [168, 10]], NEON, 1),
    led(176, 34, 12, LIME),
    led(180, 34, 9, AMBER, 0.7),
    rectV(34, 182.4, 184.4, 22, 44, STEEL, { sw: 1 }),
    box(146, 0, 40, 34, 52, 58, GUN_DK),
    slotsV(34, 150, 176, 54, 56, 2, ROBOT_INK, 1),
    slotsU(186, 5, 29, 8, 44, 7, ROBOT_INK, 1)
  )

/** L3: a cryo fridge: a door window showing four shelves of vials, a control strip and a glowing kick plate. */
const fridgeL3 = () =>
  cat(
    box(140, 0, 46, 38, 0, 106, GUN),
    box(140, 0, 46, 38, 106, 112, GUN_DK),
    rectV(38, 141, 185, 0, 6, GUN_DK),
    rectV(38, 145, 181, 10, 98, SHELL, { sw: 1.6 }),
    rectV(38, 148, 178, 16, 92, PANE, { sw: 1 }),
    vialRows(38, 148, 178, [16, 38, 60, 82], 7, 6),
    rectV(38, 148, 178, 78, 92, FROST, { stroke: null, op: 0.45 }),
    rectV(38, 181.5, 184, 32, 76, STEEL, { sw: 1 }),
    screenV(38, 148, 170, 99, 105, NEON),
    traceV(38, [[150, 102], [155, 104], [160, 101], [166, 103]], NEON, 0.9),
    led(176, 38, 102, LIME),
    led(180, 38, 102, AMBER, 0.6),
    neon([P(142, 38.2, 7), P(184, 38.2, 7)], NEON, 1.2, 2.5),
    slotsU(186, 5, 33, 12, 96, 10, ROBOT_INK, 1),
    hazardU(186, 6, 32, 98, 104, 4)
  )

/** L4: a twin-door cryo bank: two vial-stocked doors either side of a control column of status lights. */
const fridgeL4 = () =>
  cat(
    box(124, 0, 64, 40, 0, 114, GUN),
    box(124, 0, 64, 40, 114, 120, GUN_DK),
    rectV(40, 125, 187, 0, 8, GUN_DK),
    ...[[128, 152], [160, 184]].map(([a, b]) =>
      cat(
        rectV(40, a, b, 12, 106, SHELL, { sw: 1.6 }),
        rectV(40, a + 3, b - 3, 18, 100, PANE, { sw: 1 }),
        vialRows(40, a + 3, b - 3, [18, 40, 62, 84], 7, 5),
        rectV(40, a + 3, b - 3, 88, 100, FROST, { stroke: null, op: 0.45 })
      )
    ),
    rectV(40, 152, 160, 12, 106, GUN_DK, { sw: 1.2 }),
    screenV(40, 153, 159, 72, 102, NEON),
    traceV(40, [[154, 96], [156, 90], [158, 94], [156, 82], [154, 78]], NEON, 1),
    scanV(40, 153, 159, 72, 102),
    ...[14, 22, 30, 38, 46, 54].map((h, i) => led(156, 40, h, VIAL_COLOURS[i % 4], i * 0.35)),
    rectV(40, 149.2, 151.2, 38, 74, STEEL, { sw: 1 }),
    rectV(40, 160.8, 162.8, 38, 74, STEEL, { sw: 1 }),
    neon([P(126, 40.2, 9.5), P(186, 40.2, 9.5)], NEON, 1.2, 2.5),
    rectV(40, 140, 172, 108, 113, SCREEN, { sw: 1 }),
    neon([P(142, 40.3, 110.5), P(170, 40.3, 110.5)], PINK, 1.2, 2.5),
    slotsU(188, 5, 35, 12, 100, 12, ROBOT_INK, 1),
    hazardU(188, 4, 36, 104, 111, 5)
  )

export const ROBOT_FRIDGE = [fridgeL1, fridgeL2, fridgeL3, fridgeL4]
