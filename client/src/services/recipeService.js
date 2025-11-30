import api from './api';

export const recipeService = {
  // Get all recipes with optional filters
  async getRecipes(params = {}) {
    try {
      const response = await api.get('/recipes', { params });
      return response.data;
    } catch (error) {
      console.error('Get recipes error:', error);
      throw error;
    }
  },

  // Get single recipe by ID
  async getRecipeById(id) {
    try {
      const response = await api.get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get recipe error:', error);
      throw error;
    }
  },

  // Search recipes (uses same endpoint as getRecipes with search param)
  async searchRecipes(query, mealType = null) {
    try {
      const params = { search: query };
      if (mealType) {
        params.mealType = mealType;
      }
      const response = await api.get('/recipes', { params });
      return response.data;
    } catch (error) {
      console.error('Search recipes error:', error);
      throw error;
    }
  },
};
