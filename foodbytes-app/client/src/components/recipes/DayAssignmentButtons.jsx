import { useState, useEffect } from 'react'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
import { recipeService } from '../../services/recipeService'
import ExtrasSelectionPopup from './ExtrasSelectionPopup'
import { MEAL_SLOTS, SNACKS_SLOT } from '../../constants/mealPlanUi'
import { slotEntryFor } from '../../utils/recipeCatalogueUtils'
// FR-041: Emojis are only shown in Meal Plan view, NOT on day assignment buttons
import './DayAssignmentButtons.css'

/**
 * DayAssignmentButtons - FR-014, FR-015, FR-037, NFR-016, FR-041, FR-043, FR-050, FR-087, FR-098
 * Day-of-week buttons for recipe assignment with swap behavior
 * Hidden for guest users (as per user preference)
 * FR-050 (daily calories on each day button) was removed by the Meal Plan / Recipes redesign:
 * the buttons show the day name only. With `pickDate` set (picking mode) the 7 buttons collapse to one
 * "Add to {Day}" button for that date; `onAssigned(dateStr)` fires after a real assign (not a toggle-off).
 * FR-087: Shows extras selection popup for recipes with linked extras
 * FR-098: Optimistic UI - no loading state, instant feedback
 *
 * Button States (NFR-016 - Legacy styling):
 * - unselected: No recipe assigned to this slot
 * - selected: THIS recipe is assigned to this slot
 * - already-selected: ANOTHER recipe is assigned (greyed out, clickable for swap)
 *
 * FR-041: Buttons display food emojis themed by meal type
 * FR-043: selectedRecipeId prop allows assigning a variant instead of base recipe
 */
function DayAssignmentButtons({ recipe, servings, currentMealType, selectedRecipeId, pickDate = null, onAssigned }) {
  // FR-043: Use selectedRecipeId if provided (for variants), otherwise use recipe.id
  const recipeIdToAssign = selectedRecipeId || recipe.id
  const { isAuthenticated } = useAuth()
  const { weekDays, weekPlan, assignRecipe, isRecipeAssigned } = useMealPlan()
  // FR-098: Removed loading state - using optimistic UI instead

  // FR-087: State for extras popup
  const [showExtrasPopup, setShowExtrasPopup] = useState(false)
  const [pendingDate, setPendingDate] = useState(null) // Date waiting for popup confirmation
  const [extrasData, setExtrasData] = useState(null) // Fetched extras hierarchy
  const [pendingInitialSelections, setPendingInitialSelections] = useState(undefined) // MPP-10

  // Hidden for guest users
  if (!isAuthenticated) {
    return null
  }

  // Map meal type string to meal ID
  const getMealId = (mealType) =>
    [...MEAL_SLOTS, SNACKS_SLOT].find((s) => s.key === mealType?.toLowerCase())?.mealId ?? 1

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
   * FR-087, FR-098: Perform the actual recipe assignment with optimistic UI
   */
  const performAssignment = (dateStr, extraChoices = null, isToggleOff = false) => {
    const mealId = getMealId(currentMealType)
    // FR-043: Use recipeIdToAssign to assign selected variant
    // FR-098: Pass recipe data for optimistic calorie calculation
    // MPP-10: extraChoices from the popup are stored server-side with the assign
    assignRecipe(recipeIdToAssign, dateStr, mealId, servings, recipe, extraChoices)
    if (!isToggleOff) onAssigned?.(dateStr)
  }

  /** MPP-10: when the slot holds a sibling variant, pre-fill the popup with that meal's own choices. */
  const getSiblingSlotChoices = (dateStr) => {
    const day = weekPlan?.days?.find((d) => d.date === dateStr)
    const existing = day?.mealsByType?.[currentMealType?.toLowerCase()]?.[0]
    const isSibling = existing && recipe.variants?.some((v) => v.recipeId === existing.recipe?.id)
    return isSibling ? existing.extraChoices : undefined
  }

  /**
   * FR-037, FR-087, FR-098: Handle day click with swap behavior and extras popup
   * - If recipe has extras: Show popup first, then assign after confirmation
   * - If unselected: Assign this recipe
   * - If selected: Remove this recipe (toggle)
   * - If already-selected: Replace with this recipe (swap - no confirmation)
   * FR-043: Uses recipeIdToAssign (selected variant or base recipe)
   * FR-098: No loading check - optimistic UI handles instantly
   */
  const handleDayClick = async (dateStr) => {
    // Check if this is a toggle off (already selected) - no popup needed
    const buttonClass = getButtonClass(dateStr)
    if (buttonClass === 'selected') {
      // Toggle off - remove recipe, no popup needed
      performAssignment(dateStr, null, true)
      return
    }

    // FR-087: Check if recipe has extras - show popup if yes
    if (recipe.hasExtras) {
      // Fetch extras hierarchy if not already loaded
      if (!extrasData || extrasData.parentRecipeId !== recipeIdToAssign) {
        try {
          const data = await recipeService.getRecipeExtras(recipeIdToAssign)
          setExtrasData(data)
        } catch (error) {
          console.error('Failed to fetch extras:', error)
          // If fetch fails, proceed without popup
          performAssignment(dateStr)
          return
        }
      }

      // Show popup
      setPendingInitialSelections(getSiblingSlotChoices(dateStr))
      setPendingDate(dateStr)
      setShowExtrasPopup(true)
      return
    }

    // No extras - assign directly
    performAssignment(dateStr)
  }

  /**
   * FR-087: Handle popup confirmation - save selections and assign recipe
   */
  const handleExtrasConfirm = async (selections) => {
    setShowExtrasPopup(false)

    if (pendingDate) {
      // MPP-10: the popup refreshes the local default cache; the server stores the choices with the assign
      await performAssignment(pendingDate, selections, getButtonClass(pendingDate) === 'selected')
      setPendingDate(null)
    }
    setPendingInitialSelections(undefined)
  }

  /**
   * FR-087: Handle popup cancel - close without assigning
   */
  const handleExtrasCancel = () => {
    setShowExtrasPopup(false)
    setPendingDate(null)
    setPendingInitialSelections(undefined)
  }

  /**
   * Get title/tooltip based on button state
   */
  const getButtonTitle = (dateStr, dayName, buttonClass) => {
    switch (buttonClass) {
      case 'selected':
        return `Remove from ${dayName}`
      case 'already-selected':
        return `Replace ${slotEntryFor(weekPlan, dateStr, currentMealType?.toLowerCase())?.recipe?.name} on ${dayName}`
      default:
        return `Add to ${dayName}`
    }
  }

  // Picking mode: one full-width button for the chosen date
  const renderPickButton = () => {
    const buttonClass = getButtonClass(pickDate)
    const dayName = weekDays.find((d) => d.date === pickDate)?.dayName
      ?? new Date(`${pickDate}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short' })
    const dayNumber = Number(pickDate.slice(8, 10))
    const label = buttonClass === 'selected' ? `✓ On ${dayName}`
      : `${buttonClass === 'already-selected' ? 'Replace on' : 'Add to'} ${dayName} ${dayNumber}`
    const title = getButtonTitle(pickDate, dayName, buttonClass)
    return (
      <button
        type="button"
        className={`pick-btn ${buttonClass}`}
        onClick={() => handleDayClick(pickDate)}
        title={title}
        aria-label={title}
        aria-pressed={buttonClass === 'selected'}
      >
        {label}
      </button>
    )
  }

  // Build recipe object with extras for popup
  const recipeWithExtras = extrasData ? {
    ...recipe,
    extras: extrasData.extras
  } : recipe

  return (
    <>
      {pickDate ? renderPickButton() : (
        <div className="days-grid">
          {weekDays.map((day) => {
            const buttonClass = getButtonClass(day.date)
            const title = getButtonTitle(day.date, day.dayName, buttonClass)

            return (
              <button
                key={day.date}
                type="button"
                className={`day-btn ${buttonClass}`}
                onClick={() => handleDayClick(day.date)}
                title={title}
                aria-label={title}
                aria-pressed={buttonClass === 'selected'}
              >
                <span className="day-btn-face">{day.dayName}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* FR-087: Extras selection popup */}
      {showExtrasPopup && extrasData && (
        <ExtrasSelectionPopup
          recipe={recipeWithExtras}
          servings={servings}
          initialSelections={pendingInitialSelections}
          onConfirm={handleExtrasConfirm}
          onCancel={handleExtrasCancel}
        />
      )}
    </>
  )
}

export default DayAssignmentButtons
