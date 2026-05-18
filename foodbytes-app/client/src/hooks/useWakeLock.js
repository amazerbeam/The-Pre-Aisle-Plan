import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * FR-029: useWakeLock - Custom hook for Screen Wake Lock API
 * Keeps the screen awake when viewing recipes during cooking.
 *
 * Features:
 * - Requests wake lock on mount (if autoActivate is true)
 * - Supports manual toggle via toggle() function
 * - Returns animation state for lock emoji indicator
 * - Graceful degradation for unsupported browsers
 *
 * @param {boolean} autoActivate - Whether to auto-activate wake lock on mount (default: true)
 * @returns {Object} { isLocked, isSupported, isAnimating, toggle, request, release }
 */
function useWakeLock(autoActivate = true) {
  const [isLocked, setIsLocked] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const wakeLockRef = useRef(null)

  // Check if Wake Lock API is supported
  useEffect(() => {
    setIsSupported('wakeLock' in navigator)
  }, [])

  // Request wake lock
  const request = useCallback(async () => {
    if (!isSupported) return false

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      setIsLocked(true)

      // Trigger animation
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)

      // Handle wake lock release (e.g., when tab becomes hidden)
      wakeLockRef.current.addEventListener('release', () => {
        setIsLocked(false)
      })

      console.log('[WakeLock] Screen wake lock acquired')
      return true
    } catch (err) {
      // Wake lock request failed - this is expected in some cases
      // (e.g., low battery mode, tab not visible)
      console.log('[WakeLock] Wake lock request failed:', err.message)
      setIsLocked(false)
      return false
    }
  }, [isSupported])

  // Release wake lock
  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
        setIsLocked(false)
        console.log('[WakeLock] Screen wake lock released')
        return true
      } catch (err) {
        console.log('[WakeLock] Wake lock release failed:', err.message)
        return false
      }
    }
    return false
  }, [])

  // Toggle wake lock
  const toggle = useCallback(async () => {
    if (isLocked) {
      return await release()
    } else {
      return await request()
    }
  }, [isLocked, request, release])

  // Auto-activate wake lock on mount if enabled
  useEffect(() => {
    if (autoActivate && isSupported) {
      request()
    }

    return () => {
      release()
    }
  }, [autoActivate, isSupported, request, release])

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLocked && isSupported) {
        // Re-request if we were locked before
        request()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isLocked, isSupported, request])

  return {
    isLocked,
    isSupported,
    isAnimating,
    toggle,
    request,
    release
  }
}

export default useWakeLock
