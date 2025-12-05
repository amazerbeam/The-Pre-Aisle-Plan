import { useEffect, useState, useRef, useMemo } from 'react'
import './RecipeViewModal.css'

/**
 * FR-013: RecipeViewModal - Fullscreen recipe view popup with variant support
 * - White text on dark background
 * - Variant dropdown for recipe families (same as RecipeCard)
 * - Keeps popup open when variant changes (updates content in-place)
 * - 99vh height with 0.5vh even margins
 */
function RecipeViewModal({
  recipe,
  servings,
  caloriesPerServing,
  onClose,
  variants,           // Array of variant objects from recipe family
  onSelectVariant     // Callback when variant is selected: (variantId, servings) => void
}) {
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
  }, [recipe])

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
  const handleVariantSelect = async (variantId) => {
    setSelectedVariantId(variantId)
    setShowCalorieDropdown(false)

    // Update calories immediately from variant data
    const selectedVariant = sortedVariants.find(v => v.recipeId === variantId)
    if (selectedVariant) {
      setCurrentCalories(selectedVariant.caloriesPerServing)
    }

    // Call parent callback to fetch full recipe data for the variant
    if (onSelectVariant && variantId !== currentRecipe?.id) {
      onSelectVariant(variantId, servings)
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
                    <span className="calories-text">{getCurrentVariantCalories()} cal/serving</span>
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

          {/* Steps */}
          <section className="steps-section">
            <h3>Instructions</h3>
            {currentRecipe.steps && currentRecipe.steps.length > 0 ? (
              <ol className="steps-list">
                {currentRecipe.steps.map((step, idx) => (
                  <li key={idx} className="step-item">{step}</li>
                ))}
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
