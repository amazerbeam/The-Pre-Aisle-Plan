import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { routeTitle } from '../constants/appRoutes'

/** Keeps the browser tab title in step with the current section and the active theme's brand. Call once, in App. */
export default function useDocumentTitle() {
  const { pathname } = useLocation()
  const { theme } = useTheme()
  const appName = theme.brand.name
  useEffect(() => { document.title = routeTitle(pathname, appName) }, [pathname, appName])
}
