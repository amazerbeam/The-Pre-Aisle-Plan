import api from './api';

const recipeService = {
  /**
   * Get all recipes (public endpoint - returns live recipes only)
   * @param {Object} params - Query parameters (meal_type)
   * @returns {Promise<Array>} Array of recipe objects
   */
  async getAll(params = {}) {
    try {
      const response = await api.get('/public/recipes', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all recipes for admin (includes hidden recipes)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Array of recipe objects including hidden
   */
  async getAllAdmin(params = {}) {
    try {
      const response = await api.get('/recipes', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get recipe by ID (public endpoint)
   * @param {number} id - Recipe ID
   * @returns {Promise<Object>} Recipe object
   */
  async getById(id) {
    try {
      const response = await api.get(`/public/recipes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get recipe by ID for admin (includes hidden recipes)
   * @param {number} id - Recipe ID
   * @returns {Promise<Object>} Recipe object
   */
  async getByIdAdmin(id) {
    try {
      const response = await api.get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new recipe (admin only)
   * @param {Object} recipeData - Recipe data
   * @returns {Promise<Object>} Created recipe object
   */
  async create(recipeData) {
    try {
      const response = await api.post('/recipes', recipeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update recipe (admin only)
   * @param {number} id - Recipe ID
   * @param {Object} recipeData - Updated recipe data
   * @returns {Promise<Object>} Updated recipe object
   */
  async update(id, recipeData) {
    try {
      const response = await api.put(`/recipes/${id}`, recipeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete recipe (admin only)
   * @param {number} id - Recipe ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await api.delete(`/recipes/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Toggle recipe visibility (admin only)
   * @param {number} id - Recipe ID
   * @param {boolean} isLive - New visibility state
   * @returns {Promise<Object>} Updated recipe object
   */
  async toggleVisibility(id, isLive) {
    try {
      const response = await api.patch(`/recipes/${id}/visibility`, { is_live: isLive });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default recipeService;
