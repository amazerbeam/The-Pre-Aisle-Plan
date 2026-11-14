import useServingsInput from '../../hooks/useServingsInput'
import { parseServings, stepServings } from '../../utils/servingsUtils'
import { MIN_SERVINGS, MAX_SERVINGS, SERVINGS_STEP } from '../../constants/servings'
import MealPlanSheet from './MealPlanSheet'

/**
 * Change how many people a planned meal is for. Calls onSave(entry, servings), then closes.
 * Save is disabled while the typed value can't be read as a number.
 */
function ServingsSheet({ entry, onSave, onClose }) {
  const { servings, servingsDisplay, handleServingsChange, handleServingsBlur, resetServings } =
    useServingsInput(entry.servings)

  const parsed = parseServings(servingsDisplay)
  const step = (delta) => resetServings(stepServings(parsed ?? servings, delta))

  const save = () => {
    onSave(entry, parsed)
    onClose()
  }

  return (
    <MealPlanSheet title={`Servings: ${entry.recipe?.name ?? 'meal'}`} onClose={onClose}>
      <div className="servings-sheet-row">
        <button
          type="button"
          className="servings-sheet-step"
          onClick={() => step(-SERVINGS_STEP)}
          disabled={parsed !== null && parsed <= MIN_SERVINGS}
          aria-label="Fewer people"
        >
          −
        </button>
        <input
          type="text"
          inputMode="decimal"
          className="servings-sheet-input"
          value={servingsDisplay}
          onChange={handleServingsChange}
          onBlur={handleServingsBlur}
          aria-label="Number of people"
        />
        <button
          type="button"
          className="servings-sheet-step"
          onClick={() => step(SERVINGS_STEP)}
          disabled={parsed !== null && parsed >= MAX_SERVINGS}
          aria-label="More people"
        >
          +
        </button>
      </div>
      {parsed === null && (
        <p className="servings-sheet-error" role="alert">
          Enter a number from {MIN_SERVINGS} to {MAX_SERVINGS}.
        </p>
      )}
      <button type="button" className="servings-sheet-save" onClick={save} disabled={parsed === null}>
        Save
      </button>
    </MealPlanSheet>
  )
}

export default ServingsSheet
