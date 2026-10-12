import { useNavigate } from 'react-router-dom'
import { MEAL_TYPE_LABELS } from '../../constants/mealTypes'
import { PET_SLOT_STATUS } from '../../constants/pet'

const STATUS_ICON = {
  [PET_SLOT_STATUS.LOGGED]: '✓',
  [PET_SLOT_STATUS.DUE]: '?',
  [PET_SLOT_STATUS.UPCOMING]: '·',
  [PET_SLOT_STATUS.UNPLANNED]: '–'
}

/**
 * MPP-14 AC 4: today's Breakfast / Lunch / Dinner. The tiles are deliberately not
 * interactive (logging happens in Meal Plan); the only action is the link button.
 */
function PetMealsCard({ slots }) {
  const navigate = useNavigate()

  return (
    <section className="pet-meals-card" aria-labelledby="pet-meals-heading">
      <h3 id="pet-meals-heading">Today's meals</h3>
      {slots.length === 0 ? (
        <p className="pet-meals-empty">Nothing to show for today yet.</p>
      ) : (
        <ul className="pet-meals">
          {slots.map(slot => (
            <li key={slot.mealType} className={`pet-meal pet-meal--${slot.status}`}>
              <b aria-hidden="true">{STATUS_ICON[slot.status]}</b>
              {MEAL_TYPE_LABELS[slot.mealType]}
              <small>{statusText(slot)}</small>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="pet-meals-link" onClick={() => navigate('/mealplan')}>
        Log meals in Meal Plan
      </button>
    </section>
  )
}

function statusText(slot) {
  switch (slot.status) {
    case PET_SLOT_STATUS.LOGGED: return 'Logged'
    case PET_SLOT_STATUS.DUE: return 'Not logged'
    case PET_SLOT_STATUS.UNPLANNED: return 'Not planned'
    default: return `By ${slot.byTime}`
  }
}

export default PetMealsCard
