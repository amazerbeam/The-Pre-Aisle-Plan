import { createContext, useState, useContext, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import extraChoicesService from '../services/extraChoicesService'
import { LEGACY_SELECTIONS_KEY_PREFIX } from '../constants/extraChoices'

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

const readLocal = (key) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : {}
  } catch (err) {
    console.error('Error reading homemade selections:', err)
    return {}
  }
}

const isCancelled = (err) => err?.code === 'ERR_CANCELED'

/**
 * MPP-10: load the owner's per-dish defaults. The first time the server has none, upload this
 * browser's legacy localStorage selections once, then drop the local copy.
 */
const loadServerDefaults = async (legacyKey, signal) => {
  const defaults = await extraChoicesService.getDefaults({ signal })
  if (Object.keys(defaults).length > 0) return defaults
  const legacy = readLocal(legacyKey)
  if (Object.keys(legacy).length === 0) return defaults
  await extraChoicesService.importLegacy(legacy)
  try { localStorage.removeItem(legacyKey) } catch { /* storage unavailable — import is idempotent server-side */ }
  return extraChoicesService.getDefaults({ signal })
}

/**
 * FR-090 / MPP-10: homemade/store-bought defaults that pre-fill the add-to-day popup.
 * Signed-in users: the server's per-dish defaults (shared with linked accounts). The popup's
 * choices are saved server-side with the assign call, so saveSelections only refreshes the cache.
 * Guests: localStorage, unchanged.
 * FR-103: Invalidates shopping list cache when selections change.
 */
const HomemadeSelectionsContext = createContext()

export const HomemadeSelectionsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [selections, setSelections] = useState({})
  const [selectionsLoaded, setSelectionsLoaded] = useState(false)
  const [selectionsError, setSelectionsError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const storageKey = `${LEGACY_SELECTIONS_KEY_PREFIX}${user?.id || 'guest'}`

  useEffect(() => {
    setSelectionsLoaded(false)
    setSelectionsError(null)
    if (!isAuthenticated) {
      setSelections(readLocal(storageKey))
      setSelectionsLoaded(true)
      return undefined
    }
    const controller = new AbortController()
    loadServerDefaults(storageKey, controller.signal)
      .then((defaults) => setSelections(defaults))
      .catch((err) => {
        if (isCancelled(err)) return
        console.error('Error loading homemade selections:', err)
        setSelectionsError('Could not load your homemade/store-bought choices.')
        setSelections({})
      })
      .finally(() => {
        if (!controller.signal.aborted) setSelectionsLoaded(true)
      })
    return () => controller.abort()
  }, [isAuthenticated, storageKey, reloadKey])

  /**
   * Save selections for a specific recipe.
   * FR-103: Invalidates shopping list cache when selections change.
   * @param recipeId - The parent recipe ID
   * @param newSelections - Map of extraRecipeId -> isHomemade (boolean)
   */
  const saveSelections = useCallback((recipeId, newSelections) => {
    setSelections((prev) => {
      const updated = { ...prev, [recipeId]: newSelections }
      if (!isAuthenticated) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated))
        } catch (err) {
          console.error('Error saving homemade selections:', err)
        }
      }
      invalidateShoppingListCache()
      return updated
    })
  }, [isAuthenticated, storageKey])

  /**
   * Get saved selections for a recipe (for pre-populating popup).
   * @param recipeId - The parent recipe ID
   * @returns Map of extraRecipeId -> isHomemade, or empty object if none saved
   */
  const getSelections = useCallback((recipeId) => {
    return selections[recipeId] || {}
  }, [selections])

  /** MPP-10: re-read server defaults after a Manage extras week edit changed them. */
  const reloadSelections = useCallback(() => setReloadKey((k) => k + 1), [])

  /**
   * Clear all selections (e.g., on logout).
   */
  const clearSelections = useCallback(() => {
    setSelections({})
    try {
      localStorage.removeItem(storageKey)
    } catch (err) {
      console.error('Error clearing homemade selections:', err)
    }
  }, [storageKey])

  const value = {
    selections,
    selectionsLoaded,
    selectionsError,
    saveSelections,
    getSelections,
    reloadSelections,
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
