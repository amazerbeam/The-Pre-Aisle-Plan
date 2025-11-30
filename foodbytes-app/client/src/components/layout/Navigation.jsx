import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="navigation hide-mobile">
      <NavLink
        to="/recipes"
        className={({ isActive }) =>
          isActive ? 'navigation__link navigation__link--active' : 'navigation__link'
        }
      >
        <span className="navigation__icon">📖</span>
        <span className="navigation__text">Recipes</span>
      </NavLink>
      <NavLink
        to="/planner"
        className={({ isActive }) =>
          isActive ? 'navigation__link navigation__link--active' : 'navigation__link'
        }
      >
        <span className="navigation__icon">📅</span>
        <span className="navigation__text">Plan</span>
      </NavLink>
      <NavLink
        to="/shopping"
        className={({ isActive }) =>
          isActive ? 'navigation__link navigation__link--active' : 'navigation__link'
        }
      >
        <span className="navigation__icon">🛒</span>
        <span className="navigation__text">Shopping</span>
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          isActive ? 'navigation__link navigation__link--active' : 'navigation__link'
        }
      >
        <span className="navigation__icon">👤</span>
        <span className="navigation__text">Profile</span>
      </NavLink>
    </nav>
  );
};

export default Navigation;
