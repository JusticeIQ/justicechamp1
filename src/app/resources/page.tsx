"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, Badge, Button } from "@/components/ui";
import { DEMO_RESOURCES, RESOURCE_CATEGORIES } from "@/lib/demo-data";
import { analyzeContractText, ContractAnalysis, SAMPLE_CONTRACT_TEXT } from "@/lib/contract-analyzer";

function riskBadge(risk: "standard" | "review" | "unclear") {
  if (risk === "standard") return <Badge tone="teal">Looks standard</Badge>;
  if (risk === "review") return <Badge tone="amber">Worth a closer look</Badge>;
  return <Badge tone="gray">Unclear from this excerpt</Badge>;
}

function ContractAnalyzer() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = () => setText(String(reader.result ?? ""));
      reader.readAsText(file);
    } else {
      // PDFs/Word docs aren't parsed client-side in this demo — ask the person to paste the text instead.
      setText((t) => t || "");
    }
  }

  function runAnalysis() {
    if (!text.trim()) return;
    setAnalyzing(true);
    // Simulated processing delay so the interaction reads like an analysis is running,
    // not an instant lookup. The analysis itself is a real, local, rule-based scan of
    // the text you provide — see src/lib/contract-analyzer.ts.
    setTimeout(() => {
      setAnalysis(analyzeContractText(text));
      setAnalyzing(false);
    }, 700);
  }

  return (
    <Card className="border-teal-200">
      <div className="flex items-center gap-2">
        <span className="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-semibold" aria-hidden>
          AI
        </span>
        <div>
          <p className="font-semibold text-navy-900 text-sm">Contract Analyzer</p>
          <p className="text-xs text-navy-700">Plain-language contract review, not legal advice</p>
        </div>
      </div>

      <p className="text-sm text-navy-700 mt-3">
        Upload or paste an employment contract (or any agreement) and get a plain-language summary that flags
        vacation/paid-time-off terms, compensation for dismissal, and reasons for dismissal — along with whether each
        looks standard or worth a closer look, and why.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-navy-900">Upload a file (.txt supported for on-screen preview; other types can be uploaded but you'll still need to paste the text below for analysis)</label>
          <input type="file" onChange={handleFile} className="mt-1 w-full text-sm" />
          {fileName && <p className="text-xs text-teal-700 mt-1">Selected: {fileName}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-navy-900">Or paste the contract text</label>
            <button type="button" className="text-xs text-teal-600 hover:underline" onClick={() => setText(SAMPLE_CONTRACT_TEXT)}>
              Use a sample contract
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Paste the contract text here…"
            className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
          />
        </div>
        <Button size="sm" onClick={runAnalysis} disabled={!text.trim() || analyzing}>
          {analyzing ? "Analyzing…" : "Analyze contract"}
        </Button>
      </div>

      {analysis && (
        <div className="mt-5 space-y-3 border-t border-navy-900/10 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy-900">Summary</p>
            {riskBadge(analysis.overallRisk)}
          </div>
          <p className="text-sm text-navy-700">{analysis.overallSummary}</p>

          {analysis.flags.map((f) => (
            <div key={f.topic} className="rounded-lg bg-navy-900/5 p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-medium text-navy-900">{f.topic}</p>
                {riskBadge(f.risk)}
              </div>
              <p className="text-sm text-navy-700 mt-1">{f.summary}</p>
              {f.quote && <p className="text-xs text-navy-700/70 mt-1 italic">"{f.quote}"</p>}
              <p className="text-xs text-navy-700/80 mt-1">{f.riskReason}</p>
            </div>
          ))}

          <p className="text-[11px] text-navy-700/70">
            This is an automated, plain-language reading of the text you provided — it can miss or misread unusual
            contract language and is not a substitute for review by a licensed lawyer.
          </p>
        </div>
      )}
    </Card>
  );
}

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

        <ContractAnalyzer />

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
