"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { useAppState } from "@/lib/store";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_progress: "In progress",
  submitted: "Submitted",
  under_review: "Under review",
  matched: "Matched with lawyer",
};

export default function ClaimsPage() {
  const { claims } = useAppState();

  return (
    <AppShell>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "My Claims" }]} />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy-900">My Claims</h1>
          <Link href="/report-incident"><Button>Report an Incident</Button></Link>
        </div>

        {claims.length === 0 ? (
          <EmptyState title="No claims yet" description="Report an incident to create your first claim." action={<Link href="/report-incident"><Button>Report an Incident</Button></Link>} />
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {claims.map((claim) => (
              <Card key={claim.id}>
                <div className="flex items-center gap-2">
                  <Badge tone={claim.category === "personal_injury" ? "teal" : "navy"}>
                    {claim.category === "personal_injury" ? "Personal Injury" : "Employment Law"}
                  </Badge>
                  <Badge tone="gray">{STATUS_LABEL[claim.status]}</Badge>
                </div>
                <h2 className="font-semibold text-navy-900 mt-3">{claim.title}</h2>
                <p className="text-xs text-navy-700 mt-1">Updated {new Date(claim.updatedAt).toLocaleDateString()}</p>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-navy-900">{claim.score?.claimReadiness ?? "—"}</p>
                    <p className="text-[11px] text-navy-700">Score</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-navy-900">{claim.documents.length}</p>
                    <p className="text-[11px] text-navy-700">Documents</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-navy-900">{claim.timeline.length}</p>
                    <p className="text-[11px] text-navy-700">Events</p>
                  </div>
                </div>
                <Link href={`/claims/${claim.id}`} className="block mt-4">
                  <Button variant="outline" className="w-full">View claim</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
