import FolderIcon from './FolderIcon'
import { pathOf } from '../../../utils/recipeFolderTree'
import './RecipeFolders.css'

/** Mobile: one button showing where you are; opens the Folders sheet. */
function FolderBar({ folders, currentId, onOpenSheet }) {
  const where = currentId == null ? 'All folders' : pathOf(folders, currentId).map((f) => f.name).join(' › ')
  return (
    <button type="button" className="folder-bar" aria-haspopup="dialog" onClick={onOpenSheet}>
      {currentId == null ? <span className="folder-icon" aria-hidden="true">☰</span> : <FolderIcon />}
      <span className="folder-bar-path">{where}</span>
      <span className="folder-bar-label">Folders ▾</span>
    </button>
  )
}

export default FolderBar
