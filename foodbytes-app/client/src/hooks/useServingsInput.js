import { useState, useCallback } from 'react'
import { parseServings, formatServings } from '../utils/servingsUtils'
import { DEFAULT_SERVINGS } from '../constants/servings'

/**
 * State for a free-text decimal servings control.
 *
 * Keeps two values in step:
 * - `servings` — the number used for scaling, always a valid value inside
 *   [MIN_SERVINGS, MAX_SERVINGS] at 2dp (clamped by `parseServings`).
 * - `servingsDisplay` — a string buffer, so a partially-typed value ("0.")
 *   does not clobber the number behind it.
 *
 * Unparseable input leaves `servings` on its last valid value rather than
 * surfacing an error; `handleServingsBlur` then restores the display to it.
 *
 * @param {number} initialServings - Starting servings value
 * @returns {{
 *   servings: number,
 *   servingsDisplay: string,
 *   handleServingsChange: (event: Object) => void,
 *   handleServingsBlur: () => void,
 *   resetServings: (value: number|string|null) => void
 * }}
 */
export default function useServingsInput(initialServings) {
  const [servings, setServings] = useState(initialServings)
  const [servingsDisplay, setServingsDisplay] = useState(formatServings(initialServings))

  const handleServingsChange = (e) => {
    const inputValue = e.target.value
    setServingsDisplay(inputValue)

    // Only update the actual servings when the input reads as a valid number
    const parsed = parseServings(inputValue)
    if (parsed !== null) {
      setServings(parsed)
    }
  }

  // Restore the display to the actual value if empty or unparseable
  const handleServingsBlur = () => {
    if (parseServings(servingsDisplay) === null) {
      setServingsDisplay(formatServings(servings))
    }
  }

  /**
   * Replace both values at once — for navigation, where the servings shown must
   * jump to another recipe's default. Call from an effect, never during render.
   *
   * Stable identity (`useCallback` with no deps — `useState` setters never change)
   * so callers can list it in an effect dependency array without the effect
   * re-firing every render. This mirrors `useRecipeNavigationStack`'s `reset`.
   * It is not a performance memo — it exists for dependency correctness.
   *
   * The value is normalised through `parseServings`, so an absent or unparseable
   * input lands on DEFAULT_SERVINGS instead of reaching the scaling arithmetic
   * and rendering NaN against every ingredient row.
   */
  const resetServings = useCallback((value) => {
    const parsed = parseServings(value)
    const next = parsed === null ? DEFAULT_SERVINGS : parsed
    setServings(next)
    setServingsDisplay(formatServings(next))
  }, [])

  return { servings, servingsDisplay, handleServingsChange, handleServingsBlur, resetServings }
}
