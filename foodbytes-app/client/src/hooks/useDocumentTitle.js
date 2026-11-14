import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { routeTitle } from '../constants/appRoutes'

/** Keeps the browser tab title in step with the current section. Call once, in App. */
export default function useDocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => { document.title = routeTitle(pathname) }, [pathname])
}
