import { ROOM_INK } from '../../../constants/petRoom'
import { P, ellipsePoints, pts, rectUPoints, rectVPoints, shade } from './iso'
import { Bill, Box, Cyl, IsoLine, Poly, RectV } from './isoShapes'

/**
 * MPP-27 / MPP-40: the wall-spot decor items (over the wardrobe, bedside wall, front right wall) as iso art in
 * world coords, from the signed-off pip-room-decor-spots mockup. The MPP-27 four-plus-eight keep their original
 * coords (decorArt.jsx slides them to their spot). This module also owns the small art helpers the other decor
 * modules and furniture.jsx share (the mockup's shp / ellU / ellV / dotU / dotV / slabU / starU / cylT / band / cshine).
 */
export const FAIRY_BULBS = ['#ffd34d', '#ff8fab', '#7cc35a', '#4dabf7', '#ffd34d']
export const WHITE_HI = 'rgba(255,255,255,.7)'
export const K = { stroke: ROOM_INK, strokeWidth: 1.2 }
const BUNTING_FLAGS = ['#e63946', '#ffd34d', '#4dabf7', '#7cc35a', '#ff8fab']

/** Two crossed leaves (the herb shelf, the basil print, the sprig wallpaper). */
export function Leaf({ fill = '#7cc35a' }) {
  return (
    <>
      <ellipse cx="-4" cy="0" rx="6" ry="3.4" transform="rotate(-30 -4 0)" fill={fill} stroke={ROOM_INK} strokeWidth="1.2" />
      <ellipse cx="4" cy="-2" rx="6" ry="3.4" transform="rotate(30 4 -2)" fill={fill} stroke={ROOM_INK} strokeWidth="1.2" />
    </>
  )
}

/** A leaf pair scaled about the billboard origin. */
export function ScaledLeaf({ fill, s }) {
  return <g transform={`scale(${s})`}><Leaf fill={fill} /></g>
}

/** Rounded polygon with a chosen outline (the mockup's shp). */
export function Shp({ points, fill, stroke = ROOM_INK, w = 1.4 }) {
  return <polygon points={pts(points)} fill={fill} stroke={stroke} strokeWidth={w} strokeLinejoin="round" />
}

/** Unoutlined polygon (the mockup's flat). */
export function Flat({ points, fill }) {
  return <polygon points={pts(points)} fill={fill} />
}

// An ellipse standing on the plane u = up (right wall) or v = vp (left wall), rotated by rot in the wall plane.
const ringU = (up, vc, hc, rv, rh, rot = 0, n = 16) => Array.from({ length: n }, (_, i) => {
  const t = (i / n) * Math.PI * 2
  const x = rv * Math.cos(t)
  const y = rh * Math.sin(t)
  return P(up, vc + x * Math.cos(rot) - y * Math.sin(rot), hc + x * Math.sin(rot) + y * Math.cos(rot))
})
const ringV = (vp, uc, hc, ru, rh, rot = 0, n = 16) => Array.from({ length: n }, (_, i) => {
  const t = (i / n) * Math.PI * 2
  const x = ru * Math.cos(t)
  const y = rh * Math.sin(t)
  return P(uc + x * Math.cos(rot) - y * Math.sin(rot), vp, hc + x * Math.sin(rot) + y * Math.cos(rot))
})

export const EllU = ({ up, vc, hc, rv, rh, fill, rot = 0, w = 1.2 }) => <Shp points={ringU(up, vc, hc, rv, rh, rot)} fill={fill} w={w} />
export const EllV = ({ vp, uc, hc, ru, rh, fill, rot = 0, w = 1.2 }) => <Shp points={ringV(vp, uc, hc, ru, rh, rot)} fill={fill} w={w} />
export const DotU = ({ up, vc, hc, r, fill }) => <Flat points={ringU(up, vc, hc, r, r, 0, 10)} fill={fill} />
export const DotV = ({ vp, uc, hc, r, fill }) => <Flat points={ringV(vp, uc, hc, r, r, 0, 10)} fill={fill} />

/** A flat cut-out on a right-wall plane with a visible thickness: back copy darker, front copy on top. */
export function SlabU({ up, th, vh, fill }) {
  return (
    <>
      <Shp points={vh.map(([v, h]) => P(up, v, h))} fill={shade(fill, -22)} />
      <Shp points={vh.map(([v, h]) => P(up + th, v, h))} fill={fill} />
    </>
  )
}

export function StarU({ up, vc, hc, R, fill }) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const t = -Math.PI / 2 + (i / 10) * Math.PI * 2
    const r = i % 2 ? R * 0.45 : R
    return P(up, vc + r * Math.cos(t), hc - r * Math.sin(t))
  })
  return <Shp points={points} fill={fill} w={1.2} />
}

const arc = i => -Math.PI / 4 + (i / 12) * Math.PI
const arcPoints = (cu, cv, r, h) => Array.from({ length: 13 }, (_, i) => P(cu + r * Math.cos(arc(i)), cv + r * Math.sin(arc(i)), h))

/** Tapered cylinder (pots, shades, bulging cushions): radius r0 at h0, r1 at h1. */
export function CylT({ cu, cv, r0, r1, h0, h1, color }) {
  const side = [...arcPoints(cu, cv, r0, h0), ...arcPoints(cu, cv, r1, h1).reverse()]
  return (
    <>
      <Poly points={side} fill={shade(color, -12)} />
      <Poly points={ellipsePoints(cu, cv, h1, r1, r1)} fill={shade(color, 12)} />
    </>
  )
}

/** The soil (or contents) disc on top of a pot or basket. */
export const Soil = ({ cu, cv, h, r, fill = '#5a3e2a' }) => <Shp points={ellipsePoints(cu, cv, h + 0.1, r, r)} fill={fill} w={1} />

/** A thin ring line around a cylinder at height h. */
export const Band = ({ cu, cv, r, h, color = ROOM_INK, w = 1 }) => <IsoLine points={arcPoints(cu, cv, r, h)} width={w} color={color} />

/** A vertical highlight on the lit side of a cylinder. */
export const Shine = ({ cu, cv, r, h0, h1 }) => (
  <IsoLine points={[P(cu - r * 0.2, cv + r * 0.97, h0 + 1), P(cu - r * 0.2, cv + r * 0.97, h1 - 1)]} width={1} color={WHITE_HI} />
)

function FairyLights() {
  const points = [150, 156, 162, 168, 174, 180, 186].map((u, i) => P(u, 0, 166 - Math.sin((i / 6) * Math.PI) * 10))
  return (
    <>
      <IsoLine points={points} width={1.2} />
      {points.slice(1, -1).map(([x, y], i) => (
        <circle key={i} cx={x.toFixed(1)} cy={(y + 3).toFixed(1)} r="2.6" fill={FAIRY_BULBS[i]} stroke={ROOM_INK} strokeWidth="0.8" />
      ))}
    </>
  )
}

// The three coats on the hooks: a red mac, a yellow hat and a blue bag.
function CoatHookItems() {
  return (
    <>
      <SlabU up={2} th={0.9} vh={[[256.6, 124], [263.4, 124], [264.4, 101], [255.6, 101]]} fill="#e63946" />
      <IsoLine points={[P(2.95, 256.2, 112), P(2.95, 263.8, 112)]} width={1.2} color="#ffffff" />
      <IsoLine points={[P(2.95, 256, 108), P(2.95, 264, 108)]} width={1.2} color="#ffffff" />
      <EllU up={2.95} vc={273} hc={120} rv={4.6} rh={3.2} fill="#ffd34d" />
      <DotU up={2.95} vc={273} hc={123.2} r={1} fill="#e0b52f" />
      <SlabU up={2} th={0.9} vh={[[281, 115], [291, 115], [292, 100], [280, 100]]} fill="#4dabf7" />
      <IsoLine points={[P(2.95, 281, 112), P(2.95, 291, 112)]} width={1.2} color={shade('#4dabf7', -25)} />
      <IsoLine points={[P(2.95, 283, 115), P(2.95, 285, 124), P(2.95, 287, 124), P(2.95, 289, 115)]} width={1.4} />
    </>
  )
}

export const WALL_BUILDERS = {
  // Over the wardrobe
  'basil-print': () => (
    <>
      <RectV vp={0} u0={154} u1={182} h0={136} h1={166} fill="#c9965f" />
      <RectV vp={0} u0={157} u1={179} h0={139} h1={163} fill="#fffaf0" />
      <Bill u={168} v={0} h={151}><ScaledLeaf s={1.3} /></Bill>
    </>
  ),
  'recipe-board': () => (
    <>
      <RectV vp={0} u0={152} u1={184} h0={134} h1={168} fill="#8a5a2b" />
      <RectV vp={0} u0={155} u1={181} h0={137} h1={165} fill="#2f3e46" />
      {[158, 152, 146].map((h, i) => (
        <IsoLine key={h} points={[P(158, 0, h), P(178 - i * 4, 0, h)]} width={1.4} color="#ffffff" />
      ))}
    </>
  ),
  'herb-shelf': () => (
    <>
      <Box u={150} v={0} du={36} dv={8} h0={136} h1={140} color="#b98a5a" />
      {[156, 168, 180].map(u => (
        <g key={u}>
          <Cyl cu={u} cv={4} r={4} h0={140} h1={147} color="#c0563b" />
          <Bill u={u} v={4} h={150}><Leaf /></Bill>
        </g>
      ))}
    </>
  ),
  'fairy-lights': () => <FairyLights />,
  'pip-portrait': () => (
    <>
      <Box u={24} v={0} du={28} dv={2.4} h0={106} h1={138} color="#d4a017" />
      <Shp points={rectVPoints(2.55, 27, 49, 109, 135)} fill="#e8f5e0" w={1.2} />
      <EllV vp={2.7} uc={38} hc={121} ru={5.2} rh={6.8} fill="#b08a5a" />
      <DotV vp={2.8} uc={36} hc={123} r={0.9} fill={ROOM_INK} />
      <DotV vp={2.8} uc={40} hc={123} r={0.9} fill={ROOM_INK} />
      <IsoLine points={[P(36.8, 2.8, 118.8), P(38, 2.8, 118), P(39.2, 2.8, 118.8)]} width={1.1} />
      <DotV vp={2.8} uc={36.2} hc={126} r={1.5} fill="rgba(255,255,255,.45)" />
      <IsoLine points={[P(38, 2.8, 127.5), P(38.4, 2.8, 132.5)]} width={1.4} color="#5fa84a" />
      <EllV vp={2.8} uc={40.4} hc={133} ru={2.8} rh={1.5} fill="#7cc35a" rot={0.5} />
      <IsoLine points={[P(25.5, 2.45, 136.4), P(50.5, 2.45, 136.4)]} width={1} color={WHITE_HI} />
    </>
  ),

  // Bedside wall (tall and narrow)
  'growth-chart': () => (
    <>
      <Box u={0} v={137} du={1.8} dv={12} h0={62} h1={122} color="#ffe7a3" />
      <Flat points={rectUPoints(1.95, 138, 148, 114, 119)} fill="#e76f51" />
      {[70, 80, 90, 100, 110].map((h, i) => (
        <IsoLine key={h} points={[P(1.95, 138.4, h), P(1.95, i % 2 ? 141 : 143.2, h)]} width={1.2} />
      ))}
      <EllU up={1.95} vc={146} hc={84} rv={2} rh={2} fill="#7cc35a" />
      <EllU up={1.95} vc={146} hc={102} rv={2} rh={2} fill="#ff8fab" />
      <IsoLine points={[P(1.95, 143, 122), P(1.95, 143, 126.5)]} width={1.4} color="#5fa84a" />
      <EllU up={1.95} vc={141} hc={127} rv={3} rh={1.7} fill="#7cc35a" rot={0.5} />
      <EllU up={1.95} vc={146} hc={127} rv={3} rh={1.7} fill="#5fa84a" rot={-0.5} />
      <IsoLine points={[P(1.95, 137.6, 121), P(1.95, 137.6, 63)]} width={1} color={WHITE_HI} />
    </>
  ),
  'meal-calendar': () => (
    <>
      <Box u={0} v={136} du={1.8} dv={16} h0={76} h1={114} color="#ffffff" />
      <Flat points={rectUPoints(1.95, 136, 152, 106, 114)} fill="#e76f51" />
      {[140, 148].map(v => <EllU key={v} up={1.95} vc={v} hc={114} rv={1.1} rh={1.1} fill="#cfd8dc" />)}
      {[0, 1, 2].map(r => [0, 1, 2].map(c => (
        <Flat key={`${r}-${c}`} points={rectUPoints(1.95, 138.5 + c * 4.6, 141.7 + c * 4.6, 84 + r * 7, 88.2 + r * 7)} fill={(r + c) % 3 ? '#d6c9f0' : '#7cc35a'} />
      )))}
      <EllU up={1.95} vc={144} hc={110} rv={1.5} rh={1.5} fill="#e63946" />
      <IsoLine points={[P(1.95, 136.6, 105), P(1.95, 151.4, 105)]} width={1} color={WHITE_HI} />
    </>
  ),
  'wall-sconce': () => (
    <>
      <Box u={0} v={141} du={1.6} dv={6} h0={84} h1={98} color="#8a5a2b" />
      <IsoLine points={[P(1.6, 144, 90), P(3.6, 144, 90), P(3.6, 144, 94)]} width={1.8} />
      <CylT cu={3.4} cv={144} r0={2.4} r1={1.5} h0={94} h1={102} color="#ffd34d" />
      <IsoLine points={[P(2.3, 144.9, 95), P(2.6, 144.9, 101)]} width={1} color={WHITE_HI} />
    </>
  ),
  'photo-strip': () => (
    <>
      {[[64, '#bde0fe'], [82, '#ffd6a5'], [100, '#caffbf']].map(([h, c]) => (
        <g key={h}>
          <Box u={0} v={137} du={1.6} dv={14} h0={h} h1={h + 14} color="#ffffff" />
          <Flat points={rectUPoints(1.75, 139, 149, h + 2, h + 12)} fill={c} />
          <EllU up={1.8} vc={144} hc={h + 7.5} rv={2.4} rh={2.4} fill={shade(c, -24)} />
          <IsoLine points={[P(1.8, 137.6, h + 13), P(1.8, 150.4, h + 13)]} width={1} color={WHITE_HI} />
        </g>
      ))}
    </>
  ),

  // Front right wall
  'wall-clock': () => (
    <Bill u={0} v={57} h={158}>
      <circle r="13" fill="#fff" stroke={ROOM_INK} strokeWidth="2.4" />
      <circle r="10" fill="#fffaf0" stroke="#d4a017" strokeWidth="1.4" />
      <path d="M0 0 V-7 M0 0 H5" stroke={ROOM_INK} strokeWidth="1.8" strokeLinecap="round" />
    </Bill>
  ),
  bunting: () => (
    <>
      <IsoLine points={[P(0, 34, 172), P(0, 80, 172)]} width={1.2} />
      {BUNTING_FLAGS.map((fill, i) => {
        const v = 36 + i * 9
        return <Poly key={i} points={[P(0, v, 171), P(0, v + 8, 171), P(0, v + 4, 160)]} fill={fill} />
      })}
    </>
  ),
  'pan-rail': () => (
    <>
      <IsoLine points={[P(0, 36, 170), P(0, 78, 170)]} width={2.4} color="#8a5a2b" />
      {[44, 57, 70].map((v, i) => (
        <Bill key={v} u={0} v={v} h={170}>
          <path d="M0 0 V6" stroke={ROOM_INK} strokeWidth="1.2" />
          <circle cy={12 + i} r={6 + i} fill="#d98b4a" stroke={ROOM_INK} strokeWidth="1.4" />
        </Bill>
      ))}
    </>
  ),
  mirror: () => (
    <Bill u={0} v={57} h={158}>
      <ellipse rx="15" ry="17" fill="#d4a017" stroke={ROOM_INK} strokeWidth="2" />
      <ellipse rx="11" ry="13" fill="#d7f0ff" />
      <path d="M-5 -6 l6 -4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </Bill>
  ),
  'coat-hooks': () => (
    <>
      <Box u={0} v={252} du={2} dv={42} h0={121} h1={128} color="#b98a5a" />
      <IsoLine points={[P(2.1, 253, 127), P(2.1, 293, 127)]} width={1} color={WHITE_HI} />
      {[260, 273, 286].map(v => <Box key={v} u={2} v={v - 0.8} du={2} dv={1.6} h0={124} h1={126.5} color="#7a5a3a" />)}
      <CoatHookItems />
    </>
  )
}
