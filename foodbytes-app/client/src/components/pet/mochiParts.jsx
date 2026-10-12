import { PET_MOODS } from '../../constants/pet'

// Approved pet-mockup.html (2026-10-12): Mochi, Lavender. Geometry is copied verbatim
// from the mockup's face()/props() so the shipped pet matches the mood sheet.
export const MOCHI_OUTLINE = '#3b2f5c'
export const MOCHI_FILL = '#cdbdf3'
export const MOCHI_SHADE = '#a993df'
const MOUTH = '#7a2e45'
const BLUSH = '#ff8fab'
const CRUMB = '#c98a3c'
const SWEAT = '#a8dcff'
const STAR = '#ffd34d'
const LINE = { stroke: MOCHI_OUTLINE, strokeWidth: 5, strokeLinecap: 'round', fill: 'none' }

/** Face for each mood. Only the face and props change — never the body (AC 9). */
export function MochiFace({ mood }) {
  switch (mood) {
    case PET_MOODS.HAPPY:
      return (
        <>
          <path d="M64 122 Q75 106 86 122" {...LINE} />
          <path d="M114 122 Q125 106 136 122" {...LINE} />
          <path d="M86 136 Q100 164 114 136 Z" fill={MOUTH} stroke={MOCHI_OUTLINE} strokeWidth="4" strokeLinejoin="round" />
          <ellipse cx="100" cy="150" rx="6" ry="4" fill={BLUSH} />
          <Blush opacity={0.75} />
        </>
      )
    case PET_MOODS.BORED:
      return (
        <>
          <path d="M66 120 A9 9 0 0 0 84 120 Z" fill={MOCHI_OUTLINE} />
          <path d="M116 120 A9 9 0 0 0 134 120 Z" fill={MOCHI_OUTLINE} />
          <path d="M63 119 L87 119" {...LINE} strokeWidth="4" />
          <path d="M113 119 L137 119" {...LINE} strokeWidth="4" />
          <path d="M92 146 L108 146" {...LINE} strokeWidth="4" />
          <Blush opacity={0.35} />
        </>
      )
    case PET_MOODS.MISCHIEVOUS:
      return (
        <>
          <Eye x={75} y={122} dx={5} />
          <Eye x={125} y={122} dx={5} />
          <path d="M63 110 Q75 108 87 102" {...LINE} strokeWidth="4.5" />
          <path d="M113 102 Q125 108 137 110" {...LINE} strokeWidth="4.5" />
          <path d="M86 142 Q95 152 104 143 Q110 138 116 145" {...LINE} strokeWidth="4" />
          <circle cx="120" cy="150" r="2.6" fill={CRUMB} />
          <circle cx="114" cy="155" r="1.8" fill={CRUMB} />
          <Blush opacity={0.5} />
          <path d="M160 82 C166 92 168 98 163 102 C158 105 153 100 156 93 Z" fill={SWEAT} stroke={MOCHI_OUTLINE} strokeWidth="2.5" />
        </>
      )
    default:
      return (
        <>
          <Eye x={75} y={120} />
          <Eye x={125} y={120} />
          <path d="M91 140 Q100 149 109 140" {...LINE} strokeWidth="4" />
          <Blush opacity={0.55} />
        </>
      )
  }
}

/** Scene props for the full-size pet: sparkles, thought bubble, takeaway box + crumbs. */
export function MochiProps({ mood }) {
  switch (mood) {
    case PET_MOODS.HAPPY:
      return (
        <>
          <Star x={30} y={70} r={10} delay={0} />
          <Star x={176} y={58} r={8} delay={0.5} />
          <Star x={186} y={112} r={6} delay={0.9} />
        </>
      )
    case PET_MOODS.BORED:
      return (
        <>
          <ellipse cx="178" cy="54" rx="26" ry="16" fill="#fff" stroke={MOCHI_OUTLINE} strokeWidth="3" />
          <circle cx="156" cy="78" r="5" fill="#fff" stroke={MOCHI_OUTLINE} strokeWidth="2.5" />
          <circle cx="167" cy="55" r="3" fill={MOCHI_OUTLINE} />
          <circle cx="178" cy="55" r="3" fill={MOCHI_OUTLINE} />
          <circle cx="189" cy="55" r="3" fill={MOCHI_OUTLINE} />
        </>
      )
    case PET_MOODS.MISCHIEVOUS:
      return (
        <>
          <g transform="translate(192 140)">
            <path d="M6 10 Q20 -14 34 10" fill="none" stroke={MOCHI_OUTLINE} strokeWidth="3" />
            <path d="M0 12 L40 12 L35 50 L5 50 Z" fill="#fff" stroke={MOCHI_OUTLINE} strokeWidth="4" strokeLinejoin="round" />
            <path d="M0 12 L-6 4 L12 6 Z M40 12 L46 4 L28 6 Z" fill="#fff" stroke={MOCHI_OUTLINE} strokeWidth="3" strokeLinejoin="round" />
            <rect x="9" y="24" width="22" height="10" rx="2" fill="#e8483f" />
            <path d="M16 12 Q18 0 24 -4 M22 12 Q26 2 30 0" stroke="#e8b04a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
          <circle cx="150" cy="194" r="3" fill={CRUMB} />
          <circle cx="166" cy="198" r="2.2" fill={CRUMB} />
          <circle cx="182" cy="193" r="2.6" fill={CRUMB} />
          <circle cx="40" cy="196" r="2.4" fill={CRUMB} />
          <circle cx="28" cy="191" r="1.8" fill={CRUMB} />
        </>
      )
    default:
      return null
  }
}

function Eye({ x, y, dx = 0 }) {
  return (
    <>
      <ellipse cx={x + dx} cy={y} rx="9" ry="11" fill={MOCHI_OUTLINE} />
      <circle cx={x + dx + 3} cy={y - 4} r="3.6" fill="#fff" />
      <circle cx={x + dx - 3} cy={y + 4} r="1.8" fill="#fff" />
    </>
  )
}

function Blush({ opacity }) {
  return (
    <>
      <ellipse cx="56" cy="140" rx="11" ry="6" fill={BLUSH} opacity={opacity} />
      <ellipse cx="144" cy="140" rx="11" ry="6" fill={BLUSH} opacity={opacity} />
    </>
  )
}

function Star({ x, y, r, delay }) {
  const d = `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`
  return <path className="mochi-sparkle" style={{ animationDelay: `${delay}s` }} d={d} fill={STAR} stroke={MOCHI_OUTLINE} strokeWidth="2" />
}
