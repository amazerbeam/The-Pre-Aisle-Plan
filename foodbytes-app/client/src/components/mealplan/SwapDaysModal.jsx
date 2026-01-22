import { useEffect, useRef, useCallback } from 'react'
import { formatDateShort } from '../../utils/dateUtils'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import PullToDismissUI from '../common/PullToDismissUI'
import './SwapDaysModal.css'

/**
 * SwapDaysModal - Popup for swapping meals between two days
 * Shows all other days in the week as selectable options
 * Supports pull-to-dismiss gesture on mobile
 */
function SwapDaysModal({ sourceDay, allDays, onSwap, onClose }) {
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

  // Filter out the source day from available swap targets
  const targetDays = allDays.filter(d => d.date !== sourceDay.date)

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

  const handleDaySelect = (targetDay) => {
    onSwap(sourceDay.date, targetDay.date)
    onClose()
  }

  // Count meals for a day
  const getMealCount = (day) => {
    if (!day.mealsByType) return 0
    return Object.values(day.mealsByType).reduce((sum, entries) => sum + entries.length, 0)
  }

  return (
    <div className="swap-modal-overlay">
      <div
        ref={setPopupRef}
        className="swap-modal"
        {...dismissHandlers}
      >
        <header className="swap-modal-header">
          <div className="swap-modal-title">
            <h4>Swap with what day?</h4>
            <span className="swap-modal-subtitle">
              Swapping {sourceDay.dayOfWeek} {formatDateShort(sourceDay.date)}
            </span>
          </div>
          <button
            className="swap-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </header>

        <div className="swap-modal-content">
          <div className="swap-day-grid">
            {targetDays.map((day) => {
              const mealCount = getMealCount(day)
              return (
                <button
                  key={day.date}
                  className={`swap-day-button ${day.isToday ? 'today' : ''}`}
                  onClick={() => handleDaySelect(day)}
                >
                  <span className="swap-day-name">{day.dayOfWeek}</span>
                  <span className="swap-day-date">{formatDateShort(day.date)}</span>
                  <span className="swap-day-meals">
                    {mealCount === 0 ? 'No meals' : `${mealCount} meal${mealCount !== 1 ? 's' : ''}`}
                  </span>
                  {day.isToday && <span className="swap-today-badge">Today</span>}
                </button>
              )
            })}
          </div>
        </div>

        <p className="swap-modal-hint">Press ESC or tap outside to cancel</p>
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

export default SwapDaysModal
