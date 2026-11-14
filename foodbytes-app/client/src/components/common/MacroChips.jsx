import { evaluateMacro, hasUsableMacros, deriveKcal } from '../../utils/macroStatus'
import { DAILY_MACRO_TARGETS, KCAL_PER_GRAM } from '../../constants/macroTargets'
import './MacroChips.css'

/**
 * Labelled P / C / F chips in the directional traffic-light colours (under/near/on/over).
 * kcal is deliberately not judged. `variant`: 'light' (default), 'onDark' (purple headers), 'large',
 * 'header' (white pills with a status dot, for the recipe view). With `onChipClick(key)` each chip
 * is a button (the recipe view opens the target popup from it); otherwise a plain span.
 */
function MacroChips({ macros, targets = DAILY_MACRO_TARGETS, variant = 'light', onChipClick }) {
  if (!hasUsableMacros(macros)) return null
  const kcal = deriveKcal(macros)
  const pct = (g, perG) => Math.round((g * perG / kcal) * 100)
  const chips = [
    { key: 'protein', text: `P ${Math.round(macros.protein)}g`, name: 'Protein' },
    { key: 'carbs', text: `C ${pct(macros.carbs, KCAL_PER_GRAM.carbs)}%`, name: 'Carbs' },
    { key: 'fat', text: `F ${pct(macros.fat, KCAL_PER_GRAM.fat)}%`, name: 'Fat' }
  ]
  return (
    <span className={`macro-chips macro-chips--${variant}`}>
      {chips.map(c => {
        const status = evaluateMacro(macros, c.key, targets).status
        const label = `${c.name} ${c.text.slice(2)}, ${status} target`
        if (!onChipClick) {
          return (
            <span key={c.key} className={`macro-chip macro-chip--${status}`} aria-label={label}>
              {c.text}
            </span>
          )
        }
        return (
          <button
            key={c.key}
            type="button"
            className={`macro-chip macro-chip--${status} macro-chip--button`}
            aria-label={`${label}, show target`}
            onClick={() => onChipClick(c.key)}
          >
            {c.text}
          </button>
        )
      })}
    </span>
  )
}

export default MacroChips
