import { useCallback } from 'react'
import mealPlanService from '../services/mealPlanService'

const EATEN_ERROR_MESSAGE = "Couldn't update eaten status. Please try again."
const ERROR_TOAST_MS = 3000

/**
 * MPP-12: optimistic eaten tick for MealPlanContext. Lives outside the context file because the
 * context is already over the 400-line budget. Rollback is per entry, so a failure cannot undo
 * an unrelated concurrent change (swap/assign) elsewhere in the week.
 * useCallback matches every other function MealPlanContext exposes in `value`.
 */
export function useEntryEaten({ weekPlan, setWeekPlan, setAssignmentError }) {
  const getEntryById = useCallback((entryId) => findEntry(weekPlan, entryId), [weekPlan])

  const setEntryEaten = useCallback(async (entryId, eaten) => {
    const previous = findEntry(weekPlan, entryId)
    if (!previous) throw new Error('Meal plan entry not found')

    const rollback = { eaten: previous.eaten === true, eatenAt: previous.eatenAt ?? null }
    // Re-tick keeps the first time (mirrors the server); undo clears it.
    const provisionalEatenAt = eaten ? (previous.eatenAt ?? new Date().toISOString()) : null
    setWeekPlan(plan => patchEntry(plan, entryId, { eaten, eatenAt: provisionalEatenAt }))

    try {
      const saved = await mealPlanService.setEntryEaten(entryId, eaten)
      setWeekPlan(plan => patchEntry(plan, entryId, { eaten: saved.eaten, eatenAt: saved.eatenAt }))
    } catch (err) {
      setWeekPlan(plan => patchEntry(plan, entryId, rollback))
      setAssignmentError(err.response?.data?.error || EATEN_ERROR_MESSAGE)
      setTimeout(() => setAssignmentError(null), ERROR_TOAST_MS)
      throw err
    }
  }, [weekPlan, setWeekPlan, setAssignmentError])

  return { setEntryEaten, getEntryById }
}

const findEntry = (weekPlan, entryId) => {
  for (const day of weekPlan?.days || []) {
    for (const entries of Object.values(day.mealsByType || {})) {
      const match = entries.find(e => e.id === entryId)
      if (match) return match
    }
  }
  return null
}

const patchEntry = (weekPlan, entryId, fields) => {
  if (!weekPlan?.days) return weekPlan
  return {
    ...weekPlan,
    days: weekPlan.days.map(day => ({
      ...day,
      mealsByType: Object.fromEntries(
        Object.entries(day.mealsByType || {}).map(([type, entries]) => [
          type,
          entries.map(e => (e.id === entryId ? { ...e, ...fields } : e))
        ])
      )
    }))
  }
}

export default useEntryEaten
