"use client";

import { useState } from "react";
import { Card } from "./ui";

const SUGGESTIONS = [
  "Help me understand this question",
  "What might I be missing?",
  "Help me organize a chronology",
  "What documents should I look for?",
  "Prepare questions for a lawyer",
];

const RESPONSES: Record<string, string> = {
  "Help me understand this question": "This question is asking for factual details only — dates, names, and what was said or done. You don't need to draw legal conclusions; just describe what happened as clearly as you can.",
  "What might I be missing?": "Common gaps include exact dates, names of people involved, and any documents that could confirm your account (emails, photos, receipts, records). Check the Documents page for suggestions specific to your claim.",
  "Help me organize a chronology": "Try listing events in the order they happened, one line each: date, what occurred, and who was involved. The Timeline page lets you build this out and attach evidence to each entry.",
  "What documents should I look for?": "Look for anything dated close to the incident: contracts, medical records, correspondence, pay stubs, or photos. Even partial documents can be useful — a lawyer can help identify what's missing.",
  "Prepare questions for a lawyer": "Consider asking: What are the strengths and weaknesses of my situation? What are my deadlines? What would you need from me to get started? What are your fees?",
};

export function AIAssistantBox() {
  const [messages, setMessages] = useState<{ from: "assistant" | "user"; text: string }[]>([
    { from: "assistant", text: "Would you like help documenting what happened? I can help you organize information, but I can't provide legal advice." },
  ]);
  const [open, setOpen] = useState(true);

  function ask(suggestion: string) {
    setMessages((m) => [...m, { from: "user", text: suggestion }, { from: "assistant", text: RESPONSES[suggestion] ?? "I can help you organize facts and documents, but for legal analysis you'll want to consult a licensed lawyer." }]);
  }

  return (
    <Card className="border-teal-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-semibold" aria-hidden>
            AI
          </span>
          <div>
            <p className="font-semibold text-navy-900 text-sm">JusticeChamp Assistant</p>
            <p className="text-xs text-navy-700">Documentation help, not legal advice</p>
          </div>
        </div>
        <button className="text-xs text-navy-700 hover:text-teal-600 focus-ring rounded" onClick={() => setOpen((o) => !o)}>
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open && (
        <div className="mt-4 space-y-3">
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "assistant" ? "text-sm bg-teal-50 text-navy-900 rounded-lg p-3" : "text-sm bg-navy-900/5 text-navy-900 rounded-lg p-3 ml-6"}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)} className="text-xs px-3 py-1.5 rounded-full border border-teal-300 text-teal-700 hover:bg-teal-50 focus-ring">
                {s}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-navy-700/70">
            This assistant will never tell you that you'll win, provide definitive legal advice, or suggest altering evidence. In an emergency, contact your local emergency number.
          </p>
        </div>
      )}
    </Card>
  );
}
