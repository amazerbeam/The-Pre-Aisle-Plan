import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useMealPlan } from './MealPlanContext'
import shoppingService from '../services/shoppingService'

const ShoppingListContext = createContext()

/**
 * ShoppingListProvider - Manages shopping list state
 * Supports FR-019 (aggregated list), FR-020 (aisle grouping),
 * FR-021 (check-off items), FR-024 (sorting)
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

  // FR-021: Track checked items in Map (ingredientId_unit -> boolean)
  const [checkStates, setCheckStates] = useState(new Map())

  // FR-024: Client-sorted aisles (unchecked first, then alphabetical)
  const [sortedAisles, setSortedAisles] = useState([])

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
   */
  const fetchShoppingList = useCallback(async (date) => {
    if (!isAuthenticated || !date) {
      setShoppingList(null)
      setSortedAisles([])
      return
    }

    setLoading(true)
    setError(null)

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
      setShoppingList(data)
    } catch (err) {
      console.error('Failed to fetch shopping list:', err)
      setError('Failed to load shopping list')
      setShoppingList(null)
      setSortedAisles([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

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

    // Operations
    fetchShoppingList,
    toggleItem,
    uncheckAll,
    isItemChecked
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
