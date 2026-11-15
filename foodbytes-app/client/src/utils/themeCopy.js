// Themed copy from the THEMES registry (`copy` field). Themes without it keep the plain strings,
// so Default and Cyberpunk render exactly what they did before Parchment.

/** Themed nav label, or the caller's plain label when the theme has none. */
export const navLabel = (theme, key, fallback) => theme?.copy?.nav?.[key] ?? fallback

/** { title, sub } for a page, or null when the theme keeps the plain heading. */
export const pageCopy = (theme, key) => theme?.copy?.pages?.[key] ?? null
