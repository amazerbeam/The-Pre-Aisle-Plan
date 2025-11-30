# FoodBytes Application

A meal planning and recipe management web application built with React, Spring Boot, and MySQL.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   MySQL     │
│   (React)   │     │(Spring Boot)│     │  Database   │
│   :3000     │     │   :8080     │     │   :3306     │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Quick Start with Docker

### Prerequisites

- Docker Desktop installed and running
- OAuth credentials from Google and/or GitHub

### Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables:**
   Edit `.env` and fill in your values:
   - Database credentials (can use defaults for development)
   - Google OAuth credentials (from [Google Cloud Console](https://console.developers.google.com/))
   - GitHub OAuth credentials (from [GitHub Developer Settings](https://github.com/settings/developers))
   - JWT secret (generate with `openssl rand -base64 32`)

3. **Start the application:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:8080/api
   - API Docs: http://localhost:8080/swagger-ui.html

### OAuth Configuration

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`
6. Copy Client ID and Client Secret to `.env`

#### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:3000`
4. Set Authorization callback URL: `http://localhost:8080/login/oauth2/code/github`
5. Copy Client ID and Client Secret to `.env`

## Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | React web application (served via nginx) |
| backend | 8080 | Spring Boot REST API |
| mysql | 3306 | MySQL 8.0 database |

## Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f            # All services
docker-compose logs -f backend    # Backend only
docker-compose logs -f frontend   # Frontend only
docker-compose logs -f mysql      # Database only
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### Reset database (destructive)
```bash
docker-compose down -v
docker-compose up --build
```

## Development

### Local Development (without Docker)

#### Backend
```bash
cd foodbytes-api
./mvnw spring-boot:run
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

### Database

The database is automatically initialized with:
- `schema.sql` - Table definitions
- `seed.sql` - Initial data (aisles, units, sample ingredients, recipes)

Default credentials:
- User: `foodbytes_user`
- Password: `foodbytes_pass` (change in production!)
- Database: `foodbytes`

## Project Structure

```
foodbytes-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React Context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # CSS files
│   ├── Dockerfile
│   └── nginx.conf
├── foodbytes-api/          # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/foodbytes/
│   │       ├── config/     # Security, CORS config
│   │       ├── controller/ # REST controllers
│   │       ├── dto/        # Data transfer objects
│   │       ├── model/      # JPA entities
│   │       ├── repository/ # Spring Data repositories
│   │       ├── security/   # JWT, OAuth handlers
│   │       └── service/    # Business logic
│   └── Dockerfile
├── database/
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Initial data
├── docker-compose.yml
└── .env.example
```

## Features

- **Authentication**: Google and GitHub OAuth2 login
- **Recipe Management**: Browse, create, edit recipes (admin)
- **Meal Planning**: Calendar-based meal scheduling
- **Shopping List**: Aggregated ingredients with aisle organization
- **Recipe Visibility**: Admin can toggle recipes Live/Hidden
- **Audit Trail**: All recipe changes are logged

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Recipes
- `GET /api/recipes` - List all recipes (respects visibility)
- `GET /api/recipes/{id}` - Get recipe details
- `POST /api/recipes` - Create recipe (admin)
- `PUT /api/recipes/{id}` - Update recipe (admin)
- `DELETE /api/recipes/{id}` - Soft delete recipe (admin)

### Meal Plan
- `GET /api/meal-plan?from=DATE&to=DATE` - Get entries in date range
- `POST /api/meal-plan` - Create entry
- `PUT /api/meal-plan/{id}` - Update entry
- `DELETE /api/meal-plan/{id}` - Delete entry

### Audit (Admin)
- `GET /api/audit/recipes` - List all audit logs
- `GET /api/audit/recipes/{recipeId}` - Audit log for recipe

## Troubleshooting

### Container won't start
1. Check Docker Desktop is running
2. Check port 3000, 8080, 3306 are available
3. Run `docker-compose logs` to see error messages

### Database connection error
1. Wait 30 seconds for MySQL to initialize
2. Check MySQL container health: `docker-compose ps`
3. Verify credentials in `.env` match

### OAuth not working
1. Verify callback URLs match exactly
2. Check client ID/secret are correct
3. Ensure cookies are enabled in browser
