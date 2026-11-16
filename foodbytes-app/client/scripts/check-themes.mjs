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
  for (let hops = 0; hops < 5; hops += 1) {
    const ref = value?.match(/^var\((--[\w-]+)\)$/)
    if (!ref) break
    value = tokens[ref[1]]
  }
  return value
}

// '#rgb' | '#rrggbb' | 'rgb(r, g, b)' | 'rgba(r, g, b, a)' → { rgb: [0-1 × 3], a }; anything else (a gradient) → null
const parseColour = (value) => {
  if (value?.startsWith('#')) {
    let h = value.slice(1)
    if (h.length === 3) h = [...h].map((c) => c + c).join('')
    return { rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255), a: 1 }
  }
  const m = value?.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/)
  return m ? { rgb: [m[1], m[2], m[3]].map((n) => Number(n) / 255), a: m[4] === undefined ? 1 : Number(m[4]) } : null
}
// Alpha-composite `top` onto an opaque `under` (sRGB, as browsers paint).
const flatten = (top, under) => ({ rgb: top.rgb.map((c, i) => c * top.a + under.rgb[i] * (1 - top.a)), a: 1 })
const luminance = ({ rgb }) => {
  const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
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

// Pip's room UI (MPP-45), from pip-room-chrome.html pairs[]: [fg, bg, min, over?]. `over` is the opaque token a
// translucent bg is flattened onto before the contrast maths. The same pairs run in every theme.
const PET_PAIRS = [
  ['text-primary', 'bg-primary', 4.5],
  ['text-primary', 'pet-balance-bg', 4.5],
  ['text-primary', 'pet-card-bg', 4.5],
  ['brand-primary', 'bg-primary', 4.5],
  ['brand-primary', 'pet-hover-bg', 4.5],
  ['brand-primary', 'pet-press-bg', 4.5],
  ['brand-primary', 'pet-chip-content-bg', 4.5, 'bg-primary'],
  ['text-secondary', 'bg-primary', 4.5],
  ['text-secondary', 'pet-wardrobe-lineup-bg', 4.5],
  ['pet-muted-text', 'bg-primary', 4.5],
  ['pet-muted-text', 'pet-card-bg', 4.5],
  ['pet-soft-text', 'bg-primary', 4.5],
  ['pet-soft-text', 'pet-float-bg', 4.5, 'bg-primary'],
  ['pet-label-text', 'bg-primary', 4.5],
  ['pet-accent-color', 'bg-primary', 4.5],
  ['pet-accent-color', 'pet-card-bg', 3],
  ['pip-focus-ring', 'bg-primary', 3],
  ['pip-focus-ring', 'pet-card-bg', 3],
  ['on-brand', 'pet-accent-color', 4.5],
  ['on-brand', 'brand-primary', 4.5],
  ['pet-scrim-text', 'pet-scrim-bg', 4.5, 'bg-primary'],
  ['pet-scrim-text', 'pet-tag-bg', 4.5, 'bg-primary'],
  ['pet-scrim-error-text', 'pet-scrim-bg', 4.5, 'bg-primary'],
  ['pet-gold-text', 'pet-gold-bg', 4.5],
  ['pet-notice-text', 'pet-notice-bg', 4.5],
  ['pet-success-text', 'pet-success-bg', 4.5],
  ['pet-success-text', 'pet-card-bg', 4.5],
  ['pet-error-text', 'pet-card-bg', 4.5],
  ['pet-error-text', 'danger-hover-bg', 4.5, 'bg-primary'],
  ['pet-wardrobe-error-text', 'danger-hover-bg', 4.5, 'bg-primary'],
  ['pet-warn-text', 'pet-card-bg', 4.5],
  ['pet-wardrobe-text', 'pet-wardrobe-lineup-bg', 4.5],
  ['macro-on-target-pill-text', 'macro-on-target-pill-bg', 4.5, 'bg-primary'],
  ['macro-near-target-pill-text', 'macro-near-target-pill-bg', 4.5, 'bg-primary'],
  ['pet-chip-mischievous-text', 'pet-chip-mischievous-bg', 4.5, 'bg-primary'],
  ['macro-over-target-pill-text', 'bg-primary', 4.5],
]

const PAIRS = {
  default: [
    ...on(['text-primary', 'text-secondary'], ['bg-primary', 'bg-secondary'], 4.5),
    ['on-brand', 'brand-primary', 4.5],
    ...PET_PAIRS,
  ],
  cyberpunk: [
    ...on(['ink', 'muted', 'pink', 'cyan', 'yellow', 'lime', 'red'], ['panel', 'raised'], 4.5),
    ...on(['ink', 'muted', 'pink', 'yellow'], CARD_TEAL, 4.5),
    ...on(['ink', 'muted', 'yellow'], CARD_PLAN, 4.5),
    ...on(['void'], ['pink', 'cyan', 'yellow', 'lime', 'orange', 'red'], 4.5),
    ['paper-ink', 'paper', 4.5],
    ['line', 'panel', 3.0],
    ...AISLES.map((a) => [`aisle-${a}`, 'paper', 3.0]),
    ...PET_PAIRS,
  ],
  parchment: [
    ...on(['text-primary', 'text-secondary', 'brand-primary'], ['bg-primary', 'bg-secondary'], 4.5),
    ['on-brand', 'brand-primary', 4.5],
    ...on(['leather-ink', 'gold'], ['leather'], 4.5),
    ['focus-ink', 'page', 3.0],
    ...AISLES.map((a) => [`aisle-${a}`, 'page', 3.0]),
    ...PET_PAIRS,
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
  for (const [fg, bg, min, over] of PAIRS[theme.id] ?? []) {
    const raw = { fg: resolve(tokens, fg), bg: resolve(tokens, bg), ...(over ? { over: resolve(tokens, over) } : {}) }
    const parsed = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, parseColour(value)]))
    const names = { fg, bg, over }
    const missing = Object.keys(raw).filter((key) => !parsed[key])
    if (missing.length > 0) {
      missing.forEach((key) => failures.push(`MISSING --${names[key]} in ${theme.id}`))
      continue
    }
    let bgColour = parsed.bg
    if (bgColour.a < 1) {
      if (!parsed.over) {
        failures.push(`MISSING over for translucent --${bg} in ${theme.id}`)
        continue
      }
      bgColour = flatten(bgColour, parsed.over)
    }
    const fgColour = parsed.fg.a < 1 ? flatten(parsed.fg, bgColour) : parsed.fg
    pairCount += 1
    const ratio = contrast(fgColour, bgColour)
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
