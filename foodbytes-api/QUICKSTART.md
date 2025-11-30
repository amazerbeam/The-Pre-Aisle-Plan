# FoodBytes API - Quick Start Guide

## Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8.0+ running locally
- Google OAuth2 credentials

## Step 1: Database Setup

1. Start MySQL and create the database:
```sql
CREATE DATABASE foodbytes;
```

2. Import the schema:
```bash
mysql -u root -p foodbytes < ../database/schema.sql
```

3. (Optional) Import seed data:
```bash
mysql -u root -p foodbytes < ../database/seed.sql
```

## Step 2: Configure Environment

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your values:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=foodbytes
DB_USER=foodbytes
DB_PASSWORD=foodbytes123

# Google OAuth (replace with your credentials)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# JWT Secret (generate a secure one)
JWT_SECRET=your-256-bit-secret-here

# Frontend URL
CORS_ALLOWED_ORIGINS=http://localhost:3000
AUTHORIZED_REDIRECT_URIS=http://localhost:3000/auth/callback
```

3. Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

## Step 3: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:8080/login/oauth2/code/google`
   - Production: `https://your-domain.com/login/oauth2/code/google`
7. Copy the Client ID and Client Secret to your `.env` file

## Step 4: Build and Run

1. Build the project:
```bash
mvn clean install
```

2. Run the application:
```bash
mvn spring-boot:run
```

The API will start on `http://localhost:8080`

## Step 5: Test the Setup

1. Check health endpoint:
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "foodbytes-api"
}
```

2. Test OAuth flow:
   - Open browser: `http://localhost:8080/oauth2/authorization/google`
   - Sign in with Google
   - Should redirect to frontend callback URL with JWT cookie set

## Common Issues

### Build Failures
```bash
# Clean Maven cache
mvn clean

# Update dependencies
mvn dependency:resolve
```

### Database Connection Issues
- Verify MySQL is running: `mysql -u foodbytes -p`
- Check database exists: `SHOW DATABASES;`
- Verify credentials in `.env` match MySQL user

### OAuth Issues
- Ensure redirect URI in Google Console matches exactly
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Verify frontend URL matches `AUTHORIZED_REDIRECT_URIS`

## Development Commands

```bash
# Run tests
mvn test

# Build JAR
mvn package

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Check for dependency updates
mvn versions:display-dependency-updates
```

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /oauth2/authorization/google` - Start Google OAuth flow

### Authenticated Endpoints (requires JWT cookie)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/preferences` - Update preferences

### Admin Endpoints (requires ADMIN role)
- `/api/admin/**` - Admin operations

## Next Steps

1. Set up the frontend application
2. Configure production environment
3. Set up HTTPS for production
4. Configure proper CORS for production domain
5. Set up logging and monitoring

## Support

For issues or questions:
- Check the main README.md
- Review Spring Boot logs in console
- Check database/schema.sql for table structure
