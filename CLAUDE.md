- Issues with google login maybe fixable with GOOGLE_CLIENT_SECRET refresh.

## Project Structure

- **Frontend**: React app in `foodbytes-app/client/`
- **Backend**: Spring Boot Java API in `foodbytes-app/foodbytes-api/`
- **Database**: MySQL (hosted on Railway)
- **Database Schema**: `foodbytes-app/database/schema.sql`
- **Migrations**: `foodbytes-app/database/migrations/` - Run manually on live DB

## Key Features

### Meal Plan Sharing
- `users.meal_plan_owner_id` - If set, user shares another user's meal plans (sync mode)
- Both users see/edit the same meal plan entries
- Set via direct DB update: `UPDATE users SET meal_plan_owner_id = 1 WHERE id = 2;`

### Persisted Shopping List
- Shopping lists stored in `shopping_lists` and `shopping_list_items` tables
- One list per user, generated on demand with date range
- Checked state persisted to database (optimistic UI updates)
- API: `/api/shopping-list/*` endpoints

## Deployment

- **Railway** hosts both frontend and backend
- Database migrations must be run manually on Railway MySQL
- Backend auto-deploys on git push, but may need manual redeploy after DB changes

## User Preferences (Recipe Creation)

### Health Considerations
- **Gout history** — Limit high-purine ingredients:
  - Avoid: Organ meats, anchovies, fish sauce, sardines
  - Moderate: Red meat (smaller portions), shellfish, yeast extract
  - Chicken/turkey preferred over beef when possible
  - Fish sauce → substitute with soy sauce or oyster sauce (small amounts)

### Ingredient Philosophy
- Prefers **clean ingredients** without unnecessary additives
- Will accept safe additives (xanthan gum, potassium sorbate) but prefers purer options
- Prioritizes: pure tamarind block over jarred paste with stabilizers
- Quality fats: butter, olive oil, ghee — avoids seed oil blends

### Shopping Sources
- **Asia Market** (asiamarket.ie) — Go-to for Asian ingredients:
  - Cock Brand Pure Tamarind (100% tamarind, no additives)
  - YangJiang Preserved Black Beans (douchi) — 454g lasts ~15 meals
  - Lee Kum Kee Premium Oyster Sauce (40% oyster, no preservatives)
- Tesco Ireland for everyday ingredients

## Weight Tracking & Diet Plans

Personal weight tracking files for the user and wife:

| File | Purpose |
|------|---------|
| `Claude/agents/Chef/my-diet-plan.md` | User's diet plan, calorie targets, weight log |
| `Claude/agents/Chef/wife-diet-plan.md` | Wife's diet plan and weight log |
| `Claude/agents/Chef/weight-progress-chart.html` | Visual chart of user's weight progress |

**Key data (as of 19 Jan 2026):**
- **User:** 5'9" male. Started 13st 6lb (2 Jan) → 12st 13lb (19 Jan) = 7 lbs lost
  - Goal 1: 12st (13 lbs to go)
  - Goal 2: 11st (27 lbs to go)
- **Wife:** Started 10st 0lb → 9st 13lb = holding steady (~1 lb)

When discussing weight progress, read these files for current data.