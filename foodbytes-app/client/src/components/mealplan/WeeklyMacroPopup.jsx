import { useEffect, useRef } from 'react'
import { formatDateRange } from '../../utils/dateUtils'
import './WeeklyMacroPopup.css'

/**
 * FR-082: Weekly Macro Summary Popup
 * Displays weekly macro totals and daily averages when clicking on week total
 */
function WeeklyMacroPopup({ weekData, onClose }) {
  const popupRef = useRef(null)

  // Close on click outside, ESC key, scroll
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleScroll = () => {
      onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)
    document.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [onClose])

  if (!weekData) return null

  // Get weekly totals (default to 0 if not provided)
  const weekTotalCalories = weekData.weekTotalCalories ?? 0
  const weekTotalProtein = weekData.weekTotalProtein ?? 0
  const weekTotalCarbs = weekData.weekTotalCarbs ?? 0
  const weekTotalFat = weekData.weekTotalFat ?? 0
  const daysWithMeals = weekData.daysWithMeals ?? 0

  // Calculate weekly totals in calories
  const weekProteinCalories = weekTotalProtein * 4
  const weekCarbsCalories = weekTotalCarbs * 4
  const weekFatCalories = weekTotalFat * 9

  // Get daily averages from backend or calculate
  const avgCalories = weekData.avgDailyCalories ?? (daysWithMeals > 0 ? Math.round(weekTotalCalories / daysWithMeals) : 0)
  const avgProtein = weekData.avgDailyProtein ?? (daysWithMeals > 0 ? Math.round(weekTotalProtein / daysWithMeals) : 0)
  const avgCarbs = weekData.avgDailyCarbs ?? (daysWithMeals > 0 ? Math.round(weekTotalCarbs / daysWithMeals) : 0)
  const avgFat = weekData.avgDailyFat ?? (daysWithMeals > 0 ? Math.round(weekTotalFat / daysWithMeals) : 0)

  // Calculate percentages for averages
  const avgProteinCalories = avgProtein * 4
  const avgCarbsCalories = avgCarbs * 4
  const avgFatCalories = avgFat * 9

  const avgProteinPercent = avgCalories > 0
    ? Math.round((avgProteinCalories / avgCalories) * 100)
    : 0
  const avgCarbsPercent = avgCalories > 0
    ? Math.round((avgCarbsCalories / avgCalories) * 100)
    : 0
  const avgFatPercent = avgCalories > 0
    ? Math.round((avgFatCalories / avgCalories) * 100)
    : 0

  return (
    <div className="macro-popup-overlay">
      <div ref={popupRef} className="macro-popup macro-popup-wide">
        <header className="macro-popup-header">
          <div className="macro-popup-title">
            <h4>Weekly Summary</h4>
            <span className="macro-popup-date">
              {formatDateRange(weekData.startDate, weekData.endDate)}
            </span>
          </div>
          <button
            className="macro-popup-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </header>

        <div className="macro-popup-content">
          {/* Weekly Totals Section */}
          <section className="macro-section">
            <h5 className="macro-section-title">Weekly Totals</h5>
            <div className="macro-total">
              <span className="macro-total-label">Total Calories</span>
              <span className="macro-total-value">{weekTotalCalories.toLocaleString()}</span>
            </div>
            <div className="macro-summary-grid">
              <div className="macro-summary-item">
                <span className="macro-summary-label">Protein</span>
                <span className="macro-summary-value">{weekTotalProtein}g</span>
                <span className="macro-summary-calories">{weekProteinCalories.toLocaleString()} cal</span>
              </div>
              <div className="macro-summary-item">
                <span className="macro-summary-label">Carbs</span>
                <span className="macro-summary-value">{weekTotalCarbs}g</span>
                <span className="macro-summary-calories">{weekCarbsCalories.toLocaleString()} cal</span>
              </div>
              <div className="macro-summary-item">
                <span className="macro-summary-label">Fat</span>
                <span className="macro-summary-value">{weekTotalFat}g</span>
                <span className="macro-summary-calories">{weekFatCalories.toLocaleString()} cal</span>
              </div>
            </div>
          </section>

          {/* Daily Averages Section */}
          <section className="macro-section">
            <h5 className="macro-section-title">
              Daily Average ({daysWithMeals} {daysWithMeals === 1 ? 'day' : 'days'} with meals)
            </h5>
            <div className="macro-total">
              <span className="macro-total-label">Avg Calories</span>
              <span className="macro-total-value">{avgCalories.toLocaleString()}</span>
            </div>
            <div className="macro-grid">
              <div className="macro-item macro-item-protein">
                <div className="macro-item-header">
                  <span className="macro-item-label">Protein</span>
                </div>
                <div className="macro-item-values">
                  <span className="macro-item-grams">{avgProtein}g</span>
                  <span className="macro-item-percent">{avgProteinPercent}%</span>
                </div>
                <div className="macro-item-calories">{avgProteinCalories} cal</div>
              </div>

              <div className="macro-item macro-item-carbs">
                <div className="macro-item-header">
                  <span className="macro-item-label">Carbs</span>
                </div>
                <div className="macro-item-values">
                  <span className="macro-item-grams">{avgCarbs}g</span>
                  <span className="macro-item-percent">{avgCarbsPercent}%</span>
                </div>
                <div className="macro-item-calories">{avgCarbsCalories} cal</div>
              </div>

              <div className="macro-item macro-item-fat">
                <div className="macro-item-header">
                  <span className="macro-item-label">Fat</span>
                </div>
                <div className="macro-item-values">
                  <span className="macro-item-grams">{avgFat}g</span>
                  <span className="macro-item-percent">{avgFatPercent}%</span>
                </div>
                <div className="macro-item-calories">{avgFatCalories} cal</div>
              </div>
            </div>
          </section>
        </div>

        <p className="macro-popup-hint">Press ESC or tap anywhere to close</p>
      </div>
    </div>
  )
}

export default WeeklyMacroPopup
