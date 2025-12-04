import { useState } from 'react'
import { useShoppingList } from '../../contexts/ShoppingListContext'
import ConfirmDialog from '../common/ConfirmDialog'

/**
 * ShoppingListHeader - Header for shopping list with date range and controls
 * Supports FR-019 (display metadata), FR-021 (uncheck all)
 */
const ShoppingListHeader = () => {
  const { shoppingList, uncheckAll } = useShoppingList()
  const [showUncheckDialog, setShowUncheckDialog] = useState(false)

  const handleConfirmUncheckAll = () => {
    uncheckAll()
    setShowUncheckDialog(false)
  }

  /**
   * Format date range for display (e.g., "Dec 1 - Dec 7")
   */
  const formatDateRange = () => {
    if (!shoppingList) return ''

    const start = new Date(shoppingList.startDate)
    const end = new Date(shoppingList.endDate)

    const startFormatted = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })

    const endFormatted = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })

    return `${startFormatted} - ${endFormatted}`
  }

  return (
    <>
      <div className="shopping-list-header">
        <div className="header-left">
          <h1>Shopping List</h1>
          <p className="date-range">{formatDateRange()}</p>
          {shoppingList && (
            <p className="item-count">
              {shoppingList.totalItems} {shoppingList.totalItems === 1 ? 'item' : 'items'}
            </p>
          )}
        </div>
        <button
          className="btn-secondary uncheck-all-btn"
          onClick={() => setShowUncheckDialog(true)}
          aria-label="Uncheck all items"
        >
          Uncheck All
        </button>
      </div>

      <ConfirmDialog
        isOpen={showUncheckDialog}
        title="Uncheck All Items?"
        message="This will uncheck all items in your shopping list. You can re-check them as needed."
        confirmText="Uncheck All"
        cancelText="Cancel"
        onConfirm={handleConfirmUncheckAll}
        onCancel={() => setShowUncheckDialog(false)}
      />
    </>
  )
}

export default ShoppingListHeader
