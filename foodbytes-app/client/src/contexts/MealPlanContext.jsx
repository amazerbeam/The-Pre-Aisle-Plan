import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { useAuth } from './AuthContext'
import mealPlanService from '../services/mealPlanService'
import { getTodayISO, addDays, formatDateISO, getWeekDays } from '../utils/dateUtils'

const MealPlanContext = createContext()

/**
 * MealPlanProvider - Manages global meal plan state
 * Supports FR-007 (date range), FR-014 (assign), FR-015 (remove), FR-016 (calendar), FR-017 (calories)
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
   * FR-014: Assign recipe to a date (toggle behavior)
   * @param {number} recipeId
   * @param {string} planDate - ISO format
   * @param {number} mealId
   * @param {number} servings
   * @returns {Promise<boolean>} true if assigned, false if removed
   */
  const assignRecipe = useCallback(async (recipeId, planDate, mealId, servings = 1) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required')
    }

    try {
      const result = await mealPlanService.assignRecipe(planDate, mealId, recipeId, servings)
      // Refresh the week plan to get updated state
      await fetchWeekPlan()
      // Return true if created, false if removed (toggled off)
      return result !== null
    } catch (err) {
      console.error('Failed to assign recipe:', err)
      throw err
    }
  }, [isAuthenticated, fetchWeekPlan])

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
