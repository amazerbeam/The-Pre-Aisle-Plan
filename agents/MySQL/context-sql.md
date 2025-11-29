# MySQL Database Context
> Reference material for mysql-database-agent

## Connection Configuration

```javascript
// config/database.js
const mysql = require('mysql2/promise');

#DO / DO NOT

#DO NOT
- Do NOT create a migration scirpt for recipes.js

#DO
-DO Read the requirements and design a database schema that can handle the requirements

## Backup Strategy
- Daily automated backups
- Point-in-time recovery enabled
- Backup retention: 30 days
- Test restore monthly
