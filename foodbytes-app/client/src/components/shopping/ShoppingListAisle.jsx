import { useState } from 'react'
import ShoppingListItem from './ShoppingListItem'

/**
 * ShoppingListAisle - Collapsible aisle section with items
 * Supports FR-020 (aisle grouping)
 */
const ShoppingListAisle = ({ aisleData }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const { aisle, items } = aisleData

  return (
    <div className="shopping-aisle">
      <div
        className="aisle-header"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsExpanded(!isExpanded)
          }
        }}
      >
        <h2 className="aisle-name">
          {aisle.name} ({items.length})
        </h2>
        <span className="expand-icon" aria-hidden="true">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      {isExpanded && (
        <div className="aisle-items">
          {items.map(item => (
            <ShoppingListItem
              key={`${item.ingredientId}_${item.unit}`}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ShoppingListAisle
