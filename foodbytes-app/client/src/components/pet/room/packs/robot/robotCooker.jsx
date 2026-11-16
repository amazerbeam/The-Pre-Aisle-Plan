import { P } from '../../iso'
import { cat, glowG } from '../packShapes'
import { AMBER, GUN, GUN_DK, GUN_LT, LIME, NEON, PINK, ROBOT_INK, STEEL, STEEL_DK } from './robotPalette'
import { S, armSeg, dial, fanBill, hazardV, joint, led, ledOn, neon, scanV, screenV, seamsU, seamsV, slotsV, traceV } from './robotParts'

/**
 * MPP-45: the robot workshop's fab oven, four levels (pip-room-robot.html ROBOT_ROOM.stations.cooker, lines 1169-1208). Steam rises from
 * the vent at STATION_ANCHORS.cookerPot; the creature stands at PIP_COOKER_SPOT; the tray lands at cookerPlate.
 */
const { box, cyl, cylE, ellH, isoLines, rectH, rectV } = S

const OVEN_DARK = '#3a1d0c'
const OVEN_GLOW = '#e07a22'

/** L1: a hot plate on a crate: a glowing coil, a pressure canister with a vent pipe, a tray dock beside it. */
const cookerL1 = () =>
  cat(
    box(97, 0, 42, 30, 0, 22, GUN),
    rectV(30, 100, 136, 4, 18, GUN_DK, { sw: 1 }),
    dial(104, 30, 12),
    dial(112, 30, 12),
    led(128, 30, 12, LIME),
    led(132, 30, 12, AMBER, 0.7),
    seamsU(139, [10, 20], 2, 20, ROBOT_INK, 1),
    box(97, 0, 42, 30, 22, 26, GUN_DK),
    ellH(118, 15, 26.2, 12, 12, '#2a1608', { sw: 1.2 }),
    glowG(AMBER, cat(ellH(118, 15, 26.3, 9, 9, 'none', { stroke: '#ff8a2a', sw: 1.4 }), ellH(118, 15, 26.3, 5, 5, 'none', { stroke: '#ff8a2a', sw: 1.2 })), 3),
    rectH(26.1, 99, 109, 17, 27, GUN_LT, { sw: 0.8 }),
    isoLines([[P(101, 19, 26.2), P(107, 19, 26.2)], [P(101, 25, 26.2), P(107, 25, 26.2)]], 1, ROBOT_INK, 0.7),
    cyl(118, 15, 8.5, 26.5, 39, STEEL_DK),
    cyl(118, 15, 8.8, 31, 33, NEON),
    cylE(118, 15, 8.5, 8.5, 39, 42, STEEL, 6, 6),
    cyl(118, 15, 2.4, 42, 46, GUN_LT),
    ledOn(122, 22, 34, LIME)
  )

/** L2: a countertop fab oven: an oven tower with a glowing window and a vent, beside a counter with a conveyor belt. */
const cookerL2 = () =>
  cat(
    box(60, 0, 40, 36, 0, 66, GUN),
    rectV(36, 63, 97, 28, 56, GUN_DK, { sw: 1.6 }),
    rectV(36, 66, 94, 31, 53, OVEN_DARK, { sw: 1 }),
    glowG(AMBER, rectV(36, 70, 90, 35, 49, AMBER, { stroke: null, op: 0.5 }), 5),
    rectV(36, 76, 84, 36, 42, OVEN_GLOW, { stroke: null }),
    slotsV(36, 66, 94, 33, 33, 1, GUN_LT, 1),
    isoLines([[P(64, 36.5, 60), P(96, 36.5, 60)]], 2.6, STEEL),
    screenV(36, 64, 82, 10, 24, NEON),
    traceV(36, [[66, 16], [70, 20], [74, 14], [78, 19]], NEON, 1),
    dial(88, 36, 19),
    dial(94, 36, 19),
    led(88, 36, 12, LIME),
    led(94, 36, 12, AMBER, 0.6),
    box(59, 0, 42, 37, 66, 68, GUN_DK),
    cyl(80, 19, 3.6, 68, 70, STEEL_DK),
    box(100, 0, 42, 38, 0, 50, GUN),
    seamsV(38, [114, 128], 4, 46, ROBOT_INK, 1),
    hazardV(38, 100, 142, 0, 4, 4),
    isoLines([[P(104, 38.3, 38), P(110, 38.3, 38)], [P(118, 38.3, 38), P(124, 38.3, 38)], [P(132, 38.3, 38), P(138, 38.3, 38)]], 2.4, STEEL),
    box(98, 0, 44, 38, 50, 55, STEEL_DK),
    rectH(55.3, 102, 140, 5, 13, '#232a31', { sw: 1 }),
    isoLines([106, 112, 118, 124, 130].flatMap((u) => [[P(u, 6, 55.4), P(u + 3, 9, 55.4)], [P(u + 3, 9, 55.4), P(u, 12, 55.4)]]), 1, AMBER, 0.75),
    cylE(102, 9, 2.4, 4, 55, 57.5, STEEL),
    box(136, 3, 4, 10, 55, 64, GUN_DK),
    led(138, 13, 61, LIME, 0.3)
  )

/** L3: a fab oven with a robotic arm: a bigger oven tower with a scanned display, an arm on the counter reaching to the tray. */
const cookerL3 = () =>
  cat(
    box(72, 0, 40, 36, 0, 76, GUN),
    rectV(36, 75, 109, 32, 62, GUN_DK, { sw: 1.6 }),
    rectV(36, 78, 106, 35, 59, OVEN_DARK, { sw: 1 }),
    glowG(AMBER, rectV(36, 83, 101, 39, 55, AMBER, { stroke: null, op: 0.5 }), 5),
    rectV(36, 90, 96, 40, 46, OVEN_GLOW, { stroke: null }),
    slotsV(36, 76, 108, 66, 73, 4, ROBOT_INK, 1.1),
    screenV(36, 76, 98, 8, 28, NEON),
    traceV(36, [[78, 14], [82, 22], [86, 12], [90, 20], [94, 16]], NEON, 1),
    scanV(36, 76, 98, 8, 28),
    dial(102, 36, 22),
    dial(102, 36, 14),
    led(106, 36, 28, LIME),
    led(106, 36, 8, PINK, 0.5),
    box(71, 0, 42, 37, 76, 78, GUN_DK),
    cyl(92, 20, 3.6, 78, 80, STEEL_DK),
    box(112, 0, 28, 38, 0, 58, GUN),
    seamsV(38, [126], 4, 54, ROBOT_INK, 1),
    hazardV(38, 112, 140, 0, 4, 4),
    isoLines([[P(116, 38.3, 40), P(122, 38.3, 40)], [P(130, 38.3, 40), P(136, 38.3, 40)]], 2.4, STEEL),
    box(112, 0, 28, 38, 58, 62, STEEL_DK),
    cyl(130, 10, 6, 62, 65, GUN_DK),
    armSeg(P(130, 10, 66), P(126, 12, 78), 4),
    joint(126, 12, 78, 3.2),
    armSeg(P(126, 12, 78), P(119, 19, 69), 3.2),
    joint(119, 19, 69, 2.6),
    armSeg(P(119, 19, 69), P(118, 20, 64), 2.4, STEEL),
    isoLines([[P(116.5, 20, 64), P(116.5, 20, 62.5)], [P(119.5, 20, 64), P(119.5, 20, 62.5)]], 1.6, ROBOT_INK)
  )

/** L4: a full fab line: a control tower, an oven module under an extraction hood and a fan duct, a second arm on the right. */
const cookerL4 = () =>
  cat(
    box(48, 0, 94, 40, 0, 58, GUN),
    seamsV(40, [70, 92, 114, 130], 4, 54, ROBOT_INK, 1),
    hazardV(40, 48, 142, 0, 4, 5),
    isoLines([[P(74, 40.3, 40), P(86, 40.3, 40)], [P(96, 40.3, 40), P(108, 40.3, 40)], [P(118, 40.3, 40), P(126, 40.3, 40)]], 2.4, STEEL),
    box(48, 0, 94, 40, 58, 63, STEEL_DK),
    box(48, 0, 18, 40, 63, 96, GUN_DK),
    screenV(40, 50, 64, 70, 92, NEON),
    traceV(40, [[52, 78], [55, 84], [58, 76], [61, 86]], NEON, 1),
    scanV(40, 50, 64, 70, 92),
    led(53, 40, 67, LIME),
    led(57, 40, 67, AMBER, 0.4),
    led(61, 40, 67, PINK, 0.8),
    box(68, 3, 44, 34, 63, 80, GUN),
    rectV(37, 71, 109, 65, 77, GUN_DK, { sw: 1.4 }),
    glowG(AMBER, rectV(37, 74, 106, 67, 75, OVEN_GLOW, { sw: 1, op: 0.85 }), 5),
    cyl(90, 20, 3.6, 80, 82, STEEL_DK),
    box(68, 0, 3, 3, 63, 98, STEEL_DK),
    box(113, 0, 3, 3, 63, 98, STEEL_DK),
    box(66, 0, 50, 34, 98, 110, GUN),
    neon([P(67, 34.3, 99), P(115, 34.3, 99)], NEON, 1.4, 3),
    slotsV(34, 72, 108, 102, 107, 2, ROBOT_INK, 1),
    box(82, 0, 16, 14, 110, 150, GUN_DK),
    slotsV(14, 82, 98, 116, 144, 2, ROBOT_INK, 2.2),
    fanBill(90, 14, 130, 5.6),
    hazardV(14, 82, 98, 106, 110, 4),
    box(120, 4, 20, 30, 63, 70, GUN_DK),
    led(138, 34, 66, LIME, 0.2),
    cyl(130, 12, 5, 70, 73, GUN),
    armSeg(P(130, 12, 74), P(124, 15, 95), 4),
    joint(124, 15, 95, 3.2),
    armSeg(P(124, 15, 95), P(114, 20, 70), 3.2),
    joint(114, 20, 70, 2.6),
    armSeg(P(114, 20, 70), P(113, 20, 65), 2.4, STEEL)
  )

export const ROBOT_COOKER = [cookerL1, cookerL2, cookerL3, cookerL4]
