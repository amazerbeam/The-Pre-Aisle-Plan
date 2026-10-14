import { SHOP_TABS } from '../../../constants/petDecor'

/**
 * MPP-27: Upgrades | Decor | Walls & floors (mockup .tabs). WAI-ARIA tabs: the selected tab is the
 * one tab stop, and Left / Right move between tabs. idPrefix ties each tab to the sheet's panel.
 */
function ShopTabs({ tab, idPrefix, onSelect }) {
  const onKeyDown = (event) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const index = SHOP_TABS.findIndex(t => t.key === tab)
    const next = SHOP_TABS[(index + step + SHOP_TABS.length) % SHOP_TABS.length]
    onSelect(next.key)
    document.getElementById(`${idPrefix}-tab-${next.key}`)?.focus()
  }

  return (
    <div className="pip-shop-tabs" role="tablist" onKeyDown={onKeyDown}>
      {SHOP_TABS.map(({ key, label }) => (
        <button
          key={key}
          id={`${idPrefix}-tab-${key}`}
          type="button"
          role="tab"
          className="pip-shop-tab"
          aria-selected={tab === key}
          aria-controls={`${idPrefix}-panel`}
          tabIndex={tab === key ? 0 : -1}
          onClick={() => onSelect(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default ShopTabs
