# Deployment Guide

## 1. Local installation

```bash
git clone <your-repo-url> justicechamp
cd justicechamp
npm install
cp .env.example .env.local   # optional — demo mode works without this
npm run dev
```

Visit `http://localhost:3000`. Without Supabase credentials configured, the app runs entirely in
seeded demo mode (see README).

## 2. Supabase setup (for production data persistence)

1. Create a project at [supabase.com](https://supabase.com/dashboard)
2. In the SQL Editor, run the contents of `supabase/schema.sql` (creates all tables, indexes, and
   Row Level Security policies)
3. Optionally run `supabase/seed.sql` for reference data (sample law firms, lawyers, resources,
   FAQ). Claim-level seed rows require a real `auth.users` id — create a user first (via Supabase
   Auth or the app's signup flow), then follow the commented example at the bottom of the file.
4. Create a private Storage bucket named `claim-documents` (Storage → New bucket → uncheck
   "Public") for uploaded evidence, and configure storage RLS policies so only a claim's owner can
   read/write objects under `claim-documents/{claim_id}/...`
5. In Project Settings → API, copy your **Project URL** and **anon public key**
6. Set them as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (or
   your hosting provider's environment variables)
7. If you need server-side privileged access (e.g. for admin tooling), also set
   `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, never expose this to the client

> Note: the current MVP UI still reads/writes through the local demo store
> (`src/lib/store.tsx`). Connecting Supabase end-to-end requires replacing those calls with
> Supabase queries — see `docs/ARCHITECTURE.md` for the recommended approach. The schema, RLS
> policies, and client factories are ready for that work.

## 3. Vercel deployment

1. Push your repository to GitHub (see below)
2. In [Vercel](https://vercel.com/new), import the repository
3. Framework preset: **Next.js** (auto-detected)
4. Add environment variables (Project Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; mark as "Sensitive")
   - `NEXT_PUBLIC_APP_URL` (your production URL, e.g. `https://justicechamp.vercel.app`)
5. Deploy. Vercel will build with `npm run build` and serve via `next start` automatically.
6. The app works even if Supabase variables are omitted — it will run in demo mode in production
   too, which is useful for a public investor-facing preview link.

## 4. GitHub setup

```bash
cd justicechamp
git init
git add .
git commit -m "Initial JusticeChamp MVP"
git branch -M main
git remote add origin https://github.com/<your-org>/justicechamp.git
git push -u origin main
```

Then connect the repo to Vercel for automatic deployments on every push to `main`.

## 5. Environment variable reference

See `.env.example` for the full list with comments. Never commit `.env.local` or any file
containing real Supabase credentials — `.gitignore` already excludes `.env*` (except
`.env.example`).
