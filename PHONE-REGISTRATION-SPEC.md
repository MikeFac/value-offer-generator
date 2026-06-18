# Phone-First Registration Spec

## Overview

Replace email-based registration with phone-number registration via SMS OTP. Users must provide a phone number and explicitly consent to SMS marketing to use the tool beyond the anonymous session. This aligns the registration medium with the product (outbound calling), pre-qualifies leads, and ensures high-reach follow-up.

## Registration Flow

### Anonymous Session (No Registration)
1. User lands on offerfu.com, enters a vertical, clicks "Start Free"
2. Full chat experience with GPT-4o-mini
3. Script preview panel works, but Save and Download show "Enter your phone number to save and export"
4. No phone number, no email, no account required
5. One anonymous session only — second attempt redirects to phone registration

### Phone Registration (Primary Gate)
1. User clicks "Save Script" or "Export" or tries to start a second session
2. Registration screen appears with:
   - Phone number input (international format, with country code selector)
   - Checkbox: **"I agree to receive SMS messages from OfferFu. Message frequency varies. Msg & data rates may apply. Reply STOP to unsubscribe."** (required, not optional)
   - "Send Verification Code" button
3. Clerk handles the SMS OTP via Telnyx as the SMS provider
4. User enters OTP
5. Account is created with phone number as primary identifier
6. User is redirected back to their session with full Save/Export unlocked

### Phone + Email (Optional Enhancement)
- After phone verification, prompt (do not require) for email: "Add an email for script delivery and backup"
- Email is secondary — phone is the account key

## Clerk + Telnyx Integration

### How It Works
- **Clerk** manages the entire auth flow: phone input, OTP verification, session cookies, user management
- **Telnyx** is the SMS delivery provider configured inside Clerk's dashboard (cheaper than Clerk's default SMS provider)
- **OfferFu** adds the SMS consent checkbox on top of Clerk's auth flow and stores the consent record in our database

### Clerk Configuration Steps
1. In the Clerk dashboard for the OfferFu application:
   - Go to **User & Authentication → Email, Phone, Username**
   - Enable **Phone number** as a sign-in method
   - Disable **Email** as a sign-in method (email becomes optional, collect after registration)
   - Set phone number to **Required**
2. Go to **SMS Delivery** in Clerk settings
   - Select **Telnyx** as the SMS provider
   - Enter Telnyx API key and phone number
3. Go to **Paths**
   - Set Sign-in URL to `/sign-in`
   - Set Sign-up URL to `/sign-up`
   - Set After sign-in URL to `/`
   - Set After sign-up URL to `/`
4. Go to **Domains & URLs**
   - Add `offerfu.com` and `www.offerfu.com`

### Custom SMS Consent Flow
Clerk's built-in phone sign-up does NOT include a TCPA-compliant SMS marketing consent checkbox. We must add this ourselves:

1. When Clerk's `<SignIn>` or `<SignUp>` component fires the `afterSignIn` or `afterSignUp` callback, we check our database for the user
2. If the user has no `smsConsent` record, we redirect to `/terms` (which already exists and includes the SMS consent section)
3. The T&C acceptance page now includes the SMS marketing consent checkbox
4. On acceptance, we store `smsConsent: true`, `smsConsentAt: now()`, `smsConsentText: <exact text>` in the User table

This means the flow is:
- Anonymous → chat → wants to save → Clerk sign-up (phone + OTP) → `/terms` (with SMS consent) → back to session

## Data Model Changes

### User Model Updates
```
User
  id                String    @id @default(cuid())
  phone             String?   @unique                              // Populated by Clerk, E.164 format
  email             String?   @unique                              // Optional, added after registration
  name              String?
  role              String    @default("bd_strategist")
  tier              String    @default("free")
  phoneVerified     Boolean   @default(false) @map("phone_verified")
  smsConsent        Boolean   @default(false) @map("sms_consent")
  smsConsentAt      DateTime? @map("sms_consent_at")
  smsConsentText    String?   @map("sms_consent_text")
  termsAcceptedAt   DateTime? @map("terms_accepted_at")
  stripeCustomerId  String?   @map("stripe_customer_id")
  stripeSubscriptionId String? @map("stripe_subscription_id")
  createdAt         DateTime  @default(now()) @map("created_at")

  sessions         Session[]
  monthlyUsages    MonthlyUsage[]

  @@map("users")
```

### SmsLog Model (New — for audit trail)
```
SmsLog
  id          String   @id @default(cuid())
  userId       String?  @map("user_id")
  phone       String
  type        String                              // "otp_verify", "marketing", "transactional"
  message     String
  twilioSid   String?   @map("twilio_sid")         // or telnyxId — rename later if needed
  status      String                              // "sent", "delivered", "failed"
  createdAt   DateTime  @default(now()) @map("created_at")

  user        User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("sms_logs")
```

## SMS Consent Language

The checkbox text must be:

> **I agree to receive SMS messages from OfferFu. Message frequency varies. Msg & data rates may apply. Reply STOP to unsubscribe.**

This text is stored in `smsConsentText` at the time of consent for legal proof.

### T&Cs — New Section

**9. SMS Communications**
By providing your phone number and checking the SMS consent box, you agree to receive text messages from OfferFu. These may include:
- Verification codes for account security
- Notifications about your generated scripts
- Marketing messages about our services and products
- Follow-up communications related to your use of the tool

Message frequency varies. Standard message and data rates may apply. You can opt out at any time by replying STOP to any message or contacting us. We do not sell your phone number to third parties.

## Frontend Changes

### Home Page
- Anonymous view: "Start Free" button creates an anonymous session (no login)
- Signed-out + used anonymous session: show "Sign Up to Continue" with Clerk's phone sign-in
- Signed-in view: show session count, UserButton

### Clerk Components
- Replace `<SignInButton>` and `<SignUpButton>` with Clerk's `<SignIn>` and `<SignUp>` components configured for phone-first auth
- After successful sign-up/sign-in, redirect to `/terms` if `smsConsent` is not yet recorded
- After terms acceptance, redirect to `/` or back to their session

### Chat Workspace
- Anonymous: Save/Download buttons show "Enter your phone number to save and export"
  - Clicking redirects to sign-up
- Authenticated without SMS consent: redirected to `/terms`
- Authenticated with SMS consent: full access

### Terms Page
- Add the SMS consent checkbox (required) alongside the existing T&C acceptance
- Store consent text and timestamp on acceptance

## Implementation Plan

1. **Clerk dashboard**: Configure phone auth + Telnyx SMS provider
2. **Prisma migration**: Add `phone`, `phoneVerified`, `smsConsent`, `smsConsentAt`, `smsConsentText` to User; create SmsLog table
3. **Terms page**: Add SMS consent checkbox to the existing T&C page
4. **Home page**: Update sign-up flow to use Clerk phone auth
5. **Chat workspace**: Gate Save/Export behind `smsConsent === true`
6. **Admin page**: Show phone number, SMS consent status in user table
7. **Marketing SMS**: Future — use Telnyx API directly for between-call touchpoints