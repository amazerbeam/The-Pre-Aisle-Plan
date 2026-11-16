import FolderIcon from './FolderIcon'
import './RecipeFolders.css'

const MAX_CHIPS = 3

/** Folders a recipe card is filed in (Folders view), minus the open one. Renders nothing when there are none. */
function FolderChips({ folders, recipeKey, excludeId, onOpenFolder }) {
  const homes = folders.filter((f) => f.id !== excludeId && f.recipeIds.includes(recipeKey))
  if (homes.length === 0) return null
  return (
    <div className="folder-chips">
      {homes.slice(0, MAX_CHIPS).map((f) => (
        <button key={f.id} type="button" className="folder-chip" onClick={() => onOpenFolder(f.id)}>
          <FolderIcon size={12} />{f.name}
        </button>
      ))}
      {homes.length > MAX_CHIPS && <span className="folder-chip-more">+{homes.length - MAX_CHIPS}</span>}
    </div>
  )
}

export default FolderChips
