// Explicit .js extension: this module is imported by macroStatus.check.mjs under
// plain `node`, which does not resolve extensionless specifiers the way Vite does.
import {
  COMPONENT_MEAL_TYPE,
  KCAL_PER_GRAM,
  MACRO_MODE,
  MACRO_TARGETS
} from '../constants/macroTargets.js'

/**
 * FR-104: Pure macro evaluation for the P / C / F traffic light.
 *
 * No React and no DOM, so the band logic can be verified directly by
 * macroStatus.check.mjs. Keep it that way — anything that touches a hook or the
 * document belongs in the components, not here.
 */

/**
 * Total kcal derived from the macros themselves: 4P + 4C + 9F.
 *
 * Deliberately NOT recipes.calories: CLAUDE.md records that stored calorie
 * totals have historically been wrong, and a derived denominator keeps the three
 * percentages consistent with the grams shown on screen.
 *
 * @param {{protein?: number, carbs?: number, fat?: number} | null} macros
 * @returns {number}
 */
export function deriveKcal(macros) {
  const protein = macros?.protein ?? 0
  const carbs = macros?.carbs ?? 0
  const fat = macros?.fat ?? 0

  return (protein * KCAL_PER_GRAM.protein)
    + (carbs * KCAL_PER_GRAM.carbs)
    + (fat * KCAL_PER_GRAM.fat)
}

/**
 * Whether the macros carry enough data to be judged at all.
 *
 * The backend coerces missing data to ZERO, not to unknown: MacroCalculationService
 * returns 0/0/0 when a recipe has no ingredient rows or a null/0 default_servings,
 * and a null per-100g column becomes BigDecimal.ZERO. So the DTO's protein/carbs/fat
 * arrive as real integers even when nothing is known, and an absent-value guard on
 * `!= null` can never fire for a loaded recipe.
 *
 * Evaluated as a meal, an all-zero reading renders three confident rejections and
 * announces "0 grams per serving, under target, rejected" — a data-completeness
 * problem dressed as a nutrition verdict, indistinguishable from a genuine failure.
 * Callers route this to the same plain, unlit badges that component recipes get.
 *
 * Any single non-zero macro counts as data: 4P + 4C + 9F is then positive, so the
 * percentages have a meaningful denominator.
 *
 * @param {{protein?: number, carbs?: number, fat?: number} | null} macros
 * @returns {boolean}
 */
export function hasUsableMacros(macros) {
  return deriveKcal(macros) > 0
}

/**
 * Whether the per-meal macro targets apply to this recipe at all.
 *
 * Component recipes (pesto, pizza dough, pita bread) are tagged Extras-only and
 * are not meals, so judging them against a per-meal target produces nonsense —
 * Pesto reads 1 g protein / 95 % fat and would show three rejections despite
 * being a perfectly correct pesto. Those recipes render plain, unlit badges.
 *
 * An absent or empty `mealTypes` deliberately returns true. No recipe lacks a
 * meal type today, so if that ever changes the traffic light stays on and the
 * problem is visible, rather than the feature silently switching itself off
 * everywhere.
 *
 * @param {{mealTypes?: string[]} | null} recipe
 * @returns {boolean}
 */
export function hasMealMacroTargets(recipe) {
  const mealTypes = recipe?.mealTypes
  if (!Array.isArray(mealTypes) || mealTypes.length === 0) return true

  // Case-insensitive: the detail endpoint returns meals.key ("extras") while
  // other shapes expose the display name ("Extras"). Comparing raw strings would
  // match nothing on one of them and silently light up every component recipe.
  return mealTypes.some(
    (mealType) => String(mealType).toLowerCase() !== COMPONENT_MEAL_TYPE
  )
}

/**
 * First band whose predicate accepts `subject`. Exposed separately from
 * evaluateMacro so every threshold can be asserted directly on a raw value.
 *
 * @param {'protein'|'carbs'|'fat'} key
 * @param {number} subject grams for mode 'grams', integer percent for 'percent'
 */
export function bandFor(key, subject) {
  const target = MACRO_TARGETS[key]
  if (!target) throw new Error(`Unknown macro key: ${key}`)

  return target.bands.find((band) => band.test(subject))
}

/**
 * @param {{protein?: number, carbs?: number, fat?: number} | null} macros per-serving grams
 * @param {'protein'|'carbs'|'fat'} key
 * @returns {{
 *   status: 'under'|'near'|'on'|'over',
 *   band: { status: string, range: string, meaning: string, reject?: boolean },
 *   grams: number,
 *   percent: number,
 *   derivedKcal: number
 * }}
 */
export function evaluateMacro(macros, key) {
  const target = MACRO_TARGETS[key]
  if (!target) throw new Error(`Unknown macro key: ${key}`)

  const grams = macros?.[key] ?? 0
  const derivedKcal = deriveKcal(macros)

  // Guard the all-zero recipe: percent stays 0 rather than becoming NaN.
  const percent = derivedKcal > 0
    ? Math.round(((grams * KCAL_PER_GRAM[key]) / derivedKcal) * 100)
    : 0

  const subject = target.mode === MACRO_MODE.GRAMS ? grams : percent
  const band = bandFor(key, subject)

  return { status: band.status, band, grams, percent, derivedKcal }
}
