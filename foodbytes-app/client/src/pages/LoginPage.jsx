import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginButton from '../components/auth/LoginButton';
import './LoginPage.css';

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/recipes');
    }
  }, [user, navigate]);

  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__header">
          <h1 className="login-page__logo">
            <span className="login-page__logo-icon">🍽️</span>
            FoodBytes
          </h1>
          <p className="login-page__tagline">
            Plan your meals, organize your shopping, simplify your life.
          </p>
        </div>

        <div className="login-page__card">
          <h2>Sign in to continue</h2>
          <div className="login-page__buttons">
            <LoginButton provider="google" onClick={login} />
            <LoginButton provider="github" onClick={login} />
          </div>
        </div>

        <div className="login-page__footer">
          <p>Version 8.1.2</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
