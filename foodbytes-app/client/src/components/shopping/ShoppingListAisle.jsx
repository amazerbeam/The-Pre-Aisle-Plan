import { useEffect, useState } from 'react'
import ShoppingListItem from './ShoppingListItem'

/**
 * ShoppingListAisle - Collapsible aisle section with items
 * Supports FR-020 (aisle grouping). A finished aisle folds itself; the user can reopen it.
 */
const ShoppingListAisle = ({ aisleData, startDate, hideTicked }) => {
  const { aisleName, items } = aisleData
  const isDone = items.every(i => i.isChecked)
  // null = follow the default (open while unfinished); a click overrides it until isDone changes.
  const [open, setOpen] = useState(null)
  useEffect(() => { setOpen(null) }, [isDone])

  const isExpanded = open ?? !isDone
  const tickedCount = items.filter(i => i.isChecked).length
  const visibleItems = hideTicked ? items.filter(i => !i.isChecked) : items
  const hiddenCount = items.length - visibleItems.length

  return (
    <div className={`shopping-aisle ${isDone ? 'is-done' : ''}`} data-aisle={aisleName.toLowerCase()}>
      <button
        type="button"
        className="aisle-header"
        aria-expanded={isExpanded}
        onClick={() => setOpen(!isExpanded)}
      >
        <span className="aisle-dot" aria-hidden="true" />
        <h2 className="aisle-name">
          {isDone && '✓ '}{aisleName}
        </h2>
        <span className="aisle-count">{tickedCount}/{items.length}</span>
        <span className="expand-icon" aria-hidden="true">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      {isExpanded && (
        <div className="aisle-items">
          {visibleItems.map(item => (
            <ShoppingListItem
              key={item.id}
              item={item}
              startDate={startDate}
            />
          ))}
          {hiddenCount > 0 && !isDone && (
            <div className="hidden-note">{hiddenCount} ticked hidden</div>
          )}
        </div>
      )}
    </div>
  )
}

export default ShoppingListAisle
