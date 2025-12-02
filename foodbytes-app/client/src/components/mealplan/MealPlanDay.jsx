import MealPlanEntry from './MealPlanEntry'
import { formatDateShort } from '../../utils/dateUtils'
import { getEmojiForMeal } from '../../utils/emojiUtils'
import './MealPlanDay.css'

/**
 * MealPlanDay - Single day in the meal plan calendar
 * Shows entries grouped by meal type (breakfast, lunch, dinner, snacks)
 * FR-040: Only shows meal types that have assigned recipes
 * FR-041: Uses dynamic food emojis per meal type
 */
function MealPlanDay({ day }) {
  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snacks', label: 'Snacks' }
  ]

  // FR-040: Filter to only show meal types with assigned recipes
  const activeMealTypes = mealTypes.filter(({ key }) => {
    const entries = day.mealsByType?.[key] || []
    return entries.length > 0
  })

  return (
    <div className={`meal-plan-day ${day.isToday ? 'today' : ''}`}>
      <header className="day-header">
        <span className="day-name">{day.dayOfWeek}</span>
        <span className="day-date">{formatDateShort(day.date)}</span>
        {day.isToday && <span className="today-badge">Today</span>}
      </header>

      <div className="day-meals">
        {/* FR-040: Only render meal types with assigned recipes */}
        {activeMealTypes.length > 0 ? (
          activeMealTypes.map(({ key, label }) => {
            const entries = day.mealsByType?.[key] || []
            // FR-041: Get dynamic emoji based on date and meal type
            const mealEmoji = getEmojiForMeal(day.date, key)
            return (
              <div key={key} className="meal-section">
                <div className="meal-header">
                  <span className="meal-icon">{mealEmoji}</span>
                  <span className="meal-label">{label}</span>
                </div>
                <div className="meal-entries">
                  {entries.map((entry) => (
                    <MealPlanEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          /* FR-040: Show placeholder when day is completely empty */
          <div className="empty-day-message">No meals planned</div>
        )}
      </div>

      <footer className="day-footer">
        <span className="day-calories">{day.totalCalories} cal</span>
      </footer>
    </div>
  )
}

export default MealPlanDay
