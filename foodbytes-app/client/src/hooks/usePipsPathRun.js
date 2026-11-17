import { useRef, useState } from 'react'
import { KEY_TO_DELTA, RESTART_KEY } from '../constants/pipsPath'
import { head, isCleared, isStuck, moveTo, newRun, restart, samePath, stepByKey } from '../utils/pipsPath'

/**
 * MPP-49: one attempt at a Pip's Path map. `grid` is fixed for the hook's life (the board is keyed by
 * mapId). runRef always holds the latest run, so a fast drag that fires several moves in one frame
 * applies them in order. Walking onto a visited neighbour restarts the level (the engine's moveTo).
 * After a clear the board freezes: taps and moves are ignored, Restart still acts and un-freezes it
 * (the R key too; arrow keys do not).
 */
export default function usePipsPathRun(grid) {
  const [run, setRun] = useState(() => newRun(grid))
  const [facing, setFacing] = useState(1)
  const runRef = useRef(run)

  const apply = (next) => {
    const prev = runRef.current
    if (samePath(prev, next)) return false
    if (next.path.length > prev.path.length) {
      const dx = (head(next) % grid.W) - (head(prev) % grid.W)
      if (dx !== 0) setFacing(dx < 0 ? -1 : 1)
    }
    runRef.current = next
    setRun(next)
    return true
  }

  /** Returns true when the attempt restarted the level (a drag then ends). */
  const tryTile = (i) => {
    const current = runRef.current
    if (isCleared(grid, current)) return false
    const next = moveTo(grid, current, i)
    apply(next)
    return next.reset === true
  }

  /** Returns true when the key belongs to the board (the caller then prevents the default). */
  const onKey = (key) => {
    const frozen = isCleared(grid, runRef.current)
    if (Object.hasOwn(KEY_TO_DELTA, key)) {
      if (!frozen) apply(stepByKey(grid, runRef.current, key))
      return true
    }
    if (key === RESTART_KEY) {
      apply(restart(grid))
      return true
    }
    return false
  }

  return {
    run,
    facing,
    cleared: isCleared(grid, run),
    stuck: isStuck(grid, run),
    tryTile,
    onKey,
    restartRun: () => apply(restart(grid))
  }
}
