const FRACTIONS = [[0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾']]
const WHOLE_UNITS = new Set(['g', 'ml'])
const ONE_DP_UNITS = new Set(['kg', 'l'])
const TOLERANCE = 0.05

/** Display-only quantity: fractions for spoons/counts, whole numbers for g/ml, 1 dp for kg/l. */
export function formatQuantity(value, unit = '') {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  const u = String(unit).trim().toLowerCase()
  if (WHOLE_UNITS.has(u)) return String(Math.round(n))
  if (ONE_DP_UNITS.has(u)) return String(Math.round(n * 10) / 10)
  const whole = Math.floor(n + TOLERANCE)
  const rest = n - whole
  if (Math.abs(rest) < TOLERANCE) return String(whole)
  const hit = FRACTIONS.find(([f]) => Math.abs(rest - f) < TOLERANCE)
  if (hit) return `${whole || ''}${hit[1]}`
  return String(Math.round(n * 100) / 100)
}
