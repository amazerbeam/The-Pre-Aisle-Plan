import { useEffect } from 'react'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import PullToDismissUI from '../common/PullToDismissUI'
import './MealPlanSheet.css'

/**
 * Bottom sheet (centred card on desktop via CSS) for the meal actions: Move, Servings, ...
 * Pull-to-dismiss, Escape and a backdrop tap all close it.
 */
function MealPlanSheet({ title, onClose, children }) {
  useBodyScrollLock(true)

  const {
    isDragging, circlePosition, isOverTarget, dragDirection,
    handlers: dismissHandlers, setScrollableRef, setGestureRef, targetPosition
  } = usePullToDismiss(onClose)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="meal-sheet-overlay">
      {/* Native <button> so iOS always synthesises the click (ghost-click lesson from MealPlanMenu). */}
      <button
        type="button"
        className="meal-sheet-backdrop"
        onClick={onClose}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div
        ref={setGestureRef}
        className="meal-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        {...dismissHandlers}
      >
        <div className="meal-sheet-grab" aria-hidden="true" />
        <div className="meal-sheet-head">
          <h4 className="meal-sheet-title">{title}</h4>
          <button type="button" className="meal-sheet-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="meal-sheet-content" ref={setScrollableRef}>{children}</div>
      </div>
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

export default MealPlanSheet
