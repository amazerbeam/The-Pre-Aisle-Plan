import { useState } from 'react'
import { useMealPlan } from '../contexts/MealPlanContext'
import { useAuth } from '../contexts/AuthContext'
import { usePet } from '../contexts/PetContext'
import { shouldTakeToPip } from '../utils/cookServe'
import useTakeToPip from './useTakeToPip'

const SAVE_ERROR = "Couldn't save — try again."

/**
 * MPP-12 / MPP-34: the eaten tick for one meal-plan entry, shared by the recipe view's plan bar
 * and its bottom eaten section so the two cannot drift. Reads the entry live from MealPlanContext
 * so the optimistic flip, the server reconcile and any rollback show while the modal stays open.
 * Call it once per modal and pass the result to both: the take-to-Pip timer lives here, so an
 * Undo from either button cancels it. A null entryId yields an inert result.
 *
 * @returns {{ entry: Object|null, eaten: boolean, eatenAt: string|null,
 *             save: (next: boolean) => Promise<void>, saving: boolean, error: string|null }}
 */
export default function useMealEatenSave(entryId) {
  const { getEntryById, setEntryEaten } = useMealPlan()
  const { isAuthenticated } = useAuth()
  const { pet, todayISO, yesterdayISO, refreshPet } = usePet()
  const takeToPip = useTakeToPip()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const entry = entryId == null ? null : getEntryById(entryId)

  const save = async (next) => {
    if (saving || !entry) return
    if (!next) takeToPip.cancel() // AC 4: Undo during the beat stays on the recipe
    setSaving(true)
    setError(null)
    try {
      await setEntryEaten(entryId, next)
      if (next) refreshPet() // MPP-25: the tick may have paid sprinkles; un-ticking never changes them
      // Resolved = the server confirmed (AC 1); a failure throws below and never navigates (AC 4).
      if (next && shouldTakeToPip({
        isAuthenticated,
        petReady: pet != null,
        mealType: entry.mealType,
        planDate: entry.planDate,
        todayISO,
        yesterdayISO
      })) {
        takeToPip.schedule()
      }
    } catch {
      // The context already rolled back and raised the toast; the toast can sit behind
      // this full-screen modal, so repeat the failure inline.
      setError(SAVE_ERROR)
    } finally {
      setSaving(false)
    }
  }

  return {
    entry,
    eaten: entry?.eaten === true,
    eatenAt: entry?.eatenAt ?? null,
    save,
    saving,
    error
  }
}
