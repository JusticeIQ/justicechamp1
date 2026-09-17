"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Button } from "@/components/ui";
import { useAppState } from "@/lib/store";
import { track } from "@/lib/analytics";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function LawyerAvailabilityInner() {
  const searchParams = useSearchParams();
  const { user, submitAvailabilityRequest } = useAppState();
  const [name, setName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [legalIssue, setLegalIssue] = useState<"Personal injury" | "Employment" | null>(
    searchParams.get("practiceArea") === "employment" ? "Employment" : searchParams.get("practiceArea") === "personal_injury" ? "Personal injury" : null
  );
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const jurisdiction = searchParams.get("jurisdiction") ?? undefined;

  useEffect(() => {
    track({ name: "lawyer_match_unavailable", props: { practiceArea: legalIssue ?? "unspecified", jurisdiction } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter your name.");
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    if (!legalIssue) return setError("Please choose the legal issue you'd like to connect to a lawyer.");
    setError(null);
    submitAvailabilityRequest({ name, email, legalIssue, jurisdiction });
    track({ name: "availability_request_submitted", props: { practiceArea: legalIssue, jurisdiction } });
    setSubmitted(true);
  }

  return (
    <div className="container-page py-10 max-w-xl">
      <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Lawyer availability" }]} />
      <Card>
        <h1 className="text-xl font-bold text-navy-900 uppercase tracking-wide">We are expanding rapidly</h1>
        <p className="text-sm text-navy-700 mt-3">
          We currently do not have any attorneys serving your area but will very soon. Please leave your name, e-mail and the issue you want to
          connect to a lawyer and we will let you know the minute we have one who can help you.
        </p>

        {submitted ? (
          <div className="mt-6 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-sm p-4" role="status">
            Thank you. We have saved your request and will contact you when a lawyer who may be able to help becomes available in your area.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-navy-900" htmlFor="avail-name">Name</label>
              <input id="avail-name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-navy-900" htmlFor="avail-email">E-mail</label>
              <input id="avail-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-navy-900">Legal issue</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(["Personal injury", "Employment"] as const).map((opt) => (
                  <label key={opt} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer focus-ring min-h-[44px] ${legalIssue === opt ? "border-teal-500 bg-teal-50" : "border-navy-900/15"}`}>
                    <input type="radio" name="legalIssue" checked={legalIssue === opt} onChange={() => setLegalIssue(opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <Button type="submit" className="w-full">Notify me when a lawyer is available</Button>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function LawyerAvailabilityPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="py-16 text-center text-navy-700 text-sm">Loading...</div>}>
        <LawyerAvailabilityInner />
      </Suspense>
    </AppShell>
  );
}
