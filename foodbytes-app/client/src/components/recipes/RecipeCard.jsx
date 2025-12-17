import { useState, useMemo, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import DayAssignmentButtons from './DayAssignmentButtons'
import RecipeViewModal from './RecipeViewModal'
import './RecipeCard.css'

function RecipeCard({ recipe, currentMealType, onSelectVariant, onEdit }) {
  const { isAdmin } = useAuth()
  const [showDetails, setShowDetails] = useState(false)
  const [servings, setServings] = useState(recipe.defaultServings || 1)
  // FR-043: Track selected variant (default to current recipe)
  const [selectedVariantId, setSelectedVariantId] = useState(recipe.id)
  // FR-043: Track if calorie dropdown is open
  const [showCalorieDropdown, setShowCalorieDropdown] = useState(false)
  // Fullscreen recipe view state
  const [showFullscreen, setShowFullscreen] = useState(false)
  // FR-013: Track the recipe to display in fullscreen modal (may change on variant selection)
  const [modalRecipe, setModalRecipe] = useState(recipe)
  const dropdownRef = useRef(null)

  // FR-013: Sync modal recipe when recipe prop changes
  useEffect(() => {
    setModalRecipe(recipe)
  }, [recipe])

  // FR-043: Close dropdown when clicking outside
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

  const scaleQuantity = (originalQty) => {
    const scaled = (originalQty / recipe.defaultServings) * servings
    // Round to 2 decimal places, but show as integer if whole number
    return Number.isInteger(scaled) ? scaled : scaled.toFixed(2)
  }

  // FR-036: Fixed per-serving calories (does NOT scale with servings)
  const perServingCalories = Math.round(recipe.calories / recipe.defaultServings)

  // FR-043: Check if recipe has variants
  const hasVariants = recipe.variants && recipe.variants.length >= 2

  // FR-043: Sort variants by display order (Standard first, then Light, then Full)
  const sortedVariants = useMemo(() => {
    if (!hasVariants) return []
    return [...recipe.variants].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }, [recipe.variants, hasVariants])

  // FR-043: Handle variant selection from calorie dropdown
  const handleVariantSelect = (variantId) => {
    setSelectedVariantId(variantId)
    setShowCalorieDropdown(false)
    if (variantId !== recipe.id && onSelectVariant) {
      onSelectVariant(variantId, servings)
    }
  }

  // FR-043: Get current variant's calories for display
  const getCurrentVariantCalories = () => {
    if (!hasVariants) return perServingCalories
    const currentVariant = sortedVariants.find(v => v.recipeId === selectedVariantId)
    return currentVariant ? currentVariant.caloriesPerServing : perServingCalories
  }

  // FR-013: Handle variant selection in fullscreen modal (update content in-place)
  // RecipeViewModal now handles variant switching internally - just sync local state
  const handleModalVariantSelect = async (variantId) => {
    // Sync local selectedVariantId state for consistency
    // Modal fetches recipe data internally to stay open
    setSelectedVariantId(variantId)
  }

  return (
    <article className="recipe-card">
      {/* Dark header with recipe name and action buttons */}
      <div className="card-header">
        <h3 className="recipe-name">{recipe.name}</h3>
        <div className="header-actions">
          {recipe.isCheat && <span className="cheat-badge">Cheat</span>}
          {/* FR-033: Edit button for admins - uses selected variant ID */}
          {isAdmin && onEdit && (
            <button
              className="header-icon-btn edit-btn"
              onClick={() => onEdit(selectedVariantId)}
              title="Edit recipe"
              aria-label="Edit recipe"
            >
              <svg fill="none" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
          {/* Expand to fullscreen button */}
          <button
            className="header-icon-btn"
            onClick={() => setShowFullscreen(true)}
            title="View fullscreen"
            aria-label="Expand recipe to fullscreen"
          >
            <svg fill="none" viewBox="0 0 24 24">
              <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Meta Pill Bar: Calories | Variant | Servings */}
      <div className="meta-pill">
        {/* FR-043: Calorie dropdown with variants */}
        {hasVariants ? (
          <div className="calorie-dropdown-container" ref={dropdownRef}>
            <button
              className="cal-dropdown"
              onClick={() => setShowCalorieDropdown(!showCalorieDropdown)}
              aria-expanded={showCalorieDropdown}
              aria-haspopup="listbox"
            >
              {getCurrentVariantCalories()} cal
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            {showCalorieDropdown && (
              <ul className="calorie-dropdown-menu" role="listbox">
                {sortedVariants.map((variant) => (
                  <li
                    key={variant.recipeId}
                    className={`calorie-dropdown-item ${variant.recipeId === selectedVariantId ? 'selected' : ''}`}
                    onClick={() => handleVariantSelect(variant.recipeId)}
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
          <button className="cal-dropdown" disabled>
            {perServingCalories} cal
          </button>
        )}

        {/* Variant label in center */}
        <span className="variant-badge">
          {recipe.variantLabel || 'Standard'}
        </span>

        {/* Servings pill with +/- buttons */}
        <div className="servings-pill">
          <button
            className="servings-btn"
            onClick={() => setServings(Math.max(1, servings - 1))}
            disabled={servings <= 1}
            aria-label="Decrease servings"
          >
            −
          </button>
          <span className="servings-value">{servings}</span>
          <button
            className="servings-btn"
            onClick={() => setServings(Math.min(20, servings + 1))}
            disabled={servings >= 20}
            aria-label="Increase servings"
          >
            +
          </button>
        </div>
      </div>

      {/* FR-014, FR-015, FR-043: Day assignment buttons (hidden for guests) */}
      <DayAssignmentButtons
        recipe={recipe}
        servings={servings}
        currentMealType={currentMealType}
        selectedRecipeId={selectedVariantId}
      />

      {/* Show Details button hidden - users can use fullscreen modal instead
      <button
        className="details-toggle"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>

      {showDetails && (
        <div className="recipe-details">
          <div className="ingredients-section">
            <h4>Ingredients</h4>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx}>
                  <span className="quantity">{scaleQuantity(ing.quantity)}</span>
                  <span className="unit">{ing.unit}</span>
                  <span className="ingredient-name">{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="steps-section">
            <h4>Instructions</h4>
            <ol className="steps-list">
              {recipe.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
      */}

      {/* FR-013: Fullscreen Recipe View Modal with variant support */}
      {showFullscreen && (
        <RecipeViewModal
          recipe={modalRecipe}
          servings={servings}
          caloriesPerServing={getCurrentVariantCalories()}
          onClose={() => setShowFullscreen(false)}
          variants={recipe.variants}
          onSelectVariant={handleModalVariantSelect}
        />
      )}
    </article>
  )
}

export default RecipeCard
