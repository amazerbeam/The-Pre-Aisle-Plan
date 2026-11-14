import { formatDateShort } from '../../utils/dateUtils'
import MealPlanSheet from './MealPlanSheet'

/**
 * Pick a day + slot to move a meal to. A filled slot is swapped with its occupant (one meal per slot).
 * Calls onMove(entry, dateISO, mealId), then closes.
 */
function MoveMealSheet({ entry, weekPlan, slots, onMove, onClose }) {
  const days = weekPlan?.days || []

  return (
    <MealPlanSheet title={`Move ${entry.recipe?.name ?? 'meal'}`} onClose={onClose}>
      {days.length === 0 && <p className="meal-sheet-section">No days in this week.</p>}
      {days.map((day) => (
        <div key={day.date}>
          <div className="meal-sheet-section">{day.dayOfWeek} · {formatDateShort(day.date)}</div>
          <div className="meal-sheet-slots">
            {slots.map((slot) => {
              const occupant = (day.mealsByType?.[slot.key] || [])[0]
              const isCurrent = day.date === entry.planDate && slot.mealId === entry.mealId
              return (
                <button
                  key={slot.key}
                  type="button"
                  className="meal-sheet-slot"
                  disabled={isCurrent}
                  onClick={() => { onMove(entry, day.date, slot.mealId); onClose() }}
                >
                  {slot.label}
                  {occupant && !isCurrent && <small>swap with {occupant.recipe?.name}</small>}
                  {isCurrent && <small>current</small>}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </MealPlanSheet>
  )
}

export default MoveMealSheet
