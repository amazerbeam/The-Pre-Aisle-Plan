import { useEffect, useRef, useState } from 'react'
import './RecipeCard.css'

/** ⋯ overflow menu on a recipe card: View, folder filing, Hide / Unhide (when allowed), Edit (admin). */
function RecipeCardMenu({
  recipeName, isHidden, canHide, isAdmin, onView, onHide, onUnhide, onEdit,
  canFile, removeFromLabel, onAddToFolder, onRemoveFromFolder
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
    <div className="recipe-card-menu" ref={wrapperRef}>
      <button
        type="button"
        className="recipe-card-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${recipeName}`}
      >
        ⋯
      </button>
      {open && (
        <ul className="recipe-card-menu-list" role="menu">
          <li role="none">
            <button role="menuitem" type="button" onClick={choose(onView)}>📖 View recipe</button>
          </li>
          {canFile && (
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onAddToFolder)}>📁 Add to folder…</button>
            </li>
          )}
          {removeFromLabel && (
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onRemoveFromFolder)}>↩ Remove from {removeFromLabel}</button>
            </li>
          )}
          {isHidden && (
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onUnhide)}>👁 Unhide</button>
            </li>
          )}
          {!isHidden && canHide && (
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onHide)}>🙈 Hide from my recipes</button>
            </li>
          )}
          {isAdmin && (
            <li role="none">
              <button role="menuitem" type="button" onClick={choose(onEdit)}>✏️ Edit</button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default RecipeCardMenu
