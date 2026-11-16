import { P } from '../../iso'
import { cat, fmt, glowG, packShapes } from '../packShapes'
import {
  AMBER,
  CABLE_DK,
  GLASS,
  GUN_DK,
  GUN_LT,
  HAZ,
  HAZ_DK,
  LIME,
  NEON,
  PINK,
  ROBOT_INK,
  SCREEN,
  STEEL,
  STEEL_DK
} from './robotPalette'

/**
 * MPP-45: the robot workshop's shared drawing helpers (pip-room-robot.html lines 714-993), ported to JSX. Only the helpers the shell,
 * the five stations and the effects call are here; decor-only helpers (`ellU`, `slabU`, `bandAt`, `gear`, `hat`, `digit7`...) move with
 * MPP-47. The mockup's `bill` `ext` argument (fit-tracking) is dropped, as in packShapes.jsx. Decor-only helpers live in robotDecorParts.jsx (MPP-47).
 */
export const S = packShapes(ROBOT_INK)
const { poly, isoLine, isoLines, rectV, rectU, ellH, bill, fxg } = S

/** A status LED (blinks, glows) and a steady one. */
export const led = (u, v, h, color, delay = 0) => bill(u, v, h, glowG(color, fxg('blink', <circle r="1.5" fill={color} />, delay), 2.5))
export const ledOn = (u, v, h, color) => bill(u, v, h, glowG(color, <circle r="1.5" fill={color} />, 2.5))

/** A neon tube along a polyline of screen points. */
export const neon = (points, color = NEON, w = 1.8, r = 3) => glowG(color, isoLine(points, w, color), r)

/** A disc on the plane v = vp (centre uc, hc). */
export const discV = (vp, uc, hc, ru, rh, fill, o, n = 20) =>
  poly(
    Array.from({ length: n }, (_, i) => P(uc + ru * Math.cos((i / n) * Math.PI * 2), vp, hc + rh * Math.sin((i / n) * Math.PI * 2))),
    fill,
    o
  )

/** Vertical seams on the plane v = vp at the given u values; and on the plane u = up at the given v values. */
export const seamsV = (vp, us, h0, h1, color = ROBOT_INK, w = 0.9, op = 0.8) => isoLines(us.map((u) => [P(u, vp, h0), P(u, vp, h1)]), w, color, op)
export const seamsU = (up, vs, h0, h1, color = ROBOT_INK, w = 0.9, op = 0.8) => isoLines(vs.map((v) => [P(up, v, h0), P(up, v, h1)]), w, color, op)

/** Horizontal slots (vents) on the plane v = vp / u = up, n evenly spaced lines. */
const slotRows = (n, h0, h1, make) =>
  Array.from({ length: n }, (_, i) => {
    const h = h0 + ((h1 - h0) * i) / Math.max(n - 1, 1)
    return make(h)
  })
export const slotsV = (vp, u0, u1, h0, h1, n, color = ROBOT_INK, w = 1) => isoLines(slotRows(n, h0, h1, (h) => [P(u0, vp, h), P(u1, vp, h)]), w, color, 0.85)
export const slotsU = (up, v0, v1, h0, h1, n, color = ROBOT_INK, w = 1) => isoLines(slotRows(n, h0, h1, (h) => [P(up, v0, h), P(up, v1, h)]), w, color, 0.85)

/** A rivet row along a strap on the plane v = vp / u = up. */
const rivet = (color) => <circle r="1.2" fill={color} stroke={ROBOT_INK} strokeWidth=".6" />
export const rivetsV = (vp, us, h, color = STEEL) => cat(...us.map((u) => bill(u, vp, h, rivet(color))))
export const rivetsU = (up, vs, h, color = STEEL) => cat(...vs.map((v) => bill(up, v, h, rivet(color))))

/** A dark CRT-style screen with a glowing frame on the plane v = vp / u = up. */
export const screenV = (vp, u0, u1, h0, h1, color = NEON) =>
  cat(rectV(vp, u0, u1, h0, h1, SCREEN, { sw: 1.2 }), glowG(color, rectV(vp, u0 + 1, u1 - 1, h0 + 1, h1 - 1, 'none', { stroke: color, sw: 0.7 }), 2))
export const screenU = (up, v0, v1, h0, h1, color = NEON) =>
  cat(rectU(up, v0, v1, h0, h1, SCREEN, { sw: 1.2 }), glowG(color, rectU(up, v0 + 1, v1 - 1, h0 + 1, h1 - 1, 'none', { stroke: color, sw: 0.7 }), 2))

/** A glowing readout trace on a screen: points are [along, h]. */
export const traceV = (vp, points, color = NEON, w = 1) => glowG(color, isoLine(points.map(([u, h]) => P(u, vp, h)), w, color), 2)
export const traceU = (up, points, color = NEON, w = 1) => glowG(color, isoLine(points.map(([v, h]) => P(up, v, h)), w, color), 2)

/** A flicker-sweep band over a screen (animated). */
export const scanV = (vp, u0, u1, h0, h1) =>
  fxg('scan', rectV(vp, u0 + 1.5, u1 - 1.5, h0 + (h1 - h0) * 0.3, h0 + (h1 - h0) * 0.46, NEON, { stroke: null, op: 0.3 }))
export const scanU = (up, v0, v1, h0, h1) =>
  fxg('scan', rectU(up, v0 + 1.5, v1 - 1.5, h0 + (h1 - h0) * 0.3, h0 + (h1 - h0) * 0.46, NEON, { stroke: null, op: 0.3 }))

/** Clip a polygon of [a, h] points to lo <= a <= hi (Sutherland-Hodgman, two half-planes). */
function clipA(poly0, lo, hi) {
  const cut = (pts0, inside, at) => {
    const out = []
    for (let i = 0; i < pts0.length; i++) {
      const p = pts0[i]
      const q = pts0[(i + 1) % pts0.length]
      const pin = inside(p)
      const qin = inside(q)
      if (pin) out.push(p)
      if (pin !== qin) {
        const t = (at - p[0]) / (q[0] - p[0])
        out.push([at, p[1] + t * (q[1] - p[1])])
      }
    }
    return out
  }
  return cut(cut(poly0, (p) => p[0] >= lo, lo), (p) => p[0] <= hi, hi)
}

/** A hazard-stripe band: amber ground, dark diagonal stripes, clipped to the rectangle. map(a, h) -> screen point. */
function hazard(map, a0, a1, h0, h1, stripe = 5) {
  const parts = [poly([map(a0, h0), map(a1, h0), map(a1, h1), map(a0, h1)], HAZ, { sw: 1.2 })]
  const H = h1 - h0
  for (let a = a0 - H; a < a1; a += stripe * 2) {
    const quad = clipA([[a, h0], [a + stripe, h0], [a + stripe + H, h1], [a + H, h1]], a0, a1)
    if (quad.length > 2) parts.push(poly(quad.map(([x, h]) => map(x, h)), HAZ_DK, { stroke: null }))
  }
  return cat(...parts)
}
export const hazardV = (vp, u0, u1, h0, h1, stripe) => hazard((u, h) => P(u, vp, h), u0, u1, h0, h1, stripe)
export const hazardU = (up, v0, v1, h0, h1, stripe) => hazard((v, h) => P(up, v, h), v0, v1, h0, h1, stripe)

/** Soft glass: a translucent pane with a bright edge, on a plane. */
export const glassV = (vp, u0, u1, h0, h1, op = 0.16) => rectV(vp, u0, u1, h0, h1, GLASS, { stroke: '#d7f7ff', sw: 0.8, op })
export const glassU = (up, v0, v1, h0, h1, op = 0.16) => rectU(up, v0, v1, h0, h1, GLASS, { stroke: '#d7f7ff', sw: 0.8, op })

/** A mattress-top charging coil: two glowing rings centred on the sleeping spot. */
export const coil = (cu, cv, h, ru = 24, rv = 16) =>
  glowG(
    NEON,
    cat(ellH(cu, cv, h, ru, rv, 'none', { stroke: NEON, sw: 1.1, op: 0.85 }), ellH(cu, cv, h, ru * 0.62, rv * 0.62, 'none', { stroke: NEON, sw: 1, op: 0.85 })),
    3
  )

/** Rows of glowing sample vials on shelves, on the plane v = vp: bases are the shelf heights (the first row rests on the cabinet floor). */
export const VIAL_COLOURS = [NEON, PINK, LIME, AMBER]
export const vialRows = (vp, u0, u1, bases, tall = 7, step = 6) =>
  cat(
    ...bases.map((h, row) =>
      cat(
        row ? rectV(vp, u0, u1, h - 1.6, h, STEEL_DK, { sw: 0.8 }) : null,
        ...Array.from({ length: Math.floor((u1 - u0 - 2) / step) }, (_, i) =>
          rectV(vp, u0 + 2 + i * step, u0 + 2 + i * step + step * 0.45, h, h + tall - (i % 3), VIAL_COLOURS[(i + row) % 4], { stroke: null, op: 0.92 })
        )
      )
    )
  )

/** A robot-arm segment from point a to b (screen points), and a joint disc. */
export const armSeg = (a, b, w = 3.6, color = '#e07a22') => cat(isoLine([a, b], w + 2.2, ROBOT_INK), isoLine([a, b], w, color))
export const joint = (u, v, h, r = 3) =>
  bill(
    u,
    v,
    h,
    <>
      <circle r={r} fill={STEEL} stroke={ROBOT_INK} strokeWidth="1.2" />
      <circle r={fmt(r / 2.4)} fill={GUN_DK} />
    </>
  )

/** A round dial knob billboard. */
export const dial = (u, v, h, r = 2.6) =>
  bill(
    u,
    v,
    h,
    <>
      <circle r={r} fill={STEEL} stroke={ROBOT_INK} strokeWidth="1.1" />
      <path d={`M0 0 L${fmt(r * 0.7)} ${fmt(-r * 0.7)}`} stroke={ROBOT_INK} strokeWidth="1.2" strokeLinecap="round" />
    </>
  )

/** A blade of a spinning fan, drawn at angle a for a bezel of radius r. */
const fanBlade = (a, r) => (
  <path
    key={a}
    transform={`rotate(${a})`}
    d={`M0 0 C${fmt(r * 0.3)} ${fmt(-r * 0.2)} ${fmt(r * 0.75)} ${fmt(-r * 0.5)} ${fmt(r * 0.4)} ${fmt(-r * 0.9)} C${fmt(-r * 0.1)} ${fmt(-r * 0.8)} ${fmt(-r * 0.25)} ${fmt(-r * 0.35)} 0 0Z`}
    fill={STEEL}
    stroke={ROBOT_INK}
    strokeWidth=".8"
    strokeLinejoin="round"
  />
)

/** A spinning fan billboard (animated), 4 blades on a hub, in a round bezel of radius r. */
export const fanBill = (u, v, h, r = 6) =>
  bill(
    u,
    v,
    h,
    <>
      <circle r={r + 1.4} fill={CABLE_DK} stroke={ROBOT_INK} strokeWidth="1.4" />
      <circle r={r} fill={SCREEN} />
      {fxg('fan', [0, 90, 180, 270].map((a) => fanBlade(a, r)))}
      <circle r={fmt(r * 0.2)} fill={GUN_LT} stroke={ROBOT_INK} strokeWidth=".8" />
    </>
  )

/** A trophy cup billboard (steel, a neon band), a medal billboard, a sensor cube billboard (s = scale). */
export const cup = (u, v, h, s = 0.6) =>
  bill(
    u,
    v,
    h,
    <g transform={`scale(${s})`}>
      <path d="M-9 -24 h18 q0 12 -9 14 q-9 -2 -9 -14z" fill={STEEL} stroke={ROBOT_INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-9 -22 q-7 0 -5 7 q2 4 6 3 M9 -22 q7 0 5 7 q-2 4 -6 3" fill="none" stroke={ROBOT_INK} strokeWidth="1.6" />
      <rect x="-1.8" y="-10" width="3.6" height="6" fill={STEEL_DK} />
      <rect x="-7" y="-4" width="14" height="4" rx="1" fill={GUN_DK} stroke={ROBOT_INK} strokeWidth="1.4" />
      <path d="M-6 -19 h12" stroke={NEON} strokeWidth="2" strokeLinecap="round" />
    </g>
  )
export const medal = (u, v, h, s = 0.6, color = PINK) =>
  bill(
    u,
    v,
    h,
    <g transform={`scale(${s})`}>
      <path d="M-6 -2 l-4 12 l6 -3 l3 5z M6 -2 l4 12 l-6 -3 l-3 5z" fill={color} stroke={ROBOT_INK} strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="0" cy="-8" r="9" fill={STEEL} stroke={ROBOT_INK} strokeWidth="1.5" />
      <circle cx="0" cy="-8" r="4.6" fill={GUN_DK} stroke={ROBOT_INK} strokeWidth="1.1" />
      <circle cx="0" cy="-8" r="1.8" fill={NEON} />
    </g>
  )
export const sensor = (u, v, h, s = 0.6) =>
  bill(
    u,
    v,
    h,
    <g transform={`scale(${s})`}>
      <rect x="-8" y="-14" width="16" height="14" rx="2.5" fill={GUN_LT} stroke={ROBOT_INK} strokeWidth="1.5" />
      <rect x="-5" y="-11" width="10" height="7" rx="1.5" fill={SCREEN} stroke={ROBOT_INK} strokeWidth="1" />
      <circle cx="0" cy="-7.5" r="2.2" fill={NEON} />
    </g>
  )
