import {
  DECOR_ALL_OWNED, DECOR_BUY_MORE, DECOR_EMPTY_LABEL, DECOR_ITEMS, DECOR_PICKER_CLOSE, DECOR_SPOT_LABELS
} from '../../../constants/petDecor'
import { catalogueFor, ownedFor } from '../../../utils/roomPlacements'
import DecorThumb from './DecorThumb'
import './DecorPicker.css'

/**
 * MPP-27 AC 3: the per-spot picker, a short sheet over the bottom of the room card (mockup .picker).
 * It offers Empty plus every owned item for the spot, with the current one pressed. Picking is free
 * and the sheet stays open so the person can compare. Focus, Escape and the Tab trap come from
 * useRoomOverlay (✕ takes focus). With nothing owned yet, it offers Empty and "Buy more"
 * (onBuyMore is null when the shop isn't available).
 */
function DecorPicker({ spot, room, error, titleId, panelRef, onPick, onBuyMore, onClose }) {
  const current = room.placements?.[spot] ?? null
  const owned = ownedFor(room.decor, spot)
  const allOwned = owned.length >= catalogueFor(room.decor, spot).length

  return (
    <div ref={panelRef} className="pip-decor-picker" role="dialog" aria-modal="true" tabIndex={-1} aria-labelledby={titleId}>
      <div className="pip-decor-picker-head">
        <h4 id={titleId}>{DECOR_SPOT_LABELS[spot]}</h4>
        <button type="button" className="pip-decor-picker-close" aria-label={DECOR_PICKER_CLOSE} onClick={onClose}>✕</button>
      </div>
      {error && <p className="pip-decor-picker-error" role="alert">{error}</p>}
      <div className="pip-decor-options">
        <button type="button" className="pip-decor-option" aria-pressed={current == null} onClick={() => onPick(spot, null)}>
          <span className="pip-decor-option-none" aria-hidden="true">∅</span>
          {DECOR_EMPTY_LABEL}
        </button>
        {owned.map(({ id }) => (
          <button key={id} type="button" className="pip-decor-option" aria-pressed={current === id} onClick={() => onPick(spot, id)}>
            <DecorThumb id={id} />
            {DECOR_ITEMS[id].label}
          </button>
        ))}
      </div>
      <p className="pip-decor-picker-more">
        {allOwned ? DECOR_ALL_OWNED : onBuyMore && <button type="button" onClick={onBuyMore}>{DECOR_BUY_MORE}</button>}
      </p>
    </div>
  )
}

export default DecorPicker
