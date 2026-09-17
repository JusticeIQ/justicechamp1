"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Button, DisclaimerBanner, EmptyState } from "@/components/ui";
import { LawyerRecommendationPrompt } from "@/components/LawyerRecommendationPrompt";
import { useAppState } from "@/lib/store";
import { track } from "@/lib/analytics";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function WorkplaceIssueResultsInner() {
  const searchParams = useSearchParams();
  const { getClaim } = useAppState();
  const claim = getClaim(searchParams.get("claim") ?? "");

  useEffect(() => {
    if (claim) track({ name: "results_viewed", props: { tool: "other_workplace_issue" } });
  }, [claim]);

  if (!claim) {
    return <EmptyState title="No workplace issue report found" description="Start a report to see your results here." action={<Link href="/employment/workplace-issue"><Button>Other issues I am having at work</Button></Link>} />;
  }

  const a = claim.answers;
  const concernType = str(a["concernType"]?.value);
  const concernOther = str(a["concernOther"]?.value);
  const concern = concernType === "Other" && concernOther ? concernOther : concernType;
  const narrative = str(a["narrative"]?.value);
  const unionStatus = str(a["unionStatus"]?.value);
  const importantDate = str(a["importantDate"]?.value);
  const importantNote = str(a["importantNote"]?.value);
  const filesRaw = a["supportingFiles"]?.value;
  const files = typeof filesRaw === "string" && filesRaw ? filesRaw.split(", ") : [];

  const relevantInfo: string[] = [];
  if (concern) relevantInfo.push(`You've described this as a concern about: ${concern.toLowerCase()}.`);
  if (unionStatus) relevantInfo.push(`Your position is ${unionStatus.toLowerCase()}${unionStatus === "Unionized" ? " — a collective agreement or grievance process may apply." : "."}`);
  if (claim.jurisdiction) relevantInfo.push(`Workplace location on file: ${claim.jurisdiction}.`);
  if (importantDate) relevantInfo.push(`You noted an important date: ${importantDate}.`);
  if (files.length > 0) relevantInfo.push(`You uploaded ${files.length} supporting file(s): ${files.join(", ")}.`);

  const missing: string[] = [];
  if (!narrative) missing.push("A description of what happened");
  if (!importantDate && !importantNote && files.length === 0) missing.push("Dates, messages, or documents that support your account");
  if (!unionStatus) missing.push("Whether your position is unionized");

  return (
    <div className="container-page py-8 space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "I need help at work", href: "/report-incident/employment" }, { label: "Other issues I am having at work" }]} />
      <h1 className="text-2xl font-bold text-navy-900">Your Workplace Concern</h1>
      <DisclaimerBanner />

      <Card>
        <h2 className="font-semibold text-navy-900 text-sm mb-2">Summary of what you reported</h2>
        <p className="text-sm text-navy-700">{narrative || "No description was provided yet."}</p>
      </Card>

      <Card>
        <h2 className="font-semibold text-navy-900 text-sm mb-2">Information that may be relevant</h2>
        {relevantInfo.length === 0 ? (
          <p className="text-sm text-navy-700">Add a few more details above for a fuller picture.</p>
        ) : (
          <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside">
            {relevantInfo.map((s) => <li key={s}>{s}</li>)}
          </ul>
        )}
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <h2 className="font-semibold text-amber-900 text-sm mb-2">Missing information</h2>
        {missing.length === 0 ? (
          <p className="text-sm text-amber-900">No obvious gaps — you can still add more detail any time from your dashboard.</p>
        ) : (
          <ul className="text-sm text-amber-900 space-y-1 list-disc list-inside">
            {missing.map((s) => <li key={s}>{s}</li>)}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold text-navy-900 text-sm mb-2">Possible next steps</h2>
        <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside">
          <li>Write down dates, times, and who was present while they're fresh in your memory.</li>
          <li>Save any related messages, emails, or documents in a safe place.</li>
          <li>Review your employer's policies on this topic, if available.</li>
          <li>Consider speaking with an employment lawyer about your options.</li>
        </ul>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-900">
          This is organized, informational content based on what you described — not a legal opinion, and not a determination that any conduct
          was unlawful. Only a licensed lawyer can assess the merits of your situation.
        </p>
      </Card>

      <LawyerRecommendationPrompt claimId={claim.id} tool="other_workplace_issue" jurisdiction={claim.jurisdiction} />
    </div>
  );
}

export default function WorkplaceIssueResultsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="py-16 text-center text-navy-700 text-sm">Loading your results...</div>}>
        <WorkplaceIssueResultsInner />
      </Suspense>
    </AppShell>
  );
}
