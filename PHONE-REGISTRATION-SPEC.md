# Phone-First Registration Spec

## Overview

Registration uses a progressive trust model with three tiers:

1. **Anonymous** — try it free, no account
2. **Email** — sign up with email, save scripts, 3 sessions/month
3. **Phone** — add phone + SMS consent, unlock everything

The email tier is the trust bridge. Users who won't give a phone number yet will give an email to save their work. Once they see value, the phone tier is the natural upgrade — and it gives us a high-reach follow-up channel.

## Registration Flow

### Anonymous Session (No Registration)
1. User lands on offerfu.com, enters a vertical, clicks "Start Free"
2. Full chat experience with GPT-4o-mini
3. Script preview panel works, but Save shows "Sign up to save" and Download shows "Add your phone to export"
4. No email, no phone, no account required
5. One anonymous session only — second attempt redirects to sign-up

### Email Registration (Free Tier)
1. User clicks "Save Script" or tries to start a second session
2. Redirected to Clerk sign-up (email-first)
3. After email verification, redirected to `/terms` to accept T&Cs (data access acknowledgment)
4. Tier set to "free" — can save scripts, 3 sessions/month
5. Export/download still gated: "Add your phone to export and unlock unlimited sessions"

### Phone Registration (Phone Tier)
1. Email user clicks "Add phone" or "Export" button
2. Clerk's phone verification flow adds the phone number to their existing account
3. Redirected to `/terms` for SMS consent (if not already given)
4. Tier upgraded from "free" to "phone"
5. Full access: unlimited sessions, GPT-4o, save, and export

### Direct Phone Registration (New Users)
1. User can also sign up directly with phone number from the start
2. Clerk handles phone OTP
3. Redirected to `/terms` for T&Cs + SMS consent
4. Tier set to "phone" — full access immediately

## Clerk Configuration

### How It Works
- **Clerk** manages the entire auth flow: email, phone, OTP, session cookies, user management
- Both **email** and **phone** are enabled as sign-in methods
- Email is the default sign-up method (lower friction)
- Phone can be added later or used as primary
- **Telnyx** is the SMS delivery provider for OTP (configured in Clerk dashboard)

### Clerk Dashboard Steps
1. Go to **User & Authentication → Email, Phone, Username**
   - Enable **Email address** as a sign-in method (default)
   - Enable **Phone number** as a sign-in method
   - Set email to **Required**, phone to **Optional**
2. Go to **SMS Delivery**
   - Select **Telnyx** as the SMS provider
   - Enter Telnyx API key and phone number
3. Go to **Paths**
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/terms` (then we redirect to `/` after consent check)
   - After sign-up URL: `/terms`
4. Go to **Domains & URLs**
   - Add `offerfu.com` and `www.offerfu.com`

### Custom Consent Flow
Clerk's auth flow does NOT include TCPA-compliant SMS marketing consent. We add this:

1. After Clerk sign-up/sign-in, check our database for the user
2. If `termsAcceptedAt` is null → redirect to `/terms` (T&C acknowledgment)
3. If `termsAcceptedAt` is set but `smsConsent` is false and user has phone → redirect to `/terms` (SMS consent section)
4. If both are set → redirect to `/`

## Tier Upgrade: Email → Phone

This is the key conversion flow. When an email-only user wants to export or hits their session limit:

1. **In chat workspace:** Export button shows "Add your phone to export"
2. **In home page:** Session limit shows "Upgrade to unlimited — add your phone number"
3. User clicks → Clerk's `UserProfile` component with phone addition
4. Clerk sends OTP, user verifies
5. Clerk webhook fires `user.updated` → we sync phone to our DB
6. Redirect to `/terms` for SMS consent
7. On acceptance: tier upgraded to "phone", full access unlocked

## Data Model

### User Model
```
User
  id                  String    @id @default(cuid())
  phone               String?   @unique
  email               String?   @unique
  name                String?
  role                String    @default("bd_strategist")
  tier                String    @default("free")              // "anonymous", "free", "phone", "pro"
  phoneVerified       Boolean   @default(false) @map("phone_verified")
  smsConsent          Boolean   @default(false) @map("sms_consent")
  smsConsentAt        DateTime? @map("sms_consent_at")
  smsConsentText      String?   @map("sms_consent_text")
  termsAcceptedAt     DateTime? @map("terms_accepted_at")
  stripeCustomerId    String?   @map("stripe_customer_id")
  stripeSubscriptionId String? @map("stripe_subscription_id")
  createdAt           DateTime  @default(now()) @map("created_at")

  sessions      Session[]
  monthlyUsages MonthlyUsage[]
  smsLogs       SmsLog[]

  @@map("users")
```

### SmsLog Model
```
SmsLog
  id          String   @id @default(cuid())
  userId      String?  @map("user_id")
  phone       String
  type        String                              // "otp_verify", "marketing", "transactional"
  message     String
  providerId  String?  @map("provider_id")
  status      String                              // "sent", "delivered", "failed"
  createdAt   DateTime  @default(now()) @map("created_at")

  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("sms_logs")
```

## SMS Consent Language

The checkbox text must be:

> **I agree to receive SMS messages from OfferFu. Message frequency varies. Msg & data rates may apply. Reply STOP to unsubscribe.**

This text is stored in `smsConsentText` at the time of consent for legal proof.

### T&Cs — Section 9 (SMS Communications)
By providing your phone number and checking the SMS consent box, you agree to receive text messages from OfferFu. These may include:
- Verification codes for account security
- Notifications about your generated scripts
- Marketing messages about our services and products
- Follow-up communications related to your use of the tool

Message frequency varies. Standard message and data rates may apply. You can opt out at any time by replying STOP to any message or contacting us. We do not sell your phone number to third parties.

## Frontend Changes

### Home Page
- Anonymous view: "Start Free" button, no login required
- Signed-in (email, no phone): show session count, "Upgrade to unlimited" CTA
- Signed-in (phone): show session count, full access

### Chat Workspace
- Anonymous: Save → "Sign up to save", Export → "Add your phone to export"
- Email (free tier): Save works, Export → "Add your phone to export and unlock unlimited"
- Phone (SMS consent): Save and Export both work

### Sign-Up Flow
- Clerk `<SignUp>` with email as default method
- After sign-up: redirect to `/terms` for T&C acceptance
- If user adds phone later: redirect to `/terms` for SMS consent
- After consent: redirect to `/` or back to their session

### Terms Page
- Email-only users: T&C acknowledgment checkbox only
- Phone users: T&C acknowledgment + SMS consent checkbox (both required)
- The page auto-detects whether the user has a phone number and shows the appropriate form

## Tier Configuration (Code)

```typescript
export const TIERS = {
  anonymous: { sessionsPerMonth: 1, messagesPerSession: 30, model: "gpt-4o-mini", canSave: false, canExport: false },
  free:      { sessionsPerMonth: 3, messagesPerSession: 30, model: "gpt-4o-mini", canSave: true,  canExport: false },
  phone:     { sessionsPerMonth: Infinity, messagesPerSession: 120, model: "gpt-4o", canSave: true, canExport: true },
  pro:       { sessionsPerMonth: Infinity, messagesPerSession: Infinity, model: "gpt-4o", canSave: true, canExport: true },
};
```

## Implementation Plan

1. **Clerk dashboard**: Enable both email and phone auth; configure Telnyx
2. **Tiers config**: Add "phone" tier with unlimited sessions, gpt-4o, canExport
3. **Home page**: 3-state flow (anonymous, email, phone)
4. **Chat workspace**: 3 gate states with progressive unlock
5. **Terms page**: Conditional SMS consent (only for phone users)
6. **Tier upgrade flow**: Email → Phone within the app
7. **Clerk webhook**: Sync phone/email, auto-upgrade tier on phone addition
8. **Admin page**: Show tier column, phone/SMS status