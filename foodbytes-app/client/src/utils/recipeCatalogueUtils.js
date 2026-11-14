import { RECIPE_MEAL_TABS } from '../constants/recipesUi.js'

/** The family's default recipe id (what the server stores for a hide), or the recipe's own id. */
export function hideKeyOf(recipe) {
  return recipe?.variants?.find(v => v.isDefault)?.recipeId ?? recipe?.id
}

/** { breakfast: [...], lunch: [...], ... } using each recipe's mealTypes (a recipe can sit in several tabs). */
export function groupByMeal(recipes) {
  const out = Object.fromEntries(RECIPE_MEAL_TABS.map(k => [k, []]))
  for (const r of recipes || []) for (const k of r.mealTypes || []) if (out[k]) out[k].push(r)
  return out
}

/** Every recipe id assigned anywhere in the week (any slot). */
export function recipeIdsInWeek(weekPlan) {
  const ids = new Set()
  for (const day of weekPlan?.days || [])
    for (const entries of Object.values(day.mealsByType || {}))
      for (const e of entries) if (e.recipe?.id) ids.add(e.recipe.id)
  return ids
}

/**
 * FR-102 (moved from RecipeList): when a non-default sibling is in the plan, show that variant on the card.
 * Summary-shaped objects only. Only calories are replaced here (whole-recipe kcal, per-serving x servings);
 * the card's P/C/F come from the variant via cardMacros(recipe, selectedVariantId). A variant without a
 * calorie figure keeps the default's calories rather than becoming NaN.
 */
export function swapWithPlanVariants(recipes, planRecipeIds) {
  if (!planRecipeIds.size) return recipes
  return recipes.map(r => {
    if (!r.variants || r.variants.length < 2) return r
    const v = r.variants.find(x => x.recipeId !== r.id && planRecipeIds.has(x.recipeId))
    if (!v) return r
    const calories = v.caloriesPerServing == null ? r.calories : v.caloriesPerServing * r.defaultServings
    return { ...r, id: v.recipeId, name: v.recipeName, variantLabel: v.variantLabel, isDefault: v.isDefault, calories }
  })
}

/** The entry in a given slot, or null. */
export function slotEntryFor(weekPlan, dateISO, mealKey) {
  const day = weekPlan?.days?.find(d => d.date === dateISO)
  return day?.mealsByType?.[mealKey]?.[0] ?? null
}

/**
 * Per-serving {protein, carbs, fat} for the selected variant. Summaries carry *PerServing fields;
 * admin RecipeDTOs carry protein/carbs/fat (also per serving). Null when nothing is known.
 */
export function cardMacros(recipe, selectedVariantId) {
  const v = recipe?.variants?.find(x => x.recipeId === selectedVariantId)
  const src = v ?? recipe
  const protein = src?.proteinPerServing ?? (v ? null : recipe?.protein)
  const carbs = src?.carbsPerServing ?? (v ? null : recipe?.carbs)
  const fat = src?.fatPerServing ?? (v ? null : recipe?.fat)
  return protein == null || carbs == null || fat == null ? null : { protein, carbs, fat }
}
