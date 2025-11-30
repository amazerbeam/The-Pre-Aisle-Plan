import api from './api';

const mealPlanService = {
  /**
   * Get meal plans by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Array of meal plan objects
   */
  async getByDateRange(startDate, endDate) {
    try {
      const response = await api.get('/meal-plans', {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new meal plan entry
   * @param {Object} mealPlanData - { recipe_id, date, meal_type, servings }
   * @returns {Promise<Object>} Created meal plan object
   */
  async create(mealPlanData) {
    try {
      const response = await api.post('/meal-plans', mealPlanData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update meal plan entry
   * @param {number} id - Meal plan ID
   * @param {Object} mealPlanData - Updated meal plan data
   * @returns {Promise<Object>} Updated meal plan object
   */
  async update(id, mealPlanData) {
    try {
      const response = await api.put(`/meal-plans/${id}`, mealPlanData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete meal plan entry
   * @param {number} id - Meal plan ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await api.delete(`/meal-plans/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk create meal plans
   * @param {Array} mealPlans - Array of meal plan objects
   * @returns {Promise<Array>} Created meal plan objects
   */
  async bulkCreate(mealPlans) {
    try {
      const response = await api.post('/meal-plans/bulk', { meal_plans: mealPlans });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default mealPlanService;
