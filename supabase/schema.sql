-- JusticeChamp production database schema (PostgreSQL / Supabase)
-- Run this in the Supabase SQL editor, or via `supabase db push`.
-- Row Level Security (RLS) policies below assume Supabase Auth, where
-- auth.uid() returns the authenticated user's UUID.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- Users & profiles
-- ---------------------------------------------------------------------

-- Supabase Auth manages the base `auth.users` table. This table stores
-- consumer-facing profile data linked 1:1 to an auth user.
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  jurisdiction text,
  preferred_language text default 'English',
  account_type text not null default 'consumer' check (account_type in ('consumer', 'lawyer', 'admin')),
  consent_claim_comms boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Claims
-- ---------------------------------------------------------------------

create table if not exists public.claim_categories (
  id text primary key,
  label text not null,
  description text
);

insert into public.claim_categories (id, label, description) values
  ('personal_injury', 'Personal Injury', 'Motor vehicle, slip and fall, premises, medical, and product injury matters.'),
  ('employment', 'Employment Law', 'Termination, discrimination, harassment, retaliation, and wage matters.')
on conflict (id) do nothing;

create table if not exists public.claims (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null references public.claim_categories(id),
  subtype text,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'submitted', 'under_review', 'matched')),
  jurisdiction text,
  incident_date date,
  deadline_date date,
  deadline_label text,
  goals text,
  current_step int not null default 0,
  total_steps int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_claims_user_id on public.claims(user_id);

-- ---------------------------------------------------------------------
-- Intake responses
-- ---------------------------------------------------------------------

create table if not exists public.intake_responses (
  id uuid primary key default uuid_generate_v4(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  step_id text not null,
  field_id text not null,
  value jsonb,
  status text not null default 'answered' check (status in ('answered', 'unknown', 'not_applicable', 'later')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (claim_id, field_id)
);

create index if not exists idx_intake_responses_claim_id on public.intake_responses(claim_id);

-- ---------------------------------------------------------------------
-- Timeline events
-- ---------------------------------------------------------------------

create table if not exists public.timeline_events (
  id uuid primary key default uuid_generate_v4(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  event_date date not null,
  title text not null,
  description text,
  people_involved text,
  significance text not null default 'medium' check (significance in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

create index if not exists idx_timeline_events_claim_id on public.timeline_events(claim_id);

-- ---------------------------------------------------------------------
-- Documents
-- ---------------------------------------------------------------------

create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id),
  storage_path text, -- path within Supabase Storage bucket "claim-documents"
  name text not null,
  category text not null,
  description text,
  important boolean not null default false,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'needs_review')),
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists idx_documents_claim_id on public.documents(claim_id);

create table if not exists public.timeline_event_documents (
  timeline_event_id uuid not null references public.timeline_events(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  primary key (timeline_event_id, document_id)
);

-- ---------------------------------------------------------------------
-- Claim scores
-- ---------------------------------------------------------------------

create table if not exists public.claim_scores (
  id uuid primary key default uuid_generate_v4(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  claim_readiness int not null,
  information_completeness int not null,
  evidence_strength int not null,
  timeline_clarity int not null,
  urgency text not null,
  lawyer_review_priority text not null,
  ai_confidence int not null,
  score_band text not null,
  missing_information jsonb not null default '[]',
  recommended_next_steps jsonb not null default '[]',
  strengths jsonb not null default '[]',
  weaknesses jsonb not null default '[]',
  generated_at timestamptz not null default now()
);

create index if not exists idx_claim_scores_claim_id on public.claim_scores(claim_id);

create table if not exists public.score_factors (
  id uuid primary key default uuid_generate_v4(),
  claim_score_id uuid not null references public.claim_scores(id) on delete cascade,
  label text not null,
  weight int not null,
  achieved int not null,
  detail text
);

-- ---------------------------------------------------------------------
-- Lawyers, firms, matches, consultations
-- ---------------------------------------------------------------------

create table if not exists public.law_firms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  jurisdiction text,
  verified_partner boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lawyer_profiles (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references public.law_firms(id) on delete set null,
  full_name text not null,
  practice_areas text[] not null default '{}',
  jurisdiction text,
  languages text[] not null default '{}',
  years_experience int,
  description text,
  availability text,
  capacity int not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists public.lawyer_matches (
  id uuid primary key default uuid_generate_v4(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  lawyer_id uuid not null references public.lawyer_profiles(id) on delete cascade,
  match_score int not null,
  match_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.consultation_requests (
  id uuid primary key default uuid_generate_v4(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  lawyer_id uuid not null references public.lawyer_profiles(id) on delete cascade,
  requested_by uuid not null references auth.users(id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  shared_summary boolean not null default false,
  requested_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Consent, notifications, resources, FAQ, activity log
-- ---------------------------------------------------------------------

create table if not exists public.consent_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null, -- e.g. 'terms', 'privacy', 'claim_comms', 'share_with_lawyer'
  granted boolean not null,
  related_claim_id uuid references public.claims(id) on delete set null,
  recorded_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  type text not null default 'info' check (type in ('info', 'deadline', 'match', 'task')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  category text,
  reading_time text,
  body text,
  created_at timestamptz not null default now()
);

create table if not exists public.faq_items (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  claim_id uuid references public.claims(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.user_profiles enable row level security;
alter table public.claims enable row level security;
alter table public.intake_responses enable row level security;
alter table public.timeline_events enable row level security;
alter table public.documents enable row level security;
alter table public.claim_scores enable row level security;
alter table public.score_factors enable row level security;
alter table public.consultation_requests enable row level security;
alter table public.consent_records enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;

-- Users can only see and modify their own profile
create policy "profile is self-accessible" on public.user_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Claims are private to their owner by default
create policy "claims are owner-accessible" on public.claims
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Child tables inherit access through their parent claim's owner
create policy "intake responses follow claim owner" on public.intake_responses
  for all using (exists (select 1 from public.claims c where c.id = claim_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.claims c where c.id = claim_id and c.user_id = auth.uid()));

create policy "timeline events follow claim owner" on public.timeline_events
  for all using (exists (select 1 from public.claims c where c.id = claim_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.claims c where c.id = claim_id and c.user_id = auth.uid()));

create policy "documents follow claim owner" on public.documents
  for all using (exists (select 1 from public.claims c where c.id = claim_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.claims c where c.id = claim_id and c.user_id = auth.uid()));

create policy "claim scores follow claim owner" on public.claim_scores
  for all using (exists (select 1 from public.claims c where c.id = claim_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.claims c where c.id = claim_id and c.user_id = auth.uid()));

create policy "score factors follow claim owner" on public.score_factors
  for all using (exists (
    select 1 from public.claim_scores s join public.claims c on c.id = s.claim_id
    where s.id = claim_score_id and c.user_id = auth.uid()
  ));

-- Consultation requests: visible to the requesting consumer only (a
-- production system would add a matching policy for authenticated
-- lawyer accounts scoped to their own lawyer_profiles.id)
create policy "consultation requests are requester-accessible" on public.consultation_requests
  for all using (auth.uid() = requested_by) with check (auth.uid() = requested_by);

create policy "consent records are self-accessible" on public.consent_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notifications are self-accessible" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "activity log is self-accessible" on public.activity_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Resources, FAQ, and lawyer directory data are public read-only content
alter table public.resources enable row level security;
alter table public.faq_items enable row level security;
alter table public.law_firms enable row level security;
alter table public.lawyer_profiles enable row level security;

create policy "resources are publicly readable" on public.resources for select using (true);
create policy "faq items are publicly readable" on public.faq_items for select using (true);
create policy "law firms are publicly readable" on public.law_firms for select using (true);
create policy "lawyer profiles are publicly readable" on public.lawyer_profiles for select using (true);

-- ---------------------------------------------------------------------
-- Storage (run once; Supabase Storage bucket for claim documents)
-- ---------------------------------------------------------------------
-- insert into storage.buckets (id, name, public) values ('claim-documents', 'claim-documents', false)
--   on conflict (id) do nothing;
-- Configure storage RLS policies separately so only a claim's owner (and,
-- with consent, a matched lawyer) can read/write objects under
-- claim-documents/{claim_id}/...
