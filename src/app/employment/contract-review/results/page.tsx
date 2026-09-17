"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, DisclaimerBanner, EmptyState } from "@/components/ui";
import { LawyerRecommendationPrompt } from "@/components/LawyerRecommendationPrompt";
import { useAppState } from "@/lib/store";
import { analyzeContractText, extractDocumentOverview } from "@/lib/contract-analyzer";
import { track } from "@/lib/analytics";

function ContractReviewResultsInner() {
  const searchParams = useSearchParams();
  const { getClaim } = useAppState();
  const claim = getClaim(searchParams.get("claim") ?? "");

  useEffect(() => {
    if (claim) track({ name: "results_viewed", props: { tool: "contract" } });
  }, [claim]);

  if (!claim) {
    return <EmptyState title="No contract review found" description="Start a contract review to see your results here." action={<Link href="/employment/contract-review"><Button>Review my employment contract</Button></Link>} />;
  }

  const filesRaw = claim.answers["contractFiles"]?.value;
  const files = typeof filesRaw === "string" && filesRaw ? filesRaw.split(", ") : [];
  const pastedText = typeof claim.answers["contractText"]?.value === "string" ? (claim.answers["contractText"].value as string) : "";
  const unionStatus = typeof claim.answers["unionStatus"]?.value === "string" ? claim.answers["unionStatus"].value : undefined;

  const hasText = pastedText.trim().length > 0;
  const analysis = hasText ? analyzeContractText(pastedText) : null;
  const overview = hasText ? extractDocumentOverview(pastedText) : {};

  const confidence = !hasText ? 0 : Math.max(35, Math.min(92, Math.round(40 + Math.min(analysis!.wordCount, 400) / 8)));

  const questions: string[] = [];
  if (analysis) {
    analysis.flags.forEach((f) => {
      if (f.risk !== "standard") questions.push(`What does the ${f.topic.toLowerCase()} clause actually mean for me, and is it negotiable?`);
    });
  }
  questions.push("Is there anything unusual in this contract compared to a standard agreement in my role and jurisdiction?");
  if (unionStatus === "Unionized") questions.push("How does my collective agreement interact with this individual contract?");

  return (
    <div className="container-page py-8 space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "I need help at work", href: "/report-incident/employment" }, { label: "Review my employment contract" }]} />
      <h1 className="text-2xl font-bold text-navy-900">Review My Contract</h1>
      <DisclaimerBanner />

      <Card>
        <h2 className="font-semibold text-navy-900 text-sm mb-3">Document overview</h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><dt className="text-xs text-navy-700">Files provided</dt><dd className="text-navy-900">{files.length > 0 ? files.join(", ") : "None uploaded"}</dd></div>
          <div><dt className="text-xs text-navy-700">Union status</dt><dd className="text-navy-900">{unionStatus ?? "Not provided"}</dd></div>
          <div><dt className="text-xs text-navy-700">Employer (from text, if found)</dt><dd className="text-navy-900">{overview.employerName ?? "Not found in the text provided"}</dd></div>
          <div><dt className="text-xs text-navy-700">Role (from text, if found)</dt><dd className="text-navy-900">{overview.role ?? "Not found in the text provided"}</dd></div>
          <div><dt className="text-xs text-navy-700">Compensation (from text, if found)</dt><dd className="text-navy-900">{overview.compensationSummary ?? "Not found in the text provided"}</dd></div>
          <div><dt className="text-xs text-navy-700">Effective date (from text, if found)</dt><dd className="text-navy-900">{overview.effectiveDate ?? "Not found in the text provided"}</dd></div>
        </dl>
      </Card>

      <Card>
        <h2 className="font-semibold text-navy-900 text-sm mb-2">Plain-English summary</h2>
        {hasText ? (
          <p className="text-sm text-navy-700">{analysis!.overallSummary}</p>
        ) : (
          <p className="text-sm text-navy-700">
            You uploaded {files.length || "no"} file(s) but didn't paste the contract text, so this demo can't generate a live plain-language
            preview. Go back and paste the text of your contract for an interactive, in-browser summary — or continue and share the uploaded
            file with a lawyer for a full review.
          </p>
        )}
      </Card>

      {hasText && (
        <Card>
          <h2 className="font-semibold text-navy-900 text-sm mb-3">Items to review carefully</h2>
          <ul className="space-y-3">
            {analysis!.flags.map((f) => (
              <li key={f.topic} className="border-b border-navy-900/5 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-navy-900">{f.topic}</span>
                  <Badge tone={f.risk === "standard" ? "teal" : f.risk === "review" ? "amber" : "gray"}>{f.risk}</Badge>
                </div>
                <p className="text-sm text-navy-700 mt-1">{f.summary}</p>
                {f.quote && <p className="text-xs text-navy-700/70 italic mt-1">"{f.quote}"</p>}
                <p className="text-xs text-navy-700/70 mt-1">{f.riskReason}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold text-navy-900 text-sm mb-2">Questions you may wish to ask your employer or a lawyer</h2>
        <ul className="text-sm text-navy-700 space-y-1.5 list-disc list-inside">
          {questions.map((q) => <li key={q}>{q}</li>)}
        </ul>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <h2 className="font-semibold text-amber-900 text-sm">Missing information and AI confidence</h2>
        <p className="text-sm text-amber-900 mt-2">
          {hasText
            ? `AI confidence in this preview: ${confidence}%, based on how much text was available to analyze. Some pages or clauses may not have been captured if they weren't pasted above.`
            : "AI confidence: not available. No contract text was provided for analysis — only the uploaded file name(s) are on record."}
        </p>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-900">
          This review is automated legal information generated in your browser, not legal advice, and not a prediction of whether any clause is
          enforceable. Only a licensed lawyer, reviewing your full contract and jurisdiction, can advise you on your rights.
        </p>
      </Card>

      <LawyerRecommendationPrompt claimId={claim.id} tool="contract" jurisdiction={claim.jurisdiction} />
    </div>
  );
}

export default function ContractReviewResultsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="py-16 text-center text-navy-700 text-sm">Loading your review...</div>}>
        <ContractReviewResultsInner />
      </Suspense>
    </AppShell>
  );
}
