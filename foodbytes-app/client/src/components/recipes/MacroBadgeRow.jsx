import { useEffect, useState } from 'react'
import {
  MACRO_COPY,
  MACRO_KEYS,
  MACRO_TARGETS,
  REJECT_MARK,
  STATUS_ARROW,
  STATUS_WORD
} from '../../constants/macroTargets'
import { evaluateMacro, hasMealMacroTargets, hasUsableMacros } from '../../utils/macroStatus'
import MacroTargetPopup from './MacroTargetPopup'
import './MacroBadgeRow.css'

/**
 * FR-104: Per-serving P / C / F badges with a four-state traffic light.
 *
 * Colour is the DIRECTION of the miss (blue under / amber under-in-slack /
 * green on / red over), so it cannot also carry severity — a rejection is marked
 * with a separate ⚠. Tapping a badge opens MacroTargetPopup.
 *
 * Two cases render plain unlit badges instead of a verdict:
 *   - Component recipes (Extras-only: pesto, dough, pita) — the per-meal targets
 *     do not apply to them, so a verdict would be actively wrong.
 *   - Recipes whose macros are all zero — that is missing ingredient data, not a
 *     nutrition failure. See hasMealMacroTargets / hasUsableMacros.
 *
 * Extracted from RecipeViewModal rather than added inline: that file sits close
 * to the 400-line budget, and rule evaluation does not belong in a component.
 */
function MacroBadgeRow({ recipe, variantLabel, displayedCaloriesPerServing }) {
  const [openMacroKey, setOpenMacroKey] = useState(null)

  // Close any open popup when the underlying recipe changes. This component stays
  // mounted across fullRecipe swaps (variant select, linked-recipe navigation), so
  // without it openMacroKey survives into a different recipe: the popup unmounts
  // with no user action if the new recipe takes a plain branch, then springs back
  // open — and steals focus — when navigation returns. Declared above the early
  // returns so the hook order stays unconditional.
  useEffect(() => {
    setOpenMacroKey(null)
  }, [recipe?.id])

  // Preserves the original guard: render nothing until the recipe has loaded.
  const hasAnyMacro = MACRO_KEYS.some((key) => recipe?.[key] != null)
  if (!hasAnyMacro) return null

  const macros = {
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat
  }

  // Components and no-data recipes get grams with no verdict — the pre-FR-104
  // presentation. Deliberately the same branch: in both cases the honest answer
  // is "these targets don't say anything about this", not a rejection.
  if (!hasMealMacroTargets(recipe) || !hasUsableMacros(macros)) {
    return (
      <div className="recipe-macros" aria-label="Macros per serving">
        {MACRO_KEYS.map((key) => (
          <span key={key} className="macro-badge macro-badge--plain">
            <strong>{MACRO_TARGETS[key].code}</strong>
            <span className="macro-value">{macros[key] ?? 0}g</span>
          </span>
        ))}
        <span className="macro-suffix">/ serving</span>
      </div>
    )
  }

  return (
    <>
      <div className="recipe-macros" aria-label="Macros per serving">
        {MACRO_KEYS.map((key) => {
          const target = MACRO_TARGETS[key]
          const { status, band, grams } = evaluateMacro(macros, key)
          const rejectPhrase = band.reject ? MACRO_COPY.REJECT_PHRASE : ''

          return (
            <button
              key={key}
              type="button"
              className={`macro-badge macro-badge--${status}`}
              onClick={(event) => {
                event.stopPropagation()
                setOpenMacroKey(key)
              }}
              aria-haspopup="dialog"
              aria-expanded={openMacroKey === key}
              aria-label={
                `${target.label} ${grams} grams per serving, `
                + `${STATUS_WORD[status].toLowerCase()}${rejectPhrase}. `
                + `Target ${target.perfect}. Tap for details.`
              }
            >
              <span className="macro-light" aria-hidden="true" />
              <strong>{target.code}</strong>
              <span className="macro-value">{grams}g</span>
              <span className="macro-arrow" aria-hidden="true">{STATUS_ARROW[status]}</span>
              {band.reject && (
                <span className="macro-reject" aria-hidden="true">{REJECT_MARK}</span>
              )}
            </button>
          )
        })}
        <span className="macro-suffix">/ serving</span>
      </div>

      {openMacroKey && (
        <MacroTargetPopup
          macroKey={openMacroKey}
          macros={macros}
          variantLabel={variantLabel}
          displayedCaloriesPerServing={displayedCaloriesPerServing}
          onClose={() => setOpenMacroKey(null)}
        />
      )}
    </>
  )
}

export default MacroBadgeRow
