import { PIP_LINE } from '../../../constants/pipLines'
import { pipForm } from '../pip/lineForms'
import { DRAGON_INK } from './dragonForms'

// Pip keeps its own palette in every theme (the components/pet exception).
const BELLY = '#fdf1cc'
const BELLY_LINE = '#e3c98a'
const WING = '#f4bf63'
const WING_RIB = '#c98f2c'
const HORN = '#f7ead0'
const CLAW = '#fffaf0'
const SHELL = '#fffaf3'
const SHELL_SPOT = '#b5e0c9'

const WING_PATH = 'M0 0 C8 -26 34 -44 62 -50 C56 -38 54 -28 56 -16 C46 -20 38 -16 36 -8 C28 -12 18 -8 14 0 Z'
const WING_RIBS = 'M5 -4 L62 -50 M10 -5 L56 -16 M9 -3 L36 -8'
// Per form: the tail raised and lowered (path + tip point), and its width.
const TAILS = [
  { up: ['M116 172 Q138 180 146 166', [146, 166]], down: ['M116 172 Q140 186 152 184', [152, 184]], w: 6 },
  { up: ['M122 170 Q154 182 160 152', [160, 152]], down: ['M122 170 Q156 188 170 184', [170, 184]], w: 7 },
  { up: ['M128 172 C168 190 186 152 172 128', [172, 128]], down: ['M128 172 C164 192 184 186 192 180', [192, 180]], w: 8 }
]
const ARM_LENGTH = [10, 14, 18]

const zigzag = (x0, y0, step, count, high, low) => {
  let d = `M${x0} ${y0}`
  for (let i = 1; i <= count; i++) d += ` L${x0 + i * step} ${i % 2 ? high : low}`
  return d
}

function Wing({ x, y, dir, size, droop }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * size} ${size}) rotate(${droop ? 48 : 0})`}>
      <path d={WING_PATH} fill={WING} stroke={DRAGON_INK} strokeWidth={3.2 / size} strokeLinejoin="round" />
      <path d={WING_RIBS} stroke={WING_RIB} strokeWidth={2 / size} fill="none" strokeLinecap="round" />
    </g>
  )
}

/** Behind the body: the tail (and eggshell shards on the Hatchling), wing buds on the Wyrmling, full wings on the Drake. Wings and tail lower when drooped. */
export function DragonBack({ form, droop }) {
  const f = pipForm(PIP_LINE.DRAGON, form)
  const t = TAILS[form - 1] ?? TAILS[0]
  const [d, [tx, ty]] = droop ? t.down : t.up
  return (
    <>
      <path d={d} stroke={DRAGON_INK} strokeWidth={t.w + 5} fill="none" strokeLinecap="round" />
      <path d={d} stroke={f.fill[1]} strokeWidth={t.w} fill="none" strokeLinecap="round" />
      <path d={`M${tx} ${ty - 8} l7 8 l-7 8 l-7 -8 Z`} fill={f.fill[1]} stroke={DRAGON_INK} strokeWidth="2.6" strokeLinejoin="round" />
      {form === 1 && (
        <>
          <path d={`${zigzag(62, 168, 7.6, 10, 159, 168)} C138 196 62 196 62 168Z`} fill={SHELL} stroke={DRAGON_INK} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="72" cy="178" rx="4" ry="3" fill={SHELL_SPOT} />
          <ellipse cx="130" cy="176" rx="3.5" ry="2.6" fill={SHELL_SPOT} />
        </>
      )}
      {form === 2 && (
        <>
          <Wing x={100 - (f.side - 6)} y={f.neck - 4} dir={-1} size={0.42} droop={droop} />
          <Wing x={100 + (f.side - 6)} y={f.neck - 4} dir={1} size={0.42} droop={droop} />
        </>
      )}
      {form === 3 && (
        <>
          <Wing x={100 - (f.side - 10)} y={f.neck - 2} dir={-1} size={1} droop={droop} />
          <Wing x={100 + (f.side - 10)} y={f.neck - 2} dir={1} size={1} droop={droop} />
        </>
      )}
    </>
  )
}

function Claws({ x, y, dir }) {
  return [[5, -1], [1, 2], [-3, 1]].map(([dx, dy]) => (
    <circle key={dx} cx={x + dir * dx} cy={y + dy} r="2.2" fill={CLAW} stroke={DRAGON_INK} strokeWidth="1.2" />
  ))
}

/** Small clawed arms at the neck (reach grows with the form) and legs from each foot root to just above its tip; the foot itself is the wardrobe's (ball or shoe). */
export function DragonLimbs({ form, f }) {
  const len = ARM_LENGTH[form - 1] ?? ARM_LENGTH[0]
  const ay = f.neck + 6
  return (
    <>
      {[-1, 1].map((dir) => {
        const sx = 100 + dir * (f.side - 4)
        const ex = sx + dir * len
        const ey = ay + len
        const d = `M${sx} ${ay} Q${sx + dir * len * 0.7} ${ay + len * 0.15} ${ex} ${ey}`
        return (
          <g key={dir}>
            <path d={d} stroke={DRAGON_INK} strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d={d} stroke={f.fill[1]} strokeWidth="5" fill="none" strokeLinecap="round" />
            <Claws x={ex} y={ey + 2} dir={dir} />
          </g>
        )
      })}
      {f.feet.map(([r, t]) => {
        const d = `M${r[0]} ${r[1]} Q${r[0]} ${t[1] - 2} ${t[0]} ${t[1] - 2}`
        return (
          <g key={t[0]}>
            <path d={d} stroke={DRAGON_INK} strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d={d} stroke={f.fill[1]} strokeWidth="6.5" fill="none" strokeLinecap="round" />
          </g>
        )
      })}
    </>
  )
}

/** On the body: the cream belly with scale lines, a snout highlight and nostrils, and (from the Wyrmling) cheek marks. */
export function DragonDetails({ form, f }) {
  const { y: ey, gap, s } = f.eyes
  const cy = (f.neck + f.waist) / 2 + 6
  const rx = f.side * 0.58
  const ry = (f.waist - f.neck) / 2 + 12
  return (
    <>
      <ellipse cx="100" cy={cy} rx={rx} ry={ry} fill={BELLY} />
      {[-1, 0, 1].map((i) => (
        <path key={i} d={`M${100 - rx * 0.72} ${cy + i * ry * 0.42} Q100 ${cy + i * ry * 0.42 + 6} ${100 + rx * 0.72} ${cy + i * ry * 0.42}`}
          stroke={BELLY_LINE} strokeWidth="2" fill="none" />
      ))}
      <ellipse cx="100" cy={ey + 14 * s} rx={gap + 8 * s} ry={10 * s} fill="#fff" opacity=".32" />
      <circle cx={100 - 4 * s} cy={ey + 9 * s} r={1.7 * s} fill={DRAGON_INK} />
      <circle cx={100 + 4 * s} cy={ey + 9 * s} r={1.7 * s} fill={DRAGON_INK} />
      {form >= 2 && (
        <>
          <ellipse cx={100 - gap * 0.9} cy={f.hat.y + 4} rx="4" ry="2.6" fill={f.fill[1]} opacity=".5" />
          <ellipse cx={100 + gap * 0.9} cy={f.hat.y + 4} rx="4" ry="2.6" fill={f.fill[1]} opacity=".5" />
        </>
      )}
    </>
  )
}

function Horn({ x, base, h, dir }) {
  return (
    <>
      <path d={`M${x - 5} ${base + 6} Q${x - 3 + dir * 2} ${base - h * 0.6} ${x + dir * 7} ${base - h} Q${x + 4 + dir * 2} ${base - h * 0.45} ${x + 6} ${base + 6} Z`}
        fill={HORN} stroke={DRAGON_INK} strokeWidth="3" strokeLinejoin="round" />
      <path d={`M${x - 2} ${base} q${dir * 3} -2 ${dir * 6} -1 M${x - 1} ${base - h * 0.3} q${dir * 3} -2 ${dir * 5} -1`}
        stroke={DRAGON_INK} strokeWidth="1.4" opacity=".4" fill="none" />
    </>
  )
}

/** Drawn from `base` upward (it pokes through a hat): the Hatchling's shell cap, the Wyrmling's small horns, the Drake's curved horns and brow spike. */
export function DragonCrown({ form, droop, base }) {
  if (form === 1) {
    return (
      <g transform={`rotate(${droop ? -20 : -8} 100 ${base})`}>
        <path d={`${zigzag(84, base + 4, 4, 8, base - 1, base + 4)} C116 ${base - 16} 84 ${base - 16} 84 ${base + 4}Z`}
          fill={SHELL} stroke={DRAGON_INK} strokeWidth="2.8" strokeLinejoin="round" />
        <ellipse cx="96" cy={base - 4} rx="3" ry="2" fill={SHELL_SPOT} />
      </g>
    )
  }
  if (form === 2) {
    return (
      <>
        <Horn x={85} base={base} h={18} dir={-1} />
        <Horn x={115} base={base} h={18} dir={1} />
      </>
    )
  }
  return (
    <>
      <path d={`M95 ${base + 6} L100 ${base - 10} L105 ${base + 6} Z`} fill={HORN} stroke={DRAGON_INK} strokeWidth="2.6" strokeLinejoin="round" />
      <Horn x={82} base={base} h={26} dir={-1} />
      <Horn x={118} base={base} h={26} dir={1} />
    </>
  )
}
