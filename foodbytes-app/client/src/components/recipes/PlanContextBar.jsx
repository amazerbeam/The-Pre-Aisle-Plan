import { MEAL_SLOTS, SNACKS_SLOT } from '../../constants/mealPlanUi'
import { getShortDayName, parseISODate } from '../../utils/dateUtils'

const MEAL_LABEL = Object.fromEntries([...MEAL_SLOTS, SNACKS_SLOT].map(s => [s.key, s.label]))

/**
 * Recipe view header bar for a recipe opened from a meal-plan entry: "Sat 14 · Dinner" plus a
 * one-tap "Mark as eaten". `eatenSave` is the modal's useMealEatenSave result (the same save path
 * as the bottom MealEatenSection); Undo lives in that section.
 */
function PlanContextBar({ entry, eatenSave }) {
  const { eaten, save, saving, error } = eatenSave
  const date = parseISODate(entry.planDate)
  const label = `${getShortDayName(date)} ${date.getDate()} · ${MEAL_LABEL[entry.mealType] ?? entry.mealType}`

  return (
    <div className="rv-ctx">
      <span aria-hidden="true">📅</span>
      <span className="rv-ctx-label"><b>{label}</b> · from your plan</span>
      <button
        type="button"
        className={`rv-eat ${eaten ? 'on' : ''}`}
        onClick={() => { if (!eaten) save(true) }}
        disabled={saving}
        aria-pressed={eaten}
      >
        {eaten ? '✓ Eaten' : '○ Mark as eaten'}
      </button>
      {error && <span className="rv-ctx-error" role="alert">{error}</span>}
    </div>
  )
}

export default PlanContextBar
