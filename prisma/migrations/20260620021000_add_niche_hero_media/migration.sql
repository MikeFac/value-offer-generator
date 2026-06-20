-- Add heroImage and heroVideo columns to niches
ALTER TABLE "niches" ADD COLUMN "hero_image" TEXT;
ALTER TABLE "niches" ADD COLUMN "hero_video" TEXT;