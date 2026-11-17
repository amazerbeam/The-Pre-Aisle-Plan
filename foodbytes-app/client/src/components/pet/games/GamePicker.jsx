import { PET_MOODS } from '../../../constants/pet'
import {
  GAMES_LOADING, GAMES_RETRY, MINI_GRID_CELLS, MINI_MARK_CELLS, MORE_GAMES_SUB, MORE_GAMES_TITLE, PIPS_PATH_ENDLESS_SUB,
  PIPS_PATH_FAMILY, PIPS_PATH_LEVELS, PIPS_PATH_NAME
} from '../../../constants/pipsPath'
import Pip from '../pip/Pip'
import { skinArt } from './pipsPathArt'

/** MPP-49: the games list — Pip's Path (skin title, x / 10 or endless, progress bar) and a disabled "More games soon". */
function GamePicker({ state, loading, error, skin, herb, onRetry, onOpenGame }) {
  if (loading && !state) return <div className="pip-shop-body"><p className="pp-status" aria-busy="true">{GAMES_LOADING}</p></div>
  if (error && !state) {
    return (
      <div className="pip-shop-body">
        <p className="pp-error" role="alert">{error}<button type="button" className="pip-checkin-btn" onClick={onRetry}>{GAMES_RETRY}</button></p>
      </div>
    )
  }
  const cleared = state.families.find(f => f.id === PIPS_PATH_FAMILY)?.highestCleared ?? 0
  const sub = state.endless ? PIPS_PATH_ENDLESS_SUB : `${skin.title} · ${cleared} / ${PIPS_PATH_LEVELS}`
  return (
    <div className="pip-shop-body">
      <button type="button" className="pp-game-card" onClick={onOpenGame}>
        <span className="pp-game-art"><MiniBoard herb={herb} /></span>
        <span>
          <span className="pp-game-title">{PIPS_PATH_NAME}</span>
          <span className="pp-game-sub">{sub}</span>
          <span className="pp-bar" role="progressbar" aria-label="Puzzles cleared" aria-valuemin="0" aria-valuemax={PIPS_PATH_LEVELS} aria-valuenow={cleared}>
            <i style={{ width: `${cleared * 100 / PIPS_PATH_LEVELS}%` }} />
          </span>
        </span>
      </button>
      <button type="button" className="pp-game-card" disabled>
        <span className="pp-game-art pp-game-art--soon" aria-hidden="true">🎲</span>
        <span><span className="pp-game-title">{MORE_GAMES_TITLE}</span><span className="pp-game-sub">{MORE_GAMES_SUB}</span></span>
      </button>
    </div>
  )
}

function MiniBoard({ herb }) {
  const art = skinArt(herb.line)
  return (
    <span className="pp-mini-board">
      {Array.from({ length: MINI_GRID_CELLS }, (_, i) => (
        <span key={i} className="pp-mini-cell">
          <art.Tile />
          {i === 0 && <span className="pp-mini-over"><art.Start /></span>}
          {MINI_MARK_CELLS.includes(i) && <span className="pp-mini-over"><art.Mark /></span>}
        </span>
      ))}
      <span className="pp-mini-pip"><Pip line={herb.line} form={herb.form} outfit={herb.outfit} mood={PET_MOODS.HAPPY} variant="mini" /></span>
    </span>
  )
}

export default GamePicker
