import { MOCHI_OUTLINE } from '../mochiParts'
import { AWARD_KINDS } from '../../../constants/petAwards'

/**
 * MPP-23: the mockup v5 trophy() and ribbon() art, drawn at the origin (base at y 0, rising
 * to y ≈ -34 / -28). The room's cabinet (furniture.jsx) and the trophy cabinet view both
 * draw from here, so the two can't drift.
 */
const STROKE = { stroke: MOCHI_OUTLINE, strokeWidth: 2 }

export function TrophyArt() {
  return (
    <>
      <rect x="6" y="-6" width="20" height="6" fill="#8a5a2b" {...STROKE} />
      <rect x="13" y="-14" width="6" height="8" fill="#ffc83d" {...STROKE} />
      <path d="M4 -34 h24 q0 20 -12 20 q-12 0 -12 -20z" fill="#ffd34d" {...STROKE} />
      <path d="M4 -30 q-7 2 -3 9 q3 3 6 1 M28 -30 q7 2 3 9 q-3 3 -6 1" fill="none" {...STROKE} />
    </>
  )
}

export function RibbonArt() {
  return (
    <>
      <path d="M8 -10 l-4 14 l6 -3 l4 5 l2 -16 M20 -10 l4 14 l-6 -3 l-4 5 l-2 -16" fill="#e63946" {...STROKE} />
      <circle cx="14" cy="-18" r="10" fill="#4dabf7" {...STROKE} />
      <circle cx="14" cy="-18" r="5" fill="#ffd34d" />
    </>
  )
}

/** A 40×40 icon for the cabinet shelves (mockup v5 award(): trophy at 4,38; ribbon at 6,34). Decorative. */
export function AwardIcon({ kind }) {
  const trophy = kind === AWARD_KINDS.TROPHY
  return (
    <svg className="pip-award-icon" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <g transform={trophy ? 'translate(4,38)' : 'translate(6,34)'}>
        {trophy ? <TrophyArt /> : <RibbonArt />}
      </g>
    </svg>
  )
}
