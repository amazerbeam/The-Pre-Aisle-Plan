import { useState, useEffect, useCallback } from 'react'
import { useHomemadeSelections } from '../../contexts/HomemadeSelectionsContext'
import './ExtrasSelectionPopup.css'

/**
 * FR-087, FR-088, FR-090: ExtrasSelectionPopup - Homemade/Store-bought selection modal
 *
 * Displays hierarchical checkboxes for recipe extras.
 * - Checked = Home Made (ingredients added to shopping list)
 * - Unchecked = Store Bought (single "Store Bought X" item added instead)
 *
 * FR-088: Smart cascade - unchecking parent unchecks all children
 * FR-090: Pre-populates from localStorage, saves on confirm
 */
function ExtrasSelectionPopup({
  recipe,           // Parent recipe with hasExtras and extras array
  servings,         // Servings being assigned
  onConfirm,        // (selections) => void - called with {extraRecipeId: isHomemade}
  onCancel          // () => void - close without assigning
}) {
  const { getSelections, saveSelections } = useHomemadeSelections()

  // State: { recipeId: boolean } where true = homemade, false = store-bought
  const [selections, setSelections] = useState({})

  /**
   * Build flat map from hierarchical extras tree.
   * Default all to true (homemade) unless we have saved preferences.
   */
  const initializeSelections = useCallback((extras, saved = {}) => {
    const result = {}

    const processNode = (node) => {
      // Use saved value if exists, otherwise default to true (homemade)
      result[node.recipeId] = saved[node.recipeId] !== undefined
        ? saved[node.recipeId]
        : true

      if (node.children && node.children.length > 0) {
        node.children.forEach(processNode)
      }
    }

    extras.forEach(processNode)
    return result
  }, [])

  // Initialize selections from saved preferences on mount
  useEffect(() => {
    if (recipe?.extras) {
      const saved = getSelections(recipe.id)
      setSelections(initializeSelections(recipe.extras, saved))
    }
  }, [recipe, getSelections, initializeSelections])

  /**
   * FR-088: Get all descendant recipe IDs for cascade unchecking
   */
  const getDescendantIds = useCallback((extras, targetId) => {
    const descendants = []

    const findNode = (nodes) => {
      for (const node of nodes) {
        if (node.recipeId === targetId) {
          // Found target, collect all its descendants
          const collectDescendants = (n) => {
            if (n.children) {
              n.children.forEach(child => {
                descendants.push(child.recipeId)
                collectDescendants(child)
              })
            }
          }
          collectDescendants(node)
          return true
        }
        if (node.children && findNode(node.children)) {
          return true
        }
      }
      return false
    }

    findNode(extras)
    return descendants
  }, [])

  /**
   * FR-088: Handle checkbox toggle with smart cascade.
   * Unchecking a parent automatically unchecks all descendants.
   * Re-checking a parent does NOT automatically re-check children.
   */
  const handleToggle = useCallback((recipeId, checked) => {
    setSelections(prev => {
      const updated = { ...prev, [recipeId]: checked }

      // FR-088: If unchecking, cascade to all descendants
      if (!checked && recipe?.extras) {
        const descendants = getDescendantIds(recipe.extras, recipeId)
        descendants.forEach(id => {
          updated[id] = false
        })
      }

      return updated
    })
  }, [recipe, getDescendantIds])

  /**
   * Check if a checkbox should be disabled (parent is unchecked)
   */
  const isDisabled = useCallback((extras, targetId) => {
    const findParentState = (nodes, parentChecked = true) => {
      for (const node of nodes) {
        if (node.recipeId === targetId) {
          return !parentChecked // Disabled if parent is unchecked
        }
        if (node.children) {
          const nodeChecked = selections[node.recipeId] !== false
          const result = findParentState(node.children, parentChecked && nodeChecked)
          if (result !== null) return result
        }
      }
      return null
    }

    return findParentState(extras) || false
  }, [selections])

  /**
   * Handle confirm - save selections and call callback
   */
  const handleConfirm = () => {
    // FR-090: Save to localStorage for future pre-population
    saveSelections(recipe.id, selections)
    onConfirm(selections)
  }

  /**
   * Render hierarchical checkbox tree
   */
  const renderExtrasTree = (nodes, depth = 0) => {
    return nodes.map(node => {
      const isChecked = selections[node.recipeId] !== false
      const disabled = depth > 0 && isDisabled(recipe.extras, node.recipeId)

      return (
        <div key={node.recipeId} className="extras-tree-item">
          <label
            className={`extras-checkbox-label ${disabled ? 'disabled' : ''}`}
            style={{ paddingLeft: `${depth * 24}px` }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              disabled={disabled}
              onChange={(e) => handleToggle(node.recipeId, e.target.checked)}
              className="extras-checkbox"
            />
            <span className="extras-checkbox-custom"></span>
            <span className="extras-recipe-name">{node.recipeName}</span>
            <span className="extras-label-text">Home Made</span>
          </label>

          {node.children && node.children.length > 0 && (
            <div className="extras-children">
              {renderExtrasTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  // Prevent body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!recipe?.extras || recipe.extras.length === 0) {
    return null
  }

  return (
    <div className="extras-popup-overlay" onClick={onCancel}>
      <div className="extras-popup-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="extras-popup-header">
          <h2 className="extras-popup-title">
            Choose Homemade or Store-Bought for:
          </h2>
          <h3 className="extras-popup-recipe-name">{recipe.name}</h3>
        </header>

        {/* Content */}
        <div className="extras-popup-content">
          <p className="extras-popup-instruction">
            Uncheck if you wish to store buy and ingredients will be omitted from your shopping list
          </p>

          <div className="extras-tree-container">
            {renderExtrasTree(recipe.extras)}
          </div>
        </div>

        {/* Footer */}
        <footer className="extras-popup-footer">
          <button
            className="extras-popup-button cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="extras-popup-button confirm"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </footer>
      </div>
    </div>
  )
}

export default ExtrasSelectionPopup
