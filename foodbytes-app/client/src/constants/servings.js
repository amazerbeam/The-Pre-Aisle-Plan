/**
 * Servings bounds shared by every servings control.
 *
 * Decimal servings let a user plan a half portion (0.5) or a quarter (0.25).
 * MIN/MAX mirror the MealPlanCreateRequest validation on the backend
 * (@DecimalMin("0.25") / @DecimalMax("20.00")) — keep them in sync.
 */
export const MIN_SERVINGS = 0.25
export const MAX_SERVINGS = 20
export const SERVINGS_STEP = 0.5

// Fallback when a servings value is absent or unparseable. Replaces the `|| 1`
// literal that was duplicated across useServingsInput and RecipeViewModal.
export const DEFAULT_SERVINGS = 1

/**
 * MPP-3: what the "Default portions" control shows before the user has ever set
 * a preference. Mirrors the `recipes.default_servings` column default of 2, which
 * is what 149 of the 165 recipes actually carry — so it previews the portion count
 * a card really opens at today.
 *
 * Deliberately NOT MIN_SERVINGS: the control previously previewed 0.25, which is
 * only the validation floor and previews nothing a user would recognise.
 *
 * Approximate by nature — a handful of recipes are authored at 4/6/8/10/12, and
 * an unset preference means "each recipe uses its own default", which no single
 * number can state exactly. This is the honest common case, not a guarantee.
 */
export const RECIPE_DEFAULT_SERVINGS = 2
