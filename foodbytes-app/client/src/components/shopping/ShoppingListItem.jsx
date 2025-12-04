import { useState, useRef, useCallback } from 'react'
import { useShoppingList } from '../../contexts/ShoppingListContext'
import { shoppingService } from '../../services/shoppingService'
import { useDateRange } from '../../contexts/DateRangeContext'
import IngredientBreakdownPopup from './IngredientBreakdownPopup'

/**
 * ShoppingListItem - Individual shopping list item with checkbox
 * Supports FR-021 (check-off items), FR-024 (sorting), FR-042 (long press breakdown)
 */
const ShoppingListItem = ({ item }) => {
  const { toggleItem, isItemChecked } = useShoppingList()
  const { startDate } = useDateRange()
  const checked = isItemChecked(item.ingredientId, item.unit)

  // FR-042: Long press state
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [breakdown, setBreakdown] = useState(null)
  const longPressTimer = useRef(null)
  const touchMoved = useRef(false)

  const LONG_PRESS_DURATION = 3000 // 3 seconds

  const handleClick = () => {
    // Only toggle if not in long press mode
    if (!isLongPressing) {
      toggleItem(item.ingredientId, item.unit)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleItem(item.ingredientId, item.unit)
    }
  }

  // FR-042: Start long press timer
  const startLongPress = useCallback(() => {
    // Don't show breakdown for checked items
    if (checked) return

    touchMoved.current = false
    setIsLongPressing(true)

    longPressTimer.current = setTimeout(async () => {
      // Fetch breakdown from API
      try {
        const data = await shoppingService.getIngredientBreakdown(
          item.ingredientId,
          item.unit,
          startDate
        )
        setBreakdown(data)
        setShowBreakdown(true)
      } catch (error) {
        console.error('Failed to fetch ingredient breakdown:', error)
      }
      setIsLongPressing(false)
    }, LONG_PRESS_DURATION)
  }, [checked, item.ingredientId, item.unit, startDate])

  // FR-042: Cancel long press timer
  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setIsLongPressing(false)
  }, [])

  // FR-042: Handle mouse events
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click only
      startLongPress()
    }
  }

  const handleMouseUp = () => {
    cancelLongPress()
  }

  const handleMouseLeave = () => {
    cancelLongPress()
  }

  // FR-042: Handle touch events
  const handleTouchStart = () => {
    startLongPress()
  }

  const handleTouchEnd = () => {
    cancelLongPress()
  }

  const handleTouchMove = () => {
    touchMoved.current = true
    cancelLongPress()
  }

  // FR-042: Close popup
  const closeBreakdown = useCallback(() => {
    setShowBreakdown(false)
    setBreakdown(null)
  }, [])

  // Format quantity to remove trailing zeros (FR-019)
  const formatQuantity = (qty) => {
    const num = parseFloat(qty)
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2).replace(/\.?0+$/, '')
  }

  return (
    <>
      <div
        className={`shopping-item ${checked ? 'checked' : ''} ${isLongPressing ? 'long-pressing' : ''}`}
        data-aisle={item.aisleName.toLowerCase()}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        role="button"
        tabIndex={0}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {}} // Controlled by parent click handler
          aria-label={`Check off ${item.ingredientName}`}
          tabIndex={-1} // Parent handles keyboard
        />
        <span className="item-name">{item.ingredientName}</span>
        <span className="item-quantity">
          {formatQuantity(item.totalQuantity)} {item.unit}
        </span>
        {/* FR-042: Visual feedback during long press */}
        {isLongPressing && !checked && (
          <span className="long-press-indicator">Hold...</span>
        )}
      </div>

      {/* FR-042: Breakdown popup */}
      {showBreakdown && breakdown && (
        <IngredientBreakdownPopup
          breakdown={breakdown}
          onClose={closeBreakdown}
        />
      )}
    </>
  )
}

export default ShoppingListItem
