import Button from '../common/Button';
import './LoginButton.css';

const LoginButton = ({ provider, onClick }) => {
  const providerConfig = {
    google: {
      name: 'Google',
      icon: '🔵',
      color: '#4285F4',
    },
    github: {
      name: 'GitHub',
      icon: '⚫',
      color: '#24292e',
    },
  };

  const config = providerConfig[provider];

  return (
    <button
      className="login-button"
      onClick={() => onClick(provider)}
      style={{ backgroundColor: config.color }}
    >
      <span className="login-button__icon">{config.icon}</span>
      <span className="login-button__text">Continue with {config.name}</span>
    </button>
  );
};

export default LoginButton;
