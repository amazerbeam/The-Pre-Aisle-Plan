import { PIP_FOOT_X } from '../pip/pipSpace.js'
import { arc, arcY, band, circle, curveOf, ellipse, fxGroup, group, overalls, path, pxCells, rect } from '../pip/wardrobeShapes.js'
import { RB, ROBOT_INK } from './robotForms.js'

/**
 * Themed Pip lines: the robot's wardrobe. The same 20 item ids, slots and unlocks as every line, drawn the
 * robot's way (hardware mods and screen faces), ported from the approved
 * foodbytes-app/mockup/pip-themed-lines.html (ROBOT_WARDROBE, 2026-11-15) as shape descriptors.
 * Each item reads only its slot's anchors (hat / eyes / neck + waist + side / feet). Animated parts are
 * fxGroup descriptors (Pip.css); an animated group never carries a positioning transform. Smiley.exe and
 * Heart eyes replace the screen face while worn (REPLACES_FACE).
 *
 * Names on the robot (WARDROBE_ITEM_LABELS): beanie Cooling fan, cap Holo visor, chef-hat Steam toque,
 * straw-hat Satellite dish, top-hat Neon top hat, round-specs Smiley.exe, heart-glasses Heart eyes,
 * sunglasses Shades.gif, red-scarf Cable coil, striped-scarf Hazard tape, chef-whites Oven door,
 * denim-jacket Hull plates, puffer Battery vest, leather-belt Tool belt, champion-belt Marquee belt,
 * jeans Coolant casing, joggers Servo sleeves, dungarees Maintenance overalls, sneakers Hover pads,
 * wellies Mag boots.
 */

const CX = PIP_FOOT_X // every form is centred on x = 100
const RI = ROBOT_INK

const glowOf = (color, px) => ({ filter: `drop-shadow(0 0 ${px}px ${color})` })

// ---- hats: (x, y, w) = head centre, brim line, hat width; `top` = highest y of the crown (animated parts at rest) ----

const HATS = {
  // Cooling fan: the blades spin (the invisible bounding circle keeps the group's centre on the hub)
  beanie: (x, y, w) => {
    const hw = w * 0.36
    const h = w * 0.34
    const cy = y - h / 2
    const r = h * 0.36
    return {
      top: y - h,
      straight: true,
      shapes: [
        rect(x - hw, y - h, hw * 2, h + 3, { rx: 4, fill: RB.plate, stroke: RI, strokeWidth: 3 }),
        circle(x, cy, r + 2, { fill: RB.dark, stroke: RI, strokeWidth: 2 }),
        fxGroup('spin', [
          circle(x, cy, r * 1.05, { fill: 'none' }),
          ...[0, 120, 240].map(a => ellipse(x, cy - r * 0.5, r * 0.32, r * 0.52, { fill: RB.bolt, transform: `rotate(${a} ${x} ${cy})` }))
        ]),
        circle(x, cy, r * 0.25, { fill: RB.glow }),
        path(`M${x - hw + 4} ${y - h + 4} v${h - 6} M${x + hw - 4} ${y - h + 4} v${h - 6}`, { stroke: RI, strokeWidth: 1.5, opacity: 0.5 })
      ]
    }
  },
  // Holo visor: a light scans across
  cap: (x, y, w) => ({
    top: y - 10,
    straight: true,
    shapes: [
      rect(x - w / 2, y - 10, w, 9, { rx: 3, fill: RB.plate, stroke: RI, strokeWidth: 3 }),
      path(`M${x - w * 0.52} ${y - 2} H${x + w * 0.52} L${x + w * 0.42} ${y + 8} H${x - w * 0.42} Z`, { fill: RB.glow, fillOpacity: 0.28, stroke: RB.glow, strokeWidth: 2, strokeLinejoin: 'round' }),
      fxGroup('scan', [rect(x - w * 0.42, y - 1, w * 0.12, 8, { fill: '#fff', opacity: 0.55 })])
    ]
  }),
  // Steam toque: steam puffs
  'chef-hat': (x, y, w) => {
    const h = w * 0.55
    return {
      top: y - h - 24,
      straight: true,
      shapes: [
        path(`M${x - w / 2 + 4} ${y - 4} C${x - w / 2 - 12} ${y - h} ${x - w / 4} ${y - h - 18} ${x} ${y - h - 8} C${x + w / 4} ${y - h - 18} ${x + w / 2 + 12} ${y - h} ${x + w / 2 - 4} ${y - 4} Z`, { fill: '#dfe6ec', stroke: RI, strokeWidth: 3.5, strokeLinejoin: 'round' }),
        path(`M${x - w * 0.18} ${y - h * 0.9} v${h * 0.7} M${x + w * 0.18} ${y - h * 0.9} v${h * 0.7}`, { stroke: '#b9c4ce', strokeWidth: 2.5 }),
        rect(x - w / 2, y - 9, w, 12, { rx: 3, fill: RB.plate, stroke: RI, strokeWidth: 3.5 }),
        ...[0.3, 0.5, 0.7].map(k => circle(x - w / 2 + w * k, y - 3, 1.6, { fill: RB.bolt })),
        ...[-0.18, 0.05, 0.22].map((k, i) => fxGroup('smoke', [circle(x + w * k, y - h - 16, 4 + i, { fill: '#e8eef3', opacity: 0.8 })], { animationDelay: `${i * 0.6}s` }))
      ]
    }
  },
  // Satellite dish: sweeps side to side
  'straw-hat': (x, y, w) => {
    const R = w * 0.42
    const by = y - w * 0.42
    return {
      top: by - w * 0.22 - 5,
      straight: true,
      shapes: [
        path(`M${x} ${y} V${by + 4}`, { stroke: RI, strokeWidth: 4, strokeLinecap: 'round' }),
        rect(x - 7, y - 5, 14, 7, { rx: 2, fill: RB.plate, stroke: RI, strokeWidth: 2.5 }),
        fxGroup('sway', [
          path(`M${x - R} ${by - 6} Q${x} ${by + 16} ${x + R} ${by - 6} Q${x} ${by + 2} ${x - R} ${by - 6} Z`, { fill: '#cdd5dc', stroke: RI, strokeWidth: 3, strokeLinejoin: 'round' }),
          path(`M${x} ${by + 4} L${x} ${by - w * 0.22}`, { stroke: RI, strokeWidth: 2.5 }),
          circle(x, by - w * 0.22, 3.2, { fill: RB.accent, stroke: RI, strokeWidth: 1.8 })
        ])
      ]
    }
  },
  // Neon top hat: the neon outline flickers
  'top-hat': (x, y, w) => {
    const h = w * 0.6
    const cw = w * 0.66
    const body = { rx: 3 }
    return {
      top: y - h,
      shapes: [
        rect(x - cw / 2, y - h, cw, h, { ...body, fill: '#141a22', stroke: RI, strokeWidth: 3.5 }),
        ellipse(x, y, w * 0.58, w * 0.1, { fill: '#141a22', stroke: RI, strokeWidth: 3.5 }),
        rect(x - cw / 2, y - h * 0.32, cw, h * 0.14, { fill: RB.glow }),
        fxGroup('flicker', [
          rect(x - cw / 2, y - h, cw, h, { ...body, fill: 'none', stroke: RB.accent, strokeWidth: 2 }),
          ellipse(x, y, w * 0.58, w * 0.1, { fill: 'none', stroke: RB.accent, strokeWidth: 2 })
        ], glowOf(RB.accent, 3))
      ]
    }
  }
}

// ---- glasses: (L, R, y, s) = the two eye points and the face scale. Smiley.exe and Heart eyes replace the screen face. ----

const HEART_CELLS = [[-2, -1], [-1, -1], [1, -1], [2, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]]
const SMILE_CELLS = [[-3, -1], [-2, 0], [-1, 1], [0, 1], [1, 1], [2, 0], [3, -1]]

const GLASSES = {
  // Smiley.exe: the screen becomes an emoji face; it blinks
  'round-specs': (L, R, y, s) => {
    const c = (L + R) / 2
    const r = (R - L) / 2 + 4 * s
    return [group([
      circle(c, y, r, { fill: '#ffd84d', stroke: '#c99a12', strokeWidth: 2 * s }),
      fxGroup('blink', [
        ellipse(c - r * 0.36, y - r * 0.18, r * 0.11, r * 0.2, { fill: RB.dark }),
        ellipse(c + r * 0.36, y - r * 0.18, r * 0.11, r * 0.2, { fill: RB.dark })
      ]),
      path(`M${c - r * 0.5} ${y + r * 0.18} Q${c} ${y + r * 0.78} ${c + r * 0.5} ${y + r * 0.18}`, { stroke: RB.dark, strokeWidth: 2.6 * s, fill: 'none', strokeLinecap: 'round' })
    ], { style: glowOf('#ffd84d', 2 * s) })]
  },
  // Heart eyes: pixel hearts pulse; replaces the face
  'heart-glasses': (L, R, y, s) => {
    const p = 2.6 * s
    return [
      ...[L, R].map(x => fxGroup('pulse', pxCells(HEART_CELLS, x, y - p * 0.5, p, RB.accent), glowOf(RB.accent, 2 * s))),
      group(pxCells(SMILE_CELLS, (L + R) / 2, y + 15 * s, 3.2 * s, RB.glow), { style: glowOf(RB.glow, 2 * s) })
    ]
  },
  // Shades.gif: pixel shades drop in
  sunglasses: (L, R, y, s) => {
    const p = 2.8 * s
    const lens = []
    for (let j = -1; j <= 1; j++) for (let i = -2; i <= 2; i++) if (!(j === 1 && Math.abs(i) === 2)) lens.push([i, j])
    const shapes = [...pxCells(lens, L, y, p, '#05080b'), ...pxCells(lens, R, y, p, '#05080b')]
    for (let x = L + 2.5 * p; x <= R - 2.5 * p + 0.01; x += p) shapes.push(...pxCells([[0, 0]], x, y - p, p, '#05080b'))
    shapes.push(...pxCells([[-1, -1]], L, y, p, '#fff'), ...pxCells([[-1, -1]], R, y, p, '#fff'))
    return [fxGroup('drop', shapes)]
  }
}

// ---- torso items between the neck and waist lines, curved like a smile; clip = inside the body, extra = outside it ----

const STAR_CELLS = [[0, -2], [-1, -1], [0, -1], [1, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [1, 1]]

const TORSO = {
  // Cable coil: the plug dangles
  'red-scarf': (f) => {
    const c = curveOf(f)
    const y = f.neck - 3
    const tx = CX + f.side * 0.45
    const ty = arcY(tx, y, c)
    const d = `M${tx} ${ty} C${tx + 8} ${ty + 10} ${tx - 6} ${ty + 18} ${tx + 2} ${f.waist}`
    return {
      clip: [
        path(band(y - 4, y + 4, c), { fill: '#d8473c', stroke: RI, strokeWidth: 2.5 }),
        path(arc(y - 1, c), { stroke: '#ff8a7a', strokeWidth: 1.5, fill: 'none' })
      ],
      extra: [
        path(d, { stroke: RI, strokeWidth: 6.5, fill: 'none', strokeLinecap: 'round' }),
        path(d, { stroke: '#d8473c', strokeWidth: 3.5, fill: 'none', strokeLinecap: 'round' }),
        rect(tx - 3, f.waist, 10, 8, { rx: 2, fill: RB.bolt, stroke: RI, strokeWidth: 2 }),
        path(`M${tx} ${f.waist + 8} v4 M${tx + 4} ${f.waist + 8} v4`, { stroke: RI, strokeWidth: 2 })
      ]
    }
  },
  // Hazard tape: the loose end flaps
  'striped-scarf': (f) => {
    const c = curveOf(f)
    const y = f.neck - 3
    const tx = CX + f.side * 0.45
    const ty = arcY(tx, y, c)
    const clip = [path(band(y - 6, y + 6, c), { fill: '#ffd13b', stroke: RI, strokeWidth: 2.5 })]
    for (let x = 0; x <= 200; x += 8) clip.push(path(`M${x} ${arcY(x, y, c) - 5} l6 10`, { stroke: '#1b1b1b', strokeWidth: 3 }))
    return {
      clip,
      extra: [fxGroup('flap', [
        path(`M${tx} ${ty - 4} l15 6 l-4 8 l-12 -6 Z`, { fill: '#ffd13b', stroke: RI, strokeWidth: 2.2, strokeLinejoin: 'round' }),
        path(`M${tx + 6} ${ty - 1} l-3 7`, { stroke: '#1b1b1b', strokeWidth: 2.5 })
      ])]
    }
  },
  // Oven door: the window glows
  'chef-whites': (f) => {
    const c = curveOf(f)
    const top = f.neck + 1
    const bottom = f.waist + 1
    const ww = f.side
    const wy = top + 7
    const wh = Math.max(4, bottom - top - 10)
    return {
      clip: [
        path(band(top, bottom, c), { fill: '#efece4', stroke: RI, strokeWidth: 3 }),
        ...[-0.4, 0, 0.4].map(k => circle(CX + f.side * k, top + 3.5, 1.9, { fill: RB.plate })),
        fxGroup('glow', [rect(CX - ww / 2, wy, ww, wh, { rx: 3, fill: '#ff9a3c', stroke: RI, strokeWidth: 2 })]),
        path(`M${CX - ww / 2 + 3} ${wy + 2} h${ww * 0.35}`, { stroke: '#fff', strokeWidth: 1.4, opacity: 0.6 })
      ],
      extra: []
    }
  },
  // Hull plates: stickered and riveted
  'denim-jacket': (f) => {
    const c = curveOf(f)
    const top = f.neck + 1
    const bottom = f.waist + 1
    const mid = (top + bottom) / 2
    const sx = CX + f.side * 0.62
    return {
      clip: [
        path(band(top, bottom, c), { fill: '#4f7fb8', stroke: RI, strokeWidth: 3 }),
        path(`M${CX - f.side * 0.4} ${top} V${bottom + 6} M${CX + f.side * 0.4} ${top} V${bottom + 6}`, { stroke: '#36618f', strokeWidth: 2 }),
        ...[-0.6, -0.2, 0.2, 0.6].map(k => circle(CX + f.side * k, top + 3, 1.3, { fill: RB.bolt })),
        circle(sx, mid + 2, 3.2, { fill: '#ffd13b', stroke: RI, strokeWidth: 1.2 }),
        path(`M${sx} ${mid} v4 M${sx - 2} ${mid + 2} h4`, { stroke: RI, strokeWidth: 1 })
      ],
      extra: []
    }
  },
  // Battery vest: the cells charge up
  puffer: (f) => {
    const c = curveOf(f)
    const top = f.neck + 1
    const bottom = f.waist + 1
    const cw = f.side * 0.36
    const ch = bottom - top - 6
    const cells = []
    ;[-1, 0, 1].forEach(i => {
      const x = CX + i * f.side * 0.48 - cw / 2
      const y = top + 3
      cells.push(rect(x, y, cw, ch, { rx: 2, fill: RB.dark, stroke: RB.bolt, strokeWidth: 1.4 }))
      ;[2, 1, 0].forEach((b, n) => {
        cells.push(fxGroup('charge', [
          rect(x + 1.5, y + 1.5 + n * (ch - 3) / 3, cw - 3, Math.max(0.5, (ch - 3) / 3 - 1), { fill: RB.lime })
        ], { animationDelay: `${(b * 0.35 + (i + 1) * 0.15).toFixed(2)}s` }))
      })
    })
    return { clip: [path(band(top, bottom, c), { fill: '#2b3640', stroke: RI, strokeWidth: 3 }), ...cells], extra: [] }
  },
  // Tool belt: a wrench and a driver
  'leather-belt': (f) => {
    const c = curveOf(f)
    const wx = CX - f.side * 0.6
    const sx = CX + f.side * 0.55
    const y = f.waist + 2
    return {
      clip: [path(band(f.waist - 4, f.waist + 4, c), { fill: '#6b4a2b', stroke: RI, strokeWidth: 2.5 })],
      extra: [
        group([
          rect(-1.6, 2, 3.2, 12, { rx: 1, fill: RB.bolt, stroke: RI, strokeWidth: 1.2 }),
          path('M-4.5 3 a4.5 4.5 0 1 1 9 0 h-2.6 v-3 h-3.8 v3 Z', { fill: RB.bolt, stroke: RI, strokeWidth: 1.2 })
        ], { transform: `translate(${wx} ${y}) rotate(18)` }),
        group([
          rect(-2.6, 0, 5.2, 7, { rx: 1.5, fill: RB.accent, stroke: RI, strokeWidth: 1.2 }),
          path('M0 7 v8', { stroke: RB.bolt, strokeWidth: 1.8 })
        ], { transform: `translate(${sx} ${y}) rotate(-12)` })
      ]
    }
  },
  // Marquee belt: LEDs chase round
  'champion-belt': (f) => {
    const c = curveOf(f)
    const clip = [path(band(f.waist - 6, f.waist + 6, c), { fill: '#1a2028', stroke: RI, strokeWidth: 2.5 })]
    for (let x = 4, n = 0; x < 200; x += 7, n++) {
      clip.push(fxGroup('chase', [circle(x, arcY(x, f.waist, c), 1.5, { fill: RB.glow })], { animationDelay: `${(n % 4) * 0.2}s` }))
    }
    return {
      clip,
      extra: [
        rect(88, f.waist - 8, 24, 16, { rx: 3, fill: '#e8c34a', stroke: RI, strokeWidth: 2.5 }),
        ...pxCells(STAR_CELLS, 100, f.waist + 1, 2.2, RB.accent)
      ]
    }
  },
  // Coolant casing: ribbed blue casing
  jeans: (f) => {
    const c = curveOf(f)
    const clip = [
      path(band(f.waist, 240, c), { fill: '#3c6c9e', stroke: RI, strokeWidth: 3 }),
      path(`M${CX} ${f.waist} V200`, { stroke: RI, strokeWidth: 2, opacity: 0.35 })
    ]
    for (let y = f.waist + 5; y < 196; y += 5) clip.push(path(arc(y, c), { stroke: '#2f5884', strokeWidth: 1.4, fill: 'none' }))
    clip.push(circle(CX - f.side * 0.5, f.waist + 4, 1.4, { fill: RB.bolt }), circle(CX + f.side * 0.5, f.waist + 4, 1.4, { fill: RB.bolt }))
    return { clip, extra: [] }
  },
  // Servo sleeves: flexible accordion
  joggers: (f) => {
    const c = curveOf(f)
    const clip = [path(band(f.waist, 240, c), { fill: '#7d8792', stroke: RI, strokeWidth: 3 })]
    for (let y = f.waist + 3, n = 0; y < 196; y += 3, n++) clip.push(path(arc(y, c), { stroke: n % 2 ? '#9aa3ad' : '#626b75', strokeWidth: 1.3, fill: 'none' }))
    return { clip, extra: [] }
  },
  // Maintenance overalls: hi-vis with a stencil
  dungarees: (f) => ({
    clip: [
      ...overalls(f, '#e07a2e', RB.bolt, RI),
      rect(CX + f.side * 0.12, f.waist + 4, f.side * 0.5, 5, { fill: '#1f2a33', opacity: 0.55 })
    ],
    extra: []
  })
}

// ---- shoes on the two foot tips: (root, tip) ----

const SHOES = {
  // Hover pads: the thrusters pulse
  sneakers: (root, [x, y]) => [
    fxGroup('hover', [ellipse(x, y + 4, 9, 3.2, { fill: RB.glow, opacity: 0.75, style: glowOf(RB.glow, 3) })]),
    ellipse(x, y - 1, 11, 4.5, { fill: RB.plate, stroke: RI, strokeWidth: 2.5 }),
    path(`M${x - 6} ${y - 1} h12`, { stroke: RB.glow, strokeWidth: 1.6 })
  ],
  // Mag boots: hazard-striped
  wellies: (root, tip) => {
    const dir = tip[0] < root[0] ? -1 : 1
    const [x, y] = tip
    return [
      path(`M${x - 9 * dir} ${y - 15} h${14 * dir} v9 q${8 * dir} 1 ${9 * dir} 8 h${-23 * dir} Z`, { fill: '#3a4652', stroke: RI, strokeWidth: 3, strokeLinejoin: 'round' }),
      path(`M${x - 9 * dir} ${y - 10} h${14 * dir}`, { stroke: '#ffd13b', strokeWidth: 2.5, strokeDasharray: '3 3' }),
      path(`M${x - 9 * dir} ${y + 1} h${23 * dir}`, { stroke: '#ffd13b', strokeWidth: 2 })
    ]
  }
}

/** The robot's wardrobe in the shape every line shares (pip/wardrobeArt.js dispatches on it). */
export const ROBOT_WARDROBE = {
  HATS, // id → (x, y, w) → { top, shapes, straight? }
  GLASSES, // id → (L, R, y, s) → shapes
  TORSO, // id → (f) → { clip, extra, back? }
  SHOES, // id → (root, tip) → shapes
  REPLACES_FACE: ['round-specs', 'heart-glasses'] // the screen shows the emoji / hearts instead of the face
}
