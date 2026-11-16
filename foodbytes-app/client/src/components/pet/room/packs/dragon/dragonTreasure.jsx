import { P, ellipsePoints, shade } from '../../iso'
import { arcPts, cat, nearRange, rnd } from '../packShapes'
import { CLOAK, DRAGON_INK, GOLD, GOLD_DK, STEEL, STEEL_DK } from './dragonPalette'
import { S } from './dragonParts'

/**
 * MPP-45: the dragon lair's trophies, armour and nest drawings (pip-room-dragon.html lines 898-1100), ported to JSX.
 * Split from dragonParts.jsx to keep both under the file budget.
 */
const { poly, isoLines, ellH, bill } = S
const INK = DRAGON_INK

/** A trophy cup billboard (s = scale). */
export const trophy = (u, v, h, s = 0.6) =>
  bill(
    u,
    v,
    h,
    <g transform={`scale(${s})`}>
      <path d="M-9 -24 h18 q0 12 -9 14 q-9 -2 -9 -14z" fill={GOLD} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-9 -22 q-7 0 -5 7 q2 4 6 3 M9 -22 q7 0 5 7 q-2 4 -6 3" fill="none" stroke={INK} strokeWidth="1.6" />
      <rect x="-1.8" y="-10" width="3.6" height="6" fill={GOLD_DK} />
      <rect x="-7" y="-4" width="14" height="4" rx="1" fill={GOLD_DK} stroke={INK} strokeWidth="1.4" />
      <path d="M-5 -21 q0 6 3 8" fill="none" stroke="#fff6c2" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  )

/** A rosette ribbon billboard. */
export const ribbon = (u, v, h, s = 0.6, color = '#c0392b') =>
  bill(
    u,
    v,
    h,
    <g transform={`scale(${s})`}>
      <path d="M-6 -2 l-4 12 l6 -3 l3 5z M6 -2 l4 12 l-6 -3 l-3 5z" fill={color} stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="0" cy="-8" r="9" fill={color} stroke={INK} strokeWidth="1.5" />
      <circle cx="0" cy="-8" r="4.6" fill={GOLD} stroke={INK} strokeWidth="1.1" />
    </g>
  )

/** A crown billboard (hoard top). */
export const crown = (u, v, h, s = 0.6) =>
  bill(
    u,
    v,
    h,
    <g transform={`scale(${s})`}>
      <path d="M-12 0 l-2 -16 l7 7 l7 -13 l7 13 l7 -7 l-2 16z" fill={GOLD} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="-12" y="-2" width="24" height="4" fill={GOLD_DK} stroke={INK} strokeWidth="1.2" />
      <circle cx="0" cy="-8" r="2" fill="#d63a4a" />
      <circle cx="-7" cy="-5" r="1.4" fill="#4aa8e8" />
      <circle cx="7" cy="-5" r="1.4" fill="#5cc46a" />
    </g>
  )

/** A horned helm billboard (s = scale), standing on a shelf. */
export const helm = (u, v, h, s = 0.8) =>
  bill(
    u,
    v,
    h,
    <g transform={`scale(${s})`}>
      <path d="M-9 0 Q-9 -17 0 -17 Q9 -17 9 0 Z" fill={STEEL} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-9 -1 h18" stroke={INK} strokeWidth="1.6" />
      <path d="M-6 -8 h12" stroke="#1c2024" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M0 -17 v9" stroke={STEEL_DK} strokeWidth="1.4" />
      <path d="M-9 -9 Q-16 -10 -14 -20 M9 -9 Q16 -10 14 -20" fill="none" stroke="#f7ead0" strokeWidth="3" strokeLinecap="round" />
      <path d="M-9 -9 Q-16 -10 -14 -20 M9 -9 Q16 -10 14 -20" fill="none" stroke={INK} strokeWidth=".7" strokeLinecap="round" />
    </g>
  )

/** A suit of armour billboard (origin at the feet), scaled s. full = greaves and arms, else the plates float on a stand; plume = a crest. */
export function armour(u, v, h, full, plume, s) {
  const k = { stroke: INK, strokeWidth: 1.5, strokeLinejoin: 'round' }
  return bill(
    u,
    v,
    h,
    <g transform={`scale(${s})`}>
      {full && (
        <>
          <path d="M-10 -28 h8 v24 h-10z M2 -28 h8 v24 h2z" fill={STEEL_DK} {...k} />
          <path d="M-12 -4 h10 v4 h-12z M2 -4 h10 v4 h2z" fill="#5a3a1f" {...k} />
          <rect x="-19" y="-58" width="6" height="22" rx="2" fill={STEEL_DK} {...k} />
          <rect x="13" y="-58" width="6" height="22" rx="2" fill={STEEL_DK} {...k} />
          <circle cx="-16" cy="-34" r="3.4" fill={STEEL} {...k} />
          <circle cx="16" cy="-34" r="3.4" fill={STEEL} {...k} />
        </>
      )}
      <path d="M-12 -38 H12 L15 -26 H-15 Z" fill={STEEL_DK} {...k} />
      <path d="M-9 -32 H9" stroke={INK} strokeWidth="1" opacity=".6" />
      <path d="M-11 -66 Q0 -72 11 -66 L10 -38 Q0 -34 -10 -38 Z" fill={STEEL} {...k} />
      <path d="M0 -68 V-37" stroke={STEEL_DK} strokeWidth="1.4" />
      <path d="M-6 -62 Q-6 -52 -4 -44" fill="none" stroke="#fff" strokeWidth="1.4" opacity=".7" strokeLinecap="round" />
      <path d="M-8 -52 h16" stroke={GOLD} strokeWidth="2" />
      <ellipse cx="-14" cy="-64" rx="7.5" ry="5.5" fill={STEEL} {...k} />
      <ellipse cx="14" cy="-64" rx="7.5" ry="5.5" fill={STEEL} {...k} />
      <path d="M-6 -68 h12 v4 h-12z" fill={STEEL_DK} {...k} />
      <path d="M-8 -70 Q-8 -85 0 -85 Q8 -85 8 -70 Z" fill={STEEL} {...k} />
      <path d="M-6 -76 h12" stroke="#1c2024" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M0 -85 v9" stroke={STEEL_DK} strokeWidth="1.4" />
      <path d="M-8 -78 Q-15 -79 -13 -88 M8 -78 Q15 -79 13 -88" fill="none" stroke="#f7ead0" strokeWidth="3" strokeLinecap="round" />
      {plume && <path d="M-1 -85 Q9 -91 4 -99 Q-4 -92 -1 -85Z" fill={CLOAK} {...k} />}
    </g>
  )
}

/** Straw strands over the ring rMin..rMax of an ellipse at height h; near = only the viewer-facing half. */
function straw(cu, cv, ru, rv, h, n, seed, { rMin = 0.3, rMax = 0.95, near = false } = {}) {
  const g = rnd(seed)
  const [t0, t1] = nearRange(ru, rv)
  const light = []
  const dark = []
  for (let i = 0; i < n; i++) {
    const a = near ? t0 + g() * (t1 - t0) : g() * Math.PI * 2
    const rr = rMin + g() * (rMax - rMin)
    const u = cu + ru * rr * Math.cos(a)
    const v = cv + rv * rr * Math.sin(a)
    const ang = g() * Math.PI
    const len = 4 + g() * 5
    const u2 = u + Math.cos(ang) * len
    const v2 = v + Math.sin(ang) * len * (rv / ru)
    if (((u2 - cu) / ru) ** 2 + ((v2 - cv) / rv) ** 2 > 0.94) continue
    ;(i % 2 ? dark : light).push([P(u, v, h + g() * 1.5), P(u2, v2, h + g() * 1.5)])
  }
  return cat(isoLines(light, 1.3, '#f0d680'), isoLines(dark, 1.2, '#8f6f26'))
}

/** A nest: a woven bowl with a hollow. Returns { back, front }: front is the near rim, drawn over a sleeping creature. */
export function nest(cu, cv, ru, rv, h0, h1, tone, innerTone, seed) {
  const [t0, t1] = nearRange(ru, rv)
  const ri = 0.74
  const rj = 0.7
  const side = poly([...arcPts(cu, cv, h0, ru, rv, t0, t1), ...arcPts(cu, cv, h1, ru, rv, t0, t1).reverse()], shade(tone, -14))
  const weave = isoLines(
    [0.33, 0.66].flatMap((k) => {
      const a = arcPts(cu, cv, h0 + (h1 - h0) * k, ru, rv, t0, t1, 10)
      return a.slice(1).map((p, i) => [a[i], p]).filter((_, i) => i % 2 === 0)
    }),
    1.1,
    shade(tone, -38),
    0.8
  )
  const nearRim = poly([...arcPts(cu, cv, h1, ru, rv, t0, t1), ...arcPts(cu, cv, h1, ru * ri, rv * rj, t0, t1).reverse()], shade(tone, 12))
  return {
    back: cat(
      side,
      weave,
      ellH(cu, cv, h1, ru, rv, shade(tone, 12)),
      ellH(cu, cv, h1 - 0.4, ru * ri, rv * rj, innerTone, { sw: 1.2 }),
      straw(cu, cv, ru, rv, h1, 40, seed, { rMin: 0.3, rMax: 0.95 })
    ),
    front: cat(side, weave, nearRim, straw(cu, cv, ru, rv, h1, 16, seed + 1, { rMin: 0.78, rMax: 0.95, near: true }))
  }
}

/** A fur pelt: an irregular oval with a scalloped edge and spots, flat at height h. */
export function pelt(cu, cv, ru, rv, h, tone, seed) {
  const g = rnd(seed)
  const n = 18
  const outline = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const k = 0.9 + 0.1 * Math.sin(i * 2.7) + g() * 0.04
    outline.push(P(cu + ru * k * Math.cos(t), cv + rv * k * Math.sin(t), h))
  }
  const spots = []
  for (let i = 0; i < 6; i++) {
    const sc = cu + (g() - 0.5) * ru
    const sv = cv + (g() - 0.5) * rv
    spots.push(poly(ellipsePoints(sc, sv, h + 0.2, 2.6 + g() * 2, 1.8 + g() * 1.4, 8), shade(tone, -26), { stroke: null }))
  }
  return cat(poly(outline, tone, { sw: 1.4 }), ...spots)
}

/** A fur drape over a rim: the near arc of an ellipse at hTop, hanging to a scalloped hem at hBot. */
export function drape(cu, cv, ru, rv, hTop, hBot, tone, trim = 0.35) {
  const [t0, t1] = nearRange(ru, rv)
  const a = t0 + trim
  const b = t1 - trim
  const top = arcPts(cu, cv, hTop, ru + 0.5, rv + 0.5, a, b, 12)
  const hem = arcPts(cu, cv, hBot, ru + 2.5, rv + 2.5, a, b, 12).map((p, i) => [p[0], p[1] + (i % 2 ? 3 : 0)]).reverse()
  return poly([...top, ...hem], tone, { sw: 1.4 })
}
