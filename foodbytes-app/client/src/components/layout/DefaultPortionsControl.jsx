import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { MIN_SERVINGS, MAX_SERVINGS, SERVINGS_STEP } from '../../constants/servings'
import { parseServings, formatServings, stepServings } from '../../utils/servingsUtils'
import './DefaultPortionsControl.css'

/**
 * MPP-3: "Default portions" control in the account menu.
 *
 * Sets the starting value of every servings control in the app. Bounds and
 * precision come from constants/servings.js — the same MIN/MAX the backend
 * enforces on UserPreferencesUpdateRequest — so there is no second set of
 * bounds to drift (AC 2).
 *
 * Rendered only for authenticated users: guests have no user row, so there is
 * nowhere to persist the preference. Header only mounts this inside the
 * authenticated branch.
 */
function DefaultPortionsControl() {
  const { defaultServings, saveDefaultServings } = useAuth()

  // AC 9: "never set" — the input still needs a starting number (MIN_SERVINGS)
  // so it isn't blank, but that number is a placeholder, not a saved choice.
  // isUnset drives a subdued style so it reads differently from a real value.
  const isUnset = defaultServings === null || defaultServings === undefined

  const [display, setDisplay] = useState(formatServings(defaultServings ?? MIN_SERVINGS))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const persist = async (value) => {
    setSaving(true)
    setError(null)
    try {
      await saveDefaultServings(value)
      setDisplay(formatServings(value))
    } catch (err) {
      // Surface the server's message; fall back to status only when there is no
      // body. Never swallow into a success shape — a failed save must not look
      // like a saved preference.
      const serverMessage = err?.response?.data?.error
      setError(serverMessage || 'Could not save. Try again.')
      setDisplay(formatServings(defaultServings ?? MIN_SERVINGS))
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => setDisplay(e.target.value)

  const handleBlur = () => {
    const parsed = parseServings(display)
    if (parsed === null) {
      setDisplay(formatServings(defaultServings ?? MIN_SERVINGS))
      return
    }
    // Compare against the effective DISPLAYED value, not the raw preference.
    // When defaultServings is null (never set, AC 9), the input still shows
    // MIN_SERVINGS — blurring without editing must not silently persist that
    // placeholder as if the user had chosen it.
    if (parsed === (defaultServings ?? MIN_SERVINGS)) {
      setDisplay(formatServings(parsed))
      return
    }
    persist(parsed)
  }

  const adjust = (delta) => {
    const next = stepServings(defaultServings ?? MIN_SERVINGS, delta)
    if (next === defaultServings) return
    persist(next)
  }

  return (
    <div className="default-portions">
      <label className="default-portions-label" htmlFor="default-portions-input">
        Default portions
      </label>

      <div className="default-portions-stepper">
        <button
          type="button"
          className="default-portions-btn"
          onClick={() => adjust(-SERVINGS_STEP)}
          disabled={saving || (defaultServings ?? MIN_SERVINGS) <= MIN_SERVINGS}
          aria-label="Decrease default portions"
        >
          −
        </button>

        <input
          id="default-portions-input"
          className={`default-portions-input${isUnset ? ' default-portions-input--unset' : ''}`}
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={saving}
          aria-describedby={error ? 'default-portions-error' : undefined}
          aria-label={isUnset ? 'Default portions (not yet set)' : undefined}
        />

        <button
          type="button"
          className="default-portions-btn"
          onClick={() => adjust(SERVINGS_STEP)}
          disabled={saving || (defaultServings ?? MIN_SERVINGS) >= MAX_SERVINGS}
          aria-label="Increase default portions"
        >
          +
        </button>
      </div>

      {error && (
        <span className="default-portions-error" id="default-portions-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default DefaultPortionsControl
