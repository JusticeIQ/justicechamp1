-- JusticeChamp seed data (fictional demonstration content only).
-- Run after schema.sql. Reference data (law firms, lawyers, resources,
-- FAQ) does not depend on an authenticated user and can be seeded
-- immediately. Claim-level seed data requires a real auth.users row,
-- since claims.user_id references auth.users(id) — create a user via
-- Supabase Auth (or the signup flow) first, then substitute its UUID
-- below where marked.

-- ---------------------------------------------------------------------
-- Law firms & lawyers (fictional)
-- ---------------------------------------------------------------------

insert into public.law_firms (id, name, jurisdiction, verified_partner) values
  ('11111111-1111-1111-1111-111111111101', 'Alden & Cross Injury Law', 'California', true),
  ('11111111-1111-1111-1111-111111111102', 'Coastal Advocates LLP', 'California', true),
  ('11111111-1111-1111-1111-111111111103', 'Whitmore Employment Law Group', 'California', true),
  ('11111111-1111-1111-1111-111111111104', 'Park & Nguyen Workplace Counsel', 'California', true)
on conflict (id) do nothing;

insert into public.lawyer_profiles (id, firm_id, full_name, practice_areas, jurisdiction, languages, years_experience, description, availability, capacity) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Michael Alden', array['personal_injury'], 'California', array['English','Spanish'], 17, 'Focused exclusively on motor vehicle and premises liability claims.', 'Consultations available within 3 business days', 8),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'Renata Silva', array['personal_injury'], 'California', array['English','Portuguese'], 11, 'Personal injury practice emphasizing thorough medical documentation review.', 'Consultations available this week', 6),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'Devon Whitmore', array['employment'], 'California', array['English'], 14, 'Represents employees in wrongful termination, discrimination, and retaliation matters.', 'Consultations available within 2 business days', 5),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', 'Grace Nguyen', array['employment'], 'California', array['English','Vietnamese'], 9, 'Employment law practice focused on PIP-related disputes and documentation review.', 'Consultations available this week', 7)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Resources
-- ---------------------------------------------------------------------

insert into public.resources (title, description, category, reading_time, body) values
  ('What to document after an accident', 'A practical checklist of what to record after an accident.', 'Personal Injury', '4 min read', 'After an accident, capture the scene with photos, note the time and location, exchange insurance information, and seek medical attention.'),
  ('How to preserve workplace emails', 'Steps to safely retain relevant emails without violating employer policy.', 'Workplace Documentation', '5 min read', 'Forward relevant emails where policy allows, take dated screenshots, and keep a written log of key conversations.'),
  ('Preparing a chronology', 'Why a clear timeline matters and how to build one.', 'Evidence Preservation', '6 min read', 'A chronology should list events in date order with short factual descriptions, avoiding assumptions or conclusions.'),
  ('What documents a lawyer may request', 'Commonly requested records for injury and employment matters.', 'Preparing for a Lawyer Consultation', '5 min read', 'Lawyers commonly request medical records, incident reports, contracts, correspondence, and pay records.'),
  ('Understanding limitation periods', 'Why legal deadlines matter and how they vary.', 'Deadlines', '4 min read', 'Most legal claims are subject to a filing deadline that varies by state, province, and claim type.'),
  ('Protecting your privacy', 'How to think about privacy when documenting sensitive incidents.', 'Privacy and Safety', '3 min read', 'Store sensitive documents securely and be cautious about discussing an active matter on social media.'),
  ('Questions to ask during a consultation', 'A starting list of questions for your first meeting with a lawyer.', 'Preparing for a Lawyer Consultation', '4 min read', 'Ask about experience with similar cases, fee structure, next steps, and expected timelines.'),
  ('How to record lost income', 'What information helps document lost wages.', 'Insurance', '4 min read', 'Keep pay stubs, a log of missed shifts, and correspondence about schedule changes.'),
  ('How to document ongoing symptoms', 'Simple habits that create a clear record of recovery over time.', 'Medical Documentation', '3 min read', 'A short dated log noting symptoms and limitations can be valuable alongside formal medical records.');

-- ---------------------------------------------------------------------
-- FAQ
-- ---------------------------------------------------------------------

insert into public.faq_items (question, answer, category) values
  ('Is JusticeChamp a law firm?', 'No. JusticeChamp is not a law firm and does not provide legal representation.', 'General'),
  ('Does JusticeChamp provide legal advice?', 'No. It provides general legal information and a preliminary, informational claim-readiness assessment.', 'General'),
  ('How is my information used?', 'To help you organize your claim and, only with consent, share details with a lawyer you choose to contact.', 'Privacy'),
  ('Who can view my incident report?', 'By default, only you. It is shared with a lawyer only if you request and consent to a consultation.', 'Privacy'),
  ('Can I delete my information?', 'Yes, at any time from your Profile page.', 'Privacy'),
  ('How does Rate My Claim work?', 'It analyzes completeness and consistency of your intake to produce a transparent readiness score.', 'Rate My Claim'),
  ('Does a high score guarantee success?', 'No. It reflects intake completeness, not the strength or outcome of a legal claim.', 'Rate My Claim');

-- ---------------------------------------------------------------------
-- Example claim seed (replace :demo_user_id with a real auth.users.id)
-- ---------------------------------------------------------------------
-- insert into public.claims (id, user_id, category, subtype, title, status, jurisdiction, incident_date, deadline_date, deadline_label, goals, current_step, total_steps)
-- values (
--   '33333333-3333-3333-3333-333333333301', :demo_user_id, 'personal_injury', 'Motor vehicle accident',
--   'Motor vehicle collision — 4th & Alameda', 'submitted', 'California', '2026-05-14', '2028-05-14',
--   'California personal injury statute of limitations (approx.)', 'Recover costs of medical treatment and lost wages.', 16, 16
-- );
