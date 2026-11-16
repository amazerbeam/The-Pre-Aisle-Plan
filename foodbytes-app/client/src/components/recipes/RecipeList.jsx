import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { useTheme } from '../../contexts/ThemeContext'
import usePickingMode from '../../hooks/usePickingMode'
import useRecipeCatalogue from '../../hooks/useRecipeCatalogue'
import useHiddenRecipes from '../../hooks/useHiddenRecipes'
import useMediaQuery from '../../hooks/useMediaQuery'
import useRecipeView from '../../hooks/useRecipeView'
import useRecipeFolders from '../../hooks/useRecipeFolders'
import useFolderNavigation from '../../hooks/useFolderNavigation'
import useRecipeFolderScope from '../../hooks/useRecipeFolderScope'
import recipeService from '../../services/recipeService'
import { RECIPE_MEAL_TABS, RECIPE_TAB_LABELS } from '../../constants/recipesUi'
import { FOLDER_DRAG_MEDIA, FOLDER_LOAD_ERROR, RECIPE_VIEWS } from '../../constants/recipeFolders'
import { hideKeyOf, recipeIdsInWeek } from '../../utils/recipeCatalogueUtils'
import { canCreateIn } from '../../utils/recipeFolderTree'
import { pageCopy } from '../../utils/themeCopy'
import RecipeCard from './RecipeCard'
import RecipeToolbar from './RecipeToolbar'
import WeekSlotStrip from './WeekSlotStrip'
import PickingBanner from './PickingBanner'
import RecipeViewModal from './RecipeViewModal'
import RecipeEditModal from '../admin/RecipeEditModal'
import UndoToast from '../common/UndoToast'
import FolderActionsMenu from './folders/FolderActionsMenu'
import FolderBar from './folders/FolderBar'
import FolderDialogs from './folders/FolderDialogs'
import FolderHeader from './folders/FolderHeader'
import FolderRoot from './folders/FolderRoot'
import FolderSidebar from './folders/FolderSidebar'
import RecipeViewToggle from './folders/RecipeViewToggle'
import './RecipeList.css'

function RecipeList() {
  const { isAdmin, isAuthenticated } = useAuth()
  const { weekPlan } = useMealPlan()
  const { theme } = useTheme()
  const heading = pageCopy(theme, 'recipes')
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

  // Custom folders: Menu / Folders view, the open folder, and the dialog on screen
  const { view, setView } = useRecipeView()
  const foldersApi = useRecipeFolders({ isAuthenticated })
  const inFolders = isAuthenticated && view === RECIPE_VIEWS.FOLDERS
  const [dialog, setDialog] = useState(null)
  const isMobile = !useMediaQuery('(min-width: 768px)')
  const canDrag = useMediaQuery(FOLDER_DRAG_MEDIA) && inFolders && !isMobile
  const isHiddenKey = (k) => hidden.hiddenKeys.has(k)
  const folderReady = inFolders && !foldersApi.loading && !foldersApi.loadFailed
  const { folderId, setFolderId, currentFolder, openIds, openFolder, toggleOpen, dropProps } = useFolderNavigation({
    foldersApi, folderReady, canDrag, recipesByMeal, setView,
    onOpen: () => { setQuery(''); setShowHidden(false) },
  })
  const scope = useRecipeFolderScope({
    inFolders, folderId, folders: foldersApi.folders, recipesByMeal, isHidden: hidden.isHidden
  })
  const sideLayout = inFolders && !isMobile && foldersApi.canEdit

  const planIds = recipeIdsInWeek(weekPlan)
  const mealLabel = RECIPE_TAB_LABELS[activeMeal]

  const visible = (recipesByMeal[activeMeal] || [])
    .map((r) => overrides[hideKeyOf(r)] ?? r)
    .filter((r) => (showHidden ? hidden.isHidden(r) : !hidden.isHidden(r)))
    .filter(scope.inScope)
    .filter((r) => r.name.toLowerCase().includes(query.trim().toLowerCase()))
  const hiddenCount = new Set(
    Object.values(recipesByMeal).flat().filter(hidden.isHidden).map(hideKeyOf)
  ).size
  const inPlan = (r) => [r.id, ...(r.variants || []).map((v) => v.recipeId)].some((id) => planIds.has(id))

  // After opening a folder, land on a tab that has something in it.
  useEffect(() => {
    if (!folderReady || loading || scope.counts[activeMeal] > 0) return
    const next = RECIPE_MEAL_TABS.find((k) => scope.counts[k] > 0)
    if (next) setActiveMeal(next)
    // deliberately not keyed on activeMeal: it runs when the open folder (or its load) changes, not on every tab click
  }, [folderId, folderReady, loading])

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

  const folderActions = (f) => (
    <FolderActionsMenu
      folder={f}
      isCurrent={f.id === folderId}
      canAddSubfolder={canCreateIn(foldersApi.folders, f.id)}
      onOpen={() => openFolder(f.id)}
      onAddRecipes={() => setDialog({ type: 'addRecipes', folderId: f.id })}
      onNewSubfolder={() => setDialog({ type: 'new', parentId: f.id })}
      onRename={() => setDialog({ type: 'rename', folderId: f.id })}
      onMove={() => setDialog({ type: 'move', folderId: f.id })}
      onDelete={() => setDialog({ type: 'delete', folderId: f.id })}
    />
  )

  const treeProps = {
    folders: foldersApi.folders, currentId: folderId, openIds, onToggleOpen: toggleOpen, onOpenFolder: openFolder,
    isHiddenKey, renderActions: foldersApi.canEdit ? folderActions : undefined, dropProps, rootCount: scope.unfiledCount,
  }

  const folderUiFor = (recipe) => ({
    canFile: foldersApi.canEdit,
    showChips: folderReady,
    folders: foldersApi.folders,
    currentFolderId: folderId,
    currentFolderName: currentFolder?.name,
    inCurrent: folderReady && !!currentFolder?.recipeIds.includes(hideKeyOf(recipe)),
    draggable: canDrag,
    onAddToFolder: () => setDialog({ type: 'addTo', recipe }),
    onRemoveFromFolder: () => foldersApi.removeRecipe(folderId, recipe),
    onOpenFolder: openFolder,
  })

  const searchPlaceholder = !folderReady ? undefined
    : currentFolder ? `Search in ${currentFolder.name}`
      : `Search unfiled ${mealLabel.toLowerCase()}`

  const otherTabs = RECIPE_MEAL_TABS.filter((k) => k !== activeMeal && scope.counts[k] > 0)
  const plainEmpty = showHidden || query.trim()
  const emptyMessage = showHidden
    ? `Nothing hidden in ${mealLabel}.`
    : query.trim()
      ? `No ${mealLabel} recipes match "${query.trim()}".`
      : `No recipes found for ${mealLabel}.`

  const renderEmpty = () => {
    if (!folderReady || plainEmpty) return <p className="no-recipes">{emptyMessage}</p>
    if (!currentFolder) return <p className="no-recipes">Every {mealLabel.toLowerCase()} recipe is in a folder ✓</p>
    return (
      <div className="no-recipes">
        <p>No {mealLabel.toLowerCase()} recipes in {currentFolder.name}.</p>
        {otherTabs.length > 0 && (
          <p>
            It has{' '}
            {otherTabs.map((k, i) => (
              <span key={k}>
                {i > 0 && ', '}
                <button type="button" className="folder-link-btn" onClick={() => setActiveMeal(k)}>
                  {scope.counts[k]} {RECIPE_TAB_LABELS[k].toLowerCase()}
                </button>
              </span>
            ))}
          </p>
        )}
        <p>Use ⋯ → Add to folder on any recipe.</p>
      </div>
    )
  }

  const viewToggle = isAuthenticated && (
    <RecipeViewToggle view={view} onChange={(v) => { setView(v); setFolderId(null) }} />
  )

  const main = (
    <>
      <RecipeToolbar
        activeMeal={activeMeal}
        counts={scope.counts}
        onMealChange={setActiveMeal}
        query={query}
        onQueryChange={setQuery}
        hiddenCount={hiddenCount}
        showHidden={showHidden}
        onToggleHidden={() => setShowHidden((s) => !s)}
        hiddenAvailable={isAuthenticated && !hidden.loadFailed}
        isAdmin={isAdmin}
        onAddRecipe={() => setShowNewRecipe(true)}
        searchPlaceholder={searchPlaceholder}
        folderBar={inFolders && isMobile && folderReady ? (
          <FolderBar folders={foldersApi.folders} currentId={folderId} onOpenSheet={() => setDialog({ type: 'sheet' })} />
        ) : null}
      />

      {hidden.loadFailed && (
        <div className="recipe-notice" role="alert">
          <span>Couldn't load your hidden recipes.</span>
          <button type="button" onClick={hidden.retry}>Retry</button>
        </div>
      )}

      {inFolders && foldersApi.loadFailed && (
        <div className="recipe-notice" role="alert">
          <span>{FOLDER_LOAD_ERROR}</span>
          <button type="button" onClick={foldersApi.retry}>Retry</button>
        </div>
      )}

      {!showHidden && isAuthenticated && !inFolders && (
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

      {folderReady && (currentFolder ? (
        <FolderHeader
          folders={foldersApi.folders}
          folderId={folderId}
          isHiddenKey={isHiddenKey}
          dropProps={dropProps}
          onOpenFolder={openFolder}
          actions={folderActions(currentFolder)}
          onAddRecipes={() => setDialog({ type: 'addRecipes', folderId })}
          onNewSubfolder={() => setDialog({ type: 'new', parentId: folderId })}
          isMobile={isMobile}
        />
      ) : (
        <FolderRoot
          folders={foldersApi.folders}
          isHiddenKey={isHiddenKey}
          unfiledCount={scope.unfiledCount}
          dropProps={dropProps}
          onOpenFolder={openFolder}
          onNewFolder={() => setDialog({ type: 'new', parentId: null })}
          canDrag={canDrag}
        />
      ))}

      {(loading || (inFolders && foldersApi.loading)) && (
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

      {!loading && !error && !(inFolders && !folderReady) && (
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
              folderUi={isAuthenticated ? folderUiFor(recipe) : undefined}
            />
          ))}
          {visible.length === 0 && renderEmpty()}
        </div>
      )}
    </>
  )

  return (
    <div className="recipe-list-container">
      {heading ? (
        <header className="page-heading">
          <h1 className="page-heading-title">{heading.title}</h1>
          {heading.sub && <p className="page-sub">{heading.sub}</p>}
          {viewToggle}
        </header>
      ) : viewToggle && <div className="recipe-view-row">{viewToggle}</div>}

      {sideLayout ? (
        <div className="recipe-folder-layout">
          <FolderSidebar treeProps={treeProps} canDrag={canDrag} onNewFolder={() => setDialog({ type: 'new', parentId: null })} />
          <div className="recipe-folder-main">{main}</div>
        </div>
      ) : main}

      <UndoToast toast={hidden.toast} onUndo={hidden.undo} />
      <UndoToast toast={foldersApi.toast} onUndo={foldersApi.undo} />

      {dialog && (
        <FolderDialogs
          dialog={dialog}
          setDialog={setDialog}
          foldersApi={foldersApi}
          recipesByMeal={recipesByMeal}
          isHiddenKey={isHiddenKey}
          onOpenFolder={openFolder}
          treeProps={treeProps}
        />
      )}

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
