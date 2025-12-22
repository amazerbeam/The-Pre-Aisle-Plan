import api from './api'

/**
 * Shopping List Service
 * Supports FR-019 (aggregated shopping list), FR-020 (aisle grouping), FR-089 (extras)
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
  },

  /**
   * FR-089: Get shopping list with homemade/store-bought selections
   * Store-bought extras appear as single "Store Bought [Recipe Name]" items
   * @param {string} startDate - ISO format date string (YYYY-MM-DD)
   * @param {Object} selections - Map of parentRecipeId -> { extraRecipeId: isHomemade }
   * @returns {Promise<AggregatedShoppingListDTO>}
   */
  getShoppingListWithSelections: async (startDate, selections) => {
    const response = await api.post('/meal-plan/shopping-list', {
      selections
    }, {
      params: { startDate }
    })
    return response.data
  },

  /**
   * FR-042: Get breakdown of which meals use a specific ingredient
   * FR-102: Added sourceChain for finding ingredients from extras
   * @param {number} ingredientId - Ingredient ID
   * @param {string} unit - Unit string (e.g., "tbsp", "g")
   * @param {string} startDate - ISO format date string (YYYY-MM-DD)
   * @param {number[]} sourceChain - Optional chain of recipe IDs for extras
   * @returns {Promise<IngredientBreakdownDTO>}
   */
  getIngredientBreakdown: async (ingredientId, unit, startDate, sourceChain = null) => {
    const params = { ingredientId, unit, startDate }
    if (sourceChain && sourceChain.length > 0) {
      params.sourceChain = sourceChain.join(',')  // Pass as comma-separated string
    }
    const response = await api.get('/meal-plan/shopping-list/ingredient-breakdown', {
      params
    })
    return response.data
  }
}

export default shoppingService
