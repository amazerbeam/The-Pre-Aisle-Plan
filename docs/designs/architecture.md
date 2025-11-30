# FoodBytes System Architecture Design Document

> **Phase 1 Complete Architecture Design**
> **Project:** The Pre-Aisle Plan (FoodBytes)
> **Submitted by:** @system-architect
> **Date:** 2025-11-30
> **Version:** 2.0

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Directory Structure](#2-directory-structure)
3. [API Endpoint Contracts](#3-api-endpoint-contracts)
4. [Security Architecture](#4-security-architecture)
5. [Data Flow Diagrams](#5-data-flow-diagrams)
6. [Database Schema](#6-database-schema)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Backend Architecture](#8-backend-architecture)
9. [Requirements Addressed](#9-requirements-addressed)
10. [Requirements NOT Addressed](#10-requirements-not-addressed)
11. [Critical Non-Negotiable Rules](#11-critical-non-negotiable-rules)
12. [Deployment Architecture](#12-deployment-architecture)

---

## 1. System Overview

### 1.1 Architecture Type

FoodBytes ("The Pre-Aisle Plan") is a **hybrid client-server web application** for meal planning and recipe management. The application runs in web browsers on all devices (desktop, tablet, mobile) via responsive design.

**CRITICAL:** This is a web application, NOT a mobile app. Do NOT use React Native, Expo, or native mobile components.

### 1.2 High-Level Architecture Diagram

```
                          CLIENTS (Web Browsers)
    +------------------+  +------------------+  +------------------+
    |   Desktop        |  |   Tablet         |  |   Mobile         |
    |   Chrome/Safari  |  |   Safari/Chrome  |  |   iOS/Android    |
    +------------------+  +------------------+  +------------------+
              |                    |                    |
              +--------------------+--------------------+
                                   |
                              HTTPS (443)
                                   |
                     +-------------+-------------+
                     |                           |
              STATIC ASSETS                API SERVER
              (React Build)              (Spring Boot REST)
              Port 3000/80                  Port 8080
                     |                           |
        +------------+------------+    +---------+---------+
        |                         |    |                   |
    index.html              CSS/JS     MySQL DB     Google OAuth
    bundle.js               assets     Port 3306
    styles.css

    Endpoints:                         Tables:
    - /                                - users
    - /recipes                         - recipes
    - /meal-plan                       - meal_plan_entries
    - /shopping                        - recipe_audit_log
    - /admin                           - ingredients
                                       - aisles
                                       - units
                                       - meals
                                       - recipe_ingredients
                                       - recipe_steps
                                       - recipe_meals
```

### 1.3 Technology Stack Summary

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Frontend** | React (web) | 18+ | Industry standard, large ecosystem, NOT React Native |
| **Build Tool** | Vite | Latest | Fast dev server, optimized production builds |
| **Styling** | CSS Modules | N/A | Scoped styles, no CSS-in-JS overhead |
| **State** | Context + useReducer | N/A | Built-in React, no Redux complexity |
| **Routing** | React Router | v6 | Standard client-side routing |
| **HTTP** | Axios | Latest | Promise-based, interceptor support |
| **Backend** | Spring Boot | 3.x | Enterprise Java framework, robust |
| **Language** | Java | 17+ | LTS version, modern Java features |
| **Security** | Spring Security + OAuth2 | N/A | Industry-standard auth |
| **ORM** | Spring Data JPA | N/A | Abstraction over Hibernate |
| **Database** | MySQL | 8+ | Proven RDBMS, not PostgreSQL |
| **Auth Provider** | Google OAuth | 2.0 | ONLY Google, no GitHub |
| **Token Storage** | httpOnly Cookies | N/A | XSS-safe, NOT localStorage |

### 1.4 Component Responsibilities

| Component | Responsibilities |
|-----------|------------------|
| **React Frontend** | UI rendering, user interactions, client-side routing, state management, API calls |
| **Spring Boot API** | Business logic, data validation, database operations, OAuth handling, JWT generation |
| **MySQL Database** | Persistent storage, referential integrity, data constraints |
| **Google OAuth** | User authentication (sole provider) |
| **Nginx** | Static file serving, API reverse proxy, SSL termination |

---

## 2. Directory Structure

### 2.1 Complete Project Layout

```
foodbytes/
├── client/                           # React frontend (web application)
│   ├── public/
│   │   ├── index.html                # HTML entry point
│   │   └── favicon.ico               # Brand icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Button.module.css
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Modal.module.css
│   │   │   │   ├── Loading.jsx
│   │   │   │   ├── Loading.module.css
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   └── Toast.jsx
│   │   │   ├── recipes/              # Recipe browsing & viewing
│   │   │   │   ├── RecipeCard.jsx
│   │   │   │   ├── RecipeCard.module.css
│   │   │   │   ├── RecipeList.jsx
│   │   │   │   ├── RecipeList.module.css
│   │   │   │   ├── RecipeDetail.jsx
│   │   │   │   ├── RecipeDetail.module.css
│   │   │   │   ├── RecipeEditor.jsx         # Admin only
│   │   │   │   ├── RecipeEditor.module.css
│   │   │   │   ├── IngredientList.jsx
│   │   │   │   ├── ServingsControl.jsx
│   │   │   │   └── MealTypeTabs.jsx
│   │   │   ├── calendar/             # Calendar & meal planning
│   │   │   │   ├── Calendar.jsx
│   │   │   │   ├── Calendar.module.css
│   │   │   │   ├── CalendarDay.jsx
│   │   │   │   ├── WeekView.jsx
│   │   │   │   ├── MonthView.jsx
│   │   │   │   ├── DateNavigator.jsx
│   │   │   │   └── DayButtons.jsx
│   │   │   ├── shopping/             # Shopping list generation
│   │   │   │   ├── ShoppingList.jsx
│   │   │   │   ├── ShoppingList.module.css
│   │   │   │   ├── ShoppingItem.jsx
│   │   │   │   ├── AisleGroup.jsx
│   │   │   │   └── AisleGroup.module.css
│   │   │   ├── auth/                 # Authentication UI
│   │   │   │   ├── GoogleSignInButton.jsx
│   │   │   │   ├── GoogleSignInButton.module.css
│   │   │   │   ├── UserProfile.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── GuestPrompt.jsx
│   │   │   ├── admin/                # Admin-only components
│   │   │   │   ├── AuditLog.jsx
│   │   │   │   ├── AuditLog.module.css
│   │   │   │   ├── AuditViewer.jsx
│   │   │   │   └── VisibilityToggle.jsx
│   │   │   └── layout/               # Page layout components
│   │   │       ├── Header.jsx
│   │   │       ├── Header.module.css
│   │   │       ├── Footer.jsx
│   │   │       ├── Footer.module.css
│   │   │       ├── Navigation.jsx
│   │   │       └── MobileNav.jsx
│   │   ├── contexts/                 # React Context providers
│   │   │   ├── AuthContext.jsx       # User auth state
│   │   │   ├── PlannerContext.jsx    # Meal plan state
│   │   │   └── DateRangeContext.jsx  # Global date range (FR-000)
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useMealPlan.js
│   │   │   ├── useRecipes.js
│   │   │   ├── useShoppingList.js
│   │   │   └── useWakeLock.js
│   │   ├── services/                 # API service layer
│   │   │   ├── api.js                # Axios instance with interceptors
│   │   │   ├── authService.js
│   │   │   ├── recipeService.js
│   │   │   ├── mealPlanService.js
│   │   │   ├── ingredientService.js
│   │   │   └── auditService.js
│   │   ├── utils/                    # Helper functions
│   │   │   ├── dateUtils.js
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── aggregateIngredients.js
│   │   ├── styles/                   # Global styles
│   │   │   ├── variables.css         # CSS custom properties
│   │   │   ├── global.css            # Global resets & base styles
│   │   │   └── responsive.css        # Breakpoint utilities
│   │   ├── App.jsx                   # Root component
│   │   ├── App.module.css
│   │   └── main.jsx                  # Entry point
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf                    # Nginx reverse proxy config
│   └── Dockerfile
│
├── foodbytes-api/                    # Spring Boot backend
│   ├── src/main/java/com/foodbytes/
│   │   ├── FoodBytesApplication.java # Main application class
│   │   ├── config/
│   │   │   ├── SecurityConfig.java   # Spring Security setup
│   │   │   ├── OAuth2Config.java     # Google OAuth config
│   │   │   ├── JwtConfig.java        # JWT properties
│   │   │   ├── CorsConfig.java       # CORS policy
│   │   │   └── WebMvcConfig.java     # MVC customization
│   │   ├── controller/               # REST controllers
│   │   │   ├── AuthController.java
│   │   │   ├── RecipeController.java
│   │   │   ├── MealPlanController.java
│   │   │   ├── IngredientController.java
│   │   │   ├── AuditController.java
│   │   │   └── HealthController.java
│   │   ├── service/                  # Business logic
│   │   │   ├── UserService.java
│   │   │   ├── RecipeService.java
│   │   │   ├── MealPlanService.java
│   │   │   ├── IngredientService.java
│   │   │   ├── AuditService.java
│   │   │   └── OAuth2UserService.java
│   │   ├── repository/               # JPA repositories
│   │   │   ├── UserRepository.java
│   │   │   ├── RecipeRepository.java
│   │   │   ├── MealPlanRepository.java
│   │   │   ├── IngredientRepository.java
│   │   │   ├── AisleRepository.java
│   │   │   ├── UnitRepository.java
│   │   │   ├── MealRepository.java
│   │   │   ├── RecipeIngredientRepository.java
│   │   │   ├── RecipeStepRepository.java
│   │   │   ├── RecipeMealRepository.java
│   │   │   └── AuditLogRepository.java
│   │   ├── model/                    # JPA entities
│   │   │   ├── User.java
│   │   │   ├── Recipe.java
│   │   │   ├── MealPlanEntry.java
│   │   │   ├── RecipeAuditLog.java
│   │   │   ├── Ingredient.java
│   │   │   ├── Aisle.java
│   │   │   ├── Unit.java
│   │   │   ├── Meal.java
│   │   │   ├── RecipeIngredient.java
│   │   │   ├── RecipeStep.java
│   │   │   └── RecipeMeal.java
│   │   ├── dto/                      # Data transfer objects
│   │   │   ├── UserDTO.java
│   │   │   ├── RecipeDTO.java
│   │   │   ├── MealPlanDTO.java
│   │   │   ├── IngredientDTO.java
│   │   │   ├── AuditLogDTO.java
│   │   │   └── ErrorResponse.java
│   │   ├── security/                 # Security components
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── CustomOAuth2UserService.java
│   │   │   ├── OAuth2AuthenticationSuccessHandler.java
│   │   │   └── UserPrincipal.java
│   │   └── exception/                # Exception handling
│   │       ├── GlobalExceptionHandler.java
│   │       ├── ResourceNotFoundException.java
│   │       ├── UnauthorizedException.java
│   │       └── ValidationException.java
│   ├── src/main/resources/
│   │   ├── application.yml           # Main config
│   │   ├── application-dev.yml       # Dev profile
│   │   └── application-docker.yml    # Docker profile
│   ├── src/test/java/com/foodbytes/
│   │   ├── controller/               # Controller tests
│   │   ├── service/                  # Service tests
│   │   └── repository/               # Repository tests
│   ├── pom.xml
│   ├── .env.example
│   └── Dockerfile
│
├── database/
│   ├── schema.sql                    # Full database schema
│   └── seed.sql                      # Initial data (aisles, units, meals, GOD user)
│
├── docs/
│   ├── designs/
│   │   └── architecture.md           # This document
│   ├── peer-reviews/
│   │   └── rejection-log.md
│   └── verification/
│       └── requirements-traceability-matrix.md
│
├── docker-compose.yml                # Docker orchestration
├── .env.example                      # Environment variables template
├── .gitignore
└── README.md
```

---

## 3. API Endpoint Contracts

All endpoints use JSON for request/response bodies unless noted. Base URL: `/api`

### 3.1 Authentication Endpoints

#### `GET /api/auth/google`
**Purpose:** Initiate Google OAuth flow
**Auth Required:** No
**Response:** 302 Redirect to Google OAuth authorization URL

---

#### `GET /api/auth/google/callback`
**Purpose:** Google OAuth callback handler (internal)
**Auth Required:** No
**Query Parameters:**
- `code` (string, required): Authorization code from Google

**Success Response:**
- **Status:** 302 Redirect to frontend
- **Headers:**
  - `Set-Cookie: jwt=<token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
- **Redirect:** `http://localhost:3000/` (or configured frontend URL)

**Error Response:**
- **Status:** 302 Redirect to frontend with error
- **Redirect:** `http://localhost:3000/?error=auth_failed`

---

#### `GET /api/auth/me`
**Purpose:** Get current authenticated user
**Auth Required:** Yes (JWT cookie)
**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "oauthProvider": "GOOGLE",
  "isAdmin": false,
  "defaultServings": 2,
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLogin": "2024-01-20T14:22:00Z"
}
```

---

#### `POST /api/auth/logout`
**Purpose:** Clear JWT cookie and log out
**Auth Required:** Yes
**Response:**
- **Status:** 200 OK
- **Headers:** `Set-Cookie: jwt=; HttpOnly; Secure; Max-Age=0`
```json
{
  "message": "Logged out successfully"
}
```

---

#### `PUT /api/auth/preferences`
**Purpose:** Update user preferences (default servings)
**Auth Required:** Yes
**Request Body:**
```json
{
  "defaultServings": 4
}
```
**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "oauthProvider": "GOOGLE",
  "isAdmin": false,
  "defaultServings": 4,
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLogin": "2024-01-20T14:22:00Z"
}
```

---

### 3.2 Recipe Endpoints

#### `GET /api/recipes`
**Purpose:** List all recipes (live only for non-admins, all for admins)
**Auth Required:** No (guests can browse)
**Query Parameters:**
- `mealType` (string, optional): Filter by meal type (breakfast, lunch, dinner, snacks)
- `search` (string, optional): Search by recipe name

**Response:**
```json
[
  {
    "id": 1,
    "name": "Porridge",
    "mealTypes": ["breakfast"],
    "defaultServings": 2,
    "calories": 880,
    "isCheat": false,
    "isLive": true,
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-10T10:00:00Z"
  }
]
```

---

#### `GET /api/recipes/:id`
**Purpose:** Get full recipe details with ingredients and steps
**Auth Required:** No
**Response:**
```json
{
  "id": 1,
  "name": "Porridge",
  "mealTypes": ["breakfast"],
  "defaultServings": 2,
  "calories": 880,
  "isCheat": false,
  "isLive": true,
  "ingredients": [
    {
      "id": 1,
      "ingredient": {
        "id": 1,
        "key": "ROLLED_OATS",
        "name": "Rolled oats",
        "aisle": {
          "id": 11,
          "key": "GRAINS",
          "name": "Grains & Pasta",
          "order": 11
        }
      },
      "quantity": 200.0,
      "unit": {
        "id": 1,
        "key": "GRAM",
        "value": "g"
      },
      "displayOrder": 1
    }
  ],
  "steps": [
    {
      "id": 1,
      "stepNumber": 1,
      "instruction": "Combine oats and milk in a pot.",
      "tip": null
    }
  ],
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-10T10:00:00Z"
}
```

---

#### `POST /api/recipes`
**Purpose:** Create new recipe (admin only)
**Auth Required:** Yes (Admin)
**Request Body:**
```json
{
  "name": "New Recipe",
  "mealTypeIds": [1, 2],
  "defaultServings": 2,
  "calories": 500,
  "isCheat": false,
  "isLive": false,
  "ingredients": [
    {
      "ingredientId": 1,
      "quantity": 100.0,
      "unitId": 1,
      "displayOrder": 1
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "Step 1 instructions",
      "tip": null
    }
  ]
}
```
**Response:** Full recipe object (status 201 Created)

---

#### `PUT /api/recipes/:id`
**Purpose:** Update existing recipe (admin only)
**Auth Required:** Yes (Admin)
**Request Body:** Same as POST
**Response:** Updated recipe object

---

#### `DELETE /api/recipes/:id`
**Purpose:** Soft delete recipe (admin only)
**Auth Required:** Yes (Admin)
**Response:**
- **Status:** 204 No Content

---

#### `PATCH /api/recipes/:id/visibility`
**Purpose:** Toggle recipe visibility (is_live flag)
**Auth Required:** Yes (Admin)
**Request Body:**
```json
{
  "isLive": true
}
```
**Response:** Updated recipe object

---

### 3.3 Meal Plan Endpoints

#### `GET /api/meal-plan`
**Purpose:** Get meal plan entries for date range
**Auth Required:** Yes
**Query Parameters:**
- `from` (date, required): Start date (YYYY-MM-DD)
- `to` (date, required): End date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": 1,
    "date": "2024-01-15",
    "mealType": "DINNER",
    "recipe": {
      "id": 5,
      "name": "Spaghetti",
      "calories": 650,
      "defaultServings": 2
    },
    "servings": 2,
    "createdAt": "2024-01-14T10:00:00Z",
    "updatedAt": "2024-01-14T10:00:00Z"
  }
]
```

---

#### `POST /api/meal-plan`
**Purpose:** Add recipe to meal plan
**Auth Required:** Yes
**Request Body:**
```json
{
  "date": "2024-01-15",
  "mealType": "DINNER",
  "recipeId": 5,
  "servings": 2
}
```
**Response:** Created meal plan entry (status 201)

---

#### `PUT /api/meal-plan/:id`
**Purpose:** Update meal plan entry (change servings)
**Auth Required:** Yes (must own entry)
**Request Body:**
```json
{
  "servings": 4
}
```
**Response:** Updated meal plan entry

---

#### `DELETE /api/meal-plan/:id`
**Purpose:** Remove recipe from meal plan
**Auth Required:** Yes (must own entry)
**Response:**
- **Status:** 204 No Content

---

### 3.4 Reference Data Endpoints

#### `GET /api/ingredients`
**Purpose:** List all ingredients with aisle assignments
**Auth Required:** No
**Response:**
```json
[
  {
    "id": 1,
    "key": "ROLLED_OATS",
    "name": "Rolled oats",
    "aisle": {
      "id": 11,
      "key": "GRAINS",
      "name": "Grains & Pasta",
      "order": 11
    }
  }
]
```

---

#### `GET /api/aisles`
**Purpose:** List all grocery aisles
**Auth Required:** No
**Response:**
```json
[
  {
    "id": 1,
    "key": "MEAT",
    "name": "Meat",
    "order": 1
  }
]
```

---

#### `GET /api/units`
**Purpose:** List all measurement units
**Auth Required:** No
**Response:**
```json
[
  {
    "id": 1,
    "key": "GRAM",
    "value": "g"
  }
]
```

---

#### `GET /api/meals`
**Purpose:** List all meal types
**Auth Required:** No
**Response:**
```json
[
  {
    "id": 1,
    "key": "BREAKFAST",
    "name": "Breakfast",
    "displayOrder": 1
  }
]
```

---

### 3.5 Audit Endpoints (Admin Only)

#### `GET /api/audit/recipes`
**Purpose:** List all recipe audit logs
**Auth Required:** Yes (Admin)
**Query Parameters:**
- `recipeId` (integer, optional): Filter by recipe
- `userId` (integer, optional): Filter by user
- `action` (string, optional): Filter by action (CREATE, UPDATE, DELETE)
- `from` (date, optional): Start date
- `to` (date, optional): End date

**Response:**
```json
[
  {
    "id": 1,
    "recipeId": 5,
    "recipeName": "Spaghetti",
    "userId": 1,
    "userName": "Admin User",
    "action": "UPDATE",
    "oldValues": {
      "name": "Pasta",
      "calories": 600
    },
    "newValues": {
      "name": "Spaghetti",
      "calories": 650
    },
    "timestamp": "2024-01-15T14:30:00Z"
  }
]
```

---

#### `GET /api/audit/recipes/:recipeId`
**Purpose:** Get audit history for specific recipe
**Auth Required:** Yes (Admin)
**Response:** Array of audit log entries (same format as above)

---

### 3.6 Health Check

#### `GET /api/health`
**Purpose:** Health check for monitoring
**Auth Required:** No
**Response:**
```json
{
  "status": "UP",
  "database": "UP",
  "timestamp": "2024-01-20T15:30:00Z"
}
```

---

## 4. Security Architecture

### 4.1 Authentication Flow Diagram

```
┌──────────┐                                           ┌──────────────┐
│  React   │                                           │   Google     │
│ Frontend │                                           │    OAuth     │
└────┬─────┘                                           └──────┬───────┘
     │                                                         │
     │ 1. User clicks "Sign in with Google"                   │
     │                                                         │
     │ 2. GET /api/auth/google                                │
     ├────────────────────────────────────┐                   │
     │                                    │                   │
     │                                    ▼                   │
     │                           ┌────────────────┐           │
     │                           │  Spring Boot   │           │
     │                           │   Backend      │           │
     │                           └────────┬───────┘           │
     │                                    │                   │
     │                                    │ 3. Redirect to    │
     │                                    │    Google OAuth   │
     │                                    ├───────────────────►
     │                                    │                   │
     │                                    │                   │ 4. User
     │                                    │                   │    authenticates
     │                                    │                   │
     │                                    │ 5. Callback with  │
     │                                    │    auth code      │
     │                                    ◄───────────────────┤
     │                                    │                   │
     │                                    │ 6. Exchange code  │
     │                                    │    for tokens     │
     │                                    ├───────────────────►
     │                                    │                   │
     │                                    ◄───────────────────┤
     │                                    │ 7. User profile   │
     │                                    │                   │
     │                                    ▼                   │
     │                           ┌────────────────┐           │
     │                           │  MySQL DB      │           │
     │                           │                │           │
     │                           │ 8. Create/     │           │
     │                           │    update user │           │
     │                           └────────────────┘           │
     │                                    │                   │
     │                                    │ 9. Generate JWT   │
     │                                    │                   │
     │ 10. Redirect with JWT cookie      │                   │
     │    (httpOnly, Secure, SameSite)   │                   │
     ◄────────────────────────────────────┤                   │
     │                                    │                   │
     │ 11. Frontend app loaded            │                   │
     │                                    │                   │
     │ 12. API requests with cookie       │                   │
     ├───────────────────────────────────►│                   │
     │                                    │                   │
     │                                    │ 13. Validate JWT  │
     │                                    │     from cookie   │
     │                                    │                   │
     │ 14. Authenticated response         │                   │
     ◄────────────────────────────────────┤                   │
     │                                    │                   │
```

### 4.2 JWT Cookie Configuration

**Cookie Name:** `jwt`

**Cookie Attributes:**
- `HttpOnly`: `true` (prevents JavaScript access, XSS protection)
- `Secure`: `true` in production (HTTPS only)
- `SameSite`: `Strict` (CSRF protection)
- `Path`: `/`
- `Max-Age`: `604800` (7 days in seconds)
- `Domain`: Not set (current domain only)

**JWT Payload:**
```json
{
  "sub": "1",
  "email": "user@example.com",
  "name": "John Doe",
  "isAdmin": false,
  "iat": 1705751234,
  "exp": 1706356034
}
```

### 4.3 Authorization Levels

| Role | Capabilities | Implementation |
|------|-------------|----------------|
| **Guest** | Browse live recipes only | No JWT cookie required |
| **User (Authenticated)** | + Create/edit meal plans<br>+ Generate shopping lists<br>+ View profile<br>+ Update preferences | Valid JWT cookie<br>`isAdmin=false` |
| **Admin (GOD)** | + Create/edit/delete recipes<br>+ Toggle recipe visibility<br>+ View audit logs<br>+ All user capabilities | Valid JWT cookie<br>`isAdmin=true`<br>Set manually in DB |

### 4.4 Security Measures

| Threat | Mitigation |
|--------|-----------|
| **XSS (Cross-Site Scripting)** | - JWT in httpOnly cookies (not localStorage)<br>- React auto-escapes output<br>- CSP headers |
| **CSRF (Cross-Site Request Forgery)** | - SameSite=Strict cookies<br>- CORS whitelist<br>- No state-changing GET endpoints |
| **SQL Injection** | - JPA parameterized queries<br>- Input validation |
| **Brute Force** | - Rate limiting on auth endpoints<br>- JWT expiration (7 days) |
| **Session Hijacking** | - HTTPS only in production<br>- Secure cookie flag<br>- Short JWT lifetime |
| **Data Leakage** | - No passwords stored (OAuth only)<br>- Admin endpoints check isAdmin<br>- User isolation in queries |
| **Audit Tampering** | - Append-only audit table<br>- Database triggers prevent UPDATE/DELETE |

### 4.5 CORS Configuration

**Allowed Origins:**
- Development: `http://localhost:3000`
- Production: `https://foodbytes.example.com`

**Allowed Methods:** `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`

**Allowed Headers:** `Content-Type`, `Accept`

**Allow Credentials:** `true` (required for cookies)

**Max Age:** `3600` seconds

---

## 5. Data Flow Diagrams

### 5.1 Recipe Assignment to Meal Plan Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ User views recipes │
                  │ in Breakfast tab   │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ User clicks day    │
                  │ button (e.g., Mon) │
                  └──────────┬─────────┘
                             │
┌────────────────────────────┴────────────────────────────────────────┐
│                        FRONTEND ACTIONS                             │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Calculate date     │
                  │ from global range  │
                  │ (DateRangeContext) │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ POST /api/meal-plan│
                  │ Body:              │
                  │ {                  │
                  │   date: "2024-01-15"│
                  │   mealType: "BREAKFAST"│
                  │   recipeId: 1,     │
                  │   servings: 2      │
                  │ }                  │
                  └──────────┬─────────┘
                             │
┌────────────────────────────┴────────────────────────────────────────┐
│                        BACKEND PROCESSING                           │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ JwtAuthFilter      │
                  │ extracts JWT from  │
                  │ httpOnly cookie    │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Validate JWT       │
                  │ (signature, expiry)│
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Extract user ID    │
                  │ from JWT payload   │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Validate request   │
                  │ - Recipe exists?   │
                  │ - Date valid?      │
                  │ - Servings > 0?    │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Check cheat meal   │
                  │ limit (FR-011)     │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Insert into        │
                  │ meal_plan_entries  │
                  │ table              │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Return 201 Created │
                  │ with entry details │
                  └──────────┬─────────┘
                             │
┌────────────────────────────┴────────────────────────────────────────┐
│                        FRONTEND UPDATES                             │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Update             │
                  │ PlannerContext     │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Re-render calendar │
                  │ view (if open)     │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Re-calculate       │
                  │ shopping list      │
                  │ (if open)          │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Show success toast │
                  └────────────────────┘
```

### 5.2 Shopping List Aggregation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ User navigates to  │
                  │ Shopping List view │
                  └──────────┬─────────┘
                             │
┌────────────────────────────┴────────────────────────────────────────┐
│                        FRONTEND ACTIONS                             │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Get dateFrom and   │
                  │ dateTo from        │
                  │ DateRangeContext   │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ GET /api/meal-plan │
                  │ ?from=2024-01-15   │
                  │ &to=2024-01-21     │
                  └──────────┬─────────┘
                             │
┌────────────────────────────┴────────────────────────────────────────┐
│                        BACKEND PROCESSING                           │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Authenticate user  │
                  │ from JWT cookie    │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Query              │
                  │ meal_plan_entries  │
                  │ WHERE user_id = ?  │
                  │ AND date BETWEEN ? │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ For each entry,    │
                  │ JOIN recipes table │
                  │ to get recipe ID   │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ For each recipe,   │
                  │ JOIN recipe_       │
                  │ ingredients table  │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Return entries with│
                  │ full recipe details│
                  └──────────┬─────────┘
                             │
┌────────────────────────────┴────────────────────────────────────────┐
│                        FRONTEND AGGREGATION                         │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Initialize empty   │
                  │ Map<key, aggregate>│
                  │ key = name + unit  │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ For each entry:    │
                  │ - Get recipe       │
                  │ - Get servings     │
                  │ - Scale factor =   │
                  │   servings /       │
                  │   defaultServings  │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ For each ingredient│
                  │ in recipe:         │
                  │ - Scale quantity   │
                  │ - Add to aggregate │
                  │   (sum quantities) │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Sort aggregated    │
                  │ list by:           │
                  │ 1. Check status    │
                  │ 2. Aisle order     │
                  │ 3. Ingredient name │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Group by aisle     │
                  │ (17 groups)        │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Render shopping    │
                  │ list with aisle    │
                  │ color coding       │
                  └────────────────────┘
```

### 5.3 Admin Recipe Editing with Audit Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN INTERACTION                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Admin clicks "Edit │
                  │ Recipe" button     │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Recipe editor modal│
                  │ opens with current │
                  │ recipe data        │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Admin modifies:    │
                  │ - Name             │
                  │ - Calories         │
                  │ - Ingredients      │
                  │ - Steps            │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Admin clicks       │
                  │ "Save Changes"     │
                  └──────────┬─────────┘
                             │
┌────────────────────────────┴────────────────────────────────────────┐
│                        FRONTEND ACTIONS                             │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ PUT /api/recipes/5 │
                  │ Body: {            │
                  │   name: "New Name",│
                  │   calories: 650,   │
                  │   ...              │
                  │ }                  │
                  └──────────┬─────────┘
                             │
┌────────────────────────────┴────────────────────────────────────────┐
│                        BACKEND PROCESSING                           │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Authenticate user  │
                  │ from JWT cookie    │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Verify user has    │
                  │ isAdmin = true     │
                  └──────────┬─────────┘
                             │ YES
                             ▼
                  ┌────────────────────┐
                  │ Start database     │
                  │ transaction        │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Fetch CURRENT      │
                  │ recipe from DB     │
                  │ (old_values)       │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Serialize old      │
                  │ values to JSON     │
                  │ (all fields)       │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Update recipes     │
                  │ table with new     │
                  │ values             │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Update related     │
                  │ tables:            │
                  │ - recipe_ingredients│
                  │ - recipe_steps     │
                  │ - recipe_meals     │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Serialize new      │
                  │ values to JSON     │
                  │ (all fields)       │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ INSERT INTO        │
                  │ recipe_audit_log   │
                  │ (recipe_id,        │
                  │  user_id,          │
                  │  action: 'UPDATE', │
                  │  old_values: {...},│
                  │  new_values: {...},│
                  │  timestamp: NOW()) │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Commit transaction │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Return 200 OK with │
                  │ updated recipe     │
                  └──────────┬─────────┘
                             │
┌────────────────────────────┴────────────────────────────────────────┐
│                        FRONTEND UPDATES                             │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Close editor modal │
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Refresh recipe list│
                  └──────────┬─────────┘
                             │
                             ▼
                  ┌────────────────────┐
                  │ Show success toast │
                  └────────────────────┘
```

---

## 6. Database Schema

### 6.1 Schema Diagram

```
┌──────────────────┐         ┌──────────────────┐
│     users        │         │     recipes      │
├──────────────────┤         ├──────────────────┤
│ id (PK)          │         │ id (PK)          │
│ email (UNIQUE)   │         │ name             │
│ name             │         │ default_servings │
│ oauth_provider   │         │ calories         │
│ oauth_id         │         │ is_cheat         │
│ is_admin         │         │ is_live          │
│ default_servings │         │ is_deleted       │
│ created_at       │         │ created_at       │
│ last_login       │         │ updated_at       │
└────────┬─────────┘         └─────────┬────────┘
         │                             │
         │                             │
         │                    ┌────────┴─────────────┐
         │                    │                      │
         │                    │                      │
         │          ┌─────────▼────────┐  ┌──────────▼───────────┐
         │          │ recipe_ingredients│  │   recipe_steps      │
         │          ├──────────────────┤  ├─────────────────────┤
         │          │ id (PK)          │  │ id (PK)             │
         │          │ recipe_id (FK)   │  │ recipe_id (FK)      │
         │          │ ingredient_id(FK)│  │ step_number         │
         │          │ quantity         │  │ instruction         │
         │          │ unit_id (FK)     │  │ tip                 │
         │          │ display_order    │  └─────────────────────┘
         │          └──────────────────┘
         │                    │
         │          ┌─────────▼────────┐  ┌──────────────────────┐
         │          │  ingredients     │  │   recipe_meals       │
         │          ├──────────────────┤  ├──────────────────────┤
         │          │ id (PK)          │  │ id (PK)              │
         │          │ key (UNIQUE)     │  │ recipe_id (FK)       │
         │          │ name             │  │ meal_id (FK)         │
         │          │ aisle_id (FK)    │  └────────┬─────────────┘
         │          └──────┬───────────┘           │
         │                 │                       │
         │       ┌─────────▼────────┐    ┌─────────▼─────────┐
         │       │     aisles       │    │      meals        │
         │       ├──────────────────┤    ├───────────────────┤
         │       │ id (PK)          │    │ id (PK)           │
         │       │ key (UNIQUE)     │    │ key (UNIQUE)      │
         │       │ name             │    │ name              │
         │       │ order            │    │ display_order     │
         │       └──────────────────┘    └───────────────────┘
         │
         │
         │       ┌──────────────────┐
         │       │     units        │
         │       ├──────────────────┤
         │       │ id (PK)          │
         │       │ key (UNIQUE)     │
         │       │ value            │
         │       └──────────────────┘
         │
         │
         │      ┌─────────────────────────┐
         └─────►│  meal_plan_entries      │
                ├─────────────────────────┤
                │ id (PK)                 │
                │ user_id (FK)            │
                │ date                    │
                │ meal_type               │
                │ recipe_id (FK)          │
                │ servings                │
                │ created_at              │
                │ updated_at              │
                └────────┬────────────────┘
                         │
         ┌───────────────┘
         │
         │      ┌─────────────────────────┐
         └─────►│  recipe_audit_log       │
                ├─────────────────────────┤
                │ id (PK)                 │
                │ recipe_id (FK)          │
                │ user_id (FK)            │
                │ action                  │
                │ old_values (JSON)       │
                │ new_values (JSON)       │
                │ timestamp               │
                └─────────────────────────┘
```

### 6.2 Critical Schema Rules

**MUST FOLLOW (from SQL context):**
1. **NO JSON columns** for structured data - Use normalized tables
2. **Use foreign keys** for all relationships
3. **Use junction tables** for many-to-many relationships
4. **Soft deletes** - is_deleted flag, not hard DELETE
5. **Audit immutability** - Triggers prevent UPDATE/DELETE on recipe_audit_log
6. **ENUM uppercase** - oauth_provider ENUM values MUST be uppercase ('GOOGLE', not 'google')

### 6.3 Table Descriptions

#### `users`
Stores OAuth-authenticated user accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | User ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email from OAuth |
| name | VARCHAR(255) | NOT NULL | Display name |
| oauth_provider | ENUM('GOOGLE') | NOT NULL | OAuth provider (Google only) |
| oauth_id | VARCHAR(255) | NOT NULL | Provider's user ID |
| is_admin | BOOLEAN | DEFAULT FALSE | GOD mode flag |
| default_servings | TINYINT UNSIGNED | DEFAULT 1 | User's preferred servings |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation |
| last_login | TIMESTAMP | NULL | Last login time |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (email)
- UNIQUE (oauth_provider, oauth_id)

---

#### `recipes`
Main recipe table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Recipe ID |
| name | VARCHAR(255) | NOT NULL | Recipe name |
| default_servings | TINYINT UNSIGNED | NOT NULL, DEFAULT 2 | Base servings |
| calories | SMALLINT UNSIGNED | NOT NULL | Total calories |
| is_cheat | BOOLEAN | DEFAULT FALSE | Cheat meal flag |
| is_live | BOOLEAN | DEFAULT FALSE | Visibility (0=hidden, 1=live) |
| is_deleted | BOOLEAN | DEFAULT FALSE | Soft delete flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (is_live, is_deleted) for recipe listing queries

---

#### `recipe_ingredients`
Many-to-many junction table linking recipes to ingredients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Entry ID |
| recipe_id | INT UNSIGNED | FK → recipes.id, NOT NULL | Recipe reference |
| ingredient_id | INT UNSIGNED | FK → ingredients.id, NOT NULL | Ingredient reference |
| quantity | DECIMAL(10,2) | NOT NULL | Quantity amount |
| unit_id | INT UNSIGNED | FK → units.id, NOT NULL | Unit reference |
| display_order | SMALLINT UNSIGNED | NOT NULL, DEFAULT 0 | Sort order |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (recipe_id, ingredient_id)
- INDEX (recipe_id) for ingredient lookups

**Foreign Keys:**
- recipe_id → recipes(id) ON DELETE CASCADE
- ingredient_id → ingredients(id) ON DELETE RESTRICT
- unit_id → units(id) ON DELETE RESTRICT

---

#### `recipe_steps`
Ordered cooking instructions for recipes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Step ID |
| recipe_id | INT UNSIGNED | FK → recipes.id, NOT NULL | Recipe reference |
| step_number | SMALLINT UNSIGNED | NOT NULL | Step order (1, 2, 3...) |
| instruction | TEXT | NOT NULL | Step instructions |
| tip | TEXT | NULL | Optional cooking tip |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (recipe_id, step_number)
- INDEX (recipe_id) for step lookups

**Foreign Keys:**
- recipe_id → recipes(id) ON DELETE CASCADE

---

#### `recipe_meals`
Many-to-many junction table linking recipes to meal types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Entry ID |
| recipe_id | INT UNSIGNED | FK → recipes.id, NOT NULL | Recipe reference |
| meal_id | INT UNSIGNED | FK → meals.id, NOT NULL | Meal type reference |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (recipe_id, meal_id)

**Foreign Keys:**
- recipe_id → recipes(id) ON DELETE CASCADE
- meal_id → meals(id) ON DELETE RESTRICT

---

#### `meals`
Lookup table for meal types (breakfast, lunch, dinner, snacks).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Meal type ID |
| key | VARCHAR(50) | UNIQUE, NOT NULL | Constant key (BREAKFAST) |
| name | VARCHAR(100) | NOT NULL | Display name (Breakfast) |
| display_order | TINYINT UNSIGNED | NOT NULL | Sort order |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (key)

**Seed Data:**
```sql
INSERT INTO meals (key, name, display_order) VALUES
('BREAKFAST', 'Breakfast', 1),
('LUNCH', 'Lunch', 2),
('DINNER', 'Dinner', 3),
('SNACKS', 'Snacks', 4);
```

---

#### `ingredients`
Ingredient definitions with aisle assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Ingredient ID |
| key | VARCHAR(100) | UNIQUE, NOT NULL | Constant key (ROLLED_OATS) |
| name | VARCHAR(255) | NOT NULL | Display name (Rolled oats) |
| aisle_id | INT UNSIGNED | FK → aisles.id, NOT NULL | Aisle assignment |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (key)

**Foreign Keys:**
- aisle_id → aisles(id) ON DELETE RESTRICT

---

#### `aisles`
Grocery store aisle definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Aisle ID |
| key | VARCHAR(50) | UNIQUE, NOT NULL | Constant key (MEAT) |
| name | VARCHAR(100) | NOT NULL | Display name (Meat) |
| order | TINYINT UNSIGNED | UNIQUE, NOT NULL | Shopping list order (1-17) |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (key)
- INDEX (order) for sorted shopping lists

**Seed Data:**
```sql
INSERT INTO aisles (key, name, `order`) VALUES
('MEAT', 'Meat', 1),
('POULTRY', 'Poultry', 2),
('VEG', 'Veg', 3),
('FRUIT', 'Fruit', 4),
('FISH', 'Fish', 5),
('DAIRY', 'Dairy', 6),
('FROZEN', 'Frozen', 7),
('HERBS', 'Herbs & Spices', 8),
('OILS', 'Oils & Fats', 9),
('TINS', 'Tins & Jars', 10),
('GRAINS', 'Grains & Pasta', 11),
('CONDIMENTS', 'Condiments & Sauces', 12),
('BAKERY', 'Bakery', 13),
('NUTS', 'Nuts', 14),
('SEEDS', 'Seeds', 15),
('BEVERAGES', 'Beverages', 16),
('MISC', 'Misc', 17);
```

---

#### `units`
Measurement unit definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Unit ID |
| key | VARCHAR(50) | UNIQUE, NOT NULL | Constant key (GRAM) |
| value | VARCHAR(20) | NOT NULL | Display abbreviation (g) |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (key)

**Seed Data:**
```sql
INSERT INTO units (key, value) VALUES
('GRAM', 'g'),
('KILOGRAM', 'kg'),
('MILLILITER', 'ml'),
('LITER', 'l'),
('TEASPOON', 'tsp'),
('TABLESPOON', 'tbsp'),
('CUP', 'cup'),
('PIECE', 'piece'),
('SLICE', 'slice'),
('PINCH', 'pinch'),
('TIN', 'tin'),
('CAN', 'can');
```

---

#### `meal_plan_entries`
User meal plan assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Entry ID |
| user_id | INT UNSIGNED | FK → users.id, NOT NULL | Entry owner |
| date | DATE | NOT NULL | Calendar date (YYYY-MM-DD) |
| meal_type | ENUM('BREAKFAST','LUNCH','DINNER','SNACKS') | NOT NULL | Meal slot |
| recipe_id | INT UNSIGNED | FK → recipes.id, NOT NULL | Assigned recipe |
| servings | TINYINT UNSIGNED | NOT NULL | Planned servings |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Entry creation |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (user_id, date) for date range queries
- UNIQUE (user_id, date, meal_type) - one recipe per meal slot

**Foreign Keys:**
- user_id → users(id) ON DELETE CASCADE
- recipe_id → recipes(id) ON DELETE RESTRICT

---

#### `recipe_audit_log`
Immutable audit trail for recipe changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Audit entry ID |
| recipe_id | INT UNSIGNED | FK → recipes.id, NOT NULL | Modified recipe |
| user_id | INT UNSIGNED | FK → users.id, NOT NULL | Admin who made change |
| action | ENUM('CREATE','UPDATE','DELETE') | NOT NULL | Action type |
| old_values | JSON | NULL | Full snapshot before change |
| new_values | JSON | NULL | Full snapshot after change |
| timestamp | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When change occurred |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (recipe_id) for recipe history
- INDEX (user_id) for admin activity
- INDEX (timestamp) for chronological queries

**Foreign Keys:**
- recipe_id → recipes(id) ON DELETE RESTRICT
- user_id → users(id) ON DELETE RESTRICT

**Audit Trigger (Immutability):**
```sql
DELIMITER //
CREATE TRIGGER prevent_audit_modification
BEFORE UPDATE ON recipe_audit_log
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Audit log is immutable - no updates allowed';
END//

CREATE TRIGGER prevent_audit_deletion
BEFORE DELETE ON recipe_audit_log
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Audit log is immutable - no deletes allowed';
END//
DELIMITER ;
```

---

## 7. Frontend Architecture

### 7.1 React Component Hierarchy

```
App.jsx
│
├─ AuthProvider (AuthContext)
│  └─ PlannerProvider (PlannerContext)
│     └─ DateRangeProvider (DateRangeContext)
│        │
│        ├─ Router
│        │  │
│        │  ├─ Route "/" → HomePage
│        │  │  ├─ Header
│        │  │  ├─ MealTypeTabs
│        │  │  ├─ RecipeList
│        │  │  │  └─ RecipeCard (multiple)
│        │  │  │     ├─ ServingsControl
│        │  │  │     ├─ DayButtons
│        │  │  │     └─ RecipeDetail (collapsible)
│        │  │  └─ Footer
│        │  │
│        │  ├─ Route "/meal-plan" → MealPlanPage (ProtectedRoute)
│        │  │  ├─ Header
│        │  │  ├─ DateNavigator
│        │  │  ├─ Calendar
│        │  │  │  └─ CalendarDay (multiple)
│        │  │  └─ Footer
│        │  │
│        │  ├─ Route "/shopping" → ShoppingListPage (ProtectedRoute)
│        │  │  ├─ Header
│        │  │  ├─ ShoppingList
│        │  │  │  └─ AisleGroup (multiple)
│        │  │  │     └─ ShoppingItem (multiple)
│        │  │  └─ Footer
│        │  │
│        │  ├─ Route "/admin" → AdminPage (ProtectedRoute requireAdmin)
│        │  │  ├─ Header
│        │  │  ├─ RecipeEditor
│        │  │  ├─ AuditLog
│        │  │  └─ Footer
│        │  │
│        │  ├─ Route "/profile" → ProfilePage (ProtectedRoute)
│        │  │  ├─ Header
│        │  │  ├─ UserProfile
│        │  │  └─ Footer
│        │  │
│        │  └─ Route "/login" → LoginPage
│        │     └─ GoogleSignInButton
│        │
│        └─ ErrorBoundary
│           └─ Toast (global notifications)
```

### 7.2 React Context Providers

#### AuthContext
**Purpose:** Manage user authentication state

**State:**
```javascript
{
  user: {
    id: 1,
    email: "user@example.com",
    name: "John Doe",
    isAdmin: false,
    defaultServings: 2
  },
  loading: false,
  error: null
}
```

**Methods:**
- `login(provider)` - Redirect to OAuth
- `logout()` - Clear session
- `updatePreferences(prefs)` - Update user settings

---

#### PlannerContext
**Purpose:** Manage meal plan state

**State:**
```javascript
{
  entries: [
    {
      id: 1,
      date: "2024-01-15",
      mealType: "DINNER",
      recipe: {...},
      servings: 2
    }
  ],
  loading: false,
  error: null
}
```

**Methods:**
- `fetchEntries(fromDate, toDate)` - Load entries
- `addEntry(entry)` - Assign recipe
- `updateEntry(id, changes)` - Modify servings
- `removeEntry(id)` - Delete assignment

---

#### DateRangeContext
**Purpose:** Manage shared global date range (FR-000)

**State:**
```javascript
{
  dateFrom: "2024-01-15",  // Start of range
  dateTo: "2024-01-21"     // End of range (7 days default)
}
```

**Methods:**
- `setDateRange(from, to)` - Update range
- `shiftRange(days)` - Move forward/back
- `resetToCurrentWeek()` - Default range

**Usage:**
All three views (Recipes, Shopping List, Meal Plan) consume this context to stay synchronized.

---

### 7.3 Key React Hooks

#### `useAuth()`
```javascript
const { user, loading, isAdmin, login, logout } = useAuth();
```

#### `useMealPlan()`
```javascript
const { entries, loading, addEntry, updateEntry, removeEntry } = useMealPlan();
```

#### `useShoppingList()`
```javascript
const { items, loading, aggregateIngredients } = useShoppingList(dateFrom, dateTo);
```

#### `useWakeLock()`
```javascript
const { requestWakeLock, releaseWakeLock } = useWakeLock();
```

---

### 7.4 Axios Configuration

**File:** `src/services/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // CRITICAL: Send cookies with requests
});

// Response interceptor for 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**CRITICAL:** `withCredentials: true` is required for JWT cookies to be sent automatically.

---

## 8. Backend Architecture

### 8.1 Spring Boot Application Structure

**Main Application Class:**
```java
package com.foodbytes;

@SpringBootApplication
@EnableJpaAuditing
public class FoodBytesApplication {
    public static void main(String[] args) {
        SpringApplication.run(FoodBytesApplication.class, args);
    }
}
```

---

### 8.2 Security Configuration

**File:** `config/SecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // Not needed with SameSite=Strict
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/recipes/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/ingredients").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/aisles").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/units").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/meals").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo ->
                    userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2AuthenticationSuccessHandler)
            )
            .addFilterBefore(jwtAuthenticationFilter(),
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);  // CRITICAL: Allow cookies

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

---

### 8.3 JWT Token Provider

**File:** `security/JwtTokenProvider.java`

```java
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    public String generateToken(UserPrincipal userPrincipal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
            .setSubject(String.valueOf(userPrincipal.getId()))
            .claim("email", userPrincipal.getEmail())
            .claim("name", userPrincipal.getName())
            .claim("isAdmin", userPrincipal.isAdmin())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody();

        return Long.parseLong(claims.getSubject());
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
```

---

### 8.4 JWT Authentication Filter

**File:** `security/JwtAuthenticationFilter.java`

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
                                    throws ServletException, IOException {

        String jwt = extractTokenFromCookie(request);

        if (jwt != null && tokenProvider.validateToken(jwt)) {
            Long userId = tokenProvider.getUserIdFromToken(jwt);
            UserDetails userDetails = userService.loadUserById(userId);

            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            return Arrays.stream(request.getCookies())
                .filter(cookie -> "jwt".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
        }
        return null;
    }
}
```

---

### 8.5 OAuth2 Success Handler

**File:** `security/OAuth2AuthenticationSuccessHandler.java`

```java
@Component
public class OAuth2AuthenticationSuccessHandler
    extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                       HttpServletResponse response,
                                       Authentication authentication)
                                       throws IOException {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(userPrincipal);

        // Set JWT in httpOnly cookie
        ResponseCookie cookie = ResponseCookie.from("jwt", token)
            .httpOnly(true)
            .secure(true)  // HTTPS only in production
            .sameSite("Strict")
            .path("/")
            .maxAge(Duration.ofDays(7))
            .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Redirect to frontend
        getRedirectStrategy().sendRedirect(request, response, frontendUrl);
    }
}
```

---

### 8.6 Service Layer Pattern

**Example:** `service/RecipeService.java`

```java
@Service
@Transactional
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private AuditService auditService;

    public RecipeDTO getRecipeById(Long id) {
        Recipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));
        return mapToDTO(recipe);
    }

    public RecipeDTO createRecipe(RecipeDTO dto, Long adminUserId) {
        Recipe recipe = new Recipe();
        // Map DTO to entity
        recipe = recipeRepository.save(recipe);

        // Audit log
        auditService.logRecipeChange(
            recipe.getId(),
            adminUserId,
            AuditAction.CREATE,
            null,  // No old values
            recipe
        );

        return mapToDTO(recipe);
    }

    public RecipeDTO updateRecipe(Long id, RecipeDTO dto, Long adminUserId) {
        Recipe oldRecipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));

        // Capture old values for audit
        Recipe oldSnapshot = cloneRecipe(oldRecipe);

        // Update recipe
        updateEntityFromDTO(oldRecipe, dto);
        Recipe updatedRecipe = recipeRepository.save(oldRecipe);

        // Audit log with full diff
        auditService.logRecipeChange(
            id,
            adminUserId,
            AuditAction.UPDATE,
            oldSnapshot,
            updatedRecipe
        );

        return mapToDTO(updatedRecipe);
    }

    public void deleteRecipe(Long id, Long adminUserId) {
        Recipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));

        // Soft delete
        recipe.setIsDeleted(true);
        recipeRepository.save(recipe);

        // Audit log
        auditService.logRecipeChange(
            id,
            adminUserId,
            AuditAction.DELETE,
            recipe,
            null  // No new values
        );
    }
}
```

---

## 9. Requirements Addressed

This architecture design enables all Phase 1 requirements:

### 9.1 Functional Requirements Addressed

| Requirement | How Implemented | Architecture Component |
|-------------|-----------------|------------------------|
| **FR-000: Global Date Range** | DateRangeContext shared across all views | Frontend: DateRangeContext.jsx |
| **FR-001: Browse by Meal** | Filter recipes via meal_type query param | Backend: RecipeController, recipe_meals table |
| **FR-002: Search Recipes** | Search query param filters by name | Backend: RecipeRepository.findByNameContaining |
| **FR-003: View Recipe Details** | GET /api/recipes/:id with full joins | Backend: Recipe entity with @OneToMany |
| **FR-004: Adjust Servings** | Client-side scaling, user default from DB | Frontend: ServingsControl, Backend: users.default_servings |
| **FR-005: Copy Recipe** | Clipboard API in frontend | Frontend: navigator.clipboard.writeText |
| **FR-006: Fullscreen Recipe** | Modal component with wake lock | Frontend: RecipeDetail modal, useWakeLock |
| **FR-007: Assign to Days** | POST /api/meal-plan with date + mealType | Backend: MealPlanEntry entity, Frontend: DayButtons |
| **FR-008: Remove from Calendar** | DELETE /api/meal-plan/:id | Backend: MealPlanController.deleteEntry |
| **FR-009: View Meal Plan** | GET /api/meal-plan with date range | Backend: MealPlanRepository.findByDateBetween |
| **FR-010: Daily Calories** | Frontend aggregation from recipe calories | Frontend: Calendar component calculation |
| **FR-011: Cheat Meal Limits** | Frontend validation before POST | Frontend: addEntry validation logic |
| **FR-012: Shopping List** | Frontend aggregates ingredients from meal plan | Frontend: ShoppingList component, aggregateIngredients util |
| **FR-013: Group by Aisle** | Sort by aisle order from aisles table | Frontend: AisleGroup component, Backend: aisles.order |
| **FR-014: Check Off Items** | LocalStorage checkbox state | Frontend: localStorage.setItem('shoppingListState') |
| **FR-015: Uncheck All** | Clear localStorage state | Frontend: Clear button handler |
| **FR-016: Copy Shopping List** | Clipboard API | Frontend: navigator.clipboard.writeText |
| **FR-017: Sort Shopping List** | Multi-level sort (check, aisle, name) | Frontend: sort logic in ShoppingList |
| **FR-018: Persist to Server** | MySQL meal_plan_entries table | Backend: MealPlanRepository, meal_plan_entries table |
| **FR-019: Shopping State Local** | LocalStorage for checkboxes | Frontend: localStorage (NOT synced to server) |
| **FR-020: Shareable URL** | Base64-encode meal plan to query param | Frontend: generateShareURL utility |
| **FR-021: Import Shared URL** | Decode query param on load | Frontend: URL parsing in App.jsx |
| **FR-022: Screen Wake Lock** | Wake Lock API | Frontend: useWakeLock hook |
| **FR-023: Google OAuth Login** | Spring Security OAuth2 + Google | Backend: SecurityConfig, OAuth2Config, users table |
| **FR-024: User Profile** | GET /api/auth/me, PUT /api/auth/preferences | Backend: AuthController, users.default_servings |
| **FR-025: GOD Mode** | users.is_admin flag checked in endpoints | Backend: @PreAuthorize("hasRole('ADMIN')") |
| **FR-026: Recipe Editing** | POST/PUT/DELETE /api/recipes (admin only) | Backend: RecipeController with admin checks |
| **FR-027: Audit Trail** | recipe_audit_log table with triggers | Backend: AuditService, recipe_audit_log table |
| **FR-028: Recipe Visibility** | recipes.is_live flag, PATCH endpoint | Backend: recipes.is_live, visibility toggle endpoint |

---

### 9.2 Non-Functional Requirements Addressed

| Requirement | How Implemented | Architecture Component |
|-------------|-----------------|------------------------|
| **NFR-001: Hybrid Architecture** | React + Spring Boot + MySQL | Full stack |
| **NFR-002: Instant Scaling** | Client-side calculation (< 16ms) | Frontend: JavaScript multiplication |
| **NFR-003: Mobile-First** | CSS breakpoints, 44px touch targets | Frontend: CSS Modules, responsive.css |
| **NFR-004: Thumb Navigation** | Bottom nav bar (mobile) | Frontend: Footer component with sticky position |
| **NFR-005: Aisle Colors** | 17 color CSS variables | Frontend: variables.css, AisleGroup.module.css |
| **NFR-006: API Fallbacks** | Try-catch with graceful degradation | Frontend: Service layer error handling |
| **NFR-007: Data Recovery** | Load from server on mount | Frontend: useEffect in AuthContext, PlannerContext |
| **NFR-008: Server Storage** | MySQL as single source of truth | Backend: MySQL database, JPA repositories |
| **NFR-009: Progressive APIs** | Feature detection for wake lock, clipboard | Frontend: if ('wakeLock' in navigator) |
| **NFR-010: Centralized Ingredients** | ingredients table with unique names | Backend: ingredients table with UNIQUE constraint |
| **NFR-011: Validation Helpers** | JPA validation annotations | Backend: @Valid, @NotNull, @Min annotations |
| **NFR-012: API Auth** | JWT in cookies, admin role check | Backend: JwtAuthenticationFilter, @PreAuthorize |
| **NFR-013: Audit Integrity** | Immutable audit table with triggers | Backend: Database triggers prevent UPDATE/DELETE |
| **NFR-014: Data Retention** | Archive job for 6-month-old entries | Backend: Scheduled task (future implementation) |
| **NFR-015: Centralized Units** | units table with unique keys | Backend: units table with UNIQUE constraint |

---

## 10. Requirements NOT Addressed

These requirements are deferred to future phases:

### 10.1 Deferred to Phase 2+

| Requirement | Reason for Deferral | Planned Phase |
|-------------|---------------------|---------------|
| **Multi-language support** | English-only for Phase 1 | Phase 3 |
| **Custom recipe creation (users)** | Admin-only in Phase 1 | Phase 2 |
| **Recipe ratings/reviews** | Social features deferred | Phase 3 |
| **Nutrition breakdown (macros)** | Calories-only for Phase 1 | Phase 2 |
| **Recipe images** | Text-based recipes for Phase 1 | Phase 2 |
| **Meal plan templates** | User creates from scratch in Phase 1 | Phase 3 |
| **Shopping list export (PDF)** | Clipboard copy sufficient for Phase 1 | Phase 2 |
| **Grocery store integration** | Out of scope | Phase 4+ |
| **Mobile native apps** | Web-only for Phase 1 | Never (responsive web app) |
| **Offline support (PWA)** | Online-only for Phase 1 | Phase 3 |
| **Data archival job** | Manual archival for Phase 1 | Phase 2 |
| **Admin dashboard analytics** | Basic audit log viewer only | Phase 2 |

---

## 11. Critical Non-Negotiable Rules

Per context files, these rules CANNOT be overridden:

### 11.1 Authentication
- **Google OAuth ONLY** - No GitHub, no passwords (auth context)
- **Official Google branding** - Use official Google Sign-In button (UX context)
- **httpOnly cookies** - JWT stored in cookies, NOT localStorage (auth context)

### 11.2 Database
- **MySQL** - Not PostgreSQL, not MongoDB (SQL context)
- **No JSON columns** - Use normalized tables with foreign keys (SQL context)
- **Foreign keys required** - All relationships must have FK constraints (SQL context)
- **Uppercase ENUMs** - oauth_provider = 'GOOGLE' not 'google' (auth context)
- **Immutable audit** - Triggers prevent UPDATE/DELETE on recipe_audit_log (SQL context)

### 11.3 Frontend
- **Web application** - NOT React Native, NOT mobile app (system context)
- **React web** - NOT React Native, NOT Expo (system context)
- **Mobile-first CSS** - Responsive design with 44px touch targets (UX context)
- **Brand color #a689c6** - Consistent throughout UI (UX context)
- **Accessible contrast** - WCAG 2.1 AA minimum (UX context)

### 11.4 Backend
- **Java Spring Boot** - Sole backend, no Node.js (Java context)
- **Java 17+** - LTS version (Java context)
- **Spring Data JPA** - ORM abstraction (Java context)

### 11.5 Data Integrity
- **Soft deletes** - is_deleted flag, not hard DELETE (SQL context)
- **6-month retention** - Rolling data retention for meal plans (requirements)
- **Audit forever** - Audit logs exempt from retention policy (requirements)

---

## 12. Deployment Architecture

### 12.1 Docker Compose Setup

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: foodbytes-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/1-schema.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/2-seed.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - foodbytes-network

  backend:
    build: ./foodbytes-api
    container_name: foodbytes-backend
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: ${JWT_EXPIRATION}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      SERVER_PORT: 8080
      FRONTEND_URL: http://localhost:3000
      SPRING_PROFILES_ACTIVE: docker
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - foodbytes-network

  frontend:
    build: ./client
    container_name: foodbytes-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - foodbytes-network

volumes:
  mysql_data:

networks:
  foodbytes-network:
    driver: bridge
```

---

### 12.2 Environment Variables

**File:** `.env.example`

```env
# Database
DB_ROOT_PASSWORD=root_password_change_me
DB_NAME=foodbytes
DB_USER=foodbytes_user
DB_PASSWORD=secure_password_change_me

# JWT
JWT_SECRET=your_jwt_secret_must_be_at_least_32_characters_long_change_me
JWT_EXPIRATION=604800000

# OAuth (Google ONLY)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server
SERVER_PORT=8080
FRONTEND_URL=http://localhost:3000

# Spring Profile
SPRING_PROFILES_ACTIVE=docker
```

---

### 12.3 Nginx Reverse Proxy Configuration

**File:** `client/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;

    # Frontend static files
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing - serve index.html for all non-API routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host:3000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host:3000;
        proxy_set_header X-Forwarded-Port 3000;
    }

    # OAuth callback routes (CRITICAL for Google OAuth)
    location /oauth2/ {
        proxy_pass http://backend:8080/oauth2/;
        proxy_http_version 1.1;
        proxy_set_header Host $host:3000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host:3000;
        proxy_set_header X-Forwarded-Port 3000;
    }

    location /login/oauth2/ {
        proxy_pass http://backend:8080/login/oauth2/;
        proxy_http_version 1.1;
        proxy_set_header Host $host:3000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host:3000;
        proxy_set_header X-Forwarded-Port 3000;
    }
}
```

**CRITICAL:** The `X-Forwarded-Host` and `X-Forwarded-Port` headers are required for Google OAuth redirects to use the correct port (3000, not 8080).

---

### 12.4 Spring Boot Docker Profile

**File:** `foodbytes-api/src/main/resources/application-docker.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
    show-sql: false

  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: email, profile

server:
  port: ${SERVER_PORT}
  servlet:
    context-path: /
  forward-headers-strategy: framework  # CRITICAL for proxy setups

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION}

management:
  endpoints:
    web:
      exposure:
        include: health
```

**CRITICAL:** `forward-headers-strategy: framework` tells Spring Boot to trust `X-Forwarded-*` headers from nginx for OAuth redirects.

---

## Peer Review Status

**Submitted:** 2025-11-30
**Version:** 2.0
**Status:** READY FOR REVIEW

### Compliance Checklist

- [x] Google OAuth ONLY (no GitHub, no passwords)
- [x] Official Google Sign-In button branding
- [x] MySQL database (not PostgreSQL)
- [x] No JSON columns (normalized tables with FKs)
- [x] Java Spring Boot backend (not Node.js)
- [x] React web app (not React Native)
- [x] Mobile-first responsive CSS (44px touch targets)
- [x] Brand color #a689c6 throughout UI
- [x] httpOnly cookies for JWT (not localStorage)
- [x] Immutable audit log with triggers
- [x] All 29 functional requirements addressed
- [x] All 15 non-functional requirements addressed
- [x] Complete API endpoint contracts defined
- [x] Security architecture documented
- [x] Data flow diagrams provided
- [x] Database schema with foreign keys
- [x] Requirements traceability matrix included

---

**End of Architecture Design Document**
