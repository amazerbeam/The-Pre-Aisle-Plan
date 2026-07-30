-- 2026-07-29 — Chef sign-off that a recipe's macros/calories have been validated.
-- Sibling of ingredients.macros_verified (FR-083), one level up: this asserts the
-- recipe's totals were checked, not that a single ingredient's per-100g data is good.
-- Sticky by design: no application code clears these columns automatically.
-- The only writer is PATCH /api/recipes/admin/{id}/audit.
ALTER TABLE recipes
    ADD COLUMN macros_audited    TINYINT(1) NOT NULL DEFAULT 0 AFTER is_live,
    ADD COLUMN macros_audited_at TIMESTAMP  NULL DEFAULT NULL   AFTER macros_audited,
    ADD COLUMN macros_audited_by BIGINT     NULL DEFAULT NULL   AFTER macros_audited_at;

ALTER TABLE recipes
    ADD INDEX idx_recipes_macros_audited (macros_audited),
    ADD CONSTRAINT fk_recipes_macros_audited_by
        FOREIGN KEY (macros_audited_by) REFERENCES users(id) ON DELETE SET NULL;
