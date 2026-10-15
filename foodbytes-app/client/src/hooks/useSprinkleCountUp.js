import { useEffect, useState } from 'react'
import petService from '../services/petService'
import { AWARD_BUBBLE_MS } from '../constants/petAwards'
import { COUNT_UP_DELAY_MS, SPRINKLES_LIVE_TEXT } from '../constants/petSprinkles'
import { countUpDuration, earnedLine } from '../utils/sprinkleHistory'
import { prefersReducedMotion } from '../utils/reducedMotion'
import { readSeenSprinkles, writeSeenSprinkles } from '../utils/sprinklesSeenStore'

/**
 * MPP-42 AC 14–19: decides when Pip's header chip counts up. Each new balance is compared with the
 * last one this device showed this user (sprinklesSeenStore), then written straight away so a
 * refetch or a remount never replays it. Higher → a new `run` and one polite live line. Equal,
 * lower (spending) or first visit → nothing; the chip just shows the balance.
 *
 * After a run the recent read says what was earned; once the count-up has had time to finish, the
 * bubble `line` waits while `hold` is set (cook scene, award / outfit / shop line), then shows for
 * AWARD_BUBBLE_MS. A failed read still gets a line (the plain "+N sprinkles!").
 *
 * @param {{ userId: number|null, sprinkles: number|null, hold: boolean }} input
 * @returns {{ run: { id: number, from: number, to: number, gain: number }|null, reduced: boolean,
 *             liveText: string|null, line: string|null }}
 */
export function useSprinkleCountUp({ userId, sprinkles, hold }) {
  const [run, setRun] = useState(null)
  const [liveText, setLiveText] = useState(null)
  const [pendingLine, setPendingLine] = useState(null)
  const [line, setLine] = useState(null)
  const reduced = prefersReducedMotion()

  // Another person signing in on this browser never sees the last person's run.
  useEffect(() => {
    setRun(null)
    setLiveText(null)
    setPendingLine(null)
    setLine(null)
  }, [userId])

  useEffect(() => {
    if (userId == null || typeof sprinkles !== 'number') return
    const seen = readSeenSprinkles(userId)
    writeSeenSprinkles(userId, sprinkles)
    if (seen == null || sprinkles <= seen) return
    const gain = sprinkles - seen
    setRun(current => ({ id: (current?.id ?? 0) + 1, from: seen, to: sprinkles, gain }))
    setLiveText(SPRINKLES_LIVE_TEXT(gain, sprinkles))
  }, [userId, sprinkles])

  useEffect(() => {
    if (!run) return undefined
    const controller = new AbortController()
    let timerId
    const finished = new Promise(resolve => {
      timerId = setTimeout(resolve, reduced ? 0 : COUNT_UP_DELAY_MS + countUpDuration(run.gain))
    })
    // Not a success-shaped fallback for a panel: a failed read only changes the line's wording.
    const earned = petService.getRecentSprinkles({ signal: controller.signal })
      .then(result => result?.entries ?? [])
      .catch(() => [])
    Promise.all([earned, finished]).then(([entries]) => {
      if (!controller.signal.aborted) setPendingLine(earnedLine(entries, run.gain))
    })
    return () => {
      controller.abort()
      clearTimeout(timerId)
    }
  }, [run]) // eslint-disable-line react-hooks/exhaustive-deps -- reduced is read once per run

  // AC 16: speak when it's this line's turn; a hold pauses it, and it shows in full afterwards.
  useEffect(() => {
    if (!pendingLine || hold) return undefined
    setLine(pendingLine)
    const timerId = setTimeout(() => {
      setLine(null)
      setPendingLine(null)
    }, AWARD_BUBBLE_MS)
    return () => clearTimeout(timerId)
  }, [pendingLine, hold])

  return { run, reduced, liveText, line }
}

export default useSprinkleCountUp
