import MacroChips from '../common/MacroChips'
import { dayMacros } from '../../utils/mealPlanDayUtils'
import { formatDateShort } from '../../utils/dateUtils'

/** Summary card for the selected day: kcal and P/C/F chips; opens the daily macro popup. */
function MobileDaySummary({ day, onOpen }) {
  return (
    <button type="button" className="day-summary" onClick={onOpen}>
      <span className="day-summary-main">
        <span className="day-summary-label">{day.isToday ? 'Today · ' : ''}{day.dayOfWeek} {formatDateShort(day.date)}</span>
        <span className="day-summary-kcal">{(day.totalCalories ?? 0).toLocaleString()} kcal</span>
        <MacroChips macros={dayMacros(day)} />
      </span>
      <span className="day-summary-go" aria-hidden="true">›</span>
    </button>
  )
}

export default MobileDaySummary
