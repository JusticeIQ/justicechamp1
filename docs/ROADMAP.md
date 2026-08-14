# Future Production Roadmap

## Near-term (post-MVP)

- Wire `src/lib/store.tsx` actions to real Supabase queries/mutations (behind the same function
  signatures) so demo mode and production mode share one component layer
- Real Supabase Auth (email/password + magic link), with `user_profiles` created via a database
  trigger on `auth.users` insert
- Real file uploads to Supabase Storage (`claim-documents` bucket) with virus scanning and
  storage-level RLS
- Real PDF generation for claim summaries (e.g. via a serverless function using a headless
  renderer or PDF library)
- Expand jurisdiction coverage beyond California, with jurisdiction-specific deadline data

## Mid-term

- Lawyer- and admin-facing portals (matching `account_type` roles already in the schema):
  lawyers review shared claim summaries and respond to consultation requests; admins manage
  resources, FAQ content, and lawyer verification
- Real conflict-of-interest screening workflow before a match is shown to a consumer
- Configurable, jurisdiction-aware scoring factors (today's weights in `scoring.ts` are a
  reasonable default, not a legally validated model)
- Notification delivery via email/SMS (Supabase Edge Functions + a transactional email provider),
  not just in-app notifications
- Replace the scripted AI Assistant with a real LLM-backed assistant, constrained by the same
  guardrails (no outcome predictions, no advice to alter evidence, no impersonating a lawyer),
  with output moderation and logging

## Long-term

- Deeper SolonIQ ecosystem integration: shared identity across JusticeChamp and other SolonIQ
  products, unified analytics, and cross-product lawyer capacity management
- Additional legal categories beyond Personal Injury and Employment Law
- SOC 2 Type II readiness: formal audit logging, access reviews, incident response runbooks
- Multi-language support beyond English (the data model already supports a `languages` field on
  lawyer profiles and a `preferred_language` field on user profiles)
- Automated document classification (auto-suggesting a document's category from its content)
