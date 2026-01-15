import api from './api'

/**
 * Shopping List Service
 * Supports FR-019 (aggregated shopping list), FR-020 (aisle grouping), FR-089 (extras)
 * Now supports persisted shopping lists with database-backed checked state
 */
export const shoppingService = {
  // ==================== PERSISTED SHOPPING LIST ENDPOINTS ====================

  /**
   * Get the current persisted shopping list
   * @returns {Promise<PersistedShoppingListDTO|{exists: false}>}
   */
  getPersistedShoppingList: async () => {
    const response = await api.get('/shopping-list')
    return response.data
  },

  /**
   * Check if a persisted shopping list exists
   * @returns {Promise<{exists: boolean}>}
   */
  checkShoppingListExists: async () => {
    const response = await api.get('/shopping-list/exists')
    return response.data
  },

  /**
   * Generate a new shopping list (replaces existing)
   * @param {string} startDate - ISO format date string (YYYY-MM-DD)
   * @param {string} endDate - ISO format date string (YYYY-MM-DD)
   * @param {Object} selections - Optional homemade/store-bought selections
   * @returns {Promise<PersistedShoppingListDTO>}
   */
  generateShoppingList: async (startDate, endDate, selections = null) => {
    const response = await api.post('/shopping-list/generate', {
      startDate,
      endDate,
      selections
    })
    return response.data
  },

  /**
   * Toggle the checked state of an item (optimistic update)
   * @param {number} itemId - Shopping list item ID
   * @returns {Promise<{isChecked: boolean}>}
   */
  toggleItemChecked: async (itemId) => {
    const response = await api.patch(`/shopping-list/item/${itemId}/toggle`)
    return response.data
  },

  /**
   * Uncheck all items in the shopping list
   * @returns {Promise<{success: boolean}>}
   */
  uncheckAllItems: async () => {
    const response = await api.post('/shopping-list/uncheck-all')
    return response.data
  },

  /**
   * Delete the shopping list
   * @returns {Promise<{success: boolean}>}
   */
  deleteShoppingList: async () => {
    const response = await api.delete('/shopping-list')
    return response.data
  },

  // ==================== LEGACY ENDPOINTS (still used for ingredient breakdown) ====================
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
