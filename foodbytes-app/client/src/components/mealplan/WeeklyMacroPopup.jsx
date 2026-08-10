import { useEffect, useRef, useCallback, useState } from 'react'
import { formatDateRange } from '../../utils/dateUtils'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import PullToDismissUI from '../common/PullToDismissUI'
import MacroTargetPopup from '../recipes/MacroTargetPopup'
import { DAILY_MACRO_TARGETS, MACRO_COPY, WEEKLY_MACRO_TARGETS } from '../../constants/macroTargets'
import { evaluateMacro, hasUsableMacros } from '../../utils/macroStatus'
import './WeeklyMacroPopup.css'

/**
 * FR-082: Weekly Macro Summary Popup
 * Displays weekly macro totals and daily averages when clicking on week total
 * Supports pull-to-dismiss gesture on mobile
 */
function WeeklyMacroPopup({ weekData, onClose }) {
  const popupRef = useRef(null)
  const [openMacro, setOpenMacro] = useState(null) // { key: 'protein'|'carbs'|'fat', scope: 'day'|'week' } | null

  useBodyScrollLock(!!weekData)

  // Pull-to-dismiss hook
  const {
    isDragging,
    circlePosition,
    isOverTarget,
    dragDirection,
    handlers: dismissHandlers,
    setScrollableRef,
    setGestureRef,
    targetPosition
  } = usePullToDismiss(onClose)

  // Panel owns the gesture surface and the click-outside boundary
  const setPopupRef = useCallback((el) => {
    popupRef.current = el
    setGestureRef(el)
  }, [setGestureRef])

  // Close on click outside or ESC key
  useEffect(() => {
    const handleClickOutside = (e) => {
      // MacroTargetPopup renders via createPortal(document.body), so its DOM
      // nodes are real siblings of popupRef.current, not descendants —
      // .contains() below would return false for a click inside it and
      // incorrectly close this popup out from under the nested one (MPP-2).
      if (e.target.closest?.('.macro-target-overlay')) return
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
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

  const weekMacros = { protein: weekTotalProtein, carbs: weekTotalCarbs, fat: weekTotalFat }
  const avgMacros = { protein: avgProtein, carbs: avgCarbs, fat: avgFat }

  // All-zero macros (no planned meals for the week, or no days with meals) is a
  // data-completeness gap, not a nutrition verdict — see macroStatus.hasUsableMacros.
  // Skip opening the popup for whichever section has nothing to show.
  const weekHasUsableMacros = hasUsableMacros(weekMacros)
  const avgHasUsableMacros = hasUsableMacros(avgMacros)

  // Border/background colour reflects whether the target is met — under (blue) /
  // near (amber) / on (green) / over (red) — not a fixed colour per macro. See
  // macroTargets.js MACRO_STATUS and the equivalent comment in DailyMacroPopup.
  const weekProteinStatus = weekHasUsableMacros
    ? evaluateMacro(weekMacros, 'protein', WEEKLY_MACRO_TARGETS).status
    : 'plain'
  const weekCarbsStatus = weekHasUsableMacros
    ? evaluateMacro(weekMacros, 'carbs', WEEKLY_MACRO_TARGETS).status
    : 'plain'
  const weekFatStatus = weekHasUsableMacros
    ? evaluateMacro(weekMacros, 'fat', WEEKLY_MACRO_TARGETS).status
    : 'plain'

  const avgProteinStatus = avgHasUsableMacros
    ? evaluateMacro(avgMacros, 'protein', DAILY_MACRO_TARGETS).status
    : 'plain'
  const avgCarbsStatus = avgHasUsableMacros
    ? evaluateMacro(avgMacros, 'carbs', DAILY_MACRO_TARGETS).status
    : 'plain'
  const avgFatStatus = avgHasUsableMacros
    ? evaluateMacro(avgMacros, 'fat', DAILY_MACRO_TARGETS).status
    : 'plain'

  return (
    <div className="macro-popup-overlay">
      <div
        ref={setPopupRef}
        className="macro-popup macro-popup-wide"
        {...dismissHandlers}
      >
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

        {/* Inner scroller: defines the at-top / at-bottom pull-to-dismiss boundaries */}
        <div className="macro-popup-content" ref={setScrollableRef}>
          {/* Weekly Totals Section */}
          <section className="macro-section">
            <h5 className="macro-section-title">Weekly Totals</h5>
            <div className="macro-total">
              <span className="macro-total-label">Total Calories</span>
              <span className="macro-total-value">{weekTotalCalories.toLocaleString()}</span>
            </div>
            <div className="macro-summary-grid">
              <button
                type="button"
                className={`macro-summary-item macro-summary-item--${weekProteinStatus}`}
                onClick={weekHasUsableMacros ? () => setOpenMacro({ key: 'protein', scope: 'week' }) : undefined}
                disabled={!weekHasUsableMacros}
                aria-haspopup={weekHasUsableMacros ? 'dialog' : undefined}
                aria-expanded={weekHasUsableMacros ? (openMacro?.key === 'protein' && openMacro?.scope === 'week') : undefined}
              >
                <span className="macro-summary-label">Protein</span>
                <span className="macro-summary-value">{weekTotalProtein}g</span>
                <span className="macro-summary-calories">{weekProteinCalories.toLocaleString()} cal</span>
              </button>
              <button
                type="button"
                className={`macro-summary-item macro-summary-item--${weekCarbsStatus}`}
                onClick={weekHasUsableMacros ? () => setOpenMacro({ key: 'carbs', scope: 'week' }) : undefined}
                disabled={!weekHasUsableMacros}
                aria-haspopup={weekHasUsableMacros ? 'dialog' : undefined}
                aria-expanded={weekHasUsableMacros ? (openMacro?.key === 'carbs' && openMacro?.scope === 'week') : undefined}
              >
                <span className="macro-summary-label">Carbs</span>
                <span className="macro-summary-value">{weekTotalCarbs}g</span>
                <span className="macro-summary-calories">{weekCarbsCalories.toLocaleString()} cal</span>
              </button>
              <button
                type="button"
                className={`macro-summary-item macro-summary-item--${weekFatStatus}`}
                onClick={weekHasUsableMacros ? () => setOpenMacro({ key: 'fat', scope: 'week' }) : undefined}
                disabled={!weekHasUsableMacros}
                aria-haspopup={weekHasUsableMacros ? 'dialog' : undefined}
                aria-expanded={weekHasUsableMacros ? (openMacro?.key === 'fat' && openMacro?.scope === 'week') : undefined}
              >
                <span className="macro-summary-label">Fat</span>
                <span className="macro-summary-value">{weekTotalFat}g</span>
                <span className="macro-summary-calories">{weekFatCalories.toLocaleString()} cal</span>
              </button>
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
              <button
                type="button"
                className={`macro-item macro-item--${avgProteinStatus}`}
                onClick={avgHasUsableMacros ? () => setOpenMacro({ key: 'protein', scope: 'day' }) : undefined}
                disabled={!avgHasUsableMacros}
                aria-haspopup={avgHasUsableMacros ? 'dialog' : undefined}
                aria-expanded={avgHasUsableMacros ? (openMacro?.key === 'protein' && openMacro?.scope === 'day') : undefined}
              >
                <div className="macro-item-header">
                  <span className="macro-item-label">Protein</span>
                </div>
                <div className="macro-item-values">
                  <span className="macro-item-grams">{avgProtein}g</span>
                  <span className="macro-item-percent">{avgProteinPercent}%</span>
                </div>
                <div className="macro-item-calories">{avgProteinCalories} cal</div>
              </button>

              <button
                type="button"
                className={`macro-item macro-item--${avgCarbsStatus}`}
                onClick={avgHasUsableMacros ? () => setOpenMacro({ key: 'carbs', scope: 'day' }) : undefined}
                disabled={!avgHasUsableMacros}
                aria-haspopup={avgHasUsableMacros ? 'dialog' : undefined}
                aria-expanded={avgHasUsableMacros ? (openMacro?.key === 'carbs' && openMacro?.scope === 'day') : undefined}
              >
                <div className="macro-item-header">
                  <span className="macro-item-label">Carbs</span>
                </div>
                <div className="macro-item-values">
                  <span className="macro-item-grams">{avgCarbs}g</span>
                  <span className="macro-item-percent">{avgCarbsPercent}%</span>
                </div>
                <div className="macro-item-calories">{avgCarbsCalories} cal</div>
              </button>

              <button
                type="button"
                className={`macro-item macro-item--${avgFatStatus}`}
                onClick={avgHasUsableMacros ? () => setOpenMacro({ key: 'fat', scope: 'day' }) : undefined}
                disabled={!avgHasUsableMacros}
                aria-haspopup={avgHasUsableMacros ? 'dialog' : undefined}
                aria-expanded={avgHasUsableMacros ? (openMacro?.key === 'fat' && openMacro?.scope === 'day') : undefined}
              >
                <div className="macro-item-header">
                  <span className="macro-item-label">Fat</span>
                </div>
                <div className="macro-item-values">
                  <span className="macro-item-grams">{avgFat}g</span>
                  <span className="macro-item-percent">{avgFatPercent}%</span>
                </div>
                <div className="macro-item-calories">{avgFatCalories} cal</div>
              </button>
            </div>
          </section>
        </div>

        <p className="macro-popup-hint">Press ESC or tap outside to close</p>
      </div>

      {openMacro && (
        <MacroTargetPopup
          macroKey={openMacro.key}
          macros={openMacro.scope === 'week' ? weekMacros : avgMacros}
          displayedCaloriesPerServing={openMacro.scope === 'week' ? weekTotalCalories : avgCalories}
          targets={openMacro.scope === 'week' ? WEEKLY_MACRO_TARGETS : DAILY_MACRO_TARGETS}
          periodLabel={openMacro.scope === 'week' ? 'per week (7-day total)' : 'per day (average)'}
          footerNote={MACRO_COPY.DAILY_NOTE}
          onClose={() => setOpenMacro(null)}
        />
      )}

      {/* Pull-to-dismiss UI */}
      <PullToDismissUI
        isDragging={isDragging}
        circlePosition={circlePosition}
        isOverTarget={isOverTarget}
        targetPosition={targetPosition}
        dragDirection={dragDirection}
      />
    </div>
  )
}

export default WeeklyMacroPopup
