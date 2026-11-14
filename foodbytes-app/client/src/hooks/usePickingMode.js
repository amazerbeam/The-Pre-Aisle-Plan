import { useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMealPlan } from '../contexts/MealPlanContext'
import { RECIPE_MEAL_TABS } from '../constants/recipesUi'
import { PICK_FROM_MEALPLAN } from '../constants/mealPlanUi'
import { MEALPLAN_PATH } from '../constants/appRoutes'
import { formatDateISO, parseISODate } from '../utils/dateUtils'

/** A real calendar date: 2026-02-31 would round-trip to 2026-03-03, so it is rejected. */
const isRealISODate = (d) => Boolean(d) && formatDateISO(parseISODate(d)) === d

/**
 * Recipes tab + picking mode, held in the URL: ?mealType=lunch&date=2026-11-15&from=mealplan.
 * A picked date outside the visible week moves the week so the strip and day buttons can show it.
 */
export default function usePickingMode() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { startDate, endDate, setStartDate } = useMealPlan()

  const rawMeal = params.get('mealType')
  const activeMeal = RECIPE_MEAL_TABS.includes(rawMeal) ? rawMeal : 'breakfast'
  const rawDate = params.get('date')
  const pickDate = isRealISODate(rawDate) ? rawDate : null
  const fromMealPlan = params.get('from') === PICK_FROM_MEALPLAN

  useEffect(() => {
    if (pickDate && (pickDate < startDate || pickDate > endDate)) setStartDate(pickDate)
  }, [pickDate, startDate, endDate, setStartDate])

  const update = useCallback((next) => {
    const p = new URLSearchParams()
    Object.entries(next).forEach(([k, v]) => { if (v) p.set(k, v) })
    setParams(p, { replace: true })
  }, [setParams])

  const setActiveMeal = useCallback((meal) => update({ mealType: meal }), [update])
  const startPicking = useCallback((dateISO) => update({ mealType: activeMeal, date: dateISO }), [update, activeMeal])
  /** Leave picking mode; when we came from the Meal Plan, go back there. */
  const finishPicking = useCallback(() => {
    if (fromMealPlan) navigate(MEALPLAN_PATH)
    else update({ mealType: activeMeal })
  }, [fromMealPlan, navigate, update, activeMeal])

  return { activeMeal, setActiveMeal, pickDate, fromMealPlan, startPicking, finishPicking }
}
