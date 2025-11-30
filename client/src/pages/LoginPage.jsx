import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to FoodBytes</h1>
        <p className={styles.subtitle}>
          Plan your meals, organize your shopping, and simplify your week.
        </p>
        <div className={styles.signInContainer}>
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
};
