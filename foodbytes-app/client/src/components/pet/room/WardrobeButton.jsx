import { WARDROBE_BUTTON_LABEL, WARDROBE_BUTTON_NEW_LABEL } from '../../../constants/pipWardrobe'
import './CheckInActions.css'

/**
 * MPP-32 AC 4: the 👕 Wardrobe pill in the strip under the room (the .pip-checkin-btn look), with
 * a red "!" while something unlocked is unseen. PetRoom owns the strip, so
 * MPP-26's Shop pill sits beside it.
 */
function WardrobeButton({ hasNew, buttonRef, onOpen }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className="pip-checkin-btn pip-room-action"
      aria-haspopup="dialog"
      aria-label={hasNew ? WARDROBE_BUTTON_NEW_LABEL : WARDROBE_BUTTON_LABEL}
      onClick={onOpen}
    >
      <span aria-hidden="true">👕</span> {WARDROBE_BUTTON_LABEL}
      {hasNew && <span className="pip-room-action-badge" aria-hidden="true">!</span>}
    </button>
  )
}

export default WardrobeButton
