export const THEME_STORAGE_KEY = 'fb.display.theme'
export const LOW_FX_STORAGE_KEY = 'fb.display.lowFx'
export const LOW_FX_BODY_CLASS = 'lowfx'
export const DEFAULT_THEME_ID = 'default'
export const THEMES = [
  { id: 'default', label: 'Default', themeColor: '#4a3f80', fontsHref: null,
    iconSet: 'line', effects: false, ticker: false, ambient: null,
    brand: { name: 'My Pantry Plan', wordmark: { before: 'My Pantry ', accent: 'Plan', after: '', accentClass: null }, sub: null, loginTitle: 'Welcome to My Pantry Plan', loginSub: 'Sign in to unlock all features' } },
  { id: 'cyberpunk', label: 'Cyberpunk', themeColor: '#05070b',
    fontsHref: 'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Silkscreen:wght@400;700&family=Space+Grotesk:wght@400..700&family=VT323&display=swap',
    iconSet: 'pixel', effects: true, ticker: true, ambient: 'city-rain',
    brand: { name: 'FOODBYTES', wordmark: { before: 'FOOD', accent: 'B', after: 'YTES', accentClass: 'brand-flicker' }, sub: 'NIGHT KITCHEN · SECTOR 9', loginTitle: 'FOODBYTES', loginSub: 'Night Kitchen · Sector 9. Sign in to plan your week and build your supply run.' } },
  { id: 'parchment', label: 'Parchment', themeColor: '#3b2415',
    fontsHref: 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=EB+Garamond:ital,wght@0,400..700;1,400..600&family=Homemade+Apple&family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&display=swap',
    iconSet: 'engraved', effects: true, ticker: false, ambient: 'candlelight',
    brand: { name: 'The Kitchen Grimoire', wordmark: { before: 'The Kitchen Grimoire', accent: '', after: '', accentClass: null }, sub: 'Receipts, provisions & the weekly almanac', loginTitle: 'The Kitchen Grimoire', loginSub: 'Sign your name to open the book and plan your week.' },
    copy: {
      nav: { recipes: 'Receipts', mealplan: 'Ledger', shopping: 'Provisions' },
      pages: {
        recipes: { title: 'The Receipt Book', sub: 'Tried & true dishes, set down in good ink' },
        mealplan: { title: 'The Week’s Ledger', sub: null },
        shopping: { title: 'Provisions', sub: null },
      },
    } },
]
export const themeById = (id) => THEMES.find((t) => t.id === id) ?? THEMES[0]
