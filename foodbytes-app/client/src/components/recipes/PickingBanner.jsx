import { getShortDayName } from '../../utils/dateUtils'

function PickingBanner({ mealLabel, pickDate, onCancel }) {
  const dayName = getShortDayName(pickDate)
  const dayNumber = Number(pickDate.slice(8, 10))
  return (
    <div className="picking-banner" role="status">
      <span>
        Picking <b>{mealLabel.toLowerCase()}</b> for <b>{dayName} {dayNumber}</b>. Tap "Add to {dayName}" on any recipe.
      </span>
      <button type="button" onClick={onCancel}>Cancel</button>
    </div>
  )
}

export default PickingBanner
