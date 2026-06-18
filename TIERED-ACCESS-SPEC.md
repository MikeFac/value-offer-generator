# Tiered Access Spec

## Tiers

| Tier | Auth | Sessions/month | Model | Save | Export | Price |
|---|---|---|---|---|---|---|
| Anonymous | None (cookie) | 1 session ever | GPT-4o-mini | No | No | Free |
| Email | Clerk signup (email) | 3/month | GPT-4o-mini | Yes | No | Free |
| Phone | Clerk signup (phone + SMS consent) | Unlimited | GPT-4o | Yes | Yes | Free |
| Pro | Admin-assigned | Unlimited | GPT-4o | Yes | Yes | $29/mo (future) |

## Philosophy

The registration tiers mirror the product's own three-call framework:

1. **Anonymous** = The value call. Give something for nothing. No gate, no friction.
2. **Email** = The follow-up. They've seen value, now they give something small (an email) to keep it. They can save their work — the relationship deepens.
3. **Phone** = The ask. We've earned the right to ask for their phone number. In return, they get unlimited sessions, export, and the premium model. We get a high-reach channel for follow-up.

Email is the trust bridge. Phone is the conversion.

## User Flow

### Anonymous User
1. Lands on home page, enters a vertical, clicks "Start Free"
2. Session is created with a cookie-based identity (no Clerk)
3. Full chat experience, AI generates value offers and scripts
4. Script preview panel works but Save shows "Sign up to save your scripts" and Download shows "Add your phone to export"
5. If they try to start a second session, they see: "You've used your free session. Sign up to continue."
6. No terms acceptance required for anonymous

### Email Registered User (Free Tier)
1. Signs up via Clerk with email (or Google, etc.)
2. Must accept T&Cs (data access acknowledgment)
3. Gets 3 sessions per calendar month
4. Can **save** scripts (persists to their account)
5. Cannot **export/download** — shows "Add your phone number to export scripts and unlock unlimited sessions"
6. When approaching the limit, UI shows "2 of 3 sessions used this month"
7. When limit is reached, they see the phone upgrade prompt

### Phone Registered User (Phone Tier)
1. Signs up via Clerk with phone number (or adds phone to existing email account)
2. Must accept T&Cs **and** SMS consent
3. Unlimited sessions, GPT-4o model
4. Full save and export/download access
5. This is the target conversion tier — the "ask" after delivering value

### Pro User (Future)
1. Assigned manually via admin (or future Stripe integration)
2. Same as Phone tier but with additional features (team accounts, campaign launcher, etc.)
3. Stripe billing integration is a separate milestone

## Model Routing

The `/api/chat` route selects the OpenAI model based on the user's tier:
- Anonymous and Email: `gpt-4o-mini`
- Phone and Pro: `gpt-4o`

This is controlled by the `model` field stored on the Session row, set at session creation time based on the user's tier.

## Gate Logic

### Chat Workspace — Save Button
- Anonymous: "Sign up free to save your scripts" → link to `/sign-up`
- Email (no phone, no SMS consent): "Add your phone number to export and unlock unlimited sessions" → link to user settings or phone add flow
- Phone (SMS consent given): Save works normally

### Chat Workspace — Export/Download Button
- Anonymous: "Add your phone to export" → link to `/sign-up`
- Email (no SMS consent): "Add your phone number to export scripts" → prompt to add phone + accept SMS consent
- Phone (SMS consent given): Download works normally

### Home Page — Session Creation
- Anonymous: 1 session, then gate
- Email: 3/month, then upgrade prompt
- Phone: unlimited

## Abuse Prevention

- **Anonymous:** Cookie-based tracking. One anonymous session per browser. IP rate limit on `/api/chat`.
- **Email:** 3 sessions/month, max 30 messages per session. Enforced server-side.
- **Phone:** Unlimited sessions, max 120 messages per session (generous for normal use).
- **Pro:** No limits beyond reasonable API timeouts.

## Data Model

### User model
- `tier`: String, default "free", values: "anonymous", "free" (email), "phone", "pro"
- `email`: String?, unique, nullable — primary identifier for email tier
- `phone`: String?, unique, nullable — primary identifier for phone tier
- `phoneVerified`: Boolean, default false — set by Clerk webhook
- `smsConsent`: Boolean, default false — required for phone tier
- `smsConsentAt`: DateTime? — when consent was given
- `smsConsentText`: String? — exact consent text for legal proof
- `stripeCustomerId`: String?, nullable — for future Stripe integration
- `stripeSubscriptionId`: String?, nullable — for future Stripe integration

### Session model
- `model`: String, default "gpt-4o-mini" — set based on tier at creation
- `messageCount`: Int, default 0 — denormalized for rate limiting
- `anonymousId`: String?, nullable — cookie-based ID for anonymous sessions

### MonthlyUsage model
- Tracks session count per user per month
- Unique constraint on (userId, month) and (anonymousId, month)

### SmsLog model
- Audit trail for all SMS messages (OTP, marketing, transactional)
- Linked to User via userId

## Tier Upgrade Flow

### Email → Phone
1. User clicks "Add phone" in the export gate or header
2. Clerk's phone verification flow adds the phone number to their existing account
3. Clerk webhook fires `user.updated`, we sync the phone
4. User is redirected to `/terms` to accept SMS consent
5. On acceptance, their tier is upgraded from "free" to "phone"
6. They now have unlimited sessions, export, and GPT-4o

### Email → Pro (Future)
- Stripe checkout flow, manual tier assignment via admin for now

## Implementation Priority

1. Prisma schema — ensure email is nullable, tier includes "phone"
2. Tiers config — add "phone" tier with unlimited sessions and gpt-4o
3. Clerk configuration — enable both email and phone as sign-in methods
4. Home page — 3-state flow (anonymous, email, phone)
5. Chat workspace — 3 gate states (save, export, unlimited)
6. Terms page — email consent vs SMS consent
7. Admin page — show tier, phone, SMS status
8. Upgrade flow — email → phone within the app