"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, EmptyState, Button } from "@/components/ui";
import { useAppState } from "@/lib/store";

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function fmtLong(dateStr: string) {
  try {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function ImportantDatesPage() {
  const { importantDates } = useAppState();
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const active = importantDates.filter((d) => d.status === "active");
  const todayStr = today.toISOString().slice(0, 10);
  const upcoming = active.filter((d) => d.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
  const past = active.filter((d) => d.date < todayStr).sort((a, b) => b.date.localeCompare(a.date));

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  return (
    <AppShell>
      <div className="container-page py-8 space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Important Dates" }]} />
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Important Dates</h1>
          <p className="text-navy-700 text-sm mt-1">Dates your legal team has shared from your case calendar.</p>
        </div>

        <Card className="overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <Button size="sm" variant="ghost" onClick={() => changeMonth(-1)}>← Prev</Button>
            <p className="text-sm font-semibold text-navy-900">{monthLabel}</p>
            <Button size="sm" variant="ghost" onClick={() => changeMonth(1)}>Next →</Button>
          </div>
          <div className="grid grid-cols-7 gap-1 min-w-[560px]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-[11px] font-medium text-navy-700 text-center py-1">{d}</div>
            ))}
            {Array.from({ length: firstWeekday }).map((_, i) => <div key={`pad-${i}`} />)}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = active.filter((d) => d.date === dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div key={day} className={`border border-navy-900/10 rounded-md p-1 min-h-[64px] text-[11px] ${isToday ? "bg-teal-50 border-teal-300" : ""}`}>
                  <p className="font-medium text-navy-700">{day}</p>
                  {dayEvents.slice(0, 2).map((e) => (
                    <div key={e.id} className="mt-0.5 truncate"><Badge tone="teal">{e.title}</Badge></div>
                  ))}
                  {dayEvents.length > 2 && <p className="text-navy-700/60">+{dayEvents.length - 2} more</p>}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-navy-900 mb-3">Upcoming Important Dates</h2>
          {upcoming.length === 0 ? (
            <EmptyState title="No upcoming dates" description="When your legal team shares an important date, it will appear here." />
          ) : (
            <ul className="space-y-4">
              {upcoming.map((d) => (
                <li key={d.id} className="border-b border-navy-900/10 pb-3 last:border-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm text-navy-700">{fmtLong(d.date)}{d.time ? ` · ${d.time}` : ""}</p>
                      <p className="font-semibold text-navy-900">{d.title}</p>
                      <p className="text-xs text-navy-700 mt-0.5">{d.caseName}</p>
                    </div>
                  </div>
                  {d.description && <p className="text-sm text-navy-700 mt-1">{d.description}</p>}
                  {d.location && <p className="text-xs text-navy-700/70 mt-1">{d.location}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {past.length > 0 && (
          <Card>
            <h2 className="font-semibold text-navy-900 mb-3">Past dates</h2>
            <ul className="space-y-2">
              {past.map((d) => (
                <li key={d.id} className="text-sm border-b border-navy-900/10 pb-2 last:border-0 opacity-70">
                  <p className="font-medium text-navy-900">{d.title}</p>
                  <p className="text-xs text-navy-700">{fmtLong(d.date)} · {d.caseName}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
