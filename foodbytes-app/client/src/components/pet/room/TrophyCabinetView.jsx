import { CABINET_FIRSTS_TITLE, CABINET_NOTE, FIRST_EARNED_TEXT, FIRST_TODO_TEXT } from '../../../constants/petAwards'
import { firstsList, orderStreaks } from '../../../utils/petAwards'
import StreakShelf from './StreakShelf'
import './TrophyCabinetView.css'

/**
 * MPP-23 AC 1–4: the trophy cabinet, full-card inside Pip's room (mockup v5 cabinetHtml):
 * three streak shelves, the "ladder starts again" note and the firsts list. Loading and
 * error get their own states; a cabinet with nothing earned is a loaded cabinet (all greyed),
 * not an empty state. Focus handling lives in useRoomOverlay.
 */
function TrophyCabinetView({ name, cabinet, titleId, panelRef, onClose }) {
  return (
    <div ref={panelRef} className="pip-cabinet-view" role="dialog" aria-modal="true" tabIndex={-1} aria-labelledby={titleId}>
      <div className="pip-cabinet-head">
        <h3 id={titleId}>🏆 {name}&apos;s trophy cabinet</h3>
        <button type="button" className="pip-cabinet-btn-text" onClick={onClose}>
          Back to room
        </button>
      </div>
      <CabinetBody cabinet={cabinet} panelRef={panelRef} />
    </div>
  )
}

function CabinetBody({ cabinet, panelRef }) {
  if (cabinet?.data) return <Shelves data={cabinet.data} />
  if (cabinet?.error) {
    return (
      <div className="pip-cabinet-state" role="alert">
        <p>{cabinet.error}</p>
        <button
          type="button"
          className="pip-cabinet-btn-text"
          onClick={() => {
            // The button unmounts into the spinner; keep focus inside the dialog.
            panelRef.current?.focus()
            cabinet.retry()
          }}
        >
          Try again
        </button>
      </div>
    )
  }
  return (
    <div className="pip-cabinet-state" aria-busy="true">
      <div className="loading-spinner" />
    </div>
  )
}

function Shelves({ data }) {
  return (
    <>
      {orderStreaks(data.streaks).map(status => <StreakShelf key={status.streakType} status={status} />)}
      <p className="pip-cabinet-note">{CABINET_NOTE}</p>
      <section className="pip-cabinet-shelf" aria-labelledby="pip-shelf-firsts">
        <h4 id="pip-shelf-firsts">{CABINET_FIRSTS_TITLE}</h4>
        <ul className="pip-cabinet-firsts">
          {firstsList(data.firsts).map(first => (
            <li key={first.key} className={first.earned ? 'pip-cabinet-first is-earned' : 'pip-cabinet-first'}>
              <span>{first.label}</span>
              <span>{first.earned ? FIRST_EARNED_TEXT : FIRST_TODO_TEXT}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default TrophyCabinetView
