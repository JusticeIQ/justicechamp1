"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card, Badge, Button, DisclaimerBanner, EmptyState } from "@/components/ui";
import { ProgressBar } from "@/components/ui";
import { useAppState } from "@/lib/store";
import { DEMO_LAWYERS } from "@/lib/demo-data";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_progress: "In progress",
  submitted: "Submitted",
  under_review: "Under review",
  matched: "Matched with lawyer",
};

export default function DashboardPage() {
  const { user, claims, notifications, activityLog } = useAppState();

  const activeClaims = claims.filter((c) => c.status !== "draft");
  const draftClaims = claims.filter((c) => c.status === "draft");
  const totalDocuments = claims.reduce((sum, c) => sum + c.documents.length, 0);
  const upcomingDeadlines = claims.filter((c) => c.deadlineDate).sort((a, b) => (a.deadlineDate! < b.deadlineDate! ? -1 : 1));
  const matchCount = claims.length > 0 ? DEMO_LAWYERS.length : 0;

  return (
    <AppShell>
      <div className="container-page py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Welcome back, {user?.fullName?.split(" ")[0] ?? "there"}</h1>
            <p className="text-navy-700 text-sm mt-1">Here's where things stand across your claims.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/report-incident"><Button variant="outline">Report an Incident</Button></Link>
            <Link href="/rate-my-claim"><Button variant="cta">Rate My Claim</Button></Link>
          </div>
        </div>

        <DisclaimerBanner />

        {claims.length === 0 ? (
          <EmptyState
            title="No claims yet"
            description="Start by reporting an incident. You can save your progress at any point and come back later."
            action={<Link href="/report-incident"><Button>Report an Incident</Button></Link>}
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <p className="text-xs text-navy-700">Active claims</p>
                <p className="text-2xl font-bold text-navy-900 mt-1">{activeClaims.length}</p>
              </Card>
              <Card>
                <p className="text-xs text-navy-700">Draft reports</p>
                <p className="text-2xl font-bold text-navy-900 mt-1">{draftClaims.length}</p>
              </Card>
              <Card>
                <p className="text-xs text-navy-700">Documents uploaded</p>
                <p className="text-2xl font-bold text-navy-900 mt-1">{totalDocuments}</p>
              </Card>
              <Card>
                <p className="text-xs text-navy-700">Lawyer matches available</p>
                <p className="text-2xl font-bold text-navy-900 mt-1">{matchCount}</p>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-semibold text-navy-900">Your claims</h2>
                {claims.map((claim) => (
                  <Card key={claim.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge tone={claim.category === "personal_injury" ? "teal" : "navy"}>
                            {claim.category === "personal_injury" ? "Personal Injury" : "Employment Law"}
                          </Badge>
                          <Badge tone="gray">{STATUS_LABEL[claim.status]}</Badge>
                        </div>
                        <h3 className="font-semibold text-navy-900 mt-2">{claim.title}</h3>
                      </div>
                      {claim.score && (
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-bold text-teal-600">{claim.score.claimReadiness}</p>
                          <p className="text-[11px] text-navy-700">readiness score</p>
                        </div>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      <div>
                        <p className="text-xs text-navy-700 mb-1">Incident details</p>
                        <Badge tone="teal">Complete</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-navy-700 mb-1">Timeline</p>
                        <ProgressBar value={Math.min(100, claim.timeline.length * 25)} />
                      </div>
                      <div>
                        <p className="text-xs text-navy-700 mb-1">Documents</p>
                        <Badge tone="gray">{claim.documents.length} uploaded</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-navy-700 mb-1">Claim assessment</p>
                        <Badge tone={claim.score ? "teal" : "amber"}>{claim.score ? "Ready" : "Not yet generated"}</Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <Link href={`/claims/${claim.id}`}><Button size="sm" variant="outline">View claim</Button></Link>
                      <Link href="/rate-my-claim"><Button size="sm" variant="ghost">Rate My Claim</Button></Link>
                      <Link href="/lawyer-matches"><Button size="sm" variant="ghost">Lawyer matches</Button></Link>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <Card>
                  <h2 className="font-semibold text-navy-900 text-sm">Upcoming deadlines</h2>
                  {upcomingDeadlines.length === 0 ? (
                    <p className="text-sm text-navy-700 mt-2">No deadlines on file.</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {upcomingDeadlines.map((c) => (
                        <li key={c.id} className="text-sm">
                          <p className="font-medium text-navy-900">{c.deadlineLabel}</p>
                          <p className="text-navy-700 text-xs">{c.deadlineDate} · {c.title}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                <Card>
                  <h2 className="font-semibold text-navy-900 text-sm">Notifications</h2>
                  <ul className="mt-3 space-y-3">
                    {notifications.slice(0, 5).map((n) => (
                      <li key={n.id} className={`text-sm ${n.read ? "text-navy-700" : "text-navy-900 font-medium"}`}>
                        {n.message}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card>
                  <h2 className="font-semibold text-navy-900 text-sm">Recent activity</h2>
                  <ul className="mt-3 space-y-3">
                    {activityLog.slice(0, 6).map((a) => (
                      <li key={a.id} className="text-xs text-navy-700">
                        <span className="text-navy-900">{a.message}</span>
                        <br />
                        {new Date(a.timestamp).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
