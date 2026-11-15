import { createContext, useState, useContext, useMemo } from 'react'
import { themeById } from '../constants/themes'
import { readThemeId, applyTheme } from '../utils/theme'
import { readLowFx, applyLowFx } from '../utils/lowFx'

const ThemeContext = createContext()

/**
 * Display theme and Low FX switch, both remembered per device (localStorage).
 * The setters apply to the DOM first, then update state so consumers re-render.
 */
export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(readThemeId)
  const [lowFx, setLowFx] = useState(readLowFx)

  const value = useMemo(() => ({
    themeId,
    theme: themeById(themeId),
    setTheme: (id) => {
      applyTheme(id)
      setThemeId(themeById(id).id)
    },
    lowFx,
    toggleLowFx: () => {
      applyLowFx(!lowFx)
      setLowFx(!lowFx)
    },
  }), [themeId, lowFx])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
