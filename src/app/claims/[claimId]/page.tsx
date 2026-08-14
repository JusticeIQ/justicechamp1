"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs, BackButton } from "@/components/Breadcrumbs";
import { Card, Badge, Button, DisclaimerBanner, EmptyState } from "@/components/ui";
import { ScoreGauge } from "@/components/ScoreGauge";
import { useAppState } from "@/lib/store";
import { useState } from "react";

const CATEGORY_LABEL: Record<string, string> = { personal_injury: "Personal Injury", employment: "Employment Law" };

export default function ClaimDetailPage() {
  const params = useParams<{ claimId: string }>();
  const router = useRouter();
  const { getClaim, markLawyerMessageRead } = useAppState();
  const claim = getClaim(params.claimId);
  const [downloaded, setDownloaded] = useState(false);
  const [openMessageId, setOpenMessageId] = useState<string | null>(null);

  if (!claim) {
    return (
      <AppShell>
        <div className="container-page py-8">
          <EmptyState title="Claim not found" description="This claim may have been removed, or the link is incorrect." action={<Link href="/claims"><Button>Back to My Claims</Button></Link>} />
        </div>
      </AppShell>
    );
  }

  const answeredEntries = Object.values(claim.answers).filter((a) => a.status === "answered" && a.value);
  const resumeHref = `/report-incident/${claim.category === "personal_injury" ? "personal-injury" : "employment"}?claim=${claim.id}`;
  const unreadMessages = claim.lawyerMessages.filter((m) => !m.read).length;

  function handleOpenMessage(id: string) {
    setOpenMessageId(openMessageId === id ? null : id);
    markLawyerMessageRead(claim!.id, id);
  }

  return (
    <AppShell>
      <div className="container-page py-8 space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "My Claims", href: "/claims" }, { label: claim.title }]} />
        <BackButton href="/claims" label="Back to My Claims" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <Badge tone={claim.category === "personal_injury" ? "teal" : "navy"}>{CATEGORY_LABEL[claim.category]}</Badge>
            <h1 className="text-2xl font-bold text-navy-900 mt-2">{claim.title}</h1>
            <p className="text-sm text-navy-700 mt-1">Created {new Date(claim.createdAt).toLocaleDateString()} · Last updated {new Date(claim.updatedAt).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={resumeHref}><Button variant="outline" size="sm">Edit / continue intake</Button></Link>
            <Button variant="outline" size="sm" onClick={() => window.print()}>Print summary</Button>
            <Button variant="outline" size="sm" onClick={() => setDownloaded(true)}>Download as PDF</Button>
            <Link href="/lawyer-matches"><Button variant="cta" size="sm">Share with a lawyer</Button></Link>
          </div>
        </div>

        {downloaded && (
          <div className="rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-sm p-3">
            PDF export simulated for this demo — in production this generates a downloadable, formatted claim summary PDF.
          </div>
        )}

        <DisclaimerBanner compact />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className={unreadMessages > 0 ? "border-teal-300" : undefined}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-navy-900">Messages from your lawyer</h2>
                {unreadMessages > 0 && <Badge tone="teal">{unreadMessages} new</Badge>}
              </div>
              <p className="text-xs text-navy-700 mt-1">
                Confidential updates your lawyer posts to this claim appear here. This demo simulates delivery from the
                firm's SolonIQ dashboard — the two apps don't share a live connection yet.
              </p>
              {claim.lawyerMessages.length === 0 ? (
                <p className="text-sm text-navy-700 mt-3">No messages yet. Once you're matched with a lawyer, updates they post will show up here.</p>
              ) : (
                <ul className="mt-3 divide-y divide-navy-900/5">
                  {claim.lawyerMessages
                    .slice()
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map((m) => (
                      <li key={m.id} className="py-3">
                        <button className="w-full text-left" onClick={() => handleOpenMessage(m.id)}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-navy-900">{m.subject}</p>
                            {!m.read && <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0" aria-label="unread" />}
                          </div>
                          <p className="text-xs text-navy-700/70 mt-0.5">
                            {m.fromLawyerName}, {m.fromFirmName} · {new Date(m.createdAt).toLocaleString()}
                          </p>
                        </button>
                        {openMessageId === m.id && (
                          <div className="mt-2 text-sm text-navy-700 bg-navy-900/5 rounded-lg p-3">
                            {m.relatedUpdate && <Badge tone="amber">File update</Badge>}
                            <p className={m.relatedUpdate ? "mt-2" : ""}>{m.body}</p>
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              )}
            </Card>

            <Card>
              <h2 className="font-semibold text-navy-900">Incident overview</h2>
              <dl className="grid sm:grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <dt className="text-navy-700 text-xs">Category</dt>
                  <dd className="text-navy-900">{CATEGORY_LABEL[claim.category]} — {claim.subtype}</dd>
                </div>
                <div>
                  <dt className="text-navy-700 text-xs">Incident date</dt>
                  <dd className="text-navy-900">{claim.incidentDate || "Not yet provided"}</dd>
                </div>
                <div>
                  <dt className="text-navy-700 text-xs">Jurisdiction</dt>
                  <dd className="text-navy-900">{claim.jurisdiction || "Not yet provided"}</dd>
                </div>
                <div>
                  <dt className="text-navy-700 text-xs">Key deadline</dt>
                  <dd className="text-navy-900">{claim.deadlineLabel ? `${claim.deadlineLabel} (${claim.deadlineDate})` : "Not identified"}</dd>
                </div>
              </dl>
              {claim.goals && (
                <div className="mt-4">
                  <dt className="text-navy-700 text-xs">Stated goals</dt>
                  <dd className="text-navy-900 text-sm mt-1">{claim.goals}</dd>
                </div>
              )}
            </Card>

            <Card>
              <h2 className="font-semibold text-navy-900">Full intake responses</h2>
              <div className="mt-3 divide-y divide-navy-900/5">
                {answeredEntries.length === 0 && <p className="text-sm text-navy-700 py-3">No answers recorded yet.</p>}
                {answeredEntries.map((a) => (
                  <div key={a.fieldId} className="py-3 text-sm">
                    <p className="text-navy-700 text-xs uppercase tracking-wide">{a.fieldId.replace(/([A-Z])/g, " $1")}</p>
                    <p className="text-navy-900 mt-1">{Array.isArray(a.value) ? a.value.join(", ") : String(a.value)}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-navy-900">Timeline</h2>
                <Link href="/timeline" className="text-xs text-teal-600 hover:underline">Open full timeline →</Link>
              </div>
              <ol className="mt-3 space-y-3">
                {claim.timeline.length === 0 && <p className="text-sm text-navy-700">No timeline events recorded yet.</p>}
                {claim.timeline.map((e) => (
                  <li key={e.id} className="text-sm border-l-2 border-teal-400 pl-3">
                    <p className="font-medium text-navy-900">{e.date} — {e.title}</p>
                    <p className="text-navy-700">{e.description}</p>
                  </li>
                ))}
              </ol>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-navy-900">Documents ({claim.documents.length})</h2>
                <Link href="/documents" className="text-xs text-teal-600 hover:underline">Open documents →</Link>
              </div>
              <ul className="mt-3 space-y-2">
                {claim.documents.length === 0 && <p className="text-sm text-navy-700">No documents uploaded yet.</p>}
                {claim.documents.map((d) => (
                  <li key={d.id} className="text-sm flex justify-between items-center gap-2">
                    <span className="text-navy-900">{d.name}</span>
                    <span className="flex gap-1.5 shrink-0">
                      <Badge tone="gray">{d.category.replace(/_/g, " ")}</Badge>
                      {d.sentToLawyer && <Badge tone="navy">Sent to lawyer</Badge>}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="space-y-4">
            {claim.score ? (
              <Card className="text-center">
                <h2 className="font-semibold text-navy-900 text-sm">Claim-readiness score</h2>
                <div className="flex justify-center my-4"><ScoreGauge score={claim.score.claimReadiness} size={130} /></div>
                <Badge>{claim.score.scoreBand}</Badge>
                <Link href="/rate-my-claim" className="block mt-4"><Button variant="outline" size="sm" className="w-full">View full assessment</Button></Link>
              </Card>
            ) : (
              <Card>
                <h2 className="font-semibold text-navy-900 text-sm">Claim-readiness score</h2>
                <p className="text-sm text-navy-700 mt-2">Not yet generated.</p>
                <Link href="/rate-my-claim" className="block mt-3"><Button size="sm" className="w-full">Rate My Claim</Button></Link>
              </Card>
            )}

            <Card>
              <h2 className="font-semibold text-navy-900 text-sm">Witnesses</h2>
              <p className="text-sm text-navy-700 mt-2">{String(claim.answers["witnesses"]?.value ?? "None recorded")}</p>
            </Card>

            <Card>
              <h2 className="font-semibold text-navy-900 text-sm">Actions</h2>
              <div className="flex flex-col gap-2 mt-3">
                <Link href="/lawyer-matches"><Button size="sm" variant="outline" className="w-full">Request lawyer review</Button></Link>
                <Link href="/dashboard"><Button size="sm" variant="ghost" className="w-full">Return to dashboard</Button></Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
