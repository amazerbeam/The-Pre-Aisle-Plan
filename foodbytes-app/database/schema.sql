-- FoodBytes Database Schema
-- Version: 2.0.0 (Normalized)

-- Drop existing tables if they exist (for clean re-creation)
DROP TABLE IF EXISTS recipe_extras;
DROP TABLE IF EXISTS recipe_family_members;
DROP TABLE IF EXISTS recipe_families;
DROP TABLE IF EXISTS meal_plan_entries;
DROP TABLE IF EXISTS recipe_steps;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipe_meals;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS aisles;
DROP TABLE IF EXISTS meals;
DROP TABLE IF EXISTS units;
DROP TABLE IF EXISTS users;

-- Users table (Google OAuth only)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    default_servings INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    UNIQUE KEY unique_email (email),
    UNIQUE KEY unique_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Aisles lookup table (for shopping list organization)
CREATE TABLE aisles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_order SMALLINT NOT NULL,
    UNIQUE KEY unique_aisle_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Units lookup table
CREATE TABLE units (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(50) NOT NULL,
    value VARCHAR(20) NOT NULL,
    UNIQUE KEY unique_unit_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Meals lookup table
CREATE TABLE meals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_order SMALLINT NOT NULL,
    UNIQUE KEY unique_meal_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ingredients table (master list of all ingredients)
-- FR-080: Added macro columns for nutrition tracking
-- FR-083: Added macros_verified flag for verification workflow
CREATE TABLE ingredients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    aisle_id BIGINT NOT NULL,
    -- FR-080: Macronutrient data per 100g
    protein_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Protein in grams per 100g of ingredient',
    carbs_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Carbohydrates in grams per 100g of ingredient',
    fat_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Fat in grams per 100g of ingredient',
    -- FR-083: Verification flag - must be TRUE for recipe to go live
    macros_verified BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'TRUE when macro data has been verified by admin',
    UNIQUE KEY unique_ingredient_key (`key`),
    UNIQUE KEY unique_ingredient_name (name),
    CONSTRAINT fk_ingredients_aisle FOREIGN KEY (aisle_id)
        REFERENCES aisles(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recipes table
CREATE TABLE recipes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    default_servings INT NOT NULL DEFAULT 2,
    calories INT NOT NULL,
    is_cheat BOOLEAN DEFAULT FALSE,
    is_live BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_live (is_live)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recipe to Meal junction table
CREATE TABLE recipe_meals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    meal_id BIGINT NOT NULL,
    UNIQUE KEY unique_recipe_meal (recipe_id, meal_id),
    CONSTRAINT fk_recipe_meals_recipe FOREIGN KEY (recipe_id)
        REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_recipe_meals_meal FOREIGN KEY (meal_id)
        REFERENCES meals(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recipe ingredients table
-- FR-084: Added quantity_grams for accurate macro calculation
-- FR-093: Added linked_recipe_id to reference recipes as ingredients (for extras like Pizza Dough)
CREATE TABLE recipe_ingredients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    -- FR-093: Either ingredient_id OR linked_recipe_id must be set, not both
    ingredient_id BIGINT NULL COMMENT 'Reference to raw ingredient (NULL if linked_recipe_id is set)',
    linked_recipe_id BIGINT NULL COMMENT 'Reference to another recipe used as ingredient (e.g., Pizza Dough)',
    quantity DECIMAL(10, 2) NOT NULL,
    unit_id BIGINT NOT NULL,
    -- FR-084: Gram equivalent for macro calculations (admin weighs ingredient)
    -- FR-093: For linked recipes, this is the portion of the linked recipe to use
    quantity_grams DECIMAL(10, 2) NOT NULL COMMENT 'Weight in grams for macro calculation',
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_recipe_ingredients_recipe FOREIGN KEY (recipe_id)
        REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_recipe_ingredients_ingredient FOREIGN KEY (ingredient_id)
        REFERENCES ingredients(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    -- FR-093: FK for linked recipe ingredients
    CONSTRAINT fk_recipe_ingredients_linked_recipe FOREIGN KEY (linked_recipe_id)
        REFERENCES recipes(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_recipe_ingredients_unit FOREIGN KEY (unit_id)
        REFERENCES units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    -- FR-093: Note - CHECK constraint removed due to MySQL 8.0 limitation
    -- (Cannot use column in CHECK constraint when it has FK with ON DELETE SET NULL/RESTRICT)
    -- The constraint (ingredient_id XOR linked_recipe_id) is enforced at application level
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_linked_recipe_id (linked_recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recipe steps table
-- FR-091: Added linked_recipe_id and alt_instruction for linked recipe navigation
CREATE TABLE recipe_steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    step_number INT NOT NULL,
    instruction TEXT NOT NULL,
    tip TEXT NULL,
    -- FR-091: Links step to an extras recipe (e.g., "Prepare the dough" links to Pizza Dough recipe)
    linked_recipe_id BIGINT NULL COMMENT 'Optional link to extras recipe for this step',
    -- FR-091: Alternative instruction when linked recipe is store-bought
    alt_instruction TEXT NULL COMMENT 'Instruction to show if user selects store-bought for linked recipe',
    UNIQUE KEY unique_recipe_step (recipe_id, step_number),
    CONSTRAINT fk_recipe_steps_recipe FOREIGN KEY (recipe_id)
        REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_recipe_steps_linked_recipe FOREIGN KEY (linked_recipe_id)
        REFERENCES recipes(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_recipe_id (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for common queries
CREATE INDEX idx_recipe_meals_meal_id ON recipe_meals(meal_id);
CREATE INDEX idx_ingredients_aisle_id ON ingredients(aisle_id);

-- Meal Plan Entries table (FR-007, FR-014, FR-015, FR-016, FR-017)
-- Stores user meal plan assignments: which recipe is assigned to which date/meal
CREATE TABLE meal_plan_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_date DATE NOT NULL,
    meal_id BIGINT NOT NULL,
    recipe_id BIGINT NOT NULL,
    servings INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Prevent duplicate: same user can't assign same recipe to same date+meal twice
    UNIQUE KEY unique_user_date_meal_recipe (user_id, plan_date, meal_id, recipe_id),

    -- Foreign key constraints
    CONSTRAINT fk_meal_plan_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_meal_plan_meal FOREIGN KEY (meal_id)
        REFERENCES meals(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_meal_plan_recipe FOREIGN KEY (recipe_id)
        REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE,

    -- Index for efficient date range queries (7-day window lookup)
    INDEX idx_user_date_range (user_id, plan_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FR-043: Recipe Families table (groups recipe variants together)
CREATE TABLE recipe_families (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    family_name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FR-043: Recipe Family Members junction table
-- Links recipes to families with variant labels and ordering
CREATE TABLE recipe_family_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    family_id BIGINT NOT NULL,
    recipe_id BIGINT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    variant_label VARCHAR(100) NULL,  -- e.g., "Vegetarian", "Vegan", "Low-Carb"
    display_order INT DEFAULT 0,       -- Order in dropdown (default first)

    UNIQUE KEY unique_recipe_in_family (family_id, recipe_id),
    -- Ensure a recipe can only belong to ONE family
    UNIQUE KEY unique_recipe_to_one_family (recipe_id),

    CONSTRAINT fk_family_members_family FOREIGN KEY (family_id)
        REFERENCES recipe_families(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_family_members_recipe FOREIGN KEY (recipe_id)
        REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_family_id (family_id),
    INDEX idx_recipe_id (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FR-086: Recipe Extras table (links parent recipes to sub-recipes/extras)
-- Creates hierarchical relationships: Pizza -> Pizza Dough, Pizza Sauce -> Pesto
CREATE TABLE recipe_extras (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_recipe_id BIGINT NOT NULL COMMENT 'The recipe that uses the extra (e.g., Pizza)',
    child_recipe_id BIGINT NOT NULL COMMENT 'The extra recipe being linked (e.g., Pizza Sauce)',
    display_order INT DEFAULT 0 COMMENT 'Order in the homemade selection popup',

    -- Each parent-child pair must be unique
    UNIQUE KEY unique_parent_child (parent_recipe_id, child_recipe_id),

    CONSTRAINT fk_recipe_extras_parent FOREIGN KEY (parent_recipe_id)
        REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_recipe_extras_child FOREIGN KEY (child_recipe_id)
        REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_parent_recipe_id (parent_recipe_id),
    INDEX idx_child_recipe_id (child_recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
