# FoodBytes API - Testing Checklist

Use this checklist to verify that the FoodBytes API is working correctly.

## Pre-Testing Setup

### ✅ Prerequisites
- [ ] Java 17+ installed and verified (`java -version`)
- [ ] Maven 3.6+ installed and verified (`mvn -version`)
- [ ] MySQL 8.0+ installed and running
- [ ] Database `foodbytes` created

### ✅ Configuration
- [ ] `.env` file created from `.env.example`
- [ ] Database credentials configured
- [ ] Google OAuth Client ID and Secret configured
- [ ] GitHub OAuth Client ID and Secret configured
- [ ] JWT_SECRET configured (minimum 32 characters)
- [ ] CORS_ALLOWED_ORIGINS configured with frontend URL

### ✅ OAuth Configuration
- [ ] Google OAuth redirect URI added: `http://localhost:8080/login/oauth2/code/google`
- [ ] GitHub OAuth redirect URI added: `http://localhost:8080/login/oauth2/code/github`

---

## Build and Startup Tests

### ✅ Maven Build
```bash
cd C:\Users\jossd\Documents\MyWebSites\FoodBytes\foodbytes-app\foodbytes-api
mvn clean install
```

**Expected**: Build SUCCESS, no compilation errors

- [ ] Build completes successfully
- [ ] No compilation errors
- [ ] All dependencies downloaded
- [ ] JAR file created in `target/` directory

### ✅ Application Startup
```bash
mvn spring-boot:run
```

**Expected**: Application starts on port 8080

- [ ] Application starts without errors
- [ ] Database connection successful
- [ ] Tables created automatically (users, recipes, meal_plan_entries, recipe_audit_logs)
- [ ] OAuth2 clients registered
- [ ] Swagger UI available

**Look for in logs**:
```
Started FoodBytesApplication in X.XXX seconds
```

---

## Health Check Tests

### ✅ Actuator Health Endpoint

**Test**: `GET http://localhost:8080/actuator/health`

```bash
curl http://localhost:8080/actuator/health
```

**Expected Response**:
```json
{
  "status": "UP"
}
```

- [ ] Returns HTTP 200
- [ ] Returns status "UP"

### ✅ Swagger UI

**Test**: Open `http://localhost:8080/swagger-ui.html` in browser

- [ ] Swagger UI loads
- [ ] All endpoints visible
- [ ] Controllers organized by tag

---

## Public Endpoint Tests (No Authentication Required)

### ✅ List Public Recipes

**Test**: `GET http://localhost:8080/api/public/recipes`

```bash
curl http://localhost:8080/api/public/recipes
```

**Expected Response**:
```json
[]
```
(Empty array - no recipes yet)

- [ ] Returns HTTP 200
- [ ] Returns empty array initially

### ✅ Get Non-Existent Public Recipe

**Test**: `GET http://localhost:8080/api/public/recipes/999`

```bash
curl http://localhost:8080/api/public/recipes/999
```

**Expected**: HTTP 400 or 404 with error message

- [ ] Returns appropriate error status
- [ ] Returns error message

---

## OAuth Authentication Tests

### ✅ Google OAuth Login

**Test**: Navigate to `http://localhost:8080/oauth2/authorization/google`

**Steps**:
1. Open URL in browser
2. Redirects to Google login
3. Select Google account
4. Grant permissions
5. Redirects back to application

- [ ] Redirects to Google
- [ ] Can login with Google account
- [ ] Redirects back successfully
- [ ] JWT cookie set in browser
- [ ] User created in database

**Verify in MySQL**:
```sql
SELECT * FROM users WHERE oauth_provider = 'GOOGLE';
```

- [ ] User record exists
- [ ] Email, name populated correctly
- [ ] `is_admin` is FALSE by default
- [ ] `last_login` is set
- [ ] `created_at` is set

### ✅ GitHub OAuth Login

**Test**: Navigate to `http://localhost:8080/oauth2/authorization/github`

**Steps**: Same as Google

- [ ] Redirects to GitHub
- [ ] Can login with GitHub account
- [ ] Redirects back successfully
- [ ] JWT cookie set in browser
- [ ] User created in database

### ✅ JWT Cookie Verification

**Test**: Check browser DevTools → Application/Storage → Cookies

**Expected Cookie**:
- Name: `foodbytes_token`
- Value: JWT token (long string)
- HttpOnly: ✓
- Path: /
- SameSite: Lax

- [ ] Cookie name matches `JWT_COOKIE_NAME` from config
- [ ] Cookie is httpOnly
- [ ] Cookie contains JWT token

---

## Authenticated Endpoint Tests (Requires Login)

### ✅ Get Current User

**Test**: `GET http://localhost:8080/api/auth/me`

**Prerequisites**: Must be logged in via OAuth

```bash
# Use browser with valid cookie or Postman with cookies enabled
# GET http://localhost:8080/api/auth/me
```

**Expected Response**:
```json
{
  "id": 1,
  "email": "your-email@example.com",
  "name": "Your Name",
  "oauthProvider": "GOOGLE",
  "isAdmin": false,
  "createdAt": "2024-01-01T00:00:00",
  "lastLogin": "2024-01-01T00:00:00"
}
```

- [ ] Returns HTTP 200
- [ ] Returns user data
- [ ] Email matches logged-in user
- [ ] `isAdmin` is false (initially)

### ✅ Logout

**Test**: `POST http://localhost:8080/api/auth/logout`

**Expected Response**:
```json
{
  "message": "Logged out successfully"
}
```

**After logout**:
- [ ] Cookie cleared/expired
- [ ] Subsequent requests return 401 Unauthorized

---

## Admin Setup Tests

### ✅ Make User Admin

**Test**: Run in MySQL

```sql
USE foodbytes;

-- Find your user
SELECT id, email, is_admin FROM users;

-- Make yourself admin (replace with your email)
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';

-- Verify
SELECT id, email, is_admin FROM users WHERE email = 'your-email@example.com';
```

- [ ] User updated successfully
- [ ] `is_admin` is now TRUE

**Important**: Must logout and login again for admin role to take effect!

- [ ] Logout via `/api/auth/logout`
- [ ] Login again via OAuth
- [ ] Verify new JWT has admin role

---

## Admin Recipe Management Tests

### ✅ Create Recipe (Admin Only)

**Test**: `POST http://localhost:8080/api/recipes`

**Request Body**:
```json
{
  "name": "Scrambled Eggs",
  "mealTypes": ["BREAKFAST"],
  "defaultServings": 2,
  "calories": 280,
  "ingredients": [
    {
      "name": "eggs",
      "amount": 4,
      "unit": "piece"
    },
    {
      "name": "butter",
      "amount": 1,
      "unit": "tbsp"
    }
  ],
  "steps": [
    "Beat eggs in a bowl",
    "Melt butter in pan over medium heat",
    "Pour eggs and stir gently until cooked"
  ],
  "isCheat": false,
  "isLive": true
}
```

**Expected**: HTTP 201 Created with recipe data

- [ ] Returns HTTP 201
- [ ] Returns created recipe with ID
- [ ] Recipe saved in database
- [ ] Audit log created (check `recipe_audit_logs` table)

**Verify in MySQL**:
```sql
SELECT id, name, is_live, is_deleted FROM recipes;
SELECT * FROM recipe_audit_logs;
```

- [ ] Recipe exists in database
- [ ] Audit log entry created with action='CREATE'

### ✅ List All Recipes (Admin)

**Test**: `GET http://localhost:8080/api/recipes`

**Expected**: Returns array with created recipes (including non-live)

- [ ] Returns HTTP 200
- [ ] Returns all recipes including non-live ones

### ✅ Update Recipe (Admin)

**Test**: `PUT http://localhost:8080/api/recipes/{id}`

**Request Body**: (modify name or any field)
```json
{
  "name": "Perfect Scrambled Eggs",
  "mealTypes": ["BREAKFAST"],
  "defaultServings": 2,
  "calories": 280,
  "ingredients": [...],
  "steps": [...],
  "isCheat": false,
  "isLive": true
}
```

**Expected**: HTTP 200 with updated recipe

- [ ] Returns HTTP 200
- [ ] Recipe updated in database
- [ ] Audit log created with action='UPDATE'
- [ ] Audit log contains both old and new values

### ✅ Soft Delete Recipe (Admin)

**Test**: `DELETE http://localhost:8080/api/recipes/{id}`

**Expected**: HTTP 204 No Content

- [ ] Returns HTTP 204
- [ ] Recipe marked as deleted (`is_deleted=true`)
- [ ] Recipe no longer appears in GET requests
- [ ] Audit log created with action='DELETE'

**Verify in MySQL**:
```sql
SELECT id, name, is_deleted FROM recipes WHERE id = X;
```

- [ ] `is_deleted` is TRUE
- [ ] Recipe still exists in database

---

## Recipe Visibility Tests

### ✅ Non-Live Recipe (Admin vs Public)

**Test**: Create recipe with `isLive: false`

**Admin View** (`GET /api/recipes`):
- [ ] Admin sees non-live recipe

**Public View** (`GET /api/public/recipes`):
- [ ] Public does NOT see non-live recipe

**Non-Admin Authenticated View** (`GET /api/meal-plan` with non-live recipe):
- [ ] Non-admin user cannot use non-live recipe in meal plan

### ✅ Live Recipe (All Users)

**Test**: Create recipe with `isLive: true`

**Admin View**:
- [ ] Admin sees live recipe

**Public View**:
- [ ] Public sees live recipe

**Non-Admin Authenticated View**:
- [ ] Non-admin can use live recipe in meal plan

---

## Meal Plan Tests (Authenticated Users)

### ✅ Create Meal Plan Entry

**Prerequisites**: At least one live recipe exists

**Test**: `POST http://localhost:8080/api/meal-plan`

**Request Body**:
```json
{
  "planDate": "2024-06-01",
  "mealType": "BREAKFAST",
  "recipeId": 1,
  "servings": 2
}
```

**Expected**: HTTP 201 with meal plan entry

- [ ] Returns HTTP 201
- [ ] Entry saved in database
- [ ] Entry associated with logged-in user

### ✅ Get Meal Plan Entries

**Test**: `GET http://localhost:8080/api/meal-plan?startDate=2024-06-01&endDate=2024-06-07`

**Expected**: HTTP 200 with array of entries

- [ ] Returns HTTP 200
- [ ] Returns only current user's entries
- [ ] Recipe data included in response
- [ ] Entries ordered by date

### ✅ Update Meal Plan Entry

**Test**: `PUT http://localhost:8080/api/meal-plan/{id}`

**Request Body**:
```json
{
  "servings": 4
}
```

**Expected**: HTTP 200 with updated entry

- [ ] Returns HTTP 200
- [ ] Entry updated in database
- [ ] Only entry owner can update

### ✅ Delete Meal Plan Entry

**Test**: `DELETE http://localhost:8080/api/meal-plan/{id}`

**Expected**: HTTP 204 No Content

- [ ] Returns HTTP 204
- [ ] Entry deleted from database
- [ ] Only entry owner can delete

### ✅ User Isolation

**Test**: Login as different user, try to access another user's meal plan

- [ ] User A cannot see User B's meal plan entries
- [ ] User A cannot modify User B's entries
- [ ] User A cannot delete User B's entries

---

## Audit Log Tests (Admin Only)

### ✅ Get All Audit Logs

**Test**: `GET http://localhost:8080/api/audit/recipes`

**Expected**: HTTP 200 with audit logs

- [ ] Returns HTTP 200
- [ ] Returns all audit logs
- [ ] Logs ordered by timestamp (newest first)
- [ ] Contains CREATE, UPDATE, DELETE actions

### ✅ Get Recipe-Specific Audit Logs

**Test**: `GET http://localhost:8080/api/audit/recipes/{recipeId}`

**Expected**: HTTP 200 with recipe-specific logs

- [ ] Returns HTTP 200
- [ ] Returns only logs for specified recipe
- [ ] Includes old and new values as JSON

### ✅ Audit Log Content Verification

**Check audit log entry for UPDATE action**:

- [ ] Contains `oldValues` JSON with previous data
- [ ] Contains `newValues` JSON with updated data
- [ ] Contains user ID who made change
- [ ] Contains timestamp

---

## Authorization Tests

### ✅ Public Endpoints (No Auth)

- [ ] `GET /api/public/recipes` - Works without auth
- [ ] `GET /actuator/health` - Works without auth

### ✅ Authenticated Endpoints (Requires Login)

**Without Auth**:
- [ ] `GET /api/auth/me` - Returns 401
- [ ] `GET /api/meal-plan` - Returns 401
- [ ] `POST /api/meal-plan` - Returns 401

**With Auth**:
- [ ] Same endpoints return 200

### ✅ Admin Endpoints (Requires Admin Role)

**As Non-Admin User**:
- [ ] `GET /api/recipes` - Returns 403 Forbidden
- [ ] `POST /api/recipes` - Returns 403 Forbidden
- [ ] `GET /api/audit/recipes` - Returns 403 Forbidden

**As Admin User**:
- [ ] Same endpoints return 200/201

---

## CORS Tests

### ✅ CORS Headers

**Test**: Make request from browser/Postman and check response headers

**Expected Headers**:
```
Access-Control-Allow-Origin: http://localhost:3000 (or configured origin)
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

- [ ] CORS headers present
- [ ] Credentials allowed
- [ ] Origin matches configured value

### ✅ Preflight Request

**Test**: OPTIONS request to any endpoint

**Expected**: HTTP 200 with CORS headers

- [ ] OPTIONS request succeeds
- [ ] CORS headers present

---

## Error Handling Tests

### ✅ Validation Errors

**Test**: POST recipe with invalid data (missing required fields)

**Expected**: HTTP 400 with validation errors

- [ ] Returns HTTP 400
- [ ] Error message includes field names
- [ ] Error message includes validation messages

### ✅ Not Found Errors

**Test**: GET recipe with non-existent ID

**Expected**: HTTP 400/404 with error message

- [ ] Returns appropriate error status
- [ ] Error message is descriptive

### ✅ Unauthorized Access

**Test**: Access admin endpoint without admin role

**Expected**: HTTP 403 Forbidden

- [ ] Returns HTTP 403
- [ ] Error message indicates forbidden access

---

## Docker Tests (Optional)

### ✅ Docker Build

```bash
docker build -t foodbytes-api .
```

- [ ] Build completes successfully
- [ ] No errors during build
- [ ] Image created

### ✅ Docker Run

```bash
docker run -p 8080:8080 --env-file .env foodbytes-api
```

- [ ] Container starts successfully
- [ ] Application runs inside container
- [ ] Health check passes

### ✅ Docker Health Check

```bash
docker ps
```

**Check health status column**:
- [ ] Shows "healthy" status after startup

---

## Performance Tests (Optional)

### ✅ Multiple Requests

**Test**: Make 100 concurrent requests

- [ ] All requests complete successfully
- [ ] Response times reasonable (<1s)
- [ ] No errors or timeouts

### ✅ Large Dataset

**Test**: Create 100+ recipes, query them

- [ ] Application handles large dataset
- [ ] Query performance acceptable
- [ ] No memory issues

---

## Security Tests

### ✅ JWT Expiration

**Test**: Wait for JWT to expire (24 hours by default)

- [ ] Expired JWT returns 401
- [ ] Must re-login to get new JWT

### ✅ Cookie Security Attributes

**Test**: Check cookie in DevTools

- [ ] HttpOnly: ✓ (prevents JavaScript access)
- [ ] Secure: ✗ (set to true in production with HTTPS)
- [ ] SameSite: Lax (CSRF protection)

### ✅ SQL Injection Protection

**Test**: Try SQL injection in recipe name: `'; DROP TABLE recipes; --`

- [ ] Input sanitized
- [ ] No SQL injection possible
- [ ] JPA protects against SQL injection

### ✅ XSS Protection

**Test**: Try XSS in recipe name: `<script>alert('xss')</script>`

- [ ] Input escaped
- [ ] No script execution
- [ ] Content rendered safely

---

## Final Verification

### ✅ Complete Flow Test

**Scenario**: New user creates a meal plan

1. [ ] User logs in via OAuth (Google or GitHub)
2. [ ] User views available recipes (`/api/public/recipes`)
3. [ ] User creates meal plan for the week (`POST /api/meal-plan`)
4. [ ] User views their meal plan (`GET /api/meal-plan`)
5. [ ] User updates servings (`PUT /api/meal-plan/{id}`)
6. [ ] User removes a meal (`DELETE /api/meal-plan/{id}`)
7. [ ] User logs out (`POST /api/auth/logout`)

**All steps complete successfully**: ✅

### ✅ Admin Flow Test

**Scenario**: Admin manages recipes

1. [ ] Admin logs in via OAuth
2. [ ] Admin creates new recipe (`POST /api/recipes`)
3. [ ] Admin views all recipes including non-live (`GET /api/recipes`)
4. [ ] Admin updates recipe (`PUT /api/recipes/{id}`)
5. [ ] Admin views audit log (`GET /api/audit/recipes`)
6. [ ] Admin deletes recipe (`DELETE /api/recipes/{id}`)
7. [ ] Admin verifies recipe is soft-deleted in database

**All steps complete successfully**: ✅

---

## ✅ All Tests Passed!

If all checks are complete, the FoodBytes API is **fully functional** and ready for integration with the frontend!

## Next Steps

1. **Document API for Frontend Team**
   - Share Swagger UI URL
   - Explain authentication flow
   - Provide example requests

2. **Set Up Production Environment**
   - Deploy to cloud service
   - Configure production database
   - Update OAuth redirect URIs
   - Enable HTTPS
   - Set secure cookies

3. **Monitor Application**
   - Set up logging aggregation
   - Configure alerts
   - Monitor health endpoints

4. **Performance Optimization**
   - Add database indexes if needed
   - Implement caching
   - Optimize queries

---

**Testing completed on**: _______________

**Tested by**: _______________

**Notes**: _______________
