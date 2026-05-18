import { useEffect, useMemo, useRef, useState } from 'react'
import './TemplateModals.css'

/**
 * Pick a saved template and apply it to the currently-displayed week
 * (replace-all). See requirement-meal-plan-templates-2026-05-09.md.
 *
 * Props:
 *  - templates: array of { id, name, entryCount, ... }
 *  - currentWeekHasMeals: bool — show overwrite warning when true
 *  - onApply(templateId): Promise<void>
 *  - onClose()
 */
function ApplyTemplateModal({ templates, currentWeekHasMeals, onApply, onClose }) {
  const [selectedId, setSelectedId] = useState('')
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState(null)
  const popupRef = useRef(null)

  const sorted = useMemo(
    () => [...(templates || [])].sort((a, b) => a.name.localeCompare(b.name)),
    [templates]
  )

  useEffect(() => {
    if (sorted.length > 0 && !selectedId) setSelectedId(String(sorted[0].id))
  }, [sorted, selectedId])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        if (!applying) onClose()
      }
    }
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && !applying) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [onClose, applying])

  const canApply = !!selectedId && !applying

  const handleApply = async () => {
    if (!canApply) return
    setApplying(true)
    setError(null)
    try {
      await onApply(Number(selectedId))
    } catch (err) {
      setError('Failed to apply template. Please try again.')
      setApplying(false)
    }
  }

  return (
    <div className="tpl-modal-overlay">
      <div ref={popupRef} className="tpl-modal">
        <header className="tpl-modal-header">
          <div className="tpl-modal-title">
            <h4>Apply template</h4>
            <span className="tpl-modal-subtitle">
              Replace this week with a saved plan
            </span>
          </div>
          <button
            type="button"
            className="tpl-modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={applying}
          >
            &times;
          </button>
        </header>

        <div className="tpl-modal-content">
          {sorted.length === 0 ? (
            <p className="tpl-empty">
              No saved templates yet. Use "Save as template…" to create one.
            </p>
          ) : (
            <>
              <label className="tpl-label" htmlFor="apply-template-select">
                Choose meal plan
              </label>
              <select
                id="apply-template-select"
                className="tpl-input"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={applying}
              >
                {sorted.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.entryCount ?? 0} meals)
                  </option>
                ))}
              </select>

              {currentWeekHasMeals && (
                <p className="tpl-overwrite-warning">
                  This will replace all meals in the target week.
                </p>
              )}
            </>
          )}

          {error && <p className="tpl-error">{error}</p>}

          <div className="tpl-modal-actions">
            <button
              type="button"
              className="tpl-cancel-button"
              onClick={onClose}
              disabled={applying}
            >
              Cancel
            </button>
            <button
              type="button"
              className="tpl-confirm-button"
              onClick={handleApply}
              disabled={!canApply || sorted.length === 0}
            >
              {applying ? 'Applying…' : 'Apply'}
            </button>
          </div>
        </div>

        <p className="tpl-modal-hint">Press ESC or tap outside to cancel</p>
      </div>
    </div>
  )
}

export default ApplyTemplateModal
