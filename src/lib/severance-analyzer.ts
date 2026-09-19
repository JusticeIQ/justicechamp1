import { Claim } from "./types";

// Rule-based, deterministic severance review helper for the JusticeChamp
// demo. Like contract-analyzer.ts, this is a real (if simple) analysis of
// what the person told us — not a canned response, and not legal advice.

export interface SeveranceFlag {
  topic: string;
  summary: string;
  severity: "info" | "review";
  // When true, the results page shows a button next to this flag that takes
  // the person straight into the lawyer-recommendation flow, for flags
  // urgent enough that "read more below" isn't the right call to action.
  promptLawyer?: boolean;
}

export interface SeveranceAnalysis {
  offerSummary: string[];
  flags: SeveranceFlag[];
  missingInformation: string[];
  urgent: boolean;
  urgentMessage?: string;
  confidence: number;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  if (isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function analyzeSeverance(claim: Claim): SeveranceAnalysis {
  const a = claim.answers;
  const terminationReason = str(a["terminationReason"]?.value);
  const deadlineGiven = str(a["deadlineGiven"]?.value);
  const signingDeadlineDate = str(a["signingDeadlineDate"]?.value);
  const signedAgreement = str(a["signedAgreement"]?.value);
  const unionStatus = str(a["unionStatus"]?.value);
  const severanceDetails = str(a["severanceDetails"]?.value);
  const otherDetails = str(a["otherDetails"]?.value);
  const narrative = `${severanceDetails} ${otherDetails}`.trim();
  const docsRaw = a["severanceDocuments"]?.value;
  const docs = typeof docsRaw === "string" && docsRaw ? docsRaw.split(", ") : [];

  const offerSummary: string[] = [];
  const weeksMatch = narrative.match(/(\d+(\.\d+)?)\s*(weeks?|months?)\s*(of\s+)?(pay|salary|severance)/i);
  if (weeksMatch) offerSummary.push(`You mentioned a payment figure (around "${weeksMatch[0]}") — this is what you told us, not a document-verified amount.`);
  if (/benefit/i.test(narrative)) offerSummary.push("You mentioned benefits continuation as part of the offer.");
  if (/release|waiver/i.test(narrative)) offerSummary.push("You mentioned a release or waiver of claims as part of the offer.");
  if (/non.?compete|non.?solicit|non.?disparag/i.test(narrative)) offerSummary.push("You mentioned a restrictive clause (non-compete, non-solicit, or non-disparagement) as part of the offer.");
  if (offerSummary.length === 0) {
    offerSummary.push(
      docs.length > 0
        ? "You uploaded severance document(s), but this demo doesn't extract offer terms from uploaded files — add a short note above (payment, benefits, release, deadline) for a fuller preview."
        : "No offer details were described yet. Add a short note about payment, benefits, release terms, or the deadline for a fuller preview."
    );
  }

  const flags: SeveranceFlag[] = [];
  if (terminationReason === "With cause") {
    flags.push({
      topic: "Reason for termination",
      summary: "Since you have indicated that you were let go with cause, it is recommended that you contact a JusticeChamp lawyer to discuss your termination.",
      severity: "review",
      promptLawyer: true,
    });
  }
  if (terminationReason === "No reason given") {
    flags.push({ topic: "Reason for termination", summary: "No reason was given for your termination. In many jurisdictions, an employer isn't required to state a reason, but this can still be worth raising with a lawyer.", severity: "info" });
  }
  if (signedAgreement === "Yes") {
    flags.push({ topic: "Signed agreement", summary: "You indicated you've already signed a termination or severance agreement. A lawyer can advise on what options, if any, remain.", severity: "review" });
  }
  if (unionStatus === "Unionized") {
    flags.push({ topic: "Union status", summary: "Your position is unionized — a collective agreement may set separate severance terms and a required grievance process.", severity: "info" });
  }
  if (deadlineGiven === "Yes" && !signingDeadlineDate) {
    flags.push({ topic: "Signing deadline", summary: "You indicated a deadline was given, but no date was recorded — add the date for a clearer urgency read.", severity: "review" });
  }

  const missingInformation: string[] = [];
  if (!narrative) missingInformation.push("A short description of the offer's payment, benefits, or release terms");
  if (docs.length === 0) missingInformation.push("A copy of the severance or termination document");
  if (deadlineGiven === "Not sure") missingInformation.push("Confirmation of whether a signing deadline exists");
  if (signedAgreement === "Not sure") missingInformation.push("Confirmation of whether anything has already been signed");

  let urgent = false;
  let urgentMessage: string | undefined;
  if (deadlineGiven === "Yes" && signingDeadlineDate) {
    const days = daysUntil(signingDeadlineDate);
    if (days !== null && days <= 14) {
      urgent = true;
      urgentMessage =
        days < 0
          ? `Your stated signing deadline (${signingDeadlineDate}) has passed. This is a neutral reminder based on what you entered — JusticeChamp is not calculating a legal limitation period.`
          : `Your stated signing deadline (${signingDeadlineDate}) is coming up in ${days} day(s). This is a neutral reminder based on what you entered — JusticeChamp is not calculating a legal limitation period.`;
    }
  }

  const answeredCount = Object.values(a).filter((x) => x.status === "answered" && x.value !== "" && x.value !== null).length;
  const confidence = Math.max(35, Math.min(90, 30 + answeredCount * 4 + (docs.length > 0 ? 10 : 0) + (narrative ? 10 : 0)));

  return { offerSummary, flags, missingInformation, urgent, urgentMessage, confidence };
}
