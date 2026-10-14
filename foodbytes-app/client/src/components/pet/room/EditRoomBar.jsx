import { useEffect } from 'react'
import { EDIT_ROOM_DONE, EDIT_ROOM_HINT } from '../../../constants/petDecor'

/**
 * MPP-27 AC 3: the bar under the room while editing (mockup .editbar), with the hint, any save
 * error and Done. Escape also finishes, except while an overlay (the picker, the shop) is open,
 * because that overlay owns Escape and this listener is detached until it closes.
 */
function EditRoomBar({ error, overlayOpen, behind, onDone }) {
  useEffect(() => {
    if (overlayOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !event.defaultPrevented) onDone()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [overlayOpen, onDone])

  return (
    <div className="pip-room-editbar" {...behind}>
      <span>{EDIT_ROOM_HINT}</span>
      {error && <span className="pip-room-editbar-error" role="alert">{error}</span>}
      <button type="button" onClick={onDone}>{EDIT_ROOM_DONE}</button>
    </div>
  )
}

export default EditRoomBar
