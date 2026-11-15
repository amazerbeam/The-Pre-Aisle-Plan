import { useCallback, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import LoginModal from '../auth/LoginModal'
import DateRangePicker from '../common/DateRangePicker'
import HeaderBrand from './HeaderBrand'
import HeaderNav from './HeaderNav'
import UserMenu from './UserMenu'
import './Header.css'

function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const avatarRef = useRef(null)
  // Stable so UserMenu's document listeners are not torn down and re-added on every Header render.
  const closeUserMenu = useCallback(() => setShowUserMenu(false), [])

  return (
    <header className="header">
      <div className="header-content">
        <HeaderBrand />

        <HeaderNav />

        {/* FR-007: week pill (renders nothing for guests) */}
        <div className="header-week"><DateRangePicker /></div>

        <div className="header-account">
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button
                ref={avatarRef}
                className="avatar-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="Account menu"
                aria-expanded={showUserMenu}
                aria-haspopup="dialog"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="avatar" />
                ) : (
                  <div className="avatar-placeholder">{user.name?.charAt(0).toUpperCase()}</div>
                )}
              </button>

              {showUserMenu && (
                <UserMenu
                  user={user}
                  onSignOut={logout}
                  onClose={closeUserMenu}
                  anchorRef={avatarRef}
                />
              )}
            </div>
          ) : (
            <button className="sign-in-btn-pill" onClick={() => setShowLoginModal(true)}>
              Sign In
            </button>
          )}
        </div>
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </header>
  )
}

export default Header
