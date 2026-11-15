import { PET_MOODS, PET_SLEEP_FACE } from '../../../constants/pet'
import { PIP_FORMS } from '../../../constants/pipGrowth'
import { PIP_LINE } from '../../../constants/pipLines'
import { pipForm } from '../pip/lineForms'
import { SharedFace } from '../pip/sharedFace'
import { HERB_INK } from './herbForms'

const MOUTH = '#7a2e45'
const BLUSH = '#ff8fab'
const CX = 100

/** AC 10: the MPP-14 mood faces on every form; Basilisk has its own face for content and happy (AC 6). */
export function HerbFace({ form, mood }) {
  const { eyes } = pipForm(PIP_LINE.HERB, form)
  if (form === PIP_FORMS.BASILISK && (mood === PET_MOODS.CONTENT || mood === PET_MOODS.HAPPY)) {
    return <BasiliskFace ey={eyes.y} gap={eyes.gap} mood={mood} />
  }
  return <SharedFace ey={eyes.y} gap={eyes.gap} s={eyes.s} mood={mood} ink={HERB_INK} />
}

/** Basilisk's confident-friendly face: three-part eyes, brows, smile or open mouth, blush .6. */
function BasiliskFace({ ey, gap, mood }) {
  const cx = CX
  const L = cx - gap
  const R = cx + gap
  const my = ey + 17
  const line = { stroke: HERB_INK, strokeWidth: 4, fill: 'none', strokeLinecap: 'round' }
  return (
    <>
      {[L, R].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={ey} rx="7.5" ry="9.5" fill={HERB_INK} />
          <circle cx={x + 2.6} cy={ey - 3.6} r="3" fill="#fff" />
          <circle cx={x - 2.4} cy={ey + 3.6} r="1.5" fill="#fff" />
        </g>
      ))}
      <path d={`M${L - 9} ${ey - 15} Q${L} ${ey - 19} ${L + 9} ${ey - 16}`} {...line} />
      <path d={`M${R - 9} ${ey - 16} Q${R} ${ey - 19} ${R + 9} ${ey - 15}`} {...line} />
      {mood === PET_MOODS.HAPPY ? (
        <>
          <path d={`M${cx - 13} ${my - 3} Q${cx} ${my + 16} ${cx + 13} ${my - 3} Z`}
            fill={MOUTH} stroke={HERB_INK} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx={cx} cy={my + 6} rx="5" ry="3" fill={BLUSH} />
        </>
      ) : (
        <path d={`M${cx - 12} ${my - 2} Q${cx} ${my + 10} ${cx + 12} ${my - 2}`} {...line} />
      )}
      <ellipse cx={L - 12} cy={ey + 12} rx="9" ry="5" fill={BLUSH} opacity=".6" />
      <ellipse cx={R + 12} cy={ey + 12} rx="9" ry="5" fill={BLUSH} opacity=".6" />
    </>
  )
}
