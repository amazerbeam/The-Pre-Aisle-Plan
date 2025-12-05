import api from './api'

/**
 * Admin service for ingredient, unit, and aisle operations.
 * Implements FR-044, FR-045, FR-046.
 */
export const adminService = {
  // ========================================
  // INGREDIENTS (FR-044)
  // ========================================

  async getAllIngredients() {
    const response = await api.get('/admin/ingredients')
    return response.data
  },

  async searchIngredients(query, limit = 10) {
    const response = await api.get(`/admin/ingredients/autocomplete?query=${encodeURIComponent(query)}&limit=${limit}`)
    return response.data
  },

  async validateIngredient(name) {
    const response = await api.post(`/admin/ingredients/validate?name=${encodeURIComponent(name)}`)
    return response.data
  },

  async createIngredient(ingredientData) {
    const response = await api.post('/admin/ingredients', ingredientData)
    return response.data
  },

  // ========================================
  // UNITS (FR-045)
  // ========================================

  async getAllUnits() {
    const response = await api.get('/admin/units')
    return response.data
  },

  async searchUnits(query = '', limit = 20) {
    const response = await api.get(`/admin/units/autocomplete?query=${encodeURIComponent(query)}&limit=${limit}`)
    return response.data
  },

  async createUnit(unitData) {
    const response = await api.post('/admin/units', unitData)
    return response.data
  },

  // ========================================
  // AISLES
  // ========================================

  async getAllAisles() {
    const response = await api.get('/aisles')
    return response.data
  }
}

export default adminService
