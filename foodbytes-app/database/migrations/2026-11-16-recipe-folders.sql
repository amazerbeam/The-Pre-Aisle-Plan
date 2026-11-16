-- 2026-11-16 Custom recipe folders (plan: .claude/contract/2026-11-16-custom-recipe-folders/)
-- Personal, nested (max 3 levels, enforced in RecipeFolderService) folders of recipe FAMILIES.
-- recipe_folder_items.recipe_id is the family's DEFAULT recipe id (same key as user_hidden_recipes).
-- parent_id cascade only fires when a whole user is deleted; deleting one folder re-parents its
-- children in the service first.
-- Lossless: two brand-new empty tables; no existing rows change (live: 237 recipes, 13 users, 2026-11-16).
-- Idempotent (IF NOT EXISTS). MUST be applied to Railway BEFORE the backend containing RecipeFolder
-- deploys (Hibernate ddl-auto=validate refuses to start without the tables).
CREATE TABLE IF NOT EXISTS recipe_folders (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  user_id    BIGINT      NOT NULL,
  parent_id  BIGINT      NULL,
  name       VARCHAR(40) NOT NULL,
  created_at TIMESTAMP   NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_recipe_folders_user (user_id),
  KEY idx_recipe_folders_parent (parent_id),
  CONSTRAINT fk_recipe_folders_user   FOREIGN KEY (user_id)   REFERENCES users (id)          ON DELETE CASCADE,
  CONSTRAINT fk_recipe_folders_parent FOREIGN KEY (parent_id) REFERENCES recipe_folders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recipe_folder_items (
  id         BIGINT    NOT NULL AUTO_INCREMENT,
  folder_id  BIGINT    NOT NULL,
  recipe_id  BIGINT    NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_recipe_folder_item (folder_id, recipe_id),
  KEY idx_recipe_folder_items_recipe (recipe_id),
  CONSTRAINT fk_recipe_folder_items_folder FOREIGN KEY (folder_id) REFERENCES recipe_folders (id) ON DELETE CASCADE,
  CONSTRAINT fk_recipe_folder_items_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (id)        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
