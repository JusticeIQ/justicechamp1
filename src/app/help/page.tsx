"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button } from "@/components/ui";

export default function HelpPage() {
  return (
    <AppShell>
      <div className="container-page py-8 space-y-6 max-w-3xl">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Help" }]} />
        <h1 className="text-2xl font-bold text-navy-900">Help Center</h1>

        <Card className="bg-red-50 border-red-200">
          <Badge tone="red">Emergency notice</Badge>
          <p className="text-sm text-red-900 mt-2">
            JusticeChamp is not an emergency service and cannot respond in real time. If you are in immediate danger or need
            urgent medical attention, contact your local emergency number right away.
          </p>
        </Card>

        <div className="grid sm:grid-cols-2 gap-5">
          <Card>
            <h2 className="font-semibold text-navy-900 text-sm">Browse the FAQ</h2>
            <p className="text-sm text-navy-700 mt-1">Answers to the most common questions about privacy, scoring, and lawyer matching.</p>
            <Link href="/faq"><Button size="sm" variant="outline" className="mt-3">Go to FAQ</Button></Link>
          </Card>
          <Card>
            <h2 className="font-semibold text-navy-900 text-sm">Explore resources</h2>
            <p className="text-sm text-navy-700 mt-1">Guides on evidence preservation, documentation, and consultation prep.</p>
            <Link href="/resources"><Button size="sm" variant="outline" className="mt-3">Go to Resources</Button></Link>
          </Card>
          <Card>
            <h2 className="font-semibold text-navy-900 text-sm">Contact support</h2>
            <p className="text-sm text-navy-700 mt-1">support@justicechamp.example (simulated for this demo).</p>
          </Card>
          <Card>
            <h2 className="font-semibold text-navy-900 text-sm">Account & privacy</h2>
            <p className="text-sm text-navy-700 mt-1">Manage consent, communications, and data deletion requests.</p>
            <Link href="/profile"><Button size="sm" variant="outline" className="mt-3">Go to Profile</Button></Link>
          </Card>
        </div>

        <Card>
          <h2 className="font-semibold text-navy-900 text-sm">What JusticeChamp is — and isn't</h2>
          <p className="text-sm text-navy-700 mt-2">
            JusticeChamp is a documentation and organization tool that provides general legal information and a preliminary,
            informational claim-readiness score. It is not a law firm, does not provide legal advice or representation, and
            does not guarantee any outcome.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
