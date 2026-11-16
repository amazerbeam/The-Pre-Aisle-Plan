// Run: npm run check:room (chained after room.check.mjs)
// MPP-45: every registered room pack covers the shared ids, names them, and draws finite markup.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { withSsr } from '../../../../../scripts/ssrLoad.mjs'

await withSsr(async (load) => {
  const { createElement: h, Fragment } = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { ROOM_PACKS, packStationArt, packBackdrop, packEffects, packStyle, packDecorArt } = await load('/src/components/pet/room/roomPacks.jsx')
  const { ROOM_STATIONS, ROOM_MAX_LEVEL } = await load('/src/constants/petRoom.js')
  const { ROOM_STYLES, ROOM_SPOTS, DEFAULT_WALL_STYLE, DEFAULT_FLOOR_STYLE, DECOR_ITEMS } = await load('/src/constants/petDecor.js')
  const { PIP_LINE } = await load('/src/constants/pipLines.js')
  const { ROOM_LABELS, stationLabel, stationLevelName, styleLabel, decorLabel } = await load('/src/constants/petRoomLabels.js')
  const svg = (node) => renderToStaticMarkup(h('svg', null, node))
  const finite = (markup, what) => {
    assert.ok(markup.length > 20, `${what}: empty`)
    assert.ok(!/NaN|Infinity|undefined/.test(markup), `${what}: non-finite or undefined in markup`)
  }
  const stations = Object.values(ROOM_STATIONS)
  const styleIds = Object.keys(ROOM_STYLES)
  // The effect loops roomFx.css defines (.room-fx--<name>), and the targets an ambience entry may name.
  const fxCss = readFileSync(new URL('../roomFx.css', import.meta.url), 'utf8')
  const fxLoops = new Set([...fxCss.matchAll(/\.room-fx--(\w+)\s*\{/g)].map((m) => m[1]))
  for (const name of ['flicker', 'embers', 'glint', 'sway', 'steam', 'zzz', 'scan', 'blink', 'fan', 'buzz', 'rain']) assert.ok(fxLoops.has(name), `roomFx.css: no .room-fx--${name}`)
  const decorIds = Object.keys(DECOR_ITEMS)
  const ambienceTargets = new Set(['shell', 'window', ...stations, ...decorIds])
  // MPP-46/47: lines whose pack draws and names every decor id itself (no herb fallback).
  const FULL_DECOR_LINES = new Set([PIP_LINE.DRAGON, PIP_LINE.ROBOT])
  for (const [line, pack] of Object.entries(ROOM_PACKS)) {
    for (const station of stations) {
      assert.ok(stationLabel(line, station), `${line}: no name for ${station}`)
      for (let level = 1; level <= ROOM_MAX_LEVEL; level++) {
        if (line !== PIP_LINE.HERB) assert.ok(pack.stations[station]?.[level - 1], `${line}: missing ${station} L${level}`)
        assert.ok(stationLevelName(line, station, level), `${line}: no level name ${station} L${level}`)
        const art = packStationArt(pack, station, level)
        finite(svg(station === 'bed' ? h(Fragment, null, art.back, art.front) : art), `${line} ${station} L${level}`)
      }
    }
    for (const id of decorIds) assert.ok(decorLabel(line, id), `${line}: no name for decor ${id}`)
    if (FULL_DECOR_LINES.has(line)) for (const id of decorIds) assert.ok(ROOM_LABELS[line].decor?.[id], `${line}: decor ${id} falls back to the herb name`)
    for (const id of styleIds) {
      assert.ok(styleLabel(line, id), `${line}: no name for ${id}`)
      if (line !== PIP_LINE.HERB) assert.ok(pack.styles[id], `${line}: missing style ${id}`)
      const wall = ROOM_STYLES[id].spot === ROOM_SPOTS.WALL_STYLE
      for (const night of [false, true]) {
        finite(svg(packBackdrop(pack, night, wall ? id : DEFAULT_WALL_STYLE, wall ? DEFAULT_FLOOR_STYLE : id)), `${line} ${id} ${night ? 'night' : 'day'}`)
      }
      assert.ok(packStyle(pack, id), `${line}: packStyle(${id}) is null`)
    }
    for (const id of decorIds) finite(svg(packDecorArt(pack, id)), `${line} decor ${id}`)
    if (FULL_DECOR_LINES.has(line)) for (const id of decorIds) assert.equal(typeof pack.decor[id], 'function', `${line}: missing decor ${id}`)
    const { FridgeGauge, PotSteam, ServedPlate, SleepZs } = packEffects(pack)
    if (line !== PIP_LINE.HERB) for (const k of ['FridgeGauge', 'PotSteam', 'ServedPlate', 'SleepZs']) assert.ok(pack.effects[k], `${line}: missing effect ${k}`)
    for (let level = 1; level <= ROOM_MAX_LEVEL; level++) {
      for (const pct of [0, 50, 100]) finite(svg(h(FridgeGauge, { level, pct })), `${line} gauge L${level} ${pct}%`)
      finite(svg(h(PotSteam, { level })), `${line} steam L${level}`)
      finite(svg(h(ServedPlate, { level })), `${line} plate L${level}`)
      finite(svg(h(SleepZs, { level })), `${line} zzz L${level}`)
    }
    assert.ok(typeof pack.ink === 'string' && pack.ink.startsWith('#'), `${line}: ink`)
    assert.ok(Array.isArray(pack.ambience), `${line}: ambience`)
    assert.equal(pack.labels, ROOM_LABELS[line], `${line}: labels is not ROOM_LABELS[${line}]`)
    if (line !== PIP_LINE.HERB) {
      assert.ok(pack.ambience.length > 0, `${line}: ambience is empty`)
      for (const { target, effect } of pack.ambience) {
        assert.ok(fxLoops.has(effect), `${line}: ambience effect '${effect}' has no .room-fx--${effect} loop`)
        assert.ok(ambienceTargets.has(target), `${line}: ambience target '${target}' is not shell, window, a station or a decor id`)
      }
      for (const key of Object.keys(pack.stations)) assert.ok(stations.includes(key), `${line}: unknown station key '${key}'`)
      for (const key of Object.keys(pack.styles)) assert.ok(styleIds.includes(key), `${line}: unknown style key '${key}'`)
      for (const key of Object.keys(pack.decor)) assert.ok(decorIds.includes(key), `${line}: unknown decor key '${key}'`)
    }
  }
  // MPP-46: a pack-drawn legacy id is slid by DECOR_LEGACY_SHIFT; a non-legacy id is not wrapped.
  const probe = { line: 'probe', decor: { 'basil-print': () => h('circle', { r: 1 }), 'pip-portrait': () => h('circle', { r: 1 }) } }
  assert.match(svg(packDecorArt(probe, 'basil-print')), /^<svg><g transform="translate\(/, 'legacy id not shifted')
  assert.equal(svg(packDecorArt(probe, 'pip-portrait')), '<svg><circle r="1"></circle></svg>', 'non-legacy id wrapped')
  console.log(`Room packs OK: ${Object.keys(ROOM_PACKS).join(', ')}`)
})
