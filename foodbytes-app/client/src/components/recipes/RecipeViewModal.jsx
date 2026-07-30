import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { recipeService } from '../../services/recipeService'
import useServingsInput from '../../hooks/useServingsInput'
import useRecipeStackServings from '../../hooks/useRecipeStackServings'
import useWakeLock from '../../hooks/useWakeLock'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useHomemadeSelections } from '../../contexts/HomemadeSelectionsContext'
import LinkedRecipeNavigation from './LinkedRecipeNavigation'
import MacroBadgeRow from './MacroBadgeRow'
import WakeLockIcon from '../common/WakeLockIcon'
import { MIN_SERVINGS, MAX_SERVINGS, SERVINGS_STEP } from '../../constants/servings'
import './RecipeViewModal.css'

/**
 * FR-013, FR-029, FR-091, FR-092, FR-095, FR-102: RecipeViewModal - Fullscreen recipe view popup
 * - White text on dark background
 * - Variant dropdown for recipe families (same as RecipeCard)
 * - Keeps popup open when variant changes (updates content in-place)
 * - 99vh height with 0.5vh even margins
 * - FR-029: Screen wake lock activates when modal opens
 * - FR-091: Linked steps display as clickable links
 * - FR-092: Navigation stack for browsing linked recipes
 * - FR-095: Independent servings per recipe (extras show at their default servings)
 * - FR-102: On-demand loading - header displays immediately, content fetches full data
 */
function RecipeViewModal({
  recipeId,           // FR-102: Recipe ID to fetch full data
  recipeName,         // FR-102: For immediate header display
  servings,
  caloriesPerServing,
  isCheat,            // FR-102: For immediate header display
  hasExtras,          // FR-102: For extras indicator
  onClose,
  variants,           // Array of variant objects from recipe family
  onSelectVariant,    // Callback when variant is selected: (variantId, servings) => void
                      // NOTE: never invoked today - if that changes to alter `recipeId` while
                      // mounted, see the stable-recipeId invariant in useRecipeStackServings' JSDoc
  parentRecipeId = null  // FR-091: Parent recipe ID for homemade selection lookup
}) {
  // FR-102: Full recipe data state (loaded on mount)
  const [fullRecipe, setFullRecipe] = useState(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [contentError, setContentError] = useState(null)

  // FR-090: Get homemade selections to determine display for linked steps
  const { getSelections } = useHomemadeSelections()
  const homemadeSelections = parentRecipeId ? getSelections(parentRecipeId) : {}

  // FR-029: Screen wake lock with clickable icon next to Ingredients
  const { isLocked, isSupported, isAnimating, toggle: toggleWakeLock } = useWakeLock(true)

  // State for variant dropdown
  const [selectedVariantId, setSelectedVariantId] = useState(recipeId)
  const [showCalorieDropdown, setShowCalorieDropdown] = useState(false)
  const [currentRecipeName, setCurrentRecipeName] = useState(recipeName)
  const [currentCalories, setCurrentCalories] = useState(caloriesPerServing)
  const [currentIsCheat, setCurrentIsCheat] = useState(isCheat)
  const dropdownRef = useRef(null)

  // FR-095: Independent servings state per recipe in navigation stack.
  // Decimal-aware: parsing, clamping and the typing buffer live in the hook.
  const {
    servings: currentServings,
    servingsDisplay,
    handleServingsChange,
    handleServingsBlur,
    resetServings
  } = useServingsInput(servings)

  // FR-092, FR-095: Owns the linked-recipe navigation stack, keeps the
  // displayed recipe and its servings in step as it changes, and provides
  // the linked-step click handler. Full rationale (recipeId-seeding, the
  // recipeId-stability invariant, and the live-ref staleness fix) documented
  // on the hook itself.
  const {
    handleLinkedStepClick,
    popRecipe,
    resetStack,
    canGoBack,
    previousRecipeName,
    breadcrumbs
  } = useRecipeStackServings({
    recipeId,
    initialServings: servings,
    fullRecipe,
    currentServings,
    resetServings,
    setFullRecipe,
    setCurrentRecipeName
  })

  // FR-102: Fetch full recipe data on mount and when recipeId changes
  useEffect(() => {
    const fetchFullRecipe = async () => {
      if (!recipeId) return

      setContentLoading(true)
      setContentError(null)

      try {
        const data = await recipeService.getRecipeById(recipeId)
        setFullRecipe(data)
        setCurrentRecipeName(data.name)
        resetStack(data)
      } catch (err) {
        console.error('Failed to fetch recipe:', err)
        setContentError('Failed to load recipe details')
      } finally {
        setContentLoading(false)
      }
    }

    fetchFullRecipe()
  }, [recipeId, resetStack])

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

  // Close calorie dropdown on click outside
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

  // Lock body scroll while open; guard mirrors the `!recipeId` early return below
  // (locking while rendering null would pin the shared reference count).
  useBodyScrollLock(!!recipeId)

  // Check if recipe has variants (2+ required for dropdown)
  const hasVariants = variants && variants.length >= 2

  // Sort variants by displayOrder
  const sortedVariants = useMemo(() => {
    if (!hasVariants) return []
    return [...variants].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }, [variants, hasVariants])

  // The variant on screen — resolved once for the calorie badge and the macro popup.
  const selectedVariant = hasVariants
    ? sortedVariants.find((v) => v.recipeId === selectedVariantId)
    : null

  // `?? currentCalories` keeps the old fallback for no-family and not-found paths.
  const currentVariantCalories = selectedVariant?.caloriesPerServing ?? currentCalories

  // FR-104: Popup subtitle context only; the bands are identical across variants.
  // The displayed recipe is the only source — never selectedVariant, whose label still
  // names the parent's variant after navigating into a family-less linked sub-recipe.
  // null (not a literal) is correct: MacroTargetPopup then omits the ` · ` segment.
  const currentVariantLabel = fullRecipe?.variantLabel ?? null

  // Handle variant selection - update in-place without closing popup
  // FR-013, FR-102: Fetch variant recipe data internally to keep modal open
  const handleVariantSelect = async (variantId) => {
    setSelectedVariantId(variantId)
    setShowCalorieDropdown(false)

    // Update calories and header immediately from variant data. Own lookup, by the
    // just-clicked id: selectedVariantId state has not settled yet.
    const variant = sortedVariants.find(v => v.recipeId === variantId)
    if (variant) {
      setCurrentCalories(variant.caloriesPerServing)
      setCurrentRecipeName(variant.recipeName)
    }

    // FR-102: Fetch full recipe data for the variant (ingredients, steps) internally
    // Do NOT call parent's onSelectVariant - that would cause unmount/remount
    if (variantId !== fullRecipe?.id) {
      setContentLoading(true)
      try {
        const variantRecipe = await recipeService.getRecipeById(variantId)
        setFullRecipe(variantRecipe)
        setCurrentIsCheat(variantRecipe.isCheat)
      } catch (err) {
        console.error('Failed to fetch variant recipe:', err)
        setContentError('Failed to load variant')
      } finally {
        setContentLoading(false)
      }
    }
  }

  // FR-102: Don't block render - show header immediately even without full data
  if (!recipeId) return null

  // FR-095: Scale quantity based on currentServings (independent per recipe)
  // FR-102: Only scale when fullRecipe is loaded
  const scaleQuantity = (originalQty) => {
    if (!fullRecipe?.defaultServings) return originalQty
    const scaled = (originalQty / fullRecipe.defaultServings) * currentServings
    return Number.isInteger(scaled) ? scaled : scaled.toFixed(2)
  }

  return (
    <div className="recipe-view-overlay" onClick={onClose}>
      <div className="recipe-view-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header - FR-102: Displays immediately from summary props */}
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
            <h2 className="recipe-title">{currentRecipeName}</h2>
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
                    <span className="calories-text">{currentVariantCalories} cal</span>
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
                          <span className="variant-name">{variant.variantLabel || 'Moderate'}</span>
                          <span className="variant-calories">{variant.caloriesPerServing} cal</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <span className="calories-badge">{currentCalories} cal/serving</span>
              )}
              {/* FR-095: Servings input (independent per recipe) */}
              <div className="servings-input-container">
                <input
                  type="number"
                  inputMode="decimal"
                  min={MIN_SERVINGS}
                  max={MAX_SERVINGS}
                  step={SERVINGS_STEP}
                  value={servingsDisplay}
                  onChange={handleServingsChange}
                  onBlur={handleServingsBlur}
                  onClick={(e) => e.stopPropagation()}
                  className="servings-input"
                  aria-label="Number of servings"
                />
                <span className="servings-label">serving{currentServings !== 1 ? 's' : ''}</span>
              </div>
              {currentIsCheat && <span className="cheat-badge">Cheat</span>}
            </div>
            {/* FR-104: Traffic-lit macro badges; tapping one opens its target popup */}
            <MacroBadgeRow
              recipe={fullRecipe}
              variantLabel={currentVariantLabel}
              displayedCaloriesPerServing={currentVariantCalories}
            />
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close recipe view"
          >
            ×
          </button>
        </header>

        {/* Content - FR-102: Shows spinner while loading, then ingredients/steps */}
        <div className="recipe-view-content">
          {contentLoading ? (
            <div className="content-loading">
              <div className="spinner"></div>
              <p>Loading recipe details...</p>
            </div>
          ) : contentError ? (
            <div className="content-error">
              <p>{contentError}</p>
            </div>
          ) : (
            <>
              {/* Ingredients */}
              <section className="ingredients-section">
                <h3>
                  Ingredients
                  {/* FR-029: Wake lock icon - clickable to toggle screen lock */}
                  <WakeLockIcon
                    isLocked={isLocked}
                    isAnimating={isAnimating}
                    isSupported={isSupported}
                    onToggle={toggleWakeLock}
                  />
                </h3>
                {fullRecipe?.ingredients && fullRecipe.ingredients.length > 0 ? (
                  <ul className="ingredients-list">
                    {fullRecipe.ingredients.map((ing, idx) => (
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
                {fullRecipe?.steps && fullRecipe.steps.length > 0 ? (
                  <ol className="steps-list">
                    {fullRecipe.steps.map((step, idx) => {
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecipeViewModal
