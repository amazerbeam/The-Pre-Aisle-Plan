import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PET_MOODS } from '../../../constants/pet'
import { ENDLESS_CARD, GAME_MODE, MAP_NODE, PIPS_PATH_FAMILY, PIPS_PATH_LEVELS, REFRESHER_CARD } from '../../../constants/pipsPath'
import { mapNodeStatus } from '../../../utils/pipsPath'
import Pip from '../pip/Pip'
import { skinArt } from './pipsPathArt'

const LEVELS = Array.from({ length: PIPS_PATH_LEVELS }, (_, n) => n + 1)

/** MPP-49: the chapter map — levels 1–10 (cleared / current / locked) joined by a dotted path, then the endless or refresher card. */
function PipsPathMap({ state, skin, herb, issuing, issueError, onPlayLevel, onPlayNext }) {
  const pathRef = useRef(null)
  const [points, setPoints] = useState('')
  const [resizes, setResizes] = useState(0)
  const family = state.families.find(f => f.id === PIPS_PATH_FAMILY)
  const highest = family?.highestCleared ?? 0
  const art = skinArt(herb.line)
  const card = state.endless ? ENDLESS_CARD : state.next?.mode === GAME_MODE.REFRESHER ? REFRESHER_CARD : null

  useEffect(() => {
    const observer = new ResizeObserver(() => setResizes(n => n + 1))
    observer.observe(pathRef.current)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const box = pathRef.current.getBoundingClientRect()
    setPoints([...pathRef.current.querySelectorAll('.pp-map-node')].map(node => {
      const r = node.getBoundingClientRect()
      return `${(r.left + r.width / 2 - box.left).toFixed(1)},${(r.top + r.height / 2 - box.top).toFixed(1)}`
    }).join(' '))
  }, [resizes, highest])

  return (
    <div className="pip-shop-body">
      <p className="pp-screen-sub">{skin.goal}</p>
      {issueError && <p className="pp-error" role="alert">{issueError}</p>}
      <div ref={pathRef} className="pp-map-path" style={{ '--n': PIPS_PATH_LEVELS }}>
        {LEVELS.map(d => (
          <div key={d} className="pp-map-cell">
            <MapNode d={d} status={mapNodeStatus(d, highest)} art={art} herb={herb} disabled={issuing} onPlay={onPlayLevel} />
          </div>
        ))}
        <svg className="pp-link" aria-hidden="true"><polyline points={points} /></svg>
      </div>
      {card && (
        <button type="button" className="pp-endless-card" disabled={issuing} onClick={onPlayNext}>
          <span className="pp-endless-icon" aria-hidden="true">🎲</span>
          <span><strong>{card.title}</strong><small>{card.sub}</small></span>
        </button>
      )}
    </div>
  )
}

function MapNode({ d, status, art, herb, disabled, onPlay }) {
  const label = `Puzzle ${d}, ${status}`
  if (status === MAP_NODE.LOCKED) {
    return <button type="button" className="pp-map-node is-locked" disabled aria-label={label}><span aria-hidden="true">🔒</span></button>
  }
  const current = status === MAP_NODE.CURRENT
  return (
    <button type="button" className={`pp-map-node is-${status}`} aria-label={label} disabled={disabled} onClick={() => onPlay(d)}>
      <span className="pp-node-n">{d}</span>
      {current
        ? <span className="pp-node-pip" aria-hidden="true"><Pip line={herb.line} form={herb.form} outfit={herb.outfit} mood={PET_MOODS.CONTENT} variant="mini" /></span>
        : <><span className="pp-node-check" aria-hidden="true">✓</span><span className="pp-node-mark" aria-hidden="true"><art.Mark /></span></>}
    </button>
  )
}

export default PipsPathMap
