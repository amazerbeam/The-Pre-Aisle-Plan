# Docker Rebuild Context

## Google OAuth Troubleshooting

**IF GOOGLE LOGIN FAILS, CHECK THIS FIRST:**

1. **Verify `.env` credentials match Google Cloud Console**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click on your OAuth 2.0 Client ID
   - Compare `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env` with Console values
   - If secret was regenerated in Console, update `.env` and rebuild

2. **Check API logs for the actual error:**
   ```bash
   docker-compose logs api --tail=50
   ```
   - `401 Unauthorized: [no body]` = Invalid client credentials (check secret!)
   - `OAuth2AuthenticationException` = Could be credentials OR session issues

3. **Common fixes:**
   - Regenerate client secret in Google Console, update `.env`, rebuild
   - Ensure OAuth consent screen is configured (not just credentials)

## Google OAuth Configuration

These URIs must be configured in the Google Cloud Console for OAuth to work.

### Authorized JavaScript origins
```
http://localhost:8080
http://localhost:3000
```

### Authorized redirect URIs
```
http://localhost:8080/login/oauth2/code/google
http://localhost:3000/login/oauth2/code/google
```

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| Database (MySQL) | 3306 | localhost:3306 |
| API (Spring Boot) | 8080 | http://localhost:8080 |
| Client (React/nginx) | 3000 | http://localhost:3000 |

## Docker Service Names

These are the internal Docker network hostnames used in nginx.conf:

| Service | Docker Hostname |
|---------|-----------------|
| Database | `db` |
| API | `api` |
| Client | `client` |

**IMPORTANT:** nginx.conf must use `api` not `backend` for proxy_pass directives.
