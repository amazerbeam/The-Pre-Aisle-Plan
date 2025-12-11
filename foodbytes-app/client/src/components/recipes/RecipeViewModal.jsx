import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { recipeService } from '../../services/recipeService'
import useRecipeNavigationStack from '../../hooks/useRecipeNavigationStack'
import { useHomemadeSelections } from '../../contexts/HomemadeSelectionsContext'
import LinkedRecipeNavigation from './LinkedRecipeNavigation'
import './RecipeViewModal.css'

/**
 * FR-013, FR-091, FR-092: RecipeViewModal - Fullscreen recipe view popup
 * - White text on dark background
 * - Variant dropdown for recipe families (same as RecipeCard)
 * - Keeps popup open when variant changes (updates content in-place)
 * - 99vh height with 0.5vh even margins
 * - FR-091: Linked steps display as clickable links
 * - FR-092: Navigation stack for browsing linked recipes
 */
function RecipeViewModal({
  recipe,
  servings,
  caloriesPerServing,
  onClose,
  variants,           // Array of variant objects from recipe family
  onSelectVariant,    // Callback when variant is selected: (variantId, servings) => void
  parentRecipeId = null  // FR-091: Parent recipe ID for homemade selection lookup
}) {
  // FR-092: Navigation stack for linked recipes
  const {
    currentRecipe: stackRecipe,
    push: pushRecipe,
    pop: popRecipe,
    reset: resetStack,
    canGoBack,
    previousRecipeName,
    breadcrumbs
  } = useRecipeNavigationStack(recipe)

  // FR-090: Get homemade selections to determine display for linked steps
  const { getSelections } = useHomemadeSelections()
  const homemadeSelections = parentRecipeId ? getSelections(parentRecipeId) : {}

  // State for variant dropdown
  const [selectedVariantId, setSelectedVariantId] = useState(recipe?.id)
  const [showCalorieDropdown, setShowCalorieDropdown] = useState(false)
  const [currentRecipe, setCurrentRecipe] = useState(recipe)
  const [currentCalories, setCurrentCalories] = useState(caloriesPerServing)
  const dropdownRef = useRef(null)

  // Update current recipe when prop changes
  useEffect(() => {
    setCurrentRecipe(recipe)
    setSelectedVariantId(recipe?.id)
    resetStack(recipe)
  }, [recipe, resetStack])

  // FR-092: Sync current recipe with stack when navigating
  useEffect(() => {
    if (stackRecipe && stackRecipe.id !== currentRecipe?.id) {
      setCurrentRecipe(stackRecipe)
    }
  }, [stackRecipe, currentRecipe?.id])

  /**
   * FR-092: Handle clicking a linked step to navigate to that recipe
   */
  const handleLinkedStepClick = useCallback(async (linkedRecipeId) => {
    try {
      const linkedRecipe = await recipeService.getRecipeById(linkedRecipeId)
      pushRecipe(linkedRecipe)
    } catch (err) {
      console.error('Failed to fetch linked recipe:', err)
    }
  }, [pushRecipe])

  /**
   * FR-091: Check if a linked recipe is marked as homemade
   */
  const isHomemade = useCallback((linkedRecipeId) => {
    // Default to true (homemade) if no selection saved
    return homemadeSelections[linkedRecipeId] !== false
  }, [homemadeSelections])

  // Update calories when prop changes
  useEffect(() => {
    setCurrentCalories(caloriesPerServing)
  }, [caloriesPerServing])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCalorieDropdown(false)
      }
    }
    if (showCalorieDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalorieDropdown])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showCalorieDropdown) {
          setShowCalorieDropdown(false)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, showCalorieDropdown])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Check if recipe has variants (2+ required for dropdown)
  const hasVariants = variants && variants.length >= 2

  // Sort variants by displayOrder
  const sortedVariants = useMemo(() => {
    if (!hasVariants) return []
    return [...variants].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }, [variants, hasVariants])

  // Get current variant's calories
  const getCurrentVariantCalories = () => {
    if (!hasVariants) return currentCalories
    const selectedVariant = sortedVariants.find(v => v.recipeId === selectedVariantId)
    return selectedVariant ? selectedVariant.caloriesPerServing : currentCalories
  }

  // Handle variant selection - update in-place without closing popup
  // FR-013: Fetch variant recipe data internally to keep modal open
  const handleVariantSelect = async (variantId) => {
    setSelectedVariantId(variantId)
    setShowCalorieDropdown(false)

    // Update calories immediately from variant data
    const selectedVariant = sortedVariants.find(v => v.recipeId === variantId)
    if (selectedVariant) {
      setCurrentCalories(selectedVariant.caloriesPerServing)
    }

    // Fetch full recipe data for the variant (ingredients, steps) internally
    // Do NOT call parent's onSelectVariant - that would cause unmount/remount
    if (variantId !== currentRecipe?.id) {
      try {
        const variantRecipe = await recipeService.getRecipeById(variantId)
        setCurrentRecipe(variantRecipe)
      } catch (err) {
        console.error('Failed to fetch variant recipe:', err)
      }
    }
  }

  if (!currentRecipe) return null

  // Scale quantity based on servings vs default servings
  const scaleQuantity = (originalQty) => {
    const scaled = (originalQty / currentRecipe.defaultServings) * servings
    return Number.isInteger(scaled) ? scaled : scaled.toFixed(2)
  }

  return (
    <div className="recipe-view-overlay" onClick={onClose}>
      <div className="recipe-view-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="recipe-view-header">
          <div className="header-content">
            {/* FR-092: Back navigation for linked recipes */}
            <LinkedRecipeNavigation
              canGoBack={canGoBack}
              previousRecipeName={previousRecipeName}
              breadcrumbs={breadcrumbs}
              onBack={popRecipe}
              showBreadcrumbs={false}
            />
            <h2 className="recipe-title">{currentRecipe.name}</h2>
            <div className="recipe-meta">
              {/* FR-013: Variant dropdown OR plain calories badge */}
              {hasVariants ? (
                <div className="calorie-dropdown-container" ref={dropdownRef}>
                  <button
                    className="calorie-dropdown-trigger"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowCalorieDropdown(!showCalorieDropdown)
                    }}
                    aria-expanded={showCalorieDropdown}
                    aria-haspopup="listbox"
                  >
                    <span className="calories-text">{getCurrentVariantCalories()} cal</span>
                    <span className="dropdown-chevron">▼</span>
                  </button>
                  {showCalorieDropdown && (
                    <ul className="calorie-dropdown-menu" role="listbox">
                      {sortedVariants.map((variant) => (
                        <li
                          key={variant.recipeId}
                          className={`calorie-dropdown-item ${variant.recipeId === selectedVariantId ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleVariantSelect(variant.recipeId)
                          }}
                          role="option"
                          aria-selected={variant.recipeId === selectedVariantId}
                        >
                          <span className="variant-name">{variant.variantLabel || 'Standard'}</span>
                          <span className="variant-calories">{variant.caloriesPerServing} cal</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <span className="calories-badge">{currentCalories} cal/serving</span>
              )}
              <span className="servings-badge">{servings} serving{servings !== 1 ? 's' : ''}</span>
              {currentRecipe.isCheat && <span className="cheat-badge">Cheat</span>}
            </div>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close recipe view"
          >
            ×
          </button>
        </header>

        {/* Content */}
        <div className="recipe-view-content">
          {/* Ingredients */}
          <section className="ingredients-section">
            <h3>Ingredients</h3>
            {currentRecipe.ingredients && currentRecipe.ingredients.length > 0 ? (
              <ul className="ingredients-list">
                {currentRecipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="ingredient-item">
                    <span className="ingredient-quantity">{scaleQuantity(ing.quantity)}</span>
                    <span className="ingredient-unit">{ing.unit}</span>
                    <span className="ingredient-name">{ing.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-content">No ingredients listed</p>
            )}
          </section>

          {/* Steps - FR-091: Handle linked steps */}
          <section className="steps-section">
            <h3>Instructions</h3>
            {currentRecipe.steps && currentRecipe.steps.length > 0 ? (
              <ol className="steps-list">
                {currentRecipe.steps.map((step, idx) => {
                  // Handle both old format (string) and new format (object)
                  const stepObj = typeof step === 'string'
                    ? { instruction: step }
                    : step

                  // FR-091: Determine what to display based on linked recipe state
                  const hasLink = stepObj.linkedRecipeId != null
                  const homemade = hasLink ? isHomemade(stepObj.linkedRecipeId) : true

                  // Show alt instruction if linked and store-bought
                  const displayText = hasLink && !homemade && stepObj.altInstruction
                    ? stepObj.altInstruction
                    : stepObj.instruction

                  return (
                    <li key={idx} className="step-item">
                      {hasLink && homemade ? (
                        // Linked and homemade - show as clickable link
                        <button
                          className="linked-step-button"
                          onClick={() => handleLinkedStepClick(stepObj.linkedRecipeId)}
                          title={`View ${stepObj.linkedRecipeName} recipe`}
                        >
                          {displayText}
                        </button>
                      ) : (
                        // No link or store-bought - show as plain text
                        <span>{displayText}</span>
                      )}
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="no-content">No instructions listed</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default RecipeViewModal
