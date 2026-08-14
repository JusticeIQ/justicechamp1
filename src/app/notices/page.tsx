"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, EmptyState } from "@/components/ui";
import { useAppState } from "@/lib/store";
import { Notice } from "@/lib/types";

const TYPE_LABEL: Record<Notice["type"], string> = {
  case_update: "Case Update",
  important_date_added: "New Important Date",
  important_date_changed: "Important Date Changed",
  important_date_cancelled: "Important Date Cancelled",
};

const TYPE_TONE: Record<Notice["type"], "teal" | "navy" | "amber" | "gray" | "red"> = {
  case_update: "teal",
  important_date_added: "navy",
  important_date_changed: "amber",
  important_date_cancelled: "red",
};

export default function NoticesPage() {
  const { notices, readNoticeIds, markNoticeRead } = useAppState();
  const [openId, setOpenId] = useState<string | null>(null);

  function handleOpen(id: string) {
    setOpenId(openId === id ? null : id);
    markNoticeRead(id);
  }

  return (
    <AppShell>
      <div className="container-page py-8 space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Notices" }]} />
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Notices</h1>
          <p className="text-navy-700 text-sm mt-1">Updates your legal team has shared from your case, sent from SolonIQ.</p>
        </div>

        {notices.length === 0 ? (
          <EmptyState
            title="No notices yet"
            description="Case updates and important date notifications from your legal team will appear here."
          />
        ) : (
          <div className="space-y-3">
            {notices.map((n) => {
              const unread = !(readNoticeIds ?? []).includes(n.id);
              const open = openId === n.id;
              return (
                <Card key={n.id} className={unread ? "border-teal-300" : undefined}>
                  <button className="w-full text-left" onClick={() => handleOpen(n.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge tone={TYPE_TONE[n.type]}>{TYPE_LABEL[n.type]}</Badge>
                          {unread && <Badge tone="red">New</Badge>}
                        </div>
                        <h2 className={`mt-2 ${unread ? "font-bold" : "font-semibold"} text-navy-900`}>{n.subject}</h2>
                        <p className="text-xs text-navy-700 mt-0.5">{n.caseName} · {new Date(n.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
                      </div>
                      <span className="text-navy-400 text-sm shrink-0">{open ? "−" : "+"}</span>
                    </div>
                  </button>
                  {open && (
                    <div className="mt-3 pt-3 border-t border-navy-900/10">
                      <p className="text-sm text-navy-700 whitespace-pre-line">{n.message}</p>
                      <p className="text-xs text-navy-700/70 mt-3">From {n.sendingLawyer} · {n.firmName}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
