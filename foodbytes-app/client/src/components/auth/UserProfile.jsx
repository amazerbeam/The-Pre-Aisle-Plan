import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import './UserProfile.css';

const UserProfile = () => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-profile__header">
        {user.picture && (
          <img
            src={user.picture}
            alt={user.name}
            className="user-profile__avatar"
          />
        )}
        <h2 className="user-profile__name">{user.name}</h2>
        <p className="user-profile__email">{user.email}</p>
        {isAdmin() && (
          <span className="badge badge--primary user-profile__badge">Admin</span>
        )}
      </div>

      <div className="user-profile__info">
        <div className="user-profile__info-item">
          <span className="user-profile__info-label">Provider:</span>
          <span className="user-profile__info-value">{user.provider}</span>
        </div>
        <div className="user-profile__info-item">
          <span className="user-profile__info-label">Member since:</span>
          <span className="user-profile__info-value">
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="user-profile__actions">
        <Button variant="danger" fullWidth onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
