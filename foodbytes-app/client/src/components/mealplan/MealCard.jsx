import { useState } from 'react'
import RecipeViewModal from '../recipes/RecipeViewModal'
import { CartIcon } from '../common/ExtrasIcons'
import { formatServings } from '../../utils/servingsUtils'
import './MealCard.css'

/**
 * MealCard - one planned meal, shared by the desktop timetable ('compact') and the mobile day view ('large').
 * Tap opens the recipe (FR-014); the tick is the one-way eaten toggle (MPP-12). Remove/move/servings live in
 * the parent's menu, swipe actions or sheets, not on the card.
 */
function MealCard({ entry, day, size = 'compact', canTick, onTick, thumbEmoji }) {
  const [showRecipeView, setShowRecipeView] = useState(false)

  // MPP-10 / AC 12: orange cart when any extra of this meal is store-bought
  const hasStoreBought = Object.values(entry.extraChoices || {}).includes(false)
  const peopleLabel = `${formatServings(entry.servings)} ${Number(entry.servings) === 1 ? 'person' : 'people'}`

  const openRecipe = () => {
    if (entry.recipe) setShowRecipeView(true)
  }
  const enterOrSpaceOpens = (e) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openRecipe()
    }
  }

  return (
    <>
      <div
        className={`meal-card meal-card--${size} ${entry.eaten ? 'is-eaten' : ''}`}
        role="button"
        tabIndex={0}
        onClick={openRecipe}
        onKeyDown={enterOrSpaceOpens}
      >
        {size === 'large' && <span className="meal-card-thumb" aria-hidden="true">{thumbEmoji}</span>}
        <div className="meal-card-body">
          <span className="meal-card-name">{entry.recipe?.name}</span>
          <span className="meal-card-meta">
            {entry.caloriesPerServing} kcal
            <span className="meal-card-servings" title={peopleLabel}>
              {size === 'large' ? peopleLabel : `👥 ${formatServings(entry.servings)}`}
            </span>
            {hasStoreBought && (
              <span className="meal-card-cart" role="img" aria-label="Has store-bought extras" title="Has store-bought extras">
                <CartIcon />
              </span>
            )}
          </span>
        </div>
        {canTick && (
          <button
            type="button"
            className="meal-card-tick"
            aria-pressed={!!entry.eaten}
            aria-label={entry.eaten ? 'Eaten' : `Mark ${entry.recipe?.name} as eaten`}
            disabled={entry.eaten}
            onClick={(e) => { e.stopPropagation(); onTick(entry, day) }}
          >
            ✓
          </button>
        )}
      </div>

      {/* FR-013/FR-014/FR-102: Recipe View Modal with on-demand loading */}
      {showRecipeView && entry.recipe?.id && (
        <RecipeViewModal
          recipeId={entry.recipe.id}
          recipeName={entry.recipe.name}
          servings={entry.servings}
          caloriesPerServing={entry.caloriesPerServing}
          isCheat={entry.recipe.isCheat}
          hasExtras={entry.recipe.hasExtras}
          onClose={() => setShowRecipeView(false)}
          variants={entry.recipe.variants}
          parentRecipeId={entry.recipe.id}
          extraChoices={entry.extraChoices}
          mealPlanEntry={entry}
        />
      )}
    </>
  )
}

export default MealCard
