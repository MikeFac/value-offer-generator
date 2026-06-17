# Tiered Access Spec

## Tiers

| Tier | Auth | Sessions/month | Model | Save/Download | Price |
|---|---|---|---|---|---|
| Anonymous | None (IP + cookie) | 1 session ever, no export | GPT-4o-mini | No | Free |
| Free | Clerk signup | 3/month | GPT-4o-mini | Yes | Free |
| Pro | Clerk signup + Stripe | Unlimited | GPT-4o | Yes | $29/mo or included with marketplace campaign |

## User Flow

### Anonymous User
1. Lands on home page, enters a vertical, clicks Start
2. Session is created with an anonymous cookie-based identity (no Clerk)
3. Full chat experience, AI generates value offers and scripts
4. Script preview panel works but Save and Download buttons are replaced with "Sign up to save and export your scripts"
5. If they try to start a second session, they see a gate: "You've used your free session. Sign up to create more."
6. No terms acceptance required for anonymous (the value offer is the gift; registration is the ask)

### Free Registered User
1. Signs up via Clerk (email, Google, etc.)
2. Must accept T&Cs (already implemented)
3. Gets 3 sessions per calendar month
4. Can save and download scripts
5. When approaching the limit, UI shows "2 of 3 sessions used this month"
6. When limit is reached, they see upgrade prompt linking to Pro
7. Session count resets on the 1st of each month

### Pro User
1. Subscribes via Stripe (or gets Pro access as part of a marketplace campaign)
2. Unlimited sessions, GPT-4o model
3. Priority access, future features (campaign launcher, team accounts, etc.)
4. Role field in User model = "pro"

## Model Routing

The `/api/chat` route selects the OpenAI model based on the user's tier:
- Anonymous and Free: `gpt-4o-mini`
- Pro: `gpt-4o`

This is controlled by the `model` field stored on the Session row, which is set at session creation time based on the user's tier.

## Abuse Prevention

- **Anonymous:** Cookie-based tracking. One anonymous session per browser. IP rate limit on `/api/chat` (max 20 messages per session, max 1 session).
- **Free registered:** 3 sessions/month, max 30 messages per session. Enforced server-side.
- **Pro:** No limits beyond reasonable API timeouts.

## Data Model Changes

### User model additions
- `tier`: String, default "free", values: "anonymous", "free", "pro"
- `stripeCustomerId`: String?, nullable — for future Stripe integration
- `stripeSubscriptionId`: String?, nullable — for future Stripe integration

### Session model additions
- `model`: String, default "gpt-4o-mini" — which model to use for this session
- `messageCount`: Int, default 0 — denormalized count for rate limiting
- `anonymousId`: String?, nullable — cookie-based ID for anonymous sessions

### MonthlyUsage model (new)
- `id`: String
- `userId`: String (nullable for anonymous)
- `anonymousId`: String? (nullable for registered)
- `month`: Int (e.g., 202606)
- `sessionCount`: Int, default 1
- Unique constraint on (userId, month) and (anonymousId, month)

## API Changes

### POST /api/chat
- Check session.messageCount against limit (30 for free, no limit for pro)
- Increment messageCount after each message pair
- Use session.model to select the OpenAI model

### POST /api/sessions (new endpoint)
- For anonymous: create session with anonymousId from cookie, model=gpt-4o-mini
- For registered: check monthly usage, enforce 3/month for free tier, create with appropriate model
- For pro: no limit

### GET /api/usage (new endpoint)
- Returns current month's session count and limit for the authenticated user

### Middleware / Proxy
- Anonymous users: set a cookie with a UUID on first visit, track in MonthlyUsage
- Registered users: use Clerk userId in MonthlyUsage

## Frontend Changes

### Home page
- If no cookie: "Try it free" CTA, no sign-up wall
- If anonymous cookie exists and has used session: "Sign up to continue" gate
- If registered: show session count "2 of 3 sessions used this month"

### Chat workspace
- Anonymous: replace Save/Download buttons with sign-up CTA
- Free at limit: show upgrade CTA
- Pro: full access

### New pages
- `/pricing` — tier comparison and Pro upgrade CTA
- Upgrade flow can link to Stripe Checkout (future implementation; for now, a manual Pro assignment via admin)

## Implementation Priority

1. Prisma schema migration (User tier, Session model/messageCount/anonymousId, MonthlyUsage)
2. Anonymous session creation with cookie tracking
3. Model routing in /api/chat
4. Session count enforcement in session creation
5. Message count enforcement in /api/chat
6. UI gating for Save/Download on anonymous
7. Usage display in chat workspace header
8. Pricing page