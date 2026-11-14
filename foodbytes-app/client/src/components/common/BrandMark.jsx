/**
 * My Pantry Plan logo (option C, "Plate P", chosen 2026-11-14): a purple tile, a white plate,
 * the P as the meal, and a Pip-green leaf. The same path data lives in public/favicon.svg and
 * public/icons/brand-mark*.svg; change all three together.
 * Decorative by default (aria-hidden); pass `title` when the mark stands alone as the only label.
 */
const BRAND_PURPLE = '#4a3f80'
const PLATE_RING = '#e3dff2'
const LEAF_GREEN = '#7cc36b'

function BrandMark({ size = 40, title, className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" width={size} height={size}
         role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} focusable="false">
      {title && <title>{title}</title>}
      <rect width="100" height="100" rx="24" fill={BRAND_PURPLE} />
      <circle cx="50" cy="52" r="33" fill="#fff" />
      <circle cx="50" cy="52" r="24" fill="none" stroke={PLATE_RING} strokeWidth="3" />
      <path d="M42 70V36h12a10 10 0 0 1 0 20H42" fill="none" stroke={BRAND_PURPLE} strokeWidth="9"
            strokeLinejoin="round" strokeLinecap="round" />
      <path d="M66 30c-8-1-14 4-14 11 8 1 14-4 14-11z" fill={LEAF_GREEN} />
    </svg>
  )
}

export default BrandMark
