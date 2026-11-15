import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../../contexts/ThemeContext'
import useMediaQuery from '../../hooks/useMediaQuery'
import useBodyScrollLock from '../../hooks/useBodyScrollLock'
import DefaultPortionsControl from './DefaultPortionsControl'
import MealTimesControl from './MealTimesControl'
import ThemePicker from './ThemePicker'
import LowFxControl from './LowFxControl'
import VersionInfo from './VersionInfo'
import './UserMenu.css'

const MOBILE_QUERY = '(max-width: 767px)'
const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Account menu: anchored dropdown on desktop, portalled bottom sheet over a scrim on mobile.
 * Sections: who, Planning, Appearance, Sign out, version line (MPP-9: VersionInfo mounts only
 * while the menu is open, so /api/health is fetched lazily).
 */
function UserMenu({ user, onSignOut, onClose, anchorRef }) {
  const { theme } = useTheme()
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const panelRef = useRef(null)
  useBodyScrollLock(isMobile)

  // Focus returns to the avatar on close.
  useEffect(() => {
    const anchor = anchorRef?.current
    return () => anchor?.focus()
  }, [anchorRef])

  // Focus moves in on open, and again when crossing the breakpoint: the panel remounts between the
  // inline dropdown and the portalled sheet, which drops focus to the body.
  useEffect(() => {
    panelRef.current?.querySelector(FOCUSABLE)?.focus()
  }, [isMobile])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !isMobile) return
      // The sheet is aria-modal: keep Tab / Shift+Tab inside it.
      const items = panelRef.current?.querySelectorAll(FOCUSABLE)
      if (!items?.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (!panelRef.current.contains(active) || (e.shiftKey && active === first)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMobile, onClose])

  // Desktop only: a press outside the panel closes it. The anchor toggles the menu itself.
  useEffect(() => {
    if (isMobile) return undefined
    const onPointerDown = (e) => {
      if (panelRef.current?.contains(e.target) || anchorRef?.current?.contains(e.target)) return
      onClose()
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [isMobile, onClose, anchorRef])

  const initial = user?.name?.charAt(0).toUpperCase()

  const panel = (
    <div
      ref={panelRef}
      className={`user-menu ${isMobile ? 'user-menu--sheet' : 'user-menu--dropdown'}`}
      role="dialog"
      aria-modal={isMobile}
      aria-label="Account"
    >
      {isMobile && <div className="user-menu__grab" aria-hidden="true" />}
      <div className="user-menu__who">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="user-menu__avatar" />
        ) : (
          <div className="user-menu__avatar user-menu__avatar--placeholder" aria-hidden="true">{initial}</div>
        )}
        <div className="user-menu__who-text">
          <span className="user-menu__name">{user?.name}</span>
          <span className="user-menu__email">{user?.email}</span>
        </div>
        {isMobile && (
          <button type="button" className="user-menu__close" onClick={onClose} aria-label="Close account menu">✕</button>
        )}
      </div>

      <div className="user-menu__scroll">
        <section className="user-menu__section user-menu__section--planning" aria-labelledby="user-menu-planning">
          <h3 id="user-menu-planning">Planning</h3>
          <DefaultPortionsControl />
          <MealTimesControl />
        </section>

        <section className="user-menu__section" aria-labelledby="user-menu-appearance">
          <h3 id="user-menu-appearance">Appearance</h3>
          <ThemePicker />
          {theme.effects && <LowFxControl />}
          <p className="user-menu__saved">Saved on this device</p>
        </section>

        <button type="button" className="user-menu__signout" onClick={onSignOut}>↩ Sign out</button>
        <VersionInfo />
      </div>
    </div>
  )

  return isMobile
    ? createPortal(
        <div className="user-menu__scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
          {panel}
        </div>,
        document.body,
      )
    : panel
}

export default UserMenu
