import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { APP_ROUTES } from '../constants/appRoutes'

const NUDGE_MS = 3000

/** The four sections with active state and guest gating (sign-in nudge instead of navigating). */
export default function useAppNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuth()
  const [message, setMessage] = useState(null)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const select = useCallback((route) => {
    if (route.requiresAuth && !isAuthenticated) {
      clearTimeout(timer.current)
      setMessage(route.guestMessage)
      timer.current = setTimeout(() => setMessage(null), NUDGE_MS)
      return
    }
    navigate(route.path)
  }, [isAuthenticated, navigate])

  const items = APP_ROUTES.map(route => ({
    ...route, active: pathname === route.path, onSelect: () => select(route)
  }))
  return { items, message }
}
