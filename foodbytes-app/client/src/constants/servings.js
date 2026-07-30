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
