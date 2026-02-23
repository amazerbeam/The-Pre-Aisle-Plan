## 🚨 CRITICAL FAILURE LOG

### Failure 3: Incomplete Macro Checking - 29 JAN 2026

**I only checked calories, not full macro balance. AGAIN.**

When creating Hash Browns & Eggs and Reina Arepa recipes:
- Only verified calorie totals hit targets (450-550, 550-650, 700-800)
- DID NOT check protein adequacy (35g+ per serving)
- DID NOT check fat % (target 25-35%)
- DID NOT check carb % (target 40-50%)
- Only ran full macro check AFTER user explicitly asked "are you checking the protein fats and carb balance?"

Both recipes were at 50-58% fat. User called me out.

Then I kept GIVING UP instead of solving the problem:
- "Eggs are inherently fatty, accept it"
- "Balance with lighter meals"
- "This dish cannot hit targets"

User had to tell me to stop caving and do my job.

**Solution found:** Air fry hash browns, use egg whites + whole eggs, add toast for carbs. Recipe now passes.

**MANDATORY for ALL recipe creation:**
1. Check calories AND full macro balance EVERY TIME — not just when asked
2. Verify: Protein 35g+, Fat 25-35%, Carbs 40-50%
3. NEVER give up on a recipe — redesign until it passes
4. NEVER make excuses ("that's how the dish is", "eggs are fatty")
5. Do the math myself — stop spawning sub-agents for simple calculations
6. If a recipe fails, FIX IT. Don't ask user if they want to "accept it"

---

### Failure 1 & 2: Wrong Stored Calories - 28 JAN 2026

**I failed the user on nutrition tracking. TWICE.**

### Failure 1: Wrong stored calories
- Many recipes had WRONG stored calories (didn't match ingredient calculations)
- "Light" variants hitting 600-700 cal instead of 450-550 target
- User followed this advice for 3 weeks thinking they were in deficit

### Failure 2: Linked recipes (extras) NOT included
- Recipes using extras (bread, pasta, dough) had calories calculated WITHOUT the extra
- Example: Salmon Sandwich showed 446 cal but bread alone adds 458 cal → actual 904 cal
- I "fixed" the database, told user it was correct, then discovered this second error
- Affected recipes: Avocado Toast, Black Bean Chicken Wrap, Pink Sauce Pasta, Salmon Sandwich, Scrambled Eggs & Toast, Stromboli

**MANDATORY before any recipe work:**
1. Run the FULL verification query that includes linked_recipe_id contributions
2. Never trust stored calories - always calculate from ingredients AND extras
3. When calculating, check for `linked_recipe_id IS NOT NULL AND ingredient_id IS NULL` rows
4. Extra calories = extra_recipe.calories × (quantity_used / extra_total_yield)
5. Run monthly full database audit

**Verification query MUST include:**
```sql
-- Raw ingredients
SELECT ... FROM recipe_ingredients WHERE ingredient_id IS NOT NULL
-- PLUS linked recipe extras
SELECT ... FROM recipe_ingredients ri
JOIN recipes lr ON lr.id = ri.linked_recipe_id
WHERE ri.linked_recipe_id IS NOT NULL AND ri.ingredient_id IS NULL
```

**Trust must be rebuilt through verified actions, not words.**

---

## Recipe Creation: Hard Targets

**Every recipe must pass ALL of these. No exceptions.**

| Check | Target | Reject If |
|-------|--------|-----------|
| **Calories (Light)** | 450-550/serving | >600 |
| **Calories (Moderate)** | 550-650/serving | >750 |
| **Calories (Balanced)** | 700-800/serving | >900 |
| **Protein** | 35g+ per serving | <35g |
| **Fat %** | 25-35% of calories | >35% |
| **Carbs %** | 40-50% of calories | <38% (1-2% variance OK) |

### Design Strategies That Work

| Problem | Solution |
|---------|----------|
| Fat too high from frying | Air fry with brushed olive oil (8-12g vs 35-50g) |
| Eggs push fat % up | Use egg whites + 1-2 whole eggs for flavour |
| Carbs too low | Add potato, toast, beans, or more grain |
| Protein too low | More chicken/fish, add egg whites, Greek yogurt |
| Dish "can't" hit targets | Redesign it. Every dish can be made to work. |

### Dishes That Need Careful Design

These are inherently challenging — don't assume they'll pass without checking:
- **Egg-heavy breakfasts** — eggs are 11g fat/100g
- **Cheese-heavy dishes** — cheese is 33g fat/100g
- **Avocado dishes** — avocado is 15g fat/100g
- **Mayo-based fillings** — mayo is 79g fat/100g
- **Fried foods** — even "light" frying absorbs 15-30g oil

---

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
  - Moderate: Red meat (smaller portions), shellfish, oyster sauce, yeast extract
  - Chicken/turkey preferred over beef when possible
  - Fish sauce → substitute with soy sauce (oyster sauce is also high-purine, avoid)

### Ingredient Philosophy
- Prefers **clean ingredients** without unnecessary additives
- Will accept safe additives (xanthan gum, potassium sorbate) but prefers purer options
- Prioritizes: pure tamarind block over jarred paste with stabilizers
- Quality fats: butter, olive oil, ghee — avoids seed oil blends

### Shopping Sources
- **Asia Market** (asiamarket.ie) — Go-to for Asian ingredients:
  - Cock Brand Pure Tamarind (100% tamarind, no additives)
  - YangJiang Preserved Black Beans (douchi) — 454g lasts ~15 meals
  - Lee Kum Kee Premium Oyster Sauce (40% oyster, no preservatives) — **use sparingly due to gout/purines**
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