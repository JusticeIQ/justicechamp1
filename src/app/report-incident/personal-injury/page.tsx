"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { IntakeFlow } from "@/components/IntakeFlow";
import { Spinner } from "@/components/ui";

export default function PersonalInjuryIntakePage() {
  return (
    <AppShell>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Report an Incident", href: "/report-incident" }, { label: "Personal Injury" }]} />
        <Suspense fallback={<Spinner />}>
          <IntakeFlow category="personal_injury" subtypeOptions={["Motor vehicle accident", "Slip and fall", "Premises liability", "Medical injury", "Product injury", "Other"]} />
        </Suspense>
      </div>
    </AppShell>
  );
}
