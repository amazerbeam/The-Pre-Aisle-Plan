import FolderIcon from './FolderIcon'
import FolderTree from './FolderTree'
import './RecipeFolders.css'

/** Desktop folder tree beside the recipe grid (Folders view). */
function FolderSidebar({ treeProps, canDrag, onNewFolder }) {
  return (
    <aside className="folder-sidebar" aria-label="Recipe folders">
      <div className="folder-sidebar-head">
        <FolderIcon /> <span>My folders</span>
        {canDrag && <small>drag a card onto one</small>}
      </div>
      <FolderTree mode="nav" {...treeProps} />
      <button type="button" className="folder-new-btn" onClick={onNewFolder}>＋ New folder</button>
    </aside>
  )
}

export default FolderSidebar
