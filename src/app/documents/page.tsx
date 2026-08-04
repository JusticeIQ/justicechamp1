"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { useAppState } from "@/lib/store";
import { DocumentCategory } from "@/lib/types";

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: "photo", label: "Photo" },
  { value: "video", label: "Video" },
  { value: "medical_record", label: "Medical record" },
  { value: "police_report", label: "Police report" },
  { value: "incident_report", label: "Incident report" },
  { value: "employment_contract", label: "Employment contract" },
  { value: "termination_letter", label: "Termination letter" },
  { value: "pay_record", label: "Pay record" },
  { value: "email", label: "Email" },
  { value: "text_message", label: "Text message" },
  { value: "insurance_correspondence", label: "Insurance correspondence" },
  { value: "witness_statement", label: "Witness statement" },
  { value: "receipt", label: "Receipt" },
  { value: "other", label: "Other" },
];

const RECOMMENDED: Record<string, string[]> = {
  personal_injury: ["Police or incident report", "Medical records / ER discharge summary", "Photos of injuries and scene", "Insurance correspondence", "Witness statement"],
  employment: ["Employment contract or offer letter", "Termination or discipline letter", "Pay records", "Relevant emails or messages", "Performance reviews"],
};

export default function DocumentsPage() {
  const { claims, addDocument, toggleDocumentImportant, deleteDocument } = useAppState();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(claims[0]?.id ?? null);
  const [category, setCategory] = useState<DocumentCategory>("photo");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const claim = claims.find((c) => c.id === selectedClaimId) ?? claims[0];
  const missing = claim ? RECOMMENDED[claim.category].filter((r) => !claim.documents.some((d) => d.description.toLowerCase().includes(r.toLowerCase().split(" ")[0]))) : [];

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!claim || !fileName) return;
    addDocument(claim.id, {
      name: fileName,
      category,
      description: description || fileName,
      important: false,
      sizeLabel: `${(Math.random() * 3 + 0.2).toFixed(1)} MB`,
    });
    setFileName("");
    setDescription("");
    setNotice("Document uploaded (simulated for this demo — no file leaves your browser).");
    setTimeout(() => setNotice(null), 4000);
  }

  return (
    <AppShell>
      <div className="container-page py-8 space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Documents" }]} />
        <h1 className="text-2xl font-bold text-navy-900">Documents</h1>

        {claims.length === 0 ? (
          <EmptyState title="No claims yet" description="Report an incident first to start organizing documents." action={<Link href="/report-incident"><Button>Report an Incident</Button></Link>} />
        ) : (
          <>
            <div className="flex gap-2 flex-wrap">
              {claims.map((c) => (
                <button key={c.id} onClick={() => setSelectedClaimId(c.id)} className={`text-xs px-3 py-1.5 rounded-full border focus-ring ${c.id === claim?.id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-navy-900/15 text-navy-700"}`}>
                  {c.title}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <h2 className="font-semibold text-navy-900 text-sm">Upload a document</h2>
                  <p className="text-xs text-navy-700 mt-1">
                    Privacy note: uploaded files are private to your account by default and are only shared with a lawyer if
                    you explicitly consent. This demo simulates uploads — no real file is transmitted.
                  </p>
                  <form onSubmit={handleUpload} className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-navy-900">Choose a file (simulated)</label>
                      <input
                        type="file"
                        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "sample_document.pdf")}
                        className="mt-1 w-full text-sm"
                      />
                      {fileName && <p className="text-xs text-teal-700 mt-1">Selected: {fileName}</p>}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-navy-900">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring">
                          {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-navy-900">Description</label>
                        <input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" placeholder="Short description" />
                      </div>
                    </div>
                    <Button type="submit" disabled={!fileName} size="sm">Upload to this claim</Button>
                    {notice && <p className="text-xs text-teal-700">{notice}</p>}
                  </form>
                </Card>

                <Card>
                  <h2 className="font-semibold text-navy-900 text-sm mb-3">Uploaded documents ({claim?.documents.length ?? 0})</h2>
                  {claim && claim.documents.length === 0 && <p className="text-sm text-navy-700">No documents uploaded for this claim yet.</p>}
                  <ul className="space-y-2">
                    {claim?.documents.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-3 border border-navy-900/10 rounded-lg p-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-navy-900 truncate">{d.name}</p>
                          <p className="text-xs text-navy-700">{d.description} · {d.sizeLabel} · {new Date(d.uploadedAt).toLocaleDateString()}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge tone="gray">{d.category.replace(/_/g, " ")}</Badge>
                            <Badge tone={d.status === "uploaded" ? "teal" : "amber"}>{d.status.replace(/_/g, " ")}</Badge>
                            {d.important && <Badge tone="amber">Important</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => toggleDocumentImportant(claim.id, d.id)}>{d.important ? "Unmark" : "Mark important"}</Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteDocument(claim.id, d.id)}>Remove</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <h2 className="font-semibold text-navy-900 text-sm">Recommended documents</h2>
                  <ul className="mt-2 space-y-2 text-sm text-navy-700">
                    {claim && RECOMMENDED[claim.category].map((r) => (
                      <li key={r} className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${missing.includes(r) ? "bg-amber-500" : "bg-teal-500"}`} />
                        {r}
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card>
                  <h2 className="font-semibold text-navy-900 text-sm">Sample files (demo mode)</h2>
                  <p className="text-xs text-navy-700 mt-1">The documents listed above are sample, fictional demonstration files preloaded for this claim.</p>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
