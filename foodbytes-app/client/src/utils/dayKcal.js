/**
 * FR-050 (restored 2026-11-17): the day's kcal on recipe-card day buttons.
 * Mirrors the optimistic delta in MealPlanContext.assignRecipe and the backend's
 * MealPlanService day total (sum of per-serving kcal of every entry that day).
 */

export const DAY_KCAL_EMPTY = '—'

/** Per-serving kcal of a meal-plan entry, as the backend counts it. */
export function entryKcalPerServing(entry) {
  const calories = entry?.recipe?.calories || 0
  const servings = entry?.recipe?.defaultServings || 1
  return calories / servings
}

/**
 * The day total after clicking this recipe's day button.
 * - assignId already in the slot → the click removes it.
 * - otherwise → the first entry in the slot (if any) is swapped out and assignKcal added.
 */
export function projectDayKcal({ dayTotal, slotEntries, assignId, assignKcal }) {
  const entries = slotEntries || []
  const total = dayTotal || 0
  const own = entries.find((e) => e?.recipe?.id === assignId)
  const projected = own
    ? total - entryKcalPerServing(own)
    : total - (entries[0] ? entryKcalPerServing(entries[0]) : 0) + (assignKcal || 0)
  return Math.max(0, Math.round(projected))
}

/** "1835", or DAY_KCAL_EMPTY for 0 / missing. No thousands separator, to fit 320px. */
export function formatDayKcal(kcal) {
  const n = Math.round(kcal || 0)
  return n > 0 ? String(n) : DAY_KCAL_EMPTY
}
