-- FoodBytes Database Schema
-- Phase 2: Database Design (Rebuild)
-- Follows normalized design - NO JSON columns for structured data
-- Uses foreign keys for all relationships

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Drop tables in reverse dependency order if they exist
DROP TABLE IF EXISTS `recipe_audit_log`;
DROP TABLE IF EXISTS `meal_plan_entries`;
DROP TABLE IF EXISTS `recipe_steps`;
DROP TABLE IF EXISTS `recipe_ingredients`;
DROP TABLE IF EXISTS `recipe_meals`;
DROP TABLE IF EXISTS `recipes`;
DROP TABLE IF EXISTS `ingredients`;
DROP TABLE IF EXISTS `aisles`;
DROP TABLE IF EXISTS `units`;
DROP TABLE IF EXISTS `meals`;
DROP TABLE IF EXISTS `users`;

-- ============================================
-- LOOKUP TABLES (Reference Data)
-- ============================================

-- Meal types lookup table
CREATE TABLE `meals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `display_order` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`key`),
  UNIQUE KEY `unique_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Grocery aisles lookup table
CREATE TABLE `aisles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `display_order` TINYINT UNSIGNED NOT NULL,
  `color` VARCHAR(7) NOT NULL DEFAULT '#bdc3c7',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`key`),
  UNIQUE KEY `unique_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Measurement units lookup table
CREATE TABLE `units` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(50) NOT NULL,
  `value` VARCHAR(20) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'general',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table (OAuth only - no passwords)
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `oauth_provider` ENUM('GOOGLE') NOT NULL,
  `oauth_id` VARCHAR(255) NOT NULL,
  `is_admin` BOOLEAN NOT NULL DEFAULT FALSE,
  `default_servings` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  UNIQUE KEY `unique_oauth` (`oauth_provider`, `oauth_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ingredients master table
CREATE TABLE `ingredients` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `aisle_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`key`),
  UNIQUE KEY `unique_name` (`name`),
  CONSTRAINT `fk_ingredients_aisle` FOREIGN KEY (`aisle_id`)
    REFERENCES `aisles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recipes table
CREATE TABLE `recipes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `default_servings` TINYINT UNSIGNED NOT NULL DEFAULT 2,
  `calories` INT UNSIGNED NOT NULL,
  `is_cheat` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_live` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_is_live` (`is_live`),
  INDEX `idx_is_deleted` (`is_deleted`),
  INDEX `idx_live_deleted` (`is_live`, `is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- JUNCTION/RELATIONSHIP TABLES
-- ============================================

-- Recipe to meal type junction (many-to-many)
CREATE TABLE `recipe_meals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `meal_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_recipe_meal` (`recipe_id`, `meal_id`),
  CONSTRAINT `fk_recipe_meals_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recipe_meals_meal` FOREIGN KEY (`meal_id`)
    REFERENCES `meals` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recipe ingredients (child table with FKs)
CREATE TABLE `recipe_ingredients` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `ingredient_id` BIGINT UNSIGNED NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `unit_id` BIGINT UNSIGNED NOT NULL,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_recipe_id` (`recipe_id`),
  CONSTRAINT `fk_recipe_ingredients_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_recipe_ingredients_ingredient` FOREIGN KEY (`ingredient_id`)
    REFERENCES `ingredients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_recipe_ingredients_unit` FOREIGN KEY (`unit_id`)
    REFERENCES `units` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recipe cooking steps (child table)
CREATE TABLE `recipe_steps` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `step_number` SMALLINT UNSIGNED NOT NULL,
  `instruction` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_recipe_step` (`recipe_id`, `step_number`),
  CONSTRAINT `fk_recipe_steps_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER DATA TABLES
-- ============================================

-- Meal plan entries
CREATE TABLE `meal_plan_entries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `plan_date` DATE NOT NULL,
  `meal_type` ENUM('BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS') NOT NULL,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `servings` TINYINT UNSIGNED NOT NULL DEFAULT 2,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_date` (`user_id`, `plan_date`),
  INDEX `idx_plan_date` (`plan_date`),
  CONSTRAINT `fk_meal_plan_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_meal_plan_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUDIT TABLE (Immutable)
-- ============================================

-- Recipe audit log (append-only)
-- Note: old_values and new_values use JSON for audit snapshots only
-- This is acceptable per requirements - audit data is unstructured by nature
CREATE TABLE `recipe_audit_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipe_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `action` ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
  `old_values` JSON NULL,
  `new_values` JSON NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_recipe_id` (`recipe_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_timestamp` (`timestamp`),
  CONSTRAINT `fk_audit_recipe` FOREIGN KEY (`recipe_id`)
    REFERENCES `recipes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGERS (Prevent Audit Log Modification)
-- ============================================

DELIMITER //

-- Prevent UPDATE on audit log
CREATE TRIGGER `prevent_audit_update`
BEFORE UPDATE ON `recipe_audit_log`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Updates to recipe_audit_log are not permitted. Audit log is append-only.';
END//

-- Prevent DELETE on audit log
CREATE TRIGGER `prevent_audit_delete`
BEFORE DELETE ON `recipe_audit_log`
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
  SET MESSAGE_TEXT = 'Deletes from recipe_audit_log are not permitted. Audit log is append-only.';
END//

DELIMITER ;
