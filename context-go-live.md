# MyPantryPlan Go-Live Context

## PROGRESS TRACKER
| Phase | Status |
|-------|--------|
| Phase 1: Domain | COMPLETE |
| Phase 2: Prepare Code | COMPLETE |
| Phase 3: Railway Setup | **IN PROGRESS - TROUBLESHOOTING** |
| Phase 4: Google OAuth | Pending |
| Phase 5: Custom Domain | Pending |
| Phase 6: Final Config | Pending |

---

## CURRENT ISSUE (Resume Here)

**Problem:** Frontend shows "Application failed to respond"
- Backend may not be connecting to MySQL properly
- OR nginx internal hostname might be wrong

**Next Steps:**
1. Check if backend (The-Pre-Aisle-Plan) is "Online" in Railway
2. If crashed, check Deploy Logs for database connection errors
3. If online but frontend fails, the nginx internal hostname needs fixing
4. May need to verify: `the-pre-aisle-plan.railway.internal` is correct hostname

**To Debug:**
- Railway → The-Pre-Aisle-Plan → Deployments → Deploy Logs
- Look for "Communications link failure" (DB issue) or startup success

---

## Railway Project Details (CREATED)

| Item | Value |
|------|-------|
| **Project Name** | resilient-strength |
| **Project URL** | https://railway.app/project/95f55d51-95b7-4c38-9e37-4e34c5a62970 |
| **Backend Service** | The-Pre-Aisle-Plan |
| **Backend Domain** | https://the-pre-aisle-plan-production.up.railway.app |
| **Frontend Service** | resourceful-healing |
| **Frontend Domain** | https://resourceful-healing-production-d127.up.railway.app |
| **MySQL** | Online (hopper.proxy.rlwy.net:35402) |
| **Branch Deployed** | AI_Master |

---

## Domain (PURCHASED)
- **Domain:** mypantryplan.com
- **Registrar:** Porkbun (https://porkbun.com)
- **Cost:** $11.08/year
- **DNS Management:** https://porkbun.com/account/domains

## GitHub Repository
- **Repo:** https://github.com/amazerbeam/The-Pre-Aisle-Plan
- **Branch:** AI_Master (deployed branch)

## Project Stack
- **Frontend:** React (Vite) → builds to nginx
- **Backend:** Java Spring Boot (Maven, JDK 17)
- **Database:** MySQL 9.4 (Railway)
- **Auth:** Google OAuth 2.0

---

## PHASE 1: Domain Name - COMPLETE

- [x] Purchased mypantryplan.com on Porkbun ($11.08/year)

---

## PHASE 2: Prepare Code - COMPLETE

- [x] Code pushed to GitHub (AI_Master branch)
- [x] nginx.conf updated for Railway internal networking

---

## PHASE 3: Railway Setup - IN PROGRESS

### Completed:
- [x] Railway project created (resilient-strength)
- [x] MySQL database added and online
- [x] Backend service added (The-Pre-Aisle-Plan)
- [x] Frontend service added (resourceful-healing)
- [x] Backend domain generated
- [x] Frontend domain generated
- [x] Database schema loaded (via MySQL Workbench)
- [x] Database seed data loaded (seed.sql)
- [x] Database recipes loaded (seed-merged-recipes.sql)

### In Progress / Needs Fixing:
- [ ] Backend connecting to MySQL (was failing with "Connection refused")
- [ ] Frontend able to proxy to backend via internal networking

### Backend Environment Variables (CORRECTED)
```
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=3306
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
JWT_SECRET=9ffb1810bb3b754971d22a7b395829e87da5acf0cab4370b5f4ea01488945db2ff341be1f693506b08dc8bf15d37f0cc0c9bc2630ff5a20ad39cfa1467bfe4b9
FRONTEND_URL=https://mypantryplan.com
SERVER_PORT=8080
GOOGLE_CLIENT_ID=223434780066-breqjhu82qa75oji1cqgcgbteh88aouo.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

**IMPORTANT:** Railway MySQL uses variable names WITHOUT underscores:
- `MYSQLHOST` (not MYSQL_HOST)
- `MYSQLPORT` (not MYSQL_PORT)
- `MYSQLDATABASE` (not MYSQL_DATABASE)
- `MYSQLUSER` (not MYSQL_USER)
- `MYSQLPASSWORD` (not MYSQL_PASSWORD)

### Frontend Environment Variables
```
VITE_API_URL=https://the-pre-aisle-plan-production.up.railway.app
```

### MySQL Connection (for MySQL Workbench)
| Setting | Value |
|---------|-------|
| Hostname | hopper.proxy.rlwy.net |
| Port | 35402 |
| Username | root |
| Password | ZWchcZDknhrDPOASAxjULcvsrkoxvroX |
| Database | railway |

---

## PHASE 4: Google OAuth Production Setup - PENDING

### Update Google Cloud Console
URL: https://console.cloud.google.com

1. Go to **APIs & Services** → **Credentials**
2. Click your OAuth 2.0 Client ID
3. Add **Authorized JavaScript origins**:
   ```
   https://mypantryplan.com
   https://resourceful-healing-production-d127.up.railway.app
   ```
4. Add **Authorized redirect URIs**:
   ```
   https://resourceful-healing-production-d127.up.railway.app/login/oauth2/code/google
   https://the-pre-aisle-plan-production.up.railway.app/login/oauth2/code/google
   https://mypantryplan.com/login/oauth2/code/google
   ```
5. Save

### Publish OAuth App
1. Go to **OAuth consent screen**
2. Click **"Publish App"** (Testing → Production)

---

## PHASE 5: Custom Domain - PENDING

### Connect Domain to Frontend
1. Railway → resourceful-healing → Settings → Networking
2. Add custom domain: `mypantryplan.com`
3. Copy the DNS records Railway provides

### Update DNS at Porkbun
1. Go to https://porkbun.com/account/domains
2. Add CNAME record Railway provided
3. Wait 5-60 minutes for propagation

### (Optional) API Subdomain
- Add `api.mypantryplan.com` → The-Pre-Aisle-Plan service
- Update `VITE_API_URL=https://api.mypantryplan.com`

---

## PHASE 6: Final Configuration - PENDING

### Update Environment Variables
**Backend:**
```
FRONTEND_URL=https://mypantryplan.com
```

**Frontend:**
```
VITE_API_URL=https://api.mypantryplan.com
```
(or keep the Railway domain if not using subdomain)

### Update Google OAuth redirect URIs for custom domain

---

## Post-Launch Checklist

- [ ] Backend service online (no crashes)
- [ ] Frontend loads at Railway domain
- [ ] Homepage loads at `https://mypantryplan.com`
- [ ] Google login works
- [ ] All CRUD operations work
- [ ] Database has seed data
- [ ] Mobile devices work
- [ ] SSL certificate active (padlock icon)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Communications link failure" | Check DB_HOST uses `${{MySQL.MYSQLHOST}}` (no underscore) |
| "Connection refused" | Backend can't reach MySQL - verify variable names |
| "host not found in upstream" | nginx can't find backend - check internal hostname |
| "Application failed to respond" | Check both backend and frontend Deploy Logs |
| Google login fails | Check redirect URIs match exactly |
| Build fails | Check Railway build logs |
| CORS errors | Verify FRONTEND_URL matches domain |
| 502 errors | Backend may still be starting (wait 2-3 min) |

---

## Important URLs

| Service | URL |
|---------|-----|
| Railway Dashboard | https://railway.app/dashboard |
| Railway Project | https://railway.app/project/95f55d51-95b7-4c38-9e37-4e34c5a62970 |
| Google Cloud Console | https://console.cloud.google.com |
| Porkbun DNS Management | https://porkbun.com/account/domains |
| GitHub Repo | https://github.com/amazerbeam/The-Pre-Aisle-Plan |
| Backend (Railway) | https://the-pre-aisle-plan-production.up.railway.app |
| Frontend (Railway) | https://resourceful-healing-production-d127.up.railway.app |

---

## Files Modified for Railway Deployment

1. `foodbytes-app/client/nginx.conf` - Updated to use Railway internal networking:
   - Changed `http://api:8080` to `http://the-pre-aisle-plan.railway.internal:8080`
   - This allows frontend nginx to proxy API requests to backend

---

## Cost Estimate

| Plan | Cost | Includes |
|------|------|----------|
| Trial | $0 | $5 credit, 512MB RAM |
| Hobby | $5/mo | Unlimited builds, 8GB RAM |

Current: Trial Plan (30 days or $5.00 left)
