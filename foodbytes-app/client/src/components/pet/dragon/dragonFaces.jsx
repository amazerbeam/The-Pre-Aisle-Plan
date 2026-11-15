import { PET_MOODS } from '../../../constants/pet'
import { PIP_LINE } from '../../../constants/pipLines'
import { pipForm } from '../pip/lineForms'
import { SharedFace } from '../pip/sharedFace'
import { DRAGON_INK } from './dragonForms'

const BLUSH = '#ff8fab'
const IRIS = '#ffcf4d'
const CX = 100

/** Slit-pupil eyes and a fang for content, mischievous and happy; bored and asleep use the shared round-eye faces in the dragon's ink. Reads only the eyes anchor. */
export function DragonFace({ form, mood }) {
  const { y: ey, gap, s } = pipForm(PIP_LINE.DRAGON, form).eyes
  if (mood === PET_MOODS.CONTENT || mood === PET_MOODS.MISCHIEVOUS) {
    return <SlitFace ey={ey} gap={gap} s={s} mischievous={mood === PET_MOODS.MISCHIEVOUS} />
  }
  return (
    <>
      <SharedFace ey={ey} gap={gap} s={s} mood={mood} ink={DRAGON_INK} />
      {mood === PET_MOODS.HAPPY && <Fang x={CX + 3 * s} y={ey + 17 * s + 1 * s} s={s} />}
    </>
  )
}

function Fang({ x, y, s }) {
  return <path d={`M${x} ${y} l${2.5 * s} ${5 * s} l${2.5 * s} ${-5 * s} Z`} fill="#fff" stroke={DRAGON_INK} strokeWidth={1.6 * s} strokeLinejoin="round" />
}

function SlitFace({ ey, gap, s, mischievous }) {
  const L = CX - gap
  const R = CX + gap
  const my = ey + 17 * s
  const dx = mischievous ? 3 * s : 0
  const line = { stroke: DRAGON_INK, strokeWidth: 4 * s, strokeLinecap: 'round', fill: 'none' }
  return (
    <>
      {[L, R].map((x) => (
        <g key={x}>
          <ellipse cx={x + dx} cy={ey} rx={7.5 * s} ry={9.5 * s} fill={IRIS} stroke={DRAGON_INK} strokeWidth={2.6 * s} />
          <ellipse cx={x + dx} cy={ey + 0.5 * s} rx={2.6 * s} ry={7 * s} fill={DRAGON_INK} />
          <circle cx={x + dx + 2.6 * s} cy={ey - 4 * s} r={2.2 * s} fill="#fff" />
        </g>
      ))}
      {mischievous && (
        <>
          <path d={`M${L - 10 * s} ${ey - 13 * s} Q${L} ${ey - 15 * s} ${L + 10 * s} ${ey - 20 * s}`} {...line} />
          <path d={`M${R - 10 * s} ${ey - 20 * s} Q${R} ${ey - 15 * s} ${R + 10 * s} ${ey - 13 * s}`} {...line} />
        </>
      )}
      <path d={mischievous
        ? `M${CX - 11 * s} ${my} Q${CX - 3 * s} ${my + 8 * s} ${CX + 3 * s} ${my + 1 * s} Q${CX + 8 * s} ${my - 3 * s} ${CX + 13 * s} ${my + 2 * s}`
        : `M${CX - 9 * s} ${my - 2 * s} Q${CX} ${my + 6 * s} ${CX + 9 * s} ${my - 2 * s}`} {...line} />
      <Fang x={CX + 3 * s} y={my + 1 * s} s={s} />
      <ellipse cx={L - 11 * s} cy={ey + 11 * s} rx={8 * s} ry={4.5 * s} fill={BLUSH} opacity=".45" />
      <ellipse cx={R + 11 * s} cy={ey + 11 * s} rx={8 * s} ry={4.5 * s} fill={BLUSH} opacity=".45" />
    </>
  )
}
