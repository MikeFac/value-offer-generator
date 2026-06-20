# Niche Selection Spec

## Purpose

Defines the criteria and rationale for selecting the hottest vertical markets to automate with niched landing pages on OfferFu. Each selected niche gets a dedicated subdomain (e.g. `hvac.offerfu.com`), custom landing copy, and a pre-seeded `vertical_context` that gives the AI chat agent a head start in Phase 1 discovery.

## Selection Criteria

A niche qualifies for automation if it scores well across **all five** dimensions:

### 1. Customer LTV / Ticket Size
Outbound calling only makes economic sense when each won customer is worth enough to justify the cost of acquisition. Niches where a single customer is worth $500+ lifetime, or a single job is worth $1,000+, are strong candidates.

| Tier | Example | Threshold |
| :--- | :--- | :--- |
| **A** | Solar install, roofing, legal (PI) | $5,000+ per job/client |
| **B** | HVAC, plumbing, dental, mortgage | $1,000–$5,000 per job/client |
| **C** | Pest control, accounting, insurance | $500–$1,500 LTV (recurring) |

Niches below Tier C (e.g. retail, low-ticket services) are excluded — the economics of outbound don't work.

### 2. Phone-Reachable Decision Maker
The business owner or a solo decision-maker (office manager, practice manager, broker) must be reachable by phone during business hours. Niches where decisions require committee approval or RFP processes (enterprise SaaS, government, large corporates) are excluded.

**Good:** Owner-operated trades, solo practitioners, independent brokers, small practice owners.
**Bad:** Enterprise procurement, franchise HQ decisions, regulated tender processes.

### 3. Known Conversion Pain
The niche must have a well-documented pain point that a free call script can genuinely solve. The pain has to be specific enough that a business owner will recognise it instantly and want the fix:

- **Lead conversion gaps** — inquiries come in but don't convert (dental intakes, legal intakes, medspa consultations)
- **No-show / cancellation drag** — appointments booked but patients/clients don't show (dental, medspa, legal consults)
- **After-hours / overflow lead loss** — calls go to voicemail and the lead goes cold (HVAC, plumbing, roofing emergency calls)
- **Renewal / retention churn** — customers leave at renewal because no one proactively called (insurance, pest control, accounting)
- **Listing / acquisition competition** — winning the business means out-calling competitors (real estate, mortgage, solar)
- **Reactivation gap** — past customers / sphere of influence have gone cold and no one calls them (real estate, fitness, accounting)

### 4. Competitive Market
The niche must be competitive enough that business owners feel pressure to differentiate and are receptive to a value-first approach. Markets with 20+ local competitors per metro area score highest. Monopoly / utility markets (e.g. one power company) are excluded.

### 5. TAM (Total Addressable Market)
Enough businesses in the niche across the target country to justify a dedicated landing page and ongoing content investment. Threshold: **5,000+ active businesses** in the US, or **2,000+** in AU.

## Geographic Focus

- **US** — primary market. Country code `+1`. Compliance: TCPA (no calls before 8am / after 9pm local time, DNC list respect).
- **AU** — secondary market. Country code `+61`. Compliance: ACMA (no calls before 9am / after 8pm local time, Do Not Call Register respect).

AU gets separate niche slugs (e.g. `solar-au`, `realestate-au`) where market dynamics differ materially from the US — different compliance, different currency, different competitive landscape, different pain point emphasis.

## The 15 Selected Niches

### US (12 niches)

| # | Slug | Vertical | Why it's hot | Value offer category |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `hvac` | HVAC contractors | After-hours lead loss to voicemail; $2-8k per install; owner-operated; high competition | Plug-and-play resource |
| 2 | `plumbing` | Plumbing contractors | Emergency call overflow; $300-3k per job; owner-operated; reactive market | Plug-and-play resource |
| 3 | `dental` | Dental practices | New-patient intake conversion + no-shows; $1-5k LTV per patient; practice manager reachable | Quick win recommendation |
| 4 | `realestate` | Real estate agents | Listing acquisition competition; $5-20k commission per listing; solo operators | Industry benchmark data |
| 5 | `insurance` | Insurance brokers | Renewal retention churn; $200-1,500 LTV; broker is decision maker | Quick win recommendation |
| 6 | `legal` | Law firms (PI, family, criminal) | Intake conversion gaps; $2-15k+ per case; intake staff reachable | Plug-and-play resource |
| 7 | `roofing` | Roofing contractors | Storm damage lead scramble; $5-15k per job; owner-operated; very competitive | Competitive intelligence |
| 8 | `solar` | Solar installers | High-ticket ($15-30k per install); lead gen war; appointment no-shows kill deals; very competitive | Industry benchmark data |
| 9 | `mortgage` | Mortgage brokers | Refi/purchase lead competition; $2-5k per loan; broker is decision maker; rate-sensitive market | Referral / introduction |
| 10 | `medspa` | Medical spas / aesthetics | High-LTV patient ($1-10k+); consultation no-shows 30%+; practice owner reachable; booming market | Quick win recommendation |
| 11 | `pest-control` | Pest control operators | Recurring contract revenue ($100-400/quarter); renewal churn; termite inspection lead gen; owner-operated | Free assessment / audit |
| 12 | `accounting` | Accounting / tax firms | Business client acquisition; $500-5k+ annual fees; tax season surge; partner is decision maker | Industry benchmark data |

### AU (3 niches)

| # | Slug | Vertical | Why it's hot (AU-specific) | Value offer category |
| :--- | :--- | :--- | :--- | :--- |
| 13 | `solar-au` | Solar installers (AU) | 30%+ rooftop penetration; state rebate churn; $3-8k per install; very competitive; rebate deadline-driven leads | Competitive intelligence |
| 14 | `realestate-au` | Real estate agents (AU) | Agent-driven market (no MLS); listing acquisition war; $10-25k commission; very competitive | Industry benchmark data |
| 15 | `mortgage-au` | Mortgage brokers (AU) | 70%+ of AU mortgages written via brokers; refi competition; $2-4k per loan; broker is decision maker | Referral / introduction |

## Niches Considered But Rejected

| Niche | Reason for rejection |
| :--- | :--- |
| Fitness studios / gyms | LTV too low for outbound; membership sales more inbound-driven |
| Auto repair / body shops | Insurance claim leads not phone-generated; fragmented market |
| Landscaping / lawn care | Low ticket; seasonal; mostly inbound / referral-driven |
| Chiropractors | Similar to dental but smaller TAM and lower LTV |
| Veterinarians | Smaller TAM; less competitive; lower urgency |
| Cleaning services | Low ticket; high churn; mostly consumer-facing |
| SaaS companies | Committee decisions; not phone-reachable; wrong fit for telemarketing marketplace |

## Content Per Niche

Each niche row in the `niches` table contains:

- **`headline`** — niched H2 on the landing page (e.g. "Free After-Hours Call Script for HVAC Contractors")
- **`subhead`** — one-line value prop underneath (the specific pain)
- **`bodyCopy`** — 2-3 sentence landing copy explaining what they get, why it's free, no pitch
- **`heroImage`** / **`heroVideo`** — optional media URLs (nullable; falls back to default offerfu-hero.png)
- **`verticalSeedContext`** (jsonb) — pre-seeds the AI chat agent's Phase 1 discovery:
  - `verticalName` — canonical vertical string
  - `painPoints` — array of 3-4 known pain points
  - `valueOfferCategory` — which category from SPEC.md:200-208 the AI should draw from
  - `exampleOffer` — a concrete example the AI can use as a starting point
  - `countryCode` — phone country code for generated scripts
  - `complianceNote` — regulatory constraint the AI must respect in generated scripts
  - `currency` — currency symbol for any price references
- **`metaTitle`** / **`metaDescription`** — SEO for the subdomain

## Deployment

The seed file (`niches_seed.sql`) is idempotent — uses `INSERT ... ON CONFLICT (slug) DO UPDATE` so it can be run on both local (has 6 existing rows) and production (has 0 rows) with the same result. Applied to local DB first for verification, then piped to production via `psql`.