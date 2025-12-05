import { useEffect } from 'react'
import './RecipeViewModal.css'

/**
 * FR-014: RecipeViewModal - Fullscreen read-only recipe view
 * Opens when clicking on a recipe in the meal plan calendar
 */
function RecipeViewModal({ recipe, servings, caloriesPerServing, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!recipe) return null

  // Scale quantity based on servings vs default servings
  const scaleQuantity = (originalQty) => {
    const scaled = (originalQty / recipe.defaultServings) * servings
    return Number.isInteger(scaled) ? scaled : scaled.toFixed(2)
  }

  return (
    <div className="recipe-view-overlay" onClick={onClose}>
      <div className="recipe-view-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="recipe-view-header">
          <div className="header-content">
            <h2 className="recipe-title">{recipe.name}</h2>
            <div className="recipe-meta">
              <span className="calories-badge">{caloriesPerServing} cal/serving</span>
              <span className="servings-badge">{servings} serving{servings !== 1 ? 's' : ''}</span>
              {recipe.isCheat && <span className="cheat-badge">Cheat</span>}
            </div>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close recipe view"
          >
            ×
          </button>
        </header>

        {/* Content */}
        <div className="recipe-view-content">
          {/* Ingredients */}
          <section className="ingredients-section">
            <h3>Ingredients</h3>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <ul className="ingredients-list">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="ingredient-item">
                    <span className="ingredient-quantity">{scaleQuantity(ing.quantity)}</span>
                    <span className="ingredient-unit">{ing.unit}</span>
                    <span className="ingredient-name">{ing.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-content">No ingredients listed</p>
            )}
          </section>

          {/* Steps */}
          <section className="steps-section">
            <h3>Instructions</h3>
            {recipe.steps && recipe.steps.length > 0 ? (
              <ol className="steps-list">
                {recipe.steps.map((step, idx) => (
                  <li key={idx} className="step-item">{step}</li>
                ))}
              </ol>
            ) : (
              <p className="no-content">No instructions listed</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default RecipeViewModal
