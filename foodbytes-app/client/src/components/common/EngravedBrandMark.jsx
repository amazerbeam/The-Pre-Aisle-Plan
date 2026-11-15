/** Quill crest for the Parchment header (iconSet 'engraved'). Decorative; HeaderBrand labels the button. */
function EngravedBrandMark({ size = 40, className }) {
  return (
    <svg className={className} viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="12.3" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.2 1.6" />
      <path d="M23 7c-6 1-10 6-11.5 12L10 25l2.6-2.8C18.5 21 22.4 15.6 23 7z" fill="currentColor" />
      <path d="M12.4 21.6l5.2-6" style={{ stroke: 'var(--leather)' }} strokeWidth="1" />
    </svg>
  )
}

export default EngravedBrandMark
