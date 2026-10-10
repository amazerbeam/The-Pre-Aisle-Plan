import { useEffect, useState } from 'react'
import { getHealth } from '../services/healthService'
import { UNKNOWN_BUILD_VALUE, WEB_BUILT_AT, WEB_VERSION } from '../constants/buildInfo'

const WEB = { version: WEB_VERSION, builtAt: WEB_BUILT_AT }

// Resolved /api/health payload, shared across mounts so re-opening the account menu does
// not refetch. Failures are deliberately not cached, so the next open retries.
let cachedApi = null

/**
 * MPP-9: web build identity (baked in) plus the API's (fetched once). Status is
 * 'loading' | 'success' | 'error'. "Empty" (a 200 missing fields) is normalised per field
 * to 'unknown', which never counts as a mismatch. Only versions are compared; build times
 * of separately deployed services legitimately differ.
 */
function useBuildInfo() {
  const [api, setApi] = useState(cachedApi)
  const [status, setStatus] = useState(cachedApi ? 'success' : 'loading')

  useEffect(() => {
    if (cachedApi) return undefined
    const controller = new AbortController()
    getHealth({ signal: controller.signal })
      .then((data) => {
        cachedApi = normaliseHealth(data)
        setApi(cachedApi)
        setStatus('success')
      })
      .catch(() => {
        // An abort (menu closed mid-request) is not an error; the next mount retries.
        if (controller.signal.aborted) return
        setStatus('error')
      })
    return () => controller.abort()
  }, [])

  const versionMismatch =
    status === 'success' && api.version !== UNKNOWN_BUILD_VALUE && api.version !== WEB.version

  return { status, web: WEB, api, versionMismatch }
}

function normaliseHealth(data) {
  return {
    version: knownOrUnknown(data?.version),
    builtAt: knownOrUnknown(data?.builtAt),
  }
}

function knownOrUnknown(value) {
  return typeof value === 'string' && value.trim() ? value : UNKNOWN_BUILD_VALUE
}

export default useBuildInfo
