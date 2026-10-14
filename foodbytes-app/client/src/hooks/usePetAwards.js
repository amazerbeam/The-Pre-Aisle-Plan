import { useEffect, useState } from 'react'
import { AWARD_BUBBLE_MS } from '../constants/petAwards'
import { announcementText, awardCountsOf, newAwards } from '../utils/petAwards'
import { readAwardCounts, writeAwardCounts } from '../utils/awardSeenStore'

/**
 * MPP-23: your own trophy cabinet and Pip's "🎉 New …" lines. MPP-28: the cabinet is the pet
 * payload's `awards` (GET /api/pet records any newly earned award) — no fetch of its own.
 *
 * Each payload's counts are compared with what this browser last saw (awardSeenStore): each streak
 * type that gained an award queues one line for its highest new milestone, shown for
 * AWARD_BUBBLE_MS each. The baseline is written before the line is queued, so a refetch or reload
 * never repeats it. No baseline yet (first visit here) → saved quietly, nothing announced.
 *
 * @param {{ userId: number|null, awards: { streaks: Object[], firsts: Object[] }|null,
 *           loading: boolean, error: string|null, retry: () => void }} input  from PetContext
 * @returns {{ cabinet: { data: Object|null, loading: boolean, error: string|null, retry: () => void }, announcement: string|null }}
 */
export function usePetAwards({ userId, awards, loading, error, retry }) {
  const [queue, setQueue] = useState([])

  // Another person signing in on this browser never sees the last person's lines.
  useEffect(() => {
    setQueue([])
  }, [userId])

  useEffect(() => {
    if (userId == null || !awards) return
    const fresh = newAwards(readAwardCounts(userId), awards.streaks)
    writeAwardCounts(userId, awardCountsOf(awards.streaks))
    if (fresh.length) setQueue(current => [...current, ...fresh.map(announcementText)])
  }, [userId, awards])

  // One line at a time; each new queue (shift or append) restarts the head's timer.
  useEffect(() => {
    if (queue.length === 0) return undefined
    const timerId = setTimeout(() => setQueue(current => current.slice(1)), AWARD_BUBBLE_MS)
    return () => clearTimeout(timerId)
  }, [queue])

  return {
    cabinet: { data: awards, loading: !awards && loading, error: awards ? null : error, retry },
    announcement: queue[0] ?? null
  }
}

export default usePetAwards
