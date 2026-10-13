import { useId } from 'react'
import { MochiBody, MochiFace, MochiGradient, MochiProps } from './mochiParts'
import { PET_MOOD_LABELS } from '../../constants/pet'
import './MochiPet.css'

// The full pet leaves room for props around the body; the mini crops to the body only.
const VIEWBOX = { full: '-30 -6 270 214', mini: '12 4 176 186' }

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
        <MochiGradient id={gradientId} />
      </defs>
      {isFull && <ellipse cx="100" cy="192" rx="66" ry="8" fill="rgba(40,20,80,.13)" />}
      <g className="mochi-anim">
        <MochiBody fill={fill} />
        <MochiFace mood={mood} />
      </g>
      {isFull && <MochiProps mood={mood} />}
    </svg>
  )
}

export default MochiPet
