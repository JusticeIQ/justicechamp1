import { Claim, ClaimScore, ScoreFactor } from "./types";

// Transparent, deterministic "Rate My Claim" scoring engine.
// This produces a preliminary INFORMATIONAL readiness score only.
// It does not estimate likelihood of success or settlement value.

function bandForScore(score: number): string {
  if (score < 40) return "More information needed";
  if (score < 60) return "Developing claim record";
  if (score < 75) return "Review recommended";
  if (score < 90) return "Strong intake readiness";
  return "Comprehensive intake package";
}

function countAnswered(claim: Claim, ids: string[]): number {
  return ids.filter((id) => {
    const a = claim.answers[id];
    return a && a.status === "answered" && a.value !== "" && a.value !== null;
  }).length;
}

export function computeClaimScore(claim: Claim): ClaimScore {
  const answers = claim.answers;
  const totalFields = Object.keys(answers).length || 1;
  const answeredFields = Object.values(answers).filter((a) => a.status === "answered" && a.value !== "" && a.value !== null).length;
  const informationCompleteness = Math.round((answeredFields / totalFields) * 100);

  const hasDate = Boolean(claim.incidentDate);
  const hasJurisdiction = Boolean(claim.jurisdiction);
  const evidenceCount = claim.documents.length;
  const importantEvidence = claim.documents.filter((d) => d.important).length;
  const evidenceStrength = Math.min(100, evidenceCount * 15 + importantEvidence * 10);

  const timelineEvents = claim.timeline.length;
  const timelineClarity = Math.min(100, timelineEvents * 20 + (hasDate ? 15 : 0));

  const witnessAnswer = answers["witnesses"];
  const hasWitnessInfo = Boolean(witnessAnswer && witnessAnswer.status === "answered" && witnessAnswer.value);

  const medicalOrFinancial = countAnswered(claim, ["medicalTreatment", "financialImpact", "incomeImpact", "compensation"]);

  const factors: ScoreFactor[] = [
    { label: "Essential field completion", weight: 25, achieved: Math.round((informationCompleteness / 100) * 25), detail: `${answeredFields} of ${totalFields} intake fields answered.` },
    { label: "Incident date & jurisdiction identified", weight: 15, achieved: (hasDate ? 8 : 0) + (hasJurisdiction ? 7 : 0), detail: hasDate && hasJurisdiction ? "Date and jurisdiction are both recorded." : "Missing date and/or jurisdiction." },
    { label: "Evidence uploaded", weight: 20, achieved: Math.round((evidenceStrength / 100) * 20), detail: `${evidenceCount} document(s) uploaded, ${importantEvidence} flagged important.` },
    { label: "Witness information", weight: 10, achieved: hasWitnessInfo ? 10 : 0, detail: hasWitnessInfo ? "Witness details recorded." : "No witness information recorded yet." },
    { label: "Medical / financial documentation", weight: 15, achieved: Math.min(15, medicalOrFinancial * 5), detail: `${medicalOrFinancial} related field(s) answered.` },
    { label: "Chronology / timeline built", weight: 15, achieved: Math.round((timelineClarity / 100) * 15), detail: `${timelineEvents} timeline event(s) recorded.` },
  ];

  const claimReadiness = Math.min(100, factors.reduce((sum, f) => sum + f.achieved, 0));

  const missingInformation: string[] = [];
  if (!hasDate) missingInformation.push("Confirm the incident date");
  if (!hasJurisdiction) missingInformation.push("Confirm jurisdiction (state or province)");
  if (evidenceCount === 0) missingInformation.push("Upload at least one supporting document");
  if (!hasWitnessInfo) missingInformation.push("Add witness information, if any exists");
  if (timelineEvents === 0) missingInformation.push("Build out your claim timeline");
  if (informationCompleteness < 80) missingInformation.push("Complete remaining intake questions");

  const recommendedNextSteps: string[] = [];
  if (evidenceCount < 3) recommendedNextSteps.push("Upload additional supporting documents or photos");
  if (timelineEvents < 3) recommendedNextSteps.push("Add more events to your timeline for a clearer chronology");
  if (!hasWitnessInfo) recommendedNextSteps.push("Record contact details for any witnesses");
  recommendedNextSteps.push("Review your claim summary for accuracy before requesting lawyer review");

  const strengths: string[] = [];
  if (hasDate && hasJurisdiction) strengths.push("Core incident details (date, jurisdiction) are recorded");
  if (evidenceCount >= 2) strengths.push("Multiple supporting documents already uploaded");
  if (timelineEvents >= 2) strengths.push("A chronological timeline has been started");
  if (informationCompleteness >= 70) strengths.push("Most intake questions have been answered");
  if (strengths.length === 0) strengths.push("You've started documenting your situation, which is the first step");

  const weaknesses: string[] = [];
  if (informationCompleteness < 70) weaknesses.push("Several intake questions remain unanswered");
  if (evidenceCount === 0) weaknesses.push("No supporting documents uploaded yet");
  if (!hasWitnessInfo) weaknesses.push("No witness information on file");
  if (timelineEvents === 0) weaknesses.push("No timeline events recorded yet");
  if (weaknesses.length === 0) weaknesses.push("No major gaps identified, though a lawyer may still request more detail");

  const urgency: ClaimScore["urgency"] = claim.deadlineDate ? "high" : hasJurisdiction ? "moderate" : "low";
  const lawyerReviewPriority: ClaimScore["lawyerReviewPriority"] = claimReadiness >= 75 ? "high" : claimReadiness >= 50 ? "elevated" : "standard";
  const aiConfidence = Math.max(35, Math.min(95, Math.round((informationCompleteness + evidenceStrength + timelineClarity) / 3)));

  return {
    claimReadiness,
    informationCompleteness,
    evidenceStrength,
    timelineClarity,
    urgency,
    lawyerReviewPriority,
    aiConfidence,
    missingInformation,
    recommendedNextSteps,
    strengths,
    weaknesses,
    scoreBand: bandForScore(claimReadiness),
    factors,
    generatedAt: new Date().toISOString(),
  };
}
