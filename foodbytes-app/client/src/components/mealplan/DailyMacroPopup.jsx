import { useEffect, useRef, useCallback } from 'react'
import { formatDateShort } from '../../utils/dateUtils'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import PullToDismissUI from '../common/PullToDismissUI'
import './DailyMacroPopup.css'

/**
 * FR-081: Daily Macro Popup
 * Displays macro breakdown for a single day when clicking on daily calories
 * Supports pull-to-dismiss gesture on mobile
 */
function DailyMacroPopup({ day, onClose }) {
  const popupRef = useRef(null)

  // Pull-to-dismiss hook
  const {
    isDragging,
    circlePosition,
    isOverTarget,
    dragDirection,
    handlers: dismissHandlers,
    setScrollableRef,
    targetPosition
  } = usePullToDismiss(onClose)

  // Combine refs for the popup element
  const setPopupRef = useCallback((el) => {
    popupRef.current = el
    setScrollableRef(el)
  }, [setScrollableRef])

  // Close on click outside, ESC key, or scroll
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

  if (!day) return null

  // Get macro values (default to 0 if not provided)
  const totalProtein = day.totalProtein ?? 0
  const totalCarbs = day.totalCarbs ?? 0
  const totalFat = day.totalFat ?? 0
  const totalCalories = day.totalCalories ?? 0

  // Calculate macro percentages
  // Formula: protein/carbs = 4 cal/g, fat = 9 cal/g
  const proteinCalories = totalProtein * 4
  const carbsCalories = totalCarbs * 4
  const fatCalories = totalFat * 9

  const proteinPercent = totalCalories > 0
    ? Math.round((proteinCalories / totalCalories) * 100)
    : 0
  const carbsPercent = totalCalories > 0
    ? Math.round((carbsCalories / totalCalories) * 100)
    : 0
  const fatPercent = totalCalories > 0
    ? Math.round((fatCalories / totalCalories) * 100)
    : 0

  return (
    <div className="macro-popup-overlay">
      <div
        ref={setPopupRef}
        className="macro-popup"
        {...dismissHandlers}
      >
        <header className="macro-popup-header">
          <div className="macro-popup-title">
            <h4>{day.dayOfWeek}</h4>
            <span className="macro-popup-date">{formatDateShort(day.date)}</span>
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
          <div className="macro-total">
            <span className="macro-total-label">Total Calories</span>
            <span className="macro-total-value">{totalCalories}</span>
          </div>

          <div className="macro-grid">
            <div className="macro-item macro-item-protein">
              <div className="macro-item-header">
                <span className="macro-item-label">Protein</span>
              </div>
              <div className="macro-item-values">
                <span className="macro-item-grams">{totalProtein}g</span>
                <span className="macro-item-percent">{proteinPercent}%</span>
              </div>
              <div className="macro-item-calories">{proteinCalories} cal</div>
            </div>

            <div className="macro-item macro-item-carbs">
              <div className="macro-item-header">
                <span className="macro-item-label">Carbs</span>
              </div>
              <div className="macro-item-values">
                <span className="macro-item-grams">{totalCarbs}g</span>
                <span className="macro-item-percent">{carbsPercent}%</span>
              </div>
              <div className="macro-item-calories">{carbsCalories} cal</div>
            </div>

            <div className="macro-item macro-item-fat">
              <div className="macro-item-header">
                <span className="macro-item-label">Fat</span>
              </div>
              <div className="macro-item-values">
                <span className="macro-item-grams">{totalFat}g</span>
                <span className="macro-item-percent">{fatPercent}%</span>
              </div>
              <div className="macro-item-calories">{fatCalories} cal</div>
            </div>
          </div>
        </div>

        <p className="macro-popup-hint">Press ESC or tap anywhere to close</p>
      </div>

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

export default DailyMacroPopup
