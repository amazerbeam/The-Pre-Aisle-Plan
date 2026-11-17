import { KEY_TO_DELTA, MAP_NODE, PIPS_PATH_MAX_COLS } from '../constants/pipsPath.js'

/**
 * MPP-49: Pip's Path move rules — a port of the approved mockup's pp-engine (pips-path.html).
 * Pure: a run is { path: number[], reset?: true } of cell indices (y * W + x), start first (reset marks a revisit-restart); every op returns a new run.
 * The server proves and re-checks maps, so the client has no solver.
 */

/** Parses a server map ({ width, height, rows }); throws Error('invalid map: …') on a malformed one. */
export function parseRows({ width, height, rows }) {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length !== height) throw new Error('invalid map: rows do not match the height')
  if (width > PIPS_PATH_MAX_COLS) throw new Error(`invalid map: ${width} columns, the maximum is ${PIPS_PATH_MAX_COLS}`)
  if (!rows.every(r => typeof r === 'string' && r.length === width && /^[S.#]+$/.test(r))) throw new Error('invalid map: bad row')
  const W = width, H = height, open = []
  let start = -1, starts = 0, total = 0
  rows.forEach((row, y) => [...row].forEach((c, x) => {
    const i = y * W + x
    open[i] = c !== '#'
    if (open[i]) total++
    if (c === 'S') { start = i; starts++ }
  }))
  if (starts !== 1) throw new Error(`invalid map: needs exactly one S, found ${starts}`)
  return { W, H, open, start, total }
}

export function neighbours(grid, i) {
  const { W, H, open } = grid, x = i % W, y = Math.floor(i / W), out = []
  if (x > 0) out.push(i - 1)
  if (x < W - 1) out.push(i + 1)
  if (y > 0) out.push(i - W)
  if (y < H - 1) out.push(i + W)
  return out.filter(j => open[j])
}

export const newRun = (grid) => ({ path: [grid.start] })
export const head = (run) => run.path[run.path.length - 1]
export const canStep = (grid, run, j) => grid.open[j] === true && !run.path.includes(j) && neighbours(grid, head(run)).includes(j)
export const step = (grid, run, j) => (canStep(grid, run, j) ? { path: [...run.path, j] } : run)
export const restart = (grid) => newRun(grid)
/** True when j is a tile already on the path, next to Pip's head (not the head itself): walking onto it restarts the level. */
export const isRevisit = (grid, run, j) => j !== head(run) && run.path.includes(j) && neighbours(grid, head(run)).includes(j)
/** One walk attempt from the head onto tile j: a step, a restart when j is a visited neighbour (run.reset = true), else no change. */
export const moveTo = (grid, run, j) => (isRevisit(grid, run, j) ? { ...restart(grid), reset: true } : step(grid, run, j))
export const isCleared = (grid, run) => run.path.length === grid.total
export const isStuck = (grid, run) => !isCleared(grid, run) && !neighbours(grid, head(run)).some(j => !run.path.includes(j))
export const samePath = (a, b) => a.path.length === b.path.length && a.path.every((v, i) => v === b.path[i])

/** Moves one tile from Pip's head by an arrow / WASD key (a visited neighbour restarts); unchanged off the board or into a rock. */
export function stepByKey(grid, run, key) {
  const delta = KEY_TO_DELTA[key]
  if (!delta) return run
  const h = head(run), x = (h % grid.W) + delta[0], y = Math.floor(h / grid.W) + delta[1]
  if (x < 0 || x >= grid.W || y < 0 || y >= grid.H) return run
  return moveTo(grid, run, y * grid.W + x)
}

/** Which of the skin's lines Pip says now ('reset' only right after a revisit-restart, until the next step). */
export function bubbleKeyFor(grid, run) {
  if (isCleared(grid, run)) return 'cleared'
  if (run.reset) return 'reset'
  if (isStuck(grid, run)) return 'stuck'
  return run.path.length >= Math.ceil(grid.total / 2) ? 'half' : 'intro'
}

/** A chapter-map node from the family's highest cleared difficulty. */
export function mapNodeStatus(difficulty, highestCleared) {
  if (difficulty <= highestCleared) return MAP_NODE.CLEARED
  return difficulty === highestCleared + 1 ? MAP_NODE.CURRENT : MAP_NODE.LOCKED
}
