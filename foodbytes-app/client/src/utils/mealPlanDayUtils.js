import { MEAL_SLOTS, SNACKS_SLOT } from '../constants/mealPlanUi.js'

/** The eaten tick is offered only for today and past days (ISO yyyy-mm-dd compares lexically). */
export function isDayTickable(dateISO, todayISO) {
  return typeof dateISO === 'string' && dateISO <= todayISO
}

/** Day totals in the {protein, carbs, fat} grams shape evaluateMacro expects. */
export function dayMacros(day) {
  return { protein: day?.totalProtein ?? 0, carbs: day?.totalCarbs ?? 0, fat: day?.totalFat ?? 0 }
}

/** Average-per-day macros: the same source WeeklyMacroPopup's avg row uses, so tile and popup agree. */
export function weekAvgMacros(weekPlan) {
  return {
    protein: weekPlan?.avgDailyProtein ?? 0,
    carbs: weekPlan?.avgDailyCarbs ?? 0,
    fat: weekPlan?.avgDailyFat ?? 0
  }
}

/** How many of the 21 core slots (B/L/D x 7) hold a meal. */
export function plannedSlotCount(weekPlan) {
  return (weekPlan?.days || []).reduce(
    (n, day) => n + MEAL_SLOTS.filter(s => (day.mealsByType?.[s.key] || []).length > 0).length, 0)
}

/** Rows to render: B/L/D always, plus Snacks only when some day this week has one. */
export function slotsForWeek(weekPlan) {
  const hasSnacks = (weekPlan?.days || []).some(d => (d.mealsByType?.snacks || []).length > 0)
  return hasSnacks ? [...MEAL_SLOTS, SNACKS_SLOT] : MEAL_SLOTS
}

/** How many core slots a single day fills (0-3), for the mobile day-chip dots. */
export function filledCoreSlots(day) {
  return MEAL_SLOTS.filter(s => (day?.mealsByType?.[s.key] || []).length > 0).length
}

/** The day the screen opens on: today when it is in the week, else the first day. */
export function todayOrFirstDay(weekPlan) {
  const days = weekPlan?.days || []
  return days.find(d => d.isToday) ?? days[0]
}
