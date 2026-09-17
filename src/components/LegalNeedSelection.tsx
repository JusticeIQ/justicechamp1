"use client";

import { HeartHandshake, Briefcase, HelpCircle } from "lucide-react";
import { AppShell } from "./AppShell";
import { PathwayCard } from "./PathwayCard";
import { useAppState } from "@/lib/store";
import { track } from "@/lib/analytics";

export function LegalNeedSelection() {
  const { user } = useAppState();
  const firstName = user?.fullName?.split(" ")[0];

  return (
    <AppShell>
      <div className="container-page py-10 md:py-16 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold text-navy-900 text-center">
          {firstName ? `Hello, ${firstName}. What can I help you with today?` : "Hello. What can I help you with today?"}
        </h1>
        <p className="text-navy-700 text-sm text-center mt-2 max-w-xl mx-auto">
          Choose one to get started. You can always come back and explore another option later from your dashboard.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <PathwayCard
            href="/report-incident/personal-injury"
            icon={<HeartHandshake size={24} strokeWidth={1.75} />}
            title="I have sustained an injury or been in an accident"
            description="Document what happened and get a plain-language, preliminary read on your situation."
            onClick={() => track({ name: "legal_need_selected", props: { need: "personal_injury" } })}
          />
          <PathwayCard
            href="/report-incident/employment"
            icon={<Briefcase size={24} strokeWidth={1.75} />}
            title="I need help at work"
            description="Review a contract or severance offer, or get organized information about another workplace concern."
            onClick={() => track({ name: "legal_need_selected", props: { need: "employment" } })}
          />
          <PathwayCard
            href="/other-legal-matter"
            icon={<HelpCircle size={24} strokeWidth={1.75} />}
            title="Other legal matter"
            description="Tell us what you're looking for and we'll let you know as JusticeChamp expands to more legal issues."
            onClick={() => track({ name: "legal_need_selected", props: { need: "other" } })}
          />
        </div>
      </div>
    </AppShell>
  );
}
