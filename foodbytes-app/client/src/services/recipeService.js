import api from './api'

export const recipeService = {
  // ========================================
  // PUBLIC ENDPOINTS (for all users)
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

  async getRecipeById(id) {
    const response = await api.get(`/recipes/${id}`)
    return response.data
  },

  // ========================================
  // ADMIN ENDPOINTS (FR-033, FR-047)
  // ========================================

  async getAllRecipesAdmin() {
    const response = await api.get('/recipes/admin')
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
