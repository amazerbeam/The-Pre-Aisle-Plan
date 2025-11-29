# Authentication Context
> Reference material for authentication-agent

## Technology Stack
- **Frontend**: React (web) with responsive design
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Auth Providers**: Google OAuth 2.0, GitHub OAuth
- **Token Management**: JWT (JSON Web Tokens)

## OAuth Flow
```
User clicks "Login with Google/GitHub"
    |
Frontend redirects to /api/auth/{provider}
    |
Express redirects to OAuth provider
    |
User authenticates with provider
    |
Provider redirects to /api/auth/{provider}/callback
    |
Express exchanges code for tokens
    |
Express creates/updates user in MySQL
    |
Express generates JWT
    |
Frontend stores JWT in localStorage
    |
Subsequent requests include JWT in Authorization header
```

## Backend Implementation

### Dependencies
```json
{
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0",
  "passport-github2": "^0.1.12",
  "jsonwebtoken": "^9.0.0",
  "express-session": "^1.17.3"
}
```

### Route Structure
```
/api/auth/google          - Initiate Google OAuth
/api/auth/google/callback - Google OAuth callback
/api/auth/github          - Initiate GitHub OAuth
/api/auth/github/callback - GitHub OAuth callback
/api/auth/me              - Get current user (requires JWT)
/api/auth/logout          - Clear session
```

### JWT Payload Structure
```javascript
{
  userId: number,
  email: string,
  name: string,
  isAdmin: boolean,
  iat: number,      // Issued at
  exp: number       // Expiration (7 days)
}
```

### Middleware Examples
```javascript
// authMiddleware.js - Verify JWT on protected routes
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// adminMiddleware.js - Verify admin role
const verifyAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
```

### Passport Configuration
```javascript
// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { findOrCreateUser } = require('../services/userService');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser({
        email: profile.emails[0].value,
        name: profile.displayName,
        oauthProvider: 'google',
        oauthId: profile.id
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback',
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
      const user = await findOrCreateUser({
        email,
        name: profile.displayName || profile.username,
        oauthProvider: 'github',
        oauthId: profile.id
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

module.exports = passport;
```

## Frontend Implementation

### Auth Context
```javascript
// contexts/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = (provider) => {
    window.location.href = `/api/auth/${provider}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Login Component
```javascript
// components/auth/LoginButton.jsx
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginButton.module.css';

const LoginButton = () => {
  const { login } = useAuth();

  return (
    <div className={styles.loginButtons}>
      <button onClick={() => login('google')} className={styles.btnGoogle}>
        Continue with Google
      </button>
      <button onClick={() => login('github')} className={styles.btnGithub}>
        Continue with GitHub
      </button>
    </div>
  );
};

export default LoginButton;
```

### Protected Route Component
```javascript
// components/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && !user.isAdmin) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  oauth_provider ENUM('google', 'github') NOT NULL,
  oauth_id VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  UNIQUE KEY unique_oauth (oauth_provider, oauth_id)
);
```

## Security Requirements

1. **HTTPS**: Required in production
2. **JWT Secret**: Strong, environment-variable stored secret (min 32 chars)
3. **Token Expiration**: 7 days default, configurable
4. **CORS**: Whitelist allowed origins
5. **Rate Limiting**: Limit auth endpoints to prevent abuse
6. **No Password Storage**: OAuth-only, no local passwords

## Environment Variables
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRATION=7d
FRONTEND_URL=http://localhost:3000
```

## Testing Checklist
- [ ] Google OAuth flow completes successfully
- [ ] GitHub OAuth flow completes successfully
- [ ] New user created on first login
- [ ] Existing user updated on subsequent logins
- [ ] JWT generated with correct payload
- [ ] Protected routes reject invalid/missing tokens
- [ ] Admin routes reject non-admin users
- [ ] Logout clears session properly
- [ ] Token expiration handled gracefully
