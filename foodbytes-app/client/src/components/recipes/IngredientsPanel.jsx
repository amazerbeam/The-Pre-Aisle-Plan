import IngredientList from './IngredientList'

/**
 * Recipe view ingredient column: scaled quantities (fractions for spoons and counts) with
 * tick-off rows. Ticks are screen-only and owned by RecipeViewModal (shared with the mobile
 * full-screen list); they reset with the displayed recipe. `onExpand` is set only on mobile and
 * shows the ⤢ Expand button. `children` is the slot for the extras panel.
 */
function IngredientsPanel({ ingredients, scale, servings, ticked, onToggle, onExpand, children }) {
  const hasIngredients = ingredients && ingredients.length > 0

  return (
    <section className="rv-col ingredients-panel">
      <h3>
        Ingredients
        <small>for {servings} {servings === 1 ? 'person' : 'people'}</small>
        {onExpand && hasIngredients && (
          <button
            type="button"
            className="ing-expand"
            onClick={onExpand}
            aria-label="Expand ingredients to full screen"
          >
            <span aria-hidden="true">⤢</span> Expand
          </button>
        )}
      </h3>
      {hasIngredients ? (
        <IngredientList ingredients={ingredients} scale={scale} ticked={ticked} onToggle={onToggle} />
      ) : (
        <p className="no-content">No ingredients listed</p>
      )}
      {children}
    </section>
  )
}

export default IngredientsPanel
