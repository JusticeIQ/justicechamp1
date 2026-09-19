"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, DisclaimerBanner, EmptyState } from "@/components/ui";
import { LawyerRecommendationPrompt } from "@/components/LawyerRecommendationPrompt";
import { useAppState } from "@/lib/store";
import { analyzeSeverance } from "@/lib/severance-analyzer";
import { track } from "@/lib/analytics";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function SeveranceResultsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getClaim, setLawyerRecommendationChoice } = useAppState();
  const claim = getClaim(searchParams.get("claim") ?? "");
  
  function connectToLawyerNow() {
    if (!claim) return;
    setLawyerRecommendationChoice(claim.id, "yes");    
    track({ name: "lawyer_recommendation_selected", props: { choice: "yes", tool: "severance", jurisdiction: claim.jurisdiction } });
    router.push(`/lawyer-matches?claim=${claim.id}`);
  }
  
  useEffect(() => {
    if (claim) track({ name: "results_viewed", props: { tool: "severance" } });
  }, [claim]);

  if (!claim) {
    return <EmptyState title="No severance review found" description="Start a severance review to see your results here." action={<Link href="/employment/severance-review"><Button>Review my severance package</Button></Link>} />;
  }

  const analysis = analyzeSeverance(claim);
  const a = claim.answers;

  const keyFacts: { label: string; value: string }[] = [
    { label: "Union status", value: str(a["unionStatus"]?.value) || "Not provided" },
    { label: "Employer", value: str(a["employerName"]?.value) || "Not provided" },
    { label: "Workplace location", value: claim.jurisdiction || "Not provided" },
    { label: "Job title", value: str(a["jobTitle"]?.value) || "Not provided" },
    { label: "Length of employment", value: str(a["tenure"]?.value) || "Not provided" },
    { label: "Final day of work", value: str(a["finalDayOfWork"]?.value) || "Not provided" },
    { label: "Reason given", value: str(a["terminationReason"]?.value) || "Not provided" },
    { label: "Signed anything yet", value: str(a["signedAgreement"]?.value) || "Not provided" },
  ];

  return (
    <div className="container-page py-8 space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "I need help at work", href: "/report-incident/employment" }, { label: "Review my severance package" }]} />
      <h1 className="text-2xl font-bold text-navy-900">Review My Severance Package</h1>
      <DisclaimerBanner />

      {analysis.urgent && (
        <Card className="bg-amber-50 border-amber-300">
          <h2 className="font-semibold text-amber-900 text-sm">Urgency reminder</h2>
          <p className="text-sm text-amber-900 mt-1">{analysis.urgentMessage}</p>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold text-navy-900 text-sm mb-3">Key facts you provided</h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          {keyFacts.map((f) => (
            <div key={f.label}><dt className="text-xs text-navy-700">{f.label}</dt><dd className="text-navy-900">{f.value}</dd></div>
          ))}
        </dl>
      </Card>

      <Card>
        <h2 className="font-semibold text-navy-900 text-sm mb-2">Summary of the offer</h2>
        <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside">
          {analysis.offerSummary.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </Card>

      {analysis.flags.length > 0 && (
        <Card>
          <h2 className="font-semibold text-navy-900 text-sm mb-3">Items that may require legal review</h2>
          <ul className="space-y-3">
            {analysis.flags.map((f) => (
              <li key={f.topic} className="border-b border-navy-900/5 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-navy-900">{f.topic}</span>
                  <Badge tone={f.severity === "review" ? "amber" : "gray"}>{f.severity === "review" ? "worth reviewing" : "for context"}</Badge>
                </div>
                <p className="text-sm text-navy-700 mt-1">{f.summary}</p>
                {f.promptLawyer && (
                <Button variant="cta" size="sm" className="mt-2" onClick={connectToLawyerNow}>
                  Connect with a JusticeChamp lawyer now
                </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold text-navy-900 text-sm mb-2">Suggested next steps</h2>
        <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside">
          <li>Keep a copy of the severance offer and any deadline communications.</li>
          <li>Avoid signing until you've had a chance to have it reviewed.</li>
          <li>Note the exact signing deadline, if any, in your calendar.</li>
          <li>Consider speaking with an employment lawyer before responding to your employer.</li>
        </ul>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-900">
          This is automated legal information generated from what you entered, not legal advice, and JusticeChamp is not calculating a legal
          limitation period. Only a JusticeChamp lawyer can evaluate your specific offer and jurisdiction.
        </p>
      </Card>

      <LawyerRecommendationPrompt claimId={claim.id} tool="severance" jurisdiction={claim.jurisdiction} />
    </div>
  );
}

export default function SeveranceReviewResultsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="py-16 text-center text-navy-700 text-sm">Loading your review...</div>}>
        <SeveranceResultsInner />
      </Suspense>
    </AppShell>
  );
}
