import { useCallback, useState } from 'react'
import extraChoicesService from '../services/extraChoicesService'
import { useMealPlan } from '../contexts/MealPlanContext'
import { useHomemadeSelections } from '../contexts/HomemadeSelectionsContext'
import { useAuth } from '../contexts/AuthContext'

const SAVE_ERROR = "Couldn't save that choice. Please try again."
const LOCKED_HINT = 'Add this to your plan to choose per meal'

/**
 * Recipe view extras toggle. A planned meal saves its own choice (MPP-10 week endpoint);
 * anywhere else updates the dish default in HomemadeSelectionsContext (guests only: there is no endpoint
 * that writes a signed-in user's per-dish default outside a plan entry, so the toggle is `locked` there
 * rather than caching a choice that reverts on reload). Writes are never aborted.
 */
export default function useExtraChoiceToggle({ parentRecipeId, mealPlanEntry }) {
  const { fetchWeekPlan } = useMealPlan()
  const { isAuthenticated } = useAuth()
  const { getSelections, saveSelections, reloadSelections } = useHomemadeSelections()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const locked = isAuthenticated && !mealPlanEntry

  const setChoice = useCallback(async (extraRecipeId, homemade) => {
    setError(null)
    if (locked) return
    if (!mealPlanEntry) {
      saveSelections(parentRecipeId, { ...getSelections(parentRecipeId), [extraRecipeId]: homemade })
      return
    }
    setSaving(true)
    try {
      await extraChoicesService.updateWeek([{ targetId: mealPlanEntry.id, extraRecipeId, homemade }])
      await fetchWeekPlan()
      reloadSelections()
    } catch (err) {
      setError(err.response?.data?.error || SAVE_ERROR)
    } finally {
      setSaving(false)
    }
  }, [locked, mealPlanEntry, parentRecipeId, getSelections, saveSelections, fetchWeekPlan, reloadSelections])

  return { setChoice, saving, error, locked, hint: locked ? LOCKED_HINT : null }
}
