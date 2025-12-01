import { useState } from 'react'
import { useMealPlan } from '../../contexts/MealPlanContext'
import './MealPlanEntry.css'

/**
 * MealPlanEntry - Single recipe entry in the meal plan calendar
 * Shows recipe name, calories, and remove button
 */
function MealPlanEntry({ entry }) {
  const { removeEntry } = useMealPlan()
  const [removing, setRemoving] = useState(false)

  const handleRemove = async () => {
    if (removing) return

    setRemoving(true)
    try {
      await removeEntry(entry.id)
    } catch (error) {
      console.error('Failed to remove entry:', error)
      setRemoving(false)
    }
  }

  return (
    <div className={`meal-plan-entry ${removing ? 'removing' : ''}`}>
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
  )
}

export default MealPlanEntry
