import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { useMealPlan } from './MealPlanContext'
import petService from '../services/petService'
import mealPlanService from '../services/mealPlanService'
import useMinuteClock from '../hooks/useMinuteClock'
import { addDays, formatDateISO } from '../utils/dateUtils'
import { derivePetMood } from '../utils/petMood'
import { pipPosition } from '../utils/pipPosition'

const LOAD_ERROR = "Couldn't load your pet."

const PetContext = createContext()

/**
 * MPP-14: your own pet (MPP-33) — its name, your meal times, and a mood derived on
 * every render from yesterday's and today's meals.
 *
 * Yesterday must exist even when the calendar's selected week starts today (or is a
 * different week), so this fetches its own 7 days from yesterday. For each of yesterday
 * and today it prefers MealPlanContext's live week when that week contains the day:
 * that copy carries MPP-12's optimistic eaten tick, so the mood flips the instant a meal
 * is logged (AC 7).
 *
 * The pet refetches on sign-in, local date rollover, retry() and the tab becoming visible
 * again (picks up ticks made on another device). The recent-days week also refetches when the
 * calendar's week changes. No polling.
 *
 * MPP-17: `position` (rug / cooker / bed) is derived from the same minute clock and
 * your own meal times, so Pip moves on the minute without a second timer.
 */
export const PetProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const { weekPlan, startDate } = useMealPlan()
  const now = useMinuteClock()
  const todayISO = formatDateISO(now)
  const yesterdayISO = formatDateISO(addDays(now, -1))

  const [pet, setPet] = useState(null)
  const [recentPlan, setRecentPlan] = useState(null)
  const [petLoading, setPetLoading] = useState(false)
  const [planLoading, setPlanLoading] = useState(false)
  const [petError, setPetError] = useState(null)
  const [planError, setPlanError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const petControllerRef = useRef(null)

  const retry = useCallback(() => setReloadKey(key => key + 1), [])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') retry()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [retry])

  // /pet: sign-in, date rollover, retry, tab visible. Not the calendar's week.
  useEffect(() => {
    if (!isAuthenticated) {
      setPet(null)
      setPetError(null)
      setPetLoading(false)
      return undefined
    }
    const controller = new AbortController()
    petControllerRef.current = controller
    setPetLoading(true)
    setPetError(null)
    petService.getPet({ signal: controller.signal })
      .then(setPet)
      .catch(err => {
        if (!isCancelled(err)) setPetError(err.response?.data?.error || LOAD_ERROR)
      })
      .finally(() => {
        if (!controller.signal.aborted) setPetLoading(false)
      })
    return () => controller.abort()
  }, [isAuthenticated, todayISO, reloadKey])

  // Recent-days week: also follows the calendar's week.
  useEffect(() => {
    if (!isAuthenticated) {
      setRecentPlan(null)
      setPlanError(null)
      setPlanLoading(false)
      return undefined
    }
    const controller = new AbortController()
    setPlanLoading(true)
    setPlanError(null)
    mealPlanService.getWeekPlan(yesterdayISO, { signal: controller.signal })
      .then(setRecentPlan)
      .catch(err => {
        if (!isCancelled(err)) setPlanError(err.response?.data?.error || LOAD_ERROR)
      })
      .finally(() => {
        if (!controller.signal.aborted) setPlanLoading(false)
      })
    return () => controller.abort()
  }, [isAuthenticated, yesterdayISO, startDate, reloadKey])

  const renamePet = useCallback(async (name) => {
    // A GET still in flight would carry the old name; cancel it so it can't land after the rename.
    petControllerRef.current?.abort()
    setPetLoading(false)
    const updated = await petService.renamePet(name)
    petControllerRef.current?.abort()
    setPet(updated)
    return updated
  }, [])

  const pickDay = (iso) => findDay(weekPlan, iso) ?? findDay(recentPlan, iso)
  const moodInfo = derivePetMood({
    yesterday: pickDay(yesterdayISO),
    today: pickDay(todayISO),
    mealTimes: pet?.mealTimes ?? null,
    now
  })
  const position = pipPosition(now, pet?.mealTimes ?? null)

  const value = {
    pet,
    petName: pet?.name ?? null,
    mood: moodInfo.mood,
    moodInfo,
    position,
    loading: petLoading || planLoading,
    error: petError || planError,
    retry,
    renamePet
  }

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>
}

export const usePet = () => {
  const context = useContext(PetContext)
  if (!context) {
    throw new Error('usePet must be used within a PetProvider')
  }
  return context
}

const findDay = (plan, iso) => plan?.days?.find(day => day.date === iso) ?? null

// Axios rejects an aborted request with code ERR_CANCELED; that is not an error to show.
const isCancelled = (err) => err?.code === 'ERR_CANCELED'

export default PetContext
