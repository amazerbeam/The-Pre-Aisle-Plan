import { useState, useCallback } from 'react'

/**
 * FR-092: Hook for managing recipe navigation stack.
 * Enables navigating between linked recipes (e.g., Pizza → Pizza Sauce → Pesto)
 * with back navigation support.
 *
 * Usage:
 *   const { currentRecipe, stack, push, pop, reset, canGoBack, previousRecipeName } = useRecipeNavigationStack(initialRecipe)
 *
 * @param {Object} initialRecipe - The root recipe to start with
 * @returns {Object} Navigation state and methods
 */
function useRecipeNavigationStack(initialRecipe) {
  // Stack of recipes - index 0 is the root, last item is current
  const [stack, setStack] = useState(initialRecipe ? [initialRecipe] : [])

  /**
   * Push a new recipe onto the stack (navigate to linked recipe)
   * @param {Object} recipe - The recipe to navigate to
   */
  const push = useCallback((recipe) => {
    if (!recipe) return
    setStack(prev => [...prev, recipe])
  }, [])

  /**
   * Pop the top recipe off the stack (go back)
   * @returns {Object|null} The popped recipe, or null if at root
   */
  const pop = useCallback(() => {
    let popped = null
    setStack(prev => {
      if (prev.length <= 1) return prev // Can't pop the root
      popped = prev[prev.length - 1]
      return prev.slice(0, -1)
    })
    return popped
  }, [])

  /**
   * Reset the stack to a new initial recipe
   * @param {Object} recipe - The new root recipe
   */
  const reset = useCallback((recipe) => {
    setStack(recipe ? [recipe] : [])
  }, [])

  /**
   * Clear the entire stack
   */
  const clear = useCallback(() => {
    setStack([])
  }, [])

  // Current recipe is the top of the stack
  const currentRecipe = stack.length > 0 ? stack[stack.length - 1] : null

  // Can go back if there's more than one item in the stack
  const canGoBack = stack.length > 1

  // Previous recipe name (for back button label)
  const previousRecipeName = stack.length > 1 ? stack[stack.length - 2]?.name : null

  // Breadcrumb trail of recipe names
  const breadcrumbs = stack.map(r => r?.name).filter(Boolean)

  return {
    currentRecipe,
    stack,
    push,
    pop,
    reset,
    clear,
    canGoBack,
    previousRecipeName,
    breadcrumbs,
    depth: stack.length
  }
}

export default useRecipeNavigationStack
