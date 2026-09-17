"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, EmptyState, DisclaimerBanner } from "@/components/ui";
import { useAppState } from "@/lib/store";
import { DEMO_LAWYERS } from "@/lib/demo-data";
import { track } from "@/lib/analytics";

function regionOf(jurisdiction: string | undefined): string {
  if (!jurisdiction) return "";
  return jurisdiction.split(",")[0].trim();
}

function LawyerMatchesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { claims, requestConsultation, recordShare } = useAppState();
  const claimParam = searchParams.get("claim");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(claimParam ?? claims[0]?.id ?? null);
  const claim = claims.find((c) => c.id === selectedClaimId) ?? claims[0];

  const [openConsent, setOpenConsent] = useState<string | null>(null);
  const [shareContact, setShareContact] = useState(false);
  const [shareSummary, setShareSummary] = useState(false);
  const [shareDocs, setShareDocs] = useState<Record<string, boolean>>({});
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const matches = useMemo(() => {
    if (!claim) return [];
    const region = regionOf(claim.jurisdiction);
    return DEMO_LAWYERS.filter((l) => l.practiceAreas.includes(claim.category) && (!region || l.jurisdiction === region)).sort((a, b) => b.matchScore - a.matchScore);
  }, [claim]);

  const noMatch = Boolean(claim) && matches.length === 0;

  useEffect(() => {
    if (!claim) return;
    if (noMatch) {
      track({ name: "lawyer_match_unavailable", props: { practiceArea: claim.category, jurisdiction: claim.jurisdiction } });
    } else {
      track({ name: "lawyer_match_available", props: { practiceArea: claim.category, jurisdiction: claim.jurisdiction } });
    }
  }, [claim?.id, noMatch]);

  function openConsentFor(lawyerId: string) {
    setOpenConsent(lawyerId);
    setShareContact(false);
    setShareSummary(false);
    setShareDocs({});
  }

  function confirmRequest(lawyerId: string, lawyerName: string, firmName: string) {
    if (!claim) return;
    const fields: string[] = [];
    if (shareContact) fields.push("Contact details");
    if (shareSummary) fields.push("Assessment summary");
    Object.entries(shareDocs).forEach(([name, checked]) => checked && fields.push(name));
    requestConsultation(claim.id, lawyerId, lawyerName);
    recordShare(claim.id, { lawyerId, lawyerName, firmName, fields });
    setRequested((prev) => new Set(prev).add(lawyerId));
    setOpenConsent(null);
  }

  if (claim && noMatch) {
    return (
      <div className="container-page py-8 space-y-4 max-w-xl">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Lawyer Matches" }]} />
        <Card>
          <p className="text-sm text-navy-700">We don't have an approved lawyer serving your area and practice area just yet.</p>
          <Button className="mt-4" onClick={() => router.push(`/lawyer-availability?practiceArea=${claim.category}&jurisdiction=${encodeURIComponent(claim.jurisdiction ?? "")}`)}>
            Continue
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-page py-8 space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Lawyer Matches" }]} />
      <h1 className="text-2xl font-bold text-navy-900">Lawyer Matches</h1>
      <DisclaimerBanner compact />
      <p className="text-xs text-navy-700 -mt-2">
        All lawyer and firm profiles shown are demonstration data for this MVP and do not represent real legal service providers. A match is not
        an endorsement, a representation agreement, or a guarantee of outcome.
      </p>

      {claims.length === 0 ? (
        <EmptyState title="No claims yet" description="Start a review to see matched lawyers for your situation." action={<Link href="/get-started"><Button>What can I help you with?</Button></Link>} />
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {claims.map((c) => (
              <button key={c.id} onClick={() => setSelectedClaimId(c.id)} className={`text-xs px-3 py-1.5 rounded-full border focus-ring ${c.id === claim?.id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-navy-900/15 text-navy-700"}`}>
                {c.title}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {matches.map((lawyer) => {
              const isRequested = requested.has(lawyer.id);
              const sentRecord = claim?.sharedWithLawyers?.find((r) => r.lawyerId === lawyer.id);
              const anySelected = shareContact || shareSummary || Object.values(shareDocs).some(Boolean);
              return (
                <Card key={lawyer.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {lawyer.verifiedPartner && <Badge tone="teal">Verified partner</Badge>}
                        <Badge tone="gray">Licensed in {lawyer.jurisdiction}</Badge>
                      </div>
                      <h2 className="font-semibold text-navy-900 mt-2">{lawyer.lawyerName}</h2>
                      <p className="text-sm text-navy-700">{lawyer.firmName}</p>
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 gap-2 mt-4 text-xs text-navy-700">
                    <div><dt className="text-navy-700/70">Jurisdiction</dt><dd className="text-navy-900">{lawyer.jurisdiction}</dd></div>
                    <div><dt className="text-navy-700/70">Focus area</dt><dd className="text-navy-900">{lawyer.practiceAreas.includes("personal_injury") ? "Personal injury" : "Employment law"}</dd></div>
                    <div><dt className="text-navy-700/70">Languages</dt><dd className="text-navy-900">{lawyer.languages.join(", ")}</dd></div>
                    <div><dt className="text-navy-700/70">Availability</dt><dd className="text-navy-900">{lawyer.availability}</dd></div>
                  </dl>

                  <p className="text-sm text-navy-700 mt-3">{lawyer.description}</p>
                  <p className="text-xs text-teal-700 bg-teal-50 rounded-lg p-2 mt-3">Why this match: {lawyer.matchReason}</p>

                  {isRequested ? (
                    <div className="mt-4 space-y-2">
                      <div className="rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-sm p-3">
                        Consultation requested. {lawyer.lawyerName} will typically reach out within 1–2 business days.
                      </div>
                      {sentRecord && (
                        <div className="rounded-lg border border-navy-900/10 text-xs text-navy-700 p-3">
                          <p className="font-medium text-navy-900">What was sent, to whom, and when</p>
                          <p className="mt-1">To: {sentRecord.lawyerName}, {sentRecord.firmName}</p>
                          <p>When: {new Date(sentRecord.sharedAt).toLocaleString()}</p>
                          <p>What: {sentRecord.fields.length > 0 ? sentRecord.fields.join(", ") : "Consultation request only — no documents or summary shared"}</p>
                        </div>
                      )}
                    </div>
                  ) : openConsent === lawyer.id ? (
                    <div className="mt-4 border border-navy-900/10 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-medium text-navy-900">Choose exactly what to share with {lawyer.firmName}. Nothing is sent until you confirm.</p>
                      <label className="flex items-start gap-2 text-xs text-navy-700">
                        <input type="checkbox" checked={shareContact} onChange={(e) => setShareContact(e.target.checked)} className="mt-0.5" />
                        Contact details
                      </label>
                      <label className="flex items-start gap-2 text-xs text-navy-700">
                        <input type="checkbox" checked={shareSummary} onChange={(e) => setShareSummary(e.target.checked)} className="mt-0.5" />
                        Assessment summary
                      </label>
                      {claim?.documents.map((d) => (
                        <label key={d.id} className="flex items-start gap-2 text-xs text-navy-700">
                          <input type="checkbox" checked={!!shareDocs[d.name]} onChange={(e) => setShareDocs({ ...shareDocs, [d.name]: e.target.checked })} className="mt-0.5" />
                          {d.name}
                        </label>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" disabled={!anySelected} onClick={() => confirmRequest(lawyer.id, lawyer.lawyerName, lawyer.firmName)}>Confirm & send</Button>
                        <Button size="sm" variant="ghost" onClick={() => setOpenConsent(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => openConsentFor(lawyer.id)}>Request consultation</Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function LawyerMatchesPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="py-16 text-center text-navy-700 text-sm">Loading...</div>}>
        <LawyerMatchesInner />
      </Suspense>
    </AppShell>
  );
}
