import { useState } from 'react'
import { parseServings, formatServings } from '../utils/servingsUtils'

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
 *   resetServings: (value: number) => void
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
   */
  const resetServings = (value) => {
    setServings(value)
    setServingsDisplay(formatServings(value))
  }

  return { servings, servingsDisplay, handleServingsChange, handleServingsBlur, resetServings }
}
