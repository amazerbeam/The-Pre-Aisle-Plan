import { useHomemadeSelections } from '../contexts/HomemadeSelectionsContext'

/**
 * MPP-10: choices that decide homemade vs store-bought wording on linked steps. A planned meal
 * passes its own stored choices; anywhere else falls back to the dish default.
 */
export function useLinkedStepSelections(parentRecipeId, extraChoices) {
  const { getSelections } = useHomemadeSelections()
  if (extraChoices) return extraChoices
  return parentRecipeId ? getSelections(parentRecipeId) : {}
}

export default useLinkedStepSelections
