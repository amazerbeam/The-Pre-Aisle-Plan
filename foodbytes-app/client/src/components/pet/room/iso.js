/**
 * MPP-16: isometric projection for Pip's room, ported from pip-room-mockup-v5.html.
 * Floor coords: u runs from the back corner along the LEFT wall, v along the RIGHT wall,
 * h is height. The left wall is the plane v = 0, the right wall is u = 0, and the viewer
 * is at +u, +v. Pure — no JSX — so room.check.mjs can pin it under node.
 */
const ISO_N = Math.hypot(180, 70)
export const ISO_C = 180 / ISO_N
export const ISO_S = 70 / ISO_N

/** Floor point (u, v) at height h → SVG [x, y]. */
export function P(u, v, h = 0) {
  return [180 - u * ISO_C + v * ISO_C, 180 + (u + v) * ISO_S - h]
}

/** [[x, y], …] → an SVG `points` string, one decimal place like the mockup. */
export function pts(points) {
  return points.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ')
}

/** Lighten (pct > 0) or darken (pct < 0) a '#rrggbb' colour. */
export function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16)
  const f = pct / 100
  const channel = shift => {
    const c = (n >> shift) & 255
    return Math.round(f > 0 ? c + (255 - c) * f : c * (1 + f))
  }
  return `rgb(${channel(16)},${channel(8)},${channel(0)})`
}

/** The three visible faces of a solid box, in draw order: front (u = u+du), side (v = v+dv), top. */
export function boxFaces(u, v, du, dv, h0, h1) {
  const U = u + du
  const V = v + dv
  return {
    front: [P(U, v, h0), P(U, V, h0), P(U, V, h1), P(U, v, h1)],
    side: [P(u, V, h0), P(U, V, h0), P(U, V, h1), P(u, V, h1)],
    top: [P(u, v, h1), P(U, v, h1), P(U, V, h1), P(u, V, h1)]
  }
}

/** Flat decal on the plane v = vp. */
export function rectVPoints(vp, u0, u1, h0, h1) {
  return [P(u0, vp, h0), P(u1, vp, h0), P(u1, vp, h1), P(u0, vp, h1)]
}

/** Flat decal on the plane u = up. */
export function rectUPoints(up, v0, v1, h0, h1) {
  return [P(up, v0, h0), P(up, v1, h0), P(up, v1, h1), P(up, v0, h1)]
}

/** Flat horizontal rectangle at height h. */
export function rectHPoints(h, u0, u1, v0, v1) {
  return [P(u0, v0, h), P(u1, v0, h), P(u1, v1, h), P(u0, v1, h)]
}

/** Horizontal ellipse (rug, hob ring, pot lid) as a polygon. */
export function ellipsePoints(cu, cv, h, ru, rv, steps = 24) {
  const points = []
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    points.push(P(cu + ru * Math.cos(t), cv + rv * Math.sin(t), h))
  }
  return points
}

/** Visible side band of a short cylinder (pots): the near half at h0, back along h1. */
export function cylinderSidePoints(cu, cv, r, h0, h1) {
  const angle = i => -Math.PI / 4 + (i / 12) * Math.PI
  const points = []
  for (let i = 0; i <= 12; i++) points.push(P(cu + r * Math.cos(angle(i)), cv + r * Math.sin(angle(i)), h0))
  for (let i = 12; i >= 0; i--) points.push(P(cu + r * Math.cos(angle(i)), cv + r * Math.sin(angle(i)), h1))
  return points
}
