# Security Notes

## Current MVP posture

- **Client-side demo data only.** In demo mode, all claim data lives in the browser's
  `localStorage` under a single namespaced key and never leaves the device. There is no server
  persistence, so there is nothing to breach server-side in this configuration.
- **No secrets in the client bundle.** `.env.example` clearly separates `NEXT_PUBLIC_*` values
  (safe for the browser) from `SUPABASE_SERVICE_ROLE_KEY` (server-only, never imported into any
  client component or `"use client"` file).
- **Auth scaffolding.** `src/lib/supabase/client.ts` / `server.ts` are structured for Supabase
  Auth (`@supabase/ssr`), which handles session cookies securely server-side when connected.

## Production security requirements (see supabase/schema.sql)

- **Row Level Security (RLS)** is enabled on every user-owned table (`claims`,
  `intake_responses`, `timeline_events`, `documents`, `claim_scores`, `score_factors`,
  `consultation_requests`, `consent_records`, `notifications`, `activity_log`), scoped to
  `auth.uid()`. Reference tables (`resources`, `faq_items`, `law_firms`, `lawyer_profiles`) are
  public read-only.
- **Private-by-default claim data.** No claim, document, or timeline data is exposed publicly.
  Sharing with a lawyer requires an explicit, logged consent action
  (`consultation_requests.shared_summary`, `consent_records`).
- **File access controls.** `documents.storage_path` is designed to reference objects in a
  private Supabase Storage bucket (`claim-documents`), with storage-level RLS restricting access
  to the claim's owner (and, with consent, a matched lawyer's role).
- **Role-based access concepts.** `user_profiles.account_type` distinguishes `consumer`,
  `lawyer`, and `admin` roles for the broader JusticeIQ ecosystem; production RLS policies would
  add lawyer-scoped read access to `consultation_requests` where they are the requested lawyer.
- **Audit logging.** `activity_log` records key actions per user; `docs/ROADMAP.md` calls for a
  dedicated immutable audit trail (e.g. via Postgres triggers or a logging service) for
  compliance-grade auditability.
- **Encryption.** Supabase encrypts data at rest and in transit by default (TLS + AES-256 at the
  storage layer); no additional MVP-level action is required, though field-level encryption for
  especially sensitive fields (e.g. medical details) is a roadmap item.
- **Session timeout.** Supabase Auth sessions are JWT-based with configurable expiry; production
  configuration should set a reasonable idle/absolute session timeout for a legal-data product.
- **Data deletion.** The Profile page includes a "Request data deletion" flow; production
  implementation should cascade-delete (or anonymize, if legally required to retain records) all
  related rows via the foreign key `on delete cascade` relationships already defined in the
  schema.

## Explicitly out of scope for this MVP

- Multi-factor authentication
- SOC 2 / HIPAA-grade compliance tooling
- Real-time conflict-of-interest screening for lawyers (placeholder field only)
- Penetration testing / third-party security audit
