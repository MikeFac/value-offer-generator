-- Add country and countryCode columns to niches
ALTER TABLE "niches" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'US';
ALTER TABLE "niches" ADD COLUMN "country_code" TEXT NOT NULL DEFAULT '+1';

-- Backfill existing rows (all current seeds are US)
UPDATE "niches" SET "country" = 'US', "country_code" = '+1' WHERE "country" IS NULL OR "country_code" IS NULL;

-- Add index on country for filtering
CREATE INDEX "niches_country_idx" ON "niches"("country");