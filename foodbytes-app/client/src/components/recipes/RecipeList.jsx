import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useMealPlan } from '../../contexts/MealPlanContext'
import usePickingMode from '../../hooks/usePickingMode'
import useRecipeCatalogue from '../../hooks/useRecipeCatalogue'
import useHiddenRecipes from '../../hooks/useHiddenRecipes'
import recipeService from '../../services/recipeService'
import { RECIPE_TAB_LABELS } from '../../constants/recipesUi'
import { hideKeyOf, recipeIdsInWeek } from '../../utils/recipeCatalogueUtils'
import RecipeCard from './RecipeCard'
import RecipeToolbar from './RecipeToolbar'
import WeekSlotStrip from './WeekSlotStrip'
import PickingBanner from './PickingBanner'
import RecipeViewModal from './RecipeViewModal'
import RecipeEditModal from '../admin/RecipeEditModal'
import UndoToast from '../common/UndoToast'
import './RecipeList.css'

function RecipeList() {
  const { isAdmin, isAuthenticated } = useAuth()
  const { weekPlan } = useMealPlan()
  const { activeMeal, setActiveMeal, pickDate, startPicking, finishPicking } = usePickingMode()
  const { recipesByMeal, loading, error, reload } = useRecipeCatalogue({ isAdmin })
  const hidden = useHiddenRecipes({ isAuthenticated })
  const [query, setQuery] = useState('')
  const [showHidden, setShowHidden] = useState(false)
  const [openRecipeEntry, setOpenRecipeEntry] = useState(null) // strip -> RecipeViewModal
  // FR-043: a selected variant replaces its family's card; keyed by the family's hide key
  const [overrides, setOverrides] = useState({})
  // FR-033 / FR-047: admin edit modal state
  const [editingRecipeId, setEditingRecipeId] = useState(null)
  const [showNewRecipe, setShowNewRecipe] = useState(false)

  const planIds = recipeIdsInWeek(weekPlan)
  const mealLabel = RECIPE_TAB_LABELS[activeMeal]

  const visible = (recipesByMeal[activeMeal] || [])
    .map((r) => overrides[hideKeyOf(r)] ?? r)
    .filter((r) => (showHidden ? hidden.isHidden(r) : !hidden.isHidden(r)))
    .filter((r) => r.name.toLowerCase().includes(query.trim().toLowerCase()))
  const visibleCounts = Object.fromEntries(
    Object.entries(recipesByMeal).map(([k, list]) => [k, list.filter((r) => !hidden.isHidden(r)).length])
  )
  const hiddenCount = new Set(
    Object.values(recipesByMeal).flat().filter(hidden.isHidden).map(hideKeyOf)
  ).size
  const inPlan = (r) => [r.id, ...(r.variants || []).map((v) => v.recipeId)].some((id) => planIds.has(id))

  const handleModalClose = () => {
    setEditingRecipeId(null)
    setShowNewRecipe(false)
  }

  const handleRecipeSave = () => {
    setOverrides({})
    reload()
  }

  // FR-043: fetch the full variant and show it in place of the family's card
  const handleSelectVariant = async (variantRecipeId) => {
    const family = (recipesByMeal[activeMeal] || []).find((r) => r.variants?.some((v) => v.recipeId === variantRecipeId))
    if (!family) return
    try {
      const variantRecipe = await recipeService.getRecipeById(variantRecipeId)
      if (variantRecipe) setOverrides((prev) => ({ ...prev, [hideKeyOf(family)]: variantRecipe }))
    } catch (err) {
      console.error('Failed to load variant recipe:', err)
    }
  }

  const emptyMessage = showHidden
    ? `Nothing hidden in ${mealLabel}.`
    : query.trim()
      ? `No ${mealLabel} recipes match "${query.trim()}".`
      : `No recipes found for ${mealLabel}.`

  return (
    <div className="recipe-list-container">
      <RecipeToolbar
        activeMeal={activeMeal}
        counts={visibleCounts}
        onMealChange={setActiveMeal}
        query={query}
        onQueryChange={setQuery}
        hiddenCount={hiddenCount}
        showHidden={showHidden}
        onToggleHidden={() => setShowHidden((s) => !s)}
        hiddenAvailable={isAuthenticated && !hidden.loadFailed}
        isAdmin={isAdmin}
        onAddRecipe={() => setShowNewRecipe(true)}
      />

      {hidden.loadFailed && (
        <div className="recipe-notice" role="alert">
          <span>Couldn't load your hidden recipes.</span>
          <button type="button" onClick={hidden.retry}>Retry</button>
        </div>
      )}

      {!showHidden && isAuthenticated && (
        <WeekSlotStrip
          weekPlan={weekPlan}
          mealKey={activeMeal}
          mealLabel={mealLabel}
          pickDate={pickDate}
          onPickDay={startPicking}
          onOpenRecipe={setOpenRecipeEntry}
        />
      )}
      {!showHidden && pickDate && (
        <PickingBanner mealLabel={mealLabel} pickDate={pickDate} onCancel={() => setActiveMeal(activeMeal)} />
      )}

      {showHidden && (
        <p className="recipe-hidden-note">
          Hidden recipes are only hidden from this list. Anything already in your meal plan stays there.
        </p>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      {!loading && error && (
        <div className="error-message" role="alert">
          <span>{error}</span>
          <button type="button" className="recipe-retry-btn" onClick={reload}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="recipe-grid">
          {visible.map((recipe) => (
            <RecipeCard
              key={hideKeyOf(recipe)}
              recipe={recipe}
              currentMealType={activeMeal}
              inPlan={inPlan(recipe)}
              isHidden={hidden.isHidden(recipe)}
              canHide={hidden.canHide}
              onHide={hidden.hide}
              onUnhide={hidden.unhide}
              onEdit={isAdmin ? setEditingRecipeId : undefined}
              onSelectVariant={handleSelectVariant}
              pickDate={pickDate}
              onAssigned={() => { if (pickDate) finishPicking() }}
            />
          ))}
          {visible.length === 0 && <p className="no-recipes">{emptyMessage}</p>}
        </div>
      )}

      <UndoToast toast={hidden.toast} onUndo={hidden.undo} />

      {openRecipeEntry?.recipe?.id && (
        <RecipeViewModal
          recipeId={openRecipeEntry.recipe.id}
          recipeName={openRecipeEntry.recipe.name}
          servings={openRecipeEntry.servings}
          caloriesPerServing={openRecipeEntry.caloriesPerServing}
          isCheat={openRecipeEntry.recipe.isCheat}
          hasExtras={openRecipeEntry.recipe.hasExtras}
          onClose={() => setOpenRecipeEntry(null)}
          variants={openRecipeEntry.recipe.variants}
          parentRecipeId={openRecipeEntry.recipe.id}
          extraChoices={openRecipeEntry.extraChoices}
          mealPlanEntry={openRecipeEntry}
        />
      )}

      {/* FR-033: Recipe Edit Modal */}
      {editingRecipeId && (
        <RecipeEditModal
          recipeId={editingRecipeId}
          isNew={false}
          onClose={handleModalClose}
          onSave={handleRecipeSave}
        />
      )}

      {/* FR-047: New Recipe Modal */}
      {showNewRecipe && (
        <RecipeEditModal
          recipeId={null}
          isNew={true}
          onClose={handleModalClose}
          onSave={handleRecipeSave}
        />
      )}
    </div>
  )
}

export default RecipeList
