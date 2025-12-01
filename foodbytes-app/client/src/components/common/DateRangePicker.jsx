import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatDateShort } from '../../utils/dateUtils'
import './DateRangePicker.css'

/**
 * DateRangePicker - FR-007: Single "From" date picker with auto-calculated 7-day range
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

  return (
    <div className="date-range-picker">
      <span className="date-label">📅 From:</span>
      <input
        type="date"
        value={startDate}
        onChange={handleDateChange}
        className="date-input"
        aria-label="Start date for meal plan"
      />
      <span className="date-arrow">→</span>
      <span className="date-end">{formatDateShort(endDate)}</span>
    </div>
  )
}

export default DateRangePicker
