import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import MealPlanDay from './MealPlanDay'
import { formatDateRange } from '../../utils/dateUtils'
import './MealPlanCalendar.css'

/**
 * MealPlanCalendar - FR-016: 7-day calendar view of meal plan
 * Shows recipes organized by date and meal type
 */
function MealPlanCalendar() {
  const { isAuthenticated } = useAuth()
  const { weekPlan, startDate, endDate, loading, error } = useMealPlan()
  const navigate = useNavigate()

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
        <div className="calendar-header-top">
          <h2>Meal Plan</h2>
          {/* FR-038: Recipes navigation button */}
          <button
            className="recipes-nav-button"
            onClick={() => navigate('/')}
            title="Back to Recipes"
          >
            🍳 Recipes
          </button>
        </div>
        <span className="date-range">{formatDateRange(startDate, endDate)}</span>
        {weekPlan && (
          <span className="week-calories">
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
    </div>
  )
}

export default MealPlanCalendar
