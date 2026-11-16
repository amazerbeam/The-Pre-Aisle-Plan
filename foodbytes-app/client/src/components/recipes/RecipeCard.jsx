import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import DayAssignmentButtons from './DayAssignmentButtons'
import RecipeViewModal from './RecipeViewModal'
import RecipeCardMenu from './RecipeCardMenu'
import VariantSegment from './VariantSegment'
import ServingsChip from './ServingsChip'
import FolderChips from './folders/FolderChips'
import MacroChips from '../common/MacroChips'
import { MACRO_TARGETS } from '../../constants/macroTargets'
import { resolveStartingServings } from '../../utils/servingsUtils'
import { cardMacros, hideKeyOf } from '../../utils/recipeCatalogueUtils'
import { FOLDER_DRAG_TYPE } from '../../constants/recipeFolders'
import './RecipeCard.css'

function RecipeCard({
  recipe, currentMealType, inPlan, isHidden, canHide, onHide, onUnhide, onEdit, onSelectVariant, pickDate, onAssigned, folderUi
}) {
  const { isAdmin, defaultServings: userDefaultServings } = useAuth()
  // MPP-3: the user's preference moves the STARTING value only. Per-serving kcal still divides by
  // recipe.defaultServings — the scaling basis is the recipe's, not the user's (AC 7).
  const [servings, setServings] = useState(() => resolveStartingServings(recipe, userDefaultServings))
  // FR-043: the selected variant (defaults to this recipe)
  const [selectedVariantId, setSelectedVariantId] = useState(recipe.id)
  const [showFullscreen, setShowFullscreen] = useState(false)

  // FR-036: Fixed per-serving calories (does NOT scale with servings)
  const perServingCalories = Math.round(recipe.calories / recipe.defaultServings)

  const currentVariantCalories =
    recipe.variants?.find((v) => v.recipeId === selectedVariantId)?.caloriesPerServing ?? perServingCalories

  // FR-013: the modal switches variants internally and stays open — just sync local state
  const handleModalVariantSelect = async (variantId) => {
    setSelectedVariantId(variantId)
  }

  const macros = cardMacros(recipe, selectedVariantId)

  // Desktop folder view: drag the card onto a folder to file the recipe family.
  const dragProps = folderUi?.draggable && !isHidden ? {
    draggable: true,
    onDragStart: (e) => {
      e.dataTransfer.setData(FOLDER_DRAG_TYPE, String(hideKeyOf(recipe)))
      e.dataTransfer.effectAllowed = 'copy'
      e.currentTarget.classList.add('is-dragging')
    },
    onDragEnd: (e) => e.currentTarget.classList.remove('is-dragging'),
  } : {}

  return (
    <article className={`recipe-card ${inPlan ? 'is-in-plan' : ''} ${isHidden ? 'is-hidden' : ''}`} {...dragProps}>
      <div className="recipe-card-top">
        <button type="button" className="recipe-card-name" onClick={() => setShowFullscreen(true)}>{recipe.name}</button>
        {recipe.isCheat && <span className="cheat-badge">Cheat</span>}
        {isAdmin && recipe.macrosAudited && (
          <span className="audited-badge" title="Macros and calories signed off">✓ Audited</span>
        )}
        <RecipeCardMenu
          recipeName={recipe.name}
          isHidden={isHidden}
          canHide={canHide}
          isAdmin={isAdmin && !!onEdit}
          onView={() => setShowFullscreen(true)}
          onHide={() => onHide(recipe)}
          onUnhide={() => onUnhide(recipe)}
          onEdit={() => onEdit(selectedVariantId)}
          canFile={folderUi?.canFile}
          removeFromLabel={folderUi?.inCurrent ? folderUi.currentFolderName : null}
          onAddToFolder={folderUi?.onAddToFolder}
          onRemoveFromFolder={folderUi?.onRemoveFromFolder}
        />
      </div>
      {folderUi?.showChips && (
        <FolderChips folders={folderUi.folders} recipeKey={hideKeyOf(recipe)}
          excludeId={folderUi.currentFolderId} onOpenFolder={folderUi.onOpenFolder} />
      )}

      <VariantSegment
        variants={recipe.variants || []}
        selectedId={selectedVariantId}
        onSelect={(id) => {
          setSelectedVariantId(id)
          if (id !== recipe.id) onSelectVariant?.(id, servings)
        }}
        fallbackKcal={perServingCalories}
      />

      <div className="recipe-card-row">
        {macros && <MacroChips macros={macros} targets={MACRO_TARGETS} />}
        <ServingsChip servings={servings} onChange={setServings} />
        {inPlan && <span className="in-plan-badge">In plan</span>}
      </div>

      {isHidden
        ? <button type="button" className="unhide-btn" onClick={() => onUnhide(recipe)}>👁 Unhide</button>
        : (
          <DayAssignmentButtons
            recipe={recipe}
            servings={servings}
            currentMealType={currentMealType}
            selectedRecipeId={selectedVariantId}
            pickDate={pickDate}
            onAssigned={onAssigned}
          />
        )}

      {/* FR-013, FR-102: Fullscreen Recipe View Modal with on-demand loading */}
      {showFullscreen && (
        <RecipeViewModal
          recipeId={selectedVariantId}
          recipeName={recipe.name}
          servings={servings}
          caloriesPerServing={currentVariantCalories}
          isCheat={recipe.isCheat}
          hasExtras={recipe.hasExtras}
          onClose={() => setShowFullscreen(false)}
          variants={recipe.variants}
          onSelectVariant={handleModalVariantSelect}
        />
      )}
    </article>
  )
}

export default RecipeCard
