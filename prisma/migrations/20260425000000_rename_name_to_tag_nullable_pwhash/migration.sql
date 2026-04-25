-- Rename users.name -> users.tag, shrink to VarChar(64), make nullable.
-- Make users.password_hash nullable so OAuth-only users can be created without a password.

ALTER TABLE "users" RENAME COLUMN "name" TO "tag";
ALTER TABLE "users" ALTER COLUMN "tag" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "tag" TYPE VARCHAR(64);

ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
