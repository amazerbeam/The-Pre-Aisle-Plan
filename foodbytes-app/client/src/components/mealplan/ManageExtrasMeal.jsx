import { formatServings } from '../../utils/servingsUtils'
import { visibleExtras } from '../../utils/manageExtrasUtils'
import ExtraChoiceRow from './ExtraChoiceRow'

/** MPP-10: one planned meal (or template entry) and the extras the user can switch. */
function ManageExtrasMeal({ meal, onToggle }) {
  const slot = meal.mealType ? meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1) : ''
  const scaled = Number(meal.servings) !== Number(meal.defaultServings)

  return (
    <div className="mx-meal">
      <div className="mx-meal-head">
        <span className="mx-slot">{slot}</span>
        <span className="mx-recipe">{meal.recipeName}</span>
        {scaled && <span className="mx-serv">× {formatServings(meal.servings)}</span>}
        {meal.variantLabel && <span className="mx-variant">{meal.variantLabel}</span>}
      </div>
      {visibleExtras(meal).map((x) => (
        <ExtraChoiceRow
          key={x.extraRecipeId}
          extra={x}
          onChange={(homemade) => onToggle(meal.targetId, x.extraRecipeId, homemade)}
        />
      ))}
    </div>
  )
}

export default ManageExtrasMeal
