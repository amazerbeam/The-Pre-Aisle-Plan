import { ROOM_INK } from '../../../constants/petRoom'
import { P } from './iso'
import { Bill, Box, Cyl, EllH, IsoLine, Poly, RectV } from './isoShapes'

/**
 * MPP-27 AC 4: the 12 decor items as iso art in room coordinates (mpp-27-decor-catalogue-mockup.html
 * DECOR[].art), each inside its spot's volume (constants/petDecor.js DECOR_SPOT_SHAPES). Each id is
 * built once and cached, so the room's minute re-render diffs the same elements. An unknown id
 * draws nothing. The same JSX is cropped as a thumbnail by DecorThumb.
 */
const FAIRY_BULBS = ['#ffd34d', '#ff8fab', '#7cc35a', '#4dabf7', '#ffd34d']
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

const BUILDERS = {
  'basil-print': () => (
    <>
      <RectV vp={0} u0={154} u1={182} h0={136} h1={166} fill="#c9965f" />
      <RectV vp={0} u0={157} u1={179} h0={139} h1={163} fill="#fffaf0" />
      <Bill u={168} v={0} h={151}><g transform="scale(1.3)"><Leaf /></g></Bill>
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
  'watering-can': () => (
    <>
      <Box u={162} v={124} du={14} dv={10} h0={0} h1={12} color="#4dabf7" />
      <IsoLine points={[P(176, 129, 8), P(184, 129, 16)]} width={2.4} />
      <IsoLine points={[P(165, 129, 12), P(165, 129, 18), P(173, 129, 18), P(173, 129, 12)]} width={1.8} />
    </>
  ),
  'cookbook-stack': () => (
    <>
      <Box u={160} v={122} du={18} dv={14} h0={0} h1={5} color="#e63946" />
      <Box u={161} v={123} du={16} dv={12} h0={5} h1={10} color="#4dabf7" />
      <Box u={160} v={122} du={18} dv={14} h0={10} h1={15} color="#7cb342" />
      <Box u={162} v={124} du={14} dv={10} h0={15} h1={19} color="#ffd34d" />
    </>
  ),
  'bean-bag': () => (
    <>
      <EllH cu={168} cv={130} h={0} ru={16} rv={14} fill="#e8875a" />
      <Bill u={168} v={130} h={0}>
        <path d="M-20 -2 q-2 -22 20 -24 q22 2 20 24 q-20 8 -40 0z" fill="#f4a259" stroke={ROOM_INK} strokeWidth="1.6" />
        <path d="M-8 -14 q8 -6 16 0" stroke="#e8875a" strokeWidth="2" fill="none" />
      </Bill>
    </>
  ),
  'lemon-tree': () => (
    <>
      <Cyl cu={168} cv={130} r={9} h0={0} h1={14} color="#c0563b" />
      <IsoLine points={[P(168, 130, 14), P(168, 130, 34)]} width={2.6} color="#7a5a3a" />
      <Bill u={168} v={130} h={46}>
        <circle r="15" fill="#5fa84a" stroke={ROOM_INK} strokeWidth="1.6" />
        <circle cx="-6" cy="-3" r="3" fill="#ffd34d" stroke={ROOM_INK} strokeWidth="0.8" />
        <circle cx="5" cy="4" r="3" fill="#ffd34d" stroke={ROOM_INK} strokeWidth="0.8" />
        <circle cx="4" cy="-8" r="2.6" fill="#ffd34d" stroke={ROOM_INK} strokeWidth="0.8" />
      </Bill>
    </>
  )
}

const cache = new Map()

/** The cached art for a decor id, or null for no id / an unknown id. */
export function decorArt(id) {
  if (!id || !BUILDERS[id]) return null
  if (!cache.has(id)) cache.set(id, BUILDERS[id]())
  return cache.get(id)
}
