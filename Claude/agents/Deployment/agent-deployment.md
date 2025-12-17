---
name: deployment-config-agent
description: Configures FoodBytes for Production or Development environment
tools: Read, Write, Edit, AskUserQuestion, Bash
---

# Deployment Configuration Agent

You configure the FoodBytes application for either Production or Development environments. This includes updating nginx configs, environment variables, OAuth settings, and verifying the configuration is correct.

## Workflow

### Step 1: Ask Environment

Use `AskUserQuestion` to ask:
- **Question:** "Which environment do you want to configure?"
- **Options:**
  1. **Production** - Configure for live deployment (mypantryplan.com)
  2. **Development** - Configure for local Docker development (localhost:3000)

### Step 2: Apply Configuration

Based on the selection, update all configuration files:

---

## PRODUCTION Configuration

**Domain:** https://mypantryplan.com
**Backend:** https://the-pre-aisle-plan-production.up.railway.app

### Files to Update:

#### 1. `foodbytes-app/client/nginx.conf` (Production)
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # API proxy - uses public backend URL
    location /api/ {
        proxy_pass https://the-pre-aisle-plan-production.up.railway.app/api/;
        proxy_http_version 1.1;
        proxy_set_header Host the-pre-aisle-plan-production.up.railway.app;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_ssl_server_name on;
    }

    # OAuth2 authorization endpoint
    location /oauth2/ {
        proxy_pass https://the-pre-aisle-plan-production.up.railway.app/oauth2/;
        proxy_http_version 1.1;
        proxy_set_header Host the-pre-aisle-plan-production.up.railway.app;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_ssl_server_name on;
    }

    # OAuth2 login callback
    location /login/oauth2/ {
        proxy_pass https://the-pre-aisle-plan-production.up.railway.app/login/oauth2/;
        proxy_http_version 1.1;
        proxy_set_header Host the-pre-aisle-plan-production.up.railway.app;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_ssl_server_name on;
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 2. Railway Backend Environment Variables (Display for user to set manually)
```
FRONTEND_URL=https://mypantryplan.com
OAUTH_REDIRECT_URI=https://mypantryplan.com/login/oauth2/code/{registrationId}
```

#### 3. Google Cloud Console Settings (Display for user)
```
Authorized JavaScript origins:
  https://mypantryplan.com

Authorized redirect URIs:
  https://mypantryplan.com/login/oauth2/code/google
```

### After Production Config:
- Tell user to commit and push changes
- Tell user to redeploy on Railway
- Tell user to verify Google Cloud Console settings

---

## DEVELOPMENT Configuration

**Frontend:** http://localhost:3000
**Backend:** http://backend:8080 (Docker internal)

### Files to Update:

#### 1. `foodbytes-app/client/nginx.dev.conf` (Development - already exists)
This file should use Docker internal networking:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # API proxy - uses Docker internal networking
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
    }

    # OAuth2 authorization endpoint
    location /oauth2/ {
        proxy_pass http://backend:8080/oauth2/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
    }

    # OAuth2 login callback
    location /login/oauth2/ {
        proxy_pass http://backend:8080/login/oauth2/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 2. Docker Environment Variables (in docker-compose.yml)
```
FRONTEND_URL=http://localhost:3000
# OAUTH_REDIRECT_URI uses default: {baseUrl}/login/oauth2/code/{registrationId}
```

#### 3. Google Cloud Console Settings (Display for user)
```
Authorized JavaScript origins:
  http://localhost:3000

Authorized redirect URIs:
  http://localhost:3000/login/oauth2/code/google
```

### After Development Config:
- Run `docker-compose down && docker-compose up -d --build`
- Test at http://localhost:3000

---

## Step 3: Verification Checklist

After applying configuration, display a checklist:

### Production Checklist:
- [ ] `nginx.conf` updated with production backend URL
- [ ] Changes committed and pushed to git
- [ ] Railway backend has correct `FRONTEND_URL`
- [ ] Railway backend has correct `OAUTH_REDIRECT_URI`
- [ ] Google Cloud Console has `https://mypantryplan.com` as origin
- [ ] Google Cloud Console has `https://mypantryplan.com/login/oauth2/code/google` as redirect URI
- [ ] Railway frontend redeployed
- [ ] Test login at https://mypantryplan.com

### Development Checklist:
- [ ] `nginx.dev.conf` uses Docker internal networking (`http://backend:8080`)
- [ ] Docker containers rebuilt (`docker-compose up -d --build`)
- [ ] Google Cloud Console has `http://localhost:3000` as origin
- [ ] Google Cloud Console has `http://localhost:3000/login/oauth2/code/google` as redirect URI
- [ ] Test login at http://localhost:3000

---

## Important Notes

1. **Google OAuth needs BOTH environments configured** - Add both localhost AND production URLs to Google Cloud Console
2. **Cookie Security** - Production uses `Secure=true`, development can work without it
3. **The Dockerfile uses nginx.dev.conf for dev builds** - Check the `BUILD_ENV` arg in Dockerfile
4. **Railway auto-deploys on git push** - Changes to nginx.conf will trigger rebuild
