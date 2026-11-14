import MacroChips from '../common/MacroChips'
import { weekAvgMacros } from '../../utils/mealPlanDayUtils'

/** Full-width week summary bar in the mobile header: total kcal and average P/C/F; opens the weekly popup. */
function MobileWeekBar({ weekPlan, onOpen }) {
  const total = weekPlan.weekTotalCalories ?? 0
  return (
    <button type="button" className="m-weekbar" onClick={onOpen} aria-label="View weekly macro summary">
      <b>Week {total.toLocaleString()} kcal</b>
      <MacroChips macros={weekAvgMacros(weekPlan)} variant="onDark" />
      <span className="m-weekbar-go" aria-hidden="true">›</span>
    </button>
  )
}

export default MobileWeekBar
