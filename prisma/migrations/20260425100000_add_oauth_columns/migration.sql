-- Make email nullable so Telegram-only users (no email) can register.
-- PostgreSQL UNIQUE allows multiple NULLs, so the existing unique index is preserved.
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- Add OAuth provider linkage columns.
ALTER TABLE "users" ADD COLUMN "google_id" VARCHAR(64);
CREATE UNIQUE INDEX "users_google_id_key" ON "users" ("google_id");

ALTER TABLE "users" ADD COLUMN "telegram_id" VARCHAR(32);
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users" ("telegram_id");
