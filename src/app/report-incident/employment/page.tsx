"use client";

import { FileText, HandCoins, MessagesSquare } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PathwayCard } from "@/components/PathwayCard";
import { track } from "@/lib/analytics";

export default function EmploymentToolSelectionPage() {
  return (
    <AppShell>
      <div className="container-page py-8 max-w-4xl">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "What can I help you with", href: "/get-started" }, { label: "I need help at work" }]} />
        <h1 className="text-2xl font-bold text-navy-900">What kind of help do you need at work?</h1>
        <p className="text-navy-700 text-sm mt-1 max-w-2xl">Choose the option that best matches your situation.</p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <PathwayCard
            href="/employment/contract-review"
            icon={<FileText size={24} strokeWidth={1.75} />}
            title="Review my employment contract"
            description="Upload a contract and receive a plain-language summary of key terms, questions, and possible concerns."
            onClick={() => track({ name: "employment_tool_selected", props: { tool: "contract" } })}
          />
          <PathwayCard
            href="/employment/severance-review"
            icon={<HandCoins size={24} strokeWidth={1.75} />}
            title="Review my severance package"
            description="Organize the key facts and upload your severance documents for a plain-language review."
            onClick={() => track({ name: "employment_tool_selected", props: { tool: "severance" } })}
          />
          <PathwayCard
            href="/employment/workplace-issue"
            icon={<MessagesSquare size={24} strokeWidth={1.75} />}
            title="Other issues I am having at work"
            description="Describe another workplace concern and receive organized information about possible next steps."
            onClick={() => track({ name: "employment_tool_selected", props: { tool: "other_workplace_issue" } })}
          />
        </div>
      </div>
    </AppShell>
  );
}
