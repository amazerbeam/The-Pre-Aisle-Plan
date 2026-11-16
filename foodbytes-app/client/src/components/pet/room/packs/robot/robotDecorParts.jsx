import { P, ellipsePoints, shade } from '../../iso'
import { arcPts, cat, fmt, nearRange } from '../packShapes'
import { GUN_DK, HAZ, NEON, ROBOT_INK } from './robotPalette'
import { S } from './robotParts'

/**
 * MPP-47: the workshop decor's helpers and decor constants (pip-room-robot.html lines 995-1026).
 */
const { poly, isoLine, bill } = S

export const HI = 'rgba(255,255,255,.7)'
export const PLATE = '#2d3a48'
export const INKBLUE = '#10171d'

const ringPts = (n, f) => Array.from({ length: n }, (_, i) => f((i / n) * Math.PI * 2))

/** A seven-segment digit as a path at (x, y), 4 wide and 7 tall. */
const SEG7 = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' }
const SEG7_D = { a: 'M0 0H4', b: 'M4 0V3.5', c: 'M4 3.5V7', d: 'M0 7H4', e: 'M0 3.5V7', f: 'M0 0V3.5', g: 'M0 3.5H4' }

/** An ellipse standing on the right wall (plane u = up), centre (vc, hc), radii (rv, rh). */
export const ellU = (up, vc, hc, rv, rh, fill, o, n = 16) =>
  poly(ringPts(n, (t) => P(up, vc + rv * Math.cos(t), hc + rh * Math.sin(t))), fill, o)

/** A flat cut-out on the right wall with a visible thickness: a darker back copy, the front copy on top. vh = [[v, h], ...]. */
export const slabU = (up, th, vh, fill, o) =>
  cat(poly(vh.map(([v, h]) => P(up, v, h)), shade(fill, -22), o), poly(vh.map(([v, h]) => P(up + th, v, h)), fill, o))

/** A ring line round a cylinder (near half only). */
export const bandAt = (cu, cv, r, h, color = GUN_DK, w = 1.4) => isoLine(arcPts(cu, cv, h, r, r, ...nearRange(r, r)), w, color)

/** A closed ring line (a flat ellipse outline) at height h, optionally dashed. */
export const ringLine = (cu, cv, h, ru, rv, w, color, dash) => {
  const p = ellipsePoints(cu, cv, h, ru, rv, 32)
  return isoLine([...p, p[0]], w, color, dash ? { dash } : {})
}

/** A horizontal band of a floor ellipse (normalised offsets a..b across its depth, -1..1) as a flat polygon at height h. */
export function ellBand(cu, cv, ru, rv, a, b, h, fill) {
  const arc = (y) => Math.sqrt(Math.max(0, 1 - y * y))
  const ys = Array.from({ length: 7 }, (_, i) => a + ((b - a) * i) / 6)
  return poly([...ys.map((y) => P(cu + ru * arc(y), cv + rv * y, h)), ...ys.map((y) => P(cu - ru * arc(y), cv + rv * y, h)).reverse()], fill, { stroke: null })
}

/** A double-stroked path (ink under colour) for rods, arms and handles inside a billboard. */
export const limb = (d, w, color) => (
  <>
    <path d={d} fill="none" stroke={ROBOT_INK} strokeWidth={w + 2.4} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </>
)

/** A cog billboard (16 teeth edges, a dark hub), r = outer radius; its centre sits r/2 above the point. */
export const gear = (u, v, h, r, color) => {
  const teeth = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2
    const rr = i % 2 ? r * 0.78 : r
    return `${i ? 'L' : 'M'}${fmt(rr * Math.cos(a))} ${fmt(rr * Math.sin(a) * 0.8 - r * 0.5)}`
  }).join('')
  return bill(
    u,
    v,
    h,
    <>
      <path d={`${teeth}Z`} fill={color} stroke={ROBOT_INK} strokeWidth="1" strokeLinejoin="round" />
      <circle cy={fmt(-r * 0.5)} r={fmt(r * 0.28)} fill={INKBLUE} />
    </>
  )
}

/** A hard hat billboard (yellow dome, brim, centre ridge); base centre at the point. */
export const hat = (u, v, h, s = 1) =>
  bill(
    u,
    v,
    h,
    <g transform={`scale(${s})`}>
      <path d="M-8 0 q0 -11 8 -11 q8 0 8 11z" fill={HAZ} stroke={ROBOT_INK} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="-10" y="-1" width="20" height="3" rx="1.4" fill={HAZ} stroke={ROBOT_INK} strokeWidth="1.3" />
      <path d="M0 -11 V-2" stroke="#b3861b" strokeWidth="1.6" />
      <path d="M-5 -8 q2 -2 4 -2" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".75" />
    </g>
  )

export const digit7 = (n, x, y) => (
  <path transform={`translate(${x} ${y})`} d={[...SEG7[n]].map((k) => SEG7_D[k]).join('')} fill="none" stroke={NEON} strokeWidth="1.3" strokeLinecap="round" />
)
