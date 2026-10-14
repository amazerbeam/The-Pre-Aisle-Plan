import { ROOM_INK } from '../../../constants/petRoom'
import { P } from './iso'
import { Bill, Box, Cyl, EllH, IsoLine, RectU, RectV } from './isoShapes'
import { RibbonArt, TrophyArt } from './awardArt'

/**
 * MPP-16 AC 3: every station at levels 1–4, art from pip-room-mockup-v5.html.
 * FURNITURE[station][level - 1]() returns JSX; the bed returns { back, front } so a
 * sleeping Pip (MPP-17) can be drawn between the layers.
 */
const ART_STROKE = { stroke: ROOM_INK, strokeWidth: 2 }
const KNOB_STROKE = { stroke: ROOM_INK, strokeWidth: 1.4 }

export const FURNITURE = {
  fridge: [
    // 1 cool box
    () => (
      <>
        <Box u={146} v={0} du={40} dv={28} h0={0} h1={24} color="#5fb3e8" />
        <Box u={145} v={-1} du={42} dv={30} h0={24} h1={31} color="#ffffff" />
        <Box u={159} v={10} du={14} dv={8} h0={31} h1={34} color="#ffffff" />
      </>
    ),
    // 2 mini fridge
    () => (
      <>
        <Box u={146} v={0} du={40} dv={34} h0={0} h1={58} color="#eef0f6" />
        <RectV vp={34} u0={150} u1={153} h0={24} h1={48} fill="#b9bdc8" />
        <RectV vp={34} u0={168} u1={178} h0={38} h1={46} fill="#ff8fab" />
      </>
    ),
    // 3 full fridge
    () => (
      <>
        <Box u={140} v={0} du={46} dv={38} h0={0} h1={112} color="#f4f6fb" />
        <IsoLine points={[P(140, 38, 76), P(186, 38, 76)]} />
        <RectV vp={38} u0={144} u1={147} h0={82} h1={104} fill="#b9bdc8" />
        <RectV vp={38} u0={144} u1={147} h0={40} h1={68} fill="#b9bdc8" />
        <RectV vp={38} u0={162} u1={174} h0={50} h1={62} fill="#ffd34d" />
      </>
    ),
    // 4 double-door
    () => (
      <>
        <Box u={124} v={0} du={64} dv={40} h0={0} h1={120} color="#d5dde8" />
        <IsoLine points={[P(156, 40, 0), P(156, 40, 120)]} />
        <RectV vp={40} u0={151} u1={154} h0={52} h1={92} fill="#8f9aa6" />
        <RectV vp={40} u0={158} u1={161} h0={52} h1={92} fill="#8f9aa6" />
        <RectV vp={40} u0={166} u1={182} h0={70} h1={94} fill="#5d6d7e" />
        <RectV vp={40} u0={130} u1={142} h0={84} h1={100} fill="#ffffff" />
        <RectV vp={40} u0={132} u1={138} h0={104} h1={110} fill="#ff8fab" />
      </>
    )
  ],
  cooker: [
    // 1 camping stove on a crate
    () => (
      <>
        <Box u={96} v={0} du={44} dv={30} h0={0} h1={26} color="#c9965f" />
        <IsoLine points={[P(96, 30, 13), P(140, 30, 13)]} width={1.4} color="#8a5a2b" />
        <Box u={106} v={6} du={24} dv={18} h0={26} h1={31} color="#777777" />
        <Bill u={118} v={15} h={33}><path d="M-5 0 q5 -12 10 0z" fill="#ff9d3c" /></Bill>
        <Cyl cu={118} cv={15} r={9} h0={33} h1={46} color="#6c7a89" />
      </>
    ),
    // 2 counter + hob
    () => (
      <>
        <Box u={60} v={0} du={80} dv={36} h0={0} h1={50} color="#f3e3c3" />
        <RectV vp={36} u0={64} u1={98} h0={6} h1={44} fill="none" />
        <RectV vp={36} u0={102} u1={136} h0={6} h1={44} fill="none" />
        <Box u={58} v={0} du={84} dv={38} h0={50} h1={55} color="#d8c09a" />
        <EllH cu={118} cv={19} h={55} ru={10} rv={9} fill="#444444" />
        <Cyl cu={80} cv={19} r={11} h0={55} h1={70} color="#e76f51" />
      </>
    ),
    // 3 range cooker with a pot
    () => (
      <>
        <Box u={70} v={0} du={70} dv={38} h0={0} h1={62} color="#f6f7fb" />
        <RectV vp={38} u0={78} u1={132} h0={10} h1={44} fill="#4b5563" />
        {[76, 90, 112, 126].map(u => (
          <Bill key={u} u={u} v={38} h={53}><circle r="2.6" fill="#999" stroke={ROOM_INK} strokeWidth="1" /></Bill>
        ))}
        <EllH cu={122} cv={12} h={62} ru={7} rv={6} fill="#444444" />
        <EllH cu={122} cv={28} h={62} ru={7} rv={6} fill="#444444" />
        <Cyl cu={92} cv={20} r={13} h0={62} h1={80} color="#e76f51" />
      </>
    ),
    // 4 chef's kitchen: hood, range, utensils
    () => (
      <>
        <Box u={84} v={0} du={26} dv={14} h0={136} h1={180} color="#b0bec5" />
        <Box u={70} v={0} du={54} dv={32} h0={124} h1={136} color="#b0bec5" />
        {[76, 84, 112, 118].map((u, i) => (
          <IsoLine key={u} points={[P(u, 1, 118), P(u, 1, 104 - i * 3)]} width={2} />
        ))}
        <IsoLine points={[P(64, 1, 118), P(130, 1, 118)]} width={2} />
        <Box u={50} v={0} du={90} dv={38} h0={0} h1={58} color="#2f3e46" />
        <RectV vp={38} u0={70} u1={120} h0={10} h1={44} fill="rgba(255,183,3,.45)" />
        <Box u={48} v={0} du={94} dv={40} h0={58} h1={63} color="#cfd8dc" />
        <Cyl cu={90} cv={20} r={13} h0={63} h1={82} color="#e76f51" />
        <Box u={124} v={8} du={10} dv={10} h0={63} h1={72} color="#a1887f" />
        <Bill u={129} v={13} h={72}><circle cy="-7" r="8" fill="#7cb342" {...KNOB_STROKE} /></Bill>
      </>
    )
  ],
  cabinet: [
    // 1 planks on bricks
    () => (
      <>
        <Box u={0} v={30} du={22} dv={14} h0={0} h1={18} color="#c0563b" />
        <Box u={0} v={86} du={22} dv={14} h0={0} h1={18} color="#c0563b" />
        <Box u={0} v={26} du={24} dv={78} h0={18} h1={24} color="#c9965f" />
        <Box u={0} v={30} du={22} dv={14} h0={24} h1={42} color="#c0563b" />
        <Box u={0} v={86} du={22} dv={14} h0={24} h1={42} color="#c0563b" />
        <TrophyAt u={12} v={64} h={24} s={0.55} />
        <Box u={0} v={26} du={24} dv={78} h0={42} h1={48} color="#c9965f" />
      </>
    ),
    // 2 wall shelves with brackets
    () => (
      <>
        <Box u={0} v={38} du={14} dv={3} h0={30} h1={40} color="#7a5a3a" />
        <Box u={0} v={92} du={14} dv={3} h0={30} h1={40} color="#7a5a3a" />
        <Box u={0} v={30} du={22} dv={72} h0={40} h1={46} color="#b98a5a" />
        <TrophyAt u={10} v={46} h={46} s={0.55} />
        <RibbonAt u={10} v={80} h={46} s={0.55} />
        <Box u={0} v={38} du={14} dv={3} h0={72} h1={82} color="#7a5a3a" />
        <Box u={0} v={92} du={14} dv={3} h0={72} h1={82} color="#7a5a3a" />
        <Box u={0} v={30} du={22} dv={72} h0={82} h1={88} color="#b98a5a" />
        <TrophyAt u={10} v={64} h={88} s={0.65} />
      </>
    ),
    // 3 wooden cabinet
    () => (
      <>
        <Box u={0} v={30} du={26} dv={66} h0={0} h1={112} color="#9c6b3f" />
        <RectU up={26} v0={36} v1={90} h0={8} h1={104} fill="#f3e2c4" />
        <IsoLine points={[P(26, 36, 40), P(26, 90, 40)]} />
        <IsoLine points={[P(26, 36, 72), P(26, 90, 72)]} />
        <TrophyAt u={27} v={50} h={72} s={0.55} />
        <TrophyAt u={27} v={76} h={72} s={0.55} />
        <RibbonAt u={27} v={50} h={40} s={0.55} />
        <RibbonAt u={27} v={76} h={40} s={0.55} />
        <TrophyAt u={27} v={63} h={8} s={0.6} />
      </>
    ),
    // 4 glass display cabinet with lights
    () => (
      <>
        <Box u={0} v={28} du={28} dv={70} h0={0} h1={128} color="#5b3a22" />
        <Box u={0} v={26} du={30} dv={74} h0={128} h1={134} color="#d4a017" />
        <RectU up={28} v0={34} v1={92} h0={8} h1={120} fill="#fff5d6" />
        <IsoLine points={[P(28, 34, 46), P(28, 92, 46)]} width={2.4} color="#d4a017" />
        <IsoLine points={[P(28, 34, 84), P(28, 92, 84)]} width={2.4} color="#d4a017" />
        <TrophyAt u={29} v={46} h={84} s={0.55} />
        <TrophyAt u={29} v={78} h={84} s={0.62} />
        <RibbonAt u={29} v={46} h={46} s={0.55} />
        <RibbonAt u={29} v={78} h={46} s={0.55} />
        <TrophyAt u={29} v={46} h={8} s={0.55} />
        <TrophyAt u={29} v={78} h={8} s={0.55} />
        <RectU up={28} v0={34} v1={92} h0={8} h1={120} fill="rgba(189,224,254,.28)" />
        <IsoLine points={[P(28, 63, 8), P(28, 63, 120)]} color="#d4a017" />
        <Bill u={28} v={40} h={116}><circle r="2.5" fill="#ffd34d" /></Bill>
        <Bill u={28} v={86} h={116}><circle r="2.5" fill="#ffd34d" /></Bill>
      </>
    )
  ],
  // Headboard against the right wall (u = 0), running along u, at v 120–176.
  bed: [
    // 1 blanket on the floor
    () => ({
      back: (
        <>
          <Box u={10} v={122} du={74} dv={52} h0={0} h1={5} color="#9ec5e8" />
          <Box u={12} v={132} du={16} dv={32} h0={5} h1={11} color="#ffffff" />
        </>
      ),
      front: null
    }),
    // 2 camp cot
    () => ({
      back: (
        <>
          {[[6, 124], [6, 170], [80, 124]].map(([u, v]) => (
            <Box key={`${u}-${v}`} u={u} v={v} du={3} dv={3} h0={0} h1={22} color="#7a6a4f" />
          ))}
          <Box u={4} v={122} du={80} dv={52} h0={22} h1={30} color="#8fb38a" />
          <Box u={8} v={132} du={16} dv={32} h0={30} h1={36} color="#ffffff" />
        </>
      ),
      front: <Box u={80} v={170} du={3} dv={3} h0={0} h1={22} color="#7a6a4f" />
    }),
    // 3 wooden bed
    () => ({
      back: (
        <>
          <Box u={0} v={120} du={6} dv={56} h0={0} h1={64} color="#b98a5a" />
          <Box u={6} v={120} du={80} dv={56} h0={0} h1={18} color="#9c7048" />
          <Box u={8} v={122} du={76} dv={52} h0={18} h1={28} color="#ffffff" />
          <Box u={10} v={132} du={16} dv={32} h0={28} h1={35} color="#ffffff" />
          <Box u={32} v={121} du={54} dv={54} h0={28} h1={32} color="#f2a7bd" />
        </>
      ),
      front: <Box u={86} v={120} du={5} dv={56} h0={0} h1={34} color="#b98a5a" />
    }),
    // 4 canopy bed
    () => ({
      back: (
        <>
          <Box u={0} v={120} du={5} dv={5} h0={0} h1={122} color="#8a5a8c" />
          <Box u={0} v={171} du={5} dv={5} h0={0} h1={122} color="#8a5a8c" />
          <Box u={0} v={124} du={6} dv={48} h0={0} h1={82} color="#a974b0" />
          <Box u={6} v={120} du={80} dv={56} h0={0} h1={18} color="#8a5a8c" />
          <Box u={8} v={122} du={76} dv={52} h0={18} h1={28} color="#ffffff" />
          <Box u={10} v={132} du={16} dv={32} h0={28} h1={36} color="#ffffff" />
          <Box u={32} v={121} du={54} dv={54} h0={28} h1={32} color="#c9a6f7" />
          <Bill u={16} v={160} h={40}>
            <path d="M0 -4 c-4 -6 -12 -1 -6 6 l6 6 l6 -6 c6 -7 -2 -12 -6 -6z" fill="#ff8fab" {...KNOB_STROKE} />
          </Bill>
        </>
      ),
      front: (
        <>
          <Box u={86} v={124} du={5} dv={48} h0={0} h1={36} color="#a974b0" />
          <Box u={86} v={120} du={5} dv={5} h0={0} h1={122} color="#8a5a8c" />
          <Box u={86} v={171} du={5} dv={5} h0={0} h1={122} color="#8a5a8c" />
          <Box u={0} v={118} du={91} dv={60} h0={122} h1={127} color="#e9dcff" />
        </>
      )
    })
  ]
}

// Built once per (station, level) per page load. Returning the same element reference
// lets React skip the subtree on the minute-clock re-render (MPP-16 "render once" risk).
const artCache = new Map()

export function stationArt(station, level) {
  const key = `${station}:${level}`
  if (!artCache.has(key)) artCache.set(key, FURNITURE[station][level - 1]())
  return artCache.get(key)
}

function TrophyAt({ u, v, h, s = 0.6 }) {
  return (
    <Bill u={u} v={v} h={h}>
      <g transform={`translate(${-16 * s},0) scale(${s})`}>
        <TrophyArt />
      </g>
    </Bill>
  )
}

function RibbonAt({ u, v, h, s = 0.6 }) {
  return (
    <Bill u={u} v={v} h={h}>
      <g transform={`translate(${-14 * s},0) scale(${s})`}>
        <RibbonArt />
      </g>
    </Bill>
  )
}
