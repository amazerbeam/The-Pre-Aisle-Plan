import { usePet } from '../../contexts/PetContext'
import { useTheme } from '../../contexts/ThemeContext'
import PixelIcon from '../common/PixelIcon'
import EngravedIcon from '../common/EngravedIcon'
import { navLabel } from '../../utils/themeCopy'
import PipHerb from '../pet/herb/PipHerb'
import { hatMiniViewBox, hatOnly } from '../pet/herb/wardrobeLayers'
import { PIP_DEFAULT_FORM } from '../../constants/pipGrowth'
import { isWilted } from '../../utils/pipGrowth'
import { PET_GUEST_TAB_LABEL } from '../../constants/pet'

const ICON_PROPS = { viewBox: '0 0 24 24', width: 24, height: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }

// Cyberpunk (iconSet 'pixel') draws the same three sections from the pixel grids.
const NAV_ICON_NAMES = { recipes: 'menu', mealplan: 'cal', shopping: 'cart' }

// Parchment (iconSet 'engraved') draws the same three sections as engraved glyphs.
const NAV_ENGRAVED_NAMES = { recipes: 'book', mealplan: 'ledger', shopping: 'basket' }

// One renderer per icon set; anything else falls back to the Default line icons.
const NAV_ICON_RENDERERS = {
  pixel: (key) => <PixelIcon name={NAV_ICON_NAMES[key]} size={24} />,
  engraved: (key) => <EngravedIcon name={NAV_ENGRAVED_NAMES[key]} size={24} />,
}

const NAV_ICONS = {
  recipes: (
    <svg {...ICON_PROPS} aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  mealplan: (
    <svg {...ICON_PROPS} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  shopping: (
    <svg {...ICON_PROPS} aria-hidden="true">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

/**
 * The four section buttons, shared by the footer tab bar and the desktop header.
 * `variant` ('footer' | 'header') prefixes the class names: `${variant}-nav`, `${variant}-btn`, `${variant}-message`.
 * MPP-14 AC 2 / MPP-31 / MPP-32: the Pip item is a live mini herb in the current mood and form,
 * wearing his hat only (a full outfit is too busy at this size); its label is the pet's name.
 */
function AppNavItems({ variant = 'footer', items, message }) {
  const { petName, mood, growth, wardrobe } = usePet()
  const { theme } = useTheme()
  const tabForm = growth?.form ?? PIP_DEFAULT_FORM
  const tabOutfit = hatOnly(wardrobe?.outfit)
  const messageClass = variant === 'footer' ? 'footer-message' : 'header-nav-message'

  return (
    <>
      {message && <div className={messageClass} role="status">{message}</div>}
      <nav className={`${variant}-nav`} aria-label="Main">
        {items.map(item => (
          <button
            key={item.key}
            type="button"
            className={`${variant}-btn ${item.active ? 'active' : ''}`}
            aria-current={item.active ? 'page' : undefined}
            onClick={item.onSelect}
          >
            {item.key === 'pet' ? (
              <>
                <PipHerb
                  form={tabForm}
                  mood={mood}
                  wilted={isWilted(growth)}
                  variant="mini"
                  outfit={tabOutfit}
                  viewBox={tabOutfit.HAT ? hatMiniViewBox(tabForm) : null}
                />
                <span className="footer-pet-label">{petName ?? PET_GUEST_TAB_LABEL}</span>
              </>
            ) : (
              <>
                {NAV_ICON_RENDERERS[theme.iconSet]?.(item.key) ?? NAV_ICONS[item.key]}
                <span>{navLabel(theme, item.key, item.label)}</span>
              </>
            )}
          </button>
        ))}
      </nav>
    </>
  )
}

export default AppNavItems
