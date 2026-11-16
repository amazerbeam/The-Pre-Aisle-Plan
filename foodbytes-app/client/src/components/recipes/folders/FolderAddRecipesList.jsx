import { useState } from 'react'
import MealPlanSheet from '../../mealplan/MealPlanSheet'
import { RECIPE_MEAL_TABS, RECIPE_TAB_LABELS } from '../../../constants/recipesUi'
import { hideKeyOf } from '../../../utils/recipeCatalogueUtils'
import { folderById } from '../../../utils/recipeFolderTree'
import './RecipeFolders.css'

/** "Add recipes" picker for one folder: searchable, grouped by meal, hidden recipes left out. */
function FolderAddRecipesList({ dialog, setDialog, foldersApi, recipesByMeal, isHiddenKey }) {
  const [query, setQuery] = useState('')
  const folder = folderById(foldersApi.folders, dialog.folderId)
  if (!folder) return null

  const needle = query.trim().toLowerCase()
  const seen = new Set()
  const groups = RECIPE_MEAL_TABS.map((meal) => ({
    meal,
    recipes: (recipesByMeal[meal] || []).filter((r) => {
      const key = hideKeyOf(r)
      if (isHiddenKey(key) || seen.has(key) || !r.name.toLowerCase().includes(needle)) return false
      seen.add(key)
      return true
    }),
  })).filter((g) => g.recipes.length > 0)

  return (
    <MealPlanSheet title={`Add to ${folder.name}`} onClose={() => setDialog(null)}>
      <input type="search" className="folder-name-input" aria-label="Search recipes to add" placeholder="Search recipes"
        value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="folder-pick-list">
        {groups.map(({ meal, recipes }) => (
          <div key={meal}>
            <div className="meal-sheet-section">{RECIPE_TAB_LABELS[meal]}</div>
            {recipes.map((r) => {
              const checked = folder.recipeIds.includes(hideKeyOf(r))
              return (
                <button key={r.id} type="button" role="checkbox" aria-checked={checked}
                  className={`folder-pick-row ${checked ? 'checked' : ''}`}
                  onClick={() => foldersApi.toggleRecipe(folder.id, r)}>
                  <span className={`folder-check ${checked ? 'on' : ''}`} aria-hidden="true">✓</span>
                  <span className="folder-row-label">{r.name}</span>
                </button>
              )
            })}
          </div>
        ))}
        {groups.length === 0 && (
          <p className="folder-dialog-note">{needle ? `No recipes match "${query.trim()}".` : 'No recipes to add.'}</p>
        )}
      </div>
      <button type="button" className="folder-primary-btn" onClick={() => setDialog(null)}>Done</button>
    </MealPlanSheet>
  )
}

export default FolderAddRecipesList
