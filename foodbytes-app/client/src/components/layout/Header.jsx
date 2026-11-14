import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoginModal from '../auth/LoginModal'
import BrandMark from '../common/BrandMark'
import DateRangePicker from '../common/DateRangePicker'
import HeaderNav from './HeaderNav'
import DefaultPortionsControl from './DefaultPortionsControl'
import MealTimesControl from './MealTimesControl'
import VersionInfo from './VersionInfo'
import { RECIPES_PATH } from '../../constants/appRoutes'
import './Header.css'

function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()

  const avatar = user?.avatarUrl ? (
    <img src={user.avatarUrl} alt="" className="avatar" />
  ) : (
    <div className="avatar-placeholder">{user?.name?.charAt(0).toUpperCase()}</div>
  )

  return (
    <header className="header">
      <div className="header-content">
        {/* FR-039: the brand navigates to Recipes */}
        <button className="brand-btn" onClick={() => navigate(RECIPES_PATH)} title="Go to Recipes" aria-label="My Pantry Plan, go to Recipes">
          <BrandMark size={40} className="brand-mark" />
          <span className="brand-word" aria-hidden="true">My Pantry <span>Plan</span></span>
        </button>

        <HeaderNav />

        {/* FR-007: week pill (renders nothing for guests) */}
        <div className="header-week"><DateRangePicker /></div>

        <div className="header-account">
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button
                className="avatar-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User menu"
                aria-expanded={showUserMenu}
                aria-haspopup="menu"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="avatar" />
                ) : (
                  <div className="avatar-placeholder">{user.name?.charAt(0).toUpperCase()}</div>
                )}
              </button>

              {showUserMenu && (
                <div className="user-dropdown" role="menu" aria-label="Account">
                  <div className="user-who">
                    {avatar}
                    <div className="user-info">
                      <span className="user-name-full">{user.name}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </div>
                  <section className="user-section" aria-label="Portions"><DefaultPortionsControl /></section>
                  <section className="user-section" aria-label="Meal times"><MealTimesControl /></section>
                  <button className="logout-btn" onClick={logout}>↩ Sign out</button>
                  {/* MPP-9: mounts only while the menu is open, so /api/health is fetched lazily */}
                  <VersionInfo />
                </div>
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
