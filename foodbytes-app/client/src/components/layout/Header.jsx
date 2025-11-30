import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">🍽️</span>
          <span className="header__logo-text">FoodBytes</span>
        </Link>

        {user && (
          <div className="header__user">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="header__user-avatar"
              />
            )}
            <div className="header__user-menu">
              <button className="header__user-name">{user.name}</button>
              <div className="header__dropdown">
                <Link to="/profile" className="header__dropdown-item">
                  Profile
                </Link>
                <button onClick={handleLogout} className="header__dropdown-item">
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
