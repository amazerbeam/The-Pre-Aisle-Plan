# FoodBytes System Architecture Design

> Phase 1 Design Document
> Submitted by: @system-architect
> Date: 2025-11-30

## 1. System Overview

FoodBytes ("The Pre-Aisle Plan") is a hybrid client-server web application for meal planning and recipe management. The application runs in web browsers on all devices via responsive design.

### Architecture Type
- **Frontend**: React 18+ Single Page Application (web)
- **Backend**: Java 17+ / Spring Boot 3.x REST API
- **Database**: MySQL 8+
- **Authentication**: Google OAuth 2.0 ONLY (no GitHub, no passwords)

## 2. System Architecture Diagram

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
   Port 3000/80           Port 8080

  - index.html           /api/auth/*
  - bundle.js            /api/recipes/*
  - styles.css           /api/meal-plan/*
  - images/              /api/ingredients/*
                         /api/audit/*
                               |
                    +----------+----------+
                    |                     |
               MySQL DB            OAuth Provider
               Port 3306
                                    - Google ONLY
              - users
              - recipes
              - meal_plan_entries
              - recipe_audit_log
              - aisles
              - units
              - ingredients
              - recipe_ingredients
              - recipe_steps
              - recipe_meals
              - meals
```

## 3. Technology Stack

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | React 18+ (web, NOT React Native) |
| Build Tool | Vite |
| Styling | CSS Modules |
| State Management | React Context + useReducer |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Date Handling | date-fns |

### Backend (Java Spring Boot)
| Component | Technology |
|-----------|------------|
| Language | Java 17+ |
| Framework | Spring Boot 3.x |
| Security | Spring Security + OAuth2 Client |
| ORM | Spring Data JPA |
| Tokens | JWT (stored in httpOnly cookies) |
| Build | Maven |
| API Docs | SpringDoc OpenAPI |

### Database
| Component | Technology |
|-----------|------------|
| RDBMS | MySQL 8+ |
| Engine | InnoDB |
| Charset | utf8mb4 |
| Driver | mysql-connector-j |

## 4. Directory Structure

```
foodbytes/
├── client/                    # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── recipes/
│   │   │   ├── calendar/
│   │   │   ├── shopping/
│   │   │   ├── auth/
│   │   │   └── layout/
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── PlannerContext.jsx
│   │   │   └── DateRangeContext.jsx
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   └── Dockerfile
│
├── foodbytes-api/             # Spring Boot backend
│   ├── src/main/java/com/foodbytes/
│   │   ├── FoodBytesApplication.java
│   │   ├── config/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   ├── dto/
│   │   ├── security/
│   │   └── exception/
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── application-docker.yml
│   ├── src/test/
│   ├── pom.xml
│   └── Dockerfile
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│   ├── designs/
│   └── peer-reviews/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 5. API Endpoints

### Authentication
```
GET  /api/auth/google           - Initiate Google OAuth
GET  /api/auth/google/callback  - Google OAuth callback (internal)
GET  /api/auth/me               - Get current user [Auth Required]
POST /api/auth/logout           - Logout (clears httpOnly cookie)
PUT  /api/auth/preferences      - Update user preferences [Auth Required]
```

### Recipes
```
GET    /api/recipes             - List all live recipes (admin sees all)
GET    /api/recipes/:id         - Get recipe by ID with ingredients & steps
POST   /api/recipes             - Create recipe [Admin Only]
PUT    /api/recipes/:id         - Update recipe [Admin Only]
DELETE /api/recipes/:id         - Soft delete recipe [Admin Only]
PATCH  /api/recipes/:id/visibility - Toggle is_live [Admin Only]
```

### Meal Plan
```
GET    /api/meal-plan?from=DATE&to=DATE  - Get entries in date range [Auth]
POST   /api/meal-plan                     - Create entry [Auth]
PUT    /api/meal-plan/:id                 - Update entry [Auth]
DELETE /api/meal-plan/:id                 - Delete entry [Auth]
```

### Reference Data
```
GET /api/ingredients            - List all ingredients with aisles
GET /api/aisles                 - List all aisles with order
GET /api/units                  - List all measurement units
GET /api/meals                  - List meal types (breakfast, lunch, dinner, snacks)
```

### Audit (Admin Only)
```
GET /api/audit/recipes              - List all recipe audit logs [Admin]
GET /api/audit/recipes/:recipeId    - Audit log for specific recipe [Admin]
```

### Health Check
```
GET /api/health                 - Health check endpoint
```

## 6. Security Architecture

### Authentication Flow
1. User clicks "Sign in with Google" button (official Google branding)
2. Frontend redirects to `/api/auth/google`
3. Backend redirects to Google OAuth
4. User authenticates with Google
5. Google redirects to callback with authorization code
6. Backend exchanges code for tokens
7. Backend creates/updates user in MySQL database
8. Backend generates JWT with user info
9. Backend sets JWT in httpOnly cookie (secure, SameSite=Strict)
10. User redirected to frontend app
11. Cookie automatically sent with subsequent API requests

### Authorization Levels
| Level | Access |
|-------|--------|
| Guest | Browse live recipes only (read-only) |
| Authenticated | + Save meal plans, view shopping list |
| Admin (GOD) | + Edit recipes, toggle visibility, view audit logs |

### Security Measures
- HTTPS only in production
- JWT stored in httpOnly cookies (NOT localStorage)
- Cookie flags: secure=true (prod), SameSite=Strict
- JWT expiration: 7 days
- No password storage (OAuth-only)
- Input validation on all endpoints
- SQL injection prevention (JPA parameterized queries)
- XSS prevention (React escaping, httpOnly cookies)
- CORS whitelist with credentials support

## 7. Data Flow

### Recipe Assignment to Meal Plan
```
User selects date on calendar
    |
User clicks "Add" on recipe card
    |
Frontend: POST /api/meal-plan
    { date: "2024-01-15", mealType: "dinner", recipeId: 5, servings: 2 }
    |
Backend: Validate JWT cookie -> Validate request -> Insert into meal_plan_entries
    |
Backend: Return created entry with ID
    |
Frontend: Update calendar state, refresh shopping list
```

### Shopping List Generation
```
User opens Shopping List view
    |
Frontend uses shared global date range (from DateRangeContext)
    |
Frontend: GET /api/meal-plan?from=DATE&to=DATE
    |
Backend: Return all meal plan entries for user in range
    |
Frontend: Aggregate ingredients from all recipes
    - Group by ingredient + unit
    - Sum quantities
    - Sort by aisle order, then ingredient name
```

### Admin Recipe Edit with Audit
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
Backend: Insert into recipe_audit_log
    { recipeId, userId, action: "UPDATE", old_values, new_values, timestamp }
    |
Return updated recipe
```

## 8. Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=foodbytes
DB_USER=foodbytes_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_min_32_characters_long
JWT_EXPIRATION=604800000

# OAuth (Google ONLY)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server
SERVER_PORT=8080
FRONTEND_URL=http://localhost:3000

# Spring Profile
SPRING_PROFILES_ACTIVE=docker
```

## 9. Docker Configuration

### Services
1. **mysql** - MySQL 8.0 database
   - Port: 3306 (internal)
   - Volume: mysql_data for persistence
   - Health check: mysqladmin ping

2. **backend** - Spring Boot API
   - Port: 8080 (internal)
   - Depends on: mysql (healthy)
   - Health check: /api/health

3. **frontend** - React app served by nginx
   - Port: 3000 (external)
   - Depends on: backend
   - Proxies /api/* to backend

### Network
- All containers on `foodbytes-network` (bridge)
- Container names used for inter-service communication

## 10. Critical Constraints (Non-Negotiable)

Per context file rules that CANNOT be overridden:

1. **Google OAuth ONLY** - No GitHub, no passwords
2. **Official Google branding** - Use official Google Sign-In button
3. **MySQL** - Not PostgreSQL, not MongoDB
4. **Java backend** - Spring Boot is the sole backend
5. **Web application** - NOT React Native, NOT mobile app
6. **Mobile-first CSS** - Responsive design with 44px touch targets
7. **No JSON columns** - Use normalized tables with FKs
8. **Brand color #a689c6** - Consistent throughout UI
9. **httpOnly cookies** - JWT stored in cookies, NOT localStorage
10. **6-month retention** - Rolling data retention for meal plans
11. **Immutable audit** - Recipe changes logged forever, append-only

---

## Peer Review Status

**Submitted:** 2025-11-30
**Status:** APPROVED (complies with all context file constraints)

All agents confirmed compliance with their domain-specific rules:
- SQL Agent: No JSON columns, normalized tables
- Auth Agent: Google OAuth only, httpOnly cookies
- UX Agent: Brand color, accessible contrast, official Google button
- React Agent: Web app, not React Native
- Java Agent: Spring Boot sole backend
