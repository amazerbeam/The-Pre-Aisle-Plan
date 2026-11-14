import { MEAL_TYPE_LABELS } from '../../constants/mealTypes'
import { formatLongWeekday } from '../../utils/dateUtils'
import './MealEatenSection.css'

/**
 * MPP-12: end-of-recipe "Mark as eaten" section, rendered by RecipeViewModal only when it was
 * opened from a meal-plan entry. Reads the entry live from MealPlanContext so the optimistic
 * flip, the server reconcile and any rollback all show while the modal stays open (AC 3).
 * The tick is the viewer's own (MPP-33); a linked partner's tick never shows here. Once eaten, a second tap does nothing;
 * Undo is the link in the meta line (approved mockup).
 * MPP-34: once the server confirms a counted tick (today/yesterday), the button holds "✓ Eaten"
 * for a beat and the app moves to Pip's room, where MPP-18 cooks it. Undo cancels the move.
 * The save path lives in useMealEatenSave (shared with the plan bar); the modal owns that hook
 * and passes it down as `eatenSave`.
 */
function MealEatenSection({ entryId, eatenSave }) {
  const { entry, eaten, save, saving, error } = eatenSave
  if (!entry) return null

  const headingId = `eaten-slot-${entryId}`
  const slotLabel = `${formatLongWeekday(entry.planDate)} · ${MEAL_TYPE_LABELS[entry.mealType] ?? entry.mealType}`

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
