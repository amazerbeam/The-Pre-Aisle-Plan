import { NavLink } from 'react-router-dom';
import './MobileNav.css';

const MobileNav = () => {
  return (
    <nav className="mobile-nav show-mobile">
      <NavLink
        to="/recipes"
        className={({ isActive }) =>
          isActive ? 'mobile-nav__link mobile-nav__link--active' : 'mobile-nav__link'
        }
      >
        <span className="mobile-nav__icon">📖</span>
        <span className="mobile-nav__text">Recipes</span>
      </NavLink>
      <NavLink
        to="/planner"
        className={({ isActive }) =>
          isActive ? 'mobile-nav__link mobile-nav__link--active' : 'mobile-nav__link'
        }
      >
        <span className="mobile-nav__icon">📅</span>
        <span className="mobile-nav__text">Plan</span>
      </NavLink>
      <NavLink
        to="/shopping"
        className={({ isActive }) =>
          isActive ? 'mobile-nav__link mobile-nav__link--active' : 'mobile-nav__link'
        }
      >
        <span className="mobile-nav__icon">🛒</span>
        <span className="mobile-nav__text">Shopping</span>
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          isActive ? 'mobile-nav__link mobile-nav__link--active' : 'mobile-nav__link'
        }
      >
        <span className="mobile-nav__icon">👤</span>
        <span className="mobile-nav__text">Profile</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;
