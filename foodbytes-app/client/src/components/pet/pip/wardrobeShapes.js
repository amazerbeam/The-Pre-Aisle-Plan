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
