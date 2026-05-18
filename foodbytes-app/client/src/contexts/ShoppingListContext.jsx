import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { useAuth } from './AuthContext'
import shoppingService from '../services/shoppingService'

const ShoppingListContext = createContext()

/**
 * ShoppingListProvider - Manages persisted shopping list state
 * Shopping list is stored in database with checked state per item.
 * Supports FR-019 (aggregated list), FR-020 (aisle grouping),
 * FR-021 (check-off items), FR-024 (sorting)
 */
export const ShoppingListProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()

  // Shopping list data (null = no list exists yet)
  const [shoppingList, setShoppingList] = useState(null)
  const [loading, setLoading] = useState(true)  // Start true to show loading on mount
  const [error, setError] = useState(null)

  // Generating state (shows spinner during generation)
  const [isGenerating, setIsGenerating] = useState(false)

  // Whether a shopping list exists for this user
  const [listExists, setListExists] = useState(false)

  // FR-024: Client-sorted aisles (unchecked first, then alphabetical)
  const [sortedAisles, setSortedAisles] = useState([])

  /**
   * Check if an item is checked (using data from API response)
   * @param {number} itemId - Shopping list item ID
   * @returns {boolean}
   */
  const isItemChecked = useCallback((itemId) => {
    if (!shoppingList?.aisles) return false

    for (const aisle of shoppingList.aisles) {
      const item = aisle.items.find(i => i.id === itemId)
      if (item) return item.isChecked
    }
    return false
  }, [shoppingList])

  /**
   * FR-024: Sort items within an aisle
   * Rules: 1) Unchecked first, 2) Alphabetically by ingredient name
   */
  const sortItemsInAisle = useCallback((items) => {
    return [...items].sort((a, b) => {
      // 1. Unchecked items first
      if (a.isChecked !== b.isChecked) return a.isChecked ? 1 : -1

      // 2. Alphabetically by ingredient name
      return a.ingredientName.localeCompare(b.ingredientName)
    })
  }, [])

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
   * Load the persisted shopping list from API
   */
  const loadShoppingList = useCallback(async () => {
    if (!isAuthenticated) {
      setShoppingList(null)
      setSortedAisles([])
      setListExists(false)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await shoppingService.getPersistedShoppingList()

      if (data.exists === false) {
        // No shopping list exists yet
        setShoppingList(null)
        setSortedAisles([])
        setListExists(false)
      } else {
        setShoppingList(data)
        setListExists(true)
      }
    } catch (err) {
      console.error('Failed to load shopping list:', err)
      setError('Failed to load shopping list')
      setShoppingList(null)
      setSortedAisles([])
      setListExists(false)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  /**
   * Generate a new shopping list
   * @param {string} startDate - ISO format date string
   * @param {string} endDate - ISO format date string
   * @param {Object} selections - Optional homemade/store-bought selections
   */
  const generateShoppingList = useCallback(async (startDate, endDate, selections = null) => {
    if (!isAuthenticated) return

    setIsGenerating(true)
    setError(null)

    try {
      const data = await shoppingService.generateShoppingList(startDate, endDate, selections)
      setShoppingList(data)
      setListExists(true)
    } catch (err) {
      console.error('Failed to generate shopping list:', err)
      setError('Failed to generate shopping list')
    } finally {
      setIsGenerating(false)
    }
  }, [isAuthenticated])

  /**
   * FR-021: Toggle item check state with optimistic update
   * Updates UI immediately, then persists to database
   * @param {number} itemId - Shopping list item ID
   */
  const toggleItem = useCallback(async (itemId) => {
    if (!shoppingList?.aisles) return

    // Optimistic update - toggle immediately in state
    setShoppingList(prev => {
      if (!prev?.aisles) return prev

      const newAisles = prev.aisles.map(aisle => ({
        ...aisle,
        items: aisle.items.map(item => {
          if (item.id === itemId) {
            return { ...item, isChecked: !item.isChecked }
          }
          return item
        })
      }))

      // Update checked count
      const totalChecked = newAisles.reduce(
        (sum, aisle) => sum + aisle.items.filter(i => i.isChecked).length,
        0
      )

      return { ...prev, aisles: newAisles, checkedItems: totalChecked }
    })

    // Persist to database in background (no await - fire and forget for optimistic UX)
    shoppingService.toggleItemChecked(itemId).catch(err => {
      console.error('Failed to persist toggle:', err)
      // On error, reload the list to restore correct state
      loadShoppingList()
    })
  }, [shoppingList, loadShoppingList])

  /**
   * FR-021: Uncheck all items
   */
  const uncheckAll = useCallback(async () => {
    if (!shoppingList?.aisles) return

    // Optimistic update
    setShoppingList(prev => {
      if (!prev?.aisles) return prev

      const newAisles = prev.aisles.map(aisle => ({
        ...aisle,
        items: aisle.items.map(item => ({ ...item, isChecked: false }))
      }))

      return { ...prev, aisles: newAisles, checkedItems: 0 }
    })

    // Persist to database
    try {
      await shoppingService.uncheckAllItems()
    } catch (err) {
      console.error('Failed to uncheck all:', err)
      loadShoppingList()
    }
  }, [shoppingList, loadShoppingList])

  /**
   * Delete the shopping list
   */
  const deleteShoppingList = useCallback(async () => {
    try {
      await shoppingService.deleteShoppingList()
      setShoppingList(null)
      setSortedAisles([])
      setListExists(false)
    } catch (err) {
      console.error('Failed to delete shopping list:', err)
    }
  }, [])

  /**
   * Load shopping list on mount and when auth changes
   */
  useEffect(() => {
    loadShoppingList()
  }, [loadShoppingList])

  /**
   * Re-sort aisles when shoppingList changes
   */
  useEffect(() => {
    if (shoppingList?.aisles) {
      const sorted = applySorting(shoppingList.aisles)
      setSortedAisles(sorted)
    } else {
      setSortedAisles([])
    }
  }, [shoppingList, applySorting])

  const value = {
    // Data
    shoppingList,
    sortedAisles,
    loading,
    error,
    isGenerating,
    listExists,

    // Operations
    loadShoppingList,
    generateShoppingList,
    toggleItem,
    uncheckAll,
    isItemChecked,
    deleteShoppingList
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
