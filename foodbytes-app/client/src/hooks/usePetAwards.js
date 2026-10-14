import { useEffect, useState } from 'react'
import petService from '../services/petService'
import { AWARD_BUBBLE_MS, CABINET_LOAD_ERROR } from '../constants/petAwards'
import { announcementText, awardCountsOf, newAwards } from '../utils/petAwards'
import { readAwardCounts, writeAwardCounts } from '../utils/awardSeenStore'

/**
 * MPP-23: your own trophy cabinet (GET /api/pet/awards) and Pip's "🎉 New …" lines.
 *
 * Fetches on mount / user change, local date rollover, the tab becoming visible, and
 * refresh() (called after a check-in answer). Reading the endpoint is what records a
 * newly earned award server-side, so after every load the counts are compared with what
 * this browser last saw (awardSeenStore): each streak type that gained an award queues one
 * line for its highest new milestone, shown for AWARD_BUBBLE_MS each. The baseline is
 * written before the line is queued, so a reload never repeats it. No baseline yet (first
 * visit here) → saved quietly, nothing announced.
 *
 * A failed refetch keeps the last good cabinet and announces nothing.
 *
 * @param {{ userId: number|null, todayISO: string }} input
 * @returns {{
 *   cabinet: { data: { streaks: Object[], firsts: Object[] }|null, loading: boolean, error: string|null, retry: () => void },
 *   announcement: string|null,
 *   refresh: () => void
 * }}
 */
export function usePetAwards({ userId, todayISO }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [queue, setQueue] = useState([])
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = () => setReloadKey(key => key + 1)

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') setReloadKey(key => key + 1)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  // Another person signing in on this browser never sees the last person's cabinet or lines.
  useEffect(() => {
    setData(null)
    setQueue([])
  }, [userId])

  useEffect(() => {
    if (userId == null) {
      setLoading(false)
      setError(null)
      return undefined
    }
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    petService.getAwards({ signal: controller.signal })
      .then(cabinet => {
        const fresh = newAwards(readAwardCounts(userId), cabinet.streaks)
        writeAwardCounts(userId, awardCountsOf(cabinet.streaks))
        setData(cabinet)
        if (fresh.length) setQueue(current => [...current, ...fresh.map(announcementText)])
      })
      .catch(err => {
        if (!isCancelled(err)) setError(err.response?.data?.error || CABINET_LOAD_ERROR)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [userId, todayISO, reloadKey])

  // One line at a time; each new queue (shift or append) restarts the head's timer.
  useEffect(() => {
    if (queue.length === 0) return undefined
    const timerId = setTimeout(() => setQueue(current => current.slice(1)), AWARD_BUBBLE_MS)
    return () => clearTimeout(timerId)
  }, [queue])

  return {
    cabinet: { data, loading, error, retry: refresh },
    announcement: queue[0] ?? null,
    refresh
  }
}

// Axios rejects an aborted request with code ERR_CANCELED; that is not an error to show.
const isCancelled = (err) => err?.code === 'ERR_CANCELED'

export default usePetAwards
