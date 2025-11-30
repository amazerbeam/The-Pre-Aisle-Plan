import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Footer.module.css';

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <footer className={styles.footer}>
      <nav className={styles.nav}>
        <button
          className={`${styles.navButton} ${isActive('/') ? styles.active : ''}`}
          onClick={() => navigate('/')}
        >
          <span className={styles.icon}>📚</span>
          <span className={styles.label}>Recipes</span>
        </button>

        {isAuthenticated && (
          <>
            <button
              className={`${styles.navButton} ${isActive('/meal-plan') ? styles.active : ''}`}
              onClick={() => navigate('/meal-plan')}
            >
              <span className={styles.icon}>📅</span>
              <span className={styles.label}>Meal Plan</span>
            </button>

            <button
              className={`${styles.navButton} ${isActive('/shopping') ? styles.active : ''}`}
              onClick={() => navigate('/shopping')}
            >
              <span className={styles.icon}>🛒</span>
              <span className={styles.label}>Shopping</span>
            </button>
          </>
        )}
      </nav>
    </footer>
  );
};
