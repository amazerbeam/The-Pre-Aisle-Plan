# Authentication Context
> Reference material for authentication-agent

## Technology Stack
- **Frontend**: React (web) with responsive design
- **Backend**: Java/Spring Boot
- **Database**: MySQL
- **Auth Providers**: Google OAuth 2.0 **ONLY** (no GitHub)
- **Token Management**: JWT stored in httpOnly cookies (NOT localStorage)

## DO / DO NOT

### DO NOT
- Do NOT offer GitHub login - **Google OAuth only**
- Do NOT create custom Google login buttons - use official Google branding
- Do NOT store passwords (OAuth-only authentication)

### DO
- DO use the **official Google Sign-In button** with Google's branding guidelines
- DO use button text "Sign in with Google" (not "Login with Google")
- DO use the official Google "G" logo

## OAuth Flow
```
User clicks "Sign in with Google"
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
GET  /api/auth/me              - Get current user (requires JWT cookie)
POST /api/auth/logout          - Clear JWT cookie
```
**Note:** No GitHub routes - Google OAuth only.

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
// components/auth/GoogleSignInButton.jsx
import { useAuth } from '../../contexts/AuthContext';
import styles from './GoogleSignInButton.module.css';

const GoogleSignInButton = () => {
  const { login } = useAuth();

  return (
    <button onClick={() => login('google')} className={styles.googleSignInBtn}>
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
      />
      Sign in with Google
    </button>
  );
};

export default GoogleSignInButton;
```

```css
/* GoogleSignInButton.module.css - Official Google branding */
.googleSignInBtn {
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  height: 40px;
  background-color: #ffffff;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-family: 'Roboto', arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.googleSignInBtn:hover {
  background-color: #f7f8f8;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
}

.googleSignInBtn img {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}
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
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  oauth_provider ENUM('GOOGLE', 'GITHUB') NOT NULL,  -- MUST be uppercase to match Java enum
  oauth_id VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  UNIQUE KEY unique_oauth (oauth_provider, oauth_id)
);
```

### CRITICAL: ENUM Case Sensitivity
The MySQL `oauth_provider` ENUM values **MUST** be uppercase (`'GOOGLE'`, `'GITHUB'`) to match the Java enum:

```java
// OAuthProvider.java
public enum OAuthProvider {
    GOOGLE,
    GITHUB
}
```

When Hibernate reads from the database with `@Enumerated(EnumType.STRING)`, it calls `OAuthProvider.valueOf(dbValue)`. If the database contains `'google'` but the enum is `GOOGLE`, you'll get:
```
No enum constant com.foodbytes.model.OAuthProvider.google
```

**Fix**: Ensure schema.sql and seed.sql use uppercase values:
```sql
-- schema.sql
oauth_provider ENUM('GOOGLE', 'GITHUB') NOT NULL

-- seed.sql (when inserting users)
INSERT INTO users (..., oauth_provider, ...) VALUES (..., 'GOOGLE', ...);
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

## Docker/Nginx Proxy Configuration

When running in Docker with nginx as a reverse proxy, OAuth redirects require special configuration to ensure the correct host and port are used in redirect URLs.

### Problem
The backend runs on port 8080 internally, but users access the app via nginx on port 3000. Without proper configuration, OAuth redirects will use `localhost:8080` instead of `localhost:3000`, causing `ERR_CONNECTION_REFUSED` errors.

### Solution: Forward Headers Strategy

#### 1. Spring Boot Configuration (application.yml)
```yaml
server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: /
  forward-headers-strategy: framework  # REQUIRED for proxy setups
```

The `forward-headers-strategy: framework` tells Spring Boot to trust and use `X-Forwarded-*` headers from the proxy when constructing redirect URLs.

#### 2. Nginx Configuration (nginx.conf)
```nginx
# OAuth2 authorization endpoint
location /oauth2/ {
    proxy_pass http://backend:8080/oauth2/;
    proxy_http_version 1.1;
    proxy_set_header Host $host:3000;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host:3000;
    proxy_set_header X-Forwarded-Port 3000;
}

# OAuth2 login callback
location /login/oauth2/ {
    proxy_pass http://backend:8080/login/oauth2/;
    proxy_http_version 1.1;
    proxy_set_header Host $host:3000;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host:3000;
    proxy_set_header X-Forwarded-Port 3000;
}
```

**Key headers explained:**
- `Host $host:3000` - Sets the Host header to include the frontend port
- `X-Forwarded-Host $host:3000` - Tells Spring the original host requested
- `X-Forwarded-Port 3000` - Tells Spring the original port requested
- `X-Forwarded-Proto $scheme` - Preserves HTTP/HTTPS protocol

#### 3. Google Cloud Console Configuration
In the Google Cloud Console (APIs & Services > Credentials > OAuth 2.0 Client IDs), the **Authorized redirect URIs** must use the frontend port:

```
http://localhost:3000/login/oauth2/code/google
```

**NOT** `http://localhost:8080/login/oauth2/code/google`

### Troubleshooting OAuth in Docker

| Symptom | Cause | Fix |
|---------|-------|-----|
| `ERR_CONNECTION_REFUSED` after Google login | Redirect URL using wrong port (8080 vs 3000) | Add `forward-headers-strategy: framework` and configure nginx headers |
| `No enum constant OAuthProvider.google` | MySQL ENUM lowercase, Java enum uppercase | Change ENUM to `'GOOGLE'`, `'GITHUB'` in schema.sql |
| `redirect_uri_mismatch` from Google | Google Console URI doesn't match actual redirect | Update Google Console to use `http://localhost:3000/login/oauth2/code/google` |
| OAuth works locally but not in Docker | Missing proxy headers | Ensure nginx passes all `X-Forwarded-*` headers |

## Testing Checklist

### Core OAuth Flow
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

### Docker/Proxy Testing
- [ ] OAuth redirects use correct port (3000, not 8080)
- [ ] Google OAuth works when accessed via nginx proxy
- [ ] GitHub OAuth works when accessed via nginx proxy
- [ ] User record created with uppercase provider (GOOGLE/GITHUB)
- [ ] No `ERR_CONNECTION_REFUSED` errors during OAuth flow
- [ ] No `No enum constant` errors after OAuth callback
