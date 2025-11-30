import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import styles from './GuestPrompt.module.css';

export const GuestPrompt = ({ message = 'Sign in to access this feature' }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.prompt}>
      <p className={styles.message}>{message}</p>
      <Button onClick={() => navigate('/login')}>Sign In</Button>
    </div>
  );
};
