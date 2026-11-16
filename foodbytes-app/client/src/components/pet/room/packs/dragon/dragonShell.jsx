import { ROOM_SIZE } from '../../../../../constants/petRoom'
import { P, pts, shade } from '../../iso'
import { SKIRTING_HEIGHT } from '../../roomDecor'
import { cat, fmt, glowG, rnd, wallAt, wallLen, xy } from '../packShapes'
import { FLOORS } from './dragonFloors'
import { DRAGON_INK } from './dragonPalette'
import { S } from './dragonParts'

/**
 * MPP-45: the dragon lair's shell, ported from pip-room-dragon.html `DRAGON_ROOM.styles` / `.backdrop` (lines 696-878 and 1144-1219)
 * and the draw order of its `room-engine` backdropSVG. The cave mouth is drawn in world coords inside the window gap, exactly as
 * the mockup engine places it (no WINDOW_SHIFT group). Ids are the live ROOM_STYLES ids; the names live in petRoomLabels.js.
 */
const { poly, isoLine, box, rectV, rectU, cyl, bill, fxg } = S
const { u: ROOM_U, v: ROOM_V, h: WALL_HEIGHT } = ROOM_SIZE

export const DRAGON_STYLES = {
  'wall-white': { left: '#9a9aa4', right: '#aeaeb8', skirting: '#7f7f8a' },
  'wall-lavender': { left: '#7d8aa3', right: '#8f9cb5', skirting: '#667189' },
  'wall-mint': { left: '#7f9a92', right: '#92aca4', skirting: '#647c75', pattern: 'moss' },
  'wall-peach': { left: '#a8827a', right: '#bc9a90', skirting: '#8a655e', pattern: 'cracks' },
  'wall-sky': { left: '#bfa77f', right: '#d1ba92', skirting: '#a38c66' },
  'wall-sprig': { left: '#939f8a', right: '#a6b29c', skirting: '#74806c', pattern: 'ivy' },
  'floor-lilac': { base: '#8b7a68', pattern: 'earth' },
  'floor-oak': { base: '#8e8c93', pattern: 'flags' },
  'floor-terracotta': { base: '#555d6e', pattern: 'slate' },
  'floor-checker': { base: '#3a3c52', checker: '#4d5070', pattern: 'runes' }
}

/* ---------- walls ---------- */

/** Hewn-stone courses on one wall: tinted blocks, then mortar joints (staggered), as a few elements. */
function stoneCourses(plane, w) {
  const at = wallAt(plane)
  const len = wallLen(plane)
  const r = rnd(plane === 'left' ? 11 : 23)
  const ROW = 15
  const ROWS = WALL_HEIGHT / ROW
  const base = plane === 'left' ? w.left : w.right
  const mortar = shade(base, -22)
  const tints = []
  let joints = ''
  for (let row = 0; row < ROWS; row++) {
    const h0 = row * ROW
    const h1 = h0 + ROW
    let a = -(row % 2) * 17
    while (a < len) {
      const bw = 26 + Math.floor(r() * 18)
      const a0 = Math.max(a, 0)
      const a1 = Math.min(a + bw, len)
      const pick = r()
      if (a1 > a0 && pick < 0.66) {
        tints.push(<polygon points={pts([at(a0, h0), at(a1, h0), at(a1, h1), at(a0, h1)])} fill={pick < 0.33 ? '#ffffff' : '#000000'} opacity=".08" />)
      }
      if (a1 < len && a1 > 0) joints += `M${xy(at(a1, h0))}L${xy(at(a1, h1))}`
      a += bw
    }
    if (row > 0) joints += `M${xy(at(0, h0))}L${xy(at(len, h0))}`
  }
  return cat(...tints, <path d={joints} fill="none" stroke={mortar} strokeWidth="1.1" strokeLinecap="round" />)
}

/** Moss clumps hugging the base and the joints (wall pattern 'moss'). */
function mossPatches(plane) {
  const at = wallAt(plane)
  const len = wallLen(plane)
  const r = rnd(plane === 'left' ? 3 : 8)
  const clumps = []
  for (let i = 0; i < 24; i++) {
    const a = 6 + r() * (len - 12)
    const low = r() < 0.6
    const h = low ? 3 + r() * 12 : 30 + r() * 100
    const [x, y] = at(a, h)
    const rx = 5 + r() * 9
    const ry = 2.5 + r() * 4
    clumps.push(
      <ellipse cx={fmt(x)} cy={fmt(y)} rx={fmt(rx)} ry={fmt(ry)} fill="#5d8a43" opacity=".85" />,
      <ellipse cx={fmt(x - rx * 0.25)} cy={fmt(y - ry * 0.35)} rx={fmt(rx * 0.55)} ry={fmt(ry * 0.5)} fill="#86b85e" opacity=".9" />
    )
  }
  return cat(...clumps)
}

/** Hanging ivy: a wavering stem with leaves down each side (wall pattern 'ivy'). */
function ivyVines(plane) {
  const at = wallAt(plane)
  const r = rnd(plane === 'left' ? 41 : 57)
  const stems = plane === 'left' ? [34, 98, 214] : [14, 128, 274]
  const out = []
  for (const a0 of stems) {
    const top = 146 - r() * 8
    const bottom = 44 + r() * 40
    const path = []
    for (let h = top; h >= bottom; h -= 5) path.push(at(a0 + Math.sin(h * 0.19 + a0) * 3.2, h))
    out.push(<polyline points={pts(path)} fill="none" stroke="#3f6b34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />)
    path.forEach(([x, y], i) => {
      if (i % 2) return
      const side = (i / 2) % 2 ? 1 : -1
      out.push(
        <ellipse
          cx={fmt(x + side * 4)}
          cy={fmt(y + 1)}
          rx="4.4"
          ry="2.3"
          transform={`rotate(${side * 32} ${fmt(x + side * 4)} ${fmt(y + 1)})`}
          fill={i % 4 ? '#5a9a45' : '#79b857'}
          stroke="#2f5a2a"
          strokeWidth=".7"
        />
      )
    })
  }
  return cat(...out)
}

/** Glowing cracks (wall pattern 'cracks'): ember-lit fissures, glow removed under Low FX. */
function emberCracks(plane) {
  const at = wallAt(plane)
  const len = wallLen(plane)
  const r = rnd(plane === 'left' ? 71 : 83)
  const cracks = []
  for (let k = 0; k < 5; k++) {
    let a = 20 + r() * (len - 40)
    let h = 30 + r() * 90
    const path = [at(a, h)]
    for (let i = 0; i < 6; i++) {
      a += (r() - 0.45) * 12
      h -= 6 + r() * 8
      path.push(at(a, h))
    }
    cracks.push(<polyline points={pts(path)} fill="none" stroke="#ff8a3c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />)
  }
  return glowG('#ff6a1a', cat(...cracks), 3)
}

/** A wall torch: iron plate, arm and cup, a wrapped head and a flickering flame (animated, glowing). */
function wallTorch(plane, a, h, delay = 0) {
  const iron = '#4a4a54'
  const out = (du, dv) => (plane === 'left' ? [a + du, dv] : [dv, a + du]) // (along-offset, outward-offset) -> [u, v]
  const [cu, cv] = out(0, 9)
  const plate = plane === 'left' ? rectV(0, a - 4, a + 4, h, h + 12, iron) : rectU(0, a - 4, a + 4, h, h + 12, iron)
  const arm = plane === 'left' ? box(a - 2, 0, 4, 9, h + 2, h + 6, iron) : box(0, a - 2, 9, 4, h + 2, h + 6, iron)
  const cup = cyl(cu, cv, 4.6, h + 6, h + 13, iron)
  const flame = (
    <>
      <path d="M0 2 C-8 -2 -8 -13 -1 -22 C0 -14 6 -11 5 -3 C4 1 2 2 0 2Z" fill="#ff8a2a" stroke={DRAGON_INK} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M0 1 C-4 -2 -4 -8 0 -13 C1 -8 4 -6 3 -2 C2 0 1 1 0 1Z" fill="#ffe27a" />
    </>
  )
  const wrap = <ellipse cx="0" cy="3" rx="4.2" ry="2.4" fill="#6b4a2a" stroke={DRAGON_INK} strokeWidth="1.2" />
  return cat(
    plate,
    arm,
    cup,
    bill(
      cu,
      cv,
      h + 13,
      <>
        {wrap}
        {glowG('#ff9a3a', fxg('flicker', flame, delay), 5)}
      </>
    )
  )
}

/** A hanging banner on the right wall: a rod, a swallow-tail cloth with a gold flame crest, swaying from the rod. */
function wallBanner(v0, v1, hTop, hBottom) {
  const mid = (v0 + v1) / 2
  const cloth = poly([P(0, v0 + 2, hTop), P(0, v1 - 2, hTop), P(0, v1 - 2, hBottom), P(0, mid, hBottom + 12), P(0, v0 + 2, hBottom)], '#8e2f3a')
  const trim = isoLine([P(0, v0 + 2, hTop - 4), P(0, v1 - 2, hTop - 4)], 2, '#e8b838')
  const [cx, cy] = P(0, mid, (hTop + hBottom) / 2 + 4)
  const crest = (
    <g transform={`translate(${fmt(cx)} ${fmt(cy)})`}>
      <circle r="9" fill="#e8b838" stroke={DRAGON_INK} strokeWidth="1.4" />
      <path d="M0 6 C-6 3 -5 -4 0 -8 C1 -3 5 -2 4 3 C3 5 1 6 0 6Z" fill="#8e2f3a" stroke={DRAGON_INK} strokeWidth="1" />
    </g>
  )
  const rod = box(0, v0 - 3, 4, v1 - v0 + 6, hTop, hTop + 3, '#4a4a54')
  return cat(rod, fxg('sway', cat(cloth, trim, crest)))
}

/** The shell's wall fixtures: two torches and a banner, drawn over the courses and any pattern. */
const shellFixtures = () => cat(wallTorch('left', 254, 100, 0), wallTorch('right', 290, 50, 0.9), wallBanner(6, 46, 132, 76))

function wallPattern(w) {
  return cat(
    stoneCourses('left', w),
    stoneCourses('right', w),
    w.pattern === 'moss' && cat(mossPatches('left'), mossPatches('right')),
    w.pattern === 'ivy' && cat(ivyVines('left'), ivyVines('right')),
    w.pattern === 'cracks' && cat(emberCracks('left'), emberCracks('right')),
    shellFixtures()
  )
}

/** A rubble line along both walls: small irregular stones on the skirting. */
function rubble(w) {
  const stones = []
  const r = rnd(31)
  for (const plane of ['left', 'right']) {
    const len = wallLen(plane)
    for (let a = 4; a < len - 2; a += 7 + r() * 5) {
      const [x, y] = plane === 'left' ? P(a, 3, 0) : P(3, a, 0)
      const sz = 2.2 + r() * 2.6
      const stone = [[x - sz * 1.3, y + 0.6], [x - sz * 0.8, y - sz * 1.1], [x + sz * 0.3, y - sz * 1.5], [x + sz * 1.4, y - sz * 0.5], [x + sz * 1.1, y + 0.9]]
      stones.push(poly(stone, shade(w.skirting, r() < 0.5 ? 12 : -14), { sw: 0.9 }))
    }
  }
  return cat(...stones)
}

/* ---------- the window: a cave mouth on the right wall, drawn in world coords inside the window gap ---------- */
const CAVE = { vc: 198, rxIn: 35, ryIn: 30, rxOut: 40, ryOut: 37, hBottom: 74, hRimBottom: 64, hSpring: 108 } // inside the window gap v 158-238, h from 56
function caveArch(rx, ry, hb) {
  const out = [[CAVE.vc - rx, hb], [CAVE.vc - rx, CAVE.hSpring]]
  for (let i = 1; i < 18; i++) {
    const t = Math.PI - (Math.PI * i) / 18
    out.push([CAVE.vc + rx * Math.cos(t), CAVE.hSpring + ry * Math.sin(t)])
  }
  out.push([CAVE.vc + rx, CAVE.hSpring], [CAVE.vc + rx, hb])
  return out.map(([v, h]) => P(0, v, h))
}
const caveRimQuad = (t0, t1) => [
  P(0, CAVE.vc + CAVE.rxIn * Math.cos(t0), CAVE.hSpring + CAVE.ryIn * Math.sin(t0)),
  P(0, CAVE.vc + CAVE.rxOut * Math.cos(t0), CAVE.hSpring + CAVE.ryOut * Math.sin(t0)),
  P(0, CAVE.vc + CAVE.rxOut * Math.cos(t1), CAVE.hSpring + CAVE.ryOut * Math.sin(t1)),
  P(0, CAVE.vc + CAVE.rxIn * Math.cos(t1), CAVE.hSpring + CAVE.ryIn * Math.sin(t1))
]
const cavePt = (v, h) => P(0, v, h)

/** The cave mouth: a rock rim with voussoir stones round the arch, jamb stones below the springline. */
function windowFrame() {
  const out = [poly(caveArch(CAVE.rxOut, CAVE.ryOut, CAVE.hRimBottom), '#9b98a6', { sw: 2 })]
  for (let k = 0; k < 9; k++) out.push(poly(caveRimQuad(Math.PI - (Math.PI * k) / 9, Math.PI - (Math.PI * (k + 1)) / 9), k % 2 ? '#aeabb9' : '#8d8a9a', { sw: 1.2 }))
  const step = (CAVE.hSpring - CAVE.hRimBottom) / 3
  for (let i = 0; i < 3; i++) {
    const h0 = CAVE.hRimBottom + i * step
    const h1 = h0 + step
    const tone = i % 2 ? '#aeabb9' : '#8d8a9a'
    out.push(poly([cavePt(CAVE.vc - CAVE.rxOut, h0), cavePt(CAVE.vc - CAVE.rxIn, h0), cavePt(CAVE.vc - CAVE.rxIn, h1), cavePt(CAVE.vc - CAVE.rxOut, h1)], tone, { sw: 1.2 }))
    out.push(poly([cavePt(CAVE.vc + CAVE.rxIn, h0), cavePt(CAVE.vc + CAVE.rxOut, h0), cavePt(CAVE.vc + CAVE.rxOut, h1), cavePt(CAVE.vc + CAVE.rxIn, h1)], tone, { sw: 1.2 }))
  }
  return cat(...out)
}

const glass = (night) => poly(caveArch(CAVE.rxIn, CAVE.ryIn, CAVE.hBottom), night ? '#232a5e' : '#cfe8ff', { sw: 2 })

const STARS = [[176, 121, 0], [190, 131, 0.9], [200, 126, 1.7], [222, 128, 0.4], [181, 110, 2.1], [228, 112, 1.3]]
const STALACTITES = [[184, 6.5], [196, 9], [209, 7], [221, 5]]

/** Day: pale sky, sun, a cloud, two mountain ridges. Night: moon, stars (glinting), dark ridges. All inside the arch. */
function sky(night) {
  const far = [[163, 74], [163, 88], [173, 97], [181, 90], [192, 102], [203, 92], [213, 99], [224, 88], [233, 94], [233, 74]]
  const near = [[163, 74], [163, 80], [176, 86], [189, 81], [201, 88], [216, 82], [233, 87], [233, 74]]
  const out = [poly(far.map(([v, h]) => cavePt(v, h)), night ? '#141a3d' : '#b3bfd8', { stroke: null }), poly(near.map(([v, h]) => cavePt(v, h)), night ? '#0c1030' : '#8fa0c0', { stroke: null })]
  if (night) {
    out.push(bill(0, 212, 122, <path d="M0 -8 a8 8 0 1 0 6 13 a6 6 0 1 1 -6 -13z" fill="#fff6c2" />))
    for (const [v, h, d] of STARS) {
      out.push(bill(0, v, h, fxg('glint', <path d="M0 -2.6 L.8 -.8 L2.6 0 L.8 .8 L0 2.6 L-.8 .8 L-2.6 0 L-.8 -.8Z" fill="#ffffff" />, d)))
    }
  } else {
    out.push(bill(0, 214, 121, <circle r="7" fill="#fff6c2" stroke="#f2cf6a" strokeWidth="1.2" />))
    out.push(
      bill(
        0,
        183,
        119,
        <>
          <ellipse rx="9" ry="3" fill="#ffffff" opacity=".9" />
          <ellipse cx="5" cy="-1.6" rx="5" ry="2.4" fill="#ffffff" opacity=".9" />
        </>
      )
    )
  }
  // stalactites hanging from the arch, so it reads as a cave mouth
  const topH = (v) => CAVE.hSpring + CAVE.ryIn * Math.sqrt(1 - ((v - CAVE.vc) / CAVE.rxIn) ** 2)
  for (const [v, len] of STALACTITES) {
    out.push(poly([cavePt(v - 2.4, topH(v - 2.4) + 0.4), cavePt(v, topH(v) - len), cavePt(v + 2.4, topH(v + 2.4) + 0.4)], night ? '#1a1a30' : '#7e7a8a', { sw: 1 }))
  }
  out.push(<polyline points={pts(caveArch(CAVE.rxIn - 2.5, CAVE.ryIn - 2.5, CAVE.hBottom))} fill="none" stroke="rgba(0,0,0,.2)" strokeWidth="4" strokeLinejoin="round" />)
  return cat(...out)
}

/** A stone ledge on two corbels, the live sill's size and place (v 158-238, h 68-74). */
const sill = () => cat(box(0, 167, 9, 3, 58, 68, '#8d8a98'), box(0, 227, 9, 3, 58, 68, '#8d8a98'), box(0, 158, 14, 80, 68, 74, '#aeabb9'))

/**
 * Walls, wall pattern and fixtures, floor and its pattern, skirting and rubble, corner lines, then the cave mouth and the sill,
 * in the mockup engine's order. `wall` / `floor` are the resolved DRAGON_STYLES entries.
 */
export function dragonBackdrop(night, wall, floor) {
  const corner = shade(floor.base, -22)
  return cat(
    <polygon points={pts([P(ROOM_U, 0, WALL_HEIGHT), P(0, 0, WALL_HEIGHT), P(0, 0, 0), P(ROOM_U, 0, 0)])} fill={wall.left} />,
    <polygon points={pts([P(0, 0, WALL_HEIGHT), P(0, ROOM_V, WALL_HEIGHT), P(0, ROOM_V, 0), P(0, 0, 0)])} fill={wall.right} />,
    wallPattern(wall),
    <polygon points={pts([P(0, 0), P(ROOM_U, 0), P(ROOM_U, ROOM_V), P(0, ROOM_V)])} fill={floor.base} />,
    FLOORS[floor.pattern]?.(floor),
    <polygon points={pts([P(ROOM_U, 0, 0), P(0, 0, 0), P(0, 0, SKIRTING_HEIGHT), P(ROOM_U, 0, SKIRTING_HEIGHT)])} fill={wall.skirting} />,
    <polygon points={pts([P(0, 0, 0), P(0, ROOM_V, 0), P(0, ROOM_V, SKIRTING_HEIGHT), P(0, 0, SKIRTING_HEIGHT)])} fill={shade(wall.skirting, -6)} />,
    rubble(wall),
    <polyline points={pts([P(0, 0, 0), P(0, 0, WALL_HEIGHT)])} fill="none" stroke={shade(wall.left, -14)} strokeWidth="2.5" strokeLinecap="round" />,
    <polyline points={pts([P(ROOM_U, 0), P(0, 0), P(0, ROOM_V)])} fill="none" stroke={corner} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />,
    windowFrame(),
    glass(night),
    sky(night),
    sill()
  )
}
