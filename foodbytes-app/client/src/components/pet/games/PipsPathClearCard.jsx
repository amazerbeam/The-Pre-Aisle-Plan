import { BACK_TO_MAP, GAMES_RETRY, GAMES_SAVING, NEXT_PUZZLE, rewardLine } from '../../../constants/pipsPath'

/** MPP-49: under a cleared board — saving, then the server's reward line (or its error with Try again), Next puzzle and Map. */
function PipsPathClearCard({ clearing, result, error, issuing, onRetry, onNext, onMap }) {
  return (
    <div className="pp-clear-card" aria-live="polite">
      {clearing && <p className="pp-reward">{GAMES_SAVING}</p>}
      {!clearing && result && <p className="pp-reward">{rewardLine(result)}</p>}
      {!clearing && error && (
        <p className="pp-error" role="alert">
          {error}
          <button type="button" className="pip-checkin-btn" onClick={onRetry}>{GAMES_RETRY}</button>
        </p>
      )}
      <div className="pp-clear-actions">
        <button type="button" className="pip-checkin-btn pip-checkin-btn--primary" disabled={clearing || issuing || !result} onClick={onNext}>{NEXT_PUZZLE}</button>
        <button type="button" className="pip-checkin-btn" onClick={onMap}>{BACK_TO_MAP}</button>
      </div>
    </div>
  )
}

export default PipsPathClearCard
