import MealPlanEntry from './MealPlanEntry'
import { formatDateShort } from '../../utils/dateUtils'
import './MealPlanDay.css'

/**
 * MealPlanDay - Single day in the meal plan calendar
 * Shows entries grouped by meal type (breakfast, lunch, dinner, snacks)
 */
function MealPlanDay({ day }) {
  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { key: 'lunch', label: 'Lunch', icon: '🌞' },
    { key: 'dinner', label: 'Dinner', icon: '🌙' },
    { key: 'snacks', label: 'Snacks', icon: '🍿' }
  ]

  return (
    <div className={`meal-plan-day ${day.isToday ? 'today' : ''}`}>
      <header className="day-header">
        <span className="day-name">{day.dayOfWeek}</span>
        <span className="day-date">{formatDateShort(day.date)}</span>
        {day.isToday && <span className="today-badge">Today</span>}
      </header>

      <div className="day-meals">
        {mealTypes.map(({ key, label, icon }) => {
          const entries = day.mealsByType?.[key] || []
          return (
            <div key={key} className="meal-section">
              <div className="meal-header">
                <span className="meal-icon">{icon}</span>
                <span className="meal-label">{label}</span>
              </div>
              <div className="meal-entries">
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <MealPlanEntry key={entry.id} entry={entry} />
                  ))
                ) : (
                  <div className="empty-meal">—</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <footer className="day-footer">
        <span className="day-calories">{day.totalCalories} cal</span>
      </footer>
    </div>
  )
}

export default MealPlanDay
