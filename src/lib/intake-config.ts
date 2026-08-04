// Guided intake step + field configuration for both supported legal
// categories. Rendered generically by the intake form engine in
// src/app/report-incident/[category]/IntakeFlow.tsx.

export type FieldType = "text" | "textarea" | "date" | "select" | "radio" | "checkboxes";

export interface IntakeField {
  id: string;
  label: string;
  helper?: string;
  type: FieldType;
  options?: string[];
  allowSkip?: boolean; // shows "I don't know / N/A / Later" controls
}

export interface IntakeStep {
  id: string;
  title: string;
  helper: string;
  fields: IntakeField[];
}

const skip = true;

export const PERSONAL_INJURY_STEPS: IntakeStep[] = [
  {
    id: "incident-type",
    title: "What kind of incident happened?",
    helper: "Choose the option that best describes what occurred. You can add detail in the next steps.",
    fields: [
      {
        id: "incidentType",
        label: "Incident type",
        type: "radio",
        options: ["Motor vehicle accident", "Slip and fall", "Premises liability", "Medical injury", "Product injury", "Other"],
      },
    ],
  },
  {
    id: "date-location",
    title: "When and where did it happen?",
    helper: "Your best estimate is fine if you're not sure of the exact time.",
    fields: [
      { id: "incidentDate", label: "Date of incident", type: "date" },
      { id: "incidentTime", label: "Approximate time", type: "text", helper: "e.g. around 8:30am", allowSkip: skip },
      { id: "incidentLocation", label: "Location", type: "text", helper: "Street address, intersection, or business name", allowSkip: skip },
    ],
  },
  {
    id: "description",
    title: "Describe what happened",
    helper: "Write it in your own words, as if explaining it to a friend. There's no wrong way to do this.",
    fields: [
      { id: "narrative", label: "What happened?", type: "textarea" },
    ],
  },
  {
    id: "parties",
    title: "Who else was involved?",
    helper: "Include names, roles, and contact information if you have it.",
    fields: [
      { id: "otherParties", label: "Other people or businesses involved", type: "textarea", allowSkip: skip },
      { id: "insuranceOfOthers", label: "Do you know their insurance information?", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "official-involvement",
    title: "Was anyone official involved?",
    helper: "This helps identify records that may already exist.",
    fields: [
      { id: "officialInvolvement", label: "Police, ambulance, employer, property owner, or an incident report", type: "checkboxes", options: ["Police attended", "Ambulance / EMS attended", "Employer was notified", "Property owner / manager notified", "Formal incident report filed", "None of these"] },
      { id: "reportNumber", label: "Report or reference number (if any)", type: "text", allowSkip: skip },
    ],
  },
  {
    id: "injuries",
    title: "What injuries or symptoms did you experience?",
    helper: "Include everything, even things that seemed minor at first.",
    fields: [
      { id: "injuries", label: "Injuries and symptoms", type: "textarea" },
    ],
  },
  {
    id: "medical-treatment",
    title: "What medical treatment have you received?",
    helper: "List providers, hospitals, or clinics visited, and when.",
    fields: [
      { id: "medicalTreatment", label: "Medical treatment received", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "ongoing-symptoms",
    title: "Are you still experiencing symptoms or limitations?",
    helper: "Describe how your daily life has been affected.",
    fields: [
      { id: "ongoingSymptoms", label: "Ongoing symptoms and limitations", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "employment-income",
    title: "Has this affected your work or income?",
    helper: "Missed shifts, reduced hours, or an inability to work all count.",
    fields: [
      { id: "incomeImpact", label: "Employment and income impact", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "insurance",
    title: "Insurance information",
    helper: "Your own auto, health, or home insurance details, if applicable.",
    fields: [
      { id: "insuranceInfo", label: "Your insurance information", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "witnesses",
    title: "Were there any witnesses?",
    helper: "Names and contact information, even partial, are helpful.",
    fields: [
      { id: "witnesses", label: "Witnesses", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "evidence",
    title: "Do you have photos, video, or records?",
    helper: "You'll be able to upload these in the Documents section after this step.",
    fields: [
      { id: "evidenceNotes", label: "Describe what evidence you have", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "prior-injuries",
    title: "Any prior injuries or related conditions?",
    helper: "This is common and helps a lawyer understand the full picture.",
    fields: [
      { id: "priorInjuries", label: "Prior injuries or related conditions", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "deadlines",
    title: "Deadlines and jurisdiction",
    helper: "Legal claims are subject to time limits that vary by location.",
    fields: [
      { id: "jurisdiction", label: "State or province where the incident occurred", type: "text" },
      { id: "knownDeadline", label: "Any known deadline you've been told about", type: "text", allowSkip: skip },
    ],
  },
  {
    id: "goals",
    title: "What are you hoping to achieve?",
    helper: "There's no wrong answer — this helps tailor recommendations.",
    fields: [
      { id: "goals", label: "Your goals", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "review",
    title: "Review and submit",
    helper: "Take a moment to review your responses before submitting.",
    fields: [],
  },
];

export const EMPLOYMENT_STEPS: IntakeStep[] = [
  {
    id: "issue-type",
    title: "What type of employment issue occurred?",
    helper: "Choose the option that best fits your situation.",
    fields: [
      {
        id: "issueType",
        label: "Employment issue type",
        type: "radio",
        options: ["Termination", "Constructive dismissal", "Harassment", "Discrimination", "Retaliation or reprisal", "Unpaid wages", "Disability accommodation", "Workplace investigation", "Contract dispute", "Other"],
      },
    ],
  },
  {
    id: "employer-info",
    title: "Employer information",
    helper: "Basic details about who you worked for.",
    fields: [
      { id: "employerName", label: "Employer name", type: "text" },
      { id: "employerLocation", label: "Work location", type: "text", allowSkip: skip },
    ],
  },
  {
    id: "role-tenure",
    title: "Your role and length of employment",
    helper: "This helps establish context for your claim.",
    fields: [
      { id: "jobTitle", label: "Job title", type: "text" },
      { id: "tenure", label: "Length of employment", type: "text", helper: "e.g. 3 years, 2 months" },
    ],
  },
  {
    id: "compensation",
    title: "Compensation and benefits",
    helper: "Salary or hourly rate, bonuses, and benefits.",
    fields: [
      { id: "compensation", label: "Compensation and benefits", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "employment-status",
    title: "Employment status",
    helper: "",
    fields: [
      { id: "employmentStatus", label: "Employment status", type: "radio", options: ["Full-time", "Part-time", "Contract", "Temporary", "Other"] },
    ],
  },
  {
    id: "incident-date-desc",
    title: "When did this happen and what occurred?",
    helper: "Describe the incident in your own words.",
    fields: [
      { id: "incidentDate", label: "Date of incident", type: "date" },
      { id: "narrative", label: "Description of what happened", type: "textarea" },
    ],
  },
  {
    id: "key-people",
    title: "Who was involved?",
    helper: "Managers, HR representatives, coworkers, or others.",
    fields: [
      { id: "keyPeople", label: "Key people involved", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "chronology",
    title: "Chronology of events",
    helper: "A rough timeline of what led up to and followed the incident. You'll be able to build a detailed timeline later.",
    fields: [
      { id: "chronology", label: "Chronology of events", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "complaints",
    title: "Did you raise complaints with your employer?",
    helper: "Include how and when you raised any concerns.",
    fields: [
      { id: "complaintsMade", label: "Complaints made to the employer", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "employer-response",
    title: "How did your employer respond?",
    helper: "",
    fields: [
      { id: "employerResponse", label: "Employer response", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "discipline-details",
    title: "Discipline, suspension, termination, or resignation details",
    helper: "",
    fields: [
      { id: "disciplineDetails", label: "Details", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "accommodation",
    title: "Did you request any accommodations?",
    helper: "Related to disability, religion, family status, or otherwise.",
    fields: [
      { id: "accommodationRequests", label: "Accommodation requests", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "impact",
    title: "Financial and emotional impact",
    helper: "Lost wages, benefits, job search costs, and how this has affected you.",
    fields: [
      { id: "financialImpact", label: "Financial and emotional impact", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "documents",
    title: "Documents and communications",
    helper: "You'll be able to upload these in the Documents section after this step.",
    fields: [
      { id: "documentNotes", label: "Describe documents and communications you have", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "witnesses",
    title: "Were there any witnesses?",
    helper: "Coworkers or others who observed relevant events.",
    fields: [
      { id: "witnesses", label: "Witnesses", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "jurisdiction",
    title: "Jurisdiction",
    helper: "Employment laws vary significantly by location.",
    fields: [
      { id: "jurisdiction", label: "State or province of employment", type: "text" },
    ],
  },
  {
    id: "goals",
    title: "What are you hoping to achieve?",
    helper: "",
    fields: [
      { id: "goals", label: "Your goals", type: "textarea", allowSkip: skip },
    ],
  },
  {
    id: "review",
    title: "Review and submit",
    helper: "Take a moment to review your responses before submitting.",
    fields: [],
  },
];

export function stepsForCategory(category: "personal_injury" | "employment"): IntakeStep[] {
  return category === "personal_injury" ? PERSONAL_INJURY_STEPS : EMPLOYMENT_STEPS;
}
