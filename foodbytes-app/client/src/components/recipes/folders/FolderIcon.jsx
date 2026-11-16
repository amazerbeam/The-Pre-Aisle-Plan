import { useTheme } from '../../../contexts/ThemeContext'
import PixelIcon from '../../common/PixelIcon'
import EngravedIcon from '../../common/EngravedIcon'

const LINE = (size) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
)

// One renderer per icon set (as AppNavItems); anything else gets the Default line icon.
const RENDERERS = {
  pixel: (size) => <PixelIcon name="folder" size={size} />,
  engraved: (size) => <EngravedIcon name="folder" size={size} />,
}

/** Folder glyph in the active theme's icon set. Decorative: callers carry the accessible name. */
function FolderIcon({ size = 18 }) {
  const { theme } = useTheme()
  return <span className="folder-icon" aria-hidden="true">{(RENDERERS[theme.iconSet] || LINE)(size)}</span>
}

export default FolderIcon
