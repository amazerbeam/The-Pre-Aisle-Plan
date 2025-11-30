# FoodBytes API

Backend API for FoodBytes meal planning application built with Spring Boot 3.x.

## Features

- **OAuth2 Authentication**: Google and GitHub login support
- **JWT Token-based Authorization**: Secure httpOnly cookie-based authentication
- **Recipe Management**: CRUD operations with admin-only access
- **Meal Planning**: User-specific meal plan management
- **Audit Logging**: Complete audit trail for recipe changes
- **Role-based Access Control**: Admin and User roles
- **Public API**: Public endpoints for live recipes

## Tech Stack

- Spring Boot 3.2.0
- Spring Security with OAuth2
- Spring Data JPA
- MySQL Database
- JWT (jjwt 0.12.3)
- Lombok
- OpenAPI/Swagger Documentation

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

## Environment Variables

Create a `.env` file or set the following environment variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=foodbytes
DB_USERNAME=root
DB_PASSWORD=password

# OAuth2 Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-change-this-in-production-make-it-long-enough
JWT_EXPIRATION=86400000
JWT_COOKIE_NAME=foodbytes_token

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Server Configuration
SERVER_PORT=8080
```

## Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE foodbytes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. The application will automatically create tables using JPA's `ddl-auto: update` setting.

## Running the Application

### Local Development

```bash
# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

### Docker

```bash
# Build Docker image
docker build -t foodbytes-api .

# Run container
docker run -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_NAME=foodbytes \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=password \
  -e GOOGLE_CLIENT_ID=your-google-client-id \
  -e GOOGLE_CLIENT_SECRET=your-google-client-secret \
  -e GITHUB_CLIENT_ID=your-github-client-id \
  -e GITHUB_CLIENT_SECRET=your-github-client-secret \
  -e JWT_SECRET=your-secret-key \
  foodbytes-api
```

## API Documentation

Once the application is running, access the Swagger UI documentation at:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/api-docs

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user info (authenticated)
- `POST /api/auth/logout` - Logout (authenticated)
- `GET /oauth2/authorization/{provider}` - Initiate OAuth2 login (google/github)

### Public Recipes
- `GET /api/public/recipes` - Get all live recipes (public)
- `GET /api/public/recipes/{id}` - Get specific live recipe (public)

### Recipes (Admin Only)
- `GET /api/recipes` - Get all recipes (includes non-live)
- `GET /api/recipes/{id}` - Get specific recipe
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/{id}` - Update recipe
- `DELETE /api/recipes/{id}` - Soft delete recipe

### Meal Plan (Authenticated Users)
- `GET /api/meal-plan?startDate={date}&endDate={date}` - Get meal plan entries
- `POST /api/meal-plan` - Create meal plan entry
- `PUT /api/meal-plan/{id}` - Update meal plan entry
- `DELETE /api/meal-plan/{id}` - Delete meal plan entry

### Audit (Admin Only)
- `GET /api/audit/recipes` - Get all recipe audit logs
- `GET /api/audit/recipes/{recipeId}` - Get audit logs for specific recipe
- `GET /api/audit/recipes/date-range?startDate={datetime}&endDate={datetime}` - Get audit logs by date range

### Health Check
- `GET /actuator/health` - Application health status

## Security

### Authentication Flow

1. User clicks "Login with Google/GitHub"
2. User is redirected to OAuth provider
3. After successful authentication, OAuth provider redirects back to `/login/oauth2/code/{provider}`
4. Application validates OAuth token and creates/updates user
5. JWT token is generated and stored in httpOnly cookie
6. User is redirected to frontend dashboard

### Authorization

- **Public**: Anyone can access public recipe endpoints
- **User Role**: Authenticated users can manage their meal plans
- **Admin Role**: Admins can manage all recipes and view audit logs

### JWT Cookie

- **Name**: `foodbytes_token` (configurable)
- **httpOnly**: true (prevents XSS attacks)
- **secure**: Set to true in production with HTTPS
- **SameSite**: Lax
- **Expiration**: 24 hours (configurable)

## Key Features

### Recipe Visibility (`is_live` field)
- Non-admin users only see recipes where `is_live=true`
- Admin users see all recipes (including non-live)
- Public endpoints only return live recipes

### Soft Deletion
- Recipes are soft-deleted using `is_deleted` flag
- Deleted recipes are hidden from all queries
- Preserves data integrity and audit trail

### Audit Logging
- All recipe changes (CREATE, UPDATE, DELETE) are logged
- Stores old and new values as JSON
- Tracks which user made the change and when

## Development Notes

### Database Schema

The application uses JPA to manage the database schema. Key tables:
- `users` - User accounts from OAuth providers
- `recipes` - Recipe data with JSON fields for ingredients and steps
- `meal_plan_entries` - User meal plans
- `recipe_audit_logs` - Audit trail for recipe changes

### CORS Configuration

CORS is configured to allow credentials (cookies) from specified origins. Update `CORS_ALLOWED_ORIGINS` environment variable for your frontend URLs.

### First Admin User

To create the first admin user:
1. Login through OAuth
2. Manually update the database: `UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';`

## Troubleshooting

### OAuth Redirect Issues
- Ensure OAuth redirect URIs are configured correctly in Google/GitHub console
- Format: `http://localhost:8080/login/oauth2/code/{provider}`

### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Ensure credentials are enabled in frontend requests

### JWT Cookie Not Set
- Check browser console for cookie settings
- Verify `secure` flag matches your protocol (HTTP/HTTPS)

## License

Copyright 2024 FoodBytes. All rights reserved.
