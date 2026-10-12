import { useId } from 'react'
import { MochiFace, MochiProps, MOCHI_FILL, MOCHI_OUTLINE, MOCHI_SHADE } from './mochiParts'
import { PET_MOOD_LABELS } from '../../constants/pet'
import './MochiPet.css'

// The full pet leaves room for props around the body; the mini crops to the body only.
const VIEWBOX = { full: '-30 -6 270 214', mini: '12 4 176 186' }
const BODY_STROKE = { stroke: MOCHI_OUTLINE, strokeWidth: 5, strokeLinejoin: 'round' }

/**
 * MPP-14: Mochi, the approved kawaii lavender blob (AC 5). `full` is the Pet page
 * pet with scene props; `mini` is the decorative face used in the footer tab and the
 * eaten-section reaction. The body path is identical in every mood (AC 9).
 */
function MochiPet({ mood, variant = 'full', className = '' }) {
  // useId keeps the gradient id unique when several pets are on screen at once.
  const gradientId = `mochi-fill-${useId().replace(/:/g, '')}`
  const isFull = variant === 'full'
  const fill = `url(#${gradientId})`
  const a11y = isFull
    ? { role: 'img', 'aria-label': `Mochi, ${PET_MOOD_LABELS[mood]}` }
    : { 'aria-hidden': true, focusable: 'false' }

  return (
    <svg
      className={`mochi-pet mochi-pet--${variant} mochi-mood-${mood} ${className}`.trim()}
      viewBox={VIEWBOX[variant]}
      xmlns="http://www.w3.org/2000/svg"
      {...a11y}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MOCHI_FILL} />
          <stop offset="1" stopColor={MOCHI_SHADE} />
        </linearGradient>
      </defs>
      {isFull && <ellipse cx="100" cy="192" rx="66" ry="8" fill="rgba(40,20,80,.13)" />}
      <g className="mochi-anim">
        <ellipse cx="74" cy="180" rx="15" ry="8" fill={fill} {...BODY_STROKE} />
        <ellipse cx="126" cy="180" rx="15" ry="8" fill={fill} {...BODY_STROKE} />
        <path
          d="M100 48 C152 48 182 86 182 128 C182 166 148 182 100 182 C52 182 18 166 18 128 C18 86 48 48 100 48Z"
          fill={fill}
          {...BODY_STROKE}
        />
        <ellipse cx="66" cy="82" rx="16" ry="8" transform="rotate(-30 66 82)" fill="#fff" opacity=".45" />
        <MochiFace mood={mood} />
      </g>
      {isFull && <MochiProps mood={mood} />}
    </svg>
  )
}

export default MochiPet
