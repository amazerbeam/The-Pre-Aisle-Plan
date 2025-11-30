import api from './api';

export const ingredientService = {
  // Get all ingredients
  async getIngredients() {
    try {
      const response = await api.get('/ingredients');
      return response.data;
    } catch (error) {
      console.error('Get ingredients error:', error);
      throw error;
    }
  },

  // Get all aisles
  async getAisles() {
    try {
      const response = await api.get('/aisles');
      return response.data;
    } catch (error) {
      console.error('Get aisles error:', error);
      throw error;
    }
  },

  // Get all units
  async getUnits() {
    try {
      const response = await api.get('/units');
      return response.data;
    } catch (error) {
      console.error('Get units error:', error);
      throw error;
    }
  },

  // Get meal types
  async getMeals() {
    try {
      const response = await api.get('/meals');
      return response.data;
    } catch (error) {
      console.error('Get meals error:', error);
      throw error;
    }
  },
};
