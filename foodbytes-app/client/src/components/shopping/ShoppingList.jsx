import { useState } from 'react'
import { useShoppingList } from '../../contexts/ShoppingListContext'
import useHideTicked from '../../hooks/useHideTicked'
import useWakeLock from '../../hooks/useWakeLock'
import ShoppingListHeader from './ShoppingListHeader'
import ShoppingListAisle from './ShoppingListAisle'
import GenerateShoppingListModal from './GenerateShoppingListModal'
import './ShoppingList.css'

const isAisleDone = (aisle) => aisle.items.every(i => i.isChecked)

/**
 * ShoppingList - Main container for shopping list feature
 * Supports FR-019 (display shopping list), FR-020 (aisle grouping)
 * Now uses persisted shopping list from database
 */
const ShoppingList = () => {
  const { shoppingList, sortedAisles, loading, error, isGenerating, listExists } = useShoppingList()
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generateMode, setGenerateMode] = useState('week')
  const [hideTicked, setHideTicked] = useHideTicked()
  const wakeLock = useWakeLock(false)

  const openGenerate = (mode = 'week') => {
    setGenerateMode(mode)
    setShowGenerateModal(true)
  }

  const generateModal = (showWarning) => showGenerateModal && (
    <GenerateShoppingListModal
      onClose={() => setShowGenerateModal(false)}
      showWarning={showWarning}
      mode={generateMode}
    />
  )

  const header = (
    <ShoppingListHeader
      onGenerateClick={openGenerate}
      hideTicked={hideTicked}
      onToggleHideTicked={setHideTicked}
      wakeLock={wakeLock}
    />
  )

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
            onClick={() => openGenerate('week')}
          >
            Generate Shopping List
          </button>
        </div>
        {generateModal(false)}
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
            onClick={() => openGenerate('week')}
          >
            Generate Shopping List
          </button>
        </div>
        {generateModal(false)}
      </div>
    )
  }

  // Show empty list state (list exists but has no items)
  if (!sortedAisles || sortedAisles.length === 0) {
    return (
      <div className="shopping-list-page">
        {header}
        <div className="empty-state">
          <p>Your shopping list is empty.</p>
          <p>Add recipes to your meal plan and regenerate!</p>
        </div>
        {generateModal(true)}
      </div>
    )
  }

  // Finished aisles go last; sort is stable so the server's aisle order holds within each group
  const orderedAisles = [...sortedAisles].sort((a, b) => isAisleDone(a) - isAisleDone(b))

  // Show full shopping list
  return (
    <div className="shopping-list-page">
      {header}
      <div className="shopping-list-content">
        {orderedAisles.map(aisleData => (
          <ShoppingListAisle
            key={aisleData.aisleId || 'other'}
            aisleData={aisleData}
            startDate={shoppingList?.startDate}
            hideTicked={hideTicked}
          />
        ))}
      </div>
      {generateModal(true)}
    </div>
  )
}

export default ShoppingList
