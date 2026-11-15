import { useEffect, useRef, useState } from 'react'
import { MIN_SERVINGS, MAX_SERVINGS, SERVINGS_STEP } from '../../constants/servings'
import { formatServings } from '../../utils/servingsUtils'
import IngredientList from './IngredientList'
import './IngredientsFullscreen.css'

/**
 * Mobile-only full-screen ingredient list inside the recipe view (like CookMode): big rows,
 * progress, Hide ticked and a servings stepper. Ticks and servings are the modal's own, so the
 * normal list matches on return. Hide ticked is a per-visit view toggle, off each time it opens.
 * ⤡ Done or Escape closes it.
 */
function IngredientsFullscreen({
  recipeName, ingredients, scale, ticked, onToggle, servings, onServings, screenOn, onClose
}) {
  const [hideTicked, setHideTicked] = useState(false)
  const doneRef = useRef(null)

  useEffect(() => { doneRef.current?.focus() }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const total = ingredients.length
  const done = ingredients.reduce((n, _, idx) => n + (ticked.has(idx) ? 1 : 0), 0)
  const allDone = total > 0 && done === total
  const hiddenCount = hideTicked ? done : 0
  const people = servings === 1 ? 'person' : 'people'
  const step = (delta) => onServings(Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, servings + delta)))

  return (
    <div className="ifull" role="dialog" aria-modal="true" aria-label={`Ingredients, full screen: ${recipeName}`}>
      <div className="ifull-head">
        <div className="ifull-top">
          <div className="ifull-title">
            <small>Ingredients</small>
            <b>{recipeName}</b>
          </div>
          <button type="button" className="ifull-done" ref={doneRef} onClick={onClose} aria-label="Back to recipe">
            <span aria-hidden="true">⤡</span> Done
          </button>
        </div>
        <div className="ifull-bar">
          <div
            className="ifull-prog"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
            aria-label="Ingredients ticked"
          >
            <i style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </div>
          <span className="ifull-count" aria-live="polite">{allDone ? 'All out ✓' : `${done} of ${total}`}</span>
        </div>
      </div>

      <div className="ifull-tools">
        <button
          type="button"
          className={`ifull-pill ${hideTicked ? 'on' : ''}`}
          aria-pressed={hideTicked}
          onClick={() => setHideTicked(!hideTicked)}
        >
          {hideTicked ? '👁 Show ticked' : '🙈 Hide ticked'}
        </button>
        {screenOn && <span className="ifull-wake">🔆 Screen on</span>}
        <div className="ifull-srv">
          <button type="button" onClick={() => step(-SERVINGS_STEP)} aria-label="Fewer servings">−</button>
          <span aria-live="polite"><b>{formatServings(servings)}</b> {people}</span>
          <button type="button" onClick={() => step(SERVINGS_STEP)} aria-label="More servings">+</button>
        </div>
      </div>

      <div className="ifull-body">
        <IngredientList
          ingredients={ingredients}
          scale={scale}
          ticked={ticked}
          onToggle={onToggle}
          hideTicked={hideTicked}
        />
        {hiddenCount > 0 && <p className="ifull-note">{hiddenCount} ticked hidden</p>}
        {allDone && <div className="ifull-all">Everything&apos;s out. Time to cook 🍳</div>}
      </div>
    </div>
  )
}

export default IngredientsFullscreen
