import { useEffect, useRef } from 'react'
import useBodyScrollLock from '../../hooks/useBodyScrollLock'
import { InfoIcon } from '../common/ExtrasIcons'
import { DAY_NAMES, SAVE_STATUS } from '../../constants/extraChoices'
import ManageExtrasMeal from './ManageExtrasMeal'
import './TemplateModals.css'
import './ManageExtrasModal.css'

const formatDayDate = (planDate) =>
  new Date(`${planDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

/**
 * MPP-10: shared Manage extras popup for a week or a template. The adapters
 * (WeekExtrasModal / TemplateExtrasModal) own the copy; `extras` is the useManageExtras result.
 */
function ManageExtrasModal({
  title, subtitle, scopeNote, savedTo, emptyTitle, emptyBody, showDates,
  extras, onBack, onClose, children
}) {
  const popupRef = useRef(null)
  const { view, loading, loadError, saveStatus, counts } = extras
  useBodyScrollLock(true)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose()
    }
    const handleEscKey = (e) => {
      if (e.key === 'Escape') onClose()
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

  const hasMeals = !loading && !loadError && view && view.meals.length > 0
  const isEmpty = !loading && !loadError && view && view.meals.length === 0

  return (
    <div className="tpl-modal-overlay mx-overlay">
      <div ref={popupRef} className="tpl-modal tpl-modal-wide mx-modal"
        role="dialog" aria-modal="true" aria-labelledby="mx-title">
        <header className="tpl-modal-header">
          {onBack && (
            <button type="button" className="tpl-modal-close mx-back" onClick={onBack} aria-label="Back to templates">
              &lsaquo;
            </button>
          )}
          <div className="tpl-modal-title mx-title-block">
            <h4 id="mx-title">{title}</h4>
            <span className="tpl-modal-subtitle">{subtitle}</span>
          </div>
          <button type="button" className="tpl-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </header>

        <div className="tpl-modal-content">
          {loading && <p className="mx-loading">Loading extras…</p>}

          {!loading && loadError && (
            <>
              <p className="tpl-error">{loadError}</p>
              <button type="button" className="tpl-action-button" onClick={extras.reload}>Try again</button>
            </>
          )}

          {isEmpty && (
            <div className="mx-empty">
              <strong>{emptyTitle}</strong>
              <p>{emptyBody}</p>
            </div>
          )}

          {hasMeals && (
            <>
              <div className="mx-toolbar">
                <div className="mx-summary">
                  <strong>{counts.meals} meal{counts.meals === 1 ? '' : 's'}</strong> · {counts.extras} extras ·{' '}
                  <span className="mx-summary-sb">{counts.storeBought} store-bought</span>
                </div>
                <div className="mx-bulk">
                  <button type="button" onClick={() => extras.setAll(true)}>All homemade</button>
                  <button type="button" onClick={() => extras.setAll(false)}>All store-bought</button>
                </div>
              </div>
              <div className="mx-scope"><InfoIcon /><span>{scopeNote}</span></div>

              {view.meals.map((meal, i) => (
                <div key={meal.targetId}>
                  {(i === 0 || view.meals[i - 1].dayOffset !== meal.dayOffset) && (
                    <div className="mx-day">
                      {DAY_NAMES[meal.dayOffset]}
                      {showDates && meal.planDate && <span className="mx-day-date">{formatDayDate(meal.planDate)}</span>}
                    </div>
                  )}
                  <ManageExtrasMeal meal={meal} onToggle={extras.toggle} />
                </div>
              ))}

              <div
                className={`mx-status ${saveStatus === SAVE_STATUS.SAVED ? 'saved' : ''} ${saveStatus === SAVE_STATUS.ERROR ? 'error' : ''}`}
                aria-live="polite"
              >
                {saveStatus === SAVE_STATUS.SAVING && 'Saving…'}
                {saveStatus === SAVE_STATUS.SAVED && `✓ Saved to ${savedTo}`}
                {saveStatus === SAVE_STATUS.ERROR && "Couldn't save. Your last change was undone. Try again."}
              </div>
            </>
          )}

          {children}

          <div className="tpl-modal-actions">
            <button type="button" className="tpl-cancel-button" onClick={onClose}>Done</button>
          </div>
        </div>

        <p className="tpl-modal-hint">Press ESC or tap outside to close</p>
      </div>
    </div>
  )
}

export default ManageExtrasModal
