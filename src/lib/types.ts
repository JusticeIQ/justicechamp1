// Core domain types for the JusticeChamp MVP.
// These mirror the Supabase/PostgreSQL schema in /supabase/schema.sql
// so the demo data layer and a future production data layer share one shape.

export type ClaimCategory = "personal_injury" | "employment";

export type ClaimStatus = "draft" | "in_progress" | "submitted" | "under_review" | "matched";

export interface DemoUser {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    jurisdiction?: string;
    preferredLanguage?: string;
    createdAt: string;
    consentClaimComms: boolean;
    accountType: "consumer";
}

export interface IntakeAnswer {
    stepId: string;
    fieldId: string;
    value: string | string[] | boolean | null;
    status: "answered" | "unknown" | "not_applicable" | "later";
}

export interface TimelineEvent {
    id: string;
    claimId: string;
    date: string;
    title: string;
    description: string;
    peopleInvolved: string;
    significance: "low" | "medium" | "high";
    evidenceIds: string[];
}

export type DocumentCategory =
    | "photo"
  | "video"
  | "medical_record"
  | "police_report"
  | "incident_report"
  | "employment_contract"
  | "termination_letter"
  | "pay_record"
  | "email"
  | "text_message"
  | "insurance_correspondence"
  | "witness_statement"
  | "receipt"
  | "other";

export interface ClaimDocument {
    id: string;
    claimId: string;
    name: string;
    category: DocumentCategory;
    description: string;
    important: boolean;
    uploadedAt: string;
    status: "uploaded" | "processing" | "needs_review";
    sizeLabel: string;
    sentToLawyer?: boolean;
    sentToLawyerAt?: string;
}

export interface ScoreFactor {
    label: string;
    weight: number;
    achieved: number;
    detail: string;
}

export interface ClaimScore {
    claimReadiness: number;
    informationCompleteness: number;
    evidenceStrength: number;
    timelineClarity: number;
    urgency: "low" | "moderate" | "high";
    lawyerReviewPriority: "standard" | "elevated" | "high";
    aiConfidence: number;
    missingInformation: string[];
    recommendedNextSteps: string[];
    strengths: string[];
    weaknesses: string[];
    scoreBand: string;
    factors: ScoreFactor[];
    generatedAt: string;
}

export interface LawyerMatch {
    id: string;
    firmName: string;
    lawyerName: string;
    practiceAreas: ClaimCategory[];
    jurisdiction: string;
    languages: string[];
    yearsExperience: number;
    description: string;
    availability: string;
    matchReason: string;
    verifiedPartner: boolean;
    matchScore: number;
}

export interface ConsultationRequest {
    id: string;
    claimId: string;
    lawyerId: string;
    requestedAt: string;
    status: "pending" | "accepted" | "declined";
    sharedSummary: boolean;
}

export interface LawyerMessage {
    id: string;
    claimId: string;
    fromLawyerName: string;
    fromFirmName: string;
    subject: string;
    body: string;
    createdAt: string;
    read: boolean;
    relatedUpdate?: boolean;
}

export interface Claim {
    id: string;
    userId: string;
    category: ClaimCategory;
    subtype: string;
    title: string;
    status: ClaimStatus;
    createdAt: string;
    updatedAt: string;
    currentStep: number;
    totalSteps: number;
    answers: Record<string, IntakeAnswer>;
    timeline: TimelineEvent[];
    documents: ClaimDocument[];
    score: ClaimScore | null;
    goals: string;
    jurisdiction: string;
    incidentDate: string;
    deadlineDate?: string;
    deadlineLabel?: string;
    lawyerMessages: LawyerMessage[];
}

export interface Resource {
    id: string;
    title: string;
    description: string;
    category: string;
    readingTime: string;
    body: string;
    related: string[];
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export interface NotificationItem {
    id: string;
    message: string;
    createdAt: string;
    read: boolean;
    type: "info" | "deadline" | "match" | "task" | "message";
}

export interface ActivityLogItem {
    id: string;
    message: string;
    timestamp: string;
}
