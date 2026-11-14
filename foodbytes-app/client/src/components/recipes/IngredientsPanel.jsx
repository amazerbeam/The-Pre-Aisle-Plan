import { useState } from 'react'
import { formatQuantity } from '../../utils/formatQuantity'

/**
 * Recipe view ingredient column: scaled quantities (fractions for spoons and counts) with
 * tick-off rows. Ticks are screen-only and reset with the displayed recipe (the modal keys this
 * component on the recipe id). `children` is the slot for the extras panel.
 */
function IngredientsPanel({ ingredients, scale, servings, children }) {
  const [ticked, setTicked] = useState(() => new Set())

  const toggle = (idx) => setTicked((prev) => {
    const next = new Set(prev)
    if (next.has(idx)) next.delete(idx)
    else next.add(idx)
    return next
  })

  const handleKeyDown = (e, idx) => {
    if (e.key !== ' ' && e.key !== 'Enter') return
    e.preventDefault()
    toggle(idx)
  }

  return (
    <section className="rv-col ingredients-panel">
      <h3>
        Ingredients
        <small>for {servings} {servings === 1 ? 'person' : 'people'}</small>
      </h3>
      {ingredients && ingredients.length > 0 ? (
        <ul className="ilist">
          {ingredients.map((ing, idx) => (
            <li
              key={idx}
              role="checkbox"
              aria-checked={ticked.has(idx)}
              tabIndex={0}
              className={ticked.has(idx) ? 'on' : ''}
              onClick={() => toggle(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
            >
              <span className="cb" aria-hidden="true">✓</span>
              <span className="q">{formatQuantity(scale(ing.quantity), ing.unit)} {ing.unit}</span>
              <span className="n">{ing.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-content">No ingredients listed</p>
      )}
      {children}
    </section>
  )
}

export default IngredientsPanel
