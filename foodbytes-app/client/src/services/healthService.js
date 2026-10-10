import api from './api'
import { HEALTH_TIMEOUT_MS } from '../constants/buildInfo'

/**
 * MPP-9: GET /api/health → { status, version, builtAt } (all strings).
 * Public endpoint, no auth needed. The caller owns the AbortSignal.
 */
export async function getHealth({ signal } = {}) {
  const response = await api.get('/health', { signal, timeout: HEALTH_TIMEOUT_MS })
  return response.data
}
