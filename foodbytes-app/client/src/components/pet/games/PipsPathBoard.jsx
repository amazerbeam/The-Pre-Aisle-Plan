import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PET_MOODS } from '../../../constants/pet'
import {
  BACK_TO_MAP, CELEBRATION_MS, FX_BIT_COUNT, FX_STAGGER_MS, FX_STAGGER_STEPS, GAMES_BAD_MAP, MODE_LABEL, PIPS_PATH_LEVELS,
  PIP_BOX_RATIO, PIP_FOOT_RATIO, TOKEN_FOOT_DROP, TOKEN_SCALE
} from '../../../constants/pipsPath'
import { useTheme } from '../../../contexts/ThemeContext'
import usePipsPathInput from '../../../hooks/usePipsPathInput'
import usePipsPathRun from '../../../hooks/usePipsPathRun'
import { bubbleKeyFor, canStep, head, parseRows } from '../../../utils/pipsPath'
import { prefersReducedMotion } from '../../../utils/reducedMotion'
import Pip from '../pip/Pip'
import PipsPathClearCard from './PipsPathClearCard'
import { skinArt } from './pipsPathArt'

/**
 * MPP-49: one Pip's Path board (keyed by mapId, so a new map is a fresh attempt). Three layers as in the
 * mockup: tile buttons with the skin's art, an SVG trail through the tile centres, and Pip as a token
 * moved by a transform transition. A clear freezes the board and posts the path once (onCleared);
 * Restart un-freezes it, and a second clear posts again (the server answers "already counted").
 */
function PipsPathBoard(props) {
  const [grid] = useState(() => {
    try { return parseRows(props.map) } catch { return null }
  })
  if (!grid) {
    return (
      <div className="pip-shop-body pp-board-area">
        <p className="pp-error" role="alert">{GAMES_BAD_MAP}</p>
        <button type="button" className="pip-checkin-btn" onClick={props.onBack}>{`← ${BACK_TO_MAP}`}</button>
      </div>
    )
  }
  return <BoardPlay grid={grid} {...props} />
}

function BoardPlay({ grid, map, skin, herb, clear, onCleared, onRetryClear, onNext, onBack, issuing }) {
  const { lowFx } = useTheme()
  const { run, facing, cleared, stuck, tryTile, onKey, restartRun } = usePipsPathRun(grid)
  const boardRef = useRef(null)
  const tileRefs = useRef([])
  const focusHeadRef = useRef(false)
  const postedRef = useRef(false)
  const [geo, setGeo] = useState(null)
  const [resizes, setResizes] = useState(0)
  const [bits, setBits] = useState(false)
  const input = usePipsPathInput({ boardRef, tryTile, onKey })
  const art = skinArt(herb.line)
  const still = lowFx || prefersReducedMotion()

  useEffect(() => {
    const observer = new ResizeObserver(() => setResizes(n => n + 1))
    observer.observe(boardRef.current)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    setGeo(measure(boardRef.current, tileRefs.current, run.path, geo === null || resizes !== geo.resizes, resizes))
    if (focusHeadRef.current) {
      focusHeadRef.current = false
      tileRefs.current[head(run)]?.focus({ preventScroll: true })
    }
  }, [run, resizes]) // eslint-disable-line react-hooks/exhaustive-deps -- geo is the previous measure

  useEffect(() => {
    if (cleared && !postedRef.current) {
      postedRef.current = true
      onCleared(run.path)
    } else if (!cleared) {
      postedRef.current = false
    }
  }, [cleared]) // eslint-disable-line react-hooks/exhaustive-deps -- post once per clear

  useEffect(() => {
    if (!cleared || still || !skin.fxColor) return undefined
    setBits(true)
    const timer = setTimeout(() => setBits(false), CELEBRATION_MS)
    return () => { clearTimeout(timer); setBits(false) }
  }, [cleared, still, skin.fxColor])

  const onKeyDown = (event) => { if (input.onKeyDown(event)) focusHeadRef.current = true }
  const order = new Map(run.path.map((cell, k) => [cell, k]))
  const hd = head(run)
  const fx = cleared ? skin.celebrate : stuck ? skin.stuckFx : ''
  const mood = cleared ? PET_MOODS.HAPPY : stuck ? PET_MOODS.BORED : PET_MOODS.CONTENT
  const modeLabel = MODE_LABEL[map.mode]
  const title = modeLabel ?? `${skin.title} · ${map.difficulty} / ${PIPS_PATH_LEVELS}`

  return (
    <>
      <div className="pp-hud">
        <div className="pp-hud-row">
          <button type="button" className="pip-shop-icon-btn" aria-label="Back to the map" onClick={onBack}>←</button>
          <h3 className="pp-hud-title">{title}</h3>
          {modeLabel && <span className="pp-chip">{modeLabel}</span>}
        </div>
        <div className="pp-hud-row">
          <p className="pp-hud-count" aria-live="polite">{`${grid.total - run.path.length} tiles left`}</p>
          <button type="button" className={stuck ? 'pip-checkin-btn pp-pulse' : 'pip-checkin-btn'} onClick={restartRun}>⟲ Restart</button>
        </div>
      </div>
      <div className="pip-shop-body pp-board-area">
        <div className="pet-bubble pp-board-bubble"><p className="pet-bubble-text" aria-live="polite">{skin.lines[bubbleKeyFor(grid, run)]}</p></div>
        <div className="pp-board-wrap" style={{ '--cols': grid.W }}>
          <div
            ref={boardRef}
            className={`pp-board${cleared ? ' is-cleared' : ''}${stuck ? ' is-stuck' : ''}${fx ? ` pp-fx--${fx}` : ''}`}
            role="group"
            aria-label={`Puzzle board, ${grid.W} by ${grid.H}`}
            onPointerDown={input.onPointerDown}
            onClick={input.onClick}
            onKeyDown={onKeyDown}
          >
            <art.Board className="pp-board-art" />
            {grid.open.map((isOpen, i) => (isOpen
              ? <Tile key={i} i={i} grid={grid} run={run} k={order.get(i)} isHead={i === hd} art={art} tileRefs={tileRefs} />
              : <div key={i} className="pp-tile pp-tile--rock" aria-hidden="true" />))}
            <svg className={`pp-trail pp-trail--${skin.trail}`} aria-hidden="true" viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}>
              <polyline className="pp-trail-line" points={geo && run.path.length > 1 ? geo.points : ''} />
            </svg>
            <div className={geo?.snap ? 'pp-pip-token is-snap' : 'pp-pip-token'} style={geo ? tokenStyle(geo, facing) : { visibility: 'hidden' }} aria-hidden="true">
              <div className="pp-pip-hop"><Pip line={herb.line} form={herb.form} outfit={herb.outfit} mood={mood} variant="full" /></div>
            </div>
            <div className="pp-fx-layer" aria-hidden="true">
              {bits && Array.from({ length: FX_BIT_COUNT }, (_, n) => (
                <i key={n} className="pp-fx-bit" style={{ '--x': Math.round((n + 0.5) * 100 / FX_BIT_COUNT), '--d': `${(n % FX_STAGGER_STEPS) * FX_STAGGER_MS}ms`, '--fx-color': skin.fxColor }} />
              ))}
            </div>
          </div>
        </div>
        {cleared && (
          <PipsPathClearCard
            clearing={clear.clearing} result={clear.clearResult} error={clear.clearError} issuing={issuing}
            onRetry={() => onRetryClear(run.path)} onNext={onNext} onMap={onBack}
          />
        )}
      </div>
    </>
  )
}

function Tile({ i, grid, run, k, isHead, art, tileRefs }) {
  const onPath = k !== undefined
  const isStart = i === grid.start
  const label = `Row ${Math.floor(i / grid.W) + 1}, column ${(i % grid.W) + 1}, ${isHead ? 'Pip is here' : onPath ? 'visited' : 'open'}`
  const cls = ['pp-tile', isStart && 'is-start', onPath && 'is-on', onPath && !isHead && !isStart && 'is-marked', canStep(grid, run, i) && 'is-next']
    .filter(Boolean).join(' ')
  return (
    <button ref={el => { tileRefs.current[i] = el }} type="button" className={cls} data-i={i} aria-label={label} style={{ '--n': onPath ? k : 0 }}>
      <span className="pp-tile-art"><art.Tile /></span>
      {isStart ? <span className="pp-tile-start"><art.Start /></span> : <span className="pp-tile-mark"><art.Mark /></span>}
    </button>
  )
}

/** Trail points and the head tile's box, measured from the laid-out tiles (px inside the board). */
function measure(board, tiles, path, snap, resizes) {
  const centre = (i) => [tiles[i].offsetLeft + tiles[i].offsetWidth / 2, tiles[i].offsetTop + tiles[i].offsetHeight / 2]
  const headTile = tiles[path[path.length - 1]]
  return {
    w: board.clientWidth,
    h: board.clientHeight,
    points: path.map(i => centre(i).map(n => n.toFixed(1)).join(',')).join(' '),
    head: centre(path[path.length - 1]),
    size: headTile.offsetWidth,
    snap,
    resizes
  }
}

function tokenStyle(geo, facing) {
  const h = geo.size * TOKEN_SCALE
  const w = h * PIP_BOX_RATIO
  const [cx, cy] = geo.head
  return {
    width: `${w}px`,
    height: `${h}px`,
    transform: `translate(${(cx - w / 2).toFixed(1)}px, ${(cy + geo.size * TOKEN_FOOT_DROP - h * PIP_FOOT_RATIO).toFixed(1)}px) scaleX(${facing})`
  }
}

export default PipsPathBoard
