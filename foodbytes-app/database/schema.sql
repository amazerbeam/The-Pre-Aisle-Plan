-- FoodBytes Database Schema (Normalized)
-- MySQL 8.0+ compatible
-- UTF8MB4 for emoji support

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS `recipe_audit_log`;
DROP TABLE IF EXISTS `meal_plan_entries`;
DROP TABLE IF EXISTS `recipe_steps`;
DROP TABLE IF EXISTS `recipe_ingredients`;
DROP TABLE IF EXISTS `recipe_meals`;
DROP TABLE IF EXISTS `recipes`;
DROP TABLE IF EXISTS `meals`;
DROP TABLE IF EXISTS `ingredients`;
DROP TABLE IF EXISTS `aisles`;
DROP TABLE IF EXISTS `units`;
DROP TABLE IF EXISTS `users`;

-- ===========================
-- USERS TABLE
-- ===========================
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `oauth_provider` ENUM('GOOGLE') NOT NULL COMMENT 'Google OAuth only - no GitHub',
  `oauth_id` VARCHAR(255) NOT NULL,
  `is_admin` BOOLEAN NOT NULL DEFAULT FALSE,
  `default_servings` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'User preferred default serving size (1-10)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  UNIQUE KEY `unique_oauth` (`oauth_provider`, `oauth_id`),
  INDEX `idx_is_admin` (`is_admin`),
  INDEX `idx_last_login` (`last_login`),
  CONSTRAINT `chk_default_servings` CHECK (`default_servings` BETWEEN 1 AND 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- UNITS TABLE
-- ===========================
CREATE TABLE `units` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(50) NOT NULL,
  `value` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`key`),
  UNIQUE KEY `unique_value` (`value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- AISLES TABLE
-- ===========================
CREATE TABLE `aisles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `display_order` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`key`),
  UNIQUE KEY `unique_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- MEALS TABLE (Lookup)
-- ===========================
CREATE TABLE `meals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `display_order` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`key`),
  UNIQUE KEY `unique_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- INGREDIENTS TABLE
-- ===========================
CREATE TABLE `ingredients` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `aisle_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`key`),
  UNIQUE KEY `unique_name` (`name`),
  INDEX `idx_aisle_id` (`aisle_id`),
  CONSTRAINT `fk_ingredients_aisle` FOREIGN KEY (`aisle_id`)
    REFERENCES `aisles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- RECIPES TABLE (Normalized - no JSON columns)
-- ===========================
CREATE TABLE `recipes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `default_servings` TINYINT UNSIGNED NOT NULL,
  `calories` SMALLINT UNSIGNED NOT NULL COMMENT 'Total calories for default_servings',
  `is_cheat` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_live` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Visibility: true=all users, false=admin only',
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Soft delete flag',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_is_live` (`is_live`),
  INDEX `idx_is_deleted` (`is_deleted`),
  INDEX `idx_is_cheat` (`is_cheat`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_updated_at` (`updated_at`),
  INDEX `idx_recipes_live_cheat` (`is_live`, `is_cheat`, `is_deleted`),
  FULLTEXT INDEX `ft_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- RECIPE_MEALS TABLE (Junction: Recipe <-> Meal)
-- ===========================
CREATE TABLE `recipe_meals` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` INT UNSIGNED NOT NULL,
  `meal_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_recipe_meal` (`recipe_id`, `meal_id`),
  INDEX `idx_recipe_id` (`recipe_id`),
  INDEX `idx_meal_id` (`meal_id`),
  CONSTRAINT `fk_recipe_meals_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recipe_meals_meal` FOREIGN KEY (`meal_id`)
    REFERENCES `meals` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- RECIPE_INGREDIENTS TABLE (Junction: Recipe <-> Ingredient with quantity)
-- ===========================
CREATE TABLE `recipe_ingredients` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` INT UNSIGNED NOT NULL,
  `ingredient_id` INT UNSIGNED NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `unit_id` INT UNSIGNED NOT NULL,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_recipe_ingredient` (`recipe_id`, `ingredient_id`),
  INDEX `idx_recipe_id` (`recipe_id`),
  INDEX `idx_ingredient_id` (`ingredient_id`),
  INDEX `idx_unit_id` (`unit_id`),
  CONSTRAINT `fk_recipe_ingredients_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recipe_ingredients_ingredient` FOREIGN KEY (`ingredient_id`)
    REFERENCES `ingredients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_recipe_ingredients_unit` FOREIGN KEY (`unit_id`)
    REFERENCES `units` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- RECIPE_STEPS TABLE
-- ===========================
CREATE TABLE `recipe_steps` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` INT UNSIGNED NOT NULL,
  `step_number` SMALLINT UNSIGNED NOT NULL,
  `instruction` TEXT NOT NULL,
  `tip` TEXT NULL COMMENT 'Optional tip or note for this step',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_recipe_step` (`recipe_id`, `step_number`),
  INDEX `idx_recipe_id` (`recipe_id`),
  CONSTRAINT `fk_recipe_steps_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- MEAL PLAN ENTRIES TABLE
-- ===========================
CREATE TABLE `meal_plan_entries` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `plan_date` DATE NOT NULL,
  `meal_id` INT UNSIGNED NOT NULL,
  `recipe_id` INT UNSIGNED NOT NULL,
  `servings` TINYINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date_meal` (`user_id`, `plan_date`, `meal_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_plan_date` (`plan_date`),
  INDEX `idx_meal_id` (`meal_id`),
  INDEX `idx_recipe_id` (`recipe_id`),
  INDEX `idx_user_date_range` (`user_id`, `plan_date`),
  INDEX `idx_meal_plan_date_user` (`plan_date`, `user_id`),
  CONSTRAINT `fk_meal_plan_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_meal_plan_meal` FOREIGN KEY (`meal_id`)
    REFERENCES `meals` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_meal_plan_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- RECIPE AUDIT LOG TABLE
-- ===========================
CREATE TABLE `recipe_audit_log` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `action` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
  `old_values` JSON NULL COMMENT 'Snapshot of previous values',
  `new_values` JSON NULL COMMENT 'Snapshot of new values',
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_recipe_id` (`recipe_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_timestamp` (`timestamp`),
  CONSTRAINT `fk_audit_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- TRIGGERS TO ENFORCE IMMUTABILITY ON AUDIT LOG
-- ===========================

DELIMITER $$

-- Prevent UPDATE on audit log
CREATE TRIGGER `prevent_audit_log_update`
BEFORE UPDATE ON `recipe_audit_log`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Updates to recipe_audit_log are not permitted. This is an append-only table.';
END$$

-- Prevent DELETE on audit log
CREATE TRIGGER `prevent_audit_log_delete`
BEFORE DELETE ON `recipe_audit_log`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deletes from recipe_audit_log are not permitted. This is an append-only table.';
END$$

DELIMITER ;

-- ===========================
-- VIEWS FOR COMMON QUERIES
-- ===========================

-- View for active (non-deleted) live recipes with meal types
CREATE OR REPLACE VIEW `v_live_recipes` AS
SELECT
  r.`id`,
  r.`name`,
  r.`default_servings`,
  r.`calories`,
  r.`is_cheat`,
  r.`created_at`,
  r.`updated_at`,
  GROUP_CONCAT(DISTINCT m.`key` ORDER BY m.`display_order` SEPARATOR ',') AS `meal_types`
FROM `recipes` r
LEFT JOIN `recipe_meals` rm ON r.`id` = rm.`recipe_id`
LEFT JOIN `meals` m ON rm.`meal_id` = m.`id`
WHERE r.`is_live` = TRUE AND r.`is_deleted` = FALSE
GROUP BY r.`id`;

-- View for admin to see all recipes including hidden
CREATE OR REPLACE VIEW `v_all_recipes` AS
SELECT
  r.`id`,
  r.`name`,
  r.`default_servings`,
  r.`calories`,
  r.`is_cheat`,
  r.`is_live`,
  r.`is_deleted`,
  r.`created_at`,
  r.`updated_at`,
  GROUP_CONCAT(DISTINCT m.`key` ORDER BY m.`display_order` SEPARATOR ',') AS `meal_types`
FROM `recipes` r
LEFT JOIN `recipe_meals` rm ON r.`id` = rm.`recipe_id`
LEFT JOIN `meals` m ON rm.`meal_id` = m.`id`
WHERE r.`is_deleted` = FALSE
GROUP BY r.`id`;

-- View for meal plan with recipe details
CREATE OR REPLACE VIEW `v_meal_plan_with_recipes` AS
SELECT
  mpe.`id`,
  mpe.`user_id`,
  mpe.`plan_date`,
  m.`key` AS `meal_type`,
  m.`name` AS `meal_name`,
  mpe.`servings`,
  mpe.`created_at`,
  mpe.`updated_at`,
  r.`id` AS `recipe_id`,
  r.`name` AS `recipe_name`,
  r.`default_servings`,
  r.`calories`,
  r.`is_cheat`,
  ROUND((r.`calories` / r.`default_servings` * mpe.`servings`), 0) AS `meal_calories`
FROM `meal_plan_entries` mpe
INNER JOIN `recipes` r ON mpe.`recipe_id` = r.`id`
INNER JOIN `meals` m ON mpe.`meal_id` = m.`id`
WHERE r.`is_deleted` = FALSE;

-- View for shopping list ingredient aggregation helper
CREATE OR REPLACE VIEW `v_ingredient_lookup` AS
SELECT
  i.`id`,
  i.`key`,
  i.`name`,
  a.`name` AS `aisle_name`,
  a.`display_order` AS `aisle_order`
FROM `ingredients` i
INNER JOIN `aisles` a ON i.`aisle_id` = a.`id`;

-- View for recipe ingredients with details
CREATE OR REPLACE VIEW `v_recipe_ingredients` AS
SELECT
  ri.`id`,
  ri.`recipe_id`,
  r.`name` AS `recipe_name`,
  ri.`display_order`,
  i.`id` AS `ingredient_id`,
  i.`key` AS `ingredient_key`,
  i.`name` AS `ingredient_name`,
  ri.`quantity`,
  u.`key` AS `unit_key`,
  u.`value` AS `unit_value`,
  a.`name` AS `aisle_name`,
  a.`display_order` AS `aisle_order`
FROM `recipe_ingredients` ri
INNER JOIN `recipes` r ON ri.`recipe_id` = r.`id`
INNER JOIN `ingredients` i ON ri.`ingredient_id` = i.`id`
INNER JOIN `units` u ON ri.`unit_id` = u.`id`
INNER JOIN `aisles` a ON i.`aisle_id` = a.`id`
ORDER BY ri.`recipe_id`, ri.`display_order`;

-- View for recipe steps
CREATE OR REPLACE VIEW `v_recipe_steps` AS
SELECT
  rs.`id`,
  rs.`recipe_id`,
  r.`name` AS `recipe_name`,
  rs.`step_number`,
  rs.`instruction`,
  rs.`tip`
FROM `recipe_steps` rs
INNER JOIN `recipes` r ON rs.`recipe_id` = r.`id`
ORDER BY rs.`recipe_id`, rs.`step_number`;

-- ===========================
-- COMMENTS
-- ===========================

ALTER TABLE `users` COMMENT = 'User accounts via OAuth authentication';
ALTER TABLE `units` COMMENT = 'Measurement units for ingredient quantities';
ALTER TABLE `aisles` COMMENT = 'Grocery store aisle definitions for shopping list organization';
ALTER TABLE `meals` COMMENT = 'Meal type lookup (breakfast, lunch, dinner, snacks)';
ALTER TABLE `ingredients` COMMENT = 'Master ingredient list with aisle assignments';
ALTER TABLE `recipes` COMMENT = 'Recipe definitions (normalized - no JSON)';
ALTER TABLE `recipe_meals` COMMENT = 'Junction table: recipes to meals (many-to-many)';
ALTER TABLE `recipe_ingredients` COMMENT = 'Junction table: recipes to ingredients with quantities';
ALTER TABLE `recipe_steps` COMMENT = 'Recipe cooking steps with optional tips';
ALTER TABLE `meal_plan_entries` COMMENT = 'User meal plans with recipe assignments to calendar dates';
ALTER TABLE `recipe_audit_log` COMMENT = 'Immutable audit trail of all recipe modifications';
