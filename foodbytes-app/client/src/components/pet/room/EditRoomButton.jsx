import { EDIT_ROOM_LABEL } from '../../../constants/petDecor'
import './CheckInActions.css'

/** MPP-27 AC 3: the ✏️ Edit room pill in the strip, between 🛍 Shop and 👕 Wardrobe; pressed while editing. */
function EditRoomButton({ editing, buttonRef, onToggle }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={editing ? 'pip-checkin-btn pip-room-action is-on' : 'pip-checkin-btn pip-room-action'}
      aria-pressed={editing}
      onClick={onToggle}
    >
      <span aria-hidden="true">✏️</span> {EDIT_ROOM_LABEL}
    </button>
  )
}

export default EditRoomButton
