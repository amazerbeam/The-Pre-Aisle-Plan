import { useEffect, useState, useCallback } from 'react'
import { recipeService } from '../../services/recipeService'
import useServingsInput from '../../hooks/useServingsInput'
import useRecipeStackServings from '../../hooks/useRecipeStackServings'
import useWakeLock from '../../hooks/useWakeLock'
import useMealEatenSave from '../../hooks/useMealEatenSave'
import useExtraChoiceToggle from '../../hooks/useExtraChoiceToggle'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useLinkedStepSelections } from '../../hooks/useLinkedStepSelections'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { hasMealMacroTargets, hasUsableMacros } from '../../utils/macroStatus'
import RecipeViewHeader from './RecipeViewHeader'
import IngredientsPanel from './IngredientsPanel'
import ExtrasPanel from './ExtrasPanel'
import RecipeStepsSection from './RecipeStepsSection'
import MealEatenSection from './MealEatenSection'
import MacroTargetPopup from './MacroTargetPopup'
import CookMode from './CookMode'
import './RecipeViewModal.css'

const TAB_INGREDIENTS = 'ingredients'
const TAB_STEPS = 'steps'

/**
 * FR-013, FR-029, FR-091, FR-092, FR-095, FR-102: RecipeViewModal - the recipe view popup.
 * - Sticky header (RecipeViewHeader): variant switch, servings stepper, macro chips, keep-screen-on
 * - Keeps popup open when variant changes (updates content in-place)
 * - FR-029: Screen wake lock activates when modal opens (cook mode forces it on)
 * - FR-091: Linked steps open the sub-recipe; extras toggle homemade / store-bought
 * - FR-092: Navigation stack for browsing linked recipes
 * - FR-095: Independent servings per recipe (extras show at their default servings)
 * - FR-102: On-demand loading - header displays immediately, content fetches full data
 * Desktop: ingredients column beside the steps. Mobile: full screen with Ingredients | Steps tabs.
 */
function RecipeViewModal({
  recipeId,           // FR-102: Recipe ID to fetch full data
  recipeName,         // FR-102: For immediate header display
  servings,
  caloriesPerServing,
  isCheat,            // FR-102: For immediate header display
  onClose,
  variants,           // Array of variant objects from recipe family
  onSelectVariant,    // Optional. Callback when variant is selected: (variantId, servings) => void
                      // NOTE: never invoked today - if that changes to alter `recipeId` while
                      // mounted, see the stable-recipeId invariant in useRecipeStackServings' JSDoc
  parentRecipeId = null, // FR-091: Parent recipe ID for homemade selection lookup
  extraChoices = null,   // MPP-10: a planned meal's own choices
  mealPlanEntry = null   // MPP-12: set only when opened from the meal plan → plan bar + eaten section
}) {
  // FR-102: Full recipe data state (loaded on mount)
  const [fullRecipe, setFullRecipe] = useState(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [contentError, setContentError] = useState(null)

  // MPP-10: read the entry live so a toggle flips the wording once the week reloads.
  const { getEntryById } = useMealPlan()
  const liveChoices = (mealPlanEntry && getEntryById(mealPlanEntry.id)?.extraChoices) || extraChoices
  const dishId = parentRecipeId ?? recipeId
  const homemadeSelections = useLinkedStepSelections(dishId, liveChoices) // FR-090 / MPP-10
  const extraToggle = useExtraChoiceToggle({ parentRecipeId: dishId, mealPlanEntry })
  const eatenSave = useMealEatenSave(mealPlanEntry?.id)

  // FR-029: Screen wake lock, on by default; toggled from the header
  const wakeLock = useWakeLock(true)

  const [selectedVariantId, setSelectedVariantId] = useState(recipeId)
  const [currentRecipeName, setCurrentRecipeName] = useState(recipeName)
  const [currentCalories, setCurrentCalories] = useState(caloriesPerServing)
  const [currentIsCheat, setCurrentIsCheat] = useState(isCheat)
  const [openMacroKey, setOpenMacroKey] = useState(null)
  const [tab, setTab] = useState(TAB_INGREDIENTS)
  const [doneSteps, setDoneSteps] = useState(() => new Set())
  const [cookIndex, setCookIndex] = useState(null)
  const [wasLockedBeforeCook, setWasLockedBeforeCook] = useState(false)

  // FR-095: Independent servings state per recipe in navigation stack.
  // Decimal-aware: parsing, clamping and the typing buffer live in the hook.
  const {
    servings: currentServings,
    servingsDisplay,
    handleServingsChange,
    handleServingsBlur,
    resetServings
  } = useServingsInput(servings)

  // FR-092, FR-095: Owns the linked-recipe navigation stack, keeps the displayed recipe and its
  // servings in step as it changes, and provides the linked-step click handler. Full rationale
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

  // FR-091: homemade unless the choice says store-bought
  const isHomemade = useCallback((linkedRecipeId) => {
    return homemadeSelections[linkedRecipeId] !== false
  }, [homemadeSelections])

  // Update calories when prop changes
  useEffect(() => {
    setCurrentCalories(caloriesPerServing)
  }, [caloriesPerServing])

  // A different recipe (variant or linked sub-recipe) starts with no steps done and no popup open.
  // The ingredient ticks reset by remounting IngredientsPanel (keyed on the recipe id below).
  useEffect(() => {
    setDoneSteps(new Set())
    setOpenMacroKey(null)
  }, [fullRecipe?.id])

  // Close on Escape key (cook mode owns Escape while it is open)
  useEffect(() => {
    if (cookIndex !== null) return undefined
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, cookIndex])

  // Lock body scroll while open; guard mirrors the `!recipeId` early return below
  // (locking while rendering null would pin the shared reference count).
  useBodyScrollLock(!!recipeId)

  // A linked sub-recipe has no family, so the variant switch only shows on the top-level recipe.
  const hasVariants = !canGoBack && variants && variants.length >= 2
  const selectedVariant = hasVariants ? variants.find((v) => v.recipeId === selectedVariantId) : null

  // A sub-recipe shows its own per-serving kcal (recipes.calories is whole-recipe).
  const linkedKcal = fullRecipe?.calories != null && fullRecipe.defaultServings
    ? Math.round(fullRecipe.calories / fullRecipe.defaultServings)
    : currentCalories
  // `?? currentCalories` keeps the old fallback for no-family and not-found paths.
  const displayedKcal = canGoBack ? linkedKcal : (selectedVariant?.caloriesPerServing ?? currentCalories)

  // FR-104: Popup subtitle context only; the bands are identical across variants.
  // The displayed recipe is the only source — never selectedVariant, whose label still
  // names the parent's variant after navigating into a family-less linked sub-recipe.
  const currentVariantLabel = fullRecipe?.variantLabel ?? null

  const hasMacroData = !!fullRecipe && ['protein', 'carbs', 'fat'].some((k) => fullRecipe[k] != null)
  const macros = hasMacroData
    ? { protein: fullRecipe.protein, carbs: fullRecipe.carbs, fat: fullRecipe.fat }
    : null
  // Components (pesto, dough...) and all-zero data get plain grams, never a verdict.
  const macrosJudged = !!macros && hasMealMacroTargets(fullRecipe) && hasUsableMacros(macros)

  // Handle variant selection - update in-place without closing popup
  // FR-013, FR-102: Fetch variant recipe data internally to keep modal open
  const handleVariantSelect = async (variantId) => {
    setSelectedVariantId(variantId)

    // Update calories and header immediately from variant data. Own lookup, by the
    // just-clicked id: selectedVariantId state has not settled yet.
    const variant = (variants || []).find(v => v.recipeId === variantId)
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

  const toggleStepDone = (idx) => setDoneSteps((prev) => {
    const next = new Set(prev)
    if (next.has(idx)) next.delete(idx)
    else next.add(idx)
    return next
  })

  // Cook mode forces the wake lock on and puts it back as it was on exit.
  const startCook = (index) => {
    setWasLockedBeforeCook(wakeLock.isLocked)
    if (!wakeLock.isLocked) wakeLock.request()
    setCookIndex(index)
  }
  const exitCook = (index, finished) => {
    const total = fullRecipe?.steps?.length ?? 0
    const upTo = finished ? total : index
    setDoneSteps((prev) => new Set([...prev, ...Array.from({ length: upTo }, (_, i) => i)]))
    if (!wasLockedBeforeCook) wakeLock.release()
    setCookIndex(null)
  }

  // FR-102: Don't block render - show header immediately even without full data
  if (!recipeId) return null

  // FR-095: Scale quantity based on currentServings (independent per recipe)
  // FR-102: Only scale when fullRecipe is loaded
  const scaleQuantity = (originalQty) => {
    if (!fullRecipe?.defaultServings) return originalQty
    return (originalQty / fullRecipe.defaultServings) * currentServings
  }

  const steps = fullRecipe?.steps || []
  const ingredients = fullRecipe?.ingredients || []
  const extras = [...new Map(
    steps.filter((s) => s.linkedRecipeId != null)
      .map((s) => [s.linkedRecipeId, { recipeId: s.linkedRecipeId, name: s.linkedRecipeName }])
  ).values()]

  return (
    <div className="recipe-view-overlay" onClick={onClose}>
      <div className="recipe-view-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header - FR-102: Displays immediately from summary props */}
        <RecipeViewHeader
          name={currentRecipeName}
          isCheat={currentIsCheat}
          nav={{ canGoBack, previousRecipeName, breadcrumbs, onBack: popRecipe }}
          planEntry={mealPlanEntry}
          eatenSave={eatenSave}
          variants={hasVariants ? variants : []}
          selectedVariantId={selectedVariantId}
          onSelectVariant={handleVariantSelect}
          fallbackKcal={displayedKcal}
          servings={currentServings}
          servingsDisplay={servingsDisplay}
          onServingsInput={handleServingsChange}
          onServingsBlur={handleServingsBlur}
          onServings={resetServings}
          macros={macros}
          macrosJudged={macrosJudged}
          onMacroClick={setOpenMacroKey}
          wakeLock={wakeLock}
          onClose={onClose}
        />

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
          <div className="rv-scroll" data-tab={tab}>
            <div className="rv-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === TAB_INGREDIENTS}
                className={tab === TAB_INGREDIENTS ? 'on' : ''}
                onClick={() => setTab(TAB_INGREDIENTS)}
              >
                Ingredients ({ingredients.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === TAB_STEPS}
                className={tab === TAB_STEPS ? 'on' : ''}
                onClick={() => setTab(TAB_STEPS)}
              >
                Steps ({doneSteps.size}/{steps.length})
              </button>
            </div>
            <div className="rv-body">
              <IngredientsPanel
                key={fullRecipe?.id}
                ingredients={ingredients}
                scale={scaleQuantity}
                servings={currentServings}
              >
                {!canGoBack && extras.length > 0 && (
                  <ExtrasPanel
                    extras={extras}
                    isHomemade={isHomemade}
                    onToggle={extraToggle.setChoice}
                    onOpen={handleLinkedStepClick}
                    saving={extraToggle.saving}
                    error={extraToggle.error}
                    locked={extraToggle.locked}
                    hint={extraToggle.hint}
                  />
                )}
              </IngredientsPanel>
              <div className="rv-steps">
                {/* Steps - FR-091: Handle linked steps */}
                <RecipeStepsSection
                  steps={fullRecipe?.steps}
                  isHomemade={isHomemade}
                  onLinkedStepClick={handleLinkedStepClick}
                  done={doneSteps}
                  onToggleDone={toggleStepDone}
                  onStartCook={startCook}
                />
                {/* MPP-12: eaten tick - meal-plan entry only, on the planned dish (not a linked sub-recipe) */}
                {mealPlanEntry && !canGoBack && (
                  <MealEatenSection entryId={mealPlanEntry.id} eatenSave={eatenSave} />
                )}
              </div>
            </div>
          </div>
        )}

        {cookIndex !== null && steps.length > 0 && (
          <CookMode
            recipeName={currentRecipeName}
            steps={steps}
            ingredients={ingredients}
            scale={scaleQuantity}
            isHomemade={isHomemade}
            startIndex={cookIndex}
            onExit={exitCook}
          />
        )}

        {/* FR-104: portaled, but kept inside the modal tree so its clicks never reach the overlay's close */}
        {openMacroKey && macros && (
          <MacroTargetPopup
            macroKey={openMacroKey}
            macros={macros}
            variantLabel={currentVariantLabel}
            displayedCaloriesPerServing={displayedKcal}
            onClose={() => setOpenMacroKey(null)}
          />
        )}
      </div>
    </div>
  )
}

export default RecipeViewModal
