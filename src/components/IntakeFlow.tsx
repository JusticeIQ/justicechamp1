"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, Badge, ProgressBar } from "./ui";
import { AIAssistantBox } from "./AIAssistantBox";
import { useAppState } from "@/lib/store";
import { ClaimCategory, IntakeAnswer } from "@/lib/types";
import { stepsForCategory } from "@/lib/intake-config";

const SKIP_OPTIONS: { label: string; status: IntakeAnswer["status"] }[] = [
  { label: "I don't know", status: "unknown" },
  { label: "Not applicable", status: "not_applicable" },
  { label: "I will provide this later", status: "later" },
];

export function IntakeFlow({ category, subtypeOptions }: { category: ClaimCategory; subtypeOptions: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { claims, createClaim, getClaim, updateAnswer, setClaimStep, submitClaim } = useAppState();

  const claimIdParam = searchParams.get("claim");
  const [claimId, setClaimId] = useState<string | null>(claimIdParam);
  const steps = useMemo(() => stepsForCategory(category), [category]);

  useEffect(() => {
    if (claimId) return;
    const existingDraft = claims.find((c) => c.category === category && c.status === "draft");
    if (existingDraft) {
      setClaimId(existingDraft.id);
      return;
    }
    const id = createClaim(category, subtypeOptions[0]);
    setClaimId(id);
  }, [claimId, category, claims, createClaim, subtypeOptions]);

  const claim = claimId ? getClaim(claimId) : undefined;
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (claim) setStepIndex(Math.min(claim.currentStep, steps.length - 1));
  }, [claim?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!claim) {
    return <div className="py-16 text-center text-navy-700 text-sm">Preparing your intake workspace...</div>;
  }

  const step = steps[stepIndex];
  const isReview = step.id === "review";
  const totalFields = steps.reduce((sum, s) => sum + s.fields.length, 0);
  const answeredFields = Object.values(claim.answers).filter((a) => a.status === "answered" && a.value).length;
  const percentComplete = totalFields === 0 ? 100 : Math.round((answeredFields / totalFields) * 100);

  function goToStep(i: number) {
    setError(null);
    setStepIndex(i);
    setClaimStep(claim!.id, i);
  }

  function handleNext() {
    if (!isReview) {
      const missing = step.fields.filter((f) => !f.allowSkip).filter((f) => {
        const a = claim!.answers[f.id];
        return !a || !a.value;
      });
      if (missing.length > 0) {
        setError(`Please complete: ${missing.map((f) => f.label).join(", ")}`);
        return;
      }
    }
    if (stepIndex < steps.length - 1) {
      goToStep(stepIndex + 1);
    }
  }

  function handleBack() {
    if (stepIndex > 0) goToStep(stepIndex - 1);
  }

  function handleSubmitClaim() {
    submitClaim(claim!.id);
    setSubmitted(true);
  }

  function setAnswer(fieldId: string, value: IntakeAnswer["value"], status: IntakeAnswer["status"] = "answered") {
    updateAnswer(claim!.id, step.id, fieldId, value, status);
    setError(null);
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <Badge>Submitted</Badge>
        <h2 className="text-2xl font-bold text-navy-900 mt-4">Your incident report has been submitted</h2>
        <p className="text-navy-700 mt-2 text-sm">
          Next, generate your claim-readiness score to see a preliminary, informational assessment and recommended next steps.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link href="/rate-my-claim"><Button variant="cta">Rate My Claim</Button></Link>
          <Link href="/documents"><Button variant="outline">Upload evidence</Button></Link>
          <Link href="/dashboard"><Button variant="ghost">Return to dashboard</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <div className="flex items-center justify-between text-xs text-navy-700 mb-2">
            <span>Step {stepIndex + 1} of {steps.length}</span>
            <span>{percentComplete}% complete</span>
          </div>
          <ProgressBar value={((stepIndex + 1) / steps.length) * 100} />
        </Card>

        <Card>
          <h1 className="text-xl font-bold text-navy-900">{step.title}</h1>
          {step.helper && <p className="text-sm text-navy-700 mt-1">{step.helper}</p>}

          {isReview ? (
            <div className="mt-5 space-y-3">
              <p className="text-sm text-navy-700">Review your answers below. Click any step number to make changes before submitting.</p>
              <div className="divide-y divide-navy-900/5 border border-navy-900/10 rounded-lg">
                {steps.filter((s) => s.id !== "review").map((s, idx) => (
                  <button key={s.id} onClick={() => goToStep(idx)} className="w-full text-left px-4 py-3 hover:bg-navy-900/5 focus-ring flex justify-between items-center">
                    <span className="text-sm text-navy-900">{idx + 1}. {s.title}</span>
                    <span className="text-xs text-teal-600">Edit</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              {step.fields.map((field) => {
                const answer = claim.answers[field.id];
                const isSkipped = answer && answer.status !== "answered";
                return (
                  <div key={field.id}>
                    <label className="text-sm font-medium text-navy-900">{field.label}</label>
                    {field.helper && <p className="text-xs text-navy-700 mb-1">{field.helper}</p>}

                    {field.type === "text" && (
                      <input
                        type="text"
                        value={typeof answer?.value === "string" ? answer.value : ""}
                        onChange={(e) => setAnswer(field.id, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                      />
                    )}
                    {field.type === "date" && (
                      <input
                        type="date"
                        value={typeof answer?.value === "string" ? answer.value : ""}
                        onChange={(e) => setAnswer(field.id, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                      />
                    )}
                    {field.type === "textarea" && (
                      <textarea
                        rows={4}
                        value={typeof answer?.value === "string" ? answer.value : ""}
                        onChange={(e) => setAnswer(field.id, e.target.value)}
                        className="mt-1 w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus-ring"
                      />
                    )}
                    {field.type === "radio" && (
                      <div className="mt-2 grid sm:grid-cols-2 gap-2">
                        {field.options?.map((opt) => (
                          <label key={opt} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer focus-ring ${answer?.value === opt ? "border-teal-500 bg-teal-50" : "border-navy-900/15"}`}>
                            <input type="radio" name={field.id} checked={answer?.value === opt} onChange={() => setAnswer(field.id, opt)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                    {field.type === "checkboxes" && (
                      <div className="mt-2 grid sm:grid-cols-2 gap-2">
                        {field.options?.map((opt) => {
                          const current = Array.isArray(answer?.value) ? (answer!.value as string[]) : [];
                          const checked = current.includes(opt);
                          return (
                            <label key={opt} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer focus-ring ${checked ? "border-teal-500 bg-teal-50" : "border-navy-900/15"}`}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const next = checked ? current.filter((c) => c !== opt) : [...current, opt];
                                  setAnswer(field.id, next);
                                }}
                              />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {field.allowSkip && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {SKIP_OPTIONS.map((opt) => (
                          <button
                            key={opt.status}
                            type="button"
                            onClick={() => setAnswer(field.id, opt.label, opt.status)}
                            className={`text-xs px-2.5 py-1 rounded-full border focus-ring ${
                              isSkipped && answer?.status === opt.status ? "border-teal-500 bg-teal-50 text-teal-700" : "border-navy-900/15 text-navy-700 hover:bg-navy-900/5"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-4 border-t border-navy-900/10">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBack} disabled={stepIndex === 0}>Back</Button>
              <Link href="/dashboard"><Button variant="ghost" size="sm">Exit and return later</Button></Link>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>Save as draft</Button>
              {isReview ? (
                <Button size="sm" onClick={handleSubmitClaim}>Submit incident report</Button>
              ) : (
                <Button size="sm" onClick={handleNext}>Save and continue</Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <AIAssistantBox />
        <Card>
          <h2 className="text-sm font-semibold text-navy-900">Why we ask this</h2>
          <p className="text-xs text-navy-700 mt-2">
            Every answer helps build a clearer, more complete record. You can skip questions you're unsure about and come
            back later — nothing here is legal advice, and you're always in control of what you share.
          </p>
        </Card>
      </div>
    </div>
  );
}
