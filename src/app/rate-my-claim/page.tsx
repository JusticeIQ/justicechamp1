"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, DisclaimerBanner, EmptyState } from "@/components/ui";
import { ScoreGauge, MiniMeter } from "@/components/ScoreGauge";
import { LawyerRecommendationPrompt } from "@/components/LawyerRecommendationPrompt";
import { useAppState } from "@/lib/store";
import { track } from "@/lib/analytics";

const CATEGORY_LABEL: Record<string, string> = { personal_injury: "personal injury", employment: "employment" };
const URGENCY_TONE: Record<string, "teal" | "amber" | "red"> = { low: "teal", moderate: "amber", high: "red" };
const PRIORITY_TONE: Record<string, "gray" | "amber" | "teal"> = { standard: "gray", elevated: "amber", high: "teal" };

function summarySentence(category: string, band?: string): string {
  const categoryLabel = CATEGORY_LABEL[category] ?? "claim";
  if (!band) return `We're still gathering information about your ${categoryLabel} claim.`;
  return `Based on what you've told us, your ${categoryLabel} claim currently shows: ${band.toLowerCase()}.`;
}

function confidenceReason(aiConfidence: number, completeness: number, evidenceCount: number): string {
  if (completeness >= 80 && evidenceCount >= 2) return `This is a higher-confidence read because most intake questions are answered and ${evidenceCount} document(s) are on file.`;
  if (completeness < 50) return "This is a lower-confidence read mainly because several intake questions are still unanswered — completing more of the intake will sharpen this preview.";
  if (evidenceCount === 0) return "This is a lower-confidence read mainly because no supporting documents have been uploaded yet.";
  return "This reflects how complete and consistent your current answers and evidence are — it will improve as you add more information.";
}

function RateMyClaimInner() {
  const searchParams = useSearchParams();
  const { claims, recomputeScore } = useAppState();
  const claimParam = searchParams.get("claim");
  const [selectedId, setSelectedId] = useState<string | null>(claimParam ?? claims[0]?.id ?? null);
  const claim = claims.find((c) => c.id === selectedId) ?? claims[0];

  useEffect(() => {
    if (claim?.score) {
      track({ name: "results_viewed", props: { tool: "personal_injury", confidenceBand: String(claim.score.aiConfidence), readinessBand: claim.score.scoreBand } });
    }
  }, [claim?.id, claim?.score]);

  return (
    <div className="container-page py-8 space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Review My Claim" }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy-900">Review My Claim</h1>
        {claims.length > 0 && (
          <div className="flex gap-2">
            {claims.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`text-xs px-3 py-1.5 rounded-full border focus-ring ${c.id === (claim?.id) ? "border-teal-500 bg-teal-50 text-teal-700" : "border-navy-900/15 text-navy-700"}`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {!claim ? (
        <EmptyState title="No claims to assess yet" description="Report an incident first, then return here to generate a claim-readiness score." action={<Link href="/get-started"><Button>What can I help you with?</Button></Link>} />
      ) : (
        <>
          {/* 1. One-sentence plain-language summary */}
          <Card>
            <p className="text-navy-900 font-medium">{summarySentence(claim.category, claim.score?.scoreBand)}</p>
          </Card>

          {/* 2. Claim-readiness score with explanation */}
          <Card className="text-center py-10">
            <p className="text-sm text-navy-700">Your current claim-readiness score is:</p>
            <div className="flex justify-center my-6"><ScoreGauge score={claim.score?.claimReadiness ?? 0} size={180} /></div>
            <Badge>{claim.score?.scoreBand}</Badge>
            <p className="text-xs text-navy-700/70 mt-4 max-w-md mx-auto">
              This score measures how organized and complete your information is — not the legal merit of your claim, the value of any damages, or
              the likely outcome. It is not a legal opinion, a probability of winning, or a settlement estimate.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Link href={`/report-incident/personal-injury?claim=${claim.id}`}>
                <Button variant="outline">Improve My Score</Button>
              </Link>
              <Button variant="ghost" onClick={() => recomputeScore(claim.id)}>Recalculate</Button>
            </div>
          </Card>

          {/* 3. AI confidence with plain-language reason */}
          <Card>
            <h2 className="font-semibold text-navy-900 text-sm mb-3">AI confidence</h2>
            <MiniMeter label="AI confidence level" value={claim.score?.aiConfidence ?? 0} />
            <p className="text-sm text-navy-700 mt-3">{confidenceReason(claim.score?.aiConfidence ?? 0, claim.score?.informationCompleteness ?? 0, claim.documents.length)}</p>
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <p className="text-xs text-navy-700">Urgency indicator</p>
                <Badge tone={URGENCY_TONE[claim.score?.urgency ?? "low"]}>{claim.score?.urgency}</Badge>
              </div>
              <div>
                <p className="text-xs text-navy-700">Lawyer review priority</p>
                <Badge tone={PRIORITY_TONE[claim.score?.lawyerReviewPriority ?? "standard"]}>{claim.score?.lawyerReviewPriority}</Badge>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 4. What is well documented */}
            <Card>
              <h2 className="font-semibold text-navy-900 text-sm mb-2">What is well documented</h2>
              <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside">
                {claim.score?.strengths.map((s) => <li key={s}>{s}</li>)}
              </ul>
              <div className="mt-4 space-y-3">
                <MiniMeter label="Information completeness" value={claim.score?.informationCompleteness ?? 0} />
                <MiniMeter label="Evidence strength" value={claim.score?.evidenceStrength ?? 0} />
                <MiniMeter label="Timeline clarity" value={claim.score?.timelineClarity ?? 0} />
              </div>
            </Card>

            {/* 5. What may need attention */}
            <Card>
              <h2 className="font-semibold text-navy-900 text-sm mb-2">What may need attention</h2>
              <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside">
                {claim.score?.missingInformation.length === 0 ? <li>No critical gaps identified</li> : claim.score?.missingInformation.map((s) => <li key={s}>{s}</li>)}
              </ul>
              {claim.score?.weaknesses && claim.score.weaknesses.length > 0 && (
                <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside mt-3 border-t border-navy-900/5 pt-3">
                  {claim.score.weaknesses.map((s) => <li key={s}>{s}</li>)}
                </ul>
              )}
            </Card>
          </div>

          {/* 6. Possible next steps */}
          <Card>
            <h2 className="font-semibold text-navy-900 text-sm mb-2">Possible next steps</h2>
            <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside">
              {claim.score?.recommendedNextSteps.map((s) => <li key={s}>{s}</li>)}
              <li>Note important dates and preserve evidence in one place.</li>
              <li>Continue any recommended medical follow-up.</li>
            </ul>
          </Card>

          {/* 7. Legal-information disclaimer + standard lawyer recommendation prompt */}
          <Card className="bg-amber-50 border-amber-200">
            <h2 className="font-semibold text-amber-900 text-sm">Important limitation notice</h2>
            <p className="text-sm text-amber-900 mt-2">
              This score reflects how complete and well-organized your intake information is. It does not calculate a probability of winning your
              case, assign a settlement value, or guarantee that any lawyer will accept your matter. Only a licensed lawyer, reviewing the specific
              facts and applicable law, can evaluate the merits of your situation.
            </p>
          </Card>

          <LawyerRecommendationPrompt claimId={claim.id} tool="personal_injury" jurisdiction={claim.jurisdiction} />
        </>
      )}
    </div>
  );
}

export default function RateMyClaimPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="py-16 text-center text-navy-700 text-sm">Loading...</div>}>
        <RateMyClaimInner />
      </Suspense>
    </AppShell>
  );
}
