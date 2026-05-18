import { useState, useEffect, useRef, useCallback } from 'react'
import { formatDateRange, formatDateISO, addDays } from '../../utils/dateUtils'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import PullToDismissUI from '../common/PullToDismissUI'
import './CopyWeekModal.css'

/**
 * CopyWeekModal - Modal for copying the current week's meal plan to another week.
 * Date picker restricted to Mondays only (validated after selection).
 * Warns user that the target week will be overwritten.
 */
function CopyWeekModal({ sourceStartDate, sourceEndDate, onCopy, onClose }) {
  const [targetDate, setTargetDate] = useState('')
  const [copying, setCopying] = useState(false)
  const [error, setError] = useState(null)
  const popupRef = useRef(null)

  const {
    isDragging,
    circlePosition,
    isOverTarget,
    dragDirection,
    handlers: dismissHandlers,
    setScrollableRef,
    targetPosition
  } = usePullToDismiss(onClose)

  const setPopupRef = useCallback((el) => {
    popupRef.current = el
    setScrollableRef(el)
  }, [setScrollableRef])

  // Close on click outside or ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        if (!copying) onClose()
      }
    }
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && !copying) onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [onClose, copying])

  const isMonday = (dateStr) => {
    if (!dateStr) return false
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.getDay() === 1
  }

  const isSameWeek = targetDate === sourceStartDate

  const canCopy = targetDate && isMonday(targetDate) && !isSameWeek && !copying

  const handleCopy = async () => {
    if (!canCopy) return
    setCopying(true)
    setError(null)
    try {
      await onCopy(targetDate)
    } catch (err) {
      setError('Failed to copy week. Please try again.')
      setCopying(false)
    }
  }

  const targetEndDateStr = targetDate && isMonday(targetDate) && !isSameWeek
    ? formatDateISO(addDays(targetDate, 6))
    : null

  return (
    <div className="copy-modal-overlay">
      <div
        ref={setPopupRef}
        className="copy-modal"
        {...dismissHandlers}
      >
        <header className="copy-modal-header">
          <div className="copy-modal-title">
            <h4>Copy Week</h4>
            <span className="copy-modal-subtitle">
              Copying from {formatDateRange(sourceStartDate, sourceEndDate)}
            </span>
          </div>
          <button
            className="copy-modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={copying}
          >
            &times;
          </button>
        </header>

        <div className="copy-modal-content">
          <label className="copy-date-label" htmlFor="copy-target-date">
            Copy to week starting:
          </label>
          <input
            id="copy-target-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="copy-date-input"
            disabled={copying}
          />

          {targetDate && !isMonday(targetDate) && (
            <p className="copy-validation-error">Please select a Monday</p>
          )}
          {isSameWeek && (
            <p className="copy-validation-error">Cannot copy to the same week</p>
          )}
          {targetEndDateStr && (
            <p className="copy-target-range">
              Target: {formatDateRange(targetDate, targetEndDateStr)}
            </p>
          )}

          {canCopy && (
            <p className="copy-overwrite-warning">
              This will replace all meals in the target week.
            </p>
          )}

          {error && <p className="copy-error">{error}</p>}

          <div className="copy-modal-actions">
            <button
              className="copy-cancel-button"
              onClick={onClose}
              disabled={copying}
            >
              Cancel
            </button>
            <button
              className="copy-confirm-button"
              onClick={handleCopy}
              disabled={!canCopy}
            >
              {copying ? 'Copying...' : 'Copy'}
            </button>
          </div>
        </div>

        <p className="copy-modal-hint">Press ESC or tap outside to cancel</p>
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

export default CopyWeekModal
