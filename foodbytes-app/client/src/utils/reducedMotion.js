// MPP-29: the one reduced-motion read for JS-timed scenes (cook-and-serve, growth). CSS
// handles its own animations with @media (prefers-reduced-motion: reduce).
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** True when the viewer asked for reduced motion; false where matchMedia is missing (node checks). */
export const prefersReducedMotion = () => window.matchMedia?.(REDUCED_MOTION_QUERY).matches === true
