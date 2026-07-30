import { useRef, useCallback } from 'react'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import PullToDismissUI from '../common/PullToDismissUI'
import { parseISODate } from '../../utils/dateUtils'
import './IngredientBreakdownPopup.css'

/**
 * FR-042: Ingredient Breakdown Popup
 * Shows which meals use an ingredient and how much each requires
 * - Closes via X button or clicking the grey overlay area
 * - Does NOT close on scroll or clicking inside the popup
 * - Supports pull-to-dismiss gesture on mobile
 */
function IngredientBreakdownPopup({ breakdown, onClose }) {
  const popupRef = useRef(null)

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

  // Combine refs for the popup element. The panel itself is the scroller here
  // (.breakdown-popup is max-height + overflow: auto), so it is both the scroll
  // boundary and the gesture surface.
  const setPopupRef = useCallback((el) => {
    popupRef.current = el
    setScrollableRef(el)
    setGestureRef(el)
  }, [setScrollableRef, setGestureRef])

  // Handle overlay click (grey area) - close popup
  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not the popup content
    if (e.target.classList.contains('breakdown-popup-overlay')) {
      onClose()
    }
  }

  if (!breakdown) return null

  // Meal type emoji mapping
  const mealEmojis = {
    breakfast: '\u{1F373}', // Cooking egg
    lunch: '\u{1F96A}',     // Sandwich
    dinner: '\u{1F35D}',    // Spaghetti
    snacks: '\u{1F36A}'     // Cookie
  }

  // Format quantity to remove trailing zeros
  const formatQuantity = (qty) => {
    const num = parseFloat(qty)
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2).replace(/\.?0+$/, '')
  }

  // Format planDate ("2026-07-27") without timezone drift -> "Mon 27 Jul"
  // parseISODate is the shared local-date parser (utils/dateUtils) — don't re-inline it here.
  const formatPlanDate = (planDate) => {
    if (!planDate) return ''
    return parseISODate(planDate).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  // The same dish can be planned several times in a week — show when each one is,
  // otherwise the rows look like duplicates. Derives the label from mealType rather
  // than a new literal map, so this file's meal-type debt doesn't grow.
  const formatMealContext = (meal) => {
    const mealLabel = meal.mealType
      ? meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)
      : ''
    const parts = [formatPlanDate(meal.planDate), mealLabel].filter(Boolean)
    if (meal.viaRecipeName) {
      parts.push(`via ${meal.viaRecipeName}`)
    }
    return parts.join(' · ')
  }

  return (
    <div className="breakdown-popup-overlay" onClick={handleOverlayClick}>
      <div
        ref={setPopupRef}
        className="breakdown-popup"
        {...dismissHandlers}
      >
        <header className="breakdown-header">
          <div className="breakdown-title-row">
            <h4>{breakdown.ingredientName}</h4>
            <span className="breakdown-total">
              {formatQuantity(breakdown.totalQuantity)} {breakdown.unit}
            </span>
          </div>
          <button
            className="breakdown-close-btn"
            onClick={onClose}
            aria-label="Close breakdown"
          >
            &times;
          </button>
        </header>

        <ul className="breakdown-list">
          {breakdown.mealBreakdown.map((meal, idx) => (
            <li key={idx} className="breakdown-item">
              <span className="meal-emoji">
                {mealEmojis[meal.mealType] || '\u{1F37D}'}
              </span>
              <span className="meal-details">
                <span className="meal-name">{meal.recipeName}</span>
                <span className="meal-context">{formatMealContext(meal)}</span>
              </span>
              <span className="meal-quantity">
                {formatQuantity(meal.quantity)} {breakdown.unit}
              </span>
            </li>
          ))}
        </ul>
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

export default IngredientBreakdownPopup
