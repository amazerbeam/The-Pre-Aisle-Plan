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