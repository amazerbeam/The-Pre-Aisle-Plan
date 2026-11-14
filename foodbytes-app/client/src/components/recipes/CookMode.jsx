import { useEffect, useRef, useState } from 'react'
import { formatQuantity } from '../../utils/formatQuantity'
import { ingredientsForStep, stepDisplayText } from '../../utils/cookModeUtils'
import './CookMode.css'

/**
 * Full-screen cook mode inside the recipe view: one big step at a time, the ingredients that step
 * names, and large Back / Next buttons. The modal keeps the screen awake while it is open.
 * onExit(index, finished): Exit passes the step on screen; Finish passes the last step with true.
 */
function CookMode({ recipeName, steps, ingredients, scale, isHomemade, startIndex, onExit }) {
  const lastIndex = steps.length - 1
  const [index, setIndex] = useState(Math.min(Math.max(startIndex, 0), lastIndex))
  const nextRef = useRef(null)

  const isLast = index >= lastIndex
  const goBack = () => setIndex((i) => Math.max(0, i - 1))
  const goNext = () => {
    if (isLast) onExit(lastIndex, true)
    else setIndex(index + 1)
  }

  useEffect(() => { nextRef.current?.focus() }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onExit(index, false)
      else if (e.key === 'ArrowLeft') goBack()
      else if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  })

  const text = stepDisplayText(steps[index], isHomemade)
  const uses = ingredientsForStep(text, ingredients)

  return (
    <div className="cook" role="dialog" aria-modal="true" aria-label={`Cook mode: ${recipeName}`}>
      <div className="cook-top">
        <b>{recipeName}</b>
        <button type="button" onClick={() => onExit(index, false)}>✕ Exit</button>
      </div>
      <div className="cook-dots" aria-hidden="true">
        {steps.map((_, i) => <i key={i} className={i <= index ? 'f' : ''} />)}
      </div>
      <div className="cook-main" aria-live="polite">
        <div className="cook-k">Step {index + 1} of {steps.length} · screen stays on</div>
        <div className="cook-s">{text}</div>
        {uses.length > 0 && (
          <div className="cook-uses">
            {uses.map((ing, i) => (
              <span key={i}>{formatQuantity(scale(ing.quantity), ing.unit)} {ing.unit} {ing.name}</span>
            ))}
          </div>
        )}
      </div>
      <div className="cook-nav">
        <button type="button" className="cook-prev" onClick={goBack} disabled={index === 0}>← Back</button>
        <button type="button" className="cook-next" ref={nextRef} onClick={goNext}>
          {isLast ? 'Finish ✓' : 'Next step →'}
        </button>
      </div>
    </div>
  )
}

export default CookMode
