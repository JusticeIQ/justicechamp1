# JusticeChamp™ — Consumer Legal Intake & Claim-Assessment MVP

JusticeChamp helps members of the public document incidents, organize evidence, understand the
readiness of a potential legal claim, and connect with appropriate lawyers. It is the
consumer-facing application within the broader **SolonIQ™** legal intelligence ecosystem.

This MVP supports two legal categories: **Personal Injury** and **Employment Law**.

> JusticeChamp is not a law firm and does not provide legal advice or representation. All scores,
> assessments, and recommendations are preliminary and informational only.

## Quick start (demo mode)

The app runs fully in **seeded demo mode** with no external services required — ideal for local
development and live demos.

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, click **Continue with demo account** on the login page (or the
landing page), and you'll be dropped into a dashboard pre-loaded with two sample claims, documents,
timelines, claim scores, and lawyer matches.

Demo mode uses browser `localStorage` (no backend) so every visitor gets a clean, isolated sandbox
that resets when they sign out.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript** + **React 18**
- **Tailwind CSS** for styling
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) client scaffolding for auth, Postgres,
  and file storage — wired up but optional; the app auto-falls-back to demo mode when credentials
  aren't configured (see `src/lib/supabase/`)
- Deployable to **Vercel**

## Project structure

```
justicechamp/
├── src/
│   ├── app/                        # Next.js App Router routes (see full route list below)
│   ├── components/                 # Reusable UI: Navbar, MobileNav, AppShell, IntakeFlow, etc.
│   └── lib/
│       ├── types.ts                # Core domain types (mirrors supabase/schema.sql)
│       ├── demo-data.ts            # Seeded fictional demo users/claims/lawyers/resources/FAQ
│       ├── intake-config.ts        # Step/field configuration for both intake workflows
│       ├── scoring.ts              # Transparent "Rate My Claim" scoring engine
│       ├── store.tsx               # Client-side app state (React Context + localStorage)
│       └── supabase/               # Browser + server Supabase client factories
├── supabase/
│   ├── schema.sql                  # Full production Postgres schema + RLS policies
│   └── seed.sql                    # Reference seed data (firms, lawyers, resources, FAQ)
├── docs/                           # Architecture, security, roadmap, test checklist, deployment
├── .env.example
└── package.json
```

## Routes

| Route | Description |
|---|---|
| `/` | Landing page, SolonIQ ecosystem positioning |
| `/login`, `/signup`, `/forgot-password` | Auth entry points + one-click demo access |
| `/dashboard` | Consumer dashboard: claims, tasks, deadlines, activity |
| `/report-incident` | Category picker (Personal Injury vs. Employment) |
| `/report-incident/personal-injury` | 16-step guided personal injury intake |
| `/report-incident/employment` | 18-step guided employment intake |
| `/claims`, `/claims/[claimId]` | Claim list and full claim summary/detail |
| `/rate-my-claim` | Claim-readiness score, breakdown, and explanation |
| `/documents` | Upload/categorize/manage evidence |
| `/timeline` | Interactive chronology builder |
| `/lawyer-matches` | Sample partner-lawyer matching and consultation requests |
| `/resources` | Filterable resource library |
| `/faq` | Searchable FAQ with accordion |
| `/help` | Help center + emergency disclaimer |
| `/profile` | Account, privacy settings, data deletion |
| `/privacy`, `/terms` | Legal pages |
| `/demo` | Presenter-friendly guided demo tour (15-step journey) |

## How demo mode works

`src/lib/store.tsx` exposes an `AppStateProvider` (wrapped around the whole app in
`src/app/layout.tsx`) backed by React Context and persisted to `localStorage`. Clicking **Continue
with demo account** seeds:

- 1 demo consumer user (Jordan Reyes)
- 2 demo claims (personal injury motor-vehicle collision; employment termination/retaliation)
- Sample documents, timeline events, and pre-computed claim scores for each
- Notifications and an activity log

All sample names, firms, and figures are **fictional demonstration content**.

## Connecting real Supabase (production path)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the Supabase SQL editor (creates tables + RLS policies)
3. Optionally run `supabase/seed.sql` for reference data (law firms, lawyers, resources, FAQ)
4. Copy `.env.example` to `.env.local` and fill in your project's URL and anon key
5. Replace the demo-mode `useAppState()` store calls in `src/app` with Supabase queries via
   `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (server components) —
   see `docs/ARCHITECTURE.md` for the recommended migration path

See `docs/DEPLOYMENT.md` for full Supabase, Vercel, and GitHub instructions.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — product & technical architecture summary
- [`docs/SECURITY.md`](docs/SECURITY.md) — security and privacy notes
- [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) — known MVP limitations
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — future production roadmap
- [`docs/TEST_CHECKLIST.md`](docs/TEST_CHECKLIST.md) — manual QA checklist
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — local, Supabase, Vercel, and GitHub setup
- [`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md) — screenshot/preview guidance for decks

## Demo credentials

No password is required — demo access is one click ("Continue with demo account") on `/login`,
`/signup`, or the landing page. Manual email/password sign-in accepts any non-empty email and
password combination in demo mode and loads the same seeded data (there is no real backend to
authenticate against yet).

## License / disclaimer

All lawyer, firm, and client data shown is fictional demonstration content created for this MVP.
JusticeChamp is not a law firm and does not provide legal advice.
