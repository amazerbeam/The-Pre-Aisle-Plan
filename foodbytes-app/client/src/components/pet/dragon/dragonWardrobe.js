import { PIP_FOOT_X } from '../pip/pipSpace.js'
import { arc, arcY, band, circle, curveOf, ellipse, fxGroup, heartPath, overalls, path, rect } from '../pip/wardrobeShapes.js'
import { DRAGON_INK } from './dragonForms.js'

/**
 * Themed Pip lines: the dragon's wardrobe. The same 20 item ids, slots and unlocks as every line, drawn the
 * dragon's way (fantasy kit, scars and paint), ported from the approved
 * foodbytes-app/mockup/pip-themed-lines.html (DRAGON_WARDROBE, 2026-11-15) as shape descriptors.
 * Each item reads only its slot's anchors (hat / eyes / neck + waist + side / feet). Animated parts are
 * fxGroup descriptors (Pip.css); an animated group never carries a positioning transform.
 *
 * Names on the dragon (WARDROBE_ITEM_LABELS): beanie Horn cosy, cap Bard's cap, chef-hat Singed toque,
 * straw-hat Bird's nest, top-hat Crown, round-specs Battle scar, heart-glasses Smitten, sunglasses War paint,
 * red-scarf Knight's cape, striped-scarf Ivy garland, chef-whites Baker's apron, denim-jacket Leather jerkin,
 * puffer Scale mail, leather-belt Potion belt, champion-belt Hoard belt, jeans Patched breeches,
 * joggers Wool hose, dungarees Smith's overalls, sneakers Talon wraps, wellies Iron sabatons.
 */

const CX = PIP_FOOT_X // every form is centred on x = 100
const DI = DRAGON_INK


// ---- hats: (x, y, w) = head centre, brim line, hat width; `top` = highest y of the crown (animated parts at rest) ----

const HATS = {
  // Horn cosy: horns poke through
  beanie: (x, y, w) => {
    const h = w * 0.46
    return {
      top: y - h,
      shapes: [
        path(`M${x - w / 2} ${y} C${x - w / 2} ${y - h * 1.3} ${x + w / 2} ${y - h * 1.3} ${x + w / 2} ${y} Z`, { fill: '#d9a441', stroke: DI, strokeWidth: 3.5, strokeLinejoin: 'round' }),
        ...[-0.25, 0, 0.25].map(k => path(`M${x + w * k} ${y - h * 0.95} l-2 4 l2 4 l-2 4 l2 4 l-2 4`, { stroke: '#b88428', strokeWidth: 2, fill: 'none' })),
        rect(x - w / 2 - 3, y - 7, w + 6, 11, { rx: 5, fill: '#f3e2b0', stroke: DI, strokeWidth: 3.5 })
      ]
    }
  },
  // Bard's cap: the feather sways
  cap: (x, y, w) => {
    const h = w * 0.36
    const fx0 = x + w * 0.18
    const fy0 = y - h * 0.8
    return {
      top: fy0 - w * 0.55 - 2,
      shapes: [
        fxGroup('sway', [
          path(`M${fx0} ${fy0} C${fx0 + w * 0.15} ${fy0 - w * 0.3} ${fx0 + w * 0.42} ${fy0 - w * 0.5} ${fx0 + w * 0.55} ${fy0 - w * 0.55} C${fx0 + w * 0.42} ${fy0 - w * 0.36} ${fx0 + w * 0.24} ${fy0 - w * 0.12} ${fx0 + 4} ${fy0 + 2} Z`, { fill: '#c8463d', stroke: DI, strokeWidth: 2.4, strokeLinejoin: 'round' }),
          path(`M${fx0 + 2} ${fy0} Q${fx0 + w * 0.3} ${fy0 - w * 0.3} ${fx0 + w * 0.52} ${fy0 - w * 0.53}`, { stroke: '#7a2520', strokeWidth: 1.4, fill: 'none' })
        ]),
        path(`M${x - w / 2} ${y} C${x - w / 2} ${y - h * 1.4} ${x + w / 2} ${y - h * 1.4} ${x + w / 2} ${y} Z`, { fill: '#3f7d4e', stroke: DI, strokeWidth: 3.5, strokeLinejoin: 'round' }),
        path(`M${x - w / 2 - 2} ${y - 1} Q${x} ${y + 5} ${x + w / 2 + 2} ${y - 1}`, { stroke: '#2c5a37', strokeWidth: 5, strokeLinecap: 'round', fill: 'none' })
      ]
    }
  },
  // Singed toque: smoke wisps; never tilted
  'chef-hat': (x, y, w) => {
    const h = w * 0.55
    return {
      top: y - h - 24,
      straight: true,
      shapes: [
        path(`M${x - w / 2 + 4} ${y - 4} C${x - w / 2 - 12} ${y - h} ${x - w / 4} ${y - h - 18} ${x} ${y - h - 8} C${x + w / 4} ${y - h - 18} ${x + w / 2 + 12} ${y - h} ${x + w / 2 - 4} ${y - 4} Z`, { fill: '#fffaf0', stroke: DI, strokeWidth: 3.5, strokeLinejoin: 'round' }),
        ellipse(x + w * 0.3, y - h * 0.7, w * 0.12, w * 0.08, { fill: '#6b4a2e', opacity: 0.45 }),
        ellipse(x - w * 0.28, y - h * 0.45, w * 0.08, w * 0.06, { fill: '#6b4a2e', opacity: 0.4 }),
        rect(x - w / 2, y - 9, w, 12, { rx: 3, fill: '#fffaf0', stroke: DI, strokeWidth: 3.5 }),
        path(`M${x + w * 0.2} ${y - 9} v12`, { stroke: '#6b4a2e', strokeWidth: 3, opacity: 0.35 }),
        ...[0, 1, 2].map(i => fxGroup('smoke', [circle(x + w * 0.12 + i * 3, y - h - 16, 3.5 + i, { fill: '#9a9187', opacity: 0.55 })], { animationDelay: `${i * 0.7}s` }))
      ]
    }
  },
  // Bird's nest: the egg wobbles
  'straw-hat': (x, y, w) => {
    const ex = x + w * 0.05
    const ey = y - w * 0.2
    const er = w * 0.13
    const twigs = [[-0.5, -0.1, 0.1, 0.05], [-0.3, 0.06, 0.45, -0.12], [-0.55, -0.02, -0.15, -0.2], [0.1, 0.08, 0.55, -0.06]]
      .map(([a, b, c, d]) => path(`M${x + w * a} ${y + w * b} L${x + w * c} ${y + w * d}`, { stroke: '#5e3b1a', strokeWidth: 2, strokeLinecap: 'round' }))
    return {
      top: ey - er * 1.3 - 2,
      shapes: [
        ellipse(x, y - 4, w * 0.56, w * 0.17, { fill: '#8a5a2b', stroke: DI, strokeWidth: 3 }),
        fxGroup('wobble', [
          ellipse(ex, ey, er, er * 1.3, { fill: '#a9dbe8', stroke: DI, strokeWidth: 2.4 }),
          circle(ex - er * 0.3, ey - er * 0.2, er * 0.14, { fill: '#6a9bb0' }),
          circle(ex + er * 0.35, ey + er * 0.4, er * 0.11, { fill: '#6a9bb0' })
        ]),
        path(`M${x - w * 0.56} ${y - 4} Q${x} ${y + w * 0.2} ${x + w * 0.56} ${y - 4} Q${x} ${y + 2} ${x - w * 0.56} ${y - 4} Z`, { fill: '#a06a35', stroke: DI, strokeWidth: 2.6 }),
        ...twigs
      ]
    }
  },
  // Crown: a gem sparkles
  'top-hat': (x, y, w) => {
    const a = x - w * 0.42
    const b = x + w * 0.42
    const h = w * 0.55
    const q = (b - a) * 0.25
    return {
      top: y - h - 4,
      shapes: [
        path(`M${a} ${y} L${a} ${y - h * 0.6} L${a + q} ${y - h * 0.3} L${x} ${y - h} L${b - q} ${y - h * 0.3} L${b} ${y - h * 0.6} L${b} ${y} Z`, { fill: '#f0c14b', stroke: DI, strokeWidth: 3.2, strokeLinejoin: 'round' }),
        rect(a, y - 7, b - a, 7, { fill: '#d9a62e', stroke: DI, strokeWidth: 2.2 }),
        ...[[-0.22, '#d43a4a'], [0, '#3a7bd4'], [0.22, '#3aa86b']].map(([k, col]) => circle(x + w * k, y - 3.5, 2.3, { fill: col, stroke: DI, strokeWidth: 1 })),
        ...[[a, y - h * 0.6], [x, y - h], [b, y - h * 0.6]].map(([px, py]) => circle(px, py, 2.8, { fill: '#fff3b0', stroke: DI, strokeWidth: 1.4 })),
        fxGroup('sparkle', [
          path(`M${x + w * 0.2} ${y - h * 0.95} l1.6 3.4 l3.4 1.6 l-3.4 1.6 l-1.6 3.4 l-1.6 -3.4 l-3.4 -1.6 l3.4 -1.6 Z`, { fill: '#fff' })
        ])
      ]
    }
  }
}

// ---- glasses: (L, R, y, s) = the two eye points and the face scale. None replaces the dragon's face. ----

const GLASSES = {
  // Battle scar: claw marks over one eye
  'round-specs': (L, R, y, s) => [-4, 0, 4].flatMap(o => {
    const d = `M${L - 11 * s + o * s} ${y - 15 * s} L${L + 7 * s + o * s} ${y + 13 * s}`
    return [
      path(d, { stroke: '#b9485c', strokeWidth: 3.2 * s, strokeLinecap: 'round' }),
      path(d, { stroke: '#f2a3b0', strokeWidth: 1.1 * s, strokeLinecap: 'round' })
    ]
  }),
  // Smitten: heart pupils pulse; hearts float up
  'heart-glasses': (L, R, y, s) => [
    ...[L, R].map(x => fxGroup('pulse', [
      path(heartPath(x, y, 5.5 * s), { fill: '#ff4f87', stroke: DI, strokeWidth: 1.6 * s }),
      circle(x - 2 * s, y - 3 * s, 1.4 * s, { fill: '#fff' })
    ])),
    ...[0, 1].map(i => fxGroup('rise', [path(heartPath(R + 14 * s + i * 6 * s, y - 16 * s - i * 6 * s, 2.6 * s), { fill: '#ff7aa5' })], { animationDelay: `${i * 1.1}s` }))
  ],
  // War paint: ochre stripes and a brow mark
  sunglasses: (L, R, y, s) => [
    ...[L, R].map(x => path(`M${x - 7 * s} ${y + 10 * s} l${5 * s} ${7 * s} M${x - 1 * s} ${y + 10 * s} l${5 * s} ${7 * s}`, { stroke: '#c0622f', strokeWidth: 2.6 * s, strokeLinecap: 'round' })),
    path(`M100 ${y - 17 * s} l${3 * s} ${3.5 * s} l${-3 * s} ${3.5 * s} l${-3 * s} ${-3.5 * s} Z`, { fill: '#c0622f' })
  ]
}

// ---- torso items between the neck and waist lines, curved like a smile; clip = inside the body, extra = outside, back = behind it ----

const TORSO = {
  // Knight's cape: sways behind the body (the back layer), a collar and a clasp
  'red-scarf': (f) => {
    const c = curveOf(f)
    const y0 = f.neck - 4
    const sx = f.side + 6
    return {
      back: [fxGroup('cape', [
        path(`M${CX - sx} ${y0} Q${CX} ${y0 - 6} ${CX + sx} ${y0} L${CX + sx + 12} 178 Q${CX + sx * 0.6} 186 ${CX + sx * 0.3} 180 Q${CX} 187 ${CX - sx * 0.3} 180 Q${CX - sx * 0.6} 186 ${CX - sx - 12} 178 Z`, { fill: '#b8323a', stroke: DI, strokeWidth: 3, strokeLinejoin: 'round' }),
        path(`M${CX - sx * 0.5} ${y0 + 6} L${CX - sx * 0.6} 178 M${CX + sx * 0.5} ${y0 + 6} L${CX + sx * 0.6} 178`, { stroke: '#8e2229', strokeWidth: 2, opacity: 0.6 })
      ])],
      clip: [path(band(f.neck - 7, f.neck - 1, c), { fill: '#b8323a', stroke: DI, strokeWidth: 2.5 })],
      extra: [
        circle(CX, f.neck - 4, 4.6, { fill: '#f0c14b', stroke: DI, strokeWidth: 2 }),
        circle(CX, f.neck - 4, 1.8, { fill: '#d43a4a' })
      ]
    }
  },
  // Ivy garland: leaves and a daisy
  'striped-scarf': (f) => {
    const c = curveOf(f)
    const y = f.neck - 3
    const leaves = []
    for (let i = -3; i <= 3; i++) {
      const x = CX + i * f.side * 0.27
      const ly = arcY(x, y, c)
      leaves.push(path('M0 0 q5 -6 11 -1 q-5 6 -11 1 Z', { transform: `translate(${x - 5} ${ly}) rotate(${i % 2 ? -25 : 25} 5 0)`, fill: i % 2 ? '#5fa046' : '#7cc260', stroke: DI, strokeWidth: 1.4 }))
    }
    return {
      clip: [path(band(y - 2.5, y + 2.5, c), { fill: '#4f8a3a' })],
      extra: [...leaves, circle(CX, y - 1, 2.6, { fill: '#fff', stroke: DI, strokeWidth: 1.2 }), circle(CX, y - 1, 1, { fill: '#ffd34d' })]
    }
  },
  // Baker's apron: floury paw prints
  'chef-whites': (f) => {
    const c = curveOf(f)
    const top = f.neck + 1
    const bottom = f.waist + 1
    const mid = (top + bottom) / 2
    const paw = (x, y) => [circle(x, y, 2, { fill: '#d9c48f' }), ...[-2.4, 0, 2.4].map(dx => circle(x + dx, y - 2.8, 0.9, { fill: '#d9c48f' }))]
    return {
      clip: [
        path(band(top, bottom, c), { fill: '#f4ead2', stroke: DI, strokeWidth: 3 }),
        rect(CX - f.side * 0.25, mid, f.side * 0.5, (bottom - top) * 0.32, { rx: 2, fill: 'none', stroke: '#cdb98a', strokeWidth: 1.6 }),
        ...paw(CX - f.side * 0.5, mid - 1),
        ...paw(CX + f.side * 0.45, mid + 3)
      ],
      extra: []
    }
  },
  // Leather jerkin: laced front
  'denim-jacket': (f) => {
    const c = curveOf(f)
    const top = f.neck + 1
    const bottom = f.waist + 1
    const lace = []
    for (let y = top + 2; y < bottom - 3; y += 5) lace.push(path(`M97 ${y} L103 ${y + 5} M103 ${y} L97 ${y + 5}`, { stroke: '#e8d3a8', strokeWidth: 1.4 }))
    return {
      clip: [
        path(band(top, bottom, c), { fill: '#7a4b2a', stroke: DI, strokeWidth: 3 }),
        path(`M${CX} ${top} V${bottom}`, { stroke: '#5a3519', strokeWidth: 2 }),
        ...lace,
        path(arc(bottom - 3, c), { stroke: '#c9a46a', strokeWidth: 1.3, strokeDasharray: '3 3', fill: 'none' })
      ],
      extra: []
    }
  },
  // Scale mail: rows of steel scales
  puffer: (f) => {
    const c = curveOf(f)
    const top = f.neck + 1
    const bottom = f.waist + 1
    const rows = []
    for (let y = top + 4, r = 0; y < bottom; y += 4.5, r++) {
      for (let x = CX - f.side - 6 + (r % 2) * 3; x < CX + f.side + 6; x += 6) {
        rows.push(path(`M${x - 3} ${arcY(x, y, c)} a3 3 0 0 0 6 0`, { stroke: '#5f6a73', strokeWidth: 1.2, fill: 'none' }))
      }
    }
    return { clip: [path(band(top, bottom, c), { fill: '#a3adb5', stroke: DI, strokeWidth: 3 }), ...rows], extra: [] }
  },
  // Potion belt: bubbles rise in the vials
  'leather-belt': (f) => {
    const c = curveOf(f)
    const y = f.waist + 3
    const vial = (x, col) => [
      rect(x - 1.8, y - 1, 3.6, 3, { fill: '#a07a50', stroke: DI, strokeWidth: 1 }),
      circle(x, y + 7.5, 4.6, { fill: col, stroke: DI, strokeWidth: 1.4 }),
      rect(x - 1.8, y + 1.5, 3.6, 3, { fill: col }),
      fxGroup('rise', [circle(x + 1, y + 9, 1, { fill: '#fff', opacity: 0.85 })])
    ]
    return {
      clip: [path(band(f.waist - 4, f.waist + 4, c), { fill: '#6b4226', stroke: DI, strokeWidth: 2.5 })],
      extra: [...vial(CX - f.side * 0.55, '#d8475c'), ...vial(CX + f.side * 0.5, '#4f8ad8')]
    }
  },
  // Hoard belt: the gem buckle sparkles
  'champion-belt': (f) => {
    const c = curveOf(f)
    const clip = [path(band(f.waist - 6, f.waist + 6, c), { fill: '#e3b23c', stroke: DI, strokeWidth: 2.5 })]
    for (let x = 6; x < 200; x += 9) clip.push(circle(x, arcY(x, f.waist, c), 3, { fill: '#f5d06a', stroke: '#b88a1f', strokeWidth: 1.2 }))
    return {
      clip,
      extra: [
        path(`M${CX} ${f.waist - 9} l8 9 l-8 9 l-8 -9 Z`, { fill: '#d43a4a', stroke: DI, strokeWidth: 2.4, strokeLinejoin: 'round' }),
        path(`M${CX} ${f.waist - 9} v18 M92 ${f.waist} h16`, { stroke: '#ff8a96', strokeWidth: 1, opacity: 0.7 }),
        fxGroup('sparkle', [path(`M105 ${f.waist - 10} l1.4 3 l3 1.4 l-3 1.4 l-1.4 3 l-1.4 -3 l-3 -1.4 l3 -1.4 Z`, { fill: '#fff' })])
      ]
    }
  },
  // Patched breeches: stitched patches
  jeans: (f) => {
    const c = curveOf(f)
    return {
      clip: [
        path(band(f.waist, 240, c), { fill: '#8a6a45', stroke: DI, strokeWidth: 3 }),
        path(`M${CX} ${f.waist} V200`, { stroke: DI, strokeWidth: 2.5, opacity: 0.35 }),
        rect(CX - f.side * 0.5, f.waist + 5, 9, 7, { fill: '#a8875a', stroke: '#5c4428', strokeWidth: 1.2, strokeDasharray: '2 1.5' }),
        rect(CX + f.side * 0.25, f.waist + 8, 7, 6, { fill: '#6f5434', stroke: '#5c4428', strokeWidth: 1.2, strokeDasharray: '2 1.5' })
      ],
      extra: []
    }
  },
  // Wool hose: ribbed knit
  joggers: (f) => {
    const c = curveOf(f)
    const clip = [path(band(f.waist, 240, c), { fill: '#6f7f5a', stroke: DI, strokeWidth: 3 })]
    for (let x = CX - f.side - 4; x < CX + f.side + 4; x += 4) clip.push(path(`M${x} ${arcY(x, f.waist, c) + 2} V200`, { stroke: '#5c6a4a', strokeWidth: 1.1, opacity: 0.75 }))
    return { clip, extra: [] }
  },
  // Smith's overalls: leather with brass rivets
  dungarees: (f) => ({ clip: overalls(f, '#5e3d26', '#d9a62e', DI), extra: [] })
}

// ---- shoes on the two foot tips: (root, tip) ----

const SHOES = {
  // Talon wraps: the claws stay out
  sneakers: (root, tip) => {
    const dir = tip[0] < root[0] ? -1 : 1
    const [x, y] = tip
    return [
      path(`M${x - 8 * dir} ${y - 10} h${10 * dir} l${2 * dir} 10 h${-13 * dir} Z`, { fill: '#e9dcc0', stroke: DI, strokeWidth: 2.4, strokeLinejoin: 'round' }),
      path(`M${x - 8 * dir} ${y - 6} l${11 * dir} 2 M${x - 8 * dir} ${y - 2} l${11 * dir} 2`, { stroke: '#b9a77f', strokeWidth: 1.5 })
    ]
  },
  // Iron sabatons: plated armour
  wellies: (root, tip) => {
    const dir = tip[0] < root[0] ? -1 : 1
    const [x, y] = tip
    return [
      path(`M${x - 9 * dir} ${y - 14} h${12 * dir} l${7 * dir} 9 q${2 * dir} 5 ${-2 * dir} 7 h${-17 * dir} Z`, { fill: '#9aa5ae', stroke: DI, strokeWidth: 3, strokeLinejoin: 'round' }),
      path(`M${x - 9 * dir} ${y - 8} h${15 * dir} M${x - 9 * dir} ${y - 3} h${17 * dir}`, { stroke: '#6c7780', strokeWidth: 1.6 })
    ]
  }
}

/** The dragon's wardrobe in the shape every line shares (pip/wardrobeArt.js dispatches on it). */
export const DRAGON_WARDROBE = {
  HATS, // id → (x, y, w) → { top, shapes, straight? }
  GLASSES, // id → (L, R, y, s) → shapes
  TORSO, // id → (f) → { clip, extra, back? }
  SHOES, // id → (root, tip) → shapes
  REPLACES_FACE: [] // the dragon keeps its own face under every item
}
