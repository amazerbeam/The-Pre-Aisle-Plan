# MyPantryPlan Go-Live Context

## PROGRESS TRACKER
| Phase | Status |
|-------|--------|
| Phase 1: Domain | COMPLETE |
| Phase 2: Prepare Code | **CURRENT** |
| Phase 3: Railway Setup | Pending |
| Phase 4: Google OAuth | Pending |
| Phase 5: Custom Domain | Pending |
| Phase 6: Final Config | Pending |

---

## Domain (PURCHASED)
- **Domain:** mypantryplan.com
- **Registrar:** Porkbun (https://porkbun.com)
- **Cost:** $11.08/year
- **DNS Management:** https://porkbun.com/account/domainsSpe498

## GitHub Repository
- **Repo:** https://github.com/amazerbeam/The-Pre-Aisle-Plan
- **Branch:** main

## Project Stack
- **Frontend:** React (Vite) → builds to nginx
- **Backend:** Java Spring Boot (Maven, JDK 17)
- **Database:** MySQL 8.0
- **Auth:** Google OAuth 2.0

## Deployment Platform: Railway (PaaS)
- Free tier available
- Automatic HTTPS (required for OAuth)
- Git-push deploys
- Managed MySQL included

---

## PHASE 1: Domain Name

### Purchase Domain (Pick One)
| Registrar | Price/Year | Notes |
|-----------|-----------|-------|
| Porkbun | ~$9 | Cheapest, includes privacy |
| Namecheap | ~$10 | Good UI, includes privacy |
| Cloudflare | ~$10 | At-cost pricing |

---

## PHASE 2: Prepare Code

### Push to GitHub
```bash
cd foodbytes-app
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## PHASE 3: Railway Setup

### Step 1: Create Project
1. Go to https://railway.app
2. Click "Start a New Project" → "Empty Project"
3. Name it "FoodBytes"

### Step 2: Add MySQL Database
1. Click **"+ New"** → **"Database"** → **"MySQL"**
2. Copy these variables for later:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

### Step 3: Deploy Backend
1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repo
3. Set root directory: `foodbytes-app/foodbytes-api`
4. Add these environment variables:

```
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
JWT_SECRET=<generate-64-char-random-string>
GOOGLE_CLIENT_ID=<production-google-client-id>
GOOGLE_CLIENT_SECRET=<production-google-secret>
FRONTEND_URL=https://mypantryplan.com
SERVER_PORT=8080
```

5. Generate domain in Settings → Networking

### Step 4: Deploy Frontend
1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repo
3. Set root directory: `foodbytes-app/client`
4. Add environment variable:

```
VITE_API_URL=https://<your-backend-railway-domain>
```

5. Generate domain in Settings → Networking

### Step 5: Initialize Database
1. Click MySQL service → "Data" tab → "Query Tool"
2. Run `database/schema.sql`
3. Run `database/seed.sql`
4. Run `database/seed-merged-recipes.sql`

---

## PHASE 4: Google OAuth Production Setup

### Update Google Cloud Console
URL: https://console.cloud.google.com

1. Go to **APIs & Services** → **Credentials**
2. Click your OAuth 2.0 Client ID
3. Add **Authorized JavaScript origins**:
   ```
   https://mypantryplan.com
   https://<frontend-railway-domain>.up.railway.app
   ```
4. Add **Authorized redirect URIs**:
   ```
   https://mypantryplan.com/login/oauth2/code/google
   https://<backend-railway-domain>.up.railway.app/login/oauth2/code/google
   https://mypantryplan.com/oauth2/callback
   ```
5. Save

### Publish OAuth App
1. Go to **OAuth consent screen**
2. Click **"Publish App"** (Testing → Production)

---

## PHASE 5: Custom Domain

### Connect Domain to Frontend
1. Railway → Frontend service → Settings → Networking
2. Add custom domain: `mypantryplan.com`
3. Copy the DNS records Railway provides

### Update DNS at Registrar
1. Add CNAME record Railway provided
2. Wait 5-60 minutes for propagation

### (Optional) API Subdomain
- Add `api.mypantryplan.com` → backend service
- Update `VITE_API_URL=https://api.mypantryplan.com`

---

## PHASE 6: Final Configuration

### Update Environment Variables
**Backend:**
```
FRONTEND_URL=https://mypantryplan.com
```

**Frontend:**
```
VITE_API_URL=https://api.mypantryplan.com
```

### Redeploy
Railway auto-redeploys when variables change.

---

## Post-Launch Checklist

- [ ] Homepage loads at `https://mypantryplan.com`
- [ ] Google login works
- [ ] All CRUD operations work
- [ ] Database has seed data
- [ ] Mobile devices work
- [ ] SSL certificate active (padlock icon)

---

## Cost Estimate

| Plan | Cost | Includes |
|------|------|----------|
| Free | $0 | 500 build hours, 512MB RAM |
| Hobby | $5/mo | Unlimited builds, 8GB RAM |

Start with free tier. Upgrade if you exceed limits.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Google login fails | Check redirect URIs match exactly |
| Database connection fails | Verify `${{MySQL.MYSQL_HOST}}` syntax |
| Build fails | Check Railway build logs |
| CORS errors | Verify FRONTEND_URL matches domain |
| 502 errors | Backend may still be starting (wait 2-3 min) |

---

## Important URLs

| Service | URL |
|---------|-----|
| Railway Dashboard | https://railway.app/dashboard |
| Google Cloud Console | https://console.cloud.google.com |
| Domain DNS (update this) | <your-registrar-url> |

---

## Environment Variables Reference

### Backend (foodbytes-api)
| Variable | Value |
|----------|-------|
| DB_HOST | `${{MySQL.MYSQL_HOST}}` |
| DB_PORT | `${{MySQL.MYSQL_PORT}}` |
| DB_NAME | `${{MySQL.MYSQL_DATABASE}}` |
| DB_USER | `${{MySQL.MYSQL_USER}}` |
| DB_PASSWORD | `${{MySQL.MYSQL_PASSWORD}}` |
| JWT_SECRET | `<64-char-random-string>` |
| GOOGLE_CLIENT_ID | `<from-google-console>` |
| GOOGLE_CLIENT_SECRET | `<from-google-console>` |
| FRONTEND_URL | `https://mypantryplan.com` |
| SERVER_PORT | `8080` |

### Frontend (client)
| Variable | Value |
|----------|-------|
| VITE_API_URL | `https://api.mypantryplan.com` |

---

## Generate JWT Secret

Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Or use: https://generate-secret.vercel.app/64
