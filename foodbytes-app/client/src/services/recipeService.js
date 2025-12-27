import api from './api'

export const recipeService = {
  // ========================================
  // FR-102: SUMMARY ENDPOINTS (Lightweight data for list views)
  // ========================================

  /**
   * FR-102: Get all recipe summaries (no ingredients/steps).
   * Use for list views to reduce data transfer.
   */
  async getAllRecipeSummaries() {
    const response = await api.get('/recipes/summaries')
    return response.data
  },

  /**
   * FR-102: Get recipe summaries filtered by meal type.
   * Use for list views to reduce data transfer.
   */
  async getRecipeSummariesByMealType(mealType) {
    const response = await api.get(`/recipes/summaries?mealType=${mealType}`)
    return response.data
  },

  /**
   * FR-102: Search recipes and return summaries.
   * Use for search results to reduce data transfer.
   */
  async searchRecipeSummaries(query) {
    const response = await api.get(`/recipes/summaries/search?query=${encodeURIComponent(query)}`)
    return response.data
  },

  // ========================================
  // PUBLIC ENDPOINTS (for all users) - Full data
  // ========================================

  async getAllRecipes() {
    const response = await api.get('/recipes')
    return response.data
  },

  async getRecipesByMealType(mealType) {
    const response = await api.get(`/recipes?mealType=${mealType}`)
    return response.data
  },

  async searchRecipes(query) {
    const response = await api.get(`/recipes/search?query=${encodeURIComponent(query)}`)
    return response.data
  },

  /**
   * Get full recipe data including ingredients and steps.
   * FR-102: Use this when user clicks "View Recipe" to get full data.
   */
  async getRecipeById(id) {
    const response = await api.get(`/recipes/${id}`)
    return response.data
  },

  /**
   * FR-086: Get extras hierarchy for a recipe
   * Returns tree structure of linked sub-recipes
   */
  async getRecipeExtras(id) {
    const response = await api.get(`/recipes/${id}/extras`)
    return response.data
  },

  // ========================================
  // ADMIN ENDPOINTS (FR-033, FR-047)
  // ========================================

  async getAllRecipesAdmin(mealType = null) {
    const url = mealType ? `/recipes/admin?mealType=${mealType}` : '/recipes/admin'
    const response = await api.get(url)
    return response.data
  },

  async getRecipeByIdAdmin(id) {
    const response = await api.get(`/recipes/admin/${id}`)
    return response.data
  },

  async createRecipe(recipeData) {
    const response = await api.post('/recipes/admin', recipeData)
    return response.data
  },

  async updateRecipe(id, recipeData) {
    const response = await api.put(`/recipes/admin/${id}`, recipeData)
    return response.data
  },

  async deleteRecipe(id) {
    await api.delete(`/recipes/admin/${id}`)
  },

  async updateRecipeVisibility(id, isLive) {
    const response = await api.patch(`/recipes/admin/${id}/visibility?isLive=${isLive}`)
    return response.data
  }
}

export default recipeService
