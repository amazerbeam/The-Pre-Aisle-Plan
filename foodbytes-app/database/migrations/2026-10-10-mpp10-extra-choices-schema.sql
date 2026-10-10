-- MPP-10: server-side homemade/store-bought choices for recipe extras.
--
-- Adds three tables:
--   meal_plan_entry_extra_choices          — choice per planned meal per extra
--   meal_plan_template_entry_extra_choices — choice per template entry per extra
--   user_extra_defaults                    — per-owner per-dish default (pre-fills the add-to-day popup)
--
-- Purely additive: no existing column or row changes (lossless). Live counts at planning
-- (2026-10-10): meal_plan_entries 800, meal_plan_template_entries 95, none of these tables exist.
--
-- ON DELETE CASCADE is load-bearing: MealPlanEntryRepository.deleteByUserIdAndDateRange and
-- MealPlanTemplateEntryRepository.deleteByTemplateId are JPQL bulk deletes that bypass JPA
-- cascades, so choices must be removed by MySQL when their entry goes.
--
-- MUST be applied to the Railway MySQL BEFORE the backend that maps these tables is deployed
-- (spring.jpa.hibernate.ddl-auto = validate fails startup otherwise).

CREATE TABLE IF NOT EXISTS meal_plan_entry_extra_choices (
  id                 BIGINT     NOT NULL AUTO_INCREMENT,
  meal_plan_entry_id BIGINT     NOT NULL,
  extra_recipe_id    BIGINT     NOT NULL,
  is_homemade        TINYINT(1) NOT NULL,
  updated_at         TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_mpe_extra_choice (meal_plan_entry_id, extra_recipe_id),
  KEY idx_mpe_extra_choice_extra (extra_recipe_id),
  CONSTRAINT fk_mpe_extra_choice_entry FOREIGN KEY (meal_plan_entry_id)
    REFERENCES meal_plan_entries (id) ON DELETE CASCADE,
  CONSTRAINT fk_mpe_extra_choice_recipe FOREIGN KEY (extra_recipe_id)
    REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS meal_plan_template_entry_extra_choices (
  id                BIGINT     NOT NULL AUTO_INCREMENT,
  template_entry_id BIGINT     NOT NULL,
  extra_recipe_id   BIGINT     NOT NULL,
  is_homemade       TINYINT(1) NOT NULL,
  updated_at        TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_mpte_extra_choice (template_entry_id, extra_recipe_id),
  KEY idx_mpte_extra_choice_extra (extra_recipe_id),
  CONSTRAINT fk_mpte_extra_choice_entry FOREIGN KEY (template_entry_id)
    REFERENCES meal_plan_template_entries (id) ON DELETE CASCADE,
  CONSTRAINT fk_mpte_extra_choice_recipe FOREIGN KEY (extra_recipe_id)
    REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_extra_defaults (
  id              BIGINT     NOT NULL AUTO_INCREMENT,
  user_id         BIGINT     NOT NULL,
  recipe_id       BIGINT     NOT NULL,
  extra_recipe_id BIGINT     NOT NULL,
  is_homemade     TINYINT(1) NOT NULL,
  updated_at      TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_extra_default (user_id, recipe_id, extra_recipe_id),
  CONSTRAINT fk_user_extra_default_user   FOREIGN KEY (user_id)         REFERENCES users (id)   ON DELETE CASCADE,
  CONSTRAINT fk_user_extra_default_recipe FOREIGN KEY (recipe_id)       REFERENCES recipes (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_extra_default_extra  FOREIGN KEY (extra_recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
) ENGINE=InnoDB;
