# MySQL Database Context
> Reference material for mysql-database-agent

## DO / DO NOT

### DO NOT
- Do NOT create a migration script for recipes.js data
- Do NOT base schema design on recipes.js structure - design from requirements
- Do NOT store passwords (OAuth-only authentication)
- Do NOT store data in JSON format - use normalized tables instead
- Do NOT use JSON columns for arrays or nested data

### DO
- DO read the requirements document and design a schema that fulfills those requirements
- DO use recipes.js as a reference for understanding the data (ingredient names, recipe examples) but not as a schema template
- DO design normalized tables with proper relationships
- DO use junction/link tables for many-to-many relationships
- DO use foreign keys to reference existing tables
- DO implement triggers to prevent audit log modification (immutable audit)
- DO create indexes for common query patterns

## Design Guidance

### Schema Design Principles
1. **Design from Requirements** - The database schema should be derived from the application requirements, not from existing data structures
2. **Normalize Appropriately** - Use proper normalization (3NF minimum) while considering query performance
3. **Foreign Key Integrity** - All relationships must have proper foreign key constraints
4. **Soft Deletes** - Use `is_deleted` flags rather than hard deletes for audit trail
5. **Timestamps** - All tables should have `created_at` and `updated_at` timestamps

### Core Entities (derive from requirements)
The schema should support:
- **Users** - OAuth-authenticated users with admin flag
- **Recipes** - Meal recipes with ingredients and steps
- **Meal Plans** - User's planned meals by date and meal type
- **Audit Logs** - Immutable record of all recipe changes

### Data Types Guidance
| Data | Recommended Type |
|------|-----------------|
| IDs | INT UNSIGNED AUTO_INCREMENT |
| Strings (short) | VARCHAR(255) |
| Strings (long) | TEXT |
| Arrays/Lists | Junction table (NOT JSON) |
| Nested objects | Separate table with FK (NOT JSON) |
| Dates | DATE for calendar dates |
| Timestamps | TIMESTAMP or DATETIME |
| Booleans | BOOLEAN (TINYINT(1)) |
| Enums | ENUM type or lookup table |

### Why NOT JSON Columns

**DO NOT** store structured data in JSON columns. Use normalized tables instead.

| Bad (JSON) | Good (Normalized) |
|------------|-------------------|
| `ingredients JSON` column | `recipe_ingredients` junction table |
| `meal_types JSON` array | `recipe_meals` junction table |
| `steps JSON` array | `recipe_steps` table with FK |

**Problems with JSON columns:**
- Cannot use foreign key constraints
- Poor query performance for filtering/joining
- No referential integrity
- Harder to update individual items
- Cannot index nested values efficiently

### Junction Tables (Link Tables)

Use junction tables to create many-to-many relationships between entities.

**Example: Recipes can have multiple meal types, meal types can have multiple recipes**

```sql
-- Lookup table for meal types
CREATE TABLE `meals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `display_order` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`key`)
);

-- Junction table linking recipes to meals
CREATE TABLE `recipe_meals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` INT UNSIGNED NOT NULL,
  `meal_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_recipe_meal` (`recipe_id`, `meal_id`),
  CONSTRAINT `fk_recipe_meals_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recipe_meals_meal` FOREIGN KEY (`meal_id`)
    REFERENCES `meals` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);
```

**Query to get all meal types for a recipe:**
```sql
SELECT m.key, m.name
FROM recipe_meals rm
INNER JOIN meals m ON rm.meal_id = m.id
WHERE rm.recipe_id = 1;
```

### Foreign Key Relationships

Always use foreign keys to reference existing tables. This ensures data integrity.

**Example: Recipe ingredients reference the ingredients and units lookup tables**

```sql
-- Lookup tables (must exist first, in dependency order)
CREATE TABLE `aisles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `display_order` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`key`)
);

CREATE TABLE `units` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(50) NOT NULL,
  `value` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`key`)
);

CREATE TABLE `ingredients` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `aisle_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`key`),
  UNIQUE KEY `unique_name` (`name`),
  CONSTRAINT `fk_ingredients_aisle` FOREIGN KEY (`aisle_id`)
    REFERENCES `aisles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Recipe ingredients with FKs to existing tables
CREATE TABLE `recipe_ingredients` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` INT UNSIGNED NOT NULL,
  `ingredient_id` INT UNSIGNED NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `unit_id` INT UNSIGNED NOT NULL,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_recipe_ingredient` (`recipe_id`, `ingredient_id`),
  -- FK to recipes table
  CONSTRAINT `fk_recipe_ingredients_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  -- FK to ingredients lookup table
  CONSTRAINT `fk_recipe_ingredients_ingredient` FOREIGN KEY (`ingredient_id`)
    REFERENCES `ingredients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  -- FK to units lookup table
  CONSTRAINT `fk_recipe_ingredients_unit` FOREIGN KEY (`unit_id`)
    REFERENCES `units` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);
```

**FK Cascade Options:**
| Option | Use When |
|--------|----------|
| `ON DELETE CASCADE` | Child records should be deleted when parent is deleted (e.g., recipe_ingredients when recipe is deleted) |
| `ON DELETE RESTRICT` | Prevent deletion of parent if children exist (e.g., don't delete an ingredient if recipes use it) |
| `ON UPDATE CASCADE` | Update child FKs when parent PK changes (generally safe to use) |

### Child Tables with Foreign Keys

Use child tables instead of JSON arrays for ordered lists.

**Example: Recipe steps as a separate table**

```sql
CREATE TABLE `recipe_steps` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` INT UNSIGNED NOT NULL,
  `step_number` SMALLINT UNSIGNED NOT NULL,
  `instruction` TEXT NOT NULL,
  `tip` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_recipe_step` (`recipe_id`, `step_number`),
  CONSTRAINT `fk_recipe_steps_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
```

**Query to get all steps for a recipe in order:**
```sql
SELECT step_number, instruction, tip
FROM recipe_steps
WHERE recipe_id = 1
ORDER BY step_number;
```

### Index Strategy
Create indexes for:
- Foreign key columns (automatic with InnoDB)
- Columns used in WHERE clauses frequently
- Columns used in ORDER BY
- Composite indexes for multi-column queries

### Audit Log Requirements
- Recipe changes must be logged with old and new values
- Audit logs must be immutable (triggers prevent UPDATE/DELETE)
- Store user who made the change
- Store timestamp of change
- Store action type (CREATE, UPDATE, DELETE)

## Connection Configuration

```java
// Spring Boot application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/foodbytes
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
```

## Environment Variables
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=foodbytes
DB_USER=foodbytes_user
DB_PASSWORD=your_secure_password
```

## Backup Strategy
- Daily automated backups
- Point-in-time recovery enabled
- Backup retention: 30 days
- Test restore monthly

## Security Considerations
- Use parameterized queries (JPA handles this)
- Never store plaintext credentials
- Database user should have minimum required privileges
- Enable SSL for database connections in production
- Audit log table should have restricted write permissions
