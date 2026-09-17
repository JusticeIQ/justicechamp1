"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Button } from "@/components/ui";
import { useAppState } from "@/lib/store";
import { track } from "@/lib/analytics";

const ISSUE_CATEGORIES = ["Family", "Criminal", "Housing and property", "Business", "Wills and estates", "Immigration", "Civil and consumer", "Government and rights", "Other"];

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function OtherLegalMatterPage() {
  const { user, submitOtherLegalMatterRequest } = useAppState();
  const [firstName, setFirstName] = useState(user?.fullName?.split(" ")[0] ?? "");
  const [lastName, setLastName] = useState(user?.fullName?.split(" ").slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [issueCategory, setIssueCategory] = useState("");
  const [specify, setSpecify] = useState("");
  const [permission, setPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) return setError("Please enter your first name.");
    if (!lastName.trim()) return setError("Please enter your last name.");
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    if (!issueCategory) return setError("Please choose the issue you need help with.");
    if (issueCategory === "Other" && !specify.trim()) return setError("Please tell us a bit more about your issue.");
    if (!permission) return setError("Please give permission to contact you to continue.");
    setError(null);
    submitOtherLegalMatterRequest({ firstName, lastName, email, issueCategory, specify: issueCategory === "Other" ? specify : undefined });
    track({ name: "availability_request_submitted", props: { practiceArea: issueCategory } });
    setSubmitted(true);
  }

  return (
    <AppShell>
      <div className="container-page py-10 max-w-xl">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "What can I help you with", href: "/get-started" }, { label: "Other legal matter" }]} />
        <Card>
          <h1 className="text-xl font-bold text-navy-900 uppercase tracking-wide">Don't fret, help is on the way!</h1>
          <p className="text-sm text-navy-700 mt-3">
            JusticeChamp is currently focused on employment and personal injury issues. However, we are expanding to a full range of legal issues.
            Tell us what you are looking for, and leave your name and email address. We will update you as soon as JusticeChamp is able to help
            you find answers to your issue.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-sm p-4" role="status">
              Thank you — your request has been saved. We'll update you as soon as JusticeChamp can help with this issue.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-navy-900" htmlFor="olm-first">First name</label>
                  <input id="olm-first" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-navy-900" htmlFor="olm-last">Last name</label>
                  <input id="olm-last" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-navy-900" htmlFor="olm-email">Email address</label>
                <input id="olm-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
              </div>
              <div>
                <label className="text-sm font-medium text-navy-900" htmlFor="olm-issue">The issue I need help with is</label>
                <select id="olm-issue" required value={issueCategory} onChange={(e) => setIssueCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring">
                  <option value="" disabled>Choose an issue</option>
                  {ISSUE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {issueCategory === "Other" && (
                <div>
                  <label className="text-sm font-medium text-navy-900" htmlFor="olm-specify">Please specify</label>
                  <textarea id="olm-specify" rows={3} value={specify} onChange={(e) => setSpecify(e.target.value)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
                </div>
              )}
              <label className="flex items-start gap-2 text-xs text-navy-700">
                <input type="checkbox" checked={permission} onChange={(e) => setPermission(e.target.checked)} className="mt-0.5" />
                I give JusticeChamp permission to contact me about this request. See the{" "}
                <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>.
              </label>
              {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
              <Button type="submit" className="w-full">Notify me when JusticeChamp can help</Button>
            </form>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
