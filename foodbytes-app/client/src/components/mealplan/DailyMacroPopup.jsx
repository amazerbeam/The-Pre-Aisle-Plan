import { useEffect, useRef, useCallback, useState } from 'react'
import { formatDateShort } from '../../utils/dateUtils'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import PullToDismissUI from '../common/PullToDismissUI'
import MacroTargetPopup from '../recipes/MacroTargetPopup'
import { DAILY_MACRO_TARGETS, MACRO_COPY } from '../../constants/macroTargets'
import { hasUsableMacros } from '../../utils/macroStatus'
import './DailyMacroPopup.css'

/**
 * FR-081: Daily Macro Popup
 * Displays macro breakdown for a single day when clicking on daily calories
 * Supports pull-to-dismiss gesture on mobile
 */
function DailyMacroPopup({ day, onClose }) {
  const popupRef = useRef(null)
  const [openMacroKey, setOpenMacroKey] = useState(null)

  useBodyScrollLock(!!day)

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

  // All-zero macros (a day with no planned meals) is a data-completeness gap,
  // not a nutrition verdict — see macroStatus.hasUsableMacros. Skip opening the
  // popup so an empty day doesn't render a confident "0 g / rejected" badge.
  const dayHasUsableMacros = hasUsableMacros({
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat
  })

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

        {/* Inner scroller: defines the at-top / at-bottom pull-to-dismiss boundaries */}
        <div className="macro-popup-content" ref={setScrollableRef}>
          <div className="macro-total">
            <span className="macro-total-label">Total Calories</span>
            <span className="macro-total-value">{totalCalories}</span>
          </div>

          <div className="macro-grid">
            <button
              type="button"
              className="macro-item macro-item-protein"
              onClick={dayHasUsableMacros ? () => setOpenMacroKey('protein') : undefined}
              disabled={!dayHasUsableMacros}
              aria-haspopup={dayHasUsableMacros ? 'dialog' : undefined}
              aria-expanded={dayHasUsableMacros ? openMacroKey === 'protein' : undefined}
            >
              <div className="macro-item-header">
                <span className="macro-item-label">Protein</span>
              </div>
              <div className="macro-item-values">
                <span className="macro-item-grams">{totalProtein}g</span>
                <span className="macro-item-percent">{proteinPercent}%</span>
              </div>
              <div className="macro-item-calories">{proteinCalories} cal</div>
            </button>

            <button
              type="button"
              className="macro-item macro-item-carbs"
              onClick={dayHasUsableMacros ? () => setOpenMacroKey('carbs') : undefined}
              disabled={!dayHasUsableMacros}
              aria-haspopup={dayHasUsableMacros ? 'dialog' : undefined}
              aria-expanded={dayHasUsableMacros ? openMacroKey === 'carbs' : undefined}
            >
              <div className="macro-item-header">
                <span className="macro-item-label">Carbs</span>
              </div>
              <div className="macro-item-values">
                <span className="macro-item-grams">{totalCarbs}g</span>
                <span className="macro-item-percent">{carbsPercent}%</span>
              </div>
              <div className="macro-item-calories">{carbsCalories} cal</div>
            </button>

            <button
              type="button"
              className="macro-item macro-item-fat"
              onClick={dayHasUsableMacros ? () => setOpenMacroKey('fat') : undefined}
              disabled={!dayHasUsableMacros}
              aria-haspopup={dayHasUsableMacros ? 'dialog' : undefined}
              aria-expanded={dayHasUsableMacros ? openMacroKey === 'fat' : undefined}
            >
              <div className="macro-item-header">
                <span className="macro-item-label">Fat</span>
              </div>
              <div className="macro-item-values">
                <span className="macro-item-grams">{totalFat}g</span>
                <span className="macro-item-percent">{fatPercent}%</span>
              </div>
              <div className="macro-item-calories">{fatCalories} cal</div>
            </button>
          </div>
        </div>

        <p className="macro-popup-hint">Press ESC or tap outside to close</p>
      </div>

      {openMacroKey && (
        <MacroTargetPopup
          macroKey={openMacroKey}
          macros={{ protein: totalProtein, carbs: totalCarbs, fat: totalFat }}
          displayedCaloriesPerServing={totalCalories}
          targets={DAILY_MACRO_TARGETS}
          periodLabel="per day"
          footerNote={MACRO_COPY.DAILY_NOTE}
          onClose={() => setOpenMacroKey(null)}
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

export default DailyMacroPopup
