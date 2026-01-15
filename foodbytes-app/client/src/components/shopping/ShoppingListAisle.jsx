import { useState } from 'react'
import ShoppingListItem from './ShoppingListItem'

/**
 * ShoppingListAisle - Collapsible aisle section with items
 * Supports FR-020 (aisle grouping)
 */
const ShoppingListAisle = ({ aisleData, startDate }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const { aisleName, items } = aisleData

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
          {aisleName} ({items.length})
        </h2>
        <span className="expand-icon" aria-hidden="true">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      {isExpanded && (
        <div className="aisle-items">
          {items.map(item => (
            <ShoppingListItem
              key={item.id}
              item={item}
              startDate={startDate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ShoppingListAisle
