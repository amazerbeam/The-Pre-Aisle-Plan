import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { useMealPlan } from './MealPlanContext'
import petService from '../services/petService'
import mealPlanService from '../services/mealPlanService'
import useMinuteClock from '../hooks/useMinuteClock'
import { addDays, formatDateISO } from '../utils/dateUtils'
import { fridgeFill, fridgeWindow, needsPetDays, petPlanRange, planCoversRange } from '../utils/fridgeFill'
import { FRIDGE_LOAD_ERROR } from '../constants/petRoom'
import { derivePetMood } from '../utils/petMood'
import { pipPosition } from '../utils/pipPosition'

const LOAD_ERROR = "Couldn't load your pet."

const PetContext = createContext()

/**
 * MPP-14: your own pet (MPP-33) — its name, your meal times, and a mood derived on
 * every render from yesterday's and today's meals.
 *
 * For each of yesterday and today it prefers MealPlanContext's live week when that week
 * contains the day: that copy carries MPP-12's optimistic eaten tick, so the mood flips the
 * instant a meal is logged (AC 7).
 *
 * The pet refetches on sign-in, local date rollover, retry() and the tab becoming visible
 * again (picks up ticks made on another device). No polling.
 *
 * MPP-17: `position` (rug / cooker / bed) is derived from the same minute clock and
 * your own meal times, so Pip moves on the minute without a second timer.
 *
 * MPP-19: `fridge` ({ fill, loading, error, retry }) counts this week's planned
 * breakfast/lunch/dinner and how many YOU haven't eaten (fridgeFill), over the 7 days
 * fridgeWindow picks. Its error never blanks Pip.
 *
 * MPP-28: one meal-plan read (petPlanRange: yesterday through the fridge week, 7 or 8 days), skipped
 * when the calendar's week holds both (needsPetDays). Mood prefers MealPlanContext's live week per day
 * (MPP-12's optimistic tick). `petDay` is the date the pet payload was requested for, so the check-in
 * never seeds from yesterday's payload. `habits` and `awards` come from the same payload (MPP-20 / MPP-23).
 *
 * MPP-21: `todayISO` (the same minute clock's local date) so the check-in bubble re-asks
 * after midnight without a second clock.
 *
 * MPP-31: `growth` (PetGrowthDTO: points, form, barCurrent, barSize, fullyGrown, lastDayScore,
 * lastScoredDate) — your own Pip's herb form, straight from the pet payload; null until it loads.
 *
 * MPP-32: `wardrobe` (WardrobeDTO: items, outfit) — your own clothes, straight from the pet payload; `setWardrobe` replaces it after a dressing write.
 *
 * MPP-25: `sprinkles` — your own balance from the pet payload (null until it loads); `refreshPet()` refetches just /pet.
 *
 * MPP-26: `room` (PetRoomDTO: stations, upgradeCosts) — your own room; `applyRoomWrite` swaps in a shop write's balance and room.
 *
 * MPP-27: `room` also carries decor + placements; `setRoom` swaps in an optimistic room while a placement is saving.
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
  const [petDay, setPetDay] = useState(null) // MPP-28: the todayISO the current pet payload was requested for
  const [petDays, setPetDays] = useState(null) // { start, plan } — keyed so a stale range is never read
  const [petLoading, setPetLoading] = useState(false)
  const [daysLoading, setDaysLoading] = useState(false)
  const [petError, setPetError] = useState(null)
  const [daysError, setDaysError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [petReloadKey, setPetReloadKey] = useState(0)
  const petControllerRef = useRef(null)

  const retry = useCallback(() => setReloadKey(key => key + 1), [])
  // MPP-25: refetch only /pet (e.g. the sprinkles a tick just paid) — retry() also refetches two weeks.
  const refreshPet = useCallback(() => setPetReloadKey(key => key + 1), [])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') retry()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [retry])

  // /pet: sign-in, date rollover, retry, refreshPet, tab visible. Not the calendar's week.
  useEffect(() => {
    if (!isAuthenticated) {
      setPet(null)
      setPetDay(null)
      setPetError(null)
      setPetLoading(false)
      return undefined
    }
    const requestedFor = todayISO
    const controller = new AbortController()
    petControllerRef.current = controller
    setPetLoading(true)
    setPetError(null)
    petService.getPet({ signal: controller.signal })
      .then(data => { setPet(data); setPetDay(requestedFor) })
      .catch(err => {
        if (!isCancelled(err)) setPetError(err.response?.data?.error || LOAD_ERROR)
      })
      .finally(() => {
        if (!controller.signal.aborted) setPetLoading(false)
      })
    return () => controller.abort()
  }, [isAuthenticated, todayISO, reloadKey, petReloadKey])

  // MPP-28: one meal-plan read for mood (yesterday) and the fridge week — none when the calendar's
  // week already holds both. 8 days on the fridge week's first day (yesterday + the week).
  const petDaysNeeded = needsPetDays(calendarIsFridgeWeek, fridgeRange, yesterdayISO)
  const petRange = petPlanRange(fridgeRange, yesterdayISO)
  useEffect(() => {
    if (!isAuthenticated || !petDaysNeeded) {
      setPetDays(null)
      setDaysError(null)
      setDaysLoading(false)
      return undefined
    }
    const controller = new AbortController()
    const { start, days } = petRange
    setDaysLoading(true)
    setDaysError(null)
    mealPlanService.getWeekPlan(start, { signal: controller.signal, days })
      .then(plan => setPetDays({ start, plan }))
      .catch(err => {
        if (!isCancelled(err)) setDaysError(err.response?.data?.error || LOAD_ERROR)
      })
      .finally(() => {
        if (!controller.signal.aborted) setDaysLoading(false)
      })
    return () => controller.abort()
  }, [isAuthenticated, petDaysNeeded, petRange.start, petRange.days, reloadKey])

  const renamePet = useCallback(async (name) => {
    // A GET still in flight would carry the old name; cancel it so it can't land after the rename.
    petControllerRef.current?.abort()
    setPetLoading(false)
    const updated = await petService.renamePet(name)
    petControllerRef.current?.abort()
    setPet(updated)
    return updated
  }, [])

  // MPP-32: swap in a wardrobe (optimistic copy or a write's response). A GET still in flight
  // would carry the old outfit; cancel it so it can't land after the write (as renamePet does).
  const setWardrobe = useCallback((wardrobe) => {
    petControllerRef.current?.abort()
    setPetLoading(false)
    setPet(current => (current ? { ...current, wardrobe } : current))
  }, [])

  // MPP-26: swap in a room write's { sprinkles, room }. A GET still in flight would carry the old
  // levels and balance; cancel it so it can't land after the write (as setWardrobe does).
  const applyRoomWrite = useCallback(({ sprinkles, room }) => {
    petControllerRef.current?.abort()
    setPetLoading(false)
    setPet(current => (current ? { ...current, sprinkles, room } : current))
  }, [])

  // MPP-27: swap in a room on its own (an optimistic decor placement, or its rollback). Like
  // applyRoomWrite, it cancels a GET in flight so an older room can't land after it.
  const setRoom = useCallback((room) => {
    petControllerRef.current?.abort()
    setPetLoading(false)
    setPet(current => (current ? { ...current, room } : current))
  }, [])

  const daysPlan = petDays?.start === petRange.start ? petDays.plan : null
  const pickDay = (iso) => findDay(weekPlan, iso) ?? findDay(daysPlan, iso)
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
    : { plan: planCoversRange(daysPlan, fridgeRange) ? daysPlan : null, error: daysError ? FRIDGE_LOAD_ERROR : null, retry }
  const fridge = {
    fill: fridgeSource.plan ? fridgeFill(fridgeSource.plan, fridgeRange) : null,
    loading: !fridgeSource.plan && !fridgeSource.error,
    error: fridgeSource.plan ? null : fridgeSource.error,
    retry: fridgeSource.retry
  }

  const value = {
    pet,
    petName: pet?.name ?? null,
    growth: pet?.growth ?? null,
    wardrobe: pet?.wardrobe ?? null,
    room: pet?.room ?? null,
    applyRoomWrite,
    setRoom,
    sprinkles: pet?.sprinkles ?? null,
    refreshPet,
    mood: moodInfo.mood,
    moodInfo,
    position,
    fridge,
    todayISO,
    yesterdayISO,
    petDay,
    habits: pet?.habits ?? null,
    awards: pet?.awards ?? null,
    loading: petLoading || daysLoading,
    error: petError || daysError,
    retry,
    renamePet,
    setWardrobe
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
