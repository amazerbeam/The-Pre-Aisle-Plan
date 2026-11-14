import { VARIANT_ORDER } from '../../constants/recipesUi'
import './RecipeCard.css'

/** Known labels by VARIANT_ORDER position; unknown labels go last, in displayOrder order. */
function sortVariants(variants) {
  const rank = (v) => {
    const i = VARIANT_ORDER.indexOf(v.variantLabel)
    return i === -1 ? VARIANT_ORDER.length : i
  }
  return [...variants].sort((a, b) => rank(a) - rank(b) || (a.displayOrder || 0) - (b.displayOrder || 0))
}

/**
 * Light / Moderate / Balanced as a three-way segmented control showing per-serving kcal.
 * A recipe with fewer than two variants shows its single kcal figure instead.
 */
function VariantSegment({ variants, selectedId, onSelect, fallbackKcal }) {
  if (variants.length < 2) {
    return <p className="variant-single"><b>{fallbackKcal} kcal</b> per serving</p>
  }

  const sorted = sortVariants(variants)
  const hasChecked = sorted.some((v) => v.recipeId === selectedId)

  const handleKeyDown = (e, index) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = sorted[(index + step + sorted.length) % sorted.length]
    onSelect(next.recipeId)
    e.currentTarget.parentElement.querySelectorAll('[role="radio"]')[sorted.indexOf(next)]?.focus()
  }

  return (
    <div className="variant-seg" role="radiogroup" aria-label="Variant">
      {sorted.map((v, i) => {
        const checked = v.recipeId === selectedId
        return (
          <button
            key={v.recipeId}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked || (i === 0 && !hasChecked) ? 0 : -1}
            className={checked ? 'on' : ''}
            onClick={() => onSelect(v.recipeId)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {v.variantLabel}
            <b>{v.caloriesPerServing}</b>
          </button>
        )
      })}
    </div>
  )
}

export default VariantSegment
