import { P } from '../../iso'
import { RUG } from '../../roomLayout'
import { cat, glowG } from '../packShapes'
import { AMBER, HAZ, HAZ_DK, NEON, PINK, ROBOT_INK, STEEL } from './robotPalette'
import { INKBLUE, PLATE, ellBand, ringLine } from './robotDecorParts'
import { S } from './robotParts'

/**
 * MPP-47: the workshop's six floor mats (pip-room-robot.html ROBOT_ROOM.decor lines 1435-1489), flat on the floor inside RUG.
 */
const { rectH, ellH, isoLines, bill } = S

export const ROBOT_RUG_DECOR = {
  /* ---------- rug (flat on the floor inside RUG: centre 140,150, radii 58 x 44) ---------- */
  // a rubber floor mat with a dashed neon ring
  'rug-pink': () => {
    const { cu, cv, ru, rv } = RUG
    return cat(
      ellH(cu, cv, 0, ru, rv, '#2c3844', { sw: 2 }),
      ellH(cu, cv, 1, ru - 6, rv - 5, '#364453', { stroke: null }),
      glowG(NEON, ringLine(cu, cv, 1.2, 40, 30, 1.8, NEON, '6 5'), 2)
    )
  },
  // an anti-static mat: concentric green rings with dashed seams
  'rug-braided': () => {
    const { cu, cv } = RUG
    const rings = [[58, 44, '#25302a'], [52, 39, '#3d5a46'], [46, 34, '#4f7a5c'], [40, 29.5, '#3d5a46'], [34, 25, '#4f7a5c'], [28, 20.5, '#3d5a46'], [22, 16, '#4f7a5c'], [16, 11.5, '#2f4437']]
    return cat(
      ...rings.map(([a, b, c], i) => ellH(cu, cv, i ? 1.4 : 0, a, b, c, i ? { stroke: null } : { sw: 2 })),
      ...[49, 37, 25].map((k) => ringLine(cu, cv, 1.6, k, (k * 44) / 58, 1.2, '#1c2a22', '3 4'))
    )
  },
  // a circuit mat: a green board with traces and gold solder pads inside an amber ring
  'rug-leaf': () => {
    const { cu, cv, ru, rv } = RUG
    const traces = []
    const pads = []
    for (let row = -3; row <= 3; row++) {
      for (let col = -6; col <= 6; col++) {
        const du = col * 8
        const dv = row * 9.5
        if ((du / (ru - 9)) ** 2 + (dv / (rv - 7)) ** 2 > 1) continue
        const dir = (row + col) % 2 ? 4.5 : -4.5
        traces.push([P(cu + du, cv + dv, 1), P(cu + du + 4, cv + dv, 1)], [P(cu + du + 4, cv + dv, 1), P(cu + du + 4, cv + dv + dir, 1)])
        pads.push(ellH(cu + du, cv + dv, 1.2, 1.3, 1.1, '#d9b34a', { stroke: null }))
      }
    }
    return cat(ellH(cu, cv, 0, ru, rv, '#173a33', { sw: 2 }), isoLines(traces, 1.1, '#6fe0c0', 0.85), ...pads, ringLine(cu, cv, 1.3, ru - 3, rv - 2.3, 1.6, AMBER))
  },
  // a hazard mat: seven bands of amber and dark
  'rug-stripe': () => {
    const { cu, cv, ru, rv } = RUG
    return cat(
      ellH(cu, cv, 0, ru, rv, HAZ_DK, { sw: 2 }),
      ...[HAZ_DK, HAZ, HAZ_DK, HAZ, HAZ_DK, HAZ, HAZ_DK].map((c, i) => ellBand(cu, cv, ru - 3, rv - 2.4, -1 + (i * 2) / 7, -1 + ((i + 1) * 2) / 7, 1, c)),
      ringLine(cu, cv, 1.4, ru - 1.5, rv - 1.2, 1.4, '#7a5d0f')
    )
  },
  // a tool-outline mat: a foam sheet with cut-out slots, a battery cell and a screwdriver lying on it
  'rug-picnic': () => {
    const parts = [rectH(0, 100, 180, 120, 180, PLATE, { sw: 2 }), rectH(0.4, 104, 176, 124, 176, 'none', { stroke: HAZ, sw: 1.2 })]
    for (const [u, v, w, d] of [[108, 128, 34, 6], [108, 140, 26, 6], [108, 152, 38, 6], [152, 126, 18, 24]]) parts.push(rectH(0.5, u, u + w, v, v + d, INKBLUE, { stroke: '#5b6b7b', sw: 0.7 }))
    return cat(
      ...parts,
      bill(
        166,
        138,
        0.6,
        <>
          <rect x="-7" y="-6" width="14" height="6.4" rx="1.4" fill={AMBER} stroke={ROBOT_INK} strokeWidth="1.2" />
          <rect x="7" y="-4.4" width="2.2" height="3.2" fill={STEEL} stroke={ROBOT_INK} strokeWidth=".8" />
          <path d="M-4 -3 h5" stroke={HAZ_DK} strokeWidth="1.4" strokeLinecap="round" />
        </>
      ),
      bill(
        124,
        156,
        0.6,
        <>
          <rect x="-14" y="-5" width="9" height="5" rx="2" fill={PINK} stroke={ROBOT_INK} strokeWidth="1.2" />
          <rect x="-5" y="-3.4" width="19" height="1.8" fill={STEEL} stroke={ROBOT_INK} strokeWidth=".9" />
        </>
      )
    )
  },
  // an egg-crate foam pad: a grey pad with a grid of dimples
  'rug-sheepskin': () => {
    const { cu, cv } = RUG
    const dimples = []
    for (let row = -4; row <= 4; row++)
      for (let col = -5; col <= 5; col++) {
        const du = col * 8.6 + (row % 2 ? 4.3 : 0)
        const dv = row * 7
        if ((du / 42) ** 2 + (dv / 32) ** 2 <= 1) dimples.push(ellH(cu + du, cv + dv, 0.8, 2.6, 1.9, '#2f3945', { stroke: null }))
      }
    return cat(ellH(cu, cv, 0, 52, 40, '#3b4552', { sw: 1.6 }), ellH(cu, cv, 0.4, 47, 36, '#4a5666', { stroke: null }), ...dimples)
  }
}
