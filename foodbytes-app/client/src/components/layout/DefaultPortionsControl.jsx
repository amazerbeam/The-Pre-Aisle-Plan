import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { MIN_SERVINGS, MAX_SERVINGS, SERVINGS_STEP, RECIPE_DEFAULT_SERVINGS } from '../../constants/servings'
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

  // AC 9: "never set" — the input still needs a starting number so it isn't
  // blank, but that number is a placeholder, not a saved choice. isUnset drives
  // a subdued style so it reads differently from a real value.
  const isUnset = defaultServings === null || defaultServings === undefined

  // What an unset preference previews: the portion count recipes actually open
  // at (2), not MIN_SERVINGS — 0.25 is the validation floor and previews nothing.
  const placeholderServings = RECIPE_DEFAULT_SERVINGS

  const [display, setDisplay] = useState(formatServings(defaultServings ?? placeholderServings))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  // Whether the user has actually edited the input this session. Necessary
  // because "did they change it?" CANNOT be inferred by comparing the typed
  // value to the placeholder: typing the placeholder's own number is a real
  // choice, and equality would silently discard it. That bug was invisible while
  // the placeholder was 0.25; at 2 it would eat the most likely value there is.
  const [touched, setTouched] = useState(false)

  const persist = async (value) => {
    setSaving(true)
    setError(null)
    try {
      await saveDefaultServings(value)
      setDisplay(formatServings(value))
      setTouched(false)
    } catch (err) {
      // Surface the server's message; fall back to status only when there is no
      // body. Never swallow into a success shape — a failed save must not look
      // like a saved preference.
      const serverMessage = err?.response?.data?.error
      setError(serverMessage || 'Could not save. Try again.')
      setDisplay(formatServings(defaultServings ?? placeholderServings))
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    setTouched(true)
    setDisplay(e.target.value)
  }

  const handleBlur = () => {
    // Untouched: the number on screen is the placeholder the user never edited,
    // so there is nothing to save. Blurring past the field (tabbing to Sign Out)
    // must never persist a preference on its own.
    if (!touched) {
      setDisplay(formatServings(defaultServings ?? placeholderServings))
      return
    }
    const parsed = parseServings(display)
    if (parsed === null) {
      setDisplay(formatServings(defaultServings ?? placeholderServings))
      setTouched(false)
      return
    }
    // Edited back to the already-saved value is a genuine no-op — but only when a
    // value IS saved. While unset, any typed number is new information, including
    // one equal to the placeholder.
    if (!isUnset && parsed === defaultServings) {
      setDisplay(formatServings(parsed))
      setTouched(false)
      return
    }
    persist(parsed)
  }

  const adjust = (delta) => {
    const next = stepServings(defaultServings ?? placeholderServings, delta)
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
          disabled={saving || (defaultServings ?? placeholderServings) <= MIN_SERVINGS}
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
          disabled={saving || (defaultServings ?? placeholderServings) >= MAX_SERVINGS}
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
