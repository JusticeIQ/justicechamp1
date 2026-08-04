"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, EmptyState, DisclaimerBanner } from "@/components/ui";
import { useAppState } from "@/lib/store";
import { DEMO_LAWYERS } from "@/lib/demo-data";

export default function LawyerMatchesPage() {
  const { claims, requestConsultation } = useAppState();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(claims[0]?.id ?? null);
  const claim = claims.find((c) => c.id === selectedClaimId) ?? claims[0];
  const [openConsent, setOpenConsent] = useState<string | null>(null);
  const [consented, setConsented] = useState<Record<string, boolean>>({});
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const matches = claim
    ? DEMO_LAWYERS.filter((l) => l.practiceAreas.includes(claim.category)).sort((a, b) => b.matchScore - a.matchScore)
    : [];

  function confirmRequest(lawyerId: string, lawyerName: string) {
    if (!claim) return;
    requestConsultation(claim.id, lawyerId, lawyerName);
    setRequested((prev) => new Set(prev).add(lawyerId));
    setOpenConsent(null);
  }

  return (
    <AppShell>
      <div className="container-page py-8 space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Lawyer Matches" }]} />
        <h1 className="text-2xl font-bold text-navy-900">Lawyer Matches</h1>
        <DisclaimerBanner compact />
        <p className="text-xs text-navy-700 -mt-2">
          All lawyer and firm profiles shown are demonstration data for this MVP and do not represent real legal service
          providers.
        </p>

        {claims.length === 0 ? (
          <EmptyState title="No claims yet" description="Report an incident to see matched lawyers for your situation." action={<Link href="/report-incident"><Button>Report an Incident</Button></Link>} />
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
                return (
                  <Card key={lawyer.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {lawyer.verifiedPartner && <Badge tone="teal">Verified partner</Badge>}
                          <Badge tone="gray">{lawyer.matchScore}% match</Badge>
                        </div>
                        <h2 className="font-semibold text-navy-900 mt-2">{lawyer.lawyerName}</h2>
                        <p className="text-sm text-navy-700">{lawyer.firmName}</p>
                      </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-2 mt-4 text-xs text-navy-700">
                      <div><dt className="text-navy-700/70">Jurisdiction</dt><dd className="text-navy-900">{lawyer.jurisdiction}</dd></div>
                      <div><dt className="text-navy-700/70">Experience</dt><dd className="text-navy-900">{lawyer.yearsExperience} years</dd></div>
                      <div><dt className="text-navy-700/70">Languages</dt><dd className="text-navy-900">{lawyer.languages.join(", ")}</dd></div>
                      <div><dt className="text-navy-700/70">Availability</dt><dd className="text-navy-900">{lawyer.availability}</dd></div>
                    </dl>

                    <p className="text-sm text-navy-700 mt-3">{lawyer.description}</p>
                    <p className="text-xs text-teal-700 bg-teal-50 rounded-lg p-2 mt-3">Why matched: {lawyer.matchReason}</p>
                    <p className="text-[11px] text-navy-700/60 mt-2">Conflict-screening status: not yet performed (placeholder for production integration)</p>

                    {isRequested ? (
                      <div className="mt-4 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-sm p-3">
                        Consultation requested. {lawyer.lawyerName} will typically reach out within 1–2 business days.
                      </div>
                    ) : openConsent === lawyer.id ? (
                      <div className="mt-4 border border-navy-900/10 rounded-lg p-3 space-y-2">
                        <label className="flex items-start gap-2 text-xs text-navy-700">
                          <input type="checkbox" checked={!!consented[lawyer.id]} onChange={(e) => setConsented({ ...consented, [lawyer.id]: e.target.checked })} className="mt-0.5" />
                          I consent to share my claim summary with {lawyer.firmName} for the purpose of an initial consultation.
                        </label>
                        <div className="flex gap-2">
                          <Button size="sm" disabled={!consented[lawyer.id]} onClick={() => confirmRequest(lawyer.id, lawyer.lawyerName)}>Confirm & send</Button>
                          <Button size="sm" variant="ghost" onClick={() => setOpenConsent(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" onClick={() => setOpenConsent(lawyer.id)}>Request consultation</Button>
                        <Link href={`/claims/${claim?.id}`}><Button size="sm" variant="outline">Share claim summary</Button></Link>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
