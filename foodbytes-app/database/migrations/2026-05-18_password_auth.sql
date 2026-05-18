-- 2026-05-18 — Add password-based auth alongside Google OAuth.
-- Relax google_id to nullable so password-only users can exist.
-- UNIQUE index is kept (MySQL allows multiple NULLs in a UNIQUE index).
ALTER TABLE users
    MODIFY COLUMN google_id VARCHAR(255) NULL;

-- Add nullable password_hash column for BCrypt-hashed passwords.
ALTER TABLE users
    ADD COLUMN password_hash VARCHAR(255) NULL AFTER google_id;
