// MPP-45 drift guard: renders the herb room to static markup and writes it (--write <dir>) or compares it byte-for-byte (--compare <dir>).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withSsr } from './ssrLoad.mjs'

const [mode, dirArg] = process.argv.slice(2)
if (!['--write', '--compare'].includes(mode) || !dirArg) {
  console.error('usage: node scripts/room-ssr.mjs --write <dir> | --compare <dir>')
  process.exit(2)
}
const dir = resolve(dirArg)

// usePipCamera uses useLayoutEffect, which warns on the server and has no effect on the markup.
const realError = console.error
console.error = (...args) => {
  if (!String(args[0]).includes('useLayoutEffect does nothing on the server')) realError(...args)
}

const noop = () => {}

function buildFixtures(m) {
  const { PetRoom, StationThumb, DecorThumb, ShopStylesTab, RoomStyleChips, petDecor, petRoom } = m
  const { DECOR_ITEMS, DECOR_SPOTS, DEFAULT_PLACEMENTS, ROOM_STYLES } = petDecor
  const { DEFAULT_ROOM_LEVELS, ROOM_STATIONS } = petRoom
  const stations = Object.values(ROOM_STATIONS)
  const levelsAll = (n) => Object.fromEntries(stations.map(s => [s, n]))
  const decorStub = (placements, editing = false) => ({
    room: { placements, decor: [], freeMode: false },
    editing, selectedSpot: null, openSpot: noop, closeSpot: noop, place: noop, toggle: noop, done: noop, error: null
  })
  const base = { name: 'Pip', mood: 'content', bubble: 'Hi', position: 'rug', levels: DEFAULT_ROOM_LEVELS, decor: decorStub(DEFAULT_PLACEMENTS), line: 'herb' }
  const room = (props) => h(PetRoom, { ...base, ...props })

  const everySpot = { ...DEFAULT_PLACEMENTS }
  for (const spot of DECOR_SPOTS) {
    const id = Object.keys(DECOR_ITEMS).find(key => DECOR_ITEMS[key].spot === spot)
    if (id) everySpot[spot] = id
  }

  const allStyles = Object.entries(ROOM_STYLES).map(([id, style]) => ({ id, kind: style.spot, price: id === DEFAULT_PLACEMENTS.wallStyle || id === DEFAULT_PLACEMENTS.floorStyle ? 0 : 100, owned: true }))
  const shop = { room: { decor: allStyles }, sprinkles: 0, armed: null, busy: null, arm: noop, buy: noop }

  const thumbs = []
  for (const station of stations) for (let level = 1; level <= 4; level++) thumbs.push(h(StationThumb, { key: `${station}${level}`, station, level }))

  return {
    'day-rug-l1-defaults': room({}),
    'all-l4-every-spot': room({ levels: levelsAll(4), decor: decorStub(everySpot) }),
    'asleep-l2': room({ position: 'bed', levels: levelsAll(2) }),
    'cooking-served-fridge-50': room({ serving: { phase: 'served', mealType: 'DINNER' }, fridge: { fill: { pct: 50, planned: 4 } } }),
    editing: room({ decor: decorStub(DEFAULT_PLACEMENTS, true) }),
    'station-thumbs': h('div', null, ...thumbs),
    'decor-thumbs': h('div', null, ...Object.keys(DECOR_ITEMS).map(id => h(DecorThumb, { key: id, id }))),
    'style-tab-and-chips': h('div', null,
      h(ShopStylesTab, { shop }),
      h(RoomStyleChips, { room: { decor: allStyles, placements: DEFAULT_PLACEMENTS }, behind: {}, onPick: noop }))
  }
}

function firstDiff(a, b) {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}

const failed = await withSsr(async (load) => {
  const m = {
    PetRoom: (await load('/src/components/pet/room/PetRoom.jsx')).default,
    StationThumb: (await load('/src/components/pet/room/StationThumb.jsx')).default,
    DecorThumb: (await load('/src/components/pet/room/DecorThumb.jsx')).default,
    ShopStylesTab: (await load('/src/components/pet/room/ShopStylesTab.jsx')).default,
    RoomStyleChips: (await load('/src/components/pet/room/RoomStyleChips.jsx')).default,
    petDecor: await load('/src/constants/petDecor.js'),
    petRoom: await load('/src/constants/petRoom.js')
  }
  const fixtures = buildFixtures(m)
  const names = Object.keys(fixtures)
  if (mode === '--write') mkdirSync(dir, { recursive: true })
  let bad = 0
  for (const name of names) {
    const html = renderToStaticMarkup(fixtures[name])
    const file = resolve(dir, `${name}.html`)
    if (mode === '--write') {
      writeFileSync(file, html)
      console.log(`wrote ${name}.html (${html.length} chars)`)
      continue
    }
    const expected = readFileSync(file, 'utf8')
    if (expected !== html) {
      const at = firstDiff(expected, html)
      console.error(`DIFF in ${name} at offset ${at}\n  baseline: ${expected.slice(Math.max(0, at - 20), at + 100)}\n  current:  ${html.slice(Math.max(0, at - 20), at + 100)}`)
      bad++
    }
  }
  if (mode === '--compare' && !bad) console.log(`Room SSR OK: ${names.length} fixtures identical`)
  return bad
})
process.exit(failed ? 1 : 0)
