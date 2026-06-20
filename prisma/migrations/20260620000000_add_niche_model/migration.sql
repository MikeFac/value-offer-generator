-- Create Niche table
CREATE TABLE "niches" (
    "slug"                TEXT NOT NULL,
    "headline"            TEXT NOT NULL,
    "subhead"             TEXT NOT NULL,
    "body_copy"           TEXT NOT NULL,
    "example_offer"       JSONB,
    "vertical_seed_context" JSONB,
    "meta_title"          TEXT,
    "meta_description"    TEXT,
    "active"              BOOLEAN NOT NULL DEFAULT true,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "niches_pkey" PRIMARY KEY ("slug")
);

-- Add niche_slug column to sessions
ALTER TABLE "sessions" ADD COLUMN "niche_slug" TEXT;

-- Create index on sessions.niche_slug
CREATE INDEX "sessions_niche_slug_idx" ON "sessions"("niche_slug");

-- Add foreign key from sessions.niche_slug -> niches.slug
ALTER TABLE "sessions"
  ADD CONSTRAINT "sessions_niche_slug_fkey"
  FOREIGN KEY ("niche_slug") REFERENCES "niches"("slug")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Seed initial niches
INSERT INTO "niches" ("slug", "headline", "subhead", "body_copy", "vertical_seed_context", "meta_title", "meta_description") VALUES
(
  'hvac',
  'Free After-Hours Call Script for HVAC Contractors',
  'Stop losing after-hours leads to voicemail',
  'We''ll generate a plug-and-play after-hours answering script your team can use tonight — one that captures leads instead of sending them to voicemail. No pitch. No cost. Just a working script built for HVAC.',
  '{"verticalName": "HVAC contractors", "painPoints": ["after-hours calls going to voicemail", "seasonal overflow", "dispatch bottlenecks"], "valueOfferCategory": "plug_and_play_resource", "exampleOffer": "Free after-hours call answering script"}'::jsonb,
  'HVAC Sales Script Generator | OfferFu',
  'Free after-hours call script for HVAC contractors. Generate a custom three-call outbound script in minutes.'
),
(
  'dental',
  'Free New-Patient Call Script for Dental Practices',
  'Turn more inquiry calls into booked appointments',
  'We''ll generate a custom three-call script that helps your front desk convert more new-patient inquiries into booked appointments. Genuinely useful, free, no pitch.',
  '{"verticalName": "Dental practices", "painPoints": ["new-patient call no-shows", "front desk conversion", "recall drop-off"], "valueOfferCategory": "quick_win_recommendation", "exampleOffer": "New-patient call conversion checklist"}'::jsonb,
  'Dental Practice Script Generator | OfferFu',
  'Free new-patient call script for dental practices. Custom three-call outbound framework in minutes.'
),
(
  'plumbing',
  'Free Emergency Lead Script for Plumbing Contractors',
  'Capture every emergency call — even when you''re busy',
  'Get a custom three-call script that helps plumbing teams capture emergency leads and follow up without dropping the ball. Free, no pitch.',
  '{"verticalName": "Plumbing contractors", "painPoints": ["emergency call overflow", "voicemail lead loss", "follow-up gaps"], "valueOfferCategory": "plug_and_play_resource", "exampleOffer": "Emergency call intake script"}'::jsonb,
  'Plumbing Sales Script Generator | OfferFu',
  'Free emergency lead script for plumbing contractors. Generate a custom three-call outbound script in minutes.'
),
(
  'realestate',
  'Free Listing Call Script for Real Estate Agents',
  'Win more listings with a value-first approach',
  'We''ll generate a three-call script that helps you win listings by leading with value, not a pitch. Free, custom-built for real estate.',
  '{"verticalName": "Real estate agents", "painPoints": ["listing competition", "cold lead re-engagement", "sphere-of-influence drop-off"], "valueOfferCategory": "industry_benchmark_data", "exampleOffer": "Local listing conversion benchmark report"}'::jsonb,
  'Real Estate Script Generator | OfferFu',
  'Free listing call script for real estate agents. Custom three-call outbound framework in minutes.'
),
(
  'insurance',
  'Free Renewal Call Script for Insurance Brokers',
  'Retain more renewals with a value-first call',
  'We''ll generate a custom three-call script that helps your team approach renewals with genuine value before asking for the business. Free, no pitch.',
  '{"verticalName": "Insurance brokers", "painPoints": ["renewal churn", "cross-sell hesitation", "cold lead re-engagement"], "valueOfferCategory": "quick_win_recommendation", "exampleOffer": "Renewal retention quick-win checklist"}'::jsonb,
  'Insurance Broker Script Generator | OfferFu',
  'Free renewal call script for insurance brokers. Custom three-call outbound framework in minutes.'
),
(
  'legal',
  'Free Intake Call Script for Law Firms',
  'Convert more intake calls into retained clients',
  'Get a custom three-call script that helps your intake team convert more inquiries into retained clients — value-first, no pressure. Free.',
  '{"verticalName": "Legal services", "painPoints": ["intake conversion gaps", "follow-up inconsistency", "consultation no-shows"], "valueOfferCategory": "plug_and_play_resource", "exampleOffer": "Intake call conversion script"}'::jsonb,
  'Law Firm Script Generator | OfferFu',
  'Free intake call script for law firms. Custom three-call outbound framework in minutes.'
);