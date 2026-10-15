import { ROOM_INK } from '../../../constants/petRoom'
import { P, rectUPoints, shade } from './iso'
import { Bill, Box, Cyl, EllH, IsoLine, RectU } from './isoShapes'
import { Band, CylT, EllU, Flat, K, Shine, Soil, WHITE_HI } from './decorArtWalls'

/**
 * MPP-40: the back-floor decor items — the back corner (u 2–30, v 32–52) and the bedside nook
 * (u 2–32, v 140–182). World coords; drawn behind the bed.
 */
const SNAKE_LEAVES = [[-5, -32, -3], [-1.5, -40, 0], [2.5, -35, 2], [5.5, -26, 5]]
const STAND_LEGS = [[11, 155], [21, 155], [11, 165], [21, 165]]
const STOOL_LEGS = [[9, 153], [25, 153], [9, 169], [25, 169]]
const RECORD_COLOURS = ['#2f3e46', '#e63946', '#4dabf7']

export const FLOOR_BACK_BUILDERS = {
  // Back corner
  'snake-plant': () => (
    <>
      <CylT cu={20} cv={38.5} r0={5.4} r1={6.2} h0={0} h1={14} color="#e8e0d0" />
      <Band cu={20} cv={38.5} r={5.8} h={10} color="#b9ae9a" w={1.2} />
      <Shine cu={20} cv={38.5} r={6.2} h0={0} h1={14} />
      <Soil cu={20} cv={38.5} h={14} r={4.6} />
      <Bill u={20} v={38.5} h={14}>
        {SNAKE_LEAVES.map(([x, y, t]) => (
          <g key={x}>
            <path d={`M${x - 2} 0 Q${x - 2 + t / 2} ${y / 2} ${x + t / 2} ${y} Q${x + 2 + t / 2} ${y / 2} ${x + 2} 0z`} fill="#5fa84a" stroke={ROOM_INK} strokeWidth="1.2" strokeLinejoin="round" />
            <path d={`M${x} -2 Q${x + (t / 2) * 0.9} ${y / 2} ${x + t / 2} ${y + 3}`} stroke="#a7d98a" strokeWidth="1" fill="none" strokeLinecap="round" />
          </g>
        ))}
      </Bill>
    </>
  ),
  cactus: () => (
    <>
      <CylT cu={16} cv={42} r0={7} r1={8} h0={0} h1={12} color="#d98b6a" />
      <Band cu={16} cv={42} r={7.5} h={8.5} color={shade('#d98b6a', -28)} w={1.2} />
      <Shine cu={16} cv={42} r={8} h0={0} h1={12} />
      <Soil cu={16} cv={42} h={12} r={6.2} />
      <Bill u={16} v={42} h={12}>
        <path d="M-5 0 v-34 a5 5 0 0 1 10 0 v34z M5 -14 h5 v-10 a2.5 2.5 0 0 1 5 0 v12 a3 3 0 0 1 -3 3 h-7z M-5 -20 h-4 v-6 a2.5 2.5 0 0 0 -5 0 v8 a3 3 0 0 0 3 3 h6z" fill="#5fa84a" stroke={ROOM_INK} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M-1.6 -3 v-30 M1.6 -3 v-30" stroke="#4a8a3c" strokeWidth="1" />
        <path d="M-3.4 -4 v-26" stroke="#a7d98a" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M-1 -8 l-2 -1 M1 -16 l2 -1 M-1 -24 l-2 -1 M1 -30 l2 -1" stroke="#fffaf0" strokeWidth=".9" strokeLinecap="round" />
        <circle cy="-38" r="2.5" fill="#ff8fab" {...K} />
      </Bill>
    </>
  ),
  'umbrella-stand': () => (
    <>
      <Bill u={16} v={42} h={24}>
        <path d="M-4 0 V-33 q0 -5 4.2 -5 q4 0 4 4" stroke={ROOM_INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M5 0 V-27 q0 -4 3 -4" stroke="#8a5a2b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M-8 0 l3 -24 l3 24z" fill="#e63946" stroke={ROOM_INK} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M-5 -22 l0 20" stroke="#ff8a95" strokeWidth="1" />
        <path d="M1 0 l2.4 -20 l2.4 20z" fill="#ffd34d" stroke={ROOM_INK} strokeWidth="1.2" strokeLinejoin="round" />
      </Bill>
      <CylT cu={16} cv={42} r0={6} r1={7} h0={0} h1={24} color="#4dabf7" />
      <Band cu={16} cv={42} r={6.5} h={6} color={shade('#4dabf7', -30)} w={1.2} />
      <Band cu={16} cv={42} r={6.5} h={18} color={shade('#4dabf7', -30)} w={1.2} />
      <Shine cu={16} cv={42} r={7} h0={0} h1={24} />
    </>
  ),
  broom: () => (
    <>
      <IsoLine points={[P(8, 40, 14), P(4, 44, 76)]} width={2.6} color="#b98a5a" />
      <IsoLine points={[P(7.6, 40.3, 16), P(3.6, 44.3, 74)]} width={1} color={WHITE_HI} />
      <Bill u={8} v={40} h={0.8}>
        <path d="M-6.5 0 l1.6 -13 h9.8 l1.6 13z" fill="#e2c290" stroke={ROOM_INK} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M-3 0 v-12 M0 0 v-12 M3 0 v-12" stroke="#b98a5a" strokeWidth="1" />
        <rect x="-5" y="-15.6" width="10" height="3.2" rx="1" fill="#e63946" stroke={ROOM_INK} strokeWidth="1.2" />
      </Bill>
      <Box u={19} v={34} du={10} dv={12} h0={0} h1={1.5} color="#7cc35a" />
      <Box u={19} v={34} du={2} dv={12} h0={1.5} h1={5} color="#5fa84a" />
      <IsoLine points={[P(27, 40, 1.5), P(25, 38.5, 28)]} width={2} color="#5fa84a" />
      <IsoLine points={[P(20.5, 35, 1.4), P(27.5, 35, 1.4)]} width={1} color={WHITE_HI} />
    </>
  ),

  // Bedside nook
  'side-table-lamp': () => (
    <>
      <Box u={4} v={148} du={26} dv={26} h0={0} h1={32} color="#b98a5a" />
      <Box u={3} v={147} du={28} dv={28} h0={32} h1={35} color="#c9965f" />
      <RectU up={30} v0={152} v1={170} h0={12} h1={28} fill="#e2b989" />
      <Bill u={30} v={161} h={20}><circle r="1.8" fill="#8a5a2b" {...K} /></Bill>
      <Cyl cu={17} cv={161} r={4} h0={35} h1={38} color="#666666" />
      <IsoLine points={[P(17, 161, 38), P(17, 161, 52)]} width={1.8} />
      <CylT cu={17} cv={161} r0={8} r1={5} h0={52} h1={64} color="#ffd34d" />
      <IsoLine points={[P(14, 162.4, 53), P(15, 162.4, 63)]} width={1} color={WHITE_HI} />
    </>
  ),
  'record-player': () => (
    <>
      <Box u={6} v={175} du={16} dv={6} h0={0} h1={12} color="#c9965f" />
      {[8, 12, 16].map((u, i) => <Box key={u} u={u} v={175.8} du={2.4} dv={4.4} h0={12} h1={19 + i} color={RECORD_COLOURS[i]} />)}
      <Box u={4} v={148} du={26} dv={26} h0={0} h1={34} color="#7a5a3a" />
      <RectU up={30} v0={152} v1={170} h0={6} h1={28} fill="#5d4129" />
      {[156, 161, 166].map(v => <EllU key={v} up={30.1} vc={v} hc={17} rv={1.6} rh={1.6} fill="#d4a017" />)}
      <Box u={7} v={151} du={20} dv={20} h0={34} h1={40} color="#2f3e46" />
      <EllH cu={17} cv={161} h={40} ru={8} rv={8} fill="#111111" />
      <EllH cu={17} cv={161} h={40} ru={2.5} rv={2.5} fill="#e63946" />
      <IsoLine points={[P(10, 152.6, 41), P(10, 154, 41), P(13.5, 160, 41)]} width={1.6} color="#cfd8dc" />
      <IsoLine points={[P(21, 154, 40.4), P(24, 157, 40.4)]} width={1} color={WHITE_HI} />
    </>
  ),
  'plant-stand': () => (
    <>
      {STAND_LEGS.map(([u, v]) => <Box key={`${u}-${v}`} u={u} v={v} du={2} dv={2} h0={0} h1={36} color="#7a5a3a" />)}
      <Cyl cu={17} cv={161} r={9.5} h0={36} h1={39} color="#9c7048" />
      <CylT cu={17} cv={161} r0={5.5} r1={6.8} h0={39} h1={49} color="#fffaf0" />
      <Band cu={17} cv={161} r={6.2} h={44} color="#e76f51" w={1.4} />
      <Shine cu={17} cv={161} r={6.8} h0={39} h1={49} />
      <Soil cu={17} cv={161} h={49} r={5.8} />
      <Bill u={17} v={161} h={49}>
        <circle cx="-6" cy="-4" r="6.6" fill="#5fa84a" {...K} />
        <circle cx="6" cy="-5" r="6.6" fill="#5fa84a" {...K} />
        <circle cy="-11" r="6.6" fill="#7cc35a" {...K} />
        <circle cx="-1" cy="-6" r="4" fill="#8fd18a" />
        <path d="M-8 -6 q2 -3 4 -2 M4 -13 q2 -2 4 -1" stroke="#fff" strokeWidth="1.1" fill="none" opacity=".7" strokeLinecap="round" />
      </Bill>
    </>
  ),
  'stool-books': () => (
    <>
      {STOOL_LEGS.map(([u, v]) => <Box key={`${u}-${v}`} u={u} v={v} du={2} dv={2} h0={0} h1={26} color="#8a5a2b" />)}
      <Cyl cu={17} cv={161} r={11} h0={26} h1={30} color="#e76f51" />
      <IsoLine points={[P(14, 170.4, 27), P(14, 170.4, 29.4)]} width={1} color={WHITE_HI} />
      <Box u={10} v={155} du={14} dv={10} h0={30} h1={34} color="#4dabf7" />
      <Flat points={rectUPoints(24.02, 156, 164, 30.8, 33.2)} fill="#fffaf0" />
      <Box u={11} v={156} du={12} dv={9} h0={34} h1={37} color="#ffd34d" />
      <Flat points={rectUPoints(23.02, 157, 164, 34.7, 36.3)} fill="#fffaf0" />
    </>
  )
}
