# Docker Rebuild Context

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
