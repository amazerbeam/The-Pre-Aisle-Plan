import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import BrandMark from '../common/BrandMark'
import PixelBrandMark from '../common/PixelBrandMark'
import { RECIPES_PATH } from '../../constants/appRoutes'

// Keyed by the registry's iconSet field, never by theme id.
const MARKS = { line: BrandMark, pixel: PixelBrandMark }

/**
 * FR-039: the header brand navigates to Recipes. The mark and wordmark follow the active theme:
 * a registry entry with `brand.sub` gets the neon sign (name + subtitle), otherwise the plain wordmark.
 * The wordmark is brand.wordmark: text before / accent / after, the accent optionally carrying a class.
 */
function HeaderBrand() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const Mark = MARKS[theme.iconSet] ?? BrandMark
  const { name, sub, wordmark } = theme.brand
  const word = (
    <span className="brand-word" aria-hidden="true">
      {wordmark.before}<span className={wordmark.accentClass ?? undefined}>{wordmark.accent}</span>{wordmark.after}
    </span>
  )

  return (
    <button className="brand-btn" onClick={() => navigate(RECIPES_PATH)} title="Go to Recipes" aria-label={`${name}, go to Recipes`}>
      <Mark size={40} className="brand-mark" />
      {sub ? (
        <span className="brand-sign" aria-hidden="true">
          {word}
          <span className="brand-sub">{sub}</span>
        </span>
      ) : word}
    </button>
  )
}

export default HeaderBrand
