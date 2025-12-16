import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import mealPlanService from '../services/mealPlanService'
import { getTodayISO, addDays, formatDateISO, getWeekDays } from '../utils/dateUtils'

const MealPlanContext = createContext()

// Map meal type string to meal ID
const MEAL_TYPE_MAP = {
  breakfast: 1,
  lunch: 2,
  dinner: 3,
  snacks: 4,
  extras: 5
}

const MEAL_ID_TO_TYPE = {
  1: 'breakfast',
  2: 'lunch',
  3: 'dinner',
  4: 'snacks',
  5: 'extras'
}

/**
 * MealPlanProvider - Manages global meal plan state
 * Supports FR-007 (date range), FR-014 (assign), FR-015 (remove), FR-016 (calendar), FR-017 (calories)
 * FR-098: Optimistic UI updates for instant feedback
 */
export const MealPlanProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()

  // FR-007: Date range state
  const [startDate, setStartDateState] = useState(getTodayISO())
  const [endDate, setEndDate] = useState(formatDateISO(addDays(new Date(), 6)))
  const [weekDays, setWeekDays] = useState(getWeekDays(getTodayISO()))

  // Meal plan entries
  const [weekPlan, setWeekPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // FR-098: Assignment error state for optimistic UI rollback feedback
  const [assignmentError, setAssignmentError] = useState(null)

  // Track pending operations to prevent duplicate requests
  const pendingOperations = useRef(new Set())

  /**
   * FR-007: Update start date and recalculate week
   */
  const setStartDate = useCallback((newStartDate) => {
    setStartDateState(newStartDate)
    setEndDate(formatDateISO(addDays(newStartDate, 6)))
    setWeekDays(getWeekDays(newStartDate))
  }, [])

  /**
   * Fetch the week plan from the server
   */
  const fetchWeekPlan = useCallback(async () => {
    if (!isAuthenticated) {
      setWeekPlan(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await mealPlanService.getWeekPlan(startDate)
      setWeekPlan(data)
    } catch (err) {
      console.error('Failed to fetch meal plan:', err)
      setError('Failed to load meal plan')
      setWeekPlan(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, startDate])

  // Fetch week plan when startDate or auth changes
  useEffect(() => {
    fetchWeekPlan()
  }, [fetchWeekPlan])

  /**
   * FR-098: Clear assignment error
   */
  const clearAssignmentError = useCallback(() => {
    setAssignmentError(null)
  }, [])

  /**
   * FR-098: Apply optimistic update to weekPlan
   * Returns the previous state for potential rollback
   */
  const applyOptimisticUpdate = useCallback((recipeId, planDate, mealId, servings, recipeData, isRemoving) => {
    const previousWeekPlan = weekPlan
    const mealType = MEAL_ID_TO_TYPE[mealId]

    setWeekPlan(currentPlan => {
      if (!currentPlan || !currentPlan.days) return currentPlan

      const newPlan = {
        ...currentPlan,
        days: currentPlan.days.map(day => {
          if (day.date !== planDate) return day

          const currentEntries = day.mealsByType?.[mealType] || []
          let newEntries
          let caloriesDelta = 0

          if (isRemoving) {
            // Remove the recipe
            const entryToRemove = currentEntries.find(e => e.recipe?.id === recipeId)
            if (entryToRemove) {
              caloriesDelta = -(entryToRemove.recipe?.calories || 0) * (entryToRemove.servings || 1) / (entryToRemove.recipe?.defaultServings || 1)
            }
            newEntries = currentEntries.filter(e => e.recipe?.id !== recipeId)
          } else {
            // Add or replace recipe
            // First remove any existing entry for this meal slot (swap behavior)
            const existingEntry = currentEntries[0]
            if (existingEntry) {
              caloriesDelta -= (existingEntry.recipe?.calories || 0) * (existingEntry.servings || 1) / (existingEntry.recipe?.defaultServings || 1)
            }
            // Add new entry
            const recipeCalories = recipeData?.calories || 0
            const defaultServings = recipeData?.defaultServings || 1
            caloriesDelta += (recipeCalories * servings) / defaultServings

            newEntries = [{
              id: Date.now(), // Temporary ID
              recipe: recipeData,
              servings: servings
            }]
          }

          return {
            ...day,
            mealsByType: {
              ...day.mealsByType,
              [mealType]: newEntries
            },
            totalCalories: Math.round((day.totalCalories || 0) + caloriesDelta)
          }
        })
      }

      return newPlan
    })

    return previousWeekPlan
  }, [weekPlan])

  /**
   * FR-014: Check if a recipe is assigned to a specific date and meal type
   * @param {number} recipeId
   * @param {string} planDate - ISO format
   * @param {string} mealType - 'breakfast', 'lunch', 'dinner', 'snacks'
   * @returns {boolean}
   */
  const isRecipeAssigned = useCallback((recipeId, planDate, mealType) => {
    if (!weekPlan || !weekPlan.days) return false

    const day = weekPlan.days.find(d => d.date === planDate)
    if (!day || !day.mealsByType) return false

    const entries = day.mealsByType[mealType] || []
    return entries.some(entry => entry.recipe?.id === recipeId)
  }, [weekPlan])

  /**
   * FR-014, FR-098: Assign recipe to a date with optimistic UI
   * @param {number} recipeId
   * @param {string} planDate - ISO format
   * @param {number} mealId
   * @param {number} servings
   * @param {Object} recipeData - Recipe object with calories for optimistic update
   * @returns {boolean} true if this will be an assignment, false if removal
   */
  const assignRecipe = useCallback((recipeId, planDate, mealId, servings = 1, recipeData = null) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required')
    }

    // Prevent duplicate operations
    const operationKey = `${recipeId}-${planDate}-${mealId}`
    if (pendingOperations.current.has(operationKey)) {
      return
    }
    pendingOperations.current.add(operationKey)

    // Clear any previous error
    setAssignmentError(null)

    // Check if this is a removal (recipe already assigned)
    const mealType = MEAL_ID_TO_TYPE[mealId]
    const isCurrentlyAssigned = isRecipeAssigned(recipeId, planDate, mealType)

    // FR-098: Apply optimistic update immediately
    const previousState = applyOptimisticUpdate(recipeId, planDate, mealId, servings, recipeData, isCurrentlyAssigned)

    // Fire API call in background (don't await)
    mealPlanService.assignRecipe(planDate, mealId, recipeId, servings)
      .then(() => {
        // Success - silently refresh to sync with server (gets real IDs, etc.)
        return fetchWeekPlan()
      })
      .catch((err) => {
        console.error('Failed to assign recipe:', err)
        // Rollback to previous state
        setWeekPlan(previousState)
        // Show error to user
        setAssignmentError('Failed to save. Please try again.')
        // Auto-clear error after 3 seconds
        setTimeout(() => setAssignmentError(null), 3000)
      })
      .finally(() => {
        pendingOperations.current.delete(operationKey)
      })

    // Return immediately with expected result
    return !isCurrentlyAssigned
  }, [isAuthenticated, isRecipeAssigned, applyOptimisticUpdate, fetchWeekPlan])

  /**
   * FR-015: Remove a specific meal plan entry
   * @param {number} entryId
   */
  const removeEntry = useCallback(async (entryId) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required')
    }

    try {
      await mealPlanService.removeEntry(entryId)
      // Refresh the week plan
      await fetchWeekPlan()
    } catch (err) {
      console.error('Failed to remove entry:', err)
      throw err
    }
  }, [isAuthenticated, fetchWeekPlan])

  /**
   * Get all entries for a specific date
   * @param {string} planDate - ISO format
   * @returns {Object} Map of mealType to entries
   */
  const getEntriesForDay = useCallback((planDate) => {
    if (!weekPlan || !weekPlan.days) return {}

    const day = weekPlan.days.find(d => d.date === planDate)
    return day?.mealsByType || {}
  }, [weekPlan])

  /**
   * FR-017: Get total calories for a specific date
   * @param {string} planDate - ISO format
   * @returns {number}
   */
  const getDailyCalories = useCallback((planDate) => {
    if (!weekPlan || !weekPlan.days) return 0

    const day = weekPlan.days.find(d => d.date === planDate)
    return day?.totalCalories || 0
  }, [weekPlan])

  const value = {
    // Date range (FR-007)
    startDate,
    endDate,
    weekDays,
    setStartDate,

    // Meal plan data
    weekPlan,
    loading,
    error,

    // FR-098: Assignment error for optimistic UI feedback
    assignmentError,
    clearAssignmentError,

    // Operations
    fetchWeekPlan,
    assignRecipe,
    removeEntry,

    // Helpers
    isRecipeAssigned,
    getEntriesForDay,
    getDailyCalories
  }

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  )
}

export const useMealPlan = () => {
  const context = useContext(MealPlanContext)
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider')
  }
  return context
}

export default MealPlanContext
