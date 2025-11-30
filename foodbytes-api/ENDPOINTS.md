# FoodBytes API - Quick Endpoint Reference

## Base URL
```
http://localhost:8080/api
```

---

## Recipe Endpoints

### List All Recipes
```http
GET /api/recipes
Query Params: ?mealType={id}&search={name}
Auth: Public
```

### Get Recipe Details
```http
GET /api/recipes/{id}
Auth: Public
```

### Create Recipe
```http
POST /api/recipes
Auth: Admin Only
Body: CreateRecipeRequest
```

### Update Recipe
```http
PUT /api/recipes/{id}
Auth: Admin Only
Body: UpdateRecipeRequest
```

### Delete Recipe (Soft)
```http
DELETE /api/recipes/{id}
Auth: Admin Only
```

### Toggle Recipe Visibility
```http
PATCH /api/recipes/{id}/visibility
Auth: Admin Only
```

---

## Meal Plan Endpoints

### Get Meal Plan Entries
```http
GET /api/meal-plan?from={date}&to={date}
Query Params: from=YYYY-MM-DD, to=YYYY-MM-DD (both required)
Auth: User
```

### Create Meal Plan Entry
```http
POST /api/meal-plan
Auth: User
Body: CreateMealPlanRequest
Validation: FR-011 Cheat Meal Limit
```

### Update Meal Plan Entry
```http
PUT /api/meal-plan/{id}
Auth: User (Owner Only)
Body: UpdateMealPlanRequest
```

### Delete Meal Plan Entry
```http
DELETE /api/meal-plan/{id}
Auth: User (Owner Only)
```

---

## Reference Data Endpoints

### Get All Ingredients
```http
GET /api/ingredients
Query Params: ?aisleId={id} (optional)
Auth: Public
```

### Get All Aisles
```http
GET /api/aisles
Auth: Public
```

### Get All Units
```http
GET /api/units
Auth: Public
```

### Get All Meal Types
```http
GET /api/meals
Auth: Public
```

---

## Audit Log Endpoints (Admin Only)

### Get All Audit Logs
```http
GET /api/admin/audit
Auth: Admin Only
```

### Get Recipe Audit History
```http
GET /api/admin/audit/recipes/{recipeId}
Auth: Admin Only
```

---

## Quick Examples

### List Recipes for Lunch
```bash
curl http://localhost:8080/api/recipes?mealType=2
```

### Search Recipes
```bash
curl http://localhost:8080/api/recipes?search=chicken
```

### Create Meal Plan Entry
```bash
curl -X POST http://localhost:8080/api/meal-plan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planDate": "2025-01-15",
    "mealType": "LUNCH",
    "recipeId": 1,
    "servings": 2
  }'
```

### Get Week's Meal Plan
```bash
curl "http://localhost:8080/api/meal-plan?from=2025-01-15&to=2025-01-21" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Recipe (Admin)
```bash
curl -X POST http://localhost:8080/api/recipes \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grilled Chicken Salad",
    "defaultServings": 2,
    "calories": 350,
    "isCheat": false,
    "isLive": true,
    "ingredients": [
      {
        "ingredientId": 1,
        "quantity": 200,
        "unitId": 1,
        "displayOrder": 1
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Season the chicken"
      }
    ],
    "mealTypes": ["lunch", "dinner"]
  }'
```

---

## Response Status Codes

- `200 OK` - Successful GET/PUT/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Endpoint Count by Category

- **Recipes:** 6 endpoints
- **Meal Planning:** 4 endpoints
- **Reference Data:** 4 endpoints
- **Audit Logs:** 2 endpoints

**Total:** 16 endpoints
