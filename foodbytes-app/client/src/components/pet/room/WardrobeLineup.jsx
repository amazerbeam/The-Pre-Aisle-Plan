import { useState } from 'react'
import { PET_MOODS } from '../../../constants/pet'
import { formName } from '../../../constants/pipLines'
import { WARDROBE_LINEUP_TITLE, WARDROBE_UNREACHED_LABEL } from '../../../constants/pipWardrobe'
import { lineFormCount } from '../pip/lineForms'
import Pip from '../pip/Pip'

/**
 * MPP-32 AC 4: "Same outfit, every evolution" — the outfit on every form of the active line's forms; forms above
 * the line's peak form are silhouettes.
 */
function WardrobeLineup({ outfit, line, currentForm, peakForm }) {
  const [open, setOpen] = useState(false)
  return (
    <details className="pip-wardrobe-lineup" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{WARDROBE_LINEUP_TITLE}</summary>
      {open && (
        <ol className="pip-wardrobe-forms">
          {Array.from({ length: lineFormCount(line) }, (_, i) => i + 1).map(form => {
            const reached = form <= peakForm
            const className = ['pip-wardrobe-form', !reached && 'is-unreached', form === currentForm && 'is-current'].filter(Boolean).join(' ')
            return (
              <li key={form} className={className}>
                <Pip line={line} form={form} mood={PET_MOODS.CONTENT} variant="crop" outfit={outfit} still />
                <span>{reached ? formName(line, form) : WARDROBE_UNREACHED_LABEL}</span>
              </li>
            )
          })}
        </ol>
      )}
    </details>
  )
}

export default WardrobeLineup
