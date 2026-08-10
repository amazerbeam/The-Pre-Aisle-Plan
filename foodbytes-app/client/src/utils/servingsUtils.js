// Explicit .js extension: this module is imported by servingsUtils.check.mjs under
// plain `node`, which does not resolve extensionless specifiers the way Vite does.
import { MIN_SERVINGS, MAX_SERVINGS, DEFAULT_SERVINGS } from '../constants/servings.js'
import { COMPONENT_MEAL_TYPE } from '../constants/macroTargets.js'

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

/**
 * MPP-3: where a servings control starts.
 *
 * The user preference moves the STARTING value only. Every scaling site —
 * RecipeCard.jsx:37 (ingredient quantities), RecipeCard.jsx:59 and
 * RecipeViewModal.jsx:222 (per-serving kcal) — keeps dividing by
 * recipe.defaultServings. Overriding that divisor would silently misreport
 * macros on every recipe, which the ticket calls out as the main correctness
 * risk in the story.
 *
 * Resolution order:
 *   1. Extras (component recipes: pesto, pita, dough) always start at their own
 *      defaultServings — a linked sauce is not a meal (AC 6).
 *   2. No preference, or an unusable one, falls back to the recipe (AC 9).
 *   3. Otherwise the preference (AC 4).
 *
 * @param {{defaultServings?: number, mealTypes?: string[]} | null} recipe
 * @param {number|string|null|undefined} userDefaultServings
 * @returns {number}
 */
export function resolveStartingServings(recipe, userDefaultServings) {
  const recipeDefault = parseServings(recipe?.defaultServings) ?? DEFAULT_SERVINGS

  if (isExtrasOnly(recipe)) return recipeDefault

  const preference = parseServings(userDefaultServings)
  return preference === null ? recipeDefault : preference
}

/**
 * Whether every meal type on this recipe is the component/extras type.
 *
 * Mirrors hasMealMacroTargets() in macroStatus.js — component recipes are tagged
 * Extras-only and are not meals. Case-insensitive because the detail endpoint
 * returns meals.key ("extras") while other shapes expose the display name
 * ("Extras"); comparing raw strings would match one and silently miss the other.
 *
 * An absent or empty mealTypes returns false (not an extra), so a recipe with
 * missing meal data gets the preference rather than silently opting out of it.
 */
function isExtrasOnly(recipe) {
  const mealTypes = recipe?.mealTypes
  if (!Array.isArray(mealTypes) || mealTypes.length === 0) return false
  return mealTypes.every(
    (mealType) => String(mealType).toLowerCase() === COMPONENT_MEAL_TYPE
  )
}
