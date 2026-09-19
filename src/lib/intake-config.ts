// Guided intake step + field configuration for every supported flow.
// Rendered generically by the intake form engine in src/components/IntakeFlow.tsx.
//
// Each flow is a short, plain-language, progressively-disclosed sequence of
// steps. Steps and individual fields can be conditional (showIf) so that a
// question only appears when it's relevant to what the person already said.

export type FieldType = "text" | "textarea" | "date" | "select" | "radio" | "checkboxes" | "file" | "jurisdiction" | "number" | "info";

export interface ShowIf {
  fieldId: string;
  equals?: string[]; // show if the answer's value (or one of the checked values) is one of these
  notEmpty?: boolean; // show if the field has any answered value
  empty?: boolean; // show if the field has no answered value yet
}

export interface IntakeField {
  id: string;
  label: string;
  helper?: string;
  type: FieldType;
  options?: string[];
  allowSkip?: boolean; // shows "I don't know / N/A / Later" controls (legacy long-form flows)
  optional?: boolean; // shown with an "Optional" label; never blocks Continue
  maxWords?: number; // soft word-count limit — never erases text, only explains
  noFutureDate?: boolean;
  multiple?: boolean; // file fields: allow more than one file
  placeholder?: string;
  showIf?: ShowIf;
  min?: number;
  max?: number;
}

export interface IntakeStep {
  id: string;
  section: string; // short section name for the progress label, e.g. "Incident details"
  title: string;
  helper: string;
  fields: IntakeField[];
  showIf?: ShowIf;
}

const skip = true;

// ---------------------------------------------------------------------------
// Personal injury — 13 guided topics (a 14th, "Connection", is presented as
// the standard lawyer-recommendation prompt on the results page, not as an
// intake step — see the spec's Personal Injury Results section).
// ---------------------------------------------------------------------------

export const PERSONAL_INJURY_STEPS: IntakeStep[] = [
  {
    id: "incident-type",
    section: "Incident details",
    title: "What type of incident occurred?",
    helper: "Choose the option that best describes what happened.",
    fields: [
      {
        id: "incidentType",
        label: "Incident type",
        type: "radio",
        options: ["Motor vehicle collision", "Slip or fall", "Workplace injury", "Medical treatment", "Product injury", "Assault", "Other"],
      },
      {
        id: "incidentTypeOther",
        label: "Please describe the type of incident.",
        type: "text",
        showIf: { fieldId: "incidentType", equals: ["Other"] },
      },
    ],
  },
  {
    id: "date-location",
    section: "Incident details",
    title: "When and where did it happen?",
    helper: "Your best estimate is fine if you're not sure of the exact time.",
    fields: [
      { id: "incidentDate", label: "Incident date", type: "date", noFutureDate: true },
      { id: "jurisdiction", label: "State or province where it happened", type: "jurisdiction" },
    ],
  },
  {
    id: "description",
    section: "Incident details",
    title: "Briefly describe what happened.",
    helper: "Focus on the key events, not argument or legal conclusions.",
    fields: [{ id: "narrative", label: "What happened?", type: "textarea", maxWords: 100 }],
  },
  {
    id: "responsibility",
    section: "Responsibility",
    title: "Who do you believe may be responsible?",
    helper: "You don't need to be certain — \"not sure\" is a fine answer.",
    fields: [{ id: "responsibleParty", label: "Who may be responsible", type: "text", optional: true, placeholder: "e.g. the other driver, my employer, not sure" }],
  },
  {
    id: "reports",
    section: "Reports",
    title: "Was an incident or police report created?",
    helper: "",
    fields: [
      { id: "reportFiled", label: "Report created", type: "radio", options: ["Yes", "No", "Not sure"] },
      { id: "reportNumber", label: "Report or reference number (optional)", type: "text", optional: true, showIf: { fieldId: "reportFiled", equals: ["Yes"] } },
      { id: "reportUpload", label: "Upload the report (optional)", type: "file", optional: true, showIf: { fieldId: "reportFiled", equals: ["Yes"] } },
    ],
  },
  {
    id: "injuries",
    section: "Injuries",
    title: "What injuries or symptoms are you experiencing?",
    helper: "Select everything that applies.",
    fields: [
      {
        id: "injuryTypes",
        label: "Injuries or symptoms",
        type: "checkboxes",
        options: ["Head or brain", "Neck or back", "Broken bone", "Soft tissue", "Psychological or emotional", "Internal injury", "Other", "Prefer not to say"],
      },
      { id: "injuryOther", label: "Please describe the other injury.", type: "text", optional: true, showIf: { fieldId: "injuryTypes", equals: ["Other"] } },
    ],
  },
  {
    id: "treatment-received",
    section: "Treatment",
    title: "Have you received medical treatment for these injuries?",
    helper: "",
    fields: [
      { id: "medicalTreatment", label: "Medical treatment received", type: "radio", options: ["Yes", "No", "Appointment scheduled"] },
      { id: "treatmentStartDate", label: "When did treatment begin?", type: "date", optional: true, showIf: { fieldId: "medicalTreatment", equals: ["Yes"] } },
      { id: "treatmentScheduledDate", label: "Appointment date (optional)", type: "date", optional: true, showIf: { fieldId: "medicalTreatment", equals: ["Appointment scheduled"] } },
    ],
  },
  {
    id: "treatment-continuing",
    section: "Treatment",
    title: "Is your treatment continuing?",
    helper: "",
    showIf: { fieldId: "medicalTreatment", equals: ["Yes", "Appointment scheduled"] },
    fields: [{ id: "treatmentContinuing", label: "Treatment continuing", type: "radio", options: ["Yes", "No", "Not sure"] }],
  },
  {
    id: "impact",
    section: "Impact",
    title: "How have the injuries affected your work or daily life?",
    helper: "Examples: missed work, mobility, sleep, caregiving, or usual activities.",
    fields: [{ id: "incomeImpact", label: "Impact on work or daily life", type: "textarea", maxWords: 100 }],
  },
  {
    id: "insurance",
    section: "Insurance",
    title: "Is insurance available that may relate to this incident?",
    helper: "",
    fields: [
      { id: "insuranceAvailable", label: "Insurance available", type: "radio", options: ["Yes", "No", "Not sure"] },
      { id: "insuranceDetails", label: "Insurer or type of coverage (optional)", type: "text", optional: true, showIf: { fieldId: "insuranceAvailable", equals: ["Yes"] } },
    ],
  },
  {
    id: "evidence",
    section: "Evidence",
    title: "What evidence do you have?",
    helper: "Select everything you already have — you'll be able to upload it here or later in Documents.",
    fields: [
      {
        id: "evidenceTypes",
        label: "Evidence you have",
        type: "checkboxes",
        options: ["Photos/video", "Witness details", "Medical records", "Report", "Messages/email", "Receipts", "Other", "None yet"],
      },
      { id: "evidenceOther", label: "Please describe the other evidence.", type: "text", optional: true, showIf: { fieldId: "evidenceTypes", equals: ["Other"] } },
      { id: "witnesses", label: "Witness name(s) and contact details, if known", type: "textarea", optional: true, showIf: { fieldId: "evidenceTypes", equals: ["Witness details"] } },
      {
        id: "evidenceReminder",
        label: "Evidence-preservation reminder: photos, messages, and records can be lost or overwritten over time — saving copies now, even rough ones, helps preserve your options later.",
        type: "info",
      },
    ],
  },
  {
    id: "history",
    section: "History",
    title: "Did you have any similar injuries before this incident?",
    helper: "This is common, and prior injuries do not automatically prevent a claim.",
    fields: [
      { id: "priorInjuries", label: "Prior similar injuries", type: "radio", options: ["Yes", "No", "Not sure", "Prefer not to say"] },
      { id: "priorInjuryDescription", label: "Brief description (optional)", type: "textarea", optional: true, showIf: { fieldId: "priorInjuries", equals: ["Yes"] } },
    ],
  },
  {
    id: "urgency",
    section: "Urgency",
    title: "Are you aware of any urgent deadline?",
    helper: "",
    fields: [
      { id: "urgentDeadline", label: "Aware of an urgent deadline", type: "radio", options: ["Yes", "No", "Not sure"] },
      { id: "urgentDeadlineDate", label: "Deadline date", type: "date", optional: true, showIf: { fieldId: "urgentDeadline", equals: ["Yes"] } },
      { id: "urgentDeadlineDetails", label: "Short details (optional)", type: "text", optional: true, showIf: { fieldId: "urgentDeadline", equals: ["Yes"] } },
      {
        id: "urgencyNotice",
        label: "This is a neutral reminder, not a calculated legal deadline. Confirming your applicable deadline with a lawyer early matters.",
        type: "info",
        showIf: { fieldId: "urgentDeadline", equals: ["Yes"] },
      },
    ],
  },
  {
    id: "review",
    section: "Review",
    title: "Review and submit",
    helper: "Take a moment to review your responses before submitting.",
    fields: [],
  },
];

// ---------------------------------------------------------------------------
// Employment — Tool 1: Review my employment contract (3 steps, no long
// questionnaire before the upload).
// ---------------------------------------------------------------------------

export const EMPLOYMENT_CONTRACT_STEPS: IntakeStep[] = [
  {
    id: "union-status",
    section: "Contract review",
    title: "Is your position unionized?",
    helper: "",
    fields: [
      { id: "unionStatus", label: "Union status", type: "radio", options: ["Unionized", "Non-unionized", "Not sure"] },
      {
        id: "unionNotice",
        label: "A collective agreement and union process may affect this review. If available, consider including the collective agreement along with your contract.",
        type: "info",
        showIf: { fieldId: "unionStatus", equals: ["Unionized"] },
      },
    ],
  },
  {
    id: "workplace-location",
    section: "Contract review",
    title: "Where is your workplace located?",
    helper: "",
    fields: [{ id: "jurisdiction", label: "Workplace location", type: "jurisdiction" }],
  },
  {
    id: "upload-contract",
    section: "Contract review",
    title: "Upload your employment contract.",
    helper: "Additional related files are welcome. At least one contract file is required.",
    fields: [
      { id: "contractFiles", label: "Employment contract file(s)", type: "file", multiple: true },
      {
        id: "contractText",
        label: "Optional: paste the contract text for an interactive plain-language preview",
        helper: "This demo generates a real, in-browser plain-language read of pasted text — it's optional and only improves the preview below.",
        type: "textarea",
        optional: true,
      },
      { id: "uploadPrivacyNotice", label: "Upload only documents you are comfortable storing in JusticeChamp. Remove unnecessary identification numbers where possible.", type: "info" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Employment — Tool 2: Review my severance package (14 items).
// ---------------------------------------------------------------------------

export const EMPLOYMENT_SEVERANCE_STEPS: IntakeStep[] = [
  {
    id: "sv-union-status",
    section: "Employment",
    title: "Is your position unionized?",
    helper: "",
    fields: [{ id: "unionStatus", label: "Union status", type: "radio", options: ["Unionized", "Non-unionized", "Not sure"] }],
  },
  {
    id: "sv-age",
    section: "About you",
    title: "What is your current age?",
    helper: "Age can be relevant to an employment-law review (for example, some protections and typical notice periods scale with age).",
    fields: [{ id: "age", label: "Current age", type: "number", min: 14, max: 100 }],
  },
  {
    id: "sv-employer-name",
    section: "Employer",
    title: "Who did you work for?",
    helper: "",
    fields: [{ id: "employerName", label: "Employer name", type: "text" }],
  },
  {
    id: "sv-employer-location",
    section: "Employer",
    title: "Where was your workplace located?",
    helper: "",
    fields: [
      { id: "jurisdiction", label: "Workplace location", type: "jurisdiction" },
      { id: "city", label: "City (optional)", type: "text", optional: true },
    ],
  },
  {
    id: "sv-role",
    section: "Role",
    title: "What was your job title?",
    helper: "",
    fields: [{ id: "jobTitle", label: "Job title", type: "text" }],
  },
  {
    id: "sv-tenure",
    section: "Role",
    title: "How long did you work there?",
    helper: "\"I'm not sure of the exact date\" is a fine answer.",
    fields: [{ id: "tenure", label: "Length of employment", type: "text", placeholder: "e.g. 3 years, 2 months — or I'm not sure of the exact date" }],
  },
  {
    id: "sv-final-day",
    section: "Termination",
    title: "What was your final day of work?",
    helper: "Leave this as today's date if your employment has not yet ended.",
    fields: [{ id: "finalDayOfWork", label: "Final day of work", type: "date" }],
  },
  {
    id: "sv-termination-reason",
    section: "Termination",
    title: "Were you told you were being let go with cause or without cause?",
    helper: "",
    fields: [{ id: "terminationReason", label: "Reason given", type: "radio", options: ["With cause", "Without cause", "Not sure", "No reason given"] }],
  },
  {
    id: "sv-deadline-given",
    section: "Deadline",
    title: "Did your employer give you a deadline to sign a termination or severance agreement?",
    helper: "",
    fields: [{ id: "deadlineGiven", label: "Deadline given", type: "radio", options: ["Yes", "No", "Not sure"] }],
  },
  {
    id: "sv-deadline-date",
    section: "Deadline",
    title: "What deadline were you given?",
    helper: "",
    showIf: { fieldId: "deadlineGiven", equals: ["Yes"] },
    fields: [
      { id: "signingDeadlineDate", label: "Signing deadline", type: "date" },
      { id: "signingDeadlineNote", label: "Short optional note", type: "text", optional: true },
    ],
  },
  {
    id: "sv-signed-agreement",
    section: "Agreement",
    title: "Have you signed the termination or severance package?",
    helper: "",
    fields: [{ id: "signedAgreement", label: "Agreement signed", type: "radio", options: ["Yes", "No", "Not sure"] }],
  },
  {
    id: "sv-details",
    section: "Details",
    title: "Is there anything else about the severance offer we should know?",
    helper: "",
    fields: [{ id: "severanceDetails", label: "Other details (optional)", type: "textarea", maxWords: 100, optional: true }],
  },
  {
    id: "sv-documents",
    section: "Documents",
    title: "Upload your severance agreement and other relevant documents.",
    helper: "You can save and return to finish this later.",
    fields: [
      { id: "severanceDocuments", label: "Severance / termination documents", type: "file", multiple: true },
      { id: "uploadPrivacyNotice", label: "Upload only documents you are comfortable storing in JusticeChamp. Remove unnecessary identification numbers where possible.", type: "info" },
    ],
  },
  {
    id: "sv-other-details",
    section: "Details",
    title: "Are there any other relevant details you want us to know?",
    helper: "",
    showIf: { fieldId: "severanceDetails", empty: true },
    fields: [{ id: "otherDetails", label: "Other relevant details (optional)", type: "textarea", maxWords: 100, optional: true }],
  },
];

// ---------------------------------------------------------------------------
// Employment — Tool 3: Other issues I am having at work (short 5-step intake).
// ---------------------------------------------------------------------------

export const EMPLOYMENT_OTHER_STEPS: IntakeStep[] = [
  {
    id: "wi-concern-type",
    section: "Workplace concern",
    title: "What do you need help with?",
    helper: "",
    fields: [
      {
        id: "concernType",
        label: "Type of concern",
        type: "radio",
        options: ["Harassment or bullying", "Discrimination", "Constructive dismissal", "Pay or overtime", "Accommodation or disability", "Retaliation", "Leave", "Performance or discipline", "Other"],
      },
      { id: "concernOther", label: "Please describe.", type: "text", showIf: { fieldId: "concernType", equals: ["Other"] } },
    ],
  },
  {
    id: "wi-describe",
    section: "Workplace concern",
    title: "Briefly describe your situation.",
    helper: "What happened, when, and who was involved.",
    fields: [{ id: "narrative", label: "Situation", type: "textarea", maxWords: 100 }],
  },
  {
    id: "wi-union-status",
    section: "Workplace concern",
    title: "Is your position unionized?",
    helper: "",
    fields: [{ id: "unionStatus", label: "Union status", type: "radio", options: ["Unionized", "Non-unionized", "Not sure"] }],
  },
  {
    id: "wi-jurisdiction",
    section: "Workplace concern",
    title: "Where do you work?",
    helper: "",
    fields: [{ id: "jurisdiction", label: "Workplace location", type: "jurisdiction" }],
  },
  {
    id: "wi-dates-docs",
    section: "Workplace concern",
    title: "Do you have any important dates, messages, or documents?",
    helper: "Optional — a reminder to preserve records is shown below.",
    fields: [
      { id: "importantDate", label: "Important date (optional)", type: "date", optional: true },
      { id: "importantNote", label: "Short note (optional)", type: "text", optional: true },
      { id: "supportingFiles", label: "Upload files (optional)", type: "file", multiple: true, optional: true },
      { id: "evidenceReminder", label: "A reminder to preserve records: messages and documents can be lost over time — saving copies now helps preserve your options later.", type: "info" },
    ],
  },
];

export function stepsForTool(tool: "personal_injury" | "employment_contract" | "employment_severance" | "employment_other"): IntakeStep[] {
  switch (tool) {
    case "personal_injury":
      return PERSONAL_INJURY_STEPS;
    case "employment_contract":
      return EMPLOYMENT_CONTRACT_STEPS;
    case "employment_severance":
      return EMPLOYMENT_SEVERANCE_STEPS;
    case "employment_other":
      return EMPLOYMENT_OTHER_STEPS;
  }
}

// Legacy alias kept for any remaining callers / demo data compatibility.
export function stepsForCategory(category: "personal_injury" | "employment"): IntakeStep[] {
  return category === "personal_injury" ? PERSONAL_INJURY_STEPS : EMPLOYMENT_OTHER_STEPS;
}

export function matchesShowIf(showIf: ShowIf | undefined, answers: Record<string, { value: string | string[] | boolean | null; status: string }>): boolean {
  if (!showIf) return true;
  const answer = answers[showIf.fieldId];
  const value = answer?.value;
  const hasValue = answer && answer.status === "answered" && value !== "" && value !== null && !(Array.isArray(value) && value.length === 0);
  if (showIf.notEmpty) return Boolean(hasValue);
  if (showIf.empty) return !hasValue;
  if (showIf.equals) {
    if (!hasValue) return false;
    if (Array.isArray(value)) return value.some((v) => showIf.equals!.includes(v));
    return showIf.equals.includes(String(value));
  }
  return true;
}

export const COUNTRIES = ["United States", "Canada", "Other"];

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "District of Columbia",
];

export const CA_PROVINCES = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario",
  "Prince Edward Island", "Quebec", "Saskatchewan", "Northwest Territories", "Nunavut", "Yukon",
];

export function regionsForCountry(country: string): string[] {
  if (country === "Canada") return CA_PROVINCES;
  if (country === "United States") return US_STATES;
  return [];
}
