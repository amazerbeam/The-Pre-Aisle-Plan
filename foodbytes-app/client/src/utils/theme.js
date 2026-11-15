import { THEME_STORAGE_KEY, DEFAULT_THEME_ID, themeById } from '../constants/themes'

export function readThemeId() {
  try { return themeById(localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID).id } catch { return DEFAULT_THEME_ID }
}

export function applyTheme(id) {
  const theme = themeById(id)
  const root = document.documentElement
  if (theme.id === DEFAULT_THEME_ID) delete root.dataset.theme
  else root.dataset.theme = theme.id
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.themeColor)
  if (theme.fontsHref && !document.querySelector(`link[data-theme-fonts="${theme.id}"]`)) {
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: theme.fontsHref })
    link.dataset.themeFonts = theme.id
    document.head.appendChild(link)
  }
  try { localStorage.setItem(THEME_STORAGE_KEY, theme.id) } catch { /* storage blocked: theme still applies this session */ }
}
