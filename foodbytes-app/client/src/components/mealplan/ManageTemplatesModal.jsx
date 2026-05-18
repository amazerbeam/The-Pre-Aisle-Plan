import { useEffect, useRef, useState } from 'react'
import './TemplateModals.css'

/**
 * Manage saved meal-plan templates: rename, re-snapshot from current week, delete.
 * See requirement-meal-plan-templates-2026-05-09.md.
 *
 * Props:
 *  - templates: array of { id, name, entryCount, updatedAt }
 *  - onRename(id, newName): Promise
 *  - onUpdateSnapshot(id): Promise — re-snapshots from currently-displayed week
 *  - onDelete(id): Promise
 *  - onClose()
 */
function ManageTemplatesModal({ templates, onRename, onUpdateSnapshot, onDelete, onClose }) {
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)
  const popupRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        if (!busyId) onClose()
      }
    }
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && !busyId) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [onClose, busyId])

  const beginEdit = (t) => {
    setEditingId(t.id)
    setEditName(t.name)
    setError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setError(null)
  }

  const submitRename = async (id) => {
    const trimmed = editName.trim()
    if (!trimmed) return
    setBusyId(id)
    setError(null)
    try {
      await onRename(id, trimmed)
      cancelEdit()
    } catch (err) {
      const status = err?.response?.status
      setError(status === 409 ? 'Name already taken.' : 'Failed to rename.')
    } finally {
      setBusyId(null)
    }
  }

  const handleUpdate = async (id) => {
    if (!confirm('Replace this template\'s contents with the meals from the currently-displayed week?')) return
    setBusyId(id)
    setError(null)
    try {
      await onUpdateSnapshot(id)
    } catch (err) {
      setError('Failed to update snapshot.')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete saved template "${name}"? This cannot be undone.`)) return
    setBusyId(id)
    setError(null)
    try {
      await onDelete(id)
    } catch (err) {
      setError('Failed to delete.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="tpl-modal-overlay">
      <div ref={popupRef} className="tpl-modal tpl-modal-wide">
        <header className="tpl-modal-header">
          <div className="tpl-modal-title">
            <h4>Manage templates</h4>
            <span className="tpl-modal-subtitle">Rename, refresh, or delete saved plans</span>
          </div>
          <button
            type="button"
            className="tpl-modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={!!busyId}
          >
            &times;
          </button>
        </header>

        <div className="tpl-modal-content">
          {(!templates || templates.length === 0) ? (
            <p className="tpl-empty">No saved templates yet.</p>
          ) : (
            <ul className="tpl-list">
              {templates.map((t) => {
                const isEditing = editingId === t.id
                const isBusy = busyId === t.id
                return (
                  <li key={t.id} className="tpl-list-item">
                    {isEditing ? (
                      <div className="tpl-list-edit">
                        <input
                          type="text"
                          className="tpl-input"
                          value={editName}
                          maxLength={60}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={isBusy}
                          autoFocus
                        />
                        <div className="tpl-list-actions">
                          <button
                            type="button"
                            className="tpl-cancel-button tpl-small"
                            onClick={cancelEdit}
                            disabled={isBusy}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="tpl-confirm-button tpl-small"
                            onClick={() => submitRename(t.id)}
                            disabled={isBusy || !editName.trim()}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="tpl-list-info">
                          <div className="tpl-list-name">{t.name}</div>
                          <div className="tpl-list-meta">{t.entryCount ?? 0} meals</div>
                        </div>
                        <div className="tpl-list-actions">
                          <button
                            type="button"
                            className="tpl-action-button"
                            onClick={() => beginEdit(t)}
                            disabled={isBusy}
                            title="Rename"
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            className="tpl-action-button"
                            onClick={() => handleUpdate(t.id)}
                            disabled={isBusy}
                            title="Replace contents with the currently-displayed week"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="tpl-action-button tpl-action-danger"
                            onClick={() => handleDelete(t.id, t.name)}
                            disabled={isBusy}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {error && <p className="tpl-error">{error}</p>}

          <div className="tpl-modal-actions">
            <button
              type="button"
              className="tpl-cancel-button"
              onClick={onClose}
              disabled={!!busyId}
            >
              Done
            </button>
          </div>
        </div>

        <p className="tpl-modal-hint">Press ESC or tap outside to close</p>
      </div>
    </div>
  )
}

export default ManageTemplatesModal
