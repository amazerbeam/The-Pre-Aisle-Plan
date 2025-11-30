import { NavLink } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <nav className={styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}>📋</span>
          <span className={styles.label}>Recipes</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}>📅</span>
          <span className={styles.label}>Meal Plan</span>
        </NavLink>

        <NavLink
          to="/shopping"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.icon}>🛒</span>
          <span className={styles.label}>Shopping</span>
        </NavLink>
      </nav>
    </footer>
  );
};

export default Footer;
