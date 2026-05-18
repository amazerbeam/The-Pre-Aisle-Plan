import { useState } from 'react'
import { useShoppingList } from '../../contexts/ShoppingListContext'
import ShoppingListHeader from './ShoppingListHeader'
import ShoppingListAisle from './ShoppingListAisle'
import GenerateShoppingListModal from './GenerateShoppingListModal'
import './ShoppingList.css'

/**
 * ShoppingList - Main container for shopping list feature
 * Supports FR-019 (display shopping list), FR-020 (aisle grouping)
 * Now uses persisted shopping list from database
 */
const ShoppingList = () => {
  const { shoppingList, sortedAisles, loading, error, isGenerating, listExists } = useShoppingList()
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  // Show generating spinner
  if (isGenerating) {
    return (
      <div className="shopping-list-page">
        <div className="generating">
          <div className="spinner"></div>
          <p>Generating shopping list...</p>
        </div>
      </div>
    )
  }

  // Show loading spinner
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

  // Show error state
  if (error) {
    return (
      <div className="shopping-list-page">
        <div className="error">
          <p>{error}</p>
          <button
            className="btn-primary generate-btn"
            onClick={() => setShowGenerateModal(true)}
          >
            Generate Shopping List
          </button>
        </div>
        {showGenerateModal && (
          <GenerateShoppingListModal
            onClose={() => setShowGenerateModal(false)}
            showWarning={false}
          />
        )}
      </div>
    )
  }

  // Show "no list" state with generate button
  if (!listExists) {
    return (
      <div className="shopping-list-page">
        <h1>Shopping List</h1>
        <div className="empty-state no-list">
          <p>You don't have a shopping list yet.</p>
          <p>Generate one based on your meal plan!</p>
          <button
            className="btn-primary generate-btn"
            onClick={() => setShowGenerateModal(true)}
          >
            Generate Shopping List
          </button>
        </div>
        {showGenerateModal && (
          <GenerateShoppingListModal
            onClose={() => setShowGenerateModal(false)}
            showWarning={false}
          />
        )}
      </div>
    )
  }

  // Show empty list state (list exists but has no items)
  if (!sortedAisles || sortedAisles.length === 0) {
    return (
      <div className="shopping-list-page">
        <ShoppingListHeader onGenerateClick={() => setShowGenerateModal(true)} />
        <div className="empty-state">
          <p>Your shopping list is empty.</p>
          <p>Add recipes to your meal plan and regenerate!</p>
        </div>
        {showGenerateModal && (
          <GenerateShoppingListModal
            onClose={() => setShowGenerateModal(false)}
            showWarning={true}
          />
        )}
      </div>
    )
  }

  // Show full shopping list
  return (
    <div className="shopping-list-page">
      <ShoppingListHeader onGenerateClick={() => setShowGenerateModal(true)} />
      <div className="shopping-list-content">
        {sortedAisles.map(aisleData => (
          <ShoppingListAisle
            key={aisleData.aisleId || 'other'}
            aisleData={aisleData}
            startDate={shoppingList?.startDate}
          />
        ))}
      </div>
      {showGenerateModal && (
        <GenerateShoppingListModal
          onClose={() => setShowGenerateModal(false)}
          showWarning={true}
        />
      )}
    </div>
  )
}

export default ShoppingList
