import { useEffect, useRef } from 'react'
import { GAME_OFFER_NOT_NOW, GAME_OFFER_PLAY } from '../../../constants/pipsPath'

/** MPP-49: the offer's controls inside Pip's bubble. The player just tapped Pip, so Play a game takes focus. */
function GameOfferActions({ onPlay, onNotNow }) {
  const playRef = useRef(null)
  useEffect(() => { playRef.current?.focus() }, [])
  return (
    <div className="pip-checkin-actions" role="group" aria-label="Play a game with Pip?">
      <button ref={playRef} type="button" className="pip-checkin-btn pip-checkin-btn--primary" aria-haspopup="dialog" onClick={onPlay}>{GAME_OFFER_PLAY}</button>
      <button type="button" className="pip-checkin-btn pip-checkin-btn--link" onClick={onNotNow}>{GAME_OFFER_NOT_NOW}</button>
    </div>
  )
}

export default GameOfferActions
