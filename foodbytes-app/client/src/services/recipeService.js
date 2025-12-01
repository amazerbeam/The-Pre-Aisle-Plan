import api from './api'

export const recipeService = {
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
  }
}

export default recipeService
