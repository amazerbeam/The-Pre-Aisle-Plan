import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome to</h1>
        <h2 className={styles.brand}>The Pre-Aisle Plan</h2>
        <p className={styles.subtitle}>
          Plan your meals, organize your shopping, simplify your life.
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📋</span>
            <span>Browse delicious recipes</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📅</span>
            <span>Plan your meals for the week</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🛒</span>
            <span>Get organized shopping lists</span>
          </div>
        </div>

        <div className={styles.divider}>
          <span>Sign in to save your plans</span>
        </div>

        <div className={styles.authButtons}>
          <GoogleSignInButton />
        </div>

        <p className={styles.guestText}>
          Or <a href="/">browse recipes as a guest</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
