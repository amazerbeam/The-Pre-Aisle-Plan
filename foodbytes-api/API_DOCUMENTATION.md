# FoodBytes API Documentation

## Overview
Complete REST API backend for FoodBytes meal planning application.

## Base URL
```
http://localhost:8080/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### 1. Recipe Management

#### Get All Recipes
```http
GET /api/recipes
```

**Query Parameters:**
- `mealType` (optional): Filter by meal type ID
- `search` (optional): Search recipes by name

**Response:**
```json
[
  {
    "id": 1,
    "name": "Grilled Chicken Salad",
    "defaultServings": 2,
    "calories": 350,
    "isCheat": false,
    "isLive": true,
    "mealTypes": ["lunch", "dinner"],
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:30:00"
  }
]
```

#### Get Recipe by ID
```http
GET /api/recipes/{id}
```

**Response:**
```json
{
  "id": 1,
  "name": "Grilled Chicken Salad",
  "defaultServings": 2,
  "calories": 350,
  "isCheat": false,
  "isLive": true,
  "isDeleted": false,
  "createdAt": "2025-01-15T10:30:00",
  "updatedAt": "2025-01-15T10:30:00",
  "ingredients": [
    {
      "id": 1,
      "ingredientId": 10,
      "ingredientName": "Chicken Breast",
      "ingredientKey": "chicken_breast",
      "quantity": 200,
      "unitId": 5,
      "unitValue": "g",
      "unitKey": "grams",
      "displayOrder": 1
    }
  ],
  "steps": [
    {
      "id": 1,
      "stepNumber": 1,
      "instruction": "Season chicken with salt and pepper"
    }
  ],
  "mealTypes": ["lunch", "dinner"]
}
```

#### Create Recipe (Admin Only)
```http
POST /api/recipes
```

**Request Body:**
```json
{
  "name": "New Recipe",
  "defaultServings": 2,
  "calories": 400,
  "isCheat": false,
  "isLive": true,
  "ingredients": [
    {
      "ingredientId": 10,
      "quantity": 200,
      "unitId": 5,
      "displayOrder": 1
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "First step"
    }
  ],
  "mealTypes": ["lunch", "dinner"]
}
```

**Response:** 201 Created with recipe object

#### Update Recipe (Admin Only)
```http
PUT /api/recipes/{id}
```

**Request Body:** Same as Create Recipe

**Response:** 200 OK with updated recipe object

#### Delete Recipe (Admin Only)
```http
DELETE /api/recipes/{id}
```

**Response:** 204 No Content

#### Toggle Recipe Visibility (Admin Only)
```http
PATCH /api/recipes/{id}/visibility
```

**Response:** 200 OK with updated recipe object

---

### 2. Meal Plan Management

#### Get Meal Plan Entries
```http
GET /api/meal-plan?from=2025-01-15&to=2025-01-21
```

**Query Parameters:**
- `from` (required): Start date (ISO format: YYYY-MM-DD)
- `to` (required): End date (ISO format: YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": 1,
    "userId": 5,
    "planDate": "2025-01-15",
    "mealType": "LUNCH",
    "recipeId": 10,
    "recipeName": "Grilled Chicken Salad",
    "isCheat": false,
    "calories": 350,
    "servings": 2,
    "createdAt": "2025-01-14T10:30:00",
    "updatedAt": "2025-01-14T10:30:00"
  }
]
```

#### Create Meal Plan Entry
```http
POST /api/meal-plan
```

**Request Body:**
```json
{
  "planDate": "2025-01-15",
  "mealType": "LUNCH",
  "recipeId": 10,
  "servings": 2
}
```

**Validation:**
- Validates cheat meal limits (FR-011: max 1 cheat meal per meal type per week)

**Response:** 201 Created with meal plan entry object

#### Update Meal Plan Entry (Servings Only)
```http
PUT /api/meal-plan/{id}
```

**Request Body:**
```json
{
  "servings": 3
}
```

**Response:** 200 OK with updated meal plan entry object

#### Delete Meal Plan Entry
```http
DELETE /api/meal-plan/{id}
```

**Response:** 204 No Content

---

### 3. Reference Data

#### Get All Ingredients
```http
GET /api/ingredients
```

**Query Parameters:**
- `aisleId` (optional): Filter by aisle ID

**Response:**
```json
[
  {
    "id": 1,
    "key": "chicken_breast",
    "name": "Chicken Breast",
    "aisleId": 5,
    "aisleName": "Meat & Poultry",
    "aisleColor": "#FF6B6B"
  }
]
```

#### Get All Aisles
```http
GET /api/aisles
```

**Response:**
```json
[
  {
    "id": 1,
    "key": "produce",
    "name": "Produce",
    "displayOrder": 1,
    "color": "#4ECDC4"
  }
]
```

#### Get All Units
```http
GET /api/units
```

**Response:**
```json
[
  {
    "id": 1,
    "key": "grams",
    "value": "g",
    "category": "weight"
  }
]
```

#### Get All Meal Types
```http
GET /api/meals
```

**Response:**
```json
[
  {
    "id": 1,
    "key": "breakfast",
    "name": "Breakfast",
    "displayOrder": 1
  }
]
```

---

### 4. Audit Logs (Admin Only)

#### Get All Audit Logs
```http
GET /api/admin/audit
```

**Response:**
```json
[
  {
    "id": 1,
    "recipeId": 10,
    "recipeName": "Grilled Chicken Salad",
    "userId": 2,
    "userName": "Admin User",
    "action": "CREATE",
    "oldValues": null,
    "newValues": "{\"id\":10,\"name\":\"Grilled Chicken Salad\",...}",
    "timestamp": "2025-01-15T10:30:00"
  }
]
```

#### Get Audit Logs for Recipe
```http
GET /api/admin/audit/recipes/{recipeId}
```

**Response:** Array of audit log objects for the specified recipe

---

## Security

### Admin Endpoints
The following endpoints require admin role (`ROLE_ADMIN`):
- POST /api/recipes
- PUT /api/recipes/{id}
- DELETE /api/recipes/{id}
- PATCH /api/recipes/{id}/visibility
- GET /api/admin/audit
- GET /api/admin/audit/recipes/{recipeId}

### User Endpoints
These endpoints are accessible to authenticated users:
- All meal plan endpoints
- User can only access their own meal plan entries

### Public Endpoints
These endpoints are accessible without authentication:
- GET /api/recipes
- GET /api/recipes/{id}
- GET /api/ingredients
- GET /api/aisles
- GET /api/units
- GET /api/meals

---

## Business Rules

### FR-011: Cheat Meal Limits
- Users can only schedule **1 cheat meal per meal type per week**
- Week is calculated from Monday to Sunday
- Validation occurs when creating a new meal plan entry
- Error message: "Cheat meal limit exceeded. You can only have 1 cheat meal per meal type per week. You already have a cheat [meal type] scheduled for this week."

### Recipe Visibility
- Non-admin users only see recipes where `isLive = true`
- Admin users see all recipes where `isDeleted = false`
- Soft delete: Setting `isDeleted = true` hides the recipe from all users

### Audit Logging
- All recipe CREATE, UPDATE, DELETE operations are logged
- Audit log includes:
  - User who performed the action
  - Timestamp
  - Old values (before change)
  - New values (after change)
- Stored as JSON in the database

---

## Error Responses

All error responses follow this format:
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/recipes"
}
```

Common HTTP Status Codes:
- `200 OK` - Successful GET/PUT/PATCH request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Validation error or business rule violation
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User doesn't have required permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Database Schema

### Tables Created:
1. **recipes** - Main recipe information
2. **recipe_ingredients** - Recipe ingredients with quantities
3. **recipe_steps** - Step-by-step instructions
4. **recipe_meals** - Recipe to meal type mapping
5. **ingredients** - Master list of ingredients
6. **aisles** - Grocery store aisles
7. **units** - Measurement units
8. **meals** - Meal types (breakfast, lunch, dinner, snacks)
9. **meal_plan_entries** - User meal plans
10. **recipe_audit_log** - Audit trail for recipe changes

---

## Notes for Frontend Integration

1. **Authentication**: Store JWT token from OAuth2 login and include in all requests
2. **Admin Features**: Check user's `isAdmin` flag to show/hide admin UI
3. **Date Format**: Use ISO 8601 format (YYYY-MM-DD) for dates
4. **Cheat Meals**: Display warning before adding cheat meals
5. **Recipe Visibility**: Admin can toggle `isLive` to control user visibility
6. **Audit Trail**: Admin can view complete change history for recipes
