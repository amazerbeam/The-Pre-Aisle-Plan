# System Architect Context
> Reference material for system-architect-agent

## System Type
**Hybrid Client-Server Web Application**
- NOT a mobile app (no React Native, no native apps)
- Web application accessible via browsers on all devices
- Responsive design for mobile browser support

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

### Backend (Primary - Node.js)
| Component | Technology |
|-----------|------------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Auth | Passport.js |
| Tokens | JWT |
| Validation | Joi |

### Backend (Alternative - Java)
| Component | Technology |
|-----------|------------|
| Language | Java 17+ |
| Framework | Spring Boot 3.x |
| Security | Spring Security + OAuth2 |
| ORM | Spring Data JPA |

### Database
| Component | Technology |
|-----------|------------|
| RDBMS | MySQL 8+ |
| Driver | mysql2 (Node) / mysql-connector-j (Java) |

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
   (React Build)          (Express/Spring)

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
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── passport.js
│   │   │   └── env.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── recipeController.js
│   │   │   ├── mealPlanController.js
│   │   │   └── auditController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── validate.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── recipes.js
│   │   │   ├── mealPlan.js
│   │   │   └── audit.js
│   │   ├── services/
│   │   │   ├── auditService.js
│   │   │   └── archiveService.js
│   │   └── app.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── foodbytes-api/             # Spring Boot backend (alternative)
│   ├── src/main/java/com/foodbytes/
│   ├── src/main/resources/
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
8. Return JWT to frontend
9. Frontend stores in localStorage
10. Include in Authorization header

### Authorization Levels
| Level | Access |
|-------|--------|
| Guest | Browse recipes only |
| Authenticated | + Save meal plans, shopping lists |
| Admin (GOD) | + Edit recipes, view audit logs |

### Security Measures
- HTTPS only in production
- JWT with expiration (7 days)
- Rate limiting on auth endpoints
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS prevention (React's built-in escaping)
- CORS whitelist

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
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Monitoring & Logging
- Application logs: Winston / Pino
- Error tracking: Sentry (optional)
- Health check endpoint: GET /api/health
