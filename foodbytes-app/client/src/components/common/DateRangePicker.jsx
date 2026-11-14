import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
import { addDays, formatDateISO, formatWeekRange, getTodayISO, parseISODate } from '../../utils/dateUtils'
import './DateRangePicker.css'

/**
 * DateRangePicker - FR-007: week pill ("‹ 📅 Nov 9 – 15 ›") over a single start-date picker; the range is 7 days
 * Week arrows step the range by 7 days; "This week" returns to the default start (today).
 * Only shown to authenticated users
 */
function DateRangePicker() {
  const { isAuthenticated } = useAuth()
  const { startDate, endDate, setStartDate } = useMealPlan()

  // Only show for authenticated users
  if (!isAuthenticated) {
    return null
  }

  const handleDateChange = (e) => {
    setStartDate(e.target.value)
  }

  // Chrome only opens the picker from the calendar glyph; showPicker() makes the whole pill work.
  const openPicker = (e) => {
    try { e.currentTarget.showPicker?.() } catch { /* already open, or not allowed: the native control still works */ }
  }

  const shiftWeek = (weeks) => setStartDate(formatDateISO(addDays(parseISODate(startDate), weeks * 7)))
  // Same rule MealPlanContext falls back to when nothing is saved: the week starts today.
  const thisWeekStart = getTodayISO()

  return (
    <div className="date-range-picker">
      <button type="button" className="week-arrow" onClick={() => shiftWeek(-1)} aria-label="Previous week">‹</button>
      {/* The native date input sits invisibly over the pill, so a tap opens the picker on every platform. */}
      <div className="date-range-pill">
        <span className="date-range-text">📅 {formatWeekRange(startDate, endDate)}</span>
        <input
          type="date"
          value={startDate}
          onChange={handleDateChange}
          onClick={openPicker}
          className="date-input"
          aria-label="Start date for meal plan"
        />
      </div>
      <button type="button" className="week-arrow" onClick={() => shiftWeek(1)} aria-label="Next week">›</button>
      {startDate !== thisWeekStart && (
        <button type="button" className="this-week-btn" onClick={() => setStartDate(thisWeekStart)}>This week</button>
      )}
    </div>
  )
}

export default DateRangePicker
