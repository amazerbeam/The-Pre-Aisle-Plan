import { formatQuantity } from '../../utils/formatQuantity'

/**
 * Tick-off ingredient rows, shared by the recipe view's Ingredients panel and the mobile
 * full-screen list. Ticks are owned by RecipeViewModal so both views stay in step.
 * With `hideTicked`, ticked rows are left out (the caller shows the "n ticked hidden" note).
 */
function IngredientList({ ingredients, scale, ticked, onToggle, hideTicked = false }) {
  const handleKeyDown = (e, idx) => {
    if (e.key !== ' ' && e.key !== 'Enter') return
    e.preventDefault()
    onToggle(idx)
  }

  return (
    <ul className="ilist">
      {ingredients.map((ing, idx) => {
        const isTicked = ticked.has(idx)
        if (hideTicked && isTicked) return null
        return (
          <li
            key={idx}
            role="checkbox"
            aria-checked={isTicked}
            tabIndex={0}
            className={isTicked ? 'on' : ''}
            onClick={() => onToggle(idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            <span className="cb" aria-hidden="true">✓</span>
            <span className="q">{formatQuantity(scale(ing.quantity), ing.unit)} {ing.unit}</span>
            <span className="n">{ing.name}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default IngredientList
