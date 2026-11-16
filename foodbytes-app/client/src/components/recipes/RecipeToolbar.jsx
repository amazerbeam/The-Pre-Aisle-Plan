import { RECIPE_MEAL_TABS, RECIPE_TAB_LABELS } from '../../constants/recipesUi'
import './RecipeToolbar.css'

function RecipeToolbar({
  activeMeal, counts, onMealChange, query, onQueryChange,
  hiddenCount, showHidden, onToggleHidden, hiddenAvailable, isAdmin, onAddRecipe,
  folderBar, searchPlaceholder
}) {
  return (
    <div className="recipe-toolbar">
      {folderBar}
      <div className="recipe-tabs" role="tablist" aria-label="Meal type">
        {RECIPE_MEAL_TABS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={activeMeal === k}
            className={`recipe-tab ${activeMeal === k ? 'on' : ''}`}
            onClick={() => onMealChange(k)}
          >
            {RECIPE_TAB_LABELS[k]}<span className="tab-count">{counts[k] ?? 0}</span>
          </button>
        ))}
      </div>

      <input
        type="search"
        className="recipe-search"
        aria-label="Search recipes"
        placeholder={searchPlaceholder ?? `Search ${RECIPE_TAB_LABELS[activeMeal].toLowerCase()} recipes`}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />

      {hiddenAvailable && (
        <button
          type="button"
          className={`recipe-chip ${showHidden ? 'on' : ''}`}
          aria-pressed={showHidden}
          onClick={onToggleHidden}
        >
          🙈 Hidden ({hiddenCount})
        </button>
      )}

      {isAdmin && (
        <button type="button" className="recipe-add-btn" onClick={onAddRecipe}>+ Add Recipe</button>
      )}
    </div>
  )
}

export default RecipeToolbar
