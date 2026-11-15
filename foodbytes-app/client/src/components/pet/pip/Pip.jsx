import { PET_MOOD_LABELS } from '../../../constants/pet'
import { PIP_DEFAULT_FORM } from '../../../constants/pipGrowth'
import { PIP_DEFAULT_LINE, formName } from '../../../constants/pipLines'
import { pipForm } from './lineForms'
import { PIP_FULL_VIEWBOX } from './pipSpace'
import PipFigure from './PipFigure'
import './Pip.css'

/**
 * Pip as a standalone <svg> in the active line. `full` keeps room for mood props; `mini` (footer
 * tab) and `crop` (Dress Pip cards / lineup) are decorative. `viewBox` overrides the crop; `still`
 * stops the idle animation.
 */
function Pip({ line = PIP_DEFAULT_LINE, form = PIP_DEFAULT_FORM, mood, wilted = false, variant = 'full', outfit = null, viewBox = null, still = false, className = '' }) {
  const isFull = variant === 'full'
  const a11y = isFull
    ? { role: 'img', 'aria-label': `${formName(line, form)}, ${PET_MOOD_LABELS[mood]}` }
    : { 'aria-hidden': true, focusable: 'false' }

  return (
    <svg
      className={`pip-herb pip-herb--${variant} ${className}`.trim()}
      viewBox={viewBox ?? (isFull ? PIP_FULL_VIEWBOX : pipForm(line, form).miniViewBox)}
      xmlns="http://www.w3.org/2000/svg"
      {...a11y}
    >
      <PipFigure line={line} form={form} mood={mood} wilted={wilted} showProps={isFull} outfit={outfit} still={still} />
    </svg>
  )
}

export default Pip
