import LinkedRecipeNavigation from './LinkedRecipeNavigation'
import PlanContextBar from './PlanContextBar'
import VariantSegment from './VariantSegment'
import MacroChips from '../common/MacroChips'
import { MACRO_TARGETS } from '../../constants/macroTargets'
import { MIN_SERVINGS, MAX_SERVINGS, SERVINGS_STEP } from '../../constants/servings'

/**
 * Sticky purple header of the recipe view: back navigation, title, plan context, variant switch,
 * servings stepper, macro chips and the keep-screen-on toggle. Presentational only; every value
 * and handler comes from RecipeViewModal.
 * `macros` is null while loading; `macrosJudged` false (component recipes, all-zero data) shows
 * plain grams with no traffic light, as the pre-redesign badge row did.
 */
function RecipeViewHeader({
  name, isCheat, nav, planEntry, eatenSave,
  variants, selectedVariantId, onSelectVariant, fallbackKcal,
  servings, servingsDisplay, onServingsInput, onServingsBlur, onServings,
  macros, macrosJudged, onMacroClick, wakeLock, onClose
}) {
  const people = servings === 1 ? 'person' : 'people'
  const step = (delta) => onServings(Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, servings + delta)))

  return (
    <header className="recipe-view-header">
      <LinkedRecipeNavigation
        canGoBack={nav.canGoBack}
        previousRecipeName={nav.previousRecipeName}
        breadcrumbs={nav.breadcrumbs}
        onBack={nav.onBack}
        showBreadcrumbs={false}
      />
      <div className="rv-title">
        <h2 className="recipe-title">{name}</h2>
        {isCheat && <span className="cheat-badge">Cheat</span>}
        <button type="button" className="close-button" onClick={onClose} aria-label="Close recipe">×</button>
      </div>

      {planEntry && !nav.canGoBack && <PlanContextBar entry={planEntry} eatenSave={eatenSave} />}

      <div className="rv-ctrl">
        <div className="rv-vseg">
          <VariantSegment
            variants={variants}
            selectedId={selectedVariantId}
            onSelect={onSelectVariant}
            fallbackKcal={fallbackKcal}
          />
        </div>
        <div className="rv-srv">
          <button type="button" onClick={() => step(-SERVINGS_STEP)} aria-label="Fewer servings">−</button>
          <span>
            <input
              type="number"
              inputMode="decimal"
              min={MIN_SERVINGS}
              max={MAX_SERVINGS}
              step={SERVINGS_STEP}
              value={servingsDisplay}
              onChange={onServingsInput}
              onBlur={onServingsBlur}
              className="servings-input"
              aria-label="Number of servings"
            />
            {people}
          </span>
          <button type="button" onClick={() => step(SERVINGS_STEP)} aria-label="More servings">+</button>
        </div>
      </div>

      <div className="rv-macros">
        {macros && (macrosJudged ? (
          <MacroChips macros={macros} targets={MACRO_TARGETS} variant="header" onChipClick={onMacroClick} />
        ) : (
          <span className="rv-macros-plain">
            P {macros.protein ?? 0}g · C {macros.carbs ?? 0}g · F {macros.fat ?? 0}g
          </span>
        ))}
        {macros && <span className="rv-macros-note">per serving</span>}
        {wakeLock.isSupported && (
          <button
            type="button"
            className={`rv-awake ${wakeLock.isLocked ? 'on' : ''}`}
            onClick={wakeLock.toggle}
            aria-pressed={wakeLock.isLocked}
          >
            🔆 {wakeLock.isLocked ? 'Screen stays on' : 'Keep screen on'}
          </button>
        )}
      </div>
    </header>
  )
}

export default RecipeViewHeader
