import useAppNav from '../../hooks/useAppNav'
import AppNavItems from './AppNavItems'

/** Desktop (≥1024px) section tabs in the header; the footer carries the same items below that width. */
function HeaderNav() {
  const { items, message } = useAppNav()
  return <div className="header-nav"><AppNavItems variant="header" items={items} message={message} /></div>
}

export default HeaderNav
