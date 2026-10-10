/**
 * MPP-9: build identity baked in by vite.config.js `define` at build time.
 * __APP_VERSION__ comes from package.json; __APP_BUILT_AT__ is the ISO timestamp of the build.
 * Read these constants, never the magic globals, so the identifiers live in one place.
 */
export const UNKNOWN_BUILD_VALUE = 'unknown'
export const WEB_VERSION = __APP_VERSION__
export const WEB_BUILT_AT = __APP_BUILT_AT__

// GET /api/health is tiny; anything slower than this means the API is down or deploying.
export const HEALTH_TIMEOUT_MS = 5000
