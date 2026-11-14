/**
 * Ingredients a step probably uses: the ingredient name's last word ("Chicken breast" → "breast"
 * and the first word "chicken") appears in the step text. A hint only; returns [] rather than guess.
 */
export function ingredientsForStep(stepText, ingredients) {
  const text = String(stepText || '').toLowerCase()
  return (ingredients || []).filter(ing => {
    const words = String(ing.name || '').toLowerCase().replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(w => w.length > 2)
    return words.some(w => new RegExp('\\b' + w.replace(/[^a-z]/g, '')).test(text))
  })
}

/** Step text as the cook should read it: the store-bought alternative when the extra is store-bought. */
export function stepDisplayText(step, isHomemade) {
  const s = typeof step === 'string' ? { instruction: step } : step
  const hasLink = s.linkedRecipeId != null
  return hasLink && !isHomemade(s.linkedRecipeId) && s.altInstruction ? s.altInstruction : s.instruction
}
