import { PET_MOODS, PET_SLEEP_FACE } from '../../../constants/pet'
import { PIP_FORMS } from '../../../constants/pipGrowth'
import { HERB_INK, herbForm } from './herbForms'

const MOUTH = '#7a2e45'
const BLUSH = '#ff8fab'
const CX = 100

/** AC 10: the MPP-14 mood faces on every form; Basilisk has its own face for content and happy (AC 6). */
export function HerbFace({ form, mood }) {
  const { eyes } = herbForm(form)
  if (form === PIP_FORMS.BASILISK && (mood === PET_MOODS.CONTENT || mood === PET_MOODS.HAPPY)) {
    return <BasiliskFace ey={eyes.y} gap={eyes.gap} mood={mood} />
  }
  return <SharedFace ey={eyes.y} gap={eyes.gap} s={eyes.s} mood={mood} />
}

function SharedFace({ ey, gap, s, mood }) {
  const cx = CX
  const L = cx - gap
  const R = cx + gap
  const my = ey + 17 * s
  const line = { stroke: HERB_INK, strokeWidth: 4 * s, strokeLinecap: 'round', fill: 'none' }
  switch (mood) {
    case PET_MOODS.HAPPY:
      return (
        <>
          <path d={`M${L - 9 * s} ${ey + 2 * s} Q${L} ${ey - 11 * s} ${L + 9 * s} ${ey + 2 * s}`} {...line} />
          <path d={`M${R - 9 * s} ${ey + 2 * s} Q${R} ${ey - 11 * s} ${R + 9 * s} ${ey + 2 * s}`} {...line} />
          <path d={`M${cx - 10 * s} ${my - 3 * s} Q${cx} ${my + 15 * s} ${cx + 10 * s} ${my - 3 * s} Z`}
            fill={MOUTH} stroke={HERB_INK} strokeWidth={3 * s} strokeLinejoin="round" />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.8} />
        </>
      )
    case PET_MOODS.BORED:
      return (
        <>
          <path d={`M${L - 8 * s} ${ey} A${8 * s} ${8 * s} 0 0 0 ${L + 8 * s} ${ey} Z`} fill={HERB_INK} />
          <path d={`M${R - 8 * s} ${ey} A${8 * s} ${8 * s} 0 0 0 ${R + 8 * s} ${ey} Z`} fill={HERB_INK} />
          <path d={`M${L - 10 * s} ${ey} L${L + 10 * s} ${ey} M${R - 10 * s} ${ey} L${R + 10 * s} ${ey}`} {...line} />
          <path d={`M${cx - 7 * s} ${my + 2 * s} L${cx + 7 * s} ${my + 2 * s}`} {...line} />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.3} />
        </>
      )
    case PET_MOODS.MISCHIEVOUS:
      return (
        <>
          <Eye x={L} ey={ey} s={s} dx={4 * s} />
          <Eye x={R} ey={ey} s={s} dx={4 * s} />
          <path d={`M${L - 10 * s} ${ey - 13 * s} Q${L} ${ey - 15 * s} ${L + 10 * s} ${ey - 20 * s}`} {...line} />
          <path d={`M${R - 10 * s} ${ey - 20 * s} Q${R} ${ey - 15 * s} ${R + 10 * s} ${ey - 13 * s}`} {...line} />
          <path d={`M${cx - 11 * s} ${my} Q${cx - 3 * s} ${my + 8 * s} ${cx + 3 * s} ${my + 1 * s} Q${cx + 8 * s} ${my - 3 * s} ${cx + 13 * s} ${my + 2 * s}`} {...line} />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.5} />
        </>
      )
    case PET_SLEEP_FACE:
      return (
        <>
          <path d={`M${L - 9 * s} ${ey} Q${L} ${ey + 9 * s} ${L + 9 * s} ${ey}`} {...line} />
          <path d={`M${R - 9 * s} ${ey} Q${R} ${ey + 9 * s} ${R + 9 * s} ${ey}`} {...line} />
          <ellipse cx={cx} cy={my + 1 * s} rx={4 * s} ry={3.4 * s} fill={MOUTH} />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.5} />
        </>
      )
    default:
      return (
        <>
          <Eye x={L} ey={ey} s={s} />
          <Eye x={R} ey={ey} s={s} />
          <path d={`M${cx - 8 * s} ${my - 2 * s} Q${cx} ${my + 6 * s} ${cx + 8 * s} ${my - 2 * s}`} {...line} />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.55} />
        </>
      )
  }
}

function Eye({ x, ey, s, dx = 0 }) {
  return (
    <>
      <ellipse cx={x + dx} cy={ey} rx={7 * s} ry={9 * s} fill={HERB_INK} />
      <circle cx={x + dx + 2.4 * s} cy={ey - 3.4 * s} r={2.8 * s} fill="#fff" />
    </>
  )
}

function Blush({ L, R, ey, s, opacity }) {
  return (
    <>
      <ellipse cx={L - 11 * s} cy={ey + 11 * s} rx={9 * s} ry={5 * s} fill={BLUSH} opacity={opacity} />
      <ellipse cx={R + 11 * s} cy={ey + 11 * s} rx={9 * s} ry={5 * s} fill={BLUSH} opacity={opacity} />
    </>
  )
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
