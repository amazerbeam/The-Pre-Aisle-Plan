import { useShoppingList } from '../../contexts/ShoppingListContext'
import ShoppingListHeader from './ShoppingListHeader'
import ShoppingListAisle from './ShoppingListAisle'
import './ShoppingList.css'

/**
 * ShoppingList - Main container for shopping list feature
 * Supports FR-019 (display shopping list), FR-020 (aisle grouping)
 */
const ShoppingList = () => {
  const { sortedAisles, loading, error } = useShoppingList()

  if (loading) {
    return (
      <div className="shopping-list-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading shopping list...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="shopping-list-page">
        <div className="error">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!sortedAisles || sortedAisles.length === 0) {
    return (
      <div className="shopping-list-page">
        <h1>Shopping List</h1>
        <div className="empty-state">
          <p>No items in shopping list.</p>
          <p>Add recipes to your meal plan to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="shopping-list-page">
      <ShoppingListHeader />
      <div className="shopping-list-content">
        {sortedAisles.map(aisleData => (
          <ShoppingListAisle
            key={aisleData.aisle.id}
            aisleData={aisleData}
          />
        ))}
      </div>
    </div>
  )
}

export default ShoppingList
