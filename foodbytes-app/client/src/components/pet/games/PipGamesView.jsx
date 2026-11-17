import { useState } from 'react'
import { GAMES_CLOSE_LABEL, GAMES_SCREEN, GAMES_TITLE, PIPS_PATH_FAMILY, pipsPathSkin } from '../../../constants/pipsPath'
import useBodyScrollLock from '../../../hooks/useBodyScrollLock'
import usePipsPath from '../../../hooks/usePipsPath'
import GamePicker from './GamePicker'
import PipsPathBoard from './PipsPathBoard'
import PipsPathMap from './PipsPathMap'
import '../room/ShopView.css'
import './PipsPath.css'

/**
 * MPP-49: Pip's games sheet over the room (useRoomOverlay gives focus, Tab trap and Escape-to-close).
 * Screens: picker → map → board. Escape and ← step back one screen; on the picker, Escape and ✕ close
 * the sheet and focus returns to Pip. The skin follows the theme's Pip line (herb.line), never a theme id.
 */
function PipGamesView({ herb, titleId, panelRef, onClose }) {
  useBodyScrollLock(true)
  const games = usePipsPath()
  const [screen, setScreen] = useState(GAMES_SCREEN.PICKER)
  const skin = pipsPathSkin(herb.line)

  const back = () => setScreen(screen === GAMES_SCREEN.BOARD ? GAMES_SCREEN.MAP : GAMES_SCREEN.PICKER)
  const onKeyDown = (event) => {
    if (event.key !== 'Escape' || screen === GAMES_SCREEN.PICKER) return
    event.preventDefault() // useRoomOverlay leaves a prevented Escape alone, so the sheet stays open
    back()
  }
  const play = async (slot) => {
    if (await games.issue(slot)) setScreen(GAMES_SCREEN.BOARD)
  }
  const onPlayLevel = (difficulty) => play({ family: PIPS_PATH_FAMILY, difficulty })
  const onPlayNext = () => play({})
  const onCleared = (path) => games.clear(games.map.mapId, path)

  const wide = screen !== GAMES_SCREEN.PICKER
  const heading = screen === GAMES_SCREEN.PICKER ? GAMES_TITLE : skin.title
  return (
    <section
      ref={panelRef}
      className={wide ? 'pip-shop pp-screen pp-games' : 'pip-shop pp-games'}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      {screen !== GAMES_SCREEN.BOARD && (
        <div className="pip-shop-head">
          {screen === GAMES_SCREEN.PICKER
            ? <button type="button" className="pip-shop-icon-btn" aria-label={GAMES_CLOSE_LABEL} onClick={onClose}>✕</button>
            : <button type="button" className="pip-shop-icon-btn" aria-label="Back to games" onClick={back}>←</button>}
          <h3 id={titleId}>{heading}</h3>
          <span className="pp-head-spacer" />
        </div>
      )}
      {screen === GAMES_SCREEN.BOARD && <h3 id={titleId} className="pip-checkin-sr">{skin.title}</h3>}
      {screen === GAMES_SCREEN.PICKER && (
        <GamePicker state={games.state} loading={games.loading} error={games.error} skin={skin} herb={herb}
          onRetry={games.reload} onOpenGame={() => setScreen(GAMES_SCREEN.MAP)} />
      )}
      {screen === GAMES_SCREEN.MAP && games.state && (
        <PipsPathMap state={games.state} skin={skin} herb={herb} issuing={games.issuing} issueError={games.issueError}
          onPlayLevel={onPlayLevel} onPlayNext={onPlayNext} />
      )}
      {screen === GAMES_SCREEN.BOARD && games.map && (
        <PipsPathBoard key={`${games.map.mapId}-${games.issueCount}`} map={games.map} skin={skin} herb={herb} issuing={games.issuing}
          clear={games} onCleared={onCleared} onRetryClear={onCleared} onNext={onPlayNext} onBack={back} />
      )}
    </section>
  )
}

export default PipGamesView
