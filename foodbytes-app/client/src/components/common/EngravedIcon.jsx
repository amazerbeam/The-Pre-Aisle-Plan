import { ENGRAVED_ICONS } from '../../constants/engravedIcons'

/** Thin-stroke engraved icon (iconSet 'engraved'). Decorative: the caller supplies the label. */
function EngravedIcon({ name, size = 24, className }) {
  const paths = ENGRAVED_ICONS[name]
  if (!paths) return null
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths.map((d) => <path key={d} d={d} />)}
    </svg>
  )
}

export default EngravedIcon
