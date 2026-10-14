import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PET_ROUTE, PIP_HANDOFF_DELAY_MS } from '../constants/pet'

/**
 * MPP-34: after a confirmed eaten tick, wait a short beat so "✓ Eaten" registers, then push
 * /pet (a normal history entry, so Back returns to the meal plan — AC 5). Leaving the meal
 * plan unmounts the recipe modal, which closes it. cancel() (Undo) or unmounting (modal
 * closed during the beat) clears the timer, so nothing navigates (AC 4).
 * The beat is the same under reduced motion; there is no route transition to suppress (AC 2).
 *
 * @returns {{ schedule: () => void, cancel: () => void }}
 */
export function useTakeToPip() {
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!pending) return undefined
    const timerId = setTimeout(() => navigate(PET_ROUTE), PIP_HANDOFF_DELAY_MS)
    return () => clearTimeout(timerId)
  }, [pending, navigate])

  return { schedule: () => setPending(true), cancel: () => setPending(false) }
}

export default useTakeToPip
