import { useEffect } from 'react'

// Module-level, deliberately: the lock coordinates a single shared DOM
// property (document.body.style.overflow) across independently-mounted
// popups. Two popups can be open at once (per-day local state in
// MealPlanDay, or a RecipeViewModal plus a macro popup), and without a
// shared count the second unmount restores the first lock's 'hidden'
// and leaves the page permanently unscrollable.
//
// This is not a "new global store" in the sense CLAUDE.md prohibits — that
// rule is about cross-cutting application state, which belongs in a Context.
// This is a reference count over one shared DOM property, the standard
// implementation of a scroll lock, and it cannot live in a Context without
// forcing every consumer to be wrapped in a provider.
let lockCount = 0
let previousOverflow = ''

/**
 * Locks background page scroll while `locked` is true.
 *
 * Reference-counted so overlapping locks nest correctly: the first lock
 * captures the pre-existing overflow value and the last unlock restores it.
 * Replaces the ad-hoc locks previously in RecipeViewModal.jsx and
 * ExtrasSelectionPopup.jsx, both of which now call this hook.
 *
 * @param {boolean} locked - true while the popup is open
 */
export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    lockCount += 1

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow
      }
    }
  }, [locked])
}

export default useBodyScrollLock
