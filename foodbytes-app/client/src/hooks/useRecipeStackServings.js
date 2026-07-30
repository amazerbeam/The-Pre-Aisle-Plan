import { useCallback, useEffect, useRef } from 'react'
import { recipeService } from '../services/recipeService'
import useRecipeNavigationStack from './useRecipeNavigationStack'
import { DEFAULT_SERVINGS } from '../constants/servings'

/**
 * FR-092, FR-095: Owns the linked-recipe navigation stack, and keeps the
 * displayed recipe and its servings in step as the user navigates it
 * (e.g. Pizza -> Pizza Sauce -> Pesto) and back again.
 *
 * Three responsibilities live here, because they are facets of the same bug:
 *
 * 1. **The navigation stack itself** — wraps `useRecipeNavigationStack`, so
 *    the modal never has to reach past this hook to know what's on top of
 *    the stack or whether Back is available.
 * 2. **Sync effect** — when the top of the stack changes (a push or pop),
 *    mirror it into the modal's `fullRecipe` / `currentRecipeName` state,
 *    and reset servings to the right value:
 *    - the root recipe's servings comes back from `rootServingsRef` (the
 *      caller's planned value — a meal plan entry's servings, or the recipe
 *      card's picker), never from `defaultServings`.
 *    - a linked recipe (FR-095) gets its own `defaultServings` — it is an
 *      independent recipe, not a scaled fraction of the root.
 * 3. **`handleLinkedStepClick`** — fetches the clicked linked recipe, snapshots
 *    the root's servings into `rootServingsRef` (via `captureRootServings`,
 *    see below) if we're leaving the root, then pushes onto the stack.
 *    Guarded so a push from one linked recipe to a deeper one (depth 2 -> 3)
 *    cannot clobber the root's remembered value.
 *
 * ## Why seeded from `recipeId`, not from the stack's current recipe
 *
 * `prevStackRecipeId` (and therefore the "is this a real navigation event"
 * check in the sync effect below) is seeded from the `recipeId` PROP, not
 * from the stack's current recipe id. On first render `fullRecipe` is still
 * null, so the navigation stack is empty and its current recipe reads
 * `undefined`. Seeding from the stack instead would make its *first*
 * population (the initial fetch resolving) look like a navigation event and
 * reset the caller's servings to the recipe's default — the bug where a meal
 * plan entry planned at 3 servings opened at 2.
 *
 * ## Invariant: `recipeId` must be stable for the life of the mount
 *
 * `prevStackRecipeId` and `rootServingsRef` are both seeded once, via
 * `useRef`, from the `recipeId` / `initialServings` values present on the
 * FIRST render of this hook. `RecipeViewModal` currently guarantees this
 * because `onSelectVariant` is never invoked — `handleVariantSelect`
 * deliberately fetches the variant recipe in place instead of calling
 * `onSelectVariant`, specifically to avoid an unmount/remount of the modal.
 * If a future change wires `onSelectVariant` up to change the `recipeId`
 * prop while the same modal instance stays mounted, both refs go stale and
 * the original servings-revert bug returns in a new guise. Whoever makes
 * that change must re-derive `prevStackRecipeId` and `rootServingsRef` from
 * the new prop values at the same time (or key the modal on `recipeId` so it
 * remounts instead of updating in place).
 *
 * @param {Object} params
 * @param {string|number} params.recipeId - Root recipe id prop; must stay stable for the mount (see invariant above).
 * @param {number} params.initialServings - The caller's planned servings for the root recipe.
 * @param {Object|null} params.fullRecipe - The modal's currently displayed recipe; seeds the navigation stack.
 * @param {number} params.currentServings - Live servings value from `useServingsInput`; mirrored into a ref so `captureRootServings` reads the latest value, not a stale closure (see below).
 * @param {(value: number|string|null) => void} params.resetServings - Stable setter from `useServingsInput`.
 * @param {(recipe: Object) => void} params.setFullRecipe - `useState` setter (referentially stable) for the displayed recipe.
 * @param {(name: string) => void} params.setCurrentRecipeName - `useState` setter (referentially stable) for the displayed recipe's name.
 * @returns {{
 *   handleLinkedStepClick: (linkedRecipeId: string|number) => Promise<void>,
 *   popRecipe: () => Object|null,
 *   resetStack: (recipe: Object) => void,
 *   canGoBack: boolean,
 *   previousRecipeName: string|null,
 *   breadcrumbs: string[]
 * }}
 */
export default function useRecipeStackServings({
  recipeId,
  initialServings,
  fullRecipe,
  currentServings,
  resetServings,
  setFullRecipe,
  setCurrentRecipeName
}) {
  const {
    currentRecipe: stackRecipe,
    push: pushRecipe,
    pop: popRecipe,
    reset: resetStack,
    canGoBack,
    previousRecipeName,
    breadcrumbs
  } = useRecipeNavigationStack(fullRecipe)

  // Seeded once from props on mount - see "Why seeded from recipeId" above.
  const prevStackRecipeId = useRef(recipeId)

  // The root recipe's servings belongs to the caller (a meal plan entry's
  // planned servings, or the recipe card's picker) — never `defaultServings`.
  // Held in a ref so back-navigation can restore it; refreshed on the way out
  // via `captureRootServings` so Back restores what was last on screen.
  const rootServingsRef = useRef(initialServings)

  // `currentServings` and `canGoBack` are read by `captureRootServings` after
  // an `await` in `handleLinkedStepClick` resolves, so the values closed over
  // at call time can be stale if the user edits servings (or the stack depth
  // changes) while the linked-recipe fetch is in flight. Mirror both into
  // refs that always hold the latest value, so `captureRootServings` can
  // stay a zero-dependency `useCallback` and still read live data instead of
  // a stale render's closure.
  const liveServingsRef = useRef(currentServings)
  useEffect(() => { liveServingsRef.current = currentServings }, [currentServings])

  const liveCanGoBackRef = useRef(canGoBack)
  useEffect(() => { liveCanGoBackRef.current = canGoBack }, [canGoBack])

  useEffect(() => {
    if (!stackRecipe || stackRecipe.id === prevStackRecipeId.current) return
    prevStackRecipeId.current = stackRecipe.id
    setFullRecipe(stackRecipe)
    setCurrentRecipeName(stackRecipe.name)
    // FR-095: a linked recipe gets its own default; the root gets the caller's value
    resetServings(
      stackRecipe.id === recipeId
        ? rootServingsRef.current
        : stackRecipe.defaultServings || DEFAULT_SERVINGS
    )
  }, [stackRecipe, recipeId, resetServings, setFullRecipe, setCurrentRecipeName])

  // Snapshot the root recipe's servings into `rootServingsRef` right before
  // navigating to a linked recipe, so Back restores what was last on screen.
  // Guarded on `!canGoBack` (read live via a ref, not closed over) so a push
  // from one linked recipe to a deeper one (depth 2 -> 3) cannot overwrite
  // the root's remembered value. Empty deps - both values it reads come from
  // refs, which never change identity - so it stays a stable dependency for
  // `handleLinkedStepClick` below.
  const captureRootServings = useCallback(() => {
    if (!liveCanGoBackRef.current) {
      rootServingsRef.current = liveServingsRef.current
    }
  }, [])

  /**
   * FR-092: Handle clicking a linked step to navigate to that recipe.
   */
  const handleLinkedStepClick = useCallback(async (linkedRecipeId) => {
    try {
      const linkedRecipe = await recipeService.getRecipeById(linkedRecipeId)
      captureRootServings()
      pushRecipe(linkedRecipe)
    } catch (err) {
      console.error('Failed to fetch linked recipe:', err)
    }
  }, [pushRecipe, captureRootServings])

  return { handleLinkedStepClick, popRecipe, resetStack, canGoBack, previousRecipeName, breadcrumbs }
}
