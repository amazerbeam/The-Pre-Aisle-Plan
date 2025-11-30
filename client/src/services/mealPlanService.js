import api from './api';

export const mealPlanService = {
  // Get meal plan entries for date range
  async getEntries(from, to) {
    try {
      const response = await api.get('/meal-plan', {
        params: { from, to },
      });
      return response.data;
    } catch (error) {
      console.error('Get meal plan entries error:', error);
      throw error;
    }
  },

  // Create new meal plan entry
  async createEntry(entry) {
    try {
      const response = await api.post('/meal-plan', entry);
      return response.data;
    } catch (error) {
      console.error('Create meal plan entry error:', error);
      throw error;
    }
  },

  // Update existing meal plan entry
  async updateEntry(id, entry) {
    try {
      const response = await api.put(`/meal-plan/${id}`, entry);
      return response.data;
    } catch (error) {
      console.error('Update meal plan entry error:', error);
      throw error;
    }
  },

  // Delete meal plan entry
  async deleteEntry(id) {
    try {
      await api.delete(`/meal-plan/${id}`);
      return true;
    } catch (error) {
      console.error('Delete meal plan entry error:', error);
      throw error;
    }
  },
};
