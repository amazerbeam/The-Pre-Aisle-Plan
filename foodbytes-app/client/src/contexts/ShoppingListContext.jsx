import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useMealPlan } from './MealPlanContext'
import shoppingService from '../services/shoppingService'

const ShoppingListContext = createContext()

// FR-103: Cache keys for localStorage
const CACHE_KEYS = {
  GENERATED_DATE: 'shoppingListGeneratedDate',
  START_DATE: 'shoppingListStartDate',
  INVALIDATED: 'shoppingListInvalidated'
}

// FR-103: Minimum display time for generating message (2 seconds)
const MIN_GENERATING_TIME_MS = 2000

/**
 * ShoppingListProvider - Manages shopping list state
 * Supports FR-019 (aggregated list), FR-020 (aisle grouping),
 * FR-021 (check-off items), FR-024 (sorting), FR-103 (cache tracking)
 */
export const ShoppingListProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const { startDate } = useMealPlan()
  // Note: We read selections directly from localStorage in fetchShoppingList
  // to avoid React state timing issues

  // Shopping list data
  const [shoppingList, setShoppingList] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // FR-103: Generating message state (shows "Generating shopping list...")
  const [isGenerating, setIsGenerating] = useState(false)

  // FR-021: Track checked items in Map (ingredientId_unit -> boolean)
  const [checkStates, setCheckStates] = useState(new Map())

  // FR-024: Client-sorted aisles (unchecked first, then alphabetical)
  const [sortedAisles, setSortedAisles] = useState([])

  // ========================================
  // FR-103: Cache Management Functions
  // ========================================

  /**
   * FR-103: Get cache info from localStorage
   */
  const getCacheInfo = useCallback(() => {
    try {
      return {
        generatedDate: localStorage.getItem(CACHE_KEYS.GENERATED_DATE),
        startDate: localStorage.getItem(CACHE_KEYS.START_DATE),
        invalidated: localStorage.getItem(CACHE_KEYS.INVALIDATED) === 'true'
      }
    } catch (err) {
      console.error('Failed to read cache info:', err)
      return { generatedDate: null, startDate: null, invalidated: true }
    }
  }, [])

  /**
   * FR-103: Store cache info in localStorage
   */
  const setCacheInfo = useCallback((currentStartDate, generatedDate) => {
    try {
      localStorage.setItem(CACHE_KEYS.GENERATED_DATE, generatedDate)
      localStorage.setItem(CACHE_KEYS.START_DATE, currentStartDate)
      localStorage.removeItem(CACHE_KEYS.INVALIDATED)
    } catch (err) {
      console.error('Failed to save cache info:', err)
    }
  }, [])

  /**
   * FR-103: Check if cache is valid
   * Cache is valid if:
   * 1. Not marked as invalidated
   * 2. Same start date as current request
   * 3. We have existing shopping list data
   */
  const isCacheValid = useCallback((currentStartDate) => {
    const cache = getCacheInfo()

    // Cache is invalid if explicitly invalidated
    if (cache.invalidated) return false

    // Cache is invalid if start date doesn't match
    if (cache.startDate !== currentStartDate) return false

    // Cache is valid if we have data
    return shoppingList !== null
  }, [getCacheInfo, shoppingList])

  /**
   * FR-103: Invalidate the cache
   * Called when meal plan changes or homemade selections change
   */
  const invalidateCache = useCallback(() => {
    try {
      localStorage.setItem(CACHE_KEYS.INVALIDATED, 'true')
    } catch (err) {
      console.error('Failed to invalidate cache:', err)
    }
  }, [])

  /**
   * Load check states from localStorage
   */
  const loadCheckStatesFromStorage = useCallback(() => {
    if (!user?.id) return new Map()

    try {
      const storageKey = `shoppingListCheckStates_${user.id}`
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        return new Map(Object.entries(parsed))
      }
    } catch (err) {
      console.error('Failed to load check states from localStorage:', err)
    }

    return new Map()
  }, [user?.id])

  /**
   * Save check states to localStorage
   */
  const saveCheckStatesToStorage = useCallback((states) => {
    if (!user?.id) return

    try {
      const storageKey = `shoppingListCheckStates_${user.id}`
      const obj = Object.fromEntries(states)
      localStorage.setItem(storageKey, JSON.stringify(obj))
    } catch (err) {
      console.error('Failed to save check states to localStorage:', err)
    }
  }, [user?.id])

  /**
   * Load check states on mount or when user changes
   */
  useEffect(() => {
    const states = loadCheckStatesFromStorage()
    setCheckStates(states)
  }, [loadCheckStatesFromStorage])

  /**
   * Check if an item is checked
   * @param {number} ingredientId
   * @param {string} unit
   * @returns {boolean}
   */
  const isItemChecked = useCallback((ingredientId, unit) => {
    const key = `${ingredientId}_${unit}`
    return checkStates.get(key) || false
  }, [checkStates])

  /**
   * FR-024: Sort items within an aisle
   * Rules: 1) Unchecked first, 2) Alphabetically by ingredient name
   */
  const sortItemsInAisle = useCallback((items) => {
    return [...items].sort((a, b) => {
      const aChecked = isItemChecked(a.ingredientId, a.unit)
      const bChecked = isItemChecked(b.ingredientId, b.unit)

      // 1. Unchecked items first
      if (aChecked !== bChecked) return aChecked ? 1 : -1

      // 2. Alphabetically by ingredient name
      return a.ingredientName.localeCompare(b.ingredientName)
    })
  }, [isItemChecked])

  /**
   * Apply sorting to all aisles
   */
  const applySorting = useCallback((aisles) => {
    if (!aisles) return []

    return aisles.map(aisleData => ({
      ...aisleData,
      items: sortItemsInAisle(aisleData.items)
    }))
  }, [sortItemsInAisle])

  /**
   * FR-019: Fetch shopping list from API
   * FR-101: Read selections directly from localStorage to avoid React state race conditions
   * FR-103: Check cache validity before fetching, show "Generating..." with minimum 2s display
   */
  const fetchShoppingList = useCallback(async (date, forceRefresh = false) => {
    if (!isAuthenticated || !date) {
      setShoppingList(null)
      setSortedAisles([])
      return
    }

    // FR-103: Check cache validity before fetching (unless forced)
    if (!forceRefresh && isCacheValid(date)) {
      // Use existing data, no need to fetch
      return
    }

    setLoading(true)
    setIsGenerating(true)
    setError(null)

    const startTime = Date.now()

    try {
      // FR-101: Read selections directly from localStorage to avoid timing issues
      const storageKey = `homemadeSelections_${user?.id || 'guest'}`
      let currentSelections = {}
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          currentSelections = JSON.parse(stored)
        }
      } catch (e) {
        console.error('Error reading selections from localStorage:', e)
      }

      const data = await shoppingService.getShoppingListWithSelections(date, currentSelections)

      // FR-103: Ensure minimum 2 second display for "Generating shopping list..."
      const elapsed = Date.now() - startTime
      if (elapsed < MIN_GENERATING_TIME_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_GENERATING_TIME_MS - elapsed))
      }

      setShoppingList(data)

      // FR-103: Store cache info
      setCacheInfo(date, new Date().toISOString())
    } catch (err) {
      console.error('Failed to fetch shopping list:', err)
      setError('Failed to load shopping list')
      setShoppingList(null)
      setSortedAisles([])
    } finally {
      setLoading(false)
      setIsGenerating(false)
    }
  }, [isAuthenticated, user?.id, isCacheValid, setCacheInfo])

  /**
   * Auto-refresh shopping list when startDate or auth changes
   * FR-101: Reads selections directly from localStorage in fetchShoppingList
   */
  useEffect(() => {
    if (startDate && isAuthenticated) {
      fetchShoppingList(startDate)
    }
  }, [startDate, isAuthenticated, fetchShoppingList])

  /**
   * Re-sort aisles when checkStates change
   */
  useEffect(() => {
    if (shoppingList?.aisles) {
      const sorted = applySorting(shoppingList.aisles)
      setSortedAisles(sorted)
    }
  }, [checkStates, shoppingList, applySorting])

  /**
   * FR-021: Toggle item check state
   * @param {number} ingredientId
   * @param {string} unit
   */
  const toggleItem = useCallback((ingredientId, unit) => {
    const key = `${ingredientId}_${unit}`
    setCheckStates(prevStates => {
      const newStates = new Map(prevStates)
      const currentState = newStates.get(key) || false
      newStates.set(key, !currentState)

      // Save to localStorage
      saveCheckStatesToStorage(newStates)

      return newStates
    })
  }, [saveCheckStatesToStorage])

  /**
   * FR-021: Uncheck all items
   */
  const uncheckAll = useCallback(() => {
    setCheckStates(new Map())

    // Clear localStorage
    if (user?.id) {
      try {
        const storageKey = `shoppingListCheckStates_${user.id}`
        localStorage.removeItem(storageKey)
      } catch (err) {
        console.error('Failed to clear check states from localStorage:', err)
      }
    }
  }, [user?.id])

  const value = {
    // Data
    shoppingList,
    sortedAisles,
    loading,
    error,
    isGenerating,  // FR-103: For "Generating shopping list..." message

    // Operations
    fetchShoppingList,
    toggleItem,
    uncheckAll,
    isItemChecked,
    invalidateCache  // FR-103: For invalidating cache from other contexts
  }

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  )
}

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext)
  if (!context) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider')
  }
  return context
}

export default ShoppingListContext
