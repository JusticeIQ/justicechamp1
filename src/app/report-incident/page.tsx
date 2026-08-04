"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge } from "@/components/ui";

export default function ReportIncidentPage() {
  return (
    <AppShell>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Report an Incident" }]} />
        <h1 className="text-2xl font-bold text-navy-900">What kind of situation are you documenting?</h1>
        <p className="text-navy-700 text-sm mt-1 max-w-2xl">
          Choose a category to begin a guided, step-by-step intake. You can save your progress and return at any time.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Link href="/report-incident/personal-injury">
            <Card className="h-full hover:border-teal-400 transition-colors border-2 border-transparent">
              <Badge>Personal Injury</Badge>
              <h2 className="text-lg font-semibold text-navy-900 mt-3">I was injured in an accident or incident</h2>
              <p className="text-sm text-navy-700 mt-2">
                Motor vehicle accidents, slip and fall, premises liability, medical injury, product injury, and related
                matters. A 16-step guided intake covers injuries, treatment, evidence, and deadlines.
              </p>
            </Card>
          </Link>
          <Link href="/report-incident/employment">
            <Card className="h-full hover:border-teal-400 transition-colors border-2 border-transparent">
              <Badge tone="navy">Employment Law</Badge>
              <h2 className="text-lg font-semibold text-navy-900 mt-3">Something happened at my workplace</h2>
              <p className="text-sm text-navy-700 mt-2">
                Termination, discrimination, harassment, retaliation, unpaid wages, and related matters. An 18-step guided
                intake covers chronology, employer response, and documentation.
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
