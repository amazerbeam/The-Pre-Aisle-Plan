import { P, ellipsePoints, shade } from '../../iso'
import { arcPts, cat, glowG, nearRange } from '../packShapes'
import { DRAGON_INK, IRON, WOOD_LT } from './dragonPalette'
import { S, flame } from './dragonParts'

/**
 * MPP-46: the lair decor's helpers and decor palette (pip-room-dragon.html lines 1099-1139), ported to JSX.
 */
const { poly, isoLine, isoLines, cyl, bill, fxg } = S

export const HI = 'rgba(255,255,255,.7)'
export const COPPER = '#c9753a'
export const BONE = '#efe4c8'
export const TEAL = '#2f6b5a'
export const TEAL_HI = '#3fa57c'
export const GLOW = '#7de3ff'
export const HIDE = '#a98660'

const ringPts = (n, f) => Array.from({ length: n }, (_, i) => f((i / n) * Math.PI * 2))

/** An ellipse standing on the right wall (plane u = up), centre (vc, hc), radii (rv, rh). */
export const ellU = (up, vc, hc, rv, rh, fill, o, n = 16) =>
  poly(ringPts(n, (t) => P(up, vc + rv * Math.cos(t), hc + rh * Math.sin(t))), fill, o)

/** A flat cut-out on the right wall with a visible thickness: a darker back copy, the front copy on top. vh = [[v, h], ...]. */
export const slabU = (up, th, vh, fill, o) =>
  cat(poly(vh.map(([v, h]) => P(up, v, h)), shade(fill, -22), o), poly(vh.map(([v, h]) => P(up + th, v, h)), fill, o))

/** A short candle with a flickering flame (animated). */
export const candle = (u, v, h, hh = 5, s = 0.5, delay = 0) => cat(cyl(u, v, 3, h, h + hh, '#f4ead2', { sw: 1 }), flame(u, v, h + hh, s, delay))

/** A ring line round a cylinder (near half only). */
export const bandAt = (cu, cv, r, h, color = IRON, w = 1.4) => isoLine(arcPts(cu, cv, h, r, r, ...nearRange(r, r)), w, color)

/** A flask: glass body in a colour, a neck and a cork (a potion). */
export const flask = (u, v, h, c) =>
  cat(
    cyl(u, v, 3.6, h, h + 7, c, { sw: 1.2 }),
    bill(
      u,
      v,
      h + 7,
      <>
        <rect x="-1.5" y="-6" width="3" height="6" fill="#d7f0ff" stroke={DRAGON_INK} strokeWidth="1.1" />
        <rect x="-2" y="-8.4" width="4" height="2.6" rx="1" fill={WOOD_LT} stroke={DRAGON_INK} strokeWidth="1" />
      </>
    )
  )

/** A row of glowing rune strokes on the left wall plane v = vp. */
export function runeRowV(vp, u0, h, n) {
  const segs = []
  for (let i = 0; i < n; i++) {
    const u = u0 + i * 5.5
    const k = (i * 5 + 2) % 3
    segs.push([P(u, vp, h), P(u, vp, h + 7)])
    if (k === 0) segs.push([P(u, vp, h + 6), P(u + 3, vp, h + 3)])
    if (k === 1) segs.push([P(u, vp, h + 2), P(u + 3, vp, h + 5)], [P(u + 3, vp, h + 5), P(u, vp, h + 7)])
    if (k === 2) segs.push([P(u - 2.2, vp, h + 4), P(u + 2.2, vp, h + 4)])
  }
  return glowG(GLOW, isoLines(segs, 1.3, GLOW), 2)
}

/** A glowing orb (animated glint) on a wire: billboard centred on the point. */
export const orb = (u, v, h, c, delay) =>
  bill(
    u,
    v,
    h,
    glowG(
      c,
      fxg(
        'glint',
        <>
          <circle r="2.6" fill={c} stroke={DRAGON_INK} strokeWidth="1" />
          <circle cx="-.8" cy="-.8" r=".8" fill="#fff" />
        </>,
        delay
      ),
      3
    )
  )

/** A double-stroked path (ink under colour) for limbs, handles and spouts inside a billboard. */
export const limb = (d, w, color) => (
  <>
    <path d={d} fill="none" stroke={DRAGON_INK} strokeWidth={w + 2.4} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </>
)

/** A horizontal band of a floor ellipse (normalised offsets a..b across its depth, -1..1) as a flat polygon at height h. */
export function ellBand(cu, cv, ru, rv, a, b, h, fill) {
  const arc = (y) => Math.sqrt(Math.max(0, 1 - y * y))
  const ys = Array.from({ length: 7 }, (_, i) => a + ((b - a) * i) / 6)
  return poly([...ys.map((y) => P(cu + ru * arc(y), cv + rv * y, h)), ...ys.map((y) => P(cu - ru * arc(y), cv + rv * y, h)).reverse()], fill, { stroke: null })
}

/** A closed ring line (a flat ellipse outline) at height h, optionally dashed. */
export const ringLine = (cu, cv, h, ru, rv, w, color, dash) => {
  const p = ellipsePoints(cu, cv, h, ru, rv, 32)
  return isoLine([...p, p[0]], w, color, dash ? { dash } : {})
}
