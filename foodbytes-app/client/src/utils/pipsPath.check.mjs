// Run: npm run check:games   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-49 Pip's Path move rules are
// pinned here against the approved mockup's levels. Mirrors pipBubble.check.mjs.
import assert from 'node:assert/strict'
import {
  bubbleKeyFor, canStep, head, isCleared, isStuck, mapNodeStatus, moveTo, newRun, parseRows, restart, step, stepByKey
} from './pipsPath.js'
import { rewardLine } from '../constants/pipsPath.js'

const map = (rows) => ({ width: rows[0].length, height: rows.length, rows })
const walk = (grid, run, cells) => cells.reduce((r, j) => step(grid, r, j), run)

// garden-01: 3×3, S top-left, a snake clears it.
const g1 = parseRows(map(['S..', '...', '...']))
assert.equal(g1.start, 0)
assert.equal(g1.total, 9)
const snake = walk(g1, newRun(g1), [1, 2, 5, 4, 3, 6, 7, 8])
assert.ok(isCleared(g1, snake))
assert.equal(bubbleKeyFor(g1, snake), 'cleared')

// Moves: only orthogonal, open, unvisited neighbours of the head.
assert.equal(canStep(g1, newRun(g1), 4), false) // diagonal
assert.equal(canStep(g1, newRun(g1), 2), false) // not adjacent
assert.deepEqual(step(g1, newRun(g1), 4), newRun(g1))
const two = walk(g1, newRun(g1), [1, 2])
assert.equal(canStep(g1, two, 1), false) // already on the path

// No Undo: walking from the head onto a visited orthogonal neighbour restarts the level.
const three = walk(g1, newRun(g1), [1, 2, 5]) // head 5, neighbours 2 / 4 / 8
assert.deepEqual(moveTo(g1, three, 2), { path: [0], reset: true }) // adjacent visited -> restart, flagged
assert.deepEqual(moveTo(g1, two, 1), { path: [0], reset: true })
assert.equal(bubbleKeyFor(g1, moveTo(g1, three, 2)), 'reset')
assert.equal(bubbleKeyFor(g1, restart(g1)), 'intro') // the Restart button shows the intro, not the reset line
assert.equal(bubbleKeyFor(g1, step(g1, moveTo(g1, three, 2), 1)), 'intro') // the next step clears the reset line
assert.equal(moveTo(g1, three, 5), three) // tapping the head tile is a no-op
assert.equal(moveTo(g1, three, 0), three) // visited but not adjacent: no-op
assert.equal(moveTo(g1, three, 7), three) // open, unvisited, not adjacent: no-op
assert.deepEqual(moveTo(g1, three, 4), { path: [0, 1, 2, 5, 4] }) // a normal step
assert.deepEqual(stepByKey(g1, three, 'ArrowUp'), { path: [0], reset: true }) // key into the visited tile above (2)
assert.equal(stepByKey(g1, three, 'ArrowRight'), three) // off the board
assert.deepEqual(restart(g1), newRun(g1))

// Keys step from the head; off the board is a no-op.
assert.equal(head(stepByKey(g1, newRun(g1), 'ArrowRight')), 1)
assert.equal(head(stepByKey(g1, newRun(g1), 's')), 3)
assert.deepEqual(stepByKey(g1, newRun(g1), 'ArrowUp'), newRun(g1))
assert.deepEqual(stepByKey(g1, newRun(g1), 'q'), newRun(g1))

// garden-03 stuck walk from the mockup (STUCK_WALK = [9, 8, 4, 0]): rock at index 1.
const g3 = parseRows(map(['.#..', '....', '..S.', '....']))
assert.equal(g3.open[1], false)
const stuck = walk(g3, newRun(g3), [9, 8, 4, 0])
assert.ok(isStuck(g3, stuck))
assert.equal(bubbleKeyFor(g3, stuck), 'stuck')
assert.equal(bubbleKeyFor(g3, newRun(g3)), 'intro')

// Malformed maps throw instead of drawing nonsense.
assert.throws(() => parseRows(map(['.......'])), /invalid map/) // 7 columns
assert.throws(() => parseRows(map(['...', '...'])), /exactly one S/)
assert.throws(() => parseRows({ width: 3, height: 2, rows: ['S..'] }), /invalid map/)
assert.throws(() => parseRows(map(['S.x'])), /invalid map/)

// Chapter map nodes.
assert.equal(mapNodeStatus(3, 3), 'cleared')
assert.equal(mapNodeStatus(4, 3), 'current')
assert.equal(mapNodeStatus(5, 3), 'locked')
assert.equal(mapNodeStatus(1, 0), 'current')

// Reward line from the server's numbers.
assert.equal(rewardLine({ alreadyCleared: false, paid: 5, capped: false, dailyCap: 50 }), '+5 ✨')
assert.equal(rewardLine({ alreadyCleared: false, paid: 3, capped: true, dailyCap: 50 }), "+3 ✨ · today's game sprinkles are full (50/50)")
assert.equal(rewardLine({ alreadyCleared: false, paid: 0, capped: true, dailyCap: 50 }), "Today's game sprinkles are full (50/50)")
assert.equal(rewardLine({ alreadyCleared: true, paid: 0, capped: false, dailyCap: 50 }), 'Already counted')

console.log('Pip\'s Path engine OK')
