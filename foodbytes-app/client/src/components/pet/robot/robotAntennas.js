import { circle, ellipse, fxGroup, group, path, rect } from '../pip/wardrobeShapes.js'
import { RB, ROBOT_INK } from './robotForms.js'

/**
 * The robot's Hat slot: antennas that replace the line's crown (ROBOT_WARDROBE.HAT_ANCHOR = 'crown'), ported from
 * the approved foodbytes-app/mockup/pip-robot-antennas.html (2026-11-16): beanie Prop-top, cap Radar bar,
 * chef-hat Toque charm, straw-hat Boing spring, top-hat Neon bolt.
 * Each is (x, base, rise, droop) → { top, shapes }: base = the head top (growTop), rise = the form's growthRise,
 * widths scale by rise / 22. Drooped, an antenna bends over (or hangs / squashes), dims, and has no animated group,
 * so no animated group ever carries a positioning transform.
 */

const RI = ROBOT_INK

const glowOf = (color, px) => ({ filter: `drop-shadow(0 0 ${px}px ${color})` })
const lit = (droop, color) => (droop ? RB.dim : color)
const socket = (x, base) => rect(x - 7, base - 2, 14, 6, { rx: 2, fill: RB.plate, stroke: RI, strokeWidth: 2.2 })
const rod = (d) => path(d, { stroke: RI, strokeWidth: 3.2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' })
/** The generic wilt: bent over to the right from the socket. */
const wilt = (x, base, shapes) => [group(shapes, { transform: `rotate(34 ${x} ${base + 2})` })]

function toque(x, y, droop) {
  const w = 22
  const hh = 11
  const y0 = y - 3
  return [
    path(`M${x - w / 2 + 2} ${y0} C${x - w / 2 - 5} ${y0 - hh} ${x - w / 4} ${y0 - hh - 7} ${x} ${y0 - hh - 3} C${x + w / 4} ${y0 - hh - 7} ${x + w / 2 + 5} ${y0 - hh} ${x + w / 2 - 2} ${y0} Z`,
      { fill: droop ? '#c9d0d6' : '#f1f5f8', stroke: RI, strokeWidth: 2.2, strokeLinejoin: 'round' }),
    path(`M${x - 3.5} ${y0 - hh} v${hh - 1.5} M${x + 3.5} ${y0 - hh} v${hh - 1.5}`, { stroke: '#b9c4ce', strokeWidth: 1.6 }),
    rect(x - w / 2 + 1, y - 3.5, w - 2, 6, { rx: 2, fill: '#dfe6ec', stroke: RI, strokeWidth: 2 }),
    circle(x, y - 0.5, 1.9, { fill: lit(droop, RB.accent) }) // the pink LED bead keeps the bulb's colour
  ]
}

export const ROBOT_ANTENNAS = {
  // Prop-top: a two-blade propeller seen side-on (it flips through as it spins)
  beanie: (x, base, rise, droop) => {
    const k = rise / 22
    const t = base - rise * 0.8
    const blades = [
      ellipse(x - 13 * k, t - 5, 13 * k, 4.2, { fill: RB.accent, stroke: RI, strokeWidth: 2 }),
      ellipse(x + 13 * k, t - 5, 13 * k, 4.2, { fill: RB.lime, stroke: RI, strokeWidth: 2 })
    ]
    const shapes = [
      socket(x, base),
      rod(`M${x} ${base + 2} V${t}`),
      rect(x - 3.5, t - 3, 7, 6, { rx: 2, fill: RB.bolt, stroke: RI, strokeWidth: 2 }),
      droop ? group(blades) : fxGroup('prop', blades),
      circle(x, t - 5, 2.6, { fill: RB.bolt, stroke: RI, strokeWidth: 1.8 })
    ]
    return { top: t - 9, shapes: droop ? wilt(x, base, shapes) : shapes }
  },
  // Radar bar: a slatted bar with a cyan strip that slowly sweeps round
  cap: (x, base, rise, droop) => {
    const k = rise / 22
    const t = base - rise * 0.65
    const bw = 30 * k
    const bar = [
      rect(x - bw / 2, t - 7, bw, 7, { rx: 3, fill: RB.plate, stroke: RI, strokeWidth: 2.2 }),
      rect(x - bw / 2 + 3, t - 5, bw - 6, 2.2, { fill: lit(droop, RB.glow) }),
      path(`M${x - bw / 4} ${t - 7} v7 M${x} ${t - 7} v7 M${x + bw / 4} ${t - 7} v7`, { stroke: RI, strokeWidth: 1.2, opacity: 0.6 })
    ]
    const shapes = [socket(x, base), rod(`M${x} ${base + 2} V${t}`), droop ? group(bar) : fxGroup('radar', bar)]
    return { top: t - 8, shapes: droop ? wilt(x, base, shapes) : shapes }
  },
  // Toque charm: today's antenna with the red bulb swapped for a tiny chef's toque that swings and steams
  'chef-hat': (x, base, rise, droop) => {
    if (droop) {
      const bx = x + 14
      const by = base - rise * 0.5
      return {
        top: by - 26,
        shapes: [
          socket(x, base),
          rod(`M${x} ${base + 2} Q${x} ${base - rise * 0.45} ${bx - 2} ${by}`),
          group(toque(bx, by + 2, true), { transform: `rotate(38 ${bx} ${by + 2})` })
        ]
      }
    }
    const tipY = base - rise + 6
    return {
      top: tipY - 32,
      shapes: [
        socket(x, base),
        rod(`M${x} ${base + 2} V${tipY + 1}`),
        circle(x, tipY - 4, 12, { fill: RB.accent, opacity: 0.16 }),
        fxGroup('dangle', toque(x, tipY, false)),
        ...[-4, 4].map((dx, i) => fxGroup('smoke', [circle(x + dx, tipY - 27, 2.6 + i, { fill: '#e8eef3', opacity: 0.8 })], { animationDelay: `${i * 0.9}s` }))
      ]
    }
  },
  // Boing spring: a coiled spring with a pink ball that boings; squashed short when drooped
  'straw-hat': (x, base, rise, droop) => {
    const k = rise / 22
    const H = droop ? rise * 0.55 : rise * 1.05
    const n = 6
    const dx = 6 * k
    let d = `M${x} ${base + 1}`
    for (let i = 1; i <= n; i++) d += ` L${i === n ? x : x + (i % 2 ? dx : -dx)} ${base + 1 - (H * i) / n}`
    const by = base + 1 - H - 5
    const line = { fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' }
    const coil = [
      path(d, { ...line, stroke: RI, strokeWidth: 4.6 }),
      path(d, { ...line, stroke: RB.bolt, strokeWidth: 2 }),
      ...(droop ? [] : [circle(x, by, 10, { fill: RB.accent, opacity: 0.22 })]),
      circle(x, by, 6, { fill: lit(droop, RB.accent), stroke: RI, strokeWidth: 2.4 }),
      circle(x - 2, by - 2, 1.6, { fill: '#fff', opacity: 0.7 })
    ]
    return { top: by - 11, shapes: [socket(x, base), droop ? group(coil) : fxGroup('boing', coil)] }
  },
  // Neon bolt: a lightning-bolt neon tube that flickers, with a lime spark; the neon goes out when drooped
  'top-hat': (x, base, rise, droop) => {
    const k = rise / 22
    const H = rise * 1.35
    const d = `M${x} ${base + 1} L${x} ${base - H * 0.22} L${x + 6 * k} ${base - H * 0.42} L${x - 6 * k} ${base - H * 0.62} L${x + 5 * k} ${base - H * 0.84} L${x} ${base - H}`
    const line = { fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' }
    const sy = base - H - 3
    const r = 5
    const shapes = [socket(x, base), path(d, { ...line, stroke: RI, strokeWidth: 6 })]
    if (droop) {
      shapes.push(path(d, { ...line, stroke: RB.dim, strokeWidth: 2.6 }))
    } else {
      shapes.push(
        fxGroup('flicker', [path(d, { ...line, stroke: RB.accent, strokeWidth: 2.6 })], glowOf(RB.accent, 3)),
        fxGroup('sparkle', [path(`M${x} ${sy - r} Q${x} ${sy} ${x + r} ${sy} Q${x} ${sy} ${x} ${sy + r} Q${x} ${sy} ${x - r} ${sy} Q${x} ${sy} ${x} ${sy - r}Z`, { fill: RB.lime })])
      )
    }
    return { top: base - H - 8, shapes: droop ? wilt(x, base, shapes) : shapes }
  }
}
