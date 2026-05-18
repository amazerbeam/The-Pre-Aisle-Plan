# System Architect Context
> Reference material for system-architect-agent

## System Type
**Hybrid Client-Server Web Application**

### CRITICAL: Web Application, NOT Mobile App
This is the authoritative definition for all agents:
- **DO NOT** use React Native
- **DO NOT** use Expo
- **DO NOT** use native mobile components
- **DO NOT** build iOS or Android apps
- **DO** use React (web) with responsive CSS
- **DO** use mobile-first design principles
- **DO** ensure touch-friendly interactions (44x44px minimum tap targets)

The application runs in web browsers on all devices (desktop, tablet, mobile) via responsive design.

## Technology Stack

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | React 18+ (web) |
| Build | Vite |
| Styling | CSS Modules |
| Routing | React Router v6 |
| HTTP | Axios |
| State | Context + useReducer |

### Backend (Java Spring Boot)
| Component | Technology |
|-----------|------------|
| Language | Java 17+ |
| Framework | Spring Boot 3.x |
| Security | Spring Security + OAuth2 |
| ORM | Spring Data JPA |
| Tokens | JWT |
| Build | Maven |

### Database
| Component | Technology |
|-----------|------------|
| RDBMS | MySQL 8+ |
| Driver | mysql-connector-j |

## System Architecture Diagram

```
                     CLIENTS
   Desktop     Tablet      Mobile      Mobile
   Browser     Browser     Browser     Browser
   (Chrome)    (Safari)    (iOS)       (Android)
                    |
                HTTPS (443)
                    |
            LOAD BALANCER / CDN
                    |
         +----------+----------+
         |                     |
   STATIC ASSETS          API SERVER
   (React Build)          (Spring Boot)

  - index.html           /api/auth/*
  - bundle.js            /api/recipes/*
  - styles.css           /api/meal-plan/*
  - images/              /api/shopping/*
                         /api/audit/*
                               |
                    +----------+----------+
                    |                     |
               MySQL DB            OAuth Providers

              - users              - Google
              - recipes            - GitHub
              - meal_plans
              - audit_logs
```

## Directory Structure

```
foodbytes/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── foodbytes-api/             # Spring Boot backend
│   ├── src/main/java/com/foodbytes/
│   │   ├── FoodBytesApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── OAuth2Config.java
│   │   │   └── JwtConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── RecipeController.java
│   │   │   ├── MealPlanController.java
│   │   │   └── AuditController.java
│   │   ├── service/
│   │   │   ├── UserService.java
│   │   │   ├── RecipeService.java
│   │   │   ├── MealPlanService.java
│   │   │   └── AuditService.java
│   │   ├── repository/
│   │   ├── model/
│   │   ├── dto/
│   │   ├── security/
│   │   └── exception/
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── application-dev.yml
│   ├── src/test/
│   ├── pom.xml
│   └── Dockerfile
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
│
├── docs/
│   ├── api.md
│   ├── designs/
│   └── peer-reviews/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
```
GET  /api/auth/google           - Initiate Google OAuth
GET  /api/auth/google/callback  - Google callback
GET  /api/auth/github           - Initiate GitHub OAuth
GET  /api/auth/github/callback  - GitHub callback
GET  /api/auth/me               - Get current user [Auth]
POST /api/auth/logout           - Logout
```

### Recipes
```
GET    /api/recipes             - List all recipes
GET    /api/recipes/:id         - Get recipe by ID
POST   /api/recipes             - Create recipe [Admin]
PUT    /api/recipes/:id         - Update recipe [Admin]
DELETE /api/recipes/:id         - Soft delete recipe [Admin]
```

### Meal Plan
```
GET    /api/meal-plan?from=DATE&to=DATE  - Get entries in date range [Auth]
POST   /api/meal-plan                     - Create entry [Auth]
PUT    /api/meal-plan/:id                 - Update entry [Auth]
DELETE /api/meal-plan/:id                 - Delete entry [Auth]
```

### Audit (Admin)
```
GET /api/audit/recipes              - List all audit logs [Admin]
GET /api/audit/recipes/:recipeId    - Audit log for recipe [Admin]
```

## Security Architecture

### Authentication Flow
1. User clicks OAuth button
2. Redirect to provider (Google/GitHub)
3. User authenticates with provider
4. Callback with authorization code
5. Exchange code for tokens
6. Create/update user in database
7. Generate JWT with user info
8. Set JWT in httpOnly cookie (secure, SameSite=Strict)
9. Redirect frontend to app
10. Cookie automatically sent with subsequent requests

### Authorization Levels
| Level | Access |
|-------|--------|
| Guest | Browse recipes only |
| Authenticated | + Save meal plans, shopping lists |
| Admin (GOD) | + Edit recipes, view audit logs |

### Security Measures
- HTTPS only in production
- JWT stored in httpOnly cookies (NOT localStorage)
- Cookie flags: secure=true, SameSite=Strict
- JWT with expiration (7 days)
- Rate limiting on auth endpoints
- Input validation on all endpoints
- SQL injection prevention (parameterized queries/JPA)
- XSS prevention (React's built-in escaping, httpOnly cookies)
- CORS whitelist with credentials support

## Data Flow

### Recipe Assignment Flow
```
User selects date on calendar
    |
User clicks "Add" on recipe
    |
Frontend: POST /api/meal-plan
    { date: "2024-01-15", mealType: "dinner", recipeId: 5, servings: 2 }
    |
Backend: Validate JWT -> Validate request -> Insert into meal_plan_entries
    |
Backend: Return created entry with ID
    |
Frontend: Update calendar state
    |
UI reflects new assignment
```

### Audit Flow (Admin Recipe Edit)
```
Admin edits recipe
    |
Frontend: PUT /api/recipes/:id
    { name: "New Name", calories: 500, ... }
    |
Backend: Verify admin role
    |
Backend: Fetch current recipe (old_values)
    |
Backend: Update recipe
    |
Backend: Insert audit log
    { recipeId, userId, action: "UPDATE", old_values, new_values, timestamp }
    |
Return updated recipe
```

## Environment Variables
```
# Database
DB_HOST=localhost
DB_USER=foodbytes_user
DB_PASSWORD=your_password
DB_NAME=foodbytes

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRATION=7d

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Server
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev
FRONTEND_URL=http://localhost:3000
```

## Monitoring & Logging
- Application logs: SLF4J + Logback
- Error tracking: Sentry (optional)
- Health check endpoint: GET /api/health (Spring Actuator)
