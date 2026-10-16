import { ROOM_INK } from '../../../constants/petRoom'
import { P, shade } from './iso'
import { Bill, Box, IsoLine } from './isoShapes'
import { Band, CylT, EllU, FAIRY_BULBS, K, ScaledLeaf, Shine, SlabU, Soil, WHITE_HI } from './decorArtWalls'

/**
 * MPP-40: the window-dressing and windowsill decor items in world coords (right wall u = 0). The window frame
 * runs v 164–232 and the sill v 158–238, both centred on v 198; the sill top is h 74, u 0–14 (roomDecor.jsx).
 * Sill items stand on it; MPP-44: curtains mirror about v 198 and stop at the sill top.
 */
const WINDOW_MIRROR = 396 // twice the window/sill centre line, v 198
const SILL_TOP_H = 74
const CURTAIN_ROD = { v: 155, dv: 86 }
const CURTAIN_END_CAPS = [154, 240.5]
const GINGHAM_PANELS = [[158, 173], [223, 238]]
const LINEN_LEFT = [[158, 141], [176, 141], [171, 104], [169, 100], [171, 96], [178, SILL_TOP_H], [158, SILL_TOP_H]]
const LINEN_RIGHT = LINEN_LEFT.map(([v, h]) => [WINDOW_MIRROR - v, h])
const LINEN_FOLDS = [161.5, 165.5].flatMap(v => [v, WINDOW_MIRROR - v])
const LINEN_TIEBACKS = [[158, 169], [WINDOW_MIRROR - 158, WINDOW_MIRROR - 169]]
const LIGHT_STRAND_STARTS = [160, 236]
const SUCCULENTS = [[-4, -2, -35], [4, -2, 35], [-2.6, -4.6, -10], [2.6, -4.6, 10], [0, -3, 0]]

const Bulb = ({ x, y, c }) => (
  <>
    <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="2.4" fill={c} stroke={ROOM_INK} strokeWidth="1.2" />
    <circle cx={(x - 0.7).toFixed(1)} cy={(y - 0.7).toFixed(1)} r=".7" fill="#fff" />
  </>
)

// A tea light: a white holder with a flame (the radio's and the cat's sill neighbour).
const TeaLight = ({ v }) => (
  <>
    <CylT cu={8.5} cv={v} r0={3.4} r1={4.2} h0={74} h1={80} color="#ffffff" />
    <Shine cu={8.5} cv={v} r={4.2} h0={74} h1={80} />
    <Bill u={8.5} v={v} h={80}><path d="M0 0 q-2.4 -3.4 0 -7 q2.4 3.6 0 7z" fill="#ffb703" {...K} /></Bill>
  </>
)

function WindowLights() {
  const wire = Array.from({ length: 13 }, (_, i) => P(1, 160 + i * 6.3, 140 - Math.sin((i / 12) * Math.PI) * 8))
  return (
    <>
      <IsoLine points={wire} width={1.2} />
      {wire.slice(1, -1).map(([x, y], i) => <Bulb key={i} x={x} y={y + 3} c={FAIRY_BULBS[i % 5]} />)}
      {LIGHT_STRAND_STARTS.map(v => {
        const strand = [0, 1, 2, 3, 4, 5].map(k => P(1, v + Math.sin(k) * 2, 136 - k * 13))
        return (
          <g key={v}>
            <IsoLine points={strand} width={1.2} />
            {strand.slice(1).map(([x, y], k) => <Bulb key={k} x={x} y={y} c={FAIRY_BULBS[(k + 2) % 5]} />)}
          </g>
        )
      })}
    </>
  )
}

export const WINDOW_BUILDERS = {
  // Window dressing
  'curtains-gingham': () => (
    <>
      <Box u={0.4} v={CURTAIN_ROD.v} du={2} dv={CURTAIN_ROD.dv} h0={141} h1={143.5} color="#8a5a2b" />
      {GINGHAM_PANELS.map(([a, b]) => (
        <g key={a}>
          <Box u={0.5} v={a} du={1.8} dv={b - a} h0={SILL_TOP_H} h1={141} color="#ffc2d1" />
          {[a + 3.75, a + 7.5, a + 11.25].map(x => <IsoLine key={x} points={[P(2.35, x, SILL_TOP_H), P(2.35, x, 141)]} width={1} color="#ffffff" />)}
          {[76, 90, 104, 118, 132].map(h => <IsoLine key={h} points={[P(2.35, a, h), P(2.35, b, h)]} width={1} color="#ffffff" />)}
          <IsoLine points={[P(2.45, a, 100), P(2.45, b, 100)]} width={2.4} color="#e76f51" />
        </g>
      ))}
      {CURTAIN_END_CAPS.map(v => <Box key={v} u={0.4} v={v} du={2} dv={1.5} h0={139.5} h1={146} color="#d4a017" />)}
    </>
  ),
  'curtains-linen': () => (
    <>
      <Box u={0.4} v={CURTAIN_ROD.v} du={2} dv={CURTAIN_ROD.dv} h0={141} h1={143.5} color="#d4a017" />
      {CURTAIN_END_CAPS.map(v => <Box key={v} u={0.4} v={v} du={2} dv={1.5} h0={139.5} h1={146} color="#d4a017" />)}
      <SlabU up={0.6} th={1.6} vh={LINEN_LEFT} fill="#f3ead8" />
      <SlabU up={0.6} th={1.6} vh={LINEN_RIGHT} fill="#f3ead8" />
      {LINEN_FOLDS.map(v => <IsoLine key={v} points={[P(2.2, v, 140), P(2.2, v, SILL_TOP_H + 1)]} width={1} color={shade('#f3ead8', -20)} />)}
      {LINEN_TIEBACKS.map(([from, to]) => <IsoLine key={from} points={[P(2.3, from, 100), P(2.3, to, 100)]} width={2.6} color="#d4a017" />)}
    </>
  ),
  'roller-blind': () => (
    <>
      <Box u={0.5} v={162} du={2} dv={3} h0={131} h1={141} color="#8a8a8a" />
      <Box u={0.5} v={231} du={2} dv={3} h0={131} h1={141} color="#8a8a8a" />
      <Box u={0.5} v={165} du={2} dv={66} h0={133} h1={139} color="#d4a017" />
      <Box u={0.8} v={166} du={1.4} dv={64} h0={108} h1={133} color="#ffd8a8" />
      {[114, 120, 126].map(h => <IsoLine key={h} points={[P(2.25, 166.5, h), P(2.25, 229.5, h)]} width={1} color="#f4b67a" />)}
      <Box u={0.7} v={166} du={1.8} dv={64} h0={105} h1={108} color="#d4a017" />
      <IsoLine points={[P(2.55, 198, 105), P(2.55, 198, 96)]} width={1} />
      <Box u={1.6} v={196.8} du={0.8} dv={2.4} h0={91.5} h1={96} color="#d4a017" />
      <IsoLine points={[P(2.3, 167, 132), P(2.3, 229, 132)]} width={1} color={WHITE_HI} />
    </>
  ),
  'window-lights': () => <WindowLights />,
  'plant-hanger': () => (
    <>
      {[[13, 198], [8, 203], [8, 193]].map(([u, v]) => <IsoLine key={`${u}-${v}`} points={[P(8, 198, 150), P(u, v, 134)]} width={1.2} color="#c9965f" />)}
      <CylT cu={8} cv={198} r0={4.3} r1={5.5} h0={124} h1={134} color="#fffaf0" />
      <Band cu={8} cv={198} r={4.9} h={129} color="#e76f51" w={1.4} />
      <Shine cu={8} cv={198} r={5.5} h0={124} h1={134} />
      <Soil cu={8} cv={198} h={134} r={4.4} />
      <Bill u={8} v={198} h={134}>
        <path d="M-4 0 q-3 8 -2 18 M0 0 q1 10 0 22 M4 0 q3 8 2 15" stroke="#5fa84a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="-6" cy="18" r="2.6" fill="#7cc35a" {...K} />
        <circle cx="0" cy="22" r="2.6" fill="#7cc35a" {...K} />
        <circle cx="6" cy="15" r="2.6" fill="#7cc35a" {...K} />
        <circle cx="-3" cy="-3" r="3.6" fill="#5fa84a" {...K} />
        <circle cx="3.2" cy="-3.6" r="3.6" fill="#7cc35a" {...K} />
        <circle cx="0" cy="-6.4" r="3.8" fill="#8fd18a" {...K} />
        <circle cx="-1.2" cy="-7.6" r="1" fill="#fff" opacity=".7" />
      </Bill>
    </>
  ),

  // Windowsill
  'sill-basil': () => (
    <>
      {[178, 198, 218].map(v => (
        <g key={v}>
          <CylT cu={8.5} cv={v} r0={3.6} r1={4.4} h0={74} h1={81} color="#c0563b" />
          <Band cu={8.5} cv={v} r={4} h={78} color={shade('#c0563b', -30)} w={1.2} />
          <Shine cu={8.5} cv={v} r={4.4} h0={74} h1={81} />
          <Bill u={8.5} v={v} h={81}>
            <g transform="translate(0 -5)"><ScaledLeaf fill="#8fd18a" s={0.72} /></g>
            <ScaledLeaf fill="#7cc35a" s={0.85} />
          </Bill>
        </g>
      ))}
    </>
  ),
  'sill-succulents': () => (
    <>
      {[[178, '#4dabf7'], [198, '#ffd34d'], [218, '#ff8fab']].map(([v, c]) => (
        <g key={v}>
          <CylT cu={8.5} cv={v} r0={3.4} r1={4.2} h0={74} h1={80} color={c} />
          <Shine cu={8.5} cv={v} r={4.2} h0={74} h1={80} />
          <Bill u={8.5} v={v} h={80}>
            {SUCCULENTS.map(([x, y, r]) => (
              <ellipse key={`${x}${y}`} cx={x} cy={y} rx="3.3" ry="2.1" transform={`rotate(${r} ${x} ${y})`} fill="#8fd18a" {...K} />
            ))}
            <circle cy="-4.5" r="1.7" fill="#5fa84a" {...K} />
          </Bill>
        </g>
      ))}
    </>
  ),
  'sill-cactus': () => (
    <>
      <CylT cu={8.5} cv={186} r0={4} r1={5} h0={74} h1={81} color="#d98b6a" />
      <Band cu={8.5} cv={186} r={4.5} h={77.5} color={shade('#d98b6a', -28)} w={1.2} />
      <Shine cu={8.5} cv={186} r={5} h0={74} h1={81} />
      <Bill u={8.5} v={186} h={81}>
        <path d="M-3 0 v-12 a3 3 0 0 1 6 0 v12z M3 -6 h2.4 v-4 a1.5 1.5 0 0 1 3 0 v5 a2 2 0 0 1 -2 2 h-3.4z" fill="#5fa84a" {...K} />
        <path d="M-1 -2 v-9" stroke="#a7d98a" strokeWidth="1" strokeLinecap="round" />
        <circle cy="-15.2" r="1.6" fill="#ff8fab" {...K} />
      </Bill>
      <CylT cu={8.5} cv={214} r0={3.4} r1={4.2} h0={74} h1={79} color="#fffaf0" />
      <Shine cu={8.5} cv={214} r={4.2} h0={74} h1={79} />
      <Bill u={8.5} v={214} h={79}>
        <ellipse cy="-4.4" rx="4.2" ry="4.8" fill="#7cc35a" {...K} />
        <path d="M-2 -7 v5 M2 -7 v5 M0 -8.5 v7" stroke="#5fa84a" strokeWidth="1" />
        <circle cx="-1.4" cy="-7" r=".8" fill="#fff" opacity=".7" />
      </Bill>
    </>
  ),
  'sill-radio': () => (
    <>
      <Box u={3.2} v={180} du={8} dv={24} h0={74} h1={87} color="#e76f51" />
      <EllU up={11.3} vc={186} hc={80} rv={3} rh={3} fill="#fffaf0" />
      <IsoLine points={[P(11.3, 186, 80), P(11.3, 187.4, 81.6)]} width={1.2} />
      {[192, 194.4, 196.8, 199.2].map(v => <IsoLine key={v} points={[P(11.3, v, 77), P(11.3, v, 84)]} width={1.2} color={shade('#e76f51', -35)} />)}
      <IsoLine points={[P(3.6, 180.6, 86.2), P(10.8, 180.6, 86.2)]} width={1} color={WHITE_HI} />
      <IsoLine points={[P(6, 200, 87), P(6, 206, 97)]} width={1.4} />
      <TeaLight v={222} />
    </>
  ),
  'sill-cat': () => (
    <>
      <Box u={5.5} v={184} du={6} dv={6} h0={74} h1={76} color="#e8b04a" />
      <Bill u={8.5} v={187} h={76}>
        <path d="M5.4 -9 V-19 Q5.4 -21.4 7.4 -21.4 Q9.4 -21.4 9.4 -19 V-10z" fill="#fff" stroke={ROOM_INK} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M-6.4 0 V-8.5 Q-6.4 -12.5 -3 -12.5 H3 Q6.4 -12.5 6.4 -8.5 V0z" fill="#fff" stroke={ROOM_INK} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M-5.4 -17 L-5 -22 L-1.2 -19.4 M1.2 -19.4 L5 -22 L5.4 -17" fill="#fff" stroke={ROOM_INK} strokeWidth="1.3" strokeLinejoin="round" />
        <circle cy="-15.2" r="5.6" fill="#fff" stroke={ROOM_INK} strokeWidth="1.3" />
        <path d="M-4.3 -19.2 L-4.1 -20.6 L-2.8 -19.6z M4.3 -19.2 L4.1 -20.6 L2.8 -19.6z" fill="#ff8fab" />
        <circle cx="-2.2" cy="-15.8" r=".9" fill={ROOM_INK} />
        <circle cx="2.2" cy="-15.8" r=".9" fill={ROOM_INK} />
        <path d="M-.8 -13.6 h1.6 l-.8 1z" fill="#ff8fab" />
        <path d="M-5.6 -9.6 H5.6" stroke="#e63946" strokeWidth="2" />
        <circle cy="-8.2" r="1.7" fill="#ffd34d" stroke={ROOM_INK} strokeWidth="1" />
        <ellipse cy="-4" rx="2.2" ry="2.8" fill="#ffd34d" stroke={ROOM_INK} strokeWidth="1" />
        <path d="M-3.4 -4 v-3" stroke="#e6e6ea" strokeWidth="1.2" />
      </Bill>
      <TeaLight v={216} />
    </>
  )
}
