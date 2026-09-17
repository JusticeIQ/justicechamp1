"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "./ui";
import { useAppState } from "@/lib/store";
import { track } from "@/lib/analytics";

// The standard lawyer-recommendation prompt used at the end of every
// completed pathway (Review My Claim, contract review, severance review,
// and other workplace issues). "Yes" only passes practice area, issue
// subtype, and jurisdiction to matching — no answers or files move until
// the user separately consents on the matching/sharing screen.
export function LawyerRecommendationPrompt({
  claimId,
  tool,
  jurisdiction,
}: {
  claimId: string;
  tool: string;
  jurisdiction?: string;
}) {
  const router = useRouter();
  const { setLawyerRecommendationChoice } = useAppState();
  const [choice, setChoice] = useState<"yes" | "not_now" | null>(null);

  function handleYes() {
    setLawyerRecommendationChoice(claimId, "yes");
    track({ name: "lawyer_recommendation_selected", props: { choice: "yes", tool, jurisdiction } });
    router.push(`/lawyer-matches?claim=${claimId}`);
  }

  function handleNotNow() {
    setLawyerRecommendationChoice(claimId, "not_now");
    track({ name: "lawyer_recommendation_selected", props: { choice: "not_now", tool, jurisdiction } });
    setChoice("not_now");
  }

  if (choice === "not_now") {
    return (
      <Card className="bg-teal-50 border-teal-200">
        <p className="text-sm text-teal-900">
          No problem — your result has been saved. You can request lawyer recommendations any time from{" "}
          <span className="font-medium">Request lawyer recommendations</span> on your dashboard.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-semibold text-navy-900">Would you like JusticeChamp to recommend lawyers who specialize in this area and may be able to help you?</h2>
      <div className="flex flex-wrap gap-3 mt-4">
        <Button variant="cta" onClick={handleYes}>Yes, show me matching lawyers</Button>
        <Button variant="outline" onClick={handleNotNow}>Not now</Button>
      </div>
    </Card>
  );
}
