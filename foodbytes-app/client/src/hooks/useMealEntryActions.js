import { useCallback, useEffect, useRef, useState } from 'react'
import { useMealPlan } from '../contexts/MealPlanContext'
import { getTodayISO } from '../utils/dateUtils'
import { isDayTickable } from '../utils/mealPlanDayUtils'
import { UNDO_REMOVE_MS, INFO_TOAST_MS } from '../constants/mealPlanUi'
import useToast from './useToast'

/**
 * Everything a meal card can do, shared by desktop (menu/drag) and mobile (swipe/sheets).
 * Remove is deferred UNDO_REMOVE_MS so Undo can cancel it; a pending delete is flushed
 * (sent at once) on unmount or when a second remove starts, so it is never lost.
 */
export default function useMealEntryActions() {
  const { setEntryEaten, removeEntry, updateEntry, assignRecipe } = useMealPlan()
  const [pendingRemovalIds, setPendingRemovalIds] = useState(() => new Set())
  const { toast, showToast, dismissToast } = useToast()
  const pending = useRef(null)                        // { entryId, timer }

  const clearPendingRemoval = useCallback((entryId) =>
    setPendingRemovalIds(ids => { const n = new Set(ids); n.delete(entryId); return n }), [])

  const commitRemoval = useCallback(async (entryId) => {
    try { await removeEntry(entryId) } finally { clearPendingRemoval(entryId) }
  }, [removeEntry, clearPendingRemoval])

  const flushPending = useCallback(() => {
    if (!pending.current) return
    clearTimeout(pending.current.timer)
    const { entryId } = pending.current
    pending.current = null
    commitRemoval(entryId).catch(() => {})   // removeEntry already surfaces the error state
  }, [commitRemoval])

  const requestRemove = useCallback((entry) => {
    flushPending()
    setPendingRemovalIds(ids => new Set(ids).add(entry.id))
    const timer = setTimeout(() => {
      pending.current = null
      commitRemoval(entry.id).catch(() => {})
    }, UNDO_REMOVE_MS)
    pending.current = { entryId: entry.id, timer }
    showToast(`Removed ${entry.recipe?.name ?? 'meal'}`, true, UNDO_REMOVE_MS)
  }, [flushPending, commitRemoval, showToast])

  const undoRemove = useCallback(() => {
    if (!pending.current) return
    clearTimeout(pending.current.timer)
    clearPendingRemoval(pending.current.entryId)
    pending.current = null
    dismissToast()
  }, [clearPendingRemoval, dismissToast])

  useEffect(() => () => flushPending(), [flushPending])

  const tick = useCallback(async (entry, day) => {
    if (entry.eaten || !isDayTickable(day.date, getTodayISO())) return
    await setEntryEaten(entry.id, true)
    showToast('Marked as eaten', false, INFO_TOAST_MS)
  }, [setEntryEaten, showToast])

  const moveEntry = useCallback(async (entry, planDate, mealId) => {
    try {
      await updateEntry(entry.id, { planDate, mealId })
      showToast('Meal moved', false, INFO_TOAST_MS)
    } catch {
      // updateEntry already rolled back and surfaced the error through the context toast
    }
  }, [updateEntry, showToast])

  const setServings = useCallback(async (entry, servings) => {
    try {
      await updateEntry(entry.id, { servings })
    } catch {
      // as above: rolled back and reported by the context
    }
  }, [updateEntry])

  /** Variant switch = assign a sibling recipe to the same slot; the backend keeps the extra choices. */
  const switchVariant = useCallback((entry, day, variantRecipe) =>
    assignRecipe(variantRecipe.recipeId, day.date, entry.mealId, entry.servings, variantRecipe),
  [assignRecipe])

  return { tick, requestRemove, undoRemove, pendingRemovalIds, toast, dismissToast,
    moveEntry, setServings, switchVariant }
}
