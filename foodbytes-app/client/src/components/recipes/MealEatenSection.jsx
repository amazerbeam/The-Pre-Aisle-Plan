import { useState } from 'react'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { useAuth } from '../../contexts/AuthContext'
import { usePet } from '../../contexts/PetContext'
import { MEAL_TYPE_LABELS } from '../../constants/mealTypes'
import { formatLongWeekday } from '../../utils/dateUtils'
import { shouldTakeToPip } from '../../utils/cookServe'
import useTakeToPip from '../../hooks/useTakeToPip'
import './MealEatenSection.css'

const SAVE_ERROR = "Couldn't save — try again."

/**
 * MPP-12: end-of-recipe "Mark as eaten" section, rendered by RecipeViewModal only when it was
 * opened from a meal-plan entry. Reads the entry live from MealPlanContext so the optimistic
 * flip, the server reconcile and any rollback all show while the modal stays open (AC 3).
 * The tick is the viewer's own (MPP-33); a linked partner's tick never shows here. Once eaten, a second tap does nothing;
 * Undo is the link in the meta line (approved mockup).
 * MPP-34: once the server confirms a counted tick (today/yesterday), the button holds "✓ Eaten"
 * for a beat and the app moves to Pip's room, where MPP-18 cooks it. Undo cancels the move.
 */
function MealEatenSection({ entryId }) {
  const { getEntryById, setEntryEaten } = useMealPlan()
  const { isAuthenticated } = useAuth()
  const { pet, todayISO, yesterdayISO, refreshPet } = usePet()
  const takeToPip = useTakeToPip()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const entry = getEntryById(entryId)
  if (!entry) return null

  const eaten = entry.eaten === true
  const headingId = `eaten-slot-${entryId}`
  const slotLabel = `${formatLongWeekday(entry.planDate)} · ${MEAL_TYPE_LABELS[entry.mealType] ?? entry.mealType}`

  const save = async (next) => {
    if (saving) return
    if (!next) takeToPip.cancel() // AC 4: Undo during the beat stays on the recipe
    setSaving(true)
    setError(null)
    try {
      await setEntryEaten(entryId, next)
      if (next) refreshPet() // MPP-25: the tick may have paid sprinkles; un-ticking never changes them
      // Resolved = the server confirmed (AC 1); a failure throws below and never navigates (AC 4).
      if (next && shouldTakeToPip({
        isAuthenticated,
        petReady: pet != null,
        mealType: entry.mealType,
        planDate: entry.planDate,
        todayISO,
        yesterdayISO
      })) {
        takeToPip.schedule()
      }
    } catch {
      // The context already rolled back and raised the toast; the toast can sit behind
      // this full-screen modal, so repeat the failure inline.
      setError(SAVE_ERROR)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="eaten-section" aria-labelledby={headingId}>
      <h3 id={headingId} className="eaten-slot">{slotLabel}</h3>
      <button
        type="button"
        className={`eaten-btn ${eaten ? 'on' : ''}`}
        onClick={() => { if (!eaten) save(true) }}
        disabled={saving}
        aria-pressed={eaten}
      >
        <span className="eaten-tick" aria-hidden="true">{eaten ? '✓' : ''}</span>
        <span>{eaten ? 'Eaten' : 'Mark as eaten'}</span>
      </button>
      <p className="eaten-meta" aria-live="polite">
        {error ? (
          <span className="eaten-error">{error}</span>
        ) : eaten ? (
          <>
            Eaten at {formatEatenTime(entry.eatenAt)} ·{' '}
            <button type="button" className="eaten-undo" onClick={() => save(false)} disabled={saving}>
              Undo
            </button>
          </>
        ) : null}
      </p>
    </section>
  )
}

// HH:MM in the viewer's local time; eatenAt is ISO-8601 UTC from the API.
const formatEatenTime = (iso) => (
  iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
)

export default MealEatenSection
