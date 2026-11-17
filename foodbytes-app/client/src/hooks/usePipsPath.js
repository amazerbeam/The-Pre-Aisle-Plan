import { useCallback, useEffect, useRef, useState } from 'react'
import { usePet } from '../contexts/PetContext'
import { GAMES_CLEAR_ERROR, GAMES_ISSUE_ERROR, GAMES_LOAD_ERROR } from '../constants/pipsPath'
import pipsPathService from '../services/pipsPathService'

const messageOf = (err, fallback) => err?.response?.data?.error || fallback
const isCancel = (err) => err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED'

/**
 * MPP-49: the games sheet's server state. Mounted only while the sheet is open, so the state read
 * starts on open and its AbortController is aborted on close. issue / clear are writes: never
 * aborted; a mounted ref drops their result after unmount. A paid clear updates the header balance
 * through PetContext.applySprinkles and re-reads the state (progress, earned today).
 */
export default function usePipsPath() {
  const { applySprinkles } = usePet()
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [map, setMap] = useState(null)
  const [issuing, setIssuing] = useState(false)
  const [issueError, setIssueError] = useState(null)
  const [clearResult, setClearResult] = useState(null)
  const [clearing, setClearing] = useState(false)
  const [clearError, setClearError] = useState(null)
  const [issueCount, setIssueCount] = useState(0)
  const mountedRef = useRef(true)
  const clearSeqRef = useRef(0) // latest clear request; older responses are ignored
  const readRef = useRef(null)

  const reload = useCallback(() => {
    readRef.current?.abort()
    const controller = new AbortController()
    readRef.current = controller
    setLoading(true)
    setError(null)
    pipsPathService.getState({ signal: controller.signal })
      .then(data => { if (mountedRef.current) setState(data) })
      .catch(err => { if (!isCancel(err) && mountedRef.current) setError(messageOf(err, GAMES_LOAD_ERROR)) })
      .finally(() => { if (mountedRef.current && readRef.current === controller) setLoading(false) })
  }, [])

  useEffect(() => {
    mountedRef.current = true
    reload()
    return () => {
      mountedRef.current = false
      readRef.current?.abort()
    }
  }, [reload])

  /** Resolves the issued map, or null after showing issueError. */
  const issue = async (slot = {}) => {
    setIssuing(true)
    setIssueError(null)
    try {
      const data = await pipsPathService.issueMap(slot)
      if (!mountedRef.current) return null
      clearSeqRef.current += 1 // a stale in-flight clear belongs to the previous board
      setMap(data)
      setIssueCount(n => n + 1)
      setClearing(false)
      setClearResult(null)
      setClearError(null)
      return data
    } catch (err) {
      if (mountedRef.current) setIssueError(messageOf(err, GAMES_ISSUE_ERROR))
      return null
    } finally {
      if (mountedRef.current) setIssuing(false)
    }
  }

  const clear = async (mapId, path) => {
    const seq = ++clearSeqRef.current
    const latest = () => mountedRef.current && clearSeqRef.current === seq
    setClearing(true)
    setClearError(null)
    setClearResult(null)
    let data
    try {
      data = await pipsPathService.clearMap(mapId, path)
    } catch (err) {
      if (latest()) { setClearError(messageOf(err, GAMES_CLEAR_ERROR)); setClearing(false) }
      return
    }
    if (!latest()) return
    setClearResult(data)
    setClearing(false)
    // The clear is saved; a failure refreshing the balance or state must not read as a failed save.
    try {
      if (data.balance != null) applySprinkles(data.balance)
      reload()
    } catch { /* the sheet shows the saved result; the next open re-reads the state */ }
  }

  const resetClear = () => {
    setClearResult(null)
    setClearError(null)
  }

  return { state, loading, error, reload, map, issueCount, issuing, issueError, issue, clearResult, clearing, clearError, clear, resetClear }
}
