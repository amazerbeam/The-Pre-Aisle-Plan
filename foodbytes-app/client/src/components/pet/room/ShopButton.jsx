import { SHOP_BUTTON_LABEL } from '../../../constants/petShop'
import './CheckInActions.css'

/** MPP-26: the 🛍 Shop pill in the strip under the room, beside 👕 Wardrobe (the .pip-checkin-btn look). */
function ShopButton({ buttonRef, onOpen }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className="pip-checkin-btn pip-room-action"
      aria-haspopup="dialog"
      onClick={onOpen}
    >
      <span aria-hidden="true">🛍</span> {SHOP_BUTTON_LABEL}
    </button>
  )
}

export default ShopButton
