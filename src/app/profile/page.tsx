"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button } from "@/components/ui";
import { useAppState } from "@/lib/store";

export default function ProfilePage() {
  const { user, logout } = useAppState();
  const router = useRouter();
  const [consent, setConsent] = useState(user?.consentClaimComms ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleDeleteData() {
    logout();
    router.push("/");
  }

  return (
    <AppShell>
      <div className="container-page py-8 space-y-6 max-w-2xl">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Profile" }]} />
        <h1 className="text-2xl font-bold text-navy-900">Profile & Privacy Settings</h1>

        <Card>
          <div className="flex items-center gap-4">
            <span className="h-14 w-14 rounded-full bg-navy-900 text-white flex items-center justify-center text-lg font-semibold">
              {user?.fullName?.slice(0, 1) ?? "U"}
            </span>
            <div>
              <p className="font-semibold text-navy-900">{user?.fullName}</p>
              <p className="text-sm text-navy-700">{user?.email}</p>
              <Badge tone="gray">Consumer account</Badge>
            </div>
          </div>
          <dl className="grid sm:grid-cols-2 gap-4 mt-5 text-sm">
            <div><dt className="text-xs text-navy-700">Phone</dt><dd className="text-navy-900">{user?.phone ?? "Not provided"}</dd></div>
            <div><dt className="text-xs text-navy-700">Jurisdiction</dt><dd className="text-navy-900">{user?.jurisdiction ?? "Not provided"}</dd></div>
            <div><dt className="text-xs text-navy-700">Preferred language</dt><dd className="text-navy-900">{user?.preferredLanguage ?? "English"}</dd></div>
            <div><dt className="text-xs text-navy-700">Member since</dt><dd className="text-navy-900">{user ? new Date(user.createdAt).toLocaleDateString() : "—"}</dd></div>
          </dl>
        </Card>

        <Card>
          <h2 className="font-semibold text-navy-900 text-sm">Communication preferences</h2>
          <label className="flex items-start gap-2 text-sm text-navy-700 mt-3">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
            I consent to receive claim-related communications from JusticeChamp.
          </label>
          <Button size="sm" className="mt-3" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>Save preferences</Button>
          {saved && <p className="text-xs text-teal-700 mt-2">Preferences saved.</p>}
        </Card>

        <Card>
          <h2 className="font-semibold text-navy-900 text-sm">Security</h2>
          <ul className="text-sm text-navy-700 mt-2 space-y-1.5 list-disc list-inside">
            <li>Claims and documents are private by default and never publicly visible.</li>
            <li>Session automatically times out after a period of inactivity (production behavior).</li>
            <li>An audit log of account activity is available to compliance staff in production (placeholder in this MVP).</li>
          </ul>
        </Card>

        <Card className="border-red-200">
          <h2 className="font-semibold text-navy-900 text-sm">Delete my data</h2>
          <p className="text-sm text-navy-700 mt-1">
            This permanently removes your demo account, claims, documents, and activity from this browser.
          </p>
          {confirmDelete ? (
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="border-red-400 text-red-700" onClick={handleDeleteData}>Confirm deletion</Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setConfirmDelete(true)}>Request data deletion</Button>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
