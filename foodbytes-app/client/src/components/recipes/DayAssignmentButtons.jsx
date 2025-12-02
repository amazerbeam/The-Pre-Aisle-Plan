import { useState } from 'react'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
// FR-041: Emojis are only shown in Meal Plan view, NOT on day assignment buttons
import './DayAssignmentButtons.css'

/**
 * DayAssignmentButtons - FR-014, FR-015, FR-037, NFR-016, FR-041
 * Day-of-week buttons for recipe assignment with swap behavior
 * Hidden for guest users (as per user preference)
 *
 * Button States (NFR-016 - Legacy styling):
 * - unselected: No recipe assigned to this slot
 * - selected: THIS recipe is assigned to this slot
 * - already-selected: ANOTHER recipe is assigned (greyed out, clickable for swap)
 *
 * FR-041: Buttons display food emojis themed by meal type
 */
function DayAssignmentButtons({ recipe, servings, currentMealType }) {
  const { isAuthenticated } = useAuth()
  const { weekDays, weekPlan, assignRecipe, isRecipeAssigned } = useMealPlan()
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

  /**
   * FR-037: Determine button class based on slot state
   * - 'selected': This recipe is assigned to this day/meal
   * - 'already-selected': Another recipe is assigned (greyed out)
   * - 'unselected': Slot is available
   */
  const getButtonClass = (dateStr) => {
    const mealType = currentMealType?.toLowerCase()

    // Check if THIS recipe is assigned
    if (isRecipeAssigned(recipe.id, dateStr, mealType)) {
      return 'selected'
    }

    // Check if ANOTHER recipe is assigned to this slot
    if (weekPlan && weekPlan.days) {
      const day = weekPlan.days.find(d => d.date === dateStr)
      if (day && day.mealsByType) {
        const entries = day.mealsByType[mealType] || []
        if (entries.length > 0) {
          return 'already-selected'
        }
      }
    }

    return 'unselected'
  }

  /**
   * FR-037: Handle day click with swap behavior
   * - If unselected: Assign this recipe
   * - If selected: Remove this recipe (toggle)
   * - If already-selected: Replace with this recipe (swap - no confirmation)
   */
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

  /**
   * Get title/tooltip based on button state
   */
  const getButtonTitle = (dateStr, dayName, buttonClass) => {
    switch (buttonClass) {
      case 'selected':
        return `Remove from ${dayName}`
      case 'already-selected':
        return `Replace meal on ${dayName}`
      default:
        return `Add to ${dayName}`
    }
  }

  return (
    <div className="day-buttons">
      {weekDays.map((day) => {
        const buttonClass = getButtonClass(day.date)
        const isLoading = loading === day.date
        // FR-041: NO emojis on day buttons - emojis only appear in Meal Plan view

        return (
          <button
            key={day.date}
            className={`day-button ${buttonClass}`}
            onClick={() => handleDayClick(day.date)}
            disabled={isLoading}
            title={getButtonTitle(day.date, day.dayName, buttonClass)}
            aria-label={getButtonTitle(day.date, day.dayName, buttonClass)}
          >
            {day.dayName}
          </button>
        )
      })}
    </div>
  )
}

export default DayAssignmentButtons
