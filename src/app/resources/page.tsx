"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button } from "@/components/ui";
import { DEMO_RESOURCES, RESOURCE_CATEGORIES } from "@/lib/demo-data";

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = activeCategory === "All" ? DEMO_RESOURCES : DEMO_RESOURCES.filter((r) => r.category === activeCategory);

  return (
    <AppShell>
      <div className="container-page py-8 space-y-6">
        <Breadcrumbs items={[{ label: "Home", href: "/dashboard" }, { label: "Resources" }]} />
        <h1 className="text-2xl font-bold text-navy-900">Resource Library</h1>
        <p className="text-navy-700 text-sm max-w-2xl">
          Plain-language guides to help you document your situation, preserve evidence, and prepare for a lawyer
          consultation. These resources are general information, not legal advice.
        </p>

        <div className="flex flex-wrap gap-2">
          {["All", ...RESOURCE_CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-xs px-3 py-1.5 rounded-full border focus-ring ${activeCategory === cat ? "border-teal-500 bg-teal-50 text-teal-700" : "border-navy-900/15 text-navy-700"}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((r) => (
            <Card key={r.id}>
              <Badge tone="gray">{r.category}</Badge>
              <h2 className="font-semibold text-navy-900 mt-2">{r.title}</h2>
              <p className="text-sm text-navy-700 mt-1">{r.description}</p>
              <p className="text-xs text-navy-700/70 mt-2">{r.readingTime}</p>

              {openId === r.id && (
                <div className="mt-3 text-sm text-navy-700 bg-navy-900/5 rounded-lg p-3">
                  {r.body}
                  {r.related.length > 0 && (
                    <p className="text-xs mt-2 text-navy-700/70">
                      Related: {r.related.map((id) => DEMO_RESOURCES.find((x) => x.id === id)?.title).filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              )}

              <Button size="sm" variant="outline" className="mt-3" onClick={() => setOpenId(openId === r.id ? null : r.id)}>
                {openId === r.id ? "Close" : "Open"}
              </Button>
            </Card>
          ))}
        </div>

        <Card className="bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-900">
            These resources provide general information only and do not constitute legal advice. Laws vary by jurisdiction
            and situation — consult a licensed lawyer for guidance specific to your circumstances.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
