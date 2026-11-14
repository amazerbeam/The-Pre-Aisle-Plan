import { useCallback } from 'react'
import mealPlanService from '../services/mealPlanService'
import { findEntry, patchEntry } from '../utils/weekPlanEntryUtils'

const UPDATE_ERROR_MESSAGE = "Couldn't update that meal. Please try again."
const ERROR_TOAST_MS = 3000

/**
 * Optimistic move / servings change. Servings patch the entry in place; a move is not patched locally
 * (the server may swap a second meal), so the week is refetched to show the real result and new totals.
 */
export function useEntryUpdate({ weekPlan, setWeekPlan, setAssignmentError, fetchWeekPlan }) {
  const updateEntry = useCallback(async (entryId, patch) => {
    const previous = findEntry(weekPlan, entryId)
    if (!previous) throw new Error('Meal plan entry not found')
    const rollback = { servings: previous.servings }
    if (patch.servings != null) {
      setWeekPlan(plan => patchEntry(plan, entryId, { servings: patch.servings }))
    }
    try {
      const saved = await mealPlanService.updateEntry(entryId, patch)
      await fetchWeekPlan()
      return saved
    } catch (err) {
      setWeekPlan(plan => patchEntry(plan, entryId, rollback))
      setAssignmentError(err.response?.data?.error || UPDATE_ERROR_MESSAGE)
      setTimeout(() => setAssignmentError(null), ERROR_TOAST_MS)
      throw err
    }
  }, [weekPlan, setWeekPlan, setAssignmentError, fetchWeekPlan])

  return { updateEntry }
}

export default useEntryUpdate
