# MySQL Database Context
> Reference material for mysql-database-agent

## Connection Configuration

```javascript
// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

## Environment Variables
```
DB_HOST=localhost
DB_USER=foodbytes_user
DB_PASSWORD=secure_password
DB_NAME=foodbytes
DB_PORT=3306
```

## Complete Schema

### Users Table
```sql
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  oauth_provider ENUM('google', 'github') NOT NULL,
  oauth_id VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,

  UNIQUE KEY unique_email (email),
  UNIQUE KEY unique_oauth (oauth_provider, oauth_id),
  INDEX idx_oauth_lookup (oauth_provider, oauth_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Recipes Table
```sql
CREATE TABLE recipes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  meal_types JSON NOT NULL COMMENT '["breakfast", "lunch", "dinner", "snacks"]',
  default_servings TINYINT UNSIGNED NOT NULL DEFAULT 2,
  calories INT UNSIGNED NOT NULL,
  ingredients JSON NOT NULL COMMENT '[{name, quantity, unit}, ...]',
  steps JSON NOT NULL COMMENT '["Step 1", "Step 2", ...]',
  is_cheat BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE COMMENT 'Soft delete flag',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_is_deleted (is_deleted),
  INDEX idx_is_cheat (is_cheat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Meal Plan Entries Table
```sql
CREATE TABLE meal_plan_entries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  plan_date DATE NOT NULL,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snacks') NOT NULL,
  recipe_id INT UNSIGNED NOT NULL,
  servings TINYINT UNSIGNED NOT NULL DEFAULT 2,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE RESTRICT,

  UNIQUE KEY unique_user_date_meal (user_id, plan_date, meal_type),
  INDEX idx_user_date_range (user_id, plan_date),
  INDEX idx_plan_date (plan_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Recipe Audit Log Table
```sql
CREATE TABLE recipe_audit_log (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipe_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
  old_values JSON NULL COMMENT 'Complete snapshot before change',
  new_values JSON NULL COMMENT 'Complete snapshot after change',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,

  INDEX idx_recipe_id (recipe_id),
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prevent modifications to audit log
DELIMITER //
CREATE TRIGGER prevent_audit_update
BEFORE UPDATE ON recipe_audit_log
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Audit log records cannot be modified';
END//

CREATE TRIGGER prevent_audit_delete
BEFORE DELETE ON recipe_audit_log
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Audit log records cannot be deleted';
END//
DELIMITER ;
```

### Archived Meal Plans Table (6-month retention)
```sql
CREATE TABLE meal_plan_entries_archive (
  id INT UNSIGNED PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  plan_date DATE NOT NULL,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snacks') NOT NULL,
  recipe_id INT UNSIGNED NOT NULL,
  servings TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL,
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_plan_date (plan_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Common Queries

### User Queries
```sql
-- Find or create user from OAuth
INSERT INTO users (email, name, oauth_provider, oauth_id, last_login)
VALUES (?, ?, ?, ?, NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  last_login = NOW();

-- Get user by OAuth credentials
SELECT id, email, name, is_admin, created_at
FROM users
WHERE oauth_provider = ? AND oauth_id = ?;

-- Get user by ID
SELECT id, email, name, is_admin, oauth_provider, created_at, last_login
FROM users
WHERE id = ?;
```

### Recipe Queries
```sql
-- Get all active recipes
SELECT id, name, meal_types, default_servings, calories, ingredients, steps, is_cheat
FROM recipes
WHERE is_deleted = FALSE
ORDER BY name;

-- Get recipes by meal type
SELECT id, name, meal_types, default_servings, calories, ingredients, steps, is_cheat
FROM recipes
WHERE is_deleted = FALSE
  AND JSON_CONTAINS(meal_types, ?)
ORDER BY is_cheat, name;

-- Get single recipe
SELECT id, name, meal_types, default_servings, calories, ingredients, steps, is_cheat
FROM recipes
WHERE id = ? AND is_deleted = FALSE;

-- Create recipe (admin)
INSERT INTO recipes (name, meal_types, default_servings, calories, ingredients, steps, is_cheat)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Update recipe (admin)
UPDATE recipes
SET name = ?, meal_types = ?, default_servings = ?, calories = ?,
    ingredients = ?, steps = ?, is_cheat = ?
WHERE id = ? AND is_deleted = FALSE;

-- Soft delete recipe (admin)
UPDATE recipes
SET is_deleted = TRUE
WHERE id = ?;
```

### Meal Plan Queries
```sql
-- Get meal plan entries for date range
SELECT
  mpe.id,
  mpe.plan_date,
  mpe.meal_type,
  mpe.servings,
  r.id AS recipe_id,
  r.name AS recipe_name,
  r.calories,
  r.ingredients
FROM meal_plan_entries mpe
JOIN recipes r ON mpe.recipe_id = r.id
WHERE mpe.user_id = ?
  AND mpe.plan_date BETWEEN ? AND ?
ORDER BY mpe.plan_date, FIELD(mpe.meal_type, 'breakfast', 'lunch', 'dinner', 'snacks');

-- Add meal plan entry
INSERT INTO meal_plan_entries (user_id, plan_date, meal_type, recipe_id, servings)
VALUES (?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
  recipe_id = VALUES(recipe_id),
  servings = VALUES(servings);

-- Update meal plan entry
UPDATE meal_plan_entries
SET recipe_id = ?, servings = ?
WHERE id = ? AND user_id = ?;

-- Delete meal plan entry
DELETE FROM meal_plan_entries
WHERE id = ? AND user_id = ?;
```

### Shopping List Query
```sql
-- Aggregate ingredients for date range
SELECT
  r.id AS recipe_id,
  r.ingredients,
  r.default_servings,
  mpe.servings AS planned_servings
FROM meal_plan_entries mpe
JOIN recipes r ON mpe.recipe_id = r.id
WHERE mpe.user_id = ?
  AND mpe.plan_date BETWEEN ? AND ?;
-- Note: Ingredient aggregation done in application code
```

### Audit Queries
```sql
-- Log recipe change
INSERT INTO recipe_audit_log (recipe_id, user_id, action, old_values, new_values)
VALUES (?, ?, ?, ?, ?);

-- Get audit log for recipe
SELECT
  ral.id,
  ral.action,
  ral.old_values,
  ral.new_values,
  ral.timestamp,
  u.name AS admin_name,
  u.email AS admin_email
FROM recipe_audit_log ral
JOIN users u ON ral.user_id = u.id
WHERE ral.recipe_id = ?
ORDER BY ral.timestamp DESC;

-- Get all audit logs (with pagination)
SELECT
  ral.id,
  ral.recipe_id,
  r.name AS recipe_name,
  ral.action,
  ral.timestamp,
  u.name AS admin_name
FROM recipe_audit_log ral
JOIN recipes r ON ral.recipe_id = r.id
JOIN users u ON ral.user_id = u.id
ORDER BY ral.timestamp DESC
LIMIT ? OFFSET ?;
```

### Data Retention (Archive old entries)
```sql
-- Archive entries older than 6 months
INSERT INTO meal_plan_entries_archive
  (id, user_id, plan_date, meal_type, recipe_id, servings, created_at)
SELECT id, user_id, plan_date, meal_type, recipe_id, servings, created_at
FROM meal_plan_entries
WHERE plan_date < DATE_SUB(CURDATE(), INTERVAL 6 MONTH);

-- Delete archived entries from main table
DELETE FROM meal_plan_entries
WHERE plan_date < DATE_SUB(CURDATE(), INTERVAL 6 MONTH);
```

## Indexes Explained

| Table | Index | Purpose |
|-------|-------|---------|
| users | unique_oauth | Fast OAuth lookup on login |
| recipes | idx_is_deleted | Filter active recipes |
| meal_plan_entries | idx_user_date_range | Date range queries |
| meal_plan_entries | unique_user_date_meal | Prevent duplicate entries |
| recipe_audit_log | idx_recipe_id | Audit history for recipe |
| recipe_audit_log | idx_timestamp | Chronological audit view |

## Backup Strategy
- Daily automated backups
- Point-in-time recovery enabled
- Backup retention: 30 days
- Test restore monthly
