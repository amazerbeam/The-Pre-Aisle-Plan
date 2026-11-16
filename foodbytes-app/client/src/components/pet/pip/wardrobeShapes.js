import { PIP_FOOT_X } from './pipSpace.js'

/**
 * Shape-descriptor helpers for every line's wardrobe. Descriptors are { tag, ...SVG attributes };
 * a 'g' descriptor carries `children` and, for an animated part, a `pip-fx pip-fx--<effect>` class
 * (Pip.css), so the geometry stays plain data that wardrobe.check.mjs can run in node.
 */
export const curveOf = (f) => f.side * 0.32
export const arcY = (x, y0, c) => {
  const t = x / 200
  return y0 - c + 4 * c * t * (1 - t)
}
export const arc = (y0, c) => `M0 ${y0 - c} Q${PIP_FOOT_X} ${y0 + c} 200 ${y0 - c}`
export const band = (y0, y1, c) => `M0 ${y0 - c} Q${PIP_FOOT_X} ${y0 + c} 200 ${y0 - c} L200 ${y1 - c} Q${PIP_FOOT_X} ${y1 + c} 0 ${y1 - c} Z`

/** Plain shape descriptors: { tag, ...geometry, ...attrs }. */
export const path = (d, attrs) => ({ tag: 'path', d, ...attrs })
export const rect = (x, y, width, height, attrs) => ({ tag: 'rect', x, y, width, height, ...attrs })
export const circle = (cx, cy, r, attrs) => ({ tag: 'circle', cx, cy, r, ...attrs })
export const ellipse = (cx, cy, rx, ry, attrs) => ({ tag: 'ellipse', cx, cy, rx, ry, ...attrs })
export const group = (children, attrs) => ({ tag: 'g', ...attrs, children })

/** An animated group: effect is one of the pip-fx--* names in Pip.css; style is a React style object (animationDelay, filter). */
export const fxGroup = (effect, children, style) => ({ tag: 'g', className: `pip-fx pip-fx--${effect}`, ...(style ? { style } : {}), children })

/** Square pixel cells (the robot's screen art), centred on (cx, cy), p units each. */
export const pxCells = (cells, cx, cy, p, fill) =>
  cells.map(([i, j]) => ({ tag: 'rect', x: cx + i * p - p / 2, y: cy + j * p - p / 2, width: p, height: p, fill }))

/** A heart of radius r with its point at (x, y + r). */
export const heartPath = (x, y, r) =>
  `M${x} ${y + r} C${x - 2 * r} ${y - 0.1 * r} ${x - 1.5 * r} ${y - 1.75 * r} ${x} ${y - 0.75 * r} C${x + 1.5 * r} ${y - 1.75 * r} ${x + 2 * r} ${y - 0.1 * r} ${x} ${y + r} Z`

/** Dungaree bib, straps and rivets between the waist and neck lines, outlined in the line's `ink`. */
export function overalls(f, color, rivet, ink) {
  const CX = PIP_FOOT_X
  const c = curveOf(f)
  const s = f.side
  return [
    path(band(f.waist, 240, c), { fill: color, stroke: ink, strokeWidth: 3 }),
    path(`M${CX} ${f.waist} V200`, { stroke: ink, strokeWidth: 2.5, opacity: 0.35 }),
    path(`M${CX - s * 0.42} ${f.waist + 1} V${f.waist - 13} H${CX + s * 0.42} V${f.waist + 1}`, { fill: color, stroke: ink, strokeWidth: 3, strokeLinejoin: 'round' }),
    path(`M${CX - s * 0.36} ${f.waist - 11} L${CX - s * 0.72} ${arcY(CX - s * 0.72, f.neck, c)} M${CX + s * 0.36} ${f.waist - 11} L${CX + s * 0.72} ${arcY(CX + s * 0.72, f.neck, c)}`, { stroke: color, strokeWidth: 6 }),
    circle(CX - s * 0.36, f.waist - 8, 2.6, { fill: rivet }),
    circle(CX + s * 0.36, f.waist - 8, 2.6, { fill: rivet })
  ]
}

/**
 * The gold title belt every creature's Champion belt wears (approved 2026-11-16, mockup/pip-title-belts.html).
 * Reads only the torso anchors (waist, side). clip = the leather strap inside the body outline; extra = side plates,
 * the scalloped centre plate, jewels, the creature's crest, a blank nameplate, a shine and a sparkling glint.
 * style: { ink, strap, metal, dark, light, jewel, jewel2, leds?, crest: (x, y, r, ink) => shapes }; `leds` makes the
 * plate jewels chase. No lettering, no real-world belt marks.
 */
export function titleBelt(f, style) {
  const { ink, strap, metal, dark, light, jewel, jewel2, leds = false, crest } = style
  const CX = PIP_FOOT_X
  const c = curveOf(f)
  const y = f.waist
  const s = f.side
  const clip = [
    path(band(y - 6, y + 6, c), { fill: strap, stroke: ink, strokeWidth: 2.5 }),
    path(arc(y - 4.2, c), { stroke: metal, strokeWidth: 1.2, fill: 'none' }),
    path(arc(y + 4.2, c), { stroke: metal, strokeWidth: 1.2, fill: 'none' }),
    path(arc(y, c), { stroke: metal, strokeWidth: 0.8, strokeDasharray: '2 2.5', fill: 'none', opacity: 0.5 })
  ]
  const sidePlates = [-1, 1].flatMap(dir => {
    const px = CX + dir * s * 0.74
    const py = arcY(px, y, c)
    const pw = Math.max(8, s * 0.32)
    const ph = 11
    return [
      rect(px - pw / 2, py - ph / 2, pw, ph, { rx: 2, fill: metal, stroke: ink, strokeWidth: 1.8 }),
      rect(px - pw / 2 + 1.6, py - ph / 2 + 1.6, pw - 3.2, ph - 3.2, { rx: 1.2, fill: 'none', stroke: dark, strokeWidth: 0.9 }),
      path(`M${px - pw * 0.25} ${py + 1} q${pw * 0.12} -3 ${pw * 0.25} 0 t${pw * 0.25} 0`, { stroke: dark, strokeWidth: 0.9, fill: 'none' }),
      circle(px - pw / 2 + 2.6, py - ph / 2 + 2.6, 1.3, { fill: jewel }),
      circle(px + pw / 2 - 2.6, py + ph / 2 - 2.6, 1.3, { fill: jewel })
    ]
  })
  const W = Math.min(48, Math.max(26, s * 1.2))
  const H = W * 0.66
  const plate = (k) => {
    const w = W * k
    const h = H * k
    return `M${CX - w / 2} ${y - h * 0.28} Q${CX - w / 2} ${y - h * 0.5} ${CX - w * 0.3} ${y - h * 0.44} Q${CX} ${y - h * 0.64} ${CX + w * 0.3} ${y - h * 0.44} Q${CX + w / 2} ${y - h * 0.5} ${CX + w / 2} ${y - h * 0.28} V${y + h * 0.28} Q${CX + w / 2} ${y + h * 0.5} ${CX + w * 0.3} ${y + h * 0.44} Q${CX} ${y + h * 0.64} ${CX - w * 0.3} ${y + h * 0.44} Q${CX - w / 2} ${y + h * 0.5} ${CX - w / 2} ${y + h * 0.28} Z`
  }
  const scroll = [-1, 1].map(dir => path(
    `M${CX + dir * W * 0.3} ${y - H * 0.1} q${dir * W * 0.07} ${-H * 0.12} 0 ${-H * 0.22} M${CX + dir * W * 0.3} ${y + H * 0.06} q${dir * W * 0.07} ${H * 0.1} 0 ${H * 0.18}`,
    { stroke: dark, strokeWidth: 0.9, fill: 'none' }
  ))
  const jewels = [[-0.38, -0.2], [0.38, -0.2], [-0.38, 0.2], [0.38, 0.2], [0, -0.43]].map(([jx, jy], i) => {
    const color = i % 2 ? jewel2 : jewel
    const dot = circle(CX + jx * W, y + jy * H, 1.8, { fill: color, stroke: ink, strokeWidth: 0.7 })
    return leds ? fxGroup('chase', [dot], { animationDelay: `${i * 0.2}s`, filter: `drop-shadow(0 0 1.5px ${color})` }) : dot
  })
  const extra = [
    ...sidePlates,
    path(plate(1), { fill: metal, stroke: ink, strokeWidth: 2.4, strokeLinejoin: 'round' }),
    path(plate(0.82), { fill: 'none', stroke: dark, strokeWidth: 1.1 }),
    ...scroll,
    ...jewels,
    ...crest(CX, y - H * 0.06, H * 0.2, ink),
    rect(CX - W * 0.2, y + H * 0.22, W * 0.4, Math.max(2.4, H * 0.1), { rx: 1, fill: light, stroke: dark, strokeWidth: 0.7 }),
    path(`M${CX - W * 0.34} ${y - H * 0.32} q${W * 0.1} ${-H * 0.06} ${W * 0.2} ${-H * 0.04}`, { stroke: '#fff', strokeWidth: 1.4, strokeLinecap: 'round', opacity: 0.6 }),
    fxGroup('sparkle', [path(`M${CX + W * 0.28} ${y - H * 0.42} l1.2 2.6 l2.6 1.2 l-2.6 1.2 l-1.2 2.6 l-1.2 -2.6 l-2.6 -1.2 l2.6 -1.2 Z`, { fill: '#fff' })])
  ]
  return { clip, extra }
}
