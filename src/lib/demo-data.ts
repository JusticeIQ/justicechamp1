import { Claim, ClaimDocument, DemoUser, FaqItem, IntakeAnswer, LawyerMatch, LawyerMessage, Resource, TimelineEvent } from "./types";
import { computeClaimScore } from "./scoring";

// All names, firms, and figures below are FICTIONAL DEMONSTRATION DATA
// created for the JusticeChamp MVP walkthrough. No real persons, law
// firms, or claims are represented.

export const DEMO_USER: DemoUser = {
  id: "demo-user-1",
  fullName: "Jordan Reyes",
  email: "jordan.reyes@example.com",
  phone: "(555) 019-2231",
  jurisdiction: "California",
  preferredLanguage: "English",
  createdAt: "2026-06-01T09:00:00Z",
  consentClaimComms: true,
  accountType: "consumer",
};

function ans(stepId: string, fieldId: string, value: string, status: IntakeAnswer["status"] = "answered"): [string, IntakeAnswer] {
  return [fieldId, { stepId, fieldId, value, status }];
}

// ---------- Demo Claim 1: Personal Injury (motor vehicle collision) ----------

const piAnswersList: [string, IntakeAnswer][] = [
  ans("incident-type", "incidentType", "Motor vehicle accident"),
  ans("date-location", "incidentDate", "2026-05-14"),
  ans("date-location", "incidentTime", "5:45pm"),
  ans("date-location", "incidentLocation", "Intersection of 4th St & Alameda Ave, Springvale, CA"),
  ans("description", "narrative", "I was stopped at a red light when a pickup truck rear-ended my sedan. The impact pushed my car into the intersection. The other driver admitted they were looking at their phone."),
  ans("parties", "otherParties", "Other driver: Mark Feldstein, appears to have his own auto insurance."),
  ans("parties", "insuranceOfOthers", "Palisade Mutual Insurance, policy details on the exchanged insurance card."),
  ans("official-involvement", "officialInvolvement", "Police attended, Ambulance / EMS attended"),
  ans("official-involvement", "reportNumber", "SVPD-2026-04471"),
  ans("injuries", "injuries", "Neck and lower back pain, headaches, bruising on chest from seatbelt."),
  ans("medical-treatment", "medicalTreatment", "Treated at Springvale General ER same day. Follow-up with Dr. Anita Cole (physiotherapy) starting May 20."),
  ans("ongoing-symptoms", "ongoingSymptoms", "Still experiencing stiffness and difficulty sitting for long periods at work. Physiotherapy ongoing twice weekly."),
  ans("employment-income", "incomeImpact", "Missed 6 days of work as a logistics coordinator; reduced hours for two additional weeks."),
  ans("insurance", "insuranceInfo", "Own policy with Coastline Auto Insurance, policy #CA-88213."),
  ans("witnesses", "witnesses", "Priya Anand, pedestrian who saw the collision, contact info on file."),
  ans("evidence", "evidenceNotes", "Photos of both vehicles, photo of the intersection, ER discharge paperwork."),
  ans("prior-injuries", "priorInjuries", "None", "not_applicable"),
  ans("deadlines", "jurisdiction", "California"),
  ans("deadlines", "knownDeadline", "Insurance adjuster mentioned a 2-year statute of limitations."),
  ans("goals", "goals", "Recover costs of medical treatment and lost wages, and make sure this doesn't affect my ability to work long-term."),
];

const piTimeline: TimelineEvent[] = [
  { id: "pi-t1", claimId: "claim-pi-1", date: "2026-05-14", title: "Collision occurs", description: "Rear-ended at a red light by another vehicle.", peopleInvolved: "Jordan Reyes, Mark Feldstein", significance: "high", evidenceIds: ["pi-d1", "pi-d2"] },
  { id: "pi-t2", claimId: "claim-pi-1", date: "2026-05-14", title: "Treated at Springvale General ER", description: "Evaluated for neck and back pain, released same day with instructions to follow up.", peopleInvolved: "ER staff", significance: "high", evidenceIds: ["pi-d3"] },
  { id: "pi-t3", claimId: "claim-pi-1", date: "2026-05-20", title: "Began physiotherapy", description: "Started twice-weekly physiotherapy with Dr. Anita Cole.", peopleInvolved: "Dr. Anita Cole", significance: "medium", evidenceIds: [] },
  { id: "pi-t4", claimId: "claim-pi-1", date: "2026-06-02", title: "Returned to full duties at work", description: "Resumed full schedule with continued discomfort during long shifts.", peopleInvolved: "", significance: "low", evidenceIds: [] },
];

const piDocuments: ClaimDocument[] = [
  { id: "pi-d1", claimId: "claim-pi-1", name: "front_damage_photo.jpg", category: "photo", description: "Front bumper damage to the pickup truck.", important: true, uploadedAt: "2026-05-14T20:10:00Z", status: "uploaded", sizeLabel: "2.1 MB" },
  { id: "pi-d2", claimId: "claim-pi-1", name: "rear_damage_photo.jpg", category: "photo", description: "Rear bumper damage to my sedan.", important: true, uploadedAt: "2026-05-14T20:11:00Z", status: "uploaded", sizeLabel: "1.8 MB" },
  { id: "pi-d3", claimId: "claim-pi-1", name: "er_discharge_summary.pdf", category: "medical_record", description: "Springvale General ER discharge summary.", important: true, uploadedAt: "2026-05-15T09:00:00Z", status: "uploaded", sizeLabel: "412 KB" },
  { id: "pi-d4", claimId: "claim-pi-1", name: "police_report_SVPD-2026-04471.pdf", category: "police_report", description: "Official police report from responding officer.", important: true, uploadedAt: "2026-05-18T14:22:00Z", status: "uploaded", sizeLabel: "588 KB" },
  { id: "pi-d5", claimId: "claim-pi-1", name: "witness_statement_panand.pdf", category: "witness_statement", description: "Written statement from witness Priya Anand.", important: false, uploadedAt: "2026-05-22T11:05:00Z", status: "uploaded", sizeLabel: "94 KB" },
];

const piLawyerMessages: LawyerMessage[] = [
  {
    id: "pi-lm-1",
    claimId: "claim-pi-1",
    fromLawyerName: "Michael Alden",
    fromFirmName: "Alden & Cross Injury Law",
    subject: "Reviewed your ER records",
    body: "I've reviewed the ER discharge summary you uploaded. It supports the timeline you described. I've added a note to your file — let me know if you have follow-up physiotherapy records to add.",
    createdAt: "2026-06-05T13:20:00Z",
    read: true,
  },
];

export function buildDemoClaim1(): Claim {
  const answers = Object.fromEntries(piAnswersList);
  const claim: Claim = {
    id: "claim-pi-1",
    userId: DEMO_USER.id,
    category: "personal_injury",
    subtype: "Motor vehicle accident",
    title: "Motor vehicle collision — 4th & Alameda",
    status: "submitted",
    createdAt: "2026-05-15T10:00:00Z",
    updatedAt: "2026-06-10T15:30:00Z",
    currentStep: 16,
    totalSteps: 16,
    answers,
    timeline: piTimeline,
    documents: piDocuments,
    score: null,
    goals: "Recover costs of medical treatment and lost wages.",
    jurisdiction: "California",
    incidentDate: "2026-05-14",
    deadlineDate: "2028-05-14",
    deadlineLabel: "California personal injury statute of limitations (approx.)",
    lawyerMessages: piLawyerMessages,
  };
  claim.score = computeClaimScore(claim);
  return claim;
}

// ---------- Demo Claim 2: Employment (termination / disputed cause) ----------

const empAnswersList: [string, IntakeAnswer][] = [
  ans("issue-type", "issueType", "Termination"),
  ans("employer-info", "employerName", "Brightpath Logistics Inc."),
  ans("employer-info", "employerLocation", "Riverton, CA distribution center"),
  ans("role-tenure", "jobTitle", "Senior Operations Analyst"),
  ans("role-tenure", "tenure", "4 years, 3 months"),
  ans("compensation", "compensation", "$78,000 base salary, annual bonus, health benefits, 401(k) match."),
  ans("employment-status", "employmentStatus", "Full-time"),
  ans("incident-date-desc", "incidentDate", "2026-04-02"),
  ans("incident-date-desc", "narrative", "Terminated during a video call with no prior written warnings, two weeks after I raised a formal complaint about a manager's comments regarding my medical leave request."),
  ans("key-people", "keyPeople", "Direct manager: A. Whitfield. HR contact: D. Ostrowski."),
  ans("chronology", "chronology", "Requested medical leave in Feb 2026 -> manager made comments about 'reliability' -> filed HR complaint March 10 -> placed on a sudden performance improvement plan March 18 -> terminated April 2."),
  ans("complaints", "complaintsMade", "Formal written complaint to HR on March 10, 2026 regarding manager's comments."),
  ans("employer-response", "employerResponse", "HR acknowledged the complaint by email but no investigation outcome was shared before termination."),
  ans("discipline-details", "disciplineDetails", "Placed on a Performance Improvement Plan on March 18, terminated April 2 before the 30-day PIP period ended."),
  ans("accommodation", "accommodationRequests", "Requested intermittent medical leave in February 2026, approved but referenced negatively afterward."),
  ans("impact", "financialImpact", "Lost salary and benefits since April 2; using savings to cover expenses; significant stress affecting sleep."),
  ans("documents", "documentNotes", "Offer letter, PIP document, termination letter, and email correspondence with HR."),
  ans("witnesses", "witnesses", "Coworker T. Nguyen overheard the manager's comments in February."),
  ans("jurisdiction", "jurisdiction", "California"),
  ans("goals", "goals", "Understand whether the timing of my termination relative to my complaint and leave request is legally significant."),
];

const empTimeline: TimelineEvent[] = [
  { id: "emp-t1", claimId: "claim-emp-1", date: "2026-02-10", title: "Requested medical leave", description: "Submitted intermittent medical leave request, later approved.", peopleInvolved: "HR (D. Ostrowski)", significance: "medium", evidenceIds: [] },
  { id: "emp-t2", claimId: "claim-emp-1", date: "2026-02-24", title: "Manager comments on reliability", description: "Manager made comments questioning reliability shortly after leave request.", peopleInvolved: "A. Whitfield", significance: "high", evidenceIds: [] },
  { id: "emp-t3", claimId: "claim-emp-1", date: "2026-03-10", title: "Filed HR complaint", description: "Submitted written complaint about manager's comments.", peopleInvolved: "D. Ostrowski", significance: "high", evidenceIds: ["emp-d4"] },
  { id: "emp-t4", claimId: "claim-emp-1", date: "2026-03-18", title: "Placed on Performance Improvement Plan", description: "Given a 30-day PIP with no prior documented performance issues.", peopleInvolved: "A. Whitfield", significance: "high", evidenceIds: ["emp-d2"] },
  { id: "emp-t5", claimId: "claim-emp-1", date: "2026-04-02", title: "Terminated", description: "Terminated via video call before the PIP period concluded.", peopleInvolved: "A. Whitfield, D. Ostrowski", significance: "high", evidenceIds: ["emp-d3"] },
];

const empDocuments: ClaimDocument[] = [
  { id: "emp-d1", claimId: "claim-emp-1", name: "offer_letter_2022.pdf", category: "employment_contract", description: "Original offer letter and terms of employment.", important: false, uploadedAt: "2026-04-05T10:00:00Z", status: "uploaded", sizeLabel: "220 KB", sentToLawyer: true, sentToLawyerAt: "2026-04-06T09:00:00Z" },
  { id: "emp-d2", claimId: "claim-emp-1", name: "performance_improvement_plan.pdf", category: "other", description: "PIP document dated March 18.", important: true, uploadedAt: "2026-04-05T10:05:00Z", status: "uploaded", sizeLabel: "301 KB", sentToLawyer: true, sentToLawyerAt: "2026-04-06T09:00:00Z" },
  { id: "emp-d3", claimId: "claim-emp-1", name: "termination_letter.pdf", category: "termination_letter", description: "Termination letter dated April 2.", important: true, uploadedAt: "2026-04-05T10:07:00Z", status: "uploaded", sizeLabel: "180 KB", sentToLawyer: true, sentToLawyerAt: "2026-04-06T09:00:00Z" },
  { id: "emp-d4", claimId: "claim-emp-1", name: "hr_complaint_email.pdf", category: "email", description: "Email thread containing the formal HR complaint.", important: true, uploadedAt: "2026-04-06T09:00:00Z", status: "uploaded", sizeLabel: "96 KB" },
  { id: "emp-d5", claimId: "claim-emp-1", name: "pay_stubs_q1_2026.pdf", category: "pay_record", description: "Pay stubs for Q1 2026 showing salary and bonus structure.", important: false, uploadedAt: "2026-04-06T09:10:00Z", status: "uploaded", sizeLabel: "540 KB" },
];

const empLawyerMessages: LawyerMessage[] = [
  {
    id: "emp-lm-1",
    claimId: "claim-emp-1",
    fromLawyerName: "Devon Whitmore",
    fromFirmName: "Whitmore Employment Law Group",
    subject: "Reviewed your termination timeline",
    body: "I've gone through the chronology and PIP documentation you shared. The two-week gap between your HR complaint and the PIP is significant — I've flagged it in your file as a key fact for a potential retaliation claim. This is a preliminary read, not legal advice yet; we'll go deeper once we speak.",
    createdAt: "2026-06-12T09:15:00Z",
    read: false,
  },
  {
    id: "emp-lm-2",
    claimId: "claim-emp-1",
    fromLawyerName: "Devon Whitmore",
    fromFirmName: "Whitmore Employment Law Group",
    subject: "File updated: performance_improvement_plan.pdf",
    body: "I added a note to the PIP document in your file clarifying the 30-day period was cut short by 12 days. No action needed from you — just keeping you in the loop.",
    createdAt: "2026-06-13T14:40:00Z",
    read: false,
    relatedUpdate: true,
  },
];

export function buildDemoClaim2(): Claim {
  const answers = Object.fromEntries(empAnswersList);
  const claim: Claim = {
    id: "claim-emp-1",
    userId: DEMO_USER.id,
    category: "employment",
    subtype: "Termination",
    title: "Termination — Brightpath Logistics Inc.",
    status: "submitted",
    createdAt: "2026-04-05T09:00:00Z",
    updatedAt: "2026-06-08T12:00:00Z",
    currentStep: 18,
    totalSteps: 18,
    answers,
    timeline: empTimeline,
    documents: empDocuments,
    score: null,
    goals: "Understand whether the timing of termination relative to complaint/leave is legally significant.",
    jurisdiction: "California",
    incidentDate: "2026-04-02",
    deadlineDate: "2027-04-02",
    deadlineLabel: "Approximate deadline to file an administrative complaint",
    lawyerMessages: empLawyerMessages,
  };
  claim.score = computeClaimScore(claim);
  return claim;
}

// ---------- Lawyer matches (demonstration data only) ----------

export const DEMO_LAWYERS: LawyerMatch[] = [
  {
    id: "lawyer-1",
    firmName: "Alden & Cross Injury Law",
    lawyerName: "Michael Alden",
    practiceAreas: ["personal_injury"],
    jurisdiction: "California",
    languages: ["English", "Spanish"],
    yearsExperience: 17,
    description: "Focused exclusively on motor vehicle and premises liability claims, with a client-first communication style and free initial consultations.",
    availability: "Consultations available within 3 business days",
    matchReason: "Matches your practice area, jurisdiction, and case type (motor vehicle accident).",
    verifiedPartner: true,
    matchScore: 94,
  },
  {
    id: "lawyer-2",
    firmName: "Coastal Advocates LLP",
    lawyerName: "Renata Silva",
    practiceAreas: ["personal_injury"],
    jurisdiction: "California",
    languages: ["English", "Portuguese"],
    yearsExperience: 11,
    description: "Personal injury practice emphasizing thorough medical documentation review and transparent fee structures.",
    availability: "Consultations available this week",
    matchReason: "Matches your jurisdiction and evidence profile; strong fit for cases with medical treatment records.",
    verifiedPartner: true,
    matchScore: 88,
  },
  {
    id: "lawyer-3",
    firmName: "Whitmore Employment Law Group",
    lawyerName: "Devon Whitmore",
    practiceAreas: ["employment"],
    jurisdiction: "California",
    languages: ["English"],
    yearsExperience: 14,
    description: "Represents employees in wrongful termination, discrimination, and retaliation matters, with experience in leave-related retaliation claims.",
    availability: "Consultations available within 2 business days",
    matchReason: "Matches your practice area, jurisdiction, and the retaliation/timing pattern in your chronology.",
    verifiedPartner: true,
    matchScore: 96,
  },
  {
    id: "lawyer-4",
    firmName: "Park & Nguyen Workplace Counsel",
    lawyerName: "Grace Nguyen",
    practiceAreas: ["employment"],
    jurisdiction: "California",
    languages: ["English", "Vietnamese"],
    yearsExperience: 9,
    description: "Employment law practice with a focus on PIP-related disputes and documentation review for wrongful termination claims.",
    availability: "Consultations available this week",
    matchReason: "Matches your practice area and the documented Performance Improvement Plan timeline.",
    verifiedPartner: true,
    matchScore: 90,
  },
];

// ---------- Resources ----------

export const DEMO_RESOURCES: Resource[] = [
  { id: "res-1", title: "What to document after an accident", description: "A practical checklist of what to record in the hours and days after a motor vehicle or premises accident.", category: "Personal Injury", readingTime: "4 min read", body: "After an accident, try to capture the scene with photos, note the time and location, exchange insurance information, and seek medical attention even if injuries seem minor. Keep every receipt and record related to your treatment and recovery.", related: ["res-3", "res-6"] },
  { id: "res-2", title: "How to preserve workplace emails", description: "Steps to safely retain relevant emails and messages without violating employer policy.", category: "Workplace Documentation", readingTime: "5 min read", body: "Forward relevant emails to a personal account where policy allows, take dated screenshots, and keep a written log of key conversations including who was present and what was said.", related: ["res-4", "res-9"] },
  { id: "res-3", title: "Preparing a chronology", description: "Why a clear timeline matters and how to build one that's useful to a lawyer.", category: "Evidence Preservation", readingTime: "6 min read", body: "A chronology should list events in date order with short factual descriptions, avoiding assumptions or conclusions. Include who was present and any related documents for each entry.", related: ["res-1", "res-2"] },
  { id: "res-4", title: "What documents a lawyer may request", description: "A general overview of commonly requested records for injury and employment matters.", category: "Preparing for a Lawyer Consultation", readingTime: "5 min read", body: "Lawyers commonly request medical records, police or incident reports, employment contracts, correspondence, pay records, and any photos or video related to the matter.", related: ["res-1", "res-2"] },
  { id: "res-5", title: "Understanding limitation periods", description: "Why legal deadlines matter and how they vary by jurisdiction and claim type.", category: "Deadlines", readingTime: "4 min read", body: "Most legal claims are subject to a filing deadline known as a statute of limitations, which varies by state, province, and claim type. Missing a deadline can permanently bar a claim, so confirming your applicable deadline early matters.", related: ["res-8"] },
  { id: "res-6", title: "Protecting your privacy", description: "How to think about privacy when documenting sensitive incidents.", category: "Privacy and Safety", readingTime: "3 min read", body: "Store sensitive documents securely, share information only with trusted parties such as your lawyer, and be cautious about discussing an active matter on social media.", related: ["res-1"] },
  { id: "res-7", title: "Questions to ask during a consultation", description: "A starting list of questions to bring to your first meeting with a lawyer.", category: "Preparing for a Lawyer Consultation", readingTime: "4 min read", body: "Consider asking about experience with similar cases, fee structure, likely next steps, expected timelines, and how the lawyer prefers to communicate.", related: ["res-4"] },
  { id: "res-8", title: "How to record lost income", description: "What information helps document lost wages or reduced income.", category: "Insurance", readingTime: "4 min read", body: "Keep pay stubs, a log of missed shifts or hours, and any correspondence with your employer about schedule changes related to your injury or leave.", related: ["res-5"] },
  { id: "res-9", title: "How to document ongoing symptoms", description: "Simple habits that create a clear record of recovery over time.", category: "Medical Documentation", readingTime: "3 min read", body: "A short dated log noting symptoms, limitations, and how they affect daily activities can be valuable alongside formal medical records.", related: ["res-2"] },
];

export const RESOURCE_CATEGORIES = [
  "Personal Injury",
  "Employment Law",
  "Evidence Preservation",
  "Medical Documentation",
  "Workplace Documentation",
  "Deadlines",
  "Insurance",
  "Preparing for a Lawyer Consultation",
  "Privacy and Safety",
];

// ---------- FAQ ----------

export const DEMO_FAQ: FaqItem[] = [
  { id: "faq-1", question: "Is JusticeChamp a law firm?", answer: "No. JusticeChamp is not a law firm and does not provide legal representation. It is an information and organization tool that helps you document your situation and connect with independent, licensed lawyers.", category: "General" },
  { id: "faq-2", question: "Does JusticeChamp provide legal advice?", answer: "No. JusticeChamp provides general legal information and a preliminary, informational claim-readiness assessment. It does not replace advice from a licensed lawyer, who can evaluate the specific facts and law that apply to your situation.", category: "General" },
  { id: "faq-3", question: "How is my information used?", answer: "Your information is used to help you organize your claim, generate your preliminary claim summary, and — only with your consent — share relevant details with a lawyer you choose to contact.", category: "Privacy" },
  { id: "faq-4", question: "Who can view my incident report?", answer: "By default, only you can view your incident report. It is only shared with a lawyer if you explicitly request a consultation and consent to share your summary.", category: "Privacy" },
  { id: "faq-5", question: "Can I delete my information?", answer: "Yes. You can request deletion of your account and associated data from your Profile page at any time.", category: "Privacy" },
  { id: "faq-6", question: "How does Rate My Claim work?", answer: "Rate My Claim analyzes the completeness and consistency of the information you've entered — such as dates, evidence, witnesses, and timeline detail — to produce a transparent readiness score and suggested next steps.", category: "Rate My Claim" },
  { id: "faq-7", question: "Does a high score guarantee success?", answer: "No. The score reflects how complete and organized your intake is, not the strength or likely outcome of a legal claim. Only a licensed lawyer can assess the merits of your case.", category: "Rate My Claim" },
  { id: "faq-8", question: "Is the score shared with lawyers?", answer: "Your score is included in your claim summary and is only shared with a lawyer if you choose to request a consultation and consent to share it.", category: "Rate My Claim" },
  { id: "faq-9", question: "Can I update my report later?", answer: "Yes. You can return to any claim and update your answers, timeline, or documents at any time before or after submission.", category: "General" },
  { id: "faq-10", question: "What documents should I upload?", answer: "Anything relevant to your situation: photos, medical records, police or incident reports, contracts, pay records, emails, texts, and correspondence. The Documents page shows recommended categories based on your claim type.", category: "Documents" },
  { id: "faq-11", question: "Can I use the platform before speaking to a lawyer?", answer: "Yes. Many people use JusticeChamp to organize their information before their first consultation, which can make that meeting more productive.", category: "General" },
  { id: "faq-12", question: "How are lawyers selected?", answer: "In this demo, lawyer matches are illustrative sample data. In a production environment, matches would be based on practice area, jurisdiction, case type, urgency, language, and lawyer capacity, subject to conflict screening.", category: "Lawyer Matching" },
  { id: "faq-13", question: "Will I be charged?", answer: "JusticeChamp itself does not charge for documenting your claim in this MVP. Any fee arrangement with a lawyer you choose to work with is between you and that lawyer.", category: "General" },
  { id: "faq-14", question: "What happens after I request a consultation?", answer: "Your consent-based claim summary is shared with the selected lawyer or firm, who will typically reach out directly to schedule an initial consultation.", category: "Lawyer Matching" },
  { id: "faq-15", question: "What jurisdictions are supported?", answer: "This MVP demonstrates a California-based example. A production version would expand jurisdiction coverage and tailor deadline information accordingly.", category: "General" },
  { id: "faq-16", question: "What should I do in an emergency?", answer: "JusticeChamp is not an emergency service. If you are in immediate danger or need urgent medical attention, contact your local emergency number right away.", category: "General" },
];
