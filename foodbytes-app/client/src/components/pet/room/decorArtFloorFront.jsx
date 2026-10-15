import { ROOM_INK } from '../../../constants/petRoom'
import { P, ellipsePoints, rectHPoints, rectUPoints, shade } from './iso'
import { Bill, Box, Cyl, EllH, IsoLine, RectH } from './isoShapes'
import { Band, CylT, EllU, Flat, K, Shine, Soil, StarU, WHITE_HI } from './decorArtWalls'

/**
 * MPP-40: the front-floor decor items — foot of the bed, by the fridge, corner by the door and front of the room.
 * World coords except the four MPP-27 items (watering can, cookbook stack, bean bag, lemon tree), which keep their
 * original coords and are slid to "by the fridge" by decorArt.jsx.
 */
const BENCH_LEGS = [[99, 201], [118, 201], [99, 233], [118, 233]]
const BENCH_BUTTONS = [[104, 208], [104, 218], [104, 228], [114, 208], [114, 218], [114, 228]]
const MONSTERA_LEAVES = [[-10, -26, -30], [8, -34, 25], [-2, -50, 0], [12, -18, 50]]
const COAT_STAND_ARMS = [[28, 276], [16, 276], [22, 282], [22, 270]]
const BASKET_RUNGS = [3, 6, 9]

const arcPoints = (n, make) => Array.from({ length: n + 1 }, (_, i) => make((i / n) * Math.PI))

function Slippers() {
  return [208, 224].map(v => (
    <g key={v}>
      <EllH cu={110} cv={v} h={1.5} ru={9} rv={4.2} fill="#ff8fab" />
      <Cyl cu={114.5} cv={v} r={3.6} h0={1.5} h1={5} color="#ffb3c6" />
      <Cyl cu={104.5} cv={v} r={3.2} h0={1.5} h1={3.4} color="#ff8fab" />
      <IsoLine points={[P(113.2, v + 1.6, 2.4), P(113.2, v + 1.6, 4.4)]} width={1} color={WHITE_HI} />
    </g>
  ))
}

function Guitar() {
  const body = 'M0 -2 c-10 0 -12 -10 -6 -14 c-4 -6 0 -12 6 -12 c6 0 10 6 6 12 c6 4 4 14 -6 14z'
  return (
    <Bill u={12} v={276} h={0.8}>
      <path d="M-7 0 L0 -5 L7 0 M0 -5 V-9" stroke={ROOM_INK} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(0 -7) rotate(-12)">
        <path d={body} fill="#a8672f" stroke={ROOM_INK} strokeWidth="1.4" transform="translate(2 1.2)" />
        <path d={body} fill="#d98b4a" stroke={ROOM_INK} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M-6 -22 q3 -4 7 -3" stroke="#f5c48a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M-1 -10 q5 -1 6 3 q-1 4 -6 3z" fill="#7a3b1c" />
        <circle cy="-15" r="2.6" fill={ROOM_INK} />
        <rect x="-4" y="-8" width="8" height="1.8" fill="#5a3a1c" />
        <rect x="-1.5" y="-56" width="3" height="30" fill="#7a5a3a" stroke={ROOM_INK} strokeWidth="1" />
        <path d="M-.7 -8 V-56 M.7 -8 V-56" stroke="#f1f0f6" strokeWidth=".6" />
        <path d="M-1.5 -34 h3 M-1.5 -42 h3 M-1.5 -50 h3" stroke={ROOM_INK} strokeWidth=".8" />
        <rect x="-3" y="-62" width="6" height="7" rx="1" fill="#7a5a3a" stroke={ROOM_INK} strokeWidth="1.2" />
        <circle cx="-4" cy="-60" r="1" fill="#d4a017" />
        <circle cx="4" cy="-60" r="1" fill="#d4a017" />
      </g>
    </Bill>
  )
}

export const FLOOR_FRONT_BUILDERS = {
  // Foot of the bed
  'toy-chest': () => (
    <>
      <Box u={98} v={200} du={26} dv={38} h0={0} h1={22} color="#e76f51" />
      <IsoLine points={[P(124.05, 200.6, 9), P(124.05, 237.4, 9)]} width={1.2} color={shade('#e76f51', -35)} />
      <Box u={97} v={199} du={28} dv={40} h0={22} h1={26} color="#f4a259" />
      <StarU up={124.1} vc={219} hc={13.5} R={5} fill="#ffd34d" />
      <Flat points={rectUPoints(124.05, 216.5, 221.5, 18.6, 22)} fill="#d4a017" />
      {[[201.4, 3], [236.6, 3], [201.4, 19], [236.6, 19]].map(([v, h]) => <EllU key={`${v}-${h}`} up={124.1} vc={v} hc={h} rv={1.1} rh={1.1} fill="#ffd34d" />)}
      <IsoLine points={[P(98.5, 200.5, 25.8), P(123.5, 200.5, 25.8)]} width={1} color={WHITE_HI} />
    </>
  ),
  bench: () => (
    <>
      {BENCH_LEGS.map(([u, v]) => <Box key={`${u}-${v}`} u={u} v={v} du={3} dv={3} h0={0} h1={16} color="#7a5a3a" />)}
      <Box u={98} v={200} du={24} dv={36} h0={16} h1={21} color="#b98a5a" />
      <Box u={99} v={202} du={22} dv={32} h0={21} h1={25} color="#c9a6f7" />
      {BENCH_BUTTONS.map(([u, v]) => <EllH key={`${u}-${v}`} cu={u} cv={v} h={25.1} ru={1.1} rv={1.1} fill={shade('#c9a6f7', -22)} />)}
      <IsoLine points={[P(100, 202.8, 24.7), P(120, 202.8, 24.7)]} width={1} color={WHITE_HI} />
    </>
  ),
  'laundry-basket': () => (
    <>
      <CylT cu={111} cv={218} r0={10} r1={12} h0={0} h1={20} color="#e2c290" />
      <Band cu={111} cv={218} r={10.7} h={6} color="#b98a5a" w={1.2} />
      <Band cu={111} cv={218} r={11.4} h={13} color="#b98a5a" w={1.2} />
      <Shine cu={111} cv={218} r={12} h0={0} h1={20} />
      <Soil cu={111} cv={218} h={20} r={10.6} fill="#8a6a45" />
      <Bill u={111} v={218} h={20}>
        <path d="M-9.5 0 q4 -9 9 -3 q4 -8 10 2z" fill="#4dabf7" stroke={ROOM_INK} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M-2 -2 q3 -6 8 -1" fill="#ff8fab" stroke={ROOM_INK} strokeWidth="1.2" />
        <path d="M-6 -4 q2 -3 4 -3" stroke="#fff" strokeWidth="1" fill="none" opacity=".7" strokeLinecap="round" />
      </Bill>
    </>
  ),
  slippers: () => (
    <>
      <Box u={98} v={198} du={26} dv={40} h0={0} h1={1.2} color="#a7d98a" />
      <RectH h={1.3} u0={101} u1={121} v0={201} v1={235} fill="none" />
      <Slippers />
    </>
  ),

  // By the fridge
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
  ),
  'veg-basket': () => (
    <>
      <CylT cu={238} cv={150} r0={10} r1={12} h0={0} h1={12} color="#c9965f" />
      <Band cu={238} cv={150} r={10.8} h={4} color="#8a5a2b" w={1.2} />
      <Band cu={238} cv={150} r={11.4} h={8} color="#8a5a2b" w={1.2} />
      <Shine cu={238} cv={150} r={12} h0={0} h1={12} />
      <Soil cu={238} cv={150} h={12} r={10.6} fill="#6b4a2f" />
      <IsoLine points={arcPoints(10, t => P(238 + 11 * Math.cos(t), 150, 12 + 12 * Math.sin(t)))} width={2.2} color="#8a5a2b" />
      <Bill u={238} v={150} h={12}>
        <path d="M-8 0 l-3 -8 M-2 0 l1 -11 M5 0 l4 -9" stroke="#5fa84a" strokeWidth="2" strokeLinecap="round" />
        <path d="M-9 -2 l3 -8 l3 8z" fill="#ff9d3c" stroke={ROOM_INK} strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="4" cy="-4" r="4.2" fill="#e63946" stroke={ROOM_INK} strokeWidth="1.2" />
        <circle cx="2.8" cy="-5.4" r="1" fill="#fff" opacity=".7" />
        <ellipse cx="-3" cy="-2.6" rx="3" ry="2.2" fill="#8fd18a" stroke={ROOM_INK} strokeWidth="1.2" />
      </Bill>
    </>
  ),

  // Corner by the door
  monstera: () => (
    <>
      <CylT cu={22} cv={276} r0={8} r1={10} h0={0} h1={18} color="#fffaf0" />
      <Band cu={22} cv={276} r={9.2} h={12} color="#e76f51" w={1.6} />
      <Shine cu={22} cv={276} r={10} h0={0} h1={18} />
      <Soil cu={22} cv={276} h={18} r={8.6} />
      <Bill u={22} v={276} h={18}>
        <path d="M0 0 L-10 -20 M0 0 L8 -26 M0 0 L-2 -40" stroke="#3f8f3a" strokeWidth="2" />
        {MONSTERA_LEAVES.map(([x, y, r]) => (
          <g key={`${x}${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
            <path d="M0 12 C-14 4 -12 -12 0 -12 C12 -12 14 4 0 12z" fill="#3f8f3a" stroke={ROOM_INK} strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M0 12 C-8 6 -8 -8 0 -12 C-3 -4 -2 4 0 12z" fill="#5fae52" />
            <path d="M0 12 V-10 M0 0 L-7 -4 M0 4 L7 0" stroke="#7cc35a" strokeWidth="1.2" />
            <path d="M-9 -3 l4 1 M9 -3 l-4 1" stroke="#f1f0f6" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        ))}
      </Bill>
    </>
  ),
  'coat-stand': () => (
    <>
      <Cyl cu={22} cv={276} r={8} h0={0} h1={3} color="#7a5a3a" />
      <Cyl cu={22} cv={276} r={1.6} h0={3} h1={88} color="#7a5a3a" />
      {COAT_STAND_ARMS.map(([u, v]) => <IsoLine key={`${u}-${v}`} points={[P(22, 276, 84), P(u, v, 90)]} width={2.4} color="#7a5a3a" />)}
      <Cyl cu={22} cv={276} r={2.6} h0={88} h1={92} color="#9c7048" />
      <Bill u={22} v={276} h={86}>
        <path d="M-9 -4 q-3 18 1 34 h8 q-1 -20 0 -32z" fill="#4dabf7" stroke={ROOM_INK} strokeWidth="1.3" strokeLinejoin="round" transform="translate(-4 4)" />
        <path d="M-12 2 q-1 10 0 18" stroke="#9ad2fb" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <ellipse cx="7" cy="2" rx="6.4" ry="2.4" fill="#e76f51" stroke={ROOM_INK} strokeWidth="1.3" />
        <path d="M2.4 2 q4.6 -7.4 9.2 0" fill="#e76f51" stroke={ROOM_INK} strokeWidth="1.3" />
      </Bill>
    </>
  ),
  'arc-lamp': () => (
    <>
      <Cyl cu={22} cv={276} r={7} h0={0} h1={2.5} color="#555555" />
      <IsoLine points={arcPoints(12, t => P(22 + 12 * (1 - Math.cos(t / 2)), 276, 2.5 + 80 * Math.sin(t / 2)))} width={2.4} color="#555555" />
      <IsoLine points={[P(34, 276, 82.5), P(34, 276, 76)]} width={2} color="#555555" />
      <CylT cu={34} cv={276} r0={5.5} r1={3} h0={66} h1={76} color="#f6f1e0" />
      <IsoLine points={[P(31.4, 277.4, 67), P(32, 277.4, 75)]} width={1} color="#ffffff" />
    </>
  ),
  guitar: () => <Guitar />,

  // Front of the room
  pouffe: () => (
    <>
      <CylT cu={190} cv={250} r0={12} r1={14.5} h0={0} h1={8} color="#ffd34d" />
      <CylT cu={190} cv={250} r0={14.5} r1={12} h0={8} h1={16} color="#ffd34d" />
      {[0, 1, 2, 3].map(i => {
        const t = (i / 4) * Math.PI * 2 + 0.4
        return <IsoLine key={i} points={[P(190, 250, 16), P(190 + 12 * Math.cos(t), 250 + 12 * Math.sin(t), 16)]} width={1.1} color="#c79a1c" />
      })}
      <Band cu={190} cv={250} r={14.6} h={8} color="#c79a1c" w={1.2} />
      <Shine cu={190} cv={250} r={14.5} h0={0} h1={16} />
      <Bill u={190} v={250} h={16}>
        <circle r="2" fill="#e0b52f" {...K} />
        <ellipse cx="-4" cy="-.5" rx="3" ry="1" fill="#fff" opacity=".45" />
      </Bill>
    </>
  ),
  'tea-table': () => (
    <>
      <Cyl cu={190} cv={250} r={8} h0={0} h1={2} color="#7a5a3a" />
      <Cyl cu={190} cv={250} r={1.8} h0={2} h1={20} color="#7a5a3a" />
      <CylT cu={190} cv={250} r0={16} r1={16} h0={20} h1={23} color="#c9965f" />
      <Band cu={190} cv={250} r={16} h={21.5} color="#8a5a2b" w={1} />
      <Bill u={186} v={248} h={23}>
        <path d="M-6 0 q-1 -9 6 -9 q7 0 6 9z" fill="#ffffff" stroke={ROOM_INK} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M6 -6 l5 -3" stroke={ROOM_INK} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M-6 -6 q-5 0 -4 4 q1 2 4 1" fill="none" stroke={ROOM_INK} strokeWidth="1.4" />
        <circle cy="-10.2" r="1.4" fill={ROOM_INK} />
        <path d="M-3 -6 q0 -2 2 -2" stroke="#d6c9f0" strokeWidth="1.2" fill="none" />
        <path d="M-1 -11.8 q-1.3 -1.8 0 -3.7" stroke="#cfd8dc" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </Bill>
      <Bill u={196} v={254} h={23}>
        <ellipse rx="5" ry="1.6" fill="#ffffff" stroke={ROOM_INK} strokeWidth="1.2" />
        <path d="M-3 -.4 h6 l-1 -5 h-4z" fill="#ff8fab" stroke={ROOM_INK} strokeWidth="1.2" strokeLinejoin="round" />
      </Bill>
    </>
  ),
  'pip-ball': () => (
    <>
      <Flat points={ellipsePoints(190, 250, 0.1, 8, 8)} fill="rgba(0,0,0,.14)" />
      <Bill u={190} v={250} h={8.8}>
        <circle r="8" fill="#ffffff" stroke={ROOM_INK} strokeWidth="1.4" />
        <path d="M-8 0 q8 -5 16 0" stroke="#e63946" strokeWidth="2.4" fill="none" />
        <path d="M-6 5 q6 -3 12 0" stroke="#4dabf7" strokeWidth="2.4" fill="none" />
        <path d="M-5.4 -5.6 q3 -3 6.6 -3.4" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".8" />
        <path d="M3 4 q3 -2 4 -5" stroke="#cfd8dc" strokeWidth="1.2" fill="none" />
      </Bill>
    </>
  ),
  'picnic-basket': () => (
    <>
      <IsoLine points={arcPoints(10, t => P(190, 250 + 8 * Math.cos(t), 15 + 8 * Math.sin(t)))} width={2.4} color="#8a5a2b" />
      <Box u={180} v={242} du={20} dv={16} h0={0} h1={12} color="#c9965f" />
      {BASKET_RUNGS.map(h => <IsoLine key={`a${h}`} points={[P(200.05, 242.6, h), P(200.05, 257.4, h)]} width={1} color={shade('#c9965f', -34)} />)}
      {BASKET_RUNGS.map(h => <IsoLine key={`b${h}`} points={[P(180.6, 258.05, h), P(199.4, 258.05, h)]} width={1} color={shade('#c9965f', -34)} />)}
      <Box u={179} v={241} du={22} dv={18} h0={12} h1={15} color="#ef7d7d" />
      <Flat points={rectHPoints(15.05, 180, 190, 242, 250)} fill="#ffffff" />
      <Flat points={rectHPoints(15.05, 190, 200, 250, 258)} fill="#ffffff" />
      <Flat points={rectUPoints(200.1, 248, 252, 10, 14)} fill="#d4a017" />
      <IsoLine points={[P(180, 241.6, 14.8), P(200, 241.6, 14.8)]} width={1} color={WHITE_HI} />
    </>
  )
}
