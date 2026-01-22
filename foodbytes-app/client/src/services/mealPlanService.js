import api from './api'

/**
 * Meal Plan API Service
 * Supports FR-007 (date range), FR-014 (assign), FR-015 (remove), FR-016 (calendar), FR-017 (calories)
 */
export const mealPlanService = {
  /**
   * FR-007, FR-016: Get 7-day meal plan starting from a given date
   * @param {string} startDate - ISO format date string (YYYY-MM-DD)
   * @returns {Promise<Object>} MealPlanWeekDTO with 7 days
   */
  async getWeekPlan(startDate) {
    const response = await api.get(`/meal-plan?startDate=${startDate}`)
    return response.data
  },

  /**
   * FR-014: Assign recipe to a date (toggle behavior)
   * If recipe is already assigned to that date/meal, it removes it.
   * @param {string} planDate - ISO format date string (YYYY-MM-DD)
   * @param {number} mealId - Meal type ID (1=breakfast, 2=lunch, 3=dinner, 4=snacks)
   * @param {number} recipeId - Recipe ID
   * @param {number} servings - Number of servings (default 1)
   * @returns {Promise<Object|null>} MealPlanEntryDTO if created, null if removed
   */
  async assignRecipe(planDate, mealId, recipeId, servings = 1) {
    const response = await api.post('/meal-plan', {
      planDate,
      mealId,
      recipeId,
      servings
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
  }
}

export default mealPlanService
