import { FRIDGE_FOOD, FRIDGE_FOOTNOTE, FRIDGE_SHELF_COUNT, FRIDGE_SLOT_COUNT } from '../../../constants/petRoom'
import { fridgeMeterText, fridgeNote } from '../../../utils/fridgeFill'
import './FridgeView.css'

const SLOTS_PER_SHELF = FRIDGE_SLOT_COUNT / FRIDGE_SHELF_COUNT
const SHELVES = Array.from({ length: FRIDGE_SHELF_COUNT }, (_, shelf) =>
  FRIDGE_FOOD.slice(shelf * SLOTS_PER_SHELF, (shelf + 1) * SLOTS_PER_SHELF))

/**
 * MPP-19 AC 2/3/5: the fridge, full-card inside Pip's room (mockup v5 fridgeHtml):
 * the meter line and note, then 15 food slots on 3 shelves with the first `filledSlots`
 * stocked. Loading and error get their own states; nothing planned is an empty fridge
 * (AC 5), not an error. Focus handling lives in useRoomOverlay.
 */
function FridgeView({ name, fridge, titleId, panelRef, onClose }) {
  return (
    <div ref={panelRef} className="pip-fridge-view" role="dialog" aria-modal="true" tabIndex={-1} aria-labelledby={titleId}>
      <div className="pip-fridge-head">
        <h3 id={titleId}>🧊 {name}&apos;s fridge</h3>
        <button type="button" className="pip-fridge-btn-text" onClick={onClose}>
          Back to room
        </button>
      </div>
      <FridgeBody fridge={fridge} panelRef={panelRef} />
    </div>
  )
}

function FridgeBody({ fridge, panelRef }) {
  if (fridge?.fill) return <Stocked fill={fridge.fill} />
  if (fridge?.error) {
    return (
      <div className="pip-fridge-state" role="alert">
        <p>{fridge.error}</p>
        <button
          type="button"
          className="pip-fridge-btn-text"
          onClick={() => {
            // The button unmounts into the spinner; keep focus inside the dialog.
            panelRef.current?.focus()
            fridge.retry()
          }}
        >
          Try again
        </button>
      </div>
    )
  }
  return (
    <div className="pip-fridge-state" aria-busy="true">
      <div className="loading-spinner" />
    </div>
  )
}

function Stocked({ fill }) {
  return (
    <>
      <p className="pip-fridge-meter">
        <b>{fridgeMeterText(fill)}</b>
        <span>{fridgeNote(fill)}</span>
      </p>
      <div className="pip-fridge-body" role="img" aria-label={`${fill.filledSlots} of ${FRIDGE_SLOT_COUNT} fridge slots stocked`}>
        {SHELVES.map((foods, shelf) => (
          <div key={shelf} className="pip-fridge-shelf">
            {foods.map((food, i) => {
              const stocked = shelf * SLOTS_PER_SHELF + i < fill.filledSlots
              return (
                <span key={food} className={stocked ? 'pip-fridge-food' : 'pip-fridge-food is-gone'}>
                  {stocked ? food : ''}
                </span>
              )
            })}
          </div>
        ))}
      </div>
      <p className="pip-fridge-footnote">{FRIDGE_FOOTNOTE}</p>
    </>
  )
}

export default FridgeView
