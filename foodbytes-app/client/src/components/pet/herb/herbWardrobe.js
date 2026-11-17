import { PIP_FOOT_X } from '../pip/pipSpace.js'
import { arc, arcY, band, curveOf, footFrame, path, titleBelt } from '../pip/wardrobeShapes.js'
import { HERB_INK } from './herbForms.js'

/**
 * MPP-32 AC 3 / themed lines: the herb's clothing; every item, drawn once from a form's anchors and never per form. Ported
 * from .claude/contract/MPP-15-epic-breakdown/mockups/pip-herb-wardrobe.html (HATS … SHOES,
 * drawPants … drawShoe). `f` is a pipForm(line, form) geometry; each function reads only the anchors
 * its slot uses (hat / eyes / neck + waist + side / feet) and returns shape descriptors —
 * { tag: 'path'|'circle'|'rect'|'ellipse', ...React SVG attributes } — that PipOutfit.jsx
 * renders, so wardrobe.check.mjs can run the geometry in node.
 */

const CX = PIP_FOOT_X // every form is centred on x = 100

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

// AC 3: the buckle sits outside the clip. (The Champion belt is the shared title belt: HERB_TITLE_BELT.)
function belt({ color, buckle }, f) {
  const c = curveOf(f)
  const w = f.waist
  return {
    clip: [bandShape(band(w - 4, w + 4, c), color, 2.5)],
    extra: [
      { tag: 'rect', x: CX - 6, y: w - 6, width: 12, height: 12, rx: 2, fill: 'none', stroke: buckle, strokeWidth: 3 },
      { tag: 'rect', x: CX - 6, y: w - 6, width: 12, height: 12, rx: 2, fill: 'none', stroke: HERB_INK, strokeWidth: 1 }
    ]
  }
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

/** The herb's Champion belt: the shared gold title belt with a basil-leaf crest (wardrobeShapes titleBelt). */
export const HERB_TITLE_BELT = {
  ink: HERB_INK, strap: '#1d1712', metal: '#e3b23c', dark: '#a8781a', light: '#fff0b0', jewel: '#d4384a', jewel2: '#d4384a',
  crest: (x, y, r, ink) => [
    path(`M${x} ${y + r} C${x - r * 0.9} ${y + r * 0.2} ${x - r * 0.7} ${y - r * 0.8} ${x} ${y - r} C${x + r * 0.7} ${y - r * 0.8} ${x + r * 0.9} ${y + r * 0.2} ${x} ${y + r} Z`, { fill: '#6cbf4a', stroke: ink, strokeWidth: 1.2 }),
    path(`M${x} ${y + r * 0.9} V${y - r * 0.6}`, { stroke: ink, strokeWidth: 1, opacity: 0.7 })
  ]
}

const TORSO = {
  'red-scarf': (f) => scarf({ color: '#e8574a', stripe: '#c63f34' }, f),
  'striped-scarf': (f) => scarf({ color: '#ffd34d', stripe: '#4a86e0' }, f),
  'chef-whites': (f) => jacket({ color: '#fbfbf7', dark: '#d9d9cf', style: 'chef' }, f),
  'denim-jacket': (f) => jacket({ color: '#5b85c4', dark: '#3f669f', style: 'open' }, f),
  puffer: (f) => jacket({ color: '#f0a03c', dark: '#c97f24', style: 'quilted' }, f),
  'leather-belt': (f) => belt({ color: '#7a4a2a', buckle: '#e3c35a' }, f),
  'champion-belt': (f) => titleBelt(f, HERB_TITLE_BELT),
  jeans: (f) => pants({ color: '#4a6fb0', seam: '#e3c35a' }, f),
  joggers: (f) => pants({ color: '#8a8f99', seam: '#fff' }, f),
  dungarees: (f) => pants({ color: '#6f9a4a', seam: '#e3c35a', straps: true }, f)
}

// ---- shoes: each replaces the whole foot, drawn in the foot frame (mockup pip-dragon-shoes.html FOOTWEAR.herb) ----
const SHOES = {
  sneakers: (root, tip) => [footFrame(root, tip, [
    fillPath('M-11 4 Q-12 -7 -1 -7.5 Q9 -7.5 12.5 0 Q13.5 4 10 4 Z', '#fff', 2.8),
    strokePath('M-11 3 H12', '#e8574a', 2.2),
    strokePath('M-3 -6 l5 5', '#e8574a', 2.4, { strokeLinecap: 'round' })
  ])],
  wellies: (root, tip) => [footFrame(root, tip, [
    fillPath('M-10 4 V-11 H3 V-3 Q11 -2 12.5 2 V4 Z', '#e8b830', 2.8),
    strokePath('M-10 -7 H3', '#c98f1a', 2.5)
  ])]
}

// ---- the bare foot: a little ball in the form's limb colour (mockup pip-dragon-shoes.html BARE.herb) ----
const BARE_FOOT = (root, tip, f) => [footFrame(root, tip, [
  { tag: 'ellipse', cx: 1, cy: -0.5, rx: 7, ry: 4.8, fill: f.fill[1], stroke: HERB_INK, strokeWidth: 2.6, strokeLinejoin: 'round' },
  { tag: 'ellipse', cx: -1, cy: -2.6, rx: 3, ry: 1.4, fill: '#fff', opacity: 0.35 }
])]

/** The herb's wardrobe in the shape every line shares (pip/wardrobeArt.js dispatches on it). */
export const HERB_WARDROBE = {
  HATS, // id → (x, y, w) → { top, shapes, straight? }
  GLASSES, // id → (L, R, y, s) → shapes
  TORSO, // id → (f) → { clip, extra, back? }
  SHOES, // id → (root, tip) → shapes: a shoe replaces the whole foot
  BARE_FOOT, // (root, tip, f) → shapes: the foot when no shoe is worn
  REPLACES_FACE: [] // glasses ids that replace the face while worn
}
