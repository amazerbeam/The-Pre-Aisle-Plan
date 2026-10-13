import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { useMealPlan } from './MealPlanContext'
import petService from '../services/petService'
import mealPlanService from '../services/mealPlanService'
import useMinuteClock from '../hooks/useMinuteClock'
import { addDays, formatDateISO } from '../utils/dateUtils'
import { fridgeFill, fridgeWindow, planCoversRange } from '../utils/fridgeFill'
import { FRIDGE_LOAD_ERROR } from '../constants/petRoom'
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
 *
 * MPP-19: `fridge` ({ fill, loading, error, retry }) counts this week's planned
 * breakfast/lunch/dinner and how many YOU haven't eaten (fridgeFill), over the 7 days
 * fridgeWindow picks. It reads weekPlan when the calendar shows that week, otherwise one
 * abortable fetch of it. Its error never blanks Pip.
 */
export const PetProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const { weekPlan, startDate, loading: weekLoading, error: weekError, fetchWeekPlan } = useMealPlan()
  const now = useMinuteClock()
  const todayISO = formatDateISO(now)
  const yesterdayISO = formatDateISO(addDays(now, -1))
  // MPP-19: the fridge week. When the calendar shows it, weekPlan IS it (live, optimistic
  // ticks); aligned weeks are equal or disjoint, so the two sources never disagree on a day.
  const fridgeRange = fridgeWindow(startDate, todayISO)
  const calendarIsFridgeWeek = startDate === fridgeRange.start

  const [pet, setPet] = useState(null)
  const [recentPlan, setRecentPlan] = useState(null)
  const [petLoading, setPetLoading] = useState(false)
  const [planLoading, setPlanLoading] = useState(false)
  const [petError, setPetError] = useState(null)
  const [planError, setPlanError] = useState(null)
  const [fridgePlan, setFridgePlan] = useState(null) // { start, plan } — keyed so a stale week is never counted
  const [fridgeError, setFridgeError] = useState(null)
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

  // MPP-19: fetch the fridge week only when the calendar isn't showing it.
  useEffect(() => {
    if (!isAuthenticated || calendarIsFridgeWeek) {
      setFridgePlan(null)
      setFridgeError(null)
      return undefined
    }
    const controller = new AbortController()
    const start = fridgeRange.start
    setFridgeError(null)
    mealPlanService.getWeekPlan(start, { signal: controller.signal })
      .then(plan => setFridgePlan({ start, plan }))
      .catch(err => {
        if (!isCancelled(err)) setFridgeError(err.response?.data?.error || FRIDGE_LOAD_ERROR)
      })
    return () => controller.abort()
  }, [isAuthenticated, calendarIsFridgeWeek, fridgeRange.start, reloadKey])

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

  // MPP-19: null fill = loading or failed, never "nothing planned" (that is planned: 0).
  const fridgeSource = calendarIsFridgeWeek
    ? { plan: planCoversRange(weekPlan, fridgeRange) ? weekPlan : null, error: weekError && !weekLoading ? FRIDGE_LOAD_ERROR : null, retry: fetchWeekPlan }
    : { plan: fridgePlan?.start === fridgeRange.start ? fridgePlan.plan : null, error: fridgeError, retry }
  const fridge = {
    fill: fridgeSource.plan ? fridgeFill(fridgeSource.plan, fridgeRange) : null,
    loading: !fridgeSource.plan && !fridgeSource.error,
    error: fridgeSource.plan ? null : fridgeSource.error,
    retry: fridgeSource.retry
  }

  const value = {
    pet,
    petName: pet?.name ?? null,
    mood: moodInfo.mood,
    moodInfo,
    position,
    fridge,
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
