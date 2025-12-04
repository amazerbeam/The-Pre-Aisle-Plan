import { useState, useEffect, useRef } from 'react'
import { recipeService } from '../../services/recipeService'
import RecipeInfoForm from './RecipeInfoForm'
import RecipeIngredientsForm from './RecipeIngredientsForm'
import RecipeStepsForm from './RecipeStepsForm'
import ConfirmDialog from '../common/ConfirmDialog'
import './RecipeEditModal.css'

/**
 * Main admin modal for recipe editing (FR-033).
 * Shows 3-option menu: [Steps] [Ingredients] [Recipe Info]
 * Plus [Delete] button in red, separated.
 */
function RecipeEditModal({ recipeId, isNew, onClose, onSave }) {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeForm, setActiveForm] = useState(null) // 'info', 'ingredients', 'steps'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [saveMessage, setSaveMessage] = useState(null)
  const modalRef = useRef(null)

  // Load recipe data
  useEffect(() => {
    if (isNew) {
      // New recipe - start with empty data
      setRecipe({
        name: '',
        defaultServings: 2,
        calories: 0,
        isCheat: false,
        isLive: false,
        mealTypes: [],
        ingredients: [],
        steps: []
      })
      setLoading(false)
    } else if (recipeId) {
      loadRecipe()
    }
  }, [recipeId, isNew])

  const loadRecipe = async () => {
    try {
      setLoading(true)
      const data = await recipeService.getRecipeByIdAdmin(recipeId)
      setRecipe(data)
      setError(null)
    } catch (err) {
      setError('Failed to load recipe')
      console.error('Error loading recipe:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle close with unsaved changes check
  const handleClose = () => {
    if (hasUnsavedChanges) {
      setPendingAction('close')
      setShowDiscardConfirm(true)
    } else {
      onClose()
    }
  }

  // Handle back to menu with unsaved changes check
  const handleBackToMenu = () => {
    if (hasUnsavedChanges) {
      setPendingAction('back')
      setShowDiscardConfirm(true)
    } else {
      setActiveForm(null)
    }
  }

  // Confirm discard changes
  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false)
    setHasUnsavedChanges(false)
    if (pendingAction === 'close') {
      onClose()
    } else if (pendingAction === 'back') {
      setActiveForm(null)
    }
    setPendingAction(null)
  }

  // Handle form save
  const handleFormSave = async (updatedData, formType) => {
    try {
      // Merge updated data into recipe
      const newRecipe = { ...recipe, ...updatedData }

      // Save to server
      let savedRecipe
      if (isNew) {
        savedRecipe = await recipeService.createRecipe(newRecipe)
      } else {
        savedRecipe = await recipeService.updateRecipe(recipeId, newRecipe)
      }

      setRecipe(savedRecipe)
      setHasUnsavedChanges(false)
      setSaveMessage({ type: 'success', text: `${formType} saved successfully!` })

      // Clear message after 2 seconds and go back to menu
      setTimeout(() => {
        setSaveMessage(null)
        setActiveForm(null)
      }, 2000)

      // Notify parent of save
      if (onSave) {
        onSave(savedRecipe)
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to save. Please try again.' })
      console.error('Error saving recipe:', err)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    try {
      await recipeService.deleteRecipe(recipeId)
      setShowDeleteConfirm(false)
      if (onSave) {
        onSave(null) // Signal deletion
      }
      onClose()
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to delete recipe.' })
      console.error('Error deleting recipe:', err)
    }
  }

  // Click outside to close (with unsaved check)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (loading) {
    return (
      <div className="recipe-edit-modal-overlay">
        <div className="recipe-edit-modal">
          <div className="loading-message">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="recipe-edit-modal-overlay">
        <div className="recipe-edit-modal">
          <div className="error-message">{error}</div>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="recipe-edit-modal-overlay" onClick={handleOverlayClick}>
        <div className="recipe-edit-modal" ref={modalRef} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <header className="modal-header">
            {activeForm ? (
              <button className="back-button" onClick={handleBackToMenu}>
                ← Back
              </button>
            ) : (
              <span className="modal-title">
                {isNew ? 'New Recipe' : `Edit: ${recipe?.name || 'Recipe'}`}
              </span>
            )}
            <button className="close-button" onClick={handleClose}>×</button>
          </header>

          {/* Save message */}
          {saveMessage && (
            <div className={`save-message ${saveMessage.type}`}>
              {saveMessage.text}
            </div>
          )}

          {/* Content */}
          <div className="modal-content">
            {!activeForm ? (
              // 3-option menu
              <div className="edit-menu">
                <button
                  className="menu-button"
                  onClick={() => setActiveForm('steps')}
                >
                  <span className="menu-icon">📝</span>
                  <span className="menu-label">Steps</span>
                  <span className="menu-count">{recipe?.steps?.length || 0} steps</span>
                </button>

                <button
                  className="menu-button"
                  onClick={() => setActiveForm('ingredients')}
                >
                  <span className="menu-icon">🥕</span>
                  <span className="menu-label">Ingredients</span>
                  <span className="menu-count">{recipe?.ingredients?.length || 0} items</span>
                </button>

                <button
                  className="menu-button"
                  onClick={() => setActiveForm('info')}
                >
                  <span className="menu-icon">ℹ️</span>
                  <span className="menu-label">Recipe Info</span>
                </button>

                {/* Delete button - only for existing recipes */}
                {!isNew && (
                  <button
                    className="menu-button delete-button"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <span className="menu-icon">🗑️</span>
                    <span className="menu-label">Delete Recipe</span>
                  </button>
                )}
              </div>
            ) : activeForm === 'info' ? (
              <RecipeInfoForm
                recipe={recipe}
                isNew={isNew}
                onSave={(data) => handleFormSave(data, 'Recipe info')}
                onCancel={handleBackToMenu}
                setHasUnsavedChanges={setHasUnsavedChanges}
              />
            ) : activeForm === 'ingredients' ? (
              <RecipeIngredientsForm
                ingredients={recipe?.ingredients || []}
                onSave={(data) => handleFormSave({ ingredients: data.ingredients, newIngredients: data.newIngredients, newUnits: data.newUnits }, 'Ingredients')}
                onCancel={handleBackToMenu}
                setHasUnsavedChanges={setHasUnsavedChanges}
              />
            ) : activeForm === 'steps' ? (
              <RecipeStepsForm
                steps={recipe?.steps || []}
                onSave={(data) => handleFormSave({ steps: data }, 'Steps')}
                onCancel={handleBackToMenu}
                setHasUnsavedChanges={setHasUnsavedChanges}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Recipe"
        message={`Are you sure you want to permanently delete "${recipe?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Discard changes confirmation */}
      <ConfirmDialog
        isOpen={showDiscardConfirm}
        title="Unsaved Changes"
        message="You have unsaved changes. Discard changes?"
        confirmText="Discard"
        cancelText="Keep Editing"
        onConfirm={handleConfirmDiscard}
        onCancel={() => {
          setShowDiscardConfirm(false)
          setPendingAction(null)
        }}
      />
    </>
  )
}

export default RecipeEditModal
