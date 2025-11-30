-- FoodBytes Database Schema
-- MySQL 8.0+ compatible
-- UTF8MB4 for emoji support

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS `recipe_audit_log`;
DROP TABLE IF EXISTS `meal_plan_entries`;
DROP TABLE IF EXISTS `recipes`;
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
  `oauth_provider` ENUM('google', 'github') NOT NULL,
  `oauth_id` VARCHAR(255) NOT NULL,
  `is_admin` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  UNIQUE KEY `unique_oauth` (`oauth_provider`, `oauth_id`),
  INDEX `idx_is_admin` (`is_admin`),
  INDEX `idx_last_login` (`last_login`)
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
-- RECIPES TABLE
-- ===========================
CREATE TABLE `recipes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `meal_types` JSON NOT NULL COMMENT 'Array of meal types: breakfast, lunch, dinner, snacks',
  `default_servings` TINYINT UNSIGNED NOT NULL,
  `calories` SMALLINT UNSIGNED NOT NULL COMMENT 'Total calories for default_servings',
  `ingredients` JSON NOT NULL COMMENT 'Array of {name, quantity, unit}',
  `steps` JSON NOT NULL COMMENT 'Array of cooking instruction strings',
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
  FULLTEXT INDEX `ft_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================
-- MEAL PLAN ENTRIES TABLE
-- ===========================
CREATE TABLE `meal_plan_entries` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `plan_date` DATE NOT NULL,
  `meal_type` ENUM('breakfast', 'lunch', 'dinner', 'snacks') NOT NULL,
  `recipe_id` INT UNSIGNED NOT NULL,
  `servings` TINYINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date_meal` (`user_id`, `plan_date`, `meal_type`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_plan_date` (`plan_date`),
  INDEX `idx_recipe_id` (`recipe_id`),
  INDEX `idx_user_date_range` (`user_id`, `plan_date`),
  CONSTRAINT `fk_meal_plan_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
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
  `old_values` JSON NULL COMMENT 'Complete snapshot of previous values',
  `new_values` JSON NULL COMMENT 'Complete snapshot of new values',
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

-- View for active (non-deleted) live recipes
CREATE OR REPLACE VIEW `v_live_recipes` AS
SELECT
  `id`,
  `name`,
  `meal_types`,
  `default_servings`,
  `calories`,
  `ingredients`,
  `steps`,
  `is_cheat`,
  `created_at`,
  `updated_at`
FROM `recipes`
WHERE `is_live` = TRUE AND `is_deleted` = FALSE;

-- View for admin to see all recipes including hidden
CREATE OR REPLACE VIEW `v_all_recipes` AS
SELECT
  `id`,
  `name`,
  `meal_types`,
  `default_servings`,
  `calories`,
  `ingredients`,
  `steps`,
  `is_cheat`,
  `is_live`,
  `is_deleted`,
  `created_at`,
  `updated_at`
FROM `recipes`
WHERE `is_deleted` = FALSE;

-- View for meal plan with recipe details
CREATE OR REPLACE VIEW `v_meal_plan_with_recipes` AS
SELECT
  mpe.`id`,
  mpe.`user_id`,
  mpe.`plan_date`,
  mpe.`meal_type`,
  mpe.`servings`,
  mpe.`created_at`,
  mpe.`updated_at`,
  r.`id` AS `recipe_id`,
  r.`name` AS `recipe_name`,
  r.`default_servings`,
  r.`calories`,
  r.`ingredients`,
  r.`steps`,
  r.`is_cheat`,
  ROUND((r.`calories` / r.`default_servings` * mpe.`servings`), 0) AS `meal_calories`
FROM `meal_plan_entries` mpe
INNER JOIN `recipes` r ON mpe.`recipe_id` = r.`id`
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

-- ===========================
-- INDEXES FOR PERFORMANCE
-- ===========================

-- Additional composite indexes for common query patterns
CREATE INDEX `idx_recipes_live_cheat` ON `recipes` (`is_live`, `is_cheat`, `is_deleted`);
CREATE INDEX `idx_meal_plan_date_user` ON `meal_plan_entries` (`plan_date`, `user_id`);

-- ===========================
-- COMMENTS
-- ===========================

ALTER TABLE `users` COMMENT = 'User accounts via OAuth authentication';
ALTER TABLE `aisles` COMMENT = 'Grocery store aisle definitions for shopping list organization';
ALTER TABLE `units` COMMENT = 'Measurement units for ingredient quantities';
ALTER TABLE `ingredients` COMMENT = 'Master ingredient list with aisle assignments';
ALTER TABLE `recipes` COMMENT = 'Recipe definitions with ingredients and cooking steps';
ALTER TABLE `meal_plan_entries` COMMENT = 'User meal plans with recipe assignments to calendar dates';
ALTER TABLE `recipe_audit_log` COMMENT = 'Immutable audit trail of all recipe modifications';
