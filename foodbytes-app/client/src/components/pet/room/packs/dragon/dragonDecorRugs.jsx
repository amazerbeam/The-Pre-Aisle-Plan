import { P, ellipsePoints } from '../../iso'
import { RUG } from '../../roomLayout'
import { arcPts, cat, rnd } from '../packShapes'
import { CLOAK, DRAGON_INK, GOLD, GOLD_DK } from './dragonPalette'
import { BONE, TEAL, TEAL_HI, ellBand, ringLine } from './dragonDecorParts'
import { S } from './dragonParts'
import { pelt } from './dragonTreasure'

/**
 * MPP-46: the lair's 6 rug decor drawings (pip-room-dragon.html DRAGON_ROOM.decor, rug), flat on the floor inside RUG.
 * World coords.
 */
const { poly, isoLines, ellH, rectH, bill } = S
const INK = DRAGON_INK

export const DRAGON_RUG_DECOR = {
  /* ---------- rug (flat on the floor inside RUG: centre 140,150, radii 58 x 44) ---------- */
  // a crimson rug with a gold dashed ring
  'rug-pink': () => {
    const { cu, cv, ru, rv } = RUG
    return cat(
      ellH(cu, cv, 0, ru, rv, '#8e2f3a', { sw: 2 }),
      ellH(cu, cv, 1, ru - 6, rv - 5, '#a8404c', { stroke: null }),
      ringLine(cu, cv, 1.2, 40, 30, 2, GOLD, '6 5')
    )
  },
  // concentric braided rings of hide
  'rug-braided': () => {
    const { cu, cv } = RUG
    const rings = [[58, 44, '#5a3a20'], [52, 39, '#8a5a35'], [46, 34, '#a87848'], [40, 29.5, '#8a5a35'], [34, 25, '#a87848'], [28, 20.5, '#8a5a35'], [22, 16, '#a87848'], [16, 11.5, '#6a4526']]
    return cat(
      ...rings.map(([a, b, c], i) => ellH(cu, cv, i ? 1.4 : 0, a, b, c, i ? { stroke: null } : { sw: 2 })),
      ...[49, 37, 25].map((k) => ringLine(cu, cv, 1.6, k, (k * 44) / 58, 1.4, '#4a2c18', '3 4'))
    )
  },
  // a green dragon-scale rug: overlapping scale arcs inside a gold ring
  'rug-leaf': () => {
    const { cu, cv, ru, rv } = RUG
    const scales = []
    for (let row = -4; row <= 4; row++) {
      for (let col = -7; col <= 7; col++) {
        const du = col * 7.4 + (row % 2 ? 3.7 : 0)
        const dv = row * 8.6
        if ((du / (ru - 7)) ** 2 + (dv / (rv - 6)) ** 2 > 1) continue
        scales.push(poly(arcPts(cu + du, cv + dv, 1, 3.7, 4.2, 0, Math.PI, 8), (row + col) % 2 ? '#2f8f7a' : TEAL_HI, { stroke: '#183a30', sw: 0.9 }))
      }
    }
    return cat(ellH(cu, cv, 0, ru, rv, '#24574a', { sw: 2 }), ...scales, ringLine(cu, cv, 1.3, ru - 3, rv - 2.3, 2, GOLD))
  },
  // warband stripes: seven bands of crimson, gold, bone and teal
  'rug-stripe': () => {
    const { cu, cv, ru, rv } = RUG
    return cat(
      ellH(cu, cv, 0, ru, rv, CLOAK, { sw: 2 }),
      ...[CLOAK, GOLD, BONE, TEAL, BONE, GOLD, CLOAK].map((c, i) => ellBand(cu, cv, ru - 3, rv - 2.4, -1 + (i * 2) / 7, -1 + ((i + 1) * 2) / 7, 1, c)),
      ringLine(cu, cv, 1.4, ru - 1.5, rv - 1.2, 1.4, GOLD_DK)
    )
  },
  // a plaid feast blanket with a goblet and a roast leg
  'rug-picnic': () => {
    const checks = []
    for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) if ((i + j) % 2 === 0) checks.push(rectH(0.4, 100 + i * 10, 110 + i * 10, 120 + j * 10, 130 + j * 10, BONE, { stroke: null, op: 0.85 }))
    return cat(
      rectH(0, 100, 180, 120, 180, '#7a2a35', { sw: 2 }),
      ...checks,
      bill(
        108,
        128,
        0.6,
        <>
          <path d="M-4 -7 h8 q0 5 -4 6 q-4 -1 -4 -6z" fill={GOLD} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M0 -1 v3" stroke={INK} strokeWidth="1.4" />
          <ellipse cy="2" rx="3" ry="1" fill={GOLD_DK} stroke={INK} strokeWidth="1" />
        </>
      ),
      bill(
        172,
        172,
        0.6,
        <>
          <path d="M-6 -3 q5 -8 11 -3 q2 4 -2 6 q-6 2 -9 -3z" fill="#b5502e" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M5 -6 l5 -3" stroke={BONE} strokeWidth="3" strokeLinecap="round" />
          <circle cx="10.5" cy="-9" r="1.8" fill={BONE} stroke={INK} strokeWidth=".8" />
        </>
      )
    )
  },
  // a big cave-bear pelt: a scalloped hide with darker flecks and a lighter back
  'rug-sheepskin': () => {
    const { cu, cv } = RUG
    const g = rnd(21)
    const segs = []
    for (let i = 0; i < 40; i++) {
      const a = g() * Math.PI * 2
      const d = Math.sqrt(g()) * 0.8
      const u = cu + 52 * d * Math.cos(a)
      const v = cv + 40 * d * Math.sin(a)
      const l = 2 + g() * 2.4
      const t = g() * Math.PI
      segs.push([P(u, v, 0.6), P(u + Math.cos(t) * l, v + Math.sin(t) * l * 0.76, 0.6)])
    }
    const lobes = [[32, 22], [32, -22], [-32, 22], [-32, -22]].map(([du, dv]) =>
      cat(
        poly(ellipsePoints(cu + du, cv + dv, 0, 10, 7, 14), '#8b6b4a', { sw: 1.4 }),
        ...[-1, 0, 1].map((k) => poly(ellipsePoints(cu + du + Math.sign(du) * 9.2, cv + dv + k * 3, 0.5, 1.1, 1.1, 6), BONE, { stroke: null }))
      )
    )
    const head = cat(
      poly(ellipsePoints(cu + 46, cv, 0, 9, 8, 14), '#8b6b4a', { sw: 1.4 }),
      ...[-1, 1].map((s) => poly(ellipsePoints(cu + 41, cv + s * 6.4, 0.6, 2.6, 2.2, 8), '#5a4026', { sw: 1 })),
      poly(ellipsePoints(cu + 53.4, cv, 0.8, 1.7, 1.5, 8), '#2b2630', { stroke: null })
    )
    return cat(...lobes, head, pelt(cu, cv, 52, 40, 0, '#8b6b4a', 7), pelt(cu, cv, 38, 28, 0.4, '#a98660', 9), isoLines(segs, 1, '#4a3320', 0.7))
  }
}
