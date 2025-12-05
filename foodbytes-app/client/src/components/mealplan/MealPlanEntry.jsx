import { useState } from 'react'
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
        className={`meal-plan-entry ${removing ? 'removing' : ''}`}
        onClick={handleEntryClick}
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

      {/* FR-014: Recipe View Modal */}
      {showRecipeView && entry.recipe && (
        <RecipeViewModal
          recipe={entry.recipe}
          servings={entry.servings}
          caloriesPerServing={entry.caloriesPerServing}
          onClose={() => setShowRecipeView(false)}
        />
      )}
    </>
  )
}

export default MealPlanEntry
