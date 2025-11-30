import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          The Pre-Aisle Plan
        </Link>

        <nav className={styles.nav}>
          {isAuthenticated ? (
            <>
              <span className={styles.userName}>{user?.name}</span>
              {user?.isAdmin && <span className={styles.adminBadge}>Admin</span>}
              <button onClick={logout} className={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.loginLink}>Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
