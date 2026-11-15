import { PET_MOODS, PET_SLEEP_FACE } from '../../../constants/pet'

const MOUTH = '#7a2e45'
const BLUSH = '#ff8fab'
const CX = 100

/** The round-eye mood faces every line shares (happy, bored, mischievous, asleep, content), drawn in the line's `ink`. Reads only the eyes anchor (ey, gap, s). */
export function SharedFace({ ey, gap, s, mood, ink }) {
  const cx = CX
  const L = cx - gap
  const R = cx + gap
  const my = ey + 17 * s
  const line = { stroke: ink, strokeWidth: 4 * s, strokeLinecap: 'round', fill: 'none' }
  switch (mood) {
    case PET_MOODS.HAPPY:
      return (
        <>
          <path d={`M${L - 9 * s} ${ey + 2 * s} Q${L} ${ey - 11 * s} ${L + 9 * s} ${ey + 2 * s}`} {...line} />
          <path d={`M${R - 9 * s} ${ey + 2 * s} Q${R} ${ey - 11 * s} ${R + 9 * s} ${ey + 2 * s}`} {...line} />
          <path d={`M${cx - 10 * s} ${my - 3 * s} Q${cx} ${my + 15 * s} ${cx + 10 * s} ${my - 3 * s} Z`}
            fill={MOUTH} stroke={ink} strokeWidth={3 * s} strokeLinejoin="round" />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.8} />
        </>
      )
    case PET_MOODS.BORED:
      return (
        <>
          <path d={`M${L - 8 * s} ${ey} A${8 * s} ${8 * s} 0 0 0 ${L + 8 * s} ${ey} Z`} fill={ink} />
          <path d={`M${R - 8 * s} ${ey} A${8 * s} ${8 * s} 0 0 0 ${R + 8 * s} ${ey} Z`} fill={ink} />
          <path d={`M${L - 10 * s} ${ey} L${L + 10 * s} ${ey} M${R - 10 * s} ${ey} L${R + 10 * s} ${ey}`} {...line} />
          <path d={`M${cx - 7 * s} ${my + 2 * s} L${cx + 7 * s} ${my + 2 * s}`} {...line} />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.3} />
        </>
      )
    case PET_MOODS.MISCHIEVOUS:
      return (
        <>
          <Eye x={L} ey={ey} s={s} dx={4 * s} ink={ink} />
          <Eye x={R} ey={ey} s={s} dx={4 * s} ink={ink} />
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
          <Eye x={L} ey={ey} s={s} ink={ink} />
          <Eye x={R} ey={ey} s={s} ink={ink} />
          <path d={`M${cx - 8 * s} ${my - 2 * s} Q${cx} ${my + 6 * s} ${cx + 8 * s} ${my - 2 * s}`} {...line} />
          <Blush L={L} R={R} ey={ey} s={s} opacity={0.55} />
        </>
      )
  }
}

function Eye({ x, ey, s, dx = 0, ink }) {
  return (
    <>
      <ellipse cx={x + dx} cy={ey} rx={7 * s} ry={9 * s} fill={ink} />
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
