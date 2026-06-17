# Value Offer Generator — App Spec

## Purpose

A conversational AI web app that helps outbound business development teams craft a **specific, credible value offer** and a **ready-to-use outbound script** for any vertical market. The user chats with the AI about a target vertical; the AI researches and reasons its way to a compelling free-value offer that business owners in that vertical would actually want; then generates a complete three-call script package the user can take straight to the phones.

The app itself doubles as the **Value Call** in the platform's own three-call framework: giving it away for free to prospective business clients (campaigners) is a lead magnet that demonstrates the platform's expertise and earns the right to ask for their business.

## Demo Story

1. User lands on the app and enters a vertical (e.g., "HVAC contractors in Phoenix", "real estate agents in Brisbane", "dental practices in Chicago").
2. A chat interface opens. The AI asks clarifying questions: size of target companies, common pain points, what the user's company does, competitive landscape the prospect faces.
3. Through conversation, the AI proposes and refines a value offer — something genuinely useful the user can give away on Call 1 of the three-call framework.
4. Once the user is satisfied with the value offer, the AI generates a full three-call script package: Call 1 (value delivery), Call 2 (follow-up), Call 3 (the ask).
5. The user can download or copy the script package and go to work.

## The Dual-Use Lead Magnet Strategy

This app is not just an internal tool. It is itself the embodiment of the value-first philosophy:

**How it works as a lead magnet for the telemarketing marketplace:**

1. **Call 1 (Give the app away):** Reach out to a prospective business client (e.g., an HVAC company that needs outbound calling). Instead of pitching the telemarketing platform, give them access to the Value Offer Generator. Say: "We built a tool that creates custom outbound scripts with a value-first approach for your vertical. It's free — no strings." They use it. They get a useful script they can give to their own salespeople.

2. **Call 2 (Follow up on results):** Check in. Did the script work? Did their team use it? Offer to refine it or generate scripts for another vertical they serve. This deepens the relationship and demonstrates the platform's expertise in outbound.

3. **Call 3 (Ask for the business):** Now pitch the telemarketing marketplace. "You've seen our approach works. Imagine having trained callers executing that script at scale across every vertical you serve. That's what our platform does." The prospect has already experienced value from you. The ask is earned.

This is the three-call framework eating its own tail — the tool that teaches the framework *is* the framework's Call 1.

## User Roles

### BD Strategist (primary user)

- Enters a vertical market
- Chats with the AI to shape the value offer
- Reviews and iterates on generated scripts
- Downloads the final script package
- Can save and revisit past sessions

### Prospective Business Client (lead magnet user)

- Same experience as BD Strategist
- May have reduced features or export limits to create a natural upsell moment
- Account created with email (lead capture)

## Core Screens

### 1. Landing / Vertical Entry

A single input field: "What vertical market do you want to sell into?" with a few example placeholders that rotate (HVAC, dental, real estate, insurance, legal, SaaS). A short explainer paragraph about the value-first approach lives below the input — this educates the lead magnet user while orienting the BD strategist.

Below the fold: a brief summary of the three-call framework (1-2 sentences per call) so anyone landing on the page immediately understands the philosophy the tool is built on.

### 2. Chat Workspace

Full-screen chat interface. Left panel: the conversation. Right panel (or collapsible): live preview of the emerging value offer and script.

The AI conversation follows a structured flow but feels natural:

**Phase 1 — Vertical Discovery (2-4 exchanges)**
- AI asks about the vertical: "What do businesses in this vertical typically struggle with?" "Who are their customers?" "What's the competitive landscape?"
- If the user is vague, the AI proposes what it knows and asks for confirmation
- Goal: enough context to design a value offer

**Phase 2 — Value Offer Design (3-5 exchanges)**
- AI proposes 2-3 value offer options specific to the vertical
- Each option includes: what the offer is, why the prospect would want it, how to deliver it on a call
- AI asks the user to pick or refine: "Which of these feels most natural for your team to deliver?" "Would your prospects care more about saving time or saving money?"
- Iterates until the user says the offer is right

**Phase 3 — Script Generation (1-2 exchanges)**
- AI generates the full three-call script package
- Each call script includes: opener, body, close, tonality notes, objection handles
- User can request tweaks: "Make Call 1 shorter", "Add a handle for 'just not interested'", "The value offer needs to sound less generic"
- AI revises

**Phase 4 — Package & Export**
- AI presents the final package in a clean, copy-ready format
- User can download as PDF, copy to clipboard, or save to their session library

### 3. Session Library

A simple list of past sessions, each showing: vertical name, date, status (draft/complete). Click to reopen the chat and continue refining.

## Data Model

```
User
  id
  email
  name
  role (bd_strategist | lead_magnet)
  created_at

Session
  id
  user_id
  vertical_name
  vertical_context (jsonb — AI-extracted facts about the vertical)
  value_offer (jsonb — the final agreed value offer)
  scripts (jsonb — the three-call script package)
  status (discovering | designing | generated | complete)
  created_at
  updated_at

Message
  id
  session_id
  role (user | assistant)
  content
  phase (discovery | design | generation | export)
  created_at
```

No complex relational graph needed for MVP. Sessions are self-contained. Scripts are stored as structured JSON for easy regeneration and export.

## Script Output Format

Each generated script package follows this structure:

```json
{
  "vertical": "HVAC contractors in Phoenix",
  "value_offer": {
    "type": "free_after_hours_call_script",
    "description": "A plug-and-play after-hours answering script that captures leads instead of sending them to voicemail",
    "delivery_method": "Offered as a free PDF on Call 1",
    "why_it_works": "HVAC companies lose after-hours leads to voicemail; this solves an immediate, costly problem"
  },
  "call_1": {
    "label": "The Value Call",
    "opener": "...",
    "body": "...",
    "close": "...",
    "tonality_notes": "...",
    "duration_target": "60-90 seconds",
    "objection_handles": [
      { "objection": "I'm not interested", "response": "..." },
      { "objection": "What are you selling?", "response": "..." }
    ]
  },
  "call_2": {
    "label": "The Follow-Up",
    "opener": "...",
    "body": "...",
    "close": "...",
    "tonality_notes": "...",
    "duration_target": "2-3 minutes",
    "objection_handles": []
  },
  "call_3": {
    "label": "The Ask",
    "opener": "...",
    "body": "...",
    "close": "...",
    "tonality_notes": "...",
    "duration_target": "3-5 minutes",
    "objection_handles": [
      { "objection": "Not right now", "response": "..." },
      { "objection": "Too expensive", "response": "..." }
    ]
  },
  "timing": {
    "call_1_to_2": "3-5 business days",
    "call_2_to_3": "5-7 business days"
  },
  "between_call_touchpoints": [
    "Email summarizing the value delivered on the call",
    "Relevant article or resource with a personal note"
  ]
}
```

## AI System Prompt (Core Logic)

The AI agent operates with a system prompt that encodes:

1. **The Three-Call Framework** — the full philosophy from the strategy document, embedded as context so the AI never generates a script that asks on Call 1 or skips the value-first approach.

2. **Vertical Research Instructions** — the AI is instructed to reason about what business owners in the given vertical actually care about, what pain points are universal vs. niche, and what kinds of free offers would be genuinely valuable (not disguised pitches).

3. **Value Offer Quality Criteria** — the AI must validate every proposed value offer against these tests:
   - Is it genuinely useful even if the prospect never becomes a customer?
   - Can it be delivered in under 2 minutes on a phone call (or sent via email after the call)?
   - Is it specific to this vertical, not a generic platitude?
   - Would the prospect be surprised to receive this for free?

4. **Script Quality Criteria** — every generated script must:
   - Open with a pattern interrupt (not "How are you today?")
   - Deliver value on Call 1 without pivoting to a pitch
   - Include specific tonality notes for each section
   - Include at least 2 objection handles per call
   - Respect the timing and cadence guidelines

## Value Offer Categories (AI Reference)

The AI draws from these proven value offer categories when designing offers for a vertical:

| Category | Description | Example for HVAC |
| :--- | :--- | :--- |
| **Free Assessment / Audit** | A no-cost analysis of something the prospect cares about | Free after-hours lead capture audit — shows how many leads they're losing to voicemail |
| **Industry Benchmark Data** | Comparative data the prospect would not otherwise have | "We surveyed 50 HVAC companies in Phoenix — here's what the top 10% do differently on after-hours calls" |
| **Plug-and-Play Resource** | A ready-to-use tool or template | Free after-hours call answering script (the HVAC demo script) |
| **Competitive Intelligence** | Information about what competitors are doing | "3 of your top competitors now answer after-hours calls live — here's how that's changing the market" |
| **Referral / Introduction** | Connecting the prospect to someone who can help them | Introduction to a dispatcher who can handle overflow calls during peak season |
| **Quick Win Recommendation** | A specific, actionable change that produces immediate results | "Change your voicemail greeting to include your emergency line and you'll capture 15% more after-hours leads" |

The AI should propose offers from the category most natural to the vertical, then refine based on user feedback.

## Technical Architecture

### Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS, React 19
- **Auth:** Clerk (consistent with vapi-app; captures email for lead magnet use)
- **Database:** PostgreSQL via Prisma (consistent with caller-onboarding)
- **AI:** OpenAI API (GPT-4o or equivalent) for the chat agent
- **Storage:** Session and script data in PostgreSQL; PDF generation server-side

### Key Components

```
app/
  page.tsx                    — Landing / vertical entry
  chat/
    [sessionId]/
      page.tsx                — Chat workspace
  library/
      page.tsx                — Session library
  api/
    chat/
      route.ts                — Streaming chat endpoint
    sessions/
      route.ts                — CRUD for sessions
    export/
      route.ts                — PDF generation and download
    webhooks/
      clerk/
        route.ts              — Clerk auth webhooks

lib/
  ai/
    agent.ts                  — AI agent logic, system prompt, phase management
    prompts/
      system.ts               — System prompt with three-call framework context
      discovery.ts            — Phase 1 prompt variants
      design.ts               — Phase 2 prompt variants
      generation.ts          — Phase 3 prompt variants
  export/
    pdf.ts                    — Script package PDF generator
  db/
    session.ts                — Session data access
    message.ts                — Message data access
```

### Chat Streaming

The chat endpoint should stream AI responses using the Vercel AI SDK or raw SSE. This gives the conversational feel users expect. Phase tracking happens server-side based on conversation progress — the AI's system prompt includes instructions for signaling which phase we're in, and the server updates the session status accordingly.

### PDF Export

Use a server-side PDF library (e.g., `@react-pdf/renderer` or `puppeteer` with a styled HTML template) to generate a clean, branded script document. The PDF should include:

- Vertical and date on the header
- The value offer summary
- Each of the three call scripts, clearly labeled
- Tonality notes in italics
- Objection handles in a callout box
- Timing and between-call touchpoints

## Non-Goals for MVP

- Multi-user collaboration on a session
- Voice/phone integration (this is a script generator, not a dialer)
- A/B testing of scripts
- CRM integration
- Automated calling or campaign execution
- Billing or paywall (lead magnet users get full access; the "payment" is their email and the relationship)
- Vertical-specific data integrations (e.g., pulling real MLS data for real estate)
- Mobile-native app (responsive web is sufficient)

## Lead Magnet Funnel Metrics

Since this app doubles as a lead magnet, track:

| Metric | Target | Purpose |
| :--- | :--- | :--- |
| **Email sign-up rate** | >40% of visitors | Top of funnel for telemarketing marketplace |
| **Completed session rate** | >50% of sign-ups | Users who generate at least one script |
| **Return session rate** | >25% within 30 days | Indicates the value offer actually landed |
| **Inbound inquiry rate** | >10% of return users | Users who reach out about the telemarketing platform after using the tool |
| **Script download rate** | >60% of completed sessions | Confirmation that the output is perceived as valuable |

These metrics answer the meta-question: is giving away this tool itself an effective Call 1?

## Future Enhancements

- **Vertical-specific data feeds:** Integrate real market data (e.g., MLS APIs for real estate, Yelp data for restaurants) so the AI can generate offers grounded in live data rather than general knowledge.
- **Script testing mode:** Let users role-play the script with an AI voice agent before going live.
- **Campaign launcher:** After generating a script, one-click to create a campaign on the telemarketing marketplace and assign callers.
- **Team accounts:** Multiple BD strategists under one organization, sharing session libraries.
- **Offer gallery:** A browsable library of value offers and scripts by vertical, contributed by users (with anonymization).
- **Performance tracking:** Once scripts are in use, track conversion rates by vertical and offer type to close the loop on what works.

## Build Estimate

Single strong full-stack developer using AI-assisted coding: **5-7 working days** for the MVP.

Breakdown:
- Days 1-2: Project setup, auth, database schema, vertical entry page, chat UI shell
- Days 3-4: AI agent logic (system prompt, phase management, streaming), script generation and iteration
- Days 5-6: Script preview panel, export (PDF + clipboard), session library, polish
- Day 7: Testing, edge cases, deployment