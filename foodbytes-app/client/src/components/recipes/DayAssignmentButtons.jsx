import { useState } from 'react'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
// FR-041: Emojis are only shown in Meal Plan view, NOT on day assignment buttons
import './DayAssignmentButtons.css'

/**
 * DayAssignmentButtons - FR-014, FR-015, FR-037, NFR-016, FR-041, FR-043, FR-050
 * Day-of-week buttons for recipe assignment with swap behavior
 * Hidden for guest users (as per user preference)
 * FR-050: Shows cumulative daily calories above each day button
 *
 * Button States (NFR-016 - Legacy styling):
 * - unselected: No recipe assigned to this slot
 * - selected: THIS recipe is assigned to this slot
 * - already-selected: ANOTHER recipe is assigned (greyed out, clickable for swap)
 *
 * FR-041: Buttons display food emojis themed by meal type
 * FR-043: selectedRecipeId prop allows assigning a variant instead of base recipe
 */
function DayAssignmentButtons({ recipe, servings, currentMealType, selectedRecipeId }) {
  // FR-043: Use selectedRecipeId if provided (for variants), otherwise use recipe.id
  const recipeIdToAssign = selectedRecipeId || recipe.id
  const { isAuthenticated } = useAuth()
  const { weekDays, weekPlan, assignRecipe, isRecipeAssigned, getDailyCalories } = useMealPlan()
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
   * FR-043: Check both base recipe and selected variant
   */
  const getButtonClass = (dateStr) => {
    const mealType = currentMealType?.toLowerCase()

    // FR-043: Check if THIS recipe (or selected variant) is assigned
    if (isRecipeAssigned(recipeIdToAssign, dateStr, mealType)) {
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
   * FR-043: Uses recipeIdToAssign (selected variant or base recipe)
   */
  const handleDayClick = async (dateStr) => {
    if (loading) return // Prevent multiple clicks

    setLoading(dateStr)
    try {
      const mealId = getMealId(currentMealType)
      // FR-043: Use recipeIdToAssign to assign selected variant
      await assignRecipe(recipeIdToAssign, dateStr, mealId, servings)
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
        // FR-050: Get daily calories for calorie preview
        const dailyCalories = getDailyCalories(day.date)

        return (
          <div key={day.date} className="day-container">
            {/* FR-050: Calorie preview above day button */}
            <span className="day-calories">{dailyCalories} cal</span>
            <button
              className={`day-button ${buttonClass}`}
              onClick={() => handleDayClick(day.date)}
              disabled={isLoading}
              title={getButtonTitle(day.date, day.dayName, buttonClass)}
              aria-label={getButtonTitle(day.date, day.dayName, buttonClass)}
            >
              {day.dayName}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default DayAssignmentButtons
