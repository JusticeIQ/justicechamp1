// Lightweight, privacy-conscious analytics stub for the JusticeChamp demo.
//
// This intentionally never receives document text, health details, or
// free-text legal narratives — only the generalized, enumerated properties
// listed in the product spec. In a production build, `track()` would post
// to a real analytics provider; here it logs a structured event so the
// behavior is inspectable in the browser console during a demo.

export type AnalyticsEvent =
  | { name: "legal_need_selected"; props: { need: "personal_injury" | "employment" | "other" } }
  | { name: "employment_tool_selected"; props: { tool: "contract" | "severance" | "other_workplace_issue" } }
  | { name: "questionnaire_started" | "questionnaire_saved" | "questionnaire_resumed" | "questionnaire_completed"; props: { tool: string; sessionId: string; questionNumber?: number; completionStatus?: string } }
  | { name: "document_upload_started" | "document_upload_succeeded" | "document_upload_failed"; props: { tool: string; fileType?: string; sizeBand?: string; errorCode?: string } }
  | { name: "results_viewed"; props: { tool: string; confidenceBand?: string; readinessBand?: string } }
  | { name: "lawyer_recommendation_selected"; props: { choice: "yes" | "not_now"; tool: string; jurisdiction?: string } }
  | { name: "lawyer_match_available" | "lawyer_match_unavailable"; props: { practiceArea: string; jurisdiction?: string } }
  | { name: "availability_request_submitted"; props: { practiceArea: string; jurisdiction?: string } };

export function track(event: AnalyticsEvent) {
  try {
    // eslint-disable-next-line no-console
    console.info(`[analytics] ${event.name}`, event.props);
  } catch {
    // analytics must never break the product experience
  }
}

// A stable, anonymized-looking session id for the demo (not derived from any
// personal information), used only as the "anonymized session ID" property
// on questionnaire lifecycle events.
export function anonymizedSessionId(claimId: string): string {
  let hash = 0;
  for (let i = 0; i < claimId.length; i++) {
    hash = (hash * 31 + claimId.charCodeAt(i)) >>> 0;
  }
  return `sess-${hash.toString(36)}`;
}

export function sizeBand(bytesOrLabel: number | string): string {
  const mb = typeof bytesOrLabel === "number" ? bytesOrLabel / (1024 * 1024) : parseFloat(bytesOrLabel);
  if (!isFinite(mb)) return "unknown";
  if (mb < 1) return "under_1mb";
  if (mb < 5) return "1_5mb";
  if (mb < 10) return "5_10mb";
  return "over_10mb";
}
