-- 2026-11-14 Recipes redesign (plan: .claude/contract/2026-11-14-meal-plan-screen-redesign/)
-- Per-person "Hide from my recipes". One row = this user has hidden this recipe FAMILY,
-- keyed by the family's DEFAULT recipe id (or the recipe itself when it has no family).
-- Independent of recipes.is_live (admin, hides for everyone). Never touches meal_plan_entries.
-- Lossless: a brand-new empty table; no existing rows change.
-- MUST be applied to Railway BEFORE the backend containing UserHiddenRecipe deploys
-- (Hibernate ddl-auto=validate refuses to start without the table).
CREATE TABLE IF NOT EXISTS user_hidden_recipes (
  id         BIGINT NOT NULL AUTO_INCREMENT,
  user_id    BIGINT NOT NULL,
  recipe_id  BIGINT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_hidden_recipe (user_id, recipe_id),
  KEY idx_user_hidden_recipes_recipe (recipe_id),
  CONSTRAINT fk_user_hidden_recipes_user   FOREIGN KEY (user_id)   REFERENCES users (id)   ON DELETE CASCADE,
  CONSTRAINT fk_user_hidden_recipes_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
