import MacroChips from '../common/MacroChips'
import ShoppingListStaleBar from './ShoppingListStaleBar'
import { plannedSlotCount, weekAvgMacros } from '../../utils/mealPlanDayUtils'
import './WeekSummary.css'

const CORE_SLOT_TOTAL = 21

/** Desktop week header: totals + average macros (opens the weekly breakdown) and the stale-shopping-list notice. */
function WeekSummary({ weekPlan, onOpenWeekMacros }) {
  const total = weekPlan.weekTotalCalories ?? 0
  const avg = weekPlan.avgDailyCalories ?? 0

  return (
    <div className="week-summary">
      <button
        type="button"
        className="week-summary-tile"
        onClick={onOpenWeekMacros}
        aria-label="View weekly macro summary"
      >
        <span className="week-summary-main">
          <span className="week-summary-label">This week</span>
          <span className="week-summary-value">{total.toLocaleString()} kcal</span>
          <span className="week-summary-sub">
            avg {avg.toLocaleString()} / day · {plannedSlotCount(weekPlan)} of {CORE_SLOT_TOTAL} meals planned
          </span>
        </span>
        <span className="week-summary-macros">
          <span className="week-summary-label">Week macros (avg / day)</span>
          <MacroChips macros={weekAvgMacros(weekPlan)} variant="large" />
        </span>
        <span className="week-summary-more" aria-hidden="true">Details ›</span>
      </button>
      <div className="week-summary-stale">
        <ShoppingListStaleBar weekStart={weekPlan.startDate} weekEnd={weekPlan.endDate} />
      </div>
    </div>
  )
}

export default WeekSummary
