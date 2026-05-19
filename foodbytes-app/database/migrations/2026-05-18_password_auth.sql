-- 2026-05-18 — Add password-based auth alongside Google OAuth.
-- Relax google_id to nullable so password-only users can exist.
-- UNIQUE index is kept (MySQL allows multiple NULLs in a UNIQUE index).
ALTER TABLE users
    MODIFY COLUMN google_id VARCHAR(255) NULL;

-- Add nullable password_hash column for BCrypt-hashed passwords.
ALTER TABLE users
    ADD COLUMN password_hash VARCHAR(255) NULL AFTER google_id;
  INSERT INTO users (email, name, google_id, password_hash, is_admin, default_servings, created_at)
  VALUES ('batmada@gmail.com', 'Adam Dolan', NULL, '$2b$10$OB0UbPocvsQqz6RqJrkZouwGEiwK.5kWK3Zp/F2Etx0Ydea9mfQ2W', 0, 1, NOW());