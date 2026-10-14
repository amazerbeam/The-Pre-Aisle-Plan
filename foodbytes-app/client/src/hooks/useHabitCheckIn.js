import { useEffect, useRef, useState } from 'react'
import habitService from '../services/habitService'
import {
  CHECKIN_REACTION_MS,
  CHECKIN_SAVE_FAILED,
  CHECKIN_SNOOZE_REPLY,
  CHECKIN_STEPS,
  CHECKIN_WHEN_PROMPT
} from '../constants/pet'
import {
  firstAnswerEarliestISO, firstQuestionText, habitsToAsk, isSnoozedToday, praiseText, questionText, startOverText, stepFor
} from '../utils/habitCheckIn'
import { readSnoozedOn, writeSnoozedOn } from '../utils/checkInSnoozeStore'

// forDay: the todayISO this check-in was loaded for; an answer that lands after midnight is dropped.
const IDLE = { forDay: null, statuses: {}, queue: [], step: null, reaction: null, busy: false, interacted: false }

/**
 * MPP-21: Pip's once-a-day snack / alcohol check-in, asked in his speech bubble.
 * MPP-28: the statuses come from the pet payload (`habits`, requested for `petDay`) — no fetch. Seeds
 * once per person and day, and only from a payload requested for today, so a later /pet refetch (tab
 * visible, refreshPet after an answer) never restarts a question being answered.
 * Asks each habit whose askToday is true (snacks, then alcohol), posts each answer and keeps a kind
 * reaction. "Not now" snoozes both questions until tomorrow in this browser (AC 4).
 *
 * No payload for today yet (or /pet failed) shows no check-in. A failed answer says so gently and
 * ends the check-in; nothing is marked answered.
 *
 * MPP-35: a habit never answered opens on the one-time "When did you last…?" step (CHECKIN_STEPS.FIRST); its answer posts to first-answer and is praised like a "No".
 *
 * MPP-23: `onAnswered` (optional) runs once after each answer the server saved, so the
 * pet (cabinet, growth, wardrobe, sprinkles) can refetch and announce an award that answer earned. Not on a failed
 * answer, not on "Not now". `prompt` is the open question alone (no reaction), so the
 * bubble can swap the reaction for an award line.
 *
 * @param {{ userId: number|null, todayISO: string, habits: Object[]|null, petDay: string|null, onAnswered?: () => void }} input
 * @returns {{ text: string, prompt: string|null, actions: Object|null } | null} null when Pip has nothing to ask or say
 */
export function useHabitCheckIn({ userId, todayISO, habits, petDay, onAnswered }) {
  const [state, setState] = useState(IDLE)
  const mountedRef = useRef(false)
  const seedRef = useRef({ key: null, seeded: false })

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const key = userId == null ? null : `${userId}|${todayISO}`
    if (seedRef.current.key !== key) {
      seedRef.current = { key, seeded: false }
      setState(IDLE)
    }
    if (key == null || seedRef.current.seeded || !habits || petDay !== todayISO) return
    seedRef.current.seeded = true
    if (isSnoozedToday(readSnoozedOn(userId), todayISO)) return
    const queue = habitsToAsk(habits)
    if (queue.length === 0) return
    const statuses = Object.fromEntries(habits.map(status => [status.habit, status]))
    setState({ ...IDLE, forDay: todayISO, statuses, queue, step: stepFor(queue[0], statuses[queue[0]]) })
  }, [userId, todayISO, habits, petDay])

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
  const submit = async (habit, send, reactionFor) => {
    setState(current => ({ ...current, busy: true, interacted: true }))
    try {
      const status = await send()
      if (!mountedRef.current) return
      setState(current => {
        if (current.forDay !== forDay) return current
        const queue = current.queue.filter(h => h !== habit)
        return {
          ...current,
          statuses: { ...current.statuses, [habit]: status },
          queue,
          step: queue.length ? stepFor(queue[0], current.statuses[queue[0]]) : null,
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

  const PROMPTS = {
    [CHECKIN_STEPS.ASK]: () => questionText(step.habit, state.statuses[step.habit].coversFrom, todayISO),
    [CHECKIN_STEPS.FIRST]: () => firstQuestionText(step.habit),
    [CHECKIN_STEPS.WHEN]: () => CHECKIN_WHEN_PROMPT
  }
  const prompt = step ? PROMPTS[step.kind]() : null
  const text = [state.reaction, prompt].filter(Boolean).join(' ')

  const actions = step && {
    step: step.kind,
    habit: step.habit,
    coversFrom: state.statuses[step.habit].coversFrom,
    todayISO,
    busy: state.busy,
    focusFirst: state.interacted,
    earliest: firstAnswerEarliestISO(todayISO),
    onNo: () => submit(step.habit, () => habitService.answerHabit(step.habit, { clean: true }), praiseText),
    onYes: () => setState(current => ({ ...current, step: { kind: CHECKIN_STEPS.WHEN, habit: step.habit }, reaction: null, interacted: true })),
    onBack: () => setState(current => ({ ...current, step: { kind: CHECKIN_STEPS.ASK, habit: step.habit }, interacted: true })),
    onSave: (lapseDate) => submit(step.habit, () => habitService.answerHabit(step.habit, { clean: false, lapseDate }), startOverText),
    onFirstSave: (lastDate) => submit(step.habit, () => habitService.firstAnswerHabit(step.habit, { lastDate }), praiseText),
    onNotNow: () => {
      writeSnoozedOn(userId, todayISO)
      setState(current => ({ ...current, queue: [], step: null, reaction: CHECKIN_SNOOZE_REPLY, interacted: true }))
    }
  }

  return { text, prompt, actions: actions || null }
}

export default useHabitCheckIn
