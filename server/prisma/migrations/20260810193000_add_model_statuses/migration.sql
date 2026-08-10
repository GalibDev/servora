CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "CategoryStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "ReviewStatus" AS ENUM ('PUBLISHED', 'HIDDEN');

ALTER TABLE "users" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "categories" ADD COLUMN "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "reviews" ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED';

CREATE INDEX "users_status_isDeleted_idx" ON "users"("status", "isDeleted");
CREATE INDEX "categories_status_isDeleted_idx" ON "categories"("status", "isDeleted");
CREATE INDEX "reviews_serviceId_status_isDeleted_idx" ON "reviews"("serviceId", "status", "isDeleted");
