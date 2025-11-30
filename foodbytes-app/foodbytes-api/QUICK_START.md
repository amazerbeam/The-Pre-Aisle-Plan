# FoodBytes API - Quick Start Guide

Get the FoodBytes API up and running in minutes!

## Prerequisites

- Java 17+ installed ([Download](https://adoptium.net/))
- Maven 3.6+ installed ([Download](https://maven.apache.org/download.cgi))
- MySQL 8.0+ installed and running ([Download](https://dev.mysql.com/downloads/mysql/))

## Step 1: Database Setup

Create the database:

```sql
mysql -u root -p

CREATE DATABASE foodbytes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

## Step 2: OAuth Application Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure consent screen if prompted
6. Application type: **Web application**
7. Add authorized redirect URI:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
8. Copy **Client ID** and **Client Secret**

### GitHub OAuth Setup

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - Application name: `FoodBytes Local`
   - Homepage URL: `http://localhost:8080`
   - Authorization callback URL: `http://localhost:8080/login/oauth2/code/github`
4. Click **Register application**
5. Copy **Client ID** and generate **Client Secret**

## Step 3: Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=foodbytes
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# OAuth2 Configuration - Google
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# OAuth2 Configuration - GitHub
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# JWT Configuration (generate a secure key for production!)
JWT_SECRET=change-this-to-a-secure-random-256-bit-key-minimum-32-characters-long
JWT_EXPIRATION=86400000
JWT_COOKIE_NAME=foodbytes_token

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Server Configuration
SERVER_PORT=8080

# Logging
LOG_LEVEL=DEBUG
SECURITY_LOG_LEVEL=DEBUG
SHOW_SQL=false
```

## Step 4: Run the Application

### Option A: Using Maven

```bash
# Install dependencies and run
mvn spring-boot:run
```

### Option B: Build and Run JAR

```bash
# Build
mvn clean package

# Run
java -jar target/foodbytes-api-1.0.0.jar
```

### Option C: Using Docker

```bash
# Build image
docker build -t foodbytes-api .

# Run container
docker run -p 8080:8080 --env-file .env foodbytes-api
```

## Step 5: Verify Installation

1. **Health Check**
   ```bash
   curl http://localhost:8080/actuator/health
   ```
   Should return: `{"status":"UP"}`

2. **API Documentation**
   Open browser: http://localhost:8080/swagger-ui.html

3. **Test Public Endpoint**
   ```bash
   curl http://localhost:8080/api/public/recipes
   ```
   Should return: `[]` (empty array - no recipes yet)

## Step 6: Create First Admin User

1. **Login via OAuth**
   - Open: http://localhost:8080/oauth2/authorization/google
   - OR: http://localhost:8080/oauth2/authorization/github
   - Complete OAuth flow

2. **Make yourself admin** (run in MySQL):
   ```sql
   USE foodbytes;

   -- Check your user
   SELECT * FROM users;

   -- Update to admin (replace email with yours)
   UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
   ```

## Step 7: Test Admin Endpoints

Get your JWT cookie first by logging in, then test:

```bash
# Using browser or Postman with cookies enabled

# Get all recipes (admin only)
GET http://localhost:8080/api/recipes

# Create a recipe (admin only)
POST http://localhost:8080/api/recipes
Content-Type: application/json

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

## Common Issues & Solutions

### Issue: "Access Denied" errors

**Solution**: Make sure you're logged in and have admin privileges
- Check `users` table: `SELECT * FROM users;`
- Verify `is_admin = true` for your account

### Issue: OAuth redirect fails

**Solution**:
1. Verify redirect URIs in Google/GitHub match exactly:
   - Google: `http://localhost:8080/login/oauth2/code/google`
   - GitHub: `http://localhost:8080/login/oauth2/code/github`
2. Check CORS_ALLOWED_ORIGINS includes your frontend URL

### Issue: Database connection fails

**Solution**:
1. Verify MySQL is running: `mysql -u root -p`
2. Check credentials in `.env` match MySQL
3. Verify database exists: `SHOW DATABASES;`

### Issue: "JWT signature does not match"

**Solution**:
- JWT_SECRET must be at least 256 bits (32 characters)
- If you change JWT_SECRET, all existing tokens become invalid (users must re-login)

### Issue: CORS errors in browser

**Solution**:
1. Add your frontend URL to CORS_ALLOWED_ORIGINS
2. Ensure your frontend sends credentials: `credentials: 'include'`

## Next Steps

1. **Create Sample Recipes**
   - Use Swagger UI to create recipes
   - Set `isLive: true` to make them public

2. **Test Meal Planning**
   - Login as regular user
   - Create meal plan entries via `/api/meal-plan`

3. **Review Audit Logs**
   - Check `/api/audit/recipes` to see change history

4. **Set Up Frontend**
   - Configure frontend to use this API
   - Update CORS_ALLOWED_ORIGINS with frontend URL

## Useful Commands

```bash
# Clean and rebuild
mvn clean install

# Run tests
mvn test

# Check dependencies
mvn dependency:tree

# Create JAR without tests
mvn clean package -DskipTests

# View logs
tail -f logs/foodbytes-api.log

# Connect to MySQL
mysql -u root -p foodbytes

# View all tables
mysql> SHOW TABLES;

# View users
mysql> SELECT * FROM users;

# View recipes
mysql> SELECT id, name, is_live, is_deleted FROM recipes;
```

## Development Tips

1. **Use Swagger UI** for testing endpoints interactively
2. **Check logs** in console for debugging
3. **Use Postman** or similar tool for API testing with cookies
4. **Enable SQL logging** temporarily: Set `SHOW_SQL=true` in .env
5. **Monitor health**: Keep `/actuator/health` bookmarked

## Production Deployment

Before deploying to production:

1. Generate secure JWT_SECRET:
   ```bash
   openssl rand -base64 64
   ```

2. Update OAuth redirect URIs to production URLs

3. Set cookie secure flag to true in `OAuth2SuccessHandler.java`:
   ```java
   cookie.setSecure(true); // Requires HTTPS
   ```

4. Configure production database

5. Set appropriate CORS_ALLOWED_ORIGINS

6. Change logging levels to INFO/WARN

## Support & Documentation

- **Full Documentation**: See [README.md](README.md)
- **Project Structure**: See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **API Docs**: http://localhost:8080/swagger-ui.html (when running)

## Success!

You now have a fully functional FoodBytes API running locally!

Try logging in via OAuth and creating your first recipe.
