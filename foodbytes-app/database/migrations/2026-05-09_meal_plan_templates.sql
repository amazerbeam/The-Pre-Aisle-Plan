-- =============================================================================
-- Saved Meal Plan Templates
-- See: .docs/requirement-meal-plan-templates-2026-05-09.md
--
-- Adds a per-user library of named meal-plan templates. A template snapshots
-- the seven day-offsets (0..6) and recipes assigned to each meal slot,
-- decoupled from any calendar date. Users can save the current week as a
-- template and re-apply it to any future Monday.
--
-- Apply manually to Railway BEFORE redeploying the backend (Hibernate runs
-- in `validate` mode — startup fails if these tables don't exist).
-- =============================================================================

START TRANSACTION;

CREATE TABLE meal_plan_templates (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NOT NULL,
    name        VARCHAR(60)  NOT NULL,
    created_at  DATETIME     NULL,
    updated_at  DATETIME     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_meal_plan_template_user_name (user_id, name),
    KEY idx_meal_plan_template_user (user_id),
    CONSTRAINT fk_meal_plan_template_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE meal_plan_template_entries (
    id           BIGINT   NOT NULL AUTO_INCREMENT,
    template_id  BIGINT   NOT NULL,
    day_offset   INT      NOT NULL,
    meal_id      BIGINT   NOT NULL,
    recipe_id    BIGINT   NOT NULL,
    servings     INT      NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    KEY idx_template_entry_template (template_id),
    CONSTRAINT fk_template_entry_template
        FOREIGN KEY (template_id) REFERENCES meal_plan_templates (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_template_entry_meal
        FOREIGN KEY (meal_id) REFERENCES meals (id),
    CONSTRAINT fk_template_entry_recipe
        FOREIGN KEY (recipe_id) REFERENCES recipes (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_template_entry_day_offset
        CHECK (day_offset >= 0 AND day_offset <= 6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
