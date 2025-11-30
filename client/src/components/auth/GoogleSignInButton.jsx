import { useAuth } from '../../contexts/AuthContext';
import styles from './GoogleSignInButton.module.css';

const GoogleSignInButton = () => {
  const { login } = useAuth();

  return (
    <button onClick={login} className={styles.googleSignInBtn}>
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
      />
      Sign in with Google
    </button>
  );
};

export default GoogleSignInButton;
