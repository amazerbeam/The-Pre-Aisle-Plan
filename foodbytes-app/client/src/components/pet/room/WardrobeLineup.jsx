import { useState } from 'react'
import { PET_MOODS } from '../../../constants/pet'
import { PIP_FORMS, PIP_FORM_NAMES } from '../../../constants/pipGrowth'
import { WARDROBE_LINEUP_TITLE, WARDROBE_UNREACHED_LABEL } from '../../../constants/pipWardrobe'
import PipHerb from '../herb/PipHerb'

/**
 * MPP-32 AC 4: "Same outfit, every evolution" — the outfit on all five forms. Forms above the
 * highest one reached (peakForm) are silhouettes; a form reached and then lost shows normally.
 */
function WardrobeLineup({ outfit, currentForm, peakForm }) {
  const [open, setOpen] = useState(false)
  return (
    <details className="pip-wardrobe-lineup" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{WARDROBE_LINEUP_TITLE}</summary>
      {open && (
        <ol className="pip-wardrobe-forms">
          {Object.values(PIP_FORMS).map(form => {
            const reached = form <= peakForm
            const className = ['pip-wardrobe-form', !reached && 'is-unreached', form === currentForm && 'is-current'].filter(Boolean).join(' ')
            return (
              <li key={form} className={className}>
                <PipHerb form={form} mood={PET_MOODS.CONTENT} variant="crop" outfit={outfit} still />
                <span>{reached ? PIP_FORM_NAMES[form] : WARDROBE_UNREACHED_LABEL}</span>
              </li>
            )
          })}
        </ol>
      )}
    </details>
  )
}

export default WardrobeLineup
