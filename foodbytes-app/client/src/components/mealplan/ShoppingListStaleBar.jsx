import { useShoppingList } from '../../contexts/ShoppingListContext'
import { formatShortRange } from '../../utils/manageExtrasUtils'

/** MPP-10 / AC 11: a saved list overlapping the edited week is now out of date. */
function ShoppingListStaleBar({ weekStart, weekEnd }) {
  const { shoppingList, generateShoppingList, isGenerating, error } = useShoppingList()
  const overlaps = shoppingList?.startDate && shoppingList.startDate <= weekEnd && shoppingList.endDate >= weekStart
  if (!overlaps) return null
  return (
    <div className="mx-stale" role="status">
      <span>Your shopping list for {formatShortRange(shoppingList.startDate, shoppingList.endDate)} was made before this change.</span>
      <button type="button" className="mx-stale-button" disabled={isGenerating}
        onClick={() => generateShoppingList(shoppingList.startDate, shoppingList.endDate)}>
        {isGenerating ? 'Regenerating…' : 'Regenerate list'}
      </button>
      {error && <span className="mx-stale-error">{error}</span>}
    </div>
  )
}

export default ShoppingListStaleBar
