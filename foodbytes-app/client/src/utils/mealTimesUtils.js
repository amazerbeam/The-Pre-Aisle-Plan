import { MEAL_TIME_KEYS } from '../constants/mealTimes.js'

// Mirrors MealTimesPolicy.HH_MM_REGEX on the backend: 24-hour, zero-padded HH:mm,
// exactly what <input type="time"> produces.
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/

/**
 * MPP-13 AC 4/7: strict breakfast < lunch < dinner, no wrap past midnight — the
 * same rule MealTimesRequest enforces as a 400. Zero-padded HH:mm compares
 * correctly as plain strings.
 */
export function isStrictlyOrdered(times) {
  if (!times || !MEAL_TIME_KEYS.every((key) => HH_MM.test(times[key] ?? ''))) return false
  return times.breakfastBy < times.lunchBy && times.lunchBy < times.dinnerBy
}

/** The three times only (drops `custom`); empty strings when there are none. */
export function pickMealTimes(mealTimes) {
  return Object.fromEntries(MEAL_TIME_KEYS.map((key) => [key, mealTimes?.[key] ?? '']))
}
