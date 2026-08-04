"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge } from "@/components/ui";
import { DEMO_FAQ } from "@/lib/demo-data";

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const results = useMemo(() => {
    if (!query.trim()) return DEMO_FAQ;
    const q = query.toLowerCase();
    return DEMO_FAQ.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [query]);

  return (
    <AppShell>
      <div className="container-page py-8 space-y-6 max-w-3xl">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "FAQ" }]} />
        <h1 className="text-2xl font-bold text-navy-900">Frequently Asked Questions</h1>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions..."
          className="w-full rounded-lg border border-navy-900/15 px-4 py-3 text-sm focus-ring"
        />

        <div className="space-y-3">
          {results.map((f) => (
            <Card key={f.id} className="p-0 overflow-hidden">
              <button onClick={() => setOpenId(openId === f.id ? null : f.id)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 focus-ring">
                <div className="flex items-center gap-2">
                  <Badge tone="gray">{f.category}</Badge>
                  <span className="font-medium text-navy-900 text-sm">{f.question}</span>
                </div>
                <span className="text-navy-700 text-sm">{openId === f.id ? "−" : "+"}</span>
              </button>
              {openId === f.id && <div className="px-5 pb-4 text-sm text-navy-700">{f.answer}</div>}
            </Card>
          ))}
          {results.length === 0 && <p className="text-sm text-navy-700">No questions match your search.</p>}
        </div>
      </div>
    </AppShell>
  );
}
