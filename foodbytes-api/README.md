# FoodBytes API

Backend API for FoodBytes meal planning application built with Spring Boot 3.x.

## Features

- Google OAuth2 authentication
- JWT-based session management with httpOnly cookies
- PostgreSQL database integration
- RESTful API endpoints
- Spring Security configuration
- CORS support for frontend integration

## Technology Stack

- Java 17
- Spring Boot 3.2.0
- Spring Security with OAuth2
- Spring Data JPA
- MySQL 8.0+
- JWT (jsonwebtoken 0.12.3)
- Lombok
- Maven

## Prerequisites

- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6+
- Google OAuth2 credentials

## Setup Instructions

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE foodbytes;
```

Run the database schema from `database/schema.sql` in the project root.

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update the following variables:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - MySQL connection details
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `JWT_SECRET` - Generate a secure secret (min 256 bits)
- `CORS_ALLOWED_ORIGINS` - Frontend URL (e.g., http://localhost:3000)
- `AUTHORIZED_REDIRECT_URIS` - OAuth callback URL

### 3. Generate JWT Secret

```bash
openssl rand -base64 32
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8080/login/oauth2/code/google` (development)
6. Copy Client ID and Client Secret to `.env`

### 5. Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The API will start on `http://localhost:8080`

## API Endpoints

### Authentication

- `GET /api/health` - Health check (public)
- `GET /api/auth/me` - Get current user (authenticated)
- `POST /api/auth/logout` - Logout (authenticated)
- `PUT /api/auth/preferences` - Update user preferences (authenticated)

### OAuth Flow

1. Frontend redirects to: `http://localhost:8080/oauth2/authorization/google`
2. User authenticates with Google
3. Backend sets JWT in httpOnly cookie
4. Backend redirects to: `http://localhost:3000/auth/callback`

### Public Endpoints

- `GET /api/recipes/**` - Recipe endpoints
- `GET /api/ingredients` - Ingredients list
- `GET /api/aisles` - Aisles list
- `GET /api/units` - Units list
- `GET /api/meals` - Meals list

### Admin Endpoints

- `/api/admin/**` - Requires ADMIN role

## Security Features

- JWT tokens stored in httpOnly cookies (not localStorage)
- 7-day token expiration
- CORS protection
- CSRF disabled (using JWT)
- Stateless session management
- Google OAuth2 only (no password authentication)

## Development

### Project Structure

```
src/main/java/com/foodbytes/
├── config/              # Spring configuration classes
│   └── SecurityConfig.java
├── controller/          # REST controllers
│   ├── AuthController.java
│   └── HealthController.java
├── dto/                 # Data transfer objects
│   ├── UserResponse.java
│   └── UpdatePreferencesRequest.java
├── exception/           # Exception handling
│   ├── GlobalExceptionHandler.java
│   └── ErrorResponse.java
├── model/              # JPA entities
│   └── User.java
├── repository/         # Spring Data repositories
│   └── UserRepository.java
├── security/           # Security components
│   ├── CustomOAuth2UserService.java
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   ├── OAuth2AuthenticationSuccessHandler.java
│   └── UserPrincipal.java
├── service/            # Business logic
│   └── UserService.java
└── FoodbytesApplication.java
```

### Testing

```bash
mvn test
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | MySQL host | Yes |
| `DB_PORT` | MySQL port | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `JWT_SECRET` | JWT signing secret (256+ bits) | Yes |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | Yes |
| `AUTHORIZED_REDIRECT_URIS` | OAuth redirect URIs | Yes |
| `PORT` | Server port (default: 8080) | No |

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists and schema is loaded

2. **OAuth authentication failed**
   - Verify Google OAuth credentials
   - Check redirect URIs in Google Console
   - Ensure frontend URL matches CORS settings

3. **JWT validation failed**
   - Check JWT_SECRET is properly set
   - Verify cookie settings (httpOnly, Secure, SameSite)

## License

Proprietary - FoodBytes Project
