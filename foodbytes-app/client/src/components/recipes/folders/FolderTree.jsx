import FolderIcon from './FolderIcon'
import { childrenOf, visibleCount } from '../../../utils/recipeFolderTree'

/**
 * The folder tree. mode 'nav' opens folders (sidebar, mobile sheet); mode 'pick' ticks the folders a recipe
 * sits in (every level shown). `dropProps(id)` adds drag-and-drop handlers to a row on desktop.
 */
function FolderTree({
  mode, folders, currentId, openIds, onToggleOpen, onOpenFolder, isHiddenKey,
  pickedKey, onTogglePick, renderActions, dropProps, rootCount
}) {
  const picking = mode === 'pick'

  const renderLevel = (parentId, depth) => childrenOf(folders, parentId).map((f) => {
    const kids = childrenOf(folders, f.id)
    const open = picking || openIds?.has(f.id)
    const on = !picking && currentId === f.id
    const checked = picking && f.recipeIds.includes(pickedKey)
    const count = visibleCount(f, isHiddenKey)
    return (
      <div key={f.id} className="folder-branch">
        <div className={`folder-row ${on ? 'on' : ''} ${checked ? 'checked' : ''}`} style={{ '--d': depth }} {...dropProps?.(f.id)}>
          {kids.length > 0 && !picking ? (
            <button type="button" className="folder-row-toggle" aria-expanded={!!open}
              aria-label={`${open ? 'Collapse' : 'Expand'} ${f.name}`} onClick={() => onToggleOpen(f.id)}>
              <span aria-hidden="true">{open ? '▾' : '▸'}</span>
            </button>
          ) : <span className="folder-row-toggle none" aria-hidden="true" />}
          {picking ? (
            <button type="button" role="checkbox" aria-checked={checked} className="folder-row-name"
              onClick={() => onTogglePick(f.id)}>
              <span className={`folder-check ${checked ? 'on' : ''}`} aria-hidden="true">✓</span>
              <FolderIcon />
              <span className="folder-row-label">{f.name}</span>
              <span className="folder-row-count">{count}</span>
            </button>
          ) : (
            <>
              <button type="button" className="folder-row-name" aria-current={on ? 'true' : undefined}
                onClick={() => onOpenFolder(f.id)}>
                <FolderIcon />
                <span className="folder-row-label">{f.name}</span>
                <span className="folder-row-count">{count}</span>
              </button>
              {renderActions?.(f)}
            </>
          )}
        </div>
        {kids.length > 0 && open && renderLevel(f.id, depth + 1)}
      </div>
    )
  })

  return (
    <div className="folder-tree">
      {mode === 'nav' && (
        <div className={`folder-row ${currentId == null ? 'on' : ''}`} style={{ '--d': 0 }}>
          <span className="folder-row-toggle none" aria-hidden="true" />
          <button type="button" className="folder-row-name" aria-current={currentId == null ? 'true' : undefined}
            onClick={() => onOpenFolder(null)}>
            <span className="folder-icon" aria-hidden="true">☰</span>
            <span className="folder-row-label">All folders</span>
            <span className="folder-row-count">{rootCount}</span>
          </button>
        </div>
      )}
      {renderLevel(null, 0)}
    </div>
  )
}

export default FolderTree
