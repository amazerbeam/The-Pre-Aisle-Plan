import { ROOM_SIZE } from '../../../../../constants/petRoom'
import { P, ellipsePoints, pts, shade } from '../../iso'
import { cat, fmt, glowG, rnd, xy } from '../packShapes'
import { S } from './dragonParts'

/**
 * MPP-45: the dragon lair's four floor patterns (pip-room-dragon.html lines 811-860), split from dragonShell.jsx to keep both under
 * the file budget. Each takes the resolved floor style and draws over its base.
 */
const { poly, isoLine } = S
const { u: ROOM_U, v: ROOM_V } = ROOM_SIZE

function earthFloor(f) {
  const r = rnd(5)
  const out = []
  for (let i = 0; i < 9; i++) out.push(poly(ellipsePoints(14 + r() * 230, 14 + r() * 270, 0, 12 + r() * 14, 8 + r() * 10), shade(f.base, -9), { stroke: null, op: 0.45 }))
  for (let i = 0; i < 52; i++) {
    const [u, v] = [8 + r() * 244, 8 + r() * 284]
    out.push(poly(ellipsePoints(u, v, 0, 2.4 + r() * 2.6, 1.4 + r() * 1.6, 10), shade(f.base, r() < 0.5 ? 16 : -20), { stroke: null }))
  }
  for (let k = 0; k < 6; k++) {
    let u = 20 + r() * 220
    let v = 20 + r() * 260
    const path = [P(u, v)]
    for (let i = 0; i < 5; i++) {
      u += (r() - 0.5) * 16
      v += (r() - 0.3) * 14
      path.push(P(u, v))
    }
    out.push(isoLine(path, 1, shade(f.base, -34), { op: 0.7 }))
  }
  return cat(...out)
}

function flagFloor(f) {
  const r = rnd(9)
  const ROW = 36
  const tints = []
  let seams = ''
  for (let v = 0; v < ROOM_V; v += ROW) {
    const v1 = Math.min(v + ROW, ROOM_V)
    let u = -(((v / ROW) % 2) * 22)
    while (u < ROOM_U) {
      const sw = 44 + Math.floor(r() * 24)
      const u0 = Math.max(u, 0)
      const u1 = Math.min(u + sw, ROOM_U)
      const pick = r()
      if (u1 > u0 && pick < 0.7) tints.push(<polygon points={pts([P(u0, v), P(u1, v), P(u1, v1), P(u0, v1)])} fill={pick < 0.35 ? '#ffffff' : '#000000'} opacity=".07" />)
      if (u1 < ROOM_U && u1 > 0) seams += `M${xy(P(u1, v))}L${xy(P(u1, v1))}`
      u += sw
    }
    if (v > 0) seams += `M${xy(P(0, v))}L${xy(P(ROOM_U, v))}`
  }
  return cat(...tints, <path d={seams} fill="none" stroke={shade(f.base, -32)} strokeWidth="1.4" strokeLinecap="round" />)
}

function slateFloor(f) {
  const r = rnd(14)
  const STEP = 30
  const tints = []
  let dark = ''
  let light = ''
  for (let a = 0; a * STEP < ROOM_U; a++) {
    for (let b = 0; b * STEP < ROOM_V; b++) {
      const [u0, v0] = [a * STEP, b * STEP]
      const [u1, v1] = [Math.min(u0 + STEP, ROOM_U), Math.min(v0 + STEP, ROOM_V)]
      const pick = r()
      if (pick < 0.55) tints.push(<polygon points={pts([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)])} fill={pick < 0.28 ? '#ffffff' : '#000000'} opacity=".07" />)
    }
  }
  for (let k = STEP; k < ROOM_V; k += STEP) {
    dark += `M${xy(P(0, k))}L${xy(P(ROOM_U, k))}`
    light += `M${xy(P(0, k + 1.5))}L${xy(P(ROOM_U, k + 1.5))}`
  }
  for (let k = STEP; k < ROOM_U; k += STEP) {
    dark += `M${xy(P(k, 0))}L${xy(P(k, ROOM_V))}`
    light += `M${xy(P(k + 1.5, 0))}L${xy(P(k + 1.5, ROOM_V))}`
  }
  return cat(
    ...tints,
    <path d={dark} fill="none" stroke={shade(f.base, -38)} strokeWidth="1.4" />,
    <path d={light} fill="none" stroke={shade(f.base, 22)} strokeWidth=".8" opacity=".7" />
  )
}

function runeFloor(f) {
  const STEP = 25
  const tiles = []
  const runes = []
  for (let a = 0; a * STEP < ROOM_U; a++) {
    for (let b = 0; b * STEP < ROOM_V; b++) {
      const [u0, v0] = [a * STEP, b * STEP]
      const [u1, v1] = [Math.min(u0 + STEP, ROOM_U), Math.min(v0 + STEP, ROOM_V)]
      if ((a + b) % 2) tiles.push(<polygon points={pts([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)])} fill={f.checker} />)
      if ((a * 3 + b * 5) % 7 === 0 && u1 - u0 === STEP && v1 - v0 === STEP) {
        const [x, y] = P(u0 + STEP / 2, v0 + STEP / 2)
        runes.push(
          <g transform={`translate(${fmt(x)} ${fmt(y)}) scale(1 .5)`}>
            <path d="M-4 -5 L4 5 M4 -5 L-4 5 M0 -8 V8" fill="none" stroke="#7de3ff" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        )
      }
    }
  }
  return cat(...tiles, glowG('#7de3ff', cat(...runes), 3))
}

export const FLOORS = { earth: earthFloor, flags: flagFloor, slate: slateFloor, runes: runeFloor }

