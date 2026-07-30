import { MIN_SERVINGS, MAX_SERVINGS } from '../constants/servings'

// Servings allows at most 2 decimal places — mirrors @Digits(fraction = 2) on
// MealPlanCreateRequest. Private to this module; not part of the constants surface.
const SERVINGS_DECIMALS = 2
const FACTOR = 10 ** SERVINGS_DECIMALS

/**
 * Round to the allowed precision, avoiding the classic 1.005 float artefact.
 */
function roundServings(value) {
  return Math.round((value + Number.EPSILON) * FACTOR) / FACTOR
}

/**
 * Parse user input into a valid servings number.
 * Returns null when the input cannot be read as a number — callers keep their
 * last valid value rather than rendering an error.
 * Valid input is clamped to [MIN_SERVINGS, MAX_SERVINGS] and rounded to 2dp,
 * so the value sent to POST /api/meal-plan always satisfies the backend's
 * @DecimalMin / @DecimalMax / @Digits constraints.
 */
export function parseServings(input) {
  if (input === null || input === undefined) return null
  const trimmed = String(input).trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) return null
  return roundServings(Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, parsed)))
}

/**
 * Format a servings value for display: 0.5 -> "0.5", 1 -> "1", 1.25 -> "1.25".
 * Trailing zeros are stripped so a BigDecimal that arrives as 0.50 reads "0.5".
 */
export function formatServings(value) {
  const parsed = parseServings(value)
  if (parsed === null) return ''
  return String(parsed)
}

/**
 * Step a servings value by delta (used by the +/- buttons), clamped and rounded.
 */
export function stepServings(value, delta) {
  const current = parseServings(value)
  const base = current === null ? MIN_SERVINGS : current
  return roundServings(Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, base + delta)))
}
