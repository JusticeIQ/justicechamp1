"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { useAppState } from "@/lib/store";
import { TimelineEvent } from "@/lib/types";

const SIGNIFICANCE_TONE: Record<string, "gray" | "amber" | "red"> = { low: "gray", medium: "amber", high: "red" };

export default function TimelinePage() {
  const { claims, addTimelineEvent, updateTimelineEvent, deleteTimelineEvent } = useAppState();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(claims[0]?.id ?? null);
  const claim = claims.find((c) => c.id === selectedClaimId) ?? claims[0];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: "", title: "", description: "", peopleInvolved: "", significance: "medium" as TimelineEvent["significance"] });

  function resetForm() {
    setForm({ date: "", title: "", description: "", peopleInvolved: "", significance: "medium" });
    setEditingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!claim || !form.date || !form.title) return;
    if (editingId) {
      updateTimelineEvent(claim.id, editingId, { ...form });
    } else {
      addTimelineEvent(claim.id, { ...form, evidenceIds: [] });
    }
    resetForm();
  }

  function startEdit(ev: TimelineEvent) {
    setEditingId(ev.id);
    setForm({ date: ev.date, title: ev.title, description: ev.description, peopleInvolved: ev.peopleInvolved, significance: ev.significance });
  }

  return (
    <AppShell>
      <div className="container-page py-8 space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Timeline" }]} />
        <h1 className="text-2xl font-bold text-navy-900">Claim Timeline</h1>

        {claims.length === 0 ? (
          <EmptyState title="No claims yet" description="Report an incident first to start building a timeline." action={<Link href="/report-incident"><Button>Report an Incident</Button></Link>} />
        ) : (
          <>
            <div className="flex gap-2 flex-wrap">
              {claims.map((c) => (
                <button key={c.id} onClick={() => { setSelectedClaimId(c.id); resetForm(); }} className={`text-xs px-3 py-1.5 rounded-full border focus-ring ${c.id === claim?.id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-navy-900/15 text-navy-700"}`}>
                  {c.title}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <h2 className="font-semibold text-navy-900 text-sm mb-4">Chronology ({claim?.timeline.length ?? 0} events)</h2>
                  {claim && claim.timeline.length === 0 && <p className="text-sm text-navy-700">No events yet. Add your first event using the form.</p>}
                  <ol className="space-y-5">
                    {claim?.timeline.map((ev) => (
                      <li key={ev.id} className="relative pl-5 border-l-2 border-teal-400">
                        <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-teal-500" />
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-navy-700">{ev.date}</p>
                            <p className="font-medium text-navy-900">{ev.title}</p>
                            <p className="text-sm text-navy-700 mt-1">{ev.description}</p>
                            {ev.peopleInvolved && <p className="text-xs text-navy-700 mt-1">Involved: {ev.peopleInvolved}</p>}
                            <Badge tone={SIGNIFICANCE_TONE[ev.significance]}>{ev.significance} significance</Badge>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" onClick={() => startEdit(ev)}>Edit</Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteTimelineEvent(claim.id, ev.id)}>Delete</Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>
              </div>

              <Card>
                <h2 className="font-semibold text-navy-900 text-sm mb-3">{editingId ? "Edit event" : "Add an event"}</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-navy-900">Date</label>
                    <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-navy-900">Event title</label>
                    <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-navy-900">Description</label>
                    <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-navy-900">People involved</label>
                    <input value={form.peopleInvolved} onChange={(e) => setForm({ ...form, peopleInvolved: e.target.value })} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-navy-900">Significance</label>
                    <select value={form.significance} onChange={(e) => setForm({ ...form, significance: e.target.value as TimelineEvent["significance"] })} className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">{editingId ? "Save changes" : "Add event"}</Button>
                    {editingId && <Button type="button" variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>}
                  </div>
                </form>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
