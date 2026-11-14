import MacroChips from '../common/MacroChips'
import { formatDateShort } from '../../utils/dateUtils'
import { dayMacros } from '../../utils/mealPlanDayUtils'

/** Column header of the desktop timetable: day, date, swap, and the day's kcal + macro chips. */
function DayHeader({ day, onSwap, onOpenDayMacros }) {
  return (
    <div className={`day-header ${day.isToday ? 'is-today' : ''}`}>
      <div className="day-header-top">
        <span className="day-header-name">{day.dayOfWeek}</span>
        <span className="day-header-date">{formatDateShort(day.date)}</span>
        <button type="button" className="day-header-swap" onClick={() => onSwap(day)}
                aria-label={`Swap ${day.dayOfWeek} with another day`} title="Swap with another day">⇄</button>
      </div>
      <button type="button" className="day-header-macros" onClick={() => onOpenDayMacros(day)}
              aria-label={`View macro breakdown for ${day.dayOfWeek}`}>
        <span className="day-header-kcal">{(day.totalCalories ?? 0).toLocaleString()} kcal</span>
        <MacroChips macros={dayMacros(day)} variant={day.isToday ? 'onDark' : 'light'} />
      </button>
    </div>
  )
}

export default DayHeader
