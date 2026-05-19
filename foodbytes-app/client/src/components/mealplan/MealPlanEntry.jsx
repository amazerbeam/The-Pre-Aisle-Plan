import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useMealPlan } from '../../contexts/MealPlanContext'
import RecipeViewModal from '../recipes/RecipeViewModal'
import './MealPlanEntry.css'

/**
 * MealPlanEntry - Single recipe entry in the meal plan calendar
 * Shows recipe name, calories, and remove button
 * FR-014: Click on entry to view recipe fullscreen
 */
function MealPlanEntry({ entry }) {
  const { removeEntry } = useMealPlan()
  const [removing, setRemoving] = useState(false)
  // FR-014: State for recipe view modal
  const [showRecipeView, setShowRecipeView] = useState(false)
  const [tooltipPos, setTooltipPos] = useState(null)
  const entryRef = useRef(null)

  const protein = entry.proteinPerServing ?? 0
  const carbs = entry.carbsPerServing ?? 0
  const fat = entry.fatPerServing ?? 0

  const handleMouseEnter = () => {
    const el = entryRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setTooltipPos({
      left: rect.left + rect.width / 2,
      top: rect.top,
      bottom: rect.bottom
    })
  }
  const handleMouseLeave = () => setTooltipPos(null)

  const handleRemove = async (e) => {
    e.stopPropagation() // Prevent opening modal when removing
    if (removing) return

    setRemoving(true)
    try {
      await removeEntry(entry.id)
    } catch (error) {
      console.error('Failed to remove entry:', error)
      setRemoving(false)
    }
  }

  // FR-014: Handle click on entry to open recipe view
  const handleEntryClick = () => {
    if (!removing && entry.recipe) {
      setShowRecipeView(true)
    }
  }

  return (
    <>
      <div
        ref={entryRef}
        className={`meal-plan-entry ${removing ? 'removing' : ''}`}
        onClick={handleEntryClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleEntryClick()}
      >
        <div className="entry-info">
          <span className="recipe-name">{entry.recipe?.name}</span>
          <span className="recipe-calories">{entry.caloriesPerServing} cal</span>
        </div>
        <button
          className="remove-btn"
          onClick={handleRemove}
          disabled={removing}
          title="Remove from meal plan"
          aria-label={`Remove ${entry.recipe?.name} from meal plan`}
        >
          ×
        </button>
      </div>

      {tooltipPos && createPortal(
        <div
          className="meal-entry-tooltip"
          style={{ left: tooltipPos.left, top: tooltipPos.top }}
          role="tooltip"
        >
          <div className="meal-entry-tooltip-name">{entry.recipe?.name}</div>
          <div className="meal-entry-tooltip-cal">{entry.caloriesPerServing} cal</div>
          <div className="meal-entry-tooltip-macros">
            <span className="macro-p"><strong>{protein}g</strong> P</span>
            <span className="macro-c"><strong>{carbs}g</strong> C</span>
            <span className="macro-f"><strong>{fat}g</strong> F</span>
          </div>
        </div>,
        document.body
      )}

      {/* FR-013/FR-014/FR-102: Recipe View Modal with on-demand loading */}
      {showRecipeView && entry.recipe?.id && (
        <RecipeViewModal
          recipeId={entry.recipe.id}
          recipeName={entry.recipe.name}
          servings={entry.servings}
          caloriesPerServing={entry.caloriesPerServing}
          isCheat={entry.recipe.isCheat}
          hasExtras={entry.recipe.hasExtras}
          onClose={() => setShowRecipeView(false)}
          variants={entry.recipe.variants}
          parentRecipeId={entry.recipe.id}
          onSelectVariant={(variantId, servings) => {
            // FR-013: In meal plan view, variant selection updates display only
            // (recipe swap would require updating the meal plan entry)
            console.log('Variant selected in modal:', variantId, servings)
          }}
        />
      )}
    </>
  )
}

export default MealPlanEntry
