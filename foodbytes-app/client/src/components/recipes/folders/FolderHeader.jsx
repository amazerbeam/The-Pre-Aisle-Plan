import FolderIcon from './FolderIcon'
import FolderTiles from './FolderTiles'
import { canCreateIn, childrenOf, folderById, pathOf, visibleCount } from '../../../utils/recipeFolderTree'
import './RecipeFolders.css'

/** Top of an open folder: breadcrumbs, title, counts, actions and subfolder tiles. */
function FolderHeader({
  folders, folderId, isHiddenKey, dropProps, onOpenFolder, actions, onAddRecipes, onNewSubfolder, isMobile
}) {
  const folder = folderById(folders, folderId)
  if (!folder) return null
  const trail = pathOf(folders, folderId)
  const recipes = visibleCount(folder, isHiddenKey)
  const subs = childrenOf(folders, folderId).length

  return (
    <section className="folder-header" aria-label={`Folder ${folder.name}`}>
      <nav className="folder-crumbs" aria-label="Folder path">
        <button type="button" onClick={() => onOpenFolder(null)}>All folders</button>
        {trail.slice(0, -1).map((f) => (
          <span key={f.id} className="folder-crumb-step">
            <span aria-hidden="true">›</span>
            <button type="button" onClick={() => onOpenFolder(f.id)}>{f.name}</button>
          </span>
        ))}
      </nav>
      <div className="folder-title-row">
        <h2 className="folder-title"><FolderIcon size={22} />{folder.name}</h2>
        {!isMobile && <button type="button" className="folder-add-btn" onClick={onAddRecipes}>＋ Add recipes</button>}
        {actions}
      </div>
      <p className="folder-meta">
        {recipes} recipe{recipes === 1 ? '' : 's'}{subs > 0 && ` · ${subs} subfolder${subs === 1 ? '' : 's'}`}
      </p>
      {(subs > 0 || canCreateIn(folders, folderId)) && (
        <FolderTiles folders={folders} parentId={folderId} isHiddenKey={isHiddenKey} dropProps={dropProps}
          onOpenFolder={onOpenFolder} newLabel="＋ New subfolder"
          onNew={canCreateIn(folders, folderId) ? onNewSubfolder : undefined} />
      )}
    </section>
  )
}

export default FolderHeader
