"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { IntakeFlow } from "@/components/IntakeFlow";
import { Spinner } from "@/components/ui";

export default function WorkplaceIssueIntakePage() {
  return (
    <AppShell>
      <div className="container-page py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/dashboard" },
            { label: "I need help at work", href: "/report-incident/employment" },
            { label: "Other issues I am having at work" },
          ]}
        />
        <Suspense fallback={<Spinner />}>
          <IntakeFlow tool="employment_other" />
        </Suspense>
      </div>
    </AppShell>
  );
}
