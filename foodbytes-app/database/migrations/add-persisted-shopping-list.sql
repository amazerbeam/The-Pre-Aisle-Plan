-- Migration: Add persisted shopping list tables
-- Description: Allows shopping lists to be saved to database with checked state
-- One shopping list per user, regenerated on demand

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Only one shopping list per user at a time
    UNIQUE KEY unique_user_shopping_list (user_id),

    CONSTRAINT fk_shopping_list_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create shopping_list_items table
CREATE TABLE IF NOT EXISTS shopping_list_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shopping_list_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    aisle_id BIGINT NULL,
    aisle_name VARCHAR(100) NULL,
    aisle_order SMALLINT DEFAULT 999,
    source_chain JSON NULL COMMENT 'Array of recipe IDs for ingredient provenance',
    is_checked BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_item_shopping_list FOREIGN KEY (shopping_list_id)
        REFERENCES shopping_lists(id) ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_shopping_list_items (shopping_list_id),
    INDEX idx_shopping_list_checked (shopping_list_id, is_checked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
