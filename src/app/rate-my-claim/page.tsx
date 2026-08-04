"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, DisclaimerBanner, EmptyState } from "@/components/ui";
import { ScoreGauge, MiniMeter } from "@/components/ScoreGauge";
import { useAppState } from "@/lib/store";

const CATEGORY_LABEL: Record<string, string> = { personal_injury: "Personal Injury", employment: "Employment Law" };
const URGENCY_TONE: Record<string, "teal" | "amber" | "red"> = { low: "teal", moderate: "amber", high: "red" };
const PRIORITY_TONE: Record<string, "gray" | "amber" | "teal"> = { standard: "gray", elevated: "amber", high: "teal" };

export default function RateMyClaimPage() {
  const { claims, recomputeScore } = useAppState();
  const [selectedId, setSelectedId] = useState<string | null>(claims[0]?.id ?? null);
  const claim = claims.find((c) => c.id === selectedId) ?? claims[0];

  return (
    <AppShell>
      <div className="container-page py-8 space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Rate My Claim" }]} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-navy-900">Rate My Claim</h1>
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
          <EmptyState title="No claims to assess yet" description="Report an incident first, then return here to generate a claim-readiness score." action={<Link href="/report-incident"><Button>Report an Incident</Button></Link>} />
        ) : (
          <>
            <DisclaimerBanner />

            <Card className="text-center py-10">
              <p className="text-sm text-navy-700">Based on the information provided, your current claim-readiness score is:</p>
              <div className="flex justify-center my-6"><ScoreGauge score={claim.score?.claimReadiness ?? 0} size={180} /></div>
              <Badge>{claim.score?.scoreBand}</Badge>
              <p className="text-xs text-navy-700/70 mt-4 max-w-md mx-auto">
                This is a preliminary, informational readiness score — not a legal opinion, not a probability of winning, and
                not a settlement estimate.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Link href={`/report-incident/${claim.category === "personal_injury" ? "personal-injury" : "employment"}?claim=${claim.id}`}>
                  <Button variant="outline">Improve My Score</Button>
                </Link>
                <Link href="/lawyer-matches"><Button variant="cta">Request Lawyer Review</Button></Link>
                <Button variant="ghost" onClick={() => recomputeScore(claim.id)}>Recalculate</Button>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <h2 className="font-semibold text-navy-900 text-sm mb-4">Assessment breakdown</h2>
                <div className="space-y-3">
                  <MiniMeter label="Information completeness" value={claim.score?.informationCompleteness ?? 0} />
                  <MiniMeter label="Evidence strength" value={claim.score?.evidenceStrength ?? 0} />
                  <MiniMeter label="Timeline clarity" value={claim.score?.timelineClarity ?? 0} />
                  <MiniMeter label="AI confidence level" value={claim.score?.aiConfidence ?? 0} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div>
                    <p className="text-xs text-navy-700">Urgency indicator</p>
                    <Badge tone={URGENCY_TONE[claim.score?.urgency ?? "low"]}>{claim.score?.urgency}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-navy-700">Lawyer review priority</p>
                    <Badge tone={PRIORITY_TONE[claim.score?.lawyerReviewPriority ?? "standard"]}>{claim.score?.lawyerReviewPriority}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-navy-700">Potential legal category</p>
                    <Badge tone="navy">{CATEGORY_LABEL[claim.category]}</Badge>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="font-semibold text-navy-900 text-sm mb-3">How this score was produced</h2>
                <ul className="space-y-2 text-sm text-navy-700">
                  {claim.score?.factors.map((f) => (
                    <li key={f.label} className="flex justify-between gap-3 border-b border-navy-900/5 pb-2">
                      <div>
                        <p className="text-navy-900">{f.label}</p>
                        <p className="text-xs">{f.detail}</p>
                      </div>
                      <span className="text-navy-900 font-medium whitespace-nowrap">{f.achieved}/{f.weight}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <h2 className="font-semibold text-navy-900 text-sm mb-2">Key strengths</h2>
                <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside">
                  {claim.score?.strengths.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </Card>
              <Card>
                <h2 className="font-semibold text-navy-900 text-sm mb-2">Possible weaknesses or uncertainties</h2>
                <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside">
                  {claim.score?.weaknesses.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </Card>
              <Card>
                <h2 className="font-semibold text-navy-900 text-sm mb-2">Missing information</h2>
                <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside">
                  {claim.score?.missingInformation.length === 0 ? <li>No critical gaps identified</li> : claim.score?.missingInformation.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </Card>
            </div>

            <Card>
              <h2 className="font-semibold text-navy-900 text-sm mb-2">Recommended next steps</h2>
              <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside">
                {claim.score?.recommendedNextSteps.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <h2 className="font-semibold text-amber-900 text-sm">Important limitation notice</h2>
              <p className="text-sm text-amber-900 mt-2">
                This score reflects how complete and well-organized your intake information is. It does not calculate a
                probability of winning your case, assign a settlement value, or guarantee that any lawyer will accept your
                matter. Only a licensed lawyer, reviewing the specific facts and applicable law, can evaluate the merits of
                your situation.
              </p>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
