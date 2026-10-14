import { useEffect, useId, useRef } from 'react'
import { CHECKIN_STEPS, HABIT_QUESTION_NOUN } from '../../../constants/pet'
import './CheckInActions.css'

/**
 * MPP-21: the controls under Pip's check-in question, inside his speech bubble (AC 5:
 * nothing outside the room). Ask step: No 🙌 / Yes / Not now. When step: a labelled date
 * input (today by default, coversFrom … today) with Save and Back.
 * After the user's own action, focus moves to the new step's first control; it is never
 * stolen when the first question appears on load.
 */
function CheckInActions({ step, habit, coversFrom, todayISO, busy, focusFirst, onNo, onYes, onNotNow, onBack, onSave }) {
  const firstRef = useRef(null)
  const inputId = `pip-checkin-date-${useId().replace(/:/g, '')}`

  useEffect(() => {
    if (focusFirst) firstRef.current?.focus()
  }, [step, habit, focusFirst])

  if (step === CHECKIN_STEPS.WHEN) {
    const handleSubmit = (event) => {
      event.preventDefault()
      onSave(event.currentTarget.elements.lapseDate.value)
    }
    return (
      <form className="pip-checkin-actions" onSubmit={handleSubmit}>
        <label className="pip-checkin-sr" htmlFor={inputId}>{`Day you had ${HABIT_QUESTION_NOUN[habit]}`}</label>
        <input
          key={habit}
          ref={firstRef}
          id={inputId}
          name="lapseDate"
          className="pip-checkin-date"
          type="date"
          min={coversFrom}
          max={todayISO}
          defaultValue={todayISO}
          required
        />
        <button type="submit" className="pip-checkin-btn pip-checkin-btn--primary" disabled={busy}>Save</button>
        <button type="button" className="pip-checkin-btn pip-checkin-btn--link" disabled={busy} onClick={onBack}>Back</button>
      </form>
    )
  }

  return (
    <div className="pip-checkin-actions" role="group" aria-label={`Did you have any ${HABIT_QUESTION_NOUN[habit]}?`}>
      <button ref={firstRef} type="button" className="pip-checkin-btn pip-checkin-btn--primary" disabled={busy} onClick={onNo}>
        No 🙌
      </button>
      <button type="button" className="pip-checkin-btn" disabled={busy} onClick={onYes}>Yes</button>
      <button type="button" className="pip-checkin-btn pip-checkin-btn--link" disabled={busy} onClick={onNotNow}>Not now</button>
    </div>
  )
}

export default CheckInActions
