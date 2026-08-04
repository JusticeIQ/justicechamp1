"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { IntakeFlow } from "@/components/IntakeFlow";
import { Spinner } from "@/components/ui";

export default function EmploymentIntakePage() {
  return (
    <AppShell>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Report an Incident", href: "/report-incident" }, { label: "Employment Law" }]} />
        <Suspense fallback={<Spinner />}>
          <IntakeFlow category="employment" subtypeOptions={["Termination", "Constructive dismissal", "Harassment", "Discrimination", "Retaliation or reprisal", "Unpaid wages", "Disability accommodation", "Workplace investigation", "Contract dispute", "Other"]} />
        </Suspense>
      </div>
    </AppShell>
  );
}
