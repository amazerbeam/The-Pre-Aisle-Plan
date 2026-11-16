import '../RecipeCard.css'
import { useEffect, useRef, useState } from 'react'

/** ⋯ menu on a folder row or header: open / add recipes, new subfolder, rename, move, delete. */
function FolderActionsMenu({
  folder, canAddSubfolder, isCurrent, onOpen, onAddRecipes, onNewSubfolder, onRename, onMove, onDelete
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const choose = (handler) => () => {
    setOpen(false)
    handler?.()
  }

  return (
    <div className="recipe-card-menu folder-actions" ref={wrapperRef}>
      <button
        type="button"
        className="recipe-card-menu-trigger folder-actions-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Folder actions for ${folder.name}`}
      >
        ⋯
      </button>
      {open && (
        <ul className="recipe-card-menu-list" role="menu">
          <li role="none">
            {isCurrent
              ? <button role="menuitem" type="button" onClick={choose(onAddRecipes)}>＋ Add recipes…</button>
              : <button role="menuitem" type="button" onClick={choose(onOpen)}>📂 Open</button>}
          </li>
          <li role="none">
            <button role="menuitem" type="button" disabled={!canAddSubfolder} onClick={choose(onNewSubfolder)}>
              ＋ New subfolder{!canAddSubfolder && <small> (max depth)</small>}
            </button>
          </li>
          <li role="none">
            <button role="menuitem" type="button" onClick={choose(onRename)}>✎ Rename</button>
          </li>
          <li role="none">
            <button role="menuitem" type="button" onClick={choose(onMove)}>↳ Move to…</button>
          </li>
          <li role="none">
            <button role="menuitem" type="button" className="danger" onClick={choose(onDelete)}>🗑 Delete folder</button>
          </li>
        </ul>
      )}
    </div>
  )
}

export default FolderActionsMenu
