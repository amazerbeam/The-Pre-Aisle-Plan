import { useState } from 'react'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import MealPlanDay from './MealPlanDay'
import WeeklyMacroPopup from './WeeklyMacroPopup'
import { formatDateRange } from '../../utils/dateUtils'
import './MealPlanCalendar.css'

/**
 * MealPlanCalendar - FR-016: 7-day calendar view of meal plan
 * FR-082: Clickable week total showing macro summary popup
 * Shows recipes organized by date and meal type
 */
function MealPlanCalendar() {
  const { isAuthenticated } = useAuth()
  const { weekPlan, startDate, endDate, loading, error } = useMealPlan()
  const navigate = useNavigate()
  const [showWeeklyPopup, setShowWeeklyPopup] = useState(false)

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="meal-plan-auth-required">
        <h2>Sign In Required</h2>
        <p>Please sign in to view and manage your meal plan.</p>
        <button onClick={() => navigate('/')}>Go to Recipes</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="meal-plan-loading">
        <div className="spinner"></div>
        <p>Loading your meal plan...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="meal-plan-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="meal-plan-calendar">
      <header className="calendar-header">
        {/* FR-038: Recipes button moved to Footer.jsx - DO NOT add navigation buttons here */}
        <h2>Meal Plan</h2>
        <span className="date-range">{formatDateRange(startDate, endDate)}</span>
        {/* FR-082: Make week total clickable */}
        {weekPlan && (
          <span
            className="week-calories week-calories-clickable"
            onClick={() => setShowWeeklyPopup(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setShowWeeklyPopup(true)
              }
            }}
            aria-label="View weekly macro summary"
          >
            Week Total: {weekPlan.weekTotalCalories} cal
          </span>
        )}
      </header>

      <div className="calendar-grid">
        {weekPlan?.days?.map((day) => (
          <MealPlanDay key={day.date} day={day} />
        ))}
      </div>

      {(!weekPlan || weekPlan.days?.every(d =>
        Object.values(d.mealsByType || {}).every(entries => entries.length === 0)
      )) && (
        <div className="empty-plan">
          <p>Your meal plan is empty for this week.</p>
          <p>Go to <a href="/">Recipes</a> and click the day buttons to add meals!</p>
        </div>
      )}

      {/* FR-082: Weekly Macro Popup */}
      {showWeeklyPopup && weekPlan && (
        <WeeklyMacroPopup
          weekData={weekPlan}
          onClose={() => setShowWeeklyPopup(false)}
        />
      )}
    </div>
  )
}

export default MealPlanCalendar
