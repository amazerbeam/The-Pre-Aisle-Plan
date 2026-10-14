import { HERB_FOOT_X, HERB_INK } from './herbForms.js'

/**
 * MPP-32 AC 3: every clothing item, drawn once from a form's anchors and never per form. Ported
 * from .claude/contract/MPP-15-epic-breakdown/mockups/pip-herb-wardrobe.html (HATS … SHOES,
 * drawPants … drawShoe). `f` is a herbForm(form) geometry; each function reads only the anchors
 * its slot uses (hat / eyes / neck + waist + side / feet) and returns shape descriptors —
 * { tag: 'path'|'circle'|'rect'|'ellipse', ...React SVG attributes } — that HerbOutfit.jsx
 * renders, so wardrobe.check.mjs can run the geometry in node.
 */

const CX = HERB_FOOT_X // every form is centred on x = 100

const fillPath = (d, fill, strokeWidth = 3.5) =>
  ({ tag: 'path', d, fill, stroke: HERB_INK, strokeWidth, strokeLinejoin: 'round' })
const strokePath = (d, stroke, strokeWidth, extra = {}) =>
  ({ tag: 'path', d, fill: 'none', stroke, strokeWidth, ...extra })
const bandShape = (d, fill, strokeWidth) => ({ tag: 'path', d, fill, stroke: HERB_INK, strokeWidth })

// ---- hats: (x, y, w) = head centre, brim line, hat width; `top` = highest y of the crown ----

const HATS = {
  beanie: (x, y, w) => {
    const h = w * 0.46
    return {
      top: y - h,
      shapes: [
        fillPath(`M${x - w / 2} ${y} C${x - w / 2} ${y - h * 1.3} ${x + w / 2} ${y - h * 1.3} ${x + w / 2} ${y} Z`, '#e8574a'),
        strokePath(`M${x - w * 0.22} ${y - h * 0.9} v${h * 0.7} M${x} ${y - h * 0.97} v${h * 0.8} M${x + w * 0.22} ${y - h * 0.9} v${h * 0.7}`, '#b83a30', 2.5),
        { tag: 'rect', x: x - w / 2 - 3, y: y - 7, width: w + 6, height: 11, rx: 5, fill: '#f6efe2', stroke: HERB_INK, strokeWidth: 3.5 }
      ]
    }
  },
  cap: (x, y, w) => {
    const h = w * 0.42
    return {
      top: y - h,
      shapes: [
        fillPath(`M${x + w * 0.3} ${y - 2} q${w * 0.45} -2 ${w * 0.62} 6 q${-w * 0.3} 6 ${-w * 0.62} 2 Z`, '#3c6fc6'),
        fillPath(`M${x - w / 2} ${y} C${x - w / 2} ${y - h * 1.3} ${x + w / 2} ${y - h * 1.3} ${x + w / 2} ${y} Z`, '#4a86e0'),
        { tag: 'circle', cx: x, cy: y - h * 0.98, r: 3, fill: '#3c6fc6', stroke: HERB_INK, strokeWidth: 2 }
      ]
    }
  },
  'chef-hat': (x, y, w) => {
    const h = w * 0.55
    return {
      top: y - h - 10,
      straight: true, // AC 3: the chef hat is never tilted
      shapes: [
        fillPath(`M${x - w / 2 + 4} ${y - 4} C${x - w / 2 - 12} ${y - h} ${x - w / 4} ${y - h - 18} ${x} ${y - h - 8} C${x + w / 4} ${y - h - 18} ${x + w / 2 + 12} ${y - h} ${x + w / 2 - 4} ${y - 4} Z`, '#fff'),
        { tag: 'rect', x: x - w / 2, y: y - 9, width: w, height: 12, rx: 3, fill: '#fff', stroke: HERB_INK, strokeWidth: 3.5 }
      ]
    }
  },
  'straw-hat': (x, y, w) => {
    const h = w * 0.34
    return {
      top: y - h,
      shapes: [
        { tag: 'ellipse', cx: x, cy: y - 2, rx: w * 0.86, ry: w * 0.17, fill: '#f2d58a', stroke: HERB_INK, strokeWidth: 3.5 },
        fillPath(`M${x - w * 0.34} ${y - 2} C${x - w * 0.34} ${y - h * 1.3} ${x + w * 0.34} ${y - h * 1.3} ${x + w * 0.34} ${y - 2} Z`, '#f6df9e'),
        strokePath(`M${x - w * 0.33} ${y - h * 0.3} h${w * 0.66}`, '#7cc95a', Math.max(4, w * 0.09))
      ]
    }
  },
  'top-hat': (x, y, w) => {
    const h = w * 0.6
    const cw = w * 0.66
    return {
      top: y - h,
      shapes: [
        { tag: 'rect', x: x - cw / 2, y: y - h, width: cw, height: h, rx: 3, fill: '#2d2a3a', stroke: HERB_INK, strokeWidth: 3.5 },
        { tag: 'rect', x: x - cw / 2, y: y - h * 0.32, width: cw, height: h * 0.16, fill: '#e8574a' },
        { tag: 'ellipse', cx: x, cy: y, rx: w * 0.58, ry: w * 0.1, fill: '#2d2a3a', stroke: HERB_INK, strokeWidth: 3.5 }
      ]
    }
  }
}

// ---- glasses: (L, R, y, s) = the two eye points and the face scale ----

const GLASSES = {
  'round-specs': (L, R, y, s) => [
    { tag: 'circle', cx: L, cy: y, r: 12 * s, fill: '#fff', fillOpacity: 0.25, stroke: HERB_INK, strokeWidth: 3 },
    { tag: 'circle', cx: R, cy: y, r: 12 * s, fill: '#fff', fillOpacity: 0.25, stroke: HERB_INK, strokeWidth: 3 },
    strokePath(`M${L + 12 * s} ${y - 2} Q${(L + R) / 2} ${y - 8 * s} ${R - 12 * s} ${y - 2}`, HERB_INK, 3)
  ],
  'heart-glasses': (L, R, y, s) => [
    ...[L, R].map(x => ({
      tag: 'path',
      d: `M${x} ${y + 9 * s} C${x - 16 * s} ${y - 1 * s} ${x - 12 * s} ${y - 14 * s} ${x} ${y - 6 * s} C${x + 12 * s} ${y - 14 * s} ${x + 16 * s} ${y - 1 * s} ${x} ${y + 9 * s} Z`,
      fill: '#ff6fa3', fillOpacity: 0.85, stroke: HERB_INK, strokeWidth: 3
    })),
    strokePath(`M${L + 10 * s} ${y - 4 * s} H${R - 10 * s}`, HERB_INK, 3)
  ],
  sunglasses: (L, R, y, s) => [
    ...[L, R].map(x => ({ tag: 'rect', x: x - 13 * s, y: y - 9 * s, width: 26 * s, height: 18 * s, rx: 8 * s, fill: '#2d2a3a', stroke: HERB_INK, strokeWidth: 3 })),
    strokePath(`M${L + 13 * s} ${y - 3} H${R - 13 * s}`, HERB_INK, 3),
    strokePath(`M${L - 7 * s} ${y - 4 * s} l${6 * s} -2 M${R - 7 * s} ${y - 4 * s} l${6 * s} -2`, '#fff', 2, { strokeLinecap: 'round', opacity: 0.7 })
  ]
}

// ---- torso bands between the neck and waist lines, curved like a smile, clipped to the body ----

const curveOf = (f) => f.side * 0.32
const arcY = (x, y0, c) => {
  const t = x / 200
  return y0 - c + 4 * c * t * (1 - t)
}
const arc = (y0, c) => `M0 ${y0 - c} Q${CX} ${y0 + c} 200 ${y0 - c}`
const band = (y0, y1, c) => `M0 ${y0 - c} Q${CX} ${y0 + c} 200 ${y0 - c} L200 ${y1 - c} Q${CX} ${y1 + c} 0 ${y1 - c} Z`

function pants({ color, seam, straps = false }, f) {
  const c = curveOf(f)
  const s = f.side
  const clip = [
    bandShape(band(f.waist, 240, c), color, 3),
    strokePath(`M${CX} ${f.waist} V200`, HERB_INK, 2.5, { opacity: 0.35 }),
    strokePath(arc(f.waist + 4, c), seam, 1.8, { strokeDasharray: '4 3' })
  ]
  if (straps) {
    clip.push(
      fillPath(`M${CX - s * 0.42} ${f.waist + 1} V${f.waist - 13} H${CX + s * 0.42} V${f.waist + 1}`, color, 3),
      strokePath(`M${CX - s * 0.36} ${f.waist - 11} L${CX - s * 0.72} ${arcY(CX - s * 0.72, f.neck, c)} M${CX + s * 0.36} ${f.waist - 11} L${CX + s * 0.72} ${arcY(CX + s * 0.72, f.neck, c)}`, color, 6),
      { tag: 'circle', cx: CX - s * 0.36, cy: f.waist - 8, r: 2.6, fill: '#e3c35a' },
      { tag: 'circle', cx: CX + s * 0.36, cy: f.waist - 8, r: 2.6, fill: '#e3c35a' }
    )
  }
  return { clip, extra: [] }
}

// AC 3: no sleeves — every jacket is a vest-cut band.
function jacket({ color, dark, style }, f) {
  const c = curveOf(f)
  const s = f.side
  const top = f.neck + 1
  const bottom = f.waist + 1
  const clip = [bandShape(band(top, bottom, c), color, 3)]
  if (style === 'open') {
    clip.push(
      fillPath(`M${CX - s * 0.22} ${arcY(CX - s * 0.22, top, c)} L${CX} ${bottom - 3} L${CX + s * 0.22} ${arcY(CX + s * 0.22, top, c)} Z`, '#fff', 2.5),
      strokePath(arc(bottom - 4, c), '#e3c35a', 1.6, { strokeDasharray: '3 3' }),
      strokePath(`M${CX - s * 0.62} ${arcY(CX - s * 0.62, top, c) + 7} h${s * 0.22}`, HERB_INK, 2, { opacity: 0.5 })
    )
  } else if (style === 'quilted') {
    for (let y = top + 6; y < bottom - 1; y += 6) clip.push(strokePath(arc(y, c), dark, 2))
    clip.push(strokePath(`M${CX} ${top} V${bottom}`, HERB_INK, 2.5))
  } else {
    const gap = Math.max(5, (bottom - top - 4) / 3)
    for (let y = top + 4; y < bottom - 1; y += gap) {
      clip.push(
        { tag: 'circle', cx: CX - s * 0.16, cy: y, r: 1.9, fill: HERB_INK },
        { tag: 'circle', cx: CX + s * 0.16, cy: y, r: 1.9, fill: HERB_INK }
      )
    }
  }
  return { clip, extra: [] }
}

// AC 3: the buckle sits outside the clip.
function belt({ color, buckle, big }, f) {
  const c = curveOf(f)
  const h = big ? 12 : 8
  const w = f.waist
  const extra = big
    ? [
        { tag: 'ellipse', cx: CX, cy: w, rx: 15, ry: 11, fill: buckle, stroke: HERB_INK, strokeWidth: 3 },
        { tag: 'path', d: `M${CX} ${w - 6} l2 4 h4 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 h4 Z`, fill: '#e8574a' }
      ]
    : [
        { tag: 'rect', x: CX - 6, y: w - 6, width: 12, height: 12, rx: 2, fill: 'none', stroke: buckle, strokeWidth: 3 },
        { tag: 'rect', x: CX - 6, y: w - 6, width: 12, height: 12, rx: 2, fill: 'none', stroke: HERB_INK, strokeWidth: 1 }
      ]
  return { clip: [bandShape(band(w - h / 2, w + h / 2, c), color, 2.5)], extra }
}

// AC 3: the tail and knot sit outside the clip.
function scarf({ color, stripe }, f) {
  const c = curveOf(f)
  const y = f.neck - 3
  const tx = CX + f.side * 0.45
  const ty = arcY(tx, y, c)
  const len = f.waist - f.neck + 8
  return {
    clip: [bandShape(band(y - 6, y + 6, c), color, 3), strokePath(arc(y, c), stripe, 3)],
    extra: [
      fillPath(`M${tx - 6} ${ty} l-3 ${len} h12 l2 ${-len} Z`, color, 3),
      strokePath(`M${tx - 9} ${ty + len} l-1 4 M${tx - 4} ${ty + len} v5 M${tx + 1} ${ty + len} l1 4`, HERB_INK, 2),
      { tag: 'rect', x: tx - 6, y: ty - 5, width: 10, height: 10, rx: 3, fill: color, stroke: HERB_INK, strokeWidth: 3 }
    ]
  }
}

const TORSO = {
  'red-scarf': (f) => scarf({ color: '#e8574a', stripe: '#c63f34' }, f),
  'striped-scarf': (f) => scarf({ color: '#ffd34d', stripe: '#4a86e0' }, f),
  'chef-whites': (f) => jacket({ color: '#fbfbf7', dark: '#d9d9cf', style: 'chef' }, f),
  'denim-jacket': (f) => jacket({ color: '#5b85c4', dark: '#3f669f', style: 'open' }, f),
  puffer: (f) => jacket({ color: '#f0a03c', dark: '#c97f24', style: 'quilted' }, f),
  'leather-belt': (f) => belt({ color: '#7a4a2a', buckle: '#e3c35a', big: false }, f),
  'champion-belt': (f) => belt({ color: '#d6a52b', buckle: '#fff3b0', big: true }, f),
  jeans: (f) => pants({ color: '#4a6fb0', seam: '#e3c35a' }, f),
  joggers: (f) => pants({ color: '#8a8f99', seam: '#fff' }, f),
  dungarees: (f) => pants({ color: '#6f9a4a', seam: '#e3c35a', straps: true }, f)
}

// ---- shoes on the two foot tips ----

const SHOES = {
  sneakers: { color: '#fff', trim: '#e8574a', tall: false },
  wellies: { color: '#e8b830', trim: '#c98f1a', tall: true }
}

function shoe({ color, trim, tall }, root, tip) {
  const dir = tip[0] < root[0] ? -1 : 1
  const [x, y] = tip
  if (tall) {
    return [
      fillPath(`M${x - 8 * dir} ${y - 14} h${12 * dir} v9 q${7 * dir} 1 ${8 * dir} 7 h${-20 * dir} Z`, color, 3),
      strokePath(`M${x - 8 * dir} ${y - 10} h${12 * dir}`, trim, 2.5)
    ]
  }
  return [
    fillPath(`M${x - 9 * dir} ${y + 2} q0 -10 ${9 * dir} -10 q${10 * dir} 0 ${12 * dir} 8 q0 3 -3 3 Z`, color, 3),
    strokePath(`M${x - 2 * dir} ${y - 6} l${5 * dir} 5`, trim, 2.5, { strokeLinecap: 'round' }),
    strokePath(`M${x - 9 * dir} ${y + 2} h${21 * dir}`, trim, 2)
  ]
}

/** { top, straight?, shapes } on the head anchor, or null for an id that isn't a hat. */
export const hatArt = (id, f) => HATS[id]?.(CX, f.hat.y, f.hat.w) ?? null

/** Shapes on the two eye points, scaled with the face. */
export const glassesArt = (id, f) => GLASSES[id]?.(CX - f.eyes.gap, CX + f.eyes.gap, f.eyes.y, f.eyes.s) ?? []

/** { clip, extra }: clip = drawn inside the body outline, extra = outside it. */
export const torsoArt = (id, f) => TORSO[id]?.(f) ?? { clip: [], extra: [] }

/** Shapes for both feet. */
export const shoeArt = (id, f) => (SHOES[id] ? f.feet.flatMap(([root, tip]) => shoe(SHOES[id], root, tip)) : [])

// Every id this file can draw, for wardrobe.check.mjs.
export const DRAWN_ITEM_IDS = [
  ...Object.keys(HATS), ...Object.keys(GLASSES), ...Object.keys(TORSO), ...Object.keys(SHOES)
]
