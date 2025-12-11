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
      {/* Expand to fullscreen button */}
      <button
        className="expand-button"
        onClick={() => setShowFullscreen(true)}
        title="View fullscreen"
        aria-label="Expand recipe to fullscreen"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.5 1h4v1.5h-2.793l3.146 3.146-1.061 1.061-3.146-3.146v2.793h-1.5v-4.854zm13 0v4.854h-1.5v-2.793l-3.146 3.146-1.061-1.061 3.146-3.146h-2.793v-1.5h4.854zm-13 14v-4.854h1.5v2.793l3.146-3.146 1.061 1.061-3.146 3.146h2.793v1.5h-4.854zm13 0h-4.854v-1.5h2.793l-3.146-3.146 1.061-1.061 3.146 3.146v-2.793h1.5v4.854z"/>
        </svg>
      </button>

      <header className="recipe-header">
        <div className="recipe-title-row">
          <h3 className="recipe-name">{recipe.name}</h3>
          {recipe.isCheat && <span className="cheat-badge">Cheat</span>}
          {/* FR-033: Edit button for admins - uses selected variant ID */}
          {isAdmin && onEdit && (
            <button
              className="edit-button"
              onClick={() => onEdit(selectedVariantId)}
              title="Edit recipe"
            >
              Edit
            </button>
          )}
        </div>
        <div className="recipe-meta">
          {/* FR-043: Calorie badge with dropdown for variants */}
          {hasVariants ? (
            <div className="calorie-dropdown-container" ref={dropdownRef}>
              <button
                className="calorie-dropdown-trigger"
                onClick={() => setShowCalorieDropdown(!showCalorieDropdown)}
                aria-expanded={showCalorieDropdown}
                aria-haspopup="listbox"
              >
                <span className="calories">{getCurrentVariantCalories()} cal</span>
                <span className="dropdown-chevron">▼</span>
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
            <span className="calories">{perServingCalories} cal</span>
          )}
          {recipe.variantLabel && (
            <span className="variant-label">{recipe.variantLabel}</span>
          )}
        </div>
      </header>

      <div className="servings-control">
        <label htmlFor={`servings-${recipe.id}`}>Servings:</label>
        <input
          id={`servings-${recipe.id}`}
          type="number"
          min="1"
          max="20"
          value={servings}
          onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
        />
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
