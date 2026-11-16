import FolderIcon from './FolderIcon'
import { childrenOf, visibleCount } from '../../../utils/recipeFolderTree'
import './RecipeFolders.css'

/** Grid of folder tiles (name + counts) with an optional dashed "new" tile. Shared by FolderHeader and FolderRoot. */
function FolderTiles({ folders, parentId, isHiddenKey, dropProps, onOpenFolder, newLabel, onNew }) {
  return (
    <div className="folder-tiles">
      {childrenOf(folders, parentId).map((f) => {
        const recipes = visibleCount(f, isHiddenKey)
        const subs = childrenOf(folders, f.id).length
        return (
          <button key={f.id} type="button" className="folder-tile" onClick={() => onOpenFolder(f.id)} {...dropProps?.(f.id)}>
            <FolderIcon size={22} />
            <span className="folder-tile-text">
              <b>{f.name}</b>
              <small>{recipes} recipe{recipes === 1 ? '' : 's'}{subs > 0 && ` · ${subs} folder${subs === 1 ? '' : 's'}`}</small>
            </span>
          </button>
        )
      })}
      {onNew && <button type="button" className="folder-tile add" onClick={onNew}>{newLabel}</button>}
    </div>
  )
}

export default FolderTiles
