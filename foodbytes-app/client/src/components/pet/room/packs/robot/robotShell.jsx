import { ROOM_SIZE } from '../../../../../constants/petRoom'
import { P, pts, shade } from '../../iso'
import { SKIRTING_HEIGHT } from '../../roomDecor'
import { cat, fmt, glowG, rnd, wallAt, wallLen, xy } from '../packShapes'
import {
  AMBER,
  CABLE_DK,
  GUN,
  GUN_DK,
  GUN_LT,
  LIME,
  NEON,
  PINK,
  ROBOT_INK,
  RUST,
  SCREEN,
  STEEL,
  STEEL_DK
} from './robotPalette'
import { FLOORS } from './robotFloors'
import { S, neon, rivetsU } from './robotParts'

/**
 * MPP-45: the robot workshop's shell, ported from pip-room-robot.html `ROBOT_ROOM.styles` / `.backdrop` (lines 1032-1080 and the
 * builders at 701-973) and the draw order of its `room-engine` backdropSVG (lines 1896-1923). The window is drawn in world coords
 * inside the window gap, exactly as the mockup engine places it (no WINDOW_SHIFT group). Ids are the live ROOM_STYLES ids; the
 * names live in petRoomLabels.js.
 */
const { poly, isoLine, isoLines, box, rectV, rectU, bill, fxg } = S
const { u: ROOM_U, v: ROOM_V, h: WALL_HEIGHT } = ROOM_SIZE

export const ROBOT_STYLES = {
  'wall-white': { left: '#56626e', right: '#667380', skirting: '#3f4852' },
  'wall-lavender': { left: '#69704f', right: '#7a8260', skirting: '#4f5539' },
  'wall-mint': { left: '#3f7479', right: '#4f868b', skirting: '#2f5a5e' },
  'wall-peach': { left: '#9a5f3d', right: '#ad6f4b', skirting: '#774a30' },
  'wall-sky': { left: '#516e8e', right: '#617f9f', skirting: '#3d556f' },
  'wall-sprig': { left: '#2d5f4f', right: '#386f5c', skirting: '#22473b', pattern: 'circuit' },
  'floor-lilac': { base: '#363d46', pattern: 'mat' },
  'floor-oak': { base: '#6b7682', pattern: 'diamond' },
  'floor-terracotta': { base: '#1d232a', pattern: 'grate' },
  'floor-checker': { base: '#2a2f36', checker: '#d4a82a', pattern: 'hazard' }
}

/* ---------- walls: gunmetal panels with rivets and scuffs, then the style's pattern, then the shell's fixtures ---------- */


function wallPanels(plane, w) {
  const at = wallAt(plane)
  const len = wallLen(plane)
  const r = rnd(plane === 'left' ? 13 : 29)
  const COL = 40
  const H = WALL_HEIGHT
  const SEAM = 72
  const base = plane === 'left' ? w.left : w.right
  const dark = shade(base, -30)
  const light = shade(base, 22)
  const tints = []
  const rivets = []
  let seams = ''
  let lights = ''
  let drips = ''
  let scuffs = ''
  const dot = (a, h, k) => {
    const [x, y] = at(a, h)
    rivets.push(<circle key={rivets.length} cx={fmt(x)} cy={fmt(y)} r="1.15" fill={light} stroke={dark} strokeWidth=".6" />)
    if (k < 0.2) drips += `M${fmt(x)} ${fmt(y + 1.2)}L${fmt(x)} ${fmt(y + 5 + k * 40)}`
  }
  for (let row = 0; row < 2; row++) {
    const h0 = row ? SEAM : 0
    const h1 = row ? H : SEAM
    for (let a = 0; a < len; a += COL) {
      const a1 = Math.min(a + COL, len)
      const pick = r()
      if (pick < 0.55) tints.push(<polygon key={tints.length} points={pts([at(a, h0), at(a1, h0), at(a1, h1), at(a, h1)])} fill={pick < 0.27 ? '#ffffff' : '#000000'} opacity=".07" />)
      if (a > 0) {
        seams += `M${xy(at(a, h0))}L${xy(at(a, h1))}`
        lights += `M${xy(at(a + 1.4, h0))}L${xy(at(a + 1.4, h1))}`
      }
      if (a1 - a > 16) for (const aa of [a + 5, a1 - 5]) for (const hh of [h0 + (row ? 5 : 12), h1 - 5]) dot(aa, hh, r())
    }
  }
  seams += `M${xy(at(0, SEAM))}L${xy(at(len, SEAM))}`
  lights += `M${xy(at(0, SEAM - 1.6))}L${xy(at(len, SEAM - 1.6))}`
  for (let k = 0; k < 14; k++) {
    const a = 6 + r() * (len - 24)
    const h = 14 + r() * 120
    const l = 5 + r() * 11
    scuffs += `M${xy(at(a, h))}L${xy(at(a + l, h - l * 0.45))}`
  }
  return (
    <>
      {tints}
      <path d={seams} fill="none" stroke={dark} strokeWidth="1.3" strokeLinecap="round" />
      <path d={lights} fill="none" stroke={light} strokeWidth=".8" opacity=".55" />
      <path d={drips} fill="none" stroke={RUST} strokeWidth="1.1" opacity=".45" strokeLinecap="round" />
      <path d={scuffs} fill="none" stroke="#000000" strokeWidth="1" opacity=".22" strokeLinecap="round" />
      {rivets}
    </>
  )
}

/** Circuit-board wallpaper (wall pattern 'circuit'): chamfered traces ending in vias, and a few chips. */
function circuitTraces(plane) {
  const at = wallAt(plane)
  const len = wallLen(plane)
  const r = rnd(plane === 'left' ? 41 : 57)
  let d = ''
  const vias = []
  const chips = []
  for (let k = 0; k < 11; k++) {
    let a = 8 + r() * (len - 16)
    let h = 16 + r() * 118
    const dir = r() < 0.5 ? 1 : -1
    d += `M${xy(at(a, h))}`
    for (let i = 0; i < 4; i++) {
      const run = 10 + r() * 26
      a = Math.min(Math.max(a + dir * run, 4), len - 4)
      d += `L${xy(at(a, h))}`
      const drop = (r() < 0.5 ? 1 : -1) * (8 + r() * 16)
      h = Math.min(Math.max(h + drop, 12), 140)
      d += `L${xy(at(a + dir * Math.abs(drop) * 0.4, h))}`
      a = Math.min(Math.max(a + dir * Math.abs(drop) * 0.4, 4), len - 4)
    }
    const [x, y] = at(a, h)
    vias.push(
      <circle key={`v${k}`} cx={fmt(x)} cy={fmt(y)} r="2" fill="#e6c25a" stroke="#2b3a30" strokeWidth=".8" />,
      <circle key={`w${k}`} cx={fmt(x)} cy={fmt(y)} r=".7" fill="#2b3a30" />
    )
  }
  for (let k = 0; k < 4; k++) {
    const a = 20 + r() * (len - 60)
    const h = 30 + r() * 90
    const cw = 20
    const ch = 12
    chips.push(<polygon key={`c${k}`} points={pts([at(a, h), at(a + cw, h), at(a + cw, h + ch), at(a, h + ch)])} fill="#1c2a24" stroke="#0d1511" strokeWidth="1.2" />)
    for (let p = 0; p < 4; p++) {
      chips.push(
        <path
          key={`p${k}${p}`}
          d={`M${xy(at(a + 3 + p * 5, h))}L${xy(at(a + 3 + p * 5, h - 3))}M${xy(at(a + 3 + p * 5, h + ch))}L${xy(at(a + 3 + p * 5, h + ch + 3))}`}
          stroke="#e6c25a"
          strokeWidth="1.1"
        />
      )
    }
    chips.push(<circle key={`d${k}`} cx={fmt(at(a + 4, h + ch - 4)[0])} cy={fmt(at(a + 4, h + ch - 4)[1])} r="1" fill="#9cff6a" />)
  }
  return (
    <>
      <path d={d} fill="none" stroke="#9ee6b8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity=".7" />
      {vias}
      {chips}
    </>
  )
}

/** A sagging cable along the right wall between two v values at height h. */
function sagCable(v0, v1, h, depth, color) {
  const points = []
  for (let i = 0; i <= 14; i++) {
    const t = i / 14
    points.push(P(0, v0 + (v1 - v0) * t, h - depth * Math.sin(Math.PI * t)))
  }
  return cat(isoLine(points, 3.6, CABLE_DK), isoLine(points, 1.8, color))
}

/** A blade of the vent fan at angle a. */
const ventBlade = (a) => (
  <path
    key={a}
    transform={`rotate(${a})`}
    d="M0 0 C3 -2 8 -5 4 -9.2 C-1 -8.4 -2.6 -3.6 0 0Z"
    fill={STEEL}
    stroke={ROBOT_INK}
    strokeWidth=".9"
    strokeLinejoin="round"
  />
)

/** The shell's wall fixtures: neon trim along both wall tops, two pipe runs, a vent fan, a buzzing neon sign, sagging cables. */
function shellFixtures() {
  const RU = ROOM_U
  const RV = ROOM_V
  const brackets = (map, n, step, h0, h1) => isoLines(Array.from({ length: n }, (_, i) => [map(20 + i * step, h0), map(20 + i * step, h1)]), 5, GUN_DK)
  const frame = [P(192, 0, 124), P(244, 0, 124), P(244, 0, 144), P(192, 0, 144), P(192, 0, 124)]
  const bolt = [[214, 142], [205, 134], [214, 134], [207, 126], [228, 137], [219, 137], [226, 142]].map(([u, h]) => P(u, 0, h))
  return cat(
    // neon trim under the ceiling line: cyan on the right wall, pink on the left
    isoLine([P(0, 0, 147.5), P(0, RV, 147.5)], 4, CABLE_DK),
    neon([P(0, 0, 147.5), P(0, RV, 147.5)], NEON, 1.8, 3.5),
    isoLine([P(0, 0, 147.5), P(RU, 0, 147.5)], 4, CABLE_DK),
    neon([P(0, 0, 147.5), P(RU, 0, 147.5)], PINK, 1.8, 3.5),
    // pipe runs with strap brackets: steel on the left wall, copper on the right
    brackets((a, h) => P(a, 0, h), 5, 50, 126, 138),
    isoLine([P(0, 0, 132), P(RU, 0, 132)], 6.2, CABLE_DK),
    isoLine([P(0, 0, 132), P(RU, 0, 132)], 4, STEEL_DK),
    isoLine([P(0, 0, 133.2), P(RU, 0, 133.2)], 1.1, '#e3e9ee', { op: 0.7 }),
    brackets((a, h) => P(0, a, h), 6, 52, 132, 144),
    isoLine([P(0, 0, 138), P(0, RV, 138)], 6.2, CABLE_DK),
    isoLine([P(0, 0, 138), P(0, RV, 138)], 4, RUST),
    isoLine([P(0, 0, 139.2), P(0, RV, 139.2)], 1.1, '#f1b894', { op: 0.7 }),
    bill(
      246,
      0,
      132,
      <>
        <circle r="5.5" fill="none" stroke={PINK} strokeWidth="1.8" />
        <path d="M-5.5 0 H5.5 M0 -5.5 V5.5" stroke={PINK} strokeWidth="1.4" />
        <circle r="1.4" fill={ROBOT_INK} />
      </>
    ),
    // sagging cables across the right wall
    sagCable(0, 150, 143, 9, PINK),
    sagCable(150, RV, 143, 7, NEON),
    // the vent fan on the right wall: a plate, a round bezel and slow blades (animated)
    rectU(0, 5, 35, 101, 131, GUN_DK, { sw: 1.6 }),
    rivetsU(0, [8, 32], 104, STEEL),
    rivetsU(0, [8, 32], 128, STEEL),
    bill(
      0,
      20,
      116,
      <>
        <circle r="12.5" fill={CABLE_DK} stroke={ROBOT_INK} strokeWidth="1.6" />
        <circle r="10.4" fill={SCREEN} stroke={GUN_LT} strokeWidth="1.2" />
        {fxg('fan', [0, 90, 180, 270].map(ventBlade))}
        <circle r="2.2" fill={GUN_LT} stroke={ROBOT_INK} strokeWidth="1" />
      </>
    ),
    // the neon sign above the fridge: a pink frame round a cyan bolt, buzzing (animated)
    rectV(0, 190, 246, 122, 146, CABLE_DK, { sw: 1.4 }),
    fxg('buzz', cat(neon(frame, PINK, 1.8, 4), neon(bolt, NEON, 1.6, 3)))
  )
}

function wallPattern(w) {
  return cat(wallPanels('left', w), wallPanels('right', w), w.pattern === 'circuit' ? cat(circuitTraces('left'), circuitTraces('right')) : null, shellFixtures())
}

/** A cable tray along both walls: a steel ledge with three cable runs and cable ties. */
function skirting(w) {
  const RU = ROOM_U
  const RV = ROOM_V
  const ties = []
  for (let a = 14; a < RU; a += 26) ties.push([P(a, 3, 7.5), P(a, 3, 12.5)])
  for (let a = 14; a < RV; a += 26) ties.push([P(3, a, 7.5), P(3, a, 12.5)])
  return cat(
    box(0, 0, RU, 3, 7, 13, w.skirting),
    box(0, 0, 3, RV, 7, 13, w.skirting),
    isoLines([[P(0, 3, 8.3), P(RU, 3, 8.3)]], 1.3, PINK, 0.9),
    isoLines([[P(0, 3, 10), P(RU, 3, 10)]], 1.3, NEON, 0.9),
    isoLines([[P(0, 3, 11.7), P(RU, 3, 11.7)]], 1.3, CABLE_DK, 0.9),
    isoLines([[P(3, 0, 8.3), P(3, RV, 8.3)]], 1.3, LIME, 0.9),
    isoLines([[P(3, 0, 10), P(3, RV, 10)]], 1.3, AMBER, 0.9),
    isoLines([[P(3, 0, 11.7), P(3, RV, 11.7)]], 1.3, CABLE_DK, 0.9),
    isoLines(ties, 1.6, ROBOT_INK, 0.7)
  )
}

/* ---------- the window: a neon-trimmed pane on the right wall, drawn in world coords inside WINDOW_GAP ---------- */
const WIN = { v0: 160, v1: 236, hb: 74, ht: 142, gv0: 166, gv1: 230, gb: 80, gt: 136 } // inside WINDOW_GAP v 158-238, h from 56
const winGlassPts = () => [P(0, WIN.gv0, WIN.gb), P(0, WIN.gv1, WIN.gb), P(0, WIN.gv1, WIN.gt), P(0, WIN.gv0, WIN.gt)]

/** The skyline: far and near buildings on the pane, lit windows at night, a billboard glow. */
function skyline(night) {
  const far = [[166, 9, 108], [175, 7, 121], [182, 11, 100], [193, 8, 127], [201, 10, 112], [211, 8, 123], [219, 11, 104], [226, 4, 118]]
  const near = [[166, 13, 94], [179, 9, 90], [188, 13, 110], [201, 9, 92], [210, 12, 102], [222, 8, 96]]
  const base = WIN.gb
  const parts = []
  for (const [v, w, h] of far) parts.push(rectU(0, v, v + w, base, h, night ? '#161f3d' : '#93a4b1', { stroke: null }))
  for (const [v, w, h] of near) parts.push(rectU(0, v, v + w, base, h, night ? '#0b1228' : '#6c7d8b', { stroke: null }))
  const r = rnd(7)
  const palette = [AMBER, NEON, PINK, '#fff3c4']
  for (const [v, w, h] of near) {
    for (let hh = base + 5; hh < h - 4; hh += 7) {
      for (let vv = v + 2.2; vv < v + w - 2; vv += 4) {
        if (r() < (night ? 0.55 : 0.18)) {
          parts.push(rectU(0, vv, vv + 1.7, hh, hh + 2.4, night ? palette[Math.floor(r() * palette.length)] : '#e8f4ff', { stroke: null, op: night ? 0.95 : 0.55 }))
        }
      }
    }
  }
  if (night) {
    parts.push(glowG(PINK, rectU(0, 191, 201, 112, 117, PINK, { stroke: null, op: 0.9 }), 4), glowG(NEON, rectU(0, 212, 218, 104, 107, NEON, { stroke: null, op: 0.9 }), 4))
  } else {
    parts.push(
      bill(
        0,
        214,
        122,
        <>
          <circle r="14" fill="#fff4d0" opacity=".28" />
          <circle r="8" fill="#fff4d0" opacity=".7" />
        </>
      ),
      rectU(0, WIN.gv0, WIN.gv1, base, base + 14, '#c9d3da', { stroke: null, op: 0.45 })
    )
  }
  return cat(...parts)
}

/** Rain on the night pane: slanted streaks, one period tall so the loop is seamless, clipped to the glass (animated). */
function rainOnGlass() {
  const segs = []
  for (let col = 0, v = WIN.gv0 + 2; v < WIN.gv1; col++, v += 6.4) {
    for (let k = -1; k < 7; k++) {
      const h = WIN.gb - 14 + k * 14 + ((col * 5) % 14)
      segs.push([P(0, v, h), P(0, v - 1.1, h - 6)])
    }
  }
  return (
    <>
      {/* fixed id: the backdrop is drawn once per page (never in a thumbnail); switch to useId if that changes */}
      <clipPath id="robot-glass-clip">
        <polygon points={pts(winGlassPts())} />
      </clipPath>
      <g clipPath="url(#robot-glass-clip)">{fxg('rain', isoLines(segs, 0.9, '#9fd6ff', 0.65))}</g>
    </>
  )
}

/** The window: a gunmetal frame with a neon trim ring inside it. */
const windowFrame = () =>
  cat(
    rectU(0, WIN.v0, WIN.v1, WIN.hb, WIN.ht, GUN_DK, { sw: 2 }),
    rectU(0, WIN.v0 + 2.5, WIN.v1 - 2.5, WIN.hb + 2.5, WIN.ht - 2.5, GUN, { sw: 1 }),
    rivetsU(0, [WIN.v0 + 4, WIN.v1 - 4], WIN.hb + 4, STEEL),
    rivetsU(0, [WIN.v0 + 4, WIN.v1 - 4], WIN.ht - 4, STEEL),
    neon([P(0, 164, 78), P(0, 232, 78), P(0, 232, 138), P(0, 164, 138), P(0, 164, 78)], NEON, 1.6, 3.5)
  )

const glass = (night) => poly(winGlassPts(), night ? '#0a1224' : '#c3d0d8', { sw: 1.4 })

/** Day: a hazy city skyline with a sun glare. Night: a dark city with lit windows and a neon billboard, then rain; the mullions go over both. */
const sky = (night) =>
  cat(
    skyline(night),
    night ? rainOnGlass() : null,
    poly([P(0, 170, 80), P(0, 178, 80), P(0, 218, 136), P(0, 210, 136)], '#ffffff', { stroke: null, op: night ? 0.05 : 0.14 }),
    rectU(0, 197, 199, WIN.gb, WIN.gt, GUN_DK, { sw: 0.8 }),
    rectU(0, WIN.gv0, WIN.gv1, 107, 109, GUN_DK, { sw: 0.8 })
  )

/** A metal ledge on two brackets, the live sill's size and place (v 158-238, h 68-74). */
const sill = () =>
  cat(
    box(0, 167, 9, 3, 58, 68, GUN_DK),
    box(0, 227, 9, 3, 58, 68, GUN_DK),
    box(0, 158, 14, 80, 68, 74, STEEL_DK),
    rivetsU(14, [166, 198, 230], 71, STEEL)
  )

/**
 * Walls, wall pattern and fixtures, floor and its pattern, skirting and cable tray, corner lines, then the window and the sill,
 * in the mockup engine's order. `wall` / `floor` are the resolved ROBOT_STYLES entries.
 */
export function robotBackdrop(night, wall, floor) {
  const corner = shade(floor.base, -22)
  return cat(
    <polygon points={pts([P(ROOM_U, 0, WALL_HEIGHT), P(0, 0, WALL_HEIGHT), P(0, 0, 0), P(ROOM_U, 0, 0)])} fill={wall.left} />,
    <polygon points={pts([P(0, 0, WALL_HEIGHT), P(0, ROOM_V, WALL_HEIGHT), P(0, ROOM_V, 0), P(0, 0, 0)])} fill={wall.right} />,
    wallPattern(wall),
    <polygon points={pts([P(0, 0), P(ROOM_U, 0), P(ROOM_U, ROOM_V), P(0, ROOM_V)])} fill={floor.base} />,
    FLOORS[floor.pattern]?.(floor),
    <polygon points={pts([P(ROOM_U, 0, 0), P(0, 0, 0), P(0, 0, SKIRTING_HEIGHT), P(ROOM_U, 0, SKIRTING_HEIGHT)])} fill={wall.skirting} />,
    <polygon points={pts([P(0, 0, 0), P(0, ROOM_V, 0), P(0, ROOM_V, SKIRTING_HEIGHT), P(0, 0, SKIRTING_HEIGHT)])} fill={shade(wall.skirting, -6)} />,
    skirting(wall),
    <polyline points={pts([P(0, 0, 0), P(0, 0, WALL_HEIGHT)])} fill="none" stroke={shade(wall.left, -14)} strokeWidth="2.5" strokeLinecap="round" />,
    <polyline points={pts([P(ROOM_U, 0), P(0, 0), P(0, ROOM_V)])} fill="none" stroke={corner} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />,
    windowFrame(),
    glass(night),
    sky(night),
    sill()
  )
}
