import api from './api'

/**
 * Shopping List Service
 * Supports FR-019 (aggregated shopping list), FR-020 (aisle grouping)
 */
export const shoppingService = {
  /**
   * Get aggregated shopping list for a 7-day period starting from startDate
   * @param {string} startDate - ISO format date string (YYYY-MM-DD)
   * @returns {Promise<AggregatedShoppingListDTO>}
   */
  getShoppingList: async (startDate) => {
    const response = await api.get('/meal-plan/shopping-list', {
      params: { startDate }
    })
    return response.data
  }
}

export default shoppingService
