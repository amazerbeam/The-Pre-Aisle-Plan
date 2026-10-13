import { useRef, useState } from 'react'
import { PET_NAME_MAX_LENGTH } from '../../constants/pet'

const RENAME_ERROR = "Couldn't rename — try again."

/**
 * MPP-14 / MPP-33: rename your own pet. Enter or blur saves,
 * Escape cancels. A blank name resets to the default (the server decides what that is).
 * A failed save reverts to the saved name and shows the server's message.
 */
function PetNameEditor({ name, onRename }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  // Escape unmounts the input; this stops the blur that may follow from saving.
  const skipBlurSave = useRef(false)

  const startEditing = () => {
    skipBlurSave.current = false
    setDraft(name)
    setError(null)
    setEditing(true)
  }

  const cancel = () => {
    skipBlurSave.current = true
    setDraft(name)
    setEditing(false)
  }

  const save = async () => {
    if (saving) return
    skipBlurSave.current = true
    const next = draft.trim()
    if (next === name) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onRename(next === '' ? null : next)
    } catch (err) {
      setDraft(name)
      setError(err.response?.data?.error || RENAME_ERROR)
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      save()
    } else if (event.key === 'Escape') {
      cancel()
    }
  }

  const onBlur = () => {
    if (!skipBlurSave.current) save()
  }

  return (
    <div className="pet-name-block">
      {editing ? (
        <input
          className="pet-name-input"
          value={draft}
          maxLength={PET_NAME_MAX_LENGTH}
          aria-label="Pet name"
          autoFocus
          disabled={saving}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        />
      ) : (
        <h2 className="pet-name">
          {name}
          <button
            type="button"
            className="pet-name-edit-btn"
            onClick={startEditing}
            aria-label={`Rename ${name}`}
          >
            <span aria-hidden="true">✎</span>
          </button>
        </h2>
      )}
      {error && <p className="pet-name-error" role="alert">{error}</p>}
    </div>
  )
}

export default PetNameEditor
