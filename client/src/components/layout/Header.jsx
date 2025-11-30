import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import styles from './Header.module.css';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.logo}>FoodBytes</h1>
        {isAuthenticated && (
          <div className={styles.userSection}>
            <span className={styles.userName}>{user?.name}</span>
            <Button variant="ghost" size="small" onClick={logout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
