import { useEffect, useRef, useState } from 'react'
import { useShoppingList } from '../../contexts/ShoppingListContext'
import { useTheme } from '../../contexts/ThemeContext'
import { formatWeekRange } from '../../utils/dateUtils'
import { pageCopy } from '../../utils/themeCopy'
import ConfirmDialog from '../common/ConfirmDialog'

const MADE_AT_FORMAT = { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }

/**
 * ShoppingListHeader - title line, progress card, actions menu and out-of-date banner
 * Supports FR-019 (display metadata), FR-021 (uncheck all)
 *
 * onGenerateClick(mode): 'list' = regenerate for the list's own dates,
 * 'custom' = new list for other dates.
 */
const ShoppingListHeader = ({ onGenerateClick, hideTicked, onToggleHideTicked, wakeLock }) => {
  const { shoppingList, uncheckAll } = useShoppingList()
  const heading = pageCopy(useTheme().theme, 'shopping')
  const [showUncheckDialog, setShowUncheckDialog] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    const handlePointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('touchstart', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('touchstart', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen])

  const handleConfirmUncheckAll = () => {
    uncheckAll()
    setShowUncheckDialog(false)
  }

  const choose = (handler) => () => {
    setMenuOpen(false)
    handler()
  }

  const range = shoppingList ? formatWeekRange(shoppingList.startDate, shoppingList.endDate) : ''
  const madeAt = shoppingList?.generatedAt
    ? new Date(shoppingList.generatedAt).toLocaleString('en-GB', MADE_AT_FORMAT)
    : null
  const checked = shoppingList?.checkedItems ?? 0
  const total = shoppingList?.totalItems ?? 0
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0
  const allDone = total > 0 && checked === total

  return (
    <>
      <div className="shopping-list-header">
        <div className="header-left">
          <h1>{heading?.title ?? 'Shopping list'}</h1>
          {shoppingList && (
            <p className="list-meta">
              For <b>{range}</b>{madeAt && <> · made {madeAt}</>}
            </p>
          )}
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="sl-btn"
            aria-pressed={hideTicked}
            onClick={() => onToggleHideTicked(!hideTicked)}
          >
            Hide ticked
          </button>
          {wakeLock?.isSupported && (
            <button
              type="button"
              className="sl-btn"
              aria-pressed={wakeLock.isLocked}
              onClick={wakeLock.toggle}
              aria-label="Keep screen on"
            >
              🔆 <span className="sl-btn-label">Keep screen on</span>
            </button>
          )}
          <div className="sl-menu" ref={menuRef}>
            <button
              type="button"
              className="sl-kebab"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Shopping list actions"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ⋯
            </button>
            {menuOpen && (
              <ul className="sl-menu-list" role="menu">
                <li role="none">
                  <button type="button" role="menuitem" onClick={choose(() => onGenerateClick('list'))}>
                    ↻ Regenerate for {range}
                  </button>
                </li>
                <li role="none">
                  <button type="button" role="menuitem" onClick={choose(() => onGenerateClick('custom'))}>
                    📅 New list for other dates…
                  </button>
                </li>
                <li role="none">
                  <button type="button" role="menuitem" onClick={choose(() => setShowUncheckDialog(true))}>
                    ☐ Uncheck all…
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {shoppingList && (
        <div className="sl-progress">
          <span className="sl-progress-count">{checked} / {total}</span>
          <div
            className="sl-progress-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={checked}
            aria-label="Items in the basket"
          >
            <i style={{ width: `${pct}%` }} />
          </div>
          <span className="sl-progress-note">{allDone ? 'All done 🎉' : `${pct}% in the basket`}</span>
        </div>
      )}

      {shoppingList?.planChangedSinceGenerated && (
        <div className="sl-stale" role="status">
          <span>⚠️ Your meal plan changed after this list was made.</span>
          <button type="button" onClick={() => onGenerateClick('list')}>Regenerate</button>
        </div>
      )}

      <ConfirmDialog
        isOpen={showUncheckDialog}
        title="Uncheck All Items?"
        message="This will uncheck all items in your shopping list. You can re-check them as needed."
        confirmText="Uncheck All"
        cancelText="Cancel"
        onConfirm={handleConfirmUncheckAll}
        onCancel={() => setShowUncheckDialog(false)}
      />
    </>
  )
}

export default ShoppingListHeader
