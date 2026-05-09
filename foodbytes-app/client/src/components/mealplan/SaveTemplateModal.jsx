import { useEffect, useRef, useState } from 'react'
import './TemplateModals.css'

/**
 * Save current week as a named template.
 * See requirement-meal-plan-templates-2026-05-09.md.
 */
function SaveTemplateModal({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const popupRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        if (!saving) onClose()
      }
    }
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [onClose, saving])

  const trimmed = name.trim()
  const canSave = trimmed.length > 0 && trimmed.length <= 60 && !saving

  const handleSave = async (e) => {
    e?.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      await onSave(trimmed)
    } catch (err) {
      const status = err?.response?.status
      if (status === 409) {
        setError('A template with that name already exists.')
      } else {
        setError('Failed to save template. Please try again.')
      }
      setSaving(false)
    }
  }

  return (
    <div className="tpl-modal-overlay">
      <form ref={popupRef} className="tpl-modal" onSubmit={handleSave}>
        <header className="tpl-modal-header">
          <div className="tpl-modal-title">
            <h4>Save as template</h4>
            <span className="tpl-modal-subtitle">Snapshot this week's meals</span>
          </div>
          <button
            type="button"
            className="tpl-modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={saving}
          >
            &times;
          </button>
        </header>

        <div className="tpl-modal-content">
          <label className="tpl-label" htmlFor="save-template-name">
            Name
          </label>
          <input
            ref={inputRef}
            id="save-template-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="e.g. High Protein Diet"
            className="tpl-input"
            disabled={saving}
          />
          {error && <p className="tpl-error">{error}</p>}

          <div className="tpl-modal-actions">
            <button
              type="button"
              className="tpl-cancel-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tpl-confirm-button"
              disabled={!canSave}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        <p className="tpl-modal-hint">Press ESC or tap outside to cancel</p>
      </form>
    </div>
  )
}

export default SaveTemplateModal
