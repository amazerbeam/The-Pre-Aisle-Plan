import { SPRINKLES_ICON } from '../../../constants/petRoom'
import { DECOR_BUSY_LABEL, DECOR_OWNED_LABEL } from '../../../constants/petDecor'

/**
 * MPP-27 AC 1: one decor item or style in the shop grid — art, name and the buy button
 * (✨ price → Confirm → Buying…, or short / owned). Swapping the label in place keeps the same
 * <button>, so focus stays on it between the two taps.
 */
function ShopItemCard({ id, label, price, owned, art, sprinkles, armed, busy, onArm, onConfirm }) {
  return (
    <li className="pip-shop-item">
      <div className="pip-shop-item-art">{art}</div>
      <p className="pip-shop-item-name">{label}</p>
      <BuyAction id={id} label={label} price={price} owned={owned} sprinkles={sprinkles} armed={armed} busy={busy} onArm={onArm} onConfirm={onConfirm} />
    </li>
  )
}

function BuyAction({ id, label, price, owned, sprinkles, armed, busy, onArm, onConfirm }) {
  if (owned) return <span className="pip-shop-owned">{DECOR_OWNED_LABEL}</span>
  if (busy === id) {
    return <button type="button" className="pip-shop-btn" disabled aria-busy="true">{DECOR_BUSY_LABEL}</button>
  }
  if (sprinkles < price) {
    return (
      <>
        <button type="button" className="pip-shop-btn" disabled>{SPRINKLES_ICON} {price}</button>
        <span className="pip-shop-short">Need {SPRINKLES_ICON} {price - sprinkles} more</span>
      </>
    )
  }
  const confirming = armed === id
  return (
    <button
      type="button"
      className={confirming ? 'pip-shop-btn is-confirm' : 'pip-shop-btn'}
      disabled={busy != null}
      aria-label={`${confirming ? 'Confirm: buy' : 'Buy'} ${label} for ${price} sprinkles`}
      onClick={() => (confirming ? onConfirm(id) : onArm(id))}
    >
      {confirming ? `Confirm ${SPRINKLES_ICON} ${price}` : `${SPRINKLES_ICON} ${price}`}
    </button>
  )
}

export default ShopItemCard
