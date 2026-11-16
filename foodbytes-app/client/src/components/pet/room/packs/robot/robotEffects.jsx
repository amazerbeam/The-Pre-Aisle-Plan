import { fridgeGaugeColour } from '../../../../../utils/fridgeFill'
import { FRIDGE_GAUGE_LIFT, SLEEP_Z_LIFT, STATION_ANCHORS } from '../../roomLayout'
import { cat, fmt, glow, glowG } from '../packShapes'
import { NEON, ROBOT_INK, SCREEN, STEEL, STEEL_DK } from './robotPalette'
import { S } from './robotParts'

/**
 * MPP-45: the robot workshop's effects as components (pip-room-robot.html ROBOT_ROOM.effects, lines 1618-1650), props as
 * roomEffects.jsx. `nightDim` is not ported: the live NightDim HTML layer already exists. Like the mockup, each is drawn in its
 * station's own art coords, so PetRoom places it inside that station's shifted group.
 */
const { bill, fxg } = S

/** LED gauge: a dark housing with ten bars, lit in the live gauge colours, at STATION_ANCHORS.fridgeTop + the live lift. */
export function FridgeGauge({ level, pct }) {
  const [u, v, h] = STATION_ANCHORS.fridgeTop[level - 1]
  const lit = Math.ceil(pct / 10)
  const col = fridgeGaugeColour(pct)
  const on = []
  const off = []
  for (let i = 0; i < 10; i++) {
    const seg = <rect key={i} x={fmt(-17 + i * 3.5)} y="-5" width="2.7" height="6" rx=".6" fill={i < lit ? col : '#2a3a46'} />
    if (i < lit) on.push(seg)
    else off.push(seg)
  }
  return bill(
    u,
    v,
    h + FRIDGE_GAUGE_LIFT,
    <>
      <rect x="-19.5" y="-7.5" width="39" height="11" rx="2.5" fill={SCREEN} stroke={ROBOT_INK} strokeWidth="1.4" />
      {off}
      {lit ? glowG(col, on, 2.5) : null}
    </>
  )
}

/** Vapour off the fab oven vent: three wisps rising and fading (animated). */
export function PotSteam({ level }) {
  const [u, v, h] = STATION_ANCHORS.cookerPot[level - 1]
  return bill(
    u,
    v,
    h,
    fxg('steam', <path d="M-6 -3 q5 -8 0 -14 M2 -4 q6 -9 0 -16 M9 -2 q5 -7 0 -12" stroke="#dff7ff" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".92" />)
  )
}

const Z = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [3, 1], [2, 2], [1, 3], [0, 4], [1, 4], [2, 4], [3, 4], [4, 4]]

/** A pixel-font z glyph at (x, y) with cell size s, glowing. */
const pixelZ = (x, y, s) =>
  glowG(NEON, cat(...Z.map(([i, j]) => <rect key={`${i}${j}`} x={fmt(x + i * s)} y={fmt(y + j * s)} width={fmt(s)} height={fmt(s)} fill="#dff7ff" />)), 2.5)

/** Pixel-font z glyphs above the pod, drifting up (animated). */
export function SleepZs({ level }) {
  const [u, v, h] = STATION_ANCHORS.bedTop[level - 1]
  return bill(u, v, h + SLEEP_Z_LIFT, fxg('zzz', cat(pixelZ(8, -14, 2.4), pixelZ(24, -30, 1.8))))
}

/** The dish that appears when a meal is served: a steel tray with a printed ration block. */
export function ServedPlate({ level }) {
  const [u, v, h] = STATION_ANCHORS.cookerPlate[level - 1]
  return bill(
    u,
    v,
    h,
    <>
      <ellipse cx="0" cy="-2" rx="12" ry="5" fill={STEEL} stroke={ROBOT_INK} strokeWidth="1.4" />
      <ellipse cx="0" cy="-3" rx="9" ry="3.2" fill={STEEL_DK} />
      <rect x="-6" y="-10" width="12" height="7" rx="2" fill="#e8923a" stroke={ROBOT_INK} strokeWidth="1.2" />
      <path d="M-4 -8 h8" stroke="#ffd9a8" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="9" cy="-6" r="1.4" fill={NEON} {...glow(NEON, 2)} />
    </>
  )
}
