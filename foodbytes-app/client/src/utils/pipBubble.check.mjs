// Run: npm run check:bubble   (from foodbytes-app/client)
//
// There is no test runner wired into client/package.json, so the MPP-28 AC 2 bubble order is
// pinned here. Mirrors cookServe.check.mjs.
import assert from 'node:assert/strict'
import { pipBubble } from './pipBubble.js'

const ACTIONS = { step: 'ASK' }
const ASKING = { text: 'Nice! Any snacks yesterday?', prompt: 'Any snacks yesterday?', actions: ACTIONS }
const REACTING = { text: 'Nice!', prompt: null, actions: null }
const ALL = { cookLine: 'Cooking!', announcement: 'New trophy!', growthLine: 'I grew!', checkIn: ASKING, fridgeLine: 'Fridge low', moodLine: 'Just vibing.' }

// Each tier beats everything below it.
assert.deepEqual(pipBubble(ALL), { text: 'Cooking!', actions: null })
assert.deepEqual(pipBubble({ ...ALL, cookLine: null, checkIn: null }), { text: 'New trophy!', actions: null })
assert.deepEqual(pipBubble({ ...ALL, cookLine: null, announcement: null }), { text: 'I grew!', actions: null })
assert.deepEqual(pipBubble({ ...ALL, cookLine: null, announcement: null, growthLine: null }), { text: ASKING.text, actions: ACTIONS })
assert.deepEqual(pipBubble({ fridgeLine: 'Fridge low', moodLine: 'Just vibing.' }), { text: 'Fridge low', actions: null })
assert.deepEqual(pipBubble({ moodLine: 'Just vibing.' }), { text: 'Just vibing.', actions: null })

// An announcement leads an open question, which keeps its buttons.
assert.deepEqual(pipBubble({ announcement: 'New trophy!', checkIn: ASKING, moodLine: 'x' }),
  { text: 'New trophy! Any snacks yesterday?', actions: ACTIONS })
// A reaction with no question under it gives way to the announcement.
assert.deepEqual(pipBubble({ announcement: 'New trophy!', checkIn: REACTING }), { text: 'New trophy!', actions: null })
// The check-in outranks the fridge and the mood.
assert.deepEqual(pipBubble({ checkIn: REACTING, fridgeLine: 'Fridge low', moodLine: 'x' }), { text: 'Nice!', actions: null })

console.log('pipBubble: all checks passed')
