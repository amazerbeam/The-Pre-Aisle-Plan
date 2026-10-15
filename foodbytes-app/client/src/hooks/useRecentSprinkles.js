import { useEffect, useState } from 'react'
import petService from '../services/petService'
import { EARN_LOAD_ERROR } from '../constants/petSprinkles'

// Axios rejects an aborted request with code ERR_CANCELED; that is not an error to show.
const isCancelled = (err) => err?.code === 'ERR_CANCELED'

/**
 * MPP-42: GET /api/pet/sprinkles/recent for the Earn tab — fetched each time the tab mounts, aborted
 * when it unmounts. Loading, error (server message first) and data are separate; retry() refetches.
 *
 * @param {{ enabled?: boolean }} [input]
 * @returns {{ data: { entries: Object[], rates: Object }|null, loading: boolean, error: string|null, retry: () => void }}
 */
export function useRecentSprinkles({ enabled = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    petService.getRecentSprinkles({ signal: controller.signal })
      .then(result => setData(result))
      .catch(err => {
        if (!isCancelled(err)) setError(err.response?.data?.error || EARN_LOAD_ERROR)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [enabled, reloadKey])

  const retry = () => setReloadKey(key => key + 1)

  return { data, loading, error, retry }
}

export default useRecentSprinkles
