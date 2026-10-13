import api from './api'

/**
 * Meal Plan API Service
 * Supports FR-007 (date range), FR-014 (assign), FR-015 (remove), FR-016 (calendar), FR-017 (calories)
 */
export const mealPlanService = {
  /**
   * FR-007, FR-016: Get 7-day meal plan starting from a given date
   * @param {string} startDate - ISO format date string (YYYY-MM-DD)
   * @param {{ signal?: AbortSignal }} [options] - MPP-14: PetContext cancels stale reads
   * @returns {Promise<Object>} MealPlanWeekDTO with 7 days
   */
  async getWeekPlan(startDate, { signal } = {}) {
    const response = await api.get(`/meal-plan?startDate=${startDate}`, { signal })
    return response.data
  },

  /**
   * FR-014: Assign recipe to a date (toggle behavior)
   * If recipe is already assigned to that date/meal, it removes it.
   * @param {string} planDate - ISO format date string (YYYY-MM-DD)
   * @param {number} mealId - Meal type ID (1=breakfast, 2=lunch, 3=dinner, 4=snacks)
   * @param {number} recipeId - Recipe ID
   * @param {number} [servings] - Servings to cook; may be fractional
   *   (0.5 = half portion), 0.25-20, max 2dp. Omit to let the backend derive it
   *   from the recipe's defaultServings; do not default it to 1 here.
   * @param {Object} [extraChoices] - MPP-10: extraRecipeId -> isHomemade from the add-to-day popup
   * @returns {Promise<Object|null>} MealPlanEntryDTO if created, null if removed
   */
  async assignRecipe(planDate, mealId, recipeId, servings, extraChoices) {
    const response = await api.post('/meal-plan', {
      planDate,
      mealId,
      recipeId,
      servings,
      extraChoices
    })
    // 204 No Content means recipe was toggled off
    if (response.status === 204) {
      return null
    }
    return response.data
  },

  /**
   * FR-015: Remove a specific meal plan entry
   * @param {number} entryId - Entry ID to remove
   * @returns {Promise<boolean>} true if removed
   */
  async removeEntry(entryId) {
    const response = await api.delete(`/meal-plan/${entryId}`)
    return response.status === 204
  },

  /**
   * MPP-12: Mark a meal plan entry as eaten, or undo it. The tick is yours alone (MPP-33):
   * a linked partner ticks the same shared meal separately.
   * @param {number} entryId - Entry ID
   * @param {boolean} eaten - Target state (explicit, not a toggle)
   * @returns {Promise<{id: number, eaten: boolean, eatenAt: string|null}>} eatenAt is ISO-8601 UTC
   */
  async setEntryEaten(entryId, eaten) {
    const response = await api.put(`/meal-plan/${entryId}/eaten`, { eaten })
    return response.data
  },

  /**
   * FR-014: Get which days a recipe is assigned to within the date range
   * Used to highlight day buttons on RecipeCard
   * @param {number} recipeId - Recipe ID
   * @param {string} startDate - ISO format date string (YYYY-MM-DD)
   * @returns {Promise<Array>} List of entries for this recipe in the date range
   */
  async getRecipeAssignments(recipeId, startDate) {
    const response = await api.get(`/meal-plan/recipe/${recipeId}?startDate=${startDate}`)
    return response.data
  },

  /**
   * Swap all meals between two dates
   * @param {string} sourceDate - ISO format date string (YYYY-MM-DD)
   * @param {string} targetDate - ISO format date string (YYYY-MM-DD)
   * @returns {Promise<boolean>} true if swapped successfully
   */
  async swapDays(sourceDate, targetDate) {
    const response = await api.post(`/meal-plan/swap?sourceDate=${sourceDate}&targetDate=${targetDate}`)
    return response.status === 204
  },

  /**
   * Copy all meals from one week to another
   * @param {string} sourceStartDate - ISO format date string (YYYY-MM-DD) of source week start
   * @param {string} targetStartDate - ISO format date string (YYYY-MM-DD) of target week start
   * @returns {Promise<Object>} MealPlanWeekDTO for the target week
   */
  async copyWeek(sourceStartDate, targetStartDate) {
    const response = await api.post(
      `/meal-plan/copy-week?sourceStartDate=${sourceStartDate}&targetStartDate=${targetStartDate}`
    )
    return response.data
  }
}

export default mealPlanService
