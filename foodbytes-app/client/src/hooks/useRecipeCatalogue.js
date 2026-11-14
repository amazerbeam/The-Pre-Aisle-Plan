import { useCallback, useEffect, useMemo, useState } from 'react'
import recipeService from '../services/recipeService'
import { useMealPlan } from '../contexts/MealPlanContext'
import { groupByMeal, recipeIdsInWeek, swapWithPlanVariants } from '../utils/recipeCatalogueUtils'

const LOAD_ERROR = 'Failed to load recipes. Please try again.'

/**
 * Loads the whole catalogue once (users: live summaries; admins: everything incl. not-live) and groups it
 * by meal tab. FR-102 variant swap is derived from the raw list and the week plan, so it re-applies when
 * the week plan arrives after the catalogue (hard refresh).
 */
export default function useRecipeCatalogue({ isAdmin }) {
  const { weekPlan } = useMealPlan()
  const [state, setState] = useState({ raw: [], loading: true, error: null })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState(s => ({ ...s, loading: true, error: null }))
    const load = isAdmin
      ? recipeService.getAllRecipesAdmin(null, { signal: controller.signal })
      : recipeService.getAllRecipeSummaries({ signal: controller.signal })
    load
      .then(list => {
        setState({ raw: list, loading: false, error: null })
      })
      .catch(err => {
        if (controller.signal.aborted || err?.name === 'CanceledError') return
        setState(s => ({ ...s, loading: false, error: err.response?.data?.error || LOAD_ERROR }))
      })
    return () => controller.abort()
  }, [isAdmin, reloadToken])

  const reload = useCallback(() => setReloadToken(t => t + 1), [])
  const recipesByMeal = useMemo(
    () => groupByMeal(swapWithPlanVariants(state.raw, recipeIdsInWeek(weekPlan))),
    [state.raw, weekPlan])
  const counts = Object.fromEntries(Object.entries(recipesByMeal).map(([k, v]) => [k, v.length]))
  return { recipesByMeal, loading: state.loading, error: state.error, counts, reload }
}
