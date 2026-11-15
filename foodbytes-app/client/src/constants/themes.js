export const THEME_STORAGE_KEY = 'fb.display.theme'
export const LOW_FX_STORAGE_KEY = 'fb.display.lowFx'
export const LOW_FX_BODY_CLASS = 'lowfx'
export const DEFAULT_THEME_ID = 'default'
export const THEMES = [
  { id: 'default', label: 'Default', themeColor: '#4a3f80', fontsHref: null,
    iconSet: 'line', effects: false, ticker: false,
    brand: { name: 'My Pantry Plan', wordmark: { before: 'My Pantry ', accent: 'Plan', after: '', accentClass: null }, sub: null, loginTitle: 'Welcome to My Pantry Plan', loginSub: 'Sign in to unlock all features' } },
  { id: 'cyberpunk', label: 'Cyberpunk', themeColor: '#05070b',
    fontsHref: 'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Silkscreen:wght@400;700&family=Space+Grotesk:wght@400..700&family=VT323&display=swap',
    iconSet: 'pixel', effects: true, ticker: true,
    brand: { name: 'FOODBYTES', wordmark: { before: 'FOOD', accent: 'B', after: 'YTES', accentClass: 'brand-flicker' }, sub: 'NIGHT KITCHEN · SECTOR 9', loginTitle: 'FOODBYTES', loginSub: 'Night Kitchen · Sector 9. Sign in to plan your week and build your supply run.' } },
]
export const themeById = (id) => THEMES.find((t) => t.id === id) ?? THEMES[0]
