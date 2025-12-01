import { useState } from 'react'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
import './DayAssignmentButtons.css'

/**
 * DayAssignmentButtons - FR-014, FR-015: Day-of-week buttons for recipe assignment
 * Hidden for guest users (as per user preference)
 */
function DayAssignmentButtons({ recipe, servings, currentMealType }) {
  const { isAuthenticated } = useAuth()
  const { weekDays, assignRecipe, isRecipeAssigned } = useMealPlan()
  const [loading, setLoading] = useState(null) // Track which day is loading

  // Hidden for guest users
  if (!isAuthenticated) {
    return null
  }

  // Map meal type string to meal ID
  const getMealId = (mealType) => {
    const mealIds = {
      breakfast: 1,
      lunch: 2,
      dinner: 3,
      snacks: 4
    }
    return mealIds[mealType?.toLowerCase()] || 1
  }

  const handleDayClick = async (dateStr) => {
    if (loading) return // Prevent multiple clicks

    setLoading(dateStr)
    try {
      const mealId = getMealId(currentMealType)
      await assignRecipe(recipe.id, dateStr, mealId, servings)
    } catch (error) {
      console.error('Failed to assign recipe:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="day-assignment-buttons">
      {weekDays.map((day) => {
        const isAssigned = isRecipeAssigned(recipe.id, day.date, currentMealType?.toLowerCase())
        const isLoading = loading === day.date

        return (
          <button
            key={day.date}
            className={`day-button ${isAssigned ? 'assigned' : ''} ${day.isToday ? 'today' : ''} ${isLoading ? 'loading' : ''}`}
            onClick={() => handleDayClick(day.date)}
            disabled={isLoading}
            title={`${isAssigned ? 'Remove from' : 'Add to'} ${day.dayName}`}
            aria-label={`${isAssigned ? 'Remove from' : 'Add to'} ${day.dayName} ${day.date}`}
          >
            <span className="day-name">{day.dayName}</span>
            <span className="day-indicator">{isAssigned ? '●' : '○'}</span>
          </button>
        )
      })}
    </div>
  )
}

export default DayAssignmentButtons
