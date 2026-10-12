import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { MEAL_TIME_KEYS, MEAL_TIME_LABELS, MEAL_TIMES_ORDER_ERROR } from '../../constants/mealTimes'
import { isStrictlyOrdered, pickMealTimes } from '../../utils/mealTimesUtils'
import './MealTimesControl.css'

const SAVE_FALLBACK_ERROR = 'Could not save. Try again.'

/**
 * MPP-13: "Meal times" in the account menu, under Default portions.
 *
 * The server sends the EFFECTIVE times (defaults applied) and `custom`, so this
 * component holds no defaults of its own. A changed time is saved on blur, all
 * three together; an out-of-order set is flagged inline and never sent (AC 4).
 * Visual contract: the approved mpp13-meal-times-mockup.html.
 *
 * Rendered only for authenticated users (Header mounts it inside the signed-in
 * branch). Renders nothing if the server sent no mealTimes — a frontend deployed
 * ahead of its backend degrades to "no section", not a crash.
 */
function MealTimesControl() {
  const { mealTimes, saveMealTimes } = useAuth()
  const [draft, setDraft] = useState(() => pickMealTimes(mealTimes))
  const [invalidKey, setInvalidKey] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Re-seed from the saved values only when they actually change. Keyed on the
  // values, not the object: saving Default portions replaces `user`, and an
  // identity-keyed effect would wipe a half-fixed out-of-order edit here.
  const savedKey = MEAL_TIME_KEYS.map((key) => mealTimes?.[key]).join('|')
  useEffect(() => {
    setDraft(pickMealTimes(mealTimes))
  }, [savedKey])

  if (!mealTimes) return null

  const saved = pickMealTimes(mealTimes)
  const clearFeedback = () => {
    setInvalidKey(null)
    setError(null)
  }

  const persist = async (next) => {
    setSaving(true)
    clearFeedback()
    try {
      await saveMealTimes(next)
    } catch (err) {
      // Surface the server's message; never let a failed save look saved.
      setError(err?.response?.data?.error || SAVE_FALLBACK_ERROR)
      setDraft(saved)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key) => (e) => {
    setDraft((current) => ({ ...current, [key]: e.target.value }))
  }

  const handleBlur = (key) => () => {
    if (!draft[key]) {
      setDraft(saved)
      clearFeedback()
      return
    }
    if (MEAL_TIME_KEYS.every((k) => draft[k] === saved[k])) {
      clearFeedback()
      return
    }
    if (!isStrictlyOrdered(draft)) {
      setInvalidKey(key)
      setError(MEAL_TIMES_ORDER_ERROR)
      return
    }
    persist(draft)
  }

  const inputClass = (key) => {
    let className = 'meal-times-input'
    if (!mealTimes.custom && draft[key] === saved[key]) className += ' meal-times-input--default'
    if (invalidKey === key) className += ' meal-times-input--invalid'
    return className
  }

  return (
    <div className="meal-times" role="group" aria-labelledby="meal-times-heading">
      <span className="meal-times-label" id="meal-times-heading">Meal times</span>

      {MEAL_TIME_KEYS.map((key) => (
        <div className="meal-times-row" key={key}>
          <label className="meal-times-row-label" htmlFor={`meal-times-${key}`}>
            {MEAL_TIME_LABELS[key]}
          </label>
          <input
            id={`meal-times-${key}`}
            className={inputClass(key)}
            type="time"
            value={draft[key]}
            onChange={handleChange(key)}
            onBlur={handleBlur(key)}
            disabled={saving}
            aria-invalid={invalidKey === key || undefined}
            aria-describedby={error ? 'meal-times-error' : undefined}
          />
        </div>
      ))}

      {error && (
        <span className="meal-times-error" id="meal-times-error" role="alert">
          {error}
        </span>
      )}

      <button
        type="button"
        className="meal-times-reset"
        onClick={() => persist(null)}
        disabled={saving || !mealTimes.custom}
      >
        Reset to defaults
      </button>
    </div>
  )
}

export default MealTimesControl
