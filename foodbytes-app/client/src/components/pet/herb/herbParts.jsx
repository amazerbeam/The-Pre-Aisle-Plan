import { PET_MOODS, PET_SLEEP_FACE } from '../../../constants/pet'
import { PIP_FORMS } from '../../../constants/pipGrowth'
import { HERB_INK } from './herbForms'

const LEAF = '#7cc95a'
const LEAF_DARK = '#6bbd4a'
const LEAF_DEEP = '#5fae3e'
const PETAL = '#ff9cc4'
const PETAL_LIGHT = '#ffd0e3'
const STAR = '#ffd34d'

const SPARKLES = [[26, 40, 9, '0s'], [176, 30, 7, '0.5s'], [186, 92, 5, '0.9s']]
const BUSHLING_LEAVES = [[-165, 1.25], [-15, 1.25], [-140, 1.45], [-40, 1.45], [-112, 1.6], [-68, 1.6]]
const BLOOM_ANGLES = [0, 1, 2, 3, 4, 5].map((k) => k * 60)

/** A droop rotates the leaf 55° towards the ground (wilted, bored or asleep). */
const droopAngle = (deg, droop) => (droop ? deg + (Math.cos((deg * Math.PI) / 180) < 0 ? -55 : 55) : deg)

export function Leaf({ x, y, deg, size, droop, color = LEAF }) {
  return (
    <path d="M0 0 q14 -16 34 -2 q-14 16 -34 2 Z"
      transform={`translate(${x} ${y}) rotate(${droopAngle(deg, droop)}) scale(${size})`}
      fill={color} stroke={HERB_INK} strokeWidth={3.5 / size} strokeLinejoin="round" />
  )
}

export function Vein({ x, y, deg, size, droop }) {
  return (
    <path d="M4 0 h22" transform={`translate(${x} ${y}) rotate(${droopAngle(deg, droop)}) scale(${size})`}
      stroke={HERB_INK} strokeWidth={2 / size} opacity=".35" />
  )
}

export function Vine({ d, tipX, tipY, tipDeg }) {
  return (
    <>
      <path d={d} stroke={HERB_INK} strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={LEAF_DEEP} strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Leaf x={tipX} y={tipY} deg={tipDeg} size={0.75} droop={false} />
    </>
  )
}

export function Bloom({ cx, cy, stemTo }) {
  return (
    <>
      <path d={`M${cx} ${stemTo} V${cy + 8}`} stroke={HERB_INK} strokeWidth="4" strokeLinecap="round" />
      {BLOOM_ANGLES.map((a) => (
        <ellipse key={`o${a}`} cx={cx} cy={cy - 15} rx="9" ry="15" transform={`rotate(${a + 30} ${cx} ${cy})`}
          fill={PETAL} stroke={HERB_INK} strokeWidth="2.8" />
      ))}
      {BLOOM_ANGLES.map((a) => (
        <ellipse key={`i${a}`} cx={cx} cy={cy - 11} rx="7" ry="11" transform={`rotate(${a} ${cx} ${cy})`}
          fill={PETAL_LIGHT} stroke={HERB_INK} strokeWidth="2.5" />
      ))}
      <circle cx={cx} cy={cy} r="8" fill={STAR} stroke={HERB_INK} strokeWidth="2.8" />
      <circle cx={cx - 2.5} cy={cy - 2.5} r="2.2" fill="#fff" opacity=".8" />
    </>
  )
}

/** Behind the body: Sprig's leaf arms; Bushling's arms + crown; Basilisk's vines (hanging when drooped) + crown. */
export function HerbBack({ form, droop }) {
  if (form === PIP_FORMS.BUSHLING) {
    return (
      <>
        <Leaf x={48} y={140} deg={165} size={0.95} droop={droop} />
        <Leaf x={152} y={140} deg={15} size={0.95} droop={droop} />
        {[-60, -120].map((a) => <Leaf key={a} x={100} y={90} deg={a} size={0.85} droop={droop} color={LEAF_DARK} />)}
        {[-30, -150, -90].map((a) => (
          <g key={a}>
            <Leaf x={100} y={90} deg={a} size={1.05} droop={droop} />
            <Vein x={100} y={90} deg={a} size={1} droop={droop} />
          </g>
        ))}
      </>
    )
  }
  if (form === PIP_FORMS.SPRIG) {
    return (
      <>
        <Leaf x={56} y={142} deg={160} size={0.8} droop={droop} />
        <Leaf x={144} y={142} deg={20} size={0.8} droop={droop} />
      </>
    )
  }
  if (form === PIP_FORMS.BASILISK) {
    return (
      <>
        {droop ? (
          <>
            <Vine d="M58 126 C38 128 26 146 30 166" tipX={30} tipY={166} tipDeg={100} />
            <Vine d="M142 126 C162 128 174 146 170 166" tipX={170} tipY={166} tipDeg={80} />
          </>
        ) : (
          <>
            <Vine d="M58 126 C38 128 24 118 22 104 C20 92 28 84 20 76" tipX={20} tipY={76} tipDeg={-145} />
            <Vine d="M142 126 C162 128 176 118 178 104 C180 92 172 84 180 76" tipX={180} tipY={76} tipDeg={-35} />
          </>
        )}
        {BUSHLING_LEAVES.map(([a, sz], i) => (
          <g key={a}>
            <Leaf x={100} y={90} deg={a} size={sz} droop={droop} color={i % 2 ? LEAF_DEEP : LEAF_DARK} />
            <Vein x={100} y={90} deg={a} size={sz} droop={droop} />
          </g>
        ))}
      </>
    )
  }
  return null
}

/** Out of the top of the head, drawn last: Seedling sprout, Sprig's three leaves, Basilisk's bloom (a closed bud when drooped). */
export function HerbGrowth({ form, droop, base }) {
  if (form === PIP_FORMS.SEEDLING) {
    return (
      <>
        <path d={`M100 ${base + 2} v-20`} stroke={HERB_INK} strokeWidth="4.5" strokeLinecap="round" />
        <Leaf x={101} y={base - 18} deg={-25} size={0.8} droop={droop} />
        <Leaf x={99} y={base - 18} deg={-155} size={0.7} droop={droop} />
      </>
    )
  }
  if (form === PIP_FORMS.SPRIG) {
    return (
      <>
        <path d={`M100 ${base + 2} v-24`} stroke={HERB_INK} strokeWidth="5" strokeLinecap="round" />
        <Leaf x={100} y={base - 22} deg={-35} size={0.95} droop={droop} />
        <Leaf x={100} y={base - 22} deg={-145} size={0.95} droop={droop} />
        <Leaf x={100} y={base - 22} deg={-90} size={0.8} droop={droop} />
      </>
    )
  }
  if (form === PIP_FORMS.BASILISK) {
    return droop ? (
      <>
        <path d={`M100 ${base + 2} v-26`} stroke={HERB_INK} strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="100" cy={base - 30} rx="7" ry="10" fill={PETAL} stroke={HERB_INK} strokeWidth="2.8" />
      </>
    ) : (
      <Bloom cx={100} cy={base - 50} stemTo={base + 2} />
    )
  }
  return null
}

/** Full-variant mood props: happy sparkles, bored thought bubble, sleep z's; none otherwise. */
export function HerbProps({ mood }) {
  if (mood === PET_MOODS.HAPPY) {
    return SPARKLES.map(([x, y, r, delay]) => (
      <path key={x} className="pip-sparkle" style={{ animationDelay: delay }}
        d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`}
        fill={STAR} stroke={HERB_INK} strokeWidth="1.6" />
    ))
  }
  if (mood === PET_SLEEP_FACE) {
    return (
      <>
        <text x="156" y="40" fontSize="20" fontWeight="700" fill={HERB_INK} opacity=".7" fontFamily="system-ui">z</text>
        <text x="172" y="22" fontSize="14" fontWeight="700" fill={HERB_INK} opacity=".5" fontFamily="system-ui">z</text>
      </>
    )
  }
  if (mood === PET_MOODS.BORED) {
    return (
      <>
        <ellipse cx="170" cy="24" rx="22" ry="13" fill="#fff" stroke={HERB_INK} strokeWidth="2.5" />
        <circle cx="152" cy="44" r="4" fill="#fff" stroke={HERB_INK} strokeWidth="2" />
        <circle cx="161" cy="25" r="2.5" fill={HERB_INK} />
        <circle cx="170" cy="25" r="2.5" fill={HERB_INK} />
        <circle cx="179" cy="25" r="2.5" fill={HERB_INK} />
      </>
    )
  }
  return null
}
