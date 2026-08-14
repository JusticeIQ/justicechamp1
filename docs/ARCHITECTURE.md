# Product & Technical Architecture Summary

## Product architecture

JusticeChamp is the consumer-facing application within the SolonIQ legal intelligence
ecosystem. Its core loop is:

1. **Document** — guided, plain-language incident intake (Personal Injury or Employment Law)
2. **Organize** — evidence upload/categorization and interactive chronology
3. **Understand** — transparent, factor-based "Rate My Claim" readiness score
4. **Connect** — consent-based sharing with matched, licensed lawyers

Every step surfaces progress (step number, percentage complete), supports autosave, and can be
exited and resumed without data loss.

## Technical architecture

- **Framework**: Next.js 14 App Router with TypeScript and React 18 Server/Client Components.
  Most interactive views are Client Components (`"use client"`) because the MVP's data layer is
  local-first (see below); a production build would shift data-fetching to Server Components
  backed by Supabase queries.
- **Styling**: Tailwind CSS with a small custom design system (`navy`/`teal`/`warmbg` palette) and
  a shared component library in `src/components/ui.tsx` (`Card`, `Badge`, `Button`, `ProgressBar`,
  `DisclaimerBanner`, `EmptyState`, `Spinner`).
- **State/data layer (MVP)**: `src/lib/store.tsx` implements `AppStateProvider`, a React Context
  provider persisted to `localStorage`. It exposes typed CRUD actions (`createClaim`,
  `updateAnswer`, `addTimelineEvent`, `addDocument`, `recomputeScore`, `requestConsultation`, etc.)
  consumed via the `useAppState()` hook throughout the app. This lets the entire product run
  client-side with zero external dependencies for demos.
- **Data layer (production path)**: `src/lib/supabase/client.ts` and `server.ts` provide typed
  Supabase client factories that read `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  When unset, the app cleanly falls back to demo mode (`isSupabaseConfigured` flag). The intended
  migration path is to replace `useAppState()` calls with Supabase queries/mutations behind the
  same function signatures, keeping component code largely unchanged.
- **Scoring engine**: `src/lib/scoring.ts` computes `ClaimScore` from a `Claim` object using a
  transparent, weighted-factor model (field completeness, date/jurisdiction presence, evidence
  count, witness info, medical/financial fields, timeline depth). It deliberately avoids any
  "probability of winning" or settlement-value computation.
- **Intake engine**: `src/lib/intake-config.ts` declares steps/fields per category;
  `src/components/IntakeFlow.tsx` is a single generic renderer driven by that config, used by both
  `/report-incident/personal-injury` and `/report-incident/employment`.
- **Seed/demo data**: `src/lib/demo-data.ts` builds two fully-populated demo claims (with answers,
  timeline, documents, and computed scores) plus lawyer, resource, and FAQ reference data — all
  clearly fictional.

## Data model

See `supabase/schema.sql` for the full production schema: `user_profiles`, `claims`,
`claim_categories`, `intake_responses`, `timeline_events`, `documents`,
`timeline_event_documents`, `claim_scores`, `score_factors`, `law_firms`, `lawyer_profiles`,
`lawyer_matches`, `consultation_requests`, `consent_records`, `notifications`, `resources`,
`faq_items`, `activity_log`. Row Level Security policies scope every claim-derived table to
`auth.uid() = claims.user_id` (or the equivalent join), so claim data is private by default.

## Why client-side state for the MVP?

The brief requires a demo that "works even when external services are not configured." Rather
than mocking a server, the MVP uses a real, typed state container (`AppStateProvider`) with the
same shape as the future Supabase-backed data layer. This means:

- The demo is fully functional offline / without any account setup
- The component layer already expects async-shaped, typed CRUD functions
- Swapping `localStorage` persistence for Supabase calls is a contained change inside
  `src/lib/store.tsx`, not a rewrite of every page
