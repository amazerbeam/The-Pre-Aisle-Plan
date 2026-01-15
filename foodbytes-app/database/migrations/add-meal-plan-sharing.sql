-- Migration: Add meal plan sharing support
-- Description: Allows users to share meal plans with another user (sync mode)
-- When meal_plan_owner_id is set, the user sees/edits that user's meal plans instead of their own

-- Add meal_plan_owner_id column to users table
ALTER TABLE users
ADD COLUMN meal_plan_owner_id BIGINT NULL COMMENT 'If set, user shares meal plans with this user (sync mode)';

-- Add foreign key constraint
ALTER TABLE users
ADD CONSTRAINT fk_meal_plan_owner FOREIGN KEY (meal_plan_owner_id) REFERENCES users(id) ON DELETE SET NULL;

-- Usage examples:
-- Make user 2 share user 1's meal plans (both see and edit the same plans):
-- UPDATE users SET meal_plan_owner_id = 1 WHERE id = 2;
--
-- Stop sharing (user 2 gets their own independent meal plans):
-- UPDATE users SET meal_plan_owner_id = NULL WHERE id = 2;
