import { useShoppingList } from '../../contexts/ShoppingListContext'

/**
 * ShoppingListItem - Individual shopping list item with checkbox
 * Supports FR-021 (check-off items), FR-024 (sorting)
 */
const ShoppingListItem = ({ item }) => {
  const { toggleItem, isItemChecked } = useShoppingList()
  const checked = isItemChecked(item.ingredientId, item.unit)

  const handleClick = () => {
    toggleItem(item.ingredientId, item.unit)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleItem(item.ingredientId, item.unit)
    }
  }

  return (
    <div
      className={`shopping-item ${checked ? 'checked' : ''}`}
      data-aisle={item.aisleName.toLowerCase()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
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
        {parseFloat(item.totalQuantity).toFixed(2)} {item.unit}
      </span>
    </div>
  )
}

export default ShoppingListItem
