# System Architect Context
> Reference material for system-architect-agent

## Technology Stack

### Frontend
| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React 18+ (web) | UI components and state |
| Build | Vite | Fast development and bundling |
| Styling | CSS Modules / Tailwind | Responsive, mobile-first CSS |
| Routing | React Router v6 | Client-side navigation |
| HTTP | Axios | API communication |
| State | Context + useReducer | Application state management |

### Backend
| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js 18+ | Server-side JavaScript |
| Framework | Express.js | REST API framework |
| Auth | Passport.js | OAuth integration |
| Tokens | JWT | Stateless authentication |
| Validation | Joi / Zod | Request validation |

### Database
| Component | Technology | Purpose |
|-----------|------------|---------|
| RDBMS | MySQL 8+ | Primary data storage |
| ORM | Prisma / Sequelize | Database abstraction |
| Migrations | Built-in ORM | Schema versioning |

### Infrastructure
| Component | Technology | Purpose |
|-----------|------------|---------|
| Hosting | Vercel / Railway / AWS | Application hosting |
| Database | PlanetScale / AWS RDS | Managed MySQL |
| CDN | Cloudflare / Vercel Edge | Static asset delivery |

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
             (Cloudflare/Vercel)
                    |
         +----------+----------+
         |                     |
   STATIC ASSETS          API SERVER
   (React Build)          (Express.js)

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
│   └── vite.config.js
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
│   │   │   ├── User.js
│   │   │   ├── Recipe.js
│   │   │   ├── MealPlanEntry.js
│   │   │   └── RecipeAuditLog.js
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
│   └── .env.example
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
│
├── docs/
│   └── api.md
│
├── .gitignore
├── docker-compose.yml         # Local development
└── README.md
```

## API Design

### RESTful Endpoints

#### Authentication
```
GET  /api/auth/google           - Initiate Google OAuth
GET  /api/auth/google/callback  - Google callback
GET  /api/auth/github           - Initiate GitHub OAuth
GET  /api/auth/github/callback  - GitHub callback
GET  /api/auth/me               - Get current user [Auth]
POST /api/auth/logout           - Logout
```

#### Recipes
```
GET    /api/recipes             - List all recipes
GET    /api/recipes/:id         - Get recipe by ID
POST   /api/recipes             - Create recipe [Admin]
PUT    /api/recipes/:id         - Update recipe [Admin]
DELETE /api/recipes/:id         - Soft delete recipe [Admin]
```

#### Meal Plan
```
GET    /api/meal-plan?from=DATE&to=DATE  - Get entries in date range [Auth]
POST   /api/meal-plan                     - Create entry [Auth]
PUT    /api/meal-plan/:id                 - Update entry [Auth]
DELETE /api/meal-plan/:id                 - Delete entry [Auth]
```

#### Audit (Admin)
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

## Scalability Considerations

### Current Scale (MVP)
- Single server deployment
- Single MySQL instance
- Suitable for ~1000 users

### Future Scale
- Horizontal scaling with load balancer
- Read replicas for database
- Redis for session caching
- CDN for static assets
- Background jobs for archival

## Monitoring & Logging
- Application logs: Winston / Pino
- Error tracking: Sentry
- Performance: New Relic / DataDog
- Uptime: UptimeRobot / Pingdom
