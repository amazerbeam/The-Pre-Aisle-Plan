import { ROOM_SIZE } from '../../../../../constants/petRoom'
import { P, pts, shade } from '../../iso'
import { rnd, xy } from '../packShapes'
import { HAZ_DK, NEON } from './robotPalette'

/**
 * MPP-45: the robot workshop's four floor patterns (pip-room-robot.html lines 878-931): rubber mat, diamond plate, grate and hazard
 * checker, split out of robotShell.jsx for the 400-line budget. Each takes the resolved ROBOT_STYLES floor entry.
 */
const { u: ROOM_U, v: ROOM_V } = ROOM_SIZE

/** Rubber mat: fine ribs along v, tile seams, a few scuffs. */
function matFloor(f) {
  const r = rnd(5)
  let ribs = ''
  let seams = ''
  let scuffs = ''
  for (let v = 6; v < ROOM_V; v += 8) ribs += `M${xy(P(0, v))}L${xy(P(ROOM_U, v))}`
  for (let u = 65; u < ROOM_U; u += 65) seams += `M${xy(P(u, 0))}L${xy(P(u, ROOM_V))}`
  for (let v = 75; v < ROOM_V; v += 75) seams += `M${xy(P(0, v))}L${xy(P(ROOM_U, v))}`
  for (let k = 0; k < 18; k++) {
    const u = 10 + r() * 230
    const v = 10 + r() * 280
    const l = 6 + r() * 12
    scuffs += `M${xy(P(u, v))}L${xy(P(u + l, v + l * 0.3))}`
  }
  return (
    <>
      <path d={ribs} fill="none" stroke={shade(f.base, 9)} strokeWidth=".8" opacity=".55" />
      <path d={seams} fill="none" stroke={shade(f.base, -38)} strokeWidth="1.6" />
      <path d={scuffs} fill="none" stroke={shade(f.base, 24)} strokeWidth="1.1" opacity=".5" strokeLinecap="round" />
    </>
  )
}

/** Diamond plate: alternating lozenge ridges in a staggered grid. */
function diamondFloor(f) {
  const STEP = 13
  let hi = ''
  let lo = ''
  for (let a = 0; a * STEP < ROOM_U - STEP; a++) {
    for (let b = 0; b * STEP < ROOM_V - STEP; b++) {
      const cu = a * STEP + STEP / 2
      const cv = b * STEP + STEP / 2
      const flip = (a + b) % 2
      const p = flip ? [cu - 3.4, cv - 1.4, cu + 3.4, cv + 1.4] : [cu - 1.4, cv - 3.4, cu + 1.4, cv + 3.4]
      hi += `M${xy(P(p[0], p[1]))}L${xy(P(p[2], p[3]))}`
      lo += `M${xy(P(p[0] + 0.8, p[1] + 0.8))}L${xy(P(p[2] + 0.8, p[3] + 0.8))}`
    }
  }
  return (
    <>
      <path d={lo} fill="none" stroke={shade(f.base, -34)} strokeWidth="1.4" strokeLinecap="round" />
      <path d={hi} fill="none" stroke={shade(f.base, 30)} strokeWidth="1.3" strokeLinecap="round" />
    </>
  )
}

/** Floor grate: dark pit, bright bars along v, cross bars every 26. */
function grateFloor(f) {
  let bars = ''
  let cross = ''
  let glowLines = ''
  for (let u = 4; u < ROOM_U; u += 6) bars += `M${xy(P(u, 0))}L${xy(P(u, ROOM_V))}`
  for (let v = 0; v <= ROOM_V; v += 26) cross += `M${xy(P(0, v))}L${xy(P(ROOM_U, v))}`
  for (let v = 39; v < ROOM_V; v += 78) glowLines += `M${xy(P(0, v))}L${xy(P(ROOM_U, v))}`
  return (
    <>
      <path d={glowLines} fill="none" stroke={NEON} strokeWidth="3" opacity=".12" />
      <path d={bars} fill="none" stroke={shade(f.base, 55)} strokeWidth="1.3" />
      <path d={cross} fill="none" stroke={shade(f.base, 38)} strokeWidth="2.4" />
    </>
  )
}

/** Hazard checker: dark and amber tiles, the amber ones striped. */
function hazardFloor(f) {
  const STEP = 26
  const tiles = []
  let stripes = ''
  for (let a = 0; a * STEP < ROOM_U; a++) {
    for (let b = 0; b * STEP < ROOM_V; b++) {
      const [u0, v0] = [a * STEP, b * STEP]
      const [u1, v1] = [Math.min(u0 + STEP, ROOM_U), Math.min(v0 + STEP, ROOM_V)]
      if ((a + b) % 2) {
        tiles.push(<polygon key={`${a}-${b}`} points={pts([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)])} fill={f.checker} />)
        if (u1 - u0 === STEP && v1 - v0 === STEP) {
          for (const k of [6.5, 13, 19.5]) stripes += `M${xy(P(u0 + k, v0))}L${xy(P(u0, v0 + k))}M${xy(P(u1, v0 + k))}L${xy(P(u0 + k, v1))}`
        }
      }
    }
  }
  return (
    <>
      {tiles}
      <path d={stripes} fill="none" stroke={HAZ_DK} strokeWidth="2.4" opacity=".85" />
    </>
  )
}

export const FLOORS = { mat: matFloor, diamond: diamondFloor, grate: grateFloor, hazard: hazardFloor }
