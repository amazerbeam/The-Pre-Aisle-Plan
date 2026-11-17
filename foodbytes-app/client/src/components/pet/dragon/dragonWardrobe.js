import { EYE_LEFT, PIP_FOOT_X } from '../pip/pipSpace.js'
import { arc, arcY, band, circle, curveOf, ellipse, fxGroup, footFrame, heartPath, overalls, path, rect, titleBelt } from '../pip/wardrobeShapes.js'
import { DRAGON_INK } from './dragonForms.js'

/**
 * Themed Pip lines: the dragon's wardrobe. The same 20 item ids, slots and unlocks as every line, drawn the
 * dragon's way (fantasy kit, scars and paint), ported from the approved
 * foodbytes-app/mockup/pip-themed-lines.html (DRAGON_WARDROBE, 2026-11-15) as shape descriptors.
 * Each item reads only its slot's anchors (hat / eyes / neck + waist + side / feet). Animated parts are
 * fxGroup descriptors (Pip.css); an animated group never carries a positioning transform.
 *
 * Names on the dragon (WARDROBE_ITEM_LABELS): beanie Wizard's hat, cap Bard's cap, chef-hat Singed toque,
 * straw-hat Jester's cap, top-hat Crown, round-specs Battle scar, heart-glasses Smitten, sunglasses War paint,
 * red-scarf Knight's cape, striped-scarf Ivy garland, chef-whites Baker's apron, denim-jacket Leather jerkin,
 * puffer Scale mail, leather-belt Potion belt, champion-belt Hoard belt, jeans Patched breeches,
 * joggers Wool hose, dungarees Smith's overalls, sneakers Fluffy fur boots, wellies Dragonscale boots.
 * Hats keep the horns on the head (HAT_CROWN: over = through holes, under = behind); the Battle scar takes the left eye (HIDES_EYE) and stays asleep.
 */

const CX = PIP_FOOT_X // every form is centred on x = 100
const DI = DRAGON_INK

// A four-point star (Wizard's hat), centred on (cx, cy) with radius r.
const star = (cx, cy, r, fill) => path(`M${cx} ${cy - r} L${cx + r * 0.3} ${cy - r * 0.3} L${cx + r} ${cy} L${cx + r * 0.3} ${cy + r * 0.3} L${cx} ${cy + r} L${cx - r * 0.3} ${cy + r * 0.3} L${cx - r} ${cy} L${cx - r * 0.3} ${cy - r * 0.3} Z`, { fill })

// ---- hats: (x, y, w) = head centre, brim line, hat width; `top` = highest y of the crown (animated parts at rest) ----

const HATS = {
  // Wizard's hat: a bent star-spangled cone; the tip star sparkles (inspired by game and storybook wizard hats)
  beanie: (x, y, w) => {
    const top = y - w * 1.05
    return {
      top,
      shapes: [
        path(`M${x - w * 0.36} ${y - 3} Q${x - w * 0.12} ${y - w * 0.55} ${x + w * 0.02} ${y - w * 0.9} Q${x + w * 0.14} ${top} ${x + w * 0.36} ${y - w * 0.86} Q${x + w * 0.16} ${y - w * 0.66} ${x + w * 0.36} ${y - 3} Z`, { fill: '#4b3a8c', stroke: DI, strokeWidth: 3.4, strokeLinejoin: 'round' }),
        path(`M${x - w * 0.3} ${y - w * 0.16} Q${x} ${y - w * 0.1} ${x + w * 0.32} ${y - w * 0.16}`, { stroke: '#d9a62e', strokeWidth: 5, fill: 'none' }),
        star(x - w * 0.08, y - w * 0.42, w * 0.07, '#ffd34d'),
        star(x + w * 0.14, y - w * 0.3, w * 0.05, '#ffd34d'),
        fxGroup('sparkle', [star(x + w * 0.36, y - w * 0.86, w * 0.07, '#fff3b0')]),
        ellipse(x, y - 2, w * 0.62, w * 0.12, { fill: '#5a479e', stroke: DI, strokeWidth: 3.2 })
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
  // Jester's cap: two floppy points, the bells sway (inspired by game and fairy-tale jesters)
  'straw-hat': (x, y, w) => {
    const point = (dir, fill) => path(`M${x + dir * w * 0.45} ${y - 2} Q${x + dir * w * 0.5} ${y - w * 0.5} ${x + dir * w * 0.82} ${y - w * 0.32} Q${x + dir * w * 0.42} ${y - w * 0.72} ${x} ${y - w * 0.42} Z`, { fill, stroke: DI, strokeWidth: 3, strokeLinejoin: 'round' })
    const bell = (bx, by) => fxGroup('sway', [
      circle(bx, by, w * 0.07, { fill: '#f0c14b', stroke: DI, strokeWidth: 1.8 }),
      path(`M${bx - w * 0.03} ${by + w * 0.02} h${w * 0.06}`, { stroke: DI, strokeWidth: 1.2 })
    ])
    const rim = `M${x - w / 2} ${y - 4} Q${x} ${y + 3} ${x + w / 2} ${y - 4}`
    return {
      top: y - w * 0.62,
      shapes: [
        point(-1, '#b8323a'),
        point(1, '#e3b23c'),
        path(`M${x - w * 0.45} ${y - 2} Q${x} ${y - w * 0.62} ${x + w * 0.45} ${y - 2} Z`, { fill: '#2f6b4a', stroke: DI, strokeWidth: 3, strokeLinejoin: 'round' }),
        bell(x - w * 0.82, y - w * 0.28),
        bell(x + w * 0.82, y - w * 0.28),
        path(rim, { stroke: '#e3b23c', strokeWidth: 6, strokeLinecap: 'round', fill: 'none' }),
        path(rim, { stroke: DI, strokeWidth: 1.4, strokeDasharray: '3 4', fill: 'none' })
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

// ---- glasses: (L, R, y, s) = the two eye points and the face scale. None replaces the dragon's face; the Battle scar takes one eye. ----

const GLASSES = {
  // Battle scar: the left eye is scarred shut (HIDES_EYE drops it from the face) under three claw marks
  'round-specs': (L, R, y, s) => [
    path(`M${L - 8 * s} ${y + 1 * s} Q${L} ${y + 4 * s} ${L + 8 * s} ${y + 1 * s}`, { stroke: DI, strokeWidth: 3.4 * s, strokeLinecap: 'round', fill: 'none' }),
    ...[-4, 0, 4].flatMap(o => {
      const d = `M${L - 11 * s + o * s} ${y - 15 * s} L${L + 7 * s + o * s} ${y + 13 * s}`
      return [
        path(d, { stroke: '#b9485c', strokeWidth: 3.2 * s, strokeLinecap: 'round' }),
        path(d, { stroke: '#f2a3b0', strokeWidth: 1.1 * s, strokeLinecap: 'round' })
      ]
    })
  ],
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

/** The dragon's Hoard belt: the shared gold title belt with a ruby shield crest (wardrobeShapes titleBelt). */
export const DRAGON_TITLE_BELT = {
  ink: DI, strap: '#241a14', metal: '#d9a53a', dark: '#93661a', light: '#ffe6a0', jewel: '#d43a4a', jewel2: '#2f9a6a',
  crest: (x, y, r, ink) => [
    path(`M${x - r * 0.8} ${y - r * 0.8} H${x + r * 0.8} V${y + r * 0.1} Q${x + r * 0.8} ${y + r * 0.8} ${x} ${y + r} Q${x - r * 0.8} ${y + r * 0.8} ${x - r * 0.8} ${y + r * 0.1} Z`, { fill: '#7a2730', stroke: ink, strokeWidth: 1.2 }),
    path(`M${x} ${y - r * 0.55} l${r * 0.35} ${r * 0.45} l${-r * 0.35} ${r * 0.45} l${-r * 0.35} ${-r * 0.45} Z`, { fill: '#ff8a96' })
  ]
}

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
  // Hoard belt: the gold title belt (a glint sparkles on the plate)
  'champion-belt': (f) => titleBelt(f, DRAGON_TITLE_BELT),
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

// ---- shoes: each replaces the whole foot, drawn in the foot frame (approved 2026-11-17, mockup pip-dragon-shoes.html) ----
const GOLD = '#e8b838'
const FUR = '#fbf3e4'
const inked = (fill, strokeWidth = 2.4) => ({ fill, stroke: DI, strokeWidth, strokeLinejoin: 'round' })

const SHOES = {
  // Fluffy fur boots: brown boots under a cream fur cuff, with a pom-pom tie
  // (inspired by the Fluffy Fur Boots in Monster Hunter Rise and the snow boots in Animal Crossing)
  sneakers: (root, tip) => [footFrame(root, tip, [
    path('M-12 2.5 H15 Q16 4 15 6 H-12 Z', inked('#3d2416', 2)),
    path('M-11 3.5 V-5 H3 Q4 -1.5 10 -0.5 Q15 0.5 15 3.5 Z', inked('#7b4a2b')),
    ...[[-11, -5], [-6, -7], [-1, -7], [3.5, -5]].map(([cx, cy]) => circle(cx, cy, 4.2, { fill: FUR, stroke: DI, strokeWidth: 2 })),
    ellipse(-3.8, -5.3, 9, 3.3, { fill: FUR }),
    path('M8 -0.6 v2', { stroke: '#d9b98a', strokeWidth: 1.2 }),
    circle(8, 2.6, 1.8, { fill: FUR, stroke: DI, strokeWidth: 1 })
  ])],
  // Dragonscale boots: deep-red scale boots with a gold cuff and a blue gem
  // (inspired by the Dragonscale Boots in Stardew Valley and the drakeskin boots of Throne and Liberty)
  wellies: (root, tip) => [footFrame(root, tip, [
    path('M-12 3 H15 Q16.5 4.5 15 6 H-12 Z', inked('#3a1218', 2)),
    path('M-11 3.5 V-8 H2 V-4 Q10 -3.5 14 -0.5 Q16 2.5 14 3.5 Z', inked('#9c2f3a')),
    ...[-5, -1.5, 2].flatMap((sy, row) => [-10, -6, -2, 2, 6]
      .filter(sx => !(sy < -2 && sx > 0)) // the top row stops at the ankle
      .map(sx => path(`M${sx + (row % 2) * 2} ${sy} q2 2.6 4 0`, { stroke: '#6b1c26', strokeWidth: 1.2, fill: 'none' }))),
    rect(-12.5, -11.5, 16, 4.4, { rx: 1.6, ...inked(GOLD, 2) }),
    path('M-4.5 -11.6 l2 2.2 l-2 2.2 l-2 -2.2 Z', { fill: '#4aa8e8', stroke: DI, strokeWidth: 1 })
  ])]
}

// ---- the bare foot: a little ball, no claws (mockup pip-dragon-shoes.html BARE.dragon) ----
const BARE_FOOT = (root, tip, f) => [footFrame(root, tip, [
  ellipse(1, -0.5, 7.5, 5.2, { fill: f.fill[1], stroke: DI, strokeWidth: 2.8, strokeLinejoin: 'round' }),
  ellipse(-1, -2.8, 3.2, 1.5, { fill: '#fff', opacity: 0.35 })
])]

/** The dragon's wardrobe in the shape every line shares (pip/wardrobeArt.js dispatches on it). */
export const DRAGON_WARDROBE = {
  HATS, // id → (x, y, w) → { top, shapes, straight? }
  GLASSES, // id → (L, R, y, s) → shapes
  TORSO, // id → (f) → { clip, extra, back? }
  SHOES, // id → (root, tip) → shapes
  BARE_FOOT, // (root, tip, f) → shapes: the foot when no shoe is worn
  REPLACES_FACE: [], // the dragon keeps its own face under every item
  // Approved 2026-11-16 (mockup pip-dragon-fixes.html): horns over the hat (as if through holes) or tucked behind it.
  HAT_CROWN: { beanie: 'over', cap: 'over', 'chef-hat': 'under', 'straw-hat': 'over', 'top-hat': 'under' },
  HIDES_EYE: { 'round-specs': EYE_LEFT }, // the Battle scar takes the left eye
  STAYS_ASLEEP: ['round-specs'] // a scar doesn't come off at night
}
