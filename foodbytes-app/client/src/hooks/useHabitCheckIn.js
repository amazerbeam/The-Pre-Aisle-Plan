import { useEffect, useRef, useState } from 'react'
import habitService from '../services/habitService'
import {
  CHECKIN_REACTION_MS,
  CHECKIN_SAVE_FAILED,
  CHECKIN_SNOOZE_REPLY,
  CHECKIN_STEPS,
  CHECKIN_WHEN_PROMPT
} from '../constants/pet'
import { habitsToAsk, isSnoozedToday, praiseText, questionText, startOverText } from '../utils/habitCheckIn'
import { readSnoozedOn, writeSnoozedOn } from '../utils/checkInSnoozeStore'

// forDay: the todayISO this check-in was loaded for; an answer that lands after midnight is dropped.
const IDLE = { forDay: null, statuses: {}, queue: [], step: null, reaction: null, busy: false, interacted: false }

/**
 * MPP-21: Pip's once-a-day snack / alcohol check-in, asked in his speech bubble.
 * Loads the caller's MPP-20 statuses on mount and on date rollover, asks each habit whose
 * askToday is true (snacks, then alcohol), posts each answer and keeps a kind reaction.
 * "Not now" snoozes both questions until tomorrow in this browser (AC 4).
 *
 * A failed load shows no check-in, so the usual bubble speaks and the next visit asks again
 * (ticket). A failed answer says so gently and ends the check-in; nothing is marked answered.
 *
 * MPP-23: `onAnswered` (optional) runs once after each answer the server saved, so the
 * trophy cabinet can refetch and announce an award that answer earned. Not on a failed
 * answer, not on "Not now". `prompt` is the open question alone (no reaction), so the
 * bubble can swap the reaction for an award line.
 *
 * @param {{ userId: number|null, todayISO: string, onAnswered?: () => void }} input
 * @returns {{ text: string, prompt: string|null, actions: Object|null } | null} null when Pip has nothing to ask or say
 */
export function useHabitCheckIn({ userId, todayISO, onAnswered }) {
  const [state, setState] = useState(IDLE)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    setState(IDLE)
    if (userId == null || isSnoozedToday(readSnoozedOn(userId), todayISO)) return undefined
    const controller = new AbortController()
    habitService.getHabits({ signal: controller.signal })
      .then(list => {
        const queue = habitsToAsk(list)
        if (queue.length === 0) return
        const statuses = Object.fromEntries(list.map(status => [status.habit, status]))
        setState({ ...IDLE, forDay: todayISO, statuses, queue, step: { kind: CHECKIN_STEPS.ASK, habit: queue[0] } })
      })
      .catch(() => {
        // Cancelled or failed: no check-in this visit. Nothing is cached, so the next mount asks again.
      })
    return () => controller.abort()
  }, [userId, todayISO])

  // The last reaction (no question under it) clears itself so the usual bubble returns.
  const ended = state.step === null && state.reaction !== null
  useEffect(() => {
    if (!ended) return undefined
    const timerId = setTimeout(() => setState(current => ({ ...current, reaction: null })), CHECKIN_REACTION_MS)
    return () => clearTimeout(timerId)
  }, [ended, state.reaction])

  const { step } = state
  if (!step && !state.reaction) return null

  const forDay = state.forDay
  // A write is never aborted; a result for an unmounted view or an earlier day is dropped.
  const submit = async (habit, body, reactionFor) => {
    setState(current => ({ ...current, busy: true, interacted: true }))
    try {
      const status = await habitService.answerHabit(habit, body)
      if (!mountedRef.current) return
      setState(current => {
        if (current.forDay !== forDay) return current
        const queue = current.queue.filter(h => h !== habit)
        return {
          ...current,
          statuses: { ...current.statuses, [habit]: status },
          queue,
          step: queue.length ? { kind: CHECKIN_STEPS.ASK, habit: queue[0] } : null,
          reaction: reactionFor(status),
          busy: false
        }
      })
      onAnswered?.()
    } catch {
      if (!mountedRef.current) return
      setState(current => (current.forDay !== forDay
        ? current
        : { ...current, queue: [], step: null, reaction: CHECKIN_SAVE_FAILED, busy: false }))
    }
  }

  const prompt = !step
    ? null
    : step.kind === CHECKIN_STEPS.ASK
      ? questionText(step.habit, state.statuses[step.habit].coversFrom, todayISO)
      : CHECKIN_WHEN_PROMPT
  const text = [state.reaction, prompt].filter(Boolean).join(' ')

  const actions = step && {
    step: step.kind,
    habit: step.habit,
    coversFrom: state.statuses[step.habit].coversFrom,
    todayISO,
    busy: state.busy,
    focusFirst: state.interacted,
    onNo: () => submit(step.habit, { clean: true }, praiseText),
    onYes: () => setState(current => ({ ...current, step: { kind: CHECKIN_STEPS.WHEN, habit: step.habit }, reaction: null, interacted: true })),
    onBack: () => setState(current => ({ ...current, step: { kind: CHECKIN_STEPS.ASK, habit: step.habit }, interacted: true })),
    onSave: (lapseDate) => submit(step.habit, { clean: false, lapseDate }, startOverText),
    onNotNow: () => {
      writeSnoozedOn(userId, todayISO)
      setState(current => ({ ...current, queue: [], step: null, reaction: CHECKIN_SNOOZE_REPLY, interacted: true }))
    }
  }

  return { text, prompt, actions: actions || null }
}

export default useHabitCheckIn
