import { createContext, useState, useContext, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

// FR-103: Shopping list cache key (shared with ShoppingListContext and MealPlanContext)
const SHOPPING_LIST_INVALIDATED_KEY = 'shoppingListInvalidated'

/**
 * FR-103: Invalidate shopping list cache when homemade selections change
 * Called directly to avoid circular dependency with ShoppingListContext
 */
const invalidateShoppingListCache = () => {
  try {
    localStorage.setItem(SHOPPING_LIST_INVALIDATED_KEY, 'true')
  } catch (err) {
    console.error('Failed to invalidate shopping list cache:', err)
  }
}

/**
 * FR-090: Context for managing homemade/store-bought selections for recipe extras.
 * Persists choices to localStorage and pre-populates popup with saved preferences.
 * FR-103: Invalidates shopping list cache when selections change.
 */
const HomemadeSelectionsContext = createContext()

export const HomemadeSelectionsProvider = ({ children }) => {
  const { user } = useAuth()
  const [selections, setSelections] = useState({})
  const [selectionsLoaded, setSelectionsLoaded] = useState(false)

  // Storage key based on user ID (or 'guest' for guests)
  const getStorageKey = useCallback(() => {
    return `homemadeSelections_${user?.id || 'guest'}`
  }, [user?.id])

  // Load from localStorage on mount and when user changes
  useEffect(() => {
    setSelectionsLoaded(false)
    try {
      const stored = localStorage.getItem(getStorageKey())
      if (stored) {
        setSelections(JSON.parse(stored))
      } else {
        setSelections({})
      }
    } catch (err) {
      console.error('Error loading homemade selections:', err)
      setSelections({})
    }
    setSelectionsLoaded(true)
  }, [getStorageKey])

  /**
   * Save selections for a specific recipe.
   * FR-103: Invalidates shopping list cache when selections change.
   * @param recipeId - The parent recipe ID
   * @param newSelections - Map of extraRecipeId -> isHomemade (boolean)
   */
  const saveSelections = useCallback((recipeId, newSelections) => {
    setSelections(prev => {
      const updated = { ...prev, [recipeId]: newSelections }
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(updated))
        // FR-103: Invalidate shopping list cache when selections change
        invalidateShoppingListCache()
      } catch (err) {
        console.error('Error saving homemade selections:', err)
      }
      return updated
    })
  }, [getStorageKey])

  /**
   * Get saved selections for a recipe (for pre-populating popup).
   * @param recipeId - The parent recipe ID
   * @returns Map of extraRecipeId -> isHomemade, or empty object if none saved
   */
  const getSelections = useCallback((recipeId) => {
    return selections[recipeId] || {}
  }, [selections])

  /**
   * Clear all selections (e.g., on logout).
   */
  const clearSelections = useCallback(() => {
    setSelections({})
    try {
      localStorage.removeItem(getStorageKey())
    } catch (err) {
      console.error('Error clearing homemade selections:', err)
    }
  }, [getStorageKey])

  const value = {
    selections,
    selectionsLoaded,
    saveSelections,
    getSelections,
    clearSelections
  }

  return (
    <HomemadeSelectionsContext.Provider value={value}>
      {children}
    </HomemadeSelectionsContext.Provider>
  )
}

export const useHomemadeSelections = () => {
  const context = useContext(HomemadeSelectionsContext)
  if (!context) {
    throw new Error('useHomemadeSelections must be used within a HomemadeSelectionsProvider')
  }
  return context
}

export default HomemadeSelectionsContext
