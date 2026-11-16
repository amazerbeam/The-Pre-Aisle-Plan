import { P, ellipsePoints, shade } from '../../iso'
import { cat, glowG, packShapes, rnd, tint } from '../packShapes'
import { DRAGON_INK, FIRE, FIRE_HI, GOLD, GOLD_HI, ICE, ICE_HI, IRON_LT, STONE } from './dragonPalette'

/**
 * MPP-45: the dragon lair's shared drawing helpers (pip-room-dragon.html lines 889-1139), ported to JSX. Only the helpers the shell
 * and the five stations call are here; decor-only helpers live in dragonDecorParts.jsx (MPP-46).
 */
export const S = packShapes(DRAGON_INK)
const { poly, isoLines, box, cylE, bill, fxg } = S

/** A flat coin lying on the floor or a surface. */
export const coin = (u, v, h, r = 2.4, color = GOLD) => poly(ellipsePoints(u, v, h, r, r * 0.8, 8), color, { sw: 0.8 })

/** A gem: a small faceted diamond billboard. */
export const gem = (u, v, h, color) =>
  bill(
    u,
    v,
    h,
    <>
      <path d="M0 -4.5 L3.2 -1.4 L0 3 L-3.2 -1.4Z" fill={color} stroke={DRAGON_INK} strokeWidth="1" strokeLinejoin="round" />
      <path d="M-1.4 -2 L0 -3.4 L1 -2" fill="none" stroke="#fff" strokeWidth=".8" opacity=".8" />
    </>
  )

/** A twinkle (animated): used on coins, gems and the hoard. */
export const sparkle = (u, v, h, delay) =>
  bill(u, v, h, fxg('glint', <path d="M0 -3.6 L1 -1 L3.6 0 L1 1 L0 3.6 L-1 1 L-3.6 0 L-1 -1Z" fill="#fff6c2" />, delay))

/** A flame (animated flicker, glowing), scaled s. */
const flameArt = (s) => (
  <g transform={`scale(${s})`}>
    <path d="M0 2 C-8 -2 -8 -13 -1 -22 C0 -14 6 -11 5 -3 C4 1 2 2 0 2Z" fill={FIRE} stroke={DRAGON_INK} strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M0 1 C-4 -2 -4 -8 0 -13 C1 -8 4 -6 3 -2 C2 0 1 1 0 1Z" fill={FIRE_HI} />
  </g>
)
export const flame = (u, v, h, s = 1, delay = 0) => bill(u, v, h, glowG('#ff9a3a', fxg('flicker', flameArt(s), delay), 5))

/** Rising embers (animated, glowing): n tiny sparks above a point, each on its own delay. */
export function embers(u, v, h, n = 4) {
  const r = rnd(u * 7 + v * 3 + n)
  const sparks = []
  for (let i = 0; i < n; i++) {
    const x = u + (r() - 0.5) * 12
    const y = h + (r() - 0.5) * 3
    const radius = (1 + r() * 0.8).toFixed(1)
    const delay = i * 0.6 + r()
    sparks.push(bill(x, v, y, glowG('#ff7a2a', fxg('embers', <circle r={radius} fill="#ffb35a" />, delay), 3)))
  }
  return cat(...sparks)
}

/** Stone courses (mortar lines) on the plane v = vp. */
export function brickV(vp, u0, u1, h0, h1, color, row = 9, bw = 15) {
  const segs = []
  let r = 0
  for (let h = h0 + row; h < h1 - 1; h += row, r++) {
    segs.push([P(u0, vp, h), P(u1, vp, h)])
    for (let u = u0 + (r % 2 ? bw / 2 : bw); u < u1 - 1; u += bw) segs.push([P(u, vp, h - row), P(u, vp, h)])
  }
  return isoLines(segs, 0.9, color, 0.6)
}

/** Stone courses (mortar lines) on the plane u = up. */
export function brickU(up, v0, v1, h0, h1, color, row = 9, bw = 15) {
  const segs = []
  let r = 0
  for (let h = h0 + row; h < h1 - 1; h += row, r++) {
    segs.push([P(up, v0, h), P(up, v1, h)])
    for (let v = v0 + (r % 2 ? bw / 2 : bw); v < v1 - 1; v += bw) segs.push([P(up, v, h - row), P(up, v, h)])
  }
  return isoLines(segs, 0.9, color, 0.6)
}

/** A box with stone courses on both visible faces. */
export const stoneBox = (u, v, du, dv, h0, h1, color = STONE) =>
  cat(box(u, v, du, dv, h0, h1, color), brickU(u + du, v, v + dv, h0, h1, shade(color, -38)), brickV(v + dv, u, u + du, h0, h1, shade(color, -38)))

/** An arch-topped opening on the plane v = vp: straight sides to hs, then an elliptical arch of height ry. */
export function archV(vp, uc, hw, h0, hs, ry, fill, o) {
  const out = [[uc - hw, h0], [uc - hw, hs]]
  for (let i = 1; i < 12; i++) {
    const t = Math.PI - (Math.PI * i) / 12
    out.push([uc + hw * Math.cos(t), hs + ry * Math.sin(t)])
  }
  out.push([uc + hw, hs], [uc + hw, h0])
  return poly(out.map(([u, h]) => P(u, vp, h)), fill, o)
}

/** A disc on the plane v = vp (a round door, a shield): centre (uc, hc), radii (ru, rh) in floor units. */
export const discV = (vp, uc, hc, ru, rh, fill, o, n = 20) =>
  poly(
    Array.from({ length: n }, (_, i) => P(uc + ru * Math.cos((i / n) * Math.PI * 2), vp, hc + rh * Math.sin((i / n) * Math.PI * 2))),
    fill,
    o
  )

/** A mound of stacked truncated cones (coins, rock). */
export function mound(cu, cv, ru, rv, hTop, layers, color, topScale = 0.45) {
  const rings = []
  for (let i = 0; i < layers; i++) {
    const k0 = 1 - (1 - topScale) * (i / layers)
    const k1 = 1 - (1 - topScale) * ((i + 1) / layers)
    rings.push(cylE(cu, cv, ru * k0, rv * k0, (hTop * i) / layers, (hTop * (i + 1)) / layers, i % 2 ? tint(color, 7) : color, ru * k1, rv * k1))
  }
  return cat(...rings)
}

/** Coins scattered inside an ellipse on a surface at height h (r = coin radius), kept clear of the rim by `fill`. */
export function coinScatter(cu, cv, ru, rv, h, n, seed, fill = 0.9, r = 2.4) {
  const g = rnd(seed)
  const coins = []
  for (let i = 0; i < n; i++) {
    const a = g() * Math.PI * 2
    const d = Math.sqrt(g()) * fill
    coins.push(coin(cu + ru * d * Math.cos(a), cv + rv * d * Math.sin(a), h, r * (0.8 + g() * 0.5), i % 3 ? GOLD : GOLD_HI))
  }
  return cat(...coins)
}

/** Coins scattered on the ring between two radii of a heap layer. */
export function coinRing(cu, cv, ru, rv, kIn, kOut, h, n, seed, r = 2.2) {
  const g = rnd(seed)
  const coins = []
  for (let i = 0; i < n; i++) {
    const a = g() * Math.PI * 2
    const d = kIn + g() * (kOut - kIn)
    coins.push(coin(cu + ru * d * Math.cos(a), cv + rv * d * Math.sin(a), h, r * (0.8 + g() * 0.5), i % 3 ? GOLD : GOLD_HI))
  }
  return cat(...coins)
}

/** Vertical seams on the plane v = vp at the given u values; and on the plane u = up at the given v values. */
export const seamsV = (vp, us, h0, h1, color = DRAGON_INK, w = 0.9, op = 0.8) => isoLines(us.map((u) => [P(u, vp, h0), P(u, vp, h1)]), w, color, op)
export const seamsU = (up, vs, h0, h1, color = DRAGON_INK, w = 0.9, op = 0.8) => isoLines(vs.map((v) => [P(up, v, h0), P(up, v, h1)]), w, color, op)

/** A rivet row along a strap on the plane v = vp. */
export const rivetsV = (vp, us, h, color = IRON_LT) =>
  cat(...us.map((u) => bill(u, vp, h, <circle r="1.3" fill={color} stroke={DRAGON_INK} strokeWidth=".7" />)))

/** Icicles / frost drips hanging from an edge on the plane v = vp: triangles at the given u values. */
export const icicles = (vp, us, hTop, len, color = ICE_HI) =>
  cat(...us.map((u, i) => poly([P(u - 1.8, vp, hTop), P(u + 1.8, vp, hTop), P(u, vp, hTop - len * (0.6 + (0.4 * ((i * 7) % 3)) / 2))], color, { sw: 1 })))

/** A pointed ice crystal: a box prism with a pyramid cap. */
export function crystal(u, v, du, dv, h0, h1, color = ICE) {
  const cu = u + du / 2
  const cv = v + dv / 2
  const tip = h1 + Math.max(du, dv) * 0.9
  return cat(
    box(u, v, du, dv, h0, h1, color),
    poly([P(u, v + dv, h1), P(u + du, v + dv, h1), P(cu, cv, tip)], shade(color, -10), { sw: 1.2 }),
    poly([P(u + du, v, h1), P(u + du, v + dv, h1), P(cu, cv, tip)], shade(color, 8), { sw: 1.2 })
  )
}

/** The tall station helper: a dragon egg billboard. */
export const egg = (u, v, h) =>
  bill(
    u,
    v,
    h,
    <>
      <ellipse cx="0" cy="-5" rx="4.2" ry="5.4" fill="#b5e0c9" stroke={DRAGON_INK} strokeWidth="1.2" />
      <circle cx="-1.2" cy="-6.5" r="1" fill="#6cc59a" />
      <circle cx="1.5" cy="-3.6" r=".9" fill="#6cc59a" />
      <path d="M-2.4 -8.4 q1 -1 2 -.6" stroke="#fff" strokeWidth=".9" fill="none" />
    </>
  )
