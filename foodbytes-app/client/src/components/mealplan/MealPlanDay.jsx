import { useState, forwardRef } from 'react'
import { Link } from 'react-router-dom'
import MealPlanEntry from './MealPlanEntry'
import DailyMacroPopup from './DailyMacroPopup'
import { formatDateShort } from '../../utils/dateUtils'
import { getEmojiForMeal } from '../../utils/emojiUtils'
import './MealPlanDay.css'

/**
 * MealPlanDay - Single day in the meal plan calendar
 * Shows entries grouped by meal type (breakfast, lunch, dinner, snacks)
 * FR-040: Only shows meal types that have assigned recipes
 * FR-041: Uses dynamic food emojis per meal type
 * FR-081: Clickable calories showing macro breakdown popup
 * Clickable day header to initiate day swap
 * Supports ref forwarding for scroll-to-today on mobile
 */
const MealPlanDay = forwardRef(function MealPlanDay({ day, onSwapClick, isSwapSource }, ref) {
  const [showMacroPopup, setShowMacroPopup] = useState(false)

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

  // Find missing meal types (excluding snacks - only show breakfast, lunch, dinner as missing)
  const coreMealTypes = mealTypes.filter(m => m.key !== 'snacks')
  const missingMealTypes = coreMealTypes.filter(({ key }) => {
    const entries = day.mealsByType?.[key] || []
    return entries.length === 0
  })

  const handleHeaderClick = () => {
    if (onSwapClick) {
      onSwapClick(day)
    }
  }

  const handleHeaderKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleHeaderClick()
    }
  }

  return (
    <div
      ref={ref}
      className={`meal-plan-day ${day.isToday ? 'today' : ''} ${isSwapSource ? 'swap-source' : ''}`}
    >
      <header
        className="day-header day-header-clickable"
        onClick={handleHeaderClick}
        role="button"
        tabIndex={0}
        onKeyDown={handleHeaderKeyDown}
        aria-label={`Swap ${day.dayOfWeek} ${formatDateShort(day.date)} with another day`}
      >
        <span className="day-name">{day.dayOfWeek}</span>
        <span className="day-date">{formatDateShort(day.date)}</span>
        {day.isToday && <span className="today-badge">Today</span>}
      </header>

      <div className="day-meals">
        {/* FR-040: Only render meal types with assigned recipes */}
        {activeMealTypes.length > 0 ? (
          <>
            {activeMealTypes.map(({ key, label }) => {
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
            })}
            {/* Show missing meal types as clickable links */}
            {missingMealTypes.length > 0 && (
              <div className="missing-meals">
                {missingMealTypes.map(({ key, label }) => (
                  <Link
                    key={key}
                    to={`/?mealType=${key}`}
                    className="missing-meal-link"
                  >
                    + {label}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          /* FR-040: Show all meal types as clickable links when day is completely empty */
          <div className="missing-meals missing-meals-empty">
            {coreMealTypes.map(({ key, label }) => (
              <Link
                key={key}
                to={`/?mealType=${key}`}
                className="missing-meal-link"
              >
                + {label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="day-footer">
        {/* FR-081: Make calorie text clickable */}
        <span
          className="day-calories day-calories-clickable"
          onClick={() => setShowMacroPopup(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setShowMacroPopup(true)
            }
          }}
          aria-label={`View macro breakdown for ${day.dayOfWeek}`}
        >
          {day.totalCalories} cal
        </span>
      </footer>

      {/* FR-081: Daily Macro Popup */}
      {showMacroPopup && (
        <DailyMacroPopup
          day={day}
          onClose={() => setShowMacroPopup(false)}
        />
      )}
    </div>
  )
})

export default MealPlanDay
