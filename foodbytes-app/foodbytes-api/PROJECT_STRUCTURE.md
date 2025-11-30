# FoodBytes API - Project Structure

## Overview
Complete Spring Boot 3.x backend application for FoodBytes meal planning system.

## Directory Structure

```
foodbytes-api/
├── src/
│   └── main/
│       ├── java/com/foodbytes/
│       │   ├── FoodBytesApplication.java          # Main Spring Boot application
│       │   │
│       │   ├── config/                            # Configuration classes
│       │   │   ├── SecurityConfig.java            # Spring Security, OAuth2, JWT
│       │   │   └── WebConfig.java                 # CORS configuration
│       │   │
│       │   ├── controller/                        # REST API endpoints
│       │   │   ├── AuthController.java            # /api/auth/* - Authentication
│       │   │   ├── RecipeController.java          # /api/recipes/* - Admin recipe management
│       │   │   ├── PublicRecipeController.java    # /api/public/recipes/* - Public recipes
│       │   │   ├── MealPlanController.java        # /api/meal-plan/* - Meal planning
│       │   │   └── AuditController.java           # /api/audit/* - Audit logs
│       │   │
│       │   ├── dto/                               # Data Transfer Objects
│       │   │   ├── UserDTO.java
│       │   │   ├── RecipeDTO.java
│       │   │   ├── MealPlanEntryDTO.java
│       │   │   ├── RecipeAuditLogDTO.java
│       │   │   └── ErrorResponse.java
│       │   │
│       │   ├── exception/                         # Exception handling
│       │   │   └── GlobalExceptionHandler.java
│       │   │
│       │   ├── model/                             # JPA Entity classes
│       │   │   ├── User.java                      # User entity
│       │   │   ├── Recipe.java                    # Recipe entity
│       │   │   ├── MealPlanEntry.java             # Meal plan entry entity
│       │   │   ├── RecipeAuditLog.java            # Audit log entity
│       │   │   ├── OAuthProvider.java             # Enum: GOOGLE, GITHUB
│       │   │   ├── MealType.java                  # Enum: BREAKFAST, LUNCH, DINNER, SNACK
│       │   │   └── AuditAction.java               # Enum: CREATE, UPDATE, DELETE
│       │   │
│       │   ├── repository/                        # JPA Repositories
│       │   │   ├── UserRepository.java
│       │   │   ├── RecipeRepository.java
│       │   │   ├── MealPlanEntryRepository.java
│       │   │   └── RecipeAuditLogRepository.java
│       │   │
│       │   ├── security/                          # Security components
│       │   │   ├── JwtTokenProvider.java          # JWT token generation/validation
│       │   │   ├── JwtAuthenticationFilter.java   # JWT cookie extraction
│       │   │   ├── CustomOAuth2UserService.java   # OAuth2 user processing
│       │   │   ├── CustomOAuth2User.java          # OAuth2 user wrapper
│       │   │   └── OAuth2SuccessHandler.java      # Post-OAuth success handler
│       │   │
│       │   └── service/                           # Business logic
│       │       ├── UserService.java               # User management
│       │       ├── RecipeService.java             # Recipe CRUD with audit
│       │       ├── MealPlanService.java           # Meal plan management
│       │       └── AuditService.java              # Audit logging
│       │
│       └── resources/
│           └── application.yml                    # Application configuration
│
├── pom.xml                                        # Maven dependencies
├── Dockerfile                                     # Multi-stage Docker build
├── .dockerignore                                  # Docker ignore patterns
├── .gitignore                                     # Git ignore patterns
├── .env.example                                   # Environment variables template
├── README.md                                      # Project documentation
└── PROJECT_STRUCTURE.md                           # This file
```

## Component Details

### Models (Entities)

1. **User** (`users` table)
   - OAuth-based user accounts
   - Fields: id, email, name, oauthProvider, oauthId, isAdmin, createdAt, lastLogin
   - Indexes on email and oauth credentials

2. **Recipe** (`recipes` table)
   - Recipe data with JSON fields
   - Fields: id, name, mealTypes (JSON), defaultServings, calories, ingredients (JSON), steps (JSON), isCheat, isLive, isDeleted, createdAt, updatedAt
   - Indexes on isLive and isDeleted

3. **MealPlanEntry** (`meal_plan_entries` table)
   - User meal plan entries
   - Fields: id, user (FK), planDate, mealType, recipe (FK), servings, createdAt, updatedAt
   - Indexes on user_id+planDate

4. **RecipeAuditLog** (`recipe_audit_logs` table)
   - Audit trail for recipe changes
   - Fields: id, recipe (FK), user (FK), action, oldValues (JSON), newValues (JSON), timestamp
   - Indexes on recipe_id and timestamp

### Security Flow

1. **OAuth2 Login**
   - User clicks "Login with Google/GitHub"
   - Redirects to OAuth provider
   - Returns to `/login/oauth2/code/{provider}`
   - CustomOAuth2UserService processes user info
   - OAuth2SuccessHandler generates JWT and sets httpOnly cookie
   - Redirects to frontend dashboard

2. **JWT Authentication**
   - JwtAuthenticationFilter extracts JWT from cookie
   - Validates token and sets SecurityContext
   - Adds ROLE_USER or ROLE_ADMIN authority

3. **Authorization**
   - SecurityConfig defines endpoint access rules
   - Method security with @PreAuthorize annotations

### API Endpoints

#### Public (No authentication)
- `GET /api/public/recipes` - List live recipes
- `GET /api/public/recipes/{id}` - Get live recipe details
- `GET /actuator/health` - Health check

#### Authenticated (Any logged-in user)
- `GET /api/auth/me` - Current user info
- `POST /api/auth/logout` - Logout (clears JWT cookie)
- `GET /api/meal-plan` - Get meal plan entries
- `POST /api/meal-plan` - Create meal plan entry
- `PUT /api/meal-plan/{id}` - Update meal plan entry
- `DELETE /api/meal-plan/{id}` - Delete meal plan entry

#### Admin Only
- `GET /api/recipes` - List all recipes (including non-live)
- `GET /api/recipes/{id}` - Get recipe details
- `POST /api/recipes` - Create recipe
- `PUT /api/recipes/{id}` - Update recipe
- `DELETE /api/recipes/{id}` - Soft delete recipe
- `GET /api/audit/recipes` - All audit logs
- `GET /api/audit/recipes/{id}` - Recipe-specific audit logs
- `GET /api/audit/recipes/date-range` - Audit logs by date range

### Key Features

#### Recipe Visibility Control
- `isLive` flag determines public visibility
- Non-admin users only see recipes with `isLive=true`
- Admin users see all recipes

#### Soft Deletion
- Recipes are never hard-deleted
- `isDeleted` flag hides recipes from queries
- Preserves referential integrity for meal plans

#### Comprehensive Audit Trail
- All recipe changes logged automatically
- Stores complete old and new values as JSON
- Tracks user who made changes and timestamp

#### JWT in HttpOnly Cookies
- More secure than localStorage/sessionStorage
- Prevents XSS attacks
- Automatic inclusion in requests
- CORS configured for credentials

## Database Schema

### Tables Created by JPA

```sql
-- users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    oauth_provider VARCHAR(20) NOT NULL,
    oauth_id VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    last_login DATETIME,
    INDEX idx_email (email),
    INDEX idx_oauth (oauth_provider, oauth_id)
);

-- recipes table
CREATE TABLE recipes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    meal_types JSON,
    default_servings INT NOT NULL,
    calories INT NOT NULL,
    ingredients JSON NOT NULL,
    steps JSON NOT NULL,
    is_cheat BOOLEAN NOT NULL DEFAULT FALSE,
    is_live BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_is_live (is_live),
    INDEX idx_is_deleted (is_deleted)
);

-- meal_plan_entries table
CREATE TABLE meal_plan_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    recipe_id BIGINT NOT NULL,
    servings INT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    INDEX idx_user_date (user_id, plan_date),
    INDEX idx_plan_date (plan_date)
);

-- recipe_audit_logs table
CREATE TABLE recipe_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values JSON,
    new_values JSON,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_timestamp (timestamp)
);
```

## Dependencies

### Core Spring Boot
- spring-boot-starter-web (REST API)
- spring-boot-starter-data-jpa (Database)
- spring-boot-starter-security (Security)
- spring-boot-starter-oauth2-client (OAuth2)
- spring-boot-starter-validation (Input validation)
- spring-boot-starter-actuator (Health checks)

### Database
- mysql-connector-j (MySQL driver)

### Security
- jjwt-api, jjwt-impl, jjwt-jackson (JWT 0.12.3)

### Utilities
- lombok (Reduce boilerplate)
- springdoc-openapi (API documentation)

## Configuration

### Environment Variables

All configuration is externalized via environment variables:

- **Database**: DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD
- **OAuth**: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
- **JWT**: JWT_SECRET, JWT_EXPIRATION, JWT_COOKIE_NAME
- **CORS**: CORS_ALLOWED_ORIGINS
- **Server**: SERVER_PORT
- **Logging**: LOG_LEVEL, SECURITY_LOG_LEVEL, SHOW_SQL

### Production Checklist

Before deploying to production:

1. Change JWT_SECRET to a secure random key
2. Set cookie secure flag to true (requires HTTPS)
3. Update CORS_ALLOWED_ORIGINS to production URLs
4. Configure OAuth redirect URIs in Google/GitHub
5. Set SHOW_SQL to false
6. Adjust LOG_LEVEL to INFO or WARN
7. Use proper database credentials
8. Enable database backups
9. Set up SSL/TLS certificates

## Building and Deployment

### Local Development
```bash
mvn spring-boot:run
```

### Build JAR
```bash
mvn clean package
java -jar target/foodbytes-api-1.0.0.jar
```

### Docker Build
```bash
docker build -t foodbytes-api .
docker run -p 8080:8080 --env-file .env foodbytes-api
```

## Testing

Access Swagger UI for interactive API testing:
- http://localhost:8080/swagger-ui.html

## Monitoring

Health check endpoint:
- http://localhost:8080/actuator/health

## Support

For issues or questions, refer to the main README.md file.
