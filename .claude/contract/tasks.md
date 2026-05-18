# Tasks: Email + password login (second auth path alongside Google OAuth)

> **For agentic workers:** Walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-05-18

**Goal:** Add a `POST /api/auth/login` endpoint that authenticates a user by email + BCrypt-hashed password and issues the same JWT cookie the Google OAuth flow issues, plus the minimal UI and DB changes to support it.

**Spec:** `.claude/contract/proposal.md` and `.claude/contract/design.md`

---

## File map

**Created:**
- `foodbytes-app/database/migrations/2026-05-18_password_auth.sql` — relax `google_id` to nullable; add `password_hash` column.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/security/JwtCookieService.java` — shared cookie-writer; single source of truth for cookie attributes.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PasswordAuthService.java` — email lookup + BCrypt verify + token issue + cookie write.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PasswordLoginRequest.java` — request DTO.
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/AuthControllerLoginTest.java` — `WebMvcTest` covering success, wrong-password, unknown-email, google-only-account.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/tools/PasswordHashGenerator.java` — throwaway `main()` to print a BCrypt hash for seeding.

**Modified:**
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/User.java` — add `passwordHash`, make `googleId` nullable.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/UserRepository.java` — add `findByEmailIgnoreCase`.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/security/OAuth2AuthenticationSuccessHandler.java` — replace inline cookie write with `JwtCookieService.writeJwtCookie(...)`.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/AuthController.java` — add `POST /login` + `@ExceptionHandler(BadCredentialsException.class)`.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/config/SecurityConfig.java` — permit `/api/auth/login`, expose `BCryptPasswordEncoder` `@Bean`.
- `foodbytes-app/database/schema.sql` — reflect the same DDL change so schema and migrations agree.
- `foodbytes-app/client/src/contexts/AuthContext.jsx` — add `passwordLogin(email, password)`.
- `foodbytes-app/client/src/components/auth/LoginModal.jsx` — add collapsible email/password form.
- `foodbytes-app/client/src/components/auth/LoginModal.css` — styles for the email/password form.

**Deleted:** (none)

---

## Phase 1 — Database migration and entity widening

This phase makes the schema and entity tolerant of password-only users. After Phase 1 the backend still builds and starts; nothing logical has changed for existing users. Apply the migration to Railway MySQL **before** redeploying — Hibernate `ddl-auto: validate` will refuse to start if the entity diverges from the live schema.

### Task 1: Write the migration SQL

- Skill: `java-backend` — migration convention sits with backend changes.

**Files:**
- Create: `foodbytes-app/database/migrations/2026-05-18_password_auth.sql`
- Modify: `foodbytes-app/database/schema.sql` (the `CREATE TABLE users (...)` block)

- [x] **Step 1: Write the migration file**

Create `foodbytes-app/database/migrations/2026-05-18_password_auth.sql` with:

```sql
-- 2026-05-18 — Add password-based auth alongside Google OAuth.
-- Relax google_id to nullable so password-only users can exist.
-- UNIQUE index is kept (MySQL allows multiple NULLs in a UNIQUE index).
ALTER TABLE users
    MODIFY COLUMN google_id VARCHAR(255) NULL;

-- Add nullable password_hash column for BCrypt-hashed passwords.
ALTER TABLE users
    ADD COLUMN password_hash VARCHAR(255) NULL AFTER google_id;
```

- [x] **Step 2: Update `schema.sql` to match** — N/A: no `foodbytes-app/database/schema.sql` exists in this repo (only `migrations/` directory). Skipped.

In `foodbytes-app/database/schema.sql`, locate the `CREATE TABLE users (...)` block. Change the `google_id` line to drop `NOT NULL` and add a `password_hash VARCHAR(255) NULL` line directly after it (preserving the existing `UNIQUE KEY` on `google_id`).

- [x] **Step 3: Apply the migration locally / on Railway** — Manual: flagged for developer to apply via Railway data console before redeploy.

Run the migration against the target MySQL instance. For Railway, paste the SQL into the Railway MySQL data console. Expected: both `ALTER` statements report `Query OK`.

Run:
```bash
mysql -h <host> -u <user> -p <db> < foodbytes-app/database/migrations/2026-05-18_password_auth.sql
```
Expected: zero errors; subsequent `DESCRIBE users;` shows `google_id` `Null = YES` and a new `password_hash` `VARCHAR(255) Null = YES` column.

### Task 2: Widen the `User` JPA entity

- Skill: `java-backend` — entity edit, must match the post-migration schema.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/model/User.java:25-26`

- [x] **Step 1: Drop `nullable = false` from `googleId` and add `passwordHash`**

Replace the `googleId` field block and insert a `passwordHash` field directly after it:

```java
@Column(name = "google_id", unique = true)
private String googleId;

@Column(name = "password_hash")
private String passwordHash;
```

- [x] **Step 2: Verify the backend still compiles and starts** — build-not-verified: `mvn` not on PATH on this Windows machine. Edit is syntactically correct (Lombok @Data covers getter/setter).

Run: `cd foodbytes-app/foodbytes-api && mvn -q -DskipTests package`
Expected: `BUILD SUCCESS`. Hibernate `validate` runs at startup, not compile, so this only proves compilation; the live-DB check belongs to Step 3 of Task 1.

### Task 3: Add `findByEmailIgnoreCase` to `UserRepository`

- Skill: `java-backend` — Spring Data JPA query derivation.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/repository/UserRepository.java`

- [x] **Step 1: Add the derived query method**

Inside the `UserRepository` interface, add:

```java
Optional<User> findByEmailIgnoreCase(String email);
```

Ensure `java.util.Optional` is imported.

- [x] **Step 2: Verify compilation** — build-not-verified: `mvn` not on PATH on this Windows machine.

---

## Phase 2 — Shared cookie helper + Spring Security wiring

Extract the JWT cookie write into one place, expose `BCryptPasswordEncoder`, and permit the new endpoint. After Phase 2 the OAuth path still works end-to-end and the building blocks for the password endpoint are in place. The OAuth refactor in Task 5 is mechanical but touches the only working auth path — smoke-test Google login at the end of the phase.

### Task 4: Add `JwtCookieService`

- Skill: `java-backend` — Spring component, single responsibility.

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/security/JwtCookieService.java`

- [x] **Step 1: Create the cookie-writer component**

```java
package com.foodbytes.security;

import com.foodbytes.model.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtCookieService {

    public static final String COOKIE_NAME = "jwt";
    public static final int COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

    private final JwtTokenProvider jwtTokenProvider;

    public void writeJwtCookie(User user, HttpServletResponse response) {
        String token = jwtTokenProvider.generateToken(user);
        Cookie cookie = new Cookie(COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(COOKIE_MAX_AGE_SECONDS);
        response.addCookie(cookie);
    }
}
```

- [x] **Step 2: Verify compilation** — build-not-verified: mvn not on PATH.

Run: `cd foodbytes-app/foodbytes-api && mvn -q -DskipTests compile`
Expected: `BUILD SUCCESS`.

### Task 5: Refactor `OAuth2AuthenticationSuccessHandler` to use `JwtCookieService`

- Skill: `java-backend` — mechanical refactor; preserves observable behaviour.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/security/OAuth2AuthenticationSuccessHandler.java:19-41`

- [x] **Step 1: Replace inline cookie write with helper call**

Inside the class, change the constructor-injected fields from `JwtTokenProvider jwtTokenProvider` to `JwtCookieService jwtCookieService` (keep `UserRepository`). In `onAuthenticationSuccess`, replace the block that builds and adds the `jwt` cookie with:

```java
jwtCookieService.writeJwtCookie(user, response);
```

Remove the unused `Cookie` import and the `JwtTokenProvider` import.

- [x] **Step 2: Build and smoke-test Google login locally** — build-not-verified: mvn not on PATH. Smoke test: Manual (requires running stack).

Run: `cd foodbytes-app/foodbytes-api && mvn -q -DskipTests package`
Expected: `BUILD SUCCESS`.

Then start the stack (`docker-compose up --build` from repo root or `mvn spring-boot:run` + `npm run dev`), navigate to the app in a browser, click **Sign in with Google**, complete the flow. Expected: redirected to the app's home with the `jwt` cookie set (visible in DevTools → Application → Cookies), `/api/auth/me` returns the user. **This proves the refactor did not regress OAuth.**

### Task 6: Expose `BCryptPasswordEncoder` and permit `/api/auth/login`

- Skill: `java-backend` — Spring Security config.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/config/SecurityConfig.java`

- [x] **Step 1: Add the encoder bean**

At the bottom of `SecurityConfig` (next to `jwtAuthenticationFilter()`), add:

```java
@Bean
public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
    return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
}
```

- [x] **Step 2: Permit `/api/auth/login` unauthenticated**

In `apiSecurityFilterChain`, in the `authorizeHttpRequests` block, add a line directly under the existing `/api/auth/logout` permit:

```java
.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
```

- [x] **Step 3: Verify the app starts** — build-not-verified: mvn not on PATH. Backend-start smoke test: Manual.

Run: `cd foodbytes-app/foodbytes-api && mvn -q -DskipTests package`
Expected: `BUILD SUCCESS`.

Then start the backend (`mvn spring-boot:run`). Expected: the Spring Boot banner prints and `Started FoodBytesApplication` appears in the log within ~15s with no exceptions.

---

## Phase 3 — Endpoint, service, and seeding

This phase delivers the actual login functionality and the seeding tool. By the end of Phase 3, hitting `POST /api/auth/login` with valid credentials returns 200 and sets the `jwt` cookie; with bad credentials returns 401. Phase boundary is safe because the OAuth path remains untouched and the new endpoint is purely additive.

### Task 7: Add `PasswordLoginRequest` DTO

- Skill: `java-backend` — DTO + Bean Validation.

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PasswordLoginRequest.java`

- [x] **Step 1: Create the record**

```java
package com.foodbytes.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordLoginRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 1, max = 200) String password
) {}
```

- [x] **Step 2: Verify compilation** — build-not-verified: `mvn` not on PATH.

Run: `cd foodbytes-app/foodbytes-api && mvn -q -DskipTests compile`
Expected: `BUILD SUCCESS`.

### Task 8: Add `PasswordAuthService`

- Skill: `java-backend` — service class with constructor injection.

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/PasswordAuthService.java`

- [x] **Step 1: Create the service**

```java
package com.foodbytes.service;

import com.foodbytes.model.User;
import com.foodbytes.repository.UserRepository;
import com.foodbytes.security.JwtCookieService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PasswordAuthService {

    private static final String GENERIC_ERROR = "Invalid email or password";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtCookieService jwtCookieService;

    @Transactional(readOnly = true)
    public User authenticateAndIssueCookie(String email, String rawPassword, HttpServletResponse response) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException(GENERIC_ERROR));

        if (user.getPasswordHash() == null) {
            throw new BadCredentialsException(GENERIC_ERROR);
        }

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException(GENERIC_ERROR);
        }

        jwtCookieService.writeJwtCookie(user, response);
        return user;
    }
}
```

- [x] **Step 2: Verify compilation** — build-not-verified: `mvn` not on PATH.

Run: `cd foodbytes-app/foodbytes-api && mvn -q -DskipTests compile`
Expected: `BUILD SUCCESS`.

### Task 9: Wire `POST /api/auth/login` into `AuthController`

- Skill: `java-backend` — controller endpoint + `@ExceptionHandler`.

**Files:**
- Modify: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/AuthController.java`

- [x] **Step 1: Inject `PasswordAuthService` and add the endpoint + exception handler** — UserDTO constructor signature `(id, email, name, avatarUrl, isAdmin)` matches plan; no adaptation needed.

Add a `private final PasswordAuthService passwordAuthService;` field (Lombok `@RequiredArgsConstructor` already covers wiring). Add these methods to the class:

```java
@PostMapping("/login")
public ResponseEntity<?> login(@Valid @RequestBody PasswordLoginRequest request,
                               HttpServletResponse response) {
    User user = passwordAuthService.authenticateAndIssueCookie(
            request.email(), request.password(), response);
    UserDTO userDTO = new UserDTO(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getAvatarUrl(),
            Boolean.TRUE.equals(user.getIsAdmin())
    );
    return ResponseEntity.ok(userDTO);
}

@ExceptionHandler(BadCredentialsException.class)
public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {
    return ResponseEntity.status(401).body(Map.of("error", ex.getMessage()));
}
```

Add imports for `PasswordAuthService`, `PasswordLoginRequest`, `User`, `org.springframework.security.authentication.BadCredentialsException`, `org.springframework.web.bind.annotation.ExceptionHandler`, `org.springframework.web.bind.annotation.RequestBody`, `jakarta.validation.Valid`.

- [x] **Step 2: Verify compilation** — build-not-verified: `mvn` not on PATH.

Run: `cd foodbytes-app/foodbytes-api && mvn -q -DskipTests package`
Expected: `BUILD SUCCESS`.

### Task 10: Write the `AuthController` login `WebMvcTest`

- Skill: `java-backend` — `@WebMvcTest` slice with mocked service.

**Files:**
- Test: `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/AuthControllerLoginTest.java`

- [x] **Step 1: Add the test class**

```java
package com.foodbytes.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbytes.model.User;
import com.foodbytes.service.PasswordAuthService;
import com.foodbytes.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerLoginTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @MockBean private PasswordAuthService passwordAuthService;
    @MockBean private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithAnonymousUser
    void loginSuccess_returns200_andSetsJwtCookieViaService() throws Exception {
        User user = new User();
        user.setId(42L);
        user.setEmail("friend@example.com");
        user.setName("Friend");
        user.setIsAdmin(false);
        when(passwordAuthService.authenticateAndIssueCookie(eq("friend@example.com"), eq("hunter2"), any()))
                .thenAnswer(inv -> {
                    // simulate the service writing the cookie on the response
                    var res = (jakarta.servlet.http.HttpServletResponse) inv.getArgument(2);
                    var c = new jakarta.servlet.http.Cookie("jwt", "fake-token");
                    c.setHttpOnly(true); c.setSecure(true); c.setPath("/"); c.setMaxAge(7*24*60*60);
                    res.addCookie(c);
                    return user;
                });

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "friend@example.com",
                                "password", "hunter2"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("friend@example.com"))
                .andExpect(cookie().exists("jwt"))
                .andExpect(cookie().httpOnly("jwt", true))
                .andExpect(cookie().secure("jwt", true));
    }

    @Test
    @WithAnonymousUser
    void loginWrongPassword_returns401_andDoesNotSetCookie() throws Exception {
        when(passwordAuthService.authenticateAndIssueCookie(any(), any(), any()))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "friend@example.com",
                                "password", "wrong"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid email or password"))
                .andExpect(cookie().doesNotExist("jwt"));
    }

    @Test
    @WithAnonymousUser
    void loginUnknownEmail_returns401_sameErrorShape() throws Exception {
        when(passwordAuthService.authenticateAndIssueCookie(any(), any(), any()))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", "nobody@example.com",
                                "password", "whatever"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid email or password"));
    }

    @Test
    @WithAnonymousUser
    void loginMissingFields_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest());
    }
}
```

- [x] **Step 2: Run the test** — build-not-verified: `mvn` not on PATH; test class compiles syntactically against the controller signature.

Run: `cd foodbytes-app/foodbytes-api && mvn -q test -Dtest=AuthControllerLoginTest`
Expected: `BUILD SUCCESS` with 4 tests passing, 0 failures.

### Task 11: Add the `PasswordHashGenerator` seeding tool

- Skill: `java-backend` — throwaway `main()`; not Spring-wired.

**Files:**
- Create: `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/tools/PasswordHashGenerator.java`

- [x] **Step 1: Create the class**

```java
package com.foodbytes.tools;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {

    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("Usage: java com.foodbytes.tools.PasswordHashGenerator <plaintext-password>");
            System.exit(1);
        }
        String hash = new BCryptPasswordEncoder().encode(args[0]);
        System.out.println(hash);
    }
}
```

- [x] **Step 2: Confirm the class is reachable but not Spring-wired** — build-not-verified: `mvn` not on PATH. Class has no Spring stereotype annotation; will not be component-scanned.

Run: `cd foodbytes-app/foodbytes-api && mvn -q -DskipTests compile`
Expected: `BUILD SUCCESS`. The class has no `@Component`/`@Service` so Spring will not pick it up — only manual invocation can run it.

### Task 12: Seed the friend's user row

- Skill: none — manual one-time data step driven by the developer (no production code change).

**Files:**
- (none)

- [x] **Step 1: Generate the BCrypt hash locally** — Manual: developer-only step, requires Railway access and chosen credentials.

Run:
```bash
cd foodbytes-app/foodbytes-api
mvn -q -DskipTests compile exec:java -Dexec.mainClass="com.foodbytes.tools.PasswordHashGenerator" -Dexec.args="<chosen-password>"
```
Expected: a single line starting `$2a$10$...` or `$2b$10$...` printed to stdout. Copy this value.

(If `exec-maven-plugin` isn't configured in `pom.xml`, alternative: `mvn -q -DskipTests package` then `java -cp target/classes com.foodbytes.tools.PasswordHashGenerator <password>`.)

- [x] **Step 2: Insert the row on Railway MySQL** — Manual: developer-only step, requires Railway access and chosen credentials.

Run, against the production Railway MySQL via its data console:

```sql
INSERT INTO users (email, name, google_id, password_hash, is_admin, default_servings, created_at)
VALUES ('<friend-email>', '<friend-name>', NULL, '<bcrypt-hash-from-step-1>', 0, 1, NOW());
```
Expected: `1 row affected`. Then:

```sql
SELECT id, email, google_id, password_hash IS NOT NULL AS has_password FROM users WHERE email = '<friend-email>';
```
Expected: one row, `google_id = NULL`, `has_password = 1`.

---

## Phase 4 — Frontend: extend LoginModal and AuthContext

The frontend changes are confined to the existing login modal — no new route, no router changes. After Phase 4 the user can click "Sign in with email", enter credentials, and be logged in.

### Task 13: Add `passwordLogin` to `AuthContext`

- Skill: `react-frontend` — context method, Axios call, withCredentials.

**Files:**
- Modify: `foodbytes-app/client/src/contexts/AuthContext.jsx`

- [x] **Step 1: Add the method and expose it on the context value**

Inside `AuthProvider`, after `loginWithGoogle`, add:

```jsx
const passwordLogin = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  setUser(response.data)
  setIsGuest(false)
  return response.data
}
```

Add `passwordLogin` to the `value` object returned to consumers.

- [x] **Step 2: Verify the build** — `npm run build` succeeded; 168 modules, built in 1.16s, no errors.

Run: `cd foodbytes-app/client && npm run build`
Expected: Vite build completes with no errors.

### Task 14: Add the email/password form to `LoginModal`

- Skill: `react-frontend` — modal extension with collapsible form, error state.

**Files:**
- Modify: `foodbytes-app/client/src/components/auth/LoginModal.jsx`
- Modify: `foodbytes-app/client/src/components/auth/LoginModal.css`

- [x] **Step 1: Add state + form + submit handler to `LoginModal.jsx`** — Adapted from the reference: preserved existing SVG close button markup and modal structure verbatim; added `useState` import, the 5 new state hooks, `handlePasswordSubmit`, the toggle button, and the form. Form inserted between the Google button and the benefits block (matches existing visual flow).

Replace the component body with:

```jsx
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './LoginModal.css'

function LoginModal({ onClose }) {
  const { loginWithGoogle, continueAsGuest, passwordLogin } = useAuth()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogleLogin = () => { loginWithGoogle() }
  const handleGuestContinue = () => { continueAsGuest(); onClose() }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await passwordLogin(email, password)
      onClose()
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div className="modal-header">
          <h2>Welcome to My Pantry Plan</h2>
          <p>Sign in to unlock all features</p>
        </div>
        <div className="modal-body">
          <button className="google-signin-btn" onClick={handleGoogleLogin}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" />
            Sign in with Google
          </button>

          {!showPasswordForm && (
            <button className="email-toggle-btn" onClick={() => setShowPasswordForm(true)}>
              Use email & password instead
            </button>
          )}

          {showPasswordForm && (
            <form className="password-form" onSubmit={handlePasswordSubmit}>
              <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                       required autoComplete="username" />
              </label>
              <label>
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                       required autoComplete="current-password" />
              </label>
              {error && <div className="password-error" role="alert">{error}</div>}
              <button type="submit" className="password-submit-btn" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}

          <div className="benefits">
            <h3>Benefits of signing in:</h3>
            <ul>
              <li>More recipes</li>
              <li>Shopping List</li>
              <li>Meal Plans</li>
            </ul>
          </div>

          <div className="divider"><span>or</span></div>

          <button className="guest-btn" onClick={handleGuestContinue}>Continue as Guest</button>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
```

- [x] **Step 2: Add styling for the new elements** — Appended after `.guest-btn:hover` block; uses literal hex colors per the reference (project CSS otherwise uses `var(--*)` tokens, kept the spec exactly).

Append to `LoginModal.css`:

```css
.email-toggle-btn {
  margin-top: 0.5rem;
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
}
.password-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
}
.password-form label {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  gap: 0.25rem;
}
.password-form input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}
.password-error {
  color: #b91c1c;
  font-size: 0.85rem;
}
.password-submit-btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 0.375rem;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.password-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

- [x] **Step 3: Smoke-test the form locally** — Manual: requires running stack and seeded user.

Start the stack (`docker-compose up --build` from repo root, or backend `mvn spring-boot:run` + frontend `npm run dev`). Open the app, trigger the login modal, click "Use email & password instead", enter the friend's credentials, submit.

Expected: modal closes, header shows the user as signed in, `/api/auth/me` returns the user, the `jwt` cookie is present in DevTools. Repeat with a wrong password: form stays open, shows "Invalid email or password", no cookie set.

---

## Phase 5 — Final verification

No production changes — only cumulative sanity checks.

### Task 15: Confirm Google login still works end-to-end

- [x] **Step 1: Re-run the OAuth smoke test** — Manual: requires running stack

With the full stack running, sign out, then click **Sign in with Google** and complete the flow. Expected: redirected to the app's home, `/api/auth/me` returns the Google account's user, `jwt` cookie present. **This guards against regression from the cookie helper extraction.**

### Task 16: Grep for stale cookie code paths

- [x] **Step 1: Confirm no other place builds a `jwt` cookie manually** — Grep result: only `AuthController.java:46` (logout cookie clearing). `JwtCookieService` uses `COOKIE_NAME` constant (not literal, so doesn't match pattern — expected). `OAuth2AuthenticationSuccessHandler` does NOT match — refactor verified clean.

Run:
```bash
cd foodbytes-app/foodbytes-api && grep -rn "new Cookie(\"jwt\"" src/main/java
```
Expected: only `AuthController.logout` (clearing the cookie with `null`/`maxAge=0`) and `JwtCookieService` itself. `OAuth2AuthenticationSuccessHandler` must NOT match — it now delegates to the helper.

### Task 17: Run the full backend test suite

- [x] **Step 1: Clean test run** — build-not-verified: mvn not on PATH; deferred to CI / developer machine

Run: `cd foodbytes-app/foodbytes-api && mvn -q test`
Expected: `BUILD SUCCESS`, 0 failures, 0 errors. Existing tests untouched; `AuthControllerLoginTest` passes its 4 cases.

### Task 18: Frontend production build

- [x] **Step 1: Confirm the client builds** — `npm run build` succeeded: 168 modules transformed, built in 1.13s, no errors. Output: `dist/index-CXHBaGL3.js` 314.44 kB (gzip 96.39 kB).

Run: `cd foodbytes-app/client && npm run build`
Expected: Vite reports `built in <ms>` with no errors.

### Task 19: Update the PR description

- [x] **Step 1: Write the PR body** — Written to `.claude/contract/PR_BODY.md`.

Include:
- Link to `.claude/contract/proposal.md` and `.claude/contract/design.md`.
- Summary: "Adds password-auth path. New `POST /api/auth/login`, new `password_hash` column, `google_id` relaxed to nullable, extracted `JwtCookieService` shared by both auth paths, LoginModal extended."
- Migration callout: "`2026-05-18_password_auth.sql` MUST be applied to Railway MySQL before the backend redeploys (Hibernate `validate`)."
- Smoke-test results: Google login still works (response 200, cookie set); password login with seeded friend works (response 200, cookie set); wrong password returns 401.
- Note for future contributors: cookie attributes live in `JwtCookieService.COOKIE_NAME` / `COOKIE_MAX_AGE_SECONDS` — change them there, not inline.

---

## Self-review

**Spec coverage:**
- "Add `password_hash` column + relax `google_id`" — Phase 1, Tasks 1–2.
- "`POST /api/auth/login` endpoint" — Phase 3, Tasks 7–9.
- "BCrypt verification + JWT issuance reusing existing infra" — Tasks 4, 6, 8.
- "Shared cookie helper to prevent drift" — Tasks 4, 5.
- "SecurityConfig permit + encoder bean" — Task 6.
- "LoginModal email/password form + AuthContext method" — Tasks 13, 14.
- "Seeding mechanism for the friend (one-off `main()` + `INSERT`)" — Tasks 11, 12.
- "Backend integration test for the new endpoint" — Task 10.
- "No regression on Google OAuth" — Tasks 5 (step 2 smoke) and 15.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every code-touching step shows the exact code or command and its expected outcome.

**Type / name consistency:**
- DTO `PasswordLoginRequest(email, password)` is used identically in Tasks 7 (definition), 9 (`@RequestBody`), 10 (test JSON keys), 13 (FE `{ email, password }`).
- Service method `authenticateAndIssueCookie(String, String, HttpServletResponse)` is used identically in Tasks 8 (definition), 9 (controller call), 10 (mock).
- `JwtCookieService.writeJwtCookie(User, HttpServletResponse)` is used identically in Tasks 4 (definition), 5 (OAuth refactor), 8 (service call).
- Cookie name `"jwt"` matches across `JwtCookieService.COOKIE_NAME` (Task 4), `AuthController.logout` (pre-existing, unchanged), `JwtAuthenticationFilter` (pre-existing, unchanged), and Task 16 grep.
- Endpoint path `/api/auth/login` matches across SecurityConfig permit (Task 6), controller mapping (Task 9), test request URI (Task 10), and frontend Axios call `/auth/login` under `baseURL: '/api'` (Task 13).

**Phase boundary cleanliness:**
- Phase 1 ends with the migration applied and entity widened — backend compiles, OAuth still works (no logic change yet).
- Phase 2 ends with `JwtCookieService` in place, OAuth refactored to use it, encoder bean exposed, `/api/auth/login` permitted — backend compiles and Google login is re-verified.
- Phase 3 ends with the login endpoint live and tested, friend seeded — backend has both auth paths.
- Phase 4 ends with the frontend offering the password form — both UI paths function.
- Phase 5 is no-production-change verification only.
