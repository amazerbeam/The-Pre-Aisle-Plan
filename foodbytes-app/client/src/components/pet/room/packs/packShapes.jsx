import { Fragment, createElement } from 'react'
import {
  P,
  boxFaces,
  ellipsePoints,
  pts,
  rectHPoints,
  rectUPoints,
  rectVPoints,
  shade
} from '../iso'
import { ROOM_SIZE } from '../../../../constants/petRoom'

/**
 * MPP-45: the room mockups' shared iso shape helpers (pip-room-dragon.html / pip-room-robot.html `room-iso`, identical in
 * both) as element-returning functions. Geometry comes from iso.js; the mockups' SVG strings become JSX, and string
 * concatenation becomes `cat(...)`. The mockups' fit-tracking (`track`, `measure`, the `ext` argument of `bill`) is review
 * tooling and is dropped. `packShapes(ink)` binds the pack's outline colour where the mockup read `ART_INK`.
 */

/** Seeded random, as the mockups: a small LCG so every build of a pack draws the same scatter. */
export const rnd = (seed) => {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export const fmt = (n) => n.toFixed(1)

/** A screen point as "x y" for a path 'd'. */
export const xy = (p) => p.map(fmt).join(' ')

/** Like shade, but returns a '#rrggbb' hex (so the result can be shaded again). */
export function tint(hex, pct) {
  const n = parseInt(hex.slice(1), 16)
  const f = pct / 100
  const channel = (s) => {
    const c = (n >> s) & 255
    return Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f))
  }
  return '#' + [16, 8, 0].map((s) => channel(s).toString(16).padStart(2, '0')).join('')
}

/** Several elements in draw order (the mockups' string `+`). Children are passed as arguments, so no keys are needed. */
export const cat = (...children) => createElement(Fragment, null, ...children)

/** Points along an ellipse from angle t0 to t1 (radians) at height h. */
export function arcPts(cu, cv, h, ru, rv, t0, t1, n = 14) {
  const out = []
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n
    out.push(P(cu + ru * Math.cos(t), cv + rv * Math.sin(t), h))
  }
  return out
}

/** The near (viewer-facing) half of a floor ellipse as an angle range, [t0, t1]. */
export function nearRange(ru, rv) {
  const t0 = Math.atan2(-rv, ru)
  return [t0, t0 + Math.PI]
}

/** A glow: CSS drop-shadow on the element. Removed under Low FX by `body.lowfx .pip-room-svg [data-glow]`. */
export const glow = (color, radius = 3) => ({ 'data-glow': '', style: { filter: `drop-shadow(0 0 ${radius}px ${color})` } })

/** A group that glows (CSS drop-shadow, stripped under Low FX through `data-glow`). */
export const glowG = (color, inner, radius = 3) => <g {...glow(color, radius)}>{inner}</g>

/** A wall plane as a function (along, height) -> screen point, and its length. */
export const wallAt = (plane) => (a, h) => (plane === 'left' ? P(a, 0, h) : P(0, a, h))
export const wallLen = (plane) => (plane === 'left' ? ROOM_SIZE.u : ROOM_SIZE.v)

export function packShapes(ink) {
  const poly = (points, fill, o = {}) => {
    const stroke = o.stroke === undefined ? ink : o.stroke
    const edge = stroke ? { stroke, strokeWidth: o.sw ?? 1.6, strokeLinejoin: 'round' } : null
    return <polygon points={pts(points)} fill={fill} {...edge} opacity={o.op ?? undefined} />
  }

  const isoLine = (points, width = 1.6, color = ink, o = {}) => (
    <polyline
      points={pts(points)}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={o.dash || undefined}
      opacity={o.op ?? undefined}
    />
  )

  /** Several line segments [[p, q], ...] as one <path>. */
  const isoLines = (segs, width = 1, color = ink, op) => {
    if (!segs.length) return null
    let d = ''
    for (const [a, b] of segs) d += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`
    return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" opacity={op ?? undefined} />
  }

  /** Solid box: the two visible sides, then the top (shaded as the live Box: -6 front, -20 side, +14 top). */
  const box = (u, v, du, dv, h0, h1, color, o = {}) => {
    const f = boxFaces(u, v, du, dv, h0, h1)
    return cat(poly(f.front, shade(color, -6), o), poly(f.side, shade(color, -20), o), poly(f.top, shade(color, 14), o))
  }

  const rectV = (vp, u0, u1, h0, h1, fill, o) => poly(rectVPoints(vp, u0, u1, h0, h1), fill, o)
  const rectU = (up, v0, v1, h0, h1, fill, o) => poly(rectUPoints(up, v0, v1, h0, h1), fill, o)
  const rectH = (h, u0, u1, v0, v1, fill, o) => poly(rectHPoints(h, u0, u1, v0, v1), fill, o)
  const ellH = (cu, cv, h, ru, rv, fill, o) => poly(ellipsePoints(cu, cv, h, ru, rv), fill, o)

  /** Short cylinder / drum, optionally tapered: the near side band, then the top ellipse. */
  const cylE = (cu, cv, ru, rv, h0, h1, color, ru1 = ru, rv1 = rv, o = {}) => {
    const [t0, t1] = nearRange(ru, rv)
    const band = [...arcPts(cu, cv, h0, ru, rv, t0, t1), ...arcPts(cu, cv, h1, ru1, rv1, t0, t1).reverse()]
    return cat(poly(band, shade(color, -12), o), poly(ellipsePoints(cu, cv, h1, ru1, rv1), shade(color, 12), o))
  }
  const cyl = (cu, cv, r, h0, h1, color, o) => cylE(cu, cv, r, r, h0, h1, color, r, r, o)

  /** Billboard: flat art pinned to a floor point. */
  const bill = (u, v, h, inner) => {
    const [x, y] = P(u, v, h)
    return <g transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}>{inner}</g>
  }

  /** An animated group. The class never sits on a group that carries a transform (position goes on an outer <g>). */
  const fxg = (effect, inner, delay = 0) => (
    <g className={`room-fx room-fx--${effect}`} style={delay ? { animationDelay: `-${delay}s` } : undefined}>
      {inner}
    </g>
  )

  return { poly, isoLine, isoLines, box, rectV, rectU, rectH, ellH, cylE, cyl, bill, fxg }
}
