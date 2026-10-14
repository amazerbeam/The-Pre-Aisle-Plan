import { PET_MOOD_LABELS } from '../../../constants/pet'
import { PIP_DEFAULT_FORM, PIP_FORM_NAMES } from '../../../constants/pipGrowth'
import { HERB_FULL_VIEWBOX, herbForm } from './herbForms'
import PipHerbFigure from './PipHerbFigure'
import './PipHerb.css'

/**
 * MPP-31 AC 6 / AC 10: Pip as a standalone <svg>, replacing MPP-14's first pet. `full` keeps room
 * for mood props; `mini` (footer tab) and `crop` (Dress Pip cards / lineup) are decorative.
 * MPP-32: `outfit` dresses him; `viewBox` overrides the crop (item cards, the hat-only footer tab);
 * `still` stops the idle animation.
 */
function PipHerb({ form = PIP_DEFAULT_FORM, mood, wilted = false, variant = 'full', outfit = null, viewBox = null, still = false, className = '' }) {
  const isFull = variant === 'full'
  const a11y = isFull
    ? { role: 'img', 'aria-label': `${PIP_FORM_NAMES[form] ?? PIP_FORM_NAMES[PIP_DEFAULT_FORM]}, ${PET_MOOD_LABELS[mood]}` }
    : { 'aria-hidden': true, focusable: 'false' }

  return (
    <svg
      className={`pip-herb pip-herb--${variant} ${className}`.trim()}
      viewBox={viewBox ?? (isFull ? HERB_FULL_VIEWBOX : herbForm(form).miniViewBox)}
      xmlns="http://www.w3.org/2000/svg"
      {...a11y}
    >
      <PipHerbFigure form={form} mood={mood} wilted={wilted} showProps={isFull} outfit={outfit} still={still} />
    </svg>
  )
}

export default PipHerb
