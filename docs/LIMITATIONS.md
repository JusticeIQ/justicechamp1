# Known MVP Limitations

This MVP is built for credible, functional demonstration to investors, lawyers, law-firm
partners, and technical evaluators. It is **not** production-hardened. Known limitations:

- **No real backend connected by default.** All data lives in browser `localStorage`. Supabase
  client scaffolding exists (`src/lib/supabase/`) and the schema is production-ready
  (`supabase/schema.sql`), but the app pages currently call the local `useAppState()` store, not
  live Supabase queries. Wiring this up is the top roadmap item.
- **No real file uploads.** The Documents page simulates uploads (captures the selected file's
  name and a randomized size label) rather than persisting bytes to Supabase Storage.
- **No real authentication.** Login/signup accept any non-empty email/password and seed the same
  demo state; there is no password hashing, verification email, or session token in this MVP.
- **Single jurisdiction example.** Demo content is California-specific; jurisdiction-aware
  deadline logic is illustrative only, not legally verified.
- **Lawyer matching is static sample data.** The four demo lawyer/firm profiles are fictional and
  matched via simple client-side filtering (practice area + jurisdiction), not a real matching
  or conflict-screening service.
- **AI Assistant is scripted, not model-backed.** The on-screen assistant returns canned,
  pre-written responses to a fixed set of suggestion buttons rather than calling an LLM. This
  keeps the demo deterministic and avoids unbounded/unsafe outputs, but is not representative of
  a production AI assistant's flexibility.
- **PDF export is simulated.** "Download as PDF" shows a confirmation message rather than
  generating a real PDF file in this MVP.
- **No automated test suite.** `docs/TEST_CHECKLIST.md` provides a manual QA checklist; unit/e2e
  tests are a roadmap item.
- **No multi-tenant lawyer/admin experience.** `account_type` exists in the schema for future
  SolonIQ integration, but only the consumer experience is built in this MVP.
