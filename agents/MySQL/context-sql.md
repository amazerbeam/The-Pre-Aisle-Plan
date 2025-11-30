# MySQL Database Context
> Reference material for mysql-database-agent

## DO / DO NOT

### DO NOT
- Do NOT create a migration script for recipes.js data
- Do NOT base schema design on recipes.js structure - design from requirements
- Do NOT store passwords (OAuth-only authentication)

### DO
- DO read the requirements document and design a schema that fulfills those requirements
- DO use recipes.js as a reference for understanding the data (ingredient names, recipe examples) but not as a schema template
- DO design normalized tables with proper relationships
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
| IDs | INT AUTO_INCREMENT or BIGINT |
| Strings (short) | VARCHAR(255) |
| Strings (long) | TEXT |
| JSON data | JSON column type (MySQL 8+) |
| Dates | DATE for calendar dates |
| Timestamps | TIMESTAMP or DATETIME |
| Booleans | BOOLEAN (TINYINT(1)) |
| Enums | ENUM type or lookup table |

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
