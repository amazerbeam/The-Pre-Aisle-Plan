// Chrome smoke for pip-room-chrome.html (contract 2026-11-16-themed-pip-rooms-mockups, Task 13).
// Usage: node chrome-smoke.mjs <path-to-chrome-html>
// 1. Parses the <script id="token-table"> JSON.
// 2. Each token/roomArt source line must contain its default value / value.
// 3. Every colour literal in PetView.css + room/*.css is covered by exactly one source entry (per literal occurrence).
// 4. Every pair passes its min contrast in default, parchment and cyberpunk (same WCAG maths as client/scripts/check-themes.mjs).
// MPP-45 (post-sweep): the colour literals moved out of the component CSS into styles/themes/*.css, so the pre-sweep
// source-line and literal-coverage audits (steps 1-3) no longer apply. With POST_SWEEP the smoke instead checks each token's
// Default / Parchment / Cyberpunk value against the theme CSS, then runs the contrast pairs (step 4) unchanged.
const POST_SWEEP = true
import { readFileSync, readdirSync } from 'node:fs'

const repo = new URL('../../../', import.meta.url)
const petDir = new URL('foodbytes-app/client/src/components/pet/', repo)
const themesDir = new URL('foodbytes-app/client/src/styles/themes/', repo)
const read = (url) => readFileSync(url, 'utf8')

const htmlPath = process.argv[2]
if (!htmlPath) { console.error('usage: node chrome-smoke.mjs <path-to-chrome-html>'); process.exit(2) }
const html = readFileSync(htmlPath, 'utf8')
const block = html.match(/<script id="token-table" type="application\/json">([\s\S]*?)<\/script>/)
if (!block) { console.error('FAIL no <script id="token-table" type="application/json"> block'); process.exit(1) }
const table = JSON.parse(block[1])
const { tokens, roomArt, pairs } = table

const failures = []
const fail = (m) => failures.push(m)

// ---- literal regexes: STEP1 matches the Step 1 search (Select-String is case-insensitive); LITERAL extracts the whole literal
const STEP1 = /#[0-9a-fA-F]{3,8}\b|rgba?\(/i
const LITERAL = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/gi
const norm = (v) => {
  v = v.trim().toLowerCase()
  if (/^#[0-9a-f]{3}$/.test(v)) v = '#' + [...v.slice(1)].map((c) => c + c).join('')
  return v.replace(/\s+/g, '')
}
const literalsOf = (text) => [...text.matchAll(LITERAL)].map((m) => norm(m[0]))

// A line holds a value when every literal of the value is on the line (case-insensitive, #fff == #ffffff, whitespace-insensitive).
const holds = (text, value) => {
  const have = literalsOf(text)
  return literalsOf(value).every((lit) => { const i = have.indexOf(lit); if (i < 0) return false; have.splice(i, 1); return true })
}

// ---- the files and their lines
const cssFiles = ['PetView.css', ...readdirSync(new URL('room/', petDir)).filter((f) => f.endsWith('.css')).sort().map((f) => `room/${f}`)]
const fileLines = {}
for (const f of cssFiles) fileLines[f] = read(new URL(f, petDir)).split(/\r?\n/)
const lineAt = (src) => {
  const i = src.lastIndexOf(':')
  const file = src.slice(0, i)
  const n = Number(src.slice(i + 1))
  const lines = fileLines[file]
  if (!lines) { fail(`source ${src}: unknown file (expected PetView.css or room/*.css)`); return null }
  if (!Number.isInteger(n) || n < 1 || n > lines.length) { fail(`source ${src}: line out of range`); return null }
  return { file, n, text: lines[n - 1] }
}

// ---- theme token maps (same parse as check-themes.mjs; var() chains followed to the end)
const parseTokens = (css) => {
  const t = {}
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) t[m[1]] = m[2].trim()
  return t
}
const defaultTokens = parseTokens(read(new URL('default.css', themesDir)))
const THEME_IDS = ['default', 'parchment', 'cyberpunk']
const globalMaps = {
  default: defaultTokens,
  parchment: { ...defaultTokens, ...parseTokens(read(new URL('parchment.css', themesDir))) },
  cyberpunk: { ...defaultTokens, ...parseTokens(read(new URL('cyberpunk.css', themesDir))) },
}
const follow = (map, name) => {
  let value = map[name]
  for (let i = 0; i < 8 && value; i += 1) {
    const ref = value.match(/^var\((--[\w-]+)\)$/)
    if (!ref) break
    value = map[ref[1]]
  }
  return value
}

// ---- steps 1 and 2: every source line holds its value
const seen = new Map() // "file:line" -> literals claimed
const claim = (src, lits) => {
  const entry = seen.get(src) ?? []
  entry.push(...lits)
  seen.set(src, entry)
}
for (const row of tokens) {
  if (!row.token || !row.sources?.length) { fail(`token row without token/sources: ${JSON.stringify(row)}`); continue }
  const lits = literalsOf(row.defaultValue)
  if (lits.length === 0) fail(`${row.token}: defaultValue "${row.defaultValue}" holds no colour literal`)
  if (!POST_SWEEP) for (const src of row.sources) {
    const hit = lineAt(src)
    if (!hit) continue
    if (!holds(hit.text, row.defaultValue)) fail(`${row.token}: ${src} does not contain "${row.defaultValue}"`)
    claim(src, lits)
  }
  if (POST_SWEEP) {
    const name = row.token
    const resolvedDefault = follow(defaultTokens, name)
    if (!resolvedDefault) fail(`${name}: not defined in default.css`)
    else if (norm(resolvedDefault) !== norm(row.defaultValue)) fail(`${name}: Default drift, table says ${row.defaultValue}, default.css says ${resolvedDefault}`)
    for (const id of ['parchment', 'cyberpunk']) {
      const resolved = follow(globalMaps[id], name)
      if (!resolved || norm(resolved) !== norm(row[id] ?? '')) fail(`${name}: ${id} value ${row[id]} does not match what ${id}.css resolves (${resolved})`)
    }
  } else if (row.kind?.startsWith('existing:')) {
    const name = row.kind.slice('existing:'.length)
    if (name !== row.token) fail(`${row.token}: kind ${row.kind} names a different token`)
    const resolvedDefault = follow(defaultTokens, name)
    if (!resolvedDefault) fail(`${row.token}: ${name} is not defined in default.css`)
    else if (norm(resolvedDefault) !== norm(row.defaultValue)) fail(`${row.token}: Default drift, table says ${row.defaultValue}, default.css says ${resolvedDefault}`)
    for (const id of ['parchment', 'cyberpunk']) {
      const resolved = follow(globalMaps[id], name)
      if (!resolved || norm(resolved) !== norm(row[id] ?? '')) fail(`${row.token}: ${id} value ${row[id]} does not match what ${id}.css resolves (${resolved})`)
    }
  } else if (row.kind !== 'new') {
    fail(`${row.token}: kind must be "new" or "existing:--x" (got ${row.kind})`)
  } else {
    if (!row.token.startsWith('--pet-')) fail(`${row.token}: a new token is named --pet-<area>-<role>`)
    if (defaultTokens[row.token]) fail(`${row.token}: already exists in default.css, so kind must be existing`)
    for (const id of ['parchment', 'cyberpunk']) if (!row[id]) fail(`${row.token}: no ${id} value`)
  }
}
for (const row of roomArt) {
  if (!row.value || !row.sources?.length || !row.reason) { fail(`roomArt row needs value, sources and reason: ${JSON.stringify(row)}`); continue }
  const lits = literalsOf(row.value)
  if (lits.length === 0) fail(`roomArt "${row.value}" holds no colour literal`)
  if (!POST_SWEEP) for (const src of row.sources) {
    const hit = lineAt(src)
    if (!hit) continue
    if (!holds(hit.text, row.value)) fail(`roomArt: ${src} does not contain "${row.value}"`)
    claim(src, lits)
  }
}

// ---- step 3: re-run the search, every hit covered exactly once
let hitLines = 0
let literalCount = 0
for (const f of POST_SWEEP ? [] : cssFiles) {
  fileLines[f].forEach((text, i) => {
    if (!STEP1.test(text)) return
    hitLines += 1
    const src = `${f}:${i + 1}`
    const want = literalsOf(text).sort()
    literalCount += want.length
    const got = (seen.get(src) ?? []).slice().sort()
    if (got.length === 0) fail(`UNCLASSIFIED ${src}: ${text.trim()}`)
    else if (want.join('|') !== got.join('|')) fail(`COVERAGE ${src}: line has [${want}] but rows claim [${got}]`)
  })
}
for (const src of POST_SWEEP ? [] : seen.keys()) {
  const [file] = [src.slice(0, src.lastIndexOf(':'))]
  const n = Number(src.slice(src.lastIndexOf(':') + 1))
  if (fileLines[file] && !STEP1.test(fileLines[file][n - 1] ?? '')) fail(`${src}: claimed but the line has no colour literal`)
}

// ---- step 4: WCAG contrast, same maths as check-themes.mjs
const toRgb = (hex) => {
  let h = hex.slice(1)
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
}
const luminance = (hex) => {
  const [r, g, b] = toRgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
const parseColour = (value) => {
  const v = norm(value)
  if (v.startsWith('#')) return { hex: v, a: 1 }
  const m = v.match(/^rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)$/)
  if (!m) return null
  const hex = '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')
  return { hex, a: m[4] === undefined ? 1 : Number(m[4]) }
}
const flatten = (top, base) => {
  const a = toRgb(top.hex)
  const b = toRgb(base)
  return '#' + a.map((c, i) => Math.round((top.a * c + (1 - top.a) * b[i]) * 255).toString(16).padStart(2, '0')).join('')
}

const tokenValue = (id, name) => {
  const row = tokens.find((t) => t.token === name)
  if (row && row.kind === 'new') return id === 'default' ? row.defaultValue : row[id]
  return follow(globalMaps[id], name)
}
let pairChecks = 0
for (const id of THEME_IDS) {
  for (const { fg, bg, min, over } of pairs) {
    const fgValue = tokenValue(id, fg)
    const bgValue = tokenValue(id, bg)
    const fgColour = fgValue && parseColour(fgValue)
    const bgColour = bgValue && parseColour(bgValue)
    if (!fgColour || !bgColour) { fail(`MISSING ${!fgColour ? fg : bg} in ${id} (${!fgColour ? fgValue : bgValue})`); continue }
    if (fgColour.a < 1) { fail(`${fg} in ${id} is translucent; a text colour must be opaque`); continue }
    let bgHex = bgColour.hex
    if (bgColour.a < 1) {
      if (!over) { fail(`${bg} in ${id} is translucent: the pair needs an "over" token`); continue }
      const base = parseColour(tokenValue(id, over) ?? '')
      if (!base || base.a < 1) { fail(`over ${over} in ${id} must resolve to an opaque colour`); continue }
      bgHex = flatten(bgColour, base.hex)
    }
    pairChecks += 1
    const ratio = contrast(fgColour.hex, bgHex)
    if (ratio < min) fail(`FAIL ${fg} on ${bg} (${id}): ${ratio.toFixed(2)} < ${min}`)
  }
}

if (failures.length > 0) {
  failures.forEach((m) => console.error(m))
  console.error(`chrome smoke FAILED: ${failures.length} problem(s)`)
  process.exit(1)
}
const artLiterals = roomArt.reduce((n, r) => n + r.sources.length, 0)
console.log(`chrome smoke OK: ${tokens.length} tokens, ${roomArt.length} room-art literals, ${pairs.length} pairs × 3 themes`)
console.log(`  (${tokens.filter((t) => t.kind === 'new').length} new + ${tokens.filter((t) => t.kind !== 'new').length} existing tokens; ${hitLines} hit lines, ${literalCount} literal occurrences in ${cssFiles.length} files; ${artLiterals} room-art occurrences; ${pairChecks} contrast checks)`)
