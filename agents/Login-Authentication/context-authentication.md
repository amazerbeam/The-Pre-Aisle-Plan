# Authentication Context
> Reference material for authentication-agent

## Technology Stack
- **Frontend**: React (web) with responsive design
- **Backend**: Java/Spring Boot
- **Database**: MySQL
- **Auth Providers**: Google OAuth 2.0, GitHub OAuth
- **Token Management**: JWT stored in httpOnly cookies (NOT localStorage)

## OAuth Flow
```
User clicks "Login with Google/GitHub"
    |
Frontend redirects to /api/auth/{provider}
    |
Backend redirects to OAuth provider
    |
User authenticates with provider
    |
Provider redirects to /api/auth/{provider}/callback
    |
Backend exchanges code for tokens
    |
Backend creates/updates user in MySQL
    |
Backend generates JWT
    |
Backend sets JWT in httpOnly cookie (secure, SameSite=Strict)
    |
Frontend redirects to app (cookie automatically sent with requests)
    |
Subsequent requests automatically include cookie
```

### Why httpOnly Cookies (NOT localStorage)
- **XSS Protection**: JavaScript cannot access httpOnly cookies, preventing token theft via XSS attacks
- **Automatic Transmission**: Browser automatically sends cookies with every request
- **CSRF Protection**: Use SameSite=Strict and CSRF tokens for protection

## Backend Implementation (Spring Boot)

### Dependencies (pom.xml)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
```

### Route Structure
```
GET  /api/auth/google          - Initiate Google OAuth
GET  /api/auth/google/callback - Google OAuth callback
GET  /api/auth/github          - Initiate GitHub OAuth
GET  /api/auth/github/callback - GitHub OAuth callback
GET  /api/auth/me              - Get current user (requires JWT cookie)
POST /api/auth/logout          - Clear JWT cookie
```

### JWT Payload Structure
```java
// Claims in JWT
{
  "sub": "userId",           // Subject (user ID)
  "email": "user@email.com",
  "name": "User Name",
  "isAdmin": false,
  "iat": 1234567890,         // Issued at
  "exp": 1235172690          // Expiration (7 days)
}
```

### Cookie Configuration
```java
// Setting JWT in httpOnly cookie after successful OAuth
ResponseCookie cookie = ResponseCookie.from("jwt", token)
    .httpOnly(true)
    .secure(true)                    // HTTPS only in production
    .sameSite("Strict")              // CSRF protection
    .path("/")
    .maxAge(Duration.ofDays(7))
    .build();
response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
```

### JWT Filter (extract from cookie)
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) {
        String token = extractTokenFromCookie(request);
        if (token != null && jwtTokenProvider.validateToken(token)) {
            Authentication auth = jwtTokenProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(request, response);
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            return Arrays.stream(request.getCookies())
                .filter(c -> "jwt".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
        }
        return null;
    }
}
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
    // Check if user is authenticated by calling /auth/me
    // Cookie is automatically sent with the request
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      // Not authenticated or cookie expired
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (provider) => {
    window.location.href = `/api/auth/${provider}`;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');  // Server clears the httpOnly cookie
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Important: No localStorage for JWT
The JWT is stored in an httpOnly cookie managed by the server. The frontend:
- Does NOT store tokens in localStorage
- Does NOT manually add Authorization headers
- Relies on cookies being automatically sent with requests
- Must configure Axios to send credentials (see below)

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
4. **httpOnly Cookies**: JWT stored in httpOnly cookies (NOT localStorage)
5. **SameSite**: Cookie set to SameSite=Strict for CSRF protection
6. **Secure Flag**: Cookie secure=true in production (HTTPS only)
7. **CORS**: Whitelist allowed origins with credentials support
8. **Rate Limiting**: Limit auth endpoints to prevent abuse
9. **No Password Storage**: OAuth-only, no local passwords

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
- [ ] JWT stored in httpOnly cookie (not accessible via JavaScript)
- [ ] Cookie has secure and SameSite flags set correctly
- [ ] Protected routes reject requests without valid cookie
- [ ] Admin routes reject non-admin users
- [ ] Logout clears the httpOnly cookie
- [ ] Token expiration handled gracefully (redirect to login)
