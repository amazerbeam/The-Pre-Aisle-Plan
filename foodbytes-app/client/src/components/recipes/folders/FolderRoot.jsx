import FolderTiles from './FolderTiles'
import { childrenOf } from '../../../utils/recipeFolderTree'
import './RecipeFolders.css'

/** Folders top level: your folders as tiles, then a label for the recipes that are not filed yet. */
function FolderRoot({ folders, isHiddenKey, unfiledCount, dropProps, onOpenFolder, onNewFolder, canDrag }) {
  return (
    <div className="folder-root">
      <div className="folder-section-label">Your folders <small>{childrenOf(folders, null).length}</small></div>
      <FolderTiles folders={folders} parentId={null} isHiddenKey={isHiddenKey} dropProps={dropProps}
        onOpenFolder={onOpenFolder} newLabel="＋ New folder" onNew={onNewFolder} />
      <div className="folder-section-label">
        Not in a folder yet
        <small>{unfiledCount} recipe{unfiledCount === 1 ? '' : 's'} · file them from ⋯{canDrag ? ' or drag onto a folder' : ''}</small>
      </div>
    </div>
  )
}

export default FolderRoot
