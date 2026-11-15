// Theme check: WCAG contrast pairs per theme + registry <-> CSS <-> index.html consistency.
// Default values are never retuned by this contract; known Default misses are listed in KNOWN_EXCEPTIONS.
import { readFileSync, existsSync } from 'node:fs'
import { THEMES, DEFAULT_THEME_ID } from '../src/constants/themes.js'
import { PIP_LINE_COPY } from '../src/constants/pipLines.js'

const root = new URL('../', import.meta.url)
const read = (relativePath) => readFileSync(new URL(relativePath, root), 'utf8')
const THEMES_DIR = 'src/styles/themes/'

const parseTokens = (css) => {
  const tokens = {}
  for (const match of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) tokens[match[1]] = match[2].trim()
  return tokens
}

const resolve = (tokens, name) => {
  let value = tokens[`--${name}`]
  const ref = value?.match(/^var\((--[\w-]+)\)$/)
  if (ref) value = tokens[ref[1]]
  return value
}

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

const on = (fgs, bgs, min) => fgs.flatMap((fg) => bgs.map((bg) => [fg, bg, min]))
const AISLES = ['produce', 'dairy', 'meat', 'seafood', 'bakery', 'grains', 'canned', 'condiments',
  'snacks', 'beverages', 'frozen', 'spices', 'oils', 'baking', 'misc']
const CARD_TEAL = ['card-teal-top', 'card-teal-bottom']
const CARD_PLAN = ['card-plan-top', 'card-plan-bottom']

const PAIRS = {
  default: [
    ...on(['text-primary', 'text-secondary'], ['bg-primary', 'bg-secondary'], 4.5),
    ['on-brand', 'brand-primary', 4.5],
  ],
  cyberpunk: [
    ...on(['ink', 'muted', 'pink', 'cyan', 'yellow', 'lime', 'red'], ['panel', 'raised'], 4.5),
    ...on(['ink', 'muted', 'pink', 'yellow'], CARD_TEAL, 4.5),
    ...on(['ink', 'muted', 'yellow'], CARD_PLAN, 4.5),
    ...on(['void'], ['pink', 'cyan', 'yellow', 'lime', 'orange', 'red'], 4.5),
    ['paper-ink', 'paper', 4.5],
    ['line', 'panel', 3.0],
    ...AISLES.map((a) => [`aisle-${a}`, 'paper', 3.0]),
  ],
  parchment: [
    ...on(['text-primary', 'text-secondary', 'brand-primary'], ['bg-primary', 'bg-secondary'], 4.5),
    ['on-brand', 'brand-primary', 4.5],
    ...on(['leather-ink', 'gold'], ['leather'], 4.5),
    ['focus-ink', 'page', 3.0],
    ...AISLES.map((a) => [`aisle-${a}`, 'page', 3.0]),
  ],
}

// Explicit, per-pair exceptions. Key: `<theme>|<fg>|<bg>`. Never add a Cyberpunk pair without a decision.
const KNOWN_EXCEPTIONS = {
  'default|text-secondary|bg-secondary': 'pre-existing Default look, 4.45:1; accepted 2026-11-15, fix in its own ticket',
}

const failures = []
const notes = []
let pairCount = 0
const defaultTokens = parseTokens(read(`${THEMES_DIR}default.css`))

for (const theme of THEMES) {
  const tokens = theme.id === DEFAULT_THEME_ID
    ? defaultTokens
    : { ...defaultTokens, ...parseTokens(read(`${THEMES_DIR}${theme.id}.css`)) }
  for (const [fg, bg, min] of PAIRS[theme.id] ?? []) {
    const fgValue = resolve(tokens, fg)
    const bgValue = resolve(tokens, bg)
    const missing = [[fg, fgValue], [bg, bgValue]].filter(([, v]) => !v || !v.startsWith('#'))
    if (missing.length > 0) {
      missing.forEach(([name]) => failures.push(`MISSING --${name} in ${theme.id}`))
      continue
    }
    pairCount += 1
    const ratio = contrast(fgValue, bgValue)
    const exception = KNOWN_EXCEPTIONS[`${theme.id}|${fg}|${bg}`]
    if (ratio < min) {
      if (exception) notes.push(`WARN ${fg} on ${bg} (${theme.id}): ${ratio.toFixed(2)} < ${min} — known exception`)
      else failures.push(`FAIL ${fg} on ${bg} (${theme.id}): ${ratio.toFixed(2)} < ${min}`)
    } else if (exception) {
      notes.push(`NOTE ${fg} on ${bg} (${theme.id}) now passes (${ratio.toFixed(2)}): the exception can be removed`)
    }
  }
}

for (const theme of THEMES) {
  if (theme.id !== DEFAULT_THEME_ID && !existsSync(new URL(`${THEMES_DIR}${theme.id}.css`, root))) {
    failures.push(`MISSING ${THEMES_DIR}${theme.id}.css`)
  }
}

const previewsPath = `${THEMES_DIR}previews.css`
if (existsSync(new URL(previewsPath, root))) {
  const previews = read(previewsPath)
  for (const theme of THEMES) {
    if (!previews.includes(`.theme-preview--${theme.id}`)) failures.push(`MISSING .theme-preview--${theme.id} in ${previewsPath}`)
  }
}

const indexHtml = read('index.html')
const bootIds = indexHtml.match(/ids=\[([^\]]*)\]/)?.[1].replace(/['"\s]/g, '').split(',')
const registryIds = THEMES.map((t) => t.id)
if (!bootIds || bootIds.join() !== registryIds.join()) {
  failures.push(`index.html boot list [${bootIds ?? 'not found'}] does not match THEMES [${registryIds}]`)
}

// The boot script's theme-color map (var c={<id>:'#hex'} plus the ||'#default' fallback) and the static meta tag must match the registry.
const defaultTheme = THEMES.find((t) => t.id === DEFAULT_THEME_ID)
const metaColor = indexHtml.match(/name="theme-color" content="(#[0-9a-fA-F]+)"/)?.[1]
if (metaColor !== defaultTheme.themeColor) failures.push(`index.html <meta theme-color> ${metaColor} does not match Default themeColor ${defaultTheme.themeColor}`)
const bootMap = Object.fromEntries(
  [...(indexHtml.match(/var c=\{([^}]*)\}/)?.[1] ?? '').matchAll(/(\w+):'(#[0-9a-fA-F]+)'/g)].map((m) => [m[1], m[2]])
)
const bootFallback = indexHtml.match(/c\[t\]\|\|'(#[0-9a-fA-F]+)'/)?.[1]
if (bootFallback !== defaultTheme.themeColor) failures.push(`index.html boot script fallback colour ${bootFallback} does not match Default themeColor ${defaultTheme.themeColor}`)
for (const theme of THEMES.filter((t) => t.id !== DEFAULT_THEME_ID)) {
  if (bootMap[theme.id] !== theme.themeColor) failures.push(`index.html boot script colour for ${theme.id} (${bootMap[theme.id]}) does not match its themeColor ${theme.themeColor}`)
}

for (const theme of THEMES) {
  if (!(theme.pipLine in PIP_LINE_COPY)) failures.push(`${theme.id}: pipLine "${theme.pipLine}" is not a known Pip line (${Object.keys(PIP_LINE_COPY)})`)
}

notes.forEach((message) => console.log(message))
if (failures.length > 0) {
  failures.forEach((message) => console.error(message))
  process.exit(1)
}
console.log(`Themes OK: ${THEMES.length} themes, ${pairCount} contrast pairs`)
