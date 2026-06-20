-- niches_seed.sql
-- Idempotent seed for the Niche table.
-- Safe to run on local (has 6 rows) and production (has 0 rows) — upserts on slug.
-- Apply with: psql "$DATABASE_URL" -f niches_seed.sql

INSERT INTO "niches" (
  "slug", "country", "country_code", "headline", "subhead", "body_copy",
  "hero_image", "hero_video", "vertical_seed_context",
  "meta_title", "meta_description", "active", "updated_at"
) VALUES

-- ============================================================
-- US NICHES (12)
-- ============================================================

(
  'hvac', 'US', '+1',
  'Free After-Hours Call Script for HVAC Contractors',
  'Stop losing after-hours leads to voicemail',
  'We''ll generate a plug-and-play after-hours answering script your team can use tonight — one that captures leads instead of sending them to voicemail. No pitch. No cost. Just a working script built for HVAC.',
  NULL, NULL,
  '{"verticalName":"HVAC contractors","painPoints":["after-hours calls going to voicemail","seasonal overflow during peak summer/winter","dispatch bottlenecks losing urgent leads","customer no-shows on service windows"],"valueOfferCategory":"plug_and_play_resource","exampleOffer":"Free after-hours call answering script that captures lead details instead of voicemail","countryCode":"+1","complianceNote":"TCPA — do not call before 8am or after 9pm local time. Respect DNC list.","currency":"$"}'::jsonb,
  'HVAC Sales Script Generator | OfferFu',
  'Free after-hours call script for HVAC contractors. Generate a custom three-call outbound script in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'plumbing', 'US', '+1',
  'Free Emergency Lead Script for Plumbing Contractors',
  'Capture every emergency call — even when you''re busy',
  'Get a custom three-call script that helps plumbing teams capture emergency leads and follow up without dropping the ball. Free, no pitch — just a working script you can use today.',
  NULL, NULL,
  '{"verticalName":"Plumbing contractors","painPoints":["emergency call overflow during storms","voicemail lead loss at night","follow-up gaps on quoted jobs","dispatchers missing key intake details"],"valueOfferCategory":"plug_and_play_resource","exampleOffer":"Emergency call intake script that captures urgency, address, and contact info every time","countryCode":"+1","complianceNote":"TCPA — do not call before 8am or after 9pm local time. Respect DNC list.","currency":"$"}'::jsonb,
  'Plumbing Sales Script Generator | OfferFu',
  'Free emergency lead script for plumbing contractors. Generate a custom three-call outbound script in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'dental', 'US', '+1',
  'Free New-Patient Call Script for Dental Practices',
  'Turn more inquiry calls into booked appointments',
  'We''ll generate a custom three-call script that helps your front desk convert more new-patient inquiries into booked appointments — and cut no-shows. Genuinely useful, free, no pitch.',
  NULL, NULL,
  '{"verticalName":"Dental practices","painPoints":["new-patient call conversion gaps","30%+ consultation no-show rate","front desk not trained on value-first call handling","recall drop-off after 12 months"],"valueOfferCategory":"quick_win_recommendation","exampleOffer":"New-patient call conversion checklist — 7 questions that turn inquiries into booked appointments","countryCode":"+1","complianceNote":"TCPA — do not call before 8am or after 9pm local time. Respect DNC list. HIPAA-aware scripts.","currency":"$"}'::jsonb,
  'Dental Practice Script Generator | OfferFu',
  'Free new-patient call script for dental practices. Custom three-call outbound framework in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'realestate', 'US', '+1',
  'Free Listing Call Script for Real Estate Agents',
  'Win more listings with a value-first approach',
  'We''ll generate a three-call script that helps you win listings by leading with value, not a pitch. Free, custom-built for real estate agents in your market.',
  NULL, NULL,
  '{"verticalName":"Real estate agents","painPoints":["listing acquisition competition from 20+ agents per farm","cold lead re-engagement after open house","sphere-of-influence drop-off after 18 months","expired listings — owners unmotivated"],"valueOfferCategory":"industry_benchmark_data","exampleOffer":"Local listing conversion benchmark report — what the top 10% of agents in your area do differently on listing calls","countryCode":"+1","complianceNote":"TCPA — do not call before 8am or after 9pm local time. Respect DNC list.","currency":"$"}'::jsonb,
  'Real Estate Script Generator | OfferFu',
  'Free listing call script for real estate agents. Custom three-call outbound framework in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'insurance', 'US', '+1',
  'Free Renewal Call Script for Insurance Brokers',
  'Retain more renewals with a value-first call',
  'We''ll generate a custom three-call script that helps your team approach renewals with genuine value before asking for the business. Free, no pitch.',
  NULL, NULL,
  '{"verticalName":"Insurance brokers","painPoints":["renewal churn — customers shopping rates 30 days before renewal","cross-sell hesitation — home/auto bundling underused","cold lead re-engagement on lapsed policies","client check-ins non-existent between renewals"],"valueOfferCategory":"quick_win_recommendation","exampleOffer":"Renewal retention quick-win checklist — 5 touchpoints that cut churn by 15%","countryCode":"+1","complianceNote":"TCPA — do not call before 8am or after 9pm local time. Respect DNC list. State-by-state insurance solicitation rules.","currency":"$"}'::jsonb,
  'Insurance Broker Script Generator | OfferFu',
  'Free renewal call script for insurance brokers. Custom three-call outbound framework in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'legal', 'US', '+1',
  'Free Intake Call Script for Law Firms',
  'Convert more intake calls into retained clients',
  'Get a custom three-call script that helps your intake team convert more inquiries into retained clients — value-first, no pressure. Free, built for your practice area.',
  NULL, NULL,
  '{"verticalName":"Law firms","painPoints":["intake conversion gaps — qualified leads slipping to competitors","follow-up inconsistency on consultation no-shows","intake staff not trained on urgency framing","case value under-communication losing premium clients"],"valueOfferCategory":"plug_and_play_resource","exampleOffer":"Intake call conversion script — turns inquiry calls into booked consultations with 40%+ show rate","countryCode":"+1","complianceNote":"TCPA — do not call before 8am or after 9pm local time. Respect DNC list. State bar solicitation rules vary.","currency":"$"}'::jsonb,
  'Law Firm Script Generator | OfferFu',
  'Free intake call script for law firms. Custom three-call outbound framework in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'roofing', 'US', '+1',
  'Free Storm-Response Call Script for Roofing Contractors',
  'Win more storm damage jobs before competitors do',
  'After a storm, the first roofer to reach the homeowner wins. We''ll generate a three-call script that helps your team move fast, lead with value, and close more storm damage inspections. Free, no pitch.',
  NULL, NULL,
  '{"verticalName":"Roofing contractors","painPoints":["storm damage lead scramble — 20+ competitors calling same neighborhoods","inspection no-shows after storm","insurance claim confusion losing deals","homeowner hesitation — needs trust before signing"],"valueOfferCategory":"competitive_intelligence","exampleOffer":"Storm damage competitive intelligence brief — what the top 3 roofers in your market say on the first call","countryCode":"+1","complianceNote":"TCPA — do not call before 8am or after 9pm local time. Respect DNC list. State contractor solicitation rules.","currency":"$"}'::jsonb,
  'Roofing Sales Script Generator | OfferFu',
  'Free storm-response call script for roofing contractors. Generate a custom three-call outbound script in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'solar', 'US', '+1',
  'Free Appointment-Setting Script for Solar Installers',
  'Cut no-shows and win more solar deals',
  'Solar leads are expensive. No-shows kill your ROI. We''ll generate a three-call script that helps your setters confirm appointments, deliver value before the rep arrives, and close more installs. Free.',
  NULL, NULL,
  '{"verticalName":"Solar installers","painPoints":["appointment no-shows — 30%+ on booked solar consults","lead gen war — $50-200 per qualified lead","rate-change and rebate deadline urgency","homeowner skepticism — needs trust before a home visit"],"valueOfferCategory":"industry_benchmark_data","exampleOffer":"Solar appointment confirmation script — cuts no-shows by 40% by delivering value before the rep arrives","countryCode":"+1","complianceNote":"TCPA — do not call before 8am or after 9pm local time. Respect DNC list. FTC solar-specific solicitation rules.","currency":"$"}'::jsonb,
  'Solar Sales Script Generator | OfferFu',
  'Free appointment-setting script for solar installers. Generate a custom three-call outbound script in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'mortgage', 'US', '+1',
  'Free Lead-Gen Call Script for Mortgage Brokers',
  'Win more loans in a rate-sensitive market',
  'When rates move, borrowers shop. We''ll generate a three-call script that helps you reach past clients, referral partners, and cold leads with value first — not a rate pitch. Free, custom-built for mortgage brokers.',
  NULL, NULL,
  '{"verticalName":"Mortgage brokers","painPoints":["refi/purchase lead competition from 10+ lenders per borrower","past client reactivation gap — borrowers forget who closed their last loan","referral partner (realtor) relationships going cold","rate-shopping borrowers need value beyond APR to commit"],"valueOfferCategory":"referral_introduction","exampleOffer":"Realtor referral re-introduction script — turns cold referral partners into active pipeline sources","countryCode":"+1","complianceNote":"TCPA — do not call before 8am or after 9pm local time. Respect DNC list. RESPA marketing rules.","currency":"$"}'::jsonb,
  'Mortgage Broker Script Generator | OfferFu',
  'Free lead-gen call script for mortgage brokers. Custom three-call outbound framework in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'medspa', 'US', '+1',
  'Free Consultation Call Script for Medical Spas',
  'Cut no-shows and convert more inquiries into paying patients',
  'Medical spa consults have 30%+ no-show rates and $1-10k+ patient LTV. We''ll generate a three-call script that helps your team confirm consults, deliver value before the visit, and convert more patients. Free.',
  NULL, NULL,
  '{"verticalName":"Medical spas","painPoints":["consultation no-shows — 30%+ on booked aesthetic consults","high-value patient LTV lost to no-show ($1-10k+)","inquiry conversion gaps — front desk not trained on value framing","competition from 5-10 medspas per metro"],"valueOfferCategory":"quick_win_recommendation","exampleOffer":"Consultation confirmation quick-win — 3 touchpoints that cut medspa no-shows by 35%","countryCode":"+1","complianceNote":"TCPA — do not call before 8am or after 9pm local time. Respect DNC list. HIPAA-aware scripts.","currency":"$"}'::jsonb,
  'Medical Spa Script Generator | OfferFu',
  'Free consultation call script for medical spas. Custom three-call outbound framework in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'pest-control', 'US', '+1',
  'Free Renewal Script for Pest Control Operators',
  'Cut churn and win more termite inspections',
  'Pest control revenue is recurring — until customers churn at renewal. We''ll generate a three-call script that helps your team retain renewals and win more termite inspection leads with value first. Free.',
  NULL, NULL,
  '{"verticalName":"Pest control operators","painPoints":["renewal churn — customers cancelling quarterly contracts","termite inspection lead gen gaps","cross-sell hesitation — customers on general plan not upgrading to termite","no proactive check-ins between treatments"],"valueOfferCategory":"free_assessment_audit","exampleOffer":"Free property pest risk audit — 5-minute phone assessment that turns past customers into termite inspection leads","countryCode":"+1","complianceNote":"TCPA — do not call before 8am or after 9pm local time. Respect DNC list. State pesticide applicator solicitation rules.","currency":"$"}'::jsonb,
  'Pest Control Script Generator | OfferFu',
  'Free renewal call script for pest control operators. Custom three-call outbound framework in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'accounting', 'US', '+1',
  'Free Client Acquisition Script for Accounting Firms',
  'Win more business clients before tax season',
  'Business owners switch accountants when they feel undervalued — not when fees change. We''ll generate a three-call script that helps your firm reach prospects with genuine value before asking for the engagement. Free.',
  NULL, NULL,
  '{"verticalName":"Accounting firms","painPoints":["business client acquisition — competition from 10+ firms per metro","past-client reactivation after tax season surge","referral partner (lawyer, banker) relationships going cold","value perception gap — prospects see commodity not expertise"],"valueOfferCategory":"industry_benchmark_data","exampleOffer":"Business tax savings benchmark — what similar businesses in your industry are deducting that you might be missing","countryCode":"+1","complianceNote":"TCPA — do not call before 8am or after 9pm local time. Respect DNC list. Circular 230 marketing constraints.","currency":"$"}'::jsonb,
  'Accounting Firm Script Generator | OfferFu',
  'Free client acquisition script for accounting firms. Custom three-call outbound framework in minutes.',
  true,
  CURRENT_TIMESTAMP
),

-- ============================================================
-- AU NICHES (3)
-- ============================================================

(
  'solar-au', 'AU', '+61',
  'Free Lead-Gen Script for Solar Installers (Australia)',
  'Win rebate-driven leads before competitors do',
  'Australia has 30%+ rooftop solar penetration and state rebates that expire. We''ll generate a three-call script that helps your team reach homeowners with value first — before the rebate deadline passes. Free.',
  NULL, NULL,
  '{"verticalName":"Solar installers (Australia)","painPoints":["state rebate deadline-driven leads — urgency but competition","homeowner skepticism on 25-year panel warranties","installer reputation competition — 50+ installers per metro","lead gen cost $80-150 per qualified AU lead"],"valueOfferCategory":"competitive_intelligence","exampleOffer":"Rebate deadline competitive intelligence brief — what the top 3 AU solar installers say on the first call","countryCode":"+61","complianceNote":"ACMA — do not call before 9am or after 8pm local time. Respect Do Not Call Register. ACL compliance for solar sales.","currency":"A$"}'::jsonb,
  'Solar Sales Script Generator (AU) | OfferFu',
  'Free lead-gen call script for Australian solar installers. Custom three-call outbound framework in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'realestate-au', 'AU', '+61',
  'Free Listing Call Script for Real Estate Agents (Australia)',
  'Win more listings in an agent-driven market',
  'Australia has no MLS — listings are won by the agent who shows up with the most value. We''ll generate a three-call script that helps you win appraisals and listings with value first. Free, built for the AU market.',
  NULL, NULL,
  '{"verticalName":"Real estate agents (Australia)","painPoints":["listing acquisition war — no MLS, agent-driven market","appraisal to listing conversion gaps","past vendor reactivation — sellers forget their agent after 5 years","competition from 30+ agents per suburb"],"valueOfferCategory":"industry_benchmark_data","exampleOffer":"Suburb listing conversion benchmark — what the top 10% of agents in your suburb do differently on appraisal calls","countryCode":"+61","complianceNote":"ACMA — do not call before 9am or after 8pm local time. Respect Do Not Call Register. State property and business agent act compliance.","currency":"A$"}'::jsonb,
  'Real Estate Script Generator (AU) | OfferFu',
  'Free listing call script for Australian real estate agents. Custom three-call outbound framework in minutes.',
  true,
  CURRENT_TIMESTAMP
),
(
  'mortgage-au', 'AU', '+61',
  'Free Lead-Gen Script for Mortgage Brokers (Australia)',
  'Win more loans in a broker-dominated market',
  '70%+ of Australian mortgages are written through brokers. We''ll generate a three-call script that helps you reach past clients and referral partners with value first — not a rate pitch. Free, built for the AU market.',
  NULL, NULL,
  '{"verticalName":"Mortgage brokers (Australia)","painPoints":["refi competition — 15+ brokers per borrower in metros","past client reactivation gap — borrowers forget broker after settlement","referral partner (buyer agent, accountant) relationships going cold","rate-shopping borrowers need value beyond APR to commit"],"valueOfferCategory":"referral_introduction","exampleOffer":"Buyer agent referral re-introduction script — turns cold referral partners into active pipeline sources","countryCode":"+61","complianceNote":"ACMA — do not call before 9am or after 8pm local time. Respect Do Not Call Register. NCCP and BID compliance for mortgage marketing.","currency":"A$"}'::jsonb,
  'Mortgage Broker Script Generator (AU) | OfferFu',
  'Free lead-gen call script for Australian mortgage brokers. Custom three-call outbound framework in minutes.',
  true,
  CURRENT_TIMESTAMP
)

ON CONFLICT ("slug") DO UPDATE SET
  "country"               = EXCLUDED."country",
  "country_code"          = EXCLUDED."country_code",
  "headline"              = EXCLUDED."headline",
  "subhead"               = EXCLUDED."subhead",
  "body_copy"             = EXCLUDED."body_copy",
  "hero_image"            = EXCLUDED."hero_image",
  "hero_video"            = EXCLUDED."hero_video",
  "vertical_seed_context" = EXCLUDED."vertical_seed_context",
  "meta_title"            = EXCLUDED."meta_title",
  "meta_description"      = EXCLUDED."meta_description",
  "active"                = EXCLUDED."active",
  "updated_at"            = CURRENT_TIMESTAMP;